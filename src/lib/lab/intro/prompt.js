// ── Intro: prompt — the terminal carries on ─────────────────────────────────
// The title card is the terminal's (log-dawn makeTerminal, no command): the
// caret alone, the three lines typed, the full stop — and the stop STAYS a
// full stop: the frame is frozen there (no swell, no orb, no zoom) and the
// terminal simply goes on, in its own face, size and line pitch, on its own
// character grid. Nothing is drawn that a terminal could not draw.
//
//   the stop    the caret closes to the dot (the card's own last keystroke)
//               and the frame freezes.
//   newline     the caret comes back on the next row — the blank line — and
//               waits a blink or two, then drops a row and the machine types
//               WHEN WERE YOU BORN? at the card's pace.
//   the date    the next row is the user's: a prompt mark `>` and the mask
//               DD.MM.YYYY in dim, printed whole. The digits replace the
//               mask's letters as they are typed and the caret — a block, the
//               mask's letter under it in reverse — steps to the next digit,
//               skipping the dots; once eight are in it waits past the field.
//               A date that cannot be (day past 31, month past 12, a year
//               outside 1900–2099) shows its group in rose, gently; Enter
//               still takes it. Enter: the caret leaves, the line SETTLES —
//               the dots come up to full chalk — and the mark turns gold.
//   the spice   a blank row, HOW SPICY?, and the user's row: an ASCII slider,
//               `> 1 [■■■■■□□□□□] 10`, its ten cells drawn as the terminal
//               draws block elements (filled to the value, empty ones an
//               outline). The handle is the terminal's block caret, on the
//               value's cell; press anywhere on the row, from the `1` to the
//               `10`, and it is under the pointer, dragged smoothly while the
//               cells fill to the nearest stop, snapping to it on release.
//               ← →, a digit (0 is 10), Enter: the caret leaves, the mark
//               turns gold.
//   the close   a blank row and the machine echoes the two answers as one
//               record, `14.02.1987 · 7`; the caret blinks on the empty row
//               under it; a hold, and the board goes dark for the loop.
//
// The terminal SCROLLS as a terminal does: the rows are a grid hung off the
// title's first line, and a row past the screen's working depth (three
// quarters down) scrolls the whole page up a line, smoothly over a sixth of a
// second — the VT100's smooth scroll — so the input row is always at the same
// height and the whole conversation, title and all, stays on the board.
//
// Every frame is a pure function of t and the hand: the machine's keystrokes
// are tables of times built once; the scroll is a sum of eased steps at the
// rows' fixed times (none of them inside a wait, so the clock's jump on Enter
// skips nothing); the caret blinks on hand.secs; the frozen title is a cached
// canvas.

import { PAL, TECH_FONT, span, smooth } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';

const SCALE = 0.8; // the flows' title card: the card's own type, a size smaller
const STOP = makeTerminal(SCALE, { cmd: false }).stop;

const Q1 = 'WHEN WERE YOU BORN?';
const Q2 = 'HOW SPICY?';
const MASK = 'DD.MM.YYYY';
const DIGIT_COL = [0, 1, 3, 4, 6, 7, 8, 9]; // where the eight digits go in the mask
const GROUP = [0, 0, 1, 1, 2, 2, 2, 2]; // day, month, year
const MARK = 2; // the mask starts two columns in, after `> `
// The slider row: `> 1 [■■■■■■■■■■] 10` — the cells at columns 5…14.
const LO = 2;
const OPEN = 4;
const CELL0 = 5;
const SHUT = 15;
const HI = 17;

// The caret, as log-dawn's: blinks a second, its duty, steady after a key.
const BLINK = 2.3;
const DUTY = 0.58;
const STEADY = 0.16;
const KEY = 0.026; // the machine's base interval between characters
const SCROLL = 0.17; // one line's smooth scroll

// The machine's keystrokes for a line typed from t0: the base interval
// jittered by a seeded random, and a hitch after every space.
function keys(text, t0, seed) {
	let s = seed;
	const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = t0;
	const out = [];
	for (let i = 0; i < text.length; i++) {
		let dt = KEY * (0.55 + 0.9 * rnd());
		if (i > 0 && text[i - 1] === ' ') dt += KEY * 0.9;
		t += dt;
		out.push(t);
	}
	return out;
}
const typedBy = (times, t) => {
	let n = 0;
	while (n < times.length && times[n] <= t) n++;
	return n;
};

