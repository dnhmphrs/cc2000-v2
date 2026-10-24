// ── log-intro · punch — the date cut into a card, the card read by light ─────
// A PUNCHED CARD. The title is the terminal's (log-dawn makeTerminal, no
// command), typed and FROZEN the moment its full stop lands — never zoomed —
// then lifted two rows and dimmed. The terminal carries on under it in the
// same face at the same pitch: the question typed at the title's margin, the
// row under it left for the second, and below them a CARD, drawn in one chalk
// stroke with its top-left corner cut at 45° as a real card's is, a breath of
// chalk over it so a hole reads as cut out. Along its top is the INTERPRETER
// row; under it the hole field, ten rows, 22 columns at 0.55w / 25.
//
//   date   eight columns printed onto the card, grouped 2 · 2 · 4 with an
//          empty column between groups, each the digits 0 to 9 top to bottom
//          in the mono at 0.45 of the type, faint. A hairline frame round the
//          next column is the caret (blinking on the clock, steady after a
//          key). Each digit typed CUTS its hole: the printed digit in that row
//          becomes a clean rectangle of ground with a chalk edge, its chad
//          drops half a row and fades, and the digit is printed full size in
//          the interpreter row over its column ('14 02 1987'). Backspace
//          closes the last hole, the print coming back, and the frame steps
//          back. A group that cannot be (a day past its month, a month past
//          12, a year off 1900–2099, checked on its prefix too) shows its
//          interpreter digits in rose. With eight in, the frame goes round the
//          whole field and waits for Enter. Enter: the card is READ — a sweep
//          of 0.05 s a column fills the holes with gold, a small glow, no
//          bloom, and each settles to a gold rim.
//   spice  'how spicy?' on the empty row; ten columns printed to the right of
//          the date, two blank columns over, each ONE number (1 to 10) on the
//          field's middle row. The PUNCH DIE — a hairline frame a little larger
//          than a hole, its stem rising above the card's top edge — starts on
//          1. Press on the field (its ten columns, the card's full height) or
//          on the die and the die follows the pointer's x, the number under
//          it brightening; let go and it snaps to the nearest column and
//          PUNCHES there, chad and all, the last spice hole closing, so the
//          field only ever has one; the number goes up to the interpreter
//          row. ← → a column, a digit (0 is 10) straight to it, punched at
//          once. Enter: the whole card is read again, the nine holes lit in
//          one sweep.
//
// Then the close: the card's print and outline, the questions and the title
// fade; only the nine holes stay, dim gold points on the dark — the answers
// as light — and they go out. Ground, and round.
//
// Beats (seconds of 22; at = t / 22): 0–4.94 the terminal types, its stop
// lands; 5.14 frozen; 5.3–6.1 the title lifts two rows and dims; 6.0 the date
// asked (q1, at 0.273); 6.6–7.0 the card drawn; 7.0–7.6 the date field
// printed; 7.7 the wait (wait1, at 0.35), the scripted digits ≈ 7.8–9.2; 9.8
// the read (e1, at 0.445), settled by 10.8; 10.9 the spice asked (q2, at
// 0.495); 11.3–11.8 the spice field, the die; 11.9 the wait (wait2, at
// 0.541), the scripted drag 12.0–13.5, the punch 13.64; 13.9 the read (e2, at
// 0.632) to ≈ 15; 15.5–17.5 the card goes (at 0.70–0.80); 19.5–21 the holes
// go out (at 0.89–0.95); ground to 22.
//
// Every frame is a pure function of t and the hand. Kept are caches of
// inputs only: the digits' arrival times (sampled from the demo's script once
// at load; live, remembered as the hand types, with Backspace's close times),
// the die's press and release times and where it was let go, the punched
// column and when — and the frozen title, drawn once per board size.

