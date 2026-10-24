// ── log-swimmer · three — a shaded body, down the sheets of z^{1/3} ──────────
// The swimmer as a real mesh on the lab's three.js renderer: the head and
// midpiece SWEPT on a lathe, pressed to the paddle, the flagellum EXTRUDED
// out of the midpiece as a tube; a matte ivory body on the board's ground,
// its lathe lines and its tube's lines drawn in chalk, the lines it hides
// faint. Then it comes to life and swims round the Riemann surface of z^{1/3}
// — three sheets winding round one branch point — and down into that point.
//
// The generation, beat by beat (u = progress, 20 s):
//   0.00–0.03  the lathe's axis, faint.
//   0.01–0.07  the PROFILE written along it in its half-plane, face on: half
//              the outline, from the midpiece's end to the nose — the
//              midpiece, the neck's waist, the head's rounded base, its oval,
//              the step at the acrosome's edge two-thirds of the way forward,
//              the nose.
//   0.075–0.235 the SWEEP: the profile swings once round the axis and the
//              surface of revolution is laid behind it, a meridian left every
//              30°, each parallel traced as the arm goes round — the far half
//              first, seen from inside through the open side, then the near
//              half closing toward the lens.
//   0.25–0.30  the PRESS, seen edge on: the head flattens across one axis to
//              the paddle, 5 long, 3 wide, about 1.5 thick, thinnest at the
//              nose; the neck and midpiece keep their round. Then the lens
//              rises over it (0.30–0.34) to show the paddle's face.
//   0.30–0.40  the FLAGELLUM extruded out of the midpiece's end, 45 long,
//              tapering, its rings and four lines along it running out with
//              the growing end; the lens pulls back to the whole body.
//   0.40–0.47  life: a gold spark at the neck; the beat starts at the neck
//              and runs out to the tip; the body starts to roll; it moves.
//   0.455–0.60 the SURFACE written: a ray swept round in arg w from the
//              swimmer's own bearing, from the branch point (a gold point) to
//              the rim — one sheet, the next under it, the third, and closed
//              back onto the first where it began; its grid with it; the lens
//              stands back to see the swimmer at its rim.
//   0.58–1.00  the lens comes down behind and above the swimmer, the branch
//              point held ahead of it, and the swimmer swims round the top
//              sheet and down its funnel along a spiral that runs on (faint,
//              ahead of it, round the throat through all three sheets) into
//              the branch point; the pace gathers, the lens closes in. The run
//              ends on the way in, the head over the throat.
//
// What is EXACT: the surface is { (z, Re w) : w³ = z } — parametrised by w =
// r·e^{iψ}, 0 ≤ r ≤ 1, ψ₀ ≤ ψ < ψ₀ + 2π, at (S·Re w³, H·Re w, S·Im w³): over
// every z ≠ 0 its three cube roots, three sheets that close up only after
// three turns, meeting at the branch point z = 0 (where the surface stands
// vertical: height ∝ |z|^{1/3}); it crosses itself where two roots have the
// same real part (an immersion of the true surface in 4D — the honest picture).
// Its grid is the image of w's polar grid, mesh edges exactly: six circles
// |z| = 2^{−k} (each winds three times round before it closes) and 36 rays
// arg w = 10°·q (every 30° of arg z on each sheet). The route is w =
// r₀(r₁/r₀)^λ e^{i(ψ₀ + Δψ·λ)} — an equiangular spiral in w, so its shadow on
// the z-plane is an equiangular spiral too (pitch ≈ 30°), kept on the top
// sheet (|ψ| < 60°, where Re w is the largest of the three) — lifted off the
// surface along its normal; continued (the faint line ahead), it winds on
// into the branch point. The lathe is a true surface of revolution of the
// profile (meridians at fixed angles, the arm's columns closed onto it); the
// press an affine scale of the head in one axis, its normals by the inverse
// transpose; the tube true rings about its centreline in planes normal to it.
// What is a PICTURE: the profile's shape (in the brief's proportions); the
// acrosome as a lip proud of the head; the wedge of the press (thinner at the
// nose than at the base); the beat, a travelling sine wave of lateral
// displacement growing to the tip, in a plane that rolls with the body; the
// head set along the flagellum's tangent at the joint, so it yaws against the
// beat; the body following its route (the tail trails along the swum spiral)
// rather than swimming free; the pace and the roll's rate.
//
// Rendering: one opaque body; the surface translucent, both faces, its depth
// laid after its colour so that the lines behind any sheet or behind the body
// fail the depth test and are drawn again, faint, by a second pass that
// passes only where it is behind (GreaterDepth). Lines are the renderer's
// one-pixel lines. The branch point is a gold sprite in the scene, hidden by
// the body only; the spark of life is on the board, over the render.

import { PAL, TAU, span, smooth, lerp, disc, bloom } from '../log/board.js';
import { spline } from '../log/space.js';
import {
	color,
	normalView,
	positionView,
	dot,
	max,
	abs,
	pow,
	float,
	vec3,
	uv,
	smoothstep,
	uniform
} from 'three/tsl';

