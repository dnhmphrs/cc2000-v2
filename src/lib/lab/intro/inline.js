// ── Intro: inline — the sentence completed by hand ───────────────────────────
// The title card types as the terminal types it (log-dawn's makeTerminal, no
// command line) and its full stop STAYS a full stop: the frame is frozen
// there and nothing zooms. The caret drops two rows and the terminal carries
// on in its own voice, face and pitch, with BLANKS in the sentence that the
// hand fills in place:
//
//   you were born on dd.mm.yyyy
//   and you take it __/10 spicy
//
// The date's blank is printed as its mask: dd . mm . yyyy, the letters faint,
// each group on its own underline. The caret steps into it and the digits
// are typed over the mask, the caret going cell to cell past the dots
// (Backspace takes them back). A day, month or year that cannot be one is
// underlined in a muted red as soon as its group is in. With eight in, the
// caret waits after the blank for Enter. Enter: a gold line writes under the
// date, the underlines go, and it reads as text. Then the terminal types the
// second line, and a slider is ruled under it as a terminal row of its own:
// `1`, ten stops two columns apart (more on a narrow board), `10`. Its
// handle is a narrow block, and the blank reads the handle. The number in it
// ROLLS as the handle is dragged, like an odometer with detents (it clicks
// over as the handle passes half-way between stops), and the handle snaps
// when it is let go. The caret waits after "spicy" for the sentence's
// end, and Enter types it: the caret closes to a full stop lit gold, the one
// point of light. The slider goes, the blank closes up round its number, and
// the title, dimmed while the questions were asked, comes back. The whole
// sentence holds, then fades, and the run loops.
//
// The beats, in seconds of 20 (u = t / 20):
//   0     – 5.14  the title types (u 0 – 0.26), its stop lands at 4.94
//   5.14  – 6.7   the title alone, frozen (u 0.26 – 0.34)
//   6.4   – 7.2   the block rises 1.2 rows; the caret drops to the date row (6.7)
//   7.6   – 8.65  "you were born on " typed, then the mask (q1 8.33, u 0.42)
//   9.00          the date waits (wait1, u 0.45); scripted digits 9.0 – 10.5
//   11.20         Enter (e1, u 0.56): gold under the date, the underlines go
//   11.5  – 12.2  the block rises 0.8 rows; the caret drops to the spice row
//   12.2  – 13.32 "and you take it __/10 spicy" typed (q2 12.93, u 0.65)
//   13.47 – 14.07 the slider is ruled under it, its handle on 1
//   14.17         the spice waits (wait2, u 0.71); scripted drag 14.5 – 15.6
//   16.27         Enter (e2, u 0.81): the caret closes to the gold stop, the
//                 slider goes, the blank closes up, the title comes back
//   17.7  – 19.2  the sentence holds whole (u 0.88 – 0.96)
//   19.2  – 19.9  it fades; the run loops from the dark
//
// Every frame is a pure function of t and the hand; the only thing kept is
// the title's frozen frame, a cache.

import {
	PAL,
	TECH_FONT,
	stroke,
	disc,
	bloom,
	span,
	smooth,
	lerp,
	easeInOutCubic
} from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';

// The title card, at the flows' size, with no command line. Made once: its
// keystrokes fix the beats below, and its layout is cached per board size.
const TERM = makeTerminal(0.8, { cmd: false });
const FREEZE = TERM.stop + 0.2;
const SECONDS = 20;

// The two lines: a prompt typed, then its field printed.
const DATE_LINE = 'you were born on ';
const DATE_MASK = 'dd.mm.yyyy';
const DIGIT_AT = [0, 1, 3, 4, 6, 7, 8, 9]; // the mask's cells the eight digits go in
const GROUPS = [
	[0, 2],
	[3, 5],
	[6, 10]
];
const SPICE_LINE = 'and you take it ';
const BLANK = '__'; // two cells: room for 10
const SPICE_TAIL = '/10 spicy';
const ROW = { date: 4, spice: 5, slider: 6 }; // rows under the title's first line
// The slider: stop 1's column, and the columns from stop to stop — two, or
// more on a narrow board, where the type is small, so the track is never
// much under 200 px to drag along.
const SLIDER = { col: 2, pitch: 2, min: 200 };
const pitchOf = (cell) => Math.max(SLIDER.pitch, Math.ceil(SLIDER.min / (9 * cell)));

// The terminal's ink, its caret (log-dawn's TERM: 2.3 blinks a second, on
// for 0.58 of each, steady within 0.16 s of a keystroke).
const INK = 0.92 * 0.94;
const MASK = 0.26;
const BLINK = 2.3;
const DUTY = 0.58;
const STEADY = 0.16;
const blinkOn = (secs) => (((secs * BLINK) % 1) + 1) % 1 < DUTY;

