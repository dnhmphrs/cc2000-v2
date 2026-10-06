import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	PAL,
	TAU,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag,
	add3,
	sub3,
	mul3,
	norm,
	dot
} from './log/board.js';
import {
	orbit,
	spline,
	makeDepth,
	line3,
	blot,
	circle3,
	label3,
	lit3,
	limb,
	sphereGrid,
	NEAR,
	lerp3
} from './log/space.js';
import { glow, lecture } from './log/ink.js';
import { drawSperm } from './log/sperm.js';

// ── Sketch: log-charts — an atlas of coordinate charts ───────────────────────
// A manifold is a space covered by CHARTS — flat maps of pieces of it — glued
// by transition maps, and the same space is closed in one chart and open in
// the next. Here the charts themselves are the spectacle: curved spaces
// peeled flat on the board, coordinates written on in chalk, lines that are
// curves in one chart straight in the next. Hand-projected 3D (space.js:
// orbit, a software depth buffer, hidden lines faint and dashed), cyan and
// pink for the two families of a grid, gold for the swimmer's spiral and the
// worldline, 11–12 seconds each, a pure function of progress — ?at= pins any
// frame. One per ?v=:
//
//   mercator  (default) the loxodrome's own chart. The sphere in λ and φ, its
//             graticule cyan (meridians) and pink (parallels), and the golden
//             loxodrome — the lead's spiral, which keeps one bearing and so
//             winds into both poles — with the swimmer on it. The sphere is
//             projected out onto the cylinder round its equator, y = ln tan(π/4
//             + φ/2) (Mercator's y: exactly ln|z| of the stereographic z, so
//             the chart is log z and conformal), and the cylinder unrolls from
//             its back seam into the plane: the graticule a square grid, and
//             the loxodrome — EVERY loxodrome — a straight line, the swimmer
//             swimming straight up it, through the seam λ = ±π and off the top
//             of the chart, which runs to y = ±∞ at the poles: the sphere is
//             closed, its chart open.
//   atlas     the Riemann sphere under two charts: z from the north pole onto
//             the plane tangent at S, w from the south pole onto the plane
//             tangent at N, each cut to the disc |·| < 1.6, their overlap (a
//             band about the equator, and an annulus on each page) shaded. A
//             lit point rides the golden loxodrome from S to N — a log spiral
//             in either chart — with its two projection rays and its two
//             images; as it nears N its z-image runs off the bottom page
//             (z → ∞) while its w-image comes in to the middle of the top one
//             (w → 0), the transition w = 1/z arrowed between them on the
//             overlap; the lens climbs to look down into the w-chart at the
//             lit point. S² = U ∪ V: two open discs, one closed sphere.
//   kruskal   one black hole, three charts. Schwarzschild (t, r): r = 2M a
//             wall, the light rays t = ±r* + c (r* = r + 2M ln(r/2M − 1), the
//             tortoise coordinate) piling up against it. Kruskal–Szekeres:
//             U = −e^{−(t − r*)/4M}, V = e^{(t + r*)/4M}, T = (U + V)/2, X =
//             (V − U)/2 — the exterior grid morphs continuously into it, the
//             wall closing to the bifurcation point, the horizon the two lines
//             UV = 0 at 45°, r = const hyperbolas, t = const rays — and the
//             chart runs on past the horizon into II (the black hole), III
//             (the white hole) and IV (a second universe), r = 0 the two
//             hyperbolas UV = 1. Then Ũ = arctan U, Ṽ = arctan V squeezes
//             infinity in: the Penrose diagram, ℐ± and i⁰ either side, the
//             singularity the straight lines T̃ = ±π/4. The slice T = 0 from
//             i⁰ to i⁰ — r falling to 2M and climbing again — is the
//             Einstein–Rosen bridge, and it lifts off the board into Flamm's
//             paraboloid z² = 8M(r − 2M), the throat lit.
//   desitter  the same universe closed, flat and open. The de Sitter
//             hyperboloid −T² + X² + Y² = ℓ² in 3D (T up), sliced three ways
//             in turn: T = const (cyan circles, a = ℓ cosh(t/ℓ), k = +1),
//             T − X = const (pink parabolas, a = ℓ e^{t/ℓ}, k = 0, half the
//             hyperboloid), X = const > ℓ (violet hyperbolas, a = ℓ sinh(t/ℓ),
//             k = −1); a gold geodesic worldline X = ℓ cosh τ, T = ℓ sinh τ up
//             its front with a lit point climbing it. Closed, flat, open: it
//             depends on the chart.
//   torus     the flat torus as a chart: the square [0, 1)² with its opposite
//             edges glued (arrows), the swimmer swimming out through the right
//             edge and in at the left along a straight line of slope 2/3; the
//             square rolls up into a tube (the top and bottom edges glued) and
//             the tube bends round and glues end to end: a torus, on which the
//             straight line is the (2, 3) torus knot — the trefoil.
//
// How: each variant is one surface map S(chart point) → 3D with one or two
// morph parameters, so a chart's grid, its curves and the swimmer are all
// drawn THROUGH the same map, and the depth buffer is rasterised from the
// same map; the lens is an orbit on keyframed paths that start at rest and
// only gather pace.

const LENGTH = { mercator: 11, atlas: 11, kruskal: 12, desitter: 11, torus: 11 };

