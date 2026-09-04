<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import {
		phase,
		sceneState,
		decade,
		isPortrait,
		flare,
		fieldDecade,
		monitorRect
	} from '$lib/store/store';
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
	//   'idle'   — mounted, nothing drawn.
	//   'arrive' — the sperm swims onto the screen. This is the opening: it is
	//              the first thing that happens, before any copy.
	//   'hover'  — it holds station, swimming in place, through the title screen
	//              and the questions. Still no icosahedron.
	//   'dive'   — the sperm accelerates away down the camera axis. THIS is where
	//              the icosahedron appears: it fades in ahead of the sperm, which
	//              passes straight through its core.
	//   'open'   — the panes/rooms project outward and the background flares.
	//   'search' — turns through a few decades, then rests on the answer.
	//   'zoom'   — dead-centre zoom into the resolved room.
	//   'settled'— result on screen.
	let stage = 'idle';
	let stageT = 0;

	// The hologram idles at a fixed, comfortable distance (close enough to read,
	// far enough that the 52° lens doesn't distort it) and is *scaled* to fill the
	// frame rather than moved. Solving for distance instead put it so far back on
	// a wide screen that the input panel hid it completely.
	const ARRIVE_DUR = 2.6; // swims in from off-screen and settles into station
	const HOVER_DIST = 3.6; // camera sits at z = 6, so it idles at z = 2.4
	// It swims in the upper half; the questions live in the lower half.
	const HOVER_SPAN = 0.42; // fraction of the frame width it spans (landscape)
	const HOVER_SPAN_PORTRAIT = 0.62;
	const HOVER_RISE = 0.42; // fraction of the half-height, above centre
	const HOVER_RISE_PORTRAIT = 0.55;
	const SPERM_SIZE = 1.35; // the model's largest dimension, set at load

	// The cinematic runs about eight seconds, most of it the search. It once ran
	// fourteen and the padding was all in the approach; the turns themselves earn
	// their time, because each one puts another decade's room on screen.
	const DIVE_DUR = 1.3; // hover position → through the core → gone
	const DIVE_Z_END = -7.0;
	// Ease-in exponent. Barely above linear: a glide that gathers a little pace.
	const DIVE_ACCEL = 1.35;
	const OPEN_DUR = 1.2;
	const LAND_DUR = 1.5;
	// Turn to a decade, look at it, turn to the next — three of them, then the
	// answer. Brisk: the old version dwelt nearly twice as long on each.
	const PREVISITS = 3;
	const STEP_SPIN = 0.7; // seconds to rotate to a decade face
	const STEP_SCAN = 0.35; // seconds resting on it

	// Pointer, normalised to [-1, 1]. During the input flow it nudges the sperm;
	// the icosahedron is never on screen at a moment the operator could steer it.
	let mouseNX = 0,
		mouseNY = 0;

	// Search / zoom bookkeeping.
	let stepStartQuat = new THREE.Quaternion();
	let stepTargetQuat = new THREE.Quaternion();
	let targetRoomIndex = -1;
	let searchOrder = []; // faces to look at, the resolved decade last
	let searchStep = 0;
	let searchSub = 'spin'; // 'spin' | 'scan'
	let subT = 0;
	let landFrustum = LAND_FRUSTUM;
	let idleAngle = 0;

	// Sperm overlay (perspective) — hovers through the input flow, then dives.
	let spermScene, spermCam, spermPivot, spermSpin, spermModel, spermMixer, spermMat;
	// The model's own long axis, found from its bounding box at load. Rolling
	// about this is a barrel roll along the body; rolling about z (which is what
	// it used to do) spun it like a propeller, which is why it read as an object
	// tumbling in a box rather than something swimming.
	let bodyAxis = new THREE.Vector3(1, 0, 0);
	// Motes in the fluid — the depth cue for the canal.
	let motes, moteMat, moteZ, moteSpeed;
	const MOTE_COUNT = 300;
	let spermActive = false;
	let spermReady = false;
	let spermFade = 0; // eased 0..1 hologram opacity
	let beat = 0; // tail-beat phase, drives rock / sway / surge
	let hoverT = 0;
	const diveFrom = new THREE.Vector3(0, 0, 2.4);

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
		const r = ((hex >> 16) & 255) / 255;
		const g = ((hex >> 8) & 255) / 255;
		const b = (hex & 255) / 255;
		return new THREE.Vector3(r, g, b);
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
			// back to the true site ground (#0a246a) instead of gamma-lifting it.
			color: new THREE.Color(0x0a246a).convertSRGBToLinear(),
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
					float scan = sin(vWorldPos.y * 22.0 - uTime * 0.9) * 0.5 + 0.5;
					scan = smoothstep(0.3, 0.75, scan);
					float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);
					vec3 col = uColor + vec3(0.12) * fres;
					float a = (0.22 + scan * 0.12 + fres * 0.22) * uOpacity;
					gl_FragColor = vec4(col * a, a);
				}
			`
		});
	}

	// Specks of matter suspended in the fluid, streaming past the camera. This is
	// what makes the front half read as moving up a canal rather than hanging in
	// the dark: near ones sweep past fast and large, far ones creep.
	function buildMotes() {
		const pos = new Float32Array(MOTE_COUNT * 3);
		const seed = new Float32Array(MOTE_COUNT);
		moteZ = new Float32Array(MOTE_COUNT);
		moteSpeed = new Float32Array(MOTE_COUNT);
		for (let i = 0; i < MOTE_COUNT; i++) {
			pos[i * 3] = (Math.random() * 2 - 1) * 8;
			pos[i * 3 + 1] = (Math.random() * 2 - 1) * 6;
			moteZ[i] = -18 + Math.random() * 24;
			pos[i * 3 + 2] = moteZ[i];
			seed[i] = Math.random();
			moteSpeed[i] = 0.8 + Math.random() * 2.4;
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

		moteMat = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uOpacity: { value: 0 },
				uPix: { value: Math.min(window.devicePixelRatio, 2) },
				uColor: { value: new THREE.Vector3(1.0, 0.86, 0.9) }
			},
			vertexShader: `
				attribute float aSeed;
				varying float vFade;
				uniform float uPix;
				void main() {
					vec4 mv = modelViewMatrix * vec4(position, 1.0);
					gl_Position = projectionMatrix * mv;
					float d = max(-mv.z, 0.05);
					// Clamped: a mote right on the lens would otherwise be hundreds of
					// pixels of near-invisible overdraw, which is pure fill cost.
					gl_PointSize = min((aSeed * 30.0 + 5.0) * uPix / d, 56.0 * uPix);
					// In from the far dark, out as it sweeps past the lens.
					vFade = smoothstep(20.0, 12.0, d) * smoothstep(0.3, 3.0, d);
				}
			`,
			fragmentShader: `
				varying float vFade;
				uniform vec3 uColor;
				uniform float uOpacity;
				void main() {
					float r = length(gl_PointCoord - 0.5);
					float a = smoothstep(0.5, 0.05, r) * vFade * uOpacity;
					gl_FragColor = vec4(uColor * a, a);
				}
			`
		});

		motes = new THREE.Points(geo, moteMat);
		motes.frustumCulled = false;
		spermScene.add(motes);
	}

	// Drift them toward the camera and recycle the ones that pass it.
	function updateMotes(dt, flow) {
		if (!motes) return;
		const p = motes.geometry.attributes.position.array;
		for (let i = 0; i < MOTE_COUNT; i++) {
			moteZ[i] += dt * moteSpeed[i] * flow;
			if (moteZ[i] > 7) {
				moteZ[i] = -18;
				p[i * 3] = (Math.random() * 2 - 1) * 8;
				p[i * 3 + 1] = (Math.random() * 2 - 1) * 6;
			}
			p[i * 3 + 2] = moteZ[i];
		}
		motes.geometry.attributes.position.needsUpdate = true;
	}

	function loadSperm() {
		spermScene = new THREE.Scene();
		spermCam = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.01, 100);
		spermCam.position.set(0, 0, 6);
		spermCam.lookAt(0, 0, 0);
		spermMat = createSpermMaterial();
		buildMotes();

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

				// Longest bounding-box side is the body; roll happens about that.
				const axisIdx = size.x >= size.y && size.x >= size.z ? 0 : size.y >= size.z ? 1 : 2;
				bodyAxis = new THREE.Vector3(
					axisIdx === 0 ? 1 : 0,
					axisIdx === 1 ? 1 : 0,
					axisIdx === 2 ? 1 : 0
				);

				// pivot = where it is and which way it faces; spin = the barrel roll
				// about its own length, taken separately so the two don't fight.
				spermSpin = new THREE.Group();
				spermSpin.add(spermModel);
				spermPivot = new THREE.Group();
				spermPivot.add(spermSpin);
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

	// Where the sperm idles in the perspective overlay: dead centre, on the same
	// axis it will later dive down, with the input panel sitting over the middle
	// of it. Parking it off to one side read as an accident.
	function hoverAnchor() {
		if (!spermCam) return { x: 0, y: 0, z: 2.4, scale: 1 };
		const tanHalf = Math.tan((spermCam.fov * Math.PI) / 360);
		const frameW = 2 * tanHalf * HOVER_DIST * Math.max(spermCam.aspect, 0.05);
		const span = portrait ? HOVER_SPAN_PORTRAIT : HOVER_SPAN;
		return {
			x: 0,
			y: tanHalf * HOVER_DIST * (portrait ? HOVER_RISE_PORTRAIT : HOVER_RISE),
			z: spermCam.position.z - HOVER_DIST,
			scale: (span * frameW) / SPERM_SIZE
		};
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
		if (stage === 'settled') publishMonitor();
		if (spermCam) {
			spermCam.aspect = window.innerWidth / window.innerHeight;
			spermCam.updateProjectionMatrix();
		}
	}

	function handlePointer(e) {
		mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
		mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
	}

	// The swim. The model is a static mesh — no skin, no clips — so every bit of
	// this is rigid-body motion, and it has to read as a cell beating rather than
	// an object being turned.
	//
	// It ROCKS about its own length instead of rolling right over: a full barrel
	// roll turns a flat curled body edge-on twice a cycle, where it collapses to a
	// line and you cannot tell what you are looking at. Rocking sweeps the tail
	// through depth and keeps it legible the whole time.
	function applySwim(dt, rate) {
		beat += dt * rate;
		if (spermSpin) spermSpin.setRotationFromAxisAngle(bodyAxis, Math.sin(beat) * 0.62);
	}

	// Nose sway, on periods that don't divide into the rock, so it never falls
	// into a mechanical-looking loop.
	function undulate(amount) {
		return {
			x: Math.sin(beat * 0.63) * 0.1 * amount,
			y: Math.PI + Math.sin(beat * 0.44) * 0.2 * amount
		};
	}

	// It gains a little on each beat and coasts between — the propulsion cue.
	const surge = () => Math.sin(beat * 2) * 0.11;

	function setStage(s) {
		stage = s;
		stageT = 0;
	}

	// ── Cinematic ──────────────────────────────────────────────────────────
	// Beat 2: the sperm comes on and swims in place beside the input panel. The
	// icosahedron is deliberately not built into view here — it belongs to the
	// dive, and showing it now would spend the reveal early.
	// Beat 0: the sperm swims on. It is the first thing on screen — the site
	// opens on it, not on a block of copy.
	function beginArrive() {
		if (stage !== 'idle') return;
		hoverT = 0;
		beat = 0;
		spermFade = 0;
		if (spermPivot) {
			const a = hoverAnchor();
			spermPivot.visible = true;
			spermPivot.position.set(arriveFrom(a).x, arriveFrom(a).y, a.z);
			spermPivot.rotation.set(0, Math.PI, 0);
			spermPivot.scale.setScalar(a.scale);
		}
		spermActive = true;
		setStage('arrive');
	}

	// Enters from off the left edge, a little low, so it swims up into station.
	function arriveFrom(a) {
		const tanHalf = Math.tan((spermCam.fov * Math.PI) / 360);
		const halfH = tanHalf * HOVER_DIST;
		return { x: -halfH * spermCam.aspect * 2.1, y: a.y - halfH * 0.5 };
	}

	function beginHover() {
		hoverT = 0;
		setStage('hover');
	}

	// Beat 3: the dive. Captures wherever the sperm was idling so the launch is
	// continuous rather than a snap back to the axis.
	//
	// Accepts any pre-dive stage, not just 'hover'. It used to require 'hover'
	// exactly, so answering both questions and hitting calculate inside the 2.6s
	// the sperm takes to swim on dropped the cue on the floor and hung the site
	// in the tube forever, with no way out but a reload.
	function beginDive() {
		if (stage === 'dive' || stage === 'open' || stage === 'search') return;
		if (stage === 'zoom' || stage === 'settled') return;
		if (spermPivot) diveFrom.copy(spermPivot.position);
		else diveFrom.set(0, 0, 2.4);
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

	// A few distinct decades to visit before the answer, then the answer itself.
	// The point is not to fake a search — it is that each turn shows another
	// decade's artwork, which is otherwise built and never seen.
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
			.slice(0, PREVISITS);
		return [...previsits, target];
	}

	function beginStepSpin(idx) {
		stepStartQuat.copy(worldGroup.quaternion);
		stepTargetQuat.copy(computeLandingQuat(idx));
		// The background takes this decade's colours as we turn toward it.
		fieldDecade.set(decadeAssignments[idx] ?? null);
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
		beat = 0;
		spermFade = 0;
		targetRoomIndex = -1;
		flare.set(0);
		fieldDecade.set(null);
		monitorRect.set(null);
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
		// "go again" comes back through 'intro', so swim on again.
		setTimeout(() => {
			if (stage === 'idle' && get(phase) === 'intro') beginArrive();
		}, 250);
	}

	// Where the resolved room's monitor glass has landed on screen, so the result
	// can be drawn inside it rather than floating over the room.
	function publishMonitor() {
		const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
		if (!room || !room.screenRect) return monitorRect.set(null);
		monitorRect.set(room.screenRect(camera, window.innerWidth, window.innerHeight));
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

		// ── arrive: swims on from off-screen and settles into station ──────
		if (stage === 'arrive') {
			icoReveal = 0;
			hoverT += dt;
			if (spermReady && spermPivot && !spermPivot.visible) {
				spermPivot.visible = true;
				spermActive = true;
			}
			const t = easeInOutCubic(clamp(stageT / ARRIVE_DUR, 0, 1));
			applySwim(dt, 3.6); // beating harder on the way in
			if (spermPivot) {
				const a = hoverAnchor();
				const from = arriveFrom(a);
				const u = undulate(1);
				spermPivot.scale.setScalar(a.scale);
				spermPivot.position.set(
					lerp(from.x, a.x, t),
					lerp(from.y, a.y, t),
					a.z + surge() * (1 - t)
				);
				spermPivot.rotation.set(u.x, u.y + (1 - t) * 0.35, 0);
			}
			spermFade += (0.8 - spermFade) * Math.min(1, dt * 2.2);
			if (spermMat) spermMat.uniforms.uOpacity.value = spermFade;
			if (stageT >= ARRIVE_DUR) beginHover();
		}

		// ── hover: holds station through the title and the questions ───────
		if (stage === 'hover') {
			icoReveal = 0;
			hoverT += dt;
			applySwim(dt, 3.0);
			// The model may still have been parsing when the page loaded.
			if (spermReady && spermPivot && !spermPivot.visible) {
				spermPivot.visible = true;
				spermActive = true;
			}
			if (spermPivot) {
				const a = hoverAnchor();
				// Re-solved every frame so a resize re-fits it; frozen once it dives.
				spermPivot.scale.setScalar(a.scale);
				// Two incommensurate periods per axis, so it never repeats a loop.
				spermPivot.position.set(
					a.x + Math.sin(hoverT * 0.34) * 0.09 + mouseNX * 0.06,
					a.y + Math.sin(hoverT * 0.47) * 0.07 - mouseNY * 0.05,
					a.z + Math.sin(hoverT * 0.23) * 0.14 + surge()
				);
				const u = undulate(1);
				spermPivot.rotation.set(u.x - mouseNY * 0.07, u.y + mouseNX * 0.1, 0);
			}
			spermFade += (0.8 - spermFade) * Math.min(1, dt * 1.2);
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
			applySwim(dt, 3.0 + 6.0 * t); // beats harder the deeper it goes
			if (spermPivot) {
				const z = lerp(diveFrom.z, DIVE_Z_END, eased);
				// Converge onto the camera axis as it commits, so it enters the core
				// dead centre however far off to the side it had drifted.
				const off = 1 - smoothstep(0, 0.42, t);
				const u = undulate(1 - t * 0.6);
				spermPivot.position.set(diveFrom.x * off, diveFrom.y * off, z);
				spermPivot.rotation.set(u.x, u.y, 0);
				// Start fading before it reaches the core, so it dissolves into the
				// polyhedron rather than punching through it.
				const gone = 1 - smoothstep(-0.4, -4.0, z);
				if (spermMat) spermMat.uniforms.uOpacity.value = 0.8 * gone;
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
			// The one moment the field is allowed on screen starts here: it comes up
			// with the panes over the whole open, not as a hit.
			flare.set(smoothstep(0.0, 0.85, raw));
			if (stageT >= OPEN_DUR) finishOpen();
		}

		// ── search: turn to a decade, rest on it, turn to the next ─────────
		if (stage === 'search') {
			subT += dt;
			const isFinal = searchStep === searchOrder.length - 1;
			if (searchSub === 'spin') {
				const t = easeInOutCubic(clamp(subT / STEP_SPIN, 0, 1));
				worldGroup.quaternion.copy(stepStartQuat).slerp(stepTargetQuat, t);
				if (subT >= STEP_SPIN) {
					if (isFinal) beginZoom();
					else {
						searchSub = 'scan';
						subT = 0;
					}
				}
			} else {
				// Lean on the one being looked at. The others only step back — they
				// used to drop to 0.15, which hid the very artwork this is here to
				// show.
				const pulse = Math.sin(clamp(subT / STEP_SCAN, 0, 1) * Math.PI);
				rectangleComponents.forEach((comp, i) => {
					if (!comp) return;
					comp.setDim(i === searchOrder[searchStep] ? 1 : lerp(1, 0.45, pulse));
				});
				if (subT >= STEP_SCAN) {
					rectangleComponents.forEach((comp) => comp && comp.setDim(1));
					searchStep += 1;
					beginStepSpin(searchOrder[searchStep]);
				}
			}
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
			flare.set(1 - smoothstep(0.05, 0.6, t));
			if (stageT >= LAND_DUR) {
				setStage('settled');
				publishMonitor();
				sceneState.set(4);
				flare.set(0);
				fieldDecade.set(null);
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

		// Fluid. Streaming while we are in the tube, surging through the dive, gone
		// once the machine takes over.
		if (moteMat) {
			const inTube = stage === 'arrive' || stage === 'hover';
			const diving = stage === 'dive';
			const flow = diving ? 1 + 5 * clamp(stageT / DIVE_DUR, 0, 1) : inTube ? 1 : 0;
			const want = inTube ? 1 : diving ? 1 - clamp(stageT / (DIVE_DUR * 0.7), 0, 1) : 0;
			moteMat.uniforms.uOpacity.value +=
				(want - moteMat.uniforms.uOpacity.value) * Math.min(1, dt * 3);
			if (motes) motes.visible = moteMat.uniforms.uOpacity.value > 0.01;
			if (flow > 0) updateMotes(dt, flow);
		}

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
		const overlayVisible = spermActive || (motes && motes.visible);
		if (overlayVisible && spermScene && spermCam) {
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
		renderer.setClearColor(0x0a246a, 0);
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

		// Phase owns the two hand-offs the visitor triggers: 'calculate' (they
		// pressed the button) brings the sperm on, and 'intro' — reached by
		// "go again", or by an out-of-range date that never ran a search —
		// tears everything back down.
		unsubPhase = phase.subscribe((p) => {
			// 'intro' both opens the run (the sperm swims on) and, after "go
			// again", tears the previous one down.
			if (p === 'intro') {
				if (stage !== 'idle') resetScene();
				else beginArrive();
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

		// The store starts at 'intro', so the subscribe above may have run before
		// the sperm's loader was wired up.
		if (get(phase) === 'intro' && stage === 'idle') beginArrive();
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
