import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	math,
	PAL,
	TAU,
	MATH_FONT,
	span,
	smooth,
	lerp,
	easeInOutCubic,
	clock,
	variant,
	note,
	tag
} from './log/board.js';
import { drawPlate } from './log/plate.js';

// ── Sketch: log-orb — the data entry, as two steps toward the orb ────────────
// The site asks two things — a birthday and a spice — and no swimmer is on
// screen while it does (it would give the joke away). Instead there is the
// board and, at its centre, a glowing ORB: a bright disc in a warm bloom and a
// cold haze, breathing slowly, with a halo of log-spaced rings that breathe out
// of it. Each question is written on below the orb in chalk on a wiped patch
// of the board, its answer typed into the blank as a COORDINATE (t₀ = …,
// σ = …), and on entry the view takes ONE logarithmic zoom step into the orb:
// the board's geometry slides outward past the edges (a zoom is a slide in
// log coordinates), the prompt rides out with it, and the orb comes closer.
// What was entered stays in the top right corner as the board's givens.
// Ten seconds: a still opening (orb far, the geometry written on out of it),
// step one at u ≈ 0.32, step two at u ≈ 0.66, then a hold close on the orb —
// the frame the swimmer appears in, elsewhere. One geometry per ?v=:
//
//   net      (default) the orb is the pole of the lead's loxodrome net: eight
//            cyan spirals θ = 2 log r + 2πk/8 coiling round it and eight pink
//            θ = −½ log r + 2πj/8 running out of it like spokes (slopes 2 and
//            −½ in log coordinates, so they cross at right angles), grey nodes
//            at the crossings growing with r, over the faint rose plate (circle,
//            axis, lenses through A, B and the pole). The net goes to itself
//            under z ↦ λz, λ = e^{(3 + i)π/10} — a zoom of 2.57 and a turn of
//            18°, loxodromic — so each step is exactly that: the same net,
//            closer and turned, the plates nested one λ apart so the next one
//            in arrives level where the last one was. A ring of gold runs
//            through the nodes into the orb along each step.
//   rings    the complex log's own picture of the punctured plane: cyan rings
//            r = 2^{−k} and pink rays θ = jπ/4, labelled (1, 2^{−1}, 2^{−2} …;
//            θ = 0, π/2, π, 3π/2) — under w = log z, vertical and horizontal
//            lines, cells of log 2 by π/4, nearly square. Each answer slides in
//            by exactly one ring (z ↦ 2z, w ↦ w + log 2): the ring that takes
//            the last one's place goes gold, and the labels count on by one —
//            the clean blackboard version. (Factor 2, not e: at e only two
//            rings are left on screen round the orb once it is close.)
//   calendar time as a log spiral round the orb, z ∝ (t − t_c)^{½ − 2πi}: a
//            turn for every factor e of age, r = √(t − t_c), clockwise like a
//            clock, the years labelled along it out to "now". The birthday is
//            marked on it as t₀ when entered; on the second answer 38 gold
//            beads, a week apiece, count the 266 days back along it to t_c,
//            which winds in for ever: the pole, the orb, IS the moment of
//            conception, and turns gold. Each step zooms toward it by e (two
//            turns: the age ÷ e²).
//
// A pure function of progress u: ?at= pins any frame exactly.

const SECONDS = 10;

// The answers, as the site would take them.
const BIRTH = { q: 'when were you born?', key: 't_{0} = ', val: '14 · 02 · 1987' };
const SPICE = { q: 'name a spice', key: 'σ = ', val: 'saffron' };

// The beats, in progress u.
const T = {
	write: [0, 0.13],
	q1: [0.07, 0.13],
	a1: [0.15, 0.235],
	step1: [0.26, 0.38],
	q2: [0.41, 0.47],
	a2: [0.49, 0.565],
	step2: [0.6, 0.72],
	hold: [0.72, 1]
};
const beat = (u, [a, b]) => span(u, a, b);
const ease = (u, s) => easeInOutCubic(beat(u, s));
// A bump of light at u0, width wd.
const bump = (u, u0, wd) => Math.exp(-(((u - u0) / wd) ** 2));

