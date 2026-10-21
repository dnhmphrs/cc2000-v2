// ── Kummer: the structure of flow-kummer ─────────────────────────────────────
// ONE idea, exact: conception is the fixed point of a fold. The data make a
// lattice Λ = ℤ + ℤτ in ℂ; the plane folds into the torus ℂ/Λ; the torus
// folds in half under z ↦ −z, whose four fixed points — the half-points 0, ½,
// τ/2, (1 + τ)/2 — are the nodes of the quotient (the pillowcase, a sphere
// with four cone points; one dimension up, Kummer's quartic with sixteen);
// the lens goes into the origin's node, a cone, a tunnel. This module is the
// maths and the chalk of that structure, every piece with its parameters,
// and one `structure()` that draws a state — the flow only turns the
// parameters with time (`paramsAt`) and moves the lens (`cameraAt`).
//
// EXACT (maths):
//   · the lattice: Λ(τ) = {m + nτ}, z = a + bτ in cell coordinates (a, b);
//     the fundamental cell 0, 1, 1 + τ, τ; z ∼ z + 1 glues the τ-sides (one
//     chevron), z ∼ z + τ the 1-sides (two chevrons); τ from the slider,
//     Re τ = (spice − 1)/9 − ½, Im τ = 1 (`tauOf`, log-entry's lean).
//   · the fold's gluing and twist (log-abelian's foldMap, lifted here with τ
//     a parameter and the roll's fixed line moved): the roll closes the
//     a-direction into a circle of circumference 1 (a = 0 meets a = 1, since
//     Re z differs by exactly 1 along b = const); the bend closes the
//     b-direction and, as it bends, sheds the shear b·Re τ, so z + τ lands on
//     z — the finished torus is the SQUARE frame ℝ²/ℤ² of ℂ/Λ.
//   · the involution z ↦ −z, (a, b) ↦ (−a, −b) mod 1, whose fixed points are
//     exactly the four half-points (`pair`, `HALF`). On the finished torus —
//     a torus of revolution with the roll closed under Re = ¾ (`FOLD.xc`),
//     which puts a = 0 on the OUTER equator and a = ½ on the inner — it IS
//     the rotation by π about the SKEWER, the line through the torus's
//     centre along X (`turnAbout`): place(−a, −b) = turnAbout(place(a, b), π)
//     for every (a, b), and the four half-points land on the skewer at
//     C ± (R ± r), the only points it leaves where they are. (Checked
//     numerically when this was written, to 1e−12; any other closing line
//     puts the half-points off the equators, and then z ↦ −z is no rigid
//     motion of the embedded torus at all.) Near a fixed point the quotient
//     is a cone of angle π, the cone of half-angle 30° (2π sin 30° = π),
//     `CONE.half`; one dimension up the node is xy = z² (ℂ²/±1).
//   · the quartic variant's surface, nodes and depth mesh: log-abelian's
//     Kummer quartic in Hudson's tetrahedroid form, lifted whole below (the
//     sixteen nodes by Newton on ∇F = 0, all real, every load the same).
// A PICTURE (drawn, not derived):
//   · the embedding of the torus (a flat torus has no smooth isometric
//     embedding in ℝ³; the tube is stretched by `FOLD.stretch` as it bends so
//     the torus has a hole), and the roll as a circle of curvature k;
//   · the pillow: the half above the skewer's plane swung down onto the half
//     below (`lid` — the rims tear and land on their mirrors: the quotient
//     map is 2-to-1, and no motion of a surface in space does it without
//     passing through itself), then the rims pinched onto the skewer
//     (`pinch`), each rim folded in half, which is what z ∼ −z asks of it;
//     the pod that is left is a sphere with the four cone points at the ends
//     of its two seams, the origin's at the tip;
//   · the cone: chalk generatrices and rings spaced in log of the distance to
//     the apex, so flying in never runs out, on the lens's own line of
//     approach; the lens's path; the sample pairs drawn converging in the
//     turn; the quartic's size and place in the torus's stead.
//
// World: X = Re z, Y up (off the board), Z = −Im z, so a lens straight above
// reads the board as ℂ. Budget: a frame under ~25 ms headless at 1280 × 800
// (the lines batched by alpha and width, the depth buffer at 4 px).

import {
	PAL,
	TAU,
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
} from './board.js';
import {
	NEAR,
	orbit,
	lerp3,
	spline,
	spline3,
	pxPerUnit,
	makeDepth,
	circle3,
	axesOf,
	lit3
} from './space.js';

// ── The lattice ──────────────────────────────────────────────────────────────
// τ from the slider: Re τ leans from −½ at 1 to +½ at 10, Im τ = 1.
export const tauOf = (spice) => [(spice - 1) / 9 - 0.5, 1];
export const DEMO_TAU = tauOf(7);
// The four half-points, in cell coordinates: 0, ½, τ/2, (1 + τ)/2.
export const HALF = [
	[0, 0],
	[0.5, 0],
	[0, 0.5],
	[0.5, 0.5]
];
const mod1 = (x) => x - Math.floor(x);
// z = a + bτ, and back.
export const toZ = (tau, a, b) => [a + b * tau[0], b * tau[1]];
export const fromZ = (tau, x, y) => [x - (y / tau[1]) * tau[0], y / tau[1]];
// The mirror −z mod Λ of a point, in cell coordinates.
export const pair = ([a, b]) => [mod1(-a), mod1(-b)];
// The flat plane, as the world has it.
export const flat = (tau, a, b) => [a + b * tau[0], 0, -b * tau[1]];

