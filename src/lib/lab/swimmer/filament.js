// ── log-swimmer · filament ───────────────────────────────────────────────────
// The swimmer WOUND, as a carbon pressure vessel is: one thread, the pen never
// lifting, laid pass after pass along geodesics of a mandrel that is never
// drawn — and set swimming up the horn of Beltrami's pseudosphere.
//
// The mandrel is one smooth implicit surface F(p) = 0 in the rest pose, the
// nose at x = 0 and the body down −x: the head, the triaxial ellipsoid of
// semi-axes 2.5, 1.5, 0.75 centred at x = −2.5 (its distance estimate
// k0(k0 − 1)/k1), the acrosome a step 3% of its thickness proud over its front
// two-thirds; smooth-unioned (cubic polynomial smin, k = 0.3) with a tube
// |(y, z)| = r(x): the neck pinched to 0.45 at x = −5.3, the midpiece 0.5 over
// −5.6 to −9, the tail 0.45 tapering exponentially to 0.06 at x = −54. Every
// frame a 40 × 24 grid of it, carried by the beat and the roll, goes into the
// depth buffer: invisible, it hides its own far side.
//
// The thread is computed once, at make(), as a chain of geodesics of F, by
// RK4 on ẍ = −(ẋᵀ∇²F ẋ / |∇F|²)∇F with a Newton projection onto F = 0 after
// every step (no coordinate singularity anywhere, the nose pole included).
// Between passes a short steered arc (constant geodesic curvature, at most 0.6
// long, shot so it ends at the heading wanted) turns it, as a fibre-placement
// head steers. The schedule:
//   lead      from the nose down the rim (the oval's outline) to the waist;
//   6 HEAD    traverses, nose end to neck end and back, each about once round
//             the head; at each turn a dwell, steered along the turn, advances
//             the pattern ~40° and releases it toward the other end, so the
//             traverses cross into a diamond net (a turn past x = −4.42 is
//             forced, short of the neck);
//   HOOP      five turns over the acrosome, x −0.7 to −3.3 at ψ ≈ 80–85°,
//             re-aimed every third of a turn (a band with its rim at the back);
//   REACHING  passes launched from the neck at c_k = 0.45·0.72^k (≥ 0.07): the
//             neck itself (c = 0.45, its waist), then each down the tail to its
//             Clairaut turn r = c — x ≈ −17, −24, −32, −39, −46, −51 — back up
//             and over the head, until the last ties off at its turn by the tip.
// About 3000 samples, denser where it curves, each stored as (x, its offset in
// the section), lifted 1% of the local radius off the mandrel.
// At make() it ASSERTS: the geodesic curvature between steers is under 1e−3 of
// the curvature (or of 1/r), and r·sin ψ = y ż − z ẏ holds to 1e−4 along every
// tube stretch.
//
// Beat by beat (t in seconds of 20; at = t/20):
//   0–0.4     (0–0.02)   dark; the gold pen point appears at the nose.
//   0.4–3.2   (0.02–0.16) THE COCOON: the lead-in, then the traverses, the
//             lens orbiting the body's axis (az 20° → 90°, el 30°): the oval
//             appears as the crossings thicken, edge-on and thin at ~2.5 s.
//   3.2–3.8   (0.16–0.19) the hoop over the acrosome.
//   3.8–7.6   (0.19–0.38) THE TAIL SPUN OUT: each pass runs further down, as a
//             shallow helix whose pitch tightens toward its turn (sin ψ = c/r);
//             the lens pulls back from 30 to 70.
//   7.6–8.2   (0.38–0.41) the pen's light goes out at the tip.
//   8.2–9.6   (0.41–0.48) LIFE: the beat runs in from the neck to the tip,
//             2.5 wavelengths, the head yawing against it; then the roll
//             (0.5 turn/s) — the crossings slide round, a solid turning.
//   9.6–12    (0.48–0.6)  the PSEUDOSPHERE out of the dark as the lens pulls
//             back: the rim, the meridians rising, the parallels, the
//             geodesics wound on by fast gold points.
//   12–19.6   (0.6–0.98)  THE APPROACH: in over the rim and up the outside of
//             the horn along a meridian, the lens behind and outside, the pace
//             gathering then holding: the parallels pass at one rhythm, the
//             geodesics' turning parallels one after another, to u ≈ 6
//             (radius R/200), the cusp still infinitely far ahead.
//   19.6–20   fade, and round.
//
// EXACT: the thread is a geodesic of F between steers (checked as above); the
// pseudosphere ρ = R sech u, h = R(u − tanh u), K = −1/R²; its meridian arc
// s = R ln cosh u, so ρ = R e^{−s/R} exactly and the parallels, drawn at equal
// steps of s, are each e^{−Δ/R} the last; its geodesics in closed form, the
// half-plane semicircles (θ − θ0)² + Y² = r0² in (θ, Y = cosh u), winding
// √(r0² − 1)/π times round to the parallel Y = r0 of radius R/r0 (Clairaut) —
// and Δ = R ln q for their ratio q, so every turning parallel is a drawn one.
// A PICTURE: the mandrel's profile and blend; the steers and the pass
// schedule; the beat (a travelling wave of tangent angle, integrated so the
// tail keeps its length), the yaw and the roll; R = 2.5 swimmer-lengths; the
// path, the meridian lifted 4.5 off the surface, come in on a straight line.
// Hidden lines: one software depth buffer per frame, the horn's 48 × 32 grid
// (clipped at the near plane) and the swimmer's mandrel together.

import { PAL, TAU, span, smooth, lerp, cross, norm, camera3 } from '../log/board.js';
import { NEAR, makeDepth, lit3 } from '../log/space.js';

export const meta = {
	title:
		"one thread, the pen never lifting: the body wound on an invisible mandrel, geodesic pass after pass, the tail spun out → up the pseudosphere's horn",
	order: 12,
	seconds: 20,
	three: false
};

const DEG = Math.PI / 180;
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const q5 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (6 * t - 15) + 10));

// ── The mandrel ──────────────────────────────────────────────────────────────
const HC = -2.5; // the head's centre
const HA = 2.5; // its semi-axes: length,
const HB = 1.5; //   width (y, the beat plane),
const HZ = 0.75; //   thickness (z)
const CAP_X = -3.33; // the acrosome's rim, two-thirds back
const CAP_W = 0.05;
const CAP_H = 0.03 * HZ;
const KS = 0.3; // the smooth union
const NOSE_CAP = -3.5; // the tube's front cap, inside the head
const NECK = -5.3;
const X0 = -9.2; // where the taper begins
const S0 = 1.0;
const TIP = -54;
const RT = 0.45;
const G1 = Math.sqrt((X0 - TIP) ** 2 + S0 * S0) - S0;
const LAM = Math.log(RT / 0.06) / G1;
const LEN = -TIP; // the body's length, 54

// r(x), r'(x), r''(x): the tube's profile.
function profile(x) {
	let r = RT;
	let r1 = 0;
	let r2 = 0;
	if (x < X0) {
		const s = X0 - x;
		const q = Math.sqrt(s * s + S0 * S0);
		r = RT * Math.exp(-LAM * (q - S0));
		const g1 = s / q;
		const g2 = (S0 * S0) / (q * q * q);
		r1 = r * LAM * g1;
		r2 = r * LAM * LAM * g1 * g1 - r * LAM * g2;
	}
	if (x < -5.3 && x > -9.4) {
		// the midpiece's 0.05: quintic steps, done numerically (it is short)
		const b = (z) => 0.05 * q5((z + 5.3) / -0.3) * (1 - q5((z + 9.0) / -0.4));
		const h = 1e-4;
		const b0 = b(x);
		const bp = b(x + h);
		const bm = b(x - h);
		r += b0;
		r1 += (bp - bm) / (2 * h);
		r2 += (bp - 2 * b0 + bm) / (h * h);
	}
	return [r, r1, r2];
}
const rOf = (x) => profile(x)[0];

