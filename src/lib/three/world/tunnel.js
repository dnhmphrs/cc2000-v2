import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createEgg } from './egg';
import { TUNNEL, DEEP_BLUE, HOLO } from '$lib/config';

// ── The tunnel ───────────────────────────────────────────────────────────────
// The place the fly-in happens: deep blue air with the egg waiting at the far
// end of it, a pack of sperm corkscrewing up the channel, and a field of motes
// streaming past the lens.
//
// This file BUILDS. FlyIn.svelte MOVES — it never creates anything. Every
// dimension is in config/space.js under TUNNEL; everything here reads from
// there, so tuning the scene means editing the config, not this.
//
// ── Why there is anything in the air at all ──────────────────────────────────
// The camera covers about 180 world units in six seconds. With nothing between
// it and the egg, all 180 of them read as ZERO: the egg simply gets larger, and
// a shape that grows in the middle of an empty frame is a zoom, not a flight.
// The motes are what turn it into travel — they have parallax, they streak as
// they pass, and they are the only reason the fog reads as distance rather than
// as a wash. They cost one draw call.
//
// The pack does the same job for the story. The hero is not travelling, it is
// WINNING: it comes past the lens, the others fall back behind it, and by the
// time it reaches the egg it is alone. That is one more draw call and it is the
// difference between a swimming animation and a race.
//
// The air changes colour across the run (deep blue for the approach, white for
// the blow-out), so the fog and the shader's ground are one value: set it with
// setAir(), read it back with getAir(), and let the backdrop paint that.

// ── The hologram ─────────────────────────────────────────────────────────────
// Not a lit model. Additive, depth-writing off, a scanline running down it and
// a fresnel rim — so it is bright at its silhouette and sees through itself,
// which is what makes a single mesh read as a specimen rather than as a shape.
//
// scene.fog does not reach a ShaderMaterial, so the same exponential the rest
// of the scene is fogged by is applied here by hand. Without it the sperm is
// the one object in the frame that ignores the air it is swimming in.
function holoMaterial(color) {
	return new THREE.ShaderMaterial({
		transparent: true,
		side: THREE.DoubleSide,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		uniforms: {
			uTime: { value: 0 },
			uOpacity: { value: 0 },
			uColor: { value: new THREE.Color(color) },
			uRim: { value: new THREE.Color(HOLO.rim) },
			uFogColor: { value: new THREE.Color(DEEP_BLUE) },
			uFogDensity: { value: TUNNEL.fogDensity }
		},
		vertexShader: `
			varying vec3 vNormal;
			varying vec3 vView;
			varying vec3 vLocal;
			varying float vDepth;
			void main() {
				vLocal = position;
				vec4 wp = modelMatrix * vec4(position, 1.0);
				vNormal = normalize(normalMatrix * normal);
				vView = normalize(cameraPosition - wp.xyz);
				vec4 mv = viewMatrix * wp;
				vDepth = -mv.z;
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform float uTime;
			uniform float uOpacity;
			uniform vec3 uColor;
			uniform vec3 uRim;
			uniform vec3 uFogColor;
			uniform float uFogDensity;
			varying vec3 vNormal;
			varying vec3 vView;
			varying vec3 vLocal;
			varying float vDepth;
			void main() {
				// Along the body, not up the world: a scanline fixed in world space
				// slides over a model that is corkscrewing and reads as a stripe on
				// the air rather than as a stripe on the animal.
				float scan = sin(vLocal.z * 5.5 - uTime * 3.4) * 0.5 + 0.5;
				scan = smoothstep(0.25, 0.85, scan);
				float fres = pow(1.0 - abs(dot(normalize(vNormal), vView)), 2.2);

				vec3 col = mix(uColor, uRim, fres * 0.8);
				float a = (0.14 + scan * 0.13 + fres * 0.5) * uOpacity;

				float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
				col = mix(col, uFogColor, fog);
				a *= 1.0 - fog * 0.92;

				// Premultiplied, because additive blending adds col*a and nothing
				// else — the alpha channel itself is never read.
				gl_FragColor = vec4(col * a, a);
			}
		`
	});
}

