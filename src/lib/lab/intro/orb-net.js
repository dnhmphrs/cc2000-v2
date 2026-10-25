// ── log-intro · orb-net — the OG log-spiral entry page, dimmed ──────────────
// The terminal types the title card (log-dawn's, no command). Its full stop
// does not take the lens: it LIGHTS IN PLACE into a small, quiet orb while the
// words fade, and the board slides (a pan, no zoom) until the orb is centred
// a little above the middle. Out of it log-orb's loxodrome net is written in
// faint chalk — the coils θ = 2 log r + 2πk/8 at one strength, the spokes
// θ = −½ log r + 2πj/8 at a dimmer one, crossing at right angles, small nodes
// at the crossings — over the rose plate, fainter still. Each question is
// asked under the orb on log-orb's wiped patch: the date as a mono field
// (dd · mm · yyyy, the mask filling as the digits come, the terminal's block
// caret), then "how spicy?" on a slider of ten stops whose handle is dragged.
// Each Enter takes ONE log step toward the orb — the net's own symmetry
// z ↦ λz, λ = e^{(3 + i)π/10}, a zoom of 2.57 and a turn of 18° — so the net
// lands on itself, closer, while the answered patch rides out past the bottom
// edge with the board. After the second step the orb's light turns gold (the
// confirmation), the two answers kept small in the top right, and the board
// fades for the loop.
//
// Dim on purpose: the lead liked log-orb's pages and found them "a bit
// bright" — so no cold haze, a bloom a few times the orb and soft, no
// shadow glare, the net under a quarter alpha, the plate under a fifth.

import {
	PAL,
	TAU,
	MATH_FONT,
	TECH_FONT,
	makeView,
	stroke,
	disc,
	math,
	span,
	smooth,
	lerp,
	easeInOutCubic
} from '../log/board.js';
import { glow } from '../log/ink.js';
import { drawPlate } from '../log/plate.js';
import { makeTerminal } from '../log-dawn.js';

const SECONDS = 22;
// In seconds: the date asked at q1, its field ready (live: waiting) at wait1,
// Enter at e1; the spice the same. q2 is where the first step lands.
const B = { q1: 8.7, wait1: 9.4, e1: 11.6, q2: 13.55, wait2: 14.25, e2: 16.2 };

export const meta = {
	title:
		'orb-net — the stop lights into a quiet orb; the net in faint chalk; each answer one log step in',
	order: 5,
	seconds: SECONDS,
	beats: B
};

// The two steps toward the orb, each after its Enter's gold has written.
const STEP1 = [B.e1 + 0.45, B.e1 + 1.95];
const STEP2 = [B.e2 + 0.45, B.e2 + 1.95];
const GOLD = [STEP2[1] - 0.2, STEP2[1] + 0.8];
const END = [SECONDS - 0.8, SECONDS - 0.05];

// The net (log-orb's): it goes to itself under z ↦ λz exactly when
// arg λ − 2 log|λ| and arg λ + ½ log|λ| are both multiples of 2π/8.
const NET = { n: 8, a: 2, dRho: (3 * Math.PI) / 10, dTh: Math.PI / 10, rot: -0.3 };

