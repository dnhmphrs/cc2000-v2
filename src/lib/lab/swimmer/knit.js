// ── log-swimmer · knit ───────────────────────────────────────────────────────
// The swimmer KNITTED: its skin grown as a quad mesh, round by round, from a
// ring of stitches cast on round the nose — each stitch its wale pulled down
// from the loop above, then its course carried across to the next, as a
// needle goes — down the head, the neck (where the round is decreased from
// sixteen stitches to eight, two loops knitted together), the midpiece and
// the flagellum, and cast off at the tip. Then it is set swimming down a
// LOXODROMIC MÖBIUS FLOW on the Riemann sphere, z ↦ λz, into its sink.
//
// The run, beat by beat (u = progress, 20 s):
//   0.00–0.06  the cast-on: a gold needle at the nose; sixteen stitches round
//              it, spokes from the nose and a ring, slowly; the lens close
//              and in front (the paddle's nose is thin, so the ring is flat).
//   0.06–0.23  the HEAD, twenty rounds, quicker and quicker: the paddle grows
//              under the needle. The lens rises over the broad face (the
//              oval, 0.16) and comes round to the head's edge (0.20), where
//              the same rounds read thin. The round at the acrosome's edge,
//              two-thirds back, is a ridge (a purl row) standing proud.
//   0.23–0.30  the neck — the DECREASE, sixteen loops to eight, each new
//              stitch pulled through two — and the midpiece, twelve rounds.
//   0.30–0.41  the FLAGELLUM, forty-five rounds, fast, the lens drawing back
//              along it; the tip cast off at 0.41. While it is open the far
//              side of the knitting shows faint and dashed; once it is closed
//              the hidden lines go.
//   0.41–0.45  life: a gold spark at the midpiece; the beat starts at the
//              neck and runs down the tail; the body rolls; at 0.45 it moves
//              off along its flow line.
//   0.41–0.56  the SPHERE, under it: twenty-four flow lines written from the
//              source up round the sphere and into the sink, each pen a
//              particle carried by the flow itself; the lens rises off the
//              swimmer to hang over the cap and its whirl, the sink up the
//              frame and the swimmer low; the sink lit at 0.55.
//   0.47–0.64  the iterates: a disc round the swimmer's start and its images
//              under λ, λ², … (and λ⁻¹, λ⁻²), written one after another down
//              its flow line, each smaller and turned on round the sink.
//   0.57–1.00  the swim: the lens comes down from over the cap to behind and
//              over the swimmer, the whirl and the lit sink always ahead,
//              following it down its flow line, gathering pace; each image of
//              the disc brightens as the head passes over it (k = 1 … 5); the
//              run ends with the head about 8° from the sink, closing on it.
//
// What is EXACT: the flow. z ↦ λz with λ = e^μ, μ = −κ + iω (κ = 0.4,
// ω = 0.8: |λ| = 0.670, arg λ = 45.8°), on the Riemann sphere by the inverse
// stereographic projection, z = tan(θ/2) e^{iα} (θ from the pole that is
// z = 0): its flow φ_t(z) = e^{μt} z, whose lines are the logarithmic
// spirals |z| = r e^{−κt}, arg z = α + ωt, and on the sphere LOXODROMES,
// α = α₀ − (ω/κ) ln tan(θ/2), crossing every meridian at the one angle
// ψ = arctan(ω/κ) = 63.4°, from the source z = ∞ (the bottom pole, a ring)
// to the sink z = 0 (the top, lit); drawn as twenty-four of them, α₀ every
// 15° (every other one fainter), sampled evenly in flow time (so each pen is
// a particle of the flow), points exact, to within 0.17° of the sink.
// The images of the disc |z − z₀| ≤ 0.24|z₀| (z₀ the swimmer's start) under
// λᵏ, k = −2 … 10: discs |z − λᵏz₀| ≤ 0.24|λᵏz₀|, mapped point by point,
// which are circles on the sphere (Möbius maps and the stereographic
// projection both keep circles) on the swimmer's own flow line, since it
// passes through every λᵏz₀. The swimmer's path: that loxodrome, lifted 6
// above the sphere, in closed form — its colatitude falls linearly with arc
// length, θ = θ₀ − σ cos ψ / (R + 6) — and its heading, analytic. Hidden
// lines: the sphere's far side by its own geometry (p · eye > R²), anything
// behind the body by a software depth buffer of the knitted mesh, and on the
// closed body its own far side by the mesh's normals.
// What is a PICTURE: the body's proportions as the brief has them (head 5 ×
// 3 × 1.5, the acrosome's cap 0.06 proud over its front two-thirds ending in
// a ridge, a narrow neck, the midpiece 4 × 1, the flagellum 45 long tapering
// to a point), each round an ellipse; the knitting (closed rounds, not the
// helix a real circular needle makes); the beat, a travelling wave of the
// tangent angle (amplitude growing to the tip, about two wavelengths along
// it) integrated so the tail keeps its length, its mean angle taken out (the
// head's yaw against it); the roll, the beat's plane turning about the body;
// the body laid along the path it has swum (its mean curved with the flow
// line, the beat about that), and its height above the sphere; the sphere's
// size against the body's, R = 120.
//
// Frame cost, headless at 1280 × 800: the page holds the 60 fps frame
// interval (17 ms) at every pin; the render's own JavaScript is 0.5–4 ms a
// frame (median), the busiest the sphere's 24 lines (segments batched by
// alpha and width, culled off the board; the depth buffer at 4 px).

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
import { NEAR, makeDepth, spline3, lerp3 } from '../log/space.js';
import { makeInk } from '../log/kummer.js';