// ── The motes ────────────────────────────────────────────────────────────────
// One LineSegments, one draw call. Each mote is a short segment lying along the
// flight axis, so it renders as a DOT when it is far off and a STREAK when it is
// passing the lens — the length is free, it is just perspective doing its job.
//
// They are not placed in the world: they are placed relative to the CAMERA and
// wrap. `aZ` is a mote's phase, and the shader folds it into the slab of air
// just in front of the lens, so the field is equally dense at every point in a
// 180-unit flight for the price of a few hundred segments. Nothing is animated
// on the CPU; the whole field moves because uCamZ moves.
function createMotes() {
	const n = TUNNEL.motes;
	const pos = new Float32Array(n * 6);
	const phase = new Float32Array(n * 2);
	const end = new Float32Array(n * 2);
	const seed = new Float32Array(n * 2);

	for (let i = 0; i < n; i++) {
		// Uniform in the disc, so the field does not clump on the axis where it
		// would sit on top of the sperm.
		const a = Math.random() * Math.PI * 2;
		const r = Math.sqrt(Math.random()) * TUNNEL.moteRadius;
		const x = Math.cos(a) * r;
		const y = Math.sin(a) * r;
		const z = Math.random() * TUNNEL.moteSpan;
		const s = Math.random();

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
	// The wrap is done in the shader, so three.js cannot know where these end up.
	geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

	const mat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		uniforms: {
			uCamZ: { value: TUNNEL.camStart },
			uSpan: { value: TUNNEL.moteSpan },
			uLen: { value: TUNNEL.moteLength },
			uOpacity: { value: 0 },
			uColor: { value: new THREE.Color(HOLO.body) },
			uFogDensity: { value: TUNNEL.fogDensity }
		},
		vertexShader: `
			attribute float aPhase;
			attribute float aEnd;
			attribute float aSeed;
			uniform float uCamZ;
			uniform float uSpan;
			uniform float uLen;
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
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform float uOpacity;
			uniform vec3 uColor;
			uniform float uFogDensity;
			varying float vFade;
			varying float vFog;
			void main() {
				float fog = 1.0 - exp(-uFogDensity * uFogDensity * vFog * vFog);
				float a = vFade * uOpacity * (1.0 - fog * 0.96);
				gl_FragColor = vec4(uColor * a, a);
			}
		`
	});

	const lines = new THREE.LineSegments(geo, mat);
	lines.frustumCulled = false;
	return { lines, mat, geo };
}

