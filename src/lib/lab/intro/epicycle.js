// ── log-intro · epicycle — the date as one closed curve, a chain of circles ─
// The terminal types the card (log-dawn's, no command), every line CENTRED
// where it stays, and FREEZES at its full stop — never zoomed, never moved.
// Its lines fade out, top first, and are gone before the first question; only
// then does the stop, left alone, glide to (0.5w, 0.37h). It stays a full
// chalk dot: the pivot of everything after.
//
// "when were you born?" is typed under it in the terminal's face, with the
// field dd.mm.yyyy under that, the mask dim and the terminal's block caret
// in the next cell. EACH DIGIT IS AN ARM: arm k (in typed order) is a chalk
// line hung from the tip of arm k−1 (the first from the stop), a faint
// circle round its root, its weight the digit times a falling share
//   w_k = d_k · a_k,  a = .40 .22 .14 .09 .06 .04 .03 .02,
// so the day shapes the figure and the year embroiders it, and its length
// r_k = R w_k / Σw, so the figure keeps one size and a digit changes its
// SHAPE. Arm k turns at f_k = 1 + n s_k, s = 0 1 −1 2 −2 3 −3 4, n the spice
// (1 until it is asked), so the arms stand at f_k θ and a dim-gold pen sits
// at the last tip; the curve z(φ) = Σ r_k e^{i f_k φ} over one turn is drawn
// whole every frame, so each digit typed reshapes it (a new arm grows over
// 0.3 s, a Backspace shrinks it away over 0.2 s; a 0 is an arm of no
// length). A group that cannot be — a day past 31 or past its month, a month
// past 12, a year off 1900–2099, already from its first digit — is rose.
// At n = 1 the curve is the date's own loop, with no symmetry. Enter: a gold
// trace runs the curve once from φ = 0, fading back to chalk behind it.
//
// "how spicy?": a straight slider of ten stops under it, a narrow block
// handle, the number at its right. Every f_k ≡ 1 (mod n), so at a whole stop
// the curve has n-fold symmetry — 7 a seven-lobed rosette — and between
// stops the frequencies are not whole and the curve drawn over one turn does
// not close: its end misses its start by a gap that shrinks to nothing at a
// stop. So the snap on release is seen as the curve CLOSING. Drag the handle
// (a press anywhere on the track takes it), or ← →, a digit (0 is 10).
// Enter: the gold trace runs the rosette once; the arms fold home into the
// stop, the last first (the curve stays as their full lengths drew it), and
// the stop is left a dim gold point. A hold, a fade, round.
//
// Beats (seconds; 21 s; at = t / 21):
//    0    – 5.14  the terminal types the card; frozen at its stop + 0.2
//    5.4  – 6.4   the lines fade out where they are, top first
//    6.2  – 6.8   the stop, alone, glides to (0.5w, 0.37h)
//    6.8          "when were you born?" (q1, at 0.324); the field
//    7.6          the wait (wait1, at 0.362); scripted digits from here
//    9.8          Enter (e1, at 0.467); the gold trace 9.8 – 11.0
//   11.6          "how spicy?" (q2, at 0.552); the slider by 12.4
//   12.4          the wait (wait2, at 0.590); the scripted drag 12.7 – 14.0
//   14.4          Enter (e2, at 0.686); the gold trace 14.4 – 15.6
//   15.6 – 16.6   the arms fold home, the last first; the stop goes dim gold
//   19   – 21     fade; round
//
// Every frame is a pure function of t and the hand. The only caches are of
// inputs: the scripted digits' arrival times (read off the demo's hand once,
// at load) and, live, when each digit arrived or was taken back (hand.secs),
// so an arm grows from its own moment. Live, the arms turn on hand.secs
// rather than t (the clock is HELD at each question while a person answers;
// on t the arms would stand still while they type and jump at Enter); the
// pen is on φ = θ mod 2π, so it always rides the curve that is drawn.

import { PAL, TECH_FONT, TAU, stroke, disc, span, smooth, lerp, clamp01 } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';
import { script } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
const FREEZE = TERM.stop + 0.2; // the frame the title is held at (≈ 5.14)
const Q1 = 6.8;
const W1 = 7.6;
const E1 = 9.8;
const Q2 = 11.6;
const W2 = 12.4;
const E2 = 14.4;

