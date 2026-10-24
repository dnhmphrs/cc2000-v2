// ── log-swimmer · cell ───────────────────────────────────────────────────────
// MORPHOGENESIS: a round cell becomes the swimmer. A chalk sphere, a globe of
// parallels and meridians with its hidden lines removed, the nucleus seen
// inside it; the cell draws out long; the nucleus condenses into the head —
// the paddle, flattened — and the acrosome spreads over its front as a cap;
// the membrane closes in round the head, leaving the cytoplasm as a lump
// behind it, which pinches away into the midpiece, its mitochondria wound
// round it; the tail BUDS from the back and lengthens, a ring added as it
// passes each station. A spark at the midpiece and it is alive: the beat runs
// down the tail, it rolls, it moves — and it is on the Riemann sphere, riding
// the LOXODROME, the rhumb line from the south pole to the north, toward the
// north pole, spiralling in.
//
// The run, beat by beat (t in seconds of 21; at = t / 21):
//   0.15–1.7   the cell written: its parallels round like compass circles,
//              then its meridians pole to pole, its outline (at .04 written).
//   0.9 –2.1   the nucleus up inside it, fainter (seen through the membrane).
//   1.8 –3.6   the cell elongates, an egg (at .12).
//   2.3 –4.6   the nucleus condenses into the paddle (5 × 3 × 1.5); the
//              acrosome spreads back over its front two-thirds, its rim a
//              ring sliding back (.15–.22); the lens sinks to the edge, where
//              the condensed head reads thin (at .22).
//   3.9 –5.5   the membrane tightens round the head and cap; behind the head
//              it holds the cytoplasm, a lump (at .23) …
//   4.8 –6.1   … which pinches into the midpiece, 4 × 1; the nucleus's own
//              lines go into the membrane's (5.2–6.2); the cap's rim stays, a
//              lip; the mitochondrial helix is wound round the midpiece; the
//              lens over the broad face of the head (at .29).
//   5.6 –8.3   the tail buds out of the back of the midpiece and lengthens to
//              45, tapering, each ring written round as the tip passes it
//              (at .28, .32, .36); the lens draws back to hold the whole body.
//   8.3 –10    life: a gold spark at the midpiece (at .41); the beat starts at
//              the neck and runs down to the tip; the roll starts; it moves
//              (at .44–.47).
//   9.2 –12.6  the Riemann sphere comes up under it (it was born on it): the
//              meridians and parallels, faint, and its outline; the loxodrome
//              written from the south pole to the north, bold; the north pole
//              lit; the plane under the sphere with its polar grid and the
//              logarithmic spiral the loxodrome projects to; the ray from the
//              north pole through the swimmer to its image on the spiral. The
//              lens draws back to see it whole, the swimmer on the sphere
//              (at .52, .6).
//  12.8 –21    the approach: the lens comes round behind and over the swimmer
//              and follows it round the pole, rising until the turns of the
//              rhumb line ahead are seen winding into the lit pole, and draws
//              in; the line behind the swimmer dims, the line ahead stays bold.
//              It swims about one turn round the pole, from 10° north of the
//              equator to 57° (at .7 – .98). Then round.
//
// What is EXACT: the Riemann sphere, radius R, tangent to the plane at the
// south pole S = 0 and projected from the north pole N = ∞: a point at polar
// angle θ from S and longitude φ goes to ρ e^{iφ} with ρ = 2R tan(θ/2); its
// meridians are drawn every 30° and its parallels every 15°, and on the plane
// their images — the rays arg z = const and the circles |z| = 2R tan(θ/2) —
// so the plane's polar grid is the sphere's, projected. The LOXODROME is the
// image of the logarithmic spiral z = 2R e^{(a + i)(φ − φ₀)}, a = 1/2π (so
// |z| grows by e every turn), which crosses every ray at the angle arccot a
// ≈ 81°; stereographic projection is
// conformal, so the loxodrome crosses every meridian at that same angle
// (sin θ dφ/dθ = 1/a: tan(θ/2) = e^{a(φ − φ₀)}), from S to N, winding round
// each pole infinitely often (drawn until its turns are below a pixel). Its
// arc length is linear in θ, ℓ = R θ √(1 + a²)/a, so the swimmer's place on it
// is exact for its distance swum, and its frame there (tangent, the sphere's
// normal, across) is analytic. The ray from N through the swimmer's point on
// the loxodrome meets the plane on the spiral, exactly. (Checked numerically
// on the code as written: the crossing angle constant to 2e−16, the tangent
// against the derivative to 1e−9, the ray's foot on the spiral to 1e−13.)
// Hidden lines by a
// software depth buffer of the sphere and the body; the body's outline is
// the contour of its own mesh, where the normal meets the line of sight.
// What is a PICTURE: the cell and its stages — the sphere, the egg, the
// condensing, the lump of cytoplasm, the bud — are a morph between shapes
// chosen to read, not a simulation; the body's proportions as the brief has
// them (head a flattened oval 5 × 3 × 1.5 under an acrosome over its front
// two-thirds, neck, midpiece 4 × 1 with a seven-turn helix, flagellum 45
// tapering), each section an ellipse; the beat, a travelling wave of the
// flagellum's tangent angle growing toward the tip, integrated so the tail
// keeps its length, the whole turned so its centroid lies on the heading
// (which yaws the head against the tail), the beat's plane the head's and
// rolled with it; the body laid along the loxodrome it has swum, hovering a
// little over the sphere; the sizes (R = 90 to a body of 55), the pace, the
// lens.
//
// Frame cost: about 2–8 ms of script a frame headless at 1280 × 800 (2 in
// the generation, 7–8 once the sphere is up), the frame interval holding at
// 16.7 ms; segments batched by alpha and width, the depth buffers at 4 px
// (one for the sphere and the body, one for the nucleus and cap inside it).

