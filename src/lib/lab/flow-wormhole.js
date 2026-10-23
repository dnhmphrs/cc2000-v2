import {
	getBoard,
	clearBoard,
	clock,
	tag,
	PAL,
	TAU,
	TECH_FONT,
	stroke,
	disc,
	span,
	smooth,
	lerp,
	clamp01,
	camera3,
	add3,
	sub3,
	mul3,
	cross,
	norm
} from './log/board.js';
import { NEAR, makeDepth, lit3 } from './log/space.js';
import { makeTerminal } from './log-dawn.js';
import { makeAnswers } from './log/answer.js';
import { script } from './log/entry.js';
import { makeBody, specOf, BODY } from './log/body.js';
import { PHYLLO, seeds as phylloSeeds, parastichy, seedFrame } from './log/phyllo.js';
import { caption, CAPTION } from './log/caption.js';
import { splash } from './log/splash.js';
import { makeFall, orderOf } from './log/fall.js';
import { DECADES, loadRooms, decadeOfDate } from './log/rooms.js';
import { EPICYCLE } from './intro/epicycle.js';

// ── Flow: flow-wormhole — the head drawn by epicycles, filled, sunk, sent back
// One run of the site on the board, in chalk, ~60 s.
//
// ENTRY. The terminal types the card centred, freezes at its full stop, and
// its lines fade out top first, gone before the first question; the stop,
// alone, glides to the pivot (epicycle's layout). "when were you born?": the
// head's 5 × 3 ellipse is drawn by two epicycles — an ellipse is exactly
// r₊e^{iφ} + r₋e^{−iφ}, r± = (5 ± 3)/4 — hung from the stop, turning, the
// pen tracing the outline; each digit typed hangs one more small arm on the
// chain, at harmonic m = 2 … 9 (the day's tens 2, … the year's units 9), its
// length ∝ the digit, a few percent of the head, so the outline stays a head
// and becomes the person's own (all coefficients real: the head stays
// symmetric about its axis, as a sperm head is). As each digit lands its arm
// RINGS: the outline, struck at the digit's harmonic, swings out in m gold
// lobes ∝ the digit and dies away into the arm's few percent — so each
// coefficient is SEEN being made as it is typed. "how spicy?": the spice is
// the TAIL — a faint line grows from the outline's back as the slider comes
// up, with n half-waves along it, n the handle (fractional while dragged).
//
// COMPILE (COMPILING USER GENETICS). The figure lies down: the board's plane
// IS the head's broad face (the lens at the start of the compile projects that
// plane exactly onto the entry's figure). The outline's MEDIAL AXIS (the
// centres of its maximal inscribed discs, by shrinking each boundary point's
// tangent disc) is drawn, and the metaballs are placed on it: one oblate
// spheroid per medial disc (its radius the disc's, its half-thickness κ times
// that). A cutting plane sweeps down through the head PARALLEL to its broad
// face and each slice's level curve — marching squares on the field — is
// written as it passes: the person's outline, nested, a contour map of their
// head. Then the plane turns square to the axis and sweeps the neck and the
// tail, the tail straightening out of the entry's wave into the chain, its
// rings written; and the surface is handed to body.js — each head station's
// section is the field's own, found by bisection round the station — and the
// body is written over the slices: its rings, its generatrices, its contour.
//
// CONCEPTION (SIMULATING CONCEPTION). Life (the spark at the midpiece, the
// beat in from the neck, the roll) and it swims. Ahead and below, a flat
// sheet's grid runs out to the horizon and draft's golden-angle disc is
// seeded on it, rim to centre, the 8- and 13-spirals written in. Then the
// sheet SINKS: every frame it is Flamm's paraboloid of a mass that grows —
// z = 2√(r_s(r − r_s)), the exact embedding of Schwarzschild's space — and the
// disc lies on it CONFORMALLY: read as isotropic coordinates, a seed at ρ
// sits at r = ρ(1 + r_s/4ρ)², so every seed keeps its shape as it rides down
// the curvature; inside ρ = r_s/4 (the throat) the disc goes on down a
// cylinder of radius r_s by the log map — phyllo's tunnel, conformal too, and
// tangent to the paraboloid at the throat, so the wormhole's throat opens
// into the long tube. The swimmer turns down over the centre and dives; the
// lens follows it in. The sheet's own grid (radial lines and circles, out to
// the horizon) warps with it, dim, under faint stars.
//
// INTERIM — THE LIGHT CONE. The tube's far mouth flares (the paraboloid's
// other sheet) and the swimmer comes out into a spacetime diagram drawn
// round it, the lens swinging round the swimmer itself to the diagram's side
// (the target onto the swimmer first, so it stays framed, side-on) and then
// pulling back: time vertical, the event — conception, 266 days before the
// birthday — a gold point below; its PAST light cone opening under it, two
// world-lines (the parents, straight) coming up inside it to meet at the apex; its
// future cone over it, inside which the swimmer's own world-line runs back
// down the time axis (a world-line from the event to now is timelike, so it
// lies inside the event's FUTURE cone; the past cone holds what led to it).
// The swimmer's world-line bows off the axis and comes back onto it ten
// years or so before the event, leaning; from there it rides the axis down.
// The axis ticks the years back from 2026 to the birth year (gold), and the
// swimmer's own year is written beside its head, counting back — rushing,
// then slowing, gold through the birth year, the event's year as it reaches
// it; then the lens pitches on down to
// look down the axis at the event — the swimmer's head on it, its tail
// trailing down the board, seen from behind and above because it met the
// axis leaning — and closes on it at the pace the fall opens at. Near the
// event the swimmer is drawn scale-free (the body at D_REF, the lens scaled
// about the event by the same ratio: a similarity, so the picture is the
// shrunken body's) and the diagram is fogged by depth in proportion to the
// lens's distance from the event, so the zoom stays self-similar.
//
// FALL. The apex is where the first room's glass opens (the fall starts
// further back than the kit's, so the room grows out of the event point);
// the chalk fall (log/fall.js), the light cone's own grid zooming on through
// every glass (a cone is invariant under dilation about its apex, so the
// diagram's X never changes as the fall zooms into it), the swimmer's head
// at the vanishing point leading the lens down the glasses, and on into the
// last room's monitor; the straight world-lines go as the last rooms come.
// ROOM: the splash on the screen, the room held, a fade.
//
// Numerals on the board beyond the brief's words: the time axis's years
// (decades, 2026, and the birth year in gold) and the swimmer's running year
// — the interim's idea needs them.
//
// Every frame is a pure function of t and the hand: ?at= pins it; live in the
// lab (no ?at=, not ?demo=1) the run waits at each question and the person
// answers; ?decade= forces the room. Caches are of inputs only: the person's
// figure, field, slices and body, made once per answers; the frozen title.
//
// Beats, in seconds (60; at = t / 60):
//    0    – 5.14  the terminal types the card; frozen at its stop
//    5.4  – 6.4   its lines fade, top first; 6.2 – 6.8 the stop to the pivot
//    6.8          "when were you born?" (q1); 6.95 – 7.7 the ellipse's arms
//    7.6 / 9.8    the wait (wait1), each digit's arm ringing as it lands /
//                 Enter (e1): a gold trace round the head
//   11.6          "how spicy?" (q2); the tail grows from the back
//   12.4 / 14.4   the wait (wait2) / Enter (e2): the gold trace, head and tail
//   15.0 – 22.5   COMPILE: 15.0 – 15.9 the arms fold home; 15.4 the medial
//                 axis; 15.7 the balls; 16.6 – 18.4 the head's slices (the
//                 lens tilts off the plane 16.9 – 18.4); 18.5 the tail
//                 straightens; 18.9 – 20.1 its rings; 19.9 – 21.3 the body
//   21.5          life: the spark, the beat, the roll
//   22.5 – 34     CONCEPTION: 22.6 the sheet's grid; 23.2 – 26.2 the seeds;
//                 25.4 the spirals; 26.6 – 29.6 the sheet sinks; the dive;
//                 the throat ~31.6; the tube
//   34   – 42     INTERIM: the mouth (33.6 out of it); 33.3 – 35.0 the lens
//                 swings round the swimmer to the side; 35.0 – 36.9 it pulls
//                 back over the diagram; the cones, the parents (36 – 38.4),
//                 the years, the swimmer's own (35.3 – 41.9); 39.2 – 40.8 it
//                 pitches down the axis; the event closing
//   42   – 53.5   FALL (42 the room out of the apex); 51.4 – 53.4 landing
//   53.5          THE SPLASH; the room held; 59.2 – 60 the fade

const SECONDS = 60;
const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
const FREEZE = TERM.stop + 0.2;
const { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 } = EPICYCLE.beats;

const B = {
	q1: Q1,
	wait1: W1,
	e1: E1,
	q2: Q2,
	wait2: W2,
	e2: E2,
	gone: 5.4,
	pan: [6.2, 6.8],
	base: [Q1 + 0.15, Q1 + 0.9],
	field: [Q1 + 0.25, Q1 + 0.7],
	slider: [Q2 + 0.35, Q2 + 0.8],
	tail: [Q2 + 0.4, Q2 + 1.3],
	trace: 1.2,
	compile: 15.0,
	fold: [15.0, 15.9],
	genetics: [15.2, 22.4],
	axis: [15.4, 16.1],
	balls: [15.7, 16.8],
	slices: [16.6, 18.4],
	tilt: [16.9, 18.4],
	pull: [18.4, 20.2],
	straighten: [18.5, 19.4],
	rings: [18.9, 20.1],
	body: [19.9, 21.3],
	life: 21.5,
	behind: [21.2, 23.4],
	conception: 22.5,
	caption2: [22.7, 33.8],
	grid: [22.6, 24.8],
	seed: [23.2, 26.2],
	spirals: [25.4, 26.9],
	sink: [26.6, 29.6],
	interim: 34.0,
	mouth: [33.0, 35.4],
	cones: [33.3, 34.8],
	parents: [36.0, 38.4],
	chase: [33.3, 35.0],
	side: [35.0, 36.9],
	zoom: [39.2, 40.8],
	fall: [42.0, 53.4],
	roomIn: [42.0, 42.6],
	land: [51.4, 53.4],
	colour: [51.8, 54.0],
	aim: [51.6, 53.5],
	hit: 53.5,
	out: [59.2, 60]
};

const FOV = 46;
const UP = [0, 1, 0];
const SIDE = norm([-1, 0.25, 0.45]); // the side view's lens, from the event
const TOP_UP = norm([1, 0, -0.45]); // …pitched down to look down the axis
const LENS_H = 150; // the lens over the swimmer's nose, looking down the axis

// ── The head's outline: an ellipse as two epicycles, and the digits' arms ────
const HEAD_A = 2.5; // the head's 5 × 3 ellipse
const HEAD_B = 1.5;
const HARM = [2, 3, 4, 5, 6, 7, 8, 9]; // digit k's harmonic
const SIGN = [1, 1, -1, -1, 1, 1, -1, -1]; // so they do not all pile up at the nose
// A digit 9's arm, in head units: a few percent of the head, falling with the
// harmonic so the outline's curvature stays a head's (1.3/(m − 1)², at
// most 0.085: 3–4% of the head down to 1% at m = 9).
const AMP = HARM.map((m) => Math.min(0.085, 1.3 / ((m - 1) * (m - 1))));
const PERIOD = 12; // the arms turn once in 12 s
const GROW = 0.3;
const SHRINK = 0.2;
// A digit's arm, as it lands, RINGS: the outline struck at the digit's
// harmonic, m lobes, ∝ the digit (a 0 a flicker), swinging in and out and
// dying away into the arm's own few percent — drawn in gold over the chalk
// outline, so each coefficient is seen being made as it is typed.
// A 9's swing at its first peak, in head units: 0.32, less at the higher
// harmonics (m·A < 0.9, so the struck outline never pinches into a cusp).
const RING = HARM.map((m) => Math.min(0.32, 0.9 / m));
const ringOf = (dt) =>
	dt < 0 || dt > 1.9
		? 0
		: smooth(span(dt, 0, 0.07)) *
			Math.exp(-dt / 0.45) *
			Math.cos(TAU * 1.1 * dt) *
			(1 - smooth(span(dt, 1.4, 1.9)));

// The chain: the ellipse's two arms (scaled by `base`), then one per digit.
function armsOf(base, digits) {
	const out = [
		{ r: ((HEAD_A + HEAD_B) / 2) * base, f: 1 },
		{ r: ((HEAD_A - HEAD_B) / 2) * base, f: -1 }
	];
	for (let k = 0; k < 8; k++) {
		const x = digits[k] ?? { d: 0, g: 0 };
		out.push({ r: SIGN[k] * AMP[k] * (x.d / 9) * x.g, f: HARM[k] });
	}
	return out;
}
// The same chain with each digit's ring added to its arm (null if none rings).
function ringingOf(arms, digits) {
	let any = 0;
	const out = arms.map((a, i) => {
		const x = i >= 2 ? digits[i - 2] : null;
		if (!x || !x.ring) return a;
		any = Math.max(any, Math.abs(x.ring));
		return { r: a.r + SIGN[i - 2] * RING[i - 2] * (0.2 + 0.8 * (x.d / 9)) * x.ring, f: a.f };
	});
	return any > 0.01 ? { arms: out, strength: any } : null;
}
const curveAt = (arms, ph) => {
	let X = 0;
	let Y = 0;
	for (const a of arms) {
		if (a.r === 0) continue;
		X += a.r * Math.cos(a.f * ph);
		Y += a.r * Math.sin(a.f * ph);
	}
	return [X, Y];
};

