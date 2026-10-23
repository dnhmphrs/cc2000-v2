// ── log-swimmer · lathe ──────────────────────────────────────────────────────
// The swimmer TURNED, as on a lathe, and set swimming along the equiangular
// spiral into its pole.
//
// The generation, beat by beat (u = progress, 22 s):
//   0.00–0.03  the lathe's axis, dashed, and the half-plane the profile is
//              drawn in, a faint frame hinged on it.
//   0.03–0.11  the PROFILE, one chalk curve written in that half-plane: half
//              the body's outline — the round nose, the head's swell, the
//              small step where the acrosome cap ends (two-thirds back), the
//              head narrowing into the neck, the midpiece, its shoulder.
//   0.11–0.26  the REVOLUTION, seen three-quarters from the nose: the
//              half-plane swings once round the axis carrying the profile;
//              every 22.5° it leaves a meridian, and every station of the
//              profile traces its parallel as it goes, so the surface of
//              revolution is drawn meridian by meridian. Unhurried over the
//              half the lens sees, quicker round the back; the partly swept
//              surface is in the depth buffer as it is made, and while the
//              lathe turns what it turns behind shows faint and dashed (gone
//              once it stops).
//   0.27–0.30  the midpiece's helix written round it (the mitochondrial
//              sheath).
//   0.29–0.36  the PRESS, seen low from the nose's side: two plates close on
//              the head across its thickness and press it to the paddle — the
//              head scaled by a half in that one axis (3 wide, 1.5 thick), the
//              neck and midpiece not — and draw off; the lens rises to the
//              paddle's broad face.
//   0.35–0.43  the FLAGELLUM drawn out of the midpiece's end along the axis,
//              a tube tapering to its tip, 45 long, its rings left behind
//              the moving end; the lens pulls back to the whole body.
//   0.42–0.50  life: a gold spark at the midpiece; the beat starts at the
//              neck and runs to the tip, the body starts to roll, it moves.
//   0.49–0.59  the lens rises and the SPIRAL is written from the outer arm
//              the swimmer lies on, round and in, turn after turn, to its
//              pole (a dim gold point); 0.585–0.69 a ray from the pole and,
//              at each turn it crosses, a tangent tick and the angle between
//              radius and tangent — the same angle every time, each tick a
//              copy of the last at 1/e^{2πb} the size.
//   0.65–1.00  the lens comes down behind the swimmer as it swims along the
//              arm, gathering pace, turning with it a turn and more, winding
//              in from r = 120 to r ≈ 31; on the inner turns the lens comes a
//              little closer and higher and looks further in, so the inner
//              coils grow ahead. The run ends still winding in.
//
// What is EXACT: the spiral r = e^{bθ} (b = 0.15), its turns sampled at 160 a
// turn from r ≈ 255 down to below a pixel; its tangents (from dr/dθ) and the
// angle marked at each crossing of the ray, arccot b ≈ 81.5°, each tick a
// scaled copy of the last (the spiral's self-similarity); the swimmer's path
// IS the spiral, its head at arc length ℓ = r·√(1 + b²)/b from the pole, so
// the head's radius falls exactly as the arc is swum; the surface of
// revolution of the profile; the press, an affine scale of the head in one
// axis; the tube, circles round the centreline in planes normal to it; the
// silhouettes (the surface's contour, where its normal meets the line of
// sight: marching squares on the head's grid, analytic on the tube); hidden
// lines by a software depth buffer of the body.
// What is a PICTURE: the profile's shape (proportioned as the brief has it:
// head 5 × 3 × 1.5, midpiece 4 × 1, flagellum 45, tapering); the acrosome as a
// lip on the profile; the helix on the midpiece; the beat, a travelling sine
// wave (wavelength 20, amplitude 0.5 at the neck growing to 3.4 at the tip) in
// a plane that rolls with the body; the head and midpiece a rigid piece hung
// from the joint, pointed at the head's place on the arm and yawed by the
// flagellum's slope there; the tail's rest line, which leaves the arm at the
// joint and turns only 0.75 as fast as the arm does (so on the tight inner
// turns it swings a little wide rather than curling round), rather than a
// flagellum swimming free.

import {
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	easeInOutCubic,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	camera3,
	cutAt,
	disc,
	bloom
} from '../log/board.js';
import { NEAR, makeDepth, spline, lerp3 } from '../log/space.js';

export const meta = {
	title: 'lathe: a profile turned on its axis, pressed, drawn out — along the equiangular spiral',
	order: 1,
	seconds: 22,
	three: false
};

const SEC = 22;
const UP = [0, 1, 0];
const FOV = 36;

