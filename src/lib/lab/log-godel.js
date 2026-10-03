import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	math,
	PAL,
	TAU,
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
	MATH_FONT
} from './log/board.js';
import { orbit, line3, lit3, label3, NEAR } from './log/space.js';
import { lecture, lit, glow, impact } from './log/ink.js';
import { drawSperm } from './log/sperm.js';

// ── Sketch: log-godel — Einstein meets Gödel ─────────────────────────────────
// In 1949, for Einstein's seventieth birthday, Gödel gave him a solution of
// his own field equations: a universe of dust, rotating, in which time closes
// up — through every event there run closed timelike curves, worldlines that
// come back to their own past. Closed in time, open in space: a clopen
// spacetime. The sketch draws it the way Hawking & Ellis do (fig. 31), in
// Gödel's own cylindrical coordinates (y suppressed):
//
//     ds² = 4a²[dt² − dr² − dy² + (sinh⁴r − sinh²r) dφ² + 2√2 sinh²r dφ dt]
//
// Completing the square, τ = dt + √2 sinh²r dφ, X = sinh r cosh r dφ, Y = dr
// gives ds² = 4a²[τ² − X² − Y²]: at every point the light cone is a round 45°
// cone in (τ, X, Y), and in the chart's own (t, X, Y) it is that cone leaned
// over in the +φ direction by k = √2 tanh r — dt = τ − kX. The circle of
// constant t, r, y has ds² = 4a² sinh²r (sinh²r − 1) dφ²: null where sinh r
// = 1 (r = ln(1 + √2), k = 1, the cone's edge horizontal) and TIMELIKE
// beyond, where the cone's edge dips under the plane: going round the axis
// is then a way into one's own past. Every frame is a pure function of its
// progress; the 3D is projected by hand (space.js's orbit), hidden lines
// faint and dashed; the lens only gathers pace (retime). One per ?v=:
//
//   cones    (default) Hawking & Ellis's picture. t up, the disc of space, and
//            the light cones on a polar lattice, written on from the axis
//            outward: each the true cone of the metric at its point, opening
//            and leaning over in φ as r grows — cyan inside, GOLD on the
//            critical circle sinh r = 1, where they touch the plane, pink
//            beyond, where they dip below it. A circle beyond the critical
//            one is then timelike: a bead goes round it at constant t, back
//            to the event it left. The lens orbits, then dives at the lit
//            event on the axis: the moment, the way on.
//   loop     the moment, revisited. The event at the axis is lit; the
//            swimmer's worldline climbs out of it, spirals out past the
//            critical circle, turns DOWN in t as the cones there allow, comes
//            round and back in — and arrives at the event it left, from its
//            own future. Its tangent is checked against the metric at every
//            point (timelike, future-pointing, by a margin): a closed timelike
//            curve, r = R sin-bump(s), φ = 2.5π s, t = 1.5 sin 2πs + 0.3 sin
//            4πs. The cone at each step is left behind on the line, so the
//            line is seen to thread every one of them.
//   chart    Gödel's universe from above, as a coordinate chart: the (r, φ)
//            disc, each cone drawn by its CUT at t + δ — an ELLIPSE where
//            k < 1, growing and sliding φ-ward; a PARABOLA on the critical
//            circle; a HYPERBOLA beyond, open toward +φ, since a surface of
//            constant t there is no longer spacelike. The lens zooms out
//            (closed in time, open in space), then another point P is lit and
//            the chart about P written on as this one fades — the same chart,
//            since Gödel's universe is homogeneous: every point is its
//            centre — and the lens dives at P.
//   sentence Gödel's other gift: a sentence that speaks of itself, as a
//            Droste. G ⟺ ¬Prov(⌜G⌝) — ⌜G⌝, the Gödel number of G, drawn as
//            the box the corner quotes make, and in it G again, smaller, with
//            its own box … The lens zooms into the box forever (a log zoom;
//            the picture is self-similar, so every level is the same frame),
//            with the numbering on the board: ⌜0 = 0⌝ = 2⁶·3⁵·5⁶ = 243 000 000
//            in Nagel & Newman's code, and the birthday 14·02·1987 on the
//            first eight primes (digit d as the exponent d + 1). The limit
//            point of the boxes is lit: the way on.
//
// 11–12 seconds each. Under 10 ms a frame headless at 1280 × 800 (chart’s
// zoom-out, 1261 cells, the heaviest).

const LENGTH = { cones: 11, loop: 12, chart: 11, sentence: 11 };

// ── The metric ───────────────────────────────────────────────────────────────
// Units of 2a (so 4a² = 1). r_c = arsinh 1 = ln(1 + √2): the critical circle.
const RC = Math.asinh(1);
const tiltOf = (r) => Math.SQRT2 * Math.tanh(r);
// The chart as a picture: (t, r, φ) ↦ x = r cos φ, y = t (up), z = r sin φ.
const world = (t, r, phi) => [r * Math.cos(phi), t, r * Math.sin(phi)];
const Y_UP = [0, 1, 0];

// Is (dt, dr, dφ) at radius r timelike and future-pointing? Returns
// ds²/(|dt|² + |dr|² + |X|²): positive inside the cone, by that margin.
function margin(r, dt, dr, dp) {
	const S = Math.sinh(r);
	const C = Math.cosh(r);
	const tau = dt + Math.SQRT2 * S * S * dp;
	const X = S * C * dp;
	const q = tau * tau - X * X - dr * dr;
	return tau > 0 ? q / (dt * dt + dr * dr + X * X) : -1;
}

