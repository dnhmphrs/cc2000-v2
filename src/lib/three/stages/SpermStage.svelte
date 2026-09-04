<script>
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { accentHex } from '$lib/theme';
	import { get } from 'svelte/store';

	// ── The organic half ─────────────────────────────────────────────────────
	// The sperm and the egg, and nothing else. This is deliberately its own
	// component so it can be reworked without touching the machine half: change
	// the model, the egg, the motion or the materials in here and the running
	// order in Scene.svelte is unaffected.
	//
	// It owns its own scene and PERSPECTIVE camera (the machine half is
	// orthographic), and is composited over that half by the parent.
	//
	// Stages it owns:
	//   'fly'    — enters from deep behind the frame and comes forward to station
	//   'hold'   — sits mid-frame turning over, through the text and the questions
	//   'pierce' — drives forward into the egg and is gone

	$: if (spermMat) spermMat.uniforms.uColor.value = accentColorVec($accentHex);

	let scene, camera;

	// ── Staging ──────────────────────────────────────────────────────────────
	const CAM_Z = 6;
	const FLY_FROM_Z = -16; // far behind the frame
	const HOLD_Z = 2.0; // where it settles: forward, mid-frame
	const EGG_Z = -2.2; // the egg sits behind it, on the same axis
	const FLY_DUR = 3.2;
	const PIERCE_DUR = 1.5;

	// How much of the frame width the sperm spans once it is at station. Solved
	// into a scale rather than a distance so it frames the same on any aspect.
	const HOLD_SPAN = 0.44;
	const HOLD_SPAN_PORTRAIT = 0.66;
	const SPERM_SIZE = 1.35; // the model's largest dimension, applied at load

	let spermPivot, spermSpin, spermModel, spermMixer, spermMat;
	let spermReady = false;
	let spermFade = 0;
	let beat = 0; // tail-beat phase: drives the rock, the sway and the surge
	let driftT = 0;
	// The model's own long axis, from its bounding box at load. Rocking about
	// this sweeps the tail through depth; rocking about z would spin the whole
	// cell like a propeller, because z is not its long axis.
	let bodyAxis = new THREE.Vector3(1, 0, 0);

	let egg, eggMat;
	let portrait = false;

	function accentColorVec(hex) {
		return new THREE.Vector3(
			((hex >> 16) & 255) / 255,
			((hex >> 8) & 255) / 255,
			(hex & 255) / 255
		);
	}

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

	// ── The egg ──────────────────────────────────────────────────────────────
	// A placeholder: a soft rim-lit sphere sitting on the axis, so the pierce has
	// something to land in. Swap the geometry and this material for the real one
	// — nothing outside this component depends on either.
	function buildEgg() {
		eggMat = new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uOpacity: { value: 0 },
				uPulse: { value: 0 },
				uColor: { value: accentColorVec(get(accentHex)) }
			},
			vertexShader: `
				varying vec3 vNormal;
				varying vec3 vViewDir;
				void main() {
					vec4 wp = modelMatrix * vec4(position, 1.0);
					vNormal = normalize(normalMatrix * normal);
					vViewDir = normalize(cameraPosition - wp.xyz);
					gl_Position = projectionMatrix * viewMatrix * wp;
				}
			`,
			fragmentShader: `
				uniform float uOpacity;
				uniform float uPulse;
				uniform vec3 uColor;
				varying vec3 vNormal;
				varying vec3 vViewDir;
				void main() {
					// Rim only: bright at the silhouette, clear through the middle, so
					// it reads as a membrane rather than a ball.
					float fres = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.4);
					float a = (fres * 0.85 + 0.03 + uPulse * 0.5) * uOpacity;
					gl_FragColor = vec4(uColor * a, a);
				}
			`
		});
		egg = new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 32), eggMat);
		egg.position.set(0, 0, EGG_Z);
		egg.visible = false;
		scene.add(egg);
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

				// Longest bounding-box side is the body; the rock happens about that.
				const axisIdx = size.x >= size.y && size.x >= size.z ? 0 : size.y >= size.z ? 1 : 2;
				bodyAxis = new THREE.Vector3(
					axisIdx === 0 ? 1 : 0,
					axisIdx === 1 ? 1 : 0,
					axisIdx === 2 ? 1 : 0
				);

				// pivot = where it is and which way it points; spin = the rock about
				// its own length, kept separate so the two never fight.
				spermSpin = new THREE.Group();
				spermSpin.add(spermModel);
				spermPivot = new THREE.Group();
				spermPivot.add(spermSpin);
				spermPivot.visible = false;
				scene.add(spermPivot);

				if (gltf.animations && gltf.animations.length) {
					spermMixer = new THREE.AnimationMixer(spermModel);
					gltf.animations.forEach((clip) => spermMixer.clipAction(clip).play());
				}
				spermReady = true;
			},
			undefined,
			() => {
				spermReady = true; // fail-open: never block the flow on the model
			}
		);
	}

	// ── Motion ───────────────────────────────────────────────────────────────
	// The model is a static mesh — no skin, no clips — so all of this is
	// rigid-body. It ROCKS about its own length rather than rolling right over:
	// a full barrel roll turns a flat curled body edge-on twice a cycle, where it
	// collapses to a line and you cannot read it.
	function applySwim(dt, rate) {
		beat += dt * rate;
		if (spermSpin) spermSpin.setRotationFromAxisAngle(bodyAxis, Math.sin(beat) * 0.62);
	}

	// Nose sway, on periods that don't divide into the rock.
	const sway = (amount) => ({
		x: Math.sin(beat * 0.63) * 0.1 * amount,
		y: Math.PI + Math.sin(beat * 0.44) * 0.2 * amount
	});

	// It gains on each beat and coasts between — the propulsion cue.
	const surge = () => Math.sin(beat * 2) * 0.11;

	// Scale that makes it span the intended fraction of the frame at station.
	function holdScale() {
		if (!camera) return 1;
		const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
		const frameW = 2 * tanHalf * (CAM_Z - HOLD_Z) * Math.max(camera.aspect, 0.05);
		return ((portrait ? HOLD_SPAN_PORTRAIT : HOLD_SPAN) * frameW) / SPERM_SIZE;
	}

	// ── Parent API ───────────────────────────────────────────────────────────
	export function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.01, 100);
		camera.position.set(0, 0, CAM_Z);
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
		beat = 0;
		driftT = 0;
		spermFade = 0;
		if (spermPivot) spermPivot.visible = false;
		if (spermMat) spermMat.uniforms.uOpacity.value = 0;
		if (egg) egg.visible = false;
		if (eggMat) {
			eggMat.uniforms.uOpacity.value = 0;
			eggMat.uniforms.uPulse.value = 0;
		}
	}

	// True on the frame the stage it owns finishes.
	export function update(dt, stage, stageT, mouse) {
		if (!camera) return false;
		let done = false;

		const flying = stage === 'fly';
		const holding = stage === 'hold';
		const piercing = stage === 'pierce';
		const live = flying || holding || piercing;

		if (live && spermReady && spermPivot) spermPivot.visible = true;
		if (spermPivot) spermPivot.scale.setScalar(holdScale());

		if (flying) {
			driftT += dt;
			applySwim(dt, 3.4);
			const t = easeInOutCubic(clamp(stageT / FLY_DUR, 0, 1));
			if (spermPivot) {
				const s = sway(1);
				// Straight down the axis, out of the far dark and into the frame.
				spermPivot.position.set(0, 0, lerp(FLY_FROM_Z, HOLD_Z, t));
				spermPivot.rotation.set(s.x, s.y, 0);
			}
			// Comes up out of nothing rather than popping in at the far plane.
			spermFade = clamp(stageT / (FLY_DUR * 0.45), 0, 1) * 0.85;
			if (stageT >= FLY_DUR) done = true;
		}

		if (holding) {
			driftT += dt;
			applySwim(dt, 3.0);
			if (spermPivot) {
				const s = sway(1);
				spermPivot.position.set(
					Math.sin(driftT * 0.34) * 0.1 + (mouse?.x ?? 0) * 0.07,
					Math.sin(driftT * 0.47) * 0.08 - (mouse?.y ?? 0) * 0.05,
					HOLD_Z + Math.sin(driftT * 0.23) * 0.14 + surge()
				);
				spermPivot.rotation.set(s.x - (mouse?.y ?? 0) * 0.06, s.y + (mouse?.x ?? 0) * 0.09, 0);
			}
			spermFade += (0.85 - spermFade) * Math.min(1, dt * 1.6);
		}

		if (piercing) {
			applySwim(dt, 3.0 + 7.0 * clamp(stageT / PIERCE_DUR, 0, 1));
			const t = clamp(stageT / PIERCE_DUR, 0, 1);
			// Accelerating: gentle push, then committed.
			const eased = Math.pow(t, 1.6);
			if (spermPivot) {
				const s = sway(1 - t * 0.6);
				spermPivot.position.set(0, 0, lerp(HOLD_Z, EGG_Z, eased));
				spermPivot.rotation.set(s.x, s.y, 0);
			}
			// Dissolves into the membrane rather than punching out the far side.
			spermFade = 0.85 * (1 - clamp((eased - 0.72) / 0.28, 0, 1));
			if (stageT >= PIERCE_DUR) done = true;
		}

		if (!live) spermFade += (0 - spermFade) * Math.min(1, dt * 4);

		// The egg only exists for the pierce. The opening is meant to be the sperm
		// on a blank background and nothing else, so it is not telegraphed.
		if (eggMat) {
			const want = piercing ? 0.85 : 0;
			eggMat.uniforms.uOpacity.value +=
				(want - eggMat.uniforms.uOpacity.value) * Math.min(1, dt * (piercing ? 5 : 3));
			const hit = piercing ? Math.pow(clamp(stageT / PIERCE_DUR, 0, 1), 6) : 0;
			eggMat.uniforms.uPulse.value = hit;
			if (egg) {
				egg.visible = eggMat.uniforms.uOpacity.value > 0.01;
				egg.rotation.y += dt * 0.12;
				const swellS = 1 + hit * 0.16;
				egg.scale.setScalar(swellS);
			}
		}

		if (spermMat) {
			spermMat.uniforms.uOpacity.value = spermFade;
			spermMat.uniforms.uTime.value += dt;
		}
		if (spermMixer) spermMixer.update(dt);
		if (spermPivot) spermPivot.visible = spermFade > 0.005;

		return done;
	}

	export function isBusy() {
		return spermFade > 0.005 || (eggMat && eggMat.uniforms.uOpacity.value > 0.01);
	}

	export function render(r) {
		if (!scene || !camera) return;
		r.render(scene, camera);
	}

	export function dispose() {
		if (spermModel) {
			spermModel.traverse((o) => {
				if (o.geometry) o.geometry.dispose();
			});
		}
		if (egg) {
			egg.geometry.dispose();
			eggMat.dispose();
		}
		if (spermMat) spermMat.dispose();
	}
</script>