// ── The body (distance s back from the nose) ─────────────────────────────────
const CAP = 3.3; // the acrosome's edge
const JOIN = 10.4; // the midpiece's end, where the flagellum starts
const TAIL = 45;
const R_T0 = 0.3;
const R_TIP = 0.07;
// The profile: half the outline, a radius at s.
function rOf(s) {
	let r;
	if (s <= 0) r = 0;
	else if (s < 2.3) {
		const x = (2.3 - s) / 2.3;
		r = 1.43 * Math.sqrt(Math.max(0, 1 - x * x));
	} else if (s < 5) {
		const x = (s - 2.3) / 2.7;
		r = 0.42 + 1.01 * Math.pow(Math.cos((Math.PI / 2) * x), 1.25);
	} else if (s < 6) r = 0.42 + 0.08 * smooth(s - 5);
	else if (s < 10) r = 0.5;
	else if (s <= JOIN) r = lerp(0.5, R_T0, smooth((s - 10) / (JOIN - 10)));
	else r = lerp(R_T0, R_TIP, Math.pow(Math.min(1, (s - JOIN) / TAIL), 0.8));
	// the acrosome: a cap a little proud of the head over its front two-thirds
	return r * (1 + 0.05 * (1 - smooth(span(s, CAP - 0.1, CAP + 0.05))));
}
// The head's rows (dense at the nose and the cap's edge); which are drawn as
// parallels; the columns round it.
const ROWS = [
	0, 0.025, 0.07, 0.14, 0.24, 0.38, 0.56, 0.78, 1.05, 1.35, 1.68, 2.02, 2.35, 2.68, 3.0, 3.18, 3.26,
	3.32, 3.4, 3.6, 3.9, 4.2, 4.5, 4.75, 5.0, 5.3, 5.6, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
	10.2, 10.4
];
const PARS = new Set([
	0.07, 0.24, 0.56, 1.05, 1.68, 2.35, 3.0, 3.4, 3.9, 4.5, 5.0, 5.6, 6.5, 7.5, 8.5, 9.5, 10.4
]);
const CAP_ROW = ROWS.indexOf(3.4);
// The profile as it is written: finer than the rows, so the pen draws a curve.
const PROF = [0, 0.004, 0.016, 0.036, 0.064];
for (let sp = 0.1; sp < JOIN; sp += 0.05) PROF.push(sp);
PROF.push(JOIN);
const NPHI = 32;
const DPHI = TAU / NPHI;
// The tail's samples, and which carry rings.
const NT = 120;
const RING_EVERY = 4;
// The beat: wavenumber (a wavelength of 20), amplitude at the joint and tip,
// beats and rolls a second.
const KW = TAU / 20;
const AJ = 0.5;
const ATIP = 3.4;
const BEAT_HZ = 7;
const ROLL_HZ = 0.5;

// ── The spiral: r = e^{bθ} in the plane y = 0, its pole at the origin ────────
const SB = 0.15;
const KS = Math.sqrt(1 + SB * SB) / SB; // arc length to the pole, per unit of r
const ALPHA = Math.atan2(1, SB); // radius to tangent, the same everywhere
const R_START = 120;
const R_OUT = R_START * Math.exp(SB * TAU * 0.8);
const TH = (r) => Math.log(r) / SB;
const ON = (th) => {
	const r = Math.exp(SB * th);
	return [r * Math.cos(th), 0, r * Math.sin(th)];
};
// The swimmer's path IS the spiral, by arc length `sig` swum from the start
// (negative: the arm behind it). Its point, travel direction (inward, θ
// falling), and the in-plane normal.
function along(sig) {
	const r = Math.max(1e-6, R_START - sig / KS);
	const th = TH(r);
	const c = Math.cos(th);
	const s = Math.sin(th);
	const T = norm([s - SB * c, 0, -(SB * s + c)]);
	return { P: [r * c, 0, r * s], T, N: norm(cross(UP, T)), r };
}
const START = along(0);
const H0 = START.P;
const T0 = START.T;
const N0 = START.N;
const INS = Math.sign(dot(N0, mul3(H0, -1))); // N0 · INS points at the pole
// The ray of ticks: across the pole from the swimmer, crossing the arms at
// r = 195, 76, 29.5, 11.5 … (each e^{2πb} ≈ 2.57 times the next).
const RAY_R = 195;
const RAY0 = TH(RAY_R);

// ∫ smooth(span(x, a, b)) dx from a: closed form, so the pace is a pure
// function of progress.
function iS(x, a, b) {
	if (x <= a) return 0;
	if (x >= b) return (b - a) / 2 + (x - b);
	const y = (x - a) / (b - a);
	return (b - a) * (y * y * y - (y * y * y * y) / 2);
}
// A monotone cubic through keys [u, value, slope]: the sweep's pace.
function herm(u, keys) {
	if (u <= keys[0][0]) return keys[0][1];
	const n = keys.length;
	if (u >= keys[n - 1][0]) return keys[n - 1][1];
	let i = 0;
	while (u > keys[i + 1][0]) i++;
	const [u0, v0, m0] = keys[i];
	const [u1, v1, m1] = keys[i + 1];
	const H = u1 - u0;
	const x = (u - u0) / H;
	const x2 = x * x;
	const x3 = x2 * x;
	return (
		(2 * x3 - 3 * x2 + 1) * v0 +
		(x3 - 2 * x2 + x) * H * m0 +
		(-2 * x3 + 3 * x2) * v1 +
		(x3 - x2) * H * m1
	);
}
// The turn of the lathe: unhurried over the half the lens sees, quicker
// round the back, at rest at both ends.
const SWEEP = [
	[0.112, 0, 0],
	[0.207, 2.95, 40],
	[0.262, TAU, 0]
];

