import {
	Fn,
	vec2,
	vec3,
	vec4,
	float,
	uniform,
	texture,
	uv,
	abs,
	max,
	length,
	exp,
	pow,
	dot,
	floor,
	hash,
	normalize,
	normalView,
	positionView,
	positionWorld,
	screenCoordinate,
	vertexStage,
	smoothstep as tslSmoothstep,
	hue
} from 'three/tsl';
import {
	SCENES,
	APPROACH,
	KALEIDO,
	NEST,
	LENS,
	TUNNEL,
	SCREEN_GLASS,
	MACHINE,
	runSeconds,
	span,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	accelerate,
	lerp
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots, ADD } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { DECADES, elementUrl } from '$lib/data/roomElements';
import { glassOnly, glassCut } from '$lib/three/tsl/glass';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { createNest } from '$lib/three/world/nest';
import { wobbleEuler } from '$lib/three/world/wobble';

// ── Sketch: silhouette — a black body with a hot rim, over the sun ───────────
// The whole approach (world/approach.js: the sky coming up, the swimmer riding
// ahead of the lens from behind, the ask, the set out of the dark, the nose
// lighting its glass, the seam) and a step past it into the tunnel, on the
// switch-on host, with two things changed — and, on ?fall=1, the descent
// instead (the real nest, the run's swimmer placed as world/descent.js places
// it, the dive and the splosh) with the same body under the same drawing.
//
// THE SWIMMER IS NOT A HOLOGRAM. Today it is an additive wireframe — blue
// rings and longitudes, a rim, a travelling band — which is a drawing of light
// and disappears over anything bright. Here there is a BODY under the drawing:
// the same GLB, opaque, ink near-black, with a rim of light along its edge in
// the colour of whatever field it is in front of — the sun's red in the flight,
// the record's gold once the sky has gone and the tunnel has the frame — and
// the holo drawn ON it, depth-tested, so the rings are the marks on the near
// side of a body rather than a cage you see through. On the off-black it is a
// shape defined by a hairline of light; on the sun it is a black sperm cut out
// of the red disc with a hot edge. The body writes depth (the head hides the
// tail behind it) and nothing else: no stencil, so the set's chain is untouched.
// The material is tsl/materials.js's skinMaterial fresnel with three things it
// does not have — a gain on the rim, depth written, premultiplied OVER — which
// is why it is written here rather than borrowed; in the run it would be a
// switch on skinMaterial.
//
// THE SUN. A huge flat red disc, faded, grained, dead ahead in the sky, a
// child of the rig like the stars so it never gets nearer: the sky the card
// lifts onto. The set comes out of the dark IN FRONT of it, black glass on
// red, and it goes out under the set with the rest of the sky (skyOut). The
// grain is seeded by the run's clock at 24 frames a second, so a pinned frame
// is one frame of it and a run flickers.
//
// The picture to look for: at the ask, a black sperm across a dull red sun,
// its edge lit red, the rings of the holo faint on its back. Then the black
// notch of the set growing under it, and the nose landing on the black glass.
//
// THE FALL (?fall=1): the descent as the run has it — nest.zetaOf, nest.pose,
// the hand on the camera off over the settle, the dive off the axis to the
// last glass, the splosh — with the body under the holo, drawn with the rim
// in the record's gold over the rooms and going to WHITE over the dive, and
// drawn OVER the splosh (the splosh is renderOrder 200000, the body a hair
// above it here) so the last frame of it, before it is gone at T.gone, is a
// black shape on a white glass. The body's alpha in the fall is ?tunnelsolid,
// as in the tunnel: over the drawings a fully opaque black is a hole in the
// picture. Nothing about the camera changes; the roll is on the descent's
// clock (runSeconds), a pure function of p here where the run has it on real
// time.
//
// THE BOLT, as a switch (?bolt=): the note asked for the sperm to FLASH toward
// the sun. When the birthday is in, the body lights (the holo up to ?lit) and
// goes: the lead runs 5.5 → bolt units over [0.25, 0.31] on an ease, the body
// shrinking with distance (it is sized for the ride, not for the lead), with
// ?ghosts after-images behind it at its last positions, each fainter, and the
// motes' streaks trebled; it holds far ahead on the disc and drops back to
// its ride over [0.55, 0.75], before the contact, so the switch-on and the
// seam are as they are. It bends the flight's no-slowing rule, which is why it
// is a switch and not the default; the ghosts are placed at lead(p − k·dp)
// with the roll at that moment, a pure function here because the sketch's
// clock is p — in the run the roll is real time and the ghosts would need
// the last seven frames' poses kept.
//
// Sketch time is a WINDOW of the approach's progress: u in 0..1 maps to p in
// [from, to], and p past 1 is the kaleido at the flight's speed. On ?fall=1
// it is a window of the descent's progress instead, default [0, 1].
//
//   ?from=0&to=1.06     the window
//   ?stretch=1          play it N times slower than the run does
//   ?fall=1             the descent instead of the approach (above)
//   ?decades=60s,90s,50s,10s,60s,90s   the fall's rooms, outermost first
//   ?rim3=ffffff        the rim's colour at the splosh (the fall goes from
//                       rim2 to it over the dive)
//   ?gone=0.975         where in the fall the swimmer is gone (the run's
//                       T.gone: before the white is more than a burst, so
//                       0.995 is the black shape ON the white, which the
//                       run's timing does not have)
//   ?solid=1            the body's alpha (0 is today's hologram alone)
//   ?tunnelsolid=0.85   the body's alpha once the tunnel has the frame, so a
//                       black body over the rings is not a hole in the picture
//   ?rim=e5372a         the rim's colour over the sun    ?rim2=f0c45c  in the tunnel
//   ?gain=1.6           the rim's brightness            ?power=2.5    its fall-off
//   ?ink=0a0806         the body's ink
//   ?holo=0.4           the holo's opacity on the body (1 is the run's, and it
//                       whites the rim out; 0 is the silhouette alone)
//   ?span=0.28          the body's cross-section, of the frame's half-height at
//                       the ride (the run's APPROACH.span; 0.6 to see it large)
//   ?holodepth=1        the holo depth-tested against the body (0: through it, as today)
//   ?sun=0.72           the sun's diameter in frame heights (0: no sun)
//   ?sunc=e5372a        its colour       ?sunlum=0.42   how faded
//   ?grain=0.14         the grain on it  ?sunx=0&suny=0.04  where, in frame heights
//   ?sunin=0,0.1        when it comes up (0.25,0.4 rises on the answer instead)
//   ?bolt=0             the lead the body bolts to on the answer (16; 0 is off)
//   ?ghosts=7           after-images on the bolt   ?lit=1.6  the holo's gain lit
//   ?ghostroll=0        the ghosts share the lead's roll and nest into one streak
//                       down the axis; 1 gives each the roll it had, a pinwheel
//   ?signal=1           the run's signal point (dropped by the bolt anyway)
//   ?tunnel=0           no rings — the glass opens on black
//   ?sperm=0            without the swimmer, for the seam diff

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
const num = (q, k, d) => (q.get(k) === null ? d : Number(q.get(k)));
const hex = (q, k, d) => (q.get(k) === null ? d : parseInt(q.get(k), 16));
const pair = (q, k, d) => (q.get(k) === null ? d : q.get(k).split(',').map(Number));
function mulberry32(a) {
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const FALL = q.get('fall') === '1';
	const FROM = num(q, 'from', 0);
	const TO = num(q, 'to', FALL ? 1 : 1.06);
	const ROOMS = (q.get('decades') ?? '60s,90s,50s,10s,60s,90s').split(',');
	const STRETCH = num(q, 'stretch', 1);
	const SOLID = num(q, 'solid', 1);
	const TUNNEL_SOLID = num(q, 'tunnelsolid', 0.85);
	const RIM = hex(q, 'rim', parseInt(MACHINE.red.slice(1), 16));
	const RIM2 = hex(q, 'rim2', 0xf0c45c);
	const RIM3 = hex(q, 'rim3', 0xffffff);
	const GONE = num(q, 'gone', SCENES.descent.gone);
	const GAIN = num(q, 'gain', 1.6);
	const POWER = num(q, 'power', 2.5);
	const INK = hex(q, 'ink', 0x0a0806);
	const HOLO_K = num(q, 'holo', 0.4);
	const SPAN = num(q, 'span', APPROACH.span);
	const HOLO_DEPTH = q.get('holodepth') !== '0';
	const SUN = num(q, 'sun', 0.72);
	const SUN_C = hex(q, 'sunc', parseInt(MACHINE.red.slice(1), 16));
	const SUN_LUM = num(q, 'sunlum', 0.42);
	const GRAIN = num(q, 'grain', 0.14);
	const SUN_X = num(q, 'sunx', 0);
	const SUN_Y = num(q, 'suny', 0.04);
	const SUN_IN = pair(q, 'sunin', SCENES.approach.fadeIn);
	const BOLT = num(q, 'bolt', 0);
	const GHOSTS = BOLT > 0 ? Math.round(num(q, 'ghosts', 7)) : 0;
	const GHOST_ROLL = q.get('ghostroll') === '1';
	const LIT = num(q, 'lit', 1.6);
	const SIGNAL = q.get('signal') !== '0' && BOLT === 0;
	const RINGS = q.get('tunnel') !== '0';
	const SPERM = q.get('sperm') !== '0';

	// Premultiplied OVER: (ONE, ONE_MINUS_SRC_ALPHA). The fragment hands back
	// colour already multiplied by its alpha.
	const OVER = {
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,
		blendEquation: THREE.AddEquation
	};

	const silhouetteMaterial = () => {
		const u = {
			uInk: uniform(new THREE.Color(INK)),
			uRim: uniform(new THREE.Color(RIM)),
			uGain: uniform(GAIN),
			uPower: uniform(POWER),
			uOpacity: uniform(0)
		};
		const mat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: true,
			depthWrite: true,
			side: THREE.DoubleSide,
			...OVER
		});
		mat.uniforms = u;
		const vN = vertexStage(normalView);
		const vV = vertexStage(normalize(positionView.negate()));
		mat.fragmentNode = Fn(() => {
			const f = pow(abs(dot(normalize(vN), normalize(vV))).oneMinus(), u.uPower);
			const col = u.uInk.add(u.uRim.mul(f).mul(u.uGain));
			const a = u.uOpacity;
			return vec4(col.mul(a), a);
		})();
		return mat;
	};
	// A body: a holo's group cloned, every mesh in the silhouette material,
	// drawn just under the holo (`order`).
	const body = (src, mat, order = 99999) => {
		const g = src.group.clone(true);
		g.name = 'body';
		g.traverse((o) => {
			if (o.isMesh) o.material = mat;
			o.renderOrder = order;
			o.frustumCulled = false;
		});
		return { group: g, spinner: g.children[0], mat };
	};

	// ── The fall ─────────────────────────────────────────────────────────
	if (FALL) return makeFall();
	async function makeFall() {
		const TD = SCENES.descent;
		const DURATION = (TO - FROM) * TD.duration * STRETCH;
		const scene = new THREE.Scene();
		const bu = backdropUniforms();
		bu.color1.value.set(0x090b14);
		bu.uFade.value = 1;
		scene.backgroundNode = deep(bu);
		const nest = await createNest({ THREE, renderer });
		nest.build({ rooms: ROOMS, portrait: false });
		scene.add(nest.root);
		// The run's swimmer (the holo), and the body under it: over the
		// splosh (200000), so the black shape is the last thing on the white.
		const sw = nest.swimmer;
		sw.material.depthTest = HOLO_DEPTH;
		sw.group.traverse((o) => {
			o.renderOrder = 200006;
		});
		scene.add(sw.group);
		const solid = body(sw, silhouetteMaterial(), 200005);
		scene.add(solid.group);
		sw.group.visible = solid.group.visible = SPERM;
		const camera = new THREE.PerspectiveCamera(LENS, 1, 0.05, 100);
		let aspect = 1;
		const SPIN = -TUNNEL.spermSpin;
		const fwd = new THREE.Vector3();
		const at3 = new THREE.Vector3();
		const wq = new THREE.Quaternion();
		const euler = new THREE.Euler();
		const rimC = new THREE.Color();
		const rimA = new THREE.Color(RIM2);
		const rimB = new THREE.Color(RIM3);
		const info = {
			fall: true,
			rooms: ROOMS,
			solid: TUNNEL_SOLID,
			rimGain: GAIN,
			rimPower: POWER,
			holo: HOLO_K,
			holoDepth: HOLO_DEPTH,
			gone: GONE,
			from: FROM,
			to: TO
		};
		function set(u) {
			const p = FROM + (TO - FROM) * u;
			const zeta = nest.zetaOf(p);
			const { D, fov, settle } = nest.pose(zeta, camera, aspect);
			nest.setDiscRin(aspect);
			nest.setFunnel(p);
			const clock = runSeconds('descent', p);
			camera.quaternion.multiply(wq.setFromEuler(wobbleEuler(euler, clock, 1 - settle)));
			camera.updateMatrixWorld(true);
			// The swimmer, as descent.js places it: down the axis, half way to
			// the frame being fallen into, and at the end off it to the glass.
			const ride = NEST.spermRide * D;
			const bodyH = NEST.spermSpan * 2 * ride * Math.tan(rad(fov) / 2);
			fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
			at3.copy(camera.position).addScaledVector(fwd, ride);
			const dive = accelerate(span(p, TD.dive), 2.4);
			if (dive > 0) at3.lerp(nest.lastGlassWorld().centre, dive);
			for (const b of [sw, solid]) {
				b.group.position.copy(at3);
				b.group.quaternion.copy(camera.quaternion);
				b.group.scale.setScalar(bodyH);
				b.spinner.rotation.z = clock * SPIN;
			}
			const gone = 1 - smoothstep(GONE - 0.006, GONE, p);
			sw.material.uniforms.uTime.value = clock;
			sw.material.uniforms.uOpacity.value = HOLO_K * gone;
			// The rim: the record's gold over the rooms, white by the glass.
			rimC.copy(rimA).lerp(rimB, smootherstep(span(p, TD.dive)));
			solid.mat.uniforms.uRim.value.copy(rimC);
			solid.mat.uniforms.uOpacity.value = TUNNEL_SOLID * gone;
			nest.setSplosh(smootherstep(span(p, TD.splosh)), 1);
			info.p = Number(p.toFixed(4));
			info.zeta = Number(zeta.toFixed(3));
			info.rim = '#' + rimC.getHexString();
			info.body = Number(solid.mat.uniforms.uOpacity.value.toFixed(3));
			info.dive = Number(dive.toFixed(3));
			info.splosh = Number(smootherstep(span(p, TD.splosh)).toFixed(3));
		}
		const size = renderer.getSize(new THREE.Vector2());
		aspect = size.x / size.y;
		bu.aspectRatio.value = aspect;
		bu.uPx.value = 1 / size.y;
		let tt = at !== null ? at * DURATION : 0;
		set(at !== null ? at : 0);
		return {
			info,
			update(dt) {
				tt = (tt + dt) % (DURATION + 1.5);
				set(Math.min(tt / DURATION, 1));
			},
			seek(u) {
				tt = u * DURATION;
				set(Math.max(0, Math.min(1, u)));
			},
			render() {
				renderer.render(scene, camera);
			},
			resize(w, h) {
				aspect = w / h;
				camera.aspect = aspect;
				camera.updateProjectionMatrix();
				bu.aspectRatio.value = aspect;
				bu.uPx.value = 1 / renderer.domElement.height;
			}
		};
	}

	// ── The flight ───────────────────────────────────────────────────────
	const T = SCENES.approach;
	const TK = SCENES.kaleido;
	const A = APPROACH;
	const K = KALEIDO;
	const DURATION = (TO - FROM) * T.duration * STRETCH;
	// The bolt's windows, in p: out on the answer, back before the contact.
	const OUT = [T.ask, T.ask + 0.06];
	const BACK = [0.55, 0.75];
	const GHOST_DP = 0.008;
	const GHOST_ON = [T.ask, 0.36];

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group();
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── The sky and the debris ───────────────────────────────────────────
	const rnd = mulberry32(7);
	const starMats = [];
	const starField = (n, dist, size, hex, opacity) => {
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rnd() * 2 - 1;
			const a = rnd() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = dist * (0.8 + rnd() * 0.4);
			pos.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	rig.add(starField(A.stars, A.starDist, 3.0, 0xb8c8ff, 0.7));
	rig.add(starField(A.brightStars, A.starDist, 5.5, 0xdde6ff, 0.9));
	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	scene.add(motes.lines);

	// The signal, as the run has it: a point where the set is.
	const sigGeo = new THREE.BufferGeometry();
	sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
	const sigMat = dotMaterial(K.signalColor, K.signalSize);
	const signal = dots(sigGeo, sigMat);
	signal.frustumCulled = false;
	signal.position.set(0, 0, -A.travel);
	scene.add(signal);

	// ── The sun ──────────────────────────────────────────────────────────
	// A quad on the rig at a fixed distance, as the stars are, so the flight
	// never closes on it: a disc `SUN` frame heights across, drawn first of
	// everything, OVER the backdrop, and a faint halo round it. Flat, faded,
	// grained: the grain is a hash of the device pixel and the frame.
	const uSunA = uniform(0);
	const uSunFrame = uniform(0);
	const SUN_D = 120;
	const frameH = 2 * SUN_D * Math.tan(rad(LENS) / 2);
	const sunMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...OVER
	});
	{
		const c = new THREE.Color(SUN_C);
		const PAD = 1.6; // the quad, in disc diameters, for the halo
		sunMat.colorNode = Fn(() => {
			const p = uv()
				.sub(0.5)
				.mul(PAD * 2); // −PAD..PAD, the disc at |p| = 1
			const r = length(p);
			const disc = tslSmoothstep(1.0, 0.985, r);
			const halo = exp(max(r.sub(1.0), 0.0).mul(3.5).pow(2).negate()).mul(0.22);
			// The grain: 2-pixel cells, one draw of the dice per frame.
			const cell = floor(screenCoordinate.xy.mul(0.5));
			const n = hash(cell.x.add(cell.y.mul(4096.0)).add(uSunFrame.mul(7919.0)))
				.sub(0.5)
				.mul(2.0);
			// A little darker toward the lower limb, as a sun through haze is.
			const shade = float(1.0).sub(p.y.mul(-0.5).add(0.5).mul(0.28));
			const lum = shade.mul(n.mul(GRAIN).add(1.0)).mul(SUN_LUM);
			const a = max(disc, halo).mul(uSunA);
			const col = vec3(c.r, c.g, c.b).mul(lum);
			return vec4(col.mul(a), a);
		})();
	}
	const sun = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sunMat);
	sun.frustumCulled = false;
	sun.renderOrder = -10;
	sun.visible = SUN > 0;
	{
		const PAD = 1.6;
		const s = frameH * SUN * PAD;
		sun.scale.set(s, s, 1);
		sun.position.set(SUN_X * frameH, SUN_Y * frameH, -SUN_D);
	}
	rig.add(sun);

	// ── The drawings ─────────────────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const tex = {};
	await Promise.all(
		DECADES.map(async (d) => {
			tex[d] = {};
			await Promise.all(
				K.keys.map(async (key) => {
					const t = await loader.loadAsync(elementUrl(d, key));
					t.colorSpace = THREE.SRGBColorSpace;
					t.generateMipmaps = true;
					t.minFilter = THREE.LinearMipmapLinearFilter;
					t.anisotropy = Math.min(4, maxAniso);
					tex[d][key] = t;
				})
			);
		})
	);
	const art = (d, key) => tex[d][key].image.width / tex[d][key].image.height;
	const plane = new THREE.PlaneGeometry(1, 1);
	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};
	const flat = (opts = {}) =>
		new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			...opts
		});

	// ── The set: the 60s television, dead ahead (switch-on.js, as it is) ─
	const RING_ORDER = 50000;
	const COVER_ORDER = 60000;
	const uDim = uniform(1);
	const uGlow = uniform(0);
	const uBSeen0 = uniform(K.bezelSeen[0]);
	const uBSeen1 = uniform(K.bezelSeen[1]);
	const nearBezel = tslSmoothstep(uBSeen0, uBSeen1, positionView.z.negate()).oneMinus();

	const decade = K.screenDecade;
	const pw = K.screenWidth;
	const ph = pw / art(decade, 'screen');
	const sg = SCREEN_GLASS[decade];
	const glass = { x: (sg.cx - 0.5) * pw, y: (0.5 - sg.cy) * ph, w: sg.w * pw, h: sg.h * ph };
	const screenRoot = new THREE.Group();
	scene.add(screenRoot);
	const bezelMat = flat();
	{
		const c = glassCut(decade, tex[decade].screen)();
		bezelMat.colorNode = vec4(c.rgb, c.a.mul(uDim).mul(nearBezel));
	}
	stencilOf(bezelMat, 0, THREE.EqualStencilFunc, THREE.KeepStencilOp);
	const bezel = new THREE.Mesh(plane, bezelMat);
	bezel.scale.set(pw, ph, 1);
	bezel.renderOrder = -3;
	const holeMat = flat({ colorWrite: false });
	holeMat.colorNode = glassOnly(decade, tex[decade].screen)();
	stencilOf(holeMat, 0, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
	const hole = new THREE.Mesh(plane, holeMat);
	hole.scale.set(pw, ph, 1);
	hole.renderOrder = -4;
	const coverMat = flat();
	coverMat.colorNode = vec4(0, 0, 0, uDim);
	stencilOf(coverMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
	const top = new THREE.Mesh(plane, coverMat);
	const bottom = new THREE.Mesh(plane, coverMat);
	top.renderOrder = bottom.renderOrder = COVER_ORDER;

	// The dot, and the line it draws out into.
	const uCap = uniform(new THREE.Vector2(0.1, 0.1));
	const uQuad = uniform(new THREE.Vector2(0.3, 0.3));
	const YELLOW = new THREE.Color(K.signalColor);
	const lineMat = flat(ADD);
	lineMat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(uQuad);
		const r = uCap.y.mul(0.5);
		const hx = max(uCap.x.mul(0.5).sub(r), 0.0);
		const d = length(vec2(max(abs(p.x).sub(hx), 0.0), p.y)).div(r);
		const soft = exp(d.mul(d).mul(-1.2));
		const core = exp(d.mul(d).mul(-7.0));
		const lit = uGlow.mul(uDim);
		const col = vec3(YELLOW.r, YELLOW.g, YELLOW.b)
			.mul(soft.mul(0.9))
			.add(vec3(1, 1, 1).mul(core).mul(1.1));
		return vec4(col.mul(lit), 1.0);
	})();
	stencilOf(lineMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
	const line = new THREE.Mesh(plane, lineMat);
	line.renderOrder = COVER_ORDER + 1;
	const screenMeshes = [bezel, hole, top, bottom, line];
	for (const m of screenMeshes) {
		m.frustumCulled = false;
		screenRoot.add(m);
	}

	const zGlass = -A.travel;
	screenRoot.position.set(-glass.x, -glass.y, zGlass);
	const z0 = zGlass + glass.h / 2 / Math.tan(rad(LENS) / 2);

	// ── The tunnel inside ────────────────────────────────────────────────
	const uOn = uniform(1);
	const uHue = uniform(0);
	const uHuePer = uniform((Math.PI * 2) / (K.pitch * K.keys.length * DECADES.length));
	const uZ0 = uniform(zGlass);
	const uBright = uniform(K.dim);
	const uSeen0 = uniform(K.seen[0]);
	const uSeen1 = uniform(K.seen[1]);
	const near = tslSmoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const turned = uHue.add(uZ0.sub(positionWorld.z).mul(uHuePer));
	const rings = new THREE.Group();
	scene.add(rings);
	if (RINGS) {
		const ringMat = {};
		for (const d of DECADES) {
			ringMat[d] = {};
			for (const key of K.keys) {
				const m = flat();
				const c = key === 'screen' ? glassCut(d, tex[d].screen)() : texture(tex[d][key]);
				m.colorNode = vec4(hue(c.rgb, turned).mul(uBright), c.a.mul(uOn).mul(near).mul(uDim));
				stencilOf(m, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
				ringMat[d][key] = m;
			}
		}
		for (let i = 0; i < K.rings; i++) {
			const key = K.keys[i % K.keys.length];
			const d = DECADES[Math.floor(i / K.keys.length) % DECADES.length];
			const g = new THREE.Group();
			const w = K.size[key];
			const h = w / art(d, key);
			for (let j = 0; j < K.ring; j++) {
				const th = (Math.PI * 2 * j) / K.ring + (i * Math.PI) / K.ring + i * K.spiral;
				const m = new THREE.Mesh(plane, ringMat[d][key]);
				m.position.set(Math.cos(th) * K.radius[0], Math.sin(th) * K.radius[1], 0);
				m.rotation.z = th + Math.PI / 2;
				m.scale.set(j % 2 ? -w : w, h, 1);
				m.renderOrder = RING_ORDER;
				m.frustumCulled = false;
				g.add(m);
			}
			g.position.z = zGlass - (i + 0.5) * K.pitch;
			rings.add(g);
		}
	}

	// ── The swimmer: the hologram, and the body under it ─────────────────
	// loadSwimmer's group is the holo as the run has it (a child of the
	// camera, riding `lead` ahead, sized off the lens). The BODY is a deep
	// clone of that group — the same geometry, the same spinner and offsets —
	// wearing the silhouette material: ink, and a rim by the view-space
	// fresnel, premultiplied OVER, depth-tested and depth-writing so the head
	// hides the tail, drawn just under the holo. The holo is then depth-tested
	// against it (holodepth) so its rings are on the near side of the body.
	const sw = await loadSwimmer({ height: 1, gain: 1.15 });
	sw.material.depthTest = HOLO_DEPTH;
	sw.group.traverse((o) => {
		o.renderOrder = 100000;
		o.frustumCulled = false;
	});
	sw.group.updateMatrixWorld(true);
	const nose = new THREE.Object3D();
	{
		const v = new THREE.Vector3();
		const tip = new THREE.Vector3(0, 0, Infinity);
		sw.group.traverse((o) => {
			if (!o.isMesh) return;
			const pos = o.geometry.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
				if (v.z < tip.z) tip.copy(v);
			}
		});
		nose.position.copy(tip);
	}
	const halfLenUnit = -nose.position.z;
	sw.spinner.add(nose);
	camera.add(sw.group);

	const solid = body(sw, silhouetteMaterial());
	camera.add(solid.group);
	// ?sperm=0 hides both bodies outright: a body at alpha 0 still writes depth.
	sw.group.visible = solid.group.visible = SPERM;
	const ghosts = [];
	for (let k = 1; k <= GHOSTS; k++) {
		const gh = body(sw, silhouetteMaterial());
		gh.group.traverse((o) => {
			o.renderOrder = 99999 - k;
		});
		camera.add(gh.group);
		ghosts.push(gh);
	}

	const SPIN = -TUNNEL.spermSpin;
	// Sized for the RIDE, whatever the lead: the bolt shrinks it with distance.
	const bodyH = SPAN * 2 * A.lead * Math.tan(rad(LENS) / 2);
	const halfLen = halfLenUnit * bodyH;
	// The lead: the ride, and on the bolt out to BOLT and back before contact.
	const leadAt = (p) => {
		if (!BOLT) return A.lead;
		let l = lerp(A.lead, BOLT, smootherstep(span(p, OUT)));
		return lerp(l, A.lead, smootherstep(span(p, BACK)));
	};
	const boltK = (p) => (BOLT ? smootherstep(span(p, OUT)) * (1 - smootherstep(span(p, BACK))) : 0);

	const euler = new THREE.Euler();
	const noseW = new THREE.Vector3();
	function poseAt(p) {
		rig.position.set(0, 0, z0 * p);
		camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		const clock = runSeconds('approach', p);
		const lead = leadAt(p);
		for (const b of [sw, solid]) {
			b.group.position.set(0, 0, -lead);
			b.group.scale.setScalar(bodyH);
			b.spinner.rotation.z = clock * SPIN;
		}
		sw.material.uniforms.uTime.value = clock;
		camera.updateMatrixWorld(true);
		return clock;
	}

	// ── The contact ──────────────────────────────────────────────────────
	const f = (p) => z0 * p - leadAt(p) - halfLen - zGlass;
	let lo = 0.5;
	let hi = 1.2;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (f(mid) > 0) lo = mid;
		else hi = mid;
	}
	const pStar = (lo + hi) / 2;
	poseAt(pStar);
	nose.getWorldPosition(noseW);
	const contact = { x: noseW.x - screenRoot.position.x, y: noseW.y - screenRoot.position.y };
	const S = T.switchOn;
	const B = Math.max(S.by - pStar, 0.005);
	const W = {
		dot: [pStar + S.dot[0] * B, pStar + S.dot[1] * B],
		line: [pStar + S.line[0] * B, pStar + S.line[1] * B],
		open: [pStar + S.open[0] * B, pStar + S.open[1] * B],
		glow: [pStar + S.glow[0] * B, pStar + S.glow[1] * B]
	};
	const DOT = glass.h * K.dot;
	const HAIR = glass.h * K.hair;

	function setOpen(open, width, glow, xc, yc) {
		const g = glass;
		const yT = g.y + g.h / 2;
		const yB = g.y - g.h / 2;
		const topH = (yT - yc) * (1 - open);
		const botH = (yc - yB) * (1 - open);
		top.scale.set(g.w, topH, 1);
		top.position.set(g.x, yT - topH / 2, 0.001);
		bottom.scale.set(g.w, botH, 1);
		bottom.position.set(g.x, yB + botH / 2, 0.001);
		top.visible = topH > 0.0005;
		bottom.visible = botH > 0.0005;
		const xL = xc - DOT / 2 + (g.x - g.w / 2 - (xc - DOT / 2)) * width;
		const xR = xc + DOT / 2 + (g.x + g.w / 2 - (xc + DOT / 2)) * width;
		const capW = xR - xL;
		const capH = DOT + (HAIR - DOT) * width;
		const pad = capH * 2.5;
		uCap.value.set(capW, capH);
		uQuad.value.set(capW + pad, capH + pad);
		line.scale.set(capW + pad, capH + pad, 1);
		line.position.set((xL + xR) / 2, yc, 0.002);
		line.visible = glow > 0.001;
		uGlow.value = glow;
	}

	const info = {
		contact: Number(pStar.toFixed(4)),
		halfLen: Number(halfLen.toFixed(3)),
		bodyH: Number(bodyH.toFixed(3)),
		sun: SUN,
		sunLum: SUN_LUM,
		solid: SOLID,
		rimGain: GAIN,
		rimPower: POWER,
		holo: HOLO_K,
		span: SPAN,
		holoDepth: HOLO_DEPTH,
		bolt: BOLT,
		ghosts: GHOSTS,
		from: FROM,
		to: TO
	};

	const rimC = new THREE.Color();
	const rimA = new THREE.Color(RIM);
	const rimB = new THREE.Color(RIM2);
	function set(u) {
		const p = FROM + (TO - FROM) * u;
		const clock = poseAt(p);
		const z = rig.position.z;

		// The sky and the debris: up with the card, out under the set.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));
		const bk = boltK(p);
		motes.uniforms.uLen.value = A.moteLength * (1 + 2 * bk);
		sigMat.uniforms.uOpacity.value = SIGNAL
			? on *
				smoothstep(T.signal[0], T.signal[1], p) *
				(1 - smoothstep(T.signalOut[0], T.signalOut[1], p))
			: 0;

		// The sun: up on its own window, out with the sky.
		uSunA.value = smootherstep(span(p, SUN_IN)) * (1 - easeInOutCubic(span(p, T.skyOut)));
		uSunFrame.value = Math.floor(clock * 24);

		// The set out of the dark, and the switch-on.
		uDim.value = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		const dot = smoothstep(W.dot[0], W.dot[1], p);
		const width = smoothstep(W.line[0], W.line[1], p);
		const open = smoothstep(W.open[0], W.open[1], p);
		const glow = dot * (1 - smoothstep(W.glow[0], W.glow[1], p)) * (1 - smoothstep(0.97, 0.99, p));
		setOpen(open, width, glow * (1 + 2.2 * (1 - width)), contact.x, contact.y);

		// The swimmer: the body, its rim in the field's colour, the holo on it.
		const inK = SPERM ? smootherstep(span(p, T.swimmerIn)) : 0;
		const tunnelK = easeInOutCubic(span(p, T.skyOut));
		rimC.copy(rimA).lerp(rimB, tunnelK);
		solid.mat.uniforms.uRim.value.copy(rimC);
		solid.mat.uniforms.uOpacity.value = inK * lerp(SOLID, TUNNEL_SOLID, tunnelK);
		sw.material.uniforms.uOpacity.value = inK * HOLO_K;
		sw.material.uniforms.uGain.value = lerp(1.15, LIT, bk);

		// The after-images on the bolt: where the body was, as it was.
		const ghostOn =
			smoothstep(GHOST_ON[0], GHOST_ON[0] + 0.01, p) *
			(1 - smoothstep(GHOST_ON[1] - 0.03, GHOST_ON[1], p));
		let seen = 0;
		ghosts.forEach((gh, i) => {
			const k = i + 1;
			const pk = p - k * GHOST_DP;
			const a = inK * ghostOn * 0.6 * (1 - k / (GHOSTS + 1));
			gh.group.visible = a > 0.002;
			if (!gh.group.visible) return;
			seen++;
			gh.group.position.set(0, 0, -leadAt(pk));
			gh.group.scale.setScalar(bodyH);
			gh.spinner.rotation.z = runSeconds('approach', GHOST_ROLL ? pk : p) * SPIN;
			gh.mat.uniforms.uRim.value.copy(rimC);
			gh.mat.uniforms.uOpacity.value = a;
		});

		// Past the seam: through the glass at the flight's speed.
		const through = z < zGlass + 1.5 * camera.near;
		bezel.visible = hole.visible = true;
		for (const m of screenMeshes) m.visible = m.visible && !through;
		renderer.setClearStencil(through ? 1 : 0);
		const x = Math.max(0, p - 1);
		rings.rotation.z = x * TK.turns * Math.PI * 2;
		uHue.value = x * TK.hueCycles * Math.PI * 2;

		info.p = Number(p.toFixed(4));
		info.z = Number(z.toFixed(2));
		info.lead = Number(leadAt(p).toFixed(2));
		info.rim = '#' + rimC.getHexString();
		info.body = Number(solid.mat.uniforms.uOpacity.value.toFixed(3));
		info.sunA = Number(uSunA.value.toFixed(3));
		info.ghostsSeen = seen;
		info.glow = Number(glow.toFixed(3));
		info.open = Number(open.toFixed(3));
		info.through = through;
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
	bu.uPx.value = 1 / renderer.domElement.height;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
