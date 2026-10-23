// ── log-swimmer · sweep ──────────────────────────────────────────────────────
// The swimmer SWEPT: the flagellum's centreline first, one chalk curve already
// beating; a tube swept round it on a parallel-transport frame, tapering to
// the tip; the midpiece thickening, the head blown out at the front into the
// paddle — and set swimming into the nautilus, itself a tube swept along a
// curve: a logarithmic spiral, its radius growing as it winds.
//
// The run, beat by beat (u = progress, 20 s):
//   0.00–0.02  a lit point, where the front of the body will be.
//   0.02–0.11  the CENTRELINE, written from the front to the tip: one chalk
//              curve, already beating — a travelling wave running down it,
//              its amplitude growing toward the tip.
//   0.10–0.25  the SWEEP: a frame rides the curve from the front to the tip
//              (the lit point its origin, two spokes its axes, carried by
//              parallel transport, so it never twists about the curve), and
//              the ring it carries is left behind every half unit — rings
//              joined by eight generatrices, the radius tapering as it goes;
//              the swept tube is in the depth buffer as it is made, so its
//              far side is hidden and the centreline inside it goes faint.
//              The lens rides with the frame and draws back to the whole tail.
//   0.25–0.31  the MIDPIECE thickens, 0.3 to 0.5, and the mitochondrial
//              helix is wound round it.
//   0.29–0.41  the HEAD inflates at the front: the open end closes over into
//              a round bulb, the bulb grows forward to the nose, then widens
//              in one direction only — 3 wide, 1.5 thick, 5 long, the
//              flattened paddle — and the acrosome's edge rings it two-thirds
//              back. The lens comes round to see it from three-quarters, where
//              it reads thin.
//   0.40–0.48  life: a gold spark at the midpiece; the beat swells to its
//              full amplitude and quickens, the body starts to ROLL, it moves.
//   0.44–0.61  the NAUTILUS grows ahead, as a nautilus grows: its centreline
//              spiral written out from the pole, then the aperture swept out
//              along it, growing as it goes, leaving growth lines; a septum
//              is laid behind the animal each time it moves on (the body
//              chamber, the last third of a whorl, has none). The lens rises
//              to see the whole sectioned shell.
//   0.60–0.67  the siphuncle traced in from the last septum to the pole, the
//              pole lit (dim gold): where it is going.
//   0.62–0.72  the approach: the lens comes down behind the swimmer as it
//              swims at the mouth, gathering pace.
//   0.72–1.00  IN: into the body chamber and on round the chambers along the
//              siphuncle, through the notch in every septum, the chambers
//              closing in round it, the turns converging ahead. The run ends
//              still winding in.
//
// What is EXACT: the shell is Raup's coiled tube, the section (an ellipse,
// semi-axes a·ρ radial and c·ρ axial) centred on the logarithmic spiral
// r = ρ = R e^{bθ}, so centre and radius grow by the same e^{bθ} and every
// chamber is the last one scaled — b = ln W / 2π with the whorl expansion
// W = 3.1 a turn (a nautilus measures about 3); the involution falls out of
// it: each whorl wraps the one before, which pokes out only in the small
// umbilicus, and a septum is the crescent between the whorl's section and the
// section one turn in (where the two ellipses cross found by bisection); the
// median section — the venter's cut edge — is the spiral r = (1 + a)·R e^{bθ},
// the shell's generatrices the conical spirals of constant section angle;
// septa at equal turns (eleven a whorl) are equal-ratio copies of each
// other; the shell's growth is that sweep run outward from the pole, by arc
// length; the swimmer's path inside is the siphuncle's own spiral
// r = k_s R e^{bθ} in the median plane, swum by arc length (closed form, and
// an exact tangent straight line into the mouth). The swimmer's tube: rings
// in the planes normal to the centreline on a rotation-minimising frame
// (double reflection — Wang, Jüttler, Zheng & Liu 2008 — the discrete
// parallel transport), normals analytic from the sections and their slopes,
// the contour where the normal meets the line of sight (on every ring,
// crossings interpolated), hidden lines by facing and a software depth
// buffer of the body and the shell together.
// What is a PICTURE: the body's proportions as the brief has them (head 5 ×
// 3 × 1.5, its thick part behind, the acrosome a 5 % lip over the front two-
// thirds; neck; midpiece 4 × 1; flagellum 45, tapering 0.28 to 0.07, the end
// piece thinner); the beat, a travelling wave of the tail's tangent angle
// (amplitude growing to the tip, 1¾ waves, a quarter of it out of plane, so
// slightly helical), integrated so the tail keeps its length, the whole
// turned so its mean direction is the heading, which yaws the head against
// the tail; the roll; the body bent along the swum path (the tail trails on
// the path); the head's inflation and the midpiece's helix; the nautilus's
// section as an ellipse (a = 0.92, c = 0.7), the septa bowed back by a sine
// across them, the siphuncle's place and size, the body chamber's length;
// the shell cut in half on its median plane, as a nautilus is shown.
//
// World: Y up, the coiling axis; the median plane y = 0, the shell's half
// below it kept. Budget: a frame under ~25 ms headless at 1280 × 800 — the
// lines batched by alpha and width (kummer.js makeInk), the depth buffer at
// 4 px, the shell's geometry built once.

import { PAL, TAU, span, smooth, lerp, clamp01 } from '../log/board.js';
import { NEAR, orbit, spline, makeDepth, lit3 } from '../log/space.js';

export const meta = {
	title: 'sweep: the centreline first, a tube swept round it, the head blown — into the nautilus',
	order: 6,
	seconds: 20,
	three: false
};

const SECONDS = meta.seconds;
const FOV = 40;

// ── The body, in its own units (s from the nose) ─────────────────────────────
const BODY = {
	head: 5, // the head, nose (s = 0) to its base
	headW: 1.5, // half-width: the paddle is 3 wide
	headT: 0.75, // half-thickness: 1.5 thick
	cap: 0.65, // the acrosome's edge, as a fraction of the head from the nose
	lip: 0.05, // the cap stands this proud (relative)
	neckR: 0.3,
	mid: [5.6, 9.6],
	midR: 0.5,
	tail: [9.6, 54.6],
	tailR: [0.28, 0.1],
	endAt: 51.6, // the end piece, thinner
	endR: [0.07, 0.035]
};
const FRONT = BODY.head; // where the centreline starts
const TIP = BODY.tail[1];
// Head stations, as fractions of the head from the nose; one ring on the
// acrosome's edge and one just past it, for the lip.
const HEAD_U = [
	0, 0.03, 0.07, 0.12, 0.18, 0.25, 0.33, 0.41, 0.49, 0.56, 0.62, 0.65, 0.665, 0.74, 0.82, 0.91
];
const NH = HEAD_U.length;
const CAP_I = HEAD_U.indexOf(0.65);
// Tube stations: the neck and midpiece every 0.46, the tail every 0.5.
const TUBE_S = [];
for (let k = 0; k <= 10; k++) TUBE_S.push(FRONT + 0.46 * k);
for (let k = 1; k <= 90; k++) TUBE_S.push(BODY.tail[0] + 0.5 * k);
const NT = TUBE_S.length;
const NS = NH + NT;
const TAIL0 = NH + 10; // the station at s = 9.6, where the beat starts
const NJ = 24; // angles round every ring
const CJ = new Float64Array(NJ);
const SJ = new Float64Array(NJ);
for (let j = 0; j < NJ; j++) {
	CJ[j] = Math.cos((TAU * j) / NJ);
	SJ[j] = Math.sin((TAU * j) / NJ);
}

// The beat: the tail's tangent angle ψ(s) = A(s) sin(k(s − s₀) − Φ), A growing
// from the neck to the tip, with a quarter of it out of the plane, a quarter
// period behind (slightly helical).
const BEAT = {
	waves: 1.75,
	amp: [0.1, 0.55],
	helix: 0.25,
	f: [1.3, 2.3], // beats a second, before life and after
	life: 0.405, // u where it comes to life
	ramp: 2, // seconds the quickening and the roll take to come up
	roll: 0.5, // turns a second
	roll0: 0.4 // the beat plane, tilted toward the lens before it rolls
};
const KW = (TAU * BEAT.waves) / (BODY.tail[1] - BODY.tail[0]);
// ∫ of a ramp from 0 to 1 over L seconds, from x = 0.
const ramped = (x, L) => (x <= 0 ? 0 : x < L ? (x * x) / (2 * L) : x - L / 2);

