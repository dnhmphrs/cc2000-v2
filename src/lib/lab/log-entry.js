import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	PAL,
	TECH_FONT,
	MATH_FONT,
	span,
	smooth,
	lerp,
	clock,
	tag
} from './log/board.js';
import { lit } from './log/ink.js';
import { makeEntry, HAND } from './log/entry.js';

// ── Sketch: log-entry — the data entry, on the lattice ───────────────────────
// One beat of flow-conception's run on its own: the two answers taken as fields
// ON the lattice (log/entry.js), the structure answering the data. A faint
// square grid — the terminal's cells, as the flow leaves them — with the
// origin lit at its centre, the full stop. "when were you born?" is asked
// over a row of ten cells two rows up; the date is typed in, cell by cell,
// and on Enter the row lights gold as the real axis and the first family of
// lines, the horizontals, writes out from it across the board: the first
// period is set. "how spicy?" is asked over a track three rows down, ten
// stops that are ten lattice points; the handle is pressed, dragged from 1
// to 7 and let go, and as it moves the second family of lines LEANS with it
// — Re τ from −½ at 1 to +½ at 10, Im τ = 1 — and the fundamental cell 0, 1,
// 1 + τ, τ is drawn round the origin with its gluings marked (one chevron on
// the τ-sides, two on the 1-sides, log-abelian's): the second period is set
// by the hand, live. Enter, and the lattice is Λ(τ), held. Twelve seconds,
// a pure function of progress: ?at= pins any frame. The demo's hand is the
// kit's script; the kit draws any state, so the site can drive it later.

const SECONDS = 12;
// The beats, in seconds; the typing takes HAND.typing (≈1.7 s) from type1,
// the drag HAND.press + HAND.drag + HAND.release from drag2.
const B = { q1: 0.5, type1: 1.6, e1: 3.7, q2: 5.0, drag2: 6.4, e2: 8.3 };
const DATE_ROW = 2;
const SLIDER_ROW = -3;
const LEFT = -5;

