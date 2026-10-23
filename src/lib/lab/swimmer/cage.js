// ── log-swimmer · cage — box-modelled, subdivided to its limit ───────────────
// The swimmer is made the way a 3D artist makes a character: a BOX, then
// extrude, scale, insert an edge loop, subdivide. The cage is a closed quad
// mesh of 24 rings of 4 vertices (a box section (±w, ±t) in the body's y–z
// frame) at stations x along the axis, consecutive rings joined by 4 quads and
// each end capped by one quad (its corners of valence 3). Catmull–Clark, run
// three times (4 round, then 8, 16, 32), then the level-3 vertices moved to
// their LIMIT positions, so the drawn body lies exactly on the limit surface,
// the fixed point of the refinement. The cage then becomes the RIG: the beat
// and the roll are applied to its rings, and the smooth body follows.
//
// The run, beat by beat (20 s; at = t / 20):
//   0.00–0.03  a lit point, then the CUBE drawn edge by edge, twelve quick
//              strokes, its hidden edges faint and dashed; the lens close at
//              three-quarters (az 35°, el 25°).
//   0.03–0.17  EXTRUDE: the back face pulled back twice (the head's boxes),
//              the head SQUASHED thin and widened (the lens low, so it sees it
//              go thin edge-on), an EDGE LOOP inserted mid-band and slid back
//              to two-thirds of the head, the front of the cage scaled 6% proud
//              of it (the acrosome's step); then the back face pulled and
//              scaled nineteen times more — the neck, the three midpiece rings,
//              the tail every 3 units to its cap at x = 54 — at a click-rhythm
//              that quickens from 0.12 s to 0.065 s, the lens orbiting to the
//              side and pulling back to hold the train of boxes.
//   0.17–0.24  SUBDIVIDE: the face points appear as chalk dots, nose to tail,
//              then the edge points; then the new edges are drawn from each
//              face point to its edge points while the old vertices slide
//              (0.5 s) to their smoothed places. The cage stays as a ghost.
//   0.24–0.30  level 2, the same choreography faster; level 1 the ghost, the
//              cage down to 0.12.
//   0.30–0.35  level 3, faster again (each level about 0.75 the time of the
//              one before); then thinned to every 2nd long line, every 4th
//              ring.
//   0.35–0.37  the vertices slide to their LIMIT positions; the limit drawn
//              over a depth buffer of the level-2 quads, front lines bold, back
//              lines gone, the acrosome's loop and the neck bold.
//   0.37–0.45  THE CAGE IS THE RIG: the travelling wave and the roll applied to
//              the cage's rings, the faint cage swinging and the smooth body
//              following it; the cage fades. The lens rises over it.
//   0.43–0.98  the swim: down the line of the five petals' normal, the lens
//              behind and above. The quintic comes out of the dark from 9 to
//              12 s, patch by patch from the back, each written from η = 0
//              outward; α turns from π/4 − 0.25 to π/4 over 9–16 s and holds.
//              The run ends with the nose a head-length from the point.
//   0.98–1.00  fade, and round.
//
// EXACT: Catmull–Clark at every level — face points, edge points
// (v₀ + v₁ + f₀ + f₁)/4, and the vertex rule (F + 2R + (n − 3)P)/n — and the
// limit positions (n²P + 4ΣE + ΣF)/(n(n + 5)) on level 3; all of it linear,
// so at make() it is composed into sparse weight tables from the 96 cage
// vertices to levels 1, 2, 3 and the limit, and every frame of the rig is one
// sparse multiply of the moving cage. The quintic: Hanson's cross-section of
// the Fermat curve z₁⁵ + z₂⁵ = 1 in ℂ², a compact Riemann surface of genus 6,
// as 25 patches (k₁, k₂ ∈ 0…4) over θ = ξ + iη, ξ ∈ [0, π/2], η ∈ [−1.4, 1.4]:
// z₁ = e^{2πik₁/5}(cos θ)^{2/5}, z₂ = e^{2πik₂/5}(sin θ)^{2/5} (principal
// powers), so z₁⁵ + z₂⁵ = cos²θ + sin²θ = 1 (asserted at make(), about 1e−14),
// taken to ℝ³ by (Re z₁, Re z₂, cos α Im z₁ + sin α Im z₂). The destination,
// (z₁, z₂) = (1, 0): there the five patches k₁ = 0 meet, each the image of its
// corner θ = 0 — θ^{2/5} maps the half-disc Re θ ≥ 0 onto a 72° sector, so the
// five close round the point, the order-5 branch point of the projection to
// z₁ — lying on x ≈ 1 − Re(z₂⁵)/5, flat to fifth order, whose normal the
// swimmer swims down. Its ξ- and η-lines are drawn on a graded spacing
// (ξ = (π/2)·a²/(a² + (1 − a)²), η = 1.4·b|b|^{0.6}), so the boundary rays
// ξ = 0 and the central rays η = 0 make ten spokes through it, a polar web.
// Hidden lines from one depth buffer of all 25 patches (12 × 12 each) and the
// body, so where the projection passes through itself the sheets hide each
// other. At make() the last two swimmer-lengths of the path are checked to
// stay at least 0.1 (object units) from every patch but those five.
// A PICTURE: the cage's numbers (tuned so the limit MEASURES the brief, logged
// at make()), the beat (a travelling wave of the cage's tangent angle,
// amplitude growing to the tip over 2.5 wavelengths, integrated so the cage
// keeps its length, the mean angle taken out so the head yaws against it), the
// roll, α's turn, the scale (80) and the lens.

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
	camera3
} from '../log/board.js';
import { NEAR, makeDepth, lit3, spline } from '../log/space.js';
import { makeInk } from '../log/kummer.js';

export const meta = {
	title:
		'box-modelled: a cube extruded into a blocky swimmer, subdivided smooth to its limit → the Fermat quintic, where its five sheets meet',
	order: 11,
	seconds: 20,
	three: false
};

const SEC = 20;
const FOV = 40;
const UP = [0, 0, 1];
const DEG = Math.PI / 180;
const CUR = 0.82; // the alpha of the mesh being worked on

// ── The cage ─────────────────────────────────────────────────────────────────
// [x, w, t]: the station along the axis (nose at 0, x back), the box's half
// width across the head's broad face and half thickness. Built about 1.1–1.2×
// what the limit measures (CC pulls a cage in), tuned until the limit body is
// 5 × 3 × 1.5 in the head, about 1 thick in the midpiece, 44 in the tail.
const PROUD = 1.06; // the cage in front of the edge loop: the acrosome's step
const NOSE = 0;
const H1 = 1;
const H2 = 2;
const LOOP = 3;
const H3 = 4;
const NECK = 5;
const X_LOOP = 3.3;
const H2R = [2.0, 1.6, 0.79]; // the head rings before the 6% (pre-proud)
const H3R = [3.52, 1.42, 0.78];
const F_LOOP = (X_LOOP - H2R[0]) / (H3R[0] - H2R[0]); // where the loop lands on its band
const RINGS = [
	[-0.05, 0.62 * PROUD, 0.28 * PROUD], // the nose (its cap)
	[0.75, 1.45 * PROUD, 0.64 * PROUD], // three head rings, wide and thin …
	[H2R[0], H2R[1] * PROUD, H2R[2] * PROUD],
	// … the edge loop, on the band between h2 and h3, then the front scaled
	[X_LOOP, lerp(H2R[1], H3R[1], F_LOOP) * PROUD, lerp(H2R[2], H3R[2], F_LOOP) * PROUD],
	H3R,
	[4.62, 0.3, 0.3], // the neck
	[5.85, 0.55, 0.55], // the midpiece
	[7.4, 0.56, 0.56],
	[8.95, 0.53, 0.53]
];
for (let i = 0; i < 15; i++) {
	const f = i / 14;
	const r = lerp(0.36, 0.07, f);
	RINGS.push([12 + 3 * i, r, r]); // the tail, every 3, to the cap at 54
}
const NR = RINGS.length; // 24
const NCV = NR * 4; // 96
const id4 = (r, c) => r * 4 + (c & 3);
// The box corners (±w, ±t), in order round the ring.
const CORNER = [
	[1, 1],
	[-1, 1],
	[-1, -1],
	[1, -1]
];

// The cage's quads over a list of ring indices (the rings present), with the
// face's kind: 0 the tube, 1 the nose cap, 2 the tail cap.
function cageFaces(rs) {
	const F = [];
	const K = [];
	for (let i = 0; i < rs.length - 1; i++)
		for (let c = 0; c < 4; c++) {
			F.push(id4(rs[i], c), id4(rs[i], c + 1), id4(rs[i + 1], c + 1), id4(rs[i + 1], c));
			K.push(0);
		}
	const a = rs[0];
	const b = rs[rs.length - 1];
	F.push(id4(a, 3), id4(a, 2), id4(a, 1), id4(a, 0));
	K.push(1);
	F.push(id4(b, 0), id4(b, 1), id4(b, 2), id4(b, 3));
	K.push(2);
	return { F: Int32Array.from(F), K: Int8Array.from(K) };
}

