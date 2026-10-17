// ── Entry: the data entry, on the lattice ────────────────────────────────────
// The two answers the site takes — a birthday, and how spicy on a slider of 1
// to 10 — as FIELDS ON THE LATTICE the flow-kummer run forms from them: clean,
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

import { PAL, MATH_FONT, TECH_FONT, math, stroke, disc, span, smooth, clamp01 } from './board.js';
import { lit } from './ink.js';

export const DEMO = { date: '14021987', spice: 7 };
export const DATE_Q = 'when were you born?';
export const SPICE_Q = 'how spicy?';
export const DATE_CELLS = 10; // D D · M M · Y Y Y Y
export const STOPS = 10;
// Which cell each of the eight digits goes in, and where the separators sit.
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
const SEP_CELL = [2, 5];
// The terminal's caret (log-dawn's TERM): blinks a second, its duty, and how
// long after a keystroke it holds steady.
const BLINK = 2.3;
const DUTY = 0.58;
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

// ── The kit ──────────────────────────────────────────────────────────────────
export function makeEntry({ scale = 1 } = {}) {
	const k = scale;
	return {
		date: {
			cells: DATE_CELLS,
			q: DATE_Q,
			draw: (ctx, view, place, st) => drawDate(ctx, view, place, st, k)
		},
		slider: {
			stops: STOPS,
			q: SPICE_Q,
			draw: (ctx, view, place, st) => drawSlider(ctx, view, place, st, k)
		},
		script
	};
}

function local(view, { x = 0, y = 0, cell = 1 } = {}) {
	if (!view) return { X: x, Y: y, px: cell };
	const [X, Y] = view.to([x, y]);
	return { X, Y, px: cell * view.scale };
}

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

// The mono face's digit, measured once per size: its advance, and how far
// below a glyph's centre its baseline is (digits share a height; the
// separator's middle dot sits elsewhere). Keyed on the face being loaded, so
// a fallback's metrics are not kept once the real one arrives.
const METRICS = new Map();
function metrics(ctx, fs) {
	const loaded = typeof document !== 'undefined' && document.fonts?.check?.(TECH(16)) ? 1 : 0;
	const key = `${Math.round(fs * 4)}:${loaded}`;
	let m = METRICS.get(key);
	if (m) return m;
	ctx.save();
	ctx.font = TECH(fs);
	const d = ctx.measureText('0');
	const s = ctx.measureText('·');
	m = {
		adv: d.width,
		digit: (d.actualBoundingBoxAscent - d.actualBoundingBoxDescent) / 2,
		sep: (s.actualBoundingBoxAscent - s.actualBoundingBoxDescent) / 2
	};
	ctx.restore();
	if (METRICS.size > 48) METRICS.clear();
	METRICS.set(key, m);
	return m;
}

// log-orb's wiped patch: a rounded rect of board with a feathered edge, N
// nested fills from 1.6σ outside to 1.6σ inside, stacked to `a` in the
// middle — cheaper than a filter blur by an order of magnitude headless.
const WIPE_N = 8;
function wipe(ctx, cx, cy, W, H, r, soft, a) {
	if (a <= 0) return;
	const step = 1 - Math.pow(1 - Math.min(a, 0.999), 1 / WIPE_N);
	ctx.save();
	ctx.fillStyle = PAL.ground;
	ctx.globalAlpha = step;
	for (let i = 0; i < WIPE_N; i++) {
		const d = soft * 1.6 * (1 - (2 * i) / (WIPE_N - 1));
		const w = W + 2 * d;
		const h = H + 2 * d;
		if (w <= 0 || h <= 0) continue;
		ctx.beginPath();
		ctx.roundRect(cx - w / 2, cy - h / 2, w, h, Math.max(0, r + d));
		ctx.fill();
	}
	ctx.restore();
}

// The question, centred at (cx, cy) in log-orb's prompt type, written on by
// `q` over its patch.
function question(ctx, text, cx, cy, px, k, q, alpha) {
	if (q <= 0 || alpha <= 0.01) return;
	const qs = 0.4 * px * k;
	ctx.save();
	ctx.font = `italic 400 ${qs}px ${MATH_FONT}`;
	const W = ctx.measureText(text).width;
	ctx.restore();
	wipe(ctx, cx, cy, W + 3 * qs, 2.3 * qs, 1.3 * qs, 0.85 * qs, alpha * smooth(q * 3));
	math(ctx, text, cx, cy, { size: qs, upto: q, alpha: 0.7 * alpha, align: 'center' });
}

// Mono type centred in a cell: `mid` is the baseline's offset from the glyph's
// centre, from metrics().
function glyphs(ctx, items, fs, alpha) {
	if (alpha <= 0.004 || !items.length) return;
	ctx.save();
	ctx.font = TECH(fs);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = PAL.chalk;
	for (const [ch, x, y, mid, a = 1] of items) {
		ctx.globalAlpha = alpha * a;
		ctx.fillText(ch, x, y + mid);
	}
	ctx.restore();
}