export default async function make({ at }) {
	const v = variant(['mercator', 'atlas', 'kruskal', 'desitter', 'torus']);
	const SECONDS = LENGTH[v];
	const b = getBoard();
	const time = clock(SECONDS, at);
	const draw = { mercator, atlas, kruskal, desitter, torus }[v];
	const Z = makeDepth(4);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, time.t, Z);
		tag(ctx, w, h, `log-charts · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Shared ───────────────────────────────────────────────────────────────────
const wrapPi = (a) => a - TAU * Math.round(a / TAU);

// The lecture, in slots top left: [slot, text, write from, to, rub out from,
// to]; a slot shows whichever of its lines is on, so a line can replace one.
function captions(ctx, w, h, u, list) {
	const slots = [];
	for (const [i, s, a, b, c = 9, d = 9] of list) {
		const p = span(u, a, b);
		const al = 1 - span(u, c, d);
		if (p <= 0 || al <= 0) continue;
		slots[i] = [s, p, al];
	}
	const lines = [];
	for (let i = 0; i < slots.length; i++) lines.push(slots[i] ?? ['', 0]);
	if (lines.some(([, p]) => p > 0)) lecture(ctx, w, h, lines);
}

// A polyline of chart points through a surface map S and the lens, cut where
// `seam` says two neighbours are on opposite sides of a cut (so an unrolled
// cylinder's seam opens), each piece a 3D line drawn the plates' way.
function chartLine(ctx, cam, S, pts, o, { depth = null, seam = null, upto = 1, fade = null } = {}) {
	if (upto <= 0 || o.alpha <= 0) return;
	const n = Math.max(2, Math.round(pts.length * clamp01(upto)));
	let piece = [];
	const flush = () => {
		if (piece.length > 1) line3(ctx, cam, piece, o, { depth, fade });
		piece = [];
	};
	for (let i = 0; i < n; i++) {
		if (i > 0 && seam && seam(pts[i - 1], pts[i])) flush();
		const P = S(pts[i]);
		if (P) piece.push(P);
	}
	flush();
}

// A line of chart points from a to b, n points.
function seg(a, b, n = 60) {
	const out = [];
	for (let i = 0; i <= n; i++) out.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
	return out;
}

// The swimmer, drawn through a map `to` (chart point → screen): head at
// `pole`, swimming toward `toward`, `size` the tail's reach in chart units
// (log-spacetime's pose, FROM and LEN along the golden spiral from the head).
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP = FROM + LEN;
function swimmer(ctx, to, { pole, toward, size, px, phase, alpha = 1, body = 1 }) {
	if (alpha <= 0) return;
	const dir = Math.atan2(pole[1] - toward[1], pole[0] - toward[0]);
	const view = { to };
	const o = {
		pole,
		scale: size / Math.exp(GOLDEN_K * TIP),
		turn: dir - TIP + 0.3,
		from: FROM,
		length: LEN,
		width: Math.max(1.2, px * 0.03),
		tip: Math.max(0.8, px * 0.008),
		body,
		wiggle: 0.13,
		phase,
		alpha
	};
	const pad = Math.max(2, px * 0.022);
	drawSperm(ctx, view, { ...o, color: PAL.ground, width: o.width + pad * 2, tip: o.tip + pad * 2 });
	drawSperm(ctx, view, o);
}

// An arrowhead at the end of a screen polyline, in its direction.
function arrowhead(ctx, P, color, a, size = 11) {
	if (a <= 0 || P.length < 2) return;
	const [x1, y1] = P[P.length - 1];
	let i = P.length - 2;
	while (i > 0 && Math.hypot(P[i][0] - x1, P[i][1] - y1) < 3) i--;
	const [x0, y0] = P[i];
	const d = Math.atan2(y1 - y0, x1 - x0);
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x1 - size * Math.cos(d - 0.42), y1 - size * Math.sin(d - 0.42));
	ctx.lineTo(x1 - size * Math.cos(d + 0.42), y1 - size * Math.sin(d + 0.42));
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

// A 3D polyline as screen points, those in front of the lens only.
function screen(cam, pts) {
	const out = [];
	for (const p of pts) {
		const q = cam.project(p);
		if (q[2] > NEAR) out.push(q);
	}
	return out;
}

// The way on: a gold disc with a cream core and a soft light, r px, `g` 0..1
// how far it has come up.
function portal(ctx, x, y, r, g) {
	if (r <= 0) return;
	glow(ctx, x, y, r * (2.2 + 1.6 * g), [255, 214, 140], 0.28 + 0.22 * g);
	disc(ctx, x, y, r, { fill: PAL.gold, alpha: 0.97 });
	disc(ctx, x, y, r * 0.58, { fill: '#fff6e0', alpha: lerp(0.5, 1, g) });
}

// ── mercator ─────────────────────────────────────────────────────────────────
// Chart coordinates (λ, y), y = ln tan(π/4 + φ/2) — Mercator's — and φ = gd(y)
// back. The surface map: the point at longitude λ, latitude φ on the unit
// sphere (a = 0), projected out to the cylinder round the equator, where its
// height is y (a = 1); the cylinder then unrolled from its back seam λ = ±π
// into the plane Z = 1 tangent to it at λ = 0 — a point λ along the
// circumference goes to the cylinder of radius 1/k tangent to that plane
// (k = 1 the cylinder, k → 0 the plane).
const gd = (y) => 2 * Math.atan(Math.exp(y)) - Math.PI / 2;
const merc = (phi) => Math.log(Math.tan(Math.PI / 4 + phi / 2));
const PITCH = 0.42; // the loxodrome's slope on the chart: y = PITCH · λ

function mercSurface(a, k, wrap = true) {
	const kk = Math.max(k, 1e-4);
	return ([lam, y]) => {
		const l = wrap ? wrapPi(lam) : lam;
		const phi = gd(y);
		const rad = lerp(Math.cos(phi), 1, a);
		const Y = lerp(Math.sin(phi), y, a);
		return [(rad * Math.sin(kk * l)) / kk, Y, rad * (1 - (1 - Math.cos(kk * l)) / kk)];
	};
}
const atSeam = (p, q) => Math.abs(wrapPi(q[0]) - wrapPi(p[0])) > 3;

function mercator(ctx, w, h, u, secs, Z) {
	const a = smooth(span(u, 0.1, 0.46)); // sphere → cylinder
	const k = 1 - smooth(span(u, 0.5, 0.84)); // cylinder → plane
	const Ymax = lerp(5.5, 3.2, a);
	const S = mercSurface(a, k);
	const S0 = mercSurface(a, k, false);
	const cam = orbit(w, h, {
		target: lerp3([0, 0, 0], [0, 0.1, 1], smooth(span(u, 0.5, 0.9))),
		az: spline(u, [
			[0, -0.85],
			[0.45, -0.4],
			[1, 0]
		]),
		el: spline(u, [
			[0, 0.3],
			[0.5, 0.2],
			[1, 0.02]
		]),
		dist: spline(u, [
			[0, 3.6],
			[0.46, 5.2],
			[0.9, 7.6],
			[1, 7.9]
		]),
		fov: 40
	});

	// The surface, into the depth buffer.
	Z.reset(w, h);
	const grid = [];
	for (let i = 0; i <= 40; i++) {
		const y = -Ymax + (2 * Ymax * i) / 40;
		const row = [];
		for (let j = 0; j <= 48; j++) row.push(S([-Math.PI + 1e-4 + ((TAU - 2e-4) * j) / 48, y]));
		grid.push(row);
	}
	Z.grid(cam, grid);
	limb(ctx, cam, 1 - a);

	// The graticule: meridians cyan every 30°, parallels pink every 15°, the
	// equator and the prime meridian chalk — the seam drawn as both edges.
	const g = span(u, 0, 0.12);
	const E = Math.PI - 1e-4;
	for (let i = -6; i <= 6; i++) {
		const lam = Math.max(-E, Math.min(E, (i * Math.PI) / 6));
		const main = i === 0;
		chartLine(
			ctx,
			cam,
			S,
			seg([lam, -Ymax], [lam, Ymax], 48),
			{ color: main ? PAL.chalk : PAL.cyan, width: main ? 2.2 : 1.8, alpha: main ? 0.8 : 0.85 },
			{ depth: Z, upto: g }
		);
	}
	for (let i = -5; i <= 5; i++) {
		const y = merc((i * Math.PI) / 12);
		const main = i === 0;
		chartLine(
			ctx,
			cam,
			S,
			seg([-E, y], [E, y], 96),
			{ color: main ? PAL.chalk : PAL.pink, width: main ? 2.2 : 1.8, alpha: main ? 0.8 : 0.85 },
			{ depth: Z, upto: g }
		);
	}

	// The loxodrome: y = PITCH · λ, pole to pole, cut at the seam.
	const L = Ymax / PITCH;
	const lox = [];
	for (let l = -L; l <= L; l += 0.02) lox.push([l, PITCH * l]);
	chartLine(
		ctx,
		cam,
		S,
		lox,
		{ color: PAL.gold, width: 3, glow: 6, alpha: 0.95 },
		{ depth: Z, seam: atSeam, upto: span(u, 0.02, 0.2) }
	);

	// The swimmer on it, keeping its bearing, gathering pace: through the seam
	// once the chart is flat (two copies, clipped to the chart), and off the top.
	const lh = -1.5 + 8.5 * Math.pow(u, 3.6);
	const copies = u >= 0.84 ? [0, -TAU] : [0];
	ctx.save();
	if (copies.length > 1) {
		const Q = [S0([-E, -Ymax]), S0([E, -Ymax]), S0([E, Ymax]), S0([-E, Ymax])].map((P) =>
			cam.project(P)
		);
		ctx.beginPath();
		Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
		ctx.closePath();
		ctx.clip();
	}
	for (const shift of copies) {
		const pole = [lh + shift, PITCH * lh];
		const toward = [lh + shift + 0.1, PITCH * (lh + 0.1)];
		const to = (p) => {
			const q = cam.project(S0(p));
			return q[2] > NEAR ? [q[0], q[1]] : [-1e4, -1e4];
		};
		const q0 = cam.project(S0(pole));
		if (q0[2] <= NEAR || Z.hidden(q0)) continue;
		const q1 = to([pole[0] + 0.1, pole[1]]);
		const px = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) * 10;
		const size = lerp(0.45, 0.8, smooth(span(u, 0.3, 0.8)));
		swimmer(ctx, to, { pole, toward, size, px: px * size * 2, phase: secs * 1.6 });
	}
	ctx.restore();

	// The chart's coordinates, in chalk, once it is flat.
	const la = span(u, 0.72, 0.82);
	if (la > 0) {
		const Lb = (p, s, dx, dy, size = 22) => label3(ctx, cam, S(p), s, { dx, dy, size, alpha: la });
		Lb([-E, -2.3], 'λ = −π', -8, 24);
		Lb([0, -2.3], '0', -4, 24);
		Lb([E, -2.3], 'π', -4, 24);
		Lb([E, 0], 'φ = 0', 14, 0);
		Lb([E, merc(Math.PI / 3)], '60°', 14, 0);
		Lb([E, merc(Math.PI / 2.4)], '75°', 14, 0);
		Lb([E, 2.75], 'y → ∞', 14, 0);
		Lb([E, -2.75], 'y → −∞', 14, 0);
	}

	captions(ctx, w, h, u, [
		[0, 'the sphere in (λ, φ):  a loxodrome keeps one bearing', 0.02, 0.12, 0.46, 0.5],
		[1, 'x = λ,   y = ln tan(π/4 + φ/2)', 0.16, 0.26],
		[2, '= arg z,  ln|z|  for z stereographic:  the chart is log z', 0.3, 0.42, 0.7, 0.74],
		[0, 'every loxodrome is a straight line', 0.54, 0.64],
		[2, 'the poles are at y = ±∞:  S² is closed, its chart open', 0.78, 0.9]
	]);
}

// ── atlas ────────────────────────────────────────────────────────────────────
// The unit sphere, y up, N = (0, 1, 0) and S = (0, −1, 0). The z-chart is the
// projection from N: z = (X + iZ)/(1 − Y) (the equatorial plane's coordinate;
// S ↦ 0, N ↦ ∞), drawn on the page tangent at S, y = −1, where the ray from N
// through P lands at 2z. The w-chart is the projection from S, w = (X − iZ)/
// (1 + Y), drawn on the page tangent at N, where the ray lands at 2w̄. On the
// overlap w = 1/z. Each chart is cut to the disc |·| < RC.
const RC = 1.8;
const sph = ([x, y]) => {
	const d = 1 + x * x + y * y;
	return [(2 * x) / d, (x * x + y * y - 1) / d, (2 * y) / d];
};
const pageZ = ([x, y]) => [2 * x, -1, 2 * y]; // the z-chart's page point of z
const pageW = ([x, y]) => [2 * x, 1, -2 * y]; // the w-chart's page point of w
const cinv = ([x, y]) => {
	const d = x * x + y * y || 1e-30;
	return [x / d, -y / d];
};
const LOX_M = 0.5; // the loxodrome z = e^{(m + i)s}
const loxZ = (s) => [Math.exp(LOX_M * s) * Math.cos(s), Math.exp(LOX_M * s) * Math.sin(s)];
const S0 = -5.05;
const S1 = 4.97;

function atlas(ctx, w, h, u, secs, Z) {
	const dive = smooth(span(u, 0.62, 1));
	const cam = orbit(w, h, {
		target: lerp3([0, 0, 0], [0, 1, 0], dive),
		az: spline(u, [
			[0, 0.5],
			[0.5, 0.25],
			[1, -0.1]
		]),
		el: spline(u, [
			[0, 0.28],
			[0.55, 0.36],
			[1, 1.38]
		]),
		dist: spline(u, [
			[0, 10],
			[0.55, 9.2],
			[1, 4]
		]),
		fov: 40
	});
	Z.reset(w, h);
	Z.grid(cam, sphereGrid([0, 0, 0], 1, 24, 36));
	limb(ctx, cam, 1);

	const g = span(u, 0, 0.14); // the grids written on
	const pageA = span(u, 0.06, 0.2); // the pages
	const front = (P) => dot(P, sub3(cam.pos, P)) > 0;

	// The overlap, shaded: the band |z| in [1/RC, RC] on the sphere, front
	// side, and the annulus on each page.
	const yB = (RC * RC - 1) / (RC * RC + 1);
	const shade = 0.11 * span(u, 0.22, 0.32);
	if (shade > 0) {
		const rows = 4;
		const cols = 48;
		for (let i = 0; i < rows; i++) {
			const t0 = Math.asin(lerp(-yB, yB, i / rows));
			const t1 = Math.asin(lerp(-yB, yB, (i + 1) / rows));
			for (let j = 0; j < cols; j++) {
				const a0 = (TAU * j) / cols;
				const a1 = (TAU * (j + 1)) / cols;
				const at = (t, a) => [Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)];
				const c = at((t0 + t1) / 2, (a0 + a1) / 2);
				if (!front(c)) continue;
				blot(ctx, cam, [at(t0, a0), at(t0, a1), at(t1, a1), at(t1, a0)], {
					fill: PAL.chalk,
					alpha: shade
				});
			}
		}
		for (const page of [pageZ, pageW]) {
			const ring = (r) => {
				const out = [];
				for (let i = 0; i <= 90; i++)
					out.push(page([r * Math.cos((TAU * i) / 90), r * Math.sin((TAU * i) / 90)]));
				return out;
			};
			const O = screen(cam, ring(RC));
			const I = screen(cam, ring(1 / RC));
			if (O.length > 80 && I.length > 80) {
				ctx.save();
				ctx.globalAlpha = shade * pageA;
				ctx.fillStyle = PAL.chalk;
				ctx.beginPath();
				O.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
				ctx.closePath();
				I.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
				ctx.closePath();
				ctx.fill('evenodd');
				ctx.restore();
			}
		}
	}

	// The grid on the sphere: |z| = const parallels (pink; the equator chalk),
	// arg z = const meridians (cyan) — the same lines are |w| and arg w.
	const radii = [0.3, 1 / RC, 1, RC, 1 / 0.3];
	for (const r of radii) {
		const Y = (r * r - 1) / (r * r + 1);
		const rr = Math.sqrt(1 - Y * Y);
		const main = r === 1;
		line3(
			ctx,
			cam,
			circle3([0, Y, 0], [1, 0, 0], [0, 0, 1], rr, 120),
			{ color: main ? PAL.chalk : PAL.pink, width: main ? 2.2 : 1.7, alpha: 0.85 * g },
			{ depth: Z }
		);
	}
	for (let i = 0; i < 12; i++) {
		const a = (Math.PI * i) / 6;
		const pts = [];
		for (let j = 0; j <= 60; j++) {
			const t = -Math.PI / 2 + (Math.PI * j) / 60;
			pts.push([Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)]);
		}
		line3(ctx, cam, pts, { color: PAL.cyan, width: 1.7, alpha: 0.85 * g }, { depth: Z });
	}

	// The two pages: circles pink (the rim rose, the unit circle chalk), rays cyan.
	for (const page of [pageZ, pageW]) {
		for (const r of [0.3, 1 / RC, 1, RC]) {
			const pts = [];
			for (let i = 0; i <= 120; i++)
				pts.push(page([r * Math.cos((TAU * i) / 120), r * Math.sin((TAU * i) / 120)]));
			const rim = r === RC;
			line3(
				ctx,
				cam,
				pts,
				{
					color: rim ? PAL.rose : r === 1 ? PAL.chalk : PAL.pink,
					width: rim ? 2.4 : r === 1 ? 2 : 1.5,
					alpha: (rim ? 0.9 : 0.75) * pageA,
					hid: 0.4
				},
				{ depth: Z }
			);
		}
		for (let i = 0; i < 12; i++) {
			const a = (Math.PI * i) / 6;
			line3(
				ctx,
				cam,
				seg([0.08 * Math.cos(a), 0.08 * Math.sin(a)], [RC * Math.cos(a), RC * Math.sin(a)], 24).map(
					page
				),
				{ color: PAL.cyan, width: 1.5, alpha: 0.7 * pageA, hid: 0.4 },
				{ depth: Z }
			);
		}
	}

	// The golden loxodrome on the sphere, and its image in each chart — a log
	// spiral in both — within the discs.
	const lw = span(u, 0.02, 0.22);
	const lox = [];
	for (let s = S0; s <= S1; s += 0.02) lox.push(loxZ(s));
	line3(
		ctx,
		cam,
		lox.map(sph),
		{ color: PAL.gold, width: 3, glow: 6, alpha: 0.95 },
		{ depth: Z, fade: (P, i) => (span(i / lox.length, 0, lw) > 0 ? 1 : 0) }
	);
	const inDisc = (z) => Math.hypot(z[0], z[1]) < RC;
	line3(
		ctx,
		cam,
		lox.filter(inDisc).map(pageZ),
		{ color: PAL.gold, width: 2, alpha: 0.65 * pageA * lw },
		{ depth: Z }
	);
	line3(
		ctx,
		cam,
		lox.map(cinv).filter(inDisc).map(pageW),
		{ color: PAL.gold, width: 2, alpha: 0.65 * pageA * lw },
		{ depth: Z }
	);

	// The point P riding it, its two rays and its two images.
	const sp = S0 + (S1 - S0) * Math.pow(u, 1.5);
	const z = loxZ(sp);
	const wz = cinv(z);
	const P = sph(z);
	const az = Math.hypot(z[0], z[1]);
	const N = [0, 1, 0];
	const Sp = [0, -1, 0];
	const qz = pageZ(z);
	const qw = pageW(wz);
	const rayA = 0.5 * span(u, 0.12, 0.24);
	line3(
		ctx,
		cam,
		[N, P, qz],
		{ color: PAL.chalk, width: 1.2, alpha: rayA, hid: 0.5 },
		{ depth: Z }
	);
	line3(
		ctx,
		cam,
		[Sp, P, qw],
		{ color: PAL.chalk, width: 1.2, alpha: rayA, hid: 0.5 },
		{ depth: Z }
	);
	const offZ = 1 - span(az, RC, RC * 1.5); // the z-image, running off its page
	const offW = 1 - span(1 / az, RC, RC * 1.5);
	const qP = cam.project(P);
	const hidP = Z.hidden(qP);
	lit3(ctx, cam, P, 6, hidP ? 0.35 : 1);
	lit3(ctx, cam, qz, 4.5, 0.9 * offZ * pageA, 'rgba(255, 222, 150, 0.5)');
	lit3(ctx, cam, qw, 4.5, 0.9 * offW * pageA, 'rgba(255, 222, 150, 0.5)');

	// On the overlap: the transition, arrowed from the z-image to the w-image.
	const onBoth = Math.min(span(az, 1 / RC, 0.72), 1 - span(az, 1.55, RC)) * span(u, 0.4, 0.5);
	if (onBoth > 0) {
		const mid = lerp3(qz, qw, 0.5);
		const out = norm([mid[0], 0, mid[2]]);
		const ctrl = add3([mid[0], 0, mid[2]], mul3(out, 1.6));
		const arc = [];
		for (let i = 0; i <= 40; i++) {
			const t = i / 40;
			arc.push(
				add3(add3(mul3(qz, (1 - t) * (1 - t)), mul3(ctrl, 2 * t * (1 - t))), mul3(qw, t * t))
			);
		}
		const Q = screen(cam, arc);
		stroke(ctx, Q, { color: PAL.rose, width: 1.8, alpha: 0.85 * onBoth, dash: [6, 6] });
		arrowhead(ctx, Q, PAL.rose, 0.85 * onBoth);
		label3(ctx, cam, arc[20], 'w = 1/z', {
			dx: 12,
			dy: 0,
			size: 24,
			alpha: onBoth,
			color: PAL.rose
		});
	}

	// Labels.
	const la = pageA;
	label3(ctx, cam, N, 'N', { dx: 10, dy: -16, size: 24, alpha: la * (1 - dive) });
	label3(ctx, cam, Sp, 'S', { dx: 10, dy: 18, size: 24, alpha: la, depth: Z });
	label3(ctx, cam, pageZ([RC * 0.72, RC * 0.72]), 'U:  z', {
		dx: 6,
		dy: 18,
		size: 24,
		alpha: la,
		depth: Z
	});
	label3(ctx, cam, pageW([RC * 0.72, -RC * 0.72]), 'V:  w', {
		dx: 6,
		dy: -14,
		size: 24,
		alpha: la * (1 - 0.5 * dive)
	});
	label3(ctx, cam, pageZ([0, 0]), '0', { dx: 8, dy: 14, size: 20, alpha: 0.8 * la, depth: Z });
	label3(ctx, cam, pageW([0, 0]), '0', { dx: 8, dy: 14, size: 20, alpha: 0.8 * la * (1 - dive) });
	label3(ctx, cam, pageZ([1, 0]), '1', { dx: 6, dy: 14, size: 20, alpha: 0.8 * la, depth: Z });
	label3(ctx, cam, pageW([1, 0]), '1', { dx: 6, dy: 14, size: 20, alpha: 0.8 * la * (1 - dive) });

	// The way on: the w-image lit and growing as the lens comes down on it.
	const pr = smooth(span(u, 0.86, 1));
	if (pr > 0) {
		const q = cam.project(qw);
		if (q[2] > NEAR) {
			portal(ctx, q[0], q[1], lerp(6, h / 6, pr), pr);
			label3(ctx, cam, qw, 'w → 0', {
				dx: lerp(6, h / 6, pr) + 12,
				dy: -10,
				size: 24,
				alpha: span(u, 0.9, 0.96)
			});
		}
	}

	captions(ctx, w, h, u, [
		[0, 'z = (X + iY)/(1 − Z)  from N,    w = (X − iY)/(1 + Z)  from S', 0.03, 0.16, 0.66, 0.7],
		[1, 'U = {|z| < 1.8},   V = {|w| < 1.8}:    S² = U ∪ V', 0.2, 0.3, 0.84, 0.88],
		[2, 'on U ∩ V:    w = 1/z', 0.46, 0.54],
		[0, 'P → N:  z → ∞, off its chart;   w → 0, the middle of the other', 0.72, 0.84],
		[1, 'two open discs,  one closed sphere', 0.88, 0.96]
	]);
}

// ── kruskal ──────────────────────────────────────────────────────────────────
// Units 2M = 1. The tortoise coordinate r* = r + ln|r − 1|; the null
// coordinates u = t − r*, v = t + r*; Kruskal's U = ∓e^{−u/2}, V = ±e^{v/2}
// with the signs of the four regions (I our exterior: U < 0 < V; II the black
// hole: both positive; III the white hole: both negative; IV the other
// exterior: U > 0 > V), T = (U + V)/2, X = (V − U)/2 — so UV = 0 is the
// horizon, UV = 1 the singularity r = 0, and in region I X² − T² =
// (r − 1) e^{r}. The Penrose squeeze Ũ = arctan(sU)/s, Ṽ = arctan(sV)/s (s = 0
// the identity, s = 1 the diagram) brings infinity in to the edges. Region I
// is drawn first in Schwarzschild's own chart, (r, t) on the board, and
// carried into Kruskal's by a morph m.
const rstar = (r) => r + Math.log(Math.abs(r - 1));
function kUV(t, r, reg) {
	const rs = rstar(r);
	const eu = Math.exp(-(t - rs) / 2);
	const ev = Math.exp((t + rs) / 2);
	if (reg === 1) return [-eu, ev];
	if (reg === 2) return [eu, ev];
	if (reg === 3) return [-eu, -ev];
	return [eu, -ev];
}
const sqz = (a, s) => (s < 1e-5 ? a : Math.atan(s * a) / s);
// A point of (U, V) on the board, squeezed by s.
function kBoard([U, V], s) {
	if (!Number.isFinite(U) || !Number.isFinite(V)) return null;
	const Ut = sqz(U, s);
	const Vt = sqz(V, s);
	return [(Vt - Ut) / 2, (Ut + Vt) / 2, 0];
}
// The point (t, r) of a region, through the morph: Schwarzschild's chart for
// region I at m = 0 (r across, t up, the wall r = 2M at X = −1.6), Kruskal's
// at m = 1, then the squeeze.
function kPoint(t, r, reg, { m, s }) {
	let [U, V] = kUV(t, r, reg);
	if (m < 1 && reg === 1) {
		const X = lerp(-1.6 + 1.6 * (r - 1), (V - U) / 2, m);
		const T = lerp(0.55 * t, (U + V) / 2, m);
		U = T - X;
		V = T + X;
	}
	return kBoard([U, V], s);
}
// Samplers: r across a region (log-spaced toward the horizon), t along a
// line (tan-spaced, out to ±40, so a squeezed line reaches its edge).
const R_OUT = [];
for (let i = 0; i <= 56; i++) R_OUT.push(1 + Math.exp(-12 + (13.6 * i) / 56));
const R_IN = [];
for (let i = 0; i <= 44; i++) R_IN.push(1 - Math.exp(-12 + (12 * i) / 44));
const T_ALL = [];
for (let i = 0; i <= 64; i++) T_ALL.push(2 * Math.tan(-1.5208 + (3.0416 * i) / 64));
const T_EXT = [0, 1, -1, 2, -2, 3.2, -3.2, 5, -5];
const R_EXT = [1.03, 1.1, 1.2, 1.35, 1.55, 1.8, 2.1, 2.5, 3.0];
const R_INT = [0.3, 0.55, 0.75, 0.9, 0.97];
const T_INT = [0, 1, -1, 2, -2, 3.2, -3.2];
const RAYS = [-4, -2, 0, 2, 4];
const FLAMM = 0.45; // the paraboloid's scale: the throat's radius on the board

function kruskal(ctx, w, h, u, secs, Z) {
	const m = smooth(span(u, 0.2, 0.46));
	const ext = smooth(span(u, 0.47, 0.6)); // the chart runs on past the horizon
	const s = smooth(span(u, 0.6, 0.78)); // the Penrose squeeze
	const bridge = span(u, 0.78, 0.86);
	const f = smooth(span(u, 0.84, 1)); // Flamm's paraboloid rises
	const st = { m, s };
	const cam = orbit(w, h, {
		target: [0, 0, 0],
		az: 0.6 * f,
		el: 0.44 * f,
		dist: spline(u, [
			[0, 8.2],
			[0.46, 9.6],
			[0.78, 4.4],
			[1, 5]
		]),
		fov: 40
	});
	const pt = (t, r, reg) => kPoint(t, r, reg, st);

	// Flamm's paraboloid, as far as it has risen: the slice T = 0 lifted off
	// the board, its spine X(r) going from the diagram's own T = 0 point for r
	// to z = 2√(r − 1), the suppressed circle of radius r opening round it.
	const rho = (r) => Math.sqrt(Math.exp(r) * Math.abs(r - 1));
	const spineX = (r) => lerp(sqz(rho(r), s), FLAMM * 2 * Math.sqrt(Math.max(0, r - 1)), f);
	const flamm = (r, side, a) => [
		side * spineX(r),
		FLAMM * r * f * Math.cos(a),
		FLAMM * r * f * Math.sin(a)
	];
	const depth = f > 0.02 ? Z : null;
	if (depth) {
		Z.reset(w, h);
		const grid = [];
		for (let i = 0; i <= 28; i++) {
			const x = -1 + (2 * i) / 28;
			const r = 1 + 2.2 * x * x;
			const row = [];
			for (let j = 0; j <= 36; j++) row.push(flamm(r, Math.sign(x) || 1, (TAU * j) / 36));
			grid.push(row);
		}
		Z.grid(cam, grid);
	} else Z.off();

	const dim = 1 - 0.85 * f; // the diagram steps back as the bridge rises
	const L = (pts, o, upto = 1) => chartLine(ctx, cam, (p) => p, pts, o, { depth, upto });
	const line = (reg, kind, val, upto = 1, alpha = 1, color = null) => {
		// kind 'r': r = val over t; 't': t = val over r; 'U'/'V': the ray
		// t = val ± r* over r.
		const rs = reg === 1 || reg === 4 ? R_OUT : R_IN;
		let pts;
		if (kind === 'r') pts = T_ALL.map((t) => pt(t, val, reg));
		else if (kind === 't') pts = rs.map((r) => pt(val, r, reg));
		else pts = rs.map((r) => pt(kind === 'U' ? val + rstar(r) : val - rstar(r), r, reg));
		pts = pts.filter(Boolean);
		const col = color ?? (kind === 'r' ? PAL.pink : kind === 't' ? PAL.cyan : PAL.chalk);
		const wd = kind === 'r' || kind === 't' ? 1.5 : 1.9;
		L(
			pts,
			{ color: col, width: wd, alpha: alpha * dim * (kind === 'r' || kind === 't' ? 0.75 : 0.85) },
			upto
		);
	};

	// Region I: Schwarzschild's grid, then the rays piling up at the wall.
	const g = span(u, 0, 0.1);
	for (const r of R_EXT) line(1, 'r', r, g);
	for (const t of T_EXT) line(1, 't', t, g);
	const rayUp = span(u, 0.1, 0.22);
	for (const c of RAYS) {
		line(1, 'U', c, rayUp);
		line(1, 'V', c, rayUp);
	}
	// The wall r = 2M, which closes to a point; the horizon UV = 0 opening
	// out of it at 45°.
	const wallA = (1 - span(m, 0.5, 1)) * g;
	if (wallA > 0) {
		const wall = T_ALL.map((t) => pt(t, 1 + 1e-9, 1)).filter(Boolean);
		L(wall, { color: PAL.chalk, width: 2.6, alpha: wallA * 0.9, glow: 4 });
	}
	const horA = span(m, 0.55, 1);
	if (horA > 0) {
		const hor = (alongU) => T_ALL.map((v) => kBoard(alongU ? [v, 0] : [0, v], s)).filter(Boolean);
		L(hor(false), { color: PAL.chalk, width: 2.6, alpha: horA * 0.9 * dim, glow: 4 });
		L(hor(true), { color: PAL.chalk, width: 2.6, alpha: horA * 0.9 * dim, glow: 4 });
	}

	// The extension: II, III and IV, the rays run on, the singularity r = 0.
	if (ext > 0) {
		for (const r of R_INT) {
			line(2, 'r', r, ext, 1);
			line(3, 'r', r, ext, 1);
		}
		for (const t of T_INT) {
			line(2, 't', t, ext, 1);
			line(3, 't', t, ext, 1);
		}
		for (const r of R_EXT) line(4, 'r', r, ext, 1);
		for (const t of T_EXT) line(4, 't', t, ext, 1);
		for (const c of RAYS) {
			line(2, 'V', c, ext, 0.9);
			line(2, 'U', c, ext, 0.9);
			line(3, 'U', c, ext, 0.9);
			line(3, 'V', c, ext, 0.9);
			line(4, 'U', c, ext, 0.9);
			line(4, 'V', c, ext, 0.9);
		}
		for (const reg of [2, 3]) {
			const sing = T_ALL.map((t) => pt(t, 0, reg)).filter(Boolean);
			L(sing, { color: PAL.red, width: 3.2, alpha: 0.95 * ext * dim, glow: 6 }, ext);
		}
	}

	// The bridge: the slice T = 0, i⁰ to i⁰, gold.
	if (bridge > 0 && f < 0.999) {
		const br = [];
		for (let i = 0; i <= 120; i++) {
			const V = 60 * Math.tan(-1.5 + (3 * i) / 120);
			const q = kBoard([-V, V], s);
			if (q) br.push(q);
		}
		L(br, { color: PAL.gold, width: 3.4, alpha: 0.95 * (1 - f), glow: 8 }, bridge);
	}

	// Flamm's paraboloid: rings r = const pink (the throat gold), meridians cyan.
	if (f > 0) {
		for (const r of [1, 1.04, 1.15, 1.35, 1.65, 2.05, 2.55, 3.2]) {
			const throat = r === 1;
			for (const side of throat ? [1] : [1, -1]) {
				const ring = [];
				for (let j = 0; j <= 72; j++) ring.push(flamm(r, side, (TAU * j) / 72));
				line3(
					ctx,
					cam,
					ring,
					{
						color: throat ? PAL.gold : PAL.pink,
						width: throat ? 3 : 1.6,
						alpha: (throat ? 1 : 0.8) * f,
						glow: throat ? 8 : 0
					},
					{ depth: Z }
				);
			}
		}
		for (let k = 0; k < 12; k++) {
			const a = (TAU * k) / 12;
			const mer = [];
			for (let i = 0; i <= 40; i++) {
				const x = -1 + (2 * i) / 40;
				mer.push(flamm(1 + 2.2 * x * x, Math.sign(x) || 1, a));
			}
			line3(ctx, cam, mer, { color: PAL.cyan, width: 1.5, alpha: 0.7 * f }, { depth: Z });
		}
	}

	// Labels: the wall, the horizon, the regions, the singularity, the edges.
	const lab = (P, str, dx, dy, a, color = PAL.chalk, size = 24) =>
		P && a > 0 && label3(ctx, cam, P, str, { dx, dy, size, alpha: a * dim, color, depth });
	lab(pt(2.6, 1 + 1e-9, 1), 'r = 2M', -12, -12, wallA * span(u, 0.04, 0.1));
	lab(kBoard([0, 1.9], s), 'r = 2M', 10, -10, horA);
	lab(kBoard([-1.9, 0], s), 'r = 2M', -10, -10, horA * ext);
	lab(kBoard([-1.3, 1.3], s), 'I', 0, 0, span(m, 0.7, 1) * (1 - f), PAL.chalk, 30);
	lab(kBoard([0.55, 0.55], s), 'II', -8, 0, ext * (1 - f), PAL.chalk, 30);
	lab(kBoard([-0.55, -0.55], s), 'III', -12, 0, ext * (1 - f), PAL.chalk, 30);
	lab(kBoard([1.3, -1.3], s), 'IV', -30, 0, ext * (1 - f), PAL.chalk, 30);
	lab(pt(0, 0, 2), 'r = 0', -22, -20, ext * (1 - f), PAL.red);
	lab(pt(0, 0, 3), 'r = 0', -22, 22, ext * (1 - f), PAL.red);
	const pen = span(s, 0.6, 1) * (1 - f);
	const INF = 1e9;
	lab(kBoard([-INF, INF], s), 'i^{0}', 12, 0, pen);
	lab(kBoard([INF, -INF], s), 'i^{0}', -12, 0, pen);
	lab(kBoard([-1, INF], s), 'ℐ^{+}', 10, -12, pen);
	lab(kBoard([-INF, 1], s), 'ℐ^{−}', 10, 14, pen);
	lab(kBoard([INF, -1], s), 'ℐ^{+}', -10, -12, pen);
	lab(kBoard([1, -INF], s), 'ℐ^{−}', -10, 14, pen);
	lab(kBoard([0, INF], s), 'i^{+}', 8, -14, pen);
	lab(kBoard([-INF, 0], s), 'i^{−}', 8, 16, pen);
	lab(kBoard([INF, 0], s), 'i^{+}', -8, -14, pen);
	lab(kBoard([0, -INF], s), 'i^{−}', -8, 16, pen);
	if (f > 0.3) {
		lab(flamm(1, 1, Math.PI / 2), 'r = 2M', 10, -14, span(f, 0.3, 0.6), PAL.gold);
		lab(flamm(3.2, 1, Math.PI / 2), 'r → ∞', 10, -10, span(f, 0.3, 0.6));
		lab(flamm(3.2, -1, Math.PI / 2), 'r → ∞', -10, -10, span(f, 0.3, 0.6));
	}

	// The way on: the throat, lit, as the lens comes in on it.
	const pr = smooth(span(u, 0.9, 1));
	if (pr > 0) {
		const q = cam.project([0, 0, 0]);
		if (q[2] > NEAR) portal(ctx, q[0], q[1], lerp(5, h / 9, pr), pr);
	}

	captions(ctx, w, h, u, [
		[
			0,
			'Schwarzschild (t, r):   ds² = −(1 − 2M/r) dt² + dr²/(1 − 2M/r) + r² dΩ²',
			0.01,
			0.12,
			0.44,
			0.48
		],
		[
			1,
			'r* = r + 2M ln(r/2M − 1):   light runs on  t = ±r* + c,  and piles up at r = 2M',
			0.1,
			0.22,
			0.44,
			0.48
		],
		[
			2,
			'U = −e^{−(t − r*)/4M},   V = e^{(t + r*)/4M}:   the horizon is  UV = 0',
			0.24,
			0.36,
			0.6,
			0.64
		],
		[
			0,
			'the chart runs on:  II the black hole,  III the white hole,  IV another universe',
			0.48,
			0.6,
			0.78,
			0.82
		],
		[1, 'r = 0 is  UV = 1:  two hyperbolas', 0.5, 0.56, 0.78, 0.82],
		[2, 'Ũ = arctan U,  Ṽ = arctan V:   infinity comes in to  ℐ^{±}, i^{0}', 0.64, 0.76, 0.86, 0.9],
		[
			0,
			'T = 0, i^{0} to i^{0}:   r falls to 2M and climbs again — the Einstein–Rosen bridge',
			0.8,
			0.9
		],
		[1, 'Flamm’s paraboloid:   z² = 8M (r − 2M)', 0.88, 0.96]
	]);
}

// ── desitter ─────────────────────────────────────────────────────────────────
// The hyperboloid −T² + X² + Y² = 1 (ℓ = 1) as world [X, T, Y], T up: the
// point at (τ, θ) is (cosh τ cos θ, sinh τ, cosh τ sin θ). Three slicings, each
// a chart's time: T = c (circles of radius √(1 + c²)), T − X = c (parabolas,
// X = (Y² − 1 − c²)/2c, over the half T − X > 0) and X = c > 1 (hyperbolas
// T² − Y² = c² − 1, both branches).
const dS = (tau, th) => [
	Math.cosh(tau) * Math.cos(th),
	Math.sinh(tau),
	Math.cosh(tau) * Math.sin(th)
];
const TAU_MAX = 1.35;
const T_TOP = Math.sinh(TAU_MAX);

function desitter(ctx, w, h, u, secs, Z) {
	const dive = smooth(span(u, 0.8, 1));
	const tp = -1.35 + 2.85 * Math.pow(u, 1.6); // the worldline's point
	const Pp = dS(tp, 0);
	const cam = orbit(w, h, {
		target: lerp3([0, 0.1, 0], Pp, 0.8 * dive),
		az: spline(u, [
			[0, -0.4],
			[0.35, -0.1],
			[0.65, 0.55],
			[1, 1.1]
		]),
		el: spline(u, [
			[0, 0.32],
			[0.6, 0.22],
			[1, 0.1]
		]),
		dist: spline(u, [
			[0, 8.6],
			[0.6, 7.6],
			[1, 3]
		]),
		fov: 40
	});
	Z.reset(w, h);
	const grid = [];
	for (let i = 0; i <= 28; i++) {
		const tau = -TAU_MAX + (2 * TAU_MAX * i) / 28;
		const row = [];
		for (let j = 0; j <= 48; j++) row.push(dS(tau, (TAU * j) / 48));
		grid.push(row);
	}
	Z.grid(cam, grid);
	const g = span(u, 0, 0.1);
	const I = (p) => p;
	const L = (pts, o, upto = 1) => chartLine(ctx, cam, I, pts, o, { depth: Z, upto });

	// The surface, faint: its meridians and rims in rose; the axes in chalk.
	for (let k = 0; k < 16; k++) {
		const th = (TAU * k) / 16;
		const pts = [];
		for (let i = 0; i <= 40; i++) pts.push(dS(-TAU_MAX + (2 * TAU_MAX * i) / 40, th));
		L(pts, { color: PAL.rose, width: 1.2, alpha: 0.45 * g, hid: 0.25 });
	}
	for (const tau of [-TAU_MAX, TAU_MAX])
		L(circle3([0, Math.sinh(tau), 0], [1, 0, 0], [0, 0, 1], Math.cosh(tau), 120), {
			color: PAL.rose,
			width: 1.6,
			alpha: 0.7 * g
		});
	L(
		[
			[0, -T_TOP - 0.4, 0],
			[0, T_TOP + 0.5, 0]
		],
		{ color: PAL.chalk, width: 1.4, alpha: 0.5 * g, hid: 0.5 }
	);
	L(
		[
			[0, 0, 0],
			[3.3, 0, 0]
		],
		{ color: PAL.chalk, width: 1.4, alpha: 0.5 * g, hid: 0.5 }
	);
	label3(ctx, cam, [0, T_TOP + 0.5, 0], 'T', { dx: 8, dy: -10, size: 22, alpha: 0.8 * g });
	label3(ctx, cam, [3.3, 0, 0], 'X', { dx: 8, dy: -4, size: 22, alpha: 0.8 * g });

	// The three slicings, in turn — each written on, then stepping back.
	const w1 = span(u, 0.1, 0.3);
	const a1 = 1 - 0.6 * span(u, 0.38, 0.46);
	const w2 = span(u, 0.38, 0.58);
	const a2 = 1 - 0.6 * span(u, 0.64, 0.72);
	const w3 = span(u, 0.64, 0.84);
	if (w1 > 0)
		for (const c of [-1.8, -1.3, -0.85, -0.45, 0, 0.45, 0.85, 1.3, 1.8])
			L(
				circle3([0, c, 0], [1, 0, 0], [0, 0, 1], Math.sqrt(1 + c * c), 120),
				{ color: PAL.cyan, width: 2, alpha: 0.9 * a1 },
				w1
			);
	if (w2 > 0) {
		for (const c of [0.2, 0.45, 0.75, 1.1, 1.55, 2.1]) {
			const ym = Math.sqrt(Math.max(0, 1 - c * c + 2 * c * T_TOP));
			const pts = [];
			for (let i = 0; i <= 80; i++) {
				const Y = -ym + (2 * ym * i) / 80;
				const X = (Y * Y - 1 - c * c) / (2 * c);
				pts.push([X, X + c, Y]);
			}
			L(pts, { color: PAL.pink, width: 2, alpha: 0.9 * a2 }, w2);
		}
		// c = 0 is the null plane: two light rays, Y = ±1, T = X.
		for (const sg of [1, -1])
			L(
				[
					[-T_TOP, -T_TOP, sg],
					[T_TOP, T_TOP, sg]
				],
				{ color: PAL.chalk, width: 1.6, alpha: 0.6 * a2 },
				w2
			);
	}
	if (w3 > 0)
		for (const c of [1.06, 1.2, 1.42, 1.72, 2.1])
			for (const sg of [1, -1]) {
				const ym = Math.sqrt(Math.max(0, T_TOP * T_TOP - c * c + 1));
				const pts = [];
				for (let i = 0; i <= 60; i++) {
					const Y = -ym + (2 * ym * i) / 60;
					pts.push([c, sg * Math.sqrt(c * c - 1 + Y * Y), Y]);
				}
				L(pts, { color: PAL.violet, width: 2, alpha: 0.9 }, w3);
			}

	// The worldline X = cosh τ, T = sinh τ — a geodesic — gold, and the point
	// climbing it.
	const wl = [];
	for (let i = 0; i <= 80; i++) {
		const P = dS(-TAU_MAX + (2 * TAU_MAX * i) / 80, 0);
		wl.push([P[0] * 1.012, P[1], P[2] * 1.012]); // a hair off the surface, so it is not cut by it
	}
	L(wl, { color: PAL.gold, width: 3, glow: 6, alpha: 0.95 }, span(u, 0.02, 0.2));
	const qp = cam.project(Pp);
	lit3(ctx, cam, Pp, 6, Z.hidden(qp) ? 0.35 : 1);

	// Labels by the slices.
	const lab = (P, s, dx, dy, a, color) =>
		a > 0 && label3(ctx, cam, P, s, { dx, dy, size: 24, alpha: a, color, depth: Z });
	const r85 = Math.sqrt(1 + 0.85 * 0.85);
	lab(
		[r85 * Math.cos(-0.9), 0.85, r85 * Math.sin(-0.9)],
		'k = +1',
		-10,
		-14,
		span(w1, 0.6, 1) * a1,
		PAL.cyan
	);
	{
		const c = 1.55;
		const Y = -1.9;
		const X = (Y * Y - 1 - c * c) / (2 * c);
		lab([X, X + c, Y], 'k = 0', -10, -14, span(w2, 0.6, 1) * a2, PAL.pink);
	}
	lab(
		[1.72, Math.sqrt(1.72 * 1.72 - 1 + 1.3 * 1.3), 1.3],
		'k = −1',
		12,
		-8,
		span(w3, 0.6, 1),
		PAL.violet
	);

	// The way on: the point, lit and growing, as the lens comes in on it.
	const pr = smooth(span(u, 0.9, 1));
	if (pr > 0 && qp[2] > NEAR) portal(ctx, qp[0], qp[1], lerp(6, h / 7, pr), pr);

	captions(ctx, w, h, u, [
		[0, '−T² + X² + Y² = ℓ²:   de Sitter space, T up', 0.02, 0.12],
		[1, 'T = const:   circles,   a(t) = ℓ cosh(t/ℓ),   k = +1', 0.12, 0.26, 0.6, 0.64],
		[2, 'T − X = const:   parabolas,   a(t) = ℓ e^{t/ℓ},   k = 0', 0.4, 0.54, 0.84, 0.88],
		[1, 'X = const > ℓ:   hyperbolas,   a(t) = ℓ sinh(t/ℓ),   k = −1', 0.66, 0.8],
		[2, 'closed, flat, open:   it depends on the chart', 0.88, 0.97]
	]);
}

// ── torus ────────────────────────────────────────────────────────────────────
// The chart is the unit square, (x, y) ∼ (x + 1, y) ∼ (x, y + 1). The surface
// map rolls y round a tube of curvature κ (κ = 2π closes it: radius 1/2π,
// the axis along x), then bends the axis, stretched by λ, round a circle of
// radius 1/κ₂ (κ₂λ = 2π closes it) — the roll is not isometric, the torus is
// drawn R/r = 2.2 so it does not cut itself, but the gluing is the flat torus's
// own. The gold line y = 2x/3 closes after 3 turns in x and 2 in y: on the
// torus the (3, 2) torus knot.
function torusSurface(kap, lam, kap2) {
	const k = Math.max(kap, 1e-4);
	return ([x, y]) => {
		const s = lam * (x - 0.5);
		const th = k * (y - 0.5);
		const ty = Math.sin(th) / k;
		const tz = (1 - Math.cos(th)) / k - (1 - Math.cos(k / 2)) / (2 * k);
		if (kap2 < 1e-4) return [s, ty, -tz];
		const Rb = 1 / kap2;
		return [(Rb + tz) * Math.sin(s / Rb), ty, Rb - (Rb + tz) * Math.cos(s / Rb)];
	};
}
const KNOT = [
	[
		[0, 0],
		[1, 2 / 3]
	],
	[
		[0, 2 / 3],
		[0.5, 1]
	],
	[
		[0.5, 0],
		[1, 1 / 3]
	],
	[
		[0, 1 / 3],
		[1, 1]
	]
];

function torus(ctx, w, h, u, secs, Z) {
	const roll = smooth(span(u, 0.3, 0.56));
	const bend = smooth(span(u, 0.56, 0.85));
	const kap = TAU * roll;
	const lam = lerp(1, 2.2, bend);
	const kap2 = (bend * TAU) / lam;
	const S = torusSurface(kap, lam, kap2);
	const Rb = kap2 > 1e-4 ? 1 / kap2 : 0;
	const cam = orbit(w, h, {
		target: [0, 0, Rb * bend],
		az: spline(u, [
			[0, 0],
			[0.3, 0.06],
			[1, 1.25]
		]),
		el: spline(u, [
			[0, 0],
			[0.3, 0.05],
			[0.58, 0.5],
			[1, 0.68]
		]),
		dist: spline(u, [
			[0, 1.9],
			[0.3, 1.9],
			[0.58, 2.6],
			[0.85, 2.9],
			[1, 2.1]
		]),
		fov: 40
	});
	Z.reset(w, h);
	const grid = [];
	for (let i = 0; i <= 32; i++) {
		const row = [];
		for (let j = 0; j <= 48; j++) row.push(S([j / 48, i / 32]));
		grid.push(row);
	}
	Z.grid(cam, grid);
	const g = span(u, 0, 0.1);
	const line = (pts, o, upto = 1) => chartLine(ctx, cam, S, pts, o, { depth: Z, upto });

	// The grid: x = const cyan, y = const pink; the edges chalk, with their
	// gluing arrows (one on the sides, two on the top and bottom).
	for (let k = 1; k < 6; k++) {
		line(seg([k / 6, 0], [k / 6, 1], 40), { color: PAL.cyan, width: 1.6, alpha: 0.8 * g });
		line(seg([0, k / 6], [1, k / 6], 40), { color: PAL.pink, width: 1.6, alpha: 0.8 * g });
	}
	const edgeA = 0.9 * g * (1 - 0.5 * roll);
	const edges = [
		[[0, 0], [1, 0], 2],
		[[0, 1], [1, 1], 2],
		[[0, 0], [0, 1], 1],
		[[1, 0], [1, 1], 1]
	];
	for (const [a, b, n] of edges) {
		line(seg(a, b, 40), { color: PAL.chalk, width: 2.2, alpha: edgeA });
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0.5 : 0.44 + 0.12 * i;
			const P = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
			const Q = [lerp(a[0], b[0], t + 0.02), lerp(a[1], b[1], t + 0.02)];
			arrowhead(ctx, screen(cam, [S(P), S(Q)]), PAL.chalk, edgeA * span(u, 0.08, 0.16), 12);
		}
	}

	// The straight line: four pieces on the chart, one closed knot on the torus.
	const lw = span(u, 0.06, 0.26);
	for (const [a, b] of KNOT)
		line(seg(a, b, 50), { color: PAL.gold, width: 3, glow: 6, alpha: 0.95 }, lw);

	// The swimmer, along it: l along the line (x = l − 1, y = 2l/3), out
	// through the right edge and in at the left while the chart is flat (two
	// copies, clipped to the square), round the torus once it is glued.
	const l = 0.9 + 1.17 * Math.pow(u, 1.28);
	const flat = u < 0.3;
	const copies = flat ? [0, 1] : [0];
	const to = (p) => {
		const q = cam.project(S(p));
		return q[2] > NEAR ? [q[0], q[1]] : [-1e4, -1e4];
	};
	ctx.save();
	if (flat) {
		const Q = [S([0, 0]), S([1, 0]), S([1, 1]), S([0, 1])].map((P) => cam.project(P));
		ctx.beginPath();
		Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
		ctx.closePath();
		ctx.clip();
	}
	for (const shift of copies) {
		const pole = [l - 1 + shift, (2 * l) / 3];
		const toward = [pole[0] + 0.03, pole[1] + 0.02];
		const q0 = cam.project(S(pole));
		if (q0[2] <= NEAR || Z.hidden(q0)) continue;
		const q1 = to([pole[0] + 0.1, pole[1]]);
		const px = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) * 10;
		swimmer(ctx, to, { pole, toward, size: 0.11, px: px * 0.22, phase: secs * 1.6 });
	}
	ctx.restore();

	// Labels on the flat chart.
	const la = g * (1 - roll);
	label3(ctx, cam, S([0, 0]), '(0, 0)', { dx: -8, dy: 18, size: 20, alpha: la });
	label3(ctx, cam, S([1, 0]), '(1, 0)', { dx: 8, dy: 18, size: 20, alpha: la });
	label3(ctx, cam, S([0, 1]), '(0, 1)', { dx: -8, dy: -14, size: 20, alpha: la });
	label3(ctx, cam, S([1, 1]), '(1, 1)', { dx: 8, dy: -14, size: 20, alpha: la });

	captions(ctx, w, h, u, [
		[0, 'the flat torus:   (x, y) ∼ (x + 1, y) ∼ (x, y + 1)', 0.02, 0.14],
		[
			1,
			'the line y = 2x/3 leaves through the right edge and comes back at the left',
			0.1,
			0.26,
			0.3,
			0.34
		],
		[1, 'glue top to bottom:   a tube', 0.34, 0.42, 0.58, 0.62],
		[1, 'glue end to end:   a torus', 0.62, 0.72],
		[2, 'the straight line is the (3, 2) torus knot:   a trefoil', 0.84, 0.96]
	]);
}
