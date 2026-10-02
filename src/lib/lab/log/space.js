// ── Space: the 3D hand of the log sketches ───────────────────────────────────
// What the log sketches need to draw surfaces and lines in 3D on the 2D board,
// lifted from log-mobius.js so every sketch draws its spheres, tubes and tori
// the same way: a lens that orbits a target and can look straight down; key-
// framed paths that start at rest and only gather pace; a small software depth
// buffer of a surface, so a line knows when the surface is in front of it; 3D
// polylines cut at the near plane and split where they go behind, painted
// bold in front (thicker the nearer) and faint and dashed behind, as the
// Atlas draws its plates; and the stereographic sphere the boards curl into.
//
// Everything takes a camera from board.js's camera3 (or orbit, below), whose
// project(p) gives [sx, sy, depth] in CSS pixels.

import {
	PAL,
	TAU,
	stroke,
	disc,
	bloom,
	math,
	lerp,
	camera3,
	add3,
	sub3,
	mul3,
	cross,
	norm
} from './board.js';

// Points nearer the lens than this are behind it, for every helper here.
export const NEAR = 0.05;

export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ── Paths ────────────────────────────────────────────────────────────────────
// A C¹ curve through keyframes [[u, value], …]: Catmull–Rom tangents, at rest
// at the first key and still moving at the last, so a path only gathers pace.
export function spline(u, keys) {
	const n = keys.length;
	if (u <= keys[0][0]) return keys[0][1];
	if (u >= keys[n - 1][0]) return keys[n - 1][1];
	let i = 0;
	while (u > keys[i + 1][0]) i++;
	const tan = (j) => {
		if (j === 0) return 0;
		if (j === n - 1) return (keys[j][1] - keys[j - 1][1]) / (keys[j][0] - keys[j - 1][0]);
		return (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]);
	};
	const [u0, v0] = keys[i];
	const [u1, v1] = keys[i + 1];
	const H = u1 - u0;
	const t = (u - u0) / H;
	const t2 = t * t;
	const t3 = t2 * t;
	return (
		(2 * t3 - 3 * t2 + 1) * v0 +
		(t3 - 2 * t2 + t) * tan(i) * H +
		(-2 * t3 + 3 * t2) * v1 +
		(t3 - t2) * tan(i + 1) * H
	);
}
// The same, for keyframed 3D points.
export const spline3 = (u, keys) =>
	[0, 1, 2].map((c) =>
		spline(
			u,
			keys.map(([k, p]) => [k, p[c]])
		)
	);

// ── The lens ─────────────────────────────────────────────────────────────────
// On a sphere of directions round `target`: azimuth about y, then elevation;
// `up` is the direction of increasing elevation, so the lens can look
// straight down without losing its bearings.
export function orbit(w, h, { target = [0, 0, 0], az = 0, el = 0, dist = 4, fov = 40 }) {
	const ce = Math.cos(el);
	const se = Math.sin(el);
	const ca = Math.cos(az);
	const sa = Math.sin(az);
	const dir = [sa * ce, se, ca * ce];
	const up = [-sa * se, ce, -ca * se];
	return camera3({ pos: add3(target, mul3(dir, dist)), target, up, fov, w, h });
}
// Screen pixels per world unit at depth 1, for a vertical field of view.
export const pxPerUnit = (h, fov) => h / 2 / Math.tan((fov * Math.PI) / 360);

