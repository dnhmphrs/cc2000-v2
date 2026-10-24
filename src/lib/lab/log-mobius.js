import {
	getBoard,
	clearBoard,
	stroke,
	bloom,
	disc,
	math,
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
	camera3,
	tag,
	add3,
	sub3,
	mul3,
	dot,
	cross,
	norm,
	easeInOutCubic,
	PHI
} from './log/board.js';
import { toSphere } from './log/space.js';
import { drawHelix, poseOn } from './log/helix.js';
import { loadRooms, drawRoom, DECADES, LAYERS } from './log/rooms.js';

// ── Sketch: log-mobius — the projective zoom out ─────────────────────────────
// After the centre beat: the swimmer has reached the pole of the cyan/pink net
// on the flat board and the pole is lit. Now the lens pulls out of the board
// into 3D and finds that the flat net was never flat — and at the end comes
// round to look straight down at a point, which grows: the way into the rooms
// for the fall that follows. Ten seconds; the lens never stops and never cuts,
// only gathers speed. Hand-projected (camera3), every surface hidden-line
// tested against a small software depth buffer of itself, the far side drawn
// faint and dashed as the plates draw it, and lines thicker the nearer they
// are. The net is the centre beat's: cyan golden loxodromes θ = (x − m)/K
// (x = log|z|, K the golden spiral's rate), pink ones the other way at pitch
// 0.9, grey nodes riding the cyan arms, one arm lit gold. One per ?v=:
//
//   sphere  (default) the board curls up behind itself into the Riemann
//           sphere — inverse stereographic projection, the plane tangent at 0
//           and closing at ∞ — while the lens pulls back and climbs round it.
//           The unit circle lands on the equator, the axes on two meridians;
//           the zoom keeps running, so the net streams pole to pole. Then a
//           boost of the sky, z ↦ (z + it)/(1 − itz): both poles slide up
//           toward +i, the net becomes a two-pole loxodromic spiral, the line
//           ℓ through the poles leaves the centre and its polar ℓ* — where the
//           tangent planes at the poles meet — flies in from infinity, the two
//           tangents from the poles drawn up to it as a tent (pole and polar).
//           The lens comes round over the top to look straight down at ∞,
//           which lights and grows (a dolly zoom on the last second).
//   torus   the log map, rolled up: the board folds into a funnel (the
//           conformal cones ρ = e^{βx}, β 1 → 0) and on into the tube that a
//           zoom into 0 flies down, the lit pole opening into the gold mouth at
//           its far end. The lens backs out of the tube and round it; the tube
//           bends round and its two ends — toward 0 and toward ∞ — meet and
//           glue (z ∼ λz): a torus. The tube's length is tuned so both families
//           close up, and the gold arm closes into a (2, 13) torus knot. The
//           zoom is now the torus turning on its axis. The lens climbs over
//           the gold seam where 0 met ∞ and dives straight down at its top.
//   flip    the blackboard lecture: the board tilted in perspective under the
//           lens while the generators of the Möbius group act on the net, each
//           written up as it happens — z ↦ z + b, z ↦ e^{iθ}z, z ↦ λz — over
//           the rose axes and unit circle, which stay put, so the lit pole is
//           seen carried by each (the lens follows it, loosely, to keep it in
//           frame). Then z ↦ 1/z: the board curls up into
//           the sphere and the sphere turns over, half a turn about the real
//           axis, 0 and ∞ changing places; and the lens comes round to look
//           down on the lit pole. The four compose to (az + b)/(cz + d).
//
// The end of each of those three is the same shot: the lens square to the
// surface over a gold disc with a cream core, about a third of the frame
// across. Every frame is a pure function of progress: ?at= pins it exactly.
//
// Five more, the maps ON the torus — twelve seconds each, in chalk, gold only
// for a lit point, no lecture:
//
//   cat     Arnold's cat map A = [[2, 1], [1, 1]], (x, y) ↦ (2x + y, x + y)
//           mod 1, on the torus of rooms: the room (rooms.js, one chalk
//           drawing, each layer hiding the ones behind it) fills the flat
//           torus — its φ : 1 frame with the arrows of the gluing, the
//           coordinates (x, y) ∈ [0, 1)² across it — and the corner, the
//           map's one fixed point, is lit. Three iterates, honestly: the
//           picture carried by A^s, s 0 → 1 (A symmetric, so A^s stretches by
//           φ^{2s} along its eigenline (φ, 1) and squeezes by as much along
//           (−1, φ); drawn faint the first time; A¹ = A), the view pulling back
//           over the integer lines; the parallelogram A[0, 1]² cut along them
//           into its four pieces; each piece slid home by its integer vector
//           into the square. Each drawn iterate is the room sampled exactly at
//           A⁻ᵏ(x, y) mod 1 (bilinear, 2² or 3² samples a pixel). Then the room
//           on the discrete torus, 192 × 192 cells of its frame,
//           (i, j) ↦ (2i + j, i + j) mod 192: a permutation whose period is
//           counted at start (48 — for N = 2ᵏ, k ≥ 2, it is 3·2^{k−2}), run
//           to its period: the room goes to noise, is a ghost of itself
//           halfway (A²⁴ ≡ 97·I mod 192: alternate cells shifted by half, four
//           interleaved rooms), and comes back. A tick a turn along the top.
//           Exact: the iterates, the cuts, the permutation and its period. A
//           picture: the cross-fade from the drawn third iterate to its
//           sampling, and back to the drawing at the end. ?decade= picks the
//           room, 90s by default.
//   twist   Dehn twists. On the left the plane: Λ = ℤ + τℤ (τ = 0.22 + 0.95i),
//           its points fixed, tiled by the cell of the current basis (six
//           lines a cell: the edges, and the net between) with the first
//           basis's cell dashed and ω₂′ lit. On the right the torus ℂ/Λ, drawn
//           in the first basis's coordinates (ω₁ round the hole, ω₂ round the
//           tube), carrying the same lines, the lattice's one point lit. The
//           basis is sheared by [[1, 1], [0, 1]] (ω₂ ↦ ω₂ + ω₁: the cut is the
//           circle along ω₁, which glows while it is made; the ω₂-lines,
//           (0, 1) circles, become (1, 1) curves) and then [[1, 0], [1, 1]]
//           (ω₁ ↦ ω₁ + ω₂′, cut along an ω₂′-line: the (1, 0) circles become
//           (2, 1) curves) — together the cat map's matrix. Then z ↦ z/ω₁′ on
//           the plane puts ω₁′ back at 1, and the lit point is the new τ =
//           (1 + τ)/(2 + τ), low in the upper half-plane: the same torus, a
//           different picture of it. The ends of each shear are exact; in
//           between, the open arcs (failing to meet across the cut by t) are
//           the path of the twist.
//   weierstrass  ℘: the torus ℂ/Λ folded two to one onto the Riemann sphere
//           (τ = 0.3 + 1.05i). The four half-periods 0, ½, τ/2, (1 + τ)/2 are
//           lit. z ↦ −z is, on the torus of revolution, the half-turn about the
//           axis through them; the near half swings up and over about it,
//           hinged at those four points, onto the far half: the quotient
//           doubly covered (the pillowcase). Under it the parallelogram does
//           the same — its right half turned π about (1 + τ)/2, z ↦ 1 + τ − z,
//           which is −z mod Λ. The folded half then carries its net to the
//           sphere, every point (a, b) to ℘(a + bτ)/5 stereographically, ∞ at
//           the top: the half-periods land on ∞, e₁, e₂, e₃, the seams through
//           them (a, b ∈ {0, ½}) on the arcs between, and ±z on one point (the
//           net, sixteen lines a family, offset half a step so no line meets a
//           half-period). ℘ by its q-series — exact to double precision in
//           twelve terms here (|q| ≈ 0.0014), checked against the lattice
//           sum. Exact: the fold's two ends, the hinge points, the sphere.
//           Pictures: the swing between (a rigid turn of the half) and the
//           straight-line morph from the folded half-torus to the sphere.
//   hopf    S³ ⊂ ℂ², z₁ = cos η e^{iξ₁}, z₂ = sin η e^{iξ₂}, projected from
//           (0, 0, 0, 1), axis vertical: the tori T_η are tori of revolution
//           (R = sec η, r = tan η), nested round the core circle (η = 0) and
//           the axis (η = π/2, the circle through ∞), and their Hopf circles
//           ξ₁ = θ, ξ₂ = θ + δ are round circles, every two linked once. Drawn:
//           the core and the axis, twelve circles of the Clifford torus
//           (η = π/4), ten of an outer torus (η = 1.08), and the centre beat's
//           net streaming on T_η with tan η = π/TX — there ζ = x + iθ ↦
//           (πx/TX, θ) is a similarity of flat tori and the projection is
//           conformal, so the loxodromes meet at their own angles (the net
//           hidden-line tested, the circles dashed behind it). The lens comes
//           round the nest and in, onto a Hopf circle of its own (η = 0.95,
//           between the Clifford and the outer torus) and rides it through
//           the hole of every torus inside it, chasing a light on it. All
//           exact but the lens's path.
//   knot    a (p, q) torus knot is a straight line on the flat torus: the
//           square on the ground (X round the tube, Y round the hole, the
//           arrows of the gluing on it) and the torus above it, the line
//           (X, Y) = (X₀ + ps, Y₀ + qs) of slope q/p drawing itself on both,
//           cut at the square's edges and coming back at the opposite one,
//           with the helix swimmer for a pen (its gold core, and the pen's
//           point on the square, lit). The (3, 2) trefoil (three times round
//           the tube, twice round the hole; T(p, q) ≅ T(q, p)) and then the
//           (5, 2) cinquefoil, the lens rising to look down on its five lobes.
//           Exact.

const SECONDS = 10;
const K = GOLDEN_K; // the cyan family's rate: golden loxodromes
const KP = 0.9; // the pink family's pitch, the other way
const N = 8; // arms in each family
const RING = TAU / (N * (1 / K + 1 / KP)); // node spacing along an arm, in log|z|
const NEAR = 0.05;
const LENGTH = { cat: 12, twist: 12, weierstrass: 12, hopf: 12, knot: 12 };

const io = (t) => easeInOutCubic(clamp01(t));
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export default async function make({ at }) {
	const v = variant(['sphere', 'torus', 'flip', 'cat', 'twist', 'weierstrass', 'hopf', 'knot']);
	const b = getBoard();
	const seconds = LENGTH[v] ?? SECONDS;
	const time = clock(seconds, at);
	// The cat map's room: loaded, drawn in chalk, its iterates sampled.
	let room = null;
	if (v === 'cat') {
		const q = new URLSearchParams(location.search);
		const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
		clearBoard(b);
		tag(b.ctx, b.w, b.h, `log-mobius · cat · ${decade} · loading the room`);
		room = catSetup(await loadRooms({ decades: [decade], chalk: true }), decade);
	}
	const info = { seconds, variant: v, frameMs: 0 };
	let frames = 0;
	let ms = 0;

	function render() {
		const t0 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		if (v === 'sphere') sphere(ctx, w, h, u);
		else if (v === 'torus') torus(ctx, w, h, u);
		else if (v === 'flip') flip(ctx, w, h, u);
		else if (v === 'cat') cat(ctx, w, h, u, room);
		else if (v === 'twist') twist(ctx, w, h, u);
		else if (v === 'weierstrass') weierstrass(ctx, w, h, u);
		else if (v === 'hopf') hopf(ctx, w, h, u);
		else knot(ctx, w, h, u, time.t);
		tag(ctx, w, h, `log-mobius · ${v}`);
		ms += performance.now() - t0;
		if (++frames === 30) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs; // the lab copies info once
			frames = 0;
			ms = 0;
		}
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The lens ─────────────────────────────────────────────────────────────────
// A C¹ curve through keyframes [[u, value], …]: Catmull–Rom tangents, at rest
// at the first key and still moving at the last, so a path only gathers pace.
function spline(u, keys) {
	const n = keys.length;
	if (u <= keys[0][0]) return keys[0][1];
	if (u >= keys[n - 1][0]) return keys[n - 1][1];
	let i = 0;
	while (u > keys[i + 1][0]) i++;
	const tan = (j) => {
		if (j === 0) return 0;
		if (j === n - 1) return (keys[j][1] - keys[j - 1][1]) / (keys[j][0] - keys[j - 1][0]);
		return (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]);
	};
	const [u0, v0] = keys[i];
	const [u1, v1] = keys[i + 1];
	const H = u1 - u0;
	const t = (u - u0) / H;
	const t2 = t * t;
	const t3 = t2 * t;
	return (
		(2 * t3 - 3 * t2 + 1) * v0 +
		(t3 - 2 * t2 + t) * tan(i) * H +
		(-2 * t3 + 3 * t2) * v1 +
		(t3 - t2) * tan(i + 1) * H
	);
}
const spline3 = (u, keys) =>
	[0, 1, 2].map((c) =>
		spline(
			u,
			keys.map(([k, p]) => [k, p[c]])
		)
	);

// The lens on a sphere of directions round `target`: azimuth about y, then
// elevation; `up` is the direction of increasing elevation, so the lens can
// look straight down without losing its bearings.
function orbit(w, h, { target, az, el, dist, fov }) {
	const ce = Math.cos(el);
	const se = Math.sin(el);
	const ca = Math.cos(az);
	const sa = Math.sin(az);
	const dir = [sa * ce, se, ca * ce];
	const up = [-sa * se, ce, -ca * se];
	return camera3({ pos: add3(target, mul3(dir, dist)), target, up, fov, w, h });
}
const pxPerUnit = (h, fov) => h / 2 / Math.tan((fov * Math.PI) / 360);

