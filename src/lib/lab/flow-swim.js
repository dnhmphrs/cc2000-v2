import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	bloom,
	PAL,
	TAU,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	tag,
	add3,
	mul3
} from './log/board.js';
import { spline, orbit, makeDepth, paint, pxPerUnit, NEAR, lerp3 } from './log/space.js';
import { drawOrb, impact, glow, lit } from './log/ink.js';
import { loadRooms, roomOf, drawRoom, mips, pick, PLATE, LAYERS, DECADES } from './log/rooms.js';
import { drawHelix, poseOn } from './log/helix.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';

// ── Flow: swim — the swimmer in view from the start, for comparison ──────────
// The lead's first description of the run, built whole so it can be set
// beside the six that hide the swimmer. It gives the joke away on purpose.
//
// One geometry the whole way: the net of the complex log — golden loxodromes
// θ = x/K + 2πj/8 round the point, spokes θ = −x/K′ + 2π(j + ½)/8 across them
// (log-mobius's torus net, in ink) — which is a plane round the point while
// the questions are asked, folds into the tube a zoom flies down after the
// flash, and glues into the torus whose flat universe is the lattice of rooms.
//
//   0–10 s    the terminal (log-dawn's, 0.8, no command line): the card typed,
//             the full stop lights, the lens zooms into it: the orb, 6 px,
//             at the centre.
//   10–12.8   the approach: the net writes out of the light in chalk; the lens
//             flies at the point (a log zoom: the net streams out past the
//             edges) and the HELIX SWIMMER rises into view ahead of it,
//             swimming at the light and turning on its own axis, the lens
//             behind and a little above it so the tail's corkscrew reads.
//   12.8–20.7 the questions, under the light: written and typed on the clock;
//             each answer sends the swimmer darting ahead and the lens a step
//             closer after it (the net streams, the prompt is flown past).
//   20.7–24   the spiral in: the swimmer leaves the axis onto the golden
//             spiral the net is made of — a cone of it, tightening into the
//             point — and dwindles into the light; the lens comes onto the
//             axis behind it, only gathering pace. The zoom reaches exactly
//             the net's own period (19 rings, 30×, a turn of 5°), so the net
//             at the flash IS the net at the start.
//   24        the flash: the moment. The swimmer is gone.
//   24–33.6   the torus: the plane folds into the funnel and the tube (β 1→0),
//             the lens backing out and climbing round; the tube bends and its
//             two ends — toward 0 and toward ∞ — glue (z ∼ λz): the torus,
//             the lit mouth its seam. The lens climbs over the seam and dives
//             at a window on it, through which the rooms are already there.
//   31–38.8   the rooms: the window opens onto the torus's flat universe — the
//             one room repeated in a lattice, every copy chalk, the lens a
//             cell off and wide — and the lens slides into the one cell,
//             narrowing to the landing lens; colour floods it as it enters.
//   39–43     the room, in colour, the glass lit, swaying on its depths.
//
// Three beats after the last answer: the spiral in and the flash; the torus;
// the rooms. A pure function of progress; ?at= pins any frame. ?decade=60s.

const SECONDS = 43;

// The beats, in seconds.
const T = {
	term: 10,
	write: [10, 12.2],
	swimIn: [10.3, 12.8],
	q1: [12.8, 13.5],
	a1: [13.7, 15.0],
	enter1: [15.05, 15.5],
	step1: [15.6, 16.9],
	q2: [17.1, 17.7],
	a2: [17.9, 18.8],
	enter2: [18.85, 19.3],
	step2: [19.4, 20.7],
	spiral: [20.7, 24],
	flash: 24,
	torus: [24, 33.6],
	dive: [31.6, 33.6],
	slide: [30.8, 38.8],
	colour: [37.2, 39.2],
	sway: [38.6, 39.8]
};

const ease = (t, [a, b]) => easeInOutCubic(span(t, a, b));
const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));
const io = (x) => easeInOutCubic(clamp01(x));

// ── The net ──────────────────────────────────────────────────────────────────
// In ζ = log z = x + iθ: arm j of the first family is θ = (x − m)/K + 2πj/N,
// of the second θ = −(x − m)/KP + 2π(j + ½)/N; m the flow along x. The tube's
// half-length TX and the second pitch KP are log-mobius's, tuned so both
// families close round the torus. RING is the node spacing along x — and the
// smallest zoom the net goes to itself under (with a turn of RING/K).
const K = GOLDEN_K;
const N = 8;
const TX = (Math.PI * 52 * K) / N;
const KP = (2 * TX * N) / (TAU * 18);
const RING = TAU / (N * (1 / K + 1 / KP));
// The approach's whole zoom: 19 rings, so the frame at the flash is the frame
// at the start, and the turn that makes it exact (the nearest to none).
const N_RINGS = 19;
const Z_TOTAL = N_RINGS * RING;
const PSI_TOTAL = (() => {
	const cell = TAU / N;
	let r = ((N_RINGS * RING) / K) % cell;
	if (r > cell / 2) r -= cell;
	return -r;
})();

