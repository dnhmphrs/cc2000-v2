import {
	getBoard,
	clearBoard,
	makeView,
	disc,
	bloom,
	PAL,
	TAU,
	PHI,
	GOLDEN_ANGLE,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	math,
	variant,
	camera3,
	note,
	tag
} from './log/board.js';
import { drawSperm } from './log/sperm.js';
import { drawPlate } from './log/plate.js';

// ── Sketch: log-tunnel — then swim down the tunnel ───────────────────────────
// The beat after the swimmer is made: the golden-spiral swimmer (drawSperm —
// the coil its head, the tail tapering, a wave running down it) swims down a
// tunnel made of the golden angle. The tunnel is LOG-PHYLLOTAXIS — seed n at
// angle n · 137.5° and radius e^{−cn} — which on the log cylinder is a
// lattice, so the seed head is its own zoom: the flight into its centre never
// runs out, and the swimmer can be held a steady size on screen the whole way
// down. Three ways of seeing it, one per ?v=:
//
//   plane     (default) the lead's loxodrome plate as a tunnel, head-on: the
//             8-spirals cyan one way and the 13-spirals pink the other (at
//             c = log φ / 18 they cross at right angles, a conformal square
//             net), grey seeds at the crossings growing outward, faint rose
//             rings |z| = φ^{−2k}. It opens on the plate itself (circle, axis,
//             lenses, A, B) with the net written out of its centre; then the
//             lens rides the loxodromic flow z ↦ e^{−(1+iκ)τ} z — along the
//             net's own diagonal, the 21-spiral, so every 21 seeds the
//             picture is exactly itself again — and everything streams out of
//             the centre and turns. The swimmer rides it, head in, turning
//             with it.
//   cylinder  the same lattice on the log cylinder (log z = s + iθ), seen from
//             INSIDE in perspective: the lens starts before the tube's mouth
//             (|z| = 1, the plate's circle) and flies in; the spirals are
//             helices, the rings the tube's labelled ribs, the seeds discs on
//             the wall foreshortened as it turns away, and the zoom-and-turn is
//             a screw down the axis. The lens rides below the axis and looks a
//             little across it, so the far end sits up and right, the swimmer
//             below it, a steady distance ahead.
//   seeds     the sunflower: the seeds denser (c = log φ / 30, the 13-spiral
//             shortest) and laid on a CONE, seen obliquely as a funnel — chalk
//             seeds as foreshortened discs, one 13-spiral of them gold, the 13
//             and 21 parastichies cyan and pink between them. A cone is its own
//             zoom about its apex, so the lens flies straight at the apex (its
//             distance e^{−τ}) and the funnel keeps pouring seeds out of the
//             centre. The swimmer dives for the centre of the seed head.
//
// In all three the flight only GATHERS speed — τ(u) is a closed form whose
// rate climbs from 0.22 to 1.6 e-folds a second — and at the end the swimmer
// outswims the lens into the centre, the orb there brightens and fills the
// frame: the centre beat, which the next sketch takes from there. Ten seconds,
// a pure function of progress: ?at= pins any frame.

const SECONDS = 10;

// ── The flight ───────────────────────────────────────────────────────────────
// τ(u): how many e-folds of zoom the lens has flown by progress u. Its speed
// only gathers — V0 e-folds a second at the start, V1 at the end, on a square
// — so the flight never slows, and τ is a closed form, a pure function of u.
const V0 = 0.22;
const V1 = 1.6;
const flown = (u) => {
	const s = clamp01(u);
	return SECONDS * (V0 * s + ((V1 - V0) * s * s * s) / 3);
};