export const meta = {
	title:
		'knit: the skin knitted round by round from the nose — down a loxodromic flow into its sink',
	order: 8,
	seconds: 20,
	three: false
};

const SEC = 20;
const FOV = 40;
const DEG = Math.PI / 180;

// ── The flow z ↦ λz, λ = e^{−κ + iω}, on the sphere of radius R ──────────────
const R = 120;
const LIFT = 6; // the body's axis above the sphere
const RH = R + LIFT;
const KAP = 0.4;
const OMG = 0.8;
const COSPSI = KAP / Math.hypot(KAP, OMG);
const TANPSI = OMG / KAP;
const TH0 = 70 * DEG; // the swimmer's start: z₀ = tan(θ₀/2) e^{iα₀}
const R0 = Math.tan(TH0 / 2);
const A0 = 0.4;
const PHI0 = A0 + TANPSI * Math.log(R0); // its loxodrome's α at θ = 90°
const POLE = [0, R, 0]; // the sink, z = 0
const SOURCE = [0, -R, 0]; // the source, z = ∞

// A point of the sphere (radius r) at colatitude θ from the sink, longitude α.
function sph(th, al, r = R) {
	const s = Math.sin(th);
	return [r * s * Math.cos(al), r * Math.cos(th), r * s * Math.sin(al)];
}
// z = x + iy on the sphere: θ = 2 arctan|z|, α = arg z.
const fromZ = (x, y) => sph(2 * Math.atan(Math.hypot(x, y)), Math.atan2(y, x));

// The flow lines, sampled evenly in flow time v = ln tan(θ/2), from near the
// source (θ = 80° short of it is enough: the rest is under the sphere) to
// within a third of a degree of the sink.
const NLINE = 24;
const V_HI = Math.log(Math.tan(80 * DEG)); // θ = 160°
const V_LO = Math.log(Math.tan(0.17 * DEG));
const NV = 200;
const LOX = [];
for (let j = 0; j < NLINE; j++) {
	const pts = [];
	for (let i = 0; i <= NV; i++) {
		const v = V_HI - ((V_HI - V_LO) * i) / NV;
		pts.push(sph(2 * Math.atan(Math.exp(v)), PHI0 + (TAU * j) / NLINE - TANPSI * v));
	}
	LOX.push(pts);
}

// The disc round z₀ and its images under λᵏ.
const K_LO = -2;
const K_HI = 10;
const RHO = 0.24;
const ND = 64;
const DISCS = [];
for (let k = K_LO; k <= K_HI; k++) {
	const m = Math.exp(-KAP * k);
	const a = A0 + OMG * k;
	const c = [m * R0 * Math.cos(a), m * R0 * Math.sin(a)];
	const rr = RHO * m * R0;
	const pts = [];
	for (let i = 0; i <= ND; i++) {
		const t = (TAU * i) / ND + a;
		pts.push(fromZ(c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)));
	}
	DISCS.push({ k, pts, centre: fromZ(c[0], c[1]) });
}

// The swimmer's path: its loxodrome lifted to radius R + LIFT, by arc length
// σ from the start (closed form: dσ = −(R + LIFT) dθ / cos ψ).
function pathAt(sig) {
	const th = Math.min(Math.PI - 1e-3, Math.max(1e-3, TH0 - (sig * COSPSI) / RH));
	const v = Math.log(Math.tan(th / 2));
	const al = PHI0 - TANPSI * v;
	const st = Math.sin(th);
	const ct = Math.cos(th);
	const sa = Math.sin(al);
	const ca = Math.cos(al);
	const P = [RH * st * ca, RH * ct, RH * st * sa];
	const H = [-COSPSI * (ct * ca + TANPSI * sa), COSPSI * st, -COSPSI * (ct * sa - TANPSI * ca)];
	const N = [st * ca, ct, st * sa];
	return { th, v, P, H, N, E1: cross(H, N) };
}
// The flow time of the path at colatitude θ (0 at the start; k at λᵏz₀).
const flowTime = (v) => (Math.log(R0) - v) / KAP;

