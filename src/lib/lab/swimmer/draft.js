// ── log-swimmer · draft — drawn up in three views, lifted off the sheet ─────
// The swimmer is made the way an engineer makes a part: drawn first, on a
// draughtsman's sheet, in third-angle projection — the PLAN (from above, the
// head's broad face and the beat's wave), the FRONT ELEVATION under it (the
// head edge-on, thin; the tail nearly straight), the END ELEVATION to its
// right (from behind the tail: the head's oval with the acrosome's edge, the
// midpiece, and the tail end-on as a widening spiral) — with the folding
// lines between the views, the 45° mitre that carries widths from plan to
// end view, faint projectors from view to view, dash-dot centre lines and
// five dimension lines (overall length, head and midpiece, head width and
// thickness), no figures. Then the sheet FOLDS: the plan and the end view
// hinge back about their folding lines into the glass box they were
// projected onto while the lens swings round out of orthographic into
// perspective (a dolly-zoom from 0.5° to 30°), and the body is LIFTED out of
// the drawings: a section plane runs nose to tail, projectors shoot in from
// all three faces at it, and the surface — silhouette, rings, generatrices,
// the midpiece's helix — is drawn where they meet. The box fades, the beat
// starts (the frozen wave of the drawing begins to travel), the body rolls,
// and it swims off down −x into a golden-angle funnel.
//
// The body, a picture but in proportion: head an elliptic paddle 5 long, 3
// wide, 1.5 thick (broadest two-fifths back, thickest a little behind that),
// the acrosome cap over its front two-thirds (its edge a ring, and drawn more
// densely); a neck waist and a midpiece 1 thick wound with the mitochondrial
// helix (nine turns); the annulus; a flagellum 45 long tapering 0.6 → 0.06.
// The beat is the tail's own: the TANGENT angle is a travelling wave,
// θ(s) = Θ(s) sin(k(s − s₀) − ωt + φ₀) in the head's broad plane with a
// fifth of it, in quadrature, out of that plane (so it is slightly helical
// and the end view is a spiral), Θ growing toward the tip; the centreline is
// that integrated — inextensible — and re-centred on its mass-weighted
// centroid and mean axis, which is what makes the head yaw against the tail.
// The tube is swept round it (elliptic sections, 16 round) and the whole
// body rolls about its axis as it swims.
//
// EXACT: the three views are true orthographic projections of the drawn
// body (its contour generators, zero sets of n·v marched on the surface
// grid; hidden parts of the end view dashed by an orthographic depth
// buffer), the box they fold into is the one they were projected onto, and
// every projector is perpendicular to its face; the end view draws the tail
// as its centreline.
//
// The object, EXACT: golden-angle phyllotaxis on a log scale. Seed n sits
// at angle n·α, α = 2π/φ² (137.508°), and distance ρₙ = R φ^(−n/k) from
// the axis of a cone of half-angle 38° (so axially the seeds are exactly the
// plane pattern zₙ = wⁿ, w = φ^(−1/k) e^(iα), the exponential image of a
// lattice), n = 0 … 233 down to ρ ≈ 0.04. k = ln φ √104 / (2π √(−ε₈ε₁₃)) ≈
// 17.83, ε_m = m/φ² − round(m/φ²), is the k at which the 8- and the
// 13-parastichies cross at right angles in the axial view, so they are the
// nearest-neighbour pair: the eight and the thirteen spirals through the
// seeds are drawn exactly — each the log spiral of the lattice direction
// joining n to n + 8 (or n + 13), lifted onto the cone. The apex — the
// lattice's fixed point, n → ∞ — is the one lit point. The seeds' discs are
// a picture (radius 0.16 ρ, laid tangent to the cone).
//
// Beats (22 s): 0–4.9 the sheet drawn (border, folding lines, plan, the
// projectors down, the front elevation, the mitre across, the end view, the
// dimensions); 4.9–6.9 the sheet folds into the box, the lens swinging into
// perspective; 6.5–8.9 the lift, nose to tail; 8.6–9.8 the box fades;
// 9.3–10.7 the beat and the roll start (the centriole lit at the neck); 9.8
// on it swims, the lens riding behind it and turning its gaze ahead; 9.7–11
// the funnel's rim drawn there, 10.2–14.2 its seeds placed one by one at the
// golden angle, rim to centre; 13.6–16.2 the 8- then the 13-spirals written
// in; 15.6 on the apex lights and the swimmer swims into the centre, the lens
// following it in, its nose seven units short of the apex when it loops.

import {
	PAL,
	TAU,
	PHI,
	GOLDEN_ANGLE,
	span,
	smooth,
	lerp,
	cutAt,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	camera3
} from '../log/board.js';
import { NEAR, spline, spline3, lerp3, makeDepth, lit3 } from '../log/space.js';

export const meta = {
	title: 'draft — drawn in plan and elevation, lifted off the sheet; a golden-angle funnel',
	order: 9,
	seconds: 22,
	three: false
};

// ── The body ─────────────────────────────────────────────────────────────────
const L = 54; // nose to tip
const SB = 5.6; // the bend starts at the neck
const K = TAU / 22; // ~2.2 wavelengths down the flagellum
const OMEGA = TAU * 1.4; // the beat, per second of life
const THMAX = 0.9; // the tangent angle's amplitude at the tip
const CHI = 0.2; // out of the head's plane, in quadrature
const ROLL = TAU * 0.3; // the roll, per second of life
const SPEED = 8; // world units per second
const NP = 16; // round each section
const CAP = 3.25; // the acrosome's edge
const BASE = 5; // the head's base
const NECK = 6.1; // the midpiece's widest
const ANNULUS = 9.2;

// The times.
const TM = {
	fold: [4.9, 6.9],
	sheetOff: [4.9, 5.7],
	lift: [6.5, 8.9],
	away: [8.6, 9.8],
	life: 9.3,
	lifeRamp: 1.4,
	swim: 9.8,
	swimRamp: 2.2,
	seeds: [10.2, 14.2],
	sp8: [13.6, 15.4],
	sp13: [14.4, 16.2],
	apex: [15.6, 18.5]
};

// The funnel: R the rim, half-angle 38°.
const FR = 22;
const TANB = Math.tan((38 * Math.PI) / 180);
const E8 = 8 / (PHI * PHI) - 3;
const E13 = 13 / (PHI * PHI) - 5;
const KPHY = (Math.log(PHI) * Math.sqrt(104)) / (TAU * Math.sqrt(-E8 * E13));
const SEED_R = 0.16; // a seed's radius, of its distance from the axis
const NSEED = Math.ceil((KPHY * Math.log(FR / 0.04)) / Math.log(PHI));

// ∫ of a smoothstep ramp of length D: a clock that starts at rest.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}

// Stations along the body: dense at the nose, at the special rings exactly.
function stationsOf() {
	const S = [0.012];
	for (let j = 1; j <= 8; j++) S.push(2 * (1 - Math.cos((j / 8) * (Math.PI / 2))));
	const run = (a, b, n) => {
		for (let j = 1; j <= n; j++) S.push(a + ((b - a) * j) / n);
	};
	run(2, CAP, 4);
	run(CAP, BASE, 6);
	run(BASE, NECK, 4);
	run(NECK, ANNULUS, 8);
	run(ANNULUS, 9.6, 2);
	run(9.6, L, 37);
	return S;
}

