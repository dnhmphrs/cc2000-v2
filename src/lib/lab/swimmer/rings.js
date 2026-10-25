// ── log-swimmer · rings ──────────────────────────────────────────────────────
// The swimmer BUILT FROM ITS SECTIONS: rings stacked from the nose to the tip,
// each the body's cross-section at its station, then the generatrices drawn
// through them, joining the rings into the surface — and set swimming down
// the Riemann surface of log z, round the axis, toward the branch point.
//
// The run, beat by beat (u = progress, 20 s):
//   0.00–0.03  the body's axis, a faint line written from the nose to where
//              the tip will be (it already follows the swimmer's path).
//   0.03–0.15  the HEAD's rings, one after another from the nose, each
//              written round like a compass circle, its far side dashed
//              behind the skin built so far: flattened ellipses (3 wide, 1.5
//              thick), the acrosome's edge two-thirds back a bolder ring a
//              little proud of the next. The lens starts near nose-on, so
//              the first sections read as their own ellipses, rises over
//              the broad face, and comes round to the edge, where the same
//              stack reads thin.
//   0.14–0.19  the neck and the midpiece: circles, close set.
//   0.18–0.27  the FLAGELLUM's rings, quicker, shrinking toward the tip; the
//              lens draws back along the body, the tail receding.
//   0.26–0.38  the GENERATRICES: sixteen lines, each written from the nose
//              through every ring to the tip, in turn round the body — the
//              rings joined into the surface (pens at their ends).
//   0.35–0.41  the CONTOUR, where the surface turns from the lens, bold down
//              both sides; the construction axis goes; the whole body, from
//              ahead, three-quarter.
//   0.415–0.5  life: a gold spark at the midpiece; the beat starts at the
//              neck and runs down to the tip (0.43), the body rolls (0.435)
//              and moves off (0.45), the lens with it.
//   0.47–0.66  the SURFACE written out from the swimmer's own sheet, up and
//              down: the axis both ways from its height, the rulings drawn
//              out from the axis, the circles wound on behind them — the
//              ramp appears under the swimmer (≈0.5), then the lens pulls
//              out (0.5–0.62) to the whole staircase, 3⅛ turns, turning.
//   0.60–0.72  the swimmer's track ahead, dotted, written in: the spiral
//              winding in to the axis.
//   0.65–0.77  the lens comes down into the staircase, beside the swimmer,
//              outside and a little ahead, the axis beyond its head; then it
//              goes round the axis with it down the ramp (120° round, 43
//              down, from r 215 to 40), and closes from 0.8 as it nears.
//
// What is EXACT: the surface — the Riemann surface of log z drawn as the
// helicoid (r cos θ, c θ, r sin θ), y up, c = 20: z = r e^{iθ} on the floor,
// its height c·arg z, over θ ∈ [−4π, 2¼π] and r ≤ 260 — and every line on it
// a level line of the one coordinate w = log z = ln r + iθ: the rulings
// Im w = θ = const every π/16 (straight lines out of the axis: the helicoid
// is ruled) and the curves Re w = ln r = const at r = 260 e^{−jπ/16}, so the
// grid is the image of a square grid in w, each cell a conformal square,
// shrinking toward the axis without end (a circle is left out once it is
// under 2.5 px across); the axis r = 0 over the branch point z = 0, where
// every sheet meets; the swimmer's path, a straight line in w —
// ln r = ln 215 − 0.8τ, θ = −τ — the logarithmic spiral lifted, crossing every
// ruling at arctan(1/0.8) ≈ 51° and winding infinitely often before it
// reaches the axis (its arc length tabled numerically); the dotted track,
// that curve raised by the swimmer's height along the surface's normal
// (C sin θ, r, −C cos θ); hidden lines by a 4 px software depth buffer of the
// written surface (rows every 5° in θ, exact in r) and of the body's skin,
// each segment tested at its middle; the body's contour, where the normal of
// its ring × generatrix grid meets the line of sight (crossings interpolated).
// What is a PICTURE: the body's proportions as the brief has them (head 5 ×
// 3 × 1.5, broadest two-fifths back, thickest three-fifths, the acrosome a lip
// 0.07 proud over the front two-thirds; the neck's waist; midpiece 4 × 1;
// flagellum 45, tapering 0.8 → 0.06), each section an ellipse; the beat, a
// travelling wave of the flagellum's tangent angle (0.16 rad at the neck to
// 0.8 at the tip, wavelength 30, 2.3 Hz), integrated so the tail keeps its
// length, its mean angle turned out so the head yaws against the tail; the
// roll, the beat's plane turned about the path (0.3 turn a second); the body
// laid along the path it has swum (each station at the path's point that
// far back), so it follows the ramp round rather than swimming free; its
// height over the ramp (7); c, the spiral's 0.8, the pace.
//
// Frame cost, headless at 1280 × 800: 1–11 ms of script a frame (median,
// with the machine loaded), the rAF gap holding 16.7 ms; at most about 4200
// segments (the staircase whole, u ≈ 0.64), 2400–3900 in the chase — lines
// cut to 12 px where they cross the body on the board and to 30 px elsewhere,
// small rings and generatrices drawn in fewer chords, batched by alpha and
// width.