import {
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	clamp01,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	camera3
} from '../log/board.js';
import { NEAR, makeDepth, spline, lit3 } from '../log/space.js';
import { makeInk } from '../log/kummer.js';

export const meta = {
	title:
		'cell: a round cell condenses into the swimmer, which rides the loxodrome of the Riemann sphere to its pole',
	order: 5,
	seconds: 21,
	three: false
};

const PI = Math.PI;
const FOV = 40;
const UP = [0, 1, 0];

// ── The Riemann sphere and the loxodrome ─────────────────────────────────────
// World y up; the plane y = 0; the sphere of radius R on it, tangent at S = 0.
const R = 90;
const CEN = [0, R, 0];
const NORTH = [0, 2 * R, 0];
const A_SP = 1 / TAU; // the spiral's rate: z = 2R e^{(a + i)(φ − φ₀)}, e-fold a turn
const ROOT = Math.sqrt(1 + A_SP * A_SP);
const KAP = A_SP / (R * ROOT); // dθ/dℓ along the loxodrome
const PHI0 = 0.3; // the longitude where it crosses the equator
const HOVER = 6.5; // the body's axis over the sphere
const TH_BIRTH = (100 * PI) / 180;
const L_BIRTH = (TH_BIRTH - PI / 2) / KAP;
const RHO_MAX = 3.6 * R; // how far the plane is drawn

const sphPt = (th, ph) => [
	R * Math.sin(th) * Math.cos(ph),
	R - R * Math.cos(th),
	R * Math.sin(th) * Math.sin(ph)
];

// The loxodrome at arc length ℓ from its equator crossing (ℓ grows toward N):
// the point, the sphere's normal n, the tangent T (unit, forward) and B = n × T.
function lox(l) {
	const th = PI / 2 + KAP * l;
	const ph = PHI0 + Math.log(Math.tan(th / 2)) / A_SP;
	const st = Math.sin(th);
	const ct = Math.cos(th);
	const sp = Math.sin(ph);
	const cp = Math.cos(ph);
	const n = [st * cp, -ct, st * sp];
	const T = [(A_SP * ct * cp - sp) / ROOT, (A_SP * st) / ROOT, (A_SP * ct * sp + cp) / ROOT];
	const eth = [ct * cp, st, ct * sp]; // poleward
	return { p: [R * n[0], R + R * n[1], R * n[2]], n, T, B: cross(n, T), eth, th, ph };
}

// ── The body: s back from the nose ───────────────────────────────────────────
const HEAD = 5;
const HC = 2.5; // the head's middle
const RIM = 3.33; // the acrosome's edge, two-thirds back
const CAPK = 1.06; // the cap: the head scaled about its middle
const MID0 = 5.6;
const MID1 = 9.6;
const TAIL = 45;
const R_MID = 0.54;

function headA(s) {
	const x = clamp01(s / HEAD);
	if (x <= 0.45) return 1.5 * Math.sqrt(Math.max(0, 1 - ((0.45 - x) / 0.45) ** 2));
	const q = (x - 0.45) / 0.55;
	return 1.5 * Math.sqrt(1 - q * q * (1 - (0.42 / 1.5) ** 2));
}
function headB(s) {
	const x = clamp01(s / HEAD);
	if (x <= 0.55) return 0.75 * Math.sqrt(Math.max(0, 1 - ((0.55 - x) / 0.55) ** 2));
	const q = (x - 0.55) / 0.45;
	return 0.75 * Math.sqrt(1 - q * q * (1 - (0.42 / 0.75) ** 2));
}
// The cap over the head's front two-thirds, slightly proud of it.
const capU = (s) => HC + (s - HC) / CAPK;
const S_RIM = HC + (RIM - HC) * CAPK;
function capAB(s) {
	const u = capU(s);
	if (u < 0 || u > RIM) return [0, 0];
	return [CAPK * headA(u), CAPK * headB(u)];
}
const tailR = (s) => lerp(0.32, 0.07, Math.pow(clamp01((s - MID1) / TAIL), 0.8));

// The membrane at σ ∈ [0, 1] (nose to back), in its final form: tight round
// head and cap, the neck, the midpiece, a round end where the tail comes out.
function tightAt(sig) {
	if (sig <= 0.55) {
		const s = -0.15 + 5.15 * (1 - Math.cos(((PI / 2) * sig) / 0.55));
		const hs = Math.min(HEAD, Math.max(0, s));
		const [ca, cb] = capAB(s);
		return [s, Math.max(ca, headA(hs)) + 0.04, Math.max(cb, headB(hs)) + 0.04];
	}
	if (sig <= 0.92) {
		const s = 5 + (4.6 * (sig - 0.55)) / 0.37;
		const r = s < MID0 ? lerp(0.46, R_MID, smooth((s - 5) / 0.6)) : R_MID;
		return [s, r, r];
	}
	const x = (sig - 0.92) / 0.08;
	const r = R_MID * Math.cos((PI / 2) * x);
	return [MID1 + 0.5 * Math.sin((PI / 2) * x), r, r];
}
// The cytoplasm the membrane still holds behind the head, before the pinch.
const bulge = (sig) => (sig <= 0.5 ? 0 : 2.2 * Math.pow(Math.sin((PI * (sig - 0.5)) / 0.5), 0.7));

