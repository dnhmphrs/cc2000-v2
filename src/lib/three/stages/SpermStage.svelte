<script>
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { lerp, clamp } from '$lib/functions/utils';

	// ── The organic half ─────────────────────────────────────────────────────
	// The sperm and the egg, and nothing else. Its own scene and PERSPECTIVE
	// camera; the parent owns the renderer and the running order and composites
	// this over the machine half.
	//
	// Stages it owns:
	//   'fly'      — comes past the camera from behind it and settles at A
	//   'hold'     — holds at A, spinning, while the intro text is read
	//   'approach' — swims A → B; the egg comes out of the fog
	//   'wait1'    — holds at B while the birthday is asked
	//   'approach2'— swims B → C, closer in
	//   'wait2'    — holds at C while the spice is asked
	//   'pierce'   — drives into the egg

	// A narrower lens than a wide-angle: less distortion, and the egg reads much
	// larger for the same geometry, which is what makes the approach feel like an
	// approach.
	const FOV = 40;
	// The camera holds still for the fly-in, then follows the sperm forward, so
	// the egg grows into the frame as it is closed on rather than sitting at a
	// constant size.
	const CAM_HOME = 6;
	const CAM_AT_B = 4.6;
	const CAM_AT_C = 2.7;
	const CAM_AT_EGG = 1.0;
	// It starts BEHIND the camera and comes past you into the frame, rather than
	// receding away from you into it.
	const FLY_FROM_Z = 8.6;
	const STATION_A = 2.0;
	const STATION_B = 0.8;
	const STATION_C = -0.9;
	const EGG_Z = -3.0;
	const EGG_R = 1.5;

	const FLY_DUR = 2.8;
	const APPROACH_DUR = 1.6;
	const APPROACH2_DUR = 1.4;
	const PIERCE_DUR = 1.35;

	// Clockwise as seen from the camera. Half a turn a second — two was a blur.
	const SPIN_HZ = 0.5;

	// Fraction of the frame width it spans at station A; it grows from there as
	// it comes in, which is the whole point of the approaches.
	const HOLD_SPAN = 0.44;
	const HOLD_SPAN_PORTRAIT = 0.66;
	const SPERM_SIZE = 1.35;

	// The fog does double duty: it hides the egg until it is close enough to
	// matter, and it is what makes the field read as depth rather than flat blue.
	const FOG_COLOR = 0x16357f;
	const FOG_DENSITY = 0.06;

	let scene, camera;
	let spermPivot, spermSpin, spermModel, spermMat;
	let spermReady = false;
	let spermFade = 0;
	let spin = 0;
	let driftT = 0;
	let portrait = false;

	let eggGroup, eggShell, eggShellMat, eggCore, eggCoreMat, rimLight;
	let eggFade = 0;
	// 0..1 — how far into the egg it is. Read by the parent for the white-out;
	// a plain getter, because an `export let` is a prop and cannot be read off a
	// component instance without accessors.
	let hit = 0;

	// Where it sits for each stage, so the approaches are one lerp each.
	const stationOf = (stage) =>
		stage === 'wait2' || stage === 'pierce' ? STATION_C : stage === 'wait1' ? STATION_B : STATION_A;

	const camOf = (stage) =>
		stage === 'wait2' || stage === 'pierce' ? CAM_AT_C : stage === 'wait1' ? CAM_AT_B : CAM_HOME;

	// ── Materials ────────────────────────────────────────────────────────────
	function createSpermMaterial() {
		return new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			wireframe: true,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 0 },
				uColor: { value: new THREE.Vector3(0.86, 0.88, 0.95) },
				// Custom shader, so scene.fog does not reach it — the same
				// exponential is applied by hand to keep it in the same air.
				uFogColor: { value: new THREE.Color(FOG_COLOR) },
				uFogDensity: { value: FOG_DENSITY }
			},
			vertexShader: `
				varying vec3 vNormal;
				varying vec3 vViewDir;
				varying vec3 vWorldPos;
				varying float vDepth;
				void main() {
					vec4 wp = modelMatrix * vec4(position, 1.0);
					vWorldPos = wp.xyz;
					vNormal = normalize(normalMatrix * normal);
					vViewDir = normalize(cameraPosition - wp.xyz);
					vec4 mv = viewMatrix * wp;
					vDepth = -mv.z;
					gl_Position = projectionMatrix * mv;
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform float uOpacity;
				uniform vec3 uColor;
				uniform vec3 uFogColor;
				uniform float uFogDensity;
				varying vec3 vNormal;
				varying vec3 vViewDir;
				varying vec3 vWorldPos;
				varying float vDepth;
				void main() {
					float scan = sin(vWorldPos.y * 22.0 - uTime * 0.9) * 0.5 + 0.5;
					scan = smoothstep(0.3, 0.75, scan);
					float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);
					vec3 col = uColor + vec3(0.12) * fres;
					float a = (0.24 + scan * 0.12 + fres * 0.24) * uOpacity;
					float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
					col = mix(col, uFogColor, fog);
					a *= 1.0 - fog * 0.85;
					gl_FragColor = vec4(col * a, a);
				}
			`
		});
	}

	// ── The egg ──────────────────────────────────────────────────────────────
	// Two spheres. Outer is physical and glossy — a wet, plasticky shell that
	// takes the highlights. Inner is Lambert: matte, unlit-cheap, and it gives
	// the shell something to sit in front of so it doesn't read as an empty
	// bubble.
	function buildEgg() {
		eggShellMat = new THREE.MeshPhysicalMaterial({
			color: 0xdfe6ff,
			transparent: true,
			opacity: 0,
			roughness: 0.12,
			metalness: 0.0,
			clearcoat: 1.0,
			clearcoatRoughness: 0.08,
			side: THREE.DoubleSide,
			depthWrite: false,
			fog: true
		});
		eggCoreMat = new THREE.MeshLambertMaterial({
			color: 0x9fb2e8,
			transparent: true,
			opacity: 0,
			fog: true
		});

		eggShell = new THREE.Mesh(new THREE.SphereGeometry(EGG_R, 48, 32), eggShellMat);

		// The core is displaced into a lumpy blob at build time. A perfect sphere
		// rotating is invisible — there is nothing on it to move — so this is what
		// makes the turn read, and it looks more like a cell than a ball besides.
		const coreGeo = new THREE.SphereGeometry(EGG_R * 0.82, 64, 40);
		const cp = coreGeo.attributes.position;
		const v = new THREE.Vector3();
		for (let i = 0; i < cp.count; i++) {
			v.fromBufferAttribute(cp, i);
			const n = v.clone().normalize();
			const bump =
				1 +
				0.06 * Math.sin(n.x * 5.1 + 1.3) * Math.cos(n.y * 4.3) +
				0.045 * Math.sin(n.z * 6.7 + 2.1) +
				0.03 * Math.cos(n.x * 9.2 + n.y * 7.4);
			v.multiplyScalar(bump);
			cp.setXYZ(i, v.x, v.y, v.z);
		}
		coreGeo.computeVertexNormals();
		eggCore = new THREE.Mesh(coreGeo, eggCoreMat);

		eggGroup = new THREE.Group();
		eggGroup.add(eggCore);
		eggGroup.add(eggShell);
		eggGroup.position.set(0, 0, EGG_Z);
		eggGroup.visible = false;
		scene.add(eggGroup);

		// Enough light for the physical shell to have a shape. Cheap: no shadows,
		// no environment map.
		const key = new THREE.DirectionalLight(0xffffff, 1.15);
		key.position.set(-3, 4, 5);
		rimLight = new THREE.PointLight(0x9ab8ff, 14, 26);
		rimLight.position.set(3.5, -1.5, EGG_Z + 3);
		scene.add(key, rimLight, new THREE.AmbientLight(0x4a63b8, 0.55));
	}

	function loadSperm() {
		spermMat = createSpermMaterial();
		const loader = new GLTFLoader();
		loader.load(
			'/sperm.glb',
			(gltf) => {
				spermModel = gltf.scene;
				const box = new THREE.Box3().setFromObject(spermModel);
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());
				const s = SPERM_SIZE / Math.max(size.x, size.y, size.z);
				spermModel.scale.setScalar(s);
				spermModel.position.set(-center.x * s, -center.y * s, -center.z * s);
				spermModel.traverse((c) => {
					if (c.isMesh) c.material = spermMat;
				});

				// spin = the roll about the view axis; pivot = where it is.
				spermSpin = new THREE.Group();
				spermSpin.add(spermModel);
				spermPivot = new THREE.Group();
				spermPivot.add(spermSpin);
				spermPivot.rotation.y = Math.PI;
				spermPivot.visible = false;
				scene.add(spermPivot);
				spermReady = true;
			},
			undefined,
			() => {
				spermReady = true; // fail-open: never block the flow on the model
			}
		);
	}

	// Fixed, measured once against the home camera at station A. Recomputing it
	// per frame would normalise the approach away — it would stay the same size
	// on screen however close it got.
	function baseScale() {
		if (!camera) return 1;
		const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
		const frameW = 2 * tanHalf * (CAM_HOME - STATION_A) * Math.max(camera.aspect, 0.05);
		return ((portrait ? HOLD_SPAN_PORTRAIT : HOLD_SPAN) * frameW) / SPERM_SIZE;
	}

	// ── Parent API ───────────────────────────────────────────────────────────
	export function init() {
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);
		camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.01, 100);
		camera.position.set(0, 0, CAM_HOME);
		camera.lookAt(0, 0, 0);
		buildEgg();
		loadSperm();
	}

	export function resize() {
		if (!camera) return;
		portrait = window.innerHeight > window.innerWidth;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}

	export function reset() {
		spin = 0;
		driftT = 0;
		spermFade = 0;
		eggFade = 0;
		if (spermPivot) spermPivot.visible = false;
		if (spermMat) spermMat.uniforms.uOpacity.value = 0;
		if (eggGroup) {
			eggGroup.visible = false;
			eggGroup.scale.setScalar(1);
		}
		if (eggShellMat) eggShellMat.opacity = 0;
		if (eggCoreMat) eggCoreMat.opacity = 0;
	}

	// True on the frame the stage it owns finishes.
	export function update(dt, stage, stageT, mouse) {
		if (!camera) return false;
		let done = false;
		driftT += dt;

		// Clockwise, from the camera's point of view, at a steady 2 Hz. Constant
		// through every stage — it is the one thing that never stops.
		spin -= dt * SPIN_HZ * Math.PI * 2;
		if (spermSpin) spermSpin.rotation.z = spin;

		const live = ['fly', 'hold', 'approach', 'wait1', 'approach2', 'wait2', 'pierce'].includes(
			stage
		);
		if (live && spermReady && spermPivot) spermPivot.visible = true;

		let z = stationOf(stage);
		let camZ = camOf(stage);
		hit = 0;

		if (stage === 'fly') {
			const t = clamp(stageT / FLY_DUR, 0, 1);
			// Ease-out: it comes past the camera fast, then settles.
			z = lerp(FLY_FROM_Z, STATION_A, 1 - Math.pow(1 - t, 3));
			spermFade = clamp((stageT - 0.15) / 0.7, 0, 1) * 0.9;
			if (stageT >= FLY_DUR) done = true;
		} else if (stage === 'approach') {
			const t = clamp(stageT / APPROACH_DUR, 0, 1);
			const e = t * t * (3 - 2 * t);
			z = lerp(STATION_A, STATION_B, e);
			camZ = lerp(CAM_HOME, CAM_AT_B, e);
			if (stageT >= APPROACH_DUR) done = true;
		} else if (stage === 'approach2') {
			const t = clamp(stageT / APPROACH2_DUR, 0, 1);
			const e = t * t * (3 - 2 * t);
			z = lerp(STATION_B, STATION_C, e);
			camZ = lerp(CAM_AT_B, CAM_AT_C, e);
			if (stageT >= APPROACH2_DUR) done = true;
		} else if (stage === 'pierce') {
			const t = clamp(stageT / PIERCE_DUR, 0, 1);
			const eased = Math.pow(t, 1.7);
			z = lerp(STATION_C, EGG_Z, eased);
			camZ = lerp(CAM_AT_C, CAM_AT_EGG, eased);
			hit = clamp((eased - 0.68) / 0.32, 0, 1);
			// Gone inside the shell.
			spermFade = 0.9 * (1 - hit);
			if (stageT >= PIERCE_DUR) done = true;
		} else if (live) {
			spermFade += (0.9 - spermFade) * Math.min(1, dt * 2);
		} else {
			spermFade += (0 - spermFade) * Math.min(1, dt * 4);
		}

		camera.position.z = camZ;

		if (spermPivot) {
			spermPivot.scale.setScalar(baseScale());
			// A little life in the hold, and a nudge from the cursor. No wobble in
			// the body itself — the spin carries the motion.
			const idle = stage === 'hold' || stage === 'wait1' || stage === 'wait2';
			const ax = idle ? Math.sin(driftT * 0.4) * 0.07 + (mouse?.x ?? 0) * 0.09 : 0;
			const ay = idle ? Math.sin(driftT * 0.53) * 0.05 - (mouse?.y ?? 0) * 0.07 : 0;
			spermPivot.position.set(ax, ay, z);
		}

		// The egg comes out of the fog on the first approach and stays.
		const eggWanted = ['approach', 'wait1', 'approach2', 'wait2', 'pierce'].includes(stage);
		eggFade += ((eggWanted ? 1 : 0) - eggFade) * Math.min(1, dt * 1.6);
		if (eggGroup) {
			eggGroup.visible = eggFade > 0.01;
			eggGroup.scale.setScalar(1 + hit * 0.12);
			// The lumpy core turns; the glassy shell barely does. Two rates, so
			// there is something moving in the frame that isn't the sperm.
			if (eggCore) {
				eggCore.rotation.y += dt * 0.5;
				eggCore.rotation.x += dt * 0.17;
			}
			if (eggShell) eggShell.rotation.y -= dt * 0.09;
		}
		// The highlight travels slowly across the shell.
		if (rimLight) {
			rimLight.position.set(
				Math.cos(driftT * 0.32) * 4.2,
				Math.sin(driftT * 0.23) * 2.4,
				EGG_Z + 3.2
			);
		}
		if (eggShellMat) eggShellMat.opacity = eggFade * 0.5;
		if (eggCoreMat) eggCoreMat.opacity = eggFade * 0.85;

		if (spermMat) {
			spermMat.uniforms.uOpacity.value = spermFade;
			spermMat.uniforms.uTime.value += dt;
		}
		if (spermPivot) spermPivot.visible = spermFade > 0.005;

		return done;
	}

	export function getHit() {
		return hit;
	}

	export function isBusy() {
		return spermFade > 0.005 || eggFade > 0.01;
	}

	export function render(r) {
		if (scene && camera) r.render(scene, camera);
	}

	export function dispose() {
		spermModel?.traverse((o) => o.geometry && o.geometry.dispose());
		eggShell?.geometry.dispose();
		eggCore?.geometry.dispose();
		eggShellMat?.dispose();
		eggCoreMat?.dispose();
		spermMat?.dispose();
	}
</script>