import { PAL, TECH_FONT, stroke, span, smooth, lerp, clamp01 } from '../log/board.js';
import { glow } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';
import { script, HAND } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const TERM = makeTerminal(0.8, { cmd: false });
const FREEZE = TERM.stop + 0.2; // the frame the title is held at (≈ 5.14)
const SECONDS = 22;
const Q1 = 6.0;
const W1 = 7.7;
const E1 = 9.8;
const Q2 = 10.9;
const W2 = 11.9;
const E2 = 13.9;

const B = {
	lift: [5.3, 6.1], // the title up two rows, dimmed
	card: [6.6, 7.0], // the card's outline written
	print1: 7.0, // the date field printed, a column every 0.055 s
	caret: 7.6, // the frame caret takes over from the block
	settle1: 10.8, // the read's gold settled to rims
	qdim: [Q2, Q2 + 0.5], // the first question steps back
	print2: 11.3, // the spice field printed, a column every 0.035 s
	die: [11.6, 11.9], // the die appears
	close: [15.5, 17.5], // the card, the questions and the title go
	out: [19.5, 21] // the holes go out
};

export const meta = {
	title:
		'punch — the date cut into a card a digit at a time, the card read by light; the spice one hole punched by a die',
	order: 14,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 }
};

// The demo's hand, as the controller scripts it: the digits' arrival times
// (the controller passes only how many are typed), and when it lets go.
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
const RELEASE = SB.drag2 + HAND.drag + HAND.release; // and lets it go
const V_REL = script(RELEASE - 1e-4, SB).value; // where it let go
const SNAP = 0.12; // the die eases to its column on release
const STEP = 0.08; // and on a key
const PUNCH_S = RELEASE + SNAP; // the scripted punch

// The questions, typed on the terminal's own hand: a table of times.
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
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const GOLD = [245, 193, 80];

// ── The card ─────────────────────────────────────────────────────────────────
// 22 columns at a pitch of a 25th of the card: the date's eight (2 · 2 · 4,
// an empty column between groups), two blank, the spice's ten.
const PITCHES = 25;
const DATE_COL = [0, 1, 3, 4, 6, 7, 8, 9];
const SPICE_COL = (v) => 11 + v; // 1…10 → columns 12…21
const GROUP_OF = [0, 0, 1, 1, 2, 2, 2, 2];
const CHAD = 0.25; // a chad falls for this long
const BACK = 0.15; // a closed hole's print comes back over this