// ── The keystrokes ───────────────────────────────────────────────────────────
// The terminal's rhythm, a little more deliberate than the card's: a base
// interval jittered by a seeded random, a hitch after every space, and a
// pause where the prompt ends and the field is printed. A table built once,
// so the count typed at any t is a lookup.
const KEY = 0.03;
function keystrokes(text, t0, seed, hitchAt) {
	let s = seed;
	const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = [];
	let t = t0;
	for (let i = 0; i < text.length; i++) {
		let dt = KEY * (0.55 + 0.9 * rnd());
		if (i > 0 && text[i - 1] === ' ') dt += KEY * 0.9;
		if (i === hitchAt) dt += 0.14;
		t += dt;
		out.push(t);
	}
	return out;
}
function typedBy(times, t) {
	let n = 0;
	while (n < times.length && times[n] <= t) n++;
	return n;
}

// ── The beats ────────────────────────────────────────────────────────────────
const C4 = 6.7; // the caret drops to the date row
const K4 = keystrokes(DATE_LINE + DATE_MASK, 7.6, 1972, DATE_LINE.length);
const Q1 = K4[DATE_LINE.length] - 0.05;
const W1 = K4[K4.length - 1] + 0.35;
const E1 = W1 + 2.2;
const C5 = E1 + 0.6; // the caret drops to the spice row
const K5 = keystrokes(SPICE_LINE + BLANK + SPICE_TAIL, E1 + 1.0, 2000, SPICE_LINE.length);
const Q2 = K5[SPICE_LINE.length] - 0.05;
const RULE = [K5[K5.length - 1] + 0.15, K5[K5.length - 1] + 0.75]; // the slider ruled
const W2 = RULE[1] + 0.1;
const E2 = W2 + 2.1;
const LIFT = [
	[C4 - 0.3, C4 + 0.5, 1.2],
	[C5 - 0.3, C5 + 0.4, 0.8]
];
const FADE = [SECONDS - 0.8, SECONDS - 0.1];

export const meta = {
	title:
		'inline — the sentence completed by hand: the date typed into its blank, the spice rolled in by a slider',
	order: 2,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 }
};

// ── Drawing ──────────────────────────────────────────────────────────────────
const TECH = (fs) => `400 ${fs}px ${TECH_FONT}`;

// A run of the terminal's type, its baseline at (x, y). The face is mono, so
// a string's characters land on the grid.
function type(ctx, s, x, y, fs, alpha, color = PAL.chalk) {
	if (!s || alpha <= 0.003) return;
	ctx.save();
	ctx.font = TECH(fs);
	ctx.textBaseline = 'alphabetic';
	ctx.globalAlpha = alpha;
	ctx.fillStyle = color;
	ctx.fillText(s, x, y);
	ctx.restore();
}

// The terminal's block caret in the cell at x on the baseline y, and the
// mask letter under it (if any) cut out of the block, as a terminal shows
// the character under its cursor.
function caret(ctx, x, y, G, alpha, under = '') {
	if (alpha <= 0.003) return;
	ctx.save();
	ctx.globalAlpha = 0.9 * alpha;
	ctx.fillStyle = PAL.chalk;
	ctx.fillRect(x, y - 0.78 * G.fs, G.cell, 0.92 * G.fs);
	ctx.restore();
	if (under) type(ctx, under, x, y, G.fs, alpha, PAL.ground);
}

// An underline under cells [a, b) of a row, inset a little at each end so
// a blank's groups read apart; `upto` writes it on.
function underline(ctx, G, x0, x1, y, opts) {
	const k = 0.1 * G.cell;
	const uy = y + 0.3 * G.fs;
	stroke(
		ctx,
		[
			[x0 + k, uy],
			[x1 - k, uy]
		],
		{ width: 1.1, cap: 'butt', ...opts }
	);
}

// The title: typed live up to the freeze, then that frame, cached.
function title(ctx, w, h, t, A, lift, frozen) {
	if (t < FREEZE) {
		TERM.draw(ctx, w, h, t / 10, t, t - 10);
		return;
	}
	// Dimmed while the questions are asked; back when they are answered.
	const dim = smooth(span(t, C4, C4 + 0.6)) * (1 - smooth(span(t, E2 + 0.6, E2 + 1.4)));
	const a = A * (1 - 0.48 * dim);
	if (a <= 0.003) return;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.drawImage(frozen(w, h), 0, -lift, w, h);
	ctx.restore();
}

