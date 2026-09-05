<script>
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { lerp, clamp } from '$lib/functions/utils';

	// ── The organic half ─────────────────────────────────────────────────────
	// The sperm and the egg, and nothing else. Its own scene and PERSPECTIVE
	// camera; the parent owns the renderer and the running order and composites
	// this over the machine half.
	//
	// One stage, 'dive': both questions are answered on the machine before this
	// runs, so there is nothing to stop for. The sperm overtakes the camera,
	// runs out ahead, and drives straight into the egg in a single move.

	// A narrower lens than a wide-angle: less distortion, and the egg reads much
	// larger for the same geometry, which is what makes the approach feel like an
	// approach.
	const FOV = 40;
	// The camera holds still while it is overtaken, then follows it forward, so
	// the egg grows into the frame as it is closed on. The sperm keeps roughly a
	// constant size throughout — you are travelling with it, not watching it go.
	const CAM_HOME = 6;
	const CAM_AT_EGG = 1.0;
	// Starts behind the camera and OFF the axis, so it sweeps past the corner of
	// the frame and runs out ahead — 2001, not a dot growing in the middle.
	// Passing exactly through the camera point is degenerate (distance zero, so
	// one frame of infinite magnification), which is why it is offset.
	const FLY_FROM = { x: 2.4, y: -1.15, z: 8.8 };
	const STATION_A = 2.0;
	const EGG_Z = -3.0;
	const EGG_R = 1.5;

	const DIVE_DUR = 4.6;
	// Fraction of the dive spent overtaking. The overtake eases out to rest and
	// the run in eases out of rest, so the two halves join without a stop.
	const PASS_T = 0.26;

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
	// The core's depth comes from a painted ramp rather than from bumps.
	//
	// Vertical, not radial: a sphere's UVs wrap in u, so any gradient that isn't
	// symmetric across the texture's left and right edges leaves a seam running
	// pole to pole. A top-to-bottom ramp has identical columns everywhere, so it
	// wraps invisibly — and it reads as lit from above, which is what is wanted.
	function gradientTexture() {
		const c = document.createElement('canvas');
		c.width = 4;
		c.height = 256;
		const g = c.getContext('2d');
		const grad = g.createLinearGradient(0, 0, 0, 256);
		grad.addColorStop(0, '#f4f7ff');
		grad.addColorStop(0.3, '#d6dff6');
		grad.addColorStop(0.62, '#93a4d4');
		grad.addColorStop(1, '#333f72');
		g.fillStyle = grad;
		g.fillRect(0, 0, 4, 256);
		const tex = new THREE.CanvasTexture(c);
		tex.encoding = THREE.sRGBEncoding;
		tex.wrapS = THREE.RepeatWrapping;
		return tex;
	}

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
			color: 0xffffff, // the gradient map carries the colour
			transparent: true,
			opacity: 0,
			fog: true
		});

		eggShell = new THREE.Mesh(new THREE.SphereGeometry(EGG_R, 48, 32), eggShellMat);

		// Smooth, not lumpy. The volume comes from the painted gradient instead —
		// a bright pole falling away to a deep shadowed edge.
		eggCoreMat.map = gradientTexture();
		eggCore = new THREE.Mesh(new THREE.SphereGeometry(EGG_R * 0.82, 48, 32), eggCoreMat);

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

		const live = stage === 'dive';
		if (live && spermReady && spermPivot) spermPivot.visible = true;

		let z = STATION_A;
		let camZ = CAM_HOME;
		let flyX = 0;
		let flyY = 0;
		let sway = 0;
		hit = 0;

		if (live) {
			const t = clamp(stageT / DIVE_DUR, 0, 1);
			if (t < PASS_T) {
				// Overtake. Fast past the lens, easing out as it runs ahead.
				const u = t / PASS_T;
				const e = 1 - Math.pow(1 - u, 3);
				z = lerp(FLY_FROM.z, STATION_A, e);
				flyX = lerp(FLY_FROM.x, 0, e);
				flyY = lerp(FLY_FROM.y, 0, e);
				// Nothing to see until it is clear of the camera's near field.
				spermFade = clamp((CAM_HOME - z - 0.7) / 1.6, 0, 1) * 0.9;
			} else {
				// The run in. One accelerating curve from ahead of the lens all the
				// way into the egg, with the camera following it down.
				const u = (t - PASS_T) / (1 - PASS_T);
				const e = Math.pow(u, 1.8);
				z = lerp(STATION_A, EGG_Z, e);
				camZ = lerp(CAM_HOME, CAM_AT_EGG, e);
				hit = clamp((e - 0.7) / 0.3, 0, 1);
				// Gone inside the shell.
				spermFade = 0.9 * (1 - hit);
			}
			// Cursor sway early on, gone by the time it is lining up the egg.
			sway = clamp((1 - t) / 0.4, 0, 1);
			if (stageT >= DIVE_DUR) done = true;
		} else {
			spermFade += (0 - spermFade) * Math.min(1, dt * 4);
		}

		camera.position.z = camZ;

		if (spermPivot) {
			spermPivot.scale.setScalar(baseScale());
			// A nudge from the cursor and a slow drift, so the run in is not on
			// rails. No wobble in the body itself — the spin carries the motion.
			const ax = (Math.sin(driftT * 0.7) * 0.05 + (mouse?.x ?? 0) * 0.14) * sway;
			const ay = (Math.sin(driftT * 0.9) * 0.04 - (mouse?.y ?? 0) * 0.1) * sway;
			spermPivot.position.set(ax + flyX, ay + flyY, z);
		}

		// The egg comes out of the fog as soon as the dive starts, and stays.
		eggFade += ((live ? 1 : 0) - eggFade) * Math.min(1, dt * 1.6);
		if (eggGroup) {
			eggGroup.visible = eggFade > 0.01;
			eggGroup.scale.setScalar(1 + hit * 0.12);
			// The graded core turns under the glassy shell: the gradient sweeping
			// round is what shows the movement now the surface is smooth.
			if (eggCore) {
				// Tipping is what moves a vertical ramp; spinning about y would slide
				// it along the seam-free axis and show nothing.
				eggCore.rotation.z = Math.sin(driftT * 0.22) * 0.4;
				eggCore.rotation.x = Math.sin(driftT * 0.17) * 0.3;
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