// ── Catmull–Clark ────────────────────────────────────────────────────────────
// One step on a closed quad mesh: new vertices are the old vertex points
// (0…nV−1), then the edge points, then the face points; each a sparse row over
// the old vertices. The parameters ride along: the tube's (u, v) — u the ring,
// v round it in [0, 4) — and each cap's own (s, t) in [0, 1]², averaged
// topologically, so the level-3 mesh knows its long lines, rings and cap grid.
const vavg = (vs) => {
	let s = 0;
	for (const v of vs) {
		let d = v - vs[0];
		if (d > 2) d -= 4;
		if (d < -2) d += 4;
		s += vs[0] + d;
	}
	return (((s / vs.length) % 4) + 4) % 4;
};
function ccStep(nV, F, K, PAR) {
	const nF = F.length / 4;
	const E = new Map();
	const ends = [];
	const efaces = [];
	const fe = new Int32Array(nF * 4);
	for (let f = 0; f < nF; f++)
		for (let i = 0; i < 4; i++) {
			const a = F[f * 4 + i];
			const b = F[f * 4 + ((i + 1) & 3)];
			const k = a < b ? a * nV + b : b * nV + a;
			let e = E.get(k);
			if (e === undefined) {
				e = ends.length / 2;
				E.set(k, e);
				ends.push(a, b);
				efaces.push([]);
			}
			efaces[e].push(f);
			fe[f * 4 + i] = e;
		}
	const nE = ends.length / 2;
	const vf = Array.from({ length: nV }, () => []);
	const ve = Array.from({ length: nV }, () => []);
	for (let f = 0; f < nF; f++) for (let i = 0; i < 4; i++) vf[F[f * 4 + i]].push(f);
	for (let e = 0; e < nE; e++) {
		ve[ends[2 * e]].push(e);
		ve[ends[2 * e + 1]].push(e);
	}
	const rows = [];
	const row = () => {
		const r = new Map();
		r.add = (i, w) => r.set(i, (r.get(i) ?? 0) + w);
		return r;
	};
	for (let v = 0; v < nV; v++) {
		// (F + 2R + (n − 3)P)/n
		const n = vf[v].length;
		const r = row();
		r.add(v, (n - 3) / n);
		for (const f of vf[v]) for (let i = 0; i < 4; i++) r.add(F[f * 4 + i], 1 / (4 * n * n));
		for (const e of ve[v]) {
			r.add(ends[2 * e], 1 / (n * n));
			r.add(ends[2 * e + 1], 1 / (n * n));
		}
		rows.push(r);
	}
	for (let e = 0; e < nE; e++) {
		// (v₀ + v₁ + f₀ + f₁)/4
		const r = row();
		r.add(ends[2 * e], 1 / 4);
		r.add(ends[2 * e + 1], 1 / 4);
		for (const f of efaces[e]) for (let i = 0; i < 4; i++) r.add(F[f * 4 + i], 1 / 16);
		rows.push(r);
	}
	for (let f = 0; f < nF; f++) {
		const r = row();
		for (let i = 0; i < 4; i++) r.add(F[f * 4 + i], 1 / 4);
		rows.push(r);
	}
	// The new faces: (vᵢ, e_out, f, e_in), each child of its parent's kind.
	const NF = new Int32Array(nF * 16);
	const NK = new Int8Array(nF * 4);
	for (let f = 0; f < nF; f++)
		for (let i = 0; i < 4; i++) {
			const o = (f * 4 + i) * 4;
			NF[o] = F[f * 4 + i];
			NF[o + 1] = nV + fe[f * 4 + i];
			NF[o + 2] = nV + nE + f;
			NF[o + 3] = nV + fe[f * 4 + ((i + 3) & 3)];
			NK[f * 4 + i] = K[f];
		}
	// Parameters: [tube u, v, nose s, t, tail s, t], NaN where not on it.
	const nV2 = nV + nE + nF;
	const P2 = new Float64Array(nV2 * 6).fill(NaN);
	P2.set(PAR.subarray(0, nV * 6));
	const put = (dst, srcs, sys) => {
		const o = sys * 2;
		if (srcs.some((s) => Number.isNaN(PAR[s * 6 + o]))) return;
		const a = srcs.map((s) => PAR[s * 6 + o]);
		const b = srcs.map((s) => PAR[s * 6 + o + 1]);
		P2[dst * 6 + o] = a.reduce((x, y) => x + y, 0) / a.length;
		P2[dst * 6 + o + 1] = sys === 0 ? vavg(b) : b.reduce((x, y) => x + y, 0) / b.length;
	};
	for (let e = 0; e < nE; e++)
		for (const f of efaces[e]) put(nV + e, [ends[2 * e], ends[2 * e + 1]], K[f]);
	for (let f = 0; f < nF; f++) put(nV + nE + f, Array.from(F.subarray(f * 4, f * 4 + 4)), K[f]);
	// The new mesh's edges: the split halves of the old (vertex–edge point)
	// and the spokes (edge point–face point).
	const EK = new Map();
	const edges = [];
	const kinds = [];
	for (let q = 0; q < nF * 4; q++)
		for (let i = 0; i < 4; i++) {
			const a = NF[q * 4 + i];
			const b = NF[q * 4 + ((i + 1) & 3)];
			const k = a < b ? a * nV2 + b : b * nV2 + a;
			if (EK.has(k)) continue;
			EK.set(k, 1);
			// spokes stored (face point, edge point); halves (vertex, edge point)
			const sp = a >= nV + nE || b >= nV + nE;
			if (sp) edges.push(a >= nV + nE ? a : b, a >= nV + nE ? b : a);
			else edges.push(a < nV ? a : b, a < nV ? b : a);
			kinds.push(sp ? 1 : 0);
		}
	return {
		rows,
		nV: nV2,
		F: NF,
		K: NK,
		PAR: P2,
		E: Int32Array.from(edges),
		EKIND: Int8Array.from(kinds),
		nOld: nV,
		nOldE: nE
	};
}

// The limit rows of a mesh's vertices: (n²P + 4ΣE + ΣF)/(n(n + 5)), E the
// edge neighbours, F the diagonal neighbour in each face round it.
function limitRows(nV, F) {
	const nb = Array.from({ length: nV }, () => ({ e: new Set(), d: [] }));
	for (let f = 0; f < F.length / 4; f++)
		for (let i = 0; i < 4; i++) {
			const a = F[f * 4 + i];
			nb[a].e.add(F[f * 4 + ((i + 1) & 3)]);
			nb[a].e.add(F[f * 4 + ((i + 3) & 3)]);
			nb[a].d.push(F[f * 4 + ((i + 2) & 3)]);
		}
	return nb.map((o, v) => {
		const n = o.e.size;
		const den = n * (n + 5);
		const r = new Map([[v, (n * n) / den]]);
		for (const e of o.e) r.set(e, (r.get(e) ?? 0) + 4 / den);
		for (const d of o.d) r.set(d, (r.get(d) ?? 0) + 1 / den);
		return r;
	});
}
// Sparse rows (over B's rows) ∘ B (CSR over the cage) → CSR over the cage.
function compose(rows, B) {
	const acc = new Float64Array(NCV);
	const ptr = [0];
	const col = [];
	const val = [];
	for (const r of rows) {
		acc.fill(0);
		for (const [j, w] of r)
			for (let q = B.ptr[j]; q < B.ptr[j + 1]; q++) acc[B.col[q]] += w * B.val[q];
		for (let k = 0; k < NCV; k++)
			if (Math.abs(acc[k]) > 1e-14) {
				col.push(k);
				val.push(acc[k]);
			}
		ptr.push(col.length);
	}
	return {
		n: rows.length,
		ptr: Int32Array.from(ptr),
		col: Int32Array.from(col),
		val: Float64Array.from(val)
	};
}
// out = W · cage (cage and out flat xyz).
function mulW(W, C, out) {
	const { n, ptr, col, val } = W;
	for (let i = 0; i < n; i++) {
		let x = 0;
		let y = 0;
		let z = 0;
		for (let q = ptr[i]; q < ptr[i + 1]; q++) {
			const j = col[q] * 3;
			const w = val[q];
			x += w * C[j];
			y += w * C[j + 1];
			z += w * C[j + 2];
		}
		out[i * 3] = x;
		out[i * 3 + 1] = y;
		out[i * 3 + 2] = z;
	}
	return out;
}

// The cage at rest, body-local (x back, y across, z up), flat xyz.
function restCage() {
	const C = new Float64Array(NCV * 3);
	for (let r = 0; r < NR; r++) {
		const [x, w, t] = RINGS[r];
		for (let c = 0; c < 4; c++) {
			const o = id4(r, c) * 3;
			C[o] = x;
			C[o + 1] = CORNER[c][0] * w;
			C[o + 2] = CORNER[c][1] * t;
		}
	}
	return C;
}

