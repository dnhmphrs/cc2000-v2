import {
	Fn,
	vec2,
	vec3,
	vec4,
	uniform,
	float,
	mix,
	max,
	hash,
	screenUV,
	screenCoordinate
} from 'three/tsl';
import { SCENES, AIR, DEV_EDGE, runSeconds, clamp01 } from '$lib/config';
import { edge } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createNest } from '$lib/three/world/nest';
import { createKaleidoscope } from '$lib/three/world/kaleidoscope';
import { createApproach } from '$lib/three/world/approach';
import { createKaleido } from '$lib/three/world/kaleido';
import { createDescent } from '$lib/three/world/descent';

// ── Sketch: the noir ground ──────────────────────────────────────────────────
// The off-black, the grain, the flat field. Every frame of the run's 3D sits
// on one ground — the approach, the kaleido and the descent each paint
// `deep(bu)` with color1 0x090b14 by hand — and that ground is a BLUE CHANNEL:
// a halo and a core that lift toward the middle of the frame (rgb 14,16,30
// there, 1,1,3 in the corners), so the sky, the set and the rooms all sit in
// a soft blue pool like a screensaver. The palette file has already said what
// the air should be — AIR, 0x14120e, an off-black lifted off the void and
// WARM, and the page's own --bg is the same — and the three scenes drifted to
// a blue instead.
//
// Here the ground is ONE FLAT, WARM, OFF-BLACK FIELD with film grain on it.
// No channel: at most a shallow top-to-bottom ramp, the top of the frame a
// quarter darker than the bottom, the way a night sky sits over a horizon.
// The colour is AIR's own hue scaled to a set luminance (`lift`, about 15 of
// 255), so the ground and the page are one black. Over it, grain: a per-pixel
// integer hash (three/tsl's own `hash`) on the device pixel, signed, STEPPED
// ON THE RUN'S CLOCK — the seed is floor(runSeconds · fps), so a pinned frame
// has the same grain every load, a run's grain crawls like stock at 24, and
// the seams carry it, since approach 1 and kaleido 0 are the same second. The
// blue things on it — the stars, the motes, the swimmer's hologram — stay
// blue, which is the palette's own rule: blue is the one cold thing in the
// air. And grain over EVERYTHING, not just the ground: a full-frame quad
// riding the camera, drawn last, that MULTIPLIES the frame by 1 − k·hash —
// the ground's grain is added in the black, where an add shows; this one
// darkens what is lit, in proportion to how lit it is, which is what grain on
// stock does and what an ADD quad cannot (an add of near-black size is under
// a step on a lit room). Nothing else about the run is touched.
//
// THE HOST IS THE RUN. This sketch builds the run's own three scenes —
// world/approach.js, world/kaleido.js and world/descent.js, on one nest and
// one kaleidoscope, entered in run order — and swaps only their
// `scene.backgroundNode`, so what is on the page is exactly what the run
// draws with the ground changed and nothing else: the card's black, the
// swimmer on it, the set's yellow glass on a black that is not blue, the
// tunnel's dark eye, the first room out of the dark, and the fall. In the
// fall the ground is NOT SEEN in this build: the rooms' back walls are drawn
// past their frames with the wallpaper looped (NEST.wallCover), the black
// round the record label is the disc and the wall, and the last monitor's
// glass is painted black — measured, the corners at kaleido 0.98 are the
// same (7,6,3) on either ground and the glass at descent 0.94 is (0,0,0).
// What the fall carries of this is the full-frame grain on the rooms. The
// stars and the motes are the run's own, untouched; they read colder on the
// warm black by contrast alone. The sketch's clock is the run's: u runs the three
// scenes end to end on their own durations (7 + 7 + 11 s), so `?at=` here is
// a second of the run, and the scenes' own `set(p)` draws the frame.
//
// The beats, at u of the whole run (or ?scene= one of them, at its own p):
//   approach 0.06  u 0.017   the card lifting: warm black, grain in it, the
//                            stars colder on it
//   approach 0.3   u 0.084   the swimmer's blue hologram, the one cold thing
//   approach 0.95  u 0.266   the set's yellow glass on a black that is not blue
//   kaleido  0.5   u 0.42    down the tunnel, the rings on the flat black
//   kaleido  0.98  u 0.554   the first room out of the dark, the disc round it
//   descent  0.5   u 0.78    the fall: no ground in sight, the grain on the room
//
//   ?scene=run|approach|kaleido|descent   what u runs over (default: the run)
//   ?ground=noir|flat|deep   noir is this; flat is it with no ramp and no
//                            grain; deep is the run's own ground, 0x090b14
//                            in the channel, for the A/B on the same frame
//   ?lift=0.06      the ground's luminance, in sRGB (0.06 is about 15/255)
//   ?warm=1         1 is AIR's hue at that luminance, 0 a neutral grey
//   ?ramp=0.25      how much darker the top of the frame is than the bottom
//   ?grain=4        the ground's grain: ± this many steps of 255 in the frame
//                   (the run has ColorManagement OFF, theme.js, so a unit in
//                   the shader is a unit on the display; on a page with it
//                   on, the steps are taken through the sRGB slope instead)
//   ?over=8         the full-frame grain: the frame multiplied by 1 − k·hash,
//                   k = this/100 (0 is off). One-sided, so it also dims what
//                   is lit by k/2 on average (4% at 8): a lit wall of 228
//                   measures 219, with a spread of ±18
//   ?fps=24         the grain's steps per second of the run's clock
//   ?channel=0      mix back toward the run's deep channel (1 is deep's halo
//                   and core on the noir colour, for a dark tunnel eye)
//   ?edge=past      the breakdown in the kaleido, on the noir ground
//   ?sperm=0        without the swimmer (read by the run's scenes)

