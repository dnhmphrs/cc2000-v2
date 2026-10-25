// ── Sketch four: chalk for the rooms drawn without ink ───────────────────────
// log/rooms.js's chalk copy lifts a room's dark INK lines off its art and
// redraws them in chalk; the 2010s room is drawn in flat colour with no ink
// at all, so its chalk copy is all but empty (a few dashed rectangles and a
// grey bar where the room should be) — and in flow-strand-sketch-four it is
// a room the hand sends the fall to (+ 266 MONTHS: the future). Here such a
// layer's chalk is drawn from the EDGES of its colours instead (a Sobel
// gradient of the colour and the alpha, the same chalk colour and grain), so
// it is the same kind of line drawing as the others.
//
//   inkAll(art)   a room drawn in flat colour given edge chalk throughout,
//                 and any other room's layer without ink (not its wall), in
//                 place (art from loadRooms({ chalk: true }))

import { mips } from './rooms.js';

const SPARSE = 0.004; // mean chalk alpha below which a layer is redrawn

function coverage(c) {
	const W = Math.min(c.width, 256);
	const H = Math.max(1, Math.round((c.height * W) / c.width));
	const t = document.createElement('canvas');
	t.width = W;
	t.height = H;
	const g = t.getContext('2d', { willReadFrequently: true });
	g.drawImage(c, 0, 0, W, H);
	const p = g.getImageData(0, 0, W, H).data;
	let a = 0;
	for (let i = 3; i < p.length; i += 4) a += p[i];
	return a / 255 / (W * H);
}

export function edgeChalk(src, wall) {
	const k = Math.min(1, (wall ? 1024 : 800) / src.width);
	const w = Math.max(3, Math.round(src.width * k));
	const h = Math.max(3, Math.round(src.height * k));
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const x = c.getContext('2d', { willReadFrequently: true });
	x.drawImage(src, 0, 0, w, h);
	const data = x.getImageData(0, 0, w, h);
	const p = data.data;
	// premultiplied channels, 0…1, and the alpha (a sprite's edge is a line)
	const N = w * h;
	const ch = [new Float32Array(N), new Float32Array(N), new Float32Array(N), new Float32Array(N)];
	for (let i = 0; i < N; i++) {
		const a = p[4 * i + 3] / 255;
		ch[0][i] = (a * p[4 * i]) / 255;
		ch[1][i] = (a * p[4 * i + 1]) / 255;
		ch[2][i] = (a * p[4 * i + 2]) / 255;
		ch[3][i] = a;
	}
	let s = 424242;
	const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = x.createImageData(w, h);
	const q = out.data;
	for (let y = 0; y < h; y++)
		for (let xx = 0; xx < w; xx++) {
			const i = y * w + xx;
			let g = 0;
			if (xx > 0 && y > 0 && xx < w - 1 && y < h - 1)
				for (let k2 = 0; k2 < 4; k2++) {
					const C = ch[k2];
					const gx =
						C[i - w + 1] + 2 * C[i + 1] + C[i + w + 1] - C[i - w - 1] - 2 * C[i - 1] - C[i + w - 1];
					const gy =
						C[i + w - 1] + 2 * C[i + w] + C[i + w + 1] - C[i - w - 1] - 2 * C[i - w] - C[i - w + 1];
					g = Math.max(g, Math.hypot(gx, gy));
				}
			const ink = Math.min(1, Math.max(0, (g - 0.22) / 0.4));
			q[4 * i] = 236;
			q[4 * i + 1] = 230;
			q[4 * i + 2] = 218;
			q[4 * i + 3] = Math.round(255 * ink * (0.55 + 0.45 * rnd()));
		}
	x.putImageData(out, 0, 0);
	return c;
}

export function inkAll(art) {
	for (const d of Object.keys(art)) {
		if (d === 'missing') continue;
		const layers = Object.entries(art[d] ?? {}).filter(([, a]) => a?.chalk?.[0] && a.mips?.[0]);
		const cov = Object.fromEntries(layers.map(([k, a]) => [k, coverage(a.chalk[0])]));
		const sorted = Object.values(cov).sort((x, y) => x - y);
		// a room drawn in flat colour (most of its layers without ink): all of
		// it from its edges; otherwise only a layer without ink (the 1950s'
		// sofa and window), and never the wall (its paper, its wallpaper)
		const flat = sorted.length && sorted[sorted.length >> 1] < SPARSE;
		for (const [key, a] of layers) {
			if (!flat && (key === 'bg' || cov[key] >= SPARSE)) continue;
			a.chalk = mips(edgeChalk(a.mips[0], key === 'bg'));
		}
	}
	return art;
}
