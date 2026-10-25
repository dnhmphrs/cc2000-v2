// ── Flow: flow-strand-sketch-one — one beat: the hand bad at maths ───────────
// flow-strand-sketch (sketch A's: the soft warm lens, the GPU ink, the holy
// light inside the last room) with its journey made ONE BEAT. There, the
// count of the days ran out halfway, the tunnel flattened into the white-hot
// band, the conception date went up on it and the swimmer dived through — a
// climax — and then the fall through the rooms started again from the
// bottom. Here nothing peaks before the end: one camera, one zoom, one space
// from the swimmer coming alive to the conception, the energy only building,
// and the conception date comes up ONCE, at the end, on the last screen.
//
// flow-strand to the end of the compile, as it is (the title, the double
// helix typed by hand, COMPILING USER GENETICS, the swimmer coming to life at
// 22.2 s); from there the journey drawn in the anime hand — Eva, Akira —
// every line a little off true and drawn AGAIN twelve times a second, on
// twos, so the lines boil like hand-drawn animation while the camera's own
// move stays smooth (log/sketch-hand.js; this variant's own glyphs and its
// scribble in log/sketch-one-hand.js).
//
// ONE ZOOM (ZOOM, below). From the swim to the rest inside the last room the
// lens flies one zoom, in e-folds: from rest with the swim, gathering to 0.5
// e-folds a second by 30 s, and then only ever GATHERING (× e^(growth·t),
// ~×2.8 in 20 s) until the landing eases it to rest inside the last room
// over the last three seconds. The tunnel's rings and the rooms are that
// one zoom's: the fall's ζ is read off it (log/sketch-one-fall.js `zoom`) at
// every t, so the first room is in the glint at the end of the tunnel from
// ~24 s and grows at the tunnel's rate, and the tunnel's own 3D rings go on
// round every room after it (its lens flying on down the same cone, its
// picture laid about the rooms' vanishing point), let go as it lands. The
// fall's lens takes over from the tunnel's at B.fall[0] unseen — the same
// zoom, the same rings, the swimmer the chase's own picture (diffed at the
// same t both ways: sub-pixel). The speed lines and the debris are one rush
// that only grows, more and brighter, to the count's blizzard; and as the
// lens comes to rest the speed lines do not let go — they stay on as the
// anime's focus lines, carried onto the last screen as it switches on and
// brightening with its light to the hit (rush), so the count hands its
// energy straight to the band.
//
// WHY THE OTHER DECADES FIRST: THE HAND IS BAD AT MATHS. It has the sum —
// the birthday, slammed up, − 266 DAYS — and does not get straight there
// (log/sketch-one-workings.js). It TRIES: the same sum with the unit wrong
// (14 · 02 · 1987 − 26.6 YEARS: 266 days with a point in it; + 266 MONTHS;
// − 9 YEARS, 9 months as years; 266 weeks, seasons; 38 weeks as years; 9
// months as decades …), each try a real date in some other decade, and THAT
// decade's room is the room the journey falls through while the hand works
// it out: the rooms ARE its wrong answers. Three tries, three slips, three
// decades of the archive (1950s–2020s), the error shrinking — decades out,
// then less, then less — and swinging either side of the answer where it
// can, a pendulum settling, a different room each time; each written as its
// room comes up, the date SCRIBBLED OUT in red and the slip struck as the
// lens goes into the room's glass, flown out past the lens as the next room
// comes. Then the near miss everyone makes — − 9 MONTHS: the right decade, a
// week or so out — crossed out too; and as it is, the hand COUNTS, properly:
// 266, 265 … each figure out of the vanishing point and struck through in
// red as it is used, brisk at first, a blizzard, slow for the last ones, 3 …
// 2 … 1; the months with them (FEB 14, JAN 31, DEC 31 with 1986 over it …)
// crossed off at their last days — through the answer's own rooms, room
// after room of its decade, faster and faster, the lens slowing to rest
// INSIDE the last as the count lands. The demo's run (14 · 02 · 1987):
//   1960s room   14 · 02 · 1987 − 26.6 YEARS   → 14 · 07 · 1960  ✗
//   2010s room   14 · 02 · 1987 + 266 MONTHS   → 14 · 04 · 2009  ✗
//   1960s room   14 · 02 · 1987 − 9 YEARS      → 14 · 02 · 1978  ✗
//   1990s room   14 · 02 · 1987 − 9 MONTHS     → 14 · 05 · 1986  ✗ (ten days out)
//   1990s rooms  266 … 1, MAY 31 − 7 = 24      → 24 · 05 · 1986
// THE SELECTION is a list — the passes (try, try, try, near, count), each its
// decade and its room's art (rooms.js DECADES: the decade's own art where
// there is one — a '70s' or '20s' art drops in by its key — else the site's
// rule on the year) — and the nest of rooms is made from it: each try's room
// taken as many times as fills the time it is meant to have (B.passEnd), the
// count's rooms the answer's, as many as the zoom reaches; the zoom's growth
// then solved so it comes to rest exactly inside the last.
//
// THE CONCEPTION, once. The last screen switches on as a tube does: a white
// line across its glass flaring out into THE BAND — the reference's
// white-hot seam right across the room, a warm glow round it, flecks along
// its edges, sprays of dots out of them — and ON it, in dark ink, the date
// (the working over the glass: MAY 31 − 7 = 24), ringed in red; the glass
// behind it fills with white; the swimmer swims into it; and the light comes
// out of it (sketch A's, log/lens.js `light`, lightAt here — swelling from
// the band's first light): shafts of the screen's own white, a warm
// sunburst, rings of light, the white blooming over the whole board and
// held, burning back to the chalk room; the colour carried out of the screen
// in a ring of warm light (log/fall.js `reveal`); and the date back on the
// screen, ringed, in the coloured room, to the end. (?inside=0: landing at
// the plate, strand's flash, the push in, as sketch's.)
//
// EXACT under the play: the count is 266 figures, one a day; each month
// crossed off at its last day; every birthday 1900–2099 checked against Date
// (leap years: 29 · 02 · 2000 → 08 · 06 · 1999; 03 · 11 · 1972 → 11 · 02 ·
// 1972, through FEB 29). The tries are real dates, the near miss always 7–10
// days early.
//
// Beats, in seconds (60; at = t / 60), the demo's at 1280 × 800 (the tries'
// own times come from their rooms on the zoom: S.slams):
//    0    – 22.3  strand's, unchanged (the title, the strand, the compile)
//   22.2          life; 22.2 – 23.6 the hand comes into the lines
//   22.5          the swim from rest; 22.6 – 25.2 the lens round behind it;
//                 25.6 – 28.4 onto the axis (the field of view settled by 29.8)
//   23.1 – 26.2   the rings sketched in; 24.2 – 27.2 the speed lines; 24 – 26
//                 the glint; the first room in it from ~24 (0.3 h at 29.1)
//   27.0 – 28.6   the slam: the birthday − 266 DAYS
//   28.75 – 32.1  try 1 (its room ×1); 32.0 – 35.1 try 2 (×3); 35.0 – 37.9
//                 try 3 (×2); 37.8 – 39.7 the near miss (×1)
//   39.8 – 51.3   THE COUNT, 266 → 1, through the answer's rooms (×11), the
//                 blizzard ~44 – 49; 30 – 50 the zoom 0.5 → 1.36 e-folds a s
//   50.6 – 53.6   the zoom easing to rest inside the last room; the speed
//                 lines staying on as focus lines, onto the last screen by
//                 ~52, brightening with the light to the hit
//   50.95 – 52.2  the band flaring across the room; 51.85 the date on it,
//                 ringed 52.45; 52.2 – 53.6 the glass filling white; the light
//                 swelling from 51.25; 51.8 – 53.7 the swimmer into the glass
//   53.7          the conception: the white blooms out of the screen, held to
//                 54.4, burnt out onto the chalk room by ~55; the date back on
//                 the screen from ~54.6
//   55.0 – 57.6   the colour carried out of the screen in a ring of light;
//                 the beams breathing, settling; 58.8 – 60 a fade; round
//
// GPU AND BOARD (sketch A's). Through the lens (log/lens.js) the board is a
// texture, and the hand's many lines are drawn on the GPU (log/gpu-ink.js),
// one instanced draw a layer: the RINGS under the board (it is clear where
// they show), the SPEED LINES, the DEBRIS and every lettered FIGURE (the
// tries, the count, the months, their red strikes, scribbles and rings, the
// band's flecks and sprays, the working) over it. What this variant adds is
// all of it there — a try is a few dozen polylines, a scribble one — except
// the band's white and glow (one fill and one gradient on the board, for
// ~2.5 s) and the date on it (dark ink: on the board, ~13 glyphs). The
// rooms stay chalk plates through the hand on the board, as sketch's. No
// canvas grain (the lens), no full-board fill a frame added.
//
// Live in the lab (no ?at=, not ?demo=1): the run waits at each question;
// the journey is worked out once a date (J), the swimmer once a spice.
// Pinned, ?demo=1, or in a reel: the scripted hand (14 · 02 · 1987, spice
// 7); ?birth=DDMMYYYY there plays another birthday's journey. ?decade=
// forces the room. Every frame a pure function of t and the hand (the boil's
// drawing is ⌊12 t⌋); the caches are of inputs and of constants.

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
import { makeAnswers, validDate } from './log/answer.js';
import { script } from './log/entry.js';
import { makeTerminal } from './log-dawn.js';
import { EPICYCLE } from './intro/epicycle.js';
import { makeBody, specOf } from './log/body.js';
import { caption, captionSize, CAPTION } from './log/caption.js';
import { grain } from './log/grain.js';
import { makeLens } from './log/lens.js';
import { makeGpuInk } from './log/gpu-ink.js';
import { flash as burnOut } from './log/flash.js';
import { makeFall, revealRing } from './log/sketch-one-fall.js';
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
import { letter, measure, scribble } from './log/sketch-one-hand.js';
import { GESTATION, DAYS, workingsOf, fmt } from './log/sketch-one-workings.js';