// ── The depth buffer ─────────────────────────────────────────────────────────
// A quarter-resolution software z-buffer of the surface the net lies on, so
// a line knows where the surface is in front of it: the hidden-line test for
// spheres, cones, tubes and tori alike.
const ZB = { s: 4, W: 0, H: 0, buf: null, on: false };
function zReset(w, h) {
	const W = Math.ceil(w / ZB.s);
	const H = Math.ceil(h / ZB.s);
	if (!ZB.buf || ZB.W !== W || ZB.H !== H) {
		ZB.buf = new Float32Array(W * H);
		ZB.W = W;
		ZB.H = H;
	}
	ZB.buf.fill(Infinity);
	ZB.on = true;
}
function zTri(a, b, c) {
	if (a[2] < NEAR || b[2] < NEAR || c[2] < NEAR) return;
	const s = ZB.s;
	const ax = a[0] / s;
	const ay = a[1] / s;
	const bx = b[0] / s;
	const by = b[1] / s;
	const cx = c[0] / s;
	const cy = c[1] / s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (Math.abs(area) < 1e-9) return;
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(ZB.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(ZB.H - 1, Math.ceil(Math.max(ay, by, cy)));
	if (x0 > x1 || y0 > y1) return;
	const ia = 1 / a[2];
	const ib = 1 / b[2];
	const ic = 1 / c[2];
	const e = -0.03;
	for (let y = y0; y <= y1; y++) {
		const py = y + 0.5;
		for (let x = x0; x <= x1; x++) {
			const px = x + 0.5;
			const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
			if (w0 < e) continue;
			const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
			if (w1 < e) continue;
			const w2 = 1 - w0 - w1;
			if (w2 < e) continue;
			const z = 1 / (w0 * ia + w1 * ib + w2 * ic);
			const k = y * ZB.W + x;
			if (z < ZB.buf[k]) ZB.buf[k] = z;
		}
	}
}
// A surface sampled on a grid (rows of 3D points) into the buffer.
function zGrid(cam, grid) {
	const P = grid.map((row) => row.map((p) => cam.project(p)));
	for (let i = 0; i < P.length - 1; i++)
		for (let j = 0; j < P[i].length - 1; j++) {
			zTri(P[i][j], P[i + 1][j], P[i + 1][j + 1]);
			zTri(P[i][j], P[i + 1][j + 1], P[i][j + 1]);
		}
}
// Behind the surface? The deepest of the four cells round the point, so a
// silhouette stays drawn; off the buffer counts as in front.
function zHidden(q) {
	if (!ZB.on) return false;
	const fx = q[0] / ZB.s - 0.5;
	const fy = q[1] / ZB.s - 0.5;
	const x0 = Math.floor(fx);
	const y0 = Math.floor(fy);
	let m = -Infinity;
	for (let dy = 0; dy < 2; dy++)
		for (let dx = 0; dx < 2; dx++) {
			const x = x0 + dx;
			const y = y0 + dy;
			if (x < 0 || y < 0 || x >= ZB.W || y >= ZB.H) return false;
			const z = ZB.buf[y * ZB.W + x];
			if (z > m) m = z;
		}
	return q[2] > m * 1.012 + 0.012;
}

// ── 3D strokes ───────────────────────────────────────────────────────────────
// stroke3, extended: a 3D polyline cut at the near plane (so a surface can
// sweep past the lens), split wherever it goes behind the surface, and
// wherever its `fade` (per point, 0..1) drops out. Runs: { Q, back }, each
// screen point [x, y, depth, fade].
function runs3(cam, pts, { fade = null, hidden = true } = {}) {
	const out = [];
	let run = null;
	let pp = null;
	let pq = null;
	const end = () => {
		if (run && run.Q.length > 1) out.push(run);
		run = null;
	};
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i];
		const q = cam.project(p);
		const f = fade ? fade(p, i) : 1;
		if (q[2] <= NEAR || f < 0.01 || !Number.isFinite(q[0] + q[1])) {
			if (run && pq && q[2] <= NEAR && pq[2] > NEAR) {
				const c = cam.project(lerp3(pp, p, (pq[2] - NEAR) / (pq[2] - q[2])));
				run.Q.push([c[0], c[1], NEAR, f]);
			}
			end();
			pp = p;
			pq = q;
			continue;
		}
		const back = hidden ? zHidden(q) : false;
		if (!run) {
			run = { Q: [], back };
			if (pq && pq[2] <= NEAR) {
				const c = cam.project(lerp3(pp, p, (pq[2] - NEAR) / (pq[2] - q[2])));
				run.Q.push([c[0], c[1], NEAR, f]);
			}
		} else if (back !== run.back) {
			run.Q.push([q[0], q[1], q[2], f]);
			end();
			run = { Q: [], back };
		}
		run.Q.push([q[0], q[1], q[2], f]);
		pp = p;
		pq = q;
	}
	end();
	return out;
}

// Paint runs: the far side faint and dashed; the near side bold, its width
// by depth (`ref` is the depth drawn at `width`), in short pieces.
function paint(ctx, R, o, which = null) {
	const { color, width = 2.2, alpha = 1, glow = 0, ref = 0, hid = 0.32 } = o;
	for (const r of R) {
		if (which && (which === 'back') !== r.back) continue;
		const Q = r.Q;
		if (r.back) {
			if (hid <= 0) continue;
			const f = Q[Q.length >> 1][3];
			stroke(ctx, Q, {
				color,
				width: Math.max(1, width * 0.62),
				alpha: alpha * hid * f,
				dash: [3, 6]
			});
			continue;
		}
		const piece = 10;
		for (let i = 0; i < Q.length - 1; i += piece) {
			const seg = Q.slice(i, Math.min(Q.length, i + piece + 1));
			const mid = seg[seg.length >> 1];
			const ws = ref ? Math.min(2.6, Math.max(0.55, ref / mid[2])) : 1;
			stroke(ctx, seg, {
				color,
				width: width * ws,
				alpha: alpha * mid[3],
				glow,
				cap: Q.length <= piece + 1 ? 'round' : 'butt'
			});
		}
	}
}

// A filled 3D polygon (a node, a lit disc): front bold, behind faint.
function blot(ctx, cam, pts, { fill, alpha = 1, hidAlpha = 0.18, centre = null }) {
	const Q = [];
	for (const p of pts) {
		const q = cam.project(p);
		if (q[2] <= NEAR) return null;
		Q.push(q);
	}
	const c = centre ? cam.project(centre) : Q[0];
	const back = zHidden(c);
	const a = back ? alpha * hidAlpha : alpha;
	if (a <= 0.003) return { c, back };
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	return { c, back };
}

// A ring of ζ = log z round a centre, `r` across, for a node or a lit disc.
const ringZ = ([x, th], r, n = 14) => {
	const out = [];
	for (let i = 0; i < n; i++) {
		const a = (TAU * i) / n;
		out.push([x + r * Math.cos(a), th + r * Math.sin(a)]);
	}
	return out;
};

// ── The net ──────────────────────────────────────────────────────────────────
// In ζ = log z = x + iθ: cyan arm j is θ = (x − m)/K + 2πj/N, pink arm j is
// θ = −(x − m)/kp + 2π(j + ½)/N, and m is the zoom (the flow from 0 to ∞).
function cyanArm(j, m, x0, x1, dx = 0.012) {
	const n = Math.max(2, Math.ceil((x1 - x0) / dx));
	const out = [];
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		out.push([x, (x - m) / K + (TAU * j) / N]);
	}
	return out;
}
function pinkArm(j, m, x0, x1, kp = KP, dx = 0.03) {
	const n = Math.max(2, Math.ceil((x1 - x0) / dx));
	const out = [];
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		out.push([x, -(x - m) / kp + (TAU * (j + 0.5)) / N]);
	}
	return out;
}
// The nodes, riding the cyan arms a RING apart.
function netNodes(m, x0, x1) {
	const out = [];
	const l0 = Math.ceil((x0 - m) / RING);
	const l1 = Math.floor((x1 - m) / RING);
	for (let l = l0; l <= l1; l++)
		for (let j = 0; j < N; j++) out.push([m + l * RING, (l * RING) / K + (TAU * j) / N]);
	return out;
}

// Draw the whole net through `place` (ζ → 3D): back pass, then front.
function drawNet(ctx, cam, place, o) {
	const {
		m,
		x0,
		x1,
		kp = KP,
		alpha = 0.9,
		ref = 0,
		gold = [0],
		goldAlpha = 1,
		node = 1,
		fade = null,
		hidden = true,
		nodeCap = 13,
		goldUpto = null,
		hid = 0.32,
		cyan = PAL.cyan,
		pink = PAL.pink,
		cw = 2.2,
		pw = 2.2
	} = o;
	const fz = fade ? (p, i, z) => fade(z) : null;
	const lines = [];
	for (let j = 0; j < N; j++) {
		const cz = cyanArm(j, m, x0, x1);
		const pz = pinkArm(j, m, x0, x1, kp);
		const cf = fz ? (p, i) => fz(p, i, cz[i]) : null;
		const pf = fz ? (p, i) => fz(p, i, pz[i]) : null;
		lines.push({
			R: runs3(cam, pz.map(place), { fade: pf, hidden }),
			color: pink,
			width: pw
		});
		const isGold = gold.includes(j) && goldAlpha > 0;
		let gz = cz;
		if (isGold && goldUpto) gz = cz.slice(0, Math.max(2, Math.round(cz.length * goldUpto(j))));
		lines.push({
			R: runs3(cam, cz.map(place), { fade: cf, hidden }),
			color: cyan,
			width: cw,
			gold: isGold
				? runs3(cam, gz.map(place), {
						fade: fz ? (p, i) => fz(p, i, gz[i]) : null,
						hidden
					})
				: null
		});
	}
	for (const L of lines)
		paint(ctx, L.R, { color: L.color, width: L.width, alpha, ref, hid }, 'back');
	for (const L of lines)
		if (L.gold)
			paint(ctx, L.gold, { color: PAL.gold, width: 3.2, alpha: goldAlpha * 0.8, ref, hid }, 'back');
	// Nodes: a small circle in ζ, carried to the surface, so it foreshortens.
	const NODES = node > 0 ? netNodes(m, x0 + 0.05, x1 - 0.05) : [];
	const nodeDraw = (which) => {
		for (const c of NODES) {
			const f = fade ? fade(c) : 1;
			if (f < 0.02) continue;
			const P0 = place(c);
			const q0 = cam.project(P0);
			if (q0[2] <= NEAR) continue;
			const back = zHidden(q0);
			if ((which === 'back') !== back) continue;
			const rz = 0.11 * RING * 1.25;
			const q1 = cam.project(place([c[0] + rz, c[1]]));
			const rpx = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
			if (rpx < 0.7) continue;
			const sc = rpx > nodeCap ? nodeCap / rpx : 1;
			blot(ctx, cam, ringZ(c, rz * sc, 12).map(place), {
				fill: PAL.node,
				alpha: 0.85 * node * f,
				hidAlpha: 0.5 * hid,
				centre: P0
			});
		}
	};
	nodeDraw('back');
	for (const L of lines)
		paint(ctx, L.R, { color: L.color, width: L.width, alpha, ref, hid }, 'front');
	for (const L of lines)
		if (L.gold)
			paint(ctx, L.gold, { color: PAL.gold, width: 3.8, alpha: goldAlpha, ref, glow: 8 }, 'front');
	nodeDraw('front');
}

// A lit point: the beat's — a disc with a hot core and a halo — at a 3D spot.
function lit(ctx, cam, P, r, a = 1, halo = 'rgba(255, 222, 150, 0.75)') {
	if (a <= 0 || r <= 0) return null;
	const q = cam.project(P);
	if (q[2] <= NEAR) return null;
	bloom(ctx, q[0], q[1], r * 6, halo, a);
	disc(ctx, q[0], q[1], r, { fill: PAL.gold, alpha: a });
	disc(ctx, q[0], q[1], r * 0.45, { fill: '#fffaf0', alpha: a });
	return q;
}

// The way in: a lit disc on the surface, growing — gold, a cream core and a
// bloom — for the fall to drop into. at(r, a) is the surface point r from
// the centre P, at angle a round it.
function portal(ctx, cam, at, P, r, g, R) {
	const qp = cam.project(P);
	if (qp[2] <= NEAR) return;
	if (g > 0 && !zHidden(qp))
		bloom(ctx, qp[0], qp[1], R * (0.1 + 0.55 * g), 'rgba(255, 222, 150, 0.55)', g);
	const ring = (s) => {
		const out = [];
		for (let i = 0; i < 72; i++) out.push(at(r * s, (TAU * i) / 72));
		return out;
	};
	blot(ctx, cam, ring(1), { fill: PAL.gold, alpha: 0.95, hidAlpha: 0.3, centre: P });
	if (g > 0.3) blot(ctx, cam, ring(0.58), { fill: '#fff6e0', alpha: span(g, 0.3, 0.8), centre: P });
}

// A label by a 3D point, pushed off it along screen direction (dx, dy).
function label3(
	ctx,
	cam,
	P,
	s,
	{ dx = 14, dy = -16, size = 24, alpha = 1, color = PAL.chalk } = {}
) {
	if (alpha <= 0) return;
	const q = cam.project(P);
	if (q[2] <= NEAR) return;
	const back = zHidden(q);
	math(ctx, s, q[0] + dx, q[1] + dy, {
		size,
		alpha: alpha * (back ? 0.4 : 1),
		color,
		align: dx < 0 ? 'right' : 'left'
	});
}