// ── The scripted hand's digits: when each lands, read off the demo's script ──
const SB = { q1: Q1, type1: W1, e1: E1, q2: Q2, drag2: W2 + 0.3, e2: E2 };
const KEYT = (() => {
	const out = [];
	for (let i = 0; i <= 3000 && out.length < 8; i++) {
		const t = W1 + i * 0.001;
		const n = script(t, SB).typed.length;
		while (out.length < n) out.push(t);
	}
	while (out.length < 8) out.push(Infinity);
	return out;
})();

// ── The questions (epicycle's: the terminal's face, its pace) ────────────────
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
function keys(text, seed, lead = 0.06) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = lead;
	return [...text].map((ch, i) => {
		t += 0.032 * (0.55 + 0.9 * rnd()) + (i > 0 && text[i - 1] === ' ' ? 0.03 : 0);
		return t;
	});
}
const K1 = keys(Q1_TEXT, 7001);
const K2 = keys(Q2_TEXT, 7013);
const typedBy = (K, x) => {
	let n = 0;
	while (n < K.length && K[n] <= x) n++;
	return n;
};
const MASK = 'dd.mm.yyyy';
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
const GROUP_OF = [0, 0, 1, 1, 2, 2, 2, 2];
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const pad = (x, n) => String(x).padStart(n, '0');
const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysIn = (m, y) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
function canBe(part, lo, hi, n) {
	for (let x = lo; x <= hi; x++) if (pad(x, n).startsWith(part)) return true;
	return false;
}
function badGroups(typed) {
	const D = typed.slice(0, 2);
	const M = typed.slice(2, 4);
	const Y = typed.slice(4, 8);
	const yearOk = Y.length === 4 && canBe(Y, 1900, 2099, 4);
	const monthOk = M.length === 2 && canBe(M, 1, 12, 2);
	const maxDay = monthOk ? daysIn(Number(M), yearOk ? Number(Y) : 2000) : 31;
	return [
		D.length > 0 && !canBe(D, 1, maxDay, 2),
		M.length > 0 && !canBe(M, 1, 12, 2),
		Y.length > 0 && !canBe(Y, 1900, 2099, 4)
	];
}

