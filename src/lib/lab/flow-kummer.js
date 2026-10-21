import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	PAL,
	TAU,
	TECH_FONT,
	MATH_FONT,
	span,
	smooth,
	lerp,
	clock,
	variant,
	tag
} from './log/board.js';
import { orbit } from './log/space.js';
import { lit, impact } from './log/ink.js';
import { makeTerminal } from './log-dawn.js';
import { DECADES, loadRooms } from './log/rooms.js';
import { makeEntry, DEMO } from './log/entry.js';
import { makeFall, orderOf } from './log/fall.js';
import {
	makeStructure,
	geometry,
	cameraAt,
	paramsAt,
	drawCone,
	tauOf,
	HALF
} from './log/kummer.js';

// ── Flow: flow-kummer — the lattice, the fold, the node, the fall ────────────
// One run of the site on the board, in chalk, round ONE idea: conception is
// the fixed point of a fold. The data make a lattice Λ = ℤ + ℤτ in ℂ; the
// plane folds into the torus ℂ/Λ; the torus folds in half under z ↦ −z,
// whose four fixed points — the half-points — are the nodes of the quotient
// (the pillowcase); the lens goes into the origin's node, which is a cone,
// which from inside is a tunnel; the flash is the lens passing through it,
// and the chalk fall drops down the tunnel with the structure streaming
// behind, colour arriving as you fall.
//
// Every transition is continuous. The terminal's full stop is the lattice's
// ORIGIN and its lines are the lattice's ROWS: the terminal's own cells come
// up under the sentence (its character columns, its line rows), the sentence
// goes and takes the character columns with it, and what is left is a square
// lattice at the line pitch with the stop lit at its origin — no zoom into
// the dot; the lens drifts so the origin is centred. The data entry is ON
// that lattice (log/entry.js): the date typed into ten cells standing on a
// row, whose Enter makes that row the real axis — the rows write out from it
// in the lattice's ink, the first period set; the slider's ten stops are ten
// lattice points, and the second family LEANS with the handle as it is
// dragged, Re τ from −½ at 1 to +½ at 10, the fundamental cell 0, 1, 1 + τ,
// τ drawn round the origin with its gluings as the drag begins: the second
// period set by the hand. Enter, and the structure closes (log/kummer.js):
// the cell rolls into a tube as the lens lifts off, the tube bends into the
// torus shedding the shear so z + τ lands on z, the torus half-turns about
// its skewer — the involution — the four half-points lit gold as the only
// points it leaves where they are and six sample points riding it with a
// chord each to their mirror's place, the torus folds onto itself (the lid,
// the rims pinched to the skewer: the pillow), the lens comes on to the
// origin's node, a cone grows there and the lens flies in: the rings pass,
// the light at the apex grows, THE FLASH. Then the chalk fall (log/fall.js,
// flow-chalk's fall exactly) — the first plate hangs where the light was,
// at the lens's vanishing point, and the structure goes on streaming behind
// the plates as the fall's background: the cone's rings and generatrices at
// the fall's own zoom (one code path through the flash, `drawCone` with a
// lens that goes on down the axis at D = D_flash · e^{−zoom}), the pillow's
// remains behind them fading over the first seconds — and colour arrives as
// you fall, each room deeper carrying more, the answer's in full with its
// glass lit at the landing; the swimmer only here, leading through the first
// glass or two.
//
// Beats, in seconds (48; a pure function of progress, ?at= pins any frame):
//    0 – 4.94   the terminal (log-dawn's, no command line): the sentence, the
//               full stop lands at 4.94 (its own clock), the frame freezes a
//               fifth of a second after
//   5.3 – 6.1   the stop lights as the origin (the kit's lit point)
//   5.7 – 7.0   the terminal's cells come up under the sentence
//   6.3 – 7.6   the sentence fades off the grid
//   7.0 – 8.2   the character columns go with it; the square lattice is left
//   6.8 – 8.4   the lens drifts so the origin sits at the centre
//   8.5 – 12.1  "when were you born?" — typed 9.6–11.1, Enter 11.6, the rows
//               write out from the date's row 11.7–13
//  12.9 – 17.0  "how spicy?" — the family leans to 1 as the slider comes up,
//               the handle pressed 14.3, dragged 14.5–15.6 to 7 and let go,
//               the cell and its chevrons drawn round the origin as the drag
//               begins, Enter 16.5
//  16.1         the lattice is handed to the structure kit (τ is settled; the
//               same ink, so no seam)
//  17.6 – 18.8  the questions and the answers fade off the lattice
//  19 – 31      the structure beat (log/kummer.js STAGE over these 12 s):
//               roll 20.2–22.6, bend 22.6–25.2, the half-turn 25.7–27.6, the
//               lid 27.6–28.6, the pinch 28.4–29.3, the cone 28.8–30, the dive
//               29.6–31
//  31           THE FLASH (ink.js impact), the light filling the frame from
//               30.5 and lingering to 31.4
//  31 – 42.6    the fall through six chalk rooms, the cone streaming, the
//               pillow's remains fading 31–33.5, the swimmer 31.1–35.2, the
//               landing slide 40.6–42.6, colour along the way, the glass lit
//  42.6 – 48    the answer's room, held, swaying on its depths
//
// ?decade=50s|60s|90s|10s picks the room to land in (the 1990s, the answer's,
// by default). ?v=pillow|quartic: pillow is the run — the quotient of the
// torus, exact; quartic swaps in Kummer's quartic with its sixteen nodes
// after the turn and dives into the one furthest along the skewer, kept to
// look at. The rate of zoom steps at the flash: the dive arrives fast (its
// log-rate only grows) and the fall opens at its own pace and gathers; the
// scale and the vanishing point are continuous, and the flash covers the
// step. What is exact and what is a picture: the kit headers (log/entry.js,
// log/kummer.js, log/fall.js).