// The groups that cannot be, on what is typed so far: a day past 31 or past
// its month (February 29 until the year says otherwise), a month past 12, a
// year off 1900–2099 — on the prefix too, as soon as no ending could save it.
function badGroups(typed) {
	const D = typed.slice(0, 2);
	const M = typed.slice(2, 4);
	const Y = typed.slice(4, 8);
	const bad = [false, false, false];
	if (D.length >= 1 && D[0] > '3') bad[0] = true;
	if (D.length === 2 && (Number(D) < 1 || Number(D) > 31)) bad[0] = true;
	if (M.length >= 1 && M[0] > '1') bad[1] = true;
	if (M.length === 2 && (Number(M) < 1 || Number(M) > 12)) bad[1] = true;
	if (Y.length >= 1 && Y[0] !== '1' && Y[0] !== '2') bad[2] = true;
	if (Y.length >= 2 && ((Y[0] === '1' && Y[1] !== '9') || (Y[0] === '2' && Y[1] !== '0')))
		bad[2] = true;
	if (D.length === 2 && M.length === 2 && !bad[0] && !bad[1]) {
		const y = Y.length === 4 && !bad[2] ? Number(Y) : null;
		const leap = y === null || (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
		const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Number(M) - 1];
		if (Number(D) > days) bad[0] = true;
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
		const { fs, step, cell } = L;
		const x0 = L.out[0].x0;
		const y0 = L.out[0].y;
		ctx.save();
		// The print: the mono at 0.45 of the type; a hole a little larger
		// than a printed digit (the spice's wide enough for its 10).
		const ps = 0.45 * fs;
		ctx.font = TECHF(ps);
		const m0 = ctx.measureText('0');
		const m10 = ctx.measureText('10');
		const pMid = (m0.actualBoundingBoxAscent - m0.actualBoundingBoxDescent) / 2;
		const pInkW = m0.actualBoundingBoxRight + m0.actualBoundingBoxLeft;
		const pInkH = m0.actualBoundingBoxAscent + m0.actualBoundingBoxDescent;
		const p10W = m10.actualBoundingBoxRight + m10.actualBoundingBoxLeft;
		ctx.font = TECHF(fs);
		const mI = ctx.measureText('0');
		const iMid = (mI.actualBoundingBoxAscent - mI.actualBoundingBoxDescent) / 2;
		const iInkW = mI.actualBoundingBoxRight + mI.actualBoundingBoxLeft;
		const iInkH = mI.actualBoundingBoxAscent + mI.actualBoundingBoxDescent;
		ctx.restore();
		const hw = Math.max(6, Math.round(pInkW + 4));
		const hh = Math.max(8, Math.round(pInkH + 5));
		const sw = Math.max(hw, Math.round(p10W + 5));
		// The card: 0.55w (wider only where a column would be narrower than
		// a digit and a half), on the title's margin.
		const cardW = Math.min(w - 32, Math.max(0.55 * w, PITCHES * 1.5 * cell));
		const P = cardW / PITCHES;
		const cardX = x0 + cardW > w - 16 ? Math.max(16, w - 16 - cardW) : x0;
		const iH = 1.6 * fs; // the interpreter row
		// The questions on the two rows the title left (a blank row between),
		// the card under them; its rows fit to the board, and a short board
		// lifts the whole column a little further.
		const top0 = y0 + 3.75 * step;
		const limit = h - Math.max(24, 0.06 * h);
		const rMin = hh + 5;
		const rMax = Math.max(rMin, 1.05 * P);
		const rowP = Math.min(rMax, Math.max(rMin, (limit - top0 - iH) / 10.5));
		const U = Math.max(0, Math.min(top0 + iH + 10.5 * rowP - limit, top0 - 2 * step - fs));
		const cardTop = top0 - U;
		const cardH = iH + 10.5 * rowP;
		const colX = (k) => cardX + (1.5 + k + 0.5) * P;
		const rowY = (r) => cardTop + iH + (r + 0.5) * rowP;
		G = {
			w,
			h,
			fs,
			step,
			cell,
			x0,
			y0,
			ps,
			pMid,
			iMid,
			iInkW,
			iInkH,
			hw,
			hh,
			sw,
			P,
			cardX,
			cardW,
			cardTop,
			cardH,
			iH,
			rowP,
			cut: Math.round(0.034 * cardW),
			lift: 2 * step + U,
			yQ1: y0 + 2 * step - U,
			yQ2: y0 + 3 * step - U,
			yI: cardTop + iH / 2 + iMid, // the interpreter's baseline
			yS: cardTop + iH + 5 * rowP, // the spice's row: the field's middle
			colX,
			rowY,
			dw: sw + 6, // the die: a little larger than a hole
			dh: hh + 6,
			stemTop: cardTop - Math.max(10, 0.75 * rowP)
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

	// ── Live: what the hand did, remembered as it changes ────────────────────
	// The digits: each column's digit, when it was cut, and the one Backspace
	// closed and when.
	const mem = Array.from({ length: 8 }, () => ({ d: null, at: -99, prev: null, prevAt: -99 }));
	// The die: pressed when and from where; let go (or stepped) when, from
	// where, to which column; the punch landing, the punched column and when,
	// and the column it closed.
	const fresh = () => ({
		held: 0,
		pressAt: -99,
		pressFrom: 1,
		last: 1,
		from: 1,
		to: 1,
		at: -99,
		dur: SNAP,
		pend: null,
		punch: null,
		punchAt: -99,
		prev: null,
		prevAt: -99
	});
	let sp = fresh();
	let lastT = 0;
	function resetLive() {
		for (const m of mem) Object.assign(m, { d: null, at: -99, prev: null, prevAt: -99 });
		sp = fresh();
	}

	// A digit column's state: { d, at, prev, prevAt }.
	function digit(i, t, hand) {
		const ch = hand.typed[i];
		const d = ch === undefined ? null : Number(ch);
		if (!live)
			return { d: d !== null && t >= KEYT[i] ? d : null, at: KEYT[i], prev: null, prevAt: -99 };
		const m = mem[i];
		if (d !== m.d) {
			if (m.d !== null) {
				m.prev = m.d;
				m.prevAt = hand.secs;
			}
			m.d = d;
			if (d !== null) m.at = hand.secs;
		}
		return m;
	}

	// The die's place (a value 1…10, fractional while dragged) and the
	// punch, from the hand.
	const settled = (secs) => lerp(sp.from, sp.to, easeOut(span(secs - sp.at, 0, sp.dur)));
	function die(t, hand) {
		const held = hand.held > 0;
		if (!live) {
			let x = 1;
			if (held) x = hand.value;
			else if (t >= RELEASE) x = lerp(V_REL, Math.round(V_REL), easeOut(span(t, RELEASE, PUNCH_S)));
			const punched = t >= PUNCH_S;
			return {
				x,
				held,
				punch: punched ? Math.round(V_REL) : null,
				punchAt: PUNCH_S,
				prev: null,
				prevAt: -99
			};
		}
		const secs = hand.secs;
		const v = hand.value;
		let x;
		if (held) {
			if (!sp.held) {
				sp.held = 1;
				sp.pressAt = secs;
				sp.pressFrom = settled(secs);
				sp.pend = null;
			}
			x = lerp(sp.pressFrom, v, easeOut(span(secs - sp.pressAt, 0, 0.1)));
			sp.last = x;
		} else {
			const n = Math.round(v);
			if (sp.held) {
				// Let go: snap to the nearest column, and punch there.
				sp.held = 0;
				Object.assign(sp, { from: sp.last, to: n, at: secs, dur: SNAP });
				sp.pend = { v: n, at: secs + SNAP };
			} else if (n !== sp.to) {
				// A key: one column, or straight to a number, punched at once.
				Object.assign(sp, { from: settled(secs), to: n, at: secs, dur: STEP });
				sp.pend = { v: n, at: secs + STEP };
			}
			x = settled(secs);
		}
		// Enter with nothing punched yet punches where the die stands.
		if (hand.enter2 > 0 && !held && !sp.pend && sp.punch !== Math.round(v))
			sp.pend = { v: Math.round(v), at: secs };
		if (sp.pend && secs >= sp.pend.at) {
			if (sp.punch !== sp.pend.v) {
				if (sp.punch !== null) {
					sp.prev = sp.punch;
					sp.prevAt = sp.pend.at;
				}
				sp.punch = sp.pend.v;
				sp.punchAt = sp.pend.at;
			}
			sp.pend = null;
		}
		return { x, held, punch: sp.punch, punchAt: sp.punchAt, prev: sp.prev, prevAt: sp.prevAt };
	}

	// ── The pointer on the die ───────────────────────────────────────────────
	let S = null; // this frame's spice field and die, on screen
	// A press takes the die on the field (its ten columns, the card's full
	// height) or on the die itself, its stem too.
	const takes = (X, Y) =>
		(X >= S.c1 - S.P / 2 && X <= S.c10 + S.P / 2 && Y >= S.top && Y <= S.bottom) ||
		(Math.abs(X - S.dx) <= S.dw / 2 + 6 && Y >= S.stemTop - 8 && Y <= S.dy + S.dh / 2 + 6);
	const hit = (X, Y, phase) => {
		if (!S || (phase === 'down' && !takes(X, Y))) return null;
		return 1 + (X - S.c1) / S.P;
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
	// A question typed at the margin by the table K from t0, and its caret.
	function ask(ctx, g, str, Ktab, t0, t, y, alpha, caret, secs) {
		const n = t >= t0 ? typedBy(Ktab, t - t0) : 0;
		text(ctx, str.slice(0, n), g.x0, y, g.fs, 0.92 * alpha);
		if (caret) {
			const last = n > 0 ? t0 + Ktab[n - 1] : -9;
			if (blinkOn(secs, t - last < 0.16 && n < str.length)) {
				ctx.save();
				ctx.font = TECHF(g.fs);
				const xw = ctx.measureText(str.slice(0, n)).width;
				ctx.restore();
				block(ctx, g, g.x0 + xw, y, alpha);
			}
		}
	}
	// A hairline rectangle on the pixel grid.
	function frame(ctx, cx, cy, W, H, alpha, color = PAL.chalk) {
		if (alpha <= 0.004) return;
		const x = Math.round(cx - W / 2);
		const y = Math.round(cy - H / 2);
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.strokeRect(x + 0.5, y + 0.5, Math.round(W) - 1, Math.round(H) - 1);
		ctx.restore();
	}
	// A hole: ground, its edge (chalk, or the gold rim once read), the read's
	// gold fill and its small glow.
	function hole(ctx, g, cx, cy, W, o) {
		const H = g.hh;
		const x = Math.round(cx - W / 2);
		const y = Math.round(cy - H / 2);
		ctx.save();
		if (o.ground > 0.004) {
			ctx.globalAlpha = o.ground;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(x, y, W, H);
		}
		if (o.fill > 0.004) {
			ctx.globalAlpha = o.fill;
			ctx.fillStyle = PAL.gold;
			ctx.fillRect(x, y, W, H);
		}
		ctx.restore();
		frame(ctx, cx, cy, W, H, o.edge);
		frame(ctx, cx, cy, W, H, o.rim, PAL.gold);
		if (o.glow > 0.004) glow(ctx, cx, cy, H, GOLD, o.glow);
	}
	// A chad: a scrap the size of the hole, dropping half a row and fading.
	function chad(ctx, g, cx, cy, W, age, alpha) {
		if (age < 0 || age >= CHAD || alpha <= 0.004) return;
		const u = age / CHAD;
		const y = cy + 0.5 * g.rowP * u * u;
		ctx.save();
		ctx.globalAlpha = alpha * 0.4 * (1 - u);
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(Math.round(cx - W / 2), Math.round(y - g.hh / 2), W, g.hh);
		ctx.restore();
	}
	// The light through a hole in card column k: the read's flash (`fill`,
	// 0…1) and the rim it leaves (`rim`, 0…1). The date's holes are read at
	// e1 and again at e2, the spice's at e2.
	function light(t, k, isDate) {
		let fill = 0;
		let rim = 0;
		if (isDate && t >= E1) {
			const tl = E1 + 0.05 * k;
			const on = smooth(span(t, tl, tl + 0.06));
			fill = Math.max(fill, on * (1 - smooth(span(t, tl + 0.1, Math.max(tl + 0.4, B.settle1)))));
			rim = Math.max(rim, on);
		}
		if (t >= E2) {
			const tl = E2 + 0.05 * k;
			const on = smooth(span(t, tl, tl + 0.06));
			fill = Math.max(fill, on * (1 - smooth(span(t, tl + 0.1, tl + 0.8))));
			rim = Math.max(rim, on);
		}
		return { fill, rim };
	}
	// A cut hole's look at t: `vis` its column printed, `cA` the card there,
	// `oA` the holes there, `closing` 0…1 its print coming back.
	function holeLook(t, k, isDate, vis, cA, oA, closing = 0) {
		const { fill, rim } = light(t, k, isDate);
		const k1 = 1 - cA; // the card gone: the hole is a dim gold point
		const open = vis * (1 - closing);
		return {
			ground: open * cA,
			fill: open * oA * Math.max(0.55 * fill, 0.3 * k1),
			edge: open * cA * 0.6 * (1 - rim),
			rim: open * oA * rim * lerp(0.7, 0.5, k1),
			glow: open * oA * 0.15 * fill
		};
	}

	// The card's outline, from the foot of the cut, clockwise.
	function cardPath(g) {
		const x = Math.round(g.cardX) + 0.5;
		const y = Math.round(g.cardTop) + 0.5;
		const W = Math.round(g.cardW);
		const H = Math.round(g.cardH);
		const c = g.cut;
		const r = 3;
		const pts = [
			[x, y + c],
			[x + c, y]
		];
		const arc = (cx, cy, a0) => {
			for (let k = 0; k <= 4; k++) {
				const a = a0 + (k / 4) * (Math.PI / 2);
				pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
			}
		};
		arc(x + W - r, y + r, -Math.PI / 2);
		arc(x + W - r, y + H - r, 0);
		arc(x + r, y + H - r, Math.PI / 2);
		pts.push([x, y + c]);
		return pts;
	}

	function card(ctx, g, t, hand, cA, oA) {
		if (t < B.card[0]) return;
		const secs = hand.secs;
		// The card: written in one stroke, a breath of chalk over it.
		const drawn = smooth(span(t, ...B.card));
		const pts = cardPath(g);
		const fa = 0.025 * drawn * cA;
		if (fa > 0.001) {
			ctx.save();
			ctx.globalAlpha = fa;
			ctx.fillStyle = PAL.chalk;
			ctx.beginPath();
			ctx.moveTo(pts[0][0], pts[0][1]);
			for (const p of pts) ctx.lineTo(p[0], p[1]);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		stroke(ctx, pts, { width: 1.2, alpha: 0.3 * cA, upto: drawn });

		// ── The date: printed, cut, interpreted ──────────────────────────────
		const typed = hand.typed;
		const bad = badGroups(typed);
		ctx.save();
		ctx.font = TECHF(g.ps);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = PAL.chalk;
		const states = [];
		for (let i = 0; i < 8; i++) {
			const k = DATE_COL[i];
			const cx = g.colX(k);
			const s0 = B.print1 + 0.055 * i;
			const st = digit(i, t, hand);
			states.push(st);
			const back = st.prev !== null && st.prev !== st.d ? span(secs - st.prevAt, 0, BACK) : 1;
			for (let r = 0; r < 10; r++) {
				const pr = smooth(span(t, s0 + 0.012 * r, s0 + 0.012 * r + 0.1));
				if (pr <= 0 || r === st.d) continue;
				const a = 0.16 * pr * cA * (r === st.prev && st.prev !== st.d ? smooth(back) : 1);
				if (a <= 0.004) continue;
				ctx.globalAlpha = a;
				ctx.fillText(String(r), cx, g.rowY(r) + g.pMid);
			}
		}
		ctx.restore();
		for (let i = 0; i < 8; i++) {
			const k = DATE_COL[i];
			const cx = g.colX(k);
			const st = states[i];
			const vis = smooth(span(t, B.print1 + 0.055 * i, B.print1 + 0.055 * i + 0.2));
			if (st.prev !== null && st.prev !== st.d && secs - st.prevAt < BACK)
				hole(
					ctx,
					g,
					cx,
					g.rowY(st.prev),
					g.hw,
					holeLook(t, k, true, vis, cA, oA, smooth(span(secs - st.prevAt, 0, BACK)))
				);
			if (st.d === null) continue;
			const cy = g.rowY(st.d);
			hole(ctx, g, cx, cy, g.hw, holeLook(t, k, true, vis, cA, oA));
			chad(ctx, g, cx, cy, g.hw, secs - st.at, vis * cA);
		}
		// The interpreter row: the digits typed, over their columns; a group
		// that cannot be in rose.
		for (let i = 0; i < 8; i++) {
			const st = states[i];
			const cx = g.colX(DATE_COL[i]);
			const color = bad[GROUP_OF[i]] ? PAL.rose : PAL.chalk;
			if (st.d !== null)
				text(
					ctx,
					String(st.d),
					cx,
					g.yI,
					g.fs,
					0.92 * drawn * cA * smooth(span(secs - st.at, 0, 0.06)),
					color,
					'center'
				);
			if (st.prev !== null && st.prev !== st.d && secs - st.prevAt < BACK)
				text(
					ctx,
					String(st.prev),
					cx,
					g.yI,
					g.fs,
					0.92 * drawn * cA * (1 - smooth(span(secs - st.prevAt, 0, BACK))),
					color,
					'center'
				);
		}
		// The caret: a hairline frame round the next column, blinking on the
		// clock and steady after a key; with eight in, round the whole field,
		// waiting for Enter.
		if (hand.caret > 0 && hand.enter1 <= 0 && t >= B.caret) {
			const on = blinkOn(secs, hand.steady > 0);
			const a = (on ? 0.5 : 0.1) * cA;
			const cy = (g.rowY(0) + g.rowY(9)) / 2;
			const H = 10 * g.rowP - 2;
			if (typed.length < 8) frame(ctx, g.colX(DATE_COL[typed.length]), cy, 0.84 * g.P, H, a);
			else {
				const xa = g.colX(0) - 0.42 * g.P;
				const xb = g.colX(9) + 0.42 * g.P;
				frame(ctx, (xa + xb) / 2, cy, xb - xa, H, a);
			}
		}
	}

	function spice(ctx, g, t, hand, cA, oA) {
		S = null;
		if (t < B.print2) return;
		const secs = hand.secs;
		const D = die(t, hand);
		const dx = g.colX(SPICE_COL(1)) + (D.x - 1) * g.P;
		// The field: ten numbers on its middle row, printed left to right; the
		// one under the die brightening while it is held.
		ctx.save();
		ctx.font = TECHF(g.ps);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = PAL.chalk;
		for (let v = 1; v <= 10; v++) {
			const pr = smooth(span(t, B.print2 + 0.035 * (v - 1), B.print2 + 0.035 * (v - 1) + 0.15));
			if (pr <= 0) continue;
			const punched = D.punch === v;
			if (punched) continue;
			const back = D.prev === v ? smooth(span(secs - D.prevAt, 0, BACK)) : 1;
			const near = smooth(clamp01(1 - Math.abs(D.x - v)));
			const bright = lerp(0.16, D.held ? 0.85 : 0.34, near);
			ctx.globalAlpha = bright * pr * cA * back;
			ctx.fillText(String(v), g.colX(SPICE_COL(v)), g.yS + g.pMid);
		}
		ctx.restore();
		for (let v = 1; v <= 10; v++) {
			const k = SPICE_COL(v);
			const vis = smooth(span(t, B.print2 + 0.035 * (v - 1), B.print2 + 0.035 * (v - 1) + 0.15));
			if (D.prev === v && D.punch !== v && secs - D.prevAt < BACK)
				hole(
					ctx,
					g,
					g.colX(k),
					g.yS,
					g.sw,
					holeLook(t, k, false, vis, cA, oA, smooth(span(secs - D.prevAt, 0, BACK)))
				);
			if (D.punch !== v) continue;
			hole(ctx, g, g.colX(k), g.yS, g.sw, holeLook(t, k, false, vis, cA, oA));
			chad(ctx, g, g.colX(k), g.yS, g.sw, secs - D.punchAt, vis * cA);
		}
		// The punched number, up in the interpreter row over its column.
		const iA = 0.92 * cA;
		if (D.punch !== null)
			text(
				ctx,
				String(D.punch),
				g.colX(SPICE_COL(D.punch)),
				g.yI,
				g.fs,
				iA * smooth(span(secs - D.punchAt, 0, 0.06)),
				PAL.chalk,
				'center'
			);
		if (D.prev !== null && D.prev !== D.punch && secs - D.prevAt < BACK)
			text(
				ctx,
				String(D.prev),
				g.colX(SPICE_COL(D.prev)),
				g.yI,
				g.fs,
				iA * (1 - smooth(span(secs - D.prevAt, 0, BACK))),
				PAL.chalk,
				'center'
			);

		// The die: a hairline frame a little larger than a hole, its stem up
		// through the card and out over its top edge (broken round a number
		// printed in the interpreter row under it).
		const dA = smooth(span(t, B.die[0], B.die[0] + 0.2)) * cA;
		if (dA <= 0.004) return;
		const la = (D.held ? 0.75 : 0.5) * dA;
		frame(ctx, dx, g.yS, g.dw, g.dh, la);
		const sx = Math.round(dx) + 0.5;
		const y1 = Math.round(g.yS - g.dh / 2);
		const up = smooth(span(t, B.die[0] + 0.1, B.die[1]));
		const yTop = lerp(y1, g.stemTop, up);
		const segs = [[y1, yTop]];
		const p = D.punch;
		if (p !== null && Math.abs(dx - g.colX(SPICE_COL(p))) < (p === 10 ? 1.2 : 0.62) * g.iInkW + 3) {
			const gb = g.yI + 4;
			const gt = g.yI - g.iInkH - 4;
			if (yTop < gt) segs.splice(0, 1, [y1, gb], [gt, yTop]);
		}
		for (const [a, b] of segs)
			if (a > b)
				stroke(
					ctx,
					[
						[sx, a],
						[sx, b]
					],
					{ width: 1, alpha: la, cap: 'butt' }
				);
		// A small foot of the handle, over the card.
		if (up >= 1)
			stroke(
				ctx,
				[
					[sx - 3, g.stemTop],
					[sx + 3, g.stemTop]
				],
				{ width: 1, alpha: la, cap: 'butt' }
			);

		if (hand.asking === 'spice' || !live)
			S = {
				P: g.P,
				c1: g.colX(SPICE_COL(1)),
				c10: g.colX(SPICE_COL(10)),
				top: g.cardTop,
				bottom: g.cardTop + g.cardH,
				dx,
				dy: g.yS,
				dw: g.dw,
				dh: g.dh,
				stemTop: g.stemTop
			};
		if (dA < 0.5) S = null;
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = geom(ctx, w, h);
			if (live && t < lastT - 0.5) resetLive();
			lastT = t;
			const cA = 1 - smooth(span(t, ...B.close));
			const oA = 1 - smooth(span(t, ...B.out));
			const secs = hand.secs;

			// The title: typed, then held at its stop — lifted and stepped back.
			if (t < FREEZE) TERM.draw(ctx, w, h, t / 10, t, t - 10);
			else {
				const u = span(t, ...B.lift);
				const a = cA * lerp(1, 0.5, smooth(u));
				if (a > 0.004) {
					ctx.save();
					ctx.globalAlpha = a;
					ctx.drawImage(frozenFrame(w, h), 0, -g.lift * easeIO(u), w, h);
					ctx.restore();
				}
			}

			// The questions, at the title's margin.
			if (t >= Q1 && cA > 0.004) {
				const qa = cA * lerp(1, 0.35 / 0.92, smooth(span(t, ...B.qdim)));
				const caret1 = t < B.caret && hand.typed.length === 0 && hand.enter1 <= 0;
				ask(ctx, g, Q1_TEXT, K1, Q1, t, g.yQ1, qa, caret1, secs);
			}
			if (t >= Q2 && cA > 0.004) {
				const caret2 = t < W2 && hand.enter2 <= 0 && !hand.held;
				ask(ctx, g, Q2_TEXT, K2, Q2, t, g.yQ2, cA, caret2, secs);
			}

			// The card, and this frame's die for the pointer.
			card(ctx, g, t, hand, cA, oA);
			spice(ctx, g, t, hand, cA, oA);
			answers.slider(hit);

			// The hand over the die.
			if (live) {
				let c = '';
				if (S && hand.asking === 'spice') {
					if (hand.held) c = 'grabbing';
					else if (hover && takes(hover[0], hover[1])) c = 'grab';
				}
				setCursor(c);
				// For a scripted hand checking the die (the lab copies info
				// once, so this is written onto it each frame).
				if (window.__lab) window.__lab.punch = { die: S, value: hand.value, held: hand.held, t };
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
