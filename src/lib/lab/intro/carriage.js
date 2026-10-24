// ── log-intro · carriage — one fixed point; the paper moves under it ─────────
// A TYPEWRITER'S CARRIAGE. The title is the terminal's (log-dawn makeTerminal,
// no command), typed and FROZEN the moment its full stop lands — no zoom —
// then lifted to the top third and dimmed. It is not on the paper and never
// moves again. Below it ONE point appears and NEVER moves: a vertical hairline
// at the middle of the board on the type line, where each character is
// struck, as a typewriter's type guide is (a character at the point is struck
// in front of it: the hairline is knocked out round the glyph). The type is
// the title's face a step down (0.88), its cell at most w/88 so the longest
// line fits either side of the point. Everything else is the PAPER, one
// object with one sideways offset: every struck line is left-aligned to its
// margin and moves with it, a line feed lifts them all together, and a faint
// ruled scale under the current line (a tick a cell, every fifth taller)
// slides with it.
//
//   date   'when were you born?' is struck at the point at the terminal's
//          pace, and the paper steps one cell left after each character (the
//          escapement: 0.07 s, a 4% overshoot), so the question builds
//          leftward away from the point. Two spaces, and the date's cells come
//          under it: eight faint underlines and two dots. Each digit is struck
//          at the point and the paper steps (a dot is stepped over with one
//          step more); Backspace steps it back right and the digit lifts off.
//          The hairline blinks while it waits, steady just after a key. A
//          group that cannot be (a day past its month, a month past 12, a year
//          off 1900–2099 — checked as each group fills, and on its prefix)
//          turns rose. Enter: CARRIAGE RETURN — the paper is thrown right
//          until its margin is at the point, with a small settle, and fed up
//          a row; the date's digits flash gold and settle to chalk.
//   spice  'how spicy?' is struck the same way; two spaces, and a SCALE comes
//          under the point: 1 to 10, three cells apart, a tick under each, 1
//          under the point. No handle: you drag the PAPER. A press anywhere in
//          the scale's row (a band 1.5 rows tall, the board's full width)
//          takes it and it follows the pointer 1:1 sideways — so dragging
//          LEFT raises the number, as pulling a carriage left brings the
//          columns to its right under the point. The number under the point
//          reads full; its neighbours fade with distance. Let go, and the
//          paper eases (the escapement's ease) to the nearest number. ← → a
//          number (→ brings the next one under the point), a digit slides it
//          there over 0.25 s. Enter: return and feed again; the numbers not
//          chosen fade, the chosen one closes up after the question
//          ('how spicy?  7'), flashes gold and settles.
//
// Then the hairline shrinks to a point at the start of the empty line — a
// full stop, dim gold — and holds: the dim title, the two answered lines, the
// stop. Out to the ground, and round.
//
// Beats (seconds of 22; at = t / 22): 0–4.94 the terminal types, its stop
// lands; 5.14 frozen; 5.3–6.1 the title lifts and dims; 6.0–6.4 the point
// and the ruled scale appear; 6.4 the date asked (q1, at 0.29), struck to
// ≈ 7.3; 7.5 the wait (wait1, at 0.34), the scripted digits 7.5–8.9; 9.6
// carriage return (e1, at 0.436), the gold settled by 10.6; 10.5 the spice
// asked (q2, at 0.477); ≈ 11.05–11.4 the scale; 11.6 the wait (wait2, at
// 0.527), the scripted drag 11.7–13.2; 13.6 return (e2, at 0.618), the gold
// settled by 14.6; 14.6–15.4 the hairline closes to the stop; to 19.8 the
// close (at 0.70–0.90); 19.8–21.5 out; ground to 22.
//
// Every frame is a pure function of t and the hand. The only things kept
// are caches of inputs: the digits' arrival times (sampled once from the
// demo's script, or remembered as the hand types live, with Backspace's lift
// times), the spice's release time and the last value seen — and the title's
// frozen frame.