// ── The fold ─────────────────────────────────────────────────────────────────
export const FOLD = {
	xc: 0.75, // Re z the roll closes under: a = 0 lands on the outer equator
	stretch: 2.2 // the tube's length as it bends, in Im τ: the torus's hole
};
// The map (a, b) ↦ world for a roll (0 flat … 1 closed, curvature 2π·roll)
// and a bend (0 straight … 1 closed, the axis bent through 2π·bend); the
// shear b·Re τ shed with the bend. log-abelian's foldMap, with τ a parameter.
export function fold(tau, roll, bend, { xc = FOLD.xc, stretch = FOLD.stretch } = {}) {
	const k = TAU * roll;
	const phi = TAU * bend;
	const L = tau[1] * (1 + (stretch - 1) * bend);
	return (a, b) => {
		const x = a + b * tau[0] * (1 - bend) - xc;
		const y = b * tau[1];
		if (k < 1e-6) return [x + xc, 0, -y];
		const cx = Math.sin(k * x) / k;
		const cy = (1 - Math.cos(k * x)) / k;
		if (phi < 1e-6) return [xc + cx, cy, -y];
		const Rb = L / phi;
		const psi = b * phi;
		return [xc - Rb + (Rb + cx) * Math.cos(psi), cy, -(Rb + cx) * Math.sin(psi)];
	};
}
// The finished torus: centre C, the big radius R and the tube's r, the skewer
// along X through C; and the four fixed points on it (closed form — see
// `fixedPoints` for the same four through the fold).
export function torusOf(tau, o = {}) {
	const xc = o.xc ?? FOLD.xc;
	const stretch = o.stretch ?? FOLD.stretch;
	const r = 1 / TAU;
	const R = (tau[1] * stretch) / TAU;
	const C = [xc - R, r, 0];
	const nodes = [R + r, R - r, -(R + r), -(R - r)].map((d) => [C[0] + d, C[1], C[2]]);
	return { C, R, r, axis: [1, 0, 0], nodes, tau };
}
// The half-points through the fold, closed: four world points.
export const fixedPoints = (tau, o = {}) => HALF.map(([a, b]) => fold(tau, 1, 1, o)(a, b));

// ── The half-turn, the lid and the pinch ─────────────────────────────────────
// Rotate a world point by psi about the skewer (the line through T.C along X).
export function turnAbout(p, T, psi) {
	if (!psi) return p;
	const y = p[1] - T.C[1];
	const z = p[2] - T.C[2];
	const c = Math.cos(psi);
	const s = Math.sin(psi);
	return [p[0], T.C[1] + y * c - z * s, T.C[2] + y * s + z * c];
}
// The lid: the half above the skewer's plane (Y > C.y) swung down by f·π.
export function lid(p, T, f) {
	if (f <= 0 || p[1] - T.C[1] <= 1e-9) return p;
	return turnAbout(p, T, f * Math.PI);
}
// The pinch: the rims (the equators, where the tube's angle is 0 or π) pulled
// onto the skewer, by zip 0…1 — each rim folded in half, φ onto −φ.
export function pinch(p, T, zip) {
	if (zip <= 0) return p;
	const x = p[0] - T.C[0];
	const z = p[2] - T.C[2];
	const rho = Math.hypot(x, z);
	const c = Math.max(-1, Math.min(1, (rho - T.R) / T.r));
	return [p[0], p[1], T.C[2] + z * (1 - zip * c * c)];
}
// The whole pipeline for a cell point: fold, turn, lid, pinch.
export function placer(T, { roll = 0, bend = 0, turn = 0, fold: f = 0, zip = 0 } = {}, o = {}) {
	const F = fold(T.tau, roll, bend, o);
	return (a, b) => pinch(lid(turnAbout(F(a, b), T, turn), T, f), T, zip);
}

// ── The cone at a node ───────────────────────────────────────────────────────
export const CONE = {
	half: Math.PI / 6, // the half-angle: the quotient's cone angle π
	spokes: 24,
	step: 0.3, // the rings' spacing, in log of the distance to the apex
	mouth: 1.3, // the cone's length at full size, world units
	floor: 1e-5 // the smallest ring, as a fraction of the mouth
};
// The cone's lines: apex N, axis the unit direction it opens along, `size`
// 0…1 its growth (the mouth at CONE.mouth · size), the lens at distance D
// from the apex along the axis (rings beyond it are not made). Rings at
// mouth · e^{−k·step}; the spokes sampled at the rings, so a painter can set
// each piece's width by its depth. Returns { rings: [{ s, pts }], spokes:
// [[p…]] }.
export function cone(N, axis, { size = 1, D = Infinity, half = CONE.half, o = CONE } = {}) {
	const ax = norm(axis);
	const [e1, e2] = axesOf(ax);
	const far = o.mouth * clamp01(size);
	const rings = [];
	const S = [];
	for (let k = 0; k < 400; k++) {
		const s = far * Math.exp(-k * o.step);
		if (s < o.mouth * o.floor) break;
		if (s > D) continue;
		S.push(s);
	}
	for (const s of S)
		rings.push({
			s,
			pts: circle3(add3(N, mul3(ax, s * Math.cos(half))), e1, e2, s * Math.sin(half), 48)
		});
	const spokes = [];
	for (let j = 0; j < o.spokes; j++) {
		const a = (TAU * j) / o.spokes;
		const d = add3(
			mul3(ax, Math.cos(half)),
			mul3(add3(mul3(e1, Math.cos(a)), mul3(e2, Math.sin(a))), Math.sin(half))
		);
		const pts = [N];
		for (let i = S.length - 1; i >= 0; i--) pts.push(add3(N, mul3(d, S[i])));
		spokes.push(pts);
	}
	return { rings, spokes, axis: ax, e1, e2, far };
}

// The cone, drawn: its rings and generatrices through a lens at distance D
// from the apex on the axis, faint far off and fading as they pass the lens.
// Every width, fade and cut is RELATIVE to D (the line widths' reference
// depth, the near plane at 0.02 D, the fades on s / D), so the picture is
// the same at any D — a flight in never runs out, and a flow's fall can go
// on down the tunnel at its own zoom (flow-kummer's does, with `floor` the
// smallest ring as a fraction of D in place of CONE.floor's absolute one).
// `size` grows the cone's mouth, `grow` its ink. (The structure's own draw
// calls this; before it was lifted out, the near plane was space.js's
// absolute NEAR = 0.05, which culled every ring in the last fifth of a
// second of the dive, and the widths' reference stopped at 0.02.)
export function drawCone(
	ctx,
	cam,
	N,
	dir,
	{ D, w = 1e9, h = 1e9, size = 1, grow = 1, alpha = 1, floor = null } = {}
) {
	if (grow * alpha <= 0.01 || !(D > 0)) return;
	const o = floor ? { ...CONE, floor: Math.min(CONE.floor, (floor * D) / CONE.mouth) } : CONE;
	const Cn = cone(N, dir, { size, D: D * 0.98, o });
	const ink = makeInk();
	const Oc = { ref: D, w, h, nearZ: Math.min(NEAR, 0.02 * D) };
	const vis = (s) => (1 - smooth(span(s / D, 0.5, 0.95))) * smooth(span(s / D, 0.004, 0.03));
	for (const { s, pts } of Cn.rings) {
		const al = 0.55 * grow * vis(s) * alpha;
		if (al > 0.012) poly3(ink, cam, null, pts, al, 1.1, Oc);
	}
	for (const pts of Cn.spokes)
		for (let i = 1; i < pts.length; i++) {
			const s = Math.hypot(...sub3(pts[i], N));
			const al = 0.4 * grow * vis(s) * alpha;
			if (al > 0.012) seg3(ink, cam, null, pts[i - 1], pts[i], al, 1, Oc);
		}
	ink.flush(ctx);
}

