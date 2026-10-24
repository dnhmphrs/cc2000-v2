// ── Flow: flow-calendar — a space curve turned on a lathe; Gabriel's horn; the calendar spiral ──
// One whole run on the board, v5. The terminal types the card centred, the
// lines go, and the stop is the pivot of a chain of arms — the epicycle
// intro's, each digit an arm — but IN THREE PLANES: the even arms turn in the
// board, the odd ones in planes tilted out of it, so the pen draws a closed
// SPACE CURVE, a crown the lens sees turning slowly. The spice is its
// symmetry. Then the curve is READ on a lathe — its distance from its axis,
// round one turn, unrolled into the body's profile — the profile turned into
// a surface of revolution, the head pressed to the paddle, the tail drawn
// out: the person's swimmer (log/body.js). It swims at draft's golden-angle
// disc, which opens into GABRIEL'S HORN, and down the narrowing horn; the
// horn's vanishing point is NOW, the pole of the CALENDAR SPIRAL, and the
// swimmer swims back along the spiral through the years to the birthday, on
// 266 days to conception — and that point is the first room's glass. The
// chalk fall (log/fall.js) through the rooms, the swimmer leading, into the
// last room's monitor; the splash (log/splash.js).
//
// THE ENTRY. Arm k (typed order, digit d_k) has the epicycle intro's length,
// r_k = R d_k a_k / Σ d a (a = .40 .22 .14 .09 .06 .04 .03 .02), and turns at
// n s_k (s = 0 1 −1 2 −2 3 −3 4, n the spice) in a frame that is itself
// carried once round the axis per turn — so in the board's plane it is
// exactly the intro's arm at f_k = 1 + n s_k. The odd arms' planes are
// tilted 34° out of the board about the carried frame's radius:
//   P(φ) = Rot_z(φ) · Σ_k r_k (cos n s_k φ,  cos τ_k sin n s_k φ,  sin τ_k sin n s_k φ)
// (τ_k = 34° for odd k, 0 for even; at 54° the lobes read as an atom's
// tilted ellipses, at 34° as petals standing out of the board, the intro's
// rosette given depth). Rot_z(2π/n) maps P(φ) to P(φ + 2π/n): a
// whole spice gives a closed curve with EXACT n-fold symmetry about the
// axis; between stops it does not close (the snap is seen as it closing);
// at τ = 0 it is the intro's rosette. Its distance from the axis,
// ρ(φ) = |Σ_k r_k (cos n s_k φ, cos τ_k sin n s_k φ)|, has period 2π/n.
//
// THE COMPILE (the lathe, swimmer/lathe.js's construction on body.js). The
// lens swings round to the side: the curve's axis is the lathe's. The pen
// runs round the curve once and a stylus writes ρ(φ), at its true length, in
// the half-plane hinged on the axis, φ ↦ s = sₑ φ/2π along the head, neck
// and midpiece (sₑ the tail's root; φ from where the pen is): the RAW
// profile, n bumps, spiky. It is then SMOOTHED — ρ's first two harmonics of
// its period 2π/n (its lowest; the second at 0.6), m their sum over their
// range — and moulded into the body's proportions: the round radius a(s) of
// body.js's head and midpiece times k(s) = 1 + ε(s) m(φ(s)), ε 0.12 on the
// head and 0.22 on the neck and midpiece, tapered at the nose and the root.
// So the person's bumps are the contour's ripples: n of them, their lean the
// date's.
// The half-plane swings once round the axis carrying the profile: every
// 22.5° it leaves a meridian and every ring station traces its parallel (the
// surface of revolution laid behind the swinging arm, hidden lines by the
// body's own depth buffer). Two plates press the head to the paddle (its
// thickness from its width to the spec's half of it); the tail is drawn out
// ring by ring; the contour; the spark; the beat. That body — specOf(answers)
// with the section k(s)·(cos φ, sin φ) station by station — is the swimmer
// from here to the splash.
//
// THE HORN. The disc (log/phyllo.js) is seeded ahead, rim to centre, its 8-
// and 13-spirals written in. GABRIEL'S HORN is the surface of revolution of
// r = 1/x, x ≥ 1 (infinite length, finite volume): radius A/x at depth
// A(x − 1) behind the mouth, A the disc's rim. The opening is EXACT twice
// over: (1) seen from the lens on the axis E before the disc, the seed at ρ
// slides out along its own sight line to the horn point where
// (1 + A(x − 1)/E)·ρ·x = A (x = √(A/ρ) when E = A), so the picture never
// changes; (2) then the seeds slide along the horn's wall to the CONFORMAL
// map of the disc's log lattice onto the horn, ln(A/ρ) = σ(x),
//   σ(x) = ∫₁ˣ √(t² + t⁻²) dt = ½[√(x⁴ + 1) − asinh(x⁻²)] − ½[√2 − asinh 1],
// the horn's own isothermal coordinate, so every seed keeps its shape (each
// cell the same, scaled by the horn's radius) and the parastichies are the
// horn's loxodromes. Down the horn the swimmer SHRINKS WITH IT, its scale
// k = 1/(x − 0.3) at its nose (eased in from 1 at the mouth), and swims at a
// pace in its own lengths: so the horn's radius stays about three quarters
// of its length however deep it goes (Gabriel's horn has no end to reach),
// the seeds stream past at a steady rate, and the lens, following at a
// distance in its lengths, can stand off the axis and see it from a quarter
// turn off its heading — a full-size swimmer fills the narrowing horn, and
// seen from behind down a tube it is a squiggle. The lens comes round below
// it as it drifts up the left of the horn, so it turns from swimming up the
// board to swimming down it, the way it will leave the horn. Behind it all, a dim star field, and the horn's own continuation for
// x < 1 — the bell r = A/x flaring flat — as faint rings of light out into
// space; down the horn, its parallels at whole x.
//
// THE CALENDAR SPIRAL (intro/spiral.js's idea). A date t sits at
//   z = (now − t)^{½ + 2πi} = √Δ · e^{2πi ln Δ}     (Δ in years),
// r = √Δ, a turn for every factor e — the equiangular spiral r = e^{θ/4π}. As
// the swimmer leaves the horn its vanishing point is the spiral's pole, now,
// and the spiral is written outward round the swimmer, each 1 January ticked
// across it and its year numbered, faintly (the decades a shade brighter).
// The calendar's world is built at the swimmer's scale as it leaves the horn
// (scale-free: every length in it goes with the spiral's radius). The
// swimmer comes down out of the horn past the pole onto it a week back
// and swims on ALONG it, outward, back through the years: its nose rides the
// spiral by arc length (ℓ = r√(1+b²)/b, b = 1/4π), at a pace in e-folds of
// Δ. The lens rides in the frame the spiral's own similarity fixes — over
// the plane at a height ∝ r, looking between the pole and the swimmer,
// turned with the swimmer round the pole — so the spiral stands still on the
// board (a zoom of a log spiral is a turn of it), the pole above, the
// swimmer below, and the months and THE YEARS stream round and in past it,
// tightening into the pole. The swimmer grows as r^0.9 (a gnomon, a little
// behind the spiral, so it is smaller against the years as they lengthen).
// At the birthday the gold point lights and the date is written; on 266 days
// further, slowly (the months ticked in gold), the lens comes down over the
// conception point, and the nose reaches it as the fall opens: the point is
// drawn open into the first room's glass, the swimmer dives through it along
// the lens's line of sight (a quarter turn off it), gathering to one and a
// third of its length a second so its tail is off the spiral a second into
// the fall, and the plate comes up
// round it out of the space; through the glasses the spiral recedes, then
// only the rings of light, at the fall's zoom. (?cal=road: the lens rides
// behind the swimmer instead, the spiral a road — kept as an alternative.)
//
// Beats (seconds; 61 s; at = t / 61):
//    0    – 6.4   the card typed centred, frozen at its stop, the lines gone
//    6.8          "when were you born?" (q1); 7.6 the wait; 9.8 Enter
//   11.6          "how spicy?" (q2); 12.4 the wait; 14.4 Enter; gold trace
//   15.5 – 22.7   COMPILING USER GENETICS: 15.4 – 16.9 the lens to the
//                 lathe; 16.9 – 18.5 the curve read round once; 18.4 – 19.1
//                 moulded; 19.0 – 20.5 turned; 20.5 – 21.2 pressed; 21.1 –
//                 22.3 the tail drawn out; 22.0 – 22.6 the contour; 22.6 life
//   22.9 – 34.0   SIMULATING CONCEPTION: it swims; 23.7 – 26.7 the disc
//                 seeded, 26.1 – 28 its spirals; 27.3 – 29.0 it opens (on the
//                 axis), 29.0 – 30.8 onto the horn's conformal lattice; the
//                 lens off the axis, coming round below it, follows it down
//                 the horn, the swimmer shrinking with it
//   33.4 – 43.0   the calendar: 33.4 – 35 the horn dissolves, the spiral
//                 written out from now; 34.5 – 36 down onto it; 36 – 40 back
//                 along it through the years; 40 the birthday; 40 – 43 the
//                 266 days, the lens coming down over conception
//   43   – 54.6   43 conception: the point opened into the glass (to 43.45),
//                 the dive through it; the fall through six chalk rooms, the
//                 swimmer leading
//   54.7          the splash on the last room's screen; the room held
//   59.4 – 61     fade; round
//
// Live (the lab, unpinned, not ?demo=1) a person answers; otherwise the
// demo's hand (14 · 02 · 1987, spice 7). ?decade= forces the room. "Now" is
// today when a person answers, and fixed (21 · 10 · 2026) otherwise, so a
// pinned frame is the same frame on any day. Every frame is a function of t
// and the hand; the only caches are of inputs (the bodies and the fall per
// answer, tables of constants, when each digit came).

import {
	getBoard,
	clearBoard,
	clock,
	tag,
	camera3,
	stroke,
	disc,
	PAL,
	TAU,
	TECH_FONT,
	span,
	smooth,
	lerp,
	clamp01,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm
} from './log/board.js';
import { NEAR, makeDepth, spline, lit3 } from './log/space.js';
import { glow } from './log/ink.js';
import { makeAnswers } from './log/answer.js';
import { make as makeEpicycle, EPICYCLE, rosette } from './intro/epicycle.js';
import { makeBody, specOf, BODY } from './log/body.js';
import { PHYLLO, seeds, parastichy } from './log/phyllo.js';
import { caption, CAPTION } from './log/caption.js';
import { splash } from './log/splash.js';
import { makeFall, orderOf } from './log/fall.js';
import { DECADES, PLATE, loadRooms, decadeOfDate } from './log/rooms.js';
import { makeTerminal } from './log-dawn.js';
import { script } from './log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const SECONDS = 61;
const B = {
	...EPICYCLE.beats, // q1 6.8, wait1 7.6, e1 9.8, q2 11.6, wait2 12.4, e2 14.4
	trace: 1.2, // a gold trace's run round the curve
	quiet: [15.0, 15.9], // the questions wiped
	genetics: [15.5, 22.7], // COMPILING USER GENETICS
	swing: [15.4, 16.9], // the lens round to the lathe
	read: [16.9, 18.5], // the pen once round, the distance written
	mould: [18.4, 19.1], // the raw distance moulded into the profile
	turn: [19.0, 20.5], // the revolution
	press: [20.5, 21.2],
	draw: [21.1, 22.3], // the tail drawn out
	contour: [22.0, 22.6],
	life: 22.6,
	conception: [22.9, 34.0], // SIMULATING CONCEPTION
	swim: 22.75,
	seeds: [23.7, 26.7],
	sp8: [26.1, 27.5],
	sp13: [26.6, 28.0],
	apex: [27.0, 28.0],
	open: [27.3, 29.0],
	conf: [29.0, 30.8],
	dissolve: [33.4, 35.0],
	write: [33.7, 35.6],
	join: 36.0, // the swimmer onto the spiral, a week back
	birth: 40.0,
	conceive: 43.0, // the nose at conception as the fall opens
	dive: [40.1, 43.0], // the lens down to the conception point
	glass: [43.0, 43.45], // the point opened into the glass
	fall: [43.0, 54.6],
	fadeIn: [43.1, 44.2],
	land: [52.6, 54.6],
	colour: [53.0, 55.2],
	aim: [52.9, 54.7],
	hit: 54.7,
	out: [59.4, 61]
};
const FOV = 38;
// The chain's angle as the lathe reads it: where the pen is at the reading's start.
const PH0 = (TAU * B.read[0]) / EPICYCLE.period;

