// ── The swimmer, as a helix that turns on its own axis ───────────────────────
// A sperm in 3D: a teardrop head on an axis, and behind it a tail that is a
// HELIX about that axis — its envelope nothing at the head and widening to the
// tip, a few turns long — spun about the axis as it swims, so the tail
// corkscrews the way a flagellum does. Nothing wobbles sideways: the only
// motion is the spin about the axis and the swim along it, which is what a
// turning spiral looks like from any side. Drawn in ink: chalk line, heavier
// near the head, a little gold at the head's core.
//
// A pose is { at, axis, spin, size }: `at` the head's centre (world), `axis`
// the unit direction it swims in (the tail trails the other way), `spin` the
// tail's turn about the axis, radians (advance it on the run's clock), `size`
// the head's length (world units; the tail is TAIL × that). Draw it with a
// camera3 (board.js) — any lens — and, optionally, a depth buffer (space.js
// makeDepth) so a surface can hide it.

import { PAL, TAU, norm, cross, sub3, add3, mul3, disc, bloom } from './board.js';
import { line3 } from './space.js';

export const HELIX = {
	tail: 6.5, // tail length, in heads
	turns: 2.6, // helix turns down the tail
	amp: 0.55, // the envelope's radius at the tip, in heads
	envelope: 0.85, // amp grows as s^envelope from the head
	n: 150, // tail samples
	headW: 0.55 // head width / length
};

// Two unit vectors across `axis`.
function frame(axis) {
	const a = norm(axis);
	const ref = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	const e1 = norm(cross(a, ref));
	const e2 = cross(a, e1);
	return { a, e1, e2 };
}

// The tail's points, head to tip, world.
export function helixTail({ at, axis, spin = 0, size = 1 }, o = {}) {
	const H = { ...HELIX, ...o };
	const { a, e1, e2 } = frame(axis);
	const L = H.tail * size;
	const pts = [];
	for (let i = 0; i <= H.n; i++) {
		const s = i / H.n;
		const r = H.amp * size * Math.pow(s, H.envelope);
		const th = TAU * H.turns * s + spin;
		const p = add3(
			sub3(at, mul3(a, L * s + 0.35 * size)),
			add3(mul3(e1, r * Math.cos(th)), mul3(e2, r * Math.sin(th)))
		);
		pts.push(p);
	}
	return pts;
}

// The head: a teardrop along the axis — an ellipse on screen, oriented by the
// projected axis, a little longer than wide, with a hot core.
function drawHead(ctx, cam, pose, o) {
	const { at, axis, size } = pose;
	const { a } = frame(axis);
	const P0 = cam.project(at);
	if (!P0 || P0[2] <= 0) return;
	const P1 = cam.project(add3(at, mul3(a, 0.5 * size)));
	const P2 = cam.project(sub3(at, mul3(a, 0.5 * size)));
	if (!P1 || !P2) return;
	// Screen-space length and direction of the head's axis.
	const dx = P1[0] - P2[0];
	const dy = P1[1] - P2[1];
	const len = Math.hypot(dx, dy);
	// `len` is one head-length on screen at the head's depth.
	const wpx = Math.max(1.5, HELIX.headW * len);
	const lpx = Math.max(wpx, len * 0.5);
	const ang = Math.atan2(dy, dx);
	ctx.save();
	ctx.translate(P0[0], P0[1]);
	ctx.rotate(ang);
	ctx.globalAlpha = o.alpha;
	// The teardrop: a fuller front, a narrowing back.
	ctx.beginPath();
	ctx.moveTo(lpx, 0);
	ctx.bezierCurveTo(lpx, wpx * 0.9, -lpx * 0.3, wpx, -lpx, 0);
	ctx.bezierCurveTo(-lpx * 0.3, -wpx, lpx, -wpx * 0.9, lpx, 0);
	ctx.closePath();
	ctx.fillStyle = o.fill;
	ctx.fill();
	ctx.lineWidth = Math.max(1, wpx * 0.12);
	ctx.strokeStyle = o.color;
	ctx.stroke();
	ctx.restore();
	if (o.core > 0)
		disc(ctx, P0[0] + dx * 0.12, P0[1] + dy * 0.12, wpx * 0.32, {
			fill: PAL.gold,
			alpha: o.alpha * o.core
		});
	if (o.glow > 0) bloom(ctx, P0[0], P0[1], wpx * 5, 'rgba(245, 193, 80, 0.3)', o.alpha * o.glow);
}

// Draw the swimmer. `body` 0..1 writes the tail out from the head; `alpha`
// fades it; `depth` (makeDepth) hides it behind a surface; `width` the tail's
// width at the head, px at the head's depth scaled by distance.
export function drawHelix(ctx, cam, pose, o = {}) {
	const {
		body = 1,
		alpha = 1,
		color = PAL.chalk,
		fill = 'rgba(21, 21, 21, 0.9)',
		core = 0.9,
		glow = 0,
		width = 3,
		depth = null,
		helix = {}
	} = o;
	if (alpha <= 0 || !pose) return;
	const n = Math.max(2, Math.round(HELIX.n * Math.max(0, Math.min(1, body))));
	const tail = helixTail(pose, { ...helix, n: HELIX.n }).slice(0, n + 1);
	// The tail thins to the tip and fades a little with it.
	const fade = (_, i) => 1 - 0.55 * (i / HELIX.n);
	line3(ctx, cam, tail, { color, width, alpha: alpha * 0.95 }, { depth, fade });
	drawHead(ctx, cam, pose, { alpha, color, fill, core, glow });
}

// A pose along a path: the head at path(u), the axis its tangent (forward),
// spin from the clock. `path` gives world points for u in [0, 1].
export function poseOn(path, u, spin, size = 1, du = 0.002) {
	const p0 = path(Math.max(0, u - du));
	const p1 = path(Math.min(1, u + du));
	const axis = norm(sub3(p1, p0));
	return { at: path(u), axis, spin, size };
}
