// ── Sketch: log-intro — the site's opening, through the two answers ─────────
// Fifteen ways to open the site and take its two answers BY HAND — the date, and
// how spicy from 1 to 10 — each a module in lab/intro/, picked by ?v=. They
// share log/answer.js (the keyboard, the pointer, the run waiting at each
// question, the demo's hand when no one is there) and draw their own fields.
// Unpinned in the lab, a person answers: type the date, Enter; drag the
// handle (or ← →, a digit), Enter. Pinned (?at=), in a reel, or ?demo=1, the
// hand is scripted (14 · 02 · 1987, spice 7), so every frame is a pure
// function of progress.
//
// A variant module exports
//   meta = { title, order, seconds, beats: { q1, wait1, e1, q2, wait2, e2 } }
//   make({ THREE, renderer, board, answers, live }) → { render(ctx, w, h, t, hand) }
// render draws one frame on the board (cleared to the board's ground first)
// and calls answers.slider(fn) with this frame's slider geometry.

import { getBoard, clearBoard, clock, tag, variant } from './log/board.js';
import { makeAnswers } from './log/answer.js';

const VARIANTS = import.meta.glob('./intro/*.js', { eager: true });

export default async function make({ THREE, renderer, at }) {
	const mods = Object.entries(VARIANTS)
		.map(([p, m]) => ({ name: p.match(/intro\/([a-z0-9-]+)\.js$/)[1], m }))
		.filter((x) => x.m.meta && x.m.make)
		.sort((a, b) => (a.m.meta.order ?? 99) - (b.m.meta.order ?? 99));
	if (!mods.length) throw new Error('no variants in src/lib/lab/intro/ yet');
	const v = variant(mods.map((x) => x.name));
	const mod = mods.find((x) => x.name === v).m;
	const q = new URLSearchParams(location.search);
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const board = getBoard();
	const time = clock(mod.meta.seconds, at);
	const answers = makeAnswers({ live, beats: mod.meta.beats });
	const scene = await mod.make({ THREE, renderer, board, answers, live });

	return {
		info: {
			seconds: mod.meta.seconds,
			variant: v,
			live,
			beats: mod.meta.beats,
			answers: answers.answers
		},
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render() {
			clearBoard(board);
			const { ctx, w, h } = board;
			const t = time.t;
			scene.render(ctx, w, h, t, answers.hand(t));
			tag(ctx, w, h, `log-intro · ${v}`);
		},
		resize() {
			scene.resize?.();
		}
	};
}
