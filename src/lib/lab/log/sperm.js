// ── The swimmer, as a golden spiral ──────────────────────────────────────────
// No model: the sperm is a stretch of the golden spiral r = φ^(2θ/π) — the
// tight coil at its pole is the head, the arc unwinding from it the tail — as
// on the plate where the golden spiral sits in the circle and reads at once
// as a sperm. Because it is a logarithmic spiral, turning it is the same as
// scaling it: spun steadily it looks to pour itself out of its head forever,
// which is the beat of a tail, and swum along its own curve into its pole it
// is the loxodromic flow of the tunnel it is swimming down.
//
// Everything is in the view's math units; `pole` is where the spiral's pole
// (the head) sits, `scale` how big the spiral is (the radius, in math units,
// at θ = 0 of the spiral's own angle), and `turn` how far it is turned.

import { PAL, GOLDEN_K, TAU, stroke, disc, bloom, lerp, clamp01 } from './board.js';

// The tail: from the head's angle out `length` radians (a turn and a bit is
// a sperm; two turns, the whole plate), as math points.
export function spiralArc({
	pole = [0, 0],
	scale = 1,
	turn = 0,
	from = -Math.PI,
	length = 7,
	n = 260,
	wiggle = 0,
	phase = 0
}) {
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const s = i / n; // 0 at the head, 1 at the tail's tip
		const t = from + length * s;
		const r = scale * Math.exp(GOLDEN_K * t);
		let a = t + turn;
		// The beat: a small wave running down the tail, growing toward the
		// tip, as an angular nudge (so it stays on the spiral's family).
		if (wiggle) a += wiggle * s * s * Math.sin(TAU * (2.2 * s - phase));
		pts.push([pole[0] + r * Math.cos(a), pole[1] + r * Math.sin(a)]);
	}
	return pts;
}

// Draw the swimmer through a view. `body` 0..1 brings it in (the tail drawn
// out from the head, the head swelling), `alpha` fades it.
export function drawSperm(ctx, view, o = {}) {
	const {
		pole = [0, 0],
		scale = 1,
		turn = 0,
		from = -Math.PI * 0.35,
		length = 7.2,
		width = 6, // the tail's width at the head, px
		tip = 2.2, // and at its tip
		color = PAL.gold,
		head = 'coil', // 'coil' (the spiral's own inner turns) | 'disc' | 'none'
		headSize = 1, // multiplies the head's coil or disc
		body = 1,
		alpha = 1,
		wiggle = 0.12,
		phase = 0,
		glow = 0
	} = o;
	if (alpha <= 0 || body <= 0) return;
	// The tail, written out from the head as `body` grows.
	const tail = spiralArc({
		pole,
		scale,
		turn,
		from,
		length: length * clamp01(body),
		wiggle,
		phase
	});
	const P = tail.map(view.to);
	const wTip = lerp(width, tip, clamp01(body));
	stroke(ctx, P, { color, taper: [width, wTip], alpha: alpha * 0.98, glow });
	// The head: the spiral's own coil, a turn and a half tighter in, drawn
	// heavy — or a disc at the coil's centre.
	const hs = smoothHead(body) * headSize;
	if (hs <= 0) return;
	if (head === 'coil') {
		const coil = spiralArc({ pole, scale, turn, from: from - 9.5, length: 9.5, n: 160 }).map(
			view.to
		);
		stroke(ctx, coil, { color, taper: [width * 0.35 * hs, width * hs], alpha, glow });
		const [hx, hy] = view.to(pole);
		disc(ctx, hx, hy, Math.max(1.5, width * 0.62 * hs), { fill: color, alpha });
	} else if (head === 'disc') {
		const at = spiralArc({ pole, scale, turn, from, length: 0, n: 1 })[0];
		const [hx, hy] = view.to(at);
		disc(ctx, hx, hy, width * 1.4 * hs, { fill: color, alpha, glow });
		disc(ctx, hx - width * 0.35, hy - width * 0.35, width * 0.45 * hs, {
			fill: PAL.chalk,
			alpha: alpha * 0.8
		});
	}
	if (glow) {
		const [hx, hy] = view.to(pole);
		bloom(ctx, hx, hy, width * 6 * hs, 'rgba(245, 193, 80, 0.35)', alpha);
	}
}

const smoothHead = (b) => {
	const x = clamp01((b - 0.15) / 0.5);
	return x * x * (3 - 2 * x);
};
