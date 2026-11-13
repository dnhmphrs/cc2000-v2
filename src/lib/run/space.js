// ── Space: depth, on the 2D board ────────────────────────────────────────────
// What the run needs to hide a line behind a body drawn by hand: a small
// software depth buffer. The swimmer's skin is rasterised into it (body.js
// fillDepth), and the groove's turns ask it, point by point, whether the body
// is in front of them (sketch.js rings). And a lit point at a spot in 3D.
//
// Points are a camera's (board.js camera3): project(p) → [sx, sy, depth] in
// CSS pixels.

import { PAL, disc, bloom } from './board.js';

// Points nearer the lens than this are behind it.
export const NEAR = 0.05;

// ── The depth buffer ─────────────────────────────────────────────────────────
// A quarter-resolution software z-buffer of a surface, so a line knows where
// the surface is in front of it. One for the run (makeDepth()), reset every
// frame; `buf` holds the nearest depth in each cell of `s` px, W × H cells,
// and whoever draws the surface fills it.
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