// The surface: β = 1 the plane, the conformal cones ρ = e^{βx} on the way,
// β = 0 the unit cylinder; then the axis bent round by φ, 0 → 2π, which
// glues the ends (log-mobius's tube).
function tube([x, th], beta, phi) {
	let rho;
	let z;
	if (beta > 1e-6) {
		rho = Math.exp(beta * x);
		z = (Math.sqrt(Math.max(0, 1 - beta * beta)) * Math.expm1(beta * x)) / beta;
	} else {
		rho = 1;
		z = x;
	}
	const px = rho * Math.cos(th);
	const py = rho * Math.sin(th);
	if (phi < 1e-4) return [px, py, z];
	const Rb = (2 * TX) / phi;
	const psi = z / Rb;
	return [Rb - (Rb - px) * Math.cos(psi), py, (Rb - px) * Math.sin(psi)];
}
const P_TOP = tube([TX, Math.PI / 2], 0, TAU); // the top of the seam

function arm(fam, j, m, x0, x1, dx) {
	const n = Math.max(2, Math.ceil((x1 - x0) / dx));
	const out = [];
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		out.push([x, fam ? -(x - m) / KP + (TAU * (j + 0.5)) / N : (x - m) / K + (TAU * j) / N]);
	}
	return out;
}
function nodesOf(m, x0, x1) {
	const out = [];
	const l0 = Math.ceil((x0 - m) / RING);
	const l1 = Math.floor((x1 - m) / RING);
	for (let l = l0; l <= l1; l++)
		for (let j = 0; j < N; j++) out.push([m + l * RING, (l * RING) / K + (TAU * j) / N]);
	return out;
}

// A 3D polyline as screen runs: cut at the near plane, split where it goes
// behind the surface in `depth`, where its `fade` (per sample) drops out, and
// where it leaves the board by more than `pad` px (so a lens close to the
// surface does not stroke miles of line it cannot see).
function runsOf(cam, pts, { depth = null, fade = null, w, h, pad = 160 }) {
	const out = [];
	let run = null;
	let pq = null;
	let pf = 1;
	const end = () => {
		if (run && run.Q.length > 1) out.push(run);
		run = null;
	};
	for (let i = 0; i < pts.length; i++) {
		const q = cam.project(pts[i]);
		const f = fade ? fade(i) : 1;
		const ok = q[2] > NEAR && Number.isFinite(q[0] + q[1]);
		const on = ok && f >= 0.01 && q[0] > -pad && q[0] < w + pad && q[1] > -pad && q[1] < h + pad;
		if (!on) {
			if (run && ok && f >= 0.01) run.Q.push([q[0], q[1], q[2], f]);
			end();
			pq = ok ? q : null;
			pf = f;
			continue;
		}
		const back = depth ? depth.hidden(q) : false;
		if (!run) {
			run = { Q: [], back };
			if (pq && pf >= 0.01) run.Q.push([pq[0], pq[1], pq[2], pf]);
		} else if (back !== run.back) {
			run.Q.push([q[0], q[1], q[2], f]);
			end();
			run = { Q: [], back };
		}
		run.Q.push([q[0], q[1], q[2], f]);
		pq = q;
		pf = f;
	}
	end();
	return out;
}

// Many small discs in one path, by alpha bucket.
function dots(ctx, list, fill) {
	const B = [[], [], [], []];
	for (const d of list) B[Math.min(3, Math.floor(d[3] * 4))].push(d);
	ctx.save();
	ctx.fillStyle = fill;
	for (let k = 0; k < 4; k++) {
		if (!B[k].length) continue;
		ctx.globalAlpha = (k + 0.5) / 4;
		ctx.beginPath();
		for (const [x, y, r] of B[k]) {
			ctx.moveTo(x + r, y);
			ctx.arc(x, y, r, 0, TAU);
		}
		ctx.fill();
	}
	ctx.restore();
}

// The net in ink through `place` (ζ → 3D): the spirals a confident chalk
// line, the spokes thinner and dimmer, grey nodes where they cross; the far
// side faint and dashed. `fade(x)` dims by x (into the light); `xw` writes
// the net on out to there.
function drawNet(ctx, cam, place, o) {
	const {
		w,
		h,
		m,
		x0,
		x1,
		depth = null,
		fade = null,
		alpha = 1,
		ref = 0,
		hid = 0.32,
		dx = [0.012, 0.03],
		node = 1,
		nodeCap = 9
	} = o;
	const lines = [];
	for (let fam = 0; fam < 2; fam++)
		for (let j = 0; j < N; j++) {
			const Z = arm(fam, j, m, x0, x1, dx[fam]);
			const f = fade ? (i) => fade(Z[i][0]) : null;
			lines.push({
				R: runsOf(cam, Z.map(place), { depth, fade: f, w, h }),
				width: fam ? 1.1 : 1.8,
				alpha: alpha * (fam ? 0.5 : 0.85)
			});
		}
	for (const L of lines)
		paint(ctx, L.R, { color: PAL.chalk, width: L.width, alpha: L.alpha, ref, hid }, 'back');
	for (const L of lines)
		paint(ctx, L.R, { color: PAL.chalk, width: L.width, alpha: L.alpha, ref, hid }, 'front');
	if (node > 0) {
		const front = [];
		const back = [];
		for (const c of nodesOf(m, x0 + 0.05, x1 - 0.05)) {
			const f = fade ? fade(c[0]) : 1;
			if (f < 0.03) continue;
			const q0 = cam.project(place(c));
			if (q0[2] <= NEAR || q0[0] < -20 || q0[0] > w + 20 || q0[1] < -20 || q0[1] > h + 20) continue;
			const q1 = cam.project(place([c[0] + 0.14 * RING, c[1]]));
			const r = Math.min(nodeCap, Math.hypot(q1[0] - q0[0], q1[1] - q0[1]));
			if (r < 0.6) continue;
			const hidden = depth ? depth.hidden(q0) : false;
			(hidden ? back : front).push([
				q0[0],
				q0[1],
				r,
				(hidden ? 0.5 * hid : 0.85) * f * alpha * node
			]);
		}
		if (back.length) dots(ctx, back, PAL.node);
		if (front.length) dots(ctx, front, PAL.node);
	}
}

