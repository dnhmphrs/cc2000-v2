import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createEgg } from './egg';
import { holoMaterial, ADD } from './materials';
import { TUNNEL, AIR, HOLO } from '$lib/config';
import { rand } from '$lib/random';

// ── The tunnel ───────────────────────────────────────────────────────────────
// The place the fly-in happens. BLACK air, an ovum three hundred units down it,
// ONE sperm riding the lens, and a field of motes streaming past.
//
// This file BUILDS. FlyIn.svelte MOVES — it never creates anything. Every
// dimension is in config/space.js under TUNNEL.
//
// ── What this is a picture of ────────────────────────────────────────────────
// Not a cell. The inside of a machine that is DRAWING a cell. Everything here is
// line-work: the ovum is two spheres — a dark occluding core inside a gold wire
// cage — and the sperm is a wireframe hologram. See world/materials.js; nothing
// in this site is lit and nothing is glossy.
//
// It is BLACK AND GOLD, like the two scenes after it, and the swimmer and the
// debris are the only cold things in it. That is the whole colour scheme of the
// middle of the run: blue goes into gold, and after the conception there is no
// blue left.
//
// ── Why there is anything in the air at all ──────────────────────────────────
// The camera covers 300 world units. With nothing between it and the ovum,
// all of them read as ZERO: the globe simply gets larger, and a shape that grows
// in the middle of an empty frame is a zoom, not a flight. The motes are what
// turn it into travel — they have parallax, they streak as they pass, and they
// are the only reason the fog reads as distance rather than as a wash. One draw
// call.
//
// The air changes colour across the run — AIR for the approach, walking down to
// the VOID as it arrives, so the frame this scene ends on is the frame the
// conception opens on. Fog and backdrop are one value: set it with setAir(),
// read it back with getAir(), and let the backdrop paint that.

// ── The motes ────────────────────────────────────────────────────────────────
// One LineSegments, one draw call. Each mote is a short segment lying along the
// flight axis, so it renders as a DOT when it is far off and a STREAK when it is
// passing the lens — the length is free, it is just perspective doing its job.
//
// They are not placed in the world: they are placed relative to the CAMERA and
// wrap. `aPhase` is a mote's place in the queue, and the shader folds it into
// the slab of air just in front of the lens, so the field is equally dense at
// every point of a 230-unit flight for the price of a few hundred segments.
// Nothing is animated on the CPU; the whole field moves because uCamZ moves.
function createMotes() {
	const n = TUNNEL.motes;
	const pos = new Float32Array(n * 6);
	const phase = new Float32Array(n * 2);
	const end = new Float32Array(n * 2);
	const seed = new Float32Array(n * 2);

	for (let i = 0; i < n; i++) {
		// Uniform in the disc, so the field does not clump on the axis where it
		// would sit on top of the sperm.
		const a = rand() * Math.PI * 2;
		const r = Math.sqrt(rand()) * TUNNEL.moteRadius;
		const x = Math.cos(a) * r;
		const y = Math.sin(a) * r;
		const z = rand() * TUNNEL.moteSpan;
		const s = rand();

		for (let k = 0; k < 2; k++) {
			pos[i * 6 + k * 3] = x;
			pos[i * 6 + k * 3 + 1] = y;
			pos[i * 6 + k * 3 + 2] = 0;
			phase[i * 2 + k] = z;
			end[i * 2 + k] = k;
			seed[i * 2 + k] = s;
		}
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
	geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
	geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

	const mat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		...ADD,
		uniforms: {
			uCamZ: { value: TUNNEL.camStart },
			uSpan: { value: TUNNEL.moteSpan },
			uLen: { value: TUNNEL.moteLength },
			uOpacity: { value: 0 },
			// 0..1 — how much of the FIELD exists yet, as opposed to how brightly
			// it is drawn. See the note by the switch-on in the vertex shader.
			uReveal: { value: 0 },
			uInk: { value: new THREE.Color(HOLO.mote) },
			uFogDensity: { value: TUNNEL.fogDensity }
		},
		vertexShader: `
			attribute float aPhase;
			attribute float aEnd;
			attribute float aSeed;
			uniform float uCamZ;
			uniform float uSpan;
			uniform float uLen;
			uniform float uReveal;
			varying float vFade;
			varying float vFog;
			void main() {
				// Fold the mote into the slab of air ahead of the lens. mod() keeps
				// it there however far the camera travels, so the field never runs
				// out and never has to be rebuilt.
				float d = mod(aPhase - uCamZ, uSpan);
				// A little behind the lens, so nothing pops into existence at it.
				float z = uCamZ + 4.0 - d;
				// The far end of the segment is the trailing one: a streak points
				// back the way it came.
				z += aEnd * uLen * (0.6 + aSeed);

				vec4 mv = modelViewMatrix * vec4(position.xy, z, 1.0);
				vFog = -mv.z;
				// Off at both ends of its life: it arrives out of the far dark and
				// slips away at the lens rather than blinking out on it.
				vFade = smoothstep(0.0, 12.0, d) * (1.0 - smoothstep(uSpan * 0.78, uSpan, d));
				vFade *= 0.35 + aSeed * 0.65;
				// ── THE FIELD ARRIVES PIECEMEAL ──────────────────────────────
				// Each mote switches on at its OWN point in uReveal, keyed to the
				// seed it already carries, so the air fills in mote by mote in a
				// scattered order. Fading the whole field up together reads as a
				// dissolve INTO the scene — which is what it was when the scene
				// opened behind a calculator and had a cut to hide. There is no cut
				// now: the flight is already running under the title card, so what
				// this has to look like is weather developing around the swimmer.
				vFade *= smoothstep(aSeed * 0.8, aSeed * 0.8 + 0.22, uReveal);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform float uOpacity;
			uniform vec3 uInk;
			uniform float uFogDensity;
			varying float vFade;
			varying float vFog;
			void main() {
				float fog = 1.0 - exp(-uFogDensity * uFogDensity * vFog * vFog);
				float a = vFade * uOpacity * (1.0 - fog * 0.96);
				gl_FragColor = vec4(uInk * a, a);
			}
		`
	});

	const lines = new THREE.LineSegments(geo, mat);
	// The wrap happens in the shader, so three.js cannot know where these end up.
	lines.frustumCulled = false;
	return { lines, mat, geo };
}

