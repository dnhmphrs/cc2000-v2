// ── Flow: flow-strand-horn — the horn's own wall becomes the rooms ──────────
// flow-strand to the end of the compile, as it is: the terminal's card, the
// date typed by hand onto a double helix two base pairs a digit, the spice
// as its twist, COMPILING USER GENETICS (the strand read codon by codon into
// the head's, neck's and midpiece's rings, the strand become the axis, the
// rope down the tail), and the swimmer coming to life at 22.2 s. From there
// to the flash it is ONE scene, ONE object, ONE move of the lens.
//
// THE OBJECT. Draft's golden-angle cone, sown ahead of the swimmer rim to
// centre and deepened into a horn, is self-similar about its apex; so is the
// fall's nest of rooms (fall.js: each room hung in the last one's glass, the
// glasses on one line). Here they are the same thing: the nest is hung INSIDE
// the horn, every glass on the horn's axis, the horn's apex put where the
// nest converges (where its last room would hang a copy of itself), and the
// horn just wide enough that every room's frame is inscribed in its section
// (T = tan of the half-angle, 0.42 on a desktop: 23°). The horn's wall is
// draft's lattice of seeds (ρₙ = Rφ^(−n/k), θₙ = nα; the 8- and
// 13-parastichies), with a SECTION every 13 seeds counted from the first
// room's plane; the rooms are its deepest sections.
//
// THE MOVE. One lens: behind the swimmer, round onto the horn's axis, and
// down it toward the apex on ONE zoom — e-folds of its distance to the apex,
// gathered from rest as the swim starts (22.5 – 29 s) to one rate R (0.40
// e-folds a second on a desktop, set so the first room is at rest at 40 s and
// the last at the landing) and held there, no slowing for the workings, no
// gathering again, until it lands (51.1 – 53.6) as fall.js lands: the slide
// to the last plate's centre, the sway, the push in after the flash to near
// full size. The swimmer is scaled with the zoom, so the chase is the same
// picture all the way down; it keeps the rate through the landing (a little
// gathered, κ ≈ 1.2) so its nose meets the last glass at the flash.
//
// HOW THE HORN BECOMES THE ROOMS. Nothing is cut and nothing is swapped: the
// rooms are in the horn from the first frame of the chase, a speck at the
// apex, and what a room looks like is a function of how large it is on the
// board (fall.js's plate at rest = 1). Far off, a room's frame is the
// horn's section through it, a circle on the wall (the board draws it where
// the field's rings stop); it squares off into the frame as the room comes
// (0.012 → 0.06 of its size at rest); then the room's chalk takes shape OUT
// OF SEEDS (0.05 → 0.42): the plate's own golden-angle seeds appear round its
// glass as the wall's are drawn, and the room is drawn inside them, each
// seed's disc swelling, the golden ratio staggering them, until it is whole.
// The three sections in front of the first room square off too (ghost
// frames, part way), so the rings are seen to turn into frames before any
// room is near. Inside a room the horn is still there, in its glass, round
// the next room hung in it: the lens goes through glass after glass, the
// horn between, the same zoom.
//
// THE WORKINGS, on the object. One line a section as the rings pass in the
// chase: the birth date less 266 days, then the months borrowed back one a
// ring (FEB 14 → 252, JAN 31 → 221, 1986 DEC 31 → 190 …), each written on its
// ring as it opens past a quarter of the board, the ring lit gold while it is
// read, the lines from side to side (kept on the board as their ring opens
// past its edge). Then one block a room, on a card pinned to its wall above
// its monitor (in the monitor's plane, so it holds near the glass the lens
// is heading for; its type held once it is large enough to read, and the
// card kept on the board until the glass reaches it, so it is read for a
// second or more and never cut by the board's edge; on a phone set larger,
// the room there near the lens for less of the zoom): the month it lands in
// and the day (MAY
// 31 − 7 = 24, = 24 · 05 · 1986); Zeller's congruence over three rooms (h =
// (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7, its numbers, its sum and
// weekday); the room's rule (1980 ≤ 1987 < 2005 ⇒ 90s); on the last room's
// card the conception date in gold. EXACT: every date 1900–2099 checked
// against Date, leap years (29 · 02 · 2000 → 08 · 06 · 1999, a Tuesday).
//
// THE SUN. Over the apex, the point at infinity the whole horn leads to: the
// horn seen down its axis IS the log-polar lattice seen at its point at
// infinity, every spiral and every section running into it, and the light
// comes up there and spreads out over it — the chalk itself taking the
// warm spectrum where it has reached (the seeds by their angle, each spiral
// its own hue round the horn, the sections by depth: deep reds, oranges,
// golds, yellows, a rose, a breath of violet), from the apex at 26 s to the
// whole board by 50 — with a core of light (lit at 25.6 s) and 21 soft
// warm rays down the horn's own generators (red-orange to pale gold, a
// breath from 30 s, a dim glow through the rooms, swelling only in the last
// second and a half), seen through every glass, spilling over the rooms at
// the end, to white at 53.7,
// where the swimmer reaches the last screen and the board's white flash
// comes; the room's colour up under it; the sun left in the monitor as its
// light.
//
// GPU AND BOARD. The horn and the sun are ONE full-screen fragment field on
// the renderer (log/horn-world.js): the cone ray-traced per pixel (one
// quadratic, so the swing round behind the swimmer and onto the axis is the
// same picture), the seeds found by rounding in the 8/13 lattice, every
// line anti-aliased to its own width; the board is cleared to clear over it
// from 22.3 s. The board draws the rooms (fall.js's chalk plates and layers,
// painted deepest first), the sections' frames and the workings, and the
// swimmer (log/body.js, its skin painted solid over the field from its own
// depth buffer; drawn at its own size with the lens brought to it, since by
// the last rooms it is a ten-thousandth of the mouth, nearer the lens than
// the near plane). On a GPU the field is every pixel; on a software renderer
// (the headless lanes) a budget of 44 000 fragments (0.21 of each side at
// 1280 × 800), the lines kept to their width on the page, and the field built
// twice (the seeds' pop-in for the sowing, the rays after it), switched in JS
// — a software renderer runs an untaken branch anyway — so a frame there
// costs one refresh more than the board's: 50 ms against the core's 33 under
// the shared machine's load (it was 83 – 100) — and so does a flat colour
// in its place (?field=flat) or the field at 0.05: what is left is the
// price of a GL layer redrawn at all there, not the field's. ?fieldres=1
// every pixel, ?field=0 the board alone.
//
// Beats, in seconds (60; at = t / 60):
//    0    – 22.2  flow-strand's, unchanged (the card; the questions, 6.8 and
//                 11.6; COMPILING USER GENETICS 15.3 – 22.3; life 22.2)
//   22.5          the swim from rest; 22.6 – 25.2 the lens round behind it
//   23.3 – 26.6   draft's cone sown, rim to centre, its spirals written
//   25.6          the apex lit: the sun, a point
//   25.8 – 28.6   the cone drawn out into the horn; 26.4 – 29.2 the lens onto
//                 its axis; the zoom at its one rate from 29
//   29   – 29.8   the rooms, at the apex all along, drawn in (a speck)
//   29.2          14 · 02 · 1987 − 266 days, on the tenth section
//   30.1 – 36.9   the months back, one a section (FEB … JUN), ~0.85 s apart;
//                 the three nearest sections square off into frames
//   36   – 40     the first room squares off and is drawn out of seeds
//   40.0          the first room at rest: MAY 31 − 7 = 24 = 24 · 05 · 1986;
//                 through its glass at ~41
//   42.5          the second: Zeller's formula; 44.8 its numbers; 46.8 the
//                 sum and the weekday; 49.5 the room's rule
//   51.1 – 53.6   the landing on the answer's room; its card in gold
//                 (51.4 – 52.6); the swimmer on into the monitor
//   53.7          the swimmer at the glass: the white flash; the colour under
//                 it (53.62 – 54.1); 53.8 – 56.8 the push to near full size;
//                 held; 58.8 – 60 a fade; round
//
// Live in the lab (no ?at=, not ?demo=1): the run waits at each question.
// Pinned, ?demo=1, or in a reel: the scripted hand (14 · 02 · 1987, spice
// 7). ?decade= forces the room. Every frame a pure function of t and the
// hand; the caches are of inputs (when each digit came, the moment the
// spice was entered) and of constants (the frozen title, the zoom's table,
// the nest and its cards).

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
	norm
} from './log/board.js';
import { NEAR, makeDepth, lit3 } from './log/space.js';
import { glow } from './log/ink.js';
import { makeAnswers } from './log/answer.js';
import { script } from './log/entry.js';
import { makeTerminal } from './log-dawn.js';
import { EPICYCLE } from './intro/epicycle.js';
import { makeBody, specOf } from './log/body.js';
import { PHYLLO } from './log/phyllo.js';
import { caption, captionSize, CAPTION } from './log/caption.js';
import { grain } from './log/grain.js';
import { flash } from './log/flash.js';
import { makeFall, orderOf, FALL } from './log/fall.js';
import { DECADES, PLATE, loadRooms, decadeOfDate } from './log/rooms.js';
import { makeHornField, drawNest, ringCurve, VPERU } from './log/horn-world.js';

