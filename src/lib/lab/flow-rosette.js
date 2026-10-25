// ── Flow: flow-rosette — the date's rosette is the body's section ────────────
// The most literal answer: the figure the person draws with their answers
// IS their swimmer's grain. The entry is intro/epicycle.js itself (drawn as
// it is, `keep: true`): the card typed centred, frozen at its stop, gone
// before the first question; each digit typed an arm hung from the stop, the
// spice the rosette's n-fold symmetry — the figure kept up, arms turning.
//
// COMPILING USER GENETICS. The questions go; the figure is taken into the
// world unchanged (the lens set so it sits on the board at its own size, the
// stop on the pivot) and TILTS BACK out of the board's plane as the lens
// rises over it, so its plane stands square to the body's axis; the arms
// fade, the stop becomes the axis, and the figure eases into the section of
// the head's fifth ring. Then the RINGS are written round one after another
// like compass circles, nose → tip (log/body.js `rings`): each the rosette
// (rosetteSection, amount 0.4 — a flower: n ridges down the head and the
// midpiece) at its station's (a, b), the head's flattened, the tail's a
// shrinking round thread; then the generatrices joined through them, one by
// one, and the contour bold, the lens stepping back along the body and
// round to its side.
//
// SIMULATING CONCEPTION. A spark at the midpiece, the beat and the roll come
// in, and it swims off across the face of draft's golden-angle disc (phyllo
// .js), seeded AHEAD of it rim to centre — the rim written round from its
// foot (the point nearest the swimmer) both ways, the seeds at the golden
// angle, the 8- and 13-parastichies written in, the apex lit — big and
// oblique in a wide lens, the lens chasing over the swimmer's back. It turns
// onto the disc's axis and the lens swings onto it behind (narrowing again):
// the disc full screen. Then it OPENS: the seeds slide out along their sight
// lines (phyllo's exact opening) and the depth law eases into the log map as
// the lens follows the swimmer in — the disc was the tunnel's far view all
// along, the seeds on its wall, the parastichies helices. The tunnel turns
// slowly; the apex's light, now the far point's, goes as the years come.
// Behind everything, a dim star field in three depths, streaming out of the
// flight's axis at three rates, streaking a little with the pace.
//
// THE YEARS (the interim: travelling back through time on the lattice
// itself). Down the tunnel the seed rings become years: 2026 at the mouth,
// counted back to the birth year, each year a ring round the wall m seeds on
// from the last (m the Fibonacci number that lays the years over ~8 e-folds,
// so their numerals climb one m-spiral of the lattice), written small on
// the wall in its own perspective, the decades bolder; rushing past, then
// slowing as the birth year comes — its ring and numeral gold, stood
// upright. Then the DAYS: 266 back to conception, a seed each, smaller and
// faster, while the wall leans in from a cylinder into a funnel (every cell
// still the square it was on the disc) — day 0 a fine gold ring round it —
// down to its far point, lit as the last day goes.
// The far point opens: a hole the size of the first room's glass at the
// fall's start, the board through it, a soft light — and the fall takes the
// lens at the funnel's own zoom (its pace is GAMMA × the tunnel's).
//
// THE FALL. log/fall.js: the first room comes up round that glass, the
// chalk rooms through one another down to the decade's (decadeOfDate), the
// funnel streaming on as the fall's background through every glass. The 3D
// body leads at the vanishing point, then into the last room's monitor;
// the splash on its screen (log/splash.js, the spice), the room held, a
// fade, round.
//
// The answers ↔ the body: specOf({ date, spice }, { section }) — the digits
// set the head, the midpiece, the tail, the wave, the helicity; the spice the
// beat and the roll; and the date's rosette (arm k's length d_k·share_k, its
// frequency 1 + n s_k) is the section of every ring to the end of the
// midpiece: n ridges, their lobes the digits' weights. The year sets the
// years counted down the tunnel and the room; the spice the splash.
//
// Beats (seconds; 61 s; at = t / 61):
//    0    – 6.4    the card (the intro's); the stop to the pivot by 6.8
//    6.8  – 14.4   the date by hand (q1 6.8, wait 7.6, Enter 9.8) and the
//                  spice (q2 11.6, wait 12.4, Enter 14.4)
//   15.1  – 16.1   the questions go; 16.2 the figure taken into the world
//   15.9  – 22.9   COMPILING USER GENETICS: tilt 16.2–17.9, into the head's
//                  ring 16.5–17.8, rings 17.8–21.0 (head, neck and midpiece,
//                  tail), generatrices 20.8–22.0, contour 21.7–22.5
//   22.1  – 24.2   the lens swings off the body onto the chase
//   22.9  – 33.4   SIMULATING CONCEPTION: the spark 22.9, swims 23.0; the
//                  rim 23.5–24.5, the seeds 23.9–26.9, the spirals 26.7–28.4;
//                  onto the axis 28.2–30.4; the opening 30.5–31.9; the log
//                  map 31.7–33.5; the tunnel turns from 32.0
//   33.5  – 42.4   the years from 2026 (their numerals in by 34.0); the
//                  birth year slowest at 37.8; the days to 0 by 41.0; the far
//                  point opens
//   42.4  – 53.7   the fall (the first room up round the glass by 43.3),
//                  the landing 51.6–53.6, the swimmer into the monitor
//   53.7  – 61     the splash; the room held; fade 59.3–60.9
//
// ?amount= the rosette's share of the section (0…1, default 0.4); ?decade=
// forces the room. Every frame a pure function of t and the hand: the only
// caches are of inputs (the person's body by their answers, the plan by the
// answers, the decade and the board's size). The lab copies `info` once, at
// mount, so the moment and the room are also written to window.__lab each
// frame (t, decade) for the test scripts.

import {
	getBoard,
	clearBoard,
	clock,
	tag,
	camera3,
	disc,
	stroke,
	PAL,
	TAU,
	PHI,
	TECH_FONT,
	span,
	smooth,
	lerp,
	clamp01,
	add3,
	sub3,
	mul3,
	cross,
	norm
} from './log/board.js';
import { NEAR, makeDepth, lit3, spline } from './log/space.js';
import { glow, lit } from './log/ink.js';
import { makeBody, specOf, rosetteSection } from './log/body.js';
import { PHYLLO, seeds, parastichy, opening, seedFrame } from './log/phyllo.js';
import { caption, CAPTION } from './log/caption.js';
import { splash } from './log/splash.js';
import { makeFall, orderOf, FALL } from './log/fall.js';
import { DECADES, PLATE, loadRooms, decadeOfDate } from './log/rooms.js';
import { makeAnswers } from './log/answer.js';
import { makeTerminal } from './log-dawn.js';
import { make as makeEpicycle, EPICYCLE, rosette } from './intro/epicycle.js';

export const meta = {
	title:
		"rosette — the date's rosette is the body's section; down the log-map tunnel, the years counted back"
};

// ── The run ──────────────────────────────────────────────────────────────────
const SECONDS = 61;
const EB = EPICYCLE.beats; // q1 6.8 · wait1 7.6 · e1 9.8 · q2 11.6 · wait2 12.4 · e2 14.4
const B = {
	...EB,
	veil: [15.1, 16.1], // the questions go
	genetics: [15.9, 22.9], // COMPILING USER GENETICS
	hand: 16.2, // the figure taken over from the intro
	arms: [16.2, 16.9], // the arms fade
	tilt: [16.2, 17.9], // the lens rises over: the figure tilts back
	morph: [16.5, 17.8], // the figure eases to the head's ring
	head: [17.8, 19.4], // rings: the head's, nose first
	mid: [19.4, 19.95], // the neck's and the midpiece's
	tail: [19.95, 21.0], // the flagellum's
	gens: [20.8, 22.0], // the generatrices
	contour: [21.7, 22.5], // the contour, bold
	conceive: [22.9, 33.4], // SIMULATING CONCEPTION
	life: 22.9, // the beat comes in, the spark
	swim: 23.0,
	rim: [23.5, 24.5], // the disc's rim, both ways from its foot, then its seeds, rim to centre
	seeds: [23.9, 26.9],
	sp8: [26.7, 27.9],
	sp13: [27.2, 28.4],
	apex: [27.8, 28.8],
	axis: [28.2, 30.4], // the lens onto the disc's axis
	open: [30.5, 31.9], // x: the disc opens along its sight lines
	log: [31.7, 33.5], // the depth law eases to the log map
	turn: 32.0, // the tunnel starts to turn
	interim: 33.6, // the years
	birth: 37.8, // the birth year near, slowest
	days: 41.0, // the last day passed
	fall: [42.4, 53.6],
	land: [51.6, 53.6],
	colour: [52.0, 54.2],
	rise: [42.4, 43.3], // the first room comes up round the glass
	aim: [51.9, 53.7],
	hit: 53.7,
	out: [59.3, 60.9]
};