// ── The cones ────────────────────────────────────────────────────────────────
// The future light cone at (t, r, φ), drawn the way Hawking & Ellis draw it:
// about its own axis. In the chart's frame (T = dt up, X along φ̂, Y along
// r̂) the null cone is (T + kX)² = X² + Y², k = √2 tanh r — the quadratic form
// with matrix [[1, k], [k, k² − 1]] on (T, X) and −1 on Y. Its axis is the
// eigenvector of the positive eigenvalue λ₊ = (k² + √(k⁴ + 4))/2, leaning
// toward +φ by X/T = (λ₊ − 1)/k: upright at the axis, 31.7° at the critical
// circle, 45° at most; and about that axis it is an elliptic cone, its rim
// at unit height the ellipse with semi-axes √(λ₊/|λ₋|) in the lean's plane
// and √λ₊ across — 45° at the axis, opening out as it leans. At k = 1 its
// low edge is exactly horizontal; beyond, it dips under the plane.
function coneAt(t, r, phi, eps) {
	const k = tiltOf(r);
	const rh = [Math.cos(phi), 0, Math.sin(phi)];
	const ph = [-Math.sin(phi), 0, Math.cos(phi)];
	const V = world(t, r, phi);
	const root = Math.sqrt(k * k * k * k + 4);
	const lp = (k * k + root) / 2;
	const lm = (k * k - root) / 2;
	const lean = k > 1e-9 ? (lp - 1) / k : 0; // X per T along the axis
	const ax = norm(add3(Y_UP, mul3(ph, lean)));
	const t1 = norm(sub3(ph, mul3(Y_UP, lean))); // across the axis, in the lean's plane
	const e1 = mul3(t1, Math.sqrt(lp / -lm));
	const e2 = mul3(rh, Math.sqrt(lp));
	const centre = add3(V, mul3(ax, eps));
	return { V, ax, e1, e2, centre, nc: ax, eps, k, r };
}
// Colour by lean: cyan inside the circle, gold on it, pink beyond.
function coneColor(k) {
	if (k < 0.9) return PAL.cyan;
	if (k < 1.08) return PAL.gold;
	return PAL.pink;
}
const RIM_N = 30;
// Draw a cone: its rim (visible runs solid, the rest faint and dashed: a rim
// point is hidden when neither the cap nor the cone's side at it faces the
// lens), its two silhouette generators, a faint fill. `upto` writes the rim
// on; `ref` the depth at which `width` is drawn.
function drawCone(ctx, cam, cone, { alpha = 1, upto = 1, color, width = 1.6, ref = 0, fill = 1 }) {
	if (alpha <= 0.004 || upto <= 0) return;
	const { V, ax, e1, e2, centre, nc, eps } = cone;
	const L = cam.pos;
	const v = cam.project(V);
	if (v[2] <= NEAR) return;
	const n = Math.max(2, Math.round(RIM_N * clamp01(upto)));
	const Q = [];
	const vis = [];
	for (let i = 0; i <= n; i++) {
		const ps = (TAU * i) / RIM_N;
		const c = Math.cos(ps);
		const s = Math.sin(ps);
		const P = add3(V, mul3(add3(add3(mul3(e1, c), mul3(e2, s)), ax), eps));
		const q = cam.project(P);
		if (q[2] <= NEAR) return;
		Q.push(q);
		const toL = sub3(L, P);
		let hid = dot(nc, toL) <= 0;
		if (hid) {
			const g = sub3(P, V);
			const T = add3(mul3(e1, -s), mul3(e2, c));
			let nl = cross(g, T);
			if (dot(nl, sub3(P, centre)) < 0) nl = mul3(nl, -1);
			hid = dot(nl, toL) <= 0;
		}
		vis.push(!hid);
	}
	const wd = width * (ref ? Math.min(2.4, Math.max(0.5, ref / v[2])) : 1);
	const col = color ?? coneColor(cone.k);
	// The silhouette: the rim points where the tangent from the vertex
	// touches it (the sign of the turn about v changes), if v is outside.
	let a = -1;
	let b = -1;
	if (upto >= 1) {
		const side = (i) => {
			const p = Q[i];
			const q = Q[(i + 1) % RIM_N];
			return (q[0] - p[0]) * (v[1] - p[1]) - (q[1] - p[1]) * (v[0] - p[0]) > 0;
		};
		let s0 = side(RIM_N - 1);
		for (let i = 0; i < RIM_N; i++) {
			const s1 = side(i);
			if (s1 !== s0) {
				if (a < 0) a = i;
				else b = i;
			}
			s0 = s1;
		}
	}
	ctx.save();
	// The body: the cap, and the hull from the vertex round the far arc.
	if (fill > 0 && upto >= 1) {
		ctx.globalAlpha = alpha * 0.06 * fill;
		ctx.fillStyle = col;
		ctx.beginPath();
		ctx.moveTo(Q[0][0], Q[0][1]);
		for (let i = 1; i < RIM_N; i++) ctx.lineTo(Q[i][0], Q[i][1]);
		ctx.closePath();
		ctx.fill();
		if (a >= 0 && b >= 0) {
			// the arc from a to b that holds the rim point farthest from v
			let far = 0;
			let fd = -1;
			for (let i = 0; i < RIM_N; i++) {
				const d = Math.hypot(Q[i][0] - v[0], Q[i][1] - v[1]);
				if (d > fd) {
					fd = d;
					far = i;
				}
			}
			const inArc = far >= a && far <= b;
			ctx.globalAlpha = alpha * 0.15 * fill;
			ctx.beginPath();
			ctx.moveTo(v[0], v[1]);
			if (inArc) for (let i = a; i <= b; i++) ctx.lineTo(Q[i][0], Q[i][1]);
			else {
				for (let i = b; i < RIM_N; i++) ctx.lineTo(Q[i][0], Q[i][1]);
				for (let i = 0; i <= a; i++) ctx.lineTo(Q[i][0], Q[i][1]);
			}
			ctx.closePath();
			ctx.fill();
		}
	}
	ctx.restore();
	// The rim, in runs by visibility.
	let run = [Q[0]];
	let back = !vis[0];
	const flush = () => {
		if (run.length > 1)
			stroke(
				ctx,
				run,
				back
					? { color: col, width: Math.max(0.8, wd * 0.62), alpha: alpha * 0.32, dash: [3, 5] }
					: { color: col, width: wd, alpha }
			);
	};
	for (let i = 1; i <= n; i++) {
		const bk = !vis[i];
		if (bk !== back) {
			run.push(Q[i]);
			flush();
			run = [Q[i]];
			back = bk;
		} else run.push(Q[i]);
	}
	flush();
	if (a >= 0 && b >= 0) {
		stroke(ctx, [v, Q[a]], { color: col, width: wd * 0.9, alpha: alpha * 0.9 });
		stroke(ctx, [v, Q[b]], { color: col, width: wd * 0.9, alpha: alpha * 0.9 });
	}
}

