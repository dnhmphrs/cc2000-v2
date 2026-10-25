// ── Flow: flow-harmonic — the beat written by circles, swept into a body ─────
// One whole run on the board, in chalk: the title, the two answers taken by
// hand, the swimmer compiled from them, its swim down a curving tunnel of
// golden rings, the generations of a cellular automaton, the chalk fall
// through the rooms and the splash on the last screen.
//
// ENTRY. The terminal types the card centred and freezes at its stop; its
// lines fade, top first, and are gone before the first question (epicycle's
// title, to the lead's notes). The stop glides to the PIVOT, left of centre,
// and a chain of circles hangs from it — the classic Fourier picture: arm 1
// is the FUNDAMENTAL (the carrier, the beat itself), and EACH DIGIT IS AN ARM
// turning at its harmonic, digit k (DDMMYYYY order, k = 0…7) at harmonic
// h = k + 2, its weight the digit times a falling share
//     w₁ = 1,   w_h = d_k · s_k,   s = .30 .20 .14 .10 .07 .05 .035 .025
// (the day the low harmonics, the year the embroidery), its length
// r_h = R w_h / Σw so the figure keeps one size. The arms stand at h·Φ; the
// pen's HEIGHT is carried out to the right by a projector and drawn as a
// TRAVELLING WAVE, y(x) = Σ r_h sin h(Φ − 2π n x / W): the pen's history, so a
// digit typed changes the wave from the pen onward and the change flows out
// across the window. The spice is the wave's frequency: n = 1.25 + 0.15
// (spice − 1) waves in the window — dragging the handle tightens the wave
// like an accordion. Each Enter runs a gold trace out along the wave. The
// person's waveform is their beat.
//
// COMPILE (COMPILING USER GENETICS). The arms fold home; the wave stops. The
// board tilts into 3D: the lens that drew it is a 3D lens square to the
// board's plane, so the wave is LIFTED off it without a cut, as the
// flagellum's centreline — easing into the body's own (the drawn wave is the
// tail's BENDING wave; the shape is its double integral, so the year's ripple
// smooths away and the envelope narrows to the neck), the quadrature out of
// plane showing as the lens swings; the pivot glides to where the nose will
// be (it is nearly there: the window is laid at the tail's scale). A tube is
// SWEPT along it ring by ring from the TIP toward the head, its long lines
// written with the rings (so it reads as a tube, not beads), the lens riding
// just ahead of the ring being laid, looking back down the tube; on, without
// a break, through the midpiece's rings and its mitochondrial helix (nine
// turns, wound from the tail's end), to the HEAD BLOWN OUT at the front (its
// width and thickness inflating from the neck's as its rings go on toward the
// nose) — one build toward the front, so the lens never swings back; then
// the body's own generatrices and the contour. Life: a spark at the midpiece, the wave
// starts to travel, the roll; the lens comes round behind it.
//
// CONCEPTION (SIMULATING CONCEPTION). It swims. Ahead, draft's golden-angle
// disc is seeded rim to centre, large (its rim the tunnel's radius, 60, most
// of the board's height), then its 8- and 13-spirals; the lens, oblique on
// the approach, settles on the disc's axis and the disc OPENS (phyllo.js's
// exact opening: from the axis the picture never changes; the disc was the
// far view of a tunnel) into a TUNNEL OF GOLDEN RINGS — each seed a ring on
// the wall, one step (a·ln φ/k) deeper and turned by the golden angle from
// the last, so the 8- and 13-parastichies are helices down it, the far rings
// warming to a dim gold — and every 21st step a faint gold hoop (the tunnel's own
// cross-section), so its bends read. The tunnel BENDS: past the opened
// tunnel's fog its axis curves both ways (curvature 1/150 in two slow sines,
// a rotation-minimising frame carried along it); the lens rides behind and
// beside the swimmer and BANKS into each turn. Behind it all, dim warp
// streaks: a star field just outside the wall, each star streaked along the path
// for the shutter's time (220 ms of the lens's motion), so they radiate from
// the tunnel's vanishing point and lengthen as the pace builds.
//
// INTERIM — GENERATIONS. The tunnel straightens and its rings become
// generations: a one-dimensional cellular automaton on a ring of W = 128
// cells, seeded with the date's bits (each digit in 4-bit binary, 32 cells,
// centred on the floor), run for G = 48 generations under the rule the spice
// picks (below). Its spacetime diagram is computed row by row from the seed,
// laid on the tunnel's wall — the seed ring furthest, each generation a ring
// nearer — so the generations stream toward the lens as it swims back
// through them, back in time. The tunnel UNROLLS into the floor (an exact
// isometry: the wall's arcs keep their lengths) and the lens rises to see
// the whole history, and in it, in gold, the LIGHT CONE of one seed cell
// (the live bit nearest the centre): every cell that one bit could have
// touched, |x − c₀| ≤ g. Read back through time the cone NARROWS, generation
// by generation, to that one live cell; the swimmer darts into it, the lens
// dives after, and the cell — drawn in the first room's glass's own
// proportions — IS that glass as the fall opens: at 42 s its box on the
// board is the glass's box, and the dive's zoom, r(x) = r₁(2x − x²) e-folds
// a second from rest, only ever gathering, arrives at the fall's opening
// rate r₁ (≈ 0.59; the fall paced with c = 0.8, opened from ζ₀ = −0.9).
//
// FALL, ROOM. The chalk fall (log/fall.js) through six rooms, the 3D swimmer
// leading at the vanishing point (side-on, its own lens behind it), dim star
// streaks through the glasses on the fall's own zoom; it swims into the last
// room's monitor and SPLASHES on the screen; the room floods with colour and
// holds; a fade, round.
//
// EXACT: the automaton (Wolfram's numbering: the next state of a cell is bit
// 4l + 2c + r of the rule, periodic on the ring). Spice 1…10 picks the rule
// from 90, 60, 150, 105, 18, 22, 126, 54, 110, 30 — additive and ordered to
// chaotic (184, the traffic rule, is left out: it conserves its cars, so its
// history never fills a cone). The demo's 7 is rule 126, by hand 4 is rule
// 105. The seed: the eight digits, each in four bits, most significant
// first, at cells 48…79 of the 128 — 14021987 is 0001 0100 0000 0010 0001
// 1001 1000 0111, its cone's apex cell 62. The light cone and the unrolling.
// The Fourier picture (arms at integer harmonics, the pen's height drawn
// against time). Phyllotaxis and its opening (phyllo.js).
// A PICTURE: the body's beat (below); the head's inflation; the path's bends;
// the streaks; the swimmer's dart into the cell.
//
// THE COEFFICIENTS → THE BODY. The body is body.js's (specOf: head, midpiece,
// tail length, helicity, beat frequency and roll from the date and spice),
// but its BEAT is the person's waveform: the drawn wave is the flagellum's
// BENDING wave Σ c_h sin h(κ(s − s_T) − ωt), c_h = w_h / Σw, so its tangent
// angle is β = −Θ(s) Σ (c_h / h) cos h(…) / max (body.js's Θ, neck to tip,
// so the tip bends spec.tip), out of plane helicity × Θ Σ (c_h / h) sin h(…);
// integrated as body.js integrates its single sine, so the tail keeps its
// length and the head yaws. κ = 2π n / L_tail: the window's waves are the
// tail's. The digits are the timbre of the beat (the day its shape, the year
// a ripple); the spice its frequency (waves on the tail, the Hz, the roll)
// and the automaton's rule.
//
// Live in the lab (no ?at=, not ?demo=1): the run waits at each question —
// type the date (digits; Backspace; Enter once all eight are in), drag the
// handle (or ← → or a digit, 0 for 10), Enter. Pinned, in a reel or ?demo=1
// the hand is scripted (14 · 02 · 1987, spice 7). ?decade= forces the room;
// ?prof=1 puts each part's milliseconds on __lab.prof.
//
// Beats (seconds; 60; at = t / 60):
//    0    – 5.14  the terminal types the card centred; frozen at its stop
//    5.4  – 6.4   its lines fade out, top first; 6.2 – 6.8 the stop to the pivot
//    6.8          "when were you born?" (q1, at 0.113); the carrier and its wave
//    7.6          the wait (wait1); digits typed: arms, the wave reshaped
//    9.8          Enter (e1, at 0.163); the gold trace out along the wave
//   11.6          "how spicy?" (q2); 12.4 the wait; the drag tightens the wave
//   14.4          Enter (e2, at 0.24); the gold trace
//   14.95 – 15.45 the questions fade; 15.5 COMPILING USER GENETICS
//   15.4 – 16.2   the arms fold home; the wave eases to a stop
//   16.3 – 17.7   the lift: the wave → the centreline, the lens into 3D
//   17.4 – 19.4   the sweep: the tail's rings and long lines, tip → neck (at 0.29 – 0.32)
//   19.4 – 21.0   on through the midpiece (its helix 19.45 – 20.25) to the head, blown out
//   20.6 – 21.7   generatrices, contour; 21.7 life (at 0.362)
//   22.4 – 23.7   it swims; the lens comes round behind; 22.6 SIMULATING CONCEPTION
//   23.2 – 26.4   the disc seeded ahead, rim to centre; 25.4 – 27 the spirals
//   27.3 – 28.7   on its axis, the disc opens (x); 28.4 – 30 the log map
//   30   – 34     down the tunnel of golden rings, the bends ≈ 31.7 – 34 (at 0.5 – 0.57)
//   34.0 – 36.0   the rings become generations, computed from the seed ring
//   34.8 – 37.0   the tunnel unrolls; the lens rises (at 0.58 – 0.62)
//   37.0 – 38.4   the light cone of one seed cell, in gold
//   38.4 – 40.6   the cone narrows to the one live cell; 38.8 – 41.1 the dart
//   37.0 – 42     the dive into it (at 0.62 – 0.7); 41.15 – 41.95 the history
//                 clears round the apex cell; 41.75 – 42.25 the first room
//                 fades in round it (as one layer)
//   42   – 53.6   the fall through six rooms (at 0.7 – 0.893)
//   53.7          the splash on the last screen (at 0.895); the room holds
//   59   – 60     fade; round

import {
	getBoard,
	clearBoard,
	clock,
	tag,
	PAL,
	TAU,
	PHI,
	TECH_FONT,
	span,
	smooth,
	lerp,
	clamp01,
	stroke,
	disc,
	camera3,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm
} from './log/board.js';
import { NEAR, makeDepth, lit3, spline, spline3 } from './log/space.js';
import { makeTerminal } from './log-dawn.js';
import { makeAnswers } from './log/answer.js';
import { script, DEMO } from './log/entry.js';
import { EPICYCLE } from './intro/epicycle.js';
import { makeBody, specOf } from './log/body.js';
import { PHYLLO, seeds, parastichy, opening, seedFrame } from './log/phyllo.js';
import { caption, CAPTION } from './log/caption.js';
import { splash } from './log/splash.js';
import { makeFall, orderOf } from './log/fall.js';
import { DECADES, loadRooms, decadeOfDate } from './log/rooms.js';

