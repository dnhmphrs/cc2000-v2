// ── Intro: scroll — a real shell's rhythm ────────────────────────────────────
// The title card is the terminal's (log-dawn makeTerminal, no command line),
// typed in the middle of the board and frozen the moment its full stop has
// landed — never zoomed into. From there the board is a TERMINAL's screen: a
// grid of rows at the title's own pitch, in its face and size, and every new
// line arrives at the BOTTOM row while the history scrolls up a row a line.
//
//   the drop    a beat on the full stop, then the newline: the block caret
//               appears under the title and ticks down the empty rows to the
//               bottom of the screen, a row a tick; a few more newlines (two
//               on a 16:10 board, up to six on a tall one) scroll the screen up
//               under it, and the title rises.
//   the date    `when were you born?` typed at the bottom at the title's rate;
//               a newline scrolls it up and the input line is under it:
//               `> dd.mm.yyyy`, the mask dim, the caret the terminal's block
//               on the next digit (inverting the mask letter under it). The
//               digits are printed whole as they come; a wrong date (eight
//               digits that are not a day) goes rose, gently. Enter: the
//               answer flashes gold and settles to chalk, and the screen
//               scrolls on — the caret on a fresh row.
//   the spice   a newline, `how spicy?`, a newline, and the input line is a
//               row of TWENTY bars, the value ×2 of them lit, with the number
//               at the end. The caret is the handle: the block sits in the
//               cell after the lit bars and follows the pointer exactly while
//               dragged (the bar under the boundary lit by its fraction),
//               snapping to the nearest stop on release; ← → and a digit move
//               it a stop at a time. Enter: the lit bars and the number flash
//               gold and settle.
//   the close   the answers land as the machine's own log line (`14.02.1987
//               7`), the screen scrolls a last line, and its caret closes to a
//               point — the title's full stop again — that lights a dim gold
//               and holds. By then the title has risen off the top but for
//               its last line.
//
// Everything above the title's original top dims with height, so the eye
// stays at the bottom where the input is, and goes at the top edge. Every
// frame is a function of t and the hand: the scroll is a sum of eased steps at fixed beats (the burst's
// count, k, is the board's: enough that the title's last line ends a row and
// a half under the top edge), the machine's typing a seeded keystroke table,
// the caret blinking on hand.secs.

import { PAL, TECH_FONT, span, smooth, lerp, clamp01 } from '../log/board.js';
import { lit } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';

// The title's own timing: the full stop lands at STOP (≈ 4.94 s).
const STOP = makeTerminal(0.8, { cmd: false }).stop;
const r2 = (x) => Math.round(x * 100) / 100;

// ── The beats, in seconds ────────────────────────────────────────────────────
const B = (() => {
	const s = STOP;
	const freeze = s + 0.2; // the title's frame from here on
	const drop = [s + 1.8, s + 2.1]; // the caret down the empty rows
	const burst = s + 2.18; // the first of the burst's scrolls, TICK apart
	const q1 = s + 2.62; // the date's question typed at the bottom
	const in1 = q1 + 0.75; // newline: the input line
	const wait1 = in1 + 0.9;
	const e1 = wait1 + 2.8;
	const nl2 = e1 + 0.45; // newline (the row Enter left stays blank)
	const q2 = nl2 + 0.06;
	const in2 = q2 + 0.55;
	const wait2 = in2 + 0.9;
	const e2 = wait2 + 2.7;
	const nl3 = e2 + 0.45;
	const rec = nl3 + 0.06; // the answers as the machine's log line
	const last = e2 + 1.1; // the last line
	const close = e2 + 1.6; // its caret closes to the point
	const o = { freeze, drop, burst, q1, in1, wait1, e1, nl2, q2, in2, wait2, e2, nl3, rec, last };
	for (const key in o) o[key] = Array.isArray(o[key]) ? o[key].map(r2) : r2(o[key]);
	o.close = r2(close);
	return o;
})();
const SECONDS = r2(B.e2 + 3.4);
const TICK = 0.06; // the burst's newlines
const SCROLL = 0.075; // a row's scroll
const BURST_MAX = 6;

