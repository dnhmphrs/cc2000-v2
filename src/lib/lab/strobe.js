import { vec4, uniform } from 'three/tsl';
import {
	SCENES,
	NEST,
	LENS,
	runSeconds,
	span,
	accelerate,
	smootherstep,
	smoothstep
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createNest } from '$lib/three/world/nest';
import { wobbleEuler } from '$lib/three/world/wobble';

// ── Sketch: the strobe ───────────────────────────────────────────────────────
// The splosh as a cut. Today the swimmer leaves the axis for the last room's
// glass and goes in, and the glass goes white under it — a blot that spreads
// from the point it went in, with a DOM flash over the frame (the `blaze`
// store) that fades out — soft, and it never stops. Evangelion's impact is
// the one you never see: a frame of NEGATIVE, a frame or two of WHITE, a hard
// cut to BLACK, a hold with nothing in it, and when the picture comes back
// the world is different and already going on. A conception is the one event
// in the story that happens between two frames, so it is cut like one.
//
// The end of the descent as the run has it — the real nest (world/nest.js),
// the real fall (nest.zetaOf, nest.pose), the run's one lens, the run's one
// hand on the camera coming off over the settle, the dive off the axis to the
// last glass — from `from` of the scene to the landing, and on into a landed
// tail on the sketch's own clock, as the run's hold(dt) is. Then, at the
// frame the swimmer is gone (SCENES.descent.gone):
//
//   the NEGATIVE   one frame: the whole picture inverted — the off-black
//                  ground gone to a warm white, the room's colours turned,
//                  and where the swimmer is, on the glass, an orange smear:
//                  the last thing you see of it. A quad over the frame
//                  blended (1 − dst)·src with src white, so it is the true
//                  negative of whatever was drawn, with no pass, no
//                  framebuffer read and the stencil chain untouched
//   the WHITE      two frames, edge to edge, flat
//   the BLACK      a hard cut, not a fade — 0.6 s of black with nothing in
//                  it, running past the scene's end into the tail: the run's
//                  first silence
//   the ROOM       on one frame, no fade: landed, level, the hand off, its
//                  glass already WHITE — the state has changed, nothing
//                  spreads — held `hold` seconds with nothing moving, then
//                  the white drains as the run's hold(dt) drains it
//
// FRAMES, not seconds. The windows are whole frames of `fps` off the scene's
// seconds — f = floor(s·fps), the strike at the frame `gone` falls in — so a
// pin is exact: ?at= lands in a frame or it does not, and two loads of the
// same pin draw the same beat. The swimmer is drawn through the negative and
// stepped off at the first white or black frame; the blot is off (?spread)
// and the glass steps to white when the room comes back. In a live run the
// three strobe frames are never skipped: if the clock would jump past one
// that has not been drawn, it stops at that frame (a slow machine sees the
// strobe a few ms late; the pins are untouched — that latch is the one thing
// here that is not a pure function of progress, and it only ever fires in
// update()).
//
// Reduced motion (prefers-reduced-motion, or ?reduced=1): no negative and no
// white — a full-screen strobe has no business on that setting — the cut to
// black at the strike is kept, the blot spreads as today under it, and the
// room comes back out of the black over `fade` seconds rather than on a cut.
//
// Not here: the DOM raster (Glass.svelte) that sits over the run and comes
// off over `landing` — Eva's strobe is on a TV and would keep it — and the
// readout in the glass, which in the run should be up on the cut, not fading
// in after it. The swimmer's roll is on ζ rather than its clock, for the
// pins. info.pins gives the ?at= of every beat's first frame.
//
//   ?from=0.84       the descent progress the sketch opens at
//   ?fps=24          the frame the windows are counted in
//   ?order=neg,white,black   the strobe, in order (drop a name to drop it)
//   ?neg=1 ?white=2  frames of negative and of white
//   ?black=0.6       seconds of black (rounded to frames)
//   ?hold=0.4        seconds the white glass is held before the drain
//   ?spread=0        how much of today's blot draws before the black
//                    (1 is the run's splosh; 0 none — the glass steps)
//   ?fade=0          seconds the room comes back out of the black over
//                    (0 is the cut; reduced motion defaults to 0.3)
//   ?reduced=1       the reduced-motion path, whatever the system says
//   ?frame=0         pin the middle of strike frame + k, ignoring ?at=
//                    (?frame=-1 the frame before, ?frame=3 the first black)
//   ?decades=60s,90s,50s,10s,60s,90s   the rooms, outermost first
//   ?wobble=0        without the hand on the camera
//   ?sperm=0         without the swimmer

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const num = (k, d) => {
		const v = Number(q.get(k));
		return q.has(k) && Number.isFinite(v) ? v : d;
	};
	const T = SCENES.descent;
	const REDUCED = q.has('reduced')
		? q.get('reduced') !== '0'
		: !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	const FROM = num('from', 0.84);
	const FPS = Math.max(1, num('fps', 24));
	const ORDER = (q.get('order') ?? 'neg,white,black').split(',');
	const NEG = REDUCED ? 0 : Math.max(0, Math.round(num('neg', 1)));
	const WHITE = REDUCED ? 0 : Math.max(0, Math.round(num('white', 2)));
	const BLACK = Math.max(0, num('black', 0.6));
	const HOLD = Math.max(0, num('hold', 0.4));
	const SPREAD = Math.max(0, Math.min(1, num('spread', REDUCED ? 1 : 0)));
	const FADE = Math.max(0, num('fade', REDUCED ? 0.3 : 0));
	const ROOMS = (q.get('decades') ?? '60s,90s,50s,10s,60s,90s').split(',');
	const WOBBLE = q.get('wobble') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const FRAME =
		q.has('frame') && Number.isFinite(Number(q.get('frame'))) ? Number(q.get('frame')) : null;

	// ── The frames ───────────────────────────────────────────────────────
	// Seconds of the sketch: the scene from `from` to its end, then the tail.
	// The strike is the frame `gone` falls in; the windows are counted from
	// it, in the order given, and the room comes back on the frame after the
	// last of them.
	const SCENE_S = (1 - FROM) * T.duration;
	const sStrike = (T.gone - FROM) * T.duration;
	const fStrike = Math.floor(sStrike * FPS + 1e-9);
	const BLACKF = Math.round(BLACK * FPS);
	const frames = { neg: NEG, white: WHITE, black: BLACKF };
	const win = {};
	let k0 = 0;
	for (const name of ORDER) {
		if (!(name in frames)) continue;
		win[name] = [k0, k0 + frames[name]];
		k0 += frames[name];
	}
	for (const name of Object.keys(frames)) if (!win[name]) win[name] = [0, 0];
	const K_BACK = k0; // frames after the strike the room comes back
	const fBack = fStrike + K_BACK;
	const sBack = fBack / FPS;
	const STROBE = win.neg[1] > win.neg[0] || win.white[1] > win.white[0];
	const kStrobeEnd = Math.max(win.neg[1], win.white[1]); // the latch covers these
	const DRAIN = T.drain - 0.15; // the run's hold() drains over smoothstep(0.15, drain)
	const DURATION = Math.max(SCENE_S, sBack) + HOLD + DRAIN + 0.5;
	const inWin = ([a, b], k) => k >= a && k < b;
	const atOf = (f) => Number(((f + 0.5) / FPS / DURATION).toFixed(4));

	// ── The room, as the run has it ──────────────────────────────────────
	const scene = new THREE.Scene();
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.05, 100);
	scene.add(camera); // the strobe quads are its children
	let aspect = 1;

	const nest = await createNest({ THREE, renderer });
	nest.build({ rooms: ROOMS, portrait: false });
	scene.add(nest.root);
	const sw = nest.swimmer;
	scene.add(sw.group);
	scene.updateMatrixWorld(true);

	// ── The three quads ──────────────────────────────────────────────────
	// Full-frame children of the camera, drawn after everything (the record
	// is 200001, the swimmer 100000), depth and stencil off. The negative is
	// a blend, not a shader: out = (1 − dst)·src, src white, so it inverts
	// whatever the frame holds. The white and the black are flat; the black
	// has an alpha, for the reduced-motion fade.
	const plane = new THREE.PlaneGeometry(1, 1);
	// The ALPHA function is set apart, and it is load-bearing: left to
	// follow the colour's, it is (1 − dstA)·srcA = 0, the frame's alpha goes
	// to nil, and the compositor shows the page's black through it — a black
	// frame with the swimmer over it, on both lanes. Checked.
	const negMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneMinusDstColorFactor,
		blendDst: THREE.ZeroFactor,
		blendSrcAlpha: THREE.OneFactor,
		blendDstAlpha: THREE.ZeroFactor,
		blendEquation: THREE.AddEquation
	});
	negMat.colorNode = vec4(1, 1, 1, 1);
	const whiteMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.NoBlending
	});
	whiteMat.colorNode = vec4(1, 1, 1, 1);
	const uBlack = uniform(0);
	const blackMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false
	});
	blackMat.colorNode = vec4(0, 0, 0, uBlack);
	// In a GROUP of their own with the top order: the renderer sorts on the
	// nearest group's renderOrder before the mesh's, and the swimmer's group
	// carries 100000 — without this the swimmer's front pass draws after the
	// quad, additive blue-white on the negative's white glass, and vanishes.
	const strobe = new THREE.Group();
	strobe.renderOrder = 400000;
	camera.add(strobe);
	const quad = (mat, order) => {
		const m = new THREE.Mesh(plane, mat);
		m.renderOrder = order;
		m.frustumCulled = false;
		m.visible = false;
		strobe.add(m);
		return m;
	};
	const neg = quad(negMat, 300000);
	const white = quad(whiteMat, 300001);
	const black = quad(blackMat, 300002);
	function fitQuads() {
		// Well inside the frustum whatever the pose set near and far to.
		const Z = 10 * camera.near;
		const h = 2 * Math.tan(rad(camera.fov) / 2) * Z;
		const w = h * aspect;
		for (const m of [neg, white, black]) {
			m.scale.set(w, h, 1);
			m.position.set(0, 0, -Z);
		}
	}

	// ── The frame at s ───────────────────────────────────────────────────
	const info = {
		rooms: ROOMS,
		reduced: REDUCED,
		fps: FPS,
		order: ORDER.join(','),
		frames: { neg: NEG, white: WHITE, black: BLACKF },
		black: BLACK,
		hold: HOLD,
		spread: SPREAD,
		fade: FADE,
		fStrike,
		strikeSec: Number((fStrike / FPS).toFixed(4)),
		backSec: Number(sBack.toFixed(4)),
		sceneSec: Number(SCENE_S.toFixed(4)),
		duration: Number(DURATION.toFixed(4)),
		pins: {
			dive: Number(((sStrike - 0.5) / DURATION).toFixed(4)),
			strike: atOf(fStrike),
			neg: atOf(fStrike + win.neg[0]),
			white: atOf(fStrike + win.white[0]),
			black: atOf(fStrike + win.black[0]),
			room: atOf(fBack),
			drained: Number(((sBack + HOLD + DRAIN) / DURATION).toFixed(4))
		},
		// The frame drawn now, live: window.__lab.now (see set()).
		now: { caught: 0 }
	};
	const fwd = new THREE.Vector3();
	const pos = new THREE.Vector3();
	const wq = new THREE.Quaternion();
	const euler = new THREE.Euler();
	let lastF = -1;

	function set(p) {
		const s = p * DURATION;
		const u = Math.max(0, Math.min(1, FROM + s / T.duration));
		const f = Math.floor(s * FPS + 1e-6);
		const k = f - fStrike;
		lastF = f;

		// The fall, the landing, the hand coming off: descent.js set().
		const zeta = nest.zetaOf(u);
		const { D, fov, settle } = nest.pose(zeta, camera, aspect);
		nest.setDiscRin(aspect);
		nest.setFunnel(u);
		if (WOBBLE) {
			camera.quaternion.multiply(
				wq.setFromEuler(wobbleEuler(euler, runSeconds('descent', u), 1 - settle))
			);
		}
		camera.updateMatrixWorld(true);
		fitQuads();

		// The swimmer, riding and then diving as the run has it — and drawn
		// through the negative, stepped off at the first white or black.
		const ride = NEST.spermRide * D;
		const bodyH = NEST.spermSpan * 2 * ride * Math.tan(rad(fov) / 2);
		fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
		pos.copy(camera.position).addScaledVector(fwd, ride);
		const dive = accelerate(span(u, T.dive), 2.4);
		if (dive > 0) pos.lerp(nest.lastGlassWorld().centre, dive);
		sw.group.position.copy(pos);
		sw.group.quaternion.copy(camera.quaternion);
		sw.group.scale.setScalar(bodyH);
		sw.spin(-zeta * 1.5);
		sw.material.uniforms.uTime.value = zeta * 3.0;
		const swimmerOn = k < 0 || inWin(win.neg, k);
		sw.material.uniforms.uOpacity.value = SPERM && swimmerOn ? 1 : 0;

		// The strobe.
		neg.visible = inWin(win.neg, k);
		white.visible = inWin(win.white, k);
		let blackA = inWin(win.black, k) ? 1 : 0;
		if (FADE > 0 && k >= K_BACK) blackA = 1 - smoothstep(0, FADE, s - sBack);
		uBlack.value = blackA;
		black.visible = blackA > 0.001;

		// The glass: today's blot (scaled by `spread`) until the black; then,
		// on the frame the room comes back, white — and the drain, as hold().
		let held = 0;
		if (k < K_BACK) {
			nest.setSplosh(SPREAD * smootherstep(span(u, T.splosh)), 1);
		} else {
			held = s - sBack;
			nest.setSplosh(1, 1 - smoothstep(HOLD, HOLD + DRAIN, held));
		}

		// `now` is one object mutated in place: the lab page spreads info into
		// window.__lab once, so only a nested object reads live.
		const now = info.now;
		now.s = Number(s.toFixed(4));
		now.u = Number(u.toFixed(4));
		now.f = f;
		now.k = k;
		now.zeta = Number(zeta.toFixed(3));
		now.settle = Number(settle.toFixed(3));
		now.dive = Number(dive.toFixed(3));
		now.held = Number(held.toFixed(3));
		now.beat = neg.visible
			? 'negative'
			: white.visible
				? 'white'
				: blackA >= 0.999
					? 'black'
					: blackA > 0.001
						? 'fade'
						: k < 0
							? dive > 0
								? 'dive'
								: 'fall'
							: held < HOLD
								? 'room'
								: held < HOLD + DRAIN
									? 'drain'
									: 'drained';
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;
	bu.aspectRatio.value = aspect;
	bu.uPx.value = 1 / size.y;

	const PIN = FRAME !== null ? atOf(fStrike + FRAME) : at;
	info.pinned = PIN;
	let tt = PIN !== null ? PIN * DURATION : 0;
	set(PIN !== null ? PIN : 0);

	return {
		info,
		update(dt) {
			if (FRAME !== null) return;
			let s = tt + dt;
			if (s > DURATION + 1.5) {
				s = 0;
				lastF = -1;
			}
			// The latch: a strobe frame that has not been drawn is not
			// skipped over. Live only — a pin never comes through here.
			const nxt = lastF + 1;
			if (STROBE && nxt - fStrike >= 0 && nxt - fStrike < kStrobeEnd && Math.floor(s * FPS) > nxt) {
				s = (nxt + 0.5) / FPS;
				info.now.caught++;
			}
			tt = s;
			set(Math.min(tt / DURATION, 1));
		},
		seek(v) {
			tt = v * DURATION;
			lastF = -1;
			set(Math.max(0, Math.min(1, v)));
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