// ── The body: distance s back from the nose ──────────────────────────────────
const L_HEAD = 5;
const LEN = 55;
const S_BEAT = 5.6; // where the flagellum's bending starts
const S_RIDGE = 3.24; // the acrosome's edge
// The round's half-axes at s: a across the broad face, b through it.
function sect(s) {
	if (s <= L_HEAD) {
		const x = s / L_HEAD;
		const a =
			x <= 0.45
				? 1.5 * Math.sqrt(Math.max(0, 1 - ((0.45 - x) / 0.45) ** 2))
				: lerp(1.5, 0.4, smooth((x - 0.45) / 0.55));
		// Thin at the front, under the acrosome; thickest two-thirds back.
		const b =
			x <= 0.68
				? 0.75 *
					Math.sqrt(Math.max(0, 1 - ((0.68 - x) / 0.68) ** 2)) *
					(0.55 + 0.45 * smooth(x / 0.68))
				: lerp(0.75, 0.4, smooth((x - 0.68) / 0.32));
		const cap =
			0.06 * smooth(span(s, 0, 0.5)) * (1 - smooth(span(s, S_RIDGE + 0.01, S_RIDGE + 0.06)));
		const ridge = Math.abs(s - S_RIDGE) < 0.03 ? 0.08 : 0;
		return [a + cap + ridge, b + cap + ridge];
	}
	let r;
	if (s < 5.5) r = lerp(0.4, 0.3, smooth(span(s, L_HEAD, 5.5)));
	else if (s < 6) r = lerp(0.3, 0.5, smooth(span(s, 5.5, 6)));
	else if (s < 9.6) r = 0.5;
	else if (s < 10) r = lerp(0.5, 0.38, smooth(span(s, 9.6, 10)));
	else if (s < 52) r = lerp(0.38, 0.1, (s - 10) / 42);
	else r = lerp(0.1, 0, smooth(span(s, 52, LEN)));
	return [r, r];
}

// The rounds: station, stitches, the angle offset, how long it takes to knit.
// Round 0 is the nose itself (sixteen loops at one point), the last the tip.
const ROWS = [];
const addRow = (s, n, o = {}) =>
	ROWS.push({ s, n, off: o.off ?? 0, dec: !!o.dec, tip: !!o.tip, dur: o.dur ?? 0 });
addRow(0, 16, { tip: true });
addRow(0.05, 16, { dur: 1.0 }); // the cast-on
const HEAD_S = [
	0.16,
	0.32,
	0.52,
	0.76,
	1.03,
	1.32,
	1.62,
	1.92,
	2.22,
	2.52,
	2.82,
	3.08,
	S_RIDGE,
	3.38,
	3.62,
	3.9,
	4.18,
	4.46,
	4.74,
	5.0
];
HEAD_S.forEach((s, m) => addRow(s, 16, { dur: lerp(0.26, 0.09, m / (HEAD_S.length - 1)) }));
addRow(5.3, 8, { off: 0.25, dec: true, dur: 0.16 }); // k2tog round the neck
for (let m = 0; m < 12; m++) addRow(+(5.6 + 0.4 * m).toFixed(3), 8, { off: 0.25, dur: 0.1 });
const TAIL_S = [];
for (let s = 11; s <= 54; s++) TAIL_S.push(s);
TAIL_S.push(54.7);
TAIL_S.forEach((s, m) =>
	addRow(s, 8, { off: 0.25, dur: lerp(0.06, 0.03, m / (TAIL_S.length - 1)) })
);
addRow(LEN, 8, { off: 0.25, tip: true, dur: 0.16 }); // cast off

const T_KNIT0 = 0.15;
// The stitches, in the order they are made: row, column, angle, the loops it
// is pulled through (one, or two at the decrease), the next on its round.
const ST = [];
{
	let t = T_KNIT0;
	let base = 0;
	let prevBase = 0;
	ROWS.forEach((r, i) => {
		const [a, b] = sect(r.s);
		const h = 0.01;
		const [a0, b0] = sect(Math.max(0, r.s - h));
		const [a1, b1] = sect(Math.min(LEN, r.s + h));
		const hs = Math.min(LEN, r.s + h) - Math.max(0, r.s - h);
		Object.assign(r, { a, b, da: (a1 - a0) / hs, db: (b1 - b0) / hs, t0: t, base });
		const d = r.dur / r.n;
		for (let j = 0; j < r.n; j++) {
			let par = [];
			if (i > 0) par = r.dec ? [prevBase + 2 * j, prevBase + 2 * j + 1] : [prevBase + j];
			ST.push({
				row: i,
				j,
				phi: (TAU * (j + r.off)) / r.n,
				par,
				next: base + ((j + 1) % r.n),
				t0: t + j * d,
				d
			});
		}
		t += r.dur;
		prevBase = base;
		base += r.n;
	});
}
const NK = ST.length;
const T_KNIT1 = ST[NK - 1].t0 + ST[NK - 1].d; // the tip cast off
const doneAt = (k, t) => {
	const S = ST[k];
	return S.d > 0 ? clamp01((t - S.t0) / S.d) : t >= S.t0 ? 1 : 0;
};