// The lecture: lines top left, each [text, written 0..1, alpha].
function lecture(ctx, w, h, lines) {
	const R = 0.42 * Math.min(w, h);
	const size = Math.round(Math.max(18, R * 0.07));
	let y = Math.max(40, h * 0.08);
	for (const [s, p, a = 1] of lines) {
		if (p > 0 && a > 0) math(ctx, s, Math.max(28, w * 0.05), y, { size, upto: p, alpha: 0.92 * a });
		y += Math.max(30, size * 1.6);
	}
}

// A 3D circle (great or small) as a polyline: centre, two axes, radius.
function circle3(c, e1, e2, r, n = 160, a0 = 0, a1 = TAU) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = a0 + ((a1 - a0) * i) / n;
		out.push(add3(c, add3(mul3(e1, r * Math.cos(a)), mul3(e2, r * Math.sin(a)))));
	}
	return out;
}

// ── The Riemann sphere ───────────────────────────────────────────────────────
// The board is the plane Z = 1 (twice the plate's units, so the unit circle
// lands on the equator), tangent to the unit sphere at 0. Curled by k (0 flat,
// 1 the sphere), it is the sphere of curvature k tangent there, each point
// at its stereographic angle: z ↦ 2 arctan|z| from 0, the projection from ∞.
function curl(p, k) {
	const r = Math.hypot(p[0], p[1]);
	if (!Number.isFinite(r)) return [0, 0, 1 - 2 / Math.max(k, 1e-6)];
	const c = r > 0 ? p[0] / r : 1;
	const s = r > 0 ? p[1] / r : 0;
	if (k < 1e-5) return [2 * p[0], 2 * p[1], 1];
	const th = 2 * Math.atan(k * r);
	const st = Math.sin(th);
	return [(c * st) / k, (s * st) / k, 1 - (1 - Math.cos(th)) / k];
}
// The curled board as a grid, for the depth buffer.
function curlGrid(k, place = (p) => p, rmax = 3000) {
	const grid = [];
	const T = 2 * Math.atan(rmax);
	for (let i = 0; i <= 40; i++) {
		const th0 = (T * i) / 40;
		const r = Math.tan(th0 / 2);
		const row = [];
		for (let j = 0; j <= 48; j++) {
			const a = (TAU * j) / 48;
			row.push(place(curl([r * Math.cos(a), r * Math.sin(a)], k)));
		}
		grid.push(row);
	}
	return grid;
}
// The sphere's outline from the lens, and a faint body inside it.
function limb(ctx, cam, a, centre = [0, 0, 0], radius = 1, color = PAL.rose) {
	if (a <= 0) return;
	const c = sub3(cam.pos, centre);
	const d = Math.hypot(...c) / radius;
	if (d <= 1.02) return;
	const n = mul3(c, 1 / (d * radius));
	const e1 = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
	const e2 = cross(n, e1);
	const pts = circle3(
		add3(centre, mul3(n, radius / d)),
		e1,
		e2,
		radius * Math.sqrt(1 - 1 / (d * d)),
		180
	);
	const Q = pts.map((p) => cam.project(p));
	if (Q.some((q) => q[2] <= NEAR)) return;
	ctx.save();
	ctx.globalAlpha = 0.05 * a;
	ctx.fillStyle = PAL.chalk;
	ctx.beginPath();
	Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
	ctx.fill();
	ctx.restore();
	stroke(ctx, Q, { color, width: 2, alpha: 0.75 * a });
}

// The plate's construction on the board — the unit circle and the two axes —
// through `place` (board point → 3D), in rose.
function frame(ctx, cam, place, { alpha = 1, ref = 0, upto = 1, reach = 40, fade = null }) {
	if (alpha <= 0) return;
	const axis = (dir) => {
		const pts = [];
		for (let i = 0; i <= 400; i++) {
			const s = Math.sinh(lerp(-1, 1, i / 400) * Math.asinh(reach));
			pts.push(place([dir[0] * s, dir[1] * s]));
		}
		return pts;
	};
	const unit = [];
	for (let i = 0; i <= 200; i++)
		unit.push(place([Math.cos((TAU * i) / 200), Math.sin((TAU * i) / 200)]));
	const o = { color: PAL.rose, width: 2, alpha: 0.7 * alpha, ref, hid: 0.5 };
	const cut = (pts) => pts.slice(0, Math.max(2, Math.round(pts.length * clamp01(upto))));
	for (const pts of [axis([1, 0]), axis([0, 1]), unit]) {
		const P = cut(pts);
		const R = runs3(cam, P, {
			fade: fade ? (p, i) => fade(i / (P.length - 1)) : null
		});
		paint(ctx, R, o);
	}
}

// The boost toward +i: z ↦ (z + it)/(1 − itz), 0 → it and ∞ → i/t.
const boostI = (p, t) => C.div([p[0], p[1] + t], [1 + t * p[1], -t * p[0]]);

// ── sphere ───────────────────────────────────────────────────────────────────
const T_BOOST = 0.38;
const B_END = curl([0, 1 / T_BOOST], 1); // where ∞ is carried, on the sphere
const B_AZ = Math.atan2(B_END[0], B_END[2]);
const B_EL = Math.asin(B_END[1]);

function sphere(ctx, w, h, u) {
	const R = 0.42 * Math.min(w, h);
	const fov = spline(u, [
		[0, 36],
		[0.8, 37],
		[1, 60]
	]);
	const D0 = (2 * pxPerUnit(h, 36)) / R; // the board's unit circle at R
	const k = smooth(span(u, 0.03, 0.45));
	const t = T_BOOST * io(span(u, 0.42, 0.7));
	// The zoom: the flow from 0 to ∞, picking up from rest.
	const m = 0.15 * u * SECONDS + 0.22 * Math.pow(u, 3) * SECONDS;
	const cam = orbit(w, h, {
		target: spline3(u, [
			[0, [0, 0, 1]],
			[0.3, [0, 0.05, 0.4]],
			[0.62, [0, 0.42, 0]],
			[0.76, [0, 0.5, 0]],
			[0.9, [0, 0.62, -0.5]],
			[1, B_END]
		]),
		az: spline(u, [
			[0, 0],
			[0.15, 0.05],
			[0.42, 0.45],
			[0.62, 0.68],
			[0.76, 0.85],
			[0.9, 2.1],
			[1, B_AZ]
		]),
		el: spline(u, [
			[0, 0],
			[0.15, 0.03],
			[0.42, 0.28],
			[0.62, 0.42],
			[0.76, 0.5],
			[0.9, 0.78],
			[1, B_EL]
		]),
		dist: spline(u, [
			[0, D0],
			[0.2, D0 * 0.9],
			[0.42, 5.1],
			[0.62, 5.0],
			[0.76, 4.5],
			[0.9, 2.3],
			[1, 0.42]
		]),
		fov
	});
	const ref = D0;
	const M = (p) => (t > 0 ? boostI(p, t) : p);
	const place = ([x, th]) => curl(M(C.exp([x, th])), k);

	if (k > 0.015) {
		zReset(w, h);
		zGrid(cam, curlGrid(k));
	} else ZB.on = false;

	// The body of the sphere, once it closes.
	limb(ctx, cam, span(k, 0.85, 1));
	// The construction: unit circle → equator, the axes → two meridians.
	frame(ctx, cam, (p) => curl(p, k), {
		alpha: 0.55 * (1 - 0.6 * span(u, 0.8, 0.95)),
		ref,
		reach: lerp(6, 400, k)
	});
	const X = 4.2;
	drawNet(ctx, cam, place, {
		m,
		x0: -X,
		x1: X,
		ref,
		alpha: 0.9,
		hid: 0.32 - 0.22 * span(u, 0.84, 0.95)
	});

	// ℓ, the line through the poles, and ℓ*, its polar: where the tangent
	// planes at the poles meet (at infinity until the boost brings it in).
	const A3 = curl(M([0, 0]), k);
	const B3 = curl(t > 1e-4 ? [0, 1 / t] : [Infinity, 0], k);
	const lw = span(u, 0.44, 0.54) * (1 - span(u, 0.76, 0.83));
	if (lw > 0 && k > 0.99) {
		const d = norm(sub3(B3, A3));
		const a = sub3(A3, mul3(d, 0.55));
		const bb = add3(B3, mul3(d, 0.55));
		const L = [];
		for (let i = 0; i <= 120; i++) L.push(lerp3(a, bb, i / 120));
		paint(ctx, runs3(cam, L.slice(0, Math.max(2, Math.round(121 * lw)))), {
			color: PAL.chalk,
			width: 2,
			alpha: 0.85,
			ref,
			hid: 0.45
		});
		label3(ctx, cam, bb, 'ℓ', { dx: 10, dy: -14, alpha: span(lw, 0.8, 1) });
		const ab = dot(A3, B3);
		if (1 + ab > 1e-3) {
			// The apex of the tent: the tangent planes at the two poles meet
			// along ℓ*, which passes through it square to the poles' plane.
			const q0 = mul3(add3(A3, B3), 1 / (1 + ab));
			const fa = (1 - span(Math.hypot(...q0), 2.2, 4.5)) * span(u, 0.52, 0.6) * lw;
			if (fa > 0) {
				const e = norm(cross(A3, B3));
				const S = [];
				for (let i = 0; i <= 100; i++) S.push(add3(q0, mul3(e, lerp(-1.15, 1.15, i / 100))));
				paint(ctx, runs3(cam, S), { color: PAL.chalk, width: 2, alpha: 0.85 * fa, ref });
				for (const P of [A3, B3]) {
					const T = [];
					for (let i = 0; i <= 40; i++) T.push(lerp3(P, q0, i / 40));
					paint(ctx, runs3(cam, T), {
						color: PAL.rose,
						width: 1.8,
						alpha: 0.95 * fa,
						ref,
						hid: 0.4
					});
				}
				const q1 = cam.project(S[0]);
				const q2 = cam.project(S[100]);
				label3(ctx, cam, q1[0] > q2[0] ? S[0] : S[100], 'ℓ*', { dx: 10, dy: -14, alpha: fa });
			}
		}
	}

	// 0, lit: the beat's glow at the start, a gold disc on the sphere.
	const aGlow = 1 - span(u, 0.04, 0.3);
	const qa = cam.project(A3);
	if (qa[2] > NEAR && aGlow > 0)
		bloom(ctx, qa[0], qa[1], R * 0.3 * aGlow, 'rgba(255, 226, 160, 0.5)', aGlow);
	const capA = [];
	for (let i = 0; i < 28; i++) capA.push(curl(M(C.polar(0.035, (TAU * i) / 28)), k));
	blot(ctx, cam, capA, { fill: PAL.gold, alpha: 1, hidAlpha: 0.35, centre: A3 });
	lit(ctx, cam, A3, 4 + 4 * aGlow, zHidden(qa) ? 0.35 : 1);
	// ∞, lit as the lens comes round to it, growing.
	const g = span(u, 0.66, 1);
	if (k > 0.98) {
		const atB = (r, a) => curl(M(C.div([1, 0], C.polar(r, a))), k);
		if (g > 0) portal(ctx, cam, atB, B3, 0.012 + 0.045 * Math.pow(g, 1.2), g, R);
		else {
			const capB = [];
			for (let i = 0; i < 24; i++) capB.push(atB(0.012, (TAU * i) / 24));
			blot(ctx, cam, capB, { fill: PAL.node, alpha: 0.9, centre: B3 });
		}
		label3(ctx, cam, B3, '∞', {
			dx: 16,
			dy: 22,
			size: 26,
			alpha: span(u, 0.34, 0.42) * (1 - span(u, 0.86, 0.92))
		});
	}
	label3(ctx, cam, A3, '0', {
		dx: -14,
		dy: -18,
		size: 26,
		alpha: span(u, 0.3, 0.38) * (1 - span(u, 0.86, 0.92))
	});

	const out = 1 - span(u, 0.86, 0.95);
	lecture(ctx, w, h, [
		['z = (X + iY) / (1 − Z)', span(u, 0.1, 0.22), out],
		['z ↦ (z + it) / (1 − itz)', span(u, 0.44, 0.56), out]
	]);
}

// ── torus ────────────────────────────────────────────────────────────────────
// The tube's length is tuned so that both families close round it: the cyan
// arms come back 52 eighths of a turn on, the pink 18, so the length is
// 2π·52K/8 ≈ 4π and the torus is 2 : 1. The gold arm (cyan 0) comes back as
// cyan 4 and then as itself: two laps, 13 turns of the tube — a (2, 13) knot.
const TX = (Math.PI * 52 * K) / N; // half the tube's length, in log|z|
const KPT = (2 * TX * N) / (TAU * 18); // the pink pitch that closes (≈ 0.885)

// The roll-up: β = 1 the plane, the conformal cones ρ = e^{βx} on the way,
// β = 0 the unit cylinder (x along its axis); then the axis bent round a
// circle by φ, 0 → 2π, which glues its ends.
function tube([x, th], beta, phi) {
	let rho;
	let z;
	if (beta > 1e-6) {
		rho = Math.exp(beta * x);
		z = (Math.sqrt(Math.max(0, 1 - beta * beta)) * Math.expm1(beta * x)) / beta;
	} else {
		rho = 1;
		z = x;
	}
	const px = rho * Math.cos(th);
	const py = rho * Math.sin(th);
	if (phi < 1e-4) return [px, py, z];
	const Rb = (2 * TX) / phi;
	const psi = z / Rb;
	return [Rb - (Rb - px) * Math.cos(psi), py, (Rb - px) * Math.sin(psi)];
}

const P_TOP = tube([TX, Math.PI / 2], 0, TAU); // the top of the seam

