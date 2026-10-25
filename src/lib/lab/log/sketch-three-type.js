// ── The sketch hand's lettering, with the signs a bad sum needs ──────────────
// log/sketch-hand.js's `letter` and `measure` over its stroke font, plus the
// glyphs flow-strand-sketch-three's workings write that the kit's font does
// not have: ÷ (the wrong divisions) and ? (a guess). The kit's table is read,
// never changed (other sketches in the same page use it); a glyph here is a
// polyline in a box one cap-height tall, the baseline at y = 0, y up, as the
// kit's are. The lettering itself is the kit's, line for line: each glyph
// its own wobble, lean and lift, re-drawn each drawing.

import { glyphs as KIT, noise1 } from './sketch-hand.js';

function arc(cx, cy, rx, ry, a0, a1, n = 12) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
	}
	return out;
}
const dot = (x, y, r = 0.045) => arc(x, y, r, r, 0, 360, 6);

const MINE = {
	'÷': {
		w: 0.58,
		s: [
			[
				[0.06, 0.5],
				[0.52, 0.5]
			],
			dot(0.29, 0.79, 0.05),
			dot(0.29, 0.21, 0.05)
		]
	},
	'?': {
		w: 0.5,
		s: [[...arc(0.24, 0.74, 0.2, 0.23, 165, -70, 12), [0.27, 0.42], [0.27, 0.3]], dot(0.27, 0.05)]
	}
};
const GLYPHS = { ...KIT, ...MINE };

// (the kit's hash, which it does not export)
function hash(i, j, k) {
	let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(k | 0, 1440662683);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h & 0xffff) / 32767.5 - 1;
}

// The width of a string at size 1 (its advance, tracked).
export function measure(str, track = 0.12) {
	let W = 0;
	for (const ch of str) W += (GLYPHS[ch] ?? GLYPHS[' ']).w + track;
	return Math.max(0, W - track);
}

// Hand-lettered: `str` set from x (by `align`) on the baseline y, `size` px a
// cap-height. Returns { x0, y0, x1, y1, cells, size } (cells: each glyph's
// box, for strikes and rings). As the kit's `letter`.
export function letter(ink, str, x, y, size, o = {}) {
	const {
		align = 'center',
		seed = 0,
		boil = 0,
		amp = 0.035,
		lean = 0.06,
		width = 0.11,
		alpha = 1,
		color = '#fff6e8',
		track = 0.12,
		upto = 1,
		keyed = true
	} = o;
	const W = measure(str, track) * size;
	let cx = align === 'left' ? x : align === 'right' ? x - W : x - W / 2;
	const cells = [];
	const chars = [...str];
	const n = Math.floor(upto * chars.length + 1e-6);
	const lw = Math.max(0.6, width * size);
	for (let g = 0; g < chars.length; g++) {
		const G = GLYPHS[chars[g]] ?? GLYPHS[' '];
		const gw = G.w * size;
		if (g < n && G.s.length) {
			const r = (k) => hash(seed * 31 + g, boil, k);
			const rot = lean * r(1);
			const lift = 0.05 * size * r(2);
			const sx = 1 + 0.06 * r(3);
			const sy = 1 + 0.07 * r(4);
			const ox = cx + 0.03 * size * r(5);
			const cs = Math.cos(rot);
			const sn = Math.sin(rot);
			const mx = G.w / 2;
			let si = 0;
			for (const s of G.s) {
				si++;
				const pts = [];
				for (let i = 0; i < s.length; i++) {
					const u = (i / Math.max(1, s.length - 1)) * 2.2;
					const k0 = seed * 131 + g * 17 + si * 5;
					const jx = amp * noise1(u + 0.37 * si, k0 + boil * 977);
					const jy = amp * noise1(u + 5.1 + 0.37 * si, k0 + boil * 977 + 3);
					const gx = (s[i][0] - mx) * sx + jx;
					const gy = (s[i][1] - 0.5) * sy + jy;
					const X = gx * cs - gy * sn + mx;
					const Y = gx * sn + gy * cs + 0.5;
					pts.push([ox + X * size, y - Y * size - lift]);
				}
				ink.line(pts, color, lw, alpha, keyed);
			}
		}
		cells.push([cx, y - size, cx + gw, y]);
		cx += gw + track * size;
	}
	const x0 = align === 'left' ? x : align === 'right' ? x - W : x - W / 2;
	return { x0, y0: y - size, x1: x0 + W, y1: y, cells, size };
}
