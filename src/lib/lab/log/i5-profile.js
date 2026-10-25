// ── i5 · THE PROFILE: the date as harmonics, turned on the lathe ─────────────
// Variant I5's way of making the swimmer from the input. The eight digits of
// the birth date are eight HARMONICS of one wave along the body — digit i is
// harmonic k = i + 1 (sin kπu down the head, neck and midpiece, u 0 → 1),
// its amplitude the digit's value (0 silent, 9 full), weighted 1/√k as a
// Fourier series falls off, each in with its own phase so no two peak
// together — and the spice is the CUT'S DEPTH: how far the wave bites into
// the body's silhouette (5% at 1, 19% at 10). That PROFILE WAVE is the
// silhouette of a solid of revolution: the lathe turns it about its axis, and
// the body's stations take it as their section (log/body.js `section`: a
// circle of radius ρ(u), fluted round by the spice, n = spice + 2 shallow
// flutes), so the swimmer IS the date turned.
//
//   harmonicsOf(digits)         [{ k, a, ph, g }] from digitsAt's [{ d, g }]
//   depthOf(spice)              the cut's depth
//   profileOf(H, depth)         u → ρ, the silhouette's radius (1 = the body's own)
//   waveSection(H, depth, spice, stations, S_LEN)   the body's section hook
//   drawProfile(ctx, cam, o)    the profile on the board: the axis, the eight
//                               harmonics faint, the silhouette bold both sides
//                               of the axis — the half-plane swung round it by
//                               the lathe's turn a0 — the digits lettered over
//                               their harmonics, the cutter's gold trace
import { TAU, PAL, TECH_FONT, stroke, disc, lerp, smooth, span } from './board.js';
import { NEAR } from './space.js';

export const WAVE = { depth: [0.05, 0.19], lobe: 0.03, M: 48, gens: 16 };

export function harmonicsOf(digits) {
	const out = [];
	for (let i = 0; i < 8; i++) {
		const dg = digits[i] ?? { d: null, g: 0 };
		const k = i + 1;
		out.push({
			k,
			d: dg.d,
			a: dg.d === null ? 0 : dg.d / 9,
			g: dg.g ?? 0,
			ph: (0.37 * i * TAU) % TAU
		});
	}
	return out;
}
export const depthOf = (spice) =>
	lerp(WAVE.depth[0], WAVE.depth[1], (Math.max(1, Math.min(10, Number(spice) || 5.5)) - 1) / 9);

// The wave itself, −1 … 1 (normalised by the weight typed so far), and the
// silhouette 1 + depth · wave.
export function waveOf(H) {
	let norm = 0;
	for (const h of H) norm += (h.a * h.g) / Math.sqrt(h.k);
	const n = Math.max(0.6, norm);
	return (u) => {
		let s = 0;
		for (const h of H)
			if (h.a * h.g > 0) s += ((h.a * h.g) / Math.sqrt(h.k)) * Math.sin(h.k * Math.PI * u + h.ph);
		return s / n;
	};
}
export function profileOf(H, depth) {
	const w = waveOf(H);
	return (u) => 1 + depth * w(u);
}

// The section for makeBody: station i's ring is the circle of the profile's
// radius there, fluted by the spice.
export function waveSection(H, depth, spice, stations, S_LEN) {
	const prof = profileOf(H, depth);
	const n = Math.round(Math.max(1, Math.min(10, Number(spice) || 5.5))) + 2;
	const rho = stations.map((st) => prof(Math.max(0, Math.min(1, st.s / S_LEN))));
	const fn = (i, ph) => {
		const r = rho[i] * (1 + WAVE.lobe * Math.cos(n * ph));
		return [r * Math.cos(ph), r * Math.sin(ph)];
	};
	fn.M = WAVE.M;
	fn.gens = WAVE.gens;
	fn.uniform = false;
	return fn;
}

