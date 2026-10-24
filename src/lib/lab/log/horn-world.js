// ── The horn's world: one cone, its sun, and the rooms hung in it ────────────
// flow-strand-horn's tunnel and fall as ONE object, flown by one lens. Two
// halves, one place:
//
// THE HORN, on the GPU (makeHornField): a cone — draft's golden-angle cone,
// deepened — RAY-TRACED per pixel (one quadratic: ρ² = T²x² for a ray from
// the lens, the apex at the origin, the axis along +x to the mouth at `len`),
// so the lens can see it from aside, swing round behind the swimmer and come
// onto its axis with no change of picture. On the wall: draft's seeds, seed n
// at ρₙ = R φ^(−n/k), θₙ = nα, in the lattice's own coordinates (u, θ) = (ln
// ρ/R, θ) where the 8- and 13-parastichies are the level sets of
//     L_m = (ε_m k / ln φ) u + m θ/2π   (ε_m = m/φ² − round(m/φ²)),
// integer at every seed (L₈ = 3n − 8j, L₁₃ = 5n − 13j, so n = 8L₁₃ − 13L₈),
// the nearest seed found by rounding both (the spirals cross square at k ≈
// 17.83). Seeds are outlines of radius 0.16 in (u, θ) — draft's 0.16ρ discs,
// round seen from the axis — sub-pixel ones a haze; the spirals; the rim;
// the horn's SECTIONS, a ring every 13 seeds (a Fibonacci number), counted
// from the first room's plane. Over it THE SUN: the point at infinity every
// line of the lattice leads to, lit — the lattice's own lines glowing in a
// warm spectrum (each spiral its own hue round the horn, the rings by their
// depth), from the apex outward as far as `reach`, a core of light at the
// apex and a slow sunburst of 21 soft warm rays down the cone's generators,
// tone-mapped (1 − e^(−x)) so it glows and never clips; `white` takes it all
// to the flash. One full-screen field
// under the board (scene.backgroundNode); the board is cleared to clear over
// it. A seed, a spiral or a ring costs the same: it is a few instructions a
// pixel, not a stroke.
//
// THE ROOMS, on the board (drawNest): fall.js's nest (its geometry, its
// layers, its flood, its push), hung INSIDE the cone: every room's glass on
// the cone's axis, the apex where the nest converges, the cone just wide
// enough that every frame is inscribed in its section (the flow sets T). The
// board paints them deepest first (each room covers the one behind it but in
// its glass — fall.js's picture, without its clips), so the horn shows where
// no room is: round each frame, between a glass and the frame in it, through
// a room not yet made. A room's state is its size on the board, not the
// clock: far off its frame is the horn's ring (`morph` 0, a circle, the
// cone's section), squaring into the frame as it comes (1); then its chalk
// TAKES SHAPE OUT OF SEEDS (`dev` 0 → 1): the plate's own golden-angle seeds
// appear round its glass, as the wall's are, and the room is drawn in them,
// each seed's disc swelling until the room is whole.
//
//   const field = makeHornField({ THREE, renderer })
//   field.set({ … }) ; field.render()
//   drawNest(ctx, w, h, art, nest, lens, opts)       (see below)
//   ringCurve(cx, cy, R, rect, m)                     a ring squaring into a rect

import {
	Fn,
	uniform,
	float,
	vec2,
	vec3,
	vec4,
	screenUV,
	sqrt,
	atan,
	log,
	exp,
	abs,
	fract,
	floor,
	round,
	smoothstep,
	mix,
	clamp,
	max,
	min,
	select,
	cos,
	length,
	fwidth,
	texture,
	If
} from 'three/tsl';
import { PAL, PHI, TAU, stroke, span, smooth, lerp } from './board.js';
import { PHYLLO } from './phyllo.js';
import { PLATE, drawImageAt } from './rooms.js';

const LNPHI = Math.log(PHI);
const KK = PHYLLO.k;
const C8 = (PHYLLO.eps[8] * KK) / LNPHI;
const C13 = (PHYLLO.eps[13] * KK) / LNPHI;
export const VPERU = -KK / LNPHI; // seed index per unit of ln(ρ/R)

