// ── Intro: plot — the machine plots you ──────────────────────────────────────
// The title card types as the terminal types it and freezes at its full stop
// (no zoom); then it lifts, dimmed, to be the chart's heading, and under it
// two chalk axes are drawn from one corner: a TIMELINE from 1900 to 2099 (its
// decades ticked faintly, 1900 · 2000 · 2099 under it) and a scale from 1 to
// 10 up its left end. A point waits at the corner. Under the chart, at the
// axes' foot, the two questions are rows of a form, the answers in a column:
//
//   when were you born?   dd · mm · yyyy
//   how spicy?            1
//
// The date is typed into its cells (the mask's letters give way to the
// digits, the terminal's block caret steps on) and, AS IT IS TYPED, the point
// slides along the timeline to the date so far: the year's first digit sends
// it to the middle of its century, the third to the middle of its decade, the
// fourth to the year — a faint bar on the timeline shows what the digits
// still allow, narrowing — and the day and month, typed first, place it
// within that year. A year the timeline cannot hold sends it to the end it is
// off, with a chevron past it; a date that cannot be leaves it a dashed ring.
// Enter: the field's rule is written in gold, the point flashes, and a faint
// vertical rises from it with ten small stops on it.
//
// "how spicy?": the point lifts off the timeline onto stop 1 and IS the
// handle — dragged up and down its vertical (a press anywhere on that line,
// or on the scale at the left, takes it), a dashed guide running from it to
// the scale; ↑ ↓ or ← →, a digit (0 is 10), Enter. It follows the pointer
// while held and snaps to the nearest stop when let go. Enter: the rule is
// written in gold and the point is LIT — one point in the plane — its guides
// settle into the chart's dashed drop lines, the year and the spice are read
// off the two axes, the form dims. A settle, a fade, round.
//
// Every frame is a pure function of t and the hand when scripted (the point's
// slide is a sum of eased steps at the keystrokes' times, found once from the
// demo's hand); live, the same eased steps are taken at the moments the keys
// arrive (a short memo of them, on the hand's clock). The title after its
// stop is one cached frame of the terminal.
//
// Beats, in seconds (21):
//    0 – 5.14   the terminal types the card; the full stop lands at 4.94
//   5.7 – 6.9   the card lifts to the top and dims
//   6.4 – 8.2   the axes are drawn from the corner; the ticks; the point
//   8.3         "when were you born?" — waits at 9.2 when live; Enter 11.5
//  11.7 – 12.5  the vertical rises from the point
//  12.3         "how spicy?" — the point lifts onto 1; waits at 13.2; Enter 15.5
//  16.0 – 17.2  the drop lines, the readouts; the form dims
//  19.8 – 20.8  fade; round

import {
	PAL,
	TAU,
	TECH_FONT,
	MATH_FONT,
	stroke,
	disc,
	math,
	span,
	smooth,
	lerp,
	clamp01
} from '../log/board.js';
import { lit } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';

export const meta = {
	title:
		'the machine plots you: a timeline and a scale, the date a point along one, the spice its height',
	order: 10,
	seconds: 21,
	beats: { q1: 8.3, wait1: 9.2, e1: 11.5, q2: 12.3, wait2: 13.2, e2: 15.5 }
};

const Q1 = 'when were you born?';
const Q2 = 'how spicy?';
const B = {
	...meta.beats,
	lift: [5.7, 6.9],
	timeline: [6.4, 7.6],
	vaxis: [6.7, 7.5],
	ticks: [7.0, 8.0],
	point: [7.8, 8.2],
	rise: [11.7, 12.5],
	up: [12.4, 12.95],
	drops: [16.0, 16.8],
	read: [16.2, 17.2],
	out: [19.8, 20.8]
};
const Y0 = 1900;
const Y1 = 2100; // the timeline's right end: the last moment of 2099
const TOP = 10.4; // the scale runs a little past 10
// The terminal's caret, as log-dawn's TERM: blinks a second, its duty.
const BLINK = 2.3;
const DUTY = 0.58;
// The mask, cell by cell: the date's ten cells, two of them separators.
const CELLS = ['d', 'd', '·', 'm', 'm', '·', 'y', 'y', 'y', 'y'];
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];

const mono = (s) => `400 ${s}px ${TECH_FONT}`;
const serif = (s) => `italic 400 ${s}px ${MATH_FONT}`;