const SECONDS = 48;
const B = {
	light: [5.3, 6.1],
	cells: [5.7, 7.0],
	text: [6.3, 7.6],
	square: [7.0, 8.2],
	pan: [6.8, 8.4],
	q1: 8.5,
	type1: 9.6,
	e1: 11.6,
	q2: 12.9,
	drag2: 14.5,
	e2: 16.5,
	kit: 16.1,
	fields: [17.6, 18.8],
	fold: [19.0, 31.0],
	flash: 31.0,
	fall: [31.0, 42.6],
	land: [40.6, 42.6],
	colour: [41.0, 43.2],
	swim: [31.1, 35.2],
	remains: [31.0, 33.5]
};
// The fields on the lattice: the date's ten cells standing on row +2 from
// column −5, the slider's ten stops on row −3 from column −5 (ten lattice
// points, so the track is centred half a cell left of the date).
const DATE_ROW = 2;
const SLIDER_ROW = -3;
const LEFT = -5;
// The structure kit's ink, as its batches quantise it (alpha in fourteenths,
// width in quarters: 0.24 → 3/14, 1.2 → 1.25; 0.95 → 13/14, 2.2 → 2.25), so
// the lattice drawn by hand here and by the kit from B.kit are one drawing.
const INK = {
	line: 3 / 14,
	lineW: 1.25,
	edge: 13 / 14,
	edgeW: 2.25,
	chev: 13 / 14,
	chevW: 2,
	point: 0.5,
	faint: 0.1 // the terminal's grid
};

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const v = variant(['pillow', 'quartic']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-kummer · loading the rooms');
	const t0 = performance.now();
	// The faces first, so the terminal's layout is measured on the real one.
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const term = makeTerminal(0.8, { cmd: false });
	const FREEZE = term.stop + 0.2;
	const entry = makeEntry();
	const tau = tauOf(DEMO.spice);
	const S = makeStructure({ tau, variant: v });
	const order = orderOf(decade);
	const fall = makeFall({
		art,
		order,
		beats: { fall: B.fall, land: B.land, colour: B.colour, swim: B.swim }
	});
	const cost = { ms: 0, n: 0, max: 0 };
	const nest0 = fall.geometry(b.w, b.h);
	const info = {
		seconds: SECONDS,
		decade,
		variant: v,
		rooms: order,
		beats: B,
		stop: term.stop,
		pitch: Number(term.layout(b.ctx, b.w, b.h).step.toFixed(2)),
		efolds: Number(nest0.TOTAL.toFixed(2)),
		rate0: Number(nest0.rate0.toFixed(3)),
		missing: art.missing,
		loadMs: Math.round(performance.now() - t0),
		cost
	};
	let L = null; // the terminal's layout: the lattice's pitch and origin
	let frozen = null; // the terminal's last frame, cached
	let G = null; // the structure's geometry for this board

	// The terminal's frame at the freeze — the sentence and the landed stop —
	// drawn once into a canvas of the board's size, to fade off the grid.
	function frozenFrame() {
		if (frozen) return frozen;
		const c = document.createElement('canvas');
		c.width = Math.round(b.w * b.dpr);
		c.height = Math.round(b.h * b.dpr);
		const x = c.getContext('2d');
		x.setTransform(b.dpr, 0, 0, b.dpr, 0, 0);
		term.draw(x, b.w, b.h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = c;
		return c;
	}

	function render() {
		const t1 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (!L || L.w !== w || L.h !== h) {
			L = term.layout(ctx, w, h);
			frozen = null;
			G = geometry(tau, {
				w,
				h,
				cellPx: L.step,
				origin: [w / 2, h / 2],
				variant: v,
				quartic: S.Q
			});
		}
		if (t < FREEZE) term.draw(ctx, w, h, t / 10, t, t - 10);
		else if (t < B.flash) approach(ctx, w, h, t);
		else descent(ctx, w, h, t);
		tag(ctx, w, h, v === 'pillow' ? 'flow-kummer' : `flow-kummer · ${v}`);
		const ms = performance.now() - t1;
		cost.n++;
		cost.ms += (ms - cost.ms) * 0.1;
		if (ms > cost.max) cost.max = ms;
	}

	// ── From the stop to the flash ───────────────────────────────────────────
	// The lattice (by hand to B.kit, the kit's from there, the structure beat
	// on it), the sentence frozen and fading over it, the origin lit, the two
	// fields, and the light at the end of the dive.
	function approach(ctx, w, h, t) {
		const p = L.step;
		const pan = smooth(span(t, ...B.pan));
		const ox = lerp(L.stop.x, w / 2, pan);
		const oy = lerp(L.stop.y, h / 2, pan);
		const view = makeView({ w, h, scale: p, cx: ox, cy: oy });
		const hand = entry.script(t, B);
		// The second family leans with the handle once the slider is up.
		const up2 = smooth(span(hand.q2, 0.35, 1));
		const lean = tauOf(hand.value)[0] * up2;
		const u = span(t, ...B.fold);
		const P = paramsAt(u, v);

		if (t < B.kit) lattice2d(ctx, w, h, t, view, lean, up2);
		else {
			const cam = cameraAt(u, G);
			S.draw(ctx, w, h, { ...P, write: 1, cell: 1, cam, G, origin: t < B.fold[0] ? 0 : 1 });
		}

		// The sentence, frozen at the stop, fading off the grid as it drifts.
		const textA = 1 - smooth(span(t, ...B.text));
		if (textA > 0.004) {
			ctx.save();
			ctx.globalAlpha = textA;
			ctx.translate(ox - L.stop.x, oy - L.stop.y);
			ctx.drawImage(frozenFrame(), 0, 0, w, h);
			ctx.restore();
		}
		// The origin: the full stop lit, growing from the chalk dot to the
		// kit's point; the structure draws it itself from the fold on.
		if (t < B.fold[0]) {
			const li = smooth(span(t, ...B.light));
			lit(ctx, ox, oy, lerp(L.stop.r, 5.5, li), smooth(span(li, 0, 0.5)));
		}

		// The fields, on the lattice.
		const fieldsA = 1 - smooth(span(t, ...B.fields));
		if (t >= B.q1 && fieldsA > 0.01) {
			entry.date.draw(
				ctx,
				view,
				{ x: LEFT, y: DATE_ROW, cell: 1 },
				{
					typed: hand.typed,
					caret: hand.caret,
					steady: hand.steady,
					q: hand.q1,
					enter: hand.enter1,
					alpha: fieldsA * lerp(1, 0.6, smooth(span(t, B.q2, B.q2 + 0.6))),
					secs: t,
					lean
				}
			);
			entry.slider.draw(
				ctx,
				view,
				{ x: LEFT, y: SLIDER_ROW, cell: 1 },
				{ value: hand.value, held: hand.held, q: hand.q2, enter: hand.enter2, alpha: fieldsA }
			);
		}

		// The light at the end of the dive, and the flash's attack.
		fillLight(ctx, w / 2, h / 2, w, h, t);
		impact(ctx, w, h, w / 2, h / 2, 0.4 * h, (t - B.flash) / 10, 0, 1, true);
	}

	// The lattice by hand, from the terminal's cells to Λ(τ): the character
	// columns (from the sentence's left edge) and the line rows through the
	// origin; the columns go with the sentence and the square lattice's come
	// up at the line pitch; the rows write out from the date's row to the
	// lattice's ink on its Enter; the second family leans with the slider and
	// the points come up with it; the cell with its gluings and the four
	// half-points as the drag begins. The same numbers as the kit's draw at
	// u = 0 (INK), so the handover at B.kit is one drawing.
	function lattice2d(ctx, w, h, t, view, lean, up2) {
		const p = view.scale;
		const ox = view.cx;
		const cols = Math.ceil(w / p / 2) + 10;
		const rows = Math.ceil(h / p / 2) + 3;
		const P = (x, y) => view.to([x, y]);
		const cells = smooth(span(t, ...B.cells));
		const sq = smooth(span(t, ...B.square));
		// The terminal's character columns.
		const fineA = 0.08 * cells * (1 - sq);
		if (fineA > 0.004) {
			const dx = ox - L.stop.x;
			const segs = [];
			for (let x = L.x0 + dx; x > -1; x -= L.cell)
				segs.push([
					[x, 0],
					[x, h]
				]);
			for (let x = L.x0 + dx + L.cell; x < w + 1; x += L.cell)
				segs.push([
					[x, 0],
					[x, h]
				]);
			lines(ctx, segs, { alpha: fineA, width: INK.lineW });
		}
		// The rows: faint, then written out from the date's row on its Enter —
		// the written part stacked on the faint to the lattice's ink.
		const faint = INK.faint * cells;
		const rowSegs = [];
		for (let r = -rows; r <= rows; r++) rowSegs.push([P(-cols, r), P(cols, r)]);
		lines(ctx, rowSegs, { alpha: faint, width: INK.lineW });
		const over = 1 - (1 - INK.line) / (1 - INK.faint);
		const lit1 = [];
		for (let r = -rows; r <= rows; r++) {
			const d = Math.abs(r - DATE_ROW);
			const pr = smooth(span(t, B.e1 + 0.1 + 0.07 * d, B.e1 + 0.7 + 0.07 * d));
			if (pr <= 0) continue;
			lit1.push([P(-pr * cols, r), P(pr * cols, r)]);
		}
		lines(ctx, lit1, { alpha: over, width: INK.lineW });
		// The second family: up as the character columns go, leaning with the
		// handle and brightening to the lattice's ink as the slider comes up.
		const colA = lerp(INK.faint * sq * cells, INK.line, up2);
		const second = [];
		for (let c = -cols; c <= cols; c++)
			second.push([P(c - rows * lean, -rows), P(c + rows * lean, rows)]);
		lines(ctx, second, { alpha: colA, width: INK.lineW });
		// The points, with the second period; the cell's corners are the cell's.
		const ptA = INK.point * up2;
		if (ptA > 0.004) {
			const r = 0.05 * p;
			ctx.save();
			ctx.fillStyle = PAL.chalk;
			ctx.globalAlpha = ptA;
			ctx.beginPath();
			for (let m = -cols; m <= cols; m++)
				for (let n = -rows; n <= rows; n++) {
					if ((m === 0 || m === 1) && (n === 0 || n === 1)) continue;
					const [x, y] = P(m + n * lean, n);
					if (x < -8 || x > w + 8 || y < -8 || y > h + 8) continue;
					ctx.moveTo(x + r, y);
					ctx.arc(x, y, r, 0, TAU);
				}
			ctx.fill();
			ctx.restore();
		}
		// The fundamental cell 0, 1, 1 + τ, τ, written round as the drag begins,
		// its gluings marked (one chevron on the τ-sides, two on the 1-sides),
		// its corners, and the three other half-points marked faintly.
		const cell = smooth(span(t, B.drag2 - 0.4, B.drag2 + 0.5));
		if (cell > 0) {
			const Q = (a, c) => P(a + c * lean, c);
			const edge = (pts, upto) =>
				stroke(ctx, pts, { color: PAL.chalk, width: INK.edgeW, alpha: INK.edge * cell, upto });
			edge([Q(0, 0), Q(1, 0)], span(cell, 0, 0.25));
			edge([Q(1, 0), Q(1, 1)], span(cell, 0.25, 0.5));
			edge([Q(1, 1), Q(0, 1)], span(cell, 0.5, 0.75));
			edge([Q(0, 1), Q(0, 0)], span(cell, 0.75, 1));
			const marks = smooth(span(cell, 0.7, 1)) * cell;
			if (marks > 0.01) {
				const ea = 0.11;
				const eb = 0.14;
				const chev = (pts) =>
					stroke(ctx, pts, { color: PAL.chalk, width: INK.chevW, alpha: INK.chev * marks });
				for (const x0 of [0, 1]) chev([Q(x0 - ea, 0.5 - eb), Q(x0, 0.5), Q(x0 + ea, 0.5 - eb)]);
				for (const y0 of [0, 1])
					for (const s of [-0.1, 0.1])
						chev([Q(0.5 + s - eb, y0 - ea), Q(0.5 + s, y0), Q(0.5 + s - eb, y0 + ea)]);
			}
			for (const [a, c] of [
				[1, 0],
				[1, 1],
				[0, 1]
			]) {
				const [x, y] = Q(a, c);
				disc(ctx, x, y, 0.06 * p, { fill: PAL.chalk, alpha: 0.9 * cell });
			}
			for (let i = 1; i < 4; i++) {
				const [x, y] = Q(...HALF[i]);
				disc(ctx, x, y, 0.045 * p, {
					fill: PAL.chalkDim,
					alpha: 0.7 * cell,
					ring: PAL.chalk,
					ringWidth: 1
				});
			}
		}
	}

	// ── The fall ─────────────────────────────────────────────────────────────
	// The kit's fall, with the structure streaming behind the plates: the cone
	// through a lens that goes on down its axis at the fall's zoom, from where
	// the dive left it, at the fall's vanishing point, and the pillow's remains
	// behind the apex fading over the first seconds.
	function descent(ctx, w, h, t) {
		const backdrop = (ctx, cam, zoom, alpha) => {
			const D = G.Dend * Math.exp(-zoom);
			const camK = orbit(w, h, { target: G.N, az: G.azN, el: G.elN, dist: D, fov: G.fov + 10 });
			camK.dist = D;
			camK.target = G.N;
			ctx.save();
			ctx.translate(cam.ox - w / 2, cam.oy - h / 2);
			const remains = (1 - smooth(span(t, ...B.remains))) * alpha;
			if (remains > 0.01)
				S.draw(ctx, w, h, {
					...paramsAt(1, v),
					write: 1,
					cell: 1,
					cone: 0,
					origin: 0,
					cam: camK,
					G,
					alpha: remains,
					ref: G.Dend
				});
			drawCone(ctx, camK, G.N, G.dir, { D, w, h, alpha, floor: 0.002 });
			ctx.restore();
		};
		const cam = fall.draw(ctx, w, h, t, { background: backdrop, colourAlong: true, dust: b.dust });
		fillLight(ctx, cam.ox, cam.oy, w, h, t);
		impact(ctx, w, h, cam.ox, cam.oy, 0.4 * h, (t - B.flash) / 10, 0, 1, true);
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {
			L = null;
		}
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

// The light filling the frame from the node out at the end of the dive, and
// lingering a moment past the flash so the first plate comes out of it
// (flow-chalk's).
function fillLight(ctx, x, y, w, h, t) {
	const up = smooth(span(t, B.flash - 0.5, B.flash));
	const f = up * (1 - smooth(span(t, B.flash, B.flash + 0.4)));
	if (f <= 0.003) return;
	const D = Math.hypot(w, h) / 2;
	const R = D * lerp(0.1, 1.0, up);
	const g = ctx.createRadialGradient(x, y, 0, x, y, R);
	g.addColorStop(0, `rgba(255, 250, 238, ${f})`);
	g.addColorStop(lerp(0.2, 0.45, up), `rgba(255, 244, 220, ${f})`);
	g.addColorStop(0.75, `rgba(250, 226, 170, ${0.45 * f})`);
	g.addColorStop(1, 'rgba(245, 193, 80, 0)');
	ctx.save();
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, TAU);
	ctx.fill();
	ctx.restore();
}