function torus(ctx, w, h, u) {
	const R = 0.42 * Math.min(w, h);
	const fov = spline(u, [
		[0, 40],
		[0.8, 42],
		[1, 64]
	]);
	const D0 = pxPerUnit(h, 40) / R; // the unit circle at R, from straight above
	const beta = 1 - io(span(u, 0.03, 0.36));
	const phi = TAU * io(span(u, 0.38, 0.66));
	const glued = span(phi, TAU * 0.985, TAU);
	const m = 0.12 * u * SECONDS + 0.25 * Math.pow(u, 3) * SECONDS;
	// The lens holds the middle of the bending tube (the centroid of its
	// axis), lifted a little once it is a torus, then makes for the seam's top.
	const cx = phi > 1e-3 ? ((2 * TX) / phi) * (1 - Math.sin(phi / 2) / (phi / 2)) : 0;
	const body = [cx, 0.55 * smooth(span(u, 0.5, 0.75)), 0];
	const cam = orbit(w, h, {
		target: lerp3(body, P_TOP, smooth(span(u, 0.74, 1))),
		az: spline(u, [
			[0, 0],
			[0.14, 0.02],
			[0.4, 0.5],
			[0.66, 1.35],
			[0.86, 1.62],
			[1, 1.95]
		]),
		el: spline(u, [
			[0, 0],
			[0.14, 0.02],
			[0.4, 0.36],
			[0.66, 0.82],
			[0.86, 1.18],
			[1, Math.PI / 2 - 1e-3]
		]),
		dist: spline(u, [
			[0, D0],
			[0.12, D0 * 1.06],
			[0.4, 16.5],
			[0.66, 10.5],
			[0.86, 4.4],
			[1, 0.95]
		]),
		fov
	});
	const ref = spline(u, [
		[0, D0],
		[0.4, 11],
		[0.66, 8.5],
		[0.86, 3.6],
		[1, 1.6]
	]);
	const place = (z) => tube(z, beta, phi);

	if (beta < 0.97) {
		zReset(w, h);
		const grid = [];
		for (let i = 0; i <= 96; i++) {
			const x = -TX + (2 * TX * i) / 96;
			const row = [];
			for (let j = 0; j <= 40; j++) row.push(place([x, (TAU * j) / 40]));
			grid.push(row);
		}
		zGrid(cam, grid);
	} else ZB.on = false;

	// The rose unit circle: the middle of the tube.
	const mid = [];
	for (let i = 0; i <= 120; i++) mid.push(place([0, (TAU * i) / 120]));
	paint(ctx, runs3(cam, mid), { color: PAL.rose, width: 2, alpha: 0.5, ref, hid: 0.5 });

	// The net. Before the glue, the gold arm is the beat's; as the ends meet,
	// it runs on round the far side (cyan 4) and closes into the knot.
	const knot = span(u, 0.66, 0.8);
	drawNet(ctx, cam, place, {
		m,
		x0: -TX,
		x1: TX,
		kp: KPT,
		ref,
		alpha: 0.9 - 0.2 * knot,
		gold: knot > 0 ? [0, 4] : [0],
		hid: 0.32 - 0.22 * span(u, 0.86, 0.97),
		goldUpto: (j) => (j === 4 ? knot : 1)
	});

	// The two ends: toward 0, lit (the pole, opening into the tube's gold
	// mouth); toward ∞, chalk. Glued, they are one seam, in gold.
	const end0 = [];
	const endI = [];
	for (let i = 0; i <= 80; i++) {
		end0.push(place([-TX, (TAU * i) / 80]));
		endI.push(place([TX, (TAU * i) / 80]));
	}
	const flash = span(u, 0.64, 0.67) * (1 - span(u, 0.67, 0.76));
	const c0 = end0.slice(0, 80).reduce((s, p) => add3(s, mul3(p, 1 / 80)), [0, 0, 0]);
	const fillA = 0.3 * (1 - glued);
	if (fillA > 0) {
		const Q = end0.map((p) => cam.project(p));
		if (Q.every((q) => q[2] > NEAR)) {
			ctx.save();
			ctx.globalAlpha = fillA;
			ctx.fillStyle = PAL.gold;
			ctx.beginPath();
			Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
			ctx.fill();
			ctx.restore();
		}
	}
	paint(ctx, runs3(cam, endI), {
		color: PAL.chalk,
		width: 2.4,
		alpha: 0.8 * (1 - glued) * span(1 - beta, 0.6, 0.9),
		ref
	});
	paint(ctx, runs3(cam, end0), {
		color: PAL.gold,
		width: 3.2 + 4 * flash,
		alpha: 1,
		ref,
		glow: 6 + 18 * flash,
		hid: 0.5
	});
	const q0 = cam.project(c0);
	const glow = 1 - 0.75 * span(u, 0.08, 0.4);
	if (q0[2] > NEAR && glued < 1)
		bloom(ctx, q0[0], q0[1], R * (0.32 * glow), 'rgba(255, 226, 160, 0.55)', glow * (1 - glued));
	if (beta > 0.6) lit(ctx, cam, c0, 9 * span(beta, 0.6, 1), 1);
	if (flash > 0) {
		const qc = cam.project(tube([TX, 0], 0, phi));
		if (qc[2] > NEAR) bloom(ctx, qc[0], qc[1], R * 0.6 * flash, 'rgba(255, 236, 196, 0.6)', flash);
	}

	// The end labels, while there are ends.
	const lab = span(u, 0.28, 0.36) * (1 - span(u, 0.55, 0.62));
	const qc0 = cam.project(c0);
	const cI = endI.slice(0, 80).reduce((s, p) => add3(s, mul3(p, 1 / 80)), [0, 0, 0]);
	if (qc0[2] > NEAR)
		math(ctx, '0', qc0[0] - 30, qc0[1] - 30, { size: 26, alpha: lab, align: 'right' });
	const qcI = cam.project(cI);
	if (qcI[2] > NEAR) math(ctx, '∞', qcI[0] + 30, qcI[1] - 30, { size: 26, alpha: lab });

	// The point the lens dives at: the top of the seam, lit, growing.
	const g = span(u, 0.74, 1);
	if (g > 0) {
		const atP = (r, a) => place([TX + r * Math.cos(a), Math.PI / 2 + r * Math.sin(a)]);
		portal(ctx, cam, atP, P_TOP, 0.02 + 0.13 * Math.pow(g, 1.2), g, R);
	}

	const out = 1 - span(u, 0.8, 0.87);
	lecture(ctx, w, h, [
		['ζ = log z = log r + iθ', span(u, 0.1, 0.2), out],
		['z ∼ λz :  the ends glue', span(u, 0.5, 0.6), out],
		['the gold arm : a (2, 13) torus knot', span(u, 0.66, 0.74), out]
	]);
}

// ── flip ─────────────────────────────────────────────────────────────────────
// The maps' parameters, and where they leave the lit pole M(0): after the
// turn-over it is high on the far side of the sphere, for the lens to come round to
// (and before it, low on the near side, under the lens as the board curls).
const FB = [1.3, -0.25]; // b
const FR = -2.0; // θ
const FL = 0.55; // λ
const turnX = (p, a) => {
	if (!a) return p;
	const c = Math.cos(a);
	const s = Math.sin(a);
	return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]];
};
const A_END = turnX(curl(C.scale(C.rot(FB, FR), FL), 1), Math.PI);
const A_AZ = Math.atan2(A_END[0], A_END[2]);
const A_EL = Math.asin(A_END[1]);

function flip(ctx, w, h, u) {
	const R = 0.42 * Math.min(w, h);
	const fov = spline(u, [
		[0, 46],
		[0.55, 46],
		[0.8, 40],
		[1, 62]
	]);
	const D0 = (2 * pxPerUnit(h, 46)) / R;
	const sT = io(span(u, 0.1, 0.24));
	const sR = io(span(u, 0.26, 0.4));
	const sD = io(span(u, 0.42, 0.55));
	const bb = [FB[0] * sT, FB[1] * sT];
	const M = (p) => C.scale(C.rot(C.add(p, bb), FR * sR), Math.pow(FL, sD));
	const k = smooth(span(u, 0.55, 0.75));
	const turn = Math.PI * io(span(u, 0.73, 0.88));
	const onSphere = (p) => turnX(curl(p, k), turn);
	// The lens keeps the lit pole in view while the maps carry it about the
	// board, then lets go of it for the sphere, and comes round to it at last.
	const A3 = onSphere(M([0, 0]));
	const base = spline3(u, [
		[0, [0, 0, 1]],
		[0.55, [0, 0, 1]],
		[0.75, [0, 0, 0.1]],
		[0.88, [0, 0.15, 0]],
		[1, A_END]
	]);
	const follow = 0.35 * smooth(span(u, 0.08, 0.22)) * (1 - smooth(span(u, 0.55, 0.75)));
	const cam = orbit(w, h, {
		target: lerp3(base, A3, follow),
		az: spline(u, [
			[0, 0],
			[0.08, 0.01],
			[0.3, 0.22],
			[0.55, 0.32],
			[0.75, 0.05],
			[0.88, -0.65],
			[1, A_AZ]
		]),
		el: spline(u, [
			[0, 0],
			[0.08, -0.03],
			[0.28, -0.98],
			[0.52, -1.02],
			[0.75, -0.4],
			[0.88, 0.35],
			[1, A_EL]
		]),
		dist: spline(u, [
			[0, D0],
			[0.28, 5.4],
			[0.52, 5.0],
			[0.75, 4.5],
			[0.88, 4.0],
			[1, 0.4]
		]),
		fov
	});
	const ref = D0;
	const place = ([x, th]) => onSphere(M(C.exp([x, th])));
	// On the flat board the net fades out with distance; curled, it closes.
	const far = lerp(2.4, 600, k * k);
	const fade = ([x, th]) => {
		const r = C.abs(M(C.exp([x, th])));
		return 1 - smooth(span(r, far, far * 2.4));
	};

	if (k > 0.015) {
		zReset(w, h);
		zGrid(
			cam,
			curlGrid(k, (p) => turnX(p, turn))
		);
	} else ZB.on = false;

	limb(ctx, cam, span(k, 0.85, 1));
	frame(ctx, cam, onSphere, {
		alpha: 0.85 - 0.25 * k,
		ref,
		reach: lerp(5, 400, k),
		fade: k < 0.5 ? (f) => 1 - smooth(span(Math.abs(f - 0.5) * 2, 0.55, 0.95)) * (1 - 2 * k) : null
	});
	const X = 4.2;
	drawNet(ctx, cam, place, { m: 0, x0: -X, x1: X, ref, alpha: 0.9, fade });

	// The board's own marks: 0 and 1 (fixed), and the poles of the net.
	const fixA = span(u, 0.06, 0.14) * (1 - span(u, 0.6, 0.68));
	label3(ctx, cam, onSphere([0, 0]), '0', {
		dx: -10,
		dy: 20,
		size: 20,
		alpha: fixA * span(sT, 0.15, 0.4)
	});
	label3(ctx, cam, onSphere([1, 0]), '1', { dx: 8, dy: 18, size: 20, alpha: fixA });
	label3(ctx, cam, onSphere([0, 1]), 'i', { dx: 10, dy: -10, size: 20, alpha: fixA });

	const qa = cam.project(A3);
	const aGlow = 1 - span(u, 0.04, 0.26);
	if (qa[2] > NEAR && aGlow > 0)
		bloom(ctx, qa[0], qa[1], R * 0.3 * aGlow, 'rgba(255, 226, 160, 0.5)', aGlow);
	// The lit pole: a gold disc on the board, carried by every map; at the
	// end, the way in. (A circle r round M(0), whatever the maps have done.)
	const lam = Math.pow(FL, sD);
	const atA = (r, a) => onSphere(M(C.polar(r / lam, a)));
	const g = span(u, 0.84, 1);
	if (g > 0) portal(ctx, cam, atA, A3, 0.03 + 0.07 * Math.pow(g, 1.2), g, R);
	else {
		const cap = [];
		for (let i = 0; i < 28; i++) cap.push(atA(0.03, (TAU * i) / 28));
		blot(ctx, cam, cap, { fill: PAL.gold, alpha: 1, hidAlpha: 0.35, centre: A3 });
	}
	if (g < 0.3) lit(ctx, cam, A3, 4 + 4 * aGlow, (zHidden(qa) ? 0.35 : 1) * (1 - g / 0.3));
	if (k > 0.9) {
		const B3 = onSphere([Infinity, 0]);
		label3(ctx, cam, B3, '∞', {
			dx: 14,
			dy: -16,
			size: 24,
			alpha: span(u, 0.66, 0.72) * (1 - span(u, 0.9, 0.95))
		});
	}

	// The lecture, one generator at a time; the one acting is bright.
	const now = (a, b) => 0.45 + 0.55 * (span(u, a, a + 0.02) * (1 - span(u, b, b + 0.03)));
	const out = 1 - span(u, 0.93, 0.99);
	lecture(ctx, w, h, [
		['z ↦ z + b', span(u, 0.1, 0.15), now(0.1, 0.25) * out],
		['z ↦ e^{iθ} z', span(u, 0.26, 0.31), now(0.26, 0.41) * out],
		['z ↦ λ z', span(u, 0.42, 0.46), now(0.42, 0.56) * out],
		['z ↦ 1 / z', span(u, 0.62, 0.67), now(0.62, 0.88) * out],
		['(az + b) / (cz + d)', span(u, 0.87, 0.93), out]
	]);
}

// ═════════════════════════════════════════════════════════════════════════════
// The maps on the torus: cat, twist, weierstrass, hopf, knot. Ink on the board,
// gold only for a lit point; no lecture.

// A lens moved across the board by (dx, dy) px: a panel of the board.
const shiftCam = (cam, dx, dy) => ({
	...cam,
	project: (p) => {
		const q = cam.project(p);
		return [q[0] + dx, q[1] + dy, q[2]];
	}
});