// The cell, the egg, the tight membrane: one surface, blended.
const C0 = 3.6;
const R0 = 4.3;
const C1 = 4.4;
const L1 = 5.6;
const W1 = 3.3;
const W1B = 2.9;
function membraneAt(sig, me, mt, mp) {
	const c = Math.cos(PI * sig);
	const sn = Math.sin(PI * sig);
	let s = lerp(C0 - R0 * c, C1 - L1 * c, me);
	let A = lerp(R0 * sn, W1 * sn, me);
	let B = lerp(R0 * sn, W1B * sn, me);
	if (mt > 0) {
		const [ts, ta, tb] = tightAt(sig);
		const bl = bulge(sig) * (1 - mp);
		s = lerp(s, ts, mt);
		A = lerp(A, ta + bl, mt);
		B = lerp(B, tb + 0.9 * bl, mt);
	}
	return { s, A, B };
}
// The nucleus: a sphere off the cell's middle, condensing into the head.
const CN = 3.0;
const RN = 2.3;
function nucleusAt(sig, mc) {
	const c = Math.cos(PI * sig);
	const sn = Math.sin(PI * sig);
	const sh = HC - HC * c;
	return {
		s: lerp(CN - RN * c, sh, mc),
		A: lerp(RN * sn, headA(sh), mc),
		B: lerp(RN * sn, headB(sh), mc)
	};
}
// The rim's σ on the nucleus at the end: where the head's station is RIM.
const SIG_RIM = Math.acos((HC - RIM) / HC) / PI;

// ── Time ─────────────────────────────────────────────────────────────────────
// ∫ of smooth(span(t, a, b)): a rate that eases in and stays.
function ramp(t, a, b) {
	if (t <= a) return 0;
	if (t >= b) return (b - a) / 2 + (t - b);
	const x = (t - a) / (b - a);
	return (b - a) * (x * x * x - (x * x * x * x) / 2);
}
const lhAt = (t) => L_BIRTH + 20 * ramp(t, 8.7, 10.4) + 46 * ramp(t, 10.4, 21);

function stateAt(t) {
	return {
		t,
		me: smooth(span(t, 1.8, 3.6)),
		mc: smooth(span(t, 2.3, 4.6)),
		rim: SIG_RIM * smooth(span(t, 2.9, 4.7)),
		mt: smooth(span(t, 3.9, 5.5)),
		mp: smooth(span(t, 4.8, 6.1)),
		merge: smooth(span(t, 5.2, 6.2)),
		Lt: TAIL * Math.pow(smooth(span(t, 5.6, 8.3)), 1.15),
		helix: span(t, 6.0, 7.2),
		lh: lhAt(t),
		psi: TAU * (0.8 * ramp(t, 8.6, 10.2) + 0.3 * ramp(t, 12, 21)),
		phase: TAU * (3 * ramp(t, 8.4, 9.6) + 1.6 * ramp(t, 12, 21)),
		front: 5 + 62 * smooth(span(t, 8.4, 9.9)),
		live: t > 8.4
	};
}

// ── The beat ─────────────────────────────────────────────────────────────────
// The centreline in the body's own plane (X back along the heading, Y
// across), from the tangent angle, integrated from the nose so the tail keeps
// its length; turned so its centroid is on the heading — which is what yaws
// the head against the tail.
const DS = 0.25;
const NBEAT = Math.ceil(57 / DS) + 1;
const S_BEAT = 5.2;
const K_BEAT = TAU / 23;
function beatShape(st) {
	const X = new Float64Array(NBEAT);
	const Y = new Float64Array(NBEAT);
	let x = 0;
	let y = 0;
	let sx = 0;
	let sy = 0;
	for (let j = 1; j < NBEAT; j++) {
		const s = (j - 0.5) * DS;
		let a = 0;
		if (s > S_BEAT) {
			const d = s - S_BEAT;
			const amp = lerp(0.1, 0.95, Math.pow(clamp01(d / 49), 1.1));
			a = amp * smooth(span(st.front - s, 0, 8)) * Math.sin(K_BEAT * d - st.phase);
		}
		x += DS * Math.cos(a);
		y += DS * Math.sin(a);
		X[j] = x;
		Y[j] = y;
		sx += x;
		sy += y;
	}
	const g = -Math.atan2(sy, sx);
	const c = Math.cos(g);
	const s = Math.sin(g);
	for (let j = 1; j < NBEAT; j++) {
		const xx = X[j];
		X[j] = c * xx - s * Y[j];
		Y[j] = s * xx + c * Y[j];
	}
	return { X, Y };
}

// The spine: the centreline laid along the loxodrome it has swum — each
// station at the path's point that far back, hovering, displaced across by
// the beat in the rolled frame — and a frame at each station.
const J0 = 8;
const NJ = J0 + NBEAT;
function makeSpine(st, beat) {
	const C = new Array(NJ);
	const E = new Array(NJ);
	const cp = Math.cos(st.psi);
	const sp = Math.sin(st.psi);
	for (let j = 0; j < NJ; j++) {
		const k = j - J0;
		const X = beat && k > 0 ? beat.X[k] : k * DS;
		const Y = beat && k > 0 ? beat.Y[k] : 0;
		const q = lox(st.lh - X);
		const e1 = add3(mul3(q.B, cp), mul3(q.n, sp));
		C[j] = add3(add3(q.p, mul3(q.n, HOVER)), mul3(e1, Y));
		E[j] = e1;
	}
	const F1 = new Array(NJ);
	const F2 = new Array(NJ);
	for (let j = 0; j < NJ; j++) {
		const tg = norm(sub3(C[Math.min(NJ - 1, j + 1)], C[Math.max(0, j - 1)]));
		const e1 = norm(sub3(E[j], mul3(tg, dot(E[j], tg))));
		F1[j] = e1;
		F2[j] = cross(tg, e1);
	}
	return {
		at(s) {
			const u = Math.min(NJ - 1.001, Math.max(0, s / DS + J0));
			const j = Math.floor(u);
			const f = u - j;
			const l3 = (A, i) => [
				A[i][0] + (A[i + 1][0] - A[i][0]) * f,
				A[i][1] + (A[i + 1][1] - A[i][1]) * f,
				A[i][2] + (A[i + 1][2] - A[i][2]) * f
			];
			return { c: l3(C, j), e1: l3(F1, j), e2: l3(F2, j) };
		}
	};
}

