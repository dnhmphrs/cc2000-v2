// ── The plate ────────────────────────────────────────────────────────────────
// The construction behind the golden-spiral plate and the loxodrome plate: the
// unit circle, the axis through it, and the two lenses — circles of the pencil
// through the pole and each end of the axis — with the little Apollonian
// circles round the pole and the Θ that marks it. Drawn faint, in rose, as
// the construction lines a lecture leaves on the board, and written on with
// `upto` (0..1).

import { PAL, TAU, stroke, disc, math, span } from './board.js';

// A circle as math points.
export function circlePts(cx, cy, r, a0 = 0, a1 = TAU, n = 160) {
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const a = a0 + ((a1 - a0) * i) / n;
		pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
	}
	return pts;
}

// The arc of the circle through P, Q bulging to one side by `bulge` (the
// height of the arc's midpoint above the chord, signed).
export function arcThrough(P, Q, bulge, n = 120) {
	const mx = (P[0] + Q[0]) / 2;
	const my = (P[1] + Q[1]) / 2;
	const dx = Q[0] - P[0];
	const dy = Q[1] - P[1];
	const L = Math.hypot(dx, dy);
	const nx = -dy / L;
	const ny = dx / L;
	const h = bulge;
	const half = L / 2;
	const R = (half * half + h * h) / (2 * Math.abs(h) || 1e-9);
	const sgn = Math.sign(h) || 1;
	// The centre is on the far side of the chord from the bulge.
	const cx = mx - nx * (R - Math.abs(h)) * sgn;
	const cy = my - ny * (R - Math.abs(h)) * sgn;
	let a0 = Math.atan2(P[1] - cy, P[0] - cx);
	let a1 = Math.atan2(Q[1] - cy, Q[0] - cx);
	const am = Math.atan2(my + ny * h - cy, mx + nx * h - cx);
	// Go from P to Q the way that passes the bulge's midpoint.
	const norm = (a) => ((a % TAU) + TAU) % TAU;
	const ccw = norm(am - a0) < norm(a1 - a0);
	if (ccw) {
		if (a1 < a0) a1 += TAU;
	} else if (a1 > a0) a1 -= TAU;
	return circlePts(cx, cy, R, a0, a1, n);
}

// The whole construction through `view`, the unit circle at radius `R` math
// units round `c`. `upto` writes it on; `alpha` fades it.
export function drawPlate(
	ctx,
	view,
	{ c = [0, 0], R = 1, upto = 1, alpha = 1, labels = true, theta = true } = {}
) {
	const at = (x, y) => [c[0] + x * R, c[1] + y * R];
	const T = (pts) => pts.map(view.to);
	const rose = { color: PAL.rose, width: 2, alpha: 0.85 * alpha };
	const faint = { color: PAL.rose, width: 1.6, alpha: 0.6 * alpha };
	stroke(ctx, T(circlePts(c[0], c[1], R)), { ...rose, upto: span(upto, 0, 0.45) });
	stroke(ctx, T([at(-1, 0), at(1, 0)]), {
		...rose,
		alpha: 0.6 * alpha,
		upto: span(upto, 0.1, 0.4)
	});
	// The lenses: circles of the pencil through the pole and either end.
	const L = span(upto, 0.3, 0.8);
	for (const s of [-1, 1]) {
		const P = at(s, 0);
		const O = at(0.02 * s, 0);
		stroke(ctx, T(arcThrough(P, O, 0.32 * R)), { ...faint, upto: L });
		stroke(ctx, T(arcThrough(P, O, -0.32 * R)), { ...faint, upto: L });
	}
	// And small Apollonian circles round the pole.
	const A = span(upto, 0.6, 1);
	for (const [r, x] of [
		[0.085, -0.03],
		[0.05, -0.02],
		[0.028, -0.012]
	]) {
		stroke(ctx, T(circlePts(c[0] + x * R, c[1], r * R)), { ...faint, upto: A });
	}
	if (theta && A > 0) {
		const [tx, ty] = view.to(at(0.1, 0.07));
		const rr = 13;
		ctx.save();
		ctx.globalAlpha = A * alpha;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.ellipse(tx, ty, rr * 0.78, rr, 0, 0, TAU);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(tx - rr * 0.42, ty);
		ctx.lineTo(tx + rr * 0.42, ty);
		ctx.stroke();
		ctx.restore();
		const [px, py] = view.to(at(0.04, 0));
		disc(ctx, px, py, 7, { fill: PAL.node, alpha: A * alpha });
	}
	if (labels && upto > 0.9) {
		const la = span(upto, 0.9, 1) * alpha;
		const [ax, ay] = view.to(at(-1, 0));
		const [bx, by] = view.to(at(1, 0));
		math(ctx, 'A', ax - 14, ay - 14, { size: 17, alpha: la, align: 'right' });
		math(ctx, 'B', bx + 14, by - 14, { size: 17, alpha: la });
	}
}
