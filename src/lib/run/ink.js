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

import { TAU } from './board.js';

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
