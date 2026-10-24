// ── log-swimmer · implicit ───────────────────────────────────────────────────
// The swimmer as an IMPLICIT SURFACE: the level F = 0.35 of a sum of
// metaballs — an anisotropic blob for the flattened head (a thinner, broader
// one over its front for the acrosome, a small one at its base for the
// neck), a capsule for the midpiece, a chain of ~300 shrinking balls along
// the tail's centreline — revealed as CONTOUR SLICES: plane after plane
// across the body, each slice's level curve found by marching squares and
// written round as the plane passes, the near side bold and the far side
// faint by a software depth buffer of the body built so far. Then the chain
// bends into the beat, and the swimmer swims to the Riemann surface of √z
// and twice round its branch point, coming back to its own sheet.
//
// The run, beat by beat (u = progress, 22 s):
//   0.000–0.045  the head's three blobs, each written round as its three
//                principal sections (nucleus, acrosome, base), the lens
//                close over the head.
//   0.048–0.068  the midpiece's capsule: its end circles, four lines, its
//                axis (the segment it is the distance to).
//   0.064–0.104  the chain: the balls placed one by one from the neck to the
//                tip, shrinking, the lens running down the tail with them.
//   0.112–0.290  the SWEEP, tip to nose: a cutting plane — a square frame,
//                its grid faint, and on it the field's level curves at four
//                other values, the plane as a contour map of the sum — moves
//                up the body; behind it each slice's curve F = ISO is written
//                round; the primitives fade as the surface closes over them.
//                The tail quickly (to 0.17, the lens behind it so its slices
//                read as rings), the midpiece (to 0.20), the head slowly: the
//                lens over the broad face (0.225), round to its edge, where
//                the same slices read thin (0.255), to the front three-
//                quarter (0.285). The acrosome's edge, two-thirds back, is
//                the one bold slice.
//   0.290–0.335  the lens draws back over the whole body.
//   0.335        life: a gold spark at the midpiece; the beat starts at the
//                neck and runs down to the tip (~0.6 s), the roll starts, the
//                swimmer sets off, gathering pace over 2.7 s. From here the
//                tail's slices are marched every frame afresh, on the planes
//                normal to the bent chain, from the balls where the beat has
//                put them.
//   0.398–0.480  the branch point lit; the surface written: 32 rays out from
//                it, then the seven circles |z| = k/7, each written round
//                TWICE before it closes, the rim last, the cut bolder. The
//                lens, behind the swimmer, draws back to take it all in
//                (0.45–0.51) as the swimmer comes in over the rim.
//   0.550        it reaches its circle |z| = ρ at z = ρ on the top sheet; a
//                gold mark is left there.
//   0.550–0.975  twice round the branch point: down the top sheet to the cut
//                (θ = π at 0.656) and through it onto the other sheet — the
//                lens drops to look in between the sheets, through the mouth
//                they open toward the positive reals — under its own mark (θ
//                = 2π at 0.763: the point beneath lit, the fibre over z = ρ
//                dashed between them), up to the cut again (θ = 3π at 0.869),
//                through it onto its own sheet, and home to its mark (θ = 4π
//                at 0.975).
//   0.950–1.000  the lens closes in on the branch point, over the swimmer
//                back on its own sheet.
//
// What is EXACT: the surface — the graph of Re √z over the plane of z, i.e.
// the image of the disc |w| ≤ 1 under w ↦ (w², Re w) — every line on it the
// image of a polar grid line of w (rays arg w = jπ/16, so arg z = jπ/8;
// circles |w| = √(k/7), so |z| = k/7), the two sheets Re w ≷ 0 crossing
// along the negative real axis at height 0 (the cut, Re w = 0) and meeting
// at the branch point w = 0; the path, the circle |z| = ρ lifted
// continuously, w = √ρ·e^{iθ/2} for θ from 0 to 4π — one turn takes w to −w,
// the other sheet; two bring it home — and the line Re z = ρ it comes in on,
// lifted by the principal branch (the top sheet continued past its rim); the
// two marks over z = ρ (w = ±√ρ) and the fibre between them; the surface's
// normal; hidden lines by a depth buffer of the same w-disc. The body: the
// level set of the stated sum, each slice its exact intersection with the
// plane to the grid's resolution (marching squares, linear on the edges),
// the bent tail's slices recomputed from the moved chain every frame.
// What is a PICTURE: the primitives and their weights, calibrated to the
// brief's proportions (head 5 × 3.1 × 1.4, the neck, midpiece ~4 × 1, tail
// 45 thinning 0.73 → 0.22); the acrosome as a second blob, its edge marked;
// the beat — a travelling wave of the tail's tangent angle (5 Hz, λ 28, up
// to 0.8 rad at the tip) in the head's broad plane, integrated so the tail
// keeps its length, the whole turned so the centreline's centroid is astern
// (which yaws the head against it), rolled 0.6 turns a second about its axis
// — and the body laid along the path it has swum (each station at the path's
// point that far back, 6.5 over the sheet); the depth mesh of the body
// (rings of exact surface points by bisection; the tail's round, at rest
// radius), used only to hide lines; the tube's contour, drawn where its
// slices would merge into dots; the heights (0.6 of the plane's scale), the
// sizes, the speed.
//
// Frame cost: see the report (headless 1280 × 800); the board's segments
// batched by alpha and width and chained into paths, the depth buffer at
// 4 px filled by spans.

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
import { NEAR, makeDepth, spline, lit3 } from '../log/space.js';

export const meta = {
	title: 'implicit: metaballs summed and sliced nose to tip — twice round the branch point of √z',
	order: 4,
	seconds: 22,
	three: false
};

const SEC = 22;
const FOV = 36;
const UP = [0, 1, 0];

// ── The field ────────────────────────────────────────────────────────────────
// Each primitive adds w·(1 − q)³ where q < 1, q its squared distance in units
// of its reach; the body is F = ISO. A lone blob's surface sits at SQ of its
// reach, so a primitive is given by its own (lone) surface and its reach is
// that over SQ. Body coordinates: X forward (the nose at 0, the body along
// −X, s = −X the distance back), Y across the head's broad face (the beat's
// plane), Z through its thickness.
const ISO = 0.35;
const SQ = Math.sqrt(1 - Math.cbrt(ISO));
const kern = (q) => {
	const a = 1 - q;
	return a * a * a;
};
const BLOBS = [
	{ s: 2.72, a: 2.3, b: 1.42, c: 0.7, w: 1 }, // the nucleus
	{ s: 1.87, a: 1.7, b: 1.35, c: 0.42, w: 0.55 }, // the acrosome, over the front
	{ s: 4.62, a: 0.75, b: 0.5, c: 0.4, w: 0.45 } // the base, into the neck
].map((o) => ({ ...o, A: o.a / SQ, B: o.b / SQ, C: o.c / SQ }));
const CAPS = { s0: 5.72, s1: 9.52, r: 0.5 };
CAPS.R2 = (CAPS.r / SQ) ** 2;
const S0 = 9.72; // the chain starts here, and the beat bends it from here
const LEN = 54.95;
const S_CAP = 3.35; // the acrosome's edge, two-thirds back
const R_ROOT = 0.36;
const R_TIP = 0.1;
const KAP = 0.9; // a ball's own radius, of the tube's it makes
const SPACE = 0.75; // the chain's spacing, of the local radius
const rTarget = (s) => lerp(R_ROOT, R_TIP, clamp01((s - S0) / (LEN - S0)));
const BALL_S = [];
const BALL_R2 = [];
for (let s = S0; s < LEN - 0.05; s += SPACE * rTarget(s)) {
	BALL_S.push(s);
	BALL_R2.push(((KAP * rTarget(s)) / SQ) ** 2);
}
const NB = BALL_S.length;