const IA = [1 / (HA * HA), 1 / (HB * HB), 1 / (HZ * HZ)];
const IB = [IA[0] * IA[0], IA[1] * IA[1], IA[2] * IA[2]];
// The head along a unit direction v at p: [F, dF/dε, d²F/dε²], gradient into g.
function head(p, v, g) {
	const X = p[0] - HC;
	const y = p[1];
	const z = p[2];
	const a0 = X * X * IA[0] + y * y * IA[1] + z * z * IA[2];
	const b0 = X * v[0] * IA[0] + y * v[1] * IA[1] + z * v[2] * IA[2];
	const c0 = v[0] * v[0] * IA[0] + v[1] * v[1] * IA[1] + v[2] * v[2] * IA[2];
	const a1 = X * X * IB[0] + y * y * IB[1] + z * z * IB[2];
	const b1 = X * v[0] * IB[0] + y * v[1] * IB[1] + z * v[2] * IB[2];
	const c1 = v[0] * v[0] * IB[0] + v[1] * v[1] * IB[1] + v[2] * v[2] * IB[2];
	const k0 = Math.sqrt(a0);
	const k1 = Math.sqrt(a1);
	const k0d = b0 / k0;
	const k0dd = (c0 * a0 - b0 * b0) / (a0 * k0);
	const k1d = b1 / k1;
	const k1dd = (c1 * a1 - b1 * b1) / (a1 * k1);
	const N = a0 - k0;
	const Nd = (2 * k0 - 1) * k0d;
	const Ndd = 2 * k0d * k0d + (2 * k0 - 1) * k0dd;
	const k12 = k1 * k1;
	const f = N / k1;
	const fd = (Nd * k1 - N * k1d) / k12;
	const fdd = Ndd / k1 - (2 * Nd * k1d) / k12 - (N * k1dd) / k12 + (2 * N * k1d * k1d) / (k12 * k1);
	const ga = (2 * k0 - 1) / (k0 * k1);
	const gb = N / (k12 * k1);
	g[0] = (ga * IA[0] - gb * IB[0]) * X;
	g[1] = (ga * IA[1] - gb * IB[1]) * y;
	g[2] = (ga * IA[2] - gb * IB[2]) * z;
	// the acrosome: a logistic step of CAP_H, proud in front of CAP_X
	const cap = 1 / (1 + Math.exp(-(p[0] - CAP_X) / CAP_W));
	const c1x = (cap * (1 - cap)) / CAP_W;
	const c2x = (c1x * (1 - 2 * cap)) / CAP_W;
	g[0] -= CAP_H * c1x;
	return [f - CAP_H * cap, fd - CAP_H * c1x * v[0], fdd - CAP_H * c2x * v[0] * v[0]];
}
// The tube round the axis, capped at both ends.
function tube(p, v, g) {
	const x = p[0];
	const y = p[1];
	const z = p[2];
	if (x > NOSE_CAP || x < TIP) {
		const cx = x > NOSE_CAP ? NOSE_CAP : TIP;
		const rr = x > NOSE_CAP ? RT : rOf(TIP);
		const d0 = x - cx;
		const L = Math.hypot(d0, y, z);
		g[0] = d0 / L;
		g[1] = y / L;
		g[2] = z / L;
		const vu = v[0] * g[0] + v[1] * g[1] + v[2] * g[2];
		const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
		return [L - rr, vu, (vv - vu * vu) / L];
	}
	const rho = Math.hypot(y, z);
	const [r0, r1, r2] = profile(x);
	const ey = y / rho;
	const ez = z / rho;
	g[0] = -r1;
	g[1] = ey;
	g[2] = ez;
	const vr = v[1] * ey + v[2] * ez;
	return [
		rho - r0,
		-r1 * v[0] + vr,
		-r2 * v[0] * v[0] + (v[1] * v[1] + v[2] * v[2] - vr * vr) / rho
	];
}
const GA = [0, 0, 0];
const GB = [0, 0, 0];
// F, its gradient (into g) and vᵀ∇²F v: the cubic smooth union of the two.
function evalF(p, v, g) {
	const b = tube(p, v, GB);
	if (p[0] < -6.2) {
		g[0] = GB[0];
		g[1] = GB[1];
		g[2] = GB[2];
		return b;
	}
	const a = head(p, v, GA);
	const dl = a[0] - b[0];
	const hh = Math.max(KS - Math.abs(dl), 0) / KS;
	const Fa = hh <= 0 ? (dl < 0 ? 1 : 0) : dl < 0 ? 1 - (hh * hh) / 2 : (hh * hh) / 2;
	const Fb = 1 - Fa;
	g[0] = Fa * GA[0] + Fb * GB[0];
	g[1] = Fa * GA[1] + Fb * GB[1];
	g[2] = Fa * GA[2] + Fb * GB[2];
	const dd = a[1] - b[1];
	return [
		Math.min(a[0], b[0]) - (hh * hh * hh * KS) / 6,
		Fa * a[1] + Fb * b[1],
		-(hh / KS) * dd * dd + Fa * a[2] + Fb * b[2]
	];
}

// ── Geodesics ────────────────────────────────────────────────────────────────
const GG = [0, 0, 0];
// ẍ = −(ẋᵀ∇²F ẋ / |∇F|²)∇F, plus kg·(n × ẋ) on a steered arc.
function acc(p, v, kg, out) {
	const r = evalF(p, v, GG);
	const g2 = GG[0] * GG[0] + GG[1] * GG[1] + GG[2] * GG[2];
	const s = -r[2] / g2;
	out[0] = s * GG[0];
	out[1] = s * GG[1];
	out[2] = s * GG[2];
	if (kg) {
		const gl = Math.sqrt(g2);
		const n0 = GG[0] / gl;
		const n1 = GG[1] / gl;
		const n2 = GG[2] / gl;
		out[0] += kg * (n1 * v[2] - n2 * v[1]);
		out[1] += kg * (n2 * v[0] - n0 * v[2]);
		out[2] += kg * (n0 * v[1] - n1 * v[0]);
	}
}
const VX = [1, 0, 0];
// Newton onto F = 0, then the velocity made tangent and unit: [p, v, n].
function settle(p, v) {
	const g = [0, 0, 0];
	for (let i = 0; i < 4; i++) {
		const f = evalF(p, VX, g)[0];
		const g2 = g[0] * g[0] + g[1] * g[1] + g[2] * g[2];
		p[0] -= (f * g[0]) / g2;
		p[1] -= (f * g[1]) / g2;
		p[2] -= (f * g[2]) / g2;
		if (Math.abs(f) < 1e-13) break;
	}
	evalF(p, VX, g);
	const gl = Math.hypot(g[0], g[1], g[2]);
	const n = [g[0] / gl, g[1] / gl, g[2] / gl];
	const vn = v[0] * n[0] + v[1] * n[1] + v[2] * n[2];
	const w0 = v[0] - vn * n[0];
	const w1 = v[1] - vn * n[1];
	const w2 = v[2] - vn * n[2];
	const wl = Math.hypot(w0, w1, w2);
	return [p, [w0 / wl, w1 / wl, w2 / wl], n];
}
// The step: fine on the head and through the neck's and midpiece's steps, a
// fixed fraction of the radius down the tail.
const stepOf = (p) =>
	p[0] > -4.9 ? 0.012 : p[0] > -9.7 ? 0.008 : clamp(0.055 * Math.hypot(p[1], p[2]), 0.002, 0.025);