// ── Surfaces as grids ────────────────────────────────────────────────────────
const TRIG = {};
function trig(m) {
	if (!TRIG[m]) {
		const c = new Float64Array(m);
		const s = new Float64Array(m);
		for (let j = 0; j < m; j++) {
			c[j] = Math.cos((TAU * j) / m);
			s[j] = Math.sin((TAU * j) / m);
		}
		TRIG[m] = { c, s };
	}
	return TRIG[m];
}
// Sections [{s, A, B}] round the spine: rows of world points P, projected Q.
function tube(cam, spine, secs, m) {
	const { c, s } = trig(m);
	const P = [];
	const Q = [];
	for (const sc of secs) {
		const f = spine.at(sc.s);
		const rp = new Array(m);
		const rq = new Array(m);
		for (let j = 0; j < m; j++) {
			const a = sc.A * c[j];
			const b = sc.B * s[j];
			const p = [
				f.c[0] + a * f.e1[0] + b * f.e2[0],
				f.c[1] + a * f.e1[1] + b * f.e2[1],
				f.c[2] + a * f.e1[2] + b * f.e2[2]
			];
			rp[j] = p;
			rq[j] = cam.project(p);
		}
		P.push(rp);
		Q.push(rq);
	}
	return { P, Q, n: secs.length, m };
}
function fillDepth(Z, G) {
	const { Q, n, m } = G;
	for (let i = 0; i < n - 1; i++)
		for (let j = 0; j < m; j++) {
			const j1 = (j + 1) % m;
			Z.tri(Q[i][j], Q[i + 1][j], Q[i + 1][j1]);
			Z.tri(Q[i][j], Q[i + 1][j1], Q[i][j1]);
		}
}

// Behind the surface in Z? The deepest of the four cells round the point (so
// an outline stays drawn), with a relative slack.
function behind(Z, x, y, z, rel = 0.01) {
	if (!Z || !Z.on) return false;
	const fx = x / Z.s - 0.5;
	const fy = y / Z.s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	let mx = -Infinity;
	for (let dy = 0; dy < 2; dy++)
		for (let dx = 0; dx < 2; dx++) {
			const xx = x0 + dx;
			const yy = y0 + dy;
			if (xx < 0 || yy < 0 || xx >= Z.W || yy >= Z.H) return false;
			const v = Z.buf[yy * Z.W + xx];
			if (v > mx) mx = v;
		}
	return z > mx * (1 + rel) + 0.01;
}

// A projected segment into the ink: culled, its width by depth, faint and
// dashed (or gone) behind the surface in Z.
function emit(ink, Z, a, b, alpha, width, o) {
	if (alpha < 0.012 || a[2] <= NEAR || b[2] <= NEAR) return;
	const M = 40;
	if ((a[0] < -M && b[0] < -M) || (a[0] > o.w + M && b[0] > o.w + M)) return;
	if ((a[1] < -M && b[1] < -M) || (a[1] > o.h + M && b[1] > o.h + M)) return;
	const mz = (a[2] + b[2]) / 2;
	const ws = Math.min(2.2, Math.max(0.55, o.ref / mz));
	const back = behind(Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, mz, o.rel ?? 0.01);
	const col = o.color ?? PAL.chalk;
	if (!back) ink.seg(col, alpha, width * ws, false, a[0], a[1], b[0], b[1]);
	else if (o.back > 0)
		ink.seg(col, alpha * o.back, width * ws * 0.62, true, a[0], a[1], b[0], b[1]);
}
// A projected polyline, the first `upto` of it (by vertex count).
function polyQ(ink, Z, Q, alpha, width, o, upto = 1, closed = false) {
	const n = Q.length;
	const segs = closed ? n : n - 1;
	const end = clamp01(upto) * segs;
	for (let i = 0; i < segs && i < end; i++) {
		const a = Q[i];
		const b0 = Q[(i + 1) % n];
		const f = Math.min(1, end - i);
		const b =
			f < 1
				? [a[0] + (b0[0] - a[0]) * f, a[1] + (b0[1] - a[1]) * f, a[2] + (b0[2] - a[2]) * f]
				: b0;
		emit(ink, Z, a, b, alpha, width, o);
	}
}
const ring = (G, i, alpha, width, o, ink, Z, upto = 1) =>
	polyQ(ink, Z, G.Q[i], alpha, width, o, upto, true);
function gen(G, j, alpha, width, o, ink, Z, upto = 1, i0 = 0, i1 = G.n - 1) {
	const col = [];
	for (let i = i0; i <= i1; i++) col.push(G.Q[i][j]);
	polyQ(ink, Z, col, alpha, width, o, upto);
}

