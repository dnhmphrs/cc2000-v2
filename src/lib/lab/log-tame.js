import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	math,
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag,
	camera3
} from './log/board.js';
import { lit, glow } from './log/ink.js';
import { drawHelix, poseOn } from './log/helix.js';

// ── Sketch: log-tame — tame geometry ─────────────────────────────────────────
// O-minimality: a structure on the real line in which every definable set in
// one variable is a FINITE union of points and intervals. That one axiom
// propagates up through the dimensions as the cell decomposition theorem —
// every definable set in the plane is a finite union of cells, each a graph
// or a band between graphs over an interval, with vertical cuts at finitely
// many x's — so nothing definable can oscillate, accumulate or wind forever:
// geometry with no pathology, finitely many pieces at every scale. The real
// field with exp (Wilkie), with all restricted analytic functions, with the
// j-invariant on its fundamental domain, are all o-minimal; the whole sine,
// the whole logarithmic spiral and the whole modular tessellation are not.
// Four one-offs on it, in ink, each a pure function of its progress (?at=
// pins any frame), eleven seconds each. One per ?v=:
//
//   cells    (default) cylindrical cell decomposition, exact. The set A =
//            {c < y < f(x)} with f(x) = e^{−(x−m)²} + e^{−(x+m)²} (m = 1.25,
//            c = 0.62, definable in ℝ_exp): two humps over a line, the line
//            cutting them at four points. The decomposition of the plane
//            compatible with A: the x-axis cut at the four crossings (found
//            by bisection) into five intervals and four points; over each
//            interval the two graphs (line and curve) and the three bands
//            between and beyond them, over each point the point and its two
//            vertical half-lines — 37 cells, counted off one by one, columns
//            left to right, bottom to top, the set's own two bands hatched.
//            Then the swimmer crosses on a cubic Bézier (a polynomial, so
//            definable): every cell boundary it crosses is lit as it goes,
//            and there are finitely many. The lens closes on a crossing
//            point: at every zoom the picture there is one point and four
//            pieces. (The logarithmic spiral, the one curve of this project
//            that is NOT tame as a whole — it meets a line infinitely often —
//            is left out: it does not read without text.)
//   height   Pila–Wilkie, exact. The curve y = 2^x and the rational points
//            of height ≤ H — (a/b, c/d) in lowest terms with |a|, b, |c|, d
//            ≤ H — in the window, H counting up from 1 to 12 over the beat.
//            The points are the product of two Farey sets, every one of them
//            drawn, bucketed by height, each dot's weight falling with it. The
//            rational points ON the curve are exactly (n, 2^n), n ∈ ℤ (2^{p/q}
//            is irrational for q ≥ 2, by unique factorisation), lit gold as H
//            reaches their height: five in the window by H = 4, and no more
//            ever — about 2 log₂ H of height ≤ H against ~H⁴ in the window.
//            Pila–Wilkie says every transcendental definable curve is like
//            this, O(H^ε). One line of text: the current H.
//   exp      the exponential field, exact. The strip 0 ≤ Im z < 2π with its
//            grid (Re z = const, Im z = const), the lattice Λ = ℤω + 2πiℤ
//            (ω = −1.2 + 0.9i) with its fundamental parallelogram, carried
//            by the morph z ↦ (e^{tz} − 1)/t, t from 0 (the identity) to 1
//            (e^z − 1): the vertical lines become the rings and the horizontal
//            lines the rays of the log map's net about the puncture at −1/t,
//            the strip's top edge sweeps round and lands on its floor at
//            t = 1 — the strip onto the punctured plane — and the lattice
//            points that differ by 2πi stack: Λ lands on q^n − 1 (q = e^ω), a
//            discrete logarithmic spiral into the puncture, lit, and the
//            parallelogram on the annulus |q| ≤ |w + 1| ≤ 1 cut along one arc
//            of that spiral, its two circles glued by w + 1 ↦ q(w + 1): the
//            torus ℂ/Λ = ℂ*/q^ℤ. The lens then zooms into the puncture, where the rings
//            and the lit points come up out of it forever: a zoom in the
//            w-plane is a translation of the strip.
//   special  André–Oort. The upper half-plane: the fundamental domain
//            F = {|z| ≥ 1, |Re z| ≤ ½} of SL₂(ℤ) in bold ink and its
//            translates γF (every γ = (a b; c d) with c ≤ 60, |d| ≤ 120 over
//            the window, down to 1/8000 of F's size; each cell's three sides true geodesics — vertical lines and
//            semicircles on ℝ — through γρ, γ(ρ + 1) and the cusp a/c, so the
//            tessellation is exact as far as it is drawn), written on from F
//            outward by size. The special points: the CM points, z with
//            az² + bz + c = 0, drawn from the primitive reduced forms of
//            discriminant D = b² − 4ac, −60 ≤ D < 0, in F and carried into
//            every cell by its γ — the vertices (ρ, D = −3) and the edge
//            midpoints (i, D = −4) the brightest, (−1 ± i√7)/2 and its
//            translates (D = −7) next, the stars coming up by |D|. Through
//            the domain the geodesic Re z = 0, which holds i√n for every n
//            (D = −4n) and, below i, their images i/√n under z ↦ −1/z:
//            infinitely many special points on one curve, lit along it. The
//            lens dives down it to the cusp at 0, where the stars and the
//            cells pile up without end — the part of the picture that is
//            NOT tame, which Pila's proof never enters: j is definable (in
//            ℝ_an,exp) on F, and the counting is done there. (André–Oort
//            proper is a statement about Y(1)×Y(1) and the modular curves;
//            the geodesic is the picture of it in one copy of H.)
//
// Ink only: chalk lines, gold for the lit points. Frame cost under ~25 ms
// headless at 1280 × 800 (special's tessellation the heaviest).