// ── The beat's parameters ────────────────────────────────────────────────────
// Where each stage sits in the structure beat's own progress u, 0…1.
export const STAGE = {
	write: [0, 0.08], // the lattice written out from the origin (the flow has it: write = 1)
	cell: [0.03, 0.1], // the cell drawn round the origin, its marks
	roll: [0.1, 0.3],
	bend: [0.3, 0.52],
	turn: [0.56, 0.72],
	fold: [0.72, 0.8], // pillow: the lid
	zip: [0.78, 0.86], // pillow: the rims pinched
	morph: [0.72, 0.86], // quartic: the torus gives way to the quartic
	cone: [0.82, 0.92],
	dive: [0.88, 1]
};
// The structure's state at u, for `structure()`: every parameter a pure
// function of u. `turn` is in radians, 0…π.
export function paramsAt(u, variant = 'pillow') {
	const S = STAGE;
	const sm = (k) => smooth(span(u, S[k][0], S[k][1]));
	const P = {
		variant,
		write: sm('write'),
		cell: sm('cell'),
		roll: sm('roll'),
		bend: sm('bend'),
		turn: Math.PI * sm('turn'),
		lit: smooth(span(u, S.turn[0] - 0.05, S.turn[0])),
		pairs:
			smooth(span(u, S.turn[0] - 0.03, S.turn[0])) *
			(1 - smooth(span(u, S.turn[1], S.turn[1] + 0.04))),
		fold: 0,
		zip: 0,
		morph: 0,
		cone: sm('cone'),
		dive: span(u, S.dive[0], S.dive[1])
	};
	if (variant === 'quartic') P.morph = sm('morph');
	else {
		P.fold = sm('fold');
		P.zip = sm('zip');
	}
	return P;
}

// ── The geometry for a board, and the lens ───────────────────────────────────
// What the camera path needs: the lattice's pitch on the board at u = 0
// (`cellPx`) and where the origin sits (`origin`, screen px), so the first
// frame IS the flat lattice at that pitch, straight down; the torus; the node
// the lens dives at and its axis (for the quartic, `quartic.dive` from
// makeQuartic).
export function geometry(
	tau,
	{ w, h, cellPx = null, origin = null, fov = 40, variant = 'pillow', quartic = null } = {}
) {
	const px = cellPx ?? Math.round(Math.min(w / 24, h / 15));
	const o = origin ?? [w / 2, h / 2];
	const T = torusOf(tau);
	const D0 = pxPerUnit(h, fov) / px;
	const T0 = [(w / 2 - o[0]) / px, 0, (h / 2 - o[1]) / px];
	// The plane's extent in (a, b), from the screen's corners with a margin.
	const re0 = -o[0] / px;
	const re1 = (w - o[0]) / px;
	const im0 = (o[1] - h) / px;
	const im1 = o[1] / px;
	const b0 = Math.floor(im0 / tau[1]) - 1;
	const b1 = Math.ceil(im1 / tau[1]) + 1;
	const sh = Math.abs(tau[0]) * Math.max(Math.abs(b0), Math.abs(b1));
	const ext = { a: [Math.floor(re0 - sh) - 1, Math.ceil(re1 + sh) + 1], b: [b0, b1] };
	// The lens's targets: the cell flat, the tube, the torus.
	const cellC = flat(tau, 0.5, 0.5);
	let tubeC = [0, 0, 0];
	const Ft = fold(tau, 1, 0);
	for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) tubeC = add3(tubeC, Ft(i / 8, j / 8));
	tubeC = mul3(tubeC, 1 / 81);
	// The node, and the line the lens flies in along.
	let N;
	let dir;
	if (variant === 'quartic' && quartic) {
		N = quartic.nodes[quartic.dive];
		dir = norm(sub3(N, T.C));
	} else {
		N = T.nodes[0];
		const az = Math.PI / 2 - 0.42;
		const el = 0.16;
		dir = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
	}
	const azN = Math.atan2(dir[0], dir[2]);
	const elN = Math.asin(Math.max(-1, Math.min(1, dir[1])));
	return {
		w,
		h,
		cellPx: px,
		origin: o,
		fov,
		D0,
		T0,
		ext,
		T,
		cellC,
		tubeC,
		N,
		dir,
		azN,
		elN,
		Dstart: 1.05,
		Dend: 0.0015
	};
}