// A torus of revolution about the y axis through `c`: a round the hole and b
// round the tube, both in turns.
function ring([a, b], R, r, c = [0, 0, 0]) {
	const A = TAU * a;
	const B = TAU * b;
	const s = R + r * Math.cos(B);
	return [c[0] + s * Math.cos(A), c[1] + r * Math.sin(B), c[2] - s * Math.sin(A)];
}
// Its outward normal.
function ringN([a, b]) {
	const A = TAU * a;
	const B = TAU * b;
	return [Math.cos(B) * Math.cos(A), Math.sin(B), -Math.cos(B) * Math.sin(A)];
}
// A patch of parameter space [a0, a1] × [b0, b1] as a grid of 3D points.
function patch(place, a0, a1, b0, b1, na, nb) {
	const grid = [];
	for (let i = 0; i <= na; i++) {
		const a = lerp(a0, a1, i / na);
		const row = [];
		for (let j = 0; j <= nb; j++) row.push(place([a, lerp(b0, b1, j / nb)]));
		grid.push(row);
	}
	return grid;
}
// n + 1 points from p to q.
function seg2(p, q, n) {
	const out = [];
	for (let i = 0; i <= n; i++) out.push([lerp(p[0], q[0], i / n), lerp(p[1], q[1], i / n)]);
	return out;
}
// A chalk line in 3D, hidden-line tested against the depth buffer.
const ink3 = (ctx, cam, pts, o, which = null) => paint(ctx, runs3(cam, pts), o, which);
// The turn about the x axis through `c` (for the fold).
function turnAbout(p, c, a) {
	if (!a) return p;
	const y = p[1] - c[1];
	const z = p[2] - c[2];
	const co = Math.cos(a);
	const si = Math.sin(a);
	return [p[0], c[1] + co * y - si * z, c[2] + si * y + co * z];
}
// The arrows of a gluing on an edge: n chevrons at P pointing along d, with
// `side` across it — 3D points through a lens, or 2D with cam null.
function chevrons(ctx, cam, P, d, side, s, n, o) {
	for (let k = 0; k < n; k++) {
		const off = s * 1.5 * (k - (n - 1) / 2);
		const at = (x, y) =>
			P.length === 3
				? add3(P, add3(mul3(d, off + x), mul3(side, y)))
				: [P[0] + d[0] * (off + x) + side[0] * y, P[1] + d[1] * (off + x) + side[1] * y];
		const V = [at(-0.5 * s, 0.6 * s), at(0.5 * s, 0), at(-0.5 * s, -0.6 * s)];
		if (cam) ink3(ctx, cam, V, o);
		else stroke(ctx, V, o);
	}
}
// A lit point on the flat board.
function lit2(ctx, q, r, a = 1) {
	if (a <= 0) return;
	bloom(ctx, q[0], q[1], r * 6, 'rgba(255, 222, 150, 0.75)', a);
	disc(ctx, q[0], q[1], r, { fill: PAL.gold, alpha: a });
	disc(ctx, q[0], q[1], r * 0.45, { fill: '#fffaf0', alpha: a });
}
// The lens on its orbit, as a raw pose (so two poses can be blended).
function orbitPose({ target = [0, 0, 0], az, el, dist }) {
	const ce = Math.cos(el);
	const se = Math.sin(el);
	const ca = Math.cos(az);
	const sa = Math.sin(az);
	return {
		pos: add3(target, mul3([sa * ce, se, ca * ce], dist)),
		target,
		up: [-sa * se, ce, -ca * se]
	};
}
// Piecewise eased keys [[u, value], …]: at rest at every key.
function eased(u, keys) {
	if (u <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [u0, v0] = keys[i];
		const [u1, v1] = keys[i + 1];
		if (u <= u1) return lerp(v0, v1, smooth((u - u0) / (u1 - u0)));
	}
	return keys[keys.length - 1][1];
}

// ── cat ──────────────────────────────────────────────────────────────────────
// Matrices are [m00, m01, m10, m11], acting on (x, y) as (m00 x + m01 y,
// m10 x + m11 y). A is the cat map; A^s its flow (A symmetric: φ^{±2s} on its
// eigenlines (φ, 1) and (−1, φ)), A¹ = A exactly.
const CAT_A = [2, 1, 1, 1];
const CAT_N = 192; // the discrete torus; A's period on it is counted at start (48)
const mat2 = (A, B) => [
	A[0] * B[0] + A[1] * B[2],
	A[0] * B[1] + A[1] * B[3],
	A[2] * B[0] + A[3] * B[2],
	A[2] * B[1] + A[3] * B[3]
];
function catPow(s) {
	const l1 = Math.pow(PHI, 2 * s);
	const l2 = Math.pow(PHI, -2 * s);
	const n = 1 + PHI * PHI;
	const off = (PHI * (l1 - l2)) / n;
	return [(l1 * PHI * PHI + l2) / n, off, off, (l1 + l2 * PHI * PHI) / n];
}
function catPeriod(N) {
	let M = [1, 0, 0, 1];
	for (let k = 1; k < 10 * N; k++) {
		M = mat2(CAT_A, M).map((x) => x % N);
		if (M[0] === 1 && M[1] === 0 && M[2] === 0 && M[3] === 1) return k;
	}
	return 0;
}
// The parallelogram A[0, 1]² and its cuts along the integer lines: four
// pieces, each slid back into the square by its cell (Sutherland–Hodgman).
const CAT_SQ = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1]
];
const CAT_PAR = CAT_SQ.map(([x, y]) => [2 * x + y, x + y]);
function clipBox(poly, x0, y0, x1, y1) {
	let P = poly;
	const edges = [(p) => p[0] - x0, (p) => x1 - p[0], (p) => p[1] - y0, (p) => y1 - p[1]];
	for (const f of edges) {
		const out = [];
		for (let i = 0; i < P.length; i++) {
			const a = P[i];
			const b = P[(i + 1) % P.length];
			const fa = f(a);
			const fb = f(b);
			if (fa >= 0) out.push(a);
			if (fa * fb < 0) {
				const t = fa / (fa - fb);
				out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
			}
		}
		P = out;
		if (!P.length) break;
	}
	return P;
}
const area2 = (P) =>
	P.reduce((s, p, i) => s + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0) /
	2;
const CAT_PIECES = [];
for (let j = 0; j < 2; j++)
	for (let i = 0; i < 3; i++) {
		const poly = clipBox(CAT_PAR, i, j, i + 1, j + 1);
		if (poly.length > 2 && Math.abs(area2(poly)) > 1e-9) CAT_PIECES.push({ cell: [i, j], poly });
	}
// The far piece slides first.
CAT_PIECES.sort((p, q) => q.cell[0] + q.cell[1] - (p.cell[0] + p.cell[1]));

// The three drawn iterates: stretched (A^s), cut, slid back.
const CAT_STEPS = [
	{ s: [0.07, 0.17], c: [0.17, 0.2], l: [0.2, 0.28] },
	{ s: [0.29, 0.36], c: [0.36, 0.38], l: [0.38, 0.44] },
	{ s: [0.45, 0.5], c: [0.5, 0.515], l: [0.515, 0.56] }
];
const CAT_SWAP = [0.565, 0.59]; // the drawn third iterate → its sampling
const CAT_HOME = [0.93, 0.97]; // the discrete room → the drawn room
const catKeys = (P) => [
	[0.59, 3],
	[0.64, 6],
	[0.705, P / 2 - 2],
	[0.73, P / 2],
	[0.765, P / 2],
	[0.79, P / 2 + 2],
	[0.86, P - 4],
	[0.92, P]
];

// The room as one chalk drawing (every layer's silhouette cleared before its
// chalk goes down, so the bed hides the wall), its alpha as the picture.
function catSetup(art, decade) {
	const W = 1024;
	const H = Math.round(W / PHI);
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const x = c.getContext('2d', { willReadFrequently: true });
	for (const L of LAYERS) {
		const o = { cx: W / 2, cy: H / 2, height: H, layers: [L.key] };
		x.globalCompositeOperation = 'destination-out';
		drawRoom(x, art, decade, o);
		x.globalCompositeOperation = 'source-over';
		drawRoom(x, art, decade, { ...o, chalk: true });
	}
	const d = x.getImageData(0, 0, W, H).data;
	const a0 = new Float32Array(W * H);
	for (let i = 0; i < W * H; i++) a0[i] = d[i * 4 + 3] / 255;
	// The k-th iterate, sampled exactly from the room at A⁻ᵏ(x, y) mod 1.
	const pics = [c];
	let M = [1, 0, 0, 1];
	for (let k = 1; k <= 3; k++) {
		M = mat2(M, [1, -1, -1, 2]);
		pics.push(catPicture(a0, W, H, M, k < 3 ? 2 : 3));
	}
	// The room on the discrete torus: cell (i, j) centred at (i, j)/N.
	const N = CAT_N;
	const acc = new Float32Array(N * N);
	const cnt = new Float32Array(N * N);
	for (let py = 0; py < H; py++)
		for (let px = 0; px < W; px++) {
			const i = Math.round(((px + 0.5) / W) * N) % N;
			const j = Math.round((1 - (py + 0.5) / H) * N) % N;
			acc[j * N + i] += a0[py * W + px];
			cnt[j * N + i] += 1;
		}
	const d0 = new Uint8ClampedArray(N * N);
	for (let i = 0; i < N * N; i++) d0[i] = cnt[i] ? (255 * acc[i]) / cnt[i] : 0;
	const cv = document.createElement('canvas');
	cv.width = cv.height = N;
	const cx = cv.getContext('2d');
	return { W, H, pics, N, d0, period: catPeriod(N), cv, cx, img: cx.createImageData(N, N) };
}
function catPicture(a0, W, H, M, S) {
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const x = c.getContext('2d');
	const img = x.createImageData(W, H);
	const p = img.data;
	const at = (X, Y) => {
		const sx = X * W - 0.5;
		const sy = (1 - Y) * H - 0.5;
		let x0 = Math.floor(sx);
		let y0 = Math.floor(sy);
		const fx = sx - x0;
		const fy = sy - y0;
		x0 = ((x0 % W) + W) % W;
		y0 = ((y0 % H) + H) % H;
		const x1 = (x0 + 1) % W;
		const y1 = (y0 + 1) % H;
		return (
			(a0[y0 * W + x0] * (1 - fx) + a0[y0 * W + x1] * fx) * (1 - fy) +
			(a0[y1 * W + x0] * (1 - fx) + a0[y1 * W + x1] * fx) * fy
		);
	};
	for (let j = 0; j < H; j++)
		for (let i = 0; i < W; i++) {
			let s = 0;
			for (let sj = 0; sj < S; sj++)
				for (let si = 0; si < S; si++) {
					const X0 = (i + (si + 0.5) / S) / W;
					const Y0 = 1 - (j + (sj + 0.5) / S) / H;
					let X = M[0] * X0 + M[1] * Y0;
					let Y = M[2] * X0 + M[3] * Y0;
					X -= Math.floor(X);
					Y -= Math.floor(Y);
					s += at(X, Y);
				}
			const o = (j * W + i) * 4;
			p[o] = 236;
			p[o + 1] = 230;
			p[o + 2] = 218;
			p[o + 3] = (255 * s) / (S * S);
		}
	x.putImageData(img, 0, 0);
	return c;
}
// The discrete torus after k turns: cell q goes to Aᵏq mod N.
function catDiscrete(S, k) {
	const { N, d0, img, cv, cx } = S;
	let M = [1, 0, 0, 1];
	for (let i = 0; i < k; i++) M = mat2(CAT_A, M).map((x) => x % N);
	const p = img.data;
	for (let j = 0; j < N; j++)
		for (let i = 0; i < N; i++) {
			const ti = (M[0] * i + M[1] * j) % N;
			const tj = (M[2] * i + M[3] * j) % N;
			const o = ((N - 1 - tj) * N + ti) * 4;
			p[o] = 236;
			p[o + 1] = 230;
			p[o + 2] = 218;
			p[o + 3] = d0[j * N + i];
		}
	cx.putImageData(img, 0, 0);
	return cv;
}
// Canvas affines [a, b, c, d, e, f]: A after B.
const aff = (A, B) => [
	A[0] * B[0] + A[2] * B[1],
	A[1] * B[0] + A[3] * B[1],
	A[0] * B[2] + A[2] * B[3],
	A[1] * B[2] + A[3] * B[3],
	A[0] * B[4] + A[2] * B[5] + A[4],
	A[1] * B[4] + A[3] * B[5] + A[5]
];

