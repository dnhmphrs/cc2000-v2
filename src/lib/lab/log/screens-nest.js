// ── Screens: the machine's own screens, nested — and the light in them ───────
// flow-strand-screens' kit. The fall's nest (log/fall.js's own geometry:
// level k is room k under x ↦ O_k + s_k·x, its child hung in its glass) seen
// from far before its first plate, so the journey from the swimmer's life to
// the last room is ONE flight down it — but drawn here rather than by
// fall.draw, because here the rooms come up OUT OF THE DARK layer by layer
// (light(k, key)), the board is left clear wherever a room is dark, and every
// glass is handed back so a GPU field can light it: the screens glow and the
// rooms round them are lit by them.
//
//   const geometry = nestOf({ art, order, zeta0 })   (w, h) → the fitted nest
//   const cam = lensOf(g, E, t, { w, h, land, push, fill, sway, ox, oy, mul })
//              the lens E e-folds down from ζ₀ (g.zetaOf), slid to the last
//              plate's centre by `land`, pushed in by `push` to `fill` (as
//              fall.js's), swaying by `sway`, its vanishing point at (ox, oy)
//              and its focal length mul × the nest's own
//   const glasses = drawNest(ctx, w, h, g, art, cam, { light, paint, hand, t, dry })
//              light(k, key) 0…1: room k's layer in chalk (key one of bg,
//              poster, clock, screen, desk, bed, frame); paint(k, key) 0…1
//              its colour; hand(k) 0…1 a warm hand-drawn outline round its
//              glass that boils on twos; dry, nothing drawn. Returns every
//              glass drawn, outermost first: { k, G: [x0, y0, x1, y1] its
//              rect on the board, gb the part of it inside its room's frame }
//   const gpu = makePhosphor({ THREE, renderer, scale })   the light, or null
//              (null too on a software renderer unless `scale` is given)
//   gpu.render(state)   the light UNDER the board (cleared clear over it), ONE
//              fragment pass over the board: the ground, and for each lit
//              glass its phosphor (a warm haze vignetted like a tube), the
//              light it spills round it onto the dark room and a halo behind
//              its type; the SUNSHINE once, seen through the glasses; the
//              first glass's golden-angle disc; the point at infinity; the
//              lamp (state.lamp { c, r, a }: the first glass as a light ahead)
//   phosphor2D(ctx, w, h, state)   the same drawn on the board (the ground
//              first: the board's nest and type go over it)
//
// THE SUNSHINE. The lead's "radial sunshine polar lattice … a log polar
// lattice but you're seeing the point at infinity that every line leads to",
// at the nest's vanishing point: 34 rays, the log rings, and the disc's own
// 8- and 13-parastichies — φ_m(ℓ, θ) = mθ/2π + ε_m k (ℓ − ln R)/ln φ, lines at
// the integers (phyllo.js) — so the sunshine IS draft's lattice run on to its
// limit point. In log-polar coordinates a zoom is a translation, so it
// streams with the flight exactly (ℓ = ln r − ln R, ln R the lens's own
// zoom). Coloured by angle and by ln r through warm spectral hues (reds,
// oranges, golds, yellows, a rose and a violet). Lines are anti-aliased by
// their analytic pixel distance and merge into their mean where they crowd.
//
// THE DISC. The first screen's picture: seed n at θ = nα, ρ = Rφ^(−n/k),
// a ring of 0.16ρ (draft's). In (ln ρ/R, θ) the seeds are a lattice whose
// basis is the 8- and 13-parastichies' own steps, orthogonal at this k, so a
// pixel's nearest seed is its coordinates in that basis rounded (seed
// 8a + 13b) — one candidate, not a search — and the spirals are the lines of
// constant a and b. Sown rim to centre (`sown`), its eye — the next screen —
// opening (`open`).
//
// COST. In a browser with a GPU, next to nothing: one pass of a few hundred
// operations a pixel, the board's own work a few ms of script. Under a
// software renderer (the sandbox's SwiftShader, either lane) a frame that
// puts GL pixels on the page at all costs 150–350 ms, whatever it draws:
// measured apart, the field into a half-size target alone left the frame at
// the board's own 33–83 ms, and the blit of it to the page's canvas — or a
// drawImage of a GL canvas into the board — was all the rest (the lab's own
// full-screen TSL sketches, red-sun and runout, take 1–2 s a frame there).
// So on a software renderer makePhosphor returns null and the flow draws
// the light on the board (phosphor2D: the same haze, spill, sunshine, disc,
// lamp and core as strokes, gradients and one half-size pattern, its mean
// brightness within a few levels of the GPU's at every beat; a frame of the
// flow 33–50 ms there against the core's 17–33, the sunshine ~5 ms of it);
// `scale` (?glow= in the flow) asks for the GPU pass anyway, at that
// fraction of each side.
//
// What is exact: the nest (fall.js's similarities), the lattice. What is a
// picture: the light.

import { PAL, PHI, TAU, span, smooth, lerp, stroke } from './board.js';
import { PLATE, drawImageAt } from './rooms.js';
import { makeFall } from './fall.js';
import { PHYLLO } from './phyllo.js';

export const SLOTS = 8; // glasses the field can light at once

// ── The nest ─────────────────────────────────────────────────────────────────
export function nestOf({ art, order, zeta0 }) {
	const fall = makeFall({
		art,
		order,
		zeta0,
		beats: { fall: [0, 1], land: [0, 1], colour: [0, 1], swim: [-2, -1] }
	});
	return (w, h) => fall.geometry(w, h);
}