// The head, the acrosome and the capsule at a body point.
function fRigid(X, Y, Z) {
	let f = 0;
	if (X > -7.4)
		for (const o of BLOBS) {
			const dx = (X + o.s) / o.A;
			const dy = Y / o.B;
			const dz = Z / o.C;
			const q = dx * dx + dy * dy + dz * dz;
			if (q < 1) f += o.w * kern(q);
		}
	const s = -X;
	if (s > 4.7 && s < 10.6) {
		const d = s < CAPS.s0 ? CAPS.s0 - s : s > CAPS.s1 ? s - CAPS.s1 : 0;
		const q = (d * d + Y * Y + Z * Z) / CAPS.R2;
		if (q < 1) f += kern(q);
	}
	return f;
}
// The chain's balls whose reach can touch station s (by arc length).
function ballWindow(s) {
	let lo = 0;
	let hi = NB;
	while (lo < hi) {
		const m = (lo + hi) >> 1;
		if (BALL_S[m] < s - 1.3) lo = m + 1;
		else hi = m;
	}
	let j = lo;
	while (j < NB && BALL_S[j] < s + 1.3) j++;
	return [lo, j];
}
// The chain at body point (X, Y, Z), its centres at (BX, BY, 0).
function fChain(X, Y, Z, BX, BY, i0, i1) {
	let f = 0;
	const z2 = Z * Z;
	for (let j = i0; j < i1; j++) {
		const dx = X - BX[j];
		const dy = Y - BY[j];
		const q = (dx * dx + dy * dy + z2) / BALL_R2[j];
		if (q < 1) f += kern(q);
	}
	return f;
}
const REST_BX = Float64Array.from(BALL_S, (s) => -s);
const REST_BY = new Float64Array(NB);
const fRest = (X, Y, Z) => {
	const [i0, i1] = ballWindow(-X);
	return fRigid(X, Y, Z) + fChain(X, Y, Z, REST_BX, REST_BY, i0, i1);
};

// ── Marching squares, chained into loops ─────────────────────────────────────
// The level 0 of val[i * (ny + 1) + j] on an nx × ny grid, as closed (or, at
// the edge, open) polylines of grid points [i, j]; every crossing is keyed by
// its grid edge, so two cells meeting on an edge meet on the same point and
// the segments chain without a tolerance. Saddles split by the centre.
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

// A polyline resampled to n + 1 points evenly by length (closed: last = first).
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
// Counter-clockwise in (Y, Z), starting at its top (+Z), so each slice is
// written round the same way from the same side.
function orient(L) {
	let A = 0;
	for (let i = 0; i < L.length - 1; i++) A += L[i][0] * L[i + 1][1] - L[i + 1][0] * L[i][1];
	const P = (A < 0 ? L.slice().reverse() : L.slice()).slice(0, -1);
	let top = 0;
	for (let i = 1; i < P.length; i++) if (P[i][1] > P[top][1]) top = i;
	const R = P.slice(top).concat(P.slice(0, top));
	R.push(R[0]);
	return R;
}

// The body's half-extent from the axis at station s along direction φ in
// the (Y, Z) plane, at rest, by bisection.
function reach(s, phi, f = fRest) {
	const cy = Math.cos(phi);
	const sz = Math.sin(phi);
	if (f(-s, 0, 0) < ISO) return 0;
	let lo = 0;
	let hi = 2.2;
	for (let i = 0; i < 30; i++) {
		const m = (lo + hi) / 2;
		if (f(-s, m * cy, m * sz) >= ISO) lo = m;
		else hi = m;
	}
	return lo;
}
// The nose and the tip, where the axis leaves the surface.
const NOSE = (() => {
	let lo = -1;
	let hi = 1;
	for (let i = 0; i < 40; i++) {
		const m = (lo + hi) / 2;
		if (fRest(-m, 0, 0) >= ISO) hi = m;
		else lo = m;
	}
	return hi;
})();
const TIP = (() => {
	let lo = LEN - 2;
	let hi = LEN + 1;
	for (let i = 0; i < 40; i++) {
		const m = (lo + hi) / 2;
		if (fRest(-m, 0, 0) >= ISO) lo = m;
		else hi = m;
	}
	return lo;
})();

// ── The slices ───────────────────────────────────────────────────────────────
// Head and midpiece (rigid; the head yaws and rolls as one): each station's
// level curve by marching squares at start, chained, oriented, resampled.
// The tail's stations are marched at start at rest (for the generation) and
// again every frame on the planes normal to the bent chain.
const RIGID = [];
for (let s = 0.14; s <= 5.0; s += 0.2) RIGID.push({ s, cell: 0.05, n: 64 });
for (let s = 5.3; s <= 9.55; s += 0.35) RIGID.push({ s, cell: 0.04, n: 36 });
const TAIL = [];
for (let s = S0 + 0.3; s < TIP - 0.1; s += 0.55) TAIL.push({ s });

function sliceAt(s, cell, n, f = fRest) {
	const hy = reach(s, 0, f);
	const hz = reach(s, Math.PI / 2, f);
	const ey = hy * 1.2 + 2.5 * cell;
	const ez = hz * 1.2 + 2.5 * cell;
	const nx = Math.max(8, Math.ceil((2 * ey) / cell));
	const ny = Math.max(8, Math.ceil((2 * ez) / cell));
	const val = new Float64Array((nx + 1) * (ny + 1));
	for (let i = 0; i <= nx; i++)
		for (let j = 0; j <= ny; j++)
			val[i * (ny + 1) + j] = f(-s, -ey + (2 * ey * i) / nx, -ez + (2 * ez * j) / ny) - ISO;
	const loops = march(val, nx, ny).map((L) =>
		orient(resample(L, Math.max(12, Math.round(n * Math.min(1, L.length / 24)))))
	);
	return loops.map((L) => L.map(([i, j]) => [-ey + (2 * ey * i) / nx, -ez + (2 * ez * j) / ny]));
}
for (const R of RIGID) {
	R.loops = sliceAt(R.s, R.cell, R.n);
	R.hy = reach(R.s, 0);
	R.hz = reach(R.s, Math.PI / 2);
}
// The acrosome's edge: the slice where the cap ends, drawn bolder.
const CAP_EDGE = sliceAt(S_CAP, 0.04, 72);
for (const T of TAIL) {
	T.r = reach(T.s, 0);
	T.loops = sliceAt(T.s, (2.4 * T.r) / 10, 16);
	const [i0, i1] = ballWindow(T.s);
	T.i0 = i0;
	T.i1 = i1;
}

