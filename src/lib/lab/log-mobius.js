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
	easeInOutCubic
} from './log/board.js';

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
// The end of every variant is the same shot: the lens square to the surface
// over a gold disc with a cream core, about a third of the frame across.
// Every frame is a pure function of progress: ?at= pins it exactly.

const SECONDS = 10;
const K = GOLDEN_K; // the cyan family's rate: golden loxodromes
const KP = 0.9; // the pink family's pitch, the other way
const N = 8; // arms in each family
const RING = TAU / (N * (1 / K + 1 / KP)); // node spacing along an arm, in log|z|
const NEAR = 0.05;

const io = (t) => easeInOutCubic(clamp01(t));
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export default async function make({ at }) {
	const v = variant(['sphere', 'torus', 'flip']);
	const b = getBoard();
	const time = clock(SECONDS, at);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		if (v === 'sphere') sphere(ctx, w, h, u);
		else if (v === 'torus') torus(ctx, w, h, u);
		else flip(ctx, w, h, u);
		tag(ctx, w, h, `log-mobius · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
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
		hid = 0.32
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
			color: PAL.pink,
			width: 2.2
		});
		const isGold = gold.includes(j) && goldAlpha > 0;
		let gz = cz;
		if (isGold && goldUpto) gz = cz.slice(0, Math.max(2, Math.round(cz.length * goldUpto(j))));
		lines.push({
			R: runs3(cam, cz.map(place), { fade: cf, hidden }),
			color: PAL.cyan,
			width: 2.2,
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
function limb(ctx, cam, a, centre = [0, 0, 0]) {
	if (a <= 0) return;
	const c = sub3(cam.pos, centre);
	const d = Math.hypot(...c);
	if (d <= 1.02) return;
	const n = mul3(c, 1 / d);
	const e1 = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
	const e2 = cross(n, e1);
	const pts = circle3(add3(centre, mul3(n, 1 / d)), e1, e2, Math.sqrt(1 - 1 / (d * d)), 180);
	const Q = pts.map((p) => cam.project(p));
	if (Q.some((q) => q[2] <= NEAR)) return;
	ctx.save();
	ctx.globalAlpha = 0.05 * a;
	ctx.fillStyle = PAL.chalk;
	ctx.beginPath();
	Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
	ctx.fill();
	ctx.restore();
	stroke(ctx, Q, { color: PAL.rose, width: 2, alpha: 0.75 * a });
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
