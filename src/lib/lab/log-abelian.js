import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	bloom,
	PAL,
	TAU,
	span,
	smooth,
	lerp,
	clock,
	variant,
	tag,
	add3,
	sub3,
	mul3,
	dot,
	norm
} from './log/board.js';
import { NEAR, orbit, makeDepth, line3, lit3, circle3, axesOf } from './log/space.js';
import { lit } from './log/ink.js';

// ── Sketch: log-abelian — abelian varieties and the Kummer surface ───────────
// One-offs on complex tori, in ink on the board: a lattice folded into the
// elliptic curve it is the period lattice of, the theta function living on
// it, and — one dimension up — an abelian surface folded by −1 into Kummer's
// quartic with its sixteen nodes and sixteen tropes. Chalk lines, gold only
// for a lit point; no text. Every frame is a pure function of progress (?at=
// pins it). One per ?v=:
//
//   lattice  (default) Λ = ℤ + τℤ in ℂ, τ = 0.3 + 1.1i: the plane ruled by
//            the lattice's two families of lines, the lattice points, the
//            fundamental parallelogram 0, 1, 1 + τ, τ picked out, its
//            gluings marked (one chevron on the sides parallel to τ, which
//            z ∼ z + 1 glues; two on the sides parallel to 1, which z ∼ z + τ
//            glues) and its four corners lit — all four are the origin, the
//            group's identity, mod Λ. Then it FOLDS: the a-direction (z = a +
//            bτ) rolls into a circle of circumference 1, the slanted sides
//            meeting along a helical seam; the tube bends round into a torus
//            and, as it bends, untwists by Re τ — the shear that takes the
//            (1, τ) frame to the square frame of ℝ²/ℤ² — so that z + τ lands
//            on z and the two-chevron ends meet mark on mark. The four lit
//            corners become one point: ℂ/Λ IS the elliptic curve. EXACT: the
//            lattice, the cell, which side is glued to which and how, and the
//            twist. A PICTURE: the embedding (a flat torus has no C²
//            isometric embedding in ℝ³ — Nash–Kuiper's C¹ ones are fractal
//            corrugations; the tube is stretched to twice its length as it
//            bends so the torus has a hole to see through).
//   theta    θ(z; τ) = Σₙ exp(πi n² τ + 2πi n z), computed directly (|n| ≤ 8,
//            which converges past double precision for Im τ ≥ 0.7). It is
//            periodic under z + 1 and quasi-periodic under z + τ, so the
//            picture is of the INVARIANT modulus |θ(z)| e^{−π (Im z)²/Im τ},
//            which is a genuine function on the torus ℂ/Λ (checked: equal at
//            z, z + 1, z + τ). Its level lines at k/12 of its maximum (k = 1 …
//            11, written on out from the zero) on the fundamental cell in
//            bold and the cells round it faint — the same lines translated,
//            since it is periodic: rings round the zero, loops round the
//            maximum, and, for a sheared τ, lines that run right round the
//            torus — and its ONE zero in the cell, z = (1 + τ)/2, lit. Over
//            the beat τ moves along a path in the upper half-plane, −0.35 +
//            1.15i → 0.5 + 1.15i through about 0.08 + 0.7i; ℂ is held still
//            on the board, so the cell shears about 0 and the level lines and
//            the zero are seen to move with it. EXACT throughout.
//   kummer   Kummer's quartic, in Hudson's tetrahedroid form:
//            (x² + y² + z² − μ²)² − λ pqrs = 0, p = 1 − z − √2 x, q = 1 − z +
//            √2 x, r = 1 + z + √2 y, s = 1 + z − √2 y, λ = (3μ² − 1)/(3 − μ²),
//            μ = 1.3 (w = 1). Its sixteen nodes are found at start by Newton
//            on ∇F = 0 from a seeded grid of starts, kept where F = 0 too —
//            sixteen, all real (twelve on the sphere |x| = μ, four inside),
//            every start the same, so every load agrees. The sixteen TROPES
//            are the planes through six of them: every plane through three
//            nodes is tested at start, and exactly sixteen hold six (checked
//            numerically when this was written: each node is on six of them,
//            any two share two — the 16₆). A trope meets the quartic in a
//            DOUBLE conic, so it touches the surface along the conic through
//            its six nodes, which is what is drawn (fitted through the six,
//            traced in the plane). The four faces p, q, r, s = 0 are among
//            them: on p = 0, F = g², so that conic is the circle where the
//            face cuts the sphere |x| = μ. The surface is drawn as a line
//            drawing: its contours on forty planes z = const (marching
//            squares at start; z stood up on the board), cut at the sphere
//            |x| = 1.65 — the quartic is unbounded in the affine chart —
//            written on bottom to top, the near side bold and the far side
//            faint by a software depth buffer of the surface (marching
//            tetrahedra, at start), the whole turning. The nodes light one by
//            one; then the tropes' conics are drawn one by one, each with its
//            plane shown by a faint dashed circle (its cut with that sphere)
//            while it is drawn and its six nodes brightening. EXACT: the
//            surface, the nodes, the tropes and their conics.
//   sixteen  the 16₆ as an INCIDENCE PICTURE. The nodes of the Kummer surface
//            are the images of the sixteen 2-torsion points of the abelian
//            surface A = ℂ²/Λ under A → A/±1, Λ/2Λ ≅ (ℤ/2)⁴, here a 4 × 4
//            array of lit points, (ℤ/2)² × (ℤ/2)², in four 2 × 2 blocks. In
//            Hudson's arrangement the trope belonging to a node holds the
//            six nodes in that node's row and column, less the node itself —
//            Kummer's 16₆: sixteen tropes of six nodes, each node on six
//            tropes, any two tropes sharing two nodes, any two nodes on two
//            tropes. That rule makes a (16, 6, 2) biplane, and there are three;
//            that it is KUMMER'S was checked numerically when this was
//            written: the nodes and tropes of the kummer variant's own surface
//            map onto this 4 × 4 picture, every trope onto a row-and-column
//            block. Each trope is drawn as the two strands of its row and its
//            column, cut by a ring round its own node, the strands of a row
//            laid side by side so that at every node six strands pass through
//            and two are cut. Drawn in one by one in ink. The LAYOUT is a
//            picture (which grid cell is which half-period is a choice); the
//            incidence is exact.
//
// Eleven seconds each. About 11 ms a frame on average headless at 1280 × 800
// at worst (theta, which sums its 65 × 65 grid of theta series every frame;
// its worst single frame 20 ms); kummer about 7, lattice 3, sixteen under 1.

