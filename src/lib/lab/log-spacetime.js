import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	bloom,
	math,
	PAL,
	TAU,
	PHI,
	GOLDEN_ANGLE,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag
} from './log/board.js';
import { orbit, curl, limb, NEAR } from './log/space.js';
import { glow, impact, lecture } from './log/ink.js';
import { drawSperm } from './log/sperm.js';

// ── Sketch: log-spacetime — the tunnel, closed up into spacetime ─────────────
// A transition. It opens on log-tunnel's plane at 0.85 — the head-on net of
// the golden angle, cyan 8-spirals and pink 13-spirals through grey seeds,
// the swimmer (drawSperm) heading for the lit centre — and keeps that
// sketch's clock, so the flight runs on at its pace and the swimmer swims
// into the light (at 1.5 s: a flash and a shock ring). Then a chain of
// projective and Möbius maps, each written on the board as it acts, carries
// the tunnel into a picture of spacetime CLOSED UP: compact, its infinities
// brought in to a finite boundary — closed, and open at every point. Each
// variant ends on a lit point, a gold disc with a cream core a third of the
// frame across: the way on to the rooms. One per ?v=:
//
//   penrose   (default) the tunnel was a light cone, seen end on. The net is
//             lifted onto the past cone of the lit centre O, x² + y² = t²,
//             t < 0 — the zoom a dilation of spacetime toward O, which leaves
//             the cone where it is — and the lens (orthographic) tips over to
//             look at it side on: t up, x across, the cone's edges the light
//             rays at 45°, the future cone faint above, the swimmer's path a
//             gold worldline into O (straight, inertial, curled by its dive)
//             and on up the t axis. The cone gives way to the (x, t) plane, a
//             grid of constant t (cyan) and x (pink), and the plane is
//             squeezed through its null coordinates, U = arctan(s(t − x))/s,
//             V the same of t + x, s from 0 to 1: the boundary at infinity
//             comes in from off the board and closes into the PENROSE
//             DIAMOND — i⁺, i⁻, i⁰, ℐ⁺, ℐ⁻. As the squeeze acts on u and v
//             apart, light runs at 45° all the way: it is conformal. O's light
//             rides the worldline up into i⁺, where every inertial worldline
//             ends, and the lens dives at it.
//   boost     the net is the sky. The board curls into the celestial sphere of
//             a tiny observer (z = e^{iφ} tan(θ/2): the curl of log-mobius),
//             and the tunnel's zoom runs on as z ↦ e^{η} z — a Lorentz boost of
//             rapidity η toward ∞, which is aberration: the sky as it stood at
//             the hit drains off 0, behind, and crowds into ∞, ahead, which
//             brightens (the beaming). After the hit the net's turn eases out,
//             so the flow is the pure boost the board names. The lens swings
//             round to see it side on and draws back; the sphere becomes the
//             event O of a Minkowski diagram: the hyperbolae t² − x² = ±1, and
//             the boosted axes t′ (the moving worldline) and x′ closing on the
//             light like scissors, their unit ticks riding the hyperbolae.
//             Squeezed into the diamond, t′ hugs ℐ⁺ and still ends at i⁺.
//   conic     the projective plane. H: (x, y, 1) ↦ (x, y, 1 + gy) turns on:
//             the line at infinity comes into view as the line Hℓ∞, and the
//             circles about O become conics — ellipses (cyan) while they miss
//             y = −1/g, the line H sends to ∞; the one that touches it a
//             parabola (chalk); those that cross it hyperbolas (pink), their
//             two branches either side of Hℓ∞, broken where w changes sign.
//             Then the board closes up: [X : Y : W] goes to the sphere of
//             curvature k tangent at O, at arctan(k|(X, Y)|/|W|) from O toward
//             the sign of W, k from 0 to 1 — the plane wrapped onto a dome,
//             ℓ∞ its rim, where a hyperbola's branches meet it at P and Q and
//             again at −P and −Q: one pair of points, since the rim is glued
//             to itself (ℝP²). O is the pole; the lens dives at it.
//   cayley    the disc, the half-plane, spacetime. The tunnel's net, cut to a
//             disc, goes by M_θ(z) = (cos(θ/2) z + sin(θ/2)) / (−sin(θ/2) z +
//             cos(θ/2)) — the Riemann sphere turned by θ about ±i — θ from 0 to
//             π/2, at the end the Cayley map (1 + z)/(1 − z): the disc onto the
//             half-plane, its rim straightened into the edge, 0 to 1. Read as
//             spacetime (r = Re, t = Im, r ≥ 0) and squeezed as above, it is
//             the Penrose TRIANGLE of Minkowski space, r = 0 its left edge,
//             the net carried along; the centre, at rest at r = 1, rides its
//             worldline up into i⁺.
//   einstein  the tunnel was a cylinder. The plane rolls up through the
//             conformal cones ρ = e^{βs}, height (e^{βs}√(1 − β²) − 1)/β, β
//             from 1 to 0, into the log cylinder w = log z, seen from inside;
//             the lens backs out of its mouth and the tube stands up, time
//             along it: ℝ × S¹, Einstein's static universe, on which Minkowski
//             space is, conformally, the diamond |T| + |χ| < π (χ = 2X, T = 2T
//             of the penrose map) — its edges four 45° helices, its two corners
//             at spatial infinity one point at the back, which the lens goes
//             round to see — and it dives at i⁺.
//
// How: one net, log-tunnel's lattice made each frame at the zoom τ, is drawn
// through each variant's own map S (p ↦ screen), every line's width and fade
// going by its size on screen there — so through the plain view it IS
// log-tunnel's frame, and through a squeeze it thins as the map does. 3D is
// projected by hand (space.js's orbit and curl), hidden lines faint and
// dashed: exact for the cone and the cylinder (the sight line's second root),
// a sphere's for the sky and the dome. 11–12 seconds, a pure function of
// progress: ?at= pins any frame.

const LENGTH = { penrose: 11, boost: 12, conic: 11, cayley: 11, einstein: 11 };

// ── log-tunnel's flight, carried on ──────────────────────────────────────────
// The sketch opens on log-tunnel's plane at 0.85, so it keeps that sketch's
// clock: tunnel time ut = 0.85 + (seconds in) / 10, the zoom τ(ut) the same
// closed form (V0 e-folds a second rising on a square: 1.2 a second at 0.85,
// and only faster from there), the swimmer's dive the same law.
const T_SECONDS = 10;
const T_AT = 0.85;
const V0 = 0.22;
const V1 = 1.6;
const flown = (ut) => T_SECONDS * (V0 * ut + ((V1 - V0) * ut * ut * ut) / 3);

// ── The lattice (log-tunnel's) ───────────────────────────────────────────────
// Seed n at angle n·α and radius e^{−cn}, c = log φ / 18: the 8- and
// 13-spirals cross at right angles, and the flow runs along the 21-spiral,
// turning κ per e-fold of zoom.
const LC = Math.log(PHI) / 18;
const wrapPi = (a) => a - TAU * Math.round(a / TAU);
const slope = (F) => wrapPi(F * GOLDEN_ANGLE) / (-F * LC);
const KAPPA = -slope(21);
const FAMILIES = [
	[13, PAL.pink],
	[8, PAL.cyan]
];
const RING = 2 * Math.log(PHI);
const DS = 0.03;

// The net at zoom τ, in plate units (r = 1 is 0.42 of the frame's short side
// on log-tunnel's lens), from radius rIn to rOut: its spirals (each with its
// step along the curve, in log r), its rings r = φ^{−2k} and its seeds.
function net(tau, rIn, rOut, turn = KAPPA * tau) {
	const s0 = Math.log(rIn) - tau;
	const s1 = Math.log(rOut) - tau;
	const lines = [];
	for (const [F, color] of FAMILIES) {
		const m = slope(F);
		for (let j = 0; j < F; j++) {
			const sj = -LC * j;
			const tj = j * GOLDEN_ANGLE;
			const pts = [];
			for (let s = s0; s <= s1 + 1e-9; s += DS) {
				const r = Math.exp(s + tau);
				const a = tj + m * (s - sj) + turn;
				pts.push([r * Math.cos(a), r * Math.sin(a)]);
			}
			lines.push({ color, step: DS * Math.hypot(1, m), pts });
		}
	}
	const rings = [];
	for (let k = Math.max(1, Math.ceil((tau - Math.log(rOut)) / RING)); ; k++) {
		const r = Math.exp(-k * RING + tau);
		if (r < rIn) break;
		rings.push(r);
	}
	const seeds = [];
	const n0 = Math.max(0, Math.ceil((tau - Math.log(rOut)) / LC));
	const n1 = Math.floor((tau - Math.log(rIn)) / LC);
	for (let n = n0; n <= n1; n++) {
		const r = Math.exp(-LC * n + tau);
		const a = n * GOLDEN_ANGLE + turn;
		seeds.push([r * Math.cos(a), r * Math.sin(a)]);
	}
	return { lines, rings, seeds };
}

// ── Ink through a map ────────────────────────────────────────────────────────
// Every variant draws the same net through its own map S: p ↦ [sx, sy, back]
// on screen (null where the map cuts it). A line's width and fade go by its
// size on screen there — ρ, its length per unit of log r, which head on is
// the radius itself — so through the plain view this IS log-tunnel's frame,
// and through a squeeze the lines thin and the seeds shrink as the map does.

