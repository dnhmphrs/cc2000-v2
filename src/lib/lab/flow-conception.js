import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	camera3,
	PAL,
	TAU,
	TECH_FONT,
	MATH_FONT,
	span,
	smooth,
	lerp,
	clock,
	tag,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm
} from './log/board.js';
import { lit } from './log/ink.js';
import { drawHelix } from './log/helix.js';
import { makeTerminal } from './log-dawn.js';
import { DECADES, loadRooms, decadeOfDate } from './log/rooms.js';
import { splash } from './log/splash.js';
import { makeEntry, DEMO } from './log/entry.js';
import { makeFall, orderOf } from './log/fall.js';
import { makeStructure, geometry, cameraAt, paramsAt, fold, tauOf, HALF } from './log/kummer.js';

// ── Flow: flow-conception — the lattice, the tube, the swimmer, the screen ───
// One run of the site on the board, in chalk. The answers make a lattice;
// its cell rolls into a tube; the tube becomes the swimmer; the swimmer swims
// down through the chalk rooms; and conception is the swimmer reaching the
// last room's screen.
//
// The terminal types the card and its full stop lights and STAYS: the
// terminal's own cells come up under the sentence and the sentence goes,
// leaving a square lattice at the line pitch with the stop at its origin (no
// zoom into the dot). The two questions are asked ON that lattice
// (log/entry.js) and answered BY HAND in the lab: the date typed into ten
// cells standing on a row — that row becomes the real axis — and "how
// spicy?" a slider from 1 to 10 whose ten stops are ten lattice points, the
// lattice's second family leaning with the handle as it is dragged (Re τ
// from −½ to +½), the fundamental cell drawn round the origin. Enter, and
// the cell rolls up into a tube (log/kummer.js's roll: its opposite sides
// glued). The tube gathers into a head and draws out a tail: the swimmer
// (helix.js), its head lit; it turns on its axis — faster the spicier — and
// swims off as the lens comes round behind it and falls back. Out of the
// dark ahead the first chalk room comes up, and the swimmer leads the lens
// down through the rooms, glass after glass (log/fall.js, flow-chalk's fall:
// the chalk plates, no background, the colour flooding at the landing), and
// as the lens lands in the answer's room the swimmer swims on into its
// monitor — and splashes on the screen, gold, the glass lit. The room holds.
//
// The answers matter: the year picks the room the run lands in (before 1960
// the 1950s, before 1980 the 1960s, before 2005 the 1990s, then the 2010s);
// the spice leans the lattice — so shapes the tube's seam — and sets how fast
// the tail turns.
//
// Live in the lab (no ?at=): the run waits at each question — type the date
// (digits; Backspace; Enter once all eight are in), then drag the handle or
// use ← → or a digit (0 for 10), Enter. Pinned (?at=), in a reel, or with
// ?demo=1 the hand is scripted (14 · 02 · 1987, spice 7), so every frame is a
// pure function of progress. ?decade= forces the room.
//
// Beats, in seconds (42):
//    0 – 4.94   the terminal; the full stop lands at 4.94
//   5.3 – 8.4   the stop lit as the origin; the terminal's cells up, the
//               sentence and its columns gone; the origin drifts to the centre
//   8.5 – 13    "when were you born?" — waits at 9.55 when live; Enter at
//               11.6; the rows write out from the date's row
//  12.9 – 16.5  "how spicy?" — waits at 14.2 when live; Enter at 16.5
//  17.6 – 18.8  the fields fade off the lattice
//  19   – 22.6  the cell rolls into the tube, the lens lifting off
//  22.6 – 24.2  the tube becomes the swimmer: its rings gather into the head,
//               its tail draws out, the head lights
//  24   – 25.6  it swims; the lens comes round behind it and falls back
//  25   – 36.6  the fall through six chalk rooms, the swimmer leading
//  34.6 – 36.6  the landing; the swimmer on into the last room's monitor
//  36.7         THE SPLASH on the screen; the colour floods; the glass lit
//  36.7 – 42    the room, held