// The outline: where the mesh's normal meets the line of sight, by marching
// squares on n·(P − eye) over the grid (wrapping round).
const MS = [
	[],
	[3, 0],
	[0, 1],
	[3, 1],
	[1, 2],
	[3, 0, 1, 2],
	[0, 2],
	[3, 2],
	[2, 3],
	[0, 2],
	[0, 1, 2, 3],
	[1, 2],
	[1, 3],
	[0, 1],
	[0, 3],
	[]
];
function contour(ink, Z, G, eye, alpha, width, o) {
	if (alpha < 0.012) return;
	const { P, Q, n, m } = G;
	const F = [];
	for (let i = 0; i < n; i++) {
		const row = new Float64Array(m);
		const ia = P[Math.min(n - 1, i + 1)];
		const ib = P[Math.max(0, i - 1)];
		for (let j = 0; j < m; j++) {
			const dS = sub3(ia[j], ib[j]);
			const dF = sub3(P[i][(j + 1) % m], P[i][(j + m - 1) % m]);
			row[j] = dot(cross(dS, dF), sub3(P[i][j], eye));
		}
		F.push(row);
	}
	const V = [null, null, null, null];
	const f = [0, 0, 0, 0];
	const edge = (e) => {
		const a = e;
		const b = (e + 1) % 4;
		const fa = f[a];
		const fb = f[b];
		const t = fa === fb ? 0.5 : fa / (fa - fb);
		const qa = V[a];
		const qb = V[b];
		return [qa[0] + (qb[0] - qa[0]) * t, qa[1] + (qb[1] - qa[1]) * t, qa[2] + (qb[2] - qa[2]) * t];
	};
	for (let i = 0; i < n - 1; i++)
		for (let j = 0; j < m; j++) {
			const j1 = (j + 1) % m;
			f[0] = F[i][j];
			f[1] = F[i + 1][j];
			f[2] = F[i + 1][j1];
			f[3] = F[i][j1];
			const k = (f[0] > 0) | ((f[1] > 0) << 1) | ((f[2] > 0) << 2) | ((f[3] > 0) << 3);
			const E = MS[k];
			if (!E.length) continue;
			V[0] = Q[i][j];
			V[1] = Q[i + 1][j];
			V[2] = Q[i + 1][j1];
			V[3] = Q[i][j1];
			for (let e = 0; e < E.length; e += 2)
				emit(ink, Z, edge(E[e]), edge(E[e + 1]), alpha, width, o);
		}
}