function cat(ctx, w, h, u, S) {
	if (!S) return;
	const P = S.period;
	// Where the run is: the k-th drawn iterate at rest, or being stretched,
	// cut and slid back into the square; then the discrete torus.
	let k = 3;
	let mode = 'rest';
	let p = 0;
	for (let i = 0; i < CAT_STEPS.length; i++) {
		const st = CAT_STEPS[i];
		if (u < st.s[0]) {
			k = i;
			break;
		}
		if (u < st.s[1]) {
			[k, mode, p] = [i, 'stretch', span(u, st.s[0], st.s[1])];
			break;
		}
		if (u < st.c[1]) {
			[k, mode, p] = [i, 'cut', span(u, st.c[0], st.c[1])];
			break;
		}
		if (u < st.l[1]) {
			[k, mode, p] = [i, 'slide', span(u, st.l[0], st.l[1])];
			break;
		}
	}
	const L = mode === 'stretch' ? catPow(io(p)) : CAT_A;
	// Each piece's slide home, the far one first.
	const slid = CAT_PIECES.map((pc, i) =>
		mode === 'slide' ? io(span(p, 0.2 * i, 0.2 * i + 0.6)) : 0
	);
	const offOf = (i) => [-CAT_PIECES[i].cell[0] * slid[i], -CAT_PIECES[i].cell[1] * slid[i]];

	// The view: everything drawn, in frame.
	let pts = [
		[0, 0],
		[1, 1]
	];
	if (mode === 'stretch')
		pts = pts.concat(CAT_SQ.map(([x, y]) => [L[0] * x + L[1] * y, L[2] * x + L[3] * y]));
	else if (mode === 'cut') pts = pts.concat(CAT_PAR);
	else if (mode === 'slide')
		CAT_PIECES.forEach((pc, i) => {
			const o = offOf(i);
			pts = pts.concat(pc.poly.map((q) => [q[0] + o[0], q[1] + o[1]]));
		});
	const bx0 = Math.min(...pts.map((q) => q[0]));
	const bx1 = Math.max(...pts.map((q) => q[0]));
	const by0 = Math.min(...pts.map((q) => q[1]));
	const by1 = Math.max(...pts.map((q) => q[1]));
	const Hfull = Math.min((0.84 * w) / PHI, 0.76 * h);
	const Hpx = Math.min((0.84 * w) / (PHI * (bx1 - bx0)), (0.76 * h) / (by1 - by0));
	const Wpx = PHI * Hpx;
	const ox = w / 2 - ((bx0 + bx1) / 2) * Wpx;
	const oy = 0.53 * h + ((by0 + by1) / 2) * Hpx;
	const scr = ([x, y]) => [ox + x * Wpx, oy - y * Hpx];
	const zoomOut = 1 - Hpx / Hfull;

	// A picture of the torus (W × H px, y down) under (x, y) ↦ L(x, y) + t.
	const pic = (img, M, t, alpha, clip = null, crisp = false) => {
		if (alpha <= 0.003) return;
		ctx.save();
		if (clip) {
			ctx.beginPath();
			clip.forEach((q, i) => (i ? ctx.lineTo(...scr(q)) : ctx.moveTo(...scr(q))));
			ctx.closePath();
			ctx.clip();
		}
		ctx.globalAlpha = alpha;
		ctx.imageSmoothingEnabled = !crisp;
		ctx.transform(
			...aff(
				[Wpx, 0, 0, -Hpx, ox, oy],
				aff([M[0], M[2], M[1], M[3], t[0], t[1]], [1 / img.width, 0, 0, -1 / img.height, 0, 1])
			)
		);
		ctx.drawImage(img, 0, 0);
		ctx.restore();
	};
	const SQ = CAT_SQ;
	const I2 = [1, 0, 0, 1];
	// The discrete torus: cells centred on the grid points, so wrapped.
	const discrete = (kk, alpha) => {
		const img = catDiscrete(S, kk);
		const hc = -0.5 / S.N;
		for (const dy of [0, 1])
			for (const dx of [0, 1]) pic(img, I2, [hc + dx, hc + dy], alpha, SQ, true);
	};
	const poly = (Q, o) => stroke(ctx, [...Q, Q[0]].map(scr), o);

	// The cover: the integer lines, faint, once the view has pulled back.
	if (zoomOut > 0.02) {
		const ga = 0.28 * span(zoomOut, 0.02, 0.4);
		for (let i = -1; i <= 4; i++)
			stroke(ctx, [scr([i, -1]), scr([i, 3])], {
				color: PAL.chalk,
				width: 1,
				alpha: ga,
				dash: [3, 6]
			});
		for (let j = -1; j <= 3; j++)
			stroke(ctx, [scr([-1, j]), scr([4, j])], {
				color: PAL.chalk,
				width: 1,
				alpha: ga,
				dash: [3, 6]
			});
	}

	// The picture.
	const fadeIn = smooth(span(u, 0, 0.05));
	let kd;
	if (u < CAT_SWAP[0]) {
		if (mode === 'rest') pic(S.pics[k], I2, [0, 0], fadeIn);
		else if (mode === 'stretch' || mode === 'cut') pic(S.pics[k], L, [0, 0], 1);
		else
			CAT_PIECES.forEach((pc, i) => {
				const o = offOf(i);
				pic(
					S.pics[k],
					CAT_A,
					o,
					1,
					pc.poly.map((q) => [q[0] + o[0], q[1] + o[1]])
				);
			});
		kd = k;
	} else {
		const sw = span(u, CAT_SWAP[0], CAT_SWAP[1]);
		kd = Math.floor(eased(u, catKeys(P)) + 1e-6);
		const home = span(u, CAT_HOME[0], CAT_HOME[1]);
		if (sw < 1) pic(S.pics[3], I2, [0, 0], 1 - sw);
		discrete(kd, sw * (1 - home));
		if (home > 0) pic(S.pics[0], I2, [0, 0], home);
	}

	// The chalk: the stretched parallelogram, its cuts, the pieces going home.
	if (mode === 'stretch')
		poly(
			CAT_SQ.map(([x, y]) => [L[0] * x + L[1] * y, L[2] * x + L[3] * y]),
			{ color: PAL.chalk, width: 1.8, alpha: 0.9 }
		);
	if (mode === 'cut') {
		poly(CAT_PAR, { color: PAL.chalk, width: 1.8, alpha: 0.9 });
		for (const pc of CAT_PIECES)
			stroke(ctx, [...pc.poly, pc.poly[0]].map(scr), {
				color: PAL.chalk,
				width: 1.6,
				alpha: 0.85,
				upto: p
			});
	}
	if (mode === 'slide')
		CAT_PIECES.forEach((pc, i) => {
			const o = offOf(i);
			poly(
				pc.poly.map((q) => [q[0] + o[0], q[1] + o[1]]),
				{ color: PAL.chalk, width: 1.6, alpha: 0.85 * (1 - span(slid[i], 0.7, 1)) }
			);
		});
	// The eigenlines through the fixed point, while the first stretch runs.
	if (k === 0 && mode === 'stretch') {
		const a = 0.35 * Math.sin(Math.PI * p);
		for (const d of [
			[PHI, 1],
			[-1, PHI]
		])
			stroke(ctx, [scr([-1.2 * d[0], -1.2 * d[1]]), scr([2 * d[0], 2 * d[1]])], {
				color: PAL.chalk,
				width: 1.2,
				alpha: a
			});
	}
	// The square: the torus's own frame, with the arrows of its gluing.
	const fa = smooth(span(u, 0, 0.06));
	stroke(ctx, [...SQ, SQ[0]].map(scr), { color: PAL.chalk, width: 2.2, alpha: 0.95, upto: fa });
	const ar = Math.min(11, Hpx * 0.03);
	const ao = { color: PAL.chalk, width: 2, alpha: 0.9 * span(u, 0.03, 0.07) };
	for (const x of [0, 1]) chevrons(ctx, null, scr([x, 0.5]), [0, -1], [1, 0], ar, 1, ao);
	for (const y of [0, 1]) chevrons(ctx, null, scr([0.5, y]), [1, 0], [0, 1], ar, 2, ao);
	// The fixed point: every corner, one point of the torus.
	lit2(ctx, scr([0, 0]), 4.5, fadeIn);

	// The count: a tick for every turn, to the period.
	const tw = Math.min(0.62 * w, 9 * P);
	const ta = span(u, 0.04, 0.08);
	for (let i = 1; i <= P; i++) {
		const x = w / 2 + tw * ((i - 0.5) / P - 0.5);
		const on = i <= kd;
		const tall = i === P / 2 ? 1.4 : 1;
		if (i === P && on) lit2(ctx, [x, 30], 3, 1);
		else
			stroke(
				ctx,
				[
					[x, 30 - 5 * tall],
					[x, 30 + 5 * tall]
				],
				{ color: PAL.chalk, width: 1.6, alpha: ta * (on ? 0.9 : 0.22) }
			);
	}
}

// ── twist ────────────────────────────────────────────────────────────────────
// Λ = ℤ + τℤ. The basis, in the coordinates of the first one (ω₁, ω₂) = (1, τ):
// e₂ = (t₁, 1) — the first twist, ω₂ ↦ ω₂ + ω₁ — then e₁ = (1, 0) + t₂e₂ — the
// second, ω₁ ↦ ω₁ + ω₂′; integral (a basis of Λ) at t = 0 and t = 1.
const TT = [0.22, 0.95]; // τ
const TW = { R: 1.6, r: 0.72, n: 6 };
const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];
// A line through P along D, clipped to the box [x0, y0, x1, y1].
function clipLine(P, D, [x0, y0, x1, y1]) {
	let t0 = -Infinity;
	let t1 = Infinity;
	for (const [p, d, lo, hi] of [
		[P[0], D[0], x0, x1],
		[P[1], D[1], y0, y1]
	]) {
		if (Math.abs(d) < 1e-12) {
			if (p < lo || p > hi) return null;
			continue;
		}
		let a = (lo - p) / d;
		let b = (hi - p) / d;
		if (a > b) [a, b] = [b, a];
		t0 = Math.max(t0, a);
		t1 = Math.min(t1, b);
	}
	if (!(t0 < t1)) return null;
	return [
		[P[0] + t0 * D[0], P[1] + t0 * D[1]],
		[P[0] + t1 * D[0], P[1] + t1 * D[1]]
	];
}
// An offscreen layer the size of the board, drawn into and then laid on the
// board through a soft round window, so the plane fades out at its edge.
let LAYER = null;
function layerOf(ctx) {
	const W = ctx.canvas.width;
	const H = ctx.canvas.height;
	if (!LAYER || LAYER.width !== W || LAYER.height !== H) {
		LAYER = document.createElement('canvas');
		LAYER.width = W;
		LAYER.height = H;
	}
	const x = LAYER.getContext('2d');
	x.setTransform(1, 0, 0, 1, 0, 0);
	x.globalCompositeOperation = 'source-over';
	x.globalAlpha = 1;
	x.clearRect(0, 0, W, H);
	x.setTransform(ctx.getTransform());
	return x;
}
function layDown(ctx, x, cx, cy, r0, r1) {
	x.save();
	x.setTransform(1, 0, 0, 1, 0, 0);
	const k = ctx.getTransform().a;
	x.globalCompositeOperation = 'destination-in';
	const g = x.createRadialGradient(cx * k, cy * k, r0 * k, cx * k, cy * k, r1 * k);
	g.addColorStop(0, 'rgba(0, 0, 0, 1)');
	g.addColorStop(1, 'rgba(0, 0, 0, 0)');
	x.fillStyle = g;
	x.fillRect(0, 0, LAYER.width, LAYER.height);
	x.restore();
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.drawImage(LAYER, 0, 0);
	ctx.restore();
}