// Everything that does not move: the levels, their tables and lines.
function buildLevels() {
	const all = Array.from({ length: NR }, (_, i) => i);
	const { F, K } = cageFaces(all);
	const PAR = new Float64Array(NCV * 6).fill(NaN);
	const capST = (c) =>
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1]
		][c];
	for (let r = 0; r < NR; r++)
		for (let c = 0; c < 4; c++) {
			const v = id4(r, c);
			PAR[v * 6] = r;
			PAR[v * 6 + 1] = c;
			if (r === 0) [PAR[v * 6 + 2], PAR[v * 6 + 3]] = capST(c);
			if (r === NR - 1) [PAR[v * 6 + 4], PAR[v * 6 + 5]] = capST(c);
		}
	// the cage's own edges
	const ce = [];
	for (let r = 0; r < NR; r++) for (let c = 0; c < 4; c++) ce.push(id4(r, c), id4(r, c + 1));
	for (let r = 0; r < NR - 1; r++) for (let c = 0; c < 4; c++) ce.push(id4(r, c), id4(r + 1, c));
	const I = {
		n: NCV,
		ptr: new Int32Array(NCV + 1),
		col: new Int32Array(NCV),
		val: new Float64Array(NCV)
	};
	for (let i = 0; i < NCV; i++) {
		I.ptr[i + 1] = i + 1;
		I.col[i] = i;
		I.val[i] = 1;
	}
	const rest0 = restCage();
	const L = [{ nV: NCV, F, K, PAR, E: Int32Array.from(ce), W: I, rest: rest0 }];
	for (let k = 1; k <= 3; k++) {
		const p = L[k - 1];
		const s = ccStep(p.nV, p.F, p.K, p.PAR);
		const W = compose(s.rows, p.W);
		L.push({ ...s, W, rest: mulW(W, rest0, new Float64Array(s.nV * 3)) });
	}
	const L3 = L[3];
	const WL = compose(limitRows(L3.nV, L3.F), L3.W);
	const limRest = mulW(WL, rest0, new Float64Array(L3.nV * 3));
	return { L, WL, limRest };
}

// Polylines on level 3 by its parameters: long lines v = v₀, rings u = u₀,
// cap lines s = s₀ / t = t₀ (with the cap's rim).
function lineSets(L3) {
	const { nV, PAR, rest } = L3;
	const eq = (a, b) => Math.abs(a - b) < 1e-7;
	const longs = new Map();
	const rings = new Map();
	const caps = [];
	for (let i = 0; i < nV; i++) {
		const u = PAR[i * 6];
		const v = PAR[i * 6 + 1];
		if (Number.isNaN(u)) continue;
		const kv = Math.round(v * 8);
		const ku = Math.round(u * 8);
		if (eq(v * 8, kv)) {
			if (!longs.has(kv)) longs.set(kv, []);
			longs.get(kv).push([u, i]);
		}
		if (eq(u * 8, ku)) {
			if (!rings.has(ku)) rings.set(ku, []);
			rings.get(ku).push([v, i]);
		}
	}
	const tailX = 10; // past here the tube is thin: every 2nd point along it, 16 round
	const xOf = (i) => rest[i * 3];
	const L = []; // { idx, closed, cls }: cls 2 = every 4th each way, 1 = every 2nd long line, 3 = bold loop
	for (const [kv, arr] of longs) {
		if (kv % 2) continue; // every 2nd long line of 32
		arr.sort((a, b) => a[0] - b[0]);
		const idx = [];
		arr.forEach(([u, i], n) => {
			const ku = Math.round(u * 8);
			if (xOf(i) > tailX && ku % 2 && n !== arr.length - 1) return;
			idx.push(i);
		});
		L.push({ idx: Int32Array.from(idx), closed: false, cls: kv % 4 ? 1 : 2 });
	}
	for (const [ku, arr] of rings) {
		const bold = ku === LOOP * 8 || ku === NECK * 8;
		if (ku % 4 && !bold) continue; // every 4th ring
		arr.sort((a, b) => a[0] - b[0]);
		const thin = xOf(arr[0][1]) > tailX;
		const idx = arr.filter((_, n) => bold || !thin || n % 2 === 0).map((x) => x[1]);
		L.push({ idx: Int32Array.from(idx), closed: true, cls: bold ? 3 : 2 });
	}
	// The caps: their grid lines continue the long lines across the box's end.
	for (const sys of [1, 2]) {
		const o = sys * 2;
		for (const q of [2, 4, 6]) {
			for (const ax of [0, 1]) {
				const pts = [];
				for (let i = 0; i < nV; i++) {
					const s = PAR[i * 6 + o];
					if (Number.isNaN(s)) continue;
					const a = PAR[i * 6 + o + ax];
					const b = PAR[i * 6 + o + 1 - ax];
					if (eq(a * 8, q)) pts.push([b, i]);
				}
				pts.sort((x, y) => x[0] - y[0]);
				caps.push({
					idx: Int32Array.from(pts.map((p) => p[1])),
					closed: false,
					cls: q === 4 ? 2 : 1
				});
			}
		}
	}
	return L.concat(caps);
}

// ── The making: the cage's rings over the first 3.4 s ────────────────────────
// The cube, two head boxes pulled from it, the head squashed, the edge loop
// slid in, the front scaled proud, then the train of extrusions.
const CUBE = 0.8;
const PRE = {
	[NOSE]: [-0.05, CUBE, CUBE],
	[H1]: [1.55, CUBE, CUBE],
	[H2]: [3.15, CUBE, CUBE],
	[H3]: [4.75, CUBE, CUBE]
};
const SQ = {
	[NOSE]: [-0.05, 0.62, 0.28],
	[H1]: [0.75, 1.45, 0.64],
	[H2]: H2R,
	[H3]: H3R
};
const T_CUBE = [0.08, 0.6];
const T_SQUASH = [0.92, 1.3];
const T_LOOP = [1.3, 1.36, 1.6]; // appears, slides from …, to
const T_PROUD = [1.56, 1.7];
const EXT = [];
{
	EXT.push({ i: H2, from: H1, t0: 0.6, d: 0.15 });
	EXT.push({ i: H3, from: H2, t0: 0.75, d: 0.15 });
	let t0 = 1.68;
	const order = [NECK, 6, 7, 8];
	for (let r = 9; r < NR; r++) order.push(r);
	const ratio = Math.pow(0.065 / 0.12, 1 / (order.length - 1));
	order.forEach((i, n) => {
		const d = 0.12 * Math.pow(ratio, n);
		EXT.push({ i, from: n === 0 ? H3 : order[n - 1], t0, d });
		t0 += d;
	});
}
const EXT_OF = new Map(EXT.map((e) => [e.i, e]));
const ease3 = (s) => 1 - Math.pow(1 - clamp01(s), 3);
const lerpR = (a, b, s) => [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)];
// Where ring i is heading at t (before any extrusion moves it there).
function targetOf(i, t) {
	if (i > H3) return RINGS[i];
	const sq = smooth(span(t, T_SQUASH[0], T_SQUASH[1]));
	const pr = 1 + (PROUD - 1) * smooth(span(t, T_PROUD[0], T_PROUD[1]));
	if (i === LOOP) {
		const f = lerp(0.5, F_LOOP, smooth(span(t, T_LOOP[1], T_LOOP[2])));
		const a = lerpR(PRE[H2], SQ[H2], sq);
		const b = lerpR(PRE[H3], SQ[H3], sq);
		const r = lerpR(a, b, f);
		return [r[0], r[1] * pr, r[2] * pr];
	}
	const r = lerpR(PRE[i], SQ[i], sq);
	return i === H3 ? r : [r[0], r[1] * pr, r[2] * pr];
}
// Ring i's state at t: [x, w, t, on, hot]; on = 0 before it exists.
function ringAt(i, t) {
	if (t >= 3.4) return [...RINGS[i], 1, 0];
	if (i === NOSE || i === H1) return [...targetOf(i, t), 1, 0];
	if (i === LOOP) {
		if (t < T_LOOP[0]) return [0, 0, 0, 0, 0];
		return [...targetOf(i, t), 1, 1 - smooth(span(t, T_LOOP[2], T_PROUD[1] + 0.1))];
	}
	const e = EXT_OF.get(i);
	if (t < e.t0) return [0, 0, 0, 0, 0];
	const s = (t - e.t0) / e.d;
	if (s >= 1) return [...targetOf(i, t), 1, Math.max(0, 1 - (s - 1) * 0.6)];
	const src = ringAt(e.from, e.t0);
	return [...lerpR(src, targetOf(i, t), ease3(s)), 1, 1];
}

// ── The beat, on the cage ────────────────────────────────────────────────────
// The tangent angle along the rest axis, β(x) = A(x) sin(k(x − x_b) − ωt) past
// the neck, the head's the neck's; the mean taken out (the head yaws against
// the tail), integrated (the cage keeps its length), the lateral mean taken
// out; each ring set square to its tangent.
const T_RIG = 7.4;
const XB = 5.0;
const X_TIP = 54;
const K_BEAT = (TAU * 2.5) / (X_TIP - XB); // 2.5 wavelengths down the tail
const A0 = 0.14;
const A1 = 0.78;
const OMEGA = TAU * 1.9;
const FRONT_V = 34;
function beatAt(t, x) {
	if (t <= T_RIG) return 0;
	const env = smooth(span(t, T_RIG, T_RIG + 1.2));
	const d = Math.max(0, x - XB);
	const front = smooth(span((t - T_RIG) * FRONT_V - d, 0, 10));
	const A = lerp(A0, A1, d / (X_TIP - XB));
	return env * front * A * Math.sin(K_BEAT * d - OMEGA * (t - T_RIG));
}
// ∫ of a rate piecewise linear in t through keys [[t, rate], …].
function integ(t, keys) {
	let acc = 0;
	for (let i = 0; i < keys.length - 1; i++) {
		const [t0, r0] = keys[i];
		const [t1, r1] = keys[i + 1];
		if (t <= t0) break;
		const te = Math.min(t, t1);
		acc += ((r0 + (r0 + ((r1 - r0) * (te - t0)) / (t1 - t0))) / 2) * (te - t0);
	}
	const [tl, rl] = keys[keys.length - 1];
	if (t > tl) acc += rl * (t - tl);
	return acc;
}
const ROLL = [
	[7.7, 0],
	[9.2, 2.3],
	[20, 2.7]
];
const SWIM = [
	[8.5, 0],
	[10.2, 27],
	[15.5, 33],
	[20, 17]
];

