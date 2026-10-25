// ── MEG: the machine's signal, its traces, its bars, its display ─────────────
// flow-strand-sketch-meg's own helpers, beside log/i2-meg.js (the cap, the
// channels, the resting rhythm, the spectrum — imported, not changed). The
// machine reads the person's MEG at rest (i2-meg.js signalOf), prompts them,
// and reads the RESPONSE: to the father's sperm a slow swell with bursts on
// the frontal channels (responseA); to the parents having sex every channel
// going wild and SATURATING (responseB: past the strip's clip, the traces
// flat-top). The captured signal's spectrum is the resting one EXCITED
// toward the fast bands (excited), and the body is written from that.
// Every function is pure: a picture of its arguments.
//
//   responseA(ch, tau, k)   the response to prompt A on channel ch, at level k
//   responseB(ch, tau, k)   … to prompt B
//   excited(bands, k)       the spectrum shifted to the fast bands by k
//   readingsOf(digits)      { fta, ftb }: the two field strengths, femtotesla
//   drawTraces(ctx, ink, box, o)   the strip of eight traces, as i2-meg.js
//                           drawStrip, with `signal(ch, tt)` the trace's own
//                           signal and `tick(c)` a gold check at a row's end
//   drawBar(ink, box, k, o) a hand-drawn bar, filled to k in gold hatching
//   typeLine(ctx, text, x, y, size, o)  a line typed in the terminal's face
//                           from o.at, a block caret after it

import { TAU, span, smooth, lerp, PAL, TECH_FONT } from './board.js';
import { HAND, letter, noise1 } from './sketch-hand.js';
import { CHANNELS, BANDS } from './i2-meg.js';
import { CAPTION } from './caption.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const r1 = (x) => Math.round(x * 10) / 10;
// The frontal channels carry prompt A; the rest a little.
const FRONT = [1, 1, 0.85, 0.85, 0.4, 0.4, 0.25, 0.25];

// Prompt A: a slow swell (a 0.35 Hz wave as drawn) and, on the frontal
// channels, a burst of fast activity every ~0.9 s, ringing down.
export function responseA(ch, tau, k) {
	if (k <= 0) return 0;
	const g = FRONT[ch % FRONT.length];
	const slow =
		0.9 * Math.sin(TAU * 0.35 * tau + 0.8 * ch) + 0.35 * Math.sin(TAU * 1.1 * tau + 2 * ch);
	const P = 0.9;
	const x = ((tau + 0.23 * ch) % P) + 0.0;
	const burst = (g > 0.8 ? 1 : 0.3) * Math.exp(-x / 0.16) * Math.sin(TAU * 9 * x);
	return k * g * (slow + 1.1 * burst);
}
// Prompt B: every channel, big, chaotic — several rhythms and noise, well
// past the strip's clip, so the traces saturate.
export function responseB(ch, tau, k) {
	if (k <= 0) return 0;
	const s =
		1.3 * Math.sin(TAU * 0.5 * tau + ch) +
		1.0 * Math.sin(TAU * 2.3 * tau + 1.3 * ch) +
		0.9 * Math.sin(TAU * 6.1 * tau + 0.4 * ch) +
		1.1 * noise1(tau * 7 + 3 * ch, 17 + ch);
	return k * 1.6 * s;
}

// The spectrum excited toward the fast bands: each band's power scaled, the
// shares renormalised, the dominant band found again.
export function excited(bands, k) {
	const K = clamp(k, 0, 1);
	const scale = [1 - 0.55 * K, 1 - 0.35 * K, 1, 1 + 1.3 * K, 1 + 2.4 * K];
	const p = bands.p.map((x, i) => x * scale[i]);
	const sum = p.reduce((a, b) => a + b, 0) || 1;
	const w = p.map((x) => x / sum);
	let dom = 0;
	for (let i = 1; i < 5; i++) if (w[i] > w[dom]) dom = i;
	const f = bands.f.map((x, i) => r1(lerp(x, BANDS[i].lo + 0.7 * (BANDS[i].hi - BANDS[i].lo), K)));
	return {
		...bands,
		p,
		w,
		f,
		dom,
		hz: f[dom],
		name: BANDS[dom].name,
		label: `${BANDS[dom].name} ${f[dom].toFixed(1)} HZ`
	};
}