// Whether group g of the date (0 day, 1 month, 2 year) is possible, once all
// its digits are in; a group still being typed is not judged.
const RANGES = [
	[1, 31],
	[1, 12],
	[1900, 2099]
];
function groupOk(typed, g) {
	const from = [0, 2, 4][g];
	const len = g === 2 ? 4 : 2;
	if (typed.length < from + len) return true;
	const n = Number(typed.slice(from, from + len));
	return n >= RANGES[g][0] && n <= RANGES[g][1];
}

// The date row: the prompt, the mask, the digits over it, the caret.
function dateRow(ctx, G, t, hand, A) {
	if (t < C4) return;
	const y = G.row(ROW.date);
	const P = DATE_LINE.length;
	const n = typedBy(K4, t);
	type(ctx, DATE_LINE.slice(0, Math.min(n, P)), G.col(0), y, G.fs, A * INK);

	const typed = (hand.typed ?? '').slice(0, 8);
	const printed = Math.max(0, n - P);
	const lineA = A * (1 - smooth(span(t, E1 + 0.45, E1 + 1.0)));
	// The mask: its dots are the terminal's type; its letters are faint, and
	// go as the digits come.
	for (let i = 0; i < printed; i++) {
		const ch = DATE_MASK[i];
		const filled = DIGIT_AT.indexOf(i) > -1 && DIGIT_AT.indexOf(i) < typed.length;
		if (ch === '.') type(ctx, ch, G.col(P + i), y, G.fs, A * INK);
		else if (!filled) type(ctx, ch, G.col(P + i), y, G.fs, MASK * lineA);
	}
	for (let k = 0; k < typed.length; k++)
		type(ctx, typed[k], G.col(P + DIGIT_AT[k]), y, G.fs, A * INK);
	// The blank's underlines, printed with it; a group typed in full that
	// cannot be a day, a month or a year (answer.js's ranges) is underlined
	// in a muted red, gently: Enter still takes it.
	GROUPS.forEach(([a, b], g) => {
		const shown = Math.min(1, Math.max(0, (printed - a) / (b - a)));
		if (shown <= 0) return;
		const bad = t < E1 && !groupOk(typed, g);
		underline(ctx, G, G.col(P + a), G.col(P + b), y, {
			color: bad ? PAL.red : PAL.chalk,
			alpha: (bad ? 0.6 : 0.42) * lineA,
			upto: shown
		});
	});
	// Enter: a gold line writes under the whole date, and goes with the rest.
	if (hand.enter1 > 0)
		underline(ctx, G, G.col(P), G.col(P + DATE_MASK.length), y, {
			color: PAL.gold,
			width: 1.5,
			alpha: 0.85 * lineA,
			upto: smooth(hand.enter1)
		});

	// The caret: blinking alone at the row's start, steady while the line is
	// typed, then in the blank's next empty cell (after it, once full) until
	// Enter.
	if (t >= E1) return;
	let c = 0;
	let steady = false;
	let under = '';
	if (t >= K4[0] && n < K4.length) {
		c = n;
		steady = t - K4[n - 1] < STEADY;
	} else if (n >= K4.length) {
		const k = typed.length;
		c = P + (k < 8 ? DIGIT_AT[k] : DATE_MASK.length);
		under = k < 8 ? DATE_MASK[DIGIT_AT[k]] : '';
		steady = hand.steady > 0;
	}
	if (steady || blinkOn(hand.secs)) caret(ctx, G.col(c), y, G, A, under);
}

// The number in the spice's blank, rolled: number k sits a roll's pitch
// below the baseline for every unit the roll is short of it, clipped to the
// blank. The roll has DETENTS: it holds a number while the handle is within
// 0.38 of its stop and rolls to the next across the half-way, so a dragged
// handle always reads (a half-way roll is two half numbers) and the roll
// clicks over as the handle passes between stops.
function rolled(ctx, value, cx, y, G, alpha) {
	if (alpha <= 0.003) return;
	const R = 1.08 * G.fs;
	const base = Math.floor(value + 1e-6);
	const v = base + smooth(span(value - base, 0.42, 0.58));
	const lo = Math.floor(v + 1e-6);
	ctx.save();
	ctx.beginPath();
	ctx.rect(cx - 1.5 * G.cell, y - 0.84 * G.fs, 3 * G.cell, 0.96 * G.fs);
	ctx.clip();
	for (const k of lo >= 10 ? [10] : [lo, lo + 1]) {
		const d = k - v;
		if (Math.abs(d) >= 1) continue;
		const s = String(k);
		type(ctx, s, cx - (s.length * G.cell) / 2, y + d * R, G.fs, alpha * (1 - 0.6 * Math.abs(d)));
	}
	ctx.restore();
}

