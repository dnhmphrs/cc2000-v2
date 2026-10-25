// ── Intro: orb-rings — the OG log picture, dimmed, after the terminal ────────
// The title card types as the terminal does (log-dawn's makeTerminal, no
// command) and is FROZEN a beat after its full stop lands — no zoom into the
// dot. The dot lights IN PLACE into a small soft orb, the sentence fades off
// the board, and round the orb the complex log's own picture of the punctured
// plane is written on in faint chalk (log-orb's `rings`, dimmed): the rings
// r = 2^{−k}, innermost first, and the eight rays θ = jπ/4. No labels.
//
// The two questions are asked UNDER the orb, below the ring R★ the picture
// keeps for them, in log-orb's prompt (the italic serif on a wiped patch):
//
//   date   typed into a field of the terminal's mono, dd · mm · yyyy as a faint
//          mask the digits replace, a block caret on the next cell. Enter: a
//          gold line writes under it, and the plane slides in by EXACTLY one
//          ring (z ↦ 2z): the ring that takes R★'s place goes gold, the answered
//          field rides out with the plane, and the next question is written
//          where it was.
//   spice  a DIAL on that ring: ten stops at ten angles round it, 30° apart,
//          1 at the lower left, clockwise over the top to 10 at the lower right
//          (a knob, its gap at the bottom where the question is). The handle
//          is a lit point on the ring, dragged ROUND it — the pointer's angle
//          about the orb sets the value; a knob does not wrap, so past either
//          end it holds there — snapping to a stop when let go; ← → and a digit
//          (0 is 10). Its number reads under the question. Enter: gold writes
//          round the ring from stop 1 to the handle, and the plane slides in
//          by one ring again, the next ring going gold.
//   close  both answers under the orb, the orb a little warmer; a fade to the
//          board, and the terminal again.
//
// Beats (s, of 21): the terminal 0–5.1; the orb 5.1–6.3; the picture 5.8–7.3;
// the date asked 7.5, ready 8.3, Enter 10.4, the slide 10.75–12.15; the spice
// asked 12.0, ready 12.7, Enter 14.7, the slide 15.05–16.45; the answers
// 16.5–17.3; the fade 19.9–20.7. Every frame is a pure function of t and the
// hand; only the frozen card is cached.

import {
	PAL,
	TAU,
	MATH_FONT,
	TECH_FONT,
	stroke,
	disc,
	math,
	span,
	smooth,
	lerp,
	easeInOutCubic
} from '../log/board.js';
import { glow } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';

const TERM = makeTerminal(0.8, { cmd: false });
// The card is frozen here: the caret has closed to the dot, the swell not begun.
const FREEZE = TERM.stop + 0.2;

export const meta = {
	title: 'the full stop lights in place, the log picture round it, dim; the spice a dial on a ring',
	order: 6,
	seconds: 21,
	beats: { q1: 7.5, wait1: 8.3, e1: 10.4, q2: 12.0, wait2: 12.7, e2: 14.7 }
};
const B = meta.beats;

// The beats after the card, in seconds.
const K = {
	light: [FREEZE, FREEZE + 1.1], // the dot lights into the orb
	text: [FREEZE + 0.3, FREEZE + 1.6], // the sentence fades off
	rays: [FREEZE + 0.7, FREEZE + 2.1], // written outward
	rings: FREEZE + 0.75, // the innermost ring begins; each next one STAGGER on
	slide1: [B.e1 + 0.35, B.e1 + 1.75],
	slide2: [B.e2 + 0.35, B.e2 + 1.75],
	close: [B.e2 + 1.8, B.e2 + 2.6],
	fade: [meta.seconds - 1.1, meta.seconds - 0.3]
};
const STAGGER = 0.16;
const WRITE = 0.6;

// The dial: stop 1 at 225° (lower left), each next one 30° on, clockwise, so
// stop 10 is at −45° (lower right) and the gap is the bottom quarter.
const TH1 = 1.25 * Math.PI;
const DTH = Math.PI / 6;
const ARC = 9 * DTH;
const thOf = (v) => TH1 - (v - 1) * DTH;
const mod = (a, m) => ((a % m) + m) % m;

// The date field: dd · mm · yyyy in fourteen of the terminal's cells.
const CELLS = 14;
const DIG = [0, 1, 5, 6, 10, 11, 12, 13];
const SEP = [3, 8];
const MASK = 'ddmmyyyy';
const BLINK = 2.3;
const DUTY = 0.58;

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
const bump = (x, x0, wd) => Math.exp(-(((x - x0) / wd) ** 2));
const mix = (a, b, t) => a.map((x, i) => Math.round(lerp(x, b[i], t)));
const css = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