// ── The sphere's lines, once ─────────────────────────────────────────────────
function setup() {
	const merid = [];
	for (let k = 0; k < 12; k++) {
		const pts = [];
		for (let i = 0; i <= 72; i++) pts.push(sphPt((PI * i) / 72, (k * PI) / 6));
		merid.push(pts);
	}
	const paral = [];
	for (let k = 1; k <= 11; k++) {
		const pts = [];
		for (let i = 0; i < 96; i++) pts.push(sphPt((k * PI) / 12, (TAU * i) / 96));
		paral.push({ k, pts });
	}
	// Uniform in θ is uniform in arc length on a loxodrome.
	const loxo = [];
	const NL = 1700;
	for (let i = 0; i <= NL; i++) {
		const th = 0.003 + ((PI - 0.006) * i) / NL;
		loxo.push(sphPt(th, PHI0 + Math.log(Math.tan(th / 2)) / A_SP));
	}
	const rays = [];
	for (let k = 0; k < 12; k++) {
		const pts = [];
		for (let i = 0; i <= 48; i++) {
			const rho = (RHO_MAX * i) / 48;
			pts.push([rho * Math.cos((k * PI) / 6), 0, rho * Math.sin((k * PI) / 6)]);
		}
		rays.push(pts);
	}
	const circ = [];
	for (let k = 1; k <= 8; k++) {
		const rho = 2 * R * Math.tan((k * PI) / 24);
		const pts = [];
		for (let i = 0; i < 128; i++)
			pts.push([rho * Math.cos((TAU * i) / 128), 0, rho * Math.sin((TAU * i) / 128)]);
		circ.push({ k, rho, pts });
	}
	// The spiral: uniform in ρ is uniform in arc length on a log spiral.
	const spiral = [];
	for (let i = 0; i <= 260; i++) {
		const rho = 0.4 + ((RHO_MAX - 0.4) * i) / 260;
		const ph = PHI0 + Math.log(rho / (2 * R)) / A_SP;
		spiral.push([rho * Math.cos(ph), 0, rho * Math.sin(ph)]);
	}
	// The sphere's depth mesh.
	const grid = [];
	for (let i = 0; i <= 30; i++) {
		const row = [];
		for (let j = 0; j <= 48; j++) row.push(sphPt((PI * i) / 30, (TAU * j) / 48));
		grid.push(row);
	}
	return { merid, paral, loxo, rays, circ, spiral, grid };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// Three rigs, blended: the swimmer's own (in its frame on the sphere, keyed
// by azimuth from behind and elevation — edge-on to the flat head at 4.7 s,
// over its broad face at 6), the sphere whole, and over the swimmer with the
// pole ahead of it across the turns.
const AZ = [
	[0, 2.3],
	[2.0, 2.0],
	[3.6, 1.75],
	[4.7, 1.62],
	[6.0, 1.45],
	[7.2, 1.4],
	[8.6, 1.5],
	[11, 1.2]
];
const EL = [
	[0, 0.62],
	[2.0, 0.45],
	[3.6, 0.3],
	[4.7, 0.05],
	[6.0, 0.95],
	[7.2, 0.65],
	[8.6, 0.55],
	[11, 0.6]
];
const LH_B = lhAt(10.5);
// The approach rig, from its start to its end: how far the lens leans back
// along the heading, its tilt off the sphere's normal away from the pole
// (degrees), its distance, and how far toward the pole it looks.
const CB = [0.3, 0.15];
const CS = [40, 0];
const CU = [160, 138];
const CK = [0.3, 0.42];
function lens(w, h, t, st) {
	// The swimmer's own.
	const sf = 3.8 + 0.42 * st.Lt;
	const qa = lox(st.lh - sf);
	const focus = add3(qa.p, mul3(qa.n, HOVER));
	const az = spline(t, AZ);
	const el = spline(t, EL);
	const dA = (19 + 0.95 * st.Lt) * (1 + 0.7 * smooth(span(t, 8.6, 11)));
	const dir = add3(
		mul3(add3(mul3(qa.T, -Math.cos(az)), mul3(qa.B, Math.sin(az))), Math.cos(el)),
		mul3(qa.n, Math.sin(el))
	);
	const A = { pos: add3(focus, mul3(dir, dA)), tgt: focus, up: qa.n };
	// The sphere whole, from over the swimmer's shoulder, following it at half
	// its pace.
	const qb = lox(LH_B + 0.45 * (st.lh - LH_B) - 20);
	const dB = norm(add3(add3(qb.n, mul3(UP, 0.62)), mul3(qb.T, -0.35)));
	const tB = add3(lerp3(CEN, focus, 0.4), [0, 0.05 * R, 0]);
	const B = { pos: add3(tB, mul3(dB, 3.5 * R)), tgt: tB, up: UP };
	// Behind and over the swimmer, the pole ahead of it across the turns,
	// following it round; drawing in onto the pole.
	const qs = lox(st.lh + 4);
	const fs = add3(qs.p, mul3(qs.n, HOVER));
	const u = smooth(span(t, 12.8, 21));
	const push = smooth(span(t, 17.6, 21));
	const tC = lerp3(fs, NORTH, lerp(CK[0], CK[1], u) + 0.05 * push);
	const tilt = (lerp(CS[0], CS[1], u) * PI) / 180;
	const dC = norm(
		add3(
			add3(mul3(qs.n, Math.cos(tilt)), mul3(qs.eth, -Math.sin(tilt))),
			mul3(qs.T, -lerp(CB[0], CB[1], u))
		)
	);
	const pC = add3(tC, mul3(dC, lerp(CU[0], CU[1], u) * (1 - 0.15 * push)));
	const Cc = { pos: pC, tgt: tC, up: norm(add3(qs.n, mul3(qs.eth, 0.6))) };
	const wb = smooth(span(t, 9.0, 12.0));
	const wc = smooth(span(t, 12.8, 17.5));
	const pos = lerp3(lerp3(A.pos, B.pos, wb), Cc.pos, wc);
	const tgt = lerp3(lerp3(A.tgt, B.tgt, wb), Cc.tgt, wc);
	const up = norm(lerp3(lerp3(A.up, B.up, wb), Cc.up, wc));
	const cam = camera3({ pos, target: tgt, up, fov: FOV, w, h });
	cam.ref = Math.hypot(...sub3(pos, focus));
	return cam;
}
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// ── Sections ─────────────────────────────────────────────────────────────────
const NSIG = 50;
const MEM_RINGS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 47];
function membraneSecs(st) {
	const out = [];
	for (let i = 0; i <= NSIG; i++) out.push(membraneAt(i / NSIG, st.me, st.mt, st.mp));
	return out;
}
const NNUC = 24;
function nucleusSecs(st) {
	const out = [];
	for (let i = 0; i <= NNUC; i++) out.push(nucleusAt(i / NNUC, st.mc));
	return out;
}
// The cap on the nucleus as it is, scaled about its middle, out to the rim.
function capSecs(st, n = 10) {
	const out = [];
	const sc = lerp(CN, HC, st.mc);
	for (let i = 0; i <= n; i++) {
		const q = nucleusAt((st.rim * i) / n, st.mc);
		out.push({ s: sc + (q.s - sc) * CAPK, A: q.A * CAPK, B: q.B * CAPK });
	}
	return out;
}
// The tail from the midpiece's back to its tip (a dome of its own radius):
// stations every half unit, a ring every third.
function tailSecs(Lt) {
	const out = [];
	const sE = MID1 + Lt;
	const rT = Math.min(tailR(sE), Lt);
	const sC = sE - rT;
	for (let i = 0; MID1 + 0.5 * i < sC - 0.05; i++)
		out.push({ s: MID1 + 0.5 * i, A: tailR(MID1 + 0.5 * i), B: tailR(MID1 + 0.5 * i), i });
	out.push({ s: sC, A: rT, B: rT, i: -1 });
	for (let k = 1; k <= 4; k++) {
		const b = ((PI / 2) * k) / 4;
		const r = Math.max(1e-3, rT * Math.cos(b));
		out.push({ s: sC + rT * Math.sin(b), A: r, B: r, i: -1 });
	}
	return out;
}

// ── A frame ──────────────────────────────────────────────────────────────────
export async function make() {
	const Zo = makeDepth(4);
	const Zi = makeDepth(4);
	const S = setup();
	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t, Zo, Zi, S);
		}
	};
}