const SECONDS = 11;

export default async function make({ at }) {
	const v = variant(['lattice', 'theta', 'kummer', 'sixteen']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const Z = makeDepth();
	const S = { lattice: latticeSetup, theta: thetaSetup, kummer: kummerSetup, sixteen: () => ({}) }[
		v
	]();
	const draw = { lattice, theta, kummer, sixteen }[v];

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, S, Z);
		tag(ctx, w, h, `log-abelian · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Shared: marching squares, batched ink, a lit point that can be hidden ────
// The segments of the level `iso` of a grid `val[(i * (ny + 1)) + j]`,
// nx × ny cells, as [i0, j0, i1, j1] in grid units; ambiguous cells (5, 10)
// split by the centre's value.
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
			// the crossing on each edge: 0 bottom (a→b), 1 right (b→c), 2 top (d→c), 3 left (a→d)
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

// Segments batched by colour, alpha and width, so thousands are a handful of
// strokes (log-universe's ink).
function makeInk() {
	const B = new Map();
	return {
		seg(color, alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.015) return;
			const a = Math.min(14, Math.round(alpha * 14));
			const wq = Math.max(1, Math.round(width * 4));
			const key = `${color}|${a}|${wq}`;
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 14, width: wq / 4, P: [] };
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

// A lit point in 3D, dimmed when the surface in Z is in front of it.
function litHid(ctx, cam, Z, P, r, a = 1, slack = 0) {
	if (a <= 0 || r <= 0) return;
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const hid = Z.on && Z.hidden([q[0], q[1], q[2] - slack]);
	lit3(ctx, cam, P, r * (hid ? 0.8 : 1), a * (hid ? 0.28 : 1));
}

// ── lattice: Λ = ℤ + τℤ folded into ℂ/Λ ──────────────────────────────────────
// World: X = Re z, Y up (off the board), Z = −Im z, so from straight above
// the board reads as ℂ. The fold, in (a, b) with z = a + bτ: the roll bends
// the x-direction about an axis parallel to Im with curvature k (0 flat,
// 2π closed: a circle of circumference 1 — the sides a = 0 and a = 1 meet,
// since x differs by exactly 1 along b = const); the bend curls the tube's
// axis (along Z) into a circle of radius L/φ, φ from 0 to 2π, the tube's
// length L stretched to TWICE Im τ on the way (the picture's licence); and
// with the bend the cross-section angle loses b · Re τ · φ/2π, the untwist
// that straightens the helical seam and brings b = 1 onto b = 0 at the same
// angle — which is what z ∼ z + τ asks.
const TAU_L = [0.3, 1.1];
const XC = 0.65; // Re z the roll closes under
const STRETCH = 2;
function foldMap(k, phi) {
	const sphi = phi / TAU;
	const L = TAU_L[1] * (1 + (STRETCH - 1) * sphi);
	return (a, b) => {
		const x = a + b * TAU_L[0] * (1 - sphi) - XC;
		const y = b * TAU_L[1];
		if (k < 1e-4) return [x + XC, 0, -y];
		const cx = Math.sin(k * x) / k;
		const cy = (1 - Math.cos(k * x)) / k;
		if (phi < 1e-4) return [XC + cx, cy, -y];
		const Rb = L / phi;
		const psi = b * phi;
		return [XC - Rb + (Rb + cx) * Math.cos(psi), cy, -(Rb + cx) * Math.sin(psi)];
	};
}
const NA = 48;
const NB = 36;
function latticeSetup() {
	// The two families of lattice lines on the flat board, sampled so a
	// front can write them on; and the lattice points.
	const lines = [];
	const flat = (x, y) => [x, 0, -y];
	for (let n = -5; n <= 6; n++) {
		const h = [];
		const s = [];
		for (let i = 0; i <= 40; i++) {
			const t = -5 + (11 * i) / 40;
			h.push(flat(t + n * TAU_L[0], n * TAU_L[1]));
			s.push(flat(n + t * TAU_L[0], t * TAU_L[1]));
		}
		lines.push(h, s);
	}
	const points = [];
	for (let m = -5; m <= 6; m++)
		for (let n = -5; n <= 6; n++) {
			if ((m === 0 || m === 1) && (n === 0 || n === 1)) continue;
			points.push(flat(m + n * TAU_L[0], n * TAU_L[1]));
		}
	return { lines, points };
}
function lattice(ctx, w, h, u, S, Z) {
	const k = TAU * smooth(span(u, 0.34, 0.6));
	const phi = TAU * smooth(span(u, 0.6, 0.86));
	const P = foldMap(k, phi);

	// The cell's surface, for the depth buffer and the lens's target.
	const grid = [];
	let cen = [0, 0, 0];
	for (let i = 0; i <= NB; i++) {
		const row = [];
		for (let j = 0; j <= NA; j++) {
			const p = P(j / NA, i / NB);
			row.push(p);
			cen = add3(cen, p);
		}
		grid.push(row);
	}
	cen = mul3(cen, 1 / ((NA + 1) * (NB + 1)));

	const look = smooth(span(u, 0.3, 0.8));
	const cam = orbit(w, h, {
		target: cen,
		az: 2.1 * Math.pow(span(u, 0.3, 1), 1.7),
		el: lerp(Math.PI / 2 - 0.002, 0.44, look),
		dist: 6.4 * Math.exp(-1.2 * smooth(span(u, 0.26, 0.84))),
		fov: 40
	});
	const ref = cam.pos ? Math.hypot(...sub3(cam.pos, cen)) : 6;
	if (k > 0.02) (Z.reset(w, h), Z.grid(cam, grid));
	else Z.off();

	// The plane: written on by a front out of the origin, gone as the fold begins.
	const plane = 1 - smooth(span(u, 0.28, 0.4));
	const front = 7 * smooth(span(u, 0, 0.22));
	if (plane > 0) {
		const fade = (p) => span(front - Math.hypot(p[0], p[2]), 0, 0.5);
		for (const L of S.lines)
			line3(ctx, cam, L, { color: PAL.chalk, width: 1, alpha: 0.28 * plane, ref }, { fade });
		for (const p of S.points) {
			const q = cam.project(p);
			if (q[2] > NEAR)
				disc(ctx, q[0], q[1], 2.4, { fill: PAL.chalk, alpha: 0.75 * plane * fade(p) });
		}
	}

	// The cell: its inner grid (from the fold's approach), its border, the
	// gluing marks, all carried by the fold.
	const inner = smooth(span(u, 0.24, 0.34));
	const on = { depth: k > 0.02 ? Z : null };
	if (inner > 0)
		for (let i = 1; i < 8; i++) {
			const A = [];
			const B = [];
			for (let j = 0; j <= NA; j++) {
				A.push(P(i / 8, j / NA));
				B.push(P(j / NA, i / 8));
			}
			line3(ctx, cam, A, { color: PAL.chalk, width: 1, alpha: 0.3 * inner, ref }, on);
			line3(ctx, cam, B, { color: PAL.chalk, width: 1, alpha: 0.3 * inner, ref }, on);
		}
	const cell = span(u, 0.1, 0.24);
	const edge = (f, upto) => {
		if (upto <= 0) return;
		const pts = [];
		for (let j = 0; j <= NA; j++) pts.push(f(j / NA));
		line3(
			ctx,
			cam,
			pts,
			{ color: PAL.chalk, width: 2.3, alpha: 0.95, ref },
			{ ...on, fade: upto < 1 ? (p, i) => (i / NA < upto ? 1 : 0) : null }
		);
	};
	edge((t) => P(t, 0), span(cell, 0, 0.25));
	edge((t) => P(1, t), span(cell, 0.25, 0.5));
	edge((t) => P(1 - t, 1), span(cell, 0.5, 0.75));
	edge((t) => P(0, 1 - t), span(cell, 0.75, 1));
	// Chevrons: one on each τ-side, pointing +b; two on each 1-side, pointing +a.
	const marks = smooth(span(u, 0.22, 0.3));
	if (marks > 0) {
		const chev = (pts) =>
			line3(ctx, cam, pts, { color: PAL.chalk, width: 2, alpha: 0.9 * marks, ref }, on);
		const ea = 0.035;
		const eb = 0.045;
		for (const a0 of [0, 1]) chev([P(a0 - ea, 0.5 - eb), P(a0, 0.5), P(a0 + ea, 0.5 - eb)]);
		for (const b0 of [0, 1])
			for (const s of [-0.035, 0.035])
				chev([P(0.5 + s - eb, b0 - ea), P(0.5 + s, b0), P(0.5 + s - eb, b0 + ea)]);
	}

	// The four corners, all the origin mod Λ, lit — and one point at the end.
	const litA = span(u, 0.2, 0.28);
	for (const [a, bb] of [
		[0, 0],
		[1, 0],
		[0, 1],
		[1, 1]
	])
		litHid(ctx, cam, Z, P(a, bb), 5, litA, 0.02);
}

// ── theta: θ(z; τ) on the torus ──────────────────────────────────────────────
const TG = 64; // the cell's grid
const TN = 8; // terms |n| ≤ TN
const LEVELS = 12; // levels at k/LEVELS of the modulus's maximum, k = 1 … LEVELS − 1
const T_CENTRE = [0.54, 0.47]; // the board's centre, in ℂ: the zero's path is round it
function thetaSetup() {
	const W = TG + 1;
	return {
		val: new Float64Array(W * W),
		ea: new Float64Array((2 * TN + 1) * W * 2),
		eb: new Float64Array((2 * TN + 1) * W * 2)
	};
}
// τ's path in the upper half-plane: a pure function of progress.
function tauOf(u) {
	const s = smooth(span(u, 0.3, 0.97));
	return [-0.35 + 0.85 * s, 1.15 - 0.45 * Math.sin(Math.PI * s)];
}
// The invariant modulus on the (a, b) grid, |θ(a + bτ)| e^{−π b² Im τ} (Im z
// = b Im τ, so π (Im z)²/Im τ = π b² Im τ), by the separable factors
// e^{2πi n a} and e^{2πi n b τ}. Returns its maximum.
function thetaGrid(S, tau) {
	const W = TG + 1;
	const { val, ea, eb } = S;
	for (let n = -TN; n <= TN; n++) {
		const row = (n + TN) * W * 2;
		for (let i = 0; i <= TG; i++) {
			const a = i / TG;
			ea[row + 2 * i] = Math.cos(TAU * n * a);
			ea[row + 2 * i + 1] = Math.sin(TAU * n * a);
			const b = i / TG;
			const m = Math.exp(-TAU * n * b * tau[1]);
			eb[row + 2 * i] = m * Math.cos(TAU * n * b * tau[0]);
			eb[row + 2 * i + 1] = m * Math.sin(TAU * n * b * tau[0]);
		}
	}
	const cr = [];
	const ci = [];
	for (let n = -TN; n <= TN; n++) {
		const m = Math.exp(-Math.PI * n * n * tau[1]);
		cr.push(m * Math.cos(Math.PI * n * n * tau[0]));
		ci.push(m * Math.sin(Math.PI * n * n * tau[0]));
	}
	let top = -Infinity;
	for (let i = 0; i <= TG; i++)
		for (let j = 0; j <= TG; j++) {
			let re = 0;
			let im = 0;
			for (let n = -TN; n <= TN; n++) {
				const row = (n + TN) * W * 2;
				const ar = ea[row + 2 * i];
				const ai = ea[row + 2 * i + 1];
				const br = eb[row + 2 * j];
				const bi = eb[row + 2 * j + 1];
				const pr = ar * br - ai * bi;
				const pi = ar * bi + ai * br;
				const c = n + TN;
				re += cr[c] * pr - ci[c] * pi;
				im += cr[c] * pi + ci[c] * pr;
			}
			const bq = j / TG;
			const f = Math.hypot(re, im) * Math.exp(-Math.PI * bq * bq * tau[1]);
			val[i * W + j] = f;
			if (f > top) top = f;
		}
	return top;
}
function theta(ctx, w, h, u, S) {
	const tau = tauOf(u);
	const top = thetaGrid(S, tau);
	const K = 0.34 * Math.min(w, h);
	const z0 = [(1 + tau[0]) / 2, tau[1] / 2];
	// ℂ held still on the board: the cell shears round 0 and the zero moves.
	const view = makeView({
		w,
		h,
		scale: K,
		cx: w / 2 - K * T_CENTRE[0],
		cy: h / 2 + K * T_CENTRE[1]
	});
	const toZ = (i, j) => [i / TG + (j / TG) * tau[0], (j / TG) * tau[1]];

	// The level lines, out from the zero, each written on in turn, in every
	// cell in view.
	const ink = makeInk();
	const offs = [];
	for (let m = -3; m <= 3; m++)
		for (let n = -2; n <= 2; n++) offs.push([m + n * tau[0], n * tau[1], m === 0 && n === 0]);
	for (let k = 1; k < LEVELS; k++) {
		const on = smooth(span(u, 0.08 + 0.016 * k, 0.15 + 0.016 * k));
		if (on <= 0) continue;
		const segs = squares(S.val, TG, TG, (top * k) / LEVELS, []);
		for (const [ox, oy, home] of offs) {
			const alpha = (home ? 0.62 : 0.2) * on;
			const width = home ? 1.3 : 1;
			for (let s = 0; s < segs.length; s += 4) {
				const p = toZ(segs[s], segs[s + 1]);
				const q = toZ(segs[s + 2], segs[s + 3]);
				const a = view.to([p[0] + ox, p[1] + oy]);
				const b2 = view.to([q[0] + ox, q[1] + oy]);
				if (a[0] < -4 && b2[0] < -4) continue;
				if (a[0] > w + 4 && b2[0] > w + 4) continue;
				if (a[1] < -4 && b2[1] < -4) continue;
				if (a[1] > h + 4 && b2[1] > h + 4) continue;
				ink.seg(PAL.chalk, alpha, width, a[0], a[1], b2[0], b2[1]);
			}
		}
	}
	ink.flush(ctx);

	// The cells: the fundamental one bold, written on; the others faint.
	const corner = (m, n) => view.to([m + n * tau[0], n * tau[1]]);
	for (const [ox, oy, home] of offs) {
		const [m, n] = [Math.round(ox - oy * (tau[0] / tau[1])), Math.round(oy / tau[1])];
		const Q = [
			corner(m, n),
			corner(m + 1, n),
			corner(m + 1, n + 1),
			corner(m, n + 1),
			corner(m, n)
		];
		if (home) stroke(ctx, Q, { color: PAL.chalk, width: 2.2, alpha: 0.95, upto: span(u, 0, 0.1) });
		else stroke(ctx, Q, { color: PAL.chalk, width: 1, alpha: 0.18 * span(u, 0.04, 0.12) });
	}
	// The lattice points in view.
	const pa = span(u, 0.04, 0.12);
	for (let m = -3; m <= 4; m++)
		for (let n = -2; n <= 3; n++) {
			const q = corner(m, n);
			if (q[0] < -10 || q[0] > w + 10 || q[1] < -10 || q[1] > h + 10) continue;
			const home = (m === 0 || m === 1) && (n === 0 || n === 1);
			disc(ctx, q[0], q[1], home ? 3.2 : 2.2, { fill: PAL.chalk, alpha: (home ? 0.95 : 0.4) * pa });
		}

	// The zero, (1 + τ)/2, lit: a flash as it is found, then held.
	const zl = span(u, 0.26, 0.32);
	if (zl > 0) {
		const q = view.to(z0);
		const flash = zl * (1 - span(u, 0.32, 0.5));
		lit(ctx, q[0], q[1], 5 + 4 * flash, zl);
	}
}

// ── kummer: the quartic with sixteen nodes ───────────────────────────────────
const MU = 1.3;
const MU2 = MU * MU;
const LAM = (3 * MU2 - 1) / (3 - MU2);
const KB = 1.65; // the drawing is cut at this sphere (the nodes are within μ = 1.3)
const NSLICE = 40;
const NGRID = 80;
const NTET = 22;
const SLACK = 0.11; // the depth mesh is coarse: a line this close to it is in front
// F = g² − λAB, g = x² + y² + z² − μ², A = pq = (1 − z)² − 2x², B = rs = (1 + z)² − 2y².
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
// The singular points: Newton on ∇F = 0 from a seeded grid, kept where F = 0.
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
// The null vector of a 6 × 6 system of rank 5 (the conic through six
// coplanar points), by elimination with partial pivoting.
function nullVector(rows) {
	const M = rows.map((r) => r.slice());
	const n = 6;
	const piv = [];
	let r = 0;
	for (let c = 0; c < n && r < n; c++) {
		let best = r;
		for (let i = r + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[best][c])) best = i;
		if (Math.abs(M[best][c]) < 1e-9) continue;
		[M[r], M[best]] = [M[best], M[r]];
		const p = M[r][c];
		for (let j = 0; j < n; j++) M[r][j] /= p;
		for (let i = 0; i < n; i++) {
			if (i === r) continue;
			const f = M[i][c];
			if (f === 0) continue;
			for (let j = 0; j < n; j++) M[i][j] -= f * M[r][j];
		}
		piv.push(c);
		r++;
	}
	const free = [0, 1, 2, 3, 4, 5].find((c) => !piv.includes(c));
	const v = new Array(n).fill(0);
	v[free] = 1;
	piv.forEach((c, i) => (v[c] = -M[i][free]));
	return v;
}
// The tropes: every plane through exactly six nodes, with its conic through
// them traced in the plane (marching squares on the fitted conic), cut at
// the sphere.
function kummerTropes(nodes) {
	const planes = [];
	const n = nodes.length;
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++)
			for (let k = j + 1; k < n; k++) {
				const a = nodes[i];
				const uu = sub3(nodes[j], a);
				const vv = sub3(nodes[k], a);
				const nn = [
					uu[1] * vv[2] - uu[2] * vv[1],
					uu[2] * vv[0] - uu[0] * vv[2],
					uu[0] * vv[1] - uu[1] * vv[0]
				];
				if (Math.hypot(...nn) < 1e-9) continue;
				const N = norm(nn);
				const d = dot(N, a);
				const on = [];
				nodes.forEach((p, idx) => {
					if (Math.abs(dot(N, p) - d) < 1e-6) on.push(idx);
				});
				if (on.length !== 6) continue;
				const key = on.join(',');
				if (planes.some((P) => P.key === key)) continue;
				planes.push({ key, N, d, on });
			}
	planes.sort((a, b) => (a.key < b.key ? -1 : 1));
	const G = 60;
	for (const P of planes) {
		const [e1, e2] = axesOf(P.N);
		const c0 = mul3(P.N, P.d);
		const uv = (p) => {
			const q = sub3(p, c0);
			return [dot(q, e1), dot(q, e2)];
		};
		const rows = P.on.map((idx) => {
			const [s, t] = uv(nodes[idx]);
			return [s * s, s * t, t * t, s, t, 1];
		});
		const C = nullVector(rows);
		const conic = (s, t) => C[0] * s * s + C[1] * s * t + C[2] * t * t + C[3] * s + C[4] * t + C[5];
		const val = new Float64Array((G + 1) * (G + 1));
		for (let i = 0; i <= G; i++)
			for (let j = 0; j <= G; j++)
				val[i * (G + 1) + j] = conic(-KB + (2 * KB * i) / G, -KB + (2 * KB * j) / G);
		const segs = squares(val, G, G, 0, []);
		const out = [];
		const ang = [];
		for (let s = 0; s < segs.length; s += 4) {
			const s0 = -KB + (2 * KB * segs[s]) / G;
			const t0 = -KB + (2 * KB * segs[s + 1]) / G;
			const s1 = -KB + (2 * KB * segs[s + 2]) / G;
			const t1 = -KB + (2 * KB * segs[s + 3]) / G;
			const p0 = add3(c0, add3(mul3(e1, s0), mul3(e2, t0)));
			const p1 = add3(c0, add3(mul3(e1, s1), mul3(e2, t1)));
			if (Math.hypot(...p0) > KB || Math.hypot(...p1) > KB) continue;
			out.push(p0, p1);
			ang.push((Math.atan2(t0 + t1, s0 + s1) + Math.PI) / TAU);
		}
		P.conic = out;
		P.ang = ang;
		P.e1 = e1;
		P.e2 = e2;
		P.c0 = c0;
	}
	return planes;
}
// The surface's contours on the planes z = const, as 3D segments, cut at
// the sphere; one array per slice.
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
// A depth mesh of the surface by marching tetrahedra, cut at the sphere.
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
// The surface's (x, y, z) to the board's world, y up: a quarter turn about x,
// so the slicing axis z stands up and the contours stack like a map's.
const UPW = ([x, y, z]) => [x, z, -y];
const upArr = (a) => {
	const o = new Float32Array(a.length);
	for (let i = 0; i < a.length; i += 3) {
		o[i] = a[i];
		o[i + 1] = a[i + 2];
		o[i + 2] = -a[i + 1];
	}
	return o;
};
function kummerSetup() {
	const nodes = kummerNodes();
	const tropes = kummerTropes(nodes);
	for (const P of tropes) {
		const flat = [];
		for (const q of P.conic) flat.push(...UPW(q));
		P.flat = new Float32Array(flat);
		P.c0 = UPW(P.c0);
		P.e1 = UPW(P.e1);
		P.e2 = UPW(P.e2);
		P.rim = Math.sqrt(Math.max(0, KB * KB - P.d * P.d)); // the plane's circle on the sphere
	}
	return {
		nodes: nodes.map(UPW),
		tropes,
		slices: kummerSlices().map(upArr),
		mesh: upArr(kummerMesh())
	};
}
function kummer(ctx, w, h, u, S, Z) {
	const dist = 6.7 - 0.6 * smooth(u);
	const cam = orbit(w, h, {
		target: [0, 0, 0],
		az: 0.35 + 2.4 * u,
		el: 0.3 + 0.25 * (0.5 - 0.5 * Math.cos(TAU * u)),
		dist,
		fov: 36
	});
	const ref = dist;
	const wOf = (z) => Math.min(2, Math.max(0.5, ref / z));

	// The depth buffer of the surface.
	Z.reset(w, h);
	const M = S.mesh;
	for (let i = 0; i < M.length; i += 9)
		Z.tri(
			cam.project([M[i], M[i + 1], M[i + 2]]),
			cam.project([M[i + 3], M[i + 4], M[i + 5]]),
			cam.project([M[i + 6], M[i + 7], M[i + 8]])
		);
	const hid = (q) => Z.hidden([q[0], q[1], q[2] - SLACK]);

	// The contours, slice by slice from the bottom.
	const ink = makeInk();
	const segs = (arr, alpha, width, upto = 1, ang = null) => {
		if (alpha <= 0) return;
		for (let s = 0, n = 0; s < arr.length; s += 6, n++) {
			if (ang && ang[n] > upto) continue;
			const a = cam.project([arr[s], arr[s + 1], arr[s + 2]]);
			const b2 = cam.project([arr[s + 3], arr[s + 4], arr[s + 5]]);
			if (a[2] <= NEAR || b2[2] <= NEAR) continue;
			const mid = [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, (a[2] + b2[2]) / 2];
			const back = hid(mid);
			ink.seg(
				PAL.chalk,
				alpha * (back ? 0.2 : 0.8),
				width * wOf(mid[2]) * (back ? 0.7 : 1),
				a[0],
				a[1],
				b2[0],
				b2[1]
			);
		}
	};
	for (let k = 0; k < NSLICE; k++) {
		const on = smooth(span(u, 0.01 + (0.24 * k) / NSLICE, 0.06 + (0.24 * k) / NSLICE));
		segs(S.slices[k], on, 1.25);
	}

	// The tropes: each conic written on round its plane, the plane a faint
	// dashed circle while it is drawn.
	const T = S.tropes;
	const slot = (i) => 0.54 + (0.36 * i) / T.length;
	const bright = new Array(S.nodes.length).fill(0);
	T.forEach((P, i) => {
		const p = span(u, slot(i), slot(i) + 0.05);
		if (p <= 0) return;
		const e = p * (1 - span(u, slot(i) + 0.06, slot(i) + 0.14));
		segs(P.flat, lerp(0.7, 1, e), lerp(1.4, 2.2, e), p, P.ang);
		for (const idx of P.on) bright[idx] = Math.max(bright[idx], e);
		if (e > 0) {
			const ring = circle3(P.c0, P.e1, P.e2, P.rim, 90).map((q) => cam.project(q));
			if (ring.every((q) => q[2] > NEAR))
				stroke(ctx, ring, { color: PAL.chalk, width: 1, alpha: 0.3 * e, dash: [4, 7] });
		}
	});
	ink.flush(ctx);

	// The nodes, lit one by one.
	S.nodes.forEach((P, i) => {
		const on = span(u, 0.26 + (0.26 * i) / S.nodes.length, 0.29 + (0.26 * i) / S.nodes.length);
		if (on <= 0) return;
		const flash = on * (1 - span(u, 0.29 + (0.26 * i) / S.nodes.length, 0.36 + (0.26 * i) / 16));
		const r = (4.2 + 3 * flash + 2.5 * bright[i]) * wOf(cam.project(P)[2]);
		litHid(ctx, cam, Z, P, r, on, SLACK);
	});
}

// ── sixteen: the 16₆, Hudson's way ───────────────────────────────────────────
function sixteen(ctx, w, h, u) {
	const D = 0.19 * Math.min(w, h);
	const GAP = 0.3 * D;
	const pos = (i) => (i - 1.5) * D + (i < 2 ? -GAP / 2 : GAP / 2);
	const X = (c) => w / 2 + pos(c);
	const Y = (r) => h / 2 + pos(r);
	const RR = 0.14 * D;
	const off = (i) => (i - 1.5) * 0.055 * D;
	const x0 = X(0) - 0.55 * D;
	const x1 = X(3) + 0.55 * D;
	const y0 = Y(0) - 0.55 * D;
	const y1 = Y(3) + 0.55 * D;

	// Each trope: its slot, its emphasis.
	const tropes = [];
	for (let k = 0; k < 16; k++) {
		const r = k >> 2;
		const c = k & 3;
		const start = 0.07 + (0.8 * k) / 16;
		const p = span(u, start, start + 0.075);
		const e = span(p, 0, 0.3) * (1 - span(u, start + 0.08, start + 0.15));
		tropes.push({ r, c, p, e });
	}
	const flash = new Array(16).fill(0);
	const drawTrope = ({ r, c, p, e }) => {
		if (p <= 0) return;
		const o = {
			color: PAL.chalk,
			width: lerp(1.1, 2.3, e),
			alpha: lerp(0.42, 1, e)
		};
		const cx = X(c);
		const cy = Y(r);
		// The row strand, at its offset, cut by the ring.
		const oy = off(c);
		const gy = Math.sqrt(RR * RR - oy * oy);
		const pr = span(p, 0, 0.42);
		const L1 = cx - gy - x0;
		const L2 = x1 - (cx + gy);
		const f = L1 / (L1 + L2);
		stroke(
			ctx,
			[
				[x0, cy + oy],
				[cx - gy, cy + oy]
			],
			{ ...o, upto: span(pr, 0, f) }
		);
		stroke(
			ctx,
			[
				[cx + gy, cy + oy],
				[x1, cy + oy]
			],
			{ ...o, upto: span(pr, f, 1) }
		);
		// The column strand.
		const ox = off(r);
		const gx = Math.sqrt(RR * RR - ox * ox);
		const pc = span(p, 0.3, 0.72);
		const M1 = cy - gx - y0;
		const M2 = y1 - (cy + gx);
		const g = M1 / (M1 + M2);
		stroke(
			ctx,
			[
				[cx + ox, y0],
				[cx + ox, cy - gx]
			],
			{ ...o, upto: span(pc, 0, g) }
		);
		stroke(
			ctx,
			[
				[cx + ox, cy + gx],
				[cx + ox, y1]
			],
			{ ...o, upto: span(pc, g, 1) }
		);
		// The ring round the node the trope leaves out.
		const pg = span(p, 0.62, 1);
		if (pg > 0) {
			const ring = [];
			for (let i = 0; i <= 72; i++) {
				const a = -Math.PI / 2 + (TAU * i) / 72;
				ring.push([cx + RR * Math.cos(a), cy + RR * Math.sin(a)]);
			}
			stroke(ctx, ring, { ...o, upto: pg });
		}
		// Its six nodes brighten as it is drawn.
		for (let i = 0; i < 4; i++) {
			if (i !== c) flash[r * 4 + i] = Math.max(flash[r * 4 + i], e * pr);
			if (i !== r) flash[i * 4 + c] = Math.max(flash[i * 4 + c], e * pc);
		}
	};
	// The quiet ones under, the one being drawn over them.
	const order = tropes.slice().sort((a, b) => a.e - b.e);
	for (const t of order) drawTrope(t);

	// The half-periods: sixteen lit points.
	const up = span(u, 0, 0.07);
	for (let k = 0; k < 16; k++) {
		const r = k >> 2;
		const c = k & 3;
		const on = span(up, k / 20, k / 20 + 0.25);
		if (on <= 0) continue;
		const fl = flash[k];
		if (fl > 0.02) bloom(ctx, X(c), Y(r), 26 * fl, 'rgba(255, 222, 150, 0.5)', fl);
		lit(ctx, X(c), Y(r), (4.6 + 2.4 * fl) * on, on);
	}
}