// ── The nautilus ─────────────────────────────────────────────────────────────
const SH = {
	R: 180, // the spiral's radius at the mouth (θ = 0)
	W: 3.1, // whorl expansion rate: the scale grows 3.1× a turn
	a: 0.92, // the section's radial semi-axis, in units of R e^{bθ}
	c: 0.7, // its axial semi-axis
	whorls: 4.2,
	steps: 48, // samples a whorl along θ
	K: 25, // samples across the half-section, rim to rim
	ringEvery: 3, // a growth line every 3 samples: 16 a whorl
	genEvery: 4, // a generatrix every 4 samples across: 7, the rims among them
	septa: 11, // a whorl
	body: 0.36 * TAU, // the body chamber: no septum in the last third of a whorl
	cut: 0.28, // the shell cut open by a shallow cone through the pole, y = m·r,
	// through the venter where the section is κ = 0.28 of its half-height above
	// the median plane
	sig: 0.04, // the siphuncle's radius
	bow: 0.16 // how far a septum's middle sits back (radians)
};
SH.b = Math.log(SH.W) / TAU;
SH.q = Math.sqrt(1 + SH.b * SH.b);
SH.thMin = -SH.whorls * TAU;
SH.edgeIn = (1 + SH.a) / SH.W; // the venter one turn in, on the median plane
SH.edgeOut = 1 + SH.a;
SH.ks = (SH.edgeIn + SH.edgeOut) / 2; // the siphuncle, mid-crescent
// The cone: y = m·r. Self-similar about the pole, so every whorl, and the
// whorl within (a copy of it scaled by 1/W about the pole), meets it at the
// same section angles: φ_hi on the venter side, φ_lo by the umbilicus.
SH.phHi = TAU + Math.asin(SH.cut);
SH.m = (SH.cut * SH.c) / (1 + SH.a * Math.cos(Math.asin(SH.cut)));
SH.phLo = (() => {
	const f = (p) => SH.c * Math.sin(p) - SH.m * (1 + SH.a * Math.cos(p));
	let lo = Math.PI / 2;
	let hi = Math.PI;
	for (let it = 0; it < 50; it++) {
		const md = (lo + hi) / 2;
		if (f(md) > 0) lo = md;
		else hi = md;
	}
	return (lo + hi) / 2;
})();
const scaleAt = (th) => SH.R * Math.exp(SH.b * th);

// The swim: a straight line into the mouth along the siphuncle spiral's
// tangent there, then the spiral, both by arc length σ (σ = 0 at the mouth).
const D_START = 420;
const R0 = SH.ks * SH.R;
const TIN = [-SH.b / SH.q, 0, -1 / SH.q];
const MOUTH = [R0, 0, 0];
function pathAt(sg, out) {
	if (sg <= 0) {
		out[0] = MOUTH[0] + sg * TIN[0];
		out[1] = 0;
		out[2] = MOUTH[2] + sg * TIN[2];
		out[3] = TIN[0];
		out[4] = TIN[2];
		out[5] = 0;
		return out;
	}
	const r = Math.max(1e-6, R0 - (sg * SH.b) / SH.q);
	const th = Math.log(r / R0) / SH.b;
	const c = Math.cos(th);
	const s = Math.sin(th);
	out[0] = r * c;
	out[1] = 0;
	out[2] = r * s;
	out[3] = -(SH.b * c - s) / SH.q;
	out[4] = -(SH.b * s + c) / SH.q;
	out[5] = th;
	return out;
}

// ── The run's parameters, every one a function of t ──────────────────────────
const SWIM = [
	[0.44, -D_START],
	[0.58, -D_START + 120],
	[0.72, 0],
	[0.86, 400],
	[1, 820]
];
// The lens. While the centreline is written it frames what is written; while
// the tube is swept it rides with the frame; from there on it keeps to keys:
// where on the body it looks (s; negative is ahead of the nose), its bearing
// from behind the swimmer, elevation, distance (log), and how far it looks
// across to the shell.
const LOOK = [
	[0.25, 34],
	[0.31, 11],
	[0.37, 2.8],
	[0.43, 8],
	[0.5, 22],
	[0.58, 20],
	[0.66, 0],
	[0.72, -40],
	[1, -40]
];
const DIST = [
	[0.25, 60],
	[0.31, 26],
	[0.37, 14],
	[0.43, 28],
	[0.47, 70],
	[0.5, 220],
	[0.54, 420],
	[0.58, 600],
	[0.65, 480],
	[0.72, 230],
	[0.86, 230],
	[1, 175]
].map(([k, v]) => [k, Math.log(v)]);
const AZ = [
	[0, 1.62],
	[0.25, 1.55],
	[0.31, 1.8],
	[0.37, 2.1],
	[0.43, 1.6],
	[0.5, 0.75],
	[0.57, 0.55],
	[0.65, 0.3],
	[0.72, 0.12],
	[0.86, 0.35],
	[1, 0.45]
];
const EL = [
	[0, 1.0],
	[0.11, 1.0],
	[0.25, 0.9],
	[0.31, 0.6],
	[0.37, 0.5],
	[0.43, 0.45],
	[0.5, 0.45],
	[0.57, 0.62],
	[0.65, 0.42],
	[0.72, 0.32],
	[0.8, 0.6],
	[0.9, 0.8],
	[1, 0.85]
];
const ACROSS = [
	[0.43, 0],
	[0.47, 0.04],
	[0.5, 0.15],
	[0.54, 0.35],
	[0.58, 0.5],
	[0.65, 0.4],
	[0.72, 0.1],
	[0.86, 0.2],
	[1, 0.25]
];
const SHELL_VIEW = [0, -30, 0];

function stateAt(t) {
	const u = clamp01(t / SECONDS);
	const tl = BEAT.life * SECONDS;
	const S = { u, t };
	S.dot = smooth(span(u, 0, 0.02));
	S.write = span(u, 0.018, 0.11);
	S.sweepRaw = span(u, 0.1, 0.25);
	const e = S.sweepRaw;
	S.sweep = e > 0 ? lerp(FRONT, TIP, 0.5 * (e + smooth(e))) : -1;
	S.open = smooth(span(u, 0.1, 0.118));
	S.mid = smooth(span(u, 0.25, 0.305));
	S.helix = span(u, 0.262, 0.315);
	S.head = span(u, 0.29, 0.41);
	S.cap = smooth(span(u, 0.375, 0.41));
	S.cline = 1 - smooth(span(u, 0.26, 0.32)); // the construction line, gone once the tube is made
	S.amp = lerp(0.65, 1, smooth(span(u, 0.4, 0.48)));
	S.phase = TAU * (BEAT.f[0] * t + (BEAT.f[1] - BEAT.f[0]) * ramped(t - tl, BEAT.ramp));
	S.roll = BEAT.roll0 + TAU * BEAT.roll * ramped(t - tl, 1.2);
	S.spark = span(u, 0.4, 0.48);
	S.sigma = spline(u, SWIM);
	// The shell: its centreline written out from the pole, then the aperture
	// swept out along it — both by arc length, which is the radius.
	const e0 = Math.exp(SH.b * SH.thMin);
	const lw = span(u, 0.44, 0.5);
	S.shellLine = lw > 0 ? Math.log(lerp(e0, 1, lw)) / SH.b : -Infinity;
	const gw = span(u, 0.47, 0.61);
	S.front = gw > 0 ? Math.log(lerp(e0, 1, 0.5 * (gw + smooth(gw)))) / SH.b : -Infinity;
	S.shellLineA = 1 - 0.85 * smooth(span(u, 0.58, 0.66));
	S.siph = span(u, 0.6, 0.67);
	S.pole = smooth(span(u, 0.62, 0.68));
	S.mouth = smooth(span(u, 0.6, 0.64));
	return S;
}

// ── The body's geometry ──────────────────────────────────────────────────────
function headAt(u) {
	const { headW: W, headT: T } = BODY;
	const A =
		u < 0.42
			? W * Math.sqrt(Math.max(0, 1 - ((0.42 - u) / 0.42) ** 2))
			: lerp(BODY.neckR, W, (1 + Math.cos((Math.PI * (u - 0.42)) / 0.58)) / 2);
	const Cc =
		u < 0.62
			? T * Math.sqrt(Math.max(0, 1 - ((0.62 - u) / 0.62) ** 2))
			: lerp(BODY.neckR, T, (1 + Math.cos((Math.PI * (u - 0.62)) / 0.38)) / 2);
	return [A, Cc];
}
function tubeR(s, mid) {
	let r;
	if (s < BODY.tail[0]) r = BODY.neckR;
	else if (s < BODY.endAt)
		r = lerp(BODY.tailR[0], BODY.tailR[1], (s - BODY.tail[0]) / (BODY.endAt - BODY.tail[0]));
	else r = lerp(BODY.endR[0], BODY.endR[1], (s - BODY.endAt) / (TIP - BODY.endAt));
	const inMid =
		smooth(span(s, BODY.mid[0] - 0.1, BODY.mid[0] + 0.3)) *
		(1 - smooth(span(s, BODY.mid[1] - 0.3, BODY.mid[1] + 0.05)));
	return r + (BODY.midR - BODY.neckR) * mid * inMid;
}

function makeBody() {
	const n = NS * NJ;
	return {
		s: new Float64Array(NS),
		a: new Float64Array(NS),
		c: new Float64Array(NS),
		C: new Float64Array(NS * 3), // centreline (body coordinates, then world)
		T: new Float64Array(NS * 3), // d/ds of it
		U: new Float64Array(NS * 3), // the frame: width
		V: new Float64Array(NS * 3), // the frame: thickness
		P: new Float64Array(n * 3),
		N: new Float64Array(n * 3),
		Q: new Float64Array(n * 3), // projected
		F: new Float64Array(n), // facing: n · (eye − P)
		Qc: new Float64Array(NS * 3),
		Cw: new Float64Array(NS * 3),
		rpx: new Float64Array(NS), // each ring's radius on screen
		headOn: false
	};
}