// ── The lattice ──────────────────────────────────────────────────────────────
// Log-phyllotaxis: seed n at angle θ_n = n·α (α the golden angle) and radius
// r_n = e^{−c n}. On the log cylinder (s = log r, θ) that is a LATTICE, so
// zooming in by e^{c} and turning by α lays it on itself: the seed head is
// its own zoom, and a flight into its centre never runs out. Its
// parastichies — the spirals through every F-th seed — are the lattice's
// short vectors, F a Fibonacci number: straight lines on the cylinder,
// logarithmic spirals (loxodromes) in the plane.
const wrapPi = (a) => a - TAU * Math.round(a / TAU);
function lattice(c) {
	// The step of the F-spiral on the cylinder: Δs = −F c, Δθ = F α (mod 2π).
	const dTheta = (F) => wrapPi(F * GOLDEN_ANGLE);
	// Its slope dθ/ds: θ = θ_j + m (s − s_j) along the spiral through seed j.
	const slope = (F) => dTheta(F) / (-F * c);
	const seed = (n) => [-c * n, n * GOLDEN_ANGLE];
	return { c, dTheta, slope, seed };
}

// The plane's lattice: c = log φ / 18, so every eighteenth seed is a factor φ
// in; at this c the 8- and 13-spirals cross at right angles — a conformal
// square net, as in the lead's plate.
const PLANE = lattice(Math.log(PHI) / 18);
const NET = [
	[13, PAL.pink],
	[8, PAL.cyan]
];
// The flow runs along the net's diagonal, the 21-spiral: z ↦ e^{−21c + iΔθ₂₁} z
// sends seed n to seed n + 21, so the picture repeats itself exactly every 21
// seeds. κ is its turn per e-fold.
const KAPPA = -PLANE.slope(21);

// A polyline drawn in segments, each with its own width and alpha: lines
// that thicken toward the lens and fade into the centre.
function ribbon(ctx, P, W, A, color) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineCap = 'round';
	for (let i = 1; i < P.length; i++) {
		const a = (A[i - 1] + A[i]) / 2;
		if (a <= 0.004) continue;
		ctx.globalAlpha = Math.min(1, a);
		ctx.lineWidth = (W[i - 1] + W[i]) / 2;
		ctx.beginPath();
		ctx.moveTo(P[i - 1][0], P[i - 1][1]);
		ctx.lineTo(P[i][0], P[i][1]);
		ctx.stroke();
	}
	ctx.restore();
}

// The orb at the centre: there from the start, small, brightening as the
// flight gathers (orb), and at the last filling the frame from the centre
// out (fill) — the centre beat, which the next sketch takes from here.
function orb(ctx, x, y, w, h, u) {
	const H = Math.min(w, h);
	const near = smooth(span(u, 0.0, 0.85));
	bloom(ctx, x, y, H * lerp(0.08, 0.17, near), 'rgba(255, 232, 180, 0.9)', lerp(0.5, 0.9, near));
	disc(ctx, x, y, lerp(3, 7, near), { fill: '#fff8e6', alpha: 0.95 });
}
function fill(ctx, x, y, w, h, u) {
	const f = smooth(span(u, 0.8, 1));
	if (f <= 0) return;
	const D = Math.hypot(w, h) / 2;
	const R = D * lerp(0.08, 0.95, f);
	const g = ctx.createRadialGradient(x, y, 0, x, y, R);
	g.addColorStop(0, `rgba(255, 250, 238, ${f})`);
	g.addColorStop(lerp(0.2, 0.45, f), `rgba(255, 244, 220, ${f})`);
	g.addColorStop(0.75, `rgba(250, 226, 170, ${0.45 * f})`);
	g.addColorStop(1, 'rgba(245, 193, 80, 0)');
	ctx.save();
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, TAU);
	ctx.fill();
	ctx.restore();
	bloom(ctx, x, y, R * 1.3, 'rgba(255, 236, 190, 0.5)', 0.6 * f);
}

// The swimmer, posed as the plate has it (log-sperm's spiral): FROM, LEN
// along the golden spiral from the head, so its tip is at TIP.
const FROM = -0.35 * Math.PI;
const LEN = 7.2;
const TIP = FROM + LEN;