// ── The lens ─────────────────────────────────────────────────────────────────
// fall.js's lensAt, on a clock of its own: E e-folds from ζ₀.
export function lensOf(g, E, t, o) {
	const cam = g.pose(g.zetaOf(E));
	const last = g.levels[g.L];
	const land = o.land ?? 0;
	cam.x -= last.s * last.glass.x * land;
	cam.y -= last.s * last.glass.y * land;
	if (o.fill && o.push > 0) {
		const want = Math.min(o.fill.h * o.h, ((o.fill.w ?? 0.98) * o.w) / PHI);
		const k = lerp(1, Math.max(1, want / (g.plate * (o.mul ?? 1))), o.push);
		const zP = last.O[2];
		cam.z = zP + (cam.z - zP) / k;
	}
	const A = o.sway ?? 0;
	const ex = A * Math.sin(1.1 * t - 0.4);
	const ey = A * 0.45 * Math.sin(1.7 * t + 0.6);
	cam.x += cam.s * ex;
	cam.y += cam.s * ey;
	cam.F = g.F * (o.mul ?? 1);
	cam.ox = (o.ox ?? o.w / 2) + (cam.F * ex) / g.d0;
	cam.oy = (o.oy ?? o.h / 2) - (cam.F * ey) / g.d0;
	return cam;
}

// ── The nest, drawn ──────────────────────────────────────────────────────────
// fall.js's drawFall with the rooms' light in the flow's hands: nothing is
// filled — a dark room is the field under the board — and each layer is its
// chalk copy at light(k, key), its colour under it at paint(k, key).
const FRONT = ['screen', 'desk', 'bed'];
const BACK = ['bg', 'poster', 'clock'];
export function drawNest(
	ctx,
	w,
	h,
	g,
	art,
	cam,
	{ light, paint, hand, t, nearZ = 0.015, dry = false }
) {
	const { L, levels } = g;
	const F = cam.F;
	const project = (x, y, z) => {
		const d = cam.z - z;
		return [cam.ox + (F * (x - cam.x)) / d, cam.oy - (F * (y - cam.y)) / d, d];
	};
	const plane = (lv, z) => {
		const wz = lv.O[2] + lv.s * z;
		const dw = cam.z - wz;
		if (dw <= nearZ * cam.s) return null;
		const m = (F * lv.s) / dw;
		const [e, f] = project(lv.O[0], lv.O[1], wz);
		return { m, e, f };
	};
	const at = (T, x, y) => [T.e + T.m * x, T.f - T.m * y];
	const boxOf = (T, x, y, rw, rh) => {
		const [x0, y0] = at(T, x - rw / 2, y + rh / 2);
		return [x0, y0, x0 + rw * T.m, y0 + rh * T.m];
	};
	const meet = (A, C) => [
		Math.max(A[0], C[0]),
		Math.max(A[1], C[1]),
		Math.min(A[2], C[2]),
		Math.min(A[3], C[3])
	];
	const empty = (X) => X[2] <= X[0] || X[3] <= X[1];
	const pathBox = (X) => ctx.rect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
	const clipBox = (X) => {
		ctx.beginPath();
		pathBox(X);
		ctx.clip();
	};
	const corners = (X) => [
		[X[0], X[1]],
		[X[2], X[1]],
		[X[2], X[3]],
		[X[0], X[3]],
		[X[0], X[1]]
	];
	const layer = (lv, key, k, box) => {
		if (dry) return;
		const l = lv.lay[key];
		const a = art[lv.decade]?.[key];
		if (!l || !a) return;
		const c = light(k, key);
		const p = paint(k, key);
		if (c <= 0.004 && p <= 0.004) return;
		const T = plane(lv, l.z);
		if (!T || l.w * T.m < 3) return;
		const tiles = key === 'bg' ? 1 : 0;
		for (let j = -tiles; j <= tiles; j++)
			for (let i = -tiles; i <= tiles; i++) {
				const x = l.x + i * l.w;
				const y = l.y + j * l.h;
				const R = boxOf(T, x, y, l.w, l.h);
				if (empty(meet(R, box))) continue;
				const [px, py] = at(T, x, y);
				const sw = l.w * T.m;
				const sh = l.h * T.m;
				ctx.save();
				if (j % 2 !== 0) {
					ctx.translate(px, py);
					ctx.scale(1, -1);
					ctx.translate(-px, -py);
				}
				const flipX = i % 2 !== 0;
				if (p > 0.004) drawImageAt(ctx, a.mips, px, py, sw, sh, { alpha: p, flipX });
				if (a.chalk && c * (1 - p) > 0.004)
					drawImageAt(ctx, a.chalk, px, py, sw, sh, { alpha: 0.95 * c * (1 - p), flipX });
				ctx.restore();
			}
		// The layer's own rectangle, dashed in: the drawing's construction.
		if (key !== 'bg' && p < 1 && l.w * T.m > 14 && c > 0.02)
			stroke(ctx, corners(boxOf(T, l.x, l.y, l.w, l.h)), {
				color: PAL.chalk,
				width: 0.9,
				alpha: 0.32 * c * (1 - p),
				dash: [4, 5]
			});
	};

	const glasses = [];
	const drawLevel = (k, box) => {
		const lv = levels[k];
		const T0 = plane(lv, 0);
		const frame = T0 ? meet(box, boxOf(T0, 0, 0, PLATE.W, PLATE.H)) : box;
		if (empty(frame)) return;
		const Tg = lv.glass ? plane(lv, lv.glass.z) : null;
		const G = Tg ? boxOf(Tg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		const gb = G ? meet(frame, G) : null;
		const hole = gb && !empty(gb);
		if (G) glasses.push({ k, G, gb: hole ? gb : null });
		ctx.save();
		clipBox(frame);
		ctx.save();
		if (hole) {
			ctx.beginPath();
			pathBox(frame);
			pathBox(gb);
			ctx.clip('evenodd');
		}
		for (const key of BACK) layer(lv, key, k, frame);
		ctx.restore();
		if (hole && k < L && gb[2] - gb[0] > 2) {
			ctx.save();
			clipBox(gb);
			drawLevel(k + 1, gb);
			ctx.restore();
		}
		for (const key of FRONT) layer(lv, key, k, frame);
		const cg = dry ? 0 : light(k, 'screen') * (1 - paint(k, 'screen'));
		if (G && cg > 0.004)
			stroke(ctx, corners(G), { color: PAL.chalk, width: 1.2, alpha: 0.55 * cg });
		const hd = hand && !dry ? hand(k) : 0;
		if (G && hd > 0.004) handBox(ctx, G, k, t, hd);
		ctx.restore();
		const cf = dry ? 0 : light(k, 'frame') * (1 - paint(k, 'frame'));
		if (T0 && cf > 0.004)
			stroke(ctx, corners(boxOf(T0, 0, 0, PLATE.W, PLATE.H)), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9 * cf
			});
	};

	// Every glass the lens has passed is dropped.
	let base = 0;
	for (let k = 0; k < L; k++) {
		const lv = levels[k];
		if (cam.z <= lv.O[2] + lv.s * lv.glass.z + nearZ * cam.s) base = k + 1;
		else break;
	}
	drawLevel(base, [0, 0, w, h]);
	return glasses;
}

