// ── Ink: the light and lettering the log sketches share ──────────────────────
// Lifted from the first round's sketches, so the orb, the lit points, the
// beat's flash and the lecture's notes look the same in every sketch that
// draws them: a polyline whose width and alpha change along it (ribbon); a
// soft light with a smooth falloff (glow — board.js's bloom has a flat
// shoulder, which reads as a plate when it is large); the ORB of log-orb, the
// light the questions fly at; a lit point; the beat's wash and shock ring;
// the plates' Θ; a line of math points broken where it runs off to ∞; and the
// lecture — lines of maths top left, each on a soft patch of board so it reads
// over a busy net or a room.

import {
	PAL,
	TAU,
	MATH_FONT,
	stroke,
	disc,
	bloom,
	math,
	lerp,
	span,
	smooth,
	clamp01
} from './board.js';
import { circlePts } from './plate.js';

// A polyline drawn in segments, each with its own width (W[i]) and alpha (A[i]):
// lines that thicken toward the lens and fade into a centre.
export function ribbon(ctx, P, W, A, color) {
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

// A soft light with a smooth falloff, added: `rgb` [r, g, b], radius r px.
export function glow(ctx, x, y, r, rgb, a = 1) {
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

// The orb (log-orb's) at (x, y), radius r px: breathing on the clock `secs`,
// a halo of log-spaced rings breathing out of it (half of them dashed and
// turning), `flare` a beat of light, `gold` how far its light has turned to
// gold, `halo` how strong the rings are.
export function drawOrb(ctx, x, y, r, secs, { flare = 0, gold = 0, halo = 1 } = {}) {
	const br = 1 + 0.07 * Math.sin((TAU * secs) / 3.4) + 0.025 * Math.sin((TAU * secs) / 1.3 + 1.1);
	const R = r * br * (1 + 0.45 * flare);
	const core = mix([255, 236, 200], [255, 196, 90], gold);
	const warm = mix([255, 186, 118], [245, 170, 50], gold);
	glow(ctx, x, y, Math.max(90, R * 24), [128, 104, 214], 0.22 + 0.08 * flare); // the cold haze
	glow(ctx, x, y, Math.max(40, R * 9), warm, 0.45 + 0.3 * flare);
	glow(ctx, x, y, R * 3.2, core, 0.8);
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

// A lit point: a disc with a hot core and a halo.
export function lit(ctx, x, y, r, a = 1, color = PAL.gold, halo = 'rgba(255, 222, 150, 0.75)') {
	if (a <= 0 || r <= 0) return;
	bloom(ctx, x, y, r * 6, halo, a);
	disc(ctx, x, y, r, { fill: color, alpha: a });
	disc(ctx, x, y, r * 0.45, { fill: '#fffaf0', alpha: a });
}

// The beat (log-beat's): a wash of light over the board, a bloom on the point
// and a shock ring out of it — attack in a frame or two, then a fast decay —
// at progress `hit`, R the ring's reach in px.
export function impact(ctx, w, h, x, y, R, u, hit, gain = 1, shock = true) {
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
		const e = 1 - Math.pow(1 - s, 3);
		const pts = circlePts(x, y, R * (0.03 + 2.4 * e), 0, TAU, 220);
		stroke(ctx, pts, { color: PAL.chalk, width: 1 + 7 * (1 - s), alpha: gain * (1 - s) });
	}
}

// The Θ of the plates: an upright ellipse with a bar, on a patch of board.
export function theta(ctx, x, y, rr, a = 1) {
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

// A polyline of math points through a view, broken wherever it runs further
// than `lim` math units off (so a line through ∞ is not drawn back across).
export function strokeMapped(ctx, view, pts, opts, lim = 7) {
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

// A soft dark patch of board behind a block of text, so it reads over a busy
// net or a room: x, y the block's top left, w × h its size, px.
export function backing(ctx, x, y, w, h, a = 0.8) {
	if (a <= 0) return;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = PAL.ground;
	ctx.shadowColor = PAL.ground;
	ctx.shadowBlur = 26;
	ctx.beginPath();
	ctx.roundRect(x - 14, y - 10, w + 28, h + 20, 14);
	ctx.fill();
	ctx.restore();
}

// The lecture: lines of maths top left, each [text, written 0..1, alpha = 1],
// on a soft patch of board (`back` its strength, 0 for none). Returns the
// block's height, px.
export function lecture(ctx, w, h, lines, { back = 0.75, color = PAL.chalk, size = null } = {}) {
	const R = 0.42 * Math.min(w, h);
	const sz = size ?? Math.round(Math.max(18, R * 0.07));
	const x = Math.max(28, w * 0.05);
	const y0 = Math.max(40, h * 0.08);
	const step = Math.max(30, sz * 1.6);
	const shown = lines.filter(([, p, a = 1]) => p > 0 && a > 0);
	if (back > 0 && shown.length) {
		ctx.save();
		ctx.font = `italic 400 ${sz}px ${MATH_FONT}`;
		const wMax = Math.max(
			...shown.map(([s]) => ctx.measureText(s.replace(/[\^_]\{|\}/g, '')).width)
		);
		ctx.restore();
		const k = Math.max(...shown.map(([, p, a = 1]) => clamp01(p * 3) * a));
		backing(ctx, x, y0 - sz * 0.7, wMax, step * (lines.length - 1) + sz * 1.4, back * k);
	}
	let y = y0;
	for (const [s, p, a = 1] of lines) {
		if (p > 0 && a > 0) math(ctx, s, x, y, { size: sz, upto: p, alpha: 0.92 * a, color });
		y += step;
	}
	return step * lines.length;
}
