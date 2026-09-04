<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { phase, sceneState, decade, isPortrait, flare } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
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
	let icoSolidMat, icoWireMat, icoSolidMesh, icoWireMesh;
	let portrait = false;

	// Canvas fade in from mount.
	let canvasFadeStart = null;
	const CANVAS_FADE = 1.2;
	let icoReveal = 0;

	const PHI = (1 + Math.sqrt(5)) / 2;
	const IDLE_FRUSTUM = 13;
	const LAND_FRUSTUM = 8; // fallback zoom if the room's size can't be measured
	let frustum = IDLE_FRUSTUM;

	// ── Camera: fixed, face-on, orthographic, centred the whole time. The 3D
	//    read comes from the icosahedron's own orientation, never a camera move.
	const CAM_POS = new THREE.Vector3(0, 0, 14);
	// A gentle static tilt so the opened structure reads as a solid in space.
	const BASE_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.32, 0.55, 0));

	// ── Stage machine ───────────────────────────────────────────────────────
	// One pass through the site, in the order the beats are meant to land:
	//   'idle'   — mounted; the boot terminal is typing. Nothing is drawn.
	//   'hover'  — the sperm hologram is on screen, swimming in place, while the
	//              operator works through the input panel. Still no icosahedron.
	//   'dive'   — the sperm accelerates away down the camera axis. THIS is where
	//              the icosahedron appears: it fades in ahead of the sperm, which
	//              passes straight through its core.
	//   'open'   — the panes/rooms project outward and the background flares.
	//   'search' — stepped quaternion scan across the decades.
	//   'zoom'   — dead-centre zoom into the resolved room.
	//   'settled'— result on screen.
	let stage = 'idle';
	let stageT = 0;

	const HOVER_Z = 3.2; // nearest the sperm is allowed to idle (camera sits at z = 6)
	const HOVER_SPAN = 0.78; // most of the frame width the hologram may take up
	const SPERM_SIZE = 1.35; // the model's largest dimension, set at load
	const DIVE_DUR = 3.0; // hover position → through the core → gone
	const DIVE_Z_END = -7.0;
	const DIVE_ACCEL = 2.4; // ease-in exponent: >1 = slower start, sharper finish
	const OPEN_DUR = 2.4;
	const LAND_DUR = 2.5;
	// Stepped search: slew to a decade, "scan" it, slew to the next — a few times.
	const STEP_SPIN = 1.0; // seconds to rotate to a decade face
	const STEP_SCAN = 0.6; // seconds dwelling / examining that decade

	// Pointer, normalised to [-1, 1]. During the input flow it nudges the sperm;
	// the icosahedron is never on screen at a moment the operator could steer it.
	let mouseNX = 0,
		mouseNY = 0;

	// Search / zoom bookkeeping.
	let stepStartQuat = new THREE.Quaternion();
	let stepTargetQuat = new THREE.Quaternion();
	let targetRoomIndex = -1;
	let searchOrder = []; // face indices to examine, resolved decade last
	let searchStep = 0;
	let searchSub = 'spin'; // 'spin' | 'scan'
	let subT = 0;
	let landFrustum = LAND_FRUSTUM;
	let idleAngle = 0;

	// Sperm overlay (perspective) — hovers through the input flow, then dives.
	let spermScene, spermCam, spermPivot, spermModel, spermMixer, spermMat;
	let spermActive = false;
	let spermReady = false;
	let spermFade = 0; // eased 0..1 hologram opacity
	let spermRoll = 0; // accumulated roll, shared by hover and dive
	let hoverT = 0;
	const diveFrom = new THREE.Vector3(0, 0, HOVER_Z);

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
			// Pre-convert to linear so the renderer's sRGB output encoding maps it
			// back to true site off-black (#0c0d0f) instead of gamma-lifting it to grey.
			color: new THREE.Color(0x0c0d0f).convertSRGBToLinear(),
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: true,
			// Push faces slightly back in depth so the wireframe always wins
			// (solid faceted look, no z-fighting on the shared edges).
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
		});
		icoSolidMesh = new THREE.Mesh(solidGeo, icoSolidMat);
		icoSolidMesh.visible = false;
		group.add(icoSolidMesh);

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
		icoWireMesh = new THREE.LineSegments(wireGeo, icoWireMat);
		icoWireMesh.visible = false;
		group.add(icoWireMesh);
	}

	// ── Sperm wireframe hologram overlay ─────────────────────────────────────
	function createSpermMaterial() {
		return new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			wireframe: true,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 0.5 },
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
					float a = (0.26 + scan * 0.22 + fres * 0.4) * uOpacity;
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
				const scaleFactor = SPERM_SIZE / maxDim;
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

	// Hide + park the sperm between runs (kept loaded so "run again" can reuse it).
	function hideSperm() {
		spermActive = false;
		if (spermPivot) spermPivot.visible = false;
	}

	function disposeSperm() {
		hideSperm();
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

	// Where the sperm idles in the perspective overlay, measured off that camera's
	// own frustum so it stays clear of the centred input panel at any aspect:
	// out to the right in landscape, above the panel in portrait.
	//
	// The depth is solved rather than fixed. A phone's frustum is far narrower
	// than a desktop's, so parking the hologram at a constant z cropped its tail
	// straight off the side; instead it is pushed back until it spans at most
	// HOVER_SPAN of the frame, and never nearer than HOVER_Z.
	function hoverAnchor() {
		if (!spermCam) return { x: 0, y: 0, z: HOVER_Z };
		const tanHalf = Math.tan((spermCam.fov * Math.PI) / 360);
		const fit = SPERM_SIZE / (HOVER_SPAN * 2 * tanHalf * Math.max(spermCam.aspect, 0.05));
		const dist = Math.max(spermCam.position.z - HOVER_Z, fit);
		const halfH = tanHalf * dist;
		const halfW = halfH * spermCam.aspect;
		const z = spermCam.position.z - dist;
		return portrait ? { x: 0, y: halfH * 0.52, z } : { x: halfW * 0.46, y: -halfH * 0.06, z };
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

	// ── Cinematic ──────────────────────────────────────────────────────────
	// Beat 2: the sperm comes on and swims in place beside the input panel. The
	// icosahedron is deliberately not built into view here — it belongs to the
	// dive, and showing it now would spend the reveal early.
	function beginHover() {
		if (stage !== 'idle') return;
		hoverT = 0;
		spermRoll = 0;
		spermFade = 0;
		if (spermPivot) {
			const a = hoverAnchor();
			spermPivot.visible = true;
			spermPivot.position.set(a.x, a.y, a.z);
			spermPivot.rotation.set(0, Math.PI, 0);
		}
		spermActive = true;
		setStage('hover');
	}

	// Beat 3: the dive. Captures wherever the sperm was idling so the launch is
	// continuous rather than a snap back to the axis.
	function beginDive() {
		if (stage !== 'hover') return;
		if (spermPivot) diveFrom.copy(spermPivot.position);
		else diveFrom.set(0, 0, HOVER_Z);
		setStage('dive');
	}

	// The sperm is through; the polyhedron it just pierced comes apart.
	function openIcosahedron() {
		hideSperm();
		setStage('open');
	}

	function finishOpen() {
		rectangleComponents.forEach((comp) => comp && comp.updateProjection(1));
		startSearch();
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

	// A handful of distinct-decade faces to examine before the answer, then the
	// resolved decade itself as the final step — so the search reads as an actual
	// programmatic scan that lands on the result.
	function pickSearchOrder(target) {
		const byDecade = {};
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (!room) return;
			const d = decadeAssignments[i];
			if (!byDecade[d]) byDecade[d] = [];
			byDecade[d].push(i);
		});
		const previsits = shuffle(Object.keys(byDecade))
			.map((d) => byDecade[d][0])
			.filter((i) => i !== target)
			.slice(0, 2);
		return [...previsits, target];
	}

	function beginStepSpin(idx) {
		stepStartQuat.copy(worldGroup.quaternion);
		stepTargetQuat.copy(computeLandingQuat(idx));
		searchSub = 'spin';
		subT = 0;
	}

	function startSearch() {
		targetRoomIndex = pickDecadeRoom();
		searchOrder = pickSearchOrder(targetRoomIndex);
		searchStep = 0;
		setStage('search');
		beginStepSpin(searchOrder[0]);
	}

	// The decade is already facing camera (the final search spin put it there).
	// Now do a pure, dead-centre zoom until the room's artwork fills the screen —
	// no rotation, no orbit.
	function beginZoom() {
		const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
		const aspect = window.innerWidth / window.innerHeight;
		if (room && room.localFrame) {
			const { W, H } = room.localFrame();
			landFrustum = Math.min(H, W / aspect) * 0.98;
		} else {
			landFrustum = LAND_FRUSTUM;
		}
		setStage('zoom');
	}

	function resetScene() {
		hideSperm();
		setStage('idle');
		frustum = IDLE_FRUSTUM;
		icoReveal = 0;
		mouseNX = mouseNY = 0;
		idleAngle = 0;
		hoverT = 0;
		spermRoll = 0;
		spermFade = 0;
		targetRoomIndex = -1;
		flare.set(0);
		if (worldGroup) worldGroup.quaternion.copy(BASE_TILT);
		if (camera) {
			camera.position.copy(CAM_POS);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			applyFrustum(frustum);
		}
		if (icoWireMat) icoWireMat.opacity = 0;
		if (icoSolidMat) icoSolidMat.opacity = 0;
		if (icoWireMesh) icoWireMesh.visible = false;
		if (icoSolidMesh) icoSolidMesh.visible = false;
		rectangleComponents.forEach((comp) => {
			if (!comp) return;
			comp.setDim(1);
			comp.setLineDim(1);
			const room = comp.getRoom && comp.getRoom();
			if (room && room.setZoomProgress) room.setZoomProgress(0);
			comp.updateProjection(0);
		});
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock) return;
		// Clamp dt so a one-off hitch (GLTF parse, texture upload on load) can't
		// jump the animation forward — everything stays smooth instead of lurching.
		const dt = Math.min(clock.getDelta(), 0.05);

		// Canvas fade-in.
		const sinceMount =
			canvasFadeStart != null ? performance.now() / 1000 - canvasFadeStart - 1.0 : 0;
		canvasElement.style.opacity = clamp(sinceMount / CANVAS_FADE, 0, 1).toFixed(4);

		stageT += dt;

		// ── hover: the sperm swims in place beside the input panel ─────────
		if (stage === 'hover') {
			icoReveal = 0;
			hoverT += dt;
			spermRoll += dt * 0.5;
			// The model may still have been parsing when the operator hit start.
			if (spermReady && spermPivot && !spermPivot.visible) {
				spermPivot.visible = true;
				spermActive = true;
			}
			if (spermPivot) {
				const a = hoverAnchor();
				// Two incommensurate periods per axis, so it never repeats a loop.
				spermPivot.position.set(
					a.x + Math.sin(hoverT * 0.62) * 0.17 + mouseNX * 0.12,
					a.y + Math.sin(hoverT * 0.94) * 0.13 - mouseNY * 0.1,
					a.z + Math.sin(hoverT * 0.41) * 0.24
				);
				spermPivot.rotation.set(
					Math.sin(hoverT * 0.7) * 0.17 - mouseNY * 0.14,
					Math.PI + Math.sin(hoverT * 0.53) * 0.3 + mouseNX * 0.2,
					spermRoll
				);
			}
			spermFade += (0.95 - spermFade) * Math.min(1, dt * 1.6);
			if (spermMat) spermMat.uniforms.uOpacity.value = spermFade;
		}

		// ── dive: the sperm accelerates away — and the icosahedron appears ──
		if (stage === 'dive') {
			const t = clamp(stageT / DIVE_DUR, 0, 1);
			// The whole reveal of the polyhedron lives here: it resolves out of the
			// dark ahead of the sperm, which then passes straight through its core.
			icoReveal = smoothstep(0.06, 0.5, t);
			idleAngle += dt * 0.3;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));

			// Pure ease-in: d/dt of t^n is n·t^(n-1), which rises monotonically from 0,
			// so it never slows — gentle start, speeds into the end.
			const eased = Math.pow(t, DIVE_ACCEL);
			spermRoll += dt * (1.6 + 9.0 * t);
			if (spermPivot) {
				const z = lerp(diveFrom.z, DIVE_Z_END, eased);
				// Converge onto the camera axis as it commits, so it enters the core
				// dead centre however far off to the side it had drifted.
				const off = 1 - smoothstep(0, 0.42, t);
				spermPivot.position.set(diveFrom.x * off, diveFrom.y * off, z);
				spermPivot.rotation.set(0, Math.PI, spermRoll);
				// Hold full brightness until it is through, then fade behind the core.
				const gone = 1 - smoothstep(-2.2, -5.0, z);
				if (spermMat) spermMat.uniforms.uOpacity.value = 0.95 * gone;
			}

			if (t >= 1) openIcosahedron();
		}

		// ── open: project the panes/rooms out, and light the background ────
		if (stage === 'open') {
			frustum = lerp(frustum, IDLE_FRUSTUM, Math.min(1, dt * 4));
			applyFrustum(frustum);
			idleAngle += dt * 0.2;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));
			const raw = clamp(stageT / OPEN_DUR, 0, 1);
			rectangleComponents.forEach((comp) => comp && comp.updateProjection(easeInOutCubic(raw)));
			// The one moment the theta field is allowed on screen starts here: the
			// panes crack apart and the background catches fire behind them.
			flare.set(smoothstep(0.02, 0.34, raw));
			if (stageT >= OPEN_DUR) finishOpen();
		}

		// ── search: spin to a decade → scan it → spin to the next → … ─────
		if (stage === 'search') {
			subT += dt;
			const isFinal = searchStep === searchOrder.length - 1;
			if (searchSub === 'spin') {
				const t = easeInOutCubic(clamp(subT / STEP_SPIN, 0, 1));
				worldGroup.quaternion.copy(stepStartQuat).slerp(stepTargetQuat, t);
				if (subT >= STEP_SPIN) {
					// Landed on the resolved decade → hand straight to the zoom (no scan).
					if (isFinal) beginZoom();
					else {
						searchSub = 'scan';
						subT = 0;
					}
				}
			} else {
				// Dwell on the current decade with a "focus" pulse: everything else
				// dims out briefly, as if the machine is examining this candidate.
				const pulse = Math.sin(clamp(subT / STEP_SCAN, 0, 1) * Math.PI);
				rectangleComponents.forEach((comp, i) => {
					if (!comp) return;
					comp.setDim(i === searchOrder[searchStep] ? 1 : lerp(1, 0.15, pulse));
				});
				if (subT >= STEP_SCAN) {
					rectangleComponents.forEach((comp) => comp && comp.setDim(1));
					searchStep += 1;
					beginStepSpin(searchOrder[searchStep]);
				}
			}
			// Held at full burn for the length of the scan.
			flare.set(1);
		}

		// ── zoom: pure centred zoom into the resolved room (no rotation) ──
		if (stage === 'zoom') {
			const t = easeInOutCubic(clamp(stageT / LAND_DUR, 0, 1));
			frustum = lerp(IDLE_FRUSTUM, landFrustum, t);
			applyFrustum(frustum);
			// Fade the wireframe + the other rooms; keep the resolved room.
			const fade = 1 - smoothstep(0.1, 0.8, t);
			if (icoWireMat) icoWireMat.opacity = fade * icoReveal;
			if (icoSolidMat) icoSolidMat.opacity = fade * icoReveal;
			rectangleComponents.forEach((comp, i) => {
				if (!comp) return;
				if (i === targetRoomIndex) comp.setLineDim(lerp(1, 0, smoothstep(0.15, 0.7, t)));
				else comp.setDim(fade);
			});
			// Depth parallax is a transient felt *during* the move — it surges as the
			// room rushes in, then relaxes so the final resting frame lands fairly flat.
			const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
			if (room && room.setZoomProgress) room.setZoomProgress(Math.sin(t * Math.PI));
			// Bleed the field off as the room takes the screen.
			flare.set(1 - smoothstep(0.1, 0.7, t));
			if (stageT >= LAND_DUR) {
				setStage('settled');
				sceneState.set(4);
				flare.set(0);
			}
		}

		// Wireframe opacity (except when the zoom is driving its fade).
		if (stage !== 'zoom') {
			if (icoWireMat) icoWireMat.opacity = icoReveal;
			// Solid faces are opaque site off-black so the polyhedron reads as a
			// clean dark solid, not a translucent grey wash over the background.
			if (icoSolidMat) icoSolidMat.opacity = icoReveal;
		}

		// Hidden outright until the dive brings it in — a transparent material at
		// opacity 0 still writes depth, which would occlude the rooms behind it.
		const icoOn = (icoWireMat?.opacity ?? 0) > 0.002;
		if (icoWireMesh) icoWireMesh.visible = icoOn;
		if (icoSolidMesh) icoSolidMesh.visible = icoOn;

		// Sperm overlay animation clock.
		if (spermMixer) spermMixer.update(dt);
		if (spermMat) spermMat.uniforms.uTime.value += dt;

		// Render the ortho scene, then the sperm overlay on top — the sperm stays
		// fully visible as it flies through the icosahedron, then fades out.
		// clearDepth() wipes the ortho scene's depth buffer first, otherwise the
		// perspective sperm would be depth-tested against the (incompatible) ortho
		// depths written by the solid icosahedron faces and vanish.
		renderer.autoClear = true;
		renderer.render(scene, camera);
		if (spermActive && spermScene && spermCam) {
			renderer.autoClear = false;
			renderer.clearDepth();
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
		renderer.setClearColor(0x0c0d0f, 0);
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

		// Phase owns the two hand-offs the operator triggers: 'calculate' (the
		// start key was pressed) brings the sperm on, and 'boot' — reached by
		// "run again", or by an out-of-range date that never ran a search —
		// tears everything back down.
		unsubPhase = phase.subscribe((p) => {
			if (p === 'boot') {
				if (stage !== 'idle') resetScene();
			} else if (p === 'calculate' && stage === 'idle') {
				beginHover();
			}
		});
		// Calculate hands off the dive → open → search on sceneState → 1.
		unsubSceneState = sceneState.subscribe((s) => {
			if (s === 1) beginDive();
		});

		sceneReady = true;
		await tick();

		rectangleComponents.forEach((comp) => comp && comp.init());
		rectangleComponents.forEach((comp) => comp && comp.updateProjection(0));

		animate();
		window.addEventListener('resize', handleResize);

		// If the boot log already finished before the scene mounted.
		if (get(phase) === 'calculate' && stage === 'idle') beginHover();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (unsubPhase) unsubPhase();
		if (unsubSceneState) unsubSceneState();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('pointermove', handlePointer);
		rectangleComponents.forEach((comp) => comp && comp.dispose());
		disposeSperm();
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