// ── The depth buffer ─────────────────────────────────────────────────────────
// A quarter-resolution software z-buffer of a surface, so a line knows where
// the surface is in front of it: the hidden-line test for spheres, cones,
// tubes and tori alike. One per sketch (makeDepth()), reset every frame, the
// surface rasterised into it as triangles or a grid of 3D points.
export function makeDepth(s = 4) {
	const Z = { s, W: 0, H: 0, buf: null, on: false };
	Z.reset = (w, h) => {
		const W = Math.ceil(w / s);
		const H = Math.ceil(h / s);
		if (!Z.buf || Z.W !== W || Z.H !== H) {
			Z.buf = new Float32Array(W * H);
			Z.W = W;
			Z.H = H;
		}
		Z.buf.fill(Infinity);
		Z.on = true;
	};
	Z.off = () => (Z.on = false);
	// A triangle of projected points [sx, sy, depth].
	Z.tri = (a, b, c) => {
		if (a[2] < NEAR || b[2] < NEAR || c[2] < NEAR) return;
		const ax = a[0] / s;
		const ay = a[1] / s;
		const bx = b[0] / s;
		const by = b[1] / s;
		const cx = c[0] / s;
		const cy = c[1] / s;
		const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
		if (Math.abs(area) < 1e-9) return;
		const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
		const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
		const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
		const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
		if (x0 > x1 || y0 > y1) return;
		const ia = 1 / a[2];
		const ib = 1 / b[2];
		const ic = 1 / c[2];
		const e = -0.03;
		for (let y = y0; y <= y1; y++) {
			const py = y + 0.5;
			for (let x = x0; x <= x1; x++) {
				const px = x + 0.5;
				const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
				if (w0 < e) continue;
				const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
				if (w1 < e) continue;
				const w2 = 1 - w0 - w1;
				if (w2 < e) continue;
				const z = 1 / (w0 * ia + w1 * ib + w2 * ic);
				const k = y * Z.W + x;
				if (z < Z.buf[k]) Z.buf[k] = z;
			}
		}
	};
	// A surface sampled on a grid (rows of 3D points).
	Z.grid = (cam, grid) => {
		const P = grid.map((row) => row.map((p) => cam.project(p)));
		for (let i = 0; i < P.length - 1; i++)
			for (let j = 0; j < P[i].length - 1; j++) {
				Z.tri(P[i][j], P[i + 1][j], P[i + 1][j + 1]);
				Z.tri(P[i][j], P[i + 1][j + 1], P[i][j + 1]);
			}
	};
	// Behind the surface? The deepest of the four cells round the point, so a
	// silhouette stays drawn; off the buffer counts as in front.
	Z.hidden = (q) => {
		if (!Z.on) return false;
		const fx = q[0] / s - 0.5;
		const fy = q[1] / s - 0.5;
		const x0 = Math.floor(fx);
		const y0 = Math.floor(fy);
		let m = -Infinity;
		for (let dy = 0; dy < 2; dy++)
			for (let dx = 0; dx < 2; dx++) {
				const x = x0 + dx;
				const y = y0 + dy;
				if (x < 0 || y < 0 || x >= Z.W || y >= Z.H) return false;
				const z = Z.buf[y * Z.W + x];
				if (z > m) m = z;
			}
		return q[2] > m * 1.012 + 0.012;
	};
	return Z;
}

// ── 3D strokes ───────────────────────────────────────────────────────────────
// A 3D polyline as screen runs: cut at the near plane (so a surface can sweep
// past the lens), split wherever it goes behind the surface in `depth` (a
// makeDepth(), or null for no hidden test), and wherever its `fade` (per point,
// 0..1) drops out. Each run is { Q, back }, its points [sx, sy, depth, fade].
export function runs3(cam, pts, { depth = null, fade = null } = {}) {
	const out = [];
	let run = null;
	let pp = null;
	let pq = null;
	const end = () => {
		if (run && run.Q.length > 1) out.push(run);
		run = null;
	};
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i];
		const q = cam.project(p);
		const f = fade ? fade(p, i) : 1;
		if (q[2] <= NEAR || f < 0.01 || !Number.isFinite(q[0] + q[1])) {
			if (run && pq && q[2] <= NEAR && pq[2] > NEAR) {
				const c = cam.project(lerp3(pp, p, (pq[2] - NEAR) / (pq[2] - q[2])));
				run.Q.push([c[0], c[1], NEAR, f]);
			}
			end();
			pp = p;
			pq = q;
			continue;
		}
		const back = depth ? depth.hidden(q) : false;
		if (!run) {
			run = { Q: [], back };
			if (pq && pq[2] <= NEAR) {
				const c = cam.project(lerp3(pp, p, (pq[2] - NEAR) / (pq[2] - q[2])));
				run.Q.push([c[0], c[1], NEAR, f]);
			}
		} else if (back !== run.back) {
			run.Q.push([q[0], q[1], q[2], f]);
			end();
			run = { Q: [], back };
		}
		run.Q.push([q[0], q[1], q[2], f]);
		pp = p;
		pq = q;
	}
	end();
	return out;
}

