// ── Sketch four: the lettering, with the signs its workings need ─────────────
// log/sketch-hand.js's `letter` (the same stroke font, the same wobble, lean
// and lift a glyph each drawing — the same numbers, so a figure set with it
// is the kit's figure) with the few signs flow-strand-sketch-four's tries
// write that the kit's font has not: × ÷ ≈ ?. Everything else is the kit's.
//
//   import { letter, measure } from './log/sketch-four-hand.js';

import { lerp } from './board.js';
import { glyphs, rand, noise1, HAND } from './sketch-hand.js';

// The kit's hash, from its rand (rand(i, j, k) = ½ + ½ hash(i, j + 7, k + 13)).
const hash = (i, j, k) => 2 * rand(i, j - 7, k - 13) - 1;

const wave = (y, a, n = 10) =>
	Array.from({ length: n + 1 }, (_, i) => {
		const u = i / n;
		return [lerp(0.06, 0.6, u), y + a * Math.sin(u * 2 * Math.PI)];
	});
const arc = (cx, cy, rx, ry, a0, a1, n = 12) =>
	Array.from({ length: n + 1 }, (_, i) => {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
	});

// (a dot as a stroke of almost no length: its round caps make the disc —
// the kit's dot, a ring of six points narrower than its own brush, comes
// out holed on the GPU's mitred strokes)
const point = (x, y) => [
	[x - 0.008, y],
	[x + 0.008, y]
];
const MORE = {
	'·': { w: 0.32, s: [point(0.16, 0.5)] },
	'.': { w: 0.26, s: [point(0.12, 0.05)] },
	'×': {
		w: 0.6,
		s: [
			[
				[0.1, 0.14],
				[0.5, 0.6]
			],
			[
				[0.5, 0.14],
				[0.1, 0.6]
			]
		]
	},
	'÷': {
		w: 0.66,
		s: [
			[
				[0.06, 0.38],
				[0.6, 0.38]
			],
			point(0.33, 0.64),
			point(0.33, 0.12)
		]
	},
	'≈': { w: 0.66, s: [wave(0.5, 0.06), wave(0.26, 0.06)] },
	'?': {
		w: 0.58,
		s: [[...arc(0.29, 0.74, 0.24, 0.24, 165, -60, 12), [0.32, 0.4], [0.3, 0.26]], point(0.3, 0.05)]
	}
};
const GLYPHS = { ...glyphs, ...MORE };

// The width of a string at size 1 (its advance, tracked).
export function measure(str, track = 0.12) {
	let W = 0;
	for (const ch of str) W += (GLYPHS[ch] ?? GLYPHS[' ']).w + track;
	return Math.max(0, W - track);
}

// Hand-lettered (log/sketch-hand.js letter, line for line, its glyphs and
// these): `str` set from x (by `align`) on the baseline y, `size` px a
// cap-height. Returns { x0, y0, x1, y1, cells, size }.
export function letter(ink, str, x, y, size, o = {}) {
	const {
		align = 'center',
		seed = 0,
		boil = 0,
		amp = 0.035,
		lean = 0.06,
		width = 0.11,
		alpha = 1,
		color = HAND.ink,
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
		const ch = chars[g];
		const G = GLYPHS[ch] ?? GLYPHS[' '];
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