// The body's shape at S, in body coordinates: x forward, y across (the beat
// plane), z through; the centreline, its frame, its sections. Then yawed,
// rolled, and bent along the swum path into the world.
function shapeBody(B, S, path) {
	const h = S.head;
	const Lh = smooth(span(h, 0, 0.7));
	const g = smooth(span(h, 0, 0.55));
	const fl = smooth(span(h, 0.45, 1));
	B.headOn = Lh > 0.01;
	for (let i = 0; i < NH; i++) {
		const u = HEAD_U[i];
		const [A, Cc] = headAt(u);
		const round = 1.12 * Cc;
		const lip = u <= BODY.cap ? 1 + BODY.lip * S.cap : 1;
		B.s[i] = FRONT - (1 - u) * BODY.head * Lh;
		B.a[i] = lerp(BODY.neckR, lerp(round, A, fl), g) * lip;
		B.c[i] = lerp(BODY.neckR, lerp(round, Cc, fl), g) * lip;
	}
	for (let k = 0; k < NT; k++) {
		const s = TUBE_S[k];
		const r = tubeR(s, S.mid) * S.open;
		B.s[NH + k] = s;
		B.a[NH + k] = r;
		B.c[NH + k] = r;
	}
	// The centreline: straight to the end of the midpiece, then the beat's
	// tangent integrated (trapezoid), so the tail keeps its length.
	const C = B.C;
	const T = B.T;
	const amp = S.amp;
	const tang = (s, o) => {
		const x = s - BODY.tail[0];
		const A = amp * lerp(BEAT.amp[0], BEAT.amp[1], x / (TIP - BODY.tail[0]));
		const ph = KW * x - S.phase;
		const p1 = A * Math.sin(ph);
		const p2 = BEAT.helix * A * Math.cos(ph);
		const c2 = Math.cos(p2);
		T[o] = -Math.cos(p1) * c2;
		T[o + 1] = Math.sin(p1) * c2;
		T[o + 2] = Math.sin(p2);
	};
	for (let i = 0; i <= TAIL0; i++) {
		const o = i * 3;
		C[o] = -B.s[i];
		C[o + 1] = 0;
		C[o + 2] = 0;
		T[o] = -1;
		T[o + 1] = 0;
		T[o + 2] = 0;
	}
	tang(B.s[TAIL0], TAIL0 * 3);
	for (let i = TAIL0 + 1; i < NS; i++) {
		const o = i * 3;
		tang(B.s[i], o);
		const ds = (B.s[i] - B.s[i - 1]) / 2;
		for (let d = 0; d < 3; d++) C[o + d] = C[o - 3 + d] + (T[o - 3 + d] + T[o + d]) * ds;
	}
	// The frame: constant along the straight front, then carried down the tail
	// by double reflection (the rotation-minimising frame).
	const U = B.U;
	const V = B.V;
	for (let i = 0; i <= TAIL0; i++) {
		const o = i * 3;
		U[o] = 0;
		U[o + 1] = 1;
		U[o + 2] = 0;
		V[o] = 0;
		V[o + 1] = 0;
		V[o + 2] = 1;
	}
	// From the junction on, station to station: the first reflection by the
	// chord, the second taking the reflected tangent onto the next one.
	for (let i = TAIL0; i < NS; i++) {
		const o = i * 3;
		const p = o - 3;
		const tp = [T[p], T[p + 1], T[p + 2]];
		const v1 = [C[o] - C[p], C[o + 1] - C[p + 1], C[o + 2] - C[p + 2]];
		const r = [U[p], U[p + 1], U[p + 2]];
		let rL = r;
		let tL = tp;
		const c1 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2];
		if (c1 > 1e-12) {
			const kr = (2 / c1) * (v1[0] * r[0] + v1[1] * r[1] + v1[2] * r[2]);
			const kt = (2 / c1) * (v1[0] * tp[0] + v1[1] * tp[1] + v1[2] * tp[2]);
			rL = [r[0] - kr * v1[0], r[1] - kr * v1[1], r[2] - kr * v1[2]];
			tL = [tp[0] - kt * v1[0], tp[1] - kt * v1[1], tp[2] - kt * v1[2]];
		}
		const t1 = [T[o], T[o + 1], T[o + 2]];
		const v2 = [t1[0] - tL[0], t1[1] - tL[1], t1[2] - tL[2]];
		const c2 = v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2];
		let rn = rL;
		if (c2 > 1e-12) {
			const k2 = (2 / c2) * (v2[0] * rL[0] + v2[1] * rL[1] + v2[2] * rL[2]);
			rn = [rL[0] - k2 * v2[0], rL[1] - k2 * v2[1], rL[2] - k2 * v2[2]];
		}
		// Keep it exactly normal and unit, and V = U × T's partner.
		const dt = rn[0] * t1[0] + rn[1] * t1[1] + rn[2] * t1[2];
		rn = [rn[0] - dt * t1[0], rn[1] - dt * t1[1], rn[2] - dt * t1[2]];
		const lr = Math.hypot(rn[0], rn[1], rn[2]) || 1;
		U[o] = rn[0] / lr;
		U[o + 1] = rn[1] / lr;
		U[o + 2] = rn[2] / lr;
		// V = T × U, oriented as (0, 0, 1) is at the front: (−x) × y = −z, so −(T × U).
		V[o] = -(t1[1] * U[o + 2] - t1[2] * U[o + 1]);
		V[o + 1] = -(t1[2] * U[o] - t1[0] * U[o + 2]);
		V[o + 2] = -(t1[0] * U[o + 1] - t1[1] * U[o]);
	}
	// Yaw: turn the whole body about the end of the midpiece so the tail's mean
	// direction is straight back, then centre it across its line — the head
	// yaws and sways against the tail.
	let mx = 0;
	let my = 0;
	let mz = 0;
	const o0 = TAIL0 * 3;
	for (let i = TAIL0 + 1; i < NS; i++) {
		const o = i * 3;
		mx += C[o] - C[o0];
		my += C[o + 1] - C[o0 + 1];
		mz += C[o + 2] - C[o0 + 2];
	}
	const ml = Math.hypot(mx, my, mz) || 1;
	const ax = mx / ml;
	const ay = my / ml;
	const az = mz / ml;
	// Rodrigues: the rotation taking (ax, ay, az) to (−1, 0, 0).
	const vx = 0;
	const vy = -az; // a × b with b = (−1, 0, 0): (ay·0 − az·0, az·(−1) − ax·0, ax·0 − ay·(−1))
	const vz = ay;
	const cc = -ax;
	const kk = 1 / (1 + cc);
	const Rm = [
		1 + kk * (-vy * vy - vz * vz),
		-vz + kk * vx * vy,
		vy + kk * vx * vz,
		vz + kk * vx * vy,
		1 + kk * (-vx * vx - vz * vz),
		-vx + kk * vy * vz,
		-vy + kk * vx * vz,
		vx + kk * vy * vz,
		1 + kk * (-vx * vx - vy * vy)
	];
	const px = C[o0];
	const py = C[o0 + 1];
	const pz = C[o0 + 2];
	const rot = (A, o, pivot) => {
		const x = A[o] - (pivot ? px : 0);
		const y = A[o + 1] - (pivot ? py : 0);
		const z = A[o + 2] - (pivot ? pz : 0);
		A[o] = Rm[0] * x + Rm[1] * y + Rm[2] * z + (pivot ? px : 0);
		A[o + 1] = Rm[3] * x + Rm[4] * y + Rm[5] * z + (pivot ? py : 0);
		A[o + 2] = Rm[6] * x + Rm[7] * y + Rm[8] * z + (pivot ? pz : 0);
	};
	let cy = 0;
	let cz = 0;
	for (let i = 0; i < NS; i++) {
		const o = i * 3;
		rot(C, o, true);
		rot(T, o, false);
		rot(U, o, false);
		rot(V, o, false);
		if (i >= NH) {
			cy += C[o + 1];
			cz += C[o + 2];
		}
	}
	cy /= NT;
	cz /= NT;
	// Roll about the axis.
	const cr = Math.cos(S.roll);
	const sr = Math.sin(S.roll);
	const roll = (A, o) => {
		const y = A[o + 1];
		const z = A[o + 2];
		A[o + 1] = cr * y - sr * z;
		A[o + 2] = sr * y + cr * z;
	};
	for (let i = 0; i < NS; i++) {
		const o = i * 3;
		C[o + 1] -= cy;
		C[o + 2] -= cz;
		roll(C, o);
		roll(T, o);
		roll(U, o);
		roll(V, o);
	}
	// The sections, their normals, and the bend into the world: a body point
	// (x, y, z) at station i goes to path(σ + x_i) + (x − x_i)·H + y·Side + z·Y.
	const P = B.P;
	const N = B.N;
	const Cw = B.Cw;
	for (let i = 0; i < NS; i++) {
		const o = i * 3;
		pathAt(S.sigma + C[o], path);
		const Hx = path[3];
		const Hz = path[4];
		const Sx = Hz; // Side = Y × H
		const Sz = -Hx;
		const bx = path[0];
		const bz = path[2];
		const toW = (x, y, z, out, oo) => {
			out[oo] = bx + x * Hx + y * Sx;
			out[oo + 1] = z;
			out[oo + 2] = bz + x * Hz + y * Sz;
		};
		toW(0, C[o + 1], C[o + 2], Cw, o);
		const a = B.a[i];
		const c = B.c[i];
		const i0 = Math.max(0, i - 1);
		const i1 = Math.min(NS - 1, i + 1);
		const dS = B.s[i1] - B.s[i0];
		const da = Math.abs(dS) > 1e-6 ? (B.a[i1] - B.a[i0]) / dS : 0;
		const dc = Math.abs(dS) > 1e-6 ? (B.c[i1] - B.c[i0]) / dS : 0;
		const Ux = U[o];
		const Uy = U[o + 1];
		const Uz = U[o + 2];
		const Vx = V[o];
		const Vy = V[o + 1];
		const Vz = V[o + 2];
		const Tx = T[o];
		const Ty = T[o + 1];
		const Tz = T[o + 2];
		for (let j = 0; j < NJ; j++) {
			const cs = CJ[j];
			const sn = SJ[j];
			const k = (i * NJ + j) * 3;
			const ex = a * cs * Ux + c * sn * Vx;
			const ey = a * cs * Uy + c * sn * Vy;
			const ez = a * cs * Uz + c * sn * Vz;
			toW(ex, C[o + 1] + ey, C[o + 2] + ez, P, k);
			const tt = a * dc * sn * sn + da * c * cs * cs;
			const nx = c * cs * Ux + a * sn * Vx - tt * Tx;
			const ny = c * cs * Uy + a * sn * Vy - tt * Ty;
			const nz = c * cs * Uz + a * sn * Vz - tt * Tz;
			N[k] = nx * Hx + ny * Sx;
			N[k + 1] = nz;
			N[k + 2] = nx * Hz + ny * Sz;
		}
	}
}