const SECONDS = 42;
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
	roll: [19.0, 22.6], // the kit's u from 0 to its roll's end over these seconds
	form: [22.6, 24.2], // the tube becomes the swimmer
	swim: 24.0, // it starts to swim
	round: [24.0, 25.6], // the lens comes round behind it
	fall: [25.0, 36.6],
	fadeIn: [25.0, 25.9],
	land: [34.6, 36.6],
	colour: [35.0, 37.2],
	aim: [34.9, 36.7], // the swimmer on into the last glass
	hit: 36.7
};
// When live, the run waits here for the answers.
const WAIT1 = 9.55;
const WAIT2 = 14.2;
const U_ROLL = 0.3; // the kit's STAGE.roll[1]: the tube closed, nothing bent
const DATE_ROW = 2;
const SLIDER_ROW = -3;
const LEFT = -5;
// The structure kit's ink, as its batches quantise it, so the lattice drawn
// by hand here and by the kit from B.kit are one drawing.
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

// ∫ smoothstep: the distance covered by a speed that eases from 0 to 1 over
// `ramp` seconds and then holds, `x` seconds after the start.
function eased(x, ramp) {
	if (x <= 0) return 0;
	if (x >= ramp) return x - ramp / 2;
	const s = x / ramp;
	return ramp * (s * s * s - (s * s * s * s) / 2);
}

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const b = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-conception · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const term = makeTerminal(0.8, { cmd: false });
	const FREEZE = term.stop + 0.2;
	const entry = makeEntry();

	// The answers: the demo's, or the hand's.
	const ans = { date: DEMO.date, spice: DEMO.spice };
	const input = { typed: '', value: 1, held: 0, date: false, spice: false, key: -9 };
	let tau, S, fall, decade;
	let G = null;
	let tube = null;
	function settle() {
		tau = tauOf(ans.spice);
		S = makeStructure({ tau });
		decade = forced ?? decadeOfDate(ans.date);
		fall = makeFall({
			art,
			order: orderOf(decade),
			beats: { fall: B.fall, land: B.land, colour: B.colour, swim: [-2, -1] }
		});
		G = null;
		tube = null;
	}
	settle();

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		get decade() {
			return decade;
		},
		answers: ans
	};
	let L = null; // the terminal's layout: the lattice's pitch and origin
	let frozen = null;
	let view = null; // the lattice's view this frame, for the pointer

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

	// ── The hand: the keyboard and the pointer, live ─────────────────────────
	const asking = () => {
		const t = time.t;
		if (!input.date && t >= B.q1) return 'date';
		if (input.date && !input.spice && t >= B.q2) return 'spice';
		return null;
	};
	const sliderX = (clientX) => {
		if (!view) return null;
		const x0 = view.to([LEFT, SLIDER_ROW])[0];
		const x9 = view.to([LEFT + 9, SLIDER_ROW])[0];
		return Math.max(1, Math.min(10, 1 + (9 * (clientX - x0)) / (x9 - x0)));
	};
	if (live) {
		window.addEventListener('keydown', (e) => {
			const a = asking();
			if (a === 'date') {
				if (/^[0-9]$/.test(e.key) && input.typed.length < 8) input.typed += e.key;
				else if (e.key === 'Backspace') input.typed = input.typed.slice(0, -1);
				else if (e.key === 'Enter' && input.typed.length === 8) {
					input.date = true;
					ans.date = input.typed;
					settle();
					time.seek((B.e1 - 0.1) / SECONDS);
				} else return;
				input.key = performance.now() / 1000;
				e.preventDefault();
			} else if (a === 'spice') {
				if (e.key === 'ArrowRight') input.value = Math.min(10, Math.round(input.value) + 1);
				else if (e.key === 'ArrowLeft') input.value = Math.max(1, Math.round(input.value) - 1);
				else if (/^[0-9]$/.test(e.key)) input.value = e.key === '0' ? 10 : Number(e.key);
				else if (e.key === 'Enter') {
					input.value = Math.round(input.value);
					input.spice = true;
					ans.spice = input.value;
					settle();
					time.seek((B.e2 - 0.15) / SECONDS);
				} else return;
				e.preventDefault();
			}
		});
		window.addEventListener('pointerdown', (e) => {
			if (asking() !== 'spice' || !view) return;
			const y = view.to([LEFT, SLIDER_ROW])[1];
			if (Math.abs(e.clientY - y) > 0.9 * view.scale) return;
			const v = sliderX(e.clientX);
			if (v === null) return;
			input.held = 1;
			input.value = v;
		});
		window.addEventListener('pointermove', (e) => {
			if (input.held) input.value = sliderX(e.clientX) ?? input.value;
		});
		window.addEventListener('pointerup', () => {
			if (!input.held) return;
			input.held = 0;
			input.value = Math.round(input.value);
		});
	}

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (!L || L.w !== w || L.h !== h) {
			L = term.layout(ctx, w, h);
			frozen = null;
			G = null;
		}
		if (!G) {
			G = geometry(tau, { w, h, cellPx: L.step, origin: [w / 2, h / 2] });
			tube = tubeOf(tau, G);
		}
		if (t < FREEZE) term.draw(ctx, w, h, t / 10, t, t - 10);
		else if (t < B.roll[1]) lattice(ctx, w, h, t);
		else swimmer(ctx, w, h, t);
		tag(ctx, w, h, 'flow-conception');
	}

	// The hand this frame: the script's, with the live answers laid over it.
	function handAt(t) {
		const hand = entry.script(t, B);
		if (!live) return hand;
		const now = performance.now() / 1000;
		if (!input.date) {
			hand.typed = input.typed;
			hand.caret = 1;
			hand.steady = now - input.key < 0.5;
		} else hand.typed = ans.date;
		if (!input.spice) {
			hand.value = input.value;
			hand.held = input.held;
		} else {
			hand.value = ans.spice;
			hand.held = 0;
		}
		return hand;
	}

	// ── From the stop to the tube ────────────────────────────────────────────
	function lattice(ctx, w, h, t) {
		const p = L.step;
		const pan = smooth(span(t, ...B.pan));
		const ox = lerp(L.stop.x, w / 2, pan);
		const oy = lerp(L.stop.y, h / 2, pan);
		view = makeView({ w, h, scale: p, cx: ox, cy: oy });
		const hand = handAt(t);
		const up2 = smooth(span(hand.q2, 0.35, 1));
		const lean = tauOf(hand.value)[0] * up2;

		if (t < B.kit) lattice2d(ctx, w, h, t, view, lean, up2);
		else {
			const u = U_ROLL * span(t, ...B.roll);
			const P = paramsAt(u);
			const cam = cameraAt(u, G);
			S.draw(ctx, w, h, { ...P, write: 1, cell: 1, cam, G, origin: t < B.roll[0] ? 0 : 1 });
		}

		const textA = 1 - smooth(span(t, ...B.text));
		if (textA > 0.004) {
			ctx.save();
			ctx.globalAlpha = textA;
			ctx.translate(ox - L.stop.x, oy - L.stop.y);
			ctx.drawImage(frozenFrame(), 0, 0, w, h);
			ctx.restore();
		}
		if (t < B.roll[0]) {
			const li = smooth(span(t, ...B.light));
			lit(ctx, ox, oy, lerp(L.stop.r, 5.5, li), smooth(span(li, 0, 0.5)));
		}

		const fieldsA = 1 - smooth(span(t, ...B.fields));
		if (t >= B.q1 && fieldsA > 0.01) {
			const secs = live ? performance.now() / 1000 : t;
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
					secs,
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

	// ── The tube, the swimmer, the fall, the screen ──────────────────────────
	function swimmer(ctx, w, h, t) {
		const T = tube;
		const camK = cameraAt(U_ROLL, G);
		// The tube as the kit closed it, fading as our own lines take over.
		const kitA = 1 - smooth(span(t, B.form[0], B.form[0] + 0.35));
		if (kitA > 0.01)
			S.draw(ctx, w, h, {
				...paramsAt(U_ROLL),
				write: 1,
				cell: 1,
				cam: camK,
				G,
				origin: 1,
				alpha: kitA
			});

		// Where the swimmer is: formed on the tube's axis, its nose at the
		// tube's τ end, then swimming on along the axis.
		const spin = TAU * (0.8 + 0.12 * ans.spice) * eased(t - B.swim, 1.2);
		const run = 1.6 * eased(t - B.swim, 1.4);
		const at = add3(T.atHead, mul3(T.axis, run));

		// The lens: the kit's, held; then round behind the swimmer and back.
		const k = smooth(span(t, ...B.round));
		const off0 = sub3(camK.pos, T.atHead);
		const behind = norm(add3(mul3(T.axis, -Math.cos(0.42)), mul3(T.up, Math.sin(0.42))));
		const dist = lerp(Math.hypot(...off0), T.follow, k * k);
		const dir = norm(add3(mul3(norm(off0), 1 - k), mul3(behind, k)));
		const look0 = sub3(camK.target, T.atHead);
		let target = add3(at, mul3(look0, 1 - k));
		let pos = add3(at, mul3(dir, dist));

		// The fall, under the swimmer, out of the dark ahead.
		let shift = [0, 0];
		let scale = 1;
		let alpha = 1;
		if (t >= B.fall[0]) {
			const cam = fall.draw(ctx, w, h, t, { colourAlong: false, dust: b.dust });
			const dark = 1 - smooth(span(t, ...B.fadeIn));
			if (dark > 0.003) {
				ctx.save();
				ctx.globalAlpha = dark;
				ctx.fillStyle = PAL.ground;
				ctx.fillRect(0, 0, w, h);
				ctx.restore();
			}
			// On into the last glass: the head slides to the glass's centre and
			// shrinks into it.
			const aim = smooth(span(t, ...B.aim));
			let gx = cam.ox;
			let gy = cam.oy;
			if (cam.glass) {
				gx = (cam.glass[0] + cam.glass[2]) / 2;
				gy = (cam.glass[1] + cam.glass[3]) / 2;
			}
			shift = [lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2];
			scale = lerp(1, 3.2, aim * aim);
			alpha = 1 - smooth(span(t, B.hit - 0.12, B.hit));
			if (t >= B.hit && cam.glass) splash(ctx, cam.glass, t - B.hit, ans.spice);
		}
		if (alpha <= 0.01) return;
		if (t >= B.round[1] || k > 0) {
			pos = add3(at, mul3(sub3(pos, at), scale));
			target = add3(at, mul3(sub3(target, at), 1));
		}
		const cam = camera3({ pos, target, up: [0, 1, 0], fov: G.fov, w, h });

		// The tube becoming the swimmer: our own lines (generatrices and
		// rings) on a radius that goes from the tube's to the swimmer's, the
		// rings gathering into the head; the helix drawing out of it.
		const m = smooth(span(t, ...B.form));
		ctx.save();
		ctx.translate(shift[0], shift[1]);
		ctx.globalAlpha = alpha;
		const linesA = smooth(span(t, B.form[0], B.form[0] + 0.3)) * (1 - smooth(span(m, 0.62, 1)));
		if (linesA > 0.01) morph(ctx, cam, T, at, m, linesA, spin);
		const hx = smooth(span(m, 0.4, 0.85));
		if (hx > 0.01)
			drawHelix(
				ctx,
				cam,
				{ at, axis: T.axis, spin, size: T.size },
				{
					body: smooth(span(m, 0.45, 1)),
					alpha: hx,
					color: PAL.chalk,
					width: Math.max(1, Math.min(3.2, (G.fov > 0 ? 1 : 1) * 2.2)),
					core: 0.9,
					glow: 0.55
				}
			);
		ctx.restore();
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => {
			if (live) {
				const next = time.t + dt;
				if (!input.date && next >= WAIT1 && time.t <= WAIT1 + 0.02)
					return time.seek(WAIT1 / SECONDS);
				if (input.date && !input.spice && next >= WAIT2 && time.t <= WAIT2 + 0.02)
					return time.seek(WAIT2 / SECONDS);
			}
			const before = time.t;
			time.step(dt);
			// Round again: the questions are asked again.
			if (live && time.t < before) {
				input.typed = '';
				input.value = 1;
				input.held = 0;
				input.date = false;
				input.spice = false;
			}
		},
		render,
		resize() {
			L = null;
		}
	};
}

// The tube the kit closes (the cell rolled, nothing bent) in the kit's world:
// its axis (from the cell's 0 end to its τ end), its length and radius, a
// frame across it, the swimmer's size and where its head sits, and how far
// behind it the lens follows.
function tubeOf(tau, G) {
	const f = fold(tau, 1, 0);
	const ring = (bb) => {
		let c = [0, 0, 0];
		const n = 24;
		for (let i = 0; i < n; i++) c = add3(c, f(i / n, bb));
		return mul3(c, 1 / n);
	};
	const c0 = ring(0);
	const c1 = ring(1);
	const len = Math.hypot(...sub3(c1, c0));
	const axis = norm(sub3(c1, c0));
	const mid = ring(0.5);
	const r = Math.hypot(...sub3(f(0, 0.5), mid));
	const ref = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	const e1 = norm(cross(axis, ref));
	const e2 = cross(axis, e1);
	const up = norm(sub3([0, 1, 0], mul3(axis, dot([0, 1, 0], axis))));
	const size = 0.4 * len;
	// The lens far enough back that the head is ~28 px long on the board.
	const F = G.h / 2 / Math.tan((G.fov * Math.PI) / 360);
	return {
		c0,
		c1,
		len,
		axis,
		r,
		e1,
		e2,
		up,
		size,
		atHead: sub3(c1, mul3(axis, size / 2)),
		follow: (F * size) / 28
	};
}

// The tube's lines on a radius that runs from the tube's to the swimmer's:
// the head a teardrop at the nose, the tail a thread behind; the rings
// gather into the head. Hidden halves faint.
function morph(ctx, cam, T, at, m, alpha, spin) {
	const nose = add3(at, mul3(T.axis, T.size / 2));
	const length = lerp(T.len, 1.3 * T.size, m); // the tail is the helix's
	const sH = T.size / length;
	const rHead = 0.55 * T.size * 0.5;
	const rOf = (s) => {
		let rs;
		if (s < sH) {
			const x = (s / sH) * 2 - 1;
			rs = rHead * Math.sqrt(Math.max(0, 1 - x * x));
		} else rs = 0.12 * rHead * (1 - smooth(span(s, sH, 1)));
		return lerp(T.r, rs, m);
	};
	const P = (s, phi) => {
		const c = add3(nose, mul3(T.axis, -s * length));
		const r = rOf(s);
		return add3(c, add3(mul3(T.e1, r * Math.cos(phi)), mul3(T.e2, r * Math.sin(phi))));
	};
	const eye = cam.pos;
	const seg = (p0, p1, c) => {
		const q0 = cam.project(p0);
		const q1 = cam.project(p1);
		if (q0[2] <= 0.01 || q1[2] <= 0.01) return;
		const mid = mul3(add3(p0, p1), 0.5);
		const front = dot(sub3(mid, c), sub3(eye, c)) >= 0;
		(front ? fr : bk).push(q0[0], q0[1], q1[0], q1[1]);
	};
	const fr = [];
	const bk = [];
	const N = 12;
	const M = 28;
	for (let j = 0; j < N; j++) {
		const phi = (TAU * j) / N + spin * m;
		for (let i = 0; i < M; i++) {
			const s0 = i / M;
			const s1 = (i + 1) / M;
			const c = add3(nose, mul3(T.axis, -((s0 + s1) / 2) * length));
			seg(P(s0, phi), P(s1, phi), c);
		}
	}
	for (let k = 0; k <= 5; k++) {
		const s = lerp(k / 5, (sH * (k + 0.5)) / 6, m);
		const c = add3(nose, mul3(T.axis, -s * length));
		for (let i = 0; i < 32; i++) seg(P(s, (TAU * i) / 32), P(s, (TAU * (i + 1)) / 32), c);
	}
	const draw = (arr, a, wd) => {
		if (!arr.length) return;
		ctx.save();
		ctx.globalAlpha *= a;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = wd;
		ctx.lineCap = 'round';
		ctx.beginPath();
		for (let i = 0; i < arr.length; i += 4) {
			ctx.moveTo(arr[i], arr[i + 1]);
			ctx.lineTo(arr[i + 2], arr[i + 3]);
		}
		ctx.stroke();
		ctx.restore();
	};
	draw(bk, 0.22 * alpha, 1);
	draw(fr, 0.85 * alpha, 1.3);
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
