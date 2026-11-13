// ── Entry: the data entry, on the lattice ────────────────────────────────────
// The two answers the site takes — a birthday, and how spicy on a slider of 1
// to 10 — as FIELDS ON THE LATTICE the flow-conception run forms from them: clean,
// technical, primordial. No key names, no formulas, nothing written but the
// question, the answer and the slider's two end marks. The question is
// log-orb's prompt (the italic serif on a wiped patch of board, so it reads
// over lines); the field is the terminal's (log-dawn's mono face, a block
// caret blinking at the terminal's rate, the digits printed whole as a
// terminal prints them), laid in CELLS of the lattice:
//
//   date    DD · MM · YYYY — ten cells standing on a lattice row: the row is
//           the cells' floor and the lattice points along it their corners.
//           The separators are there from the start, the digits are typed
//           into the cells, the caret steps cell to cell. Enter: a gold line
//           writes along the row — this row is the lattice's real axis — and
//           the eleven lattice points along it light as it passes them.
//   slider  a track one lattice row long between ten STOPS that are ten
//           lattice points, `1` and `10` marked under the end ones, a handle
//           (a lit disc) at `value` (1…10, fractional while dragged) with its
//           number over it. Held, the handle burns a little brighter and the
//           stop under it rings; the stops it has passed are lit faintly.
//           Enter: the gold writes from stop 1 to the handle, which flares.
//
// Every frame is a pure function of its arguments: the caret blinks on the
// `secs` you pass, never on Date.now(). `script(t, beats)` is the demo's hand
// — the digits typed one by one with a hand's unevenness (seeded), a pause,
// Enter; the handle pressed, dragged from 1 to the answer along an ease with
// a slight overshoot and settle, released, Enter — but draw() takes ANY state
// (the digits typed so far, a fractional handle, held or not), so the site
// can drive it from a keyboard and a pointer later.
//
// Placement: `{ x, y, cell }` through `view` (board.js makeView; math units,
// y up). (x, y) is the lattice point at the field's LEFT end — the date's
// first cell stands on the row through it and the field runs to x + 10·cell;
// the slider's stop 1 is on it and stop 10 at x + 9·cell — and `cell` is the
// lattice's pitch in those units (1 for Λ = ℤ + ℤτ). The pitch in pixels,
// cell · view.scale, sizes everything: the type, the strokes, the handle (and
// makeEntry's `scale` scales the type within that; 1 fits the cell). With
// `view` null, x, y and cell are screen pixels, y down. The view's rotation is
// not applied: the lattice is not turned while it is written on. `lean`
// (Re τ: the second family's dx per dy, in lattice units) shears the date's
// cells so they stay the lattice's own; the glyphs stay upright.

import { span, smooth } from './board.js';

export const DEMO = { date: '14021987', spice: 7 };
const STEADY = 0.16;

// ── The hand ─────────────────────────────────────────────────────────────────
// The keystrokes: a time for each digit from the start of typing, a base
// interval jittered by a seeded random and a longer reach over each
// separator — a table built once, so the count typed at any t is a lookup.
const KEY = 0.13;
const GROUP = 0.24;
const KEYS = (() => {
	let seed = 4181;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = [];
	let t = 0;
	for (let i = 0; i < DEMO.date.length; i++) {
		let dt = KEY * (0.6 + 0.8 * rnd());
		if (i === 2 || i === 4) dt += GROUP;
		t += dt;
		out.push(t);
	}
	return out;
})();
// The hand's timing, in seconds, so a flow can lay its beats round it: the
// last digit lands `typing` after type1; the handle is pressed `press` before
// drag2, dragged for `drag`, let go `release` after it settles; an Enter's
// line writes over `enter`.
export const HAND = {
	key: KEY,
	group: GROUP,
	typing: KEYS[KEYS.length - 1],
	press: 0.18,
	drag: 1.1,
	release: 0.22,
	enter: 0.45
};
const OVER = 0.3; // the drag's overshoot, in stops, settled by the end

// The demo's hand at time t, from the beats { q1, type1, e1, q2, drag2, e2 }
// (seconds: the first question written, the typing begun, Enter; the second
// question, the drag begun, Enter). Returns the state of both fields.
export function script(t, beats) {
	const { q1, type1, e1, q2, drag2, e2 } = beats;
	let n = 0;
	while (n < KEYS.length && type1 + KEYS[n] <= t) n++;
	const last = n > 0 ? type1 + KEYS[n - 1] : -Infinity;
	const x = span(t, drag2, drag2 + HAND.drag);
	const value = 1 + (DEMO.spice - 1) * smooth(x) + OVER * Math.sin(Math.PI * span(x, 0.65, 1));
	const held = t >= drag2 - HAND.press && t < drag2 + HAND.drag + HAND.release ? 1 : 0;
	return {
		q1: span(t, q1, q1 + 0.7),
		typed: DEMO.date.slice(0, n),
		caret: t >= q1 + 0.4 && t < e1 ? 1 : 0,
		steady: t - last < STEADY ? 1 : 0,
		enter1: span(t, e1, e1 + HAND.enter),
		q2: span(t, q2, q2 + 0.7),
		value,
		held,
		enter2: span(t, e2, e2 + HAND.enter),
		done: span(t, e2 + HAND.enter, e2 + HAND.enter + 0.4)
	};
}