const K1 = [0, 0, 0];
const K2 = [0, 0, 0];
const K3 = [0, 0, 0];
const K4 = [0, 0, 0];
function rk4(p, v, h, kg) {
	acc(p, v, kg, K1);
	const p2 = [p[0] + (v[0] * h) / 2, p[1] + (v[1] * h) / 2, p[2] + (v[2] * h) / 2];
	const v2 = [v[0] + (K1[0] * h) / 2, v[1] + (K1[1] * h) / 2, v[2] + (K1[2] * h) / 2];
	acc(p2, v2, kg, K2);
	const p3 = [p[0] + (v2[0] * h) / 2, p[1] + (v2[1] * h) / 2, p[2] + (v2[2] * h) / 2];
	const v3 = [v[0] + (K2[0] * h) / 2, v[1] + (K2[1] * h) / 2, v[2] + (K2[2] * h) / 2];
	acc(p3, v3, kg, K3);
	const p4 = [p[0] + v3[0] * h, p[1] + v3[1] * h, p[2] + v3[2] * h];
	const v4 = [v[0] + K3[0] * h, v[1] + K3[1] * h, v[2] + K3[2] * h];
	acc(p4, v4, kg, K4);
	const pn = [0, 0, 0];
	const vn = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		pn[i] = p[i] + (h / 6) * (v[i] + 2 * v2[i] + 2 * v3[i] + v4[i]);
		vn[i] = v[i] + (h / 6) * (K1[i] + 2 * K2[i] + 2 * K3[i] + K4[i]);
	}
	return settle(pn, vn);
}
function run(st, { kg = 0, len = Infinity, stop = null, rec = null }) {
	let s = 0;
	while (s < len) {
		let h = stepOf(st.p);
		if (s + h > len) h = len - s;
		if (h < 1e-9) break;
		const r = rk4(st.p, st.v, h, kg);
		st.p = r[0];
		st.v = r[1];
		st.n = r[2];
		s += h;
		st.L += h;
		if (rec) rec(st);
		if (stop && stop(st, s)) break;
	}
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// The tangent frame: m the backward meridian, e = n × m, round the axis.
function frameOf(st) {
	const n = st.n;
	const k = -n[0];
	const m = norm([-1 - k * n[0], -k * n[1], -k * n[2]]);
	return [m, cross(n, m)];
}
const alphaOf = (st) => {
	const [m, e] = frameOf(st);
	return Math.atan2(dot(st.v, e), dot(st.v, m));
};
// The Clairaut constant round the x-axis: r sin ψ for a unit velocity.
const clairaut = (st) => st.p[1] * st.v[2] - st.p[2] * st.v[1];

// ── The thread ───────────────────────────────────────────────────────────────
const HEAD_PASSES = 7;
const PRECESS = 40 * DEG; // each head pass's heading, turned from the last's
const CIRCUIT = 9; // a head pass's set length, about once round
const BACK_LIMIT = -4.42; // turned here at the latest, short of the neck
const TURN_BACK = 125 * DEG; // …toward the front
const HOOP_END = -3.3;
const HOOP_TURN = 0.6; // the hoop's advance a turn
const HOOP_PART = 1.0;
const HOOP_STEER = 0.25;
const CS = [0, 1, 2, 3, 4, 5, 6].map((k) => Math.max(0.07, 0.45 * Math.pow(0.72, k)));

function buildThread() {
	// every step: x y z, L, pass, steered, v, n
	const F = [];
	const st = { p: [0, 0, 0], v: [0, 1, 0], n: [1, 0, 0], L: 0 };
	let pass = 0;
	let kind = 0;
	const rec = (s) => F.push([s.p[0], s.p[1], s.p[2], s.L, pass, kind, ...s.v, ...s.n]);
	rec(st);
	const passes = [];
	const begin = (name) => passes.push({ name, L0: st.L });
	const geo = (len, stop) => {
		kind = 0;
		run(st, { len, stop, rec });
	};
	// A steered arc: constant geodesic curvature, shot (secant) to err(end) = 0.
	const steer = (len, err) => {
		kind = 1;
		const s0 = { p: st.p, v: st.v, n: st.n, L: st.L };
		const trial = (kg) => {
			const s = { p: s0.p.slice(), v: s0.v.slice(), n: s0.n, L: s0.L };
			run(s, { kg, len });
			return err(s);
		};
		let k0 = 0;
		let e0 = trial(0);
		let k1 = -e0 / len;
		let e1 = trial(k1);
		for (let i = 0; i < 8 && Math.abs(e1) > 1e-10; i++) {
			const k2 = k1 - (e1 * (k1 - k0)) / (e1 - e0 || 1e-12);
			k0 = k1;
			e0 = e1;
			k1 = k2;
			e1 = trial(k1);
		}
		run(st, { kg: k1, len, rec });
	};
	// the heading's error, wrapped to (−π, π], so the shot has one root
	const toAlpha = (target) => (s) => {
		const d = alphaOf(s) - target(s);
		return Math.atan2(Math.sin(d), Math.cos(d));
	};

	// The lead-in, down the rim from the nose.
	begin('lead');
	geo(2.9);
	pass++;
	// The head passes: each a set length, about once round, after a steer
	// that precesses the heading by 40°; turned short of the neck if it heads
	// there (a steered arc, then on).
	const circ = (s) => Math.sign(Math.sin(alphaOf(s))) || 1;
	for (let k = 0; k < HEAD_PASSES; k++) {
		begin('head');
		const a0 = alphaOf(st) + PRECESS;
		steer(
			0.6,
			toAlpha(() => a0)
		);
		let left = CIRCUIT;
		for (let guard = 0; left > 1e-6 && guard < 6; guard++) {
			const L0 = st.L;
			geo(left, (s) => s.p[0] < BACK_LIMIT && s.v[0] < 0);
			left -= st.L - L0;
			if (left > 1e-6) {
				const sg = circ(st);
				steer(
					0.6,
					toAlpha(() => sg * TURN_BACK)
				);
				left -= 0.6;
			}
		}
		pass++;
	}
	// Up to the nose's end for the hoop.
	begin('front');
	{
		const sg = circ(st);
		steer(
			0.6,
			toAlpha(() => sg * 150 * DEG)
		);
		geo(10, (s, l) => s.p[0] > -0.6 || (l > 0.5 && s.v[0] <= 0) || s.p[0] < BACK_LIMIT);
	}
	pass++;
	// The hoop, aimed so each part's mean heading gives the pitch: a
	// geodesic's heading drifts by (r'/r)·ℓ over a part ℓ (Clairaut on the
	// mean section, r ∝ √(1 − X²/a²)).
	begin('hoop');
	const hs = Math.sign(Math.sin(alphaOf(st))) || 1;
	const perim = (x) => {
		const X = (x - HC) / HA;
		const f = Math.sqrt(Math.max(0.01, 1 - X * X));
		const a = HB * f + 0.02;
		const b = HZ * f + 0.02;
		return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
	};
	const hoopAlpha = (s) => {
		const X = s.p[0] - HC;
		const drift = (-X / (HA * HA - X * X)) * HOOP_PART;
		return hs * (Math.atan(perim(s.p[0]) / HOOP_TURN) - drift / 2);
	};
	for (let guard = 0; st.p[0] > HOOP_END && guard < 200; guard++) {
		steer(HOOP_STEER, toAlpha(hoopAlpha));
		if (st.p[0] <= HOOP_END) break;
		geo(HOOP_PART, (s) => s.p[0] < HOOP_END);
	}
	pass++;
	// Down to the neck.
	begin('neck');
	steer(
		0.6,
		toAlpha(() => hs * 6 * DEG)
	);
	geo(20, (s) => s.p[0] < NECK);
	pass++;
	// The reaching passes.
	let sg = hs;
	const turns = [];
	for (let k = 0; k < CS.length; k++) {
		const c = CS[k];
		begin('reach');
		const last = k === CS.length - 1;
		if (k === 0) {
			// the neck's own: launched round its waist, once round
			steer(
				0.6,
				toAlpha(() => (sg * Math.PI) / 2)
			);
			geo(TAU * RT);
		} else {
			steer(0.6, (s) => clairaut(s) - sg * c);
			let onHead = false;
			let turned = false;
			geo(800, (s) => {
				if (!turned && s.v[0] > 0) {
					turned = true;
					turns.push([s.p[0], s.L]);
					if (last) return true;
				}
				if (s.p[0] > -4.6) onHead = true;
				return onHead && s.p[0] < NECK && s.v[0] < 0;
			});
			if (!last) sg = Math.sign(clairaut(st)) || sg;
		}
		pass++;
	}
	passes.forEach((P, i) => (P.L1 = i + 1 < passes.length ? passes[i + 1].L0 : st.L));
	return { F, passes, total: st.L, turns };
}

// The checks. The geodesic curvature, step by step between steers: the
// tangent's turn over the step, Δv/h, against the binormal n × t at its
// middle — second order in the step, whatever the step — relative to the
// whole curvature, or 1/r where the thread runs nearly straight; and
// Clairaut's r·sin ψ = y ż − z ẏ along every run on the pure tube.
function checkThread(F) {
	let kgMax = 0;
	for (let i = 1; i < F.length; i++) {
		const a = F[i - 1];
		const b = F[i];
		if (a[5] || b[5] || a[4] !== b[4]) continue;
		const h = b[3] - a[3];
		if (h < 1e-5) continue;
		const k = [(b[6] - a[6]) / h, (b[7] - a[7]) / h, (b[8] - a[8]) / h];
		const nm = norm([a[9] + b[9], a[10] + b[10], a[11] + b[11]]);
		const tm = norm([a[6] + b[6], a[7] + b[7], a[8] + b[8]]);
		const kg = Math.abs(dot(k, cross(nm, tm)));
		const rho = clamp(Math.hypot(a[1] + b[1], a[2] + b[2]) / 2, 0.05, 1.5);
		const rel = kg / (Math.hypot(k[0], k[1], k[2]) + 1 / rho);
		if (rel > kgMax) kgMax = rel;
	}
	// Clairaut: along each unbroken run on the pure tube (x < −6.3, geodesic)
	let cMax = 0;
	let c0 = null;
	let pass = -1;
	for (const f of F) {
		const on = f[0] < -6.3 && !f[5];
		if (!on || f[4] !== pass) c0 = null;
		pass = f[4];
		if (!on) continue;
		const c = f[1] * f[8] - f[2] * f[7];
		if (c0 === null) c0 = c;
		else cMax = Math.max(cMax, Math.abs(c - c0) / Math.abs(c0));
	}
	return { kgMax, cMax };
}

// The samples: denser where the thread curves; at every pass and steer boundary.
function sampleThread(F) {
	const keep = [0];
	let last = F[0];
	let dphi = 0;
	for (let i = 1; i < F.length; i++) {
		const f = F[i];
		const p = F[i - 1];
		const edge = i === F.length - 1 || f[4] !== F[i + 1][4] || f[5] !== F[i + 1][5];
		const rho = Math.hypot(f[1], f[2]);
		const prho = Math.hypot(p[1], p[2]);
		let d = Math.atan2(f[2], f[1]) - Math.atan2(p[2], p[1]);
		if (d > Math.PI) d -= TAU;
		if (d < -Math.PI) d += TAU;
		if (rho > 1e-3 && prho > 1e-3) dphi += d;
		const ds = f[3] - last[3];
		let emit = edge;
		if (!emit) {
			if (f[0] > -5.6) {
				const ang = Math.acos(clamp(f[6] * last[6] + f[7] * last[7] + f[8] * last[8], -1, 1));
				emit = ang > 0.15 || ds > 0.32;
			} else {
				emit = Math.abs(dphi) > TAU / clamp(30 * rho, 5, 14) || ds > 1.5;
			}
		}
		if (emit) {
			keep.push(i);
			last = f;
			dphi = 0;
		}
	}
	return keep;
}

// ── The swimmer: the beat, the yaw, the roll ─────────────────────────────────
const A_NECK = 5.3; // head and neck rigid in front of it
const L_TAIL = LEN - A_NECK;
const KW = (TAU * 2.5) / L_TAIL; // 2.5 wavelengths down the tail
const BEAT_HZ = 2.4;
const B_TIP = 0.62; // the tangent angle's amplitude at the tip
const YAW = 0.55;
const ROLL_HZ = 0.5;
const PHI0 = 210 * DEG; // the rest roll: the head face-on to the lens at the end
const NST = 108; // stations down the body
const DA = LEN / NST;
const T_BEAT = 8.2;
const T_ROLL = [9.0, 9.6];
// ∫ smooth(span(x, a, b)) dx from a, closed form.
function iS(x, a, b) {
	if (x <= a) return 0;
	if (x >= b) return (b - a) / 2 + (x - b);
	const y = (x - a) / (b - a);
	return (b - a) * (y * y * y - (y * y * y * y) / 2);
}
const rollOf = (t) => PHI0 + TAU * ROLL_HZ * iS(t, T_ROLL[0], T_ROLL[1]);

// ── The pseudosphere and the path up it ──────────────────────────────────────
const R = 2.5 * LEN; // 135
const U_END = 6;
const S_END = R * Math.log(Math.cosh(U_END)); // the meridian's arc to u = 6
const U_DRAW = 8.5; // the horn drawn on past the run's end, to radius R/2500
const S_DRAW = R * Math.log(Math.cosh(U_DRAW));
const LIFT = 4.5; // the swimmer off the surface
const U1 = Math.asinh((3 * LIFT) / R); // the path joins the lifted meridian here
const SIG1 = R * Math.log(Math.cosh(U1));
const NG = 14; // geodesics
const QG = Math.pow(30, 1 / (NG - 1)); // their r0 = 2·q^i, 2 … 60
const DPAR = R * Math.log(QG); // the parallels' step in s
// The meridian θ = 0 at arc s: point, tangent, outer normal (in x, y; z = 0).
function meridian(s) {
	const e = Math.exp(-s / R); // sech u
	const Y = 1 / e; // cosh u
	const th = Math.sqrt(Math.max(0, 1 - e * e)); // tanh u
	const u = Math.log(Y + Math.sqrt(Math.max(0, Y * Y - 1)));
	return { P: [R * e, R * (u - th), 0], T: [-e, th, 0], U: [th, e, 0] };
}
const PS = (() => {
	const m = meridian(SIG1);
	return { P: [m.P[0] + LIFT * m.U[0], m.P[1] + LIFT * m.U[1], 0], T: m.T, U: m.U };
})();
// The swimmer's path, by σ: in on a straight line, then the meridian lifted.
function pathAt(sig, out) {
	if (sig < SIG1) {
		const d = sig - SIG1;
		out.P[0] = PS.P[0] + d * PS.T[0];
		out.P[1] = PS.P[1] + d * PS.T[1];
		out.P[2] = 0;
		out.T[0] = PS.T[0];
		out.T[1] = PS.T[1];
		out.U[0] = PS.U[0];
		out.U[1] = PS.U[1];
		return out;
	}
	const m = meridian(sig);
	out.P[0] = m.P[0] + LIFT * m.U[0];
	out.P[1] = m.P[1] + LIFT * m.U[1];
	out.P[2] = 0;
	out.T[0] = m.T[0];
	out.T[1] = m.T[1];
	out.U[0] = m.U[0];
	out.U[1] = m.U[1];
	return out;
}
const SVEC = [0, 0, -1]; // T × U, the same all along the meridian plane
// The pace: at rest, gathering from 8.4 s to 13.5 s, then holding; over the
// rim at 12.5 s, at u = 6 at 19.6 s.
const V_ON = [8.4, 13.5];
const V1 = S_END / (iS(19.6, V_ON[0], V_ON[1]) - iS(12.5, V_ON[0], V_ON[1]));
const SIG0 = -V1 * iS(12.5, V_ON[0], V_ON[1]);
const sigmaOf = (t) => SIG0 + V1 * iS(t, V_ON[0], V_ON[1]);

// ── The horn's lines and grid, once ──────────────────────────────────────────
// A point of the pseudosphere at (u, θ).
const hornAt = (u, th) => {
	const r = R / Math.cosh(u);
	return [r * Math.cos(th), R * (u - Math.tanh(u)), r * Math.sin(th)];
};
// …and by (θ, Y = cosh u), the half-plane's coordinates.
const hornY = (th, Y) => {
	const r = R / Y;
	const u = Math.log(Y + Math.sqrt(Math.max(0, Y * Y - 1)));
	return [r * Math.cos(th), R * (u - Math.sqrt(Math.max(0, 1 - 1 / (Y * Y)))), r * Math.sin(th)];
};
const sOfU = (u) => R * Math.log(Math.cosh(u));
function buildHorn() {
	const lines = [];
	const add = (kind, P, S, extra = {}) => lines.push({ kind, P, S, ...extra });
	// the rim, from the swimmer's meridian round both ways
	{
		const P = [];
		const S = [];
		for (let i = 0; i <= 160; i++) {
			const th = (TAU * i) / 160;
			P.push(hornAt(0, th));
			S.push(Math.min(i, 160 - i) / 80); // its reveal order
		}
		add('rim', P, S);
	}
	// 24 meridians (tractrices): u-steps by the rim, s-steps up the horn
	const us = [];
	for (let u = 0; u < 1; u += 0.08) us.push(u);
	for (let s = sOfU(1); s < S_DRAW; s += 12) us.push(Math.acosh(Math.exp(s / R)));
	us.push(U_DRAW);
	for (let k = 0; k < 24; k++) {
		const th = (TAU * k) / 24;
		add(
			'mer',
			us.map((u) => hornAt(u, th)),
			us.map(sOfU),
			{ home: k === 0 }
		);
	}
	// the parallels at equal steps of s, each e^{−Δ/R} the last
	for (let s = R * Math.log(2) - 2 * DPAR; s <= S_DRAW + 1; s += DPAR) {
		const u = Math.acosh(Math.exp(s / R));
		const P = [];
		for (let i = 0; i <= 72; i++) P.push(hornAt(u, (TAU * i) / 72));
		add(
			'par',
			P,
			P.map(() => s)
		);
	}
	// the geodesics: (θ − θ0)² + Y² = r0², from the rim up to Y = r0 and down
	for (let i = 0; i < NG; i++) {
		const r0 = 2 * Math.pow(QG, i);
		const w = Math.sqrt(r0 * r0 - 1);
		const th0 = 0.35 + i * 2.39996 + w; // starts spread round the rim by the golden angle
		const P = [];
		const f1 = Math.asin(1 / r0);
		let f = f1;
		while (f < Math.PI - f1) {
			P.push(hornY(th0 - r0 * Math.cos(f), r0 * Math.sin(f)));
			const sf = Math.sin(f);
			const dth = TAU / 26 / (r0 * sf);
			const dlog = 0.07 / Math.max(1e-6, Math.abs(Math.cos(f) / sf));
			f += Math.max(1e-4, Math.min(dth, dlog));
		}
		P.push(hornY(th0 + w, 1));
		// arc length along it, for the pen that winds it on
		const C = [0];
		for (let j = 1; j < P.length; j++)
			C.push(
				C[j - 1] + Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1], P[j][2] - P[j - 1][2])
			);
		add(
			'geo',
			P,
			C.map((c) => c / C[C.length - 1]),
			{ i }
		);
	}
	// the depth grid, 48 × 32
	const grid = [];
	for (let i = 0; i < 32; i++) {
		const u = (U_DRAW * i) / 31;
		const row = [];
		for (let j = 0; j <= 48; j++) row.push(hornAt(u, (TAU * j) / 48));
		grid.push(row);
	}
	return { lines, grid };
}