// ── The date ─────────────────────────────────────────────────────────────────
function drawDate(ctx, view, place, st, k) {
	const { typed = '', caret = 0, steady = 0, alpha = 1, q = 1, enter = 0, secs = 0, lean = 0 } = st;
	if (alpha <= 0.01 || q <= 0) return;
	const { X, Y, px } = local(view, place);
	const n = DATE_CELLS;
	question(ctx, DATE_Q, X + (n / 2) * px, Y - 1.7 * px, px, k, q, alpha);
	// The field comes up under the question's first words.
	const show = smooth(span(q, 0.35, 1));
	if (show <= 0) return;
	const a = alpha * show;
	const dx = lean * px;
	// The cells: the lattice's own lines, a little brighter, as one path.
	ctx.save();
	ctx.globalAlpha = 0.26 * a;
	ctx.strokeStyle = PAL.chalk;
	ctx.lineWidth = 1.1 * k;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(X, Y);
	ctx.lineTo(X + n * px, Y);
	ctx.moveTo(X + dx, Y - px);
	ctx.lineTo(X + n * px + dx, Y - px);
	for (let i = 0; i <= n; i++) {
		ctx.moveTo(X + i * px, Y);
		ctx.lineTo(X + i * px + dx, Y - px);
	}
	ctx.stroke();
	ctx.restore();
	// The glyphs: the cell's centre, half a lean up the cell.
	const fs = 0.72 * px * k;
	const m = metrics(ctx, fs);
	const cx = (c) => X + (c + 0.5) * px + dx / 2;
	const cy = Y - px / 2;
	const items = SEP_CELL.map((c) => ['·', cx(c), cy, m.sep, 0.55]);
	const digits = typed.slice(0, DIGIT_CELL.length);
	for (let i = 0; i < digits.length; i++) items.push([digits[i], cx(DIGIT_CELL[i]), cy, m.digit]);
	glyphs(ctx, items, fs, a);
	// The caret: a block of the mono cell in the next empty cell — a bar at
	// the field's end once it is full — steady within a keystroke, blinking
	// on the clock otherwise.
	if (caret > 0) {
		const on = steady > 0 || (secs * BLINK) % 1 < DUTY;
		if (on) {
			ctx.save();
			ctx.globalAlpha = 0.9 * a * clamp01(caret);
			ctx.fillStyle = PAL.chalk;
			if (digits.length < DIGIT_CELL.length) {
				const bx = cx(DIGIT_CELL[digits.length]);
				ctx.fillRect(bx - m.adv / 2, cy - 0.45 * fs, m.adv, 0.9 * fs);
			} else {
				const bx = X + n * px + dx / 2 - 0.1 * px;
				ctx.fillRect(bx - k, cy - 0.45 * fs, 2 * k, 0.9 * fs);
			}
			ctx.restore();
		}
	}
	// Enter: the row lights along the field — it is the real axis — and the
	// lattice points along it light as the line reaches them.
	if (enter > 0) {
		stroke(
			ctx,
			[
				[X, Y],
				[X + n * px, Y]
			],
			{ color: PAL.gold, width: 2.6 * k, alpha, upto: enter, glow: 8 }
		);
		const r = 0.05 * px * k;
		for (let j = 0; j <= n; j++) {
			const la = smooth(span(enter, j / n - 0.04, j / n + 0.1));
			if (la > 0) lit(ctx, X + j * px, Y, r, alpha * la);
		}
	}
}

// ── The slider ───────────────────────────────────────────────────────────────
function drawSlider(ctx, view, place, st, k) {
	const { value = 1, held = 0, alpha = 1, q = 1, enter = 0 } = st;
	if (alpha <= 0.01 || q <= 0) return;
	const { X, Y, px } = local(view, place);
	const L = (STOPS - 1) * px;
	question(ctx, SPICE_Q, X + L / 2, Y - 1.7 * px, px, k, q, alpha);
	const show = smooth(span(q, 0.35, 1));
	if (show <= 0) return;
	const a = alpha * show;
	const v = Math.min(STOPS, Math.max(1, value));
	const hx = X + (v - 1) * px;
	const near = Math.round(v);
	// The track, along the row.
	stroke(
		ctx,
		[
			[X, Y],
			[X + L, Y]
		],
		{ color: PAL.chalk, width: 1.5 * k, alpha: 0.4 * a }
	);
	// Enter: the gold from stop 1 to the handle.
	if (enter > 0)
		stroke(
			ctx,
			[
				[X, Y],
				[hx, Y]
			],
			{ color: PAL.gold, width: 2.6 * k, alpha, upto: enter, glow: 8 }
		);
	// The stops: passed ones lit faintly; the one under a held handle ringed.
	const r = 0.065 * px * k;
	for (let i = 0; i < STOPS; i++) {
		const passed = i + 1 <= v + 1e-3;
		const under = held > 0 && i + 1 === near;
		disc(ctx, X + i * px, Y, under ? r * 1.7 : r, {
			fill: PAL.chalk,
			alpha: a * (passed ? 0.8 : 0.32),
			ring: under ? PAL.gold : null,
			ringWidth: 1.2 * k
		});
	}
	// The end marks, under the end stops; the value, over the handle.
	const ms = 0.3 * px * k;
	const mm = metrics(ctx, ms);
	glyphs(
		ctx,
		[
			['1', X, Y + 0.5 * px, mm.digit, 0.55],
			['10', X + L, Y + 0.5 * px, mm.digit, 0.55]
		],
		ms,
		a
	);
	// The handle: lit, more so in the hand, flaring on Enter.
	const flare = enter > 0 && enter < 1 ? Math.sin(Math.PI * enter) : 0;
	const hr = 0.11 * px * k * (1 + 0.3 * held) * (1 + 0.5 * flare);
	lit(ctx, hx, Y, hr, a * (0.85 + 0.15 * held));
	const vs = 0.36 * px * k;
	const mv = metrics(ctx, vs);
	glyphs(ctx, [[String(near), hx, Y - 0.5 * px, mv.digit]], vs, 0.95 * a);
}