// ── The lens's zoom over the approach ────────────────────────────────────────
// Z(t) is how far the lens has gone into the point, in x: a slow creep the
// whole way (so nothing freezes), one step per answer, and the spiral in,
// which only gathers, landing exactly on Z_TOTAL at the flash.
const CREEP = 0.04;
const STEP = 0.75;
const SPIRAL_Z = Z_TOTAL - CREEP * (T.flash - T.term) - 2 * STEP;
function zoomAt(t) {
	const tt = Math.min(t, T.flash);
	return (
		CREEP * (tt - T.term) +
		STEP * ease(tt, T.step1) +
		STEP * ease(tt, T.step2) +
		SPIRAL_Z * Math.pow(span(tt, T.spiral[0], T.spiral[1]), 2.4)
	);
}

// The swimmer's station ahead of the lens, as a fraction of the lens's
// distance from the point (1 at the lens, 0 at the point): it rises into
// view from the lens's foot, holds, darts on each answer, and goes for the
// light in the spiral.
const Q_REST = 0.3;
const DART = 0.075;
function qAt(t) {
	const inK = smooth(span(t, T.swimIn[0], T.swimIn[1]));
	let q = lerp(0.97, Q_REST, inK);
	q -= DART * (Math.sin(Math.PI * ease(t, T.step1)) + Math.sin(Math.PI * ease(t, T.step2)));
	const sp = span(t, T.spiral[0], T.spiral[1]);
	q = lerp(q, 0.045, smooth(Math.pow(sp, 1.3)));
	return q;
}

// The approach's lens: on a ray through the point, EPS above the axis, which
// it comes down onto during the spiral in.
const FOV_A = 40;
const EPS = 0.35;
const epsAt = (t) => EPS * (1 - smooth(span(t, T.spiral[0], T.spiral[1] - 0.3)));

// The swimmer's track: a straight line into the point, off the lens's axis —
// down and to the left of it in the lens's frame at rest (A along right, B
// along up), so the lens is behind it and above, at an angle the tail's
// corkscrew reads at, and it swims clear of the question. TRACK is that
// line's direction in the world, from the point out, and in cylindrical
// coordinates about the point's axis: the cone the spiral in winds round.
const SWIM = { a: -0.5, b: -0.35, head: 0.03 };
const TRACK = (() => {
	const n = Math.hypot(1, SWIM.a, SWIM.b);
	const t = [
		SWIM.a / n,
		(Math.sin(EPS) + SWIM.b * Math.cos(EPS)) / n,
		(Math.cos(EPS) - SWIM.b * Math.sin(EPS)) / n
	];
	return { rho: Math.hypot(t[0], t[1]), th: Math.atan2(t[1], t[0]), z: t[2] };
})();

