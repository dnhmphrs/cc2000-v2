// ── Flow: flow-strand-corridor — back through time down a corridor of rooms ──
// flow-strand to the end of the compile, kept as it is (the date as a double
// helix, read codon by codon into the swimmer's rings, COMPILING USER
// GENETICS, the swimmer coming to life at 22.2 s; flow-strand.js's header is
// the map of it). From there on ONE place and ONE move: the swimmer swims
// BACK THROUGH TIME down a long corridor whose walls are the decades' rooms,
// to the room it was conceived for, which is at the corridor's end from the
// first frame, and into that room's monitor; the white flash.
//
// THE CORRIDOR. A box of section 2φ·HC × 2·HC (a golden rectangle, as a room
// is), in the fall's own units (log/fall.js: a room's frame 2φ × 2, the last
// room's frame at z = 0, the lens on +z): the LAST ROOM is its end wall's
// door, the very plate the fall lands on, there from the start — small and
// far, its monitor lit, the one light down the whole length. Its four walls
// are set with the decades' chalk rooms like windows, one on each wall every
// PITCH (log/corridor-hall.js, on the GPU under the board: exact perspective,
// mipmapped, fogged, lit warm near the end in a slow turn of warm colours),
// each labelled under it (THE 1990s); a room shows the decade of the date
// it is at (the site's rule: before 1960 the 50s, before 1980 the 60s,
// before 2005 the 90s, then the 10s), so the walls go back through the
// decades as the lens does, and the last stretch is the birth decade's. The
// corridor is BUILT as the lens comes round behind the swimmer — a
// perspective construction in chalk: the vanishing point lit (the last
// room's glass), the orthogonals drawn out of it, the rings out of it toward
// the lens, the last room drawn in, the rooms set into the walls far to near.
//
// THE MOVE. One zoom in e-folds of the lens's distance D to the end wall,
// from rest as the swim starts (D_S) to rest square on the last glass (the
// fall's own d₀, at f0): D = D_S·e^(−E(t)), E's rate gathering over 3 s and
// easing to nought over the landing. So the end grows at a steady rate the
// whole way, the walls stream past fastest at the start and slow as the end
// nears (the speed is the rate times D): the years rush, the months walk,
// the last days are steps. The lens is one plate unit behind the nose,
// riding the line through the last room's glass; as the lens slows to land
// the swimmer does not, and pulls away into the glass; the lens, at rest
// (f0), is handed to the fall (makeFall of that one room: its land, its
// sway, its colour and its push after the flash), whose picture at that
// moment is the corridor's own (drawEnd is drawFall's level, line for
// line), so there is no seam.
//
// THE SUN. Every line of the corridor runs into one point, the last room's
// glass: once the glass is big enough to hold it, that point is seen as the
// lead's sunshine — a log-polar lattice at its point at infinity, rays by
// angle in the warm spectrum turning slowly, rings an e-fold apart streaming
// out (sun()) — and as the swimmer reaches it the lattice swells out of the
// glass over the whole board, beams with no edge, into the white flash.
//
// THE DATES AND MATHS, as the corridor's signage — a museum of your own past.
// The YEARS on signs hung under the ceiling, alternately left and right,
// counting back from this year to the birth year (every year, or every 2nd,
// 5th, 10th when they would crowd), each struck through in red as it is
// reached; the BIRTH on its own sign, gold-ringed: 14 · 02 · 1987 − 266
// days; then the MONTHS' signs, the long subtraction back through them, one
// a month (FEB 14 → 252, JAN 31 → 221, 1986 DEC 31 → 190 …), struck as they
// are taken (the plaques opaque and drawn far to near, a farther one given
// up as far as a nearer one would cover it, so the months, crowding as the
// lens slows, are read a few at a time); under them the 266 DAYS COUNTED DOWN ON THE FLOOR, a ruler of
// the days left (a tick a day, longer every week, a line across at every
// month with what is left, the last week a number a day, to 0 at the door).
// On the last door, round the room: MAY 31 − 7 = 24 (the landing, left), the
// room's rule (1980 ≤ 1987 < 2005 ⇒ 90s, right), ZELLER'S CONGRUENCE worked
// under it, and over it the conception date in gold with its weekday.
// EXACT: the arithmetic is flow-strand's (every date 1900–2099 checked).
//
// The HAND: the board's lines here (the corridor's orthogonals and rings,
// the signs, the strikes) are drawn as by hand, nudged across themselves by
// a seeded noise re-drawn ten times a second (on twos), so they boil a
// little, the type with them; the orthogonals are drawn with the chalk's
// point showing; each decade's wing has its colour (its rooms' labels, its
// years' signs: the 2010s pink, the 1990s cyan, the 1960s orange, the 1950s
// green); the rooms are the artwork's own chalk.
//
// ?gpu=0 draws the board alone (no corridor walls); ?parts=wrf (walls'
// light, rooms, floor's ruler) and ?aniso=N are the hall's, for a probe.
//
// Beats, in seconds (60; at = t / 60):
//    0    – 22.3  flow-strand's: the card, the two questions, the strand, the
//                 compile; 22.2 life
//   22.5          the swim from rest; 22.6 – 25.2 the lens round behind;
//                 25.4 – 28.4 down onto the line through the last glass
//   22.9 – 28.6   the corridor built: the light far ahead (22.9), the
//                 orthogonals (23.3 – 25.1), the rings (23.8 – 26.2), the last
//                 room (24 – 25.8), the rooms on the walls far → near (24.6 –
//                 28.6, the near ones over a second or more), the signs (25 –
//                 26.4)
//   25.9 – 39.6   the years, this year's sign to the birth year's (the
//                 rooms the 2010s', then the 1990s', for the demo's 1987)
//   39.6          the birth's sign, the ruler of days from it to the door;
//                 40.5 – 48 the months' signs
//   43.5 – 52.43  the zoom eased to rest; 44.6 – 53.7 the swimmer pulling
//                 away from the slowing lens, into the glass
//   45.2 – 50.8   the door's workings: the landing, Zeller, the gold date,
//                 the room's rule
//   50.1 – 53.7   the last room's light swelling, from its glass, into …
//   52.43         the fall's lens (the same picture: 0.02/255 between the
//                 frames either side); its land to the room's middle, to
//                 53.6
//   53.7          the white flash (the last room's light blazing into it);
//                 the colour under it; 53.8 – 56.8 the lens in on the room
//                 to near full size; held; 58.8 – 60 a fade; round
//
// Live in the lab (no ?at=, not ?demo=1): the run waits at each question.
// Pinned, ?demo=1, or in a reel: the scripted hand (14 · 02 · 1987, spice
// 7). ?decade= forces the room. Every frame a pure function of t, the hand
// and this year (the corridor counts back from it); the caches are of inputs
// and of constants (the frozen title, the zoom's table, the corridor).
//
// Without a renderer (none passed) the walls have no rooms; the rest is the
// board's.

import {
	getBoard,
	clearBoard,
	clock,
	tag,
	camera3,
	PAL,
	PHI,
	TAU,
	TECH_FONT,
	MATH_FONT,
	stroke,
	disc,
	span,
	smooth,
	lerp,
	clamp01,
	add3,
	sub3,
	mul3,
	dot,
	norm
} from './log/board.js';
import { NEAR, lit3 } from './log/space.js';
import { glow } from './log/ink.js';
import { makeAnswers } from './log/answer.js';
import { script } from './log/entry.js';
import { makeTerminal } from './log-dawn.js';
import { EPICYCLE } from './intro/epicycle.js';
import { makeBody, specOf } from './log/body.js';
import { caption, captionSize, CAPTION } from './log/caption.js';
import { makeLens, fuzz } from './log/lens.js';
import { flash } from './log/flash.js';
import { makeFall } from './log/fall.js';
import { DECADES, PLATE, loadRooms, decadeOfDate, drawImageAt } from './log/rooms.js';
import { makeHall, HALL } from './log/corridor-hall.js';

export const meta = {
	title:
		'strand · corridor — back through time down a corridor of rooms: the decades pass as you go, to the day'
};

// ── The beats ────────────────────────────────────────────────────────────────
const SECONDS = 60;
const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
const FREEZE = TERM.stop + 0.2; // ≈ 5.14
const { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 } = EPICYCLE.beats;
const B = {
	q1: Q1,
	wait1: W1,
	e1: E1,
	q2: Q2,
	wait2: W2,
	e2: E2,
	gone: 5.4, // title line i fades over [5.4 + 0.25 i, 5.9 + 0.25 i]
	pan: [6.2, 6.8], // the stop to the strand's 5′ end
	field: [Q1 + 0.25, Q1 + 0.7],
	slider: [Q2 + 0.35, Q2 + 0.8],
	trace: 1.2, // a gold trace's run down the strand
	still: 1.6, // the strand's turn dies away over this, from E2
	asked: [14.7, 15.3], // the questions go (before the caption types over the slider's row)
	genetics: [15.3, 22.3], // the caption
	view: [15.0, 16.2], // the lens comes to the reading
	read: [16.0, 19.6], // the frame 5′ → 3′
	axis: [19.2, 20.4], // the strand closes onto the axis
	rope: [19.5, 21.0], // the backbones twist down the tail
	back: [19.4, 21.2], // the lens draws back to the whole body
	gens: [20.8, 21.9],
	contour: [21.5, 22.3],
	life: 22.2,
	conception: [22.6, 33.6], // the caption
	swim: 22.5,
	behind: [22.6, 25.2], // the lens round behind the swimmer
	onLine: [25.4, 28.4], // … and down onto the line through the last glass
	vp: [22.9, 23.7], // the last room's light comes up, far ahead
	rays: [23.3, 25.1], // the corridor's orthogonals, drawn out of it
	rings: [23.8, 26.2], // its rings, out of it toward the lens
	end: [24.0, 25.8], // the last room drawn in round the light
	rooms: [24.6, 28.6], // the rooms set into the walls, far → near (reachAt)
	signs: [25.0, 26.4], // the years' signs come up
	now: 25.9, // the lens passes this year's sign
	birth: 39.6, // … the birth's
	months: [40.5, 48.0], // … the months', one by one
	narrow: [36, 52.43], // the lens narrowed to the fall's
	landing: [43.5, 52.43], // the zoom eased to rest
	door: [45.2, 46.6], // the door's workings: the landing …
	zeller: [46.4, 49.4], // … Zeller's congruence …
	result: [48.6, 50.4], // … the conception date over the door …
	rule: [49.8, 50.8], // … and the room's rule
	aim: [44.6, 53.7], // the swimmer pulls away from the landing lens, into the last glass
	f0: 52.43, // the lens at rest, square on the glass: the fall's from here
	land: [52.43, 53.6], // the fall's slide to the room's middle
	colour: [53.62, 54.1], // the room's colour, come up under the flash
	blaze: [50.1, 53.7], // the last room's light swells into …
	hit: 53.7, // … the flash
	push: [53.8, 56.8], // the lens in on the last room, to near full size
	out: [58.8, 60]
};
// THE FLASH (log/flash.js): the swimmer reaching the last screen. The board
// goes white, holds a moment, and burns out — the dark ground back first, the
// room's colours, which have come up underneath it (B.colour) while the lens
// pushes in on it (B.push), last — so the room comes up out of the white.

