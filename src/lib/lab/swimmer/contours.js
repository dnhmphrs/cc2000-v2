// ── log-swimmer · contours ───────────────────────────────────────────────────
// The swimmer SURVEYED: first a map, seen from straight above — the body's
// thickness drawn as nested level contours, the paddle head's ovals, the
// midpiece's island, the tail's thin lines ending one by one — then the map
// RAISED: each contour lifted to its own height while the lens tilts from
// plan into perspective, so the contours become the surface's slices, and the
// generatrices are drawn through them: the map's FALL LINES, square to every
// contour. Then it swims up the critical line: ζ(½ + it) traced in the
// complex plane, lifted over t into a ribbon whose loops stack, to its first
// zero, where the curve passes through the origin.
//
// The run, beat by beat (u = progress, 21 s):
//   0.00–0.17  THE MAP, straight down, the lens near-orthographic (14°): the
//              outline (level 0) written from the nose down both sides to
//              the tip, then the levels 0.09, 0.18 … 0.72 one after another,
//              each from its nose end: the head's nested ovals (stepping at
//              the acrosome's edge, two-thirds back), the col at the neck
//              where the higher levels part into two islands (head and
//              midpiece), the tail's three lines ending in turn as it
//              tapers; spot heights at the two summits.
//   0.17–0.31  THE RAISE: a plateau rises under the map and leaves each
//              contour behind at its own height (the surface min(z, v)), the
//              underside's copies sinking the same way; the lens tilts from
//              plan to perspective and widens to 38° as it closes (the map
//              tilts away like a table seen from a chair), round toward the
//              nose.
//   0.285–0.36 THE GENERATRICES: the fall lines, each from the crest down one
//              side, round the rim and up the underside — on the head seeded
//              evenly round its outline and gathering toward the summit, in
//              turn from the summit outward; then the neck, the midpiece and
//              the tail, where they are the sections. Contours and fall lines
//              cross square: the net of the surface.
//   0.34–0.39  the CONTOUR (silhouette) drawn bold, nose to tip; the slices
//              and the fall lines dim to a working set.
//   0.385–0.45 life: a gold spark at the midpiece; the beat starts at the
//              neck and runs down the tail, the body starts to roll, moves;
//              the lens swings alongside and above.
//   0.45–0.54  the lens rises to the plan of the complex plane; 0.485–0.58
//              its axes, and ζ(½ + it) written from t = 0 round its loops,
//              every one through the origin, to t = 35; the swimmer small at
//              its foot, on the tangent at t = 0.
//   0.575–0.675 THE LIFT: the curve rises over t, the axis through 0 grows,
//              the rulings from the axis to the curve are drawn bottom up —
//              a ribbon whose loops stack, pinched to the axis at each zero;
//              the zeros separate up the axis, the first one lit; the lens
//              tilts from the plan to the stack seen from its side.
//   0.675–1.00 the lens comes down behind the swimmer, a little above it and
//              to one side, looking up the ribbon to the zero; it swims onto
//              the curve and round its first loop, gathering pace, climbing
//              the ribbon's edge; 0.985 it reaches the axis at t = 14.1347…,
//              where ζ = 0, and the zero flares.
//
// What is EXACT: ζ(½ + it), by Euler–Maclaurin (20 terms and ten Bernoulli
// corrections; ζ(2) = π²/6 to 2e-16, ζ(½) = −1.4603545…, at t = 10 it agrees
// with the alternating η series to 1e-8); the zeros, found from the curve
// itself (minima of |ζ| refined by golden section, |ζ| < 2e-13 there:
// 14.134725142, 21.022039639, 25.010857580, 30.424876126, 32.935061588); the
// curve sampled every 3 units of its lifted length and through each zero;
// the lift, the curve (S·Re ζ, K·t, −S·Im ζ) and the ruled ribbon from the
// axis to it (the segment from 0 to ζ at each height t), so its width is |ζ|
// and it meets the axis exactly at the zeros; the swimmer's path, the lifted
// curve itself by arc length (the body riding RIDE above the edge), entered
// along the exact tangent at t = 0; the contours, level sets of the body's
// thickness (y = a·√(1 − (c/b)^{2/p}) at each station), their island ends
// solved for; the fall lines, the gradient flow of that thickness traced
// numerically (steps of 0.02); the raise, the clamped surface min(z, v); the
// silhouette, where the surface normal (with its taper term) meets the line
// of sight, solved per station; hidden lines by two software depth buffers
// (the body's own hides its far side; the ribbon's leaves the body faint and
// dashed behind it, and the object's own far side faint and dashed).
// What is a PICTURE: the body's proportions (head 5 × 3 × 1.5, its section a
// flattened lens (a cos φ, b·sgn(sin φ)|sin φ|^1.8) going over to a circle
// at the neck, the acrosome a 0.05 lip over its front two-thirds; neck;
// midpiece 4 × 1; flagellum 45, tapering); the beat, a travelling wave of the
// flagellum's tangent angle (amplitude growing to the tip, a wavelength and a
// half on the tail), integrated so the tail keeps its length, the whole
// turned so its mean direction is the heading (which yaws the head against
// it), in a plane that rolls with the body; the tail trailing along the swum
// path; the scales S = 80 and K = 10, chosen.

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
	disc,
	bloom
} from '../log/board.js';
import { NEAR, makeDepth, lerp3, lit3 } from '../log/space.js';

export const meta = {
	title:
		'contours: the body mapped by its thickness, the map raised — up ζ(½ + it) to its first zero',
	order: 7,
	seconds: 21,
	three: false
};

const SEC = 21;
const HALF_PI = Math.PI / 2;

// ── ζ(½ + it), by Euler–Maclaurin ────────────────────────────────────────────
// ζ(s) = Σ_{n<N} n^−s + N^{1−s}/(s − 1) + N^−s/2
//        + Σ_k B_{2k}/(2k)! · s(s+1)…(s+2k−2) · N^{−s−2k+1}.
const BERN = [
	1 / 6,
	-1 / 30,
	1 / 42,
	-1 / 30,
	5 / 66,
	-691 / 2730,
	7 / 6,
	-3617 / 510,
	43867 / 798,
	-174611 / 330
];
function zeta(t, sr = 0.5) {
	const N = 20;
	let re = 0;
	let im = 0;
	for (let n = 1; n < N; n++) {
		const l = Math.log(n);
		const m = Math.exp(-sr * l);
		re += m * Math.cos(t * l);
		im -= m * Math.sin(t * l);
	}
	const lN = Math.log(N);
	const mN = Math.exp(-sr * lN);
	const Nr = mN * Math.cos(t * lN);
	const Ni = -mN * Math.sin(t * lN);
	const ar = sr - 1;
	const d = ar * ar + t * t;
	re += (N * Nr * ar + N * Ni * t) / d;
	im += (N * Ni * ar - N * Nr * t) / d;
	re += Nr / 2;
	im += Ni / 2;
	let pr = sr;
	let pi = t;
	let fact = 2;
	let Np = 1 / N;
	for (let k = 1; k <= BERN.length; k++) {
		const c = (BERN[k - 1] / fact) * Np;
		re += c * (pr * Nr - pi * Ni);
		im += c * (pr * Ni + pi * Nr);
		for (let j = 2 * k - 1; j <= 2 * k; j++) {
			const xr = sr + j;
			const nr = pr * xr - pi * t;
			pi = pr * t + pi * xr;
			pr = nr;
		}
		fact *= (2 * k + 1) * (2 * k + 2);
		Np /= N * N;
	}
	return [re, im];
}
// A zero of ζ(½ + it) near t0: |ζ| minimised by golden section.
function zeroNear(t0, h) {
	const g = (Math.sqrt(5) - 1) / 2;
	const ab = (t) => Math.hypot(...zeta(t));
	let a = t0 - h;
	let b = t0 + h;
	for (let k = 0; k < 70; k++) {
		const c = b - g * (b - a);
		const d = a + g * (b - a);
		if (ab(c) < ab(d)) b = d;
		else a = c;
	}
	return (a + b) / 2;
}