// The lens over the structure beat: straight down on the plane at the
// lattice's pitch, lifting and coming round as the cell rolls, the torus
// side-on with its skewer across the frame, the turn watched, then on to the
// node's line and in — the distance to the apex shrinking exponentially, so
// the tunnel's rings pass at one rhythm, from a rate that joins the orbit's
// and only grows.
export function cameraAt(u, G) {
	const S = STAGE;
	const d0 = S.dive[0];
	const mid = (S.roll[0] + S.roll[1]) / 2;
	const K_AZ = [
		[0, 0],
		[S.roll[0] * 0.3, 0],
		[mid, 0.2],
		[S.roll[1], 0.55],
		[S.bend[1], 0.12],
		[S.turn[1], 0.3],
		[d0, G.azN]
	];
	const K_EL = [
		[0, Math.PI / 2],
		[S.roll[0] * 0.3, Math.PI / 2],
		[mid, 1.22],
		[S.roll[1], 0.95],
		[S.bend[1], 0.34],
		[S.turn[1], 0.42],
		[d0, G.elN]
	];
	const K_T = [
		[0, G.T0],
		[S.roll[0] * 0.3, G.T0],
		[S.roll[0], G.cellC],
		[S.roll[1], G.tubeC],
		[S.bend[1], G.T.C],
		[S.turn[1], G.T.C],
		[d0, G.N]
	];
	const K_D = [
		[0, G.D0],
		[S.roll[0] * 0.3, G.D0],
		[mid, 5.2],
		[S.roll[1], 2.9],
		[S.bend[1], 2.5],
		[S.turn[1], 2.3],
		[d0, G.Dstart]
	];
	let az = spline(u, K_AZ);
	let el = spline(u, K_EL);
	let target = spline3(u, K_T);
	let dist = spline(u, K_D);
	let fov = G.fov;
	if (u > d0) {
		az = G.azN;
		el = G.elN;
		target = G.N;
		const x = span(u, d0, 1);
		const K = Math.log(G.Dstart / G.Dend);
		// The orbit's own log-rate at the handover, carried in so the pace only grows.
		const e = 1e-3;
		const r0 = Math.max(0, (Math.log(spline(d0 - e, K_D)) - Math.log(G.Dstart)) / e) * (1 - d0);
		const c = Math.max(0, Math.min(0.5, r0 / K));
		const g = c * x + (1 - c) * Math.pow(x, 2.4);
		dist = G.Dstart * Math.exp(-K * g);
		fov = lerp(G.fov, G.fov + 10, smooth(x));
	}
	const cam = orbit(G.w, G.h, { target, az, el, dist, fov });
	cam.dist = dist;
	cam.target = target;
	return cam;
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Segments batched by colour, alpha, width and side (hidden runs dashed), so
// thousands are a handful of strokes (flow-dodeca's makeInk, with a colour
// and a back side).
export function makeInk() {
	const B = new Map();
	return {
		seg(color, alpha, width, back, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(14, Math.round(alpha * 14));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}|${back ? 1 : 0}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 14, width: wq / 4, back, P: [] };
				B.set(key, b);
			}
			b.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.lineCap = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(b.back ? [3, 6] : []);
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
// A 3D segment into the ink: cut at the near plane, culled off the board,
// width by depth (`ref` is the depth drawn at `width`), hidden behind the
// surface in Z (faint, dashed) when Z is on; `tear` skips a segment longer
// than it in the world (a line cut by the lid).
function seg3(
	ink,
	cam,
	Z,
	a,
	b,
	alpha,
	width,
	{
		ref = 1,
		color = PAL.chalk,
		tear = 0,
		slack = 0,
		w = 1e9,
		h = 1e9,
		near = null,
		nearZ = NEAR
	} = {}
) {
	if (alpha < 0.012) return;
	if (tear > 0 && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > tear) return;
	let qa = cam.project(a);
	let qb = cam.project(b);
	if (qa[2] <= nearZ && qb[2] <= nearZ) return;
	if (qa[2] <= nearZ || qb[2] <= nearZ) {
		const t = (qa[2] - nearZ) / (qa[2] - qb[2]);
		const c = cam.project(lerp3(a, b, t));
		if (qa[2] <= nearZ) qa = c;
		else qb = c;
	}
	const m = 40;
	if ((qa[0] < -m && qb[0] < -m) || (qa[0] > w + m && qb[0] > w + m)) return;
	if ((qa[1] < -m && qb[1] < -m) || (qa[1] > h + m && qb[1] > h + m)) return;
	const mz = (qa[2] + qb[2]) / 2;
	if (near) {
		alpha *= smooth(span(mz, near[0], near[1]));
		if (alpha < 0.012) return;
	}
	const ws = Math.min(2.6, Math.max(0.55, ref / mz));
	const back = Z && Z.on && Z.hidden([(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, mz - slack]);
	ink.seg(
		color,
		alpha * (back ? 0.3 : 1),
		width * ws * (back ? 0.62 : 1),
		back,
		qa[0],
		qa[1],
		qb[0],
		qb[1]
	);
}
function poly3(ink, cam, Z, pts, alpha, width, o) {
	for (let i = 1; i < pts.length; i++) seg3(ink, cam, Z, pts[i - 1], pts[i], alpha, width, o);
}
// A lit point in 3D, dimmed when the surface in Z is in front of it
// (log-abelian's litHid).
function litHid(ctx, cam, Z, P, r, a = 1, slack = 0) {
	if (a <= 0 || r <= 0) return;
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const hid = Z && Z.on && Z.hidden([q[0], q[1], q[2] - slack]);
	lit3(ctx, cam, P, r * (hid ? 0.8 : 1), a * (hid ? 0.28 : 1));
}
// Discs batched by alpha: one fill per alpha.
function makeDots() {
	const B = new Map();
	return {
		dot(x, y, r, alpha, color = PAL.chalk) {
			if (alpha < 0.012 || r <= 0) return;
			const a = Math.min(14, Math.round(alpha * 14));
			const key = `${color}|${a}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 14, P: [] };
				B.set(key, b);
			}
			b.P.push(x, y, r);
		},
		flush(ctx) {
			ctx.save();
			for (const b of B.values()) {
				ctx.fillStyle = b.color;
				ctx.globalAlpha = b.alpha;
				ctx.beginPath();
				const P = b.P;
				for (let i = 0; i < P.length; i += 3) {
					ctx.moveTo(P[i] + P[i + 2], P[i + 1]);
					ctx.arc(P[i], P[i + 1], P[i + 2], 0, TAU);
				}
				ctx.fill();
			}
			ctx.restore();
			B.clear();
		}
	};
}

// ── The structure, drawn ─────────────────────────────────────────────────────
const NA = 48; // the cell's surface: samples along a line of the cell
const NB = 36;
const NG = 8; // the cell's inner grid
const SLACK = 0.012;
// Sample points of the cell whose pairs are drawn converging in the turn.
export const PAIRS = [
	[0.22, 0.14],
	[0.68, 0.36],
	[0.14, 0.62],
	[0.58, 0.82],
	[0.4, 0.46],
	[0.84, 0.7]
];

// `makeStructure` holds what a frame reuses: the depth buffer, the ink, the
// torus, and (for the quartic) the surface. draw(ctx, w, h, P): P is
// paramsAt(u)'s state plus `cam` (cameraAt) and `G` (geometry); `alpha`
// scales the whole thing, `ref` the depth drawn at a line's base width
// (default: the lens's distance to its target).
export function makeStructure({
	tau = DEMO_TAU,
	variant = 'pillow',
	depth = 4,
	fold: fo = {}
} = {}) {
	const Z = makeDepth(depth);
	const T = torusOf(tau, fo);
	const Q = variant === 'quartic' ? makeQuartic(T) : null;
	const ink = makeInk();
	const dots = makeDots();
	const grid = [];
	for (let i = 0; i <= NB; i++) grid.push(new Array(NA + 1));

	function draw(ctx, w, h, P) {
		const {
			cam,
			G,
			write = 1,
			cell = 1,
			roll = 0,
			bend = 0,
			turn = 0,
			lit = 0,
			pairs = 0,
			fold: f = 0,
			zip = 0,
			morph = 0,
			cone: cn = 0,
			dive = 0,
			origin = 1,
			alpha = 1
		} = P;
		const ref = P.ref ?? Math.hypot(...sub3(cam.pos, cam.target ?? G.T.C));
		const place = placer(T, { roll, bend, turn, fold: f, zip }, fo);
		const O = { ref, w, h, slack: SLACK, tear: f > 0 ? 0.2 : 0, near: [0.04, 0.16] };
		const tor = 1 - morph; // the torus's own alpha (the quartic takes over)

		// The depth buffer: the cell's surface, once it leaves the board.
		const curved = roll > 0.004 || turn > 0 || f > 0;
		if (curved || (Q && morph > 0)) Z.reset(w, h);
		else Z.off();
		if (curved) {
			for (let i = 0; i <= NB; i++)
				for (let j = 0; j <= NA; j++) grid[i][j] = place(j / NA, i / NB);
			if (tor > 0.02) Z.grid(cam, grid);
		}
		if (Q && morph > 0) {
			const M = Q.mesh;
			for (let i = 0; i < M.length; i += 9)
				Z.tri(
					cam.project([M[i], M[i + 1], M[i + 2]]),
					cam.project([M[i + 3], M[i + 4], M[i + 5]]),
					cam.project([M[i + 6], M[i + 7], M[i + 8]])
				);
		}

		// The plane: the lattice's two families across the board, flat, and
		// its points; written out from the origin by `write`; the far lines go
		// first as the roll begins.
		const plane = (1 - smooth(span(roll, 0.2, 0.75))) * alpha;
		const front = write < 1 ? 1.5 + 26 * write : Infinity;
		const [a0, a1] = G.ext.a;
		const [b0, b1] = G.ext.b;
		const absT = Math.hypot(tau[0], tau[1]);
		if (plane > 0.01) {
			const off = (n, lo, hi) => (n < lo ? lo - n : n > hi ? n - hi : 0);
			const fade = (d) => Math.exp(-2.5 * roll * d);
			// A plane line: one segment flat; in pieces of a cell, tested against
			// the cell's surface, once the cell has lifted off the board.
			const planeLine = (pa, pb, al) => {
				if (!curved) return seg3(ink, cam, null, pa, pb, al, 1.2, O);
				const n = Math.max(1, Math.ceil(Math.hypot(pa[0] - pb[0], pa[2] - pb[2])));
				let prev = pa;
				for (let i = 1; i <= n; i++) {
					const q = lerp3(pa, pb, i / n);
					seg3(ink, cam, Z, prev, q, al, 1.2, O);
					prev = q;
				}
			};
			for (let n = b0; n <= b1; n++) {
				const al = 0.24 * plane * fade(off(n, 0, 1));
				if (al < 0.012) continue;
				const y = n * tau[1];
				const hw = Math.sqrt(Math.max(0, front * front - y * y));
				if (!(hw > 0)) continue;
				const lo = Math.max(a0, -hw - n * tau[0]);
				const hi = Math.min(a1, hw - n * tau[0]);
				if (lo < hi) planeLine(flat(tau, lo, n), flat(tau, hi, n), al);
			}
			for (let n = a0; n <= a1; n++) {
				const al = 0.24 * plane * fade(off(n, 0, 1));
				if (al < 0.012) continue;
				// |n + bτ| < front: a quadratic in b.
				let lo = b0;
				let hi = b1;
				if (front < Infinity) {
					const A = absT * absT;
					const Bq = 2 * n * tau[0];
					const Cq = n * n - front * front;
					const disc = Bq * Bq - 4 * A * Cq;
					if (disc <= 0) continue;
					lo = Math.max(lo, (-Bq - Math.sqrt(disc)) / (2 * A));
					hi = Math.min(hi, (-Bq + Math.sqrt(disc)) / (2 * A));
				}
				if (lo < hi) planeLine(flat(tau, n, lo), flat(tau, n, hi), al);
			}
			// The points, as discs; the cell's corners are drawn with the cell.
			const pr = 0.05 * G.cellPx;
			for (let m = a0; m <= a1; m++)
				for (let n = b0; n <= b1; n++) {
					if ((m === 0 || m === 1) && (n === 0 || n === 1)) continue;
					const z = toZ(tau, m, n);
					if (Math.hypot(z[0], z[1]) > front) continue;
					const q = cam.project(flat(tau, m, n));
					if (q[2] <= NEAR || q[0] < -8 || q[0] > w + 8 || q[1] < -8 || q[1] > h + 8) continue;
					const al = 0.5 * plane * fade(off(m, 0, 1) + off(n, 0, 1));
					dots.dot(q[0], q[1], pr * Math.min(2.6, Math.max(0.55, ref / q[2])), al);
				}
		}

		// The cell: its inner grid, its border, its gluing marks — carried
		// through the fold, the turn, the lid and the pinch.
		const cz = curved ? Z : null;
		const onCell = cell * alpha * tor;
		if (onCell > 0.01) {
			const inner = smooth(span(roll, 0, 0.25)) * onCell;
			if (inner > 0.01)
				for (let i = 1; i < NG; i++) {
					const A = [];
					const B = [];
					for (let j = 0; j <= NA; j++) {
						A.push(place(i / NG, j / NA));
						B.push(place(j / NA, i / NG));
					}
					const half = i * 2 === NG;
					poly3(ink, cam, cz, A, (half ? 0.42 : 0.28) * inner, half ? 1.3 : 1, O);
					poly3(ink, cam, cz, B, (half ? 0.42 : 0.28) * inner, half ? 1.3 : 1, O);
				}
			const healed = smooth(span(bend, 0.8, 1));
			const edge = (fn, upto) => {
				if (upto <= 0) return;
				const pts = [];
				const n = Math.ceil(NA * upto);
				for (let j = 0; j <= n; j++) pts.push(fn(Math.min(1, j / NA)));
				if (upto < 1) pts.push(fn(upto));
				poly3(ink, cam, cz, pts, lerp(0.95, 0.6, healed) * onCell, lerp(2.2, 1.5, healed), O);
			};
			edge((t) => place(t, 0), span(cell, 0, 0.25));
			edge((t) => place(1, t), span(cell, 0.25, 0.5));
			edge((t) => place(1 - t, 1), span(cell, 0.5, 0.75));
			edge((t) => place(0, 1 - t), span(cell, 0.75, 1));
			// Chevrons: one on each τ-side, pointing +b; two on each 1-side,
			// pointing +a (log-entry's sizes, so the marks carry over).
			const marks = smooth(span(cell, 0.7, 1)) * onCell;
			if (marks > 0.01) {
				const ea = 0.11;
				const eb = 0.14;
				const chev = (pts) => poly3(ink, cam, cz, pts, 0.9 * marks, 2, O);
				for (const x0 of [0, 1])
					chev([place(x0 - ea, 0.5 - eb), place(x0, 0.5), place(x0 + ea, 0.5 - eb)]);
				for (const y0 of [0, 1])
					for (const s of [-0.1, 0.1])
						chev([place(0.5 + s - eb, y0 - ea), place(0.5 + s, y0), place(0.5 + s - eb, y0 + ea)]);
			}
		}

		// The pairs: sample points riding the turn, each with a chord to the
		// place its mirror rests — which is where the turn by π lands it.
		if (pairs > 0.01 && tor > 0.01) {
			const rest = placer(T, { roll, bend, turn: 0, fold: 0, zip: 0 }, fo);
			const k = pairs * alpha * tor;
			for (const [a, b] of PAIRS) {
				const p = place(a, b);
				const m = rest(...pair([a, b]));
				seg3(ink, cam, cz, p, m, 0.5 * k, 1, { ...O, tear: 0 });
			}
		}

		// The quartic, in the torus's stead: its contours written on bottom to
		// top as the torus goes.
		if (Q && morph > 0.01) {
			const q0 = alpha;
			for (let k = 0; k < Q.slices.length; k++) {
				const on = smooth(
					span(morph, (0.6 * k) / Q.slices.length, 0.4 + (0.6 * k) / Q.slices.length)
				);
				if (on <= 0.01) continue;
				const S = Q.slices[k];
				for (let s = 0; s < S.length; s += 6)
					seg3(
						ink,
						cam,
						Z,
						[S[s], S[s + 1], S[s + 2]],
						[S[s + 3], S[s + 4], S[s + 5]],
						0.7 * on * q0,
						1.25,
						{
							...O,
							slack: Q.slack
						}
					);
			}
		}
		ink.flush(ctx);

		// The cone at the node, over everything: its rings and generatrices,
		// faint far off, fading as they pass the lens.
		if (cn > 0.01) {
			const D = cam.dist ?? Math.hypot(...sub3(cam.pos, G.N));
			drawCone(ctx, cam, G.N, G.dir, { D, w, h, size: cn, grow: smooth(span(cn, 0, 1)), alpha });
		}

		// The points: the lattice's, the cell's corners (all the origin), the
		// four half-points — lit gold as the fixed points of the turn — and the
		// quartic's sixteen.
		dots.flush(ctx);
		const ws = (q) => Math.min(2.6, Math.max(0.55, ref / q[2]));
		if (onCell > 0.01) {
			for (const [a, b] of [
				[1, 0],
				[1, 1],
				[0, 1]
			]) {
				const p = place(a, b);
				const q = cam.project(p);
				if (q[2] > NEAR) {
					const hid = cz && cz.hidden([q[0], q[1], q[2] - SLACK]);
					disc(ctx, q[0], q[1], 0.06 * G.cellPx * ws(q), {
						fill: PAL.chalk,
						alpha: 0.9 * onCell * (hid ? 0.3 : 1)
					});
				}
			}
			// The half-points other than the origin: marked faintly, then lit.
			for (let i = 1; i < 4; i++) {
				const p = place(...HALF[i]);
				const q = cam.project(p);
				if (q[2] <= NEAR) continue;
				const hid = cz && cz.hidden([q[0], q[1], q[2] - SLACK]);
				const r = 0.045 * G.cellPx * ws(q);
				disc(ctx, q[0], q[1], r, {
					fill: PAL.chalkDim,
					alpha: 0.7 * onCell * (1 - lit) * (hid ? 0.3 : 1),
					ring: PAL.chalk,
					ringWidth: 1
				});
				if (lit > 0) litHid(ctx, cam, cz, p, (4.5 + 1.5 * lit) * ws(q), lit * onCell, SLACK);
			}
		}
		if (pairs > 0.01 && tor > 0.01) {
			const rest = placer(T, { roll, bend, turn: 0, fold: 0, zip: 0 }, fo);
			for (const [a, b] of PAIRS) {
				const q = cam.project(place(a, b));
				const m = cam.project(rest(...pair([a, b])));
				if (q[2] > NEAR)
					disc(ctx, q[0], q[1], 3 * ws(q), { fill: PAL.chalk, alpha: 0.9 * pairs * alpha });
				if (m[2] > NEAR)
					disc(ctx, m[0], m[1], 3 * ws(m), {
						fill: 'rgba(0,0,0,0)',
						alpha: 0.7 * pairs * alpha,
						ring: PAL.chalk,
						ringWidth: 1
					});
			}
		}
		if (Q && morph > 0.01) {
			Q.nodes.forEach((p, i) => {
				const on = smooth(span(morph, 0.3 + (0.6 * i) / 16, 0.4 + (0.6 * i) / 16));
				if (on <= 0) return;
				const q = cam.project(p);
				if (q[2] <= NEAR) return;
				litHid(ctx, cam, Z, p, (i === Q.dive ? 5.5 : 4) * ws(q), on * alpha, Q.slack);
			});
		}
		// The origin: the terminal's full stop, lit, the node the lens flies
		// into; its light growing as the lens nears.
		const N = G.N;
		const isQ = Q && morph > 0.01;
		const oa = isQ ? alpha * smooth(span(morph, 0.3, 0.4)) : origin * alpha * (cell > 0 ? 1 : 0);
		if (oa > 0.01) {
			const q = cam.project(isQ ? N : place(0, 0));
			if (q[2] > NEAR) {
				const near = smooth(span(dive, 0.3, 1));
				const r = (5.5 + 2 * lit) * ws(q) * (1 + 5 * near);
				litHid(
					ctx,
					cam,
					isQ ? Z : cz,
					isQ ? N : place(0, 0),
					Math.min(r, 0.25 * h),
					oa,
					isQ ? Q.slack : SLACK
				);
			}
		}
	}

	return { draw, T, Q, Z, tau, variant };
}

// One call: the structure at a state. Makes and keeps a structure per
// variant and τ; P as makeStructure's draw takes it, and if `cam` or `G` is
// missing they are made from P.u (the beat's progress) and the board.
const KEPT = new Map();
export function structure(ctx, w, h, P) {
	const tau = P.tau ?? DEMO_TAU;
	const variant = P.variant ?? 'pillow';
	const key = `${variant}|${tau[0]}|${tau[1]}`;
	let S = KEPT.get(key);
	if (!S) {
		S = makeStructure({ tau, variant });
		S.G = null;
		KEPT.set(key, S);
	}
	let G = P.G;
	if (!G) {
		if (!S.G || S.G.w !== w || S.G.h !== h || S.G.cellPx !== (P.cellPx ?? S.G.cellPx))
			S.G = geometry(tau, { w, h, cellPx: P.cellPx, origin: P.origin, variant, quartic: S.Q });
		G = S.G;
	}
	const u = P.u ?? 0;
	const Q = { ...paramsAt(u, variant), ...P, G, cam: P.cam ?? cameraAt(u, G) };
	S.draw(ctx, w, h, Q);
	return { G, cam: Q.cam, S };
}

// ── Kummer's quartic (lifted from log-abelian.js, its kummer variant) ────────
// Hudson's tetrahedroid: (x² + y² + z² − μ²)² − λ pqrs = 0, p = 1 − z − √2 x,
// q = 1 − z + √2 x, r = 1 + z + √2 y, s = 1 + z − √2 y, λ = (3μ² − 1)/(3 − μ²),
// μ = 1.3. The sixteen nodes by Newton on ∇F = 0 from a seeded grid, kept
// where F = 0 too; the contours on NSLICE planes z = const (marching squares);
// a depth mesh by marching tetrahedra; all cut at the sphere |x| = 1.65. Here
// the surface is placed in the torus's stead: its slicing axis stood up (log-
// abelian's UPW), scaled so its cut sphere is the torus's outer radius, at
// the torus's centre; `dive` is the node furthest along the skewer's +X, the
// one the lens flies into.
const MU = 1.3;
const MU2 = MU * MU;
const LAM = (3 * MU2 - 1) / (3 - MU2);
const KB = 1.65;
const NSLICE = 26; // log-abelian draws forty; the quartic is seen nearer here
const NGRID = 80;
const NTET = 22;
const kF = (x, y, z) => {
	const g = x * x + y * y + z * z - MU2;
	const A = (1 - z) * (1 - z) - 2 * x * x;
	const B = (1 + z) * (1 + z) - 2 * y * y;
	return g * g - LAM * A * B;
};
const kGrad = (x, y, z) => {
	const g = x * x + y * y + z * z - MU2;
	const A = (1 - z) * (1 - z) - 2 * x * x;
	const B = (1 + z) * (1 + z) - 2 * y * y;
	return [
		4 * x * (g + LAM * B),
		4 * y * (g + LAM * A),
		4 * z * g + 2 * LAM * ((1 - z) * B - (1 + z) * A)
	];
};
const kHess = (x, y, z) => {
	const g = x * x + y * y + z * z - MU2;
	const A = (1 - z) * (1 - z) - 2 * x * x;
	const B = (1 + z) * (1 + z) - 2 * y * y;
	const xx = 4 * (g + LAM * B) + 8 * x * x;
	const yy = 4 * (g + LAM * A) + 8 * y * y;
	const zz = 4 * g + 8 * z * z + 2 * LAM * (4 * (1 - z * z) - A - B);
	const xy = 8 * x * y * (1 - 2 * LAM);
	const xz = 4 * x * (2 * z + 2 * LAM * (1 + z));
	const yz = 4 * y * (2 * z - 2 * LAM * (1 - z));
	return [
		[xx, xy, xz],
		[xy, yy, yz],
		[xz, yz, zz]
	];
};
function solve3(M, b) {
	const [[a, b1, c], [d, e, f], [g, h, i]] = M;
	const det = a * (e * i - f * h) - b1 * (d * i - f * g) + c * (d * h - e * g);
	if (Math.abs(det) < 1e-14) return null;
	const inv = [
		[(e * i - f * h) / det, (c * h - b1 * i) / det, (b1 * f - c * e) / det],
		[(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
		[(d * h - e * g) / det, (b1 * g - a * h) / det, (a * e - b1 * d) / det]
	];
	return inv.map((r) => r[0] * b[0] + r[1] * b[1] + r[2] * b[2]);
}
function kummerNodes() {
	const nodes = [];
	const N = 9;
	const R = 2.2;
	for (let i = 0; i < N; i++)
		for (let j = 0; j < N; j++)
			for (let k = 0; k < N; k++) {
				let x = -R + (2 * R * i) / (N - 1) + 0.013;
				let y = -R + (2 * R * j) / (N - 1) + 0.007;
				let z = -R + (2 * R * k) / (N - 1) + 0.011;
				let ok = false;
				for (let it = 0; it < 60; it++) {
					const d = solve3(kHess(x, y, z), kGrad(x, y, z));
					if (!d) break;
					x -= d[0];
					y -= d[1];
					z -= d[2];
					if (Math.hypot(d[0], d[1], d[2]) < 1e-13) {
						ok = true;
						break;
					}
					if (Math.hypot(x, y, z) > 50) break;
				}
				if (!ok) continue;
				const gr = kGrad(x, y, z);
				if (Math.hypot(...gr) > 1e-8 || Math.abs(kF(x, y, z)) > 1e-8) continue;
				if (!nodes.some((n) => Math.hypot(n[0] - x, n[1] - y, n[2] - z) < 1e-5))
					nodes.push([x, y, z]);
			}
	nodes.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
	return nodes;
}
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
function squares(val, nx, ny, iso, out) {
	const W = ny + 1;
	for (let i = 0; i < nx; i++)
		for (let j = 0; j < ny; j++) {
			const a = val[i * W + j] - iso;
			const b = val[(i + 1) * W + j] - iso;
			const c = val[(i + 1) * W + j + 1] - iso;
			const d = val[i * W + j + 1] - iso;
			const idx = (a < 0 ? 1 : 0) | (b < 0 ? 2 : 0) | (c < 0 ? 4 : 0) | (d < 0 ? 8 : 0);
			if (idx === 0 || idx === 15) continue;
			const E = [
				[i + a / (a - b), j],
				[i + 1, j + b / (b - c)],
				[i + d / (d - c), j + 1],
				[i, j + a / (a - d)]
			];
			let T = MS[idx];
			if (!T) {
				const mid = (a + b + c + d) / 4 < 0;
				if (idx === 5)
					T = mid
						? [
								[3, 2],
								[0, 1]
							]
						: [
								[3, 0],
								[1, 2]
							];
				else
					T = mid
						? [
								[0, 1],
								[2, 3]
							]
						: [
								[3, 0],
								[1, 2]
							];
			}
			for (const [p, q] of T) {
				if (!Number.isFinite(E[p][0] + E[p][1] + E[q][0] + E[q][1])) continue;
				out.push(E[p][0], E[p][1], E[q][0], E[q][1]);
			}
		}
	return out;
}
function kummerSlices() {
	const slices = [];
	const W = NGRID + 1;
	const val = new Float64Array(W * W);
	for (let k = 0; k < NSLICE; k++) {
		const z = -KB + (2 * KB * (k + 0.5)) / NSLICE;
		for (let i = 0; i <= NGRID; i++)
			for (let j = 0; j <= NGRID; j++)
				val[i * W + j] = kF(-KB + (2 * KB * i) / NGRID, -KB + (2 * KB * j) / NGRID, z);
		const segs = squares(val, NGRID, NGRID, 0, []);
		const out = [];
		for (let s = 0; s < segs.length; s += 4) {
			const x0 = -KB + (2 * KB * segs[s]) / NGRID;
			const y0 = -KB + (2 * KB * segs[s + 1]) / NGRID;
			const x1 = -KB + (2 * KB * segs[s + 2]) / NGRID;
			const y1 = -KB + (2 * KB * segs[s + 3]) / NGRID;
			if (Math.hypot(x0, y0, z) > KB || Math.hypot(x1, y1, z) > KB) continue;
			out.push(x0, y0, z, x1, y1, z);
		}
		slices.push(new Float32Array(out));
	}
	return slices;
}
function kummerMesh() {
	const n = NTET;
	const W = n + 1;
	const V = new Float64Array(W * W * W);
	const at = (i, j, k) => (i * W + j) * W + k;
	const co = (i) => -KB + (2 * KB * i) / n;
	for (let i = 0; i <= n; i++)
		for (let j = 0; j <= n; j++)
			for (let k = 0; k <= n; k++) V[at(i, j, k)] = kF(co(i), co(j), co(k));
	const TET = [
		[0, 1, 3, 7],
		[0, 1, 5, 7],
		[0, 2, 3, 7],
		[0, 2, 6, 7],
		[0, 4, 5, 7],
		[0, 4, 6, 7]
	];
	const OFF = [
		[0, 0, 0],
		[1, 0, 0],
		[0, 1, 0],
		[1, 1, 0],
		[0, 0, 1],
		[1, 0, 1],
		[0, 1, 1],
		[1, 1, 1]
	];
	const tris = [];
	const P = new Array(8);
	const F = new Array(8);
	const cut = (a, b) => {
		const t = F[a] / (F[a] - F[b]);
		return [
			P[a][0] + (P[b][0] - P[a][0]) * t,
			P[a][1] + (P[b][1] - P[a][1]) * t,
			P[a][2] + (P[b][2] - P[a][2]) * t
		];
	};
	const push = (a, b, c) => {
		const cx = (a[0] + b[0] + c[0]) / 3;
		const cy = (a[1] + b[1] + c[1]) / 3;
		const cz = (a[2] + b[2] + c[2]) / 3;
		if (Math.hypot(cx, cy, cz) > KB * 1.03) return;
		tris.push(...a, ...b, ...c);
	};
	for (let i = 0; i < n; i++)
		for (let j = 0; j < n; j++)
			for (let k = 0; k < n; k++) {
				for (let c = 0; c < 8; c++) {
					const [di, dj, dk] = OFF[c];
					P[c] = [co(i + di), co(j + dj), co(k + dk)];
					F[c] = V[at(i + di, j + dj, k + dk)];
				}
				for (const t of TET) {
					const neg = t.filter((c) => F[c] < 0);
					const pos = t.filter((c) => F[c] >= 0);
					if (neg.length === 0 || pos.length === 0) continue;
					if (neg.length === 1 || pos.length === 1) {
						const [o] = neg.length === 1 ? neg : pos;
						const rest = neg.length === 1 ? pos : neg;
						push(cut(o, rest[0]), cut(o, rest[1]), cut(o, rest[2]));
					} else {
						const [A, B] = neg;
						const [C, D] = pos;
						const ac = cut(A, C);
						const ad = cut(A, D);
						const bd = cut(B, D);
						const bc = cut(B, C);
						push(ac, ad, bd);
						push(ac, bd, bc);
					}
				}
			}
	return new Float32Array(tris);
}
// The quartic placed in the torus's stead: UPW (the slicing axis up), scaled
// and centred on T.C. Returns { nodes, slices, mesh, dive, slack, scale }.
export function makeQuartic(T) {
	const s = (T.R + T.r) / KB;
	const W = ([x, y, z]) => [T.C[0] + s * x, T.C[1] + s * z, T.C[2] - s * y];
	const arr = (a) => {
		const o = new Float32Array(a.length);
		for (let i = 0; i < a.length; i += 3) {
			const p = W([a[i], a[i + 1], a[i + 2]]);
			o[i] = p[0];
			o[i + 1] = p[1];
			o[i + 2] = p[2];
		}
		return o;
	};
	const nodes = kummerNodes().map(W);
	let dive = 0;
	nodes.forEach((p, i) => {
		if (dot(sub3(p, T.C), T.axis) > dot(sub3(nodes[dive], T.C), T.axis)) dive = i;
	});
	return {
		nodes,
		slices: kummerSlices().map(arr),
		mesh: arr(kummerMesh()),
		dive,
		slack: 0.11 * s,
		scale: s
	};
}