// ── The beats, seconds ───────────────────────────────────────────────────────
const T = { stop: STOP, freeze: STOP + 0.2 };
T.nl3 = STOP + 1.0; // the caret on the blank row
T.nl4 = T.nl3 + 0.8; // and down to the question's
const K1 = keys(Q1, T.nl4 + 0.08, 101);
T.q1 = K1[K1.length - 1] + 0.32; // the date's row printed: mark and mask
T.wait1 = T.q1 + 0.45;
T.e1 = T.wait1 + 2.4;
T.nl6 = T.e1 + 0.75;
T.nl7 = T.nl6 + 0.5;
const K2 = keys(Q2, T.nl7 + 0.08, 202);
T.q2 = K2[K2.length - 1] + 0.32; // the slider's row printed
T.wait2 = T.q2 + 0.45;
T.e2 = T.wait2 + 2.3;
T.nl9 = T.e2 + 0.62;
T.nl10 = T.nl9 + 0.36;
const KR = keys('14.02.1987 · 10', T.nl10 + 0.06, 303); // the record's longest
T.nl11 = KR[KR.length - 1] + 0.32;
const SECONDS = 20;
const FADE = [SECONDS - 0.6, SECONDS];

// Each row of the terminal below the title, and the second it is reached.
const ROWS = [
	[3, T.nl3],
	[4, T.nl4],
	[5, T.q1],
	[6, T.nl6],
	[7, T.nl7],
	[8, T.q2],
	[9, T.nl9],
	[10, T.nl10],
	[11, T.nl11]
];

const r2 = (x) => Math.round(x * 100) / 100;
export const meta = {
	title: 'the terminal carries on: the questions typed under the title, answered at a prompt',
	order: 1,
	seconds: SECONDS,
	beats: {
		q1: r2(T.q1),
		wait1: r2(T.wait1),
		e1: r2(T.e1),
		q2: r2(T.q2),
		wait2: r2(T.wait2),
		e2: r2(T.e2)
	}
};

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