// ── The object: the curve lifted over t, and its ribbon ──────────────────────
const S_Z = 80; // world units to one of ζ
const K_T = 10; // height per unit of t
const T_MAX = 35;
const RIDE = 1.1; // the body's axis above the ribbon's edge
const C_STEP = 3; // the curve, sampled every this much lifted length
const R_STEP = 17; // a ruling every this much
const D_STEP = 30; // the depth buffer's strips

const OBJ = (() => {
	const DT = 0.004;
	const n = Math.round(T_MAX / DT);
	const RE = new Float64Array(n + 1);
	const IM = new Float64Array(n + 1);
	for (let i = 0; i <= n; i++) [RE[i], IM[i]] = zeta(i * DT);
	const zeros = [];
	for (let i = 1; i < n; i++) {
		const a = Math.hypot(RE[i], IM[i]);
		if (a < 0.05 && a <= Math.hypot(RE[i - 1], IM[i - 1]) && a < Math.hypot(RE[i + 1], IM[i + 1]))
			zeros.push(zeroNear(i * DT, DT));
	}
	// t-values every `step` of the lifted curve's length (and its ends).
	const every = (step) => {
		const ts = [0];
		let acc = 0;
		for (let i = 1; i <= n; i++) {
			acc += Math.hypot(S_Z * (RE[i] - RE[i - 1]), K_T * DT, S_Z * (IM[i] - IM[i - 1]));
			if (acc >= step) {
				ts.push(i * DT);
				acc = 0;
			}
		}
		if (ts[ts.length - 1] < T_MAX - 1e-9) ts.push(T_MAX);
		return ts;
	};
	const pack = (ts) => {
		const A = new Float64Array(ts.length * 3);
		ts.forEach((t, k) => {
			const z = zeta(t);
			A[3 * k] = t;
			A[3 * k + 1] = z[0];
			A[3 * k + 2] = z[1];
		});
		return A;
	};
	const ct = every(C_STEP)
		.concat(zeros)
		.sort((a, b) => a - b);
	const rt = every(R_STEP).filter((t) => zeros.every((z) => Math.abs(z - t) > 0.04));
	return {
		curve: pack(ct),
		rul: pack(rt),
		dep: pack(
			every(D_STEP)
				.concat(zeros)
				.sort((a, b) => a - b)
		),
		zeros
	};
})();
const ZERO1 = OBJ.zeros[0];

// ── The path: the tangent at t = 0, then the lifted curve, by arc length ─────
// σ < 0 on the tangent line, σ = 0 at ζ(½), σ_zero at the first zero.
const PATH = (() => {
	const DT = 0.002;
	const n = Math.round(15.6 / DT);
	const X = new Float64Array(n + 1);
	const Y = new Float64Array(n + 1);
	const Zc = new Float64Array(n + 1);
	const SIG = new Float64Array(n + 1);
	for (let i = 0; i <= n; i++) {
		const t = i * DT;
		const z = zeta(t);
		X[i] = S_Z * z[0];
		Y[i] = K_T * t;
		Zc[i] = -S_Z * z[1];
		if (i) SIG[i] = SIG[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1], Zc[i] - Zc[i - 1]);
	}
	const e = 1e-5;
	const z0 = zeta(0);
	const z1 = zeta(e);
	const F0 = norm([S_Z * (z1[0] - z0[0]), K_T * e, -S_Z * (z1[1] - z0[1])]);
	const j = Math.floor(ZERO1 / DT);
	const zz = zeta(ZERO1);
	const sigZero = SIG[j] + Math.hypot(S_Z * zz[0] - X[j], K_T * ZERO1 - Y[j], -S_Z * zz[1] - Zc[j]);
	return { X, Y, Z: Zc, SIG, n, F0, sigZero };
})();
// The path at σ with the heights scaled by λ (the lift): o.p, o.f (forward).
function pathAt(sig, lam, o) {
	const { X, Y, Z, SIG, n, F0 } = PATH;
	let px;
	let py;
	let pz;
	let fx;
	let fy;
	let fz;
	if (sig <= 0) {
		px = X[0] + F0[0] * sig;
		py = Y[0] + F0[1] * sig;
		pz = Z[0] + F0[2] * sig;
		[fx, fy, fz] = F0;
	} else {
		let lo = 0;
		let hi = n;
		if (sig >= SIG[n]) lo = n - 1;
		else
			while (hi - lo > 1) {
				const m = (lo + hi) >> 1;
				if (SIG[m] <= sig) lo = m;
				else hi = m;
			}
		const j = lo;
		const L = SIG[j + 1] - SIG[j];
		const f = L > 0 ? (sig - SIG[j]) / L : 0;
		px = lerp(X[j], X[j + 1], f);
		py = lerp(Y[j], Y[j + 1], f);
		pz = lerp(Z[j], Z[j + 1], f);
		fx = X[j + 1] - X[j];
		fy = Y[j + 1] - Y[j];
		fz = Z[j + 1] - Z[j];
	}
	fy *= lam;
	const fl = Math.hypot(fx, fy, fz) || 1;
	o.p[0] = px;
	o.p[1] = lam * py + RIDE;
	o.p[2] = pz;
	o.f[0] = fx / fl;
	o.f[1] = fy / fl;
	o.f[2] = fz / fl;
	return o;
}