// Stations along the body for its centreline and frames; each round's place
// among them.
const STN = [];
for (let s = 0; s <= L_HEAD + 1e-9; s += 0.25) STN.push(+s.toFixed(3));
for (let s = 5.5; s <= LEN + 1e-9; s += 0.5) STN.push(+s.toFixed(3));
const NS = STN.length;
for (const r of ROWS) {
	let i = 0;
	while (i < NS - 2 && STN[i + 1] < r.s) i++;
	r.i0 = i;
	r.f = (r.s - STN[i]) / (STN[i + 1] - STN[i]);
}

// ── Time: life, the beat, the roll, the swim ─────────────────────────────────
const T_LIFE = T_KNIT1 + 0.12;
const T_SWIM = T_LIFE + 0.6;
// ∫ of a rate piecewise linear in t through keys [[t, rate], …]: the pace, the
// beat and the roll only gather, and stay pure functions of t.
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
	[T_SWIM, 0],
	[T_SWIM + 1.5, 12],
	[T_SWIM + 4, 24],
	[T_SWIM + 7.5, 36],
	[SEC, 46]
];
const ROLL = [
	[T_LIFE + 0.3, 0],
	[T_LIFE + 2, 2.0],
	[SEC, 2.6]
];
const BEAT = [
	[T_LIFE, 0.4],
	[T_LIFE + 1.2, 2.6],
	[SEC, 3.0]
];
const K_BEAT = TAU / 26;
const FRONT_V = 30; // the beat runs down the tail from the neck at this pace
const B_NECK = 0.1;
const B_TIP = 0.62;

// The body at t: its centreline, and a frame at every station (T back along
// it, U across the broad face, V through it).
function bodyAt(t) {
	const sig = integ(t, SWIM);
	const hd = pathAt(sig);
	const fol = smooth(span(t, T_SWIM, T_SWIM + 2.5));
	const rho = integ(t, ROLL);
	const ph = integ(t, BEAT);
	const amp = smooth(span(t, T_LIFE, T_LIFE + 1.2));
	const front = (t - T_LIFE) * FRONT_V;
	const bAt = (s) => {
		if (front <= 0 || amp <= 0) return 0;
		const d = Math.max(0, s - S_BEAT);
		const env = smooth(span(front - d, 0, 8));
		const B = B_NECK + (B_TIP - B_NECK) * clamp01(d / (LEN - S_BEAT));
		return amp * env * B * Math.sin(K_BEAT * d - TAU * ph);
	};
	const beta = new Float64Array(NS);
	const bN = bAt(S_BEAT);
	let mean = 0;
	for (let i = 0; i < NS; i++) {
		beta[i] = STN[i] <= S_BEAT ? bN : bAt(STN[i]);
		if (i) mean += ((beta[i] + beta[i - 1]) / 2) * (STN[i] - STN[i - 1]);
	}
	mean /= LEN;
	const C = new Array(NS);
	const D = new Array(NS);
	let X = 0;
	let Y = 0;
	const cr = Math.cos(rho);
	const sr = Math.sin(rho);
	for (let i = 0; i < NS; i++) {
		if (i) {
			const ds = STN[i] - STN[i - 1];
			const bm = (beta[i] + beta[i - 1]) / 2 - mean;
			X += Math.cos(bm) * ds;
			Y += Math.sin(bm) * ds;
		}
		// The mean: straight back from the head while it is made, then laid
		// along the path it has swum.
		let M = sub3(hd.P, mul3(hd.H, X));
		let Nn = hd.N;
		let E1 = hd.E1;
		if (fol > 0) {
			const p = pathAt(sig - X);
			M = lerp3(M, p.P, fol);
			Nn = norm(lerp3(Nn, p.N, fol));
			E1 = norm(lerp3(E1, p.E1, fol));
		}
		const Dv = add3(mul3(E1, cr), mul3(Nn, sr));
		C[i] = add3(M, mul3(Dv, Y));
		D[i] = Dv;
	}
	const T = new Array(NS);
	const U = new Array(NS);
	const V = new Array(NS);
	for (let i = 0; i < NS; i++) {
		const a = C[Math.max(0, i - 1)];
		const b = C[Math.min(NS - 1, i + 1)];
		const Tt = norm(sub3(b, a));
		const Ut = norm(sub3(D[i], mul3(Tt, dot(D[i], Tt))));
		T[i] = Tt;
		U[i] = Ut;
		V[i] = cross(Tt, Ut);
	}
	return { sig, hd, C, T, U, V, rho };
}