export async function make({ board, answers }) {
	await Promise.all([
		document.fonts.load(`400 24px ${TECH_FONT}`).catch(() => null),
		document.fonts.load(`italic 400 24px ${MATH_FONT}`).catch(() => null)
	]);
	let frozen = null;
	let drag = 1; // the drag's last value: a knob holds at its end, not wrap

	// The card at FREEZE, cached: the sentence and its dot.
	function frozenFrame(w, h) {
		const { dpr } = board;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	return {
		render(ctx, w, h, t, hand) {
			DPR = board.dpr;
			const L = TERM.layout(ctx, w, h);
			const g = geometry(w, h, L, t);
			// The pointer: the dial's ring this frame.
			const Rd = g.S / 4;
			answers.slider((cx, cy, phase) => {
				const dx = cx - g.O.x;
				const dy = g.O.y - cy;
				const r = Math.hypot(dx, dy);
				const phi = mod(TH1 - Math.atan2(dy, dx), TAU);
				const onArc = phi <= ARC + DTH / 2 || phi >= TAU - DTH / 2;
				const raw = phi <= ARC + DTH / 2 ? Math.min(10, 1 + phi / DTH) : 1;
				if (phase === 'down') {
					if (r < 0.55 * Rd || r > 1.5 * Rd || !onArc) return null;
					drag = raw;
					return raw;
				}
				if (r < 0.18 * Rd) return drag;
				// In the gap: the end it is nearer; across it, held where it was.
				let v = onArc ? raw : phi < (ARC + TAU) / 2 ? 10 : 1;
				if (Math.abs(v - drag) > 4.5) v = drag > 5.5 ? 10 : 1;
				drag = v;
				return v;
			});

			if (t < FREEZE) {
				TERM.draw(ctx, w, h, t / 10, t, t - 10);
				return;
			}
			plane(ctx, g, t);
			const textA = 1 - smooth(span(t, ...K.text));
			if (textA > 0.004) {
				ctx.save();
				ctx.globalAlpha = textA;
				ctx.drawImage(frozenFrame(w, h), 0, 0, w, h);
				ctx.restore();
			}
			const flare = 0.6 * (bump(t, B.e1 + 0.15, 0.22) + bump(t, B.e2 + 0.15, 0.22));
			const cl = smooth(span(t, ...K.close));
			orb(ctx, g.O.x, g.O.y, hand.secs, {
				light: smooth(span(t, ...K.light)),
				flare,
				gold: 0.55 * cl
			});

			// The date: asked under the orb, riding out with the first slide.
			const s1 = easeInOutCubic(span(t, ...K.slide1));
			const a1 = 1 - smooth(span(s1, 0, 0.55));
			if (hand.q1 > 0 && a1 > 0.004)
				scaled(ctx, g.O, 2 ** s1, () => {
					const P = promptPlace(g, L);
					question(ctx, P, L, 'when were you born?', hand.q1, a1, () =>
						dateField(ctx, P, L, hand, a1 * smooth(span(hand.q1, 0.4, 1)))
					);
				});

			// The spice: the dial on the ring the first slide brought, its
			// number under the question; out with the second slide.
			const s2 = easeInOutCubic(span(t, ...K.slide2));
			const a2 = 1 - smooth(span(s2, 0, 0.55));
			if (hand.q2 > 0 && a2 > 0.004) {
				dial(ctx, g, Rd, hand, a2, L);
				scaled(ctx, g.O, 2 ** s2, () => {
					const P = promptPlace(g, L);
					question(ctx, P, L, 'how spicy?', hand.q2, a2, () =>
						spiceField(ctx, P, L, hand, a2 * smooth(span(hand.q2, 0.4, 1)))
					);
				});
			}

			// The close: both answers, under the orb.
			if (cl > 0) closing(ctx, g, L, hand, cl);

			// The fade to the board, and round to the terminal.
			const fd = smooth(span(t, ...K.fade));
			if (fd > 0) {
				ctx.save();
				ctx.globalAlpha = fd;
				ctx.fillStyle = PAL.ground;
				ctx.fillRect(0, 0, w, h);
				if (board.dust && new URLSearchParams(location.search).get('dust') !== '0') {
					ctx.fillStyle = board.dust;
					ctx.fillRect(0, 0, w, h);
				}
				ctx.restore();
			}
		}
	};
}

// ── The geometry ─────────────────────────────────────────────────────────────
// The orb where the full stop was; R★ the ring kept for the questions (the
// dial is drawn on it); the plane's scale S, ring k at S·2^{−k}, doubling on
// each slide, so after one slide ring 2 is at R★ and after two ring 3.
function geometry(w, h, L, t) {
	const O = { x: L.stop.x, y: L.stop.y };
	const R = 0.22 * Math.min(h, w);
	const z = easeInOutCubic(span(t, ...K.slide1)) + easeInOutCubic(span(t, ...K.slide2));
	const S = 2 * R * 2 ** z;
	const diag = Math.max(
		Math.hypot(O.x, O.y),
		Math.hypot(w - O.x, O.y),
		Math.hypot(O.x, h - O.y),
		Math.hypot(w - O.x, h - O.y)
	);
	return { O, R, S, z, diag, w, h };
}

// Under the orb, below R★: the question, and the field under it.
function promptPlace(g, L) {
	const mid = Math.min(g.O.y + g.R + 0.085 * g.h, 0.9 * g.h);
	return { x: g.O.x, qy: mid - 0.55 * L.step, fy: mid + 0.5 * L.step };
}

function scaled(ctx, O, s, fn) {
	ctx.save();
	if (s !== 1) {
		ctx.translate(O.x, O.y);
		ctx.scale(s, s);
		ctx.translate(-O.x, -O.y);
	}
	fn();
	ctx.restore();
}

// ── The plane: rings r = 2^{−k} and rays θ = jπ/4, in faint chalk ────────────
const MIN_R = 15; // nothing closer to the orb than this
function plane(ctx, g, t) {
	const { O, S, diag } = g;
	const S0 = 2 * g.R;
	const kIn0 = Math.floor(Math.log2(S0 / MIN_R)); // the innermost at the start
	const kHi = Math.floor(Math.log2(S / MIN_R));
	const kLo = Math.ceil(Math.log2(S / (diag * 1.02)));
	const inner = (r) => smooth(span(r, MIN_R, MIN_R + 28));
	const outer = (r) => 1 - 0.5 * smooth(span(r, 0.5 * diag, diag));

	// The rays, written outward from the orb.
	const ry = smooth(span(t, ...K.rays));
	if (ry > 0) {
		const r0 = MIN_R + 6;
		const r1 = lerp(r0, diag, ry);
		for (let j = 0; j < 8; j++) {
			const th = (j * Math.PI) / 4;
			const c = Math.cos(th);
			const s = -Math.sin(th);
			// In pieces spaced as the rings are, so it fades in out of the orb
			// and off at the edge.
			const n = 12;
			for (let i = 0; i < n; i++) {
				const ra = r0 * (r1 / r0) ** (i / n);
				const rb = r0 * (r1 / r0) ** ((i + 1) / n);
				const a = 0.11 * outer((ra + rb) / 2) * smooth(span((ra + rb) / 2, r0, r0 + 30));
				stroke(
					ctx,
					[
						[O.x + ra * c, O.y + ra * s],
						[O.x + rb * c, O.y + rb * s]
					],
					{ color: PAL.chalk, width: 1, alpha: a, cap: 'butt' }
				);
			}
		}
	}

	// The rings, the innermost written first, each round from where the
	// dial will start, clockwise.
	const gold = [
		{ k: 2, g: goldOf(t, K.slide1, 0, 0.5) },
		{ k: 3, g: goldOf(t, K.slide2, 99, 1) }
	];
	for (let k = kLo; k <= kHi; k++) {
		const r = S * 2 ** -k;
		const t0 = K.rings + STAGGER * Math.max(0, kIn0 - k);
		const up = smooth(span(t, t0, t0 + WRITE));
		if (up <= 0) continue;
		const a = inner(r) * outer(r);
		if (a <= 0.01) continue;
		const N = Math.max(48, Math.min(260, Math.round(r * 0.6)));
		const P = [];
		for (let i = 0; i <= N; i++) {
			const th = TH1 - (TAU * i) / N;
			P.push([O.x + r * Math.cos(th), O.y - r * Math.sin(th)]);
		}
		const gk = gold.reduce((m, x) => (x.k === k ? Math.max(m, x.g) : m), 0);
		stroke(ctx, P, { color: PAL.chalk, width: 1, alpha: 0.17 * a * (1 - 0.6 * gk), upto: up });
		if (gk > 0.01)
			stroke(ctx, P, { color: PAL.gold, width: 1.3, alpha: 0.6 * a * gk, upto: up, glow: 3 });
		// The nodes where it crosses the rays.
		const na = 0.3 * a * smooth(span(t, t0 + 0.35, t0 + WRITE + 0.1)) * ry;
		if (na > 0.01) {
			const nr = Math.max(0.9, Math.min(2.3, 0.011 * r));
			for (let j = 0; j < 8; j++) {
				const th = (j * Math.PI) / 4;
				disc(ctx, O.x + r * Math.cos(th), O.y - r * Math.sin(th), nr, {
					fill: gk > 0.4 ? PAL.gold : PAL.node,
					alpha: na * (gk > 0.4 ? 1.6 : 1)
				});
			}
		}
	}
}

// A ring's gold through its slide: up as it takes R★'s place, held `hold`
// seconds, then back to chalk over `fade`. The first is chalk again before the
// dial is ready on it: a live run holds the clock there.
function goldOf(t, [s0, s1], hold, fade) {
	const up = smooth(span(t, lerp(s0, s1, 0.3), s1));
	return up * (1 - smooth(span(t, s1 + hold, s1 + hold + fade)));
}

// ── The orb: small and soft, no glare ────────────────────────────────────────
function orb(ctx, x, y, secs, { light = 1, flare = 0, gold = 0 }) {
	if (light <= 0.002) return;
	const br = 1 + 0.06 * Math.sin((TAU * secs) / 3.4) + 0.02 * Math.sin((TAU * secs) / 1.3 + 1.1);
	const r = 3.3 * br * (1 + 0.3 * flare);
	const core = mix([255, 240, 214], [255, 214, 130], gold);
	const warm = mix([240, 188, 132], [245, 178, 70], gold);
	glow(ctx, x, y, r * 18, [120, 106, 196], 0.05 * light);
	glow(ctx, x, y, r * 8, warm, (0.15 + 0.1 * flare + 0.05 * gold) * light);
	glow(ctx, x, y, r * 3, core, 0.4 * light);
	disc(ctx, x, y, r, { fill: css(core), alpha: 0.85 * light });
	disc(ctx, x, y, r * 0.5, { fill: '#fffaf0', alpha: 0.7 * light });
}

// ── The prompt ───────────────────────────────────────────────────────────────
// log-orb's wiped patch — a rounded rect of board with a feathered edge — as
// a sprite blurred once per size and laid with ONE draw: the kit's eight
// stacked fills each lose a level to rounding, which leaves the patch three
// levels DARKER than the board it is meant to be (a box round the answers).
const PATCHES = new Map();
let DPR = 1;
function wipe(ctx, cx, cy, W, H, r, soft, a) {
	if (a <= 0.01) return;
	const key = [W, H, r, soft, DPR * 4].map(Math.round).join(':');
	let p = PATCHES.get(key);
	if (!p) {
		const m = Math.ceil(3 * soft);
		const c = document.createElement('canvas');
		c.width = Math.ceil((W + 2 * m) * DPR);
		c.height = Math.ceil((H + 2 * m) * DPR);
		const x = c.getContext('2d');
		x.setTransform(DPR, 0, 0, DPR, 0, 0);
		x.filter = `blur(${soft}px)`;
		x.fillStyle = PAL.ground;
		x.beginPath();
		x.roundRect(m, m, W, H, r);
		x.fill();
		p = { c, W: W + 2 * m, H: H + 2 * m };
		if (PATCHES.size > 24) PATCHES.clear();
		PATCHES.set(key, p);
	}
	ctx.save();
	ctx.globalAlpha = Math.min(1, a);
	ctx.drawImage(p.c, cx - p.W / 2, cy - p.H / 2, p.W, p.H);
	ctx.restore();
}

// The question at P, written on by q over a wiped patch that also takes the
// field under it, which `field` draws.
function question(ctx, P, L, text, q, a, field) {
	const qs = Math.round(0.8 * L.fs);
	ctx.save();
	ctx.font = `italic 400 ${qs}px ${MATH_FONT}`;
	const Wq = ctx.measureText(text).width;
	ctx.restore();
	const W = Math.max(Wq, CELLS * L.cell) + 2.6 * qs;
	const top = P.qy - 0.8 * qs;
	const bot = P.fy + 0.75 * L.fs;
	wipe(ctx, P.x, (top + bot) / 2, W, bot - top, 1.2 * qs, 0.8 * qs, 0.9 * a * smooth(q * 3));
	math(ctx, text, P.x, P.qy, { size: qs, upto: q, alpha: 0.7 * a, align: 'center' });
	field();
}

function glyphs(ctx, items, fs, a) {
	ctx.save();
	ctx.font = TECH(fs);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	for (const [ch, x, y, k, color = PAL.chalk] of items) {
		if (k * a <= 0.004) continue;
		ctx.globalAlpha = k * a;
		ctx.fillStyle = color;
		ctx.fillText(ch, x, y);
	}
	ctx.restore();
}

// The terminal's block caret, its baseline at y: steady within a keystroke,
// blinking on the clock otherwise.
function caret(ctx, x, y, L, a, steady, secs) {
	if (a <= 0.004) return;
	if (!steady && mod(secs * BLINK, 1) >= DUTY) return;
	ctx.save();
	ctx.globalAlpha = 0.85 * a;
	ctx.fillStyle = PAL.chalk;
	ctx.fillRect(x, y - 0.78 * L.fs, L.cell, 0.92 * L.fs);
	ctx.restore();
}

// ── The date ─────────────────────────────────────────────────────────────────
function dateField(ctx, P, L, hand, a) {
	if (a <= 0.004) return;
	const { fs, cell } = L;
	const x0 = P.x - (CELLS / 2) * cell;
	const xc = (i) => x0 + (i + 0.5) * cell;
	const base = P.fy + 0.33 * fs;
	const typed = (hand.typed ?? '').slice(0, 8);
	const items = SEP.map((c) => ['·', xc(c), base, 0.4]);
	for (let i = 0; i < 8; i++)
		items.push(
			i < typed.length ? [typed[i], xc(DIG[i]), base, 0.95] : [MASK[i], xc(DIG[i]), base, 0.13]
		);
	glyphs(ctx, items, fs, a);
	// The line under it: rose, gently, if eight digits make no date.
	const ul = P.fy + 0.62 * fs;
	const bad = typed.length === 8 && !hand.valid;
	const line = [
		[x0, ul],
		[x0 + CELLS * cell, ul]
	];
	stroke(ctx, line, {
		color: bad ? PAL.rose : PAL.chalk,
		width: 1,
		alpha: (bad ? 0.55 : 0.16) * a
	});
	if (hand.enter1 > 0)
		stroke(ctx, line, { color: PAL.gold, width: 1.5, alpha: 0.85 * a, upto: hand.enter1, glow: 4 });
	// The caret: on the next digit's cell, or past the field once it is full.
	if (hand.caret > 0 && hand.enter1 <= 0) {
		const n = typed.length;
		const cx = n < 8 ? xc(DIG[n]) - cell / 2 : x0 + (CELLS + 0.5) * cell;
		caret(ctx, cx, base, L, a * hand.caret, hand.steady > 0, hand.secs);
	}
}

// ── The spice ────────────────────────────────────────────────────────────────
// Its number, under the question, where the date was typed.
function spiceField(ctx, P, L, hand, a) {
	if (a <= 0.004) return;
	const { fs, cell } = L;
	const base = P.fy + 0.33 * fs;
	const v = Math.round(Math.min(10, Math.max(1, hand.value)));
	glyphs(ctx, [[String(v), P.x, base, 0.95]], fs, a);
	const ul = P.fy + 0.62 * fs;
	const line = [
		[P.x - 1.5 * cell, ul],
		[P.x + 1.5 * cell, ul]
	];
	stroke(ctx, line, { color: PAL.chalk, width: 1, alpha: 0.16 * a });
	if (hand.enter2 > 0)
		stroke(ctx, line, { color: PAL.gold, width: 1.5, alpha: 0.85 * a, upto: hand.enter2, glow: 4 });
}

// The dial on ring 2 (at R★ until the second slide takes it out): the arc of
// ten stops, written on with the question, the passed part brighter, the
// handle a lit point at the value's angle.
function dial(ctx, g, R, hand, a0, L) {
	const { O } = g;
	const show = smooth(span(hand.q2, 0.1, 1));
	const a = a0 * smooth(span(hand.q2, 0, 0.5));
	if (a <= 0.004) return;
	const v = Math.min(10, Math.max(1, hand.value));
	const at = (th, r = R) => [O.x + r * Math.cos(th), O.y - r * Math.sin(th)];
	const arc = (v0, v1, r = R) => {
		const n = Math.max(2, Math.round(((v1 - v0) * DTH * r) / 4));
		const P = [];
		for (let i = 0; i <= n; i++) P.push(at(thOf(lerp(v0, v1, i / n)), r));
		return P;
	};
	stroke(ctx, arc(1, 10), { color: PAL.chalk, width: 1.2, alpha: 0.3 * a, upto: show });
	if (v > 1.001) stroke(ctx, arc(1, v), { color: PAL.chalk, width: 1.6, alpha: 0.55 * a * show });
	if (hand.enter2 > 0)
		stroke(ctx, arc(1, v), {
			color: PAL.gold,
			width: 1.8,
			alpha: 0.85 * a0,
			upto: hand.enter2,
			glow: 4
		});
	// The stops: a tick across the ring at each, lit once passed.
	const tk = Math.max(4, 0.03 * R);
	for (let i = 1; i <= 10; i++) {
		const on = smooth(span(show, (i - 1) / 10, (i - 1) / 10 + 0.15));
		if (on <= 0) continue;
		const th = thOf(i);
		stroke(ctx, [at(th, R - tk), at(th, R + tk)], {
			color: PAL.chalk,
			width: 1.3,
			alpha: (i <= v + 1e-3 ? 0.75 : 0.35) * a * on,
			cap: 'butt'
		});
	}
	// The ends, marked outside the ring.
	const ms = Math.round(0.6 * L.fs);
	const [x1, y1] = at(thOf(1), R + 2.6 * tk + 6);
	const [x10, y10] = at(thOf(10), R + 2.6 * tk + 6);
	glyphs(
		ctx,
		[
			['1', x1, y1 + 0.35 * ms, 0.45 * smooth(span(show, 0, 0.2))],
			['10', x10, y10 + 0.35 * ms, 0.45 * smooth(span(show, 0.85, 1))]
		],
		ms,
		a
	);
	// The handle.
	const ha = a * smooth(span(hand.q2, 0.5, 1));
	if (ha <= 0.004) return;
	const [hx, hy] = at(thOf(v));
	const flare = hand.enter2 > 0 && hand.enter2 < 1 ? Math.sin(Math.PI * hand.enter2) : 0;
	const held = hand.held > 0 ? 1 : 0;
	if (held) stroke(ctx, circle(hx, hy, 10), { color: PAL.chalk, width: 1, alpha: 0.35 * ha });
	glow(ctx, hx, hy, 16 * (1 + 0.4 * flare), [245, 193, 80], (0.22 + 0.1 * held) * ha);
	disc(ctx, hx, hy, 3.4 * (1 + 0.2 * held + 0.4 * flare), { fill: PAL.gold, alpha: 0.9 * ha });
	disc(ctx, hx, hy, 1.5, { fill: '#fffaf0', alpha: 0.8 * ha });
}

function circle(x, y, r, n = 40) {
	const P = [];
	for (let i = 0; i <= n; i++)
		P.push([x + r * Math.cos((TAU * i) / n), y + r * Math.sin((TAU * i) / n)]);
	return P;
}

// ── The close: both answers under the orb ────────────────────────────────────
function closing(ctx, g, L, hand, cl) {
	const P = promptPlace(g, L);
	const d = (hand.typed ?? '').padEnd(8, ' ');
	const date = `${d.slice(0, 2)} · ${d.slice(2, 4)} · ${d.slice(4, 8)}`;
	const v = Math.round(Math.min(10, Math.max(1, hand.value)));
	const n = Math.floor(cl * (date.length + 3) + 1e-6);
	const W = CELLS * L.cell + 2 * L.fs;
	const top = P.qy - 0.6 * L.fs;
	const bot = P.fy + 0.75 * L.fs;
	wipe(ctx, P.x, (top + bot) / 2, W, bot - top, L.fs, 0.7 * L.fs, 0.85 * smooth(cl * 3));
	ctx.save();
	ctx.font = TECH(L.fs);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = PAL.chalk;
	ctx.globalAlpha = 0.8;
	const shown = date.slice(0, n);
	ctx.textAlign = 'left';
	ctx.fillText(shown, P.x - (date.length / 2) * L.cell, P.qy + 0.33 * L.fs);
	ctx.restore();
	if (n > date.length)
		glyphs(ctx, [[String(v), P.x, P.fy + 0.33 * L.fs, 0.8]], L.fs, smooth(cl * 2));
}
