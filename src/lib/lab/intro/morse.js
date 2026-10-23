// ── log-intro · morse — the full stop is the lamp ───────────────────────────
// SIGNAL: the title's own full stop sends the answers. The title is the
// terminal's (log-dawn makeTerminal, no command), typed, and FROZEN the moment
// its stop lands — never zoomed, never moved. From then on the stop is THE
// LAMP: the dot itself turning a dim gold (no bloom; at most a faint ring
// three times its radius), easing on and off over 0.03 s, never a strobe. It
// sends one dot first (5.3 s), then everything typed below it.
//
//   date   a TAPE of equal cells ruled under the question from the title's
//          margin, a segment of five cells for each digit (one blank cell
//          between digits, two between DD, MM and YYYY: 49 cells, and two
//          more blanks and the spice's five after them: 56). The code is
//          the five-wide window starting at (5 − d) mod 10 on the cycle
//          ·····−−−−− — 1 ·−−−−, 5 ·····, 6 −····, 0 −−−−− — a dot a small
//          disc centred in its cell, a dash a bar 0.8 of a cell, in equal
//          cells (not in Morse timing). Under each segment its mask letter
//          (d m y), dim; the terminal's block caret under the next one. A
//          digit typed prints its five symbols left to right and replaces
//          its letter; Backspace lifts them; a group that cannot be (a day
//          past its month, a month past 12, a year off 1900–2099) is rose.
//          Enter: the digits settle to full chalk, and a READING HEAD, a
//          short gold tick, runs the tape at 20 cells a second; each mark it
//          crosses brightens and settles, and the lamp is lit exactly while
//          the head is over a mark — a dash burns longer than a dot.
//   spice  a fixed WINDOW five cells wide over a STRIP of the cycle unrolled,
//          −−−−−·····−−−−, locked to the handle of a ten-notch track at the
//          same pitch: at 1 the window holds ·−−−−, each stop to the right
//          slides the strip one cell right under it, and at 10 it holds
//          −−−−−, the code for 0 (as the keys take 0 for 10) — the window
//          always shows the spice's own code. A press on the track or the
//          strip puts the handle there (absolute); dragged, the strip slides
//          with the pointer; let go, it eases into the cell. Enter: the
//          window's five are printed onto the tape after the date, gold
//          settling to chalk; the head runs them, the lamp sends them, and
//          rests as a dim gold point.
//
// Beats (seconds; the run is 21 s, `at` = t / 21): 0–5.14 the title typed and
// frozen (the stop lands ≈ 4.94); 5.3 the lamp's first dot (at 0.252); 5.6 the
// caret drops two rows; 6.0 the date asked (q1, at 0.286); 6.7–7.2 the tape
// ruled; 7.2 the wait (wait1, at 0.343); 9.4 Enter (e1, at 0.448); 9.6–12.0
// the head runs the date and the lamp sends it (at 0.457–0.571); 12.2 the
// spice asked (q2, at 0.581); 12.5–12.9 its row ruled; 13.0 the wait (wait2,
// at 0.619); 15.2 Enter (e2, at 0.724), printed onto the tape; 15.7–16.2 the
// head and the lamp send it; then the lamp rests, held to 19; 19–21 out.
//
// Every frame is a pure function of t and the hand. The scripted digits'
// arrival times are read off the demo's own hand once, at load; live, two
// things the controller does not keep are cached as inputs (never frames):
// when each digit arrived (or was lifted), and when the handle was let go or
// stepped, so the strip eases into its cell (the controller rounds at once).

import { PAL, TECH_FONT, TAU, stroke, span, smooth, lerp, clamp01 } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';
import { script } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const TERM = makeTerminal(0.8, { cmd: false });
const STOP = TERM.stop; // the full stop lands (≈ 4.94 s)
const FREEZE = STOP + 0.2; // the frame the title is held at
const SECONDS = 21;
const Q1 = 6.0;
const W1 = 7.2;
const E1 = 9.4;
const Q2 = 12.2;
const W2 = 13.0;
const E2 = 15.2;