// The polar lattice the cones sit on: rings at k · r_c/2 (so the critical
// circle is ring 2), 6k cones round ring k, staggered.
function lattice(rings, step = RC / 2) {
	const out = [];
	for (let k = 0; k <= rings; k++) {
		const n = k ? 6 * k : 1;
		for (let j = 0; j < n; j++)
			out.push({
				k,
				j,
				n,
				r: k * step,
				phi: k ? (TAU * j) / n + (k % 2 ? Math.PI / n : 0) : 0
			});
	}
	return out;
}

// ── The disc of space, t up ──────────────────────────────────────────────────
function discGrid(ctx, cam, a, { ref, rMax = 2.2, upto = 1 }) {
	if (a <= 0) return;
	for (let k = 1; k * RC * 0.5 <= rMax + 1e-9; k++) {
		if (k === 2) continue; // the critical circle is drawn gold, on its own
		const r = (k * RC) / 2;
		const pts = [];
		for (let i = 0; i <= 96; i++) pts.push(world(0, r, (TAU * i) / 96));
		line3(
			ctx,
			cam,
			pts,
			{ color: PAL.rose, width: 1.2, alpha: 0.3 * a, ref },
			{ fade: upto < 1 ? (p, i) => (i / 96 < upto ? 1 : 0) : null }
		);
	}
	for (let j = 0; j < 12; j++) {
		const ph = (TAU * j) / 12;
		line3(ctx, cam, [world(0, 0.12, ph), world(0, rMax * upto, ph)], {
			color: PAL.rose,
			width: 1,
			alpha: 0.2 * a,
			ref
		});
	}
}
function tAxis(ctx, cam, a, { ref, top = 2.3 }) {
	if (a <= 0) return;
	line3(ctx, cam, [world(-0.35, 0, 0), world(top, 0, 0)], {
		color: PAL.chalk,
		width: 1.6,
		alpha: 0.6 * a,
		ref
	});
	label3(ctx, cam, world(top, 0, 0), 't', { dx: 10, dy: -6, size: 24, alpha: 0.85 * a });
}
function critical(ctx, cam, a, { ref, upto = 1, label = 1 }) {
	if (a <= 0 || upto <= 0) return;
	const pts = [];
	for (let i = 0; i <= 160; i++) pts.push(world(0, RC, (TAU * i) / 160));
	line3(
		ctx,
		cam,
		pts,
		{ color: PAL.gold, width: 2.6, alpha: 0.9 * a, glow: 6, ref },
		{ fade: upto < 1 ? (p, i) => (i / 160 < upto ? 1 : 0) : null }
	);
	if (label > 0)
		label3(ctx, cam, world(0, RC, -0.55), 'sinh r = 1', {
			dx: 12,
			dy: 20,
			size: 22,
			alpha: 0.9 * a * label,
			color: PAL.gold
		});
}

// The way on: a gold disc with a cream core and a bloom, `g` 0..1 how far
// it has come up.
function portal(ctx, x, y, r, g) {
	if (r <= 0) return;
	glow(ctx, x, y, r * (2.2 + 1.6 * g), [255, 214, 140], 0.28 + 0.22 * g);
	disc(ctx, x, y, r, { fill: PAL.gold, alpha: 0.97 });
	disc(ctx, x, y, r * 0.58, { fill: '#fff6e0', alpha: lerp(0.5, 1, g) });
}