// ── The mandrel's grid: 40 sections × 24, radii found once ───────────────────
const STATIONS = [
	0, -0.06, -0.2, -0.42, -0.72, -1.1, -1.55, -2.05, -2.6, -3.15, -3.3, -3.36, -3.6, -3.95, -4.3,
	-4.6, -4.85, -5.05, -5.3, -5.6, -6.4, -7.3, -8.2, -9.0, -9.6
];
for (let i = 1; i <= 15; i++) STATIONS.push(-9.6 - (44.4 * i) / 15);
function buildMandrel() {
	const g = [0, 0, 0];
	return STATIONS.map((x) => {
		const ring = [];
		for (let j = 0; j < 24; j++) {
			const th = (TAU * j) / 24;
			const c = Math.cos(th);
			const s = Math.sin(th);
			let lo = 0;
			let hi = 2.2;
			for (let k = 0; k < 40; k++) {
				const m = (lo + hi) / 2;
				if (evalF([x, m * c, m * s], VX, g)[0] < 0) lo = m;
				else hi = m;
			}
			ring.push([x, lo * c, lo * s]);
		}
		return ring;
	});
}

// ── The beat, the yaw, the roll, along the path: the body's frames ───────────
// Stations a = j·DA back from the nose: the centreline C, the in-plane normal
// N and the binormal B, in the world, for this t.
function makePose() {
	const n = NST + 1;
	const th = new Float64Array(n);
	const be = new Float64Array(n);
	const f = new Float64Array(n);
	const wl = new Float64Array(n);
	const C = new Float64Array(3 * n);
	const N = new Float64Array(3 * n);
	const B = new Float64Array(3 * n);
	const pt = { P: [0, 0, 0], T: [0, 0, 0], U: [0, 0, 0] };
	const pose = { C, N, B, sig: 0, phi: 0, T: [0, 0, 0], U: [0, 0, 0] };
	pose.at = (t) => {
		const sig = sigmaOf(t);
		const phi = rollOf(t);
		const tb = t - T_BEAT;
		let ym = 0;
		let yw = 0;
		for (let j = 0; j < n; j++) {
			const a = j * DA;
			th[j] = 0;
			if (a <= A_NECK || tb <= 0) continue;
			const xi = (a - A_NECK) / L_TAIL;
			const front = smooth((tb * 70 - (a - A_NECK)) / 12); // the beat runs in from the neck
			const amp = B_TIP * (0.25 + 0.75 * xi) * smooth(xi / 0.06) * front;
			th[j] = amp * Math.sin(KW * (a - A_NECK) - TAU * BEAT_HZ * tb);
			ym += th[j] * (1 - xi);
			yw += 1 - xi;
		}
		const yaw = yw > 0 ? (-YAW * ym) / yw : 0;
		f[0] = 0;
		wl[0] = 0;
		for (let j = 0; j < n; j++) be[j] = yaw + th[j];
		let mw = 0;
		let ms = 0;
		for (let j = 1; j < n; j++) {
			const bm = (be[j - 1] + be[j]) / 2;
			f[j] = f[j - 1] - DA * Math.cos(bm);
			wl[j] = wl[j - 1] - DA * Math.sin(bm);
		}
		for (let j = 0; j < n; j++) {
			const m = j * DA < 5.3 ? 3 : 1;
			mw += wl[j] * m;
			ms += m;
		}
		const wc = mw / ms;
		const cp = Math.cos(phi);
		const sp = Math.sin(phi);
		for (let j = 0; j < n; j++) {
			pathAt(sig + f[j], pt);
			const { P, T, U } = pt;
			const Nr = [cp * U[0] + sp * SVEC[0], cp * U[1] + sp * SVEC[1], cp * U[2] + sp * SVEC[2]];
			const w = wl[j] - wc;
			const cb = Math.cos(be[j]);
			const sb = Math.sin(be[j]);
			const k = 3 * j;
			C[k] = P[0] + w * Nr[0];
			C[k + 1] = P[1] + w * Nr[1];
			C[k + 2] = P[2] + w * Nr[2];
			N[k] = -sb * T[0] + cb * Nr[0];
			N[k + 1] = -sb * T[1] + cb * Nr[1];
			N[k + 2] = -sb * T[2] + cb * Nr[2];
			B[k] = -sp * U[0] + cp * SVEC[0];
			B[k + 1] = -sp * U[1] + cp * SVEC[1];
			B[k + 2] = -sp * U[2] + cp * SVEC[2];
		}
		pathAt(sig, pt);
		pose.sig = sig;
		pose.phi = phi;
		pose.T = pt.T.slice();
		pose.U = pt.U.slice();
		pose.P = pt.P.slice();
	};
	// A rest point (x, y, z) carried by the pose, into out.
	pose.place = (x, y, z, out) => {
		let s = -x / DA;
		if (s < 0) s = 0;
		if (s > NST - 1e-9) s = NST - 1e-9;
		const j = s | 0;
		const u = s - j;
		const k = 3 * j;
		for (let c = 0; c < 3; c++) {
			const cc = C[k + c] + u * (C[k + 3 + c] - C[k + c]);
			const nn = N[k + c] + u * (N[k + 3 + c] - N[k + c]);
			const bb = B[k + c] + u * (B[k + 3 + c] - B[k + c]);
			out[c] = cc + y * nn + z * bb;
		}
		// in front of the nose (the acrosome's few hundredths), straight on
		if (x > 0) {
			const tx = C[0] - C[3];
			const ty = C[1] - C[4];
			const tz = C[2] - C[5];
			out[0] += (x / DA) * tx;
			out[1] += (x / DA) * ty;
			out[2] += (x / DA) * tz;
		}
		return out;
	};
	return pose;
}