export function createTunnel() {
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(DEEP_BLUE, TUNNEL.fogDensity);
	let air = DEEP_BLUE;

	const camera = new THREE.PerspectiveCamera(
		TUNNEL.fov,
		window.innerWidth / window.innerHeight,
		TUNNEL.near,
		TUNNEL.far
	);
	camera.position.z = TUNNEL.camStart;

	// The zona pellucida: enough body to read as a second surface around the yolk,
	// and no more — every point of base alpha is a grey veil over the thing the
	// whole scene is flying toward.
	const egg = createEgg(TUNNEL.shellR, { base: 0.09 });
	egg.group.position.z = TUNNEL.eggZ;
	scene.add(egg.group);

	// The glow the egg comes up out of. A flat disc, well behind the shell and
	// much larger than it, additively blended — the egg is not lit in this scene
	// (nothing here is), so without this it arrives as a pale sticker rather than
	// as something with its own light on a fogged horizon.
	const haloMat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		depthTest: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		uniforms: {
			uColor: { value: new THREE.Color(HOLO.body) },
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
			uniform vec3 uColor;
			uniform float uOpacity;
			varying vec2 vP;
			void main() {
				float r = length(vP);
				float a = exp(-r * r * 5.0) * uOpacity;
				gl_FragColor = vec4(uColor * a, a);
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

	// ── The pack ─────────────────────────────────────────────────────────────
	// How big anything reads is a fraction of the FRAME, never a scale factor on
	// a model whose file we do not control. So the model is normalised — centred
	// on its own bounding box and scaled so its longest dimension is exactly one
	// world unit — and then sized from the frame it will be seen in:
	//
	//   half-height at the riding distance = spermLead * tan(fovStart / 2)
	//
	// Measured ONCE, from the lens the scene opens on. Recomputing it per frame
	// would normalise the approach away — the sperm would stay the same size on
	// screen however close it got, which is the one thing it must not do.
	const RIDE_HALF = TUNNEL.spermLead * Math.tan((TUNNEL.fovStart * Math.PI) / 360);
	const HERO_LEN = TUNNEL.spermSpan * RIDE_HALF * 2;
	const HERO_ORBIT = TUNNEL.spermOrbit * RIDE_HALF;

	const heroMaterial = holoMaterial(HOLO.body);

	// Three nested objects, and each one is doing a different job:
	//
	//   group    where it IS — driven by the scene
	//   spinner  the corkscrew. Turning this about z both swings the body round
	//            the flight axis AND rolls it about its own length, because the
	//            body lies along z inside an offset holder. One rotation, both
	//            motions, which is what a corkscrew actually is.
	//   holder   how far off the axis it swings
	function rig(orbit) {
		const group = new THREE.Group();
		const spinner = new THREE.Group();
		const holder = new THREE.Group();
		holder.position.y = orbit;
		spinner.add(holder);
		group.add(spinner);
		group.visible = false;
		scene.add(group);
		return { group, spinner, holder };
	}

	const hero = rig(HERO_ORBIT);
	const sperm = hero.group;
	sperm.position.y = TUNNEL.spermGroupY;

	// One material EACH, because they have to be faded off one at a time: they
	// are overtaken in turn, and each one has to go out as it reaches the lens or
	// it is simply clipped away mid-body. The five share a program — three.js
	// caches on shader source — so this is five uniform sets, not five shaders.
	const rivals = TUNNEL.rivalLead.map((lead, i) => {
		const a = (i / TUNNEL.rivalLead.length) * Math.PI * 2 + 0.4;
		const half = lead * Math.tan((TUNNEL.fovStart * Math.PI) / 360);
		const radius = TUNNEL.rivalRing * half * (0.62 + ((i * 7) % 5) / 7);
		const r = rig(HERO_ORBIT * TUNNEL.rivalScale);
		return {
			...r,
			material: holoMaterial(HOLO.rival),
			lead,
			// How far it slips back relative to the camera across the run. Staggered,
			// so the pack is overtaken one at a time rather than all at once.
			lag: TUNNEL.rivalLag[i],
			// Where it rides, off the axis, so the pack is a spread rather than a
			// queue directly behind the hero.
			ring: a,
			radius,
			// Its own phase, so five of them do not corkscrew in lock-step.
			phase: a * 1.7,
			spin: TUNNEL.rivalSpin * (0.82 + ((i * 3) % 4) / 8)
		};
	});

	// Normalise and dress one copy of the model.
	//
	// The file's own origin is nowhere near the body and its axes are its own, so
	// nothing can be positioned against it directly. This centres the geometry on
	// its bounding box, scales the longest dimension to `length`, and leaves the
	// head pointing down -Z — away from the camera, which is the way it swims.
	function fit(source, material, length) {
		const model = source.clone(true);
		model.rotation.x += Math.PI;
		model.traverse((child) => {
			if (child.material) child.material = material;
		});

		const inner = new THREE.Group();
		inner.add(model);
		inner.updateMatrixWorld(true);
		const box = new THREE.Box3().setFromObject(model);
		const size = box.getSize(new THREE.Vector3());
		model.position.sub(box.getCenter(new THREE.Vector3()));
		inner.scale.setScalar(length / Math.max(size.x, size.y, size.z));
		return inner;
	}

	new GLTFLoader().load('/sperm.glb', (glb) => {
		const source = glb.scene.children[0] ?? glb.scene;
		hero.holder.add(fit(source, heroMaterial, HERO_LEN));
		rivals.forEach((r) => r.holder.add(fit(source, r.material, HERO_LEN * TUNNEL.rivalScale)));
	});

	const holos = () => [heroMaterial, ...rivals.map((r) => r.material)];

	return {
		scene,
		camera,
		egg,
		halo,
		haloMat,
		sperm,
		hero,
		rivals,
		heroMaterial,
		motes,
		// Kept under the name the fly-in has always used it by.
		spermMaterial: heroMaterial,

		setAir(hex) {
			air = hex;
			scene.fog.color.setHex(hex);
			// The hand-applied fog in the custom materials has to walk with the
			// scene's, or the sperm stay blue while the air goes white.
			const c = new THREE.Color(hex);
			holos().forEach((m) => m.uniforms.uFogColor.value.copy(c));
		},
		getAir() {
			return air;
		},

		// Advances the one thing in the scene that is a clock rather than a
		// position: the scanline crawling along the bodies.
		tick(dt) {
			holos().forEach((m) => (m.uniforms.uTime.value += dt));
		},

		// Where the camera is, so the mote field can fold itself around it.
		setCamZ(z) {
			motes.mat.uniforms.uCamZ.value = z;
		},
		setMotes(o) {
			motes.mat.uniforms.uOpacity.value = o;
			motes.lines.visible = o > 0.004;
		},
		setHalo(o) {
			haloMat.uniforms.uOpacity.value = o;
			halo.visible = o > 0.004;
		},

		// The lens itself is animatable — see TUNNEL.fovStart / fovEnd. Widening
		// on the way in exaggerates the rush without moving the camera any faster.
		setFov(deg) {
			if (Math.abs(camera.fov - deg) < 1e-4) return;
			camera.fov = deg;
			camera.updateProjectionMatrix();
		},

		resize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		},

		reset() {
			this.setAir(DEEP_BLUE);
			this.setFov(TUNNEL.fovStart);
			camera.position.set(0, 0, TUNNEL.camStart);
			camera.rotation.set(0, 0, 0);
			this.setCamZ(TUNNEL.camStart);
			this.setMotes(0);
			this.setHalo(0);
			sperm.position.set(
				TUNNEL.spermFrom.x,
				TUNNEL.spermGroupY + TUNNEL.spermFrom.y,
				TUNNEL.camStart + TUNNEL.spermFrom.z
			);
			hero.spinner.rotation.z = 0;
			sperm.visible = false;
			heroMaterial.uniforms.uOpacity.value = 0;
			rivals.forEach((r) => {
				r.group.visible = false;
				r.group.position.set(0, 0, TUNNEL.camStart + TUNNEL.spermFrom.z);
				r.spinner.rotation.z = 0;
				r.material.uniforms.uOpacity.value = 0;
			});
			// Nothing in the air. The calculator's window looks onto this while it
			// waits, and the egg is not supposed to be visible yet — the fly-in
			// brings it up out of the fog (SCENES.flyIn.eggIn).
			egg.setCore(0);
			egg.setShell(0);
			egg.group.rotation.set(0, 0, 0);
			egg.group.scale.setScalar(1);
		},

		dispose() {
			egg.dispose();
			holos().forEach((m) => m.dispose());
			haloMat.dispose();
			halo.geometry.dispose();
			motes.geo.dispose();
			motes.mat.dispose();
			sperm.traverse((o) => o.geometry?.dispose());
			rivals.forEach((r) => r.group.traverse((o) => o.geometry?.dispose()));
		}
	};
}