function twist(ctx, w, h, u) {
	const t1 = io(span(u, 0.1, 0.34));
	const t2 = io(span(u, 0.42, 0.66));
	const nu = io(span(u, 0.74, 0.9));
	const e2 = [t1, 1];
	const e1 = [1 + t2 * t1, t2];
	const toC = ([a, b]) => [a + b * TT[0], b * TT[1]];
	// The plane, and at the end z ↦ z/ω₁′ (a similarity) to put ω₁′ at 1.
	const lg = C.log(toC(e1));
	const sim = C.exp([-nu * lg[0], -nu * lg[1]]);
	const Zm = (z) => C.mul(z, sim);
	const z1 = Zm(toC(e1));
	const z2 = Zm(toC(e2));
	const P4 = [[0, 0], z1, C.add(z1, z2), z2];
	const xs = P4.map((q) => q[0]);
	const ys = P4.map((q) => q[1]);
	const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
	const my = (Math.min(...ys) + Math.max(...ys)) / 2;
	const pcx = 0.27 * w;
	const pcy = 0.5 * h;
	const r1 = 0.4 * Math.min(h, 0.5 * w);
	const sc = Math.min(
		0.3 * h,
		(1.2 * r1) / (Math.max(...xs) - Math.min(...xs)),
		(1.2 * r1) / (Math.max(...ys) - Math.min(...ys))
	);
	const toS = (z) => [pcx + sc * (z[0] - mx), pcy - sc * (z[1] - my)];
	const fromS = ([sx, sy]) => [mx + (sx - pcx) / sc, my - (sy - pcy) / sc];
	const box = [pcx - r1, pcy - r1, pcx + r1, pcy + r1];
	const corners = [
		[box[0], box[1]],
		[box[2], box[1]],
		[box[2], box[3]],
		[box[0], box[3]]
	].map(fromS);
	const fin = span(u, 0, 0.08);

	// The plane: the tiling by the current basis (the parallelograms' edges,
	// and the net, four lines a cell), and the lattice — which never moves.
	const L = layerOf(ctx);
	const family = (d, base) => {
		const A = cross2(d, base);
		const cs = corners.map((q) => cross2(d, q) / A);
		const c0 = Math.floor(Math.min(...cs) * TW.n);
		const c1 = Math.ceil(Math.max(...cs) * TW.n);
		for (let i = c0; i <= c1; i++) {
			const s = clipLine(toS(C.scale(base, i / TW.n)), [d[0], -d[1]], box);
			if (!s) continue;
			const bold = i % TW.n === 0;
			stroke(L, s, { color: PAL.chalk, width: bold ? 1.6 : 1, alpha: fin * (bold ? 0.55 : 0.2) });
		}
	};
	family(z1, z2);
	family(z2, z1);
	const ab = corners.map((q) => {
		const z = C.div(q, sim);
		const b = z[1] / TT[1];
		return [z[0] - b * TT[0], b];
	});
	for (
		let n = Math.floor(Math.min(...ab.map((q) => q[1]))) - 1;
		n <= Math.max(...ab.map((q) => q[1])) + 1;
		n++
	)
		for (
			let m = Math.floor(Math.min(...ab.map((q) => q[0]))) - 1;
			m <= Math.max(...ab.map((q) => q[0])) + 1;
			m++
		) {
			const q = toS(Zm(toC([m, n])));
			disc(L, q[0], q[1], 2.8, { fill: PAL.node, alpha: 0.9 * fin });
		}
	layDown(ctx, L, pcx, pcy, 0.62 * r1, r1);
	// The first basis's cell, dashed; the current one, in chalk.
	const P0 = [[0, 0], [1, 0], toC([1, 1]), toC([0, 1])].map((z) => toS(Zm(z)));
	stroke(ctx, [...P0, P0[0]], {
		color: PAL.chalk,
		width: 1.4,
		alpha: 0.45 * span(u, 0.1, 0.16),
		dash: [5, 6]
	});
	const Q = P4.map(toS);
	ctx.save();
	ctx.globalAlpha = 0.07 * fin;
	ctx.fillStyle = PAL.chalk;
	ctx.beginPath();
	Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
	ctx.fill();
	ctx.restore();
	stroke(ctx, [...Q, Q[0]], { color: PAL.chalk, width: 2.4, alpha: 0.95, upto: fin });
	// ω₁′ and ω₂′ from 0, arrowed; τ = ω₂′/ω₁′ (at the end), lit.
	for (const z of [z1, z2]) {
		const a = toS([0, 0]);
		const b = toS(z);
		const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
		const s = 9;
		stroke(
			ctx,
			[
				[b[0] - d[0] * s * 1.6 + d[1] * s * 0.7, b[1] - d[1] * s * 1.6 - d[0] * s * 0.7],
				b,
				[b[0] - d[0] * s * 1.6 - d[1] * s * 0.7, b[1] - d[1] * s * 1.6 + d[0] * s * 0.7]
			],
			{ color: PAL.chalk, width: 2.2, alpha: fin }
		);
	}
	disc(ctx, ...toS([0, 0]), 4, { fill: PAL.chalk, alpha: fin });
	lit2(ctx, toS(z2), 5, fin);

	// The torus, in the first basis's coordinates (a along ω₁ round the hole,
	// b along ω₂ round the tube): the lines of the current basis on it.
	const cam = shiftCam(
		orbit(w, h, {
			target: [0, 0, 0],
			az: spline(u, [
				[0, 1.15],
				[1, 1.85]
			]),
			el: spline(u, [
				[0, 0.72],
				[0.5, 0.6],
				[1, 0.52]
			]),
			dist: spline(u, [
				[0, 11.2],
				[1, 10.4]
			]),
			fov: 34
		}),
		0.25 * w,
		0.02 * h
	);
	const T = (q) => ring(q, TW.R, TW.r);
	zReset(w, h);
	zGrid(cam, patch(T, 0, 1, 0, 1, 72, 28));
	const ref = 10.6;
	const lines = [];
	for (const [d, base, wide] of [
		[e1, e2, 2.6],
		[e2, e1, 2.2]
	])
		for (let i = 0; i < TW.n; i++) {
			const c = i / TW.n;
			const pts = [];
			for (let j = 0; j <= 260; j++) {
				const l = j / 260;
				pts.push(T([c * base[0] + l * d[0], c * base[1] + l * d[1]]));
			}
			lines.push({
				R: runs3(cam, pts),
				o: {
					color: PAL.chalk,
					width: i ? 1.3 : wide,
					alpha: fin * (i ? 0.6 : 0.95),
					ref,
					hid: 0.3
				}
			});
		}
	// The cut each twist is made along, while it is made: the circle b = 0,
	// then the ω₂′-line through 0.
	const cut1 = Math.sin(Math.PI * t1);
	const cut2 = Math.sin(Math.PI * t2);
	if (cut1 > 0.01) {
		const pts = [];
		for (let j = 0; j <= 200; j++) pts.push(T([j / 200, 0]));
		lines.push({
			R: runs3(cam, pts),
			o: { color: PAL.chalk, width: 4, alpha: 0.35 * cut1, ref, glow: 10 }
		});
	}
	if (cut2 > 0.01) {
		const pts = [];
		for (let j = 0; j <= 200; j++) pts.push(T([(j / 200) * e2[0], (j / 200) * e2[1]]));
		lines.push({
			R: runs3(cam, pts),
			o: { color: PAL.chalk, width: 4, alpha: 0.35 * cut2, ref, glow: 10 }
		});
	}
	for (const l of lines) paint(ctx, l.R, l.o, 'back');
	for (const l of lines) paint(ctx, l.R, l.o, 'front');
	// The lattice, on the torus: one point, lit.
	const q0 = cam.project(T([0, 0]));
	lit(ctx, cam, T([0, 0]), 4.5, fin * (zHidden(q0) ? 0.35 : 1));
}

// ── weierstrass ──────────────────────────────────────────────────────────────
// ℘ by its q-series, u = e^{2πiz}, q = e^{2πiτ}:
//   ℘(z) = (2πi)² [1/12 + Σ_{n∈ℤ} qⁿu/(1 − qⁿu)² − 2 Σ_{n≥1} qⁿ/(1 − qⁿ)²].
// With Im τ = 1.05, |q| ≈ 0.0014: twelve terms are exact to double precision
// (it agrees with the lattice sum Σ′ 1/(z − ω)² − 1/ω² to its own truncation).
const WT = [0.3, 1.05]; // τ
const WK = 0.2; // ℘ scaled by this onto the sphere
const WS = {
	R: 1.45,
	r: 0.6,
	c: [0, 0.6, -0.55],
	plate: [0, -1.15, 1.3],
	ps: 1.55,
	rs: 1.3,
	psi: 0.5
};
function wp(a, b) {
	if (Math.abs(a - Math.round(a)) < 1e-9 && Math.abs(b - Math.round(b)) < 1e-9)
		return [Infinity, Infinity];
	const q = C.exp([-TAU * WT[1], TAU * WT[0]]);
	const z = [a + b * WT[0], b * WT[1]];
	const uu = C.exp([-TAU * z[1], TAU * z[0]]);
	const ui = C.div([1, 0], uu);
	const term = (x) => {
		const d = C.sub([1, 0], x);
		return C.div(x, C.mul(d, d));
	};
	let s = C.add(term(uu), [1 / 12, 0]);
	let qn = [1, 0];
	for (let n = 1; n <= 12; n++) {
		qn = C.mul(qn, q);
		s = C.add(s, C.add(term(C.mul(qn, uu)), term(C.mul(qn, ui))));
		s = C.sub(s, C.scale(term(qn), 2));
	}
	return C.scale(s, -TAU * TAU);
}
// The torus point (a, b), and the sphere point ℘(a + bτ)·WK (stereographic,
// ∞ at the top), turned ψ about the vertical.
const wTorus = (q) => ring(q, WS.R, WS.r, WS.c);
function wSphere([a, b]) {
	const [X, Y, Z] = toSphere(C.scale(wp(a, b), WK));
	const c = Math.cos(WS.psi);
	const s = Math.sin(WS.psi);
	return add3(WS.c, mul3([c * X + s * Y, Z, -s * X + c * Y], WS.rs));
}
// The plate: the parallelogram 0, 1, 1 + τ, τ on the ground, centred on
// (1 + τ)/2 (the fourth half-period); its right half turned π about that
// centre by `f` — z ↦ 1 + τ − z at f = 1, which is −z on the torus.
function wPlate([a, b], f) {
	let z = [a + b * WT[0] - (1 + WT[0]) / 2, b * WT[1] - WT[1] / 2];
	if (a > 0.5 + 1e-9 && f > 0) z = C.rot(z, Math.PI * f);
	return [WS.plate[0] + WS.ps * z[0], WS.plate[1], WS.plate[2] - WS.ps * z[1]];
}
// The net, offset half a step so no line runs through a half-period, and the
// four seams through them (a, b ∈ {0, ½}): lines of (a, b), with the sphere
// points of those in the fixed half a ∈ [0, ½] — constant, made once.
let WGEO = null;
function wGeo() {
	if (WGEO) return WGEO;
	const lines = [];
	for (let k = 0; k < 16; k++) {
		const c = (2 * k + 1) / 32;
		lines.push({ ab: seg2([c, 0], [c, 1], 120), seam: false });
		lines.push({ ab: seg2([0, c], [0.5, c], 60), seam: false });
		lines.push({ ab: seg2([0.5, c], [1, c], 60), seam: false });
	}
	for (const c of [0, 0.5]) {
		lines.push({ ab: seg2([c, 0], [c, 1], 160), seam: true });
		lines.push({ ab: seg2([0, c], [0.5, c], 80), seam: true });
		lines.push({ ab: seg2([0.5, c], [1, c], 80), seam: true });
	}
	// The parallelogram's other two edges: a = 1 is a = 0 again on the torus
	// (the near half's own rim); b = 1 is b = 0 again, drawn on the plate only.
	lines.push({ ab: seg2([1, 0], [1, 1], 160), seam: true });
	lines.push({ ab: seg2([0, 1], [0.5, 1], 80), seam: true, plateOnly: true });
	lines.push({ ab: seg2([0.5, 1], [1, 1], 80), seam: true, plateOnly: true });
	for (const L of lines) {
		L.swung = L.ab.every((q) => q[0] >= 0.5 - 1e-9) && L.ab.some((q) => q[0] > 0.5 + 1e-9);
		L.sph = L.swung ? null : L.ab.map(wSphere);
	}
	const gab = [];
	const gsph = [];
	for (let i = 0; i <= 24; i++) {
		const ra = [];
		const rs = [];
		for (let j = 0; j <= 48; j++) {
			const q = [(0.5 * i) / 24, j / 48];
			ra.push(q);
			rs.push(wSphere(q));
		}
		gab.push(ra);
		gsph.push(rs);
	}
	const HP = [
		[0, 0],
		[0.5, 0],
		[0, 0.5],
		[0.5, 0.5]
	].map((q) => ({ ab: q, sph: wSphere(q) }));
	WGEO = { lines, gab, gsph, HP };
	return WGEO;
}

function weierstrass(ctx, w, h, u) {
	const G = wGeo();
	const fin = span(u, 0, 0.08);
	const f = io(span(u, 0.2, 0.46));
	const m = io(span(u, 0.5, 0.78));
	const th = -Math.PI * f; // the near half swings up and over
	const cam = orbit(w, h, {
		target: spline3(u, [
			[0, [0, -0.05, 0.35]],
			[0.5, [0, 0.05, 0.25]],
			[1, [0, 0.15, 0]]
		]),
		az: spline(u, [
			[0, -0.3],
			[0.5, 0.15],
			[1, 0.75]
		]),
		el: spline(u, [
			[0, 0.5],
			[0.5, 0.6],
			[1, 0.5]
		]),
		dist: spline(u, [
			[0, 7.2],
			[0.5, 6.7],
			[1, 6.1]
		]),
		fov: 40
	});
	const ref = 6.6;
	// The surface: the torus with its near half turned th about the axis
	// through the half-periods; then the fixed half, carried to the sphere.
	zReset(w, h);
	if (m > 0) {
		const grid = G.gab.map((row, i) => row.map((q, j) => lerp3(wTorus(q), G.gsph[i][j], m)));
		zGrid(cam, grid);
	} else {
		zGrid(cam, patch(wTorus, 0, 0.5, 0, 1, 36, 40));
		zGrid(
			cam,
			patch((q) => turnAbout(wTorus(q), WS.c, th), 0.5, 1, 0, 1, 36, 40)
		);
	}
	const draw = [];
	for (const L of G.lines) {
		if (L.plateOnly || (m > 0 && L.swung)) continue;
		const pts =
			m > 0
				? L.ab.map((q, i) => lerp3(wTorus(q), L.sph[i], m))
				: L.ab.map((q) => (L.swung ? turnAbout(wTorus(q), WS.c, th) : wTorus(q)));
		draw.push({
			R: runs3(cam, pts),
			o: {
				color: PAL.chalk,
				width: L.seam ? 2.3 : 1.1,
				alpha: fin * (L.seam ? 0.95 : 0.5),
				ref,
				hid: 0.3
			}
		});
	}
	// The plate, under it all: the same lines, the right half turning over.
	for (const L of G.lines) {
		const pts = L.ab.map((q) => wPlate(q, f));
		draw.push({
			R: runs3(cam, pts),
			o: {
				color: PAL.chalk,
				width: L.seam ? 2 : 1,
				alpha: fin * (L.seam ? 0.85 : 0.45),
				ref,
				hid: 0.25
			}
		});
	}
	// The half-turn's axis, through the four half-periods.
	const ax = (1 - span(u, 0.46, 0.54)) * span(u, 0.08, 0.16);
	if (ax > 0) {
		const X = WS.R + WS.r + 0.7;
		const pts = seg2([-X, 0], [X, 0], 120).map(([x]) => [x, WS.c[1], WS.c[2]]);
		draw.push({
			R: runs3(cam, pts),
			o: { color: PAL.chalk, width: 1.4, alpha: 0.6 * ax, ref, hid: 0.4 }
		});
	}
	for (const d of draw) paint(ctx, d.R, d.o, 'back');
	for (const d of draw) paint(ctx, d.R, d.o, 'front');
	// The half-periods, lit: four on the torus (on the axis, so the fold
	// never moves them), and the nine on the plate that are half-periods.
	for (const H of G.HP) {
		const P = m > 0 ? lerp3(wTorus(H.ab), H.sph, m) : wTorus(H.ab);
		const q = cam.project(P);
		lit(ctx, cam, P, 4.5, fin * (zHidden(q) ? 0.4 : 1));
	}
	for (const a of [0, 0.5, 1])
		for (const b of [0, 0.5, 1]) {
			const P = wPlate([a, b], f);
			const q = cam.project(P);
			lit(ctx, cam, P, 3.2, fin * (zHidden(q) ? 0.4 : 0.9));
		}
	if (m > 0.85) limb(ctx, cam, 0.6 * span(m, 0.85, 1), WS.c, WS.rs, PAL.chalk);
}