// A harness's layer timer (window.__prof: begin / mark(name) / end), a no-op
// without one: ?prof is not a switch, a profiling script defines it.
const prof = (n) => window.__prof?.mark(n);

export const meta = {
	title:
		'strand · sketch · one — one beat: the hand bad at maths through the decades, then the days counted down to the screen'
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
	// ── the journey (this variant's): ONE zoom from the swim to the rest ──
	conception: [22.6, 29.6], // the caption
	boil: [22.2, 23.6], // the hand comes into the lines
	swim: 22.5,
	behind: [22.6, 25.2], // the lens round behind the swimmer
	onAxis: [25.6, 28.4], // the lens down onto the tunnel's axis
	tunnel: [23.1, 26.2], // the rings sketched in, near to far
	lines: [24.2, 27.2], // the speed lines come
	glint: [24.0, 26.0], // the light at the end of it (the first glass, lit)
	premise: [27.0, 28.6], // the slam: the birthday − 266 DAYS, the sum the hand has
	// the hand's tries — three slips and the near miss — each over its rooms,
	// which are fitted to end about here (the slams' own times: S.slams)
	tries: [28.75, 40.4],
	passEnd: [32.0, 35.0, 37.7, 39.9],
	count: [40.2, 51.3], // … then 266 → 1, struck one by one (from as the near miss is crossed out)
	fall: [30.0, 53.6], // the fall's own lens from 30 (unseen: the same zoom, the same rooms)
	land: [50.6, 53.6], // the zoom easing to rest inside the last room
	screen: [50.95, 52.2], // THE BAND: the last screen switching on, a white-hot seam across the room
	screenFill: [52.2, 53.6], // … the glass behind it filling with white for the hit
	conceived: [51.85, 53.7], // the date ON the band in dark ink (ringed from 52.45), and kept
	colour: [53.62, 54.1], // the room's colour flooded under the flash (landing at the plate, ?inside=0)
	reveal: [55.0, 57.6], // … or carried out of the screen by the light (inside; see lightAt)
	aim: [51.8, 53.7], // the swimmer on into the last glass
	hit: 53.7, // the flash
	push: [53.8, 56.8], // the lens in on the last room, to near full size (?inside=0)
	out: [58.8, 60]
};

// THE FLASH: the band in the last screen blowing out — across the board's
// width in 0.06 s, then its height by 0.13 s — then strand's white
// (log/flash.js), held a moment and burning out to the room in its colours
// (B.colour) while the lens pushes in on it (B.push). `s` the seconds since
// the hit, `box` the last glass on the board.
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

// ── The arithmetic ────────────────────────────────────────────────────────────
// log/sketch-one-workings.js: the count back through the months (exact,
// checked against Date for every birthday 1900–2099), the hand's tries.

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
const INSIDE = 0.4; // the fall stops inside the last room (?inside=: this far into its glass)
const FILL = { w: 3.1, h: 1.15 }; // … where the room is this many boards wide, and at least this tall

// ── THE ZOOM: one, from the swim to the rest ─────────────────────────────────
// e-folds of the nose's distance to the tunnel's apex — and of the rooms'
// size, the same numbers (the fall's ζ read off them, log/sketch-one-fall.js
// `zoom`) — flown at a rate that starts from rest with the swim, gathers to
// `open` by 30 s, and then only ever GATHERS, by e^(growth · t) (eased in
// from 28 s), until the landing eases it to rest inside the last room over
// B.land. `growth` is solved for the nest the answer's passes make, so the
// rest is exactly at the last room's glass; its first guess (×2.8 in 20 s)
// fixes how many rooms that is. The first plate is `plateH` of the board at
// `plateAt` — a speck in the glint at ~27 s.
const ZOOM = {
	open: 0.5,
	from: 28,
	ease: 4,
	growth: Math.log(2.8) / 20,
	plateAt: 29.1,
	plateH: 0.3
};
const DT = 0.005;
// Where a pass ends: this far into its last room (ζ), the next room's plate
// filling the board; the slams' strikes and flights out by the same measure.
const PASS = { end: 0.86, strike: 0.38, out: 0.8 };

// ── The count ────────────────────────────────────────────────────────────────
// The 266 days struck one at a time over [t0, t1]: the rate (in figures a
// second) climbs from slow to a blizzard and comes down again for the last
// few, its log a smoothstep bump; T[j] is the second the j-th day is struck
// (the figure 267 − j), lead[j] how long before it the figure leaves the
// vanishing point, v[j] how fast it flies (e-folds a second), both from the
// pace there: the slow ones linger to be read.
function makeCount(t0, t1) {
	const N = 4000;
	// (brisk from the first figure — the hand has stopped guessing — and
	// slow for the last ones: 3 … 2 … 1)
	const lr0 = Math.log(8);
	const lrE = Math.log(3);
	const lr1 = Math.log(95);
	const bump = (u) => smooth(span(u, 0, 0.4)) * (1 - smooth(span(u, 0.82, 0.985)));
	const rate = (u) => Math.exp(lerp(u < 0.5 ? lr0 : lrE, lr1, bump(u)));
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
		const p = clamp01((Math.log(rate(u)) - lrE) / (lr1 - lrE));
		lead[j] = lerp(0.62, 0.26, p);
		v[j] = lerp(2.1, 4.6, p);
	}
	T[GESTATION + 1] = t1 + 1;
	return { T, lead, v, t0, t1 };
}

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
// (Settled to FOV_END before the fall's own lens takes over at B.fall[0].)
const fovAt = (t) =>
	t > B.swim
		? lerp(lerp(30, FOV_CHASE, smooth(span(t, B.swim, 25.0))), FOV_END, smooth(span(t, 26.4, 29.8)))
		: 30;