export const meta = {
	title:
		"strand · horn — the horn's own wall becomes the rooms: one zoom from the swimmer to the last screen"
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
	// ── The journey: one scene, one move of the lens, from here to the flash ──
	gpu: 22.3, // the board cleared over the horn's field from here on
	conception: [22.6, 33.6], // the caption
	swim: 22.5,
	behind: [22.6, 25.2], // the lens round behind the swimmer
	rim: [23.3, 24.1],
	seeds: [23.6, 25.9],
	sp8: [24.9, 26.2],
	sp13: [25.3, 26.6],
	apex: [25.6, 26.5], // the apex lit: the sun, a point
	deepen: [25.8, 28.6], // draft's cone drawn out into the horn
	rings: 26.0, // the horn's sections written in from the mouth, from here
	onAxis: [26.4, 29.2], // the lens down onto the horn's axis
	gather: [24.0, 29.0], // the zoom gathers to its ONE rate
	nest: [29.0, 29.8], // the rooms, hung at the apex all along, drawn in
	ghosts: [29.2, 31.0], // the sections before the first room square off
	rest0: 40.0, // the first room at rest: what sets the one rate
	ease: [51.1, 53.6], // the zoom lands
	land: [51.6, 53.6], // the slide to the last plate's centre
	colour: [53.62, 54.1], // the room's colour, come up under the flash
	hit: 53.7, // the swimmer at the last glass: the flash
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

// ── The horn ─────────────────────────────────────────────────────────────────
// Draft's cone (half-angle 38°, the seeds at ρₙ = Rφ^(−n/k)), its axis along
// −x from the mouth at X_MOUTH, deepened into a cone whose apex is the point
// the rooms' nest converges on and whose half-angle is just wide enough to
// hold every room's frame in its section (settled: T, LAM1, XA per board).
const HR = 70; // the mouth's radius
const X_MOUTH = -150; // the mouth, this far ahead of where the nose is built
const LAM0 = HR / Math.tan((38 * Math.PI) / 180); // draft's cone's depth
const V_SWIM = 28; // world units a second as it sets off
const ZETA_S = 140; // the swimmer shrinks with the horn below this distance
const NSEED = 520; // the spirals are written out to here, then run on
const LNPHI = Math.log(PHI);
// The sections squaring off in front of the first room (rings 1, 2, 3).
const GHOST = [0, 0.62, 0.38, 0.17];

// ── The swimmer, followed ────────────────────────────────────────────────────
// In the chase the lens is on the horn's axis D_C body units behind the nose
// (scaled with it, the body ~55 long), the swimmer heading in a little
// across the axis so it is seen a little side-on.
const D_C = 92;
const DIR_C = norm([-1, 0.2, 0.26]);
// The nose off the axis in the chase (body units): down and to the right on
// the board, ~0.03 h from the apex, heading at it.
const OFF = [0, -1.5, -2.2];
const FOV_CHASE = 52;
const FOV_END = FALL.fov; // the fall's own lens, by the time the rooms are near
const fovAt = (t) =>
	t > B.swim
		? lerp(lerp(30, FOV_CHASE, smooth(span(t, B.swim, 25.0))), FOV_END, smooth(span(t, 34, 41)))
		: 30;

// ── The board's shape ────────────────────────────────────────────────────────
// A fixed vertical field of view crops the sides of a board narrower than it
// is tall (a phone held upright): there the lens keeps a square's width of
// the scene instead, k (px a unit at unit depth) set by min(h, w / AMIN).
// The rooms are fall.js's, fitted to the board with its focal length h/2 /
// tan(17°), so on such a board the lens lengthens to it over the chase
// (34 – 41 s, as its field narrows): a zoom, the same about the apex as the
// rest of it.
const AMIN = 1;
const kOf = (fov, w, h) => Math.min(h, w / AMIN) / 2 / Math.tan((fov * Math.PI) / 360);
const kAt = (t, w, h) =>
	kOf(fovAt(t), w, h) * lerp(1, h / Math.min(h, w / AMIN), smooth(span(t, 34, 41)));
const fovOfK = (k, h) => (360 / Math.PI) * Math.atan(h / 2 / k);
// A compact board (a phone either way up, a small window): the type set
// larger to be read.
const compactOf = (w, h) => h > w || Math.min(w, h) < 600;

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-strand-horn · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const answers = makeAnswers({ live, beats: EPICYCLE.beats });
	const ans = answers.answers;
	const Z = makeDepth(4);
	// The horn and its sun on the GPU, under the board. Without a renderer
	// the board keeps its own ground and the rooms hang in the dark.
	// (?field=0 leaves it out, to see what the board alone costs; ?fieldres=
	// the scale it is drawn at, 1 every pixel — by default every pixel on a
	// GPU and 0.3 of each side on a software renderer.)
	const fieldRes = Number(q.get('fieldres')) || null;
	const field =
		renderer && THREE && q.get('field') !== '0'
			? makeHornField({
					THREE,
					renderer,
					flat: q.get('field') === 'flat',
					scale: fieldRes,
					own: location.pathname.startsWith('/lab')
				})
			: null;
	if (field) {
		// Both of the field's builds drawn once now, so neither is compiled
		// mid-run.
		field.set({ res: [board.w, board.h] });
		field.prime();
	}
	// The swimmer's skin, off its own depth buffer, painted as ground over
	// the field so the horn does not show through the body.
	const skinCanvas = document.createElement('canvas');
	let skinData = null;

	// ── What the answers settle (cached by the answers and the board) ────────
	// The nest is fall.js's, fitted to the board (its levels, its glasses on
	// one line, its last room pushed in on after the flash). Its APEX is the
	// point it converges on — where the last room would hang a copy of itself,
	// were it to go on — and the horn's apex is put there; the horn's
	// half-angle is the least that holds every frame inside its section. The
	// horn's world (x along the axis, the swimmer built at the origin) and the
	// nest's (fall.js's: x right, y up, z toward the lens) are one space,
	// nest = (z − A)μ along −x from the apex: μ is set by where the lens must
	// land (at the last plate, as fall.js lands it).
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
		const order = orderOf(decade);
		const calc = calcOf(ans.date, decade);
		const fb = {
			fall: [B.rest0, B.land[1]],
			land: B.land,
			colour: B.colour,
			push: B.push,
			swim: [-2, -1]
		};
		// The last room ends near full size: the lens pushed in on it after the
		// flash, to 0.94 of the board's height (an upright board crops its
		// sides rather than leave it small).
		const fill = { h: 0.94, w: h > w ? 1.75 : 0.985 };
		const fall = makeFall({ art, order, beats: fb, zeta0: 0, fill });
		const g = fall.geometry(w, h);
		const lv = g.levels;
		const L = g.L;
		const last = lv[L];
		const ax = lv[0].glass.x;
		const ay = lv[0].glass.y;
		// The apex: the last room's crossing, were it to repeat (makeNest's
		// own rule), its fixed point.
		const G = last.glass;
		const Dg = g.d0 - G.z;
		const fh = FALL.fit * Math.min(G.h, G.w / PHI);
		const kap = (FALL.margin * g.d0 * fh) / (PLATE.H * Dg);
		const gap = (kap * Dg) / (1 - kap);
		const Xn = (fh * (Dg + gap)) / (PLATE.H * Dg);
		const An = last.O[2] + (last.s * (G.z - gap)) / (1 - Xn);
		// The horn: every frame's corners inside its section.
		let T = 0;
		for (const l of lv) {
			const uu = l.O[2] - An;
			for (const [cx, cy] of [
				[-1, -1],
				[1, -1],
				[1, 1],
				[-1, 1]
			]) {
				const x = l.O[0] + (l.s * cx * PLATE.W) / 2 - ax;
				const y = l.O[1] + (l.s * cy * PLATE.H) / 2 - ay;
				T = Math.max(T, Math.hypot(x, y) / uu);
			}
		}
		T *= 1.02;
		const LAM1 = HR / T;
		const XA = X_MOUTH - LAM1;
		const Z0 = -XA;
		// THE ONE RATE. From the first room at rest to the last, the nest's
		// e-folds, flown at one rate R, landing over B.ease; before that the
		// same rate, gathered to from the swim's start from rest.
		const u0 = lv[0].O[2] - An;
		const restL = last.O[2] + last.s * g.d0 - An;
		const Ne = Math.log((u0 + g.d0) / restL);
		const R = Ne / (B.ease[0] - B.rest0 + (B.ease[1] - B.ease[0]) / 2);
		const r0 = V_SWIM / Z0;
		const rate = (t) =>
			smooth(span(t, B.swim, B.swim + 1.5)) *
			lerp(r0, R, smooth(span(t, ...B.gather))) *
			(1 - smooth(span(t, ...B.ease)));
		const DT = 0.01;
		const N = Math.ceil((B.ease[1] + 0.2 - B.swim) / DT);
		const E = new Float64Array(N + 1);
		for (let i = 1; i <= N; i++) {
			const ta = B.swim + (i - 1) * DT;
			E[i] = E[i - 1] + 0.5 * DT * (rate(ta) + rate(ta + DT));
		}
		const efolds = (t) => {
			if (t <= B.swim) return 0;
			const f = (t - B.swim) / DT;
			const i = Math.min(N - 1, Math.floor(f));
			return lerp(E[i], E[i + 1], Math.min(1, f - i));
		};
		const gZ = (z) => 1 / Math.pow(1 + Math.pow(ZETA_S / z, 4), 0.25);
		const scaleOf = (zN) => gZ(zN) / gZ(Z0);
		// The lens's distance to the apex on the axis, D_C body lengths behind
		// the nose: horn units.
		const zLOf = (e) => {
			const zN = Z0 * Math.exp(-e);
			return zN + D_C * scaleOf(zN);
		};
		const mu = zLOf(efolds(B.ease[1] + 0.1)) / restL;
		// The swimmer keeps the one rate through the landing, gathering a
		// little (κ) so its nose meets the last glass at the flash.
		const uGL = last.O[2] + last.s * G.z - An;
		const Ee = efolds(B.ease[0]);
		const dT = B.hit - B.ease[0];
		const Ehit = Math.log(Z0 / (uGL * mu));
		const kappa = 2 * ((Ehit - Ee) / (R * dT) - 1) + 1;
		const swimE = (t) =>
			t <= B.ease[0]
				? efolds(t)
				: Ee + R * (t - B.ease[0] + (kappa - 1) * eased(t - B.ease[0], dT));
		// The horn's sections: ring j a 13 seeds out from the first room's
		// (its plane's section, ring 0), u its distance to the apex.
		const ringU = (j) => u0 * Math.exp((13 * j * LNPHI) / PHYLLO.k);
		const v0 = VPERU * Math.log((T * u0 * mu) / HR);
		S = {
			key,
			bases,
			spec,
			body,
			decade,
			calc,
			fall,
			g,
			L,
			ax,
			ay,
			An,
			T,
			LAM1,
			XA,
			Z0,
			R,
			kappa,
			mu,
			efolds,
			swimE,
			scaleOf,
			zLOf,
			u0,
			restL,
			ringU,
			v0,
			fill,
			labels: labelsOf(calc, h > w || w < 700),
			cards: null
		};
		return S;
	}
	settled(board.w, board.h);

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: ans,
		get decade() {
			return S?.decade;
		},
		// The field's scale (1 every pixel; less on a software renderer).
		field: field ? { software: field.software, res: field.res } : null,
		get horn() {
			if (!S) return null;
			const { T, LAM1, R, kappa, mu, An, u0, restL, v0 } = S;
			return { T, LAM1, R, kappa, mu, An, u0, restL, v0 };
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

	// ── The lens ─────────────────────────────────────────────────────────────
	// Where the nose is, its scale, its heading, on the swimmer's clock (the
	// zoom's own until the landing; then its own, on into the last glass).
	function swimAt(t, st) {
		const E = st.swimE(t);
		const zN = st.Z0 * Math.exp(-E);
		const s = st.scaleOf(zN);
		const turn = smooth(span(t, ...B.onAxis));
		const dir = norm([lerp(-1, DIR_C[0], turn), DIR_C[1] * turn, DIR_C[2] * turn]);
		// The lens rides the axis; the nose, once the lens is on it, a little
		// below and right of it (OFF, scaled with the body), so the apex —
		// the sun — shows just ahead of it.
		const axis = [st.XA + zN, 0, 0];
		const nose = add3(axis, mul3(OFF, s * turn));
		return { E, zN, s, axis, nose, dir };
	}
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
	// The nest's coordinates to the horn's: the apex A on the axis, the
	// glasses' line (ax, ay) the axis, nest z toward the lens = horn +x.
	const toHorn = (st, [x, y, z]) => [
		st.XA + (z - st.An) * st.mu,
		(y - st.ay) * st.mu,
		-(x - st.ax) * st.mu
	];
	// A lens looking straight down the axis (−x), up +y, right −z, its
	// vanishing point at (ox, oy): what the lens is from the moment it is on
	// the axis to the end.
	function axialCam(pos, k, ox, oy) {
		const project = (p) => {
			const z = pos[0] - p[0];
			return [ox - (k * (p[2] - pos[2])) / z, oy - (k * (p[1] - pos[1])) / z, z];
		};
		return { pos, f: [-1, 0, 0], r: [0, 0, -1], u: [0, 1, 0], k, ox, oy, project };
	}
	function lensAt(t, w, h, st, fr) {
		const k = kAt(t, w, h);
		if (t >= B.onAxis[1]) {
			// ON THE AXIS, to the end: the lens's distance to the apex off the
			// one zoom; at the last plate it lands as fall.js lands it — the
			// slide to the plate's centre, the push in on it after the flash,
			// the sway (the screen shifted so the plane d₀ ahead holds still).
			const g = st.g;
			const last = g.levels[st.L];
			const zL = st.zLOf(st.efolds(t)) / st.mu;
			let z = st.An + zL;
			const sc = (last.s * zL) / st.restL; // fall.js's cam.s: the lens's scale
			const land = smooth(span(t, ...B.land));
			let x = st.ax - last.s * last.glass.x * land;
			let y = st.ay - last.s * last.glass.y * land;
			const p = smooth(span(t, ...B.push));
			if (p > 0) {
				const want = Math.min(st.fill.h * h, (st.fill.w * w) / PHI);
				const kk = lerp(1, Math.max(1, want / g.plate), p);
				const zP = last.O[2];
				z = zP + (z - zP) / kk;
			}
			const A = lerp(
				lerp(0, 0.05, span(t, B.rest0 - 2, B.rest0)),
				0.3,
				smooth(span(t, B.land[0], B.land[1] + 0.5))
			);
			const ex = A * Math.sin(1.1 * t - 0.4);
			const ey = A * 0.45 * Math.sin(1.7 * t + 0.6);
			x += sc * ex;
			y += sc * ey;
			const ox = w / 2 + (k * ex) / g.d0;
			const oy = h / 2 - (k * ey) / g.d0;
			const cam = axialCam(toHorn(st, [x, y, z]), k, ox, oy);
			cam.nest = { x, y, z, s: sc, k, ox, oy };
			cam.fov = fovOfK(k, h);
			return cam;
		}
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
		if (t > B.swim) {
			// Round behind it, above and aside; then down onto the axis.
			const sw = swimAt(t, st);
			const s = sw.s;
			const k1 = smooth(span(t, ...B.behind));
			const k2 = smooth(span(t, ...B.onAxis));
			const pB = [L + 34, 15, 24];
			const pC = [D_C, 0, 0];
			const rel = lerp3(lerp3(posF, pB, k1), pC, k2);
			const relT = lerp3(tgtF, [-70, -4, 0], k1);
			pos = add3(sw.axis, mul3(rel, s));
			const tA = add3(sw.axis, mul3(relT, s));
			tgt = lerp3(tA, [st.XA, 0, 0], k2);
		}
		const fov = fovOfK(k, h);
		const cam = camera3({ pos, target: tgt, up: [0, 1, 0], fov, w, h });
		cam.fov = fov;
		cam.k = k;
		cam.ox = w / 2;
		cam.oy = h / 2;
		cam.tgt = tgt;
		return cam;
	}
	const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
	// The lens as the swimmer sees it at its own size: the world about `c`
	// scaled up by 1/s (the lens's position too), so the picture is the same
	// and the depths are the body's own.
	function scaledLens(cam, c, s) {
		const pos = add3(c, mul3(sub3(cam.pos, c), 1 / s));
		const { f, r, u, k, ox, oy } = cam;
		const project = (p) => {
			const d = sub3(p, pos);
			const z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
			const x = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
			const y = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
			return [ox + (k * x) / z, oy - (k * y) / z, z];
		};
		return { ...cam, pos, project };
	}
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

	// ── The horn's field: its uniforms off the lens ──────────────────────────
	// The cone as it is at t (draft's 38° drawn out into the horn over
	// B.deepen, the mouth held), the lattice sown and written as the core
	// draws it, the sections written in from the mouth, and the sun.
	const sunAt = (t) => {
		if (t < B.apex[0]) return 0;
		const up =
			0.2 * smooth(span(t, ...B.apex)) +
			0.22 * smooth(span(t, 28, 46)) +
			0.42 * smooth(span(t, 44, 52.6)) +
			1.9 * Math.pow(smooth(span(t, 52.4, B.hit + 0.02)), 3);
		return lerp(up, 0.3, smooth(span(t, B.hit, B.hit + 0.8)));
	};
	function hornAt(t, w, h, cam, st) {
		const kd = smooth(span(t, ...B.deepen));
		const Lam = lerp(LAM0, st.LAM1, kd);
		const T = HR / Lam;
		const apex = [X_MOUTH - Lam, 0, 0];
		const dt = (B.seeds[1] - B.seeds[0]) / PHYLLO.n;
		const zL = Math.max(1e-9, cam.pos[0] - apex[0]);
		const vL = VPERU * Math.log((T * zL) / HR);
		const sun = sunAt(t);
		const ap = cam.project(apex);
		const m = Math.min(w, h);
		const coreR =
			lerp(3.5, 0.04 * m, smooth(span(t, 26, 50))) +
			0.9 *
				m *
				Math.pow(smooth(span(t, 53.0, B.hit + 0.02)), 2.5) *
				(1 - smooth(span(t, B.hit, B.hit + 0.7)));
		return {
			res: [w, h],
			o: sub3(cam.pos, apex),
			f: cam.f,
			r: cam.r,
			up: cam.u,
			k: cam.k,
			pp: [cam.ox, cam.oy],
			tb: T,
			len: Lam,
			hr: HR,
			sown: (t - B.seeds[0]) / dt,
			sownW: 0.3 / dt,
			pop: t < B.seeds[1] + 0.7 ? 1 : 0,
			rim: smooth(span(t, ...B.rim)),
			v8: NSEED * smooth(span(t, ...B.sp8)) + 1e5 * smooth(span(t, B.sp8[1], B.sp8[1] + 2)),
			v13: NSEED * smooth(span(t, ...B.sp13)) + 1e5 * smooth(span(t, B.sp13[1], B.sp13[1] + 2)),
			ringV0: st.v0,
			ringFrom: t < B.ghosts[0] ? 1 : 4,
			ringIn: t > B.rings ? 130 * (t - B.rings) : -10,
			wall: 1 - smooth(span(t, B.hit, B.hit + 1.4)),
			sun,
			// The light on the lattice, from the apex out: seed indices ahead of
			// the lens (≈ 110 is a ring 10 px across, 60 one 120 px, 28 one 300
			// px, under 12 the whole board), spreading as the conception nears.
			reach:
				vL +
				lerp(
					lerp(lerp(190, 105, smooth(span(t, 26, 31))), 58, smooth(span(t, 31, 39))),
					8,
					smooth(span(t, 39, 50))
				),
			apex: [ap[0], ap[1]],
			coreR,
			turn: 0.05 * t,
			// The sunburst: a breath at first, a soft warm glow through the
			// rooms, swelling only into the flash, gone soon after it.
			rays:
				(0.05 * smooth(span(t, 30, 40)) +
					0.3 * smooth(span(t, 44, 52)) +
					0.75 * Math.pow(smooth(span(t, 52.2, B.hit)), 2)) *
				(1 - smooth(span(t, B.hit, B.hit + 0.8))),
			white:
				Math.pow(smooth(span(t, 53.45, B.hit + 0.02)), 2) *
				(1 - smooth(span(t, B.hit + 0.05, B.hit + 0.6)))
		};
	}

	// The swimmer's skin: the cells its depth buffer covers, in ground.
	function skin(ctx) {
		if (!Z.on || !Z.buf) return;
		const W = Z.W;
		const H = Z.H;
		if (skinCanvas.width !== W || skinCanvas.height !== H) {
			skinCanvas.width = W;
			skinCanvas.height = H;
			skinData = null;
		}
		const sx = skinCanvas.getContext('2d');
		if (!skinData) {
			skinData = sx.createImageData(W, H);
			const d = skinData.data;
			for (let i = 0; i < W * H; i++) {
				d[4 * i] = 21;
				d[4 * i + 1] = 21;
				d[4 * i + 2] = 21;
			}
		}
		const d = skinData.data;
		let any = false;
		for (let i = 0; i < W * H; i++) {
			const on = Z.buf[i] < Infinity;
			d[4 * i + 3] = on ? 255 : 0;
			any = any || on;
		}
		if (!any) return;
		sx.putImageData(skinData, 0, 0);
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.globalAlpha = 0.95;
		ctx.drawImage(skinCanvas, 0, 0, W * Z.s, H * Z.s);
		ctx.restore();
	}

	// ── The sections in front of the first room, and the months on them ──────
	// Ring j (13 seeds a ring, j = 1 the nearest the first room) is the cone's
	// section at u_j from the apex; rings 1–3 square off toward the first
	// room's frame (GHOST), the rest are the field's own. Each passing ring
	// carries one line of the workings — the birth date less 266 days, then
	// the months back, one a ring — written on as the ring opens past a fifth
	// of the board, read, and let go of as it passes out past the edge.
	function rings(ctx, w, h, t, cam, st) {
		const nc = cam.nest;
		if (!nc) return;
		const lv0 = st.g.levels[0];
		const proj = (x, y, z) => {
			const d = nc.z - z;
			return [nc.ox + (nc.k * (x - nc.x)) / d, nc.oy - (nc.k * (y - nc.y)) / d, d];
		};
		// The first room's frame about the axis (nest units, s = 1).
		const fx0 = lv0.O[0] - PLATE.W / 2 - st.ax;
		const fx1 = lv0.O[0] + PLATE.W / 2 - st.ax;
		const fy0 = lv0.O[1] - PLATE.H / 2 - st.ay;
		const fy1 = lv0.O[1] + PLATE.H / 2 - st.ay;
		const ghostIn = smooth(span(t, ...B.ghosts));
		const unit = Math.min(w, h) / 2;
		const compact = compactOf(w, h);
		const maxJ = Math.max(3, st.labels.length);
		for (let j = 1; j <= maxJ; j++) {
			const uj = st.ringU(j);
			const z = st.An + uj;
			const c = proj(st.ax, st.ay, z);
			if (c[2] <= 0.02 * uj) continue;
			const R = (nc.k * st.T * uj) / c[2];
			if (R > 1.6 * Math.hypot(w, h)) continue;
			const sc = uj / st.u0;
			const m = j <= 3 ? GHOST[j] * ghostIn : 0;
			const rect = [
				c[0] + (nc.k * fx0 * sc) / c[2],
				c[1] - (nc.k * fy1 * sc) / c[2],
				c[0] + (nc.k * fx1 * sc) / c[2],
				c[1] - (nc.k * fy0 * sc) / c[2]
			];
			const L = st.labels[j - 1];
			const rr = R / unit;
			const la = L ? smooth(span(rr, 0.24, 0.36)) * (1 - smooth(span(rr, 0.95, 1.3))) : 0;
			const pts = j <= 3 || la > 0.01 ? ringCurve(c[0], c[1], R, rect, m, 96) : null;
			if (j <= 3 && R > 1.5)
				stroke(ctx, pts, {
					color: PAL.chalk,
					width: lerp(0.9, 1.4, m),
					alpha: lerp(0.34, 0.62, m)
				});
			if (!L || la <= 0.01) continue;
			// The ring being read, lit gold.
			stroke(ctx, pts, { color: PAL.gold, width: 1.1, alpha: 0.4 * la });
			// Where on the ring: its angle (math, y up) and the curve's radius there.
			const th = L.th;
			const cs = Math.cos(th);
			const sn = Math.sin(th);
			const tx = cs > 1e-9 ? (rect[2] - c[0]) / cs : cs < -1e-9 ? (rect[0] - c[0]) / cs : Infinity;
			const ty = sn > 1e-9 ? (c[1] - rect[1]) / sn : sn < -1e-9 ? (c[1] - rect[3]) / sn : Infinity;
			const rad = lerp(R, Math.min(tx, ty), m);
			const font = Math.max(compact ? 14 : 13, Math.min(28, 0.1 * R));
			const align = compact ? 'center' : cs > 0.3 ? 'left' : cs < -0.3 ? 'right' : 'center';
			const write = smooth(span(rr, 0.24, 0.44));
			// Out from the ring: above it when it is up, below when down.
			const dy = sn >= 0 ? -1 : 1;
			const lines = L.lines;
			const lh = 1.3 * font;
			// Kept on the board as its ring opens past the edge (it fades as it
			// goes): the block's widest line measured, its place clamped.
			let tw = 0;
			ctx.save();
			for (const ln of lines) {
				ctx.font = `400 ${font * (ln.size ?? 1)}px ${TECH_FONT}`;
				tw = Math.max(tw, ctx.measureText(ln.text).width);
			}
			ctx.restore();
			const pad = 10;
			const [xLo, xHi] =
				align === 'left'
					? [pad, w - pad - tw]
					: align === 'right'
						? [pad + tw, w - pad]
						: [pad + tw / 2, w - pad - tw / 2];
			const ox = clamp(c[0] + cs * (rad + 0.5 * font), xLo, Math.max(xLo, xHi));
			const oy = c[1] - sn * (rad + 0.5 * font);
			const y0 = clamp(
				dy < 0 ? oy - (lines.length - 1) * lh : oy + 0.4 * font,
				pad + 0.6 * font,
				Math.max(pad + 0.6 * font, h - pad - 0.6 * font - (lines.length - 1) * lh)
			);
			drawLines(ctx, lines, ox, y0, font, lh, la, write, align);
			disc(ctx, c[0] + cs * rad, c[1] - sn * rad, 1.8, { fill: PAL.gold, alpha: 0.8 * la });
		}
	}
	// Lines of the workings from (x, y) down, `font` px, written on to
	// `write` of their characters.
	function drawLines(ctx, lines, x, y, font, lh, a, write, align = 'center') {
		const total = lines.reduce((s, l) => s + l.text.length, 0);
		let budget = Math.floor(write * total + 1e-6);
		ctx.save();
		ctx.textBaseline = 'middle';
		ctx.textAlign = align;
		for (let i = 0; i < lines.length; i++) {
			if (budget <= 0) break;
			const ln = lines[i];
			const str = ln.text.slice(0, budget);
			budget -= ln.text.length;
			const fs = font * (ln.size ?? 1);
			ctx.font = ln.math ? `italic 400 ${fs}px ${MATH_FONT}` : `400 ${fs}px ${TECH_FONT}`;
			ctx.globalAlpha = a * (ln.alpha ?? 0.66);
			ctx.fillStyle = ln.gold ? PAL.gold : PAL.chalk;
			ctx.fillText(str, x, y + i * lh);
		}
		ctx.restore();
	}

	// ── The workings on the rooms ────────────────────────────────────────────
	// One block a room, on a card pinned to its wall just above its monitor
	// (in the monitor's plane): the landing date, Zeller's congruence over
	// three rooms, the room's rule; on the last room's, the conception date in
	// gold. Laid out once in the plate's units, set large enough to be read on
	// the board it is on (on a phone, a room is read nearer, larger).
	const DX = { '50s': 0.55, '60s': 0.55, '90s': 0.45, '10s': 0 };
	function cardsOf(ctx, st, w, h) {
		if (st.cards) return st.cards;
		const g = st.g;
		const per = g.plate / PLATE.H; // px a plate unit, the room at rest
		const measure = (font) => (str) => {
			ctx.save();
			ctx.font = font;
			const W = ctx.measureText(str).width / 100;
			ctx.restore();
			return W;
		};
		const wTech = measure(`400 100px ${TECH_FONT}`);
		const wMath = measure(`italic 400 100px ${MATH_FONT}`);
		st.cards = g.levels.map((lv, i) => {
			const lines = st.calc.cards[i] ?? [];
			const gl = lv.glass;
			const goldCard = i === st.L;
			// (On a phone the room passes nearer full width: its card set
			// larger, to be read while the room is still coming.)
			const big = compactOf(w, h);
			const f = goldCard
				? Math.max(0.1, (big ? 19 : 15) / per)
				: Math.max(0.072, (big ? 13 : 9.5) / per);
			let W = 0;
			for (const l of lines) W = Math.max(W, (l.math ? wMath : wTech)(l.text) * f * (l.size ?? 1));
			const pad = 0.6 * f;
			const cw = W + 2 * pad;
			const ch = lines.length * 1.32 * f + 1.4 * pad;
			// (On a compact board straight above the glass: the room is read
			// close, and only the middle of it is on the board.)
			let cx = gl.x + (compactOf(w, h) ? 0 : (DX[lv.decade] ?? 0));
			let cy = gl.y + gl.h / 2 + 0.16 + ch / 2;
			const hw = (PLATE.W * ((g.d0 - gl.z) / g.d0)) / 2;
			const hh = (PLATE.H * ((g.d0 - gl.z) / g.d0)) / 2;
			cx = clamp(cx, -hw + cw / 2 + 0.06, hw - cw / 2 - 0.06);
			cy = Math.min(cy, hh - ch / 2 - 0.06);
			return { lines, f, cx, cy, cw, ch, z: gl.z, gold: goldCard };
		});
		return st.cards;
	}
	function card(ctx, i, plane, st, t, A = 1) {
		const c = st.cards?.[i];
		if (!c || !c.lines.length) return;
		const P = plane(c.z);
		if (!P) return;
		const fpx0 = c.f * P.m;
		if (fpx0 < 2.5) return;
		const { w, h } = board;
		const compact = compactOf(w, h);
		// Its type held at a size to be read (and the card never wider than
		// the board), its place kept on the board, so it is read for longer
		// than the zoom alone would let it be — until the glass, which it
		// then stands over, comes to it, or it would have grown past half
		// as large again.
		const pad = 8;
		const cw0 = c.cw * P.m;
		const ch0 = c.ch * P.m;
		const capF = c.gold ? Infinity : compact ? 20 : 24;
		const fit = Math.min(1, (w - 2 * pad) / cw0, capF / fpx0);
		const fpx = fpx0 * fit;
		const cw = cw0 * fit;
		const ch = ch0 * fit;
		const mx = clamp(P.e + P.m * c.cx, pad + cw / 2, w - pad - cw / 2);
		const my = clamp(P.f - P.m * c.cy, pad + ch / 2, Math.max(pad + ch / 2, h - pad - ch / 2));
		const [x0, y0] = [mx - cw / 2, my - ch / 2];
		// How much of it the glass would have (the glass is in its plane).
		const gl = st.g.levels[i].glass;
		const gx0 = Math.max(x0, P.e + P.m * (gl.x - gl.w / 2));
		const gx1 = Math.min(x0 + cw, P.e + P.m * (gl.x + gl.w / 2));
		const gy0 = Math.max(y0, P.f - P.m * (gl.y + gl.h / 2));
		const gy1 = Math.min(y0 + ch, P.f - P.m * (gl.y - gl.h / 2));
		const over = gx1 > gx0 && gy1 > gy0 ? ((gx1 - gx0) * (gy1 - gy0)) / (cw * ch) : 0;
		const gone = 1 - smooth(span(t, B.hit - 0.05, B.hit + 0.25));
		const a =
			smooth(span(fpx0, 3, 6)) *
			(1 - smooth(span(1 / fit, 1.3, 1.7))) *
			(1 - smooth(span(over, 0, 0.12))) *
			gone *
			A;
		if (a <= 0.004) return;
		// (On a phone a room is near the lens for less of the zoom: the card
		// written on at smaller type.)
		const write = c.gold
			? smooth(span(t, 51.4, 52.6))
			: compact
				? smooth(span(fpx0, 4.5, 9))
				: smooth(span(fpx0, 6.5, 12.5));
		ctx.save();
		ctx.globalAlpha = 0.93 * a;
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(x0, y0, cw, ch);
		ctx.restore();
		stroke(
			ctx,
			[
				[x0, y0],
				[x0 + cw, y0],
				[x0 + cw, y0 + ch],
				[x0, y0 + ch],
				[x0, y0]
			],
			{ color: c.gold ? PAL.gold : PAL.chalk, width: 1, alpha: 0.5 * a }
		);
		disc(ctx, x0 + cw / 2, y0 + 0.2 * fpx, Math.max(1, 0.14 * fpx), {
			fill: PAL.rose,
			alpha: 0.8 * a
		});
		const lh = 1.32 * fpx;
		const top = y0 + 0.7 * 0.6 * fpx + 0.66 * fpx + 0.1 * fpx;
		drawLines(ctx, c.lines, x0 + cw / 2, top, fpx, lh, a, write, 'center');
	}

	// A room's state from its frame's height on the board, against its height
	// at rest: far off, the horn's section (morph 0, a circle), squaring into
	// its frame as it comes; then the room drawn out of seeds (dev 0 → 1).
	function stateOf(st) {
		const plate = st.g.plate;
		return (k, hPx) => {
			const q = hPx / plate;
			return { morph: smooth(span(q, 0.012, 0.06)), dev: smooth(span(q, 0.05, 0.42)) };
		};
	}

	// ── Render ───────────────────────────────────────────────────────────────
	function render() {
		const { ctx, w, h } = board;
		const t = time.t;
		const hand = answers.hand(t);
		answers.slider(entry.hit);
		if (window.__lab) {
			window.__lab.t = t;
			window.__lab.decade = S?.decade;
		}
		if (t < FREEZE) {
			clearBoard(board, { chalkDust: false });
			entry.reset();
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			grain(ctx, w, h, t);
			tag(ctx, w, h, 'flow-strand-horn');
			return;
		}
		if (live) remember(hand, t);
		const st = settled(w, h);
		const gpu = !!field && t >= B.gpu;
		if (gpu) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = 'source-over';
			ctx.clearRect(0, 0, board.canvas.width, board.canvas.height);
			ctx.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
		} else clearBoard(board, { chalkDust: false });
		world(ctx, w, h, t, hand, st, gpu);
		// The captions at the terminal's size, and at least 15 px on a phone.
		const size = Math.max(captionSize(w, h), Math.min(15, 0.04 * Math.min(w, h)));
		caption(ctx, w, h, CAPTION.genetics, t, {
			at: B.genetics[0],
			until: B.genetics[1],
			align: 'center',
			size
		});
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
		grain(ctx, w, h, t);
		tag(ctx, w, h, 'flow-strand-horn');
	}

	// From the stop's glide to the end: one world. From the swim on it is the
	// horn's — the field under the board, the rooms hung in it, the lens and
	// the swimmer one move down it.
	function world(ctx, w, h, t, hand, st, gpu) {
		const cam = lensAt(t, w, h, st, t < B.back[1] ? entry.frame(ctx, w, h, t, hand) : undefined);
		const body = st.body;
		const L = body.length;
		if (gpu) {
			field.set(hornAt(t, w, h, cam, st));
			field.render();
		}

		// The title fading and the stop gliding to the strand's 5′ end.
		const five = cam.project([0, 0, 0]);
		entry.title(ctx, w, h, t);
		const pan = easeIO(span(t, ...B.pan));
		const stop = TERM.layout(ctx, w, h).stop;

		const sw = t > B.swim ? swimAt(t, st) : null;
		const shape = shapeAt(t, st);
		// The swimmer is drawn at its own size, the lens brought to it in
		// proportion (the same picture): a body a ten-thousandth of the horn's
		// mouth would otherwise be nearer the lens than the near plane.
		const pose = sw
			? { at: sw.nose, dir: sw.dir, up: [0, 0, 1], scale: 1 }
			: { at: [0, 0, 0], dir: [-1, 0, 0], up: [0, 0, 1], scale: 1 };
		const bcam = sw ? scaledLens(cam, sw.nose, sw.s) : cam;
		Z.reset(w, h);
		const swimA = 1 - smooth(span(t, B.hit - 0.15, B.hit));
		if (t > B.rim[0] && swimA > 0.01) body.fillDepth(Z, bcam, shape, pose);
		else Z.off();

		// ── The rooms, hung in the horn ──
		if (cam.nest && t >= B.nest[0]) {
			cardsOf(ctx, st, w, h);
			const colour = span(t, ...B.colour);
			const nestA = smooth(span(t, ...B.nest));
			drawNest(ctx, w, h, art, st.g, cam.nest, {
				alpha: nestA,
				state: stateOf(st),
				axis: [st.ax, st.ay],
				T: st.T,
				apexZ: st.An,
				paint: (k, depth) => {
					if (k !== st.L) return 0;
					const from = depth * 0.55;
					return smooth(span(colour, from, from + 0.45));
				},
				wall: (c, i, plane, a) => card(c, i, plane, st, t, a)
			});
			rings(ctx, w, h, t, cam, st);
		}

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
		if (t >= 15 && swimA > 0.01) {
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
			// Over the field, the body is solid: its skin in ground.
			if (gpu && t > B.swim) skin(ctx);
			body.draw(ctx, bcam, shape, pose, {
				rings: count / NRg,
				gens,
				contour: smooth(span(t, ...B.contour)),
				axis: 0.55 * close * (1 - smooth(span(t, ...B.contour))),
				back: 0.2 * (1 - life),
				alpha: swimA,
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
				lit3(
					ctx,
					bcam,
					body.at(shape, pose, (body.parts.mid[0] + body.parts.mid[1]) / 2),
					2,
					spark
				);
		}
		// The reading frame.
		const fa =
			smooth(span(t, B.read[0] - 0.3, B.read[0] + 0.1)) *
			(1 - smooth(span(t, B.read[1] - 0.1, B.read[1] + 0.4)));
		if (fa > 0.004) drawFrame(ctx, cam, xf, fa, st);

		// ── The sun's light, over the rooms ──
		// What the rooms hide of the sun still spills over them as it nears:
		// a bloom at the apex, on the board.
		if (gpu && t > 40) {
			const sun = sunAt(t);
			const ap = cam.project([st.XA, 0, 0]);
			const bl = smooth(span(sun, 0.45, 1.8));
			if (bl > 0.004 && ap[2] > 0)
				glow(ctx, ap[0], ap[1], (0.25 + 0.6 * bl) * Math.min(w, h), [255, 206, 140], 0.45 * bl);
		}

		// ── The questions ──
		const asked = 1 - smooth(span(t, ...B.asked));
		if (asked > 0.004) entry.questions(ctx, w, h, t, hand, asked);
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

// ── The calculation, laid out ────────────────────────────────────────────────
// On the horn's sections, one a ring, the first read first: the birth date
// less 266 days, then each month borrowed back (the birth month's own days,
// then each whole month's length, the year marked where it turns). On the
// rooms, one block a room: the month it lands in and the day; Zeller's
// congruence — its formula, its numbers, its sum and weekday; the room's
// rule; on the last room's card the conception date in gold.
function calcOf(digits, decade) {
	const b = birthOf(digits);
	const c = conceive(b);
	const z = zeller(c.date);
	const yr = b.y;
	const birth = [
		{ text: fmt(b), size: 1.15, alpha: 0.72 },
		{ text: `−  ${GESTATION} days`, size: 0.92 }
	];
	const months = c.rows.map((r, i) => {
		const year = i > 0 && r.y !== c.rows[i - 1].y ? String(r.y) : null;
		const line = {
			text: `${MON[r.m - 1]}  ${String(r.take).padStart(2, ' ')}  →  ${String(r.rem).padStart(3, ' ')}`,
			alpha: 0.82
		};
		return year ? [{ text: year, size: 0.66, alpha: 0.5 }, line] : [line];
	});
	const T = z.terms;
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
	const cards = [
		[
			{ text: `${MON[c.last.m - 1]}  ${c.last.len} − ${c.last.rem} = ${c.date.d}` },
			{ text: `= ${fmt(c.date)}`, size: 1.12, alpha: 0.74 }
		],
		[
			{ text: 'h = (q + ⌊13(m+1)/5⌋ + K', math: true },
			{ text: '+ ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7', math: true }
		],
		[
			{
				text: `q = ${z.q}   m = ${z.mm}   K = ${z.K}   J = ${z.J}${c.date.m < 3 ? `   (${z.yy})` : ''}`,
				math: true,
				size: 0.86,
				alpha: 0.54
			},
			{ text: `= (${T.slice(0, 3).join(' + ')}`, math: true },
			{ text: `+ ${T.slice(3).join(' + ')}) mod 7`, math: true }
		],
		[
			{ text: `= ${z.sum} mod 7 = ${z.h}`, math: true },
			{ text: `→  ${z.day}`, size: 1.1, alpha: 0.74 }
		],
		[
			{ text: ruled ? rule : String(yr), math: true },
			{ text: `⇒  ${decade}`, size: 1.15, alpha: 0.74, math: true }
		],
		[
			{ text: z.day, size: 0.62, alpha: 0.7, gold: true },
			{ text: fmt(c.date), size: 1.0, alpha: 0.92, gold: true }
		]
	];
	return { birth: b, birthLines: birth, months, cards, date: c.date, weekday: z.day };
}

// Consecutive lines on opposite sides of the horn (two are up at once),
// none low on the right, where the swimmer's tail is.
const SIDES = [140, 35, 200, 62, 160, 22, 215, 80, 128, 45, 188, 30];
// Which ring carries which line, and where round it: ring 1 is the nearest
// the first room, so the last read; the birth date on the ring past the
// months. On a desktop the lines go from side to side of the horn; on a
// narrow board up the middle, over the swimmer.
function labelsOf(calc, narrow) {
	const n = calc.months.length;
	const out = new Array(n + 1);
	const order = [calc.birthLines, ...calc.months]; // read first → last
	order.forEach((lines, i) => {
		const deg = narrow ? 90 + 26 * Math.sin(i * 2.4) : SIDES[i % SIDES.length];
		out[n - i] = { lines, th: (deg * Math.PI) / 180 };
	});
	return out;
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