// Draw the swimmer with its head (the pole) at `pole` (pixels from the
// screen centre, y up), its tail streaming out behind it away from `toward`,
// `size` px from the head to the tail's tip.
function swimmer(ctx, w, h, { pole, toward = [0, 0], size, body, phase, wiggle, alpha = 1 }) {
	const pv = makeView({ w, h, scale: 1 });
	const dir = Math.atan2(pole[1] - toward[1], pole[0] - toward[0]);
	const o = {
		pole,
		scale: size / Math.exp(GOLDEN_K * TIP),
		turn: dir - TIP + SWIM_TURN,
		from: FROM,
		length: LEN,
		width: Math.max(1.2, size * 0.03),
		tip: Math.max(0.8, size * 0.008),
		body,
		wiggle,
		phase,
		alpha
	};
	// A knockout in the board's colour first, so the net breaks round the
	// swimmer as chalk lines do when one is drawn over another.
	const pad = Math.max(2, size * 0.022);
	drawSperm(ctx, pv, { ...o, color: PAL.ground, width: o.width + pad * 2, tip: o.tip + pad * 2 });
	drawSperm(ctx, pv, o);
}
// The tail's tip sits a little round from straight behind, so the long
// sweep of the tail trails the head rather than wrapping in front of it.
const SWIM_TURN = 0.3;

// The lecture notes sit on a patch of board wiped clean of the net.
function wipe(ctx, w, h) {
	const x = Math.max(28, w * 0.05);
	const y = Math.max(40, h * 0.08);
	ctx.save();
	ctx.translate(x + 230, y + 18);
	ctx.scale(1, 0.3);
	const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 370);
	g.addColorStop(0, 'rgba(21, 21, 21, 0.9)');
	g.addColorStop(0.6, 'rgba(21, 21, 21, 0.7)');
	g.addColorStop(1, 'rgba(21, 21, 21, 0)');
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, 370, 0, TAU);
	ctx.fill();
	ctx.restore();
}