// ── The body: distance s back from the nose ──────────────────────────────────
const L_HEAD = 5;
const S_CAP = (2 / 3) * L_HEAD; // the acrosome's edge
const S_NECK = 5.5;
const S_J = 9.2; // the end of the midpiece: the flagellum's joint
const LEN = 54;
const R_NECK = 0.34;
// The section at s: half-axes [a, b] — a across the head's broad face (the
// beat's plane), b through its thickness — and its exponent p: the section is
// (a cos φ, b·sgn(sin φ)|sin φ|^p), an ellipse at p = 1, on the head a flatter
// lens (p = 1.8) whose faces are nearly flat and whose rim is thin.
function profile(s) {
	if (s <= L_HEAD) {
		const x = s / L_HEAD;
		const egg = (x0, m) =>
			x <= x0
				? m * Math.sqrt(Math.max(0, 1 - ((x0 - x) / x0) ** 2))
				: R_NECK + (m - R_NECK) * Math.pow(Math.max(0, 1 - ((x - x0) / (1 - x0)) ** 2.2), 0.6);
		const lip = 0.05 * smooth(s / 0.6) * (1 - smooth(span(s, S_CAP - 0.3, S_CAP + 0.12)));
		return [egg(0.4, 1.5) + lip, egg(0.52, 0.75) + lip, lerp(1.8, 1, smooth(span(s, 3.6, 5)))];
	}
	let r;
	if (s < S_NECK) r = R_NECK;
	else if (s < 6) r = lerp(R_NECK, 0.5, smooth(span(s, S_NECK, 6)));
	else if (s < 8.7) r = 0.5 + 0.02 * Math.sin((Math.PI * (s - 6)) / 2.7);
	else if (s < S_J) r = lerp(0.5, 0.33, smooth(span(s, 8.7, S_J)));
	else if (s < 50) r = lerp(0.33, 0.12, (s - S_J) / (50 - S_J));
	else r = lerp(0.12, 0.03, smooth(span(s, 50, LEN)));
	return [r, r, 1];
}
// The section's height at φ, as a fraction of b.
const secZ = (ph, p) => {
	const sn = Math.sin(ph);
	return Math.sign(sn) * Math.pow(Math.abs(sn), p);
};
const ST = [];
for (let s = 0; s <= L_HEAD + 1e-9; s += 0.1) ST.push(+s.toFixed(4));
for (let s = 5.2; s <= S_J + 1e-9; s += 0.2) ST.push(+s.toFixed(4));
for (let s = 10; s <= LEN + 1e-9; s += 1) ST.push(+s.toFixed(4));
const NS = ST.length;
const PA = new Float64Array(NS);
const PB = new Float64Array(NS);
const PP = new Float64Array(NS);
const DA = new Float64Array(NS); // da/ds
const DB = new Float64Array(NS);
ST.forEach((s, i) => {
	[PA[i], PB[i], PP[i]] = profile(s);
	const h = 0.02;
	const p0 = profile(Math.max(0, s - h));
	const p1 = profile(Math.min(LEN, s + h));
	const d = Math.min(LEN, s + h) - Math.max(0, s - h);
	DA[i] = (p1[0] - p0[0]) / d;
	DB[i] = (p1[1] - p0[1]) / d;
});
const V_MAX = Math.max(...PB) + 0.01;
// The station below s and the fraction to the next.
function stationOf(s) {
	let i = 0;
	while (i < NS - 2 && ST[i + 1] <= s) i++;
	return [i, clamp01((s - ST[i]) / (ST[i + 1] - ST[i]))];
}

// The contours: levels of the thickness, c = 0, 0.09 … 0.72. Each level is
// islands, where b(s) > c; each island one branch at +y (its mirror at −y)
// from the end where b = c to the other: y = a·√(1 − (c/b)^{2/p}).
const LEVELS = Array.from({ length: 9 }, (_, k) => 0.09 * k);
const CONT = LEVELS.map((c, k) => {
	const yOf = (s) => {
		const [a, b, p] = profile(s);
		return c === 0 ? a : a * Math.sqrt(Math.max(0, 1 - Math.pow(c / b, 2 / p)));
	};
	const edge = (s0, s1) => {
		let lo = s0;
		let hi = s1;
		const inLo = profile(lo)[1] > c;
		for (let q = 0; q < 40; q++) {
			const m = (lo + hi) / 2;
			if (profile(m)[1] > c === inLo) lo = m;
			else hi = m;
		}
		return (lo + hi) / 2;
	};
	const islands = [];
	let cur = null;
	const push = (s, y = yOf(s)) => {
		const [i, f] = stationOf(s);
		cur.push({ s, i, f, y });
	};
	// Near an island's end y goes as a square root: sampled closer there.
	const QS = [0.3, 0.55, 0.8];
	for (let i = 0; i < NS; i++) {
		const inside = c === 0 || PB[i] > c;
		if (inside) {
			if (!cur) {
				cur = [];
				if (i > 0) {
					const sa = edge(ST[i - 1], ST[i]);
					push(sa, 0);
					for (const q of QS) push(sa + (ST[i] - sa) * q * q);
				}
			}
			push(ST[i]);
		} else if (cur) {
			const sb = edge(ST[i - 1], ST[i]);
			for (let q = QS.length - 1; q >= 0; q--) push(sb - (sb - ST[i - 1]) * QS[q] * QS[q]);
			push(sb, 0);
			islands.push(cur);
			cur = null;
		}
	}
	if (cur) islands.push(cur);
	return {
		c,
		k,
		islands: islands.map((pts) => {
			const L = [0];
			for (let j = 1; j < pts.length; j++)
				L.push(L[j - 1] + Math.hypot(pts[j].s - pts[j - 1].s, pts[j].y - pts[j - 1].y));
			return { pts, L, s0: pts[0].s, s1: pts[pts.length - 1].s };
		})
	};
});
// The spot heights: the head's summit and the midpiece's.
const SUMMITS = (() => {
	let ih = 0;
	let im = 0;
	for (let i = 0; i < NS; i++) {
		if (ST[i] <= L_HEAD && PB[i] > PB[ih]) ih = i;
		if (ST[i] > S_NECK && ST[i] < S_J && PB[i] > PB[im]) im = i;
	}
	return [ih, im];
})();
// When each level's islands are written, and how long they take.
const MAP0 = 0.012;
const MAP_STEP = 0.0165;
const mapWin = (k, isl) => {
	const u0 = MAP0 + MAP_STEP * k;
	return [u0, u0 + 0.02 + 0.0006 * (isl.s1 - isl.s0)];
};
// The generatrices through the slices: the FALL LINES of the thickness, the
// map's lines of steepest descent, square to every contour — on the head they
// run from its crest down to the rim, gathering toward the summit; on the
// midpiece and the tail, whose height hardly changes along them, they are the
// sections. Each is drawn down the top, round the rim, and up the underside
// to its crest again.
const H = (s, y) => {
	const [a, b, p] = profile(s);
	const q = a > 0 ? 1 - (y / a) ** 2 : 0;
	return q <= 0 ? 0 : b * Math.pow(q, p / 2);
};
// A fall line traced UP from a point by the rim to the crest: seeded evenly
// round the outline, the lines are evenly spaced where they start and
// gather toward the summit, as a map's hachures do. [s, y, z], rim first.
function fallUp(s0) {
	let s = s0;
	let y = profile(s0)[0] * 0.999;
	const out = [[s, profile(s)[0], 0]];
	const e = 1e-4;
	const step = 0.02;
	for (let k = 1; k < 900; k++) {
		const gs = (H(s + e, y) - H(s - e, y)) / (2 * e);
		const gy = (H(s, y + e) - H(s, y - e)) / (2 * e);
		const g = Math.hypot(gs, gy);
		if (g < 1e-3) break;
		s += (step * gs) / g;
		y += (step * gy) / g;
		if (s <= 0.02 || s >= LEN || y < 0.012) break;
		if (k % 3 === 0) out.push([s, y, H(s, y)]);
	}
	out.push([s, Math.max(0, y), H(s, Math.max(0, y))]);
	return out;
}
// The fall lines as loops on the body, from the crest: down the right side,
// under, up the left — [s, y, z] by the body's symmetries.
const FALLS = (() => {
	// The seeds: round the head's outline by its length, every 0.33; then the
	// neck, the midpiece and the tail.
	const seeds = [];
	let acc = 0.33;
	let ps = 0.06;
	let pa = profile(ps)[0];
	for (let s = 0.07; s < L_HEAD - 0.12; s += 0.01) {
		const a = profile(s)[0];
		acc += Math.hypot(s - ps, a - pa);
		ps = s;
		pa = a;
		if (acc >= 0.33) {
			seeds.push([s, 0]);
			acc = 0;
		}
	}
	[5.25, 5.8, 6.4, 7.0, 7.6, 8.2, 8.8, 9.4].forEach((s0) => seeds.push([s0, 1]));
	for (let s0 = 11.5; s0 < LEN - 1; s0 += 3) seeds.push([s0, 2]);
	let sTop = 0.5;
	for (let s = 0.5; s < L_HEAD; s += 0.01) if (H(s, 0) > H(sTop, 0)) sTop = s;
	const out = [];
	for (const [s0, part] of seeds) {
		const T = fallUp(s0).reverse(); // crest → right rim
		const flip = (A, fy, fz) => A.map(([s, y, z]) => [s, fy * y, fz * z]);
		const pts = T.concat(flip(T, 1, -1).reverse().slice(1))
			.concat(flip(T, -1, -1).slice(1))
			.concat(flip(T, -1, 1).reverse().slice(1));
		out.push({ part, s0, pts });
	}
	// Written from the top, in turn: the head's from the summit outward, then
	// the sections from the neck to the tip.
	const head = out
		.filter((F) => F.part === 0)
		.sort((p, q) => Math.abs(p.s0 - sTop) - Math.abs(q.s0 - sTop));
	const rest = out.filter((F) => F.part > 0);
	return head.concat(rest).map((F, k) => {
		const pts = F.pts.map(([s, y, z]) => {
			const [i, f] = stationOf(s);
			return { i, f, y, z };
		});
		const kk = F.part === 0 ? k : k - head.length;
		const u0 = F.part === 0 ? 0.285 + (0.034 * kk) / head.length : 0.31 + 0.0028 * kk;
		return { pts, u0, u1: u0 + (F.part === 0 ? 0.03 : 0.024) };
	});
})();
const SIL = [0.34, 0.39];
const MD = 16; // the depth grid round a section
const NPHI = 40; // the silhouette's search round a section

