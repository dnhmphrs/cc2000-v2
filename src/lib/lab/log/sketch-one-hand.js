// ── The sketch hand, a few more strokes (flow-strand-sketch-one's) ───────────
// log/sketch-hand.js's lettering with the glyphs this variant's workings
// need and the shared font has not — `?` (the hand unsure of itself), `≈`,
// `✓` — and one mark more than its strike and ring: a SCRIBBLE, the red
// pencil going back and forth over a wrong answer until it is crossed out.
// The shared module is read as it is (its glyph table, its noise): `letter`
// and `measure` here are its own, line for line, over the wider table, so a
// figure lettered here is the figure lettered there.
//
//   import { letter, measure, scribble } from './sketch-one-hand.js';

import { lerp } from './board.js';
import { HAND, glyphs, noise1 } from './sketch-hand.js';

// sketch-hand.js's hash (not exported): the same numbers, so the glyphs
// lean, lift and wobble as the shared font's do.
function hash(i, j, k) {
	let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(k | 0, 1440662683);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h & 0xffff) / 32767.5 - 1;
}

function arc(cx, cy, rx, ry, a0, a1, n = 12) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
	}
	return out;
}
const dot = (x, y, r = 0.045) => arc(x, y, r, r, 0, 360, 6);
// A wave across the box: ≈'s strokes.
const wave = (y) => {
	const out = [];
	for (let i = 0; i <= 10; i++) {
		const u = i / 10;
		out.push([0.04 + 0.5 * u, y + 0.07 * Math.sin(u * 2 * Math.PI)]);
	}
	return out;
};

const MORE = {
	'?': {
		w: 0.52,
		s: [[...arc(0.26, 0.74, 0.21, 0.23, 160, -80, 12), [0.28, 0.38], [0.27, 0.28]], dot(0.27, 0.05)]
	},
	'≈': { w: 0.58, s: [wave(0.64), wave(0.38)] },
	'✓': {
		w: 0.7,
		s: [
			[
				[0.04, 0.5],
				[0.24, 0.12],
				[0.68, 0.98]
			]
		]
	}
};
const GLYPHS = { ...glyphs, ...MORE };

export function measure(str, track = 0.12) {
	let W = 0;
	for (const ch of str) W += (GLYPHS[ch] ?? GLYPHS[' ']).w + track;
	return Math.max(0, W - track);
}

// log/sketch-hand.js letter(), over the wider table.
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

// A SCRIBBLE over a box [x0, y0, x1, y1]: the red pencil dragged up and
// down across it in a tight zigzag from its left end to its right, each
// stroke a little off — written on to k (0…1), fast, as a wrong answer is
// crossed out — and re-drawn each drawing (`boil`).
export function scribble(ink, box, k, o = {}) {
	if (k <= 0) return;
	const { seed = 0, boil = 0, color = HAND.red, alpha = 1, width = 0.085, pitch = 0.42 } = o;
	const [x0, y0, x1, y1] = box;
	const h = y1 - y0;
	const r = (j) => hash(seed * 23 + 5, boil, j);
	const N = Math.max(4, 2 * Math.round((x1 - x0) / (pitch * h) / 2));
	const corner = (i) => [
		lerp(x0 - 0.1 * h, x1 + 0.1 * h, i / N) + 0.06 * h * r(i),
		(i % 2 ? y1 - 0.12 * h : y0 + 0.14 * h) + 0.08 * h * r(i + 50)
	];
	const upto = Math.min(1, k) * N;
	const pts = [corner(0)];
	for (let i = 1; i <= N; i++) {
		if (i > upto) {
			const f = upto - (i - 1);
			const a = corner(i - 1);
			const b = corner(i);
			pts.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
			break;
		}
		pts.push(corner(i));
	}
	ink.line(pts, color, Math.max(1.2, width * h), alpha, false);
}