// ── hopf ─────────────────────────────────────────────────────────────────────
// S³ = {|z₁|² + |z₂|² = 1}, z₁ = cos η e^{iξ₁}, z₂ = sin η e^{iξ₂}; projected
// from (0, 0, 0, 1) to ℝ³ (axis vertical). T_η is the torus of revolution with
// R = sec η, r = tan η; its Hopf circles ξ₁ = θ, ξ₂ = θ + δ are round circles,
// every two linked once. The net lies on T_η with tan η = π/TX: there the
// torus variant's ζ = x + iθ ↦ (ξ₁, ξ₂) = (πx/TX, θ) is a similarity of flat
// tori, and the projection is conformal, so the net meets at its own angles.
const H_NET = Math.atan(Math.PI / TX);
const H_CLIFF = Math.PI / 4;
const H_OUT = 1.08;
const H_RIDE = 0.95; // the lens's own circle: outside the Clifford torus, inside the outer
const H_RD = 0.6;
const H_TH0 = Math.PI / 2 - H_RD; // its outermost point
function hopfP(eta, x1, x2) {
	const c = Math.cos(eta);
	const s = Math.sin(eta);
	const d = Math.max(1e-6, 1 - s * Math.sin(x2));
	return [(c * Math.cos(x1)) / d, (s * Math.cos(x2)) / d, (c * Math.sin(x1)) / d];
}
function fibre(eta, delta, n = 160, upto = 1) {
	const out = [];
	const k = Math.max(2, Math.round(n * clamp01(upto)));
	for (let i = 0; i <= k; i++) {
		const th = (TAU * i) / n;
		out.push(hopfP(eta, th, th + delta));
	}
	return out;
}
const rideAt = (th) => hopfP(H_RIDE, th, th + H_RD);
const H_P0 = rideAt(H_TH0);
const H_N = (() => {
	const a = rideAt(0);
	const n = norm(cross(sub3(rideAt(2.1), a), sub3(rideAt(4.2), a)));
	return n[1] < 0 ? mul3(n, -1) : n;
})();

function hopf(ctx, w, h, u) {
	// The lens: round the nest and in, to the outermost point of its own
	// circle; then along it, through the hole of every torus, chasing a light.
	const ride = span(u, 0.56, 1);
	const th = H_TH0 + 1.15 * Math.PI * (0.3 * ride + 0.7 * ride * ride);
	const az0 = Math.atan2(H_P0[0], H_P0[2]);
	const o = orbitPose({
		target: [0, 0, 0],
		az: spline(u, [
			[0, az0 - 1.5],
			[0.3, az0 - 0.75],
			[0.58, az0]
		]),
		el: spline(u, [
			[0, 0.66],
			[0.3, 0.5],
			[0.58, 0]
		]),
		dist: spline(u, [
			[0, 9.6],
			[0.3, 7.8],
			[0.58, Math.hypot(...H_P0)]
		])
	});
	const wp_ = smooth(span(u, 0.5, 0.6));
	const wt = smooth(span(u, 0.54, 0.7));
	const pos = lerp3(o.pos, rideAt(th), wp_);
	const cam = camera3({
		pos,
		target: lerp3(o.target, lerp3(rideAt(th + 0.55), [0, 0, 0], 0.45), wt),
		up: norm(lerp3(o.up, H_N, wt)),
		fov: lerp(42, 64, smooth(span(u, 0.55, 0.8))),
		w,
		h
	});
	const ref = lerp(9, 2.5, smooth(span(u, 0.3, 0.7)));
	const place = ([x, t]) => hopfP(H_NET, (Math.PI * x) / TX, t);
	zReset(w, h);
	zGrid(
		cam,
		patch(([a, b]) => hopfP(H_NET, TAU * a, TAU * b), 0, 1, 0, 1, 72, 36)
	);

	// The circles: the core (η = 0) and the axis (η = π/2, through ∞), the
	// Clifford torus's, the outer torus's, and the lens's own — each written
	// on in turn.
	const draw = [];
	const add = (pts, wd, a) =>
		a > 0 &&
		draw.push({ R: runs3(cam, pts), o: { color: PAL.chalk, width: wd, alpha: a, ref, hid: 0.3 } });
	const wr = span(u, 0, 0.08);
	add(fibre(0, 0, 160, wr), 2, 0.8);
	const axis = [];
	for (let i = 0; i <= 200; i++) axis.push([0, Math.sinh(lerp(-1, 1, i / 200) * 4), 0]);
	add(axis.slice(0, Math.max(2, Math.round(201 * wr))), 2, 0.8);
	for (let k = 0; k < 12; k++) {
		const a0 = 0.05 + 0.011 * k;
		add(fibre(H_CLIFF, (TAU * k) / 12, 160, span(u, a0, a0 + 0.07)), 1.7, 0.75);
	}
	for (let k = 0; k < 10; k++) {
		const a0 = 0.13 + 0.011 * k;
		add(fibre(H_OUT, (TAU * (k + 0.5)) / 10, 180, span(u, a0, a0 + 0.07)), 1.3, 0.5);
	}
	add(fibre(H_RIDE, H_RD, 200, span(u, 0.24, 0.34)), 2.6, 0.95 - 0.75 * smooth(span(u, 0.5, 0.62)));
	for (const d of draw) paint(ctx, d.R, d.o, 'back');
	// The net, streaming with the zoom, on its torus.
	drawNet(ctx, cam, place, {
		m: 0.1 * u * 12 + 0.2 * u * u * u * 12,
		x0: -TX,
		x1: TX,
		kp: KPT,
		ref,
		alpha: 0.9 * span(u, 0.02, 0.12),
		gold: [],
		node: span(u, 0.04, 0.14),
		cyan: PAL.chalk,
		pink: PAL.chalk,
		cw: 1.9,
		pw: 1.1,
		hid: 0.28
	});
	for (const d of draw) paint(ctx, d.R, d.o, 'front');
	// The light the lens chases, on its circle.
	const lp = rideAt(Math.max(th, H_TH0) + 0.9);
	const ql = cam.project(lp);
	if (ql[2] > NEAR) lit(ctx, cam, lp, 5, span(u, 0.32, 0.38) * (zHidden(ql) ? 0.4 : 1));
}

// ── knot ─────────────────────────────────────────────────────────────────────
// The flat torus [0, 1)², X round the tube and Y round the hole; the line
// (X, Y) = (X₀ + ps, Y₀ + qs), s ∈ [0, 1], slope q/p, closes after p turns
// round the tube and q round the hole: the (p, q) torus knot (T(p, q) ≅
// T(q, p): (3, 2) is the trefoil, (5, 2) the cinquefoil).
const KN = { R: 1.4, r: 0.55, c: [0, 0.6, -1.1], plate: [0, -1.25, 0.95], side: 2.2 };
const KS0 = [0.11, 0.03];
const KNOTS = [
	{ p: 3, q: 2, draw: [0.05, 0.4], on: [0.03, 0.07], off: [0.45, 0.53] },
	{ p: 5, q: 2, draw: [0.5, 0.9], on: [0.5, 0.54], off: [2, 2] }
];
const kTorus = ([X, Y], lift = 0) => {
	const P = ring([Y, X], KN.R, KN.r, KN.c);
	return lift ? add3(P, mul3(ringN([Y, X]), lift)) : P;
};
const kPlate = ([X, Y]) => [
	KN.plate[0] + (X - 0.5) * KN.side,
	KN.plate[1],
	KN.plate[2] - (Y - 0.5) * KN.side
];
// The pen's way along the line: from rest, then steady (s = 1 at the end of
// the draw, and on round the closed knot after).
const pen = (u, [u0, u1]) => {
	const x = (u - u0) / (u1 - u0);
	return x > 0 ? (x - 0.08 * (1 - Math.exp(-x / 0.08))) / 0.92 : 0;
};
// The line from s = 0 to s on the square: cut where it crosses an edge, each
// piece moved back into the square.
function squarePieces(K, s) {
	const cuts = [0, s];
	for (let n = 1; n < K.p * s + KS0[0] + 1; n++) {
		const t = (n - KS0[0]) / K.p;
		if (t > 0 && t < s) cuts.push(t);
	}
	for (let n = 1; n < K.q * s + KS0[1] + 1; n++) {
		const t = (n - KS0[1]) / K.q;
		if (t > 0 && t < s) cuts.push(t);
	}
	cuts.sort((a, b) => a - b);
	const out = [];
	for (let i = 0; i < cuts.length - 1; i++) {
		const [t0, t1] = [cuts[i], cuts[i + 1]];
		if (t1 - t0 < 1e-9) continue;
		const tm = (t0 + t1) / 2;
		const fx = Math.floor(KS0[0] + K.p * tm);
		const fy = Math.floor(KS0[1] + K.q * tm);
		out.push(
			seg2(
				[KS0[0] + K.p * t0 - fx, KS0[1] + K.q * t0 - fy],
				[KS0[0] + K.p * t1 - fx, KS0[1] + K.q * t1 - fy],
				16
			)
		);
	}
	return out;
}

function knot(ctx, w, h, u, secs) {
	const cam = orbit(w, h, {
		target: spline3(u, [
			[0, [0, -0.3, 0]],
			[1, [0, -0.2, -0.15]]
		]),
		az: spline(u, [
			[0, -0.35],
			[0.5, 0.1],
			[1, 0.45]
		]),
		el: spline(u, [
			[0, 0.5],
			[0.5, 0.62],
			[1, 0.9]
		]),
		dist: spline(u, [
			[0, 9.4],
			[1, 8.6]
		]),
		fov: 40
	});
	const ref = 8.8;
	const fin = span(u, 0, 0.06);
	zReset(w, h);
	zGrid(
		cam,
		patch((q) => kTorus([q[1], q[0]]), 0, 1, 0, 1, 72, 30)
	);

	const draw = [];
	const add = (pts, o) =>
		draw.push({ R: runs3(cam, pts), o: { color: PAL.chalk, ref, hid: 0.3, ...o } });
	// The flat torus on the ground, with the arrows of its gluing, and the
	// faint net it shares with the torus: meridians Y = k/12, longitudes X = k/6.
	for (let k = 1; k < 12; k++) {
		add(seg2([0, k / 12], [1, k / 12], 12).map(kPlate), { width: 1, alpha: 0.22 * fin });
		add(
			seg2([0, k / 12], [1, k / 12], 90).map((q) => kTorus(q)),
			{ width: 1, alpha: 0.3 * fin }
		);
	}
	for (let k = 1; k <= 6; k++) {
		if (k < 6) add(seg2([k / 6, 0], [k / 6, 1], 12).map(kPlate), { width: 1, alpha: 0.22 * fin });
		add(
			seg2([k / 6, 0], [k / 6, 1], 120).map((q) => kTorus(q)),
			{ width: 1, alpha: 0.3 * fin }
		);
	}
	const SQ = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
		[0, 0]
	];
	add(SQ.map(kPlate), { width: 2.2, alpha: 0.95 * fin });
	// The knots, drawing themselves on both.
	const pens = [];
	for (const K of KNOTS) {
		const s = pen(u, K.draw);
		const a = 1 - span(u, K.off[0], K.off[1]);
		if (s <= 0 || a <= 0) continue;
		const sd = Math.min(1, s);
		const n = Math.max(2, Math.ceil(sd * (K.p + K.q) * 80));
		const pts = [];
		for (let i = 0; i <= n; i++) {
			const t = (sd * i) / n;
			pts.push(kTorus([KS0[0] + K.p * t, KS0[1] + K.q * t]));
		}
		add(pts, { width: 2.8, alpha: 0.98 * a });
		for (const P of squarePieces(K, sd)) add(P.map(kPlate), { width: 2.4, alpha: 0.95 * a });
		pens.push({ K, s, a: span(u, K.on[0], K.on[1]) * a });
	}
	for (const d of draw) paint(ctx, d.R, d.o, 'back');
	for (const d of draw) paint(ctx, d.R, d.o, 'front');
	// The arrows of the gluing: one on the sides, two on the top and bottom.
	const ao = { color: PAL.chalk, width: 2, alpha: 0.9 * fin, ref };
	const ex = [1, 0, 0];
	const ey = [0, 0, -1];
	for (const X of [0, 1]) chevrons(ctx, cam, kPlate([X, 0.5]), ey, ex, 0.08, 1, ao);
	for (const Y of [0, 1]) chevrons(ctx, cam, kPlate([0.5, Y]), ex, ey, 0.08, 2, ao);
	// The pen: the swimmer on the torus, a lit point on the square.
	for (const { K, s, a } of pens) {
		if (a <= 0) continue;
		const path = (v) => kTorus([KS0[0] + K.p * 2 * v, KS0[1] + K.q * 2 * v], 0.14);
		drawHelix(ctx, cam, poseOn(path, s / 2, secs * 2.6 * Math.PI, 0.2), {
			alpha: a,
			width: 2.2,
			core: 0.9,
			glow: 0.5,
			depth: { hidden: zHidden }
		});
		const X = KS0[0] + K.p * s;
		const Y = KS0[1] + K.q * s;
		lit(ctx, cam, kPlate([X - Math.floor(X), Y - Math.floor(Y)]), 4.5, a);
	}
}