// ∫ smoothstep: the distance a speed easing from 0 to 1 over `ramp` covers.
function eased(x, ramp) {
	if (x <= 0) return 0;
	if (x >= ramp) return x - ramp / 2;
	const s = x / ramp;
	return ramp * (s * s * s - (s * s * s * s) / 2);
}
// The cubic Hermite on [0, 1] from 0 to 1 with end slopes m0, m1.
function hermite(x, m0, m1) {
	const t = clamp01(x);
	const t2 = t * t;
	const t3 = t2 * t;
	return (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) + (t3 - t2) * m1;
}
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ── The figure: the epicycle chain in three planes ──────────────────────────
const SHARE = EPICYCLE.share;
const SPIN = EPICYCLE.spin;
const TILT = (34 * Math.PI) / 180;
const CT = SPIN.map((_, k) => (k % 2 ? Math.cos(TILT) : 1));
const STL = SPIN.map((_, k) => (k % 2 ? Math.sin(TILT) : 0));
const RF = 2.6; // the figure's radius, world units
const ZF = -5.4; // its centre, on the lathe's axis ahead of the nose
// The lathe's axis, where the swimmer is built and swims off: parallel to the
// disc's and the horn's (x = y = 0), aside of it, low on the left, so it
// swims straight at the disc and the lens on the disc's axis sees it a little
// side-on (an aside swum on the way, its tail slanted back toward that axis,
// is seen end-on from there: folded in two).
const LX = -24;
const LY = -14;
const CF = [LX, LY, ZF];
const PERIOD = EPICYCLE.period; // the arms turn once in 12 s
const GROW = 0.3;
const SHRINK = 0.2;
// Local (u, v, w) — the board's right, its up, toward the lens in the entry —
// to the world: the figure hangs at CF, its axis the world's z.
const toWorld = (u, v, w) => [CF[0] - u, CF[1] + v, CF[2] - w];
// Arm k's vector at the chain's angle φ: in its own plane, carried round.
function armAt(k, rk, n, ph) {
	const a = n * SPIN[k] * ph;
	const s = Math.sin(a);
	const x = rk * Math.cos(a);
	const y = rk * CT[k] * s;
	const c = Math.cos(ph);
	const sn = Math.sin(ph);
	return [c * x - sn * y, sn * x + c * y, rk * STL[k] * s];
}
// The figure's distance from its axis at φ (unit lengths r), period 2π/n.
function rhoAt(r, n, ph) {
	let u = 0;
	let v = 0;
	for (let k = 0; k < 8; k++) {
		if (r[k] <= 0) continue;
		const a = n * SPIN[k] * ph;
		u += r[k] * Math.cos(a);
		v += r[k] * CT[k] * Math.sin(a);
	}
	return Math.hypot(u, v);
}

// The scripted hand's digits: when each lands, read off the demo's script.
const SB = { q1: B.q1, type1: B.wait1, e1: B.e1, q2: B.q2, drag2: B.wait2 + 0.3, e2: B.e2 };
const KEYT = (() => {
	const out = [];
	for (let i = 0; i <= 3000 && out.length < 8; i++) {
		const t = B.wait1 + i * 0.001;
		const n = script(t, SB).typed.length;
		while (out.length < n) out.push(t);
	}
	while (out.length < 8) out.push(Infinity);
	return out;
})();

// ── The calendar ─────────────────────────────────────────────────────────────
const DAY = 86400000;
const YEAR = 365.2425;
const FIXED_NOW = Date.UTC(2026, 9, 21);
// A typed date (DDMMYYYY) as a UTC day, held to a real day.
function dayOf(digits) {
	const s = String(digits).padEnd(8, '0');
	const y = Math.max(1900, Math.min(2099, Number(s.slice(4, 8)) || 1990));
	const m = Math.max(1, Math.min(12, Number(s.slice(2, 4)) || 1));
	const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
	const d = Math.max(1, Math.min(last, Number(s.slice(0, 2)) || 1));
	return Date.UTC(y, m - 1, d);
}
const two = (x) => String(x).padStart(2, '0');
const dateText = (ms) => {
	const d = new Date(ms);
	return `${two(d.getUTCDate())} · ${two(d.getUTCMonth() + 1)} · ${d.getUTCFullYear()}`;
};
const BSP = 1 / (4 * Math.PI); // r = e^{b θ}
const ARC = Math.sqrt(1 + BSP * BSP) / BSP; // arc length from the pole, per unit r
const KAPPA = 2.2; // the lens's height, in the swimmer's radii
const LAMBDA = 0.5; // where it looks, from the pole to the swimmer
const LEAN = 0.42; // its tilt off the plane's normal
const DIVE_LEAN = 0.38; // the lens over the conception point, off its normal
const GNOMON = 0.9; // the swimmer grows as r^0.9

// ── The horn ─────────────────────────────────────────────────────────────────
const A = 40; // the disc's rim, the horn's mouth
const ZD = 150; // the disc's plane, this far ahead of where the nose is built
const ZDISC = -ZD;
const NSEED = 900;
const SIG0 = 0.5 * (Math.SQRT2 - Math.asinh(1));
// The horn's isothermal coordinate: σ(x) = ∫₁ˣ √(t² + t⁻²) dt.
const sigmaOf = (x) => 0.5 * (Math.sqrt(x ** 4 + 1) - Math.asinh(1 / (x * x))) - SIG0;
function xConf(rho) {
	const L = Math.log(A / rho);
	if (L <= 0) return 1;
	let x = Math.sqrt(2 * L + 1);
	for (let i = 0; i < 8; i++) {
		const f = sigmaOf(x) - L;
		const d = Math.sqrt(x ** 4 + 1) / x;
		x = Math.max(1, x - f / d);
		if (Math.abs(f) < 1e-10) break;
	}
	return x;
}
const hornAt = (theta, x) => [
	(A / x) * Math.cos(theta),
	(A / x) * Math.sin(theta),
	ZDISC - A * (x - 1)
];
// Down the horn the swimmer SHRINKS WITH IT: its scale k = 1/(x − HX) (x the
// horn's x at the nose; eased in from 1 at the mouth, C¹, by x = 1 + 2HX), so
// the horn's radius stays about three quarters of its length all the way
// down, the lens following at a distance in its lengths can stand off the
// axis and see it from the side (a full-size swimmer fills the narrowing
// horn, and from behind it is a squiggle), and it swims on at a pace in its
// own lengths: the seeds stream past at a steady rate, the horn without end.
// Its depth D past the mouth after it has swum W at full size: dD/dW = k(D).
const HX = 0.3;
const xEff = (x) => (x - 1 <= 2 * HX ? 1 + (x - 1) ** 2 / (4 * HX) : x - HX);
const kOfDepth = (dep) => (dep <= 0 ? 1 : 1 / xEff(1 + dep / A));
const DSTEP = 0.5;
const DTAB = (() => {
	const n = 2400;
	const T = new Float64Array(n + 1);
	for (let i = 0; i < n; i++) {
		const D = T[i];
		const k1 = kOfDepth(D);
		const k2 = kOfDepth(D + (DSTEP / 2) * k1);
		const k3 = kOfDepth(D + (DSTEP / 2) * k2);
		const k4 = kOfDepth(D + DSTEP * k3);
		T[i + 1] = D + (DSTEP / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
	}
	return T;
})();
function depthOfW(W) {
	if (W <= 0) return W;
	const f = W / DSTEP;
	const i = Math.min(DTAB.length - 2, Math.floor(f));
	return lerp(DTAB[i], DTAB[i + 1], f - i);
}

// ── The stars: directions, seeded ────────────────────────────────────────────
const STARS = (() => {
	let s = 20261021;
	const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = [];
	for (let i = 0; i < 700; i++) {
		const z = 2 * rnd() - 1;
		const a = TAU * rnd();
		const q = Math.sqrt(1 - z * z);
		const m = rnd();
		out.push({
			d: [q * Math.cos(a), q * Math.sin(a), z],
			a: 0.1 + 0.42 * m * m,
			r: 0.7 + 0.9 * m * m * m,
			x: rnd(),
			y: rnd()
		});
	}
	return out;
})();

// ── Ink: segments batched by colour, alpha, width, dash ──────────────────────
// The board's size this frame, for culling what is wholly off it.
const VIEW = { w: 0, h: 0 };
function makeInk() {
	const M = new Map();
	const COL = new Map();
	let cur = null;
	let lx = NaN;
	let ly = NaN;
	const m = 60;
	return {
		seg(color, alpha, width, dash, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			if (
				(x0 < -m && x1 < -m) ||
				(y0 < -m && y1 < -m) ||
				(x0 > VIEW.w + m && x1 > VIEW.w + m) ||
				(y0 > VIEW.h + m && y1 > VIEW.h + m)
			)
				return;
			let ci = COL.get(color);
			if (ci === undefined) COL.set(color, (ci = COL.size));
			const a = Math.min(24, Math.round(alpha * 24));
			const wq = Math.max(1, Math.min(24, Math.round(width * 4)));
			const key = ((ci * 32 + a) * 32 + wq) * 2 + (dash ? 1 : 0);
			let b = M.get(key);
			if (!b) M.set(key, (b = { color, a: a / 24, w: wq / 4, dash, R: [] }));
			// a run goes on where the last segment of the same ink ended
			if (b === cur && x0 === lx && y0 === ly) b.R[b.R.length - 1].push(x1, y1);
			else b.R.push([x0, y0, x1, y1]);
			cur = b;
			lx = x1;
			ly = y1;
		},
		flush(ctx) {
			const g0 = ctx.globalAlpha;
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of M.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = g0 * b.a;
				ctx.lineWidth = b.w;
				ctx.setLineDash(b.dash ? [3, 5] : []);
				ctx.beginPath();
				for (const P of b.R) {
					ctx.moveTo(P[0], P[1]);
					for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
				}
				ctx.stroke();
			}
			ctx.restore();
			M.clear();
			cur = null;
		}
	};
}

// A lens from orbit parameters round a target: az 0 looks along +z (from the
// figure's front), π/2 from +x (the lathe's side).
function orbitPose({ target, az, el, dist }) {
	const ce = Math.cos(el);
	const dir = [Math.sin(az) * ce, Math.sin(el), -Math.cos(az) * ce];
	return { pos: add3(target, mul3(dir, dist)), target, up: [0, 1, 0] };
}
// A board.js camera3, its picture shifted by (dx, dy) px (a new object: the
// body caches its projection by the camera's identity).
function lens(pose, w, h, dx = 0, dy = 0) {
	const c = camera3({ pos: pose.pos, target: pose.target, up: pose.up, fov: FOV, w, h });
	if (!dx && !dy) return c;
	const pr = c.project;
	return {
		...c,
		project: (p) => {
			const q = pr(p);
			return [q[0] + dx, q[1] + dy, q[2]];
		}
	};
}
const blendPose = (a, b, k) => ({
	pos: lerp3(a.pos, b.pos, k),
	target: lerp3(a.target, b.target, k),
	up: norm(lerp3(a.up, b.up, k))
});