// The depth mesh of the body: rings of M points round each station (exact
// points of the surface, by bisection), the nose and the tip closing it.
const M_RING = 12;
const RINGS = [];
for (let s = 0.06; s <= 9.6; s += 0.2) {
	const ring = [];
	for (let k = 0; k < M_RING; k++) {
		const phi = (TAU * k) / M_RING;
		const r = reach(s, phi);
		ring.push([r * Math.cos(phi), r * Math.sin(phi)]);
	}
	RINGS.push({ s, ring });
}

// ── The beat ─────────────────────────────────────────────────────────────────
// A travelling wave of the tail's tangent angle, its amplitude growing toward
// the tip, starting at the neck when the swimmer comes alive and running down
// to the tip; integrated along the tail so the tail keeps its length; the
// whole turned so the centreline's centroid is dead astern, which yaws the
// head against the tail. The roll is about the mean axis.
const T_LIFE = 0.335 * SEC;
const BEAT_HZ = 5;
const LAMBDA = 28;
const K_BEAT = TAU / LAMBDA;
const PSI_TIP = 0.8;
const FRONT_V = 70; // how fast the beat runs down the tail when it starts
const ROLL_HZ = 0.6;
const DS = 0.2;
const NT = Math.ceil((LEN - S0) / DS) + 1;

// ∫ of a rate ramped smoothly from 0 at t0 to 1 at t1 (closed form).
function rampInt(t, t0, t1) {
	if (t <= t0) return 0;
	const D = t1 - t0;
	if (t >= t1) return t - t1 + D / 2;
	const x = (t - t0) / D;
	return D * (x * x * x - (x * x * x * x) / 2);
}

// ── The Riemann surface of √z ────────────────────────────────────────────────
// Over the plane of z (world x = SR·Re z, world z = −SR·Im z), height
// HY·Re √z; parametrised by w = √z = u + iv, ONE coordinate on the whole of
// it: (SR(u² − v²), HY·u, −2SR·uv). The sheets Re w > 0 and Re w < 0 cross
// along the negative real axis (u = 0, height 0) — the branch cut — and meet
// at the branch point w = 0. Its normal (−HY·u, 2SR|w|², HY·v) points up on
// both sheets: the surface is a disc, one-sided up.
const SR = 220;
const HY = 132;
const RHO = 0.5; // the swimmer's circle |z| = RHO
const surf = (u, v) => [SR * (u * u - v * v), HY * u, -2 * SR * u * v];
const surfNormal = (u, v) => norm([-HY * u, 2 * SR * (u * u + v * v), HY * v]);
const csqrt = (x, y) => {
	const r = Math.hypot(x, y);
	const a = Math.sqrt((r + x) / 2);
	const b = Math.sign(y || 1) * Math.sqrt(Math.max(0, (r - x) / 2));
	return [a, b];
};

// The path: the line Re z = RHO coming up to the circle at z = RHO (lifted
// on the principal branch — the top sheet, continued past its rim), then the
// circle itself, θ from 0 through 4π and on, lifted as w = √RHO·e^{iθ/2}. a
// is the planar arc length, 0 at the join; the swimmer's nose is at a(t),
// each station of its body at a less its distance back, so it lies along
// the path it has swum.
const T_JOIN = 0.55 * SEC;
const T_END = 0.975 * SEC;
const SWIM0 = T_LIFE + 0.3;
const SWIM1 = T_LIFE + 3.0;
const V_SWIM = (2 * TAU * RHO * SR) / (T_END - T_JOIN);
const aOf = (t) => V_SWIM * (rampInt(t, SWIM0, SWIM1) - rampInt(T_JOIN, SWIM0, SWIM1));
const thOf = (a) => Math.max(0, a) / (RHO * SR);
const wOfA = (a) => {
	if (a >= 0) {
		const th = a / (RHO * SR);
		const m = Math.sqrt(RHO);
		return [m * Math.cos(th / 2), m * Math.sin(th / 2)];
	}
	return csqrt(RHO, a / SR);
};
const CLEAR = 6.5; // the swimmer's height over the sheet
function pathAt(a) {
	const [u, v] = wOfA(a);
	const P = surf(u, v);
	const wa = wOfA(a - 0.5);
	const wb = wOfA(a + 0.5);
	const T = norm(sub3(surf(wb[0], wb[1]), surf(wa[0], wa[1])));
	const N0 = surfNormal(u, v);
	const N = norm(sub3(N0, mul3(T, dot(N0, T))));
	return { P, N, T, B: cross(N, T), w: [u, v] };
}

// ── Setup ────────────────────────────────────────────────────────────────────
export async function make() {
	const Z = makeDepth(4);
	const S = surfaceSetup();
	// The frame's cost, averaged over thirty, for the cost probe.
	let frames = 0;
	let ms = 0;
	return {
		render(ctx, w, h, t) {
			const t0 = performance.now();
			frame(ctx, w, h, t, Z, S);
			ms += performance.now() - t0;
			if (++frames === 30) {
				if (typeof window !== 'undefined' && window.__lab)
					window.__lab.frameMs = Math.round((ms / frames) * 10) / 10;
				frames = 0;
				ms = 0;
			}
		}
	};
}

// The surface's lines and its depth mesh, once: the rays θ = jπ/8 over both
// sheets (arg w = jπ/16, j = 0 … 31) from the branch point to the rim, and
// the circles |z| = k/7 (|w| = √(k/7)), each a closed curve only after two
// turns round; all of it the polar grid of the w-disc.
function surfaceSetup() {
	const rays = [];
	for (let j = 0; j < 32; j++) {
		const ph = (Math.PI * j) / 16;
		const pts = [];
		for (let i = 0; i <= 28; i++) {
			const m = i / 28;
			pts.push(surf(m * Math.cos(ph), m * Math.sin(ph)));
		}
		rays.push({ j, pts, cut: j === 8 || j === 24 });
	}
	const rings = [];
	for (let k = 1; k <= 7; k++) {
		const m = Math.sqrt(k / 7);
		const pts = [];
		for (let i = 0; i <= 192; i++) {
			const ph = (TAU * i) / 192;
			pts.push(surf(m * Math.cos(ph), m * Math.sin(ph)));
		}
		rings.push({ k, pts, rim: k === 7 });
	}
	const NM = 12;
	const NA = 72;
	const grid = [];
	for (let i = 0; i <= NM; i++) {
		const m = i / NM;
		const row = [];
		for (let j = 0; j <= NA; j++) {
			const ph = (TAU * j) / NA;
			row.push(surf(m * Math.cos(ph), m * Math.sin(ph)));
		}
		grid.push(row);
	}
	return { rays, rings, grid };
}