export default async function make({ at }) {
	const v = variant(['plane', 'cylinder', 'seeds']);
	const b = getBoard();
	const time = clock(SECONDS, at);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const secs = time.t;
		if (v === 'plane') plane(ctx, w, h, u, secs);
		else if (v === 'cylinder') cylinder(ctx, w, h, u, secs);
		else seeds(ctx, w, h, u, secs);
		tag(ctx, w, h, `log-tunnel · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── plane: the lead's plate as a tunnel, seen head-on ─────────────────────────
function plane(ctx, w, h, u, secs) {
	const L = PLANE;
	const cx = w / 2;
	const cy = h / 2;
	const H = Math.min(w, h);
	const R0 = 0.42 * H; // the plate's radius at the start: world r = 1
	const lnR0 = Math.log(R0);
	const tau = flown(u);
	const turn = KAPPA * tau;
	const rMax = Math.hypot(w, h) / 2 + 30;
	const plateR = R0 * Math.exp(tau);
	const rOut = Math.min(rMax, plateR); // the net lives inside the plate
	const rIn = 2.5;
	const write = smooth(span(u, 0, 0.16));
	const rWrite = lerp(rIn, rOut, write);
	const at = (s, th) => {
		const r = Math.exp(s + tau + lnR0);
		const a = th + turn;
		return [cx + r * Math.cos(a), cy - r * Math.sin(a), r];
	};
	const fadeIn = (r) => span(r, 4, 46);

	// The plate's own construction — the circle, the axis, the lenses — the
	// first frame is the plate, and the flight carries it out past the lens.
	const pAlpha = 1 - span(tau, 0.15, 1.1);
	if (pAlpha > 0)
		drawPlate(ctx, makeView({ w, h, scale: plateR, rot: turn }), {
			alpha: pAlpha * 0.9,
			theta: false
		});

	// The tunnel's ribs: rings r = φ^{−2k}, faint rose, streaming outward.
	const ring = 2 * Math.log(PHI);
	const k0 = Math.ceil((tau + lnR0 - Math.log(rMax)) / ring);
	for (let k = Math.max(1, k0); ; k++) {
		const r = Math.exp(-k * ring + tau + lnR0);
		if (r < 6) break;
		if (r > rMax) continue;
		const a = 0.42 * fadeIn(r) * span(rWrite, r * 0.6, r);
		if (a <= 0) continue;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.strokeStyle = PAL.rose;
		ctx.lineWidth = Math.min(2.2, 0.8 + r / 300);
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}

	// The two families: pink the 13-spirals, cyan the 8-spirals, through the
	// seeds, written on out of the centre.
	const sIn = Math.log(rIn) - tau - lnR0;
	const sOut = Math.log(rOut) - tau - lnR0;
	for (const [F, color] of NET) {
		const m = L.slope(F);
		for (let j = 0; j < F; j++) {
			const [sj, tj] = L.seed(j);
			const P = [];
			const W = [];
			const A = [];
			for (let s = sIn; s <= sOut + 1e-9; s += 0.03) {
				const p = at(s, tj + m * (s - sj));
				if (p[2] > rWrite) break;
				P.push(p);
				W.push(Math.min(4.2, 0.7 + p[2] / 150));
				A.push(fadeIn(p[2]));
			}
			ribbon(ctx, P, W, A, color);
		}
	}

	// The seeds: grey discs at the crossings, growing outward with r.
	const nLo = Math.ceil((tau + lnR0 - Math.log(rOut + 40)) / L.c);
	const nHi = Math.floor((tau + lnR0 - Math.log(rIn)) / L.c);
	for (let n = Math.max(0, nLo); n <= nHi; n++) {
		const [sn, tn] = L.seed(n);
		const p = at(sn, tn);
		const pop = span(rWrite, p[2] * 0.95, p[2] * 1.15);
		if (pop <= 0) continue;
		disc(ctx, p[0], p[1], Math.min(42, 0.05 * p[2]) * pop, {
			fill: PAL.node,
			alpha: 0.88 * fadeIn(p[2])
		});
	}

	wipe(ctx, w, h);
	note(ctx, w, h, H * 0.42, [
		['θ_{n} = n · 137.5°,   r_{n} = φ^{−n/18}', span(u, 0.06, 0.2)],
		['z ↦ e^{−(1 + iκ)τ} z', span(u, 0.24, 0.36)]
	]);

	orb(ctx, cx, cy, w, h, u);

	// The swimmer: ahead of the lens, head to the centre, riding the flow —
	// turned with it, held a steady size (the zoom is self-similar), until at
	// the last it outswims the lens and dives into the centre.
	const dive = Math.pow(span(u, 0.76, 1), 2) * 5;
	const rho = 0.24 * H * Math.exp(-dive);
	const ang = -2.65 + turn + 0.9 * dive;
	swimmer(ctx, w, h, {
		pole: [rho * Math.cos(ang), rho * Math.sin(ang)],
		size: 0.36 * H * Math.exp(-dive),
		body: 1,
		wiggle: 0.13 * span(u, 0.04, 0.2),
		phase: secs * 1.6 + tau * 0.9
	});

	fill(ctx, cx, cy, w, h, u);
}

// ── cylinder: the same lattice on the log cylinder, from inside ──────────────
// log z = s + iθ rolls the punctured plane into a tube of radius 1, the axis
// along z = s: the plane's zoom is a flight down the tube, its turn a roll
// about the axis (so the loxodromic flow is a SCREW), the log spirals are
// helices and the rings |z| = const are the tube's ribs.
const CYL_D0 = 1.6; // the mouth (s = 0) is this far ahead of the lens at the start
const CYL_EYE = [0.1, -0.34]; // the lens rides a little below the axis
const CYL_LOOK = [-0.13, -0.1]; // and looks a little across it, so the far
// end sits up and to the right of the frame's centre, the swimmer below it

function cylinder(ctx, w, h, u, secs) {
	const L = PLANE;
	const H = Math.min(w, h);
	const tau = flown(u);
	const turn = KAPPA * tau;
	const zc = CYL_D0 - tau;
	const cam = camera3({
		pos: [CYL_EYE[0], CYL_EYE[1], zc],
		target: [CYL_EYE[0] + CYL_LOOK[0], CYL_EYE[1] + CYL_LOOK[1], zc - 1],
		up: [0, 1, 0],
		fov: 72,
		w,
		h
	});
	const f = h / 2 / Math.tan((36 * Math.PI) / 180);
	const P3 = (s, th) => {
		const a = th + turn;
		return [Math.cos(a), Math.sin(a), s];
	};
	// Nearer than this the wall is out of the frame (and, for the tilted
	// lens, could fall behind it).
	const dNear = 0.45;
	const dFar = 13;
	const fog = (d) => Math.pow(1 - span(d, 1.6, dFar), 1.6);
	// Written on down the tube, from the mouth into the dark.
	const write = smooth(span(u, 0, 0.18));
	const dWrite = lerp(CYL_D0 - 0.05, dFar, write);
	const shown = (d) => span(dWrite - d, 0, 0.6);

	// The ribs: rings |z| = φ^{−2k}, labelled as they come.
	const ring = 2 * Math.log(PHI);
	for (let k = 0; ; k++) {
		const s = -k * ring;
		const d = zc - s;
		if (d > dFar) break;
		if (d < dNear) continue;
		const a = (k === 0 ? 0.85 : 0.5) * fog(d) * (k === 0 ? 1 : shown(d));
		if (a <= 0) continue;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.strokeStyle = PAL.rose;
		ctx.lineWidth = Math.min(3.5, Math.max(0.5, (f * (k === 0 ? 0.006 : 0.004)) / d));
		ctx.beginPath();
		for (let i = 0; i <= 120; i++) {
			const q = cam.project([Math.cos((i / 120) * TAU), Math.sin((i / 120) * TAU), s]);
			if (i) ctx.lineTo(q[0], q[1]);
			else ctx.moveTo(q[0], q[1]);
		}
		ctx.stroke();
		ctx.restore();
		// The coordinate on the rib, on its left, for the nearest few.
		const q = cam.project([Math.cos(2.75), Math.sin(2.75), s]);
		const la = a * span(d, 0.7, 1.2) * (1 - span(d, 2.6, 4.2));
		if (la > 0)
			math(ctx, k === 0 ? '|z| = 1' : `|z| = φ^{−${2 * k}}`, q[0] + 10, q[1] + 16, {
				size: Math.max(11, Math.min(24, (f * 0.032) / d)),
				alpha: la * 1.4,
				color: PAL.chalk
			});
	}

	// The helices: pink the 13-spirals, cyan the 8-spirals.
	const sTop = Math.min(0, zc - dNear);
	for (const [F, color] of NET) {
		const m = L.slope(F);
		for (let j = 0; j < F; j++) {
			const [sj, tj] = L.seed(j);
			const P = [];
			const W = [];
			const A = [];
			for (let s = sTop; ;) {
				const d = zc - s;
				if (d > Math.min(dFar, dWrite)) break;
				P.push(cam.project(P3(s, tj + m * (s - sj))));
				W.push(Math.min(7, Math.max(0.5, (f * 0.0085) / d)));
				A.push(fog(d) * shown(d));
				s -= Math.max(0.01, 0.03 * d);
			}
			ribbon(ctx, P, W, A, color);
		}
	}

	// The seeds: discs on the wall, foreshortened as the wall turns away,
	// drawn far to near.
	const nLo = Math.max(0, Math.ceil(-sTop / L.c));
	const nHi = Math.floor((dFar - zc) / L.c);
	for (let n = nHi; n >= nLo; n--) {
		const [sn, tn] = L.seed(n);
		const d = zc - sn;
		if (d < dNear) continue;
		const al = 0.9 * fog(d) * shown(d);
		if (al <= 0) continue;
		const a = tn + turn;
		const p = [Math.cos(a), Math.sin(a), sn];
		const e = 0.05;
		ellipse(
			ctx,
			cam.project(p),
			cam.project([p[0] - e * Math.sin(a), p[1] + e * Math.cos(a), sn]),
			cam.project([p[0], p[1], sn + e]),
			PAL.node,
			al
		);
	}

	const vp = cam.project([CYL_EYE[0], CYL_EYE[1], zc - 1e7]);
	const cx = vp[0];
	const cy = vp[1];

	wipe(ctx, w, h);
	note(ctx, w, h, H * 0.42, [
		['log z = s + iθ :  the plane, rolled into a tube', span(u, 0.06, 0.2)],
		['zoom and turn are a screw:  s ↦ s − τ,  θ ↦ θ + κτ', span(u, 0.24, 0.38)]
	]);

	orb(ctx, cx, cy, w, h, u);

	// The swimmer, ahead of the lens and below the axis, head down the tube,
	// at a steady distance ahead — until it pulls away into the dark.
	const dive = Math.pow(span(u, 0.76, 1), 2) * 4.5;
	const k = Math.exp(-dive);
	const ang = -2.3 + 0.5 * turn + 0.8 * dive;
	const ox = cx - w / 2;
	const oy = -(cy - h / 2);
	swimmer(ctx, w, h, {
		pole: [ox + 0.24 * H * k * Math.cos(ang), oy + 0.24 * H * k * Math.sin(ang)],
		toward: [ox, oy],
		size: 0.36 * H * k,
		body: 1,
		wiggle: 0.13 * span(u, 0.04, 0.2),
		phase: secs * 1.6 + tau * 0.9
	});

	fill(ctx, cx, cy, w, h, u);
}

// A disc in 3D, as the ellipse its two tangent steps project to: q is the
// centre on screen, q1 and q2 the ends of two perpendicular radii.
function ellipse(ctx, q, q1, q2, color, alpha) {
	const ax = q1[0] - q[0];
	const ay = q1[1] - q[1];
	const bx = q2[0] - q[0];
	const by = q2[1] - q[1];
	if (Math.abs(ax * by - ay * bx) < 0.05) return;
	if (Math.hypot(ax, ay) > 500 || Math.hypot(bx, by) > 500) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.fillStyle = color;
	ctx.translate(q[0], q[1]);
	ctx.transform(ax, ay, bx, by, 0, 0);
	ctx.beginPath();
	ctx.arc(0, 0, 1, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// ── seeds: the seed head as a funnel ─────────────────────────────────────────
// The same golden-angle seeds, denser — c = log φ / 30, where 13 is the
// shortest spiral and 8 and 21 the next — laid on a CONE, height = k r. A
// cone is its own zoom about its apex, so a lens flying straight at the apex
// (its distance e^{−τ}) sees the same funnel at every depth, and the seeds
// keep coming out of the centre as fast as they pour past the frame.
const SEEDS = lattice(Math.log(PHI) / 30);
const SEED_NET = [
	[21, PAL.pink],
	[13, PAL.cyan]
];
const SEED_KAPPA = -SEEDS.slope(34); // the flow along the 34-spiral
const SEED_K = 0.5; // the funnel's slope
const SEED_BETA = (32 * Math.PI) / 180; // the lens's angle off the funnel's axis

function seeds(ctx, w, h, u, secs) {
	const L = SEEDS;
	const H = Math.min(w, h);
	const tau = flown(u);
	const turn = SEED_KAPPA * tau;
	const D = Math.exp(-tau);
	const cam = camera3({
		pos: [0, D * Math.cos(SEED_BETA), -D * Math.sin(SEED_BETA)],
		target: [0, 0, 0],
		up: [0, 1, 0],
		fov: 54,
		w,
		h
	});
	const P3 = (s, th) => {
		const r = Math.exp(s);
		const a = th + turn;
		return [r * Math.cos(a), SEED_K * r, r * Math.sin(a)];
	};
	// The seeds from the centre out to the rim of the frame; written on out
	// of the centre at the start.
	const write = smooth(span(u, 0, 0.16));
	const sTop = Math.log(D * 1.25);
	const sBot = Math.log(D / 90);
	const sWrite = lerp(sBot, sTop + 0.6, write);
	const near = (q) => q[2] > 0.25 * D;
	// The size a seed of radius 0.075 r shows at, px: fades in out of the
	// centre and out again as it nears the lens.
	const seen = (px) => span(px, 0.8, 3) * (1 - span(px, 80, 110));

	for (const [F, color] of SEED_NET) {
		const m = L.slope(F);
		for (let j = 0; j < F; j++) {
			const [sj, tj] = L.seed(j);
			const P = [];
			const W = [];
			const A = [];
			for (let s = sBot; s <= Math.min(sTop, sWrite); s += 0.025) {
				const q = cam.project(P3(s, tj + m * (s - sj)));
				if (!near(q)) break;
				const px = (Math.exp(s) / q[2]) * (h / 2 / Math.tan((27 * Math.PI) / 180));
				P.push(q);
				W.push(Math.min(3.6, Math.max(0.5, px * 0.022)));
				A.push(span(px, 8, 50));
			}
			ribbon(ctx, P, W, A, color);
		}
	}

	// The seeds, far to near: chalk, and the 13-spiral the swimmer rides in
	// on, gold.
	const nLo = Math.ceil(-sTop / L.c);
	const nHi = Math.floor(-sBot / L.c);
	const items = [];
	for (let n = nLo; n <= nHi; n++) {
		const [sn, tn] = L.seed(n);
		if (sn > sWrite) continue;
		const p = P3(sn, tn);
		const q = cam.project(p);
		if (!near(q)) continue;
		items.push([n, q, p, sn, tn]);
	}
	items.sort((a, b) => b[1][2] - a[1][2]);
	const sl = Math.hypot(1, SEED_K);
	for (const [n, q, p, sn, tn] of items) {
		const r = Math.exp(sn);
		const a = tn + turn;
		const e = 0.075 * r;
		const q1 = cam.project([p[0] - e * Math.sin(a), p[1], p[2] + e * Math.cos(a)]);
		const q2 = cam.project([
			p[0] + (e * Math.cos(a)) / sl,
			p[1] + (e * SEED_K) / sl,
			p[2] + (e * Math.sin(a)) / sl
		]);
		const px = Math.hypot(q1[0] - q[0], q1[1] - q[1]);
		const al = seen(px);
		if (al <= 0) continue;
		const gold = n % 13 === 0;
		ellipse(ctx, q, q1, q2, gold ? PAL.gold : PAL.node, al * (gold ? 1 : 0.92));
	}

	const apex = cam.project([0, 0, 0]);

	wipe(ctx, w, h);
	note(ctx, w, h, H * 0.42, [
		['θ_{n} = n · 137.5°,   r_{n} = φ^{−n/30}', span(u, 0.06, 0.2)],
		['13 spirals one way, 21 the other', span(u, 0.24, 0.36)]
	]);

	orb(ctx, apex[0], apex[1], w, h, u);

	const dive = Math.pow(span(u, 0.76, 1), 2) * 5;
	const k = Math.exp(-dive);
	const ang = -2.3 + turn * 0.5 + 0.9 * dive;
	swimmer(ctx, w, h, {
		pole: [
			apex[0] - w / 2 + 0.22 * H * k * Math.cos(ang),
			-(apex[1] - h / 2) + 0.22 * H * k * Math.sin(ang)
		],
		toward: [apex[0] - w / 2, -(apex[1] - h / 2)],
		size: 0.34 * H * k,
		body: 1,
		wiggle: 0.13 * span(u, 0.04, 0.2),
		phase: secs * 1.6 + tau * 0.9
	});

	fill(ctx, apex[0], apex[1], w, h, u);
}
