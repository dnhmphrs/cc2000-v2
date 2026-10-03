import {
	getBoard,
	clearBoard,
	stroke,
	bloom,
	disc,
	PAL,
	TAU,
	GOLDEN_K,
	C,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	easeInOutCubic
} from './log/board.js';
import {
	NEAR,
	spline,
	spline3,
	orbit,
	pxPerUnit,
	makeDepth,
	runs3,
	blot,
	label3,
	lit3,
	limb,
	curl,
	sphereGrid
} from './log/space.js';
import { lecture } from './log/ink.js';

// ── Sketch: log-closure — the space round the sphere, closed up ──────────────
// The lead: "one where we see the projective closure of space outside the
// sphere when we zoom out". It opens on the turn's own frame — log-mobius ·
// sphere at u = 0.44, the board just closed into the Riemann sphere: the
// cyan and pink loxodromes of the net streaming pole to pole over grey nodes,
// the beat's gold arm, 0 lit, the rose equator and meridians, its caption —
// and lets the turn's marks go as the lens pulls back and the space AROUND
// the sphere is drawn: a cubic lattice of lines, written on out of the
// sphere's own cell, rose, chalk and violet by direction (x, y, z). Then it
// shows that space closing up on itself: compact, while staying open round
// every point in it. Ten seconds, a pure function of progress. The lens is
// one orbit + spline3 path per variant, re-timed by its own measured pace so
// it starts at rest and only gathers pace (lensPath). Every variant ends the
// way the turn does: the lens swinging to a lit point, a gold disc with a
// cream core growing to a third of the frame, the way on to the rooms.
// Everything is projected by hand (space.js); a software depth buffer of the
// sphere decides which lines are behind it, and those are faint and dashed.
// One per ?v=:
//
//   projective (default) ℝP³. The lattice is first straight lines in
//           perspective, each family running off toward its vanishing point;
//           then space is closed by p ↦ p / √(1 + |p|²/ρ²), which takes ℝ³
//           onto the open ball of radius ρ (the upper half of S³, seen from
//           above), ρ coming in from infinity to 5. Every line becomes a half-
//           ellipse whose two ends are ANTIPODAL points of the ball's boundary,
//           and parallel lines share their ends: the x-lines all end at ±∞ₓ,
//           and so on. That boundary is the plane at infinity, each pair of
//           antipodes one point (so each is labelled twice). A gold bead runs
//           out of 0 along the line tangent there, reaches ∞ₓ, comes back in
//           at −∞ₓ — the same point — and closes its loop at 0. The lens comes
//           round and dives at ∞ₓ, the x-lines meeting in it like meridians.
//   conformal S³ = ℝ³ ∪ {∞}. The same lattice, lifted onto S³ ⊂ ℝ⁴ by inverse
//           stereographic projection, P = (2q, |q|² − 1)/(|q|² + 1), q = p/ρ,
//           S³ turned in 4D by α in the plane of x₁ and x₄, and projected
//           back, p′ = ρ (P₁, P₂, P₃)/(1 − P₄). At α = 0 the lines are straight;
//           as α grows every line bends into a circle, and they all pass
//           through one point — ∞, carried to ρ cot(α/2) on the x-axis — lit,
//           coming in from infinity to sit in the picture. The Riemann sphere,
//           carried by the same map, stays round (its centre and radius are
//           exact: it is a slice of S³) as it swells and slides away from ∞.
//           The lens swings to ∞ and dives at it.
//   hopf    the Hopf fibration π : S³ → S², (z₁, z₂) ↦ z₁/z₂: each point w of
//           the Riemann sphere is the great circle e^{iφ}(w, 1)/√(1 + |w|²) of
//           S³, projected stereographically from (1, 0) to a circle of space.
//           π⁻¹(0) — the lit point's own fibre — is the gold ring round the
//           sphere's waist, π⁻¹(∞) the sphere's axis, a straight line through ∞.
//           Points light one by one along a cyan loxodrome of the net, round 0,
//           each fibre written into the space round the sphere as it lights —
//           every one threading the gold ring — then along a pink one; then a
//           ring of latitude, drawn gold, lifts to a torus of gold circles (its
//           Villarceau circles) coiled round π⁻¹(0). (The turn's zoom coasts to
//           rest first, so the points hold still.) The fibres are woven the
//           knot-diagram way, cut where a nearer one passes over, so the links
//           show. The lens pulls back and loops round and up to see space
//           filled with nested tori — never more than 60° off the axis, so
//           the rings never go edge-on — and comes down the axis to 0, the
//           ring and its torus closing round it.
//   mirror  inversion in the sphere, x ↦ x/|x|²: the space outside has a copy
//           inside. The lattice is written outward to infinity outside, and in
//           step its image is written INSIDE — each line a circle through the
//           centre, the far lines' circles nested ever smaller round it — as
//           the net fades and the sphere becomes the mirror. A gold line
//           tangent at 0 runs off to infinity both ways while its image, the
//           gold circle from 0 to the centre, closes; a bead x runs out along
//           it as its image x* runs in: |x| ↦ 1/|x|. The centre is ∞'s image,
//           lit; the lens comes round and dives through the glass into it.
//
// Every frame is a pure function of progress: ?at= pins it exactly. About
// 15–40 ms a frame headless at 1280 × 800, hopf's dive the heaviest.

const SECONDS = 10;
const K = GOLDEN_K; // the cyan family's rate: golden loxodromes
const KP = 0.9; // the pink family's pitch, the other way
const N = 8; // arms in each family
const RING = TAU / (N * (1 / K + 1 / KP)); // node spacing along an arm, in log|z|
const io = (t) => easeInOutCubic(clamp01(t));
const ORIGIN = [0, 0, 0];

// The hand-over. Every variant opens on the turn's own frame — log-mobius ·
// sphere at u = 0.44, the board just closed into the Riemann sphere and its
// boost not yet begun: its lens (OPEN), its zoom carried on at its own law
// (zoomOf, the net streaming from 0 to ∞), its line weight (netRef), the rose
// equator and meridians the board's unit circle and axes landed on, the 0
// and ∞ by its poles and its caption — and lets them go into its own.
const U0 = 0.44;
const OPEN = { target: [0, 0.1968, 0.1958], az: 0.476, el: 0.2962, dist: 5.039, fov: 33.96 };
const zoomOf = (u) => 1.5 * (U0 + u) + 2.2 * Math.pow(U0 + u, 3);
const netRef = (w, h) => (2 * pxPerUnit(h, 36)) / (0.42 * Math.min(w, h));
// The lens paths below are keyed about the sphere centred, from BASE; the
// hand-over pose is blended in at the start and out by s = 0.3.
const BASE = { az: 0.55, el: 0.32, dist: 4.2, fov: 36 };