// ── The swimmer at t ─────────────────────────────────────────────────────────
const FX0 = 2; // the frame table: the path's frames from 2 ahead of the nose
const FDX = 0.5; // back to past the tip, every half unit
const NF = Math.ceil((FX0 + LEN + 4) / FDX) + 1;
function swimmerAt(t) {
	const tb = t - T_LIFE;
	const live = tb > 0;
	const phase = TAU * BEAT_HZ * rampInt(t, T_LIFE, T_LIFE + 1.4);
	const roll = TAU * ROLL_HZ * rampInt(t, T_LIFE + 0.2, T_LIFE + 2.2);
	// The centreline of the tail in the body's plane, from the tangent angle.
	const CX = new Float64Array(NT);
	const CY = new Float64Array(NT);
	const PS = new Float64Array(NT);
	let X = -S0;
	let Y = 0;
	let sumX = (-S0 / 2) * S0;
	let sumY = 0;
	const psiAt = (s) => {
		if (!live) return 0;
		const d = s - S0;
		const env = smooth(span(tb - d / FRONT_V, 0, 0.6));
		if (env <= 0) return 0;
		const x = d / (LEN - S0);
		const g = smooth(span(x, 0, 0.07)) * (0.32 + 0.68 * x);
		return env * PSI_TIP * g * Math.sin(K_BEAT * d - phase);
	};
	let prev = psiAt(S0);
	for (let i = 0; i < NT; i++) {
		const s = S0 + i * DS;
		const p = psiAt(s);
		if (i) {
			const m = (prev + p) / 2;
			X -= Math.cos(m) * DS;
			Y += Math.sin(m) * DS;
			sumX += X * DS;
			sumY += Y * DS;
		}
		CX[i] = X;
		CY[i] = Y;
		PS[i] = p;
		prev = p;
	}
	// The yaw: the centroid of the centreline turned dead astern.
	const beta = Math.atan2(sumY, -sumX);
	const at = (s) => {
		if (s <= S0) return [-s, 0, 0];
		const f = Math.min(NT - 1, (s - S0) / DS);
		const i = Math.min(NT - 2, Math.floor(f));
		const k = f - i;
		return [lerp(CX[i], CX[i + 1], k), lerp(CY[i], CY[i + 1], k), lerp(PS[i], PS[i + 1], k)];
	};
	const BX = new Float64Array(NB);
	const BY = new Float64Array(NB);
	for (let j = 0; j < NB; j++) {
		const [x, y] = at(BALL_S[j]);
		BX[j] = x;
		BY[j] = y;
	}
	// Laid along the path: the path's frame at each distance back.
	const a = aOf(t);
	const FT = new Float64Array(NF * 9);
	for (let k = 0; k < NF; k++) {
		const f = pathAt(a + FX0 - k * FDX);
		const o = k * 9;
		FT[o] = f.P[0] + f.N[0] * CLEAR;
		FT[o + 1] = f.P[1] + f.N[1] * CLEAR;
		FT[o + 2] = f.P[2] + f.N[2] * CLEAR;
		FT[o + 3] = f.B[0];
		FT[o + 4] = f.B[1];
		FT[o + 5] = f.B[2];
		FT[o + 6] = f.N[0];
		FT[o + 7] = f.N[1];
		FT[o + 8] = f.N[2];
	}
	const pa = pathAt(a);
	const O = add3(pa.P, mul3(pa.N, CLEAR));
	const cb = Math.cos(beta);
	const sb = Math.sin(beta);
	const cr = Math.cos(roll);
	const sr = Math.sin(roll);
	// body (x, y, z) → yawed in its plane, rolled about its axis, then x is
	// the distance along the path and (y, z) across it and off the sheet.
	const toW = (x, y, z) => {
		const x2 = x * cb - y * sb;
		const y2 = x * sb + y * cb;
		const yb = y2 * cr - z * sr;
		const zn = y2 * sr + z * cr;
		const f = Math.min(NF - 1.001, Math.max(0, (FX0 - x2) / FDX));
		const i = Math.floor(f);
		const k = f - i;
		const o = i * 9;
		const r = [0, 0, 0];
		for (let c = 0; c < 3; c++) {
			const P = FT[o + c] + (FT[o + 9 + c] - FT[o + c]) * k;
			const Bc = FT[o + 3 + c] + (FT[o + 12 + c] - FT[o + 3 + c]) * k;
			const Nc = FT[o + 6 + c] + (FT[o + 15 + c] - FT[o + 6 + c]) * k;
			r[c] = P + Bc * yb + Nc * zn;
		}
		return r;
	};
	return { a, pa, O, toW, at, BX, BY, live };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// Rigs { T, E } (target, eye), blended with the distance in log so what the
// near rig frames stays framed while the lens draws back.
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function blend(a, b, k) {
	if (k <= 0) return a;
	if (k >= 1) return b;
	const da = Math.hypot(...sub3(a.E, a.T));
	const db = Math.hypot(...sub3(b.E, b.T));
	const dir = norm(lerp3(norm(sub3(a.E, a.T)), norm(sub3(b.E, b.T)), k));
	const d = da * Math.pow(db / da, k);
	const kt = Math.abs(db - da) > 1e-6 ? (d - da) / (db - da) : k;
	const T = lerp3(a.T, b.T, kt);
	return { T, E: add3(T, mul3(dir, d)) };
}
// The generation, about the body at rest, keyed in its own frame: the axis
// station looked at, the distance (in log), the bearing from dead ahead
// round toward the beat's side, the elevation off the sheet's normal plane.
const GEN = [
	// u, station, distance, azimuth, elevation
	[0.0, 2.7, 12.5, 0.85, 0.72],
	[0.045, 3.4, 14, 1.1, 0.6],
	[0.064, 7.5, 19, 1.3, 0.5],
	[0.08, 22, 25, 1.45, 0.5],
	[0.1, 44, 23, 1.6, 0.5],
	[0.116, 49, 19, 2.25, 0.5],
	[0.14, 36, 19, 2.5, 0.42],
	[0.17, 13, 18, 2.35, 0.42],
	[0.2, 6.6, 15, 1.75, 0.42],
	[0.225, 3.0, 11.5, 1.25, 0.95],
	[0.255, 2.8, 11, 1.57, 0.05],
	[0.285, 2.9, 12.5, 0.75, 0.32],
	[0.325, 24, 66, 1.9, 0.42],
	[0.37, 20, 80, 2.5, 0.4]
];
const genKey = (u, c, f = (x) => x) =>
	spline(
		u,
		GEN.map((g) => [g[0], f(g[c])])
	);
function lens(u, B) {
	const p = B.pa;
	const flat = (x, y, z) => add3(B.O, add3(mul3(p.T, x), add3(mul3(p.B, y), mul3(p.N, z))));
	const ug = Math.min(u, 0.37);
	const st = genKey(ug, 1);
	const d = Math.exp(genKey(ug, 2, Math.log));
	const az = genKey(ug, 3);
	const el = genKey(ug, 4);
	const T0 = flat(-st, 0, 0);
	const gen = {
		T: T0,
		E: add3(
			T0,
			flat(d * Math.cos(el) * Math.cos(az), d * Math.cos(el) * Math.sin(az), d * Math.sin(el)).map(
				(c, i) => c - B.O[i]
			)
		)
	};
	// Life and the set-off: behind it and above, drawing back and turning
	// from the swimmer to the surface ahead as that is written.
	const kc = smooth(span(u, 0.37, 0.48));
	const chase = {
		T: lerp3(flat(-22, 0, 0), [0, 0, 0], 0.55 * kc),
		E: flat(-22 - lerp(60, 240, kc), lerp(40, 20, kc), lerp(32, 170, kc))
	};
	// The surface written, whole, from behind the swimmer's line and above.
	const overview = { T: [10, -10, 30], E: [170, 330, 500] };
	// Round the branch point: from outside the rim, a little behind the
	// swimmer. While it is on the top sheet, well over it, looking down onto
	// the sheet; while it is under, low, looking in between the sheets
	// through the mouth they open toward the positive reals.
	const th = thOf(B.a);
	const yS = B.O[1];
	const top = smooth(clamp01((Math.cos(th / 2) + 0.3) / 0.6));
	const ce = th - lerp(0.3, 0.42, top);
	const rc = lerp(1.8, 1.55, top) * SR;
	const orbit = {
		T: add3(lerp3(B.O, [0, 0, 0], 0.38), [0, -lerp(10, 25, top), 0]),
		E: [rc * Math.cos(ce), yS + lerp(55, 205, top), -rc * Math.sin(ce)]
	};
	// The end: in on the branch point, over the swimmer back on its sheet.
	const end = {
		T: [0, -6, 0],
		E: [0.95 * SR * Math.cos(ce + 0.1), yS + 115, -0.95 * SR * Math.sin(ce + 0.1)]
	};
	let rig = blend(gen, chase, smooth(span(u, 0.345, 0.39)));
	rig = blend(rig, overview, smooth(span(u, 0.45, 0.51)));
	rig = blend(rig, orbit, smooth(span(u, 0.535, 0.6)));
	rig = blend(rig, end, smooth(span(u, 0.95, 1)));
	return rig;
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Segments batched by alpha and width (as kummer.js's makeInk), but a
// segment that starts where the last one in its batch ended continues that
// subpath, so a polyline is one path of lineTo's rather than hundreds of
// capped pieces: the board strokes thousands of segments in a few paths.
function makeInk() {
	const B = new Map();
	return {
		seg(alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(14, Math.round(alpha * 14));
			const wq = Math.max(2, Math.round(width * 4));
			const key = a * 64 + wq;
			let b = B.get(key);
			if (!b) {
				b = { alpha: a / 14, width: wq / 4, P: [], lx: Infinity, ly: Infinity };
				B.set(key, b);
			}
			if (Math.abs(b.lx - x0) > 0.01 || Math.abs(b.ly - y0) > 0.01) b.P.push(NaN, x0, y0);
			b.P.push(x1, y1);
			b.lx = x1;
			b.ly = y1;
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = PAL.chalk;
			for (const b of B.values()) {
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
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
		}
	};
}

// ── The depth buffer's triangles, by spans ───────────────────────────────────
// As makeDepth's Z.tri (into the same buffer, the same slack at the edges),
// but each row's span is solved from the three edge functions, which are
// linear along it, so no pixel outside the triangle is visited and the depth
// (1/z linear on the screen) is one division a pixel. The surface covers the
// screen twice over; this is what keeps it cheap.
function zTri(Z, a, b, c) {
	if (a[2] < NEAR || b[2] < NEAR || c[2] < NEAR) return;
	const s = Z.s;
	const ax = a[0] / s;
	const ay = a[1] / s;
	const bx = b[0] / s;
	const by = b[1] / s;
	const cx = c[0] / s;
	const cy = c[1] / s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (Math.abs(area) < 1e-9) return;
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
	if (x0 > x1 || y0 > y1) return;
	// w0 = A0·px + B0·py + C0, and so on; w2 = 1 − w0 − w1.
	const A0 = (by - cy) / area;
	const B0 = (cx - bx) / area;
	const C0 = (bx * cy - by * cx) / area;
	const A1 = (cy - ay) / area;
	const B1 = (ax - cx) / area;
	const C1 = (cx * ay - cy * ax) / area;
	const ia = 1 / a[2];
	const ib = 1 / b[2];
	const ic = 1 / c[2];
	const e = -0.03;
	const buf = Z.buf;
	const W = Z.W;
	for (let y = y0; y <= y1; y++) {
		const py = y + 0.5;
		const r0 = B0 * py + C0;
		const r1 = B1 * py + C1;
		// each of w0, w1, w2 ≥ e is a half-line in px
		let lo = x0 + 0.5;
		let hi = x1 + 0.5;
		const cut = (A, R) => {
			if (Math.abs(A) < 1e-12) {
				if (R < e) hi = -Infinity;
				return;
			}
			const x = (e - R) / A;
			if (A > 0) lo = Math.max(lo, x);
			else hi = Math.min(hi, x);
		};
		cut(A0, r0);
		cut(A1, r1);
		cut(-A0 - A1, 1 - r0 - r1);
		const xs = Math.max(x0, Math.ceil(lo - 0.5));
		const xe = Math.min(x1, Math.floor(hi - 0.5));
		const row = y * W;
		for (let x = xs; x <= xe; x++) {
			const px = x + 0.5;
			const w0 = A0 * px + r0;
			const w1 = A1 * px + r1;
			const z = 1 / (w0 * ia + w1 * ib + (1 - w0 - w1) * ic);
			if (z < buf[row + x]) buf[row + x] = z;
		}
	}
}

// ── Hidden lines ─────────────────────────────────────────────────────────────
// Behind what is in the depth buffer? The deepest of the four cells round
// the point (so a contour stays drawn), with a relative and an absolute slack.
function behind(Z, x, y, z, rel, abs) {
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
			if (xx < 0 || yy < 0 || xx >= Z.W || yy >= Z.H) return false;
			const v = Z.buf[yy * Z.W + xx];
			if (v > m) m = v;
		}
	return z > m * (1 + rel) + abs;
}

// ── A frame ──────────────────────────────────────────────────────────────────
// The sweep runs from the tip up to the nose: s ≥ sf is built.
const SWEEP = [
	[0.112, TIP + 0.5],
	[0.17, 10.2],
	[0.2, 5.3],
	[0.29, -0.95]
];
function frame(ctx, w, h, t, Z, S) {
	const u = clamp01(t / SEC);
	const B = swimmerAt(t);
	const rig = lens(u, B);
	const cam = camera3({ pos: rig.E, target: rig.T, up: UP, fov: FOV, w, h });
	cam.k = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const ref = Math.hypot(...sub3(rig.E, rig.T));
	const wOf = (z) => Math.min(1.9, Math.max(0.6, ref / z));
	const ink = makeInk();
	const MARGIN = 30;
	const off = (a, b) =>
		(a[0] < -MARGIN && b[0] < -MARGIN) ||
		(a[1] < -MARGIN && b[1] < -MARGIN) ||
		(a[0] > w + MARGIN && b[0] > w + MARGIN) ||
		(a[1] > h + MARGIN && b[1] > h + MARGIN);
	const seg = (a, b, alpha, width, hid, rel, abs) => {
		if (a[2] <= NEAR || b[2] <= NEAR || off(a, b)) return;
		const mz = (a[2] + b[2]) / 2;
		if (behind(Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, mz, rel, abs)) {
			if (hid > 0) ink.seg(alpha * hid, Math.max(0.7, width * 0.7), a[0], a[1], b[0], b[1]);
			return;
		}
		ink.seg(alpha, width * wOf(mz), a[0], a[1], b[0], b[1]);
	};
	// A projected polyline, written on to `upto` (by index).
	const poly = (Q, alpha, width, hid, rel, abs, upto = 1) => {
		const n = Q.length - 1;
		const end = n * clamp01(upto);
		for (let i = 0; i < n && i < end; i++) {
			const f = Math.min(1, end - i);
			const b = f < 1 ? lerp3(Q[i], Q[i + 1], f) : Q[i + 1];
			seg(Q[i], b, alpha, width, hid, rel, abs);
		}
	};

	const sf = spline(u, SWEEP);
	const built = (s) => s >= sf;

	// ── The depth buffer: the surface (once it is there), the body built ──
	const surfOn = u > 0.395;
	Z.reset(w, h);
	if (surfOn) {
		const G = S.grid.map((row) => row.map((p) => cam.project(p)));
		for (let i = 0; i < G.length - 1; i++)
			for (let j = 0; j < G[i].length - 1; j++) {
				zTri(Z, G[i][j], G[i + 1][j], G[i + 1][j + 1]);
				zTri(Z, G[i][j], G[i + 1][j + 1], G[i][j + 1]);
			}
	}
	const tailF = TAIL.map((T) => {
		const [x, y, ps] = B.at(T.s);
		// the chain's normal in the beat's plane: its tangent (−cos ψ, sin ψ) turned
		return { x, y, n1: [Math.sin(ps), Math.cos(ps)] };
	});
	const rings = [];
	for (const R of RINGS)
		if (built(R.s)) rings.push(R.ring.map(([y, z]) => cam.project(B.toW(-R.s, y, z))));
	TAIL.forEach((T, i) => {
		if (!built(T.s)) return;
		const F = tailF[i];
		const ring = [];
		for (let k = 0; k < 8; k++) {
			const phi = (TAU * k) / 8;
			const y = T.r * Math.cos(phi);
			ring.push(cam.project(B.toW(F.x + y * F.n1[0], F.y + y * F.n1[1], T.r * Math.sin(phi))));
		}
		rings.push(ring);
	});
	if (rings.length > 1) {
		const fan = (c, R) => {
			for (let k = 0; k < R.length; k++) zTri(Z, c, R[k], R[(k + 1) % R.length]);
		};
		if (sf <= NOSE) fan(cam.project(B.toW(-NOSE, 0, 0)), rings[0]);
		for (let i = 0; i < rings.length - 1; i++) {
			const A = rings[i];
			const C = rings[i + 1];
			const n = Math.max(A.length, C.length);
			for (let k = 0; k < n; k++) {
				const a0 = A[Math.floor((k * A.length) / n)];
				const a1 = A[Math.floor((((k + 1) % n) * A.length) / n)];
				const b0 = C[Math.floor((k * C.length) / n)];
				const b1 = C[Math.floor((((k + 1) % n) * C.length) / n)];
				zTri(Z, a0, b0, b1);
				zTri(Z, a0, b1, a1);
			}
		}
		const [tx, ty] = B.at(TIP);
		fan(cam.project(B.toW(tx, ty, 0)), rings[rings.length - 1]);
	}

	// ── The surface's lines ──
	if (surfOn) drawSurface(S, u, cam, poly);

	// ── The primitives: the blobs, the capsule, the chain ──
	if (u < 0.335) drawPrimitives(ctx, u, sf, B, cam, poly, ink);

	// ── The slices: one in so many when they would crowd on the screen ──
	const qn = cam.project(B.O);
	const px = qn[2] > NEAR ? cam.k / qn[2] : 0; // pixels to the unit at the nose
	const lodH = Math.max(1, Math.ceil(2.6 / (0.2 * px)));
	const lodT = Math.max(1, Math.ceil(3.2 / (0.55 * px)));
	const writeOf = (s, wdt) => clamp01((s - sf) / wdt);
	RIGID.forEach((R, idx) => {
		if (!built(R.s) || (lodH > 1 && idx % lodH)) return;
		const up = writeOf(R.s, R.s < 5.1 ? 0.7 : 1.1);
		const a = R.s < S_CAP ? 0.9 : 0.8;
		for (const L of R.loops) {
			const Q = L.map(([y, z]) => cam.project(B.toW(-R.s, y, z)));
			poly(Q, a, 1.15, 0.2, 0.002, 0.05, up);
		}
	});
	if (built(S_CAP))
		for (const L of CAP_EDGE) {
			const Q = L.map(([y, z]) => cam.project(B.toW(-S_CAP, y, z)));
			poly(Q, 0.95, 1.7, 0.25, 0.002, 0.05, writeOf(S_CAP, 0.7));
		}
	TAIL.forEach((T, idx) => {
		if (!built(T.s) || (lodT > 1 && idx % lodT)) return;
		const up = writeOf(T.s, 2.5);
		const F = tailF[idx];
		const loops = B.live ? tailSlice(T, F, B) : T.loops;
		for (const L of loops) {
			const Q = L.map(([y, z]) => cam.project(B.toW(F.x + y * F.n1[0], F.y + y * F.n1[1], z)));
			poly(Q, 0.78, 1.0, 0.2, 0.002, 0.05, up);
		}
	});
	// Where the slices would merge into dots, the tube's contour too: the
	// generator where the midpiece's and the tail's round sections turn away
	// from the lens, c ± r·(t × v)/|t × v|.
	const silA = 0.8 * (1 - smooth(span(0.55 * px, 4, 9)));
	if (silA > 0.02 && sf <= S0) drawContour(B, cam, rig.E, tailF, poly, silA);
	// The cutting plane, at the front while it sweeps.
	const planeA = smooth(span(u, 0.108, 0.12)) * (1 - smooth(span(u, 0.28, 0.29)));
	if (planeA > 0 && sf > -0.5) drawPlane(sf, B, cam, ink, planeA);

	ink.flush(ctx);

	// ── Lit points ──
	// Life: a spark at the midpiece as the beat starts.
	const spark = span(t, T_LIFE - 0.25, T_LIFE) * (1 - smooth(span(t, T_LIFE, T_LIFE + 1.4)));
	if (spark > 0) {
		const q = cam.project(B.toW(-7.6, 0, 0));
		if (q[2] > NEAR) {
			bloom(ctx, q[0], q[1], 70 * wOf(q[2]) * spark, 'rgba(255, 222, 150, 0.6)', spark);
			disc(ctx, q[0], q[1], 3.5 * wOf(q[2]), { fill: PAL.gold, alpha: spark });
		}
	}
	if (surfOn) drawLit(ctx, u, cam, Z, B);
}

// The tail's slice at its station, marched afresh on the plane normal to the
// bent chain — points c + y·n1 + z·Z in the body's frame — from the chain's
// balls where the beat has put them.
function tailSlice(T, F, B) {
	const n = 10;
	const e = T.r * 1.45 + 0.04;
	const W = n + 1;
	const val = new Float64Array(W * W);
	const near = T.s < 10.8;
	for (let i = 0; i <= n; i++) {
		const y = -e + (2 * e * i) / n;
		const X = F.x + y * F.n1[0];
		const Y = F.y + y * F.n1[1];
		for (let j = 0; j <= n; j++) {
			const z = -e + (2 * e * j) / n;
			let f = fChain(X, Y, z, B.BX, B.BY, T.i0, T.i1);
			if (near) f += fRigid(X, Y, z);
			val[i * W + j] = f - ISO;
		}
	}
	return march(val, n, n).map((L) =>
		L.map(([i, j]) => [-e + (2 * e * i) / n, -e + (2 * e * j) / n])
	);
}

// The contour generator of the midpiece and the tail, both sides.
const MID = RIGID.filter((R) => R.s >= 5.3);
function drawContour(B, cam, eye, tailF, poly, a) {
	const C = [];
	const r = [];
	for (const R of MID) {
		C.push(B.toW(-R.s, 0, 0));
		r.push((R.hy + R.hz) / 2);
	}
	TAIL.forEach((T, i) => {
		C.push(B.toW(tailF[i].x, tailF[i].y, 0));
		r.push(T.r);
	});
	const L = [];
	const Rt = [];
	for (let i = 0; i < C.length; i++) {
		const t = sub3(C[Math.min(C.length - 1, i + 1)], C[Math.max(0, i - 1)]);
		const n = norm(cross(t, sub3(C[i], eye)));
		L.push(cam.project(add3(C[i], mul3(n, r[i]))));
		Rt.push(cam.project(add3(C[i], mul3(n, -r[i]))));
	}
	poly(L, a, 1.0, 0.15, 0.002, 0.05);
	poly(Rt, a, 1.0, 0.15, 0.002, 0.05);
}

// The cutting plane at station s: a square frame across the axis, faint,
// a few of its grid's lines, and on it the field's level curves at other
// values round the one that is kept — the plane as a contour map of the sum,
// the body's slice its one level ISO (drawn by the slices themselves).
const PLANE_LEVELS = [0.06, 0.16, 0.7, 1.1];
function drawPlane(s, B, cam, ink, a) {
	let hy;
	let hz;
	if (s < 9.6) {
		const R = RIGID.reduce((b, r) => (Math.abs(r.s - s) < Math.abs(b.s - s) ? r : b), RIGID[0]);
		hy = Math.max(0.7, R.hy * 1.35);
		hz = Math.max(0.7, R.hz * 1.35 + 0.3);
	} else {
		const T = TAIL.reduce((b, r) => (Math.abs(r.s - s) < Math.abs(b.s - s) ? r : b), TAIL[0]);
		hy = hz = Math.max(0.45, T.r * 2.6);
	}
	const [x, y, ps] = B.at(Math.max(0, s));
	const n1 = [Math.sin(ps), Math.cos(ps)];
	const P = (yy, zz) => cam.project(B.toW(x + yy * n1[0], y + yy * n1[1], zz));
	const line = (p, q, al, wd) => {
		if (p[2] <= NEAR || q[2] <= NEAR) return;
		ink.seg(al, wd, p[0], p[1], q[0], q[1]);
	};
	const c = [P(-hy, -hz), P(hy, -hz), P(hy, hz), P(-hy, hz)];
	for (let i = 0; i < 4; i++) line(c[i], c[(i + 1) % 4], 0.42 * a, 1);
	for (let k = 1; k < 6; k++) {
		const f = k / 6;
		line(P(lerp(-hy, hy, f), -hz), P(lerp(-hy, hy, f), hz), 0.1 * a, 0.8);
		line(P(-hy, lerp(-hz, hz, f)), P(hy, lerp(-hz, hz, f)), 0.1 * a, 0.8);
	}
	// The field on the plane (the body at rest: the sweep runs before the beat).
	const nx = 30;
	const ny = Math.max(10, Math.round((nx * hz) / hy));
	const val = new Float64Array((nx + 1) * (ny + 1));
	const F = new Float64Array((nx + 1) * (ny + 1));
	for (let i = 0; i <= nx; i++)
		for (let j = 0; j <= ny; j++)
			F[i * (ny + 1) + j] = fRest(-s, -hy + (2 * hy * i) / nx, -hz + (2 * hz * j) / ny);
	for (const lev of PLANE_LEVELS) {
		for (let k = 0; k < F.length; k++) val[k] = F[k] - lev;
		for (const L of march(val, nx, ny)) {
			let q0 = null;
			for (const [i, j] of L) {
				const q = P(-hy + (2 * hy * i) / nx, -hz + (2 * hz * j) / ny);
				if (q0) line(q0, q, 0.2 * a, 0.8);
				q0 = q;
			}
		}
	}
}

// The primitives the field is the sum of, drawn faint as they are placed,
// nose to tip: each head blob by its three principal sections, the capsule by
// its end circles, four lines and its axis, the chain's balls as their
// outlines from the lens; each fading once the sweep has passed it.
function drawPrimitives(ctx, u, sf, B, cam, poly, ink) {
	const fadeBy = (s) => 1 - smooth(span(s - sf, 0.3, 2.5));
	const out = 1 - smooth(span(u, 0.29, 0.33));
	const ell = (s, ax, a, b, upto, al) => {
		const Q = [];
		for (let i = 0; i <= 64; i++) {
			const th = (TAU * i) / 64;
			const c = Math.cos(th);
			const sn = Math.sin(th);
			let p;
			if (ax === 0) p = [-s + a * c, b * sn, 0];
			else if (ax === 1) p = [-s + a * c, 0, b * sn];
			else p = [-s, a * c, b * sn];
			Q.push(cam.project(B.toW(...p)));
		}
		poly(Q, al, 0.9, 0.35, 0.002, 0.05, upto);
	};
	BLOBS.forEach((o, i) => {
		const t0 = 0.004 + 0.016 * i;
		const up = smooth(span(u, t0, t0 + 0.026));
		if (up <= 0) return;
		const al = 0.55 * out * fadeBy(o.s - o.a * 0.5);
		if (al <= 0.01) return;
		ell(o.s, 0, o.a, o.b, up, al);
		ell(o.s, 1, o.a, o.c, up, al * 0.8);
		ell(o.s, 2, o.b, o.c, up, al * 0.8);
	});
	// The capsule.
	const upC = smooth(span(u, 0.048, 0.068));
	if (upC > 0) {
		const al = 0.55 * out * fadeBy(CAPS.s0);
		const r = CAPS.r;
		for (const s of [CAPS.s0, CAPS.s1]) ell(s, 2, r, r, upC, al);
		for (let k = 0; k < 4; k++) {
			const ph = (TAU * k) / 4;
			const y = r * Math.cos(ph);
			const z = r * Math.sin(ph);
			const Q = [];
			for (let i = 0; i <= 8; i++) Q.push(cam.project(B.toW(-lerp(CAPS.s0, CAPS.s1, i / 8), y, z)));
			poly(Q, al, 0.9, 0.35, 0.002, 0.05, upC);
		}
		const A = [];
		for (let i = 0; i <= 8; i++) A.push(cam.project(B.toW(-lerp(CAPS.s0, CAPS.s1, i / 8), 0, 0)));
		poly(A, al * 0.8, 0.8, 0.5, 0.002, 0.05, upC);
	}
	// The chain: each ball placed in turn from the neck to the tip.
	ink.flush(ctx);
	const buckets = new Map();
	for (let j = 0; j < NB; j++) {
		const s = BALL_S[j];
		const t0 = 0.064 + (0.04 * (s - S0)) / (LEN - S0);
		const on = span(u, t0, t0 + 0.006);
		if (on <= 0) continue;
		const al = 0.5 * out * on * fadeBy(s);
		if (al < 0.02) continue;
		const q = cam.project(B.toW(B.BX[j], B.BY[j], 0));
		if (q[2] <= NEAR) continue;
		const r = (KAP * rTarget(s) * cam.k) / q[2];
		const a = Math.min(10, Math.round(al * 10));
		if (!buckets.has(a)) buckets.set(a, []);
		buckets.get(a).push(q[0], q[1], Math.max(0.6, r * (0.6 + 0.4 * on)));
	}
	ctx.save();
	ctx.strokeStyle = PAL.chalk;
	ctx.lineWidth = 0.9;
	for (const [a, P] of buckets) {
		ctx.globalAlpha = a / 10;
		ctx.beginPath();
		for (let i = 0; i < P.length; i += 3) {
			ctx.moveTo(P[i] + P[i + 2], P[i + 1]);
			ctx.arc(P[i], P[i + 1], P[i + 2], 0, TAU);
		}
		ctx.stroke();
	}
	ctx.restore();
}

// The Riemann surface of √z, written on: the rays out from the branch point,
// then the circles each written round TWICE before it closes, the rim the
// last of them; the cut, where the sheets cross, a little bolder.
function drawSurface(S, u, cam, poly) {
	for (const R of S.rays) {
		const t0 = 0.405 + (0.04 * R.j) / 32;
		const up = smooth(span(u, t0, t0 + 0.035));
		if (up <= 0) continue;
		const Q = R.pts.map((p) => cam.project(p));
		// the cut lies on both sheets at once: a looser test, or the two
		// sheets' depths at the crossing would dash it
		if (R.cut) poly(Q, 0.8, 1.6, 0.12, 0.03, 2, up);
		else poly(Q, 0.5, 1, 0.12, 0.008, 0.5, up);
	}
	for (const R of S.rings) {
		const t0 = 0.425 + 0.01 * R.k;
		const up = smooth(span(u, t0, t0 + 0.055));
		if (up <= 0) continue;
		const Q = R.pts.map((p) => cam.project(p));
		poly(Q, R.rim ? 0.7 : 0.45, R.rim ? 1.3 : 1, 0.12, 0.008, 0.5, up);
	}
}

// The lit points: the branch point; where the swimmer joined its circle on
// the top sheet; and, while it passes beneath that, the point under it on
// the other sheet, the two joined by the fibre over z = ρ.
function drawLit(ctx, u, cam, Z, B) {
	const lp = (P, r, a) => {
		if (a <= 0) return;
		const q = cam.project(P);
		if (q[2] <= NEAR) return;
		const hid = behind(Z, q[0], q[1], q[2], 0.008, 2);
		lit3(ctx, cam, P, r * (hid ? 0.8 : 1), a * (hid ? 0.3 : 1));
	};
	lp([0, 0, 0], 4.5, smooth(span(u, 0.398, 0.415)));
	const m = Math.sqrt(RHO);
	const top = surf(m, 0);
	const bot = surf(-m, 0);
	lp(top, 3, smooth(span(u, 0.545, 0.556)));
	const th = thOf(B.a);
	const under =
		smooth(span(th, TAU - 1.3, TAU - 0.4)) * (1 - smooth(span(th, TAU + 0.4, TAU + 1.3)));
	if (under > 0) {
		lp(bot, 2.4, under * 0.8);
		const a = cam.project(top);
		const b = cam.project(bot);
		if (a[2] > NEAR && b[2] > NEAR) {
			ctx.save();
			ctx.globalAlpha = 0.45 * under;
			ctx.strokeStyle = PAL.chalk;
			ctx.setLineDash([3, 6]);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(a[0], a[1]);
			ctx.lineTo(b[0], b[1]);
			ctx.stroke();
			ctx.restore();
		}
	}
}
