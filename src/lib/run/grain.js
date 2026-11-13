// ── The grain: the board's fuzz, on the canvas ───────────────────────────────
// What a flow's board gets when there is no lens to look through (log/lens.js
// is the fuzz proper: a soft warm focus — the lines' own glow, a little mist,
// the darks lifted warm, a fine grain that breathes, a rare faint leak — on
// the GPU). Here, the part of it a canvas can do in ONE fill a frame: the
// darks lifted a hair toward the warm, and a very fine grain in it, felt more
// than seen, changing four times a second. (It was a layer of warm specks at
// twelve a second and three washes — four full-board fills — and read as
// visual snow; the lead: "a slight warm fuzzy softening … very subtle".)
//
//   grain(ctx, w, h, secs, { alpha = 1 })   draw it, over what is there
//
// `secs` the clock it moves on: a flow passes answers.hand(t).secs — real
// seconds live, so it keeps moving while the run waits at a question; t
// pinned, in the demo or a reel. `alpha` scales it (0 is none).

const TILES = 4;
const SIZE = 128; // px of a tile, drawn 1:1
const RATE = 4; // tiles a second
// The lift (0…255, screened over the board: a dark of v shows v + c(1 − v))
// and the grain's reach over it.
const LIFT = [6, 4, 2];
const AMP = [2.2, 1.9, 1.5];
let tiles = null;

function makeTiles() {
	const out = [];
	let s = 90210;
	const r = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	for (let k = 0; k < TILES; k++) {
		const c = document.createElement('canvas');
		c.width = c.height = SIZE;
		const x = c.getContext('2d');
		const img = x.createImageData(SIZE, SIZE);
		const d = img.data;
		for (let i = 0; i < SIZE * SIZE; i++) {
			const v = r();
			for (let ch = 0; ch < 3; ch++) d[4 * i + ch] = Math.round(LIFT[ch] + AMP[ch] * v);
			d[4 * i + 3] = 255;
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

export function grain(ctx, w, h, secs, { alpha = 1 } = {}) {
	if (alpha <= 0.002) return;
	if (!tiles) tiles = makeTiles();
	const k = Math.floor(secs * RATE);
	const tile = tiles[((k % TILES) + TILES) % TILES];
	ctx.save();
	ctx.globalCompositeOperation = 'screen';
	ctx.globalAlpha = alpha;
	const pat = ctx.createPattern(tile, 'repeat');
	pat.setTransform(new DOMMatrix([1, 0, 0, 1, -hash(k) * SIZE, -hash(k + 7919) * SIZE]));
	ctx.fillStyle = pat;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
}
