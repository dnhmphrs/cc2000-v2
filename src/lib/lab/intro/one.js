// ── log-intro · one — one thing at a time, large ────────────────────────────
// The most minimal of the ten: almost nothing on the board but what is being
// asked. The title card is the terminal's (log-dawn makeTerminal, no command):
// typed, frozen the moment its full stop lands, held, and then its lines fade
// one after another — top line first, no zoom — leaving the FULL STOP alone
// where it fell. Then each question is alone on the board:
//
//   date   the question small and dim, typed in the terminal's mono; under it
//          the answer LARGE and centred — eight big digit cells, DD MM YYYY,
//          each an underline with its letter of the mask faint in it, the
//          digits printed whole as they are typed, the caret a big block in
//          the next empty cell (at the line's end once all eight are in).
//   spice  "how spicy?" the same; under it ONE big numeral, 1 to 10, over a
//          thin track with ten ticks and a handle. The numeral rolls to the
//          next as the handle is dragged past half a stop, so it follows the
//          hand; the ticks passed are lit a little, the one under a held
//          handle stands up.
//
// On each Enter the answer takes the gold for a beat (the confirmation), then
// COLLAPSES to a single point — the digits drawn into the field's centre as
// they shrink, the cells' rules and the track pulled in after them — and the
// point travels on a slow arc down to the full stop and joins it: a thin ring
// out of the stop, and the stop a little larger and warmer for it. The full
// stop gathers the answers; after the second it is a small gold point, which
// settles and goes out with the board.
//
// Every frame is a pure function of t and the hand: the title is the
// terminal's own frame at t until the freeze, then one cached frame of it
// (its stop cut out of the cache, so the stop can carry on as itself); the
// caret blinks on hand.secs.

import { PAL, TECH_FONT, stroke, disc, span, smooth, lerp, clamp01 } from '../log/board.js';
import { lit } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';

// The title: the flows' terminal, at their size.
const TERM = makeTerminal(0.8, { cmd: false });
const STOP = TERM.stop; // the full stop lands (≈ 4.94 s)
const FREEZE = STOP + 0.2; // the frame the title is held at
const FADE = FREEZE + 1.15; // the first line starts to go; each line 0.3 s later

// After an Enter: the gold beat, the collapse, the trip to the stop, the join.
const GOLD = [0, 0.14];
const COLLAPSE = [0.1, 0.62];
const TRAVEL = [0.6, 1.42];
const JOIN = 1.42;

const r2 = (x) => Math.round(x * 100) / 100;
const Q1 = r2(FADE + 0.3 * 2 + 0.6);
const W1 = r2(Q1 + 0.8);
const E1 = r2(W1 + 2.2);
const Q2 = r2(E1 + JOIN + 0.25);
const W2 = r2(Q2 + 0.8);
const E2 = r2(W2 + 2.1);
const SECONDS = Math.ceil(E2 + JOIN + 3.4);

export const meta = {
	title: 'one thing at a time, large — the answers gathered into the full stop',
	order: 9,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 }
};

