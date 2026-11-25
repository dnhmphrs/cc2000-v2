// ── The scripted hand ────────────────────────────────────────────────────────
// The two answers given by no one: what a pinned frame (?at=) and ?demo=1 are
// answered with, so the run can be looked at without typing. A birthday,
// 14 · 02 · 1987, and a spice, 7.
//
// `script(t, beats)` is the hand at t — the digits typed one by one with a
// hand's unevenness (seeded), a pause, Enter; the slider's handle pressed,
// dragged from 1 to the answer along an ease with a slight overshoot and
// settle, released, Enter — as a pure function of t. answers.js gives the
// sketch this state when nobody is there, and a person's own when they are.

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
// The hand's timing, in seconds, so the run can lay its beats round it: the
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