export const meta = {
	title: 'three — a shaded body swept on a lathe, its tail extruded; round the sheets of z^{1/3}',
	order: 10,
	seconds: 20,
	three: true
};

const SEC = 20;
const FOV = 35;

// ── The beats ────────────────────────────────────────────────────────────────
const U_AXIS = [0.0, 0.03];
const U_PROF = [0.012, 0.07];
const U_SWEEP = [0.075, 0.235];
const U_PRESS = [0.25, 0.3];
const U_TAIL = [0.3, 0.4];
const U_LIFE = 0.405;
const U_SURF = [0.455, 0.6];

// ── The body (a = distance back from the nose) ───────────────────────────────
const HEAD = 5; // the head's length
const WIDE = 2.2; // where it is widest, back from the nose
const CAP = 3.33; // the acrosome's edge: two-thirds of the head
const MID0 = 5.9; // the midpiece, after the neck's waist
const MID1 = 9.3;
const JOINT = 9.6; // where the flagellum starts
const TAIL = 45;
const R_T0 = 0.33;
const R_TIP = 0.06;
function rOf(a) {
	let r;
	if (a <= 0) r = 0;
	else if (a < WIDE) {
		// The front of the oval.
		const x = (WIDE - a) / WIDE;
		r = 1.5 * Math.sqrt(Math.max(0, 1 - x * x));
	} else if (a < HEAD) {
		// The back of the oval, rounding into the neck.
		const x = (a - WIDE) / (HEAD - WIDE);
		r = 0.36 + 1.14 * Math.pow(Math.max(0, 1 - x * x), 0.75);
	} else if (a < 5.5) r = lerp(0.36, 0.33, smooth((a - HEAD) / 0.5));
	else if (a < MID0) r = lerp(0.33, 0.5, smooth((a - 5.5) / 0.4));
	else if (a < MID1) r = lerp(0.5, 0.46, (a - MID0) / (MID1 - MID0));
	else r = lerp(0.46, R_T0, smooth((a - MID1) / (JOINT - MID1)));
	// The acrosome: a cap a little proud of the head over its front two-thirds.
	return r + 0.07 * Math.min(1, r / 0.5) * (1 - smooth((a - (CAP - 0.12)) / 0.16));
}
const rTail = (s) => lerp(R_T0, R_TIP, Math.pow(Math.min(1, s / TAIL), 0.85));
// The profile's rows, nose to joint (dense at the nose, the cap's edge and
// the head's base), and which are drawn as parallels.
const ROWS = [
	0, 0.03, 0.1, 0.2, 0.35, 0.55, 0.8, 1.1, 1.45, 1.8, 2.2, 2.6, 2.95, 3.15, 3.21, 3.29, 3.37, 3.5,
	3.8, 4.1, 4.35, 4.55, 4.72, 4.85, 4.94, 5.0, 5.2, 5.45, 5.65, 5.9, 6.4, 6.9, 7.4, 7.9, 8.4, 8.9,
	9.3, 9.45, 9.6
];
const PARS = new Set([0.35, 1.1, 2.2, 3.29, 4.1, 4.72, 5.0, 5.9, 6.9, 7.9, 8.9, 9.6]);
// LatheGeometry wants its points from bottom to top: joint first, nose last.
const PROF = ROWS.slice().reverse();
const NP = PROF.length;
const SEG = 48; // columns round the lathe
const MERID = 4; // a meridian every 4 columns: 30°
// The arm starts here (lathe angle) and goes round the other way, so the far
// half is laid first and the near half closes toward the lens.
const PHI_S = -0.45;
// The press: the head's thin axis (lathe z) scaled to a wedge, thinnest at
// the nose; the neck and midpiece keep their round.
const thinOf = (a) =>
	a < 4.8 ? 0.44 + 0.16 * smooth(a / 4.8) : lerp(0.6, 1, smooth((a - 4.8) / 0.8));
const pressOf = (a, p) => 1 - p * (1 - thinOf(a));

// The tube: rings along the flagellum, vertices round each.
const NK = 90;
const DS = TAIL / NK;
const NM = 12;
const RING_EVERY = 6;

// The beat: a travelling wave of lateral displacement, ~2 wavelengths along
// the tail, its amplitude growing to the tip.
const KW = TAU / 23;
const amp = (s) => 0.3 + 4.3 * Math.pow(s / TAIL, 1.35);
// ∫₀^τ (rate·min(1, x/rise) + accel·x) dx — a rate that rises, then gathers.
function ramped(tau, rate, rise, accel) {
	if (tau <= 0) return 0;
	const a = tau < rise ? (rate * tau * tau) / (2 * rise) : rate * (tau - rise / 2);
	return a + 0.5 * accel * tau * tau;
}

