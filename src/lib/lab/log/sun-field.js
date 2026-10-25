// ── The sun: a log-polar lattice seen at its point at infinity, on the GPU ───
// flow-strand-sun's tunnel, the lead's "radial sunshine polar lattice": ONE
// full-screen fragment field under the board (scene.backgroundNode on the
// lab's WebGPURenderer; the board is cleared to transparent over it), so a
// lattice that would be thousands of fogged line pieces on the canvas is a
// few dozen instructions a pixel.
//
// THE PLANE. The field is a plane in the flow's world, x = X_A, square to
// the swim's axis, seen by the flow's own lens: each pixel's ray is cut with
// the plane (a homography, exact for any pose, so the disc sown ahead can be
// seen from aside before the lens comes onto the axis), giving plane
// coordinates p = (a, b) about the plane's centre (a right, b up on the
// board when the lens is behind the swimmer). In the fall the same field is
// laid flat at the fall's own zoom: a lens one unit off the plane with k the
// fall's scale, its principal point the deepest glass's centre.
//
// THE LATTICE, in log-polar coordinates (U, θ) = (ln|p|, arg p), where a
// zoom by e^E is the translation U → U − E: exact and cheap, so the lens
// flying in at a steady rate in e-folds sees the rings born at the centre and
// streaming outward — a tunnel with no bottom — and the lattice turns by
// uTurn. Draft's disc IS this lattice: seed n at (U, θ) = (ln R − n ln φ/k,
// nα), and its 8- and 13-parastichies are the level sets L₈, L₁₃ ∈ ℤ of
//     L_m(u, θ) = (ε_m k / ln φ) u + m θ / 2π,   ε_m = m/φ² − round(m/φ²)
// (u = U − ln R): every seed has L₈ = 3n − 8j and L₁₃ = 5n − 13j, integers,
// and since 3·13 − 8·5 = −1 the pair (L₈, L₁₃) is a basis — the seeds are
// exactly the integer points, n = 8 L₁₃ − 13 L₈, the nearest found by
// rounding (the 8- and 13-spirals cross at right angles at k ≈ 17.83, so
// rounding is the nearest point). The spokes are θ = const (21 of them, a
// Fibonacci number: 8 spokes on is the golden angle to 0.03°), the rings
// U = const.
//
// THE ROOMS ARE ITS RINGS. Near the centre the rings are not circles but the
// fall's own plates: `edges` gives, per level k of the nest (0 outermost),
// the log-distances of its plate's four edges from the centre (ln right,
// ln left, ln top, ln bottom, in plane units). A pixel's ring coordinate λ
// is where the nested family R(λ) — each edge's log-distance piecewise linear
// in λ, R(k) the plate k — passes through it: per axis
//     λₓ = Σₖ clamp((eₖ − ln|x|)/(eₖ − eₖ₊₁), 0, 1) − max(ln|x| − e₀, 0)/S + max(e_L − ln|x|, 0)/S
// (outward and inward of the nest extrapolated at S e-folds a level), and
// λ = softmin(λₓ, λ_y) (rounded corners). λ = k on plate k's frame. Far
// out it blends to the circles, λ_c = (c₀ − U)/S, as `roomFar`…`roomNear`
// of λ say (and `room` turns it on), and the pseudo log-radius U' = c₀ − λS
// carries the seeds and spirals on through the blend. The flow fills
// `edges` from the fall's geometry every frame (exact: the rings ride the
// plates), extrapolating a level the lens has passed at S, so the field is
// continuous as each is dropped.
//
// COLOUR: lines emit, the ground is the board's; the spectrum from a ramp
// (warm-weighted: most of it red → orange → gold → yellow, then a little
// green, cyan, violet and magenta back to red), sampled by angle and by
// U for the spokes, by λ for the rings; a core of light at the centre (cream
// → gold → orange → deep red as it falls off), a wide low glow round it and
// broad beams on the spokes (the sunburst); the whole tone-mapped
// (1 − e^{−x}) so it glows and never clips; `boil` shakes the lines a little,
// redrawn eight times a second, the hand-drawn warmth. All in the board's
// own display values (the site runs with ColorManagement off), written
// straight to the canvas: the renderer's output space is set to its working
// one for the pass, so it skips its multisampled frame target and output
// pass, a no-op conversion here.
//
// COST. One full-screen pass, ~580 lines of GLSL; the room's solve and the
// disc are uniform branches, skipped while off. On a GPU that is well under
// a millisecond. On a software renderer (SwiftShader, the headless lanes) a
// fragment costs the CPU most of a microsecond, so there it is drawn at
// `soft` (0.4) of each side into a target and filtered up; `scale` forces a
// scale either way (1: every pixel, for sheets to judge it by).
//
//   const sun = makeSun({ THREE, renderer, scale, soft, flat })
//   sun.set({ … })            any of the uniforms below by name (numbers,
//                             [x, y(, z)] arrays, `edges` a list of [r, l, t, b])
//   sun.render()              one frame, full screen
//   sun.res, sun.software     the scale it draws at; whether the renderer is software
//   (flat: the ground alone, the same passes — the floor a GPU frame costs)
//
// What is exact: the plane's projection, the lattice's positions (the seeds,
// the spirals, the rings at the plates). What is a picture: the colours, the
// glow, the boil.

