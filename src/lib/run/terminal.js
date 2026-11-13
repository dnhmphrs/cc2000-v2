import { disc, PAL, TECH_FONT, span, smooth, lerp } from './board.js';

// ── The title, typed by a terminal ───────────────────────────────────────────
// The run's opening: the site's mono face on the dark, a block caret blinking
// alone, then the sentence printed at a keystroke rhythm — uneven, seeded: a
// hitch at every space, a longer one at punctuation, a gap between the lines,
// a pause before the last word. The caret waits after "conception", then the
// full stop is typed: the block caret closes to the dot.
//
//   const TERM = makeTerminal(scale)    `scale` the type's size (1 is 0.036 of
//                                       the board's height, or what its width
//                                       allows)
//   TERM.draw(ctx, w, h, secs)          the frame at `secs` from the start
//   TERM.layout(ctx, w, h)              the layout for a board — `fs` the
//                                       type's size, `step` the line pitch,
//                                       `cell` a character's advance, `out`
//                                       the lines, `stop` the full stop's
//                                       spot and radius, `times` the wrapped
//                                       lines' keystrokes (or null)
//   TERM.stop                           the second the full stop lands
//
// Every keystroke is on a table of times built once, so the count typed at
// any moment is a lookup and a frame is a pure function of the clock. The
// run draws this up to a moment after the stop and then holds that frame
// (sketch.js FREEZE); what the sentence does from there is the entry's.
//
// The lines are typed centred, where they stay. On a board too narrow for the
// three lines at a readable size (a phone held upright) the sentence is
// RE-WRAPPED into as many lines as it needs at that size, and typed with the
// same keystrokes.

// The terminal's beats are in progress over ten seconds, u = secs / 10.
const SECONDS = 10;

const LINES = [
	'in the earth year 2000, human technology advanced',
	'allowing all of mankind to calculate the song playing',
	'at their exact moment of conception'
];

// A line laid out once: its characters' x offsets (from the measured widths
// of every prefix, so kerning holds), centred on x.
function layLine(ctx, text, font, size, x, y) {
	ctx.font = font(size);
	const xs = [0];
	for (let i = 1; i <= text.length; i++) xs.push(ctx.measureText(text.slice(0, i)).width);
	const W = xs[text.length];
	return { text, font, size, x0: x - W / 2, y, xs, W };
}

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

// A line TYPED to its first `n` characters: each there whole, as a terminal
// prints it; a character off the board is not drawn.
function typeLine(ctx, ln, n, alpha, w, h) {
	const size = ln.size;
	if (n <= 0 || size < 0.5 || alpha <= 0.003) return;
	ctx.save();
	ctx.font = ln.font(size);
	ctx.textBaseline = 'alphabetic';
	for (let i = 0; i < ln.text.length && i < n; i++) {
		const ch = ln.text[i];
		if (ch === ' ') continue;
		const X = ln.x0 + ln.xs[i];
		const Y = ln.y;
		const adv = ln.xs[i + 1] - ln.xs[i];
		if (X > w + 8 || X + adv * 1.5 + size * 0.2 < -8 || Y - size > h + 8 || Y + size * 0.4 < -8)
			continue;
		ctx.globalAlpha = alpha * 0.94;
		ctx.fillStyle = PAL.chalk;
		ctx.fillText(ch, X, Y);
	}
	ctx.restore();
}

const TERM = {
	lead: 0.45, // the caret alone, s
	key: 0.021, // the base interval between keystrokes, s
	gap: 0.2, // between lines
	lastWord: 0.4, // before "conception"
	wait: 0.35, // the caret after "conception", before the stop
	blink: 2.3 // blinks a second
};

// The keystrokes: a time for each character of each line, in seconds — a base
// interval jittered by a seeded random, a hitch after every space, a longer
// one at punctuation.
function keystrokes() {
	let seed = 20001;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = TERM.lead;
	const typed = (text, base, last = false) => {
		const times = [];
		for (let i = 0; i < text.length; i++) {
			let dt = base * (0.55 + 0.9 * rnd());
			if (i > 0 && text[i - 1] === ' ') dt += base * 0.9;
			if (i > 0 && ',.'.includes(text[i - 1])) dt += base * 3.5;
			if (last && text.slice(i) === 'conception') dt += TERM.lastWord;
			t += dt;
			times.push(t);
		}
		return times;
	};
	const out = LINES.map((text, i) => {
		if (i > 0) t += TERM.gap;
		return typed(text, TERM.key, i === LINES.length - 1);
	});
	const stop = t + TERM.wait;
	return { out, stop };
}

export function makeTerminal(scale = 1) {
	const K = keystrokes();
	const uStop = K.stop / SECONDS;
	let L = null;
	const layout = (ctx, w, h) => {
		if (!L || L.w !== w || L.h !== h) L = layoutTerminal(ctx, w, h, scale, K);
		return L;
	};
	return {
		stop: K.stop,
		layout,
		draw(ctx, w, h, secs) {
			terminal(ctx, layout(ctx, w, h), K, uStop, w, h, secs);
		}
	};
}