// ── The quintic ──────────────────────────────────────────────────────────────
const SCALE = 80;
const NG = 12; // the depth grid of a patch, and each line's segments
const ETA = 1.4;
const XI_LINES = [0, 3, 6, 9, 12]; // a = 0, ¼, ½, ¾, 1 on the graded ξ
const ETA_LINES = [0, 2, 4, 6, 8, 10, 12]; // b = −1 … 1 by ⅓, η = 0 among them
const xiOf = (a) => (Math.PI / 2) * ((a * a) / (a * a + (1 - a) * (1 - a)));
const etaOf = (b) => ETA * b * Math.pow(Math.abs(b), 0.6);
const DEST = [SCALE, 0, 0]; // (z₁, z₂) = (1, 0)
const alphaAt = (t) => Math.PI / 4 - 0.25 * (1 - smooth(span(t, 9, 16)));
// principal powers, complex cos and sin
const cpow = (a, b, p) => {
	const r = Math.hypot(a, b);
	if (r === 0) return [0, 0];
	const th = Math.atan2(b, a);
	const m = Math.pow(r, p);
	return [m * Math.cos(p * th), m * Math.sin(p * th)];
};
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const root5 = (k) => [Math.cos((TAU * k) / 5), Math.sin((TAU * k) / 5)];
function quinticPoint(k1, k2, xi, eta) {
	const cs = [Math.cos(xi) * Math.cosh(eta), -Math.sin(xi) * Math.sinh(eta)];
	const sn = [Math.sin(xi) * Math.cosh(eta), Math.cos(xi) * Math.sinh(eta)];
	return [cmul(root5(k1), cpow(cs[0], cs[1], 0.4)), cmul(root5(k2), cpow(sn[0], sn[1], 0.4))];
}
const pow5 = (z) => {
	let r = [1, 0];
	for (let i = 0; i < 5; i++) r = cmul(r, z);
	return r;
};
function buildQuintic() {
	// the patches, the five k₁ = 0 last (they meet at the destination)
	const order = [];
	for (const k1 of [2, 3, 1, 4, 0]) for (let k2 = 0; k2 < 5; k2++) order.push([k1, k2]);
	let err = 0;
	const patches = order.map(([k1, k2]) => {
		const Zs = new Float64Array((NG + 1) * (NG + 1) * 4);
		for (let i = 0; i <= NG; i++)
			for (let j = 0; j <= NG; j++) {
				const [z1, z2] = quinticPoint(k1, k2, xiOf(i / NG), etaOf((2 * j) / NG - 1));
				const o = (i * (NG + 1) + j) * 4;
				Zs[o] = z1[0];
				Zs[o + 1] = z1[1];
				Zs[o + 2] = z2[0];
				Zs[o + 3] = z2[1];
				const a = pow5(z1);
				const b = pow5(z2);
				err = Math.max(err, Math.hypot(a[0] + b[0] - 1, a[1] + b[1]));
			}
		return { k1, k2, Zs };
	});
	// The assertion, finer than the drawing.
	for (let k1 = 0; k1 < 5; k1++)
		for (let k2 = 0; k2 < 5; k2++)
			for (let i = 0; i <= 40; i++)
				for (let j = 0; j <= 40; j++) {
					const [z1, z2] = quinticPoint(k1, k2, (Math.PI / 2) * (i / 40), ETA * ((2 * j) / 40 - 1));
					const a = pow5(z1);
					const b = pow5(z2);
					err = Math.max(err, Math.hypot(a[0] + b[0] - 1, a[1] + b[1]));
				}
	if (!(err < 1e-12)) throw new Error(`quintic: max |z1^5 + z2^5 - 1| = ${err}`);
	// The approach: the last two swimmer-lengths, (x, 0, 0) for x from a
	// head-length past the point, must stay 0.1 clear of every patch but the
	// five that meet there; else come in from −x.
	const d0 = 5 / SCALE;
	const d1 = d0 + (2 * 55) / SCALE;
	const clear = (side, al) => {
		let m = Infinity;
		for (let k1 = 1; k1 < 5; k1++)
			for (let k2 = 0; k2 < 5; k2++)
				for (let i = 0; i <= 60; i++)
					for (let j = 0; j <= 60; j++) {
						const [z1, z2] = quinticPoint(
							k1,
							k2,
							(Math.PI / 2) * (i / 60),
							ETA * ((2 * j) / 60 - 1)
						);
						const X = z1[0];
						const Y = z2[0];
						const Zc = Math.cos(al) * z1[1] + Math.sin(al) * z2[1];
						const lo = Math.min(1 + side * d0, 1 + side * d1);
						const hi = Math.max(1 + side * d0, 1 + side * d1);
						const cx = Math.min(hi, Math.max(lo, X));
						m = Math.min(m, Math.hypot(X - cx, Y, Zc));
					}
		return m;
	};
	const cPlus = Math.min(clear(1, alphaAt(16)), clear(1, alphaAt(9)));
	const side = cPlus >= 0.1 ? 1 : -1;
	const cl = side > 0 ? cPlus : Math.min(clear(-1, alphaAt(16)), clear(-1, alphaAt(9)));
	return { patches, err, side, clearance: cl };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// Generation and rig: keyed about the body (x back, z up) — target x, azimuth
// toward the nose from the side, elevation, log distance.
const GEN = [
	[0, [0.75, 35, 25, Math.log(7.2)]],
	[0.6, [0.9, 34, 24, Math.log(7.8)]],
	[0.95, [2.3, 31, 18, Math.log(11.5)]],
	[1.3, [1.7, 30, 13, Math.log(9.4)]],
	[1.68, [2.0, 42, 30, Math.log(10)]],
	[2.3, [6.5, 26, 26, Math.log(17)]],
	[2.9, [15, 16, 26, Math.log(33)]],
	[3.4, [22, 12, 27, Math.log(45)]],
	[4.2, [9.5, 44, 30, Math.log(27)]],
	[5.6, [9, 40, 32, Math.log(25)]],
	[7.0, [9, 33, 30, Math.log(25)]],
	[7.6, [13, 20, 42, Math.log(34)]],
	[8.6, [20, 6, 52, Math.log(48)]],
	[10, [26, -8, 52, Math.log(56)]]
];
function genRig(t, F) {
	const g = (c) =>
		spline(
			t,
			GEN.map(([k, v]) => [k, v[c]])
		);
	const tx = g(0);
	const az = g(1) * DEG;
	const el = g(2) * DEG;
	const d = Math.exp(g(3));
	const T = place(F, tx, 0, 0);
	const dir = turn(F, -Math.sin(az) * Math.cos(el), Math.cos(az) * Math.cos(el), Math.sin(el));
	return { T, E: add3(T, mul3(dir, d)) };
}
// The swim: behind and above, the point ahead, closing.
// The swim: behind the swimmer as seen from what it is swimming at (the
// quintic's middle, then the point), and above.
function swimRig(t, F, side) {
	const c = smooth(span(t, 10.5, 20));
	const T = lerpR(
		[DEST[0] / 2, 0, -22],
		add3(DEST, [side * 4, 0, -3]),
		smooth(span(t, 12.5, 18.8))
	);
	const back = norm(sub3(F.O, T));
	const E = add3(add3(F.O, mul3(back, lerp(110, 50, c))), [0, 0, lerp(34, 19, c)]);
	return { E, T: lerpR(T, F.O, 0.18 * (1 - c)) };
}
// Blend two rigs: the eye first, the target after it, so what the first
// rig holds stays in the frame while the lens comes round.
const blend = (a, b, sE, sT) => ({ E: lerpR(a.E, b.E, sE), T: lerpR(a.T, b.T, sT) });

// ── Ink, dots and depth ──────────────────────────────────────────────────────
function makeDots() {
	const B = new Map();
	return {
		dot(x, y, r, alpha) {
			if (alpha < 0.03) return;
			const a = Math.min(10, Math.round(alpha * 10));
			const key = `${a}|${r}`;
			let b = B.get(key);
			if (!b) {
				b = { alpha: a / 10, r, P: [] };
				B.set(key, b);
			}
			b.P.push(x, y);
		},
		flush(ctx) {
			ctx.save();
			ctx.fillStyle = PAL.chalk;
			for (const b of B.values()) {
				ctx.globalAlpha = b.alpha;
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length; i += 2) {
					ctx.moveTo(P[i] + b.r, P[i + 1]);
					ctx.arc(P[i], P[i + 1], b.r, 0, TAU);
				}
				ctx.fill();
			}
			ctx.restore();
			B.clear();
		}
	};
}
// A triangle into the depth buffer, straight from projected coordinates: the
// barycentric weights and 1/z are affine on the screen, so each row is solved
// for its span and walked with one division a cell.
const SPAN = new Float64Array(2);
// Narrow the row's span r to where a·x + c ≥ e (x the cell's centre).
function sp(a, c, r, e = -0.03) {
	if (a > 1e-12) r[0] = Math.max(r[0], Math.ceil((e - c) / a - 0.5));
	else if (a < -1e-12) r[1] = Math.min(r[1], Math.floor((e - c) / a - 0.5));
	else if (c < e) r[1] = -1;
}
function ztri(Z, ax, ay, az, bx, by, bz, cx, cy, cz) {
	if (az < NEAR || bz < NEAR || cz < NEAR) return;
	const s = Z.s;
	ax /= s;
	ay /= s;
	bx /= s;
	by /= s;
	cx /= s;
	cy /= s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (Math.abs(area) < 1e-9) return;
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	if (x0 > x1 || y0 > y1) return;
	const inv = 1 / area;
	const a0 = (by - cy) * inv;
	const b0 = (cx - bx) * inv;
	const c0 = (bx * cy - by * cx) * inv;
	const a1 = (cy - ay) * inv;
	const b1 = (ax - cx) * inv;
	const c1 = (cx * ay - cy * ax) * inv;
	const a2 = -a0 - a1;
	const b2 = -b0 - b1;
	const c2 = 1 - c0 - c1;
	const ia = 1 / az;
	const ib = 1 / bz;
	const ic = 1 / cz;
	const ai = a0 * ia + a1 * ib + a2 * ic;
	const bi = b0 * ia + b1 * ib + b2 * ic;
	const ci = c0 * ia + c1 * ib + c2 * ic;
	const buf = Z.buf;
	const W = Z.W;
	for (let y = y0; y <= y1; y++) {
		const py = y + 0.5;
		const r = SPAN;
		r[0] = x0;
		r[1] = x1;
		sp(a0, b0 * py + c0, r);
		sp(a1, b1 * py + c1, r);
		sp(a2, b2 * py + c2, r);
		const lo = r[0];
		const hi = r[1];
		const row = y * W;
		const iy = bi * py + ci;
		for (let x = lo; x <= hi; x++) {
			const z = 1 / (ai * (x + 0.5) + iy);
			if (z < buf[row + x]) buf[row + x] = z;
		}
	}
}
// Quads (index quadruples into projected Q) into the depth buffer.
function zquads(Z, Q, F, nq = F.length / 4) {
	for (let f = 0; f < nq; f++) {
		const a = F[f * 4] * 3;
		const b = F[f * 4 + 1] * 3;
		const c = F[f * 4 + 2] * 3;
		const d = F[f * 4 + 3] * 3;
		ztri(Z, Q[a], Q[a + 1], Q[a + 2], Q[b], Q[b + 1], Q[b + 2], Q[c], Q[c + 1], Q[c + 2]);
		ztri(Z, Q[a], Q[a + 1], Q[a + 2], Q[c], Q[c + 1], Q[c + 2], Q[d], Q[d + 1], Q[d + 2]);
	}
}
// Behind the surface? The deepest of the four cells round the point, with a
// relative and an absolute slack.
function behind(Z, x, y, z, rel, abs) {
	if (!Z.on) return false;
	const fx = x / Z.s - 0.5;
	const fy = y / Z.s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const b = Z.buf;
	const k = y0 * Z.W + x0;
	const m = Math.max(b[k], b[k + 1], b[k + Z.W], b[k + Z.W + 1]);
	return z > m * (1 + rel) + abs;
}

