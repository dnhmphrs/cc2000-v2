// The verdicts' gifs, each baked into a SHEET of its frames (a gif cannot be
// drawn frame by frame on a canvas, a sheet can). How each sheet in
// static/gifs is cut: `cols` × `rows` cells of `w` × `h`, `frames` of them in
// reading order, at `fps`.
//
// These rows were GENERATED, by scripts/gifs.mjs on the `archive` branch,
// from the original gifs kept there. If a gif changes, bake it there and
// carry the sheet and its row across.
export const GIFS = {
	500: { src: '/gifs/500.jpg', cols: 3, rows: 4, frames: 10, w: 240, h: 130, fps: 14.29 },
	'the-future': {
		src: '/gifs/the-future.jpg',
		cols: 7,
		rows: 7,
		frames: 47,
		w: 240,
		h: 186,
		fps: 14.29
	},
	'the-past': {
		src: '/gifs/the-past.jpg',
		cols: 11,
		rows: 13,
		frames: 138,
		w: 240,
		h: 180,
		fps: 14.29
	}
};