// ∫ of a smoothstep ramp of length D: a clock that starts from rest.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// ── The date's arithmetic, exact ─────────────────────────────────────────────
// 266 days (38 weeks) from conception to birth. Checked in a scratch script
// against Date for every day 1900–2099: the date and the weekday agree.
export const GESTATION = 266;
const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const DAYS = (m, y) => [31, LEAP(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAY = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const pad2 = (x) => String(x).padStart(2, '0');
const fmt = ({ d, m, y }) => `${pad2(d)} · ${pad2(m)} · ${y}`;

// The birthday the calculator uses: the typed date, a month past 12 or a
// day past its month brought back into range (Enter takes any eight digits).
export function birthOf(digits) {
	const s = String(digits ?? '')
		.replace(/\D/g, '')
		.padEnd(8, '0')
		.slice(0, 8);
	const y = clamp(Number(s.slice(4, 8)), 100, 9999);
	const m = clamp(Number(s.slice(2, 4)), 1, 12);
	const d = clamp(Number(s.slice(0, 2)), 1, DAYS(m, y));
	return { d, m, y };
}
// Back 266 days, a month at a time: the birth month's own d days take it to
// the last day of the month before; then each whole month's length while
// what is left is at least that; the last month's length less what is left
// is the day.
export function conceive({ d, m, y }, days = GESTATION) {
	const rows = [];
	let rem = days - d;
	rows.push({ m, y, take: d, rem });
	let [mm, yy] = m === 1 ? [12, y - 1] : [m - 1, y];
	while (rem >= DAYS(mm, yy)) {
		const L = DAYS(mm, yy);
		rem -= L;
		rows.push({ m: mm, y: yy, take: L, rem });
		[mm, yy] = mm === 1 ? [12, yy - 1] : [mm - 1, yy];
	}
	const len = DAYS(mm, yy);
	return { rows, last: { m: mm, y: yy, len, rem }, date: { d: len - rem, m: mm, y: yy } };
}
// Zeller's congruence (Gregorian): h = (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋
// + 5J) mod 7, January and February counted as months 13 and 14 of the year
// before; K the year of the century, J the century; h = 0 is Saturday.
export function zeller({ d, m, y }) {
	const mm = m < 3 ? m + 12 : m;
	const yy = m < 3 ? y - 1 : y;
	const K = yy % 100;
	const J = Math.floor(yy / 100);
	const terms = [
		d,
		Math.floor((13 * (mm + 1)) / 5),
		K,
		Math.floor(K / 4),
		Math.floor(J / 4),
		5 * J
	];
	const sum = terms.reduce((s, x) => s + x, 0);
	const h = ((sum % 7) + 7) % 7;
	return { q: d, mm, yy, K, J, terms, sum, h, day: WEEKDAY[h] };
}

// ── The strand ───────────────────────────────────────────────────────────────
// Each digit d as two bases, d = 4a + b (A C G T for 0 1 2 3), paired with
// its complement: sixteen rungs.
const LETTER = 'ACGT';
const COMP = [3, 2, 1, 0];
const NR = 16;
const S_LEN = 10.5; // the strand's length, world units: the head, neck and midpiece
const DS = S_LEN / NR; // between rungs
const RS = 0.55; // the helix's radius
const GROOVE = 0.78 * Math.PI; // the backbones' offset round the axis (the minor groove)
const XR = (j) => (j + 0.5) * DS; // rung j's place on the axis
const TWIST_NAT = (34.3 * Math.PI) / 180; // B-DNA's, before the spice is asked
const twistOf = (n) => ((9 * n) / 180) * Math.PI; // 9° a base pair a stop
const SPIN = TAU / 18; // the strand turns once in 18 s while it is typed
function basesOf(digits) {
	const out = [];
	for (let i = 0; i < 8; i++) {
		const ch = digits[i];
		if (ch === undefined) out.push(null, null);
		else out.push(Math.floor(Number(ch) / 4), Number(ch) % 4);
	}
	return out;
}

// ── The codons, as sections ──────────────────────────────────────────────────
// The frame centred on rung c reads bases c − 1, c, c + 1 (c from 1 to 14);
// the codon's section: size 1 + 0.12 ν(c₀), eccentricity 0.18 ν(c₁), n = 3
// + c₂ lobes of 9%, ν(c) = (c − 1.5)/1.5. A station between two rungs takes
// the blend of their two sections.
const nu = (c) => (c - 1.5) / 1.5;
// How far a codon moves its ring (at 0.05 / 0.1 / 0.06 two dates' swimmers
// were all but the same).
const CODON = { size: 0.12, ecc: 0.18, lobe: 0.09, flash: 3 };
function codonOf(b, c) {
	const k = clamp(c, 1, NR - 2);
	return [b[k - 1] ?? 0, b[k] ?? 0, b[k + 1] ?? 0];
}
function codonShape([c0, c1, c2], gain = 1) {
	const k = 1 + CODON.size * gain * nu(c0);
	const e = CODON.ecc * gain * nu(c1);
	const n = 3 + c2;
	return (ph) => {
		const r = k * (1 + CODON.lobe * gain * Math.cos(n * ph));
		return [r * (1 + e) * Math.cos(ph), r * (1 - e) * Math.sin(ph)];
	};
}
function codonSection(bases, stations) {
	const shapes = [];
	for (let c = 0; c < NR; c++) shapes.push(codonShape(codonOf(bases, c)));
	const fn = (i, ph) => {
		const p = clamp(stations[i].s / DS - 0.5, 1, NR - 2);
		const j = Math.min(NR - 3, Math.floor(p));
		const f = p - j;
		const a = shapes[j](ph);
		const c = shapes[j + 1](ph);
		return [lerp(a[0], c[0], f), lerp(a[1], c[1], f)];
	};
	fn.M = 48;
	fn.gens = 16;
	fn.uniform = false;
	return fn;
}

// ── The corridor ─────────────────────────────────────────────────────────────
// In the fall's units (a room's frame 2φ × 2; the last room's frame at z = 0,
// x right, y up, z toward the lens), set on the body's own axis (the strand
// was built along +x, the nose at the origin heading −x): plate (x, y, z) is
// body (X_END + SIG·z, SIG·y, −SIG·x) — the lens looking −x with y up has
// −z on its right, so that is a proper turn, and SIG the body units a plate
// unit (the chase's lens one plate unit behind the nose, as flow-strand's).
const SIG = 92;
const HC = 1.6; // the corridor's half-height: a room and a margin over and under
const WC = PHI * HC; // its half-width: the section a golden rectangle, as a room is
const PITCH = 4; // a cell: four rooms round it, one on each wall
const CELL0 = 0.4; // the first cell's far edge, off the end wall
const D_S = 80; // the lens's distance to the end wall as the swim starts
const D_CH = 1; // the lens behind the nose in the chase
const X_END = -SIG * (D_S - D_CH); // the end wall on the body's axis: the nose starts at 0
const toB = ([x, y, z]) => [X_END + SIG * z, SIG * y, -SIG * x];
const toC = ([x, y, z]) => [-z / SIG, y / SIG, (x - X_END) / SIG];
const AHEAD = [-1, 0, 0]; // down the corridor, in the body's axes
const SIGN_Y = HC - 0.4; // where the signs hang, under the ceiling
const SIGN_X = 0.78; // … alternately left and right of the middle
const THIS_YEAR = new Date().getFullYear(); // the corridor counts back from it

// ── The swimmer, followed ────────────────────────────────────────────────────
// flow-strand's chase: the lens D_C body units behind the nose (a plate
// unit), the swimmer heading in a little across the line so it is seen a
// little side-on, its nose a little below and right of the line.
const D_C = SIG * D_CH;
const DIR_C = norm([-1, 0.2, 0.26]);
const OFF = [0, -1.5, -2.2];
const FOV_CHASE = 52;
const FOV_END = 34; // the fall's
const fovAt = (t) =>
	t > B.swim
		? lerp(
				lerp(30, FOV_CHASE, smooth(span(t, B.swim, 25.0))),
				FOV_END,
				smooth(span(t, ...B.narrow))
			)
		: 30;
// The zoom's rate, of its most: gathered from rest over 3.2 s, eased to
// nought over the landing.
const rateShape = (t) =>
	smooth(span(t, B.swim, B.swim + 3.2)) * (1 - smooth(span(t, ...B.landing)));

// The board's lines are drawn as by hand: nudged across themselves by a
// seeded noise, re-drawn ten times a second.
const BOIL = 10;
const hash = (n) => {
	let h = (n * 374761393 + 668265263) | 0;
	h = (h ^ (h >>> 13)) * 1274126177;
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const fogOf = (d) => 1 / (1 + (d / HALL.fog) * (d / HALL.fog));
// Each decade's wing has its colour, as a museum's does: its rooms' labels
// and its years' signs.
const ERA = { '50s': PAL.green, '60s': '#f2984a', '90s': PAL.cyan, '10s': PAL.pink };
// The site's rule, on a year.
const decadeOfYear = (y) => (y < 1960 ? '50s' : y < 1980 ? '60s' : y < 2005 ? '90s' : '10s');

// ── The board's shape ────────────────────────────────────────────────────────
// A fixed vertical field of view crops the sides of a board narrower than it
// is tall (a phone held upright): there the lens keeps a square's width of
// the scene instead, k (px a unit at unit depth) set by min(h, w / AMIN). A
// board as wide as it is tall or wider is the lens as it was. By f0 the lens
// is the fall's (its focal length h / 2 / tan 17°, whatever the board).
const AMIN = 1;
const kOf = (fov, w, h) => Math.min(h, w / AMIN) / 2 / Math.tan((fov * Math.PI) / 360);

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-strand-corridor · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	// The signs' and the door's own characters (− → · ⌊ ⌋ ≤ ⇒, which the
	// faces may take from a fallback) set once in each face now, in one
	// order, so a seeked frame finds them as a run that has passed the
	// month's signs does.
	{
		const x = document.createElement('canvas').getContext('2d');
		for (const f of [`400 24px ${TECH_FONT}`, `italic 400 24px ${MATH_FONT}`]) {
			x.font = f;
			x.fillText('− → · ⌊ ⌋ ≤ ⇒ < = +', 0, 20);
		}
	}
	const answers = makeAnswers({ live, beats: EPICYCLE.beats });
	const ans = answers.answers;
	// The corridor's walls, on the GPU under the board (none without a
	// renderer: the board's lines alone).
	// (Through the lens — log/lens.js, the board seen through a soft warm
	// lens — the walls are drawn under the board in the lens's own pass, on
	// its renderer; without one, ?lens=0, on the lab's, with the canvas grain.)
	const lens = q.get('lens') === '0' ? null : await makeLens({ THREE, board });
	const gpuR = lens?.renderer ?? renderer;
	const hall =
		gpuR && THREE && q.get('gpu') !== '0'
			? makeHall({ THREE, renderer: gpuR, art, tint: ERA })
			: null;
	let hallDraw = null; // this frame's walls, drawn under the board

	// ── What the answers settle (cached by the answers and the board) ────────
	let S = null;
	function settled(w, h) {
		const key = `${ans.date}|${ans.spice}|${w}|${h}|${forced}`;
		if (S && S.key === key) return S;
		const bases = basesOf(ans.date);
		const spec0 = specOf(ans);
		const probe = makeBody(spec0);
		const spec = specOf(ans, { section: codonSection(bases, probe.stations) });
		const body = makeBody(spec);
		const decade = forced ?? decadeOfDate(ans.date);
		const calc = calcOf(ans.date, decade, h > w);
		// The fall of ONE room, the last: its lens at rest square on the
		// glass at f0 (ζ = 0, the fall's d₀), its land, sway, colour and push
		// from there. Until f0 the corridor draws that room itself.
		const fb = {
			fall: [B.f0, B.land[1]],
			land: B.land,
			colour: B.colour,
			push: B.push,
			swim: [-2, -1]
		};
		// The last room ends near full size: the lens pushed in on it after
		// the flash, to 0.94 of the board's height (an upright board crops
		// its sides rather than leave it small).
		const fill = { h: 0.94, w: h > w ? 1.75 : 0.985 };
		const fall = makeFall({ art, order: [decade], beats: fb, zeta0: 0, fill });
		const geo = fall.geometry(w, h);
		const C = corridorOf(geo, calc, decade, w, h);
		S = { key, bases, spec, body, decade, calc, fall, geo, C };
		S.door = doorOf(board.ctx, calc, geo, w, h);
		if (hall)
			hall.build({
				Hc: HC,
				Wc: WC,
				cell0: CELL0,
				pitch: PITCH,
				cells: C.cells,
				floorFrom: C.floorFrom,
				ruler: { canvas: C.ruler, z0: 0, z1: C.zB }
			});
		return S;
	}

	// ── The corridor, laid out for the answers and the board ─────────────────
	function corridorOf(geo, calc, decade, w, h) {
		const gl = geo.levels[0].glass;
		const d0 = geo.d0;
		// The zoom: e-folds of D, the lens's distance to the end wall, from
		// D_S at the swim to d₀ at f0, at a rate of rateShape's form.
		const DT = 0.01;
		const N = Math.ceil((B.f0 - B.swim) / DT);
		const E = new Float64Array(N + 1);
		for (let i = 1; i <= N; i++) {
			const ta = B.swim + (i - 1) * DT;
			E[i] = E[i - 1] + 0.5 * DT * (rateShape(ta) + rateShape(ta + DT));
		}
		const rmax = Math.log(D_S / d0) / E[N];
		const efolds = (t) => {
			if (t <= B.swim) return 0;
			const f = Math.min(N, (t - B.swim) / DT);
			const i = Math.min(N - 1, Math.floor(f));
			return rmax * lerp(E[i], E[i + 1], f - i);
		};
		const D = (t) => D_S * Math.exp(-efolds(t));

		// ── The years: a sign at the end of each, this year's at the lens's
		// place at B.now and the birth's at B.birth, the years between linear
		// in time (as the fractional year τ).
		const b = calc.birth;
		const doy = (d, m, y) => {
			let n = d;
			for (let k = 1; k < m; k++) n += DAYS(k, y);
			return n;
		};
		const tauB = b.y + (doy(b.d, b.m, b.y) - 0.5) / (LEAP(b.y) ? 366 : 365);
		const yNow = Math.max(THIS_YEAR, b.y);
		const tauNow = yNow + 1;
		const zNow = D(B.now);
		const zB = D(B.birth);
		const span1 = Math.max(1e-6, tauNow - tauB);
		const zOfTau = (tau) => zB + ((zNow - zB) * (tau - tauB)) / span1;
		const tauOfZ = (z) => tauB + ((z - zB) * span1) / (zNow - zB);
		const perYear = (zNow - zB) / span1;
		const step = [1, 2, 5, 10, 20].find((s) => s * perYear >= 1.15) ?? 25;
		const signs = [];
		let side = 1;
		for (let Y = yNow; Y > b.y; Y--) {
			if (Y !== yNow && Y % step !== 0) continue;
			side = -side;
			signs.push({
				kind: 'year',
				z: zOfTau(Y + 1),
				side,
				era: ERA[decadeOfYear(Y)],
				lines: [{ text: String(Y), size: 0.22 }]
			});
		}
		// The birth year's own, and the birth: one sign, ringed in gold.
		signs.push({ kind: 'birth', z: zB, side: 0, lines: calc.birthLines });
		// The months: one sign a month, read one after another.
		const n = calc.rows.length;
		const zM = calc.rows.map((r, i) => D(lerp(B.months[0], B.months[1], n > 1 ? i / (n - 1) : 0)));
		calc.monthLines.forEach((lines, i) => {
			side = -side;
			signs.push({ kind: 'month', z: zM[i], side, era: ERA[decade], lines });
		});
		// The ruler's days: what is left at each month's sign, 0 at the door.
		const knots = [[GESTATION, zB]];
		calc.rows.forEach((r, i) => knots.push([r.rem, zM[i]]));
		knots.push([0, 0]);
		const zOfDay = (d) => {
			for (let i = 0; i < knots.length - 1; i++) {
				const [d0k, z0] = knots[i];
				const [d1k, z1] = knots[i + 1];
				if (d <= d0k && d >= d1k) return d0k === d1k ? z0 : lerp(z0, z1, (d0k - d) / (d0k - d1k));
			}
			return d > GESTATION ? zB : 0;
		};
		// ── The rooms: a cell every PITCH, a room on each wall, the room of
		// the decade the cell is in (the birth decade's in the last stretch,
		// whose floor is the ruler's).
		const cells = [];
		const rings = [0];
		let floorFrom = 0;
		for (let k = 0; ; k++) {
			const z0 = CELL0 + k * PITCH;
			if (z0 > D_S + 8) break;
			rings.push(z0);
			const zc = z0 + PITCH / 2;
			const yr = Math.floor(Math.min(tauOfZ(zc), yNow + 0.999));
			cells.push(zc < zB ? decade : decadeOfYear(yr));
			if (z0 < zB + 0.3) floorFrom = k + 1;
		}
		const ruler = rulerOf(calc, zB, zOfDay);
		return {
			gl,
			d0,
			F: geo.F,
			D,
			efolds,
			rmax,
			zNow,
			zB,
			signs,
			zOfDay,
			cells,
			floorFrom,
			rings,
			ruler,
			w,
			h
		};
	}
	settled(board.w, board.h);
	// One frame of the corridor now, everything in it on, under the opaque
	// board (or before anything is drawn), so its shaders are built at load
	// rather than as the swim starts.
	if (hall)
		hall.render({
			w: board.w,
			h: board.h,
			pos: [0, 0, D_S],
			target: [0, 0, 0],
			fov: 40,
			reach: 1e6,
			light: 1,
			alpha: 1
		});

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: ans,
		get decade() {
			return S?.decade;
		}
	};
	// ── Live: when each digit came and went, and when the spice was entered ──
	const blank = () => ({ d: null, at: -99, old: null, gone: -99, g0: 0 });
	let slots = Array.from({ length: 8 }, blank);
	let spinBase = null; // the strand's turning clock at E2, live
	const GROW = 0.3;
	const SHRINK = 0.2;
	const grownAt = (s, secs) => smooth(span(secs - s.at, 0, GROW));
	function remember(hand, t) {
		if (t < Q1 - 0.05) {
			slots = Array.from({ length: 8 }, blank);
			spinBase = null;
			return;
		}
		const secs = hand.secs;
		for (let i = 0; i < 8; i++) {
			const ch = hand.typed[i];
			const d = ch === undefined ? null : Number(ch);
			const s = slots[i];
			if (d === s.d) continue;
			if (s.d !== null) {
				s.old = s.d;
				s.g0 = grownAt(s, secs);
				s.gone = secs;
			}
			if (d !== null) {
				s.at = secs;
				s.old = null;
			}
			s.d = d;
		}
		if (t < E2) spinBase = null;
		else if (spinBase === null) spinBase = secs - (t - E2);
	}
	// The scripted hand's digits: when each lands, read off the demo's script.
	const SB = { q1: Q1, type1: W1, e1: E1, q2: Q2, drag2: W2 + 0.3, e2: E2 };
	const KEYT = (() => {
		const out = [];
		for (let i = 0; i <= 3000 && out.length < 8; i++) {
			const tt = W1 + i * 0.001;
			const n = script(tt, SB).typed.length;
			while (out.length < n) out.push(tt);
		}
		while (out.length < 8) out.push(Infinity);
		return out;
	})();
	// Each digit's two rungs: its value and how grown (0…1).
	function digitsAt(t, hand) {
		const out = [];
		for (let i = 0; i < 8; i++) {
			if (!live || t >= E2) {
				const ch = hand.typed[i];
				if (ch === undefined) out.push({ d: null, g: 0 });
				else out.push({ d: Number(ch), g: live ? 1 : smooth(span(t - KEYT[i], 0, GROW)) });
				continue;
			}
			const s = slots[i];
			if (s.d !== null) out.push({ d: s.d, g: grownAt(s, hand.secs) });
			else if (s.old !== null)
				out.push({ d: s.old, g: s.g0 * (1 - smooth(span(hand.secs - s.gone, 0, SHRINK))) });
			else out.push({ d: null, g: 0 });
		}
		return out;
	}
	// The strand's turn: on the hand's own clock while it is typed (live the
	// run is held at each question), dying away from E2.
	function spinAt(t, hand) {
		if (t < E2) return SPIN * (live ? hand.secs : t);
		const base = live && spinBase !== null ? spinBase : E2;
		const D = B.still;
		const u = Math.min(1, (t - E2) / D);
		return SPIN * (base + D * (u - (u * u) / 2));
	}
	function twistAt(t, hand) {
		const k = smooth(span(t, ...B.slider));
		return lerp(TWIST_NAT, twistOf(hand.value), k);
	}

	// ── The entry's text (epicycle's, kept as it is) ─────────────────────────
	const entry = makeEntryText(board, answers, live);
	// The entry's framing: the strand across `frac` of the width (0.62), its
	// middle `off` above the board's (0.13 h: at 0.37 h), seen a little from
	// above. On a phone the entry's own layout says (entry.frame).
	function entryLens(w, h, fr) {
		const fov = 30;
		const k = kOf(fov, w, h);
		const frac = fr?.frac ?? 0.62;
		const off = fr?.off ?? 0.13 * h;
		const d = Math.max((S_LEN * k) / (frac * w), (S_LEN * k) / (1.25 * h));
		const el = (11 * Math.PI) / 180;
		const dir = [0, Math.sin(el), Math.cos(el)];
		// The middle off the board's: shift the lens down, along its own up.
		const up = [0, Math.cos(el), -Math.sin(el)];
		const shift = mul3(up, (-off * d) / k);
		const tgt = add3([S_LEN / 2, 0, 0], shift);
		return { pos: add3(tgt, mul3(dir, d)), tgt, fov };
	}

	// ── The lens ─────────────────────────────────────────────────────────────
	// To the swim, flow-strand's: the entry's framing, the reading, the whole
	// body side-on. From the swim: round behind the swimmer and down onto
	// the line through the last glass, one plate unit behind the nose, the
	// nose riding D(t) − 1 down the corridor; the focal length narrowed to
	// the fall's. Every lens carries what the corridor's drawing wants: `k`
	// (px a unit at unit depth), `lc` its place in plate units, `vp` the
	// corridor's vanishing point on the board, `fovV`, and `tgtC` / `offset`
	// for the GPU's camera.
	function lensAt(t, w, h, st, fr) {
		const L = st.body.length;
		const E0 = entryLens(w, h, fr);
		// Reading: close, from the front, a little above, tracking the frame.
		const xf = frameX(t);
		const dirR = norm([-0.5, 0.42, 0.76]);
		const kR0 = kOf(30, w, h);
		const dR = Math.max(12, (5 * kR0) / Math.min(0.5 * w, 0.75 * h));
		const tgtR = [clamp(xf + 0.4, 2.2, S_LEN - 1.5), 0, 0];
		const posR = add3(tgtR, mul3(dirR, dR));
		// The whole body, nearly side-on.
		const dirF = norm([-0.22, 0.3, 0.93]);
		const dF = (L * kR0) / (0.86 * w) + 6;
		const tgtF = [L / 2 - 2, -1, 0];
		const posF = add3(tgtF, mul3(dirF, dF));
		const kR = smooth(span(t, ...B.view));
		const kF = smooth(span(t, ...B.back));
		let pos = lerp3(lerp3(E0.pos, posR, kR), posF, kF);
		let tgt = lerp3(lerp3(E0.tgt, tgtR, kR), tgtF, kF);
		let k = kOf(30, w, h);
		if (t > B.swim) {
			// Round behind it, above and aside; then down onto the line.
			const C = st.C;
			const k1 = smooth(span(t, ...B.behind));
			const k2 = smooth(span(t, ...B.onLine));
			const line = toB([C.gl.x * k2, C.gl.y * k2, C.D(t) - D_CH]);
			const pB = [L + 34, 15, 24];
			const rel = lerp3(lerp3(posF, pB, k1), [D_C, 0, 0], k2);
			pos = add3(line, rel);
			const tA = add3(line, lerp3(tgtF, [-70, -4, 0], k1));
			tgt = lerp3(tA, toB([C.gl.x * k2, C.gl.y * k2, 0]), k2);
			k = lerp(kOf(fovAt(t), w, h), C.F, smooth(span(t, ...B.narrow)));
		}
		const fovV = (360 / Math.PI) * Math.atan(h / 2 / k);
		const cam = camera3({ pos, target: tgt, up: [0, 1, 0], fov: fovV, w, h });
		cam.k = k;
		cam.fov = fovV;
		cam.fovV = fovV;
		cam.tgt = tgt;
		cam.lc = toC(pos);
		cam.tgtC = toC(tgt);
		cam.offset = null;
		// Where the corridor's axis meets the board.
		const fa = dot(AHEAD, cam.f);
		cam.vp = [w / 2 + (k * dot(AHEAD, cam.r)) / fa, h / 2 - (k * dot(AHEAD, cam.u)) / fa];
		return cam;
	}
	// The fall's lens (log/fall.js lensAt: the plate units, its own focal
	// length F, its screen shifted to (ox, oy) by the sway) as a board lens
	// in the body's axes, square down the corridor.
	function lensOfFall(fc, w, h, F) {
		const lc = [fc.x, fc.y, fc.z];
		const pos = toB(lc);
		const f = AHEAD;
		const r = [0, 0, -1];
		const u = [0, 1, 0];
		const project = (p) => {
			const d = sub3(p, pos);
			const z = dot(d, f);
			return [fc.ox + (F * dot(d, r)) / z, fc.oy - (F * dot(d, u)) / z, z];
		};
		const fovV = (360 / Math.PI) * Math.atan(h / 2 / F);
		return {
			project,
			pos,
			f,
			r,
			u,
			k: F,
			fov: fovV,
			fovV,
			lc,
			tgtC: [fc.x, fc.y, fc.z - 1],
			offset: [fc.ox, fc.oy],
			vp: [fc.ox, fc.oy]
		};
	}
	// ── The swimmer in the corridor ──────────────────────────────────────────
	// Its nose on the line, D_CH ahead of the lens, a little off the line
	// (OFF) once the lens is behind, heading a little across it (DIR_C). As
	// the lens slows to land (B.aim) the swimmer does not: the gap between
	// them grows, from rest, until at the flash the nose is at the last
	// glass and still going — the lens at d₀, the glass gl.z behind the
	// frame — its offset given up, its heading turned into the glass.
	function swimmerAt(t, st) {
		const C = st.C;
		const k2 = smooth(span(t, ...B.onLine));
		const u = span(t, ...B.aim);
		const pull = u * u * (1.6 - 0.6 * u); // from rest, still going at the glass
		const gap = lerp(D_CH, C.d0 - C.gl.z + 0.02, pull);
		const z = C.D(t) - gap;
		const off = 1 - smooth(span(t, B.aim[1] - 5, B.aim[1] - 1.5));
		const nose = add3(toB([C.gl.x * k2, C.gl.y * k2, z]), mul3(OFF, k2 * off));
		const cross = k2 * (1 - 0.7 * smooth(span(t, B.aim[1] - 4, B.aim[1])));
		const dir = norm([lerp(-1, DIR_C[0], cross), DIR_C[1] * cross, DIR_C[2] * cross]);
		return { nose, dir, z };
	}
	const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
	// The reading frame's centre on the axis.
	function frameX(t) {
		const u = span(t, ...B.read);
		return lerp(XR(1), XR(NR - 2), u);
	}

	// ── The body's shape at t ────────────────────────────────────────────────
	function shapeAt(t, st) {
		const b = st.body;
		const sp = st.spec;
		return b.shape(t, {
			beat: span(t, B.life, B.life + 1.0),
			phase: TAU * sp.beat.hz * eased(t - B.life, 0.8) + sp.beat.phase,
			roll: TAU * sp.roll * eased(t - B.life - 0.2, 1.2)
		});
	}

	// ── Drawing: the strand ──────────────────────────────────────────────────
	// The backbones and the rungs, lettered; the near side bold, the far side
	// faint. The backbones run from the 5′ end (pinched into the stop) to
	// `reach` (by default the newest rung), `r` the radius, `a0` the turn,
	// `tw` the twist a base pair, `inside` [x0, x1, k] where the body's rings
	// already surround it (drawn k as bright there).
	function drawStrand(ctx, cam, o) {
		const { digits, a0, tw, r, alpha, letters, bad, trace = null, inside = null } = o;
		if (alpha <= 0.004) return;
		const b = [];
		for (const dg of digits) {
			if (dg.d === null) b.push(null, null);
			else b.push(Math.floor(dg.d / 4), dg.d % 4);
		}
		const gr = digits.flatMap((dg) => [dg.g, dg.g]);
		// The backbones reach the newest rung's far side, grown with it.
		let reach = 0;
		for (let j = 0; j < NR; j++) if (gr[j] > 0) reach = Math.max(reach, XR(j) + gr[j] * DS * 0.5);
		if (o.reach !== undefined) reach = o.reach;
		if (reach <= 0.01) return;
		const psi = (x) => a0 + (tw * x) / DS;
		const rad = (x) => r * smooth(span(x, 0, 0.35));
		const P = (x, k) => {
			const a = psi(x) + k * GROOVE;
			const rr = rad(x);
			return [x, rr * Math.cos(a), rr * Math.sin(a)];
		};
		const eye = cam.pos;
		const facing = (p) => {
			const v = sub3(eye, [p[0], 0, 0]);
			return p[1] * v[1] + p[2] * v[2] >= 0;
		};
		const dim = (x) => (inside && x >= inside[0] && x <= inside[1] ? inside[2] : 1);
		const FR = [];
		const BK = [];
		const n = Math.max(2, Math.ceil(reach / 0.05));
		for (let k = 0; k < 2; k++) {
			let pa = P(0, k);
			let qa = cam.project(pa);
			for (let i = 1; i <= n; i++) {
				const x = (reach * i) / n;
				const pb = P(x, k);
				const qb = cam.project(pb);
				if (qa[2] > NEAR && qb[2] > NEAR) {
					const m = mul3(add3(pa, pb), 0.5);
					(facing(m) ? FR : BK).push([qa, qb, dim(x)]);
				}
				pa = pb;
				qa = qb;
			}
		}
		const segs = (L, a, wd, color = PAL.chalk) => {
			const by = new Map();
			for (const [p0, p1, d] of L) {
				const key = Math.round(d * 10);
				if (!by.has(key)) by.set(key, []);
				by.get(key).push(p0, p1);
			}
			for (const [key, pts] of by) {
				ctx.save();
				ctx.globalAlpha = alpha * a * (key / 10);
				ctx.strokeStyle = color;
				ctx.lineWidth = wd;
				ctx.lineCap = 'round';
				ctx.beginPath();
				for (let i = 0; i < pts.length; i += 2) {
					ctx.moveTo(pts[i][0], pts[i][1]);
					ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
				}
				ctx.stroke();
				ctx.restore();
			}
		};
		segs(BK, 0.2, 0.9);
		// The rungs: each half its base, from its backbone to the middle; the
		// letters face each other across the axis.
		const fs = Math.max(
			8,
			Math.min(13, (cam.k * 0.42) / Math.max(1, dist(eye, [S_LEN / 2, 0, 0])))
		);
		for (let j = 0; j < NR; j++) {
			const g = gr[j];
			if (g <= 0 || b[j] === null) continue;
			const x = XR(j);
			const A = P(x, 0);
			const C = P(x, 1);
			const M = mul3(add3(A, C), 0.5);
			const color = bad[j >> 1] ? PAL.rose : PAL.chalk;
			const base = [b[j], COMP[b[j]]];
			for (let k = 0; k < 2; k++) {
				const E = k ? C : A;
				const end = lerp3(E, M, 0.58 * g);
				const q0 = cam.project(E);
				const q1 = cam.project(end);
				if (q0[2] <= NEAR || q1[2] <= NEAR) continue;
				const front = facing(E);
				const a = alpha * dim(x) * (front ? 0.55 : 0.2);
				stroke(ctx, [q0, q1], { color, width: front ? 1.1 : 0.8, alpha: a });
				if (letters > 0.01 && g > 0.6) {
					const ql = cam.project(lerp3(E, M, 0.8));
					const la = alpha * letters * dim(x) * (front ? 0.62 : 0.24) * smooth(span(g, 0.6, 1));
					if (la > 0.01 && ql[2] > NEAR) {
						ctx.save();
						ctx.font = `400 ${fs}px ${TECH_FONT}`;
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.globalAlpha = la;
						ctx.fillStyle = color;
						ctx.fillText(LETTER[base[k]], ql[0], ql[1]);
						ctx.restore();
					}
				}
			}
		}
		segs(FR, 0.52, 1.25);
		// A gold trace running 5′ → 3′ along both backbones.
		if (trace !== null && trace > -0.2 && trace < 1.2) {
			const x0 = Math.max(0, (trace - 0.12) * reach);
			const x1 = Math.min(reach, trace * reach);
			for (let k = 0; k < 2; k++) {
				if (x1 <= x0) break;
				const pts = [];
				for (let i = 0; i <= 12; i++) pts.push(cam.project(P(lerp(x0, x1, i / 12), k)));
				if (pts.every((p) => p[2] > NEAR))
					stroke(ctx, pts, { color: PAL.gold, width: 1.6, alpha: 0.85 * alpha });
			}
			if (trace >= 0 && trace <= 1) {
				const hd = cam.project([trace * reach, 0, 0]);
				if (hd[2] > NEAR) disc(ctx, hd[0], hd[1], 2, { fill: PAL.gold, alpha: 0.8 * alpha });
			}
		}
		return { reach, P };
	}
	const dist = (a, c) => Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);

	// The reading frame: a gold cage round three rungs, its codon over it.
	function drawFrame(ctx, cam, xc, a, st) {
		if (a <= 0.004) return;
		const half = 1.5 * DS;
		const rr = RS * 1.55;
		const ring = (x) => {
			const out = [];
			for (let i = 0; i <= 40; i++) {
				const ph = (TAU * i) / 40;
				out.push(cam.project([x, rr * Math.cos(ph), rr * Math.sin(ph)]));
			}
			return out;
		};
		const r0 = ring(xc - half);
		const r1 = ring(xc + half);
		if (r0.some((p) => p[2] <= NEAR) || r1.some((p) => p[2] <= NEAR)) return;
		stroke(ctx, r0, { color: PAL.gold, width: 1.2, alpha: 0.7 * a });
		stroke(ctx, r1, { color: PAL.gold, width: 1.2, alpha: 0.7 * a });
		for (let i = 0; i < 40; i += 10)
			stroke(ctx, [r0[i], r1[i]], { color: PAL.gold, width: 0.9, alpha: 0.4 * a });
		// The codon, over the cage.
		const c = Math.round(clamp(xc / DS - 0.5, 1, NR - 2));
		const cod = codonOf(st.bases, c);
		const top = cam.project([xc, rr * 1.3, 0]);
		if (top[2] > NEAR) {
			ctx.save();
			const fs = Math.round(clamp(0.022 * board.h, 12, 20));
			ctx.font = `400 ${fs}px ${TECH_FONT}`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.globalAlpha = 0.85 * a;
			ctx.fillStyle = PAL.gold;
			ctx.fillText(cod.map((x) => LETTER[x]).join(' '), top[0], top[1]);
			ctx.restore();
		}
	}

	// The rings of the head, neck and midpiece as the frame expresses them.
	// Ring j is written as the frame's centre passes its station s_j (body
	// built straight along +x, its width along y and its thickness along z).
	function expressed(ctx, cam, st, t) {
		const body = st.body;
		const span0 = XR(NR - 2) - XR(1);
		for (const i of body.rings) {
			const stn = body.stations[i];
			if (stn.s > S_LEN) break;
			const xf0 = clamp(stn.s - 0.1, XR(1), XR(NR - 2));
			const t0 = B.read[0] + ((xf0 - XR(1)) / span0) * (B.read[1] - B.read[0]);
			const k = span(t, t0, t0 + 0.7);
			if (k <= 0 || k >= 1) continue;
			const c = Math.round(clamp(stn.s / DS - 0.5, 1, NR - 2));
			const gain = lerp(CODON.flash, 1, smooth(k));
			const shape = codonShape(codonOf(st.bases, c), gain);
			const grow = smooth(span(k, 0, 0.25));
			const pts = [];
			for (let q = 0; q <= 64; q++) {
				const [u, v] = shape((TAU * q) / 64 + Math.PI / 2);
				const p = cam.project([stn.s, grow * stn.a * u, grow * stn.b * v]);
				if (p[2] <= NEAR) return;
				pts.push(p);
			}
			stroke(ctx, pts, {
				color: PAL.gold,
				width: 1.4,
				alpha: 0.85 * (1 - smooth(span(k, 0.45, 1)))
			});
		}
	}

	// The two backbones as a rope down the tail, 3′ end to the tip, written
	// out to `upto` of its length.
	function drawRope(ctx, cam, st, upto, a, a0) {
		if (a <= 0.004 || upto <= 0) return;
		const L = st.body.length;
		const x0 = S_LEN;
		const x1 = lerp(x0, L, upto);
		const n = Math.ceil((x1 - x0) / 0.12);
		for (let k = 0; k < 2; k++) {
			const pts = [];
			for (let i = 0; i <= n; i++) {
				const x = lerp(x0, x1, i / n);
				const v = (x - x0) / (L - x0);
				const r = 0.22 * (1 - 0.85 * v);
				const ph = a0 + (TAU * (x - x0)) / 2.4 + k * Math.PI;
				pts.push(cam.project([x, r * Math.cos(ph), r * Math.sin(ph)]));
			}
			if (pts.every((p) => p[2] > NEAR))
				stroke(ctx, pts, { color: PAL.chalk, width: 1, alpha: 0.6 * a });
		}
		const tip = cam.project([x1, 0, 0]);
		if (upto < 1 && tip[2] > NEAR)
			disc(ctx, tip[0], tip[1], 1.8, { fill: PAL.gold, alpha: 0.7 * a });
	}

	// ── Drawing: the last room, at the corridor's end ────────────────────────
	// log/fall.js drawFall's level, line for line, for the one room of the
	// fall — before f0, from the corridor's lens (its place `lc` in plate
	// units, its focal length F, its axis meeting the board at (ox, oy)) —
	// so that at f0, where the lens is the fall's own (square on the glass,
	// d₀ off, no sway), the picture is the fall's to the pixel. Before f0
	// the room is chalk (its colour comes at B.colour) and its glass unlit
	// (the fall lights it from B.land[0] + 0.6): through the glass, the
	// corridor's own dark, and over it the room's light (beacon()).
	function drawEnd(ctx, w, h, st, lc, F, ox, oy, alpha) {
		if (alpha <= 0.003) return;
		const lv = st.geo.levels[0];
		const cam = { x: lc[0], y: lc[1], z: lc[2], s: 1, ox, oy };
		const project = (x, y, z) => {
			const d = cam.z - z;
			return [cam.ox + (F * (x - cam.x)) / d, cam.oy - (F * (y - cam.y)) / d, d];
		};
		const plane = (z) => {
			const wz = lv.O[2] + lv.s * z;
			const dw = cam.z - wz;
			if (dw <= 0.015 * cam.s) return null;
			const m = (F * lv.s) / dw;
			const [e, f] = project(lv.O[0], lv.O[1], wz);
			return { m, e, f };
		};
		const at = (T, x, y) => [T.e + T.m * x, T.f - T.m * y];
		const boxOf = (T, x, y, rw, rh) => {
			const [x0, y0] = at(T, x - rw / 2, y + rh / 2);
			return [x0, y0, x0 + rw * T.m, y0 + rh * T.m];
		};
		const meet = (A, C) => [
			Math.max(A[0], C[0]),
			Math.max(A[1], C[1]),
			Math.min(A[2], C[2]),
			Math.min(A[3], C[3])
		];
		const empty = (X) => X[2] <= X[0] || X[3] <= X[1];
		const pathBox = (X) => ctx.rect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
		const clipBox = (X) => {
			ctx.beginPath();
			pathBox(X);
			ctx.clip();
		};
		const corners = (X) => [
			[X[0], X[1]],
			[X[2], X[1]],
			[X[2], X[3]],
			[X[0], X[3]],
			[X[0], X[1]]
		];
		const layer = (key, box) => {
			const l = lv.lay[key];
			const a = art[lv.decade]?.[key];
			if (!l || !a) return;
			const T = plane(l.z);
			if (!T) return;
			const tiles = key === 'bg' ? 1 : 0;
			for (let j = -tiles; j <= tiles; j++)
				for (let i = -tiles; i <= tiles; i++) {
					const x = l.x + i * l.w;
					const y = l.y + j * l.h;
					const R = boxOf(T, x, y, l.w, l.h);
					if (empty(meet(R, box))) continue;
					const [px, py] = at(T, x, y);
					const sw = l.w * T.m;
					const sh = l.h * T.m;
					const flipX = i % 2 !== 0;
					const flipY = j % 2 !== 0;
					ctx.save();
					if (flipY) {
						ctx.translate(px, py);
						ctx.scale(1, -1);
						ctx.translate(-px, -py);
					}
					if (a.chalk) drawImageAt(ctx, a.chalk, px, py, sw, sh, { alpha: 0.95, flipX });
					ctx.restore();
				}
			if (key !== 'bg' && l.w * T.m > 14) {
				stroke(ctx, corners(boxOf(T, l.x, l.y, l.w, l.h)), {
					color: PAL.chalk,
					width: 0.9,
					alpha: 0.32 * alpha,
					dash: [4, 5]
				});
			}
		};
		const box = [0, 0, w, h];
		const T0 = plane(0);
		const frame = T0 ? meet(box, boxOf(T0, 0, 0, PLATE.W, PLATE.H)) : box;
		if (empty(frame)) return;
		const Tg = lv.glass ? plane(lv.glass.z) : null;
		const G = Tg ? boxOf(Tg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		const gb = G ? meet(frame, G) : null;
		const hole = gb && !empty(gb);
		ctx.save();
		ctx.globalAlpha = alpha;
		clipBox(frame);
		ctx.save();
		if (hole) {
			ctx.beginPath();
			pathBox(frame);
			pathBox(gb);
			ctx.clip('evenodd');
		}
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(frame[0], frame[1], frame[2] - frame[0], frame[3] - frame[1]);
		layer('bg', frame);
		layer('poster', frame);
		layer('clock', frame);
		ctx.restore();
		layer('screen', frame);
		layer('desk', frame);
		layer('bed', frame);
		if (G) stroke(ctx, corners(G), { color: PAL.chalk, width: 1.2, alpha: 0.55 * alpha });
		ctx.restore();
		if (T0)
			stroke(ctx, corners(boxOf(T0, 0, 0, PLATE.W, PLATE.H)), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9 * alpha
			});
	}

	// ── The last room's light ────────────────────────────────────────────────
	// In its glass from the start: a lit point while the glass is a speck, a
	// warm light round it as it grows; and as the swimmer dives for it, a
	// blaze that the white flash is the end of.
	function lightAt(t) {
		return (
			smooth(span(t, ...B.vp)) * lerp(0.45, 1.15, smooth(span(t, 30, 51))) +
			2.2 * smooth(span(t, ...B.blaze)) ** 2
		);
	}
	function beacon(ctx, w, h, cam, st, t) {
		const a = smooth(span(t, ...B.vp));
		if (a <= 0.003) return;
		const gl = st.C.gl;
		const q = cam.project(toB([gl.x, gl.y, gl.z]));
		if (q[2] <= NEAR) return;
		const pxu = (cam.k * SIG) / q[2];
		const gh = gl.h * pxu;
		const gw = gl.w * pxu;
		const R = Math.max(gw, gh);
		const L = Math.min(1.2, lightAt(t));
		const bl = smooth(span(t, ...B.blaze));
		// The sun in the glass, once it is big enough to hold one.
		const sa = a * smooth(span(gh, 14, 60));
		if (sa > 0.01) sun(ctx, w, h, q[0], q[1], gw, gh, t, sa, bl);
		glow(ctx, q[0], q[1], Math.max(26, 1.5 * R), [255, 206, 140], 0.4 * a * L);
		glow(ctx, q[0], q[1], Math.max(9, 0.55 * R), [255, 236, 200], 0.36 * a * L);
		// A speck: the lit point, gold, a hot core.
		const sp = a * (1 - smooth(span(R, 10, 40)));
		if (sp > 0.01) {
			disc(ctx, q[0], q[1], 2.4, { fill: PAL.gold, alpha: 0.9 * sp });
			disc(ctx, q[0], q[1], 1.1, { fill: '#fffaf0', alpha: sp });
		}
		// The blaze, into the flash.
		if (bl > 0.003) {
			glow(ctx, q[0], q[1], lerp(1.2 * R, 1.1 * Math.max(w, h), bl * bl), [255, 248, 232], bl * bl);
			ctx.save();
			ctx.globalAlpha = 0.85 * bl * bl;
			ctx.fillStyle = '#fffcf5';
			ctx.fillRect(q[0] - gw / 2, q[1] - gh / 2, gw, gh);
			ctx.restore();
		}
	}

	// The point every line of the corridor runs into, seen as the lead's
	// sunshine: a log-polar lattice at its point at infinity — rays by angle
	// in the warm spectrum (reds, oranges, golds, yellows, round once),
	// turning slowly, and rings an e-fold apart (½ in the log) streaming out
	// of the centre as the lens goes in. In the last room's glass, and, as
	// the light swells into the flash, spreading past it over the board.
	const SUN = ['#e0603e', '#f2984a', '#f5c150', '#f8e2a0'];
	function sun(ctx, w, h, cx, cy, gw, gh, t, alpha, bl) {
		const turn = 0.03 * TAU * t;
		const ph = (t * 0.6) % 1;
		const r0 = 0.04 * Math.min(gw, gh);
		// In the glass, whole.
		ctx.save();
		ctx.beginPath();
		ctx.rect(cx - gw / 2, cy - gh / 2, gw, gh);
		ctx.clip();
		lattice(ctx, cx, cy, Math.hypot(gw, gh) / 2, r0, turn, ph, alpha);
		ctx.restore();
		// Past it, as the light swells: the same lattice, its beams reaching
		// further and brighter, fading out along themselves (no edge).
		const k = bl * bl * bl;
		if (k > 0.002)
			lattice(
				ctx,
				cx,
				cy,
				lerp(Math.hypot(gw, gh) / 2, 1.6 * Math.max(w, h), k),
				r0,
				turn,
				ph,
				alpha * k
			);
	}
	function lattice(ctx, cx, cy, R, r0, turn, ph, alpha) {
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		// The rays: 32 wedges, every other one lit, coloured by angle, each
		// a beam, brightest at the centre and gone at R.
		const N = 32;
		const fill = SUN.map((c) => {
			const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
			g.addColorStop(0, c);
			g.addColorStop(0.3, `${c}88`);
			g.addColorStop(1, `${c}00`);
			return g;
		});
		for (let i = 0; i < N; i += 2) {
			const a0 = turn + (i / N) * TAU;
			const f = (i / N) * SUN.length;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.arc(cx, cy, R, a0, a0 + TAU / N);
			ctx.closePath();
			ctx.fillStyle = fill[Math.floor(f) % SUN.length];
			ctx.globalAlpha = alpha * (0.32 + 0.12 * (f - Math.floor(f)));
			ctx.fill();
		}
		// The rings, streaming out: radius r₀·e^(½(n + phase)), fading out
		// with the beams.
		ctx.lineWidth = 1;
		ctx.strokeStyle = PAL.gold;
		for (let n = 0; ; n++) {
			const r = r0 * Math.exp(0.5 * (n + ph));
			if (r > R) break;
			ctx.globalAlpha = alpha * 0.4 * smooth(span(r, r0, 6 * r0)) * (1 - r / R);
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, TAU);
			ctx.stroke();
		}
		ctx.restore();
	}

	// ── Lines by hand ────────────────────────────────────────────────────────
	// The board's lines here are batched (by colour, alpha and width, a path
	// each) and drawn as by hand: every ~26 px of a line nudged across it by
	// a seeded noise, re-drawn BOIL times a second.
	function makeInk() {
		const by = new Map();
		return {
			add(pts, { color = PAL.chalk, alpha = 1, width = 1 } = {}) {
				if (pts.length < 2 || alpha < 0.01) return;
				const key = `${color}|${Math.round(alpha * 24)}|${Math.round(width * 4)}`;
				let L = by.get(key);
				if (!L) by.set(key, (L = []));
				L.push(pts);
			},
			flush(ctx) {
				ctx.save();
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				for (const [key, runs] of by) {
					const [color, al, wd] = key.split('|');
					ctx.strokeStyle = color;
					ctx.globalAlpha = Number(al) / 24;
					ctx.lineWidth = Number(wd) / 4;
					ctx.beginPath();
					for (const R of runs) {
						ctx.moveTo(R[0][0], R[0][1]);
						for (let i = 1; i < R.length; i++) ctx.lineTo(R[i][0], R[i][1]);
					}
					ctx.stroke();
				}
				ctx.restore();
				by.clear();
			}
		};
	}
	// A 2D segment, clipped to the board (and a margin), drawn by hand.
	function handSeg(a, b, w, h, seed, t, amp = 0.9) {
		const M = 40;
		let t0 = 0;
		let t1 = 1;
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const P = [-dx, dx, -dy, dy];
		const Q = [a[0] + M, w + M - a[0], a[1] + M, h + M - a[1]];
		for (let i = 0; i < 4; i++) {
			if (P[i] === 0) {
				if (Q[i] < 0) return null;
				continue;
			}
			const r = Q[i] / P[i];
			if (P[i] < 0) t0 = Math.max(t0, r);
			else t1 = Math.min(t1, r);
		}
		if (t0 >= t1) return null;
		const len = Math.hypot(dx, dy) * (t1 - t0);
		const n = Math.max(1, Math.min(60, Math.ceil(len / 26)));
		const nx = -dy / (Math.hypot(dx, dy) || 1);
		const ny = dx / (Math.hypot(dx, dy) || 1);
		const fr = Math.floor(t * BOIL);
		const out = [];
		for (let i = 0; i <= n; i++) {
			const u = t0 + ((t1 - t0) * i) / n;
			const o = amp * (2 * hash(seed * 131 + i * 17 + fr * 7919) - 1);
			out.push([a[0] + u * dx + nx * o, a[1] + u * dy + ny * o]);
		}
		return out;
	}
	// Where a point of the corridor is, from the lens: [sx, sy, depth in
	// plate units], or null behind the near plane.
	const NEAR_C = 0.25;
	function at3(cam, p) {
		const q = cam.project(toB(p));
		const d = q[2] / SIG;
		return d > NEAR_C ? [q[0], q[1], d] : null;
	}
	// A corridor segment in 3D, clipped to the near plane, as 2D ends.
	function seg3(cam, a, b) {
		const da = dot(sub3(toB(a), cam.pos), cam.f) / SIG;
		const db = dot(sub3(toB(b), cam.pos), cam.f) / SIG;
		if (da <= NEAR_C && db <= NEAR_C) return null;
		let A = a;
		let Bb = b;
		if (da <= NEAR_C) A = lerp3(a, b, (NEAR_C - da) / (db - da) + 1e-4);
		else if (db <= NEAR_C) Bb = lerp3(a, b, (da - NEAR_C) / (da - db) - 1e-4);
		const qa = at3(cam, A);
		const qb = at3(cam, Bb);
		return qa && qb ? [qa, qb] : null;
	}

	// ── The corridor's orthogonals ───────────────────────────────────────────
	// Its four edges, and the lines of the rooms' tops and bottoms on the
	// walls (y = ±1 on the sides, x = ±φ on the floor and the ceiling): all
	// running into the one point, drawn out of it toward the lens over
	// B.rays, fading with distance as the GPU's fog does.
	const RAYS = [];
	for (const sx of [-1, 1])
		for (const sy of [-1, 1]) {
			RAYS.push({ x: sx * WC, y: sy * HC, a: 0.5 });
			RAYS.push({ x: sx * WC, y: sy * 1, a: 0.22 });
			RAYS.push({ x: sx * PHI, y: sy * HC, a: 0.22 });
		}
	function rays(ink, w, h, cam, st, t, pens) {
		const zl = cam.lc[2];
		const zEnd = lerp(0, zl + 2, smooth(span(t, ...B.rays)));
		if (zEnd <= 0.01) return;
		const on = smooth(span(t, B.rays[0], B.rays[0] + 0.4));
		RAYS.forEach((R, i) => {
			// In pieces by distance, for the fog.
			let z0 = 0;
			for (let k = 0; z0 < zEnd; k++) {
				const z1 = Math.min(zEnd, Math.max(z0 + 0.5, zl - (zl - z0) * 0.62));
				const s = seg3(cam, [R.x, R.y, z0], [R.x, R.y, z1]);
				if (s) {
					const dm = Math.max(NEAR_C, zl - (z0 + z1) / 2);
					const pts = handSeg(s[0], s[1], w, h, 900 + i * 37 + k, t, 0.7);
					if (pts)
						ink.add(pts, { alpha: on * R.a * fogOf(0.55 * dm), width: R.a > 0.4 ? 1.2 : 0.9 });
				}
				z0 = z1;
			}
			// The chalk's point, where the line is being drawn.
			if (zEnd < zl - 1) {
				const p = at3(cam, [R.x, R.y, zEnd]);
				if (p && p[0] > -9 && p[0] < w + 9 && p[1] > -9 && p[1] < h + 9)
					pens.push([p[0], p[1], R.a]);
			}
		});
	}

	// ── The corridor's rings ─────────────────────────────────────────────────
	// The section at every cell's edge (and the end wall's, at 0), written
	// round out of the point toward the lens over B.rings; the far ones
	// before the swimmer, the near after.
	function rings(ink, w, h, cam, st, t, zN, which) {
		const C = st.C;
		const zl = cam.lc[2];
		C.rings.forEach((z, i) => {
			if (z >= zl - NEAR_C) return;
			if ((which === 'near') !== z > zN) return;
			const tz = B.rings[0] + (B.rings[1] - B.rings[0] - 0.6) * clamp01(z / D_S);
			const up = smooth(span(t, tz, tz + 0.6));
			if (up <= 0) return;
			const d = zl - z;
			const al = (i === 0 ? 0.6 : 0.36) * fogOf(0.7 * d) * smooth(span(d, 0.6, 1.6));
			if (al < 0.01) return;
			const P = [
				[-WC, HC, z],
				[WC, HC, z],
				[WC, -HC, z],
				[-WC, -HC, z],
				[-WC, HC, z]
			].map((p) => at3(cam, p));
			if (P.some((p) => !p)) return;
			// Written round from the top left, to `up` of its length.
			let left = up * 4;
			for (let e = 0; e < 4 && left > 0; e++) {
				const f = Math.min(1, left);
				left -= 1;
				const b = [lerp(P[e][0], P[e + 1][0], f), lerp(P[e][1], P[e + 1][1], f)];
				const pts = handSeg(P[e], b, w, h, 3000 + i * 11 + e, t, 0.8);
				if (pts) ink.add(pts, { alpha: al, width: i === 0 ? 1.4 : 1 });
			}
		});
	}

	// ── The signs ────────────────────────────────────────────────────────────
	// Plaques hung under the ceiling facing the lens (a plane square to it,
	// so the type is the board's own, crisp), alternately left and right:
	// the years, the birth (in the middle, gold, its ring round the
	// corridor), the months. Each is struck through in red as it is reached
	// (when it is STRIKE ahead), and given up as it passes over. The plaques
	// are opaque: laid out once a frame (signLayout), a farther one given up
	// as far as the nearer plaques would cover it (so the months, crowding
	// as the lens slows, are read a few at a time rather than in a heap),
	// and drawn far to near, each whole before the next.
	const STRIKE = 4.4;
	function signLayout(ctx, w, h, cam, st, t) {
		const C = st.C;
		const zl = cam.lc[2];
		const on = smooth(span(t, ...B.signs));
		const out = [];
		if (on <= 0.003) return out;
		ctx.save();
		for (let si = 0; si < C.signs.length; si++) {
			const s = C.signs[si];
			const d = zl - s.z;
			if (d < 0.5 || d > 46) continue;
			// Only the next few: the years from 17 ahead, the months from 8.
			const far = s.kind === 'month' ? [5.8, 8] : s.kind === 'year' ? [12, 17] : [18, 26];
			const fa = 1 - smooth(span(d, far[0], far[1]));
			if (fa <= 0.01) continue;
			// (Closer in on a narrow board, whose lens sees less of the width.)
			const nk = Math.max(0.45, Math.min(1, (1.15 * w) / h));
			const x0 = s.side * SIGN_X * nk * (s.kind === 'month' ? 1.45 : 1);
			const q = at3(cam, [x0, SIGN_Y, s.z]);
			if (!q) continue;
			let pxu = cam.k / q[2];
			const big = s.kind === 'birth';
			const a = on * fa * fogOf(d) * smooth(span(d, 0.9, 1.8));
			if (a < 0.01 || pxu * 0.12 < 2.5) continue;
			// The plaque's size, from its lines; one wider than the board (a
			// phone's, close) set smaller to fit it.
			let wMax = 0;
			for (const ln of s.lines) {
				ctx.font = `400 ${ln.size * pxu}px ${TECH_FONT}`;
				wMax = Math.max(wMax, ctx.measureText(ln.text).width);
			}
			const W0 = wMax + 0.22 * pxu;
			const fit = Math.min(1, (w - 16) / W0);
			pxu *= fit;
			const W = W0 * fit;
			const lh = s.lines.map((ln) => 1.3 * ln.size * pxu);
			const H = lh.reduce((u, v) => u + v, 0) + 0.12 * pxu;
			// Kept on the board.
			const cx = Math.max(W / 2 + 6, Math.min(w - W / 2 - 6, q[0]));
			out.push({ s, si, d, x0, pxu, a, a0: a, W, H, lh, cx, cy: q[1], big });
		}
		ctx.restore();
		// Near to far (the order they are listed in): each given up by how
		// much of it the nearer plaques, as they are shown, would cover.
		for (let i = 0; i < out.length; i++) {
			const P = out[i];
			let keep = 1;
			for (let j = 0; j < i; j++) {
				const Q = out[j];
				const ox =
					Math.min(P.cx + P.W / 2, Q.cx + Q.W / 2) - Math.max(P.cx - P.W / 2, Q.cx - Q.W / 2);
				const oy =
					Math.min(P.cy + P.H / 2, Q.cy + Q.H / 2) - Math.max(P.cy - P.H / 2, Q.cy - Q.H / 2);
				if (ox <= 0 || oy <= 0) continue;
				keep *= 1 - Q.a * smooth(span((ox * oy) / (P.W * P.H), 0.02, 0.2));
			}
			P.a *= keep;
		}
		return out;
	}
	function signs(ctx, w, h, cam, t, layout, zN, which) {
		const fr = Math.floor(t * BOIL);
		for (let i = layout.length - 1; i >= 0; i--) {
			const { s, si, x0, pxu, a, a0, W, H, lh, cx, cy, big } = layout[i];
			if ((which === 'near') !== s.z > zN) continue;
			if (a < 0.01 && !big) continue;
			const ink = makeInk();
			// The hangers, to the ceiling.
			const top = at3(cam, [x0, HC, s.z]);
			if (top)
				for (const sx of [-1, 1]) {
					const hx = cx + sx * 0.38 * W;
					const p = handSeg([hx, cy - H / 2], [hx, top[1]], w, h, 7000 + si * 5 + sx, t, 0.5);
					if (p) ink.add(p, { alpha: 0.45 * a, width: 1 });
				}
			// The board: opaque (what is behind does not show through it),
			// its edge by hand.
			ctx.save();
			ctx.globalAlpha = 0.92 * a;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(cx - W / 2, cy - H / 2, W, H);
			ctx.restore();
			const edge = [
				[cx - W / 2, cy - H / 2],
				[cx + W / 2, cy - H / 2],
				[cx + W / 2, cy + H / 2],
				[cx - W / 2, cy + H / 2],
				[cx - W / 2, cy - H / 2]
			];
			for (let e = 0; e < 4; e++) {
				const p = handSeg(edge[e], edge[e + 1], w, h, 8000 + si * 7 + e, t, 0.6);
				if (p)
					ink.add(p, {
						color: big ? PAL.gold : (s.era ?? PAL.chalk),
						alpha: (big ? 0.8 : 0.62) * a,
						width: big ? 1.2 : 1.1
					});
			}
			// The birth's ring: gold, round the corridor.
			if (big) {
				const P = [
					[-WC, HC, s.z],
					[WC, HC, s.z],
					[WC, -HC, s.z],
					[-WC, -HC, s.z],
					[-WC, HC, s.z]
				].map((p) => at3(cam, p));
				if (P.every(Boolean))
					for (let e = 0; e < 4; e++) {
						const p = handSeg(P[e], P[e + 1], w, h, 9500 + e, t, 0.9);
						if (p) ink.add(p, { color: PAL.gold, alpha: 0.7 * a0, width: 1.5 });
					}
			}
			ink.flush(ctx);
			// The type, a hair unsteady (on twos).
			ctx.save();
			let y = cy - H / 2 + 0.06 * pxu;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			s.lines.forEach((ln, k) => {
				const fs = ln.size * pxu;
				y += lh[k] / 2;
				const jx = 0.35 * (2 * hash(si * 97 + k * 13 + fr * 31) - 1);
				const jy = 0.35 * (2 * hash(si * 89 + k * 7 + fr * 53) - 1);
				ctx.font = `400 ${fs}px ${TECH_FONT}`;
				ctx.globalAlpha = a * (ln.alpha ?? 0.9);
				ctx.fillStyle = ln.gold ? PAL.gold : PAL.chalk;
				ctx.fillText(ln.text, cx + jx, y + jy);
				y += lh[k] / 2;
			});
			ctx.restore();
			// Struck through in red as it is reached: a slash, written on fast.
			const k = smooth(span(STRIKE - layout[i].d, 0, 0.4));
			if (k > 0 && !big) {
				const ln = s.lines[s.lines.length - 1];
				const fs = ln.size * pxu;
				ctx.save();
				ctx.font = `400 ${fs}px ${TECH_FONT}`;
				const tw = ctx.measureText(ln.text).width;
				ctx.restore();
				const yb = cy + H / 2 - 0.06 * pxu - 0.65 * fs;
				const A = [cx - 0.56 * tw, yb + 0.32 * fs];
				const Z = [cx + 0.56 * tw, yb - 0.28 * fs];
				const Bk = [lerp(A[0], Z[0], k), lerp(A[1], Z[1], k)];
				const p = handSeg(A, Bk, w, h, 9000 + si, t, 0.7);
				if (p) {
					const sk = makeInk();
					sk.add(p, { color: PAL.red, alpha: 0.92 * a, width: Math.max(1.4, 0.09 * fs) });
					sk.flush(ctx);
				}
			}
		}
	}

	// ── The door's workings ──────────────────────────────────────────────────
	// On the end wall round the last room (its plane, z = 0), each block
	// typed on over its beat: the landing (left), the room's rule (right),
	// Zeller's congruence (under it), the conception date in gold and its
	// weekday (over it). On a narrow board all of it over and under, set
	// larger (doorOf). Given up into the flash.
	function door(ctx, w, h, cam, st, t) {
		const D = st.door;
		const gone = 1 - smooth(span(t, B.hit - 0.12, B.hit + 0.05));
		if (gone <= 0.003) return;
		ctx.save();
		ctx.textBaseline = 'middle';
		for (const blk of D.blocks) {
			const write = smooth(span(t, ...blk.beat));
			if (write <= 0) continue;
			// The block's board: the end wall's dark under it, so that where
			// it runs past the wall (a narrow board) the corridor's lines do
			// not run through the type.
			let bx0 = Infinity;
			let by0 = Infinity;
			let bx1 = -Infinity;
			let by1 = -Infinity;
			for (const ln of blk.lines) {
				const q = at3(cam, [ln.x, ln.y, 0]);
				if (!q) continue;
				const fs = (ln.s * cam.k) / q[2];
				ctx.font = ln.math ? `italic 400 ${fs}px ${MATH_FONT}` : `400 ${fs}px ${TECH_FONT}`;
				const tw = ctx.measureText(ln.text).width;
				const al = ln.align ?? 'center';
				const x0 = al === 'left' ? q[0] : al === 'right' ? q[0] - tw : q[0] - tw / 2;
				bx0 = Math.min(bx0, x0 - 0.5 * fs);
				bx1 = Math.max(bx1, x0 + tw + 0.5 * fs);
				by0 = Math.min(by0, q[1] - 0.75 * fs);
				by1 = Math.max(by1, q[1] + 0.75 * fs);
			}
			if (bx1 > bx0) {
				ctx.globalAlpha = 0.82 * gone * Math.min(1, 4 * write);
				ctx.fillStyle = PAL.ground;
				ctx.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
			}
			const total = blk.lines.reduce((n, l) => n + l.text.length, 0);
			let budget = Math.floor(write * total + 1e-6);
			for (const ln of blk.lines) {
				if (budget <= 0) break;
				const q = at3(cam, [ln.x, ln.y, 0]);
				if (!q) continue;
				const fs = (ln.s * cam.k) / q[2];
				const str = ln.text.slice(0, budget);
				budget -= ln.text.length;
				if (fs < 2.5) continue;
				ctx.font = ln.math ? `italic 400 ${fs}px ${MATH_FONT}` : `400 ${fs}px ${TECH_FONT}`;
				ctx.textAlign = ln.align ?? 'center';
				ctx.globalAlpha = gone * (ln.alpha ?? 0.75);
				ctx.fillStyle = ln.gold ? PAL.gold : PAL.chalk;
				ctx.fillText(str, q[0], q[1]);
			}
		}
		ctx.restore();
	}
	// To the swim: flow-strand's world (the title's stop, the strand, the
	// reading, the body built and come to life).
	function world(ctx, w, h, t, hand, st) {
		const cam = lensAt(t, w, h, st, t < B.back[1] ? entry.frame(ctx, w, h, t, hand) : undefined);
		const body = st.body;
		const L = body.length;

		// The title fading and the stop gliding to the strand's 5′ end.
		const five = cam.project([0, 0, 0]);
		entry.title(ctx, w, h, t);
		const pan = easeIO(span(t, ...B.pan));
		const stop = TERM.layout(ctx, w, h).stop;

		const shape = shapeAt(t, st);
		const pose = { at: [0, 0, 0], dir: [-1, 0, 0], up: [0, 0, 1], scale: 1 };

		// ── The strand ──
		const digits = digitsAt(t, hand);
		const bad = badGroups(hand.typed);
		const a0 = spinAt(t, hand);
		const tw = twistAt(t, hand);
		const close = smooth(span(t, ...B.axis));
		const xf = frameX(t);
		const reading = span(t, ...B.read);
		const strandA = (t < Q1 ? 0 : 1) * (1 - smooth(span(t, B.contour[0], B.contour[1] + 0.2)));
		if (strandA > 0.004 && t >= Q1) {
			const tr1 = (t - E1) / B.trace;
			const tr2 = (t - E2) / B.trace;
			const trace = tr1 > -0.2 && tr1 < 1.2 ? tr1 : tr2 > -0.2 && tr2 < 1.2 ? tr2 : null;
			// Where the rings surround it, it is inside the body: fainter.
			const ringsTo = reading > 0 ? xf : -1;
			drawStrand(ctx, cam, {
				digits,
				a0,
				tw,
				r: RS * (1 - close),
				alpha: strandA,
				letters: 1 - smooth(span(t, B.read[0] - 0.4, B.read[0] + 0.4)) * 0.75 - 0.25 * close,
				bad,
				trace,
				inside: [0, ringsTo, 0.55],
				reach: t >= E2 ? lerp(XR(NR - 1) + DS * 0.5, S_LEN, close) : undefined
			});
		}
		// The stop: at the 5′ end, a full chalk dot (gone into the nose as the
		// rings come).
		if (t < B.read[0] + 0.6) {
			const X = lerp(stop.x, five[0], pan);
			const Y = lerp(stop.y, five[1], pan);
			const sa = 0.95 * (1 - smooth(span(t, B.read[0], B.read[0] + 0.6)));
			disc(ctx, X, Y, lerp(stop.r, Math.max(2.2, 0.8 * stop.r), pan), {
				fill: PAL.chalk,
				alpha: sa
			});
		}

		// ── The body ──
		if (t >= 15) {
			const NRg = body.rings.length;
			// Rings expressed as the frame passes (head, neck, midpiece), then the
			// tail's as the rope runs down it.
			const rope = smooth(span(t, ...B.rope));
			const xr = t < B.read[1] ? (reading > 0 ? xf + 0.1 : -1) : lerp(S_LEN, L + 1, rope);
			let count = 0;
			for (let j = 0; j < NRg; j++) {
				const s = body.stations[body.rings[j]].s;
				count += clamp01((xr - s) / 0.45);
			}
			const life = smooth(span(t, B.life - 0.2, B.life + 0.6));
			const gens = (j, G) =>
				smooth(span(t, B.gens[0] + (j / G) * 0.7, B.gens[0] + (j / G) * 0.7 + 0.45));
			body.draw(ctx, cam, shape, pose, {
				rings: count / NRg,
				gens,
				contour: smooth(span(t, ...B.contour)),
				axis: 0.55 * close * (1 - smooth(span(t, ...B.contour))),
				back: 0.2 * (1 - life),
				depth: null
			});
			// Each ring as it is expressed: its codon's own shape, four times
			// over, flashed in gold and relaxed into the body's section.
			if (t > B.read[0] && t < B.read[1] + 1) expressed(ctx, cam, st, t);
			// The rope down the tail.
			const ropeA = 1 - smooth(span(t, B.contour[0], B.contour[1]));
			if (t < B.contour[1] + 0.1)
				drawRope(ctx, cam, st, rope, ropeA * smooth(span(t, ...B.axis)), a0);
			// The spark at the midpiece.
			const spark =
				span(t, B.life - 0.05, B.life + 0.1) *
				(1 - 0.7 * smooth(span(t, B.life + 0.2, B.life + 1.2)));
			if (spark > 0 && t < B.life + 2)
				lit3(ctx, cam, body.at(shape, pose, (body.parts.mid[0] + body.parts.mid[1]) / 2), 2, spark);
		}
		// The reading frame.
		const fa =
			smooth(span(t, B.read[0] - 0.3, B.read[0] + 0.1)) *
			(1 - smooth(span(t, B.read[1] - 0.1, B.read[1] + 0.4)));
		if (fa > 0.004) drawFrame(ctx, cam, xf, fa, st);

		// ── The questions ──
		const asked = 1 - smooth(span(t, ...B.asked));
		if (asked > 0.004) entry.questions(ctx, w, h, t, hand, asked);
	}

	// ── Render ───────────────────────────────────────────────────────────────
	// The board is opaque to the swim, flow-strand's; from the swim to the
	// flash it is cleared to TRANSPARENT over the GPU's corridor (whose
	// ground is the board's, so the change is not seen); after the flash it
	// is opaque again and the fall has it: the core's ending.
	function render() {
		const { ctx, w, h } = board;
		const t = time.t;
		const hand = answers.hand(t);
		answers.slider(entry.hit);
		if (window.__lab) {
			window.__lab.t = t;
			window.__lab.decade = S?.decade;
		}
		hallDraw = null;
		if (t < FREEZE) {
			clearBoard(board, { chalkDust: false, shown: !lens });
			entry.reset();
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			tag(ctx, w, h, 'flow-strand-corridor');
			fuzz(lens, ctx, w, h, hand.secs);
			return;
		}
		if (live) remember(hand, t);
		const st = settled(w, h);
		const gpu = !!hall && t >= B.swim && t < B.hit + 0.08;
		clearBoard(board, { chalkDust: false, shown: !lens, ground: gpu ? null : PAL.ground });
		if (t < B.swim) world(ctx, w, h, t, hand, st);
		else corridor(ctx, w, h, t, st, gpu);
		// The captions at the terminal's size, and at least 15 px on a phone.
		const size = Math.max(captionSize(w, h), Math.min(15, 0.04 * Math.min(w, h)));
		caption(ctx, w, h, CAPTION.genetics, t, {
			at: B.genetics[0],
			until: B.genetics[1],
			align: 'center',
			size
		});
		// Down the corridor the status line has the floor's rooms going under
		// it: a soft patch of the board behind it, so it reads.
		if (gpu && t < B.conception[1]) {
			ctx.save();
			ctx.font = `400 ${size}px ${TECH_FONT}`;
			const full = ctx.measureText(`${CAPTION.conception}...`).width + 2 * size;
			ctx.globalAlpha =
				0.8 *
				smooth(span(t, B.conception[0], B.conception[0] + 0.3)) *
				(1 - smooth(span(t, B.conception[1] - CAPTION.fade, B.conception[1])));
			ctx.fillStyle = PAL.ground;
			ctx.shadowColor = PAL.ground;
			ctx.shadowBlur = 1.5 * size;
			ctx.fillRect(w / 2 - full / 2, Math.round(0.9 * h) - 1.15 * size, full, 1.55 * size);
			ctx.restore();
		}
		caption(ctx, w, h, CAPTION.conception, t, {
			at: B.conception[0],
			until: B.conception[1],
			align: 'center',
			size
		});
		flash(ctx, w, h, t - B.hit, { under: true });
		const out = smooth(span(t, ...B.out));
		if (out > 0.003) {
			ctx.save();
			ctx.globalAlpha = out;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
		// Over the GPU the board is clear, and the lab's own tag would show
		// through under this one: a patch of the board under the two, its
		// edge soft, so the corridor's lines fade into it rather than stop.
		if (gpu) {
			ctx.save();
			ctx.fillStyle = PAL.ground;
			ctx.shadowColor = PAL.ground;
			ctx.shadowBlur = 14;
			ctx.fillRect(6, h - 24, 222, 18);
			ctx.restore();
		}
		tag(ctx, w, h, 'flow-strand-corridor');
		fuzz(lens, ctx, w, h, hand.secs, { under: hallDraw });
	}

	// How far down the corridor the rooms are set into its walls: a front
	// from the far end toward the lens, easing out as it nears it, so that
	// the near plates — the big ones, beside the swimmer — come in over a
	// second rather than a frame (the hall fades a plate in over HALL.edge
	// of z behind the front). It only ever grows, so a room once in stays
	// in; at its end it is well past the lens.
	function reachAt(t, st) {
		if (t < B.rooms[0]) return -1e3;
		const u = span(t, ...B.rooms);
		return lerp(-HALL.edge - 0.5, st.C.D(B.rooms[1]) + 10, 1 - (1 - u) ** 3);
	}
	// The corridor under the board, from a board lens.
	function hallRender(cam, t, w, h, st) {
		const o = {
			w,
			h,
			pos: cam.lc,
			target: cam.tgtC,
			up: [0, 1, 0],
			fov: cam.fovV,
			offset: cam.offset,
			reach: reachAt(t, st),
			light: lightAt(t),
			turn: 0.011 * t,
			alpha: 1 - smooth(span(t, B.hit - 0.04, B.hit + 0.07))
		};
		// (drawn under the board by render's fuzz, after the board is done)
		hallDraw = () => hall.render(o);
	}

	// From the swim to the end: ONE place. To f0 the corridor's lens and the
	// last room drawn from it (drawEnd); from f0 the fall's lens and its own
	// drawing of that room — the same picture at f0 — and the corridor round
	// it from the fall's lens, to the flash.
	function corridor(ctx, w, h, t, st, gpu) {
		let cam;
		if (t < B.f0) {
			cam = lensAt(t, w, h, st);
			if (gpu) hallRender(cam, t, w, h, st);
			drawEnd(ctx, w, h, st, cam.lc, cam.k, cam.vp[0], cam.vp[1], smooth(span(t, ...B.end)));
		} else {
			const fc = st.fall.draw(ctx, w, h, t, { colourAlong: false, dust: null });
			cam = lensOfFall(fc, w, h, st.geo.F);
			if (gpu) hallRender(cam, t, w, h, st);
		}
		if (t > B.hit + 0.1) return; // the flash has it: the fall's room alone
		const sw = swimmerAt(t, st);
		beacon(ctx, w, h, cam, st, t);
		door(ctx, w, h, cam, st, t);
		const ink = makeInk();
		const pens = [];
		rays(ink, w, h, cam, st, t, pens);
		rings(ink, w, h, cam, st, t, sw.z, 'far');
		ink.flush(ctx);
		for (const [x, y, a] of pens) disc(ctx, x, y, 1.6, { fill: PAL.chalk, alpha: 0.5 + a });
		const layout = signLayout(ctx, w, h, cam, st, t);
		signs(ctx, w, h, cam, t, layout, sw.z, 'far');
		// The swimmer.
		const alpha = 1 - smooth(span(t, B.hit - 0.15, B.hit));
		if (alpha > 0.01) {
			const body = st.body;
			const shape = shapeAt(t, st);
			const pose = { at: sw.nose, dir: sw.dir, up: [0, 0, 1], scale: 1 };
			const life = smooth(span(t, B.life - 0.2, B.life + 0.6));
			ctx.save();
			ctx.globalAlpha = alpha;
			body.draw(ctx, cam, shape, pose, { back: 0.2 * (1 - life) });
			ctx.restore();
			// The spark at the midpiece (flow-strand's), dying away.
			const spark =
				span(t, B.life - 0.05, B.life + 0.1) *
				(1 - 0.7 * smooth(span(t, B.life + 0.2, B.life + 1.2)));
			if (spark > 0 && t < B.life + 2)
				lit3(ctx, cam, body.at(shape, pose, (body.parts.mid[0] + body.parts.mid[1]) / 2), 2, spark);
		}
		rings(ink, w, h, cam, st, t, sw.z, 'near');
		ink.flush(ctx);
		signs(ctx, w, h, cam, t, layout, sw.z, 'near');
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render,
		resize() {
			S = null;
			entry.resize();
		}
	};
}

