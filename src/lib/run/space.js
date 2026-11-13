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

import { PAL, stroke, disc, bloom, lerp } from './board.js';

// Points nearer the lens than this are behind it, for every helper here.
export const NEAR = 0.05;

const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

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
function runs3(cam, pts, { depth = null, fade = null } = {}) {
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
function paint(ctx, R, o, which = null) {
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
