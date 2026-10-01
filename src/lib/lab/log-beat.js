import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	bloom,
	math,
	note,
	tag,
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
	dot,
	sub3,
	add3,
	mul3,
	norm,
	easeInOutCubic
} from './log/board.js';
import { drawSperm } from './log/sperm.js';
import { circlePts } from './log/plate.js';

// ── Sketch: log-beat — the centre beat ───────────────────────────────────────
// The moment of conception, as geometry: the golden-spiral swimmer comes down
// the log tunnel to its pole, where the glow is, and something happens there —
// one beat — that leaves the board ready for the projective zoom out. Six
// seconds: a short approach (u 0 → 0.4), the hit at u = 0.4 (a wash of light
// and a shock ring off the point), the beat's geometry (to about 0.7) and an
// aftermath that holds the new picture. One per ?v=:
//
//   invert  (default) the net is the lead's loxodromes — cyan golden spirals
//           r = e^{K(θ − c)}, pink ones the other way, grey nodes at their
//           crossings sized by the cell they sit in. The lens zooms down it
//           (a pure zoom, so the two families counter-turn) with the swimmer
//           riding a cyan arm, which dives into the pole. On the hit, its arm
//           lights gold and the Riemann sphere turns half a turn about ±i:
//           z ↦ (z cos s − sin s)/(z sin s + cos s), s 0 → π/2. The point it
//           hit runs out along the real axis to ∞ (−tan s), ∞ comes in from
//           the right (cot s) to be the new centre, and the net goes through
//           a two-pole loxodromic net — spiralling out of one pole into the
//           other — to land on itself: at s = π/2 the map is z ↦ −1/z, which
//           keeps the net and swaps its ends. The rose circle (the unit
//           circle, a circle through ±i) flips through the line Re z = 0.
//   ring    the plate: A and B on the axis, the circles through them (cyan,
//           σ = arg (z − A)/(z − B)) and the Apollonian circles round them
//           (pink, τ = log |z − A|/|z − B|) — the bipolar net. The swimmer,
//           posed as in the lead's plate, is poured into its own pole at the
//           centre (the loxodromic flow, which keeps its shape). On the hit Θ
//           is stamped there and a shock runs the hyperbolic flow: the line
//           τ = 0 through the centre splits into the Apollonian circles ±τ,
//           which close down onto A and B (it is the shock: no concentric
//           ring here), lighting the pink circles they cross; A and B
//           fire, and the circles through A and B light gold in turn, from
//           the segment AB outward, written on from both ends.
//   pinch   the log cylinder on a horn torus (R = r): u = arg z round the
//           axis, tan ½v = −sinh log|z| round the tube, so |z| → 0 comes into
//           the pinch from above and |z| → ∞ from below — 0 = ∞ at the pinch.
//           Hand-projected (camera3) over a faintly shaded surface (front
//           faces, far to near); a line is hidden where a march from it to
//           the lens through the solid torus's distance function goes
//           inside, and hidden runs are dashed and faint, as the plates draw
//           them. Seen almost straight down the horn, so the pinch is the far
//           end of the tunnel; the swimmer swims a golden loxodrome down into
//           it. On the hit the torus breathes once: R swells (the pinch opens
//           into a hole, rimmed gold, and shuts), and a gold parallel runs
//           from the pinch over the outside and back into the pinch from
//           below, where a second, smaller flash lands; the lens pulls back
//           and tilts to show the horn torus, the pinch lit, 0 = ∞.
//
// invert's net is cut where its cells fall under a few pixels, so the poles
// stay clean under the glow rather than a smudge of line.
//
// A pure function of progress: ?at= pins any frame.

const SECONDS = 6;
const HIT = 0.4; // the head reaches the pole

const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const easeIn = (t) => Math.pow(clamp01(t), 2);

// Distance covered at a speed of 1 that eases to 0 between a and b (so a zoom
// can glide to a stop and stay a pure function of u).
function glide(u, a, b) {
	if (u <= a) return u;
	const x = span(u, a, b);
	return a + (b - a) * (x - x * x * x + (x * x * x * x) / 2);
}

