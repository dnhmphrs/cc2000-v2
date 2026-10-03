import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	bloom,
	math,
	PAL,
	TAU,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clock,
	variant,
	camera3,
	note,
	tag
} from './log/board.js';
import { drawSperm, spiralArc } from './log/sperm.js';
import { drawPlate, circlePts } from './log/plate.js';
import { zetaHalf } from '$lib/functions/zeta';

// ── Sketch: log-sperm — the swimmer, made of a golden spiral ─────────────────
// No model, no hologram: the sperm is the golden spiral r = φ^(2θ/π), the
// tight coil at its pole the head and the arc unwinding from it the tail, as
// it sits in the plate the lead sent. Four ways of bringing it to life, one
// per ?v=:
//
//   spiral  (default) the plate, written on; the spiral drawn out of its pole;
//           a wave starts down the tail (the beat), and then the whole swimmer
//           swims INTO its own pole — turned and shrunk by the same law, which
//           is the loxodromic flow, so its shape never changes as it goes
//   trail   the head is a point on the spiral swimming in toward the pole, the
//           tail the spiral it has come along; the lens zooms with it, so the
//           head holds its size and orbits the pole while the plates — nested,
//           one turn, φ⁴, apart — stream outward past it: a tunnel of plates,
//           and the glow at the pole is the orb
//   fib     the blackboard construction: the Fibonacci squares 1, 1, 2, 3, 5,
//           8, 13, 21 laid out and numbered, a quarter-circle in each, and the
//           squares rubbed out to leave the swimmer
//   helix   the tail as ζ(½ + it) itself, wound round the critical line in 3D:
//           the head at the front, the line streaming back past it with its
//           zeros marked — the swimmer swims the critical line
//
// Ten seconds, a pure function of progress: ?at= pins any frame.

const SECONDS = 10;