export async function make({ board, answers, live }) {
	await document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null);
	const term = makeTerminal(SCALE, { cmd: false });
	const B = meta.beats;

	// The title, frozen a fifth of a second after its stop: drawn once per
	// board size.
	let frozen = null;
	let frozenKey = '';
	function frozenFrame(w, h) {
		const key = `${w}x${h}x${board.dpr}`;
		if (frozen && frozenKey === key) return frozen;
		const c = document.createElement('canvas');
		c.width = Math.round(w * board.dpr);
		c.height = Math.round(h * board.dpr);
		const x = c.getContext('2d');
		x.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
		term.draw(x, w, h, T.freeze / 10, T.freeze, T.freeze - 10);
		frozen = c;
		frozenKey = key;
		return c;
	}

	// The grid, per board size: the title's left edge and first baseline, its
	// pitch and cell, and how many rows fit above the working depth.
	let G = null;
	function grid(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = term.layout(ctx, w, h);
		const y0 = L.out[0].y;
		const deep = Math.max(4, Math.floor((h * 0.76 - y0) / L.step));
		ctx.save();
		ctx.font = TECH(L.fs);
		const cap = ctx.measureText('M').actualBoundingBoxAscent;
		ctx.restore();
		G = { w, h, x0: L.out[0].x0, y0, step: L.step, fs: L.fs, cell: L.cell, deep, cap };
		return G;
	}
	// The scroll at t, in lines.
	const scrollAt = (t) => {
		let s = 0;
		for (const [row, at] of ROWS) if (row > G.deep) s += smooth(span(t, at, at + SCROLL));
		return s;
	};

	// The slider's geometry this frame, for the pointer and the cursor.
	let geo = null;
	const onSlider = (x, y) =>
		geo &&
		y > geo.mid - 0.62 * geo.step &&
		y < geo.mid + 0.62 * geo.step &&
		x > geo.left &&
		x < geo.right;
	if (live) {
		// A grab hand over the slider while it is asked: the board takes no
		// pointer events itself, so the page's cursor is set.
		let shown = '';
		let held = false;
		const set = (c) => {
			if (c === shown) return;
			shown = c;
			document.documentElement.style.cursor = c;
		};
		window.addEventListener('pointerdown', (e) => {
			held = geo?.asking && onSlider(e.clientX, e.clientY);
			if (held) set('grabbing');
		});
		window.addEventListener('pointerup', (e) => {
			held = false;
			set(geo?.asking && onSlider(e.clientX, e.clientY) ? 'grab' : '');
		});
		window.addEventListener('pointermove', (e) => {
			if (held) return set('grabbing');
			set(geo?.asking && onSlider(e.clientX, e.clientY) ? 'grab' : '');
		});
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = grid(ctx, w, h);
			const fade = 1 - smooth(span(t, FADE[0], FADE[1]));
			geo = null;
			if (fade <= 0) {
				answers.slider(() => null);
				return;
			}

			// The title: the terminal's own until its stop has closed, then
			// frozen, and scrolled with the page.
			const S = scrollAt(t);
			if (t < T.freeze) {
				term.draw(ctx, w, h, t / 10, t, t - 10);
				answers.slider(() => null);
				return;
			}
			ctx.save();
			ctx.globalAlpha = fade;
			ctx.drawImage(frozenFrame(w, h), 0, -S * g.step, w, h);
			ctx.restore();

			const { x0, step, fs, cell } = g;
			const X = (col) => x0 + col * cell;
			const Y = (row) => g.y0 + (row - S) * step;
			const mid = (row) => Y(row) - g.cap / 2; // the caps' middle
			ctx.save();
			ctx.font = TECH(fs);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			const put = (ch, col, row, color, a) => {
				if (a <= 0.004 || ch === ' ') return;
				ctx.globalAlpha = fade * a;
				ctx.fillStyle = color;
				ctx.fillText(ch, X(col), Y(row));
			};
			const say = (text, n, row) => {
				for (let i = 0; i < n; i++) put(text[i], i, row, PAL.chalk, 0.92);
			};
			// The block caret over a cell, and the glyph under it in reverse.
			const block = (col, row, a, under = null) => {
				ctx.globalAlpha = fade * a;
				ctx.fillStyle = PAL.chalk;
				ctx.fillRect(X(col), Y(row) - 0.78 * fs, cell, 0.92 * fs);
				if (under) put(under, col, row, PAL.ground, 0.95);
			};
			const blinkOn = (since) => t - since < STEADY || (((hand.secs * BLINK) % 1) + 1) % 1 < DUTY;
			// The prompt mark: chalk while it asks, gold once answered.
			const mark = (row, enter) => {
				put('>', 0, row, PAL.chalk, 0.8 * (1 - enter));
				put('>', 0, row, PAL.gold, 0.95 * enter);
			};

			// ── The questions, typed by the machine ──────────────────────────
			if (t >= T.nl4) say(Q1, typedBy(K1, t), 4);
			if (t >= T.nl7) say(Q2, typedBy(K2, t), 7);

			// ── The date ──────────────────────────────────────────────────────
			if (t >= T.q1) {
				const e = t >= B.e1 ? smooth(hand.enter1) : 0;
				const typed = (hand.typed || '').slice(0, 8);
				const bad = typed.length === 8 && !hand.valid && t < B.e1 ? badGroups(typed) : null;
				mark(5, e);
				for (let c = 0; c < MASK.length; c++) {
					const ch = MASK[c];
					const i = DIGIT_COL.indexOf(c);
					if (i >= 0 && i < typed.length) {
						const rose = bad && bad[GROUP[i]];
						put(typed[i], MARK + c, 5, rose ? PAL.rose : PAL.chalk, rose ? 0.9 : 0.96);
					} else if (i >= 0) put(ch, MARK + c, 5, PAL.chalk, 0.26);
					else {
						// A dot: dim in the mask, chalk once a digit is past it.
						const past = typed.length > DIGIT_COL.findIndex((d) => d > c);
						const a = past ? 0.85 : 0.3;
						put(ch, MARK + c, 5, PAL.chalk, a + (0.92 - a) * e);
					}
				}
				// The caret: on the next digit's cell, the mask's letter under
				// it in reverse; past the field once it is full. On from the
				// moment the row is printed (not on hand.caret, which comes up
				// 0.4 s after q1 — and so never, live, if the wait is sooner).
				if (t < B.e1) {
					const n = typed.length;
					if (hand.steady > 0 || blinkOn(T.q1)) {
						if (n < 8) block(MARK + DIGIT_COL[n], 5, 0.9, MASK[DIGIT_COL[n]]);
						else block(MARK + MASK.length, 5, 0.9);
					}
				}
			}

			// ── The spice ─────────────────────────────────────────────────────
			if (t >= T.q2) {
				const e = t >= B.e2 ? smooth(hand.enter2) : 0;
				const asking = t < B.e2;
				const v = Math.max(1, Math.min(10, hand.value));
				const near = Math.round(v);
				mark(8, e);
				put('1', LO, 8, PAL.chalk, 0.55);
				put('[', OPEN, 8, PAL.chalk, 0.75);
				put(']', SHUT, 8, PAL.chalk, 0.75);
				put('1', HI, 8, PAL.chalk, 0.55);
				put('0', HI + 1, 8, PAL.chalk, 0.55);
				// The cells: ■ to the nearest stop, □ past it — drawn as a
				// terminal draws block elements, on the cell grid.
				const side = Math.min(0.78 * cell, 0.66 * g.cap);
				const cy = mid(8);
				for (let i = 0; i < 10; i++) {
					const cx = X(CELL0 + i) + cell / 2;
					ctx.fillStyle = PAL.chalk;
					ctx.strokeStyle = PAL.chalk;
					if (i < near) {
						ctx.globalAlpha = fade * (0.86 + 0.08 * e);
						ctx.fillRect(cx - side / 2, cy - side / 2, side, side);
					} else {
						ctx.globalAlpha = fade * 0.34;
						ctx.lineWidth = 1;
						ctx.strokeRect(cx - side / 2 + 0.5, cy - side / 2 + 0.5, side - 1, side - 1);
					}
				}
				// The handle: the block caret on the value's cell, under the
				// pointer while it is held; steady (a handle does not blink).
				const at = hand.held > 0 ? v : near;
				const hx = X(CELL0) + (at - 1) * cell;
				if (asking) {
					ctx.globalAlpha = fade * (hand.held > 0 ? 1 : 0.88);
					ctx.fillStyle = PAL.chalk;
					ctx.fillRect(hx, Y(8) - 0.78 * fs, cell, 0.92 * fs);
				}
				geo = {
					asking,
					c1: X(CELL0) + cell / 2,
					cell,
					step,
					mid: cy,
					left: X(LO) - 0.6 * cell,
					right: X(HI + 2) + 0.6 * cell
				};
			}
			if (geo) {
				const G2 = geo;
				answers.slider((x, y, phase) => {
					if (phase === 'down' && !onSlider(x, y)) return null;
					return 1 + (x - G2.c1) / G2.cell;
				});
			} else answers.slider(() => null);
			// For a test driving it by hand: the clock, what is asked, the
			// fields, and where the slider is.
			if (window.__lab) {
				const { asking: a, typed, value, held } = hand;
				Object.assign(window.__lab, { t, asking: a, typed, value, held, slider: geo });
			}

			// ── The machine's newlines and the record ─────────────────────────
			// The caret on each blank row, and on the empty row at the close.
			for (const [row, from, to] of [
				[3, T.nl3, T.nl4],
				[6, T.nl6, T.nl7],
				[9, T.nl9, T.nl10],
				[11, T.nl11, Infinity]
			])
				if (t >= from && t < to && blinkOn(from)) block(0, row, 0.9);
			// The questions' caret, as they are typed.
			for (const [row, from, K, text] of [
				[4, T.nl4, K1, Q1],
				[7, T.nl7, K2, Q2]
			]) {
				const n = typedBy(K, t);
				const end = row === 4 ? T.q1 : T.q2;
				if (t >= from && t < end && blinkOn(n > 0 ? K[n - 1] : from))
					block(Math.min(n, text.length), row, 0.9);
			}
			// The record: the two answers, echoed as one line.
			if (t >= T.nl10) {
				const d = (hand.typed || '').padEnd(8, ' ');
				const rec = `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 8)} · ${Math.round(hand.value)}`;
				const n = typedBy(KR, t);
				for (let i = 0; i < Math.min(n, rec.length); i++)
					put(rec[i], i, 10, PAL.chalk, rec[i] === '·' ? 0.75 : 0.92);
				if (t < T.nl11 && blinkOn(n > 0 ? KR[n - 1] : T.nl10))
					block(Math.min(n, rec.length), 10, 0.9);
			}
			ctx.restore();
		}
	};
}

// Which of a full date's groups cannot be: [day, month, year].
function badGroups(d) {
	const day = Number(d.slice(0, 2));
	const month = Number(d.slice(2, 4));
	const year = Number(d.slice(4, 8));
	return [day < 1 || day > 31, month < 1 || month > 12, year < 1900 || year > 2099];
}
