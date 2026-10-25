// ── log-swimmer · genome — the body.js kit on its own ───────────────────────
// A test bed for the v5 flows' kit, not a flow: the demo's answers (14 · 02 ·
// 1987, spice 7) made into the person's swimmer by log/body.js, built ring by
// ring with the date's ROSETTE as every section, set swimming at draft's
// golden-angle disc (log/phyllo.js) seeded ahead of it, and the disc opening
// into the tunnel it swims down.
//
//    0   – 2     the rosette: intro/epicycle.js's rosette(date, spice), the
//                date's closed curve, written round by its chain of arms
//    1.9 – 2.7   it shrinks into the head as the lens comes up nose-on
//    2.1 – 6     the RINGS laid nose → tip (body.draw { rings }), each the
//                rosette in the station's (a, b): the head slowly, the lens
//                over the broad face, round to the edge, back along the tail
//    6   – 8     the GENERATRICES, one after another round the body
//    7.6 – 8.4   the CONTOUR
//    8.5         life: the spark at the midpiece; the beat in from the neck
//                to the tip (shape { beat }), the roll
//    9   – 13    it swims (laid along its path, pose { path, sigma }); the
//                disc seeded ahead of it at the golden angle, rim to centre;
//                the 8- and 13-spirals; the apex lit
//   13   – 16.2  the disc OPENS (phyllo opening(x), then log → 1): every seed
//                out along its sight line from the axis, then onto the log
//                map's even lattice, the spirals become helices; the lens
//                comes down behind the swimmer and follows it in
//   16   – 20    down the tunnel; ?amount= the rosette's share (default 0.35)

import { PAL, TAU, span, smooth, lerp, clamp01, camera3, disc, add3, mul3 } from '../log/board.js';
import { NEAR, spline3, makeDepth, lit3 } from '../log/space.js';
import { makeBody, specOf, rosetteSection } from '../log/body.js';
import { PHYLLO, seeds, parastichy, opening, seedFrame } from '../log/phyllo.js';
import { rosette } from '../intro/epicycle.js';
import { DEMO } from '../log/entry.js';

export const meta = {
	title:
		"genome — the date's rosette as the body's sections; the body.js kit, built ring by ring, then swimming at the disc as it opens into a tunnel",
	order: 13,
	seconds: 20,
	three: false
};

const FOV = 40;
const SPEED = 32; // world units a second, once under way
const R = 40; // the disc's rim
const ZD = 150; // the disc's plane, this far ahead of where the nose is built
const UP = [0, 1, 0];

// ∫ of a smoothstep ramp of length D: a clock that starts at rest.
function eased(x, D) {
	if (x <= 0) return 0;
	if (x >= D) return x - D / 2;
	const u = x / D;
	return D * (u * u * u - (u * u * u * u) / 2);
}

// The path it swims: straight down −z from the nose's start, then a slow
// helix of radius 2 about the axis once it is in the tunnel.
const path = (sg) => {
	const rh = 2 * smooth(span(sg, ZD - 20, ZD + 60));
	const a = sg / 24;
	return [rh * Math.cos(a), rh * Math.sin(a), -sg];
};

// The lens, keyed relative to the nose (world axes; the body is built at
// the origin heading −z, its tail toward +z): nose-on for the first rings,
// over the broad face (from +y), round to the edge (from +x), back along the
// tail; then round behind it and above for the swim, ahead of it the disc;
// down onto the disc's axis as it opens (from there the opening does not
// change the picture: phyllo.js), and off it again in the tunnel.
const EYE = [
	[2, [0.7, 0.9, -8]],
	[3, [2.6, 3.4, -7.4]],
	[4, [6, 4.4, -5.5]],
	[5, [16, 10, -10]],
	[6.2, [42, 27, -22]],
	[8.6, [46, 30, -20]],
	[10.8, [16, 26, 105]],
	[12.6, [3, 6, 102]],
	[15, [1.5, 4, 100]],
	[17, [4, 9, 97]],
	[20, [5, 11, 95]]
];
const TGT = [
	[2, [0, 0, 1.4]],
	[3, [0, 0, 2]],
	[4, [0, 0, 3]],
	[5, [0, 0, 9]],
	[6.2, [0, 0, 24]],
	[8.6, [0, 0, 24]],
	[10.8, [0, 0, -40]],
	[13, [0, 0, -45]],
	[20, [0, 0, -60]]
];
const sigmaAt = (t) => SPEED * eased(t - 9, 1.6);
const lensAt = (t) => {
	const nose = path(sigmaAt(t));
	const u = Math.max(2, t);
	return { pos: add3(nose, spline3(u, EYE)), target: add3(nose, spline3(u, TGT)) };
};
// The opening is seamless from (0, 0, E) on the disc's axis: E is where the
// lens is, along the axis, as the opening starts.
const E_OPEN = ZD + lensAt(13).pos[2];

