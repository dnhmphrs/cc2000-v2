// ── The flash: white, and the room's colour coming up out of it ─────────────
// The swimmer reaching the last screen. The board goes white in `rise`
// seconds and holds a moment; then, rather than fading — a white veil thinning
// over the dark ground reads as grey — it BURNS OUT, the way an overexposed
// frame recovers: the dark ground comes back first and the room's bright
// colours last, so the room's colour comes up out of the white. It is a
// colour-dodge by a grey of level a over the frame: a pixel of value v shows
// min(1, v / (1 − a)), so as a falls from 1 the darks return almost at once
// and a light stays blown until a < 1 − v — the wall's cream last, the
// lamp's red through pink to red. A thin veil of the white (a⁸) rides over
// the first instants, so the hold hands to the burn-out without a step.
// A pure function of `s`, the seconds since the hit.
//
//   flash(ctx, w, h, s, { rise, hold, tau, under })
//
// `rise` the white's arrival, `hold` the seconds it is held full, `tau` the
// burn-out's time constant (a = e^−(s − hold)/tau). Draw it last but the grain.
//
// `under: true` for a flow that renders three.js under a board it clears:
// a blend paints a clear pixel opaque (over nothing, a dodge is just its
// grey), which would cover the picture underneath, so the board's clear parts
// are kept clear (its alpha, copied before, masks the burn-out after) and
// the GPU's picture there gets the plain white veil, thinning as a does.

import { span, smooth } from './board.js';

export const FLASH = { rise: 0.07, hold: 0.2, tau: 0.5, white: [255, 252, 245] };

let mask = null; // the board's alpha before the burn-out, for `under`

export function flash(
	ctx,
	w,
	h,
	s,
	{ rise = FLASH.rise, hold = FLASH.hold, tau = FLASH.tau, under = false } = {}
) {
	if (s < 0) return;
	const [r, g, b] = FLASH.white;
	const white = `rgb(${r}, ${g}, ${b})`;
	ctx.save();
	if (s < hold) {
		ctx.globalAlpha = smooth(span(s, 0, rise));
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, w, h);
		ctx.restore();
		return;
	}
	const a = Math.exp(-(s - hold) / tau);
	if (a < 0.003) return ctx.restore();
	const c = ctx.canvas;
	if (under) {
		mask ??= document.createElement('canvas');
		if (mask.width !== c.width || mask.height !== c.height) {
			mask.width = c.width;
			mask.height = c.height;
		}
		const m = mask.getContext('2d');
		m.clearRect(0, 0, c.width, c.height);
		m.drawImage(c, 0, 0);
	}
	// The burn-out: dodge by the white at level a.
	ctx.globalCompositeOperation = 'color-dodge';
	ctx.fillStyle = `rgb(${Math.round(r * a)}, ${Math.round(g * a)}, ${Math.round(b * a)})`;
	ctx.fillRect(0, 0, w, h);
	// And the veil, gone by the time the darks are back.
	const veil = Math.pow(a, 8);
	if (veil > 0.003) {
		ctx.globalCompositeOperation = 'source-over';
		ctx.globalAlpha = veil;
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, w, h);
	}
	if (under) {
		// The clear parts cleared again, and the white veil behind the board.
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'destination-in';
		ctx.drawImage(mask, 0, 0);
		ctx.globalCompositeOperation = 'destination-over';
		ctx.globalAlpha = a;
		ctx.fillStyle = white;
		ctx.fillRect(0, 0, c.width, c.height);
	}
	ctx.restore();
}