// A ribbon (width and alpha per point) in as few strokes as it can take:
// consecutive segments whose width and alpha round alike share one path.
function ribbonQ(ctx, P, W, A, color) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const qa = (j) => Math.round(Math.min(1, (A[j - 1] + A[j]) / 2) * 24) / 24;
	const qw = (j) => Math.round(((W[j - 1] + W[j]) / 2) * 4) / 4;
	let i = 1;
	while (i < P.length) {
		const a = qa(i);
		const wd = qw(i);
		ctx.beginPath();
		ctx.moveTo(P[i - 1][0], P[i - 1][1]);
		let j = i;
		while (j < P.length && qa(j) === a && qw(j) === wd) {
			ctx.lineTo(P[j][0], P[j][1]);
			j++;
		}
		if (a > 0.004) {
			ctx.globalAlpha = a;
			ctx.lineWidth = Math.max(0.3, wd);
			ctx.stroke();
		}
		i = j;
	}
	ctx.restore();
}
// The far side: faint and dashed, as the plates draw hidden lines.
function dashed(ctx, P, W, A, color, hid) {
	const k = P.length >> 1;
	stroke(ctx, P, { color, width: Math.max(1, W[k] * 0.62), alpha: A[k] * hid, dash: [3, 6] });
}

// One curve of world points through S, in runs: broken where S cuts it,
// where it jumps (through ∞) and where it goes behind. ρ at a point is its
// segment's length over `step`, the curve's own step (in log r, or the angle
// for a ring), so the width and fade follow the size S gives it there.
function inkCurve(ctx, pts, S, step, color, o) {
	const { width, alpha, hid = 0.3, jump = 260, fade = null } = o;
	const Q = pts.map((p) => {
		const f = fade ? fade(p) : 1;
		const q = f > 0.004 ? S(p) : null;
		return q ? [q[0], q[1], q[2] ? 1 : 0, f] : null;
	});
	let P = [];
	let W = [];
	let A = [];
	let side = 0;
	const flush = () => {
		if (P.length > 1) (side ? dashed : ribbonQ)(ctx, P, W, A, color, hid);
		P = [];
		W = [];
		A = [];
	};
	for (let i = 0; i < Q.length - 1; i++) {
		const a = Q[i];
		const b = Q[i + 1];
		const len = a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) : Infinity;
		if (!a || !b || len > jump || a[2] !== b[2]) {
			flush();
			continue;
		}
		const rho = len / step;
		if (!P.length) {
			P.push(a);
			W.push(width(rho));
			A.push(alpha(rho) * a[3]);
			side = a[2];
		}
		P.push(b);
		W.push(width(rho));
		A.push(alpha(rho) * b[3]);
	}
	flush();
}

// The net through S, as log-tunnel draws it: rose rings, the two families of
// spirals, grey seeds — each family's strength 0..1, `fade(p)` cutting it to a
// region of the plane.
function drawNet(ctx, N, S, o = {}) {
	const {
		lines = 1,
		rings = 1,
		seeds = 1,
		ringColor = PAL.rose,
		ringAlpha = 0.42,
		hid = 0.3,
		jump = 260,
		fade = null,
		seedMax = 42,
		widthMax = 4.2
	} = o;
	if (rings > 0)
		for (const r of N.rings) {
			const pts = [];
			for (let i = 0; i <= 96; i++)
				pts.push([r * Math.cos((TAU * i) / 96), r * Math.sin((TAU * i) / 96)]);
			inkCurve(ctx, pts, S, TAU / 96, ringColor, {
				width: (rho) => Math.min(2.2, 0.8 + rho / 300),
				alpha: (rho) => ringAlpha * rings * span(rho, 4, 46),
				hid,
				jump,
				fade
			});
		}
	if (lines > 0)
		for (const L of N.lines)
			inkCurve(ctx, L.pts, S, L.step, L.color, {
				width: (rho) => Math.min(widthMax, 0.7 + rho / 150),
				alpha: (rho) => lines * span(rho, 4, 46),
				hid,
				jump,
				fade
			});
	if (seeds > 0)
		for (const p of N.seeds) {
			const f = fade ? fade(p) : 1;
			if (f <= 0.01) continue;
			const q = S(p);
			const q2 = q && S([p[0] * 1.002, p[1] * 1.002]);
			if (!q2) continue;
			const rho = Math.hypot(q2[0] - q[0], q2[1] - q[1]) / 0.002;
			const a = 0.88 * seeds * f * span(rho, 4, 46) * (q[2] ? hid : 1);
			if (a > 0.01)
				disc(ctx, q[0], q[1], Math.min(seedMax, 0.05 * rho), { fill: PAL.node, alpha: a });
		}
}

// ── The swimmer (log-tunnel's) ───────────────────────────────────────────────
// Posed as the plate has it: FROM, LEN along the golden spiral from the head.
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP = FROM + LEN;
const SWIM_TURN = 0.3;
function swimmer(ctx, w, h, { pole, toward = [0, 0], size, body, phase, wiggle, alpha = 1 }) {
	const pv = makeView({ w, h, scale: 1 });
	const dir = Math.atan2(pole[1] - toward[1], pole[0] - toward[0]);
	const o = {
		pole,
		scale: size / Math.exp(GOLDEN_K * TIP),
		turn: dir - TIP + SWIM_TURN,
		from: FROM,
		length: LEN,
		width: Math.max(1.2, size * 0.03),
		tip: Math.max(0.8, size * 0.008),
		body,
		wiggle,
		phase,
		alpha
	};
	const pad = Math.max(2, size * 0.022);
	drawSperm(ctx, pv, { ...o, color: PAL.ground, width: o.width + pad * 2, tip: o.tip + pad * 2 });
	drawSperm(ctx, pv, o);
}
// The dive, log-tunnel's law — and on its last stretch (ut 0.9 to 1) all the
// way in, so the head is AT the centre when the tunnel's clock reads 1.
function swim(ut) {
	const dive = Math.pow(span(ut, 0.76, 1), 2) * 5;
	return { dive, k: Math.exp(-dive) * (1 - span(ut, 0.9, 1)) };
}
// The swimmer head on, its pole about O at (ox, oy) on screen.
function swimmerAt(ctx, w, h, st, ox, oy) {
	const { ut, turn, tau, secs, H } = st;
	const sw = swim(ut);
	if (sw.k <= 0.003) return;
	const rho = 0.24 * H * sw.k;
	const ang = -2.65 + turn + 0.9 * sw.dive;
	const c = [ox - w / 2, -(oy - h / 2)];
	swimmer(ctx, w, h, {
		pole: [c[0] + rho * Math.cos(ang), c[1] + rho * Math.sin(ang)],
		toward: c,
		size: 0.36 * H * sw.k,
		body: 1,
		wiggle: 0.13 * span(ut, 0.04, 0.2),
		phase: secs * 1.6 + tau * 0.9
	});
}

// ── The light at the centre ──────────────────────────────────────────────────
// log-tunnel's orb and the first of its fill, at (x, y): the fill swells into
// the swimmer's arrival, the beat flashes on it (a wash and a shock ring),
// and it settles to a lit point.
function fillLight(ctx, x, y, w, h, f) {
	const D = Math.hypot(w, h) / 2;
	const R = D * lerp(0.08, 0.95, f);
	const g = ctx.createRadialGradient(x, y, 0, x, y, R);
	g.addColorStop(0, `rgba(255, 250, 238, ${f})`);
	g.addColorStop(lerp(0.2, 0.45, f), `rgba(255, 244, 220, ${f})`);
	g.addColorStop(0.75, `rgba(250, 226, 170, ${0.45 * f})`);
	g.addColorStop(1, 'rgba(245, 193, 80, 0)');
	ctx.save();
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, TAU);
	ctx.fill();
	ctx.restore();
	bloom(ctx, x, y, R * 1.3, 'rgba(255, 236, 190, 0.5)', 0.6 * f);
}
function centreLight(ctx, w, h, x, y, u, hit, { size = 1, alpha = 1 } = {}) {
	const H = Math.min(w, h);
	const after = span(u, hit, hit + 0.2);
	bloom(ctx, x, y, H * lerp(0.17, 0.085, after) * size, 'rgba(255, 232, 180, 0.9)', 0.9 * alpha);
	disc(ctx, x, y, lerp(7, 6, after) * size, { fill: '#fff8e6', alpha: 0.95 * alpha });
	const f =
		(0.156 + 0.24 * smooth(span(u, 0, hit))) * (1 - smooth(span(u, hit + 0.01, hit + 0.13)));
	if (f > 0.002) fillLight(ctx, x, y, w, h, f);
	impact(ctx, w, h, x, y, H * 0.5, u, hit, 0.28);
}

// The way on: a gold disc with a cream core and a bloom, r px across its
// radius, `g` 0..1 how far it has come up.
function portal(ctx, x, y, r, g) {
	if (r <= 0) return;
	glow(ctx, x, y, r * (2.2 + 1.6 * g), [255, 214, 140], 0.28 + 0.22 * g);
	disc(ctx, x, y, r, { fill: PAL.gold, alpha: 0.97 });
	disc(ctx, x, y, r * 0.58, { fill: '#fff6e0', alpha: lerp(0.5, 1, g) });
}