const SECONDS = 11;
// Progress at rest at 0 that only gathers pace, cosh-shaped by k.
const pace = (u, k) => (Math.cosh(k * clamp01(u)) - 1) / (Math.cosh(k) - 1);
const SQ3 = Math.sqrt(3);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export default async function make({ at }) {
	const v = variant(['cells', 'height', 'exp', 'special']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const S = { cells: cellsSetup, height: heightSetup, exp: expSetup, special: specialSetup }[v]();
	const draw = { cells, height, exp, special }[v];

	// The frame's cost, averaged over thirty, for the cost probe.
	const info = { seconds: SECONDS, variant: v, frameMs: 0 };
	let frames = 0;
	let ms = 0;
	function render() {
		const t0 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, S, b);
		tag(ctx, w, h, `log-tame · ${v}`);
		ms += performance.now() - t0;
		if (++frames === 30) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs;
			frames = 0;
			ms = 0;
		}
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Polylines batched by colour, alpha and width, so a tessellation of a few
// thousand arcs is a handful of strokes.
function makeInk() {
	const B = new Map();
	return {
		line(P, { alpha = 1, width = 1, color = PAL.chalk, dash = null } = {}) {
			if (alpha < 0.012 || P.length < 2) return;
			const a = Math.min(16, Math.round(alpha * 16));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}|${dash ? dash.join() : ''}`;
			let k = B.get(key);
			if (!k) {
				k = { color, alpha: a / 16, width: wq / 4, dash, P: [] };
				B.set(key, k);
			}
			k.P.push(P);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const k of B.values()) {
				ctx.strokeStyle = k.color;
				ctx.globalAlpha = k.alpha;
				ctx.lineWidth = k.width;
				ctx.setLineDash(k.dash ?? []);
				ctx.beginPath();
				for (const P of k.P) {
					ctx.moveTo(P[0][0], P[0][1]);
					for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// The roots of g on [a, b]: a sign change over n samples, refined by bisection.
function roots(g, a, b, n = 2000) {
	const out = [];
	let x0 = a;
	let g0 = g(a);
	for (let i = 1; i <= n; i++) {
		const x1 = a + ((b - a) * i) / n;
		const g1 = g(x1);
		if (g0 === 0) out.push(x0);
		else if (g0 * g1 < 0) {
			let lo = x0;
			let hi = x1;
			let glo = g0;
			for (let k = 0; k < 60; k++) {
				const mid = (lo + hi) / 2;
				const gm = g(mid);
				if (gm === 0) {
					lo = hi = mid;
					break;
				}
				if (glo * gm < 0) hi = mid;
				else {
					lo = mid;
					glo = gm;
				}
			}
			out.push((lo + hi) / 2);
		}
		x0 = x1;
		g0 = g1;
	}
	return out;
}

// An orthographic lens down z on a 2D view, for the helix: the same pixels.
function camOf(view, w, h) {
	const ox = (w / 2 - view.cx) / view.scale;
	const oy = (view.cy - h / 2) / view.scale;
	return camera3({
		pos: [ox, oy, 10],
		target: [ox, oy, 0],
		up: [0, 1, 0],
		w,
		h,
		ortho: h / (2 * view.scale)
	});
}

// The way on: a gold disc with a cream core and a bloom, g 0..1 how far up.
function portal(ctx, x, y, r, g) {
	if (r <= 0) return;
	glow(ctx, x, y, r * (2.2 + 1.6 * g), [255, 214, 140], 0.28 + 0.22 * g);
	disc(ctx, x, y, r, { fill: PAL.gold, alpha: 0.97 });
	disc(ctx, x, y, r * 0.58, { fill: '#fff6e0', alpha: lerp(0.5, 1, g) });
}

// ── cells: the cylindrical decomposition ─────────────────────────────────────
const CELL = { m: 1.25, c: 0.62, X: 3.3 };
const fCell = (x) => Math.exp(-((x - CELL.m) ** 2)) + Math.exp(-((x + CELL.m) ** 2));
// The swimmer's path: a cubic Bézier, a polynomial curve.
const BEZ = [
	[-3.7, 0.12],
	[-1.7, 1.95],
	[1.4, -0.75],
	[3.7, 1.3]
];
function bez(t) {
	const s = 1 - t;
	const a = s * s * s;
	const b = 3 * s * s * t;
	const c = 3 * s * t * t;
	const d = t * t * t;
	return [0, 1].map((i) => a * BEZ[0][i] + b * BEZ[1][i] + c * BEZ[2][i] + d * BEZ[3][i]);
}
const T0 = 0.24; // the count starts
const DT = 0.0085; // a cell

function cellsSetup() {
	const xs = roots((x) => fCell(x) - CELL.c, -CELL.X, CELL.X);
	// The cells, in counting order: columns left to right, bottom to top.
	const list = [];
	const ends = [-Infinity, ...xs, Infinity];
	for (let i = 0; i < ends.length - 1; i++) {
		const a = ends[i];
		const b = ends[i + 1];
		const mid =
			Number.isFinite(a) && Number.isFinite(b) ? (a + b) / 2 : Number.isFinite(a) ? a + 1 : b - 1;
		const above = fCell(mid) > CELL.c; // the curve over the line here
		const lo = above ? 'line' : 'curve';
		const hi = above ? 'curve' : 'line';
		list.push({ kind: 'band', a, b, lo: null, hi: lo });
		list.push({ kind: 'graph', a, b, g: lo });
		list.push({ kind: 'band', a, b, lo, hi, inA: above });
		list.push({ kind: 'graph', a, b, g: hi });
		list.push({ kind: 'band', a, b, lo: hi, hi: null });
		if (i < xs.length) {
			list.push({ kind: 'half', x: xs[i], up: false });
			list.push({ kind: 'point', x: xs[i] });
			list.push({ kind: 'half', x: xs[i], up: true });
		}
	}
	list.forEach((c, k) => (c.t = T0 + k * DT));
	// The path by arc length, and where it crosses a cell boundary.
	const N = 600;
	const L = [0];
	let prev = bez(0);
	for (let i = 1; i <= N; i++) {
		const p = bez(i / N);
		L.push(L[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
		prev = p;
	}
	const tOf = (s) => {
		const want = clamp01(s) * L[N];
		let j = 0;
		while (j < N - 1 && L[j + 1] < want) j++;
		const seg = L[j + 1] - L[j];
		return (j + (seg > 0 ? (want - L[j]) / seg : 0)) / N;
	};
	const path = (s) => bez(tOf(s));
	const cross = [];
	const add = (ts) => ts.forEach((t) => cross.push({ s: L[Math.round(t * N)] / L[N], p: bez(t) }));
	add(roots((t) => bez(t)[1] - CELL.c, 0, 1));
	add(
		roots(
			(t) => {
				const [x, y] = bez(t);
				return y - fCell(x);
			},
			0,
			1
		)
	);
	for (const x of xs) add(roots((t) => bez(t)[0] - x, 0, 1));
	cross.sort((p, q) => p.s - q.s);
	return { xs, list, path, cross, ink: makeInk() };
}

function cells(ctx, w, h, u, S) {
	const { xs, list, path, cross, ink } = S;
	const K0 = Math.min((w - 40) / (2 * CELL.X), h / 2.4);
	const zoom = pace(span(u, 0.8, 1), 2.4);
	const K = K0 * Math.exp(3.4 * zoom);
	const P = [xs[1], CELL.c]; // the crossing the lens closes on
	const cm = smooth(span(u, 0.76, 0.92));
	const cx = lerp(0, P[0], cm);
	const cy = lerp(0.55, P[1], cm);
	const view = makeView({ w, h, scale: K, cx: w / 2 - K * cx, cy: h / 2 + K * cy });
	const xl = view.from([0, 0])[0];
	const xr = view.from([w, 0])[0];
	const gOf = (g) => (g === 'line' ? () => CELL.c : fCell);
	// A graph over [a, b] as screen points, clipped to the view.
	const graphPts = (g, a, b, n = 64) => {
		const x0 = Math.max(a, xl - 0.05);
		const x1 = Math.min(b, xr + 0.05);
		if (x1 <= x0) return null;
		const f = gOf(g);
		const pts = [];
		for (let i = 0; i <= n; i++) {
			const x = lerp(x0, x1, i / n);
			pts.push(view.to([x, f(x)]));
		}
		return pts;
	};
	const flashOf = (t) => span(u, t, t + 0.004) * (1 - span(u, t + 0.004, t + 0.06));
	const onOf = (t) => span(u, t, t + 0.03);

	// The bands: a faint wash once counted, a flash as they are, the set's
	// own two hatched.
	for (const c of list) {
		if (c.kind !== 'band') continue;
		const on = Math.max(onOf(c.t), c.inA ? smooth(span(u, 0.1, 0.18)) : 0);
		if (on <= 0) continue;
		const fl = flashOf(c.t);
		const top = c.hi ? graphPts(c.hi, c.a, c.b, 40) : null;
		const bot = c.lo ? graphPts(c.lo, c.a, c.b, 40) : null;
		if ((c.hi && !top) || (c.lo && !bot)) continue;
		const xa = view.to([Math.max(c.a, xl - 0.05), 0])[0];
		const xb = view.to([Math.min(c.b, xr + 0.05), 0])[0];
		const poly = [];
		if (bot) poly.push(...bot);
		else poly.push([xa, h + 20], [xb, h + 20]);
		if (top) for (let i = top.length - 1; i >= 0; i--) poly.push(top[i]);
		else poly.push([xb, -20], [xa, -20]);
		ctx.save();
		ctx.beginPath();
		poly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
		ctx.closePath();
		ctx.fillStyle = PAL.chalk;
		ctx.globalAlpha = 0.035 * onOf(c.t) + 0.1 * fl;
		ctx.fill();
		if (c.inA) {
			// hatched, at 45°, in screen space
			const ha = 0.5 * on;
			ctx.clip();
			ctx.globalAlpha = ha;
			ctx.strokeStyle = PAL.chalk;
			ctx.lineWidth = 0.9;
			ctx.beginPath();
			const step = 11;
			const x0 = Math.max(0, xa - h);
			const x1 = Math.min(w, xb);
			for (let x = x0; x <= x1 + h; x += step) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x - h, h);
			}
			ctx.stroke();
		}
		ctx.restore();
	}

	// The line and the curve, written on; then each graph piece flashes as
	// it is counted.
	const lineP = graphPts('line', -Infinity, Infinity, 8);
	if (lineP) stroke(ctx, lineP, { width: 1.8, alpha: 0.85, upto: span(u, 0, 0.08) });
	const curveP = graphPts('curve', -Infinity, Infinity, 220);
	if (curveP) stroke(ctx, curveP, { width: 2.2, alpha: 0.95, upto: span(u, 0.02, 0.16) });
	for (const c of list) {
		if (c.kind !== 'graph') continue;
		const fl = flashOf(c.t);
		if (fl <= 0) continue;
		const pts = graphPts(c.g, c.a, c.b, 48);
		if (pts) stroke(ctx, pts, { width: 4, alpha: 0.9 * fl, glow: 10 });
	}

	// The critical x's: the point lit, the vertical lines out of it.
	xs.forEach((x, i) => {
		const t = 0.16 + 0.018 * i;
		const p = smooth(span(u, t, t + 0.06));
		if (p <= 0) return;
		const q = view.to([x, CELL.c]);
		if (q[0] < -10 || q[0] > w + 10) return;
		const up = list.find((c) => c.kind === 'half' && c.x === x && c.up);
		const dn = list.find((c) => c.kind === 'half' && c.x === x && !c.up);
		const fu = flashOf(up.t);
		const fd = flashOf(dn.t);
		ink.line([q, [q[0], lerp(q[1], -10, p)]], { alpha: 0.5 + 0.5 * fu, width: 1.2 + 2.2 * fu });
		ink.line([q, [q[0], lerp(q[1], h + 10, p)]], { alpha: 0.5 + 0.5 * fd, width: 1.2 + 2.2 * fd });
	});
	ink.flush(ctx);
	xs.forEach((x, i) => {
		const t = 0.16 + 0.018 * i;
		const a = span(u, t, t + 0.03);
		if (a <= 0) return;
		const q = view.to([x, CELL.c]);
		const pt = list.find((c) => c.kind === 'point' && c.x === x);
		const fl = flashOf(pt.t) + (1 - span(u, t, t + 0.12));
		disc(ctx, q[0], q[1], Math.min(5, 3.2 * Math.sqrt(K / K0)), { fill: PAL.chalk, alpha: a });
		if (fl > 0) lit(ctx, q[0], q[1], 4.5, Math.min(1, fl));
	});

	// The swimmer across the cells: its trail, the crossings lit as it
	// passes them, the helix at its head.
	const s = pace(span(u, 0.5, 0.86), 1.3);
	if (s > 0) {
		const n = Math.max(2, Math.round(s * 180));
		const trail = [];
		for (let i = 0; i <= n; i++) trail.push(view.to(path((s * i) / n)));
		stroke(ctx, trail, { width: 1, alpha: 0.35, dash: [4, 5] });
		for (const c of cross) {
			if (c.s > s) break;
			const q = view.to(c.p);
			const k = (s - c.s) * 12;
			lit(ctx, q[0], q[1], 3.6, 0.9);
			if (k < 1) glow(ctx, q[0], q[1], 40 * (1 - k) + 10, [255, 214, 140], 0.7 * (1 - k));
		}
		if (s < 0.999) {
			const cam = camOf(view, w, h);
			const p3 = (t) => {
				const p = path(t);
				return [p[0], p[1], 0];
			};
			const pose = poseOn(p3, s, u * 26, 0.13, 0.0015);
			drawHelix(ctx, cam, pose, { alpha: 1, width: 2.4, core: 0.9, glow: 0.3 });
		}
	}

	// The way on: the crossing point the lens closes on.
	if (zoom > 0) {
		const q = view.to(P);
		portal(ctx, q[0], q[1], lerp(4, h / 7, smooth(zoom)), smooth(zoom));
	}
}

// ── height: Pila–Wilkie ──────────────────────────────────────────────────────
const HT = { H: 12, x0: -2.45, x1: 2.45, y0: 0, y1: 5.3 };
// The rationals in [lo, hi] of height ≤ H: a/b in lowest terms, |a|, b ≤ H.
function fareyIn(lo, hi, H) {
	const out = [];
	for (let b = 1; b <= H; b++)
		for (let a = Math.ceil(lo * b); a <= Math.floor(hi * b); a++) {
			if (Math.abs(a) > H || gcd(b, Math.abs(a)) !== 1) continue;
			out.push({ v: a / b, h: Math.max(Math.abs(a), b) });
		}
	return out;
}
function heightSetup() {
	const X = fareyIn(HT.x0, HT.x1, HT.H);
	const Y = fareyIn(HT.y0, HT.y1, HT.H);
	// Every point (a/b, c/d) of the window, bucketed by its height
	// max(|a|, b, |c|, d): level k holds the points of height exactly k.
	const levels = [];
	for (let k = 0; k <= HT.H; k++) levels.push([]);
	for (const px of X) for (const py of Y) levels[Math.max(px.h, py.h)].push(px.v, py.v);
	// The rational points on y = 2^x: (n, 2^n), height 2^|n|.
	const on = [];
	for (let n = -2; n <= 2; n++) on.push({ x: n, y: 2 ** n, h: 2 ** Math.abs(n) });
	return { levels, on, count: X.length * Y.length };
}
const weight = (k) => 0.95 / Math.pow(k, 0.3);

function height(ctx, w, h, u, S) {
	const { levels, on } = S;
	const Hf = 1 + (HT.H - 1) * span(u, 0.02, 0.86);
	const H = Math.floor(Hf + 1e-9);
	const zoom = pace(span(u, 0.84, 1), 2);
	const Z = Math.exp(0.5 * zoom);
	const Kx = ((w - 90) / (HT.x1 - HT.x0)) * Z;
	const Ky = ((h - 70) / (HT.y1 - HT.y0)) * Z;
	const oy = lerp((HT.y0 + HT.y1) / 2, 1, smooth(zoom));
	const sx = (x) => w / 2 + Kx * x;
	const sy = (y) => h / 2 - Ky * (y - oy);

	// The points of height ≤ H, one fill a level: dots for the lowest
	// heights, specks of falling weight and size above, the level coming in
	// faded by how far H has reached it.
	const dust = 1 - 0.3 * span(u, 0.86, 1);
	ctx.save();
	ctx.fillStyle = PAL.chalk;
	for (let k = 1; k <= Math.min(HT.H, H + 1); k++) {
		const a = weight(k) * span(Hf, k - 1, k) * dust;
		if (a <= 0.005) continue;
		const L = levels[k];
		const r = Math.max(0.7, 1.9 - 0.12 * k);
		ctx.globalAlpha = a;
		ctx.beginPath();
		for (let i = 0; i < L.length; i += 2) {
			const x = sx(L[i]);
			const y = sy(L[i + 1]);
			if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;
			if (k <= 3) {
				ctx.moveTo(x + r, y);
				ctx.arc(x, y, r, 0, TAU);
			} else ctx.rect(x - r, y - r, 2 * r, 2 * r);
		}
		ctx.fill();
	}
	ctx.restore();

	// The curve, written on.
	const pts = [];
	for (let i = 0; i <= 160; i++) {
		const x = lerp(HT.x0, HT.x1, i / 160);
		pts.push([sx(x), sy(2 ** x)]);
	}
	stroke(ctx, pts, { width: 2, alpha: 0.92, upto: span(u, 0, 0.12) });

	// The points on it, lit as H reaches them.
	for (const p of on) {
		const a = span(Hf, p.h - 0.5, p.h);
		if (a <= 0) continue;
		const fl = 1 - span(Hf, p.h, p.h + 0.8);
		lit(ctx, sx(p.x), sy(p.y), 4 + 2 * fl, a);
	}
	// One line: H.
	math(ctx, `H = ${H}`, Math.max(28, w * 0.05), Math.max(40, h * 0.08), {
		size: 24,
		alpha: 0.8 * span(u, 0.02, 0.06)
	});
	// The way on: (0, 1).
	if (zoom > 0) portal(ctx, sx(0), sy(1), lerp(4, h / 8, smooth(zoom)), smooth(zoom));
}

// ── exp: the strip onto the punctured plane ──────────────────────────────────
const EXP = { w1: [-1.2, 0.9], L: -6, R: 1.6 };
// z ↦ (e^{tz} − 1)/t: the identity at t = 0, e^z − 1 at t = 1.
function morph(x, y, t) {
	if (t < 1e-4) return [x, y];
	const r = Math.exp(t * x);
	return [(r * Math.cos(t * y) - 1) / t, (r * Math.sin(t * y)) / t];
}
function expSetup() {
	const { w1 } = EXP;
	// Λ = ℤω + 2πiℤ, the points near the strip; inside it bright.
	const lat = [];
	for (let n = -3; n <= 9; n++)
		for (let m = -3; m <= 4; m++) {
			const x = n * w1[0];
			const y = n * w1[1] + m * TAU;
			if (x < EXP.L - 0.3 || x > EXP.R + 0.3 || y < -7 || y > 14) continue;
			lat.push({ x, y, n, inside: y >= 0 && y < TAU });
		}
	return { lat, ink: makeInk() };
}

function exp(ctx, w, h, u, S) {
	const { lat, ink } = S;
	const { w1, L, R } = EXP;
	const t = pace(span(u, 0.08, 0.68), 1.8);
	const zoom = pace(span(u, 0.72, 1), 2.4);
	const K0 = (0.62 * h) / TAU;
	const K = K0 * Math.exp(3.3 * zoom);
	const cx = lerp(-1.3, -1, smooth(span(u, 0.68, 0.84)));
	const cy = Math.PI * (1 - t);
	const view = makeView({ w, h, scale: K, cx: w / 2 - K * cx, cy: h / 2 + K * cy });
	const M = (x, y) => view.to(morph(x, y, t));
	const on = span(u, 0, 0.1);

	// The rays: Im z = kπ/6, the floor solid, the open edge dashed.
	for (let k = 0; k <= 12; k++) {
		const y = (k * Math.PI) / 6;
		const p = span(on, k / 14, k / 14 + 0.3);
		if (p <= 0) continue;
		const pts = [];
		const n = 72;
		for (let i = 0; i <= n; i++) pts.push(M(lerp(L, R, i / n), y));
		const edge = k === 0 || k === 12;
		ink.line(pts, {
			alpha: (edge ? 0.8 : 0.38) * p,
			width: edge ? 1.5 : 0.9,
			dash: k === 12 && t < 0.999 ? [6, 6] : null
		});
	}
	// The rings: Re z = c, fainter off to the left, and not until they are
	// a few pixels across in the w-plane.
	for (let c = L; c <= R + 1e-9; c += 0.5) {
		const rpx = t > 0.02 ? (K * Math.exp(t * c)) / t : Infinity;
		const size = smooth(span(rpx, 1.5, 8));
		const p = span(on, 0.2 + ((R - c) / (R - L)) * 0.5, 0.5 + ((R - c) / (R - L)) * 0.5);
		const a = 0.42 * (1 - 0.55 * span(-c, 3, 6)) * size * p;
		if (a <= 0.01) continue;
		const pts = [];
		const n = 80;
		for (let i = 0; i <= n; i++) pts.push(M(c, (TAU * i) / n));
		ink.line(pts, { alpha: a, width: 0.9 });
	}
	// The fundamental parallelogram of Λ: 0, ω, ω + 2πi, 2πi.
	const pp = smooth(span(u, 0.04, 0.12));
	if (pp > 0) {
		const V = [[0, 0], w1, [w1[0], w1[1] + TAU], [0, TAU], [0, 0]];
		const pts = [];
		for (let e = 0; e < 4; e++)
			for (let i = 0; i <= 40; i++) {
				const s = i / 40;
				pts.push(M(lerp(V[e][0], V[e + 1][0], s), lerp(V[e][1], V[e + 1][1], s)));
			}
		stroke(ctx, pts, { width: 1.7, alpha: 0.85, upto: pp });
	}
	ink.flush(ctx);

	// The wrap: as the top edge lands on the floor, the seam flashes.
	const wrap = t >= 0.999 ? 1 - span(u, 0.68, 0.8) : 0;
	if (wrap > 0) {
		const pts = [];
		for (let i = 0; i <= 72; i++) pts.push(M(lerp(L, R, i / 72), 0));
		stroke(ctx, pts, { color: PAL.gold, width: 2.5, alpha: 0.9 * wrap, glow: 12 });
	}

	// The lattice, carried by the morph; the copies outside the strip faint,
	// landing on the ones inside as it wraps.
	const la = span(u, 0.06, 0.14);
	for (const p of lat) {
		const q = M(p.x, p.y);
		if (q[0] < -20 || q[0] > w + 20 || q[1] < -20 || q[1] > h + 20) continue;
		disc(ctx, q[0], q[1], p.inside ? 2.8 : 2.2, {
			fill: PAL.chalk,
			alpha: la * (p.inside ? 0.9 : 0.3)
		});
	}
	// Lit, once wrapped: q^n − 1, the image of Λ, coming up out of the
	// puncture as the lens goes in.
	const ga = span(u, 0.66, 0.72);
	if (ga > 0) {
		const r = Math.exp(w1[0]);
		for (let n = -1; n <= 14; n++) {
			const rad = Math.pow(r, n);
			const px = rad * K;
			if (px < 1.5) break;
			const size = smooth(span(px, 1.5, 12));
			const q = view.to([rad * Math.cos(n * w1[1]) - 1, rad * Math.sin(n * w1[1])]);
			if (q[0] < -40 || q[0] > w + 40 || q[1] < -40 || q[1] > h + 40) continue;
			lit(ctx, q[0], q[1], 4.2 * size, ga * size);
		}
	}
	// The way on: the puncture.
	if (zoom > 0) {
		const q = view.to([-1, 0]);
		portal(ctx, q[0], q[1], lerp(3, h / 8, smooth(span(zoom, 0.3, 1))), smooth(zoom));
	}
}

// ── special: the modular tessellation and its CM points ──────────────────────
const RHO = [-0.5, SQ3 / 2];
const RHO1 = [0.5, SQ3 / 2];
// (a z + b)/(c z + d), real coefficients, z ∈ H.
function mob(z, [a, b, c, d]) {
	const dr = c * z[0] + d;
	const di = c * z[1];
	const nr = a * z[0] + b;
	const ni = a * z[1];
	const den = dr * dr + di * di;
	return [(nr * dr + ni * di) / den, (ni * dr - nr * di) / den];
}
function modInv(d, c) {
	if (c === 1) return 0;
	let [r0, r1] = [((d % c) + c) % c, c];
	let [s0, s1] = [1, 0];
	while (r1) {
		const q = Math.floor(r0 / r1);
		[r0, r1] = [r1, r0 - q * r1];
		[s0, s1] = [s1, s0 - q * s1];
	}
	return ((s0 % c) + c) % c;
}
// The geodesic segment between two points of H ∪ ℝ (null for ∞).
function geodesic(p, q) {
	if (!p || !q) {
		const o = p ?? q;
		return { v: true, x: o[0], y0: o[1], y1: Infinity, x0: o[0], x1: o[0], top: Infinity };
	}
	if (Math.abs(p[0] - q[0]) < 1e-9) {
		const y0 = Math.min(p[1], q[1]);
		const y1 = Math.max(p[1], q[1]);
		return { v: true, x: p[0], y0, y1, x0: p[0], x1: p[0], top: y1 };
	}
	const xc = (p[0] * p[0] + p[1] * p[1] - q[0] * q[0] - q[1] * q[1]) / (2 * (p[0] - q[0]));
	const r = Math.hypot(p[0] - xc, p[1]);
	let a0 = Math.atan2(p[1], p[0] - xc);
	let a1 = Math.atan2(q[1], q[0] - xc);
	if (a0 > a1) [a0, a1] = [a1, a0];
	const top = a0 < Math.PI / 2 && a1 > Math.PI / 2 ? r : Math.max(p[1], q[1]);
	return { v: false, xc, r, a0, a1, x0: xc + r * Math.cos(a1), x1: xc + r * Math.cos(a0), top };
}
const r7 = (x) => (Math.round(x * 1e7) / 1e7 + 0).toFixed(7);
const keyOf = (p) => (p ? `${r7(p[0])},${r7(p[1])}` : 'inf');
// The primitive reduced forms (a, b, c) of discriminant −Dmax ≤ D < 0, and
// their points (−b + i√|D|)/2a in F.
function reducedForms(Dmax) {
	const out = [];
	for (let D = -3; D >= -Dmax; D--) {
		if (((D % 4) + 4) % 4 > 1) continue;
		for (let a = 1; 3 * a * a <= -D; a++)
			for (let b = -a + 1; b <= a; b++) {
				if ((((b - D) % 2) + 2) % 2) continue;
				const n = b * b - D;
				if (n % (4 * a)) continue;
				const c = n / (4 * a);
				if (c < a || (a === c && b < 0)) continue;
				if (gcd(gcd(a, Math.abs(b)), c) !== 1) continue;
				out.push({ D, z: [-b / (2 * a), Math.sqrt(-D) / (2 * a)] });
			}
	}
	return out;
}
function specialSetup() {
	const cells = [];
	const edges = new Map();
	const addCell = (a, b, c, d) => {
		const g = [a, b, c, d];
		const v1 = mob(RHO, g);
		const v2 = mob(RHO1, g);
		const v3 = c ? [a / c, 0] : null;
		const spread = Math.hypot(v1[0] - v2[0], v1[1] - v2[1]);
		const x = c ? a / c : b;
		const isF = a === 1 && b === 0 && c === 0 && d === 1;
		const ua = isF
			? 0
			: 0.05 +
				0.5 * Math.pow(clamp01(-Math.log(spread) / 9.5), 0.8) +
				0.02 * Math.min(3, Math.abs(x));
		const cell = { g, spread, ua, x, isF, top: Math.max(v1[1], v2[1]) };
		cells.push(cell);
		for (const [p, q] of [
			[v1, v2],
			[v1, v3],
			[v2, v3]
		]) {
			const k1 = keyOf(p);
			const k2 = keyOf(q);
			const key = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
			const e = edges.get(key);
			if (e) {
				e.ua = Math.min(e.ua, ua);
				e.spread = Math.max(e.spread, spread);
				e.bold ||= isF;
			} else edges.set(key, { ...geodesic(p, q), ua, spread, bold: isF });
		}
	};
	for (let k = -4; k <= 4; k++) addCell(1, k, 0, 1);
	for (let c = 1; c <= 60; c++)
		for (let d = -120; d <= 120; d++) {
			if (gcd(c, Math.abs(d)) !== 1) continue;
			const m1 = Math.hypot(c * RHO[0] + d, c * RHO[1]);
			const m2 = Math.hypot(c * RHO1[0] + d, c * RHO1[1]);
			const spread = 1 / (m1 * m2);
			if (spread < 1.2e-4) continue;
			const xr = spread > 0.003 ? 2.7 : 0.55;
			const a0 = modInv(d, c);
			const kmin = Math.ceil((-xr * c - a0) / c);
			const kmax = Math.floor((xr * c - a0) / c);
			for (let k = kmin; k <= kmax; k++) {
				const a = a0 + k * c;
				addCell(a, (a * d - 1) / c, c, d);
			}
		}
	const E = [...edges.values()];
	// The cells big enough to carry stars, by size.
	const big = cells.filter((c) => c.spread > 0.0012).sort((p, q) => q.spread - p.spread);
	return { E, big, forms: reducedForms(60), ink: makeInk(), count: cells.length };
}

function special(ctx, w, h, u, S) {
	const { E, big, forms, ink } = S;
	const K0 = 0.42 * h;
	const zoom = pace(span(u, 0.74, 1), 2.5);
	const K = K0 * Math.exp(3 * zoom);
	const bottom = lerp(h - 24, 0.74 * h, smooth(zoom));
	const sx = (x) => w / 2 + K * x;
	const sy = (y) => bottom - K * y;
	const xl = -(w / 2 + 10) / K;
	const xr = (w / 2 + 10) / K;
	const ytop = (bottom + 10) / K;

	// The tessellation: every edge in view and more than a pixel long, its
	// ink by its size, written on from F outward.
	for (const e of E) {
		if (e.ua > u || e.x1 < xl || e.x0 > xr) continue;
		if (e.v) {
			if (e.y0 > ytop) continue;
			const y1 = Math.min(e.y1, ytop);
			const len = K * (y1 - e.y0);
			if (len < 0.7) continue;
			const a =
				(e.bold ? 0.95 : 0.5 * Math.pow(Math.min(1, len / 16), 0.6)) * span(u, e.ua, e.ua + 0.05);
			ink.line(
				[
					[sx(e.x), sy(e.y0)],
					[sx(e.x), sy(y1)]
				],
				{ alpha: a, width: e.bold ? 2.2 : len > 40 ? 1.1 : 0.8 }
			);
			continue;
		}
		const len = K * e.r * (e.a1 - e.a0);
		if (len < 0.7 || e.r * Math.min(Math.sin(e.a0), Math.sin(e.a1)) > ytop) continue;
		const a =
			(e.bold ? 0.95 : 0.5 * Math.pow(Math.min(1, len / 16), 0.6)) * span(u, e.ua, e.ua + 0.05);
		if (a < 0.012) continue;
		const n = Math.max(3, Math.min(56, Math.round(len / 6)));
		const pts = [];
		for (let i = 0; i <= n; i++) {
			const th = lerp(e.a0, e.a1, i / n);
			pts.push([sx(e.xc + e.r * Math.cos(th)), sy(e.r * Math.sin(th))]);
		}
		ink.line(pts, { alpha: a, width: e.bold ? 2.2 : len > 40 ? 1.1 : 0.8 });
	}
	ink.flush(ctx);

	// The geodesic Re z = 0, written down from the top through i.
	const ga = span(u, 0.5, 0.64);
	if (ga > 0) {
		const yTop = Math.min(ytop, 40);
		stroke(
			ctx,
			[
				[sx(0), sy(yTop)],
				[sx(0), sy(0)]
			],
			{ width: 1.5, alpha: 0.7, upto: ga }
		);
	}

	// The stars: each cell's CM points by its γ, the brightest first, the
	// small cells carrying only ρ and i. Blooms are rationed.
	let blooms = 0;
	const seen = new Set();
	const star = (z, D, size, uD, dim = 1) => {
		const a = span(u, uD, uD + 0.06);
		if (a <= 0) return;
		if (z[0] < xl || z[0] > xr || z[1] > ytop) return;
		const key = `${z[0].toFixed(5)},${z[1].toFixed(5)}`;
		if (seen.has(key)) return;
		seen.add(key);
		const k = Math.pow(Math.min(1, size / 300), 0.7) * dim;
		const r = (1.5 + 3.4 * Math.sqrt(3 / D)) * k;
		const x = sx(z[0]);
		const y = sy(z[1]);
		if (r >= 2.4 && blooms < 110) {
			blooms++;
			lit(ctx, x, y, r, a * (0.55 + 0.45 * k));
		} else disc(ctx, x, y, Math.max(0.7, r), { fill: PAL.gold, alpha: a * (0.35 + 0.5 * k) });
	};
	for (const c of big) {
		const size = c.spread * K;
		if (size < 5) break;
		// a cell hangs from its cusp a/c by about √spread across
		const reach = 1.2 * Math.sqrt(c.spread) + 0.02;
		if (c.ua > u || c.x < xl - reach || c.x > xr + reach) continue;
		const Dcap = size >= 200 ? 60 : size >= 80 ? 16 : size >= 30 ? 4 : 0;
		for (const f of forms) {
			if (-f.D > Dcap) break;
			const uD = Math.max(c.ua, 0.2 + 0.46 * Math.sqrt((-f.D - 3) / 57));
			star(mob(f.z, c.g), -f.D, size, uD, c.isF ? 1 : 0.7);
		}
	}
	// Along the axis: i√n and i/√n for every n, lit as the line is drawn.
	if (ga > 0) {
		for (let n = 1; n <= 6000; n++) {
			const uD = 0.52 + 0.3 * Math.sqrt(Math.min(1, (n - 1) / 400));
			const r = Math.sqrt(n);
			const size = (K * 0.6) / Math.pow(n, 0.75);
			if (n <= 400) star([0, r], 4 * n, Math.max(5, K / n), uD);
			star([0, 1 / r], 4 * n, size, uD);
		}
	}

	// The way on: the cusp at 0, where the stars pile up.
	if (zoom > 0) {
		const g = smooth(span(zoom, 0.35, 1));
		portal(ctx, sx(0), sy(0), lerp(2, h / 9, g), g);
	}
}
