// ── The splash: the swimmer reaching the last room's screen ─────────────────
// Lifted out of flow-conception so every flow can end on it:
//   splash(ctx, glass, s, seed)   glass the screen's box on the board,
//                                 [x0, y0, x1, y1] (fall.draw's cam.glass),
//                                 s the seconds since the hit, seed any
//                                 number the run's answers give (the spice)

import { PAL, TAU, span, smooth, lerp } from './board.js';
import { glow } from './ink.js';

// THE SPLASH on the last room's screen, `s` seconds after the swimmer
// reaches it: a gold burst, a ring of droplets flung out and falling, two
// ripples, and the mark it leaves. Clipped to the glass; seeded, so a pinned
// frame is the same frame.
export function splash(ctx, gb, s, spice) {
	const gw = gb[2] - gb[0];
	const gh = gb[3] - gb[1];
	const cx = (gb[0] + gb[2]) / 2;
	const cy = (gb[1] + gb[3]) / 2;
	const R = 0.3 * Math.min(gw, gh);
	ctx.save();
	ctx.beginPath();
	ctx.rect(gb[0], gb[1], gw, gh);
	ctx.clip();
	// The flash of the hit.
	const flare = Math.exp(-s / 0.18);
	if (flare > 0.01) glow(ctx, cx, cy, 1.4 * R, [255, 226, 160], 0.9 * flare);
	// The mark: a wobbly blot, quickly out to its size, then settling.
	const grow = 1 - Math.pow(1 - Math.min(1, s / 0.28), 3);
	const blotA = lerp(0.95, 0.55, smooth(span(s, 0.3, 2.5)));
	ctx.save();
	ctx.globalAlpha = blotA;
	ctx.fillStyle = PAL.gold;
	ctx.beginPath();
	for (let i = 0; i <= 64; i++) {
		const a = (TAU * i) / 64;
		const r =
			R *
			grow *
			(0.72 +
				0.12 * Math.sin(5 * a + 1.3) +
				0.08 * Math.sin(9 * a + 0.4) +
				0.05 * Math.sin(13 * a));
		const x = cx + r * Math.cos(a);
		const y = cy + r * Math.sin(a);
		if (i) ctx.lineTo(x, y);
		else ctx.moveTo(x, y);
	}
	ctx.fill();
	ctx.restore();
	// The droplets: flung out on seeded rays, slowing, falling, fading.
	let seed = 1987 + spice;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const fly = 1 - Math.exp(-s / 0.22);
	for (let i = 0; i < 14; i++) {
		const a = TAU * (i / 14 + 0.06 * rnd());
		const d = R * (1.05 + 0.9 * rnd()) * fly;
		const drop = 0.35 * R * s * s;
		const rr = R * (0.05 + 0.06 * rnd()) * (1 - 0.5 * smooth(span(s, 0.4, 2)));
		const da = 1 - smooth(span(s, 0.8 + 0.6 * rnd(), 2.4));
		if (da <= 0.01) continue;
		ctx.save();
		ctx.globalAlpha = 0.9 * da;
		ctx.fillStyle = i % 3 ? PAL.gold : PAL.chalk;
		ctx.beginPath();
		ctx.arc(cx + d * Math.cos(a), cy + d * Math.sin(a) + drop, rr, 0, TAU);
		ctx.fill();
		ctx.restore();
	}
	// Two ripples out from the hit.
	for (const [d0, a0] of [
		[0, 0.8],
		[0.18, 0.55]
	]) {
		const x = s - d0;
		if (x <= 0) continue;
		const rr = R * (0.8 + 2.2 * (1 - Math.exp(-x / 0.5)));
		const ra = a0 * (1 - smooth(span(x, 0, 1.4)));
		if (ra <= 0.01) continue;
		ctx.save();
		ctx.globalAlpha = ra;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.ellipse(cx, cy, rr, rr * 0.92, 0, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}
	ctx.restore();
}