// ── The beats ────────────────────────────────────────────────────────────────
const SECONDS = 60;
const EB = EPICYCLE.beats; // q1 6.8, wait1 7.6, e1 9.8, q2 11.6, wait2 12.4, e2 14.4
const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
const FREEZE = TERM.stop + 0.2;
const B = {
	...EB,
	gone: 5.4, // title line i fades over [5.4 + 0.25 i, 5.9 + 0.25 i]
	pan: [6.2, 6.8], // the stop to the pivot
	carrier: [7.0, 7.5], // the fundamental's arm grows out of the stop
	field: [EB.q1 + 0.25, EB.q1 + 0.7],
	slider: [EB.q2 + 0.35, EB.q2 + 0.8],
	trace: 1.2, // a gold trace's run along the wave
	asks: [14.95, 15.45], // the questions fade (gone before the caption types where the slider was)
	genetics: [15.5, 22.5],
	fold: 15.4, // arm h folds over [15.4 + 0.06 (9 − h), + 0.36]
	still: [15.2, 16.2], // the wave's travel eases to a stop
	lift: [16.3, 17.7],
	nose: [16.3, 17.3],
	stars: [16.4, 18.4],
	sweep: [17.4, 19.4],
	mid: [19.2, 19.8],
	helix: [19.45, 20.25], // wound from the tail's end, as the midpiece's rings go on
	head: [19.8, 21.0],
	gens: 20.6,
	contour: [21.1, 21.7],
	life: 21.7,
	swim: 22.4,
	round: [23.0, 23.7], // the lens has come round behind it
	conception: [22.6, 33.8],
	rim: [23.0, 23.8],
	seeds: [23.2, 26.4],
	sp8: [25.4, 26.6],
	sp13: [25.8, 27.0],
	open: [27.3, 28.7],
	log: [28.4, 30.0],
	bend: [30.2, 30.8], // the far tunnel's bends come in (out of sight, past the fog)
	hoops: [28.8, 30.4],
	rows: [34.0, 36.0], // the generations computed, seed ring first
	seedsOff: [33.4, 35.0], // the golden seeds give way to the cells
	unroll: [35.2, 37.0],
	rise: [34.8, 37.0],
	cone: [37.0, 38.4],
	narrow: [38.4, 40.6],
	dive: [37.0, 42.0],
	into: [38.8, 41.1], // the swimmer darts ahead into the apex cell
	fall: [42.0, 53.6],
	clear: [41.15, 41.95], // the history clears round the apex cell
	handoff: [41.75, 42.25],
	land: [51.6, 53.6],
	colour: [52.0, 54.2],
	aim: [51.9, 53.7],
	hit: 53.7,
	out: [59.0, 60.0]
};

// ── The coefficients ─────────────────────────────────────────────────────────
const T0 = 3.2; // the fundamental turns once in T0 s (the entry's picture)
const SHARE = [0.3, 0.2, 0.14, 0.1, 0.07, 0.05, 0.035, 0.025]; // digit k → harmonic k + 2
const NH = 9;
const GROW = 0.3;
const SHRINK = 0.2;
const wavesOf = (n) => 1.25 + 0.15 * (n - 1);
// The person's weights w[h − 1], h = 1 … 9: the carrier, then the digits.
function weightsOf(date) {
	const d = String(date).padEnd(8, '0').slice(0, 8).split('').map(Number);
	return [1, ...d.map((x, k) => (Number.isFinite(x) ? x : 0) * SHARE[k])];
}
function coeffsOf(date) {
	const w = weightsOf(date);
	const s = w.reduce((a, b) => a + b, 0);
	return w.map((x) => x / s);
}

// ── The automaton ────────────────────────────────────────────────────────────
const RULES = [90, 60, 150, 105, 18, 22, 126, 54, 110, 30];
const CA = { W: 128, G: 48 };
const ruleOf = (spice) => RULES[Math.max(1, Math.min(10, Math.round(spice))) - 1];
function automaton(date, spice) {
	const { W, G } = CA;
	const rule = ruleOf(spice);
	const bits = String(date)
		.padEnd(8, '0')
		.slice(0, 8)
		.split('')
		.flatMap((ch) => Number(ch).toString(2).padStart(4, '0').split('').map(Number));
	const off = (W - 32) / 2;
	const rows = [];
	let row = new Uint8Array(W);
	bits.forEach((b, i) => (row[off + i] = b));
	rows.push(row);
	for (let g = 1; g <= G; g++) {
		const nx = new Uint8Array(W);
		for (let x = 0; x < W; x++) {
			const l = row[(x - 1 + W) % W];
			const c = row[x];
			const r = row[(x + 1) % W];
			nx[x] = (rule >> (4 * l + 2 * c + r)) & 1;
		}
		rows.push(nx);
		row = nx;
	}
	// The cone's apex: the live seed cell nearest the ring's centre.
	let c0 = off;
	let best = Infinity;
	for (let i = 0; i < 32; i++)
		if (bits[i] && Math.abs(off + i - (W - 1) / 2) < best) {
			best = Math.abs(off + i - (W - 1) / 2);
			c0 = off + i;
		}
	return { rule, bits, rows, c0 };
}

// ── The beat: the person's waveform as the flagellum's ───────────────────────
// body.js's shape() with its single sine replaced by the person's series: the
// flagellum's BENDING wave is the drawn Σ c_h sin hφ, φ = κ(s − s_T) − ph, so
// its TANGENT angle is β(s) = −Θ(s) Σ (c_h/h) cos hφ / max (body.js's Θ,
// growing from the neck to the tip), and out of plane helicity × Θ ×
// Σ (c_h/h) sin hφ; integrated from the nose as body.js does (inextensible),
// turned so the body's mean axis is the heading, then rolled. Returns
// body.draw's shape.
function makeBeat(body, spec, coef, waves) {
	const ST = body.stations;
	const n = ST.length;
	const SS = Float64Array.from(ST, (x) => x.s);
	const DS = new Float64Array(n);
	const WH = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		DS[i] = (SS[Math.min(n - 1, i + 1)] - SS[Math.max(0, i - 1)]) / 2;
		WH[i] = DS[i] * (ST[i].part === 'head' ? 2 : 1);
	}
	const LEN = body.length;
	const sT = body.parts.tail[0];
	const sB = body.parts.head[1] + 0.5;
	const kap = (TAU * waves) / (LEN - sT);
	// The drawn wave is the BENDING (curvature) wave; the tangent angle is
	// its integral, Σ (c_h/h) cos hφ, normalised so its largest swing is 1:
	// the tip then bends as far as the spec's single sine would (body.js's
	// Θ, neck to tip), and the shape's harmonics fall as 1/h² — the day's
	// low ones shape it, the year's high ones are a ripple the tail's
	// stations (1.1 apart) could not carry anyway.
	let maxY = 0;
	for (let i = 0; i < 720; i++) {
		const ph = (TAU * i) / 720;
		let y = 0;
		for (let h = 1; h <= NH; h++) y += (coef[h - 1] / h) * Math.cos(h * ph);
		maxY = Math.max(maxY, Math.abs(y));
	}
	const tip = spec.beat.tip;
	const neck = spec.beat.neck;
	const hel = spec.beat.helix;
	const norm1 = 1 / Math.max(1e-6, maxY);
	const slopes = (s, ph, amp) => {
		const q = Math.max(0, s - sB) / (LEN - sB);
		const Th = (neck + (tip - neck) * q) * amp * norm1;
		const f = kap * (s - sT) - ph;
		let Y = 0;
		let Q = 0;
		for (let h = 1; h <= NH; h++) {
			const c = coef[h - 1] / h;
			if (!c) continue;
			Y -= c * Math.cos(h * f);
			Q += c * Math.sin(h * f);
		}
		return [Th * Y, Th * hel * Q];
	};
	function shape(t, o = {}) {
		const { form = 1, amp = 1 } = o;
		const ph = o.phase ?? 0;
		const rho = o.roll ?? 0;
		const be = new Float64Array(n);
		const ch = new Float64Array(n);
		const w0 = slopes(sB, ph, amp);
		for (let i = 0; i < n; i++) {
			const w = SS[i] <= sB ? w0 : slopes(SS[i], ph, amp);
			be[i] = w[0];
			ch[i] = w[1];
		}
		const C = new Float64Array(3 * n);
		const T = new Float64Array(3 * n);
		const Aa = new Float64Array(3 * n);
		const Bb = new Float64Array(3 * n);
		let mx = 0;
		let my = 0;
		let mz = 0;
		for (let i = 0; i < n; i++) {
			const cb = Math.cos(be[i]);
			const cc = Math.cos(ch[i]);
			const tx = -cb * cc;
			const ty = Math.sin(ch[i]);
			const tz = cc * Math.sin(be[i]);
			T[3 * i] = tx;
			T[3 * i + 1] = ty;
			T[3 * i + 2] = tz;
			mx += tx * DS[i];
			my += ty * DS[i];
			mz += tz * DS[i];
			if (i) {
				const ds = SS[i] - SS[i - 1];
				const bm = (be[i] + be[i - 1]) / 2;
				const cm = (ch[i] + ch[i - 1]) / 2;
				const c2 = Math.cos(cm);
				C[3 * i] = C[3 * i - 3] - Math.cos(bm) * c2 * ds;
				C[3 * i + 1] = C[3 * i - 2] + Math.sin(cm) * ds;
				C[3 * i + 2] = C[3 * i - 1] + c2 * Math.sin(bm) * ds;
			}
		}
		// The mean axis: the principal axis of the centreline (body.js's).
		let gx = 0;
		let gy = 0;
		let gz = 0;
		let sw = 0;
		for (let i = 0; i < n; i++) {
			gx += WH[i] * C[3 * i];
			gy += WH[i] * C[3 * i + 1];
			gz += WH[i] * C[3 * i + 2];
			sw += WH[i];
		}
		gx /= sw;
		gy /= sw;
		gz /= sw;
		let xx = 0;
		let xy = 0;
		let xz = 0;
		let yy = 0;
		let yz = 0;
		let zz = 0;
		for (let i = 0; i < n; i++) {
			const wi = WH[i];
			const dx = C[3 * i] - gx;
			const dy = C[3 * i + 1] - gy;
			const dz = C[3 * i + 2] - gz;
			xx += wi * dx * dx;
			xy += wi * dx * dy;
			xz += wi * dx * dz;
			yy += wi * dy * dy;
			yz += wi * dy * dz;
			zz += wi * dz * dz;
		}
		for (let it = 0; it < 6; it++) {
			const nx = xx * mx + xy * my + xz * mz;
			const ny = xy * mx + yy * my + yz * mz;
			const nz = xz * mx + yz * my + zz * mz;
			const l = Math.hypot(nx, ny, nz) || 1;
			mx = nx / l;
			my = ny / l;
			mz = nz / l;
		}
		if (mx * C[3 * n - 3] + my * C[3 * n - 2] + mz * C[3 * n - 1] < 0) {
			mx = -mx;
			my = -my;
			mz = -mz;
		}
		let ky = -mz;
		let kz = my;
		const sn = Math.hypot(ky, kz);
		const cs = -mx;
		if (sn > 1e-12) {
			ky /= sn;
			kz /= sn;
		}
		const cr = Math.cos(rho);
		const sr = Math.sin(rho);
		const rot = (V, j) => {
			let x = V[j];
			let y = V[j + 1];
			let z = V[j + 2];
			if (sn > 1e-12) {
				const kd = ky * y + kz * z;
				const cx = ky * z - kz * y;
				const cy = kz * x;
				const cz = -ky * x;
				x = x * cs + cx * sn;
				y = y * cs + cy * sn + ky * kd * (1 - cs);
				z = z * cs + cz * sn + kz * kd * (1 - cs);
			}
			V[j] = x;
			V[j + 1] = y * cr - z * sr;
			V[j + 2] = y * sr + z * cr;
		};
		for (let i = 0; i < n; i++) {
			const j = 3 * i;
			const tx = T[j];
			const ty = T[j + 1];
			const tz = T[j + 2];
			let bx = -ty * tx;
			let by = 1 - ty * ty;
			let bz = -ty * tz;
			const bl = Math.hypot(bx, by, bz) || 1;
			bx /= bl;
			by /= bl;
			bz /= bl;
			Bb[j] = bx;
			Bb[j + 1] = by;
			Bb[j + 2] = bz;
			Aa[j] = by * tz - bz * ty;
			Aa[j + 1] = bz * tx - bx * tz;
			Aa[j + 2] = bx * ty - by * tx;
			rot(C, j);
			rot(T, j);
			rot(Aa, j);
			rot(Bb, j);
		}
		return { n, C, T, A: Aa, B: Bb, form: clamp01(form), t, roll: rho };
	}
	return { shape, kap, sT, LEN };
}