// ── The shell's geometry, built once ─────────────────────────────────────────
function makeShell() {
	const { a, c, K, steps, W } = SH;
	const n = Math.round(steps * SH.whorls);
	const th = new Float64Array(n + 1);
	for (let i = 0; i <= n; i++) th[i] = -((n - i) * TAU) / steps;
	// The section kept: the ellipse from the umbilical rim, down round the
	// bottom, up to the venter's rim, both on the cone y = m·r.
	const XR = [];
	const YY = [];
	for (let k = 0; k < K; k++) {
		const ph = lerp(SH.phLo, SH.phHi, k / (K - 1));
		XR.push(1 + a * Math.cos(ph));
		YY.push(c * Math.sin(ph));
	}
	const at = (t, k, out, o) => {
		const s = scaleAt(t);
		out[o] = s * XR[k] * Math.cos(t);
		out[o + 1] = s * YY[k];
		out[o + 2] = s * XR[k] * Math.sin(t);
	};
	const G = new Float64Array((n + 1) * K * 3);
	for (let i = 0; i <= n; i++) for (let k = 0; k < K; k++) at(th[i], k, G, (i * K + k) * 3);
	// Its normals, from the parametrisation: ∂P/∂θ × ∂P/∂φ (up to the scale).
	const NG = new Float64Array(G.length);
	for (let i = 0; i <= n; i++)
		for (let k = 0; k < K; k++) {
			const ph = lerp(SH.phLo, SH.phHi, k / (K - 1));
			const X = XR[k];
			const Yv = YY[k];
			const ct = Math.cos(th[i]);
			const st = Math.sin(th[i]);
			const t0 = SH.b * X * ct - X * st;
			const t1 = SH.b * Yv;
			const t2 = SH.b * X * st + X * ct;
			const p0 = -a * Math.sin(ph) * ct;
			const p1 = c * Math.cos(ph);
			const p2 = -a * Math.sin(ph) * st;
			const o = (i * K + k) * 3;
			NG[o] = t1 * p2 - t2 * p1;
			NG[o + 1] = t2 * p0 - t0 * p2;
			NG[o + 2] = t0 * p1 - t1 * p0;
		}
	// The centreline and the siphuncle's two edges, on the median plane.
	const line = (kr) => {
		const L = new Float64Array((n + 1) * 3);
		for (let i = 0; i <= n; i++) {
			const s = scaleAt(th[i]) * kr;
			L[i * 3] = s * Math.cos(th[i]);
			L[i * 3 + 1] = 0;
			L[i * 3 + 2] = s * Math.sin(th[i]);
		}
		return L;
	};
	const centre = line(1);
	const siphA = line(SH.ks - SH.sig);
	const siphB = line(SH.ks + SH.sig);
	// The septum, once, in the section's own units (radial x, axial y, and how
	// far it sits back in θ): the crescent between this whorl's section and the
	// one a turn in, from the cut down to where the two ellipses cross.
	const Eo = (p) => [1 + a * Math.cos(p), c * Math.sin(p)];
	const Ei = (p) => [(1 + a * Math.cos(p)) / W, (c * Math.sin(p)) / W];
	const inEi = ([x, y]) => ((x - 1 / W) / (a / W)) ** 2 + (y / (c / W)) ** 2 - 1;
	let lo = Math.PI;
	let hi = TAU;
	for (let it = 0; it < 50; it++) {
		const m = (lo + hi) / 2;
		if (inEi(Eo(m)) < 0) lo = m;
		else hi = m;
	}
	const phX = (lo + hi) / 2;
	const X = Eo(phX);
	let psX = Math.atan2((X[1] * W) / c, (X[0] * W - 1) / a);
	if (psX < 0) psX += TAU;
	const psHi = SH.phHi; // the whorl within meets the cone at the same angle
	const bowOf = (q) => -SH.bow * Math.sin(Math.PI * clamp01(q));
	const septPt = (t, q) => {
		const o = Eo(SH.phHi - t * (SH.phHi - phX));
		const i = Ei(psHi - t * (psHi - psX));
		return [lerp(i[0], o[0], q), lerp(i[1], o[1], q), bowOf(q)];
	};
	// Where the siphuncle (k_s, 0) sits in the mesh's (t, q), and the cell
	// round it the mesh leaves open.
	let ts = 0;
	let qs = 0.5;
	let best = Infinity;
	for (let m = 0; m <= 600; m++) {
		const t = m / 1000;
		const i = septPt(t, 0);
		const o = septPt(t, 1);
		if (i[1] > 0 === o[1] > 0) continue;
		const q = i[1] / (i[1] - o[1]);
		const d = Math.abs(lerp(i[0], o[0], q) - SH.ks);
		if (d < best) {
			best = d;
			ts = t;
			qs = q;
		}
	}
	const tAt = (y) => {
		let l = 0;
		let h = 0.9;
		for (let it = 0; it < 40; it++) {
			const m = (l + h) / 2;
			if (septPt(m, qs)[1] > y) l = m;
			else h = m;
		}
		return (l + h) / 2;
	};
	const ta = tAt(1.5 * SH.sig);
	const tb = tAt(-1.5 * SH.sig);
	const span0 = septPt(ts, 1)[0] - septPt(ts, 0)[0];
	const dq = (1.5 * SH.sig) / span0;
	const ROWS = [0, ta / 2, ta, tb];
	for (let r = 1; r <= 4; r++) ROWS.push(lerp(tb, 1, r / 4));
	const COLS = [
		0,
		qs / 3,
		(2 * qs) / 3,
		qs - dq,
		qs + dq,
		lerp(qs, 1, 1 / 3),
		lerp(qs, 1, 2 / 3),
		1
	];
	const HOLE = [2, 3]; // the cell (row, col) the siphuncle passes through
	const mesh = [];
	for (const t of ROWS) for (const q of COLS) mesh.push(septPt(t, q));
	const top = [];
	for (let i = 0; i <= 8; i++) top.push(septPt(0, i / 8));
	const hole = [];
	for (let i = 0; i <= 16; i++) {
		const be = (TAU * i) / 16;
		hole.push([SH.ks + SH.sig * Math.cos(be), SH.sig * Math.sin(be), bowOf(qs)]);
	}
	const outer = [];
	const inner = [];
	for (let i = 0; i <= 14; i++) outer.push(septPt(i / 14, 1));
	for (let i = 0; i <= 10; i++) inner.push(septPt(i / 10, 0));
	// Every septum: eleven a whorl back from the body chamber.
	const septa = [];
	const toWorld = (pts, t0) => {
		const s = scaleAt(t0);
		const out = new Float64Array(pts.length * 3);
		pts.forEach(([x, y, d], i) => {
			out[i * 3] = s * x * Math.cos(t0 + d);
			out[i * 3 + 1] = s * y;
			out[i * 3 + 2] = s * x * Math.sin(t0 + d);
		});
		return out;
	};
	for (let k = 0; ; k++) {
		const t0 = -SH.body - (k * TAU) / SH.septa;
		if (t0 < SH.thMin + 0.2) break;
		const s = scaleAt(t0);
		septa.push({
			th: t0,
			size: s,
			centre: [s * SH.ks * Math.cos(t0), -0.2 * s * c, s * SH.ks * Math.sin(t0)],
			mesh: toWorld(mesh, t0),
			top: toWorld(top, t0),
			hole: toWorld(hole, t0),
			outer: toWorld(outer, t0),
			inner: toWorld(inner, t0)
		});
	}
	return {
		n,
		th,
		G,
		NG,
		FG: new Float64Array((n + 1) * K),
		at,
		centre,
		siphA,
		siphB,
		septa,
		rows: ROWS.length,
		cols: COLS.length,
		hole: HOLE,
		Qg: new Float64Array(G.length),
		Ql: new Float64Array(centre.length)
	};
}

