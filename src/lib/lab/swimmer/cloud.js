// ── log-swimmer · cloud — a haze condenses into the swimmer; e^z ahead ───────
// GENERATION (0–7.8 s). A seeded haze of chalk points — every node of the
// body's wireframe and two thousand more sampled over its skin by area —
// drifts as a cloud, seen whole (at 0–0.05). From 1 s they fly in, each
// swirling round the body's axis onto its own place on the surface, nose
// first and tail last (the head settled by 0.18, the tip by 0.34), the lens in
// on the head as it forms and drawing back down the body after it. Half a
// second behind the landing the wireframe CONNECTS the settled points:
// generatrices drawn down from the nose through the nodes, rings written
// round through them, the midpiece's helix last (0.17–0.39); the skin's points
// go out under the lines. Hidden lines go by a software depth buffer of the
// surface as far as it has formed (faint behind, bold in front); flying
// points behind it are hidden too. At 0.39 the beat starts, at 0.4 the roll.
//
// THE OBJECT: w = e^z. The strip |Im z| ≤ π ruled by a square grid of pitch
// 2π/24 is written out from under the swimmer (0.42–0.56), the line
// z = (¼ + i)t along it (0.49–0.55), cut by the strip into parallel pieces;
// then the strip is ROLLED into the punctured plane by
// w_s(z) = 1 + (e^{sz} − 1)/s, s from 0 (the strip, moved by 1) to 1
// (w = e^z) (0.55–0.68): every stage the grid's exact image under an entire,
// conformal map, z = 0 held at w = 1 where the swimmer is. At s = 1 the
// vertical lines are the circles |w| = e^{kΔ}, the horizontal ones the rays
// arg w = jΔ, the strip's two edges meet, and the line's pieces join into
// the logarithmic spiral e^{(¼+i)t}. The swimmer rides the line's image: its
// neck at w_s(z), its heading turned by arg w_s'(z) = s Im z and its size
// scaled by |w_s'(z)| = e^{s Re z} — the map's own similarity at that point,
// so it shrinks as it nears 0 and never reaches it (0 is the puncture; the
// lines thin out there). The lens comes down behind it (0.66–0.8) and rises
// over 0 to follow it in (0.78–1), its distance shrinking nearly as the
// swimmer does, so the spiral's turns stream in round it as it swims.
//
// EXACT: the grid, the line and the spiral, every stage of the rolling, the
// swimmer's place, heading and scale on the plane. A PICTURE: the body (a
// human sperm in proportion — a paddle head 5 × 3 × 1.4 with its acrosome cap
// over the front two-thirds, neck, a midpiece 4 × 1 with its mitochondrial
// helix, a 44-long tapering flagellum), the beat (a travelling tangent-angle
// wave, neck to tip, amplitude growing, a little out of plane, the centreline
// integrated so the tail keeps its length; the head yawing against it, the
// whole rolling), its height above the plane, its size in z, the lit point
// that marks it while it is too small to see, and the lens.

import {
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	camera3,
	add3,
	sub3,
	mul3,
	dot,
	norm,
	disc,
	bloom
} from '../log/board.js';
import { NEAR, makeDepth, spline } from '../log/space.js';

export const meta = {
	title: 'cloud — a chalk haze condenses onto the body; it swims the spiral of e^z toward 0',
	order: 3,
	seconds: 20,
	three: false
};

const SECONDS = meta.seconds;

// ── The body, in body units (µm) ─────────────────────────────────────────────
// s runs from the nose (0) to the tip (LEN). The head a paddle 5 long, 3 wide
// and about 1.4 thick, its cap (the acrosome) over the front two-thirds with a
// lip at its edge; the neck; the midpiece 4 long and 1 thick, its
// mitochondrial sheath a helix round it; the flagellum 45 long, tapering.
const LEN = 54;
const HEAD = 5;
const SREF = 5.4; // the neck: where the body hangs on its path
const MID0 = 5.8;
const MID1 = 9.8;
const END0 = 50;
const RIM = 0.63; // the cap's edge, as a fraction of the head

// Half-width W (in the head's flat plane) and half-thickness T at s.
function radii(s) {
	if (s <= HEAD) {
		const q = s / HEAD;
		const b = Math.sqrt(Math.max(0, Math.sin(Math.PI * Math.pow(q, 0.8))));
		const cap = 1 + 0.07 * (1 - smooth(span(q, RIM - 0.03, RIM + 0.03)));
		const nb = 0.42 * smooth(span(q, 0.75, 1));
		return [Math.max(1.5 * b * cap, nb), Math.max(0.85 * b * (0.62 + 0.42 * q) * cap, nb)];
	}
	let r;
	if (s <= MID0) r = lerp(0.42, 0.52, smooth(span(s, HEAD, MID0)));
	else if (s <= MID1) r = 0.52 - 0.1 * smooth(span(s, MID1 - 0.6, MID1));
	else if (s <= END0) r = lerp(0.4, 0.2, (s - MID1) / (END0 - MID1));
	else r = lerp(0.2, 0.05, (s - END0) / (LEN - END0));
	return [r, r];
}

// The samples down the body: close at the nose, where the head turns.
const SS = [];
for (const q of [0, 0.03, 0.08, 0.14, 0.21, 0.29, 0.38, 0.47, 0.56, RIM, 0.71, 0.8, 0.88, 0.95])
	SS.push(q * HEAD);