export const options = { stencil: true };

const RUN = ['approach', 'kaleido', 'descent'];

// One step of 255 on the display, in the shader's units at a ground of
// luminance L. The run has ColorManagement OFF (theme.js): a colour is used
// as it is set and goes to the display as it is, so a shader unit IS a
// display unit — which is also why the run's 0x090b14 measures (9,11,20)
// in the frame. With it on, the ground would be stored linear and encoded
// on the way out, and a display step is 1/slope of a shader unit there.
function stepAt(THREE, L) {
	if (!THREE.ColorManagement.enabled) return 1 / 255;
	const slope = L <= 0.0031308 ? 12.92 : (1.055 / 2.4) * Math.pow(L, 1 / 2.4 - 1);
	return 1 / 255 / slope;
}

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const num = (k, d) => {
		const v = Number(q.get(k));
		return q.has(k) && Number.isFinite(v) ? v : d;
	};
	const SCENE = RUN.includes(q.get('scene')) ? q.get('scene') : 'run';
	const GROUND = ['noir', 'flat', 'deep'].includes(q.get('ground')) ? q.get('ground') : 'noir';
	const NOIR = GROUND !== 'deep';
	const LIFT = num('lift', 0.06);
	const WARM = num('warm', 1);
	const RAMP = GROUND === 'noir' ? num('ramp', 0.25) : 0;
	const GRAIN = GROUND === 'noir' ? num('grain', 4) : 0;
	const OVER = GROUND === 'noir' ? num('over', 8) : 0;
	const FPS = num('fps', 24);
	const CHANNEL = NOIR ? num('channel', 0) : 1;

	// ── The colour ───────────────────────────────────────────────────────
	// AIR's hue, in sRGB, scaled to `lift` of luminance; `warm` walks it
	// from a neutral grey of the same luminance. With ColorManagement off
	// the colour is used as set and shown as used, so the frame's black is
	// this hex, to the bit (measured: (12,11,9) at the top of the frame,
	// which is the hex times the ramp).
	const a = [(AIR >> 16) & 255, (AIR >> 8) & 255, AIR & 255].map((c) => c / 255);
	const aLum = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
	const s = a.map((c) => (c * LIFT) / aLum);
	const rgb = s.map((c) => LIFT + (c - LIFT) * WARM);
	const ground = new THREE.Color();
	if (NOIR) ground.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
	else ground.set(0x090b14);
	const hex = '#' + ground.getHexString();
	const L = 0.2126 * ground.r + 0.7152 * ground.g + 0.0722 * ground.b;
	const grainAmp = GRAIN * stepAt(THREE, Math.max(L, 1e-4));

	// ── The grain ────────────────────────────────────────────────────────
	// three/tsl's hash is an integer hash (pcg) on the seed's uint, so the
	// seed is built as an integer: the device pixel's index, hashed, spread
	// over 2^20 and stepped by the frame's seed. Under 2^24 throughout, so
	// float32 holds it exactly.
	const cell = screenCoordinate.x.floor().add(screenCoordinate.y.floor().mul(4096.0));
	const grainAt = (seed) => hash(hash(cell).mul(1048576.0).add(seed));

	// ── The ground ───────────────────────────────────────────────────────
	const bu = backdropUniforms();
	bu.color1.value.copy(ground);
	bu.uFade.value = 1;
	const gu = {
		uRamp: uniform(RAMP),
		uGrain: uniform(grainAmp),
		uSeed: uniform(0),
		uChannel: uniform(CHANNEL)
	};
	// vUv, y UP, as backdrop.js has it.
	const vUv = vec2(screenUV.x, screenUV.y.oneMinus());
	const noir = Fn(() => {
		const flat = bu.color1.mul(mix(float(1.0), float(1.0).sub(gu.uRamp), vUv.y));
		const col = mix(flat, deep(bu).rgb, gu.uChannel);
		const g = grainAt(gu.uSeed).sub(0.5).mul(2.0).mul(gu.uGrain);
		return vec4(max(col.add(g), 0.0), 1.0);
	})();
	const bg = NOIR ? noir : deep(bu);

	// ── The grain over everything ────────────────────────────────────────
	// A quad on the camera, drawn after the last thing the run draws (the
	// record is 200001), multiplying the frame: blend Zero · src + SrcColor
	// · dst, src = 1 − k·hash. Black stays black; what is lit is grained in
	// proportion. A different salt from the ground's, so the two do not line
	// up into one pattern.
	const ou = { uK: uniform(OVER / 100), uSeed: uniform(0) };
	const overMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.ZeroFactor,
		blendDst: THREE.SrcColorFactor,
		blendEquation: THREE.AddEquation
	});
	overMat.colorNode = Fn(() => {
		const g = grainAt(ou.uSeed.add(7919.0)).mul(ou.uK);
		return vec4(vec3(1.0).sub(g), 1.0);
	})();
	const over = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), overMat);
	over.renderOrder = 200002;
	over.frustumCulled = false;
	over.visible = OVER > 0;
	function fitOver(camera) {
		// Just past the near plane, sized to the frame there.
		const d = Math.max(camera.near * 4, 0.05);
		const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * d;
		over.position.z = -d;
		over.scale.set(h * camera.aspect, h, 1);
	}

	// ── The run ──────────────────────────────────────────────────────────
	// The run's own three scenes on the run's own nest and kaleidoscope, the
	// ground swapped and nothing else. ?edge= seeds the breakdown as the dev
	// keys do.
	if (DEV_EDGE) edge.set(DEV_EDGE);
	const nest = await createNest({ THREE, renderer });
	const kal = createKaleidoscope({ THREE, nest });
	const hosts = {
		approach: await createApproach({ THREE, renderer, nest, kal }),
		kaleido: createKaleido({ THREE, renderer, nest, kal }),
		descent: createDescent({ THREE, renderer, nest })
	};
	// The descent's camera is in no scene of its own; the quad rides it.
	hosts.descent.scene.add(hosts.descent.camera);
	for (const n of RUN) hosts[n].scene.backgroundNode = bg;

	const ORDER = SCENE === 'run' ? RUN : [SCENE];
	const DUR = Object.fromEntries(RUN.map((n) => [n, SCENES[n].duration]));
	const TOTAL = ORDER.reduce((sum, n) => sum + DUR[n], 0);
	function where(u) {
		let sec = clamp01(u) * TOTAL;
		for (let i = 0; i < ORDER.length; i++) {
			const n = ORDER[i];
			if (sec <= DUR[n] || i === ORDER.length - 1) return { name: n, p: clamp01(sec / DUR[n]) };
			sec -= DUR[n];
		}
		return { name: ORDER[0], p: 0 };
	}

	// Entered IN RUN ORDER, so a frame of the descent has the rooms the run
	// would have arrived with (a fresh run reshuffles them, as it does on
	// the site). The approach's enter() is the fresh run.
	let current = null;
	function host(name) {
		if (current === name) return;
		const from = current === null ? 0 : RUN.indexOf(current) + 1;
		const to = RUN.indexOf(name);
		if (to < from) hosts[name].enter();
		else for (let i = from; i <= to; i++) hosts[RUN[i]].enter();
		current = name;
		hosts[name].camera.add(over);
	}

	const info = {
		scene: SCENE,
		ground: GROUND,
		hex,
		lift: LIFT,
		warm: WARM,
		ramp: RAMP,
		grainSteps: GRAIN,
		grainAmp: Number(grainAmp.toFixed(5)),
		colorManagement: THREE.ColorManagement.enabled,
		over: OVER,
		fps: FPS,
		channel: CHANNEL,
		edge: DEV_EDGE,
		total: TOTAL
	};

	function set(u) {
		const { name, p } = where(u);
		host(name);
		const sc = hosts[name];
		sc.set(p);
		const secs = runSeconds(name, p);
		const seed = Math.floor(secs * FPS);
		gu.uSeed.value = seed;
		ou.uSeed.value = seed;
		fitOver(sc.camera);
		info.host = name;
		info.p = Number(p.toFixed(4));
		info.seconds = Number(secs.toFixed(3));
		info.seed = seed;
	}

	function resize(w, h) {
		for (const n of RUN) hosts[n].resize(w, h);
		bu.aspectRatio.value = w / h;
		bu.uPx.value = 1 / renderer.domElement.height;
		if (current) fitOver(hosts[current].camera);
	}

	const size = renderer.getSize(new THREE.Vector2());
	resize(size.x, size.y);

	let tt = at !== null ? at * TOTAL : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			// The swimmer's roll is on its own clock, as everywhere in the run.
			nest.swimmer.clock += dt;
			tt = (tt + dt) % (TOTAL + 1.5);
			set(Math.min(tt / TOTAL, 1));
		},
		seek(u) {
			tt = clamp01(u) * TOTAL;
			set(clamp01(u));
		},
		render() {
			hosts[current].render();
		},
		resize
	};
}