// ── The tape ─────────────────────────────────────────────────────────────────
const SEG = [0, 6, 13, 19, 26, 32, 38, 44]; // each digit's first cell
const DATE_END = 49; // the date's cells
const SPICE = 51; // the spice's first cell, two blanks on
const CELLS = 56;
const MASK = 'ddmmyyyy';
const GROUP = [0, 0, 1, 1, 2, 2, 2, 2];
const CYCLE = '.....-----';
const codeOf = (d) => {
	const s = (((5 - d) % 10) + 10) % 10;
	let out = '';
	for (let j = 0; j < 5; j++) out += CYCLE[(s + j) % 10];
	return out;
};
// The spice's strip: the cycle unrolled, its cell REST under the window's
// first at 1, and (value − 1) cells right of that at value.
const STRIP = '-----.....----';
const REST = 9;
// A mark's shape, in cells: a dot of radius DOT_R centred in its cell; a dash
// a bar from 0.1 to 0.9, DASH_H thick.
const DOT_R = 0.14;
const DASH_H = 0.2;
const extent = (s) => (s === '.' ? [0.5 - DOT_R, 0.5 + DOT_R] : [0.1, 0.9]);

// The reading head: 20 cells a second, over the date from 9.6 to 12.0, and
// over the spice from the date's end at 15.7.
const PACE = DATE_END / 2.4;
const HEAD1 = 9.6;
const HEAD1_END = HEAD1 + DATE_END / PACE;
const HEAD2 = 15.7;
const HEAD2_END = HEAD2 + (CELLS - DATE_END) / PACE;

const B = {
	first: [5.3, 5.55], // the lamp's first dot
	caret1: 5.6, // the caret drops two rows
	rule1: [6.7, 7.2], // the tape ruled
	onTape: 7.0, // the caret leaves the question for the tape
	caret2: 12.0, // the caret drops to the spice's question
	rule2: [12.5, 12.9], // its row ruled
	print: [E2, E2 + 0.4], // the spice printed onto the tape
	quiet: [E2 + 0.5, E2 + 1.5], // the slider steps back
	out: [19, 21]
};

// The lamp: at most 0.75 gold over the dot, eased over 0.03 s; resting dim.
const LAMP = 0.72;
const GLOW = 0.4;
const EASE = 0.03;
const env = (t, a, b) => Math.max(0, Math.min(smooth((t - a) / EASE), 1 - smooth((t - b) / EASE)));

export const meta = {
	title:
		'morse — the full stop is the lamp; the date sent in dots and dashes; the spice a window sliding on the code',
	order: 13,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 }
};

// The demo's hand, as the controller scripts it, for the digits' arrival
// times (the controller passes only how many are typed).
const SB = { q1: Q1, type1: W1, e1: E1, q2: Q2, drag2: W2 + 0.3, e2: E2 };
const KEYT = (() => {
	const out = [];
	for (let i = 0; i <= 3000 && out.length < 8; i++) {
		const t = W1 + i * 0.001;
		const n = script(t, SB).typed.length;
		while (out.length < n) out.push(t);
	}
	while (out.length < 8) out.push(Infinity);
	return out;
})();

// The questions, typed on the terminal's own hand (dial.js's table).
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
function keys(text, seed) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = 0.12;
	return [...text].map((ch, i) => {
		t += 0.032 * (0.55 + 0.9 * rnd()) + (i > 0 && text[i - 1] === ' ' ? 0.03 : 0);
		return t;
	});
}
const K1 = keys(Q1_TEXT, 7001);
const K2 = keys(Q2_TEXT, 7013);
const typedBy = (K, x) => {
	let n = 0;
	while (n < K.length && K[n] <= x) n++;
	return n;
};

// The terminal's caret: blinks 2.3 a second, on 58% of each.
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);

// Colours, mixed: chalk, gold, rose.
const RGB = { chalk: [236, 230, 218], gold: [245, 193, 80], rose: [167, 132, 122] };
const css = (a) => `rgb(${a.join(', ')})`;
const mix = (a, b, k) =>
	`rgb(${a.map((x, i) => Math.round(lerp(x, b[i], clamp01(k)))).join(', ')})`;