const srgbHex = (hex) => {
	const n = parseInt(hex.slice(1), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// ── The field ────────────────────────────────────────────────────────────────
export function makeHornField({
	THREE,
	renderer,
	flat = false,
	scale = null,
	soft = 44000,
	own = false
}) {
	const V2 = (x = 0, y = 0) => uniform(new THREE.Vector2(x, y));
	const V3 = (a = [0, 0, 0]) => uniform(new THREE.Vector3(...a));
	const u = {
		res: V2(1, 1), // the board, CSS px
		o: V3(), // the lens, from the apex
		f: V3([-1, 0, 0]),
		r: V3([0, 0, -1]),
		up: V3([0, 1, 0]),
		k: uniform(1000), // px a unit at unit depth
		pp: V2(), // the principal point, px
		tb: uniform(0.3), // the cone's tan(half-angle)
		len: uniform(280), // apex to mouth, along the axis
		hr: uniform(70), // the mouth's radius: seed 0's ρ
		sown: uniform(0), // seeds sown (continuous; past 233 all at once)
		sownW: uniform(10), // a seed's fade, in seeds
		rim: uniform(0), // the rim written round, 0…1
		v8: uniform(0), // the spirals written to this seed index
		v13: uniform(0),
		ringV0: uniform(200), // the first room's section, as a seed index
		ringFrom: uniform(4), // the sections drawn from this one out (the board has the rest)
		ringIn: uniform(0), // and only those with v below this (written in from the mouth)
		wall: uniform(1), // the wall's chalk
		sun: uniform(0), // the sun's strength
		reach: uniform(1e4), // the light on the lattice from this seed index in
		apex: V2(), // the apex on the board, px
		coreR: uniform(4), // the sun's core, px
		turn: uniform(0), // the sunburst's turn
		rays: uniform(0), // the sunburst's strength
		pop: uniform(1), // 1 while seeds are popping in (a seed then outgrows its cell)
		white: uniform(0),
		// Canvas pixels a CSS pixel (the renderer's ratio × the field's scale):
		// what the field fades by is measured on the page, so it is one
		// picture at any ratio; its inverse, and the lines' shape.
		ipx: uniform(1),
		lnA: uniform(0.55),
		lnB: uniform(1.45),
		lnK: uniform(1),
		tint: uniform(0.8), // how far the lit chalk takes its hue
		// The ground and the chalk as the board has them (sRGB): the wall's
		// lines are laid on as the canvas lays them, the light added in
		// linear light over that.
		ground: V3(srgbHex(PAL.ground)),
		chalk: V3(srgbHex(PAL.chalk))
	};

	// The warm spectrum, in linear light: deep red, red, orange, gold,
	// yellow, cream, a peach, rose, a breath of violet, back to deep red.
	const STOPS = [
		[0.0, [0.5, 0.02, 0.03]],
		[0.13, [0.9, 0.07, 0.03]],
		[0.27, [1.0, 0.3, 0.04]],
		[0.41, [1.0, 0.55, 0.08]],
		[0.55, [1.0, 0.78, 0.22]],
		[0.67, [1.0, 0.93, 0.55]],
		[0.77, [1.0, 0.62, 0.3]],
		[0.87, [0.85, 0.12, 0.42]],
		[0.94, [0.45, 0.1, 0.6]],
		[1.0, [0.5, 0.02, 0.03]]
	];
	// …as a 256-texel strip, looked up (a texture fetch, not seven mixes).
	const N = 256;
	const data = new Float32Array(4 * N);
	const sm = (a, b, x) => {
		const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
		return t * t * (3 - 2 * t);
	};
	for (let i = 0; i < N; i++) {
		const x = (i + 0.5) / N;
		let c = STOPS[0][1].slice();
		for (let k = 1; k < STOPS.length; k++) {
			const f = sm(STOPS[k - 1][0], STOPS[k][0], x);
			c = c.map((v, j) => v + (STOPS[k][1][j] - v) * f);
		}
		data.set([...c, 1], 4 * i);
	}
	const rampTex = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat, THREE.FloatType);
	rampTex.wrapS = THREE.RepeatWrapping;
	rampTex.magFilter = THREE.NearestFilter;
	rampTex.minFilter = THREE.NearestFilter;
	rampTex.needsUpdate = true;
	const ramp = (x) => texture(rampTex, vec2(x, 0.5)).rgb;
	// A line `d` canvas pixels off, drawn ~1.3 CSS px wide: on a canvas finer
	// than the page (a retina screen) as wide on the page, on one coarser (a
	// software renderer's) a canvas pixel at the least, and fainter by as much.
	const line = (dpx) => smoothstep(u.lnA, u.lnB, dpx).oneMinus().mul(u.lnK);

	// Two builds of one field: the seeds popping in (while they are sown) and
	// the sunburst (after) are switched in JS, not in the shader — a software
	// renderer runs a branch's code whether it is taken or not.
	const field = ({ pop, rays }) =>
		Fn(() => {
			const px = screenUV.mul(u.res);
			const sx = px.x.sub(u.pp.x).div(u.k);
			const sy = px.y.sub(u.pp.y).div(u.k);
			const d = u.f.add(u.r.mul(sx)).sub(u.up.mul(sy)).toVar();
			const o = u.o;
			// The cone ρ² = T²x², 0 < x < len: the nearest hit ahead.
			const T2 = u.tb.mul(u.tb);
			const A = d.y
				.mul(d.y)
				.add(d.z.mul(d.z))
				.sub(T2.mul(d.x.mul(d.x)));
			const Bh = o.y
				.mul(d.y)
				.add(o.z.mul(d.z))
				.sub(T2.mul(o.x.mul(d.x)));
			const C = o.y
				.mul(o.y)
				.add(o.z.mul(o.z))
				.sub(T2.mul(o.x.mul(o.x)));
			const D = Bh.mul(Bh).sub(A.mul(C));
			const sq = sqrt(max(D, 0.0));
			const As = select(abs(A).lessThan(1e-9), float(1e-9), A);
			const ta = Bh.negate().sub(sq).div(As);
			const tb = Bh.negate().add(sq).div(As);
			const t0 = min(ta, tb);
			const t1 = max(ta, tb);
			const x0 = o.x.add(d.x.mul(t0));
			const x1 = o.x.add(d.x.mul(t1));
			const ok0 = t0.greaterThan(0.0).and(x0.greaterThan(0.0)).and(x0.lessThan(u.len));
			const ok1 = t1.greaterThan(0.0).and(x1.greaterThan(0.0)).and(x1.lessThan(u.len));
			const hitF = select(D.greaterThanEqual(0.0).and(ok0.or(ok1)), float(1), float(0));
			const t = select(ok0, t0, t1);
			const hp = o.add(d.mul(t));
			const rho = max(length(vec2(hp.y, hp.z)), 1e-12);
			const th = atan(hp.z, hp.y);
			const cth = hp.y.div(rho);
			const sth = hp.z.div(rho);

			// The lattice.
			const lu = log(rho.div(u.hr));
			const v = lu.mul(VPERU);
			const tq = th.div(TAU);
			const L8 = lu.mul(C8).add(tq.mul(8));
			const L13 = lu.mul(C13).add(tq.mul(13));
			const r8 = round(L8);
			const r13 = round(L13);
			// A pixel in the lattice's units (θ's step read off cos and sin, so
			// atan's seam does not show).
			const fu = fwidth(lu);
			const fth = length(vec2(fwidth(cth), fwidth(sth)));
			const psMin = max(min(fu, fth), 1e-7);
			const psMax = max(max(fu, fth), 1e-7);

			// Seeds: outlines, sown rim to centre, popping in; a haze where they
			// are under a pixel; let go of near the lens. The nearest seed and its
			// four neighbours (a popping seed is wider than its own cell); each
			// outline's distance in px along its own gradient, so it is a line of
			// one width however the cone foreshortens it.
			const seedAt = (a8, a13) => {
				const R8 = r8.add(a8);
				const R13 = r13.add(a13);
				const nn = R13.mul(8).sub(R8.mul(13));
				const un = nn.mul(-LNPHI / KK);
				const thn = R8.sub(un.mul(C8)).mul(TAU / 8);
				const du = lu.sub(un);
				const dth = th.sub(thn);
				const dd = length(vec2(du, dth));
				const gpx = abs(du).mul(fu).add(abs(dth).mul(fth)).div(max(dd, 1e-6)).add(1e-7);
				const age = u.sown.sub(min(nn, 233.0)).div(u.sownW);
				const ins = select(nn.greaterThan(-0.5), float(1), float(0));
				const sw = smoothstep(0.0, 1.0, age).mul(ins);
				const rs = smoothstep(0.0, 2.0, age).oneMinus().mul(0.9).add(1).mul(PHYLLO.seedR);
				return { ln: line(abs(dd.sub(rs)).div(gpx)).mul(sw), sw, nn };
			};
			const s0 = seedAt(0, 0);
			const seedL = s0.ln.toVar();
			if (pop)
				seedL.assign(
					max(
						max(seedL, seedAt(1, 0).ln),
						max(max(seedAt(-1, 0).ln, seedAt(0, 1).ln), seedAt(0, -1).ln)
					)
				);
			const n = s0.nn;
			const inside = select(n.greaterThan(-0.5).and(lu.lessThan(0.0)), float(1), float(0));
			const sown = s0.sw.mul(inside);
			const far = smoothstep(0.6, 4.0, float(PHYLLO.seedR).div(psMax).mul(u.ipx));
			const near = smoothstep(26.0, 95.0, float(PHYLLO.seedR).div(psMin).mul(u.ipx)).oneMinus();
			const seed = seedL.mul(inside).mul(far).mul(near);
			const seedA = seed.mul(0.62);
			const haze = far.oneMinus().mul(sown).mul(0.14);

			// The rim, written round.
			const rimUp = select(fract(tq.add(1.0)).lessThan(u.rim), float(1), float(0));
			const rimA = line(abs(lu).div(max(fu, 1e-7)))
				.mul(rimUp)
				.mul(near)
				.mul(0.5);

			// The spirals, written from the rim; gone where they crowd.
			const w8 = fu.mul(Math.abs(C8)).add(fth.mul(8 / TAU));
			const w13 = fu.mul(Math.abs(C13)).add(fth.mul(13 / TAU));
			const sp8 = line(abs(L8.sub(r8)).div(max(w8, 1e-7)))
				.mul(smoothstep(0.0, 4.0, u.v8.sub(v)))
				.mul(smoothstep(2.5, 7.0, u.ipx.div(max(w8, 1e-7))));
			const sp13 = line(abs(L13.sub(r13)).div(max(w13, 1e-7)))
				.mul(smoothstep(0.0, 4.0, u.v13.sub(v)))
				.mul(smoothstep(2.5, 7.0, u.ipx.div(max(w13, 1e-7))));
			const spA = sp8.mul(0.5).add(sp13.mul(0.36)).mul(near).mul(inside);

			// The sections: a ring every 13 seeds, counted out from the first
			// room's (j = 1 the first in front of it).
			const jr = u.ringV0.sub(v).div(13.0);
			const wj = fu.mul(-VPERU / 13).add(1e-7);
			const ringL = line(abs(jr.sub(round(jr))).div(wj)).mul(smoothstep(2.5, 7.0, u.ipx.div(wj)));
			const ringOn = smoothstep(u.ringFrom.sub(0.5), u.ringFrom, jr)
				.mul(smoothstep(3.0, 8.0, v))
				.mul(smoothstep(0.0, 6.0, u.ringIn.sub(v)));
			const ringA = ringL.mul(ringOn).mul(near).mul(inside).mul(0.34);

			const chalkA = clamp(seedA.add(haze).add(rimA).add(spA).add(ringA), 0.0, 1.0)
				.mul(u.wall)
				.mul(hitF);

			// The sun: the lattice lit from the apex out to `reach`, in the
			// spectrum — seeds by their angle, each spiral its own hue, the rings
			// by their depth — and the core and the rays in the air.
			const reached = smoothstep(u.reach, u.reach.add(70.0), v).mul(hitF).mul(u.wall);
			const lit = reached.mul(u.sun);
			const em = vec3(0).toVar();
			// The chalk itself takes the hue where the light has reached: each
			// line its own, weighted by how much of the pixel it is.
			const hueL = vec3(0).toVar();
			const tint = reached.mul(smoothstep(0.12, 0.5, u.sun)).mul(u.tint);
			// (Only where the light has reached. Each line has its own place on the
			// ramp, and a pixel takes the hue of the line that is most of it — one
			// lookup, not four: on a software renderer a texture fetch is most of
			// a pixel's cost, and where two lines cross the nearer one's hue is as
			// good as their blend.)
			If(reached.greaterThan(0.002), () => {
				const wS = seed.add(haze);
				const wS8 = sp8.mul(near).mul(inside);
				const wS13 = sp13.mul(near).mul(inside);
				const wR = ringL.mul(near).mul(inside);
				const xS = tq.mul(2.0).add(v.mul(0.0035)).add(u.turn.mul(0.05));
				const x8 = r8.mul(0.125).add(0.05);
				const x13 = r13.mul(0.0769).add(0.4);
				const xR = jr.mul(0.11).add(0.55);
				const xa = select(wS8.greaterThan(wS), x8, xS);
				const xb = select(wR.greaterThan(wS13), xR, x13);
				const hue = ramp(fract(select(max(wS13, wR).greaterThan(max(wS, wS8)), xb, xa)));
				const amt = seed
					.mul(1.6)
					.add(haze.mul(2.2))
					.add(wS8.mul(1.1))
					.add(wS13.mul(0.9))
					.add(wR.mul(0.8));
				em.assign(hue.mul(amt.mul(lit)));
				hueL.assign(hue);
			});
			const q = px.sub(u.apex);
			const rr = length(q);
			const R1 = max(u.coreR, 0.5);
			const x = rr.div(R1);
			// The core: white at its heart, gold, orange, a deep red far out.
			const coreCol = mix(
				mix(
					mix(vec3(1.0, 0.95, 0.84), vec3(1.0, 0.66, 0.2), smoothstep(0.0, 1.0, x)),
					vec3(0.95, 0.28, 0.05),
					smoothstep(0.8, 2.6, x)
				),
				vec3(0.5, 0.04, 0.03),
				smoothstep(2.0, 7.0, x)
			);
			const coreI = exp(x.mul(x).negate())
				.mul(1.7)
				.add(float(0.5).div(x.mul(x).mul(0.12).add(1.0)));
			em.addAssign(coreCol.mul(coreI.mul(u.sun)));
			if (rays) {
				// The sunburst: 21 soft rays down the horn's own generators — the
				// lines of one θ, which every view projects to lines through the
				// apex, so θ serves where a second arc tangent of the pixel would
				// — each its own warm hue (a red-orange to a pale gold, stepped
				// round by the golden ratio: the ray's index mod 21, so the seam
				// of θ does not show), strongest near the apex.
				const a = th.mul(21.0).add(u.turn);
				// cos¹⁴, by squaring
				const c1 = cos(a).mul(0.5).add(0.5);
				const c2 = c1.mul(c1);
				const c4 = c2.mul(c2);
				const burst = c4.mul(c4).mul(c4).mul(c2);
				const idx = fract(floor(a.div(TAU).add(0.5)).div(21.0)).mul(21.0);
				const rayCol = mix(
					vec3(1.0, 0.36, 0.07),
					vec3(1.0, 0.82, 0.42),
					fract(idx.mul(0.618034).add(0.01))
				);
				const fall = float(1).div(x.mul(0.09).add(1.0));
				em.addAssign(rayCol.mul(burst.mul(fall).mul(u.rays).mul(0.3)));
			}

			// (Gamma 2 rather than 2.2 and a rational 1 − e^(−x): where there is
			// no light the board's own sRGB comes back exactly, and a pixel costs
			// two square roots, not nine logs and exps.)
			const ink = mix(u.chalk, sqrt(hueL), tint);
			const baseS = mix(u.ground, ink, chalkA);
			const base = baseS.mul(baseS);
			const em2 = em.mul(em);
			const glow = vec3(1.0).sub(
				vec3(1.0).div(
					vec3(1.0)
						.add(em)
						.add(em2.mul(0.5))
						.add(em2.mul(em).mul(1 / 6))
				)
			);
			const col = base.add(vec3(1.0).sub(base).mul(glow));
			// Out in sRGB: the renderer writes a background node's colour as it
			// is (measured: a linear ground came out at 9/255), and the board's
			// ground is #151515 in sRGB, so the two must meet there.
			const lc = clamp(mix(col, vec3(1.0, 0.985, 0.95), u.white), 0.0, 1.0);
			const enc = sqrt(lc);
			return vec4(enc, 1.0);
		})();

	const sceneOf = (node) => {
		const sc = new THREE.Scene();
		sc.backgroundNode = node;
		return sc;
	};
	const FLAT = vec4(0.08, 0.08, 0.08, 1);
	const scenes = {
		sow: sceneOf(flat ? FLAT : field({ pop: true, rays: false })),
		lit: sceneOf(flat ? FLAT : field({ pop: false, rays: true }))
	};
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	// ── What a frame costs ──
	// The field is drawn straight onto the canvas with the renderer's output
	// colour space set to its working one for the pass: the renderer then
	// skips its multisampled half-float frame target and its output pass (a
	// conversion that is a no-op here — the run keeps ColorManagement off and
	// the field writes the board's own sRGB values), which on a software
	// renderer were most of the frame. On a GPU every pixel is drawn; on a
	// software renderer (SwiftShader, llvmpipe: the headless lanes, where a
	// fragment costs the CPU most of a microsecond) the field is drawn at
	// a budget of `soft` (44 000) fragments — 0.21 of each side on a 1280 ×
	// 800 board, never more than 0.3 nor less than 0.15 — and filtered up:
	// soft light and hairlines, the lines kept to their width on the page
	// (u.ipx, u.lnA…). Measured there (synced, the field alone): ~2 ms for a
	// flat colour, the field's cost all in its fragments, ~0.2 µs each under
	// the shared machine's load — at 0.3 of each side it was ~20 ms a frame,
	// and the frame interval twice the core's. `scale` forces either (1:
	// every pixel, for a sheet to judge it by).
	// Where the renderer is the field's alone (`own`: the lab), a lower scale
	// is the canvas's own pixel ratio — the page scales it up for nothing —
	// rather than a target and a pass to filter it up.
	const software = isSoftware(renderer);
	const res =
		scale ??
		(software
			? Math.min(0.3, Math.max(0.15, Math.sqrt(soft / (window.innerWidth * window.innerHeight))))
			: 1);
	const direct = res >= 0.999 || own;
	if (own && res < 0.999) {
		renderer.setPixelRatio(res);
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	let rt = null;
	let blit = null;
	const buf = new THREE.Vector2();
	function drawScaled(scene) {
		renderer.getDrawingBufferSize(buf);
		const w = Math.max(1, Math.round(buf.x * res));
		const h = Math.max(1, Math.round(buf.y * res));
		if (!rt) {
			rt = new THREE.RenderTarget(w, h, { depthBuffer: false });
			const mat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
			// (read by screenUV, as it was written: the same way up in any
			// target, the canvas or a flow's lens's)
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

	function set(o) {
		for (const [key, val] of Object.entries(o)) {
			const U = u[key];
			if (!U || val === undefined || val === null) continue;
			if (typeof val === 'number') U.value = val;
			else if (U.value.isVector2) U.value.set(val[0], val[1]);
			else if (U.value.isVector3) U.value.set(val[0], val[1], val[2]);
		}
	}
	function draw(scene) {
		const pxs = renderer.getPixelRatio() * (direct ? 1 : res);
		u.ipx.value = 1 / pxs;
		u.lnA.value = 0.55 * Math.max(1, pxs);
		u.lnB.value = 1.45 * Math.max(1, pxs);
		u.lnK.value = Math.sqrt(Math.min(1, pxs));
		const cs = renderer.outputColorSpace;
		renderer.outputColorSpace = THREE.ColorManagement.workingColorSpace;
		try {
			// (into whatever target is bound: the canvas, or a lens's scene)
			if (direct) renderer.render(scene, camera);
			else drawScaled(scene);
		} finally {
			renderer.outputColorSpace = cs;
		}
	}
	return {
		u,
		set,
		software,
		res,
		// Both builds drawn once, so neither is compiled mid-run.
		prime() {
			draw(scenes.sow);
			draw(scenes.lit);
		},
		render() {
			draw(u.pop.value > 0.5 ? scenes.sow : scenes.lit);
		}
	};
}

// Whether the renderer draws on the CPU (the headless lanes).
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

// ── A ring squaring into a rectangle ─────────────────────────────────────────
// The circle of radius R about (cx, cy) taken, angle by angle, to the
// rectangle [x0, y0, x1, y1] (which holds the centre): at m = 0 the circle,
// at 1 the rectangle, its corners sampled exactly.
export function ringCurve(cx, cy, R, rect, m, n = 72) {
	const [x0, y0, x1, y1] = rect;
	const angs = [];
	for (let i = 0; i < n; i++) angs.push((TAU * i) / n);
	for (const [X, Y] of [
		[x1, y0],
		[x0, y0],
		[x0, y1],
		[x1, y1]
	])
		angs.push((Math.atan2(Y - cy, X - cx) + TAU) % TAU);
	angs.sort((a, b) => a - b);
	const pts = [];
	for (const a of angs) {
		const c = Math.cos(a);
		const s = Math.sin(a);
		const tx = c > 1e-9 ? (x1 - cx) / c : c < -1e-9 ? (x0 - cx) / c : Infinity;
		const ty = s > 1e-9 ? (y1 - cy) / s : s < -1e-9 ? (y0 - cy) / s : Infinity;
		const r = lerp(R, Math.min(tx, ty), m);
		pts.push([cx + r * c, cy + r * s]);
	}
	pts.push(pts[0]);
	return pts;
}

// ── The nest, painted ────────────────────────────────────────────────────────
// `nest` is fall.js's geometry (levels with O, s, lay, glass); `lens` the
// lens in the nest's coordinates { x, y, z, s, k, ox, oy } (k px a unit at
// unit depth, the vanishing point at ox, oy); `opts`:
//   state(k, hPx) → { morph, dev }   the level's state from its frame's
//                     height on the board
//   axis: [ax, ay]  the glasses' line; T the cone's tan(half-angle); apexZ
//   paint(k, layerDepth) → 0…1       a layer's colour (the flood)
//   wall(ctx, k, plane, a)           drawn on level k's wall, over its clock
//                     (plane(z) → { m, e, f } for a plane z of the level)
//   nearZ, alpha
// Returns { glass: the last level's glass box once it shows, boxes }.
export function drawNest(ctx, w, h, art, nest, lens, opts) {
	const { levels, L } = nest;
	const { state, axis, T, apexZ, paint, wall } = opts;
	const nearZ = opts.nearZ ?? 0.015;
	const A = opts.alpha ?? 1;
	if (A <= 0.003) return { glass: null, boxes: [] };
	const k = lens.k;
	const project = (x, y, z) => {
		const d = lens.z - z;
		return [lens.ox + (k * (x - lens.x)) / d, lens.oy - (k * (y - lens.y)) / d, d];
	};
	const plane = (lv, z) => {
		const wz = lv.O[2] + lv.s * z;
		const dw = lens.z - wz;
		if (dw <= nearZ * lens.s) return null;
		const m = (k * lv.s) / dw;
		const [e, f] = project(lv.O[0], lv.O[1], wz);
		return { m, e, f, dw };
	};
	const at = (P, x, y) => [P.e + P.m * x, P.f - P.m * y];
	const boxOf = (P, x, y, rw, rh) => {
		const [x0, y0] = at(P, x - rw / 2, y + rh / 2);
		return [x0, y0, x0 + rw * P.m, y0 + rh * P.m];
	};
	const meet = (A, C) => [
		Math.max(A[0], C[0]),
		Math.max(A[1], C[1]),
		Math.min(A[2], C[2]),
		Math.min(A[3], C[3])
	];
	const empty = (X) => X[2] <= X[0] || X[3] <= X[1];
	const pathBox = (X) => ctx.rect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
	const corners = (X) => [
		[X[0], X[1]],
		[X[2], X[1]],
		[X[2], X[3]],
		[X[0], X[3]],
		[X[0], X[1]]
	];
	const screen = [-2, -2, w + 2, h + 2];

	// One layer: chalk, with its colour under it as it floods; the wall
	// mirror-tiled (fall.js's).
	const layer = (lv, key, k0, clip, a) => {
		const l = lv.lay[key];
		const im = art[lv.decade]?.[key];
		if (!l || !im) return;
		const P = plane(lv, l.z);
		if (!P) return;
		const p = paint(k0, l.depth);
		const tiles = key === 'bg' ? 1 : 0;
		for (let j = -tiles; j <= tiles; j++)
			for (let i = -tiles; i <= tiles; i++) {
				const x = l.x + i * l.w;
				const y = l.y + j * l.h;
				const R = boxOf(P, x, y, l.w, l.h);
				if (empty(meet(R, clip))) continue;
				const [px, py] = at(P, x, y);
				const sw = l.w * P.m;
				const sh = l.h * P.m;
				ctx.save();
				if (j % 2 !== 0) {
					ctx.translate(px, py);
					ctx.scale(1, -1);
					ctx.translate(-px, -py);
				}
				const flipX = i % 2 !== 0;
				if (p > 0.002) drawImageAt(ctx, im.mips, px, py, sw, sh, { alpha: p * a, flipX });
				if (im.chalk && p < 0.998)
					drawImageAt(ctx, im.chalk, px, py, sw, sh, { alpha: 0.95 * (1 - p) * a, flipX });
				ctx.restore();
			}
		// The layer's own rectangle, dashed: the drawing's construction.
		if (p < 1 && key !== 'bg' && l.w * P.m > 14)
			stroke(ctx, corners(boxOf(P, l.x, l.y, l.w, l.h)), {
				color: PAL.chalk,
				width: 0.9,
				alpha: 0.32 * (1 - p) * a * A,
				dash: [4, 5]
			});
	};

	// The levels the lens has not passed (every glass it has passed is
	// dropped).
	let base = 0;
	for (let i = 0; i < L; i++) {
		const lv = levels[i];
		if (lens.z <= lv.O[2] + lv.s * lv.glass.z + nearZ * lens.s) base = i + 1;
		else break;
	}
	const out = { glass: null, boxes: [] };
	ctx.save();
	ctx.globalAlpha = A;
	// Deepest first: each level covers the ones behind it but in its glass.
	for (let i = L; i >= base; i--) {
		const lv = levels[i];
		const P0 = plane(lv, 0);
		const frameFull = P0 ? boxOf(P0, 0, 0, PLATE.W, PLATE.H) : screen;
		const frame = meet(screen, frameFull);
		const hPx = P0 ? PLATE.H * P0.m : Infinity;
		if (hPx < 1.2) continue;
		const { morph, dev } = state(i, hPx);
		const Pg = lv.glass ? plane(lv, lv.glass.z) : null;
		const G = Pg ? boxOf(Pg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		const gb = G ? meet(frame, G) : null;
		const hole = gb && !empty(gb);
		out.boxes[i] = { frame: frameFull, glass: G, hPx };
		if (i === L && hole) out.glass = gb;
		if (dev > 0.002 && !empty(frame)) {
			// The plate's own seeds round its glass, the room drawn in them.
			const discs = dev < 0.999 && P0 ? seedDiscs(lv, P0, dev, at) : null;
			const clipDiscs = () => {
				if (!discs) return;
				ctx.beginPath();
				for (const [x, y, r] of discs.fill) {
					if (r < 0.3) continue;
					ctx.moveTo(x + r, y);
					ctx.arc(x, y, r, 0, TAU);
				}
				ctx.clip();
			};
			// While it takes shape the room is translucent, the horn behind it
			// fading out as the seeds fill.
			const lay = discs ? lerp(0.45, 1, smooth(dev)) : 1;
			ctx.save();
			ctx.globalAlpha = A * lay;
			ctx.beginPath();
			pathBox(frame);
			if (hole) pathBox(gb);
			ctx.clip('evenodd');
			clipDiscs();
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(frame[0], frame[1], frame[2] - frame[0], frame[3] - frame[1]);
			layer(lv, 'bg', i, frame, 1);
			layer(lv, 'poster', i, frame, 1);
			layer(lv, 'clock', i, frame, 1);
			if (wall) wall(ctx, i, (z) => plane(lv, z), A);
			ctx.restore();
			ctx.save();
			ctx.globalAlpha = A * lay;
			ctx.beginPath();
			pathBox(frame);
			ctx.clip();
			clipDiscs();
			layer(lv, 'screen', i, frame, 1);
			layer(lv, 'desk', i, frame, 1);
			layer(lv, 'bed', i, frame, 1);
			ctx.restore();
			// The seeds the room comes out of, as the wall's are drawn.
			if (discs && discs.ring.length) {
				ctx.save();
				ctx.beginPath();
				pathBox(frame);
				ctx.clip();
				ctx.strokeStyle = PAL.chalk;
				ctx.lineWidth = 0.9;
				ctx.globalAlpha = 0.6 * A;
				ctx.beginPath();
				for (const [x, y, r, a] of discs.ring) {
					if (a < 0.05 || r < 0.6) continue;
					ctx.moveTo(x + r, y);
					ctx.arc(x, y, r, 0, TAU);
				}
				ctx.stroke();
				ctx.restore();
			}
		}
		// The glass, and the frame: the horn's section squaring into it.
		if (G && (dev > 0.002 || morph > 0.002))
			stroke(ctx, corners(G), {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.55 * A * Math.max(dev, smooth(span(morph, 0.4, 1)))
			});
		if (P0) {
			const c = project(axis[0], axis[1], lv.O[2]);
			const R = (k * T * (lv.O[2] - apexZ)) / c[2];
			const pts = morph >= 0.999 ? corners(frameFull) : ringCurve(c[0], c[1], R, frameFull, morph);
			stroke(ctx, pts, {
				color: PAL.chalk,
				width: lerp(0.9, 1.8, morph),
				alpha: A * lerp(0.34, 0.9, morph)
			});
		}
	}
	ctx.restore();
	return out;
}

// A level's seeds, round its glass on the frame's plane: seed n at ρₙ = ρ₀
// φ^(−n/k) from the glass's centre, θₙ = nα + a turn of its own; each shows
// as an outline (0.16ρ) as dev comes up, then swells — at its own moment, the
// golden ratio staggering them — to 0.34ρ, where the lattice is covered.
// Cached per level (the positions in plate units); returns screen discs.
const SEEDS = new WeakMap();
function seedDiscs(lv, P, dev, at) {
	let S = SEEDS.get(lv);
	if (!S) {
		const g = lv.glass;
		const far = Math.max(
			...[
				[-PLATE.W / 2, -PLATE.H / 2],
				[PLATE.W / 2, -PLATE.H / 2],
				[-PLATE.W / 2, PLATE.H / 2],
				[PLATE.W / 2, PLATE.H / 2]
			].map(([x, y]) => Math.hypot(x - g.x, y - g.y))
		);
		const nearR = 0.25 * Math.min(g.w, g.h);
		const r0 = far * 1.08;
		const N = Math.ceil((KK * Math.log(r0 / nearR)) / LNPHI);
		const turn = (lv.k ?? 0) * 0.7 + 0.3;
		S = [];
		for (let n = 0; n <= N; n++) {
			const rho = r0 * Math.pow(PHI, -n / KK);
			const a = n * PHYLLO.alpha + turn;
			const stag = (n * (PHI - 1)) % 1;
			S.push([g.x + rho * Math.cos(a), g.y + rho * Math.sin(a), rho, stag]);
		}
		SEEDS.set(lv, S);
	}
	const fill = [];
	const ring = [];
	const show = smooth(span(dev, 0, 0.18));
	for (const [x, y, rho, stag] of S) {
		const a0 = 0.12 + 0.5 * stag;
		const f = smooth(span(dev, a0, a0 + 0.38));
		const [sx, sy] = at(P, x, y);
		const r = rho * P.m;
		if (f > 0) fill.push([sx, sy, r * lerp(0.1, 0.36, f)]);
		const ra = show * (1 - f);
		if (ra > 0.02) ring.push([sx, sy, r * PHYLLO.seedR, ra]);
	}
	return { fill, ring };
}