import { PAL, TECH_FONT, span, smooth, lerp, clamp01 } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';
import { script } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const SECONDS = 22;
const BT = { q1: 6.4, wait1: 7.5, e1: 9.6, q2: 10.5, wait2: 11.6, e2: 13.6 };
const TERM = makeTerminal(0.8, { cmd: false });
const FREEZE = TERM.stop + 0.2; // the frame the title is held at (≈ 5.14)
const B = {
	lift: [5.3, 6.1], // the title to the top third, dimmed to 0.45
	point: [6.0, 6.4], // the hairline appears
	ruler: [6.0, 6.6], // the ruled scale, written out from the point
	esc: 0.07, // the escapement
	dot: 0.06, // the extra step over a dot, this much after the digit's
	throw: 0.45, // the carriage return
	feed: 0.28, // the line feed
	gold1: [BT.e1, BT.e1 + 0.08, BT.e1 + 0.3, 10.6],
	gold2: [BT.e2, BT.e2 + 0.08, BT.e2 + 0.3, 14.6],
	stop: [14.6, 15.4], // the hairline closes to the full stop
	out: [19.8, 21.5]
};

export const meta = {
	title:
		'carriage — one fixed point the type is struck at; the paper moves under it, the spice a scale dragged past it',
	order: 11,
	seconds: SECONDS,
	beats: { ...BT }
};

// ── The paper's columns ──────────────────────────────────────────────────────
// Column c's centre is at the point when the paper's offset P is c.
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
const D0 = Q1_TEXT.length + 2; // the date's first cell
const DIGIT_COL = [0, 1, 3, 4, 6, 7, 8, 9].map((c) => D0 + c);
const DOT_COL = [2, 5].map((c) => D0 + c);
const AFTER = [0, 1, 3, 4, 6, 7, 8, 9, 10].map((c) => D0 + c); // P after n digits
const S0 = Q2_TEXT.length + 2; // the scale's 1
const scaleCol = (v) => S0 + 3 * (v - 1);
const RULE = 44; // the paper's width, in cells: the ruled scale's ticks

// The questions, struck at the terminal's pace (dial.js's keys() table), the
// two spaces after each struck as keys too.
function keys(text, seed) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = 0.12;
	return [...text].map((ch, i) => {
		t += 0.032 * (0.55 + 0.9 * rnd()) + (i > 0 && text[i - 1] === ' ' ? 0.03 : 0);
		return t;
	});
}
const K1 = keys(Q1_TEXT + '  ', 7001).map((k) => BT.q1 + k);
const K2 = keys(Q2_TEXT + '  ', 7013).map((k) => BT.q2 + k);
const Q1_END = K1[K1.length - 1];
const Q2_END = K2[K2.length - 1];

// The demo's hand, as the controller scripts it, for the digits' arrival
// times (the controller passes only how many are typed).
const SB = { q1: BT.q1, type1: BT.wait1, e1: BT.e1, q2: BT.q2, drag2: BT.wait2 + 0.3, e2: BT.e2 };
const KEYT = (() => {
	const out = [];
	for (let i = 0; i <= 3000 && out.length < 8; i++) {
		const t = BT.wait1 + i * 0.001;
		const n = script(t, SB).typed.length;
		while (out.length < n) out.push(t);
	}
	while (out.length < 8) out.push(Infinity);
	return out;
})();

// ── Eases ────────────────────────────────────────────────────────────────────
const backOut = (x, s) => {
	const y = clamp01(x) - 1;
	return 1 + (s + 1) * y * y * y + s * y * y;
};
// The escapement: an ease with a 4% overshoot (back-out, s = 1.04).
const escE = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : backOut(x, 1.04));
const esc = (dt) => escE(dt / B.esc);
// The return: an ease out with a small settle (≈ 1.3% past the margin).
const throwE = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : backOut(x, 0.6));
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
// A flash: up over [a, b], held to c, down to d.
const flash = (t, [a, b, c, d]) => smooth(span(t, a, b)) * (1 - smooth(span(t, c, d)));

// The terminal's caret: blinks 2.3 a second, on 58% of each.
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
// A struck character: full at the strike, settling to 0.85.
const struck = (dt) => (dt < 0 ? 0 : lerp(1, 0.85, smooth(span(dt, 0, 0.12))));