// The knitted mesh in the world at t: every stitch's point and normal.
function meshAt(B) {
	const P = new Array(NK);
	const Nrm = new Array(NK);
	for (let k = 0; k < NK; k++) {
		const S = ST[k];
		const r = ROWS[S.row];
		const i = r.i0;
		const f = r.f;
		const c = lerp3(B.C[i], B.C[i + 1], f);
		const T = lerp3(B.T[i], B.T[i + 1], f);
		const U = lerp3(B.U[i], B.U[i + 1], f);
		const V = lerp3(B.V[i], B.V[i + 1], f);
		const co = Math.cos(S.phi);
		const si = Math.sin(S.phi);
		P[k] = add3(c, add3(mul3(U, r.a * co), mul3(V, r.b * si)));
		if (r.tip) Nrm[k] = r.s < 1 ? mul3(T, -1) : T;
		else
			Nrm[k] = norm(
				add3(
					mul3(T, -(r.da * r.b * co * co + r.db * r.a * si * si)),
					add3(mul3(U, r.b * co), mul3(V, r.a * si))
				)
			);
	}
	return { P, N: Nrm };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// While it is knitted: keyed in the body's own frame at the start (x back
// along it, y across the broad face, z up off the sphere).
const GEN_T = [
	[0, [0.06, 0, 0]],
	[0.045, [0.12, 0, 0]],
	[0.08, [0.5, 0, 0]],
	[0.14, [1.1, 0, 0]],
	[0.2, [2.2, 0, 0]],
	[0.25, [3.6, 0, 0]],
	[0.31, [6, 0, 0]],
	[0.36, [15, 0, 0]],
	[0.41, [25, 0, 0]]
];
const GEN_E = [
	[0, [-1.5, 0.3, 0.45]],
	[0.045, [-1.6, 0.6, 0.7]],
	[0.08, [-2.9, 2.2, 2.4]],
	[0.14, [0.2, 2.6, 5.4]],
	[0.2, [2.4, 7.4, 0.25]],
	[0.25, [2.8, 7.4, 3.6]],
	[0.31, [1, 12, 7]],
	[0.36, [4, 28, 17]],
	[0.41, [8, 46, 28]]
];
const START = pathAt(0);
const BX = mul3(START.H, -1);
const bodyW = (p) =>
	add3(START.P, add3(mul3(BX, p[0]), add3(mul3(START.E1, p[1]), mul3(START.N, p[2]))));

// Blend two rigs {T, E, up}: the distance in log, the target carried with
// it, so whatever the near rig frames stays framed while the lens draws back.
function blend(a, b, w) {
	if (w <= 0) return a;
	if (w >= 1) return b;
	const da = Math.hypot(...sub3(a.E, a.T));
	const db = Math.hypot(...sub3(b.E, b.T));
	const dir = norm(lerp3(norm(sub3(a.E, a.T)), norm(sub3(b.E, b.T)), w));
	const d = da * Math.pow(db / da, w);
	const wt = Math.abs(db - da) > 1e-6 ? (d - da) / (db - da) : w;
	const T = lerp3(a.T, b.T, wt);
	return { T, E: add3(T, mul3(dir, d)), up: norm(lerp3(a.up, b.up, w)) };
}

function rigAt(t, B) {
	const u = t / SEC;
	const ug = Math.min(u, 0.41);
	const gen = { T: bodyW(spline3(ug, GEN_T)), E: bodyW(spline3(ug, GEN_E)), up: START.N };
	const { hd } = B;
	const I = norm(sub3([0, 1, 0], mul3(hd.N, hd.N[1]))); // toward the sink, on the sphere
	// Then high over the cap, between the swimmer and its sink, the sink up
	// the frame; and on down, behind it and over it, as it swims in.
	const Ih = norm([-hd.N[0], 0, -hd.N[2]]); // in toward the axis, level
	const Os = mul3(hd.N, R); // under the swimmer, on the sphere
	const k = smooth(span(u, 0.57, 0.95));
	const foot = norm(lerp3(Os, POLE, 0.62 * Math.pow(1 - k, 1.6) + 0.06 * k));
	const follow = {
		T: lerp3(Os, POLE, 0.42 + 0.06 * k - 0.12 * Math.sin(Math.PI * k)),
		E: add3(
			mul3(foot, R + lerp(300, 46, Math.pow(k, 0.7))),
			add3(mul3(hd.H, -45 * k), mul3(I, -20 * k))
		),
		up: norm(lerp3(Ih, norm(add3(hd.N, mul3(I, 0.7))), k))
	};
	const rig = blend(gen, follow, smooth(span(u, 0.405, 0.55)));
	return rig;
}

// ── Hidden lines ─────────────────────────────────────────────────────────────
// Behind the body in the depth buffer? The deepest of the four cells round
// the point (so a contour stays drawn), with a slack.
function behind(Z, x, y, z, rel, abs) {
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
const offBoard = (a, b, w, h, m = 30) =>
	(a[0] < -m && b[0] < -m) ||
	(a[0] > w + m && b[0] > w + m) ||
	(a[1] < -m && b[1] < -m) ||
	(a[1] > h + m && b[1] > h + m);

export async function make() {
	const Z = makeDepth(4);
	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t, Z);
		}
	};
}