// ── The lecture ──────────────────────────────────────────────────────────────
// Lines in slots top left: [slot, text, write from, to, rub out from, to]; a
// slot shows whichever of its lines is on. The tunnel's own two lines are up
// at the start and rubbed out as this sketch's first is written.
function captions(ctx, w, h, u, list) {
	const slots = [];
	let wiped = 0;
	for (const [i, s, a, b, c = 9, d = 9] of list) {
		const p = a < 0 ? 1 : span(u, a, b);
		const al = 1 - span(u, c, d);
		if (p <= 0 || al <= 0) continue;
		if (a < 0) wiped = Math.max(wiped, al); // log-tunnel's own lines
		slots[i] = [s, p, al, a < 0];
	}
	// log-tunnel's two lines sit on its own wipe of the board, as they do there.
	if (wiped > 0) wipe(ctx, w, h, wiped);
	const lines = [];
	for (let i = 0; i < slots.length; i++)
		lines.push(slots[i] && !slots[i][3] ? slots[i].slice(0, 3) : ['', 0]);
	if (lines.some(([, p]) => p > 0)) lecture(ctx, w, h, lines);
	const R = 0.42 * Math.min(w, h);
	const sz = Math.round(Math.max(18, R * 0.07));
	slots.forEach((sl, i) => {
		if (sl && sl[3])
			math(
				ctx,
				sl[0],
				Math.max(28, w * 0.05),
				Math.max(40, h * 0.08) + i * Math.max(30, sz * 1.6),
				{
					size: sz,
					alpha: 0.92 * sl[2]
				}
			);
	});
}
// log-tunnel's patch of board wiped clean of the net behind its notes.
function wipe(ctx, w, h, a = 1) {
	const x = Math.max(28, w * 0.05);
	const y = Math.max(40, h * 0.08);
	ctx.save();
	ctx.globalAlpha = a;
	ctx.translate(x + 230, y + 18);
	ctx.scale(1, 0.3);
	const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 370);
	g.addColorStop(0, 'rgba(21, 21, 21, 0.9)');
	g.addColorStop(0.6, 'rgba(21, 21, 21, 0.7)');
	g.addColorStop(1, 'rgba(21, 21, 21, 0)');
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, 370, 0, TAU);
	ctx.fill();
	ctx.restore();
}
const TUNNEL_NOTES = [
	[0, 'θ_{n} = n · 137.5°,   r_{n} = φ^{−n/18}', -1, -1, 0.02, 0.06],
	[1, 'z ↦ e^{−(1 + iκ)τ} z', -1, -1, 0.02, 0.06]
];

// A label on the board.
const label = (ctx, q, s, dx, dy, a, o = {}) =>
	a > 0 &&
	q &&
	math(ctx, s, q[0] + dx, q[1] + dy, {
		size: 24,
		alpha: a,
		align: dx < 0 ? 'right' : 'left',
		...o
	});

// ── Spacetime, closed up ─────────────────────────────────────────────────────
// Minkowski's (x, t) through its null coordinates u = t − x, v = t + x, each
// squeezed by f_s(a) = arctan(s a)/s: s = 0 the identity, s = 1 the Penrose
// map, which brings the whole plane into the diamond |X| + |T| < π/2. As it
// acts on u and v separately, light (u or v constant) runs at 45° throughout:
// the squeeze is conformal. i⁺ = (0, π/2s), i⁰ = (±π/2s, 0), ℐ± its edges.
const sq = (a, s) => (s < 1e-5 ? a : Math.atan(s * a) / s);
function pen(x, t, s) {
	const U = sq(t - x, s);
	const V = sq(t + x, s);
	return [(V - U) / 2, (V + U) / 2];
}
// A whole line's parameter, out to where tan runs off: dense at the middle
// and out to ±200, so a line reaches its corner when squeezed.
const SIG = [];
for (let i = 0; i <= 200; i++) SIG.push(Math.tan(-1.5662 + (3.1324 * i) / 200));
const GRID = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7, 10, 15, 25, 40];

// The diagram's lens: (X, T) to the screen, K px to the unit, magnified Z
// about the focus F, which sits at the frame's centre.
const lensOf = (w, h, K, Z = 1, F = [0, 0]) => ({
	to: ([X, T]) => [w / 2 + K * Z * (X - F[0]), h / 2 - K * Z * (T - F[1])],
	K,
	Z
});
const xt = (view, s, pts) => pts.map(([x, t]) => view.to(pen(x, t, s)));

// The grid: constant t cyan, constant x pink, the axes chalk; `half` the
// r ≥ 0 half only (the triangle of a spacetime with a centre).
function grid(ctx, view, s, al, { upto = 1, half = false, cyan = 0.7, pink = 0.7 } = {}) {
	if (al <= 0) return;
	for (const g of [0, ...GRID, ...GRID.map((x) => -x)]) {
		const axis = g === 0;
		const xs = half ? SIG.filter((x) => x >= 0) : SIG;
		stroke(
			ctx,
			xt(
				view,
				s,
				xs.map((x) => [x, g])
			),
			{
				color: axis ? PAL.chalk : PAL.cyan,
				width: axis ? 2 : 1.5,
				alpha: al * (axis ? 0.75 : cyan),
				upto
			}
		);
		if (half && g <= 0) continue;
		stroke(
			ctx,
			xt(
				view,
				s,
				SIG.map((t) => [g, t])
			),
			{
				color: axis ? PAL.chalk : PAL.pink,
				width: axis ? 2 : 1.5,
				alpha: al * (axis ? 0.75 : pink),
				upto
			}
		);
	}
}
// The light through O: t = ±x (or, on the half, t = ±r).
function lightRays(ctx, view, s, al, half = false) {
	if (al <= 0) return;
	for (const sg of half ? [1] : [1, -1])
		for (const d of [1, -1])
			stroke(
				ctx,
				xt(
					view,
					s,
					SIG.filter((x) => x >= 0).map((x) => [sg * x, d * x])
				),
				{
					color: PAL.chalk,
					width: 2.4,
					alpha: 0.9 * al,
					glow: 4
				}
			);
}
// The boundary at infinity, its corners and edges named.
function boundary(ctx, view, s, al, half = false, crown = 1) {
	if (al <= 0 || s < 0.05) return;
	const b = Math.PI / (2 * s);
	const top = view.to([0, b]);
	const bot = view.to([0, -b]);
	const right = view.to([b, 0]);
	const left = view.to([-b, 0]);
	const o = { color: PAL.chalk, width: 2.4, alpha: 0.9 * al };
	stroke(ctx, [top, right, bot], o);
	stroke(ctx, half ? [bot, top] : [bot, left, top], half ? { ...o, alpha: 0.6 * al } : o);
	const L = (P, s2, dx, dy) => label(ctx, view.to(P), s2, dx, dy, al);
	if (crown > 0) label(ctx, view.to([0, b]), 'i^{+}', 16, -14, al * crown);
	L([0, -b], 'i^{−}', 16, 16);
	L([b, 0], 'i^{0}', 14, 2);
	L([b / 2, b / 2], 'ℐ^{+}', 16, -16);
	L([b / 2, -b / 2], 'ℐ^{−}', 16, 18);
	if (!half) {
		L([-b, 0], 'i^{0}', -14, 2);
		L([-b / 2, b / 2], 'ℐ^{+}', -16, -16);
		L([-b / 2, -b / 2], 'ℐ^{−}', -16, 18);
	}
}
// A point riding up a worldline into i⁺: its T (on the closed-up diagram)
// climbs on a square from `from` to reach π/2 at `to`; t = tan T.
const rise = (u, from, to) =>
	Math.tan((Math.PI / 2) * Math.min(0.9995, Math.pow(span(u, from, to), 2)));
// The axes: t = 0 and x = 0 (on the half, the line t = 0 out from r = 0).
function axes(ctx, view, s, al, half = false) {
	if (al <= 0) return;
	const o = { color: PAL.chalk, width: 2, alpha: 0.75 * al };
	stroke(
		ctx,
		xt(
			view,
			s,
			(half ? SIG.filter((x) => x >= 0) : SIG).map((x) => [x, 0])
		),
		o
	);
	if (!half)
		stroke(
			ctx,
			xt(
				view,
				s,
				SIG.map((t) => [0, t])
			),
			o
		);
}