// The beat: the flagellum's tangent angle β(s, τ) = B(s) sin(k(s − s_J) − ωτ),
// B growing to the tip, its front running down from the neck.
const K_BEAT = TAU / 30;
const BEAT_HZ = 2.2;
const ROLL_HZ = 0.45;
const V_FRONT = 26;
const T_LIFE = 0.385 * SEC;
const U_SWIM = 0.385;
const U_ARR = 0.985;
const SIG0 = -22; // the nose on the tangent, before the curve

// The head's arc length at u: at rest, then only gathering pace.
function sigmaAt(u) {
	const p = span(u, U_SWIM, U_ARR);
	return SIG0 + (PATH.sigZero - SIG0) * Math.pow(p, 1.6);
}

// ── A frame's work ───────────────────────────────────────────────────────────
// The lens, projecting into a flat buffer: [sx, sy, depth] at o.
function lensOf(cam, w, h, fov) {
	const k = h / 2 / Math.tan((fov * Math.PI) / 360);
	const [px, py, pz] = cam.pos;
	const [rx, ry, rz] = cam.r;
	const [ux, uy, uz] = cam.u;
	const [fx, fy, fz] = cam.f;
	const cx = w / 2;
	const cy = h / 2;
	return (x, y, z, Q, o) => {
		const dx = x - px;
		const dy = y - py;
		const dz = z - pz;
		const zc = dx * fx + dy * fy + dz * fz;
		Q[o + 2] = zc;
		if (zc <= NEAR) return;
		Q[o] = cx + (k * (dx * rx + dy * ry + dz * rz)) / zc;
		Q[o + 1] = cy - (k * (dx * ux + dy * uy + dz * uz)) / zc;
	};
}
// The depth buffer's triangle, from a flat buffer of projected points.
function tri(Z, Q, ia, ib, ic) {
	const s = Z.s;
	const az = Q[ia + 2];
	const bz = Q[ib + 2];
	const cz = Q[ic + 2];
	if (az <= NEAR || bz <= NEAR || cz <= NEAR) return;
	const ax = Q[ia] / s;
	const ay = Q[ia + 1] / s;
	const bx = Q[ib] / s;
	const by = Q[ib + 1] / s;
	const cx = Q[ic] / s;
	const cy = Q[ic + 1] / s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (Math.abs(area) < 1e-9) return;
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
	if (x0 > x1 || y0 > y1) return;
	const ia2 = 1 / az;
	const ib2 = 1 / bz;
	const ic2 = 1 / cz;
	const inv = 1 / area;
	const buf = Z.buf;
	const W = Z.W;
	for (let y = y0; y <= y1; y++) {
		const py = y + 0.5;
		for (let x = x0; x <= x1; x++) {
			const px = x + 0.5;
			const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) * inv;
			if (w0 < -0.03) continue;
			const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) * inv;
			if (w1 < -0.03) continue;
			const w2 = 1 - w0 - w1;
			if (w2 < -0.03) continue;
			const z = 1 / (w0 * ia2 + w1 * ib2 + w2 * ic2);
			const k = y * W + x;
			if (z < buf[k]) buf[k] = z;
		}
	}
}
// Behind the surface? The deepest of the four cells round the point, with a
// slack relative to the depth (rel) and absolute (slack).
function hiddenAt(Z, x, y, z, slack, rel = 0.01) {
	if (!Z.on) return false;
	const s = Z.s;
	const x0 = Math.floor(x / s - 0.5);
	const y0 = Math.floor(y / s - 0.5);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const b = Z.buf;
	const k = y0 * Z.W + x0;
	const m = Math.max(b[k], b[k + 1], b[k + Z.W], b[k + Z.W + 1]);
	return z > m * (1 + rel) + slack;
}
// The ink: segments batched by alpha and width (and front or behind), kept
// as continuous runs while a polyline stays in one batch, so a line is one
// stroked path with joins rather than hundreds of capped pieces.
function makeRuns() {
	const B = new Map();
	let cur = null;
	let lx = 0;
	let ly = 0;
	return {
		seg(alpha, width, back, x0, y0, x1, y1) {
			const a = Math.min(14, Math.round(alpha * 14));
			if (a < 1) {
				cur = null;
				return;
			}
			const wq = Math.max(1, Math.round(width / 0.3));
			const key = a * 4096 + wq * 2 + (back ? 1 : 0);
			let b = B.get(key);
			if (!b) {
				b = { alpha: a / 14, width: wq * 0.3, back, P: [] };
				B.set(key, b);
			}
			if (b !== cur || x0 !== lx || y0 !== ly) b.P.push(NaN, x0, y0);
			b.P.push(x1, y1);
			cur = b;
			lx = x1;
			ly = y1;
		},
		end() {
			cur = null;
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = PAL.chalk;
			for (const b of B.values()) {
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(b.back ? [3, 6] : []);
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length;) {
					if (Number.isNaN(P[i])) {
						ctx.moveTo(P[i + 1], P[i + 2]);
						i += 3;
					} else {
						ctx.lineTo(P[i], P[i + 1]);
						i += 2;
					}
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
			cur = null;
		}
	};
}
// A projected polyline Q[0 … n) into the ink: `upto` segments (the last one
// partial), culled off the board, width by depth, hidden ones faint (hidA)
// and dashed, or gone.
function emit(ink, Q, n, o) {
	const { alpha, width, ref = 0, Z = null, Z2 = null, slack = 0, rel = 0.01, hidA = 0, w, h } = o;
	const upto = Math.min(n - 1, o.upto ?? n - 1);
	ink.end();
	if (alpha < 0.012 || upto <= 0) return;
	for (let i = o.from ?? 0; i < upto; i++) {
		const k = 3 * i;
		const z0 = Q[k + 2];
		const z1 = Q[k + 5];
		if (z0 <= NEAR || z1 <= NEAR) {
			ink.end();
			continue;
		}
		const x0 = Q[k];
		const y0 = Q[k + 1];
		let x1 = Q[k + 3];
		let y1 = Q[k + 4];
		const fr = upto - i;
		if (fr < 1) {
			x1 = x0 + (x1 - x0) * fr;
			y1 = y0 + (y1 - y0) * fr;
		}
		if (
			(x0 < -10 && x1 < -10) ||
			(y0 < -10 && y1 < -10) ||
			(x0 > w + 10 && x1 > w + 10) ||
			(y0 > h + 10 && y1 > h + 10)
		) {
			ink.end();
			continue;
		}
		const zm = (z0 + z1) / 2;
		const mx = (x0 + x1) / 2;
		const my = (y0 + y1) / 2;
		let back = Z ? hiddenAt(Z, mx, my, zm, slack, rel) : false;
		let a = back ? alpha * hidA : alpha;
		if (!back && Z2 && hiddenAt(Z2, mx, my, zm, o.slack2 ?? slack, o.rel2 ?? rel)) {
			back = true;
			a = alpha * (o.hid2 ?? 0);
		}
		if (a < 0.012) {
			ink.end();
			continue;
		}
		const ws = ref ? Math.min(1.9, Math.max(0.5, ref / zm)) : 1;
		ink.seg(a, width * ws * (back ? 0.7 : 1), back, x0, y0, x1, y1);
	}
	ink.end();
}

// ── The lens's poses ─────────────────────────────────────────────────────────
// An orbit round a target: azimuth about y, elevation, distance, field.
function camOf(P, w, h) {
	const ce = Math.cos(P.el);
	const se = Math.sin(P.el);
	const ca = Math.cos(P.az);
	const sa = Math.sin(P.az);
	const dir = [sa * ce, se, ca * ce];
	const up = [-sa * se, ce, -ca * se];
	const cam = camera3({ pos: add3(P.T, mul3(dir, P.dist)), target: P.T, up, fov: P.fov, w, h });
	cam.fov = P.fov;
	cam.dist = P.dist;
	return cam;
}
function mixPose(A, B, t) {
	if (t <= 0) return A;
	if (t >= 1) return B;
	let d = B.az - A.az;
	d -= TAU * Math.round(d / TAU);
	return {
		T: lerp3(A.T, B.T, t),
		az: A.az + d * t,
		el: lerp(A.el, B.el, t),
		dist: A.dist * Math.pow(B.dist / A.dist, t),
		fov: lerp(A.fov, B.fov, t)
	};
}
const F0H = norm([PATH.F0[0], 0, PATH.F0[2]]);
// In the plan the nose points right: the screen's right is the heading.
const AZ_A = Math.atan2(-F0H[2], F0H[0]);

export async function make() {
	const Z = makeDepth(4); // the body
	const ZR = makeDepth(4); // the ribbon
	const ink = makeRuns();
	const Q = new Float64Array(3 * 2048);
	const G = new Float64Array(3 * NS * (MD + 1)); // the body's depth grid, projected
	// The pose's stations: centre, and the frame (T toward the tail, N across
	// the broad face, B through its thickness).
	const CX = new Float64Array(NS * 3);
	const NX = new Float64Array(NS * 3);
	const BX = new Float64Array(NS * 3);
	const TX = new Float64Array(NS * 3);
	const XS = new Float64Array(NS); // the bent body's 2D shape
	const YS = new Float64Array(NS);
	const BETA = new Float64Array(NS);
	const po = { p: [0, 0, 0], f: [0, 0, 0] };
	const cosD = Array.from({ length: MD + 1 }, (_, j) => Math.cos((TAU * j) / MD));
	// The sections' heights on the depth grid.
	const SD = new Float64Array(NS * (MD + 1));
	for (let i = 0; i < NS; i++)
		for (let j = 0; j <= MD; j++) SD[i * (MD + 1) + j] = secZ((TAU * j) / MD, PP[i]);
	const phS = Array.from({ length: NPHI + 1 }, (_, j) => (TAU * j) / NPHI);
	const UP = [0, 1, 0];

	// The body at time T: its head at σ, the beat τ seconds in.
	function pose(sig, lam, tau) {
		// The beat, as tangent angles, turned so the mean is the heading.
		const ramp = smooth(tau / 1.2);
		let mean = 0;
		for (let i = 0; i < NS; i++) {
			const s = ST[i];
			let b = 0;
			if (s > S_J && tau > 0) {
				const x = (s - S_J) / (LEN - S_J);
				const env = smooth((V_FRONT * tau - (s - S_J)) / 8) * ramp;
				b = (0.14 + 0.8 * x) * env * Math.sin(K_BEAT * (s - S_J) - TAU * BEAT_HZ * tau);
			}
			BETA[i] = b;
			const ds = i === 0 ? 0 : s - ST[i - 1];
			mean += b * ds;
		}
		mean /= LEN;
		XS[0] = 0;
		YS[0] = 0;
		for (let i = 1; i < NS; i++) {
			const bm = (BETA[i] + BETA[i - 1]) / 2 - mean;
			const ds = ST[i] - ST[i - 1];
			XS[i] = XS[i - 1] + Math.cos(bm) * ds;
			YS[i] = YS[i - 1] + Math.sin(bm) * ds;
		}
		const rho = (TAU * ROLL_HZ * tau * tau) / (tau + 1.5);
		const cr = Math.cos(rho);
		const sr = Math.sin(rho);
		for (let i = 0; i < NS; i++) {
			pathAt(sig - XS[i], lam, po);
			const f = po.f;
			const U = norm(sub3(UP, mul3(f, dot(UP, f))));
			const Nb = cross(f, U); // = cross(B, T) with T = −f
			const N = add3(mul3(Nb, cr), mul3(U, sr));
			const B = add3(mul3(Nb, -sr), mul3(U, cr));
			const k = 3 * i;
			CX[k] = po.p[0] + YS[i] * N[0];
			CX[k + 1] = po.p[1] + YS[i] * N[1];
			CX[k + 2] = po.p[2] + YS[i] * N[2];
			NX[k] = N[0];
			NX[k + 1] = N[1];
			NX[k + 2] = N[2];
			BX[k] = B[0];
			BX[k + 1] = B[1];
			BX[k + 2] = B[2];
		}
		// The frames from the bent centreline: T along it, N kept across.
		for (let i = 0; i < NS; i++) {
			const a = 3 * Math.max(0, i - 1);
			const b = 3 * Math.min(NS - 1, i + 1);
			const T = norm([CX[b] - CX[a], CX[b + 1] - CX[a + 1], CX[b + 2] - CX[a + 2]]);
			const k = 3 * i;
			const n0 = [NX[k], NX[k + 1], NX[k + 2]];
			const N = norm(sub3(n0, mul3(T, dot(n0, T))));
			const B = cross(T, N);
			TX[k] = T[0];
			TX[k + 1] = T[1];
			TX[k + 2] = T[2];
			NX[k] = N[0];
			NX[k + 1] = N[1];
			NX[k + 2] = N[2];
			BX[k] = B[0];
			BX[k + 1] = B[1];
			BX[k + 2] = B[2];
		}
	}
	// A point on the body: station i (+ fraction f), across y, through z.
	const bodyPt = (i, f, y, z, P, o, buf = Q) => {
		const k = 3 * i;
		const j = 3 * Math.min(NS - 1, i + 1);
		const g = 1 - f;
		P(
			g * CX[k] + f * CX[j] + y * (g * NX[k] + f * NX[j]) + z * (g * BX[k] + f * BX[j]),
			g * CX[k + 1] +
				f * CX[j + 1] +
				y * (g * NX[k + 1] + f * NX[j + 1]) +
				z * (g * BX[k + 1] + f * BX[j + 1]),
			g * CX[k + 2] +
				f * CX[j + 2] +
				y * (g * NX[k + 2] + f * NX[j + 2]) +
				z * (g * BX[k + 2] + f * BX[j + 2]),
			buf,
			o
		);
	};

	// The lens at u: the map's plan, the raised body, the complex plane's
	// plan, then the chase.
	function lensAt(u, w, h, sig, lam) {
		const at = (q) => pathAt(q, lam, { p: [0, 0, 0], f: [0, 0, 0] }).p;
		const tanOf = (deg) => Math.tan((deg * Math.PI) / 180);
		// The map, straight down, near-orthographic; the raised body; the
		// generatrices' three-quarter view from the nose's side.
		const A = { T: at(sig - 6.5), az: AZ_A, el: HALF_PI, dist: 5.6 / tanOf(7), fov: 14 };
		const B = { T: at(sig - 6.5), az: AZ_A + 0.7, el: 0.5, dist: 17, fov: 38 };
		const B2 = { T: at(sig - 8), az: AZ_A + 1.05, el: 0.36, dist: 21, fov: 40 };
		// Life: alongside and above, the whole body beating.
		const B3 = { T: at(sig - 20), az: AZ_A - 0.25, el: 0.62, dist: 52, fov: 40 };
		// The complex plane, straight down; then the stack, from its side.
		const C = {
			T: [S_Z * 0.62, 0, -S_Z * 0.02],
			az: 0,
			el: HALF_PI,
			dist: 172 / tanOf(20),
			fov: 40
		};
		const E = { T: [S_Z * 0.55, K_T * 15, S_Z * 0.05], az: -0.85, el: 0.3, dist: 720, fov: 40 };
		// The chase: behind the swimmer, looking past it to the zero.
		const head = at(sig);
		const back = at(sig - 45);
		const fwd = at(sig + 75);
		const goal = [0, lam * K_T * ZERO1, 0];
		const cx = fwd[0] - back[0];
		const cz = fwd[2] - back[2];
		const cl = Math.hypot(cx, cz) || 1;
		const gx = goal[0] - head[0];
		const gz = goal[2] - head[2];
		const gl = Math.hypot(gx, gz) || 1;
		// toward the zero, a little to the side (so the swimmer is not in front
		// of the axis); on top of it, along the way it is going
		const wg = smooth(gl / 40);
		const OFF = 0.38;
		const ox = (gx / gl) * Math.cos(OFF) - (gz / gl) * Math.sin(OFF);
		const oz = (gx / gl) * Math.sin(OFF) + (gz / gl) * Math.cos(OFF);
		let lx = (cx / cl) * (1 - wg) + ox * wg;
		let lz = (cz / cl) * (1 - wg) + oz * wg;
		const ll = Math.hypot(lx, lz) || 1;
		lx /= ll;
		lz /= ll;
		// The eye a little above the swimmer and back from it, looking up the
		// ribbon to the zero: under the sheets that overhang it, over the ones
		// it has climbed.
		const sep = Math.hypot(goal[0] - head[0], goal[1] - head[1], goal[2] - head[2]);
		const back3 = 0.72 * sep + 46;
		const eye = [head[0] - lx * back3, head[1] + 0.2 * back3, head[2] - lz * back3];
		const tD = lerp3(head, goal, 0.42);
		const dv = sub3(eye, tD);
		const dd = Math.hypot(...dv);
		const D = {
			T: tD,
			az: Math.atan2(dv[0], dv[2]),
			el: Math.asin(dv[1] / dd),
			dist: dd,
			fov: 44
		};
		let P = mixPose(A, B, smooth(span(u, 0.165, 0.31)));
		P = mixPose(P, B2, smooth(span(u, 0.3, 0.385)));
		P = mixPose(P, B3, smooth(span(u, 0.39, 0.445)));
		// Up to the plan: the aim leaves the swimmer only as fast as the lens
		// backs off (its share of the distance gained), so the swimmer stays
		// in frame on the way up instead of sliding off a corner.
		const kC = smooth(span(u, 0.45, 0.535));
		if (kC > 0 && kC < 1) {
			const dC = P.dist * Math.pow(C.dist / P.dist, kC);
			const tW = (dC - P.dist) / (C.dist - P.dist);
			P = mixPose(P, { ...C, T: lerp3(P.T, C.T, tW / kC) }, kC);
		} else P = mixPose(P, C, kC);
		P = mixPose(P, E, smooth(span(u, 0.575, 0.675)));
		P = mixPose(P, D, smooth(span(u, 0.675, 0.8)));
		return camOf(P, w, h);
	}

	return {
		render(ctx, w, h, T) {
			const u = clamp01(T / SEC);
			const v = V_MAX * smooth(span(u, 0.175, 0.3)); // the raise
			const raised = v >= V_MAX - 1e-6;
			const hz = (z) => (raised ? z : Math.max(-v, Math.min(v, z)));
			const lam = smooth(span(u, 0.575, 0.675)); // the lift
			const tau = Math.max(0, T - T_LIFE);
			const sig = sigmaAt(u);
			pose(sig, lam, tau);
			const cam = lensAt(u, w, h, sig, lam);
			const P = lensOf(cam, w, h, cam.fov);
			const ref = cam.dist;
			const kpx = h / 2 / Math.tan((cam.fov * Math.PI) / 360);

			// ── The depth buffers: the body, and the ribbon once it is lifted ──
			Z.reset(w, h);
			ZR.reset(w, h);
			for (let i = 0; i < NS; i++)
				for (let j = 0; j <= MD; j++)
					bodyPt(
						i,
						0,
						PA[i] * cosD[j],
						hz(PB[i] * SD[i * (MD + 1) + j]),
						P,
						3 * (i * (MD + 1) + j),
						G
					);
			for (let i = 0; i < NS - 1; i++)
				for (let j = 0; j < MD; j++) {
					const a = 3 * (i * (MD + 1) + j);
					const b = a + 3 * (MD + 1);
					tri(Z, G, a, b, b + 3);
					tri(Z, G, a, b + 3, a + 3);
				}
			const ribbon = lam > 0.03;
			if (ribbon) {
				const D = OBJ.dep;
				const nD = D.length / 3;
				const R = 3; // pieces along each ruling
				for (let k = 0; k < nD; k++) {
					const t = D[3 * k];
					for (let r = 0; r <= R; r++) {
						const f = r / R;
						P(
							f * S_Z * D[3 * k + 1],
							lam * K_T * t,
							-f * S_Z * D[3 * k + 2],
							Q,
							3 * (k * (R + 1) + r)
						);
					}
				}
				for (let k = 0; k < nD - 1; k++)
					for (let r = 0; r < R; r++) {
						const a = 3 * (k * (R + 1) + r);
						const b = a + 3 * (R + 1);
						tri(ZR, Q, a, b, b + 3);
						tri(ZR, Q, a, b + 3, a + 3);
					}
			}

			// ── The object ──
			const plan = span(u, 0.49, 0.58); // the curve written in the plane
			if (plan > 0) drawObject(ink, P, { u, w, h, ref, lam, plan, ribbon });
			if (!ribbon) ZR.off();

			// ── The body ──
			const headQ = new Float64Array(3);
			P(CX[0], CX[1], CX[2], headQ, 0);
			const ppu = headQ[2] > NEAR ? kpx / headQ[2] : 0; // px per unit at the head
			const detail = smooth(span(ppu, 3, 9));
			const o = {
				w,
				h,
				ref,
				Z,
				slack: 0.04,
				rel: 0.003,
				hidA: 0,
				Z2: ZR,
				hid2: 0.3,
				slack2: 1.5,
				rel2: 0.01
			};

			// The contours, level by level; the map's are written on.
			const after = span(u, SIL[0], SIL[1]);
			for (const L of CONT) {
				const c = L.c;
				const zc = Math.min(c, v);
				const lower = smooth(v / 0.12) * (c > 0 ? 1 : 0);
				const al =
					(L.k === 0 ? 0.95 : 0.8) *
					lerp(1, L.k === 0 ? 0.55 : 0.38, after) *
					(L.k === 0 ? 1 : lerp(0, 1, detail) * lerp(1, L.k % 2 ? 0.45 : 1, 1 - detail));
				const wd = (L.k === 0 ? 1.55 : 1.15) * lerp(1, 0.85, after);
				for (const isl of L.islands) {
					const [u0, u1] = mapWin(L.k, isl);
					const pw = span(u, u0, u1);
					if (pw <= 0) continue;
					const len = pw * isl.L[isl.L.length - 1];
					let m = 0;
					while (m < isl.L.length - 1 && isl.L[m + 1] <= len) m++;
					const upto =
						m >= isl.L.length - 1 ? m : m + (len - isl.L[m]) / (isl.L[m + 1] - isl.L[m] || 1);
					const pts = isl.pts;
					const n = pts.length;
					for (const [sy, sz, a] of [
						[1, 1, 1],
						[-1, 1, 1],
						[1, -1, lower],
						[-1, -1, lower]
					]) {
						if (a <= 0 || (c === 0 && sz < 0)) continue;
						for (let j = 0; j < n; j++)
							bodyPt(pts[j].i, pts[j].f, sy * pts[j].y, sz * zc, P, 3 * j);
						emit(ink, Q, n, { ...o, alpha: al * a, width: wd, upto });
					}
				}
			}
			// The spot heights at the summits, while it is a map.
			const spot = span(u, 0.15, 0.17) * (1 - span(u, 0.28, 0.33));

			// The generatrices: the fall lines, each written from its top.
			for (const F of FALLS) {
				const pf = span(u, F.u0, F.u1);
				if (pf <= 0) continue;
				const n = F.pts.length;
				for (let j = 0; j < n; j++) {
					const q = F.pts[j];
					bodyPt(q.i, q.f, q.y, hz(q.z), P, 3 * j);
				}
				const al = lerp(0.75, 0.45, after) * lerp(0.35, 1, detail);
				emit(ink, Q, n, { ...o, alpha: al, width: 1.05, upto: pf * (n - 1) });
			}

			// The silhouette: where the normal meets the line of sight.
			if (u >= SIL[0]) {
				const sil = silhouette(cam.pos);
				const ps = span(u, SIL[0], SIL[1]);
				for (const line of sil) {
					const n = line.length / 3;
					for (let j = 0; j < n; j++) P(line[3 * j], line[3 * j + 1], line[3 * j + 2], Q, 3 * j);
					emit(ink, Q, n, { ...o, alpha: 0.95, width: 1.7, upto: ps * (n - 1), slack: 0.05 });
				}
			}
			ink.flush(ctx);

			if (spot > 0)
				for (const i of SUMMITS) {
					bodyPt(i, 0, 0, Math.min(PB[i], v), P, 0);
					if (Q[2] > NEAR) disc(ctx, Q[0], Q[1], 2.6, { fill: PAL.chalk, alpha: 0.85 * spot });
				}

			// Life: a spark at the midpiece.
			const spark = span(T, T_LIFE - 0.3, T_LIFE) * (1 - span(T, T_LIFE + 0.2, T_LIFE + 1.4));
			if (spark > 0) {
				const im = SUMMITS[1];
				const q = lit3(
					ctx,
					cam,
					[CX[3 * im], CX[3 * im + 1], CX[3 * im + 2]],
					2.4 + 1.6 * spark,
					spark
				);
				if (q) bloom(ctx, q[0], q[1], 22 * spark, 'rgba(255, 222, 150, 0.25)', spark);
			}

			// The zeros up the axis: the first one lit, the swimmer's goal.
			if (plan > 0) {
				const zs = OBJ.zeros;
				const on = smooth(span(u, 0.52, 0.58));
				const reach = span(u, U_ARR - 0.03, U_ARR);
				const flare = reach * (1 - span(T, U_ARR * SEC + 0.15, SEC + 1.2) * 0.6);
				for (let n = zs.length - 1; n >= 0; n--) {
					const p = [0, lam * K_T * zs[n], 0];
					P(p[0], p[1], p[2], Q, 0);
					if (Q[2] <= NEAR) continue;
					const back =
						hiddenAt(ZR, Q[0], Q[1], Q[2], 1) || hiddenAt(Z, Q[0], Q[1], Q[2], 0.04, 0.003);
					if (n === 0) {
						const a = on * lerp(0.55, 1, lam) * (back ? 0.5 : 1);
						const r =
							(2.8 + 1.6 * smooth(span(u, 0.8, U_ARR)) + 2 * flare) *
							Math.min(1.6, Math.max(0.7, ref / Q[2]));
						lit3(ctx, cam, p, r, a);
						if (flare > 0) bloom(ctx, Q[0], Q[1], 36 * flare, 'rgba(255, 222, 150, 0.3)', flare);
					} else if (lam > 0.05)
						disc(ctx, Q[0], Q[1], 2.6, {
							fill: PAL.node,
							alpha: on * smooth(lam / 0.4) * (back ? 0.3 : 0.85)
						});
				}
			}
		}
	};

	// The silhouette, per station: the roots of F(φ) = n(φ)·(P(φ) − eye) for
	// the section (a cos φ, b S(φ)), S = sgn(sin φ)|sin φ|^p, whose normal is
	// n = b S′ N + a sin φ B − (a′b cos φ S′ + ab′ sin φ S) T; the two kinds
	// (F rising, F falling) chained along the body and joined round the nose.
	function silhouette(eye) {
		const branch = [[], []];
		let start = -1;
		const out = [];
		let nose = null;
		const flush = () => {
			if (branch[0].length >= 6 && branch[1].length >= 6) {
				if (start === 1 && !nose) nose = [branch[0], branch[1]];
				else out.push(branch[0], branch[1]);
			}
			branch[0] = [];
			branch[1] = [];
			start = -1;
		};
		for (let i = 1; i < NS; i++) {
			const k = 3 * i;
			const dx = CX[k] - eye[0];
			const dy = CX[k + 1] - eye[1];
			const dz = CX[k + 2] - eye[2];
			const al = NX[k] * dx + NX[k + 1] * dy + NX[k + 2] * dz;
			const be = BX[k] * dx + BX[k + 1] * dy + BX[k + 2] * dz;
			const ga = TX[k] * dx + TX[k + 1] * dy + TX[k + 2] * dz;
			const a = PA[i];
			const b = PB[i];
			const p = PP[i];
			const F = (ph) => {
				const c = Math.cos(ph);
				const sn = Math.sin(ph);
				const as = Math.abs(sn);
				const S = Math.sign(sn) * Math.pow(as, p);
				const S1 = p * Math.pow(as, p - 1) * c;
				return (
					b * S1 * al +
					a * sn * be +
					a * b * (c * S1 + sn * S) -
					ga * (DA[i] * b * c * S1 + a * DB[i] * sn * S)
				);
			};
			const roots = [null, null];
			let f0 = F(0);
			for (let j = 1; j <= NPHI; j++) {
				const f1 = F(phS[j]);
				if (f0 < 0 !== f1 < 0) {
					const q = f0 < 0 ? 0 : 1;
					roots[q] = phS[j - 1] + ((phS[j] - phS[j - 1]) * f0) / (f0 - f1);
				}
				f0 = f1;
			}
			if (roots[0] === null || roots[1] === null) {
				flush();
				continue;
			}
			if (start < 0) start = i;
			for (let q = 0; q < 2; q++) {
				const c = Math.cos(roots[q]);
				const S = secZ(roots[q], p);
				for (let d = 0; d < 3; d++)
					branch[q].push(CX[k + d] + a * c * NX[k + d] + b * S * BX[k + d]);
			}
		}
		flush();
		// The first two branches meet round the nose.
		if (nose) {
			const [a, b] = nose;
			const rev = [];
			for (let j = a.length / 3 - 1; j >= 0; j--) rev.push(a[3 * j], a[3 * j + 1], a[3 * j + 2]);
			out.push(rev.concat([CX[0], CX[1], CX[2]], b));
		}
		return out;
	}

	// The critical line's curve: in the plane, then lifted over t, its ribbon
	// ruled from the axis, the axis itself.
	function drawObject(ink, P, { u, w, h, ref, lam, plan, ribbon }) {
		const o = {
			w,
			h,
			ref,
			Z: ZR,
			slack: 1.5,
			hidA: 0.22,
			Z2: Z,
			hid2: 0,
			slack2: 0.04,
			rel2: 0.003
		};
		const axes = smooth(span(u, 0.485, 0.515));
		// The complex plane's axes, faint and dashed (drawn as back lines).
		const ax = (x0, z0, x1, z1, a) => {
			const n = 24;
			for (let j = 0; j <= n; j++) P(lerp(x0, x1, j / n), 0, lerp(z0, z1, j / n), Q, 3 * j);
			emit(ink, Q, n + 1, { ...o, Z: null, alpha: a, width: 1, upto: axes * n });
		};
		const axA = 0.32 * lerp(1, 0.6, lam);
		ax(-S_Z * 1.9, 0, S_Z * 3.2, 0, axA);
		ax(0, S_Z * 2.1, 0, -S_Z * 2.1, axA);
		// The curve on the floor: written along t; after the lift, its shadow.
		const C = OBJ.curve;
		const nC = C.length / 3;
		const tw = T_MAX * smooth(plan);
		let m = 0;
		for (let k = 0; k < nC; k++) {
			P(S_Z * C[3 * k + 1], 0, -S_Z * C[3 * k + 2], Q, 3 * k);
			if (C[3 * k] <= tw) m = k;
		}
		const fr = m < nC - 1 ? (tw - C[3 * m]) / (C[3 * m + 3] - C[3 * m]) : 0;
		const flA = lerp(0.9, 0.2, smooth(lam / 0.5));
		emit(ink, Q, nC, { ...o, alpha: flA, width: lerp(1.6, 1, lam), upto: m + fr, hidA: 0 });
		if (!ribbon) return;
		// The lifted curve.
		const la = smooth(lam / 0.2);
		for (let k = 0; k < nC; k++)
			P(S_Z * C[3 * k + 1], lam * K_T * C[3 * k], -S_Z * C[3 * k + 2], Q, 3 * k);
		emit(ink, Q, nC, { ...o, alpha: 0.92 * la, width: 1.8, hidA: 0.2 });
		// The axis through 0.
		const top = lam * K_T * (T_MAX + 1.5);
		const na = 60;
		for (let j = 0; j <= na; j++) P(0, (top * j) / na, 0, Q, 3 * j);
		emit(ink, Q, na + 1, { ...o, alpha: 0.62 * la, width: 1.3, hidA: 0.25 });
		// The rulings, from the axis to the curve, bottom up.
		const R = OBJ.rul;
		const nR = R.length / 3;
		for (let k = 0; k < nR; k++) {
			const t = R[3 * k];
			const ra = smooth(span(lam, (0.6 * t) / T_MAX, (0.6 * t) / T_MAX + 0.4));
			if (ra <= 0) continue;
			const re = R[3 * k + 1];
			const im = R[3 * k + 2];
			const pieces = Math.max(2, Math.min(8, Math.ceil(Math.hypot(re, im) * 2.5)));
			for (let j = 0; j <= pieces; j++) {
				const f = j / pieces;
				P(f * S_Z * re, lam * K_T * t, -f * S_Z * im, Q, 3 * j);
			}
			emit(ink, Q, pieces + 1, {
				...o,
				alpha: 0.34 * ra * (t > ZERO1 ? 0.65 : 1),
				width: 1,
				upto: ra * pieces,
				hidA: 0
			});
		}
	}
}