// ── The path: the swim, straight, then bending, then straight again ──────────
// A curve tabulated by arc length σ (a unit a step) with a rotation-minimising
// frame (T, N1, N2): T heads along −x from the nose's start, N1 = +z (the
// body's top, toward the first lens), N2 = +y. Its curvature is k1 toward N1
// and k2 toward N2, two slow sines in a window — the bends.
function makePath(bend0, bend1) {
	const S0 = -800;
	const S1 = 4800;
	const N = S1 - S0 + 1;
	const P = new Float64Array(3 * N);
	const T = new Float64Array(3 * N);
	const N1 = new Float64Array(3 * N);
	const N2 = new Float64Array(3 * N);
	const K1 = new Float64Array(N);
	const K2 = new Float64Array(N);
	const win = (s) => smooth(span(s, bend0, bend0 + 60)) * (1 - smooth(span(s, bend1 - 60, bend1)));
	const K = 1 / 150;
	const k1Of = (s) => K * win(s) * Math.sin((TAU * (s - bend0)) / 330 + 0.5);
	const k2Of = (s) => 0.7 * K * win(s) * Math.sin((TAU * (s - bend0)) / 450 + 1.4);
	const i0 = -S0;
	const set = (A, i, v) => {
		A[3 * i] = v[0];
		A[3 * i + 1] = v[1];
		A[3 * i + 2] = v[2];
	};
	const get = (A, i) => [A[3 * i], A[3 * i + 1], A[3 * i + 2]];
	for (let i = 0; i <= i0; i++) {
		set(P, i, [(i0 - i) * 1, 0, 0]);
		set(T, i, [-1, 0, 0]);
		set(N1, i, [0, 0, 1]);
		set(N2, i, [0, 1, 0]);
	}
	for (let i = i0; i < N - 1; i++) {
		const s = S0 + i + 0.5;
		const k1 = k1Of(s);
		const k2 = k2Of(s);
		K1[i] = k1;
		K2[i] = k2;
		let t = get(T, i);
		let a = get(N1, i);
		let b = get(N2, i);
		const k = Math.hypot(k1, k2);
		if (k > 1e-12) {
			// Rotate the frame by k about T × K̂ (K̂ = (k1 N1 + k2 N2)/k).
			const Kh = norm(add3(mul3(a, k1 / k), mul3(b, k2 / k)));
			const ax = norm(cross(t, Kh));
			const c = Math.cos(k);
			const sn = Math.sin(k);
			const R = (v) => {
				const kd = dot(ax, v);
				const kx = cross(ax, v);
				return add3(add3(mul3(v, c), mul3(kx, sn)), mul3(ax, kd * (1 - c)));
			};
			const t1 = norm(R(t));
			const p = add3(get(P, i), mul3(add3(t, t1), 0.5));
			t = t1;
			a = norm(R(a));
			b = norm(cross(t, a));
			set(P, i + 1, p);
		} else set(P, i + 1, add3(get(P, i), t));
		set(T, i + 1, t);
		set(N1, i + 1, a);
		set(N2, i + 1, b);
	}
	const at = (s) => {
		const f = Math.max(0, Math.min(N - 1.0001, s - S0));
		const i = Math.floor(f);
		const u = f - i;
		const L = (A) => [
			lerp(A[3 * i], A[3 * i + 3], u),
			lerp(A[3 * i + 1], A[3 * i + 4], u),
			lerp(A[3 * i + 2], A[3 * i + 5], u)
		];
		const ext = s - S0 - f; // past the table's ends: straight on
		const t = L(T);
		return { P: add3(L(P), mul3(t, ext)), T: t, N1: L(N1), N2: L(N2), i };
	};
	const curv = (s) => {
		const f = Math.max(0, Math.min(N - 2, Math.round(s - S0)));
		return [K1[f], K2[f]];
	};
	// P(s) + X N1(s) + Y N2(s), one array made: the tunnel's points.
	const placeAt = (s, X, Y) => {
		const f = Math.max(0, Math.min(N - 1.0001, s - S0));
		const i = Math.floor(f);
		const u = f - i;
		const ext = s - S0 - f;
		const j = 3 * i;
		const out = [0, 0, 0];
		for (let c = 0; c < 3; c++) {
			const a = j + c;
			const v = 1 - u;
			out[c] =
				v * P[a] +
				u * P[a + 3] +
				ext * (v * T[a] + u * T[a + 3]) +
				X * (v * N1[a] + u * N1[a + 3]) +
				Y * (v * N2[a] + u * N2[a + 3]);
		}
		return out;
	};
	return { at, curv, placeAt, point: (s) => at(s).P };
}

// ∫ of a smoothstep ramp of length D: a clock that starts at rest.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}

// The swimmer's speed (world units a second) and its arc along the path.
const SPEED = [
	[22.4, 0],
	[23.6, 24],
	[26.6, 30],
	[28.4, 34],
	[30.2, 120],
	[33.4, 145],
	[34.5, 56],
	[35.6, 20],
	[38.0, 13],
	[42, 13]
];
const SIG = (() => {
	const dt = 0.005;
	const out = [0];
	let s = 0;
	for (let t = B.swim; t < SECONDS + 2; t += dt) {
		s += Math.max(0, spline(t + dt / 2, SPEED)) * dt;
		out.push(s);
	}
	return { dt, out };
})();
const sigmaAt = (t) => {
	if (t <= B.swim) return 0;
	const f = (t - B.swim) / SIG.dt;
	const i = Math.min(SIG.out.length - 2, Math.floor(f));
	return lerp(SIG.out[i], SIG.out[i + 1], f - i);
};
const speedAt = (t) => (t <= B.swim ? 0 : Math.max(0, spline(t, SPEED)));

// How far behind the nose the lens rides, along the path.
const BACK_KEYS = [
	[22.4, 70],
	[24, 96],
	[27, 92],
	[30, 92],
	[33, 110],
	[35, 100]
];
const backAt = (t) => spline(t, BACK_KEYS);

// ── The world's numbers ──────────────────────────────────────────────────────
const FOV = 38;
// On a board narrower than 16:10 the vertical field widens so the lens
// covers as much across as it does on a laptop (a phone held upright).
const fovOf = (w, h) =>
	w / h >= 1.6
		? FOV
		: Math.min(100, (360 / Math.PI) * Math.atan((Math.tan((FOV * Math.PI) / 360) * 1.6 * h) / w));