// ∫ of a smoothstep ramp of length D: a clock that starts at rest.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}
// ?prof=1: each section's script time, averaged, on window.__lab.prof.
const PROF = { on: false, acc: {}, n: 0 };
function prof(name, fn) {
	if (!PROF.on) return fn();
	const t0 = performance.now();
	const r = fn();
	PROF.acc[name] = (PROF.acc[name] ?? 0) + performance.now() - t0;
	return r;
}
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ── Ink: segments batched by colour, alpha and width, chained into paths ─────
function makeInk(name = 'ink') {
	const B = new Map();
	return {
		seg(color, alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(24, Math.round(alpha * 24));
			const wq = Math.max(2, Math.min(24, Math.round(width * 4)));
			const key = `${color}|${a}|${wq}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 24, width: wq / 4, P: [], lx: NaN, ly: NaN };
				B.set(key, b);
			}
			if (b.lx !== x0 || b.ly !== y0) b.P.push(NaN, x0, y0);
			b.P.push(x1, y1);
			b.lx = x1;
			b.ly = y1;
		},
		flush(ctx) {
			const g0 = ctx.globalAlpha;
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = g0 * b.alpha;
				ctx.lineWidth = b.width;
				ctx.beginPath();
				const P = b.P;
				let lx = 0;
				let ly = 0;
				let len = 0;
				for (let i = 0; i < P.length;) {
					if (Number.isNaN(P[i])) {
						ctx.moveTo(P[i + 1], P[i + 2]);
						lx = P[i + 1];
						ly = P[i + 2];
						i += 3;
					} else {
						ctx.lineTo(P[i], P[i + 1]);
						if (PROF.on) len += Math.hypot(P[i] - lx, P[i + 1] - ly);
						lx = P[i];
						ly = P[i + 1];
						i += 2;
					}
				}
				if (PROF.on) PROF.acc['k_' + name] = (PROF.acc['k_' + name] ?? 0) + (len * b.width) / 1000;
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// A 3D polyline through a lens into the ink: cut at the near plane; `upto`
// writes the first part of it; `fade(q)` (q the segment's projected middle)
// scales each segment; `hidden(q)` drops (or, `back` > 0, dims) a segment;
// what passes close to the lens is let go (`near` px).
const VIEW = { w: 1280, h: 800 }; // the board, set each frame: off-screen pieces are skipped
function line3d(ink, cam, pts, o) {
	const {
		color = PAL.chalk,
		alpha = 1,
		width = 1,
		upto = 1,
		fade = null,
		hidden = null,
		back = 0,
		near = 0
	} = o;
	if (alpha <= 0.01 || upto <= 0 || pts.length < 2) return;
	const n = pts.length - 1;
	const end = n * clamp01(upto);
	let qa = cam.project(pts[0]);
	for (let i = 1; i <= n && i - 1 < end; i++) {
		let qb = cam.project(pts[i]);
		const fr = Math.min(1, end - (i - 1));
		if (fr < 1) {
			const p = lerp3(pts[i - 1], pts[i], fr);
			qb = cam.project(p);
		}
		const off =
			(qa[0] < -8 && qb[0] < -8) ||
			(qa[1] < -8 && qb[1] < -8) ||
			(qa[0] > VIEW.w + 8 && qb[0] > VIEW.w + 8) ||
			(qa[1] > VIEW.h + 8 && qb[1] > VIEW.h + 8);
		if (qa[2] > NEAR && qb[2] > NEAR && !off) {
			let a = alpha;
			const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
			if (fade) a *= fade(mid);
			if (near > 0) {
				const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
				a *= 1 - smooth(span(L, near, near * 4));
			}
			if (hidden && hidden(mid)) a *= back;
			if (a > 0.012) ink.seg(color, a, width, qa[0], qa[1], qb[0], qb[1]);
		}
		qa = qb;
	}
}

// A straight 3D line as n pieces (so a near fade can act along it).
function seg3(a, b, n = 40) {
	const out = [];
	for (let i = 0; i <= n; i++) out.push(lerp3(a, b, i / n));
	return out;
}

// ── The person: everything the answers make, once per answers ───────────────
// The outline (the full chain), its medial axis and balls, the field, its
// slices parallel to the broad face, and the body.js body whose head
// sections are the field's.
const NOUT = 240;
const KSM = 0.08; // the smooth union's reach, head units
const NSLICE = 9;
function smin(a, b, k) {
	const h = Math.max(k - Math.abs(a - b), 0) / k;
	return Math.min(a, b) - h * h * k * 0.25;
}

// The date's part (the outline, the field, the slices, the head's sections)
// is made at the date's Enter; the spice's (the beat, the body) at the
// spice's — so a live run pays for each while its gold trace runs.
let HEAD = null;
function headOf(date) {
	if (HEAD && HEAD.date === date) return HEAD;
	const digits = String(date).padEnd(8, '0').slice(0, 8).split('').map(Number);
	const arms = armsOf(
		1,
		digits.map((d) => ({ d, g: 1 }))
	);
	// The outline, counter-clockwise from the nose.
	const P = [];
	for (let i = 0; i < NOUT; i++) P.push(curveAt(arms, (TAU * i) / NOUT));
	let Xn = -Infinity;
	let Xb = Infinity;
	let Wm = 0;
	let iBack = 0;
	for (let i = 0; i < NOUT; i++) {
		if (P[i][0] > Xn) Xn = P[i][0];
		if (P[i][0] < Xb) {
			Xb = P[i][0];
			iBack = i;
		}
		Wm = Math.max(Wm, Math.abs(P[i][1]));
	}
	const Lh = Xn - Xb;

	// The medial axis: each boundary point's largest inscribed disc tangent
	// there (shrink the tangent disc until no other boundary point is inside:
	// r = min |q − p|² / 2 n·(q − p)); its centre is a medial point.
	const normal = (j) => {
		const a = P[(j - 1 + NOUT) % NOUT];
		const b = P[(j + 1) % NOUT];
		const tx = b[0] - a[0];
		const ty = b[1] - a[1];
		const l = Math.hypot(tx, ty) || 1;
		return [-ty / l, tx / l];
	};
	const medial = [];
	for (let j = 0; j < NOUT; j++) {
		const p = P[j];
		const nn = normal(j);
		let r = Infinity;
		for (let i = 0; i < NOUT; i++) {
			const di = Math.min(Math.abs(i - j), NOUT - Math.abs(i - j));
			if (di < 3) continue;
			const dx = P[i][0] - p[0];
			const dy = P[i][1] - p[1];
			const nd = nn[0] * dx + nn[1] * dy;
			if (nd <= 1e-9) continue;
			const rr = (dx * dx + dy * dy) / (2 * nd);
			if (rr < r) r = rr;
		}
		if (!Number.isFinite(r)) r = 0;
		medial.push({ c: [p[0] + r * nn[0], p[1] + r * nn[1]], r, j });
	}
	// The balls: every third medial disc, near-duplicates dropped.
	const rMax = Math.max(...medial.map((m) => m.r));
	const HT = specOf({ date }).head[2] / 2;
	const kappa = HT / rMax;
	const balls = [];
	for (let j = 0; j < NOUT; j += 3) {
		const m = medial[j];
		if (m.r < 0.06) continue;
		if (
			balls.some(
				(b) => Math.hypot(b.c[0] - m.c[0], b.c[1] - m.c[1]) < 0.03 && Math.abs(b.r - m.r) < 0.03
			)
		)
			continue;
		balls.push({ c: m.c, r: m.r, t: kappa * m.r, j });
	}
	// The field: the smooth union of the spheroids, slice by slice — at height
	// y each ball is the disc of radius r √(1 − (y/t)²); F < 0 inside.
	const field = (X, Y, y, list = balls) => {
		let f = 1e9;
		for (const b of list) {
			if (y >= b.t || y <= -b.t) continue;
			const q = y / b.t;
			const rho = b.r * Math.sqrt(1 - q * q);
			const d = Math.hypot(X - b.c[0], Y - b.c[1]) - rho;
			f = d < f + KSM ? smin(f, d, KSM) : f;
		}
		return f;
	};

	// The slices parallel to the broad face: marching squares on the plan
	// grid at NSLICE heights, top to bottom; the middle one is the outline.
	// (Per slice each ball is a disc of known radius; per column only the
	// discs that reach it are summed, and a disc too far in Y is skipped.)
	const cell = 0.06;
	const gx0 = Xb - 0.35;
	const gy0 = -Wm - 0.35;
	const nx = Math.ceil((Lh + 0.7) / cell);
	const ny = Math.ceil((2 * Wm + 0.7) / cell);
	const slices = [];
	const NB = balls.length;
	const rho = new Float64Array(NB);
	const cand = new Int32Array(NB);
	for (let k = 0; k < NSLICE; k++) {
		const y = HT * 0.9 * (1 - (2 * k) / (NSLICE - 1));
		for (let b = 0; b < NB; b++) {
			const q = y / balls[b].t;
			rho[b] = q * q < 1 ? balls[b].r * Math.sqrt(1 - q * q) : -1;
		}
		const val = new Float64Array((nx + 1) * (ny + 1));
		for (let i = 0; i <= nx; i++) {
			const X = gx0 + i * cell;
			let nc = 0;
			for (let b = 0; b < NB; b++)
				if (rho[b] > 0 && Math.abs(balls[b].c[0] - X) < rho[b] + KSM + cell) cand[nc++] = b;
			for (let j = 0; j <= ny; j++) {
				const Y = gy0 + j * cell;
				let f = 1e9;
				for (let c = 0; c < nc; c++) {
					const b = cand[c];
					const dy = Y - balls[b].c[1];
					if (Math.abs(dy) - rho[b] > f + KSM) continue;
					const d = Math.hypot(X - balls[b].c[0], dy) - rho[b];
					f = d < f + KSM ? smin(f, d, KSM) : f;
				}
				val[i * (ny + 1) + j] = f;
			}
		}
		const loops = march(val, nx, ny).map((L) =>
			resample(L, Math.max(24, Math.round(L.length * 0.9))).map(([i, j]) => [
				gx0 + i * cell,
				gy0 + j * cell
			])
		);
		slices.push({ y, loops, mid: k === (NSLICE - 1) / 2 });
	}

	// The body's head: the kit's spec with the outline's length and width
	// (its thickness the kit's, the year's tens); each head station's section
	// from the field, by bisection round the station (the balls that can
	// reach it only), the neck's own radius coming in under it at the back.
	const base = specOf({ date });
	const probe = makeBody({ ...base, head: [Lh, 2 * Wm, base.head[2]] });
	const NA = 48;
	const tables = probe.stations.map((st) => {
		if (st.part !== 'head' || st.s <= 1e-6) return null;
		const X = Xn - st.s;
		const near = balls.filter((b) => Math.abs(b.c[0] - X) < b.r + KSM + 0.05);
		const floor = BODY.neck[0] * smooth(span(st.s, 0.7 * Lh, Lh));
		const R = new Float64Array(NA);
		const inside = field(X, 0, 0, near) < 0;
		for (let k = 0; k < NA; k++) {
			const ph = (TAU * k) / NA;
			const cu = Math.cos(ph);
			const sv = Math.sin(ph);
			let lo = 0;
			if (inside) {
				let hi = 2.4;
				for (let it = 0; it < 15; it++) {
					const m = (lo + hi) / 2;
					if (field(X, -m * cu, m * sv, near) < 0) lo = m;
					else hi = m;
				}
			}
			R[k] = Math.max(lo, floor);
		}
		return { R, a: st.a, b: st.b };
	});
	const section = (i, ph) => {
		const T = tables[i];
		if (!T || T.a < 1e-4 || T.b < 1e-4) return [Math.cos(ph), Math.sin(ph)];
		const x = ((((ph / TAU) % 1) + 1) % 1) * NA;
		const k0 = Math.floor(x) % NA;
		const f = x - Math.floor(x);
		const r = T.R[k0] * (1 - f) + T.R[(k0 + 1) % NA] * f;
		return [(r * Math.cos(ph)) / T.a, (r * Math.sin(ph)) / T.b];
	};
	section.M = 32;
	section.gens = 16;
	section.uniform = false;

	// The conception date: 266 days before the birthday, as a year with its
	// fraction; the years the time axis runs over.
	const dd = Math.max(1, Math.min(31, digits[0] * 10 + digits[1]));
	const mm = Math.max(1, Math.min(12, digits[2] * 10 + digits[3]));
	const yy = Math.max(1900, Math.min(2099, Number(String(date).slice(4, 8)) || 1987));
	const ms = Date.UTC(yy, mm - 1, dd) - 266 * 864e5;
	const yearOf = (m) => {
		const d = new Date(m);
		const y0 = Date.UTC(d.getUTCFullYear(), 0, 1);
		const y1 = Date.UTC(d.getUTCFullYear() + 1, 0, 1);
		return d.getUTCFullYear() + (m - y0) / (y1 - y0);
	};
	const TE = yearOf(ms);
	const TB = yearOf(Date.UTC(yy, mm - 1, dd));
	const TTOP = Math.max(2026, Math.ceil(TE) + 4);

	HEAD = {
		date,
		digits,
		arms,
		outline: P,
		Xn,
		Xb,
		Lh,
		Wm,
		iBack,
		medial,
		balls,
		HT,
		slices,
		section,
		year: yy,
		TE,
		TB,
		TTOP,
		decade: decadeOfDate(date)
	};
	return HEAD;
}

// The person: the head, and the body — the kit's spec, its head the
// outline's, its section the field's, and the beat with n half-waves down
// the flagellum (λ = 2·span/n, n the spice).
function personOf(date, spice) {
	const th = performance.now();
	const H = headOf(date);
	if (PROF.on && typeof window !== 'undefined' && window.__lab)
		window.__lab.headMs = performance.now() - th;
	const n = Math.max(1, Math.min(10, Math.round(spice)));
	const base = specOf({ date, spice: n });
	const spec = { ...base, head: [H.Lh, 2 * H.Wm, base.head[2]], section: H.section };
	const span0 = 0.7 + spec.mid[0] + spec.tail[0];
	spec.beat = { ...base.beat, wavelength: (2 * span0) / n };
	const body = makeBody(spec);
	const nHead = body.rings.filter((i) => body.stations[i].part === 'head').length;
	return { ...H, spice: n, spec, body, nHead };
}

// ── Marching squares (swimmer/implicit.js's), chained into loops ─────────────
const MS = {
	1: [[3, 0]],
	2: [[0, 1]],
	3: [[3, 1]],
	4: [[1, 2]],
	6: [[0, 2]],
	7: [[3, 2]],
	8: [[2, 3]],
	9: [[0, 2]],
	11: [[1, 2]],
	12: [[1, 3]],
	13: [[0, 1]],
	14: [[3, 0]]
};
function march(val, nx, ny) {
	const W = ny + 1;
	const HN = nx * W;
	const P = new Map();
	const adj = new Map();
	const link = (a, b) => {
		if (!adj.has(a)) adj.set(a, []);
		if (!adj.has(b)) adj.set(b, []);
		adj.get(a).push(b);
		adj.get(b).push(a);
	};
	for (let i = 0; i < nx; i++)
		for (let j = 0; j < ny; j++) {
			const a = val[i * W + j];
			const b = val[(i + 1) * W + j];
			const c = val[(i + 1) * W + j + 1];
			const d = val[i * W + j + 1];
			const idx = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (c < 0 ? 4 : 0) | (d < 0 ? 8 : 0);
			if (idx === 0 || idx === 15) continue;
			const id = [i * W + j, HN + (i + 1) * ny + j, i * W + j + 1, HN + i * ny + j];
			const at = (e) => {
				if (P.has(id[e])) return;
				if (e === 0) P.set(id[e], [i + a / (a - b), j]);
				else if (e === 1) P.set(id[e], [i + 1, j + b / (b - c)]);
				else if (e === 2) P.set(id[e], [i + d / (d - c), j + 1]);
				else P.set(id[e], [i, j + a / (a - d)]);
			};
			let T = MS[idx];
			if (!T) {
				const mid = (a + b + c + d) / 4 < 0;
				if (idx === 5)
					T = mid
						? [
								[3, 2],
								[0, 1]
							]
						: [
								[3, 0],
								[1, 2]
							];
				else
					T = mid
						? [
								[0, 1],
								[2, 3]
							]
						: [
								[3, 0],
								[1, 2]
							];
			}
			for (const [p, q] of T) {
				at(p);
				at(q);
				link(id[p], id[q]);
			}
		}
	const loops = [];
	const seen = new Set();
	const walk = (start) => {
		const out = [P.get(start)];
		seen.add(start);
		let prev = -1;
		let cur = start;
		for (;;) {
			const nb = adj.get(cur);
			const next = nb[0] !== prev || nb.length < 2 ? nb[0] : nb[1];
			if (next === undefined || next === prev) break;
			if (next === start) {
				out.push(P.get(start));
				break;
			}
			if (seen.has(next)) break;
			seen.add(next);
			out.push(P.get(next));
			prev = cur;
			cur = next;
		}
		return out;
	};
	for (const [k, nb] of adj) if (nb.length === 1 && !seen.has(k)) loops.push(walk(k));
	for (const k of adj.keys()) if (!seen.has(k)) loops.push(walk(k));
	return loops.filter((l) => l.length > 2);
}
function resample(L, n) {
	const d = [0];
	for (let i = 1; i < L.length; i++)
		d.push(d[i - 1] + Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]));
	const tot = d[d.length - 1];
	const out = [];
	let k = 0;
	for (let i = 0; i <= n; i++) {
		const x = (tot * i) / n;
		while (k < L.length - 2 && d[k + 1] < x) k++;
		const f = d[k + 1] > d[k] ? (x - d[k]) / (d[k + 1] - d[k]) : 0;
		out.push([lerp(L[k][0], L[k + 1][0], f), lerp(L[k][1], L[k + 1][1], f)]);
	}
	return out;
}

// ── The sheet: Flamm's paraboloid, the disc on it conformally ───────────────
// The disc's rim at isotropic radius R_ISO; at full mass the throat (ρ = r_s/4)
// is e³ in from the rim: r_s = 4 R_ISO e^{−3}. Heights are measured from the
// paraboloid at R_ANCHOR (that circle stays put as the mass grows).
const R_ISO = 200;
const RS_MAX = 4 * R_ISO * Math.exp(-3); // ≈ 39.8
const R_ANCHOR = 900;
const R_FAR = 2600;
const wOf = (r, rs) => (rs > 0 ? 2 * Math.sqrt(rs * Math.max(0, r - rs)) : 0);
// A point of the disc (θ, ρ) on the sheet of mass r_s: the paraboloid down to
// the throat, the log map's cylinder below it.
function sheetAt(theta, rho, rs) {
	const wa = wOf(R_ANCHOR, rs);
	const rt = rs / 4;
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	if (rho >= rt) {
		const q = 1 + rs / (4 * rho);
		const r = rho * q * q;
		return [r * c, wOf(r, rs) - wa, r * s];
	}
	return [rs * c, -wa - rs * Math.log(rt / rho), rs * s];
}
// The sheet's own grid point at world radius r (outside the disc).
const gridAt = (theta, r, rs) => [
	r * Math.cos(theta),
	wOf(r, rs) - wOf(R_ANCHOR, rs),
	r * Math.sin(theta)
];
const rimOf = (rs) => R_ISO * (1 + rs / (4 * R_ISO)) ** 2;
const THROAT_Y = -wOf(R_ANCHOR, RS_MAX);

// ── The path it swims: on along +x high over the sheet, a quarter turn down
// over the disc's centre, then straight down the axis, through the throat,
// down the tube and on down the time axis.
const A0 = [-640, 320, 0];
const RT = 160;
const L1 = -RT - A0[0];
const ARC = (Math.PI * RT) / 2;
const SIG_V = L1 + ARC; // where it heads straight down
const Y_V = A0[1] - RT; // … at this height
// Past the tube (σ > SIG_34, the interim) its world-line bows off the time
// axis — toward −x, timelike everywhere (slope ≤ LEAN < 1) — and comes back
// onto it D_REF over the event, leaning LEAN there: the swimmer meets the axis
// heading a little across it, so the lens on the axis sees it from behind and
// above, not dead behind. Below D_REF it rides the axis into the event.
const D0 = 500; // the swimmer's height over the event at 34 s (2026 there)
const D_REF = 30; // the swimmer is full size until this close
const LEAN = 0.45;
let SIG_34 = Infinity; // set below, once the swim's clock is known
const driftAt = (sg) => {
	if (sg <= SIG_34) return 0;
	const D = D0 - (sg - SIG_34);
	if (D <= D_REF) return 0;
	return ((-LEAN * (D - D_REF) * (D0 - D)) / (D0 - D_REF)) * smooth(span(D0 - D, 0, 110));
};
function pathW(sg) {
	if (sg <= L1) return [A0[0] + sg, A0[1], 0];
	if (sg <= SIG_V) {
		const a = (sg - L1) / RT;
		return [-RT + RT * Math.sin(a), Y_V + RT * Math.cos(a), 0];
	}
	return [driftAt(sg), Y_V - (sg - SIG_V), 0];
}
function headingAt(sg) {
	if (sg <= L1) return [1, 0, 0];
	if (sg <= SIG_V) {
		const a = (sg - L1) / RT;
		return [Math.cos(a), -Math.sin(a), 0];
	}
	if (sg <= SIG_34) return [0, -1, 0];
	return norm([driftAt(sg + 0.5) - driftAt(sg - 0.5), -1, 0]);
}
const upAt = (sg) => {
	const H = headingAt(sg);
	return [-H[1], H[0], 0];
};
const SIG_THROAT = SIG_V + (Y_V - THROAT_Y);
// The swim's arc length on the clock: from rest at life, gathering.
const SWIM = [
	[21.5, 0],
	[22.6, 25],
	[24.0, 130],
	[25.6, 300],
	[27.2, 500],
	[28.6, 700],
	[29.8, 900],
	[30.9, 1110],
	[31.6, 1261],
	[34.0, 1860]
];
function swimSigma(t) {
	if (t <= SWIM[0][0]) return 0;
	const n = SWIM.length;
	if (t >= SWIM[n - 1][0]) {
		const [ta, sa] = SWIM[n - 2];
		const [tb, sb] = SWIM[n - 1];
		return sb + ((sb - sa) / (tb - ta)) * (t - tb);
	}
	let i = 0;
	while (t > SWIM[i + 1][0]) i++;
	// Monotone cubic (Fritsch–Carlson) between the keys: at rest at the first.
	const m = (j) => {
		if (j === 0) return 0;
		if (j === n - 1) return (SWIM[j][1] - SWIM[j - 1][1]) / (SWIM[j][0] - SWIM[j - 1][0]);
		const d0 = (SWIM[j][1] - SWIM[j - 1][1]) / (SWIM[j][0] - SWIM[j - 1][0]);
		const d1 = (SWIM[j + 1][1] - SWIM[j][1]) / (SWIM[j + 1][0] - SWIM[j][0]);
		return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
	};
	const [t0, v0] = SWIM[i];
	const [t1, v1] = SWIM[i + 1];
	const H = t1 - t0;
	const x = (t - t0) / H;
	const x2 = x * x;
	const x3 = x2 * x;
	return (
		(2 * x3 - 3 * x2 + 1) * v0 +
		(x3 - 2 * x2 + x) * m(i) * H +
		(-2 * x3 + 3 * x2) * v1 +
		(x3 - x2) * m(i + 1) * H
	);
}
SIG_34 = swimSigma(B.interim);
const V_34 = (SWIM[SWIM.length - 1][1] - SWIM[SWIM.length - 2][1]) / 2.4;
const Y_34 = pathW(SIG_34)[1];
const MOUTH_Y = pathW(swimSigma(B.mouth[0] + 0.6))[1];

// ── The interim's clock: the years before the event, shrinking ───────────────
// D the swimmer's height above the event, D0 at 34 s (2026 there). Its
// e-fold rate ρ(t) starts at the tube's speed / D0, gathers to a steady rate,
// and eases to the fall's opening rate by 42 s; the steady rate is solved so
// that 42 s finds it DT_END years short of the event.
const DT_END = 0.2;
const RHO_S = V_34 / D0;
const rise = (t) => smooth(span(t, B.interim, 36.5));
const fallOff = (t) => smooth(span(t, 39.5, B.fall[0]));
const NI = 160;
const I_INT = (() => {
	let i1 = 0;
	let i2 = 0;
	let i3 = 0;
	const dt = (B.fall[0] - B.interim) / NI;
	for (let k = 0; k < NI; k++) {
		const t = B.interim + (k + 0.5) * dt;
		i1 += (1 - rise(t)) * dt;
		i2 += rise(t) * (1 - fallOff(t)) * dt;
		i3 += fallOff(t) * dt;
	}
	return [i1, i2, i3];
})();

const STARS = (() => {
	let s = 7919;
	const r = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = [];
	// ~120 on the board at once, most at the edge of seeing, a few brighter
	for (let i = 0; i < 1500; i++) {
		const z = 2 * r() - 1;
		const a = TAU * r();
		const q = Math.sqrt(1 - z * z);
		const m = r();
		out.push([q * Math.cos(a), z, q * Math.sin(a), 0.22 + 0.7 * m * m * m, m > 0.93 ? 1.6 : 1.2]);
	}
	return out;
})();

// Rigs { E, T, up } blended with the distance in log, so what the near one
// frames stays framed while the lens draws back (implicit.js's).
function blend(a, b, k) {
	if (k <= 0) return a;
	if (k >= 1) return b;
	const da = Math.hypot(...sub3(a.E, a.T));
	const db = Math.hypot(...sub3(b.E, b.T));
	const dir = norm(lerp3(norm(sub3(a.E, a.T)), norm(sub3(b.E, b.T)), k));
	const d = da * Math.pow(db / da, k);
	const kt = Math.abs(db - da) > 1e-6 ? (d - da) / (db - da) : k;
	const T = lerp3(a.T, b.T, kt);
	return { T, E: add3(T, mul3(dir, d)), up: norm(lerp3(a.up, b.up, k)) };
}

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	PROF.on = q.get('prof') === '1';
	const board = getBoard();
	const time = clock(SECONDS, at);
	const answers = makeAnswers({ live, beats: B });
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-wormhole · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(TECHF(24)).catch(() => null)
	]);
	const Z = makeDepth(4);

	// The person, once per answers; the fall, once per room.
	let person = null;
	const personFor = (date, spice) => {
		const key = `${date}|${Math.round(spice)}`;
		if (!person || person.key !== key) {
			const t0 = performance.now();
			person = { ...personOf(date, spice), key };
			if (PROF.on && window.__lab) window.__lab.personMs = performance.now() - t0;
		}
		return person;
	};
	const falls = new Map();
	const fallFor = (decade) => {
		let f = falls.get(decade);
		if (!f) {
			f = makeFall({
				art,
				order: orderOf(decade),
				beats: { fall: B.fall, land: B.land, colour: B.colour, swim: [-2, -1] },
				zeta0: -1.6
			});
			falls.set(decade, f);
		}
		return f;
	};
	const decadeNow = () => forced ?? decadeOfDate(answers.answers.date);

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: answers.answers,
		get decade() {
			return decadeNow();
		}
	};

	// ── Layout of the entry, cached per board size ───────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		const fq = Math.max(11, L.fs);
		ctx.save();
		ctx.font = TECHF(fq);
		const cell = ctx.measureText('0').width;
		const wQ1 = ctx.measureText(Q1_TEXT).width;
		const wQ2 = ctx.measureText(Q2_TEXT).width;
		ctx.restore();
		const cx = EPICYCLE.pivot[0] * w;
		const cy = EPICYCLE.pivot[1] * h;
		const yQ1 = 0.72 * h;
		const yF = yQ1 + 1.75 * fq;
		const yQ2 = yF + 2.1 * fq;
		const ty = yQ2 + 1.6 * fq;
		const sp = Math.max(2.3 * cell, Math.min(0.065 * w, 30));
		const unit = EPICYCLE.radius(w, h) / 2.6; // px to a head unit
		G = {
			w,
			h,
			L,
			stop: L.stop,
			fq,
			cell,
			cx,
			cy,
			unit,
			yQ1,
			xQ1: cx - wQ1 / 2,
			yF,
			xF: cx - 5 * cell,
			yQ2,
			xQ2: cx - wQ2 / 2,
			ty,
			sp,
			x1: cx - 4.5 * sp,
			x10: cx + 4.5 * sp,
			// the entry's tail runs from the head's back to here (px)
			tailEnd: Math.max(0.06 * w, cx - 0.44 * w)
		};
		return G;
	}

	let frozen = null;
	function frozenFrame(w, h) {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	// ── Live: when each digit came and went (hand.secs) ──────────────────────
	const blank = () => ({ d: null, at: -99, old: null, gone: -99, g0: 0 });
	let slots = Array.from({ length: 8 }, blank);
	const grownAt = (s, secs) => smooth(span(secs - s.at, 0, GROW));
	function remember(hand, t) {
		if (t < Q1 - 0.05) {
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
	function digitArms(t, hand) {
		const out = [];
		for (let i = 0; i < 8; i++) {
			if (!live) {
				const ch = hand.typed[i];
				out.push(
					ch === undefined
						? { d: 0, g: 0 }
						: {
								d: Number(ch),
								g: smooth(span(t - KEYT[i], 0, GROW)),
								ring: ringOf(t - KEYT[i])
							}
				);
				continue;
			}
			const s = slots[i];
			if (s.d !== null)
				out.push({ d: s.d, g: grownAt(s, hand.secs), ring: ringOf(hand.secs - s.at) });
			else if (s.old !== null)
				out.push({ d: s.old, g: s.g0 * (1 - smooth(span(hand.secs - s.gone, 0, SHRINK))) });
			else out.push({ d: 0, g: 0 });
		}
		return out;
	}

	// ── The slider's pointer ─────────────────────────────────────────────────
	let SL = null;
	const valueAt = (X) => Math.max(1, Math.min(10, 1 + (9 * (X - SL.x1)) / (SL.x10 - SL.x1)));
	const onSlider = (X, Y) =>
		SL &&
		SL.a > 0.3 &&
		X >= SL.x1 - SL.sp / 2 &&
		X <= SL.x10 + SL.sp / 2 &&
		Math.abs(Y - SL.ty) <= 18;
	const hit = (X, Y, phase) => {
		if (!SL) return null;
		if (phase === 'down' && !onSlider(X, Y)) return null;
		return valueAt(X);
	};
	let hover = null;
	let cursor = '';
	if (live)
		window.addEventListener('pointermove', (e) => {
			hover = [e.clientX, e.clientY];
		});
	function setCursor(c) {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	}

	// ── Type ─────────────────────────────────────────────────────────────────
	function text(ctx, str, x, y, size, alpha, color = PAL.chalk, align = 'left') {
		if (!str || alpha <= 0.004) return;
		ctx.save();
		ctx.font = TECHF(size);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.textBaseline = 'alphabetic';
		ctx.fillText(str, x, y);
		ctx.restore();
	}
	function block(ctx, g, x, y, alpha) {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.globalAlpha = 0.9 * alpha;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(x, y - 0.78 * g.fq, g.cell, 0.92 * g.fq);
		ctx.restore();
	}
	function ask(ctx, g, str, K, t0, t, x, y, alpha) {
		if (t < t0) return;
		const n = typedBy(K, t - t0);
		text(ctx, str.slice(0, n), x, y, g.fq, 0.9 * alpha);
		if (n < str.length) {
			ctx.save();
			ctx.font = TECHF(g.fq);
			const xw = ctx.measureText(str.slice(0, n)).width;
			ctx.restore();
			const last = n > 0 ? t0 + K[n - 1] : t0;
			if (blinkOn(t, t - last < 0.16)) block(ctx, g, x + xw, y, alpha);
		}
	}
	function title(ctx, g, t) {
		const { L, stop, w, h } = g;
		const img = frozenFrame(w, h);
		const ys = L.out.map((ln) => ln.y - 0.3 * L.fs);
		const cut = [-1e4, (ys[0] + ys[1]) / 2, (ys[1] + ys[2]) / 2, 1e4];
		for (let i = 0; i < 3; i++) {
			const a = 1 - smooth(span(t, B.gone + 0.25 * i, B.gone + 0.5 + 0.25 * i));
			if (a <= 0.004) continue;
			ctx.save();
			ctx.beginPath();
			ctx.rect(-1, cut[i], w + 2, cut[i + 1] - cut[i]);
			if (i === 2) {
				ctx.moveTo(stop.x + stop.r + 1.5, stop.y);
				ctx.arc(stop.x, stop.y, stop.r + 1.5, 0, TAU);
			}
			ctx.clip('evenodd');
			ctx.globalAlpha = a;
			ctx.drawImage(img, 0, 0, w, h);
			ctx.restore();
		}
	}
	function field(ctx, g, t, hand, out) {
		const fa = out * smooth(span(t, ...B.field));
		if (fa <= 0.004) return;
		const typed = hand.typed;
		const bad = badGroups(typed);
		const after = lerp(1, 0.8, smooth(span(t, E1 + 0.3, E1 + 1)));
		const qDone = t >= Q1 + K1[K1.length - 1] || typed.length > 0;
		const caretOn =
			hand.caret > 0 && hand.enter1 <= 0 && qDone && blinkOn(hand.secs, hand.steady > 0);
		const cc = typed.length < 8 ? DIGIT_CELL[typed.length] : 10;
		ctx.save();
		ctx.font = TECHF(g.fq);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		for (let j = 0; j < 10; j++) {
			const x = g.xF + (j + 0.5) * g.cell;
			const i = DIGIT_CELL.indexOf(j);
			const under = caretOn && j === cc;
			if (under) {
				ctx.globalAlpha = 0.9 * fa;
				ctx.fillStyle = PAL.chalk;
				ctx.fillRect(g.xF + j * g.cell, g.yF - 0.78 * g.fq, g.cell, 0.92 * g.fq);
			}
			let ch = MASK[j];
			let a = i < 0 ? 0.32 : 0.22;
			let color = PAL.chalk;
			if (i >= 0 && typed[i] !== undefined) {
				ch = typed[i];
				a = 0.92 * after;
				if (bad[GROUP_OF[i]]) color = PAL.rose;
			}
			ctx.globalAlpha = (under ? 0.9 : a) * fa;
			ctx.fillStyle = under ? PAL.ground : color;
			ctx.fillText(ch, x, g.yF);
		}
		ctx.restore();
		if (caretOn && cc === 10) block(ctx, g, g.xF + 10 * g.cell, g.yF, fa);
	}
	function slider(ctx, g, t, hand, out) {
		const sA = smooth(span(t, ...B.slider));
		SL = null;
		if (sA <= 0.004 || out <= 0.004) return;
		const { x1, x10, ty, sp, fq, cell } = g;
		const after = lerp(1, 0.7, smooth(span(t, E2 + 0.4, E2 + 1.2)));
		const a = out * after;
		const v = hand.value;
		const near = Math.round(v);
		const held = hand.held > 0;
		stroke(
			ctx,
			[
				[x1, ty],
				[x10, ty]
			],
			{ width: 1, alpha: 0.38 * a, upto: sA, cap: 'butt' }
		);
		for (let k = 1; k <= 10; k++) {
			const tk = smooth(span(sA, 0.1 * (k - 1), 0.1 * (k - 1) + 0.3));
			if (tk <= 0) continue;
			const x = x1 + (k - 1) * sp;
			const here = k === near;
			const hh = (here ? 0.32 : 0.2) * fq;
			stroke(
				ctx,
				[
					[x, ty - hh],
					[x, ty + hh]
				],
				{ width: 1, alpha: tk * a * (here ? 0.6 : 0.3), cap: 'butt' }
			);
		}
		const hx = x1 + ((v - 1) / 9) * (x10 - x1);
		const hw = Math.max(3, 0.34 * cell);
		const hh = (held ? 1.1 : 1) * fq;
		const ha = smooth(span(sA, 0.35, 0.8));
		ctx.save();
		ctx.globalAlpha = ha * a * (held ? 0.98 : 0.88);
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - hw / 2, ty - hh / 2, hw, hh);
		ctx.restore();
		text(ctx, String(near), x10 + 0.9 * sp, ty + 0.36 * fq, fq, 0.92 * ha * a);
		SL = { x1, x10, ty, sp, a: out * sA };
	}

	// ── The figure: the head's outline drawn by its chain of arms ───────────
	// `toS(X, Y)` maps the head's plan (head units, X to the nose, Y across,
	// up on the board) to the board: the 2D figure in the entry, the plane
	// y = 0 through the lens in the compile (the same picture at 15 s).
	function figure(ctx, toS, t, hand, P, o) {
		const { out = 1, fold = 0, arms: armsOn = true } = o;
		const base = smooth(span(t, ...B.base));
		if (base <= 0.001) return;
		const dg = P ? null : digitArms(t, hand);
		const A = P ? P.arms : armsOf(base, dg);
		const N = 480;
		const pts = [];
		for (let i = 0; i <= N; i++) {
			const ph = (TAU * i) / N;
			const s = toS(...curveAt(A, ph));
			if (s) pts.push(s);
		}
		const ink = makeInk();
		const pl = (Q, alpha, width, color = PAL.chalk) => {
			for (let i = 1; i < Q.length; i++)
				ink.seg(color, alpha, width, Q[i - 1][0], Q[i - 1][1], Q[i][0], Q[i][1]);
		};
		pl(pts, 0.5 * out * o.outline, 1.15);
		// The digits' rings, in gold over the outline.
		const rg = dg ? ringingOf(A, dg) : null;
		if (rg) {
			const Q = [];
			for (let i = 0; i <= N; i += 2) {
				const s = toS(...curveAt(rg.arms, (TAU * i) / N));
				if (s) Q.push(s);
			}
			pl(Q, 0.55 * out * Math.min(1, 1.6 * rg.strength), 1.1, PAL.gold);
		}
		const secs = live ? hand.secs : t;
		const th = TAU * ((((secs / PERIOD) % 1) + 1) % 1);
		// The pen's trail: the last stretch of the turn, brighter behind it.
		if (armsOn) {
			const M = 70;
			for (let i = 0; i < M; i++) {
				const p0 = toS(...curveAt(A, th - (0.9 * (i + 1)) / M));
				const p1 = toS(...curveAt(A, th - (0.9 * i) / M));
				if (p0 && p1)
					ink.seg(PAL.chalk, 0.5 * out * (1 - i / M) * (1 - fold), 1.4, p0[0], p0[1], p1[0], p1[1]);
			}
		}
		// The gold traces on each Enter (the second runs on down the tail).
		const trace = (t0, withTail) => {
			if (t < t0 || t > t0 + B.trace + 1.4) return;
			const x = (t - t0) / B.trace;
			const head = Math.min(N, Math.floor(N * clamp01(x)));
			for (let i0 = 0; i0 < head; i0 += 4) {
				const i1 = Math.min(head, i0 + 4);
				const tp = t0 + (B.trace * (i0 + i1)) / 2 / N;
				const a = 0.85 * Math.exp(-Math.max(0, t - tp) / 0.25);
				if (a < 0.01 || i1 >= pts.length) continue;
				pl(pts.slice(i0, i1 + 1), a * out, 1.4, PAL.gold);
			}
			if (x > 0 && x < 1 && pts[head])
				disc(ctx, pts[head][0], pts[head][1], 2, { fill: PAL.gold, alpha: 0.9 * out });
			if (withTail) tailTrace = { t0: t0 + B.trace * 0.5, a: out };
		};
		let tailTrace = null;
		trace(E1, false);
		trace(E2, true);
		ink.flush(ctx);
		// The arms, from the stop, at f_k θ; folding home the last first.
		if (armsOn) {
			let X = 0;
			let Y = 0;
			let reach = 0;
			const L = A.length;
			for (let k = 0; k < L; k++) {
				const f0 = B.fold[0] + 0.07 * (L - 1 - k);
				const rk = A[k].r * (1 - smooth(span(t, f0, f0 + 0.4)));
				if (Math.abs(rk) < 1e-3) continue;
				const ang = A[k].f * th;
				const nX = X + rk * Math.cos(ang);
				const nY = Y + rk * Math.sin(ang);
				const ring = [];
				for (let i = 0; i <= 64; i++) {
					const s = toS(
						X + Math.abs(rk) * Math.cos((TAU * i) / 64),
						Y + Math.abs(rk) * Math.sin((TAU * i) / 64)
					);
					if (s) ring.push(s);
				}
				stroke(ctx, ring, { width: 1, alpha: 0.08 * out });
				const a0 = toS(X, Y);
				const a1 = toS(nX, nY);
				if (a0 && a1) stroke(ctx, [a0, a1], { width: 1, alpha: 0.3 * out });
				X = nX;
				Y = nY;
				reach += Math.abs(rk);
			}
			const pen = toS(X, Y);
			if (pen && reach > 0.05)
				disc(ctx, pen[0], pen[1], 2.1, { fill: PAL.gold, alpha: 0.62 * out });
		}
		return { A, tailTrace };
	}

	// The entry's tail: from the outline's back, n half-waves along it (n the
	// handle), written out as the slider comes up. In plan coordinates, so
	// the compile can carry it on into the body's tail.
	function tailPlan(A, len, n, secs, grow) {
		// the back: the outline's leftmost point
		let back = curveAt(A, Math.PI);
		for (let i = -12; i <= 12; i++) {
			const p = curveAt(A, Math.PI + i * 0.02);
			if (p[0] < back[0]) back = p;
		}
		const pts = [];
		const M = 140;
		const amp = 0.3;
		for (let i = 0; i <= M; i++) {
			const q = (i / M) * grow;
			const env = amp * (0.15 + 0.85 * q) * smooth(span(q, 0, 0.12));
			pts.push([back[0] - q * len, back[1] + env * Math.sin(n * Math.PI * q - TAU * 0.35 * secs)]);
		}
		return pts;
	}

	// ── THE ENTRY ────────────────────────────────────────────────────────────
	function entry(ctx, w, h, t, hand) {
		const g = geom(ctx, w, h);
		const pan = easeIO(span(t, ...B.pan));
		const X0 = g.stop.x + pan * (g.cx - g.stop.x);
		const Y0 = g.stop.y + pan * (g.cy - g.stop.y);
		title(ctx, g, t);
		if (live) remember(hand, t);
		const toS = (X, Y) => [X0 + g.unit * X, Y0 - g.unit * Y];
		const out = 1;
		if (t >= Q1) {
			const f = figure(ctx, toS, t, hand, null, { out, outline: 1 });
			const A = f?.A;
			// The tail, from the back, as the slider comes up.
			const grow = smooth(span(t, ...B.tail));
			if (A && grow > 0) {
				const secs = live ? hand.secs : t;
				const len = (X0 + g.unit * curveAt(A, Math.PI)[0] - g.tailEnd) / g.unit;
				const T = tailPlan(A, len, hand.value, secs, grow).map(([X, Y]) => toS(X, Y));
				stroke(ctx, T, { width: 1.1, alpha: 0.32 });
				tailGold(ctx, T, t, f.tailTrace);
			}
		}
		// The stop: a full chalk dot, the pivot.
		disc(ctx, X0, Y0, g.stop.r, { fill: PAL.chalk, alpha: 0.95 });
		// What the answers make, made as each is entered (during its gold
		// trace), not on the compile's first frame.
		if (t >= E1 + 0.05) headOf(answers.answers.date);
		if (t >= E2 + 0.05) personFor(answers.answers.date, answers.answers.spice);
		const q1a = lerp(1, 0.55, smooth(span(t, E1 + 0.3, E1 + 1)));
		ask(ctx, g, Q1_TEXT, K1, Q1, t, g.xQ1, g.yQ1, q1a);
		field(ctx, g, t, hand, 1);
		const q2a = lerp(1, 0.55, smooth(span(t, E2 + 0.3, E2 + 1)));
		ask(ctx, g, Q2_TEXT, K2, Q2, t, g.xQ2, g.yQ2, q2a);
		slider(ctx, g, t, hand, 1);
		if (live) {
			let cur = '';
			if (hand.asking === 'spice' && SL) {
				if (hand.held) cur = 'grabbing';
				else if (hover && onSlider(hover[0], hover[1])) cur = 'grab';
			}
			setCursor(cur);
		}
	}
	// The second Enter's gold runs on down the tail.
	function tailGold(ctx, T, t, tr) {
		if (!tr || t < tr.t0) return;
		const x = (t - tr.t0) / 0.8;
		const N = T.length - 1;
		const head = Math.min(N, Math.floor(N * clamp01(x)));
		for (let i0 = 0; i0 < head; i0 += 4) {
			const i1 = Math.min(head, i0 + 4);
			const tp = tr.t0 + (0.8 * (i0 + i1)) / 2 / N;
			const a = 0.8 * Math.exp(-Math.max(0, t - tp) / 0.25);
			if (a < 0.01) continue;
			stroke(ctx, T.slice(i0, i1 + 1), {
				color: PAL.gold,
				width: 1.3,
				alpha: a * tr.a,
				cap: 'butt'
			});
		}
	}

	// ── The swimmer's clocks ─────────────────────────────────────────────────
	const shapeAt = (P, t) =>
		P.body.shape(t, {
			beat: smooth(span(t, B.life, B.life + 1.2)),
			phase: TAU * P.spec.beat.hz * eased(t - B.life, 0.8) + P.spec.beat.phase,
			roll: TAU * P.spec.roll * eased(t - B.life - 0.15, 1.4)
		});

	// The interim's descent: D(t), the swimmer's height over the event.
	let dCache = { t: NaN, key: '', D: D0 };
	function heightAt(t, rate0) {
		if (t <= B.interim) return D0;
		const key = `${rate0}|${person.key}`;
		if (dCache.t === t && dCache.key === key) return dCache.D;
		const P = person;
		const dt0 = Math.max(4, P.TTOP - P.TE);
		const Ne = Math.log(dt0 / DT_END);
		const rMax = (Ne - RHO_S * I_INT[0] - rate0 * I_INT[2]) / I_INT[1];
		const t1 = Math.min(t, B.fall[0]);
		const steps = Math.max(8, Math.ceil(((t1 - B.interim) / (B.fall[0] - B.interim)) * NI));
		const dt = (t1 - B.interim) / steps;
		let e = 0;
		for (let k = 0; k < steps; k++) {
			const tt = B.interim + (k + 0.5) * dt;
			const r = rise(tt);
			const f = fallOff(tt);
			e += (RHO_S * (1 - r) + rMax * r * (1 - f) + rate0 * f) * dt;
		}
		let D = D0 * Math.exp(-e);
		if (t > B.fall[0]) D *= Math.exp(-(t - B.fall[0]) * rate0); // overwritten by the fall's e-folds
		dCache = { t, key, D };
		return D;
	}
	const yearsPer = (P) => D0 / Math.max(4, P.TTOP - P.TE); // world units a year
	const eventY = () => Y_34 - D0;

	// The swimmer's nose, pose and scale at t (from the compile on).
	function swimmerAt(P, t, rate0, Dfall = null) {
		let sg;
		let sc = 1;
		if (t <= B.interim) sg = swimSigma(t);
		else {
			const D = Dfall ?? heightAt(t, rate0);
			sg = SIG_34 + (D0 - D);
			sc = Math.min(1, D / D_REF);
		}
		return {
			sigma: sg,
			scale: sc,
			nose: pathW(sg),
			H: headingAt(sg),
			U: upAt(sg),
			pose: { path: pathW, sigma: sg, up: upAt, scale: sc }
		};
	}

	// ── The lens ─────────────────────────────────────────────────────────────
	function lensOf(rig, w, h) {
		const cam = camera3({ pos: rig.E, target: rig.T, up: rig.up, fov: FOV, w, h });
		cam.k = h / 2 / Math.tan((FOV * Math.PI) / 360);
		return cam;
	}
	// The compile's opening rig: square over the broad face, the head's centre
	// at the pivot, a head unit as many px as the entry's figure.
	function rigTop(P, w, h) {
		const g = G;
		const k = h / 2 / Math.tan((FOV * Math.PI) / 360);
		const D = k / g.unit;
		const Cw = [A0[0] - P.Xn, A0[1], 0];
		const d = (0.5 * h - g.cy) / g.unit;
		const T = [Cw[0] + (g.cx - 0.5 * w) / -g.unit, Cw[1], Cw[2] + d];
		return { T, E: add3(T, [0, D, 0]), up: [0, 0, -1] };
	}
	const headC = (P) => [A0[0] - P.Xn, A0[1], 0];
	function rigSlices(P) {
		const T = add3(headC(P), [0.3, 0, 0]);
		return { T, E: add3(T, mul3(norm([0.5, 1.0, 1.25]), 13.5)), up: UP };
	}
	function rigWhole() {
		const T = add3(A0, [-25, 0, 0]);
		return { T, E: add3(T, mul3(norm([0.32, 0.8, 1.1]), 54)), up: UP };
	}
	// Behind and above the swimmer, a little to the side, looking ahead and
	// down; the offsets close in down the tube (the lens stays inside it).
	function rigSwim(S) {
		const { nose, H, U, scale: sc } = S;
		const side = cross(H, U);
		const inTube = smooth(span(S.sigma, SIG_V + 100, SIG_THROAT));
		const flat = clamp01(U[1]);
		// over the disc the lens rises and looks down into it as it sinks
		const look =
			smooth(span(S.sigma, 120, 470)) * (1 - smooth(span(S.sigma, SIG_V + 60, SIG_V + 330)));
		const dB = 78 * sc;
		const dU = lerp(34, 13, inTube) * sc;
		const dS = lerp(26, 9, inTube) * sc;
		const E = add3(add3(add3(add3(nose, mul3(H, -dB)), mul3(U, dU)), mul3(side, dS)), [
			0,
			70 * look * sc,
			0
		]);
		const T0 = add3(add3(nose, mul3(H, 150 * sc)), mul3(U, -60 * flat * sc));
		const T = lerp3(T0, [0, -170, 0], 0.85 * look);
		return { E, T, up: U };
	}
	// Out of the throat the lens swings round the swimmer itself — it stays
	// framed, side-on, at the middle of the board — to the side the diagram
	// is read from (the same direction as rigSide: what follows is then only
	// a pull back, the target sliding from the swimmer down to the event, and
	// nothing swings across the lens at arm's length).
	function rigChase(S) {
		const sc = S.scale;
		const T = add3(S.nose, mul3(S.H, -18 * sc));
		return { T, E: add3(T, mul3(SIDE, 150 * sc)), up: UP };
	}
	// The diagram from the side: time up the board, framing the swimmer down
	// to the event and a little of the past under it. From −x (a little round
	// toward +z): the tube's lens (looking down, its top +x) PITCHES up to it,
	// and pitches on down again to the view down the axis — no roll either way.
	function rigSide(S, D) {
		const E0 = [0, eventY(), 0];
		const T = add3(E0, [0, 0.42 * D - 20, 0]);
		const dist = (1.2 * D + 140) / (2 * Math.tan((FOV * Math.PI) / 360));
		return { T, E: add3(T, mul3(SIDE, dist)), up: UP };
	}
	// Above the swimmer ON the time axis, looking straight down it at the
	// event: the event at the centre, the cone's rings round it, the swimmer's
	// head on the event, its tail trailing down the board (it meets the axis
	// leaning). Self-similar: every offset in proportion to the height, so
	// the zoom into the event runs on into the fall.
	function rigZoomD(D) {
		const yE = eventY();
		return { E: [0, yE + D + LENS_H * Math.min(1, D / D_REF), 0], T: [0, yE, 0], up: TOP_UP };
	}
	const rigZoom = (S) => rigZoomD(S.nose[1] - eventY());
	// A rig scaled about the event.
	const scaleRig = (rig, k) => {
		const ev = [0, eventY(), 0];
		const at = (p) => add3(ev, mul3(sub3(p, ev), k));
		return { E: at(rig.E), T: at(rig.T), up: rig.up };
	};
	function rigAt(P, t, w, h, S, rate0) {
		let rig = rigTop(P, w, h);
		rig = blend(rig, rigSlices(P), smooth(span(t, ...B.tilt)));
		rig = blend(rig, rigWhole(), smooth(span(t, ...B.pull)));
		if (t > B.behind[0]) rig = blend(rig, rigSwim(S), smooth(span(t, ...B.behind)));
		if (t > B.chase[0]) {
			// (not blend(): the target goes onto the swimmer FIRST, and only
			// then does the lens swing round — so the swimmer, between the
			// lens and the tube's far target, is not swung off the board)
			const k = smooth(span(t, ...B.chase));
			const b = rigChase(S);
			const da = Math.hypot(...sub3(rig.E, rig.T));
			const db = Math.hypot(...sub3(b.E, b.T));
			const T = lerp3(rig.T, b.T, smooth(clamp01(1.8 * k)));
			const dir = norm(lerp3(norm(sub3(rig.E, rig.T)), norm(sub3(b.E, b.T)), k));
			rig = {
				T,
				E: add3(T, mul3(dir, da * Math.pow(db / da, k))),
				up: norm(lerp3(rig.up, b.up, k))
			};
		}
		if (t > B.side[0]) {
			const D = heightAt(t, rate0);
			rig = blend(rig, rigSide(S, D), smooth(span(t, ...B.side)));
		}
		if (t > B.zoom[0]) rig = blend(rig, rigZoom(S), smooth(span(t, ...B.zoom)));
		return rig;
	}

	// ── Stars, faint, at infinity ────────────────────────────────────────────
	function stars(ctx, cam, w, h, alpha) {
		if (alpha <= 0.01) return;
		const { f, r, u, k } = cam;
		ctx.save();
		ctx.fillStyle = PAL.chalk;
		for (const s of STARS) {
			const z = s[0] * f[0] + s[1] * f[1] + s[2] * f[2];
			if (z < 0.05) continue;
			const x = w / 2 + (k * (s[0] * r[0] + s[1] * r[1] + s[2] * r[2])) / z;
			const y = h / 2 - (k * (s[0] * u[0] + s[1] * u[1] + s[2] * u[2])) / z;
			if (x < 0 || y < 0 || x > w || y > h) continue;
			ctx.globalAlpha = alpha * s[3];
			ctx.fillRect(x, y, s[4], s[4]);
		}
		ctx.restore();
	}

	// ── COMPILE ──────────────────────────────────────────────────────────────
	function compile(ctx, w, h, t, hand, P, cam, shape, S) {
		const g = G;
		const ink = makeInk();
		const Cw = headC(P);
		const W3 = (X, y, Y) => [Cw[0] + X, Cw[1] + y, Cw[2] - Y];
		const toS = (X, Y) => {
			const q = cam.project(W3(X, 0, Y));
			return q[2] > NEAR ? q : null;
		};
		// The body's skin, for the slices' hidden halves.
		Z.reset(w, h);
		P.body.fillDepth(Z, cam, shape, S.pose);
		const hid = (q) => Z.hidden(q);

		// The figure, the arms folding home; the outline stays till the slices.
		const outlineA = 1 - smooth(span(t, 18.0, 18.8));
		if (t < B.fold[1] + 0.3 || outlineA > 0)
			figure(ctx, toS, t, hand, P, {
				out: 1,
				outline: outlineA,
				fold: smooth(span(t, ...B.fold)),
				arms: t < B.fold[1] + 0.2
			});

		// The tail: the entry's wave, then straightened into the body's tail.
		const st = smooth(span(t, ...B.straighten));
		const tailA = 0.32 * (1 - smooth(span(t, 19.6, 20.4)));
		if (tailA > 0.01) {
			const len = (g.cx + g.unit * curveAt(P.arms, Math.PI)[0] - g.tailEnd) / g.unit;
			const secs = live ? hand.secs : t;
			const T = tailPlan(P.arms, len, P.spice, secs, 1);
			const sBack = P.Lh;
			const LEN = P.body.length;
			const pts = T.map(([X, Y], i) => {
				const q = i / (T.length - 1);
				const a = W3(X, 0, Y);
				const b = [A0[0] - sBack - q * (LEN - sBack), A0[1], 0];
				return lerp3(a, b, st);
			});
			line3d(ink, cam, pts, { alpha: tailA, width: 1.1 });
			if (t < E2 + 3) {
				const Q = pts.map((p) => cam.project(p));
				tailGold(ctx, Q, t, { t0: E2 + B.trace * 0.5, a: 1 });
			}
			// The chain: the balls' centres down the straightened tail.
			const ch = smooth(span(t, B.straighten[1] - 0.2, B.rings[0] + 0.4));
			if (ch > 0)
				for (let s = sBack + 1.5; s < LEN - 0.5; s += 1.6) {
					const q = cam.project([A0[0] - s, A0[1], 0]);
					if (q[2] > NEAR)
						disc(ctx, q[0], q[1], 1.3, {
							fill: PAL.chalk,
							alpha: 0.5 * ch * (1 - smooth(span(t, 19.8, 20.6)))
						});
				}
		}

		// The medial axis and the balls on it.
		const axA = smooth(span(t, ...B.axis)) * (1 - smooth(span(t, 17.8, 18.8)));
		if (axA > 0.01) {
			const half = P.medial.filter((m) => m.j <= NOUT / 2);
			let run = [];
			const runs = [];
			for (const m of half) {
				const p = W3(m.c[0], 0, m.c[1]);
				if (
					run.length &&
					Math.hypot(m.c[0] - run[run.length - 1].c[0], m.c[1] - run[run.length - 1].c[1]) > 0.3
				) {
					runs.push(run);
					run = [];
				}
				run.push({ c: m.c, p });
			}
			if (run.length) runs.push(run);
			const w0 = span(t, ...B.axis);
			for (const R of runs)
				line3d(
					ink,
					cam,
					R.map((x) => x.p),
					{ alpha: 0.75 * axA, width: 1.3, upto: w0 }
				);
		}
		const ballA = smooth(span(t, ...B.balls)) * (1 - smooth(span(t, 17.4, 18.4)));
		if (ballA > 0.01) {
			const list = P.balls.filter((b) => b.j % 6 === 0);
			list.forEach((b, i) => {
				const t0 = B.balls[0] + (i / list.length) * (B.balls[1] - B.balls[0] - 0.3);
				const p = smooth(span(t, t0, t0 + 0.3));
				if (p <= 0) return;
				const ring = [];
				for (let k = 0; k <= 48; k++) {
					const a = Math.PI / 2 + (TAU * k) / 48;
					ring.push(W3(b.c[0] + b.r * Math.cos(a), 0, b.c[1] + b.r * Math.sin(a)));
				}
				line3d(ink, cam, ring, { alpha: 0.3 * ballA, width: 0.9, upto: p });
				const q = cam.project(W3(b.c[0], 0, b.c[1]));
				if (q[2] > NEAR) disc(ctx, q[0], q[1], 1.4, { fill: PAL.chalk, alpha: 0.6 * ballA * p });
			});
		}

		// The cutting plane, parallel to the broad face, and the slices it leaves.
		const sw = span(t, ...B.slices);
		const sliceA = 1 - smooth(span(t, 20.1, 21.0));
		if (t >= B.slices[0] && sliceA > 0.01) {
			const yPlane = P.HT * 1.1 * (1 - 2 * sw);
			const planeA = Math.sin(Math.PI * sw) * 0.55;
			if (planeA > 0.01) {
				const x0 = P.Xb - 0.6;
				const x1 = P.Xn + 0.6;
				const yw = P.Wm + 0.6;
				const fr = [
					W3(x0, yPlane, -yw),
					W3(x1, yPlane, -yw),
					W3(x1, yPlane, yw),
					W3(x0, yPlane, yw),
					W3(x0, yPlane, -yw)
				];
				line3d(ink, cam, fr, { alpha: 0.5 * planeA, width: 1 });
				for (let k = 1; k < 8; k++) {
					const X = lerp(x0, x1, k / 8);
					line3d(ink, cam, [W3(X, yPlane, -yw), W3(X, yPlane, yw)], {
						alpha: 0.12 * planeA,
						width: 0.8
					});
				}
				for (let k = 1; k < 5; k++) {
					const Y = lerp(-yw, yw, k / 5);
					line3d(ink, cam, [W3(x0, yPlane, Y), W3(x1, yPlane, Y)], {
						alpha: 0.12 * planeA,
						width: 0.8
					});
				}
			}
			for (const sl of P.slices) {
				const k = (P.HT * 1.1 - sl.y) / (2.2 * P.HT); // when the plane passes it
				const t0 = lerp(B.slices[0], B.slices[1], k);
				const p = smooth(span(t, t0, t0 + 0.4));
				if (p <= 0) continue;
				for (const L of sl.loops) {
					const pts = L.map(([X, Y]) => W3(X, sl.y, Y));
					line3d(ink, cam, pts, {
						alpha: (sl.mid ? 0.85 : 0.55) * sliceA,
						width: sl.mid ? 1.5 : 1.05,
						upto: p,
						hidden: hid,
						back: 0.25
					});
				}
			}
		}
		ink.flush(ctx);

		// The neck, the midpiece and the tail: the plane turns square to the
		// axis and their rings are written; then the body over everything.
		const NR = P.body.rings.length;
		const hf = P.nHead / NR;
		const rw = span(t, ...B.rings);
		const bodyOn = smooth(span(t, ...B.body));
		if (t >= B.rings[0] && t < B.body[1]) {
			const opts = {
				rings: t < B.body[0] ? lerp(hf, 1, rw) : 1,
				ringFrom: t < B.body[0] ? hf : lerp(hf, 0, smooth(span(t, B.body[0], B.body[0] + 0.6))),
				gens: (j) => smooth(span(t, B.body[0] + 0.3 + j * 0.035, B.body[0] + 0.9 + j * 0.035)),
				contour: smooth(span(t, B.body[0] + 0.7, B.body[1])),
				axis: 0.5 * (1 - bodyOn),
				back: 0.16
			};
			P.body.draw(ctx, cam, shape, S.pose, opts);
			// the tail's cutting plane, square to the axis, running down it
			if (rw > 0 && rw < 1) {
				const s = lerp(P.Lh + 0.5, P.body.length, rw);
				const c = [A0[0] - s, A0[1], 0];
				const e = 1.6;
				const fr = [
					add3(c, [0, -e, -e]),
					add3(c, [0, e, -e]),
					add3(c, [0, e, e]),
					add3(c, [0, -e, e]),
					add3(c, [0, -e, -e])
				];
				const ink2 = makeInk();
				line3d(ink2, cam, fr, { alpha: 0.4, width: 1 });
				ink2.flush(ctx);
			}
		}
		// The pivot fades as the axis comes.
		const pv = 1 - smooth(span(t, 15.3, 15.9));
		if (pv > 0.01) {
			const q = cam.project(Cw);
			disc(ctx, q[0], q[1], g.stop.r, { fill: PAL.chalk, alpha: 0.95 * pv });
		}
		// The questions fade off.
		const out = 1 - smooth(span(t, ...B.fold));
		if (out > 0.01) {
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.xQ1, g.yQ1, 0.55 * out);
			field(ctx, g, t, hand, out);
			const q2a = lerp(1, 0.55, smooth(span(t, E2 + 0.3, E2 + 1)));
			ask(ctx, g, Q2_TEXT, K2, Q2, t, g.xQ2, g.yQ2, q2a * out);
			slider(ctx, g, t, hand, out);
		}
	}

	// ── The sheet, the disc on it, the tube ─────────────────────────────────
	const NSEED = 700;
	const SEEDS = phylloSeeds({ n: NSEED, R: R_ISO });
	const SP8 = [];
	const SP13 = [];
	for (let j = 0; j < 8; j++) SP8.push(parastichy(8, j, { R: R_ISO, n: NSEED, per: 6 }));
	for (let j = 0; j < 13; j++) SP13.push(parastichy(13, j, { R: R_ISO, n: NSEED, per: 4 }));
	const NT = Math.log((4 * R_ISO) / RS_MAX) / (Math.log(PHYLLO.phi) / PHYLLO.k); // the throat's seed
	// how far below the throat seed n sits on the full sheet's tube
	const seedDepth = (n) => (n - NT) * RS_MAX * (Math.log(PHYLLO.phi) / PHYLLO.k);
	const tubeEnd = Math.ceil(
		NT + (THROAT_Y - MOUTH_Y) / (RS_MAX * (Math.log(PHYLLO.phi) / PHYLLO.k))
	);

	function sheet(ctx, w, h, t, cam, alpha) {
		const rs = RS_MAX * smooth(span(t, ...B.sink));
		const lensY = cam.pos[1];
		const gInk = makeInk('grid');
		const ink = makeInk('seeds');
		const pInk = makeInk('spirals');
		const fog = (q) => 1 - smooth(span(q[2], 800, 2300));
		// The grid: radial lines and circles of the sheet itself, out to the
		// horizon, written out from the disc's rim.
		const gw = smooth(span(t, ...B.grid));
		const tg = PROF.on ? performance.now() : 0;
		if (gw > 0) {
			const rr = rimOf(rs);
			const NRAD = 20;
			for (let k = 0; k < NRAD; k++) {
				const th = (TAU * k) / NRAD + 0.06;
				const pts = [];
				for (let i = 0; i <= 30; i++) pts.push(gridAt(th, rr * Math.pow(R_FAR / rr, i / 30), rs));
				line3d(gInk, cam, pts, { alpha: 0.2 * alpha, width: 0.9, upto: gw, fade: fog, near: 70 });
			}
			for (let j = 1; j < 10; j++) {
				const r = rr * Math.pow(1.38, j);
				if (r > R_FAR) break;
				const cw = smooth(span(gw, 0.05 * j, 0.05 * j + 0.4));
				if (cw <= 0) continue;
				const pts = [];
				for (let i = 0; i <= 120; i++) pts.push(gridAt((TAU * i) / 120, r, rs));
				line3d(gInk, cam, pts, { alpha: 0.17 * alpha, width: 0.9, upto: cw, fade: fog, near: 70 });
			}
		}
		if (PROF.on) PROF.acc.grid = (PROF.acc.grid ?? 0) + performance.now() - tg;
		const ts = PROF.on ? performance.now() : 0;
		// The rim.
		const rimW = smooth(span(t, B.seed[0] - 0.4, B.seed[0] + 0.3));
		if (rimW > 0) {
			const pts = [];
			for (let i = 0; i <= 160; i++) pts.push(sheetAt((TAU * i) / 160, R_ISO, rs));
			line3d(gInk, cam, pts, { alpha: 0.5 * alpha, width: 1.1, upto: rimW, fade: fog, near: 90 });
		}
		// The disc: seeds rim to centre at the golden angle, on the sheet.
		const map = (s) => sheetAt(s.theta, s.rho, rs);
		const hidden = (q) => Z.hidden(q);
		const tubeK = smooth(span(lensY, THROAT_Y + 120, THROAT_Y - 40));
		const near = (px) => 1 - smooth(span(px, lerp(22, 15, tubeK), lerp(75, 48, tubeK)));
		// down the tube, a fog by depth (below the throat, or the lens in it)
		const deepFog = (p, i) =>
			i <= NT ? 1 : 1 - smooth(span(Math.min(lensY, THROAT_Y) - p[1], 2.5 * RS_MAX, 8 * RS_MAX));
		const inTube = lensY < THROAT_Y;
		let n0 = 0;
		let n1 = NSEED;
		if (inTube) {
			const nl = NT + (THROAT_Y - lensY) / (RS_MAX * (Math.log(PHYLLO.phi) / PHYLLO.k));
			n0 = Math.max(0, Math.floor(nl - 40));
			n1 = Math.min(NSEED, Math.ceil(nl + 270));
		}
		n1 = Math.min(n1, tubeEnd);
		const dtS = (B.seed[1] - B.seed[0]) / PHYLLO.n;
		for (let i = n0; i < n1; i++) {
			const ti = B.seed[0] + Math.min(i, PHYLLO.n) * dtS;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const s = SEEDS[i];
			if (rs > 0 && i > NT && seedDepth(i) > THROAT_Y - MOUTH_Y) continue;
			// the cheap tests first, on the centre alone
			const c0 = map(s);
			const df = rs > 0 ? deepFog(c0, i) : 1;
			if (df < 0.03) continue;
			const qc0 = cam.project(c0);
			if (qc0[2] <= NEAR) continue;
			const reach = (2.2 * PHYLLO.seedR * s.rho * (rs > 0 ? 3 : 1) * cam.k) / qc0[2] + 40;
			if (qc0[0] < -reach || qc0[0] > w + reach || qc0[1] < -reach || qc0[1] > h + reach) continue;
			const F = seedFrame(s, map);
			const qc = qc0;
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			const r = PHYLLO.seedR * pop;
			const q1 = cam.project(add3(F.c, mul3(F.e1, r)));
			const q2 = cam.project(add3(F.c, mul3(F.e2, r)));
			if (q1[2] <= NEAR || q2[2] <= NEAR) continue;
			const big = Math.max(
				Math.hypot(q1[0] - qc[0], q1[1] - qc[1]),
				Math.hypot(q2[0] - qc[0], q2[1] - qc[1])
			);
			if (big < 0.5) continue;
			if (qc[0] + big < 0 || qc[0] - big > w || qc[1] + big < 0 || qc[1] - big > h) continue;
			if (hidden(qc)) continue;
			const al = 0.7 * alpha * a * near(big) * smooth(span(big, 1.2, 6)) * df * fog(qc);
			if (al < 0.02) continue;
			const m = Math.max(6, Math.min(32, Math.round(4 + big / 2)));
			const wd = Math.min(1.4, 0.5 + big * 0.1);
			let pa = null;
			for (let k = 0; k <= m; k++) {
				const c = Math.cos((TAU * k) / m);
				const sn = Math.sin((TAU * k) / m);
				const p = [
					qc[0] + c * (q1[0] - qc[0]) + sn * (q2[0] - qc[0]),
					qc[1] + c * (q1[1] - qc[1]) + sn * (q2[1] - qc[1])
				];
				if (pa) ink.seg(PAL.chalk, al, wd, pa[0], pa[1], p[0], p[1]);
				pa = p;
			}
		}
		if (PROF.on) PROF.acc.seeds = (PROF.acc.seeds ?? 0) + performance.now() - ts;
		// The spirals.
		const p8 = smooth(span(t, B.spirals[0], B.spirals[0] + 1.1));
		const p13 = smooth(span(t, B.spirals[0] + 0.4, B.spirals[1]));
		const vLo = n0;
		const vHi = n1;
		const sp = (list, pr, al, wd) => {
			if (pr <= 0) return;
			for (const L of list) {
				const pts = [];
				for (const p of L) {
					if (p.v < vLo || p.v > vHi) continue;
					if (p.v > PHYLLO.n * pr && pr < 1) break;
					pts.push(map(p));
				}
				line3d(pInk, cam, pts, {
					alpha: al * alpha,
					width: wd,
					fade: (q) =>
						fog(q) *
						(rs > 0
							? 1 -
								smooth(span(q[2], 2.5 * RS_MAX, 6.5 * RS_MAX)) *
									smooth(span(t, B.sink[0], B.sink[1]))
							: 1),
					hidden,
					near: lerp(45, 30, tubeK)
				});
			}
		};
		prof('spirals', () => {
			sp(SP8, p8, 0.5, 1.05);
			// down the tube only the 8-spirals (helices) go on: the canvas's
			// cost is stroked length, and these are long near the lens
			if (tubeK < 1) sp(SP13, p13, 0.38 * (1 - tubeK), 0.95);
		});
		prof('flush', () => {
			gInk.flush(ctx);
			ink.flush(ctx);
			pInk.flush(ctx);
		});
		// The apex, lit, while the disc is flat.
		const ap =
			smooth(span(t, B.spirals[1] - 0.4, B.spirals[1] + 0.4)) *
			(1 - smooth(span(t, B.sink[0], B.sink[0] + 1.2)));
		if (ap > 0.01) lit3(ctx, cam, map({ theta: 0, rho: 1e-4 * R_ISO }), 2.2, 0.75 * ap * alpha);
	}

	// The tube's far mouth: the paraboloid's other sheet, flaring out.
	function mouth(ctx, cam, t, alpha) {
		if (alpha <= 0.01) return;
		const ink = makeInk();
		const rs = RS_MAX;
		const r1 = 9 * rs;
		for (let k = 0; k < 24; k++) {
			const th = (TAU * k) / 24;
			const pts = [];
			for (let i = 0; i <= 30; i++) {
				const r = rs + (r1 - rs) * (i / 30) ** 2;
				pts.push([r * Math.cos(th), MOUTH_Y - wOf(r, rs), r * Math.sin(th)]);
			}
			line3d(ink, cam, pts, { alpha: 0.32 * alpha, width: 1, near: 120 });
		}
		for (let j = 0; j < 7; j++) {
			const r = rs * Math.pow(1.45, j);
			const pts = [];
			for (let i = 0; i <= 96; i++)
				pts.push([
					r * Math.cos((TAU * i) / 96),
					MOUTH_Y - wOf(r, rs),
					r * Math.sin((TAU * i) / 96)
				]);
			line3d(ink, cam, pts, { alpha: 0.3 * alpha, width: 1, near: 120 });
		}
		ink.flush(ctx);
	}

	// ── THE LIGHT CONE ───────────────────────────────────────────────────────
	// World: the time axis is the swimmer's line (x = z = 0), up is later; the
	// event at (0, eventY, 0); a year is yearsPer(P) units, a light-year the
	// same (c = 1, the cones at 45°).
	function diagram(ctx, cam, t, alpha, P, D, labels, lines = 1, skipY = null) {
		if (alpha <= 0.01) return;
		const ink = makeInk();
		const yE = eventY();
		const Ev = [0, yE, 0];
		const Y = yearsPer(P);
		const ext = D0 * 1.08; // the future cone's extent
		const past = D0 * 0.75;
		const coneW = smooth(span(t, ...B.cones));
		const nearF = 160;
		// A fog by depth, in proportion to the lens's distance from the event:
		// what is far behind it goes (the past cone's far reaches, the
		// parents' far pasts), and the zoom into the event stays self-similar.
		const dE = Math.hypot(...sub3(cam.pos, Ev));
		const fog = (q) => 1 - smooth(span(q[2], 2.5 * dE, 7 * dE));
		// The cones' generators, written out from the apex.
		for (let k = 0; k < 16; k++) {
			const th = (TAU * k) / 16;
			const c = Math.cos(th);
			const s = Math.sin(th);
			line3d(ink, cam, seg3(Ev, [ext * c, yE + ext, ext * s]), {
				alpha: 0.2 * alpha,
				width: 0.9,
				upto: coneW,
				near: nearF,
				fade: fog
			});
			line3d(ink, cam, seg3(Ev, [past * c, yE - past, past * s]), {
				alpha: 0.17 * alpha,
				width: 0.9,
				upto: coneW,
				near: nearF,
				fade: fog
			});
		}
		// Their circles, at heights falling by a third of an e-fold toward
		// the apex (so the zoom into the event streams them steadily): from
		// the lens's own height down, when the lens is in the future cone.
		const lh = cam.pos[1] - yE;
		const inCone = lh > 0 && Math.hypot(cam.pos[0], cam.pos[2]) < 0.6 * lh;
		const j0 = inCone ? Math.max(0, Math.floor(3 * Math.log(ext / lh)) - 6) : 0;
		for (let j = j0; j < j0 + 40; j++) {
			const hh = ext * Math.exp(-j / 3);
			for (const sgn of [1, -1]) {
				if (sgn < 0 && hh > past) continue;
				const cw = smooth(span(coneW, 0.02 * (j - j0), 0.02 * (j - j0) + 0.5));
				if (cw <= 0) continue;
				const pts = [];
				for (let i = 0; i <= 96; i++)
					pts.push([hh * Math.cos((TAU * i) / 96), yE + sgn * hh, hh * Math.sin((TAU * i) / 96)]);
				line3d(ink, cam, pts, {
					alpha: (sgn > 0 ? 0.13 : 0.2) * alpha * cw,
					width: 0.9,
					near: nearF,
					fade: fog
				});
			}
		}
		// The time axis, and the swimmer's world-line (bold, from now to
		// where it is: down the axis, then off it onto its line into the
		// event), sampled evenly in log height so it holds up in the zoom.
		const yTop = yE + D0;
		line3d(ink, cam, seg3([0, yTop + 60, 0], [0, yE - past, 0], 80), {
			alpha: 0.3 * alpha * coneW,
			width: 1,
			near: nearF,
			fade: fog
		});
		// (behind the swimmer only: from now down to its tail; written in as
		// the lens draws back to the side, not while it rides behind it)
		const Dw = D + 0.92 * P.body.length * Math.min(1, D / D_REF);
		const wa = smooth(span(t, B.side[0] + 0.5, B.side[1]));
		if (Dw < D0 && wa > 0) {
			const wl = [];
			const NL = 90;
			for (let i = 0; i <= NL; i++) {
				const d = D0 * Math.pow(Dw / D0, i / NL);
				wl.push(pathW(SIG_34 + D0 - d));
			}
			line3d(ink, cam, wl, { alpha: 0.8 * alpha * lines * wa, width: 1.5, near: nearF });
		}
		// The years: a tick ring round the axis each year, the decades wider.
		const tk = smooth(span(t, B.interim - 0.4, B.interim + 0.9));
		const yr0 = Math.ceil(P.TE - past / Y);
		const yr1 = Math.floor(P.TTOP);
		const byYear = yr1 - yr0 > 80 ? 5 : 1;
		const tickR = 0.02 * D0;
		for (let yr = yr1; yr >= yr0; yr--) {
			if (yr % byYear) continue;
			const yy = yE + (yr - P.TE) * Y;
			const dec = yr % 10 === 0;
			const birth = yr === P.year;
			const r = tickR * (birth ? 2.4 : dec ? 1.8 : 1);
			const pts = [];
			for (let i = 0; i <= 64; i++)
				pts.push([r * Math.cos((TAU * i) / 64), yy, r * Math.sin((TAU * i) / 64)]);
			// (a ring the lens comes close to is let go — from a sixth of the
			// board across its radius — or it would sweep the board)
			const qc = cam.project([0, yy, 0]);
			const big =
				qc[2] > NEAR ? 1 - smooth(span((cam.k * r) / qc[2], 0.16 * VIEW.h, 0.3 * VIEW.h)) : 0;
			line3d(ink, cam, pts, {
				color: birth ? PAL.gold : PAL.chalk,
				alpha: (birth ? 0.9 : dec ? 0.55 : 0.32) * alpha * tk * big,
				width: birth ? 1.5 : 1,
				near: 30,
				fade: fog
			});
		}
		// The parents: two world-lines up the past cone to the apex, timelike.
		const pw = smooth(span(t, ...B.parents));
		if (pw > 0) {
			// (up the board either side of the axis, seen from the side; up the
			// board, clear of the swimmer's tail, seen down the axis)
			// Straight: inertial, each at its own speed off the axis (a
			// wobble, seen down the axis as the lens turns, curls into a hook
			// at the line's far end, by its vanishing point).
			for (const [ang, b0] of [
				[0.9, 0.5],
				[-1.1, 0.58]
			]) {
				const pts = [];
				const NP = 170;
				for (let i = 0; i <= NP; i++) {
					// evenly in log depth below the event, down to a hair from it
					const d = i === NP ? 0 : past * 0.97 * Math.exp(-i / 7.5);
					pts.push([b0 * d * Math.cos(ang), yE - d, b0 * d * Math.sin(ang)]);
				}
				line3d(ink, cam, pts, {
					alpha: 0.85 * alpha * lines,
					width: 1.6,
					upto: pw,
					near: nearF,
					fade: fog
				});
				const q0 = cam.project(pts[0]);
				if (q0[2] > NEAR)
					disc(ctx, q0[0], q0[1], 2.2, {
						fill: PAL.chalk,
						alpha: 0.8 * alpha * lines * fog(q0) * smooth(span(pw, 0, 0.1))
					});
			}
		}
		ink.flush(ctx);
		// The event: lit as the parents reach it.
		const ev = smooth(span(t, B.parents[1] - 0.6, B.parents[1] + 0.4));
		if (ev > 0.01) lit3(ctx, cam, Ev, 2.4, 0.85 * ev * alpha);
		// The labels: the decades, the top year and the birth year (gold).
		if (labels > 0.01) {
			const lb = labels * tk * alpha;
			ctx.save();
			ctx.font = TECHF(12);
			ctx.textBaseline = 'middle';
			for (let yr = yr1; yr >= yr0; yr--) {
				const birth = yr === P.year;
				if (!(yr % 10 === 0 || yr === yr1 || birth)) continue;
				const yy = yE + (yr - P.TE) * Y;
				const q = cam.project([0, yy, 0]);
				if (q[2] <= NEAR) continue;
				// (the swimmer's own year is written here: its fixed label gives way)
				const give = skipY === null ? 1 : smooth(span(Math.abs(q[1] - skipY), 12, 34));
				ctx.globalAlpha = (birth ? 0.95 : 0.5) * lb * give;
				ctx.fillStyle = birth ? PAL.gold : PAL.chalk;
				ctx.fillText(String(yr), q[0] + 14, q[1]);
			}
			ctx.restore();
		}
	}

	// ── The 3D world, from the compile to the fall ───────────────────────────
	function world(ctx, w, h, t, hand) {
		geom(ctx, w, h);
		const P = personFor(answers.answers.date, answers.answers.spice);
		const fall = fallFor(forced ?? P.decade);
		const rate0 = fall.geometry(w, h).rate0;
		const S = swimmerAt(P, t, rate0);
		const rig = rigAt(P, t, w, h, S, rate0);
		const cam = lensOf(rig, w, h);
		const shape = shapeAt(P, t);

		// Stars, the sheet, the tube, the diagram.
		const starA =
			0.5 * smooth(span(t, 21.8, 23.6)) * (1 - 0.8 * smooth(span(t, 30.6, 31.8))) +
			0.4 * smooth(span(t, 33.4, 35));
		stars(ctx, cam, w, h, Math.min(0.55, starA));
		if (t < B.compile + 7.5) prof('compile', () => compile(ctx, w, h, t, hand, P, cam, shape, S));
		else if (t < B.mouth[1]) {
			prof('depth', () => {
				Z.reset(w, h);
				P.body.fillDepth(Z, cam, shape, S.pose);
			});
		}
		const sheetA =
			smooth(span(t, B.grid[0], B.grid[0] + 0.6)) *
			(1 - smooth(span(t, B.mouth[0], B.mouth[1] - 0.6)));
		if (sheetA > 0.01) prof('sheet', () => sheet(ctx, w, h, t, cam, sheetA));
		mouth(
			ctx,
			cam,
			t,
			smooth(span(t, B.mouth[0], B.mouth[0] + 0.5)) *
				(1 - smooth(span(t, B.mouth[1] - 0.8, B.mouth[1])))
		);
		const D = t > B.interim ? heightAt(t, rate0) : D0;
		// The swimmer's own year, beside its head: counting back from now,
		// fast, then slowing; gold through the birth year; the event's year
		// as it reaches it (gone as the room comes out of the event).
		let year = null;
		const ya =
			smooth(span(t, B.side[0] + 0.3, B.side[0] + 1.1)) *
			(1 - smooth(span(t, B.fall[0] - 0.7, B.fall[0] - 0.05)));
		if (ya > 0.01 && t > B.interim) {
			const q = cam.project(S.nose);
			if (q[2] > NEAR) year = { q, yr: Math.floor(P.TE + D / yearsPer(P)), a: ya };
		}
		if (t > B.interim - 1.2) {
			const da = smooth(span(t, B.interim - 1.2, B.interim + 0.3));
			const labels =
				smooth(span(t, B.side[0] + 0.6, B.side[1])) *
				(1 - smooth(span(t, B.zoom[0], B.zoom[0] + 0.8)));
			prof('diagram', () => diagram(ctx, cam, t, da, P, D, labels, 1, year ? year.q[1] : null));
		}
		// The swimmer.
		if (t >= B.body[1]) {
			const life =
				span(t, B.life - 0.05, B.life + 0.15) *
				(1 - 0.7 * smooth(span(t, B.life + 0.2, B.life + 1.1)));
			// Under D_REF the swimmer is drawn scale-free: the body at D_REF
			// and the lens scaled about the event by the same ratio — a
			// similarity, so the picture is the shrunken body's, and it never
			// shrinks into the near plane.
			if (S.scale < 1) {
				const Sr = swimmerAt(P, t, rate0, D_REF);
				const cr = lensOf(scaleRig(rig, 1 / S.scale), w, h);
				prof('body', () => P.body.draw(ctx, cr, shape, Sr.pose, { back: 0.12 }));
			} else prof('body', () => P.body.draw(ctx, cam, shape, S.pose, { back: 0.12 }));
			if (life > 0) {
				const sMid = (P.body.parts.mid[0] + P.body.parts.mid[1]) / 2;
				lit3(ctx, cam, P.body.at(shape, S.pose, sMid), 2.2, life);
			}
		}

		if (year) {
			ctx.save();
			ctx.font = TECHF(13);
			ctx.textBaseline = 'middle';
			ctx.globalAlpha = 0.85 * year.a;
			ctx.fillStyle = year.yr === P.year ? PAL.gold : PAL.chalk;
			ctx.fillText(String(year.yr), year.q[0] + 16, year.q[1]);
			ctx.restore();
		}
		caption(ctx, w, h, CAPTION.genetics, t, { at: B.genetics[0], until: B.genetics[1] });
		caption(ctx, w, h, CAPTION.conception, t, { at: B.caption2[0], until: B.caption2[1] });
	}

	// ── THE FALL and THE ROOM ────────────────────────────────────────────────
	function falling(ctx, w, h, t) {
		const P = personFor(answers.answers.date, answers.answers.spice);
		const fall = fallFor(forced ?? P.decade);
		const geo = fall.geometry(w, h);
		const rate0 = geo.rate0;
		const D42 = heightAt(B.fall[0], rate0);
		const Dt = D42 * Math.exp(-geo.efolds(t));
		const S = swimmerAt(P, t, rate0, D_REF); // drawn scale-free (see world)
		const rig = rigZoom(S);
		const camD = lensOf(rigZoomD(Dt), w, h);
		const background = (c, cm, zoom, alpha) => {
			c.save();
			c.translate(cm.ox - w / 2, cm.oy - h / 2);
			stars(c, camD, w, h, 0.4 * alpha);
			// the straight world-lines go as the last rooms come: the
			// cone's rings stream on through every glass
			diagram(c, camD, t, alpha, P, Dt, 0, 1 - smooth(span(t, 48.5, 51.5)));
			c.restore();
		};
		const cam = prof('fall', () =>
			fall.draw(ctx, w, h, t, { background, colourAlong: false, dust: board.dust })
		);
		// The room comes up out of the event point: over its first moments the
		// board and the diagram are laid back over it, thinning.
		const dark = 1 - smooth(span(t, ...B.roomIn));
		if (dark > 0.003) {
			ctx.save();
			ctx.globalAlpha = dark;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
			ctx.save();
			ctx.globalAlpha = dark;
			background(ctx, cam, 0, 1);
			ctx.restore();
		}
		// The swimmer, at the vanishing point, then on into the last glass.
		const aim = smooth(span(t, ...B.aim));
		let gx = cam.ox;
		let gy = cam.oy;
		if (cam.glass) {
			gx = (cam.glass[0] + cam.glass[2]) / 2;
			gy = (cam.glass[1] + cam.glass[3]) / 2;
		}
		const shift = [lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2];
		const k = lerp(1, 3.2, aim * aim);
		const alpha = 1 - smooth(span(t, B.hit - 0.12, B.hit));
		if (alpha > 0.01) {
			const r2 = { E: add3(S.nose, mul3(sub3(rig.E, S.nose), k)), T: rig.T, up: rig.up };
			const camS = lensOf(r2, w, h);
			ctx.save();
			ctx.translate(shift[0], shift[1]);
			ctx.globalAlpha = alpha;
			prof('body', () => P.body.draw(ctx, camS, shapeAt(P, t), S.pose, { back: 0.1 }));
			ctx.restore();
		}
		if (t >= B.hit && cam.glass) splash(ctx, cam.glass, t - B.hit, P.spice);
		const out = smooth(span(t, ...B.out));
		if (out > 0.003) {
			ctx.save();
			ctx.globalAlpha = out;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
	}

	function render() {
		if (PROF.on && ++PROF.n % 20 === 0 && window.__lab) {
			window.__lab.prof = Object.fromEntries(
				Object.entries(PROF.acc).map(([k, v]) => [k, Math.round((v / 20) * 10) / 10])
			);
			PROF.acc = {};
		}
		prof('total', () => render1());
	}
	function render1() {
		clearBoard(board);
		const { ctx, w, h } = board;
		VIEW.w = w;
		VIEW.h = h;
		const t = time.t;
		if (window.__lab) {
			window.__lab.t = t; // the run's clock, for the seek-vs-run check
			// (the lab spreads info into __lab once, so the getter would read
			// the demo's decade forever: the room actually fallen to, live)
			window.__lab.decade = decadeNow();
		}
		const hand = answers.hand(t);
		answers.slider(hit);
		if (t < FREEZE) {
			SL = null;
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			if (live) setCursor('');
		} else if (t < B.compile) entry(ctx, w, h, t, hand);
		else if (t < B.fall[0]) {
			geom(ctx, w, h);
			if (live && t < B.fold[1]) remember(hand, t);
			if (t >= B.fold[1]) SL = null;
			world(ctx, w, h, t, hand);
		} else falling(ctx, w, h, Math.min(t, SECONDS));
		tag(ctx, w, h, 'flow-wormhole');
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render,
		resize() {
			G = null;
			frozen = null;
		}
	};
}
