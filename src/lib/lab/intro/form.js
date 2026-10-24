// ── Intro: form — a clean form under the title ──────────────────────────────
// The most conventional of the openings, done carefully: the title card types
// as the terminal types it and STAYS where it typed (frozen at its full stop,
// no zoom), and under it, in the same mono face a size down, the terminal
// prints a form — the box-drawing strokes ┌─┬─┐ │ └─┴─┘ laid in the face's
// own character cells and printed on cell by cell, as a TUI draws itself:
//
//   DATE OF BIRTH
//   ┌──────┬──────┬────────┐
//   │  DD  │  MM  │  YYYY  │     ✓
//   └──────┴──────┴────────┘
//
//   SPICE
//   ├──┼──█──┼──┼──┼──┼──┼──┤  3 ✓
//
//   ▸ CONTINUE
//
// Printed dim; then the date's box BRIGHTENS (it has the focus) and the
// terminal's block caret sits in its first cell. The digits replace the mask
// letters as they are typed, the caret stepping on and jumping the dividers
// segment to segment; a date that cannot be is shown by the box going rose,
// gently. Enter: a gold tick is written beside the box, which dims, and the
// focus moves down — the track brightens, its handle (a block, the caret's
// own shape) grabbable where it is drawn, the number beside it. Dragged, the
// handle follows the pointer and the track fills behind it; let go, it snaps
// to the nearest notch. Enter: a second tick, and ▸ CONTINUE lights (the ▸ in
// gold) and fills in reverse video, left to right. A settle, a fade, round.
//
// Every frame is a pure function of t and the hand: the print is a table of
// times built once (a seeded unevenness, quicker for the strokes than the
// words), the caret blinks on hand.secs, and the title after its stop is one
// cached frame of the terminal.

import { PAL, TECH_FONT, span, smooth, lerp, clamp01 } from '../log/board.js';
import { makeTerminal } from '../log-dawn.js';

// ── The print ────────────────────────────────────────────────────────────────
// The form's rows, top to bottom, in its own line pitch: what each row is and
// how many character cells it prints. Cols are cells from the title's margin.
const W_BOX = 24; // ┌ + 6 + ┬ + 6 + ┬ + 8 + ┐
const BORDER = [0, 7, 14, 23];
const DIGIT_COL = [3, 4, 10, 11, 17, 18, 19, 20];
const MASK = 'DDMMYYYY';
const LABEL1 = 'DATE OF BIRTH';
const LABEL2 = 'SPICE';
const GO = 'CONTINUE'; // after the ▸ and a space
const ROW = { label1: 0, top: 1, mid: 2, bot: 3, label2: 5, track: 6, go: 8 };
// The spice's number, right-aligned to this cell's right edge (a "10" clears
// the handle at 10 by a cell), and the confirmations — both in ONE column to
// the right of it, as a form's checks line up.
const NUM_COL = 26;
const TICK = 28.5; // the ticks' centre, in cells (before the fields' OFF)
// The fields' cells sit half a cell left of the words' cells, so that an
// upright through a cell's middle (┌, ├) stands on the labels' left edge
// rather than half a cell in from it.
const OFF = -0.5;

// A print table: for every row, the time (from the start of the print) each of
// its cells lands. Words go at a typing pace, strokes at a terminal's, a hitch
// before each block.
const KEY = { word: 0.03, stroke: 0.0065, line: 0.04, block: 0.1 };
const PRINT = (() => {
	let seed = 1972;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = 0;
	const rows = [];
	const add = (k, n, base, gap) => {
		t += gap;
		const times = [];
		for (let i = 0; i < n; i++) {
			t += base * (0.55 + 0.9 * rnd());
			times.push(t);
		}
		rows.push({ k, n, times });
	};
	add(ROW.label1, LABEL1.length, KEY.word, 0);
	add(ROW.top, W_BOX, KEY.stroke, KEY.block);
	add(ROW.mid, W_BOX, KEY.stroke, KEY.line);
	add(ROW.bot, W_BOX, KEY.stroke, KEY.line);
	add(ROW.label2, LABEL2.length, KEY.word, KEY.block + KEY.line);
	add(ROW.track, NUM_COL + 1, KEY.stroke, KEY.block);
	add(ROW.go, 2 + GO.length, KEY.word, KEY.block + KEY.line);
	return { rows, end: t };
})();