// ── Ink: segments batched by colour, alpha and width ─────────────────────────
function makeInk() {
	const B = new Map();
	return {
		seg(color, ci, alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(24, Math.round(alpha * 24));
			const wq = Math.max(1, Math.round(width * 5));
			const key = ci * 10000 + a * 100 + wq;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 24, width: wq / 5, P: [] };
				B.set(key, b);
			}
			b.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const all = [...B.values()].sort((p, q) => p.alpha - q.alpha);
			for (const b of all) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length; i += 4) {
					ctx.moveTo(P[i], P[i + 1]);
					ctx.lineTo(P[i + 2], P[i + 3]);
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// Behind the depth buffer, with a slack in world units: the deepest of the
// four cells round the point (so a silhouette stays drawn), off it in front.
function hiddenAt(Z, x, y, d, slack) {
	const s = Z.s;
	const fx = x / s - 0.5;
	const fy = y / s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const k = y0 * Z.W + x0;
	const m = Math.max(Z.buf[k], Z.buf[k + 1], Z.buf[k + Z.W], Z.buf[k + Z.W + 1]);
	return d > m + slack;
}
// A quad of world points into the depth buffer, clipped at the near plane.
const ZN = 0.08;
function quadZ(Z, cam, P, D) {
	if (D[0] > ZN && D[1] > ZN && D[2] > ZN && D[3] > ZN) {
		const q = P.map((p) => cam.project(p));
		Z.tri(q[0], q[1], q[2]);
		Z.tri(q[0], q[2], q[3]);
		return;
	}
	if (D[0] <= ZN && D[1] <= ZN && D[2] <= ZN && D[3] <= ZN) return;
	const out = [];
	for (let i = 0; i < 4; i++) {
		const j = (i + 1) & 3;
		if (D[i] > ZN) out.push(P[i]);
		if (D[i] > ZN !== D[j] > ZN) {
			const t = (D[i] - ZN) / (D[i] - D[j]);
			out.push([
				P[i][0] + t * (P[j][0] - P[i][0]),
				P[i][1] + t * (P[j][1] - P[i][1]),
				P[i][2] + t * (P[j][2] - P[i][2])
			]);
		}
	}
	const q = out.map((p) => cam.project(p));
	for (let i = 1; i + 1 < q.length; i++) Z.tri(q[0], q[i], q[i + 1]);
}
const depthOf = (cam, p) =>
	(p[0] - cam.pos[0]) * cam.f[0] + (p[1] - cam.pos[1]) * cam.f[1] + (p[2] - cam.pos[2]) * cam.f[2];

// ── The pen's pace: a monotone cubic through the beats' keys ─────────────────
// (Fritsch–Carlson), at rest at the first key: the bobbin spins up and holds.
function monotone(keys, start = 0) {
	const n = keys.length;
	const d = [];
	for (let i = 0; i < n - 1; i++)
		d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
	const m = [start * d[0]];
	for (let i = 1; i < n - 1; i++)
		m.push(d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]));
	m.push(d[n - 2]);
	return (x) => {
		if (x <= keys[0][0]) return keys[0][1];
		if (x >= keys[n - 1][0]) return keys[n - 1][1];
		let i = 0;
		while (x > keys[i + 1][0]) i++;
		const H = keys[i + 1][0] - keys[i][0];
		const s = (x - keys[i][0]) / H;
		const s2 = s * s;
		const s3 = s2 * s;
		return (
			(2 * s3 - 3 * s2 + 1) * keys[i][1] +
			(s3 - 2 * s2 + s) * H * m[i] +
			(-2 * s3 + 3 * s2) * keys[i + 1][1] +
			(s3 - s2) * H * m[i + 1]
		);
	};
}