// ── The date's sense ─────────────────────────────────────────────────────────
// Which of the three groups cannot be, from what is typed so far: a partial
// group that no completion could make, a day past its month, a month past
// 12, a year off 1900–2099.
const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
function badGroups(typed) {
	const bad = [false, false, false];
	const g = (a, b) => typed.slice(a, b);
	const dd = g(0, 2);
	const mm = g(2, 4);
	const yy = g(4, 8);
	if (mm.length === 1) bad[1] = Number(mm) > 1;
	if (mm.length === 2) bad[1] = Number(mm) < 1 || Number(mm) > 12;
	if (yy.length > 0) bad[2] = !['19', '20'].some((p) => p.startsWith(yy) || yy.startsWith(p));
	if (yy.length === 4) bad[2] = Number(yy) < 1900 || Number(yy) > 2099;
	if (dd.length === 1) bad[0] = Number(dd) > 3;
	if (dd.length === 2) {
		let max = 31;
		const m = Number(mm);
		if (mm.length === 2 && !bad[1]) {
			if (m === 2) max = yy.length === 4 && !bad[2] ? (leap(Number(yy)) ? 29 : 28) : 29;
			else if ([4, 6, 9, 11].includes(m)) max = 30;
		}
		bad[0] = Number(dd) < 1 || Number(dd) > max;
	}
	return bad;
}