// ── A frame ──────────────────────────────────────────────────────────────────
function draw(ctx, w, h, t, Z) {
	const u = clamp01(t / SEC);
	const B = bodyAt(t);
	const rig = rigAt(t, B);
	const cam = camera3({ pos: rig.E, target: rig.T, up: rig.up, fov: FOV, w, h });
	const eye = rig.E;
	const mesh = meshAt(B);
	const Q = mesh.P.map((p) => cam.project(p));

	// The depth buffer: the knitted skin as far as it is made.
	Z.reset(w, h);
	const f = new Float64Array(NK);
	for (let k = 0; k < NK; k++) f[k] = doneAt(k, t);
	for (let k = 0; k < NK; k++) {
		const S = ST[k];
		if (f[k] < 1 || !S.par.length) continue;
		const P = S.par;
		if (P.length === 2) Z.tri(Q[P[0]], Q[P[1]], Q[k]);
		const pl = P[P.length - 1];
		const pn = ST[pl].next;
		Z.tri(Q[pl], Q[pn], Q[S.next]);
		Z.tri(Q[pl], Q[S.next], Q[k]);
	}

	drawSphere(ctx, cam, w, h, t, u, Z, B, eye);
	drawBody(ctx, cam, w, h, t, Z, mesh, Q, f, eye, B);
}

// ── The sphere and its flow ──────────────────────────────────────────────────
const U_LINES = [0.41, 0.555]; // the pens, from the source to the sink
const U_DISC = 0.47; // the disc and its images, one after another
const DISC_STEP = 0.011;
const DISC_D = 0.035;