// ── The lens ─────────────────────────────────────────────────────────────────
const FOV = 36;
const HID_A = 0.14; // the thread's far side, while it is wound
const EST = { eye: [520, 300, -520], target: [70, 150, 0] }; // the horn, whole
const CHASE = { back: 85, out: 22, side: 0, ahead: 40 };
function makeLens(reach) {
	const ta = [0, 0, 0];
	const pt = { P: [0, 0, 0], T: [0, 0, 0], U: [0, 0, 0] };
	const pb = { P: [0, 0, 0], T: [0, 0, 0], U: [0, 0, 0] };
	return (t, pose, w, h) => {
		// (a) round the body's own axis: az from the face toward the edge,
		// el toward the nose; the target from the head back to the body's middle
		const az =
			(20 +
				70 * smooth(span(t, 0.4, 2.5)) +
				60 * smooth(span(t, 2.5, 3.8)) +
				60 * smooth(span(t, 3.8, 7.6))) *
			DEG;
		const el = (30 - 26 * smooth(span(t, 3.2, 7.6)) - 4 * smooth(span(t, 7.6, 9.6))) * DEG;
		// pulled back as the tail is spun out: the thread's reach down the body,
		// a monotone curve through the passes' turns, framed with a margin
		const R0 = -reach(t);
		const dist = 1.12 * (R0 + 6) - 8 * smooth(span(t, 8.0, 9.6));
		const aT = clamp(R0 / 2 - 0.5, 2.5, 26) - 4 * smooth(span(t, 8.0, 9.6));
		pose.place(-aT, 0, 0, ta);
		const T = pose.T;
		const U = pose.U;
		const S = SVEC;
		const c0 = Math.cos(PHI0);
		const s0 = Math.sin(PHI0);
		const Zb = [-s0 * U[0] + c0 * S[0], -s0 * U[1] + c0 * S[1], -s0 * U[2] + c0 * S[2]];
		const Yb = [c0 * U[0] + s0 * S[0], c0 * U[1] + s0 * S[1], c0 * U[2] + s0 * S[2]];
		const ce = Math.cos(el);
		const dir = [0, 1, 2].map(
			(i) => ce * (Math.cos(az) * Zb[i] + Math.sin(az) * Yb[i]) + Math.sin(el) * T[i]
		);
		let eye = ta.map((v, i) => v + dist * dir[i]);
		let tgt = ta.slice();
		let up = cross(
			T,
			dir.map((v) => -v)
		);
		let ref = dist;
		// (b) the horn, whole, as it comes out of the dark
		const wb = smooth(span(t, 9.7, 11.5));
		if (wb > 0) {
			eye = eye.map((v, i) => lerp(v, EST.eye[i], wb));
			tgt = tgt.map((v, i) => lerp(v, EST.target[i], wb));
			up = up.map((v, i) => lerp(v, [0, 1, 0][i], wb));
			ref = lerp(ref, 700, wb);
		}
		// (c) the chase: behind and a little outside, looking up the path
		const wc = smooth(span(t, 12.0, 14.4));
		if (wc > 0) {
			pathAt(pose.sig - CHASE.back, pb);
			pathAt(pose.sig + CHASE.ahead, pt);
			const ec = [0, 1, 2].map((i) => pb.P[i] + CHASE.out * pb.U[i] + CHASE.side * S[i]);
			eye = eye.map((v, i) => lerp(v, ec[i], wc));
			tgt = tgt.map((v, i) => lerp(v, pt.P[i], wc));
			up = up.map((v, i) => lerp(v, pose.U[i], wc));
			ref = lerp(ref, CHASE.back, wc);
		}
		const cam = camera3({ pos: eye, target: tgt, up: norm(up), fov: FOV, w, h });
		cam.ref = ref;
		return cam;
	};
}