// ── The world ────────────────────────────────────────────────────────────────
// The disc in z = 0, centred on the z axis; the tunnel it opens into runs
// down −z. The swimmer is built off to the side and swims in across the
// disc's face, turning onto its line (XS, YS) parallel to the axis — so the
// lens on the axis sees it a little from the side — and on down it.
const FOV = 46;
const WIDE = 72; // the lens widens as the disc comes, and narrows onto its axis
const A = 40; // the tunnel's radius
const RD = 120; // the disc's rim: three tunnels (the seamless law stands the rim at 2E/3)
const U1 = Math.log(PHI) / PHYLLO.k; // e-folds of the log map a seed (≈ 0.027)
const ALPHA = PHYLLO.alpha;
const XS = -16;
const YS = -13;
const GAP = 88; // the lens behind the nose, down the tunnel
const V1 = 37; // the swim before the tunnel, world units a second
const AMOUNT = 0.4; // the rosette's share of the section
const GAMMA = 0.55; // the funnel's lean: sin of its wall's angle to the axis
const HORN = { lead: 0.3, ramp: 2.2 }; // the wall leans in from the birth ring
const NSEED = 700;
const OMEGA = 0.09; // the tunnel's turn, radians a second
const SEED_R = 0.1; // a seed's disc on the wall, of the radius
const UP = [0, 1, 0];
const SWING = [22.1, 24.2]; // the lens off the finished body onto the chase
// The chase as the disc comes: the lens this far behind the nose, above it
// and off to its side (away from the disc), looking this share of the way
// from the swimmer to the disc's centre.
const CH = { back: 24, up: 36, side: 30, disc: 0.42 };
const GOLD_AT = -0.55; // where the birth year is written round the wall (radians)
const FIB = [1, 2, 3, 5, 8, 13, 21, 34];
const NOW = 2026;
const DAYS = 266;
const INK = { seed: 0.42, sp8: 0.36, sp13: 0.27, rim: 0.4, ring: 0.2, decade: 0.4, label: 0.55 };

// The approach: built off to the side at N0, heading in across the disc's
// face at BETA to the axis, straight for L1, round an arc of radius RHO onto
// the line at z = ZJ, then down it. Level all the way: its top is +y.
const PATH = (() => {
	const beta = (80 * Math.PI) / 180;
	const rho = 46;
	const ZJ = 30;
	const L1 = 170;
	// In the plane y = YS: q along +x from the line, z along it.
	const N0q = rho - rho * Math.cos(beta) + L1 * Math.sin(beta);
	const N0z = ZJ + rho * Math.sin(beta) + L1 * Math.cos(beta);
	const SJ = L1 + rho * beta;
	const psiOf = (s) => (s <= L1 ? beta : s <= SJ ? beta - (s - L1) / rho : 0);
	const at = (s) => {
		if (s <= L1) return [XS + N0q - s * Math.sin(beta), YS, N0z - s * Math.cos(beta)];
		if (s <= SJ) {
			const psi = psiOf(s);
			return [XS + rho - rho * Math.cos(psi), YS, ZJ + rho * Math.sin(psi)];
		}
		return [XS, YS, ZJ - (s - SJ)];
	};
	const dir = (s) => {
		const psi = psiOf(s);
		return [-Math.sin(psi), 0, -Math.cos(psi)];
	};
	const up = () => UP;
	return { at, dir, up, N0: at(0), d0: dir(0), up0: UP, SJ, ZJ };
})();
// The build's frame: behind (toward the tail), right, its top.
const EB_ = mul3(PATH.d0, -1);
const ER = norm(cross(PATH.d0, PATH.up0));
const EU = PATH.up0;

// ∫ smoothstep: a clock that eases from rest to speed 1 over D seconds.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}

// A C¹ curve through keys [t, x, rate] — cubic Hermite between each two, the
// rates clamped to 3× the secant (Fritsch–Carlson) so it never turns back;
// straight on past the ends at their rates.
function hermite(keys) {
	const K = keys.map((k) => k.slice());
	for (let i = 0; i < K.length - 1; i++) {
		const S = Math.max(1e-6, (K[i + 1][1] - K[i][1]) / (K[i + 1][0] - K[i][0]));
		K[i][2] = Math.min(K[i][2], 3 * S);
		K[i + 1][2] = Math.min(K[i + 1][2], 3 * S);
	}
	const n = K.length - 1;
	const val = (t) => {
		if (t <= K[0][0]) return K[0][1] + K[0][2] * (t - K[0][0]);
		if (t >= K[n][0]) return K[n][1] + K[n][2] * (t - K[n][0]);
		let i = 0;
		while (i < n - 1 && t > K[i + 1][0]) i++;
		const [t0, x0, v0] = K[i];
		const [t1, x1, v1] = K[i + 1];
		const H = t1 - t0;
		const s = (t - t0) / H;
		const s2 = s * s;
		const s3 = s2 * s;
		return (
			(2 * s3 - 3 * s2 + 1) * x0 +
			(s3 - 2 * s2 + s) * v0 * H +
			(-2 * s3 + 3 * s2) * x1 +
			(s3 - s2) * v1 * H
		);
	};
	return { val, keys: K };
}

// ── The tunnel's shape ───────────────────────────────────────────────────────
// The disc's log map onto a surface of revolution: u = ln(R/ρ) e-folds down
// it (seed n at u = n·U1), θ round it; radius r(u), depth D(u) (z = −D).
// A cylinder of radius A down to the birth year, then the wall leans in:
// γ(u), the sine of its angle to the axis, ramps 0 → GAMMA, with r' = −γr and
// D' = r√(1 − γ²), so a step du is r·du along the wall and r·dθ round it —
// every cell of the lattice stays the square it was on the disc. Past the
// ramp it is a cone (the funnel) with its apex at D_A: the far point.
function makeHorn(u0, ramp, g1) {
	const N = 240;
	const RR = new Float64Array(N + 1);
	const DD = new Float64Array(N + 1);
	const g = (u) => g1 * smooth(span(u, u0, u0 + ramp));
	let r = A;
	let D = A * u0;
	const h = ramp / N;
	for (let i = 0; i <= N; i++) {
		const u = u0 + i * h;
		RR[i] = r;
		DD[i] = D;
		const g0 = g(u);
		const gm = g(u + h / 2);
		const rm = r * (1 - (g0 * h) / 2);
		r = r * Math.exp(-((g0 + 4 * gm + g(u + h)) / 6) * h);
		D += h * rm * Math.sqrt(1 - gm * gm);
	}
	const u1 = u0 + ramp;
	const r1 = RR[N];
	const D1 = DD[N];
	const c1 = Math.sqrt(1 - g1 * g1);
	const DA = D1 + (r1 * c1) / g1;
	const look = (u) => {
		const f = (u - u0) / h;
		const i = Math.min(N - 1, Math.max(0, Math.floor(f)));
		return [i, f - i];
	};
	return {
		u0,
		u1,
		DA,
		gamma: g,
		r(u) {
			if (u <= u0) return A;
			if (u >= u1) return r1 * Math.exp(-g1 * (u - u1));
			const [i, f] = look(u);
			return lerp(RR[i], RR[i + 1], f);
		},
		D(u) {
			if (u <= u0) return A * u;
			if (u >= u1) return DA - (r1 * Math.exp(-g1 * (u - u1)) * c1) / g1;
			const [i, f] = look(u);
			return lerp(DD[i], DD[i + 1], f);
		}
	};
}