// The spice row: the prompt, the blank and its number, the tail, the caret,
// and the full stop Enter types.
function spiceRow(ctx, G, t, hand, A, stopAt) {
	if (t < C5) return;
	const y = G.row(ROW.spice);
	const P = SPICE_LINE.length;
	const n = typedBy(K5, t);
	type(ctx, SPICE_LINE.slice(0, Math.min(n, P)), G.col(0), y, G.fs, A * INK);

	const v = Math.max(1, Math.min(10, hand.value ?? 1));
	// Answered, the blank closes up round its number (a 10 fills it).
	const shut = (Math.round(v) < 10 ? 1 : 0) * smooth(span(t, E2 + 0.2, E2 + 0.6)) * G.cell;
	const bx0 = G.col(P);
	const bx1 = G.col(P + BLANK.length) - shut;
	const lineA = A * (1 - smooth(span(t, E2 + 0.45, E2 + 1.0)));
	const cells = Math.min(BLANK.length, Math.max(0, n - P));
	if (cells > 0)
		underline(ctx, G, bx0, bx1, y, {
			color: PAL.chalk,
			alpha: 0.42 * lineA,
			upto: cells / BLANK.length
		});
	if (hand.enter2 > 0)
		underline(ctx, G, bx0, bx1, y, {
			color: PAL.gold,
			width: 1.5,
			alpha: 0.85 * lineA,
			upto: smooth(hand.enter2)
		});
	const tail = Math.min(SPICE_TAIL.length, Math.max(0, n - P - BLANK.length));
	type(ctx, SPICE_TAIL.slice(0, tail), bx1, y, G.fs, A * INK);
	// The number comes with the slider's handle.
	rolled(ctx, v, (bx0 + bx1) / 2, y, G, A * INK * smooth(span(t, RULE[1] - 0.2, RULE[1])));

	// The caret: alone at the row's start, steady while typing, then after
	// "spicy", where the sentence ends, until Enter types its stop.
	const end = bx1 + SPICE_TAIL.length * G.cell;
	if (t < E2) {
		let x = G.col(0);
		let steady = false;
		if (t >= K5[0] && n < K5.length) {
			x = G.col(n);
			steady = t - K5[n - 1] < STEADY;
		} else if (n >= K5.length) x = end;
		if (steady || blinkOn(hand.secs)) caret(ctx, x, y, G, A);
		return;
	}
	// Enter: the caret closes to the full stop (the title's own spot in its
	// cell), which lights gold — the one point of light — and stays.
	const X = end + stopAt.dx;
	const Y = y + stopAt.dy;
	const close = smooth(span(t, E2, E2 + 0.14));
	if (close < 1) {
		const bw = lerp(G.cell, stopAt.r * 2, close);
		const bh = lerp(0.92 * G.fs, stopAt.r * 2, close);
		ctx.save();
		ctx.globalAlpha = 0.9 * A;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(lerp(end, X - bw / 2, close), lerp(y - 0.78 * G.fs, Y - bh / 2, close), bw, bh);
		ctx.restore();
		return;
	}
	const gold = smooth(span(t, E2 + 0.08, E2 + 0.4));
	const flare = Math.exp(-(((t - (E2 + 0.36)) / 0.22) ** 2));
	const breath = 1 + 0.05 * Math.sin((2 * Math.PI * (t - E2)) / 3.4);
	const r = stopAt.r * (1 + 0.3 * flare) * breath;
	bloom(ctx, X, Y, r * (5 + 3 * flare), 'rgba(245, 193, 80, 0.5)', A * gold * (0.3 + 0.35 * flare));
	disc(ctx, X, Y, r, { fill: PAL.chalk, alpha: 0.9 * A * (1 - gold) });
	disc(ctx, X, Y, r, { fill: PAL.gold, alpha: A * gold });
}