const DATE_Q = 'when were you born?';
const SPICE_Q = 'how spicy?';
const MASK = 'ddmmyyyy';
const BLINK = 2.3; // the terminal's caret: blinks a second, and its duty
const DUTY = 0.58;

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
const CHALK = [236, 230, 218];
const GOLDC = [245, 193, 80];
const rgb = (a, b, k) => {
	const c = a.map((x, i) => Math.round(lerp(x, b[i], clamp01(k))));
	return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export async function make({ board, answers }) {
	try {
		await document.fonts.load(`400 24px ${TECH_FONT}`);
	} catch {
		// The board's fallbacks will do.
	}
	let G = null; // the layout, per board size
	let frozen = null; // the title at FREEZE, its stop cut out

	function layout(ctx, w, h) {
		if (G && G.w === w && G.h === h && G.dpr === board.dpr) return G;
		frozen = null;
		const L = TERM.layout(ctx, w, h);
		const stop = L.stop;
		ctx.save();
		// The date's size: big, and the eight cells within the board's width —
		// with room either side for the caret at the line's end, since the
		// field is centred and the caret hangs off its right.
		let fs = Math.min(0.11 * h, 96);
		ctx.font = TECH(100);
		const adv100 = ctx.measureText('0').width;
		const across = (f) => (adv100 / 100) * f * (8 * 1.34 + 2 * 0.72 + 2 * 1.5);
		if (across(fs) > 0.92 * w) fs = (0.92 * w) / across(1);
		ctx.font = TECH(fs);
		const m = ctx.measureText('0');
		const adv = m.width;
		const cap = m.actualBoundingBoxAscent; // a digit's height over its baseline
		const cellW = 1.34 * adv;
		const gap = 0.72 * adv;
		const W = 8 * cellW + 2 * gap;
		const cx = w / 2;
		// The answer's middle: a little above the board's, and well clear of
		// the stop, which sits a little below it.
		const y = Math.min(0.37 * h, stop.y - 0.6 * fs - Math.max(60, 0.11 * h));
		const xs = [];
		let x = cx - W / 2;
		for (let i = 0; i < 8; i++) {
			if (i === 2 || i === 4) x += gap;
			xs.push(x + cellW / 2);
			x += cellW;
		}
		const qs = Math.max(12, Math.round(L.fs * 0.82));
		// The spice: one numeral, bigger, and the track as wide as the date.
		const ns = 1.32 * fs;
		ctx.font = TECH(ns);
		const ncap = ctx.measureText('0').actualBoundingBoxAscent;
		const sp = W / 9;
		const ty = y + 0.5 * ncap + Math.max(18, 0.3 * fs);
		ctx.restore();
		G = {
			w,
			h,
			dpr: board.dpr,
			L,
			stop,
			fs,
			adv,
			cap,
			cellW,
			W,
			cx,
			y,
			xs,
			qs,
			qy: y - 0.5 * cap - Math.max(26, 0.55 * fs),
			ns,
			ncap,
			nqy: y - 0.5 * ncap - Math.max(26, 0.55 * fs),
			sp,
			x1: cx - W / 2,
			ty,
			band: Math.max(24, 0.45 * sp)
		};
		return G;
	}

	// The title as it is at FREEZE, once, with its stop cut out of it.
	function frozenFrame() {
		if (frozen) return frozen;
		const { w, h, dpr, stop } = G;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		x.globalCompositeOperation = 'destination-out';
		x.beginPath();
		x.arc(stop.x, stop.y, stop.r + 1.6, 0, Math.PI * 2);
		x.fill();
		frozen = c;
		return c;
	}

	function title(ctx, t) {
		const { w, h, L } = G;
		if (t < FREEZE) return TERM.draw(ctx, w, h, t / 10, t, t - 10);
		const img = frozenFrame();
		const k = img.width / w;
		L.out.forEach((ln, i) => {
			const a = 1 - smooth(span(t, FADE + 0.3 * i, FADE + 0.3 * i + 0.8));
			if (a <= 0.004) return;
			const top = ln.y - 1.15 * L.fs;
			const hh = L.step;
			ctx.save();
			ctx.globalAlpha = a;
			ctx.drawImage(img, 0, top * k, img.width, hh * k, 0, top, w, hh);
			ctx.restore();
		});
	}

	// The full stop, from the freeze on: chalk, gathering the answers.
	function fullStop(ctx, t, out) {
		if (t < FREEZE) return;
		const { stop } = G;
		const g1 = smooth(span(t, E1 + JOIN, E1 + JOIN + 0.35));
		const g2 = smooth(span(t, E2 + JOIN, E2 + JOIN + 0.35));
		const r = stop.r * (1 + 0.3 * g1 + 0.35 * g2);
		disc(ctx, stop.x, stop.y, r, {
			fill: rgb(CHALK, GOLDC, 0.4 * g1 + 0.6 * g2),
			alpha: 0.95 * out
		});
		if (g2 > 0) {
			// The second answer in: a small lit point, breathing a little.
			const br = 1 + 0.06 * Math.sin((t - E2) * 1.9);
			lit(ctx, stop.x, stop.y, stop.r * 1.05 * br, 0.55 * g2 * out);
		}
		for (const E of [E1, E2]) {
			const p = span(t, E + JOIN - 0.04, E + JOIN + 0.75);
			if (p <= 0 || p >= 1) continue;
			ctx.save();
			ctx.globalAlpha = 0.45 * (1 - p) ** 2 * out;
			ctx.strokeStyle = PAL.gold;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(stop.x, stop.y, stop.r * (2 + 8 * Math.sqrt(p)), 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
	}

	// The question: small, dim, the terminal's mono, typed on by q.
	function question(ctx, text, y, q, alpha) {
		if (q <= 0 || alpha <= 0.004) return;
		const n = Math.min(text.length, Math.floor(q * (text.length + 1)));
		if (n <= 0) return;
		ctx.save();
		ctx.font = TECH(G.qs);
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = PAL.chalk;
		ctx.globalAlpha = 0.5 * alpha;
		// Laid out whole and centred, so it does not slide as it is typed.
		const x0 = G.cx - ctx.measureText(text).width / 2;
		ctx.fillText(text.slice(0, n), x0, y);
		ctx.restore();
	}

	// A glyph centred at (x, y) — its ink's middle — at size fs.
	function glyph(ctx, ch, x, y, fs, color, alpha) {
		if (alpha <= 0.004 || fs < 0.5) return;
		ctx.save();
		ctx.font = TECH(fs);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		const m = ctx.measureText(ch);
		ctx.fillStyle = color;
		ctx.globalAlpha = alpha;
		ctx.fillText(ch, x, y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
		ctx.restore();
	}

	// After an Enter at E: the gold beat, the collapse, the point's trip.
	const after = (t, E) => ({
		gold: smooth(span(t, E + GOLD[0], E + GOLD[1])),
		c: smooth(span(t, E + COLLAPSE[0], E + COLLAPSE[1])),
		gone: 1 - smooth(span(t, E, E + 0.4))
	});

	// The point: from the answer's middle on an arc down to the stop, with a
	// short trail; `side` the way the arc swings.
	function travel(ctx, t, E, from, side) {
		const { stop } = G;
		const at = (s) => {
			const p = smooth(smooth(span(s, E + TRAVEL[0], E + TRAVEL[1])));
			const mx = (from[0] + stop.x) / 2;
			const my = (from[1] + stop.y) / 2;
			const dx = stop.x - from[0];
			const dy = stop.y - from[1];
			const d = Math.hypot(dx, dy) || 1;
			const k = 0.45 * side;
			const ctl = [mx - (dy / d) * d * k, my + (dx / d) * d * k];
			const u = 1 - p;
			return [
				u * u * from[0] + 2 * u * p * ctl[0] + p * p * stop.x,
				u * u * from[1] + 2 * u * p * ctl[1] + p * p * stop.y
			];
		};
		const born = smooth(span(t, E + COLLAPSE[0] + 0.25, E + COLLAPSE[1]));
		const land = 1 - smooth(span(t, E + JOIN - 0.1, E + JOIN + 0.05));
		const a = born * land;
		if (a <= 0.004) return;
		const moving = t > E + TRAVEL[0] && t < E + TRAVEL[1];
		if (moving) {
			let prev = at(t);
			for (let k = 1; k <= 9; k++) {
				const p = at(t - 0.022 * k);
				stroke(ctx, [prev, p], {
					color: PAL.gold,
					width: 1.3,
					alpha: 0.32 * (1 - k / 10) * a
				});
				prev = p;
			}
		}
		const [x, y] = at(t);
		lit(ctx, x, y, 2.3, 0.85 * a);
	}

	// ── The date ─────────────────────────────────────────────────────────────
	function date(ctx, t, hand) {
		if (t < Q1 || t > E1 + TRAVEL[1] + 0.2) return;
		const { xs, y, fs, adv, cap, cellW, cx } = G;
		const A = after(t, E1);
		question(ctx, DATE_Q, G.qy, hand.q1, A.gone);
		travel(ctx, t, E1, [cx, y], 1);
		const show = smooth(span(hand.q1, 0.35, 1));
		if (show <= 0 || A.c >= 1) return;
		const typed = hand.typed.slice(0, 8);
		const full = typed.length === 8;
		const wrong = full && !hand.valid;
		const c = A.c;
		const fade = 1 - smooth(span(c, 0.45, 0.85));
		const at = (x) => lerp(x, cx, c);
		// The cells: an underline each, grown from its middle as the field
		// comes up, drawn in to the centre as it collapses.
		const uy = y + 0.5 * cap + 0.28 * fs;
		const hw = 0.38 * cellW * show * (1 - c);
		for (let i = 0; i < 8; i++) {
			if (hw <= 0.3) break;
			const x = at(xs[i]);
			const next = i === typed.length && hand.caret > 0;
			stroke(
				ctx,
				[
					[x - hw, uy],
					[x + hw, uy]
				],
				{
					color: wrong ? PAL.rose : rgb(CHALK, GOLDC, A.gold),
					width: 1.2,
					alpha: (wrong ? 0.7 : next ? 0.5 : 0.28) * show * fade
				}
			);
		}
		// The mask in the empty cells, faint.
		for (let i = typed.length; i < 8 && c < 0.05; i++)
			glyph(ctx, MASK[i], xs[i], y + 0.04 * fs, 0.36 * fs, PAL.chalk, 0.14 * show);
		// The digits, whole as typed; on Enter gold, drawn in and shrinking.
		const gfs = fs * Math.max(0.1, 1 - c);
		const col = rgb(CHALK, GOLDC, A.gold);
		for (let i = 0; i < typed.length; i++)
			glyph(ctx, typed[i], at(xs[i]), y, gfs, col, (wrong ? 0.7 : 0.95) * show * fade);
		// The caret: a big block in the next cell, at the line's end once the
		// eight are in; steady after a key, blinking on the clock otherwise.
		if (hand.caret > 0 && c <= 0) {
			const on = hand.steady > 0 || (((hand.secs * BLINK) % 1) + 1) % 1 < DUTY;
			if (on) {
				const bx = full ? xs[7] + cellW * 0.5 + 0.55 * adv : xs[typed.length];
				const bw = 0.86 * adv;
				const bh = 1.16 * cap;
				ctx.save();
				ctx.globalAlpha = 0.85 * show;
				ctx.fillStyle = PAL.chalk;
				ctx.fillRect(bx - bw / 2, y - bh / 2, bw, bh);
				ctx.restore();
			}
		}
	}

	// ── The spice ────────────────────────────────────────────────────────────
	function spice(ctx, t, hand) {
		const { x1, sp, ty, cx, y, ns } = G;
		answers.slider((px, py, phase) => {
			const v = 1 + (px - x1) / sp;
			if (phase === 'down' && (Math.abs(py - ty) > G.band || v < 0.4 || v > 10.6)) return null;
			return Math.max(1, Math.min(10, v));
		});
		if (t < Q2 || t > E2 + TRAVEL[1] + 0.2) return;
		const A = after(t, E2);
		question(ctx, SPICE_Q, G.nqy, hand.q2, A.gone);
		travel(ctx, t, E2, [cx, y], -1);
		const show = smooth(span(hand.q2, 0.35, 1));
		if (show <= 0 || A.c >= 1) return;
		const c = A.c;
		const fade = 1 - smooth(span(c, 0.55, 1));
		const v = Math.max(1, Math.min(10, hand.value));
		const held = hand.held > 0;
		const hx = x1 + (v - 1) * sp;
		const near = Math.round(v);
		// The track, the ticks and the handle, pulled into the numeral's centre
		// as the answer collapses — where the point it becomes sets off from.
		const tx = (x) => lerp(x, cx, c);
		const tyc = lerp(ty, y, c);
		const ta = show * (1 - c);
		stroke(
			ctx,
			[
				[tx(x1), tyc],
				[tx(x1 + 9 * sp), tyc]
			],
			{ color: PAL.chalk, width: 1, alpha: 0.24 * ta }
		);
		stroke(
			ctx,
			[
				[tx(x1), tyc],
				[tx(hx), tyc]
			],
			{ color: PAL.chalk, width: 1.3, alpha: 0.5 * ta }
		);
		const tick = Math.max(4, 0.09 * sp);
		for (let i = 0; i < 10; i++) {
			const x = tx(x1 + i * sp);
			const under = held && i + 1 === near;
			const passed = i + 1 <= v + 1e-3;
			const hh = tick * (under ? 1.8 : 1) * (1 - c);
			stroke(
				ctx,
				[
					[x, tyc - hh],
					[x, tyc + hh]
				],
				{
					color: PAL.chalk,
					width: under ? 1.4 : 1.1,
					alpha: (under ? 0.85 : passed ? 0.5 : 0.24) * ta
				}
			);
		}
		const hr = Math.max(4, 0.075 * sp) * (held ? 1.3 : 1);
		disc(ctx, tx(hx), tyc, hr * (1 - c), { fill: PAL.chalk, alpha: 0.92 * ta });
		if (held)
			disc(ctx, hx, ty, hr * 2.1, {
				fill: 'rgba(0,0,0,0)',
				alpha: 0.35 * ta,
				ring: PAL.chalk,
				ringWidth: 1
			});
		// The numeral: an odometer's wheel in a window its own height — it
		// rolls to the next as the handle passes half a stop, so it follows
		// the hand; on Enter gold, then shrinking into its middle.
		const n = Math.min(10, Math.floor(v));
		const f = n >= 10 ? 0 : v - n;
		const roll = smooth(span(f, 0.36, 0.64));
		const lift = 1.25 * G.ncap;
		const nfs = ns * lerp(1, 0.12, c);
		const col = rgb(CHALK, GOLDC, A.gold);
		const na = 0.95 * show * fade;
		ctx.save();
		if (roll > 0) {
			const half = 0.62 * G.ncap;
			ctx.beginPath();
			ctx.rect(cx - 2 * ns, y - half, 4 * ns, 2 * half);
			ctx.clip();
		}
		glyph(ctx, String(n), cx, y - roll * lift, nfs, col, na);
		if (roll > 0) glyph(ctx, String(n + 1), cx, y + (1 - roll) * lift, nfs, col, na);
		ctx.restore();
	}

	return {
		render(ctx, w, h, t, hand) {
			layout(ctx, w, h);
			// For a test driving it by hand: the clock, what is asked, the
			// handle, and where the track is.
			if (window.__lab) {
				const { value, held, asking } = hand;
				const track = { x1: G.x1, sp: G.sp, y: G.ty };
				Object.assign(window.__lab, { t, asking, value, held, track });
			}
			const out = 1 - smooth(span(t, SECONDS - 0.9, SECONDS - 0.1));
			title(ctx, t);
			fullStop(ctx, t, out);
			date(ctx, t, hand);
			spice(ctx, t, hand);
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