// The log of the zoom at u: one step of ln F per answer, eased, and a slow
// creep in over the hold so the last frames are not frozen.
const zoomLog = (u, lnF, creep = 0.14) =>
	lnF * (ease(u, T.step1) + ease(u, T.step2)) + creep * smooth(beat(u, T.hold));

export default async function make({ at }) {
	const v = variant(['net', 'rings', 'calendar']);
	const b = getBoard();
	const time = clock(SECONDS, at);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const secs = time.t;
		if (v === 'net') net(ctx, w, h, u, secs);
		else if (v === 'rings') rings(ctx, w, h, u, secs);
		else calendar(ctx, w, h, u, secs);
		givens(ctx, w, h, u);
		tag(ctx, w, h, `log-orb · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The orb ──────────────────────────────────────────────────────────────────
// A soft light with a smooth falloff (the kit's bloom has a flat shoulder).
function glow(ctx, x, y, r, rgb, a) {
	if (r <= 0 || a <= 0) return;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	const g = ctx.createRadialGradient(x, y, 0, x, y, r);
	const c = (k) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a * k})`;
	g.addColorStop(0, c(1));
	g.addColorStop(0.12, c(0.6));
	g.addColorStop(0.3, c(0.24));
	g.addColorStop(0.55, c(0.07));
	g.addColorStop(1, c(0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU);
	ctx.fill();
	ctx.restore();
}

const mix = (a, b, t) => a.map((x, i) => Math.round(lerp(x, b[i], t)));
const css = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

// The orb at (x, y), radius r px: breathing on the clock, a halo of
// log-spaced rings breathing out of it (half of them dashed and turning),
// `flare` a beat of light, `gold` how far its light has turned to gold,
// `halo` how strong the rings are.
function drawOrb(ctx, x, y, r, secs, { flare = 0, gold = 0, halo = 1 } = {}) {
	const br = 1 + 0.07 * Math.sin((TAU * secs) / 3.4) + 0.025 * Math.sin((TAU * secs) / 1.3 + 1.1);
	const R = r * br * (1 + 0.45 * flare);
	const core = mix([255, 236, 200], [255, 196, 90], gold);
	const warm = mix([255, 186, 118], [245, 170, 50], gold);
	glow(ctx, x, y, Math.max(90, R * 24), [128, 104, 214], 0.22 + 0.08 * flare); // the cold haze
	glow(ctx, x, y, Math.max(40, R * 9), warm, 0.45 + 0.3 * flare);
	glow(ctx, x, y, R * 3.2, core, 0.8);
	// The halo: rings at R·e^{0.36 s}, s sliding out on the clock.
	const ph = (secs * 0.21) % 1;
	ctx.save();
	for (let j = 0; j < 5; j++) {
		const s = j + ph;
		const rr = R * 1.7 * Math.exp(0.36 * s);
		const a = halo * 0.4 * (1 - s / 5) * smooth(s / 0.7) * (1 - span(rr, 220, 420));
		if (a <= 0.005) continue;
		ctx.globalAlpha = a;
		ctx.strokeStyle = j % 2 ? PAL.rose : css(mix([245, 193, 80], [255, 230, 180], 0.4));
		ctx.lineWidth = Math.max(0.8, Math.min(1.6, R * 0.1));
		ctx.setLineDash(j % 2 ? [rr * 0.2, rr * 0.13] : []);
		ctx.lineDashOffset = (j % 4 === 1 ? 1 : -1) * secs * rr * 0.12;
		ctx.beginPath();
		ctx.arc(x, y, rr, 0, TAU);
		ctx.stroke();
	}
	ctx.restore();
	// The body: a ball of light, white at the heart, warm at the limb, and
	// the limb itself soft, so close up it is a light and not a plate.
	ctx.save();
	const g = ctx.createRadialGradient(x - R * 0.16, y - R * 0.18, 0, x, y, R * 1.06);
	g.addColorStop(0, '#ffffff');
	g.addColorStop(0.42, css(mix(core, [255, 255, 255], 0.55)));
	g.addColorStop(0.8, css(core));
	g.addColorStop(0.93, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0.75)`);
	g.addColorStop(1, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0)`);
	ctx.fillStyle = g;
	ctx.shadowColor = css(core);
	ctx.shadowBlur = Math.min(60, R * 1.6);
	ctx.beginPath();
	ctx.arc(x, y, R * 1.06, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// ── Lines that fade into the orb ─────────────────────────────────────────────
// A polyline in chunks, each at the alpha `fade` gives its middle's radius
// from the orb, so the lines dissolve into the light rather than knotting.
function strokeFade(ctx, P, Rpx, fade, opts, chunk = 6) {
	const a0 = opts.alpha ?? 1;
	for (let i = 0; i < P.length - 1; i += chunk) {
		const j = Math.min(P.length - 1, i + chunk);
		const a = fade(Rpx[(i + j) >> 1]);
		if (a <= 0.01) continue;
		stroke(ctx, P.slice(i, j + 1), { ...opts, alpha: a0 * a, cap: 'butt' });
	}
}

// ── The prompt ───────────────────────────────────────────────────────────────
// A question and its blank, written on a wiped patch of the board below the
// orb. It is anchored in the WORLD where the view at rest before its step
// (`rest`) puts it, so when the step zooms the patch grows and slides out past
// the bottom edge with the geometry — flown past — while the next prompt is
// written where it was.
const fontOf = (size) => `italic 400 ${size}px ${MATH_FONT}`;

function drawPrompt(ctx, view, rest, h, P, { q, a, enter, alpha, secs }) {
	if (alpha <= 0.01 || q <= 0) return;
	const k = view.scale / rest.scale;
	const [px, py] = view.to(rest.from([rest.cx, rest.cy + 0.3 * h]));
	if (py - 60 * k > h + 40) return;
	const qs = 18 * k;
	const as = 30 * k;
	ctx.save();
	ctx.font = fontOf(qs);
	const Wq = ctx.measureText(P.q).width;
	ctx.font = fontOf(as);
	const Wv = ctx.measureText(P.val).width;
	ctx.restore();
	const Wk = math(ctx, P.key, 0, -999, { size: as, alpha: 0 });
	const W = Math.max(Wq, Wk + Wv) + 90 * k;
	const H = 136 * k;
	// The wiped patch: the board, cleaner, with a soft edge.
	ctx.save();
	ctx.globalAlpha = alpha * smooth(q * 3);
	ctx.fillStyle = PAL.ground;
	ctx.filter = `blur(${Math.round(16 * k)}px)`;
	ctx.beginPath();
	ctx.roundRect(px - W / 2, py - H / 2, W, H, 26 * k);
	ctx.fill();
	ctx.restore();
	// The question, written on.
	math(ctx, P.q, px, py - 26 * k, { size: qs, upto: q, alpha: 0.7 * alpha, align: 'center' });
	// The coordinate's name, then the answer typed into its blank.
	const x0 = px - (Wk + Wv) / 2;
	const ya = py + 16 * k;
	const kq = span(q, 0.55, 1);
	math(ctx, P.key, x0, ya, { size: as, upto: kq, alpha: alpha * 0.95 });
	const xv = x0 + Wk;
	stroke(
		ctx,
		[
			[xv, ya + 20 * k],
			[xv + Wv, ya + 20 * k]
		],
		{ color: PAL.chalk, width: 1.4 * k, alpha: 0.32 * alpha * kq, dash: [5 * k, 6 * k] }
	);
	if (enter > 0)
		stroke(
			ctx,
			[
				[xv, ya + 20 * k],
				[xv + Wv, ya + 20 * k]
			],
			{ color: PAL.gold, width: 2.6 * k, alpha, upto: enter, glow: 8 }
		);
	math(ctx, P.val, xv, ya, { size: as, upto: a, alpha, color: PAL.chalk });
	// The cursor: steady while typing, blinking while it waits.
	if (kq >= 1 && enter < 1) {
		const n = Math.floor(a * P.val.length + 1e-6);
		ctx.save();
		ctx.font = fontOf(as);
		const xt = xv + ctx.measureText(P.val.slice(0, n)).width + 4 * k;
		ctx.restore();
		const on = (a > 0 && a < 1) || (secs * 1.7) % 1 < 0.55;
		if (on)
			stroke(
				ctx,
				[
					[xt, ya - 14 * k],
					[xt, ya + 13 * k]
				],
				{ color: PAL.chalk, width: 2 * k, alpha: 0.85 * alpha, cap: 'butt' }
			);
	}
}

// Both prompts, from the beats: each at the view its step starts from.
function prompts(ctx, view, rest1, rest2, h, u, secs) {
	drawPrompt(ctx, view, rest1, h, BIRTH, {
		q: beat(u, T.q1),
		a: beat(u, T.a1),
		enter: beat(u, [T.a1[1] + 0.005, T.step1[0] + 0.01]),
		alpha: 1 - smooth(span(u, T.step1[0] + 0.02, T.step1[0] + 0.085)),
		secs
	});
	drawPrompt(ctx, view, rest2, h, SPICE, {
		q: beat(u, T.q2),
		a: beat(u, T.a2),
		enter: beat(u, [T.a2[1] + 0.005, T.step2[0] + 0.01]),
		alpha: 1 - smooth(span(u, T.step2[0] + 0.02, T.step2[0] + 0.085)),
		secs
	});
}

// The givens: what has been entered, kept in the top right corner.
function givens(ctx, w, h, u) {
	const x = w - Math.max(28, w * 0.05);
	const y = Math.max(40, h * 0.08);
	const g1 = span(u, T.step1[0] + 0.02, T.step1[0] + 0.08);
	const g2 = span(u, T.step2[0] + 0.02, T.step2[0] + 0.08);
	const sz = 19;
	if (g1 > 0)
		math(ctx, `${BIRTH.key}${BIRTH.val}`, x, y, { size: sz, alpha: 0.85 * g1, align: 'right' });
	if (g2 > 0)
		math(ctx, `${SPICE.key}${SPICE.val}`, x, y + 32, {
			size: sz,
			alpha: 0.85 * g2,
			align: 'right'
		});
}

// The orb's beats: a flare as each step lands, and the halo's breath.
const flareAt = (u) => bump(u, T.step1[1] - 0.012, 0.03) + bump(u, T.step2[1] - 0.012, 0.03);

// ── net: the pole of the loxodrome net ───────────────────────────────────────
// Cyan θ = 2 log r + 2πk/8 coil round the pole; pink θ = −½ log r + 2πj/8
// run out of it like spokes; slopes 2 and −½ in log coordinates, so they
// cross at right angles. The net goes to itself under z ↦ λz exactly when
// arg λ − 2 log|λ| and arg λ + ½ log|λ| are both multiples of 2π/8: the step
// λ = e^{(3 + i)π/10} — a zoom of 2.57 and a turn of 18°, loxodromic — is the
// smallest such step that is mostly zoom.
const NET = { n: 8, a: 2, dRho: (3 * Math.PI) / 10, dTh: Math.PI / 10, rot: -0.3 };

function net(ctx, w, h, u, secs) {
	const { n, a, dRho, dTh } = NET;
	const S0 = 0.47 * h; // the plate's circle, r = 1
	const z = zoomLog(u, dRho) / dRho; // steps taken, 0..2 (and the creep)
	const viewAt = (zz) =>
		makeView({ w, h, scale: S0 * Math.exp(dRho * zz), rot: NET.rot + dTh * zz });
	const view = viewAt(z);
	const S = view.scale;
	const cx = w / 2;
	const cy = h / 2;
	const ORB = 6 / S0;
	const orbPx = ORB * S;
	const diag = Math.hypot(w, h) / 2;
	const write = smooth(beat(u, T.write));
	const rhoLo = Math.log(Math.max(ORB * 1.02, 5 / S));
	const rhoHi = Math.log(Math.min(1, (diag * 1.04) / S));
	const rhoW = lerp(rhoLo, rhoHi, write);
	const fade = (rpx) => smooth(span(rpx, orbPx * 1.2, orbPx * 1.2 + 36));
	const P = (rho, th) => {
		const r = Math.exp(rho);
		return view.to([r * Math.cos(th), r * Math.sin(th)]);
	};

	// The rose plates, one step λ apart: each one in is the last one, closer.
	for (let j = 0; j < 4; j++) {
		const Rpx = Math.exp(-dRho * j) * S;
		const al = span(Rpx, 50, 150) * (1 - span(Rpx, 0.75 * h, 1.25 * h));
		if (al <= 0) continue;
		// Level when it arrives: the turn the steps have taken, less its own.
		const pv = makeView({ w, h, scale: S * Math.exp(-dRho * j), rot: dTh * (z - j) });
		drawPlate(ctx, pv, {
			upto: beat(u, [0.02, 0.16]),
			alpha: 0.6 * al,
			labels: j === 0,
			theta: false
		});
	}

	// The two families, written outward from the pole.
	for (const [slope, color] of [
		[-1 / a, PAL.pink],
		[a, PAL.cyan]
	]) {
		for (let k = 0; k < n; k++) {
			const pts = [];
			const Rp = [];
			for (let rho = rhoLo; rho <= rhoW + 1e-9; rho += 0.01) {
				pts.push(P(rho, slope * rho + (TAU * k) / n));
				Rp.push(Math.exp(rho) * S);
			}
			strokeFade(ctx, pts, Rp, fade, { color, width: 2.5, alpha: 0.95 });
		}
	}

	// The nodes: cyan k meets pink j at log r = 2π(j − k)/(8 · 5/2) = πm/10;
	// discs that grow with r. A ring of gold runs through them into the orb
	// along each step.
	const fronts = [T.step1, T.step2]
		.map((s) => beat(u, s))
		.filter((zz) => zz > 0 && zz < 1)
		.map((zz) => ({
			r: Math.exp(lerp(Math.log(diag * 1.1), Math.log(orbPx * 1.5 + 8), easeInOutCubic(zz))),
			a: Math.sin(Math.PI * zz) ** 0.5
		}));
	const dm = TAU / n / (a + 1 / a);
	const mLo = Math.ceil(rhoLo / dm);
	const mHi = Math.floor(Math.min(rhoW, rhoHi) / dm);
	for (let m = mLo; m <= mHi; m++) {
		const rho = m * dm;
		const rpx = Math.exp(rho) * S;
		const al = fade(rpx) * smooth((rhoW - rho) / 0.25);
		if (al <= 0.01) continue;
		let gold = 0;
		for (const fr of fronts) gold = Math.max(gold, fr.a * bump(Math.log(rpx / fr.r), 0, 0.28));
		const size = Math.max(1.4, Math.min(24, 0.04 * rpx)) * (1 + 0.3 * gold);
		for (let j = 0; j < n; j++) {
			const [x, y] = P(rho, -rho / a + (TAU * j) / n);
			if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;
			disc(ctx, x, y, size, { fill: PAL.node, alpha: 0.8 * al * (1 - gold) });
			if (gold > 0.02) disc(ctx, x, y, size, { fill: PAL.gold, alpha: al * gold, glow: 16 * gold });
		}
	}

	drawOrb(ctx, cx, cy, orbPx, secs, { flare: flareAt(u) });
	prompts(ctx, view, viewAt(0), viewAt(1), h, u, secs);
	note(ctx, w, h, 0.42 * Math.min(w, h), [
		['θ = 2 log r + 2πk/8,   θ = −½ log r + 2πj/8', beat(u, [0.04, 0.12])],
		['z ↦ λz,   λ = e^{(3 + i)π/10}', beat(u, [0.27, 0.37])]
	]);
}

// ── rings: the punctured plane, in its log coordinates ───────────────────────
// Rings r = 2^{−k} and rays θ = jπ/4: under w = log z the rings are the
// vertical lines Re w = −k log 2 and the rays the horizontal Im w = jπ/4,
// cells of log 2 by π/4 — nearly square, so nearly conformal squares here.
// A step of z ↦ 2z is w ↦ w + log 2: one ring.
function rings(ctx, w, h, u, secs) {
	const lnF = Math.LN2; // exactly one ring
	const S0 = 0.7 * h; // the ring r = 1
	const viewAt = (zz) => makeView({ w, h, scale: S0 * Math.exp(lnF * zz) });
	const view = viewAt(zoomLog(u, lnF) / lnF);
	const S = view.scale;
	const cx = w / 2;
	const cy = h / 2;
	const ORB = 9 / S0;
	const orbPx = ORB * S;
	const diag = Math.hypot(w, h) / 2;
	const fade = (rpx) => smooth(span(rpx, orbPx * 1.5, orbPx * 1.5 + 30));
	const kLo = Math.ceil(Math.log2(S / (diag * 1.05)));
	const kHi = Math.floor(Math.log2(S / (orbPx * 1.6)));
	// Which ring is sliding into the last one's place, and how gold it is.
	const slide = [T.step1, T.step2].map((s, i) => ({ k: i + 2, g: Math.sin(Math.PI * beat(u, s)) }));
	const goldOf = (k) => slide.reduce((g, s) => (s.k === k ? Math.max(g, s.g) : g), 0);

	// The rays, θ = jπ/4, written outward from the orb.
	const rayIn = orbPx * 1.3;
	for (let j = 0; j < 8; j++) {
		const th = (j * Math.PI) / 4;
		const P = [];
		const Rp = [];
		for (let i = 0; i <= 80; i++) {
			const rpx = rayIn * Math.pow((diag * 1.05) / rayIn, i / 80);
			P.push([cx + rpx * Math.cos(th), cy - rpx * Math.sin(th)]);
			Rp.push(rpx);
		}
		const up = smooth(beat(u, [0.03, 0.12]));
		const n = Math.max(2, Math.round(P.length * up));
		strokeFade(ctx, P.slice(0, n), Rp, fade, { color: PAL.pink, width: 2.2, alpha: 0.9 }, 4);
	}
	// The rings r = 2^{−k}, the innermost written first.
	for (let k = kLo; k <= kHi; k++) {
		const rpx = Math.pow(2, -k) * S;
		const t0 = 0.012 * Math.max(0, 5 - k);
		const g = goldOf(k);
		const P = [];
		for (let i = 0; i <= 220; i++) {
			const an = (i / 220) * TAU;
			P.push([cx + rpx * Math.cos(an), cy - rpx * Math.sin(an)]);
		}
		const up = smooth(beat(u, [t0, t0 + 0.06]));
		const al = fade(rpx);
		stroke(ctx, P, { color: PAL.cyan, width: 2.4, alpha: 0.95 * al * (1 - g), upto: up });
		if (g > 0.01)
			stroke(ctx, P, { color: PAL.gold, width: 3.2, alpha: al * g, upto: up, glow: 12 });
		// The nodes where it crosses the rays.
		const ns = Math.max(1.3, Math.min(13, 0.03 * rpx));
		for (let j = 0; j < 8; j++) {
			const th = (j * Math.PI) / 4;
			disc(ctx, cx + rpx * Math.cos(th), cy - rpx * Math.sin(th), ns, {
				fill: g > 0.4 ? PAL.gold : PAL.node,
				alpha: 0.85 * al * smooth(beat(u, [t0 + 0.04, t0 + 0.08]))
			});
		}
		// Its label, where it crosses θ = 0.
		if (rpx > 48) {
			const la = span(rpx, 48, 76) * span(u, t0 + 0.05, t0 + 0.1);
			math(ctx, k === 0 ? '1' : `2^{−${k}}`, cx + rpx + 10, cy - 19, {
				size: 20,
				alpha: 0.92 * la,
				color: g > 0.4 ? PAL.gold : PAL.chalk
			});
		}
	}
	// The rays' labels, at the edges: an angle does not change with a zoom.
	const ra = 0.85 * span(u, 0.1, 0.16);
	math(ctx, 'θ = 0', w - 28, cy + 28, { size: 18, alpha: ra, align: 'right' });
	math(ctx, 'θ = π/2', cx + 14, 30, { size: 18, alpha: ra });
	math(ctx, 'θ = π', 28, cy + 28, { size: 18, alpha: ra });
	math(ctx, 'θ = 3π/2', cx + 14, h - 30, { size: 18, alpha: ra });

	drawOrb(ctx, cx, cy, orbPx, secs, { flare: flareAt(u), halo: 0.35 });
	prompts(ctx, view, viewAt(0), viewAt(1), h, u, secs);
	note(ctx, w, h, 0.42 * Math.min(w, h), [
		['w = log z = log r + iθ', beat(u, [0.04, 0.12])],
		['z ↦ 2z   ⇔   w ↦ w + log 2', beat(u, [0.27, 0.37])]
	]);
}

// ── calendar: time as a log spiral round the orb ─────────────────────────────
// z ∝ (t − t_c)^{½ − 2πi}: r = √(t − t_c) years, θ = θ₀ − 2π log(t − t_c) —
// clockwise as time runs, a turn for each factor e of age. Its pole is t_c.
const YEAR = 365.25;
const T_C = 1986 + 143 / 365; // 24 · 05 · 1986
const T_0 = 1987 + 44 / 365; // 14 · 02 · 1987, 266 days on
const T_NOW = 2026.75;
const AGE_B = T_0 - T_C; // 266 days, in years
const AGE_NOW = T_NOW - T_C;
const TH0 = (200 * Math.PI) / 180 + TAU * Math.log(AGE_B); // the birthday at 200°

const spiralAt = (age) => {
	const r = Math.sqrt(age);
	const th = TH0 - TAU * Math.log(age);
	return [r * Math.cos(th), r * Math.sin(th)];
};

function calendar(ctx, w, h, u, secs) {
	const lnF = 1; // two turns: age ÷ e²
	const S0 = (0.45 * h) / Math.sqrt(AGE_NOW); // "now" near the edge
	const viewAt = (zz) => makeView({ w, h, scale: S0 * Math.exp(lnF * zz) });
	const view = viewAt(zoomLog(u, lnF) / lnF);
	const S = view.scale;
	const cx = w / 2;
	const cy = h / 2;
	const ORB = 5 / S0;
	const orbPx = ORB * S;
	const fade = (rpx) => smooth(span(rpx, orbPx * 1.2, orbPx * 1.2 + 30));
	const write = smooth(beat(u, T.write));
	const lnLo = 2 * Math.log((orbPx * 1.05) / S);
	const lnHi = Math.log(AGE_NOW);
	const lnW = lerp(lnLo, lnHi, write);

	// The spiral, written outward from the orb to now.
	const P = [];
	const Rp = [];
	for (let l = lnLo; l <= lnW + 1e-9; l += 0.01) {
		const age = Math.exp(l);
		P.push(view.to(spiralAt(age)));
		Rp.push(Math.sqrt(age) * S);
	}
	strokeFade(ctx, P, Rp, fade, { color: PAL.cyan, width: 2.5, alpha: 0.95 });

	// The years along it: a tick across it and the year outside.
	const marks = [
		[1987, '1987'],
		[1988, '1988'],
		[1989, '1989'],
		[1990, '1990'],
		[2000, '2000'],
		[2010, '2010'],
		[2020, '2020']
	];
	for (const [yr, s] of marks) {
		const age = yr - T_C;
		if (Math.log(age) > lnW) continue;
		const rpx = Math.sqrt(age) * S;
		const la = span(rpx, 52, 80) * (1 - span(rpx, 0.8 * w, w));
		if (la <= 0) continue;
		const [x, y] = view.to(spiralAt(age));
		const dx = (x - cx) / rpx;
		const dy = (y - cy) / rpx;
		stroke(
			ctx,
			[
				[x - dx * 7, y - dy * 7],
				[x + dx * 7, y + dy * 7]
			],
			{ color: PAL.chalk, width: 2, alpha: 0.8 * la }
		);
		const align = dx > 0.35 ? 'left' : dx < -0.35 ? 'right' : 'center';
		math(ctx, s, x + dx * 22, y + dy * 18, { size: 16, alpha: 0.8 * la, align });
	}
	// Now, at the outer end.
	if (write > 0.98) {
		const [x, y] = view.to(spiralAt(AGE_NOW));
		disc(ctx, x, y, 5, { fill: PAL.chalk, alpha: 0.9 });
		math(ctx, 'now', x - 12, y + 4, { size: 17, alpha: 0.85, align: 'right' });
	}

	// The birthday, marked as it is entered: t₀ on the spiral.
	const mark = smooth(beat(u, [T.a1[1], T.a1[1] + 0.03]));
	const [bx, by] = view.to(spiralAt(AGE_B));
	// The 38 weeks back to t_c, a gold bead apiece, on the second answer.
	const back = beat(u, [T.a2[1] + 0.01, T.step2[1] - 0.005]);
	if (back > 0) {
		const lb = Math.log(AGE_B);
		const lc = 2 * Math.log((orbPx * 0.9) / S);
		const lw = lerp(lb, lc, easeInOutCubic(back) ** 0.8);
		const A = [];
		for (let l = lb; l >= lw - 1e-9; l -= 0.01) A.push(view.to(spiralAt(Math.exp(l))));
		stroke(ctx, A, { color: PAL.gold, width: 2.2, alpha: 0.85 });
		for (let wk = 0; wk < 38; wk++) {
			const age = (266 - 7 * wk) / YEAR;
			const l = Math.log(age);
			if (l < lw) break;
			const rpx = Math.sqrt(age) * S;
			if (rpx < orbPx * 1.1) break;
			const [x, y] = view.to(spiralAt(age));
			disc(ctx, x, y, Math.max(2, Math.min(5.5, 0.016 * rpx)), { fill: PAL.gold, glow: 6 });
		}
	}
	if (mark > 0) {
		disc(ctx, bx, by, 7.5 * mark, { fill: PAL.pink, ring: PAL.chalk, ringWidth: 2 });
		const dx = (bx - cx) / Math.hypot(bx - cx, by - cy);
		math(ctx, 't_{0}', bx + (dx > 0 ? 14 : -14), by - 18, {
			size: 20,
			alpha: mark,
			align: dx > 0 ? 'left' : 'right'
		});
	}

	const gold = smooth(beat(u, [T.step2[1] - 0.04, T.step2[1] + 0.03]));
	drawOrb(ctx, cx, cy, orbPx, secs, { flare: flareAt(u), gold, halo: 0.5 });
	if (gold > 0)
		math(ctx, 't_{c}', cx + orbPx * 1.1 + 12, cy - orbPx * 1.1 - 12, {
			size: 22,
			alpha: gold,
			color: PAL.gold
		});
	prompts(ctx, view, viewAt(0), viewAt(1), h, u, secs);
	note(ctx, w, h, 0.42 * Math.min(w, h), [
		['z ∝ (t − t_{c})^{½ − 2πi}', beat(u, [0.04, 0.12])],
		['t_{c} = t_{0} − 266 d = 24 · 05 · 1986', beat(u, [0.58, 0.68])]
	]);
}