// The two readings, from the date: signal A a few hundred femtotesla, B a
// couple of thousand (a real MEG reads tens to hundreds).
export function readingsOf(digits) {
	const s = String(digits ?? '')
		.replace(/\D/g, '')
		.split('')
		.reduce((a, c) => a + Number(c), 0);
	return { fta: 240 + 9 * s, ftb: 1900 + 31 * s };
}

// ── The traces ───────────────────────────────────────────────────────────────
export const SPAN = 5;
const clip = (x, m) => Math.max(-m, Math.min(m, x));
export function drawTraces(ctx, ink, box, o) {
	const {
		signal,
		tau = 0,
		gain = 1,
		alpha = 1,
		upto = 1,
		bo = 0,
		sc = 1,
		lit = null,
		tick = null
	} = o;
	if (alpha <= 0.01 || upto <= 0) return { x: box.x, y: [] };
	const n = CHANNELS.length;
	const rowH = box.h / n;
	const ys = [];
	const label = 0.5 * rowH;
	const x0 = box.x + 2.6 * label;
	const W = box.x + box.w - x0;
	const N = 140;
	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (let c = 0; c < n; c++) {
		const yc = box.y + (c + 0.5) * rowH;
		ys.push(yc);
		const kc = smooth(span(upto, c / n, c / n + 0.3));
		if (kc <= 0) continue;
		letter(ink, CHANNELS[c], box.x, yc + 0.35 * label, 0.8 * label, {
			align: 'left',
			seed: 700 + c,
			boil: bo,
			alpha: 0.7 * alpha * kc,
			width: 0.1
		});
		const glow = lit ? lit(c) : 0;
		ctx.beginPath();
		const amp = 0.42 * rowH * gain * kc;
		for (let j = 0; j <= N; j++) {
			const u = j / N;
			const tt = tau - SPAN * (1 - u);
			const v = clip(signal(c, tt), 1.15);
			const x = x0 + u * W;
			const y = yc - amp * v + 0.7 * sc * noise1(u * 11 + c * 3, bo * 5 + c);
			if (j === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = glow > 0.01 ? HAND.gold : HAND.ink;
		ctx.globalAlpha = alpha * kc * (0.55 + 0.45 * glow);
		ctx.lineWidth = (1.1 + 0.6 * glow) * sc;
		ctx.stroke();
		// a gold check past the row's end: the channel calibrated
		const tk = tick ? tick(c) : 0;
		if (tk > 0) {
			const x = x0 + W + 0.9 * label;
			const s = 0.3 * rowH;
			const pts = [
				[x, yc],
				[x + 0.4 * s, yc + 0.45 * s],
				[x + 1.1 * s, yc - 0.5 * s]
			];
			const m = Math.max(2, Math.ceil(tk * 2) + 1);
			ink.line(pts.slice(0, m), HAND.gold, 1.6 * sc, alpha * kc, false);
		}
	}
	// the now: a red tick at the right edge
	if (upto > 0.9) {
		const x = x0 + W + 0.3 * label;
		ink.line(
			[
				[x, box.y - 0.2 * rowH],
				[x, box.y + box.h + 0.2 * rowH]
			],
			HAND.red,
			1.2 * sc,
			0.7 * alpha,
			false
		);
	}
	ctx.restore();
	return { x: x0, y: ys };
}

// ── The bar ──────────────────────────────────────────────────────────────────
// A box in the hand, its fill k (0…1) hatched in gold, a tick at each tenth.
export function drawBar(ink, box, k, o = {}) {
	const { alpha = 1, bo = 0, sc = 1, upto = 1 } = o;
	if (alpha <= 0.01 || upto <= 0) return;
	const j = (i) => 1.1 * sc * noise1(i * 1.7 + 3, bo * 3 + 11);
	const { x, y, w, h } = box;
	const rim = [
		[x + j(1), y + j(2)],
		[x + w * upto + j(3), y + j(4)],
		[x + w * upto + j(5), y + h + j(6)],
		[x + j(7), y + h + j(8)],
		[x + j(1), y + j(2)]
	];
	ink.line(rim, HAND.ink, 1.5 * sc, 0.8 * alpha);
	for (let i = 1; i < 10; i++) {
		const tx = x + (w * i) / 10;
		if (tx > x + w * upto) break;
		ink.line(
			[
				[tx, y + h],
				[tx, y + h + 0.3 * h]
			],
			HAND.ink,
			0.9 * sc,
			0.4 * alpha,
			false
		);
	}
	const fw = w * clamp(k, 0, 1) * upto;
	if (fw > 1) {
		const step = Math.max(3, 0.55 * h);
		for (let s = 0; s < fw + h; s += step) {
			const xa = x + s;
			const xb = x + s - h;
			const p0 = [Math.min(xa, x + fw), y];
			const p1 = [Math.max(xb, x), y + h];
			if (p0[0] <= x) continue;
			// the hatch is cut to the box: a line from (xa, y) to (xb, y + h)
			const q0 = xa > x + fw ? [x + fw, y + (h * (xa - (x + fw))) / h] : p0;
			const q1 = xb < x ? [x, y + h - (h * (x - xb)) / h] : p1;
			ink.line(
				[
					[q0[0] + j(20 + s), q0[1]],
					[q1[0] + j(21 + s), q1[1]]
				],
				HAND.gold,
				1.3 * sc,
				0.85 * alpha,
				false
			);
		}
	}
}

// ── The display's type ───────────────────────────────────────────────────────
// A line in the terminal's face, typed on from `at` at the caption's rate, a
// block caret steady while it types and blinking after (on `secs`), fading
// over 0.4 s before `until`. Returns the width typed.
export function typeLine(ctx, text, x, y, size0, o = {}) {
	let size = size0;
	const { t = 0, at = 0, until = Infinity, align = 'left', alpha = 1, secs = t, caret = true } = o;
	if (!text || t < at || t >= until) return 0;
	const a = alpha * (1 - smooth(span(t, until - CAPTION.fade, until)));
	if (a <= 0.004) return 0;
	const n = Math.min(text.length, Math.floor((t - at) / CAPTION.char) + 1);
	const typed = n >= text.length;
	ctx.save();
	ctx.font = `400 ${size}px ${TECH_FONT}`;
	ctx.textBaseline = 'alphabetic';
	let full = ctx.measureText(text).width;
	// (a line wider than `maxW` is set smaller to fit it: a phone's board)
	if (o.maxW && full > o.maxW) {
		size = Math.max(8, (size * o.maxW) / full);
		ctx.font = `400 ${size}px ${TECH_FONT}`;
		full = ctx.measureText(text).width;
	}
	const cell = ctx.measureText('0').width;
	const x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
	ctx.fillStyle = o.color ?? PAL.chalk;
	ctx.globalAlpha = 0.85 * a;
	const shown = text.slice(0, n);
	ctx.fillText(shown, x0, y);
	const xe = x0 + ctx.measureText(shown).width;
	const since = t - at - n * CAPTION.char;
	const on = caret && (!typed || since < 0.16 || (secs * 1.9) % 1 < 0.58);
	if (on && !(typed && o.caretOff)) {
		ctx.globalAlpha = 0.8 * a;
		ctx.fillRect(xe + 0.15 * cell, y - 0.78 * size, cell, 0.92 * size);
	}
	ctx.restore();
	return full;
}

// The procedure's clock, MM:SS.s.
export function tplusOf(s) {
	const x = Math.max(0, s);
	const m = Math.floor(x / 60);
	const ss = x - 60 * m;
	return `${String(m).padStart(2, '0')}:${ss.toFixed(1).padStart(4, '0')}`;
}