// Colours: chalk to gold.
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const CHALK = hex(PAL.chalk);
const GOLD = hex(PAL.gold);
const mix = (k) => {
	const c = CHALK.map((v, i) => Math.round(lerp(v, GOLD[i], clamp01(k))));
	return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

// ── The date's own check: which groups cannot be ────────────────────────────
// Each group as it fills, on its prefix: could any completion of it be a day
// (01–31, and within its month once the month is in — 29 Feb only in a leap
// year once the year is in), a month (01–12), a year (1900–2099)?
function badGroups(typed) {
	const groups = [
		[typed.slice(0, 2), 2, 1, 31],
		[typed.slice(2, 4), 2, 1, 12],
		[typed.slice(4, 8), 4, 1900, 2099]
	];
	const bad = groups.map(([s, n, lo, hi]) => {
		if (!s.length) return false;
		const k = 10 ** (n - s.length);
		const a = Number(s) * k;
		return a + k - 1 < lo || a > hi;
	});
	if (typed.length >= 4 && !bad[0] && !bad[1]) {
		const dd = Number(typed.slice(0, 2));
		const mm = Number(typed.slice(2, 4));
		let leap = true;
		if (typed.length === 8 && !bad[2]) {
			const y = Number(typed.slice(4, 8));
			leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
		}
		const dim = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mm - 1];
		if (dd > dim) bad[0] = true;
	}
	return bad;
}
const groupOf = (i) => (i < 2 ? 0 : i < 4 ? 1 : 2);

