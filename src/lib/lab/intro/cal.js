// ── log-intro · cal — the month you were born in sets itself as you type it ──
// The shell's own calendar. The title is the terminal's (log-dawn
// makeTerminal, no command), typed and FROZEN the moment its full stop lands
// — never zoomed. It steps up two rows and back to half, and the terminal
// asks under it, in the same face at the same pitch: 'when were you born?',
// the field on the next row (eight digit cells as faint underlines, the two
// dots, the block caret). Beside the question the machine prints a MONTH the
// way `cal -m` does — seven columns of three-character cells, the numbers
// right-aligned, Monday first, no weekday letters, no month name — faintly,
// starting in the first column, and as the date is typed the page sets
// itself to it:
//
//   day, 1st digit   lifts the days it still allows (0: 1–9, 1: 10–19, 2:
//                    20–29, 3: 30–31); 4 to 9 allow none, and go rose
//   day, 2nd digit   that day in a REVERSE-VIDEO box, the number knocked out
//   month, 2nd       trims the page: the days past its end fade (February's
//                    29th waits for the year)
//   year, 4th        the page SLIDES into its weekdays — every day steps on
//                    cell by cell, wrapping at the rows' ends the way text
//                    reflows, until the 1st sits on the weekday it fell on;
//                    a leap year brings the 29th of February back
//
// Backspace undoes each step the way it came. A date that cannot be is shown
// gently: a month 00 or past 12 leaves the page untrimmed and its digits rose
// (a first digit past 1 at once); a day 00 has no box and its digits rose; a
// day past its month's end puts the box in the cell past the end, as a rose
// outline; a year off 1900–2099 keeps the page from sliding, and goes rose.
//
// Enter: the box turns gold, the rest of the month steps back. 'how spicy?'
// types under the field and the spice row prints under it in cal's layout,
// ' 1  2 … 10'; the box LIFTS off the day (a hairline gold rim stays round
// it), travels on an arc to the row and lands on 1, chalk now: the handle. It
// is a WINDOW that inverts what it is over — the row, its fill, the row again
// in the ground clipped to it — so dragged between two numbers it knocks out
// part of each. Press on the row or on the box and it follows the pointer;
// let go and it snaps into the nearest cell; ← → a cell, a digit (0 is 10).
// Enter: gold. The close holds the month with its gold-rimmed day and the
// gold box on the row; then out.
//
// Beats (seconds; 21 s, `at` = t / 21): 0–4.94 the title typed; 5.14 frozen;
// 5.3–6.1 up two rows, to 0.5; 6.0 the date asked (q1, at 0.286); 6.6–7.3
// the month printed; 7.5 the wait (wait1, at 0.357), the scripted digits
// 7.6–9.0, the slide at 9.0; 9.6 Enter (e1, at 0.457); 10.6 the spice asked
// (q2, at 0.505); 11.0–11.5 the row printed; 11.3–11.85 the box's flight;
// 11.9 the wait (wait2, at 0.567); 12.0–13.5 the scripted drag; 13.9 Enter
// (e2, at 0.662); to 17.5 the close; 17.6–20.3 out; the ground to 21.
//
// Every frame is a pure function of t and the hand. The scripted digits'
// arrival times are read off the demo's own hand once, at load; live, what
// the controller does not keep is remembered as the hand changes (a cache of
// inputs, never of frames): when each digit arrived or went, and when the
// handle was pressed, let go or stepped.

import { PAL, TECH_FONT, span, smooth, lerp, clamp01 } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';
import { script, DEMO } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const TERM = makeTerminal(0.8, { cmd: false });
const FREEZE = TERM.stop + 0.2; // the frame the title is held at (≈ 5.14)
const SECONDS = 21;
const Q1 = 6.0;
const W1 = 7.5;
const E1 = 9.6;
const Q2 = 10.6;
const W2 = 11.9;
const E2 = 13.9;