// Half-width (in the head's broad plane) and half-thickness at s.
function profile(s) {
	if (s <= BASE) {
		const u = s / BASE;
		const a =
			u < 0.4
				? 1.5 * Math.sqrt(Math.max(0, 1 - ((0.4 - u) / 0.4) ** 2))
				: 0.55 + 0.95 * Math.cos(((u - 0.4) / 0.6) * (Math.PI / 2)) ** 2;
		const b =
			u < 0.55
				? 0.75 * Math.sqrt(Math.max(0, 1 - ((0.55 - u) / 0.55) ** 2))
				: 0.5 + 0.25 * Math.cos(((u - 0.55) / 0.45) * (Math.PI / 2)) ** 2;
		return [a, b];
	}
	if (s <= 5.5) {
		const k = smooth((s - BASE) / 0.5);
		return [lerp(0.55, 0.42, k), lerp(0.5, 0.42, k)];
	}
	let r;
	if (s <= NECK) r = lerp(0.42, 0.5, smooth((s - 5.5) / (NECK - 5.5)));
	else if (s <= ANNULUS) r = lerp(0.5, 0.46, (s - NECK) / (ANNULUS - NECK));
	else if (s <= 9.6) r = lerp(0.46, 0.3, smooth((s - ANNULUS) / 0.4));
	else if (s <= 52) r = lerp(0.3, 0.13, (s - 9.6) / 42.4);
	else r = lerp(0.13, 0.03, smooth((s - 52) / 2));
	return [r, r];
}

// The tangent (pointing tailward) at s, beat time tau.
function tanRaw(s, tau, ph0) {
	if (s <= SB) return [1, 0, 0];
	const q = (s - SB) / (L - SB);
	const A = THMAX * q * (2 - q);
	const ph = K * (s - SB) - OMEGA * tau + ph0;
	const th = A * Math.sin(ph);
	const ch = CHI * A * Math.cos(ph);
	return [Math.cos(ch) * Math.cos(th), Math.sin(ch), Math.cos(ch) * Math.sin(th)];
}

// Marching squares (log-abelian's table): bits a=1 b=2 c=4 d=8; edges 0 a→b,
// 1 b→c, 2 d→c, 3 a→d.
const MS = {
	1: [[3, 0]],
	2: [[0, 1]],
	3: [[3, 1]],
	4: [[1, 2]],
	6: [[0, 2]],
	7: [[3, 2]],
	8: [[2, 3]],
	9: [[0, 2]],
	11: [[1, 2]],
	12: [[1, 3]],
	13: [[0, 1]],
	14: [[3, 0]]
};

// ── Ink: polylines batched by colour, alpha, width and dash; filled tris ─────
const DASH = { s: [], h: [5, 4], c: [16, 4, 3, 4], b: [2, 5] };
function makePen() {
	const B = new Map();
	const F = new Map();
	return {
		run(color, alpha, width, dash, P) {
			if (alpha < 0.012 || P.length < 4) return;
			const a = Math.min(24, Math.round(alpha * 24));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}|${dash}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 24, width: wq / 4, dash, R: [] };
				B.set(key, b);
			}
			b.R.push(P);
		},
		fill(color, alpha, P) {
			if (alpha < 0.012) return;
			const a = Math.min(24, Math.round(alpha * 24));
			const key = `${color}|${a}`;
			let b = F.get(key);
			if (!b) {
				b = { color, alpha: a / 24, R: [] };
				F.set(key, b);
			}
			b.R.push(P);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(DASH[b.dash]);
				ctx.beginPath();
				for (const P of b.R) {
					ctx.moveTo(P[0], P[1]);
					for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
				}
				ctx.stroke();
			}
			ctx.setLineDash([]);
			for (const b of F.values()) {
				ctx.fillStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.beginPath();
				for (const P of b.R) {
					ctx.moveTo(P[0], P[1]);
					for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
					ctx.closePath();
				}
				ctx.fill();
			}
			ctx.restore();
			B.clear();
			F.clear();
		}
	};
}

// Behind the surface in Z? The deepest of the four cells round the point,
// with an absolute slack (the kit's is relative, too loose for a thin tube).
function hiddenAt(Z, q, slack) {
	const s = Z.s;
	const x0 = Math.floor(q[0] / s - 0.5);
	const y0 = Math.floor(q[1] / s - 0.5);
	if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return false;
	const B = Z.buf;
	const k = y0 * Z.W + x0;
	const m = Math.max(B[k], B[k + 1], B[k + Z.W], B[k + Z.W + 1]);
	return q[2] > m + slack;
}