import {
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	clamp01,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	camera3,
	disc
} from '../log/board.js';
import { NEAR, makeDepth, spline3, lit3 } from '../log/space.js';
import { makeInk } from '../log/kummer.js';

export const meta = {
	title:
		'rings: sections stacked nose to tip, joined by generatrices — down the Riemann surface of log z',
	order: 2,
	seconds: 20,
	three: false
};

const SEC = meta.seconds;
const UP = [0, 1, 0];
const FOV = 40;
const lerp3n = (a, b, w) => [lerp(a[0], b[0], w), lerp(a[1], b[1], w), lerp(a[2], b[2], w)];

// ── The body: s, the distance back from the nose ─────────────────────────────
const L_HEAD = 5;
const S_MID = 6;
const S_TAIL = 10;
const LEN = 55;
const S_CAP = 3.375; // the acrosome's edge, two-thirds back
const S_BEAT = 5.5; // where the flagellum's bending starts
const R_NECK = 0.42;
const HEAD_W = 1.5; // half the head's width
const HEAD_T = 0.75; // half its thickness

// The section at s: half-axes [a, b] of its ellipse — a across the head's
// broad face (the beat's plane), b through its thickness.
function sectionOf(s) {
	if (s <= L_HEAD) {
		const x = s / L_HEAD;
		let a;
		let b;
		if (x <= 0.42) a = HEAD_W * Math.sqrt(Math.max(0, 1 - ((0.42 - x) / 0.42) ** 2));
		else {
			const q = (x - 0.42) / 0.58;
			a = HEAD_W * Math.sqrt(1 - q * q * (1 - (R_NECK / HEAD_W) ** 2));
		}
		if (x <= 0.62) b = HEAD_T * Math.sqrt(Math.max(0, 1 - ((0.62 - x) / 0.62) ** 2));
		else {
			const q = (x - 0.62) / 0.38;
			b = HEAD_T * Math.sqrt(1 - q * q * (1 - (R_NECK / HEAD_T) ** 2));
		}
		const cap = 0.07 * Math.min(1, s / 0.5) * (1 - smooth(span(s, S_CAP - 0.1, S_CAP + 0.02)));
		return [a + cap, b + cap];
	}
	let r;
	if (s < 5.5) r = lerp(R_NECK, 0.34, smooth(span(s, L_HEAD, 5.5)));
	else if (s < S_MID) r = lerp(0.34, 0.5, smooth(span(s, 5.5, S_MID)));
	else if (s < 9.9) r = 0.5 + 0.025 * Math.sin((Math.PI * (s - S_MID)) / 3.9);
	else if (s < 10.2) r = lerp(0.5, 0.4, smooth(span(s, 9.9, 10.2)));
	else if (s < 52) r = lerp(0.4, 0.12, (s - 10.2) / 41.8);
	else r = lerp(0.12, 0.03, smooth(span(s, 52, LEN)));
	return [r, r];
}

// The stations (the grid along the body) and the rings among them.
const STATIONS = [];
for (let s = 0; s <= L_HEAD + 1e-9; s += 0.125) STATIONS.push(+s.toFixed(4));
for (let s = 5.25; s <= S_TAIL + 1e-9; s += 0.25) STATIONS.push(+s.toFixed(4));
for (let s = S_TAIL + 0.75; s <= LEN + 1e-9; s += 0.75) STATIONS.push(+s.toFixed(4));
const NS = STATIONS.length;
const SECT = STATIONS.map(sectionOf);
const NPHI = 48; // samples round a section
const GEN_EVERY = 3; // a generatrix every third sample: sixteen
const NGEN = NPHI / GEN_EVERY;
const idxOf = (s) => STATIONS.findIndex((x) => Math.abs(x - s) < 1e-6);
// Rings: { i: station, u0: start, d: duration, cap }. The head ring by ring,
// then the neck and midpiece, then the tail's quicker stream.
const RINGS = [];
{
	const head = [0.25, 0.625, 1, 1.5, 2, 2.5, 3, S_CAP, 3.75, 4.25, 4.625, 5];
	head.forEach((s, m) =>
		RINGS.push({ i: idxOf(s), u0: 0.026 + m * 0.009, d: 0.024, cap: s === S_CAP })
	);
	const mid = [5.5, 6, 6.75, 7.5, 8.25, 9, 9.75, 10];
	mid.forEach((s, m) => RINGS.push({ i: idxOf(s), u0: 0.136 + m * 0.0058, d: 0.017 }));
	let m = 0;
	for (let s = S_TAIL + 2.25; s < LEN - 1; s += 2.25, m++)
		RINGS.push({ i: idxOf(+s.toFixed(4)), u0: 0.182 + m * 0.0044, d: 0.013 });
}
const GEN0 = 0.262; // the generatrices start …
const GEN_STEP = 0.0046; // … one after another round the body …
const GEN_D = 0.05; // … each this long, nose to tip
const SIL = [0.352, 0.41]; // the contour, nose to tip