// Paint runs: the far side faint and dashed; the near side bold, its width by
// depth (`ref` is the depth drawn at `width`; 0 for one width), in short
// pieces so the width and fade can change along it. `which` 'back' | 'front'
// paints only those runs (for drawing the far side under everything).
export function paint(ctx, R, o, which = null) {
	const { color, width = 2.2, alpha = 1, glow = 0, ref = 0, hid = 0.32 } = o;
	for (const r of R) {
		if (which && (which === 'back') !== r.back) continue;
		const Q = r.Q;
		if (r.back) {
			if (hid <= 0) continue;
			const f = Q[Q.length >> 1][3];
			stroke(ctx, Q, {
				color,
				width: Math.max(1, width * 0.62),
				alpha: alpha * hid * f,
				dash: [3, 6]
			});
			continue;
		}
		const piece = 10;
		for (let i = 0; i < Q.length - 1; i += piece) {
			const seg = Q.slice(i, Math.min(Q.length, i + piece + 1));
			const mid = seg[seg.length >> 1];
			const ws = ref ? Math.min(2.6, Math.max(0.55, ref / mid[2])) : 1;
			stroke(ctx, seg, {
				color,
				width: width * ws,
				alpha: alpha * mid[3],
				glow,
				cap: Q.length <= piece + 1 ? 'round' : 'butt'
			});
		}
	}
}

// runs3 then paint, in one: a 3D line drawn the plates' way.
export function line3(ctx, cam, pts, o = {}, { depth = null, fade = null, which = null } = {}) {
	paint(ctx, runs3(cam, pts, { depth, fade }), o, which);
}

// A filled 3D polygon (a node, a lit disc): front bold, behind faint.
export function blot(
	ctx,
	cam,
	pts,
	{ fill, alpha = 1, hidAlpha = 0.18, centre = null, depth = null }
) {
	const Q = [];
	for (const p of pts) {
		const q = cam.project(p);
		if (q[2] <= NEAR) return null;
		Q.push(q);
	}
	const c = centre ? cam.project(centre) : Q[0];
	const back = depth ? depth.hidden(c) : false;
	const a = back ? alpha * hidAlpha : alpha;
	if (a <= 0.003) return { c, back };
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	return { c, back };
}

// A 3D circle (great or small) as a polyline: centre, two unit axes, radius.
export function circle3(c, e1, e2, r, n = 160, a0 = 0, a1 = TAU) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = a0 + ((a1 - a0) * i) / n;
		out.push(add3(c, add3(mul3(e1, r * Math.cos(a)), mul3(e2, r * Math.sin(a)))));
	}
	return out;
}