// ── The calculation, as the corridor's signage ───────────────────────────────
// The birth's sign (the date less 266 days), the months' signs (the birth
// month's own days, then each whole month borrowed, what is left after it;
// the year marked where it turns), and the door's blocks: the landing (the
// last month's length less what is left is the day), Zeller's congruence
// worked (h = 0 Saturday), the room's rule, the conception date and its
// weekday. Sizes in plate units. `narrow`: Zeller's formula in two lines.
function calcOf(digits, decade, narrow = false) {
	const b = birthOf(digits);
	const c = conceive(b);
	const z = zeller(c.date);
	const yr = b.y;
	const birthLines = [
		{ text: fmt(b), size: 0.2, gold: true, alpha: 0.95 },
		{ text: `−  ${GESTATION} days`, size: 0.13, alpha: 0.8 }
	];
	const monthLines = c.rows.map((r, i) => {
		const lines = [];
		if (i > 0 && r.y !== c.rows[i - 1].y) lines.push({ text: String(r.y), size: 0.1, alpha: 0.6 });
		lines.push({
			text: `${MON[r.m - 1]}  ${String(r.take).padStart(2, ' ')}  →  ${String(r.rem).padStart(3, ' ')}`,
			size: 0.15
		});
		return lines;
	});
	const landLines = [
		{ text: `${MON[c.last.m - 1]}  ${c.last.len} − ${c.last.rem} = ${c.date.d}`, s: 0.078 },
		{ text: `= ${fmt(c.date)}`, s: 0.082, alpha: 0.85 }
	];
	const T = z.terms;
	const gap = narrow ? '   ' : '    ';
	const formula = narrow
		? [
				{ text: 'h = (q + ⌊13(m+1)/5⌋ + K', s: 0.064, math: true },
				{ text: '+ ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7', s: 0.064, math: true }
			]
		: [{ text: 'h = (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7', s: 0.064, math: true }];
	const zellerLines = [
		...formula,
		{
			text: `q = ${z.q}${gap}m = ${z.mm}${gap}K = ${z.K}${gap}J = ${z.J}${c.date.m < 3 ? `${gap}(${z.yy})` : ''}`,
			s: 0.058,
			alpha: 0.55,
			math: true
		},
		{ text: `= (${T.join(' + ')}) mod 7`, s: 0.064, math: true },
		{ text: `= ${z.sum} mod 7 = ${z.h}   →   ${z.day}`, s: 0.072, alpha: 0.85, math: true }
	];
	const rule =
		yr < 1960
			? `${yr} < 1960`
			: yr < 1980
				? `1960 ≤ ${yr} < 1980`
				: yr < 2005
					? `1980 ≤ ${yr} < 2005`
					: `2005 ≤ ${yr}`;
	// (?decade= forcing another room: no rule to show, just the room.)
	const ruled = decadeOfDate(digits) === decade;
	const ruleLines = [
		{ text: ruled ? rule : String(yr), s: 0.08, math: true },
		{ text: `⇒  ${decade}`, s: 0.11, alpha: 0.85, math: true }
	];
	const resultLines = [
		{ text: z.day, s: 0.1, alpha: 0.65 },
		{ text: fmt(c.date), s: 0.2, gold: true, alpha: 0.95 }
	];
	return {
		birth: b,
		rows: c.rows,
		last: c.last,
		date: c.date,
		zeller: z,
		weekday: z.day,
		birthLines,
		monthLines,
		landLines,
		zellerLines,
		ruleLines,
		resultLines
	};
}