export default async function make({ at }) {
	const b = getBoard();
	const time = clock(SECONDS, at);
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	const decade = DECADES.includes(q?.get('decade')) ? q.get('decade') : '90s';
	const term = makeTerminal(0.8, { cmd: false });
	const depth = makeDepth(4);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-swim · loading the rooms');
	const art = await loadRooms({ decades: [decade], chalk: true });
	const flat = art[decade]?.bg ? mips(flatRoom(art, decade, 1024)) : null;
	const S = { art, flat, decade, depth, b };
	const info = { seconds: SECONDS, decade, missing: art.missing };
	let geo = null;
	let frames = 0;
	let ms = 0;

	function render() {
		const t0 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (!geo || geo.w !== w || geo.h !== h) geo = setup(w, h);
		S.geo = geo;
		if (t < T.term) term.draw(ctx, w, h, t / T.term, t, t - T.term);
		else if (t < T.flash) approach(ctx, w, h, t, S);
		else if (t < T.dive[1]) torus(ctx, w, h, t, S);
		else rooms(ctx, w, h, t, S, 1);
		// The flash: the moment, over everything. On a ten-second clock so
		// its attack and decay are log-beat's.
		if (t > T.flash - 0.2 && t < T.flash + 2.2)
			impact(ctx, w, h, w / 2, h / 2, 0.36 * Math.min(w, h), t / 10, T.flash / 10, 1.4, true);
		tag(ctx, w, h, 'flow-swim');
		// The frame's cost, averaged over thirty, where the lab reads it — and
		// the clock, so a live run can be compared with a pin at the same t.
		if (window.__lab) window.__lab.t = t;
		ms += performance.now() - t0;
		if (++frames === 30) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs;
			frames = 0;
			ms = 0;
		}
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Per board size ───────────────────────────────────────────────────────────
// The approach's lens scale; the landing; the lattice's lenses; and the
// window on the torus: a patch of the seam's top, in the final lens's own
// axes, sized so that lens sees exactly the board through it.
const FOV_L = 34; // the landing lens, degrees vertical (log-fall's)
const FOV_W = 66; // the lattice's wide lens, at the start of the slide
const D_END = 0.3; // the dive ends this far over the seam
// The lens's path round the torus is log-mobius's; the dive at its end
// brakes over its last half second (the keys past 0.86), so the window
// reaches the board at a walking pace and the slide through the rooms
// carries on from it, rather than a zoom stopping dead at the cut.
const TORUS_KEYS = {
	az: [
		[0, 0],
		[0.14, 0.02],
		[0.4, 0.5],
		[0.66, 1.35],
		[0.86, 1.62],
		[0.95, 1.9],
		[1, 1.95]
	],
	el: [
		[0, 0],
		[0.14, 0.02],
		[0.4, 0.36],
		[0.66, 0.82],
		[0.86, 1.18],
		[0.95, 1.5],
		[1, Math.PI / 2 - 1e-3]
	],
	fov: [
		[0, FOV_A],
		[0.8, 42],
		[0.95, 62],
		[1, 64]
	]
};
function setup(w, h) {
	const k = pxPerUnit(h, FOV_A);
	const R0 = 0.42 * Math.min(w, h);
	const D0 = k / R0; // the unit circle at R0 px, from straight above
	const dist = [
		[0, D0],
		[0.12, D0 * 1.06],
		[0.4, 16.5],
		[0.66, 10.5],
		[0.86, 4.4],
		[0.91, 1.6],
		[0.95, 0.55],
		[0.98, 0.33],
		[1, D_END]
	];
	// The window: in the axes of the lens at the end of the dive.
	const last = (keys) => keys[keys.length - 1][1];
	const fovEnd = last(TORUS_KEYS.fov);
	const camEnd = orbit(w, h, {
		target: P_TOP,
		az: last(TORUS_KEYS.az),
		el: last(TORUS_KEYS.el),
		dist: D_END,
		fov: fovEnd
	});
	const hr = D_END * Math.tan((fovEnd * Math.PI) / 360);
	const hw = (hr * w) / h;
	const R = camEnd.r;
	const U = camEnd.u;
	const win = [
		add3(P_TOP, add3(mul3(R, -hw), mul3(U, hr))),
		add3(P_TOP, add3(mul3(R, hw), mul3(U, hr))),
		add3(P_TOP, add3(mul3(R, hw), mul3(U, -hr))),
		add3(P_TOP, add3(mul3(R, -hw), mul3(U, -hr)))
	];
	// The landing, and the lattice's cell: the room's box, the landing lens
	// on its front face (log-passage's torus).
	const height = Math.min(0.62 * h, (0.74 * w) / 1.618033988749895);
	const F0 = h / 2 / Math.tan((FOV_L * Math.PI) / 360);
	const d0 = (F0 * PLATE.H) / height;
	const Fw = h / 2 / Math.tan((FOV_W * Math.PI) / 360);
	return { w, h, k, R0, D0, dist, win, F0, Fw, d0, Dz: PLATE.DEPTH + d0, pace: paceOf(3, 0.2) };
}

// Progress → distance along a path: at rest, gathering pace, easing to land
// (log-fall's ease), tabled.
function paceOf(p = 3, c = 0.2, n = 512) {
	const Tb = [0];
	let acc = 0;
	for (let i = 1; i <= n; i++) {
		const x = (i - 0.5) / n;
		acc += Math.pow(c + x, p) * (1 - x) * (1 - x);
		Tb.push(acc);
	}
	return (x) => {
		const f = clamp01(x) * n;
		const i = Math.min(n - 1, Math.floor(f));
		return lerp(Tb[i], Tb[i + 1], f - i) / acc;
	};
}

// ── The approach and the questions ───────────────────────────────────────────
function lensAt(t, geo) {
	const { w, h, D0 } = geo;
	const D = D0 * Math.exp(-zoomAt(t));
	return { D, cam: orbit(w, h, { target: [0, 0, 0], az: 0, el: epsAt(t), dist: D, fov: FOV_A }) };
}

// The swimmer, in the world: on its track ahead of the lens, then wound
// round the point's axis on the same cone — from rest, with the net's own
// rate and hand (ρ = e^{Kθ}: the golden spiral the arms are), tightening
// into the light as it goes for it.
function swimAt(t, geo) {
	const s = qAt(t) * geo.D0 * Math.exp(-zoomAt(t));
	const rho = s * TRACK.rho;
	const z = s * TRACK.z;
	const sp = span(t, T.spiral[0], T.spiral[1]);
	let th = TRACK.th;
	if (sp > 0) {
		const s0 = qAt(T.spiral[0]) * geo.D0 * Math.exp(-zoomAt(T.spiral[0]));
		th += (Math.log(s / s0) / K) * smooth(sp * 2);
	}
	return [rho * Math.cos(th), rho * Math.sin(th), z];
}

function approach(ctx, w, h, t, S) {
	const { geo } = S;
	const { k, R0 } = geo;
	const Z = zoomAt(t);
	const { D, cam } = lensAt(t, geo);
	const psi = (PSI_TOTAL * Z) / Z_TOTAL;
	const orbPx = ORB_R * Math.exp(0.24 * Z);
	const secs = t - T.term;

	// The net on the plane, written outward from the light, dissolving into
	// it: the visible window of x, from the light's edge to past the frame.
	const plane = ([x, th]) => {
		const r = Math.exp(x);
		return [r * Math.cos(th + psi), r * Math.sin(th + psi), 0];
	};
	const xf0 = Math.log((orbPx * 1.25 * D) / k);
	const xf1 = Math.log(((orbPx * 1.25 + 40) * D) / k);
	const xHi = Math.log((Math.hypot(w, h) * 0.62 * D) / k);
	const write = smooth(span(t, T.write[0], T.write[1]));
	const xw = lerp(xf0 + 0.15, xHi, write);
	if (write > 0)
		drawNet(ctx, cam, plane, {
			w,
			h,
			m: 0,
			x0: xf0 - 0.1,
			x1: xw,
			fade: (x) => smooth(span(x, xf0, xf1)) * smooth((xw - x) / 0.2),
			alpha: 0.95,
			nodeCap: 7
		});

	// The light: the point, flaring as each step lands and into the flash.
	const flare =
		0.8 * bump(t, T.step1[1] - 0.1, 0.25) +
		0.8 * bump(t, T.step2[1] - 0.1, 0.25) +
		2.2 * Math.pow(span(t, T.flash - 0.5, T.flash), 2);
	drawOrb(ctx, w / 2, h / 2, orbPx, secs, { flare, halo: 0.7 });

	// The swimmer: ahead of the lens, its head a constant few pixels at
	// rest, dwindling as it goes for the light; gone at the flash.
	const swimA =
		smooth(span(t, T.swimIn[0], T.swimIn[0] + 0.3)) *
		(1 - smooth(span(t, T.flash - 0.45, T.flash - 0.05)));
	if (swimA > 0) {
		const u = (t - T.term) / (T.flash - T.term);
		const path = (uu) => swimAt(T.term + uu * (T.flash - T.term), geo);
		const spin =
			2.6 * Math.PI * secs +
			2 * Math.PI * (ease(t, T.step1) + ease(t, T.step2)) +
			5 * Math.PI * Math.pow(span(t, T.spiral[0], T.spiral[1]), 2);
		const qq = qAt(t);
		const dw = Math.pow(Math.min(1, qq / Q_REST), 0.6);
		const size = SWIM.head * D * dw;
		const pose = poseOn(path, u, spin, size, 0.0012);
		drawHelix(ctx, cam, pose, { alpha: swimA, width: 2.1, core: 0.9, glow: 0.35 });
	}

	// The questions, under the light, each anchored where the lens was when
	// it was asked, so the step flies it past.
	const viewAt = (zz) => makeView({ w, h, scale: R0 * Math.exp(zz), cy: h / 2 + 0.08 * h });
	const view = viewAt(Z);
	drawPrompt(
		ctx,
		view,
		viewAt(zoomAt(T.q1[0])),
		h,
		{ ...BIRTH, key: '' },
		{
			q: span(t, T.q1[0], T.q1[1]),
			a: span(t, T.a1[0], T.a1[1]),
			enter: span(t, T.enter1[0], T.enter1[1]),
			alpha: 1 - smooth(span(t, T.step1[0] + 0.15, T.step1[0] + 0.8)),
			secs
		}
	);
	drawPrompt(
		ctx,
		view,
		viewAt(zoomAt(T.q2[0])),
		h,
		{ ...SPICE, key: '' },
		{
			q: span(t, T.q2[0], T.q2[1]),
			a: span(t, T.a2[0], T.a2[1]),
			enter: span(t, T.enter2[0], T.enter2[1]),
			alpha: 1 - smooth(span(t, T.step2[0] + 0.15, T.step2[0] + 0.8)),
			secs
		}
	);
}

// ── The torus ────────────────────────────────────────────────────────────────
function torus(ctx, w, h, t, S) {
	const { geo, depth } = S;
	const v = span(t, T.torus[0], T.torus[1]);
	const R = 0.42 * Math.min(w, h);
	const beta = 1 - io(span(v, 0.03, 0.36));
	const phi = TAU * io(span(v, 0.38, 0.66));
	const glued = span(phi, TAU * 0.985, TAU);
	// The zoom carries through the flash as the net's own flow along the
	// tube, decaying to a drift.
	const dt = t - T.flash;
	const m = 0.83 * 0.5 * (1 - Math.exp(-2 * dt)) + 0.06 * dt;
	const cxb = phi > 1e-3 ? ((2 * TX) / phi) * (1 - Math.sin(phi / 2) / (phi / 2)) : 0;
	const body = [cxb, 0.55 * smooth(span(v, 0.5, 0.75)), 0];
	const toTop = smooth(span(v, 0.74, 1));
	const fov = spline(v, TORUS_KEYS.fov);
	const cam = orbit(w, h, {
		target: lerp3(body, P_TOP, toTop),
		az: spline(v, TORUS_KEYS.az),
		el: spline(v, TORUS_KEYS.el),
		dist: spline(v, geo.dist),
		fov
	});
	const ref = spline(v, [
		[0, geo.D0],
		[0.4, 11],
		[0.66, 8.5],
		[0.86, 3.6],
		[1, 0.6]
	]);
	const place = (z) => tube([z[0], z[1] + PSI_TOTAL], beta, phi);

	if (beta < 0.97) {
		depth.reset(w, h);
		const grid = [];
		for (let i = 0; i <= 96; i++) {
			const x = -TX + (2 * TX * i) / 96;
			const row = [];
			for (let j = 0; j <= 40; j++) row.push(place([x, (TAU * j) / 40]));
			grid.push(row);
		}
		depth.grid(cam, grid);
	} else depth.off();

	// The unit circle: the middle of the tube.
	const mid = [];
	for (let i = 0; i <= 120; i++) mid.push(place([0, (TAU * i) / 120]));
	paint(ctx, runsOf(cam, mid, { depth, w, h }), {
		color: PAL.chalkDim,
		width: 1.4,
		alpha: 0.6,
		ref,
		hid: 0.5
	});

	// The net, the whole tube; while it is still the plane, dissolving into
	// the light as it did.
	const k = pxPerUnit(h, fov);
	const xf0 = Math.log((ORB_R * 1.25 * geo.D0) / k);
	const flat = span(beta, 0.75, 1);
	drawNet(ctx, cam, place, {
		w,
		h,
		m,
		x0: -TX,
		x1: TX,
		depth,
		fade: flat > 0 ? (x) => lerp(1, smooth(span(x, xf0, xf0 + 0.6)), flat) : null,
		alpha: 0.95 - 0.2 * span(v, 0.66, 0.8),
		ref,
		hid: 0.32 - 0.22 * span(v, 0.86, 0.97),
		dx: [0.02, 0.04],
		nodeCap: 9
	});

	// The two ends: toward 0 — lit, the light opening into the mouth of the
	// tube — and toward ∞, chalk. Glued, they are one seam.
	const end0 = [];
	const endI = [];
	for (let i = 0; i <= 80; i++) {
		end0.push(place([-TX, (TAU * i) / 80]));
		endI.push(place([TX, (TAU * i) / 80]));
	}
	const seam = span(v, 0.64, 0.67) * (1 - span(v, 0.67, 0.76));
	const c0 = end0.slice(0, 80).reduce((s, p) => add3(s, mul3(p, 1 / 80)), [0, 0, 0]);
	const fillA = 0.3 * (1 - glued) * (1 - beta);
	if (fillA > 0) {
		const Q = end0.map((p) => cam.project(p));
		if (Q.every((qq) => qq[2] > NEAR)) {
			ctx.save();
			ctx.globalAlpha = fillA;
			ctx.fillStyle = PAL.gold;
			ctx.beginPath();
			Q.forEach((qq, i) => (i ? ctx.lineTo(qq[0], qq[1]) : ctx.moveTo(qq[0], qq[1])));
			ctx.fill();
			ctx.restore();
		}
	}
	paint(ctx, runsOf(cam, endI, { depth, w, h }), {
		color: PAL.chalk,
		width: 2,
		alpha: 0.8 * (1 - glued) * span(1 - beta, 0.6, 0.9),
		ref
	});
	paint(ctx, runsOf(cam, end0, { depth, w, h }), {
		color: PAL.gold,
		width: 2.6 + 4 * seam,
		alpha: span(1 - beta, 0.05, 0.4),
		ref,
		glow: 6 + 18 * seam,
		hid: 0.5
	});
	// The light itself: the point, sinking down the funnel into its mouth.
	const q0 = cam.project(c0);
	const lightA = 1 - span(1 - beta, 0.1, 0.6);
	if (q0[2] > NEAR && lightA > 0 && !depth.hidden(q0)) {
		const r = ORB_R * (1 + 0.3 * Math.pow(span(t, T.flash, T.flash + 0.3), 0.5));
		drawOrb(ctx, q0[0], q0[1], r, t - T.term, { halo: 0.7 * lightA, flare: 0 });
	}
	if (seam > 0) {
		const qc = cam.project(tube([TX, 0], 0, phi));
		if (qc[2] > NEAR) bloom(ctx, qc[0], qc[1], R * 0.6 * seam, 'rgba(255, 236, 196, 0.6)', seam);
	}

	// The window on the seam's top the lens dives at: lit, growing, and the
	// rooms already through it.
	windowOn(ctx, w, h, t, S, cam, toTop);
}

// The window: the quad on the seam in the end lens's axes; its content the
// lattice of rooms, drawn as if onto a board the window's size, clipped to
// it; a chalk frame round it, and the light the lens dives at under it.
function windowOn(ctx, w, h, t, S, cam, g) {
	const { geo, depth } = S;
	if (g <= 0) return;
	const Q = geo.win.map((p) => cam.project(p));
	if (Q.some((q) => q[2] <= NEAR)) return;
	const qp = cam.project(P_TOP);
	if (depth.hidden(qp)) return;
	const ex = [(Q[1][0] - Q[0][0]) / w, (Q[1][1] - Q[0][1]) / w];
	const ey = [(Q[3][0] - Q[0][0]) / h, (Q[3][1] - Q[0][1]) / h];
	const sc = Math.hypot(ex[0], ex[1]);
	const hpx = Math.hypot(Q[3][0] - Q[0][0], Q[3][1] - Q[0][1]);
	const R = 0.42 * Math.min(w, h);
	const lightA = 1 - span(hpx, 0.3 * h, 1.2 * h);
	if (lightA > 0)
		bloom(ctx, qp[0], qp[1], R * (0.08 + 0.5 * g), 'rgba(255, 222, 150, 0.55)', g * lightA);
	if (hpx < 2.5) {
		lit(ctx, qp[0], qp[1], 2 + 3 * g, g);
		return;
	}
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < 4; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
	ctx.clip();
	ctx.transform(ex[0], ex[1], ey[0], ey[1], Q[0][0], Q[0][1]);
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(-2, -2, w + 4, h + 4);
	if (hpx > 14) rooms(ctx, w, h, t, S, sc);
	else {
		const gl = 1 - span(hpx, 4, 14);
		glow(ctx, w / 2, 0.535 * h, 0.5 * h, [255, 220, 150], 0.5 * gl);
	}
	ctx.restore();
	stroke(
		ctx,
		[...Q, Q[0]].map((q) => [q[0], q[1]]),
		{
			color: PAL.chalk,
			width: 1.6,
			alpha: 0.85 * (1 - span(hpx, 0.9 * h, 1.05 * h))
		}
	);
}

// ── The rooms ────────────────────────────────────────────────────────────────
// The torus's flat universe: the one room glued to itself, T³ = ℝ³/ℤ³, which
// from inside is the room repeated at every lattice point — every copy drawn
// from one image through its mips, chalk; through each copy's glass, the
// cell behind. The lens starts a cell left and down with a wide lens, slides
// up and across narrowing to the landing lens (a zoom), into the one cell,
// which colours as it enters; then the sway, the frame held.
function flatRoom(art, decade, px) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / 1.618033988749895);
	const x = c.getContext('2d');
	drawRoom(x, art, decade, {
		cx: c.width / 2,
		cy: c.height / 2,
		height: c.height,
		clip: true,
		chalk: true
	});
	return c;
}