export default async function make({ at }) {
	const v = variant(['penrose', 'boost', 'conic', 'cayley', 'einstein']);
	const SECONDS = LENGTH[v];
	const b = getBoard();
	const time = clock(SECONDS, at);
	const draw = { penrose, boost, conic, cayley, einstein }[v];

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const ut = T_AT + (u * SECONDS) / T_SECONDS;
		const tau = flown(ut);
		draw(ctx, w, h, {
			u,
			ut,
			tau,
			turn: KAPPA * tau,
			secs: ut * T_SECONDS,
			hit: ((1 - T_AT) * T_SECONDS) / SECONDS,
			H: Math.min(w, h),
			seconds: SECONDS
		});
		tag(ctx, w, h, `log-spacetime · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── penrose: the tunnel was a light cone ─────────────────────────────────────
const RCAP = 5; // the net on the cone runs out to this radius (off the board)
const BETA = 0.55; // the swimmer's path: ρ = β|t|, inside the cone, timelike

// The swimmer's worldline into O as the zoomed frame has it at tunnel time
// ut: where its head was at each earlier time, carried on by the zoom since
// (dilated about O and turned), lifted into the past cone at t = −ρ/β. Before
// the dive it came in on a straight line (an inertial worldline through O);
// the dive curls it in. [X, Y, t], far past first, out past the cone.
function trail(ut, tau) {
	const out = [];
	const end = Math.min(ut, 1);
	for (let i = 0; i <= 240; i++) {
		const v = end - (i / 240) * 0.7;
		const sw = swim(v);
		const rho = (0.24 / 0.42) * sw.k * Math.exp(tau - flown(v));
		const ang = -2.65 + KAPPA * tau + 0.9 * sw.dive;
		out.push([rho * Math.cos(ang), rho * Math.sin(ang), -rho / BETA]);
		if (rho > RCAP * 1.4) break;
	}
	// and on out along its straight line, to the far past
	const p = out[out.length - 1];
	for (let k = 2; k <= 4096; k *= 2) out.push([p[0] * k, p[1] * k, p[2] * k]);
	return out.reverse();
}

function penrose(ctx, w, h, st) {
	const { u, ut, tau, H, hit, seconds } = st;
	const cx = w / 2;
	const cy = h / 2;
	const R0 = 0.42 * H;
	const K = (0.8 * h) / Math.PI;

	// The lens: orthographic, tipping from looking up the t axis (head on —
	// the tunnel) to side on (t up), and drawing back from the tunnel's scale
	// to the diagram's. The net lies on the past cone t = −√(x² + y²) of O.
	const tip = smooth(span(u, 0.13, 0.42));
	const a = (Math.PI / 2) * tip;
	const k = lerp(R0, K, tip);
	const ca = Math.cos(a);
	const sa = Math.sin(a);
	const P3 = (x, y, t) => [cx + k * x, cy - k * (t * sa - y * ca)];
	// Behind the cone? Where the line of sight meets the cone again (the
	// quadric's second root, Minkowski products ⟨p, e⟩ over ⟨e, e⟩) on the
	// past sheet and within the drawn net, the point is hidden.
	const ee = sa * sa - ca * ca;
	const hidden = (x, y, t) => {
		if (Math.abs(ee) < 1e-9) return false;
		const lam = (-2 * (t * ca - y * sa)) / ee;
		if (lam <= 1e-6) return false;
		const qt = t - lam * ca;
		return qt < 0 && Math.hypot(x, y - lam * sa) < RCAP;
	};
	// The tunnel's plane lifted onto the cone: x = X, y = −Y, t = −r.
	const S = (p) => {
		const r = Math.hypot(p[0], p[1]);
		const q = P3(p[0], -p[1], -r);
		return [q[0], q[1], hidden(p[0], -p[1], -r)];
	};

	const side = u >= 0.42; // side on: the diagram takes over from the cone
	const netA = 1 - span(u, 0.42, 0.52);
	if (netA > 0) {
		const N = net(tau, 2.5 / R0, RCAP);
		// The future cone, faint: the past cone's rings mirrored up through O.
		const fut = 0.3 * span(a, 0.5, 1.1) * netA;
		if (fut > 0)
			for (const r of N.rings) {
				const P = [];
				for (let i = 0; i <= 96; i++) {
					const ps = (TAU * i) / 96;
					P.push(P3(r * Math.cos(ps), r * Math.sin(ps), r));
				}
				stroke(ctx, P, { color: PAL.rose, width: 1.4, alpha: fut * span(k * r, 4, 46) });
			}
		drawNet(ctx, N, S, {
			lines: netA,
			rings: netA,
			seeds: netA,
			fade: (p) => 1 - span(Math.hypot(p[0], p[1]), RCAP * 0.8, RCAP)
		});
	}

	// The diagram: s squeezes it into the diamond; the dive magnifies i⁺.
	const s = smooth(span(u, 0.44, 0.72));
	const dv = span(u, 0.78, 1);
	const view = lensOf(w, h, K, Math.exp(1.8 * dv * dv), [0, (Math.PI / 2) * smooth(dv)]);
	const O = side ? view.to([0, 0]) : [cx, cy];

	if (!side) {
		// The cone's outline, once side on enough to have one — at 90° the
		// light rays through O — and the axes.
		const sil = span(a, Math.PI / 4 + 0.03, Math.PI / 4 + 0.4);
		if (sil > 0) {
			const c = Math.min(1, ca / Math.max(sa, 1e-6));
			for (const d of [-1, 1]) {
				const ps = Math.asin(d * c);
				for (const psi of [ps, Math.PI - ps])
					stroke(ctx, [P3(0, 0, 0), P3(RCAP * Math.cos(psi), RCAP * Math.sin(psi), d * RCAP)], {
						color: PAL.chalk,
						width: 2.4,
						alpha: 0.9 * sil,
						glow: 4
					});
			}
		}
		const ax = span(a, 0.75, 1.35);
		if (ax > 0) {
			const o = { color: PAL.chalk, width: 2, alpha: 0.75 * ax };
			stroke(ctx, [P3(-6, 0, 0), P3(6, 0, 0)], o);
			stroke(ctx, [P3(0, 0, -6), P3(0, 0, 6)], o);
		}
	} else {
		grid(ctx, view, s, span(u, 0.42, 0.54), { upto: span(u, 0.42, 0.56) });
		axes(ctx, view, s, 1);
		lightRays(ctx, view, s, 1);
		boundary(ctx, view, s, span(s, 0.6, 0.9), false, 1 - span(u, 0.8, 0.86));
	}

	// The swimmer's worldline: into O inside the cone, then on up the t axis
	// — solid to its present, dashed beyond.
	const tauSide = flown(T_AT + (0.42 * seconds) / T_SECONDS);
	const tr = trail(ut, Math.min(tau, tauSide));
	const gold = { color: PAL.gold, width: 3.6, glow: 6 };
	const tNow = rise(u, 0.56, 0.9);
	const nowT = Math.atan(tNow);
	const ahead = (T0, T1) => {
		const out = [];
		for (let i = 0; i <= 80; i++) out.push([0, Math.tan(lerp(T0, T1, i / 80))]);
		return out;
	};
	if (!side) {
		const ta = span(a, 0.35, 0.9);
		if (ta > 0)
			stroke(
				ctx,
				tr.map(([X, Y, t]) => P3(X, -Y, t)),
				{ ...gold, alpha: ta }
			);
		const up = span(u, 0.27, 0.42);
		if (up > 0) stroke(ctx, [P3(0, 0, 0), P3(0, 0, 6)], { ...gold, upto: up });
	} else {
		stroke(
			ctx,
			xt(
				view,
				s,
				tr.map(([X, , t]) => [X, t])
			),
			gold
		);
		stroke(ctx, xt(view, s, ahead(0, nowT)), gold);
		stroke(ctx, xt(view, s, ahead(nowT, 1.5705)), {
			color: PAL.gold,
			width: 2.4,
			alpha: 0.75,
			dash: [7, 9]
		});
	}

	// Labels: O, and the axes t and x while the diagram is still the plane.
	const la = span(a, 0.9, 1.4) * (1 - span(s, 0.3, 0.6));
	if (la > 0) {
		const L = (x, t) => (side ? view.to(pen(x, t, s)) : P3(x, 0, t));
		label(ctx, L(0, 1.78), 't', 14, 4, la);
		label(ctx, L(2.95, 0), 'x', -4, -18, la);
	}
	label(ctx, O, 'O', 16, 22, span(a, 0.5, 1) * (1 - span(u, 0.78, 0.86)));

	captions(ctx, w, h, u, [
		...TUNNEL_NOTES,
		[0, 'x² + y² = t² :  the tunnel was a light cone, end on', 0.07, 0.15, 0.44, 0.48],
		[1, 'side on:  t up, x across, light at 45°', 0.31, 0.38, 0.44, 0.48],
		[0, 'U = arctan(t − x),   V = arctan(t + x)', 0.5, 0.58],
		[1, 'light stays at 45°:  it is conformal', 0.6, 0.66],
		[2, 'every inertial worldline ends at i^{+}', 0.72, 0.79]
	]);

	// The light: the tunnel's, at O; then O's light rides the worldline up.
	const now = side ? view.to(pen(0, tNow, s)) : O;
	const fadeNow = 1 - span(nowT, 1.25, 1.5);
	centreLight(ctx, w, h, now[0], now[1], u, hit, {
		size: lerp(1, 0.7, span(u, 0.42, 0.6)),
		alpha: fadeNow
	});
	if (u < hit + 0.02) swimmerAt(ctx, w, h, st, cx, cy);

	// i⁺ lights as the present nears it, and the lens dives at it.
	const ip = view.to(pen(0, 1e9, Math.max(s, 1e-3)));
	const lit = span(nowT, 0.75, 1.4);
	if (side && lit > 0) {
		const r = lerp(5, h / 6, smooth(span(u, 0.8, 1))) * Math.min(1, lit * 1.5);
		glow(ctx, ip[0], ip[1], H * 0.1 * (0.4 + lit), [255, 214, 140], 0.45 * lit);
		portal(ctx, ip[0], ip[1], r, smooth(span(u, 0.84, 1)));
		label(ctx, ip, 'i^{+}', r + 14, -r * 0.62 - 10, span(u, 0.8, 0.88));
	}
}

// ── boost: the net is the sky ────────────────────────────────────────────────
const B_FOV = 40;
// After the hit the net's turn eases out, so its flow is a pure zoom — a pure
// boost — by the time the boost is written up: τ up to τ₁, then
// τ₁ + Δ(1 − e^{−(τ − τ₁)/Δ}), which leaves τ₁ at the same rate (C¹).
const easeTurn = (tau, t1, d = 0.8) => (tau <= t1 ? tau : t1 + d * (1 - Math.exp(-(tau - t1) / d)));
// An arrowhead at q, pointing along from p → q.
function arrow(ctx, p, q, color, a, size = 12) {
	if (a <= 0) return;
	const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
	stroke(ctx, [p, q], { color, width: 2.6, alpha: a });
	stroke(
		ctx,
		[
			[q[0] - size * Math.cos(ang - 0.45), q[1] - size * Math.sin(ang - 0.45)],
			q,
			[q[0] - size * Math.cos(ang + 0.45), q[1] - size * Math.sin(ang + 0.45)]
		],
		{ color, width: 2.6, alpha: a }
	);
}

function boost(ctx, w, h, st) {
	const { u, tau, H, hit } = st;
	const cx = w / 2;
	const cy = h / 2;
	const R0 = 0.42 * H;
	const K = (0.8 * h) / Math.PI;
	const f = h / 2 / Math.tan((B_FOV * Math.PI) / 360);
	const D0 = 1 + (2 * f) / R0; // the lens over the flat board, at the tunnel's scale

	// The board curls into the sky — the celestial sphere round a tiny
	// observer, the board's z at angle θ = 2 arctan|z| from 0 — as the lens
	// closes in; it swings round to see the sphere side on, ∞ ahead on the
	// right; then draws back, and the sphere becomes the event O of a diagram.
	const k = smooth(span(u, hit - 0.02, 0.36));
	const dist =
		lerp(D0, 3.6, smooth(span(u, hit - 0.02, 0.4))) * Math.exp(2.2 * smooth(span(u, 0.52, 0.62)));
	const az = 2.2 * smooth(span(u, 0.28, 0.56));
	const el = 0.3 * Math.sin(Math.PI * span(u, 0.28, 0.64));
	const cam = orbit(w, h, { target: [0, 0, 0], az, el, dist, fov: B_FOV });
	const C = cam.pos;
	const cz = 1 - 1 / Math.max(k, 1e-6); // the curled board's centre
	const behind = (P) =>
		k > 1e-4 && (C[0] - P[0]) * P[0] + (C[1] - P[1]) * P[1] + (C[2] - P[2]) * (P[2] - cz) < 0;
	const S = (p) => {
		const P = curl(p, k);
		const q = cam.project(P);
		return q[2] > NEAR ? [q[0], q[1], behind(P)] : null;
	};

	const sky = 1 - span(u, 0.53, 0.6);
	const p0 = curl([0, 0], k);
	const pInf = curl([Infinity, 0], k);
	const q0 = cam.project(p0);
	const qInf = cam.project(pInf);
	const qO = cam.project([0, 0, 0]);
	if (sky > 0) {
		// The sky as it stood at the hit — the tunnel's net, and the board
		// beyond the frame — carried by the boost since, z ↦ e^{η} z: the
		// pattern drains off 0, behind, and crowds into ∞, ahead.
		// (After the hit the flow eases to 0.55 of the tunnel's pace, which
		// is still gathering: the sphere holds six e-folds of boost, not twelve.)
		const t1 = flown(1);
		const eta = Math.max(0, tau - t1) * lerp(1, 0.55, smooth(span(u, hit, hit + 0.12)));
		const rIn = (2.5 / R0) * Math.exp(eta - 1.5 * k);
		const rOut = lerp(3, 40, k) * Math.exp(eta);
		const te = Math.min(tau, t1 + eta);
		const N = net(te, rIn, rOut, KAPPA * easeTurn(te, t1));
		const lin = Math.log(rIn);
		const lout = Math.log(rOut);
		const edge =
			eta > 0
				? (p) => {
						const l = Math.log(Math.hypot(p[0], p[1]));
						return span(l - lin, 0, 1.4) * span(lout - l, 0, 1.4);
					}
				: null;
		// The sphere's outline, so it stays a sphere as the sky drains off it.
		limb(ctx, cam, span(k, 0.75, 1) * sky * 0.8, [0, 0, cz], 1 / Math.max(k, 1e-6));
		drawNet(ctx, N, S, { lines: sky, rings: sky, seeds: sky, jump: 200, fade: edge });
		// The sky crowds forward: ∞, ahead, brightens as the rapidity grows
		// (the beaming), and the observer at the centre heads for it.
		const ahead = span(u, 0.3, 0.55) * sky;
		if (ahead > 0 && qInf[2] > NEAR) {
			const a = ahead * (behind(pInf) ? 0.35 : 1);
			glow(ctx, qInf[0], qInf[1], H * 0.16, [255, 214, 140], 0.7 * a);
			disc(ctx, qInf[0], qInf[1], 6, { fill: '#fff6e0', alpha: a });
		}
		const ob = span(k, 0.6, 0.95) * sky;
		if (ob > 0) {
			const tip = cam.project([0, 0, -0.55]);
			arrow(ctx, qO, tip, PAL.gold, ob);
			label(ctx, tip, 'v', 10, -14, ob, { size: 22 });
			glow(ctx, qO[0], qO[1], 26, [255, 214, 140], 0.6 * ob);
			disc(ctx, qO[0], qO[1], 5, { fill: PAL.gold, alpha: ob });
		}
		const pl = span(u, 0.36, 0.44) * (1 - span(u, 0.51, 0.55));
		label(ctx, q0, '0', -12, -16, pl * (behind(p0) ? 0.45 : 1));
		label(ctx, qInf, '∞', 14, -16, pl * (behind(pInf) ? 0.45 : 1));
	}

	// The diagram: x along the boost (toward ∞), t up, and the boosted axes.
	const dia = span(u, 0.53, 0.62);
	const eta = 3 * Math.pow(span(u, 0.57, 0.9), 1.4);
	const bt = Math.tanh(eta);
	const s = smooth(span(u, 0.7, 0.87));
	const dv = span(u, 0.82, 1);
	const view = lensOf(w, h, K, Math.exp(1.8 * dv * dv), [0, (Math.PI / 2) * smooth(dv)]);
	const sigNow = rise(u, 0.74, 0.94);
	if (dia > 0) {
		grid(ctx, view, s, dia, { upto: dia, cyan: 0.45, pink: 0.45 });
		axes(ctx, view, s, dia);
		lightRays(ctx, view, s, dia);
		boundary(ctx, view, s, span(s, 0.6, 0.9), false, 1 - span(u, 0.84, 0.9));
		// The hyperbolae t² − x² = ±1, which the boosted unit ticks ride.
		const hy = span(u, 0.57, 0.66);
		if (hy > 0) {
			const arc = [];
			for (let i = 0; i <= 140; i++) {
				const g = lerp(-5, 5, i / 140);
				arc.push([Math.sinh(g), Math.cosh(g)]);
			}
			for (const [m, n, swap] of [
				[1, 1, 0],
				[1, -1, 0],
				[1, 1, 1],
				[-1, 1, 1]
			])
				stroke(
					ctx,
					xt(
						view,
						s,
						arc.map(([a, c]) => (swap ? [m * c, n * a] : [m * a, n * c]))
					),
					{
						color: PAL.rose,
						width: 1.8,
						alpha: 0.85 * hy,
						upto: hy
					}
				);
		}
		// The boosted axes t′ (the moving observer's worldline) and x′, at
		// rapidity η, closing on the light line like scissors.
		const sc = span(u, 0.58, 0.64);
		if (sc > 0) {
			stroke(
				ctx,
				xt(
					view,
					s,
					SIG.map((g) => [bt * g, g])
				),
				{
					color: PAL.gold,
					width: 3.4,
					glow: 6,
					alpha: sc
				}
			);
			stroke(
				ctx,
				xt(
					view,
					s,
					SIG.map((g) => [g, bt * g])
				),
				{
					color: PAL.gold,
					width: 2.2,
					alpha: 0.85 * sc
				}
			);
			for (const P of [
				[Math.sinh(eta), Math.cosh(eta)],
				[Math.cosh(eta), Math.sinh(eta)]
			]) {
				const q = view.to(pen(P[0], P[1], s));
				disc(ctx, q[0], q[1], 5.5, { fill: PAL.chalk, alpha: sc });
			}
			const lt = sc * (1 - span(s, 0.4, 0.8));
			label(ctx, view.to(pen(bt * 1.75, 1.75, s)), 't′', 14, 2, lt);
			label(ctx, view.to(pen(2.9, bt * 2.9, s)), 'x′', -6, -20, lt);
			label(ctx, view.to(pen(0, 1.75, s)), 't', -14, 2, lt);
			label(ctx, view.to(pen(2.9, 0, s)), 'x', -6, 22, lt);
		}
	}

	captions(ctx, w, h, u, [
		...TUNNEL_NOTES,
		[0, 'z = e^{iφ} tan(θ/2) :  the board is the sky', 0.15, 0.23, 0.55, 0.59],
		[1, 'z ↦ e^{η} z  ⇔  a boost toward ∞, rapidity η', 0.3, 0.38, 0.55, 0.59],
		[2, 'PSL(2, ℂ) ≅ SO^{+}(1, 3)', 0.42, 0.47, 0.55, 0.59],
		[0, 't′, x′ :  the boosted frame closes on the light', 0.61, 0.68],
		[1, 'U = arctan(t − x),   V = arctan(t + x)', 0.71, 0.77],
		[2, 'every inertial worldline ends at i^{+}', 0.8, 0.86]
	]);

	// The light: the tunnel's at 0, dimming as the sky streams off it; then
	// the observer's, at O, riding t′ up into i⁺.
	if (sky > 0 && q0[2] > NEAR) {
		const dim = (1 - 0.65 * span(u, 0.25, 0.5)) * sky * (behind(p0) ? 0.4 : 1);
		centreLight(ctx, w, h, q0[0], q0[1], u, hit, { alpha: dim, size: lerp(1, 0.6, k) });
	}
	if (u < hit + 0.02) swimmerAt(ctx, w, h, st, cx, cy);
	if (dia > 0) {
		const q = view.to(pen(bt * sigNow, sigNow, s));
		const fade = dia * (1 - span(Math.atan(sigNow), 1.25, 1.5));
		glow(ctx, q[0], q[1], H * 0.06, [255, 214, 140], 0.7 * fade);
		disc(ctx, q[0], q[1], 6, { fill: '#fff6e0', alpha: fade });
		const ip = view.to([0, Math.PI / 2 / Math.max(s, 1e-3)]);
		const lit = span(Math.atan(sigNow), 0.75, 1.4);
		if (lit > 0) {
			const r = lerp(5, h / 6, smooth(span(u, 0.84, 1))) * Math.min(1, lit * 1.5);
			glow(ctx, ip[0], ip[1], H * 0.1 * (0.4 + lit), [255, 214, 140], 0.45 * lit);
			portal(ctx, ip[0], ip[1], r, smooth(span(u, 0.86, 1)));
			label(ctx, ip, 'i^{+}', r + 14, -r * 0.62 - 10, span(u, 0.84, 0.9));
		}
	}
}

// ── conic: the projective plane ──────────────────────────────────────────────
// Circles about O a factor φ apart: the conics to be.
const CONIC_R = [0.2, 0.32, 0.52, 1.36, 2.2, 3.56];
const FEATURED = 2.2; // the hyperbola both of whose branches are on the board
const G1 = 1.4; // H's last row is (0, g, 1); it sends the line y = −1/g to ∞
const C_FOV = 40;

// Screen runs of a curve: split where S cuts it, where it jumps (through ∞),
// and where it goes behind; written on to `upto` of its points.
function inkRuns(ctx, Q, o, upto = 1, jump = 220) {
	const n = Math.floor(Q.length * clamp01(upto));
	let run = [];
	let back = false;
	const flush = () => {
		if (run.length > 1)
			stroke(
				ctx,
				run,
				back ? { ...o, alpha: o.alpha * 0.3, width: o.width * 0.6, dash: [3, 6] } : o
			);
		run = [];
	};
	for (let i = 0; i < n; i++) {
		const q = Q[i];
		const p = run[run.length - 1];
		if (!q || (p && (Math.hypot(q[0] - p[0], q[1] - p[1]) > jump || !!q[2] !== back))) flush();
		if (!q) continue;
		if (!run.length) back = !!q[2];
		run.push(q);
	}
	flush();
}

function conic(ctx, w, h, st) {
	const { u, tau, H, hit } = st;
	const cx = w / 2;
	const cy = h / 2;
	const R0 = 0.42 * H;
	const f = h / 2 / Math.tan((C_FOV * Math.PI) / 360);

	// H turns on: (x, y, 1) ↦ (x, y, 1 + g y). Then the board closes up: a
	// point [X : Y : W] goes to the sphere of curvature kc tangent at O, at
	// angle θ = arctan(kc·|(X, Y)|/|W|) from O toward ±(X, Y) — the sign of W —
	// so at kc = 1 the plane lies on a hemisphere (central projection) and ℓ∞
	// on its rim, a point at ∞ and its antipode one point: ℝP².
	const g = G1 * smooth(span(u, 0.2, 0.55));
	const kc = smooth(span(u, 0.52, 0.78));
	const tilt = Math.sin(Math.PI * span(u, 0.56, 0.92));
	const dv = span(u, 0.8, 1);
	// (While H acts, the lens pans so O sits a little low: the far branches
	// and Hℓ∞ come in above it, clear of the notes.)
	const pan = 0.21 * smooth(span(u, 0.2, 0.48)) * (1 - smooth(span(u, 0.54, 0.8)));
	const cam = orbit(w, h, {
		target: [0, 0, -pan],
		az: 0.9 * smooth(span(u, 0.5, 1)),
		el: Math.PI / 2 - 0.5 * tilt,
		dist: (f / R0) * (1 - 0.08 * kc) * Math.exp(-1.25 * dv * dv),
		fov: C_FOV
	});
	const C = cam.pos;
	const M3 = (X, Y, W) => {
		const r = Math.hypot(X, Y);
		if (kc < 1e-4) return Math.abs(W) < 1e-9 ? null : [X / W, 0, -Y / W];
		if (r < 1e-12) return [0, 0, 0];
		const sg = W < 0 ? -1 : 1;
		const th = Math.atan2(kc * r, Math.abs(W));
		const k = Math.sin(th) / kc / r;
		return [sg * X * k, (Math.cos(th) - 1) / kc, -sg * Y * k];
	};
	const cyS = -1 / Math.max(kc, 1e-6); // the sphere's centre, (0, cyS, 0)
	const proj = (P) => {
		if (!P) return null;
		const q = cam.project(P);
		if (q[2] <= NEAR) return null;
		const back =
			kc > 1e-4 && (C[0] - P[0]) * P[0] + (C[1] - P[1]) * (P[1] - cyS) + (C[2] - P[2]) * P[2] < 0;
		return [q[0], q[1], back];
	};
	const S = (p) => proj(M3(p[0], p[1], 1 + g * p[1]));
	const O = S([0, 0]);

	// The tunnel's net streams on inside the parabola, where H keeps the
	// plane in front (w > 0), and fades as the conics take the board.
	const netA = 1 - span(u, 0.16, 0.4);
	if (netA > 0) {
		const N = net(tau, 2.5 / R0, 3);
		drawNet(ctx, N, S, {
			lines: netA,
			seeds: netA,
			rings: 1 - span(u, 0.12, 0.22),
			fade: g > 1e-3 ? (p) => 1 - span(Math.hypot(p[0], p[1]) * g, 0.55, 0.92) : null
		});
	}

	// The conics: the circles through H — ellipses (cyan) while they miss ℓ,
	// hyperbolas (pink) once they cross it: two branches, broken where w
	// changes sign, which are one curve through ∞.
	const circle = (r, n = 240) => {
		const out = [];
		for (let i = 0; i <= n; i++) {
			const a = -Math.PI / 2 + (TAU * i) / n;
			out.push(S([r * Math.cos(a), r * Math.sin(a)]));
		}
		return out;
	};
	CONIC_R.forEach((r, i) => {
		const wr = span(u, 0.12 + 0.012 * i, 0.22 + 0.012 * i);
		if (wr <= 0) return;
		const hyp = r * g > 1;
		const bold = r === FEATURED || !hyp;
		inkRuns(
			ctx,
			circle(r),
			{
				color: hyp ? PAL.pink : PAL.cyan,
				width: bold ? (hyp ? 3.2 : 2.6) : 1.4,
				alpha: bold ? 0.95 : lerp(0.55, 0.3, kc)
			},
			wr
		);
	});
	// The circle that just touches ℓ: a parabola.
	const pa = span(g, 0.45, 0.8);
	if (pa > 0) inkRuns(ctx, circle(1 / g, 320), { color: PAL.chalk, width: 3, alpha: 0.95 }, pa);

	// Hℓ∞, the line at infinity brought into view: (x, y, 0) ↦ (x, y, g y),
	// on the board the line Y = 1/g.
	const hl = span(g, 0.75, 1.15);
	const horizon = [];
	for (let i = 1; i < 240; i++) {
		const a = (Math.PI * i) / 240;
		horizon.push(proj(M3(Math.cos(a), Math.sin(a), g * Math.sin(a))));
	}
	if (hl > 0) inkRuns(ctx, horizon, { color: PAL.chalk, width: 2.4, alpha: 0.9 * hl, glow: 3 }, hl);
	// ℓ∞ itself, once the board closes up: the rim.
	const rimA = span(kc, 0.35, 0.8);
	if (rimA > 0) {
		const rim = [];
		for (let i = 0; i <= 240; i++)
			rim.push(proj(M3(Math.cos((TAU * i) / 240), Math.sin((TAU * i) / 240), 0)));
		inkRuns(ctx, rim, { color: PAL.chalk, width: 2.6, alpha: 0.9 * rimA }, 1, 1e9);
		label(ctx, proj(M3(-0.75, 0.66, 0)), 'ℓ_{∞}', -16, -14, rimA);
	}
	// Where one hyperbola meets ℓ∞: the circle r = 1.36 crosses ℓ at
	// (±x, −1/g), which H sends to the points at ∞ in those directions —
	// each on the rim twice, at P and −P, which are one point.
	const rf = FEATURED;
	const mk = span(kc, 0.55, 0.95) * (g * rf > 1.02 ? 1 : 0);
	if (mk > 0) {
		const xc = Math.sqrt(rf * rf - 1 / (g * g));
		for (const [sx, name] of [
			[1, 'P'],
			[-1, 'Q']
		]) {
			const a = proj(M3(sx * xc, -1 / g, 1e-9));
			const b = proj(M3(sx * xc, -1 / g, -1e-9));
			if (a && b) {
				stroke(ctx, [a, b], { color: PAL.rose, width: 1.6, alpha: 0.7 * mk, dash: [5, 7] });
				for (const q of [a, b]) {
					disc(ctx, q[0], q[1], 7.5, {
						fill: PAL.chalk,
						alpha: mk,
						ring: PAL.pink,
						ringWidth: 2.5
					});
					const dx = q[0] - cx;
					const dy = q[1] - cy;
					const l = Math.hypot(dx, dy) || 1;
					label(ctx, [q[0] + (dx / l) * 22, q[1] + (dy / l) * 22], name, dx < 0 ? -2 : 2, 6, mk, {
						size: 26
					});
				}
			}
		}
	}

	// Names, by the curves: an ellipse, the parabola, a hyperbola.
	const nm = span(g, 1, 1.3) * (1 - span(kc, 0.3, 0.6));
	if (nm > 0) {
		const on = (r, a) => S([r * Math.cos(a), r * Math.sin(a)]);
		label(ctx, on(0.52, -0.35), 'ellipse', 12, 12, nm, { color: PAL.cyan, size: 22 });
		label(ctx, on(1 / g, 3.75), 'parabola', -14, 4, nm, { size: 22 });
		label(ctx, on(FEATURED, 0.32), 'hyperbola', 12, -12, nm, { color: PAL.pink, size: 22 });
		label(ctx, on(FEATURED, -Math.PI / 2), 'its other branch', 12, -14, nm, {
			color: PAL.pink,
			size: 22
		});
		label(ctx, horizon[200], 'Hℓ_{∞}', 0, -18, nm);
	}

	captions(ctx, w, h, u, [
		...TUNNEL_NOTES,
		[0, 'x ↦ Hx :   (x, y, 1) ↦ (x, y, 1 + gy)', 0.2, 0.27],
		[1, 'Hℓ_{∞} :  the line at infinity, brought into view', 0.38, 0.45, 0.58, 0.62],
		[1, 'a hyperbola is an ellipse that crosses ℓ_{∞}', 0.63, 0.7],
		[2, 'ℝP² :  close up the plane, glue P ∼ −P', 0.76, 0.83]
	]);

	// The light: the tunnel's at O, which H and the closing-up both keep
	// where it is — the pole; the lens dives at it.
	if (O) {
		centreLight(ctx, w, h, O[0], O[1], u, hit, { size: lerp(1, 0.75, span(u, 0.3, 0.6)) });
		if (u < hit + 0.02) swimmerAt(ctx, w, h, st, cx, cy);
		const pr = smooth(span(u, 0.8, 1));
		if (pr > 0) portal(ctx, O[0], O[1], lerp(8, h / 6, pr), pr);
	}
}

// ── cayley: the disc, the half-plane, spacetime ──────────────────────────────
// M_θ(ζ) = (cos(θ/2) ζ + sin(θ/2)) / (−sin(θ/2) ζ + cos(θ/2)): the turn of
// the Riemann sphere by θ about the axis through ±i (which it fixes). At
// θ = π/2 it is the Cayley map (1 + ζ)/(1 − ζ), the disc onto the half-plane
// Re > 0, the unit circle onto its edge, 0 to 1 and 1 to ∞.
function turnAboutI(z, th) {
	const c = Math.cos(th / 2);
	const s = Math.sin(th / 2);
	const nr = c * z[0] + s;
	const ni = c * z[1];
	const dr = c - s * z[0];
	const di = -s * z[1];
	const d = dr * dr + di * di;
	if (d < 1e-12) return null;
	return [(nr * dr + ni * di) / d, (ni * dr - nr * di) / d];
}

function cayley(ctx, w, h, st) {
	const { u, tau, H, hit } = st;
	const cx = w / 2;
	const cy = h / 2;
	const R0 = 0.42 * H;
	const RD = 0.36 * H; // the disc's radius on the board, px
	const rd = RD / R0; // and in plate units
	const KT = (0.85 * h) / Math.PI; // the triangle's scale: i⁻ to i⁺ is π

	// The quarter turn; the lens slides so the half-plane's edge lands where
	// the triangle's will be; then the squeeze; then the dive at i⁺.
	const th = (Math.PI / 2) * smooth(span(u, 0.26, 0.52));
	const x0 = cx + 90 - (KT * Math.PI) / 4; // a little right, clear of the notes
	const ox = lerp(cx, x0, smooth(span(u, 0.26, 0.56)));
	const s = smooth(span(u, 0.58, 0.8));
	const sc = lerp(RD, KT, smooth(span(u, 0.56, 0.8)));
	const dv = span(u, 0.8, 1);
	const d = smooth(dv);
	const Z = Math.exp(1.8 * dv * dv);
	const A = [lerp(ox, cx, d), cy];
	const F = [0, (Math.PI / 2) * d];
	const view = { to: ([X, T]) => [A[0] + sc * Z * (X - F[0]), A[1] - sc * Z * (T - F[1])] };
	// A point of the board: ζ = p / rd in the disc, w = M_θ(ζ) = r + it,
	// squeezed by s.
	const S = (p) => {
		const m = turnAboutI([p[0] / rd, p[1] / rd], th);
		if (!m || !Number.isFinite(m[0]) || Math.abs(m[0]) + Math.abs(m[1]) > 1e6) return null;
		const q = view.to(pen(m[0], m[1], s));
		return [q[0], q[1], false];
	};

	// The net streams on inside the disc — outside it fades, and the rim
	// takes it — through the turn and the squeeze.
	const outA = span(u, 0.1, 0.24);
	const N = net(tau, 2.5 / R0, Math.max(rd * 1.05, 3 * (1 - outA)));
	const flat = span(u, 0.26, 0.6);
	const netA = 1 - 0.45 * span(u, 0.6, 0.75);
	drawNet(ctx, N, S, {
		jump: 180,
		lines: netA,
		seeds: netA,
		seedMax: lerp(42, 9, flat),
		widthMax: lerp(4.2, 2.6, flat),
		fade: (p) => {
			const z = Math.hypot(p[0], p[1]) / rd;
			return z < 1 ? 1 - span(z, 0.93, 1) * outA : 1 - outA;
		}
	});

	// The disc's rim — through the turn, circles through ±i — and at the last
	// the half-plane's edge, r = 0.
	const rimA = span(u, 0.1, 0.2);
	const rim = [];
	for (let i = 0; i <= 360; i++) {
		const a = (TAU * i) / 360;
		rim.push(S([rd * Math.cos(a), rd * Math.sin(a)]));
	}
	inkRuns(ctx, rim, { color: PAL.chalk, width: 2.6, alpha: 0.9 }, rimA, 300);
	// The line t = 0 (the plate's axis): r from the edge out to ∞.
	const ax = span(u, 0.5, 0.58);
	if (ax > 0) {
		const P = [];
		for (let i = 0; i <= 200; i++) P.push(view.to(pen(Math.tan((1.566 * i) / 200), 0, s)));
		stroke(ctx, P, { color: PAL.chalk, width: 2, alpha: 0.75 * ax, upto: ax });
	}
	// The turn's fixed points ±i.
	const fx = span(u, 0.24, 0.3) * (1 - span(u, 0.52, 0.58));
	if (fx > 0)
		for (const [y, name] of [
			[1, 'i'],
			[-1, '−i']
		]) {
			const q = view.to(pen(0, y, s));
			disc(ctx, q[0], q[1], 5, { fill: PAL.chalk, alpha: fx });
			label(ctx, q, name, 14, y > 0 ? -12 : 14, fx);
		}

	// Read as spacetime: the edge is r = 0, t runs up it, r across.
	const rs = span(u, 0.5, 0.58) * (1 - span(u, 0.66, 0.72));
	if (rs > 0) {
		label(ctx, view.to(pen(0, 1.15, s)), 'r = 0', -14, 0, rs);
		label(ctx, view.to(pen(0, 1.55, s)), 't', 14, 0, rs);
		label(ctx, view.to(pen(2.2, 0, s)), 'r', 0, -18, rs);
	}
	// The squeeze: a faint grid of constant t and constant r, and the
	// triangle's edges at infinity.
	if (u > 0.56) {
		grid(ctx, view, s, span(u, 0.56, 0.66), { half: true, cyan: 0.28, pink: 0.28 });
		lightRays(ctx, view, s, span(u, 0.58, 0.66), true);
		boundary(ctx, view, s, span(s, 0.6, 0.9), true, 1 - span(u, 0.82, 0.88));
	}
	// The tunnel's centre went to r = 1, t = 0; at rest there, its worldline
	// runs up to i⁺ — gold, written on as the squeeze begins.
	const wl = span(u, 0.6, 0.7);
	const tNow = rise(u, 0.66, 0.94);
	const nowT = Math.atan(tNow);
	if (wl > 0) {
		const line = (T0, T1) => {
			const out = [];
			for (let i = 0; i <= 90; i++) out.push(view.to(pen(1, Math.tan(lerp(T0, T1, i / 90)), s)));
			return out;
		};
		stroke(ctx, line(-1.5705, nowT), { color: PAL.gold, width: 3.4, glow: 6, alpha: wl, upto: wl });
		stroke(ctx, line(nowT, 1.5705), { color: PAL.gold, width: 2.2, alpha: 0.7 * wl, dash: [7, 9] });
	}

	captions(ctx, w, h, u, [
		...TUNNEL_NOTES,
		[0, '|z| < 1 :  the tunnel’s disc', 0.13, 0.2, 0.5, 0.54],
		[1, 'z ↦ (1 + z) / (1 − z) :  disc → half-plane', 0.28, 0.35, 0.6, 0.64],
		[2, 'a quarter turn of the sphere about ±i', 0.4, 0.46, 0.6, 0.64],
		[0, 'read r + it as spacetime:  r ≥ 0, t', 0.54, 0.6],
		[1, 'U = arctan(t − r),   V = arctan(t + r)', 0.64, 0.7],
		[2, 'every worldline at rest ends at i^{+}', 0.78, 0.84]
	]);

	// The light: the tunnel's centre, carried to r = 1, then up into i⁺.
	const O = S([0, 0]);
	const now = view.to(pen(1, tNow, s));
	const fadeNow = 1 - span(nowT, 1.25, 1.5);
	if (O)
		centreLight(ctx, w, h, wl > 0 ? now[0] : O[0], wl > 0 ? now[1] : O[1], u, hit, {
			size: lerp(1, 0.75, span(u, 0.3, 0.6)),
			alpha: fadeNow
		});
	if (u < hit + 0.02) swimmerAt(ctx, w, h, st, cx, cy);
	const ip = view.to([0, Math.PI / 2 / Math.max(s, 1e-3)]);
	const lit = span(nowT, 0.75, 1.4);
	if (lit > 0) {
		const r = lerp(5, h / 6, smooth(span(u, 0.82, 1))) * Math.min(1, lit * 1.5);
		glow(ctx, ip[0], ip[1], H * 0.1 * (0.4 + lit), [255, 214, 140], 0.45 * lit);
		portal(ctx, ip[0], ip[1], r, smooth(span(u, 0.86, 1)));
		label(ctx, ip, 'i^{+}', r + 14, -r * 0.62 - 10, span(u, 0.84, 0.9));
	}
}

// ── einstein: the tunnel was a cylinder ──────────────────────────────────────
// w = log z rolls the punctured plane onto a cylinder, conformally, through
// the cones ρ = e^{βs}, height (e^{βs}√(1 − β²) − 1)/β: β = 1 the plane, β → 0
// the tube (each cone keeps the net's right angles). Stood on end, with time
// up it and space round it, the tube is ℝ × S¹ — Einstein's static universe
// in one dimension of space — on which 1+1 Minkowski space is, conformally,
// the diamond |T| + |χ| < π: the Penrose diagram wrapped round, χ = 2X and
// T = 2T from pen(), so its two corners at spatial infinity are the one point
// at the back.
const E_FOV = 40;
function rollUp(p, beta) {
	const r = Math.hypot(p[0], p[1]);
	if (r < 1e-12) return null;
	const sg = Math.log(r);
	const rho = Math.exp(beta * sg);
	const hh = beta < 1e-4 ? sg : (rho * Math.sqrt(1 - beta * beta) - 1) / beta;
	return [(rho * p[0]) / r, -hh - 1, (rho * p[1]) / r];
}
// The cylinder's point at time T and angle χ (χ = 0 faces the lens).
const esu = (T, chi) => [Math.sin(chi), T, Math.cos(chi)];

function einstein(ctx, w, h, st) {
	const { u, tau, H, hit } = st;
	const cx = w / 2;
	const cy = h / 2;
	const R0 = 0.42 * H;
	const f = h / 2 / Math.tan((E_FOV * Math.PI) / 360);
	const D0 = f / R0; // under the plane, at the tunnel's scale

	// The roll; then the lens backs out and round to see the tube stood up;
	// a turn round the back of it; and in at i⁺.
	const roll = smooth(span(u, hit - 0.01, 0.29));
	const beta = 1 - roll;
	const swing = smooth(span(u, 0.3, 0.56));
	const round = smooth(span(u, 0.6, 0.86));
	const dv = span(u, 0.82, 1);
	const dd = smooth(dv);
	const target = [0, Math.PI * dd, dd];
	const cam = orbit(w, h, {
		target,
		az: TAU * round,
		el: lerp(-Math.PI / 2, 0.14, swing) + 0.12 * dd,
		dist: lerp(D0, 9.5, Math.sqrt(swing)) * Math.exp(-1.7 * dv * dv),
		fov: E_FOV
	});
	const C = cam.pos;
	const onTube = roll > 0.999;
	// Behind the tube? Where the sight line from P to the lens crosses the
	// cylinder again (the quadratic's other root), if that is between them
	// and within the tube's drawn length, P is hidden — so from inside, or
	// through an open end, the far wall shows.
	const hiddenIn = (P, yLo, yHi) => {
		const dx = C[0] - P[0];
		const dz = C[2] - P[2];
		const a = dx * dx + dz * dz;
		if (a < 1e-12) return false;
		const t = (-2 * (P[0] * dx + P[2] * dz)) / a;
		if (t <= 1e-4 || t >= 1) return false;
		const y = P[1] + t * (C[1] - P[1]);
		return y > yLo && y < yHi;
	};
	const tubeLo = -Math.log(3) - 1;
	const tubeHi = -Math.log(2.5 / R0) - 1;
	const proj = (P, test = 'esu') => {
		if (!P) return null;
		const q = cam.project(P);
		if (q[2] <= NEAR) return null;
		const back =
			test === 'esu'
				? hiddenIn(P, -3.6, 3.6)
				: test === 'tube'
					? hiddenIn(P, tubeLo, tubeHi)
					: false;
		return [q[0], q[1], back];
	};
	const behind = (P) => hiddenIn(P, -3.6, 3.6);
	const S = (p) => proj(rollUp(p, beta), onTube ? 'tube' : null);

	// The tunnel's net, rolled up, streaming on down the tube; it gives way
	// to the diamond.
	const netA = 1 - span(u, 0.5, 0.64);
	if (netA > 0)
		drawNet(ctx, net(tau, 2.5 / R0, 3), S, {
			lines: netA,
			rings: netA,
			seeds: netA,
			jump: 220,
			seedMax: lerp(42, 16, swing)
		});

	// The universe: the cylinder's outline, and the diamond on it.
	const uni = span(u, 0.4, 0.52) * (1 - span(u, 0.84, 0.94));
	const dia = span(u, 0.5, 0.62);
	const at = (x, t) => {
		const [X, T] = pen(x, t, 1);
		return esu(2 * T, 2 * X);
	};
	if (uni > 0) {
		for (const T of [-3.6, 3.6]) {
			const ring = [];
			for (let i = 0; i <= 120; i++) ring.push(proj(esu(T, (TAU * i) / 120)));
			inkRuns(ctx, ring, { color: PAL.rose, width: 1.8, alpha: 0.7 * uni }, 1, 1e9);
		}
		// the silhouette: where the lens's sight grazes the tube
		const a0 = Math.atan2(C[0], C[2]);
		const dC = Math.hypot(C[0], C[2]);
		if (dC > 1.01) {
			const g = Math.acos(1 / dC);
			for (const sg of [-1, 1]) {
				const chi = a0 + sg * g;
				stroke(ctx, [proj(esu(-3.6, chi)), proj(esu(3.6, chi))].filter(Boolean), {
					color: PAL.rose,
					width: 1.8,
					alpha: 0.7 * uni
				});
			}
		}
	}
	if (dia > 0) {
		for (const g of [0, ...GRID, ...GRID.map((x) => -x)]) {
			const axis = g === 0;
			inkRuns(
				ctx,
				SIG.map((x) => proj(at(x, g))),
				{
					color: axis ? PAL.chalk : PAL.cyan,
					width: axis ? 2 : 1.5,
					alpha: dia * (axis ? 0.75 : 0.6)
				},
				dia,
				300
			);
			inkRuns(
				ctx,
				SIG.map((t) => proj(at(g, t))),
				{
					color: axis ? PAL.chalk : PAL.pink,
					width: axis ? 2 : 1.5,
					alpha: dia * (axis ? 0.75 : 0.6)
				},
				dia,
				300
			);
		}
		// Light through O, and the boundary: four 45° helices, i⁺ and i⁻ in
		// front, the two corners at spatial infinity one point round the back.
		const helix = (T0, c0, T1, c1) => {
			const out = [];
			for (let i = 0; i <= 120; i++)
				out.push(proj(esu(lerp(T0, T1, i / 120), lerp(c0, c1, i / 120))));
			return out;
		};
		for (const [a, b] of [
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]
		]) {
			inkRuns(ctx, helix(0, 0, (a * Math.PI) / 2, (b * Math.PI) / 2), {
				color: PAL.chalk,
				width: 2.4,
				alpha: 0.9 * dia,
				glow: 4
			});
			inkRuns(
				ctx,
				helix(a * Math.PI, 0, 0, b * Math.PI),
				{ color: PAL.chalk, width: 2.6, alpha: 0.95 * dia },
				dia
			);
		}
		const lab = dia * (1 - span(u, 0.86, 0.92));
		const L = (P, s, dx, dy) => {
			const q = proj(P);
			if (q) label(ctx, q, s, dx, dy, lab * (q[2] ? 0.35 : 1));
		};
		L(esu(Math.PI, 0), 'i^{+}', 16, -12);
		L(esu(-Math.PI, 0), 'i^{−}', 16, 16);
		L(esu(0, Math.PI), 'i^{0}', 14, -14);
		for (const sg of [-1, 1]) {
			L(esu(Math.PI / 2, (sg * Math.PI) / 2), 'ℐ^{+}', sg * 14, -14);
			L(esu(-Math.PI / 2, (sg * Math.PI) / 2), 'ℐ^{−}', sg * 14, 16);
		}
	}

	captions(ctx, w, h, u, [
		...TUNNEL_NOTES,
		[0, 'w = log z :  the tunnel was a cylinder', 0.15, 0.22, 0.62, 0.66],
		[1, 'time up it:  ℝ × S¹, Einstein’s universe', 0.36, 0.43],
		[2, 'Minkowski ≅ |T| + |χ| < π on it', 0.52, 0.58],
		[0, 'and its two i^{0} are one point', 0.68, 0.74]
	]);

	// The light: down the tube at its far end (the tunnel's centre); as the
	// diamond comes it settles on i⁺, its worldline at rest (x = 0) drawn up
	// the front; and the lens dives at it.
	const top = [0, 3.9, 0];
	const ip = esu(Math.PI, 0);
	const k = smooth(span(u, 0.5, 0.64));
	const L3 = [lerp(top[0], ip[0], k), lerp(top[1], ip[1], k), lerp(top[2], ip[2], k)];
	const ql = proj(L3, null);
	const wl = span(u, 0.6, 0.7);
	if (wl > 0)
		inkRuns(
			ctx,
			SIG.filter((t) => t > -1e9).map((t) => proj(at(0, t))),
			{ color: PAL.gold, width: 3.4, glow: 6, alpha: wl },
			wl,
			300
		);
	if (ql) {
		const back = k > 0.5 && behind(L3);
		centreLight(ctx, w, h, ql[0], ql[1], u, hit, {
			size: lerp(1, 0.7, span(u, 0.3, 0.6)),
			alpha: back ? 0.3 : 1
		});
		const pr = smooth(span(u, 0.82, 1));
		if (pr > 0) {
			portal(ctx, ql[0], ql[1], lerp(8, h / 6, pr), pr);
			label(
				ctx,
				ql,
				'i^{+}',
				lerp(8, h / 6, pr) + 14,
				-lerp(8, h / 6, pr) * 0.62 - 10,
				span(u, 0.86, 0.92)
			);
		}
	}
	if (u < hit + 0.02) swimmerAt(ctx, w, h, st, cx, cy);
}