export const meta = {
	title: 'scroll — a real shell: lines arrive at the bottom, the title scrolls off the top',
	order: 3,
	seconds: SECONDS,
	beats: { q1: B.q1, wait1: B.wait1, e1: B.e1, q2: B.q2, wait2: B.wait2, e2: B.e2 }
};

// ── The type ─────────────────────────────────────────────────────────────────
const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
const Q1 = 'when were you born?';
const Q2 = 'how spicy?';
const MASK = 'dd.mm.yyyy';
const DIGIT_AT = [0, 1, 3, 4, 6, 7, 8, 9]; // the digits' cells in the field
const FIELD = 2; // the field's first cell, after '> '
const BARS = 20;
const NUM_END = FIELD + BARS + 4; // the number's right edge, in cells
// The terminal's: chalk at the output's alpha, the caret's blink and duty.
const A_TEXT = 0.92 * 0.94;
const A_PROMPT = 0.38;
const A_MASK = 0.2;
const BLINK = 2.3;
const DUTY = 0.58;
const STEADY = 0.16;

// The machine's keystrokes: the title's output rate (21 ms a character,
// jittered, a hitch after a space), seeded, so the count typed by any t is a
// lookup.
function keys(text, seed, base = 0.021) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const out = [];
	let t = 0;
	for (let i = 0; i < text.length; i++) {
		let dt = base * (0.55 + 0.9 * rnd());
		if (i > 0 && text[i - 1] === ' ') dt += base * 0.9;
		t += dt;
		out.push(t);
	}
	return out;
}
const K1 = keys(Q1, 31);
const K2 = keys(Q2, 47);
const KR = keys('00.00.0000  10', 59, 0.017); // the log line's shape
const typedBy = (times, dt) => {
	let n = 0;
	while (n < times.length && times[n] <= dt) n++;
	return n;
};

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const GOLD = hex(PAL.gold);
const CHALK = hex(PAL.chalk);
const ROSE = hex(PAL.rose);
const mixRGB = (a, b, k) =>
	`rgb(${a.map((x, i) => Math.round(lerp(x, b[i], clamp01(k)))).join(', ')})`;
// An answer's colour: gold on Enter, settling to chalk (or rose, if wrong).
const settled = (enter, base = CHALK) => (enter > 0 ? mixRGB(GOLD, base, smooth(enter)) : null);