const B = {
	pan: [6.2, 6.8], // the stop, alone, to the pivot
	gone: 5.4, // line i fades out over [5.4 + 0.25 i, 5.9 + 0.25 i]
	field: [Q1 + 0.25, Q1 + 0.7],
	trace: 1.2, // a gold trace's run, s
	slider: [Q2 + 0.35, Q2 + 0.8],
	fold: 15.6, // arm k folds over [15.6 + 0.08 (8 − k), + 0.44]
	gold: [16.15, 16.8], // the stop turns dim gold
	out: [19, 21]
};

export const meta = {
	title:
		'epicycle — the date drawn as one closed curve by a chain of circles hung from the full stop; the spice its symmetry',
	order: 15,
	seconds: 21,
	beats: { q1: 6.8, wait1: 7.6, e1: 9.8, q2: 11.6, wait2: 12.4, e2: 14.4 }
};

// ── The arms ─────────────────────────────────────────────────────────────────
const SHARE = [0.4, 0.22, 0.14, 0.09, 0.06, 0.04, 0.03, 0.02];
const SPIN = [0, 1, -1, 2, -2, 3, -3, 4];

// ── For the flows: the entry as a beat of a longer run ───────────────────────
// A flow can open on this intro as it is — make({ board, answers, live, keep })
// with its answers made on EPICYCLE.beats, render(ctx, w, h, t, hand) until
// it takes over — and `keep: true` leaves the figure up: no fold, no fade, the
// arms still turning, the stop chalk. rosette(digits, spice) is the figure the
// answers make, at unit size: r the arms' lengths (summing to 1), f their
// frequencies, at(φ) the curve's point [x, y] (y up) at φ ∈ [0, 2π) — the
// date's own closed curve, with n-fold symmetry at a whole spice n.
export const EPICYCLE = {
	beats: { q1: 6.8, wait1: 7.6, e1: 9.8, q2: 11.6, wait2: 12.4, e2: 14.4 },
	freeze: 5.14, // the title held at its stop (TERM.stop + 0.2)
	pivot: [0.5, 0.37], // the stop's place on the board, as fractions of w, h, from 6.8 s
	radius: (w, h) => Math.min(0.22 * h, 0.46 * w), // the figure's R
	share: SHARE,
	spin: SPIN,
	period: 12 // the arms turn once in 12 s (θ = 2π t / 12)
};
export function rosette(digits, spice) {
	const d = String(digits).padEnd(8, '0').slice(0, 8).split('').map(Number);
	const wk = d.map((x, k) => (Number.isFinite(x) ? x : 0) * SHARE[k]);
	const sum = wk.reduce((a, b) => a + b, 0);
	const r = sum > 0 ? wk.map((x) => x / sum) : [1, 0, 0, 0, 0, 0, 0, 0];
	const f = SPIN.map((sp) => 1 + spice * sp);
	const at = (ph) => {
		let x = 0;
		let y = 0;
		for (let k = 0; k < 8; k++) {
			x += r[k] * Math.cos(f[k] * ph);
			y += r[k] * Math.sin(f[k] * ph);
		}
		return [x, y];
	};
	return { r, f, at };
}
const GROW = 0.3;
const SHRINK = 0.2;
const PERIOD = 12; // θ = 2π t / 12

// The scripted hand's digits: when each lands (the controller passes only
// how many are typed), read off the demo's own script once.
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

// ── The questions: typed at the title's pace (dial.js's table) ──────────────
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
// dial.js's keys(), its lead cut from 0.12 to 0.06 s so the question is
// whole before the run waits at 7.6 (0.8 s after it is asked).
function keys(text, seed, lead = 0.06) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = lead;
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

// The field: ten cells, the eight digits' and the two separators'.
const MASK = 'dd.mm.yyyy';
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
const GROUP_OF = [0, 0, 1, 1, 2, 2, 2, 2];

// The terminal's caret: blinks 2.3 a second, on 58% of each.
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const mix = (a, b, t) => a.map((x, i) => Math.round(lerp(x, b[i], t)));
const CHALK = [236, 230, 218];
const GOLD = [245, 193, 80];

