import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	bloom,
	PAL,
	TAU,
	PHI,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag,
	camera3,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm
} from './log/board.js';
import {
	NEAR,
	lerp3,
	orbit,
	pxPerUnit,
	makeDepth,
	line3,
	circle3,
	axesOf,
	limb
} from './log/space.js';
import { ribbon, lecture } from './log/ink.js';
import { spiralArc } from './log/sperm.js';

// ── Sketch: log-universe — the closed universes, seen from inside ────────────
// More of the clopen space: universes with no edge and a finite volume —
// closed, yet open round every point you stand at — each drawn on the board
// the way a swimmer in it would see it. Einstein's first cosmology was one
// (S³); the shapes here are the ones cosmologists still test the sky against.
// Every variant opens on a CHART of its universe — a drawing in ordinary
// space, seen from outside, the way the atlas draws its plates — and the lens
// flies INTO the chart's centre, where the drawing becomes the view itself
// (from the chart's own centre a perspective view of a gnomonic or a
// stereographic chart is exactly what the eye there would see, since the
// chart is radial from it). Eleven seconds, a pure function of progress;
// everything projected by hand (space.js), hidden lines faint and dashed;
// the lens re-timed (retime) so what it sees only gathers pace; and each ends
// on a lit point — a gold disc, a cream core — as the way on. One per ?v=:
//
//   torus   (default) T³ = ℝ³/ℤ³: the unit cube with each face glued to the
//           one opposite by a translation (x ∼ x + 1, y ∼ y + 1, z ∼ z + 1),
//           its gluings marked by matching arrows — cyan on the x-faces,
//           pink on the y-faces, violet on the z — and the swimmer inside.
//           The lens comes round the cube and in through its +z face, riding
//           behind the swimmer, and from inside the cube is seen repeated
//           through every wall: the universal cover, a cubic lattice of copies
//           in perspective, grey nodes at the corners, the swimmer in every
//           cell — the one straight ahead is the swimmer itself, from behind
//           (the back of your own head). The lens swims through a wall and
//           nothing changes. The lit point is the copy ahead's head.
//   dodeca  Poincaré's dodecahedral space, S³/2I: the 120-cell is built at
//           start as the dual of the 600-cell whose vertices are the binary
//           icosahedral group 2I (120 unit quaternions), so the cell round 1
//           is a dodecahedron and the cell round g is g · (that cell) by left
//           multiplication. The face of cell 1 toward neighbour g_k is glued
//           to the opposite face by g_k⁻¹ — a 36° turn in the plane across
//           and a 36° turn in the face's own plane: the twist — and the six
//           face pairs carry matching arrows in six colours, the opposite
//           arrow the image of the first under its gluing. The chart is
//           gnomonic from the lens's own point of S³ (great circles are
//           straight, so every cell has straight edges): the central cell
//           bold, the twelve across its faces and the twenty beyond fading
//           out, each the one cell carried by its group element and showing
//           the same arrows, turned. The lens flies in through one face,
//           and on through its partner into the next cell, the chart
//           re-centred on the lens as it goes, toward the swimmer there.
//   mirror  a closed universe you cannot orient: the Klein bottle, by the
//           smooth parametrisation of the classic immersed bottle (u ∈ [0, π],
//           v ∈ [0, 2π]) whose ends glue by (π, v) ∼ (0, π − v) — a
//           reflection in v. A cyan/pink grid on it, hidden lines dashed by a
//           depth buffer of the surface, the seam in rose. The swimmer's
//           spiral is drawn in the surface's tangent plane (∂u, ∂v) and
//           carried round the loop v = π/2 — a closed loop through the seam
//           back to its own start — with its frame transported continuously:
//           ∂u matches across the seam, ∂v comes back reversed, so it lands on
//           its own faint ghost as its mirror image, the spiral winding the
//           other way, and swims on. A left hand comes back a right.
//   sphere  Einstein's closed universe S³, by the stereographic chart from
//           where you stand (projected from your antipode): great circles
//           through you are straight lines, every other one a circle, the
//           equator (90° from you, in every direction) a sphere of radius 1.
//           A lattice of grey nodes — 2I again, 120 points evenly spread,
//           the eye at the centre of one of its tetrahedra — in shells.
//           The lens dives through the equator to the eye, then flies on
//           while the swimmer swims off ahead down a great circle: it
//           shrinks to the equator and GROWS again past it (apparent size
//           1/sin d), its spiral at last filling the sky from the far pole —
//           drawn by the chart, not faked — its head the lit point, dead
//           ahead.
//
// Every frame is a pure function of progress: ?at= pins it. 16–28 ms a
// frame headless at 1280 × 800 (the torus's last frames the heaviest, with
// their copies and the portal; the rest sit on the frame floor).

const SECONDS = 11;
// Progress that starts at rest and only gathers pace, cosh-shaped by k.
const pace = (u, k) => (Math.cosh(k * clamp01(u)) - 1) / (Math.cosh(k) - 1);
const UP = [0, 1, 0];
const ORIGIN = [0, 0, 0];
const GOLD_HALO = 'rgba(255, 222, 150, 0.55)';