export async function make() {
	const S = stationsOf();
	const n = S.length;
	const AB = S.map(profile);
	const W = S.map((s, i) => {
		const ds = (S[Math.min(n - 1, i + 1)] - S[Math.max(0, i - 1)]) / 2;
		return (AB[i][0] * AB[i][1] + 0.03) * ds;
	});
	const at = (s) => S.findIndex((x) => Math.abs(x - s) < 1e-6);
	const iCap = at(CAP);
	const iBase = at(BASE);
	const COS = [];
	const SIN = [];
	for (let j = 0; j < NP; j++) {
		COS.push(Math.cos((TAU * j) / NP));
		SIN.push(Math.sin((TAU * j) / NP));
	}

	// The beat's phase at rest: the one that leaves the tail's mean direction
	// along the head's, so the drawing's body lies on its centre line.
	let PH0 = 0;
	{
		let best = Infinity;
		for (let k = 0; k < 180; k++) {
			const ph = (TAU * k) / 180;
			let sz = 0;
			for (let i = 0; i < n; i++) sz += W[i] * tanRaw(S[i], 0, ph)[2];
			if (Math.abs(sz) < best) {
				best = Math.abs(sz);
				PH0 = ph;
			}
		}
	}

	// The centreline and its frames at beat time tau, re-centred on the
	// weighted centroid; `blend` 0 aligns the head with x (the drawing), 1 the
	// mean axis (swimming: the head yaws against the tail).
	function shapeAt(tau, blend) {
		const C = new Array(n);
		const T = new Array(n);
		let x = S[0];
		let y = 0;
		let z = 0;
		C[0] = [x, 0, 0];
		T[0] = tanRaw(S[0], tau, PH0);
		for (let i = 1; i < n; i++) {
			const d = tanRaw((S[i - 1] + S[i]) / 2, tau, PH0);
			const ds = S[i] - S[i - 1];
			x += d[0] * ds;
			y += d[1] * ds;
			z += d[2] * ds;
			C[i] = [x, y, z];
			T[i] = tanRaw(S[i], tau, PH0);
		}
		let G = [0, 0, 0];
		let M = [0, 0, 0];
		let sw = 0;
		for (let i = 0; i < n; i++) {
			G = add3(G, mul3(C[i], W[i]));
			M = add3(M, mul3(T[i], W[i]));
			sw += W[i];
		}
		G = mul3(G, 1 / sw);
		const ax = norm(lerp3([1, 0, 0], norm(M), blend));
		const up = norm(sub3([0, 1, 0], mul3(ax, ax[1])));
		const zz = cross(ax, up);
		const E1 = new Array(n);
		const E2 = new Array(n);
		for (let i = 0; i < n; i++) {
			const d = sub3(C[i], G);
			C[i] = [dot(d, ax), dot(d, up), dot(d, zz)];
			const tt = T[i];
			T[i] = [dot(tt, ax), dot(tt, up), dot(tt, zz)];
			const e2 = norm(sub3([0, 1, 0], mul3(T[i], T[i][1])));
			E2[i] = e2;
			E1[i] = cross(T[i], e2);
		}
		return { C, T, E1, E2 };
	}

	// The surface grid, through the world transform X (roll about x, then
	// shift along x).
	const ID = { dx: 0, cr: 1, sr: 0 };
	const wp = (X, p) => [p[0] + X.dx, p[1] * X.cr - p[2] * X.sr, p[1] * X.sr + p[2] * X.cr];
	function gridOf(sh, X, out) {
		for (let i = 0; i < n; i++) {
			const c = sh.C[i];
			const e1 = sh.E1[i];
			const e2 = sh.E2[i];
			const a = AB[i][0];
			const b = AB[i][1];
			for (let j = 0; j < NP; j++) {
				const u = COS[j] * a;
				const v = SIN[j] * b;
				const x = c[0] + u * e1[0] + v * e2[0];
				const y = c[1] + u * e1[1] + v * e2[1];
				const z = c[2] + u * e1[2] + v * e2[2];
				const k = (i * NP + j) * 3;
				out[k] = x + X.dx;
				out[k + 1] = y * X.cr - z * X.sr;
				out[k + 2] = y * X.sr + z * X.cr;
			}
		}
		return out;
	}
	// A section at any s (body frame), m points round.
	function frameAt(sh, s) {
		let i = 0;
		while (i < n - 2 && S[i + 1] < s) i++;
		const f = Math.max(0, Math.min(1, (s - S[i]) / (S[i + 1] - S[i])));
		const [a, b] = profile(Math.max(S[0], Math.min(L, s)));
		return {
			c: lerp3(sh.C[i], sh.C[i + 1], f),
			e1: norm(lerp3(sh.E1[i], sh.E1[i + 1], f)),
			e2: norm(lerp3(sh.E2[i], sh.E2[i + 1], f)),
			a,
			b
		};
	}
	const onSection = (F, phi) =>
		add3(F.c, add3(mul3(F.e1, F.a * Math.cos(phi)), mul3(F.e2, F.b * Math.sin(phi))));
	function ringOf(sh, s, m, X) {
		const F = frameAt(sh, s);
		const out = [];
		for (let j = 0; j <= m; j++) out.push(wp(X, onSection(F, (TAU * j) / m)));
		return out;
	}

	// The contour generator: g = n · v over the grid (v the view direction,
	// or from the eye), marched; segments [x0,y0,z0, x1,y1,z1, s].
	const g = new Float64Array(n * NP);
	function silG(Gr, i1, eye, v) {
		for (let i = 0; i <= i1; i++) {
			const ip = Math.min(i + 1, n - 1);
			const im = Math.max(i - 1, 0);
			for (let j = 0; j < NP; j++) {
				const jp = (j + 1) % NP;
				const jm = (j + NP - 1) % NP;
				const k = (i * NP + j) * 3;
				const kp = (ip * NP + j) * 3;
				const km = (im * NP + j) * 3;
				const kjp = (i * NP + jp) * 3;
				const kjm = (i * NP + jm) * 3;
				const ax = Gr[kp] - Gr[km];
				const ay = Gr[kp + 1] - Gr[km + 1];
				const az = Gr[kp + 2] - Gr[km + 2];
				const bx = Gr[kjp] - Gr[kjm];
				const by = Gr[kjp + 1] - Gr[kjm + 1];
				const bz = Gr[kjp + 2] - Gr[kjm + 2];
				const nx = ay * bz - az * by;
				const ny = az * bx - ax * bz;
				const nz = ax * by - ay * bx;
				let vx;
				let vy;
				let vz;
				if (eye) {
					vx = Gr[k] - eye[0];
					vy = Gr[k + 1] - eye[1];
					vz = Gr[k + 2] - eye[2];
				} else [vx, vy, vz] = v;
				g[i * NP + j] = nx * vx + ny * vy + nz * vz;
			}
		}
	}
	function contour(Gr, i1, out) {
		out.length = 0;
		for (let i = 0; i < i1; i++)
			for (let j = 0; j < NP; j++) {
				const j1 = (j + 1) % NP;
				const kA = i * NP + j;
				const kB = (i + 1) * NP + j;
				const kC = (i + 1) * NP + j1;
				const kD = i * NP + j1;
				const a = g[kA];
				const b = g[kB];
				const c = g[kC];
				const d = g[kD];
				const id = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (c < 0 ? 4 : 0) | (d < 0 ? 8 : 0);
				if (id === 0 || id === 15) continue;
				let T = MS[id];
				if (!T) {
					const mid = (a + b + c + d) / 4 < 0;
					T =
						id === 5
							? mid
								? [
										[3, 2],
										[0, 1]
									]
								: [
										[3, 0],
										[1, 2]
									]
							: mid
								? [
										[0, 1],
										[2, 3]
									]
								: [
										[3, 0],
										[1, 2]
									];
				}
				const E = (e) => {
					let k0;
					let k1;
					let t;
					let s;
					if (e === 0) {
						k0 = kA;
						k1 = kB;
						t = a / (a - b);
						s = lerp(S[i], S[i + 1], t);
					} else if (e === 1) {
						k0 = kB;
						k1 = kC;
						t = b / (b - c);
						s = S[i + 1];
					} else if (e === 2) {
						k0 = kD;
						k1 = kC;
						t = d / (d - c);
						s = lerp(S[i], S[i + 1], t);
					} else {
						k0 = kA;
						k1 = kD;
						t = a / (a - d);
						s = S[i];
					}
					k0 *= 3;
					k1 *= 3;
					return [
						lerp(Gr[k0], Gr[k1], t),
						lerp(Gr[k0 + 1], Gr[k1 + 1], t),
						lerp(Gr[k0 + 2], Gr[k1 + 2], t),
						s
					];
				};
				for (const [p, q] of T) {
					const P = E(p);
					const Q = E(q);
					if (!Number.isFinite(P[0] + Q[0])) continue;
					out.push([P[0], P[1], P[2], Q[0], Q[1], Q[2], (P[3] + Q[3]) / 2]);
				}
			}
		return out;
	}

	// ── The drawing ──────────────────────────────────────────────────────────
	const frozen = shapeAt(0, 0);
	const G0 = gridOf(frozen, ID, new Float64Array(n * NP * 3));
	let xNose = Infinity;
	let xTail = -Infinity;
	let zExt = 0;
	let yExt = 0;
	for (let k = 0; k < G0.length; k += 3) {
		xNose = Math.min(xNose, G0[k]);
		xTail = Math.max(xTail, G0[k]);
		yExt = Math.max(yExt, Math.abs(G0[k + 1]));
		zExt = Math.max(zExt, Math.abs(G0[k + 2]));
	}
	// The glass box: the front face at z = DF, the top at y = DT, the end
	// face at x = DR; XL its left edge, YB its bottom; the top face runs back
	// DTOP and the end face DEND from their hinges.
	const DF = zExt + 3;
	const DT = yExt + 3.4;
	const XL = xNose - 3.5;
	const DR = xTail + 3;
	const YB = -yExt - 5.2;
	const DTOP = DF + zExt + 4.4;
	const DEND = DF + zExt + 4.4;
	// The sheet: the three panes and the corner, in a border.
	const SH = [XL - 3, YB - 3.2, DR + DEND + 3, DT + DTOP + 3];
	const sheetC = [(SH[0] + SH[2]) / 2, (SH[1] + SH[3]) / 2, DF];
	// The lens's anchor on the box: its centre, a little toward the tail end,
	// which is the nearer as the lens swings round behind.
	const boxA = [(XL + DR) / 2 + 3, (YB + DT) / 2, DF - DTOP / 2];

	// Faces: 0 the sheet (flat, fades), 1 front, 2 top (u = x, v = d), 3 end
	// (u = d, v = y); d = DF − z.
	function faceMap(face, u, v, cb, sb) {
		if (face === 2) return [u, DT + v * sb, DF - v * cb];
		if (face === 3) return [DR + u * sb, v, DF - u * cb];
		return [u, v, DF];
	}

	const items = []; // polylines written on by length
	const sets = []; // segment sets written on by key
	const tris = []; // arrowheads
	const item = (face, pts, t0, t1, a, w, dash = 's') =>
		items.push({ face, pts, t0, t1, a, w, dash });
	const rect = (face, u0, v0, u1, v1, t0, t1, a, w, skip = -1) => {
		const P = [
			[u0, v0],
			[u1, v0],
			[u1, v1],
			[u0, v1],
			[u0, v0]
		];
		for (let e = 0; e < 4; e++)
			if (e !== skip) item(face, [P[e], P[e + 1]], t0 + ((t1 - t0) * e) / 5, t1, a, w);
	};
	const OUT = { a: 0.92, w: 1.7 }; // outlines
	const THIN = { a: 0.55, w: 0.8 }; // dimension and centre lines
	const CON = { a: 0.26, w: 0.7 }; // projectors, construction

	// The border and the panes (their shared edges are the folding lines).
	rect(0, SH[0], SH[1], SH[2], SH[3], 0, 0.7, 0.5, 1.2);
	rect(0, SH[0] + 0.7, SH[1] + 0.7, SH[2] - 0.7, SH[3] - 0.7, 0.1, 0.8, 0.3, 0.7);
	// A title block, empty: bottom right.
	{
		const x0 = DR + 2.5;
		const x1 = SH[2] - 0.7;
		const y0 = SH[1] + 0.7;
		const y1 = YB + 0.4;
		rect(0, x0, y0, x1, y1, 0.3, 0.9, 0.3, 0.7);
		item(
			0,
			[
				[x0, (y0 + y1) / 2],
				[x1, (y0 + y1) / 2]
			],
			0.5,
			0.9,
			0.22,
			0.6
		);
		item(
			0,
			[
				[(x0 + x1) / 2, y0],
				[(x0 + x1) / 2, (y0 + y1) / 2]
			],
			0.6,
			0.9,
			0.22,
			0.6
		);
	}
	rect(1, XL, YB, DR, DT, 0.35, 1.0, 0.42, 0.9);
	rect(2, XL, 0, DR, DTOP, 0.4, 1.0, 0.42, 0.9, 0);
	rect(3, 0, YB, DEND, DT, 0.45, 1.0, 0.42, 0.9, 3);
	// The mitre.
	item(
		0,
		[
			[DR, DT],
			[DR + Math.min(DTOP, DEND), DT + Math.min(DTOP, DEND)]
		],
		0.6,
		1.0,
		0.32,
		0.7
	);

	// Centre lines.
	item(
		2,
		[
			[xNose - 2, DF],
			[xTail + 2, DF]
		],
		0.7,
		1.1,
		THIN.a,
		THIN.w,
		'c'
	);
	item(
		1,
		[
			[xNose - 2, 0],
			[xTail + 2, 0]
		],
		2.1,
		2.45,
		THIN.a,
		THIN.w,
		'c'
	);
	item(
		3,
		[
			[DF - zExt - 1.2, 0],
			[DF + zExt + 1.2, 0]
		],
		3.3,
		3.6,
		THIN.a,
		THIN.w,
		'c'
	);
	item(
		3,
		[
			[DF, -yExt - 1.4],
			[DF, yExt + 1.4]
		],
		3.35,
		3.65,
		THIN.a,
		THIN.w,
		'c'
	);

	// The plan and the front elevation: contour generators of the drawn body.
	const tmp = [];
	const viewSet = (face, v, map, t0, t1) => {
		silG(G0, n - 1, null, v);
		const segs = contour(G0, n - 1, tmp).map((q) => {
			const A = map(q[0], q[1], q[2]);
			const B = map(q[3], q[4], q[5]);
			return [A[0], A[1], B[0], B[1], q[6] / L, 0];
		});
		sets.push({ face, segs, t0, t1, ...OUT });
	};
	viewSet(2, [0, -1, 0], (x, y, z) => [x, DF - z], 0.9, 2.1);
	viewSet(1, [0, 0, -1], (x, y) => [x, y], 2.3, 3.3);
	// The rings across them: the acrosome's edge, the head's base, the annulus.
	for (const [k, s] of [
		[0, CAP],
		[1, BASE],
		[2, ANNULUS]
	]) {
		const R = ringOf(frozen, s, 48, ID);
		item(
			2,
			R.map((p) => [p[0], DF - p[2]]),
			2.0 + 0.1 * k,
			2.25 + 0.1 * k,
			0.75,
			1.1
		);
		item(
			1,
			R.map((p) => [p[0], p[1]]),
			3.15 + 0.08 * k,
			3.35 + 0.08 * k,
			0.75,
			1.1
		);
	}

	// Projectors from the plan down to the front: nose, broadest, base,
	// annulus, tip — and, on the tail, its crests.
	{
		const stations = [S[0], 2, BASE, ANNULUS, L];
		stations.forEach((s, k) => {
			const F = frameAt(frozen, s);
			const x = F.c[0];
			const zl = F.c[2] + F.a; // the plan's lower edge (nearest the front)
			const yt = F.c[1] + F.b;
			const t0 = 1.9 + 0.07 * k;
			item(
				2,
				[
					[x, DF - zl],
					[x, 0]
				],
				t0,
				t0 + 0.25,
				CON.a,
				CON.w
			);
			item(
				1,
				[
					[x, DT],
					[x, yt]
				],
				t0 + 0.2,
				t0 + 0.45,
				CON.a,
				CON.w
			);
		});
	}
	// Projectors from the plan round the mitre to the end view, and across
	// from the front: the head's widest and thickest.
	{
		const F = frameAt(frozen, 2);
		for (const sg of [-1, 1]) {
			const z = F.c[2] + sg * F.a;
			const d = DF - z;
			item(
				2,
				[
					[F.c[0], d],
					[DR, d]
				],
				3.0,
				3.25,
				CON.a,
				CON.w
			);
			item(
				0,
				[
					[DR, DT + d],
					[DR + d, DT + d],
					[DR + d, DT]
				],
				3.15,
				3.4,
				CON.a,
				CON.w
			);
			item(
				3,
				[
					[d, DT],
					[d, 0]
				],
				3.3,
				3.5,
				CON.a,
				CON.w
			);
		}
		const Fb = frameAt(frozen, 2.75);
		for (const sg of [-1, 1]) {
			const y = Fb.c[1] + sg * Fb.b;
			item(
				1,
				[
					[Fb.c[0], y],
					[DR, y]
				],
				3.05,
				3.3,
				CON.a,
				CON.w
			);
			item(
				3,
				[
					[0, y],
					[DF, y]
				],
				3.25,
				3.45,
				CON.a,
				CON.w
			);
		}
	}

	// The end elevation, from behind the tail: an orthographic depth buffer
	// (depth −x) for what is hidden.
	const endHidden = (() => {
		const res = 0.03;
		const z0 = -zExt - 1;
		const y0 = -yExt - 1;
		const Wd = Math.ceil((2 * zExt + 2) / res) + 2;
		const Hd = Math.ceil((2 * yExt + 2) / res) + 2;
		const buf = new Float32Array(Wd * Hd).fill(Infinity);
		const P = (k) => [(G0[k + 2] - z0) / res, (G0[k + 1] - y0) / res, -G0[k]];
		const tri = (A, B, C) => {
			const area = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
			if (Math.abs(area) < 1e-9) return;
			const xa = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0])));
			const xb = Math.min(Wd - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
			const ya = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1])));
			const yb = Math.min(Hd - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
			for (let y = ya; y <= yb; y++)
				for (let x = xa; x <= xb; x++) {
					const px = x + 0.5;
					const py = y + 0.5;
					const w0 = ((B[0] - px) * (C[1] - py) - (B[1] - py) * (C[0] - px)) / area;
					const w1 = ((C[0] - px) * (A[1] - py) - (C[1] - py) * (A[0] - px)) / area;
					const w2 = 1 - w0 - w1;
					if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
					const z = w0 * A[2] + w1 * B[2] + w2 * C[2];
					const k = y * Wd + x;
					if (z < buf[k]) buf[k] = z;
				}
		};
		for (let i = 0; i < n - 1; i++)
			for (let j = 0; j < NP; j++) {
				const j1 = (j + 1) % NP;
				const a = P((i * NP + j) * 3);
				const b = P(((i + 1) * NP + j) * 3);
				const c = P(((i + 1) * NP + j1) * 3);
				const d = P((i * NP + j1) * 3);
				tri(a, b, c);
				tri(a, c, d);
			}
		return (p, slack = 0.05) => {
			const x = Math.floor((p[2] - z0) / res - 0.5);
			const y = Math.floor((p[1] - y0) / res - 0.5);
			if (x < 0 || y < 0 || x + 1 >= Wd || y + 1 >= Hd) return false;
			const k = y * Wd + x;
			const m = Math.max(buf[k], buf[k + 1], buf[k + Wd], buf[k + Wd + 1]);
			return -p[0] > m + slack;
		};
	})();
	const endMap = (p) => [DF - p[2], p[1]];
	// A 3D polyline into the end view, split where it goes behind.
	const endPoly = (pts, t0, t1, slack, o = OUT) => {
		let run = [];
		let back = null;
		const flush = () => {
			if (run.length > 1)
				item(3, run, t0, t1, back ? 0.45 : o.a, back ? 0.9 : o.w, back ? 'h' : 's');
			run = [];
		};
		for (const p of pts) {
			const b = endHidden(p, slack);
			const q = endMap(p);
			if (back !== null && b !== back) {
				run.push(q);
				flush();
			}
			back = b;
			run.push(q);
		}
		flush();
	};
	{
		// The head's outline: its contour generator seen from +x.
		silG(G0, iBase, null, [-1, 0, 0]);
		const segs = contour(G0, iBase, tmp).map((q) => {
			const A = [q[0], q[1], q[2]];
			const B = [q[3], q[4], q[5]];
			const mid = lerp3(A, B, 0.5);
			const back = endHidden(mid, 0.05);
			const a2 = endMap(A);
			const b2 = endMap(B);
			const ang = (Math.atan2(mid[1], mid[2]) / TAU + 1.25) % 1;
			return [a2[0], a2[1], b2[0], b2[1], ang, back ? 1 : 0];
		});
		sets.push({ face: 3, segs, t0: 3.45, t1: 3.95, ...OUT });
		endPoly(ringOf(frozen, CAP, 72, ID), 3.75, 4.0, 0.05, { a: 0.75, w: 1.1 });
		endPoly(ringOf(frozen, NECK, 48, ID), 3.8, 4.05, 0.05, { a: 0.75, w: 1.1 });
		const tail = [];
		for (let i = at(9.6); i < n; i++) tail.push(frozen.C[i]);
		endPoly(tail, 3.85, 4.35, 0.36, { a: 0.8, w: 1.2 });
	}

	// Dimensions: extension lines, the line, arrowheads; no figures.
	const arrow = (face, tip, dir, t) => {
		const [dx, dy] = dir;
		const l = 1.0;
		const hw = 0.22;
		tris.push({
			face,
			t,
			P: [
				tip,
				[tip[0] - dx * l - dy * hw, tip[1] - dy * l + dx * hw],
				[tip[0] - dx * l + dy * hw, tip[1] - dy * l - dx * hw]
			]
		});
	};
	// Horizontal (in face coords): from x0 to x1 at level v, extension lines
	// from v0s and v1s.
	const hdim = (face, x0, x1, v, v0s, v1s, t0) => {
		const over = Math.sign(v - v0s) * 0.7;
		item(
			face,
			[
				[x0, v0s],
				[x0, v + over]
			],
			t0,
			t0 + 0.25,
			THIN.a,
			THIN.w
		);
		item(
			face,
			[
				[x1, v1s],
				[x1, v + over]
			],
			t0,
			t0 + 0.25,
			THIN.a,
			THIN.w
		);
		item(
			face,
			[
				[x0, v],
				[x1, v]
			],
			t0 + 0.2,
			t0 + 0.5,
			THIN.a,
			THIN.w
		);
		const sg = Math.sign(x1 - x0);
		arrow(face, [x0, v], [-sg, 0], t0 + 0.45);
		arrow(face, [x1, v], [sg, 0], t0 + 0.45);
	};
	const vdim = (face, y0, y1, u, u0s, u1s, t0) => {
		const over = Math.sign(u - u0s) * 0.7;
		item(
			face,
			[
				[u0s, y0],
				[u + over, y0]
			],
			t0,
			t0 + 0.25,
			THIN.a,
			THIN.w
		);
		item(
			face,
			[
				[u1s, y1],
				[u + over, y1]
			],
			t0,
			t0 + 0.25,
			THIN.a,
			THIN.w
		);
		item(
			face,
			[
				[u, y0],
				[u, y1]
			],
			t0 + 0.2,
			t0 + 0.5,
			THIN.a,
			THIN.w
		);
		const sg = Math.sign(y1 - y0);
		arrow(face, [u, y0], [0, -sg], t0 + 0.45);
		arrow(face, [u, y1], [0, sg], t0 + 0.45);
	};
	{
		// Overall length, under the front elevation.
		const tip = frozen.C[n - 1];
		hdim(1, xNose, tip[0], -yExt - 2.6, -0.5, tip[1] - 0.5, 3.95);
		// Head and midpiece, chained, over the plan.
		const fb = frameAt(frozen, BASE);
		const fm = frameAt(frozen, ANNULUS);
		const lev = DF + zExt + 2;
		hdim(2, xNose, fb.c[0], lev, DF + 0.5, DF + fb.a + 0.4, 4.05);
		item(
			2,
			[
				[fm.c[0], DF + fm.a + 0.4],
				[fm.c[0], lev + 0.7]
			],
			4.15,
			4.4,
			THIN.a,
			THIN.w
		);
		item(
			2,
			[
				[fb.c[0], lev],
				[fm.c[0], lev]
			],
			4.3,
			4.6,
			THIN.a,
			THIN.w
		);
		arrow(2, [fb.c[0], lev], [-1, 0], 4.55);
		arrow(2, [fm.c[0], lev], [1, 0], 4.55);
		// Head width and thickness, at the end view.
		const fw = frameAt(frozen, 2);
		hdim(3, DF - fw.a, DF + fw.a, -yExt - 2.2, -0.4, -0.4, 4.2);
		const ft = frameAt(frozen, 2.75);
		vdim(3, -ft.b, ft.b, DF + zExt + 2, DF + 0.4, DF + 0.4, 4.35);
	}

	// ── The lift: projectors at stations down the body ───────────────────────
	const LIFT = [];
	for (let k = 0; k < 24; k++) {
		const s = lerp(0.6, L - 0.5, (k / 23) ** 1.15);
		const R = ringOf(frozen, s, 48, ID);
		let zM = R[0];
		let zm = R[0];
		let yM = R[0];
		let ym = R[0];
		for (const p of R) {
			if (p[2] > zM[2]) zM = p;
			if (p[2] < zm[2]) zm = p;
			if (p[1] > yM[1]) yM = p;
			if (p[1] < ym[1]) ym = p;
		}
		LIFT.push({ s, zM, zm, yM, ym });
	}

	// ── The funnel ───────────────────────────────────────────────────────────
	const XA = xNose - SPEED * eased(22 - TM.swim, TM.swimRamp) - 7; // the apex
	const seedRho = (v) => FR * Math.pow(PHI, -v / KPHY);
	const onCone = (rho, th) => [XA + rho / TANB, rho * Math.cos(th), rho * Math.sin(th)];
	const SEEDS = [];
	for (let i = 0; i < NSEED; i++) {
		const rho = seedRho(i);
		const th = i * GOLDEN_ANGLE;
		const c = onCone(rho, th);
		const t1 = [0, -Math.sin(th), Math.cos(th)];
		const t2 = norm([1 / TANB, Math.cos(th), Math.sin(th)]);
		SEEDS.push({ c, t1, t2, r: SEED_R * rho });
	}
	// The parastichies: through seed j, j + m, j + 2m, … — the log spiral of
	// that lattice direction, sampled `per` points to a step of m seeds.
	const spiral = (m, eps, j, per) => {
		const pts = [];
		const N = Math.ceil(NSEED / m) * per;
		for (let q = 0; q <= N; q++) {
			const v = (q * m) / per; // seed index along the curve, from the rim
			const th = j * GOLDEN_ANGLE + (v - j) * ((TAU * eps) / m);
			pts.push(onCone(seedRho(v), th));
		}
		return pts;
	};
	const SP8 = [];
	const SP13 = [];
	for (let j = 0; j < 8; j++) SP8.push(spiral(8, E8, j, 6));
	for (let j = 0; j < 13; j++) SP13.push(spiral(13, E13, j, 4));
	const RIM = [];
	for (let i = 0; i <= 96; i++) RIM.push(onCone(FR, (TAU * i) / 96));
	const APEX = [XA, 0, 0];
	const XR = XA + FR / TANB; // the mouth's plane

	// ── The lens ─────────────────────────────────────────────────────────────
	function lensAt(t, w, h) {
		const asp = w / h;
		const H0 = Math.max((SH[3] - SH[1]) / 2, (SH[2] - SH[0]) / 2 / asp) * 1.05;
		const az = spline(t, [
			[4.9, 0],
			[7.2, 0.5],
			[8.9, 0.7],
			[10.6, 0.9],
			[13, 1.0],
			[17, 1.12],
			[22, 1.3]
		]);
		const el = spline(t, [
			[4.9, 0],
			[7.2, 0.42],
			[8.9, 0.4],
			[10.6, 0.34],
			[13, 0.3],
			[22, 0.36]
		]);
		const lf =
			Math.log(0.5) +
			(Math.log(30) - Math.log(0.5)) * smooth(span(t, 4.9, 7.4)) +
			(Math.log(34) - Math.log(30)) * smooth(span(t, 7.4, 14));
		const fov = Math.exp(lf);
		// The box held whole through the lift; close on the swimmer as it
		// comes to life and swims; a breath back as the spirals are written;
		// then in after it.
		const half = spline(t, [
			[4.9, H0],
			[7.2, 22],
			[8.9, 21],
			[10.6, 17],
			[12.5, 12],
			[14.5, 14],
			[17, 12],
			[22, 8.5]
		]);
		const xPos = -SPEED * eased(t - TM.swim, TM.swimRamp);
		// The lens rides at the anchor (the sheet, the box, the swimmer) and
		// turns its gaze ahead to the funnel: the mouth while it is sown, then
		// the apex.
		const anchor = add3(
			spline3(t, [
				[4.9, sheetC],
				[7.2, boxA],
				[8.9, lerp3(boxA, [0, 0, 0], 0.3)],
				[10.6, [0, 0, 0]]
			]),
			[xPos, 0, 0]
		);
		const lead = 0.55 * smooth(span(t, 9, 12)) + 0.1 * smooth(span(t, 16, 22));
		const focus = lerp(XR, XA, smooth(span(t, 14.5, 22)));
		const dist = half / Math.tan((fov * Math.PI) / 360);
		const ce = Math.cos(el);
		const pos = add3(anchor, mul3([Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce], dist));
		const target = lerp3(anchor, [focus, 0, 0], lead);
		const cam = camera3({ pos, target, up: [0, 1, 0], fov, w, h });
		return { cam, fov, dist, xPos };
	}

	const Z = makeDepth(4);
	const GR = new Float64Array(n * NP * 3);
	const QR = new Float64Array(n * NP * 3);
	const sil = [];

	function render(ctx, w, h, t) {
		const { cam, fov } = lensAt(t, w, h);
		const pen = makePen();
		const kpx = h / 2 / Math.tan((fov * Math.PI) / 360);
		const slackAt = (z) => 0.1 + (2.2 * Z.s * z) / kpx;
		const beta = (Math.PI / 2) * (1 - smooth(span(t, ...TM.fold)));
		const cb = Math.cos(beta);
		const sb = Math.sin(beta);
		const sheetA = 1 - smooth(span(t, ...TM.sheetOff));
		const faceA = 1 - smooth(span(t, ...TM.away));
		const FA = [sheetA, faceA, faceA, faceA];

		// The swimmer's state.
		const tau = eased(t - TM.life, TM.lifeRamp);
		const sh = tau > 0 ? shapeAt(tau, smooth(span(t, TM.life, TM.life + TM.lifeRamp))) : frozen;
		const X = {
			dx: -SPEED * eased(t - TM.swim, TM.swimRamp),
			cr: Math.cos(ROLL * tau),
			sr: Math.sin(ROLL * tau)
		};
		// The scan: slow over the head and the midpiece, quicker down the tail.
		const formed =
			t < TM.lift[0]
				? 0
				: Math.min(
						L + 1,
						spline(t, [
							[TM.lift[0], 0],
							[(TM.lift[0] + TM.lift[1]) / 2, 10],
							[TM.lift[1], L + 1]
						])
					);
		let iF = -1; // the last formed station
		while (iF < n - 1 && S[iF + 1] <= formed) iF++;
		const ref = Math.hypot(...sub3(cam.pos, [X.dx, 0, 0]));
		const wOf = (z) => Math.min(2.0, Math.max(0.6, ref / z));

		// The depth buffer of what is formed.
		Z.reset(w, h);
		if (iF >= 1) {
			gridOf(sh, X, GR);
			for (let k = 0; k < (iF + 1) * NP * 3; k += 3) {
				const q = cam.project([GR[k], GR[k + 1], GR[k + 2]]);
				QR[k] = q[0];
				QR[k + 1] = q[1];
				QR[k + 2] = q[2];
			}
			const Q = (k) => [QR[k * 3], QR[k * 3 + 1], QR[k * 3 + 2]];
			for (let i = 0; i < iF; i++)
				for (let j = 0; j < NP; j++) {
					const j1 = (j + 1) % NP;
					const a = Q(i * NP + j);
					const b = Q((i + 1) * NP + j);
					const c = Q((i + 1) * NP + j1);
					const d = Q(i * NP + j1);
					Z.tri(a, b, c);
					Z.tri(a, c, d);
				}
		} else Z.off();

		// A 3D polyline, split where it goes behind the body.
		const poly = (pts, o) => {
			const { a, w: wd, hid = 0, dash = 's', depth = true, scale = true } = o;
			let run = null;
			let back = false;
			let z0 = 0;
			const emit = () => {
				if (run && run.length >= 4) {
					const ws = scale ? wOf(z0) : 1;
					if (!back) pen.run(o.color ?? PAL.chalk, a, wd * ws, dash, run);
					else if (hid > 0) pen.run(o.color ?? PAL.chalk, a * hid, wd * ws * 0.7, 'b', run);
				}
				run = null;
			};
			for (const p of pts) {
				const q = cam.project(p);
				if (q[2] <= NEAR || !Number.isFinite(q[0] + q[1])) {
					emit();
					continue;
				}
				const bk = depth && Z.on ? hiddenAt(Z, q, slackAt(q[2])) : false;
				if (!run) {
					run = [q[0], q[1]];
					back = bk;
					z0 = q[2];
				} else if (bk !== back) {
					run.push(q[0], q[1]);
					emit();
					run = [q[0], q[1]];
					back = bk;
					z0 = q[2];
				} else run.push(q[0], q[1]);
			}
			emit();
		};

		// ── The funnel ──
		if (t > TM.seeds[0] - 0.5) drawFunnel(pen, cam, t, poly, kpx, w, h);

		// ── The sheet and its faces ──
		if (faceA > 0.01) {
			for (const it of items) {
				const A = FA[it.face];
				if (A <= 0.01) continue;
				const p = span(t, it.t0, it.t1);
				if (p <= 0) continue;
				const pts = p < 1 ? cutAt(it.pts, p) : it.pts;
				const flat = [];
				let ok = true;
				for (const [u, v] of pts) {
					const q = cam.project(faceMap(it.face, u, v, cb, sb));
					if (q[2] <= NEAR) {
						ok = false;
						break;
					}
					flat.push(q[0], q[1]);
				}
				if (ok) pen.run(PAL.chalk, it.a * A, it.w, it.dash, flat);
			}
			for (const st of sets) {
				const A = FA[st.face];
				const p = span(t, st.t0, st.t1);
				if (p <= 0 || A <= 0.01) continue;
				for (const sg of st.segs) {
					if (sg[4] > p) continue;
					const q0 = cam.project(faceMap(st.face, sg[0], sg[1], cb, sb));
					const q1 = cam.project(faceMap(st.face, sg[2], sg[3], cb, sb));
					if (q0[2] <= NEAR || q1[2] <= NEAR) continue;
					if (sg[5]) pen.run(PAL.chalk, 0.45 * A, 0.9, 'h', [q0[0], q0[1], q1[0], q1[1]]);
					else pen.run(PAL.chalk, st.a * A, st.w, 's', [q0[0], q0[1], q1[0], q1[1]]);
				}
			}
			for (const tr of tris) {
				const A = FA[tr.face];
				const a = smooth(span(t, tr.t, tr.t + 0.15)) * A;
				if (a <= 0.01) continue;
				const flat = [];
				for (const [u, v] of tr.P) {
					const q = cam.project(faceMap(tr.face, u, v, cb, sb));
					flat.push(q[0], q[1]);
				}
				pen.fill(PAL.chalk, THIN.a * a * 1.3, flat);
			}
		}

		// ── The lift: projectors from the three faces to the section ──
		// Down from the plan and back from the front elevation at stations
		// just ahead of the scan; the section at the scan, its true shape on
		// the end face (projected along the body) and carried in from there.
		if (formed > 0 && formed < L + 1 && faceA > 0.01) {
			for (const P of LIFT) {
				const ahead = P.s - formed; // > 0: not reached yet
				const grow = smooth(span(-ahead, -6, 0));
				const fade = 1 - smooth(span(-ahead, 0, 5));
				const a = 0.55 * grow * fade * faceA;
				if (a <= 0.01) continue;
				const shoot = (F, B) => poly([F, lerp3(F, B, grow)], { a, w: 0.8, scale: false });
				shoot(faceMap(2, P.zM[0], DF - P.zM[2], cb, sb), P.zM);
				shoot(faceMap(2, P.zm[0], DF - P.zm[2], cb, sb), P.zm);
				shoot(faceMap(1, P.yM[0], P.yM[1], cb, sb), P.yM);
				shoot(faceMap(1, P.ym[0], P.ym[1], cb, sb), P.ym);
			}
			if (formed < L) {
				const R = ringOf(sh, formed, 48, X);
				poly(R, { a: 0.95, w: 1.6 });
				const a = 0.75 * faceA;
				poly(
					R.map((p) => faceMap(3, DF - p[2], p[1], cb, sb)),
					{ a, w: 1.1, depth: false, scale: false }
				);
				let zM = R[0];
				let zm = R[0];
				let yM = R[0];
				let ym = R[0];
				for (const p of R) {
					if (p[2] > zM[2]) zM = p;
					if (p[2] < zm[2]) zm = p;
					if (p[1] > yM[1]) yM = p;
					if (p[1] < ym[1]) ym = p;
				}
				for (const B of [zM, zm, yM, ym])
					poly([faceMap(3, DF - B[2], B[1], cb, sb), B], { a: 0.32 * faceA, w: 0.8, scale: false });
				for (const B of [zM, zm])
					poly([faceMap(2, B[0], DF - B[2], cb, sb), B], { a: 0.6 * faceA, w: 0.9, scale: false });
				for (const B of [yM, ym])
					poly([faceMap(1, B[0], B[1], cb, sb), B], { a: 0.6 * faceA, w: 0.9, scale: false });
			}
		}

		// ── The body ──
		if (iF >= 1) drawBody(cam, sh, X, iF, formed, poly);

		pen.flush(ctx);

		// The lit points: the apex, and at life the neck (the centriole).
		const ap = smooth(span(t, ...TM.apex));
		if (ap > 0.01) {
			const q = cam.project(APEX);
			if (q[2] > NEAR && !(Z.on && hiddenAt(Z, q, slackAt(q[2]))))
				lit3(ctx, cam, APEX, 2.2 + 2.2 * ap, 0.75 * ap, 'rgba(255, 222, 150, 0.22)');
		}
		const lifeA = smooth(span(t, TM.life - 0.2, TM.life + 0.3));
		if (lifeA > 0.01) {
			const F = frameAt(sh, 5.4);
			const P = wp(X, F.c);
			const q = cam.project(P);
			const flash = 1 - smooth(span(t, TM.life + 0.3, TM.life + 1.8));
			if (q[2] > NEAR && !hiddenAt(Z, q, slackAt(q[2]) + 0.3))
				lit3(
					ctx,
					cam,
					P,
					1.6 + 1.6 * flash,
					lifeA * (0.45 + 0.55 * flash),
					'rgba(255, 222, 150, 0.18)'
				);
		}
	}

	// The body in lines: the contour generator bold; rings and generatrices
	// (denser over the acrosome) thin; the midpiece's helix; hidden lines of
	// the head faint and dashed, of the tail gone.
	function drawBody(cam, sh, X, iF, formed, poly) {
		const segs = sil;
		silG(GR, iF, cam.pos, null);
		contour(GR, iF, segs);
		for (const q of segs) {
			if (q[6] > formed) continue;
			poly(
				[
					[q[0], q[1], q[2]],
					[q[3], q[4], q[5]]
				],
				{ a: 0.95, w: 1.75, hid: q[6] < 9.6 ? 0.35 : 0 }
			);
		}
		// Generatrices.
		const P = (i, j) => {
			const k = (i * NP + j) * 3;
			return [GR[k], GR[k + 1], GR[k + 2]];
		};
		for (let j = 0; j < NP; j++) {
			const head = [];
			const tail = [];
			for (let i = 0; i <= iF; i++) {
				const s = S[i];
				if (s <= CAP + 1e-6) head.push(P(i, j));
				else if (s <= 9.6 + 1e-6) {
					if (j % 2 === 0) head.push(P(i, j));
				} else if (j % 4 === 0) {
					if (!tail.length && i > 0) tail.push(P(i - 1, j));
					tail.push(P(i, j));
				}
			}
			if (j % 2 === 1) {
				// over the cap only
				const cap = [];
				for (let i = 0; i <= Math.min(iF, iCap); i++) cap.push(P(i, j));
				poly(cap, { a: 0.42, w: 0.85, hid: 0.3 });
			} else {
				poly(head, { a: 0.48, w: 0.9, hid: 0.3 });
				poly(tail, { a: 0.42, w: 0.85 });
			}
		}
		// Rings.
		const RINGS = [0.6, 1.2, 2, 2.7, CAP, 4.2, BASE, 5.5, ANNULUS];
		for (const s of RINGS) {
			if (s > formed) continue;
			const bold = s === CAP || s === ANNULUS;
			poly(ringOf(sh, s, 40, X), {
				a: bold ? 0.85 : 0.5,
				w: bold ? 1.35 : 0.9,
				hid: bold ? 0.42 : 0.3
			});
		}
		for (let s = 12; s < L - 1; s += 3) {
			if (s > formed) continue;
			poly(ringOf(sh, s, 16, X), { a: 0.45, w: 0.85 });
		}
		// The mitochondrial helix round the midpiece: nine turns.
		if (formed > NECK) {
			const pts = [];
			const s1 = Math.min(ANNULUS, formed);
			for (let k = 0; k <= 160; k++) {
				const s = lerp(NECK, ANNULUS, k / 160);
				if (s > s1) break;
				const F = frameAt(sh, s);
				const phi = TAU * 9 * ((s - NECK) / (ANNULUS - NECK));
				pts.push(wp(X, onSection(F, phi)));
			}
			poly(pts, { a: 0.6, w: 0.95 });
		}
	}

	// The funnel: the rim, the seeds one by one at the golden angle from the
	// rim in, then the 8- and the 13-spirals written down to the centre. What
	// passes close to the lens (big on the screen) is let go faint, so the
	// pattern reads where it is whole, ahead.
	const nearFade = (px, a, b) => 1 - 0.8 * smooth(span(px, a, b));
	function drawFunnel(pen, cam, t, poly, kpx, w, h) {
		const rimA = smooth(span(t, TM.seeds[0] - 0.5, TM.seeds[0] + 0.8));
		poly(cutAt3(RIM, rimA), { a: 0.5, w: 1.0 });
		const dt = (TM.seeds[1] - TM.seeds[0]) / NSEED;
		for (let i = 0; i < NSEED; i++) {
			const ti = TM.seeds[0] + i * dt;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const sd = SEEDS[i];
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			const q = cam.project(sd.c);
			if (q[2] <= NEAR) continue;
			const r = sd.r * pop;
			const q1 = cam.project(add3(sd.c, mul3(sd.t1, r)));
			const q2 = cam.project(add3(sd.c, mul3(sd.t2, r)));
			const ux = q1[0] - q[0];
			const uy = q1[1] - q[1];
			const vx = q2[0] - q[0];
			const vy = q2[1] - q[1];
			const big = Math.max(Math.hypot(ux, uy), Math.hypot(vx, vy));
			if (big < 0.5) continue;
			if (q[0] + big < 0 || q[0] - big > w || q[1] + big < 0 || q[1] - big > h) continue;
			const m = Math.max(5, Math.min(40, Math.round(4 + big / 2)));
			const fa = nearFade(big, 28, 90);
			const al = 0.85 * a * fa;
			const wd = Math.min(1.4, 0.5 + big * 0.12);
			// Round the disc, cut where the swimmer is in front of it (the
			// disc is small beside its distance: its centre's depth will do).
			const sl = 0.3 + r * 0.5;
			let P = [];
			for (let k = 0; k <= m; k++) {
				const c = Math.cos((TAU * k) / m);
				const s = Math.sin((TAU * k) / m);
				const x = q[0] + c * ux + s * vx;
				const y = q[1] + c * uy + s * vy;
				if (Z.on && hiddenAt(Z, [x, y, q[2]], sl)) {
					if (P.length >= 4) pen.run(PAL.chalk, al, wd, 's', P);
					P = [];
				} else P.push(x, y);
			}
			if (P.length >= 4) pen.run(PAL.chalk, al, wd, 's', P);
		}
		const fam = (SP, per, p, o) => {
			for (const sp of SP) {
				const pts = cutAt3(sp, p);
				for (let c = 0; c < pts.length - 1; c += per) {
					const chunk = pts.slice(c, c + per + 1);
					const P0 = chunk[0];
					const q = cam.project(P0);
					if (q[2] <= NEAR) continue;
					const rpx = (SEED_R * Math.hypot(P0[1], P0[2]) * kpx) / q[2];
					poly(chunk, { ...o, a: o.a * nearFade(rpx, 22, 70) });
				}
			}
		};
		const p8 = smooth(span(t, ...TM.sp8));
		const p13 = smooth(span(t, ...TM.sp13));
		if (p8 > 0) fam(SP8, 6, p8, { a: 0.7, w: 1.05 });
		if (p13 > 0) fam(SP13, 4, p13, { a: 0.55, w: 0.95 });
	}
	// The first fraction of a 3D polyline, by index (curves are sampled evenly
	// in the seed count, so this writes them on from the rim at a steady pace
	// of seeds).
	function cutAt3(pts, f) {
		if (f >= 1) return pts;
		const x = f * (pts.length - 1);
		const i = Math.floor(x);
		const out = pts.slice(0, i + 1);
		if (i < pts.length - 1) out.push(lerp3(pts[i], pts[i + 1], x - i));
		return out;
	}

	return { render };
}