// ── make ─────────────────────────────────────────────────────────────────────
export async function make() {
	// The thread, wound once.
	const built = buildThread();
	const { kgMax, cMax } = checkThread(built.F);
	if (!(kgMax < 1e-3))
		throw new Error(`filament: geodesic curvature ${kgMax.toExponential(2)} between steers`);
	if (!(cMax < 1e-4))
		throw new Error(`filament: Clairaut drifts ${cMax.toExponential(2)} on the tube`);
	const keep = sampleThread(built.F);
	const n = keep.length;
	const SX = new Float64Array(n);
	const SY = new Float64Array(n);
	const SZ = new Float64Array(n);
	const SL = new Float64Array(n);
	const SQ = new Float64Array(n);
	const SR = new Float64Array(n);
	const passes = built.passes;
	keep.forEach((idx, i) => {
		const f = built.F[idx];
		const rho = Math.hypot(f[1], f[2]);
		const lift = 0.01 * clamp(rho, 0.06, 1);
		SX[i] = f[0] + lift * f[9];
		SY[i] = f[1] + lift * f[10];
		SZ[i] = f[2] + lift * f[11];
		SL[i] = f[3];
		const P = passes[Math.min(passes.length - 1, f[4])];
		SQ[i] = f[4] + clamp((f[3] - P.L0) / Math.max(1e-6, P.L1 - P.L0), 0, 1);
		SR[i] = clamp(rho, 0.05, 1.5);
	});
	const total = built.total;
	const iHoop = passes.findIndex((P) => P.name === 'hoop');
	const lengthAt = monotone(
		[
			[0.4, 0],
			[3.2, passes[iHoop].L0],
			[3.8, passes[iHoop].L1],
			[7.6, total]
		],
		1
	);
	const info = {
		samples: n,
		total,
		passes: passes.length,
		turns: built.turns.map((x) => +x[0].toFixed(2)),
		kgMax,
		cMax
	};
	if (typeof window !== 'undefined') window.__filament = info;

	const horn = buildHorn();
	const mandrel = buildMandrel();
	const pose = makePose();
	// the reach: −5 through the hoop, then each pass's turn as the pen gets there
	const timeAt = (Lq) => {
		let a = 0.4;
		let b = 7.6;
		for (let i = 0; i < 50; i++) {
			const m = (a + b) / 2;
			if (lengthAt(m) < Lq) a = m;
			else b = m;
		}
		return (a + b) / 2;
	};
	const reachKeys = [
		[0, -5],
		[timeAt(passes[iHoop].L1), -5]
	];
	for (const [x, Lq] of built.turns) reachKeys.push([timeAt(Lq), x]);
	const reach = monotone(reachKeys, 0);
	const lens = makeLens(reach);
	const Z = makeDepth(3);
	const ink = makeInk();
	const tmp = [0, 0, 0];
	const QX = new Float64Array(n + 1);
	const QY = new Float64Array(n + 1);
	const QD = new Float64Array(n + 1);
	const hornQ = horn.lines.map((L) => L.P.map(() => [0, 0, 0]));
	const gridD = horn.grid.map((row) => row.map(() => 0));
	const mand = mandrel.map((ring) => ring.map(() => [0, 0, 0]));
	const mandD = mandrel.map((ring) => ring.map(() => 0));

	function render(ctx, w, h, t) {
		if (t >= 20) return;
		pose.at(t);
		const cam = lens(t, pose, w, h);
		const ref = cam.ref;
		const M = 40;
		const off = (x0, y0, x1, y1) =>
			(x0 < -M && x1 < -M) ||
			(x0 > w + M && x1 > w + M) ||
			(y0 < -M && y1 < -M) ||
			(y0 > h + M && y1 > h + M);

		// ── the depth buffer: the horn (once it is there) and the mandrel
		Z.reset(w, h);
		const hornA = smooth(span(t, 9.8, 10.2));
		if (hornA > 0) {
			const G = horn.grid;
			for (let i = 0; i < G.length; i++)
				for (let j = 0; j < G[i].length; j++) gridD[i][j] = depthOf(cam, G[i][j]);
			for (let i = 0; i + 1 < G.length; i++)
				for (let j = 0; j + 1 < G[i].length; j++)
					quadZ(
						Z,
						cam,
						[G[i][j], G[i + 1][j], G[i + 1][j + 1], G[i][j + 1]],
						[gridD[i][j], gridD[i + 1][j], gridD[i + 1][j + 1], gridD[i][j + 1]]
					);
		}
		for (let i = 0; i < mandrel.length; i++)
			for (let j = 0; j < 24; j++) {
				const p = mandrel[i][j];
				pose.place(p[0], p[1], p[2], mand[i][j]);
				mandD[i][j] = depthOf(cam, mand[i][j]);
			}
		for (let i = 0; i + 1 < mandrel.length; i++)
			for (let j = 0; j < 24; j++) {
				const k = (j + 1) % 24;
				quadZ(
					Z,
					cam,
					[mand[i][j], mand[i + 1][j], mand[i + 1][k], mand[i][k]],
					[mandD[i][j], mandD[i + 1][j], mandD[i + 1][k], mandD[i][k]]
				);
			}

		// ── the horn's lines
		const pens = [];
		if (hornA > 0) {
			const rimP = smooth(span(t, 10.0, 10.8));
			const sRise = S_DRAW * Math.pow(smooth(span(t, 10.4, 11.7)), 1.6);
			horn.lines.forEach((L, li) => {
				const Q = hornQ[li];
				let alpha;
				let width = 1;
				let upto = Infinity;
				let reveal = null;
				if (L.kind === 'rim') {
					alpha = 0.92;
					width = 2.1;
					reveal = (k) => L.S[k] <= rimP;
				} else if (L.kind === 'mer') {
					alpha = L.home ? 0.55 : 0.4;
					reveal = (k) => L.S[k] <= sRise;
				} else if (L.kind === 'par') {
					alpha = 0.36 * smooth(span(sRise - L.S[0], 0, 60));
				} else {
					const t0 = 11.0 + 0.1 * L.i;
					const g = smooth(span(t, t0, t0 + 0.75));
					if (g <= 0) return;
					alpha = 0.6;
					width = 1.1;
					upto = g;
					if (g < 1) {
						let k = 1;
						while (k < L.S.length - 1 && L.S[k] < g) k++;
						const u = (g - L.S[k - 1]) / Math.max(1e-9, L.S[k] - L.S[k - 1]);
						pens.push([0, 1, 2].map((c) => lerp(L.P[k - 1][c], L.P[k][c], u)));
					}
				}
				alpha *= hornA;
				if (alpha < 0.012) return;
				for (let k = 0; k < L.P.length; k++) {
					const p = L.P[k];
					const d = depthOf(cam, p);
					Q[k][2] = d;
					if (d > NEAR) {
						const q = cam.project(p);
						Q[k][0] = q[0];
						Q[k][1] = q[1];
					}
				}
				for (let k = 1; k < L.P.length; k++) {
					if (reveal && !reveal(k)) {
						if (L.kind === 'mer') break;
						continue;
					}
					if (upto < 1 && L.S[k - 1] >= upto) break;
					let a = Q[k - 1];
					let b = Q[k];
					if (a[2] <= NEAR && b[2] <= NEAR) continue;
					if (a[2] <= NEAR || b[2] <= NEAR) {
						const pa = L.P[k - 1];
						const pb = L.P[k];
						const u = (a[2] - NEAR * 2) / (a[2] - b[2]);
						const c = cam.project([0, 1, 2].map((i) => lerp(pa[i], pb[i], u)));
						if (a[2] <= NEAR) a = c;
						else b = c;
					}
					if (off(a[0], a[1], b[0], b[1])) continue;
					const md = (a[2] + b[2]) / 2;
					if (hiddenAt(Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, md, 0.01 * md + 0.4)) continue;
					ink.seg(PAL.chalk, 1, alpha, width * clamp(ref / md, 0.5, 2.4), a[0], a[1], b[0], b[1]);
				}
			});
		}

		// ── the thread, up to the pen
		const L = lengthAt(t);
		let lo = 0;
		let hi = n - 1;
		while (lo < hi) {
			const mid = (lo + hi + 1) >> 1;
			if (SL[mid] <= L) lo = mid;
			else hi = mid - 1;
		}
		const iEnd = lo;
		let m = iEnd + 1;
		for (let i = 0; i <= iEnd; i++) {
			pose.place(SX[i], SY[i], SZ[i], tmp);
			const q = cam.project(tmp);
			QX[i] = q[0];
			QY[i] = q[1];
			QD[i] = q[2];
		}
		let Qend = SQ[iEnd];
		const penAt = [0, 0, 0];
		if (iEnd < n - 1) {
			const u = (L - SL[iEnd]) / Math.max(1e-9, SL[iEnd + 1] - SL[iEnd]);
			pose.place(
				lerp(SX[iEnd], SX[iEnd + 1], u),
				lerp(SY[iEnd], SY[iEnd + 1], u),
				lerp(SZ[iEnd], SZ[iEnd + 1], u),
				penAt
			);
			const q = cam.project(penAt);
			QX[m] = q[0];
			QY[m] = q[1];
			QD[m] = q[2];
			m++;
			Qend = lerp(SQ[iEnd], SQ[iEnd + 1], u);
		} else pose.place(SX[iEnd], SY[iEnd], SZ[iEnd], penAt);
		const life = smooth(span(t, 8.2, 9.6));
		for (let i = 1; i < m; i++) {
			const d0 = QD[i - 1];
			const d1 = QD[i];
			if (d0 <= NEAR || d1 <= NEAR) continue;
			if (off(QX[i - 1], QY[i - 1], QX[i], QY[i])) continue;
			const si = Math.min(i, n - 1);
			const md = (d0 + d1) / 2;
			const hid = hiddenAt(
				Z,
				(QX[i - 1] + QX[i]) / 2,
				(QY[i - 1] + QY[i]) / 2,
				md,
				0.3 * SR[si] + 0.004 * md
			);
			const ws = clamp(ref / md, 0.6, 2.2);
			if (hid) {
				// the far side: faint, thin, while the body is being wound
				const a = HID_A * (1 - life);
				if (a > 0.012) ink.seg(PAL.chalk, 2, a, 0.7 * ws, QX[i - 1], QY[i - 1], QX[i], QY[i]);
				continue;
			}
			const bold = 1 - smooth(span(Qend - SQ[si], 0.9, 1.5));
			const alpha = lerp(lerp(0.5, 0.95, bold), 0.72, life);
			const width = lerp(lerp(0.85, 1.45, bold), 0.9, life) * ws;
			ink.seg(PAL.chalk, 0, alpha, width, QX[i - 1], QY[i - 1], QX[i], QY[i]);
		}
		ink.flush(ctx);

		// ── the pen, and the points that wind the geodesics on
		const penA = smooth(span(t, 0.12, 0.4)) * (1 - smooth(span(t, 7.6, 8.2)));
		if (penA > 0) {
			const q = cam.project(penAt);
			const hid = q[2] > NEAR && hiddenAt(Z, q[0], q[1], q[2], 0.05 + 0.004 * q[2]);
			lit3(ctx, cam, penAt, 2.3 * clamp(ref / q[2], 0.7, 1.4), penA * (hid ? 0.3 : 0.8));
		}
		for (const P of pens) lit3(ctx, cam, P, 2, 0.75 * hornA);

		// ── fade, and round
		const out = smooth(span(t, 19.6, 20));
		if (out > 0) {
			ctx.save();
			ctx.globalAlpha = out;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
	}
	return { render };
}
export const __debug = { buildThread, checkThread, sampleThread };