// ── The surface: { (z, Re w) : w³ = z } ──────────────────────────────────────
const S = 200; // z's scale
const HZ = 90; // Re w's
const PSI0 = (-50 * Math.PI) / 180; // where the sweep starts: the swimmer's bearing
const NJ = 432; // columns in ψ (144 a turn of z), every ray among them
const NRAY = 36;
const CIRC = [0, 1, 2, 3, 4, 5].map((k) => Math.pow(2, -k / 3)); // |z| = 2^{−k}
const RS = (() => {
	const a = [];
	for (let i = 0; i <= 40; i++) a.push(i / 40);
	for (const r of CIRC) if (!a.some((x) => Math.abs(x - r) < 0.006)) a.push(r);
	return a.sort((x, y) => x - y);
})();
// Snap the circles to the rows actually present.
const CIRC_I = CIRC.map((r) =>
	RS.reduce((b, x, i) => (Math.abs(x - r) < Math.abs(RS[b] - r) ? i : b), 0)
);
function surfP(r, psi) {
	const r3 = r * r * r;
	return [S * r3 * Math.cos(3 * psi), HZ * r * Math.cos(psi), S * r3 * Math.sin(3 * psi)];
}
// The normal, P_ψ/r × P_r: always up, the surface being a graph over z.
function surfN(r, psi) {
	const r2 = Math.max(r, 1e-3) ** 2;
	const pr = [3 * S * r2 * Math.cos(3 * psi), HZ * Math.cos(psi), 3 * S * r2 * Math.sin(3 * psi)];
	const pp = [-3 * S * r2 * Math.sin(3 * psi), -HZ * Math.sin(psi), 3 * S * r2 * Math.cos(3 * psi)];
	return norm(cross(pp, pr));
}

// ── The route: an equiangular spiral in w, lifted off the surface ────────────
const W_R0 = 1.05;
const W_R1 = 0.36;
const W_DPSI = 1.88; // under a turn of z, on the top sheet (|ψ| < 60°) all the way; pitch ≈ 30°
const LIFT = 6;
const wOf = (lam) => [W_R0 * Math.pow(W_R1 / W_R0, lam), PSI0 + W_DPSI * lam];