// The profile on the board. o: { H, a0, r, alpha, letters, bad, trace,
// inside, reach, S_LEN, DS, depth } — the silhouette ±r·ρ(u) about the axis
// out to `reach`, drawn BOLD in the plane that faces the lens (the wave
// always read whole as it is typed, cut deeper than the body takes it so the
// wave reads), each typed harmonic faint above the axis in that plane, the
// digits lettered over their harmonics; and the LATHE'S TURN: the same
// silhouette faint in three meridian planes turning about the axis by a0
// (the solid of revolution sketched under the wave). `trace` (0…1, or null)
// the cutter's gold pass along the near silhouette; `inside` [x0, x1, k]
// where the body's rings already hold it (drawn k as bright there).
export function drawProfile(ctx, cam, o) {
	const { H, a0, r, alpha, letters, bad, trace = null, inside = null, S_LEN, DS, depth } = o;
	if (alpha <= 0.004) return null;
	let reach = 0;
	for (let i = 0; i < 8; i++) if (H[i].g > 0) reach = Math.max(reach, (i + 1) * DS * H[i].g);
	if (o.reach !== undefined) reach = o.reach;
	if (reach <= 0.01) return null;
	const eye = cam.pos;
	// the facing plane: the one through the axis whose in-plane direction is
	// square to the line of sight
	const vl = Math.hypot(eye[1], eye[2]) || 1;
	const v = [eye[1] / vl, eye[2] / vl];
	const d = [v[1], -v[0]];
	const aF = Math.atan2(d[1], d[0]);
	const dim = (x) => (inside && x >= inside[0] && x <= inside[1] ? inside[2] : 1);
	const planeAt = (a) => {
		const ca = Math.cos(a);
		const sa = Math.sin(a);
		return (x, yy) => [x, yy * ca, yy * sa];
	};
	const P = planeAt(aF);
	// (drawn deeper than cut: the wave readable at any spice)
	const drawn = 0.28 + 1.6 * depth;
	const prof = profileOf(H, drawn);
	const n = Math.max(8, Math.ceil(reach / 0.06));
	let norm = 0;
	for (const h of H) norm += (h.a * h.g) / Math.sqrt(h.k);
	norm = Math.max(0.6, norm);
	const runs = (fy, width, a, Pl, sides = [1, -1], color = PAL.chalk) => {
		for (const sgn of sides) {
			let pts = [];
			let key = null;
			const flush = () => {
				if (pts.length > 1 && key !== null)
					stroke(ctx, pts, { color, width, alpha: alpha * a * key });
				pts = [];
			};
			for (let i = 0; i <= n; i++) {
				const x = (reach * i) / n;
				const q = cam.project(Pl(x, sgn * fy(x / S_LEN) * r));
				const dd = dim(x);
				if (q[2] <= NEAR) {
					flush();
					key = null;
					continue;
				}
				if (key !== null && key !== dd) {
					flush();
					pts.push(q);
				} else pts.push(q);
				key = dd;
			}
			flush();
		}
	};
	// the axis, dashed
	{
		const q0 = cam.project([0, 0, 0]);
		const q1 = cam.project([Math.max(reach, S_LEN), 0, 0]);
		if (q0[2] > NEAR && q1[2] > NEAR) {
			ctx.save();
			ctx.setLineDash([4, 5]);
			stroke(ctx, [q0, q1], { color: PAL.chalkDim, width: 0.8, alpha: 0.5 * alpha });
			ctx.restore();
		}
	}
	// the lathe's turn: the silhouette in three meridians turning by a0,
	// faint, the near side of each a little bolder
	for (let j = 0; j < 3; j++) {
		const a = a0 + (j * TAU) / 3;
		const ca = Math.cos(a);
		const sa = Math.sin(a);
		// how much this plane faces the lens (edge-on: 0 — it is then the
		// facing plane's own line, and is not drawn over it)
		const f = Math.abs(ca * d[0] + sa * d[1]);
		if (f < 0.12) continue;
		const near = ca * v[0] + sa * v[1] >= 0 ? 1 : 0.6;
		runs((u) => prof(u), 0.8, 0.16 * f * near, planeAt(a));
	}
	// each harmonic, faint, above the axis in the facing plane, growing in
	// as it is typed
	for (const h of H) {
		if (h.a * h.g <= 0.001) continue;
		const amp = (drawn * ((h.a * h.g) / Math.sqrt(h.k))) / norm;
		runs((u) => 1 + 1.9 * amp * Math.sin(h.k * Math.PI * u + h.ph), 0.7, 0.26 * h.g, P, [1]);
	}
	// the silhouette, bold, both sides
	runs((u) => prof(u), 1.3, 0.62, P);
	// the digits over their harmonics' first crests, lettered in the
	// terminal's face
	if (letters > 0.01) {
		const fs = Math.max(
			8,
			Math.min(13, (cam.k * 0.42) / Math.max(1, Math.hypot(eye[0] - S_LEN / 2, eye[1], eye[2])))
		);
		ctx.save();
		ctx.font = `400 ${fs}px ${TECH_FONT}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let i = 0; i < 8; i++) {
			const h = H[i];
			if (h.d === null || h.g <= 0.6) continue;
			const x = (i + 0.5) * DS;
			if (x > reach + 0.01) continue;
			const amp = (drawn * ((h.a * h.g) / Math.sqrt(h.k))) / norm;
			const yy = (1 + 1.9 * amp + 0.16) * r + 0.1 * r * (i % 2);
			const q = cam.project(P(x, yy));
			if (q[2] <= NEAR) continue;
			ctx.globalAlpha = alpha * letters * dim(x) * smooth(span(h.g, 0.6, 1)) * 0.7;
			ctx.fillStyle = bad[i >> 1] ? PAL.rose : PAL.chalk;
			ctx.fillText(String(h.d), q[0], q[1]);
		}
		ctx.restore();
	}
	// the cutter's pass: a gold trace along the silhouette, the tool at its end
	if (trace !== null && trace > -0.2 && trace < 1.2) {
		const x0 = Math.max(0, (trace - 0.12) * reach);
		const x1 = Math.min(reach, trace * reach);
		if (x1 > x0) {
			const pts = [];
			for (let i = 0; i <= 14; i++) {
				const x = lerp(x0, x1, i / 14);
				pts.push(cam.project(P(x, prof(x / S_LEN) * r)));
			}
			if (pts.every((p) => p[2] > NEAR))
				stroke(ctx, pts, { color: PAL.gold, width: 1.6, alpha: 0.85 * alpha });
		}
		if (trace >= 0 && trace <= 1) {
			const x = trace * reach;
			const tip = cam.project(P(x, prof(x / S_LEN) * r));
			const up = cam.project(P(x, prof(x / S_LEN) * r + 0.9));
			if (tip[2] > NEAR && up[2] > NEAR) {
				stroke(ctx, [tip, up], { color: PAL.gold, width: 1.2, alpha: 0.7 * alpha });
				disc(ctx, tip[0], tip[1], 2.2, { fill: PAL.gold, alpha: 0.85 * alpha });
			}
		}
	}
	return { reach, P };
}