export default async function make({ at }) {
	const v = variant(['projective', 'conformal', 'hopf', 'mirror']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const Z = makeDepth();

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		if (v === 'projective') projective(ctx, w, h, u, Z);
		else if (v === 'conformal') conformal(ctx, w, h, u, Z);
		else if (v === 'hopf') hopf(ctx, w, h, u, Z);
		else mirror(ctx, w, h, u, Z);
		tag(ctx, w, h, `log-closure · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Runs (from runs3) painted with as few strokes as will do: behind the
// surface faint and dashed; in front, one stroke per stretch of the run whose
// fade and depth-width hold (quantised), so a long line is a few strokes, not
// one per ten points.
const wOf = (ref, z) => (ref ? Math.min(2.4, Math.max(0.5, ref / z)) : 1);
function ink(ctx, R, o, which = null) {
	const { color, width = 2, alpha = 1, glow = 0, ref = 0, hid = 0.32 } = o;
	if (alpha <= 0.003) return;
	for (const r of R) {
		if (which && (which === 'back') !== r.back) continue;
		const Q = r.Q;
		if (r.back) {
			if (hid <= 0) continue;
			stroke(ctx, Q, {
				color,
				width: Math.max(0.8, width * 0.62),
				alpha: alpha * hid * Q[Q.length >> 1][3],
				dash: [3, 6]
			});
			continue;
		}
		const key = (q) => Math.round(q[3] * 5) * 64 + Math.round(wOf(ref, q[2]) * 5);
		let i0 = 0;
		let k0 = key(Q[0]);
		for (let i = 1; i < Q.length; i++) {
			const k = i === Q.length - 1 ? -1 : key(Q[i]);
			if (k === k0) continue;
			const seg = Q.slice(i0, i + 1);
			const mid = seg[seg.length >> 1];
			stroke(ctx, seg, {
				color,
				width: width * wOf(ref, mid[2]),
				alpha: alpha * mid[3],
				glow,
				cap: i0 === 0 && i === Q.length - 1 ? 'round' : 'butt'
			});
			i0 = i;
			k0 = k;
		}
	}
}

// A 3D polyline split by a predicate on its points (behind a sphere that is
// not in the depth buffer — the plane at infinity, say).
function runsBy(cam, pts, isBack) {
	const out = [];
	let run = null;
	for (const p of pts) {
		const q = cam.project(p);
		if (q[2] <= NEAR || !Number.isFinite(q[0] + q[1])) {
			if (run && run.Q.length > 1) out.push(run);
			run = null;
			continue;
		}
		const back = isBack(p);
		if (run && back !== run.back) {
			run.Q.push([q[0], q[1], q[2], 1]);
			if (run.Q.length > 1) out.push(run);
			run = null;
		}
		if (!run) run = { Q: [], back };
		run.Q.push([q[0], q[1], q[2], 1]);
	}
	if (run && run.Q.length > 1) out.push(run);
	return out;
}

// The screen radius of a sphere, px: for level of detail.
function screenR(cam, h, fov, c, r) {
	const d = Math.hypot(...sub3(cam.pos, c));
	return (pxPerUnit(h, fov) * r) / Math.sqrt(Math.max(1e-6, d * d - r * r));
}

// A small lit point: a gold disc, a cream core, a little halo.
function spark(ctx, cam, P, r, a = 1, Z = null) {
	if (a <= 0) return;
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const k = Z && Z.hidden(q) ? 0.35 : 1;
	bloom(ctx, q[0], q[1], r * 3.2, 'rgba(255, 222, 150, 0.6)', a * k);
	disc(ctx, q[0], q[1], r, { fill: PAL.gold, alpha: a * k });
	disc(ctx, q[0], q[1], r * 0.45, { fill: '#fffaf0', alpha: a * k });
}

// Curves that pass over and under each other, drawn the knot-diagram way:
// each cut into short pieces, painted far to near over a dark casing, so the
// nearer of two crossing curves breaks the farther. `curves` are
// { pts, color, width, alpha, glow }; the parts behind the sphere in Z go
// first, faint and dashed, and `between()` (the sphere) is drawn over them.
function weave(ctx, cam, Z, curves, ref, between = null) {
	const pieces = [];
	for (const c of curves) {
		for (const r of runs3(cam, c.pts, { depth: Z })) {
			const Q = r.Q;
			if (r.back) {
				stroke(ctx, Q, {
					color: c.color,
					width: Math.max(0.8, c.width * 0.62),
					alpha: c.alpha * 0.38,
					dash: [3, 6]
				});
				continue;
			}
			for (let i = 0; i < Q.length - 1; i += 6) {
				const seg = Q.slice(i, Math.min(Q.length, i + 7));
				let z = 0;
				for (const q of seg) z += q[2];
				pieces.push({ seg, z: z / seg.length, c });
			}
		}
	}
	if (between) between();
	pieces.sort((a, b) => b.z - a.z);
	// The casing stops a little short of a piece's ends, so it never bites
	// into the pieces of its own curve either side.
	const short = (seg) => {
		const n = seg.length - 1;
		const a = seg[0];
		const b = seg[n];
		return [
			[lerp(a[0], seg[1][0], 0.45), lerp(a[1], seg[1][1], 0.45)],
			...seg.slice(1, n),
			[lerp(b[0], seg[n - 1][0], 0.45), lerp(b[1], seg[n - 1][1], 0.45)]
		];
	};
	for (const { seg, z, c } of pieces) {
		const wd = c.width * wOf(ref, z);
		stroke(ctx, short(seg), {
			color: PAL.ground,
			width: wd + 3.5,
			alpha: 0.92 * c.alpha,
			cap: 'butt'
		});
		stroke(ctx, seg, { color: c.color, width: wd, alpha: c.alpha, glow: c.glow ?? 0, cap: 'butt' });
	}
}

// ── The lens ─────────────────────────────────────────────────────────────────
// Each variant's lens is a keyframed path — target, azimuth, elevation,
// distance (splined in log, so a zoom keeps its pace at every scale) and
// field of view — re-timed so it only gathers pace: the path's visual pace
// along its own keys (the turn of the view, plus the zoom, the target's pan
// and the field's zoom, per unit of path) is measured once, its running
// maximum is the pace to keep, and progress u is mapped to the point the
// lens reaches at that pace. So the lens never slows, whatever the keys do,
// and keys that already mostly gather pace land within a few hundredths of
// the u they were set at. The hand-over pose (OPEN) is blended in at the
// start, with no pace of its own. Returns u ↦ { target, az, el, dist, fov }.
function lensPath(L) {
	const lnd = L.dist.map(([k, d]) => [k, Math.log(d)]);
	const T0 = L.target ? L.target[0][1] : ORIGIN;
	const pose = (s) => {
		const k = 1 - smooth(s / 0.3);
		return {
			target: add3(L.target ? spline3(s, L.target) : ORIGIN, mul3(sub3(OPEN.target, T0), k)),
			az: spline(s, L.az) + k * (OPEN.az - L.az[0][1]),
			el: spline(s, L.el) + k * (OPEN.el - L.el[0][1]),
			dist: Math.exp(spline(s, lnd) + k * Math.log(OPEN.dist / L.dist[0][1])),
			fov: spline(s, L.fov) + k * (OPEN.fov - L.fov[0][1])
		};
	};
	const M = 400;
	const look = (s) => {
		const p = pose(s);
		const ce = Math.cos(p.el);
		const d = [Math.sin(p.az) * ce, Math.sin(p.el), Math.cos(p.az) * ce];
		return { p, d, f: Math.log(Math.tan((p.fov * Math.PI) / 360)) };
	};
	const len = [0];
	const pace = [];
	let a = look(0);
	for (let i = 1; i <= M; i++) {
		const b = look(i / M);
		const step =
			Math.hypot(...sub3(b.d, a.d)) +
			Math.abs(Math.log(b.p.dist / a.p.dist)) +
			Math.hypot(...sub3(b.p.target, a.p.target)) / ((a.p.dist + b.p.dist) / 2) +
			Math.abs(b.f - a.f);
		pace.push(step * M);
		len.push(len[i - 1] + step);
		a = b;
	}
	const keep = [0];
	let top = 0;
	for (let i = 0; i < M; i++) {
		top = Math.max(top, pace[i]);
		keep.push(keep[i] + top / M);
	}
	const k = len[M] / keep[M];
	const warp = new Float64Array(M + 1);
	for (let i = 0, j = 0; i <= M; i++) {
		const want = k * keep[i];
		while (j < M - 1 && len[j + 1] < want) j++;
		const seg = len[j + 1] - len[j];
		warp[i] = (j + (seg > 0 ? clamp01((want - len[j]) / seg) : 0)) / M;
	}
	return (u) => {
		const x = clamp01(u) * M;
		const i = Math.min(M - 1, Math.floor(x));
		return pose(lerp(warp[i], warp[i + 1], x - i));
	};
}

// ── The net ──────────────────────────────────────────────────────────────────
// log-mobius's: in ζ = log z = x + iθ, cyan arm j is θ = (x − m)/K + 2πj/N,
// pink arm j is θ = −(x − m)/KP + 2π(j + ½)/N, nodes ride the cyan arms a
// RING apart, and m is the zoom streaming the net from 0 to ∞. `place` takes
// ζ to 3D. `lod` (0..1) thins the points when the sphere is small.
function arm(j, m, x0, x1, dx, pink) {
	const n = Math.max(2, Math.ceil((x1 - x0) / dx));
	const out = [];
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		out.push(pink ? [x, -(x - m) / KP + (TAU * (j + 0.5)) / N] : [x, (x - m) / K + (TAU * j) / N]);
	}
	return out;
}
function netNodes(m, x0, x1) {
	const out = [];
	const l0 = Math.ceil((x0 - m) / RING);
	const l1 = Math.floor((x1 - m) / RING);
	for (let l = l0; l <= l1; l++)
		for (let j = 0; j < N; j++) out.push([m + l * RING, (l * RING) / K + (TAU * j) / N]);
	return out;
}
const ringZ = ([x, th], r, n = 12) => {
	const out = [];
	for (let i = 0; i < n; i++)
		out.push([x + r * Math.cos((TAU * i) / n), th + r * Math.sin((TAU * i) / n)]);
	return out;
};

function drawNet(ctx, cam, Z, place, o) {
	const {
		m = 0,
		X = 4.2,
		alpha = 0.9,
		ref = 0,
		hid = 0.32,
		node = 1,
		gold = 1,
		lod = 1,
		nodeCap = 13,
		width = 2.2
	} = o;
	if (alpha <= 0.01) return;
	const lines = [];
	for (let j = 0; j < N; j++) {
		const pz = arm(j, m, -X, X, 0.03 / lod, true); // log-mobius's sampling at lod 1
		lines.push({ R: runs3(cam, pz.map(place), { depth: Z }), color: PAL.pink });
		const cz = arm(j, m, -X, X, 0.012 / lod, false);
		const R = runs3(cam, cz.map(place), { depth: Z });
		lines.push({ R, color: PAL.cyan, gold: j === 0 && gold > 0 });
	}
	const o1 = { width, alpha, ref, hid };
	for (const L of lines) ink(ctx, L.R, { ...o1, color: L.color }, 'back');
	for (const L of lines)
		if (L.gold)
			ink(ctx, L.R, { ...o1, color: PAL.gold, width: 3.2, alpha: gold * alpha * 0.8 }, 'back');
	const NODES = node > 0.02 ? netNodes(m, -X + 0.05, X - 0.05) : [];
	const rz = 0.11 * RING * 1.25;
	const nodeDraw = (which) => {
		for (const c of NODES) {
			const P0 = place(c);
			const q0 = cam.project(P0);
			if (q0[2] <= NEAR) continue;
			const back = Z.hidden(q0);
			if ((which === 'back') !== back) continue;
			const q1 = cam.project(place([c[0] + rz, c[1]]));
			const rpx = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
			if (rpx < 0.7) continue;
			const a = ((0.85 * node * alpha) / 0.9) * (back ? 0.5 * hid : 1);
			if (rpx < 3.5) {
				disc(ctx, q0[0], q0[1], rpx, { fill: PAL.node, alpha: a });
				continue;
			}
			const sc = rpx > nodeCap ? nodeCap / rpx : 1;
			blot(ctx, cam, ringZ(c, rz * sc).map(place), {
				fill: PAL.node,
				alpha: (0.85 * node * alpha) / 0.9,
				hidAlpha: 0.5 * hid,
				centre: P0,
				depth: Z
			});
		}
	};
	nodeDraw('back');
	for (const L of lines) ink(ctx, L.R, { ...o1, color: L.color }, 'front');
	for (const L of lines)
		if (L.gold)
			ink(ctx, L.R, { ...o1, color: PAL.gold, width: 3.6, alpha: gold * alpha, glow: 8 }, 'front');
	nodeDraw('front');
}

// The sphere under a map of space `T`: its outline, the net, and 0 lit.
function sphereWith(ctx, cam, Z, T, o) {
	const { h, fov, centre = ORIGIN, radius = 1, m = 0, a = 1, lit = 1, gold = 1, node = 1 } = o;
	const place = ([x, th]) => T(curl(C.exp([x, th]), 1));
	const rpx = screenR(cam, h, fov, centre, radius);
	const lod = clamp01(rpx / 260) * 0.75 + 0.25;
	limb(ctx, cam, a, centre, radius);
	if (o.turn !== undefined) turnFrame(ctx, cam, Z, T, o.turn, o.ref);
	drawNet(ctx, cam, Z, place, {
		m,
		alpha: 0.9 * a,
		ref: o.ref,
		lod,
		gold,
		node: node * smooth(span(rpx, 40, 110)),
		width: lerp(1.3, 2.2, smooth(span(rpx, 60, 260))),
		hid: o.hid ?? 0.32
	});
	// 0, lit: a gold cap and a lit point.
	const A3 = T([0, 0, 1]);
	if (lit > 0) {
		const cap = [];
		for (let i = 0; i < 24; i++) cap.push(T(curl(C.polar(0.035, (TAU * i) / 24), 1)));
		blot(ctx, cam, cap, { fill: PAL.gold, alpha: lit, hidAlpha: 0.35, centre: A3, depth: Z });
		const qa = cam.project(A3);
		if (qa[2] > NEAR)
			lit3(ctx, cam, A3, Math.max(2.5, Math.min(6, rpx * 0.0152)), (Z.hidden(qa) ? 0.35 : 1) * lit);
	}
	return { A3, rpx, place };
}

// What the turn leaves on the board at the hand-over, let go of over the first
// beats: the rose equator and two meridians (the board's unit circle and
// axes, curled) under the net — drawn by sphereWith when given `turn` — and
// over it, 0 and ∞ by the poles and its caption. `T` maps space, `ref` is the
// turn's line weight, `zero` how long the 0 stays.
function turnFrame(ctx, cam, Z, T, u, ref) {
	const fa = 0.55 * (1 - span(u, 0.04, 0.24));
	if (fa <= 0) return;
	const o = { color: PAL.rose, width: 2, alpha: 0.7 * fa, ref, hid: 0.5 };
	const merid = (a) => {
		const pts = [];
		for (let i = 0; i <= 200; i++) {
			const t = Math.PI * (i / 100 - 1);
			pts.push(T([Math.sin(t) * Math.cos(a), Math.sin(t) * Math.sin(a), Math.cos(t)]));
		}
		return pts;
	};
	const eq = [];
	for (let i = 0; i <= 200; i++)
		eq.push(T([Math.cos((TAU * i) / 200), Math.sin((TAU * i) / 200), 0]));
	for (const pts of [merid(0), merid(Math.PI / 2), eq]) ink(ctx, runs3(cam, pts, { depth: Z }), o);
}
function turnMarks(ctx, cam, Z, T, u, w, h, zero = 0.34) {
	label3(ctx, cam, T([0, 0, 1]), '0', {
		dx: -14,
		dy: -18,
		size: 26,
		alpha: 1 - span(u, zero, zero + 0.06),
		depth: Z
	});
	label3(ctx, cam, T([0, 0, -1]), '∞', {
		dx: 16,
		dy: 22,
		size: 26,
		alpha: 1 - span(u, 0.04, 0.12),
		depth: Z
	});
	lecture(ctx, w, h, [['z = (X + iY) / (1 − Z)', 1, 1 - span(u, 0.03, 0.11)]], { back: 0 });
}

// The lecture, its patch of board only as deep as the lines begun so far
// (they are written in order, so each keeps its place).
const notes = (ctx, w, h, lines) =>
	lecture(
		ctx,
		w,
		h,
		lines.filter(([, p]) => p > 0)
	);

// The way in: a lit disc growing — gold, a cream core and a bloom. On a
// surface: `at(r, a)` is the surface point r from the centre P, at angle a.
function portalOn(ctx, cam, Z, at, P, r, g, R) {
	const qp = cam.project(P);
	if (qp[2] <= NEAR) return;
	if (g > 0 && !(Z && Z.hidden(qp)))
		bloom(ctx, qp[0], qp[1], R * (0.1 + 0.55 * g), 'rgba(255, 222, 150, 0.55)', g);
	const ring = (s) => {
		const out = [];
		for (let i = 0; i < 72; i++) out.push(at(r * s, (TAU * i) / 72));
		return out;
	};
	blot(ctx, cam, ring(1), { fill: PAL.gold, alpha: 0.95, hidAlpha: 0.3, centre: P, depth: Z });
	if (g > 0.3) blot(ctx, cam, ring(0.58), { fill: '#fff6e0', alpha: span(g, 0.3, 0.8), centre: P });
}
// … and at a point of space (∞ carried in, the centre): facing the lens.
function portalAt(ctx, cam, h, fov, P, rw, g, R) {
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const r = (pxPerUnit(h, fov) * rw) / q[2];
	if (g > 0) bloom(ctx, q[0], q[1], R * (0.1 + 0.55 * g) + r, 'rgba(255, 222, 150, 0.55)', g);
	disc(ctx, q[0], q[1], r, { fill: PAL.gold, alpha: 0.95 });
	if (g > 0.3) disc(ctx, q[0], q[1], r * 0.58, { fill: '#fff6e0', alpha: span(g, 0.3, 0.8) });
}

// ── The lattice ──────────────────────────────────────────────────────────────
// The cubic lattice of space round the sphere: lines a GAP apart, none
// through the sphere's own cell, in three families — x-lines rose, y-lines
// chalk, z-lines violet. p0 is a line's nearest point to the origin, D its
// distance, d its direction.
const GAP = 2.5;
const LAT = [-1.5, -0.5, 0.5, 1.5].map((k) => k * GAP);
const ROSE = '#c99a8c'; // the rose, lifted a little: the x-lines lead the eye
const FAMC = [ROSE, PAL.chalk, PAL.violet];
const FAMA = [0.85, 0.5, 0.72];
const LINES = [];
for (let f = 0; f < 3; f++)
	for (const a of LAT)
		for (const c of LAT) {
			const p0 = [0, 0, 0];
			p0[(f + 1) % 3] = a;
			p0[(f + 2) % 3] = c;
			const d = [0, 0, 0];
			d[f] = 1;
			LINES.push({ p0, d, D: Math.hypot(a, c), f });
		}
const DMIN = Math.min(...LINES.map((l) => l.D));
const DMAX = Math.max(...LINES.map((l) => l.D));
// How far a line is written: the nearest first, from u0, each over `len`.
const writeOf = (l, u, u0, spread, len) => {
	const a = u0 + (spread * (l.D - DMIN)) / (DMAX - DMIN);
	return io(span(u, a, a + len));
};
const TLINE = 2; // t = TLINE sinh v: dense near the sphere, reaching far
const outerA = (l) => 1 - 0.35 * span(l.D, 3, DMAX);

// ── projective ───────────────────────────────────────────────────────────────
const PR = 5; // the ball's radius once space is closed: the plane at ∞
const AXN = ['x', 'y', 'z'];

// The lens: out from the sphere as the lattice is written and closed, clear
// of az = π/4 while it is on show (from there whole planes of it line up
// edge-on), rising over the ball as it turns, then round and down onto the
// x-axis and in at ∞ₓ.
const PROJ_LENS = lensPath({
	target: [
		[0, ORIGIN],
		[0.74, ORIGIN],
		[0.9, [PR * 0.55, 0, 0]],
		[1, [PR, 0, 0]]
	],
	az: [
		[0, BASE.az],
		[0.1, 0.555],
		[0.2, 0.57],
		[0.3, 0.59],
		[0.4, 0.615],
		[0.5, 0.645],
		[0.6, 0.69],
		[0.7, 0.82],
		[0.78, 1.08],
		[0.86, 1.36],
		[0.93, 1.52],
		[1, Math.PI / 2]
	],
	el: [
		[0, BASE.el],
		[0.1, 0.335],
		[0.2, 0.355],
		[0.3, 0.38],
		[0.4, 0.41],
		[0.5, 0.45],
		[0.6, 0.5],
		[0.68, 0.58],
		[0.75, 0.62],
		[0.82, 0.52],
		[0.9, 0.27],
		[1, 0.0001]
	],
	dist: [
		[0, BASE.dist],
		[0.1, 4.6],
		[0.2, 5.5],
		[0.3, 6.8],
		[0.4, 8.6],
		[0.5, 11.2],
		[0.6, 14.6],
		[0.7, 17.8],
		[0.8, 19.4],
		[0.88, 12],
		[0.95, 4.5],
		[1, 1.15]
	],
	fov: [
		[0, BASE.fov],
		[0.86, 38],
		[1, 60]
	]
});

function projective(ctx, w, h, u, Z) {
	const R = 0.42 * Math.min(w, h);
	const lens = PROJ_LENS(u);
	const fov = lens.fov;
	// The closure: ρ (the radius the plane at ∞ is drawn at) in from ∞ to PR.
	const s = io(span(u, 0.3, 0.6));
	const inv2 = (s * s) / (PR * PR);
	const rho = s > 1e-6 ? PR / s : Infinity;
	const F = (p) => (inv2 > 0 ? mul3(p, 1 / Math.sqrt(1 + dot(p, p) * inv2)) : p);
	const XP = [PR, 0, 0]; // ∞ₓ, where the lens is going
	const cam = orbit(w, h, lens);
	const ref = BASE.dist;
	const dc = Math.hypot(...cam.pos);
	const focus = span(u, 0.76, 0.92); // onto the x-lines, which meet where we go

	// The sphere, at the centre of it all (F scales it by 1/√(1 + 1/ρ²)).
	const rs = 1 / Math.sqrt(1 + inv2);
	Z.reset(w, h);
	Z.grid(cam, sphereGrid(ORIGIN, rs, 18, 26));

	// The plane at infinity: the ball's boundary, once it is in front of us.
	const bA = s > 0 ? smooth(span(dc / rho, 1.05, 1.6)) : 0;
	if (bA > 0) {
		limb(ctx, cam, bA * 0.8, ORIGIN, rho, PAL.chalk);
		const facing = (p) => dot(p, sub3(cam.pos, p)) < 0;
		for (const ax of [
			[0, 0, 1],
			[0, 1, 0]
		]) {
			const e1 = ax[2] ? [1, 0, 0] : [0, 0, 1];
			const e2 = norm(cross(ax, e1));
			const pts = [];
			for (let i = 0; i <= 160; i++) {
				const a = (TAU * i) / 160;
				pts.push(add3(mul3(e1, rho * Math.cos(a)), mul3(e2, rho * Math.sin(a))));
			}
			ink(ctx, runsBy(cam, pts, facing), {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.3 * bA * (1 - 0.5 * focus),
				hid: 0.6
			});
		}
	}

	// The lattice: written out of the sphere's cell, then closed by F.
	const cloud = 0.62 * dc; // how far out the lattice is seen, before it closes
	for (const l of LINES) {
		const e = writeOf(l, u, 0.04, 0.16, 0.22);
		if (e <= 0) continue;
		const tTip = e * cloud * 1.6;
		const V = lerp(Math.asinh(tTip / TLINE), Math.asinh(1e4 / TLINE), s * e);
		const n = 120;
		const pts = [];
		const fades = [];
		for (let i = 0; i <= n; i++) {
			const t = TLINE * Math.sinh(lerp(-V, V, i / n));
			const q = F(add3(l.p0, mul3(l.d, t)));
			pts.push(q);
			const fog = 1 - smooth(span(Math.hypot(...q), cloud, cloud * 1.45));
			const near = smooth(span(Math.hypot(...sub3(q, cam.pos)), 0.8, 3));
			fades.push(Math.max(fog, smooth(span(s, 0.55, 0.95))) * near);
		}
		const k = l.f === 0 ? 1 + 0.25 * focus : 1 - 0.6 * focus;
		ink(ctx, runs3(cam, pts, { depth: Z, fade: (p, i) => fades[i] }), {
			color: FAMC[l.f],
			width: 1.5,
			alpha: FAMA[l.f] * outerA(l) * k,
			ref,
			hid: 0.45
		});
	}

	// The sphere and its net, over the lattice.
	const nref = netRef(w, h);
	sphereWith(ctx, cam, Z, F, {
		h,
		fov,
		radius: rs,
		m: zoomOf(u),
		ref: nref,
		turn: u,
		gold: 1 - 0.6 * span(u, 0.5, 0.6)
	});
	turnMarks(ctx, cam, Z, F, u, w, h);

	// The points at infinity: each family's two ends, one point, named twice.
	const mA = span(u, 0.5, 0.58) * (1 - span(u, 0.88, 0.94)) * bA;
	if (mA > 0) {
		const qc = cam.project(ORIGIN);
		for (let f = 0; f < 3; f++)
			for (const sg of [1, -1]) {
				const P = [0, 0, 0];
				P[f] = sg * rho;
				const q = cam.project(P);
				if (q[2] <= NEAR) continue;
				const back = dot(P, sub3(cam.pos, P)) < 0;
				const isX = f === 0;
				disc(ctx, q[0], q[1], isX ? 5 : 3.5, {
					fill: isX ? PAL.gold : FAMC[f],
					alpha: mA * (back ? 0.5 : 1)
				});
				const dx = q[0] - qc[0];
				const dy = q[1] - qc[1];
				const L = Math.hypot(dx, dy) || 1;
				label3(ctx, cam, P, `∞_{${AXN[f]}}`, {
					dx: (24 * dx) / L,
					dy: (24 * dy) / L,
					size: 21,
					alpha: mA * (back ? 0.55 : 0.95),
					color: isX ? PAL.gold : PAL.chalk
				});
			}
	}

	// The gold line: tangent to the sphere at 0, along x. A bead runs out
	// along it to ∞ₓ and comes back in at −∞ₓ (the same point), to 0.
	const bead = span(u, 0.56, 0.8);
	if (bead > 0 && s > 0.99) {
		const c = Math.sqrt(1 + PR * PR);
		// Its image, a half-ellipse: F((c tan ψ, 0, 1)) = (PR sin ψ, 0, PR cos ψ / c).
		const E = (psi) => [PR * Math.sin(psi), 0, (PR * Math.cos(psi)) / c];
		const phi = Math.PI * Math.pow(bead, 1.15);
		const out = [];
		const back = [];
		const a1 = Math.min(phi, Math.PI / 2);
		for (let i = 0; i <= 90; i++) out.push(E((a1 * i) / 90));
		if (phi > Math.PI / 2) {
			const a2 = phi - Math.PI;
			for (let i = 0; i <= 90; i++) back.push(E(-Math.PI / 2 + ((a2 + Math.PI / 2) * i) / 90));
		}
		const go = { color: PAL.gold, width: 3, alpha: 1 - 0.5 * focus, ref, glow: 8, hid: 0.5 };
		ink(ctx, runs3(cam, out, { depth: Z }), go);
		if (back.length) ink(ctx, runs3(cam, back, { depth: Z }), go);
		if (bead < 1) spark(ctx, cam, phi <= Math.PI / 2 ? E(phi) : E(phi - Math.PI), 6, 1, Z);
		// The crossing: ∞ₓ flashes at both its ends as the bead goes through.
		const fl = span(phi, 1.4, Math.PI / 2) * (1 - span(phi, Math.PI / 2, 2.0));
		for (const sg of [1, -1]) {
			const q = cam.project([sg * PR, 0, 0]);
			if (q[2] > NEAR && fl > 0)
				bloom(ctx, q[0], q[1], R * 0.14 * fl, 'rgba(255, 230, 170, 0.8)', fl);
		}
	}

	// The way on: ∞ₓ, lit, grows as the lens dives at it.
	const g = span(u, 0.78, 1);
	if (g > 0) {
		const at = (r, a) => [
			PR * Math.cos(r),
			PR * Math.sin(r) * Math.cos(a),
			PR * Math.sin(r) * Math.sin(a)
		];
		portalOn(ctx, cam, null, at, XP, 0.008 + 0.038 * Math.pow(g, 1.2), g, R);
	}

	const out = 1 - span(u, 0.88, 0.95);
	notes(ctx, w, h, [
		['ℝP³ = ℝ³ ∪ (plane at ∞)', span(u, 0.36, 0.46), out],
		['parallel lines meet at ∞', span(u, 0.5, 0.58), out],
		['x ∼ −x on the sphere at ∞', span(u, 0.62, 0.7), out]
	]);
}

// ── conformal ────────────────────────────────────────────────────────────────
// S³ ⊂ ℝ⁴ by inverse stereographic projection (q = p/CR), turned by α in the
// (x₁, x₄) plane, projected back. ∞ = (0, 0, 0, 1) lands at CR cot(α/2) x̂.
const CR = 2.5;
const A_END = 1.45;
const lift = (p) => {
	const q = mul3(p, 1 / CR);
	const n = dot(q, q);
	return [(2 * q[0]) / (n + 1), (2 * q[1]) / (n + 1), (2 * q[2]) / (n + 1), (n - 1) / (n + 1)];
};
const turn14 = (P, a) => {
	const c = Math.cos(a);
	const s = Math.sin(a);
	return [c * P[0] + s * P[3], P[1], P[2], -s * P[0] + c * P[3]];
};
const drop = (P) => {
	const d = 1 - P[3];
	if (d < 1e-9) return [Infinity, Infinity, Infinity];
	return [(CR * P[0]) / d, (CR * P[1]) / d, (CR * P[2]) / d];
};
const NP = [0, 0, 0, 1];
const infOf = (a) => drop(turn14(NP, a));
// The unit sphere, carried: it is the slice P₄ = H of S³, and after the turn
// the round sphere of centre −CR sin α/(cos α − H) x̂, radius CR√(1−H²)/|cos α − H|.
const H = (1 / (CR * CR) - 1) / (1 / (CR * CR) + 1);
const sphereOf = (a) => {
	const k = Math.cos(a) - H;
	return { c: [(-CR * Math.sin(a)) / k, 0, 0], r: (CR * Math.sqrt(1 - H * H)) / Math.abs(k) };
};

// Where ∞ comes to rest, and the middle of it and the carried sphere.
const INF_END = infOf(A_END);
const MID = mul3(add3(sphereOf(A_END).c, INF_END), 0.5);
// The lens: out as the lattice is written, holding ∞'s side (+x) on its
// right while ∞ comes in, rising, then round onto the x-axis, which ∞ lies
// on — the circles of the x-lines, each in a plane through that axis, come
// into it as spokes — and in.
const CONF_LENS = lensPath({
	target: [
		[0, ORIGIN],
		[0.3, [0.12, 0, 0]],
		[0.5, [0.1, 0, 0]],
		[0.66, MID],
		[0.76, [0.5, 0, 0]],
		[0.86, [1.6, 0, 0]],
		[0.94, [2.4, 0, 0]],
		[1, INF_END]
	],
	az: [
		[0, BASE.az],
		[0.1, 0.545],
		[0.2, 0.535],
		[0.3, 0.52],
		[0.4, 0.5],
		[0.5, 0.47],
		[0.6, 0.45],
		[0.7, 0.5],
		[0.78, 0.7],
		[0.86, 1.0],
		[0.93, 1.33],
		[1, Math.PI / 2]
	],
	el: [
		[0, BASE.el],
		[0.1, 0.335],
		[0.2, 0.355],
		[0.3, 0.38],
		[0.4, 0.41],
		[0.5, 0.46],
		[0.6, 0.56],
		[0.7, 0.68],
		[0.76, 0.7],
		[0.84, 0.55],
		[0.92, 0.28],
		[1, 0.0001]
	],
	dist: [
		[0, BASE.dist],
		[0.1, 4.6],
		[0.2, 5.5],
		[0.3, 6.8],
		[0.4, 8.6],
		[0.5, 11.2],
		[0.6, 14.4],
		[0.7, 17.4],
		[0.78, 18.5],
		[0.86, 12],
		[0.94, 4.5],
		[1, 0.95]
	],
	fov: [
		[0, BASE.fov],
		[0.84, 40],
		[1, 60]
	]
});

function conformal(ctx, w, h, u, Z) {
	const R = 0.42 * Math.min(w, h);
	const lens = CONF_LENS(u);
	const fov = lens.fov;
	const a = A_END * io(span(u, 0.3, 0.7));
	const M = (p) => (a > 1e-5 ? drop(turn14(lift(p), a)) : p);
	const INF = a > 1e-3 ? infOf(a) : [1e9, 0, 0];
	const sph = sphereOf(a);
	const cam = orbit(w, h, lens);
	const ref = BASE.dist;
	const dc = Math.hypot(...sub3(cam.pos, sph.c));

	Z.reset(w, h);
	Z.grid(cam, sphereGrid(sph.c, sph.r, 18, 26));

	// The lattice: each line's lift is a circle of S³ through ∞; ψ goes
	// round it (t = c tan ψ/2), and ψ = ±π is ∞ itself.
	const cloud = 0.62 * dc;
	const open = smooth(span(a, 0.25, 1.1)); // how far the fog has lifted
	for (const l of LINES) {
		const e = writeOf(l, u, 0.04, 0.16, 0.22);
		if (e <= 0) continue;
		const c = Math.sqrt(CR * CR + l.D * l.D);
		const PSI = Math.PI * lerp(e * 0.86, 1, open * e);
		const n = 140;
		const pts = [];
		const fades = [];
		for (let i = 0; i <= n; i++) {
			const psi = lerp(-PSI, PSI, i / n);
			const P =
				Math.abs(psi) > Math.PI - 1e-6 ? NP : lift(add3(l.p0, mul3(l.d, c * Math.tan(psi / 2))));
			const q = drop(a > 1e-5 ? turn14(P, a) : P);
			pts.push(q);
			const fog = 1 - smooth(span(Math.hypot(...sub3(q, sph.c)), cloud, cloud * 1.45));
			fades.push(
				Math.max(fog, open * open) * smooth(span(Math.hypot(...sub3(q, cam.pos)), 0.8, 3))
			);
		}
		ink(ctx, runs3(cam, pts, { depth: Z, fade: (p, i) => fades[i] }), {
			color: FAMC[l.f],
			width: 1.5,
			alpha: FAMA[l.f] * outerA(l),
			ref,
			hid: 0.45
		});
	}

	const nref = netRef(w, h);
	sphereWith(ctx, cam, Z, M, {
		h,
		fov,
		centre: sph.c,
		radius: sph.r,
		m: zoomOf(u),
		ref: nref,
		turn: u,
		a: 1 - 0.6 * span(u, 0.82, 0.96),
		gold: 1 - 0.6 * span(u, 0.5, 0.6)
	});
	turnMarks(ctx, cam, Z, M, u, w, h);

	// ∞, carried into the picture: lit, then the way on.
	const iA = smooth(span(a, 0.35, 0.8));
	const g = span(u, 0.8, 1);
	if (g > 0) portalAt(ctx, cam, h, fov, INF, 0.01 + 0.17 * Math.pow(g, 1.2), g, R);
	else if (iA > 0) lit3(ctx, cam, INF, 6, iA);
	label3(ctx, cam, INF, '∞', {
		dx: 14,
		dy: -16,
		size: 26,
		alpha: iA * (1 - span(u, 0.86, 0.92))
	});

	const out = 1 - span(u, 0.88, 0.95);
	notes(ctx, w, h, [
		['ℝ³ ∪ {∞} = S³', span(u, 0.3, 0.4), out],
		['every line is a circle through ∞', span(u, 0.55, 0.66), out]
	]);
}

// ── hopf ─────────────────────────────────────────────────────────────────────
// The fibre over w: the great circle e^{iφ}(w, 1)/√(1 + |w|²) of S³ ⊂ ℂ², as
// (x₁ + ix₂, x₃ + ix₄), projected from (1, 0): p = HR (x₃, x₄, x₂)/(1 − x₁).
// So π⁻¹(0) is the ring of radius HR round the sphere's waist and π⁻¹(∞) the
// sphere's own axis, a line through ∞; w ↦ e^{iθ}w turns space about that
// axis. A ring |w| = r lifts to the torus round π⁻¹(0) of centre radius
// HR√(1 + r²) and tube radius HR r — clear of the sphere for r < 0.87 — whose
// fibres are its Villarceau circles, each of radius HR√(1 + r²), tilted by
// arctan r to the ring.
const HR = 2.2;
function fibre(wz, n = 160, upto = 1) {
	const inf = !Number.isFinite(wz[0] + wz[1]);
	const k = inf ? 0 : 1 / Math.sqrt(1 + wz[0] * wz[0] + wz[1] * wz[1]);
	const out = [];
	const m = Math.max(2, Math.round(n * upto));
	for (let i = 0; i <= m; i++) {
		const e = C.polar(1, (TAU * i) / n);
		const z1 = inf ? e : C.scale(C.mul(e, wz), k);
		const z2 = inf ? [0, 0] : C.scale(e, k);
		const d = 1 - z1[0];
		out.push(d < 1e-7 ? [NaN, NaN, NaN] : [(HR * z2[0]) / d, (HR * z2[1]) / d, (HR * z1[1]) / d]);
	}
	return out;
}
// The lit points, by log|w|: on cyan arm 0 (the beat's gold arm) and pink
// arm 3, all on the cap round 0, whose fibres all thread the gold ring.
// Then the gold ring of latitude and its torus, and faint tori filling space.
const CYX = [-1.39, -1.08, -0.77, -0.47, -0.17];
const PKX = [-1.25, -0.92, -0.6, -0.28];
const PKJ = 3;
const LAT_R = 0.45;
const TORUS_N = 16;
const FILL = [
	[0.3, 8],
	[1.4, 9]
];

// The turn's zoom coasts to rest in the first second (the one thing here
// that slows), so the points of the net can be lit and carry their fibres.
const ZOOM_RATE0 = 1.5 + 6.6 * U0 * U0;
const HOPF_M = zoomOf(0) + 0.05 * ZOOM_RATE0;
const hopfZoom = (u) => (u < 0.1 ? zoomOf(0) + ZOOM_RATE0 * (u - (u * u) / 0.2) : HOPF_M);

// The lens: a loop, never a reversal — out and round to the side and up
// (az turns before the distance does, the distance before the elevation,
// so the lens never stops), then down onto the axis at 0; never past 60° off
// that axis, so the rings are never seen edge-on.
const HOPF_LENS = lensPath({
	target: [
		[0, ORIGIN],
		[0.74, ORIGIN],
		[0.9, [0, 0, 0.6]],
		[1, [0, 0, 1]]
	],
	az: [
		[0, BASE.az],
		[0.1, 0.56],
		[0.2, 0.6],
		[0.3, 0.66],
		[0.4, 0.74],
		[0.5, 0.82],
		[0.58, 0.86],
		[0.68, 0.8],
		[0.76, 0.66],
		[0.84, 0.45],
		[0.92, 0.2],
		[1, 0]
	],
	el: [
		[0, BASE.el],
		[0.1, 0.335],
		[0.2, 0.355],
		[0.3, 0.38],
		[0.4, 0.42],
		[0.5, 0.48],
		[0.6, 0.56],
		[0.68, 0.66],
		[0.76, 0.74],
		[0.84, 0.66],
		[0.92, 0.38],
		[1, 0.0001]
	],
	dist: [
		[0, BASE.dist],
		[0.1, 4.6],
		[0.2, 5.4],
		[0.3, 6.5],
		[0.4, 7.9],
		[0.5, 9.4],
		[0.6, 10.6],
		[0.66, 11.2],
		[0.74, 10.6],
		[0.84, 7.4],
		[0.93, 3.4],
		[1, 0.9]
	],
	fov: [
		[0, BASE.fov],
		[0.84, 40],
		[1, 60]
	]
});

function hopf(ctx, w, h, u, Z) {
	const R = 0.42 * Math.min(w, h);
	const lens = HOPF_LENS(u);
	const fov = lens.fov;
	const ZERO = [0, 0, 1];
	const cam = orbit(w, h, lens);
	const ref = BASE.dist;
	const near = Math.hypot(...cam.pos) * 0.9; // the fibres' depth cue, at every scale
	Z.reset(w, h);
	Z.grid(cam, sphereGrid(ORIGIN, 1, 18, 26));

	const fib = (wz, col, e, o = {}) => {
		if (e <= 0) return;
		ink(ctx, runs3(cam, fibre(wz, 160, e), { depth: Z }), {
			color: col,
			width: o.width ?? 1.9,
			alpha: o.alpha ?? 0.9,
			ref: near,
			glow: o.glow ?? 0,
			hid: 0.4
		});
	};
	const cyW = CYX.map((x) => C.exp([x, (x - HOPF_M) / K]));
	const pkW = PKX.map((x) => C.exp([x, -(x - HOPF_M) / KP + (TAU * (PKJ + 0.5)) / N]));
	const ringE = io(span(u, 0.06, 0.2)); // π⁻¹(0), the lit point's own fibre
	const tC = (k) => 0.14 + 0.045 * k;
	const tP = (k) => 0.3 + 0.045 * k;
	const tor = span(u, 0.46, 0.64);
	const fill = span(u, 0.58, 0.76);
	const quiet = span(u, 0.82, 0.96); // the fill steps back for the dive

	// Space filled: further tori, faint, as the lens pulls back.
	if (fill > 0)
		for (const [r, n] of FILL)
			for (let k = 0; k < n; k++)
				fib(
					C.polar(r, (TAU * (k + 0.5)) / n),
					PAL.rose,
					io(span(fill, k / (2 * n), 0.5 + k / (2 * n))),
					{ width: 1.1, alpha: 0.5 * (1 - 0.6 * quiet) }
				);
	// π⁻¹(∞): the axis, a line through ∞.
	const axE = io(span(u, 0.56, 0.68));
	if (axE > 0) {
		const ax = [];
		for (let i = -60; i <= 60; i++)
			ax.push([0, 0, ((30 * Math.sinh((i / 60) * 2.4)) / Math.sinh(2.4)) * axE]);
		ink(ctx, runs3(cam, ax, { depth: Z }), {
			color: PAL.chalk,
			width: 1.6,
			alpha: 0.75 * (1 - 0.5 * quiet),
			ref,
			hid: 0.4
		});
	}

	// The bold fibres, woven: π⁻¹(0), the gold ring the others all thread;
	// the cyan loxodrome's points, then the pink's; then the ring's torus.
	const bold = [];
	const add = (wz, color, e, width = 1.9, alpha = 0.92, glow = 0) => {
		if (e > 0) bold.push({ pts: fibre(wz, 132, e), color, width, alpha, glow });
	};
	add([0, 0], PAL.gold, ringE, 2.6, 1, 6);
	cyW.forEach((wz, k) => add(wz, PAL.cyan, io(span(u, tC(k), tC(k) + 0.14))));
	pkW.forEach((wz, k) => add(wz, PAL.pink, io(span(u, tP(k), tP(k) + 0.14))));
	for (let k = 0; k < TORUS_N; k++)
		add(
			C.polar(LAT_R, (TAU * k) / TORUS_N),
			PAL.gold,
			io(span(tor, k / (2 * TORUS_N), 0.5 + k / (2 * TORUS_N))),
			1.2,
			0.85
		);
	// … over the sphere: the base, its net come to rest so its points can
	// carry fibres, and the gold ring of latitude on it.
	let place = null;
	weave(ctx, cam, Z, bold, near, () => {
		place = sphereWith(ctx, cam, Z, (p) => p, {
			h,
			fov,
			m: hopfZoom(u),
			ref: netRef(w, h),
			turn: u,
			gold: 1 - span(u, 0.1, 0.2)
		}).place;
		turnMarks(ctx, cam, Z, (p) => p, u, w, h);
		if (tor > 0) {
			const ring = [];
			for (let i = 0; i <= 120; i++) ring.push(place([Math.log(LAT_R), (TAU * i) / 120]));
			ink(
				ctx,
				runs3(cam, ring.slice(0, Math.max(2, Math.round(121 * smooth(tor * 2)))), { depth: Z }),
				{ color: PAL.gold, width: 3, alpha: 1, ref, glow: 6, hid: 0.5 }
			);
		}
	});
	// The lit points: each lights as its fibre starts.
	cyW.forEach((wz, k) => spark(ctx, cam, curl(wz, 1), 4, span(u, tC(k), tC(k) + 0.02), Z));
	pkW.forEach((wz, k) => spark(ctx, cam, curl(wz, 1), 4, span(u, tP(k), tP(k) + 0.02), Z));
	// The two special fibres, named.
	const lab0 = span(u, 0.14, 0.2) * (1 - span(u, 0.8, 0.86));
	const labI = span(u, 0.64, 0.7) * (1 - span(u, 0.8, 0.86));
	label3(ctx, cam, [HR * 0.71, -HR * 0.71, 0], 'π^{−1}(0)', {
		dx: 14,
		dy: 16,
		size: 20,
		alpha: lab0,
		color: PAL.gold
	});
	label3(ctx, cam, [0, 0, -4.2], 'π^{−1}(∞)', { dx: 12, dy: -8, size: 20, alpha: labI, depth: Z });

	// 0, lit since the beat, its fibre the gold ring: down the axis into it.
	const g = span(u, 0.78, 1);
	if (g > 0) {
		const at = (r, a) => curl(C.polar(r, a), 1);
		portalOn(ctx, cam, Z, at, ZERO, 0.012 + 0.072 * Math.pow(g, 1.2), g, R);
	}

	const out = 1 - span(u, 0.86, 0.93);
	notes(ctx, w, h, [
		['π : S^{3} → S^{2},   (z_{1}, z_{2}) ↦ z_{1} / z_{2}', span(u, 0.12, 0.24), out],
		['each point a circle; every two linked', span(u, 0.3, 0.42), out]
	]);
}

// ── mirror ───────────────────────────────────────────────────────────────────
// Inversion in the sphere, x ↦ x/|x|²: the line p0 + t d (|p0| = D) goes to
// the circle through the centre, centre p0/2D², radius 1/2D, in the plane of
// p0 and d — at t = D tan(ψ/2), the point p0/2D² + (p̂0 cos ψ + d sin ψ)/2D.
// The gold line is tangent at 0 = (0, 0, 1) along x (D = 1) — projective's
// gold line too: its image is the circle from 0 to the centre, of diameter 1,
// in the xz-plane, so it is open to a lens that looks down on it from any side.
const GD = [1, 0, 0];
const circleOf = (p0, d, D, psi) => {
	const p0h = mul3(p0, 1 / D);
	return add3(
		mul3(p0, 1 / (2 * D * D)),
		mul3(add3(mul3(p0h, Math.cos(psi)), mul3(d, Math.sin(psi))), 1 / (2 * D))
	);
};

// The lens: out as the lattice and its image are written, keeping the
// sphere big enough to see into, orbiting left and climbing — the gold
// circle lies flat, in the xz-plane, so it opens as the lens rises — ever
// faster, then down through the glass to the centre.
const MIRROR_LENS = lensPath({
	az: [
		[0, BASE.az],
		[0.1, 0.53],
		[0.2, 0.48],
		[0.3, 0.4],
		[0.4, 0.3],
		[0.5, 0.18],
		[0.6, 0.04],
		[0.7, -0.12],
		[0.8, -0.3],
		[0.9, -0.48],
		[1, -0.6]
	],
	el: [
		[0, BASE.el],
		[0.1, 0.35],
		[0.2, 0.4],
		[0.3, 0.47],
		[0.4, 0.55],
		[0.5, 0.63],
		[0.6, 0.7],
		[0.7, 0.76],
		[0.8, 0.8],
		[0.9, 0.8],
		[1, 0.78]
	],
	dist: [
		[0, BASE.dist],
		[0.1, 4.4],
		[0.2, 4.8],
		[0.3, 5.3],
		[0.4, 5.8],
		[0.5, 6.2],
		[0.6, 6.4],
		[0.68, 6.3],
		[0.76, 5.4],
		[0.84, 3.6],
		[0.92, 1.6],
		[1, 0.42]
	],
	fov: [
		[0, BASE.fov],
		[0.84, 40],
		[1, 60]
	]
});

function mirror(ctx, w, h, u, Z) {
	const R = 0.42 * Math.min(w, h);
	const lens = MIRROR_LENS(u);
	const fov = lens.fov;
	const cam = orbit(w, h, lens);
	const ref = BASE.dist;
	const nref = netRef(w, h);
	const dc = Math.hypot(...cam.pos);
	Z.reset(w, h);
	Z.grid(cam, sphereGrid(ORIGIN, 1, 18, 26));

	const glass = span(u, 0.12, 0.3); // the sphere turning into the mirror
	const cloud = 0.62 * dc;
	const inner = [];
	for (const l of LINES) {
		const e = writeOf(l, u, 0.06, 0.2, 0.24);
		if (e <= 0) continue;
		const tTip = 2 * Math.sinh(e * Math.asinh(1e4 / 2));
		const PSI = 2 * Math.atan(tTip / l.D);
		const ci = [];
		for (let i = 0; i <= 64; i++) ci.push(circleOf(l.p0, l.d, l.D, lerp(-PSI, PSI, i / 64)));
		inner.push({ ci, l });
		// Outside: the line itself, as far as it is written.
		const V = Math.asinh(tTip / TLINE);
		const pts = [];
		const fades = [];
		for (let i = 0; i <= 100; i++) {
			const p = add3(l.p0, mul3(l.d, TLINE * Math.sinh(lerp(-V, V, i / 100))));
			pts.push(p);
			fades.push(
				(1 - smooth(span(Math.hypot(...p), cloud, cloud * 1.45))) *
					smooth(span(Math.hypot(...sub3(p, cam.pos)), 0.8, 3))
			);
		}
		ink(ctx, runs3(cam, pts, { depth: Z, fade: (p, i) => fades[i] }), {
			color: FAMC[l.f],
			width: 1.4,
			alpha: 0.8 * FAMA[l.f] * outerA(l),
			ref,
			hid: 0.4
		});
	}

	// The sphere: its net fading to glass, and gone as the lens goes through.
	const sA = (1 - 0.76 * glass) * (1 - smooth(span(1.9 - dc, 0, 0.7)));
	sphereWith(ctx, cam, Z, (p) => p, {
		h,
		fov,
		m: zoomOf(u),
		ref: nref,
		turn: u,
		a: sA,
		node: 1 - glass,
		gold: 1 - glass,
		lit: 1 - span(u, 0.3, 0.36)
	});
	turnMarks(ctx, cam, Z, (p) => p, u, w, h, 0.22);

	// The mirror image, inside: drawn through the glass.
	const iA = span(u, 0.08, 0.2) * (1 - 0.35 * span(u, 0.85, 1));
	const nearIn = (p) => smooth(span(Math.hypot(...sub3(p, cam.pos)), 0.04, 0.2));
	for (const { ci, l } of inner)
		ink(ctx, runs3(cam, ci, { fade: nearIn }), {
			color: FAMC[l.f],
			width: 1.5,
			alpha: 0.95 * iA,
			ref: dc * 0.9
		});

	// The gold line through 0, out to ∞ both ways, and its gold circle in.
	const gE = io(span(u, 0.3, 0.62));
	if (gE > 0) {
		const tTip = 2 * Math.sinh(gE * Math.asinh(1e4 / 2));
		const V = Math.asinh(tTip / TLINE);
		const line = [];
		for (let i = 0; i <= 140; i++)
			line.push(add3([0, 0, 1], mul3(GD, TLINE * Math.sinh(lerp(-V, V, i / 140)))));
		const PSI = 2 * Math.atan(tTip);
		const circ = [];
		for (let i = 0; i <= 120; i++) circ.push(circleOf([0, 0, 1], GD, 1, lerp(-PSI, PSI, i / 120)));
		const go = { color: PAL.gold, width: 2.8, alpha: 1, ref, glow: 8, hid: 0.5 };
		ink(
			ctx,
			runs3(cam, line, {
				depth: Z,
				fade: (p) => smooth(span(Math.hypot(...sub3(p, cam.pos)), 0.8, 3))
			}),
			go
		);
		ink(ctx, runs3(cam, circ, { fade: nearIn }), { ...go, width: 2.4, ref: dc * 0.9 });
	}
	// x out along it, x* in along its image: |x*| = 1/|x|.
	const xr = span(u, 0.36, 0.7);
	const xA = span(u, 0.36, 0.4) * (1 - span(u, 0.7, 0.76));
	if (xA > 0) {
		const t = Math.sinh(5 * Math.pow(xr, 1.4));
		const X = add3([0, 0, 1], mul3(GD, t));
		const Xs = mul3(X, 1 / dot(X, X));
		spark(ctx, cam, X, 5.5, xA, Z);
		spark(ctx, cam, Xs, 4.5, xA);
		label3(ctx, cam, X, 'x', { dx: 12, dy: -14, size: 22, alpha: xA, depth: Z });
		label3(ctx, cam, Xs, 'x*', { dx: 10, dy: 18, size: 21, alpha: xA });
	}

	// The centre: ∞'s image, lit; the way on.
	const cA = span(u, 0.6, 0.7);
	const g = span(u, 0.78, 1);
	if (g > 0) portalAt(ctx, cam, h, fov, ORIGIN, 0.004 + 0.075 * Math.pow(g, 1.4), g, R);
	else if (cA > 0) spark(ctx, cam, ORIGIN, 6, cA);
	label3(ctx, cam, ORIGIN, '∞*', {
		dx: 16,
		dy: 20,
		size: 22,
		alpha: cA * (1 - span(u, 0.84, 0.9))
	});

	const out = 1 - span(u, 0.88, 0.95);
	notes(ctx, w, h, [
		['x ↦ x / |x|^{2}', span(u, 0.2, 0.28), out],
		['|x| ↦ 1 / |x| :  the outside is inside', span(u, 0.42, 0.52), out]
	]);
}