function draw(ctx, w, h, t, Zo, Zi, S) {
	const st = stateAt(t);
	const beat = st.live ? beatShape(st) : null;
	const spine = makeSpine(st, beat);
	const cam = lens(w, h, t, st);
	const eye = cam.pos;
	const ref = cam.ref;
	const ppu = h / 2 / Math.tan((FOV * PI) / 360) / ref; // px per unit at the swimmer
	const ink = makeInk();
	const o = { w, h, ref, back: 0 };

	// The sphere's beats.
	const sph = smooth(span(t, 9.2, 10.8));
	const loxW = smooth(span(t, 9.8, 12.0));
	const plane = smooth(span(t, 10.2, 11.8));
	const spir = smooth(span(t, 10.6, 12.4));
	const north = smooth(span(t, 11.6, 12.4));
	const ray = smooth(span(t, 11.8, 12.8)) * (1 - smooth(span(t, 15.5, 17.5)));

	// The body's surfaces.
	const mem = tube(cam, spine, membraneSecs(st), 24);
	const tail = st.Lt > 0.02 ? tube(cam, spine, tailSecs(st.Lt), 12) : null;
	const inner = 1 - st.merge;
	const nucOn = smooth(span(t, 0.9, 2.1)) * inner;
	const nuc = nucOn > 0.01 ? tube(cam, spine, nucleusSecs(st), 24) : null;
	const capOn = smooth(span(t, 2.9, 3.3)) * inner;
	const cap = capOn > 0.01 && st.rim > 0.01 ? tube(cam, spine, capSecs(st), 24) : null;

	// Depth: the sphere and the body; the nucleus and cap in their own buffer
	// (they are inside the membrane, seen through it).
	Zo.reset(w, h);
	if (sph > 0) {
		const G = S.grid.map((row) => row.map((p) => cam.project(p)));
		for (let i = 0; i < G.length - 1; i++)
			for (let j = 0; j < G[i].length - 1; j++) {
				Zo.tri(G[i][j], G[i + 1][j], G[i + 1][j + 1]);
				Zo.tri(G[i][j], G[i + 1][j + 1], G[i][j + 1]);
			}
	}
	fillDepth(Zo, mem);
	if (tail) fillDepth(Zo, tail);
	if (nuc) {
		Zi.reset(w, h);
		fillDepth(Zi, nuc);
		if (cap) fillDepth(Zi, cap);
	} else Zi.off();

	// ── The plane under the sphere ──
	const proj = (pts) => pts.map((p) => cam.project(p));
	if (plane > 0) {
		const fade = (rho) => 1 - smooth(span(rho, 2.3 * R, RHO_MAX));
		S.rays.forEach((pts, k) => {
			const Q = proj(pts);
			const up = clamp01(plane * 1.4 - k * 0.03);
			const end = up * (Q.length - 1);
			for (let i = 0; i < Q.length - 1 && i < end; i++)
				emit(ink, Zo, Q[i], Q[i + 1], 0.2 * fade(Math.hypot(pts[i][0], pts[i][2])), 1, o);
		});
		for (const c of S.circ) {
			const a = (c.k === 6 ? 0.3 : 0.2) * fade(c.rho);
			polyQ(ink, Zo, proj(c.pts), a, 1, o, clamp01(plane * 1.5 - c.k * 0.06), true);
		}
	}
	if (spir > 0) {
		const Q = proj(S.spiral);
		const end = spir * (Q.length - 1);
		for (let i = 0; i < Q.length - 1 && i < end; i++) {
			const rho = Math.hypot(S.spiral[i][0], S.spiral[i][2]);
			emit(ink, Zo, Q[i], Q[i + 1], 0.45 * (1 - smooth(span(rho, 2.6 * R, RHO_MAX))), 1.3, o);
		}
	}

	// ── The sphere ──
	if (sph > 0) {
		const og = { ...o, back: 0 };
		S.merid.forEach((pts, k) =>
			polyQ(ink, Zo, proj(pts), 0.26 * sph, 1, og, clamp01(sph * 1.3 - k * 0.025))
		);
		for (const p of S.paral)
			polyQ(
				ink,
				Zo,
				proj(p.pts),
				(p.k === 6 ? 0.36 : 0.24) * sph,
				1,
				og,
				clamp01(sph * 1.4 - p.k * 0.035),
				true
			);
		// Its outline from the lens.
		const c = sub3(eye, CEN);
		const d = Math.hypot(...c) / R;
		if (d > 1.01) {
			const nn = norm(c);
			const e1 = norm(cross(nn, Math.abs(nn[1]) < 0.9 ? UP : [1, 0, 0]));
			const e2 = cross(nn, e1);
			const cc = add3(CEN, mul3(nn, R / d));
			const rr = R * Math.sqrt(1 - 1 / (d * d)) * 1.004;
			const pts = [];
			for (let i = 0; i < 180; i++) {
				const a = (TAU * i) / 180;
				pts.push(add3(cc, add3(mul3(e1, rr * Math.cos(a)), mul3(e2, rr * Math.sin(a)))));
			}
			polyQ(ink, Zo, proj(pts), 0.5 * sph, 1.3, og, 1, true);
		}
	}
	// The loxodrome, written from S to N; once the swim is on, what is behind
	// the swimmer dims and what is ahead of it, into the pole, stays bold.
	if (loxW > 0) {
		const Q = proj(S.loxo);
		const th = PI / 2 + KAP * st.lh;
		const k = Math.max(
			1,
			Math.min(Q.length - 1, Math.round(((th - 0.003) / (PI - 0.006)) * (Q.length - 1)))
		);
		const ol = { ...o, back: 0.12 };
		const end = loxW * (Q.length - 1);
		polyQ(
			ink,
			Zo,
			Q.slice(0, k + 1),
			lerp(0.9, 0.5, smooth(span(t, 12.4, 14))),
			1.7,
			ol,
			Math.min(1, end / k)
		);
		if (end > k) polyQ(ink, Zo, Q.slice(k), 0.9, 1.7, ol, (end - k) / (Q.length - 1 - k));
	}

	// ── The ray from N through the swimmer to its image on the plane ──
	if (ray > 0.01) {
		const q = lox(st.lh);
		const rho = 2 * R * Math.tan(q.th / 2);
		const img = [rho * Math.cos(q.ph), 0, rho * Math.sin(q.ph)];
		const pts = [];
		for (let i = 0; i <= 60; i++) pts.push(lerp3(NORTH, img, i / 60));
		polyQ(ink, Zo, proj(pts), 0.42 * ray, 1, { ...o, back: 0.5 });
		const qi = cam.project(img);
		if (qi[2] > NEAR && rho < RHO_MAX) {
			ctx.save();
			ctx.globalAlpha = 0.7 * ray * (1 - smooth(span(rho, 2.6 * R, RHO_MAX)));
			ctx.fillStyle = PAL.chalk;
			ctx.beginPath();
			ctx.arc(qi[0], qi[1], 2.6, 0, TAU);
			ctx.fill();
			ctx.restore();
		}
	}

	// ── The body ──
	const cellBack = lerp(0.24, 0.05, st.mt);
	const ob = { ...o, back: cellBack };
	const small = ppu < 5;
	// The membrane: its parallels written round, its meridians pole to pole.
	MEM_RINGS.forEach((i, k) => {
		const up = smooth(span(t, 0.15 + k * 0.07, 0.6 + k * 0.07));
		if (small && k % 2) return;
		ring(mem, i, 0.82, 1.15, ob, ink, Zo, up);
	});
	for (let j = 0; j < 24; j += small ? 4 : 2) {
		const up = smooth(span(t, 0.55 + j * 0.02, 1.25 + j * 0.02));
		gen(mem, j, 0.55, 0.95, ob, ink, Zo, up);
	}
	contour(ink, Zo, mem, eye, 0.95 * smooth(span(t, 0.9, 1.7)), 1.7, { ...o, back: 0 });
	// The cap's lip, once it is the membrane's.
	if (st.merge > 0) {
		const f = spine.at(S_RIM);
		const [ca, cb] = capAB(S_RIM - 1e-3);
		const pts = [];
		for (let j = 0; j <= 36; j++) {
			const a = (TAU * j) / 36;
			pts.push(
				add3(
					f.c,
					add3(mul3(f.e1, (ca + 0.05) * Math.cos(a)), mul3(f.e2, (cb + 0.05) * Math.sin(a)))
				)
			);
		}
		polyQ(ink, Zo, proj(pts), 0.95 * st.merge, 1.5, { ...o, back: 0.05 });
	}
	// The midpiece's helix, wound on.
	if (st.helix > 0) {
		const pts = [];
		for (let i = 0; i <= 140; i++) {
			const s = MID0 + 0.1 + (3.8 * i) / 140;
			const a = (TAU * 7 * (s - MID0)) / 3.8;
			const f = spine.at(s);
			pts.push(
				add3(
					f.c,
					add3(mul3(f.e1, (R_MID + 0.03) * Math.cos(a)), mul3(f.e2, (R_MID + 0.03) * Math.sin(a)))
				)
			);
		}
		polyQ(ink, Zo, proj(pts), 0.7, 1, { ...o, back: 0 }, st.helix);
	}
	// The tail: rings added as the tip passes, generatrices to the tip.
	if (tail) {
		const secs = tailSecs(st.Lt);
		secs.forEach((sc, i) => {
			if (sc.i <= 0 || sc.i % (small ? 6 : 3)) return;
			const up = smooth(span(st.Lt - (sc.s - MID1), 0.3, 1.8));
			ring(
				tail,
				i,
				lerp(0.75, 0.32, smooth(span(t, 8.3, 9.6))),
				1,
				{ ...o, back: 0.08 },
				ink,
				Zo,
				up
			);
		});
		for (let j = 0; j < 12; j += small ? 6 : 2)
			gen(tail, j, 0.55, 0.9, { ...o, back: 0.05 }, ink, Zo);
		contour(ink, Zo, tail, eye, 0.9, 1.4, { ...o, back: 0 });
	}
	// The nucleus, inside, condensing; the cap spreading over it.
	if (nuc) {
		const a = nucOn * lerp(0.42, 0.85, st.mc);
		const on = { ...o, back: 0.25 };
		for (let i = 3; i < NNUC; i += 3)
			ring(nuc, i, a, 1, on, ink, Zi, smooth(span(t, 0.9 + i * 0.03, 1.5 + i * 0.03)));
		for (let j = 0; j < 24; j += 2)
			gen(nuc, j, a * 0.75, 0.9, on, ink, Zi, smooth(span(t, 1.2 + j * 0.02, 1.9 + j * 0.02)));
		contour(ink, Zi, nuc, eye, a, 1.4, { ...o, back: 0 });
	}
	if (cap) {
		const a = capOn * 0.9;
		const oc = { ...o, back: 0.2 };
		ring(cap, cap.n - 1, a, 1.5, oc, ink, Zi);
		ring(cap, Math.round((cap.n - 1) * 0.55), a * 0.7, 1, oc, ink, Zi);
		for (let j = 0; j < 24; j += 2) gen(cap, j, a * 0.8, 1, oc, ink, Zi);
	}
	ink.flush(ctx);

	// ── Lit points ──
	if (north > 0) {
		const q = cam.project(NORTH);
		const hid = behind(Zo, q[0], q[1], q[2], 0.02);
		const r = Math.min(6, Math.max(3, (2.2 * ref) / Math.max(1, q[2])));
		lit3(ctx, cam, NORTH, r, north * (hid ? 0.25 : 0.85), 'rgba(255, 222, 150, 0.32)');
	}
	const spark = span(t, 8.3, 8.6) * (1 - smooth(span(t, 8.7, 10)));
	if (spark > 0.01) {
		const f = spine.at(7.6);
		lit3(ctx, cam, f.c, 4.5 * spark + 1.5, spark, 'rgba(255, 222, 150, 0.4)');
	}
}