export default async function make({ at }) {
	const b = getBoard();
	const time = clock(SECONDS, at);
	try {
		await Promise.all([
			document.fonts.load(`400 24px ${TECH_FONT}`),
			document.fonts.load(`italic 400 24px ${MATH_FONT}`)
		]);
	} catch {
		/* the fallback faces, then */
	}
	const entry = makeEntry();
	const cost = { ms: 0, n: 0 };

	function render() {
		const t0 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		const S = entry.script(t, B);
		const px = Math.round(Math.min(w / 24, h / 15));
		const view = makeView({ w, h, scale: px, cx: w / 2, cy: h / 2 + 0.5 * px });
		// The second family leans with the handle once the slider is up.
		const up2 = smooth(span(S.q2, 0.35, 1));
		const lean = ((S.value - 5.5) / 9) * up2;
		lattice(ctx, view, w, h, t, S, lean, up2);
		entry.date.draw(
			ctx,
			view,
			{ x: LEFT, y: DATE_ROW, cell: 1 },
			{
				typed: S.typed,
				caret: S.caret,
				steady: S.steady,
				q: S.q1,
				enter: S.enter1,
				alpha: lerp(1, 0.6, smooth(span(t, B.q2, B.q2 + 0.6))),
				secs: t,
				lean
			}
		);
		entry.slider.draw(
			ctx,
			view,
			{ x: LEFT, y: SLIDER_ROW, cell: 1 },
			{ value: S.value, held: S.held, q: S.q2, enter: S.enter2, alpha: 1 }
		);
		tag(ctx, w, h, 'log-entry');
		cost.n++;
		cost.ms += (performance.now() - t0 - cost.ms) * 0.1;
	}

	return {
		info: { seconds: SECONDS, beats: B, hand: HAND, cost },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// Many segments at one alpha and width, one path.
function lines(ctx, segs, { color = PAL.chalk, width = 1, alpha = 1 } = {}) {
	if (alpha <= 0.004 || !segs.length) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.beginPath();
	for (const [p, q] of segs) {
		ctx.moveTo(p[0], p[1]);
		ctx.lineTo(q[0], q[1]);
	}
	ctx.stroke();
	ctx.restore();
}

// The lattice: the faint square grid the terminal leaves; the horizontals
// written out from the date's row on its Enter; the second family leaning
// with the slider; the fundamental cell with its chevrons as the drag
// begins; the origin lit throughout.
function lattice(ctx, view, w, h, t, S, lean, up2) {
	const px = view.scale;
	const cols = Math.ceil(w / px / 2) + 10;
	const rows = Math.ceil(h / px / 2) + 2;
	const P = (x, y) => view.to([x, y]);
	// The faint grid: both families square, the verticals giving way to the
	// leaning family as the slider comes up.
	const faint = [];
	for (let r = -rows; r <= rows; r++) faint.push([P(-cols, r), P(cols, r)]);
	lines(ctx, faint, { alpha: 0.1 });
	const vert = [];
	for (let c = -cols; c <= cols; c++) vert.push([P(c, -rows), P(c, rows)]);
	lines(ctx, vert, { alpha: 0.1 * (1 - up2) });
	// The first family, written out from the date's row, row by row.
	const lit1 = [];
	for (let r = -rows; r <= rows; r++) {
		const d = Math.abs(r - DATE_ROW);
		const p = smooth(span(t, B.e1 + 0.1 + 0.07 * d, B.e1 + 0.7 + 0.07 * d));
		if (p <= 0) continue;
		const reach = p * cols;
		lit1.push([P(-reach, r), P(reach, r)]);
	}
	lines(ctx, lit1, { alpha: 0.24, width: 1.2 });
	// The second family, through the columns, leaning by Re τ.
	if (up2 > 0) {
		const second = [];
		for (let c = -cols; c <= cols; c++)
			second.push([P(c - rows * lean, -rows), P(c + rows * lean, rows)]);
		lines(ctx, second, { alpha: 0.24 * up2, width: 1.2 });
	}
	// The fundamental cell 0, 1, 1 + τ, τ and its gluings, as the drag begins.
	const cell = smooth(span(t, B.drag2 - 0.4, B.drag2 + 0.5));
	if (cell > 0) {
		const Q = (a, b) => P(a + b * lean, b);
		const edge = (pts, p) =>
			stroke(ctx, pts, { color: PAL.chalk, width: 2.2, alpha: 0.95, upto: p });
		edge([Q(0, 0), Q(1, 0)], span(cell, 0, 0.25));
		edge([Q(1, 0), Q(1, 1)], span(cell, 0.25, 0.5));
		edge([Q(1, 1), Q(0, 1)], span(cell, 0.5, 0.75));
		edge([Q(0, 1), Q(0, 0)], span(cell, 0.75, 1));
		const marks = smooth(span(t, B.drag2 + 0.3, B.drag2 + 0.6));
		if (marks > 0) {
			const ea = 0.11;
			const eb = 0.14;
			const chev = (pts) => stroke(ctx, pts, { color: PAL.chalk, width: 2, alpha: 0.9 * marks });
			for (const a0 of [0, 1]) chev([Q(a0 - ea, 0.5 - eb), Q(a0, 0.5), Q(a0 + ea, 0.5 - eb)]);
			for (const b0 of [0, 1])
				for (const s of [-0.1, 0.1])
					chev([Q(0.5 + s - eb, b0 - ea), Q(0.5 + s, b0), Q(0.5 + s - eb, b0 + ea)]);
		}
		for (const [a, b] of [
			[1, 0],
			[1, 1],
			[0, 1]
		]) {
			const [x, y] = Q(a, b);
			disc(ctx, x, y, 0.06 * px, { fill: PAL.chalk, alpha: 0.9 * cell });
		}
	}
	// The origin: the full stop, lit.
	const [ox, oy] = P(0, 0);
	lit(ctx, ox, oy, 0.075 * px, 0.95);
}