// Two unit axes perpendicular to `n`, for circle3.
export function axesOf(n) {
	const a = norm(n);
	const e1 = norm(cross(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
	return [e1, cross(a, e1)];
}

// A label by a 3D point, pushed off it along screen direction (dx, dy); dimmed
// when the surface in `depth` is in front of it.
export function label3(
	ctx,
	cam,
	P,
	s,
	{ dx = 14, dy = -16, size = 24, alpha = 1, color = PAL.chalk, depth = null } = {}
) {
	if (alpha <= 0) return;
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const back = depth ? depth.hidden(q) : false;
	math(ctx, s, q[0] + dx, q[1] + dy, {
		size,
		alpha: alpha * (back ? 0.4 : 1),
		color,
		align: dx < 0 ? 'right' : 'left'
	});
}

// A lit point at a 3D spot: a gold disc, a hot core and a halo.
export function lit3(ctx, cam, P, r, a = 1, halo = 'rgba(255, 222, 150, 0.75)') {
	if (a <= 0 || r <= 0) return null;
	const q = cam.project(P);
	if (q[2] <= NEAR) return null;
	bloom(ctx, q[0], q[1], r * 6, halo, a);
	disc(ctx, q[0], q[1], r, { fill: PAL.gold, alpha: a });
	disc(ctx, q[0], q[1], r * 0.45, { fill: '#fffaf0', alpha: a });
	return q;
}

// A sphere's outline from the lens (its limb), in rose, over a faint body.
export function limb(ctx, cam, a, centre = [0, 0, 0], radius = 1, color = PAL.rose) {
	if (a <= 0) return;
	const c = sub3(cam.pos, centre);
	const d = Math.hypot(...c) / radius;
	if (d <= 1.02) return;
	const n = norm(c);
	const [e1, e2] = axesOf(n);
	const pts = circle3(
		add3(centre, mul3(n, radius / d)),
		e1,
		e2,
		radius * Math.sqrt(1 - 1 / (d * d)),
		180
	);
	const Q = pts.map((p) => cam.project(p));
	if (Q.some((q) => q[2] <= NEAR)) return;
	ctx.save();
	ctx.globalAlpha = 0.05 * a;
	ctx.fillStyle = PAL.chalk;
	ctx.beginPath();
	Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
	ctx.fill();
	ctx.restore();
	stroke(ctx, Q, { color, width: 2, alpha: 0.75 * a });
}

// ── The Riemann sphere ───────────────────────────────────────────────────────
// The boards' own convention, as log-mobius has it: the plane Z = 1 (twice the
// plate's units, so the unit circle lands on the equator) tangent to the unit
// sphere at 0, curled by k (0 flat, 1 the sphere) into the sphere of curvature
// k tangent there, each point at its stereographic angle 2 arctan|z| from 0 —
// the projection from ∞, which lands at (0, 0, −1).
export function curl(p, k) {
	const r = Math.hypot(p[0], p[1]);
	if (!Number.isFinite(r)) return [0, 0, 1 - 2 / Math.max(k, 1e-6)];
	const c = r > 0 ? p[0] / r : 1;
	const s = r > 0 ? p[1] / r : 0;
	if (k < 1e-5) return [2 * p[0], 2 * p[1], 1];
	const th = 2 * Math.atan(k * r);
	const st = Math.sin(th);
	return [(c * st) / k, (s * st) / k, 1 - (1 - Math.cos(th)) / k];
}
// The curled board as a grid of 3D points, for a depth buffer.
export function curlGrid(k, place = (p) => p, rmax = 3000) {
	const grid = [];
	const T = 2 * Math.atan(rmax);
	for (let i = 0; i <= 40; i++) {
		const th0 = (T * i) / 40;
		const r = Math.tan(th0 / 2);
		const row = [];
		for (let j = 0; j <= 48; j++) {
			const a = (TAU * j) / 48;
			row.push(place(curl([r * Math.cos(a), r * Math.sin(a)], k)));
		}
		grid.push(row);
	}
	return grid;
}
// Stereographic projection and its inverse, the textbook way: the unit
// sphere in (X, Y, Z), projected from the north pole N = (0, 0, 1) to the
// plane Z = 0. z = (X + iY)/(1 − Z); 0 is the south pole, ∞ the north.
export function toSphere([x, y]) {
	const d = 1 + x * x + y * y;
	if (!Number.isFinite(d)) return [0, 0, 1];
	return [(2 * x) / d, (2 * y) / d, (x * x + y * y - 1) / d];
}
export function toPlane([X, Y, Z]) {
	const d = 1 - Z;
	return d < 1e-12 ? [Infinity, Infinity] : [X / d, Y / d];
}
// A sphere as a latitude–longitude grid (rows of 3D points), for a depth
// buffer: centre, radius.
export function sphereGrid(centre = [0, 0, 0], r = 1, n = 28, m = 40) {
	const grid = [];
	for (let i = 0; i <= n; i++) {
		const th = (Math.PI * i) / n;
		const row = [];
		for (let j = 0; j <= m; j++) {
			const ph = (TAU * j) / m;
			row.push([
				centre[0] + r * Math.sin(th) * Math.cos(ph),
				centre[1] + r * Math.cos(th),
				centre[2] + r * Math.sin(th) * Math.sin(ph)
			]);
		}
		grid.push(row);
	}
	return grid;
}