const RT = 60; // the disc's rim and the tunnel's radius
const ZD = Math.round(sigmaAt(29.3)); // the disc's plane: the nose reaches it at 29.3
const DELTA = (RT * Math.log(PHI)) / PHYLLO.k; // one seed's depth step in the tunnel
const BEND0 = ZD + 300; // the bends start past the fog of the opened tunnel
const SC0 = Math.round(sigmaAt(35.3)); // the automaton's stretch: generation G here …
const BEND1 = SC0 - 70; // … the path straight again before it
const N_OPEN = 280; // seeds placed by the opening (deeper ones are under a pixel until the log map, when the window takes over)
const UP0 = [0, 1, 0];
// The fall opens a little further out than the kit's, and at a steadier
// pace (its speed ∝ (c + x)³(1 − x)², c 0.8 for the kit's 0.35): it opens at
// about half an e-fold a second, which the dive into the cell arrives at.
const ZETA0 = -0.9;
const PACE = { n: 512, c: 0.8 };

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-harmonic · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null)
	]);
	const answers = makeAnswers({ live, beats: EB });
	const ans = answers.answers;
	const path = makePath(BEND0, BEND1);
	// ?prof=1: each part's milliseconds a frame (a running mean), on __lab.prof.
	const PROF = q.get('prof') === '1' ? {} : null;
	const now = () => performance.now();
	const tick = (name, t0) => {
		if (!PROF) return;
		const d = now() - t0;
		PROF[name] = PROF[name] === undefined ? d : 0.9 * PROF[name] + 0.1 * d;
	};
	const Z = makeDepth(4);

	// ── What the answers make (remade when they change) ──────────────────────
	let S = null;
	function settle() {
		const key = `${ans.date}|${ans.spice}|${forced}`;
		if (S && S.key === key) return S;
		const spec = specOf(ans);
		const body = makeBody(spec);
		const coef = coeffsOf(ans.date);
		const waves = wavesOf(ans.spice);
		const beat = makeBeat(body, spec, coef, waves);
		const decade = forced ?? decadeOfDate(ans.date);
		const fall = makeFall({
			art,
			order: orderOf(decade),
			beats: { fall: B.fall, land: B.land, colour: B.colour, swim: [-2, -1] },
			zeta0: ZETA0,
			pace: PACE
		});
		const NR = body.rings.length;
		const jTail = body.rings.findIndex((i) => body.stations[i].part === 'tail');
		S = {
			key,
			spec,
			body,
			coef,
			waves,
			beat,
			decade,
			fall,
			ca: automaton(ans.date, ans.spice),
			NR,
			fTail: jTail / NR,
			inflated: new Map()
		};
		return S;
	}
	settle();
	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: ans,
		decade: S.decade
	};

	// ── The phyllo disc, once ────────────────────────────────────────────────
	const SEEDS = seeds({ n: N_OPEN, R: RT });
	const SP8 = [];
	const SP13 = [];
	for (let j = 0; j < 8; j++) SP8.push(parastichy(8, j, { R: RT, n: N_OPEN, per: 6 }));
	for (let j = 0; j < 13; j++) SP13.push(parastichy(13, j, { R: RT, n: N_OPEN, per: 4 }));
	const RIM = [];
	for (let i = 0; i <= 120; i++) RIM.push({ theta: (TAU * i) / 120, rho: RT });

	// ── The star field round the path (seeded, fixed) ────────────────────────
	const STARS = (() => {
		let s = 8191;
		const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
		const out = [];
		// Just outside the wall (1.15 – 3.4 radii), where the lens sees them
		// a few hundred units ahead: nearer, they are off the frame.
		for (let i = 0; i < 1100; i++) {
			const sg = -500 + rnd() * (SC0 + 1500);
			const th = rnd() * TAU;
			const r = RT * (1.15 + 2.25 * Math.pow(rnd(), 1.3));
			out.push({ sg, th, r, b: 0.35 + 0.65 * rnd() });
		}
		return out.sort((a, b) => a.sg - b.sg);
	})();

	// ── The entry's live hand: when each digit came and went ────────────────
	const KEYT = (() => {
		const SB = {
			q1: EB.q1,
			type1: EB.wait1,
			e1: EB.e1,
			q2: EB.q2,
			drag2: EB.wait2 + 0.3,
			e2: EB.e2
		};
		const out = [];
		for (let i = 0; i <= 3000 && out.length < 8; i++) {
			const t = EB.wait1 + i * 0.001;
			const n = script(t, SB).typed.length;
			while (out.length < n) out.push(t);
		}
		while (out.length < 8) out.push(Infinity);
		return out;
	})();
	let events = Array.from({ length: 8 }, () => []);
	let typedNow = '';
	let secsC0 = null; // live: the secs at which the carrier began
	function remember(hand, t) {
		if (t < EB.q1 - 0.05) {
			events = Array.from({ length: 8 }, () => []);
			typedNow = '';
			secsC0 = null;
			return;
		}
		if (secsC0 === null && t >= B.carrier[0]) secsC0 = hand.secs - (t - B.carrier[0]);
		const typed = hand.typed;
		for (let i = 0; i < 8; i++) {
			const a = typedNow[i];
			const b = typed[i];
			if (a === b) continue;
			events[i].push({ secs: hand.secs, d: b === undefined ? null : Number(b) });
		}
		typedNow = typed;
	}
	// Digit k's weight (unshared) at τ — the clock the hand's events are on.
	function digitAt(k, tau, hand) {
		if (!live) {
			const ch = DEMO.date[k];
			if (tau < KEYT[k] || hand.typed.length <= k) return 0;
			return Number(ch) * smooth(span(tau - KEYT[k], 0, GROW));
		}
		const ev = events[k];
		let j = ev.length - 1;
		while (j >= 0 && ev[j].secs > tau) j--;
		if (j < 0) return 0;
		const e = ev[j];
		if (e.d !== null) return e.d * smooth(span(tau - e.secs, 0, GROW));
		const p = ev[j - 1];
		if (!p || p.d === null) return 0;
		const g0 = smooth(span(e.secs - p.secs, 0, GROW));
		return p.d * g0 * (1 - smooth(span(tau - e.secs, 0, SHRINK)));
	}
	// The arms' lengths at τ, R × w/Σw scaled by the carrier's growth (so the
	// first arm grows out of the stop). `final`: the answers' own.
	function lengthsAt(tau, hand, R, final) {
		const c0 = live ? (secsC0 ?? Infinity) : B.carrier[0];
		const g = final ? 1 : smooth(span(tau, c0, c0 + (B.carrier[1] - B.carrier[0])));
		const w = new Array(NH);
		w[0] = g;
		let sum = g;
		for (let k = 0; k < 8; k++) {
			const d = final ? Number(ans.date[k]) || 0 : digitAt(k, tau, hand);
			w[k + 1] = d * SHARE[k] * g;
			sum += w[k + 1];
		}
		if (sum <= 1e-9) return null;
		return w.map((x) => (R * g * x) / sum);
	}

	// ── The entry's layout, per board size ───────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		const fq = Math.max(11, L.fs);
		ctx.save();
		ctx.font = TECHF(fq);
		const cell = ctx.measureText('0').width;
		const wQ1 = ctx.measureText(Q1_TEXT).width;
		const wQ2 = ctx.measureText(Q2_TEXT).width;
		ctx.restore();
		const U = Math.min(0.11 * h, 0.075 * w);
		const R = 1.15 * U;
		const WW = 8 * U;
		const total = 2 * R + 0.6 * U + WW;
		const px = (w - total) / 2 + R;
		const py = 0.4 * h;
		const xw0 = px + R + 0.6 * U;
		const cx = 0.5 * w;
		const yQ1 = 0.72 * h;
		const yF = yQ1 + 1.75 * fq;
		const yQ2 = yF + 2.1 * fq;
		const ty = yQ2 + 1.6 * fq;
		const sp = Math.max(2.3 * cell, Math.min(0.065 * w, 30));
		G = {
			w,
			h,
			L,
			stop: L.stop,
			fq,
			cell,
			R,
			WW,
			px,
			py,
			xw0,
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

	// ── The entry's phase ────────────────────────────────────────────────────
	// On t, the wave's travel eases to a stop; live, while the questions are
	// asked, on the real seconds (the run is held at a question), handed to t
	// over the second after the spice's Enter by the shortest turn (whole
	// harmonics, so every arm agrees).
	const tStill = (t) => {
		const [a, b] = B.still;
		if (t <= a) return t;
		const x = Math.min(t, b) - a;
		const D = b - a;
		const u = x / D;
		return a + D * (u - (u * u * u - (u * u * u * u) / 2));
	};
	const PHI_F = (TAU * tStill(B.still[1])) / T0; // where the wave stops
	// The body's phase at rest: the drawn wave's (the bending wave integrated
	// twice keeps its fundamental where the drawing has it).
	const PH_B = PHI_F;
	function phaseOf(t, hand) {
		const pt = (TAU * tStill(t)) / T0;
		if (!live) return pt;
		const ps = (TAU * hand.secs) / T0;
		const k = smooth(span(t, EB.e2, EB.e2 + 1));
		if (k <= 0) return ps;
		let d = (ps - pt) % TAU;
		if (d > Math.PI) d -= TAU;
		if (d < -Math.PI) d += TAU;
		return pt + d * (1 - k);
	}

	// ── The entry, drawn ─────────────────────────────────────────────────────
	let SL = null;
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
	const setCursor = (c) => {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	};

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

	// The wave's samples on the board at t: [x, y] from the pen's foot out.
	function waveAt(g, t, hand, Phi, n, upto = 1) {
		const now = live ? hand.secs : t;
		const c0 = live ? (secsC0 ?? Infinity) : B.carrier[0];
		const step = 2;
		const N = Math.ceil(g.WW / step);
		const pts = [];
		// Behind a trace's head (the date's from e1, the spice's from e2) the
		// answers are in: the waveform is theirs all the way out.
		const head = t >= EB.e1 ? g.WW * clamp01((t - EB.e1) / B.trace) : -1;
		let fixed = null;
		for (let j = 0; j <= N * upto; j++) {
			const dx = Math.min(g.WW, j * step);
			const back = (dx / g.WW) * n * T0; // seconds of the pen's history
			const tau = now - back;
			const fin = dx <= head || t >= EB.e1 + B.trace;
			if (!fin && tau < c0) break;
			let r;
			if (fin && t >= EB.e1) r = fixed ??= lengthsAt(now, hand, g.R, true);
			else r = lengthsAt(tau, hand, g.R, false);
			if (!r) break;
			const ph = Phi - (TAU * n * dx) / g.WW;
			let y = 0;
			for (let hh = 1; hh <= NH; hh++) if (r[hh - 1] > 0.01) y += r[hh - 1] * Math.sin(hh * ph);
			pts.push([g.xw0 + dx, g.py - y]);
		}
		return pts;
	}

	function trace(ctx, pts, t, t0, out) {
		if (t < t0 || t > t0 + B.trace + 1.4 || pts.length < 2) return;
		const N = pts.length - 1;
		const x = (t - t0) / B.trace;
		const head = Math.min(N, Math.floor(N * clamp01(x)));
		const per = Math.max(2, Math.ceil(N / 90));
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

	function entry(ctx, w, h, t, hand) {
		const g = geom(ctx, w, h);
		if (t < FREEZE) {
			SL = null;
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			return;
		}
		const pan = easeIO(span(t, ...B.pan));
		const X = lerp(g.stop.x, g.px, pan);
		const Y = lerp(g.stop.y, g.py, pan);
		title(ctx, g, t);
		const out = 1;
		if (live) remember(hand, t);
		const Phi = phaseOf(t, hand);
		const n = wavesOf(hand.value);
		// The wave: the pen's height carried out to the right.
		if (t >= EB.q1 && out > 0.004) {
			const pts = waveAt(g, t, hand, Phi, n);
			if (pts.length > 1) {
				stroke(ctx, pts, { width: 1.15, alpha: 0.55 * out });
				trace(ctx, pts, t, EB.e1, out);
				trace(ctx, pts, t, EB.e2, out);
			}
			// The arms, from the pivot, at h·Φ; folding home the last first.
			const now = live ? hand.secs : t;
			const r = lengthsAt(now, hand, g.R, t >= EB.e1 + B.trace);
			if (r) {
				let x = X;
				let y = Y;
				let reach = 0;
				for (let hh = 1; hh <= NH; hh++) {
					const f0 = B.fold + 0.06 * (NH - hh);
					const rk = r[hh - 1] * (1 - smooth(span(t, f0, f0 + 0.36)));
					if (rk < 0.05) continue;
					const ang = hh * Phi;
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
						{ width: 1, alpha: 0.32 * out }
					);
					x = nx;
					y = ny;
					reach += rk;
				}
				// The projector: the pen's height, out to the wave's foot.
				if (pts.length) {
					const pa = 0.22 * out * (reach > 0.5 ? 1 : 0);
					stroke(
						ctx,
						[
							[x, y],
							[g.xw0, pts[0][1]]
						],
						{ width: 1, alpha: pa, dash: [3, 4] }
					);
				}
				if (reach > 0.5) disc(ctx, x, y, 2.1, { fill: PAL.gold, alpha: 0.62 * out });
			}
		}
		// The stop: the pivot, a full chalk dot (from the lift on it is the
		// 3D drawing's, gliding to the nose).
		if (out > 0.004) disc(ctx, X, Y, g.stop.r, { fill: PAL.chalk, alpha: 0.95 * out });

		// The questions and their fields.
		const fade = 1 - smooth(span(t, ...B.asks));
		if (fade > 0.004) {
			const q1a = fade * lerp(1, 0.55, smooth(span(t, EB.e1 + 0.3, EB.e1 + 1)));
			ask(ctx, g, Q1_TEXT, K1, EB.q1, t, g.xQ1, g.yQ1, q1a);
			field(ctx, g, t, hand, fade);
			const q2a = fade * lerp(1, 0.55, smooth(span(t, EB.e2 + 0.3, EB.e2 + 1)));
			ask(ctx, g, Q2_TEXT, K2, EB.q2, t, g.xQ2, g.yQ2, q2a);
			slider(ctx, g, t, hand, fade);
		} else SL = null;
		if (live) {
			let cur = '';
			if (hand.asking === 'spice' && SL) {
				if (hand.held) cur = 'grabbing';
				else if (hover && onSlider(hover[0], hover[1])) cur = 'grab';
			}
			setCursor(cur);
		}
	}

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
	function field(ctx, g, t, hand, out) {
		const fa = out * smooth(span(t, ...B.field));
		if (fa <= 0.004) return;
		const typed = hand.typed;
		const bad = badGroups(typed);
		const after = lerp(1, 0.8, smooth(span(t, EB.e1 + 0.3, EB.e1 + 1)));
		const qDone = t >= EB.q1 + K1[K1.length - 1] || typed.length > 0;
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
		const after = lerp(1, 0.7, smooth(span(t, EB.e2 + 0.4, EB.e2 + 1.2)));
		const a = out * after;
		const v = hand.value;
		const near = Math.round(v);
		const held = hand.held > 0;
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
		const hx = x1 + ((v - 1) / 9) * (x10 - x1);
		const hw = Math.max(3, 0.34 * cell);
		const hh = (held ? 1.1 : 1) * fq;
		const ha = smooth(span(sA, 0.35, 0.8));
		ctx.save();
		ctx.globalAlpha = ha * a * (held ? 0.98 : 0.88);
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - hw / 2, ty - hh / 2, hw, hh);
		ctx.restore();
		text(ctx, String(near), x10 + 0.9 * sp, ty + 0.36 * fq, fq, 0.92 * ha * a);
		SL = { x1, x10, ty, sp, a: out * sA };
	}

	// ── The world from the compile on ────────────────────────────────────────
	// The body is built with its nose at the origin heading −x, its top (the
	// head's thickness) toward +z, so its beat lies in the board's plane; the
	// board's camera looks straight at that plane from +z, the window's wave
	// at the tail's scale. The swim lays it on the path, which starts there.
	const frameUp = (sg) => path.at(sg).N1;
	const poseAt = (sg) => ({ path: path.point, sigma: sg, up: frameUp });
	function boardCam(g, w, h) {
		const s = settleNow();
		const spx = g.WW / (s.body.length - s.beat.sT);
		const k = h / 2 / Math.tan((fovOf(w, h) * Math.PI) / 360);
		const D = k / spx;
		const Xc = s.beat.sT - (g.xw0 - w / 2) / spx;
		const Yc = (g.py - h / 2) / spx;
		return { pos: [Xc, Yc, D], target: [Xc, Yc, 0], up: UP0, spx };
	}
	const settleNow = () => settle();

	// The lens during the compile: keyed in the build's world (the nose at the
	// origin, the tail out along +x), from the board's camera round the body.
	function compileLens(t, g, w, h, front) {
		const bc = boardCam(g, w, h);
		const u = Math.max(B.lift[0], t);
		const sw = swimLens(B.round[1]);
		const pos = spline3(u, [
			[B.lift[0], bc.pos],
			[17.3, [40, 16, 46]],
			[19.9, [-3, 6, 11]],
			[20.6, [-11, 6, 14]],
			[21.5, [-14, 16, 46]],
			[22.4, [12, 42, 92]],
			[23.1, [92, 42, 44]],
			[B.round[1], sw.pos]
		]);
		const target = spline3(u, [
			[B.lift[0], bc.target],
			[17.3, [42, 0, 0]],
			[19.9, [10, 0, 0]],
			[20.6, [3.5, 0, 0]],
			[21.5, [14, 0, 0]],
			[22.4, [14, 0, 0]],
			[23.1, [-10, 0, 0]],
			[B.round[1], sw.target]
		]);
		// The sweep runs tip → neck, toward the head: the lens rides with the
		// ring being laid, a little ahead of it (head-ward) and above, looking
		// back along the tube as it is made — so the ride ends at the neck,
		// where the midpiece and the head are built next, and hands to the
		// keys above without a swing back down the tail.
		const ws = smooth(span(t, 17.0, 18.0)) * (1 - smooth(span(t, 19.35, 20.2)));
		const fpos = add3(front, [-8, 5, 9]);
		const ftgt = add3(front, [4, 0, 0]);
		const k = smooth(span(t, 22.6, B.round[1]));
		const up = norm(add3(mul3(UP0, 1 - k), mul3(sw.up, k)));
		return {
			pos: add3(mul3(pos, 1 - ws), mul3(fpos, ws)),
			target: add3(mul3(target, 1 - ws), mul3(ftgt, ws)),
			up
		};
	}
	// Behind the swimmer, on the path, banking into the turns.
	function swimLens(t) {
		const sg = sigmaAt(t);
		const back = backAt(t);
		const onAxis = smooth(span(t, 25.6, 27.3)) * (1 - smooth(span(t, 28.8, 30.4)));
		const upOff = lerp(
			spline(t, [
				[23.7, 30],
				[25.6, 24],
				[30.4, 22]
			]),
			0,
			onAxis
		);
		const side = lerp(
			spline(t, [
				[23.7, -34],
				[25.6, -26],
				[30.4, -30]
			]),
			0,
			onAxis
		);
		const sl = sg - back;
		const F = path.at(sl);
		const k = path.curv(sl + 50);
		const bank = Math.max(-0.5, Math.min(0.5, -46 * k[0])) * smooth(span(t, 30, 31));
		const up = norm(add3(mul3(F.N2, Math.cos(bank)), mul3(F.N1, Math.sin(bank))));
		const pos = add3(F.P, add3(mul3(F.N2, upOff), mul3(F.N1, side)));
		const target = path.point(sg + lerp(70, 34, smooth(span(t, 29.4, 30.6))));
		return { pos, target, up };
	}

	// ── The automaton's world ────────────────────────────────────────────────
	// Generation g on the ring at σ = SC1 − g·Δg (the seed ring furthest), cell
	// x at the angle (x − c)·2π/W from the floor; unrolled by `b` (1 the tube,
	// 0 the floor) with the arcs kept.
	function caWorld() {
		const s = settleNow();
		const fg = s.fall.geometry(board.w, board.h).levels[0].glass;
		const aspect = fg.w / fg.h;
		const cw = (TAU * RT) / CA.W;
		const dg = cw / aspect;
		const SC1 = SC0 + CA.G * dg;
		const F = path.at(SC0);
		const U = F.N2; // the floor is −U
		const Lat = norm(cross(F.T, U));
		return { cw, dg, SC1, T: F.T, U, Lat, P0: F.P, aspect };
	}
	function caPoint(W, sg, x, b) {
		const sArc = (x - CA.W / 2) * W.cw; // arc from the floor's middle
		let lx;
		let ly;
		const kap = b / RT;
		if (kap < 1e-6) {
			lx = sArc;
			ly = -RT;
		} else {
			lx = Math.sin(kap * sArc) / kap;
			ly = -RT + (1 - Math.cos(kap * sArc)) / kap;
		}
		const base = add3(W.P0, mul3(W.T, sg - SC0));
		return add3(base, add3(mul3(W.Lat, lx), mul3(W.U, ly)));
	}

	// The lens through the interim: from behind the swimmer up over the
	// unrolling floor, and down into the cone's apex at the fall's pace.
	function interimLens(t, w, h) {
		const s = settleNow();
		const W = caWorld();
		const k = h / 2 / Math.tan((fovOf(w, h) * Math.PI) / 360);
		const apexS = W.SC1 - 0.5 * W.dg;
		const apexX = s.ca.c0 + 0.5;
		const Q = caPoint(W, apexS, apexX, 0);
		// The fall's first glass on the board, and its pace.
		const geo = s.fall.geometry(w, h);
		const P0 = geo.pose(ZETA0);
		const gl = geo.levels[0].glass;
		const gw = (geo.F * gl.w) / (P0.z - gl.z);
		const Hf = (k * W.cw) / gw;
		const r1 = geo.rate0;
		// The overview: the whole floor, its middle under the lens.
		const mid = caPoint(W, (SC0 + W.SC1) / 2 + 6, CA.W / 2, 0);
		// The dive: the zoom's rate r(x) = r₁(2x − x²) from rest to the fall's
		// opening rate r₁, only ever gathering; its e-folds r₁D·⅔ fix the
		// height it starts from (≈ the cone in view).
		const [d0, d1] = B.dive;
		const D = d1 - d0;
		const Hd = (tt) => {
			const x = clamp01((tt - d0) / D);
			return Hf * Math.exp(r1 * D * (2 / 3 - x * x + (x * x * x) / 3));
		};
		const Hstart = Hd(d0);
		// Over the floor: from the overview's middle to the apex.
		const slide = smooth(span(t, B.cone[0] + 0.6, d1 - 0.5));
		const foot = add3(mul3(mid, 1 - slide), mul3(Q, slide));
		const H = t < d0 ? Hstart : Hd(t);
		const over = { pos: add3(foot, mul3(W.U, H)), target: foot, up: W.T };
		if (window.__lab) window.__lab.dbg = { H, Hf, gw, r1, Hstart, cw: W.cw, k };
		return { over, Q, W, Hf, gw, r1 };
	}

	// ── Drawing helpers (3D) ─────────────────────────────────────────────────
	const COLORS = [];
	// Segments batched by colour, alpha and width; a segment that starts
	// where the batch's last one ended extends its run, so a ring or a
	// spiral is one polyline (fewer subpaths, no caps between). `round`:
	// round caps (a star's dot is a segment of no length).
	function makeInk() {
		const B2 = new Map();
		return {
			seg(color, al, wd, x0, y0, x1, y1, round = false) {
				if (al < 0.012) return;
				const a = Math.min(20, Math.round(al * 20));
				const wq = Math.min(63, Math.max(1, Math.round(wd * 4)));
				let ci = COLORS.indexOf(color);
				if (ci < 0) ci = COLORS.push(color) - 1;
				const key = ((ci * 32 + a) * 64 + wq) * 2 + (round ? 1 : 0);
				let b = B2.get(key);
				if (!b) B2.set(key, (b = { color, a: a / 20, w: wq / 4, round, R: [], lx: NaN, ly: NaN }));
				if (x0 === b.lx && y0 === b.ly) b.R[b.R.length - 1].push(x1, y1);
				else b.R.push([x0, y0, x1, y1]);
				b.lx = x1;
				b.ly = y1;
			},
			flush(ctx) {
				ctx.save();
				ctx.lineJoin = 'round';
				for (const b of B2.values()) {
					ctx.strokeStyle = b.color;
					ctx.globalAlpha = b.a;
					ctx.lineWidth = b.w;
					ctx.lineCap = b.round ? 'round' : 'butt';
					ctx.beginPath();
					for (const P of b.R) {
						ctx.moveTo(P[0], P[1]);
						for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
					}
					ctx.stroke();
				}
				ctx.restore();
				B2.clear();
			}
		};
	}

	// The tunnel's straight coordinates [X, Y, Z] (phyllo's: the disc in Z = 0,
	// the tunnel into −Z) laid along the path: Z = −d is σ = ZD + d, X along
	// N1, Y along N2 — straight for `bendIn` 0, the path's curve for 1.
	function place(X, Y, Zc, bendIn) {
		const sg = ZD - Zc;
		if (bendIn <= 0 || sg < BEND0 - 10) return [-sg, Y, X];
		const c = path.placeAt(sg, X, Y);
		if (bendIn >= 1) return c;
		const k = 1 - bendIn;
		return [k * -sg + bendIn * c[0], k * Y + bendIn * c[1], k * X + bendIn * c[2]];
	}

	// A seed's frame on the open tunnel (the log map): its centre, and the
	// wall's derivatives in θ and in ln ρ, by forward differences (three
	// placings, not seedFrame's five).
	function logFrame(sd, bendIn) {
		const hh = 1e-3;
		const d = RT * Math.log(RT / sd.rho);
		const c = place(RT * Math.cos(sd.theta), RT * Math.sin(sd.theta), -d, bendIn);
		const a = place(RT * Math.cos(sd.theta + hh), RT * Math.sin(sd.theta + hh), -d, bendIn);
		const r = place(RT * Math.cos(sd.theta), RT * Math.sin(sd.theta), -(d - RT * hh), bendIn);
		return { c, e1: mul3(sub3(a, c), 1 / hh), e2: mul3(sub3(r, c), 1 / hh) };
	}

	// The disc and the tunnel of golden rings.
	function tunnel(ctx, cam, w, h, t, ink, lensSigma) {
		const x = smooth(span(t, ...B.open));
		const lg = smooth(span(t, ...B.log));
		const bendIn = smooth(span(t, ...B.bend));
		const done = x >= 1 && lg >= 1;
		const off = 1 - smooth(span(t, ...B.seedsOff));
		if (off <= 0.004) return;
		const mapS = (s) => {
			if (done) {
				const d = RT * Math.log(RT / s.rho);
				return place(RT * Math.cos(s.theta), RT * Math.sin(s.theta), -d, bendIn);
			}
			const p = opening(s, x, { R: RT, a: RT, E: E_OPEN, log: lg });
			return place(p[0], p[1], p[2], bendIn);
		};
		const near = (px) => 1 - smooth(span(px, 26, 120));
		const fog = (z) => 1 - lg * smooth(span(z, 2.4 * RT, 6 * RT));
		// Beyond the automaton's stretch the tunnel is gone.
		const caCut = (sg) => 1 - smooth(span(sg, SC0 - 30, SC0));
		const line = (pts, al, wd, upto = 1, color = PAL.chalk) => {
			const end = (pts.length - 1) * upto;
			let qa = cam.project(mapS(pts[0]));
			for (let i = 1; i < pts.length && i - 1 < end; i++) {
				const qb = cam.project(mapS(pts[i]));
				if (qa[2] > NEAR && qb[2] > NEAR) {
					const mz = (qa[2] + qb[2]) / 2;
					const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, mz];
					if (!Z.hidden(mid)) {
						const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
						ink.seg(
							color,
							al * off * near(L) * smooth(span(L, 0.5, 4)) * fog(mz),
							wd,
							qa[0],
							qa[1],
							qb[0],
							qb[1]
						);
					}
				}
				qa = qb;
			}
		};
		// The seeds in view: the disc's while it opens; after, a window of the
		// lattice round the lens (it is self-similar).
		let list = SEEDS;
		if (done) {
			const nL = Math.floor((lensSigma - ZD) / DELTA);
			const from = Math.max(0, nL - 30);
			const to = Math.min(Math.floor((SC0 - ZD) / DELTA), nL + Math.ceil((6.2 * RT) / DELTA));
			list = to > from ? seeds({ n: to - from, R: RT, from }) : [];
		}
		// The rim.
		if (!done) line(RIM, 0.5, 1, smooth(span(t, ...B.rim)));
		const dts = (B.seeds[1] - B.seeds[0]) / PHYLLO.n;
		for (let i = 0; i < list.length; i++) {
			const sd = list[i];
			const ti = B.seeds[0] + Math.min(sd.n, PHYLLO.n) * dts;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			const sg = ZD + (done ? sd.n * DELTA : 0);
			const cut = done ? caCut(sg) : 1;
			if (cut <= 0.01) continue;
			const F = done ? logFrame(sd, bendIn) : seedFrame(sd, mapS);
			const qc = cam.project(F.c);
			if (qc[2] <= NEAR) continue;
			const fa = fog(qc[2]);
			if (a * fa < 0.02) continue;
			const r = PHYLLO.seedR * pop * (1 - 0.45 * lg);
			const q1 = cam.project(add3(F.c, mul3(F.e1, r)));
			const q2 = cam.project(add3(F.c, mul3(F.e2, r)));
			if (q1[2] <= NEAR || q2[2] <= NEAR) continue;
			const big = Math.max(
				Math.hypot(q1[0] - qc[0], q1[1] - qc[1]),
				Math.hypot(q2[0] - qc[0], q2[1] - qc[1])
			);
			if (big < 0.8) continue;
			if (qc[0] + big < 0 || qc[0] - big > w || qc[1] + big < 0 || qc[1] - big > h) continue;
			if (Z.hidden(qc)) continue;
			const m = Math.max(6, Math.min(32, Math.round(4 + big / 2)));
			const al = 0.72 * a * near(big) * smooth(span(big, 1.2, 6)) * fa * off * cut;
			const wd = Math.min(1.35, 0.5 + big * 0.1);
			// Gold far down the tunnel, chalk near: the rings' gold is the depth
			// (in four tones, so a ring warms as it recedes rather than flips).
			const color = done
				? TONES[Math.round(3 * smooth(span(qc[2], 1.4 * RT, 3.4 * RT)))]
				: PAL.chalk;
			let pa = null;
			for (let kk = 0; kk <= m; kk++) {
				const c = Math.cos((TAU * kk) / m);
				const s = Math.sin((TAU * kk) / m);
				const p = [
					qc[0] + c * (q1[0] - qc[0]) + s * (q2[0] - qc[0]),
					qc[1] + c * (q1[1] - qc[1]) + s * (q2[1] - qc[1])
				];
				if (pa) ink.seg(color, al, wd, pa[0], pa[1], p[0], p[1]);
				pa = p;
			}
		}
		// The spirals: the disc's while it opens; after, the window's.
		const p8 = smooth(span(t, ...B.sp8));
		const p13 = smooth(span(t, ...B.sp13));
		if (!done) {
			if (p8 > 0) for (const sp of SP8) line(sp, 0.55, 1.05, p8);
			if (p13 > 0) for (const sp of SP13) line(sp, 0.42, 0.95, p13);
		} else if (list.length) {
			const v0 = list[0].n;
			const v1 = list[list.length - 1].n;
			for (const [m, per, al, wd] of [
				[8, 6, 0.55, 1.05],
				[13, 4, 0.42, 0.95]
			]) {
				const e = PHYLLO.eps[m];
				for (let j = 0; j < m; j++) {
					const pts = [];
					const qs = Math.floor((v0 - j) / m);
					for (let qq = qs; qq * m + j <= v1 + m; qq += 1 / per) {
						const v = qq * m + j;
						const theta = j * PHYLLO.alpha + ((v - j) * TAU * e) / m;
						pts.push({ theta, rho: RT * Math.pow(PHI, -v / PHYLLO.k), v });
					}
					if (pts.length > 1) line(pts, al, wd, 1);
				}
			}
		}
		// The hoops: every 21st seed's cross-section, dim gold, so the bends read.
		const ho = smooth(span(t, ...B.hoops));
		if (ho > 0 && list.length) {
			const v0 = Math.ceil(list[0].n / 21) * 21;
			for (let v = v0; v <= list[list.length - 1].n; v += 21) {
				const sg = ZD + v * DELTA;
				const cut = done ? caCut(sg) : 1;
				if (cut <= 0.01) continue;
				const rho = RT * Math.pow(PHI, -v / PHYLLO.k);
				const pts = [];
				for (let i = 0; i <= 72; i++) pts.push({ theta: v * PHYLLO.alpha + (TAU * i) / 72, rho });
				line(pts, 0.32 * ho * cut, 1, 1, GOLD_DIM);
			}
		}
		// The apex: the lattice's fixed point, then the far end, lit.
		const ap = smooth(span(t, 26.2, 27.2)) * (1 - lg);
		if (ap > 0.01) {
			const P = mapS({ theta: 0, rho: RT * 1e-4 });
			const qa = cam.project(P);
			if (qa[2] > NEAR && !Z.hidden(qa)) lit3(ctx, cam, P, 2.2, 0.8 * ap);
		}
	}
	// The lens on the disc's axis at the opening: E its distance from the disc.
	const E_OPEN = ZD - (sigmaAt(B.open[0]) - backAt(B.open[0]));

	// The star field: each star streaked along the path for the shutter's time.
	function stars(ctx, cam, t, ink, alpha, lensSigma) {
		if (alpha <= 0.004) return;
		// Each star streaked along the path for the shutter's time, so the
		// streaks radiate from the tunnel's vanishing point and lengthen with
		// the pace (a dot while it is slow).
		const v = speedAt(t);
		const shutter = 0.22;
		const L = v * shutter;
		const bendIn = smooth(span(t, ...B.bend));
		const lo = lensSigma + 30;
		const hi = lensSigma + 16 * RT;
		for (const st of STARS) {
			if (st.sg < lo) continue;
			if (st.sg > hi) break;
			const X = st.r * Math.cos(st.th);
			const Y = st.r * Math.sin(st.th);
			const p = place(X, Y, ZD - st.sg, bendIn);
			const q = cam.project(p);
			if (q[2] <= NEAR) continue;
			if (q[0] < -40 || q[0] > board.w + 40 || q[1] < -40 || q[1] > board.h + 40) continue;
			const a =
				alpha *
				st.b *
				(0.16 + 0.14 * smooth(span(L, 2, 20))) *
				smooth(span(q[2], 40, 160)) *
				(1 - smooth(span(q[2], 10 * RT, 16 * RT)));
			if (L < 1.5) {
				ink.seg(PAL.chalk, a, 1.3, q[0], q[1], q[0] + 0.01, q[1], true);
				continue;
			}
			const p2 = place(X, Y, ZD - st.sg - L, bendIn); // where it was as the shutter opened
			const q2 = cam.project(p2);
			if (q2[2] <= NEAR) continue;
			ink.seg(PAL.chalk, a, 0.85, q[0], q[1], q2[0], q2[1]);
		}
	}

	// The automaton on the wall, then the floor. Every cell's corners are a
	// row's two σ and a lateral offset from a per-frame table (the unrolling's
	// arc → (along the floor, up)), projected inline — some 3000 live cells.
	const LXT = new Float64Array(2 * CA.W + 2);
	const LYT = new Float64Array(2 * CA.W + 2);
	function cells(ctx, cam, w, h, t, b, W) {
		const s = settleNow();
		const { rows, c0 } = s.ca;
		const rowsT = B.rows;
		const shown = smooth(span(t, rowsT[0] - 0.3, rowsT[0] + 0.3));
		if (shown <= 0) return;
		const coneA = smooth(span(t, ...B.cone));
		const gNow = lerp(CA.G + 0.999, 0, smooth(span(t, ...B.narrow)));
		// The apex cell goes as the fall's first room comes up round it; the
		// rest of the history clears first, so the room is not laid over it.
		const fadeOut = 1 - smooth(span(t, B.handoff[0], B.handoff[1]));
		const clear = 1 - smooth(span(t, B.clear[0], B.clear[1]));
		const rise = smooth(span(t, B.rise[0], B.rise[1]));
		const ew = 0.44;
		const eh = 0.42;
		// The lateral table: cell x's two edges at x + ½ ∓ ew.
		const kap = b / RT;
		for (let x = 0; x < CA.W; x++)
			for (let e = 0; e < 2; e++) {
				const sArc = (x + 0.5 + (e ? ew : -ew) - CA.W / 2) * W.cw;
				const j = 2 * x + e;
				if (kap < 1e-6) {
					LXT[j] = sArc;
					LYT[j] = -RT;
				} else {
					LXT[j] = Math.sin(kap * sArc) / kap;
					LYT[j] = -RT + (1 - Math.cos(kap * sArc)) / kap;
				}
			}
		// The lens, unpacked.
		const k = h / 2 / Math.tan((fovOf(w, h) * Math.PI) / 360);
		const [px, py, pz] = cam.pos;
		const [rx, ry, rz] = cam.r;
		const [ux, uy, uz] = cam.u;
		const [fx, fy, fz] = cam.f;
		const cx = w / 2;
		const cy = h / 2;
		// A point base + Lat·lx + U·ly into the lens's frame: X, Y, Z.
		const Lx = W.Lat;
		const Ux = W.U;
		const Qx = new Float64Array(4);
		const Qy = new Float64Array(4);
		const Qz = new Float64Array(4);
		const corner = (bx, by, bz, lx, ly, i) => {
			const X = bx + Lx[0] * lx + Ux[0] * ly - px;
			const Y = by + Lx[1] * lx + Ux[1] * ly - py;
			const Zw = bz + Lx[2] * lx + Ux[2] * ly - pz;
			const zc = X * fx + Y * fy + Zw * fz;
			Qz[i] = zc;
			if (zc <= NEAR) return false;
			Qx[i] = cx + (k * (X * rx + Y * ry + Zw * rz)) / zc;
			Qy[i] = cy - (k * (X * ux + Y * uy + Zw * uz)) / zc;
			return true;
		};
		const fills = new Map();
		const tc0 = now();
		for (let g = 0; g <= CA.G; g++) {
			const tg = lerp(rowsT[0], rowsT[1], g / CA.G);
			const ga = smooth(span(t, tg, tg + 0.25));
			if (ga <= 0) break;
			const sg = W.SC1 - (g + 0.5) * W.dg;
			const s0 = sg - eh * W.dg - SC0;
			const s1 = sg + eh * W.dg - SC0;
			const a0 = [W.P0[0] + W.T[0] * s0, W.P0[1] + W.T[1] * s0, W.P0[2] + W.T[2] * s0];
			const a1 = [W.P0[0] + W.T[0] * s1, W.P0[1] + W.T[1] * s1, W.P0[2] + W.T[2] * s1];
			const row = rows[g];
			for (let x = 0; x < CA.W; x++) {
				if (!row[x]) continue;
				const j0 = 2 * x;
				const j1 = j0 + 1;
				if (
					!corner(a0[0], a0[1], a0[2], LXT[j0], LYT[j0], 0) ||
					!corner(a0[0], a0[1], a0[2], LXT[j1], LYT[j1], 1) ||
					!corner(a1[0], a1[1], a1[2], LXT[j1], LYT[j1], 2) ||
					!corner(a1[0], a1[1], a1[2], LXT[j0], LYT[j0], 3)
				)
					continue;
				const xmin = Math.min(Qx[0], Qx[1], Qx[2], Qx[3]);
				const xmax = Math.max(Qx[0], Qx[1], Qx[2], Qx[3]);
				const ymin = Math.min(Qy[0], Qy[1], Qy[2], Qy[3]);
				const ymax = Math.max(Qy[0], Qy[1], Qy[2], Qy[3]);
				if (xmax < 0 || xmin > w || ymax < 0 || ymin > h) continue;
				const sz = Math.hypot(Qx[2] - Qx[0], Qy[2] - Qy[0]);
				if (sz < 0.4) continue;
				const nearA = 1 - smooth(span(sz, 90, 260)) * (1 - rise);
				const fogA = 1 - (1 - rise) * smooth(span(Qz[0], 3 * RT, 5.5 * RT));
				// Chalk at a modest alpha (a field of filled cells is a lot of
				// chalk); the cone a little brighter; its apex gold.
				const apex = g === 0 && x === c0;
				let al = 0.3 * ga * shown * nearA * fogA * (apex ? fadeOut : clear);
				let gold = false;
				if (coneA > 0) {
					if (Math.abs(x - c0) <= g && g <= gNow) {
						al = lerp(al, (apex ? 0.6 : 0.46) * ga * (apex ? fadeOut : clear), coneA);
						gold = apex;
					} else al *= lerp(1, 0.32, coneA);
				}
				if (al < 0.015) continue;
				const aq = Math.min(20, Math.round(al * 20));
				const key = aq + (gold ? 100 : 0);
				let f = fills.get(key);
				if (!f) fills.set(key, (f = { color: gold ? PAL.gold : PAL.chalk, a: aq / 20, q: [] }));
				f.q.push(Qx[0], Qy[0], Qx[1], Qy[1], Qx[2], Qy[2], Qx[3], Qy[3]);
			}
		}
		tick('cellsJS', tc0);
		const tc1 = now();
		// Seen straight down (the floor unrolled, the lens over it, its up the
		// generations' axis) every cell is an upright rectangle on the board:
		// fillRect, which the canvas does far faster than a path of quads.
		// So is one that is within a pixel of upright (the rise's last half): a
		// quad is drawn as a path only where its skew shows.
		const near = (a, c) => Math.abs(a - c) < 1.1;
		ctx.save();
		for (const f of fills.values()) {
			ctx.globalAlpha = f.a;
			ctx.fillStyle = f.color;
			const q = f.q;
			let open = false;
			for (let i = 0; i < q.length; i += 8) {
				if (
					near(q[i], q[i + 6]) &&
					near(q[i + 2], q[i + 4]) &&
					near(q[i + 1], q[i + 3]) &&
					near(q[i + 5], q[i + 7])
				) {
					const x0 = Math.min(q[i], q[i + 4]);
					const y0 = Math.min(q[i + 1], q[i + 5]);
					ctx.fillRect(x0, y0, Math.abs(q[i + 4] - q[i]), Math.abs(q[i + 5] - q[i + 1]));
					continue;
				}
				if (!open) {
					ctx.beginPath();
					open = true;
				}
				ctx.moveTo(q[i], q[i + 1]);
				ctx.lineTo(q[i + 2], q[i + 3]);
				ctx.lineTo(q[i + 4], q[i + 5]);
				ctx.lineTo(q[i + 6], q[i + 7]);
				ctx.closePath();
			}
			if (open) ctx.fill();
		}
		ctx.restore();
		tick('cellsFill', tc1);
		// The generations' rings, faint, and the seed ring, dim gold.
		const ink = makeInk();
		const ringA = 0.14 * shown * clear * (1 - 0.6 * coneA);
		for (let g = 0; g <= CA.G; g += 4) {
			const tg = lerp(rowsT[0], rowsT[1], g / CA.G);
			const ga = smooth(span(t, tg, tg + 0.25));
			if (ga <= 0) break;
			const sg = W.SC1 - g * W.dg;
			let qa = null;
			for (let x = 0; x <= CA.W; x += 2) {
				const qb = cam.project(caPoint(W, sg, x, b));
				if (qa && qa[2] > NEAR && qb[2] > NEAR) {
					const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
					ink.seg(
						g === 0 ? GOLD_DIM : PAL.chalk,
						ringA * ga * (1 - smooth(span(L, 60, 200))),
						1,
						qa[0],
						qa[1],
						qb[0],
						qb[1]
					);
				}
				qa = qb;
			}
		}
		// The light cone of the seed cell c₀: its edges, gold, from the apex.
		if (coneA > 0) {
			for (const side of [-1, 1]) {
				let qa = null;
				const gEnd = Math.min(CA.G + 1, gNow + 1);
				const steps = 48;
				for (let i = 0; i <= steps; i++) {
					const gg = (gEnd * i) / steps;
					const upto = smooth(
						span(t, B.cone[0] + 0.5 * (i / steps), B.cone[0] + 0.5 * (i / steps) + 0.6)
					);
					if (upto <= 0) break;
					const sg = W.SC1 - gg * W.dg;
					const xx = c0 + 0.5 + side * (gg + 0.5);
					const qb = cam.project(caPoint(W, sg, xx, b));
					if (qa && qa[2] > NEAR && qb[2] > NEAR)
						ink.seg(
							PAL.gold,
							0.6 * coneA * lerp(clear, fadeOut, 0.5),
							1.3,
							qa[0],
							qa[1],
							qb[0],
							qb[1]
						);
					qa = qb;
				}
			}
		}
		ink.flush(ctx);
	}

	// Where the sweep's front is along the body (s): the tip → the neck.
	function sweepFront(t, s, body) {
		return lerp(body.length, s.beat.sT, smooth(span(t, ...B.sweep)));
	}
	// The tube's long lines from the sweep's front to the tip: eight curves of
	// one section angle down the tail, written with the rings, so the swept
	// part reads as a tube, not beads on the centreline. Front-facing pieces
	// (the normal toward the eye) in chalk, the far side faint.
	function tubeLines(ctx, cam, sh, pose, body, sFront, alpha) {
		if (alpha <= 0.004) return;
		const ST = body.stations;
		const m = 8;
		const eye = cam.pos;
		const ink = makeInk();
		let prev = null;
		let prevS = 0;
		for (let i = 0; i < ST.length; i++) {
			if (ST[i].part !== 'tail' || ST[i].s < sFront - 1.2) continue;
			const R = body.ring(sh, i, pose, m);
			const c = [0, 0, 0];
			for (let q = 0; q < m; q++) for (let k = 0; k < 3; k++) c[k] += R[q][k] / m;
			let cur = R.slice(0, m).map((p) => ({ p, n: sub3(p, c) }));
			// The first piece starts at the front itself, between stations.
			if (prev && prevS < sFront) {
				const u = clamp01((sFront - prevS) / (ST[i].s - prevS || 1));
				prev = prev.map((a, q) => ({
					p: add3(mul3(a.p, 1 - u), mul3(cur[q].p, u)),
					n: add3(mul3(a.n, 1 - u), mul3(cur[q].n, u))
				}));
			}
			if (prev && ST[i].s > sFront)
				for (let q = 0; q < m; q++) {
					const a = prev[q];
					const b = cur[q];
					const qa = cam.project(a.p);
					const qb = cam.project(b.p);
					if (qa[2] <= NEAR || qb[2] <= NEAR) continue;
					const mid = mul3(add3(a.p, b.p), 0.5);
					const front = dot(add3(a.n, b.n), sub3(eye, mid)) > 0;
					ink.seg(
						PAL.chalk,
						alpha * (front ? 0.3 : 0.07),
						front ? 0.85 : 0.7,
						qa[0],
						qa[1],
						qb[0],
						qb[1]
					);
				}
			prev = cur;
			prevS = ST[i].s;
		}
		ink.flush(ctx);
	}

	// The midpiece's helix, wound from the tail's end toward the head as the
	// midpiece's rings go on, on the body's own rings.
	function helixOf(ctx, cam, sh, pose, body, upto, alpha) {
		if (upto <= 0 || alpha <= 0.004) return;
		const [m0, m1] = body.parts.mid;
		const ST = body.stations;
		const idx = [];
		ST.forEach((x, i) => x.s >= m0 - 0.01 && x.s <= m1 + 0.01 && idx.push(i));
		if (idx.length < 2) return;
		const frames = idx.map((i) => {
			const R = body.ring(sh, i, pose, 4);
			const c = mul3(add3(R[0], R[2]), 0.5);
			return { s: ST[i].s, c, a: sub3(R[3], c), b: sub3(R[0], c) };
		});
		const turns = 9;
		const N = 220;
		const eye = cam.pos;
		const ink = makeInk();
		let qa = null;
		let fa = null;
		for (let k = 0; k <= N * upto; k++) {
			const s = m1 - ((m1 - m0) * k) / N;
			let j = 0;
			while (j < frames.length - 2 && frames[j + 1].s < s) j++;
			const A0 = frames[j];
			const A1 = frames[j + 1];
			const u = clamp01((s - A0.s) / (A1.s - A0.s || 1));
			const c = add3(mul3(A0.c, 1 - u), mul3(A1.c, u));
			const av = add3(mul3(A0.a, 1 - u), mul3(A1.a, u));
			const bv = add3(mul3(A0.b, 1 - u), mul3(A1.b, u));
			const an = (TAU * turns * k) / N;
			const nrm = add3(mul3(av, Math.cos(an)), mul3(bv, Math.sin(an)));
			const p = add3(c, mul3(nrm, 1.12));
			const qb = cam.project(p);
			const front = dot(nrm, sub3(eye, p)) > 0;
			if (qa && qa[2] > NEAR && qb[2] > NEAR)
				ink.seg(
					PAL.chalk,
					alpha * (front && fa ? 0.75 : 0.14),
					front && fa ? 1.1 : 0.8,
					qa[0],
					qa[1],
					qb[0],
					qb[1]
				);
			qa = qb;
			fa = front;
		}
		ink.flush(ctx);
	}

	// The body whose head is blown out to g of its width and thickness.
	function inflated(s, g) {
		const key = Math.round(g * 60);
		let b = s.inflated.get(key);
		if (b) return b;
		const gq = key / 60;
		const spec = { ...s.spec, head: [s.spec.head[0], s.spec.head[1] * gq, s.spec.head[2] * gq] };
		const body = makeBody(spec);
		b = { body, beat: makeBeat(body, spec, s.coef, s.waves) };
		s.inflated.set(key, b);
		return b;
	}

	// ── The run, from the lift on ────────────────────────────────────────────
	function world(ctx, w, h, t, hand) {
		const s = settleNow();
		const g = geom(ctx, w, h);
		const bc = boardCam(g, w, h);

		// The body: built, then swimming.
		const sg = sigmaAt(t);
		const hz = s.spec.beat.hz;
		const life = t >= B.life;
		const phase = PH_B + (life ? TAU * hz * eased(t - B.life, 0.8) : 0);
		const roll = life ? TAU * s.spec.roll * eased(t - B.life - 0.1, 1.2) : 0;
		const headG = lerp(0.3, 1, smooth(span(t, ...B.head)));
		const blown = t < B.head[1] ? inflated(s, headG) : { body: s.body, beat: s.beat };
		const body = blown.body;
		const shape = blown.beat.shape(t, { phase, roll });
		let pose = poseAt(sg);
		// Through the interim the swimmer shrinks a little as the lens rises,
		// and dives into the cone's apex.
		if (t > B.rise[0]) {
			const it = interimLens(t, w, h);
			const scale = lerp(1, 0.55, smooth(span(t, ...B.rise)));
			const dv = smooth(span(t, ...B.into));
			if (dv > 0) {
				const A0 = path.point(sigmaAt(B.into[0]));
				const Qs = add3(it.Q, mul3(it.W.U, 1.5));
				const C = path.point(sigmaAt(B.into[0]) + 40);
				const bz = (u) =>
					add3(add3(mul3(A0, (1 - u) * (1 - u)), mul3(C, 2 * u * (1 - u))), mul3(Qs, u * u));
				const u = dv;
				const at = bz(u);
				const dir = norm(sub3(bz(Math.min(1, u + 0.02)), bz(Math.max(0, u - 0.02))));
				pose = { at, dir, up: path.at(SC0).N1, scale: scale * lerp(1, 0.35, dv) };
			} else pose = { ...pose, scale };
		}

		// The lens: during the sweep it rides with the ring being laid.
		let L;
		if (t < B.round[1]) {
			L = compileLens(t, g, w, h, body.at(shape, pose, sweepFront(t, s, body)));
		} else if (t < B.rise[0]) L = swimLens(t);
		else {
			const sw = swimLens(Math.min(t, B.rise[1]));
			const it = interimLens(t, w, h);
			const k = smooth(span(t, ...B.rise));
			const ov = it.over;
			L = {
				pos: add3(mul3(sw.pos, 1 - k), mul3(ov.pos, k)),
				target: add3(mul3(sw.target, 1 - k), mul3(ov.target, k)),
				up: norm(add3(mul3(sw.up, 1 - k), mul3(ov.up, k)))
			};
		}
		const cam = camera3({ pos: L.pos, target: L.target, up: L.up, fov: fovOf(w, h), w, h });
		const lensSigma = t < B.swim ? -backAt(B.swim) : sigmaAt(t) - backAt(t);

		// Behind it all, the stars.
		const ink = makeInk();
		const starA = smooth(span(t, ...B.stars)) * (1 - smooth(span(t, B.rise[0], B.rise[1])));
		let t0 = now();
		stars(ctx, cam, t, ink, starA, lensSigma);
		ink.flush(ctx);
		tick('stars', t0);
		t0 = now();

		// The depth of the body, for what is behind it.
		Z.reset(w, h);
		const built = t >= B.sweep[0];
		if (built) body.fillDepth(Z, cam, shape, pose);
		tick('depth', t0);
		t0 = now();

		// The disc, the tunnel.
		if (t >= B.rim[0] - 0.2 && t < B.seedsOff[1]) {
			const ink2 = makeInk();
			tunnel(ctx, cam, w, h, t, ink2, lensSigma);
			tick('tunnelJS', t0);
			const tf = now();
			ink2.flush(ctx);
			tick('tunnelInk', tf);
		}
		tick('tunnel', t0);
		t0 = now();
		// The automaton.
		if (t >= B.rows[0] - 0.4) {
			const W = caWorld();
			const b = 1 - smooth(span(t, ...B.unroll));
			cells(ctx, cam, w, h, t, b, W);
		}
		tick('cells', t0);
		t0 = now();

		// The lifted wave: the board's wave, then the body's centreline.
		const liftK = smooth(span(t, ...B.lift));
		const swept = smooth(span(t, B.sweep[0], B.sweep[0] + 1.2));
		if (t < B.mid[1]) {
			const cA = 0.85 * (1 - 0.7 * swept) * (1 - smooth(span(t, B.mid[0], B.mid[1])));
			const ST = body.stations;
			const n = s.waves;
			const r = lengthsAt(0, hand, g.R, true);
			const pts = [];
			const NS = 240;
			for (let i = 0; i <= NS; i++) {
				const ss = lerp(s.beat.sT, body.length, i / NS);
				const dx = (ss - s.beat.sT) * bc.spx;
				const ph = PHI_F - (TAU * n * dx) / g.WW;
				let y = 0;
				for (let hh = 1; hh <= NH; hh++) y += r[hh - 1] * Math.sin(hh * ph);
				const wv = [s.beat.sT + dx / bc.spx, y / bc.spx, 0];
				const bd = body.at(shape, pose, ss);
				pts.push(
					cam.project(
						liftK >= 1 ? bd : liftK <= 0 ? wv : add3(mul3(wv, 1 - liftK), mul3(bd, liftK))
					)
				);
			}
			// The neck to the nose: written as the pivot glides there.
			const nz = smooth(span(t, ...B.nose));
			const front = [];
			for (let i = 0; i < ST.length; i++)
				if (ST[i].s < s.beat.sT && ST[i].s >= (1 - nz) * s.beat.sT)
					front.push(cam.project(body.at(shape, pose, ST[i].s)));
			const all = [...front, ...pts].filter((qq) => qq[2] > NEAR);
			if (all.length > 1) stroke(ctx, all, { width: 1.25, alpha: cA });
			// The pivot, gliding to the nose.
			const pv = [s.beat.sT - (g.xw0 - g.px) / bc.spx, 0, 0];
			const nose = body.nose(shape, pose);
			const pp = cam.project(add3(mul3(pv, 1 - nz), mul3(nose, nz)));
			const pa = 1 - smooth(span(t, B.head[0], B.head[0] + 0.5));
			if (pp[2] > NEAR && pa > 0.01)
				disc(ctx, pp[0], pp[1], g.stop.r * lerp(1, 0.7, nz), {
					fill: nz < 1 ? PAL.chalk : PAL.gold,
					alpha: 0.9 * pa
				});
		}

		// The body: rings tip → neck, then on through the midpiece to the
		// head (blown out) — one build, toward the front.
		if (built) {
			const fT = s.fTail;
			const ringFrom =
				t < B.sweep[1]
					? lerp(1, fT, smooth(span(t, ...B.sweep)))
					: lerp(fT, 0, smooth(span(t, B.sweep[1], B.head[1])));
			const gensF = (j) => smooth(span(t, B.gens + j * 0.045, B.gens + j * 0.045 + 0.45));
			const fade = 1 - smooth(span(t, B.into[1] - 0.15, B.into[1] + 0.25));
			// The tube's long lines, swept with the rings from the tip, until
			// the body's own generatrices take over.
			const tubeA = fade * (1 - smooth(span(t, B.gens, B.gens + 0.9)));
			if (t < B.sweep[1] + 0.6 || tubeA > 0.01)
				tubeLines(ctx, cam, shape, pose, body, sweepFront(t, s, body), tubeA);
			ctx.save();
			ctx.globalAlpha = fade;
			body.draw(ctx, cam, shape, pose, {
				rings: 1,
				ringFrom,
				gens: gensF,
				contour: smooth(span(t, ...B.contour)),
				back: 0.2 * (1 - 0.5 * smooth(span(t, B.life, B.life + 1)))
			});
			ctx.restore();
			// The midpiece's helix, wound as its rings go on.
			const hx = smooth(span(t, ...B.helix));
			helixOf(
				ctx,
				cam,
				shape,
				pose,
				body,
				hx,
				0.8 * (1 - smooth(span(t, B.life + 0.4, B.life + 1.6))) * fade
			);
			// The spark of life.
			const spark =
				span(t, B.life - 0.05, B.life + 0.1) *
				(1 - 0.7 * smooth(span(t, B.life + 0.2, B.life + 1.1)));
			if (spark > 0)
				lit3(
					ctx,
					cam,
					body.at(shape, pose, (body.parts.mid[0] + body.parts.mid[1]) / 2),
					2.2,
					spark
				);
		}
		tick('body', t0);
		return cam;
	}

	// ── The fall, the swimmer leading, the splash ────────────────────────────
	// The fall fades in over the hand-off as one layer: drawn straight onto
	// the board, its frames would not fade (the kit's strokes set their own
	// alpha), and the room would pop in round the apex cell.
	let layer = null;
	function layerOf(w, h) {
		const dpr = board.dpr;
		if (!layer || layer.w !== w || layer.h !== h || layer.dpr !== dpr) {
			const c = document.createElement('canvas');
			c.width = Math.round(w * dpr);
			c.height = Math.round(h * dpr);
			layer = { c, x: c.getContext('2d'), w, h, dpr };
		}
		layer.x.setTransform(1, 0, 0, 1, 0, 0);
		layer.x.clearRect(0, 0, layer.c.width, layer.c.height);
		layer.x.setTransform(dpr, 0, 0, dpr, 0, 0);
		return layer;
	}
	function fallBeat(ctx, w, h, t) {
		const s = settleNow();
		const k = smooth(span(t, ...B.handoff));
		const lay = k < 1 ? layerOf(w, h) : null;
		const cam = s.fall.draw(lay ? lay.x : ctx, w, h, t, {
			colourAlong: false,
			dust: board.dust,
			background: (c, lens, zoom, a) => fallStars(c, w, h, lens, zoom, a)
		});
		if (lay) {
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = k;
			ctx.drawImage(lay.c, 0, 0);
			ctx.restore();
		}
		// The swimmer at the vanishing point, its own lens behind and above it.
		const aim = smooth(span(t, ...B.aim));
		let gx = cam.ox;
		let gy = cam.oy;
		if (cam.glass) {
			gx = (cam.glass[0] + cam.glass[2]) / 2;
			gy = (cam.glass[1] + cam.glass[3]) / 2;
		}
		const shift = [lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2];
		const into = smooth(span(t, B.fall[0], B.fall[0] + 1.6));
		const dist = lerp(380, 270, into) * lerp(1, 2.6, aim * aim);
		const swA =
			(1 - smooth(span(t, B.hit - 0.12, B.hit))) * smooth(span(t, B.fall[0], B.fall[0] + 0.7));
		if (swA > 0.01) {
			const hz = s.spec.beat.hz;
			const phase = PH_B + TAU * hz * eased(t - B.life, 0.8);
			const roll = TAU * s.spec.roll * eased(t - B.life - 0.1, 1.2);
			const shape = s.beat.shape(t, { phase, roll });
			const pose = { at: [0, 0, 0], dir: [0, 0, -1], up: [0, 1, 0] };
			const off = norm([lerp(0.3, 1.0, into), lerp(0.7, 0.42, into), 0.75]);
			const tgt = [0, 0, 0.3 * s.body.length];
			const sc = cameraFor(tgt, off, dist, w, h);
			ctx.save();
			ctx.translate(shift[0], shift[1]);
			ctx.globalAlpha = swA;
			s.body.draw(ctx, sc, shape, pose, { back: 0.12 });
			ctx.restore();
		}
		if (t >= B.hit && cam.glass) splash(ctx, cam.glass, t - B.hit, ans.spice);
		return cam;
	}
	function cameraFor(target, dir, dist, w, h) {
		return camera3({
			pos: add3(target, mul3(dir, dist)),
			target,
			up: [0, 1, 0],
			fov: fovOf(w, h),
			w,
			h
		});
	}
	// Through the glasses: dim streaks out of the vanishing point, on the
	// fall's own zoom.
	const FSTARS = (() => {
		let s = 2207;
		const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
		return Array.from({ length: 260 }, () => ({ a: rnd() * TAU, l: rnd(), b: 0.3 + 0.7 * rnd() }));
	})();
	function fallStars(ctx, w, h, lens, zoom, a) {
		const R = Math.hypot(w, h) / 2;
		const ink = makeInk();
		const ox = lens.ox;
		const oy = lens.oy;
		for (const st of FSTARS) {
			// log radius from 0.02 R to R, streaming outward one decade an e-fold
			const u = (((st.l + zoom * 0.35) % 1) + 1) % 1;
			const r = R * Math.exp(Math.log(0.02) * (1 - u));
			const r2 = r * 1.08;
			const al = 0.24 * a * st.b * smooth(span(u, 0, 0.25));
			ink.seg(
				PAL.chalk,
				al,
				0.8,
				ox + r * Math.cos(st.a),
				oy + r * Math.sin(st.a),
				ox + r2 * Math.cos(st.a),
				oy + r2 * Math.sin(st.a)
			);
		}
		ink.flush(ctx);
	}

	// ── The frame ────────────────────────────────────────────────────────────
	function render() {
		const { ctx, w, h } = board;
		const t = time.t;
		answers.slider(hit);
		const hand = answers.hand(t);
		if (t >= EB.e2) settle();
		let t0 = now();
		if (t < B.lift[0]) entry(ctx, w, h, t, hand);
		tick('entry', t0);
		t0 = now();
		if (t >= B.lift[0] && t < B.handoff[1]) world(ctx, w, h, t, hand);
		tick('world', t0);
		t0 = now();
		if (t >= B.handoff[0]) fallBeat(ctx, w, h, t);
		tick('fall', t0);
		caption(ctx, w, h, CAPTION.genetics, t, {
			at: B.genetics[0],
			until: B.genetics[1],
			align: 'center'
		});
		caption(ctx, w, h, CAPTION.conception, t, {
			at: B.conception[0],
			until: B.conception[1],
			align: 'center'
		});
		const out = smooth(span(t, ...B.out));
		if (out > 0.003) {
			ctx.save();
			ctx.globalAlpha = out;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
		info.decade = S.decade;
		if (window.__lab) {
			window.__lab.t = t;
			window.__lab.decade = S.decade;
			window.__lab.rule = S.ca.rule;
			if (PROF) {
				// Force the canvas to raster now, to see what the strokes cost.
				const tr = now();
				ctx.getImageData(0, 0, 1, 1);
				tick('raster', tr);
				window.__lab.prof = PROF;
			}
		}
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render() {
			clearBoard(board);
			render();
			tag(board.ctx, board.w, board.h, 'flow-harmonic');
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}

// ── The entry's type (epicycle's) ────────────────────────────────────────────
const GOLD_DIM = 'rgba(245, 193, 80, 0.85)';
// Chalk (#ece6da) to a dim gold in four tones: the tunnel's rings by depth.
const TONES = [0, 1 / 3, 2 / 3, 1].map(
	(u) =>
		`rgba(${Math.round(236 + 9 * u)}, ${Math.round(230 - 37 * u)}, ${Math.round(218 - 138 * u)}, ${(1 - 0.3 * u).toFixed(3)})`
);
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
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
const MASK = 'dd.mm.yyyy';
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
const GROUP_OF = [0, 0, 1, 1, 2, 2, 2, 2];
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
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
