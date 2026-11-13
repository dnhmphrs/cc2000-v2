// ── The machine's status line: COMPILING USER GENETICS … ─────────────────────
// What the calculator says it is doing between the beats of a run, typed in
// the terminal's own face at the terminal's pace, a block caret after it,
// then three dots cycling while the work goes on, gone at its end. Every
// frame a pure function of t.
//
//   caption(ctx, w, h, text, t, { at, until, size, x, y, align, alpha })
//
// `at` the second it starts typing, `until` the second it is gone (it fades
// over the 0.4 s before). `size` the type's size (default: the terminal's at
// 0.8, 0.8 × min(0.036 h, …), as the epicycle questions), `x`, `y` where its
// baseline starts (default: the terminal's left margin, 0.9 h), `align`
// 'left' or 'center' (the line's full width with its dots counted, so it does
// not shift as the dots come).

import { PAL, TECH_FONT, span, smooth } from './board.js';

export const CAPTION = {
	char: 0.045, // seconds a keystroke
	cycle: 1.2, // seconds the dots take to come and go
	fade: 0.4,
	genetics: 'COMPILING USER GENETICS',
	conception: 'SIMULATING CONCEPTION'
};

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

export function captionSize(w, h) {
	return Math.round(Math.max(11, Math.min(0.036 * h * 0.8, 0.022 * w)));
}

export function caption(ctx, w, h, text, t, o = {}) {
	const at = o.at ?? 0;
	const until = o.until ?? Infinity;
	if (t < at || t >= until) return;
	const fs = o.size ?? captionSize(w, h);
	const a = (o.alpha ?? 1) * (1 - smooth(span(t, until - CAPTION.fade, until)));
	if (a <= 0.004) return;
	const n = Math.min(text.length, Math.floor((t - at) / CAPTION.char) + 1);
	const typed = n >= text.length;
	ctx.save();
	ctx.font = TECH(fs);
	ctx.textBaseline = 'alphabetic';
	const full = ctx.measureText(text + '...').width;
	const cell = ctx.measureText('0').width;
	const x0 =
		o.align === 'center' ? (o.x ?? w / 2) - full / 2 : (o.x ?? Math.max(40, Math.round(0.06 * w)));
	const y = o.y ?? Math.round(0.9 * h);
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.85 * a;
	const shown = text.slice(0, n);
	ctx.fillText(shown, x0, y);
	let xe = x0 + ctx.measureText(shown).width;
	if (typed) {
		// The dots: one, two, three, none — on the run's clock.
		const k = Math.floor((((t - at - text.length * CAPTION.char) / CAPTION.cycle) * 4) % 4);
		const dots = '...'.slice(0, Math.max(0, k));
		ctx.fillText(dots, xe, y);
		xe += ctx.measureText(dots).width;
	}
	// The caret: steady while it types, blinking once it is waiting.
	const since = t - at - n * CAPTION.char;
	const on = !typed || since < 0.16 || (t * 1.9) % 1 < 0.58;
	if (on) {
		ctx.globalAlpha = 0.8 * a;
		ctx.fillRect(xe + 0.15 * cell, y - 0.78 * fs, cell, 0.92 * fs);
	}
	ctx.restore();
}
