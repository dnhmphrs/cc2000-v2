// ── Phyllo: draft's golden-angle disc, and the tunnel it opens into ──────────
// The object the swimmer swims at, lifted out of swimmer/draft.js as maths,
// not a drawing (each flow draws it its own way): golden-angle phyllotaxis on
// a log scale, and its exact opening into a tunnel.
//
// THE DISC. Seed n sits at angle θₙ = n·α, α = 2π/φ² (137.508°), and distance
// ρₙ = R φ^(−n/k): the plane pattern zₙ = R wⁿ, w = φ^(−1/k) e^{iα}, the
// exponential image of the lattice Λ = { n(−ln φ/k, α) + j(0, 2π) } in log
// coordinates (ln ρ, θ). Its m-parastichy (m a Fibonacci number) is the
// lattice direction joining n to n + m,
//     d_m = (−m ln φ / k,  2π ε_m),   ε_m = m/φ² − round(m/φ²),
// and
//     k = ln φ · √(8·13) / (2π √(−ε₈ ε₁₃)) ≈ 17.83
// is the k at which d₈ · d₁₃ = 0 — the 8- and the 13-spirals cross at right
// angles, so they are the nearest-neighbour pair. Each parastichy is that
// lattice line exp'd: a logarithmic spiral through seeds j, j + m, j + 2m, …,
// at continuous seed index v: θ = jα + (v − j)·2π ε_m / m, ρ = R φ^(−v/k).
// The apex, n → ∞, is the lattice's fixed point.
//
// THE TUNNEL (the log map). (ln ρ, θ) ↦ the cylinder of radius a: angle θ,
// depth a·ln(R/ρ) — conformal (lengths scale by a/ρ both ways), so the seeds
// are the lattice itself on the wall, every cell the same, the parastichies
// helices, and a lens flying down the axis at a steady speed is a steady zoom
// into the disc (one seed's depth step a·ln φ/k, turning α). That is the
// tunnel to swim down: self-similar, so it can run on for as long as a beat
// needs (seeds({ from }) for any window of indices, negative ones behind the
// mouth).
//
// THE OPENING, EXACT. A lens on the axis at distance E from the disc, focal
// length f, sees a point of the cylinder of radius a at distance D along the
// axis at radius f·a/D on its image, and the disc's seed at f·ρ/E. They are
// the same picture when
//     D = E·a / ρ                         (depthFor(ρ, { a, f: E }))
// — distance ∝ 1/ρ, exponential in n, the rim (ρ = R = a) in the disc's own
// plane. So the tunnel whose seed n sits at that depth, seen straight down
// its axis from E, IS the disc: every seed and every spiral on its line of
// sight. opening(seed, x) slides each point out along its own sight line from
// the lens point, radius ρ → a, distance E → E·a/ρ, so from (0, 0, E) the
// picture never changes for any x — swing the lens off the axis and the
// "disc" is seen to have been a tunnel all along. `log` then eases that
// depth law into the conformal one, depth a·ln(R/ρ). With a = R both put the
// rim in the disc's plane and, when E = a = R too, leave it at the same slope
// (1/ρ ≈ (1/R)(1 + ln(R/ρ)) near the rim), so the mouth does not move; the
// deep seeds come in from the far distance to the lattice's even spacing.
// With a ≠ R the seamless law stands the rim at z = E(1 − a/R) (toward the
// lens for a < R, away for a > R) and `log` slides it back into z = 0.
//
// Coordinates (every map): the disc in the plane z = 0, x right, y up, its
// centre the origin; the tunnel runs into −z (away from a lens at +z).
//
//   import { PHYLLO, seeds, parastichy, toCylinder, toCone, opening,
//            depthFor, seedFrame } from './log/phyllo.js';
//   PHYLLO                 { phi, alpha, k, n: 233, eps: { 8, 13 }, seedR }
//   seeds({ n, R, k, from = 0 })   [{ n, theta, rho, x, y }] the plane disc
//   parastichy(m, j, { R, k, n, per = 8 })
//                          the m-spiral through seed j (0 ≤ j < m), from the
//                          rim (v = 0) to v = n, `per` points to a step of m
//                          seeds: [{ v, theta, rho, x, y }]
//   toCylinder({ theta, rho }, { radius, R, depthPerFold = radius })
//                          THE LOG MAP → [x, y, z]: depth depthPerFold·ln(R/ρ)
//                          (per e-fold of ρ; = radius is conformal)
//   toCone(seed, { half = 38°, R })  draft's funnel: the seed at ρ from the
//                          axis, the rim in z = 0, the apex at −R/tan(half)
//   opening(seed, x, { R, a = R, E = R, log = 0 })
//                          0 ≤ x ≤ 1: the plane disc (x = 0) to the tunnel
//                          (x = 1), every point along its sight line from
//                          (0, 0, E); log 0…1 the tunnel's depth law, E·a/ρ
//                          (seamless from E) to a·ln(R/ρ) (the log map)
//   depthFor(rho, { a, f })        f·a/ρ: the distance from the lens, along
//                          the axis, at which a tunnel of radius a looks like
//                          the disc's ρ to a lens f from the disc (f is E)
//   seedFrame(seed, map)   { c, e1, e2 }: map(seed) and its derivatives in θ
//                          and in ln ρ — a plane disc of radius q·ρ round the
//                          seed maps to c + q(cos ψ e1 + sin ψ e2), so a seed
//                          drawn as draft draws it (q = PHYLLO.seedR) keeps
//                          its shape on any map
//
// PITFALLS (what genome.js, the test bed, ran into):
// - The seamless opening is seamless only from (0, 0, E). Off the axis the
//   deep points (ρ → 0 go to distance E·a/ρ → ∞) swing to the vanishing point
//   of −z, which is not the disc's centre seen from there: a fan of streaks
//   out of the centre. Keep the lens near the axis (E its distance from the
//   disc) while x runs 0 → 1, and move it off or in while `log` runs.
// - The disc's 233 seeds reach ρ ≈ 0.002 R, but the log map lays them only
//   6.3 radii deep (one seed a·ln φ/k ≈ 0.027 a): seen down the tunnel its
//   end is a hole at f/6.3 from the centre. Draw on further (seeds({ n: 700 })
//   and parastichy(…, { n: 700 }); the extra ones are under a pixel on the
//   disc) or a window seeds({ from, n }) round the lens — it is self-similar.
// - Seen from its axis, the log tunnel packs the seeds as 1/depth: their
//   discs overlap past ~2 radii deep and the far end goes solid white. Fog by
//   depth (genome.js: alpha × (1 − smoothstep(1.6 a, 4.5 a) of the depth)).
// - What passes close to the lens is huge on the board: let it go (fade to
//   nothing by ~110 px), or the canvas strokes 100k+ px of faint line a
//   frame — its cost is the stroked length, not the count.