// Arc swum (in u-units of pace): gathering from 0.45, faster from 0.6.
const V1 = 700;
const V2 = 1550;
const swum = (u) => V1 * iS(u, 0.45, 0.56) + (V2 - V1) * iS(u, 0.63, 0.77);
// Behind the joint the tail turns KAPPA as fast as the arm does, so on the
// tight inner turns it swings a little wide of the arm instead of curling
// round it.
const KAPPA = 0.75;

export async function make() {
	const Z = makeDepth(4);
	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t, Z);
		}
	};
}

// ── Ink: segments batched by colour, alpha, width and dash ───────────────────
function makeInk() {
	const B = new Map();
	return {
		seg(color, alpha, width, dash, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(20, Math.round(alpha * 20));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}|${dash ? 1 : 0}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 20, width: wq / 4, dash, P: [] };
				B.set(key, b);
			}
			b.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(b.dash ? [4, 6] : []);
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

// Behind the body? The deepest of the four depth cells round the point (so a
// silhouette stays drawn), with a tolerance tight enough that the head's far
// face hides even from a distance.
function hiddenAt(Z, x, y, z) {
	if (!Z.on) return false;
	const fx = x / Z.s - 0.5;
	const fy = y / Z.s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	let m = -Infinity;
	for (let dy = 0; dy < 2; dy++)
		for (let dx = 0; dx < 2; dx++) {
			const xx = x0 + dx;
			const yy = y0 + dy;
			if (xx < 0 || yy < 0 || xx >= Z.W || yy >= Z.H) return false;
			const v = Z.buf[yy * Z.W + xx];
			if (v > m) m = v;
		}
	return z > m * 1.004 + 0.02;
}