export default async function make({ at }) {
	const v = variant(['invert', 'ring', 'pinch']);
	const b = getBoard();
	const time = clock(SECONDS, at);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const secs = time.t;
		const R = 0.42 * Math.min(w, h);
		if (v === 'invert') invert(ctx, w, h, R, u, secs);
		else if (v === 'ring') ring(ctx, w, h, R, u, secs);
		else pinch(ctx, w, h, R, u, secs);
		tag(ctx, w, h, `log-beat · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Shared ───────────────────────────────────────────────────────────────────
// The beat: a wash of light over the board, a bloom on the point and a shock
// ring out of it — attack in a frame or two, then a fast decay.
function impact(ctx, w, h, x, y, R, u, hit = HIT, gain = 1, shock = true) {
	const k = u - hit;
	if (k < -0.008 || k > 0.2) return;
	const a = gain * (k < 0 ? 1 + k / 0.008 : Math.exp(-k / 0.028));
	ctx.save();
	ctx.globalAlpha = 0.62 * a;
	ctx.fillStyle = '#fff3d8';
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
	bloom(ctx, x, y, R * (0.3 + 0.9 * a), 'rgba(255, 238, 200, 0.95)', a);
	const s = span(u, hit, hit + 0.13);
	if (shock && s > 0 && s < 1) {
		const pts = circlePts(x, y, R * (0.03 + 2.4 * easeOut(s)), 0, TAU, 220);
		stroke(ctx, pts, { color: PAL.chalk, width: 1 + 7 * (1 - s), alpha: gain * (1 - s) });
	}
}

// A lit point: a disc with a hot core and a halo.
function lit(ctx, x, y, r, a = 1, color = PAL.gold, halo = 'rgba(255, 222, 150, 0.75)') {
	if (a <= 0 || r <= 0) return;
	bloom(ctx, x, y, r * 6, halo, a);
	disc(ctx, x, y, r, { fill: color, alpha: a });
	disc(ctx, x, y, r * 0.45, { fill: '#fffaf0', alpha: a });
}

// The orb at the pole, before the hit: grows as the swimmer closes.
function orb(ctx, x, y, R, g) {
	bloom(ctx, x, y, R * (0.12 + 0.14 * g), 'rgba(255, 228, 165, 0.85)', 0.55 + 0.45 * g);
	disc(ctx, x, y, 3 + 3 * g, { fill: '#fff8e6' });
}

// A polyline of math points through a view, broken wherever it runs far off
// the board (so a line through ∞ is not drawn back across it).
function strokeMapped(ctx, view, pts, opts, lim = 7) {
	let run = [];
	const flush = () => {
		if (run.length > 1) stroke(ctx, run, opts);
		run = [];
	};
	for (const p of pts) {
		if (!(Math.abs(p[0]) < lim && Math.abs(p[1]) < lim)) {
			flush();
			continue;
		}
		run.push(view.to(p));
	}
	flush();
}

// The Θ of the plates: an upright ellipse with a bar, on a patch of board.
function theta(ctx, x, y, rr, a = 1) {
	if (a <= 0) return;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = PAL.ground;
	ctx.beginPath();
	ctx.ellipse(x, y, rr * 1.05, rr * 1.25, 0, 0, TAU);
	ctx.fill();
	ctx.strokeStyle = PAL.chalk;
	ctx.lineWidth = Math.max(1.5, rr * 0.18);
	ctx.beginPath();
	ctx.ellipse(x, y, rr * 0.78, rr, 0, 0, TAU);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x - rr * 0.42, y);
	ctx.lineTo(x + rr * 0.42, y);
	ctx.stroke();
	ctx.restore();
}

// ── invert: the sphere turns half a turn, 0 ↔ ∞ ──────────────────────────────
const N = 8; // arms in each family
const KP = 1.4; // the pink family's pitch; the cyan one is the golden K
const RING = TAU / (N * (1 / GOLDEN_K + 1 / KP)); // node rings, in log|z|
const ZOOM = 0.42; // the lens's speed down the tunnel, in log|z| a second

function invert(ctx, w, h, R, u, secs) {
	const K = GOLDEN_K;
	const view = makeView({ w, h, scale: R });
	// The lens down the tunnel: a pure zoom, gliding to a stop on the hit.
	const m = ZOOM * SECONDS * glide(u, HIT - 0.04, HIT + 0.02);
	// The turn of the sphere about ±i.
	const s = (Math.PI / 2) * easeInOutCubic(span(u, 0.445, 0.71));
	const cs = Math.cos(s);
	const sn = Math.sin(s);
	const mob = (z) => C.div([z[0] * cs - sn, z[1] * cs], [z[0] * sn + cs, z[1] * sn]);
	// A point of the net at log|z| = r1 on screen (before the turn), angle th —
	// or a break, where the net's cells are under a few pixels (at its poles,
	// where it would only be a smudge under the glow).
	const at = (r1, th) => {
		const z1 = C.exp([r1, th]);
		const dd = C.add(C.scale(z1, sn), [cs, 0]);
		if ((Math.exp(r1) * RING * R) / (dd[0] * dd[0] + dd[1] * dd[1]) < 4) return [NaN, NaN];
		return mob(z1);
	};

	// The net.
	const net = 0.88;
	for (let j = 0; j < N; j++) {
		const cyan = [];
		const pink = [];
		for (let i = 0; i <= 1100; i++) {
			const r1 = -9 + (18 * i) / 1100;
			cyan.push(at(r1, (r1 - m) / K + (TAU * j) / N));
		}
		for (let i = 0; i <= 500; i++) {
			const r1 = -9 + (18 * i) / 500;
			pink.push(at(r1, -(r1 - m) / KP + (TAU * (j + 0.5)) / N));
		}
		strokeMapped(ctx, view, pink, { color: PAL.pink, width: 2.2, alpha: net });
		strokeMapped(ctx, view, cyan, { color: PAL.cyan, width: 2.2, alpha: net });
	}
	// The nodes, sized by the cell they sit in on screen.
	const l0 = Math.ceil((-8 - m) / RING);
	const l1 = Math.floor((8 - m) / RING);
	for (let l = l0; l <= l1; l++) {
		const r1 = l * RING + m;
		for (let j = 0; j < N; j++) {
			const z1 = C.exp([r1, (l * RING) / K + (TAU * j) / N]);
			const p = mob(z1);
			if (Math.abs(p[0]) > 2.4 || Math.abs(p[1]) > 1.6) continue;
			const dd = C.add(C.scale(z1, sn), [cs, 0]);
			const gain = 1 / (dd[0] * dd[0] + dd[1] * dd[1]); // |M′(z)|
			const cell = gain * Math.exp(r1) * RING * R;
			const rad = Math.min(13, 0.11 * cell);
			if (rad < 0.8) continue;
			const [x, y] = view.to(p);
			disc(ctx, x, y, rad, { fill: PAL.node, alpha: 0.82 });
		}
	}

	// The construction, written on with the beat: the real axis and the unit
	// circle (a circle through ±i, which the turn carries through Re z = 0).
	const wr = span(u, HIT + 0.02, HIT + 0.1);
	const con = 1 - 0.5 * span(u, 0.8, 1);
	if (wr > 0) {
		stroke(ctx, [view.to([-3, 0]), view.to([3, 0])], {
			color: PAL.rose,
			width: 2,
			alpha: 0.7 * con,
			upto: wr
		});
		strokeMapped(
			ctx,
			view,
			circlePts(0, 0, 1, 0, TAU, 260).map(mob),
			{ color: PAL.rose, width: 2.4, alpha: 0.85 * con * wr },
			30
		);
	}

	// The swimmer's arm, lit gold from the pole outward on the hit.
	const gold = span(u, HIT, HIT + 0.09);
	if (gold > 0) {
		const top = lerp(-6, 9, easeIn(gold));
		const arm = [];
		for (let i = 0; i <= 1100; i++) {
			const r1 = -9 + ((top + 9) * i) / 1100;
			arm.push(at(r1, (r1 - m) / K));
		}
		strokeMapped(ctx, view, arm, { color: PAL.gold, width: 3.8, glow: 10 });
	}

	// The swimmer, riding cyan arm 0 down the tunnel, then diving into the pole.
	const [ox, oy] = view.to([0, 0]);
	if (u < HIT) {
		const dive = span(u, 0.22, HIT);
		const rs = Math.max(1e-4, 0.46 * Math.pow(1 - easeIn(dive), 1.4));
		orb(ctx, ox, oy, R, dive);
		const th = (Math.log(rs) - m) / K;
		const L = 7.4;
		const tail = [];
		const live = 0.13 * (1 - dive);
		for (let i = 0; i <= 260; i++) {
			const f = i / 260;
			const t = th + L * f;
			const nudge = live * f * f * Math.sin(TAU * (2.2 * f - secs * 1.7));
			tail.push(view.to(C.exp([K * t + m, t + nudge])));
		}
		const sz = Math.sqrt(clamp01(rs / 0.46));
		stroke(ctx, tail, { color: PAL.gold, taper: [8 * sz + 1, 1.2] });
		const [hx, hy] = tail[0];
		disc(ctx, hx, hy, 10 * sz, { fill: PAL.gold });
		disc(ctx, hx - 2.6 * sz, hy - 2.6 * sz, 3.4 * sz, { fill: PAL.chalk, alpha: 0.85 });
	}

	// The fixed points of the turn, ±i.
	const fx = span(u, HIT + 0.04, HIT + 0.1) * (1 - span(u, 0.82, 0.95));
	if (fx > 0) {
		for (const [y, s0] of [
			[1, 'i'],
			[-1, '−i']
		]) {
			const [px, py] = view.to([0, y]);
			disc(ctx, px, py, 6, { fill: PAL.node, alpha: fx, ring: PAL.ground, ringWidth: 2 });
			math(ctx, s0, px + 14, py - 12, { size: 20, alpha: fx });
		}
	}

	// The point it hit, running out along the axis to ∞ (−tan s), with a trail.
	if (u >= HIT) {
		const x0 = -Math.tan(s);
		if (x0 > -2.6) {
			const trail = [];
			for (let i = 0; i <= 40; i++) {
				const g = Math.max(0, s - 0.3) + (Math.min(0.3, s) * i) / 40;
				trail.push(view.to([-Math.tan(g), 0]));
			}
			stroke(ctx, trail.reverse(), { color: PAL.gold, taper: [7, 0.5], alpha: 0.9 });
			const [px, py] = view.to([x0, 0]);
			lit(ctx, px, py, 8, span(u, HIT + 0.01, HIT + 0.04));
			math(ctx, '0', px - 6, py - 26, { size: 22, align: 'right', alpha: span(u, 0.45, 0.5) });
		}
		// And ∞, coming in from the right (cot s) to be the new centre.
		if (s > 0.02) {
			const xi = Math.cos(s) / Math.sin(s);
			if (xi < 2.6) {
				const [px, py] = view.to([xi, 0]);
				const home = span(u, 0.66, 0.74);
				lit(ctx, px, py, 7 + 2 * home, 1, '#fff2d0', 'rgba(255, 236, 196, 0.6)');
				if (home > 0) bloom(ctx, px, py, R * 0.16 * home, 'rgba(255, 226, 160, 0.4)', home);
				math(ctx, '∞', px + 22, py - 34, { size: 28 });
			}
		}
	}

	impact(ctx, w, h, ox, oy, R, u);
	note(ctx, w, h, R, [
		['z ↦ (z cos s − sin s) / (z sin s + cos s)', span(u, 0.45, 0.58)],
		['s = π/2 :   z ↦ −1/z,    0 ↔ ∞', span(u, 0.72, 0.84)]
	]);
}

// ── ring: the shock through the pencils ──────────────────────────────────────
// Bipolar coordinates: z = coth(w/2), w = τ + iσ, with A = −1 and B = +1.
const bip = (tau, sig) => {
	const e = C.exp([tau, sig]);
	return C.div([e[0] + 1, e[1]], [e[0] - 1, e[1]]);
};
// |dz/dw| = 2|e^w| / |e^w − 1|²
const bipScale = (tau, sig) => {
	const e = C.exp([tau, sig]);
	const d = (e[0] - 1) * (e[0] - 1) + e[1] * e[1];
	return (2 * Math.exp(tau)) / d;
};
const STEP = Math.PI / 8; // the net's spacing, in both τ and σ

// The plate's swimmer: pole at the centre, tail's tip on the circle at 235°.
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP_T = FROM + LEN;
const SCALE0 = Math.exp(-GOLDEN_K * TIP_T);
const TURN0 = (235 * Math.PI) / 180 - TIP_T;

function ring(ctx, w, h, R, u, secs) {
	const view = makeView({ w, h, scale: R });
	const T = (pts) => pts.map(view.to);
	const up = span(u, HIT, HIT + 0.08); // the net brightens with the beat
	const net = lerp(0.55, 0.88, up);
	// The shock: τ of its front, 0 (the line through the centre) → A and B.
	const fr = span(u, HIT + 0.005, HIT + 0.2);
	const front = 4.4 * (1 - (1 - fr) * (1 - fr));
	const shockOn = u > HIT && u < HIT + 0.24;
	const AB = HIT + 0.17; // the front reaches A and B

	// The plate's construction, faint.
	stroke(ctx, T(circlePts(0, 0, 1, 0, TAU, 200)), { color: PAL.rose, width: 2, alpha: 0.7 });
	stroke(
		ctx,
		T([
			[-3, 0],
			[3, 0]
		]),
		{ color: PAL.rose, width: 1.8, alpha: 0.5 }
	);

	// Pink: the Apollonian circles, τ = const — lit as the shock crosses them.
	for (let k = -10; k <= 10; k++) {
		const tau = k * STEP;
		const pts = [];
		for (let i = 0; i <= 320; i++) pts.push(bip(tau, -Math.PI + (TAU * i) / 320));
		const crossed = u > HIT && Math.abs(tau) <= front + 1e-6;
		const hot = crossed ? Math.exp(-Math.max(0, front - Math.abs(tau)) / 0.9) : 0;
		strokeMapped(ctx, view, pts, {
			color: PAL.pink,
			width: 2 + 1.6 * hot * (shockOn ? 1 : 0),
			alpha: Math.min(1, net + 0.3 * hot)
		});
	}
	// Cyan: the circles through A and B, σ = const.
	for (let k = 1; k <= 15; k++) {
		const sig = k * STEP - (k > 8 ? TAU : 0); // σ in (−π, π]
		const pts = [];
		for (let i = 0; i <= 360; i++) pts.push(bip(-9 + (18 * i) / 360, sig));
		strokeMapped(ctx, view, pts, { color: PAL.cyan, width: 2.2, alpha: net });
	}
	// The nodes.
	for (let a = -10; a <= 10; a++) {
		for (let k = 1; k <= 16; k++) {
			const tau = a * STEP;
			const sig = k * STEP;
			const p = bip(tau, sig);
			if (Math.abs(p[0]) > 2.4 || Math.abs(p[1]) > 1.6) continue;
			const rad = Math.min(11, 0.11 * bipScale(tau, sig) * STEP * R);
			if (rad < 0.8) continue;
			const [x, y] = view.to(p);
			disc(ctx, x, y, rad, { fill: PAL.node, alpha: lerp(0.45, 0.8, up) });
		}
	}

	// The shock front and two echoes: the circles ±τ closing on A and B.
	if (shockOn) {
		const fade = 1 - span(u, AB, HIT + 0.24);
		for (const [lag, a0, wd] of [
			[0, 1, 5],
			[0.35, 0.5, 3],
			[0.7, 0.25, 2]
		]) {
			const tau = front - lag;
			if (tau < 0) continue;
			for (const sgn of [-1, 1]) {
				const pts = [];
				for (let i = 0; i <= 320; i++) pts.push(bip(sgn * tau, -Math.PI + (TAU * i) / 320));
				strokeMapped(ctx, view, pts, {
					color: '#fff1f8',
					width: wd,
					alpha: a0 * fade,
					glow: lag ? 0 : 14
				});
			}
		}
	}

	// Gold: the circles through A and B lit in turn, from the segment AB out,
	// written on from both ends.
	const order = [8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
	order.forEach((k, i) => {
		const t0 = AB + 0.02 + 0.017 * Math.floor((i + 1) / 2);
		const wr = easeOut(span(u, t0, t0 + 0.07));
		if (wr <= 0) return;
		const sig = k * STEP - (k > 8 ? TAU : 0);
		const half = (from, to) => {
			const pts = [];
			for (let j = 0; j <= 180; j++) pts.push(bip(from + ((to - from) * j) / 180, sig));
			return pts;
		};
		const opts = { color: PAL.gold, width: 3.4, glow: 9, upto: wr };
		strokeMapped(ctx, view, half(-9, 0), opts);
		strokeMapped(ctx, view, half(9, 0), opts);
	});

	// A and B: fire when the shock closes on them.
	for (const x of [-1, 1]) {
		const [px, py] = view.to([x, 0]);
		const fire = span(u, AB - 0.01, AB + 0.01);
		disc(ctx, px, py, 6, { fill: PAL.node, ring: PAL.ground, ringWidth: 2 });
		if (fire > 0) {
			const pop = Math.exp(-Math.max(0, u - AB) / 0.05);
			lit(ctx, px, py, 7 + 5 * pop, fire);
			bloom(ctx, px, py, R * 0.35 * pop, 'rgba(255, 236, 196, 0.8)', fire * pop);
		}
		math(ctx, x < 0 ? 'A' : 'B', px + 26 * x, py - 28, {
			size: 22,
			align: x < 0 ? 'right' : 'left'
		});
	}

	// The swimmer, poured into its own pole: turned and shrunk by one law
	// (θ ↦ θ + s, r ↦ φ^{2s/π} r), slowly, then all at once as the shock goes.
	const late = Math.max(0, u - (HIT - 0.03));
	const flow = TAU * (2.1 * u + 170 * late * late);
	const gone = 1 - span(u, HIT + 0.05, HIT + 0.09);
	const [ox, oy] = view.to([0, 0]);
	if (u < HIT) orb(ctx, ox, oy, R, span(u, 0.15, HIT));
	if (gone > 0)
		drawSperm(ctx, view, {
			scale: SCALE0 * Math.exp(-GOLDEN_K * flow),
			turn: TURN0 + flow,
			from: FROM,
			length: LEN,
			width: 7.5 * Math.max(0.08, Math.exp(-GOLDEN_K * flow * 0.5)),
			tip: 2.2,
			wiggle: 0.13 * (1 - span(u, 0.25, HIT)),
			phase: secs * 1.7,
			alpha: gone
		});

	// The pole, lit, and Θ stamped beside it.
	if (u >= HIT) lit(ctx, ox, oy, 7, span(u, HIT, HIT + 0.03));
	const st = span(u, HIT + 0.005, HIT + 0.05);
	if (st > 0) theta(ctx, ox + 30, oy - 30, 15 * lerp(3, 1, easeOut(st)), Math.min(1, st * 3));

	impact(ctx, w, h, ox, oy, R, u, HIT, 1, false);
	note(ctx, w, h, R, [
		['|z − A| = e^{τ} |z − B|', span(u, HIT + 0.02, HIT + 0.13)],
		['arg (z − A) / (z − B) = σ', span(u, 0.6, 0.72)]
	]);
}

// ── pinch: the horn torus, where 0 = ∞ ───────────────────────────────────────
// The breath: up fast on the hit, down with a small undershoot, settled.
function breath(u) {
	const k = u - HIT;
	if (k <= 0) return 0;
	return Math.sin(Math.min(1, k / 0.22) * Math.PI) * Math.exp(-k / 0.1) * 1.9;
}

function pinch(ctx, w, h, R, u, secs) {
	const K = GOLDEN_K;
	const br = breath(u);
	const Rt = 1 + 0.34 * br; // the centre circle's radius; the tube's is 1
	const S = 1 + 0.06 * br;
	// The travelling ring: v from π (the pinch, from above) round the outside
	// to −π (the pinch again, from below).
	const go = span(u, HIT + 0.02, 0.86);
	const vw = Math.PI - TAU * easeInOutCubic(go);
	const bump = go > 0 && go < 1 ? 0.12 * Math.sin(go * Math.PI) : 0;
	const vOf = (rho) => -2 * Math.atan(Math.sinh(rho));
	const nrm = (th, v) => [Math.cos(v) * Math.cos(th), Math.cos(v) * Math.sin(th), Math.sin(v)];
	const P = (th, v) => {
		let dv = v - vw;
		dv -= TAU * Math.round(dv / TAU);
		const lift = bump * Math.exp(-(dv * dv) / 0.12);
		const q = (Rt + (1 + lift) * Math.cos(v)) * S;
		return [q * Math.cos(th), q * Math.sin(th), (1 + lift) * Math.sin(v) * S];
	};

	// The lens: almost straight down the horn, closing in; after the beat it
	// pulls back and tilts to show the torus. A slow yaw keeps it alive.
	const back = easeInOutCubic(span(u, 0.5, 0.95));
	const el = (lerp(82, 60, back) * Math.PI) / 180;
	const d = lerp(lerp(4.8, 3.0, smooth(span(u, 0, HIT))), 6.0, back);
	const yaw = -0.5 + 0.35 * u;
	const pos = [
		d * Math.cos(el) * Math.sin(yaw),
		-d * Math.cos(el) * Math.cos(yaw),
		d * Math.sin(el)
	];
	const cam = camera3({ pos, target: [0, 0, 0], up: [0, 0, 1], fov: 40, w, h });

	// What the lens sees: march from a point of the surface toward the lens
	// through the solid torus's distance function; a point is hidden when the
	// march goes inside. (Back faces are hidden this way too.)
	const sdf = (x, y, z) => S * (Math.hypot(Math.hypot(x, y) / S - Rt, z / S) - 1);
	const seen = (p) => {
		const dx = cam.pos[0] - p[0];
		const dy = cam.pos[1] - p[1];
		const dz = cam.pos[2] - p[2];
		const L = Math.hypot(dx, dy, dz);
		let t = 0.035;
		while (t < L) {
			const s = sdf(p[0] + (dx * t) / L, p[1] + (dy * t) / L, p[2] + (dz * t) / L);
			if (s < -0.006) return false;
			t += Math.max(0.012, s);
		}
		return true;
	};

	// The surface, faintly shaded so it reads as a solid: front faces only,
	// far to near.
	const light = norm(add3(add3(mul3(cam.u, 0.65), mul3(cam.r, -0.45)), mul3(cam.f, -0.6)));
	const NT = 72;
	const NV = 44;
	const quads = [];
	for (let i = 0; i < NT; i++) {
		for (let j = 0; j < NV; j++) {
			const t0 = (TAU * i) / NT;
			const t1 = (TAU * (i + 1)) / NT;
			const v0 = -Math.PI + (TAU * j) / NV;
			const v1 = -Math.PI + (TAU * (j + 1)) / NV;
			const tm = (t0 + t1) / 2;
			const vm = (v0 + v1) / 2;
			const c = P(tm, vm);
			const n = nrm(tm, vm);
			const toCam = sub3(cam.pos, c);
			if (dot(n, toCam) <= 0) continue;
			quads.push({
				depth: dot(toCam, toCam),
				lam: Math.max(0, dot(n, light)),
				pts: [P(t0, v0), P(t1, v0), P(t1, v1), P(t0, v1)].map(cam.project)
			});
		}
	}
	quads.sort((a, c) => c.depth - a.depth);
	ctx.save();
	ctx.lineWidth = 0.8;
	ctx.lineJoin = 'round';
	for (const q of quads) {
		const k = Math.pow(q.lam, 1.3);
		const col = `rgb(${Math.round(lerp(19, 50, k))}, ${Math.round(lerp(19, 48, k))}, ${Math.round(lerp(21, 54, k))})`;
		ctx.fillStyle = col;
		ctx.strokeStyle = col;
		ctx.beginPath();
		ctx.moveTo(q.pts[0][0], q.pts[0][1]);
		for (let i = 1; i < 4; i++) ctx.lineTo(q.pts[i][0], q.pts[i][1]);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();

	// A line on the surface: its hidden runs faint and dashed, as the plates
	// draw them.
	const surf = (samples, opts, seeThrough = 0.14) => {
		let run = [];
		let hid = null;
		const hidOpts = { alpha: (opts.alpha ?? 1) * seeThrough, width: 1.2, dash: [3, 6], glow: 0 };
		const flush = () => {
			if (run.length > 1) stroke(ctx, run, hid ? { ...opts, ...hidOpts } : opts);
			run = [];
		};
		for (const [th, v] of samples) {
			const p = P(th, v);
			const q = cam.project(p);
			const isHid = !seen(p);
			if (hid !== null && isHid !== hid) {
				run.push(q);
				flush();
			}
			hid = isHid;
			if (q[2] > 0.01) run.push(q);
		}
		flush();
	};

	// Meridians (the plane's rays) and the equator (|z| = 1), in rose.
	for (let k = 0; k < 12; k++) {
		const th = (TAU * k) / 12;
		const pts = [];
		for (let i = 0; i <= 160; i++) pts.push([th, -Math.PI + (TAU * i) / 160]);
		surf(pts, { color: PAL.rose, width: 1.5, alpha: 0.6 });
	}
	{
		const pts = [];
		for (let i = 0; i <= 160; i++) pts.push([(TAU * i) / 160, 0]);
		surf(pts, { color: PAL.rose, width: 2, alpha: 0.75 });
	}
	// The spiral net: golden loxodromes (cyan) and the other family (pink).
	for (let j = 0; j < N; j++) {
		const cyan = [];
		const pink = [];
		for (let i = 0; i <= 700; i++) {
			const rho = -7 + (14 * i) / 700;
			cyan.push([rho / K + (TAU * j) / N, vOf(rho)]);
		}
		for (let i = 0; i <= 400; i++) {
			const rho = -7 + (14 * i) / 400;
			pink.push([-rho / KP + (TAU * (j + 0.5)) / N, vOf(rho)]);
		}
		surf(pink, { color: PAL.pink, width: 2, alpha: 0.9 });
		surf(cyan, { color: PAL.cyan, width: 2, alpha: 0.9 });
	}
	// The nodes, where seen, sized by their cell on screen.
	for (let l = -26; l <= 26; l++) {
		const rho = l * RING;
		for (let j = 0; j < N; j++) {
			const th = rho / K + (TAU * j) / N;
			const v = vOf(rho);
			const p = P(th, v);
			if (dot(nrm(th, v), sub3(cam.pos, p)) < 0 || !seen(p)) continue;
			const q = cam.project(p);
			const q2 = cam.project(P(th + RING / K, vOf(rho + RING)));
			const rad = Math.min(10, 0.12 * Math.hypot(q2[0] - q[0], q2[1] - q[1]));
			if (rad < 0.8) continue;
			disc(ctx, q[0], q[1], rad, { fill: PAL.node, alpha: 0.85 });
		}
	}

	// The travelling ring, gold.
	if (go > 0 && go < 1) {
		const pts = [];
		for (let i = 0; i <= 200; i++) pts.push([(TAU * i) / 200, vw]);
		const a = Math.sin(go * Math.PI) ** 0.3;
		surf(pts, { color: PAL.gold, width: 4.5, glow: 12, alpha: a }, 0.55);
	}

	// The swimmer: head on a golden loxodrome, diving down the horn.
	const pin = cam.project([0, 0, 0]);
	if (u < HIT) {
		const dive = span(u, 0.2, HIT);
		const rh = lerp(-1.15, -1.6, span(u, 0, 0.2)) - 4.4 * easeIn(dive);
		orb(ctx, pin[0], pin[1], R * 0.8, dive);
		const th = rh / K;
		const live = 0.13 * (1 - dive);
		const tail = [];
		for (let i = 0; i <= 200; i++) {
			const f = i / 200;
			const t = th + 4.2 * f;
			const nudge = live * f * f * Math.sin(TAU * (2.2 * f - secs * 1.7));
			tail.push(cam.project(P(t + nudge, vOf(K * t))));
		}
		const sz = clamp01(Math.exp((rh + 1.9) * 0.45));
		stroke(ctx, tail, { color: PAL.gold, taper: [9 * sz + 1, 1.4] });
		const [hx, hy] = tail[0];
		disc(ctx, hx, hy, 10 * sz + 1, { fill: PAL.gold });
		disc(ctx, hx - 2.6 * sz, hy - 2.6 * sz, 3.4 * sz, { fill: PAL.chalk, alpha: 0.85 });
	} else {
		// The pinch, lit: a point, which the breath opens into a ring for a moment.
		if (br > 0.02) {
			const hole = [];
			for (let i = 0; i <= 120; i++) hole.push(cam.project(P((TAU * i) / 120, Math.PI)));
			stroke(ctx, hole, { color: PAL.gold, width: 4, glow: 14, alpha: Math.min(1, br * 3) });
		}
		lit(ctx, pin[0], pin[1], 7 + 3 * span(u, 0.84, 0.9), span(u, HIT, HIT + 0.03));
	}

	impact(ctx, w, h, pin[0], pin[1], R, u);
	impact(ctx, w, h, pin[0], pin[1], R * 0.6, u, 0.862, 0.45);
	const lab = span(u, 0.87, 0.93);
	if (lab > 0) {
		ctx.save();
		ctx.globalAlpha = 0.8 * lab;
		ctx.fillStyle = PAL.ground;
		ctx.beginPath();
		ctx.ellipse(pin[0] + 78, pin[1] - 2, 60, 22, 0, 0, TAU);
		ctx.fill();
		ctx.restore();
		math(ctx, '0 = ∞', pin[0] + 30, pin[1] - 2, { size: 28, upto: lab });
	}
	note(ctx, w, h, R, [
		['(1 + cos v) e^{iu},   sin v', span(u, 0.08, 0.22)],
		['u = arg z,    tan ½v = −sinh log|z|', span(u, 0.24, 0.36)]
	]);
}
