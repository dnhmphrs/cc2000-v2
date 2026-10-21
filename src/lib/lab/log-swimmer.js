// ── Sketch: log-swimmer — the swimmer made in 3D, swimming at the maths ──────
// Ten ways to make the swimmer FROM NOTHING as a real 3D body — a head, a
// midpiece, a beating flagellum, surfaces, not a flat outline — and set it
// swimming toward a mathematical object (a logarithmic spiral, the exponential
// map, a Riemann surface …). Each is a module in lab/swimmer/, picked by ?v=.
// Every frame a pure function of progress (?at= pins it).
//
// A variant module exports
//   meta = { title, order, seconds, three: false }
//   make({ THREE, renderer, board }) → { render(ctx, w, h, t), resize?() }
// With three: false it draws on the board (cleared to the board's ground
// first); with three: true it renders with the lab's renderer itself and the
// board is cleared to transparent, but for the tag.

import { getBoard, clearBoard, clock, tag, variant } from './log/board.js';

const VARIANTS = import.meta.glob('./swimmer/*.js', { eager: true });

export default async function make({ THREE, renderer, at }) {
	const mods = Object.entries(VARIANTS)
		.map(([p, m]) => ({ name: p.match(/swimmer\/([a-z0-9-]+)\.js$/)[1], m }))
		.filter((x) => x.m.meta && x.m.make)
		.sort((a, b) => (a.m.meta.order ?? 99) - (b.m.meta.order ?? 99));
	if (!mods.length) throw new Error('no variants in src/lib/lab/swimmer/ yet');
	const v = variant(mods.map((x) => x.name));
	const mod = mods.find((x) => x.name === v).m;
	const board = getBoard();
	const time = clock(mod.meta.seconds, at);
	const scene = await mod.make({ THREE, renderer, board });

	return {
		info: { seconds: mod.meta.seconds, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render() {
			const { ctx, w, h } = board;
			if (mod.meta.three) {
				ctx.save();
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.clearRect(0, 0, board.canvas.width, board.canvas.height);
				ctx.restore();
			} else clearBoard(board);
			scene.render(ctx, w, h, time.t);
			tag(ctx, w, h, `log-swimmer · ${v}`);
		},
		resize(w, h) {
			scene.resize?.(w, h);
		}
	};
}