// Strengths, all low: the coils, the spokes (dimmer), the nodes, the plate.
const DIM = { coil: 0.2, spoke: 0.1, node: 0.32, plate: 0.2 };

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
const SERIF = (s) => `italic 400 ${s}px ${MATH_FONT}`;
const mix = (a, b, t) => a.map((x, i) => Math.round(lerp(x, b[i], t)));
const rgba = (c, a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
const ease = (t, [a, b]) => easeInOutCubic(span(t, a, b));
const bump = (x, x0, wd) => Math.exp(-(((x - x0) / wd) ** 2));

export async function make({ board, answers }) {
	await Promise.all([
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	const term = makeTerminal(0.8, { cmd: false });
	const STOP = term.stop;
	const FREEZE = STOP + 0.2;
	// The stop's beats: it lights in place, the words fade, the board slides
	// the orb home, and the net and the plate are written out of it.
	const LIGHT = [STOP + 0.25, STOP + 1.15];
	const FADE = [STOP + 0.75, STOP + 2.1];
	const SLIDE = [STOP + 0.9, STOP + 2.6];
	const WRITE = [STOP + 1.7, STOP + 3.9];
	const PLATE = [STOP + 2.1, STOP + 4.1];

	let frozen = null;
	function frozenFrame(w, h) {
		const dpr = board.dpr || 1;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		term.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	function render(ctx, w, h, t, hand) {
		const L = term.layout(ctx, w, h);
		if (t < FREEZE) term.draw(ctx, w, h, t / 10, t, t - 10);
		if (t < FREEZE) {
			answers.slider(() => null);
			return;
		}

		// Where the orb is: the stop, sliding home.
		const home = [w / 2, 0.43 * h];
		const sl = easeInOutCubic(span(t, SLIDE[0], SLIDE[1]));
		const ox = lerp(L.stop.x, home[0], sl);
		const oy = lerp(L.stop.y, home[1], sl);

		// The title, frozen at its stop, fading as it slides with the board.
		const textA = 1 - smooth(span(t, FADE[0], FADE[1]));
		if (t >= FREEZE && textA > 0.003) {
			ctx.save();
			ctx.globalAlpha = textA;
			ctx.drawImage(frozenFrame(w, h), ox - L.stop.x, oy - L.stop.y, w, h);
			ctx.restore();
		}

		// The steps taken (0, 1, 2), and a slow creep over the close.
		const z = ease(t, STEP1) + ease(t, STEP2) + 0.1 * smooth(span(t, STEP2[1], END[1]));
		const S0 = 0.47 * h;
		const viewAt = (zz, c = [ox, oy]) =>
			makeView({
				w,
				h,
				cx: c[0],
				cy: c[1],
				scale: S0 * Math.exp(NET.dRho * zz),
				rot: NET.rot + NET.dTh * zz
			});
		const view = viewAt(z);
		const S = view.scale;
		// The orb comes closer more slowly than the board does: 4 px, then
		// half a step's zoom per step, so it is still small at the close.
		const r0 = Math.max(4, L.stop.r * 1.8);
		const orbPx = r0 * Math.exp(0.5 * NET.dRho * z);
		const diag = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));

		// The plates, one step λ apart: each one in is the last one, closer.
		const pw = smooth(span(t, PLATE[0], PLATE[1]));
		if (pw > 0)
			for (let j = 0; j < 4; j++) {
				const Rpx = Math.exp(-NET.dRho * j) * S;
				const al = span(Rpx, 50, 150) * (1 - span(Rpx, 0.75 * h, 1.25 * h));
				if (al <= 0) continue;
				const pv = makeView({
					w,
					h,
					cx: ox,
					cy: oy,
					scale: S * Math.exp(-NET.dRho * j),
					rot: NET.dTh * (z - j)
				});
				drawPlate(ctx, pv, { upto: pw, alpha: DIM.plate * al, labels: false, theta: false });
			}

		// The gold front that runs through the nodes into the orb on a step.
		const fronts = [STEP1, STEP2]
			.map((s) => span(t, s[0], s[1]))
			.filter((x) => x > 0 && x < 1)
			.map((x) => ({
				r: Math.exp(lerp(Math.log(diag * 1.1), Math.log(orbPx * 2.4), easeInOutCubic(x))),
				a: Math.sin(Math.PI * x) ** 0.6
			}));
		const write = smooth(span(t, WRITE[0], WRITE[1]));
		drawNet(ctx, w, h, view, S, orbPx, write, diag, fronts);

		// The orb: lit in place out of the chalk dot, a flare as a step lands,
		// gold once both answers are in.
		const light = smooth(span(t, LIGHT[0], LIGHT[1]));
		const flare = bump(t, STEP1[1] - 0.15, 0.35) + bump(t, STEP2[1] - 0.15, 0.35);
		const gold = smooth(span(t, GOLD[0], GOLD[1]));
		const rLit = lerp(L.stop.r, orbPx, smooth(span(t, LIGHT[0], LIGHT[1] + 0.3)));
		orb(ctx, ox, oy, rLit, hand.secs, { light, flare, gold });

		// The questions, each anchored in the board where the view at rest
		// before its step puts it, so the step carries it out.
		const anchor = [home[0], home[1] + 0.3 * h];
		let geo = null;
		if (t >= B.q1) {
			const a1 = 1 - smooth(span(t, STEP1[0] + 0.1, STEP1[0] + 1.0));
			patch(
				ctx,
				h,
				view,
				viewAt(0, home),
				anchor,
				hand.q1,
				a1,
				'when were you born?',
				(x, y, k, a) => dateField(ctx, x, y, k, a, hand)
			);
		}
		if (t >= B.q2) {
			const a2 = 1 - smooth(span(t, STEP2[0] + 0.1, STEP2[0] + 1.0));
			patch(ctx, h, view, viewAt(1, home), anchor, hand.q2, a2, 'how spicy?', (x, y, k, a) => {
				geo = slider(ctx, x, y, k, a, hand);
			});
		}
		answers.slider(
			geo
				? (cx, cy, phase) => {
						const { X0, X9, Y, pitch } = geo;
						if (
							phase === 'down' &&
							(Math.abs(cy - Y) > Math.max(20, 0.9 * pitch) || cx < X0 - pitch || cx > X9 + pitch)
						)
							return null;
						return Math.max(1, Math.min(10, 1 + (9 * (cx - X0)) / (X9 - X0)));
					}
				: () => null
		);

		givens(ctx, w, h, t, hand);

		// The loop: the board fades to its ground (and its dust) at the end.
		const end = smooth(span(t, END[0], END[1]));
		if (end > 0) {
			ctx.save();
			ctx.globalAlpha = end;
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(0, 0, w, h);
			if (board.dust) {
				ctx.fillStyle = board.dust;
				ctx.fillRect(0, 0, w, h);
			}
			ctx.restore();
		}
	}

	return { render, resize: () => (frozen = null) };
}

// ── The orb, quiet ───────────────────────────────────────────────────────────
// log-orb's light with the glare taken out: no cold haze, a warm bloom a few
// times its size, a soft limb and no shadow; two chalk rings breathe out of it
// faintly. Breathes on `secs` (the hand's clock: real seconds while waiting).
function orb(ctx, x, y, r, secs, { light = 1, flare = 0, gold = 0 } = {}) {
	if (light <= 0.003 || r <= 0) return;
	const br = 1 + 0.05 * Math.sin((TAU * secs) / 3.4) + 0.02 * Math.sin((TAU * secs) / 1.3 + 1.1);
	const R = r * br * (1 + 0.22 * flare);
	const warm = mix([232, 208, 172], [245, 193, 80], gold);
	const core = mix([255, 247, 232], [255, 226, 160], gold);
	glow(ctx, x, y, Math.max(18, R * 7), warm, (0.13 + 0.07 * flare + 0.04 * gold) * light);
	glow(ctx, x, y, R * 2.6, core, 0.3 * light);
	// The halo: two rings sliding out on the clock, very faint.
	const ph = (((secs * 0.18) % 1) + 1) % 1;
	ctx.save();
	ctx.strokeStyle = rgba(mix([236, 230, 218], [245, 193, 80], gold));
	ctx.lineWidth = 0.8;
	for (let j = 0; j < 3; j++) {
		const s = j + ph;
		const rr = R * 2.2 * Math.exp(0.42 * s);
		const a = 0.09 * light * (1 - s / 3) * smooth(s / 0.6);
		if (a <= 0.004) continue;
		ctx.globalAlpha = a;
		ctx.beginPath();
		ctx.arc(x, y, rr, 0, TAU);
		ctx.stroke();
	}
	ctx.restore();
	// The body: white at the heart, warm at a soft limb.
	ctx.save();
	ctx.globalAlpha = 0.95 * light;
	const g = ctx.createRadialGradient(x - R * 0.18, y - R * 0.2, 0, x, y, R * 1.08);
	g.addColorStop(0, '#fffdf8');
	g.addColorStop(0.55, rgba(core));
	g.addColorStop(0.85, rgba(warm, 0.8));
	g.addColorStop(1, rgba(warm, 0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R * 1.08, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// ── The net, in faint chalk ──────────────────────────────────────────────────
// Each family as a few paths: a line's segments are bucketed by the alpha its
// fade toward the orb gives them, so the lines dissolve short of the light in
// a dozen strokes rather than hundreds.
const LEVELS = 10;
function drawNet(ctx, w, h, view, S, orbPx, write, diag, fronts) {
	if (write <= 0) return;
	const { n, a } = NET;
	const rIn = orbPx * 2.4;
	const rhoLo = Math.log(rIn / S);
	const rhoHi = Math.log((diag * 1.04) / S);
	const rhoW = lerp(rhoLo, rhoHi, write);
	if (rhoW <= rhoLo + 0.01) return;
	const fade = (rpx) => smooth(span(rpx, rIn, rIn + 48));
	const P = (rho, th) => {
		const r = Math.exp(rho);
		return view.to([r * Math.cos(th), r * Math.sin(th)]);
	};
	for (const [slope, alpha, width] of [
		[-1 / a, DIM.spoke, 1],
		[a, DIM.coil, 1.1]
	]) {
		const buckets = Array.from({ length: LEVELS + 1 }, () => []);
		for (let k = 0; k < n; k++) {
			let run = null;
			let lvl = -1;
			let prev = null;
			for (let rho = rhoLo; rho <= rhoW + 1e-9; rho += 0.012) {
				const p = P(rho, slope * rho + (TAU * k) / n);
				if (prev) {
					const l = Math.round(fade(Math.exp(rho - 0.006) * S) * LEVELS);
					if (l !== lvl) {
						run = [prev];
						buckets[l].push(run);
						lvl = l;
					}
					run.push(p);
				}
				prev = p;
			}
		}
		ctx.save();
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		for (let l = 1; l <= LEVELS; l++) {
			if (!buckets[l].length) continue;
			ctx.globalAlpha = (alpha * l) / LEVELS;
			ctx.beginPath();
			for (const run of buckets[l]) {
				ctx.moveTo(run[0][0], run[0][1]);
				for (let i = 1; i < run.length; i++) ctx.lineTo(run[i][0], run[i][1]);
			}
			ctx.stroke();
		}
		ctx.restore();
	}
	// The nodes: coil k meets spoke j at log r = πm/10; small discs that grow
	// a little with r, lit gold for a moment as a step's front passes.
	const dm = TAU / n / (a + 1 / a);
	const mLo = Math.ceil(rhoLo / dm);
	const mHi = Math.floor(Math.min(rhoW, rhoHi) / dm);
	for (let m = mLo; m <= mHi; m++) {
		const rho = m * dm;
		const rpx = Math.exp(rho) * S;
		const al = fade(rpx) * smooth((rhoW - rho) / 0.25);
		if (al <= 0.01) continue;
		let g = 0;
		for (const fr of fronts) g = Math.max(g, fr.a * bump(Math.log(rpx / fr.r), 0, 0.3));
		const size = Math.max(1, Math.min(3.6, 0.011 * rpx)) * (1 + 0.15 * g);
		for (let j = 0; j < n; j++) {
			const [x, y] = P(rho, -rho / a + (TAU * j) / n);
			if (x < -10 || y < -10 || x > w + 10 || y > h + 10) continue;
			disc(ctx, x, y, size, { fill: PAL.node, alpha: DIM.node * al * (1 - g) });
			if (g > 0.02) disc(ctx, x, y, size, { fill: PAL.gold, alpha: 0.45 * al * g, glow: 3 * g });
		}
	}
}

// ── The prompt: a wiped patch under the orb ──────────────────────────────────
// log-orb's: a rounded rect of board with a feathered edge, the question
// written on in the italic, the field under it. Anchored in the world through
// `rest`, so a step grows it and slides it out with the board; k is that
// growth. The patch is ONE fill — the rect's shadow, blurred by `soft`, cast
// back on screen from a rect drawn far off it — not log-orb's nested fills: a
// stack of eight faint fills of the ground over the ground rounds down a level
// each on an 8-bit canvas, so as the patch faded with a step it went DARKER
// than the board (21 → 13), a black box riding out.
function wipe(ctx, cx, cy, W, H, r, soft, a) {
	if (a <= 0.004) return;
	const dpr = ctx.getTransform().a || 1;
	const off = 20000;
	ctx.save();
	ctx.globalAlpha = Math.min(1, a);
	ctx.fillStyle = PAL.ground;
	ctx.shadowColor = PAL.ground;
	ctx.shadowBlur = 2 * soft * dpr;
	ctx.shadowOffsetX = off * dpr;
	ctx.beginPath();
	ctx.roundRect(cx - W / 2 - off, cy - H / 2, W, H, r);
	ctx.fill();
	ctx.restore();
}

function patch(ctx, h, view, rest, anchor, q, alpha, text, field) {
	if (q <= 0 || alpha <= 0.01) return;
	const k = view.scale / rest.scale;
	const [px, py] = view.to(rest.from(anchor));
	if (py - 80 * k > h) return;
	const qs = 16 * k;
	ctx.save();
	ctx.font = SERIF(qs);
	const Wq = ctx.measureText(text).width;
	ctx.restore();
	const W = Math.max(Wq, 250 * k) + 70 * k;
	wipe(ctx, px, py, W - 20 * k, 90 * k, 24 * k, 22 * k, 0.92 * alpha * smooth(q * 3));
	math(ctx, text, px, py - 26 * k, { size: qs, upto: q, alpha: 0.66 * alpha, align: 'center' });
	const show = smooth(span(q, 0.4, 1));
	if (show > 0) field(px, py + 14 * k, k, alpha * show);
}

// ── The date: dd · mm · yyyy ─────────────────────────────────────────────────
// Ten mono cells: the mask's letters faint until a digit takes their place,
// the terminal's block caret in the next cell (a bar after the last once all
// eight are in), steady within a keystroke, blinking on the hand's clock
// otherwise. Eight digits that are not a date dim and the line under them goes
// rose. Enter: the gold writes along the line.
const MASK = 'dd·mm·yyyy';
const DIGIT_CELL = [0, 1, 3, 4, 6, 7, 8, 9];
function dateField(ctx, x, y, k, alpha, hand) {
	const fs = 19 * k;
	ctx.save();
	ctx.font = TECH(fs);
	const adv = ctx.measureText('0').width;
	const cell = adv * 1.32;
	const x0 = x - 5 * cell;
	const typed = hand.typed ?? '';
	const full = typed.length >= 8;
	const bad = full && !hand.valid;
	const enter = hand.enter1 ?? 0;
	const caretOn = hand.caret > 0 && enter <= 0 && (hand.steady > 0 || (hand.secs * 2.3) % 1 < 0.58);
	const next = DIGIT_CELL[typed.length];
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	for (let c = 0; c < 10; c++) {
		const cx = x0 + (c + 0.5) * cell;
		const di = DIGIT_CELL.indexOf(c);
		if (di < 0) {
			ctx.globalAlpha = 0.4 * alpha;
			ctx.fillText('·', cx, y);
		} else if (di < typed.length) {
			ctx.globalAlpha = (bad ? 0.55 : 0.92) * alpha;
			ctx.fillText(typed[di], cx, y);
		} else if (!(caretOn && c === next)) {
			ctx.globalAlpha = 0.2 * alpha;
			ctx.fillText(MASK[c], cx, y);
		}
	}
	if (caretOn) {
		ctx.globalAlpha = 0.85 * alpha;
		if (!full) ctx.fillRect(x0 + (next + 0.5) * cell - adv / 2, y - 0.46 * fs, adv, 0.9 * fs);
		else ctx.fillRect(x0 + 10 * cell + 2 * k, y - 0.46 * fs, 1.6 * k, 0.9 * fs);
	}
	ctx.restore();
	const ly = y + 0.72 * fs;
	const line = [
		[x0, ly],
		[x0 + 10 * cell, ly]
	];
	stroke(ctx, line, {
		color: bad ? PAL.rose : PAL.chalk,
		width: 1,
		alpha: (bad ? 0.55 : 0.22) * alpha,
		dash: [3 * k, 4 * k],
		cap: 'butt'
	});
	if (enter > 0)
		stroke(ctx, line, {
			color: PAL.gold,
			width: 1.5 * k,
			alpha: 0.85 * alpha,
			upto: enter,
			glow: 4
		});
}

// ── The spice: a slider of ten stops ─────────────────────────────────────────
// A chalk track, ten stops (those the handle has passed a little brighter),
// `1` and `10` under the ends; the handle a small soft light at `value` —
// fractional, under the pointer, while it is held, on a stop once let go —
// with its number over it. Held, the stop under it is ringed. Enter: the gold
// from stop 1 to the handle. Returns the geometry, for the pointer.
function slider(ctx, x, y, k, alpha, hand) {
	const pitch = 26 * k;
	const L = 9 * pitch;
	const X0 = x - L / 2;
	const X9 = x + L / 2;
	const v = Math.max(1, Math.min(10, hand.value ?? 1));
	const held = hand.held ?? 0;
	const enter = hand.enter2 ?? 0;
	const hx = X0 + (v - 1) * pitch;
	const near = Math.round(v);
	stroke(
		ctx,
		[
			[X0, y],
			[X9, y]
		],
		{ color: PAL.chalk, width: 1, alpha: 0.26 * alpha }
	);
	if (enter > 0)
		stroke(
			ctx,
			[
				[X0, y],
				[hx, y]
			],
			{ color: PAL.gold, width: 1.5 * k, alpha: 0.85 * alpha, upto: enter, glow: 4 }
		);
	for (let i = 0; i < 10; i++) {
		const passed = i + 1 <= v + 1e-3;
		disc(ctx, X0 + i * pitch, y, 1.7 * k, {
			fill: PAL.chalk,
			alpha: alpha * (passed ? 0.6 : 0.28)
		});
	}
	if (held > 0)
		stroke(ctx, ring(X0 + (near - 1) * pitch, y, 7 * k), {
			color: PAL.chalk,
			width: 1,
			alpha: 0.4 * alpha
		});
	ctx.save();
	ctx.font = TECH(11 * k);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.34 * alpha;
	ctx.fillText('1', X0, y + 15 * k);
	ctx.fillText('10', X9, y + 15 * k);
	ctx.restore();
	// The handle.
	const fl = enter > 0 && enter < 1 ? Math.sin(Math.PI * enter) : 0;
	const hr = 4.2 * k * (1 + 0.22 * held) * (1 + 0.3 * fl);
	const done = smooth(enter);
	glow(
		ctx,
		hx,
		y,
		hr * 4.5,
		mix([232, 208, 172], [245, 193, 80], done),
		(0.16 + 0.1 * held) * alpha
	);
	disc(ctx, hx, y, hr, { fill: done > 0.5 ? PAL.gold : PAL.chalk, alpha: 0.95 * alpha });
	ctx.save();
	ctx.font = TECH(14 * k);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.9 * alpha;
	ctx.fillText(String(near), hx, y - 16 * k);
	ctx.restore();
	return { X0, X9, Y: y, pitch };
}

function ring(x, y, r, n = 40) {
	const pts = [];
	for (let i = 0; i <= n; i++)
		pts.push([x + r * Math.cos((TAU * i) / n), y + r * Math.sin((TAU * i) / n)]);
	return pts;
}

// ── The givens: what was answered, kept small in the top right ───────────────
// The date as it was typed; the spice as ten small stops, those up to it lit.
function givens(ctx, w, h, t, hand) {
	const g1 = smooth(span(t, STEP1[0] + 0.4, STEP1[0] + 1.1));
	const g2 = smooth(span(t, STEP2[0] + 0.4, STEP2[0] + 1.1));
	if (g1 <= 0) return;
	const x = w - Math.max(28, w * 0.04);
	const y = Math.max(36, h * 0.07);
	const d = (hand.typed ?? '').padEnd(8, ' ');
	ctx.save();
	ctx.font = TECH(12);
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.5 * g1;
	ctx.fillText(`${d.slice(0, 2)} · ${d.slice(2, 4)} · ${d.slice(4)}`, x, y);
	ctx.restore();
	if (g2 <= 0) return;
	const v = Math.round(hand.value ?? 1);
	const sp = 7;
	const xr = x - 22;
	for (let i = 0; i < 10; i++) {
		const on = i < v;
		disc(ctx, xr - (9 - i) * sp, y + 20, on ? 1.6 : 1.2, {
			fill: i === v - 1 ? PAL.gold : PAL.chalk,
			alpha: g2 * (i === v - 1 ? 0.8 : on ? 0.5 : 0.2)
		});
	}
	ctx.save();
	ctx.font = TECH(12);
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.5 * g2;
	ctx.fillText(String(v), x, y + 20);
	ctx.restore();
}