export async function make({ board, answers, live }) {
	await document.fonts.load(TECHF(24)).catch(() => null);

	// ── Layout, cached per board size ────────────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		// The type: a step down from the title's, or smaller still so 44 cells
		// fit either side of the point.
		const k = Math.min(0.88, w / 88 / L.cell);
		const fs = L.fs * k;
		ctx.save();
		ctx.font = TECHF(fs);
		const cell = ctx.measureText('0').width;
		ctx.restore();
		const R = L.step * k; // the row pitch
		const cx = Math.floor(w / 2) + 0.5; // the point
		const yMid = Math.round(0.56 * h); // the type line's middle
		const yB = yMid + 0.33 * fs; // its baseline
		const r = Math.max(1.6, L.stop.r * k); // the full stop
		G = {
			w,
			h,
			L,
			fs,
			cell,
			R,
			cx,
			yMid,
			yB,
			r,
			lift: L.out[1].y - 0.22 * h, // the title's middle line to 0.22 h
			yRule: yB + 0.8 * fs
		};
		return G;
	}

	// The frozen title, drawn once per board.
	let frozen = null;
	function frozenFrame(w, h) {
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
	}

	// ── Live: the hand's inputs, remembered as they change ───────────────────
	// The date: when each digit arrived, the digits lifting off after a
	// Backspace, and the paper's steps (folded into `base` once settled).
	const D = { seen: '', arr: [], lifts: [], ev: [], base: 0 };
	// The spice: the value shown eases from `from` to `to` from `at`.
	const SP = { held: 0, from: 1, to: 1, at: -99, dur: B.esc, slide: false };
	let lastV = 1; // the last value seen (shown), for a grab
	const spCur = (s) => {
		const x = span(s - SP.at, 0, SP.dur);
		return lerp(SP.from, SP.to, SP.slide ? easeIO(x) : escE(x));
	};
	function resetLive() {
		D.seen = '';
		D.arr = [];
		D.lifts = [];
		D.ev = [];
		D.base = 0;
		SP.held = 0;
		SP.from = SP.to = 1;
		SP.at = -99;
		lastV = 1;
	}
	function stepEvents(s, n0, n1) {
		// The paper's steps from n0 digits typed to n1, one cell each, the
		// one over a dot a beat after the digit's.
		const dir = Math.sign(n1 - n0);
		for (let n = n0; n !== n1; n += dir) {
			const a = AFTER[n];
			const b = AFTER[n + dir];
			const cells = Math.abs(b - a);
			for (let c = 0; c < cells; c++) D.ev.push({ at: s + c * B.dot, d: dir });
		}
	}
	function observe(t, hand) {
		if (!live) return;
		if (t < BT.q1) {
			if (D.seen || D.ev.length || SP.to !== 1) resetLive();
			return;
		}
		const s = hand.secs;
		const typed = hand.typed;
		if (typed !== D.seen) {
			const a = D.seen;
			let i = 0;
			while (i < a.length && i < typed.length && a[i] === typed[i]) i++;
			// Taken back: each lifts off where it was struck.
			for (let j = a.length - 1; j >= i; j--) D.lifts.push({ ch: a[j], col: DIGIT_COL[j], at: s });
			if (a.length > i) stepEvents(s, a.length, i);
			for (let j = i; j < typed.length; j++) D.arr[j] = s;
			if (typed.length > i) stepEvents(s, i, typed.length);
			D.seen = typed;
		}
		D.lifts = D.lifts.filter((l) => s - l.at < 0.2);
		const keep = [];
		for (const e of D.ev) {
			if (s - e.at > 0.25) D.base += e.d;
			else keep.push(e);
		}
		D.ev = keep;
	}
	// The spice as shown: the hand's own while held; let go, or stepped, it
	// eases to the hand's (rounded) value from the time that changed.
	function shownValue(hand) {
		if (!live) return hand.value;
		const s = hand.secs;
		const v = hand.value;
		if (hand.held) {
			SP.held = 1;
			SP.from = SP.to = v;
			SP.at = -99;
			return v;
		}
		if (SP.held) {
			SP.held = 0;
			SP.from = lastV;
			SP.to = v;
			SP.at = s;
			SP.dur = B.esc;
			SP.slide = false;
		} else if (v !== SP.to) {
			const cur = spCur(s);
			const big = Math.abs(v - cur) > 1.05;
			SP.from = cur;
			SP.to = v;
			SP.at = s;
			SP.dur = big ? 0.25 : 0.1;
			SP.slide = big;
		}
		return spCur(s);
	}

	// The digits' arrival times, and the date's paper steps, at t.
	const arrival = (i) => (live ? (D.arr[i] ?? -99) : KEYT[i]);
	function dateSteps(t, hand) {
		if (live) {
			let p = D.base;
			for (const e of D.ev) p += e.d * esc(hand.secs - e.at);
			return p;
		}
		let p = 0;
		const n = hand.typed.length;
		for (let i = 0; i < n; i++) {
			const cells = AFTER[i + 1] - AFTER[i];
			for (let c = 0; c < cells; c++) p += esc(t - KEYT[i] - c * B.dot);
		}
		return p;
	}
	const qSteps = (K, t) => {
		let p = 0;
		for (const k of K) p += esc(t - k);
		return p;
	};
	// The paper's offset: which column is under the point.
	function paper(t, hand, v) {
		if (t < BT.e1) return qSteps(K1, t) + dateSteps(t, hand);
		if (t < BT.q2) return AFTER[8] * (1 - throwE((t - BT.e1) / B.throw));
		if (t < BT.e2) return qSteps(K2, t) + 3 * (v - 1);
		// Thrown from where the paper WAS (live, the value last shown, frozen at
		// Enter), not the committed one: a digit then Enter inside the slide
		// would otherwise jump the paper before the throw.
		const v0 = live ? lastV : Math.round(hand.value);
		return scaleCol(v0) * (1 - throwE((t - BT.e2) / B.throw));
	}

	// ── The pointer: a press in the scale's row takes the paper ──────────────
	let band = null; // this frame's row, on screen
	const grab = { x0: 0, v0: 1 };
	const hit = (X, Y, phase) => {
		if (!band) return null;
		if (phase === 'down') {
			if (Y < band.y0 || Y > band.y1) return null;
			grab.x0 = X;
			grab.v0 = lastV;
			return grab.v0;
		}
		// The paper follows the pointer 1:1: left brings higher numbers under
		// the point.
		return grab.v0 + (grab.x0 - X) / (3 * band.cell);
	};
	let hover = null;
	let cursor = '';
	if (live)
		window.addEventListener('pointermove', (e) => {
			hover = [e.clientX, e.clientY];
		});
	function setCursor(c) {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	}

	// ── Drawing ──────────────────────────────────────────────────────────────
	// A character; one at the point knocks the hairline out round itself,
	// so the type reads in front of the guide.
	let knock = null; // this frame's { x, reach, width }
	function glyph(ctx, ch, x, y, alpha, color = PAL.chalk) {
		if (alpha <= 0.004) return;
		if (knock && Math.abs(x - knock.x) < knock.reach) {
			ctx.globalAlpha = Math.min(1, 1.2 * alpha);
			ctx.strokeStyle = PAL.ground;
			ctx.lineWidth = knock.width;
			ctx.lineJoin = 'round';
			ctx.strokeText(ch, x, y);
		}
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fillText(ch, x, y);
	}
	function hline(ctx, x0, x1, y, alpha, color = PAL.chalk) {
		if (alpha <= 0.004) return;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fillRect(x0, Math.round(y), x1 - x0, 1);
	}
	function vline(ctx, x, y0, y1, alpha, color = PAL.chalk) {
		if (alpha <= 0.004) return;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fillRect(Math.round(x - 0.5), y0, 1, y1 - y0);
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = geom(ctx, w, h);
			const { fs, cell, R, cx, yMid, yB } = g;
			const out = 1 - smooth(span(t, ...B.out));
			observe(t, hand);
			band = null;
			answers.slider(hit);

			// The title: typed, then held at its stop, lifted and dimmed.
			if (t < FREEZE) TERM.draw(ctx, w, h, t / 10, t, t - 10);
			else if (out > 0.004) {
				const k = span(t, ...B.lift);
				ctx.save();
				ctx.globalAlpha = out * lerp(1, 0.45, smooth(k));
				ctx.drawImage(frozenFrame(w, h), 0, -g.lift * easeIO(k), w, h);
				ctx.restore();
			}
			if (t < B.point[0] || out <= 0.004) {
				if (live) setCursor('');
				return;
			}

			const v = t >= BT.q2 && t < BT.e2 ? shownValue(hand) : hand.value;
			if (t >= BT.q2 && t < BT.e2) lastV = v;
			const P = paper(t, hand, v);
			const X = (col) => cx + (col - P) * cell;
			// The feeds: each return lifts every line a row.
			const f1 = easeOut((t - BT.e1) / B.feed);
			const f2 = easeOut((t - BT.e2) / B.feed);
			const y1 = yB - R * (f1 + f2); // the date's line
			const y2 = yB - R * f2; // the spice's

			ctx.save();
			ctx.font = TECHF(fs);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			knock = { x: cx, reach: 1.3 * cell, width: Math.max(2, 0.16 * fs) };

			// The ruled scale under the current line, on the paper: a tick a
			// cell, every fifth taller; written out from the point; brighter
			// while the paper is held; gone as the stop forms.
			const held = hand.held > 0 && t < BT.e2;
			const ruleA = out * lerp(0.1, 0.2, held ? 1 : 0) * (1 - smooth(span(t, ...B.stop)));
			if (ruleA > 0.004)
				for (let c = 0; c <= RULE; c++) {
					const a = smooth(span(t, B.ruler[0] + 0.012 * c, B.ruler[0] + 0.012 * c + 0.12));
					const x = X(c);
					if (x < -cell || x > w + cell) continue;
					const tall = c % 5 === 0 ? 0.3 : 0.15;
					vline(ctx, x, g.yRule - tall * fs, g.yRule, ruleA * a);
				}

			// ── The point ──
			// A hairline 1.3 rows tall; blinking while the date waits, steady
			// after a key; closing to the full stop, dim gold, at the end. Drawn
			// under the type: a character at the point is struck in front of it.
			const app = smooth(span(t, ...B.point));
			const stopK = smooth(span(t, ...B.stop));
			let pa = 0.55 * app;
			const waiting = hand.caret > 0 && hand.enter1 <= 0 && t >= Q1_END + 0.1;
			if (waiting && !blinkOn(hand.secs, hand.steady > 0)) pa = 0.08;
			const ph = lerp(1.3 * R * app, 2 * g.r, stopK);
			const pw = lerp(1, 2 * g.r, stopK);
			const pyc = lerp(yMid, yB - g.r, stopK);
			ctx.globalAlpha = out * lerp(pa, 0.6, stopK);
			ctx.fillStyle = stopK > 0 ? mix(stopK) : PAL.chalk;
			ctx.beginPath();
			if (stopK > 0) ctx.roundRect(cx - pw / 2, pyc - ph / 2, pw, ph, Math.min(pw, ph) / 2);
			else ctx.rect(cx - 0.5, pyc - ph / 2, 1, ph);
			ctx.fill();

			// ── The date's line ──
			const lineA = out;
			for (let i = 0; i < Q1_TEXT.length; i++)
				glyph(ctx, Q1_TEXT[i], X(i), y1, lineA * struck(t - K1[i]));
			// Its cells: eight faint underlines and two dots, come up as the
			// question ends; the underlines go on Enter, the dots read whole.
			const cellsA = lineA * smooth(span(t, Q1_END - 0.1, Q1_END + 0.25));
			const ulA = cellsA * (1 - smooth(span(t, BT.e1, BT.e1 + 0.4)));
			const typed = hand.typed;
			const bad = typed.length ? badGroups(typed) : [false, false, false];
			for (let i = 0; i < 8; i++) {
				const x = X(DIGIT_COL[i]);
				const rose = bad[groupOf(i)];
				hline(
					ctx,
					x - 0.36 * cell,
					x + 0.36 * cell,
					y1 + 0.24 * fs,
					ulA * (rose ? 0.6 : 0.24),
					rose ? PAL.rose : PAL.chalk
				);
			}
			for (const c of DOT_COL)
				glyph(ctx, '.', X(c), y1, cellsA * lerp(0.4, 0.85, smooth(span(t, BT.e1, BT.e1 + 0.3))));
			// The digits, struck as they came; gold on Enter, settling.
			const gold1 = flash(t, B.gold1);
			for (let i = 0; i < typed.length; i++) {
				const at = arrival(i);
				const now = live && t < BT.e1 ? hand.secs : t;
				const a = live && t >= BT.e1 ? 0.85 : struck(now - at);
				const rose = bad[groupOf(i)] && t < BT.e1;
				const col = rose ? PAL.rose : gold1 > 0 ? mix(gold1) : PAL.chalk;
				glyph(ctx, typed[i], X(DIGIT_COL[i]), y1, lineA * (rose ? 0.9 : lerp(a, 0.7, gold1)), col);
			}
			// Taken back: lifting off.
			if (live && t < BT.e1)
				for (const l of D.lifts) {
					const x = span(hand.secs - l.at, 0, 0.1);
					glyph(ctx, l.ch, X(l.col), y1 - 0.3 * fs * x, lineA * 0.85 * (1 - x));
				}

			// ── The spice's line ──
			if (t >= BT.q2) {
				for (let i = 0; i < Q2_TEXT.length; i++)
					glyph(ctx, Q2_TEXT[i], X(i), y2, lineA * struck(t - K2[i]));
				// The scale: come up as the question ends; the number under the
				// point full, its neighbours fading to 0.2 three away. On Enter
				// the rest fade and the chosen one closes up after the question.
				const sA = lineA * smooth(span(t, Q2_END - 0.1, Q2_END + 0.3));
				const rest = 1 - smooth(span(t, BT.e2, BT.e2 + 0.3));
				const vF = Math.round(hand.value);
				const close = smooth(span(t, BT.e2, BT.e2 + B.throw));
				const gold2 = flash(t, B.gold2);
				const tickA = sA * rest * (held ? 0.55 : 0.4);
				for (let k = 1; k <= 10; k++) {
					const d = Math.abs(k - v);
					const near = d < 1 ? lerp(1, 0.55, d) : lerp(0.55, 0.2, clamp01((d - 1) / 2));
					const chosen = t >= BT.e2 && k === vF;
					const s = String(k);
					let col = scaleCol(k);
					let a = sA * near * rest;
					let color = PAL.chalk;
					if (chosen) {
						col = lerp(col, S0 + (s.length - 1) / 2, close);
						a = sA * lerp(lerp(1, 0.85, close), 0.7, gold2);
						color = mix(gold2);
					}
					glyph(ctx, s, X(col), y2, a, color);
					const tx = X(scaleCol(k));
					vline(ctx, tx, y2 + 0.2 * fs, y2 + 0.44 * fs, tickA * lerp(0.6, 1, clamp01(1 - d)));
				}
				// The row a press takes the paper in.
				if (t >= Q2_END && t < BT.e2) band = { y0: yMid - 0.75 * R, y1: yMid + 0.75 * R, cell };
			}

			ctx.restore();

			// The hand over the paper.
			if (live) {
				let c = '';
				if (band && hand.asking === 'spice') {
					if (hand.held) c = 'grabbing';
					else if (hover && hover[1] >= band.y0 && hover[1] <= band.y1) c = 'grab';
				}
				setCursor(c);
				if (window.__lab)
					window.__lab.carriage = {
						band,
						cx,
						cell,
						P,
						value: hand.value,
						shown: v,
						held: hand.held,
						t
					};
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