// A glass's outline as a hand draws it: a rounded box gone round twice with
// a wobble that is drawn again 12 times a second (on twos), warm.
const HAND = { rate: 12, color: 'rgb(255, 196, 132)' };
function hash(n) {
	let x = (n * 374761393 + 668265263) | 0;
	x = (x ^ (x >>> 13)) * 1274126177;
	return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
function handBox(ctx, G, k, t, a) {
	const W = G[2] - G[0];
	const H = G[3] - G[1];
	if (W < 6 || W > 6000) return;
	const frame = Math.floor(t * HAND.rate);
	const amp = Math.min(3.2, 0.6 + 0.008 * Math.min(W, H));
	const r = 0.09 * Math.min(W, H);
	const cx = (G[0] + G[2]) / 2;
	const cy = (G[1] + G[3]) / 2;
	const n = 44;
	ctx.save();
	ctx.strokeStyle = HAND.color;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (let pass = 0; pass < 2; pass++) {
		const seed = k * 9973 + frame * 131 + pass * 17;
		ctx.globalAlpha = a * (pass ? 0.35 : 0.7);
		ctx.lineWidth = pass ? 0.9 : Math.min(2.2, 0.9 + 0.004 * W);
		ctx.beginPath();
		const lap = 1.04 + 0.05 * hash(seed + 5);
		for (let i = 0; i <= n * lap; i++) {
			const u = (i / n) * TAU;
			// A superellipse for the tube's rounded box, then the wobble.
			const c = Math.cos(u);
			const s = Math.sin(u);
			const e = 0.18;
			const x = Math.sign(c) * Math.pow(Math.abs(c), e) * (W / 2 - r * 0.2);
			const y = Math.sign(s) * Math.pow(Math.abs(s), e) * (H / 2 - r * 0.2);
			const j = amp * (hash(seed + i * 7) - 0.5) * 2;
			const jj = amp * (hash(seed + i * 7 + 3) - 0.5) * 2;
			const X = cx + x + j;
			const Y = cy + y + jj;
			if (i === 0) ctx.moveTo(X, Y);
			else ctx.lineTo(X, Y);
		}
		ctx.stroke();
	}
	ctx.restore();
}

// ── The light, on the GPU ────────────────────────────────────────────────────
// ONE pass over the board: the ground, every lit glass's phosphor and spill
// and halo, the sunshine once (weighted by the glasses it is seen through),
// the disc and the point at infinity — summed in one fragment, so no pixel
// is drawn twice and nothing is blended. It is drawn straight onto the
// canvas with the renderer's output colour space set to its working one for
// the pass (the site runs with ColorManagement off, so the conversion it
// skips is a no-op): no multisampled half-float frame target and no output
// pass, which on a software renderer were most of a frame. On a software
// renderer (the headless lanes: SwiftShader, llvmpipe) it is drawn at `soft`
// of each side into a target and filtered up — the light is soft and the
// sunshine's lines are hairlines, a quarter of the fragments is a quarter of
// the time; `scale` overrides either (?glow= in the flow).
export async function makePhosphor({ THREE, renderer, scale = null, soft = 0.5 }) {
	if (!THREE || !renderer) return null;
	// On a software renderer the light is the board's (phosphor2D), unless a
	// scale is asked for: see COST.
	if (scale === null && isSoftware(renderer)) return null;
	const T = await import('three/tsl');
	const {
		Fn,
		If,
		uniform,
		float,
		vec2,
		vec3,
		vec4,
		abs,
		max,
		min,
		mix,
		length,
		atan,
		log,
		exp,
		fract,
		round,
		cos,
		sqrt,
		clamp,
		smoothstep,
		screenUV,
		texture
	} = T;
	const LNPHI = Math.log(PHI);
	const K = PHYLLO.k;
	const E8 = PHYLLO.eps[8];
	const E13 = PHYLLO.eps[13];
	const G8 = Math.hypot(8 / TAU, (E8 * K) / LNPHI);
	const G13 = Math.hypot(13 / TAU, (E13 * K) / LNPHI);
	const NR = 34; // rays
	const DR = 0.42; // between the log rings, in ln r
	// The disc's lattice in (ln ρ/R, θ): seed n is n·(−ln φ/k, α), and the 8-
	// and 13-parastichies' steps d₈, d₁₃ are a basis of it — orthogonal at
	// this k — so a point's nearest seed is its coordinates in that basis,
	// rounded: seed 8a + 13b.
	const D8 = [(-8 * LNPHI) / K, TAU * E8];
	const D13 = [(-13 * LNPHI) / K, TAU * E13];
	const DET = D8[0] * D13[1] - D13[0] * D8[1];
	const L8 = Math.hypot(...D8);
	const L13 = Math.hypot(...D13);

	const v4 = () => uniform(new THREE.Vector4(0, 0, 0, 0));
	const g = parseInt(PAL.ground.slice(1), 16);
	const U = {
		res: uniform(new THREE.Vector2(1, 1)),
		c: uniform(new THREE.Vector2(0, 0)),
		lnR: uniform(0),
		turn: uniform(0),
		swell: uniform(1),
		ground: uniform(
			new THREE.Vector3(((g >> 16) & 255) / 255, ((g >> 8) & 255) / 255, (g & 255) / 255)
		),
		core: v4(), // radius px, alpha
		lamp: v4(), // cx, cy, radius px, alpha
		disc: v4(), // cx, cy, R, sown
		discA: v4(), // alpha, open, spirals
		eye: v4(), // the next glass
		discBox: v4() // its own glass
	};
	const SL = Array.from({ length: SLOTS }, () => ({
		rect: v4(), // cx, cy, half-width, half-height
		info: v4(), // sun, glow, 0, type
		band: v4() // the type's box
	}));

	// Warm spectral hues: the green swings the hue from red through orange
	// and gold to yellow and back, and where it is red a blue comes in and
	// the red gives a little — a rose, a violet.
	const hue = Fn(([x]) => {
		const t = x.mul(TAU);
		const c = cos(t.add(0.3));
		const low = max(c.negate(), 0.0);
		const srgb = vec3(
			cos(t).mul(0.06).add(0.94).sub(low.mul(low).mul(low).mul(0.32)),
			c.mul(0.36).add(0.46),
			low.mul(low).mul(0.46).add(0.1)
		);
		return srgb.mul(srgb).mul(0.85).add(srgb.mul(srgb).mul(srgb).mul(0.15));
	});
	// A family of lines at the integers of `ph`, `sp` px apart: its coverage
	// at this pixel, merging into its mean where the lines crowd.
	const lines = Fn(([ph, sp, wd]) => {
		const f = fract(ph);
		const d = min(f, f.oneMinus()).mul(sp);
		const line = smoothstep(wd.mul(0.5), wd.mul(0.5).add(1.0), d).oneMinus();
		const mean = min(wd.add(0.5).div(sp), 1.0);
		return mix(mean, line, smoothstep(2.0, 6.0, sp));
	});
	// The rounded box of a glass: signed distance in px.
	const box = Fn(([p, r]) => {
		const hw = max(r.z, 0.5);
		const hh = max(r.w, 0.5);
		const rad = min(hw, hh).mul(0.07);
		const q = abs(p.sub(r.xy)).sub(vec2(hw, hh)).add(rad);
		return length(max(q, 0.0))
			.add(min(max(q.x, q.y), 0.0))
			.sub(rad);
	});
	// The sunshine at a pixel.
	const sunshine = Fn(([px]) => {
		const p = px.sub(U.c);
		const r = length(p).add(0.75);
		const th = atan(p.y.negate(), p.x).add(U.turn);
		const ell = log(r).sub(U.lnR);
		const ray = lines(th.mul(NR / TAU), r.mul(TAU / NR), float(1.1));
		const s8 = lines(th.mul(8 / TAU).add(ell.mul((E8 * K) / LNPHI)), r.div(G8), float(1.0));
		const s13 = lines(th.mul(13 / TAU).add(ell.mul((E13 * K) / LNPHI)), r.div(G13), float(0.9));
		const ring = lines(ell.div(DR), r.mul(DR), float(0.9));
		const tint = hue(th.div(TAU).mul(2.0).add(ell.mul(0.12)));
		const lit = ray.mul(1.05).add(s8.mul(0.7)).add(s13.mul(0.55)).add(ring.mul(0.35));
		return tint.mul(lit.add(0.16)).mul(U.swell);
	});
	// The first screen's picture: draft's disc, sown rim to centre, its eye
	// opening.
	const discAt = Fn(([px]) => {
		const dp = px.sub(U.disc.xy);
		const rho = length(dp).add(0.5);
		const th = atan(dp.y.negate(), dp.x);
		const ell = log(rho.div(U.disc.z));
		const a = ell.mul(D13[1] / DET).sub(th.mul(D13[0] / DET));
		const b = th.mul(D8[0] / DET).sub(ell.mul(D8[1] / DET));
		const ai = round(a);
		const bi = round(b);
		const n = ai.mul(8).add(bi.mul(13));
		const rn = U.disc.z.mul(exp(ai.mul(D8[0]).add(bi.mul(D13[0]))));
		const dth = th.sub(ai.mul(D8[1]).add(bi.mul(D13[1])));
		const d2 = rho
			.mul(rho)
			.add(rn.mul(rn))
			.sub(rho.mul(rn).mul(cos(dth)).mul(2.0));
		const dpx = sqrt(max(d2, 0.0));
		const grow = clamp(U.disc.w.sub(n).div(16.0), 0.0, 1.0).mul(smoothstep(-0.5, 0.5, n));
		const q = rn.mul(mix(PHYLLO.seedR * 1.6, PHYLLO.seedR, grow));
		// draft's seed: a ring of radius 0.16ρ, faintly filled.
		const ring = smoothstep(0.35, 1.25, abs(dpx.sub(q)))
			.oneMinus()
			.mul(0.85);
		const fill = smoothstep(q.sub(1.0), q, dpx).oneMinus().mul(0.14);
		const seed = max(ring, fill).mul(grow);
		// The spirals are the lattice's own lines: b constant (along d₈),
		// a constant (along d₁₃).
		const s8 = lines(b, rho.mul(L13), float(0.9));
		const s13 = lines(a, rho.mul(L8), float(0.8));
		const within = smoothstep(0.0, 1.0, box(px, U.discBox)).oneMinus();
		const eyeD = box(px, U.eye);
		const eyeM = mix(1.0, smoothstep(0.0, min(U.eye.z, U.eye.w).mul(0.25), eyeD), U.discA.y);
		return vec3(1.0, 0.7, 0.28)
			.mul(seed.mul(0.95).add(s8.add(s13).mul(0.18).mul(U.discA.z)))
			.mul(within)
			.mul(eyeM)
			.mul(U.discA.x);
	});

	// A glass: its haze, vignetted like a tube, the light it spills onto the
	// dark room round it, the halo behind its type; and how much of the
	// sunshine is seen through it here.
	const amber = vec3(1.0, 0.5, 0.17);
	const field = Fn(() => {
		// (A var, assigned here: a node shared by the branches below would be
		// assigned inside the first that builds it, and garbage in the rest
		// when that one is not taken.)
		const px = screenUV.mul(U.res).toVar();
		const col = U.ground.toVar();
		const sunW = float(0).toVar();
		for (const s of SL) {
			If(s.info.x.add(s.info.y).add(s.info.w).greaterThan(0.002), () => {
				const d = box(px, s.rect);
				const m = max(min(s.rect.z, s.rect.w), 1.0);
				const inside = smoothstep(-0.75, 0.75, d).oneMinus();
				const vig = smoothstep(0.0, m.mul(0.95), d.negate());
				const glow = inside
					.mul(mix(0.35, 1.0, vig))
					.mul(0.22)
					.add(
						exp(max(d, 0.0).div(m.mul(0.3)).negate())
							.mul(inside.oneMinus())
							.mul(0.2)
					)
					.mul(s.info.y);
				const qb = abs(px.sub(s.band.xy)).sub(s.band.zw);
				const halo = exp(length(max(qb, 0.0)).div(s.band.w.mul(0.8).add(2.0)).negate())
					.mul(s.info.w)
					.mul(inside);
				col.addAssign(amber.mul(glow).add(vec3(1.0, 0.62, 0.25).mul(halo.mul(0.16))));
				sunW.addAssign(inside.mul(s.info.x).mul(mix(0.4, 1.0, vig)));
			});
		}
		If(sunW.greaterThan(0.002), () => {
			col.addAssign(sunshine(px).mul(sunW));
		});
		If(U.discA.x.greaterThan(0.002), () => {
			If(box(px, U.discBox).lessThan(1.0), () => {
				col.addAssign(discAt(px));
			});
		});
		If(U.core.y.greaterThan(0.002), () => {
			const r = length(px.sub(U.c));
			col.addAssign(
				vec3(1.0, 0.78, 0.45).mul(exp(r.div(max(U.core.x, 0.5)).negate()).mul(U.core.y))
			);
		});
		If(U.lamp.w.greaterThan(0.002), () => {
			const r = length(px.sub(U.lamp.xy));
			col.addAssign(
				vec3(1.0, 0.78, 0.45).mul(exp(r.div(max(U.lamp.z, 0.5)).negate()).mul(U.lamp.w))
			);
		});
		return vec4(col, 1.0);
	});

	const scene = new THREE.Scene();
	scene.backgroundNode = field();
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	// ── The scale it is drawn at ──
	const software = isSoftware(renderer);
	const res = scale ?? (software ? soft : 1);
	let rt = null;
	let blit = null;
	const buf = new THREE.Vector2();
	function drawScaled() {
		renderer.getDrawingBufferSize(buf);
		const w = Math.max(1, Math.round(buf.x * res));
		const h = Math.max(1, Math.round(buf.y * res));
		if (!rt) {
			rt = new THREE.RenderTarget(w, h, { depthBuffer: false });
			const mat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
			mat.colorNode = vec4(texture(rt.texture, screenUV).rgb, 1);
			blit = new THREE.Scene();
			const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
			quad.frustumCulled = false;
			quad.position.z = -0.5;
			blit.add(quad);
		} else if (rt.width !== w || rt.height !== h) rt.setSize(w, h);
		const was = renderer.getRenderTarget();
		renderer.setRenderTarget(rt);
		renderer.render(scene, camera);
		renderer.setRenderTarget(was);
		renderer.render(blit, camera);
	}
	const set4 = (u, a) => u.value.set(a[0], a[1], a[2], a[3]);
	const OFF = [0, 0, 0, 0];

	function render(S) {
		U.res.value.set(S.w, S.h);
		U.c.value.set(S.c[0], S.c[1]);
		U.lnR.value = S.lnR;
		U.turn.value = S.turn ?? 0;
		U.swell.value = S.swell ?? 1;
		for (let i = 0; i < SLOTS; i++) {
			const s = S.slots[i];
			const q = SL[i];
			if (!s || (s.sun < 0.002 && s.glow < 0.002 && !(s.typeA > 0.002))) {
				set4(q.info, OFF);
				continue;
			}
			set4(q.rect, s.rect);
			set4(q.info, [s.sun, s.glow, 0, s.typeA ?? 0]);
			set4(q.band, s.band ?? [-1e4, -1e4, 1, 1]);
		}
		const D = S.disc;
		if (D && D.alpha > 0.002) {
			set4(U.disc, [D.c[0], D.c[1], D.R, D.sown]);
			set4(U.discA, [D.alpha, D.open, D.spirals, 0]);
			set4(U.eye, D.eye);
			set4(U.discBox, D.box);
		} else set4(U.discA, OFF);
		set4(U.core, S.core && S.core.a > 0.002 ? [S.core.r, S.core.a, 0, 0] : OFF);
		const P = S.lamp;
		set4(U.lamp, P && P.a > 0.002 ? [P.c[0], P.c[1], P.r, P.a] : OFF);
		const cs = renderer.outputColorSpace;
		renderer.outputColorSpace = THREE.ColorManagement.workingColorSpace;
		try {
			if (res >= 0.999) renderer.render(scene, camera);
			else drawScaled();
		} finally {
			renderer.outputColorSpace = cs;
		}
	}
	// One frame now, everything on, so the shader is built before it is
	// needed.
	render({
		w: 4,
		h: 4,
		c: [2, 2],
		lnR: 0,
		core: { r: 1, a: 1 },
		lamp: { c: [2, 2], r: 1, a: 1 },
		disc: {
			c: [2, 2],
			R: 2,
			sown: 10,
			alpha: 1,
			open: 0,
			spirals: 1,
			eye: [2, 2, 1, 1],
			box: [2, 2, 2, 2]
		},
		slots: Array.from({ length: SLOTS }, () => ({ rect: [2, 2, 2, 2], sun: 1, glow: 1, typeA: 1 }))
	});
	return { render, res, software };
}

// Whether the renderer is a software one (the headless lanes).
export function isSoftware(renderer) {
	try {
		const b = renderer.backend;
		const SOFT = /swiftshader|llvmpipe|software|lavapipe/i;
		if (b.isWebGPUBackend) {
			const i = b.device?.adapterInfo ?? {};
			return SOFT.test(`${i.vendor} ${i.architecture} ${i.device} ${i.description}`);
		}
		const gl = b.gl;
		const ext = gl.getExtension('WEBGL_debug_renderer_info');
		return SOFT.test(String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
	} catch {
		return false;
	}
}

// ── The light, flat, on the board (no renderer, or a software one) ───────────
// The field's own picture drawn with the board's strokes, added ('lighter')
// over the ground: each glass's haze and spill, the SUNSHINE in it — the 34
// rays, the 8- and 13-parastichies and the log rings as paths, built once a
// frame and stroked once for each glass bright enough to show it, clipped to
// it, coloured by angle with a conic gradient of the shader's own hues — the
// disc's seeds on the first glass, the point at infinity and the lamp.
const LN_PHI = Math.log(PHI);
const SUN = { rays: 34, ring: 0.42, c8: 0, c13: 0 };
SUN.c8 = (PHYLLO.eps[8] * PHYLLO.k) / LN_PHI;
SUN.c13 = (PHYLLO.eps[13] * PHYLLO.k) / LN_PHI;
// The shader's warm spectral hue, as 0…255 rgb.
function hueRGB(x) {
	const t = x * TAU;
	const c = Math.cos(t + 0.3);
	const low = Math.max(-c, 0);
	const s = [
		Math.cos(t) * 0.06 + 0.94 - low * low * low * 0.32,
		c * 0.36 + 0.46,
		low * low * 0.46 + 0.1
	];
	return s.map((v) => Math.round(255 * Math.min(1, v * v * 0.85 + v * v * v * 0.15)));
}
// The sunshine's paths about (cx, cy) at ln R: its rays, its two families
// of spirals, its rings, out to `far` px.
function sunPaths(cx, cy, lnR, turn, far) {
	const rays = new Path2D();
	const r0 = 2;
	for (let j = 0; j < SUN.rays; j++) {
		const a = (TAU * j) / SUN.rays - turn;
		rays.moveTo(cx + r0 * Math.cos(a), cy - r0 * Math.sin(a));
		rays.lineTo(cx + far * Math.cos(a), cy - far * Math.sin(a));
	}
	const spiral = (m, c) => {
		const p = new Path2D();
		const l0 = Math.log(r0) - lnR;
		const l1 = Math.log(far) - lnR;
		const n = Math.max(8, Math.ceil((l1 - l0) / 0.09));
		for (let j = 0; j < m; j++)
			for (let i = 0; i <= n; i++) {
				const l = l0 + ((l1 - l0) * i) / n;
				const r = Math.exp(l + lnR);
				const a = ((j - l * c) * TAU) / m - turn;
				const x = cx + r * Math.cos(a);
				const y = cy - r * Math.sin(a);
				if (i === 0) p.moveTo(x, y);
				else p.lineTo(x, y);
			}
		return p;
	};
	const rings = new Path2D();
	const j0 = Math.ceil((Math.log(3) - lnR) / SUN.ring);
	const j1 = Math.floor((Math.log(far) - lnR) / SUN.ring);
	for (let j = j0; j <= j1; j++) {
		const r = Math.exp(lnR + SUN.ring * j);
		rings.moveTo(cx + r, cy);
		rings.arc(cx, cy, r, 0, TAU);
	}
	return { rays, s8: spiral(8, SUN.c8), s13: spiral(13, SUN.c13), rings };
}
// A conic gradient of the hues about (cx, cy): the shader's tint, two turns
// of hue a turn of angle, shifted by e (its ln r term at a middle radius).
function sunTint(ctx, cx, cy, turn, e) {
	const g = ctx.createConicGradient(0, cx, cy);
	const N = 24;
	for (let i = 0; i <= N; i++) {
		const f = i / N;
		const [r, gg, b] = hueRGB(-2 * f + (2 * turn) / TAU + e);
		g.addColorStop(f, `rgb(${r}, ${gg}, ${b})`);
	}
	return g;
}
// draft's disc on the first glass: its seeds, sown rim to centre, the eye
// (the next glass) opening; its own spirals faint.
function disc2D(ctx, D, w, h) {
	const [cx, cy] = D.c;
	const [bx, by, bw, bh] = D.box;
	const [ex, ey, ew, eh] = D.eye;
	ctx.save();
	ctx.beginPath();
	ctx.rect(bx - bw, by - bh, 2 * bw, 2 * bh);
	ctx.clip();
	const ring = new Path2D();
	const fill = new Path2D();
	const N = Math.min(D.sown, 430);
	for (let n = 0; n <= N; n++) {
		const rho = D.R * Math.pow(PHI, -n / PHYLLO.k);
		const grow = Math.min(1, Math.max(0, (D.sown - n) / 16));
		const q = rho * PHYLLO.seedR * lerp(1.6, 1, grow);
		if (q < 0.35 || grow <= 0) {
			if (q < 0.35) break;
			continue;
		}
		const th = n * PHYLLO.alpha;
		const x = cx + rho * Math.cos(th);
		const y = cy - rho * Math.sin(th);
		if (x + q < 0 || x - q > w || y + q < 0 || y - q > h) continue;
		// The eye: no seeds in the next glass once it is open.
		if (D.open > 0.5 && Math.abs(x - ex) < ew && Math.abs(y - ey) < eh) continue;
		ring.moveTo(x + q, y);
		ring.arc(x, y, q, 0, TAU);
		fill.moveTo(x + q, y);
		fill.arc(x, y, q, 0, TAU);
	}
	ctx.strokeStyle = 'rgb(255, 179, 71)';
	ctx.fillStyle = 'rgb(255, 179, 71)';
	ctx.lineWidth = 0.9;
	ctx.globalAlpha = 0.8 * D.alpha;
	ctx.stroke(ring);
	ctx.globalAlpha = 0.13 * D.alpha;
	ctx.fill(fill);
	if (D.spirals > 0.01) {
		const far = Math.hypot(bw, bh) * 1.2;
		const P = sunPaths(cx, cy, Math.log(D.R), 0, far);
		ctx.globalAlpha = 0.18 * D.spirals * D.alpha;
		ctx.lineWidth = 0.8;
		ctx.stroke(P.s8);
		ctx.stroke(P.s13);
	}
	ctx.restore();
}

// The sunshine drawn ONCE a frame, at half the board's size, into a canvas
// of its own — its faint ground and its lines at their weights — and added
// into each glass that shows it from there (stroking it for every glass,
// nested in one another, cost 20–50 ms a frame on a software canvas).
let PAT = null;
// Only the part of the board the lit glasses cover, `box`, is drawn (the
// glasses nest, so it is the largest one's).
function sunPattern(w, h, S, box) {
	const sc = 0.5;
	const W = Math.max(1, Math.ceil(w * sc));
	const H = Math.max(1, Math.ceil(h * sc));
	if (!PAT || PAT.width !== W || PAT.height !== H) {
		PAT = document.createElement('canvas');
		PAT.width = W;
		PAT.height = H;
	}
	const x = PAT.getContext('2d');
	const [bx0, by0, bx1, by1] = box;
	x.save();
	x.setTransform(W / w, 0, 0, H / h, 0, 0);
	x.beginPath();
	x.rect(bx0 - 2, by0 - 2, bx1 - bx0 + 4, by1 - by0 + 4);
	x.clip();
	x.globalCompositeOperation = 'source-over';
	x.globalAlpha = 1;
	x.fillStyle = '#000';
	x.fillRect(bx0 - 2, by0 - 2, bx1 - bx0 + 4, by1 - by0 + 4);
	x.globalAlpha = 0.16;
	x.fillStyle = 'rgb(214, 96, 52)';
	x.fillRect(bx0 - 2, by0 - 2, bx1 - bx0 + 4, by1 - by0 + 4);
	x.globalCompositeOperation = 'lighter';
	const [cx, cy] = S.c;
	const far = Math.max(
		Math.hypot(bx0 - cx, by0 - cy),
		Math.hypot(bx1 - cx, by0 - cy),
		Math.hypot(bx0 - cx, by1 - cy),
		Math.hypot(bx1 - cx, by1 - cy)
	);
	const P = sunPaths(cx, cy, S.lnR, S.turn ?? 0, far + 2);
	const e = (Math.log(0.25 * Math.min(w, h)) - S.lnR) * 0.12;
	x.strokeStyle = sunTint(x, cx, cy, S.turn ?? 0, e);
	// Each line a pattern pixel wide (two of the board's once it is laid
	// over it, softened), at the shader's weight for its family.
	x.lineWidth = 1 / sc;
	for (const [path, wt] of [
		[P.rays, 1.05],
		[P.s8, 0.7],
		[P.s13, 0.55],
		[P.rings, 0.35]
	]) {
		x.globalAlpha = Math.min(1, wt * 1.15);
		x.stroke(path);
	}
	x.restore();
	return PAT;
}

// The pattern added into the glasses that show it, each at its weight. The
// glasses nest, so it is laid ring by ring — each glass's part outside the
// next, as four bands, at the sum of the weights of the glasses round it —
// and every pixel of the board is drawn once (more than one pass where the
// sum is over 1: the last glass), not once for every glass it is in.
function sunInto(ctx, pat, lit, w, h, swell) {
	const q = pat.width / w;
	const blit = (x0, y0, x1, y1, k) => {
		if (x1 - x0 < 0.5 || y1 - y0 < 0.5) return;
		for (let a = k; a > 0.004; a -= 1) {
			ctx.globalAlpha = Math.min(1, a);
			ctx.drawImage(pat, x0 * q, y0 * q, (x1 - x0) * q, (y1 - y0) * q, x0, y0, x1 - x0, y1 - y0);
		}
	};
	const R = lit
		.map((s) => {
			const [cx, cy, hw, hh] = s.rect;
			// (whole pixels, so the bands meet without a seam)
			const r = [
				Math.round(Math.max(0, cx - hw)),
				Math.round(Math.max(0, cy - hh)),
				Math.round(Math.min(w, cx + hw)),
				Math.round(Math.min(h, cy + hh))
			];
			return { r, k: s.sun * swell, area: (r[2] - r[0]) * (r[3] - r[1]) };
		})
		.filter((g) => g.area > 0)
		.sort((a, b) => b.area - a.area);
	let acc = 0;
	for (let i = 0; i < R.length; i++) {
		acc += R[i].k;
		const [x0, y0, x1, y1] = R[i].r;
		const n = R[i + 1]?.r;
		const nested = n && n[0] >= x0 && n[1] >= y0 && n[2] <= x1 && n[3] <= y1;
		if (!nested) {
			// (not inside it: the rest are laid on their own, glass by glass)
			blit(x0, y0, x1, y1, acc);
			if (n) for (const g of R.slice(i + 1)) blit(...g.r, g.k);
			break;
		}
		blit(x0, y0, x1, n[1], acc);
		blit(x0, n[3], x1, y1, acc);
		blit(x0, n[1], n[0], n[3], acc);
		blit(n[2], n[1], x1, n[3], acc);
	}
	ctx.globalAlpha = 1;
}

// A glass's light spilt round it onto the dark room: the shader's exp(−d/L')
// falloff from its edge, out to L (three of L'), as four bands and four
// corners — only outside the glass, and only what is on the board (a radial
// fill over the whole glass cost a board's worth of gradient per glass).
const SPILL = [0, 0.25, 0.5, 0.75, 1].map((f) => [f, Math.exp(-3 * f) - Math.exp(-3) * f]);
function spill(ctx, x0, y0, x1, y1, a, L, w, h) {
	const on = (X0, Y0, X1, Y1) => X1 > 0 && Y1 > 0 && X0 < w && Y0 < h && X1 > X0 && Y1 > Y0;
	const stops = (g) => {
		for (const [f, k] of SPILL) g.addColorStop(f, `rgba(255, 128, 43, ${a * k})`);
		return g;
	};
	const band = (X0, Y0, X1, Y1, gx0, gy0, gx1, gy1) => {
		if (!on(X0, Y0, X1, Y1)) return;
		ctx.fillStyle = stops(ctx.createLinearGradient(gx0, gy0, gx1, gy1));
		ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
	};
	band(x0, y0 - L, x1, y0, 0, y0, 0, y0 - L);
	band(x0, y1, x1, y1 + L, 0, y1, 0, y1 + L);
	band(x0 - L, y0, x0, y1, x0, 0, x0 - L, 0);
	band(x1, y0, x1 + L, y1, x1, 0, x1 + L, 0);
	for (const [px, py, sx, sy] of [
		[x0, y0, -1, -1],
		[x1, y0, 1, -1],
		[x0, y1, -1, 1],
		[x1, y1, 1, 1]
	]) {
		const X0 = Math.min(px, px + sx * L);
		const Y0 = Math.min(py, py + sy * L);
		if (!on(X0, Y0, X0 + L, Y0 + L)) continue;
		ctx.fillStyle = stops(ctx.createRadialGradient(px, py, 0, px, py, L));
		ctx.fillRect(X0, Y0, L, L);
	}
}

export function phosphor2D(ctx, w, h, S) {
	ctx.save();
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(0, 0, w, h);
	ctx.globalCompositeOperation = 'lighter';
	// The sunshine's paths, once for every glass that shows it.
	const lit = S.slots.filter((s) => {
		if (!s || !(s.sun > 0.01)) return false;
		const [cx, cy, hw, hh] = s.rect;
		return hw > 2 && cx + hw > 0 && cx - hw < w && cy + hh > 0 && cy - hh < h;
	});
	let pat = null;
	if (lit.length) {
		const box = [w, h, 0, 0];
		for (const s of lit) {
			const [cx, cy, hw, hh] = s.rect;
			box[0] = Math.min(box[0], Math.max(0, cx - hw));
			box[1] = Math.min(box[1], Math.max(0, cy - hh));
			box[2] = Math.max(box[2], Math.min(w, cx + hw));
			box[3] = Math.max(box[3], Math.min(h, cy + hh));
		}
		pat = sunPattern(w, h, S, box);
	}
	for (const s of S.slots) {
		if (!s) continue;
		const [cx, cy, hw, hh] = s.rect;
		const m = Math.min(hw, hh);
		if (s.glow > 0.004 && m > 1 && m < 1e4)
			spill(ctx, cx - hw, cy - hh, cx + hw, cy + hh, 0.11 * s.glow, 0.9 * m, w, h);
		const a = 0.16 * s.glow;
		if (a > 0.004) {
			ctx.fillStyle = `rgba(255, 128, 43, ${Math.min(1, a)})`;
			ctx.fillRect(cx - hw, cy - hh, 2 * hw, 2 * hh);
		}
	}
	if (pat) sunInto(ctx, pat, lit, w, h, S.swell ?? 1);
	for (const s of S.slots) {
		if (!s) continue;
		const [cx, cy, hw, hh] = s.rect;
		if ((s.white ?? 0) > 0.004) {
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillStyle = `rgba(255, 248, 232, ${s.white})`;
			ctx.fillRect(cx - hw, cy - hh, 2 * hw, 2 * hh);
			ctx.globalCompositeOperation = 'lighter';
		}
	}
	const spot = ([x, y], r, a) => {
		if (!(a > 0.004) || !(r > 0) || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) return;
		// exp(−d/r), the shader's falloff, out to 4r.
		const g = ctx.createRadialGradient(x, y, 0, x, y, 4 * r);
		for (const f of [0, 0.125, 0.25, 0.375, 0.5, 0.75, 1])
			g.addColorStop(
				f,
				`rgba(255, 199, 115, ${Math.min(1, a) * (Math.exp(-4 * f) - Math.exp(-4) * f)})`
			);
		ctx.fillStyle = g;
		ctx.fillRect(x - 4 * r, y - 4 * r, 8 * r, 8 * r);
	};
	if (S.core) spot(S.c, S.core.r, S.core.a);
	if (S.lamp) spot(S.lamp.c, S.lamp.r, S.lamp.a);
	if (S.disc && S.disc.alpha > 0.004) disc2D(ctx, S.disc, w, h);
	ctx.restore();
}

// A smooth step in the board's sense, re-exported for the flow's light.
export const ramp = (x, a, b) => smooth(span(x, a, b));