import { PHI, TAU } from './board.js';

const ALPHA = TAU / (PHI * PHI);
const eps = (m) => m / (PHI * PHI) - Math.round(m / (PHI * PHI));
const E8 = eps(8);
const E13 = eps(13);
// k at which the 8- and 13-parastichies cross at right angles:
// k = ln φ · √104 / (2π √(−ε₈ ε₁₃)).
const K = (Math.log(PHI) * Math.sqrt(104)) / (TAU * Math.sqrt(-E8 * E13));

export const PHYLLO = {
	phi: PHI,
	alpha: ALPHA, // 2π/φ², the golden angle
	k: K, // ≈ 17.83
	n: 233, // seeds, rim to ρ ≈ 0.002 R
	eps: { 8: E8, 13: E13 }, // ε_m = m/φ² − round(m/φ²)
	seedR: 0.16 // draft's seed disc: radius 0.16 ρ
};

const rhoOf = (v, R, k) => R * Math.pow(PHI, -v / k);
const at = (n, theta, rho) => ({
	n,
	theta,
	rho,
	x: rho * Math.cos(theta),
	y: rho * Math.sin(theta)
});

export function seeds({ n = PHYLLO.n, R = 1, k = K, from = 0 } = {}) {
	const out = [];
	for (let i = from; i < from + n; i++) out.push(at(i, i * ALPHA, rhoOf(i, R, k)));
	return out;
}

export function parastichy(m, j, { R = 1, k = K, n = PHYLLO.n, per = 8 } = {}) {
	const e = m / (PHI * PHI) - Math.round(m / (PHI * PHI));
	const N = Math.ceil((n / m) * per);
	const out = [];
	for (let q = 0; q <= N; q++) {
		const v = (q * m) / per;
		const theta = j * ALPHA + ((v - j) * TAU * e) / m;
		const p = at(v, theta, rhoOf(v, R, k));
		p.v = v;
		out.push(p);
	}
	return out;
}

export function toCylinder({ theta, rho }, { radius = 1, R = 1, depthPerFold } = {}) {
	const d = (depthPerFold ?? radius) * Math.log(R / rho);
	return [radius * Math.cos(theta), radius * Math.sin(theta), -d];
}

export function toCone({ theta, rho }, { half = (38 * Math.PI) / 180, R = 1 } = {}) {
	return [rho * Math.cos(theta), rho * Math.sin(theta), -(R - rho) / Math.tan(half)];
}

export const depthFor = (rho, { a = 1, f = 1 } = {}) => (f * a) / rho;

export function opening({ theta, rho }, x, { R = 1, a = R, E = R, log = 0 } = {}) {
	// Along the sight line from (0, 0, E): radius r at distance E·r/ρ.
	const r = rho + (a - rho) * x;
	let dist = (E * r) / rho; // from the lens, along the axis
	if (log > 0) {
		const dLog = E + a * Math.log(R / rho); // the log map's, from the lens
		const dEnd = dist + (dLog - (E * a) / rho) * x; // eased in as the tunnel opens
		dist = dist + (dEnd - dist) * log;
	}
	return [r * Math.cos(theta), r * Math.sin(theta), E - dist];
}

export function seedFrame(seed, map, h = 1e-3) {
	const c = map(seed);
	const tp = map({ ...seed, theta: seed.theta + h });
	const tm = map({ ...seed, theta: seed.theta - h });
	const rp = map({ ...seed, rho: seed.rho * Math.exp(h) });
	const rm = map({ ...seed, rho: seed.rho * Math.exp(-h) });
	const d = (p, q) => [(p[0] - q[0]) / (2 * h), (p[1] - q[1]) / (2 * h), (p[2] - q[2]) / (2 * h)];
	return { c, e1: d(tp, tm), e2: d(rp, rm) };
}