export async function make() {
	const ros = rosette(DEMO.date, DEMO.spice);
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	const amount = q?.has('amount') ? clamp01(Number(q.get('amount'))) : 0.35;
	const spec = specOf(DEMO, { section: rosetteSection(ros, amount) });
	const body = makeBody(spec);
	const NR = body.rings.length;
	const nHead = body.rings.filter((i) => body.stations[i].part === 'head').length;
	const nMid = body.rings.filter((i) => body.stations[i].part !== 'tail').length;
	const sMid = (body.parts.mid[0] + body.parts.mid[1]) / 2;
	const sBroad = 0.42 * spec.head[0];
	const Z = makeDepth(4);

	// The disc, and its spirals, once.
	// The disc's 233 seeds reach ρ ≈ 0.002 R, but the log map lays them only
	// 6.3 radii deep: the tunnel is drawn on to 700 (the extra ones under a
	// pixel on the disc), so its far end is out of sight.
	const NSEED = 700;
	const SEEDS = seeds({ n: NSEED, R });
	const SP8 = [];
	const SP13 = [];
	for (let j = 0; j < 8; j++) SP8.push(parastichy(8, j, { R, n: NSEED, per: 6 }));
	for (let j = 0; j < 13; j++) SP13.push(parastichy(13, j, { R, n: NSEED, per: 4 }));
	const RIM = [];
	for (let i = 0; i <= 96; i++) RIM.push({ theta: (TAU * i) / 96, rho: R });

	return {
		render(ctx, w, h, t) {
			draw(ctx, w, h, t);
		}
	};

	function draw(ctx, w, h, t) {
		const sigma = sigmaAt(t);
		const shape = body.shape(t, {
			beat: span(t, 8.5, 9.5),
			phase: TAU * spec.beat.hz * eased(t - 8.5, 0.8) + spec.beat.phase,
			roll: TAU * spec.roll * eased(t - 8.6, 1.2)
		});
		const pose = { path, sigma, up: UP };

		// The lens.
		const L = lensAt(t);
		const cam = camera3({ pos: L.pos, target: L.target, up: UP, fov: FOV, w, h });

		// The rosette, first.
		const fig = 1 - smooth(span(t, 1.9, 2.7));
		if (fig > 0.01) rosetteFigure(ctx, w, h, t, cam, shape, pose, fig);
		if (t < 2) return;

		// The disc / tunnel, behind the body.
		Z.reset(w, h);
		body.fillDepth(Z, cam, shape, pose);
		if (t > 9.2) tunnel(ctx, w, h, t, cam);

		// The body.
		const nRings =
			t < 4.2
				? lerp(0, nHead, span(t, 2.1, 4.2))
				: t < 4.9
					? lerp(nHead, nMid, span(t, 4.2, 4.9))
					: lerp(nMid, NR, span(t, 4.9, 6));
		body.draw(ctx, cam, shape, pose, {
			rings: nRings / NR,
			gens: (j) => smooth(span(t, 6 + j * 0.07, 6.9 + j * 0.07)),
			contour: smooth(span(t, 7.6, 8.4)),
			axis: 0.6 * smooth(span(t, 2, 2.4)) * (1 - smooth(span(t, 7.6, 8.4))),
			back: 0.22 * (1 - 0.5 * smooth(span(t, 8, 9)))
		});
		// The spark at the midpiece.
		const spark = span(t, 8.45, 8.6) * (1 - 0.7 * smooth(span(t, 8.7, 9.6)));
		if (spark > 0) lit3(ctx, cam, body.at(shape, pose, sMid), 2.2, spark);
	}

	// The date's closed curve, written round by its chain of arms; then
	// shrunk into the head's broadest ring.
	function rosetteFigure(ctx, w, h, t, cam, shape, pose, fig) {
		let cx = w / 2;
		let cy = h / 2;
		let Rp = Math.min(0.22 * h, 0.46 * w);
		const sh = smooth(span(t, 1.9, 2.7));
		if (sh > 0) {
			const c = cam.project(body.at(shape, pose, sBroad));
			if (c[2] > NEAR) {
				cx = lerp(cx, c[0], sh);
				cy = lerp(cy, c[1], sh);
				Rp = lerp(Rp, 30, sh);
			}
		}
		const ph = TAU * smooth(span(t, 0.15, 1.85));
		const N = 900;
		const end = Math.floor((N * ph) / TAU);
		// As it shrinks, the full figure eases to the body's share of it.
		const sec = sh > 0 ? rosetteSection(ros, lerp(1, amount, sh), { M: 64 }) : null;
		const curve = sec ? (p) => sec(0, p) : ros.at;
		ctx.save();
		ctx.globalAlpha = 0.6 * fig;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		for (let i = 0; i <= end; i++) {
			const [x, y] = curve((TAU * i) / N);
			if (i) ctx.lineTo(cx + Rp * x, cy - Rp * y);
			else ctx.moveTo(cx + Rp * x, cy - Rp * y);
		}
		ctx.stroke();
		// The arms, from the centre, at f_k φ.
		const arms = 1 - smooth(span(t, 1.7, 2.1));
		if (arms > 0.01) {
			let x = cx;
			let y = cy;
			for (let kk = 0; kk < 8; kk++) {
				const rk = Rp * ros.r[kk];
				if (rk < 0.5) continue;
				const a = ros.f[kk] * ph;
				const nx = x + rk * Math.cos(a);
				const ny = y - rk * Math.sin(a);
				ctx.globalAlpha = 0.08 * fig * arms;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(x, y, rk, 0, TAU);
				ctx.stroke();
				ctx.globalAlpha = 0.3 * fig * arms;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(nx, ny);
				ctx.stroke();
				x = nx;
				y = ny;
			}
			disc(ctx, x, y, 2.1, { fill: PAL.gold, alpha: 0.62 * fig * arms });
		}
		disc(ctx, cx, cy, 2.4, { fill: PAL.chalk, alpha: 0.9 * fig });
		ctx.restore();
	}

	// The disc seeded ahead, its spirals, opening into the tunnel.
	function tunnel(ctx, w, h, t, cam) {
		const x = smooth(span(t, 13, 15));
		const lg = smooth(span(t, 14.2, 16.2));
		const map = (s) => {
			const p = opening(s, x, { R, a: R, E: E_OPEN, log: lg });
			return [p[0], p[1], p[2] - ZD];
		};
		const segs = new Map();
		const put = (al, wd, a, b) => {
			if (al < 0.025) return;
			const key = `${Math.round(al * 20)}|${Math.round(wd * 4)}`;
			let s = segs.get(key);
			if (!s) segs.set(key, (s = []));
			s.push(a[0], a[1], b[0], b[1]);
		};
		// What passes close to the lens (big on the board) is let go, so the
		// pattern reads where it is whole, ahead (and the board is not
		// stroked with long faint lines: the canvas's cost is their length).
		const near = (px) => 1 - smooth(span(px, 24, 110));
		// Down the tunnel the seeds overlap past ~2 radii deep (the log map
		// seen from its axis packs them as 1/depth): a fog by depth, as the
		// tunnel comes on.
		const fog = (z) => 1 - lg * smooth(span(z, 1.6 * R, 4.5 * R));
		const line = (pts, al, wd, upto = 1) => {
			const end = (pts.length - 1) * upto;
			let qa = cam.project(map(pts[0]));
			for (let i = 1; i < pts.length && i - 1 < end; i++) {
				const qb = cam.project(map(pts[i]));
				if (qa[2] > NEAR && qb[2] > NEAR) {
					const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2, (qa[2] + qb[2]) / 2];
					if (!Z.hidden(mid)) {
						const L = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]);
						put(al * near(L) * smooth(span(L, 0.6, 5)) * fog(mid[2]), wd, qa, qb);
					}
				}
				qa = qb;
			}
		};
		// The rim.
		line(RIM, 0.45, 1, smooth(span(t, 9.2, 10)));
		// The seeds, rim to centre at the golden angle.
		const t0 = 9.4;
		const dt = 3 / PHYLLO.n;
		for (let i = 0; i < SEEDS.length; i++) {
			const ti = t0 + Math.min(i, PHYLLO.n) * dt;
			const a = smooth(span(t, ti, ti + 0.3));
			if (a <= 0) break;
			const pop = 1 + 0.9 * (1 - smooth(span(t, ti, ti + 0.6)));
			const F = seedFrame(SEEDS[i], map);
			const qc = cam.project(F.c);
			if (qc[2] <= NEAR || a * fog(qc[2]) < 0.02) continue;
			const r = PHYLLO.seedR * pop * (1 - 0.5 * lg);
			const q1 = cam.project(add3(F.c, mul3(F.e1, r)));
			const q2 = cam.project(add3(F.c, mul3(F.e2, r)));
			const big = Math.max(
				Math.hypot(q1[0] - qc[0], q1[1] - qc[1]),
				Math.hypot(q2[0] - qc[0], q2[1] - qc[1])
			);
			if (big < 0.5 || q1[2] <= NEAR || q2[2] <= NEAR) continue;
			if (qc[0] + big < 0 || qc[0] - big > w || qc[1] + big < 0 || qc[1] - big > h) continue;
			if (Z.hidden(qc)) continue;
			const m = Math.max(6, Math.min(36, Math.round(4 + big / 2)));
			// Faint as they shrink into the distance, so the far end of the
			// tunnel is a haze rather than a white knot.
			const al = 0.75 * a * near(big) * smooth(span(big, 1.2, 6)) * fog(qc[2]);
			const wd = Math.min(1.4, 0.5 + big * 0.1);
			let pa = null;
			for (let kk = 0; kk <= m; kk++) {
				const c = Math.cos((TAU * kk) / m);
				const s = Math.sin((TAU * kk) / m);
				const p = [
					qc[0] + c * (q1[0] - qc[0]) + s * (q2[0] - qc[0]),
					qc[1] + c * (q1[1] - qc[1]) + s * (q2[1] - qc[1])
				];
				if (pa) put(al, wd, pa, p);
				pa = p;
			}
		}
		// The spirals.
		const p8 = smooth(span(t, 11.8, 13.2));
		const p13 = smooth(span(t, 12.3, 13.7));
		if (p8 > 0) for (const sp of SP8) line(sp, 0.6, 1.05, p8);
		if (p13 > 0) for (const sp of SP13) line(sp, 0.45, 0.95, p13);
		ctx.save();
		ctx.strokeStyle = PAL.chalk;
		ctx.lineCap = 'round';
		for (const [key, s] of segs) {
			const [a, wq] = key.split('|').map(Number);
			ctx.globalAlpha = a / 20;
			ctx.lineWidth = wq / 4;
			ctx.beginPath();
			for (let i = 0; i < s.length; i += 4) {
				ctx.moveTo(s[i], s[i + 1]);
				ctx.lineTo(s[i + 2], s[i + 3]);
			}
			ctx.stroke();
		}
		ctx.restore();
		// The apex: the lattice's fixed point, at the disc's centre, then the
		// tunnel's vanishing point.
		const ap = smooth(span(t, 12.8, 13.8));
		if (ap > 0) {
			const P = map({ theta: 0, rho: R * 1e-4 });
			const far = [0, 0, -ZD - 1e5]; // down the open tunnel, at its vanishing point
			for (const [Q, wt] of [
				[P, 1 - lg],
				[far, lg]
			]) {
				const qa = cam.project(Q);
				if (wt > 0.01 && qa[2] > NEAR && !Z.hidden(qa)) lit3(ctx, cam, Q, 2.2, 0.8 * ap * wt);
			}
		}
	}
}