function drawSphere(ctx, cam, w, h, t, u, Z, B, eye) {
	const write = span(u, U_LINES[0], U_LINES[1]);
	if (write <= 0) return;
	const ink = makeInk();
	const E2 = dot(eye, eye);
	const height = Math.sqrt(E2) - R;
	const ref = Math.max(20, height * 1.15);
	const backA = 0.13 * (1 - smooth(span(u, 0.62, 0.74)));
	const fadeIn = smooth(span(u, U_LINES[0], U_LINES[0] + 0.03));
	const relZ = 0.01;

	// The limb: where the lens's tangent cone touches the sphere.
	if (E2 > R * R * 1.0004) {
		const n = norm(eye);
		const c = mul3(eye, (R * R) / E2);
		const rr = R * Math.sqrt(1 - (R * R) / E2);
		const e1 = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
		const e2 = cross(n, e1);
		let prev = null;
		for (let i = 0; i <= 180; i++) {
			const a = (TAU * i) / 180;
			const p = add3(c, add3(mul3(e1, rr * Math.cos(a)), mul3(e2, rr * Math.sin(a))));
			const q = cam.project(p);
			if (prev && q[2] > NEAR && prev[2] > NEAR && !offBoard(prev, q, w, h))
				ink.seg(PAL.chalk, 0.42 * fadeIn, 1.3, false, prev[0], prev[1], q[0], q[1]);
			prev = q;
		}
	}

	// A segment of the sphere: its far side faint and dashed (or gone), and
	// gone wherever the body is in front of it.
	const seg = (a, b, qa, qb, alpha, width) => {
		if (qa[2] <= NEAR || qb[2] <= NEAR || offBoard(qa, qb, w, h)) return;
		const m = mul3(add3(a, b), 0.5);
		const front = dot(m, eye) > dot(m, m);
		const mz = (qa[2] + qb[2]) / 2;
		if (front && behind(Z, (qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, mz, relZ, 0.3)) return;
		const ws = Math.min(1.7, Math.max(0.5, ref / mz));
		if (!front) {
			if (backA > 0.01) ink.seg(PAL.chalk, backA, 0.9, true, qa[0], qa[1], qb[0], qb[1]);
			return;
		}
		ink.seg(PAL.chalk, alpha, width * ws, false, qa[0], qa[1], qb[0], qb[1]);
	};

	// The flow lines, each written by a particle of the flow.
	const head = NV * write;
	const pens = [];
	for (let j = 0; j < NLINE; j++) {
		const pts = LOX[j];
		const own = j === 0;
		const al = (own ? 0.8 : j % 2 ? 0.3 : 0.5) * fadeIn;
		const wd = own ? 1.45 : j % 2 ? 0.95 : 1.1;
		let qa = cam.project(pts[0]);
		const n = Math.min(NV, Math.ceil(head));
		for (let i = 0; i < n; i++) {
			let b = pts[i + 1];
			const fr = Math.min(1, head - i);
			if (fr < 1) b = lerp3(pts[i], b, fr);
			const qb = cam.project(b);
			seg(pts[i], b, qa, qb, al, wd);
			if (fr < 1 || (i === n - 1 && write < 1)) pens.push([b, qb]);
			qa = qb;
		}
	}
	ink.flush(ctx);
	for (const [p, q] of pens)
		if (q[2] > NEAR && dot(p, eye) > R * R)
			disc(ctx, q[0], q[1], 2.1, { fill: PAL.chalk, alpha: 0.9 * fadeIn });

	// The disc and its images under λᵏ, one after another down the line;
	// each brightening as the swimmer's head passes over its centre.
	const tauH = flowTime(B.hd.v);
	const swimming = smooth(span(t, T_SWIM, T_SWIM + 1));
	const ink2 = makeInk();
	DISCS.forEach((Dk, m) => {
		const u0 = U_DISC + m * DISC_STEP;
		const p = smooth(span(u, u0, u0 + DISC_D));
		if (p <= 0) return;
		const pass = swimming * Math.exp(-(((tauH - Dk.k) / 0.22) ** 2));
		const al = lerp(0.62, 1, pass);
		const wd = lerp(1.15, 1.9, pass);
		const n = Math.ceil(ND * p);
		let qa = cam.project(Dk.pts[0]);
		for (let i = 0; i < n; i++) {
			let b = Dk.pts[i + 1];
			const fr = Math.min(1, ND * p - i);
			if (fr < 1) b = lerp3(Dk.pts[i], b, fr);
			const qb = cam.project(b);
			if (qa[2] > NEAR && qb[2] > NEAR && !offBoard(qa, qb, w, h)) {
				const mm = mul3(add3(Dk.pts[i], b), 0.5);
				const front = dot(mm, eye) > dot(mm, mm);
				const mz = (qa[2] + qb[2]) / 2;
				const hid = front && behind(Z, (qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, mz, relZ, 0.3);
				const ws = Math.min(1.7, Math.max(0.5, ref / mz));
				if (front && !hid) ink2.seg(PAL.chalk, al, wd * ws, false, qa[0], qa[1], qb[0], qb[1]);
				else if (!front && backA > 0.01)
					ink2.seg(PAL.chalk, backA, 0.9, true, qa[0], qa[1], qb[0], qb[1]);
			}
			qa = qb;
		}
		const qc = cam.project(Dk.centre);
		if (p >= 1 && qc[2] > NEAR && dot(Dk.centre, eye) > R * R)
			disc(ctx, qc[0], qc[1], 1.8 + 1.4 * pass, { fill: PAL.chalk, alpha: 0.8 });
	});
	ink2.flush(ctx);

	// The fixed points: the source a ring, the sink lit once the flow is in.
	const qs = cam.project(SOURCE);
	if (qs[2] > NEAR && dot(SOURCE, eye) > R * R) {
		ctx.save();
		ctx.globalAlpha = 0.7 * fadeIn;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.arc(qs[0], qs[1], 4, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}
	const lit = smooth(span(u, U_LINES[1] - 0.012, U_LINES[1] + 0.02));
	const qp = cam.project(POLE);
	if (lit > 0 && qp[2] > NEAR && dot(POLE, eye) > R * R) {
		const r = lerp(3, 4.4, smooth(span(u, 0.7, 1)));
		bloom(ctx, qp[0], qp[1], r * 5, 'rgba(245, 193, 80, 0.5)', 0.55 * lit);
		disc(ctx, qp[0], qp[1], r, { fill: PAL.gold, alpha: lit });
		disc(ctx, qp[0], qp[1], r * 0.42, { fill: '#fff6e0', alpha: 0.9 * lit });
	}
}

// ── The body, knitted ────────────────────────────────────────────────────────
function drawBody(ctx, cam, w, h, t, Z, mesh, Q, f, eye, B) {
	const ink = makeInk();
	const closed = t > T_KNIT1;
	const backA = 0.15 * (1 - smooth(span(t, T_KNIT1, T_KNIT1 + 0.8)));
	const mid = B.C[Math.round(NS / 2)];
	const ref = Math.max(2, Math.hypot(...sub3(eye, mid)) * 0.8);
	const P = mesh.P;
	const Nm = mesh.N;
	let needle = null;

	const seg = (a, b, qa, qb, na, nb, alpha, width) => {
		if (qa[2] <= NEAR || qb[2] <= NEAR || offBoard(qa, qb, w, h)) return;
		const mx = (qa[0] + qb[0]) / 2;
		const my = (qa[1] + qb[1]) / 2;
		const mz = (qa[2] + qb[2]) / 2;
		let back = behind(Z, mx, my, mz, 0.006, 0.01);
		if (!back && closed) {
			const m = mul3(add3(a, b), 0.5);
			back = dot(add3(na, nb), sub3(eye, m)) < 0;
		}
		if (back) {
			if (backA > 0.01) ink.seg(PAL.chalk, backA, 0.9, true, qa[0], qa[1], qb[0], qb[1]);
			return;
		}
		const ws = Math.min(2.2, Math.max(0.6, ref / mz));
		ink.seg(PAL.chalk, alpha, width * ws, false, qa[0], qa[1], qb[0], qb[1]);
	};

	for (let k = 0; k < NK; k++) {
		const fk = f[k];
		if (fk <= 0) break;
		const S = ST[k];
		const r = ROWS[S.row];
		if (!S.par.length) continue;
		const fresh = 1 - smooth(span(t, S.t0 + S.d, S.t0 + S.d + 0.45));
		const ridge = r.s === S_RIDGE;
		const al = Math.min(1, (ridge ? 0.95 : 0.78) + 0.22 * fresh);
		const wd = ridge ? 1.6 : 1.05;
		// The wale(s): pulled down from the loop(s) above.
		const fw = S.d > 0 ? Math.min(1, 2 * fk) : 1;
		for (const p of S.par) {
			if (fw >= 1) seg(P[p], P[k], Q[p], Q[k], Nm[p], Nm[k], al, 1.05);
			else {
				const b = lerp3(P[p], P[k], fw);
				const qb = cam.project(b);
				seg(P[p], b, Q[p], qb, Nm[p], Nm[k], al, 1.05);
				needle = [b, qb];
			}
		}
		// The course: across to the next stitch on the round.
		if (r.tip) continue;
		const fc = S.d > 0 ? Math.max(0, 2 * fk - 1) : 1;
		if (fc <= 0) continue;
		const n = S.next;
		if (fc >= 1) seg(P[k], P[n], Q[k], Q[n], Nm[k], Nm[n], al, wd);
		else {
			const b = lerp3(P[k], P[n], fc);
			const qb = cam.project(b);
			seg(P[k], b, Q[k], qb, Nm[k], Nm[n], al, wd);
			needle = [b, qb];
		}
	}
	ink.flush(ctx);

	// The needle: a lit point where the yarn is being laid.
	if (needle && t < T_KNIT1) {
		const q = needle[1];
		if (q[2] > NEAR) {
			const hid = behind(Z, q[0], q[1], q[2], 0.006, 0.02);
			const a = hid ? 0.35 : 1;
			bloom(ctx, q[0], q[1], 13, 'rgba(245, 193, 80, 0.45)', 0.5 * a);
			disc(ctx, q[0], q[1], 2.4, { fill: PAL.gold, alpha: a });
			disc(ctx, q[0], q[1], 1, { fill: '#fff6e0', alpha: 0.9 * a });
		}
	}
	// Life: a spark at the midpiece.
	const spark =
		span(t, T_LIFE - 0.1, T_LIFE + 0.15) * (1 - smooth(span(t, T_LIFE + 0.3, T_LIFE + 1.3)));
	if (spark > 0) {
		let i = 0;
		while (STN[i] < 7.6) i++;
		const q = cam.project(B.C[i]);
		if (q[2] > NEAR) {
			const hid = behind(Z, q[0], q[1], q[2] - 0.6, 0.006, 0.02);
			const a = spark * (hid ? 0.4 : 1);
			bloom(ctx, q[0], q[1], 22, 'rgba(245, 193, 80, 0.5)', 0.6 * a);
			disc(ctx, q[0], q[1], 2.6, { fill: PAL.gold, alpha: a });
		}
	}
}