// ── Drawing helpers ──────────────────────────────────────────────────────────
// Behind the surface in Z? (space.js's Z.hidden, without an array.)
function hiddenAt(Z, x, y, z) {
	const s = Z.s;
	const x0 = Math.floor(x / s - 0.5);
	const y0 = Math.floor(y / s - 0.5);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const b = Z.buf;
	const k = y0 * Z.W + x0;
	const m = Math.max(b[k], b[k + 1], b[k + Z.W], b[k + Z.W + 1]);
	return z > m * 1.012 + 0.012;
}
// A triangle of projected points into Z: space.js's Z.tri, without arrays,
// and filled a row at a time over only the span inside it (the barycentrics
// and 1/z are linear along a row), not over its whole bounding box.
function tri(Z, ax, ay, az, bx, by, bz, cx, cy, cz) {
	if (az < NEAR || bz < NEAR || cz < NEAR) return;
	const s = Z.s;
	ax /= s;
	ay /= s;
	bx /= s;
	by /= s;
	cx /= s;
	cy /= s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (Math.abs(area) < 1e-9) return;
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
	if (x0 > x1 || y0 > y1) return;
	const inv = 1 / area;
	const ia = 1 / az;
	const ib = 1 / bz;
	const ic = 1 / cz;
	const d0x = (by - cy) * inv;
	const d0y = (cx - bx) * inv;
	const d1x = (cy - ay) * inv;
	const d1y = (ax - cx) * inv;
	const d2x = -d0x - d1x;
	const dzx = d0x * (ia - ic) + d1x * (ib - ic);
	const px = x0 + 0.5;
	const py = y0 + 0.5;
	let r0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) * inv;
	let r1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) * inv;
	const n = x1 - x0;
	const buf = Z.buf;
	const W = Z.W;
	const e = -0.03;
	for (let y = y0; y <= y1; y++, r0 += d0y, r1 += d1y) {
		let k0 = 0;
		let k1 = n;
		const r2 = 1 - r0 - r1;
		// Each edge's w + k·d ≥ e cuts the row to a span.
		if (d0x > 1e-12) k0 = Math.max(k0, Math.ceil((e - r0) / d0x));
		else if (d0x < -1e-12) k1 = Math.min(k1, Math.floor((e - r0) / d0x));
		else if (r0 < e) continue;
		if (d1x > 1e-12) k0 = Math.max(k0, Math.ceil((e - r1) / d1x));
		else if (d1x < -1e-12) k1 = Math.min(k1, Math.floor((e - r1) / d1x));
		else if (r1 < e) continue;
		if (d2x > 1e-12) k0 = Math.max(k0, Math.ceil((e - r2) / d2x));
		else if (d2x < -1e-12) k1 = Math.min(k1, Math.floor((e - r2) / d2x));
		else if (r2 < e) continue;
		if (k0 > k1) continue;
		let iz = ic + r0 * (ia - ic) + r1 * (ib - ic) + k0 * dzx;
		let k = y * W + x0 + k0;
		for (let j = k0; j <= k1; j++, k++, iz += dzx) {
			const z = 1 / iz;
			if (z < buf[k]) buf[k] = z;
		}
	}
}
const quad = (Z, Q, a, b, c, d) => {
	tri(Z, Q[a], Q[a + 1], Q[a + 2], Q[b], Q[b + 1], Q[b + 2], Q[c], Q[c + 1], Q[c + 2]);
	tri(Z, Q[a], Q[a + 1], Q[a + 2], Q[c], Q[c + 1], Q[c + 2], Q[d], Q[d + 1], Q[d + 2]);
};
// Project a flat array of 3D points into another.
function projectAll(cam, P, Q, n = P.length / 3) {
	const p = [0, 0, 0];
	for (let i = 0; i < n; i++) {
		const o = i * 3;
		p[0] = P[o];
		p[1] = P[o + 1];
		p[2] = P[o + 2];
		const q = cam.project(p);
		Q[o] = q[0];
		Q[o + 1] = q[1];
		Q[o + 2] = q[2];
	}
}