export function createTunnel() {
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(AIR, TUNNEL.fogDensity);
	let air = AIR;

	const camera = new THREE.PerspectiveCamera(
		TUNNEL.fov,
		window.innerWidth / window.innerHeight,
		TUNNEL.near,
		TUNNEL.far
	);
	camera.position.z = TUNNEL.camStart;

	// Two spheres: the cage at shellR, and the core inside it — which is the one
	// that occludes, the one the wave runs on, and the one the conception picks
	// up when this scene ends. See world/egg.js.
	const egg = createEgg(TUNNEL.shellR, { core: TUNNEL.coreRatio });
	egg.group.position.z = TUNNEL.eggZ;
	scene.add(egg.group);

	// The glow it comes up out of. A flat disc, well behind the globe and much
	// larger than it, additively blended — there is no light in this scene, so
	// without this the ovum arrives as a diagram pasted onto the fog rather than
	// as something with its own presence in it. It is GOLD, and it is the first
	// gold in the run: for the first four seconds of the fly-in it is all there
	// is of the thing you are travelling toward.
	const haloMat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		depthTest: false,
		...ADD,
		uniforms: {
			uInk: { value: new THREE.Color(HOLO.halo) },
			uOpacity: { value: 0 }
		},
		vertexShader: `
			varying vec2 vP;
			void main() {
				vP = uv * 2.0 - 1.0;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform vec3 uInk;
			uniform float uOpacity;
			varying vec2 vP;
			void main() {
				float r = length(vP);
				float a = exp(-r * r * 5.5) * uOpacity;
				gl_FragColor = vec4(uInk * a, a);
			}
		`
	});
	const halo = new THREE.Mesh(
		new THREE.PlaneGeometry(TUNNEL.shellR * TUNNEL.haloSpread, TUNNEL.shellR * TUNNEL.haloSpread),
		haloMat
	);
	halo.position.z = TUNNEL.eggZ - TUNNEL.shellR * 1.2;
	halo.renderOrder = -1;
	scene.add(halo);

	const motes = createMotes();
	scene.add(motes.lines);

	// ── The sperm ────────────────────────────────────────────────────────────
	// ONE, riding a couple of units in front of the lens, pointing AWAY, and
	// ROLLING ABOUT ITS OWN LONG AXIS — which is the axis you are looking down.
	// So what you see is the tail's curl whipping round, end-on, at one and a
	// half turns a second. That is V1's move; see TUNNEL.spermOffset in
	// config/space.js for why `position.y -= 0.695` in that file is a body being
	// dropped ONTO the pivot rather than hung off it.
	//
	// Two groups:
	//   sperm     where it is. Driven by FlyIn against the camera, not the world.
	//   spinner   turns about z at ten radians a second, linear, forever.
	//
	// and the model sits in the spinner, recentred, with the small eccentricity
	// V1 has left over — thirteen percent of a body-width, which is the wobble.
	//
	// How big it reads is a fraction of the FRAME, not a scale factor on a model
	// whose file we do not control: the mesh is normalised (centred on its own
	// bounding box, cross-section scaled) and sized against the frame's
	// half-height at the riding distance. Measured ONCE, from the lens the scene
	// opens on — recomputing it per frame would normalise the approach away.
	const RIDE_HALF = TUNNEL.spermLead * Math.tan((TUNNEL.fovStart * Math.PI) / 360);
	const bodyHeight = TUNNEL.spermSpan * RIDE_HALF * 2;

	const spermMaterial = holoMaterial({
		ink: HOLO.body,
		accent: HOLO.rim,
		fog: AIR,
		fogDensity: TUNNEL.fogDensity,
		rings: TUNNEL.spermRings,
		longs: TUNNEL.spermLongs,
		gain: TUNNEL.spermGain
	});

	const sperm = new THREE.Group();
	const spinner = new THREE.Group();
	sperm.add(spinner);
	sperm.visible = false;
	scene.add(sperm);

	// The riding distance is COMPENSATED for the lens: the scene widens from 28
	// to 40 degrees, and a body at a fixed distance through that would shrink by
	// a third. Pulling it in as the lens opens holds it in the frame, so the only
	// thing in the shot that changes size is the thing you are travelling toward.
	let lead = TUNNEL.spermLead;

	new GLTFLoader().load('/sperm.glb', (glb) => {
		const model = glb.scene.children[0] ?? glb.scene;
		// The file's own origin is nowhere near the body and its axes are its own,
		// so nothing can be positioned against it directly. Head down -Z, away
		// from the camera, which is the way it swims.
		model.rotation.x += Math.PI;
		model.traverse((child) => {
			if (child.material) child.material = spermMaterial;
		});

		// The contour set is drawn in GEOMETRY space, so it needs the body's own
		// long axis and midpoint there — which is the mesh's bounding box before
		// any of the object transforms above.
		model.traverse((child) => {
			if (!child.isMesh) return;
			child.geometry.computeBoundingBox();
			const gb = child.geometry.boundingBox;
			const gs = gb.getSize(new THREE.Vector3());
			const axis = gs.x > gs.y && gs.x > gs.z ? 'x' : gs.y > gs.z ? 'y' : 'z';
			const A = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
			const rest = ['x', 'y', 'z'].filter((k) => k !== axis);
			spermMaterial.uniforms.uAxis.value.set(...A[axis]);
			spermMaterial.uniforms.uSide.value.set(...A[rest[0]]);
			spermMaterial.uniforms.uUp.value.set(...A[rest[1]]);
			spermMaterial.uniforms.uCentre.value.copy(gb.getCenter(new THREE.Vector3()));
		});

		const inner = new THREE.Group();
		inner.add(model);
		inner.updateMatrixWorld(true);
		const box = new THREE.Box3().setFromObject(model);
		const size = box.getSize(new THREE.Vector3());
		model.position.sub(box.getCenter(new THREE.Vector3()));
		// Normalised on the CROSS-SECTION HEIGHT, not the longest dimension. The
		// body points along z — straight away from the camera — so its length is
		// the one axis that is almost entirely foreshortened; sizing by it made the
		// thing a third of the size it was asked to be. What `spermSpan` means is
		// how much of the frame it covers, and that is y.
		//
		// Then stretched along its own axis, because V1's (0.2, 0.4, 0.2) is twice
		// as much along the body as across it and that is part of the silhouette.
		const k = bodyHeight / size.y;
		inner.scale.set(k, k, k * TUNNEL.spermStretch);
		// And the wobble: what is left of V1's offset once the .glb's own +0.7 has
		// been cancelled out of it. A fraction of the body's own width, so it
		// scales with the framing.
		inner.position.set(TUNNEL.spermOffset.x * bodyHeight, TUNNEL.spermOffset.y * bodyHeight, 0);
		spinner.add(inner);
	});

	return {
		scene,
		camera,
		egg,
		halo,
		sperm,
		spinner,
		spermMaterial,
		motes,

		setAir(hex) {
			air = hex;
			scene.fog.color.setHex(hex);
			// The hand-applied fog in the sperm's material has to walk with the
			// scene's, or it is the one thing that stays blue while the air whites.
			spermMaterial.uniforms.uFogColor.value.set(hex);
		},
		getAir() {
			return air;
		},

		// The band crawling along the swimmer's body.
		tick(dt) {
			spermMaterial.uniforms.uTime.value += dt;
		},

		// Where the camera is, so the mote field can fold itself around it.
		setCamZ(z) {
			motes.mat.uniforms.uCamZ.value = z;
		},
		setMotes(o, reveal = 1) {
			motes.mat.uniforms.uReveal.value = reveal;
			motes.mat.uniforms.uOpacity.value = o;
			motes.lines.visible = o > 0.004;
		},
		setHalo(o) {
			haloMat.uniforms.uOpacity.value = o;
			halo.visible = o > 0.004;
		},

		// The lens itself is animatable — see TUNNEL.fovStart / fovEnd. Widening
		// on the way in exaggerates the rush without moving the camera any faster.
		//
		// It also re-derives the swimmer's riding distance, so opening the lens
		// does not shrink it: RIDE_HALF is the half-height it is framed against
		// and it is held constant by construction.
		setFov(deg) {
			if (Math.abs(camera.fov - deg) < 1e-4) return;
			camera.fov = deg;
			camera.updateProjectionMatrix();
			lead = RIDE_HALF / Math.tan((deg * Math.PI) / 360);
		},
		// How far in front of the lens the swimmer rides, at the current lens.
		getLead() {
			return lead;
		},

		resize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		},

		reset() {
			this.setAir(AIR);
			this.setFov(TUNNEL.fovStart);
			egg.setCoreRatio(TUNNEL.coreRatio);
			egg.setCoreRimGain(0);
			egg.setWave({ furrow: 0, lobe: 0, chop: 0, grain: 0, glow: 0, ring: 0, phase: 0 });
			camera.position.set(0, 0, TUNNEL.camStart);
			camera.rotation.set(0, 0, 0);
			this.setCamZ(TUNNEL.camStart);
			this.setMotes(0);
			this.setHalo(0);
			sperm.position.set(
				TUNNEL.spermFrom.x,
				TUNNEL.spermFrom.y,
				TUNNEL.camStart + TUNNEL.spermFrom.z
			);
			spinner.rotation.z = 0;
			sperm.visible = false;
			spermMaterial.uniforms.uOpacity.value = 0;
			// Nothing in the air. The calculator's window looks onto this while it
			// waits, and the ovum is not supposed to be visible yet — the fly-in
			// brings it up out of the fog (SCENES.flyIn.eggIn).
			egg.setWire(0);
			egg.setShell(0);
			egg.setCore(0);
			egg.setCoreRim(0);
			egg.group.rotation.set(0, 0, 0);
		},

		dispose() {
			egg.dispose();
			spermMaterial.dispose();
			haloMat.dispose();
			halo.geometry.dispose();
			motes.geo.dispose();
			motes.mat.dispose();
			sperm.traverse((o) => o.geometry?.dispose());
		}
	};
}