// ─────────────────────────────────────────────────────────────────────────────
export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-calendar · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null)
	]);
	const answers = makeAnswers({ live, beats: EPICYCLE.beats });
	const intro = await makeEpicycle({ board, answers, live, keep: true });
	const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
	const NOW = live
		? (() => {
				const d = new Date();
				return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
			})()
		: FIXED_NOW;
	const Z = makeDepth(4);
	const CAL = q.get('cal') === 'road' ? 'road' : 'top';

	// ── Per answer: the body, the calendar, the run's path, the fall ─────────
	let RUN = null;
	function run() {
		const ans = answers.answers;
		const key = `${ans.date}|${ans.spice}`;
		if (RUN && RUN.key === key) return RUN;
		RUN = build(ans.date, Math.round(ans.spice), key);
		return RUN;
	}
	function build(date, spice, key) {
		// The body: body.js's, with the profile's ripples station by station.
		const probe = makeBody(specOf({ date, spice }));
		const sEnd = probe.parts.tail[0];
		const ros = rosette(date, spice);
		const prof = profileOf(ros.r, spice, sEnd, probe.parts);
		const ST = probe.stations;
		const K = ST.map((x) => prof.k(x.s));
		const spec0 = specOf({ date, spice });
		// Press p: the head's thickness from its width (round, a surface of
		// revolution) to the spec's (the paddle); the section's v scales it.
		const sectionFor = (p) => {
			const fn = (i, ph) => {
				const st = ST[i];
				const vb = st.part === 'head' && st.b > 1e-6 ? lerp(st.a / st.b, 1, p) : 1;
				return [K[i] * Math.cos(ph), K[i] * vb * Math.sin(ph)];
			};
			fn.M = 32;
			fn.gens = 16;
			fn.uniform = false;
			return fn;
		};
		const bodies = new Map();
		const bodyAt = (p) => {
			const qk = Math.round(clamp01(p) * 12);
			let b = bodies.get(qk);
			if (!b) {
				b = makeBody({ ...spec0, section: sectionFor(qk / 12), sectionAlong: () => 1 });
				bodies.set(qk, b);
			}
			return b;
		};
		const final = bodyAt(1);
		const spec = final.spec;
		// The round radius a(s) of head, neck and midpiece (piecewise linear
		// over the stations), and the profile r(s) = a(s) k(s).
		const SA = ST.map((x) => [x.s, x.a]);
		const aOf = (s) => {
			if (s <= 0) return 0;
			let i = 0;
			while (i < SA.length - 2 && SA[i + 1][0] < s) i++;
			const f = clamp01((s - SA[i][0]) / (SA[i + 1][0] - SA[i][0]));
			return lerp(SA[i][1], SA[i + 1][1], f);
		};
		const iEnd = ST.findIndex((x) => x.s >= sEnd - 1e-9);
		const ringsMid = final.rings.filter((i) => ST[i].s <= sEnd + 1e-9);
		const sMid = (final.parts.mid[0] + final.parts.mid[1]) / 2;

		// The calendar: now, the birthday, conception 266 days before it.
		const tB = dayOf(date);
		const tC = tB - 266 * DAY;
		let dB = (NOW - tB) / DAY / YEAR;
		dB = Math.max(dB, 0.12);
		const dC = dB + 266 / YEAR;
		const dJ = Math.min(7 / YEAR, dB / 40); // the swimmer onto the spiral, a week back
		const cal = calendar(dJ, dB, dC);
		const decade = forced ?? decadeOfDate(date);
		const fall = makeFall({
			art,
			order: orderOf(decade),
			beats: { fall: B.fall, land: B.land, colour: B.colour, swim: [-2, -1] }
		});
		return {
			key,
			date,
			spice,
			ros,
			prof,
			sEnd,
			bodyAt,
			final,
			spec,
			aOf,
			pEnd: iEnd / (ST.length - 1),
			nRing: final.rings.length,
			nMid: ringsMid.length,
			ringsMid,
			sMid,
			tB,
			tC,
			dB,
			dC,
			cal,
			decade,
			fall
		};
	}

	// The profile: the curve's distance from its axis, round one turn, laid
	// along the head, neck and midpiece and moulded into their proportions.
	function profileOf(r, n, sEnd, parts) {
		const N = 720;
		const T = new Float64Array(N + 1);
		for (let i = 0; i <= N; i++) T[i] = rhoAt(r, n, (TAU * i) / N);
		const rho = (ph) => {
			const f = ((((ph / TAU) % 1) + 1) % 1) * N;
			const i = Math.min(N - 1, Math.floor(f));
			return lerp(T[i], T[i + 1], f - i);
		};
		// Smoothed: the distance's first two harmonics of its period 2π/n (it
		// has no others below them) — n bumps, their lean the person's.
		const cs = [0, 0, 0, 0];
		for (let i = 0; i < N; i++) {
			const ph = (TAU * i) / N;
			for (let j = 1; j <= 2; j++) {
				cs[2 * j - 2] += (2 * T[i] * Math.cos(j * n * ph)) / N;
				cs[2 * j - 1] += (2 * T[i] * Math.sin(j * n * ph)) / N;
			}
		}
		const wave = (ph) =>
			cs[0] * Math.cos(n * ph) +
			cs[1] * Math.sin(n * ph) +
			0.6 * (cs[2] * Math.cos(2 * n * ph) + cs[3] * Math.sin(2 * n * ph));
		let wl = Infinity;
		let wh = -Infinity;
		for (let i = 0; i < N; i++) {
			const v = wave((TAU * i) / N);
			wl = Math.min(wl, v);
			wh = Math.max(wh, v);
		}
		const m = (ph) => (wh - wl > 1e-6 ? wave(ph) / (wh - wl) : 0);
		// φ from the chain's angle as the reading starts (where the pen is).
		const phOf = (s) => PH0 + (TAU * s) / sEnd;
		const eps = (s) => {
			const e = lerp(0.12, 0.22, smooth(span(s, parts.head[1] - 0.3, parts.head[1] + 0.4)));
			return e * smooth(span(s, 0.15, 0.9)) * (1 - smooth(span(s, sEnd - 0.6, sEnd)));
		};
		return {
			rho,
			raw: (s) => RF * rho(phOf(s)),
			k: (s) => (s >= sEnd ? 1 : 1 + eps(s) * m(phOf(s))),
			phOf
		};
	}

	// ── The swimmer's road: down the horn, onto the spiral, back to conception ──
	// The nose's arc σ(t): thirty a second (at full size), gathering fourteen
	// more down the horn, where its pace and its size go with the horn's
	// radius (kOfDepth). σ is the depth along the axis while the horn lasts.
	const SPEED = 30;
	const sigFull = (t) => SPEED * eased(t - B.swim, 1.6) + 14 * eased(t - 29.5, 2.5);
	const sigAxis = (t) => {
		const W = sigFull(t);
		return W <= ZD ? W : ZD + depthOfW(W - ZD);
	};
	// The swimmer's scale at arc σ down the axis (1 until the mouth).
	const kAxis = (sg) => kOfDepth(sg - ZD);
	// Its offset from the axis: the lathe's, low on the left, on the approach
	// (so the lens on the axis sees it a little side-on); past the mouth it
	// drifts up the left of the horn, at a share of its radius, so by the time
	// it leaves the horn it is above the lens and heading DOWN the board, the
	// way it goes on down to the spiral (gently: the body is laid by σ, so a
	// steep drift would stretch it).
	const offAxis = (sg) => {
		const a = kAxis(sg);
		const b = smooth(span(sg, 110, 260));
		return [a * lerp(LX, -17, b), a * lerp(LY, 6, b)];
	};
	const TA = 34.5; // the swimmer leaves the axis here
	const SIGA = sigAxis(TA);
	const KA = kAxis(SIGA); // its scale there, and so the calendar's

	// The calendar's world: the plane z = Zp, its pole on the axis; S world
	// units to √(years) so the swimmer, fifty-five long at KA, joins it at a
	// radius RJ (a week back), the spiral turned so the join is below the pole.
	function calendar(dJ, dB, dC) {
		const RJ = 125 * KA;
		const S = RJ / Math.sqrt(dJ);
		const thOff = -Math.PI / 2 - TAU * Math.log(dJ);
		const R = (d) => S * Math.sqrt(d);
		const TH = (d) => TAU * Math.log(d) + thOff;
		const tangent = (d) => {
			const th = TH(d);
			const c = Math.cos(th);
			const s = Math.sin(th);
			return norm([0.5 * c - TAU * s, 0.5 * s + TAU * c, 0]);
		};
		const tA = TA;
		const hA = 150 * KA; // that high over the plane
		const sigA = SIGA;
		const vA = (sigAxis(tA + 0.01) - sigAxis(tA - 0.01)) / 0.02;
		const Zp = -sigA - hA;
		const P0 = [0, 0, Zp];
		const at = (d) => {
			const r = R(d);
			const th = TH(d);
			return [r * Math.cos(th), r * Math.sin(th), Zp];
		};
		// The bend: a cubic from the horn's last point A (heading −z) to the
		// join J (along the spiral), tabulated by arc length.
		const PA = [...offAxis(sigA), -sigA];
		const PJ = at(dJ);
		const tJ = tangent(dJ);
		const c1 = add3(PA, [0, 0, -0.62 * hA]);
		const c2 = sub3(PJ, mul3(tJ, 0.55 * RJ));
		const bez = (u) => {
			const v = 1 - u;
			return add3(
				add3(mul3(PA, v * v * v), mul3(c1, 3 * v * v * u)),
				add3(mul3(c2, 3 * v * u * u), mul3(PJ, u * u * u))
			);
		};
		const NB = 400;
		const BL = new Float64Array(NB + 1);
		{
			let p = bez(0);
			for (let i = 1; i <= NB; i++) {
				const qq = bez(i / NB);
				BL[i] = BL[i - 1] + Math.hypot(...sub3(qq, p));
				p = qq;
			}
		}
		const LB = BL[NB];
		const bezU = (l) => {
			if (l <= 0) return 0;
			if (l >= LB) return 1;
			let lo = 0;
			let hi = NB;
			while (hi - lo > 1) {
				const mid = (lo + hi) >> 1;
				if (BL[mid] < l) lo = mid;
				else hi = mid;
			}
			return (lo + (l - BL[lo]) / (BL[hi] - BL[lo])) / NB;
		};
		const sigJ = sigA + LB;
		const sigOfD = (d) => sigJ + ARC * (R(d) - RJ);
		const dOfSig = (sg) => {
			const r = RJ + (sg - sigJ) / ARC;
			return (r / S) ** 2;
		};
		const sigC = sigOfD(dC);
		const RC = R(dC);
		const tC = tangent(dC);
		const PC = at(dC);
		const scaleC = KA * (RC / RJ) ** GNOMON;
		// The dive: through the plane at C along the lens's line of sight as it
		// will stand over C (a quarter turn off it, so the body is seen a little
		// side-on), on a circular arc out of the spiral's tangent.
		const bendR = 0.3 * 55 * scaleC;
		const thC = TH(dC);
		const Uc = CAL === 'road' ? tC : [-Math.cos(thC), -Math.sin(thC), 0];
		const sight = norm(add3(mul3([0, 0, -1], Math.cos(DIVE_LEAN)), mul3(Uc, Math.sin(DIVE_LEAN))));
		const side = norm(cross(Uc, [0, 0, 1]));
		const h1 = norm(add3(sight, mul3(side, 0.27)));
		const nrm = norm(sub3(h1, mul3(tC, dot(h1, tC))));
		const alpha = Math.acos(Math.max(-1, Math.min(1, dot(h1, tC))));
		const kAx = cross(tC, nrm);
		const sigD = sigC + alpha * bendR;
		const arcAt = (a) =>
			add3(PC, add3(mul3(tC, bendR * Math.sin(a)), mul3(nrm, bendR * (1 - Math.cos(a)))));
		const PD = arcAt(alpha);
		const Z1 = [0, 0, 1];
		const upAt = (a) => {
			const kz = dot(kAx, Z1);
			return add3(
				add3(mul3(Z1, Math.cos(a)), mul3(cross(kAx, Z1), Math.sin(a))),
				mul3(kAx, kz * (1 - Math.cos(a)))
			);
		};
		const path = (sg) => {
			if (sg <= sigA) {
				const o = offAxis(sg);
				return [o[0], o[1], -sg];
			}
			if (sg <= sigJ) return bez(bezU(sg - sigA));
			if (sg <= sigC) return at(dOfSig(sg));
			if (sg <= sigD) return arcAt((sg - sigC) / bendR);
			return add3(PD, mul3(h1, sg - sigD));
		};
		const up = (sg) => {
			if (sg <= sigA) return [0, 1, 0];
			if (sg <= sigJ) {
				const u = smooth(bezU(sg - sigA));
				return norm([0, 1 - u, u]);
			}
			if (sg <= sigC) return [0, 0, 1];
			return upAt(Math.min(alpha, (sg - sigC) / bendR));
		};
		// The pace. The axis; the bend at the axis's speed, gathering; along the
		// spiral in e-folds of Δ (a Hermite from the bend's speed to the
		// birthday's crawl); the 266 days at one pace; the dive and on.
		const tJn = B.join;
		const durBend = tJn - tA;
		// the bend's arc at a speed rising linearly from vA to vJ2
		const vJ2 = (2 * LB) / durBend - vA;
		const lnJ = Math.log(dJ);
		const lnB = Math.log(dB);
		const lnC = Math.log(dC);
		const T1 = B.birth - tJn;
		const rateC = (lnC - lnB) / (B.conceive - B.birth);
		const m0 = (((2 * vJ2) / (ARC * RJ)) * T1) / (lnB - lnJ);
		const m1 = (rateC * T1) / (lnB - lnJ);
		const lnD = (t) => {
			if (t <= tJn) return lnJ;
			if (t <= B.birth) return lnJ + (lnB - lnJ) * hermite((t - tJn) / T1, m0, m1);
			return lnB + rateC * (t - B.birth);
		};
		const vC = (ARC * S * Math.exp(lnC) * rateC) / (2 * Math.sqrt(Math.exp(lnC)));
		// the dive's pace: one and a third of its length a second, so the tail is
		// off the spiral a second into the fall
		const vF = 1.35 * 55 * scaleC;
		const sigma = (t) => {
			if (t <= tA) return sigAxis(t);
			if (t <= tJn) {
				const x = t - tA;
				return sigA + vA * x + ((vJ2 - vA) * x * x) / (2 * durBend);
			}
			if (t <= B.conceive) return sigOfD(Math.exp(lnD(t)));
			return sigC + vC * (t - B.conceive) + (vF - vC) * eased(t - B.conceive, 0.7);
		};
		const scale = (t) => {
			if (t <= tA) return kAxis(sigAxis(t));
			if (t <= tJn) return KA;
			const sg = Math.min(sigma(t), sigC);
			const r = RJ + (sg - sigJ) / ARC;
			return KA * (r / RJ) ** GNOMON;
		};
		return {
			S,
			RJ,
			RC,
			thOff,
			R,
			TH,
			at,
			tangent,
			Zp,
			P0,
			PA,
			PC,
			tC,
			sigA,
			sigJ,
			sigC,
			tA,
			path,
			up,
			sigma,
			scale,
			lnD,
			dJ,
			dB,
			dC,
			scaleC
		};
	}

	// ── The disc's seeds and spirals, with what the horn needs, once ─────────
	let HORN = null;
	function horn(E) {
		if (HORN && HORN.E === E) return HORN;
		const xSeam = (rho) => {
			const a2 = (rho * A) / E;
			const a1 = rho * (1 - A / E);
			return Math.max(1, (-a1 + Math.sqrt(a1 * a1 + 4 * a2 * A)) / (2 * a2));
		};
		// A point with what the maps need, worked out once: its angle's cosine
		// and sine, and the logs of its x under the two laws.
		const pt = (s) => {
			const xs = xSeam(s.rho);
			const xc = xConf(s.rho);
			return {
				theta: s.theta,
				rho: s.rho,
				cs: Math.cos(s.theta),
				sn: Math.sin(s.theta),
				xs,
				xc,
				lxs: Math.log(xs),
				lxc: Math.log(xc)
			};
		};
		// each seed with its neighbour a step in ln ρ, for its frame
		const SEEDS = seeds({ n: NSEED, R: A }).map((s) => ({
			...pt(s),
			d: pt({ theta: s.theta, rho: s.rho * Math.exp(1e-3) })
		}));
		const SP8 = [];
		const SP13 = [];
		for (let j = 0; j < 8; j++) SP8.push(parastichy(8, j, { R: A, n: NSEED, per: 6 }).map(pt));
		for (let j = 0; j < 13; j++) SP13.push(parastichy(13, j, { R: A, n: NSEED, per: 4 }).map(pt));
		const RIM = [];
		for (let i = 0; i <= 120; i++) RIM.push(pt({ theta: (TAU * i) / 120, rho: A }));
		const RINGS = [1.5, 2, 3, 4, 5, 6, 8, 10, 13].map((x) => {
			const P = [];
			for (let i = 0; i <= 96; i++) P.push(hornAt((TAU * i) / 96, x));
			return P;
		});
		HORN = { E, SEEDS, SP8, SP13, RIM, RINGS, FIX: null, APEX: pt({ theta: 0, rho: A * 1e-4 }) };
		return HORN;
	}
	// A disc point (θ, ρ) at the opening's stage: xo 0…1 out along its sight
	// line from (0, 0, ZDISC + E) to the horn; then lg 0…1 along the horn's
	// wall from the seamless law to the conformal one.
	function hornMap(p, xo, lg, E) {
		if (lg <= 0) {
			const r = p.rho + (A / p.xs - p.rho) * xo;
			const s = r / p.rho;
			return [r * p.cs, r * p.sn, ZDISC + E - s * E];
		}
		const x = Math.exp(p.lxs * (1 - lg) + p.lxc * lg);
		const r = A / x;
		return [r * p.cs, r * p.sn, ZDISC - A * (x - 1)];
	}

	// ── The lens ─────────────────────────────────────────────────────────────
	// Entry: round the figure, turning slowly (on the hand's clock, live).
	function entryOrbit(secs, w, h) {
		const asp = Math.max(1, (0.21 * h) / (0.46 * w));
		return {
			target: CF,
			az: 0.36 * Math.sin((TAU * secs) / 17),
			el: 0.2 + 0.09 * Math.sin((TAU * secs) / 23 + 1),
			dist: 18.2 * asp
		};
	}
	// The compile's keys (absolute), at an aspect's distance.
	const CK = [
		[17.0, [0, 0, 2.4], Math.PI / 2, 0.1, 21],
		[18.9, [0, 0, 2.6], Math.PI / 2 - 0.1, 0.15, 21],
		[20.2, [0, 0, 3.4], Math.PI / 2 - 0.62, 0.42, 19.5],
		[20.85, [0, 0, 2.6], 0.62, 0.1, 15],
		[21.45, [0, 0, 3.4], 0.8, 0.72, 18],
		[22.35, [0, 0, 19], 1.0, 0.6, 66],
		[22.9, [0, 0, 22], 1.08, 0.58, 74]
	];
	const keyed = (t, i) =>
		spline(
			t,
			CK.map((k) => [k[0], k[i]])
		);
	function compileOrbit(t, w, h) {
		const asp = Math.max(1, (1.6 * h) / w);
		return {
			target: [
				LX,
				LY,
				spline(
					t,
					CK.map((k) => [k[0], k[1][2]])
				)
			],
			az: keyed(t, 2),
			el: keyed(t, 3),
			dist: keyed(t, 4) * asp
		};
	}
	// Conception: relative to the axis at the nose's depth (genome's keys,
	// after the compile's), in the swimmer's lengths (× its scale, which is 1
	// until the mouth). On the axis for the opening; then off to the right of
	// it, coming round below the swimmer as it drifts up the left, so down the
	// horn it is seen from a quarter turn off its heading — turning from up the
	// board to down it, toward the horn's vanishing point, the way it will
	// leave the horn for the spiral.
	const EYE = [
		[22.9, null],
		[24.2, [-2, 12, 72]],
		[25.3, [4, 14, 80]],
		[26.3, [2, 8, 92]],
		[27.1, [-1, 3, 100]],
		[27.3, [-0.6, 1.2, 101]],
		[29.0, [-0.6, 1.2, 100]],
		[30.6, [22, 8, 94]],
		[32.5, [24, -11, 100]],
		[34.5, [20, -18, 102]]
	];
	const TGT = [
		[22.9, null],
		[24.2, [-10, -12, -40]],
		[25.3, [-10, -12, -60]],
		[26.3, [-6, -7, -55]],
		[27.2, [0, 0, -45]],
		[29.0, [0, 0, -45]],
		[30.6, [-8, -2, -30]],
		[32.5, [-8, 2, -30]],
		[34.5, [-6, 2, -30]]
	];
	// On a narrow (portrait) board the keys' frame is too wide for it: the lens
	// stands further back (in the swimmer's lengths) and turns toward the
	// swimmer, so it stays on the board.
	function conceptionPose(t, R, w, h) {
		const c = R.cal;
		const nar = smooth(span(w / h, 1.25, 0.6));
		const end = orbitPose(compileOrbit(22.9, w, h));
		const e0 = [22.9, sub3(end.pos, [0, 0, 0])];
		const t0 = [22.9, sub3(end.target, [0, 0, 0])];
		const ek = [e0, ...EYE.slice(1).map(([u, p]) => [u, mul3(p, 1 + 0.9 * nar)])];
		const tk = [t0, ...TGT.slice(1)];
		const sp3 = (u, keys) =>
			[0, 1, 2].map((i) =>
				spline(
					u,
					keys.map(([k, p]) => [k, p[i]])
				)
			);
		const tt = Math.min(t, c.tA);
		const sg = c.sigma(tt);
		const nose = [0, 0, -sg];
		const k = kAxis(sg);
		const target = add3(nose, mul3(sp3(tt, tk), k));
		const toward = nar * 0.7 * smooth(span(tt, 22.9, 24.2));
		const front = add3(c.path(sg), [0, 0, 14 * k]); // the swimmer's front half
		return {
			pos: add3(nose, mul3(sp3(tt, ek), k)),
			target: toward > 0 ? lerp3(target, front, toward) : target,
			up: [0, 1, 0]
		};
	}
	// The calendar. 'top' (default): the frame the spiral's similarity fixes —
	// over the plane at a height ∝ r, looking between the pole and the
	// swimmer, turned with the swimmer round the pole — so the spiral stands
	// still on the board, the pole above, the swimmer below, and the years
	// stream round and in. 'road' (?cal=road): the lens rides behind and above
	// the swimmer at distances in its own length, the spiral a road.
	const RIDE = { back: 1.05, up: 0.85, out: 0.55, ahead: 0.55, in: 0.45 };
	function ridePose(t, R) {
		const c = R.cal;
		const tt = Math.max(B.join, Math.min(t, B.conceive));
		const d = Math.exp(c.lnD(tt));
		const nose = c.at(d);
		const T = c.tangent(d);
		const th = c.TH(d);
		const out = [Math.cos(th), Math.sin(th), 0];
		if (CAL === 'top') {
			const r = c.R(d);
			const U = mul3(out, -1);
			const Tg = add3(c.P0, mul3(sub3(nose, c.P0), LAMBDA));
			const H = KAPPA * r;
			const pos = add3(Tg, add3(mul3([0, 0, 1], H * Math.cos(LEAN)), mul3(U, -H * Math.sin(LEAN))));
			return { pos, target: Tg, up: U, fwd: U };
		}
		const Lc = 55 * c.scale(tt);
		const pos = add3(
			nose,
			add3(add3(mul3(T, -RIDE.back * Lc), mul3([0, 0, 1], RIDE.up * Lc)), mul3(out, RIDE.out * Lc))
		);
		const target = add3(nose, add3(mul3(T, RIDE.ahead * Lc), mul3(out, -RIDE.in * Lc)));
		return { pos, target, up: [0, 0, 1], fwd: T };
	}
	// The end of the dive: over the conception point, leaning back along
	// the way the swimmer came, the swimmer's way up the screen.
	function divePose(R) {
		const c = R.cal;
		const rb = ridePose(B.conceive, R);
		const U = rb.fwd;
		const dc = 2.6 * 55 * c.scaleC;
		const lean = DIVE_LEAN;
		const pos = add3(
			c.PC,
			add3(mul3([0, 0, 1], dc * Math.cos(lean)), mul3(U, -dc * Math.sin(lean)))
		);
		return { pos, target: c.PC, up: U };
	}
	function interimPose(t, R, w, h) {
		const c = R.cal;
		const hornEnd = conceptionPose(c.tA, R, w, h);
		// After the axis the follow lens drifts on, slowing.
		const drift = 30 * KA * (1 - Math.exp(-Math.max(0, t - c.tA) / 0.8));
		const follow = {
			pos: add3(hornEnd.pos, [0, 0, -drift]),
			target: add3(hornEnd.target, [0, 0, -drift]),
			up: [0, 1, 0]
		};
		let pose = blendPose(follow, ridePose(t, R), smooth(span(t, 34.6, B.join + 0.35)));
		if (t > B.birth + 0.3)
			pose = blendPose(pose, divePose(R), smooth(span(t, B.birth + 0.3, B.dive[1] - 0.1)));
		return pose;
	}
	// The fall: the lens that leads the swimmer (the dive's end, moving with
	// its nose), and the one that dollies the calendar into the glass.
	function fallPoses(t, R, w, h, efolds) {
		const c = R.cal;
		const p0 = interimPose(B.dive[1], R, w, h);
		// On the nose: it is at C as the fall opens, and the lens keeps it at
		// the vanishing point.
		const n1 = c.path(c.sigma(t));
		const swim = { pos: add3(n1, sub3(p0.pos, p0.target)), target: n1, up: p0.up };
		const k = Math.exp(-efolds);
		const dolly = {
			pos: add3(p0.target, mul3(sub3(p0.pos, p0.target), k)),
			target: p0.target,
			up: p0.up
		};
		return { swim, dolly };
	}

	// ── The figure ───────────────────────────────────────────────────────────
	const blank = () => ({ d: null, at: -99, old: null, gone: -99, g0: 0 });
	let slots = Array.from({ length: 8 }, blank);
	const grownAt = (s, secs) => smooth(span(secs - s.at, 0, GROW));
	function remember(hand, t) {
		if (t < B.q1 - 0.05) {
			slots = Array.from({ length: 8 }, blank);
			return;
		}
		const secs = hand.secs;
		for (let i = 0; i < 8; i++) {
			const ch = hand.typed[i];
			const d = ch === undefined ? null : Number(ch);
			const s = slots[i];
			if (d === s.d) continue;
			if (s.d !== null) {
				s.old = s.d;
				s.g0 = grownAt(s, secs);
				s.gone = secs;
			}
			if (d !== null) {
				s.at = secs;
				s.old = null;
			}
			s.d = d;
		}
	}
	function armsOf(t, hand) {
		const out = [];
		for (let i = 0; i < 8; i++) {
			if (!live) {
				const ch = hand.typed[i];
				out.push(
					ch === undefined
						? { d: 0, g: 0 }
						: { d: Number(ch), g: smooth(span(t - KEYT[i], 0, GROW)) }
				);
				continue;
			}
			const s = slots[i];
			if (s.d !== null) out.push({ d: s.d, g: grownAt(s, hand.secs) });
			else if (s.old !== null)
				out.push({ d: s.old, g: s.g0 * (1 - smooth(span(hand.secs - s.gone, 0, SHRINK))) });
			else out.push({ d: 0, g: 0 });
		}
		return out;
	}
	function lengthsOf(Aa) {
		let sum = 0;
		let most = 0;
		Aa.forEach((a, k) => {
			const wk = a.d * SHARE[k];
			sum += wk * a.g;
			if (wk > 0) most = Math.max(most, a.g);
		});
		if (sum <= 1e-9) return null;
		return Aa.map((a, k) => (RF * most * a.d * SHARE[k] * a.g) / sum);
	}
	// The curve over one turn, world points.
	function curve(r, n) {
		let fm = 1;
		for (let k = 0; k < 8; k++) if (r[k] > 0) fm = Math.max(fm, Math.abs(1 + n * SPIN[k]));
		const N = Math.max(900, Math.min(2800, Math.ceil(70 * fm)));
		const pts = new Array(N + 1);
		for (let i = 0; i <= N; i++) {
			const ph = (TAU * i) / N;
			let u = 0;
			let v = 0;
			let ww = 0;
			for (let k = 0; k < 8; k++) {
				if (r[k] <= 1e-6) continue;
				const a = armAt(k, r[k], n, ph);
				u += a[0];
				v += a[1];
				ww += a[2];
			}
			pts[i] = toWorld(u, v, ww);
		}
		return pts;
	}
	// The curve drawn: brighter nearer the lens; a gold trace from φ = 0.
	function drawCurve(ctx, cam, P, alpha, t, traces) {
		const Q = P.map((p) => cam.project(p));
		const zc = cam.project(CF)[2];
		const ink = makeInk();
		for (let i = 0; i < Q.length - 1; i++) {
			const a = Q[i];
			const b = Q[i + 1];
			if (a[2] <= NEAR || b[2] <= NEAR) continue;
			const near = clamp01(0.5 + (zc - (a[2] + b[2]) / 2) / (1.6 * RF));
			ink.seg(
				PAL.chalk,
				alpha * (0.22 + 0.42 * near),
				0.9 + 0.5 * near,
				false,
				a[0],
				a[1],
				b[0],
				b[1]
			);
		}
		ink.flush(ctx);
		for (const t0 of traces) trace(ctx, Q, t, t0, alpha);
		return Q;
	}
	function trace(ctx, Q, t, t0, out) {
		if (t < t0 || t > t0 + B.trace + 1.4) return;
		const N = Q.length - 1;
		const x = (t - t0) / B.trace;
		const head = Math.min(N, Math.floor(N * clamp01(x)));
		const per = Math.max(2, Math.ceil(N / 120));
		for (let i0 = 0; i0 < head; i0 += per) {
			const i1 = Math.min(head, i0 + per);
			const tp = t0 + (B.trace * (i0 + i1)) / 2 / N;
			const a = 0.85 * Math.exp(-Math.max(0, t - tp) / 0.25);
			if (a < 0.01) continue;
			stroke(ctx, Q.slice(i0, i1 + 1), {
				color: PAL.gold,
				width: 1.4,
				alpha: a * out,
				cap: 'butt'
			});
		}
		if (x > 0 && x < 1) disc(ctx, Q[head][0], Q[head][1], 2, { fill: PAL.gold, alpha: 0.9 * out });
	}
	// The chain at angle φ: each arm from the last one's tip, a faint circle
	// (its own tilted plane, carried) round its root; the pen.
	function drawArms(ctx, cam, r, n, ph, alpha) {
		let x = 0;
		let y = 0;
		let zz = 0;
		let pen = null;
		for (let k = 0; k < 8; k++) {
			if (r[k] < 0.02) continue;
			const root = toWorld(x, y, zz);
			const ring = [];
			const c = Math.cos(ph);
			const sn = Math.sin(ph);
			for (let i = 0; i <= 40; i++) {
				const a = (TAU * i) / 40;
				const px = r[k] * Math.cos(a);
				const py = r[k] * CT[k] * Math.sin(a);
				ring.push(
					toWorld(x + c * px - sn * py, y + sn * px + c * py, zz + r[k] * STL[k] * Math.sin(a))
				);
			}
			const RQ = ring.map((p) => cam.project(p)).filter((p) => p[2] > NEAR);
			stroke(ctx, RQ, { width: 1, alpha: 0.075 * alpha });
			const v = armAt(k, r[k], n, ph);
			x += v[0];
			y += v[1];
			zz += v[2];
			const tip = toWorld(x, y, zz);
			const a0 = cam.project(root);
			const a1 = cam.project(tip);
			if (a0[2] > NEAR && a1[2] > NEAR) stroke(ctx, [a0, a1], { width: 1, alpha: 0.3 * alpha });
			pen = a1;
		}
		return pen;
	}

	// ── Drawing helpers ──────────────────────────────────────────────────────
	// A 3D polyline through the lens, hidden lines (against Z) faint and dashed.
	function line3(ink, cam, P, alpha, width, { color = PAL.chalk, back = 0.25, hide = true } = {}) {
		let qa = cam.project(P[0]);
		for (let i = 1; i < P.length; i++) {
			const qb = cam.project(P[i]);
			if (qa[2] > NEAR && qb[2] > NEAR) {
				const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
				const hid = hide && Z.hidden(mid);
				if (!hid) ink.seg(color, alpha, width, false, qa[0], qa[1], qb[0], qb[1]);
				else if (back > 0)
					ink.seg(
						color,
						alpha * back,
						Math.max(0.8, width * 0.7),
						true,
						qa[0],
						qa[1],
						qb[0],
						qb[1]
					);
			}
			qa = qb;
		}
	}
	function text(ctx, str, x, y, size, alpha, color = PAL.chalk, align = 'center') {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.font = `400 ${size}px ${TECH_FONT}`;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.textBaseline = 'middle';
		ctx.fillText(str, x, y);
		ctx.restore();
	}
	function wipe(ctx, x, y, w, h, a) {
		if (a <= 0.003) return;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(x, y, w, h);
		if (board.dust) {
			ctx.fillStyle = board.dust;
			ctx.fillRect(x, y, w, h);
		}
		ctx.restore();
	}
	function stars(ctx, cam, w, h, alpha) {
		if (alpha <= 0.01) return;
		ctx.save();
		ctx.fillStyle = PAL.chalk;
		for (const s of STARS) {
			const qq = cam.project(add3(cam.pos, mul3(s.d, 1e6)));
			if (qq[2] <= 0 || qq[0] < -2 || qq[1] < -2 || qq[0] > w + 2 || qq[1] > h + 2) continue;
			ctx.globalAlpha = alpha * s.a;
			ctx.fillRect(qq[0] - s.r / 2, qq[1] - s.r / 2, s.r, s.r);
		}
		ctx.restore();
	}

	// ── The beats ────────────────────────────────────────────────────────────
	function render() {
		clearBoard(board);
		const { ctx, w, h } = board;
		VIEW.w = w;
		VIEW.h = h;
		const t = time.t;
		// For a script checking a run against a seek (the lab copies info once).
		if (window.__lab) window.__lab.t = t;
		const hand = answers.hand(t);
		if (t < B.q1) {
			intro.render(ctx, w, h, t, hand);
		} else if (t < B.life) {
			entryAndCompile(ctx, w, h, t, hand);
		} else if (t < B.fall[0]) {
			conceive(ctx, w, h, t);
		} else {
			theFall(ctx, w, h, t);
		}
		caption(ctx, w, h, CAPTION.genetics, t, { at: B.genetics[0], until: B.genetics[1] });
		caption(ctx, w, h, CAPTION.conception, t, { at: B.conception[0], until: B.conception[1] });
		const out = smooth(span(t, ...B.out));
		if (out > 0) wipe(ctx, 0, 0, w, h, out);
		tag(ctx, w, h, 'flow-calendar');
	}

	// The entry and the compile: the questions (the epicycle intro's own,
	// clipped to the board under the figure), the figure in three planes, then
	// the lathe.
	function entryAndCompile(ctx, w, h, t, hand) {
		const L = TERM.layout(ctx, w, h);
		const yClip = 0.635 * h;
		if (t < B.quiet[1]) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, yClip, w, h - yClip);
			ctx.clip();
			intro.render(ctx, w, h, t, hand);
			ctx.restore();
			wipe(ctx, 0, yClip, w, h - yClip, smooth(span(t, ...B.quiet)));
		}
		if (live) remember(hand, t);
		const R = run();
		const secs = live ? hand.secs : t;

		// The lens: round the figure, then swung round to the lathe.
		const sw = smooth(span(t, ...B.swing));
		const eo = entryOrbit(secs, w, h);
		const co = compileOrbit(Math.max(t, B.swing[1]), w, h);
		const orbit = {
			target: lerp3(eo.target, co.target, sw),
			az: lerp(eo.az, co.az, sw),
			el: lerp(eo.el, co.el, sw),
			dist: lerp(eo.dist, co.dist, sw)
		};
		const cam = lens(orbitPose(orbit), w, h, 0, lerp(0.37 * h - h / 2, 0, sw));

		// The figure's arms and spice: the hand's while it is asked, the
		// answers' after.
		const Aa = armsOf(t, hand);
		const r = lengthsOf(Aa);
		let n = hand.value;
		if (Math.abs(n - Math.round(n)) < 1e-9) n = Math.round(n);
		if (t >= B.e2 + 0.05) n = R.spice;
		// The chain's angle: on the hand's clock while it is asked, then on t,
		// once round faster for the reading.
		const thT = (TAU * Math.min(t, B.read[0])) / PERIOD;
		let ph = thT;
		if (live) {
			let dd = (TAU * secs) / PERIOD - thT;
			dd -= TAU * Math.round(dd / TAU);
			ph = thT + dd * (1 - sw);
		}
		const readK = hermite(span(t, ...B.read), ((TAU / PERIOD) * (B.read[1] - B.read[0])) / TAU, 0);
		if (t > B.read[0]) ph = thT + TAU * readK;

		const figA = 1 - smooth(span(t, B.mould[0], B.mould[1] + 0.2));
		// The stop: the figure's centre.
		const c0 = cam.project(CF);
		if (r && figA > 0.01) {
			const P = curve(r, n);
			// The lathe's axis, faint, through the figure.
			const ax = [add3(CF, [0, 0, -1.5 * RF]), add3(CF, [0, 0, 1.5 * RF])].map((p) =>
				cam.project(p)
			);
			if (ax[0][2] > NEAR && ax[1][2] > NEAR)
				stroke(ctx, ax, { width: 1, alpha: 0.16 * figA * (1 - sw), dash: [3, 5] });
			drawCurve(ctx, cam, P, figA, t, [B.e1, B.e2]);
			const armA = figA;
			const pen = drawArms(ctx, cam, r, n, ph, armA);
			if (pen && pen[2] > NEAR)
				disc(ctx, pen[0], pen[1], 2.1, { fill: PAL.gold, alpha: 0.62 * armA });
		}
		if (c0[2] > NEAR)
			disc(ctx, c0[0], c0[1], L.stop.r, {
				fill: PAL.chalk,
				alpha: 0.95 * Math.max(figA, 0.3 * (1 - sw))
			});
		if (t >= B.swing[0]) lathe(ctx, w, h, t, cam, R, ph, n, r);
	}

	// The lathe: the axis, the reading, the profile, the revolution, the
	// press, the tail drawn out, the contour.
	function lathe(ctx, w, h, t, cam, R, ph, n, rArms) {
		const sEnd = R.sEnd;
		const prof = R.prof;
		const press = smooth(span(t, B.press[0] + 0.1, B.press[1] - 0.15));
		const body = t < B.press[0] ? R.bodyAt(0) : R.bodyAt(press);
		const shape = body.shape(0, { beat: 0, phase: R.spec.beat.phase, roll: 0 });
		const pose = { at: [LX, LY, 0], dir: [0, 0, -1], up: [0, 1, 0], scale: 1 };
		const ink = makeInk();
		// The axis, dashed, from the figure to the tail's root.
		const axA =
			smooth(span(t, B.swing[1] - 0.6, B.swing[1])) *
			(1 - smooth(span(t, B.draw[0], B.draw[0] + 0.6)));
		if (axA > 0.01) {
			const a0 = cam.project([LX, LY, ZF - 1.6 * RF]);
			const a1 = cam.project([LX, LY, sEnd + 1.2]);
			if (a0[2] > NEAR && a1[2] > NEAR)
				stroke(ctx, [a0, a1], { width: 1, alpha: 0.22 * axA, dash: [5, 5] });
		}
		// The half-plane's angle: up (ψ = 0), swinging toward the lens first.
		const psi = TAU * smooth(span(t, ...B.turn));
		const e = [Math.sin(psi), Math.cos(psi), 0];
		const P3 = (s, rr) => [LX + rr * e[0], LY + rr * e[1], s];
		// The reading: s so far.
		const rd = span(t, ...B.read);
		const readS = sEnd * hermite(rd, ((TAU / PERIOD) * (B.read[1] - B.read[0])) / TAU, 0);
		const mould = smooth(span(t, ...B.mould));
		const planeA =
			smooth(span(t, B.read[0] - 0.3, B.read[0])) *
			(1 - smooth(span(t, B.turn[1] - 0.2, B.turn[1] + 0.3)));
		const showProf = t >= B.read[0] && t < B.turn[1] + 0.3;
		if (planeA > 0.01) {
			// The half-plane hinged on the axis: a faint frame.
			const H = 2.4;
			const fr = [P3(-0.3, 0), P3(-0.3, H), P3(sEnd + 0.3, H), P3(sEnd + 0.3, 0)].map((p) =>
				cam.project(p)
			);
			if (fr.every((p) => p[2] > NEAR)) stroke(ctx, fr, { width: 1, alpha: 0.13 * planeA });
		}
		if (showProf) {
			const N = 220;
			const pts = [];
			const upto = t < B.read[1] ? readS : sEnd;
			for (let i = 0; i <= N; i++) {
				const s = (sEnd * i) / N;
				if (s > upto + 1e-9) break;
				const rr = lerp(prof.raw(s), R.aOf(s) * prof.k(s), mould);
				pts.push(P3(s, rr));
			}
			if (t < B.read[1] && pts.length) pts.push(P3(upto, prof.raw(upto)));
			const Q = pts.map((p) => cam.project(p)).filter((p) => p[2] > NEAR);
			stroke(ctx, Q, {
				width: 1.3,
				alpha: 0.8 * (1 - smooth(span(t, B.turn[1], B.turn[1] + 0.3)))
			});
		}
		// The reading's spoke on the curve and its stylus in the half-plane.
		if (t > B.read[0] - 0.1 && t < B.read[1] + 0.25 && rArms) {
			const ra =
				smooth(span(t, B.read[0] - 0.1, B.read[0] + 0.1)) *
				(1 - smooth(span(t, B.read[1], B.read[1] + 0.25)));
			let u = 0;
			let v = 0;
			let ww = 0;
			for (let k = 0; k < 8; k++) {
				if (rArms[k] <= 1e-6) continue;
				const a = armAt(k, rArms[k], n, ph);
				u += a[0];
				v += a[1];
				ww += a[2];
			}
			const pen = toWorld(u, v, ww);
			const hub = [LX, LY, pen[2]];
			const s1 = [cam.project(hub), cam.project(pen)];
			const rr = prof.raw(readS);
			const s2 = [cam.project(P3(readS, 0)), cam.project(P3(readS, rr))];
			for (const S2 of [s1, s2])
				if (S2[0][2] > NEAR && S2[1][2] > NEAR)
					stroke(ctx, S2, { color: PAL.gold, width: 1.2, alpha: 0.7 * ra });
			if (s2[1][2] > NEAR) disc(ctx, s2[1][0], s2[1][1], 2, { fill: PAL.gold, alpha: 0.85 * ra });
		}
		if (t < B.turn[0]) return;

		// The surface: the body's own depth for the hidden lines.
		Z.reset(w, h);
		body.fillDepth(Z, cam, shape, pose);
		const NR = R.nRing;
		const turning = t < B.turn[1];
		// The parallels traced behind the swinging arm.
		if (turning) {
			const m = 64;
			const frac = psi / TAU;
			for (const i of R.ringsMid) {
				const ring = body.ring(shape, i, pose, m);
				const J = frac * m;
				const pts = [];
				for (let j = 0; j <= Math.floor(J); j++) pts.push(ring[(m - j + m) % m]);
				const f = J - Math.floor(J);
				if (f > 0 && J < m)
					pts.push(
						lerp3(ring[(m - Math.floor(J) + m) % m], ring[(m - Math.floor(J) - 1 + m) % m], f)
					);
				if (pts.length > 1) line3(ink, cam, pts, BODY.alpha.ring, 1, { back: 0.3 });
			}
		}
		// Generatrices, rings, contour, by beat.
		const pEnd = R.pEnd;
		const G = 16;
		const drawn = smooth(span(t, ...B.draw));
		let gens;
		if (turning)
			gens = (j) => {
				const pj = (((Math.PI / 2 - (TAU * j) / G) % TAU) + TAU) % TAU;
				return pEnd * smooth(span(psi - pj, 0, 0.5));
			};
		else gens = () => lerp(pEnd, 1, drawn);
		const rings = turning ? 0 : lerp(R.nMid / NR, 1, drawn);
		body.draw(ctx, cam, shape, pose, {
			rings,
			gens,
			contour: smooth(span(t, ...B.contour)),
			back: 0.24,
			pens: true
		});
		ink.flush(ctx);
		// The plates of the press: they close on the head across its thickness,
		// follow it from its width to its thickness, and draw off.
		const come = smooth(span(t, B.press[0] - 0.15, B.press[0] + 0.1));
		const go = smooth(span(t, B.press[1] - 0.1, B.press[1] + 0.15));
		if (come > 0 && go < 1) {
			const HW = R.spec.head[1] / 2;
			const HT = R.spec.head[2] / 2;
			const contact = lerp(HW, HT, press) + 0.05;
			const y = lerp(lerp(HW + 1.2, contact, come), HT + 1.2, go);
			const pa = 0.5 * come * (1 - go);
			for (const sg of [1, -1]) {
				const rect = [
					[-2.2, sg * y, -0.6],
					[2.2, sg * y, -0.6],
					[2.2, sg * y, 5.6],
					[-2.2, sg * y, 5.6],
					[-2.2, sg * y, -0.6]
				].map((p) => cam.project([LX + p[0], LY + p[1], p[2]]));
				if (rect.every((p) => p[2] > NEAR)) stroke(ctx, rect, { width: 1.1, alpha: pa });
			}
		}
		// The spark at the midpiece.
		const spark = span(t, B.life - 0.15, B.life);
		if (spark > 0) lit3(ctx, cam, body.at(shape, pose, R.sMid), 2.2, spark);
	}

	// ── Conception and the calendar ──────────────────────────────────────────
	function swimmerShape(R, t) {
		const spec = R.spec;
		return R.final.shape(t, {
			beat: span(t, B.life, B.life + 1),
			phase: TAU * spec.beat.hz * eased(t - B.life, 0.8) + spec.beat.phase,
			roll: TAU * spec.roll * eased(t - B.life - 0.1, 1.2)
		});
	}
	function swimmerPose(R, t) {
		const c = R.cal;
		return { path: c.path, sigma: c.sigma(t), up: c.up, scale: c.scale(t) };
	}

	function conceive(ctx, w, h, t) {
		const R = run();
		const c = R.cal;
		let pose;
		if (t < CK[CK.length - 1][0]) pose = orbitPose(compileOrbit(t, w, h));
		else if (t < c.tA) pose = conceptionPose(t, R, w, h);
		else pose = interimPose(t, R, w, h);
		const cam = lens(pose, w, h);
		const shape = swimmerShape(R, t);
		const sp = swimmerPose(R, t);
		// the lens's distance from the disc as it opens (from the keys alone)
		const E = conceptionPose(B.open[0], R, w, h).pos[2] - ZDISC;
		Z.reset(w, h);
		R.final.fillDepth(Z, cam, shape, sp);
		// The background: stars, fading as the calendar comes.
		const starA = 1 - smooth(span(t, B.write[0], B.join));
		stars(ctx, cam, w, h, starA * smooth(span(t, B.life, B.life + 1.2)));
		const dis = smooth(span(t, ...B.dissolve));
		if (t > B.seeds[0] - 0.4 && dis < 1) hornDraw(ctx, w, h, t, cam, E, 1 - dis);
		if (t > B.write[0]) spiralDraw(ctx, w, h, t, cam, R);
		R.final.draw(ctx, cam, shape, sp, { back: 0.16 });
		// The spark fading at the midpiece.
		const spark = 1 - smooth(span(t, B.life, B.life + 1));
		if (spark > 0) lit3(ctx, cam, R.final.at(shape, sp, R.sMid), 2.2, spark);
	}

	// The disc, seeded ahead, opening into Gabriel's horn.
	function hornDraw(ctx, w, h, t, cam, E, fade) {
		const H = horn(E);
		const xo = smooth(span(t, ...B.open));
		const lg = smooth(span(t, ...B.conf));
		// Once open, the horn holds still: its points from a table.
		const still = xo >= 1 && lg >= 1;
		if (still && !H.FIX) {
			const hh = 1e-3;
			const fr = (s) => {
				const c0 = hornAt(s.theta, s.xc);
				const m2 = hornAt(s.theta, s.d.xc);
				return { c0, e1: [-c0[1], c0[0], 0], e2: mul3(sub3(m2, c0), 1 / hh) };
			};
			const pts = (L) => L.map((p) => hornAt(p.theta, p.xc));
			H.FIX = {
				seeds: H.SEEDS.map(fr),
				sp8: H.SP8.map(pts),
				sp13: H.SP13.map(pts),
				rim: pts(H.RIM)
			};
		}
		const map = (p) => hornMap(p, xo, lg, E);
		const ink = makeInk();
		const lensZ = cam.pos[2];
		// Let what passes close to the lens go; a fog by depth down the horn.
		const near = (px) => 1 - smooth(span(px, 18, 72));
		const fog = (z) => 1 - lg * smooth(span(z, 1.3 * A, 3.7 * A));
		const line = (pts, al, wd, upto = 1, F = null) => {
			const end = (pts.length - 1) * upto;
			let qa = cam.project(F ? F[0] : map(pts[0]));
			for (let i = 1; i < pts.length && i - 1 < end; i++) {
				const qb = cam.project(F ? F[i] : map(pts[i]));
				if (qa[2] > NEAR && qb[2] > NEAR) {
					const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
					if (!Z.hidden(mid)) {
						const Lp = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
						ink.seg(
							PAL.chalk,
							fade * al * near(Lp) * smooth(span(Lp, 0.6, 5)) * fog(mid[2]),
							wd,
							false,
							qa[0],
							qa[1],
							qb[0],
							qb[1]
						);
					}
				}
				qa = qb;
			}
		};
		// The bell, r = A/x for x < 1, out toward the lens: rings of light.
		const bell = smooth(span(t, B.seeds[0] - 0.4, B.seeds[0] + 1.2)) * fade;
		if (bell > 0.01) {
			for (const k of [1.25, 1.6, 2, 2.6, 3.4, 4.5, 6, 8, 11]) {
				const rr = A * k;
				const zz = ZDISC + A * (1 - 1 / k);
				if (zz > lensZ - 1) continue;
				const P = [];
				for (let i = 0; i <= 128; i++)
					P.push([rr * Math.cos((TAU * i) / 128), rr * Math.sin((TAU * i) / 128), zz]);
				const al = 0.11 * bell * (1 - 0.06 * k);
				let qa = cam.project(P[0]);
				for (let i = 1; i < P.length; i++) {
					const qb = cam.project(P[i]);
					if (qa[2] > NEAR && qb[2] > NEAR) {
						ink.seg(PAL.gold, al, 1, false, qa[0], qa[1], qb[0], qb[1]);
					}
					qa = qb;
				}
			}
		}
		// The horn's parallels at whole x, once it is a horn.
		if (lg > 0.02)
			for (const pts of H.RINGS) {
				let qa = cam.project(pts[0]);
				for (let i = 1; i < pts.length; i++) {
					const qb = cam.project(pts[i]);
					if (qa[2] > NEAR && qb[2] > NEAR) {
						const mid = (qa[2] + qb[2]) / 2;
						const Lp = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
						ink.seg(
							PAL.gold,
							fade * lg * 0.16 * near(Lp) * (1 - smooth(span(mid, 2.5 * A, 7 * A))),
							1,
							false,
							qa[0],
							qa[1],
							qb[0],
							qb[1]
						);
					}
					qa = qb;
				}
			}
		// The rim.
		line(
			H.RIM,
			0.45,
			1,
			smooth(span(t, B.seeds[0] - 0.3, B.seeds[0] + 0.5)),
			still ? H.FIX.rim : null
		);
		// The seeds, rim to centre at the golden angle.
		const dt = (B.seeds[1] - B.seeds[0]) / PHYLLO.n;
		for (let i = 0; i < H.SEEDS.length; i++) {
			const ti = B.seeds[0] + Math.min(i, PHYLLO.n) * dt;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			const s = H.SEEDS[i];
			const c0 = still ? H.FIX.seeds[i].c0 : map(s);
			const qc = cam.project(c0);
			if (qc[2] <= NEAR || a * fog(qc[2]) < 0.02) continue;
			// The seed's frame on the map (derivatives in θ and ln ρ).
			let e1;
			let e2;
			if (still) ({ e1, e2 } = H.FIX.seeds[i]);
			else {
				// in θ the maps only turn the point about the axis
				e1 = [-c0[1], c0[0], 0];
				e2 = mul3(sub3(map(s.d), c0), 1e3);
			}
			const rr = PHYLLO.seedR * pop * (1 - 0.35 * lg);
			const q1 = cam.project(add3(c0, mul3(e1, rr)));
			const q2 = cam.project(add3(c0, mul3(e2, rr)));
			if (q1[2] <= NEAR || q2[2] <= NEAR) continue;
			const big = Math.max(
				Math.hypot(q1[0] - qc[0], q1[1] - qc[1]),
				Math.hypot(q2[0] - qc[0], q2[1] - qc[1])
			);
			// under ~1.6 px its alpha (below) is under a fiftieth: not drawn
			if (big < 1.6) continue;
			if (qc[0] + big < 0 || qc[0] - big > w || qc[1] + big < 0 || qc[1] - big > h) continue;
			if (Z.hidden(qc)) continue;
			const m = Math.max(6, Math.min(32, Math.round(4 + big / 2)));
			const al = fade * 0.72 * a * near(big) * smooth(span(big, 1.2, 6)) * fog(qc[2]);
			const wd = Math.min(1.4, 0.5 + big * 0.1);
			let pa = null;
			for (let kk = 0; kk <= m; kk++) {
				const cc = Math.cos((TAU * kk) / m);
				const ss = Math.sin((TAU * kk) / m);
				const p = [
					qc[0] + cc * (q1[0] - qc[0]) + ss * (q2[0] - qc[0]),
					qc[1] + cc * (q1[1] - qc[1]) + ss * (q2[1] - qc[1])
				];
				if (pa) ink.seg(PAL.chalk, al, wd, false, pa[0], pa[1], p[0], p[1]);
				pa = p;
			}
		}
		const p8 = smooth(span(t, ...B.sp8));
		const p13 = smooth(span(t, ...B.sp13));
		if (p8 > 0) H.SP8.forEach((s, j) => line(s, 0.55, 1.05, p8, still ? H.FIX.sp8[j] : null));
		if (p13 > 0) H.SP13.forEach((s, j) => line(s, 0.42, 0.95, p13, still ? H.FIX.sp13[j] : null));
		ink.flush(ctx);
		// The apex, the lattice's fixed point; then the horn's vanishing point.
		const ap = smooth(span(t, ...B.apex)) * fade;
		if (ap > 0) {
			const P = map(H.APEX);
			const far = [0, 0, ZDISC - 1e6];
			for (const [Qp, wt] of [
				[P, 1 - lg],
				[far, lg]
			]) {
				const qa = cam.project(Qp);
				if (wt > 0.01 && qa[2] > NEAR && !Z.hidden(qa)) lit3(ctx, cam, Qp, 2.0, 0.75 * ap * wt);
			}
		}
	}

	// The calendar spiral: written out from now, the years ticked and
	// numbered, the birthday, the 266 days, conception.
	function spiralDraw(ctx, w, h, t, cam, R, alpha = 1) {
		const c = R.cal;
		const ink = makeInk();
		const pole = cam.project(c.P0);
		const lnFloor = Math.log(0.25 / YEAR);
		const lnEnd = Math.log((NOW - Date.UTC(1900, 0, 1)) / DAY / YEAR);
		const wr = smooth(span(t, ...B.write));
		const lnTo = lerp(lnFloor, lnEnd, wr);
		// The curve, by θ: 120 points a turn; the inner turns go where they
		// are under a few pixels round the pole.
		const turns = lnTo - lnFloor;
		const N = Math.max(2, Math.ceil(turns * 140));
		let qa = null;
		for (let i = 0; i <= N; i++) {
			const ln = lnFloor + ((lnTo - lnFloor) * i) / N;
			const d = Math.exp(ln);
			const qb = cam.project(c.at(d));
			if (qa && qa[2] > NEAR && qb[2] > NEAR) {
				const rp = Math.hypot(qb[0] - pole[0], qb[1] - pole[1]);
				const a = alpha * 0.4 * smooth(span(rp, 3, 18));
				if (a > 0.01) {
					const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
					const hid = Z.hidden(mid);
					ink.seg(PAL.chalk, hid ? a * 0.3 : a, 1, hid, qa[0], qa[1], qb[0], qb[1]);
				}
			}
			qa = qb;
		}
		ink.flush(ctx);
		// Now: a small light at the pole.
		if (pole[2] > NEAR) glow(ctx, pole[0], pole[1], 26, [255, 226, 170], 0.32 * alpha * wr);
		// The months: the 1st of each, a short faint tick (the first stretch,
		// weeks to a year back, has no new year on it), gone by the birthday.
		if (t < B.birth) {
			const d0 = new Date(NOW);
			const Y0 = d0.getUTCFullYear();
			const M0 = d0.getUTCMonth();
			for (let k = 0; k < 12 * 130; k++) {
				const ms = Date.UTC(Y0, M0 - k, 1);
				const d = (NOW - ms) / DAY / YEAR;
				if (d <= 0) continue;
				if (Math.log(d) > lnTo) break;
				if (new Date(ms).getUTCMonth() === 0) continue;
				const P = c.at(d);
				const th = c.TH(d);
				const rr = c.R(d);
				const out = [Math.cos(th), Math.sin(th), 0];
				const a0 = cam.project(add3(P, mul3(out, -0.016 * rr)));
				const a1 = cam.project(add3(P, mul3(out, 0.016 * rr)));
				if (a0[2] <= NEAR || a1[2] <= NEAR) continue;
				if (a1[0] < -20 || a1[0] > w + 20 || a1[1] < -20 || a1[1] > h + 20) continue;
				const rp = Math.hypot(a1[0] - pole[0], a1[1] - pole[1]);
				const L = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
				// gone by the birthday: the months between it and conception are its own
				const vis =
					alpha *
					smooth(span(rp, 24, 60)) *
					smooth(span(L, 2, 6)) *
					(1 - smooth(span(t, B.birth - 1, B.birth)));
				if (vis > 0.02) ink.seg(PAL.chalk, 0.24 * vis, 1, false, a0[0], a0[1], a1[0], a1[1]);
			}
			ink.flush(ctx);
		}
		// The years: 1 January ticked across the spiral, numbered faintly.
		const nowY = new Date(NOW).getUTCFullYear();
		const yB = new Date(R.tB).getUTCFullYear();
		const lab = smooth(span(t, B.write[1] - 0.4, B.join));
		for (let Y = nowY; Y >= 1900; Y--) {
			const d = (NOW - Date.UTC(Y, 0, 1)) / DAY / YEAR;
			if (d <= 0 || Math.log(d) > lnTo) continue;
			const P = c.at(d);
			const rr = c.R(d);
			const th = c.TH(d);
			const out = [Math.cos(th), Math.sin(th), 0];
			const a0 = cam.project(add3(P, mul3(out, -0.035 * rr)));
			const a1 = cam.project(add3(P, mul3(out, 0.035 * rr)));
			if (a0[2] <= NEAR || a1[2] <= NEAR) continue;
			const rp = Math.hypot(a1[0] - pole[0], a1[1] - pole[1]);
			const dec = Y % 10 === 0;
			const here = Y === yB;
			const vis = alpha * smooth(span(rp, 30, 70));
			if (vis < 0.02) continue;
			stroke(ctx, [a0, a1], { width: 1, alpha: vis * (dec ? 0.5 : 0.3) });
			if (lab <= 0.01) continue;
			const L = cam.project(add3(P, mul3(out, 0.1 * rr)));
			if (L[2] <= NEAR || L[0] < -40 || L[0] > w + 40 || L[1] < -20 || L[1] > h + 20) continue;
			const sz = dec ? 12 : 10;
			text(
				ctx,
				String(Y),
				L[0],
				L[1],
				sz,
				vis * lab * (here ? 0.7 : dec ? 0.42 : 0.24),
				here ? PAL.gold : PAL.chalk
			);
		}
		// The birthday, the 266 days, conception.
		const PB = c.at(c.dB);
		const PC = c.PC;
		const qB = cam.project(PB);
		const qC = cam.project(PC);
		const lit = smooth(span(t, B.birth - 0.1, B.birth + 0.3));
		if (qB[2] > NEAR) {
			disc(ctx, qB[0], qB[1], 2.2, { fill: PAL.gold, alpha: alpha * lerp(0.45, 0.9, lit) * lab });
			if (lit > 0) {
				lit3(ctx, cam, PB, 2.4, 0.8 * lit * alpha);
				text(ctx, dateText(R.tB), qB[0], qB[1] + 22, 12, 0.8 * lit * alpha, PAL.gold);
			}
		}
		if (t > B.birth) {
			// The stretch, gold, written as it is swum; the months ticked.
			const sg = c.sigma(t);
			const dNow = t >= B.conceive ? c.dC : Math.exp(c.lnD(t));
			const pts = [];
			for (let i = 0; i <= 60; i++) pts.push(c.at(lerp(c.dB, dNow, i / 60)));
			void sg;
			const Q = pts.map((p) => cam.project(p)).filter((p) => p[2] > NEAR);
			stroke(ctx, Q, { color: PAL.gold, width: 1.6, alpha: 0.55 * alpha });
			const dB0 = new Date(R.tB);
			for (let k = 0; k <= 9; k++) {
				const ms = Date.UTC(dB0.getUTCFullYear(), dB0.getUTCMonth() - k, 1);
				if (ms > R.tB || ms < R.tC) continue;
				const d = (NOW - ms) / DAY / YEAR;
				const P = c.at(d);
				const rr = c.R(d);
				const th = c.TH(d);
				const out = [Math.cos(th), Math.sin(th), 0];
				const a0 = cam.project(add3(P, mul3(out, -0.012 * rr)));
				const a1 = cam.project(add3(P, mul3(out, 0.012 * rr)));
				if (a0[2] > NEAR && a1[2] > NEAR)
					stroke(ctx, [a0, a1], {
						color: PAL.gold,
						width: 1,
						alpha: 0.5 * alpha * smooth(span(t, B.birth + 0.2, B.birth + 1))
					});
			}
		}
		const reach = smooth(span(t, B.conceive - 0.15, B.conceive + 0.2));
		const glassK = smooth(span(t, ...B.glass));
		if (qC[2] > NEAR && t > B.birth) {
			disc(ctx, qC[0], qC[1], 2, {
				fill: PAL.chalk,
				alpha: alpha * 0.6 * smooth(span(t, B.birth, B.birth + 0.8)) * (1 - glassK)
			});
			if (reach > 0) {
				lit3(ctx, cam, PC, 2.6, reach * alpha * (1 - glassK));
				text(
					ctx,
					dateText(R.tC),
					qC[0],
					qC[1] + 24,
					12,
					0.75 * reach * alpha * (1 - smooth(span(t, B.glass[0], B.glass[0] + 0.3)))
				);
			}
		}
		return { pole, qC };
	}

	// ── The fall ─────────────────────────────────────────────────────────────
	function theFall(ctx, w, h, t) {
		const R = run();
		const c = R.cal;
		const fall = R.fall;
		const g = fall.geometry(w, h);
		const ef = g.efolds(t);
		const P = fallPoses(t, R, w, h, ef);
		const dollyCam = lens(P.dolly, w, h);
		// The background, under the plates and through every glass.
		const background = (cx, cam, zoom, alpha) => {
			const dx = cam.ox - w / 2;
			const dy = cam.oy - h / 2;
			// the rings of light and the stars come back as the plate comes up
			const back = smooth(span(t, B.fall[0], B.fadeIn[1] + 0.4));
			ringsOfLight(cx, cam.ox, cam.oy, w, h, zoom, alpha * back);
			const sa = alpha * (1 - smooth(span(zoom, 0.3, 2.2)));
			if (sa > 0.01) {
				cx.save();
				cx.translate(dx, dy);
				Z.reset(w, h);
				Z.off();
				spiralDraw(cx, w, h, t, dollyCam, R, sa);
				cx.restore();
			}
			stars(cx, dollyCam, w, h, 0.5 * alpha * back);
		};
		const cam = fall.draw(ctx, w, h, t, { background, colourAlong: false, dust: board.dust });
		// The first plate comes up out of the dark round its glass.
		const dark = 1 - smooth(span(t, ...B.fadeIn));
		const lv = g.levels[0];
		const boxAt = (z, x, y, bw, bh) => {
			const d = cam.z - z;
			const m = g.F / d;
			const cx0 = cam.ox + (g.F * (x - cam.x)) / d;
			const cy0 = cam.oy - (g.F * (y - cam.y)) / d;
			return [cx0 - (bw * m) / 2, cy0 - (bh * m) / 2, cx0 + (bw * m) / 2, cy0 + (bh * m) / 2];
		};
		if (dark > 0.003) {
			const F = boxAt(0, 0, 0, PLATE.W, PLATE.H);
			const Gb = boxAt(lv.glass.z, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h);
			// Over the plate (and what hangs in its glass), the space it comes up
			// out of: the board and the background again, at the dark's strength.
			ctx.save();
			ctx.beginPath();
			ctx.rect(F[0] - 2, F[1] - 2, F[2] - F[0] + 4, F[3] - F[1] + 4);
			ctx.clip();
			wipe(ctx, F[0] - 2, F[1] - 2, F[2] - F[0] + 4, F[3] - F[1] + 4, dark);
			background(ctx, cam, ef, dark);
			ctx.restore();
			// The point opened into the glass.
			const k = smooth(span(t, ...B.glass));
			const cx0 = (Gb[0] + Gb[2]) / 2;
			const cy0 = (Gb[1] + Gb[3]) / 2;
			const hw = ((Gb[2] - Gb[0]) / 2) * k;
			const hh = ((Gb[3] - Gb[1]) / 2) * k;
			stroke(
				ctx,
				[
					[cx0 - hw, cy0 - hh],
					[cx0 + hw, cy0 - hh],
					[cx0 + hw, cy0 + hh],
					[cx0 - hw, cy0 + hh],
					[cx0 - hw, cy0 - hh]
				],
				{
					width: 1.2,
					alpha: 0.7 * dark
				}
			);
		}
		// The swimmer, leading the lens: drawn at the fall's vanishing point,
		// on into the last glass at the landing.
		const aim = smooth(span(t, ...B.aim));
		let gx = cam.ox;
		let gy = cam.oy;
		if (cam.glass) {
			gx = (cam.glass[0] + cam.glass[2]) / 2;
			gy = (cam.glass[1] + cam.glass[3]) / 2;
		}
		const shift = [lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2];
		const scale = lerp(1, 3.4, aim * aim);
		const alpha = 1 - smooth(span(t, B.hit - 0.12, B.hit));
		if (t >= B.hit && cam.glass) splash(ctx, cam.glass, t - B.hit, R.spice);
		if (alpha > 0.01) {
			const sp = swimmerPose(R, t);
			const shape = swimmerShape(R, t);
			const nose = c.path(sp.sigma);
			const pose = { ...P.swim, pos: add3(nose, mul3(sub3(P.swim.pos, nose), scale)) };
			const scam = lens(pose, w, h);
			ctx.save();
			ctx.translate(shift[0], shift[1]);
			ctx.globalAlpha = alpha;
			R.final.draw(ctx, scam, shape, sp, { back: 0.12 });
			ctx.restore();
		}
	}
	// Rings of light round the vanishing point at the fall's zoom: one every
	// 0.55 e-folds, coming out of the dark and going past the frame.
	function ringsOfLight(ctx, ox, oy, w, h, zoom, alpha) {
		const step = 0.55;
		const base = 0.04 * h;
		const k0 = Math.floor(-zoom / step) - 1;
		ctx.save();
		ctx.strokeStyle = PAL.gold;
		for (let k = k0; k < k0 + 14; k++) {
			const r = base * Math.exp(zoom + k * step);
			if (r < 3 || r > 1.3 * Math.hypot(w, h)) continue;
			const a =
				alpha *
				0.1 *
				smooth(span(r, 3, 40)) *
				(1 - smooth(span(r, 0.6 * h, 1.3 * Math.hypot(w, h))));
			if (a < 0.006) continue;
			ctx.globalAlpha = a * 0.4;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(ox, oy, r, 0, TAU);
			ctx.stroke();
			ctx.globalAlpha = a;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.restore();
	}

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: answers.answers,
		get decade() {
			return run().decade;
		}
	};
	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render,
		resize() {
			intro.resize?.();
		}
	};
}