// The beat: the flagellum's tangent angle β(s, t) = B(s) sin(k(s − s₀) − ωt),
// B growing toward the tip; integrated, so the tail keeps its length.
const K_BEAT = TAU / 30;
const B_NECK = 0.16;
const B_TIP = 0.8;
const BEAT_HZ = 2.3;
const T_BEAT = 0.43 * SEC; // the beat starts at the neck …
const FRONT_V = 40; // … and runs down the tail at this pace

// ── The surface: the Riemann surface of log z, as the helicoid ──────────────
// z = r e^{iθ} on the floor, the height c·θ: (r cos θ, c θ, r sin θ), y up.
const C = 20; // height per radian: a turn is 2πc ≈ 126, about two body lengths
const R_RIM = 260;
const TH_TOP = 2.25 * Math.PI;
const TH_BOT = -4 * Math.PI;
const DTH = Math.PI / 16; // the grid's step in w = log z, both ways
const TH_C = 0; // the sheet the swimmer is made on, where the writing starts
const heli = (r, th) => [r * Math.cos(th), C * th, r * Math.sin(th)];
const upOf = (r, th) => norm([C * Math.sin(th), r, -C * Math.cos(th)]);

// The swimmer's path: a straight line in w = log z, ln r = ln r₀ − aτ,
// θ = −τ — the logarithmic spiral, lifted. Tabled by arc length σ.
const R0 = 215;
const A_SP = 0.8;
const H_OFF = 7; // the body's axis above the ramp
const TAU_MIN = -1;
const TAU_MAX = -TH_BOT + 0.2;
const DTAU = 0.004;
const pathSpeed = (tau) => {
	const r = R0 * Math.exp(-A_SP * tau);
	return Math.sqrt((1 + A_SP * A_SP) * r * r + C * C);
};
const PATH = (() => {
	const n = Math.ceil((TAU_MAX - TAU_MIN) / DTAU) + 1;
	const sig = new Float64Array(n);
	let acc = 0;
	for (let i = 0; i < n; i++) {
		const tau = TAU_MIN + i * DTAU;
		if (i) acc += ((pathSpeed(tau - DTAU) + pathSpeed(tau)) / 2) * DTAU;
		sig[i] = acc;
	}
	const s0 = sig[Math.round(-TAU_MIN / DTAU)];
	for (let i = 0; i < n; i++) sig[i] -= s0;
	return { n, sig };
})();
function tauOf(sigma) {
	const { n, sig } = PATH;
	if (sigma <= sig[0]) return TAU_MIN;
	if (sigma >= sig[n - 1]) return TAU_MAX;
	let lo = 0;
	let hi = n - 1;
	while (hi - lo > 1) {
		const m = (lo + hi) >> 1;
		if (sig[m] <= sigma) lo = m;
		else hi = m;
	}
	return TAU_MIN + (lo + (sigma - sig[lo]) / (sig[hi] - sig[lo])) * DTAU;
}
// The point of the path at arc length σ, its heading H (unit, forward), the
// surface's normal N there (up), and E1 = N × H, across.
function pathAt(sigma) {
	const tau = tauOf(sigma);
	const r = R0 * Math.exp(-A_SP * tau);
	const th = -tau;
	const c = Math.cos(th);
	const s = Math.sin(th);
	const H = norm([-A_SP * r * c + r * s, -C, -A_SP * r * s - r * c]);
	const N = upOf(r, th);
	return { tau, r, th, P: heli(r, th), H, N, E1: norm(cross(N, H)) };
}

// ∫ of a rate that is piecewise linear in t through keys [[t, rate], …]:
// the pace and the roll gather and stay pure functions of t.
function integ(t, keys) {
	let acc = 0;
	for (let i = 0; i < keys.length - 1; i++) {
		const [t0, r0] = keys[i];
		const [t1, r1] = keys[i + 1];
		if (t <= t0) break;
		const te = Math.min(t, t1);
		const re = r0 + ((r1 - r0) * (te - t0)) / (t1 - t0);
		acc += ((r0 + re) / 2) * (te - t0);
	}
	const [tl, rl] = keys[keys.length - 1];
	if (t > tl) acc += rl * (t - tl);
	return acc;
}
const SWIM = [
	[0.45 * SEC, 0],
	[0.55 * SEC, 28],
	[0.75 * SEC, 30],
	[SEC, 26]
];
const ROLL = [
	[0.435 * SEC, 0],
	[0.52 * SEC, TAU * 0.3],
	[SEC, TAU * 0.3]
];

