// ── The grain: a soft, warm, living fuzz over the board ──────────────────────
// In place of the board's fixed chalk dust: the fuzz of an old tape — no
// scan lines, no tracking bars, none of VHS's features — just its soft warm
// noise, moving. Two parts, both a pure function of t:
//
//   the GRAIN    a handful of noise tiles, made once, in warm tones (amber,
//                rose, cream), drawn at twice their size so they are soft,
//                one after another at 12 a second and each at its own
//                seeded offset, so it never stands still and never repeats
//                a frame's place;
//   the BLOOM    three very faint warm washes drifting across the board on
//                slow incommensurate periods, so the fuzz breathes.
//
//   grain(ctx, w, h, t, { alpha = 1, warm = 1 })   draw it, over what is there
//
// `alpha` scales the whole (0 is none), `warm` the washes. It costs a pattern
// fill and three gradients a frame.

const TILES = 6;
const SIZE = 160; // px of a tile, drawn at 2× (so soft)
const RATE = 12; // tiles a second
let tiles = null;

function makeTiles() {
	const out = [];
	let s = 90210;
	const r = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	// Warm tones the grain is made of: amber, rose, cream.
	const tones = [
		[255, 196, 128],
		[255, 158, 136],
		[255, 236, 204]
	];
	for (let k = 0; k < TILES; k++) {
		const c = document.createElement('canvas');
		c.width = c.height = SIZE;
		const x = c.getContext('2d');
		const img = x.createImageData(SIZE, SIZE);
		const d = img.data;
		for (let i = 0; i < SIZE * SIZE; i++) {
			const v = r();
			const tone = tones[Math.floor(r() * 3)];
			// Mostly nothing; a soft speck now and then, its strength ∝ v⁴.
			const a = Math.pow(v, 4) * 0.55;
			d[4 * i] = tone[0];
			d[4 * i + 1] = tone[1];
			d[4 * i + 2] = tone[2];
			d[4 * i + 3] = Math.round(255 * a);
		}
		x.putImageData(img, 0, 0);
		out.push(c);
	}
	return out;
}

// A seeded hash of the tile's index: its offset on the board.
const hash = (n) => {
	let h = (n * 374761393 + 668265263) | 0;
	h = (h ^ (h >>> 13)) * 1274126177;
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function grain(ctx, w, h, t, { alpha = 1, warm = 1 } = {}) {
	if (alpha <= 0.002) return;
	if (!tiles) tiles = makeTiles();
	const k = Math.floor(t * RATE);
	const tile = tiles[((k % TILES) + TILES) % TILES];
	ctx.save();
	ctx.globalCompositeOperation = 'screen';
	// The grain: the tile at 2×, smoothed, at its frame's offset.
	ctx.imageSmoothingEnabled = true;
	const pat = ctx.createPattern(tile, 'repeat');
	const ox = hash(k) * 2 * SIZE;
	const oy = hash(k + 7919) * 2 * SIZE;
	pat.setTransform(new DOMMatrix([2, 0, 0, 2, -ox, -oy]));
	ctx.globalAlpha = 0.12 * alpha;
	ctx.fillStyle = pat;
	ctx.fillRect(0, 0, w, h);
	// The bloom: three faint warm washes drifting on slow periods.
	if (warm > 0.002) {
		const R = 0.75 * Math.max(w, h);
		const washes = [
			[0.3 + 0.25 * Math.sin(0.071 * t), 0.35 + 0.2 * Math.sin(0.053 * t + 1), [255, 170, 110]],
			[0.7 + 0.22 * Math.sin(0.047 * t + 2), 0.6 + 0.25 * Math.sin(0.061 * t + 4), [255, 130, 120]],
			[0.5 + 0.3 * Math.sin(0.037 * t + 5), 0.5 + 0.3 * Math.sin(0.043 * t + 3), [255, 220, 170]]
		];
		for (const [fx, fy, c] of washes) {
			const x = fx * w;
			const y = fy * h;
			const g = ctx.createRadialGradient(x, y, 0, x, y, R);
			g.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.026 * warm * alpha})`);
			g.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);
			ctx.globalAlpha = 1;
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}
	}
	ctx.restore();
}