// ── make ─────────────────────────────────────────────────────────────────────
export async function make() {
	const { L, WL, limRest } = buildLevels();
	const LINES = lineSets(L[3]);
	const Qn = buildQuintic();
	const Z = makeDepth(4);

	// The measured limit, logged once.
	{
		let x0 = Infinity;
		let x1 = -Infinity;
		let hw = 0;
		let ht = 0;
		const prof = (a, b) => {
			let m = 0;
			let n = 0;
			for (let i = 0; i < L[3].nV; i++) {
				const x = limRest[i * 3];
				if (x >= a && x < b) {
					n++;
					m = Math.max(m, 2 * Math.abs(limRest[i * 3 + 1]), 2 * Math.abs(limRest[i * 3 + 2]));
				}
			}
			return n ? m : Infinity;
		};
		for (let i = 0; i < L[3].nV; i++) {
			const x = limRest[i * 3];
			x0 = Math.min(x0, x);
			x1 = Math.max(x1, x);
			if (x < 5) {
				hw = Math.max(hw, 2 * Math.abs(limRest[i * 3 + 1]));
				ht = Math.max(ht, 2 * Math.abs(limRest[i * 3 + 2]));
			}
		}
		let neck = 0;
		let nw = Infinity;
		for (let x = 3.5; x < 7; x += 0.05) {
			const m = prof(x - 0.13, x + 0.13);
			if (m < nw) {
				nw = m;
				neck = x;
			}
		}
		const nnz = (W) => W.ptr[W.n];
		console.log(
			`[cage] cage ${NR} rings / ${NCV} vertices → levels ${L[1].nV}, ${L[2].nV}, ${L[3].nV} vertices` +
				` (weights nnz ${nnz(L[1].W)}, ${nnz(L[2].W)}, limit ${nnz(WL)}); limit body: head ${(neck - x0).toFixed(2)}` +
				` long × ${hw.toFixed(2)} wide × ${ht.toFixed(2)} thick, neck ${nw.toFixed(2)}, midpiece ${prof(6, 8.5).toFixed(2)}` +
				` thick, tail ${(x1 - 9.6).toFixed(2)} (nose ${x0.toFixed(2)}, tip ${x1.toFixed(2)}); quintic max|z1^5+z2^5-1|` +
				` ${Qn.err.toExponential(2)}; approach from ${Qn.side > 0 ? '+x' : '-x'}, clearance ${Qn.clearance.toFixed(3)}`
		);
	}

	const S = {
		path: buildPath(Qn.side),
		L,
		WL,
		limRest,
		LINES,
		Qn,
		Z,
		cage: new Float64Array(NCV * 3),
		lev2: new Float64Array(L[2].nV * 3),
		lim: new Float64Array(L[3].nV * 3),
		Q: [0, 1, 2, 3].map((k) => new Float64Array(L[k].nV * 3)),
		QL: new Float64Array(L[3].nV * 3),
		QC: new Float64Array(NCV * 3),
		QO: new Float64Array(25 * (NG + 1) * (NG + 1) * 3),
		PO: new Float64Array(25 * (NG + 1) * (NG + 1) * 3),
		tmp: [0, 1, 2, 3].map((k) => new Float64Array(L[k].nV * 3))
	};
	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t, S);
		}
	};
}