// ── The board's shape ────────────────────────────────────────────────────────
// A fixed vertical field of view crops the sides of a board narrower than it
// is tall (a phone held upright): there the lens keeps a square's width of
// the scene instead, k (px a unit at unit depth) set by min(h, w / AMIN) and
// the vertical field widened to match. A board as wide as it is tall or wider
// is the lens as it was. The fall fits its rooms to the board (log/fall.js:
// the plate min(0.62 h, 0.74 w / φ)); `plateQ` is that fit against the
// board's height, which the swimmer over the fall is scaled by.
const AMIN = 1;
const qOf = (w, h) => Math.min(1, w / (AMIN * h));
const kOf = (fov, w, h) => Math.min(h, w / AMIN) / 2 / Math.tan((fov * Math.PI) / 360);
const fovOf = (fov, w, h, s = qOf(w, h)) =>
	s >= 1 ? fov : (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) / s);
const plateQ = (w, h) => Math.min(1, (0.74 * w) / PHI / (0.62 * h));
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
	tag(board.ctx, board.w, board.h, 'flow-strand-sketch-one · loading the rooms');
	const [art] = await Promise.all([
		loadRooms({ chalk: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const answers = makeAnswers({ live, beats: EPICYCLE.beats });
	const ans = answers.answers;
	// ?birth=DDMMYYYY (pinned or ?demo=1): the journey for another birthday —
	// its tries, its rooms, its count, its date (the entry still types the
	// demo's).
	const birthQ = q.get('birth');
	const birth = !live && validDate(birthQ ?? '') ? birthQ : null;
	if (birth) ans.date = birth;
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
	// light; ?inside=0 lands at the plate and pushes in after the flash, as
	// it was.
	const inside = q.has('inside') ? clamp(Number(q.get('inside')) || 0, 0, 0.9) : INSIDE;
	// ?look=halo:0.2,grain:0 — the lens's numbers (log/lens.js LENS), to try.
	const look = Object.fromEntries(
		(q.get('look') ?? '')
			.split(',')
			.map((kv) => kv.split(':'))
			.filter(([k, v]) => k && v !== undefined && Number.isFinite(Number(v)))
			.map(([k, v]) => [k, Number(v)])
	);

	// ── What the answers settle (cached by the answers and the board) ────────
	// The swimmer; the workings (log/sketch-one-workings.js: the tries, the
	// near miss, the count — the PASSES, each in its decade's room); the nest
	// of rooms those passes make — each try's room taken as many times as
	// fills the time it is meant to have (B.passEnd), the count's rooms the
	// answer's, as many as the zoom reaches, the answer's last; the zoom
	// solved so that it comes to rest exactly inside the last room; and every
	// slam timed to its own rooms on that zoom.
	let S = null;
	let J = null; // the journey: by the date and the board only (not the spice)
	function settled(w, h) {
		const key = `${ans.date}|${ans.spice}|${w}|${h}|${forced}`;
		if (S && S.key === key) return S;
		const bases = basesOf(ans.date);
		const spec0 = specOf(ans);
		const probe = makeBody(spec0);
		const spec = specOf(ans, { section: codonSection(bases, probe.stations) });
		const body = makeBody(spec);
		S = { ...journeyOf(w, h), key, bases, spec, body };
		return S;
	}
	// (Live, the spice is dragged — a new swimmer every frame of it — and the
	// journey is the same: worked out once a date.)
	function journeyOf(w, h) {
		const key = `${ans.date}|${w}|${h}|${forced}`;
		if (J && J.key === key) return J;
		const decade = forced ?? decadeOfDate(ans.date);
		const work = workingsOf(ans.date, decade, DECADES);
		const fb = { fall: B.fall, land: B.land, colour: B.colour, push: B.push, swim: [-2, -1] };
		// The last room ends near full size, landing at its plate (?inside=0):
		// the lens pushed in on it after the flash, to 0.94 of the board's
		// height (an upright board crops its sides rather than leave it small).
		const fill = { h: 0.94, w: h > w ? 1.75 : 0.985 };
		// Each room's crossing, in e-folds, at this board (−log X: its glass's
		// size), read off a nest with every room in it once.
		const arts = [...new Set([...work.passes.map((p) => p.art), decade])];
		const pg = makeFall({
			art,
			order: [...arts, decade],
			beats: fb,
			zeta0: 0,
			inside: 0.5
		}).geometry(w, h);
		const logOf = {};
		pg.levels.forEach((lv, k) => {
			if (k < pg.L) logOf[lv.decade] = -Math.log(lv.X);
		});
		// Inside: how far into the last room's glass the lens stops — so the
		// room is FILL.w times the board's width (the monitor at the middle,
		// the lamp and the tower either side, the frame far past the edges)
		// and at least FILL.h times its height (no ground above or below it):
		// an upright phone goes deeper than a laptop. (?inside= fixes it.)
		let deep = inside;
		if (inside > 0 && !q.has('inside')) {
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
		// THE ZOOM (ZOOM, above) for a growth: its e-folds E(t) from the swim,
		// tabulated; λ(t) the fall's own e-folds (0 at the first plate at rest,
		// negative before: the plate ZOOM.plateH of the board at ZOOM.plateAt).
		const r0 = V_SWIM / Z_NOSE0;
		const T0 = B.swim;
		const N = Math.ceil((B.land[1] + 1 - T0) / DT);
		const lamPlate = Math.log((ZOOM.plateH * h) / pg.plate);
		const zoomOf = (growth) => {
			const E = new Float64Array(N + 1);
			const rate = (t) =>
				smooth(span(t, T0, T0 + 1.5)) *
				lerp(r0, ZOOM.open, smooth(span(t, 24.0, 30.0))) *
				Math.exp(growth * eased(t - ZOOM.from, ZOOM.ease)) *
				(1 - smooth(span(t, B.land[0], B.land[1])));
			for (let i = 1; i <= N; i++) {
				const ta = T0 + (i - 1) * DT;
				E[i] = E[i - 1] + 0.5 * DT * (rate(ta) + rate(ta + DT));
			}
			const at = (t) => {
				if (t <= T0) return 0;
				const f = (t - T0) / DT;
				const i = Math.min(N - 1, Math.floor(f));
				return lerp(E[i], E[i + 1], Math.min(1, f - i));
			};
			const off = at(ZOOM.plateAt) - lamPlate;
			const lam = (t) => at(t) - off;
			// the second λ is reached (the table's own inverse)
			const tOf = (L) => {
				const e = L + off;
				if (e <= 0) return T0;
				let lo = 0;
				let hi = N;
				while (hi - lo > 1) {
					const mid = (lo + hi) >> 1;
					if (E[mid] < e) lo = mid;
					else hi = mid;
				}
				const f = (e - E[lo]) / (E[hi] - E[lo] || 1);
				return T0 + (lo + clamp01(f)) * DT;
			};
			return { growth, at, lam, tOf, rate };
		};
		// λ at ζ, for an order of rooms (each level's crossing −log X).
		const lamOf = (order, zeta) => {
			const lg = (k) => logOf[order[Math.min(k, order.length - 1)]];
			if (zeta < 0) return zeta * lg(0);
			let e = 0;
			let k = 0;
			while (k + 1 <= zeta) e += lg(k++);
			return e + (zeta - k) * lg(k);
		};
		// The rooms for a zoom: each pass but the count takes rooms of its art
		// until it ends nearest its time; the count's rooms the answer's, as
		// many as bring the rest nearest the zoom's.
		const nestFor = (Z) => {
			const order = [];
			const span_ = [];
			const passes = work.passes;
			for (let p = 0; p < passes.length - 1; p++) {
				const k0 = order.length;
				let best = 1;
				let bestD = Infinity;
				for (let n = 1; n <= 6; n++) {
					const o = [...order, ...Array(n).fill(passes[p].art)];
					const d = Math.abs(Z.tOf(lamOf(o, k0 + n - 1 + PASS.end)) - B.passEnd[p]);
					if (d < bestD) {
						bestD = d;
						best = n;
					}
				}
				for (let n = 0; n < best; n++) order.push(passes[p].art);
				span_.push([k0, order.length - 1]);
			}
			const k0 = order.length;
			const want = Z.lam(B.land[1]);
			let best = 2;
			let bestD = Infinity;
			for (let n = 2; n <= 24; n++) {
				const o = [...order, ...Array(n).fill(decade)];
				const d = Math.abs(lamOf(o, o.length - 1 + deep) - want);
				if (d < bestD) {
					bestD = d;
					best = n;
				}
			}
			for (let n = 0; n < best; n++) order.push(decade);
			span_.push([k0, order.length - 1]);
			return { order, spans: span_ };
		};
		// The growth that brings the zoom to rest exactly at the nest's end.
		const solve = (order) => {
			const end = lamOf(order, order.length - 1 + deep);
			let lo = 0;
			let hi = 0.3;
			for (let i = 0; i < 40; i++) {
				const mid = (lo + hi) / 2;
				if (zoomOf(mid).lam(B.land[1]) < end) lo = mid;
				else hi = mid;
			}
			return zoomOf((lo + hi) / 2);
		};
		let Z = zoomOf(ZOOM.growth);
		let nest = nestFor(Z);
		Z = solve(nest.order);
		const again = nestFor(Z);
		if (again.order.join() !== nest.order.join()) {
			nest = again;
			Z = solve(nest.order);
		}
		const { order, spans } = nest;
		const fall = makeFall({
			art,
			order,
			beats: deep > 0 ? { ...fb, push: null } : fb,
			zeta0: 0,
			fill: deep > 0 ? null : fill,
			inside: deep,
			zoom: Z.lam
		});
		const geo = fall.geometry(w, h);
		// the second the lens is at ζ (into the nest)
		const tAt = (zeta) => Z.tOf(lamOf(order, zeta));
		const H = figH(w, h);
		const narrow = h > w;
		const slams = slamsOf(work, spans, tAt, narrow);
		// (the count's first figure out as the near miss is crossed out)
		const near = slams[slams.length - 1];
		const count = makeCount(
			Math.min(B.count[1] - 6, Math.max(near.at + 1.8, near.strike + 0.5)),
			B.count[1]
		);
		J = {
			key,
			decade,
			fall,
			geo,
			order,
			spans,
			deep,
			work,
			slams,
			count,
			zoom: Z,
			efolds: Z.at,
			lam: Z.lam,
			tAt
		};
		// The nearest ring as the tunnel is sketched in (the rings are drawn
		// in from it, near to far).
		const zL0 = Z_NOSE0 * Math.exp(-Z.at(B.tunnel[0])) + 60;
		J.iRef = Math.ceil(Math.log(Z_NOSE0 / (0.985 * zL0)) / TUN.step);
		// The conception date's size on the last screen (fitted to its glass
		// when it is known: see conceivedDate).
		J.dateSize = Math.min(0.06 * H, (0.84 * w) / measure(work.dateStr));
		return J;
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
		get zoom() {
			return S
				? {
						growth: S.zoom.growth,
						rooms: S.order,
						spans: S.spans,
						passes: S.work.passes.map((p) => `${p.kind} ${p.decade} ${p.art} ${fmt(p.date)}`)
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
		const s = g(zN) / g(Z_NOSE0);
		const turn = smooth(span(t, ...B.onAxis));
		const dir = norm([lerp(-1, DIR_C[0], turn), DIR_C[1] * turn, DIR_C[2] * turn]);
		// The lens rides the axis; the nose, once the lens is on it, a little
		// below and right of it (OFF, scaled with the body), so the apex —
		// the lit point, the result's full stop — shows just ahead of it.
		const axis = [X_APEX + zN, 0, 0];
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

	// ── The journey: the tunnel, the rooms in it, the figures ────────────────
	// The glint: the light the swimmer swims at, at the vanishing point — the
	// first glass, lit, and then every glass after it (they are nested about
	// that point) — coming up with the tunnel and a little warmer the deeper
	// it goes, until the last screen switches on round it.
	function glint(ctx, h, O, t) {
		const a = smooth(span(t, ...B.glint)) * (1 - smooth(span(t, B.screen[0], B.screen[0] + 0.5)));
		if (a <= 0.01) return;
		const e = smooth(span(t, 27, 51));
		const r = 0.07 * h * (0.6 + 0.4 * a) * (1 + 0.4 * e);
		glow(ctx, O[0], O[1], r, [255, 226, 180], (0.5 + 0.15 * e) * a);
		disc(ctx, O[0], O[1], 1.6 + 1.4 * a, { fill: '#fffaf0', alpha: 0.95 * a });
	}

	// The rings: circles along the cone, each sketched in (written round from
	// its start), never quite closed, its wobble and overshoot new each
	// drawing, the nearer ones gone over twice, as a sketch's are; bolder as
	// they near the lens; hidden behind the swimmer. The same cone all the way
	// down: in the fall the tunnel's lens flies on down it at the one zoom and
	// its picture is laid about the rooms' vanishing point (`shift`), under
	// the plates, so the rooms hang in the tunnel the swimmer came down; `fade`
	// lets them go as it lands.
	function rings(ink, t, w, h, cam, st, bo, shift = null, fade = 1) {
		const zL = cam.pos[0] - X_APEX;
		if (zL <= 0 || fade <= 0.01) return;
		const { k, step, umin } = TUN;
		const iLo = Math.ceil(Math.log(Z_NOSE0 / (0.985 * zL)) / step);
		const iHi = Math.floor(Math.log(Z_NOSE0 / (umin * zL)) / step);
		const sc = Math.sqrt(h / 800);
		const dx = shift ? shift[0] : 0;
		const dy = shift ? shift[1] : 0;
		for (let i = iLo; i <= iHi; i++) {
			const zi = Z_NOSE0 * Math.exp(-step * i);
			const u = zi / zL;
			const ti = B.tunnel[0] + 0.14 * Math.max(0, i - st.iRef);
			const upto = smooth(span(t, ti, ti + 0.5));
			if (upto <= 0) continue;
			const a =
				fade * lerp(0.16, 0.85, smooth(span(u, umin, 0.45))) * (1 - smooth(span(u, 0.88, 0.985)));
			if (a < 0.02) continue;
			const lw = lerp(0.7, 2.6, smooth(span(u, 0.04, 0.8))) * sc;
			const rho = k * zi;
			const x = X_APEX + zi;
			const at = (px, py) => {
				const q = cam.project([x, py, -px]);
				if (q[2] <= NEAR) return null;
				const X = q[0] + dx;
				const Y = q[1] + dy;
				return Z.hidden([X, Y, q[2]]) ? null : [X, Y];
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
			} else {
				// A long piece (a big ring near the lens) drawn freehand, not
				// ruled: cut to ~48 px, each cut off true by a pixel or so, new
				// each drawing.
				const q = run[run.length - 1];
				const d = q ? Math.hypot(p[0] - q[0], p[1] - q[1]) : 0;
				if (d > 72) {
					const m = Math.min(48, Math.ceil(d / 48));
					const nx = -(p[1] - q[1]) / d;
					const ny = (p[0] - q[0]) / d;
					const amp = 0.7 + 0.45 * lw;
					for (let c = 1; c < m; c++) {
						const u = c / m;
						const e = amp * noise1(c * 0.61 + i * 3.1, bo * 19 + i) * Math.sin(Math.PI * u);
						run.push([lerp(q[0], p[0], u) + e * nx, lerp(q[1], p[1], u) + e * ny]);
					}
				}
				run.push(p);
			}
			prev = s;
		}
		flush();
	}
	// Debris: dots and dashes streaming out from the vanishing point — or,
	// given a `seam` { W, hb } about it, out of that seam's two edges — each
	// on its own ray and pace, a new ray each time round.
	function debris(ctx, w, h, t, O, a, n, seam = null) {
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
			const ux = AX * Math.cos(th);
			const uy = Math.sin(th);
			let fx = O[0];
			let fy = O[1];
			if (seam) {
				fx += seam.W * (2 * rand(k, 604, c) - 1);
				fy += (uy >= 0 ? 1 : -1) * seam.hb;
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

	// The speed lines and the debris for this moment of the journey: ONE
	// rush, only building — more lines, brighter, more debris — from the
	// first try to the count's blizzard. As the lens comes to rest the debris
	// goes and the speed lines do NOT: they stay on as the anime's focus
	// lines, boiling on twos — carried from the vanishing point onto the last
	// screen as it switches on (`focus` { x, y, r }: its glass's centre, and
	// how far out they start, clear of it) and brightening with its light to
	// the hit, where they go into the white — so nothing lets go between the
	// count and the conception. (Once the rooms are in front of the lens, the
	// lines start further out, off the room's middle.)
	function rush(ctx, w, h, t, O, bo, focus = null) {
		const H = figH(w, h);
		const come = smooth(span(t, ...B.lines));
		const gone = 1 - smooth(span(t, B.hit - 0.12, B.hit + 0.08));
		const s = come * gone;
		if (s <= 0.004) return;
		const e = smooth(span(t, 28.5, 47));
		const r = smooth(span(t, 28.5, 32.5));
		const m = focus ? smooth(span(t, B.land[0] + 0.4, B.screen[0] + 1.0)) : 0;
		const swell = 1 + 0.7 * smooth(span(t, B.screen[0] + 0.6, B.hit));
		const rIn0 = (u) => (lerp(0.13, 0.28, r) + lerp(0.32, 0.36, r) * u) * H;
		speedLines(ctx, {
			ox: m ? lerp(O[0], focus.x, m) : O[0],
			oy: m ? lerp(O[1], focus.y, m) : O[1],
			w,
			h,
			n: Math.round((56 + 46 * e) * s),
			seed: bo,
			rIn: m ? (u) => lerp(rIn0(u), focus.r * (1 + 0.5 * u), m) : rIn0,
			width: 1.7 * Math.sqrt(h / 800),
			alpha: (0.26 + 0.14 * e) * s * lerp(1, swell, m),
			color: HAND.ink,
			aspect: spreadX(w, h),
			gpu: gOver
		});
		prof('speedlines');
		const d = 1 - smooth(span(t, B.land[0] + 0.2, B.land[0] + 1.8));
		debris(ctx, w, h, t, O, 0.75 * s * d, Math.round((60 + 45 * e) * s * d));
		prof('debris');
	}

	// ── The figures ──────────────────────────────────────────────────────────
	// Where a flyer leaving along `th` is: out of the vanishing point on its
	// ray, its distance r (wider than tall on a wide board).
	function flyerAt(O, w, h, th, r) {
		const AX = spreadX(w, h);
		return [O[0] + AX * r * Math.cos(th), O[1] + r * Math.sin(th)];
	}
	// The count: 266 … 1, each figure out of the vanishing point and struck
	// through in red at its second.
	function countdown(ink, w, h, t, O, st, bo) {
		const C = st.count;
		if (t < C.t0 - 1 || t > C.t1 + 1.6) return;
		const H = figH(w, h);
		const R = 0.7 * Math.hypot(w, h);
		for (let j = 1; j <= GESTATION; j++) {
			const ts = C.T[j];
			const s0 = ts - C.lead[j];
			if (t < s0) break;
			const tau = t - s0;
			const r = 0.016 * H * Math.exp(C.v[j] * tau);
			if (r > R) continue;
			const th = TAU * rand(j, 11);
			const [x, y] = flyerAt(O, w, h, th, r);
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
	// The months, out on the golden angle, each its name and the days it
	// gives, crossed off at its last day (the year over the month it turns
	// at). Each reaches 0.2 of the board out as it is struck.
	function months(ink, w, h, t, O, st, bo) {
		const rows = st.work.rows;
		const C = st.count;
		const H = figH(w, h);
		const R = 0.7 * Math.hypot(w, h);
		const GOLDEN = Math.PI * (3 - Math.sqrt(5));
		for (let r = 0; r < rows.length; r++) {
			const row = rows[r];
			const t0 = C.T[row.j0] - 0.3;
			const t1 = C.T[row.j1];
			if (t < t0) break;
			const r0 = 0.05 * H;
			const v = clamp(Math.log(0.2 / 0.05) / Math.max(0.2, t1 - t0), 0.7, 2.4);
			const rad = r0 * Math.exp(v * (t - t0));
			if (rad > R) continue;
			const th = -0.6 + r * GOLDEN;
			const [x, y] = flyerAt(O, w, h, th, rad);
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
	// marks: [{ from, to, at, kind: 'strike' | 'scribble' | 'circle' }] }
	// (glyph indices).
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
				const len = mk.kind === 'circle' ? 0.35 : mk.kind === 'scribble' ? 0.3 : 0.08;
				const kk = span(t, mk.at, mk.at + len);
				if (kk <= 0) continue;
				const c = box.cells.slice(mk.from, mk.to + 1);
				const bx = [
					Math.min(...c.map((q) => q[0])),
					Math.min(...c.map((q) => q[1])),
					Math.max(...c.map((q) => q[2])),
					Math.max(...c.map((q) => q[3]))
				];
				const o = { seed: sl.seed + i * 7 + mk.from, boil: bo, alpha: a };
				if (mk.kind === 'circle') circleMark(ink, bx, kk, o);
				else if (mk.kind === 'scribble') scribble(ink, bx, kk, o);
				else strike(ink, bx, kk, o);
			}
		});
	}
	// THE CONCEPTION DATE, once: on the last screen. The last month's working
	// over the glass as its days are counted (MAY 31 − 7, then = 24 as the
	// count lands); then the date lettered ON the white of the screen in dark
	// ink, as the band opens in it, and ringed in red; the swimmer goes into
	// it. `G` the last glass on the board.
	function conceivedDate(inkD, ink, t, w, h, G, st, bo) {
		const W = st.work;
		const C = st.count;
		const tw = C.T[W.lastJ0] - 0.35;
		if (t < tw || !G) return;
		const H = figH(w, h);
		const gx = (G[0] + G[2]) / 2;
		const gy = (G[1] + G[3]) / 2;
		const gh = G[3] - G[1];
		// (gone into the white with the swimmer; the date back on the screen
		// as the white burns out, and kept there)
		const a = 1 - smooth(span(t, B.hit - 0.1, B.hit + 0.15));
		const aD = Math.max(a, smooth(span(t, B.hit + 0.9, B.hit + 1.9)));
		if (aD <= 0.01) return;
		const ws = Math.min(0.036 * H, (0.8 * w) / measure(`${W.working} ${W.landed}`), 0.3 * gh);
		const wy = Math.max(1.2 * ws, G[1] - 0.45 * ws - 0.02 * H);
		const head = letter(ink, W.working, gx - 0.1 * ws, wy, ws, {
			align: 'right',
			seed: 880,
			boil: bo,
			alpha: a * smooth(span(t, tw, tw + 0.25)),
			width: 0.12,
			upto: smooth(span(t, tw, tw + 0.3))
		});
		const tl = C.T[GESTATION] + 0.1;
		if (t > tl && a > 0.01)
			letter(ink, W.landed, head.x1 + 0.3 * ws, wy, ws, {
				align: 'left',
				seed: 881,
				boil: bo,
				alpha: a,
				width: 0.12,
				upto: smooth(span(t, tl, tl + 0.25))
			});
		const c0 = B.conceived[0];
		if (t < c0) return;
		const size = dateSizeIn(G, st);
		const box = letter(inkD, W.dateStr, gx, gy + 0.5 * size, size, {
			seed: 900,
			boil: bo,
			alpha: aD,
			width: 0.12,
			color: '#1d1612',
			keyed: false,
			upto: smooth(span(t, c0, c0 + 0.45))
		});
		circleMark(inkD, [box.x0, box.y0, box.x1, box.y1], span(t, c0 + 0.6, c0 + 1.0), {
			seed: 901,
			boil: bo,
			alpha: aD,
			pad: 0.42
		});
	}
	// Everything flying over the journey at t.
	function figures(ink, w, h, t, O, st, bo) {
		for (const sl of st.slams) slam(ink, t, w, h, O, bo, sl);
		months(ink, w, h, t, O, st, bo);
		countdown(ink, w, h, t, O, st, bo);
	}

	// The last screen: a white line across the glass opening to fill it, the
	// tube switched on, glowing out over the room.
	function screenBand(ctx, box, k, bo) {
		if (k <= 0) return;
		const [x0, y0, x1, y1] = box;
		const gw = x1 - x0;
		const gh = y1 - y0;
		const cx = (x0 + x1) / 2;
		const cy = (y0 + y1) / 2;
		const hb = lerp(1, gh / 2, Math.pow(k, 1.7));
		glow(ctx, cx, cy, 0.9 * gw + 2 * hb, [255, 232, 200], 0.55 * smooth(k));
		ctx.save();
		ctx.beginPath();
		ctx.rect(x0, y0, gw, gh);
		ctx.clip();
		ctx.globalAlpha = 0.6 + 0.4 * k;
		ctx.fillStyle = '#fffdf8';
		ctx.beginPath();
		const n = 16;
		for (let i = 0; i <= n; i++) {
			const x = lerp(x0 - 2, x1 + 2, i / n);
			const y = cy - hb - 0.8 * noise1(i * 0.7, bo * 5 + 1);
			if (i) ctx.lineTo(x, y);
			else ctx.moveTo(x, y);
		}
		for (let i = n; i >= 0; i--) {
			const x = lerp(x0 - 2, x1 + 2, i / n);
			ctx.lineTo(x, cy + hb + 0.8 * noise1(i * 0.7 + 4, bo * 5 + 2));
		}
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	// The conception date's size: fitted to the last glass, the band holding
	// it (its half-height 0.82 of it).
	const dateSizeIn = (G, st) =>
		Math.min(st.dateSize, (0.84 * (G[2] - G[0])) / measure(st.work.dateStr), 0.3 * (G[3] - G[1]));
	// The band's centre, half-width and half-height at t (`G` the last glass):
	// a line across the glass flaring out past it, thickening to carry the
	// date.
	function bandOf(G, t, w, st) {
		const k = span(t, ...B.screen);
		const gw = G[2] - G[0];
		const flare = smooth(span(k, 0, 0.45));
		const thick = smooth(span(k, 0.3, 0.85));
		return {
			x: (G[0] + G[2]) / 2,
			y: (G[1] + G[3]) / 2,
			W: lerp(0.5 * gw, 0.8 * w + 0.5 * gw, Math.pow(flare, 0.8)),
			hb: lerp(1.2, 0.82 * dateSizeIn(G, st), thick)
		};
	}
	// THE BAND, once, at the end: the last screen switching on as a tube
	// does — a white line across its glass flaring out past it into a seam of
	// white-hot light right across the room (the reference's band), tapering
	// to its ends, thickening to carry the date; a warm glow round it, flecks
	// along its edges and sprays of dots flying out of them (the swimmer goes
	// into it at the glass); gone into the white at the hit. Over B.screen;
	// `G` the last glass on the board.
	function endBand(ctx, ink, w, h, G, t, bo, st) {
		const k = span(t, ...B.screen);
		const gone = 1 - smooth(span(t, B.hit - 0.05, B.hit + 0.3));
		if (k <= 0 || gone <= 0.01 || !G) return;
		const { x: cx, y: cy, W, hb } = bandOf(G, t, w, st);
		const hot = smooth(span(k, 0.15, 1)) * gone;
		// the glow, warm, additive
		const Gl = (0.04 + 0.1 * hot) * h;
		const a = (0.25 + 0.5 * hot) * gone;
		if (a > 0.005) {
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			const rx = W + 1.2 * Gl;
			const ry = hb + Gl;
			ctx.translate(cx, cy);
			ctx.scale(rx / ry, 1);
			const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
			const s1 = clamp(hb / ry, 0.01, 0.9);
			const s2 = clamp((hb + 0.3 * Gl) / ry, s1 + 0.01, 0.97);
			g.addColorStop(0, `rgba(255, 242, 220, ${a})`);
			g.addColorStop(s1, `rgba(255, 232, 200, ${0.85 * a})`);
			g.addColorStop(s2, `rgba(255, 196, 140, ${0.22 * a})`);
			g.addColorStop(1, 'rgba(255, 180, 120, 0)');
			ctx.fillStyle = g;
			ctx.fillRect(-ry, -ry, 2 * ry, 2 * ry);
			ctx.restore();
		}
		// the white: its two edges by hand, re-drawn each drawing
		const xa = Math.max(cx - W, -24);
		const xb = Math.min(cx + W, w + 24);
		const n = 44;
		const jit = 0.8 + 0.02 * Math.min(hb, 0.1 * h);
		const edge = (x, sg) => {
			const u = (x - cx) / W;
			const prof = Math.sqrt(Math.max(0, 1 - u * u));
			return cy + sg * (hb * prof + jit * noise1(x / 38 + (sg > 0 ? 9.3 : 0), bo * 7 + 3));
		};
		ctx.save();
		ctx.globalAlpha = (0.8 + 0.2 * hot) * gone;
		ctx.fillStyle = '#fffdf8';
		ctx.beginPath();
		for (let i = 0; i <= n; i++) {
			const x = lerp(xa, xb, i / n);
			if (i) ctx.lineTo(x, edge(x, -1));
			else ctx.moveTo(x, edge(x, -1));
		}
		for (let i = n; i >= 0; i--) {
			const x = lerp(xa, xb, i / n);
			ctx.lineTo(x, edge(x, 1));
		}
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		// flecks along its edges: little white squiggles off the seam
		const fl = smooth(span(k, 0.35, 0.9)) * gone;
		if (fl > 0.02) {
			const m = Math.round(14 + (10 * w) / 1280);
			for (let i = 0; i < 2 * m; i++) {
				const sg = i < m ? -1 : 1;
				const x = cx + Math.min(W, 0.55 * w) * (2 * rand(i, bo, 41) - 1);
				const off = hb + (2 + 6 * rand(i, bo, 42)) * (h / 800);
				const len = (8 + 26 * rand(i, bo, 43)) * (h / 800);
				const pts = [];
				for (let j = 0; j <= 4; j++) {
					const u = j / 4;
					pts.push([x + (u - 0.5) * len, cy + sg * (off + 1.6 * Math.sin(u * 6 + i))]);
				}
				ink.line(pts, HAND.ink, 1.1 * Math.sqrt(h / 800), 0.8 * fl, false);
			}
		}
		// sprays of dots out of its edges
		const sp = smooth(span(k, 0.2, 0.7)) * gone;
		if (sp > 0.02)
			debris(ctx, w, h, t, [cx, cy], 0.8 * sp, Math.round(70 * sp), {
				W: Math.min(W, 0.55 * w),
				hb
			});
	}

	// ── The conception's light ───────────────────────────────────────────────
	// Out of the last screen once the lens is at rest inside the room (the
	// fall lands `inside` it, log/fall.js): the screen already lit by the band
	// (screenBand), the swimmer swimming into it. The light is MADE of what is
	// there (log/lens.js `light`): its shafts are the picture's own brights —
	// the screen — smeared out along its rays, so the room's lines shadow them;
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
		// (swelling from the band's first light to the hit)
		const pre = smooth(span(t, B.screen[0] + 0.3, H));
		const HOLD = H + 0.7; // the white held from the bloom to here
		const after = Math.max(0, t - HOLD); // since it began to burn out
		const breath = 1 + 0.12 * Math.sin((TAU * (t - H)) / 2.3);
		const out = 1 - smooth(span(t, ...B.out));
		const rise = smooth(span(t, H - 0.05, H + 0.35));
		const rays =
			(t < HOLD
				? lerp(0.45 * pre * pre, 1, rise)
				: (0.18 + 0.55 * Math.exp(-after / 1.8)) * breath) * out;
		const core = (t < HOLD ? lerp(0.3 * pre, 1, rise) : 0.12 + 0.55 * Math.exp(-after / 0.9)) * out;
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
			window.__lab.st = S; // the settled run, for a probing script
		}
		if (t < FREEZE) {
			entry.reset();
			TERM.draw(ctx, w, h, t / 10, t, t - 10);
			tag(ctx, w, h, 'flow-strand-sketch-one');
			fuzz(ctx, w, h, secs, t);
			window.__prof?.end();
			return;
		}
		if (live) remember(hand, t);
		if (birth) ans.date = birth;
		const st = settled(w, h);
		lastGlass = null;
		if (t < B.fall[0]) world(ctx, w, h, t, hand, st);
		else fallen(ctx, w, h, t, st);
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
		// The end: on the board as it was, or (with the lens) the conception's
		// light out of the last screen, on the GPU (lightAt).
		if (!lens || !(inside > 0)) flash(ctx, w, h, t - B.hit, lastGlass);
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
		tag(ctx, w, h, 'flow-strand-sketch-one');
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
				light: lens && inside > 0 ? lightAt(t, w, h) : null,
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
	// THE FIRST ROOM, AT THE END OF THE TUNNEL. The fall is there from the
	// start: its ζ is read off the one zoom (λ, negative before the first
	// plate is at rest), so its first plate hangs at the vanishing point at
	// the zoom the tunnel is flying and grows at the tunnel's rate — a speck
	// in the glint at ~27 s, ZOOM.plateH of the board as the first try pops —
	// laid about the tunnel's own vanishing point while the lens is still
	// coming onto the axis.
	function firstRoom(ctx, w, h, t, st, O, bo) {
		const lam = st.lam(t);
		if (st.geo.plate * Math.exp(Math.min(0, lam)) < 2.5) return;
		ctx.save();
		ctx.translate(O[0] - w / 2, O[1] - h / 2);
		st.fall.draw(roomPen(O, lam, bo), w, h, t, { colourAlong: false, dust: null });
		ctx.restore();
	}

	// From the stop's glide to the fall: one world.
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

		// ── The tunnel: the rings, the speed lines, the debris ──
		const sw = t > B.swim ? swimAt(t, st) : null;
		const shape = shapeAt(t, st);
		const pose = sw
			? { at: sw.nose, dir: sw.dir, up: [0, 0, 1], scale: sw.s }
			: { at: [0, 0, 0], dir: [-1, 0, 0], up: [0, 0, 1], scale: 1 };
		const journey = t > B.tunnel[0] - 0.1;
		const O = journey ? cam.project([X_APEX, 0, 0]) : null;
		Z.reset(w, h);
		if (journey && O[2] > NEAR) {
			body.fillDepth(Z, cam, shape, pose);
			prof('depth');
			const ink = inkFor(gUnder);
			rings(ink, t, w, h, cam, st, bo);
			ink.flush(ctx);
			prof('rings');
			firstRoom(ctx, w, h, t, st, O, bo);
			glint(ctx, h, O, t);
			prof('rooms');
			rush(ctx, w, h, t, O, bo);
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
			body.draw(swimmerHand(ctx, t, bo), cam, shape, pose, {
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
		prof('strand+body');
		// The reading frame.
		const fa =
			smooth(span(t, B.read[0] - 0.3, B.read[0] + 0.1)) *
			(1 - smooth(span(t, B.read[1] - 0.1, B.read[1] + 0.4)));
		if (fa > 0.004) drawFrame(ctx, cam, xf, fa, st);

		// ── The figures over all ──
		if (journey && O[2] > NEAR) {
			const ink = inkFor(gOver);
			prof('frame');
			figures(ink, w, h, t, O, st, bo);
			ink.flush(ctx);
			prof('figures');
		}

		// ── The questions ──
		const asked = 1 - smooth(span(t, ...B.asked));
		if (asked > 0.004) entry.questions(ctx, w, h, t, hand, asked);
		prof('questions');
	}

	// The fall: the rooms in the hand, in the tunnel's rings, the swimmer
	// leading the lens at the vanishing point, the workings flying over them;
	// the last screen switching on with the date on it; the flash. From
	// B.fall[0] the fall's own lens (its vanishing point sways a little) —
	// the same picture as the tunnel's lens at that moment: the same zoom,
	// the same rings, the swimmer the chase's own.
	function fallen(ctx, w, h, t, st) {
		const g = st.geo;
		const lam = st.lam(t);
		const bo = boilOf(t);
		// The boil eases off the coloured room after the flash.
		const calm = lerp(1, 0.3, smooth(span(t, B.hit + 0.5, B.hit + 3.5)));
		// The vanishing point: the fall's own, its lens's sway (sketch-one-fall.js
		// lensAt).
		const A = lerp(
			lerp(0, 0.05, span(t, B.fall[0], B.fall[0] + 2)),
			0.3,
			smooth(span(t, B.land[0], B.land[1] + 0.5))
		);
		const O = [
			w / 2 + (g.F * A * Math.sin(1.1 * t - 0.4)) / g.d0,
			h / 2 - (g.F * A * 0.45 * Math.sin(1.7 * t + 0.6)) / g.d0
		];
		// The tunnel's rings going on round the rooms, under them: its lens
		// flying on down the cone at the one zoom, its picture laid about the
		// rooms' vanishing point; let go as it lands.
		const fade = 1 - smooth(span(t, B.land[0] - 0.2, B.land[0] + 1.4));
		if (fade > 0.01) {
			const camT = lensAt(t, w, h, st);
			const Ot = camT.project([X_APEX, 0, 0]);
			Z.reset(w, h);
			const ink = inkFor(gUnder);
			rings(ink, t, w, h, camT, st, bo, [O[0] - Ot[0], O[1] - Ot[1]], fade);
			ink.flush(ctx);
		}
		prof('rings');
		const cam = st.fall.draw(roomPen(O, lam, bo, calm), w, h, t, {
			colourAlong: false,
			dust: null,
			// inside, the colour carried out of the screen by the light: a
			// hand-drawn ring spreading from the glass, chalk outside it
			reveal: lens && inside > 0 ? (G) => revealAt(t, w, h, G, bo) : null
		});
		// The colour's front: a ring of warm light, hand-drawn, boiling (the
		// tunnel's rings come back as the light's), over the edge it carries.
		if (lens && inside > 0 && cam.glass && gOver) {
			const rv = revealAt(t, w, h, cam.glass, bo);
			const k = span(t, ...B.reveal);
			const a = rv ? smooth(span(k, 0, 0.12)) * (1 - smooth(span(k, 0.7, 1))) : 0;
			if (a > 0.01) {
				const ring = inkFor(gOver);
				const C = { cx: (cam.glass[0] + cam.glass[2]) / 2, cy: (cam.glass[1] + cam.glass[3]) / 2 };
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
		glint(ctx, h, [cam.ox, cam.oy], t);
		prof('rooms');

		// The swimmer, the chase's own picture, at the vanishing point; on into
		// the last glass as the lens lands.
		const aim = smooth(span(t, ...B.aim));
		let gx = cam.ox;
		let gy = cam.oy;
		if (cam.glass) {
			gx = (cam.glass[0] + cam.glass[2]) / 2;
			gy = (cam.glass[1] + cam.glass[3]) / 2;
			lastGlass = cam.glass;
		}
		const alpha = 1 - smooth(span(t, B.hit - 0.15, B.hit));
		if (alpha > 0.01) {
			const drop = smooth(span(t, B.fall[0] + 0.5, B.fall[0] + 4));
			const back = lerp(1, 1.6, drop) * lerp(1, 2.6, aim * aim);
			// The chase's own lens at the seam, then scaled with the rooms as
			// the fall has fitted them to the board (1 on a desktop).
			const view = camera3({
				pos: [D_C * back, 0, 0],
				target: [-1000, 0, 0],
				up: [0, 1, 0],
				fov: fovOf(FOV_END, w, h, lerp(qOf(w, h), plateQ(w, h), drop)),
				w,
				h
			});
			const shape = shapeAt(t, st);
			// The chase's offset off the axis, given up as the first glass
			// opens round the vanishing point, so the nose goes into it.
			const off = mul3(OFF, 1 - smooth(span(t, B.fall[0] + 0.6, B.fall[0] + 2.6)));
			const pose = { at: off, dir: DIR_C, up: [0, 0, 1], scale: 1 };
			const hd = swimmerHand(ctx, t, bo);
			ctx.save();
			ctx.translate(lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2);
			ctx.globalAlpha = alpha;
			st.body.draw(hd, view, shape, pose, { back: 0 });
			ctx.restore();
		}
		prof('strand+body');

		// The speed lines over it; the last screen switched on, the date on it;
		// the figures over all.
		const ink = inkFor(gOver);
		rush(
			ctx,
			w,
			h,
			t,
			O,
			bo,
			cam.glass
				? {
						x: (cam.glass[0] + cam.glass[2]) / 2,
						y: (cam.glass[1] + cam.glass[3]) / 2,
						r: 0.55 * Math.hypot(cam.glass[2] - cam.glass[0], cam.glass[3] - cam.glass[1])
					}
				: null
		);
		if (cam.glass) {
			screenBand(ctx, cam.glass, smooth(span(t, ...B.screenFill)), bo);
			endBand(ctx, ink, w, h, cam.glass, t, bo, st);
		}
		prof('band');
		const inkD = makeInk();
		conceivedDate(inkD, ink, t, w, h, cam.glass, st, bo);
		inkD.flush(ctx);
		prof('date');
		figures(ink, w, h, t, O, st, bo);
		ink.flush(ctx);
		prof('figures');
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

// ── The hand's tries, laid out ───────────────────────────────────────────────
// The premise — the sum the hand has, the birthday − 266 DAYS — and for each
// try and the near miss a slam over its own rooms (`spans`: the first and
// last room of each pass; `tAt(ζ)` the second the lens is at ζ): the sum as
// the hand writes it, the birthday and its slip (− 26.6 YEARS), and the date
// it makes of it, big; popping out of the vanishing point as the pass
// begins, the date SCRIBBLED OUT in red and the slip struck as the lens goes
// into the pass's last glass, flown out past the lens as the next room comes
// up and the next try pops. Below the vanishing point, then above, then
// below — the swimmer between. `narrow` (a board taller than it is wide):
// the sum in two lines.
function slamsOf(work, spans, tAt, narrow) {
	const b = work.birth;
	const out = [
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
		}
	];
	let prev = B.tries[0];
	work.passes.forEach((p, i) => {
		if (p.kind === 'count') return;
		const [, k1] = spans[i];
		const at = prev;
		let strikeT = tAt(k1 + PASS.strike);
		let outT = tAt(k1 + PASS.out);
		// read first: the date whole for ~0.7 s before it is crossed out
		if (strikeT < at + 1.5) strikeT = at + 1.5;
		// (the near miss, shorter: the count is the answer's rooms too, and
		// comes in under it)
		if (p.kind === 'near') {
			strikeT = Math.min(strikeT, at + 2.2);
			outT = Math.min(outT, strikeT + 0.6);
		}
		if (outT < strikeT + 0.45) outT = strikeT + 0.45;
		const ds = fmt(p.date);
		const date = {
			s: ds,
			size: 0.072,
			write: [at + 0.45, at + 0.85],
			marks: [{ from: 0, to: ds.length - 1, at: strikeT, kind: 'scribble' }]
		};
		const op = p.lines[1];
		const lines = narrow
			? [
					{ s: p.lines[0], size: 0.034, write: [at + 0.08, at + 0.35] },
					{
						s: op,
						size: 0.04,
						write: [at + 0.25, at + 0.5],
						marks: [{ from: 2, to: op.length - 1, at: strikeT + 0.2, kind: 'strike' }]
					},
					date
				]
			: [
					{
						s: p.work,
						size: 0.04,
						write: [at + 0.08, at + 0.5],
						marks: [
							{
								from: p.lines[0].length + 3,
								to: p.work.length - 1,
								at: strikeT + 0.2,
								kind: 'strike'
							}
						]
					},
					date
				];
		out.push({
			at,
			out: outT,
			strike: strikeT,
			x: 0,
			y: i % 2 ? -0.27 : 0.25,
			seed: 200 + 50 * i,
			lines
		});
		prev = outT - 0.12;
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