// ── Hidden lines ─────────────────────────────────────────────────────────────
// Behind the surface in the depth buffer? The deepest of the four cells
// round the point (so a contour stays drawn), with a relative slack; a point
// just off the board is tested against the board's edge.
function behind(Z, x, y, z, rel) {
	if (!Z.on) return false;
	const fx = x / Z.s - 0.5;
	const fy = y / Z.s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	let m = -Infinity;
	for (let dy = 0; dy < 2; dy++)
		for (let dx = 0; dx < 2; dx++) {
			const xx = x0 + dx;
			const yy = y0 + dy;
			const v =
				Z.buf[Math.min(Z.H - 1, Math.max(0, yy)) * Z.W + Math.min(Z.W - 1, Math.max(0, xx))];
			if (v > m) m = v;
		}
	return z > m * (1 + rel) + 0.01;
}

export async function make() {
	const Z = makeDepth(4);
	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t, Z);
		}
	};
}

// ── The swimmer at t ─────────────────────────────────────────────────────────
// Its centreline in its own plane (x back, y across) from the tangent angle,
// the mean angle turned out so the mean is the heading (which is what yaws
// the head against the tail); then laid along the path it has swum — each
// station at the path's point that far back, in the path's frame there,
// rolled by ρ about it — so the body follows the ramp round.
function bodyAt(t) {
	const sigma = integ(t, SWIM);
	const rho = integ(t, ROLL);
	const ph = TAU * BEAT_HZ * Math.max(0, t - T_BEAT);
	const front = (t - T_BEAT) * FRONT_V;
	const bAt = (s) => {
		if (front <= 0) return 0;
		const d = s - S_BEAT;
		const env = smooth(span(front - d, 0, 9));
		const B = B_NECK + (B_TIP - B_NECK) * clamp01(d / (LEN - S_BEAT));
		return env * B * Math.sin(K_BEAT * d - ph);
	};
	const beta = new Float64Array(NS);
	const bNeck = bAt(S_BEAT);
	let mean = 0;
	for (let i = 0; i < NS; i++) {
		beta[i] = STATIONS[i] <= S_BEAT ? bNeck : bAt(STATIONS[i]);
		if (i) mean += ((beta[i] + beta[i - 1]) / 2) * (STATIONS[i] - STATIONS[i - 1]);
	}
	mean /= LEN;
	const cr = Math.cos(rho);
	const sr = Math.sin(rho);
	const cen = new Array(NS);
	const nA = new Array(NS);
	const nB = new Array(NS);
	let X = 0;
	let Y = 0;
	const p = pathAt(sigma);
	for (let i = 0; i < NS; i++) {
		beta[i] -= mean;
		if (i) {
			const ds = STATIONS[i] - STATIONS[i - 1];
			const bm = (beta[i] + beta[i - 1]) / 2;
			X += Math.cos(bm) * ds;
			Y += Math.sin(bm) * ds;
		}
		const f = i ? pathAt(sigma - X) : p;
		const ex = mul3(f.H, -1);
		const ey = add3(mul3(f.E1, cr), mul3(f.N, sr));
		const ez = add3(mul3(f.E1, -sr), mul3(f.N, cr));
		cen[i] = add3(add3(f.P, mul3(f.N, H_OFF)), mul3(ey, Y));
		nA[i] = add3(mul3(ex, -Math.sin(beta[i])), mul3(ey, Math.cos(beta[i])));
		nB[i] = ez;
	}
	const O = cen[0];
	const ex = mul3(p.H, -1);
	// The nose's frame without the roll, for the lens: x back, y across, z up.
	const flat = ([x, y, z]) => add3(O, add3(mul3(ex, x), add3(mul3(p.E1, y), mul3(p.N, z))));
	return { sigma, p, O, cen, nA, nB, flat };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// The generation: keyed in the nose's frame (x back, y across, z up) — near
// nose-on for the first sections, so each reads as its own ellipse; over the
// broad face; round to the edge, where the same rings read thin; back along
// the body as the tail is stacked; the whole body, three-quarter, from ahead.
const GEN = [
	[0, [1.0, 0, 0], [-6.5, 2.2, 3.0]],
	[0.05, [1.6, 0, 0], [-7.6, 0.9, 1.5]],
	[0.095, [2.4, 0, 0], [-4.2, 1.8, 6.6]],
	[0.14, [3.4, 0, 0], [-1.6, 8.2, 1.8]],
	[0.19, [8, 0, 0], [-6.5, 14, 6]],
	[0.26, [15, 0, 0], [-17, 25, 18]],
	[0.33, [22, 0, 0], [-28, 33, 29]],
	[0.42, [22, 0, 0], [-30, 37, 33]],
	[0.5, [19, 0, 0], [-27, 31, 28]]
];
const GEN_T = GEN.map(([u, T]) => [u, T]);
const GEN_E = GEN.map(([u, T, E]) => [u, add3(T, E)]);

// Blend two rigs {T, E}: the distance in log, the target moved with it, so
// whatever the near rig frames stays framed while the lens draws back.
function blend(a, b, w) {
	if (w <= 0) return a;
	if (w >= 1) return b;
	const da = Math.hypot(...sub3(a.E, a.T));
	const db = Math.hypot(...sub3(b.E, b.T));
	const dir = norm(lerp3n(norm(sub3(a.E, a.T)), norm(sub3(b.E, b.T)), w));
	const d = da * Math.pow(db / da, w);
	const wt = Math.abs(db - da) > 1e-6 ? (d - da) / (db - da) : w;
	const T = lerp3n(a.T, b.T, wt);
	return { T, E: add3(T, mul3(dir, d)) };
}

function lens(u, B) {
	const ug = Math.min(u, 0.5);
	const gen = { T: B.flat(spline3(ug, GEN_T)), E: B.flat(spline3(ug, GEN_E)) };
	// The staircase whole, from outside and above, the swimmer on its top.
	const az = 0.62 + 0.25 * smooth(span(u, 0.5, 0.72));
	const el = 0.38;
	const RT = [0, -80, 0];
	const reveal = {
		T: RT,
		E: add3(RT, mul3([Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)], 880))
	};
	// The chase: outside the swimmer and a little ahead of it, above, looking
	// across it in at the axis, so its head points at where it is going; the
	// lens goes round the axis with it, and closes as it nears.
	const { th } = B.p;
	const yS = B.O[1];
	const inw = [-Math.cos(th), 0, -Math.sin(th)];
	const tng = [Math.sin(th), 0, -Math.cos(th)]; // round, the way it swims
	const k = smooth(span(u, 0.8, 1));
	const E = add3(
		B.O,
		add3(mul3(inw, -lerp(72, 52, k)), add3(mul3(tng, lerp(70, 50, k)), [0, lerp(30, 20, k), 0]))
	);
	const mid = add3(B.O, mul3(B.p.H, -20)); // toward the body's middle
	const chase = { E, T: lerp3n(mid, [0, yS - 10, 0], lerp(0.25, 0.38, k)) };
	let rig = blend(gen, reveal, smooth(span(u, 0.5, 0.62)));
	rig = blend(rig, chase, smooth(span(u, 0.65, 0.77)));
	return rig;
}