// ── Small vector helpers ─────────────────────────────────────────────────────
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function cross(a, b) {
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a) {
	const l = Math.hypot(a[0], a[1], a[2]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
}

export async function make({ THREE, renderer, board }) {
	const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(PAL.ground);
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.3, 4000);

	// ── Materials ────────────────────────────────────────────────────────────
	// Matte ivory, lit from over the lens's left shoulder (view space, so the
	// light keeps its place as the lens moves), a little light at the rim.
	// Both faces: the open lathe is seen from inside while it is swept.
	const L = vec3(-0.45, 0.62, 0.64).normalize();
	const view = positionView.negate().normalize();
	const ivory = color(PAL.chalk);
	const bodyMat = new THREE.MeshBasicNodeMaterial({
		side: THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 2
	});
	{
		const diff = max(dot(normalView, L), 0);
		const rim = pow(float(1).sub(max(dot(normalView, view), 0)), 3);
		bodyMat.colorNode = ivory.mul(diff.mul(0.5).add(0.1).add(rim.mul(0.1)));
	}
	// The surface: chalk, translucent, more so face-on; both faces.
	const surfMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	{
		const facing = abs(dot(normalView, view));
		surfMat.colorNode = ivory.mul(abs(dot(normalView, L)).mul(0.32).add(0.14));
		surfMat.opacityNode = pow(float(1).sub(facing), 2).mul(0.24).add(0.06);
	}
	// Its depth, laid after its colour, a hair behind its own grid lines.
	const depthMat = new THREE.MeshBasicNodeMaterial({
		colorWrite: false,
		transparent: true,
		side: THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 4
	});
	const lineMat = (opacity, hidden = false, c = PAL.chalk) =>
		new THREE.LineBasicNodeMaterial({
			color: new THREE.Color(c),
			transparent: true,
			opacity,
			depthWrite: false,
			depthFunc: hidden ? THREE.GreaterDepth : THREE.LessEqualDepth
		});
	// Front and hidden passes of one line geometry.
	function linePair(geo, front, back, parent = scene) {
		const f = new THREE.LineSegments(geo, lineMat(front));
		const b = new THREE.LineSegments(geo, lineMat(back, true));
		f.renderOrder = 3;
		b.renderOrder = 4;
		f.frustumCulled = b.frustumCulled = false;
		parent.add(f, b);
		return [f, b];
	}

	// ── The head and midpiece: a lathe ───────────────────────────────────────
	// LatheGeometry gives the topology (and is the formula: column i at angle
	// φᵢ, row j at (r sin φ, y, r cos φ)); the positions are written each
	// frame with every column past the arm closed onto it, so the meridians
	// stay where they were left, and with the press. The arm goes round the
	// other way from LatheGeometry's, so its triangles are turned over.
	const lathePts = PROF.map((a) => new THREE.Vector2(rOf(a), -a));
	const lathe = new THREE.LatheGeometry(lathePts, SEG);
	const headGeo = new THREE.BufferGeometry();
	{
		const idx = Array.from(lathe.index.array);
		for (let k = 0; k < idx.length; k += 3) [idx[k + 1], idx[k + 2]] = [idx[k + 2], idx[k + 1]];
		headGeo.setIndex(idx);
	}
	const hPos = new THREE.BufferAttribute(new Float32Array(lathe.attributes.position.count * 3), 3);
	const hNor = new THREE.BufferAttribute(new Float32Array(lathe.attributes.position.count * 3), 3);
	hPos.setUsage(THREE.DynamicDrawUsage);
	hNor.setUsage(THREE.DynamicDrawUsage);
	headGeo.setAttribute('position', hPos);
	headGeo.setAttribute('normal', hNor);
	lathe.dispose();
	// The profile's own normal in its half-plane (outward).
	const prN = PROF.map((a, j) => {
		const j0 = Math.max(0, j - 1);
		const j1 = Math.min(NP - 1, j + 1);
		const dr = rOf(PROF[j1]) - rOf(PROF[j0]);
		const dy = -PROF[j1] + PROF[j0];
		const l = Math.hypot(dr, dy) || 1;
		return [dy / l, -dr / l];
	});
	const prR = PROF.map(rOf);
	function writeHead(phiNow, press) {
		const P = hPos.array;
		const N = hNor.array;
		for (let i = 0; i <= SEG; i++) {
			const th = PHI_S - Math.min((TAU * i) / SEG, phiNow);
			const sn = Math.sin(th);
			const cs = Math.cos(th);
			for (let j = 0; j < NP; j++) {
				const k = 3 * (i * NP + j);
				const sz = pressOf(PROF[j], press);
				P[k] = prR[j] * sn;
				P[k + 1] = -PROF[j];
				P[k + 2] = prR[j] * cs * sz;
				const [nr, ny] = prN[j];
				const n = norm([nr * sn, ny, (nr * cs) / sz]);
				N[k] = n[0];
				N[k + 1] = n[1];
				N[k + 2] = n[2];
			}
		}
		hPos.needsUpdate = true;
		hNor.needsUpdate = true;
	}
	const headG = new THREE.Group();
	headG.matrixAutoUpdate = false;
	scene.add(headG);
	const headMesh = new THREE.Mesh(headGeo, bodyMat);
	headMesh.frustumCulled = false;
	headG.add(headMesh);
	// Its lines: the meridians and the parallels, on the same positions.
	const hl = [];
	for (let i = 0; i <= SEG; i += MERID)
		for (let j = 0; j < NP - 1; j++) hl.push(i * NP + j, i * NP + j + 1);
	for (let j = 0; j < NP; j++)
		if (PARS.has(PROF[j])) for (let i = 0; i < SEG; i++) hl.push(i * NP + j, (i + 1) * NP + j);
	const headLineGeo = new THREE.BufferGeometry();
	headLineGeo.setAttribute('position', hPos);
	headLineGeo.setIndex(hl);
	const headLines = linePair(headLineGeo, 0.62, 0.1, headG);
	// The arm: the profile, written along the axis, then carried round.
	const armPos = new THREE.BufferAttribute(new Float32Array(NP * 3), 3);
	armPos.setUsage(THREE.DynamicDrawUsage);
	const armGeo = new THREE.BufferGeometry();
	armGeo.setAttribute('position', armPos);
	const arm = new THREE.Line(armGeo, lineMat(0.95));
	arm.renderOrder = 3;
	arm.frustumCulled = false;
	headG.add(arm);
	const armBack = new THREE.Line(armGeo, lineMat(0.25, true));
	armBack.renderOrder = 4;
	armBack.frustumCulled = false;
	headG.add(armBack);
	// The axis.
	const axisGeo = new THREE.BufferGeometry();
	axisGeo.setAttribute(
		'position',
		new THREE.BufferAttribute(new Float32Array([0, 2.5, 0, 0, -JOINT - 3, 0]), 3)
	);
	const axisMat = lineMat(0.3);
	const axis = new THREE.LineSegments(axisGeo, axisMat);
	axis.renderOrder = 3;
	headG.add(axis);

	// ── The flagellum: a tube about a moving centreline ──────────────────────
	const NV = (NK + 1) * (NM + 1);
	const tPos = new THREE.BufferAttribute(new Float32Array(NV * 3), 3);
	const tNor = new THREE.BufferAttribute(new Float32Array(NV * 3), 3);
	tPos.setUsage(THREE.DynamicDrawUsage);
	tNor.setUsage(THREE.DynamicDrawUsage);
	const tailGeo = new THREE.BufferGeometry();
	tailGeo.setAttribute('position', tPos);
	tailGeo.setAttribute('normal', tNor);
	const ti = [];
	for (let k = 0; k < NK; k++)
		for (let m = 0; m < NM; m++) {
			const a = k * (NM + 1) + m;
			const b = a + NM + 1;
			ti.push(a, a + 1, b, a + 1, b + 1, b);
		}
	tailGeo.setIndex(ti);
	const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
	tailMesh.frustumCulled = false;
	scene.add(tailMesh);
	const tl = [];
	for (const m of [0, 3, 6, 9])
		for (let k = 0; k < NK; k++) tl.push(k * (NM + 1) + m, (k + 1) * (NM + 1) + m);
	for (let k = RING_EVERY; k <= NK; k += RING_EVERY)
		for (let m = 0; m < NM; m++) tl.push(k * (NM + 1) + m, k * (NM + 1) + m + 1);
	const tailLineGeo = new THREE.BufferGeometry();
	tailLineGeo.setAttribute('position', tPos);
	tailLineGeo.setIndex(tl);
	const tailLines = linePair(tailLineGeo, 0.55, 0.08);

	// ── The surface ──────────────────────────────────────────────────────────
	// Its columns run in ψ from the swimmer's bearing ψ₀, once round.
	const psiOf = (j) => PSI0 + (TAU * j) / NJ;
	const NI = RS.length;
	const sPos = new Float32Array((NJ + 1) * NI * 3);
	const sNor = new Float32Array((NJ + 1) * NI * 3);
	for (let j = 0; j <= NJ; j++) {
		for (let i = 0; i < NI; i++) {
			const k = 3 * (j * NI + i);
			sPos.set(surfP(RS[i], psiOf(j)), k);
			sNor.set(surfN(RS[i], psiOf(j)), k);
		}
	}
	const si = [];
	for (let j = 0; j < NJ; j++)
		for (let i = 0; i < NI - 1; i++) {
			const a = j * NI + i;
			const b = a + NI;
			si.push(a, b, a + 1, b, b + 1, a + 1);
		}
	const surfGeo = new THREE.BufferGeometry();
	surfGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
	surfGeo.setAttribute('normal', new THREE.BufferAttribute(sNor, 3));
	surfGeo.setIndex(si);
	const surf = new THREE.Mesh(surfGeo, surfMat);
	surf.renderOrder = 1;
	const surfDepth = new THREE.Mesh(surfGeo, depthMat);
	surfDepth.renderOrder = 2;
	surf.frustumCulled = surfDepth.frustumCulled = false;
	scene.add(surf, surfDepth);
	const perCol = 6 * (NI - 1);
	// The grid, on the mesh's own edges, ordered by ψ so it is written with
	// the sweep: the circles' segments column by column, each ray whole as
	// the sweep reaches it. ψ₀ is a multiple of 10°, so the rays are at
	// arg w = 10°·q.
	const gridSegs = [];
	const vtx = (j, i) => Array.from(sPos.subarray(3 * (j * NI + i), 3 * (j * NI + i) + 3));
	const rayCol = (j) => j % (NJ / NRAY) === 0;
	for (let j = 0; j < NJ; j++) {
		for (const i of CIRC_I) gridSegs.push(vtx(j, i), vtx(j + 1, i));
		if (rayCol(j)) for (let i = 0; i < NI - 1; i++) gridSegs.push(vtx(j, i), vtx(j, i + 1));
	}
	const colStart = []; // the first segment of each column
	{
		let n = 0;
		for (let j = 0; j < NJ; j++) {
			colStart.push(n);
			n += CIRC_I.length + (rayCol(j) ? NI - 1 : 0);
		}
		colStart.push(n);
	}
	const gridGeo = new THREE.BufferGeometry();
	gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridSegs.flat()), 3));
	const gridLines = linePair(gridGeo, 0.5, 0.11);
	// The branch point: a lit gold point in the scene, so the body hides it
	// as it passes in front (drawn after the surface's colour, before its
	// depth: the sheets all pass through it and must not).
	const bpAlpha = uniform(0);
	const bpMat = new THREE.SpriteNodeMaterial({
		transparent: true,
		depthWrite: false,
		sizeAttenuation: false
	});
	{
		const d = uv().sub(0.5).length().mul(2);
		bpMat.colorNode = color(PAL.gold);
		bpMat.opacityNode = max(
			smoothstep(0.17, 0.12, d).mul(0.88),
			float(1)
				.sub(smoothstep(0.2, 1, d))
				.mul(0.3)
		).mul(bpAlpha);
	}
	const bpSprite = new THREE.Sprite(bpMat);
	bpSprite.scale.setScalar(0.027); // ~34 px across, whatever the distance
	bpSprite.renderOrder = 1.5;
	bpSprite.frustumCulled = false;
	scene.add(bpSprite);

	// The sweep's ray, bold, from the branch point to the rim.
	const rayPos = new THREE.BufferAttribute(new Float32Array(NI * 3), 3);
	rayPos.setUsage(THREE.DynamicDrawUsage);
	const rayGeo = new THREE.BufferGeometry();
	rayGeo.setAttribute('position', rayPos);
	const ray = new THREE.Line(rayGeo, lineMat(0.95));
	ray.renderOrder = 3;
	ray.frustumCulled = false;
	scene.add(ray);

	// ── The route ────────────────────────────────────────────────────────────
	const NPATH = 1600;
	const path = [];
	{
		let ell = 0;
		for (let q = 0; q <= NPATH; q++) {
			const [r, psi] = wOf(q / NPATH);
			const n = surfN(r, psi);
			const p = add(surfP(r, psi), mul(n, LIFT));
			if (q) ell += Math.hypot(...sub(p, path[q - 1].p));
			path.push({ p, n, ell });
		}
		for (let q = 0; q <= NPATH; q++) {
			const a = path[Math.max(0, q - 1)].p;
			const b = path[Math.min(NPATH, q + 1)].p;
			const T = norm(sub(b, a));
			const n = path[q].n;
			const up = norm(sub(n, mul(T, dot3(n, T))));
			path[q].T = T;
			path[q].up = up;
			path[q].side = cross(T, up);
		}
	}
	const LTOT = path[NPATH].ell;
	// The frame at arc length ℓ (straight on, before the start and past the end).
	function at(ell) {
		if (ell <= 0) {
			const f = path[0];
			return { p: add(f.p, mul(f.T, ell)), T: f.T, up: f.up, side: f.side };
		}
		if (ell >= LTOT) {
			const f = path[NPATH];
			return { p: add(f.p, mul(f.T, ell - LTOT)), T: f.T, up: f.up, side: f.side };
		}
		let lo = 0;
		let hi = NPATH;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (path[mid].ell <= ell) lo = mid;
			else hi = mid;
		}
		const A = path[lo];
		const B = path[hi];
		const t = (ell - A.ell) / (B.ell - A.ell || 1);
		const T = norm(lerp3(A.T, B.T, t));
		const up0 = lerp3(A.up, B.up, t);
		const up = norm(sub(up0, mul(T, dot3(up0, T))));
		return { p: lerp3(A.p, B.p, t), T, up, side: cross(T, up) };
	}
	// λ (the spiral's own parameter) at arc length ℓ along the route.
	function lamOf(ell) {
		if (ell <= 0) return 0;
		if (ell >= LTOT) return 1;
		let lo = 0;
		let hi = NPATH;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (path[mid].ell <= ell) lo = mid;
			else hi = mid;
		}
		const t = (ell - path[lo].ell) / (path[hi].ell - path[lo].ell || 1);
		return (lo + t) / NPATH;
	}
	// The spiral ahead, on the surface (a hair off it), run on into the branch
	// point: the same w-spiral for λ past the end, until r is nothing.
	const AHEAD_DL = 0.004;
	const aheadPts = [];
	for (let lam = 0; ; lam += AHEAD_DL) {
		const [r, psi] = wOf(lam);
		if (r < 0.015) break;
		aheadPts.push(...add(surfP(r, psi), mul(surfN(r, psi), 0.4)));
	}
	aheadPts.push(0, 0, 0);
	const aheadGeo = new THREE.BufferGeometry();
	aheadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(aheadPts), 3));
	const NAHEAD = aheadPts.length / 3;
	const aheadMat = lineMat(0.0);
	const ahead = new THREE.Line(aheadGeo, aheadMat);
	ahead.renderOrder = 3;
	ahead.frustumCulled = false;
	scene.add(ahead);

	// ── The swim: where the head is, the beat, the roll ──────────────────────
	const swimOf = (u) => LTOT * Math.pow(span(u, U_LIFE, 1), 1.8);
	function bodyAt(u, t) {
		const tau = Math.max(0, t - U_LIFE * SEC);
		const phase = TAU * ramped(tau, 2.6, 0.8, 0.09);
		const roll = TAU * ramped(tau, 0.32, 1.6, 0.035);
		const front = (TAIL + 10) * span(u, U_LIFE, U_LIFE + 0.07);
		const ampK = smooth(span(u, U_LIFE, U_LIFE + 0.05));
		const lHead = swimOf(u);
		const lJ = lHead - JOINT;
		const ext = TAIL * smooth(span(u, U_TAIL[0], U_TAIL[1]));
		return { phase, roll, front, ampK, lHead, lJ, ext };
	}
	// The centreline of the flagellum at s, and the beat plane's lateral.
	function centre(B, s) {
		const F = at(B.lJ - s);
		const cr = Math.cos(B.roll);
		const sr = Math.sin(B.roll);
		const e = add(mul(F.side, cr), mul(F.up, sr));
		const env = B.ampK * smooth((B.front - s) / 10);
		const d = amp(s) * env * Math.sin(KW * s - B.phase);
		return { c: add(F.p, mul(e, d)), e };
	}
	const cs = new Array(NK + 1);
	function writeTail(B) {
		for (let k = 0; k <= NK; k++) cs[k] = centre(B, Math.min(k * DS, B.ext));
		const P = tPos.array;
		const N = tNor.array;
		for (let k = 0; k <= NK; k++) {
			const s = k * DS;
			const full = s <= B.ext + 1e-6 && k < NK;
			const r = full ? rTail(s) : 0;
			const a = cs[Math.max(0, k - 1)].c;
			const b = cs[Math.min(NK, k + 1)].c;
			let T = sub(b, a);
			if (Math.hypot(...T) < 1e-6) T = sub(cs[0].c, at(B.lJ + 1).p).map((x) => -x);
			T = norm(T);
			const e = cs[k].e;
			const n1 = norm(sub(e, mul(T, dot3(e, T))));
			const n2 = cross(T, n1);
			for (let m = 0; m <= NM; m++) {
				const ph = (TAU * m) / NM;
				const nx = n1[0] * Math.cos(ph) + n2[0] * Math.sin(ph);
				const ny = n1[1] * Math.cos(ph) + n2[1] * Math.sin(ph);
				const nz = n1[2] * Math.cos(ph) + n2[2] * Math.sin(ph);
				const v = 3 * (k * (NM + 1) + m);
				P[v] = cs[k].c[0] + r * nx;
				P[v + 1] = cs[k].c[1] + r * ny;
				P[v + 2] = cs[k].c[2] + r * nz;
				N[v] = nx;
				N[v + 1] = ny;
				N[v + 2] = nz;
			}
		}
		tPos.needsUpdate = true;
		tNor.needsUpdate = true;
	}
	// The head's frame: along the flagellum's tangent at the joint, its wide
	// axis in the beat plane.
	const M4 = new THREE.Matrix4();
	function placeHead(B) {
		const c0 = cs[0].c;
		const c1 = centre(B, 0.6).c;
		let f = sub(c0, c1);
		if (Math.hypot(...f) < 1e-6) f = at(B.lJ).T;
		f = norm(f);
		const e = cs[0].e;
		const e1 = norm(sub(e, mul(f, dot3(e, f))));
		const e2 = cross(e1, f);
		const o = add(c0, mul(f, JOINT));
		M4.makeBasis(V3(e1), V3(f), V3(e2));
		M4.setPosition(o[0], o[1], o[2]);
		headG.matrix.copy(M4);
		headG.matrixWorldNeedsUpdate = true;
		return { o, f, e1, e2 };
	}

	// ── The lens ─────────────────────────────────────────────────────────────
	// While it is made: round the body in its own frame at the route's start
	// (az along the body, el up off it; the lathe's axis is the route's
	// tangent, its x the side, its z the up).
	const F0 = at(0);
	function lensMake(u) {
		const az = spline(u, [
			[0, -0.42],
			[0.07, -0.22],
			[0.16, 0.06],
			[0.235, 0.18],
			[0.25, 0.0],
			[0.303, 0.02],
			[0.34, 0.2],
			[0.4, 0.55],
			[0.5, 0.75]
		]);
		const el = spline(u, [
			[0, 0.4],
			[0.07, 0.42],
			[0.16, 0.5],
			[0.235, 0.45],
			[0.25, 0.03],
			[0.303, 0.05],
			[0.34, 1.05],
			[0.4, 0.75],
			[0.5, 0.75]
		]);
		const dist = spline(u, [
			[0, 14],
			[0.07, 15],
			[0.235, 17],
			[0.25, 15],
			[0.305, 16],
			[0.4, 64],
			[0.5, 80]
		]);
		const focus = spline(u, [
			[0, 4.6],
			[0.07, 4.6],
			[0.235, 4.3],
			[0.25, 3.6],
			[0.305, 4.5],
			[0.4, 27],
			[0.5, 30]
		]);
		const c = sub(F0.p, mul(F0.T, focus));
		const dir = add(
			mul(add(mul(F0.side, Math.cos(az)), mul(F0.T, Math.sin(az))), Math.cos(el)),
			mul(F0.up, Math.sin(el))
		);
		return { pos: add(c, mul(dir, dist)), tgt: c };
	}
	// Standing back: high, off the swimmer's bearing behind it, the whole
	// surface in view and the swimmer at its rim.
	const bearing = Math.atan2(F0.p[2], F0.p[0]);
	function lensOver(u) {
		const k = smooth(span(u, 0.44, 0.7));
		const b = bearing - lerp(0.85, 0.6, k);
		const R = lerp(600, 520, k);
		return {
			pos: [R * Math.cos(b), lerp(420, 360, k), R * Math.sin(b)],
			tgt: [lerp(0.35, 0.25, k) * F0.p[0], -18, lerp(0.35, 0.25, k) * F0.p[2]]
		};
	}
	// Behind the swimmer and above it, a little out from the axis, looking
	// down past its head into the funnel: the frame's middle between the head
	// and the branch point, so the point is always ahead of it; closing in.
	function lensChase(u, B) {
		const H = at(B.lHead);
		const k = smooth(span(u, 0.6, 1));
		const hp = H.p;
		const lev = norm([H.T[0], 0, H.T[2]]);
		const out = norm([hp[0], 0, hp[2]]);
		const tgt = lerp3(add(hp, mul(H.T, 8)), [0, 0, 0], lerp(0.3, 0.55, k));
		const back = lerp(120, 62, k);
		const pos = add(add(add(hp, mul(lev, -back)), mul(out, lerp(40, 18, k))), [
			0,
			lerp(85, 70, k),
			0
		]);
		return { pos, tgt };
	}

	const proj = new THREE.Vector3();
	function screen(p, w, h) {
		proj.set(p[0], p[1], p[2]).project(camera);
		if (proj.z > 1) return null;
		return [((proj.x + 1) / 2) * w, ((1 - proj.y) / 2) * h];
	}

	function render(ctx, w, h, t) {
		const u = Math.min(1, t / SEC);
		const B = bodyAt(u, t);

		// The lathe: the arm's angle and the press.
		const phiNow = TAU * smooth(span(u, U_SWEEP[0], U_SWEEP[1]));
		const press = smooth(span(u, U_PRESS[0], U_PRESS[1]));
		writeHead(phiNow, press);
		writeTail(B);
		const H = placeHead(B);
		const sweeping = u >= U_SWEEP[0];
		headMesh.visible = sweeping;
		headLines[0].visible = headLines[1].visible = sweeping;
		// The arm: the profile at the arm's angle, written on before the sweep.
		{
			const P = armPos.array;
			const th = PHI_S - phiNow;
			const sn = Math.sin(th);
			const c = Math.cos(th);
			for (let j = 0; j < NP; j++) {
				P[3 * j] = prR[j] * sn;
				P[3 * j + 1] = -PROF[j];
				P[3 * j + 2] = prR[j] * c * pressOf(PROF[j], press);
			}
			armPos.needsUpdate = true;
			const wr = span(u, U_PROF[0], U_PROF[1]);
			armGeo.setDrawRange(0, Math.ceil(wr * NP));
			const a = 1 - smooth(span(u, U_SWEEP[1] - 0.01, U_SWEEP[1] + 0.03));
			arm.visible = armBack.visible = wr > 0 && a > 0.01;
			arm.material.opacity = 0.95 * a;
			armBack.material.opacity = 0.25 * a;
		}
		axisMat.opacity =
			0.3 *
			smooth(span(u, U_AXIS[0], U_AXIS[1])) *
			(1 - smooth(span(u, U_TAIL[0], U_TAIL[0] + 0.05)));
		axis.visible = axisMat.opacity > 0.005;
		const tailOn = B.ext > 0.01;
		tailMesh.visible = tailOn;
		tailLines[0].visible = tailLines[1].visible = tailOn;

		// The surface, written in ψ from ψ₀.
		const sw = span(u, U_SURF[0], U_SURF[1]);
		const dPsi = TAU * smooth(sw);
		const cols = Math.min(NJ, Math.floor((dPsi / TAU) * NJ + 1e-6));
		const surfOn = sw > 0;
		surf.visible = surfDepth.visible = surfOn;
		gridLines[0].visible = gridLines[1].visible = surfOn;
		surfGeo.setDrawRange(0, cols * perCol);
		gridGeo.setDrawRange(0, 2 * colStart[cols]);
		ray.visible = surfOn && sw < 1;
		if (ray.visible) {
			for (let i = 0; i < NI; i++) rayPos.array.set(surfP(RS[i], PSI0 + dPsi), 3 * i);
			rayPos.needsUpdate = true;
		}
		// The spiral ahead: in from where the head is, faint.
		{
			const q0 = Math.min(NAHEAD - 2, Math.ceil(lamOf(B.lHead) / AHEAD_DL));
			aheadGeo.setDrawRange(q0, NAHEAD - q0);
			aheadMat.opacity = 0.62 * smooth(span(u, U_SURF[1] - 0.02, U_SURF[1] + 0.06));
			ahead.visible = aheadMat.opacity > 0.005;
		}

		bpAlpha.value = smooth(span(u, U_SURF[0] - 0.01, U_SURF[0] + 0.03));
		bpSprite.visible = bpAlpha.value > 0.01;

		// The lens.
		const A = lensMake(u);
		const O = lensOver(u);
		const C = lensChase(u, B);
		const wAB = smooth(span(u, 0.44, 0.55));
		const wBC = smooth(span(u, 0.585, 0.73));
		const pos = lerp3(lerp3(A.pos, O.pos, wAB), C.pos, wBC);
		const tgt = lerp3(lerp3(A.tgt, O.tgt, wAB), C.tgt, wBC);
		camera.aspect = w / h;
		camera.position.set(pos[0], pos[1], pos[2]);
		camera.up.set(0, 1, 0);
		camera.lookAt(tgt[0], tgt[1], tgt[2]);
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();

		renderer.render(scene, camera);

		// The gold spark of life at the neck.
		const { dpr } = board;
		ctx.save();
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const spark =
			span(u, U_LIFE - 0.004, U_LIFE + 0.002) *
			(1 - smooth(span(u, U_LIFE + 0.004, U_LIFE + 0.05)));
		if (spark > 0.01) {
			const q = screen(add(H.o, mul(H.f, -5.5)), w, h);
			if (q) {
				bloom(ctx, q[0], q[1], 26, 'rgba(245, 193, 80, 0.55)', spark);
				disc(ctx, q[0], q[1], 2.6, { fill: PAL.gold, alpha: spark });
			}
		}
		ctx.restore();
	}

	// Compile every pipeline now, with everything shown, so that nothing
	// stalls the first time it appears (the surface at 0.455).
	{
		const shown = [];
		scene.traverse((o) => {
			shown.push([o, o.visible]);
			o.visible = true;
		});
		surfGeo.setDrawRange(0, Infinity);
		await renderer.compileAsync(scene, camera);
		for (const [o, v] of shown) o.visible = v;
	}

	return { render };
}