// The slider: a terminal row under the spice line — `1`, a hairline through
// ten stops a pitch apart, `10` — and a narrow block for a handle. The
// track up to the handle is brighter; a held handle widens and the stop it
// will snap to grows. Returns this frame's geometry, for the pointer.
function slider(ctx, G, t, hand, A) {
	const sA = A * (1 - smooth(span(t, E2 + 0.15, E2 + 0.65)));
	const y = G.row(ROW.slider);
	const sy = y - 0.36 * G.fs;
	const pitch = pitchOf(G.cell);
	const X = (i) => G.col(SLIDER.col + pitch * (i - 1)) + G.cell / 2;
	const geo = { X1: X(1), X10: X(10), sy, cell: G.cell, step: G.step, on: false };
	if (t < RULE[0] || sA <= 0.003) return geo;
	const ruled = smooth(span(t, RULE[0] + 0.06, RULE[1] - 0.12));
	const hA = smooth(span(t, RULE[1] - 0.15, RULE[1]));
	const v = Math.max(1, Math.min(10, hand.value ?? 1));
	const hx = X(1) + (v - 1) * pitch * G.cell;
	const held = hand.held > 0;

	type(ctx, '1', G.col(0), y, G.fs, 0.42 * sA);
	stroke(
		ctx,
		[
			[X(1), sy],
			[X(10), sy]
		],
		{ width: 1, alpha: 0.22 * sA, upto: ruled }
	);
	if (hA > 0)
		stroke(
			ctx,
			[
				[X(1), sy],
				[hx, sy]
			],
			{ width: 1.2, alpha: 0.5 * sA * hA }
		);
	const near = Math.round(v);
	for (let i = 1; i <= 10; i++) {
		const on = smooth(span(ruled, (i - 1) / 9 - 0.02, (i - 1) / 9 + 0.06));
		if (on <= 0) continue;
		const passed = hA > 0 && i <= v + 1e-3;
		const snap = held && i === near;
		disc(ctx, X(i), sy, snap ? 2.3 : 1.4, {
			fill: PAL.chalk,
			alpha: sA * on * (snap ? 0.95 : passed ? 0.7 : 0.32)
		});
	}
	if (ruled >= 1) type(ctx, '10', G.col(SLIDER.col + pitch * 9 + 2), y, G.fs, 0.42 * sA);
	if (hA > 0) {
		const bw = (held ? 0.5 : 0.34) * G.cell;
		ctx.save();
		ctx.globalAlpha = (held ? 1 : 0.88) * sA * hA;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - bw / 2, sy - 0.46 * G.fs, bw, 0.92 * G.fs);
		ctx.restore();
	}
	geo.on = hA > 0.5 && t < E2;
	return geo;
}

export async function make({ board, answers }) {
	try {
		await document.fonts.load(`400 24px ${TECH_FONT}`);
	} catch {
		// The board's fallbacks will do.
	}
	// The title's last frame, the stop landed and still chalk: drawn once
	// per board size.
	let frozen = null;
	const frozenFrame = (w, h) => {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	};

	// The pointer reads the slider's geometry from the last frame drawn: a
	// press within a cell and a half of the track's ends and most of a row
	// of it (22 px at least, for small type) grabs the handle and puts it
	// there; a drag reads the pointer wherever it goes.
	let geo = null;
	const onSlider = (cx, cy, phase) => {
		if (!geo) return null;
		if (phase === 'down') {
			if (!geo.on) return null;
			const pad = 1.5 * geo.cell;
			if (
				cx < geo.X1 - pad ||
				cx > geo.X10 + pad ||
				Math.abs(cy - geo.sy) > Math.max(22, 0.7 * geo.step)
			)
				return null;
		}
		return 1 + (9 * (cx - geo.X1)) / (geo.X10 - geo.X1);
	};

	return {
		render(ctx, w, h, t, hand) {
			const L = TERM.layout(ctx, w, h);
			const A = t > SECONDS ? 0 : 1 - smooth(span(t, FADE[0], FADE[1]));
			// The block rises as each question is asked, so the line being
			// answered sits near the middle of the board.
			const lift = L.step * LIFT.reduce((s, [a, b, k]) => s + k * easeInOutCubic(span(t, a, b)), 0);
			const x0 = L.out[0].x0;
			const y0 = L.out[0].y - lift;
			const G = {
				fs: L.fs,
				step: L.step,
				cell: L.cell,
				col: (c) => x0 + c * L.cell,
				row: (r) => y0 + r * L.step
			};
			// The title's stop, as an offset in its cell from the baseline's
			// start: the answer's stop lands in the same spot of its cell.
			const l3 = L.out[2];
			const stopAt = {
				dx: L.stop.x - (l3.x0 + l3.xs[l3.text.length]),
				dy: L.stop.y - l3.y,
				r: L.stop.r
			};

			title(ctx, w, h, t, A, lift, frozenFrame);
			dateRow(ctx, G, t, hand, A);
			geo = slider(ctx, G, t, hand, A);
			spiceRow(ctx, G, t, hand, A, stopAt);
			answers.slider(onSlider);
		},
		resize() {
			frozen = null;
		}
	};
}