// ── The lens, retimed to only gather pace ────────────────────────────────────
// A path pose(s), s in 0..1, and its pace between two poses; the path is
// re-timed so the pace never drops (the running maximum is the pace kept),
// as log-closure does it. Returns u ↦ pose.
function retime(pose, paceOf, M = 400) {
	const len = [0];
	const pace = [];
	let a = pose(0);
	for (let i = 1; i <= M; i++) {
		const b = pose(i / M);
		const step = paceOf(a, b);
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
const orbitPace = (a, b) => {
	const d = (p) => {
		const ce = Math.cos(p.el);
		return [Math.sin(p.az) * ce, Math.sin(p.el), Math.cos(p.az) * ce];
	};
	return (
		Math.hypot(...sub3(d(a), d(b))) +
		Math.abs(Math.log(b.dist / a.dist)) +
		Math.hypot(...sub3(a.target, b.target)) / ((a.dist + b.dist) / 2)
	);
};

// ── Captions ─────────────────────────────────────────────────────────────────
// Lines in slots top left: [slot, text, write from, to, rub out from, to].
function captions(ctx, w, h, u, list, size = null) {
	const slots = [];
	for (const [i, s, a, b, c = 9, d = 9] of list) {
		const p = span(u, a, b);
		const al = 1 - span(u, c, d);
		if (p <= 0 || al <= 0) continue;
		slots[i] = [s, p, al];
	}
	const lines = [];
	for (let i = 0; i < slots.length; i++) lines.push(slots[i] ?? ['', 0]);
	if (lines.some(([, p]) => p > 0)) lecture(ctx, w, h, lines, { size });
}

const METRIC =
	'ds^{2} = 4a^{2}[dt^{2} − dr^{2} − dy^{2} + (sinh^{4}r − sinh^{2}r) dφ^{2} + 2√2 sinh^{2}r dφ dt]';

export default async function make({ at }) {
	const v = variant(['cones', 'loop', 'chart', 'sentence']);
	const SECONDS = LENGTH[v];
	const b = getBoard();
	const time = clock(SECONDS, at);
	const st = { lens: null, cells: null };
	if (v === 'cones') st.lens = retime(conesPose, orbitPace);
	if (v === 'loop') st.lens = retime(loopPose, orbitPace);
	if (v === 'chart') st.lens = retime(chartPose, chartPace);
	const draw = { cones, loop, chart, sentence }[v];

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, st);
		tag(ctx, w, h, `log-godel · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── cones: Hawking & Ellis's picture ─────────────────────────────────────────
const FOV = 38;
const CONES = lattice(4);
const EPS = 0.1;
// The lens: a slow orbit, lowering to see the lean, then the dive at the
// event on the axis.
function conesPose(s) {
	const dv = span(s, 0.72, 1);
	const dd = smooth(dv);
	return {
		target: [0, lerp(0.3, 0, dd), 0],
		az: 0.5 + 1.5 * s * s,
		el: lerp(0.5, 0.26, smooth(s)) + 0.16 * dd,
		dist: 6.2 * Math.exp(-1.65 * dv * dv),
		fov: FOV
	};
}
function cones(ctx, w, h, u, st) {
	const H = Math.min(w, h);
	const pose = st.lens(u);
	const cam = orbit(w, h, pose);
	const ref = pose.dist; // lines drawn at their width at the target
	const o = { ref };

	// The disc and the axis, written on first; the event lit at the centre.
	const g = span(u, 0.0, 0.1);
	discGrid(ctx, cam, 1, { ...o, upto: smooth(g) });
	tAxis(ctx, cam, span(u, 0.04, 0.12), { ...o, top: 1.8 });

	// The cones, ring by ring from the axis out, each written on in a tenth.
	const born = (c) => 0.08 + 0.4 * (c.k / 4) + 0.05 * (c.j / c.n);
	for (const c of CONES) {
		const p = span(u, born(c), born(c) + 0.05);
		if (p <= 0) continue;
		drawCone(ctx, cam, coneAt(0, c.r, c.phi, EPS), {
			alpha: lerp(0.55, 0.92, p),
			upto: p,
			width: 1.5,
			ref,
			fill: smooth(span(p, 0.6, 1))
		});
	}
	// The critical circle, gold, as its ring of cones comes.
	critical(ctx, cam, 1, { ...o, upto: smooth(span(u, 0.24, 0.34)), label: span(u, 0.3, 0.36) });

	// Beyond it a circle is timelike: a bead goes round ring 3 at constant t,
	// its trail gold, back to the event it left.
	const bead = span(u, 0.58, 0.86);
	if (bead > 0) {
		const r3 = 1.5 * RC;
		const ph0 = Math.PI / 18;
		const sweep = TAU * Math.pow(bead, 1.6);
		const pts = [];
		const n = 120;
		for (let i = 0; i <= n; i++) pts.push(world(0, r3, ph0 + (sweep * i) / n));
		line3(ctx, cam, pts, { color: PAL.gold, width: 2.8, alpha: 0.95, glow: 8, ref });
		lit3(ctx, cam, world(0, r3, ph0), 4, 0.9);
		const tip = world(0, r3, ph0 + sweep);
		lit3(ctx, cam, tip, 6, 1);
	}

	captions(
		ctx,
		w,
		h,
		u,
		[
			[0, METRIC, 0.1, 0.22],
			[1, 'sinh r = 1,  r = ln(1 + √2) :  a circle of light', 0.3, 0.37],
			[2, 'beyond it the cones dip under t :  time closes up', 0.6, 0.68]
		],
		Math.round(Math.max(17, H * 0.028))
	);

	// The event on the axis, lit; the lens dives at it and it becomes the
	// way on.
	const q = cam.project([0, 0, 0]);
	if (q[2] > NEAR) {
		const pr = smooth(span(u, 0.84, 1));
		const r0 = 5 + 4 * (1 - span(u, 0, 0.06));
		lit3(ctx, cam, [0, 0, 0], lerp(r0, 2, pr), 1 - pr);
		if (pr > 0) portal(ctx, q[0], q[1], lerp(6, h / 6, pr), pr);
	}
}

// ── loop: a worldline that meets its own past ────────────────────────────────
// The closed timelike curve, [t, r, φ] at s in 0..1: out of the event on a
// smooth bump in r, round 2.5π in φ, up then down then up again in t —
// checked timelike and future-pointing throughout (margin ≥ 0.2 at the
// parameters below; see margin()).
const LOOP = { R: 1.5, A: 1.5, B: 0.3, PHI: 2.5 * Math.PI, a0: 0.25 };
function loopAt(s) {
	const { R, A, B, PHI, a0 } = LOOP;
	return [
		A * Math.sin(TAU * s) + B * Math.sin(2 * TAU * s),
		R * smooth(s / a0) * smooth((1 - s) / a0),
		PHI * s
	];
}
const LOOP_N = 480;
const LOOP_PTS = [];
for (let i = 0; i <= LOOP_N; i++) LOOP_PTS.push(world(...loopAt(i / LOOP_N)));
// Its least margin inside the cone, over the whole loop (about 0.22).
export const LOOP_MARGIN = (() => {
	let m = Infinity;
	for (let i = 1; i < 1000; i++) {
		const s = i / 1000;
		const p = loopAt(s - 1e-5);
		const q = loopAt(s + 1e-5);
		const r = loopAt(s)[1];
		m = Math.min(m, margin(r, (q[0] - p[0]) / 2e-5, (q[1] - p[1]) / 2e-5, (q[2] - p[2]) / 2e-5));
	}
	return m;
})();
// The progress along the loop: it only gathers pace.
const loopS = (u) => Math.pow(clamp01(u / 0.95), 1.55);
// Cones left on the line: at these s.
const LOOP_CONES = [];
for (let i = 0; i < 18; i++) {
	const s = (i + 0.5) / 18;
	const [t, r, phi] = loopAt(s);
	LOOP_CONES.push({ s, cone: coneAt(t, r, phi, 0.09) });
}
function loopPose(s) {
	const dv = span(s, 0.84, 1);
	const dd = smooth(dv);
	return {
		target: [0, lerp(0.1, 0, dd), 0],
		az: 0.3 + 2.2 * s * s,
		el: lerp(0.4, 0.24, smooth(s)) + 0.1 * dd,
		dist: 8 * Math.exp(-2.1 * dv * dv),
		fov: FOV
	};
}
function loop(ctx, w, h, u, st) {
	const H = Math.min(w, h);
	const pose = st.lens(u);
	const cam = orbit(w, h, pose);
	const ref = pose.dist;
	const o = { ref };
	const s = loopS(u);

	discGrid(ctx, cam, 0.7, { ...o, rMax: 2.2, upto: smooth(span(u, 0, 0.08)) });
	tAxis(ctx, cam, span(u, 0.02, 0.1), { ...o, top: 2 });
	critical(ctx, cam, 0.8, { ...o, upto: smooth(span(u, 0.04, 0.14)), label: span(u, 0.1, 0.16) });

	// The cones the line leaves behind, where it has been.
	for (const c of LOOP_CONES) {
		const p = span(s, c.s, c.s + 0.04);
		if (p <= 0) continue;
		drawCone(ctx, cam, c.cone, { alpha: 0.85 * p, upto: p, width: 1.4, ref, fill: p });
	}

	// The worldline, written on from the event; the swimmer at its tip.
	const n = Math.max(1, Math.round(s * LOOP_N));
	if (s > 0.002) {
		const pts = LOOP_PTS.slice(0, n + 1);
		line3(ctx, cam, pts, { color: PAL.gold, width: 3, alpha: 0.95, glow: 7, ref });
		// its start, back in the past, faintly marked
		const tip = cam.project(LOOP_PTS[n]);
		const back = cam.project(LOOP_PTS[Math.max(0, n - 6)]);
		if (tip[2] > NEAR && back[2] > NEAR && s < 0.995) {
			const size = ((0.085 * H * ref) / tip[2]) * lerp(0.6, 1, span(s, 0, 0.1));
			swimmer(ctx, w, h, {
				pole: tip,
				toward: [2 * tip[0] - back[0], 2 * tip[1] - back[1]],
				size,
				phase: u * 7
			});
		}
	}

	captions(
		ctx,
		w,
		h,
		u,
		[
			[0, 'a worldline out of the event, inside its cone:  dt > |dr|', 0.06, 0.14, 0.42, 0.46],
			[1, 'past sinh r = 1 the cone leans under t:  it can turn down', 0.3, 0.4, 0.62, 0.66],
			[0, 'a closed timelike curve', 0.5, 0.56],
			[1, 'a worldline that meets its own past', 0.7, 0.78]
		],
		Math.round(Math.max(17, H * 0.028))
	);

	// The event: lit, flashing as the line arrives, and the way on.
	const q = cam.project([0, 0, 0]);
	if (q[2] > NEAR) {
		const pr = smooth(span(u, 0.9, 1));
		lit3(ctx, cam, [0, 0, 0], lerp(6, 2, pr), 1 - pr);
		impact(ctx, w, h, q[0], q[1], H * 0.4, u, 0.955, 0.5, true);
		if (pr > 0) portal(ctx, q[0], q[1], lerp(6, h / 6, pr), pr);
	}
}
// The swimmer at a screen point, heading for `toward` (screen px).
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP = FROM + LEN;
function swimmer(ctx, w, h, { pole, toward, size, phase }) {
	const pv = makeView({ w, h, scale: 1, cx: 0, cy: 0 });
	const P = [pole[0], -pole[1]];
	const T = [toward[0], -toward[1]];
	const dir = Math.atan2(P[1] - T[1], P[0] - T[0]);
	const K = (2 * Math.log((1 + Math.sqrt(5)) / 2)) / Math.PI;
	const o = {
		pole: P,
		scale: size / Math.exp(K * TIP),
		turn: dir - TIP + 0.3,
		from: FROM,
		length: LEN,
		width: Math.max(1.2, size * 0.03),
		tip: Math.max(0.8, size * 0.008),
		wiggle: 0.13,
		phase
	};
	const pad = Math.max(2, size * 0.022);
	drawSperm(ctx, pv, { ...o, color: PAL.ground, width: o.width + pad * 2, tip: o.tip + pad * 2 });
	drawSperm(ctx, pv, o);
}

// ── chart: the universe from above ───────────────────────────────────────────
// Each cone by its cut at t + δ, in the cone's own (X, Y) at its point:
// (δ + kX)² = X² + Y² — an ellipse for k < 1, a parabola at k = 1, the +X
// branch of a hyperbola for k > 1 (the −X branch is the past cone's).
const DELTA = 0.06;
const YMAX = 0.14;
function cut(k) {
	const pts = [];
	if (k < 0.995) {
		const c = (DELTA * k) / (1 - k * k);
		const a = DELTA / (1 - k * k);
		const bb = DELTA / Math.sqrt(1 - k * k);
		for (let i = 0; i <= 40; i++)
			pts.push([c + a * Math.cos((TAU * i) / 40), bb * Math.sin((TAU * i) / 40)]);
		return { pts, kind: 0 };
	}
	if (k < 1.005) {
		for (let i = 0; i <= 32; i++) {
			const y = -YMAX + (2 * YMAX * i) / 32;
			pts.push([(y * y - DELTA * DELTA) / (2 * DELTA), y]);
		}
		return { pts, kind: 1 };
	}
	const d = k * k - 1;
	for (let i = 0; i <= 32; i++) {
		const y = -YMAX + (2 * YMAX * i) / 32;
		pts.push([-(DELTA * k) / d + Math.sqrt((y * y + (DELTA * DELTA) / d) / d), y]);
	}
	return { pts, kind: 2 };
}
const CSTEP = RC / 3; // the critical circle is ring 3
// 20 rings, 1261 cells, the last five fading out: the chart goes on.
const CRINGS = 20;
const CELLS = lattice(CRINGS, CSTEP).map((c) => ({ ...c, cut: cut(tiltOf(c.r)) }));
const KIND_COLOR = [PAL.cyan, PAL.gold, PAL.pink];
// A chart about centre `at` (board units), its cells at alpha a, written on
// ring by ring: ring k is on from ringOn(k).
function drawChart(ctx, view, at, a, ringOn, { ref = 1 } = {}) {
	if (a <= 0) return;
	for (const c of CELLS) {
		const p = ringOn(c.k, c.j / c.n) * (1 - span(c.k, CRINGS - 5, CRINGS + 0.5));
		if (p <= 0) continue;
		const cx = at[0] + c.r * Math.cos(c.phi);
		const cy = at[1] + c.r * Math.sin(c.phi);
		const q = view.to([cx, cy]);
		if (q[0] < -40 || q[1] < -40 || q[0] > view.w + 40 || q[1] > view.h + 40) continue;
		const ph = [-Math.sin(c.phi), Math.cos(c.phi)];
		const rh = [Math.cos(c.phi), Math.sin(c.phi)];
		const pts = c.cut.pts.map(([X, Y]) =>
			view.to([cx + X * ph[0] + Y * rh[0], cy + X * ph[1] + Y * rh[1]])
		);
		const col = KIND_COLOR[c.cut.kind];
		const wd = Math.min(2.6, Math.max(0.6, 1.7 * ref));
		if (c.cut.kind === 0) {
			ctx.save();
			ctx.globalAlpha = 0.1 * a * p;
			ctx.fillStyle = col;
			ctx.beginPath();
			pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
			ctx.fill();
			ctx.restore();
		}
		stroke(ctx, pts, { color: col, width: wd, alpha: a * lerp(0.5, 0.9, p), upto: p });
		disc(ctx, q[0], q[1], Math.min(3.5, Math.max(1.2, 2.2 * ref)), {
			fill: PAL.node,
			alpha: 0.8 * a * p
		});
	}
	// the circle, and the axis as a dot
	const ring = [];
	for (let i = 0; i <= 160; i++)
		ring.push(
			view.to([at[0] + RC * Math.cos((TAU * i) / 160), at[1] + RC * Math.sin((TAU * i) / 160)])
		);
	const cp = ringOn(3, 0);
	stroke(ctx, ring, {
		color: PAL.gold,
		width: Math.min(3, Math.max(0.8, 2.4 * ref)),
		alpha: 0.85 * a * cp,
		glow: 6,
		upto: cp
	});
}
// The lens: a log zoom out from the axis, then over to P and in.
const P_AT = [1.5 * RC * Math.cos(0.9), 1.5 * RC * Math.sin(0.9)];
function chartPose(s) {
	const out = smooth(span(s, 0, 0.5));
	const over = smooth(span(s, 0.42, 0.9));
	const dv = span(s, 0.6, 1);
	return {
		c: [lerp(0, P_AT[0], over), lerp(0, P_AT[1], over)],
		f: -1.0 * out + 3.3 * dv * dv // log scale
	};
}
const chartPace = (a, b) =>
	Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]) * Math.exp((a.f + b.f) / 2) + Math.abs(b.f - a.f);
function chart(ctx, w, h, u, st) {
	const H = Math.min(w, h);
	const pose = st.lens(u);
	const K0 = 0.4 * H; // px to the unit at the start: the circle at 0.35 of the frame
	const K = K0 * Math.exp(pose.f);
	const view = makeView({ w, h, scale: K, cx: w / 2 - K * pose.c[0], cy: h / 2 + K * pose.c[1] });
	view.w = w;
	view.h = h;
	const ref = K / K0;

	// The chart about the axis, written on outward, fading as P's is written.
	const aO = 1 - span(u, 0.56, 0.72);
	drawChart(
		ctx,
		view,
		[0, 0],
		aO,
		(k, f) => span(u, 0.03 + 0.03 * k + 0.015 * f, 0.08 + 0.03 * k + 0.015 * f),
		{ ref }
	);
	// The chart about P: the same.
	const aP = span(u, 0.52, 0.6);
	if (aP > 0)
		drawChart(
			ctx,
			view,
			P_AT,
			aP,
			(k, f) => span(u, 0.52 + 0.026 * k + 0.012 * f, 0.57 + 0.026 * k + 0.012 * f),
			{ ref }
		);

	captions(
		ctx,
		w,
		h,
		u,
		[
			[
				0,
				'each cone, cut at t + δ:  an ellipse; on sinh r = 1 a parabola; beyond, a hyperbola',
				0.12,
				0.26,
				0.5,
				0.54
			],
			[1, 'closed in time, open in space', 0.34, 0.4, 0.5, 0.54],
			[0, 'homogeneous:  the chart about P is the chart about O', 0.56, 0.66],
			[1, 'every point is the centre', 0.7, 0.75]
		],
		Math.round(Math.max(17, H * 0.028))
	);

	// O lit while its chart is up; P lit, and the way on.
	const qo = view.to([0, 0]);
	lit(ctx, qo[0], qo[1], 5 * Math.min(1.6, Math.max(0.6, ref)), 0.9 * aO);
	math(ctx, 'O', qo[0] + 12, qo[1] - 16, { size: 24, alpha: aO * span(u, 0.06, 0.1) });
	const pl = span(u, 0.46, 0.52);
	if (pl > 0) {
		const qp = view.to(P_AT);
		const pr = smooth(span(u, 0.86, 1));
		lit(ctx, qp[0], qp[1], lerp(3, 7, pl) * (1 - pr), pl * (1 - pr));
		math(ctx, 'P', qp[0] + 12, qp[1] - 16, { size: 24, alpha: pl * (1 - span(u, 0.8, 0.86)) });
		if (pr > 0) portal(ctx, qp[0], qp[1], lerp(7, h / 6, pr), pr);
	}
}

// ── sentence: a sentence that speaks of itself ───────────────────────────────
// The formula at level 0, centred at the origin of a board whose unit is the
// level-0 font size; the box ⌜G⌝ at B, of width BW (in those units); the
// level-1 formula is the whole formula scaled by K to fit it, centred at B,
// and so on. T(x) = B + K(x − C): the levels converge on the fixed point
// x* = B/(1 − K), which the lens zooms into.
const SENT = { left: 'G ⟺ ¬Prov(', right: ')', K: 0.3 };
const GODEL_NUMBER = '56 003 914 346 797 203 650 244 870 524 931 389 834 340';
let SLAY = null; // the layout, measured once
function sentenceLayout(ctx) {
	if (SLAY) return SLAY;
	ctx.save();
	ctx.font = `italic 400 100px ${MATH_FONT}`;
	const wl = ctx.measureText(SENT.left).width / 100;
	const wr = ctx.measureText(SENT.right).width / 100;
	ctx.restore();
	const gap = 0.12;
	// the box holds the formula at K: its width is K × the formula's own
	// width W, and W = wl + gap + box + gap + wr → W = (wl + wr + 2 gap)/(1 − K)
	const W = (wl + wr + 2 * gap) / (1 - SENT.K);
	const BW = SENT.K * W;
	const BH = Math.max(1.1, SENT.K * 1.6);
	const x0 = -W / 2;
	const B = [x0 + wl + gap + BW / 2, 0];
	SLAY = { wl, wr, W, BW, BH, x0, B, gap, fixed: [B[0] / (1 - SENT.K), 0] };
	return SLAY;
}
// Draw one level: the formula at scale `sc` (px per unit), centred at (cx, cy)
// on screen; `upto` writes it on.
function drawLevel(ctx, lay, cx, cy, sc, alpha, upto = 1, boxUpto = 1) {
	if (alpha <= 0.004 || sc < 1.5) return;
	const size = sc;
	const y = cy;
	const x = cx + lay.x0 * sc;
	const n = SENT.left.length + 1 + SENT.right.length;
	const k = upto * n;
	math(ctx, SENT.left, x, y, { size, alpha, upto: clamp01(k / SENT.left.length) });
	const bx = cx + (lay.B[0] - lay.BW / 2) * sc;
	const by = y - (lay.BH / 2) * sc;
	const bw = lay.BW * sc;
	const bh = lay.BH * sc;
	const bp = clamp01((k - SENT.left.length) * 1.5) * boxUpto;
	if (bp > 0) {
		// the corner quotes ⌜ ⌝ as the box's own corners, chalk, and the box
		const q = Math.min(bw * 0.16, bh * 0.32);
		const wd = Math.max(1, size * 0.03);
		stroke(
			ctx,
			[
				[bx, by + q],
				[bx, by],
				[bx + q, by]
			],
			{ color: PAL.chalk, width: wd, alpha: alpha * bp, cap: 'butt' }
		);
		stroke(
			ctx,
			[
				[bx + bw - q, by],
				[bx + bw, by],
				[bx + bw, by + q]
			],
			{ color: PAL.chalk, width: wd, alpha: alpha * bp, cap: 'butt' }
		);
		stroke(
			ctx,
			[
				[bx, by],
				[bx + bw, by],
				[bx + bw, by + bh],
				[bx, by + bh],
				[bx, by]
			],
			{
				color: PAL.gold,
				width: Math.max(0.6, size * 0.012),
				alpha: alpha * 0.55 * bp
			}
		);
	}
	const rp = clamp01(k - SENT.left.length - 1);
	if (rp > 0)
		math(ctx, SENT.right, cx + (lay.B[0] + lay.BW / 2 + lay.gap) * sc, y, {
			size,
			alpha,
			upto: rp
		});
}
function sentence(ctx, w, h, u) {
	const H = Math.min(w, h);
	const lay = sentenceLayout(ctx);
	const base = Math.min(0.05 * w, 0.09 * h); // the level-0 font, px
	// The zoom: n levels in, gathering pace; the frame's centre on x*.
	const N = 5.2;
	const n = N * Math.pow(span(u, 0.12, 1), 1.9);
	const Z = Math.pow(SENT.K, -n);
	const fx = w * 0.6;
	const fy = h * 0.56;
	const m0 = Math.max(0, Math.floor(n) - 1);
	for (let m = m0; m <= m0 + 7; m++) {
		const sc = base * Z * Math.pow(SENT.K, m); // px per unit at this level
		if (sc < 1.5 || sc > 6000) continue;
		// the level's centre: T^m(0) = x*(1 − K^m)
		const cx = fx + (lay.fixed[0] * (1 - Math.pow(SENT.K, m)) - lay.fixed[0]) * base * Z;
		const cy = fy;
		// written on: level 0 by 0.1, the next by 0.18, and so on down
		const wr = span(u, 0.02 + 0.07 * m, 0.1 + 0.07 * m);
		drawLevel(ctx, lay, cx, cy, sc, Math.min(1, sc / 6) * 0.95, wr, wr);
	}
	// The limit point: lit, the way on.
	const pr = smooth(span(u, 0.86, 1));
	const pz = span(u, 0.7, 0.86);
	if (pz > 0) lit(ctx, fx, fy, lerp(2, 7, pz) * (1 - pr), pz * (1 - pr));
	if (pr > 0) portal(ctx, fx, fy, lerp(7, h / 6, pr), pr);

	captions(
		ctx,
		w,
		h,
		u,
		[
			[0, '⌜G⌝ :  the Gödel number of G — the sentence, as a number', 0.06, 0.16, 0.56, 0.6],
			[1, 'G ⟺ ¬Prov(⌜G⌝) :  G says “G cannot be proved”', 0.2, 0.3, 0.56, 0.6],
			[2, '⌜0 = 0⌝ = 2^{6} · 3^{5} · 5^{6} = 243 000 000', 0.36, 0.44, 0.56, 0.6],
			[
				0,
				'14·02·1987 ↦ 2^{2}·3^{5}·5^{1}·7^{3}·11^{2}·13^{10}·17^{9}·19^{8}   (a digit d as d + 1)',
				0.6,
				0.7
			],
			[1, `= ${GODEL_NUMBER}`, 0.7, 0.78],
			[2, 'true, and unprovable: the sentence that speaks of itself', 0.8, 0.88]
		],
		Math.round(Math.max(17, H * 0.028))
	);
}