// The door's blocks laid round the last room's frame (2φ × 2, at z = 0):
// over it the date (and its weekday), under it Zeller, left the landing,
// right the rule — or, on a narrow board, the landing over and the rule
// under too. The type is set so that at the landing (the lens d₀ off, its
// focal length F) its smallest is at least 11 px and its widest line within
// 0.92 of the board. Each line { x, y, s, text, … } in plate units.
function doorOf(ctx, calc, geo, w, h) {
	const narrow = h > w || w < 640;
	const pxu = geo.F / geo.d0;
	const all = [calc.landLines, calc.zellerLines, calc.ruleLines, calc.resultLines];
	let ds = Math.max(1, 11 / (0.058 * pxu));
	ctx.save();
	let widest = 0;
	for (const L of all)
		for (const ln of L) {
			ctx.font = ln.math ? `italic 400 100px ${MATH_FONT}` : `400 100px ${TECH_FONT}`;
			widest = Math.max(widest, (ctx.measureText(ln.text).width / 100) * ln.s * pxu);
		}
	ctx.restore();
	if (narrow) ds = Math.min(ds, (0.92 * w) / widest);
	ds = Math.max(0.6, ds);
	const lh = (ln) => 1.36 * ln.s * ds;
	// A stack of lines from y0, going up (dir 1) or down (−1), at x.
	const stack = (lines, x, y0, dir, align = 'center') => {
		const out = [];
		let y = y0;
		const seq = dir > 0 ? [...lines].reverse() : lines;
		for (const ln of seq) {
			y += (dir * lh(ln)) / 2;
			out.push({ ...ln, s: ln.s * ds, x, y, align });
			y += (dir * lh(ln)) / 2;
		}
		return dir > 0 ? out.reverse() : out;
	};
	const top = PLATE.H / 2 + 0.06 * ds;
	const bot = -PLATE.H / 2 - 0.06 * ds;
	const blocks = [];
	if (!narrow) {
		// The columns hung off the frame's sides, set back to it, and set
		// smaller if they would run off the board at the landing (the room
		// a little off the middle there, by the glass's offset).
		const xc = PLATE.W / 2 + 0.09 * ds;
		const room = (w / 2 - 10) / pxu - xc - Math.abs(geo.levels[0].glass.x);
		ctx.save();
		for (const L of [calc.landLines, calc.ruleLines]) {
			let W = 0;
			for (const ln of L) {
				ctx.font = ln.math ? `italic 400 100px ${MATH_FONT}` : `400 100px ${TECH_FONT}`;
				W = Math.max(W, (ctx.measureText(ln.text).width / 100) * ln.s * ds);
			}
			const k = Math.min(1, room / W);
			for (const ln of L) ln.s *= k;
		}
		ctx.restore();
		const mid = (lines) => lines.reduce((s, l) => s + lh(l), 0) / 2;
		blocks.push({
			beat: B.door,
			lines: stack(calc.landLines, -xc, mid(calc.landLines), -1, 'right')
		});
		blocks.push({ beat: B.zeller, lines: stack(calc.zellerLines, 0, bot, -1) });
		blocks.push({ beat: B.result, lines: stack(calc.resultLines, 0, top, 1) });
		blocks.push({
			beat: B.rule,
			lines: stack(calc.ruleLines, xc, mid(calc.ruleLines), -1, 'left')
		});
	} else {
		const land = stack(calc.landLines, 0, top, 1);
		const ytop = land[0].y + lh(calc.landLines[0]) / 2;
		blocks.push({ beat: B.door, lines: land });
		const zl = stack(calc.zellerLines, 0, bot, -1);
		blocks.push({ beat: B.zeller, lines: zl });
		blocks.push({ beat: B.result, lines: stack(calc.resultLines, 0, ytop + 0.04 * ds, 1) });
		const ybot = zl[zl.length - 1].y - lh(calc.zellerLines[calc.zellerLines.length - 1]) / 2;
		blocks.push({ beat: B.rule, lines: stack(calc.ruleLines, 0, ybot - 0.04 * ds, -1) });
	}
	return { blocks, ds, narrow };
}

