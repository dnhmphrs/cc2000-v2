// ── Flow: flow-strand-sketch-three — one beat: bad at maths, down the decades ─
// flow-strand-sketch (strand's journey drawn in the anime hand — Eva, Akira —
// every line a little off true and drawn AGAIN twelve times a second, on
// twos, so the lines boil; log/sketch-hand.js), its two halves bound into ONE
// rising movement from the swimmer coming alive (22.2 s) to the conception.
// The old run peaked in the middle (the count ran out, the tunnel flattened
// into the white-hot band, the date went on it, the swimmer dived through —
// and then the fall through the rooms started again from the bottom); here
// there is no middle: one camera, one zoom, one space, the rooms coming
// faster and faster, and the band and the date only at the very end.
//
// THE REASON the journey passes other decades first: the hand is BAD AT
// MATHS. It has to take 266 days off the birthday, and it tries to do it in
// years: 266 ÷ 7 = 38 (the 38 weeks of a pregnancy, taken for years), 266 ÷
// 12 = 22, 266 ÷ 24 = 11, 266 ÷ 52 = 5, 266 ÷ 100 = 3 — the calendar's
// numbers, every one the wrong one — and every other time it goes the wrong
// way (1987 − 38 = 1949, 1987 + 22 = 2009, 1987 − 11 = 1976 …): a needle
// swinging either side of you and settling. Each wrong year is a DECADE, and
// the lens is falling through that decade's room as it is worked out: the
// rooms are the hand's guesses (the room the lens flies into is the room of
// the sum it is on), each year struck through in red as the next sum comes,
// its divisor ringed — the mistake. Then it gives up on shortcuts and COUNTS:
// DAY BY DAY, the 266 days themselves flying out of the vanishing point past
// the lens, each struck in red as it is used (the reference's red-struck
// letters), slow at first, a blizzard at the zoom's peak, the months crossed
// off as they go (FEB 14, JAN 31, DEC 31 with 1986 over it …) — through your
// own room, again and again, each glass the same room deeper. The count
// slows as the lens comes to rest INSIDE the last room, its last five days a
// drumroll — 5, 4, 3 … 2 …… 1, each big round the middle, struck — and as
// the 1 flies out past the lens the last screen switches on, a white line that stretches out across the board into
// THE WHITE-HOT BAND (the reference's frame, moved to the end), sprays of
// dots and streaks off its edges; the last month's working over it (MAY 31 −
// 7 = 24) and THE CONCEPTION DATE lettered on it in dark ink, ONCE, ringed in
// red; the swimmer swims into it — the holy light (log/lens.js `light`:
// the screen's shafts, the sunburst, the white bloom, held, burnt back to the
// chalk room) and the colour carried out of the screen in a ring of warm
// light, as sketch A built it.
//
// ONE CAMERA. The tunnel's own 3D lens rides the whole journey — no switch
// to the fall's lens, no band in the middle: the rooms are log/fall.js's
// nest of chalk plates drawn through the hand at ζ(t), read off ONE zoom Z(t)
// (e-folds of the lens's distance to the vanishing point: from rest at the
// swim, at the tunnel's 0.52 a second by 30 s, gathering to a peak at 46.6 s,
// landing at rest at 52.4), so the hand-drawn rings of the tunnel go on round
// every room at the rooms' own rate, and the first room is the glint at the
// end of the tunnel. The tunnel's world is renormalised by e^Z about its apex
// (the projection is the same; the numbers stay of a size), so the zoom can
// go on for twenty e-folds. The rooms' count is fitted to the zoom's budget
// for each answer (the 2010s' room is half an e-fold deep, the 1990s' 1.3),
// and the peak re-solved to land exactly INSIDE the last room — so every
// birthday rises at the same pace. Each room's decade is the guess the hand
// is on as that room comes into sight in the glass before it (ROOM_OF: the
// decade's own art when the rooms have it — 1950s … 2020s as the lead adds
// them — else the site's rule), then the answer's room for the count.
//
// EXACT under the play: the count is 266 figures, one a day; each month
// crossed off at its last day; the date checked against Date for every
// birthday 1900–2099 (leap years: 29 · 02 · 2000 → 08 · 06 · 1999; 01 · 03
// · 1900, no 29th February, → 08 · 06 · 1899). The wrong sums are honest
// sums: 266 ÷ d rounded, the year ± it.
//
// Beats, in seconds (60; at = t / 60):
//    0    – 22.3  strand's, unchanged (the title, the strand, the compile)
//   22.2          life; 22.2 – 23.6 the hand comes into the lines
//   22.5          the swim from rest; 22.6 – 25.2 the lens round behind it;
//                 25.6 – 28.4 onto the axis; the zoom at 0.52 e-folds a
//                 second from 30, gathering to the peak (46.6), landing
//   23.1 – 26.2   the rings sketched in; 24.2 – 27.2 the speed lines;
//                 24 – 26 the glint — the first room, a speck in it
//   27.2 – 28.9   the slam: the birth date − 266 DAYS
//   28.9 – 40.6   THE SUMS: five wrong years, a room each (the rooms follow
//                 the guess), struck; the first room fills the board ~32
//   40.6 – 50.9   DAY BY DAY: the count, 266 → 1, the months crossed off,
//                 through the answer's room again and again; the blizzard
//                 at the zoom's peak; 49.1 – 50.9 the drumroll, 5 … 1
//   50.4 – 52.4   the rings let go; the lens slows to rest inside the last
//                 room; 51.1 – 51.8 its screen switched on
//   51.6 – 52.4   the white line stretched into the band across the board
//   52.2 – 53.4   the working, the date on the band, ringed
//   52.2 – 54.0   the swimmer on into it
//   54.0          the conception: the white blooms out of the screen
//   55.3 – 57.9   the colour carried out of the screen in a ring of light;
//                 the beams breathing, settling; 58.8 – 60 a fade; round
//
// GPU AND BOARD, as sketch A left them: through the lens (log/lens.js) the
// board is a texture; the hand's many lines are drawn on the GPU
// (log/gpu-ink.js), one instanced draw a layer — the tunnel's RINGS under
// the board (it is clear where they show), the SPEED LINES, the DEBRIS and
// every lettered FIGURE (the sums, the count, the months, their red strikes
// and rings, the band's flecks and sprays, the working) over it. On the
// board's canvas: the title and the strand, the swimmer, the rooms (chalk
// plates through the hand), the band's white and glow, the date on it, the
// captions, the fade. Without a renderer (or ?lens=0, ?gpuink=0) it is all
// the board's.
//
// Live in the lab (no ?at=, not ?demo=1): the run waits at each question.
// Pinned, ?demo=1, or in a reel: the scripted hand (14 · 02 · 1987, spice
// 7). ?decade= forces the answer's room. Every frame a pure function of t and
// the hand (the boil's drawing is ⌊12 t⌋); the caches are of inputs (when
// each digit came, the moment the spice was entered) and of constants (the
// frozen title, the zoom's table, the rooms' order, the count's times).

