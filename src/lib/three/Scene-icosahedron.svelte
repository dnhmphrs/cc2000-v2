<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { phase, sceneState, decade, isPortrait, spinQuat, latticeActive } from '$lib/store/store';
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
	let icoSolidMat, icoWireMat;
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
	const SWIM_DUR = 4.2;
	const OPEN_DUR = 3.6;
	const LAND_DUR = 2.2;
	// Stepped search: slew to a decade, "scan" it, slew to the next — a few times.
	const STEP_SPIN = 0.85; // seconds to rotate to a decade face
	const STEP_SCAN = 0.6; // seconds dwelling / examining that decade

	// Mouse-look during the input flow.
	let mouseNX = 0,
		mouseNY = 0;
	let rotX = 0,
		rotY = 0;
	const MOUSE_AMP_Y = 0.55,
		MOUSE_AMP_X = 0.38;

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

	// Sperm overlay (perspective) — swims through, then removed.
	let spermScene, spermCam, spermPivot, spermModel, spermMixer, spermMat;
	let spermActive = false;
	let spermReady = false;

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
			// back to true site off-black (#1b1b1b) instead of gamma-lifting it to grey.
			color: new THREE.Color(0x1b1b1b).convertSRGBToLinear(),
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: true,
			// Push faces slightly back in depth so the gold wireframe always wins
			// (solid faceted look, no z-fighting on the shared edges).
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
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
		if (spermPivot) {
			spermPivot.visible = true;
			spermPivot.position.set(0, 0, 8);
			spermPivot.rotation.set(0, Math.PI, 0);
		}
		spermActive = true;
		setStage('swim');
	}

	function openIcosahedron() {
		hideSperm();
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
			.slice(0, 3);
		return [...previsits, target];
	}

	function beginStepSpin(idx) {
		stepStartQuat.copy(worldGroup.quaternion);
		stepTargetQuat.copy(computeLandingQuat(idx));
		searchSub = 'spin';
		subT = 0;
	}

	function startSearch() {
		if (stage !== 'input') return;
		targetRoomIndex = pickDecadeRoom();
		searchOrder = pickSearchOrder(targetRoomIndex);
		searchStep = 0;
		latticeActive.set(true);
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

		// ── swim: sperm flies straight down the camera axis into the core ──
		if (stage === 'swim') {
			icoReveal = 1;
			idleAngle += dt * 0.25;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));

			const t = clamp(stageT / SWIM_DUR, 0, 1);
			// 2001-style fly-by: a straight line locked to the camera axis, emerging
			// from behind the lens (z > camera) and flying forward into the core.
			const zStart = 8, // behind the camera (which sits at z = 6)
				zEnd = -3.5; // through the icosahedron centre (z = 0) and out the back
			if (spermPivot) {
				const z = lerp(zStart, zEnd, t);
				// Dead-centre on the camera axis; roll clockwise as it flies in.
				spermPivot.position.set(0, 0, z);
				spermPivot.rotation.set(0, Math.PI, -stageT * 2.4);
				// Appears once it clears the lens; fades as it enters the core.
				const appear = smoothstep(5.8, 4.4, z);
				const arrive = 1 - smoothstep(0.6, -2.2, z);
				spermMat.uniforms.uOpacity.value = appear * arrive;
			}

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
			publishSpin();
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
			latticeActive.set(t < 0.5);
			publishSpin();
			if (stageT >= LAND_DUR) {
				setStage('settled');
				sceneState.set(4);
			}
		}

		// Wireframe opacity (except when the zoom is driving its fade).
		if (stage !== 'zoom') {
			if (icoWireMat) icoWireMat.opacity = icoReveal;
			// Solid faces are opaque site off-black so the polyhedron reads as a
			// clean dark solid, not a translucent grey wash over the background.
			if (icoSolidMat) icoSolidMat.opacity = icoReveal;
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