// ── The ruler on the floor of the last stretch ───────────────────────────────
// The days left, from 266 at the birth's sign to 0 at the door: a tick a
// day, longer every week, a line across at each month's sign with what is
// left there painted large (drawn three times as long as it is wide, so the
// floor, seen at a slant, reads it), the birth's line gold, and the last
// month's days a number each. The canvas's top is the door (z = 0).
function rulerOf(calc, zB, zOfDay) {
	const W = 512;
	const width = 2 * WC * 0.96;
	const pu = W / width;
	const H = Math.max(64, Math.min(4096, Math.ceil(zB * pu)));
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const x = c.getContext('2d');
	const Y = (z) => (z / zB) * H;
	const X = (u) => W / 2 + u * pu;
	const marks = new Set(calc.rows.map((r) => r.rem));
	const lastRem = calc.rows.length ? calc.rows[calc.rows.length - 1].rem : GESTATION;
	x.lineCap = 'round';
	const number = (str, u, y, size, color, alpha, align = 'center') => {
		x.save();
		x.translate(X(u), y);
		x.scale(1, 3);
		x.globalAlpha = alpha;
		x.fillStyle = color;
		x.font = `400 ${size * pu}px ${TECH_FONT}`;
		x.textAlign = align;
		x.textBaseline = 'top';
		x.fillText(str, 0, 1);
		x.restore();
	};
	for (let d = 0; d <= GESTATION; d++) {
		const y = Y(zOfDay(d));
		const month = marks.has(d) || d === 0 || d === GESTATION;
		const week = d % 7 === 0;
		const half = month ? 2.25 : week ? 0.6 : 0.24;
		x.globalAlpha = month ? 0.85 : week ? 0.48 : 0.24;
		x.strokeStyle = d === GESTATION ? PAL.gold : PAL.chalk;
		x.lineWidth = month ? 5 : week ? 2.6 : 1.4;
		x.beginPath();
		x.moveTo(X(-half), y);
		x.lineTo(X(half), y);
		x.stroke();
		if (month) number(String(d), -1.3, y + 3, 0.2, d === GESTATION ? PAL.gold : PAL.chalk, 0.85);
		else if (d < lastRem) number(String(d), 1.0, y + 3, 0.14, PAL.chalk, 0.7);
	}
	return c;
}