// ── The date so far, as a place on the timeline ──────────────────────────────
// The year's digits so far allow a span of years; the point sits in its
// middle, the span shown as a bar. Four digits: the year, the day and month
// placing the point within it. Off the timeline: the end it is past.
function reading(typed) {
	const yd = typed.slice(4, 8);
	const n = yd.length;
	if (!n) return { x: Y0, lo: Y0, hi: Y0, off: 0, n };
	const lo = Number(yd.padEnd(4, '0'));
	const hi = Number(yd.padEnd(4, '9')) + 1;
	if (hi <= Y0) return { x: Y0, lo: Y0, hi: Y0, off: -1, n };
	if (lo >= Y1) return { x: Y1, lo: Y1, hi: Y1, off: 1, n };
	if (n === 4) {
		const day = Math.min(31, Math.max(1, Number(typed.slice(0, 2)) || 1));
		const month = Math.min(12, Math.max(1, Number(typed.slice(2, 4)) || 1));
		return { x: lo + (month - 1 + (day - 1) / 31) / 12, lo, hi: lo + 1, off: 0, n };
	}
	const a = Math.max(lo, Y0);
	const b = Math.min(hi, Y1);
	return { x: (a + b) / 2, lo: a, hi: b, off: 0, n };
}

// ── Eased steps ──────────────────────────────────────────────────────────────
// A value that moves to each new target with a critically damped step, so a
// keystroke SLIDES the point: the sum over the changes so far, each change's
// size times (1 + s/τ) e^{−s/τ} for its age s. A list of [t, target, change],
// read at any t (only the changes up to t count): scripted, built once from
// the demo's hand, so a frame is a function of t; live, pushed as the hand's
// targets change on its clock, the old steps (long settled) dropped.
const TAU_F = 0.075;
const step = (s) => (1 + s / TAU_F) * Math.exp(-s / TAU_F);
function makeFollow() {
	let list = [];
	let last = null;
	const same = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
	return {
		set(t, p) {
			list = [[t, p, p.map(() => 0)]];
			last = p;
		},
		push(t, p) {
			if (last && same(p, last)) return;
			if (!last || (list.length && t < list[list.length - 1][0])) {
				// the first value, or the clock ran back: start again here
				list = [[t, p, p.map(() => 0)]];
				last = p;
				return;
			}
			list.push([t, p, p.map((x, i) => x - last[i])]);
			last = p;
			if (list.length > 6)
				list = list.filter((e, i) => i === list.length - 1 || t - e[0] < 14 * TAU_F);
		},
		at(t) {
			let p = null;
			let x = null;
			for (const [ti, pi, di] of list) {
				if (ti > t && p) break;
				const g = ti > t ? 0 : step(t - ti);
				p = pi;
				x = x ? x.map((v, i) => v - di[i] * g) : di.map((d) => -d * g);
			}
			return p ? p.map((v, i) => v + x[i]) : [0, 0, 0];
		}
	};
}