SS.push(HEAD, SREF, MID0);
for (let k = 1; k <= 8; k++) SS.push(MID0 + (k * (MID1 - MID0)) / 8);
for (let k = 1; k <= 27; k++) SS.push(MID1 + (k * (END0 - MID1)) / 27);
for (let k = 1; k <= 3; k++) SS.push(END0 + (k * (LEN - END0)) / 3);
const NS = SS.length;
const IREF = SS.indexOf(SREF);
const IHEAD = SS.indexOf(HEAD);
const IMID0 = SS.indexOf(MID0);
const IMID1 = SS.findIndex((s) => Math.abs(s - MID1) < 1e-9);
const IRIM = SS.findIndex((s) => Math.abs(s - RIM * HEAD) < 1e-9);
const RAD = SS.map(radii);
// Round the body: 32 places; the head's section a superellipse (flat faces,
// rounded edges), the rest round.
const NP = 32;
const SEC = SS.map((s) => {
	const e = s <= HEAD ? 0.77 : 1;
	const out = [];
	for (let j = 0; j < NP; j++) {
		const c = Math.cos((TAU * j) / NP);
		const n = Math.sin((TAU * j) / NP);
		out.push([Math.sign(c) * Math.pow(Math.abs(c), e), Math.sign(n) * Math.pow(Math.abs(n), e)]);
	}
	return out;
});
// The wireframe: rings at these samples, generatrices at these places round.
const RING = new Array(NS).fill(false);
for (const i of [2, 4, 6, 8, IRIM, 11, 13, IHEAD, IMID0, IMID1]) RING[i] = true;
for (let i = IMID1 + 2; i < NS - 1; i += 2) RING[i] = true;
const genAt = (i, j) => (i < IHEAD ? j % 2 === 0 : j % 4 === 0); // segment i → i+1
const isNode = (i, j) => RING[i] && (i <= IHEAD ? j % 2 === 0 : j % 4 === 0);

// ── The beat ─────────────────────────────────────────────────────────────────
// The flagellum's tangent angle is a wave travelling from the neck to the tip
// (a few wavelengths along it, its angle growing down the tail, a little
// out of plane so the beat is a flattened helix); the centreline is
// INTEGRATED from it, so the tail keeps its length and the tip draws back as
// it bends; the whole body turns about the neck against the tail's mean
// angle, which is the head's yaw; and the beat's plane and the head roll
// about the body's axis.
const K_BEAT = TAU / 21; // wavelength 21: a little over two waves on the tail
const AMP_T = (s) => 0.62 * (0.22 + 0.78 * smooth(span(s, MID0, 22)));
const YAW = 0.6;
const T_LIFE = 7.8;

// ── The exponential map ──────────────────────────────────────────────────────
// The strip |Im z| ≤ π, ruled by a square grid of pitch Δ = 2π/24, rolled into
// the punctured plane by w_s(z) = 1 + (e^{sz} − 1)/s: s = 0 is the strip
// itself (moved by 1), s = 1 is w = e^z. Every stage is the grid's image under
// an entire function, conformal; z = 0 stays put at w = 1 throughout, which is
// where the swimmer is made. The line z = (A + i)t through it, cut by the
// strip into parallel pieces, becomes the logarithmic spiral e^{(A+i)t}.
const A = 0.25;
const AI = Math.hypot(A, 1);
const DIRZ = [-A / AI, -1 / AI]; // down the line, toward Re z → −∞, w → 0
const DELTA = TAU / 24;
const KAPPA = 0.55; // the swimmer's length in z
const OMEGA = LEN / KAPPA; // world units to w: at |w| = 1 the swimmer is LEN long
const LIFT = 4; // the body's axis above the plane, in body units (the beat stays clear of it)

function ws(x, y, s) {
	if (s < 1e-4) return [1 + x + (s * (x * x - y * y)) / 2, y + s * x * y];
	const r = Math.exp(s * x);
	return [1 + (r * Math.cos(s * y) - 1) / s, (r * Math.sin(s * y)) / s];
}
const wWorld = (w) => [OMEGA * w[0], 0, -OMEGA * w[1]];

// ── Time ─────────────────────────────────────────────────────────────────────
const TL = (s) => 2.9 + 3.8 * Math.pow(s / LEN, 0.75); // when the haze has settled at s
const TW = (s) => TL(s) + 0.5; // when the wireframe reaches s
const sFront = (t) => (t <= TW(0) ? -1 : LEN * Math.pow((t - TW(0)) / 3.8, 1 / 0.75));
const STRIP = [8.4, 11.2]; // the strip written out from the swimmer
const LINE = [9.7, 11.0]; // the line written along itself
const ROLL = [10.9, 13.5]; // the strip rolled into the punctured plane
const rollOf = (t) => smooth(span(t, ...ROLL));
const T_V = 15.6; // the lens rises over 0 from here
// Past the last pinned frame (t = 20), as the clock runs on to round, it all
// goes back to the dark the haze comes out of.
const OUT = (t) => 1 - smooth(span(t, SECONDS + 0.4, SECONDS + 1.2));

// Speeds, as rates, integrated once into tables so every frame is a pure
// function of t: body lengths a second, the beat's phase, the roll.
const speedAt = (t) =>
	0.3 * smooth(span(t, 8.8, 10.4)) +
	1.2 * smooth(span(t, 12.8, 15.8)) +
	0.2 * smooth(span(t, 15.4, 20));
const omegaAt = (t) =>
	TAU * (1.5 + 3.5 * smooth(span(t, 12.2, 16.2))) * smooth(span(t, T_LIFE - 0.1, T_LIFE + 0.5));
const rollRateAt = (t) => TAU * (0.36 * smooth(span(t, 7.8, 8.6)) + 0.2 * smooth(span(t, 13, 18)));
const DTT = 1 / 120;
const NT = Math.ceil((SECONDS + 1.5) / DTT) + 2;
const TAB = { d: new Float64Array(NT), ph: new Float64Array(NT), r: new Float64Array(NT) };
{
	let d = 0;
	let ph = 0;
	let r = 0;
	for (let k = 0; k < NT; k++) {
		TAB.d[k] = d;
		TAB.ph[k] = ph;
		TAB.r[k] = r;
		const tm = (k + 0.5) * DTT;
		d += KAPPA * speedAt(tm) * DTT;
		ph += omegaAt(tm) * DTT;
		r += rollRateAt(tm) * DTT;
	}
}
function look(T, t) {
	const x = Math.min(NT - 1.001, Math.max(0, t / DTT));
	const k = Math.floor(x);
	return lerp(T[k], T[k + 1], x - k);
}