// ── Which groups cannot be ───────────────────────────────────────────────────
// A group is rose when NO completion of what is typed of it makes a date:
// a day 01–31 and within its month (once the month is in; February's 29th
// only in a leap year, once the year is in), a month 01–12, a year
// 1900–2099. So a 4 as a day's first digit is rose at once.
const pad = (x, n) => String(x).padStart(n, '0');
const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysIn = (m, y) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
function canBe(part, lo, hi, n) {
	for (let x = lo; x <= hi; x++) if (pad(x, n).startsWith(part)) return true;
	return false;
}
function badGroups(typed) {
	const D = typed.slice(0, 2);
	const M = typed.slice(2, 4);
	const Y = typed.slice(4, 8);
	const yearOk = Y.length === 4 && canBe(Y, 1900, 2099, 4);
	const monthOk = M.length === 2 && canBe(M, 1, 12, 2);
	const maxDay = monthOk ? daysIn(Number(M), yearOk ? Number(Y) : 2000) : 31;
	return [
		D.length > 0 && !canBe(D, 1, maxDay, 2),
		M.length > 0 && !canBe(M, 1, 12, 2),
		Y.length > 0 && !canBe(Y, 1900, 2099, 4)
	];
}

export async function make({ board, answers, live, keep = false }) {
	await document.fonts.load(TECHF(24)).catch(() => null);

	// ── Layout, cached per board size ────────────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		// The questions and the field in the terminal's face and size (not
		// under 11 px, on a phone).
		const fq = Math.max(11, L.fs);
		ctx.save();
		ctx.font = TECHF(fq);
		const cell = ctx.measureText('0').width;
		const wQ1 = ctx.measureText(Q1_TEXT).width;
		const wQ2 = ctx.measureText(Q2_TEXT).width;
		ctx.restore();
		const cx = 0.5 * w;
		const cy = 0.37 * h;
		const yQ1 = 0.72 * h;
		const yF = yQ1 + 1.75 * fq;
		const yQ2 = yF + 2.1 * fq;
		const ty = yQ2 + 1.6 * fq; // the slider's track
		const sp = Math.max(2.3 * cell, Math.min(0.065 * w, 30)); // a stop's pitch
		G = {
			w,
			h,
			L,
			stop: L.stop,
			fq,
			cell,
			cx,
			cy,
			R: Math.min(0.22 * h, 0.46 * w),
			yQ1,
			xQ1: cx - wQ1 / 2,
			yF,
			xF: cx - 5 * cell,
			yQ2,
			xQ2: cx - wQ2 / 2,
			ty,
			sp,
			x1: cx - 4.5 * sp,
			x10: cx + 4.5 * sp
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

	// ── Live: when each digit came and went (hand.secs) ──────────────────────
	const blank = () => ({ d: null, at: -99, old: null, gone: -99, g0: 0 });
	let slots = Array.from({ length: 8 }, blank);
	const grownAt = (s, secs) => smooth(span(secs - s.at, 0, GROW));
	function remember(hand, t) {
		if (t < Q1 - 0.05) {
			slots = Array.from({ length: 8 }, blank);
			return;
		}
		const secs = hand.secs;
		for (let i = 0; i < 8; i++) {
			const ch = hand.typed[i];
			const d = ch === undefined ? null : Number(ch);
			const s = slots[i];
			if (d === s.d) continue;
			if (s.d !== null) {
				s.old = s.d;
				s.g0 = grownAt(s, secs);
				s.gone = secs;
			}
			if (d !== null) {
				s.at = secs;
				s.old = null;
			}
			s.d = d;
		}
	}
	// The arms at this frame: each one's digit and how grown it is.
	function arms(t, hand) {
		const out = [];
		for (let i = 0; i < 8; i++) {
			if (!live) {
				const ch = hand.typed[i];
				out.push(
					ch === undefined
						? { d: 0, g: 0 }
						: { d: Number(ch), g: smooth(span(t - KEYT[i], 0, GROW)) }
				);
				continue;
			}
			const s = slots[i];
			if (s.d !== null) out.push({ d: s.d, g: grownAt(s, hand.secs) });
			else if (s.old !== null)
				out.push({ d: s.old, g: s.g0 * (1 - smooth(span(hand.secs - s.gone, 0, SHRINK))) });
			else out.push({ d: 0, g: 0 });
		}
		return out;
	}
	// The lengths: r_k = R w_k / Σw over the grown weights, the whole scaled
	// by the most grown of them, so the first arm grows out of the stop and
	// the last one shrinks back into it while the others keep one size.
	function lengths(A, R) {
		let sum = 0;
		let most = 0;
		A.forEach((a, k) => {
			const wk = a.d * SHARE[k];
			sum += wk * a.g;
			if (wk > 0) most = Math.max(most, a.g);
		});
		if (sum <= 1e-9) return null;
		return A.map((a, k) => (R * most * a.d * SHARE[k] * a.g) / sum);
	}

	// The curve over one turn: z(φ) = Σ r_k e^{i f_k φ}, screen y down.
	function curve(X, Y, r, f) {
		let fm = 1;
		for (let k = 0; k < 8; k++) if (r[k] > 0) fm = Math.max(fm, Math.abs(f[k]));
		const N = Math.max(1500, Math.ceil(80 * fm));
		const on = [];
		for (let k = 0; k < 8; k++) if (r[k] > 1e-6) on.push(k);
		const pts = new Array(N + 1);
		for (let i = 0; i <= N; i++) {
			const ph = (TAU * i) / N;
			let x = X;
			let y = Y;
			for (const k of on) {
				const a = f[k] * ph;
				x += r[k] * Math.cos(a);
				y -= r[k] * Math.sin(a);
			}
			pts[i] = [x, y];
		}
		return pts;
	}

	// A gold trace along the curve from φ = 0, its head at the end of `dur`
	// from t0, each stretch fading back to chalk after the head has passed.
	function trace(ctx, pts, t, t0, out) {
		if (t < t0 || t > t0 + B.trace + 1.4) return;
		const N = pts.length - 1;
		const x = (t - t0) / B.trace;
		const head = Math.min(N, Math.floor(N * clamp01(x)));
		const per = Math.max(2, Math.ceil(N / 120));
		for (let i0 = 0; i0 < head; i0 += per) {
			const i1 = Math.min(head, i0 + per);
			const tp = t0 + (B.trace * (i0 + i1)) / 2 / N;
			const a = 0.85 * Math.exp(-Math.max(0, t - tp) / 0.25);
			if (a < 0.01) continue;
			stroke(ctx, pts.slice(i0, i1 + 1), {
				color: PAL.gold,
				width: 1.4,
				alpha: a * out,
				cap: 'butt'
			});
		}
		if (x > 0 && x < 1)
			disc(ctx, pts[head][0], pts[head][1], 2, { fill: PAL.gold, alpha: 0.9 * out });
	}

	// ── The pointer on the slider ────────────────────────────────────────────
	let SL = null; // this frame's slider, on screen
	const valueAt = (X) => Math.max(1, Math.min(10, 1 + (9 * (X - SL.x1)) / (SL.x10 - SL.x1)));
	const onSlider = (X, Y) =>
		SL &&
		SL.a > 0.3 &&
		X >= SL.x1 - SL.sp / 2 &&
		X <= SL.x10 + SL.sp / 2 &&
		Math.abs(Y - SL.ty) <= 18;
	const hit = (X, Y, phase) => {
		if (!SL) return null;
		if (phase === 'down' && !onSlider(X, Y)) return null;
		return valueAt(X);
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
		ctx.fillRect(x, y - 0.78 * g.fq, g.cell, 0.92 * g.fq);
		ctx.restore();
	}
	// A question typed by the table K from t0, with the block caret at its
	// head while it types.
	function ask(ctx, g, str, K, t0, t, x, y, alpha) {
		if (t < t0) return;
		const n = typedBy(K, t - t0);
		text(ctx, str.slice(0, n), x, y, g.fq, 0.9 * alpha);
		if (n < str.length) {
			ctx.save();
			ctx.font = TECHF(g.fq);
			const xw = ctx.measureText(str.slice(0, n)).width;
			ctx.restore();
			const last = n > 0 ? t0 + K[n - 1] : t0;
			if (blinkOn(t, t - last < 0.16)) block(ctx, g, x + xw, y, alpha);
		}
	}

	// The title, frozen where it was typed, its lines fading out top first and
	// gone before the first question; the stop is left out of it and drawn on
	// its own, whole.
	function title(ctx, g, t) {
		const { L, stop, w, h } = g;
		const img = frozenFrame(w, h);
		const ys = L.out.map((ln) => ln.y - 0.3 * L.fs);
		const cut = [-1e4, (ys[0] + ys[1]) / 2, (ys[1] + ys[2]) / 2, 1e4];
		for (let i = 0; i < 3; i++) {
			const a = 1 - smooth(span(t, B.gone + 0.25 * i, B.gone + 0.5 + 0.25 * i));
			if (a <= 0.004) continue;
			ctx.save();
			ctx.beginPath();
			ctx.rect(-1, cut[i], w + 2, cut[i + 1] - cut[i]);
			if (i === 2) {
				ctx.moveTo(stop.x + stop.r + 1.5, stop.y);
				ctx.arc(stop.x, stop.y, stop.r + 1.5, 0, TAU);
			}
			ctx.clip('evenodd');
			ctx.globalAlpha = a;
			ctx.drawImage(img, 0, 0, w, h);
			ctx.restore();
		}
	}

	function field(ctx, g, t, hand, out) {
		const fa = out * smooth(span(t, ...B.field));
		if (fa <= 0.004) return;
		const typed = hand.typed;
		const bad = badGroups(typed);
		const after = lerp(1, 0.8, smooth(span(t, E1 + 0.3, E1 + 1)));
		// The caret: in the next cell (or after the field once the eight are
		// in), from when the question is typed or a key has come, until Enter.
		const qDone = t >= Q1 + K1[K1.length - 1] || typed.length > 0;
		const caretOn =
			hand.caret > 0 && hand.enter1 <= 0 && qDone && blinkOn(hand.secs, hand.steady > 0);
		const cc = typed.length < 8 ? DIGIT_CELL[typed.length] : 10;
		ctx.save();
		ctx.font = TECHF(g.fq);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		for (let j = 0; j < 10; j++) {
			const x = g.xF + (j + 0.5) * g.cell;
			const i = DIGIT_CELL.indexOf(j);
			const under = caretOn && j === cc;
			if (under) {
				ctx.globalAlpha = 0.9 * fa;
				ctx.fillStyle = PAL.chalk;
				ctx.fillRect(g.xF + j * g.cell, g.yF - 0.78 * g.fq, g.cell, 0.92 * g.fq);
			}
			let ch = MASK[j];
			let a = i < 0 ? 0.32 : 0.22;
			let color = PAL.chalk;
			if (i >= 0 && typed[i] !== undefined) {
				ch = typed[i];
				a = 0.92 * after;
				if (bad[GROUP_OF[i]]) color = PAL.rose;
			}
			ctx.globalAlpha = (under ? 0.9 : a) * fa;
			ctx.fillStyle = under ? PAL.ground : color;
			ctx.fillText(ch, x, g.yF);
		}
		ctx.restore();
		if (caretOn && cc === 10) block(ctx, g, g.xF + 10 * g.cell, g.yF, fa);
	}

	function slider(ctx, g, t, hand, out) {
		const sA = smooth(span(t, ...B.slider));
		SL = null;
		if (sA <= 0.004 || out <= 0.004) return;
		const { x1, x10, ty, sp, fq, cell } = g;
		const after = lerp(1, 0.7, smooth(span(t, E2 + 0.4, E2 + 1.2)));
		const a = out * after;
		const v = hand.value;
		const near = Math.round(v);
		const held = hand.held > 0;
		// The track, written on from 1; the ten stops.
		stroke(
			ctx,
			[
				[x1, ty],
				[x10, ty]
			],
			{ width: 1, alpha: 0.38 * a, upto: sA, cap: 'butt' }
		);
		for (let k = 1; k <= 10; k++) {
			const tk = smooth(span(sA, 0.1 * (k - 1), 0.1 * (k - 1) + 0.3));
			if (tk <= 0) continue;
			const x = x1 + (k - 1) * sp;
			const here = k === near;
			const hh = (here ? 0.32 : 0.2) * fq;
			stroke(
				ctx,
				[
					[x, ty - hh],
					[x, ty + hh]
				],
				{ width: 1, alpha: tk * a * (here ? 0.6 : 0.3), cap: 'butt' }
			);
		}
		// The handle: a narrow block at the value, under the pointer while it
		// is held, at its stop when let go.
		const hx = x1 + ((v - 1) / 9) * (x10 - x1);
		const hw = Math.max(3, 0.34 * cell);
		const hh = (held ? 1.1 : 1) * fq;
		const ha = smooth(span(sA, 0.35, 0.8));
		ctx.save();
		ctx.globalAlpha = ha * a * (held ? 0.98 : 0.88);
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - hw / 2, ty - hh / 2, hw, hh);
		ctx.restore();
		// The answer, at its right.
		text(ctx, String(near), x10 + 0.9 * sp, ty + 0.36 * fq, fq, 0.92 * ha * a);
		SL = { x1, x10, ty, sp, a: out * sA };
	}

	return {
		render(ctx, w, h, t, hand) {
			answers.slider(hit);
			const g = geom(ctx, w, h);
			if (t < FREEZE) {
				SL = null;
				TERM.draw(ctx, w, h, t / 10, t, t - 10);
				if (live) setCursor('');
				return;
			}
			const out = keep ? 1 : 1 - smooth(span(t, ...B.out));
			const pan = easeIO(span(t, ...B.pan));
			const dx = pan * (g.cx - g.stop.x);
			const dy = pan * (g.cy - g.stop.y);
			const X = g.stop.x + dx;
			const Y = g.stop.y + dy;
			title(ctx, g, t);

			// The figure: the curve, the arms, the pen.
			if (live) remember(hand, t);
			const A = t >= Q1 ? arms(t, hand) : null;
			const r = A ? lengths(A, g.R) : null;
			if (r && out > 0.004) {
				let n = hand.value;
				if (Math.abs(n - Math.round(n)) < 1e-9) n = Math.round(n);
				const f = SPIN.map((s) => 1 + n * s);
				const pts = curve(X, Y, r, f);
				stroke(ctx, pts, { width: 1.1, alpha: 0.45 * out });
				trace(ctx, pts, t, E1, out);
				trace(ctx, pts, t, E2, out);
				// The arms, from the stop, at f_k φ; folding home the last first.
				const secs = live ? hand.secs : t;
				const ph = TAU * ((((secs / PERIOD) % 1) + 1) % 1);
				let x = X;
				let y = Y;
				let reach = 0;
				for (let k = 0; k < 8; k++) {
					const f0 = B.fold + 0.08 * (7 - k);
					const rk = keep ? r[k] : r[k] * (1 - smooth(span(t, f0, f0 + 0.44)));
					if (rk < 0.05) continue;
					const ang = f[k] * ph;
					const nx = x + rk * Math.cos(ang);
					const ny = y - rk * Math.sin(ang);
					ctx.save();
					ctx.globalAlpha = 0.08 * out;
					ctx.strokeStyle = PAL.chalk;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(x, y, rk, 0, TAU);
					ctx.stroke();
					ctx.restore();
					stroke(
						ctx,
						[
							[x, y],
							[nx, ny]
						],
						{ width: 1, alpha: 0.3 * out }
					);
					x = nx;
					y = ny;
					reach += rk;
				}
				if (reach > 0.5) disc(ctx, x, y, 2.1, { fill: PAL.gold, alpha: 0.62 * out });
			}

			// The stop: a full chalk dot, the pivot; at the end a dim gold point.
			const gk = keep ? 0 : smooth(span(t, ...B.gold));
			const c = mix(CHALK, GOLD, gk);
			disc(ctx, X, Y, g.stop.r, {
				fill: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
				alpha: out * lerp(0.95, 0.62, gk)
			});

			// The date: its question, then the field.
			const q1a = out * lerp(1, 0.55, smooth(span(t, E1 + 0.3, E1 + 1)));
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.xQ1, g.yQ1, q1a);
			field(ctx, g, t, hand, out);

			// The spice: its question, then the slider.
			const q2a = out * lerp(1, 0.55, smooth(span(t, E2 + 0.3, E2 + 1)));
			ask(ctx, g, Q2_TEXT, K2, Q2, t, g.xQ2, g.yQ2, q2a);
			slider(ctx, g, t, hand, out);

			if (live) {
				let cur = '';
				if (hand.asking === 'spice' && SL) {
					if (hand.held) cur = 'grabbing';
					else if (hover && onSlider(hover[0], hover[1])) cur = 'grab';
				}
				setCursor(cur);
				// For a scripted hand checking the slider (the lab copies its
				// info once, so this is written onto it each frame).
				if (window.__lab)
					window.__lab.epicycle = { slider: SL, value: hand.value, held: hand.held, t };
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