import {
	getBoard,
	clearBoard,
	clock,
	tag,
	camera3,
	PAL,
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
import { caption, captionSize, CAPTION } from './log/caption.js';
import { grain } from './log/grain.js';
import { makeLens } from './log/lens.js';
import { makeGpuInk } from './log/gpu-ink.js';
import { flash as burnOut } from './log/flash.js';
import { makeFall, revealRing } from './log/fall.js';
import { DECADES, loadRooms, decadeOfDate, PLATE } from './log/rooms.js';
import {
	HAND,
	boilOf,
	makeHand,
	makeInk,
	strike,
	circleMark,
	speedLines,
	rand,
	noise1
} from './log/sketch-hand.js';
import { letter, measure } from './log/sketch-three-type.js';

// A harness's layer timer (window.__prof: begin / mark(name) / end), a no-op
// without one: ?prof is not a switch, a profiling script defines it.
const prof = (n) => window.__prof?.mark(n);

export const meta = {
	title:
		'strand · sketch — the journey drawn in a shaky, warm hand: speed lines, a white-hot band, the days crossed out'
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
	// ── the journey (this variant's) ──
	conception: [22.6, 29.6], // the caption
	boil: [22.2, 23.6], // the hand comes into the lines
	swim: 22.5,
	behind: [22.6, 25.2], // the lens round behind the swimmer
	onAxis: [25.6, 28.4], // the lens down onto the tunnel's axis
	tunnel: [23.1, 26.2], // the rings sketched in, near to far
	lines: [24.2, 27.2], // the speed lines come
	glint: [24.0, 26.0], // the light at the end of it
	premise: [27.2, 28.75], // the slam: the birth date − 266 DAYS
	speck: [26.4, 28.6], // the first room sketched in, a speck in the glint
	first: 31.0, // … 0.34 of the board tall (the fall's ζ₀)
	tries: [28.95, 31.75, 34.3, 36.6, 38.7], // the wrong sums pop (TRY)
	count: [40.6, 50.9], // DAY BY DAY: 266 → 0, struck one by one
	land: [50.4, 52.4], // the rings let go; the lens slows to rest inside the last room
	rest: 52.4,
	screen: [51.1, 51.8], // the last screen switched on: a white line across its glass
	band: [51.6, 52.4], // … stretched out across the board, the white-hot band
	conceived: [52.25, 53.4], // the date lettered on it (and ringed from +0.6)
	colour: [53.92, 54.4], // the colour flooded under the flash (no lens)
	reveal: [55.3, 57.9], // the colour carried out of the screen by the light (lightAt)
	aim: [52.2, 54.0], // the swimmer on into the band
	hit: 54.0, // the conception
	out: [58.8, 60]
};

// THE FLASH WITHOUT THE LENS (no renderer, ?lens=0): the band in the last
// screen blowing out — across the board's width in 0.06 s, then its height
// by 0.13 s — then strand's white (log/flash.js), held a moment and burning
// out to the room in its colours (B.colour). `s` the seconds since the hit,
// `box` the last glass on the board. (With the lens: lightAt.)
function flash(ctx, w, h, s, box) {
	if (s < 0) return;
	if (s >= 0.13 || !box) return burnOut(ctx, w, h, s);
	ctx.save();
	ctx.fillStyle = 'rgb(255, 252, 245)';
	{
		const ex = smooth(span(s, 0, 0.06));
		const ey = smooth(span(s, 0.035, 0.13));
		const cy = (box[1] + box[3]) / 2;
		const hb = Math.max(2, (box[3] - box[1]) / 2);
		const x0 = lerp(box[0], 0, ex);
		const x1 = lerp(box[2], w, ex);
		const y0 = lerp(cy - hb, 0, ey);
		const y1 = lerp(cy + hb, h, ey);
		glow(ctx, (x0 + x1) / 2, cy, Math.max(x1 - x0, y1 - y0), [255, 236, 200], 0.6);
		ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
	}
	ctx.restore();
}

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
// Out with an overshoot: a slam's pop.
const backOut = (x) => {
	const k = clamp01(x) - 1;
	return 1 + 2.70158 * k * k * k + 1.70158 * k * k;
};

// ── The date's arithmetic, exact ─────────────────────────────────────────────
// 266 days (38 weeks) from conception to birth. Checked in a scratch script
// against Date for every day 1900–2099: the date and the weekday agree.
export const GESTATION = 266;
const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const DAYS = (m, y) => [31, LEAP(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
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

// ── The tunnel ───────────────────────────────────────────────────────────────
// A cone of hand-drawn rings along −x, its apex X_APEX ahead of where the
// nose is built: the zoom's fixed point and the vanishing point. Ring i is at
// distance Z_NOSE0·e^(−0.3 i) from the apex, of radius k times that (a cone
// of 15°), so the lens zooming at a steady rate passes the same picture
// again and again; the rings shown are those from 0.985 of the lens's own
// distance to the apex down to 0.014 of it.
const X_APEX = -430; // the apex: the zoom's fixed point
const Z_NOSE0 = -X_APEX; // the nose's distance to it as the swim starts
const V_SWIM = 28; // world units a second as it sets off
const ZETA_S = 140; // the swimmer shrinks with the zoom below this distance
const TUN = { k: 0.27, step: 0.3, umin: 0.014, M: 56, wob: 0.05 };
// THE ZOOM (e-folds of the nose's distance to the apex — and so of the lens's,
// riding behind it — from the swim): from
// rest, gathering to the tunnel's rate RC by 30 s (strand's: the rate its
// fall opened at), then on up to a PEAK rate reached at ZOOM.peak[1] — solved
// for each answer so the lens lands exactly at rest INSIDE the last room at
// B.rest — easing to rest over ZOOM.land. The rooms (log/fall.js's nest) are
// read off it: the fall's ζ₀ (the first plate ZETA0, 0.34 of the board tall)
// at B.first. NOMINAL the peak the rooms' count is chosen for.
const ZOOM = { rc: 0.52, peak: [30.0, 46.6], land: [48.2, B.rest], nominal: 1.1, dt: 0.01 };
const ZETA0 = -0.5704517366603811; // the first plate 0.34 h tall, as strand's fall opened
// A room comes into sight (and takes the decade of the sum the hand is on)
// when its plate, in the glass before it, is this much of a plate tall.
const APPEAR = 0.5;
const INSIDE = 0.4; // the fall stops inside the last room (?inside=: this far into its glass)
const FILL = { w: 3.1, h: 1.15 }; // … where the room is this many boards wide, and at least this tall

// ── The sums ─────────────────────────────────────────────────────────────────
// The hand's shortcuts: 266 days in years, by the wrong divisor (days in a
// week, months in a year, hours in a day, weeks in a year, a hundred), each
// rounded, taken off the birth year — or, every other one, added to it.
const TRY = [7, 12, 24, 52, 100];
// The room of a year: its decade's own art if there is one (DECADES, as the
// lead adds the eight, 1950s–2020s), else the site's rule (before 1960 the
// 50s, before 1980 the 60s, before 2005 the 90s, then the 10s).
export function roomOfYear(y) {
	const key = `${String(Math.floor(y / 10) * 10).slice(-2)}s`;
	if (y >= 1950 && y < 2030 && DECADES.includes(key)) return key;
	return decadeOfDate(`0101${String(clamp(y, 0, 9999)).padStart(4, '0')}`);
}

// ── The count ────────────────────────────────────────────────────────────────
// The 266 days struck one at a time over B.count: the rate (in figures a
// second) climbs from ~1.6 to ~65 and comes down again for the last few, its
// log a smoothstep bump; T[j] is the second the j-th day is struck (the
// figure 267 − j), lead[j] how long before it the figure leaves the
// vanishing point, v[j] how fast it flies (e-folds a second), both from the
// pace there: the slow ones linger to be read.
const COUNT = (() => {
	const [t0, t1] = B.count;
	const N = 4000;
	const lr0 = Math.log(2.4);
	const lr1 = Math.log(95);
	const bump = (u) => smooth(span(u, 0, 0.27)) * (1 - smooth(span(u, 0.72, 0.95)));
	const rate = (u) => Math.exp(lerp(lr0, lr1, bump(u)));
	const cum = [0];
	for (let i = 1; i <= N; i++) cum[i] = cum[i - 1] + (0.5 * (rate((i - 1) / N) + rate(i / N))) / N;
	const scale = GESTATION / cum[N];
	const T = new Float64Array(GESTATION + 2);
	const lead = new Float64Array(GESTATION + 2);
	const v = new Float64Array(GESTATION + 2);
	let i = 0;
	for (let j = 1; j <= GESTATION; j++) {
		const want = j / scale;
		while (i < N - 1 && cum[i + 1] < want) i++;
		const f = clamp01((want - cum[i]) / (cum[i + 1] - cum[i] || 1));
		const u = (i + f) / N;
		T[j] = t0 + u * (t1 - t0);
		const p = clamp01((Math.log(rate(u)) - lr0) / (lr1 - lr0));
		lead[j] = lerp(0.62, 0.26, p);
		v[j] = lerp(2.1, 4.6, p);
	}
	T[GESTATION + 1] = t1 + 1;
	return { T, lead, v };
})();

// ── The swimmer, followed ────────────────────────────────────────────────────
// In the chase the lens is on the tunnel's axis D_C body units behind the
// nose (scaled with it, the body ~55 long), the swimmer heading in a little
// across the axis so it is seen a little side-on; the same picture, unscaled,
// is drawn over the fall.
const D_C = 92;
const DIR_C = norm([-1, 0.2, 0.26]);
// The nose off the axis in the chase (body units): down and to the right on
// the board, ~0.03 h from the vanishing point, heading at it.
const OFF = [0, -1.5, -2.2];
const FOV_CHASE = 52;
const FOV_END = 40;
// (narrowed to FOV_END by 30 s, while the first room is a speck: after it the
// rings and the rooms zoom together, and a field narrowing would zoom the
// rings past the rooms)
const fovAt = (t) =>
	t > B.swim
		? lerp(lerp(30, FOV_CHASE, smooth(span(t, B.swim, 25.0))), FOV_END, smooth(span(t, 26.6, 30.0)))
		: 30;

// ── The board's shape ────────────────────────────────────────────────────────
// A fixed vertical field of view crops the sides of a board narrower than it
// is tall (a phone held upright): there the lens keeps a square's width of
// the scene instead, k (px a unit at unit depth) set by min(h, w / AMIN) and
// the vertical field widened to match. A board as wide as it is tall or wider
// is the lens as it was.
const AMIN = 1;
const qOf = (w, h) => Math.min(1, w / (AMIN * h));
const kOf = (fov, w, h) => Math.min(h, w / AMIN) / 2 / Math.tan((fov * Math.PI) / 360);
const fovOf = (fov, w, h, s = qOf(w, h)) =>
	s >= 1 ? fov : (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) / s);
// The figures' scale: the board's height, or on a narrow board 1.25 its
// width; the spread of their flight across the board (wider than tall).
const figH = (w, h) => Math.min(h, 1.25 * w);
const spreadX = (w, h) => clamp(w / h, 0.75, 1.5);

export default async function make({ THREE, at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live =
		at === null && q.get('demo') !== '1' && /^\/(lab|next)(\/|$)/.test(location.pathname);
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-strand-sketch-three · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const answers = makeAnswers({ live, beats: EPICYCLE.beats });
	const ans = answers.answers;
	const Z = makeDepth(4);
	// The hand: the board's context, boiling (log/sketch-hand.js).
	const pen = makeHand(board.ctx);
	// The lens: the board drawn on the GPU through a soft warm lens
	// (log/lens.js); none without a renderer (?lens=0 neither), and then the
	// board is shown as it is with the canvas grain over it.
	const lens = q.get('lens') === '0' ? null : await makeLens({ THREE, board });
	// With the lens, the hand's many lines go to the GPU (log/gpu-ink.js): the
	// rings UNDER the board (the board clear where they show, its alpha
	// hiding them under the rooms), the speed lines, the debris and every
	// lettered figure OVER it — each layer one instanced draw. Without it,
	// the board's canvas strokes them all, as before. (?gpuink=0: the canvas.)
	const gpuInk = lens && q.get('gpuink') !== '0';
	const gUnder = gpuInk ? makeGpuInk({ THREE }) : null;
	const gOver = gpuInk ? makeGpuInk({ THREE }) : null;
	const inkFor = (g) => (g ? g.ink() : makeInk());
	// The board is clear (not the ground) while the rings show under it.
	const ringsShow = (t) => gUnder && t > B.tunnel[0] - 0.15 && t < B.land[0] + 0.7;
	// The fall comes to rest INSIDE the last room (log/fall.js `inside`: this
	// far on into its glass), the room past the board's edges, before the
	// light. (?inside= fixes how far, 0.05 at the least: the one zoom has no
	// landing at the plate.)
	const inside = q.has('inside') ? clamp(Number(q.get('inside')) || 0, 0.05, 0.9) : INSIDE;
	// ?date=DDMMYYYY (not live): the journey's sums, rooms, count and date for
	// another birthday — to look at — the entry still typing the demo's.
	const dateQ = !live && /^\d{8}$/.test(q.get('date') ?? '') ? q.get('date') : null;
	// ?look=halo:0.2,grain:0 — the lens's numbers (log/lens.js LENS), to try.
	const look = Object.fromEntries(
		(q.get('look') ?? '')
			.split(',')
			.map((kv) => kv.split(':'))
			.filter(([k, v]) => k && v !== undefined && Number.isFinite(Number(v)))
			.map(([k, v]) => [k, Number(v)])
	);

	// ── What the answers settle (cached by the answers and the board) ────────
	let S = null;
	function settled(w, h) {
		const key = `${ans.date}|${ans.spice}|${w}|${h}|${forced}|${dateQ}`;
		if (S && S.key === key) return S;
		const ms0 = performance.now();
		const bases = basesOf(ans.date);
		const spec0 = specOf(ans);
		const probe = makeBody(spec0);
		const spec = specOf(ans, { section: codonSection(bases, probe.stations) });
		const body = makeBody(spec);
		const calc = calcOf(dateQ ?? ans.date);
		// The answer's room: the birth year's, as the site has it (?decade=
		// forces another).
		const decade = forced ?? roomOfYear(calc.birth.y);
		// The fall's own clock is not used — its ζ is read off the one zoom
		// (geo.zetaAt, below) — but its sway and its lit glass are: from the
		// landing only (beats.fall far off), so the rooms' vanishing point is
		// the tunnel's until the rings have let go.
		const fb = { fall: [1e6, 1e6 + 1], land: B.land, colour: B.colour, swim: [-2, -1] };
		const nestOf = (order, ins) =>
			makeFall({ art, order, beats: fb, zeta0: ZETA0, inside: ins }).geometry(w, h);
		// Inside: how far into the last room's glass the lens stops — so the
		// room is FILL.w times the board's width (the monitor at the middle,
		// the lamp and the tower either side, the frame far past the edges)
		// and at least FILL.h times its height (no ground above or below it):
		// an upright phone goes deeper than a laptop. (?inside= fixes it.) It
		// is the last room's own shape: any nest ending in it.
		let deep = inside;
		if (!q.has('inside')) {
			const pg = nestOf([decade, decade], 0.5);
			const lv = pg.levels[pg.L];
			const cover = (d) => {
				const dist = pg.pose(pg.L + d).z - lv.O[2];
				const k = (pg.F * lv.s) / dist;
				return Math.min((PLATE.W * k) / w / FILL.w, (PLATE.H * k) / h / FILL.h);
			};
			let lo = 0.05;
			let hi = 0.85;
			for (let i = 0; i < 30; i++) {
				const mid = (lo + hi) / 2;
				if (cover(mid) < 1) lo = mid;
				else hi = mid;
			}
			deep = (lo + hi) / 2;
		}

		// THE ZOOM, tabulated: Z(t) = Zb(t) + (P − RC)·Zu(t), linear in the
		// peak rate P — Zb the tunnel's own rate held (and landed), Zu the
		// gathering on top of it.
		const r0 = V_SWIM / Z_NOSE0;
		const { rc, dt } = ZOOM;
		const t1 = B.rest + 0.5;
		const N = Math.ceil((t1 - B.swim) / dt);
		const Zb = new Float64Array(N + 1);
		const Zu = new Float64Array(N + 1);
		const landK = (t) => 1 - smooth(span(t, ...ZOOM.land));
		const rb = (t) =>
			smooth(span(t, B.swim, B.swim + 1.5)) * lerp(r0, rc, smooth(span(t, 24.0, 30.0))) * landK(t);
		const ru = (t) => smooth(span(t, ...ZOOM.peak)) * landK(t);
		for (let i = 1; i <= N; i++) {
			const ta = B.swim + (i - 1) * dt;
			Zb[i] = Zb[i - 1] + 0.5 * dt * (rb(ta) + rb(ta + dt));
			Zu[i] = Zu[i - 1] + 0.5 * dt * (ru(ta) + ru(ta + dt));
		}
		const tab = (T, t) => {
			if (t <= B.swim) return 0;
			if (t >= t1) return T[N];
			const f = (t - B.swim) / dt;
			const i = Math.min(N - 1, Math.floor(f));
			return lerp(T[i], T[i + 1], f - i);
		};
		const zoomOf = (P) => (t) => tab(Zb, t) + (P - rc) * tab(Zu, t);
		// the peak for a fall of `lam` e-folds from B.first to B.rest
		const peakFor = (lam) =>
			rc + (lam - (tab(Zb, B.rest) - tab(Zb, B.first))) / (tab(Zu, B.rest) - tab(Zu, B.first));

		// THE ROOMS: each the room of the sum the hand is on as it comes into
		// sight (its plate APPEAR of a plate tall, in the glass before it) —
		// from a little before the sum pops — the answer's once it counts.
		const guessAt = (t) => {
			let r = calc.tries[0].room;
			for (const tr of calc.tries) if (t >= tr.at - 0.3) r = tr.room;
			return t >= B.count[0] - 0.5 ? decade : r;
		};
		// ζ → the fall's e-folds past ζ₀ (log/fall.js's, from the levels' X).
		const lamOf = (g, z) => {
			const logs = g.levels.map((l) => (l.X ? -Math.log(l.X) : 1));
			const E = (zz) => {
				if (zz < 0) return zz * logs[0];
				let e = 0;
				for (let k = 0; k < g.L; k++) {
					if (zz < k + 1) return e + (zz - k) * logs[k];
					e += logs[k];
				}
				return e + (zz - g.L) * logs[g.L];
			};
			return E(z) - E(ZETA0);
		};
		const guesses = (Zt) => {
			const Zf = Zt(B.first);
			const when = (z) => {
				let lo = B.swim;
				let hi = t1;
				for (let i = 0; i < 40; i++) {
					const mid = (lo + hi) / 2;
					if (Zt(mid) < z) lo = mid;
					else hi = mid;
				}
				return hi;
			};
			const out = [calc.tries[0].room];
			for (let k = 1; k < 48; k++) {
				const g = nestOf([...out, decade], 0);
				const lv = g.levels[k];
				const px = (z) => (g.F * lv.s * PLATE.H) / (g.pose(z).z - lv.O[2]);
				let lo = k - 1;
				let hi = k;
				for (let i = 0; i < 40; i++) {
					const mid = (lo + hi) / 2;
					if (px(mid) < APPEAR * g.plate) lo = mid;
					else hi = mid;
				}
				const t = when(Zf + lamOf(g, hi));
				out.push(guessAt(t));
				if (t >= B.rest) break;
			}
			return out;
		};
		// How many: the count whose fall needs the peak nearest NOMINAL, so
		// every answer rises at the same pace; then the order once more under
		// the zoom that gives (its rooms come into sight a touch earlier or
		// later), and the peak solved for it exactly.
		const list0 = guesses(zoomOf(ZOOM.nominal));
		let n = 2;
		let best = Infinity;
		for (let m = 2; m <= list0.length + 1; m++) {
			const P = peakFor(nestOf([...list0.slice(0, m - 1), decade], deep).TOTAL);
			if (Math.abs(P - ZOOM.nominal) < best) {
				best = Math.abs(P - ZOOM.nominal);
				n = m;
			}
		}
		const P0 = peakFor(nestOf([...list0.slice(0, n - 1), decade], deep).TOTAL);
		const list1 = guesses(zoomOf(P0));
		const order = [...list1.slice(0, n - 1), decade];
		while (order.length < n) order.splice(order.length - 1, 0, decade);
		const fall = makeFall({ art, order, beats: fb, zeta0: ZETA0, inside: deep });
		const geo = fall.geometry(w, h);
		const P = peakFor(geo.TOTAL);
		const efolds = zoomOf(P);
		const Zf = efolds(B.first);
		// the rooms on the one zoom (fall.draw reads ζ here)
		geo.zetaAt = (t) => geo.zetaOf(efolds(t) - Zf);
		S = { key, bases, spec, body, decade, fall, geo, efolds, Zf, peak: P, calc, order, deep };
		// The nearest ring as the tunnel is sketched in (the rings are drawn
		// in from it, near to far).
		const zL0 = Z_NOSE0 * Math.exp(-efolds(B.tunnel[0])) + 60;
		S.iRef = Math.ceil(Math.log(Z_NOSE0 / (0.985 * zL0)) / TUN.step);
		// The conception date's size on the band, and the band's half-height
		// that carries it.
		const H = figH(w, h);
		S.dateSize = Math.min(0.064 * H, (0.84 * w) / measure(calc.dateStr));
		S.bandHold = 0.82 * S.dateSize;
		S.ms = performance.now() - ms0;
		return S;
	}
	settled(board.w, board.h);

	const info = {
		seconds: SECONDS,
		live,
		// (a pinned page re-pinned in place — for a strip of frames without a
		// load each; every frame is a pure function of t, so it is the same)
		seek: (u) => at !== null && time.seek(u),
		beats: B,
		answers: ans,
		get decade() {
			return S?.decade;
		},
		get zoom() {
			return S ? { peak: S.peak, total: S.geo.TOTAL, rooms: S.order.length } : null;
		},
		get nest() {
			return S
				? {
						X: S.geo.levels.map((l) => l.X),
						order: S.order,
						ms: +S.ms.toFixed(1),
						tries: S.calc.tries.map((tr) => [tr.year, tr.room]),
						efolds: [25, 28, 30, 31, 35, 40, 45, 50, 52.4].map((t) => +S.efolds(t).toFixed(3)),
						zeta: [28, 30, 31, 32, 34, 36, 38, 40, 45, 50, 52.4].map(
							(t) => +S.geo.zetaAt(t).toFixed(3)
						)
					}
				: null;
		},
		// where the fall comes to rest: how far into the last glass, and how
		// many times the room covers the board there (its tighter direction)
		get rest() {
			if (!S) return null;
			const g = S.geo;
			const lv = g.levels[g.L];
			const k = (g.F * lv.s) / (g.pose(g.ZEND).z - lv.O[2]);
			return {
				inside: S.deep,
				cover: Math.min((PLATE.W * k) / board.w, (PLATE.H * k) / board.h)
			};
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
	// Where the nose is, its scale, its heading, from the zoom.
	function swimAt(t, st) {
		const E = st.efolds(t);
		const zN = Z_NOSE0 * Math.exp(-E);
		const g = (z) => 1 / Math.pow(1 + Math.pow(ZETA_S / z, 4), 0.25);
		const turn = smooth(span(t, ...B.onAxis));
		const dir = norm([lerp(-1, DIR_C[0], turn), DIR_C[1] * turn, DIR_C[2] * turn]);
		// The world RENORMALISED by e^E about the apex: everything the lens
		// sees (the swimmer, the lens itself, the rings) scaled up by the zoom
		// flown, so the picture is the same and the numbers stay of a size
		// (the nose Z_NOSE0 from the apex always) — the journey goes on for
		// twenty e-folds, past where the world's own would have shrunk under
		// the near plane.
		const sg = Math.exp(E);
		const s = (g(zN) / g(Z_NOSE0)) * sg;
		// The lens rides the axis; the nose, once the lens is on it, a little
		// below and right of it (OFF, scaled with the body), so the apex —
		// the lit point, the result's full stop — shows just ahead of it.
		const axis = [X_APEX + zN * sg, 0, 0];
		const nose = add3(axis, mul3(OFF, s * turn));
		return { E, zN, s, sg, axis, nose, dir };
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
		let fov = 30;
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
			tgt = lerp3(tA, [X_APEX, 0, 0], k2);
			fov = fovAt(t);
		}
		const cam = camera3({ pos, target: tgt, up: [0, 1, 0], fov: fovOf(fov, w, h), w, h });
		cam.fov = fovOf(fov, w, h);
		cam.k = kOf(fov, w, h);
		cam.tgt = tgt;
		return cam;
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

	// ── The journey: the tunnel, the rooms in it, the band at the end ────────
	// The glint at the end of the tunnel: the light it swims at, the first
	// room a speck in it (gone into the room as the room comes up).
	function drawGlint(ctx, w, h, t, O) {
		const g = smooth(span(t, ...B.glint)) * (1 - smooth(span(t, B.first - 1.2, B.first + 0.3)));
		if (g <= 0.01) return;
		const r = 0.07 * h * (0.6 + 0.4 * g);
		glow(ctx, O[0], O[1], r, [255, 226, 180], 0.55 * g);
		disc(ctx, O[0], O[1], 1.6 + 1.4 * g, { fill: '#fffaf0', alpha: 0.95 * g });
	}
	// THE BAND, at the end only: the last screen switched on — a white line
	// across its glass opening (B.screen) and stretched out across the board
	// (B.band) into the white-hot band, thick enough to carry the date. `G`
	// the last glass on the board. Its half-width W, half-height hb (px), how
	// far stretched (m), how hot, its ends' squareness (p: a capsule in the
	// glass, the reference's seam across the board).
	function endBandAt(t, w, h, G) {
		const k = smooth(span(t, ...B.screen));
		if (k <= 0 || !G || t > B.hit + 0.6) return null;
		const m = smooth(span(t, ...B.band));
		const gw = (G[2] - G[0]) / 2;
		const gh = (G[3] - G[1]) / 2;
		return {
			O: [(G[0] + G[2]) / 2, (G[1] + G[3]) / 2],
			k,
			m,
			W: lerp(0.985 * gw, 1.6 * w, Math.pow(m, 1.8)),
			hb: lerp(1, Math.min(S.bandHold, 0.8 * gh), Math.pow(k, 1.7)),
			hot: smooth(span(t, B.band[0] + 0.2, B.band[1] + 0.3)),
			p: lerp(8, 2, m)
		};
	}
	// The band's two edges on the board, drawn by hand (re-drawn each
	// drawing).
	function bandEdges(w, h, band, bo) {
		const { O, W, hb, p } = band;
		const xa = Math.max(O[0] - W, -24);
		const xb = Math.min(O[0] + W, w + 24);
		const n = 44;
		const jit = 0.8 + 0.02 * Math.min(hb, 0.1 * h);
		const edge = (x, s) => {
			const u = W > 0 ? Math.abs(x - O[0]) / W : 0;
			const prof = Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, u), p)), 1 / p);
			return O[1] + s * (hb * prof + jit * noise1(x / 38 + (s > 0 ? 9.3 : 0), bo * 7 + 3));
		};
		const top = [];
		const bottom = [];
		for (let i = 0; i <= n; i++) {
			const x = lerp(xa, xb, i / n);
			top.push([x, edge(x, -1)]);
			bottom.push([x, edge(x, 1)]);
		}
		return { top, bottom };
	}
	// The glow round the band and the band itself, white-hot; the flecks
	// along its edges (the reference's: little white squiggles off the seam,
	// a fresh set each drawing).
	function drawEndBand(ctx, ink, w, h, band, bo) {
		const { O, W, hb, hot, k, m } = band;
		const G = (0.05 + 0.13 * hot) * h;
		const a = (0.25 + 0.6 * hot) * k;
		if (a > 0.005) {
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			const rx = W + 1.6 * G;
			const ry = hb + G;
			ctx.translate(O[0], O[1]);
			ctx.scale(rx / ry, 1);
			const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
			const s1 = clamp(hb / ry, 0.01, 0.9);
			const s2 = clamp((hb + 0.3 * G) / ry, s1 + 0.01, 0.97);
			g.addColorStop(0, `rgba(255, 242, 220, ${a})`);
			g.addColorStop(s1, `rgba(255, 232, 200, ${0.85 * a})`);
			g.addColorStop(s2, `rgba(255, 196, 140, ${0.22 * a})`);
			g.addColorStop(1, 'rgba(255, 180, 120, 0)');
			ctx.fillStyle = g;
			ctx.fillRect(-ry, -ry, 2 * ry, 2 * ry);
			ctx.restore();
		}
		const { top, bottom } = bandEdges(w, h, band, bo);
		ctx.save();
		ctx.beginPath();
		top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
		for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(bottom[i][0], bottom[i][1]);
		ctx.closePath();
		ctx.globalAlpha = 0.7 + 0.3 * k;
		ctx.fillStyle = '#fffdf8';
		ctx.fill();
		ctx.restore();
		const fl = smooth(span(m, 0.4, 1));
		if (fl > 0.02) {
			const n = Math.round(14 + (10 * w) / 1280);
			for (let i = 0; i < 2 * n; i++) {
				const s = i < n ? -1 : 1;
				const x = O[0] + Math.min(W, 0.55 * w) * (2 * rand(i, bo, 41) - 1);
				const off = hb + (2 + 6 * rand(i, bo, 42)) * (h / 800);
				const len = (8 + 26 * rand(i, bo, 43)) * (h / 800);
				const pts = [];
				for (let j = 0; j <= 4; j++) {
					const u = j / 4;
					pts.push([x + (u - 0.5) * len, O[1] + s * (off + 1.6 * Math.sin(u * 6 + i))]);
				}
				ink.line(pts, HAND.ink, 1.1 * Math.sqrt(h / 800), 0.8 * fl, false);
			}
		}
	}

	// The rings: circles along the cone, each sketched in (written round from
	// its start), never quite closed, its wobble and overshoot new each
	// drawing, the nearer ones gone over twice, as a sketch's are; bolder as
	// they near the lens; hidden behind the swimmer; on round every room (the
	// rooms grow at their rate: the one zoom) and let go as the lens lands.
	// `off` the room's sway, once it lands (the rings with it).
	function rings(ink, t, w, h, cam, st, bo, off) {
		const zL = cam.pos[0] - X_APEX;
		if (zL <= 1) return;
		const go = 1 - smooth(span(t, B.land[0] - 0.8, B.land[0] + 0.6));
		if (go <= 0.01) return;
		const { k, step, umin } = TUN;
		// (the world renormalised by e^E, as swimAt has it)
		const Z0 = Z_NOSE0 * Math.exp(st.efolds(t));
		const iLo = Math.ceil(Math.log(Z0 / (0.985 * zL)) / step);
		const iHi = Math.floor(Math.log(Z0 / (umin * zL)) / step);
		const sc = Math.sqrt(h / 800);
		for (let i = iLo; i <= iHi; i++) {
			const zi = Z0 * Math.exp(-step * i);
			const u = zi / zL;
			const ti = B.tunnel[0] + 0.14 * Math.max(0, i - st.iRef);
			const upto = smooth(span(t, ti, ti + 0.5));
			if (upto <= 0) continue;
			const a =
				go * lerp(0.16, 0.85, smooth(span(u, umin, 0.45))) * (1 - smooth(span(u, 0.88, 0.985)));
			if (a < 0.02) continue;
			const lw = lerp(0.7, 2.6, smooth(span(u, 0.04, 0.8))) * sc;
			const rho = k * zi;
			const x = X_APEX + zi;
			const at = (px, py) => {
				const q = cam.project([x, py, -px]);
				if (q[2] <= NEAR) return null;
				return Z.hidden(q) ? null : [q[0] + off[0], q[1] + off[1]];
			};
			sketchRing(ink, at, rho, i, bo, upto, lw, a);
			if (u > 0.25) sketchRing(ink, at, rho * 1.012, i + 7919, bo, upto, 0.55 * lw, 0.6 * a);
		}
	}
	// One hand-drawn ring of radius rho through `at` (the plane's point at
	// [x, y] → the board, or null where it is hidden): started anywhere, swept
	// a little past a whole turn, its radius wobbling, all new each drawing.
	function sketchRing(ink, at, rho, i, bo, upto, lw, a, M = TUN.M) {
		const { wob } = TUN;
		const ph0 = TAU * rand(i, bo, 31);
		const sweep = TAU * (1.03 + 0.08 * rand(i, bo, 32)) * upto;
		const n = Math.max(8, Math.ceil(M * upto));
		const dx = 0.02 * rho * (2 * rand(i, bo, 36) - 1);
		const dy = 0.02 * rho * (2 * rand(i, bo, 35) - 1);
		const run = [];
		const flush = () => {
			if (run.length > 1) ink.line(run.slice(), HAND.ink, lw, a, false);
			run.length = 0;
		};
		const bw = board.w;
		const bh = board.h;
		// Which sides of the board a point is off (left, right, above, below):
		// a piece wholly off one side of the board is not stroked.
		const side = (p) =>
			(p[0] < -60 ? 1 : 0) |
			(p[0] > bw + 60 ? 2 : 0) |
			(p[1] < -60 ? 4 : 0) |
			(p[1] > bh + 60 ? 8 : 0);
		let prev = 0;
		for (let j = 0; j <= n; j++) {
			const f = j / n;
			const ph = ph0 + sweep * f;
			const rr = rho * (1 + wob * noise1(f * 6.5 * upto + i * 1.7, bo * 13 + i) + 0.012 * f);
			const p = at(dx + rr * Math.cos(ph), dy + rr * Math.sin(ph));
			const s = p ? side(p) : 0;
			if (!p || s & prev) {
				flush();
				if (p) run.push(p);
			} else run.push(p);
			prev = s;
		}
		flush();
	}
	// Debris: dots and dashes streaming out from the vanishing point (or the
	// band's edges), each on its own ray and pace, a new ray each time round.
	function debris(ctx, w, h, t, O, band, a, n) {
		if (a <= 0.01 || n <= 0) return;
		const H = figH(w, h);
		const R = 0.75 * Math.hypot(w, h);
		const AX = spreadX(w, h);
		const lw = Math.max(1.2, 0.0028 * H);
		if (!gOver) {
			ctx.save();
			ctx.globalAlpha = a;
			ctx.strokeStyle = HAND.ink;
			ctx.lineCap = 'round';
			ctx.lineWidth = lw;
			ctx.beginPath();
		}
		for (let k = 0; k < n; k++) {
			const v = 1.4 + 2.2 * rand(k, 601);
			const r0 = 0.03 * H;
			const P = Math.log(R / r0) / v;
			const cyc = t / P + rand(k, 602);
			const c = Math.floor(cyc);
			const tau = (cyc - c) * P;
			const r = r0 * Math.exp(v * tau);
			const th = TAU * rand(k, 603, c);
			let fx = O[0];
			let fy = O[1];
			const ux = AX * Math.cos(th);
			const uy = Math.sin(th);
			if (band) {
				fx += Math.min(band.W, 0.55 * w) * (2 * rand(k, 604, c) - 1);
				fy += (uy >= 0 ? 1 : -1) * band.hb;
			}
			const x0 = fx + ux * r;
			const y0 = fy + uy * r;
			const len = Math.max(0.6, r * v * 0.03 * (0.3 + rand(k, 605)));
			const L = Math.hypot(ux, uy) || 1;
			if (gOver) {
				gOver.dash(x0, y0, x0 + (ux / L) * len, y0 + (uy / L) * len, lw, HAND.ink, a);
				continue;
			}
			ctx.moveTo(x0, y0);
			ctx.lineTo(x0 + (ux / L) * len, y0 + (uy / L) * len);
		}
		if (gOver) return;
		ctx.stroke();
		ctx.restore();
	}

	// The speed lines and the debris for this moment: the journey's, rising
	// with it (more and brighter from the first sum to the zoom's peak), kept
	// off the middle once the rooms come (the glass the lens is flying at);
	// gone as it lands; then the band's sprays, off its edges.
	function rush(ctx, w, h, t, O, bo, band) {
		const H = figH(w, h);
		// (going on, thinning, until the band's sprays take over from them)
		const s = smooth(span(t, ...B.lines)) * (1 - smooth(span(t, B.land[0] + 0.2, B.band[0] + 0.3)));
		const spray = band
			? smooth(span(band.m, 0.2, 1)) * (1 - smooth(span(t, B.hit + 0.05, B.hit + 0.45)))
			: 0;
		const sc = Math.sqrt(h / 800);
		if (s > 0.004 && spray < s) {
			const e = smooth(span(t, B.premise[0], ZOOM.peak[1]));
			const r = smooth(span(t, B.first - 1, B.first + 2));
			speedLines(ctx, {
				ox: O[0],
				oy: O[1],
				w,
				h,
				n: Math.round((54 + 40 * e) * s),
				seed: bo,
				rIn: (u) => (lerp(0.13, 0.3, r) + lerp(0.32, 0.35, r) * u) * H,
				width: 1.7 * sc,
				alpha: (lerp(0.3, 0.24, r) + 0.13 * e) * s,
				color: HAND.ink,
				aspect: spreadX(w, h),
				gpu: gOver
			});
			prof('speedlines');
			debris(ctx, w, h, t, O, null, 0.75 * s, Math.round((56 + 50 * e) * s));
			prof('debris');
		} else if (spray > 0.004) sprays(ctx, w, h, t, band, spray);
	}
	// The band's sprays, the reference's: dots and short streaks thrown up
	// and down off its edges, clumped (a few clumps along it, a new place
	// each time round) and thinning as they fly out; each on its own pace.
	function sprays(ctx, w, h, t, band, a) {
		const H = figH(w, h);
		const sc = Math.sqrt(h / 800);
		const n = Math.round(320 * a);
		const R = 0.42 * h;
		const r0 = 0.006 * H;
		const W = Math.min(band.W, 0.6 * w);
		if (!gOver) {
			ctx.save();
			ctx.strokeStyle = HAND.ink;
			ctx.lineCap = 'round';
		}
		for (let k = 0; k < n; k++) {
			const v = 0.6 + 1.4 * rand(k, 811);
			const P = Math.log(R / r0) / v;
			const cyc = t / P + rand(k, 812);
			const c = Math.floor(cyc);
			const r = r0 * Math.exp(v * (cyc - c) * P);
			const s = rand(k, 813, c) < 0.5 ? -1 : 1;
			const clump = Math.floor(3 * rand(k, 814, c));
			const x0 =
				rand(k, 816, c) < 0.7
					? band.O[0] +
						0.8 * W * (2 * rand(clump, 815, c) - 1) +
						0.07 * w * (2 * rand(k, 817, c) - 1)
					: band.O[0] + W * (2 * rand(k, 818, c) - 1);
			const th = s * (Math.PI / 2) + 1.0 * (rand(k, 819, c) - 0.5);
			const ux = Math.cos(th);
			const uy = Math.sin(th);
			const X = x0 + 1.3 * ux * r;
			const Y = band.O[1] + s * band.hb + uy * r;
			const streak = rand(k, 820) < 0.3;
			const len = streak ? 0.1 * r + 5 * sc : 0.5;
			const near = 1 - smooth(span(r / R, 0.15, 1));
			const wd = (streak ? 1.5 : 1.6 + 2.6 * rand(k, 821) * near) * sc;
			const al = a * near;
			if (al <= 0.02) continue;
			if (gOver) gOver.dash(X, Y, X + ux * len, Y + uy * len, wd, HAND.ink, al);
			else {
				ctx.globalAlpha = al;
				ctx.lineWidth = wd;
				ctx.beginPath();
				ctx.moveTo(X, Y);
				ctx.lineTo(X + ux * len, Y + uy * len);
				ctx.stroke();
			}
		}
		if (!gOver) ctx.restore();
		prof('sprays');
	}

	// ── The figures ──────────────────────────────────────────────────────────
	// Where a flyer is, out on its ray from the vanishing point, its distance r.
	function flyerAt(O, w, h, th, r) {
		return [O[0] + spreadX(w, h) * r * Math.cos(th), O[1] + r * Math.sin(th)];
	}
	// The count: 266 … 1, each figure out of the vanishing point and struck
	// through in red at its second.
	function countdown(ink, w, h, t, O, bo) {
		if (t < B.count[0] - 1 || t > B.count[1] + 1.6) return;
		const H = figH(w, h);
		const R = 0.7 * Math.hypot(w, h);
		for (let j = 1; j <= GESTATION; j++) {
			if (j > GESTATION - FIN) {
				drumroll(ink, w, h, t, O, bo, j);
				continue;
			}
			const ts = COUNT.T[j];
			const s0 = ts - COUNT.lead[j];
			if (t < s0) break;
			const tau = t - s0;
			const r = 0.016 * H * Math.exp(COUNT.v[j] * tau);
			if (r > R) continue;
			const [x, y] = flyerAt(O, w, h, TAU * rand(j, 11), r);
			const size = 0.2 * r * (0.85 + 0.3 * rand(j, 13));
			if (size < 3) continue;
			if (x < -3 * size || x > w + 3 * size || y < -2 * size || y > h + 2 * size) continue;
			const a = smooth(span(tau, 0, 0.1));
			const box = letter(ink, String(GESTATION + 1 - j), x, y + size / 2, size, {
				seed: j,
				boil: bo,
				alpha: a,
				width: 0.13,
				keyed: size > 40
			});
			strike(ink, [box.x0, box.y0, box.x1, box.y1], span(t, ts, ts + 0.07), {
				seed: j,
				boil: bo,
				alpha: a
			});
		}
	}
	// THE DRUMROLL: the count's last FIN days (5 … 1) slowing as the lens comes
	// to rest — each popped out of the vanishing point big, round the middle,
	// bigger as it goes (the 1 the biggest), struck at its second, flown out
	// past the lens as the next comes; the 1 as the screen switches on.
	const FIN = 5;
	function drumroll(ink, w, h, t, O, bo, j) {
		const n = GESTATION + 1 - j;
		const ts = COUNT.T[j];
		const t0 = ts - 0.3;
		const out = j < GESTATION ? Math.max(COUNT.T[j + 1] - 0.3, ts + 0.25) : B.screen[0] + 0.15;
		if (t < t0 || t > out + 0.5) return;
		const H = figH(w, h);
		const k = span(t, t0, t0 + 0.3);
		const to = Math.max(0, t - out);
		const grow = Math.exp(2.8 * to);
		const a = smooth(span(k, 0, 0.35)) * (1 - smooth(span(to, 0.1, 0.42)));
		if (a <= 0.01) return;
		const r = (0.17 + 0.07 * rand(j, 14)) * H * lerp(0.15, 1, smooth(k)) * grow;
		const [x, y] = flyerAt(O, w, h, TAU * rand(j, 11), r);
		const size = lerp(0.07, 0.13, (FIN - n) / (FIN - 1)) * H * lerp(0.25, 1, backOut(k)) * grow;
		const box = letter(ink, String(n), x, y + size / 2, size, {
			seed: j,
			boil: bo,
			alpha: a,
			width: 0.12
		});
		strike(ink, [box.x0, box.y0, box.x1, box.y1], span(t, ts, ts + 0.08), {
			seed: j,
			boil: bo,
			alpha: a
		});
	}
	// The months, out on the golden angle, each its name and the days it
	// gives, crossed off at its last day (the year over the month it turns
	// at). Each reaches 0.2 of the board out as it is struck.
	function months(ink, w, h, t, O, st, bo) {
		const rows = st.calc.rows;
		const H = figH(w, h);
		const R = 0.7 * Math.hypot(w, h);
		const GOLDEN = Math.PI * (3 - Math.sqrt(5));
		for (let r = 0; r < rows.length; r++) {
			const row = rows[r];
			const t0 = COUNT.T[row.j0] - 0.3;
			const t1 = COUNT.T[row.j1];
			if (t < t0) break;
			const r0 = 0.05 * H;
			const v = clamp(Math.log(0.2 / 0.05) / Math.max(0.2, t1 - t0), 0.7, 2.4);
			const rad = r0 * Math.exp(v * (t - t0));
			if (rad > R) continue;
			const [x, y] = flyerAt(O, w, h, -0.6 + r * GOLDEN, rad);
			const size = 0.32 * rad;
			if (x < -4 * size || x > w + 4 * size || y < -2 * size || y > h + 2 * size) continue;
			const a = smooth(span(t - t0, 0, 0.15));
			const box = letter(ink, row.label, x, y + size / 2, size, {
				seed: 500 + r,
				boil: bo,
				alpha: a,
				width: 0.12
			});
			const name = [box.cells[0][0], box.y0, box.cells[2][2], box.y1];
			strike(ink, name, span(t, t1, t1 + 0.1), { seed: 500 + r, boil: bo, alpha: a, width: 0.15 });
			if (row.year)
				letter(ink, row.year, x, box.y0 - 0.3 * size, 0.55 * size, {
					seed: 700 + r,
					boil: bo,
					alpha: 0.9 * a,
					width: 0.12
				});
		}
	}
	// A slam: lines of hand lettering popping out of the vanishing point to a
	// place off it (x, y: of the board, from it), held boiling, then flying on
	// out past the lens; each line { s, size (of figH), write: [t0, t1],
	// marks: [{ from, to, at, kind: 'strike' | 'circle' }] } (glyph indices).
	function slam(ink, t, w, h, O, bo, sl) {
		if (t < sl.at || t > sl.out + 0.5) return;
		const H = figH(w, h);
		const k = span(t, sl.at, sl.at + 0.32);
		const pop = backOut(k);
		const to = Math.max(0, t - sl.out);
		const grow = Math.exp(2.8 * to);
		const a = smooth(span(k, 0, 0.35)) * (1 - smooth(span(to, 0.1, 0.42)));
		if (a <= 0.01) return;
		const reach = lerp(0.15, 1, smooth(k)) * grow;
		const cx = O[0] + sl.x * w * reach;
		const cy = O[1] + sl.y * h * reach;
		const sc = lerp(0.25, 1, pop) * grow;
		const sizes = sl.lines.map((L) => Math.min(L.size * H, (0.9 * w) / measure(L.s)) * sc);
		const gap = 0.5;
		const total = sizes.reduce((s, z, i) => s + z * (i ? 1 + gap : 1), 0);
		let y = cy - total / 2;
		sl.lines.forEach((L, i) => {
			const sz = sizes[i];
			y += sz * (i ? 1 + gap : 1);
			const upto = L.write ? clamp01((t - L.write[0]) / (L.write[1] - L.write[0])) : 1;
			if (upto <= 0) return;
			const box = letter(ink, L.s, cx, y, sz, {
				seed: sl.seed + i * 13,
				boil: bo,
				alpha: a,
				width: L.width ?? 0.12,
				upto
			});
			for (const mk of L.marks ?? []) {
				const kk = span(t, mk.at, mk.at + (mk.kind === 'circle' ? 0.35 : 0.08));
				if (kk <= 0) continue;
				const c = box.cells.slice(mk.from, mk.to + 1);
				const bx = [
					Math.min(...c.map((q) => q[0])),
					Math.min(...c.map((q) => q[1])),
					Math.max(...c.map((q) => q[2])),
					Math.max(...c.map((q) => q[3]))
				];
				if (mk.kind === 'circle')
					circleMark(ink, bx, kk, { seed: sl.seed + i, boil: bo, alpha: a });
				else strike(ink, bx, kk, { seed: sl.seed + i * 7 + mk.from, boil: bo, alpha: a });
			}
		});
	}
	// THE CONCEPTION DATE, once: the last month's working over the band as
	// its days are counted (MAY 31 − 7), then = the day as the count lands;
	// and the date lettered ON the band in dark ink, ringed in red — until
	// the white blooms out over it.
	function conceivedDate(inkD, ink, t, w, h, O, st, bo, band) {
		const c0 = B.conceived[0];
		const calc = st.calc;
		const tw = COUNT.T[calc.lastJ0] - 0.35;
		if (t < tw || t > B.hit + 0.5) return;
		const H = figH(w, h);
		const a = 1 - smooth(span(t, B.hit + 0.15, B.hit + 0.45));
		const C = band ? band.O : O;
		const hb = Math.max(band ? band.hb : 0, st.bandHold);
		const ws = Math.min(0.04 * H, (0.8 * w) / measure(calc.working + calc.landed));
		const wy = C[1] - hb - 0.55 * ws - 0.02 * H;
		const head = letter(ink, calc.working, C[0], wy, ws, {
			align: 'right',
			seed: 880,
			boil: bo,
			alpha: a * smooth(span(t, tw, tw + 0.25)),
			width: 0.12,
			upto: smooth(span(t, tw, tw + 0.3))
		});
		if (t > c0)
			letter(ink, calc.landed, head.x1 + 0.12 * ws, wy, ws, {
				align: 'left',
				seed: 881,
				boil: bo,
				alpha: a,
				width: 0.12,
				upto: smooth(span(t, c0, c0 + 0.25))
			});
		if (t < c0 + 0.2 || !band) return;
		const size = st.dateSize;
		const box = letter(inkD, calc.dateStr, C[0], C[1] + 0.5 * size, size, {
			seed: 900,
			boil: bo,
			alpha: a,
			width: 0.12,
			color: '#1d1612',
			keyed: false,
			upto: smooth(span(t, c0 + 0.2, c0 + 0.65))
		});
		circleMark(inkD, [box.x0, box.y0, box.x1, box.y1], span(t, c0 + 0.8, c0 + 1.15), {
			seed: 901,
			boil: bo,
			alpha: a,
			pad: 0.42
		});
	}
	// Everything flying over the journey at t.
	function figures(ink, w, h, t, O, st, bo) {
		for (const sl of st.calc.slams) slam(ink, t, w, h, O, bo, sl);
		months(ink, w, h, t, O, st, bo);
		countdown(ink, w, h, t, O, bo);
	}

	// ── The conception's light ───────────────────────────────────────────────
	// Out of the last screen once the lens is at rest inside the room (the
	// fall lands `inside` it, log/fall.js): a first glow of it from the
	// moment it switches on, the band stretched out of it across the board,
	// the swimmer swimming into that. The light is MADE of what is there
	// (log/lens.js `light`): its shafts are the picture's own brights — the
	// screen and the band — smeared out along its rays, so the room's lines
	// shadow them;
	// through them a slow sunburst of warm rays, each its own hue (red-orange,
	// gold, cream), a core of white-gold light, and the tunnel's rings come
	// back as rings of light drifting out of it. Swelling as the swimmer goes
	// in; at the hit a disc of white blooms out of the screen over the whole
	// board (0.45 s) and holds; then it BURNS OUT — the darks first, the room's
	// lights last, the edges first and the screen last — over ~3 s, the room's
	// colour flooding in under it (B.colour, bed first, wall last), so the
	// colour comes up out of the light as the light draws back into the
	// screen; the rays stay, breathing, and settle to a glow on the room.
	function lightAt(t, w, h) {
		const H = B.hit;
		const g = lastGlass;
		if (!g || t < B.screen[0]) return null;
		const x = (g[0] + g[2]) / 2;
		const y = (g[1] + g[3]) / 2;
		const D = Math.hypot(w, h);
		const gr = 0.5 * Math.min(g[2] - g[0], g[3] - g[1]);
		// (from the moment the screen switches on, a first glow of it, so the
		// hush of the landing fills with the light; then the swell)
		const early = smooth(span(t, B.screen[0], H - 1.1));
		const pre = smooth(span(t, H - 1.1, H));
		const HOLD = H + 0.7; // the white held from the bloom to here
		const after = Math.max(0, t - HOLD); // since it began to burn out
		const breath = 1 + 0.12 * Math.sin((TAU * (t - H)) / 2.3);
		const out = 1 - smooth(span(t, ...B.out));
		const rise = smooth(span(t, H - 0.05, H + 0.35));
		const rays =
			(t < HOLD
				? lerp(0.14 * early + 0.31 * pre * pre, 1, rise)
				: (0.18 + 0.55 * Math.exp(-after / 1.8)) * breath) * out;
		const core =
			(t < HOLD ? lerp(0.1 * early + 0.2 * pre, 1, rise) : 0.12 + 0.55 * Math.exp(-after / 0.9)) *
			out;
		const rings =
			(0.3 * smooth(span(t, H - 0.7, H)) * (1 - smooth(span(t, H + 0.4, H + 2.2))) +
				0.06 * smooth(span(t, H + 1.5, H + 3))) *
			out;
		// the white: blooming out of the screen, held, then burning out
		const bloom =
			t >= H && t < HOLD ? gr + 1.4 * D * Math.pow(smooth(span(t, H, H + 0.45)), 1.6) : -1;
		const A = t >= HOLD ? Math.exp(-after / 0.6) : 0;
		const Bn = t >= HOLD ? 0.35 * Math.exp(-after / 0.8) * (1 - A) : 0;
		return {
			x,
			y,
			r: Math.max(8, 0.9 * gr),
			rays,
			core,
			rings,
			phase: 1.6 * (t - H),
			turn: 0.07 * t,
			bloom,
			bloomSoft: 0.3 * D,
			burnA: A,
			burnB: Bn,
			burnR: 0.3 * D
		};
	}

	// The colour's reach out of the screen (log/fall.js `reveal`): from the
	// glass's edge out past the board's corners over B.reveal, its ring
	// hand-drawn and boiling; null before it starts.
	function revealAt(t, w, h, G, bo) {
		const k = span(t, ...B.reveal);
		if (k <= 0) return null;
		const g0 = 0.5 * Math.min(G[2] - G[0], G[3] - G[1]);
		return { r: g0 + 0.68 * Math.hypot(w, h) * Math.pow(smooth(k), 1.15), wob: 0.035, seed: bo };
	}

	// ── Render ───────────────────────────────────────────────────────────────
	let lastGlass = null; // the last glass on the board this frame (the flash's)
	function render() {
		window.__prof?.begin();
		const t = time.t;
		clearBoard(board, { chalkDust: false, shown: !lens, ground: ringsShow(t) ? null : PAL.ground });
		gUnder?.reset();
		gOver?.reset();
		prof('clear');
		const { ctx, w, h } = board;
		const hand = answers.hand(t);
		// The fuzz's clock: real seconds live (it keeps moving while the run
		// waits at a question), exactly t pinned, in the demo, in a reel.
		const secs = hand.secs;
		answers.slider(entry.hit);
		if (window.__lab) {
			window.__lab.t = t;
			window.__lab.decade = S?.decade;
		}
		if (t < FREEZE) {
			entry.reset();
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			tag(ctx, w, h, 'flow-strand-sketch-three');
			fuzz(ctx, w, h, secs, t);
			window.__prof?.end();
			return;
		}
		if (live) remember(hand, t);
		const st = settled(w, h);
		lastGlass = null;
		world(ctx, w, h, t, hand, st);
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
		prof('captions');
		// The end: the conception's light out of the last screen, on the GPU
		// (lightAt); without the lens, strand's flash on the board.
		if (!lens) flash(ctx, w, h, t - B.hit, lastGlass);
		prof('flash');
		const out = smooth(span(t, ...B.out));
		if (out > 0.003) {
			ctx.save();
			ctx.globalAlpha = out;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
		prof('out');
		tag(ctx, w, h, 'flow-strand-sketch-three');
		fuzz(ctx, w, h, secs, t);
		prof('grain');
		window.__prof?.end();
	}
	// The fuzz over the frame: the lens on the GPU, or the canvas grain.
	function fuzz(ctx, w, h, secs, t) {
		if (lens)
			lens.frame({
				secs,
				look,
				light: lightAt(t, w, h),
				// the rings under the board, the rest over it, both inside the
				// lens (so they take its halo, its mist and its grain)
				under: gUnder?.count ? (r, o) => gUnder.draw(r, { w, h, dpr: o.dpr }) : null,
				over: gOver?.count ? (r, o) => gOver.draw(r, { w, h, dpr: o.dpr }) : null
			});
		else grain(ctx, w, h, secs);
	}

	// The swimmer's lines in the hand: on the screen's own noise (it holds
	// its place on the board), the boil ramped in as it comes to life.
	function swimmerHand(ctx, t, bo) {
		if (t < B.boil[0]) return ctx;
		const k = smooth(span(t, ...B.boil));
		return pen.set({
			on: true,
			seed: bo,
			amp: 1.5 * k,
			wave: 26,
			step: 12,
			over: 0,
			img: 0,
			ox: 0,
			oy: 0,
			scale: 1,
			dpr: board.dpr
		}).ctx;
	}

	// The rooms through the hand: every cel jittering, every line wobbling
	// and overshooting, on the noise of the zoom they are under (e^zoom about
	// the vanishing point O).
	const roomPen = (O, zoom, bo, calm = 1) =>
		pen.set({
			on: true,
			seed: bo,
			amp: 1.5 * calm,
			wave: 40,
			over: 7,
			// (Cut to 18 px, not 12: the wobble is 1.5 px on a 40 px wave, so
			// the coarser cut does not show, and the rooms are most of the
			// lines there are.)
			step: 18,
			img: 1.2 * calm,
			ox: O[0],
			oy: O[1],
			scale: Math.exp(zoom),
			dpr: board.dpr
		}).ctx;
	// THE ROOMS, IN THE TUNNEL: log/fall.js's nest drawn through the hand at
	// the ζ the one zoom has reached (geo.zetaAt, settled), so the first room
	// is the speck in the glint at the end of the tunnel, and every room after
	// it hangs in the glass before it, growing at the rate the rings pass —
	// one camera move, one place, from the speck to the rest inside the last.
	// About the tunnel's vanishing point O (the fall draws about the board's
	// middle: until the lens is on the axis, O is off it); from the landing,
	// swaying with the room (its lens's own: the frame holds, the room drifts
	// behind it). Then the colour carried out of the screen (revealAt) and
	// its ring of warm light. Sets lastGlass; returns the room's lens.
	function rooms(ctx, w, h, t, st, O, bo) {
		const g = st.geo;
		const zeta = g.zetaAt(t);
		if (g.plate / Math.pow(g.levels[0].X, zeta) < 2.5) return null;
		// The boil eases off the coloured room after the flash.
		const calm = lerp(1, 0.3, smooth(span(t, B.hit + 0.5, B.hit + 3.5)));
		const dx = O[0] - w / 2;
		const dy = O[1] - h / 2;
		ctx.save();
		ctx.translate(dx, dy);
		const cam = st.fall.draw(roomPen([w / 2, h / 2], st.efolds(t) - st.Zf, bo, calm), w, h, t, {
			colourAlong: false,
			dust: null,
			// the colour carried out of the screen by the light: a hand-drawn
			// ring spreading from the glass, chalk outside it
			reveal: lens ? (G) => revealAt(t, w, h, G, bo) : null
		});
		ctx.restore();
		// Sketched in out of the glint (26.4 – 28.6), while it is a speck: the
		// first plate under a veil of the ground, lifting. (Its plate hides the
		// rings behind it already, so the veil covers nothing else.)
		const veil = 1 - smooth(span(t, ...B.speck));
		if (veil > 0.004 && zeta < 0) {
			const p = g.pose(zeta);
			const m = g.F / p.z;
			const X = w / 2 + dx - m * p.x;
			const Y = h / 2 + dy + m * p.y;
			const hw = (m * PLATE.W) / 2 + 3;
			const hh = (m * PLATE.H) / 2 + 3;
			ctx.save();
			ctx.globalAlpha = veil;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(X - hw, Y - hh, 2 * hw, 2 * hh);
			ctx.restore();
		}
		if (!cam.glass) return cam;
		const G = [cam.glass[0] + dx, cam.glass[1] + dy, cam.glass[2] + dx, cam.glass[3] + dy];
		lastGlass = G;
		// The colour's front: a ring of warm light, hand-drawn, boiling (the
		// tunnel's rings come back as the light's), over the edge it carries.
		if (lens && gOver) {
			const rv = revealAt(t, w, h, G, bo);
			const k = span(t, ...B.reveal);
			const a = rv ? smooth(span(k, 0, 0.12)) * (1 - smooth(span(k, 0.7, 1))) : 0;
			if (a > 0.01) {
				const ring = inkFor(gOver);
				const C = { cx: (G[0] + G[2]) / 2, cy: (G[1] + G[3]) / 2 };
				const sc = Math.sqrt(h / 800);
				ring.line(revealRing({ ...C, ...rv }, 96), '#ffcf8a', 12 * sc, 0.16 * a, false);
				ring.line(revealRing({ ...C, ...rv }, 96), '#ffd99a', 4.2 * sc, 0.85 * a, false);
				ring.line(
					revealRing({ ...C, ...rv, r: rv.r * 1.012, seed: rv.seed + 7 }, 96),
					'#fff1d6',
					1.6 * sc,
					0.55 * a,
					false
				);
				ring.flush(ctx);
			}
		}
		return cam;
	}
	// The room's sway once it lands, on the board (log/fall.js's lensAt, as
	// the nest is given it: none before B.land).
	function swayAt(t, st) {
		const g = st.geo;
		const A = 0.3 * smooth(span(t, B.land[0], B.land[1] + 0.5));
		if (A <= 0) return [0, 0];
		const ex = A * Math.sin(1.1 * t - 0.4);
		const ey = A * 0.45 * Math.sin(1.7 * t + 0.6);
		return [(g.F * ex) / g.d0, -(g.F * ey) / g.d0];
	}
	// The swimmer on into the band at the end: the chase's own picture (the
	// lens D_C behind the nose, as the tunnel's lens has it, so the hand-over
	// at B.aim[0] is the same drawing), drawn further and further ahead and
	// onto the glass's middle, gone at the hit.
	function swimmerInto(ctx, w, h, t, st, shape, O, bo) {
		const alpha = 1 - smooth(span(t, B.hit - 0.15, B.hit));
		if (alpha <= 0.01) return;
		const aim = smooth(span(t, ...B.aim));
		const G = lastGlass;
		const gx = G ? (G[0] + G[2]) / 2 : O[0];
		const gy = G ? (G[1] + G[3]) / 2 : O[1];
		const view = camera3({
			pos: [D_C * lerp(1, 2.6, aim * aim), 0, 0],
			target: [-1000, 0, 0],
			up: [0, 1, 0],
			fov: fovOf(FOV_END, w, h),
			w,
			h
		});
		const pose = { at: mul3(OFF, 1 - aim), dir: DIR_C, up: [0, 0, 1], scale: 1 };
		const hd = swimmerHand(ctx, t, bo);
		ctx.save();
		ctx.translate(lerp(O[0], gx, aim) - w / 2, lerp(O[1], gy, aim) - h / 2);
		ctx.globalAlpha = alpha;
		st.body.draw(hd, view, shape, pose, { back: 0 });
		ctx.restore();
	}

	// From the stop's glide to the conception: one world.
	function world(ctx, w, h, t, hand, st) {
		const cam = lensAt(t, w, h, st, t < B.back[1] ? entry.frame(ctx, w, h, t, hand) : undefined);
		const body = st.body;
		const L = body.length;
		const bo = boilOf(t);
		prof('lens');

		// The title fading and the stop gliding to the strand's 5′ end.
		const five = cam.project([0, 0, 0]);
		entry.title(ctx, w, h, t);
		prof('title');
		const pan = easeIO(span(t, ...B.pan));
		const stop = TERM.layout(ctx, w, h).stop;

		// ── The tunnel: the rings, the rooms in it, the speed lines, the debris ──
		const sw = t > B.swim ? swimAt(t, st) : null;
		const shape = shapeAt(t, st);
		const pose = sw
			? { at: sw.nose, dir: sw.dir, up: [0, 0, 1], scale: sw.s }
			: { at: [0, 0, 0], dir: [-1, 0, 0], up: [0, 0, 1], scale: 1 };
		const journey = t > B.tunnel[0] - 0.1;
		const O = journey ? cam.project([X_APEX, 0, 0]) : null;
		const on = journey && O[2] > NEAR;
		Z.reset(w, h);
		// O2: the rooms' vanishing point — the tunnel's, and from the landing
		// swaying with the room; everything flat over the journey is about it.
		const sway = on ? swayAt(t, st) : [0, 0];
		const O2 = on ? [O[0] + sway[0], O[1] + sway[1]] : null;
		let band = null;
		if (on) {
			body.fillDepth(Z, cam, shape, pose);
			prof('depth');
			const ink = inkFor(gUnder);
			rings(ink, t, w, h, cam, st, bo, sway);
			ink.flush(ctx);
			prof('rings');
			rooms(ctx, w, h, t, st, O, bo);
			prof('rooms');
			band = endBandAt(t, w, h, lastGlass);
			rush(ctx, w, h, t, O2, bo, band);
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
			if (t < B.aim[0]) {
				// (with the room's sway, once it lands)
				ctx.save();
				if (on) ctx.translate(sway[0], sway[1]);
				body.draw(swimmerHand(ctx, t, bo), cam, shape, pose, {
					rings: count / NRg,
					gens,
					contour: smooth(span(t, ...B.contour)),
					axis: 0.55 * close * (1 - smooth(span(t, ...B.contour))),
					back: 0.2 * (1 - life),
					depth: null
				});
				ctx.restore();
			} else swimmerInto(ctx, w, h, t, st, shape, O2, bo);
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
		prof('strand+body');
		// The reading frame.
		const fa =
			smooth(span(t, B.read[0] - 0.3, B.read[0] + 0.1)) *
			(1 - smooth(span(t, B.read[1] - 0.1, B.read[1] + 0.4)));
		if (fa > 0.004) drawFrame(ctx, cam, xf, fa, st);

		// ── The glint, the band at the end (over the swimmer: its head into
		// the glare), the date on it, the figures over all ──
		if (on) {
			const ink = inkFor(gOver);
			const inkD = makeInk();
			prof('frame');
			drawGlint(ctx, w, h, t, O2);
			if (band) drawEndBand(ctx, ink, w, h, band, bo);
			prof('band');
			conceivedDate(inkD, ink, t, w, h, O2, st, bo, band);
			inkD.flush(ctx);
			prof('date');
			figures(ink, w, h, t, O2, st, bo);
			ink.flush(ctx);
			prof('figures');
		}

		// ── The questions ──
		const asked = 1 - smooth(span(t, ...B.asked));
		if (asked > 0.004) entry.questions(ctx, w, h, t, hand, asked);
		prof('questions');
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
// The sums (the hand's shortcuts, each wrong: its year, the room of it, its
// slam — the divisor ringed, the year struck), the rows of the count back
// through the months (each its days j0…j1 of the 266, its label, the year
// where it turns), the working of the last month and the date; and the
// slams: the premise before the sums, the sums, DAY BY DAY as the count
// starts. `narrow` (a board taller than it is wide) is not needed by any of
// them: each line is fitted to the board's width.
export function calcOf(digits) {
	const b = birthOf(digits);
	const c = conceive(b);
	let j = 0;
	const rows = c.rows.map((r, i) => {
		const j0 = j + 1;
		j += r.take;
		return {
			...r,
			j0,
			j1: j,
			label: `${MON[r.m - 1]} ${r.take}`,
			year: i > 0 && r.y !== c.rows[i - 1].y ? String(r.y) : null
		};
	});
	const lastJ0 = Math.min(GESTATION, j + 1);
	const working = `${MON[c.last.m - 1]} ${c.last.len} − ${c.last.rem}`;
	const landed = `= ${c.date.d}`;
	// The sums: 266 ÷ d, rounded, taken off the birth year — every other one
	// added to it instead: a needle swinging either side and settling.
	const tries = TRY.map((d, i) => {
		const n = Math.round(GESTATION / d);
		const sign = i % 2 ? 1 : -1;
		const year = b.y + sign * n;
		const at = B.tries[i];
		const next = i + 1 < TRY.length ? B.tries[i + 1] : B.count[0];
		const s1 = `${GESTATION} ÷ ${d} = ${n}`;
		// (the year a guess: 1949?)
		const s2 = `${b.y} ${sign < 0 ? '−' : '+'} ${n} = ${year}?`;
		const yl = String(year).length + 1;
		return {
			d,
			n,
			sign,
			year,
			room: roomOfYear(year),
			at,
			slam: {
				at,
				out: next - 0.15,
				x: 0,
				y: i % 2 ? 0.27 : -0.27,
				seed: 200 + 40 * i,
				lines: [
					{
						s: s1,
						size: 0.048,
						write: [at + 0.05, at + 0.45],
						// the mistake: the divisor, ringed
						marks: [{ from: 4, to: 5 + String(d).length, at: at + 1.35, kind: 'circle' }]
					},
					{
						s: s2,
						size: 0.078,
						write: [at + 0.55, at + 1.0],
						// … and the year it gives, struck
						marks: [{ from: s2.length - yl, to: s2.length - 1, at: at + 1.7, kind: 'strike' }]
					}
				]
			}
		};
	});
	const slams = [
		{
			at: B.premise[0],
			out: B.premise[1],
			x: 0,
			y: -0.26,
			seed: 100,
			lines: [
				{ s: fmt(b), size: 0.075 },
				{ s: `− ${GESTATION} DAYS`, size: 0.06, write: [B.premise[0] + 0.3, B.premise[0] + 0.7] }
			]
		},
		...tries.map((tr) => tr.slam),
		{
			at: B.count[0] - 0.2,
			out: B.count[0] + 1.3,
			x: 0,
			y: 0.27,
			seed: 480,
			lines: [{ s: 'DAY BY DAY', size: 0.06, write: [B.count[0] - 0.2, B.count[0] + 0.2] }]
		}
	];
	return {
		birth: b,
		rows,
		last: c.last,
		date: c.date,
		dateStr: fmt(c.date),
		working,
		landed,
		lastJ0,
		tries,
		slams
	};
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