// ── Where the swimmer is ─────────────────────────────────────────────────────
// Its neck on the line's image, carried by w_s: its place w_s(z), its size by
// |w_s'(z)| = e^{s Re z} and its heading turned by arg w_s'(z) = s Im z — the
// map's derivative at the neck, a similarity.
function poseAt(t) {
	const D = look(TAB.d, t);
	const zx = DIRZ[0] * D;
	const zy = DIRZ[1] * D;
	const s = rollOf(t);
	const w = ws(zx, zy, s);
	const m = Math.exp(s * zx);
	const rot = s * zy;
	const hc = [
		DIRZ[0] * Math.cos(rot) - DIRZ[1] * Math.sin(rot),
		DIRZ[0] * Math.sin(rot) + DIRZ[1] * Math.cos(rot)
	];
	const hd = [hc[0], 0, -hc[1]];
	const L = [hd[2], 0, -hd[0]]; // left: up × forward
	const neck = [OMEGA * w[0], LIFT * m, -OMEGA * w[1]];
	return { neck, hd, L, m, zx, zy, s, D };
}
const M_V = poseAt(T_V).m; // the swimmer's scale as the lens starts to rise

// ── The body at t, in its own frame (x forward, y left, z up) ───────────────
function bodyAt(t, sRoll) {
	const amp = smooth(span(t, T_LIFE, T_LIFE + 1.6));
	const ph = look(TAB.ph, t);
	const R = look(TAB.r, t);
	const front = MID0 + ph / K_BEAT;
	// The path's own turning, carried into the body: the tail follows the curve.
	const curv = (sRoll * KAPPA) / (LEN * AI);
	const tb = new Float64Array(NS);
	const pb = new Float64Array(NS);
	if (amp > 0) {
		let m1 = 0;
		let m2 = 0;
		let ws0 = 0;
		for (let i = IMID0; i < NS; i++) {
			const s = SS[i];
			const a = amp * smooth(span(front - s, 0, 10)) * AMP_T(s);
			const arg = K_BEAT * (s - MID0) - ph;
			tb[i] = a * Math.sin(arg);
			pb[i] = 0.3 * a * Math.cos(arg);
			const d = SS[Math.min(NS - 1, i + 1)] - SS[i - 1];
			m1 += tb[i] * d;
			m2 += pb[i] * d;
			ws0 += d;
		}
		m1 = (YAW * m1) / ws0;
		m2 = (YAW * m2) / ws0;
		for (let i = 0; i < NS; i++) {
			tb[i] -= m1;
			pb[i] -= m2;
		}
	}
	const cr = Math.cos(R);
	const sr = Math.sin(R);
	const F = new Array(NS);
	for (let i = 0; i < NS; i++) {
		const k = Math.max(i, IREF); // the head is rigid
		const th = tb[k] * cr - pb[k] * sr + curv * (SS[k] - SREF);
		const ps = tb[k] * sr + pb[k] * cr;
		F[i] = [Math.cos(ps) * Math.cos(th), Math.cos(ps) * Math.sin(th), Math.sin(ps)];
	}
	const C = new Array(NS);
	C[IREF] = [0, 0, 0];
	for (let i = IREF; i < NS - 1; i++) {
		const f = norm(add3(F[i], F[i + 1]));
		C[i + 1] = sub3(C[i], mul3(f, SS[i + 1] - SS[i]));
	}
	for (let i = IREF; i > 0; i--) C[i - 1] = add3(C[i], mul3(F[i], SS[i] - SS[i - 1]));
	// Frames: the head's flat plane rolled, carried down the body.
	const N1 = new Array(NS);
	const N2 = new Array(NS);
	const ortho = (v, f) => norm(sub3(v, mul3(f, dot(v, f))));
	const crs = (a, b) => [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
	N1[IREF] = ortho([0, cr, sr], F[IREF]);
	N2[IREF] = crs(F[IREF], N1[IREF]);
	for (let i = IREF + 1; i < NS; i++) {
		N1[i] = ortho(N1[i - 1], F[i]);
		N2[i] = crs(F[i], N1[i]);
	}
	for (let i = IREF - 1; i >= 0; i--) {
		N1[i] = N1[IREF];
		N2[i] = N2[IREF];
	}
	return { C, F, N1, N2 };
}

// ── Ink: segments and dots batched by alpha and width ────────────────────────
function makeInk() {
	const B = new Map();
	return {
		seg(alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.02) return;
			const a = Math.min(24, Math.round(alpha * 24));
			const wq = Math.max(2, Math.round(width * 4));
			const key = a * 100 + wq;
			let b = B.get(key);
			if (!b) {
				b = { alpha: a / 24, width: wq / 4, P: [] };
				B.set(key, b);
			}
			b.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.strokeStyle = PAL.chalk;
			for (const b of B.values()) {
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length; i += 4) {
					ctx.moveTo(P[i], P[i + 1]);
					ctx.lineTo(P[i + 2], P[i + 3]);
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}
function makeDots() {
	const B = new Map();
	return {
		dot(x, y, r, alpha) {
			if (alpha < 0.02 || r <= 0) return;
			const a = Math.min(20, Math.round(alpha * 20));
			let b = B.get(a);
			if (!b) {
				b = { alpha: a / 20, P: [] };
				B.set(a, b);
			}
			b.P.push(x, y, r);
		},
		flush(ctx) {
			ctx.save();
			ctx.fillStyle = PAL.chalk;
			for (const b of B.values()) {
				ctx.globalAlpha = b.alpha;
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length; i += 3) {
					const r = P[i + 2];
					if (r < 1.1) ctx.rect(P[i] - r, P[i + 1] - r, 2 * r, 2 * r);
					else {
						ctx.moveTo(P[i] + r, P[i + 1]);
						ctx.arc(P[i], P[i + 1], r, 0, TAU);
					}
				}
				ctx.fill();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// Behind the surface in the depth buffer? The deepest of the four cells round
// the point, so a silhouette stays drawn; `slack` in world units.
function behind(Z, x, y, z, slack) {
	const s = Z.s;
	const fx = x / s - 0.5;
	const fy = y / s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const b = Z.buf;
	const k = y0 * Z.W + x0;
	const m = Math.max(b[k], b[k + 1], b[k + Z.W], b[k + Z.W + 1]);
	return z > m + slack;
}

// A seeded random, so the haze is the same haze on every load.
function rng(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const gauss = (r) => (r() + r() + r() + r() - 2) * 1.2247;

export async function make() {
	const Z = makeDepth(4);
	const rand = rng(20260321);

	// ── The haze, and where each of its points lands ─────────────────────────
	// The rest body (straight, still) at the swimmer's first place.
	const P0 = poseAt(0);
	const toW0 = (p) => toWorld(P0, p);
	// Points: every node of the wireframe, and two thousand more over the skin.
	const pts = [];
	const restPoint = (s, cx, cy) => {
		const [W, T] = radii(s);
		return [SREF - s, W * cx, T * cy];
	};
	for (let i = 0; i < NS; i++)
		for (let j = 0; j < NP; j++) {
			if (i === 0 && j > 0) continue;
			if (i > 0 && !isNode(i, j)) continue;
			pts.push({ node: true, i, j, s: SS[i] });
		}
	// The skin, by area (the head weighted up, so its shape is dense).
	const cum = [];
	let tot = 0;
	for (let k = 0; k < 400; k++) {
		const s = ((k + 0.5) / 400) * LEN;
		const [W, T] = radii(s);
		tot += Math.PI * (W + T) * (s < HEAD + 0.5 ? 1.8 : 1);
		cum.push([s, tot]);
	}
	for (let n = 0; n < 2000; n++) {
		const x = rand() * tot;
		let k = 0;
		while (cum[k][1] < x) k++;
		const s = Math.min(LEN, Math.max(0, cum[k][0] + (rand() - 0.5) * (LEN / 400)));
		const ph = rand() * TAU;
		const e = s <= HEAD ? 0.77 : 1;
		const c = Math.cos(ph);
		const sn = Math.sin(ph);
		const cx = Math.sign(c) * Math.pow(Math.abs(c), e);
		const cy = Math.sign(sn) * Math.pow(Math.abs(sn), e);
		const p = restPoint(s, cx, cy);
		// Its outward normal, by differences over the rest surface.
		const h = 0.05;
		const pa = restPoint(Math.max(0, s - h), cx, cy);
		const pz = restPoint(Math.min(LEN, s + h), cx, cy);
		const ph2 = ph + 0.05;
		const c2 = Math.cos(ph2);
		const s2 = Math.sin(ph2);
		const q2 = restPoint(
			s,
			Math.sign(c2) * Math.pow(Math.abs(c2), e),
			Math.sign(s2) * Math.pow(Math.abs(s2), e)
		);
		let nrm = norm(crossv(sub3(pz, pa), sub3(q2, p)));
		if (dot(nrm, [0, p[1], p[2]]) < 0 && s > 0.2) nrm = mul3(nrm, -1);
		if (s <= 0.2) nrm = [1, 0, 0];
		pts.push({ node: false, s, rest: toW0(p), nrm: dirW(P0, nrm) });
	}
	// Each point's haze: a seeded place in a cloud round the body, a slow drift;
	// its flight: when, how long, and how far it swirls round the axis.
	const centre = toW0([SREF - 22, 0, 0]);
	const ax = P0.hd;
	const ex = P0.L;
	const ey = [0, 1, 0];
	for (const p of pts) {
		const h = [gauss(rand) * 22, gauss(rand) * 10, gauss(rand) * 9];
		p.h0 = add3(centre, add3(mul3(ax, h[0]), add3(mul3(ex, h[1]), mul3(ey, h[2]))));
		p.dr = [rand() * TAU, rand() * TAU, rand() * TAU, 0.5 + rand(), 0.5 + rand(), 0.5 + rand()];
		p.end = TL(p.s) - 0.6 * rand();
		p.dur = Math.min(1.5 + 0.9 * rand(), p.end - 1); // none leaves before 1 s
		p.turns = 0.35 + 0.45 * rand();
		p.size = 0.8 + 0.5 * rand();
	}
	const axisOrigin = P0.neck;
	// The haze at t: drifting, and turning slowly round the body's axis.
	const hazeAt = (p, t) => {
		const d = p.dr;
		const q = add3(p.h0, [
			3 * Math.sin(0.33 * d[3] * t + d[0]),
			2.4 * Math.sin(0.29 * d[4] * t + d[1]),
			3 * Math.sin(0.25 * d[5] * t + d[2])
		]);
		const c = cyl(q, 0.05 * t);
		c[1] *= 1 - 0.4 * smooth(span(t, 0, 6.5)); // the whole cloud tightens
		return c;
	};
	// Cylindrical about the axis through the neck: [x along, r, angle].
	const cyl = (q, turn = 0) => {
		const v = sub3(q, axisOrigin);
		const x = dot(v, ax);
		const a = dot(v, ex);
		const b = dot(v, ey);
		return [x, Math.hypot(a, b), Math.atan2(b, a) + turn];
	};
	const fromCyl = ([x, r, th]) =>
		add3(
			axisOrigin,
			add3(mul3(ax, x), add3(mul3(ex, r * Math.cos(th)), mul3(ey, r * Math.sin(th))))
		);

	// ── Per frame ────────────────────────────────────────────────────────────
	const G = new Float64Array(NS * NP * 3); // the surface, world
	const Q = new Float64Array(NS * NP * 3); // projected
	const Nn = new Float64Array(NS * NP); // facing: n · (eye − p)
	const CW = new Array(NS);

	function render(ctx, w, h, t) {
		const pose = poseAt(t);
		const body = bodyAt(t, pose.s);
		const { m } = pose;
		for (let i = 0; i < NS; i++) {
			const [W, T] = RAD[i];
			const c = body.C[i];
			const n1 = body.N1[i];
			const n2 = body.N2[i];
			CW[i] = toWorld(pose, c);
			for (let j = 0; j < NP; j++) {
				const [cx, cy] = SEC[i][j];
				const p = toWorld(pose, [
					c[0] + W * cx * n1[0] + T * cy * n2[0],
					c[1] + W * cx * n1[1] + T * cy * n2[1],
					c[2] + W * cx * n1[2] + T * cy * n2[2]
				]);
				const k = (i * NP + j) * 3;
				G[k] = p[0];
				G[k + 1] = p[1];
				G[k + 2] = p[2];
			}
		}
		const cam = lens(t, pose, w, h);
		const eye = cam.pos;
		const ref = Math.hypot(...sub3(pose.neck, eye));
		const wOf = (z) => Math.min(2.2, Math.max(0.55, ref / z));
		for (let k = 0; k < NS * NP; k++) {
			const q = cam.project([G[3 * k], G[3 * k + 1], G[3 * k + 2]]);
			Q[3 * k] = q[0];
			Q[3 * k + 1] = q[1];
			Q[3 * k + 2] = q[2];
		}
		// Facing: the surface normal from the grid's own differences.
		const fwdW = dirW(pose, body.F[0]);
		for (let i = 0; i < NS; i++)
			for (let j = 0; j < NP; j++) {
				const k = i * NP + j;
				const px = G[3 * k];
				const py = G[3 * k + 1];
				const pz = G[3 * k + 2];
				let n;
				if (i === 0) n = fwdW;
				else {
					const a = (Math.min(NS - 1, i + 1) * NP + j) * 3;
					const b = ((i - 1) * NP + j) * 3;
					const c = (i * NP + ((j + 1) % NP)) * 3;
					const d = (i * NP + ((j + NP - 1) % NP)) * 3;
					const ds = [G[a] - G[b], G[a + 1] - G[b + 1], G[a + 2] - G[b + 2]];
					const dp = [G[c] - G[d], G[c + 1] - G[d + 1], G[c + 2] - G[d + 2]];
					n = crossv(ds, dp);
					const cw = CW[i];
					if (n[0] * (px - cw[0]) + n[1] * (py - cw[1]) + n[2] * (pz - cw[2]) < 0) n = mul3(n, -1);
				}
				Nn[k] = n[0] * (eye[0] - px) + n[1] * (eye[1] - py) + n[2] * (eye[2] - pz);
			}

		// The depth buffer: the surface as far as it has formed.
		Z.reset(w, h);
		let bx0 = Infinity;
		let by0 = Infinity;
		let bx1 = -Infinity;
		let by1 = -Infinity;
		const pq = (k) => [Q[3 * k], Q[3 * k + 1], Q[3 * k + 2]];
		for (let i = 0; i < NS - 1; i++) {
			if (t < TW(SS[i + 1]) + 0.25) break;
			for (let j = 0; j < NP; j += 2) {
				const a = pq(i * NP + j);
				const b = pq((i + 1) * NP + j);
				const c = pq((i + 1) * NP + ((j + 2) % NP));
				const d = pq(i * NP + ((j + 2) % NP));
				Z.tri(a, b, c);
				Z.tri(a, c, d);
				for (const q of [a, b]) {
					if (q[0] < bx0) bx0 = q[0];
					if (q[0] > bx1) bx1 = q[0];
					if (q[1] < by0) by0 = q[1];
					if (q[1] > by1) by1 = q[1];
				}
			}
		}
		const occ = (x, y, z, slack) =>
			x > bx0 - 8 && x < bx1 + 8 && y > by0 - 8 && y < by1 + 8 && behind(Z, x, y, z, slack);

		// The plane: the strip and its rolling, under everything.
		const ink = makeInk();
		plane(ink, cam, t, pose, occ, w, h, ref, m);
		ink.flush(ctx);

		// The swimmer's lines: generatrices behind the settling front, rings
		// written round through their nodes, the midpiece's helix.
		const lenPx = (LEN * m * (h / 2 / Math.tan((FOV * Math.PI) / 360))) / ref;
		const detail = smooth(span(lenPx, 140, 260));
		const sF = sFront(t);
		const frontA = 0.86 * OUT(t);
		const backA = 0.1 * detail * OUT(t);
		const slack = 0.5 * m;
		const segK = (ka, kb, alpha, width) => {
			const xa = Q[3 * ka];
			const ya = Q[3 * ka + 1];
			const za = Q[3 * ka + 2];
			const xb = Q[3 * kb];
			const yb = Q[3 * kb + 1];
			const zb = Q[3 * kb + 2];
			if (za <= NEAR || zb <= NEAR) return;
			const mx = (xa + xb) / 2;
			const my = (ya + yb) / 2;
			const mz = (za + zb) / 2;
			const front = Nn[ka] + Nn[kb] > 0 && !occ(mx, my, mz, slack);
			const wd = width * wOf(mz);
			if (front) ink.seg(alpha * frontA, wd, xa, ya, xb, yb);
			else ink.seg(alpha * backA, wd * 0.7, xa, ya, xb, yb);
		};
		// Generatrices.
		for (let i = 0; i < NS - 1 && SS[i] < sF; i++) {
			const f = Math.min(1, (sF - SS[i]) / (SS[i + 1] - SS[i]));
			for (let j = 0; j < NP; j++) {
				if (!genAt(i, j)) continue;
				const fine = i < IHEAD ? j % 4 !== 0 : false;
				const al = fine ? lerp(0.35, 1, detail) : 1;
				const ka = i * NP + j;
				const kb = (i + 1) * NP + j;
				if (f < 1) {
					// The growing end: part of the segment.
					const xa = Q[3 * ka];
					const ya = Q[3 * ka + 1];
					const xb = lerp(xa, Q[3 * kb], f);
					const yb = lerp(ya, Q[3 * kb + 1], f);
					if (Nn[ka] > 0) ink.seg(al * frontA, wOf(Q[3 * ka + 2]), xa, ya, xb, yb);
				} else segK(ka, kb, al, 1);
			}
		}
		// Rings.
		for (let i = 1; i < NS; i++) {
			if (!RING[i]) continue;
			const pr = smooth(span(t, TW(SS[i]), TW(SS[i]) + 0.55));
			if (pr <= 0) continue;
			const n = Math.ceil(pr * NP);
			const rim = i === IRIM;
			const tail = i > IMID1;
			const al = (rim ? 1.1 : 1) * (tail ? lerp(0.6, 1, detail) : 1);
			const wd = rim ? 1.5 : 1;
			for (let j = 0; j < n; j++) {
				const ja = (j + NP / 4) % NP; // written from the top
				const jb = (ja + 1) % NP;
				segK(i * NP + ja, i * NP + jb, al, wd);
			}
		}
		// The midpiece's mitochondrial helix.
		const hx = smooth(span(t, TW(MID1), TW(MID1) + 0.8)) * smooth(span(lenPx, 220, 420));
		if (hx > 0.01) helix(ink, cam, pose, body, eye, occ, slack, hx * frontA, backA * hx, wOf);
		ink.flush(ctx);

		// While the swimmer is too small to read (the lens up over the strip as
		// it rolls), a lit point at its nose says where it is.
		const lit = (1 - smooth(span(lenPx, 26, 80))) * smooth(span(t, 9.2, 10.2));
		if (lit > 0.01) {
			const q = cam.project(toWorld(pose, body.C[0]));
			if (q[2] > NEAR) {
				bloom(ctx, q[0], q[1], 15, 'rgba(245, 193, 80, 0.55)', 0.7 * lit);
				disc(ctx, q[0], q[1], 2.5, { fill: PAL.gold, alpha: lit });
			}
		}

		// The haze: drifting, flying in, settling; the skin's points go out as
		// the wireframe is drawn over them, the nodes as the swimmer comes to life.
		const dots = makeDots();
		if (t < T_LIFE + 2.2) {
			for (const p of pts) {
				const t0 = p.end - p.dur;
				const u = span(t, t0, p.end);
				let X;
				let a;
				let r;
				let landed = false;
				if (u <= 0) {
					X = fromCyl(hazeAt(p, t));
					a = 0.34 * smooth(span(t, 0, 0.8)); // out of the dark
					r = 1;
				} else {
					const target = p.node ? gridPoint(G, p.i, p.j) : p.rest;
					if (u >= 1) {
						X = target;
						landed = true;
					} else {
						const H = hazeAt(p, t);
						const T = cyl(target);
						let dth = (((T[2] - H[2]) % TAU) + TAU) % TAU;
						dth += TAU * p.turns;
						const e = u * u * (3 - 2 * u);
						const er = 1 - Math.pow(1 - u, 2.2);
						X = fromCyl([lerp(H[0], T[0], e), lerp(H[1], T[1], er), H[2] + dth * e]);
					}
					a = lerp(0.34, 0.95, smooth(u));
					r = lerp(1, 1.25, u);
				}
				const q = cam.project(X);
				if (q[2] <= NEAR) continue;
				if (landed) {
					const flash = 1 - smooth(span(t, p.end, p.end + 0.45));
					const facing = p.node ? Nn[p.i * NP + p.j] > 0 : dot(p.nrm, sub3(eye, p.rest)) > 0;
					const formed = smooth(span(t, TW(p.s), TW(p.s) + 0.4));
					const hidden = !facing || occ(q[0], q[1], q[2], slack);
					a = (hidden ? lerp(0.35, 0.04, formed) : 0.85) + 0.4 * flash;
					r = 1.1 + 0.9 * flash;
					if (p.node) a *= 1 - smooth(span(t, T_LIFE + 0.2, T_LIFE + 2));
					else {
						a *= lerp(1, 0.25, smooth(span(t, TW(p.s) + 0.2, TW(p.s) + 1.2)));
						a *= 1 - smooth(span(t, T_LIFE - 0.8, T_LIFE));
						r *= 0.8;
					}
				} else if (occ(q[0], q[1], q[2], slack)) continue;
				const sz = r * p.size * Math.min(2.4, Math.max(0.5, ref / q[2]));
				const fa = Math.min(1, Math.max(0.3, (1.4 * ref) / q[2]));
				dots.dot(q[0], q[1], sz, a * fa);
			}
		}
		dots.flush(ctx);
	}

	// The lens: three rigs — round the body as it forms, high over the strip
	// as it rolls, and behind the swimmer down the spiral — each a target, a
	// direction and a distance, blended (the distance geometrically).
	function lens(t, pose, w, h) {
		const { neck, hd, L, m } = pose;
		const U = [0, 1, 0];
		// G: on the body as it forms — in close on the head as the haze lands
		// there, drawing back down the body as the front runs to the tip, and
		// round from above it to its side.
		const az = lerp(0.25, 0.95, smooth(span(t, 0, 9.5)));
		const el = lerp(0.95, 0.2, smooth(span(t, 0.4, 7.8)));
		const gDir = norm(
			add3(
				mul3(add3(mul3(L, Math.cos(az)), mul3(hd, Math.sin(az))), Math.cos(el)),
				mul3(U, Math.sin(el))
			)
		);
		const focus = spline(t, [
			[0, 20],
			[3.1, 2.5],
			[7.6, 24],
			[9.5, 26]
		]);
		const gDist = Math.exp(
			spline(t, [
				[0, Math.log(92)],
				[3.1, Math.log(23)],
				[7.6, Math.log(58)],
				[9.5, Math.log(66)]
			])
		);
		const rigG = { target: toWorld(pose, [SREF - focus, 0, 0]), dir: gDir, dist: gDist * m };
		// O: high over the strip, from where the swimmer comes.
		const rigO = {
			target: wWorld([-0.1, 0.2]),
			dir: norm([0.32, 1.2, -1]),
			dist: 8 * OMEGA
		};
		// F: behind the swimmer, out from the centre and up, looking in.
		const l = LEN * m;
		const rigAt = (p, q) => {
			const pos = add3(neck, add3(mul3(hd, p[0] * l), add3(mul3(L, p[1] * l), mul3(U, p[2] * l))));
			const tgt = add3(neck, add3(mul3(hd, q[0] * l), mul3(L, q[1] * l)));
			return { target: tgt, dir: norm(sub3(pos, tgt)), dist: Math.hypot(...sub3(pos, tgt)) };
		};
		const rigF = rigAt([-1.6, 0.6, 2.2], [-0.3, -0.9]);
		// V: up over 0, looking in across it from outside the swimmer, hung at
		// a scale that shrinks a little slower than the swimmer's own, so the
		// swimmer is seen going in toward the centre and down into its turns.
		const er = norm([neck[0], 0, neck[2]]);
		const lv = LEN * m * Math.pow(M_V / m, 0.5);
		const rigV = {
			target: mul3(er, 0.9 * lv),
			dir: norm(add3(mul3(er, Math.cos(0.95)), mul3(U, Math.sin(0.95)))),
			dist: 2.3 * lv
		};
		let rig = blend(rigG, rigO, smooth(span(t, 9.2, 11.8)));
		rig = blend(rig, rigF, smooth(span(t, 13.2, 16)));
		rig = blend(rig, rigV, smooth(span(t, 15.6, 19.6)));
		const pos = add3(rig.target, mul3(rig.dir, rig.dist));
		return camera3({ pos, target: rig.target, up: U, fov: FOV, w, h });
	}

	return { render };
}

const FOV = 40;

function blend(A, B, e) {
	if (e <= 0) return A;
	if (e >= 1) return B;
	const dist = Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), e));
	const eT = (dist - A.dist) / (B.dist - A.dist || 1);
	return {
		target: [
			lerp(A.target[0], B.target[0], eT),
			lerp(A.target[1], B.target[1], eT),
			lerp(A.target[2], B.target[2], eT)
		],
		dir: norm([
			lerp(A.dir[0], B.dir[0], e),
			lerp(A.dir[1], B.dir[1], e),
			lerp(A.dir[2], B.dir[2], e)
		]),
		dist
	};
}

const crossv = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];

// Body frame → world: x forward, y left, z up, scaled by m about the neck.
function toWorld(pose, p) {
	const { neck, hd, m } = pose;
	return [
		neck[0] + m * (p[0] * hd[0] + p[1] * hd[2]),
		neck[1] + m * p[2],
		neck[2] + m * (p[0] * hd[2] - p[1] * hd[0])
	];
}
function dirW(pose, v) {
	const { hd } = pose;
	return [v[0] * hd[0] + v[1] * hd[2], v[2], v[0] * hd[2] - v[1] * hd[0]];
}
function gridPoint(G, i, j) {
	const k = (i * NP + j) * 3;
	return [G[k], G[k + 1], G[k + 2]];
}

// The midpiece's sheath: a helix of pitch 0.32 on its surface.
function helix(ink, cam, pose, body, eye, occ, slack, aF, aB, wOf) {
	const n = 110;
	let prev = null;
	for (let k = 0; k <= n; k++) {
		const s = MID0 + ((MID1 - MID0) * k) / n;
		let i = IMID0;
		while (i < IMID1 && SS[i + 1] < s) i++;
		const f = (s - SS[i]) / (SS[i + 1] - SS[i]);
		const C = add3(mul3(body.C[i], 1 - f), mul3(body.C[i + 1], f));
		const n1 = add3(mul3(body.N1[i], 1 - f), mul3(body.N1[i + 1], f));
		const n2 = add3(mul3(body.N2[i], 1 - f), mul3(body.N2[i + 1], f));
		const ph = (TAU * (s - MID0)) / 0.32;
		const r = radii(s)[0] * 1.02;
		const dirB = add3(mul3(n1, Math.cos(ph)), mul3(n2, Math.sin(ph)));
		const P = toWorld(pose, add3(C, mul3(dirB, r)));
		const q = cam.project(P);
		const nW = dirW(pose, dirB);
		const fac = dot(nW, sub3(eye, P)) > 0;
		if (prev && q[2] > NEAR && prev.q[2] > NEAR) {
			const mx = (q[0] + prev.q[0]) / 2;
			const my = (q[1] + prev.q[1]) / 2;
			const mz = (q[2] + prev.q[2]) / 2;
			const front = fac && prev.fac && !occ(mx, my, mz, slack);
			ink.seg(front ? aF : aB, wOf(mz) * (front ? 0.9 : 0.6), prev.q[0], prev.q[1], q[0], q[1]);
		}
		prev = { q, fac };
	}
}

// ── The plane ────────────────────────────────────────────────────────────────
// The strip's grid and the line, through w_s: written out from z = 0 (under
// the swimmer), then rolled. Lines fade at the puncture (where the rays meet)
// and where they are too fine to see; the window of Re z follows the swimmer
// in, so the grid is drawn at every depth the lens reaches.
function plane(ink, cam, t, pose, occ, w, h, ref, m) {
	// Written out from z = 0 at a rate that keeps pace with the lens drawing
	// back: the radius grows geometrically, its soft edge with it.
	const uR = smooth(span(t, ...STRIP));
	if (uR <= 0) return;
	const Rf = 0.32 * Math.exp(3.54 * uR);
	const inA = smooth(span(t, STRIP[0], STRIP[0] + 0.7)) * OUT(t);
	const s = pose.s;
	const xsw = pose.zx;
	const kLo = Math.floor(Math.min(-3.95, xsw - 5.2) / DELTA);
	const kHi = 3;
	const xLo = kLo * DELTA;
	const xHi = kHi * DELTA;
	const kc = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const wOf = (z) => Math.min(2, Math.max(0.5, ref / z));
	const deep = (z) => Math.min(1, Math.max(0.3, (1.8 * ref) / z));
	// The puncture: where the rays meet, w = 1 − 1/s (0 when rolled).
	const cq = s > 0.02 ? cam.project(wWorld([1 - 1 / s, 0])) : null;
	const slack = 0.4 * m;
	const fadeIn = (zx, zy) => smooth(span(Rf - Math.hypot(zx, zy), 0, 0.3 * Rf));
	const M = 60;
	const seg = (a, b, alpha, width) => {
		if (a[2] <= NEAR || b[2] <= NEAR) return;
		if ((a[0] < -M && b[0] < -M) || (a[0] > w + M && b[0] > w + M)) return;
		if ((a[1] < -M && b[1] < -M) || (a[1] > h + M && b[1] > h + M)) return;
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const mz = (a[2] + b[2]) / 2;
		let al = alpha * deep(mz) * inA;
		if (cq) al *= smooth(span(Math.hypot(mx - cq[0], my - cq[1]), 3, 18));
		if (al < 0.02) return;
		if (occ(mx, my, mz, slack)) return;
		ink.seg(al, width * wOf(mz), a[0], a[1], b[0], b[1]);
	};
	const P = (x, y) => cam.project(wWorld(ws(x, y, s)));
	// A circle's size on the board, for the fine ones at the centre.
	const cd = cq ? Math.max(NEAR, cq[2]) : ref;
	// Vertical lines Re z = kΔ: circles when rolled.
	for (let k = kLo; k <= kHi; k++) {
		const x = k * DELTA;
		const rPx = (kc * OMEGA * Math.exp(s * x)) / Math.max(1, s) / cd;
		const fine = s > 0.5 ? smooth(span(rPx, 4, 14)) : 1;
		if (fine < 0.02) continue;
		const edge = k === kHi || k === kLo;
		const n = rPx > 300 ? 96 : rPx > 80 ? 64 : 32;
		let prev = null;
		let pz = null;
		for (let i = 0; i <= n; i++) {
			const y = -Math.PI + (TAU * i) / n;
			const q = P(x, y);
			if (prev) {
				const f = fadeIn(x, (y + pz) / 2);
				if (f > 0) seg(prev, q, f * fine * (edge ? 0.55 : 0.4), edge ? 1.2 : 1);
			}
			prev = q;
			pz = y;
		}
	}
	// Horizontal lines Im z = jΔ: rays when rolled; the two edges ±π meet.
	for (let j = -12; j <= 12; j++) {
		const y = j * DELTA;
		const edge = Math.abs(j) === 12;
		const ea = j === 12 ? 1 - smooth(span(s, 0.9, 1)) : 1;
		const n = Math.round((xHi - xLo) / (DELTA / 2));
		let prev = null;
		let px = null;
		for (let i = 0; i <= n; i++) {
			const x = xLo + ((xHi - xLo) * i) / n;
			const q = P(x, y);
			if (prev) {
				const f = fadeIn((x + px) / 2, y);
				if (f > 0) seg(prev, q, ea * f * (edge ? 0.55 : 0.4), edge ? 1.2 : 1);
			}
			prev = q;
			px = x;
		}
	}
	// The line z = (A + i)t, cut into pieces by the strip; the spiral when
	// rolled. Written on along itself from z = 0; bolder ahead of the swimmer.
	const Tf = 26 * smooth(span(t, ...LINE));
	if (Tf <= 0) return;
	const tSw = -pose.D / AI; // the swimmer's t on the line
	const t0 = xLo / A;
	const t1 = xHi / A;
	const dt = 0.06;
	const wrap = (tt) => tt - TAU * Math.round(tt / TAU);
	let prev = null;
	let pt = null;
	for (let tt = t0; tt <= t1 + 1e-9; tt += dt) {
		const pieceA = pt === null ? 0 : Math.round(pt / TAU);
		const pieceB = Math.round(tt / TAU);
		const draw = (ta, tb, qa, qb) => {
			const mid = (ta + tb) / 2;
			if (Math.abs(mid) > Tf) return;
			const ahead = mid < tSw ? 1 : 0.45;
			const f = smooth(span(Tf - Math.abs(mid), 0, 0.8));
			seg(qa, qb, 0.95 * ahead * f, 2.1);
		};
		if (prev && pieceA === pieceB) {
			const q = P(A * tt, wrap(tt));
			draw(pt, tt, prev, q);
			prev = q;
		} else if (prev) {
			// Cross the strip's edge exactly: out at Im = ±π, in at ∓π.
			const tc = (pieceA + 0.5) * TAU;
			const qOut = P(A * tc, Math.PI);
			const qIn = P(A * tc, -Math.PI);
			draw(pt, tc, prev, qOut);
			const q = P(A * tt, wrap(tt));
			draw(tc, tt, qIn, q);
			prev = q;
		} else prev = P(A * tt, wrap(tt));
		pt = tt;
	}
}