// A projected segment into the ink: culled off the board, width by depth,
// hidden behind the body (then `back` × alpha, or gone).
function put(ink, Z, D, qa, qb, o) {
	if (qa[2] <= NEAR || qb[2] <= NEAR) return;
	const { w, h, ref } = D;
	const m = 30;
	if ((qa[0] < -m && qb[0] < -m) || (qa[0] > w + m && qb[0] > w + m)) return;
	if ((qa[1] < -m && qb[1] < -m) || (qa[1] > h + m && qb[1] > h + m)) return;
	// A long chord (the arm's, near the lens) is tested every few pixels, not
	// on its midpoint alone, or it is drawn or hidden whole where it passes
	// under the body.
	const n = o.test === false ? 1 : Math.ceil(Math.hypot(qb[0] - qa[0], qb[1] - qa[1]) / 6);
	if (n > 1) {
		for (let i = 0; i < n; i++) {
			const u0 = i / n;
			const u1 = (i + 1) / n;
			const pa = [0, 1, 2].map((k) => qa[k] + (qb[k] - qa[k]) * u0);
			const pb = [0, 1, 2].map((k) => qa[k] + (qb[k] - qa[k]) * u1);
			put(ink, Z, D, pa, pb, o);
		}
		return;
	}
	const mz = (qa[2] + qb[2]) / 2;
	const hid = o.test !== false && hiddenAt(Z, (qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, mz);
	const back = o.back ?? 0;
	if (hid && back <= 0) return;
	const ws = o.flat ? 1 : Math.min(1.6, Math.max(0.6, ref / mz));
	ink.seg(
		o.color ?? PAL.chalk,
		hid ? o.alpha * back : o.alpha,
		o.width * ws * (hid ? 0.7 : 1),
		hid ? !!(o.hdash || o.dash) : !!o.dash,
		qa[0],
		qa[1],
		qb[0],
		qb[1]
	);
}
// A world segment, cut at the near plane first.
function put3(ink, Z, D, a, b, o) {
	const { cam } = D;
	let qa = cam.project(a);
	let qb = cam.project(b);
	if (qa[2] <= NEAR && qb[2] <= NEAR) return;
	if (qa[2] <= NEAR || qb[2] <= NEAR) {
		const c = cam.project(lerp3(a, b, (qa[2] - NEAR * 1.01) / (qa[2] - qb[2])));
		if (qa[2] <= NEAR) qa = c;
		else qb = c;
	}
	put(ink, Z, D, qa, qb, o);
}
const poly3 = (ink, Z, D, pts, o) => {
	for (let i = 1; i < pts.length; i++) put3(ink, Z, D, pts[i - 1], pts[i], o);
};

// ── The frame ────────────────────────────────────────────────────────────────
function draw(ctx, w, h, t, Z) {
	const u = Math.min(1, Math.max(0, t / SEC));

	// Where the making is.
	const life = smooth(span(u, 0.42, 0.5));
	const tA = 0.42 * SEC;
	const phase = TAU * BEAT_HZ * iS(t, tA, tA + 1.6);
	const roll = TAU * ROLL_HZ * iS(t, tA + 0.4, tA + 2.8);
	const press = smooth(span(u, 0.305, 0.335));
	const sigH = lerp(1, 0.5, press);
	const sweep = herm(u, SWEEP);
	// while the lathe turns, what it turns round the back shows dashed
	const turning = smooth(span(u, 0.112, 0.13)) * (1 - smooth(span(u, 0.262, 0.29)));
	const Lt = TAIL * easeInOutCubic(span(u, 0.345, 0.425));
	const sw = swum(u);
	const fol = smooth(span(u, 0.45, 0.56));
	const head = along(sw);
	const Nin = mul3(head.N, INS);

	// The lens: turned round the body while it is made, beside it as it comes
	// to life, up over the spiral while it is written, then down behind the
	// swimmer along the arm.
	const ext = smooth(span(u, 0.335, 0.43));
	const hT = norm(lerp3(T0, head.T, fol));
	const hN = norm(lerp3(N0, head.N, fol));
	const hP = lerp3(add3(H0, mul3(T0, sw)), head.P, fol);
	const gT = add3(hP, mul3(hT, lerp(-5.1, -26, ext)));
	const gD = lerp(lerp(18.5, 16.8, smooth(span(u, 0, 0.3))), 70, ext);
	const az = spline(u, [
		[0, 0.62],
		[0.11, 0.4],
		[0.19, 0.88],
		[0.26, 0.72],
		[0.31, 0.95],
		[0.335, 0.88],
		[0.38, 0.3],
		[0.43, -0.22],
		[0.5, -0.34],
		[0.58, -0.4]
	]);
	const el = spline(u, [
		[0, 0.18],
		[0.11, 0.2],
		[0.19, 0.42],
		[0.26, 0.3],
		[0.31, 0.18],
		[0.335, 0.2],
		[0.38, 0.6],
		[0.43, 0.34],
		[0.5, 0.4],
		[0.58, 0.5]
	]);
	const gDir = add3(
		mul3(add3(mul3(hN, Math.cos(az)), mul3(hT, Math.sin(az))), Math.cos(el)),
		mul3(UP, Math.sin(el))
	);
	// Each lens is a target, a direction from it and a distance; between two,
	// the target leads, the direction turns and the distance goes as a zoom.
	const G = { target: gT, dir: gDir, dist: gD };
	const rvT = mul3(H0, 0.18);
	const rvDir = norm(add3(add3(mul3(N0, -0.4 * INS), mul3(T0, -0.1)), mul3(UP, 0.9)));
	const R = { target: rvT, dir: rvDir, dist: 2.7 * R_OUT };
	// behind the swimmer's outer shoulder, a constant way off, so the coils
	// ahead swell as it winds in; looking a third of the way to the pole
	// and, on the inner turns, closer and higher, looking further in
	const wIn = smooth(span(head.r, 80, 30));
	const fD = lerp(50, 42, wIn);
	const fDir = norm(
		add3(add3(mul3(head.T, -0.3), mul3(Nin, -0.7)), mul3(UP, lerp(0.35, 0.45, wIn)))
	);
	const fT = add3(lerp3(head.P, [0, 0, 0], lerp(0.45, 0.55, wIn)), mul3(head.T, -0.1 * fD));
	const fV = sub3(add3(head.P, mul3(fDir, fD)), fT);
	const F = { target: fT, dir: norm(fV), dist: Math.hypot(...fV) };
	const blend = (A, B, kt, k) => ({
		target: lerp3(A.target, B.target, kt),
		dir: norm(lerp3(A.dir, B.dir, k)),
		dist: Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), k))
	});
	const L = blend(
		blend(G, R, smooth(span(u, 0.49, 0.56)), smooth(span(u, 0.49, 0.58))),
		F,
		smooth(span(u, 0.645, 0.71)),
		smooth(span(u, 0.645, 0.76))
	);
	const target = L.target;
	const pos = add3(L.target, mul3(L.dir, L.dist));
	const cam = camera3({ pos, target, up: UP, fov: FOV, w, h });
	const kpx = h / 2 / Math.tan((FOV * Math.PI) / 360);

	// ── The centreline: the path, the beat across it in a plane that rolls ──
	const cr = Math.cos(roll);
	const sr = Math.sin(roll);
	// Behind the joint, the tail's rest line: from the arm at the joint, its
	// heading turning KAPPA times as the arm's does (the arm's heading turns
	// exactly with θ), integrated step by step.
	const DS = TAIL / NT;
	const J = along(sw - JOIN);
	const thJ = TH(J.r);
	const bx = -J.T[0];
	const bz = -J.T[2];
	const rest = [{ P: J.P, N: J.N }];
	for (let k = 0; k < NT; k++) {
		const d = KAPPA * (TH(Math.max(1e-6, J.r + ((k + 0.5) * DS) / KS)) - thJ);
		const c = Math.cos(d);
		const sn = Math.sin(d);
		const B = [bx * c - bz * sn, 0, bx * sn + bz * c];
		rest.push({ P: add3(rest[k].P, mul3(B, DS)), N: norm(cross(UP, mul3(B, -1))) });
	}
	const restAt = (s) => {
		if (s <= JOIN) {
			const A = along(sw - s);
			return { P: A.P, N: A.N };
		}
		const f = Math.min(NT, (s - JOIN) / DS);
		const k = Math.min(NT - 1, Math.floor(f));
		const a = rest[k];
		const b = rest[k + 1];
		return { P: lerp3(a.P, b.P, f - k), N: norm(lerp3(a.N, b.N, f - k)) };
	};
	const line = (s) => {
		const sig = sw - s;
		const A = restAt(s);
		let P = A.P;
		let N = A.N;
		if (fol < 1) {
			P = lerp3(add3(H0, mul3(T0, sig)), A.P, fol);
			N = norm(lerp3(N0, A.N, fol));
		}
		const Yr = add3(mul3(N, cr), mul3(UP, sr));
		const x = Math.max(0, (s - JOIN) / TAIL);
		const amp = life * (AJ + (ATIP - AJ) * Math.pow(x, 1.15));
		return { C: add3(P, mul3(Yr, amp * Math.sin(KW * (s - JOIN) - phase))), Yr };
	};
	// The head and midpiece: one rigid piece on the joint, along the
	// flagellum's slope there (so it yaws as the tail beats).
	const jA = line(JOIN - 0.3);
	const jB = line(JOIN);
	const jC = line(JOIN + 0.3);
	// pointed from the joint's rest place at the head's place on the arm,
	// turned by the flagellum's slope at the joint
	const jR = lerp3(add3(H0, mul3(T0, sw - JOIN)), J.P, fol);
	const Xc = norm(sub3(jA.C, jC.C));
	const X = norm(add3(norm(sub3(hP, jR)), mul3(jB.Yr, dot(Xc, jB.Yr))));
	const Y = norm(sub3(jB.Yr, mul3(X, dot(X, jB.Yr))));
	const Zf = cross(X, Y);
	const O = jB.C;
	const sigma = (s) => 1 - (1 - sigH) * (1 - smooth(span(s, 4.4, 5.6)));
	const front = (s, ph, r = rOf(s)) => {
		const y = r * Math.sin(ph);
		const z = sigma(s) * r * Math.cos(ph);
		return add3(O, add3(mul3(X, JOIN - s), add3(mul3(Y, y), mul3(Zf, z))));
	};

	const nose = front(0, 0);
	const ref = Math.hypot(...sub3(nose, pos)) * 0.9;
	const D = { w, h, ref, cam };
	const eye = pos;
	const qN = cam.project(nose);
	const headPx = qN[2] > NEAR ? (1.5 * kpx) / qN[2] : 0;
	const meshA = smooth(span(headPx, 3, 14));

	Z.reset(w, h);
	const ink = makeInk();

	// ── The head and midpiece, once the sweep has begun ─────────────────────
	const NR = ROWS.length;
	let Wp = null;
	let Qp = null;
	let G2 = null;
	if (sweep > 0.001) {
		Wp = [];
		Qp = [];
		G2 = [];
		for (let i = 0; i < NR; i++) {
			const s = ROWS[i];
			const r = rOf(s);
			const e = 0.01;
			const sr0 = sigma(s) * r;
			const dr = (rOf(s + e) - rOf(Math.max(0, s - e))) / (s > e ? 2 * e : s + e);
			const dsr =
				(sigma(s + e) * rOf(s + e) - sigma(Math.max(0, s - e)) * rOf(Math.max(0, s - e))) /
				(s > e ? 2 * e : s + e);
			const wr = [];
			const qr = [];
			const gr = [];
			for (let j = 0; j <= NPHI; j++) {
				const ph = Math.min(j * DPHI, sweep);
				const p = front(s, ph, r);
				wr.push(p);
				qr.push(cam.project(p));
				// the outward normal, ∂φ × ∂s, in the body's frame
				const c = Math.cos(ph);
				const sn = Math.sin(ph);
				let n;
				if (r < 1e-6) n = X;
				else {
					const a = [0, r * c, -sr0 * sn];
					const b = [-1, dr * sn, dsr * c];
					const nl = cross(a, b);
					n = norm(add3(mul3(X, nl[0]), add3(mul3(Y, nl[1]), mul3(Zf, nl[2]))));
				}
				gr.push(dot(n, norm(sub3(p, eye))));
			}
			Wp.push(wr);
			Qp.push(qr);
			G2.push(gr);
		}
		for (let i = 0; i < NR - 1; i++)
			for (let j = 0; j < NPHI; j++) {
				if (j * DPHI >= sweep) break;
				Z.tri(Qp[i][j], Qp[i + 1][j], Qp[i + 1][j + 1]);
				Z.tri(Qp[i][j], Qp[i + 1][j + 1], Qp[i][j + 1]);
			}
	}

	// ── The flagellum ────────────────────────────────────────────────────────
	const tail = [];
	if (Lt > 0.05) {
		const kEnd = (Lt / TAIL) * NT;
		for (let k = 0; k <= Math.ceil(kEnd); k++) {
			const s = JOIN + (TAIL * Math.min(k, kEnd)) / NT;
			const L = line(s);
			tail.push({ s, k, C: L.C, Yr: L.Yr, r: rOf(s) });
		}
		const n = tail.length;
		for (let k = 0; k < n; k++) {
			const a = k > 0 ? tail[k - 1].C : jA.C;
			const b = k < n - 1 ? tail[k + 1].C : tail[k].C;
			const Fk = norm(sub3(a, b));
			const T = tail[k];
			T.F = Fk;
			T.Y = norm(sub3(T.Yr, mul3(Fk, dot(Fk, T.Yr))));
			T.Z = cross(Fk, T.Y);
			T.at = (ph) => add3(T.C, add3(mul3(T.Y, T.r * Math.sin(ph)), mul3(T.Z, T.r * Math.cos(ph))));
			T.ring = [];
			for (let m = 0; m <= 8; m++) T.ring.push(cam.project(T.at((TAU * m) / 8)));
		}
		for (let k = 0; k < n - 1; k++)
			for (let m = 0; m < 8; m++) {
				const A = tail[k].ring;
				const B = tail[k + 1].ring;
				Z.tri(A[m], B[m], B[m + 1]);
				Z.tri(A[m], B[m + 1], A[m + 1]);
			}
	}

	// ── The construction: the axis, the half-plane, the plates ──────────────
	const axisA = (1 - smooth(span(u, 0.4, 0.46))) * smooth(span(u, 0, 0.03));
	if (axisA > 0.01) {
		const tipX = -(JOIN + Math.max(3, Lt + 2.5));
		const p0 = add3(H0, mul3(T0, 2.6));
		const p1 = add3(H0, mul3(T0, lerp(2.6, tipX, smooth(span(u, 0, 0.03)))));
		put3(ink, Z, D, p0, p1, { alpha: 0.42 * axisA, width: 1, dash: true, back: 0.5 });
	}
	const frameA = smooth(span(u, 0.008, 0.03)) * (1 - smooth(span(u, 0.268, 0.29)));
	if (frameA > 0.01) {
		const dir = add3(mul3(UP, Math.cos(sweep)), mul3(N0, Math.sin(sweep)));
		const at = (x, rr) => add3(H0, add3(mul3(T0, x), mul3(dir, rr)));
		const fr = [at(0.9, 0), at(0.9, 2.05), at(-JOIN - 0.8, 2.05), at(-JOIN - 0.8, 0)];
		const k = smooth(span(u, 0.008, 0.03));
		const pts = cutAt(
			fr.map((p) => cam.project(p)),
			k
		);
		for (let i = 1; i < pts.length; i++)
			put(ink, Z, D, pts[i - 1], pts[i], { alpha: 0.32 * frameA, width: 1, dash: true });
	}
	const plateA = smooth(span(u, 0.285, 0.297)) * (1 - smooth(span(u, 0.342, 0.36)));
	if (plateA > 0.01) {
		const touch = 1.5 * sigH + 0.05;
		const zp =
			u < 0.305
				? lerp(3.2, touch, smooth(span(u, 0.285, 0.305)))
				: u < 0.338
					? touch
					: lerp(touch, 3.2, smooth(span(u, 0.338, 0.36)));
		for (const sgn of [1, -1]) {
			const at = (x, y) => add3(H0, add3(mul3(T0, x), add3(mul3(N0, y), mul3(UP, sgn * zp))));
			const xs = [1.0, -6.0];
			const ys = [-2.2, 2.2];
			const o = { alpha: 0.46 * plateA, width: 1, back: 0.3, hdash: true };
			poly3(
				ink,
				Z,
				D,
				[at(xs[0], ys[0]), at(xs[1], ys[0]), at(xs[1], ys[1]), at(xs[0], ys[1]), at(xs[0], ys[0])],
				o
			);
			for (let q = 1; q < 4; q++) {
				const y = lerp(ys[0], ys[1], q / 4);
				put3(ink, Z, D, at(xs[0], y), at(xs[1], y), { ...o, alpha: 0.18 * plateA });
			}
		}
	}

	// ── The profile, written (and then carried round by the sweep) ──────────
	let pen = null;
	const profA = smooth(span(u, 0.025, 0.035));
	if (profA > 0 && sweep < TAU - 1e-3) {
		const Pp = [];
		for (const sp of PROF) Pp.push(cam.project(front(sp, sweep)));
		const k = easeInOutCubic(span(u, 0.028, 0.108));
		const pts = cutAt(Pp, k);
		for (let i = 1; i < pts.length; i++)
			put(ink, Z, D, pts[i - 1], pts[i], {
				alpha: 0.98 * profA,
				width: 2.2,
				back: 0.55,
				hdash: true
			});
		if (k > 0 && k < 1) pen = pts[pts.length - 1];
	}

	// ── The surface's lines ──────────────────────────────────────────────────
	if (Wp) {
		const MER = {
			alpha: 0.6 * meshA,
			width: 1,
			back: lerp(0.07, 0.42, turning),
			hdash: turning > 0.02
		};
		// meridians, every other column, each as the sweep leaves it
		for (let j = 0; j < NPHI; j += 2) {
			const ph = j * DPHI;
			if (ph > sweep) break;
			const a = smooth(span(sweep - ph, 0, 0.3));
			const o = { ...MER, alpha: MER.alpha * a };
			for (let i = 0; i < NR - 1; i++) put(ink, Z, D, Qp[i][j], Qp[i + 1][j], o);
		}
		// parallels, traced by the sweep; the cap's edge bolder
		for (let i = 1; i < NR; i++) {
			if (!PARS.has(ROWS[i])) continue;
			const o = i === CAP_ROW ? { ...MER, alpha: 0.85, width: 1.45 } : MER;
			for (let j = 0; j < NPHI; j++) {
				if (j * DPHI >= sweep) break;
				put(ink, Z, D, Qp[i][j], Qp[i][j + 1], o);
			}
		}
		// the contour: where the normal meets the line of sight
		const CON = { alpha: 0.95, width: 1.9 };
		for (let i = 0; i < NR - 1; i++)
			for (let j = 0; j < NPHI; j++) {
				if ((j + 1) * DPHI > sweep + 1e-6) break;
				contourCell(ink, Z, D, Qp, G2, i, j, CON);
			}
		// the midpiece's helix
		const hx = easeInOutCubic(span(u, 0.268, 0.3));
		if (hx > 0) {
			const pts = [];
			const n = 150;
			for (let q = 0; q <= n * hx; q++) {
				const s = 6.05 + (3.9 * q) / n;
				pts.push(cam.project(front(s, 0.4 + (TAU * 6.5 * q) / n, rOf(s) * 1.01)));
			}
			for (let q = 1; q < pts.length; q++)
				put(ink, Z, D, pts[q - 1], pts[q], {
					alpha: 0.7 * lerp(0.5, 1, meshA),
					width: 1,
					back: 0.06
				});
		}
	}

	// ── The flagellum's lines ────────────────────────────────────────────────
	if (tail.length > 1) {
		const n = tail.length;
		const tubePx = (k) => (tail[k].r * kpx) / Math.max(NEAR, tail[k].ring[0][2]);
		const RING = { alpha: 0.55, width: 0.9, back: 0.06 };
		for (let k = 0; k < n; k++) {
			const end = k === n - 1;
			if (!end && tail[k].k % RING_EVERY !== 0) continue;
			const ra = smooth(span(tubePx(k), 1.2, 3.5));
			if (ra <= 0.01) continue;
			const o =
				end && Lt < TAIL - 0.01 ? { alpha: 0.95, width: 1.6 } : { ...RING, alpha: RING.alpha * ra };
			const Rq = [];
			for (let m = 0; m <= 16; m++) Rq.push(cam.project(tail[k].at((TAU * m) / 16)));
			for (let m = 0; m < 16; m++) put(ink, Z, D, Rq[m], Rq[m + 1], o);
		}
		for (let m = 0; m < 8; m += 2) {
			for (let k = 0; k < n - 1; k++) {
				const ra = smooth(span(tubePx(k), 1.5, 4));
				if (ra <= 0.01) continue;
				put(ink, Z, D, tail[k].ring[m], tail[k + 1].ring[m], {
					alpha: 0.42 * ra,
					width: 0.85,
					back: 0.05
				});
			}
		}
		// the contour of a tube: ± r across the centreline, square to the eye
		const sideQ = [[], []];
		for (let k = 0; k < n; k++) {
			const T = tail[k];
			const side = norm(cross(T.F, sub3(T.C, eye)));
			sideQ[0].push(cam.project(add3(T.C, mul3(side, T.r))));
			sideQ[1].push(cam.project(add3(T.C, mul3(side, -T.r))));
		}
		for (const S of sideQ)
			for (let k = 0; k < n - 1; k++) put(ink, Z, D, S[k], S[k + 1], { alpha: 0.9, width: 1.5 });
	}

	// ── The spiral, its ray and its ticks, its pole ─────────────────────────
	const spA = smooth(span(u, 0.495, 0.51));
	let poleA = 0;
	if (spA > 0) {
		const thTop = TH(R_OUT);
		const qP = cam.project([0, 0, 0]);
		const pxAtPole = qP[2] > NEAR ? kpx / qP[2] : 1;
		const thBot = TH(Math.max(1e-4, 0.35 / pxAtPole));
		const wr = span(u, 0.5, 0.59);
		const thW = wr >= 1 ? thBot : lerp(thTop, TH(0.12), wr);
		poleA = smooth(span(wr, 0.92, 1));
		const step = TAU / 160;
		const SP = { alpha: 0.82 * spA, width: 1.5 };
		let a = ON(thTop);
		for (let th = thTop - step; ; th -= step) {
			const last = th <= thW;
			const b = ON(last ? thW : th);
			// the outer end comes out of nothing over its first third of a turn
			const fin = smooth((thTop - th) / (TAU / 3));
			put3(ink, Z, D, a, b, fin < 1 ? { ...SP, alpha: SP.alpha * fin } : SP);
			a = b;
			if (last) break;
		}
		if (wr > 0 && wr < 1) {
			const q = cam.project(a);
			if (q[2] > NEAR) pen = q;
		}
		// the ray from the pole, and the tangent and angle at each crossing
		const rayA = smooth(span(u, 0.585, 0.6));
		if (rayA > 0) {
			const e = [Math.cos(RAY0), 0, Math.sin(RAY0)];
			const len = lerp(0, RAY_R * 1.14, easeInOutCubic(span(u, 0.585, 0.61)));
			const n = 40;
			for (let q = 0; q < n; q++)
				put3(ink, Z, D, mul3(e, (len * q) / n), mul3(e, (len * (q + 1)) / n), {
					alpha: lerp(0.34, 0.14, smooth(span(u, 0.66, 0.76))) * rayA,
					width: 1,
					dash: true,
					flat: true
				});
		}
		for (let k = 0; k < 9; k++) {
			const th = RAY0 - TAU * k;
			const r = Math.exp(SB * th);
			const q0 = cam.project(ON(th));
			if (q0[2] <= NEAR || (0.12 * r * kpx) / q0[2] < 2) continue;
			const on = easeInOutCubic(span(u, 0.6 + 0.009 * k, 0.618 + 0.009 * k));
			if (on <= 0) continue;
			const P = ON(th);
			// stood aside for the swimmer as it passes one
			const near = smooth(span(Math.hypot(...sub3(P, head.P)) / r, 0.25, 0.6));
			if (near <= 0.01) continue;
			const er = [Math.cos(th), 0, Math.sin(th)];
			const et0 = [-Math.sin(th), 0, Math.cos(th)];
			const tg = norm(add3(mul3(er, SB), et0));
			const L = 0.24 * r * on;
			put3(ink, Z, D, add3(P, mul3(tg, -L)), add3(P, mul3(tg, L)), {
				alpha: 0.9 * near,
				width: 1.4
			});
			const arc = [];
			const ra = 0.11 * r;
			for (let m = 0; m <= 18; m++) {
				const tau = (ALPHA * on * m) / 18;
				arc.push(add3(P, add3(mul3(er, ra * Math.cos(tau)), mul3(et0, ra * Math.sin(tau)))));
			}
			poly3(ink, Z, D, arc, { alpha: 0.72 * near, width: 1.1 });
		}
	}

	ink.flush(ctx);

	// The pen, the spark of life, the pole.
	if (pen) disc(ctx, pen[0], pen[1], 2.6, { fill: PAL.chalk, alpha: 0.95 });
	const spark = smooth(span(u, 0.412, 0.425)) * (1 - smooth(span(u, 0.43, 0.49)));
	if (spark > 0.01) {
		const q = cam.project(front(8, 0, 0));
		if (q[2] > NEAR) {
			bloom(ctx, q[0], q[1], 26, 'rgba(255, 214, 140, 0.35)', spark);
			disc(ctx, q[0], q[1], 3.2, { fill: PAL.gold, alpha: spark });
		}
	}
	if (poleA > 0) {
		const q = cam.project([0, 0, 0]);
		if (q[2] > NEAR) {
			bloom(ctx, q[0], q[1], 16, 'rgba(255, 214, 140, 0.28)', poleA);
			disc(ctx, q[0], q[1], 2.6, { fill: PAL.gold, alpha: 0.9 * poleA });
		}
	}
}

// One cell of the head's contour, by marching squares on the sign of
// n · (p − eye): the crossing on each edge interpolated on the projected grid.
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
	14: [[3, 0]],
	5: [
		[3, 2],
		[0, 1]
	],
	10: [
		[0, 1],
		[2, 3]
	]
};
function contourCell(ink, Z, D, Q, G, i, j, o) {
	const a = G[i][j];
	const b = G[i + 1][j];
	const c = G[i + 1][j + 1];
	const d = G[i][j + 1];
	const idx = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (c < 0 ? 4 : 0) | (d < 0 ? 8 : 0);
	if (idx === 0 || idx === 15) return;
	const qa = Q[i][j];
	const qb = Q[i + 1][j];
	const qc = Q[i + 1][j + 1];
	const qd = Q[i][j + 1];
	const mix = (p, q, gp, gq) => {
		const t = gp / (gp - gq);
		return [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
	};
	const E = (e) =>
		e === 0
			? mix(qa, qb, a, b)
			: e === 1
				? mix(qb, qc, b, c)
				: e === 2
					? mix(qd, qc, d, c)
					: mix(qa, qd, a, d);
	for (const [p, q] of MS[idx]) put(ink, Z, D, E(p), E(q), o);
}