import {
	Fn,
	uniform,
	vec2,
	vec3,
	vec4,
	float,
	screenUV,
	texture,
	log,
	exp,
	atan,
	fract,
	floor,
	round,
	abs,
	min,
	max,
	clamp,
	smoothstep,
	mix,
	length,
	fwidth,
	select,
	sin,
	cos,
	step,
	If
} from 'three/tsl';
import { PHI, TAU } from './board.js';

const LN_PHI = Math.log(PHI);
const EPS = (m) => m / (PHI * PHI) - Math.round(m / (PHI * PHI));
const KP = (LN_PHI * Math.sqrt(104)) / (TAU * Math.sqrt(-EPS(8) * EPS(13))); // ≈ 17.83
// L_m(u, θ) = A_m u + B_m θ, and its inverse (the seed's offset in (u, θ)).
const A8 = (EPS(8) * KP) / LN_PHI;
const B8 = 8 / TAU;
const A13 = (EPS(13) * KP) / LN_PHI;
const B13 = 13 / TAU;
const DET = A8 * B13 - B8 * A13;
const INV = [B13 / DET, -B8 / DET, -A13 / DET, A8 / DET]; // [[a b][c d]] · (f8, f13)
const G8 = Math.hypot(A8, B8);
const G13 = Math.hypot(A13, B13);

export const SUN = {
	levels: 6, // plates in the nest (the fall's six rooms)
	spokes: 21,
	sub: 4, // rings a level
	seedR: 0.16 // draft's seed: a disc 0.16 ρ, conformal: 0.16 in (U, θ)
};

// The spectrum the sun is coloured from, display RGB, warm-weighted.
const RAMP = [
	[0.0, [0.42, 0.03, 0.02]], // deep red
	[0.1, [0.85, 0.1, 0.03]], // red
	[0.22, [1.0, 0.32, 0.05]], // orange
	[0.34, [1.0, 0.56, 0.12]], // amber
	[0.45, [1.0, 0.76, 0.26]], // gold
	[0.55, [0.98, 0.9, 0.5]], // yellow
	[0.63, [0.55, 0.82, 0.38]], // green
	[0.7, [0.2, 0.62, 0.72]], // cyan
	[0.78, [0.3, 0.3, 0.85]], // blue-violet
	[0.86, [0.62, 0.2, 0.7]], // violet
	[0.93, [0.85, 0.12, 0.38]], // magenta
	[1.0, [0.42, 0.03, 0.02]]
];
function rampData(n = 256) {
	const d = new Uint8Array(4 * n);
	for (let i = 0; i < n; i++) {
		const x = i / (n - 1);
		let j = 0;
		while (j < RAMP.length - 2 && RAMP[j + 1][0] < x) j++;
		const [x0, c0] = RAMP[j];
		const [x1, c1] = RAMP[j + 1];
		const f = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
		const s = f * f * (3 - 2 * f);
		for (let c = 0; c < 3; c++) d[4 * i + c] = Math.round(255 * (c0[c] + (c1[c] - c0[c]) * s));
		d[4 * i + 3] = 255;
	}
	return d;
}