const B = {
	rise: [5.3, 6.1], // the title up two rows, and back to 0.5
	field: [6.5, 6.9], // the field's underlines written
	month: 6.6, // the month's first row printed; a row every ROW_DT
	dim1: [E1, E1 + 0.5], // the rest of the month to 0.1
	dim2: [Q2, Q2 + 0.5], // the date's question and field to 0.4
	row: [11.0, 11.5], // the spice row printed
	lift: [11.3, 11.85], // the box off the day, onto the row
	out: [17.6, 20.3]
};
const ROW_DT = 0.14;

export const meta = {
	title:
		"cal — the month you were born in sets itself as you type it; the box on your day becomes the spice's handle",
	order: 12,
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

// The questions, typed on the terminal's own hand (dial's table).
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
const Q1_DONE = Q1 + K1[K1.length - 1];

// The terminal's caret: blinks 2.3 a second, on 58% of each.
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, k) => {
	const A = rgbOf(a);
	const C = rgbOf(b);
	return `rgb(${A.map((v, i) => Math.round(lerp(v, C[i], clamp01(k)))).join(', ')})`;
};

// ── The calendar ─────────────────────────────────────────────────────────────
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9]; // DD.MM.YYYY: where each digit sits
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const okMonth = (m) => m >= 1 && m <= 12;
const okYear = (y) => y >= 1900 && y <= 2099;
// The column the 1st falls in, Monday first (cal -m).
const firstCol = (y, m) => (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
// The spice at x, between the cells' box centres C[1…10].
function valueAt(C, x) {
	if (x <= C[1]) return 1;
	for (let i = 1; i < 10; i++) if (x <= C[i + 1]) return i + (x - C[i]) / (C[i + 1] - C[i]);
	return 10;
}
// How long each digit's step takes to play (the slide is the year's 4th).
const DUR = [0.25, 0.28, 0.2, 0.3, 0.2, 0.2, 0.2, 0.35];

export async function make({ board, answers, live }) {
	await document.fonts.load(TECHF(24)).catch(() => null);

	// ── Layout, cached per board size ────────────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		const { fs, step, cell } = L;
		const x0 = L.out[0].x0;
		const yT = L.out[2].y; // the title's last line, before it steps up
		ctx.save();
		ctx.font = TECHF(fs);
		const mQ = ctx.measureText(Q1_TEXT);
		const ascQ = mQ.actualBoundingBoxAscent;
		const fsM = 0.8 * fs;
		ctx.font = TECHF(fsM);
		const adv = ctx.measureText('0').width;
		const capM = ctx.measureText('0123456789').actualBoundingBoxAscent;
		ctx.restore();
		const cellW = 3 * adv; // cal's cell: two digits right-aligned and a space
		const rowM = 0.8 * step;
		// The rows: the question where the title's last line was (a blank row
		// under the title once it has stepped up two), the field, the spice.
		const yQ1 = yT;
		const yF = yQ1 + step;
		const yQ2 = yF + step;
		const yS = yQ2 + step;
		// The month: four of its cells past the end of the question (the
		// longer of question and field), its top level with the question's.
		const qEnd = x0 + Math.max(mQ.width, 10 * cell);
		const mx = qEnd + 4 * cellW;
		const my0 = yQ1 - ascQ + capM;
		G = {
			w,
			h,
			fs,
			step,
			cell,
			x0,
			yQ1,
			yF,
			yQ2,
			yS,
			fsM,
			adv,
			capM,
			cellW,
			rowM,
			mx,
			my0,
			bw: 0.75 * cellW,
			bh: 0.75 * rowM
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

	// ── The digits: when each came (and went) ────────────────────────────────
	// Each place keeps the record of the digit in it (the date typed up to and
	// including it, and when it came) and of the one that went last (when it
	// went), so a Backspace plays the step back the way it came.
	const mem = Array.from({ length: 8 }, () => ({ cur: null, old: null }));
	function sync(hand) {
		const secs = hand.secs;
		for (let i = 0; i < 8; i++) {
			const p = hand.typed.length > i ? hand.typed.slice(0, i + 1) : null;
			const m = mem[i];
			if ((m.cur ? m.cur.p : null) === p) continue;
			if (m.cur) m.old = { p: m.cur.p, at: m.cur.at, gone: secs };
			m.cur = p ? { p, at: secs } : null;
		}
	}
	// The records at place i, each with how far its step has played.
	function recs(i, t, hand) {
		const D = DUR[i];
		if (!live) {
			if (t < KEYT[i] || hand.typed.length <= i) return [];
			return [{ p: DEMO.date.slice(0, i + 1), lv: easeIO(span(t - KEYT[i], 0, D)) }];
		}
		const out = [];
		const secs = hand.secs;
		const { cur, old } = mem[i];
		if (old) {
			const lv = easeIO(span(old.gone - old.at, 0, D)) * (1 - easeIO(span(secs - old.gone, 0, D)));
			if (lv > 0) out.push({ p: old.p, lv });
		}
		if (cur) out.push({ p: cur.p, lv: easeIO(span(secs - cur.at, 0, D)) });
		return out;
	}
	const strongest = (rs) => rs.reduce((a, r) => (!a || r.lv >= a.lv ? r : a), null);

	// The page at t: each day's ink, the slide, and the box (or boxes, while
	// one goes and another comes).
	function pageState(t, hand) {
		const R = [];
		for (let i = 0; i < 8; i++) R.push(recs(i, t, hand));
		const lift = new Float32Array(33);
		const trim = new Float32Array(33);
		for (const r of R[0]) {
			const d0 = Number(r.p[0]);
			for (let d = 1; d <= 31; d++)
				if (Math.floor(d / 10) === d0) lift[d] = Math.max(lift[d], r.lv);
		}
		for (const r of R[3]) {
			const mm = Number(r.p.slice(2, 4));
			if (!okMonth(mm)) continue;
			for (let d = LEN[mm - 1] + 1; d <= 31; d++) trim[d] = Math.max(trim[d], r.lv);
		}
		const r3 = strongest(R[3]);
		const mm3 = r3 ? Number(r3.p.slice(2, 4)) : 0;
		const L3 = r3 && okMonth(mm3) ? r3.lv : 0;
		// The year: the slide, and February's 29th answered.
		let o = 0;
		let back29 = 0;
		let gone29 = 0;
		for (const r of R[7]) {
			const mm = Number(r.p.slice(2, 4));
			const y = Number(r.p.slice(4, 8));
			if (!okMonth(mm) || !okYear(y)) continue;
			o += firstCol(y, mm) * r.lv;
			if (mm === 2) {
				if (isLeap(y)) back29 = Math.max(back29, r.lv);
				else gone29 = Math.max(gone29, r.lv);
			}
		}
		trim[29] *= 1 - back29;
		// The box: on the day, or in the cell past the month's end.
		const boxes = [];
		for (const r of R[1]) {
			const dd = Number(r.p.slice(0, 2));
			if (dd === 0) continue;
			let idx = Math.min(dd, 32) - 1;
			let rose = dd > 31 ? 1 : 0;
			if (L3 > 0) {
				if (mm3 === 2 && dd === 29) rose = gone29;
				else {
					const end = mm3 === 2 ? 28 + back29 : LEN[mm3 - 1];
					if (dd > end) {
						idx = lerp(idx, end, L3);
						rose = Math.max(rose, L3);
					}
				}
			}
			boxes.push({ dd, idx, rose, lv: r.lv, real: dd <= 31 && rose < 0.5 });
		}
		return { lift, trim, o, boxes };
	}

	// The field's digits in rose where they cannot be.
	function roseDigits(typed) {
		const bad = new Array(8).fill(false);
		const n = typed.length;
		if (n >= 1 && Number(typed[0]) >= 4) bad[0] = true;
		if (n >= 2 && typed.slice(0, 2) === '00') bad[0] = bad[1] = true;
		if (n >= 3 && Number(typed[2]) >= 2) bad[2] = true;
		if (n >= 4 && !okMonth(Number(typed.slice(2, 4)))) bad[2] = bad[3] = true;
		if (n >= 8 && !okYear(Number(typed.slice(4, 8)))) bad[4] = bad[5] = bad[6] = bad[7] = true;
		return bad;
	}

	// ── The handle: pressed, let go, stepped ─────────────────────────────────
	const hd = { held: 0, pressAt: -99, pressFrom: 1, from: 1, to: 1, at: -99, last: 1 };
	const hdNow = (secs) => lerp(hd.from, hd.to, easeOut(span(secs - hd.at, 0, 0.18)));
	function shownValue(hand) {
		if (!live) return hand.value;
		const secs = hand.secs;
		if (hand.held) {
			if (!hd.held) {
				hd.held = 1;
				hd.pressAt = secs;
				hd.pressFrom = hdNow(secs);
			}
			// Glides to the pointer from where it was pressed, then follows it.
			hd.last = lerp(hd.pressFrom, hand.value, easeOut(span(secs - hd.pressAt, 0, 0.14)));
			return hd.last;
		}
		if (hd.held) {
			// Let go: the controller has rounded; snap into the cell.
			hd.held = 0;
			hd.from = hd.last;
			hd.to = hand.value;
			hd.at = secs;
		} else if (hand.value !== hd.to) {
			hd.from = hdNow(secs);
			hd.to = hand.value;
			hd.at = secs;
		}
		return hdNow(secs);
	}

	// ── The pointer on the spice row ─────────────────────────────────────────
	let SL = null; // this frame's row and handle on screen, once it has landed
	let grabOff = 0;
	const hit = (X, Y, phase) => {
		if (!SL) return null;
		const vAt = (x) => valueAt(SL.C, x);
		if (phase === 'down') {
			const onBox = Math.abs(X - SL.bx) <= SL.bw / 2 + 3 && Math.abs(Y - SL.by) <= SL.bh / 2 + 3;
			const onRow =
				X >= SL.sx - 3 && X <= SL.sx + 10 * SL.cellW && Math.abs(Y - SL.by) <= SL.rowM / 2 + 6;
			if (!onBox && !onRow) return null;
			grabOff = onBox ? X - SL.bx : 0;
		}
		return vAt(X - grabOff);
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
	function block(ctx, g, x, y, alpha) {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.globalAlpha = 0.9 * alpha;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(x, y - 0.78 * g.fs, g.cell, 0.92 * g.fs);
		ctx.restore();
	}
	// A question typed at the margin by its table from t0; its caret while it
	// types and a beat after.
	function ask(ctx, g, str, K, t0, t, y, alpha, secs) {
		const n = t >= t0 ? typedBy(K, t - t0) : 0;
		text(ctx, str.slice(0, n), g.x0, y, g.fs, 0.92 * alpha);
		const done = t0 + K[K.length - 1];
		if (t >= t0 && t < done + 0.12) {
			const last = n > 0 ? t0 + K[n - 1] : -9;
			if (blinkOn(secs, t - last < 0.16)) {
				ctx.save();
				ctx.font = TECHF(g.fs);
				const xw = ctx.measureText(str.slice(0, n)).width;
				ctx.restore();
				block(ctx, g, g.x0 + xw, y, alpha);
			}
		}
	}
	// A box: fill and/or outline, centred (cx, cy), scaled by s.
	function box(ctx, g, cx, cy, { fill, fillA = 0, line, lineA = 0, lw = 1, s = 1 }) {
		const W = s * g.bw;
		const H = s * g.bh;
		ctx.save();
		if (fillA > 0.004) {
			ctx.globalAlpha = fillA;
			ctx.fillStyle = fill;
			ctx.fillRect(cx - W / 2, cy - H / 2, W, H);
		}
		if (lineA > 0.004) {
			ctx.globalAlpha = lineA;
			ctx.strokeStyle = line;
			ctx.lineWidth = lw;
			ctx.strokeRect(cx - W / 2 + lw / 2, cy - H / 2 + lw / 2, W - lw, H - lw);
		}
		ctx.restore();
	}

	// A month cell's place on screen at a fractional index: its left edge and
	// baseline, and a second place on the next row while it wraps.
	function places(g, p) {
		const row = Math.floor(p / 7);
		const col = p - 7 * row;
		const out = [[g.mx + col * g.cellW, g.my0 + row * g.rowM]];
		if (col > 6) out.push([g.mx + (col - 7) * g.cellW, g.my0 + (row + 1) * g.rowM]);
		return out;
	}
	// A cell's box centre, from its left edge and baseline: on the number's
	// ink — the middle of the cell for one digit, of its first two for two.
	const boxC = (g, x, y, one) => [x + (one ? 1.5 : 1) * g.adv, y - g.capM / 2];

	function month(ctx, g, t, hand, st, A) {
		if (t < B.month - 0.05 || A <= 0.004) return null;
		const dim1 = smooth(span(t, ...B.dim1));
		const lifted = smooth(span(t, B.lift[0], B.lift[0] + 0.15));
		const g1 = smooth(hand.enter1);
		const sel = st.boxes.length ? st.boxes[st.boxes.length - 1] : null;
		const ink = new Float32Array(33);
		for (let d = 1; d <= 31; d++) {
			let a = lerp(0.12, 0.3, st.lift[d]);
			a = lerp(a, 0.05, st.trim[d]);
			a = lerp(a, Math.min(a, 0.1), dim1);
			if (sel && sel.real && sel.dd === d) a = lerp(a, 0.45, lifted);
			const r0 = Math.floor((d - 1) / 7);
			ink[d] = a * smooth(span(t, B.month + r0 * ROW_DT, B.month + r0 * ROW_DT + 0.1));
		}
		const days = (color, alphaOf) => {
			ctx.fillStyle = color;
			for (let d = 1; d <= 31; d++) {
				const a = alphaOf(d);
				if (a <= 0.004) continue;
				ctx.globalAlpha = a;
				for (const [x, y] of places(g, d - 1 + st.o)) ctx.fillText(String(d), x + 2 * g.adv, y);
			}
		};
		ctx.save();
		// The page's band: what slides past its right edge comes in at its left.
		ctx.beginPath();
		ctx.rect(g.mx - 0.25 * g.adv, g.my0 - 1.5 * g.rowM, 7 * g.cellW + 0.25 * g.adv, 9 * g.rowM);
		ctx.clip();
		ctx.font = TECHF(g.fsM);
		ctx.textAlign = 'right';
		ctx.textBaseline = 'alphabetic';
		days(PAL.chalk, (d) => A * ink[d]);
		// The box on the day — reverse video — or a rose outline past the end;
		// gold on Enter; off to the spice row from the lift on, a hairline gold
		// rim left round the day.
		let from = null;
		for (const b of st.boxes) {
			const fillK = b.lv * (1 - b.rose) * (1 - lifted);
			const lineK = b.lv * b.rose * (1 - lifted);
			for (const [x, y] of places(g, b.idx + st.o)) {
				const [cx, cy] = boxC(g, x, y, b.dd < 10);
				box(ctx, g, cx, cy, {
					fill: mix(PAL.chalk, PAL.gold, g1),
					fillA: A * fillK * lerp(0.75, 0.7, g1),
					line: mix(PAL.rose, PAL.gold, g1),
					lineA: A * lineK * 0.9,
					lw: 1.2
				});
				if (fillK > 0.004) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(cx - g.bw / 2, cy - g.bh / 2, g.bw, g.bh);
					ctx.clip();
					days(PAL.ground, () => A * Math.min(1, 1.6 * fillK));
					ctx.restore();
				}
				if (g1 > 0 && lifted > 0)
					box(ctx, g, cx, cy, { line: PAL.gold, lineA: A * 0.6 * lifted * b.lv, lw: 1 });
				if (b === sel) from = { cx, cy, fill: 1 - b.rose };
			}
		}
		ctx.restore();
		return from;
	}

	// The spice row, the handle over it (a window that inverts it), and the
	// box's flight onto it.
	function spice(ctx, g, t, hand, from, A) {
		SL = null;
		if (t < B.row[0] || A <= 0.004) return;
		const sx = g.x0;
		const by = g.yS - g.capM / 2;
		const C = [0];
		for (let k = 1; k <= 10; k++) C.push(boxC(g, sx + (k - 1) * g.cellW, g.yS, k < 10)[0]);
		const cx = (v) => {
			const i = Math.max(1, Math.min(9, Math.floor(v)));
			return lerp(C[i], C[i + 1], v - i);
		};
		const shown = shownValue(hand);
		const g2 = smooth(hand.enter2);
		// Where the box is: in flight from the day, or on the row.
		const f = span(t, B.lift[0], B.lift[1]);
		const e = easeIO(f);
		let bx = cx(shown);
		let bY = by;
		let s = 1;
		let fill = mix(PAL.chalk, PAL.gold, g2);
		let fillA = lerp(hand.held ? 0.86 : 0.8, 0.7, g2);
		let lineA = 0;
		if (t < B.lift[0]) fillA = 0;
		else if (f < 1) {
			if (from) {
				// A quadratic arc: off the day down and to the left, and in along
				// the row from its right, level with it as it lands — under the
				// month and never across the questions over the row; the row
				// shows through it inverted as it passes.
				const qx = lerp(from.cx, bx, 0.3);
				const qy = bY;
				const u = 1 - e;
				bx = u * u * from.cx + 2 * u * e * qx + e * e * bx;
				bY = u * u * from.cy + 2 * u * e * qy + e * e * bY;
				s = 1 + 0.14 * Math.sin(Math.PI * e);
				fill = mix(PAL.gold, PAL.chalk, e);
				fillA = lerp(0.7, 0.8, e) * lerp(from.fill, 1, smooth(span(f, 0, 0.5)));
				lineA = 0.9 * (1 - from.fill) * (1 - smooth(span(f, 0, 0.5)));
			} else fillA *= smooth(f); // no box to lift: it comes up on the row
		}
		const row = (color, alphaOf) => {
			ctx.save();
			ctx.font = TECHF(g.fsM);
			ctx.textAlign = 'right';
			ctx.textBaseline = 'alphabetic';
			ctx.fillStyle = color;
			for (let k = 1; k <= 10; k++) {
				const a = alphaOf(k);
				if (a <= 0.004) continue;
				ctx.globalAlpha = a;
				ctx.fillText(String(k), sx + (k - 1) * g.cellW + 2 * g.adv, g.yS);
			}
			ctx.restore();
		};
		const printed = (k) =>
			smooth(span(t, B.row[0] + (k - 1) * 0.05, B.row[0] + (k - 1) * 0.05 + 0.06));
		row(PAL.chalk, (k) => A * 0.5 * printed(k));
		box(ctx, g, bx, bY, { fill, fillA: A * fillA, line: PAL.gold, lineA: A * lineA, lw: 1.2, s });
		if (fillA > 0.004) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(bx - (s * g.bw) / 2, bY - (s * g.bh) / 2, s * g.bw, s * g.bh);
			ctx.clip();
			row(PAL.ground, (k) => A * Math.min(1, 1.4 * fillA) * printed(k));
			ctx.restore();
		}
		// Held: a hairline round the handle, under the pointer.
		if (hand.held && f >= 1)
			box(ctx, g, bx, bY, { line: PAL.chalk, lineA: A * 0.35, lw: 1, s: 1.16 });
		if (f >= 1) SL = { sx, C, cellW: g.cellW, rowM: g.rowM, bx, by, bw: g.bw, bh: g.bh, shown };
	}

	function field(ctx, g, t, hand, A) {
		if (t < B.field[0] || A <= 0.004) return;
		const y = g.yF;
		const typed = hand.typed;
		const bad = roseDigits(typed);
		const fr = span(t, ...B.field);
		ctx.save();
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = 1;
		for (let i = 0; i < 8; i++) {
			const j = DIGIT_CELL[i];
			const a = smooth(span(fr, i / 10, i / 10 + 0.3));
			if (a <= 0) continue;
			ctx.globalAlpha = A * 0.22 * a;
			ctx.beginPath();
			ctx.moveTo(g.x0 + (j + 0.12) * g.cell, y + 0.22 * g.fs);
			ctx.lineTo(g.x0 + (j + 0.88) * g.cell, y + 0.22 * g.fs);
			ctx.stroke();
		}
		ctx.restore();
		for (const j of [2, 5])
			text(
				ctx,
				'.',
				g.x0 + (j + 0.5) * g.cell,
				y,
				g.fs,
				A * 0.6 * smooth(span(fr, 0.4, 1)),
				PAL.chalk,
				'center'
			);
		for (let i = 0; i < typed.length; i++)
			text(
				ctx,
				typed[i],
				g.x0 + (DIGIT_CELL[i] + 0.5) * g.cell,
				y,
				g.fs,
				A * 0.92,
				bad[i] ? PAL.rose : PAL.chalk,
				'center'
			);
		// The caret: in the next cell, or after the field once all eight are
		// in, waiting for Enter.
		if (hand.caret > 0 && hand.enter1 <= 0 && t >= Q1_DONE + 0.12) {
			if (blinkOn(hand.secs, hand.steady > 0)) {
				const j = typed.length < 8 ? DIGIT_CELL[typed.length] : 10.4;
				block(ctx, g, g.x0 + j * g.cell, y, A);
			}
		}
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = geom(ctx, w, h);
			if (live) sync(hand);
			answers.slider(hit);
			const out = 1 - smooth(span(t, ...B.out));
			const secs = hand.secs;

			// The title: typed, then held at its stop, stepped up and back.
			if (t < FREEZE) TERM.draw(ctx, w, h, t / 10, t, t - 10);
			else if (out > 0.004) {
				const r = span(t, ...B.rise);
				ctx.save();
				ctx.globalAlpha = out * lerp(1, 0.5, smooth(r));
				ctx.drawImage(frozenFrame(w, h), 0, -2 * g.step * easeIO(r), w, h);
				ctx.restore();
			}
			if (t < Q1 || out <= 0.004) {
				SL = null;
				if (live) setCursor('');
				return;
			}

			// The date: the question, the field, the month beside them.
			const dA = out * lerp(1, 0.4, smooth(span(t, ...B.dim2)));
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.yQ1, dA, secs);
			field(ctx, g, t, hand, dA);
			const st = pageState(t, hand);
			const from = month(ctx, g, t, hand, st, out);

			// The spice: its question, the row, the handle.
			if (t >= Q2) ask(ctx, g, Q2_TEXT, K2, Q2, t, g.yQ2, out, secs);
			spice(ctx, g, t, hand, from, out);

			if (live) {
				let c = '';
				if (SL && hand.asking === 'spice') {
					if (hand.held) c = 'grabbing';
					else if (hover) {
						const [X, Y] = hover;
						const onRow =
							X >= SL.sx - 3 &&
							X <= SL.sx + 10 * SL.cellW &&
							Math.abs(Y - SL.by) <= SL.rowM / 2 + 6;
						if (onRow) c = 'grab';
					}
				}
				setCursor(c);
				// For a scripted hand checking the handle (the lab copies info
				// once, so this is written onto it each frame).
				if (window.__lab)
					window.__lab.cal = {
						t,
						typed: hand.typed,
						value: hand.value,
						held: hand.held,
						slider: SL,
						o: st.o,
						boxes: st.boxes
					};
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