// ── Which groups cannot be (epicycle's) ──────────────────────────────────────
const pad = (x, n) => String(x).padStart(n, '0');
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
	const maxDay = monthOk ? DAYS(Number(M), yearOk ? Number(Y) : 2000) : 31;
	return [
		D.length > 0 && !canBe(D, 1, maxDay, 2),
		M.length > 0 && !canBe(M, 1, 12, 2),
		Y.length > 0 && !canBe(Y, 1900, 2099, 4),
		false
	];
}

// ── The entry's text: the title fading, the two questions, the field and the
// slider — intro/epicycle.js's, as it lays them, without its figure (the kit
// draws them only round its own figure).
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
const MASK = 'dd.mm.yyyy';
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
const GROUP_OF = [0, 0, 1, 1, 2, 2, 2, 2];
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
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

// On a COMPACT board — a touch screen, a board taller than it is wide, or
// one under 560 px either way — the entry is laid out for a phone: the type
// at least 16 px (by min(w, h)), the strand wider and the block in the upper
// middle, so the keypad (the lower ~40% of an upright phone) never hides the
// date being typed, and the bottom ~80 px clear for the ENTER button; the
// slider's track a finger's length (0.68 w, to 300 px) and its band 45 px
// tall. If the keypad still covers the field (a phone held sideways), the
// block is lifted above it and the strand shrinks into the room left.
const STRAND_HALF = 0.075; // the strand's half-height on the board, of its length
function makeEntryText(board, answers, live) {
	let G = null;
	function geom(ctx, w, h, touch = 0) {
		if (G && G.w === w && G.h === h && G.touch === touch) return G;
		const L = TERM.layout(ctx, w, h);
		const compact = touch > 0 || h > w || Math.min(w, h) < 560;
		const tall = h >= w;
		const fq = compact ? Math.max(L.fs, Math.min(16, 0.042 * Math.min(w, h))) : Math.max(11, L.fs);
		ctx.save();
		ctx.font = TECHF(fq);
		const cell = ctx.measureText('0').width;
		const wQ1 = ctx.measureText(Q1_TEXT).width;
		const wQ2 = ctx.measureText(Q2_TEXT).width;
		ctx.restore();
		const cx = 0.5 * w;
		const yQ1 = compact ? (tall ? 0.4 : 0.5) * h : 0.72 * h;
		const yF = yQ1 + 1.75 * fq;
		const yQ2 = yF + 2.1 * fq;
		const ty = yQ2 + 1.6 * fq;
		const sp0 = Math.max(2.3 * cell, Math.min(0.065 * w, 30));
		const sp = compact ? Math.max(sp0, Math.min(0.68 * w, 300) / 9) : sp0;
		G = {
			w,
			h,
			touch,
			compact,
			L,
			fq,
			cell,
			cx,
			yQ1,
			xQ1: cx - wQ1 / 2,
			yF,
			xF: cx - 5 * cell,
			yQ2,
			xQ2: cx - wQ2 / 2,
			ty,
			sp,
			x1: cx - 4.5 * sp,
			x10: cx + 4.5 * sp,
			band: compact ? Math.max(22, 1.4 * fq) : 18,
			// The strand: across this much of the width, its middle here.
			frac: compact && tall ? 0.84 : 0.62,
			yS: compact ? (tall ? 0.28 : 0.26) * h : 0.37 * h
		};
		return G;
	}
	// How far the block is lifted this frame: the field being asked (the
	// date's, then the slider) kept above the keypad and the button over it.
	function liftOf(g, t, hand) {
		if (!g.compact) return 0;
		const bottom = t < Q2 ? g.yF + 0.5 * g.fq : g.ty + g.band;
		const limit = g.h - (hand.cover ?? 0) - (hand.touch ? 76 : 8);
		return Math.max(0, bottom - limit);
	}
	// The strand's framing for the entry lens: { frac, off } (off the height
	// of its middle above the board's).
	function frame(ctx, w, h, t, hand) {
		const g = geom(ctx, w, h, hand.touch ? 1 : 0);
		if (!g.compact) return { frac: 0.62, off: 0.13 * h };
		const lift = liftOf(g, t, hand);
		let frac = g.frac;
		let y = g.yS - lift;
		if (lift > 0) {
			const top = 30;
			const bot = g.yQ1 - lift - 1.3 * g.fq;
			frac = Math.min(frac, Math.max(0.25, (bot - top) / (2 * STRAND_HALF * w)));
			const half = STRAND_HALF * frac * w;
			y = Math.max(top + half, Math.min(y, bot - half));
		}
		return { frac, off: 0.5 * h - y };
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
	function text(ctx, str, x, y, size, alpha, color = PAL.chalk) {
		if (!str || alpha <= 0.004) return;
		ctx.save();
		ctx.font = TECHF(size);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
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
	// The title's lines fade top first, as many as the terminal laid (three,
	// or more re-wrapped on a narrow board), all gone by 6.4 s.
	function title(ctx, w, h, t) {
		if (t > B.gone + 1.1) return;
		const L = TERM.layout(ctx, w, h);
		const stop = L.stop;
		const img = frozenFrame(w, h);
		const n = L.out.length;
		const ys = L.out.map((ln) => ln.y - 0.3 * L.fs);
		const cut = [-1e4];
		for (let i = 1; i < n; i++) cut.push((ys[i - 1] + ys[i]) / 2);
		cut.push(1e4);
		const step = n > 1 ? Math.min(0.25, 0.5 / (n - 1)) : 0;
		for (let i = 0; i < n; i++) {
			const a = 1 - smooth(span(t, B.gone + step * i, B.gone + 0.5 + step * i));
			if (a <= 0.004) continue;
			ctx.save();
			ctx.beginPath();
			ctx.rect(-1, cut[i], w + 2, cut[i + 1] - cut[i]);
			if (i === n - 1) {
				ctx.moveTo(stop.x + stop.r + 1.5, stop.y);
				ctx.arc(stop.x, stop.y, stop.r + 1.5, 0, TAU);
			}
			ctx.clip('evenodd');
			ctx.globalAlpha = a;
			ctx.drawImage(img, 0, 0, w, h);
			ctx.restore();
		}
	}
	function field(ctx, g, t, hand, out) {
		const fa = out * smooth(span(t, ...B.field));
		if (fa <= 0.004) return;
		const typed = hand.typed;
		const bad = badGroups(typed);
		const after = lerp(1, 0.8, smooth(span(t, E1 + 0.3, E1 + 1)));
		const qDone = t >= Q1 + K1[K1.length - 1] || typed.length > 0;
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
	let SL = null;
	const valueAt = (X) => Math.max(1, Math.min(10, 1 + (9 * (X - SL.x1)) / (SL.x10 - SL.x1)));
	const onSlider = (X, Y) =>
		SL &&
		SL.a > 0.3 &&
		X >= SL.x1 - SL.sp / 2 &&
		X <= SL.x10 + SL.sp / 2 &&
		Math.abs(Y - SL.ty) <= SL.band;
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
	function setCursor(c) {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	}
	function slider(ctx, g, t, hand, out) {
		const sA = smooth(span(t, ...B.slider));
		SL = null;
		if (sA <= 0.004 || out <= 0.004) return;
		const { x1, x10, ty, sp, fq, cell } = g;
		const after = lerp(1, 0.7, smooth(span(t, E2 + 0.4, E2 + 1.2)));
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
		const hw = Math.max(g.compact ? 4 : 3, 0.34 * cell);
		const hh = (held ? 1.1 : 1) * fq;
		const ha = smooth(span(sA, 0.35, 0.8));
		ctx.save();
		ctx.globalAlpha = ha * a * (held ? 0.98 : 0.88);
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(hx - hw / 2, ty - hh / 2, hw, hh);
		ctx.restore();
		text(ctx, String(near), x10 + 0.9 * sp, ty + 0.36 * fq, fq, 0.92 * ha * a);
		SL = { x1, x10, ty, sp, a: out * sA, band: g.band };
	}
	return {
		hit,
		title,
		reset() {
			SL = null;
			if (live) setCursor('');
		},
		frame,
		questions(ctx, w, h, t, hand, out) {
			const g0 = geom(ctx, w, h, hand.touch ? 1 : 0);
			const lift = liftOf(g0, t, hand);
			const g =
				lift > 0
					? { ...g0, yQ1: g0.yQ1 - lift, yF: g0.yF - lift, yQ2: g0.yQ2 - lift, ty: g0.ty - lift }
					: g0;
			const q1a = out * lerp(1, 0.55, smooth(span(t, E1 + 0.3, E1 + 1)));
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.xQ1, g.yQ1, q1a);
			field(ctx, g, t, hand, out);
			const q2a = out * lerp(1, 0.55, smooth(span(t, E2 + 0.3, E2 + 1)));
			ask(ctx, g, Q2_TEXT, K2, Q2, t, g.xQ2, g.yQ2, q2a);
			slider(ctx, g, t, hand, out);
			if (live) {
				let cur = '';
				if (hand.asking === 'spice' && SL) {
					if (hand.held) cur = 'grabbing';
					else if (hover && onSlider(hover[0], hover[1])) cur = 'grab';
				}
				setCursor(cur);
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