// ── A frame ──────────────────────────────────────────────────────────────────
function draw(ctx, w, h, t, Z) {
	const u = clamp01(t / SEC);
	const B = bodyAt(t);
	const rig = lens(u, B);
	const cam = camera3({ pos: rig.E, target: rig.T, up: UP, fov: FOV, w, h });
	const ref = Math.hypot(...sub3(rig.E, B.O));
	const wOf = (z) => Math.min(2.2, Math.max(0.55, ref / z));
	const fogOf = (z) => 1 - 0.75 * smooth(span(z / ref, 2.5, 9));
	const ink = makeInk();
	const M = 40;
	const off = (a, b) =>
		(a[0] < -M && b[0] < -M) ||
		(a[1] < -M && b[1] < -M) ||
		(a[0] > w + M && b[0] > w + M) ||
		(a[1] > h + M && b[1] > h + M);
	// One screen segment, tested at its middle.
	const seg = (a, b, color, alpha, width, hid, rel, fog = false) => {
		if (a[2] <= NEAR || b[2] <= NEAR || off(a, b)) return;
		const mz = (a[2] + b[2]) / 2;
		const al = fog ? alpha * fogOf(mz) : alpha;
		if (behind(Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, mz, rel)) {
			if (hid > 0)
				ink.seg(color, al * hid, Math.max(0.8, width * 0.7), true, a[0], a[1], b[0], b[1]);
			return;
		}
		ink.seg(color, al, width * wOf(mz), false, a[0], a[1], b[0], b[1]);
	};
	// A 3D polyline, long segments cut so the hidden test keeps up — finely
	// where they cross the body's box on the board, coarsely elsewhere; `upto`
	// (0…1, by index) writes it on, returning the pen's point; `gap` draws
	// only every other piece (a dotted line).
	let bb = null;
	const nearBody = (a, b) =>
		bb &&
		Math.max(a[0], b[0]) > bb[0] &&
		Math.min(a[0], b[0]) < bb[2] &&
		Math.max(a[1], b[1]) > bb[1] &&
		Math.min(a[1], b[1]) < bb[3];
	const poly = (pts, color, alpha, width, o = {}) => {
		const { hid = 0, rel = 0.012, fog = true, upto = 1, gap = false } = o;
		const n = pts.length - 1;
		const end = n * clamp01(upto);
		if (end <= 0 || alpha <= 0.01) return null;
		let qa = cam.project(pts[0]);
		let pen = null;
		for (let i = 0; i < n && i < end; i++) {
			const f = Math.min(1, end - i);
			const pb = f < 1 ? lerp3n(pts[i], pts[i + 1], f) : pts[i + 1];
			const qb = cam.project(pb);
			if (qa[2] > NEAR && qb[2] > NEAR && !(gap && i % 2)) {
				const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
				const piece = nearBody(qa, qb) ? 12 : 30;
				if (L > piece * 1.2 && !off(qa, qb)) {
					const m = Math.min(60, Math.ceil(L / piece));
					let q0 = qa;
					for (let j = 1; j <= m; j++) {
						const q1 = j === m ? qb : cam.project(lerp3n(pts[i], pb, j / m));
						seg(q0, q1, color, alpha, width, hid, rel, fog);
						q0 = q1;
					}
				} else seg(qa, qb, color, alpha, width, hid, rel, fog);
			}
			pen = qb;
			qa = qb;
		}
		return pen;
	};

	// ── The surface, as far as it is written: out from the swimmer's sheet,
	// up and down, the front D (in θ) from where it was made ──
	const write = smooth(span(u, 0.47, 0.66));
	const thSpan = TH_TOP - TH_BOT;
	const D = write * (Math.max(TH_TOP - TH_C, TH_C - TH_BOT) + 1.2);
	const thHi = Math.min(TH_TOP, TH_C + D - 0.3);
	const thLo = Math.max(TH_BOT, TH_C - D + 0.3);
	const axisOn = smooth(span(u, 0.47, 0.56));
	const NR = 12;
	const rS = (i) => R_RIM * Math.pow(i / NR, 1.35);
	const RULE_D = 0.9; // radians of the front it takes to draw a ruling out

	// ── Depth: the written surface, then the body ──
	Z.reset(w, h);
	if (thHi > thLo) {
		const RG = [0, 1.5, 4, 8, 14, 22, 33, 48, 66, 88, 115, 148, 185, 222, 260];
		const n = Math.ceil((thHi - thLo) / (TAU / 72));
		let prev = null;
		for (let k = 0; k <= n; k++) {
			const th = thHi - ((thHi - thLo) * k) / n;
			const row = RG.map((r) => cam.project(heli(r, th)));
			if (prev)
				for (let i = 0; i < RG.length - 1; i++) {
					Z.tri(prev[i], row[i], row[i + 1]);
					Z.tri(prev[i], row[i + 1], prev[i + 1]);
				}
			prev = row;
		}
	}
	// The body's grid, in the world, projected; the skin built so far in Z.
	const P = new Array(NS * NPHI);
	const Q = new Array(NS * NPHI);
	for (let i = 0; i < NS; i++) {
		const [a, b] = SECT[i];
		const c = B.cen[i];
		const A = B.nA[i];
		const Bv = B.nB[i];
		for (let k = 0; k < NPHI; k++) {
			const phi = (TAU * k) / NPHI;
			const ca = a * Math.cos(phi);
			const sb = b * Math.sin(phi);
			const p = [
				c[0] + A[0] * ca + Bv[0] * sb,
				c[1] + A[1] * ca + Bv[1] * sb,
				c[2] + A[2] * ca + Bv[2] * sb
			];
			P[i * NPHI + k] = p;
			Q[i * NPHI + k] = cam.project(p);
		}
	}
	bb = [Infinity, Infinity, -Infinity, -Infinity];
	for (const q of Q)
		if (q[2] > NEAR) {
			bb[0] = Math.min(bb[0], q[0] - 30);
			bb[1] = Math.min(bb[1], q[1] - 30);
			bb[2] = Math.max(bb[2], q[0] + 30);
			bb[3] = Math.max(bb[3], q[1] + 30);
		}
	const ringP = (r) => smooth(span(u, r.u0, r.u0 + r.d));
	let built = 0; // the skin is in the depth buffer up to the last ring half written
	for (const r of RINGS) if (ringP(r) > 0.5) built = r.i;
	if (u > GEN0) built = NS - 1;
	for (let i = 0; i < built; i++)
		for (let k = 0; k < NPHI; k++) {
			const k1 = (k + 1) % NPHI;
			const a = Q[i * NPHI + k];
			const b = Q[i * NPHI + k1];
			const c = Q[(i + 1) * NPHI + k];
			const d = Q[(i + 1) * NPHI + k1];
			Z.tri(a, c, d);
			Z.tri(a, d, b);
		}

	// ── The surface's lines ──
	if (axisOn > 0)
		for (const end of [TH_TOP + 0.5, TH_BOT - 0.3]) {
			const ax = [];
			for (let i = 0; i <= 50; i++) ax.push([0, C * lerp(TH_C, end, i / 50), 0]);
			poly(ax, PAL.chalk, 0.85, 1.5, { upto: axisOn, rel: 0.02 });
		}
	if (D > 0) {
		// The rulings Im w = θ, every π/16 (every π/8 the bolder), out from the axis.
		const nRule = Math.round(thSpan / DTH);
		for (let k = 0; k <= nRule; k++) {
			const th = TH_TOP - k * DTH;
			const q = clamp01((D - Math.abs(th - TH_C)) / RULE_D);
			if (q <= 0) continue;
			const pts = [];
			for (let i = 0; i <= NR; i++) pts.push(heli(rS(i), th));
			const edge = k === 0 || k === nRule;
			const main = k % 2 === 0;
			poly(pts, PAL.chalk, edge ? 0.8 : main ? 0.5 : 0.24, edge ? 1.4 : main ? 1 : 0.9, {
				upto: q
			});
		}
		// The curves Re w = ln r, r = R e^{−jπ/16}, wound on up and down to
		// where the rulings have reached.
		const kPx =
			h / 2 / Math.tan((FOV * Math.PI) / 360) / Math.max(1, Math.hypot(rig.E[0], rig.E[2]));
		for (let j = 0; ; j++) {
			const r = R_RIM * Math.exp(-j * DTH);
			if (r < 1.2 || r * kPx < 2.5) break; // on in to the axis, while a circle is more than a dot
			const reach = D - RULE_D * Math.pow(r / R_RIM, 1 / 1.35);
			const a0 = Math.min(TH_TOP, TH_C + reach);
			const a1 = Math.max(TH_BOT, TH_C - reach);
			if (a0 <= a1) continue;
			const perTurn = r > 60 ? 96 : r > 15 ? 56 : 28;
			const n = Math.max(2, Math.ceil(((a0 - a1) / TAU) * perTurn));
			const pts = [];
			for (let i = 0; i <= n; i++) pts.push(heli(r, lerp(a0, a1, i / n)));
			const main = j % 2 === 0;
			poly(pts, PAL.chalk, j === 0 ? 0.8 : main ? 0.5 : 0.24, j === 0 ? 1.5 : main ? 1 : 0.9);
		}
		// The swimmer's track ahead, dotted, at the height it swims over the
		// ramp: the spiral lifted, on in to the axis.
		const pathOn = smooth(span(u, 0.6, 0.72));
		if (pathOn > 0) {
			const tau0 = B.p.tau + 0.03;
			const pts = [];
			for (let tau = tau0; tau <= -TH_BOT; tau += 0.05) {
				const r = R0 * Math.exp(-A_SP * tau);
				pts.push(add3(heli(r, -tau), mul3(upOf(r, -tau), H_OFF)));
			}
			poly(pts, PAL.chalk, 0.5, 1.1, { upto: pathOn, gap: true });
		}
	}

	// ── The body's lines ──
	const hidB = 0.3 * (1 - smooth(span(u, 0.4, 0.5)));
	const relB = 0.004;
	const ringA = lerp(0.8, 0.55, smooth(span(u, 0.33, 0.42)));
	const pens = [];
	// The construction axis, inside the body.
	const axA = smooth(span(u, 0, 0.03)) * (1 - smooth(span(u, 0.35, 0.41)));
	if (axA > 0) {
		const pts = [];
		for (let i = 0; i < NS; i += 2) pts.push(B.cen[i]);
		const pen = poly(pts, PAL.chalk, 0.45 * axA, 1, {
			upto: smooth(span(u, 0, 0.03)),
			fog: false,
			hid: 0.9,
			rel: relB
		});
		if (pen && u < 0.03) pens.push(pen);
	}
	// A screen size, so the tail's rings and lines go when they are dust.
	const pxR = (i) => {
		const q = Q[i * NPHI];
		const q2 = Q[i * NPHI + NPHI / 2];
		return Math.hypot(q[0] - q2[0], q[1] - q2[1]) / 2;
	};
	// The rings, each written round from the top of its section.
	for (const r of RINGS) {
		const p = ringP(r);
		if (p <= 0) continue;
		if (p >= 1 && pxR(r.i) < (r.cap ? 1.2 : 2.4)) continue;
		const flash = p < 1 ? 1 : 1 - smooth(span(u, r.u0 + r.d, r.u0 + r.d + 0.03));
		const al = (r.cap ? 0.95 : ringA) + 0.15 * flash;
		const wd = r.cap ? 1.6 : 1.15;
		const n = Math.ceil(NPHI * p);
		const k0 = NPHI / 4;
		// A small finished ring in fewer, longer chords.
		const pr = pxR(r.i);
		const st = p < 1 ? 1 : pr < 7 ? 4 : pr < 16 ? 2 : 1;
		for (let m = 0; m < n; m += st) {
			const a = Q[r.i * NPHI + ((k0 + m) % NPHI)];
			const f = Math.min(st, NPHI * p - m);
			let b = Q[r.i * NPHI + ((k0 + m + st) % NPHI)];
			if (f < 1) b = lerp3n(a, b, f);
			seg(a, b, PAL.chalk, al, wd, hidB, relB);
			if (m + st >= n && p < 1) pens.push(b);
		}
	}
	// The generatrices, nose to tip, one after another round the body; where
	// the body is a few pixels across, only every second or fourth of them.
	for (let j = 0; j < NGEN; j++) {
		const g0 = GEN0 + j * GEN_STEP;
		const p = smooth(span(u, g0, g0 + GEN_D));
		if (p <= 0) continue;
		const k = j * GEN_EVERY;
		const need = j % 4 === 0 ? 1.1 : j % 2 === 0 ? 3 : 6;
		const end = (NS - 1) * p;
		if (p >= 1) {
			// Written: in chords of at least 5 px on the board.
			let ia = 0;
			for (let i = 1; i < NS; i++) {
				const a = Q[ia * NPHI + k];
				const b = Q[i * NPHI + k];
				if (i < NS - 1 && Math.hypot(b[0] - a[0], b[1] - a[1]) < 5) continue;
				if (pxR(ia) >= need || pxR(i) >= need) seg(a, b, PAL.chalk, 0.7, 1.1, hidB, relB);
				ia = i;
			}
			continue;
		}
		for (let i = 0; i < NS - 1 && i < end; i++) {
			const a = Q[i * NPHI + k];
			let b = Q[(i + 1) * NPHI + k];
			const f = Math.min(1, end - i);
			if (f < 1) b = lerp3n(a, b, f);
			seg(a, b, PAL.chalk, 0.7, 1.1, hidB, relB);
			if (i + 1 >= end) pens.push(b);
		}
	}
	// The contour: where the surface's normal meets the line of sight.
	const silP = smooth(span(u, SIL[0], SIL[1]));
	if (silP > 0) {
		const eye = cam.pos;
		const sides = [[], []];
		const end = (NS - 2) * silP;
		const fac = new Float64Array(NPHI);
		for (let i = 1; i < NS - 1 && i <= end + 1; i++) {
			for (let k = 0; k < NPHI; k++) {
				const ds = sub3(P[(i + 1) * NPHI + k], P[(i - 1) * NPHI + k]);
				const dp = sub3(P[i * NPHI + ((k + 1) % NPHI)], P[i * NPHI + ((k + NPHI - 1) % NPHI)]);
				fac[k] = dot(cross(ds, dp), sub3(eye, P[i * NPHI + k]));
			}
			const got = [null, null];
			for (let k = 0; k < NPHI; k++) {
				const f0 = fac[k];
				const f1 = fac[(k + 1) % NPHI];
				if (f0 < 0 === f1 < 0) continue;
				const side = f0 < 0 ? 0 : 1;
				if (got[side]) continue;
				const tt = f0 / (f0 - f1);
				got[side] = lerp3n(P[i * NPHI + k], P[i * NPHI + ((k + 1) % NPHI)], tt);
			}
			for (let sd = 0; sd < 2; sd++) {
				if (got[sd]) sides[sd].push(cam.project(got[sd]));
				else if (sides[sd].length) sides[sd].push(null);
			}
		}
		for (const S of sides)
			for (let i = 0; i < S.length - 1; i++)
				if (S[i] && S[i + 1]) seg(S[i], S[i + 1], PAL.chalk, 0.95, 1.7, 0, relB);
	}
	ink.flush(ctx);

	// The pens: where the lines are being written.
	for (const q of pens) disc(ctx, q[0], q[1], 1.7, { fill: PAL.chalk, alpha: 0.9 });
	// The spark at the midpiece, then its lit point.
	const spark = span(u, 0.415, 0.43) * (1 - 0.6 * smooth(span(u, 0.44, 0.52)));
	if (spark > 0) {
		const P8 = B.cen[idxOf(8)];
		const q = cam.project(P8);
		const hid = q[2] > NEAR && behind(Z, q[0], q[1], q[2] - 0.6, relB);
		lit3(ctx, cam, P8, 2.4 * wOf(q[2]), spark * (hid ? 0.35 : 0.85));
	}
}