// ── The beats (seconds) ──────────────────────────────────────────────────────
// The terminal's title types to its full stop (≈ 4.94 s) and freezes 0.2 s
// later; the caret idles on the line under it, then the form prints from q1.
const Q1 = 6.1;
const WAIT1 = +(Q1 + PRINT.end + 0.45).toFixed(2);
const E1 = +(WAIT1 + 2.4).toFixed(2);
const Q2 = +(E1 + 0.75).toFixed(2);
const WAIT2 = +(Q2 + 0.7).toFixed(2);
const E2 = +(WAIT2 + 2.2).toFixed(2);
const FADE = [E2 + 3.1, E2 + 4.4];
const SECONDS = 20;

export const meta = {
	title:
		'a clean form under the frozen title: a boxed DD | MM | YYYY, a notched spice track, ▸ CONTINUE',
	order: 4,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: WAIT1, e1: E1, q2: Q2, wait2: WAIT2, e2: E2 }
};

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
// The terminal's caret: blinks a second and its duty (it holds steady while
// the hand says a key has just landed).
const BLINK = 2.3;
const DUTY = 0.58;

export async function make({ board, answers, live }) {
	try {
		await document.fonts.load(TECH(24));
	} catch {
		// The board's fallbacks will do.
	}
	const term = makeTerminal(0.8, { cmd: false });
	const FREEZE = term.stop + 0.2; // ≈ 5.14, before Q1

	// ── Caches ───────────────────────────────────────────────────────────────
	let L = null; // the layout for this board
	let frozen = null; // the title at its stop, one canvas
	const layout = (ctx, w, h) => {
		if (!L || L.w !== w || L.h !== h || L.dpr !== board.dpr) {
			L = makeLayout(ctx, w, h, board.dpr, term);
			frozen = null;
		}
		return L;
	};
	const frozenFrame = (w, h) => {
		if (frozen) return frozen;
		const c = document.createElement('canvas');
		c.width = Math.round(w * board.dpr);
		c.height = Math.round(h * board.dpr);
		const x = c.getContext('2d');
		x.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
		term.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = c;
		return c;
	};

	// The pointer, live, for the cursor's shape over the slider only — what is
	// DRAWN never reads it (the hand has the drag). The host never disposes a
	// sketch, so the listeners stay; while no frame has been drawn for a while
	// (the sketch gone, or the tab hidden) they hand back only what they set —
	// the cursor, once — and otherwise do nothing, so they cannot fight
	// whatever is drawing now. `seen` starts at make(), not 0, or a pointer
	// already moving as the sketch starts finds it stale before its first frame.
	const ptr = { x: -1, y: -1, seen: performance.now() };
	const stale = () => performance.now() - ptr.seen > 600;
	let cursor = '';
	const setCursor = (c) => {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	};
	// An Enter on fewer than eight digits: the controller ignores it, as it
	// should; the form says why, the mask letters still to type lifting for a
	// moment (the second it was pressed, on the clock the caret blinks on).
	let rejectAt = -9;
	let last = null; // the hand at the last frame
	if (live) {
		window.addEventListener(
			'pointermove',
			(e) => {
				ptr.x = e.clientX;
				ptr.y = e.clientY;
				if (stale()) setCursor('');
			},
			{ passive: true }
		);
		window.addEventListener('keydown', (e) => {
			if (e.key !== 'Enter' || stale() || !last) return;
			if (last.asking === 'date' && (last.typed ?? '').length < 8)
				rejectAt = performance.now() / 1000;
		});
	}

	function render(ctx, w, h, t, hand) {
		const G = layout(ctx, w, h);
		ptr.seen = performance.now();
		last = hand;
		const fade = 1 - smooth(span(t, FADE[0], FADE[1]));

		// The title: typed by the terminal, then held at its stop. It steps
		// back a little as the form comes up under it.
		if (t < FREEZE) term.draw(ctx, w, h, t / 10, t, t - 10);
		else {
			const back = 1 - 0.32 * smooth(span(t, Q1, Q1 + 1.4));
			ctx.save();
			ctx.globalAlpha = back * fade;
			ctx.drawImage(frozenFrame(w, h), 0, 0, w, h);
			ctx.restore();
		}

		// The slider's geometry, for the pointer, every frame.
		answers.slider((cx, cy, phase) => {
			const x1 = G.notch(0);
			const x10 = G.notch(9);
			if (phase === 'down') {
				if (Math.abs(cy - G.Y(ROW.track)) > 0.75 * G.row) return null;
				if (cx < x1 - 1.4 * G.cell || cx > x10 + 1.4 * G.cell) return null;
			}
			return Math.max(1, Math.min(10, 1 + (9 * (cx - x1)) / (x10 - x1)));
		});

		if (t < FREEZE) return;
		form(ctx, G, t, hand, fade, FREEZE, live ? hand.secs - rejectAt : 9);

		// The cursor's shape over the track while the spice is asked.
		if (live) {
			const over =
				Math.abs(ptr.y - G.Y(ROW.track)) <= 0.75 * G.row &&
				ptr.x >= G.notch(0) - 1.4 * G.cell &&
				ptr.x <= G.notch(9) + 1.4 * G.cell;
			setCursor(hand.asking === 'spice' ? (hand.held ? 'grabbing' : over ? 'grab' : '') : '');
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

// ── The layout ───────────────────────────────────────────────────────────────
// The form sits on the title's left margin, a few lines under its last line,
// in the title's face at 0.8 of its size, on a pitch of its own.
function makeLayout(ctx, w, h, dpr, term) {
	const T = term.layout(ctx, w, h);
	const fs = Math.max(8, T.fs * 0.8);
	ctx.save();
	ctx.font = TECH(fs);
	const cell = ctx.measureText('0').width;
	const m = ctx.measureText('0');
	ctx.restore();
	// A cap's or a digit's centre is `mid` above its baseline.
	const mid = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
	const row = fs * 1.42;
	const x0 = T.out[0].x0;
	const y0 = T.out[2].y + T.step * 1.55;
	const X = (c) => x0 + c * cell;
	const Y = (k) => y0 + k * row;
	// 1-px strokes on the device's pixels.
	const lw = Math.max(1, Math.round(dpr)) / dpr;
	const odd = Math.round(lw * dpr) % 2 === 1;
	const snap = (v) => (odd ? (Math.floor(v * dpr) + 0.5) / dpr : Math.round(v * dpr) / dpr);
	// The track: notch 1 under the first cell's centre, notch 10 under the
	// last's, the nine gaps shared out evenly.
	const notch = (i) => X(0.5 + OFF) + (i * (W_BOX - 1) * cell) / 9;
	// The block (the caret, the handle, the reverse video): the terminal's,
	// a cell wide, from 0.78 of the size above the baseline to 0.14 below.
	const blockTop = (k) => Y(k) + mid - 0.78 * fs;
	const blockH = 0.92 * fs;
	return { w, h, dpr, fs, cell, mid, row, x0, y0, X, Y, lw, snap, notch, blockTop, blockH };
}

// ── The form ─────────────────────────────────────────────────────────────────
function form(ctx, G, t, hand, fade, freeze, sinceReject) {
	const p = t - Q1; // into the print
	const printed = PRINT.rows.map((r) => {
		let n = 0;
		while (n < r.n && r.times[n] <= p) n++;
		return n;
	});
	const n = (k) => printed[PRINT.rows.findIndex((r) => r.k === k)];
	const printing = p >= 0 && p < PRINT.end;
	const caretOn = (steady) => steady || (((hand.secs * BLINK) % 1) + 1) % 1 < DUTY;

	// The focus: the date's from the end of the print to its Enter, the
	// spice's from q2 to its Enter.
	const e1 = smooth(hand.enter1);
	const e2 = smooth(hand.enter2);
	const fDate = smooth(span(t, Q1 + PRINT.end, Q1 + PRINT.end + 0.35)) * (1 - e1);
	const fIn = smooth(span(t, Q2, Q2 + 0.5)); // the spice coming into focus
	const fSpice = fIn * (1 - e2);

	// ── The idle caret, before the print, on the form's first line ─────────
	if (p < 0 && t >= freeze + 0.25) {
		if (caretOn(false)) block(ctx, G, 0, ROW.label1, 0.85 * fade);
	}

	// ── The labels ─────────────────────────────────────────────────────────
	text(ctx, G, LABEL1, 0, ROW.label1, (0.5 + 0.3 * fDate) * fade, n(ROW.label1));
	text(ctx, G, LABEL2, 0, ROW.label2, (0.5 + 0.3 * fSpice) * fade, n(ROW.label2));

	// ── The date ───────────────────────────────────────────────────────────
	const typed = (hand.typed ?? '').slice(0, 8);
	// A date that cannot be: the box goes rose while it is being typed, and
	// back to chalk as its Enter is taken (the controller takes any eight).
	const wrong = typed.length === 8 && !hand.valid ? 1 - e1 : 0;
	const boxA = (0.3 + 0.6 * fDate) * fade * (1 + 0.1 * wrong);
	const boxColor = wrong > 0 ? mixHex(PAL.chalk, PAL.rose, wrong) : PAL.chalk;
	box(ctx, G, [n(ROW.top), n(ROW.mid), n(ROW.bot)], boxA, boxColor);
	// The digits, and the mask where none is typed yet; the segment being
	// typed into has its mask a little brighter, and an Enter too soon lifts
	// all that is left to type for a moment.
	const nMid = n(ROW.mid);
	const next = typed.length;
	const segOf = (i) => (i < 2 ? 0 : i < 4 ? 1 : 2);
	const nudge =
		sinceReject < 0 ? 0 : smooth(sinceReject / 0.06) * (1 - smooth((sinceReject - 0.12) / 0.4));
	for (let i = 0; i < 8; i++) {
		const c = DIGIT_COL[i];
		if (c >= nMid) continue;
		const at = c + OFF;
		if (i < typed.length) text(ctx, G, typed[i], at, ROW.mid, 0.92 * fade);
		else {
			const here = next < 8 && segOf(i) === segOf(next) ? 1 : 0;
			const a = 0.16 + 0.12 * here * fDate + 0.26 * nudge * fDate;
			text(ctx, G, MASK[i], at, ROW.mid, a * fade);
		}
	}
	// The caret in the field: in the next digit's cell (the mask letter in
	// the ground's colour on it, as a terminal's block shows what it is
	// over), or the cell after the year once all eight are in.
	if (fDate > 0.5 && hand.caret > 0 && caretOn(hand.steady > 0)) {
		const c = (next < 8 ? DIGIT_COL[next] : DIGIT_COL[7] + 1) + OFF;
		block(ctx, G, c, ROW.mid, 0.9 * fade * clamp01(2 * fDate - 1));
		if (next < 8)
			text(ctx, G, MASK[next], c, ROW.mid, fade * clamp01(2 * fDate - 1), 1, PAL.ground);
	}
	// Enter: a gold tick beside the box.
	tick(ctx, G, TICK + OFF, ROW.mid, hand.enter1, fade);

	// ── The spice ──────────────────────────────────────────────────────────
	slider(ctx, G, n(ROW.track), hand, fIn, fSpice, e2, fade);
	tick(ctx, G, TICK + OFF, ROW.track, hand.enter2, fade);

	// ── ▸ CONTINUE ─────────────────────────────────────────────────────────
	cont(ctx, G, n(ROW.go), e2, hand.enter2, fade);

	// ── The print's caret, riding the cell being printed ───────────────────
	// (the rows before it are done; the fields' rows are on their own cells).
	if (printing) {
		const i = printed.findIndex((c, j) => c < PRINT.rows[j].n);
		if (i >= 0) {
			const k = PRINT.rows[i].k;
			const field = k !== ROW.label1 && k !== ROW.label2 && k !== ROW.go;
			block(ctx, G, printed[i] + (field ? OFF : 0), k, 0.85 * fade);
		}
	}
}

// Mono type on the form's grid: `str` from cell `col` of row `k`, the first
// `upto` characters of it, each centred in its cell.
function text(ctx, G, str, col, k, alpha, upto = str.length, color = PAL.chalk) {
	if (alpha <= 0.004 || upto <= 0) return;
	ctx.save();
	ctx.font = TECH(G.fs);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = color;
	ctx.globalAlpha = Math.min(1, alpha);
	const y = G.Y(k) + G.mid;
	for (let i = 0; i < Math.min(upto, str.length); i++) {
		if (str[i] === ' ') continue;
		ctx.fillText(str[i], G.X(col + i + 0.5), y);
	}
	ctx.restore();
}

// The terminal's block, in cell `col` of row `k`.
function block(ctx, G, col, k, alpha, color = PAL.chalk) {
	if (alpha <= 0.004) return;
	ctx.save();
	ctx.globalAlpha = Math.min(1, alpha);
	ctx.fillStyle = color;
	ctx.fillRect(G.X(col), G.blockTop(k), G.cell, G.blockH);
	ctx.restore();
}

// ── The box ──────────────────────────────────────────────────────────────────
// The box-drawing characters as strokes through their cells, as a terminal
// draws them: a light line through the cell's middle, out to its edges (or
// to the next row's edge, for the uprights), so the cells join without a
// seam. One path for the whole box, stroked once.
const TOP = (c) => (c === 0 ? '┌' : c === W_BOX - 1 ? '┐' : c === 7 || c === 14 ? '┬' : '─');
const MID = (c) => (BORDER.includes(c) ? '│' : ' ');
const BOT = (c) => (c === 0 ? '└' : c === W_BOX - 1 ? '┘' : c === 7 || c === 14 ? '┴' : '─');

function glyphPath(ctx, G, ch, c, k) {
	const x = G.snap(G.X(c + 0.5 + OFF));
	const y = G.snap(G.Y(k));
	const l = G.X(c + OFF);
	const r = G.X(c + 1 + OFF);
	const u = G.Y(k - 0.5);
	const d = G.Y(k + 0.5);
	const H = (a, b) => {
		ctx.moveTo(a, y);
		ctx.lineTo(b, y);
	};
	const V = (a, b) => {
		ctx.moveTo(x, a);
		ctx.lineTo(x, b);
	};
	if (ch === '─') H(l, r);
	else if (ch === '│') V(u, d);
	else if (ch === '┌' || ch === '┐') {
		ctx.moveTo(ch === '┌' ? r : l, y);
		ctx.lineTo(x, y);
		ctx.lineTo(x, d);
	} else if (ch === '└' || ch === '┘') {
		ctx.moveTo(x, u);
		ctx.lineTo(x, y);
		ctx.lineTo(ch === '└' ? r : l, y);
	} else if (ch === '┬') {
		H(l, r);
		V(y, d);
	} else if (ch === '┴') {
		H(l, r);
		V(u, y);
	}
}

function box(ctx, G, counts, alpha, color) {
	if (alpha <= 0.004 || counts.every((c) => c <= 0)) return;
	ctx.save();
	ctx.globalAlpha = Math.min(1, alpha);
	ctx.strokeStyle = color;
	ctx.lineWidth = G.lw;
	ctx.lineCap = 'butt';
	ctx.lineJoin = 'miter';
	ctx.beginPath();
	const rows = [
		[TOP, ROW.top],
		[MID, ROW.mid],
		[BOT, ROW.bot]
	];
	rows.forEach(([of, k], j) => {
		for (let c = 0; c < Math.min(counts[j], W_BOX); c++) glyphPath(ctx, G, of(c), c, k);
	});
	ctx.stroke();
	ctx.restore();
}

// ── The slider ───────────────────────────────────────────────────────────────
// ├──┼──┼── … ──┤ : a light rule through the row, ten notches (the end ones
// taller), the part behind the handle drawn heavier, the handle a block, and
// the number right-aligned beside it. Printed with the row: the rule as far
// as the print has gone, the notches as it passes them, the handle and the
// number once it has reached them.
function slider(ctx, G, printed, hand, focusIn, focus, done, fade) {
	if (printed <= 0) return;
	const y = G.snap(G.Y(ROW.track));
	const reach = G.X(Math.min(printed, W_BOX - 0.5) + OFF);
	const x1 = G.notch(0);
	const v = Math.max(1, Math.min(10, hand.value ?? 1));
	const hx = lerp(G.notch(0), G.notch(9), (v - 1) / 9);
	const held = hand.held ? 1 : 0;
	// How lit the answer is: in full once the field has the focus, easing to a
	// little less as its Enter is taken (the answer stays legible; the chrome
	// steps back) — one way only, so the handle never blinks as it confirms.
	// `focus` (in, and out again at the Enter) is the chrome's alone.
	const ans = focusIn * lerp(1, 0.7, done);
	ctx.save();
	ctx.strokeStyle = PAL.chalk;
	ctx.lineCap = 'butt';
	// The rule.
	ctx.globalAlpha = (0.3 + 0.25 * focus) * fade;
	ctx.lineWidth = G.lw;
	ctx.beginPath();
	ctx.moveTo(x1, y);
	ctx.lineTo(Math.min(reach, G.notch(9)), y);
	ctx.stroke();
	// The notches.
	for (let i = 0; i < 10; i++) {
		const nx = G.snap(G.notch(i));
		if (nx > reach) break;
		const end = i === 0 || i === 9;
		const len = (end ? 0.34 : 0.2) * G.row;
		const passed = i + 1 <= v + 1e-3;
		ctx.globalAlpha = (0.3 + (passed ? 0.5 : 0.18) * ans) * fade;
		ctx.beginPath();
		ctx.moveTo(nx, y - len);
		ctx.lineTo(nx, y + len);
		ctx.stroke();
	}
	// The part behind the handle, heavier, once the field has the focus.
	if (ans > 0.01 && hx > x1 + 0.5 && reach >= G.notch(9)) {
		ctx.globalAlpha = 0.75 * ans * fade;
		ctx.lineWidth = 2 * G.lw;
		ctx.beginPath();
		ctx.moveTo(x1, y);
		ctx.lineTo(hx, y);
		ctx.stroke();
	}
	ctx.restore();
	if (printed < W_BOX) return;
	// The handle: the block, on whole pixels, a little taller in the hand;
	// the board's ground under it first, so the rule and the notches do not
	// show through it while it is dim.
	const bh = Math.round(G.blockH * (1 + 0.16 * held));
	const bw = Math.round(G.cell * (1 + 0.1 * held));
	const bx = Math.round(hx - bw / 2);
	const by = Math.round(G.Y(ROW.track) - bh / 2);
	ctx.save();
	ctx.globalAlpha = fade;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(bx - 1, by, bw + 2, bh);
	ctx.globalAlpha = Math.min(1, (0.34 + 0.58 * ans + 0.08 * held) * fade);
	ctx.fillStyle = PAL.chalk;
	ctx.fillRect(bx, by, bw, bh);
	ctx.restore();
	// The number, right-aligned to NUM_COL: the stop the handle is nearest.
	if (printed >= NUM_COL + 1) {
		const str = String(Math.round(v));
		const a = (0.38 + 0.56 * Math.max(focusIn, done)) * fade;
		text(ctx, G, str, NUM_COL + 1 - str.length + OFF, ROW.track, a);
	}
}

// ── A confirmation ───────────────────────────────────────────────────────────
// A gold tick, written on over an Enter's 0.45 s, centred on cell `col` of
// row `k`; it stays.
function tick(ctx, G, col, k, e, fade) {
	if (e <= 0) return;
	const s = 0.46 * G.fs;
	const cx = G.X(col);
	const cy = G.Y(k);
	const pts = [
		[cx - 0.62 * s, cy + 0.02 * s],
		[cx - 0.16 * s, cy + 0.46 * s],
		[cx + 0.66 * s, cy - 0.5 * s]
	];
	const a = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
	const b = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
	const f = smooth(e) * (a + b);
	ctx.save();
	ctx.globalAlpha = 0.9 * fade;
	ctx.strokeStyle = PAL.gold;
	ctx.lineWidth = 1.6 * G.lw;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	ctx.moveTo(pts[0][0], pts[0][1]);
	if (f <= a) ctx.lineTo(lerp(pts[0][0], pts[1][0], f / a), lerp(pts[0][1], pts[1][1], f / a));
	else {
		ctx.lineTo(pts[1][0], pts[1][1]);
		const g = (f - a) / b;
		ctx.lineTo(lerp(pts[1][0], pts[2][0], g), lerp(pts[1][1], pts[2][1], g));
	}
	ctx.stroke();
	ctx.restore();
}

// ── ▸ CONTINUE ───────────────────────────────────────────────────────────────
// Dim until the last Enter; then the ▸ goes gold and the word fills in
// reverse video, left to right, as a terminal shows a pressed button.
function cont(ctx, G, printed, lit, e, fade) {
	if (printed <= 0) return;
	const k = ROW.go;
	const a = (0.26 + 0.66 * lit) * fade;
	// The ▸, a small solid triangle in cell 0.
	const s = 0.36 * G.fs;
	const cx = G.X(0) + 0.5 * s + 1;
	const cy = G.Y(k);
	ctx.save();
	ctx.globalAlpha = Math.min(1, a);
	ctx.fillStyle = lit > 0.01 ? mixHex(PAL.chalk, PAL.gold, lit) : PAL.chalk;
	ctx.beginPath();
	ctx.moveTo(cx - 0.5 * s, cy - 0.62 * s);
	ctx.lineTo(cx + 0.62 * s, cy);
	ctx.lineTo(cx - 0.5 * s, cy + 0.62 * s);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	const n = Math.max(0, printed - 2);
	text(ctx, G, GO, 2, k, a, n);
	// The fill: the reverse video, swept from the word's left.
	const f = smooth(e);
	if (f <= 0 || n < GO.length) return;
	const pad = 0.5 * G.cell;
	const x0 = G.X(2) - pad;
	const W = GO.length * G.cell + 2 * pad;
	const y0 = G.blockTop(k) - 0.14 * G.fs;
	const H = G.blockH + 0.28 * G.fs;
	ctx.save();
	ctx.beginPath();
	ctx.rect(x0, y0, W * f, H);
	ctx.clip();
	ctx.globalAlpha = 0.9 * fade;
	ctx.fillStyle = PAL.chalk;
	ctx.fillRect(x0, y0, W, H);
	ctx.restore();
	ctx.save();
	ctx.beginPath();
	ctx.rect(x0, y0, W * f, H);
	ctx.clip();
	text(ctx, G, GO, 2, k, fade, GO.length, PAL.ground);
	ctx.restore();
}

function mixHex(a, b, t) {
	const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const A = p(a);
	const B = p(b);
	return `rgb(${A.map((x, i) => Math.round(lerp(x, B[i], t))).join(', ')})`;
}