// A lens on the −z axis, no roll; `sx, sy` move the principal point so the
// plane d₀ ahead holds still while the lens sways.
function lensOf(w, h, cam, F, oy = 0.535) {
	const ox = w / 2 + (cam.sx ?? 0);
	const cy = oy * h + (cam.sy ?? 0);
	return {
		F,
		project: (x, y, z) => {
			const d = cam.z - z;
			return [ox + (F * (x - cam.x)) / d, cy - (F * (y - cam.y)) / d, d];
		}
	};
}

// A drawing (a mip chain) centred at (cx, cy), w × h px, culled off the board.
function blit(ctx, m, cx, cy, bw, bh, alpha, vw, vh, scale) {
	if (alpha <= 0.002 || bw < 0.6 || bh < 0.6) return;
	const r = Math.hypot(bw, bh) / 2;
	if (cx + r < 0 || cx - r > vw || cy + r < 0 || cy - r > vh) return;
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.drawImage(pick(m, bw * scale), cx - bw / 2, cy - bh / 2, bw, bh);
	ctx.restore();
}

function rectPath(ctx, cx, cy, rw, rh) {
	ctx.beginPath();
	ctx.rect(cx - rw / 2, cy - rh / 2, rw, rh);
}

function rooms(ctx, w, h, t, S, winScale) {
	const { geo, art, decade, flat, b } = S;
	const { F0, Fw, d0, Dz, pace } = geo;
	const W = PLATE.W;
	const H = PLATE.H;
	const scale = winScale * b.dpr;
	const e = pace(span(t, T.slide[0], T.slide[1]));
	const F = Fw * Math.exp(Math.log(F0 / Fw) * e);
	const amp = smooth(span(t, T.sway[0], T.sway[1]));
	const ex = 0.32 * amp * Math.sin(1.1 * t - 0.4);
	const ey = 0.45 * 0.32 * amp * Math.sin(1.7 * t + 0.6);
	const cam = {
		x: -W * (1 - e) + ex,
		y: -H * (1 - e) + ey,
		z: d0 - 0.02,
		sx: (F * ex) / d0,
		sy: (-F * ey) / d0
	};
	const L = lensOf(w, h, cam, F);
	const R = roomOf(decade, art, d0);
	const m = art[decade];
	const col = smooth(span(t, T.colour[0], T.colour[1]));
	const litG = smooth(span(t, T.colour[0] + 0.6, T.colour[1] + 0.4));

	// The copies in view: as far as the back wall's plane can be seen.
	const reach = (cam.z + PLATE.DEPTH + 0.3) / F;
	const hx = (w / 2 + Math.abs(cam.sx)) * reach + W / 2;
	const hy = (h / 2 + Math.abs(cam.sy)) * reach + H / 2;
	const I = [Math.floor((cam.x - hx) / W + 0.5), Math.ceil((cam.x + hx) / W - 0.5)];
	const J = [Math.floor((cam.y - hy) / H + 0.5), Math.ceil((cam.y + hy) / H - 0.5)];
	const copies = [];
	for (let j = J[0]; j <= J[1]; j++) for (let i = I[0]; i <= I[1]; i++) copies.push([i, j]);

	const g = R.glass;
	// Every copy's glass: the board, and the cell behind seen through it —
	// and, in the one cell at the end, the light.
	const windows = () => {
		for (const [i, j] of copies) {
			const [gx, gy, d] = L.project(i * W + g.x, j * H + g.y, g.z);
			if (d < 0.02) continue;
			const kk = L.F / d;
			const gw = g.w * kk;
			const gh = g.h * kk;
			if (gw < 2 || gx + gw < 0 || gx - gw > w || gy + gh < 0 || gy - gh > h) continue;
			const home = i === 0 && j === 0;
			ctx.save();
			rectPath(ctx, gx, gy, gw + 1, gh + 1);
			ctx.clip();
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(gx - gw / 2 - 1, gy - gh / 2 - 1, gw + 2, gh + 2);
			if (b.dust) {
				ctx.fillStyle = b.dust;
				ctx.fillRect(gx - gw / 2 - 1, gy - gh / 2 - 1, gw + 2, gh + 2);
			}
			const behind = home ? 1 - litG : 1;
			if (gw > 6 && flat && behind > 0.01) {
				const [bx, by, bd] = L.project(i * W, j * H, -Dz);
				if (bd > 0.02) {
					const kb = L.F / bd;
					blit(ctx, flat, bx, by, W * kb, H * kb, 0.9 * behind, w, h, scale);
				}
			}
			if (home && litG > 0) {
				glow(ctx, gx, gy, 0.62 * Math.min(gw, gh), [255, 220, 150], 0.34 * litG);
				glow(ctx, gx, gy, 0.22 * Math.min(gw, gh), [255, 236, 200], 0.5 * litG);
			}
			ctx.restore();
			stroke(
				ctx,
				[
					[gx - gw / 2, gy - gh / 2],
					[gx + gw / 2, gy - gh / 2],
					[gx + gw / 2, gy + gh / 2],
					[gx - gw / 2, gy + gh / 2],
					[gx - gw / 2, gy - gh / 2]
				],
				{ color: PAL.chalk, width: 1, alpha: 0.45 * (home ? 1 - col : 1) }
			);
		}
	};

	// The lattice, a layer at a time across every copy; the wall clipped to
	// its cell. Chalk everywhere; colour flows into the one cell at the end.
	for (const cfg of LAYERS) {
		const l = R.lay[cfg.key];
		const a = m?.[cfg.key];
		if (!l || !a) continue;
		if (cfg.key === 'screen') windows();
		for (const [i, j] of copies) {
			const x = i * W + l.x;
			const y = j * H + l.y;
			const z = l.z;
			const home = i === 0 && j === 0;
			const c = home ? col : 0;
			const ink = Math.min(1, 1.15 - c);
			const [sx, sy, d] = L.project(x, y, z);
			if (d < 0.02) continue;
			const kk = L.F / d;
			const lw = l.w * kk;
			const lh = l.h * kk;
			if (cfg.key === 'bg') {
				const [cx, cy, dd] = L.project(i * W, j * H, z);
				if (dd < 0.02) continue;
				const kc = L.F / dd;
				if (cx + (W * kc) / 2 < 0 || cx - (W * kc) / 2 > w) continue;
				if (cy + (H * kc) / 2 < 0 || cy - (H * kc) / 2 > h) continue;
				ctx.save();
				rectPath(ctx, cx, cy, W * kc, H * kc);
				ctx.clip();
				if (c > 0.002) blit(ctx, a.mips, sx, sy, lw, lh, c, w, h, scale);
				if (a.chalk && ink > 0.002) blit(ctx, a.chalk, sx, sy, lw, lh, ink, w, h, scale);
				ctx.restore();
			} else {
				if (c > 0.002) blit(ctx, a.mips, sx, sy, lw, lh, c, w, h, scale);
				if (a.chalk && ink > 0.002) blit(ctx, a.chalk, sx, sy, lw, lh, ink, w, h, scale);
			}
		}
	}

	// The chalk: every copy's frame — where the room meets itself — and the
	// cell's depth edges, dashed, to its back wall.
	for (const [i, j] of copies) {
		const [fx, fy, d] = L.project(i * W, j * H, 0);
		if (d < 0.02) continue;
		const kk = L.F / d;
		const fw = W * kk;
		const fh = H * kk;
		if (fx + fw < 0 || fx - fw > w || fy + fh < 0 || fy - fh > h) continue;
		const home = i === 0 && j === 0;
		const Qf = [
			[fx - fw / 2, fy - fh / 2],
			[fx + fw / 2, fy - fh / 2],
			[fx + fw / 2, fy + fh / 2],
			[fx - fw / 2, fy + fh / 2]
		];
		stroke(ctx, [...Qf, Qf[0]], {
			color: PAL.chalk,
			width: home ? 2 : 1.6,
			alpha: home ? 1 : 0.8
		});
		if (fw > 60) {
			const [bx, by, bd] = L.project(i * W, j * H, -PLATE.DEPTH);
			if (bd > 0.02) {
				const kb = L.F / bd;
				const Qb = [
					[bx - (W * kb) / 2, by - (H * kb) / 2],
					[bx + (W * kb) / 2, by - (H * kb) / 2],
					[bx + (W * kb) / 2, by + (H * kb) / 2],
					[bx - (W * kb) / 2, by + (H * kb) / 2]
				];
				for (let c = 0; c < 4; c++)
					stroke(ctx, [Qf[c], Qb[c]], {
						color: PAL.chalkDim,
						width: 1,
						alpha: 0.55 * (home ? 1 - col : 1),
						dash: [4, 6]
					});
			}
		}
	}
}