export async function make({ board, answers, live }) {
	await Promise.all([
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const term = makeTerminal(0.8, { cmd: false });
	const FREEZE = term.stop + 0.2;

	// The point's slide along the timeline: [x, lo, hi] in years.
	const dateF = makeFollow();
	const spiceF = makeFollow();
	const at3 = (r) => [r.x, r.lo, r.hi];
	if (!live) {
		let prev = null;
		for (let i = 0; i <= (meta.seconds + 1.2) * 240; i++) {
			const typed = answers.hand(i / 240).typed;
			if (typed !== prev) dateF.push(i / 240, at3(reading(typed)));
			prev = typed;
		}
	}

	// The title, frozen: one frame of the terminal just after its stop.
	let frozen = null;
	function frozenFrame(w, h) {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		term.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	// The chart's geometry for a board: the title's margin is the scale's
	// line, and its far side the timeline's end.
	let G = null;
	function geo(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = term.layout(ctx, w, h);
		const fs = L.fs;
		const left = L.out[0].x0;
		const right = w - left;
		const titleY = Math.max(2.4 * fs, 0.12 * h);
		const dy = L.out[0].y - titleY;
		const topY = L.out[2].y - dy + 1.9 * L.step;
		const baseY = 0.74 * h;
		const unit = (baseY - topY) / TOP;
		const qs = Math.max(14, 0.84 * fs); // the questions
		const ms = Math.max(14, 0.86 * fs); // the answers
		const ls = Math.max(10, 0.5 * fs); // the axes' marks
		ctx.save();
		ctx.font = serif(qs);
		const qw = Math.max(ctx.measureText(Q1).width, ctx.measureText(Q2).width);
		ctx.font = mono(ms);
		const adv = ctx.measureText('0').width;
		ctx.restore();
		const row1 = baseY + Math.max(48, 2.5 * fs);
		G = {
			w,
			h,
			fs,
			left,
			right,
			dy,
			baseY,
			unit,
			qs,
			ms,
			ls,
			adv,
			cw: adv * 1.2, // a cell of the field
			ansX: left + qw + 1.4 * qs,
			row1,
			row2: row1 + 1.85 * qs,
			r: Math.max(3.2, 0.16 * fs), // the point
			X: (yr) => left + ((yr - Y0) / (Y1 - Y0)) * (right - left),
			Y: (v) => baseY - v * unit
		};
		return G;
	}

	return {
		resize() {
			G = null;
			frozen = null;
		},
		render(ctx, w, h, t, hand) {
			const g = geo(ctx, w, h);
			const { left, right, baseY, X, Y, r } = g;
			const F = 1 - smooth(span(t, B.out[0], B.out[1]));
			const now = live ? hand.secs : t;

			// ── The answers, as places ──────────────────────────────────────
			const R = reading(hand.typed);
			if (live) dateF.push(now, at3(R));
			const [dx, dlo, dhi] = dateF.at(now);
			let V = hand.value;
			if (live) {
				if (hand.held) spiceF.set(now, [hand.value]);
				else spiceF.push(now, [hand.value]);
				V = spiceF.at(now)[0];
			}
			V = Math.min(10, Math.max(1, V));
			const near = Math.round(V);
			const up = smooth(span(t, B.up[0], B.up[1]));
			const px = X(dx);
			const py = Y(V * up);
			const pxT = X(R.x);

			// The pointer: a press on the point's vertical (or on the scale)
			// takes the handle; the drag reads its height off the scale.
			answers.slider((cx, cy, phase) => {
				if (phase === 'down') {
					const inY = cy >= Y(TOP) - 24 && cy <= baseY + 24;
					const onLine = Math.abs(cx - pxT) <= Math.max(26, 0.03 * w);
					const onScale = Math.abs(cx - left) <= 26;
					if (!inY || (!onLine && !onScale)) return null;
				}
				return (baseY - cy) / g.unit;
			});

			// ── The title ───────────────────────────────────────────────────
			if (t < FREEZE) term.draw(ctx, w, h, t / 10, t, t - 10);
			else if (F > 0) {
				const lift = smooth(span(t, B.lift[0], B.lift[1]));
				ctx.save();
				ctx.globalAlpha = lerp(1, 0.36, lift) * F;
				ctx.drawImage(frozenFrame(w, h), 0, -g.dy * lift, w, h);
				ctx.restore();
			}
			if (t < B.timeline[0] || F <= 0) return;

			// ── The axes ────────────────────────────────────────────────────
			const read = smooth(span(t, B.read[0], B.read[1]));
			stroke(
				ctx,
				[
					[left, baseY],
					[right, baseY]
				],
				{ width: 1.2, alpha: 0.5 * F, upto: smooth(span(t, B.timeline[0], B.timeline[1])) }
			);
			stroke(
				ctx,
				[
					[left, baseY],
					[left, Y(TOP)]
				],
				{ width: 1.2, alpha: 0.5 * F, upto: smooth(span(t, B.vaxis[0], B.vaxis[1])) }
			);
			// The decades, under the timeline, in a wave from the corner;
			// the centuries longer.
			const tk = t - B.ticks[0];
			ctx.save();
			ctx.strokeStyle = PAL.chalk;
			ctx.lineWidth = 1;
			for (let k = 0; k <= 20; k++) {
				const a = smooth(span(tk, k * 0.03, k * 0.03 + 0.3));
				if (a <= 0) break;
				const c = k % 10 === 0;
				const x = X(Y0 + 10 * k);
				ctx.globalAlpha = (c ? 0.4 : 0.2) * a * F;
				ctx.beginPath();
				ctx.moveTo(x, baseY);
				ctx.lineTo(x, baseY + (c ? 7 : 4));
				ctx.stroke();
			}
			// The scale's stops, up its left side.
			for (let v = 1; v <= 10; v++) {
				const a = smooth(span(tk, 0.1 + v * 0.04, 0.4 + v * 0.04));
				if (a <= 0) break;
				ctx.globalAlpha = 0.32 * a * F;
				ctx.beginPath();
				ctx.moveTo(left, Y(v));
				ctx.lineTo(left - 5, Y(v));
				ctx.stroke();
			}
			ctx.restore();
			// Their marks: faint, and giving way to the readouts at the close.
			const marks = smooth(span(tk, 0.5, 1.0)) * F;
			const yr = (hand.typed || '').slice(4, 8);
			const lyY = baseY + 8 + 0.8 * g.ls;
			for (const [s, x] of [
				['1900', X(1900)],
				['2000', X(2000)],
				['2099', X(Y1)]
			]) {
				const clash = read * (1 - span(Math.abs(x - px), 2.6 * g.ls, 4 * g.ls));
				label(ctx, s, x, lyY, g.ls, 0.4 * marks * (1 - clash), 'center');
			}
			for (const v of [1, 10]) {
				const clash = read * (1 - span(Math.abs(Y(v) - py), 1.1 * g.ls, 1.8 * g.ls));
				label(ctx, String(v), left - 10, Y(v), g.ls, 0.4 * marks * (1 - clash), 'right');
			}

			// ── The date so far: the bar of what the digits allow ───────────
			const pa = smooth(span(t, B.point[0], B.point[1])) * F;
			const fixed = t >= B.e1;
			const barA = 0.55 * pa * (1 - smooth(span(t, B.e1, B.e1 + 0.5)));
			if (barA > 0.004 && dhi - dlo > 0.05) {
				const x0 = X(dlo);
				const x1 = X(dhi);
				stroke(
					ctx,
					[
						[x0, baseY],
						[x1, baseY]
					],
					{ width: 2.4, alpha: barA, cap: 'butt' }
				);
				for (const x of [x0, x1])
					stroke(
						ctx,
						[
							[x, baseY - 4],
							[x, baseY + 4]
						],
						{ width: 1, alpha: barA }
					);
			}
			// Off the timeline: a chevron past the end it is off.
			if (!fixed && R.off && pa > 0) {
				const ex = R.off < 0 ? left - 13 : right + 13;
				chevron(ctx, ex, baseY, 4.5, R.off < 0 ? 'left' : 'right', 0.55 * pa);
			}

			// ── The vertical, the stops on it, the guide to the scale ───────
			const rise = smooth(span(t, B.rise[0], B.rise[1]));
			const drop = smooth(span(t, B.drops[0], B.drops[1]));
			if (rise > 0) {
				const vx = X(dx);
				stroke(
					ctx,
					[
						[vx, baseY],
						[vx, Y(TOP)]
					],
					{ width: 1, alpha: 0.2 * F * (1 - drop), upto: rise }
				);
				ctx.save();
				ctx.strokeStyle = PAL.chalk;
				ctx.lineWidth = 1;
				for (let v = 1; v <= 10; v++) {
					const a = smooth(span(rise, v / TOP - 0.08, v / TOP)) * (1 - drop);
					if (a <= 0) continue;
					const under = hand.held && v === near ? 1 : 0;
					ctx.globalAlpha = (0.26 + 0.5 * under) * a * F;
					const k = 3 + 2 * under;
					ctx.beginPath();
					ctx.moveTo(vx - k, Y(v));
					ctx.lineTo(vx + k, Y(v));
					ctx.stroke();
				}
				ctx.restore();
				// The drop line under the point, once it is lit.
				if (drop > 0)
					stroke(
						ctx,
						[
							[vx, py],
							[vx, baseY]
						],
						{ width: 1, alpha: 0.38 * F, upto: drop, dash: [2, 4], cap: 'butt' }
					);
			}
			if (up > 0) {
				stroke(
					ctx,
					[
						[px, py],
						[left, py]
					],
					{ width: 1, alpha: (0.3 + 0.08 * drop) * up * F, dash: [2, 4], cap: 'butt' }
				);
				// The stop the guide meets on the scale, brighter.
				const close = 1 - clamp01(Math.abs(V - near) * 2.2);
				stroke(
					ctx,
					[
						[left - 8, Y(near)],
						[left, Y(near)]
					],
					{ width: 1.3, alpha: 0.8 * close * up * F }
				);
			}

			// ── The point ───────────────────────────────────────────────────
			if (pa > 0) {
				const e1 = hand.enter1 > 0 && hand.enter1 < 1 ? Math.sin(Math.PI * hand.enter1) : 0;
				const e2 = hand.enter2 > 0 && hand.enter2 < 1 ? Math.sin(Math.PI * hand.enter2) : 0;
				if (hand.enter2 > 0) {
					// One point in the plane, lit.
					lit(ctx, px, py, r * 0.9 * (1 + 0.5 * e2), 0.9 * F);
				} else if (fixed) {
					disc(ctx, px, py, r, { fill: PAL.chalk, alpha: 0.95 * pa });
					if (e1 > 0) lit(ctx, px, py, r * 0.75 * (1 + 0.3 * e1), 0.65 * e1 * pa);
					// The handle's ring: brighter and wider in the hand.
					const on = up * (hand.asking === 'spice' || hand.held ? 1 : 0);
					if (on > 0)
						ring(ctx, px, py, r * (2.2 + 0.6 * hand.held), (0.22 + 0.4 * hand.held) * on * F);
					// Which way it goes, while it waits for the hand.
					if (hand.asking === 'spice' && !hand.held) {
						const ca = 0.42 * up * F;
						if (V < 9.95) chevron(ctx, px, py - r * 4.2, 3.6, 'up', ca);
						if (V > 1.05) chevron(ctx, px, py + r * 4.2, 3.6, 'down', ca);
					}
				} else if (R.n === 4 && !R.off && (hand.typed.length < 8 || hand.valid)) {
					disc(ctx, px, py, r, { fill: PAL.chalk, alpha: 0.9 * pa });
				} else {
					const bad = hand.typed.length === 8 && !hand.valid;
					ring(ctx, px, py, r, (bad ? 0.55 : 0.75) * pa, bad ? [2, 2.5] : null);
				}
			}

			// ── The readouts, at the close ──────────────────────────────────
			if (read > 0) {
				label(ctx, yr, px, lyY, g.ls, 0.85 * read * F, 'center');
				label(ctx, String(near), left - 10, py, g.ls, 0.85 * read * F, 'right');
			}

			// ── The form, at the axes' foot ─────────────────────────────────
			const dim = (1 - 0.62 * smooth(hand.done)) * F;
			// The date.
			if (hand.q1 > 0) {
				math(ctx, Q1, left, g.row1, { size: g.qs, upto: hand.q1, alpha: 0.72 * dim });
				const show = smooth(span(hand.q1, 0.4, 1)) * dim;
				dateField(ctx, g, hand, show);
			}
			// The spice.
			if (hand.q2 > 0) {
				math(ctx, Q2, left, g.row2, { size: g.qs, upto: hand.q2, alpha: 0.72 * dim });
				const show = smooth(span(hand.q2, 0.4, 1)) * dim;
				if (show > 0) {
					const { ansX, row2, ms, cw } = g;
					label(ctx, String(near), ansX + (cw - g.adv) / 2, row2, ms, 0.95 * show, 'left');
					const ry = row2 + 0.68 * ms;
					rule(ctx, ansX, ansX + 2 * cw, ry, 0.2 * show);
					if (hand.enter2 > 0) goldRule(ctx, ansX, ansX + 2 * cw, ry, hand.enter2, show);
					if (hand.asking === 'spice' && !hand.held)
						enterMark(ctx, ansX + 2 * cw + 0.7 * cw, row2, ms, 0.32 * show);
				}
			}
		}
	};
}

// ── The date's field ─────────────────────────────────────────────────────────
// Ten mono cells at the answers' column: the typed digits whole, the mask's
// letters faint in the cells to come, the separators dim; the terminal's
// block caret in the next cell (a bar at the end once all eight are in),
// steady within a keystroke, blinking on the hand's clock otherwise. Its rule
// is written in gold on Enter.
function dateField(ctx, g, hand, a) {
	if (a <= 0.004) return;
	const { ansX, row1, ms, cw, adv } = g;
	const typed = hand.typed.slice(0, 8);
	const cx = (c) => ansX + c * cw + cw / 2;
	const bad = typed.length === 8 && !hand.valid;
	ctx.save();
	ctx.font = mono(ms);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	CELLS.forEach((m, c) => {
		const d = DIGIT_CELL.indexOf(c);
		if (d < 0) {
			ctx.globalAlpha = 0.4 * a;
			ctx.fillText(m, cx(c), row1);
		} else if (d < typed.length) {
			ctx.globalAlpha = (bad ? 0.6 : 0.95) * a;
			ctx.fillText(typed[d], cx(c), row1);
		} else {
			ctx.globalAlpha = 0.2 * a;
			ctx.fillText(m, cx(c), row1);
		}
	});
	ctx.restore();
	const end = ansX + CELLS.length * cw;
	const ry = row1 + 0.68 * ms;
	rule(ctx, ansX, end, ry, 0.2 * a);
	if (hand.enter1 > 0) goldRule(ctx, ansX, end, ry, hand.enter1, a);
	if (hand.caret > 0 && hand.enter1 <= 0) {
		const on = hand.steady > 0 || (((hand.secs * BLINK) % 1) + 1) % 1 < DUTY;
		if (on) {
			ctx.save();
			ctx.globalAlpha = 0.85 * a;
			ctx.fillStyle = PAL.chalk;
			const hgt = 0.92 * ms;
			if (typed.length < 8) {
				const bx = cx(DIGIT_CELL[typed.length]);
				ctx.fillRect(bx - adv / 2, row1 - hgt / 2, adv, hgt);
			} else ctx.fillRect(end + 2, row1 - hgt / 2, 1.6, hgt);
			ctx.restore();
		}
	}
	if (hand.asking === 'date' && typed.length === 8)
		enterMark(ctx, end + 0.9 * cw, row1, ms, (bad ? 0.22 : 0.32) * a);
}

// ── Small strokes ────────────────────────────────────────────────────────────
function label(ctx, s, x, y, size, alpha, align) {
	if (alpha <= 0.004 || !s) return;
	ctx.save();
	ctx.font = mono(size);
	ctx.textAlign = align;
	ctx.textBaseline = 'middle';
	ctx.globalAlpha = alpha;
	ctx.fillStyle = PAL.chalk;
	ctx.fillText(s, x, y);
	ctx.restore();
}

function rule(ctx, x0, x1, y, alpha) {
	stroke(
		ctx,
		[
			[x0, y],
			[x1, y]
		],
		{ width: 1, alpha, cap: 'butt' }
	);
}

// The confirmation: the rule written in gold, a little glow while it writes.
function goldRule(ctx, x0, x1, y, p, alpha) {
	stroke(
		ctx,
		[
			[x0, y],
			[x1, y]
		],
		{ color: PAL.gold, width: 1.6, alpha: 0.85 * alpha, upto: smooth(p), glow: 6 * (1 - p) }
	);
}

function ring(ctx, x, y, r, alpha, dash = null) {
	if (alpha <= 0.004) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = PAL.chalk;
	ctx.lineWidth = 1.2;
	if (dash) ctx.setLineDash(dash);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU);
	ctx.stroke();
	ctx.restore();
}

function chevron(ctx, x, y, s, dir, alpha) {
	const P = {
		up: [
			[x - s, y + s / 2],
			[x, y - s / 2],
			[x + s, y + s / 2]
		],
		down: [
			[x - s, y - s / 2],
			[x, y + s / 2],
			[x + s, y - s / 2]
		],
		left: [
			[x + s / 2, y - s],
			[x - s / 2, y],
			[x + s / 2, y + s]
		],
		right: [
			[x - s / 2, y - s],
			[x + s / 2, y],
			[x - s / 2, y + s]
		]
	}[dir];
	stroke(ctx, P, { width: 1.2, alpha });
}

// Enter, as the key's own mark: a hooked arrow, drawn in strokes.
function enterMark(ctx, x, y, size, alpha) {
	if (alpha <= 0.004) return;
	const s = size * 0.36;
	stroke(
		ctx,
		[
			[x + s, y - s],
			[x + s, y + s * 0.35],
			[x - s, y + s * 0.35]
		],
		{ width: 1.1, alpha }
	);
	chevron(ctx, x - s + s * 0.2, y + s * 0.35, s * 0.42, 'left', alpha);
}