export function makeSun({ THREE, renderer, scale = null, soft = 0.4, flat = false }) {
	// The field works in the board's own (display, sRGB) values and writes
	// them straight to the canvas: the site runs with ColorManagement off
	// (theme.js), so a hex is its own value; where it is on, the hex is
	// taken back to display values here.
	const disp = (hex) => {
		const c = new THREE.Color(hex);
		if (THREE.ColorManagement.enabled) c.convertLinearToSRGB();
		return new THREE.Vector3(c.r, c.g, c.b);
	};
	const V2 = (x = 0, y = 0) => new THREE.Vector2(x, y);
	const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
	const u = {
		W: uniform(1280),
		H: uniform(800),
		// the lens: position's y and z, the plane's x less the lens's (a
		// float64 difference, so a lens a hair off the plane keeps its
		// precision), its axes, px a unit at unit depth, the principal point
		py: uniform(0),
		pz: uniform(0),
		dx: uniform(-1),
		f: uniform(V3(-1, 0, 0)),
		r: uniform(V3(0, 0, -1)),
		up: uniform(V3(0, 1, 0)),
		k: uniform(1000),
		pp: uniform(V2(640, 400)),
		centre: uniform(V2(640, 400)), // the plane's centre on the board, px
		lnR: uniform(Math.log(150)), // the disc's rim
		turn: uniform(0),
		time: uniform(0),
		// the chalk disc
		rim: uniform(0), // written round, 0…1
		rimA: uniform(0),
		sown: uniform(-1), // seeds 0…sown are down (fractional: the newest popping)
		seedA: uniform(0),
		sp8: uniform(0), // the spirals written this many e-folds in from the rim
		sp13: uniform(0),
		spA: uniform(0),
		// the colour
		dawn: uniform(0), // chalk → colour
		core: uniform(0), // the light at the centre
		coreR: uniform(60), // its radius, px
		hot: uniform(0), // white heat at the centre (the flash coming)
		rays: uniform(0),
		reach: uniform(0), // how far out the rays and rings are lit, px
		rings: uniform(0),
		seedGlow: uniform(0),
		disc: uniform(0), // any of the disc's layers on (the branch that draws it)
		spGlow: uniform(0),
		gain: uniform(1),
		boil: uniform(0),
		// the rooms
		room: uniform(0),
		roomFar: uniform(-0.9),
		roomNear: uniform(-0.15),
		S: uniform(1.8),
		c0: uniform(0),
		edges: Array.from({ length: SUN.levels }, () => uniform(new THREE.Vector4(0, 0, 0, 0))),
		ground: uniform(disp('#151515')),
		chalk: uniform(disp('#ece6da')),
		gold: uniform(disp('#f5c150'))
	};

	const rampTex = new THREE.DataTexture(
		rampData(),
		256,
		1,
		THREE.RGBAFormat,
		THREE.UnsignedByteType
	);
	rampTex.wrapS = THREE.RepeatWrapping;
	rampTex.wrapT = THREE.ClampToEdgeWrapping;
	rampTex.magFilter = THREE.LinearFilter;
	rampTex.minFilter = THREE.LinearFilter;
	rampTex.needsUpdate = true;
	const ramp = (h) => texture(rampTex, vec2(h, 0.5)).rgb;

	// A soft line, d its distance and w its width, both in pixels: a
	// polynomial bump (1 − (d/2w)²)², cheaper than a gaussian and as soft.
	const line = (d, w) => {
		const x = d.div(w).mul(0.5);
		const y = max(float(1).sub(x.mul(x)), 0);
		return y.mul(y);
	};
	// x⁶ and x¹⁶ by squaring, not pow.
	const pow6 = (x) => {
		const x2 = x.mul(x);
		return x2.mul(x2).mul(x2);
	};
	const pow16 = (x) => {
		const x2 = x.mul(x);
		const x4 = x2.mul(x2);
		const x8 = x4.mul(x4);
		return x8.mul(x8);
	};

	const field = Fn(() => {
		const sx = screenUV.x.mul(u.W);
		const sy = screenUV.y.mul(u.H);
		// ── The plane: this pixel's ray, cut with it ──
		const xn = sx.sub(u.pp.x).div(u.k);
		const yn = u.pp.y.sub(sy).div(u.k);
		const d = u.f.add(u.r.mul(xn)).add(u.up.mul(yn)).toVar();
		const seen = d.x.mul(u.dx).greaterThan(1e-9);
		const tt = u.dx.div(select(seen, d.x, float(1)));
		const pa = u.pz.add(tt.mul(d.z)).negate().toVar();
		const pb = u.py.add(tt.mul(d.y)).toVar();
		const rp = length(vec2(sx, sy).sub(u.centre)).toVar(); // px from the centre
		const H = u.H;
		const U0 = log(max(pa.mul(pa).add(pb.mul(pb)), 1e-60)).mul(0.5);
		const th0 = atan(pb, pa);
		// The boil: the coordinates shaken a little, redrawn eight times a
		// second; whole multiples of θ, so it has no seam where atan turns.
		const frame = floor(u.time.mul(8));
		const shake = u.boil.mul(smoothstep(20, 120, rp));
		const U = U0.add(
			sin(th0.mul(5).add(U0.mul(2.3)).add(frame.mul(2.39))).mul(shake.mul(0.022))
		).toVar();
		const th = th0
			.add(sin(th0.mul(3).sub(U0.mul(3.1)).add(frame.mul(1.73))).mul(shake.mul(0.008)))
			.toVar();

		// ── The rooms' rings: λ, the nest's own coordinate (only once the
		// rooms are on: a uniform branch, so it costs nothing before) ──
		const S = u.S;
		const lamC = u.c0.sub(U).div(S);
		const lam = lamC.toVar();
		const m = float(0).toVar();
		If(u.room.greaterThan(0.0005), () => {
			const lx = log(max(abs(pa), 1e-30));
			const ly = log(max(abs(pb), 1e-30));
			const solve = (l, pick) => {
				const e = u.edges.map((E) => pick(E));
				let acc = max(l.sub(e[0]), 0).div(S).negate();
				for (let k = 0; k < e.length - 1; k++)
					acc = acc.add(clamp(e[k].sub(l).div(max(e[k].sub(e[k + 1]), 1e-4)), 0, 1));
				return acc.add(max(e[e.length - 1].sub(l), 0).div(S));
			};
			const sa = step(0, pa); // which side: arithmetic, not a branch a pixel
			const sb = step(0, pb);
			const lamX = solve(lx, (E) => mix(E.y, E.x, sa));
			const lamY = solve(ly, (E) => mix(E.w, E.z, sb));
			// a polynomial smooth minimum: the corners rounded over 0.12 of a level
			const KS = 0.12;
			const hs = max(float(KS).sub(abs(lamX.sub(lamY))), 0).div(KS);
			const lamR = min(lamX, lamY).sub(hs.mul(hs).mul(KS * 0.25));
			m.assign(smoothstep(u.roomFar, u.roomNear, lamR).mul(u.room));
			lam.assign(mix(lamC, lamR, m));
		});
		// the pseudo log-radius: U itself where the rings are circles
		const Up = u.c0.sub(lam.mul(S));

		// ── Light ──
		const fallOff = H.mul(0.22).div(rp.add(H.mul(0.22)));
		const halo = float(1).div(rp.div(H.mul(0.32)).pow(2).add(1));
		const lit = smoothstep(u.reach, u.reach.mul(0.6), rp);
		const em = vec3(0).toVar();

		// ── The disc: seeds, spirals and rim (u = U − ln R), while it shows ──
		If(u.disc.greaterThan(0.0005), () => {
			const us = Up.sub(u.lnR);
			const thS = th.sub(u.turn);
			const L8 = us.mul(A8).add(thS.mul(B8));
			const L13 = us.mul(A13).add(thS.mul(B13));
			const i8 = round(L8);
			const i13 = round(L13);
			const f8 = L8.sub(i8);
			const f13 = L13.sub(i13);
			const du = f8.mul(INV[0]).add(f13.mul(INV[1]));
			const dv = f8.mul(INV[2]).add(f13.mul(INV[3]));
			const dSeed = length(vec2(du, dv)); // log units
			const n = i13.mul(8).sub(i8.mul(13));
			const pxLog = max(rp, 1); // px a log unit (the map is conformal on the axis)
			const inDisc = smoothstep(0.02, -0.02, us); // within the rim
			const age = u.sown.sub(n);
			const sownA = smoothstep(-0.5, 0.5, age).mul(select(n.greaterThanEqual(0), 1, 0));
			const pop = mix(1, 1.9, smoothstep(6, 0, age));
			const seedLine = line(abs(dSeed.sub(pop.mul(SUN.seedR))).mul(pxLog), float(0.6)).mul(sownA);
			// Alight, a seed is a point of light (≤ 3 px, a little halo) in a
			// faint gold ring, the ring let go as the seed grows past ~90 px.
			const seedPx = pxLog.mul(SUN.seedR);
			const dPx = dSeed.mul(pxLog);
			const dotR = clamp(seedPx.mul(0.13), 0.6, 2.4);
			const seedDot = line(dPx, dotR)
				.add(line(dPx, dotR.mul(3.5)).mul(0.2))
				.mul(sownA);
			const seedRing = line(abs(dSeed.sub(SUN.seedR)).mul(pxLog), float(0.55))
				.mul(sownA)
				.mul(smoothstep(140, 50, seedPx));
			const sub = smoothstep(0.6, 3.0, seedPx); // seeds under a px: gone
			// the spirals: written in from the rim; in chalk, within it
			const inChalk = mix(inDisc, float(1), u.dawn);
			const w8 = line(abs(f8).div(G8).mul(pxLog), float(0.55)).mul(
				smoothstep(u.sp8.negate().sub(0.04), u.sp8.negate(), us)
			);
			const w13 = line(abs(f13).div(G13).mul(pxLog), float(0.55)).mul(
				smoothstep(u.sp13.negate().sub(0.04), u.sp13.negate(), us)
			);
			const fine = smoothstep(2, 14, rp); // where they crowd to the centre: let go
			const rimArc = fract(th.div(TAU).add(0.25));
			const rimLine = line(abs(us).mul(pxLog), float(0.7)).mul(
				smoothstep(u.rim, u.rim.sub(0.01), rimArc)
			);
			const disc = float(1).sub(m);
			const chalkA = float(1).sub(u.dawn.mul(0.85)).mul(disc);
			em.addAssign(u.chalk.mul(rimLine.mul(u.rimA).mul(0.55).mul(chalkA)));
			em.addAssign(u.chalk.mul(seedLine.mul(u.seedA).mul(0.5).mul(chalkA).mul(sub).mul(inChalk)));
			em.addAssign(
				u.chalk.mul(w8.mul(0.42).add(w13.mul(0.3)).mul(u.spA).mul(chalkA).mul(fine).mul(inChalk))
			);
			// the seeds alight, gold; the 8-spirals in the warm spectrum, the
			// 13-spirals gold
			em.addAssign(
				u.gold.mul(
					seedDot.mul(1.4).add(seedRing.mul(0.35)).mul(u.seedGlow).mul(disc).mul(sub).mul(fallOff)
				)
			);
			em.addAssign(
				ramp(fract(i8.div(8)).mul(0.5).add(0.12)).mul(
					w8.mul(u.spGlow).mul(disc).mul(fine).mul(fallOff).mul(0.9)
				)
			);
			em.addAssign(u.gold.mul(w13.mul(u.spGlow).mul(disc).mul(fine).mul(fallOff).mul(0.55)));
		});

		// ── The spokes, the beams and the rings ──
		const NS = SUN.spokes;
		const qs = th.sub(u.turn).mul(NS / TAU);
		const qs2 = fract(qs.div(NS).add(0.5)).mul(NS);
		const fwS = max(min(fwidth(qs), fwidth(qs2)), 1e-5);
		const fs = fract(qs);
		const dS = min(fs, fs.oneMinus()).div(fwS);
		const spoke = line(dS, float(0.65)).add(line(dS, float(4)).mul(0.18));
		// broad soft beams on them, every third one stronger: the sunburst
		const beam = pow6(cos(qs.mul(Math.PI)).abs())
			.mul(0.45)
			.add(pow16(cos(qs.mul(Math.PI / 3)).abs()));
		const qr = lam.mul(SUN.sub);
		const fr = fract(qr);
		const ringS = line(min(fr, fr.oneMinus()).div(max(fwidth(qr), 1e-5)), float(0.6));
		const fm = fract(lam);
		const dM = min(fm, fm.oneMinus()).div(max(fwidth(lam), 1e-5));
		// the plates' own rings, and a glow round them where they are rooms
		const ringM = line(dM, float(1.0)).add(line(dM, float(9)).mul(m.mul(0.45).add(0.08)));
		const hueS = fract(qs.div(NS).mul(3).add(Up.mul(0.045)).add(u.time.mul(0.004)));
		const colSpoke = ramp(hueS);
		const colRing = ramp(fract(lam.mul(0.19).add(0.36)));
		const spokeA = smoothstep(4, 60, rp).mul(lit).mul(fallOff);
		em.addAssign(colSpoke.mul(spoke.mul(u.rays).mul(spokeA).mul(0.85)));
		em.addAssign(colSpoke.mul(beam.mul(u.rays).mul(lit).mul(halo).mul(0.26)));
		const ringA = lit
			.mul(fallOff)
			.mul(smoothstep(3, 30, rp))
			.mul(u.rings);
		em.addAssign(
			colRing.mul(
				ringS
					.mul(0.75)
					.add(ringM.mul(mix(0.9, 2.0, m)))
					.mul(ringA)
			)
		);
		// the core: a hot point, a gold glow, a deep red halo; and the sky
		// round it, a wide low glow, deep orange to red
		const q = rp.div(max(u.coreR, 1));
		const q2 = q.mul(q);
		const coreCol = mix(
			mix(vec3(1.0, 0.93, 0.78), vec3(1.0, 0.62, 0.2), smoothstep(0.0, 0.8, q)),
			vec3(0.62, 0.08, 0.03),
			smoothstep(0.7, 3.0, q)
		);
		const coreI = exp(q2.mul(-1.4))
			.mul(1.6)
			.add(float(0.5).div(q2.mul(0.5).add(1)));
		em.addAssign(coreCol.mul(coreI.mul(u.core)));
		em.addAssign(
			mix(vec3(0.9, 0.32, 0.06), vec3(0.45, 0.05, 0.03), smoothstep(0, 1, rp.div(H.mul(0.6)))).mul(
				halo.mul(u.core).mul(0.22)
			)
		);
		em.addAssign(vec3(1.0, 0.97, 0.92).mul(u.hot.mul(float(3).div(q2.mul(0.6).add(1)))));
		const glowC = vec3(1).sub(exp(em.mul(u.gain).negate()));
		const col = u.ground.add(glowC.mul(vec3(1).sub(u.ground)));
		return vec4(select(seen, col, u.ground), 1);
	});

	// Drawn straight onto the canvas, its values as they are: the renderer's
	// output colour space set to its working one for the pass, so it renders
	// without its multisampled half-float frame target and output pass (a
	// conversion that is a no-op here, and on a software renderer most of a
	// frame's cost); or into a target and filtered up.
	const scene = new THREE.Scene();
	scene.backgroundNode = flat ? vec4(u.ground, 1) : field();
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	// ── The scale it is drawn at ──
	// On a GPU, every pixel. On a software renderer (SwiftShader, llvmpipe:
	// the headless lanes, where a fragment costs the CPU ~0.7 µs) at `soft` of
	// each side into a half-float target, filtered up: the field is soft
	// light and hairlines, and a quarter of the fragments is a quarter of the
	// time. `scale` overrides either (?sunres= in the flow).
	const software = isSoftware(renderer);
	let res = scale ?? (software ? soft : 1);
	let rt = null;
	let blit = null;
	let sceneRT = null;
	const buf = new THREE.Vector2();
	function drawScaled() {
		renderer.getDrawingBufferSize(buf);
		const w = Math.max(1, Math.round(buf.x * res));
		const h = Math.max(1, Math.round(buf.y * res));
		if (!rt) {
			// 8 bits of display values (so the darks do not band)
			rt = new THREE.RenderTarget(w, h, { depthBuffer: false });
			sceneRT = new THREE.Scene();
			sceneRT.backgroundNode = scene.backgroundNode;
			const mat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
			// Sampled by screenUV, not the quad's uv: the field is written by
			// screenUV (top-left origin on both backends), and a render
			// target read back by a quad's uv comes out upside down — the sun
			// mirrored about the board's middle, its rings off the plates.
			mat.colorNode = vec4(texture(rt.texture, screenUV).rgb, 1);
			blit = new THREE.Scene();
			const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
			quad.frustumCulled = false;
			quad.position.z = -0.5;
			blit.add(quad);
		} else if (rt.width !== w || rt.height !== h) rt.setSize(w, h);
		const was = renderer.getRenderTarget();
		renderer.setRenderTarget(rt);
		renderer.render(sceneRT, camera);
		renderer.setRenderTarget(was);
		renderer.render(blit, camera);
	}

	const toV = (U, v) => {
		if (typeof v === 'number') U.value = v;
		else if (U.value.isVector2) U.value.set(v[0], v[1]);
		else if (U.value.isVector3) U.value.set(v[0], v[1], v[2]);
		else if (U.value.isVector4) U.value.set(v[0], v[1], v[2], v[3]);
	};
	function set(o) {
		for (const [key, v] of Object.entries(o)) {
			if (v === undefined || v === null) continue;
			if (key === 'edges') v.forEach((e, i) => i < SUN.levels && toV(u.edges[i], e));
			else if (u[key]) toV(u[key], v);
		}
	}
	return {
		u,
		set,
		get res() {
			return res;
		},
		software,
		render() {
			const cs = renderer.outputColorSpace;
			renderer.outputColorSpace = THREE.ColorManagement.workingColorSpace;
			try {
				if (res >= 0.999) renderer.render(scene, camera);
				else drawScaled();
			} finally {
				renderer.outputColorSpace = cs;
			}
		}
	};
}

// The lens as the field takes it: camera3's frame (pos, f, r, u, k), the
// principal point, against the plane x = xA.
export function lensUniforms(cam, xA, pp) {
	return {
		py: cam.pos[1],
		pz: cam.pos[2],
		dx: xA - cam.pos[0],
		f: cam.f,
		r: cam.r,
		up: cam.u,
		k: cam.k,
		pp
	};
}
// The field laid flat: `scale` px a plane unit, its centre at (cx, cy).
export function flatUniforms(scale, cx, cy) {
	return {
		py: 0,
		pz: 0,
		dx: -1,
		f: [-1, 0, 0],
		r: [0, 0, -1],
		up: [0, 1, 0],
		k: scale,
		pp: [cx, cy]
	};
}

// A software renderer (the headless lanes): SwiftShader or llvmpipe behind
// WebGL 2, or a WebGPU adapter that says it is one.
function isSoftware(renderer) {
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
