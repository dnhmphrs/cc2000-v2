<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { phase, sceneState, decade, isPortrait, spinQuat, latticeActive } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { assignDecades } from '$lib/data/roomElements';
	import { accentHex } from '$lib/theme';
	import { get } from 'svelte/store';
	import GoldenRectangle from './objects/GoldenRectangle.svelte';

	// Live accent recolour of the wireframe + sperm.
	$: if (icoWireMat) icoWireMat.color.setHex($accentHex);
	$: if (spermMat) spermMat.uniforms.uColor.value = accentColorVec($accentHex);

	let canvasElement;
	let scene, camera, renderer;
	let animationFrameId;
	let clock;
	let sceneReady = false;
	let rectangleComponents = [];
	let icoSolidMat, icoWireMat;
	let portrait = false;

	// Canvas fade in from mount.
	let canvasFadeStart = null;
	const CANVAS_FADE = 1.2;
	let icoReveal = 0;

	const PHI = (1 + Math.sqrt(5)) / 2;
	const IDLE_FRUSTUM = 13;
	const LAND_FRUSTUM = 8; // gentle centred zoom that frames the landed room
	let frustum = IDLE_FRUSTUM;

	// ── Camera: fixed, face-on, orthographic, centred the whole time. The 3D
	//    read comes from the icosahedron's own orientation, never a camera move.
	const CAM_POS = new THREE.Vector3(0, 0, 14);
	// A gentle static tilt so the opened structure reads as a solid in space.
	const BASE_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.32, 0.55, 0));

	// ── Stage machine ───────────────────────────────────────────────────────
	//   'idle'   — mounted, waiting for the preloader to hand over
	//   'reveal' — wireframe fades in (collapsed icosahedron)
	//   'swim'   — sperm dolly-swims onto screen and through the icosahedron
	//   'open'   — panes/rooms project outward ("the icosahedron opens")
	//   'input'  — mouse-interactive idle during the user-input panel
	//   'search' — controlled quaternion tumble (hyperspace search)
	//   'land'   — slerp to the resolved decade, room facing camera
	//   'settled'— result on screen
	let stage = 'idle';
	let stageT = 0;
	const REVEAL_DUR = 1.3;
	const SWIM_DUR = 4.6;
	const OPEN_DUR = 3.6;
	const SEARCH_DUR = 5.6;
	const LAND_DUR = 2.0;

	// Mouse-look during the input flow.
	let mouseNX = 0,
		mouseNY = 0;
	let rotX = 0,
		rotY = 0;
	const MOUSE_AMP_Y = 0.55,
		MOUSE_AMP_X = 0.38;

	// Search tumble bookkeeping.
	let spinQuatCurrent = new THREE.Quaternion();
	let landStartQuat = new THREE.Quaternion();
	let landTargetQuat = new THREE.Quaternion();
	let targetRoomIndex = -1;
	let idleAngle = 0;

	// Sperm overlay (perspective) — swims through, then removed.
	let spermScene, spermCam, spermPivot, spermModel, spermMixer, spermMat;
	let spermActive = false;
	let spermReady = false;
	let spermStartCorner = new THREE.Vector2(-1, 0.6);

	export let worldGroup;

	const vertices = [
		[-1, PHI, 0],
		[1, PHI, 0],
		[-1, -PHI, 0],
		[1, -PHI, 0],
		[0, -1, PHI],
		[0, 1, PHI],
		[0, -1, -PHI],
		[0, 1, -PHI],
		[PHI, 0, -1],
		[PHI, 0, 1],
		[-PHI, 0, -1],
		[-PHI, 0, 1]
	];

	const faces = [
		[0, 11, 5],
		[0, 5, 1],
		[0, 1, 7],
		[0, 7, 10],
		[0, 10, 11],
		[1, 5, 9],
		[5, 11, 4],
		[11, 10, 2],
		[10, 7, 6],
		[7, 1, 8],
		[3, 9, 4],
		[3, 4, 2],
		[3, 2, 6],
		[3, 6, 8],
		[3, 8, 9],
		[4, 9, 5],
		[2, 4, 11],
		[6, 2, 10],
		[8, 6, 7],
		[9, 8, 1]
	];

	const edges = [
		[0, 1],
		[0, 5],
		[0, 7],
		[0, 10],
		[0, 11],
		[1, 5],
		[1, 7],
		[1, 8],
		[1, 9],
		[2, 3],
		[2, 4],
		[2, 6],
		[2, 10],
		[2, 11],
		[3, 4],
		[3, 6],
		[3, 8],
		[3, 9],
		[4, 5],
		[4, 9],
		[4, 11],
		[5, 9],
		[5, 11],
		[6, 7],
		[6, 8],
		[6, 10],
		[7, 8],
		[7, 10],
		[8, 9],
		[10, 11]
	];

	let decadeAssignments = ['50s', '60s', '90s', '10s', '50s', '60s'];

	const rectangleConfigs = [
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: 1 },
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: -1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: 1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: -1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: 1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: -1 }
	];

	const smoothstep = (a, b, x) => {
		const t = clamp((x - a) / (b - a), 0, 1);
		return t * t * (3 - 2 * t);
	};

	function accentColorVec(hex) {
		// Brighten toward white so the hologram glows on-brand.
		const r = ((hex >> 16) & 255) / 255;
		const g = ((hex >> 8) & 255) / 255;
		const b = (hex & 255) / 255;
		return new THREE.Vector3(0.55 + r * 0.45, 0.55 + g * 0.45, 0.55 + b * 0.45);
	}

	function buildIcosahedronMeshes(group) {
		const positions = [];
		faces.forEach(([a, b, c]) => {
			positions.push(...vertices[a], ...vertices[b], ...vertices[c]);
		});
		const solidGeo = new THREE.BufferGeometry();
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		solidGeo.computeVertexNormals();
		icoSolidMat = new THREE.MeshBasicMaterial({
			color: 0x1b1b1b,
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: false
		});
		group.add(new THREE.Mesh(solidGeo, icoSolidMat));

		const edgePositions = [];
		edges.forEach(([a, b]) => {
			edgePositions.push(...vertices[a], ...vertices[b]);
		});
		const wireGeo = new THREE.BufferGeometry();
		wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
		icoWireMat = new THREE.LineBasicMaterial({
			color: get(accentHex),
			transparent: true,
			opacity: 0
		});
		group.add(new THREE.LineSegments(wireGeo, icoWireMat));
	}

	// ── Sperm hologram overlay ───────────────────────────────────────────────
	function createSpermMaterial() {
		return new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 1.0 },
				uColor: { value: accentColorVec(get(accentHex)) }
			},
			vertexShader: `
				varying vec3 vNormal;
				varying vec3 vViewDir;
				varying vec3 vWorldPos;
				void main() {
					vec4 wp = modelMatrix * vec4(position, 1.0);
					vWorldPos = wp.xyz;
					vNormal = normalize(normalMatrix * normal);
					vViewDir = normalize(cameraPosition - wp.xyz);
					gl_Position = projectionMatrix * viewMatrix * wp;
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform float uOpacity;
				uniform vec3 uColor;
				varying vec3 vNormal;
				varying vec3 vViewDir;
				varying vec3 vWorldPos;
				void main() {
					float scan = sin(vWorldPos.y * 55.0 - uTime * 3.0) * 0.5 + 0.5;
					scan = smoothstep(0.3, 0.75, scan);
					float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);
					vec3 col = uColor + vec3(0.25) * fres;
					float a = (0.16 + scan * 0.22 + fres * 0.75) * uOpacity;
					gl_FragColor = vec4(col * a, a);
				}
			`
		});
	}

	function loadSperm() {
		spermScene = new THREE.Scene();
		spermCam = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.01, 100);
		spermCam.position.set(0, 0, 6);
		spermCam.lookAt(0, 0, 0);
		spermMat = createSpermMaterial();

		const loader = new GLTFLoader();
		loader.load(
			'/sperm.glb',
			(gltf) => {
				spermModel = gltf.scene;
				const box = new THREE.Box3().setFromObject(spermModel);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const scaleFactor = 2.7 / maxDim;
				spermModel.scale.setScalar(scaleFactor);
				spermModel.position.set(
					-center.x * scaleFactor,
					-center.y * scaleFactor,
					-center.z * scaleFactor
				);
				spermModel.traverse((c) => {
					if (c.isMesh) c.material = spermMat;
				});

				spermPivot = new THREE.Group();
				spermPivot.add(spermModel);
				spermScene.add(spermPivot);

				if (gltf.animations && gltf.animations.length) {
					spermMixer = new THREE.AnimationMixer(spermModel);
					gltf.animations.forEach((clip) => spermMixer.clipAction(clip).play());
				}
				spermReady = true;
			},
			undefined,
			() => {
				spermReady = true; // fail-open: don't block the flow
			}
		);
	}

	function disposeSperm() {
		spermActive = false;
		if (spermPivot && spermScene) spermScene.remove(spermPivot);
		if (spermModel) {
			spermModel.traverse((o) => {
				if (o.geometry) o.geometry.dispose();
			});
		}
		spermModel = null;
		spermPivot = null;
		spermMixer = null;
	}

	function applyFrustum(fr) {
		const aspect = window.innerWidth / window.innerHeight;
		camera.left = (-fr * aspect) / 2;
		camera.right = (fr * aspect) / 2;
		camera.top = fr / 2;
		camera.bottom = -fr / 2;
		camera.updateProjectionMatrix();
	}

	function handleResize() {
		if (!camera || !renderer) return;
		const p = window.innerHeight > window.innerWidth;
		isPortrait.set(p);
		if (p !== portrait) {
			portrait = p;
			rectangleComponents.forEach((comp) => comp && comp.setPortrait(p));
		}
		applyFrustum(frustum);
		renderer.setSize(window.innerWidth, window.innerHeight);
		if (spermCam) {
			spermCam.aspect = window.innerWidth / window.innerHeight;
			spermCam.updateProjectionMatrix();
		}
	}

	function handlePointer(e) {
		mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
		mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
	}

	function setStage(s) {
		stage = s;
		stageT = 0;
	}

	// ── Intro cinematic ────────────────────────────────────────────────────
	function startIntro() {
		if (stage !== 'idle') return;
		setStage('reveal');
	}

	function beginSwim() {
		spermActive = true;
		// Enter from a random-ish upper corner so it feels like it swims on-screen.
		const side = Math.random() < 0.5 ? -1 : 1;
		spermStartCorner.set(side * 1.15, 0.35 + Math.random() * 0.4);
		setStage('swim');
	}

	function openIcosahedron() {
		disposeSperm();
		setStage('open');
	}

	function finishOpen() {
		rectangleComponents.forEach((comp) => comp && comp.updateProjection(1));
		setStage('input');
		phase.set('calculate');
	}

	// ── Search / land ────────────────────────────────────────────────────────
	function pickDecadeRoom() {
		const want = get(decade);
		const candidates = [];
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (room) candidates.push({ i, decade: decadeAssignments[i] });
		});
		if (!candidates.length) return -1;
		const preferred = candidates.filter((c) => c.decade === want);
		const pool = preferred.length ? preferred : candidates;
		return pool[Math.floor(Math.random() * pool.length)].i;
	}

	function computeLandingQuat(i) {
		const comp = rectangleComponents[i];
		const room = comp && comp.getRoom && comp.getRoom();
		if (!room || !room.localFrame) return new THREE.Quaternion();
		const { right, up, normal } = room.localFrame();
		const mLocal = new THREE.Matrix4().makeBasis(right, up, normal);
		// Target: normal → camera direction, up → screen up (face-on).
		const camDir = new THREE.Vector3(0, 0, 1);
		const upT = new THREE.Vector3(0, 1, 0);
		const rightT = new THREE.Vector3().crossVectors(upT, camDir).normalize();
		const upT2 = new THREE.Vector3().crossVectors(camDir, rightT).normalize();
		const mTarget = new THREE.Matrix4().makeBasis(rightT, upT2, camDir);
		const mLocalInv = mLocal.clone().transpose();
		return new THREE.Quaternion().setFromRotationMatrix(mTarget.multiply(mLocalInv));
	}

	function startSearch() {
		if (stage !== 'input') return;
		spinQuatCurrent.copy(worldGroup.quaternion);
		targetRoomIndex = pickDecadeRoom();
		latticeActive.set(true);
		setStage('search');
	}

	function beginLand() {
		landStartQuat.copy(worldGroup.quaternion);
		landTargetQuat.copy(computeLandingQuat(targetRoomIndex));
		setStage('land');
	}

	function resetScene() {
		disposeSperm();
		setStage('idle');
		frustum = IDLE_FRUSTUM;
		icoReveal = 0;
		rotX = rotY = mouseNX = mouseNY = 0;
		idleAngle = 0;
		targetRoomIndex = -1;
		latticeActive.set(false);
		spinQuat.set({ x: 0, y: 0, z: 0, w: 1 });
		if (worldGroup) worldGroup.quaternion.copy(BASE_TILT);
		if (camera) {
			camera.position.copy(CAM_POS);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			applyFrustum(frustum);
		}
		if (icoWireMat) icoWireMat.opacity = 0;
		if (icoSolidMat) icoSolidMat.opacity = 0;
		rectangleComponents.forEach((comp) => {
			if (!comp) return;
			comp.setDim(1);
			comp.setLineDim(1);
			comp.updateProjection(0);
		});
		// If we're already past the preloader, re-run the intro.
		if (get(phase) === 'intro') setTimeout(startIntro, 300);
	}

	function publishSpin() {
		const q = worldGroup.quaternion;
		spinQuat.set({ x: q.x, y: q.y, z: q.z, w: q.w });
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock) return;
		const dt = clock.getDelta();

		// Canvas fade-in.
		const sinceMount = canvasFadeStart != null ? performance.now() / 1000 - canvasFadeStart : 0;
		canvasElement.style.opacity = clamp(sinceMount / CANVAS_FADE, 0, 1).toFixed(4);

		stageT += dt;

		// ── reveal: fade the collapsed wireframe in ────────────────────────
		if (stage === 'reveal') {
			icoReveal = clamp(stageT / REVEAL_DUR, 0, 1);
			idleAngle += dt * 0.25;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));
			if (stageT >= REVEAL_DUR * 0.55) {
				if (spermReady) beginSwim();
				else if (stageT >= REVEAL_DUR + 2.0) openIcosahedron(); // fail-open
			}
		}

		// ── swim: sperm dolly-swims through the collapsed icosahedron ──────
		if (stage === 'swim') {
			icoReveal = 1;
			idleAngle += dt * 0.25;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));

			const t = clamp(stageT / SWIM_DUR, 0, 1);
			// Gently front-loaded: visible arc across, then rushes through at the end.
			const travel = Math.pow(t, 1.25);
			const zStart = -11,
				zEnd = 7.8; // camera at z=6 → rushes right past the lens near the end
			if (spermPivot) {
				const z = lerp(zStart, zEnd, travel);
				const conv = 1 - smoothstep(0.05, 0.82, t); // converge to centre
				const wob = Math.sin(stageT * 3.0) * 0.3 * conv;
				spermPivot.position.set(
					spermStartCorner.x * 3.0 * conv + wob,
					spermStartCorner.y * 2.2 * conv - wob * 0.5,
					z
				);
				// Angled 3/4 view so the head + tail read as it swims through.
				spermPivot.rotation.set(0.15, Math.PI * 0.82, Math.sin(stageT * 3.0) * 0.28 * conv);
				spermMat.uniforms.uOpacity.value = smoothstep(0, 0.1, t) * (1 - smoothstep(0.9, 1, t));
			}
			// Dolly push-in on the ortho composition, peaking mid-swim.
			const bump = 4 * t * (1 - t);
			frustum = IDLE_FRUSTUM - 3.2 * bump;
			applyFrustum(frustum);

			if (t >= 1) openIcosahedron();
		}

		// ── open: project the panes/rooms out ("the icosahedron opens") ────
		if (stage === 'open') {
			frustum = lerp(frustum, IDLE_FRUSTUM, Math.min(1, dt * 4));
			applyFrustum(frustum);
			idleAngle += dt * 0.2;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));
			const t = easeInOutCubic(clamp(stageT / OPEN_DUR, 0, 1));
			rectangleComponents.forEach((comp) => comp && comp.updateProjection(t));
			if (stageT >= OPEN_DUR) finishOpen();
		}

		// ── input: mouse-interactive idle ──────────────────────────────────
		if (stage === 'input') {
			rotY += (mouseNX * MOUSE_AMP_Y - rotY) * Math.min(1, dt * 3);
			rotX += (-mouseNY * MOUSE_AMP_X - rotX) * Math.min(1, dt * 3);
			idleAngle += dt * 0.12;
			const target = BASE_TILT.clone().multiply(
				new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, idleAngle + rotY, 0))
			);
			worldGroup.quaternion.slerp(target, Math.min(1, dt * 4));
		}

		// ── search: controlled quaternion tumble (hyperspace) ─────────────
		if (stage === 'search') {
			const t = clamp(stageT / SEARCH_DUR, 0, 1);
			// Ramp angular speed up then hold, precessing the spin axis.
			const env = smoothstep(0, 0.25, t);
			const speed = 2.6 * env;
			const ax = Math.sin(stageT * 0.7) * 0.6;
			const ay = 1.0;
			const az = Math.cos(stageT * 0.5) * 0.6;
			const axis = new THREE.Vector3(ax, ay, az).normalize();
			const dq = new THREE.Quaternion().setFromAxisAngle(axis, speed * dt);
			worldGroup.quaternion.premultiply(dq);
			publishSpin();
			if (stageT >= SEARCH_DUR) beginLand();
		}

		// ── land: slerp to the resolved decade, room facing camera ────────
		if (stage === 'land') {
			const t = easeInOutCubic(clamp(stageT / LAND_DUR, 0, 1));
			worldGroup.quaternion.copy(landStartQuat).slerp(landTargetQuat, t);
			publishSpin();
			// Centred zoom (no orbit, stays dead-centre) frames the landed room.
			frustum = lerp(IDLE_FRUSTUM, LAND_FRUSTUM, smoothstep(0.15, 1, t));
			applyFrustum(frustum);
			// Fade the wireframe + the non-target rooms; keep the landed room.
			const fade = 1 - smoothstep(0.25, 0.95, t);
			if (icoWireMat) icoWireMat.opacity = fade * icoReveal;
			if (icoSolidMat) icoSolidMat.opacity = 0.5 * fade * icoReveal;
			rectangleComponents.forEach((comp, i) => {
				if (!comp) return;
				if (i === targetRoomIndex) comp.setLineDim(lerp(1, 0, smoothstep(0.55, 1, t)));
				else comp.setDim(fade);
			});
			latticeActive.set(t < 0.8);
			if (stageT >= LAND_DUR) {
				setStage('settled');
				sceneState.set(4);
			}
		}

		// Wireframe opacity (except when land is driving it).
		if (stage !== 'land') {
			if (icoWireMat) icoWireMat.opacity = icoReveal;
			if (icoSolidMat) icoSolidMat.opacity = 0.5 * icoReveal;
		}

		// Sperm overlay animation clock.
		if (spermMixer) spermMixer.update(dt);
		if (spermMat) spermMat.uniforms.uTime.value += dt;

		// Render: ortho scene, then sperm overlay on top while active.
		renderer.autoClear = true;
		renderer.render(scene, camera);
		if (spermActive && spermScene && spermCam) {
			renderer.autoClear = false;
			renderer.render(spermScene, spermCam);
		}
	}

	let unsubPhase, unsubSceneState;

	onMount(async () => {
		scene = new THREE.Scene();
		clock = new THREE.Clock();

		const aspect = window.innerWidth / window.innerHeight;
		portrait = window.innerHeight > window.innerWidth;
		isPortrait.set(portrait);

		camera = new THREE.OrthographicCamera(
			(-frustum * aspect) / 2,
			(frustum * aspect) / 2,
			frustum / 2,
			-frustum / 2,
			0.1,
			100
		);
		camera.position.copy(CAM_POS);
		camera.up.set(0, 1, 0);
		camera.lookAt(0, 0, 0);

		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x1b1b1b, 0);
		renderer.outputEncoding = THREE.sRGBEncoding;

		decadeAssignments = assignDecades(rectangleConfigs.length);

		worldGroup = new THREE.Group();
		scene.add(worldGroup);
		worldGroup.quaternion.copy(BASE_TILT);
		buildIcosahedronMeshes(worldGroup);

		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;

		loadSperm();

		window.addEventListener('pointermove', handlePointer);

		// Phase drives the cinematic entry + reset.
		unsubPhase = phase.subscribe((p) => {
			if (p === 'intro' && stage === 'idle') startIntro();
		});
		// Calculate hands off to the search on sceneState → 1; 0 resets.
		unsubSceneState = sceneState.subscribe((s) => {
			if (s === 0 && stage !== 'idle') resetScene();
			else if (s === 1) startSearch();
		});

		sceneReady = true;
		await tick();

		rectangleComponents.forEach((comp) => comp && comp.init());
		rectangleComponents.forEach((comp) => comp && comp.updateProjection(0));

		animate();
		window.addEventListener('resize', handleResize);

		// If the preloader already advanced us to intro before mount finished.
		if (get(phase) === 'intro' && stage === 'idle') startIntro();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (unsubPhase) unsubPhase();
		if (unsubSceneState) unsubSceneState();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('pointermove', handlePointer);
		rectangleComponents.forEach((comp) => comp && comp.dispose());
		if (renderer) renderer.dispose();
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
