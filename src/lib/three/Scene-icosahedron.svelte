<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { sceneState, decade, isPortrait } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { assignDecades } from '$lib/data/roomElements';
	import { accentHex } from '$lib/theme';
	import { get } from 'svelte/store';
	import GoldenRectangle from './objects/GoldenRectangle.svelte';

	// Live accent recolour of the wireframe.
	$: if (icoWireMat) icoWireMat.color.setHex($accentHex);

	let canvasElement;
	let scene, camera, renderer, controls;
	let animationFrameId;
	let clock;
	let sceneReady = false;
	let rectangleComponents = [];
	let icoSolidMat, icoWireMat;
	let portrait = false;

	// Canvas + wireframe fade in from mount — the icosahedron is the whole intro.
	let canvasFadeStart = null;
	const CANVAS_FADE = 1.6;
	let icoReveal = 0;
	let icoRevealing = false;

	const PHI = (1 + Math.sqrt(5)) / 2;
	const IDLE_FRUSTUM = 13;
	let frustum = 13;

	let currentProjection = 0;
	let targetProjection = 0;
	let animTime = 0;
	let localAnimPhase = 0;

	// Sequence: project panes out on load (1) → mouse-interactive idle (2)
	//           → twist + zoom onto the decade room (3) → settled (4).
	let autoPhase = 0;
	let autoTimer  = 0;
	let started = false;
	const PROJECT_DURATION = 4.0; // seconds for panes to spin out

	// Mouse-look during the intro/input flow.
	let mouseNX = 0, mouseNY = 0;   // normalised pointer (-1..1)
	let rotX = 0, rotY = 0;         // current eased rotation offsets
	const MOUSE_AMP_Y = 0.6, MOUSE_AMP_X = 0.4;

	// Camera fly-to-room state (one smooth orbital zoom onto the decade's room)
	const FLY_DURATION = 3.4;
	const IDENTITY_Q = new THREE.Quaternion();
	let flyProgress = 0;
	let flyFocus = null;
	let flyStartPos = new THREE.Vector3();
	let flyStartUp = new THREE.Vector3();
	let flyEndUp = new THREE.Vector3();
	let flyEndLook = new THREE.Vector3();
	let flyStartDir = new THREE.Vector3();
	let flyEndDir = new THREE.Vector3();
	let flyRot = new THREE.Quaternion();
	let flyStartRadius = 8;
	let flyEndRadius = 12;
	let flyStartFrustum = 10;
	let flyEndFrustum = 10;
	let targetRoomIndex = -1;

	// Camera path: starts face-on (flat, aligned with the golden spiral), then
	// orbits to a 3D angle as the panes project, then flies to the decade room.
	const FACE_ON = new THREE.Vector3(0, 0, 12);
	const ISO_POS = new THREE.Vector3(5, 4, 8);

	const smoothstep = (a, b, x) => {
		const t = clamp((x - a) / (b - a), 0, 1);
		return t * t * (3 - 2 * t);
	};

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

	function buildIcosahedronMeshes(group) {
		const positions = [];
		faces.forEach(([a, b, c]) => { positions.push(...vertices[a], ...vertices[b], ...vertices[c]); });
		const solidGeo = new THREE.BufferGeometry();
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		solidGeo.computeVertexNormals();
		icoSolidMat = new THREE.MeshBasicMaterial({
			color: 0x1b1b1b, transparent: true, opacity: 0,
			side: THREE.DoubleSide, depthWrite: false
		});
		group.add(new THREE.Mesh(solidGeo, icoSolidMat));

		const edgePositions = [];
		edges.forEach(([a, b]) => { edgePositions.push(...vertices[a], ...vertices[b]); });
		const wireGeo = new THREE.BufferGeometry();
		wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
		icoWireMat = new THREE.LineBasicMaterial({
			color: get(accentHex), transparent: true, opacity: 0
		});
		group.add(new THREE.LineSegments(wireGeo, icoWireMat));
	}

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
			// Keep the face-on hero rectangle landscape/portrait to match the screen.
			if (worldGroup && autoPhase === 0) worldGroup.rotation.z = p ? 0 : Math.PI / 2;
		}
		applyFrustum(frustum);
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function handlePointer(e) {
		mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
		mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
	}

	// Kick off the intro: reveal the wireframe and spin the panes out.
	function startProject() {
		if (started) return;
		started = true;
		icoRevealing = true;
		autoPhase = 1;
		autoTimer = 0;
	}

	// Choose the room to land on: prefer a face assigned the resolved decade,
	// and among those the one nearest the current camera (shortest, cleanest arc).
	function pickDecadeRoom() {
		const want = $decade;
		const candidates = [];
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (room) candidates.push({ i, room, decade: decadeAssignments[i] });
		});
		if (!candidates.length) return { index: -1, focus: null };
		const preferred = candidates.filter(c => c.decade === want);
		const pool = preferred.length ? preferred : candidates;

		let best = pool[0], bestDot = -Infinity, bestFocus = null;
		pool.forEach((c) => {
			const f = c.room.focusTarget();
			const toCam = camera.position.clone().sub(f.center).normalize();
			const d = f.normal.dot(toCam);
			if (d > bestDot) { bestDot = d; best = c; bestFocus = f; }
		});
		return { index: best.i, focus: bestFocus };
	}

	function startFly() {
		// If the panes are still spinning out, snap them fully out first.
		if (currentProjection < 1) {
			currentProjection = 1;
			rectangleComponents.forEach(comp => { if (comp) comp.updateProjection(1); });
		}
		icoReveal = 1; icoRevealing = true;
		const picked = pickDecadeRoom();
		targetRoomIndex = picked.index;
		flyFocus = picked.focus;
		if (!flyFocus) { autoPhase = 4; sceneState.set(4); return; }

		const aspect = window.innerWidth / window.innerHeight;
		flyProgress = 0;
		flyStartPos.copy(camera.position);
		flyStartUp.copy(camera.up);
		flyStartRadius = camera.position.length() || 8;
		flyStartDir.copy(camera.position).normalize();
		flyEndDir.copy(flyFocus.normal).normalize();       // camera lands on the +normal side
		flyEndRadius = 12;
		flyStartFrustum = frustum;
		// End "covered": the room's 2D background fills the whole screen (crop, no letterbox).
		flyEndFrustum = Math.min(flyFocus.height, flyFocus.width / aspect) * 0.98;
		flyEndUp.copy(flyFocus.up);
		flyEndLook.copy(flyFocus.center).addScaledVector(flyFocus.normal, -flyFocus.depth * 0.35);
		flyRot.setFromUnitVectors(flyStartDir, flyEndDir); // orbital sweep of the view direction

		controls.enabled = false;
		autoPhase = 3;
		autoTimer = 0;
	}

	function resetScene() {
		started = false;
		autoPhase = 0;
		autoTimer = 0;
		currentProjection = 0;
		flyProgress = 0;
		flyFocus = null;
		targetRoomIndex = -1;
		frustum = IDLE_FRUSTUM;
		icoReveal = 0;
		icoRevealing = false;
		rotX = rotY = mouseNX = mouseNY = 0;
		if (worldGroup) {
			worldGroup.quaternion.identity();
			worldGroup.rotation.z = portrait ? 0 : Math.PI / 2;
		}
		if (camera) {
			camera.position.copy(FACE_ON);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			applyFrustum(frustum);
		}
		if (controls) { controls.enabled = false; controls.target.set(0, 0, 0); }
		if (icoWireMat) icoWireMat.opacity = 0;
		if (icoSolidMat) icoSolidMat.opacity = 0;
		rectangleComponents.forEach(comp => {
			if (!comp) return;
			comp.setDim(1);
			comp.setLineDim(1);
			comp.updateProjection(0);
		});
		// (Re)start the intro: spin the panes out once components are ready.
		setTimeout(startProject, 500);
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock) return;

		const dt = clock.getDelta();
		animTime += dt;

		// ── Canvas fade-in (from mount) ─────────────────────────────────────
		const sinceMount = canvasFadeStart != null ? (performance.now() / 1000 - canvasFadeStart) : 0;
		const canvasRamp = clamp(sinceMount / CANVAS_FADE, 0, 1);
		canvasElement.style.opacity = canvasRamp.toFixed(4);

		// ── Icosahedron wireframe reveal (from load) ────────────────────────
		if (icoRevealing) icoReveal = clamp(icoReveal + dt / 2.0, 0, 1);
		if (icoWireMat) icoWireMat.opacity = icoReveal;
		if (icoSolidMat) icoSolidMat.opacity = 0.5 * icoReveal;

		// ── Phase 1: spin the panes out + orbit the camera off face-on ──────
		if (autoPhase === 1) {
			autoTimer += dt;
			const t = Math.min(autoTimer / PROJECT_DURATION, 1);
			currentProjection = easeInOutCubic(t);
			rectangleComponents.forEach(comp => { if (comp) comp.updateProjection(currentProjection); });
			const camT = easeInOutCubic(t);
			camera.position.lerpVectors(FACE_ON, ISO_POS, camT);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			if (t >= 1) { autoPhase = 2; } // → mouse-interactive idle
		}

		// ── Phase 2: mouse-interactive idle (during the intro/input flow) ───
		if (autoPhase === 2 && worldGroup) {
			rotY += (mouseNX * MOUSE_AMP_Y - rotY) * Math.min(1, dt * 3);
			rotX += (-mouseNY * MOUSE_AMP_X - rotX) * Math.min(1, dt * 3);
			worldGroup.rotation.x = rotX;
			worldGroup.rotation.y = rotY;
		}

		// ── Phase 3: the twist — orbit + zoom (out then in) onto the decade room ──
		if (autoPhase === 3 && flyFocus) {
			flyProgress = clamp(flyProgress + dt / FLY_DURATION, 0, 1);
			const t = easeInOutCubic(flyProgress);

			const q = new THREE.Quaternion().slerpQuaternions(IDENTITY_Q, flyRot, t);
			const dir = flyStartDir.clone().applyQuaternion(q);
			const radius = lerp(flyStartRadius, flyEndRadius, t);
			camera.position.copy(dir.multiplyScalar(radius));
			camera.up.copy(flyStartUp).lerp(flyEndUp, t).normalize();
			// zoom OUT through the middle of the move, then IN to fill — the "twist".
			frustum = lerp(flyStartFrustum, flyEndFrustum, t) + Math.sin(t * Math.PI) * 5;
			applyFrustum(frustum);
			camera.lookAt(new THREE.Vector3().lerp(flyEndLook, t));

			const fade = 1 - smoothstep(0.3, 0.96, t);
			if (icoWireMat) icoWireMat.opacity = fade;
			if (icoSolidMat) icoSolidMat.opacity = 0.5 * fade;
			rectangleComponents.forEach((comp, i) => {
				if (!comp) return;
				if (i === targetRoomIndex) comp.setLineDim(lerp(1, 0.0, smoothstep(0.6, 1, t)));
				else comp.setDim(fade);
			});

			if (flyProgress >= 1) {
				autoPhase = 4;
				sceneState.set(4); // settled → output screen shows, bg filling the screen
			}
		}

		if (controls && controls.enabled) controls.update();
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
		// Start face-on (flat), so the front golden rectangle lines up with the
		// initial golden spiral; the sequence orbits away from here.
		camera.position.copy(FACE_ON);
		camera.up.set(0, 1, 0);
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
		controls.enabled = false; // the intro drives the camera; enabled after settle if desired

		worldGroup = new THREE.Group();
		scene.add(worldGroup);
		// Orient so the +Z golden rectangle reads landscape (long edge horizontal)
		// on wide screens / portrait on tall screens — matching the spiral.
		worldGroup.rotation.z = portrait ? 0 : Math.PI / 2;
		buildIcosahedronMeshes(worldGroup);

		// Rectangles start fully collapsed (projection = 0)
		currentProjection = 0;
		targetProjection  = 0;

		// Canvas + icosahedron come up from mount — no spiral intro anymore.
		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;

		// Mouse-look during the intro/input flow.
		window.addEventListener('pointermove', handlePointer);

		// On calculate (sceneState → 1) do the twist onto the decade room; reset on restart.
		unsubSceneState = sceneState.subscribe(s => {
			if (s === 0) resetScene();
			else if (s === 1 && autoPhase < 3) startFly();
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
		if (unsubSceneState) unsubSceneState();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('pointermove', handlePointer);
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
			{renderer}
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