// ── The swimmer's place ──────────────────────────────────────────────────────
// A cubic from where the swimmer is made, turning onto the line of the five
// petals' normal; then two swimmer-lengths straight down it, to a
// head-length from the point. Tabled by arc length.
const STRAIGHT = 2 * 55;
function buildPath(side) {
	// Polar about the point, in the plane of the line and where the swimmer is
	// made (R0 out, 17° round from the line and 10° up, so the quintic is seen
	// obliquely while it is written): the angle off the line closes smoothly,
	// φ₀ S((r − r₁)/(R0 − r₁)), so the swimmer heads in at the point all the
	// way (never more than about 20° off it), on the line by r₁ = 115, a
	// head-length and two swimmer-lengths out, and straight down it from there.
	const ax = [side, 0, 0];
	const az = 17 * DEG;
	const el = 10 * DEG;
	const u0 = [side * Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
	const phi0 = Math.acos(dot(u0, ax));
	const q = norm(sub3(u0, mul3(ax, dot(u0, ax))));
	const R0 = 540;
	const R1 = 5 + STRAIGHT;
	const N = 900;
	const pts = [];
	const len = new Float64Array(N + 1);
	for (let i = 0; i <= N; i++) {
		const r = lerp(R0, 5, i / N);
		const ph = r > R1 ? phi0 * smooth((r - R1) / (R0 - R1)) : 0;
		pts.push(add3(DEST, add3(mul3(ax, r * Math.cos(ph)), mul3(q, r * Math.sin(ph)))));
		if (i) len[i] = len[i - 1] + Math.hypot(...sub3(pts[i], pts[i - 1]));
	}
	const at = (s) => {
		const v = Math.min(len[N], Math.max(0, s));
		let lo = 0;
		let hi = N;
		while (hi - lo > 1) {
			const m = (lo + hi) >> 1;
			if (len[m] <= v) lo = m;
			else hi = m;
		}
		return lerpR(pts[lo], pts[hi], (v - len[lo]) / (len[hi] - len[lo]));
	};
	return { at, length: len[N] };
}
// The body's frame at arc length s: x back along the path, z up as near as
// the heading lets it.
function frameAt(path, s) {
	const O = path.at(s);
	const ex = norm(sub3(path.at(s - 0.5), path.at(s + 0.5)));
	const ez = norm(sub3(UP, mul3(ex, dot(UP, ex))));
	return { O, ex, ey: cross(ez, ex), ez };
}
const place = (F, x, y, z) => [
	F.O[0] + F.ex[0] * x + F.ey[0] * y + F.ez[0] * z,
	F.O[1] + F.ex[1] * x + F.ey[1] * y + F.ez[1] * z,
	F.O[2] + F.ex[2] * x + F.ey[2] * y + F.ez[2] * z
];
const turn = (F, x, y, z) => [
	F.ex[0] * x + F.ey[0] * y + F.ez[0] * z,
	F.ex[1] * x + F.ey[1] * y + F.ez[1] * z,
	F.ex[2] * x + F.ey[2] * y + F.ez[2] * z
];
const swumAt = (t, path) => (path.length * integ(t, SWIM)) / integ(SEC, SWIM);

// The cage in the world at t: built (t < 3.4), at rest, or rigged.
function cageWorld(t, F, out) {
	const set = (o, x, y, z) => {
		out[o] = F.O[0] + F.ex[0] * x + F.ey[0] * y + F.ez[0] * z;
		out[o + 1] = F.O[1] + F.ex[1] * x + F.ey[1] * y + F.ez[1] * z;
		out[o + 2] = F.O[2] + F.ex[2] * x + F.ey[2] * y + F.ez[2] * z;
	};
	if (t < T_RIG) {
		for (let r = 0; r < NR; r++) {
			const [x, w, th, on] = ringAt(r, t);
			for (let c = 0; c < 4; c++) {
				const o = id4(r, c) * 3;
				set(o, on ? x : 0, CORNER[c][0] * w, CORNER[c][1] * th);
			}
		}
		return out;
	}
	// The centreline from the tangent angle, ring to ring.
	const xs = RINGS.map((r) => r[0]);
	const N = 220;
	const xa = xs[0];
	const L = X_TIP - xa;
	let mean = 0;
	for (let i = 0; i < N; i++) mean += beatAt(t, xa + ((i + 0.5) * L) / N);
	mean /= N;
	const bAt = (x) => beatAt(t, Math.max(x, XB)) - mean;
	const X = new Float64Array(NR);
	const Y = new Float64Array(NR);
	const B = new Float64Array(NR);
	X[0] = xa;
	B[0] = bAt(xa);
	for (let r = 1; r < NR; r++) {
		const n = Math.max(2, Math.ceil((xs[r] - xs[r - 1]) / 0.25));
		const dx = (xs[r] - xs[r - 1]) / n;
		let px = X[r - 1];
		let py = Y[r - 1];
		for (let k = 0; k < n; k++) {
			const b = bAt(xs[r - 1] + (k + 0.5) * dx);
			px += Math.cos(b) * dx;
			py += Math.sin(b) * dx;
		}
		X[r] = px;
		Y[r] = py;
		B[r] = bAt(xs[r]);
	}
	let ym = 0;
	for (let r = 1; r < NR; r++) ym += ((Y[r] + Y[r - 1]) / 2) * (xs[r] - xs[r - 1]);
	ym /= L;
	const rho = integ(t, ROLL);
	const cr = Math.cos(rho);
	const sr = Math.sin(rho);
	for (let r = 0; r < NR; r++) {
		const [, w, th] = RINGS[r];
		const nx = -Math.sin(B[r]);
		const ny = Math.cos(B[r]);
		for (let c = 0; c < 4; c++) {
			const cw = CORNER[c][0] * w;
			const lx = X[r] + nx * cw;
			const ly = Y[r] - ym + ny * cw;
			const lz = CORNER[c][1] * th;
			const o = id4(r, c) * 3;
			set(o, lx, cr * ly - sr * lz, sr * ly + cr * lz);
		}
	}
	return out;
}
// Body-local rest positions to the world (no roll; only before the rig).
function toWorld(P, n, F, out) {
	const { O, ex, ey, ez } = F;
	for (let i = 0; i < n; i++) {
		const x = P[i * 3];
		const y = P[i * 3 + 1];
		const z = P[i * 3 + 2];
		out[i * 3] = O[0] + ex[0] * x + ey[0] * y + ez[0] * z;
		out[i * 3 + 1] = O[1] + ex[1] * x + ey[1] * y + ez[1] * z;
		out[i * 3 + 2] = O[2] + ex[2] * x + ey[2] * y + ez[2] * z;
	}
	return out;
}

// ── A frame ──────────────────────────────────────────────────────────────────
function draw(ctx, w, h, t, S) {
	const { L, Z, LINES, Qn } = S;
	const side = Qn.side;
	const Fr = frameAt(S.path, swumAt(t, S.path));
	// the lens
	const g = genRig(t, Fr);
	const rig = blend(g, swimRig(t, Fr, side), smooth(span(t, 8.6, 10)), smooth(span(t, 9.4, 11.2)));
	// a little wider while the quintic is written, for it and the swimmer both
	const fov = FOV + 7 * smooth(span(t, 8.8, 10.5)) * (1 - smooth(span(t, 14, 19)));
	const cam = camera3({ pos: rig.E, target: rig.T, up: UP, fov, w, h });
	const kf = h / 2 / Math.tan((fov * Math.PI) / 360);
	const [ex, ey, ez] = cam.pos;
	const { r: cr, u: cu, f: cf } = cam;
	const proj = (P, n, Q) => {
		for (let i = 0; i < n; i++) {
			const dx = P[i * 3] - ex;
			const dy = P[i * 3 + 1] - ey;
			const dz = P[i * 3 + 2] - ez;
			const z = dx * cf[0] + dy * cf[1] + dz * cf[2];
			const x = dx * cr[0] + dy * cr[1] + dz * cr[2];
			const y = dx * cu[0] + dy * cu[1] + dz * cu[2];
			Q[i * 3] = w / 2 + (kf * x) / z;
			Q[i * 3 + 1] = h / 2 - (kf * y) / z;
			Q[i * 3 + 2] = z;
		}
		return Q;
	};
	const ref = Math.hypot(...sub3(rig.E, place(Fr, 6, 0, 0)));
	const ink = makeInk();
	const dots = makeDots();
	const M = 30;
	// One segment from projected points, tested at its middle.
	const seg = (Q, a, b, alpha, width, hid, rel = 0.006, abs = 0.04, fog = null) => {
		if (alpha < 0.012) return;
		const az = Q[a + 2];
		const bz = Q[b + 2];
		if (az <= NEAR || bz <= NEAR) return;
		const ax = Q[a];
		const ay = Q[a + 1];
		const bx = Q[b];
		const by = Q[b + 1];
		if ((ax < -M && bx < -M) || (ax > w + M && bx > w + M)) return;
		if ((ay < -M && by < -M) || (ay > h + M && by > h + M)) return;
		const mz = (az + bz) / 2;
		if (fog) alpha *= fog(mz);
		const ws = Math.min(2.2, Math.max(0.5, ref / mz));
		if (behind(Z, (ax + bx) / 2, (ay + by) / 2, mz, rel, abs)) {
			if (hid > 0)
				ink.seg(PAL.chalk, alpha * hid, Math.max(0.8, width * 0.62), true, ax, ay, bx, by);
			return;
		}
		ink.seg(PAL.chalk, alpha, width * ws, false, ax, ay, bx, by);
	};
	// A segment from a to a + f(b − a), f < 1 (a line being written).
	const segPart = (Q, a, b, f, alpha, width, hid) => {
		if (f <= 0) return;
		if (f >= 1) return seg(Q, a, b, alpha, width, hid);
		const T = segPart.T;
		T[0] = Q[a];
		T[1] = Q[a + 1];
		T[2] = Q[a + 2];
		T[3] = lerp(Q[a], Q[b], f);
		T[4] = lerp(Q[a + 1], Q[b + 1], f);
		T[5] = lerp(Q[a + 2], Q[b + 2], f);
		seg(T, 0, 3, alpha, width, hid);
	};
	segPart.T = new Float64Array(6);

	Z.reset(w, h);
	if (t < 3.4) building(t, S, Fr, proj, seg, segPart, dots);
	else if (t < 7.0) subdividing(t, S, Fr, proj, seg, segPart, dots);
	else {
		// ── The limit, the rig, the swim ──
		const C = cageWorld(t, Fr, S.cage);
		const QC = proj(C, NCV, S.QC);
		mulW(L[2].W, C, S.lev2);
		const Q2 = proj(S.lev2, L[2].nV, S.Q[2]);
		zquads(Z, Q2, L[2].F);
		const fadeA = smooth(span(t, 7.6, 9.2)); // every 2nd long line → every 4th
		let QL;
		if (t < 7.4) {
			// the slide to the limit, from level 3 at rest
			const sl = smooth(span(t, 7.0, 7.4));
			const P3 = L[3].rest;
			const PL = S.limRest;
			const T3 = S.tmp[3];
			for (let i = 0; i < T3.length; i++) T3[i] = lerp(P3[i], PL[i], sl);
			QL = proj(toWorld(T3, L[3].nV, Fr, S.lim), L[3].nV, S.QL);
		} else QL = proj(mulW(S.WL, C, S.lim), L[3].nV, S.QL);
		const quint = t >= 9 ? quintic(t, S, proj) : null;
		// the object's sheets into the same depth buffer
		if (quint) quint.depth();
		// ghosts: level 2 fading, the cage faint, then the rig
		const g2 = 0.32 * (1 - smooth(span(t, 7.0, 7.5)));
		if (g2 > 0.012) {
			const E2 = L[2].E;
			for (let e = 0; e < E2.length; e += 2) seg(Q2, E2[e] * 3, E2[e + 1] * 3, g2, 0.9, 0);
		}
		const gc = lerp(0.12, 0.3, smooth(span(t, 7.3, 7.9))) * (1 - smooth(span(t, 8.4, 9.1)));
		if (gc > 0.012) {
			const E0 = L[0].E;
			for (let e = 0; e < E0.length; e += 2) cageEdge(QC, E0[e], E0[e + 1], gc, 1.0, 0, seg, S);
		}
		// the limit body
		const bold = smooth(span(t, 7.0, 7.4));
		for (const ln of LINES) {
			let a = 0.78;
			let wd = 1.2;
			if (ln.cls === 1) a *= 1 - fadeA;
			if (ln.cls === 3) {
				a = lerp(0.78, 0.95, bold);
				wd = lerp(1.2, 1.9, bold);
			}
			if (a < 0.012) continue;
			const I = ln.idx;
			const n = I.length;
			for (let k = 0; k < n - 1; k++) seg(QL, I[k] * 3, I[k + 1] * 3, a, wd, 0, 0.004, 0.03);
			if (ln.closed) seg(QL, I[n - 1] * 3, I[0] * 3, a, wd, 0, 0.004, 0.03);
		}
		if (quint) quint.lines(seg, cam);
		ink.flush(ctx);
		if (quint) quint.point(ctx, cam);
		dots.flush(ctx);
	}
	if (t < 7.0) {
		ink.flush(ctx);
		dots.flush(ctx);
		// the lit point the cube is drawn round
		const lp = smooth(span(t, 0, 0.18)) * (1 - smooth(span(t, 0.42, 0.8)));
		if (lp > 0) {
			const P = place(Fr, 0.75, 0, 0);
			const q = cam.project(P);
			const hid = q[2] > NEAR && t > 0.3 && behind(Z, q[0], q[1], q[2], 0.002, 0.01);
			lit3(ctx, cam, P, 3.2 * (hid ? 0.8 : 1), lp * (hid ? 0.4 : 1));
		}
	}
	// fade and round
	const fo = smooth(span(t, 19.6, 20));
	if (fo > 0) {
		ctx.save();
		ctx.globalAlpha = fo;
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(0, 0, w, h);
		ctx.restore();
	}
}

// A cage edge, cut in pieces so the hidden test keeps up with its length.
function cageEdge(QC, a, b, alpha, width, hid, seg, S, upto = 1) {
	const T = (S.ce ??= new Float64Array(6));
	const ax = QC[a * 3];
	const ay = QC[a * 3 + 1];
	const az = QC[a * 3 + 2];
	const bx = QC[b * 3];
	const by = QC[b * 3 + 1];
	const bz = QC[b * 3 + 2];
	if (az <= NEAR || bz <= NEAR) return;
	const Lp = Math.hypot(bx - ax, by - ay);
	const n = Math.max(1, Math.min(14, Math.ceil(Lp / 18)));
	const end = n * clamp01(upto);
	for (let i = 0; i < end; i++) {
		const f0 = i / n;
		const f1 = Math.min(end, i + 1) / n;
		// perspective-correct along the edge: interpolate 1/z
		const p = (f) => {
			const iz = lerp(1 / az, 1 / bz, f);
			const s = f / bz / iz;
			return [lerp(ax, bx, f), lerp(ay, by, f), lerp(az, bz, s)];
		};
		const q0 = p(f0);
		const q1 = p(f1);
		T[0] = q0[0];
		T[1] = q0[1];
		T[2] = q0[2];
		T[3] = q1[0];
		T[4] = q1[1];
		T[5] = q1[2];
		seg(T, 0, 3, alpha, width, hid);
	}
}

// ── 0–3.4 s: the cube, extruded, squashed, looped ────────────────────────────
function building(t, S, Fr, proj, seg, segPart, dots) {
	const { Z } = S;
	const st = Array.from({ length: NR }, (_, r) => ringAt(r, t));
	const rs = [];
	for (let r = 0; r < NR; r++) if (st[r][3]) rs.push(r);
	const C = cageWorld(t, Fr, S.cage);
	const QC = proj(C, NCV, S.QC);
	const { F } = cageFaces(rs);
	zquads(Z, QC, F);
	// The cube: twelve strokes, front face, back face, then the four between.
	if (t < T_CUBE[1]) {
		const E = [];
		for (let c = 0; c < 4; c++) E.push([id4(0, c), id4(0, c + 1)]);
		for (let c = 0; c < 4; c++) E.push([id4(1, c), id4(1, c + 1)]);
		for (let c = 0; c < 4; c++) E.push([id4(0, c), id4(1, c)]);
		const step = (T_CUBE[1] - T_CUBE[0] - 0.08) / 11;
		E.forEach(([a, b], k) => {
			const p = span(t, T_CUBE[0] + k * step, T_CUBE[0] + k * step + 0.08);
			if (p > 0) cageEdge(QC, a, b, CUR, 1.4, 0.34, seg, S, smooth(p));
		});
		return;
	}
	// The cage so far: the rings, and the long edges between present rings.
	for (let i = 0; i < rs.length; i++) {
		const r = rs[i];
		const hot = st[r][4];
		const a = CUR + 0.18 * hot;
		const wd = 1.3 + 0.5 * hot;
		// a new edge loop is written round as it goes in
		const wr = r === LOOP ? smooth(span(t, T_LOOP[0], T_LOOP[0] + 0.12)) * 4 : 4;
		for (let c = 0; c < 4; c++)
			if (wr > c) cageEdge(QC, id4(r, c), id4(r, c + 1), a, wd, 0.34, seg, S, Math.min(1, wr - c));
		if (i < rs.length - 1) {
			const r2 = rs[i + 1];
			const hot2 = st[r2][4];
			for (let c = 0; c < 4; c++)
				cageEdge(QC, id4(r, c), id4(r2, c), CUR + 0.1 * hot2, 1.3 + 0.2 * hot2, 0.34, seg, S);
		}
	}
	// the corners of the face being pulled
	for (const r of rs)
		if (st[r][4] > 0.05)
			for (let c = 0; c < 4; c++) {
				const o = id4(r, c) * 3;
				if (QC[o + 2] > NEAR) dots.dot(QC[o], QC[o + 1], 2.2, 0.85 * st[r][4]);
			}
}

// ── 3.4–7.0 s: three steps of Catmull–Clark ──────────────────────────────────
// Is a level-3 edge on the limit's lines (every 2nd long line, every 4th
// ring, the caps' quarter lines)?
const onGrid = (x, n) => Math.abs(x * n - Math.round(x * n)) < 1e-6;
function keepEdge(PAR, a, b) {
	for (let o = 0; o < 6; o += 2) {
		const ua = PAR[a * 6 + o];
		const ub = PAR[b * 6 + o];
		if (Number.isNaN(ua) || Number.isNaN(ub)) continue;
		const va = PAR[a * 6 + o + 1];
		const vb = PAR[b * 6 + o + 1];
		if (o === 0) {
			if (Math.abs(ua - ub) < 1e-7) return onGrid(ua, 2);
			if (Math.abs(va - vb) < 1e-7) return onGrid(va, 4);
		} else {
			if (Math.abs(ua - ub) < 1e-7) return onGrid(ua, 4);
			if (Math.abs(va - vb) < 1e-7) return onGrid(va, 4);
		}
	}
	return false;
}
const STEPS = [
	{ f: [3.4, 3.72], e: [3.68, 4.0], n: [3.98, 4.48] },
	{ f: [4.8, 5.04], e: [5.02, 5.26], n: [5.24, 5.62] },
	{ f: [6.0, 6.18], e: [6.16, 6.33], n: [6.31, 6.6] }
];
const THIN = [6.72, 7.0]; // level 3 thinned to the limit's lines
function subdividing(t, S, Fr, proj, seg, segPart, dots) {
	const { L, Z } = S;
	// which step: the last one begun
	let k = 1;
	for (let i = 0; i < 3; i++) if (t >= STEPS[i].f[0]) k = i + 1;
	const sp = STEPS[k - 1];
	const sig = smooth(span(t, sp.n[0], sp.n[1])); // the old vertices' slide
	const live = t >= sp.n[0]; // the new mesh is being drawn
	// Positions: every level at rest, in the world; level k mid-slide.
	const Qs = [];
	for (let j = 0; j <= 3; j++) {
		if (j > k) break;
		const Lj = L[j];
		let P = Lj.rest;
		if (j === k) {
			const T = S.tmp[j];
			T.set(Lj.rest);
			const Po = L[j - 1].rest;
			for (let i = 0; i < Lj.nOld * 3; i++) T[i] = lerp(Po[i], Lj.rest[i], sig);
			P = T;
		}
		Qs.push(proj(toWorld(P, Lj.nV, Fr, S.lim.subarray(0, Lj.nV * 3)), Lj.nV, S.Q[j]));
	}
	// Depth: the mesh being made once it is drawn (level 2 for level 3).
	const dl = live ? Math.min(k, 2) : k - 1;
	zquads(Z, Qs[dl], L[dl].F);
	// Ghosts and the current mesh, by level.
	const alphaOf = (j) => {
		// the level's alpha once complete
		let a = CUR;
		for (let m = j + 1; m <= 3; m++) {
			const s = STEPS[m - 1];
			const d = smooth(span(t, s.n[0], s.n[1]));
			const to = m === j + 1 ? 0.35 : m === j + 2 ? (j === 0 ? 0.12 : 0) : j === 0 ? 0.12 : 0;
			const from = m === j + 1 ? CUR : m === j + 2 ? 0.35 : j === 0 ? 0.12 : 0;
			if (t >= s.n[0]) a = lerp(from, to, d);
		}
		return a;
	};
	const wOf = (j) => [1.25, 1.15, 1.0, 0.9][j];
	const hidOf = (j) => (j === 0 ? 0.3 : j === 1 ? 0.2 : 0);
	for (let j = 0; j < k; j++) {
		const a = alphaOf(j);
		if (a < 0.012) continue;
		const E = L[j].E;
		const ghost = a < CUR - 0.01;
		if (j === 0)
			for (let e = 0; e < E.length; e += 2)
				cageEdge(Qs[0], E[e], E[e + 1], a, wOf(0), ghost ? 0 : hidOf(0), seg, S);
		else
			for (let e = 0; e < E.length; e += 2)
				seg(Qs[j], E[e] * 3, E[e + 1] * 3, a, wOf(j), ghost ? 0 : hidOf(j));
	}
	// Level k: the dots, then the spokes and the halves.
	const Lk = L[k];
	const Q = Qs[k];
	const nO = Lk.nOld;
	const nOE = Lk.nOldE;
	const restK = Lk.rest;
	const sweep = (i) => clamp01((restK[i * 3] + 0.5) / 55);
	const dotEnd = smooth(span(t, sp.n[0] + 0.5 * (sp.n[1] - sp.n[0]), sp.n[1] + 0.15));
	const rFace = [2.3, 1.7, 1.25][k - 1];
	const rEdge = [1.8, 1.35, 1.0][k - 1];
	const thin = k === 3 ? smooth(span(t, THIN[0], THIN[1])) : 0;
	if (dotEnd < 1) {
		const pop = (i, w0, w1, r) => {
			const a0 = w0 + (w1 - w0 - 0.07) * sweep(i);
			const a = smooth(span(t, a0, a0 + 0.07)) * (1 - dotEnd);
			if (a < 0.03) return;
			const o = i * 3;
			if (Q[o + 2] <= NEAR) return;
			const hid = behind(Z, Q[o], Q[o + 1], Q[o + 2], 0.006, 0.05);
			dots.dot(Q[o], Q[o + 1], r, a * (hid ? 0.25 : 0.95));
		};
		for (let f = 0; f < Lk.nV - nO - nOE; f++) pop(nO + nOE + f, sp.f[0], sp.f[1], rFace);
		for (let e = 0; e < nOE; e++) pop(nO + e, sp.e[0], sp.e[1], rEdge);
	}
	if (live) {
		const E = Lk.E;
		const K = Lk.EKIND;
		const dn = sp.n[1] - sp.n[0];
		const grow = 0.45 * dn;
		const aK = k === 3 ? 0.7 : CUR;
		const PAR = Lk.PAR;
		for (let e = 0, q = 0; e < E.length; e += 2, q++) {
			const a = E[e];
			const b = E[e + 1];
			let al = aK;
			if (thin > 0 && !keepEdge(PAR, a, b)) al *= 1 - thin;
			if (al < 0.012) continue;
			if (K[q]) {
				// a spoke, drawn out from its face point a to the edge point b
				const a0 = sp.n[0] + (dn - grow) * sweep(a);
				const g = smooth(span(t, a0, a0 + grow));
				segPart(Q, a * 3, b * 3, g, al, wOf(k), hidOf(k));
			} else {
				const g = smooth(span(t, sp.n[0], sp.n[0] + 0.25 * dn));
				seg(Q, a * 3, b * 3, al * g, wOf(k), hidOf(k));
			}
		}
	}
}

// ── The quintic, per frame ───────────────────────────────────────────────────
function quintic(t, S, proj) {
	const { patches } = S.Qn;
	const al = alphaAt(t);
	const ca = Math.cos(al);
	const sa = Math.sin(al);
	const NP = (NG + 1) * (NG + 1);
	const P = S.PO;
	patches.forEach(({ Zs }, p) => {
		for (let i = 0; i < NP; i++) {
			const o = (p * NP + i) * 3;
			// (Re z₁, Re z₂, cos α Im z₁ + sin α Im z₂), Z up
			P[o] = SCALE * Zs[i * 4];
			P[o + 1] = SCALE * Zs[i * 4 + 2];
			P[o + 2] = SCALE * (ca * Zs[i * 4 + 1] + sa * Zs[i * 4 + 3]);
		}
	});
	const Q = proj(P, 25 * NP, S.QO);
	const Z = S.Z;
	// each patch out of the dark, written from η = 0 outward
	const rev = patches.map((_, p) => smooth(span(t, 9 + p * 0.09, 9 + p * 0.09 + 0.85)));
	const bOf = (j) => Math.abs((2 * j) / NG - 1);
	const at = (p, i, j) => (p * NP + i * (NG + 1) + j) * 3;
	return {
		depth() {
			for (let p = 0; p < 25; p++) {
				const r = rev[p];
				if (r <= 0) continue;
				for (let i = 0; i < NG; i++)
					for (let j = 0; j < NG; j++) {
						if (Math.max(bOf(j), bOf(j + 1)) > r + 1e-9) continue;
						const a = at(p, i, j);
						const b = at(p, i + 1, j);
						const c = at(p, i + 1, j + 1);
						const d = at(p, i, j + 1);
						ztri(Z, Q[a], Q[a + 1], Q[a + 2], Q[b], Q[b + 1], Q[b + 2], Q[c], Q[c + 1], Q[c + 2]);
						ztri(Z, Q[a], Q[a + 1], Q[a + 2], Q[c], Q[c + 1], Q[c + 2], Q[d], Q[d + 1], Q[d + 2]);
					}
			}
		},
		lines(seg, cam) {
			// near sheets bright, far ones dim
			const zc = cam.project([0, 0, 0])[2];
			const fog = (mz) => 0.36 + 0.64 * smooth(span(zc + 150 - mz, 0, 300));
			const T = (S.qt ??= new Float64Array(6));
			for (let p = 0; p < 25; p++) {
				const r = rev[p];
				if (r <= 0) continue;
				const a0 = 0.78 * r;
				// ξ-lines: along η, out from η = 0 both ways to the front r
				for (const i of XI_LINES)
					for (let j = 0; j < NG; j++) {
						const bi = bOf(j);
						const bj = bOf(j + 1);
						const near = bi < bj ? j : j + 1;
						const far = bi < bj ? j + 1 : j;
						const bn = Math.min(bi, bj);
						const bf = Math.max(bi, bj);
						const f = clamp01((r - bn) / (bf - bn));
						if (f <= 0) continue;
						const A = at(p, i, near);
						const B = at(p, i, far);
						if (f >= 1) seg(Q, A, B, a0, 1.05, 0, 0.008, 0.2, fog);
						else {
							T[0] = Q[A];
							T[1] = Q[A + 1];
							T[2] = Q[A + 2];
							T[3] = lerp(Q[A], Q[B], f);
							T[4] = lerp(Q[A + 1], Q[B + 1], f);
							T[5] = lerp(Q[A + 2], Q[B + 2], f);
							seg(T, 0, 3, a0, 1.05, 0, 0.008, 0.2, fog);
						}
					}
				// η-lines: each written along ξ once the front has passed it
				for (const j of ETA_LINES) {
					const wr = clamp01((r - bOf(j)) / 0.3) * NG;
					for (let i = 0; i < NG && i < wr; i++)
						seg(
							Q,
							at(p, i, j),
							at(p, i + 1, j),
							a0 * Math.min(1, wr - i),
							1.05,
							0,
							0.008,
							0.2,
							fog
						);
				}
			}
		},
		point(ctx, cam) {
			const on = smooth(span(t, 11.6, 12.6));
			if (on <= 0) return;
			const q = cam.project(DEST);
			if (q[2] <= NEAR) return;
			const hid = behind(Z, q[0], q[1], q[2], 0.01, 0.3);
			const r = Math.min(7, Math.max(2.6, (3.2 * 260) / q[2]));
			lit3(ctx, cam, DEST, r * (hid ? 0.8 : 1), on * (hid ? 0.3 : 0.95));
		}
	};
}