export default async function make({ at }) {
	const v = variant(['torus', 'dodeca', 'mirror', 'sphere']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const Z = makeDepth();
	const S = { torus: torusSetup, dodeca: dodecaSetup, mirror: mirrorSetup, sphere: sphereSetup }[
		v
	]();
	const draw = { torus, dodeca, mirror, sphere }[v];

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, S, Z);
		tag(ctx, w, h, `log-universe · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Paths and pace ───────────────────────────────────────────────────────────
// A path re-timed so what the lens sees never slows: `state(s)` is the raw
// path (s in 0..1), `step(a, b)` the apparent motion between two of its
// states; the running maximum of that pace is the pace kept, and u is mapped
// to the point the path reaches at it (log-closure's lensPath, generalised).
function retime(state, step, M = 400) {
	const S = [];
	for (let i = 0; i <= M; i++) S.push(state(i / M));
	const len = [0];
	const pc = [];
	for (let i = 0; i < M; i++) {
		const d = step(S[i], S[i + 1]);
		pc.push(d * M);
		len.push(len[i] + d);
	}
	const keep = [0];
	let top = 0;
	for (let i = 0; i < M; i++) {
		top = Math.max(top, pc[i]);
		keep.push(keep[i] + top / M);
	}
	const k = len[M] / keep[M];
	const warp = new Float64Array(M + 1);
	for (let i = 0, j = 0; i <= M; i++) {
		const want = k * keep[i];
		while (j < M - 1 && len[j + 1] < want) j++;
		const seg = len[j + 1] - len[j];
		warp[i] = (j + (seg > 0 ? clamp01((want - len[j]) / seg) : 0)) / M;
	}
	return (u) => {
		const x = clamp01(u) * M;
		const i = Math.min(M - 1, Math.floor(x));
		return state(lerp(warp[i], warp[i + 1], x - i));
	};
}

// A cubic Bézier through P[0..3], walked by arc length: at(s), tan(s).
function bezierPath(P, n = 400) {
	const at = (t) => {
		const s = 1 - t;
		const a = s * s * s;
		const b = 3 * s * s * t;
		const c = 3 * s * t * t;
		const d = t * t * t;
		return [0, 1, 2].map((i) => a * P[0][i] + b * P[1][i] + c * P[2][i] + d * P[3][i]);
	};
	const tan = (t) => {
		const s = 1 - t;
		return norm(
			[0, 1, 2].map(
				(i) =>
					3 * s * s * (P[1][i] - P[0][i]) +
					6 * s * t * (P[2][i] - P[1][i]) +
					3 * t * t * (P[3][i] - P[2][i])
			)
		);
	};
	const L = [0];
	let prev = at(0);
	for (let i = 1; i <= n; i++) {
		const p = at(i / n);
		L.push(L[i - 1] + Math.hypot(...sub3(p, prev)));
		prev = p;
	}
	const tOf = (s) => {
		const want = clamp01(s) * L[n];
		let j = 0;
		while (j < n - 1 && L[j + 1] < want) j++;
		const seg = L[j + 1] - L[j];
		return (j + (seg > 0 ? (want - L[j]) / seg : 0)) / n;
	};
	return { length: L[n], at: (s) => at(tOf(s)), tan: (s) => tan(tOf(s)) };
}

// The flight into a chart: the lens comes in along a Bézier (arc length,
// looking where it goes) to the chart's centre, arriving along +z, then holds
// the centre while the chart itself is carried on along +z by θ — the
// chart's own point of the universe moving — up to thetaEnd. The raw split
// is set so the world speed is continuous at the hand-over, and the whole is
// re-timed by the apparent pace, `near(x)` being how close the nearest
// thing is to a lens at x.
function flight(P, thetaEnd, near, extra = null) {
	const path = bezierPath(P);
	const split = path.length / (path.length + thetaEnd);
	const state = (s) => {
		if (s < split) {
			const k = s / split;
			const x = path.at(k);
			// Looking at the centre first, then where it is going (the two
			// agree as it arrives, along +z).
			const m = smooth(span(k, 0.3, 1));
			const dir = norm(add3(mul3(norm(mul3(x, -1)), 1 - m), mul3(path.tan(k), m)));
			return { x, dir, theta: 0, s };
		}
		return { x: ORIGIN, dir: [0, 0, 1], theta: (thetaEnd * (s - split)) / (1 - split), s };
	};
	const step = (a, b) =>
		Math.hypot(...sub3(a.x, b.x)) / near(a.x) +
		Math.hypot(...sub3(a.dir, b.dir)) +
		Math.abs(a.theta - b.theta) / near(ORIGIN) +
		(extra ? extra(a, b) : 0);
	return { at: retime(state, step), split };
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Segments batched by colour, alpha and width, so a lattice of a thousand
// lines is a handful of strokes.
function makeInk() {
	const B = new Map();
	return {
		seg(color, alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.015) return;
			const a = Math.min(11, Math.round(alpha * 11));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 11, width: wq / 4, P: [] };
				B.set(key, b);
			}
			b.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			for (const b of B.values()) {
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
const wOf = (ref, z, cap = 2.8) => (ref ? Math.min(cap, Math.max(0.4, ref / z)) : 1);

// A 3D segment into the ink: cut at the near plane, its width by depth.
function seg3(ink, cam, a, b, color, alpha, width, ref = 0, cap = 2.8) {
	if (alpha < 0.015) return;
	let qa = cam.project(a);
	let qb = cam.project(b);
	if (!Number.isFinite(qa[0] + qa[1] + qb[0] + qb[1])) return;
	if (qa[2] <= NEAR && qb[2] <= NEAR) return;
	if (qa[2] <= NEAR || qb[2] <= NEAR) {
		const t = (qa[2] - NEAR) / (qa[2] - qb[2]);
		const c = cam.project(lerp3(a, b, t));
		if (qa[2] <= NEAR) qa = c;
		else qb = c;
	}
	ink.seg(color, alpha, width * wOf(ref, (qa[2] + qb[2]) / 2, cap), qa[0], qa[1], qb[0], qb[1]);
}

// A small arrow on a face: centre c, along d (unit), its head spread along e.
function arrow3(ink, cam, c, d, e, L, color, alpha, width, ref, upto = 1) {
	if (upto <= 0) return;
	const a = add3(c, mul3(d, -L * 0.5));
	const t = add3(c, mul3(d, L * 0.5));
	const tip = lerp3(a, t, Math.min(1, upto * 1.3));
	seg3(ink, cam, a, tip, color, alpha, width, ref);
	if (upto < 0.75) return;
	const k = span(upto, 0.75, 1);
	for (const s of [1, -1]) {
		const back = add3(add3(t, mul3(d, -L * 0.28)), mul3(e, s * L * 0.2));
		seg3(ink, cam, t, lerp3(t, back, k), color, alpha, width, ref);
	}
}

// The swimmer in 3D: the golden-spiral sperm (log/sperm.js's shape — the
// tail an arc of r = φ^(2θ/π), the head its own tighter coil) laid into
// space by `place([x, y])`, which takes the spiral's own plane to a 3D
// point. Width tapers down the tail and goes by depth (`ref`, the depth at
// which `width` is drawn as is); hidden by `depth` it is faint and dashed;
// `fade(p)` dims it per point. Returns the head's screen point.
function swimmer3(ctx, cam, place, o) {
	const {
		scale = 1,
		turn = 0,
		phase = 0,
		wiggle = 0.12,
		width = 6,
		tip = 2.2,
		color = PAL.gold,
		alpha = 1,
		body = 1,
		ref = 0,
		cap = 2.8,
		depth = null,
		fade = null,
		n = 80,
		coil = true,
		dash = null
	} = o;
	if (alpha <= 0.01 || body <= 0) return null;
	const from = -Math.PI * 0.35;
	const run = (pts2, w0, w1) => {
		let P = [];
		let W = [];
		let A = [];
		let back = null;
		const flush = () => {
			if (P.length > 1) {
				if (back || dash)
					stroke(ctx, P, {
						color,
						width: Math.max(0.7, W[W.length >> 1] * (back ? 0.55 : 1)),
						alpha: back ? alpha * 0.3 : alpha,
						dash: dash ?? [3, 6]
					});
				else ribbon(ctx, P, W, A, color);
			}
			P = [];
			W = [];
			A = [];
		};
		const m = pts2.length - 1;
		for (let i = 0; i <= m; i++) {
			const p = place(pts2[i]);
			const q = cam.project(p);
			if (!(q[2] > NEAR) || !Number.isFinite(q[0] + q[1])) {
				flush();
				back = null;
				continue;
			}
			const hb = depth ? depth.hidden(q) : false;
			const wd = lerp(w0, w1, i / m) * wOf(ref, q[2], cap);
			const f = alpha * (fade ? fade(p) : 1);
			if (back !== null && hb !== back) {
				P.push([q[0], q[1]]);
				W.push(wd);
				A.push(f);
				flush();
			}
			back = hb;
			P.push([q[0], q[1]]);
			W.push(wd);
			A.push(f);
		}
		flush();
	};
	const tail = spiralArc({ scale, turn, from, length: 7.2 * clamp01(body), n, wiggle, phase });
	run(tail, width, lerp(width, tip, clamp01(body)));
	const hs = smooth((body - 0.15) / 0.5);
	const pole = place([0, 0]);
	const q = cam.project(pole);
	if (hs <= 0 || q[2] <= NEAR || dash) return q[2] > NEAR ? q : null;
	if (coil) {
		const c = spiralArc({ scale, turn, from: from - 9.5, length: 9.5, n: 36 });
		run(c, width * 0.35 * hs, width * hs);
	}
	const hb = depth ? depth.hidden(q) : false;
	const f = alpha * (fade ? fade(pole) : 1) * (hb ? 0.3 : 1);
	disc(ctx, q[0], q[1], Math.max(1.2, width * 0.62 * hs * wOf(ref, q[2], cap)), {
		fill: color,
		alpha: f
	});
	return q;
}

// The way on: a lit point at screen (x, y) of radius r — a gold disc, a
// cream core, a halo — grown by g (0..1) toward a third of the frame, R.
function portal(ctx, x, y, r, g, R, a = 1) {
	if (a <= 0.01) return;
	const rr = Math.max(r, R * 0.36 * Math.pow(g, 1.4));
	if (g > 0) bloom(ctx, x, y, R * (0.1 + 0.55 * g) + rr, GOLD_HALO, g * a);
	bloom(ctx, x, y, rr * 3, GOLD_HALO, 0.5 * a);
	disc(ctx, x, y, rr, { fill: PAL.gold, alpha: 0.96 * a });
	disc(ctx, x, y, rr * (g > 0.3 ? 0.58 : 0.45), {
		fill: '#fff6e0',
		alpha: a * (g > 0.3 ? span(g, 0.3, 0.8) : 0.9)
	});
}
// When the way on shows: a beat before it grows.
const wayOn = (u) => smooth(span(u, 0.78, 0.86));

// The lecture, its patch of board only as deep as the lines begun so far.
const notes = (ctx, w, h, lines) =>
	lecture(
		ctx,
		w,
		h,
		lines.filter(([, p]) => p > 0)
	);

// ── 4D: S³ as unit quaternions ───────────────────────────────────────────────
const dot4 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
const norm4 = (a) => {
	const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l, a[3] / l];
};
const add4 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
const mul4 = (a, s) => [a[0] * s, a[1] * s, a[2] * s, a[3] * s];
// a + bi + cj + dk, as [a, b, c, d]: the product and the conjugate.
const qm = (p, q) => [
	p[0] * q[0] - p[1] * q[1] - p[2] * q[2] - p[3] * q[3],
	p[0] * q[1] + p[1] * q[0] + p[2] * q[3] - p[3] * q[2],
	p[0] * q[2] - p[1] * q[3] + p[2] * q[0] + p[3] * q[1],
	p[0] * q[3] + p[1] * q[2] - p[2] * q[1] + p[3] * q[0]
];
const conj = (q) => [q[0], -q[1], -q[2], -q[3]];
// The exponential map at c: the point |v| along the unit tangent v̂.
const expAt = (c, v) => {
	const l = Math.hypot(v[0], v[1], v[2], v[3]);
	if (l < 1e-9) return c;
	return add4(mul4(c, Math.cos(l)), mul4(v, Math.sin(l) / l));
};
// Gram–Schmidt: the part of a orthogonal to the unit vectors given.
const perp4 = (a, ...basis) => {
	let v = a;
	for (const b of basis) v = add4(v, mul4(b, -dot4(v, b)));
	return norm4(v);
};

// The binary icosahedral group 2I — the 600-cell's 120 vertices — and the
// 120-cell as its dual: its 600 vertices the centres of the 600-cell's
// tetrahedra (four group elements 36° apart), its 1200 edges between
// tetrahedra sharing a face. Built once, on first use.
let CELL = null;
function build120() {
	if (CELL) return CELL;
	const perms = (v) => {
		const out = [];
		const rec = (a, rest) => {
			if (!rest.length) {
				out.push(a);
				return;
			}
			rest.forEach((x, i) =>
				rec(
					[...a, x],
					rest.filter((_, j) => j !== i)
				)
			);
		};
		rec([], v);
		return out;
	};
	const parity = (p) => {
		let s = 0;
		for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (p[i] > p[j]) s++;
		return s % 2;
	};
	const evenPerms = (v) =>
		perms([0, 1, 2, 3])
			.filter((p) => parity(p) === 0)
			.map((p) => p.map((i) => v[i]));
	const signs = (v) => {
		const out = [];
		for (let m = 0; m < 16; m++) out.push(v.map((x, i) => ((m >> i) & 1 ? -x : x)));
		return out;
	};
	const key = (v) => v.map((x) => x.toFixed(6)).join(',');
	const G = new Map();
	const addg = (vs) => vs.forEach((q) => G.set(key(q), q));
	for (const p of perms([1, 0, 0, 0])) addg(signs(p));
	addg(signs([0.5, 0.5, 0.5, 0.5]));
	for (const p of evenPerms([0, 0.5, PHI / 2, 1 / (2 * PHI)])) addg(signs(p));
	const g = [...G.values()];
	const adj = g.map((a) =>
		g
			.map((b, j) => [dot4(a, b), j])
			.filter(([d]) => Math.abs(d - PHI / 2) < 1e-6)
			.map(([, j]) => j)
	);
	const T = [];
	for (let a = 0; a < g.length; a++)
		for (const b of adj[a])
			if (b > a)
				for (const c of adj[a])
					if (c > b && adj[b].includes(c))
						for (const d of adj[a])
							if (d > c && adj[b].includes(d) && adj[c].includes(d)) T.push([a, b, c, d]);
	const verts = T.map((t) => norm4([0, 1, 2, 3].map((k) => t.reduce((s, i) => s + g[i][k], 0))));
	// Edges: tetrahedra sharing three vertices — found through the vertices,
	// each of which is in 20 tetrahedra.
	const byV = g.map(() => []);
	T.forEach((t, i) => t.forEach((x) => byV[x].push(i)));
	const E = [];
	const seen = new Set();
	for (let i = 0; i < T.length; i++) {
		const cand = new Map();
		for (const x of T[i]) for (const j of byV[x]) if (j > i) cand.set(j, (cand.get(j) ?? 0) + 1);
		for (const [j, n] of cand)
			if (n === 3 && !seen.has(i * 1000 + j)) {
				seen.add(i * 1000 + j);
				E.push([i, j]);
			}
	}
	// The cell round 1: its vertices (the tetrahedra containing 1), its
	// faces (for each neighbour, the five round their shared edge, in cyclic
	// order), its neighbours, and which face is opposite which.
	const i1 = g.findIndex((q) => Math.abs(q[0] - 1) < 1e-9);
	const nb = adj[i1];
	const faces = nb.map((n) => {
		const F = byV[i1].filter((t) => T[t].includes(n));
		const cyc = [F[0]];
		while (cyc.length < F.length) {
			const last = T[cyc[cyc.length - 1]];
			cyc.push(
				F.find((t) => !cyc.includes(t) && T[t].filter((x) => last.includes(x)).length === 3)
			);
		}
		return cyc;
	});
	const opp = nb.map((n) => nb.findIndex((m) => Math.abs(dot4(g[m], conj(g[n])) - 1) < 1e-6));
	CELL = { g, adj, verts, E, i1, nb, faces, opp, cell1: byV[i1] };
	return CELL;
}

// ── torus ────────────────────────────────────────────────────────────────────
// The lens rides an offset from the swimmer: from far outside the cube, in
// through its +z face, to just behind and above; the swimmer swims −z,
// gathering pace. Both re-timed together by what the lens sees.
const T_OFF0 = [2.4, 1.5, 3.1];
const T_OFF1 = [0.55, 0.42, 0.84];
const T_OFF2 = [0.32, 0.24, 0.56];
const FAM = [PAL.cyan, PAL.pink, PAL.violet];
function torusSetup() {
	const path = bezierPath([T_OFF0, [1.9, 1.3, 1.5], [0.75, 0.6, 1.45], T_OFF1]);
	const swim = (s) => [0.08, 0.04, 0.15 - 3.4 * Math.pow(s, 2.3)];
	const state = (s) => {
		const S = swim(s);
		const O = s < 0.5 ? path.at(s / 0.5) : lerp3(T_OFF1, T_OFF2, smooth(span(s, 0.72, 1)));
		const L = add3(S, O);
		return { S, L, T: add3(S, [0, 0, -0.6]) };
	};
	const near = (L) => Math.max(0.35, Math.hypot(...L) - 0.6);
	const step = (a, b) =>
		Math.hypot(...sub3(a.L, b.L)) / near(a.L) +
		Math.hypot(...sub3(norm(sub3(a.T, a.L)), norm(sub3(b.T, b.L)))) +
		Math.hypot(...sub3(sub3(a.S, a.L), sub3(b.S, b.L))) / 0.6;
	return { at: retime(state, step) };
}

function torus(ctx, w, h, u, S) {
	const R = 0.42 * Math.min(w, h);
	const { S: sw, L, T } = S.at(u);
	const fov = 46;
	const cam = camera3({ pos: L, target: T, up: UP, fov, w, h });
	const pxu = pxPerUnit(h, fov);
	const ink = makeInk();
	const ref = 1.1;
	// The copies come in as the lens goes through the first wall.
	const inside = smooth(span(L[2], 1.25, 0.5));
	const fog = (p) => {
		const d = Math.hypot(...sub3(p, L));
		return (1 - smooth(span(d, 2.0, 3.9))) * smooth(span(d, 0.1, 0.42));
	};
	const c = L.map(Math.round);
	const chalkDim = PAL.chalk;

	// The lattice of copies: lines at the half-integers, in unit pieces.
	if (inside > 0) {
		for (let f = 0; f < 3; f++) {
			const a = (f + 1) % 3;
			const bb = (f + 2) % 3;
			for (let i = -3; i < 3; i++)
				for (let j = -3; j < 3; j++) {
					const p = [0, 0, 0];
					p[a] = c[a] + i + 0.5;
					p[bb] = c[bb] + j + 0.5;
					for (let k = -4; k < 3; k++) {
						const p0 = p.slice();
						const p1 = p.slice();
						p0[f] = c[f] + k + 0.5;
						p1[f] = c[f] + k + 1.5;
						const m = lerp3(p0, p1, 0.5);
						const al = 0.5 * fog(m) * inside;
						if (al < 0.02) continue;
						seg3(ink, cam, p0, p1, chalkDim, al, 1.3, ref, 1.7);
					}
				}
		}
		// The gluing marks on every copy's faces.
		for (let i = -2; i <= 2; i++)
			for (let j = -2; j <= 2; j++)
				for (let k = -3; k <= 2; k++) {
					const n = [c[0] + i, c[1] + j, c[2] + k];
					if (!i && !j && !k) continue;
					const al = 0.55 * fog(n) * inside;
					if (al < 0.03) continue;
					faceArrows(ink, cam, n, al, 1.1, ref, 1);
				}
	}
	// The cube itself, written on, and its arrows.
	const wr = span(u, 0.02, 0.16);
	for (let f = 0; f < 3; f++) {
		const a = (f + 1) % 3;
		const bb = (f + 2) % 3;
		const upto = span(wr, f / 3, (f + 1) / 3);
		if (upto <= 0) continue;
		for (const sa of [-0.5, 0.5])
			for (const sb of [-0.5, 0.5]) {
				const p0 = [0, 0, 0];
				const p1 = [0, 0, 0];
				p0[a] = p1[a] = sa;
				p0[bb] = p1[bb] = sb;
				p0[f] = -0.5;
				p1[f] = 0.5;
				seg3(ink, cam, p0, lerp3(p0, p1, upto), PAL.chalk, 0.95, 2.2, ref, 1.8);
			}
	}
	faceArrows(ink, cam, ORIGIN, 0.95, 2, ref, span(u, 0.12, 0.3));
	ink.flush(ctx);
	// The corners: grey nodes.
	for (let i = -3; i < 3; i++)
		for (let j = -3; j < 3; j++)
			for (let k = -4; k < 3; k++) {
				const p = [c[0] + i + 0.5, c[1] + j + 0.5, c[2] + k + 0.5];
				const own = Math.abs(p[0]) === 0.5 && Math.abs(p[1]) === 0.5 && Math.abs(p[2]) === 0.5;
				const al = own ? 0.9 * wr : 0.8 * fog(p) * inside;
				if (al < 0.03) continue;
				const q = cam.project(p);
				if (q[2] <= NEAR) continue;
				disc(ctx, q[0], q[1], Math.min(5.5, Math.max(1, (0.028 * pxu) / q[2])), {
					fill: PAL.node,
					alpha: al
				});
			}

	// The swimmer, in every cell: the spiral in a plane tilted off the way
	// it swims (−z), rolling slowly; far copies as a dot and a dash.
	const body = span(u, 0.04, 0.2);
	const e1 = [0, 0, -1];
	const roll = 0.55 * Math.sin(TAU * u * 0.45);
	const t0 = [-0.6, 0.8, 0];
	const e2 = add3(mul3(t0, Math.cos(roll)), mul3(cross(e1, t0), Math.sin(roll)));
	const phase = u * SECONDS * 1.6;
	const copies = [];
	for (let i = -2; i <= 2; i++)
		for (let j = -2; j <= 2; j++)
			for (let k = -4; k <= 2; k++) {
				const n = [c[0] + i, c[1] + j, c[2] + k];
				const own = !n[0] && !n[1] && !n[2];
				const pos = add3(sw, n);
				const al = own ? 1 : 0.95 * fog(pos) * inside;
				if (al < 0.03) continue;
				const z = cam.project(pos)[2];
				if (z <= NEAR) continue;
				copies.push({ pos, al, z, own });
			}
	copies.sort((a, b) => b.z - a.z);
	for (const cp of copies) {
		const place = ([x, y]) => add3(cp.pos, add3(mul3(e1, x), mul3(e2, y)));
		const px = (0.3 * pxu) / cp.z;
		if (px < 9) {
			const q = cam.project(cp.pos);
			disc(ctx, q[0], q[1], Math.max(1, px * 0.18), { fill: PAL.gold, alpha: cp.al });
			continue;
		}
		swimmer3(ctx, cam, place, {
			scale: 0.037,
			turn: Math.PI - 0.57,
			phase,
			width: 6,
			tip: 2,
			alpha: cp.al,
			body,
			ref,
			n: px < 50 ? 30 : 80,
			coil: px >= 50
		});
	}

	// The way on: the copy straight ahead — the swimmer itself, from behind.
	const g = span(u, 0.86, 1);
	if (inside > 0.5) {
		const H = add3(sw, [0, 0, -1]);
		const q = cam.project(H);
		if (q[2] > NEAR) portal(ctx, q[0], q[1], Math.max(2, (0.03 * pxu) / q[2]), g, R, wayOn(u));
	}

	const out = 1 - span(u, 0.9, 0.96);
	notes(ctx, w, h, [
		['T^{3} = ℝ^{3} / ℤ^{3}', span(u, 0.04, 0.12), out],
		['x ∼ x + 1,   y ∼ y + 1,   z ∼ z + 1', span(u, 0.16, 0.3), out],
		['the same room through every wall', span(u, 0.5, 0.62), out],
		['ahead of you: yourself, from behind', span(u, 0.72, 0.82), out]
	]);
}

// The gluing marks of cell n: an arrow on each face, the same on the face
// opposite (the gluing is a translation): along y on the x-faces (cyan),
// along z on the y-faces (pink), along x on the z-faces (violet).
function faceArrows(ink, cam, n, alpha, width, ref, upto) {
	for (let f = 0; f < 3; f++) {
		const d = [0, 0, 0];
		d[(f + 1) % 3] = 1;
		const e = [0, 0, 0];
		e[(f + 2) % 3] = 1;
		for (const s of [-0.5, 0.5]) {
			const c = n.slice();
			c[f] += s;
			arrow3(ink, cam, c, d, e, 0.34, FAM[f], alpha, width, ref, upto);
		}
	}
}

// ── dodeca ───────────────────────────────────────────────────────────────────
const PAIR = [PAL.cyan, PAL.pink, PAL.violet, PAL.green, PAL.blue, PAL.red];
const D_END = 0.42; // how far the lens flies on, radians of S³ (36° is the next centre)
const D_UNDER = 0.06; // how far under the lens's line the swimmer sits
function dodecaSetup() {
	const C = build120();
	const { g, verts, nb, faces, opp } = C;
	// The chart's frame at 1: forward toward the first neighbour's face,
	// up toward one of that face's vertices, so the pentagon ahead points up.
	const g1 = g[nb[0]];
	const fwd = norm4([0, g1[1], g1[2], g1[3]]);
	const v0 = verts[faces[0][0]];
	const up = perp4(v0, [1, 0, 0, 0], fwd);
	const right = perp4([0, 1, 0, 0], [1, 0, 0, 0], fwd, up);
	const rt =
		Math.abs(dot4(right, right) - 1) < 1e-6 ? right : perp4([0, 0, 1, 0], [1, 0, 0, 0], fwd, up);
	// The arrows: on the first of each face pair, from the face's centre
	// toward its first vertex with a head, in the pentagon's own plane; on
	// the opposite face its image under the gluing g_k⁻¹.
	const arrows = [];
	const done = new Set();
	nb.forEach((n, k) => {
		if (done.has(k)) return;
		done.add(k);
		done.add(opp[k]);
		const V = faces[k].map((t) => verts[t]);
		const M = norm4([0, 1, 2, 3].map((c) => V.reduce((s, p) => s + p[c], 0)));
		const ea = perp4(add4(V[0], mul4(M, -dot4(V[0], M))), M);
		const eb = perp4(add4(V[1], mul4(M, -dot4(V[1], M))), M, ea);
		const L = Math.acos(Math.min(1, dot4(V[0], M)));
		const pt = (a, b) => norm4(add4(M, add4(mul4(ea, a * L), mul4(eb, b * L))));
		const A = [pt(0.08, 0), pt(0.6, 0), pt(0.4, 0.14), pt(0.4, -0.14)];
		const color = PAIR[arrows.length / 2];
		arrows.push({ P: A, color });
		arrows.push({ P: A.map((p) => qm(conj(g[n]), p)), color });
	});
	// The cells to draw, by arc distance from 1, and the central cell's edges.
	const cells = g
		.map((q, i) => ({ i, d: Math.acos(Math.max(-1, Math.min(1, q[0]))) }))
		.filter((c) => c.d < 1.3);
	const own = new Set(C.cell1);
	const edges = C.E.map(([a, b]) => ({ a, b, own: own.has(a) && own.has(b) }));
	// The swimmer at 1, just under the lens's line: in a plane tilted off
	// the way the lens flies.
	const pole = expAt([1, 0, 0, 0], mul4(up, -D_UNDER));
	// Its "up" carried down to the pole along that geodesic; se2 is already
	// orthogonal to the plane the pole moved in.
	const se1 = add4(mul4([1, 0, 0, 0], Math.sin(D_UNDER)), mul4(up, Math.cos(D_UNDER)));
	const se2 = norm4(add4(mul4(rt, 0.72), mul4(fwd, 0.69)));
	const swimAt = (x, y) => expAt(pole, add4(mul4(se1, x), mul4(se2, y)));
	const near = (x) => Math.max(0.33, Math.hypot(...x) - 0.1);
	const path = flight([[1.15, 0.78, -1.25], [0.8, 0.55, -0.88], [0, 0, -0.8], ORIGIN], D_END, near);
	return { C, fwd, up, rt, arrows, cells, edges, pole, swimAt, path, g1 };
}

function dodeca(ctx, w, h, u, S) {
	const R = 0.42 * Math.min(w, h);
	const { C, fwd, up, rt, arrows, cells, edges, path, swimAt, g1 } = S;
	const { g, verts } = C;
	const { x: L, dir, theta } = path.at(u);
	const fov = 48;
	const cam = camera3({ pos: L, target: add3(L, dir), up: UP, fov, w, h });
	const pxu = pxPerUnit(h, fov);
	const ink = makeInk();
	const ref = 0.5;
	// The chart: gnomonic from the lens's point of S³, c = cos θ · 1 + sin θ · f.
	const one = [1, 0, 0, 0];
	const c = add4(mul4(one, Math.cos(theta)), mul4(fwd, Math.sin(theta)));
	const f = add4(mul4(one, -Math.sin(theta)), mul4(fwd, Math.cos(theta)));
	const chart = (q) => {
		const W = dot4(q, c);
		if (W < 0.12) return null;
		return [dot4(q, rt) / W, dot4(q, up) / W, dot4(q, f) / W];
	};
	const fog = (p) => 1 - smooth(span(Math.hypot(...p), 1.1, 2.3));
	// Written on from the centre out: the cell, then the ring, then beyond.
	const sweep = (d) => smooth(span(u, 0.03 + 0.34 * (d / 1.3), 0.12 + 0.34 * (d / 1.3)));

	// Every edge of the tiling within the chart, the central cell's bold.
	const wr = span(u, 0.02, 0.14);
	for (const e of edges) {
		const a = chart(verts[e.a]);
		const b = chart(verts[e.b]);
		if (!a || !b) continue;
		const m = lerp3(a, b, 0.5);
		if (e.own) {
			if (wr <= 0) continue;
			seg3(ink, cam, a, lerp3(a, b, wr), PAL.chalk, 0.95, 2.1, 0.9);
			continue;
		}
		const dm = Math.acos(Math.min(1, dot4(norm4(add4(verts[e.a], verts[e.b])), one)));
		const al = 0.45 * fog(m) * sweep(dm);
		seg3(ink, cam, a, b, PAL.chalk, al, 1.3, ref);
	}
	// The arrows, on every cell near enough: the one cell's, carried by g.
	const aw = span(u, 0.12, 0.3);
	for (const cell of cells) {
		if (cell.d > 0.7) continue;
		const G = g[cell.i];
		const al = cell.i === C.i1 ? 0.95 * aw : 0.6 * sweep(cell.d);
		if (al < 0.03) continue;
		for (const ar of arrows) {
			const P = ar.P.map((p) => chart(cell.i === C.i1 ? p : qm(G, p)));
			if (P.some((p) => !p)) continue;
			const k = cell.i === C.i1 ? 1 : fog(P[1]);
			if (k * al < 0.03) continue;
			const upto = cell.i === C.i1 ? aw : 1;
			seg3(ink, cam, P[0], lerp3(P[0], P[1], Math.min(1, upto * 1.3)), ar.color, al * k, 1.6, ref);
			if (upto > 0.75)
				for (const hd of [P[2], P[3]])
					seg3(ink, cam, P[1], lerp3(P[1], hd, span(upto, 0.75, 1)), ar.color, al * k, 1.6, ref);
		}
	}
	ink.flush(ctx);

	// The swimmer in every cell, far to near; the lit one ahead.
	const body = span(u, 0.04, 0.2);
	const phase = u * SECONDS * 1.6;
	const list = [];
	for (const cell of cells) {
		const G = g[cell.i];
		const p = chart(cell.i === C.i1 ? S.pole : qm(G, S.pole));
		if (!p) continue;
		const q = cam.project(p);
		if (q[2] <= NEAR) continue;
		const al = (cell.i === C.i1 ? 1 : 0.95 * fog(p)) * sweep(cell.d);
		if (al < 0.03) continue;
		list.push({ G, own: cell.i === C.i1, z: q[2], al, p });
	}
	list.sort((a, b) => b.z - a.z);
	for (const cp of list) {
		const place = ([x, y]) => {
			const q = swimAt(x, y);
			return chart(cp.own ? q : qm(cp.G, q)) ?? [Infinity, Infinity, Infinity];
		};
		const px = (0.2 * pxu) / cp.z;
		if (px < 8) {
			const q = cam.project(cp.p);
			disc(ctx, q[0], q[1], Math.max(1, px * 0.2), { fill: PAL.gold, alpha: cp.al });
			continue;
		}
		swimmer3(ctx, cam, place, {
			scale: 0.021,
			turn: Math.PI - 0.57,
			phase,
			width: 6,
			tip: 2,
			alpha: cp.al,
			body,
			ref,
			n: px < 40 ? 30 : 70,
			coil: px >= 40
		});
	}
	// The way on: the swimmer in the cell ahead.
	const gg = span(u, 0.86, 1);
	const H = chart(qm(g1, S.pole));
	if (H && theta > 0.01) {
		const q = cam.project(H);
		if (q[2] > NEAR) portal(ctx, q[0], q[1], Math.max(2, (0.016 * pxu) / q[2]), gg, R, wayOn(u));
	}

	const out = 1 - span(u, 0.9, 0.96);
	notes(ctx, w, h, [
		['S^{3} / 2I,   |2I| = 120', span(u, 0.04, 0.12), out],
		['opposite faces glued with a turn of 36°', span(u, 0.18, 0.3), out],
		['twelve neighbours: the one cell, turned', span(u, 0.4, 0.52), out]
	]);
}

// ── mirror ───────────────────────────────────────────────────────────────────
// The classic bottle, smoothly: u ∈ [0, π] along the tube, v round it; the
// ends glue by (π, v) ∼ (0, π − v). Centred on the board.
function kb(u, v) {
	const cu = Math.cos(u);
	const su = Math.sin(u);
	const cv = Math.cos(v);
	const sv = Math.sin(v);
	const c2 = cu * cu;
	const c4 = c2 * c2;
	const c6 = c4 * c2;
	const x = -(2 / 15) * cu * (3 * cv - 30 * su + 90 * c4 * su - 60 * c6 * su + 5 * cu * cv * su);
	const y =
		-(1 / 15) *
		su *
		(3 * cv -
			3 * c2 * cv -
			48 * c4 * cv +
			48 * c6 * cv -
			60 * su +
			5 * cu * cv * su -
			5 * c2 * cu * cv * su -
			80 * c4 * cu * cv * su +
			80 * c6 * cu * cv * su);
	const z = (2 / 15) * (3 + 5 * cu * su) * sv;
	return [x - 0.15, y - 2.1, z];
}
// The swimmer's frame at U along the loop v = π/2, carried round: past the
// seam the chart is (U − π, π/2) and ∂v comes back reversed.
function kbFrame(U) {
	const flip = U >= Math.PI ? -1 : 1;
	const uu = U >= Math.PI ? U - Math.PI : U;
	const v = Math.PI / 2;
	const hh = 1e-3;
	const p = kb(uu, v);
	const du = mul3(sub3(kb(uu + hh, v), kb(uu - hh, v)), 1 / (2 * hh));
	const dv = mul3(sub3(kb(uu, v + hh), kb(uu, v - hh)), flip / (2 * hh));
	const e1 = norm(du);
	const e2 = norm(sub3(dv, mul3(e1, dot(dv, e1))));
	return { p, e1, e2 };
}
const HOME = kb(0, Math.PI / 2);
function mirrorSetup() {
	const grid = [];
	for (let i = 0; i <= 40; i++) {
		const row = [];
		for (let j = 0; j <= 26; j++) row.push(kb((Math.PI * i) / 40, (TAU * j) / 26));
		grid.push(row);
	}
	const cyan = [];
	for (let j = 0; j < 10; j++) {
		const v = (TAU * j) / 10;
		const pts = [];
		for (let i = 0; i <= 80; i++) pts.push(kb((Math.PI * i) / 80, v));
		cyan.push(pts);
	}
	const pink = [];
	for (let i = 1; i < 14; i++) {
		const uu = (Math.PI * i) / 14;
		const pts = [];
		for (let j = 0; j <= 64; j++) pts.push(kb(uu, (TAU * j) / 64));
		pink.push(pts);
	}
	const seam = [];
	for (let j = 0; j <= 80; j++) seam.push(kb(0, (TAU * j) / 80));
	const trail = [];
	for (let i = 0; i <= 160; i++) trail.push(kb((Math.PI * i) / 160, Math.PI / 2));
	return { grid, cyan, pink, seam, trail };
}

function mirror(ctx, w, h, u, S, Z) {
	const R = 0.42 * Math.min(w, h);
	const fov = 44;
	const U = 1.45 * Math.PI * pace(span(u, 0.1, 1), 1);
	// The lens follows the swimmer round — across the bottle's front, where
	// the loop v = π/2 keeps (z > 0 all the way) — and holds its start once
	// it is back.
	const target = lerp3(ORIGIN, kbFrame(Math.min(U, Math.PI)).p, smooth(span(u, 0.3, 0.7)));
	const cam = orbit(w, h, {
		target,
		az: -0.9 + 1.7 * pace(u, 1.3),
		el: 0.5 - 0.24 * pace(u, 1.2),
		dist: Math.exp(lerp(Math.log(5.8), Math.log(2.3), pace(u, 1.5))),
		fov
	});
	const pxu = pxPerUnit(h, fov);
	const ref = 4.5;
	Z.reset(w, h);
	Z.grid(cam, S.grid);
	// The grid, written on; the seam in rose.
	const wr = span(u, 0.02, 0.24);
	const lw = (pts, o, upto) => {
		if (upto <= 0) return;
		const n = Math.max(2, Math.round(pts.length * upto));
		line3(ctx, cam, pts.slice(0, n), o, { depth: Z });
	};
	S.pink.forEach((pts) =>
		lw(pts, { color: PAL.pink, width: 1.6, alpha: 0.8, ref, hid: 0.3 }, span(wr, 0, 0.6))
	);
	S.cyan.forEach((pts) =>
		lw(pts, { color: PAL.cyan, width: 1.6, alpha: 0.8, ref, hid: 0.3 }, span(wr, 0.2, 1))
	);
	lw(S.seam, { color: PAL.rose, width: 2.6, alpha: 0.95, ref, hid: 0.4 }, span(wr, 0, 0.6));

	// The swimmer round the loop, its trail gold behind it.
	const body = span(u, 0.02, 0.14);
	const tr = Math.min(1, U / Math.PI);
	if (tr > 0.002)
		lw(S.trail, { color: PAL.gold, width: 1.6, alpha: 0.55, ref, hid: 0.35, glow: 6 }, tr);
	const phase = u * SECONDS * 1.6;
	const spermOn = (F, o) =>
		swimmer3(ctx, cam, ([x, y]) => add3(F.p, add3(mul3(F.e1, x), mul3(F.e2, y))), {
			scale: 0.068,
			turn: Math.PI - 0.57,
			phase,
			width: 6.5,
			tip: 2.2,
			ref,
			depth: Z,
			...o
		});
	// Its ghost at the start, once it has gone: where it set out, as it was.
	const ghost = smooth(span(U, 0.5, 1.2)) * 0.5;
	if (ghost > 0.02) spermOn(kbFrame(0), { alpha: ghost, dash: [4, 5], body: 1, wiggle: 0 });
	const F = kbFrame(U);
	spermOn(F, { alpha: 1, body });
	// The way on: at the seam's top, where it comes back a mirror image.
	const g = span(u, 0.86, 1);
	if (g > 0) {
		const q = cam.project(HOME);
		if (q[2] > NEAR) portal(ctx, q[0], q[1], Math.max(2, (0.03 * pxu) / q[2]), g, R, wayOn(u));
	}

	const out = 1 - span(u, 0.9, 0.96);
	notes(ctx, w, h, [
		['(π, v) ∼ (0, π − v):   a Klein bottle', span(u, 0.04, 0.16), out],
		['no inside, no outside', span(u, 0.3, 0.4), out],
		['once round, a left hand comes back a right', span(u, 0.72, 0.84), out]
	]);
}

// ── sphere ───────────────────────────────────────────────────────────────────
const S_END = 1.0; // how far the eye itself flies, radians
const D_FAR = 0.99 * Math.PI; // where the swimmer ends: nearly the far pole
function sphereSetup() {
	const C = build120();
	const nodes = C.g;
	// The eye at the centre of a tetrahedron of nodes; forward a generic way.
	const p0 = C.verts[0];
	const a = perp4([0.37, 0.81, -0.21, 0.4], p0);
	const rt = perp4([0, 0, 1, 0], p0, a);
	const up = perp4([0, 1, 0, 0], p0, a, rt);
	// Light: the great circle ahead (through the eye, straight) and three
	// others, through pairs of the nearest nodes (circles in the chart).
	const nearest = nodes
		.map((q, i) => [dot4(q, p0), i])
		.sort((x, y) => y[0] - x[0])
		.slice(0, 4)
		.map(([, i]) => i);
	const great = (A, B, n = 240) => {
		const Bp = perp4(B, A);
		const pts = [];
		for (let i = 0; i <= n; i++) {
			const t = (TAU * i) / n;
			pts.push(add4(mul4(A, Math.cos(t)), mul4(Bp, Math.sin(t))));
		}
		return pts;
	};
	const rays = [great(p0, a), great(p0, rt)];
	const circles = [
		great(nodes[nearest[0]], nodes[nearest[1]]),
		great(nodes[nearest[2]], nodes[nearest[3]]),
		great(nodes[nearest[0]], nodes[nearest[3]])
	];
	const near = (x) => Math.max(0.2, Math.hypot(...x) - 0.1);
	// The swimmer's distance ahead: held while the lens comes in, then away.
	const P = [[1.35, 0.95, -1.75], [0.95, 0.67, -1.22], [0, 0, -1.0], ORIGIN];
	const len = bezierPath(P).length;
	const split = len / (len + S_END);
	const dOf = (s) => 0.12 + (D_FAR - 0.12) * pace(span(s, split, 1), 2.4);
	const path = flight(P, S_END, near, (x, y) => 1.4 * Math.abs(dOf(x.s) - dOf(y.s)));
	return { nodes, p0, a, rt, up, rays, circles, path, dOf };
}

function sphere(ctx, w, h, u, S) {
	const R = 0.42 * Math.min(w, h);
	const { nodes, p0, a, rt, up, rays, circles, path } = S;
	const { x: L, dir, theta, s } = path.at(u);
	const fov = 50;
	const cam = camera3({ pos: L, target: add3(L, dir), up: UP, fov, w, h });
	const pxu = pxPerUnit(h, fov);
	// The chart: stereographic from the eye's antipode, the eye at the
	// origin: c = cos θ p₀ + sin θ a, forward f.
	const c = add4(mul4(p0, Math.cos(theta)), mul4(a, Math.sin(theta)));
	const f = add4(mul4(p0, -Math.sin(theta)), mul4(a, Math.cos(theta)));
	const chart = (q) => {
		const W = dot4(q, c);
		if (W < -0.999999) return [Infinity, Infinity, Infinity];
		const k = 1 / (1 + W);
		return [dot4(q, rt) * k, dot4(q, up) * k, dot4(q, f) * k];
	};
	const flying = smooth(span(theta, 0, 0.12));

	// The equator: 90° from you in every direction, the unit sphere here.
	const eq = span(u, 0.06, 0.2) * (1 - 0.75 * flying);
	if (eq > 0) {
		limb(ctx, cam, eq * 0.8, ORIGIN, 1, PAL.rose);
		const [e1, e2] = axesOf([0, 1, 0]);
		line3(ctx, cam, circle3(ORIGIN, e1, e2, 1, 120), {
			color: PAL.rose,
			width: 1.2,
			alpha: 0.45 * eq
		});
		const [f1, f2] = axesOf([1, 0, 0]);
		line3(ctx, cam, circle3(ORIGIN, f1, f2, 1, 120), {
			color: PAL.rose,
			width: 1.2,
			alpha: 0.35 * eq
		});
	}
	// Light: the rays through you, and the circles that are great circles.
	const lr = span(u, 0.14, 0.3);
	const cut = (pts, k) => pts.slice(0, Math.max(2, Math.round(pts.length * k)));
	for (const ray of rays)
		if (lr > 0)
			line3(
				ctx,
				cam,
				cut(ray, lr).map(chart),
				{ color: PAL.chalk, width: 1.3, alpha: 0.5 },
				{
					fade: (p) => 1 - smooth(span(Math.hypot(...p), 5, 9))
				}
			);
	const lc = span(u, 0.22, 0.4);
	circles.forEach((cc, i) =>
		lc > 0
			? line3(ctx, cam, cut(cc, lc).map(chart), {
					color: i === 1 ? PAL.pink : PAL.cyan,
					width: 1.5,
					alpha: 0.7
				})
			: null
	);
	// The nodes, conformal: a node's chart size is ε (1 + |x|²) / 2.
	const nw = span(u, 0.02, 0.2);
	for (const q of nodes) {
		const p = chart(q);
		if (!Number.isFinite(p[0])) continue;
		const r2 = dot(p, p);
		if (r2 > 60) continue;
		const sc = cam.project(p);
		if (sc[2] <= NEAR) continue;
		const rr = (0.012 * (1 + r2) * 0.5 * pxu) / sc[2];
		disc(ctx, sc[0], sc[1], Math.min(34, Math.max(1.1, rr)), { fill: PAL.node, alpha: 0.85 * nw });
	}

	// The swimmer, d ahead down the great circle: its spiral in a plane
	// tilted off the line of sight, laid into S³ by the exponential map.
	const d = S.dOf(s);
	const ph = theta + d;
	const pole = add4(mul4(p0, Math.cos(ph)), mul4(a, Math.sin(ph)));
	const fp = add4(mul4(p0, -Math.sin(ph)), mul4(a, Math.cos(ph)));
	const be = 0.85;
	const e2 = add4(mul4(rt, Math.cos(be)), mul4(fp, Math.sin(be)));
	const place = ([x, y]) => chart(expAt(pole, add4(mul4(up, x), mul4(e2, y))));
	const body = span(u, 0.02, 0.14);
	// Its line's width goes as its size does: a thickness τ of arc is drawn
	// at its chart size τ (1 + |x|²)/2 over its depth — which from the eye
	// is τ / sin d, so it thickens again past the equator.
	const pc = chart(pole);
	const qp = cam.project(pc);
	const conf = (1 + dot(pc, pc)) / 2;
	const wd = Math.max(1.4, Math.min(60, (0.0008 * conf * pxu) / Math.max(qp[2], NEAR)));
	const q = swimmer3(ctx, cam, place, {
		scale: 0.013,
		turn: Math.PI - 0.57,
		phase: u * SECONDS * 1.6,
		width: wd,
		tip: wd * 0.34,
		body,
		n: 110
	});
	// The way on: its head, dead ahead, grown by the far pole's own law.
	const g = span(u, 0.86, 1);
	if (q && qp[2] > NEAR)
		portal(
			ctx,
			q[0],
			q[1],
			Math.max(2, Math.min(R * 0.4, (0.006 * conf * pxu) / qp[2])),
			g,
			R,
			wayOn(u)
		);

	const out = 1 - span(u, 0.9, 0.96);
	notes(ctx, w, h, [
		['S^{3}:   walk far enough and you come home', span(u, 0.04, 0.16), out],
		[
			'the chart from where you stand:  lines through you,  circles elsewhere',
			span(u, 0.22, 0.38),
			out
		],
		['past the equator, what recedes grows again', span(u, 0.62, 0.74), out]
	]);
}