// ── Ink: segments batched by colour, alpha and width ─────────────────────────
function makeInk() {
	const B = new Map();
	const COLORS = [PAL.chalk, PAL.gold];
	return {
		seg(ci, al, wd, ax, ay, bx, by) {
			if (al < 0.02) return;
			const a = Math.min(20, Math.round(al * 20));
			const wq = Math.max(1, Math.min(31, Math.round(wd * 4)));
			const key = (ci * 32 + a) * 32 + wq;
			let b = B.get(key);
			if (!b) B.set(key, (b = { color: COLORS[ci], a: a / 20, w: wq / 4, s: [] }));
			b.s.push(ax, ay, bx, by);
		},
		flush(ctx) {
			const g0 = ctx.globalAlpha;
			ctx.save();
			ctx.lineCap = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = g0 * b.a;
				ctx.lineWidth = b.w;
				ctx.beginPath();
				const s = b.s;
				for (let i = 0; i < s.length; i += 4) {
					ctx.moveTo(s[i], s[i + 1]);
					ctx.lineTo(s[i + 2], s[i + 3]);
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// ── The stars: three depths, streaming as the lens flies down −z ─────────────
// Each star a direction on the sky at angle θ from the flight's axis (−z):
// its q = ln tan(θ/2) carried on by the distance flown times its layer's
// rate (the near layer fastest: parallax), wrapped, faded in at the axis
// and out behind; fixed on the sky otherwise, so the lens's turns turn them.
// A streak behind each, as long as its motion over STREAK seconds.
const STAR_Q = [-5.2, 5.2];
const STREAK = 0.035;
const LAYERS = [
	{ n: 260, rate: 0.12, r: 0.55, a: 0.15 },
	{ n: 140, rate: 0.3, r: 0.8, a: 0.21 },
	{ n: 60, rate: 0.7, r: 1.1, a: 0.27 }
];
const STARS = (() => {
	let seed = 31337;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	return LAYERS.map((L) =>
		Array.from({ length: L.n }, () => ({
			q: lerp(STAR_Q[0], STAR_Q[1], rnd()),
			psi: TAU * rnd(),
			k: 0.6 + 0.8 * rnd()
		}))
	);
})();

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const forced = DECADES.includes(q.get('decade')) ? q.get('decade') : null;
	const live = at === null && q.get('demo') !== '1' && location.pathname.startsWith('/lab');
	const amount = q.has('amount') ? clamp01(Number(q.get('amount'))) : AMOUNT;
	const board = getBoard();
	const time = clock(SECONDS, at);
	clearBoard(board);
	tag(board.ctx, board.w, board.h, 'flow-rosette · loading the rooms');
	const answers = makeAnswers({ live, beats: EB });
	const [art, intro] = await Promise.all([
		loadRooms({ chalk: true }),
		makeEpicycle({ board, answers, live, keep: true }),
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null)
	]);
	const TERM = makeTerminal(0.8, { cmd: false, align: 'center' });
	const Z = makeDepth(4);

	// The disc, once: 700 seeds (the 233 of the disc and on, under a pixel
	// there, so the tunnel it opens into is deep), its 8- and 13-spirals.
	const SEEDS = seeds({ n: NSEED, R: RD });
	const SP8 = [];
	const SP13 = [];
	for (let j = 0; j < 8; j++) SP8.push(parastichy(8, j, { R: RD, n: NSEED, per: 6 }));
	for (let j = 0; j < 13; j++) SP13.push(parastichy(13, j, { R: RD, n: NSEED, per: 4 }));
	// The rim, written round from its foot (the point nearest the swimmer
	// on the board as the chase looks down on it) both ways to its top.
	// (angles from the foot; discFrame adds the foot's own, the disc's turn
	// taken off).
	const RIMS = [1, -1].map((sg) =>
		Array.from({ length: 81 }, (_, i) => ({
			theta: (sg * Math.PI * i) / 80,
			rho: RD
		}))
	);

	// ── The person: their figure, their section, their body ──────────────────
	let P = null;
	function person() {
		const { date, spice } = answers.answers;
		const key = `${date}|${spice}`;
		if (P && P.key === key) return P;
		const n = Math.max(1, Math.min(10, Math.round(Number(spice) || 1)));
		const ros = rosette(date, n);
		const sec = rosetteSection(ros, amount);
		const spec = specOf({ date, spice: n }, { section: sec });
		const body = makeBody(spec);
		const NR = body.rings.length;
		const nHead = body.rings.filter((i) => body.stations[i].part === 'head').length;
		const nMid = body.rings.filter((i) => body.stations[i].part !== 'tail').length;
		// The figure becomes the head's fifth ring (two-fifths back, about
		// its broadest).
		const jm = 4;
		const st = body.stations[body.rings[jm]];
		P = {
			key,
			date,
			spice: n,
			ros,
			sec,
			spec,
			body,
			NR,
			nHead,
			nMid,
			jm,
			sm: st.s,
			am: st.a,
			bm: st.b,
			sMid: (body.parts.mid[0] + body.parts.mid[1]) / 2
		};
		return P;
	}
	// The rings written, nose → tip: the head slowly, the midpiece, the tail.
	function ringsAt(p, t) {
		if (t < B.head[1]) return lerp(0, p.nHead, span(t, ...B.head));
		if (t < B.mid[1]) return lerp(p.nHead, p.nMid, span(t, ...B.mid));
		return lerp(p.nMid, p.NR, span(t, ...B.tail));
	}

	// ── The plan: the fall, the years, the tunnel's shape, the lens's pace ───
	let PL = null;
	let fallMemo = null;
	function plan(w, h) {
		const p = person();
		const decade = forced ?? decadeOfDate(p.date);
		const key = `${p.key}|${decade}|${w}x${h}`;
		if (PL && PL.key === key) return PL;
		if (!fallMemo || fallMemo.decade !== decade)
			fallMemo = {
				decade,
				fall: makeFall({
					art,
					order: orderOf(decade),
					beats: { fall: B.fall, land: B.land, colour: B.colour, swim: [-2, -1] }
				})
			};
		const fall = fallMemo.fall;
		const g = fall.geometry(w, h);
		const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
		// The first room's glass where the fall opens (ζ₀): centred on the
		// board, this size.
		const lv = g.levels[0];
		const cz = g.pose(FALL.zeta0);
		const dg = cz.z - (lv.O[2] + lv.s * lv.glass.z);
		const gw = (g.F * lv.s * lv.glass.w) / dg;
		const gh = (g.F * lv.s * lv.glass.h) / dg;

		// The years: 2026 back to the birth year, one ring of m seeds each
		// (m the Fibonacci number that lays them over about 8 e-folds of the
		// tunnel, so each year's label is m seeds on from the last: the
		// labels climb one m-spiral of the lattice), then 266 days, a seed
		// each, to conception.
		const year = Number(p.date.slice(4, 8)) || 1987;
		const N = Math.abs(NOW - year);
		const sgn = year <= NOW ? -1 : 1;
		const want = 8 / (Math.max(1, N) * U1);
		let m = FIB[0];
		for (const f of FIB) if (Math.abs(Math.log(f / want)) < Math.abs(Math.log(m / want))) m = f;
		const uS = -0.2; // the lens at the interim's start (at the mouth)
		// The first year far enough down (3.6 e-folds, ~145 units) that its
		// numeral is still on the board, not past its edge, as the numbers
		// come in (by 34.0).
		const nY0 = Math.round((uS + 3.6) / U1);
		const nB = nY0 + N * m;
		const uB = nB * U1;
		const n0 = nB + DAYS; // day 0
		const u0 = n0 * U1;
		const horn = makeHorn(uB + HORN.lead, HORN.ramp, GAMMA);

		// The lens's pace, in e-folds of the log map a second: on the disc's
		// axis from the opening; gathering into the tunnel; rushing through
		// the years; slowing as the birth year comes (slowest with its ring
		// still in view); rushing again through the days; braking as the far
		// point opens, to the fall's own pace (its zoom is GAMMA × this in
		// the funnel).
		const vF = g.rate0 / GAMMA;
		const uD = u0 + 0.05;
		const uF = uD + 1.4 * ((3 + vF) / 2) * 0.85;
		const lens = hermite([
			[28.2, -4.0, 0.6],
			[30.4, -2.8, 0.6],
			[31.9, -1.7, 0.85],
			[B.interim, uS, 1.6],
			[B.birth, Math.max(uS + 1, uB - 1.8), 0.3],
			[B.days, uD, 3.0],
			[B.fall[0], uF, vF]
		]);
		// The throat: where the funnel ends, a hole round the glass, as big
		// round it as the glass's half-diagonal and a fifth more when the
		// fall opens.
		const want0 = 0.62 * Math.hypot(gw, gh);
		const px = (uT) => (F * horn.r(uT)) / Math.max(1e-9, horn.D(uT) - horn.D(uF));
		let lo = uF + 0.05;
		let hi = uF + 30;
		for (let i = 0; i < 60; i++) {
			const mid = (lo + hi) / 2;
			if (px(mid) > want0) lo = mid;
			else hi = mid;
		}
		const uT = (lo + hi) / 2;
		// The turn: the whole lattice turned so the birth year's label is
		// on the right as it comes.
		const psi0 = GOLD_AT - nB * ALPHA - OMEGA * eased(B.birth + 0.6 - B.turn, 2);

		PL = {
			key,
			decade,
			fall,
			g,
			F,
			gw,
			gh,
			year,
			N,
			sgn,
			m,
			nY0,
			nB,
			uB,
			n0,
			u0,
			uF,
			uT,
			rT0: want0,
			horn,
			lens,
			E: -A * lens.val(B.open[0]),
			psi0
		};
		return PL;
	}

	const info = {
		seconds: SECONDS,
		live,
		beats: B,
		answers: answers.answers,
		get decade() {
			return PL?.decade ?? forced ?? decadeOfDate(answers.answers.date);
		}
	};

	// ── Where the lens is ────────────────────────────────────────────────────
	// The tunnel's turn about its axis.
	const psiAt = (pl, t) => pl.psi0 + OMEGA * eased(t - B.turn, 2);
	// The lens's place down the tunnel (u), from the axis on; in the fall the
	// fall's own zoom carries it on (the funnel's zoom is GAMMA·u).
	const uAt = (pl, t) => (t < B.fall[0] ? pl.lens.val(t) : pl.uF + pl.g.efolds(t) / GAMMA);

	// The compile: the lens rises over the figure (it tilts back), then
	// steps back along the body as it is built, coming round to its side.
	// [t, az°, el°, dist, s along the body] in the build's frame.
	function compileLens(p, w, h, t) {
		const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
		const R = EPICYCLE.radius(w, h);
		const D0 = (F * p.am) / R; // the figure at its own size on the board
		const drop = (0.5 - EPICYCLE.pivot[1]) * h * (D0 / F); // the pivot sits above centre
		const K = [
			[B.tilt[0], 0, 0, D0, p.sm],
			[B.tilt[1], -8, 50, 11, p.sm],
			[19.4, -22, 44, 17, 3],
			[19.95, -32, 38, 28, 7],
			[21.0, -55, 30, 54, 20],
			[21.9, -82, 26, 40, 12],
			[22.6, -98, 22, 30, 8]
		];
		const ch = (c) =>
			spline(
				t,
				K.map((k) => [k[0], k[c]])
			);
		const az = (ch(1) * Math.PI) / 180;
		const el = (ch(2) * Math.PI) / 180;
		const dist = ch(3);
		const dy = drop * (1 - smooth(span(t, B.tilt[0], B.tilt[0] + 1.2)));
		const tgt = add3(PATH.N0, add3(mul3(EB_, ch(4)), mul3(EU, -dy)));
		const off = add3(
			add3(mul3(ER, dist * Math.sin(az) * Math.cos(el)), mul3(EU, dist * Math.sin(el))),
			mul3(EB_, dist * Math.cos(az) * Math.cos(el))
		);
		return { pos: add3(tgt, off), tgt, up: EU };
	}

	// The swimmer's nose along its path, before the tunnel takes it over.
	const swum = (t) => V1 * eased(t - B.swim, 1.6);
	// Its arc length from the axis on: blended from its own swim into GAP
	// ahead of the lens.
	function sigmaAt(pl, t) {
		const s0 = swum(t);
		if (t < B.axis[1]) return s0;
		const zL = -pl.horn.D(uAt(pl, t));
		const w = smooth(span(t, B.axis[1], B.interim));
		const zFree = PATH.at(s0)[2];
		const zChase = zL - GAP;
		return PATH.SJ + (PATH.ZJ - lerp(zFree, zChase, w));
	}

	// The chase: over the swimmer and behind it, off to its side, looking
	// past it at the disc — the swimmer's broad face and its beat seen from
	// above, the disc ahead, big and oblique in the wide lens, as it closes.
	function chaseLens(t) {
		const s = swum(t);
		const nose = PATH.at(s);
		const f = PATH.dir(s);
		const k = smooth(span(t, 23.0, 25.0));
		const side = norm(cross(UP, f)); // the swimmer's left: away from the disc
		const pos = add3(
			add3(nose, mul3(f, -lerp(50, CH.back, k))),
			add3(mul3(UP, lerp(60, CH.up, k)), mul3(side, lerp(0, CH.side, k)))
		);
		// Between the swimmer and the disc's centre, the swimmer's side
		// favoured as the disc comes.
		const toS = norm(sub3(add3(nose, mul3(f, 12)), pos));
		const toD = norm(sub3([0, 0, 0], pos));
		const dir = norm(add3(mul3(toS, 1 - CH.disc * k), mul3(toD, CH.disc * k)));
		return { pos, tgt: add3(pos, mul3(dir, 100)), up: UP };
	}

	// The lens over the whole world part of the run.
	function lensAt(pl, p, w, h, t) {
		if (t >= B.axis[1]) {
			const z = -pl.horn.D(uAt(pl, t));
			return { pos: [0, 0, z], tgt: [0, 0, z - 100], up: UP, fov: FOV };
		}
		const C = compileLens(p, w, h, Math.min(t, 22.6));
		if (t < SWING[0]) return { ...C, fov: FOV };
		const k0 = smooth(span(t, ...SWING));
		const Ch = chaseLens(t);
		const pos0 = add3(mul3(C.pos, 1 - k0), mul3(Ch.pos, k0));
		const tgt0 = add3(mul3(C.tgt, 1 - k0), mul3(Ch.tgt, k0));
		// Onto the axis: the lens's place down it, blended in.
		const ka = smooth(span(t, ...B.axis));
		const za = -A * pl.lens.val(t);
		const pos = add3(mul3(pos0, 1 - ka), mul3([0, 0, za], ka));
		const dirA = norm(sub3(tgt0, pos));
		const dir = norm(add3(mul3(dirA, 1 - ka), mul3([0, 0, -1], ka)));
		const up0 = norm(add3(mul3(C.up, 1 - k0), mul3(Ch.up, k0)));
		const up = norm(add3(mul3(up0, 1 - ka), mul3(UP, ka)));
		const kw = smooth(span(t, 22.6, 24.4)) * (1 - smooth(span(t, ...B.axis)));
		return { pos, tgt: add3(pos, mul3(dir, 100)), up, fov: lerp(FOV, WIDE, kw) };
	}

	// The swimmer, seen from the lens: drawn in the lens's own frame (the
	// lens at the origin, the world scaled by the tunnel's radius where the
	// lens is, so down the funnel it keeps its size — and body.js's near
	// plane, in world units, never takes it). Before the interim it is laid
	// along its path; from there it is straight, GAP ahead.
	function bodyView(pl, p, t, L, w, h) {
		const dir = norm(sub3(L.tgt, L.pos));
		const cam = camera3({ pos: [0, 0, 0], target: dir, up: L.up, fov: L.fov, w, h });
		if (t < B.interim) {
			const sigma = sigmaAt(pl, t);
			return {
				cam,
				sc: 1,
				pose: { path: (x) => sub3(PATH.at(x), L.pos), sigma, up: PATH.up }
			};
		}
		const sc = pl.horn.r(uAt(pl, t)) / A;
		return { cam, sc, pose: { at: [XS, YS, -GAP], dir: [0, 0, -1], up: UP, scale: 1 } };
	}
	function shapeAt(p, t) {
		const sp = p.spec;
		if (t < B.life) return p.body.shape(t, { beat: 0, phase: sp.beat.phase, roll: 0 });
		return p.body.shape(t, {
			beat: span(t, B.life, B.life + 1),
			phase: TAU * sp.beat.hz * eased(t - B.life, 0.8) + sp.beat.phase,
			roll: TAU * sp.roll * eased(t - B.swim, 1.2)
		});
	}
	// How far the run has flown, for the stars: −z/A before the tunnel, then u.
	function flown(pl, p, w, h, t) {
		if (t >= B.axis[1]) return uAt(pl, t);
		return -lensAt(pl, p, w, h, t).pos[2] / A;
	}

	// ── Drawing ──────────────────────────────────────────────────────────────
	const ink = makeInk();
	const near = (px) => 1 - smooth(span(px, 24, 110));

	function stars(ctx, cam, Zf, Zv, alpha) {
		if (alpha <= 0.01) return;
		const { r: R, u: U, f: Fv } = cam;
		const k = cam.project(add3(cam.pos, Fv));
		const cx = k[0];
		const cy = k[1];
		// The focal length in px, off the projection of a unit step right.
		const kx = cam.project(add3(cam.pos, add3(Fv, R)))[0] - cx;
		const span0 = STAR_Q[1] - STAR_Q[0];
		const dirOf = (qq, psi) => {
			const th = 2 * Math.atan(Math.exp(qq));
			const s = Math.sin(th);
			return [s * Math.cos(psi), s * Math.sin(psi), -Math.cos(th)];
		};
		const proj = (d) => {
			const z = d[0] * Fv[0] + d[1] * Fv[1] + d[2] * Fv[2];
			if (z <= 0.02) return null;
			const x = d[0] * R[0] + d[1] * R[1] + d[2] * R[2];
			const y = d[0] * U[0] + d[1] * U[1] + d[2] * U[2];
			return [cx + (kx * x) / z, cy - (kx * y) / z];
		};
		const W = board.w + 4;
		const H = board.h + 4;
		ctx.save();
		LAYERS.forEach((L, li) => {
			const dots = [];
			const lines = [];
			for (const s of STARS[li]) {
				let qq = s.q + Zf * L.rate;
				qq = STAR_Q[0] + ((((qq - STAR_Q[0]) % span0) + span0) % span0);
				const a =
					smooth(span(qq, STAR_Q[0], STAR_Q[0] + 2.2)) * (1 - smooth(span(qq, 2, STAR_Q[1])));
				if (a < 0.05) continue;
				const P0 = proj(dirOf(qq, s.psi));
				if (!P0 || P0[0] < -4 || P0[1] < -4 || P0[0] > W || P0[1] > H) continue;
				const dq = Zv * L.rate * STREAK;
				if (dq > 0.004) {
					const P1 = proj(dirOf(qq - dq, s.psi));
					if (P1 && Math.hypot(P0[0] - P1[0], P0[1] - P1[1]) > 1.2) {
						lines.push(P1[0], P1[1], P0[0], P0[1]);
						continue;
					}
				}
				dots.push(P0[0], P0[1], a * s.k);
			}
			ctx.fillStyle = PAL.chalk;
			ctx.globalAlpha = alpha * L.a;
			ctx.beginPath();
			for (let i = 0; i < dots.length; i += 3) {
				const rr = L.r * (0.6 + 0.5 * dots[i + 2]);
				ctx.moveTo(dots[i] + rr, dots[i + 1]);
				ctx.arc(dots[i], dots[i + 1], rr, 0, TAU);
			}
			ctx.fill();
			if (lines.length) {
				ctx.strokeStyle = PAL.chalk;
				ctx.globalAlpha = alpha * L.a * 0.8;
				ctx.lineWidth = L.r * 1.4;
				ctx.lineCap = 'round';
				ctx.beginPath();
				for (let i = 0; i < lines.length; i += 4) {
					ctx.moveTo(lines[i], lines[i + 1]);
					ctx.lineTo(lines[i + 2], lines[i + 3]);
				}
				ctx.stroke();
			}
		});
		ctx.restore();
	}

	// A world polyline, segment by segment: near the lens let go, far faint,
	// behind the body hidden; `keep(x, y, r)`, if given, false where nothing
	// drawn could show (the fall's plates over it).
	function poly3(cam, pts, ci, al, wd, { fog = null, upto = 1, depth = null, keep = null } = {}) {
		const end = (pts.length - 1) * upto;
		let qa = cam.project(pts[0]);
		for (let i = 1; i < pts.length && i - 1 < end; i++) {
			let qb = cam.project(pts[i]);
			if (i > end) {
				const f = end - (i - 1);
				qb = cam.project(add3(pts[i - 1], mul3(sub3(pts[i], pts[i - 1]), f)));
			}
			if (qa[2] > NEAR && qb[2] > NEAR) {
				const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
				const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
				if ((!depth || !depth.hidden(mid)) && (!keep || keep(mid[0], mid[1], L / 2 + 2))) {
					const f = fog ? fog(mid[2]) : 1;
					ink.seg(ci, al * near(L) * smooth(span(L, 0.3, 4)) * f, wd, qa[0], qa[1], qb[0], qb[1]);
				}
			}
			qa = qb;
		}
	}

	// A seed: draft's disc of radius q·ρ round it, carried by the map's frame
	// (c, e1, e2), drawn as the ellipse its three projected points make.
	// A seed's centre so far off the board that nothing of it can show: its
	// ellipse reaches √2 × its size from the centre, and one 110 px across is
	// gone (near()).
	const offBoard = (q, w, h) => q[0] < -160 || q[1] < -160 || q[0] > w + 160 || q[1] > h + 160;
	function seedInk(cam, c, e1, e2, qr, ci, al, fog, w, h, depth, keep = null) {
		const qc = cam.project(c);
		if (qc[2] <= NEAR || offBoard(qc, w, h)) return;
		const q1 = cam.project(add3(c, mul3(e1, qr)));
		const q2 = cam.project(add3(c, mul3(e2, qr)));
		if (q1[2] <= NEAR || q2[2] <= NEAR) return;
		const ax = q1[0] - qc[0];
		const ay = q1[1] - qc[1];
		const bx = q2[0] - qc[0];
		const by = q2[1] - qc[1];
		const big = Math.max(Math.hypot(ax, ay), Math.hypot(bx, by));
		if (big < 0.5) return;
		if (qc[0] + big < 0 || qc[0] - big > w || qc[1] + big < 0 || qc[1] - big > h) return;
		if (keep && !keep(qc[0], qc[1], 1.5 * big)) return;
		if (depth && depth.hidden(qc)) return;
		const a = al * near(big) * smooth(span(big, 1.2, 6)) * (fog ? fog(qc[2]) : 1);
		if (a < 0.02) return;
		const m = Math.max(6, Math.min(36, Math.round(4 + big / 2)));
		const wd = Math.min(1.4, 0.5 + big * 0.1);
		let px = qc[0] + ax;
		let py = qc[1] + ay;
		for (let k = 1; k <= m; k++) {
			const cs = Math.cos((TAU * k) / m);
			const sn = Math.sin((TAU * k) / m);
			const x = qc[0] + cs * ax + sn * bx;
			const y = qc[1] + cs * ay + sn * by;
			ink.seg(ci, a, wd, px, py, x, y);
			px = x;
			py = y;
		}
	}

	// ── The disc, seeded ahead and opening into the tunnel (conception) ──────
	// A spiral's points to seed index n (its `upto` is of the spiral so far).
	const upTo = (sp, n) => {
		let k = sp.length;
		while (k > 2 && sp[k - 1].v > n) k--;
		return k === sp.length ? sp : sp.slice(0, k);
	};
	function discFrame(ctx, pl, cam, t, w, h, depth) {
		const x = smooth(span(t, ...B.open));
		const lg = smooth(span(t, ...B.log));
		const E = pl.E; // the lens's distance from the disc, on its axis, as it opens
		const psi = psiAt(pl, t);
		const cs = Math.cos(psi);
		const sn = Math.sin(psi);
		const map = (s) => {
			const p = opening(s, x, { R: RD, a: A, E, log: lg });
			return [p[0] * cs - p[1] * sn, p[0] * sn + p[1] * cs, p[2]];
		};
		const fog = (z) => 1 - lg * smooth(span(z, 1.6 * A, 4.5 * A));
		// The rim.
		const ur = smooth(span(t, ...B.rim));
		const foot = -Math.PI / 2 - psi;
		for (const rim of RIMS)
			poly3(
				cam,
				rim.map((r) => map({ theta: foot + r.theta, rho: RD })),
				0,
				INK.rim,
				1.1,
				{ fog, upto: ur, depth }
			);
		// The seeds, rim to centre at the golden angle.
		const dt = (B.seeds[1] - B.seeds[0]) / PHYLLO.n;
		// Past the disc's own 233 the seeds are under a pixel until the lens
		// goes in: drawn as the depth law opens them.
		const nMax = Math.round(lerp(260, NSEED, lg));
		for (let i = 0; i < nMax; i++) {
			const ti = B.seeds[0] + Math.min(i, PHYLLO.n) * dt;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			// Its frame (five points of the map) only for a seed that can show.
			const qc = cam.project(map(SEEDS[i]));
			if (qc[2] <= NEAR || offBoard(qc, w, h)) continue;
			// Lost in the fog (seedInk would draw nothing): skip its frame.
			if (INK.seed * a * fog(qc[2]) < 0.02) continue;
			const F = seedFrame(SEEDS[i], map);
			const qr = lerp(PHYLLO.seedR, SEED_R, lg) * pop;
			seedInk(cam, F.c, F.e1, F.e2, qr, 0, INK.seed * a, fog, w, h, depth);
		}
		// The spirals.
		const p8 = smooth(span(t, ...B.sp8));
		const p13 = smooth(span(t, ...B.sp13));
		// Written in full, a spiral runs down the tunnel's depth in order (the
		// lens on its axis by the time the fog comes in): it stops at its
		// first point wholly in the fog, all beyond it drawn as nothing.
		const spiral = (sp, up) => {
			if (up < 1 || lg <= 0) return upTo(sp, nMax).map(map);
			const out = [];
			for (const s of sp) {
				if (s.v > nMax && out.length >= 2) break;
				const P = map(s);
				out.push(P);
				if (out.length > 1 && fog(cam.project(P)[2]) <= 0) break;
			}
			return out;
		};
		if (p8 > 0)
			for (const sp of SP8) poly3(cam, spiral(sp, p8), 0, INK.sp8, 1, { fog, upto: p8, depth });
		if (p13 > 0)
			for (const sp of SP13)
				poly3(cam, spiral(sp, p13), 0, INK.sp13, 0.9, { fog, upto: p13, depth });
		ink.flush(ctx);
		// The apex: the lattice's fixed point, then the tunnel's far point.
		const ap = smooth(span(t, ...B.apex)) * 0.7;
		if (ap > 0) {
			const Pp = map({ theta: 0, rho: RD * 1e-4 });
			const far = [0, 0, -1e5];
			for (const [Q, wt] of [
				[Pp, 1 - lg],
				[far, lg]
			]) {
				const qa = cam.project(Q);
				if (wt > 0.01 && qa[2] > NEAR && !(depth && depth.hidden(qa)))
					lit3(ctx, cam, Q, 2, ap * wt);
			}
		}
	}

	// ── The tunnel down to the far point (the interim, and under the fall) ───
	// The window of the lattice round the lens: the seeds, the 8- and
	// 13-spirals as helices, the year rings and their numerals, the days'
	// numerals in their seeds, and the throat.
	function tunnelFrame(
		ctx,
		pl,
		cam,
		t,
		w,
		h,
		{ depth = null, alpha = 1, labels = true, keep = null } = {}
	) {
		const horn = pl.horn;
		const uL = uAt(pl, t);
		const sL = horn.r(uL) / A;
		const psi = psiAt(pl, t);
		const fog = (z) => 1 - smooth(span(z / (sL * A), 1.6, 4.5));
		const uLo = uL - 0.4;
		// As far down as anything shows: to the fog in the cylinder, to where
		// the funnel is a hundredth of its width here, or the throat.
		const DL = horn.D(uL);
		let uHi = uL;
		while (uHi < pl.uT && (horn.D(uHi) - DL) / (sL * A) < 4.6 && horn.r(uHi) > 0.01 * horn.r(uL))
			uHi += 0.1;
		uHi = Math.min(pl.uT, uHi);
		const at = (u, th) => {
			const r = horn.r(u);
			return [r * Math.cos(th), r * Math.sin(th), -horn.D(u)];
		};
		const frame = (u, th) => {
			const r = horn.r(u);
			const g = horn.gamma(u);
			const c = Math.sqrt(1 - g * g);
			const ct = Math.cos(th);
			const st = Math.sin(th);
			return {
				c: [r * ct, r * st, -horn.D(u)],
				e1: [-r * st, r * ct, 0],
				e2: [g * r * ct, g * r * st, r * c]
			};
		};
		// The years' and the days' seeds carry their numbers instead: their
		// rings fade as the numbers come.
		// From the frame the tunnel takes over from the disc, so nothing pops.
		const show = labels ? smooth(span(t, B.log[1], B.interim + 0.4)) : 0;
		const isYear = (n) => n >= pl.nY0 && n <= pl.nB && (n - pl.nY0) % pl.m === 0;
		const isDay = (n) => n > pl.nB && n <= pl.n0;
		const al = alpha;
		// The seeds.
		const nLo = Math.max(0, Math.ceil(uLo / U1));
		const nHi = Math.floor(uHi / U1);
		for (let n = nLo; n <= nHi; n++) {
			const marked = isYear(n) || isDay(n);
			const a = marked ? 1 - show : 1;
			if (a <= 0.01) continue;
			const fr = frame(n * U1, n * ALPHA + psi);
			seedInk(cam, fr.c, fr.e1, fr.e2, SEED_R, 0, INK.seed * al * a, fog, w, h, depth, keep);
		}
		// The spirals: helices on the wall, conical ones down the funnel.
		for (const [m, ia, wd, per] of [
			[8, INK.sp8, 1, 6],
			[13, INK.sp13, 0.9, 4]
		]) {
			const e = PHYLLO.eps[m];
			const step = m / per;
			for (let j = 0; j < m; j++) {
				const v0 = j + Math.ceil((uLo / U1 - j) / step) * step;
				const pts = [];
				for (let v = v0; v * U1 <= uHi + 1e-9; v += step) {
					const th = j * ALPHA + ((v - j) * TAU * e) / m + psi;
					pts.push(at(v * U1, th));
				}
				if (pts.length > 1) poly3(cam, pts, 0, ia * al, wd, { fog, depth, keep });
			}
		}
		// The year rings: one round the wall at each year's seed, the decades
		// bolder, the birth year gold.
		if (show > 0) {
			for (let j = 0; j <= pl.N; j++) {
				const n = pl.nY0 + j * pl.m;
				const u = n * U1;
				if (u < uLo || u > uHi) continue;
				const yr = NOW + pl.sgn * j;
				const gold = j === pl.N;
				const dec = yr % 10 === 0;
				const ring = [];
				for (let i = 0; i <= 120; i++) ring.push(at(u, (TAU * i) / 120));
				poly3(
					cam,
					ring,
					gold ? 1 : 0,
					(gold ? 0.7 : dec ? INK.decade : INK.ring) * al * show,
					gold ? 1.6 : dec ? 1.25 : 0.9,
					{ fog, depth }
				);
			}
		}
		// Day 0, conception: a finer gold ring round the funnel.
		const u0 = pl.n0 * U1;
		if (show > 0 && u0 >= uLo && u0 <= uHi) {
			const ring = [];
			for (let i = 0; i <= 120; i++) ring.push(at(u0, (TAU * i) / 120));
			poly3(cam, ring, 1, 0.45 * al * show, 1.1, { fog, depth });
		}
		// The throat: the funnel's last ring, round the far point.
		if (pl.uT <= uL + 14) {
			const ring = [];
			for (let i = 0; i <= 120; i++) ring.push(at(pl.uT, (TAU * i) / 120));
			poly3(cam, ring, 0, 0.6 * al, 1.3, { depth, keep });
		}
		ink.flush(ctx);
		if (show <= 0) return;
		// The numerals, written on the wall at their seeds: each in the
		// wall's own perspective (its baseline round the tunnel, its top
		// down it), turned so it never reads upside down; the birth year
		// stood upright to be read.
		const T0 = ctx.getTransform();
		ctx.save();
		ctx.font = `400 100px ${TECH_FONT}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const label = (text, n, size, a0, color, upright = 0, big = 36) => {
			const u = n * U1;
			if (u < uLo || u > uHi) return;
			const th = n * ALPHA + psi;
			const r = horn.r(u);
			const g = horn.gamma(u);
			const c = Math.sqrt(1 - g * g);
			const Pw = at(u, th);
			const eT = [-Math.sin(th), Math.cos(th), 0];
			const eU = [-g * Math.cos(th), -g * Math.sin(th), -c];
			const hw = size * r;
			const p0 = cam.project(Pw);
			if (p0[2] <= NEAR) return;
			if (p0[0] < -80 || p0[1] < -80 || p0[0] > w + 80 || p0[1] > h + 80) return;
			const px = cam.project(add3(Pw, mul3(eT, hw)));
			const pu = cam.project(add3(Pw, mul3(eU, hw)));
			if (px[2] <= NEAR || pu[2] <= NEAR) return;
			let ax = px[0] - p0[0];
			let ay = px[1] - p0[1];
			let ux = pu[0] - p0[0];
			let uy = pu[1] - p0[1];
			const em = Math.max(Math.hypot(ux, uy), Math.hypot(ax, ay));
			if (em < 3) return;
			if (depth && depth.hidden(p0)) return;
			const a = a0 * smooth(span(em, 3, 7)) * (1 - smooth(span(em, big, 2.2 * big))) * fog(p0[2]);
			if (a < 0.02) return;
			if (uy > 0) {
				ax = -ax;
				ay = -ay;
				ux = -ux;
				uy = -uy;
			}
			if (upright > 0) {
				ax = lerp(ax, em, upright);
				ay = lerp(ay, 0, upright);
				ux = lerp(ux, 0, upright);
				uy = lerp(uy, -em, upright);
			}
			ctx.setTransform(
				(T0.a * ax) / 100,
				(T0.a * ay) / 100,
				(-T0.a * ux) / 100,
				(-T0.a * uy) / 100,
				T0.a * p0[0] + T0.e,
				T0.d * p0[1] + T0.f
			);
			ctx.globalAlpha = a;
			ctx.fillStyle = color;
			ctx.fillText(text, 0, 0);
		};
		for (let j = 0; j <= pl.N; j++) {
			const yr = NOW + pl.sgn * j;
			const gold = j === pl.N;
			const dec = yr % 10 === 0;
			label(
				String(yr),
				pl.nY0 + j * pl.m,
				gold ? 0.15 : dec ? 0.1 : 0.085,
				(gold ? 1 : dec ? 0.85 : INK.label) * al * show,
				gold ? PAL.gold : PAL.chalk,
				gold ? 1 : 0,
				gold ? 90 : 40
			);
		}
		const nd0 = Math.max(pl.nB + 1, nLo);
		const nd1 = Math.min(pl.n0, nHi);
		for (let n = nd0; n <= nd1; n++) {
			const d = pl.n0 - n;
			label(
				String(d),
				n,
				d === 0 ? 0.09 : 0.065,
				(d === 0 ? 0.9 : 0.5) * al * show,
				d === 0 ? PAL.gold : PAL.chalk
			);
		}
		ctx.restore();
	}

	// The far point: lit; then the throat open round the first room's glass,
	// the glass growing with it (its own box in the fall at ζ₀ when the fall
	// opens).
	function farPoint(ctx, pl, cam, t, alpha = 1) {
		const u = uAt(pl, t);
		const dz = pl.horn.D(pl.uT) - pl.horn.D(u);
		if (dz <= 0) return;
		const rT = (pl.F * pl.horn.r(pl.uT)) / dz;
		const c = cam.project([0, 0, -pl.horn.D(pl.uT)]);
		const k = rT / pl.rT0;
		const gw = pl.gw * k;
		const gh = pl.gh * k;
		const box = [c[0] - gw / 2, c[1] - gh / 2, c[0] + gw / 2, c[1] + gh / 2];
		const lightA = smooth(span(t, B.days - 1.2, B.days + 0.2)) * alpha;
		if (rT < 1.5) {
			if (lightA > 0) lit(ctx, c[0], c[1], 2, 0.8 * lightA);
			return;
		}
		// The hole: the board through it, a soft light, the glass's frame.
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(c[0], c[1], rT, 0, TAU);
		ctx.clip();
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(c[0] - rT, c[1] - rT, 2 * rT, 2 * rT);
		if (board.dust) {
			ctx.fillStyle = board.dust;
			ctx.fillRect(c[0] - rT, c[1] - rT, 2 * rT, 2 * rT);
		}
		ctx.restore();
		if (gw > 2) {
			ctx.save();
			ctx.globalAlpha = 0.07 * lightA;
			ctx.fillStyle = '#fff6e0';
			ctx.fillRect(box[0], box[1], gw, gh);
			ctx.restore();
			glow(ctx, c[0], c[1], 0.8 * Math.max(gw, gh), [255, 238, 205], 0.35 * lightA);
			stroke(
				ctx,
				[
					[box[0], box[1]],
					[box[2], box[1]],
					[box[2], box[3]],
					[box[0], box[3]],
					[box[0], box[1]]
				],
				{ color: PAL.chalk, width: 1.2, alpha: 0.55 * alpha * smooth(span(gw, 2, 8)) }
			);
		}
		const pt = 1 - smooth(span(rT, 3, 14));
		if (pt > 0 && lightA > 0) lit(ctx, c[0], c[1], 2, 0.8 * lightA * pt);
	}

	// ── The figure, in 3D: the intro's curve, arms and stop, carried into
	// the world as the plane of the head's fifth ring ──────────────────────
	function figure(ctx, p, cam, t, hand, w, h, origin) {
		const R = EPICYCLE.radius(w, h);
		const ros = p.ros;
		const mo = smooth(span(t, ...B.morph));
		const out = 1 - smooth(clamp01(ringsAt(p, t) - p.jm));
		if (out <= 0.003) return;
		const C = sub3(add3(PATH.N0, mul3(EB_, p.sm)), origin);
		const Sx = p.am;
		const Sy = lerp(p.am, p.bm, mo);
		const W = (X, Y) => add3(C, add3(mul3(ER, Sx * X), mul3(EU, Sy * Y)));
		// The curve, as the intro samples it.
		let fm = 1;
		for (let k = 0; k < 8; k++) if (ros.r[k] > 0) fm = Math.max(fm, Math.abs(ros.f[k]));
		const N = Math.max(1500, Math.ceil(80 * fm));
		const pts = new Array(N + 1);
		for (let i = 0; i <= N; i++) {
			const ph = (TAU * i) / N;
			let [X, Y] = ros.at(ph);
			if (mo > 0) {
				const [u, v] = p.sec(0, ph);
				X = lerp(X, u, mo);
				Y = lerp(Y, v, mo);
			}
			const q = cam.project(W(X, Y));
			pts[i] = [q[0], q[1]];
		}
		stroke(ctx, pts, { width: lerp(1.1, 1, mo), alpha: lerp(0.45, 0.5, mo) * out });
		// The intro's gold trace, still fading from the spice's Enter.
		trace(ctx, pts, t, EB.e2);
		// The arms, at f_k θ, fading.
		const arms = 1 - smooth(span(t, ...B.arms));
		if (arms > 0.004) {
			const secs = live ? hand.secs : t;
			const ph = TAU * ((((secs / EPICYCLE.period) % 1) + 1) % 1);
			let X = 0;
			let Y = 0;
			let reach = 0;
			for (let k = 0; k < 8; k++) {
				const rk = ros.r[k];
				if (R * rk < 0.05) continue;
				const ang = ros.f[k] * ph;
				const nX = X + rk * Math.cos(ang);
				const nY = Y + rk * Math.sin(ang);
				const ring = [];
				for (let i = 0; i <= 64; i++) {
					const q = cam.project(
						W(X + rk * Math.cos((TAU * i) / 64), Y + rk * Math.sin((TAU * i) / 64))
					);
					ring.push([q[0], q[1]]);
				}
				stroke(ctx, ring, { width: 1, alpha: 0.08 * arms, cap: 'butt' });
				const a0 = cam.project(W(X, Y));
				const a1 = cam.project(W(nX, nY));
				stroke(
					ctx,
					[
						[a0[0], a0[1]],
						[a1[0], a1[1]]
					],
					{ width: 1, alpha: 0.3 * arms }
				);
				X = nX;
				Y = nY;
				reach += R * rk;
			}
			if (reach > 0.5) {
				const q = cam.project(W(X, Y));
				disc(ctx, q[0], q[1], 2.1, { fill: PAL.gold, alpha: 0.62 * arms });
			}
		}
		// The stop: the pivot, now on the body's axis.
		const L = TERM.layout(ctx, w, h);
		const sa = 1 - smooth(span(t, B.tilt[0] + 0.6, B.tilt[1]));
		if (sa > 0.004) {
			const q = cam.project(C);
			disc(ctx, q[0], q[1], L.stop.r, { fill: 'rgb(236, 230, 218)', alpha: 0.95 * sa });
		}
	}
	// intro/epicycle.js's gold trace (its run from t0, each stretch fading
	// behind the head), on this frame's projected curve.
	function trace(ctx, pts, t, t0) {
		const RUN = 1.2;
		if (t < t0 || t > t0 + RUN + 1.4) return;
		const N = pts.length - 1;
		const x = (t - t0) / RUN;
		const head = Math.min(N, Math.floor(N * clamp01(x)));
		const per = Math.max(2, Math.ceil(N / 120));
		for (let i0 = 0; i0 < head; i0 += per) {
			const i1 = Math.min(head, i0 + per);
			const tp = t0 + (RUN * (i0 + i1)) / 2 / N;
			const a = 0.85 * Math.exp(-Math.max(0, t - tp) / 0.25);
			if (a < 0.01) continue;
			stroke(ctx, pts.slice(i0, i1 + 1), { color: PAL.gold, width: 1.4, alpha: a, cap: 'butt' });
		}
	}

	// The body's construction axis: from the figure's centre out to the nose
	// and the tip as the lens rises.
	function axisLine(ctx, p, cam, t, origin) {
		const a = smooth(span(t, B.tilt[0] + 0.5, B.tilt[1])) * (1 - smooth(span(t, ...B.contour)));
		if (a <= 0.004) return;
		const grow = smooth(span(t, B.tilt[0] + 0.4, B.tail[1]));
		const C = sub3(add3(PATH.N0, mul3(EB_, p.sm)), origin);
		const nose = sub3(PATH.N0, origin);
		const tip = sub3(add3(PATH.N0, mul3(EB_, p.body.length)), origin);
		for (const e of [
			add3(C, mul3(sub3(nose, C), Math.min(1, grow * 4))),
			add3(C, mul3(sub3(tip, C), grow))
		])
			poly3(cam, [C, e], 0, 0.28 * a, 1);
		ink.flush(ctx);
	}

	// A depth buffer the body was filled into in its own frame (depths ÷ sc),
	// asked about world points.
	const scaled = (sc) => ({ hidden: (qq) => Z.hidden([qq[0], qq[1], qq[2] / sc]) });

	// ── The world: the compile, the conception, the interim ─────────────────
	function world(ctx, pl, p, w, h, t, hand) {
		const L = lensAt(pl, p, w, h, t);
		const cam = camera3({ pos: L.pos, target: L.tgt, up: L.up, fov: L.fov, w, h });
		const V = bodyView(pl, p, t, L, w, h);
		// The stars.
		const sa = smooth(span(t, B.tilt[0] + 0.4, B.tilt[1] + 0.8));
		const Zf = flown(pl, p, w, h, t);
		const Zv = (flown(pl, p, w, h, t + 0.02) - flown(pl, p, w, h, t - 0.02)) / 0.04;
		stars(ctx, cam, Zf, Math.max(0, Zv), sa);

		const sh = shapeAt(p, t);
		Z.reset(w, h);
		if (t >= B.rim[0]) {
			p.body.fillDepth(Z, V.cam, sh, V.pose);
			const depth = scaled(V.sc);
			if (t < B.log[1]) discFrame(ctx, pl, cam, t, w, h, depth);
			else {
				tunnelFrame(ctx, pl, cam, t, w, h, { depth });
				// The disc's apex, now the tunnel's far point (discFrame's light
				// at log = 1): it goes as the years come, and lights again for
				// the last day (farPoint).
				const ap = 0.7 * (1 - smooth(span(t, B.log[1], B.interim + 1.2)));
				const far = [0, 0, -1e5];
				if (ap > 0.01 && !depth.hidden(cam.project(far))) lit3(ctx, cam, far, 2, ap);
			}
		}
		if (t >= B.days - 2.5) farPoint(ctx, pl, cam, t);
		// The build: in the lens's frame (origin at the lens).
		if (t < B.contour[1]) axisLine(ctx, p, V.cam, t, L.pos);
		if (t >= B.head[0]) {
			const nr = ringsAt(p, t);
			p.body.draw(ctx, V.cam, sh, V.pose, {
				rings: nr / p.NR,
				gens: (j, G) => {
					const dj = (B.gens[1] - B.gens[0] - 0.9) / Math.max(1, G - 1);
					return smooth(span(t, B.gens[0] + j * dj, B.gens[0] + 0.9 + j * dj));
				},
				contour: smooth(span(t, ...B.contour)),
				back: 0.2 * (1 - smooth(span(t, B.swim, B.swim + 1.5)))
			});
		}
		if (t < B.head[0] + 3) figure(ctx, p, V.cam, t, hand, w, h, L.pos);
		// Life: the spark at the midpiece.
		const spark =
			span(t, B.life - 0.05, B.life + 0.1) *
			(1 - 0.8 * smooth(span(t, B.life + 0.2, B.life + 1.2)));
		if (spark > 0 && t < B.life + 1.4) lit3(ctx, V.cam, p.body.at(sh, V.pose, p.sMid), 2.2, spark);
	}

	// ── The fall ─────────────────────────────────────────────────────────────
	// Where the fall's background can show (fall.js's drawFall, its sums):
	// the level the lens is in (every glass it has passed dropped), its
	// plate's rectangle P (null once the lens is past the plate's plane:
	// the plate is the whole board) and its glass G, on the board.
	function backdrop(g, fc) {
		const { F, L, levels } = g;
		let base = 0;
		for (let k = 0; k < L; k++) {
			const lv = levels[k];
			if (fc.z <= lv.O[2] + lv.s * lv.glass.z + FALL.nearZ * fc.s) base = k + 1;
			else break;
		}
		const lv = levels[base];
		const box = (z, x, y, bw, bh) => {
			const wz = lv.O[2] + lv.s * z;
			const dw = fc.z - wz;
			if (dw <= FALL.nearZ * fc.s) return null;
			const m = (F * lv.s) / dw;
			const e = fc.ox + (F * (lv.O[0] - fc.x)) / dw;
			const f = fc.oy - (F * (lv.O[1] - fc.y)) / dw;
			const x0 = e + m * (x - bw / 2);
			const y0 = f - m * (y + bh / 2);
			return [x0, y0, x0 + bw * m, y0 + bh * m];
		};
		const P = box(0, 0, 0, PLATE.W, PLATE.H);
		const G = lv.glass ? box(lv.glass.z, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		return { P, G };
	}
	// A disc (x, y, r) wholly inside / touching a box [x0, y0, x1, y1].
	const inside = (X, x, y, r) => x - r >= X[0] && x + r <= X[2] && y - r >= X[1] && y + r <= X[3];
	const meets = (X, x, y, r) => x + r >= X[0] && x - r <= X[2] && y + r >= X[1] && y - r <= X[3];
	function fallFrame(ctx, pl, p, w, h, t) {
		const sh = shapeAt(p, t);
		const L = lensAt(pl, p, w, h, t);
		const cam3 = camera3({ pos: L.pos, target: L.tgt, up: L.up, fov: L.fov, w, h });
		const V = bodyView(pl, p, t, L, w, h);
		const Zf = uAt(pl, t);
		const Zv = (uAt(pl, t + 0.02) - uAt(pl, t - 0.02)) / 0.04;
		const bgFade = 1 - 0.55 * smooth(span(t, B.fall[0] + 0.5, B.fall[0] + 4));
		const background = (c, fc, zoom, strength) => {
			// Only where it can show: round the plate the lens is in front of
			// and in its glass (the rooms beyond hang in that glass) — clipped
			// there, and what lies wholly under the plate not drawn at all.
			const { P, G } = backdrop(pl.g, fc);
			if (!P && !G) return;
			const dx = fc.ox - w / 2;
			const dy = fc.oy - h / 2;
			const keep = (x, y, r) =>
				(P && !inside(P, x + dx, y + dy, r)) || (G && meets(G, x + dx, y + dy, r));
			c.save();
			c.beginPath();
			if (P) {
				c.rect(-4, -4, w + 8, h + 8);
				// Counter-wound, so it is cut out of the board's rectangle.
				c.moveTo(P[0], P[1]);
				c.lineTo(P[0], P[3]);
				c.lineTo(P[2], P[3]);
				c.lineTo(P[2], P[1]);
				c.closePath();
			}
			if (G) c.rect(G[0], G[1], G[2] - G[0], G[3] - G[1]);
			c.clip();
			c.translate(dx, dy);
			c.globalAlpha = strength;
			stars(c, cam3, Zf, Zv, bgFade);
			tunnelFrame(c, pl, cam3, t, w, h, { alpha: bgFade, labels: false, keep });
			c.restore();
		};
		const cam = pl.fall.draw(ctx, w, h, t, { background, colourAlong: false, dust: board.dust });
		// The first room comes up round the glass: what was there before (the
		// funnel, the hole, the glass) over the plate, going.
		const rise = 1 - smooth(span(t, ...B.rise));
		if (rise > 0.003) {
			const g = pl.g;
			const lv = g.levels[0];
			const dw = cam.z - lv.O[2];
			const m = g.F / dw;
			const ex = cam.ox + (g.F * (lv.O[0] - cam.x)) / dw;
			const ey = cam.oy - (g.F * (lv.O[1] - cam.y)) / dw;
			const pw = PLATE.W * m;
			const ph = PLATE.H * m;
			const R = [ex - pw / 2 - 2, ey - ph / 2 - 2, ex + pw / 2 + 2, ey + ph / 2 + 2];
			const dx = cam.ox - w / 2;
			const dy = cam.oy - h / 2;
			ctx.save();
			ctx.beginPath();
			ctx.rect(R[0], R[1], R[2] - R[0], R[3] - R[1]);
			ctx.clip();
			ctx.globalAlpha = rise;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			if (board.dust) {
				ctx.fillStyle = board.dust;
				ctx.fillRect(0, 0, w, h);
			}
			ctx.translate(dx, dy);
			stars(ctx, cam3, Zf, Zv, bgFade);
			tunnelFrame(ctx, pl, cam3, t, w, h, {
				alpha: bgFade,
				labels: false,
				keep: (x, y, r) => meets(R, x + dx, y + dy, r)
			});
			farPoint(ctx, pl, cam3, t);
			ctx.restore();
		}
		// The swimmer, leading: drawn at the fall's vanishing point, then on
		// into the last room's monitor, shrinking into its glass.
		const aim = smooth(span(t, ...B.aim));
		let gx = cam.ox;
		let gy = cam.oy;
		if (cam.glass) {
			gx = (cam.glass[0] + cam.glass[2]) / 2;
			gy = (cam.glass[1] + cam.glass[3]) / 2;
		}
		const alpha = 1 - smooth(span(t, B.hit - 0.12, B.hit));
		if (alpha > 0.01) {
			const away = lerp(1, 7, aim * aim);
			const pose = { ...V.pose, at: [XS, YS, -GAP * away] };
			ctx.save();
			ctx.translate(lerp(cam.ox, gx, aim) - w / 2, lerp(cam.oy, gy, aim) - h / 2);
			ctx.globalAlpha = alpha;
			p.body.draw(ctx, V.cam, sh, pose, { back: 0 });
			ctx.restore();
		}
		if (t >= B.hit && cam.glass) splash(ctx, cam.glass, t - B.hit, p.spice);
	}

	// ── The frame ────────────────────────────────────────────────────────────
	function render() {
		clearBoard(board);
		const { ctx, w, h } = board;
		const t = time.t;
		const hand = answers.hand(t);
		const p = person();
		const pl = plan(w, h);
		// The lab copies `info` once, at mount: its getters are not read again,
		// so the moment and the room are written here, for the test scripts.
		if (window.__lab) {
			window.__lab.t = t;
			window.__lab.decade = pl.decade;
		}
		if (t < B.hand) {
			intro.render(ctx, w, h, t, hand);
			// The questions go: the board drawn back over them.
			const v = smooth(span(t, ...B.veil));
			if (v > 0.003) {
				const R = EPICYCLE.radius(w, h);
				const y0 = 0.5 * (EPICYCLE.pivot[1] * h + R) + 0.5 * (0.72 * h - 30);
				ctx.save();
				ctx.globalAlpha = v;
				ctx.fillStyle = PAL.ground;
				ctx.fillRect(0, y0, w, h - y0);
				if (board.dust) {
					ctx.fillStyle = board.dust;
					ctx.fillRect(0, y0, w, h - y0);
				}
				ctx.restore();
			}
		} else if (t < B.fall[0]) {
			world(ctx, pl, p, w, h, t, hand);
		} else {
			fallFrame(ctx, pl, p, w, h, t);
		}
		caption(ctx, w, h, CAPTION.genetics, t, {
			at: B.genetics[0],
			until: B.genetics[1],
			align: 'center'
		});
		caption(ctx, w, h, CAPTION.conception, t, {
			at: B.conceive[0],
			until: B.conceive[1],
			align: 'center'
		});
		// A fade, and round.
		const o = smooth(span(t, ...B.out));
		if (o > 0.003) {
			ctx.save();
			ctx.globalAlpha = o;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			ctx.restore();
		}
		tag(ctx, w, h, 'flow-rosette');
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => answers.step(time, dt),
		render,
		resize() {
			intro.resize?.();
			PL = null;
		}
	};
}
