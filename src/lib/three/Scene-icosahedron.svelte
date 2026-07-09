<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { sceneState, decade, isPortrait, spiralDone } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { assignDecades } from '$lib/data/roomElements';
	import GoldenRectangle from './objects/GoldenRectangle.svelte';

	let canvasElement;
	let scene, camera, renderer, controls;
	let animationFrameId;
	let clock;
	let sceneReady = false;
	let rectangleComponents = [];
	let icoSolidMat, icoWireMat;
	let portrait = false;

	// Fade-in: starts when spiralDone fires, runs over FADE_IN_DURATION
	let canvasVisible = false;
	let fadeStartTime = null;
	const FADE_IN_DURATION = 5.0; // same as spiral CONDENSE_DURATION — overlap fully

	const PHI = (1 + Math.sqrt(5)) / 2;
	let frustum = 10;

	let currentProjection = 0;
	let targetProjection = 0;
	let animTime = 0;
	let localAnimPhase = 0;

	// Quaternion spin state
	let rotationStart = new THREE.Quaternion();
	let rotationTarget = new THREE.Quaternion();
	let rotationProgress = 0;

	// Auto-animation: driven entirely by spiralDone, no phase changes needed externally
	// Sequence: idle (0) → project out rectangles (1) → quaternion spin (2)
	//           → zoom into the target room (3) → done (4)
	let autoPhase = 0;
	let autoTimer  = 0;
	let started = false;
	const PROJECT_DURATION = 5.0; // seconds for rectangles to project out

	// Zoom-into-room state
	const ZOOM_DURATION = 2.4;
	let zoomProgress = 0;
	let zoomFocus = null;
	let zoomStartPos = new THREE.Vector3();
	let zoomTargetPos = new THREE.Vector3();
	let zoomStartUp = new THREE.Vector3();
	let zoomTargetUp = new THREE.Vector3();
	let zoomStartLook = new THREE.Vector3();
	let zoomTargetLook = new THREE.Vector3();
	let zoomStartFrustum = 10;
	let zoomTargetFrustum = 10;
	let targetRoomIndex = -1;

	export let worldGroup;

	const vertices = [
		[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
		[0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
		[PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
	];

	const faces = [
		[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
		[1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
		[3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
		[4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
	];

	const edges = [
		[0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
		[1, 5], [1, 7], [1, 8], [1, 9],
		[2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
		[3, 4], [3, 6], [3, 8], [3, 9],
		[4, 5], [4, 9], [4, 11],
		[5, 9], [5, 11],
		[6, 7], [6, 8], [6, 10],
		[7, 8], [7, 10],
		[8, 9],
		[10, 11]
	];

	// The four decades assigned randomly across the six faces (filled in onMount).
	let decadeAssignments = ['50s', '60s', '90s', '10s', '50s', '60s'];

	const rectangleConfigs = [
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction:  1 },
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: -1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction:  1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: -1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction:  1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: -1 },
	];

	function getDecadeRotation(decadeKey) {
		const rotations = {
			'50s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0),
			'60s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
			'90s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
			'10s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2),
		};
		return rotations[decadeKey] || rotations['90s'];
	}

	function buildIcosahedronMeshes(group) {
		const positions = [];
		faces.forEach(([a, b, c]) => { positions.push(...vertices[a], ...vertices[b], ...vertices[c]); });
		const solidGeo = new THREE.BufferGeometry();
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		solidGeo.computeVertexNormals();
		icoSolidMat = new THREE.MeshBasicMaterial({
			color: 0x1b1b1b, transparent: true, opacity: 0.5,
			side: THREE.DoubleSide, depthWrite: false
		});
		group.add(new THREE.Mesh(solidGeo, icoSolidMat));

		const edgePositions = [];
		edges.forEach(([a, b]) => { edgePositions.push(...vertices[a], ...vertices[b]); });
		const wireGeo = new THREE.BufferGeometry();
		wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
		icoWireMat = new THREE.LineBasicMaterial({
			color: 0xc2a133, transparent: true, opacity: 1.0
		});
		group.add(new THREE.LineSegments(wireGeo, icoWireMat));
	}

	let unsubSpiralDone;
	let unsubSceneState;

	function applyFrustum(fr) {
		const aspect = window.innerWidth / window.innerHeight;
		camera.left   = -fr * aspect / 2;
		camera.right  =  fr * aspect / 2;
		camera.top    =  fr / 2;
		camera.bottom = -fr / 2;
		camera.updateProjectionMatrix();
	}

	function handleResize() {
		if (!camera || !renderer) return;
		const p = window.innerHeight > window.innerWidth;
		isPortrait.set(p);
		if (p !== portrait) {
			portrait = p;
			rectangleComponents.forEach(comp => { if (comp) comp.setPortrait(p); });
		}
		applyFrustum(frustum);
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function startSequence() {
		if (started) return;
		started = true;
		autoPhase = 1;
		autoTimer = 0;
	}

	// Pick the room whose (rotated) normal points most toward the camera.
	function pickTargetRoom() {
		let best = -1, bestDot = -Infinity, bestFocus = null;
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (!room) return;
			const f = room.focusTarget();
			const toCam = camera.position.clone().sub(f.center).normalize();
			const d = f.normal.dot(toCam);
			if (d > bestDot) { bestDot = d; best = i; bestFocus = f; }
		});
		return { index: best, focus: bestFocus };
	}

	function startZoom() {
		const picked = pickTargetRoom();
		targetRoomIndex = picked.index;
		zoomFocus = picked.focus;
		if (!zoomFocus) { autoPhase = 4; sceneState.set(4); return; }

		const aspect = window.innerWidth / window.innerHeight;
		zoomProgress = 0;
		zoomStartFrustum = frustum;
		// Fit the room: vertical extent >= height, horizontal >= width.
		zoomTargetFrustum = Math.max(zoomFocus.height, zoomFocus.width / aspect) * 1.12;

		zoomStartPos.copy(camera.position);
		// Sit on the room's outward normal, looking straight in.
		zoomTargetPos.copy(zoomFocus.center).addScaledVector(zoomFocus.normal, 12);
		zoomStartUp.copy(camera.up);
		zoomTargetUp.copy(zoomFocus.up);
		zoomStartLook.set(0, 0, 0);
		// Look a little way into the room so the parallax reads.
		zoomTargetLook.copy(zoomFocus.center).addScaledVector(zoomFocus.normal, -zoomFocus.depth * 0.35);

		controls.enabled = false;
		autoPhase = 3;
	}

	function resetScene() {
		started = false;
		autoPhase = 0;
		autoTimer = 0;
		currentProjection = 0;
		rotationProgress = 0;
		zoomProgress = 0;
		zoomFocus = null;
		targetRoomIndex = -1;
		frustum = 10;
		if (worldGroup) worldGroup.quaternion.identity();
		if (camera) {
			camera.position.set(5, 4, 5);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			applyFrustum(frustum);
		}
		if (controls) { controls.enabled = true; controls.target.set(0, 0, 0); }
		if (icoWireMat) icoWireMat.opacity = 1.0;
		if (icoSolidMat) icoSolidMat.opacity = 0.5;
		rectangleComponents.forEach(comp => {
			if (!comp) return;
			comp.setDim(1);
			comp.setLineDim(1);
			comp.updateProjection(0);
		});
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock) return;

		const dt = clock.getDelta();
		animTime += dt;

		// ── Canvas fade-in ──────────────────────────────────────────────────
		if (canvasVisible) {
			if (fadeStartTime === null) fadeStartTime = (performance.now() / 1000) + 1.0;
			const elapsed = performance.now() / 1000 - fadeStartTime;
			const opacity = Math.min(elapsed / FADE_IN_DURATION, 1);
			canvasElement.style.opacity = opacity.toFixed(4);
		}

		// ── Idle slow spin (always while autoPhase === 0) ───────────────────
		if (autoPhase === 0 && worldGroup) {
			worldGroup.rotation.y += dt * 0.15;
			worldGroup.rotation.x += dt * 0.07;
		}

		// ── Auto-sequence triggered by spiralDone ───────────────────────────
		// Phase 1: project rectangles out from 0 → 1 over PROJECT_DURATION
		if (autoPhase === 1) {
			autoTimer += dt;
			const t = Math.min(autoTimer / PROJECT_DURATION, 2.5);
			currentProjection = easeInOutCubic(t);
			rectangleComponents.forEach(comp => {
				if (comp) comp.updateProjection(currentProjection);
			});
			if (t >= 1) {
				// Move to quaternion spin phase
				autoPhase = 2;
				autoTimer = 0;
				rotationStart.copy(worldGroup.quaternion);
				const targetDecade = $decade || '90s';
				rotationTarget.copy(getDecadeRotation(targetDecade));
				rotationProgress = 0;
			}
		}

		// Phase 2: quaternion slerp to decade-aligned rotation
		if (autoPhase === 2 && worldGroup) {
			rotationProgress = clamp(rotationProgress + dt * 0.5, 0, 1);
			const t = easeInOutCubic(rotationProgress);
			worldGroup.quaternion.slerpQuaternions(rotationStart, rotationTarget, t);
			if (rotationProgress >= 1) {
				startZoom(); // → phase 3
			}
		}

		// Phase 3: dolly the camera into the target room, spotlighting it.
		if (autoPhase === 3 && zoomFocus) {
			zoomProgress = clamp(zoomProgress + dt / ZOOM_DURATION, 0, 1);
			const t = easeInOutCubic(zoomProgress);

			camera.position.lerpVectors(zoomStartPos, zoomTargetPos, t);
			camera.up.copy(zoomStartUp).lerp(zoomTargetUp, t).normalize();
			const look = zoomStartLook.clone().lerp(zoomTargetLook, t);
			frustum = lerp(zoomStartFrustum, zoomTargetFrustum, t);
			applyFrustum(frustum);
			camera.lookAt(look);

			const fade = 1 - t;
			if (icoWireMat) icoWireMat.opacity = fade;
			if (icoSolidMat) icoSolidMat.opacity = 0.5 * fade;
			rectangleComponents.forEach((comp, i) => {
				if (!comp) return;
				if (i === targetRoomIndex) comp.setLineDim(lerp(1, 0.4, t)); // keep a faint golden frame
				else comp.setDim(fade);
			});

			if (zoomProgress >= 1) {
				autoPhase = 4;
				sceneState.set(4); // icosahedron settled → output screen shows
			}
		}

		if (autoPhase < 3) controls.update();
		renderer.render(scene, camera);
	}

	onMount(async () => {
		scene = new THREE.Scene();
		clock = new THREE.Clock();

		const aspect = window.innerWidth / window.innerHeight;
		portrait = window.innerHeight > window.innerWidth;
		isPortrait.set(portrait);

		camera = new THREE.OrthographicCamera(
			-frustum * aspect / 2, frustum * aspect / 2,
			frustum / 2, -frustum / 2, 0.1, 100
		);
		camera.position.set(5, 4, 5);
		camera.lookAt(0, 0, 0);

		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x1b1b1b, 0);
		renderer.outputEncoding = THREE.sRGBEncoding;

		// Assign the four decades randomly across the six faces (every decade present).
		decadeAssignments = assignDecades(rectangleConfigs.length);

		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.enableZoom = true;
		controls.enablePan = false;

		worldGroup = new THREE.Group();
		scene.add(worldGroup);
		buildIcosahedronMeshes(worldGroup);

		// Rectangles start fully collapsed (projection = 0)
		currentProjection = 0;
		targetProjection  = 0;

		// Start invisible; begin fade-in and animation when spiralDone fires
		canvasElement.style.opacity = '0';
		unsubSpiralDone = spiralDone.subscribe(done => {
			if (done && !canvasVisible) {
				canvasVisible = true;
				// Wait a beat (half a second) then start projecting rectangles
				setTimeout(startSequence, 500);
			}
		});

		// Reset on restart; re-run the sequence on subsequent calculations.
		unsubSceneState = sceneState.subscribe(s => {
			if (s === 0) resetScene();
			else if (s >= 1 && canvasVisible && !started) setTimeout(startSequence, 300);
		});

		sceneReady = true;
		await tick();

		// Init all rectangle components with projection=0
		rectangleComponents.forEach(comp => { if (comp) comp.init(); });
		rectangleComponents.forEach(comp => { if (comp) comp.updateProjection(0); });

		animate();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (unsubSpiralDone) unsubSpiralDone();
		if (unsubSceneState) unsubSceneState();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		rectangleComponents.forEach(comp => { if (comp) comp.dispose(); });
		if (renderer) renderer.dispose();
		if (controls) controls.dispose();
	});
</script>

{#if sceneReady}
	{#each rectangleConfigs as config, i}
		<GoldenRectangle
			bind:this={rectangleComponents[i]}
			group={worldGroup}
			axis={config.axis}
			direction={config.direction}
			{vertices}
			indices={config.indices}
			decadeKey={decadeAssignments[i]}
			{portrait}
		/>
	{/each}
{/if}

<canvas bind:this={canvasElement} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 1;
	}
</style>