export async function make({ board, answers, live }) {
	await document.fonts.load(TECHF(24)).catch(() => null);

	// ── Layout, cached per board size ────────────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		const { fs, step, cell: tc, out, stop } = L;
		const x0 = out[0].x0;
		const c = Math.max(4, Math.min((0.9 * w - x0) / CELLS, tc * 1.3));
		ctx.save();
		ctx.font = TECHF(fs);
		const m = ctx.measureText('0');
		const mid = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
		ctx.restore();
		// The date: its question two rows under the title; the tape's cells,
		// their baseline, and the row of letters under the segments.
		const yQ1 = out[2].y + 2 * step;
		const yT = yQ1 + 0.6 * step + c;
		const yG = yT + 0.55 * step + mid;
		// The spice: its question, the strip's row, and the track under it.
		const yQ2 = yG + 1.45 * step;
		const yS = yQ2 + 0.6 * step + c;
		const yK = yS + 0.75 * step;
		const x1 = x0 + (REST - 2) * c; // notch 1: the strip at rest starts on the margin
		const x10 = x1 + 9 * c;
		const winL = x1 + 2 * c; // the window over the track's middle
		G = { w, h, L, fs, step, tc, stop, x0, c, mid, yQ1, yT, yG, yQ2, yS, yK, x1, x10, winL };
		return G;
	}

	// The frozen title, drawn once per board.
	let frozen = null;
	function frozenFrame(w, h) {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const cv = document.createElement('canvas');
		cv.width = Math.round(w * dpr);
		cv.height = Math.round(h * dpr);
		const x = cv.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c: cv, w, h, dpr };
		return cv;
	}

	// ── Live: what the hand did, remembered as it changes ────────────────────
	// Per digit: when it arrived, and when it was lifted (and what it was).
	const arr = Array.from({ length: 8 }, () => ({ ch: null, at: -99, lift: null, liftAt: -99 }));
	function noteDigits(typed, secs) {
		for (let i = 0; i < 8; i++) {
			const ch = typed[i] ?? null;
			const a = arr[i];
			if (ch === a.ch) continue;
			if (a.ch !== null) {
				a.lift = a.ch;
				a.liftAt = secs;
			}
			a.ch = ch;
			if (ch !== null) a.at = secs;
		}
	}
	// How long ago digit i arrived, on its own clock, or null if it is not in.
	function ago(i, t, hand) {
		if (hand.typed[i] === undefined) return null;
		return live ? hand.secs - arr[i].at : t - KEYT[i];
	}

	// The handle as shown: the hand's own while held; easing into the cell
	// over 0.18 s when let go or stepped.
	const knob = { held: 0, from: 1, to: 1, at: -99 };
	const knobNow = (secs) => lerp(knob.from, knob.to, easeOut(span(secs - knob.at, 0, 0.18)));
	function shown(hand) {
		if (!live) return hand.value;
		const secs = hand.secs;
		if (hand.held) {
			knob.held = 1;
			knob.from = knob.to = hand.value;
			knob.at = -99;
			return hand.value;
		}
		if (knob.held || hand.value !== knob.to) {
			knob.from = knob.held ? knob.to : knobNow(secs);
			knob.held = 0;
			knob.to = hand.value;
			knob.at = secs;
		}
		return knobNow(secs);
	}

	// ── The pointer on the slider ────────────────────────────────────────────
	let S = null; // this frame's slider, on screen
	const valueAtX = (X) => Math.max(1, Math.min(10, 1 + (9 * (X - S.x1)) / (S.x10 - S.x1)));
	const inside = (X, Y) => S && X >= S.l && X <= S.r && Y >= S.top && Y <= S.bottom;
	answers.slider((X, Y, phase) => {
		if (!S || S.a < 0.5) return null;
		if (phase === 'down' && !inside(X, Y)) return null;
		return valueAtX(X);
	});
	let hover = null;
	let cursor = '';
	if (live)
		window.addEventListener('pointermove', (e) => {
			hover = [e.clientX, e.clientY];
		});
	function setCursor(cur) {
		if (cur === cursor) return;
		cursor = cur;
		document.documentElement.style.cursor = cur;
	}

	// ── Drawing ──────────────────────────────────────────────────────────────
	function text(ctx, str, x, y, size, alpha, color = PAL.chalk, align = 'left') {
		if (!str || alpha <= 0.004) return;
		ctx.save();
		ctx.font = TECHF(size);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.textBaseline = 'alphabetic';
		ctx.fillText(str, x, y);
		ctx.restore();
	}
	// The terminal's block caret, its left edge at x on the baseline y.
	function block(ctx, g, x, y, alpha, wd = g.tc) {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.globalAlpha = 0.9 * alpha;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(x, y - 0.78 * g.fs, wd, 0.92 * g.fs);
		ctx.restore();
	}
	// A question typed at (x0, y) by the table K from t0, and its caret.
	function ask(ctx, g, str, Ktab, t0, t, y, alpha, caret, secs) {
		const n = t >= t0 ? typedBy(Ktab, t - t0) : 0;
		text(ctx, str.slice(0, n), g.x0, y, g.fs, 0.92 * alpha);
		if (!caret) return;
		const last = n > 0 ? t0 + Ktab[n - 1] : -9;
		if (!blinkOn(secs, t - last < 0.16 && n < str.length)) return;
		ctx.save();
		ctx.font = TECHF(g.fs);
		const xw = ctx.measureText(str.slice(0, n)).width;
		ctx.restore();
		block(ctx, g, g.x0 + xw, y, alpha);
	}
	// One mark in the cell whose left edge is x, centred on the line yc.
	function mark(ctx, s, x, yc, c, alpha, color, sc = 1) {
		if (alpha <= 0.004) return;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.beginPath();
		if (s === '.') ctx.arc(x + 0.5 * c, yc, DOT_R * c * sc, 0, TAU);
		else {
			const hh = DASH_H * c * sc;
			const ln = 0.8 * c * sc;
			ctx.roundRect(x + 0.5 * c - ln / 2, yc - hh / 2, ln, hh, hh / 2);
		}
		ctx.fill();
	}
	// How a mark at cells [c0 + a, c0 + b] is lit by a head setting off from
	// cell `from` at time `t0`: brightened as it is crossed, then settling.
	function crossed(t, t0, from, cell, s) {
		const tc = t0 + (cell + extent(s)[0] - from) / PACE;
		if (t < tc - 0.02) return 0;
		return smooth(span(t, tc - 0.02, tc + 0.02)) * Math.exp(-Math.max(0, t - tc) / 0.3);
	}

	// The lamp at t: the first dot, the date and the spice as the head is
	// over each mark, then resting dim.
	function lampAt(t, typed, v) {
		let k = env(t, ...B.first);
		if (typed.length === 8 && t > HEAD1 - 0.1 && t < HEAD1_END + 0.1)
			for (let i = 0; i < 8; i++) {
				const code = codeOf(Number(typed[i]));
				for (let j = 0; j < 5; j++) {
					const [a, b] = extent(code[j]);
					const c0 = SEG[i] + j;
					k = Math.max(k, env(t, HEAD1 + (c0 + a) / PACE, HEAD1 + (c0 + b) / PACE));
				}
			}
		let lastOff = HEAD2_END;
		if (t > HEAD2 - 0.1) {
			const code = codeOf(v % 10);
			for (let j = 0; j < 5; j++) {
				const [a, b] = extent(code[j]);
				const c0 = SPICE + j - DATE_END;
				const off = HEAD2 + (c0 + b) / PACE;
				k = Math.max(k, env(t, HEAD2 + (c0 + a) / PACE, off));
				lastOff = off;
			}
		}
		const rest = GLOW * smooth(span(t, lastOff + 0.1, lastOff + 0.5));
		return Math.max(LAMP * k, rest);
	}
	function lamp(ctx, g, k, alpha) {
		const a = k * alpha;
		if (a <= 0.004) return;
		const { x, y, r } = g.stop;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.fillStyle = PAL.gold;
		ctx.beginPath();
		ctx.arc(x, y, r * 1.04, 0, TAU);
		ctx.fill();
		ctx.globalAlpha = 0.2 * a;
		ctx.strokeStyle = PAL.gold;
		ctx.lineWidth = 0.8;
		ctx.beginPath();
		ctx.arc(x, y, 3 * r, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}
	// The reading head at cell position p: a short gold tick across the tape.
	function head(ctx, g, p, yBase, alpha) {
		if (alpha <= 0.004) return;
		const x = g.x0 + p * g.c;
		stroke(
			ctx,
			[
				[x, yBase - 1.3 * g.c],
				[x, yBase + 0.25 * g.c]
			],
			{ color: PAL.gold, width: 1.5, alpha: 0.85 * alpha, cap: 'butt' }
		);
	}

	function tape(ctx, g, t, hand, alpha) {
		if (t < B.rule1[0] || alpha <= 0.004) return;
		const { x0, c, yT, yG } = g;
		const yc = yT - c / 2;
		const secs = live ? hand.secs : t;
		const ruled = easeOut(span(t, ...B.rule1));
		// The rule: a hairline under the cells, written from the margin.
		stroke(
			ctx,
			[
				[x0, yT],
				[x0 + CELLS * c, yT]
			],
			{ width: 1, alpha: 0.32 * alpha, upto: ruled, cap: 'butt' }
		);
		const typed = hand.typed;
		const bad = badGroups(typed);
		const settle = smooth(hand.enter1);
		ctx.save();
		for (let i = 0; i < 8; i++) {
			const cx = x0 + (SEG[i] + 2.5) * c;
			const shownAt = smooth(span(ruled * CELLS, SEG[i] + 1, SEG[i] + 4));
			const dt = ago(i, t, hand);
			const arrive = dt === null ? 0 : smooth(span(dt, 0, 0.08));
			const rose = bad[GROUP[i]];
			const col = rose ? RGB.rose : RGB.chalk;
			// The mask letter, until its digit replaces it (and back as a
			// lifted digit goes).
			const A = arr[i];
			const back =
				live && A.lift !== null && dt === null ? smooth(span(hand.secs - A.liftAt, 0.04, 0.16)) : 1;
			const ma = 0.3 * shownAt * (1 - arrive) * back;
			if (ma > 0.004) text(ctx, MASK[i], cx, yG, g.fs, ma * alpha, PAL.chalk, 'center');
			// A lifted digit: it rises off the tape and goes.
			if (live && A.lift !== null && A.liftAt >= A.at - 1e-6) {
				const k = span(hand.secs - A.liftAt, 0, 0.16);
				if (k < 1) {
					const code = codeOf(Number(A.lift));
					const la = 0.8 * (1 - smooth(k)) * alpha;
					const dy = -0.5 * c * easeOut(k);
					for (let j = 0; j < 5; j++)
						mark(ctx, code[j], x0 + (SEG[i] + j) * c, yc + dy, c, la, css(col));
					text(ctx, A.lift, cx, yG + dy, g.fs, la, css(col), 'center');
				}
			}
			if (dt === null) continue;
			const d = Number(typed[i]);
			const code = codeOf(d);
			const base = lerp(0.8, 1, settle) * (rose ? 0.9 : 1);
			// The digit under its segment.
			text(ctx, typed[i], cx, yG, g.fs, base * arrive * alpha, css(col), 'center');
			// Its five symbols, arriving left to right over 0.12 s; brightened
			// as the head crosses them.
			for (let j = 0; j < 5; j++) {
				const on = smooth(span(dt - 0.03 * j, 0, 0.05));
				if (on <= 0) continue;
				const b = hand.enter1 > 0 ? crossed(t, HEAD1, 0, SEG[i] + j, code[j]) : 0;
				const sc = 1 + 0.22 * b;
				const a = lerp(base, 1, b) * on * alpha;
				mark(ctx, code[j], x0 + (SEG[i] + j) * c, yc, c, a, mix(col, RGB.gold, 0.5 * b), sc);
			}
		}
		// The spice, printed after the date: gold settling to chalk, its
		// number under it; brightened as the head crosses it.
		if (hand.enter2 > 0) {
			const v = Math.round(hand.value);
			const code = codeOf(v % 10);
			const gold = 1 - smooth(span(t, B.print[0] + 0.05, B.print[1]));
			for (let j = 0; j < 5; j++) {
				const on = smooth(span(t - E2 - 0.03 * j, 0, 0.05));
				const b = crossed(t, HEAD2, DATE_END, SPICE + j, code[j]);
				const k = Math.max(gold, 0.5 * b);
				mark(
					ctx,
					code[j],
					x0 + (SPICE + j) * c,
					yc,
					c,
					lerp(0.9, 1, Math.max(gold, b)) * on * alpha,
					mix(RGB.chalk, RGB.gold, k),
					1 + 0.22 * b
				);
			}
			const na = smooth(span(t, E2 + 0.05, E2 + 0.35));
			text(
				ctx,
				String(v),
				x0 + (SPICE + 2.5) * c,
				yG,
				g.fs,
				na * alpha,
				mix(RGB.chalk, RGB.gold, gold),
				'center'
			);
		}
		ctx.restore();

		// The caret: under the next segment — after the date once the eight
		// are in — steady after a key, blinking on the clock.
		const onTape = t >= B.onTape || typed.length > 0;
		if (hand.caret > 0 && hand.enter1 <= 0 && onTape && blinkOn(secs, hand.steady > 0)) {
			const n = typed.length;
			const cx = n < 8 ? x0 + (SEG[n] + 2.5) * c : x0 + (DATE_END + 1) * c;
			block(ctx, g, cx - g.tc / 2, yG, alpha);
			if (n < 8) text(ctx, MASK[n], cx, yG, g.fs, 0.9 * alpha, PAL.ground, 'center');
		}

		// The reading head.
		if (t >= HEAD1 - 0.05 && t < HEAD1_END + 0.2) {
			const p = clamp01((t - HEAD1) / (HEAD1_END - HEAD1)) * DATE_END;
			head(
				ctx,
				g,
				p,
				yT,
				alpha *
					smooth(span(t, HEAD1 - 0.05, HEAD1 + 0.05)) *
					(1 - smooth(span(t, HEAD1_END, HEAD1_END + 0.15)))
			);
		}
		if (t >= HEAD2 - 0.05 && t < HEAD2_END + 0.25) {
			const p = DATE_END + clamp01((t - HEAD2) / (HEAD2_END - HEAD2)) * (CELLS - DATE_END);
			head(
				ctx,
				g,
				p,
				yT,
				alpha *
					smooth(span(t, HEAD2 - 0.05, HEAD2 + 0.05)) *
					(1 - smooth(span(t, HEAD2_END, HEAD2_END + 0.15)))
			);
		}
	}

	function spice(ctx, g, t, hand, alpha) {
		S = null;
		if (t < B.rule2[0] || alpha <= 0.004) return;
		const { x0, c, yS, yK, x1, x10, winL, fs, mid } = g;
		const yc = yS - c / 2;
		const ruled = easeOut(span(t, ...B.rule2));
		const quiet = lerp(1, 0.45, smooth(span(t, ...B.quiet)));
		const a = alpha * quiet;
		const v = shown(hand);
		const held = hand.held > 0;
		const travel = (STRIP.length + 9) * c; // the strip's reach: 23 cells from the margin
		// The row: a hairline under the strip's travel, written from the margin.
		stroke(
			ctx,
			[
				[x0, yS],
				[x0 + travel, yS]
			],
			{ width: 1, alpha: 0.28 * a, upto: ruled, cap: 'butt' }
		);
		// The strip, locked to the handle; dim outside the window, full in it.
		const sL = x0 + (v - 1) * c;
		const sa = smooth(span(ruled, 0.2, 0.9));
		const wTop = yS - c - 0.3 * c;
		const wBot = yS + 0.3 * c;
		const winR = winL + 5 * c;
		const drawStrip = (alphaK) => {
			for (let j = 0; j < STRIP.length; j++)
				mark(ctx, STRIP[j], sL + j * c, yc, c, alphaK * sa * a, PAL.chalk);
		};
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, wTop - c, g.w, wBot - wTop + 2 * c);
		ctx.rect(winL, wTop, 5 * c, wBot - wTop);
		ctx.clip('evenodd');
		drawStrip(0.22);
		ctx.restore();
		ctx.save();
		ctx.beginPath();
		ctx.rect(winL, wTop, 5 * c, wBot - wTop);
		ctx.clip();
		drawStrip(1);
		ctx.restore();
		// The window: a thin bracket either side.
		const wa = 0.6 * a * smooth(span(ruled, 0.4, 1));
		const sf = 0.22 * c;
		stroke(
			ctx,
			[
				[winL + sf, wTop],
				[winL, wTop],
				[winL, wBot],
				[winL + sf, wBot]
			],
			{ width: 1, alpha: wa, cap: 'butt' }
		);
		stroke(
			ctx,
			[
				[winR - sf, wTop],
				[winR, wTop],
				[winR, wBot],
				[winR - sf, wBot]
			],
			{ width: 1, alpha: wa, cap: 'butt' }
		);
		// The track: ten notches at the strip's pitch, lit up to the handle.
		stroke(
			ctx,
			[
				[x1, yK],
				[x10, yK]
			],
			{ width: 1, alpha: 0.3 * a, upto: ruled, cap: 'butt' }
		);
		for (let k = 1; k <= 10; k++) {
			const x = x1 + (k - 1) * c;
			const tk = smooth(span(ruled * 10, k - 1, k + 1));
			if (tk <= 0) continue;
			const hgt = (k === 1 || k === 10 ? 0.36 : 0.22) * c;
			const lv = clamp01(v - k + 1);
			stroke(
				ctx,
				[
					[x, yK - hgt],
					[x, yK + hgt]
				],
				{ width: 1, alpha: a * tk * lerp(0.35, 0.75, lv), cap: 'butt' }
			);
		}
		// The handle, a narrow block, and the number after the track.
		const ha = smooth(span(ruled, 0.6, 1));
		const hx = x1 + (v - 1) * c;
		const hw = Math.max(3, 0.34 * c);
		ctx.save();
		ctx.globalAlpha = (held ? 1 : 0.85) * ha * a;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - hw / 2, yK - 0.46 * fs, hw, 0.92 * fs);
		ctx.restore();
		text(ctx, String(Math.round(v)), x10 + 1.1 * c, yK + mid, fs, 0.92 * ha * a);
		// For the pointer: the track and the strip, half a cell each side, the
		// height of both rows.
		S = {
			x1,
			x10,
			l: Math.min(sL, x1) - 0.5 * c,
			r: Math.max(sL + STRIP.length * c, x10) + 0.5 * c,
			top: wTop - 0.2 * c,
			bottom: yK + 0.6 * fs,
			a: alpha * ha
		};
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = geom(ctx, w, h);
			const out = 1 - smooth(span(t, ...B.out));
			const secs = live ? hand.secs : t;
			if (live) noteDigits(hand.typed, hand.secs);

			// The title: typed, then held at its stop; the stop is the lamp.
			if (t < FREEZE) TERM.draw(ctx, w, h, t / 10, t, t - 10);
			else {
				ctx.save();
				ctx.globalAlpha = out;
				ctx.drawImage(frozenFrame(w, h), 0, 0, w, h);
				ctx.restore();
				lamp(ctx, g, lampAt(t, hand.typed, Math.round(hand.value)), out);
			}
			if (t < B.caret1 || out <= 0.004) {
				S = null;
				if (live) setCursor('');
				return;
			}

			// The date: its question, then the tape.
			const caret1 = t < B.onTape && hand.typed.length === 0 && hand.enter1 <= 0;
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.yQ1, out, caret1, secs);
			tape(ctx, g, t, hand, out);

			// The spice: its question, then the window on the strip.
			if (t >= B.caret2) {
				const caret2 = t < B.rule2[1] && hand.enter2 <= 0;
				ask(ctx, g, Q2_TEXT, K2, Q2, t, g.yQ2, out, caret2, secs);
			}
			spice(ctx, g, t, hand, out);

			// The hand over the slider.
			if (live) {
				let cur = '';
				if (S && hand.asking === 'spice') {
					if (hand.held) cur = 'grabbing';
					else if (hover && inside(hover[0], hover[1])) cur = 'grab';
				}
				setCursor(cur);
				// For a scripted hand checking the slider.
				if (window.__lab) window.__lab.morse = { slider: S, value: hand.value, held: hand.held, t };
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