// The ink: segments batched by colour, alpha, width and side (kummer.js's
// makeInk), a segment that starts where the batch's last one ended carried on
// as the same polyline — a few hundred strokes' worth of caps fewer.
function makeInk() {
	const B = new Map();
	return {
		seg(color, alpha, width, back, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(14, Math.round(alpha * 14));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}|${back ? 1 : 0}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 14, width: wq / 4, back, P: [], x: NaN, y: NaN };
				B.set(key, b);
			}
			if (x0 === b.x && y0 === b.y) b.P.push(x1, y1);
			else b.P.push(Infinity, x0, y0, x1, y1);
			b.x = x1;
			b.y = y1;
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(b.back ? [3, 6] : []);
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length;) {
					if (P[i] === Infinity) {
						ctx.moveTo(P[i + 1], P[i + 2]);
						i += 3;
					} else {
						ctx.lineTo(P[i], P[i + 1]);
						i += 2;
					}
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// The painter: segments of projected points into the ink, cut at the near
// plane, culled off the board, width by depth, behind the surfaces in Z faint
// and dashed (by `hid`; 0 drops them).
function makePen(ink, Z) {
	const pen = { cam: null, w: 0, h: 0, ref: 1 };
	const tmp = [0, 0, 0];
	// From projected (sx, sy, depth) a to b; P3 the 3D points, for the near cut.
	pen.seg = (ax, ay, az, bx, by, bz, alpha, width, hid = 0.25, color = PAL.chalk) => {
		if (alpha < 0.012) return;
		if (az <= NEAR || bz <= NEAR) return;
		const m = 40;
		const { w, h } = pen;
		if ((ax < -m && bx < -m) || (ax > w + m && bx > w + m)) return;
		if ((ay < -m && by < -m) || (ay > h + m && by > h + m)) return;
		const mz = (az + bz) / 2;
		const ws = Math.min(2.4, Math.max(0.6, pen.ref / mz));
		if (hiddenAt(Z, (ax + bx) / 2, (ay + by) / 2, mz)) {
			if (hid > 0) ink.seg(color, alpha * hid, width * ws * 0.7, true, ax, ay, bx, by);
			return;
		}
		ink.seg(color, alpha, width * ws, false, ax, ay, bx, by);
	};
	// 3D points a, b (arrays), cut at the near plane.
	pen.seg3 = (a, b, alpha, width, hid, color) => {
		let qa = pen.cam.project(a);
		let qb = pen.cam.project(b);
		if (qa[2] <= NEAR && qb[2] <= NEAR) return;
		if (qa[2] <= NEAR || qb[2] <= NEAR) {
			const t = (qa[2] - NEAR * 1.01) / (qa[2] - qb[2]);
			for (let d = 0; d < 3; d++) tmp[d] = a[d] + (b[d] - a[d]) * t;
			const c = pen.cam.project(tmp);
			if (qa[2] <= NEAR) qa = c;
			else qb = c;
		}
		pen.seg(qa[0], qa[1], qa[2], qb[0], qb[1], qb[2], alpha, width, hid, color);
	};
	// A polyline of 3D points in a flat array (first..last index), its
	// projections in Q, cut at the near plane where it crosses it.
	pen.poly = (P, Q, i0, i1, alpha, width, hid, color) => {
		const a = [0, 0, 0];
		const b = [0, 0, 0];
		for (let i = i0; i < i1; i++) {
			const o = i * 3;
			const az = Q[o + 2];
			const bz = Q[o + 5];
			if (az > NEAR && bz > NEAR)
				pen.seg(Q[o], Q[o + 1], az, Q[o + 3], Q[o + 4], bz, alpha, width, hid, color);
			else if (az > NEAR || bz > NEAR) {
				for (let d = 0; d < 3; d++) {
					a[d] = P[o + d];
					b[d] = P[o + 3 + d];
				}
				pen.seg3(a, b, alpha, width, hid, color);
			}
		}
	};
	return pen;
}

// ── The sketch ───────────────────────────────────────────────────────────────
export async function make() {
	const Z = makeDepth(4);
	const ink = makeInk();
	const pen = makePen(ink, Z);
	const B = makeBody();
	const SHL = makeShell();
	const path = new Float64Array(6);
	const ring = new Float64Array(SH.K * 3); // the aperture, while it grows
	const ringQ = new Float64Array(SH.K * 3);
	const sepQ = new Float64Array(64 * 3);
	const front = {
		P: new Float64Array(NJ * 3),
		Q: new Float64Array(NJ * 3),
		F: new Float64Array(NJ)
	};

	function lens(S, w, h) {
		const u = S.u;
		// Written: the lens frames the curve as it is written, drawing back.
		const sw = lerp(FRONT, TIP, S.write);
		const lA = lerp(FRONT, sw, 0.5);
		const dA = Math.log(16 + 0.8 * (sw - FRONT));
		// Swept: it rides with the frame, drawing back as the tube grows.
		const sf = S.sweep > 0 ? S.sweep : FRONT;
		const lB = lerp(FRONT, sf, 0.85);
		const dB = Math.log(12 + 0.45 * (sf - FRONT));
		const wA = 1 - smooth(span(u, 0.1, 0.135));
		const wB = (1 - wA) * (1 - smooth(span(u, 0.235, 0.27)));
		const wC = 1 - wA - wB;
		const look = wA * lA + wB * lB + wC * spline(u, LOOK);
		const dist = Math.exp(wA * dA + wB * dB + wC * spline(u, DIST));
		pathAt(S.sigma - look, path);
		const across = spline(u, ACROSS);
		const target = [
			lerp(path[0], SHELL_VIEW[0], across),
			lerp(0, SHELL_VIEW[1], across),
			lerp(path[2], SHELL_VIEW[2], across)
		];
		pathAt(S.sigma, path);
		const azF = Math.atan(SH.b) - path[5];
		const cam = orbit(w, h, {
			target,
			az: azF + spline(u, AZ),
			el: spline(u, EL),
			dist,
			fov: FOV
		});
		return { cam, dist };
	}

	// ── The shell ──
	function shellDepth(cam, S, built) {
		const { Qg, at } = SHL;
		const K = SH.K;
		const iF = built.iF;
		// (every other sample across: the depth needs less than the lines)
		for (let i = 0; i < iF; i++)
			for (let k = 0; k < K - 1; k += 2) {
				const a = (i * K + k) * 3;
				const b = ((i + 1) * K + k) * 3;
				quad(Z, Qg, a, b, b + 6, a + 6);
			}
		// The strip from the last sample to the growing front.
		if (built.partial) {
			for (let k = 0; k < K; k++) at(S.front, k, ring, k * 3);
			projectAll(cam, ring, ringQ);
			for (let k = 0; k < K - 1; k += 2) {
				const a = (iF * K + k) * 3;
				const b = k * 3;
				tri(
					Z,
					Qg[a],
					Qg[a + 1],
					Qg[a + 2],
					ringQ[b],
					ringQ[b + 1],
					ringQ[b + 2],
					ringQ[b + 6],
					ringQ[b + 7],
					ringQ[b + 8]
				);
				tri(
					Z,
					Qg[a],
					Qg[a + 1],
					Qg[a + 2],
					ringQ[b + 6],
					ringQ[b + 7],
					ringQ[b + 8],
					Qg[a + 6],
					Qg[a + 7],
					Qg[a + 8]
				);
			}
		}
		// The septa, but the notch the siphuncle passes through.
		const R = SHL.rows;
		const Cn = SHL.cols;
		for (const sp of built.septa) {
			if (sp.px < 6) continue;
			projectAll(cam, sp.mesh, sepQ);
			for (let r = 0; r < R - 1; r++)
				for (let c = 0; c < Cn - 1; c++) {
					if (r === SHL.hole[0] && c === SHL.hole[1]) continue;
					const a = (r * Cn + c) * 3;
					const b = ((r + 1) * Cn + c) * 3;
					quad(Z, sepQ, a, b, b + 3, a + 3);
				}
		}
	}

	function shellBuilt(cam, S) {
		const { n, th, G, Qg } = SHL;
		const out = { iF: -1, partial: false, septa: [] };
		if (S.front === -Infinity) return out;
		let iF = 0;
		while (iF < n && th[iF + 1] <= S.front) iF++;
		out.iF = iF;
		out.partial = S.front > th[iF] + 1e-9;
		projectAll(cam, G, Qg, (iF + 1) * SH.K);
		const eye = cam.pos;
		for (const sp of SHL.septa) {
			const age = S.front - sp.th - SH.body;
			if (age <= 0) continue;
			const d = Math.hypot(sp.centre[0] - eye[0], sp.centre[1] - eye[1], sp.centre[2] - eye[2]);
			const px = (sp.size * cam.k) / Math.max(d, 1e-3);
			if (px < 2.5) continue;
			sp.px = px;
			sp.alpha = smooth(span(age, 0, 0.35)) * smooth(span(px, 2.5, 8));
			out.septa.push(sp);
		}
		return out;
	}

	function shellLines(cam, S, built) {
		const { n, th, G, Qg } = SHL;
		const K = SH.K;
		const eye = cam.pos;
		// The centreline, written out from the pole.
		if (S.shellLine > -Infinity && S.shellLineA > 0.01) {
			let iL = 0;
			while (iL < n && th[iL + 1] <= S.shellLine) iL++;
			projectAll(cam, SHL.centre, SHL.Ql, iL + 1);
			pen.poly(SHL.centre, SHL.Ql, 0, iL, 0.62 * S.shellLineA, 1.1, 0.3);
			if (S.shellLine > th[iL] && iL < n) {
				const s = scaleAt(S.shellLine);
				const e = [s * Math.cos(S.shellLine), 0, s * Math.sin(S.shellLine)];
				pen.seg3([SHL.centre[iL * 3], 0, SHL.centre[iL * 3 + 2]], e, 0.62 * S.shellLineA, 1.1, 0.3);
			}
		}
		const iF = built.iF;
		if (iF < 0) return;
		// Growth lines and generatrices.
		const a = [0, 0, 0];
		const b = [0, 0, 0];
		const sizePx = (i) => {
			const s = scaleAt(th[i]);
			const o = (i * K + (K >> 1)) * 3;
			const dz = Math.hypot(G[o] - eye[0], G[o + 1] - eye[1], G[o + 2] - eye[2]);
			return (s * cam.k) / Math.max(dz, 1e-3);
		};
		const segG = (i0, k0, i1, k1, alpha, width, hid) => {
			const oa = (i0 * K + k0) * 3;
			const ob = (i1 * K + k1) * 3;
			if (Qg[oa + 2] > NEAR && Qg[ob + 2] > NEAR)
				pen.seg(Qg[oa], Qg[oa + 1], Qg[oa + 2], Qg[ob], Qg[ob + 1], Qg[ob + 2], alpha, width, hid);
			else if (Qg[oa + 2] > NEAR || Qg[ob + 2] > NEAR) {
				for (let d = 0; d < 3; d++) {
					a[d] = G[oa + d];
					b[d] = G[ob + d];
				}
				pen.seg3(a, b, alpha, width, hid);
			}
		};
		for (let i = 0; i <= iF; i++) {
			const px = sizePx(i);
			if (px < 1.5) continue;
			const lod = smooth(span(px, 1.5, 6));
			// generatrices: the cut edges bold (the venter's is the spiral of the
			// section), the inside lines thin, and only where the whorl is big
			// enough to hold them.
			if (i < iF)
				for (let k = 0; k < K; k += SH.genEvery) {
					const edge = k === K - 1;
					const umb = k === 0;
					if (!edge && !umb && px < 12) continue;
					const al = (edge ? 0.86 : umb ? 0.38 : 0.26) * (edge ? 1 : lod);
					segG(i, k, i + 1, k, al, edge ? 1.7 : 1, edge ? 0.12 : 0);
				}
			if ((SHL.n - i) % SH.ringEvery === 0 && px > 6) {
				const st = px < 30 ? 2 : 1;
				const al = 0.26 * smooth(span(px, 6, 14));
				for (let k = 0; k < K - 1; k += st) segG(i, k, i, k + st, al, 0.9, 0);
			}
		}
		// The contour: where the shell turns from the lens, found on every
		// section and joined section to section (two of them: an arc of an
		// ellipse has at most two tangents from a point).
		const { FG, NG } = SHL;
		for (let i = 0; i <= iF; i++) {
			const o = i * K * 3;
			for (let k = 0; k < K; k++) {
				const v = o + k * 3;
				FG[i * K + k] =
					NG[v] * (eye[0] - G[v]) +
					NG[v + 1] * (eye[1] - G[v + 1]) +
					NG[v + 2] * (eye[2] - G[v + 2]);
			}
		}
		const cross = (i, want) => {
			for (let k = 0; k < K - 1; k++) {
				const f0 = FG[i * K + k];
				const f1 = FG[i * K + k + 1];
				if (want ? f0 > 0 && f1 <= 0 : f0 <= 0 && f1 > 0) {
					const t = f0 / (f0 - f1);
					const a0 = (i * K + k) * 3;
					const a1 = a0 + 3;
					if (Qg[a0 + 2] <= NEAR || Qg[a1 + 2] <= NEAR) return null;
					return [
						lerp(Qg[a0], Qg[a1], t),
						lerp(Qg[a0 + 1], Qg[a1 + 1], t),
						lerp(Qg[a0 + 2], Qg[a1 + 2], t)
					];
				}
			}
			return null;
		};
		let cA = null;
		let cB = null;
		for (let i = 0; i <= iF; i++) {
			const px = sizePx(i);
			if (px < 3) {
				cA = cB = null;
				continue;
			}
			const al = 0.72 * smooth(span(px, 3, 10));
			const A = cross(i, true);
			const Bq = cross(i, false);
			if (A && cA) pen.seg(cA[0], cA[1], cA[2], A[0], A[1], A[2], al, 1.4, 0);
			if (Bq && cB) pen.seg(cB[0], cB[1], cB[2], Bq[0], Bq[1], Bq[2], al, 1.4, 0);
			cA = A;
			cB = Bq;
		}
		// The growing aperture (and its strip from the last sample).
		if (built.partial || S.front >= 0) {
			if (!built.partial) {
				for (let k = 0; k < K; k++) at0(SHL, 0, k, ring, k * 3);
				projectAll(cam, ring, ringQ);
			}
			const grow = S.front < 0;
			const al = grow ? 0.92 : 0.8;
			for (let k = 0; k < K - 1; k++) {
				const o = k * 3;
				if (ringQ[o + 2] > NEAR && ringQ[o + 5] > NEAR)
					pen.seg(
						ringQ[o],
						ringQ[o + 1],
						ringQ[o + 2],
						ringQ[o + 3],
						ringQ[o + 4],
						ringQ[o + 5],
						al,
						1.8,
						0.12
					);
			}
			if (built.partial)
				for (let k = 0; k < K; k += SH.genEvery) {
					const oa = (iF * K + k) * 3;
					const o = k * 3;
					const edge = k === K - 1;
					if (Qg[oa + 2] > NEAR && ringQ[o + 2] > NEAR)
						pen.seg(
							Qg[oa],
							Qg[oa + 1],
							Qg[oa + 2],
							ringQ[o],
							ringQ[o + 1],
							ringQ[o + 2],
							edge ? 0.86 : 0.26,
							edge ? 1.7 : 1,
							edge ? 0.12 : 0
						);
				}
		}
		// The septa: the cut edge bold; the siphuncle's hole; the suture on the
		// outer wall and the line on the whorl within.
		for (const sp of built.septa) {
			const al = sp.alpha;
			const parts = [
				[sp.top, 0.82, 1.45, 0.14],
				[sp.hole, 0.7, 1.1, 0.2],
				[sp.outer, 0.5, 1.05, 0],
				[sp.inner, 0.38, 0.95, 0]
			];
			for (const [L, a0, w0, hd] of parts) {
				if ((L === sp.inner && sp.px < 25) || (L === sp.hole && sp.px < 8)) continue;
				const m = L.length / 3;
				projectAll(cam, L, sepQ, m);
				pen.poly(L, sepQ, 0, m - 1, a0 * al, w0, hd);
			}
		}
		// The siphuncle, traced in from the last septum.
		if (S.siph > 0) {
			const iS = SHL.n - Math.round((SH.body / TAU) * SH.steps);
			const i0 = Math.max(0, Math.round(lerp(iS, 0, S.siph)));
			for (const L of [SHL.siphA, SHL.siphB]) {
				projectAll(cam, L.subarray(i0 * 3, (iS + 1) * 3), SHL.Ql);
				pen.poly(L.subarray(i0 * 3), SHL.Ql, 0, iS - i0, 0.34, 0.9, 0);
			}
		}
	}

	// ── The body ──
	function bodyBuilt(S) {
		// The stations that exist: the head once it is blown, the tube to the
		// sweep's front (k the last full station, fr the way to the next).
		const sw = S.sweep;
		if (sw < FRONT) return { i0: NH, i1: NH - 1, kf: -1, fr: 0 };
		let kf = 0;
		while (kf < NT - 1 && TUBE_S[kf + 1] <= sw) kf++;
		const fr = kf < NT - 1 ? (sw - TUBE_S[kf]) / (TUBE_S[kf + 1] - TUBE_S[kf]) : 0;
		return { i0: B.headOn ? 0 : NH, i1: NH + kf, kf, fr };
	}

	function bodyFront(bb) {
		// The ring at the sweep's front, between stations.
		if (bb.kf < 0 || bb.fr <= 0) return false;
		const i = NH + bb.kf;
		for (let j = 0; j < NJ; j++) {
			const a = (i * NJ + j) * 3;
			const b = ((i + 1) * NJ + j) * 3;
			for (let d = 0; d < 3; d++) front.P[j * 3 + d] = lerp(B.P[a + d], B.P[b + d], bb.fr);
			front.F[j] = lerp(B.F[i * NJ + j], B.F[(i + 1) * NJ + j], bb.fr);
		}
		return true;
	}

	function bodyDepth(bb, hasFront) {
		const Q = B.Q;
		for (let i = bb.i0; i < bb.i1; i++)
			for (let j = 0; j < NJ; j++) {
				const j1 = (j + 1) % NJ;
				quad(
					Z,
					Q,
					(i * NJ + j) * 3,
					((i + 1) * NJ + j) * 3,
					((i + 1) * NJ + j1) * 3,
					(i * NJ + j1) * 3
				);
			}
		if (hasFront) {
			const i = bb.i1;
			const FQ = front.Q;
			for (let j = 0; j < NJ; j++) {
				const j1 = (j + 1) % NJ;
				const a = (i * NJ + j) * 3;
				const d = (i * NJ + j1) * 3;
				tri(
					Z,
					Q[a],
					Q[a + 1],
					Q[a + 2],
					FQ[j * 3],
					FQ[j * 3 + 1],
					FQ[j * 3 + 2],
					FQ[j1 * 3],
					FQ[j1 * 3 + 1],
					FQ[j1 * 3 + 2]
				);
				tri(
					Z,
					Q[a],
					Q[a + 1],
					Q[a + 2],
					FQ[j1 * 3],
					FQ[j1 * 3 + 1],
					FQ[j1 * 3 + 2],
					Q[d],
					Q[d + 1],
					Q[d + 2]
				);
			}
		}
	}

	// A segment on the body between grid vertices (projected Qa/Qb at offsets,
	// facings fa/fb): the front-facing part only.
	function faceSeg(Qa, oa, fa, Qb, ob, fb, alpha, width, hid) {
		if (fa <= 0 && fb <= 0) return;
		let ax = Qa[oa];
		let ay = Qa[oa + 1];
		let az = Qa[oa + 2];
		let bx = Qb[ob];
		let by = Qb[ob + 1];
		let bz = Qb[ob + 2];
		if (fa <= 0 || fb <= 0) {
			const t = fa / (fa - fb);
			const cx = lerp(ax, bx, t);
			const cy = lerp(ay, by, t);
			const cz = lerp(az, bz, t);
			if (fa <= 0) {
				ax = cx;
				ay = cy;
				az = cz;
			} else {
				bx = cx;
				by = cy;
				bz = cz;
			}
		}
		pen.seg(ax, ay, az, bx, by, bz, alpha, width, hid);
	}

	function bodyLines(cam, S, bb, hasFront) {
		const { Q, F, rpx } = B;
		const HID = 0.22;
		// Rings: all of the head and the midpiece, every other one down the tail.
		const ringAt = (i, alpha, width) => {
			if (rpx[i] < 1.3) return;
			const al = alpha * smooth(span(rpx[i], 1.3, 4));
			for (let j = 0; j < NJ; j++) {
				const j1 = (j + 1) % NJ;
				faceSeg(
					Q,
					(i * NJ + j) * 3,
					F[i * NJ + j],
					Q,
					(i * NJ + j1) * 3,
					F[i * NJ + j1],
					al,
					width,
					HID
				);
			}
		};
		for (let i = bb.i0; i <= bb.i1; i++) {
			if (i < NH) {
				if (i === 0) continue;
				const capEdge = i === CAP_I;
				const onCap = HEAD_U[i] <= BODY.cap;
				const al = capEdge ? lerp(0.48, 0.9, S.cap) : onCap ? 0.5 : 0.4;
				ringAt(i, al, capEdge ? lerp(1, 1.45, S.cap) : 1);
			} else {
				const k = i - NH;
				if (k > 10 && k % 2) continue;
				ringAt(i, k <= 10 ? 0.46 : 0.4, 0.95);
			}
		}
		// Generatrices: every other angle on the head, every third on the tube.
		for (let i = bb.i0; i < bb.i1; i++) {
			const head = i < NH - 1;
			const lod = smooth(span(Math.min(rpx[i], rpx[i + 1]), 1.6, 5));
			if (lod < 0.02) continue;
			for (let j = 0; j < NJ; j += head ? 2 : 3) {
				if (!head && j % 3) continue;
				const a = i * NJ + j;
				const b = (i + 1) * NJ + j;
				faceSeg(Q, a * 3, F[a], Q, b * 3, F[b], (head ? 0.5 : 0.48) * lod, 0.95, HID);
			}
		}
		// The sweep's front: the ring it carries, bold, and the last stretch of
		// every generatrix to it.
		if (hasFront) {
			const i = bb.i1;
			const FQ = front.Q;
			const FF = front.F;
			for (let j = 0; j < NJ; j++) {
				const j1 = (j + 1) % NJ;
				faceSeg(FQ, j * 3, FF[j], FQ, j1 * 3, FF[j1], 0.9, 1.5, 0.3);
				if (j % 3 === 0)
					faceSeg(Q, (i * NJ + j) * 3, F[i * NJ + j], FQ, j * 3, FF[j], 0.48, 0.95, HID);
			}
		}
		// The contour: where the surface turns from the lens, on every ring,
		// joined ring to ring down both sides.
		let prevA = null;
		let prevB = null;
		const crossing = (QQ, FF, base, want) => {
			for (let j = 0; j < NJ; j++) {
				const j1 = (j + 1) % NJ;
				const f0 = FF[base + j];
				const f1 = FF[base + j1];
				if (want ? f0 > 0 && f1 <= 0 : f0 <= 0 && f1 > 0) {
					const t = f0 / (f0 - f1);
					const o0 = (base + j) * 3;
					const o1 = (base + j1) * 3;
					return [
						lerp(QQ[o0], QQ[o1], t),
						lerp(QQ[o0 + 1], QQ[o1 + 1], t),
						lerp(QQ[o0 + 2], QQ[o1 + 2], t)
					];
				}
			}
			return null;
		};
		const contourTo = (A, Bp) => {
			if (A && prevA) pen.seg(prevA[0], prevA[1], prevA[2], A[0], A[1], A[2], 0.92, 1.6, HID);
			if (Bp && prevB) pen.seg(prevB[0], prevB[1], prevB[2], Bp[0], Bp[1], Bp[2], 0.92, 1.6, HID);
			prevA = A;
			prevB = Bp;
		};
		for (let i = bb.i0; i <= bb.i1; i++) {
			// The nose is a point: both sides of the contour close on it.
			if (i === 0) {
				const nose = [Q[0], Q[1], Q[2]];
				contourTo(nose, nose);
				continue;
			}
			contourTo(crossing(Q, F, i * NJ, true), crossing(Q, F, i * NJ, false));
		}
		if (hasFront) {
			// front.Q is indexed from 0: a base of 0 into its own arrays.
			contourTo(crossing(front.Q, front.F, 0, true), crossing(front.Q, front.F, 0, false));
		}
		// The midpiece's helix, wound on as it thickens.
		if (S.helix > 0) {
			const turns = 7;
			const iA = NH;
			const iB = TAIL0;
			const nS = 84;
			const upto = Math.round(nS * S.helix);
			let prev = null;
			for (let m = 0; m <= upto; m++) {
				const f = (m / nS) * (iB - iA) + iA;
				const i = Math.min(iB - 1, Math.floor(f));
				const fr = f - i;
				const ph = (TAU * turns * m) / nS;
				const jf = ((ph / TAU) * NJ) % NJ;
				const j = Math.floor(jf);
				const fj = jf - j;
				const j1 = (j + 1) % NJ;
				const pick = (A, d) =>
					lerp(
						lerp(A[(i * NJ + j) * d], A[(i * NJ + j1) * d], fj),
						lerp(A[((i + 1) * NJ + j) * d], A[((i + 1) * NJ + j1) * d], fj),
						fr
					);
				const pq = (d) =>
					lerp(
						lerp(Q[(i * NJ + j) * 3 + d], Q[(i * NJ + j1) * 3 + d], fj),
						lerp(Q[((i + 1) * NJ + j) * 3 + d], Q[((i + 1) * NJ + j1) * 3 + d], fj),
						fr
					);
				const cur = [pq(0), pq(1), pq(2), pick(F, 1)];
				if (prev && prev[3] > 0 && cur[3] > 0)
					pen.seg(prev[0], prev[1], prev[2], cur[0], cur[1], cur[2], 0.72, 1.05, 0);
				prev = cur;
			}
		}
		// The centreline: written on from the front, already beating; once the
		// tube is round it, inside, faint.
		if (S.write > 0 && S.cline > 0.01) {
			const sEnd = lerp(FRONT, TIP, S.write);
			const Qc = B.Qc;
			for (let i = NH; i < NS - 1; i++) {
				if (B.s[i] >= sEnd) break;
				const o = i * 3;
				let bx = Qc[o + 3];
				let by = Qc[o + 4];
				let bz = Qc[o + 5];
				if (B.s[i + 1] > sEnd) {
					const t = (sEnd - B.s[i]) / (B.s[i + 1] - B.s[i]);
					bx = lerp(Qc[o], bx, t);
					by = lerp(Qc[o + 1], by, t);
					bz = lerp(Qc[o + 2], bz, t);
				}
				pen.seg(Qc[o], Qc[o + 1], Qc[o + 2], bx, by, bz, 0.9 * S.cline, 1.5, 0.35);
			}
		}
	}

	return {
		render(ctx, w, h, t) {
			const S = stateAt(t);
			const L = lens(S, w, h);
			const cam = L.cam;
			cam.k = h / 2 / Math.tan((FOV * Math.PI) / 360);
			pen.cam = cam;
			pen.w = w;
			pen.h = h;
			pen.ref = L.dist;
			Z.reset(w, h);
			const eye = cam.pos;

			// The body.
			shapeBody(B, S, path);
			const n = NS * NJ;
			for (let k = 0; k < n; k++) {
				const o = k * 3;
				B.F[k] =
					B.N[o] * (eye[0] - B.P[o]) +
					B.N[o + 1] * (eye[1] - B.P[o + 1]) +
					B.N[o + 2] * (eye[2] - B.P[o + 2]);
			}
			projectAll(cam, B.P, B.Q);
			projectAll(cam, B.Cw, B.Qc);
			for (let i = 0; i < NS; i++) {
				const o = i * 3;
				const d = B.Qc[o + 2];
				B.rpx[i] = d > NEAR ? (Math.max(B.a[i], B.c[i]) * cam.k) / d : 0;
			}
			const bb = bodyBuilt(S);
			const hasFront = bodyFront(bb);
			if (hasFront) projectAll(cam, front.P, front.Q);

			// The shell.
			const built = shellBuilt(cam, S);

			// Depth: the body and the shell together.
			bodyDepth(bb, hasFront);
			if (built.iF >= 0) shellDepth(cam, S, built);

			// Lines.
			shellLines(cam, S, built);
			bodyLines(cam, S, bb, hasFront);
			ink.flush(ctx);

			// Lit points: the pen and the frame's origin; the spark of life; the
			// pole the swimmer is going to.
			if (S.dot > 0 && S.sweepRaw < 1) {
				let s = FRONT;
				if (S.sweep > 0) s = S.sweep;
				else if (S.write > 0) s = lerp(FRONT, TIP, S.write);
				const i = Math.min(
					NS - 1,
					NH +
						Math.max(
							0,
							TUBE_S.findIndex((x) => x >= s)
						)
				);
				const p = [B.Cw[i * 3], B.Cw[i * 3 + 1], B.Cw[i * 3 + 2]];
				if (S.sweep > 0 && hasFront) {
					// The frame's spokes, from the centre to the ring.
					const c = [0, 0, 0];
					for (let j = 0; j < NJ; j++) for (let d = 0; d < 3; d++) c[d] += front.P[j * 3 + d] / NJ;
					for (const j of [0, NJ / 4]) {
						const e = [front.P[j * 3], front.P[j * 3 + 1], front.P[j * 3 + 2]];
						pen.seg3(c, e, 0.6, 1, 0);
					}
					ink.flush(ctx);
					p[0] = c[0];
					p[1] = c[1];
					p[2] = c[2];
				}
				const fade = S.dot * (1 - smooth(span(S.sweepRaw, 0.9, 1)));
				lit3(ctx, cam, p, 2.4, 0.85 * fade, 'rgba(255, 222, 150, 0.35)');
			}
			if (S.spark > 0 && S.spark < 1) {
				const i = NH + 6;
				const p = [B.Cw[i * 3], B.Cw[i * 3 + 1], B.Cw[i * 3 + 2]];
				lit3(ctx, cam, p, 3, Math.sin(Math.PI * S.spark) * 0.9, 'rgba(255, 222, 150, 0.4)');
			}
			if (S.pole > 0) lit3(ctx, cam, [0, 0, 0], 2.2, 0.7 * S.pole, 'rgba(255, 222, 150, 0.3)');
		}
	};
}

// The shell's point at θ and section sample k (for the mouth once grown).
function at0(SHL, t, k, out, o) {
	SHL.at(t, k, out, o);
}