// ── The sketch ───────────────────────────────────────────────────────────────
export async function make({ board, answers }) {
	try {
		await document.fonts.load(`400 24px ${TECH_FONT}`);
	} catch {
		// the fallbacks will do
	}
	const term = makeTerminal(0.8, { cmd: false });
	let L = null;
	let frozen = null;
	const widths = new Map();

	// The screen's grid: the title's rows, its pitch, the bottom row, and the
	// burst's count.
	function layout(ctx, w, h) {
		if (L && L.w === w && L.h === h) return L;
		const T = term.layout(ctx, w, h);
		const { fs, step, cell, out, stop } = T;
		const x0 = out[0].x0;
		const y0 = out[0].y;
		// The bottom row: on the title's grid, about three rows up.
		const N = Math.max(2, Math.floor((h - 2.8 * step - out[2].y) / step));
		const Rb = 2 + N;
		// Enough newlines in the burst that the title's last line ends at the
		// top edge: the exchange scrolls seven rows after it.
		const k = Math.max(1, Math.min(BURST_MAX, Math.round((out[2].y - 1.75 * step) / step) - 7));
		const R = { q1: Rb + k };
		R.in1 = R.q1 + 1;
		R.q2 = R.q1 + 3;
		R.in2 = R.q1 + 4;
		R.rec = R.q1 + 6;
		R.last = R.q1 + 7;
		L = { w, h, fs, step, cell, x0, y0, N, Rb, k, R, stop, out };
		frozen = null;
		widths.clear();
		return L;
	}

	// The title as it stands after its full stop, kept as a picture.
	function frozenFrame() {
		if (frozen) return frozen;
		const c = document.createElement('canvas');
		c.width = Math.round(board.w * board.dpr);
		c.height = Math.round(board.h * board.dpr);
		const x = c.getContext('2d');
		x.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
		term.draw(x, board.w, board.h, B.freeze / 10, B.freeze, B.freeze - 10);
		frozen = c;
		return c;
	}

	// A line's prefix widths in the face, for left-set machine text.
	function prefix(ctx, text) {
		const key = text;
		let xs = widths.get(key);
		if (xs) return xs;
		ctx.save();
		ctx.font = TECH(L.fs);
		xs = [0];
		for (let i = 1; i <= text.length; i++) xs.push(ctx.measureText(text.slice(0, i)).width);
		ctx.restore();
		if (widths.size > 64) widths.clear();
		widths.set(key, xs);
		return xs;
	}

	// The scroll, in rows, at t: a sum of eased steps.
	function scrollAt(t) {
		let s = 0;
		const ease = (a) => smooth(span(t, a, a + SCROLL));
		for (let m = 0; m < L.k; m++) s += ease(B.burst + m * TICK);
		for (const a of [B.in1, B.e1, B.nl2, B.in2, B.e2, B.nl3, B.last]) s += ease(a);
		return s;
	}

	function render(ctx, w, h, t, hand) {
		layout(ctx, w, h);
		const { fs, step, cell, x0, y0 } = L;
		const S = scrollAt(t);
		const rowY = (r) => y0 + (r - S) * step;
		// History dims as it rises past where the title began, and goes as it
		// reaches the top edge.
		const fade = (y) => lerp(0.4, 1, smooth(y / y0)) * smooth(span(y, 0.9 * step, 1.7 * step));
		const blinkOn = (steady) => steady || (((hand.secs * BLINK) % 1) + 1) % 1 < DUTY;
		const cellL = (c) => x0 + c * cell;
		const caret = (x, y, a = 0.9, grow = 0) => {
			ctx.save();
			ctx.globalAlpha = a;
			ctx.fillStyle = PAL.chalk;
			ctx.fillRect(x, y - (0.78 + grow) * fs, cell, (0.92 + 2 * grow) * fs);
			ctx.restore();
		};
		// The rect a caret at (x, y) covers, for the glyph it inverts.
		const under = (x, y, draw) => {
			ctx.save();
			ctx.beginPath();
			ctx.rect(x, y - 0.78 * fs, cell, 0.92 * fs);
			ctx.clip();
			draw();
			ctx.restore();
		};
		const text = (s, x, y, a, color = PAL.chalk, align = 'left') => {
			if (a <= 0.003 || !s) return;
			ctx.save();
			ctx.font = TECH(fs);
			ctx.textBaseline = 'alphabetic';
			ctx.textAlign = align;
			ctx.globalAlpha = a;
			ctx.fillStyle = color;
			ctx.fillText(s, x, y);
			ctx.restore();
		};
		// A glyph centred in a cell of the input line.
		const inCell = (ch, c, y, a, color) => text(ch, cellL(c + 0.5), y, a, color, 'center');
		const onScreen = (y) => y > -step && y < h + step;

		// ── The title ────────────────────────────────────────────────────────
		if (t < B.freeze) term.draw(ctx, w, h, t / 10, t, t - 10);
		else {
			const img = frozenFrame();
			const d = board.dpr;
			for (const ln of L.out) {
				const top = ln.y - 0.62 * step;
				const y = ln.y - S * step;
				if (!onScreen(y)) continue;
				ctx.save();
				ctx.globalAlpha = fade(y);
				ctx.drawImage(img, 0, top * d, img.width, step * d, 0, top - S * step, w, step);
				ctx.restore();
			}
		}

		// Where the caret is this frame: [x, y, steady] or null.
		let at = null;

		// ── The drop and the burst ───────────────────────────────────────────
		if (t >= B.drop[0] && t < B.q1) {
			const j = Math.min(L.N - 1, Math.floor(span(t, B.drop[0], B.drop[1]) * L.N));
			let m = 0;
			while (m < L.k && t >= B.burst + m * TICK) m++;
			// steady while it moves, blinking once it has come to rest
			at = [cellL(0), rowY(3 + j + m), t < B.burst + L.k * TICK + 0.2];
		}

		// ── A machine line, typed from t0 on its table ───────────────────────
		const typedLine = (s, times, t0, r) => {
			const y = rowY(r);
			const n = Math.min(s.length, typedBy(times, t - t0));
			if (onScreen(y)) text(s.slice(0, n), x0, y, A_TEXT * fade(y));
			const last = n > 0 ? t0 + times[n - 1] : t0;
			return { x: x0 + prefix(ctx, s)[n], y, steady: t - last < STEADY };
		};

		// ── The date ─────────────────────────────────────────────────────────
		if (t >= B.q1) {
			const c = typedLine(Q1, K1, B.q1, L.R.q1);
			if (t < B.in1) at = [c.x, c.y, c.steady];
		}
		if (t >= B.in1) {
			const y = rowY(L.R.in1);
			const f = fade(y);
			const typed = (hand.typed || '').slice(0, 8);
			const n = typed.length;
			const open = t < B.e1;
			const wrong = n === 8 && !hand.valid;
			const base = wrong ? ROSE : CHALK;
			const gold = settled(hand.enter1, base);
			const ink = gold ?? (wrong ? PAL.rose : PAL.chalk);
			inCell('>', 0, y, A_PROMPT * f);
			// The mask, the digits over it, the separators lit once passed.
			for (let i = 0; i < MASK.length; i++) {
				const d = DIGIT_AT.indexOf(i);
				if (d >= 0 && d < n) inCell(typed[d], FIELD + i, y, A_TEXT * f, ink);
				else if (d >= 0) inCell(MASK[i], FIELD + i, y, A_MASK * f);
				else {
					const passed = n > DIGIT_AT.indexOf(i + 1);
					inCell(MASK[i], FIELD + i, y, (passed ? A_TEXT : 0.32) * f, passed ? ink : PAL.chalk);
				}
			}
			if (open) {
				const c = n < 8 ? FIELD + DIGIT_AT[n] : FIELD + MASK.length;
				at = [
					cellL(c),
					y,
					hand.steady,
					() => n < 8 && inCell(MASK[DIGIT_AT[n]], c, y, 1, PAL.ground)
				];
			}
		}
		if (t >= B.e1 && t < B.q2)
			at = [cellL(0), rowY(L.R.in1 + 1 + (t >= B.nl2 ? 1 : 0)), t < B.e1 + 0.3];

		// ── The spice ────────────────────────────────────────────────────────
		if (t >= B.q2) {
			const c = typedLine(Q2, K2, B.q2, L.R.q2);
			if (t < B.in2) at = [c.x, c.y, c.steady];
		}
		let hit = null;
		if (t >= B.in2) {
			const y = rowY(L.R.in2);
			const f = fade(y);
			const open = t < B.e2;
			const v = Math.max(1, Math.min(10, hand.value ?? 1));
			const lit2 = 2 * v; // the bars lit, fractional while dragged
			const gold = settled(hand.enter2);
			const ink = gold ?? PAL.chalk;
			inCell('>', 0, y, A_PROMPT * f);
			const bw = Math.max(1.5, 0.3 * cell);
			const top = y - 0.72 * fs;
			const bh = 0.76 * fs;
			const bar = (i, color, a) => {
				ctx.globalAlpha = a;
				ctx.fillStyle = color;
				ctx.fillRect(cellL(FIELD + i + 0.5) - bw / 2, top, bw, bh);
			};
			ctx.save();
			for (let i = 0; i < BARS; i++) {
				const k = clamp01(lit2 - i);
				bar(i, k > 0.5 ? ink : PAL.chalk, lerp(0.14, A_TEXT, k) * f);
			}
			ctx.restore();
			text(String(Math.round(v)), cellL(NUM_END), y, A_TEXT * f, ink, 'right');
			// The handle: the caret in the cell after the lit bars, under the
			// pointer while held; the bar it covers inverted.
			if (open) {
				const hx = cellL(FIELD + lit2);
				at = [
					hx,
					y,
					1,
					() => {
						for (let i = 0; i < BARS; i++)
							if (cellL(FIELD + i + 1) > hx && cellL(FIELD + i) < hx + cell)
								bar(i, PAL.ground, lerp(0.35, 0.9, clamp01(lit2 - i)));
					},
					hand.held ? 0.1 : 0
				];
			}
			if (open) {
				// The pointer: a press on the row (from the prompt to the number)
				// grabs the handle; a drag puts the caret's centre under it.
				const xa = cellL(1);
				const xb = cellL(NUM_END + 1);
				const yc = y - 0.32 * fs;
				hit = (cx, cy, phase) => {
					if (phase === 'down' && (cx < xa || cx > xb || Math.abs(cy - yc) > 0.62 * step))
						return null;
					const l = (cx - x0) / cell - FIELD - 0.5;
					return Math.max(1, Math.min(10, l / 2));
				};
			}
		}
		answers.slider((cx, cy, phase) => (hit ? hit(cx, cy, phase) : null));
		if (t >= B.e2 && t < B.rec)
			at = [cellL(0), rowY(L.R.in2 + 1 + (t >= B.nl3 ? 1 : 0)), t < B.e2 + 0.3];

		// ── The close ────────────────────────────────────────────────────────
		if (t >= B.rec) {
			const d = (hand.typed || '').padEnd(8, '0');
			const rec = `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 8)}  ${Math.round(hand.value ?? 1)}`;
			const c = typedLine(rec, KR, B.rec, L.R.rec);
			if (t < B.last) at = [c.x, c.y, c.steady];
		}
		if (t >= B.last) {
			const y = rowY(L.R.last);
			const x = cellL(0);
			const close = smooth(span(t, B.close, B.close + 0.14));
			if (close <= 0) at = [x, y, t < B.last + 0.3];
			else {
				// The caret closes to a full stop, which lights a dim gold.
				const px = x + 0.3 * cell;
				const py = y - 0.09 * fs;
				const r = Math.max(1.6, 0.085 * fs);
				if (close < 1) {
					const bw = lerp(cell, 2 * r, close);
					const bh = lerp(0.92 * fs, 2 * r, close);
					ctx.save();
					ctx.globalAlpha = 0.9;
					ctx.fillStyle = PAL.chalk;
					ctx.fillRect(
						lerp(x, px - bw / 2, close),
						lerp(y - 0.78 * fs, py - bh / 2, close),
						bw,
						bh
					);
					ctx.restore();
				}
				const glow = smooth(span(t, B.close + 0.1, B.close + 0.6));
				ctx.save();
				ctx.globalAlpha = 0.9 * close * (1 - glow);
				ctx.fillStyle = PAL.chalk;
				ctx.beginPath();
				ctx.arc(px, py, r, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
				if (glow > 0) lit(ctx, px, py, r * 1.05, 0.62 * glow);
			}
		}

		// ── The caret ────────────────────────────────────────────────────────
		if (at && onScreen(at[1])) {
			const [x, y, steady, inv, grow = 0] = at;
			if (blinkOn(steady)) {
				caret(x, y, 0.9, grow);
				if (inv) under(x, y, inv);
			}
		}
	}

	return {
		render,
		resize() {
			L = null;
			frozen = null;
		}
	};
}