// A keystroke table's count typed by time t.
function typedBy(times, t) {
	let n = 0;
	while (n < times.length && times[n] <= t) n++;
	return n;
}

// Every line centred on the board from the first keystroke (the full stop's
// width counted in the last line's), so the card types where it will stay.
// Wrapped, L.times — the wrapped lines' times — replaces K.out.
function layoutTerminal(ctx, w, h, scale, K) {
	ctx.save();
	ctx.font = TECH(100);
	const W100 = Math.max(...LINES.map((s) => ctx.measureText(s + '.').width));
	let fs = Math.min(h * 0.036, (0.78 * w * 100) / W100) * scale;
	// Narrow: the size the board's width allows a shorter line.
	const fsWrap = Math.min(h * 0.036, w * 0.042) * scale;
	const wrap = fs < 0.8 * fsWrap;
	let texts = LINES;
	let times = null;
	if (wrap) {
		fs = fsWrap;
		ctx.font = TECH(fs);
		// The sentence's characters and when each is typed; a line break is a
		// space, typed with the character after it.
		const chars = [];
		const at = [];
		LINES.forEach((line, i) => {
			if (i > 0) {
				chars.push(' ');
				at.push(K.out[i][0]);
			}
			for (let j = 0; j < line.length; j++) {
				chars.push(line[j]);
				at.push(K.out[i][j]);
			}
		});
		const all = chars.join('');
		const maxW = 0.88 * w;
		texts = [];
		times = [];
		let start = 0;
		while (start < all.length) {
			let end = all.length;
			const fits = (e) =>
				ctx.measureText(all.slice(start, e) + (e === all.length ? '.' : '')).width <= maxW;
			if (!fits(end)) {
				end = all.lastIndexOf(' ', end - 1);
				while (end > start && !fits(end)) end = all.lastIndexOf(' ', end - 1);
				if (end <= start)
					end = Math.min(all.length, start + Math.max(1, Math.floor(maxW / (0.6 * fs))));
			}
			texts.push(all.slice(start, end));
			times.push(at.slice(start, end));
			start = end;
			while (all[start] === ' ') start++;
		}
	}
	const step = fs * 1.8;
	// The block: a little below the middle.
	const top = h / 2 + 0.1 * step - (step * (texts.length - 1)) / 2;
	const last = texts.length - 1;
	const out = texts.map((s, i) => {
		const ln = layLine(ctx, i === last ? s + '.' : s, TECH, fs, w / 2, top + step * i);
		ln.text = s; // the stop is the caret's to make
		return ln;
	});
	// The cell: one character's advance; the caret is a block of it.
	ctx.font = TECH(fs);
	const cell = ctx.measureText('0').width;
	// The full stop: where the glyph's ink would be, in the cell after the
	// last word.
	const m = ctx.measureText('.');
	const l3 = out[out.length - 1];
	const sx = l3.x0 + l3.xs[l3.text.length];
	const stop = {
		x: sx + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
		y: l3.y - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
		r: Math.max(1.6, (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2) * 1.1
	};
	ctx.restore();
	return { w, h, fs, step, cell, out, stop, times };
}

function terminal(ctx, L, K, uStop, w, h, secs) {
	const { stop } = L;
	const t = secs;
	const u = secs / SECONDS;

	// The sentence, as far as it is typed.
	const outT = L.times ?? K.out;
	const no = outT.map((times) => typedBy(times, t));
	L.out.forEach((ln, i) => typeLine(ctx, ln, no[i], 0.92, w, h));

	// The caret: a block in the cell after the last thing typed, steady
	// within a keystroke of the last one, blinking on the clock otherwise.
	// After the last word it waits for the stop, and is it.
	if (u < uStop) {
		let i = 0;
		while (i < L.out.length - 1 && no[i + 1] > 0) i++;
		const ln = L.out[i];
		const n = no[i];
		const last = n > 0 ? outT[i][n - 1] : 0;
		const steady = t - last < 0.16;
		const on = steady || (t * TERM.blink) % 1 < 0.58;
		if (on) {
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = PAL.chalk;
			ctx.fillRect(ln.x0 + ln.xs[n], ln.y - 0.78 * L.fs, L.cell, 0.92 * L.fs);
			ctx.restore();
		}
	}

	// The full stop: the caret closes to the dot.
	if (u >= uStop) {
		const close = smooth(span(u, uStop, uStop + 0.014));
		if (close < 1) {
			const bw = lerp(L.cell, stop.r * 2, close);
			const bh = lerp(0.92 * L.fs, stop.r * 2, close);
			const lz = L.out[L.out.length - 1];
			const bx = lerp(lz.x0 + lz.xs[lz.text.length], stop.x - bw / 2, close);
			const by = lerp(lz.y - 0.78 * L.fs, stop.y - bh / 2, close);
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = PAL.chalk;
			ctx.fillRect(bx, by, bw, bh);
			ctx.restore();
		}
		disc(ctx, stop.x, stop.y, stop.r, { fill: PAL.chalk, alpha: 0.95 * close });
	}
}