export default async function make({ at }) {
	const v = variant(['spiral', 'trail', 'fib', 'helix']);
	const b = getBoard();
	const time = clock(SECONDS, at);

	// The ζ tail: ζ(½ + it) for t in [0, 70], once; ζ(½ − it) is its
	// conjugate, so the line runs both ways from 0.
	let Z = null;
	if (v === 'helix') {
		const tab = [];
		for (let i = 0; i <= 1400; i++) tab.push(zetaHalf((70 * i) / 1400));
		Z = (T) => {
			const x = (Math.min(70, Math.abs(T)) / 70) * 1400;
			const i = Math.min(1399, Math.floor(x));
			const f = x - i;
			const re = lerp(tab[i][0], tab[i + 1][0], f);
			const im = lerp(tab[i][1], tab[i + 1][1], f);
			return T < 0 ? [re, -im] : [re, im];
		};
	}

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const secs = time.t;
		const R = 0.42 * Math.min(w, h);
		if (v === 'spiral') spiral(ctx, w, h, R, u, secs);
		else if (v === 'trail') trail(ctx, w, h, R, u, secs);
		else if (v === 'fib') fib(ctx, w, h, R, u, secs);
		else helix(ctx, w, h, R, u, secs, Z);
		tag(ctx, w, h, `log-sperm · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// The plate's spiral, posed as the plate has it: pole at the centre, the tail's
// tip on the circle at about 235°.
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP_T = FROM + LEN;
const SCALE0 = Math.exp(-GOLDEN_K * TIP_T);
const TURN0 = (235 * Math.PI) / 180 - TIP_T;

function spiral(ctx, w, h, R, u, secs) {
	const view = makeView({ w, h, scale: R });
	drawPlate(ctx, view, { upto: span(u, 0, 0.2), alpha: 1 - 0.6 * span(u, 0.7, 0.95) });
	// Drawn out of the pole, then alive, then into the pole.
	const body = smooth(span(u, 0.14, 0.4));
	const live = span(u, 0.38, 0.5);
	const go = smooth(span(u, 0.62, 0.97));
	const turns = go * 3;
	const flow = turns * TAU;
	drawSperm(ctx, view, {
		scale: SCALE0 * Math.exp(-GOLDEN_K * flow),
		turn: TURN0 + flow,
		from: FROM,
		length: LEN,
		width: 7 * Math.max(0.05, Math.exp(-GOLDEN_K * flow * 0.55)),
		tip: 2.2,
		body,
		wiggle: 0.13 * live * (1 - go),
		phase: secs * 1.7
	});
	// The beat at the pole as it goes in.
	const hit = span(u, 0.9, 1);
	if (hit > 0) bloom(ctx, w / 2, h / 2, R * 0.18 * hit, 'rgba(255, 236, 190, 0.9)', 1 - hit * 0.3);
	note(ctx, w, h, R, [
		['r = φ^{2θ/π}', span(u, 0.3, 0.42)],
		['θ ↦ θ + s,   r ↦ φ^{2s/π} r', span(u, 0.6, 0.72)]
	]);
}

function trail(ctx, w, h, R, u, secs) {
	// The head's angle on the spiral r = e^{Kθ}, swimming inward, and the
	// lens zoomed so the head stays a fixed distance from the pole on screen.
	const omega = 1.1; // radians a second
	const th = -omega * secs;
	const rh = Math.exp(GOLDEN_K * th);
	const rho = 0.42; // the head's distance from the pole, in plate radii
	const view = makeView({ w, h, scale: (R * rho) / rh });
	// The nested plates, one turn (φ⁴) apart, the outermost written on first.
	const turn = Math.exp(-TAU * GOLDEN_K);
	const k0 = Math.floor((-GOLDEN_K * th) / (TAU * GOLDEN_K)) - 1;
	for (let k = k0; k < k0 + 5; k++) {
		const s = Math.pow(turn, k);
		const px = (R * rho * s) / rh;
		if (px < 6 || px > 4 * R) continue;
		const fade = span(px, 6, 40) * (1 - span(px, 1.6 * R, 3.6 * R));
		drawPlate(ctx, view, {
			R: s,
			upto: span(u, 0, 0.15),
			alpha: fade,
			labels: false,
			theta: false
		});
	}
	// The orb at the pole.
	bloom(ctx, w / 2, h / 2, R * 0.16, 'rgba(255, 230, 170, 0.85)', 0.9);
	disc(ctx, w / 2, h / 2, 4, { fill: '#fff8e6' });
	// The swimmer: head on the spiral, tail the spiral behind it.
	const body = smooth(span(u, 0.08, 0.3));
	const tail = spiralArc({
		scale: 1,
		turn: 0,
		from: th,
		length: 7.6 * body,
		wiggle: 0.12,
		phase: secs * 1.8
	}).map(view.to);
	stroke(ctx, tail, { color: PAL.gold, taper: [8, 0.6] });
	const [hx, hy] = view.to([rh * Math.cos(th), rh * Math.sin(th)]);
	disc(ctx, hx, hy, 9 * body, { fill: PAL.gold });
	disc(ctx, hx - 2.5, hy - 2.5, 3.2 * body, { fill: PAL.chalk, alpha: 0.85 });
	note(ctx, w, h, R, [
		['z ↦ e^{−(K+i)ωt} z', span(u, 0.25, 0.4)],
		['one turn = ×φ^{4}', span(u, 0.4, 0.55)]
	]);
}

// The Fibonacci squares, with the quarter-circle in each.
function fibSquares(n = 8) {
	const F = [1, 1];
	while (F.length < n) F.push(F[F.length - 1] + F[F.length - 2]);
	const types = ['down', 'right', 'up', 'left'];
	let rect = [0, 0, 1, 1];
	const out = [{ box: [0, 0, 1, 1], s: 1, c: [1, 1], a0: Math.PI, a1: 1.5 * Math.PI }];
	for (let i = 1; i < n; i++) {
		const s = F[i];
		const t = types[i % 4];
		const [x0, y0, x1, y1] = rect;
		let box, c, a0;
		if (t === 'right') {
			box = [x1, y0, x1 + s, y0 + s];
			c = [x1, y0 + s];
			a0 = -0.5 * Math.PI;
		} else if (t === 'up') {
			box = [x0, y1, x0 + s, y1 + s];
			c = [x0, y1];
			a0 = 0;
		} else if (t === 'left') {
			box = [x0 - s, y1 - s, x0, y1];
			c = [x0, y1 - s];
			a0 = 0.5 * Math.PI;
		} else {
			box = [x1 - s, y0 - s, x1, y0];
			c = [x1, y0];
			a0 = Math.PI;
		}
		out.push({ box, s, c, a0, a1: a0 + 0.5 * Math.PI });
		rect = [Math.min(x0, box[0]), Math.min(y0, box[1]), Math.max(x1, box[2]), Math.max(y1, box[3])];
	}
	return { squares: out, rect };
}

const cdiv = (p, q) => {
	const d = q[0] * q[0] + q[1] * q[1];
	return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d];
};

function fib(ctx, w, h, R, u, secs) {
	const { squares, rect } = fibSquares(8);
	const bw = rect[2] - rect[0];
	const bh = rect[3] - rect[1];
	const scale = Math.min((w * 0.82) / bw, (h * 0.82) / bh);
	const view = makeView({
		w,
		h,
		scale,
		cx: w / 2 - scale * (rect[0] + bw / 2),
		cy: h / 2 + scale * (rect[1] + bh / 2)
	});
	const n = squares.length;
	const rub = smooth(span(u, 0.58, 0.72));
	squares.forEach((q, i) => {
		const t0 = 0.04 + (i / n) * 0.42;
		const draw = span(u, t0, t0 + 0.08);
		const [x0, y0, x1, y1] = q.box;
		const box = [
			[x0, y0],
			[x1, y0],
			[x1, y1],
			[x0, y1],
			[x0, y0]
		].map(view.to);
		stroke(ctx, box, { color: PAL.chalk, width: 1.6, alpha: 0.75 * (1 - rub), upto: draw });
		const [mx, my] = view.to([(x0 + x1) / 2, (y0 + y1) / 2]);
		if (q.s * scale > 26)
			math(ctx, String(q.s), mx, my, {
				size: Math.min(64, 10 + q.s * scale * 0.18),
				align: 'center',
				alpha: span(u, t0 + 0.04, t0 + 0.1) * (1 - rub) * 0.9,
				color: PAL.chalkDim
			});
		const arc = circlePts(q.c[0], q.c[1], q.s, q.a0, q.a1, 40).map(view.to);
		const k = i / (n - 1);
		stroke(ctx, arc, {
			color: PAL.gold,
			width: lerp(2.5, 3.5, k),
			upto: span(u, t0 + 0.03, t0 + 0.1),
			alpha: 1 - smooth(span(u, 0.7, 0.8))
		});
	});
	// Rubbed out, the arcs give way to the swimmer: the true golden spiral
	// through the same squares, which then beats and turns.
	const live = smooth(span(u, 0.7, 0.82));
	if (live > 0) {
		// The pole of the squares' spiral: the fixed point of the spiral
		// similarity z ↦ a z + b that takes each arc's end to the one before.
		const end = (q) => [q.c[0] + q.s * Math.cos(q.a1), q.c[1] + q.s * Math.sin(q.a1)];
		const E7 = end(squares[n - 1]);
		const E6 = end(squares[n - 2]);
		const E5 = end(squares[n - 3]);
		const a = cdiv([E6[0] - E5[0], E6[1] - E5[1]], [E7[0] - E6[0], E7[1] - E6[1]]);
		const bb = [E6[0] - (a[0] * E7[0] - a[1] * E7[1]), E6[1] - (a[0] * E7[1] + a[1] * E7[0])];
		const pole = cdiv(bb, [1 - a[0], -a[1]]);
		const tip = E7;
		const dx = tip[0] - pole[0];
		const dy = tip[1] - pole[1];
		const rTip = Math.hypot(dx, dy);
		const tipAng = Math.atan2(dy, dx);
		const swim = span(u, 0.8, 1);
		drawSperm(ctx, view, {
			pole,
			scale: rTip * Math.exp(-GOLDEN_K * TIP_T),
			turn: tipAng - TIP_T - swim * 0.8,
			from: FROM,
			length: LEN,
			width: 7,
			body: live,
			wiggle: 0.12 * swim,
			phase: secs * 1.7
		});
	}
	note(ctx, w, h, R, [
		['1, 1, 2, 3, 5, 8, 13, 21 …', span(u, 0.1, 0.3)],
		['F_{n+1} / F_{n} → φ', span(u, 0.45, 0.58)]
	]);
}

function helix(ctx, w, h, R, u, secs, Z) {
	// The critical line runs off into the board along −x; ζ(½ + it) winds
	// round it in the (y, z) plane. The head rides the line at the front,
	// at t = T_h, swimming on along it; the tail is the curve behind it, so
	// the line and its zeros stream back past the head as it swims.
	const cam = camera3({
		pos: [2.6, 1.15, 3.4],
		target: [-1.2, 0, 0],
		up: [0, 1, 0],
		fov: 42,
		w,
		h
	});
	const draw = smooth(span(u, 0.1, 0.45));
	const Th = 4.2 * secs; // where the head is on the line
	const L = 50; // the tail's length, in t
	const dx = 0.085; // world units of line per unit of t
	const amp = 0.24;
	const x0 = 0.9;
	const line = [];
	for (let i = 0; i <= 60; i++) line.push(cam.project([x0 - (L * dx * i) / 60, 0, 0]));
	stroke(ctx, line, { color: PAL.chalk, width: 1.4, alpha: 0.55 * span(u, 0, 0.12) });
	// The curve, drawn out from the head; thinner and fainter to the tip.
	let prev = null;
	const N = 900;
	for (let i = 0; i <= N; i++) {
		const back = (L * draw * i) / N; // t behind the head
		const [re, im] = Z(Th - back);
		const q = cam.project([x0 - back * dx, amp * im, amp * re]);
		if (prev) {
			const k = back / L;
			stroke(ctx, [prev, q], {
				color: PAL.gold,
				width: lerp(6.5, 0.8, k),
				alpha: 1 - span(k, 0.55, 1)
			});
		}
		prev = q;
	}
	// The zeros, where the curve touches the line, labelled as they pass.
	const zeros = [
		14.1347, 21.022, 25.0109, 30.4249, 32.9351, 37.5862, 40.9187, 43.3271, 48.0052, 49.7738,
		52.9703, 56.4462, 59.347, 60.8318, 65.1125, 67.0798
	];
	for (const g of zeros) {
		const back = Th - g;
		if (back < 0 || back > L * draw) continue;
		const q = cam.project([x0 - back * dx, 0, 0]);
		const a = 1 - span(back / L, 0.5, 1);
		disc(ctx, q[0], q[1], 4.5, { fill: PAL.chalk, alpha: a });
		math(ctx, g.toFixed(2), q[0] + 8, q[1] + 16, { size: 13, alpha: a * 0.8 });
	}
	// The head, on the line at the front.
	const head = cam.project([x0 + 0.06, 0, 0]);
	disc(ctx, head[0], head[1], 12 * smooth(span(u, 0.05, 0.2)), { fill: PAL.gold });
	disc(ctx, head[0] - 3.5, head[1] - 3.5, 4, { fill: PAL.chalk, alpha: 0.8 * span(u, 0.1, 0.2) });
	note(ctx, w, h, R, [
		['ζ(½ + it)', span(u, 0.2, 0.32)],
		['it winds round the line, and touches it at every zero', span(u, 0.5, 0.65)]
	]);
}
