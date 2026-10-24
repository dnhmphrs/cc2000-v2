// ── The lens: the board through a soft, warm lens, on the GPU ────────────────
// The fuzz the lead asked for in place of strand's warm grain ("a more soft
// focus feel … not too blurry … just a slight warm fuzzy softening", and
// then "less in your face than you think i want … very subtle"): not a layer
// of its own on top of the picture but the picture itself seen through an
// old lens onto an old print —
//
//   the MIST     a touch of the picture's own near blur mixed back into it,
//                so a line's edge is soft without the line going blurry;
//   the HALO     the lights' own glow, warm (film's halation: the red-orange
//                rim a bright line wears), from a wider blur of the bright
//                parts only — the board's lines glow, its dark does not;
//   the LIFT     the darks lifted a hair, and warm, as a print's are;
//   the GRAIN    very fine, felt more than seen: two noise fields cross-faded
//                a few times a second, so it breathes rather than snows,
//                strongest in the mid-tones and nothing in the white;
//   the LEAK     now and then (every ~20 s, for a few seconds) a very faint
//                white-blue light leaking in at an edge, drifting.
//
// THE PIPELINE. The board (a 2D canvas) is hidden and drawn instead as a
// texture on the lens's own renderer (makeLens, below): uploaded each frame
// (on a GPU a copy that never leaves it), laid into a scene target over the
// ground — between a
// layer the flow draws UNDER it and one OVER it, on the GPU (log/gpu-ink.js:
// the lines that are cheap there and dear on a canvas) — then blurred down a
// chain of small targets (a quarter, an eighth, a sixteenth of each side;
// four bilinear taps each), the halo worked out once at a quarter size from
// them, and the whole read once, at full size, by ONE pass to the canvas:
// the picture (one unfiltered read), its quarter blur (the mist), the halo,
// the lift, two reads of a small noise tile (the grain) and the leak (and,
// given `light`, a flow's light — flow-strand-sketch's conception). Every
// pixel of the frame is touched by that pass alone; a software GPU (the
// headless lanes: SwiftShader) pays ~50 ms for even a constant colour at
// 2880 × 1800, so the pass is kept to five reads and a little arithmetic,
// and there the lens draws at fewer pixels than the board's (a budget a
// frame: see buildLens; ?lensres=1 every pixel).
// With no layers of its own the scene target is skipped and the board read
// straight. It replaces four full-board fills a frame on the canvas (the old
// grain: a pattern and three washes, 20 Mpx at DPR 2).
//
// THE CLOCK. `secs`, not the run's t: the grain and the leak keep moving
// while a live run waits at a question (t held), as v3's gate holds t and
// runs on. A flow passes answers.hand(t).secs — real seconds live, exactly t
// pinned, in the demo or a reel — so a seek is still a run.
//
//   const lens = await makeLens({ THREE, board })   null where WebGL 2 is not
//   clearBoard(board, { shown: !lens })               the board hidden while
//                                                     the lens draws it
//   lens.frame({ secs, look, under, over, after, light })   after the board
//     under(renderer, { dpr }), over(…)   a GPU layer drawn into the scene
//          target under / over the board (log/gpu-ink.js), or null
//     after(renderer, { board, dpr })     onto the canvas after the pass
//     look   any of LENS's numbers, this frame (e.g. { grain: 0 })
//     light  a light at (x, y), CSS px — flow-strand-sketch's conception:
//            { x, y, r (its core's radius), rays (its shafts: the picture's
//            own brights smeared out from it along its rays — a pass at a
//            quarter size — with a sunburst through them, each ray its own
//            warm hue), core, rings (log-polar rings drifting out, at
//            `phase`), turn (the sunburst's), bloom (a disc of white out of
//            it, this far, bloomSoft its edge), burnA (the white burning
//            out: a colour-dodge by this level everywhere), burnB (… and this
//            much more near the light, falling off over burnR) }
//   lens.renderer, lens.canvas, lens.software, lens.res
//
// Colours are the board's own display values: the renderer's output is set
// to its working space for the pass (ColorManagement is off on the site), so
// there is no output conversion and no half-float frame target.

import {
	Fn,
	uniform,
	texture,
	screenUV,
	screenCoordinate,
	textureLoad,
	ivec2,
	vec2,
	vec3,
	vec4,
	float,
	mix,
	clamp,
	max,
	min,
	smoothstep,
	dot,
	fract,
	floor,
	sin,
	exp,
	length,
	atan,
	log
} from 'three/tsl';
import { PAL, TAU } from './board.js';
import { grain } from './grain.js';

export const LENS = {
	mist: 0.1, // the near blur mixed into the picture
	halo: 0.35, // the lights' glow spilt round them (halation), warm
	haloFrom: 0.1, // … from this brightness up
	lift: 0.026, // the darks lifted toward the warm
	grain: 0.0085, // the grain's amplitude, display units (≈ 2/255)
	grainRate: 4, // grain fields a second, cross-faded
	grainPx: 1.25, // the grain's cell, CSS px
	leak: 0.028, // the leak's peak
	leakEvery: 21 // seconds between leaks (one cycle: a few seconds of it)
};

const hex3 = (hex) => {
	const n = parseInt(hex.replace('#', ''), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// ONE lens a page (a reel builds every flow up front): its own canvas over
// the page where the board is, and its own renderer — three's WebGPURenderer
// on its WebGL 2 backend, because a 2D canvas goes into a WebGL texture by
// the browser's own GPU copy (texImage2D: 1.2 ms a frame at 2880 × 1800 on
// Chrome 153), where WebGPU's copyExternalImageToTexture from the same canvas
// took 340–400 ms in every form tried (canvas, ImageBitmap, OffscreenCanvas).
// Shown in place of the board while a flow draws through it (clearBoard's
// `shown: false` swaps the two), hidden for every other sketch.
let ONE = null;
export async function makeLens({ THREE, board }) {
	if (!THREE || typeof document === 'undefined') return null;
	if (ONE) return ONE;
	const canvas = document.createElement('canvas');
	canvas.className = 'log-lens';
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100vw',
		height: '100vh',
		zIndex: '11', // the board's place
		pointerEvents: 'none',
		display: 'block',
		visibility: 'hidden'
	});
	document.body.appendChild(canvas);
	let renderer;
	try {
		renderer = new THREE.WebGPURenderer({
			canvas,
			forceWebGL: true,
			antialias: false,
			alpha: false
		});
		await renderer.init();
	} catch {
		canvas.remove();
		return null;
	}
	board.lens = canvas;
	ONE = buildLens({ THREE, renderer, board, canvas });
	return ONE;
}

// A software GL (SwiftShader, llvmpipe: the headless lanes), where every
// fragment costs the CPU: there the lens draws at one device pixel to the
// CSS pixel (a quarter of the fragments at DPR 2) unless ?lensres=1 asks
// for every pixel (for sheets to judge it by). On a GPU, every pixel.
function isSoftware(renderer) {
	try {
		const gl = renderer.backend.gl;
		const ext = gl.getExtension('WEBGL_debug_renderer_info');
		const s = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
		return /swiftshader|llvmpipe|software|lavapipe/i.test(s);
	} catch {
		return false;
	}
}

function buildLens({ THREE, renderer, board, canvas }) {
	const software = isSoftware(renderer);
	const q = new URLSearchParams(location.search);
	const asked = Number(q.get('lensres'));
	// the lens's pixels to the board's, each way. On a software GL a budget
	// of fragments a frame: a PINNED frame (?at=, a sheet) 1.6 Mpx — a phone
	// or a 1280 × 800 board at DPR 1 every pixel, a 1440 × 900 laptop at DPR
	// 2 about half of each side; a RUN 0.45 Mpx, so it keeps its pace (a
	// frame there costs the CPU ~50 ms a Mpx: the live phone and keyboard
	// scripts time themselves off the wall clock).
	const budget = q.has('at') ? 1.6e6 : 0.45e6;
	const resOf = () =>
		asked > 0
			? Math.min(1, asked)
			: software
				? Math.min(1, Math.sqrt(budget / Math.max(1, board.w * board.h * board.dpr * board.dpr)))
				: 1;
	let res = resOf();
	const V2 = (x = 0, y = 0) => new THREE.Vector2(x, y);
	const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
	const u = {
		W: uniform(1280), // the canvas, device px
		H: uniform(800),
		dpr: uniform(1),
		secs: uniform(0),
		mist: uniform(LENS.mist),
		halo: uniform(LENS.halo),
		haloFrom: uniform(LENS.haloFrom),
		lift: uniform(LENS.lift),
		grain: uniform(LENS.grain),
		grainRate: uniform(LENS.grainRate),
		grainPx: uniform(LENS.grainPx),
		leak: uniform(LENS.leak),
		leakEvery: uniform(LENS.leakEvery),
		ground: uniform(V3(hex3(PAL.ground))),
		// a flow's light (god rays): centre (device px), strength, core, rays
		lightP: uniform(V2(0, 0)), // the light, lens px
		lightR: uniform(40), // its core's radius, lens px
		lightRays: uniform(0), // the shafts and the sunburst
		lightCore: uniform(0), // the core's glow
		lightRings: uniform(0), // the log-polar rings
		lightPhase: uniform(0), // … their drift outward, in rings
		lightTurn: uniform(0), // the sunburst's turn
		bloomReach: uniform(-1), // the white's disc out of the light, lens px
		bloomSoft: uniform(1),
		burnA: uniform(0), // the white burning out: its level everywhere
		burnB: uniform(0), // … and more of it near the light
		burnR: uniform(1)
	};
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const LUM_ = vec3(0.3, 0.55, 0.15);

	// ── The board as a texture ──
	let boardTex = null;
	const boardTexture = () => {
		const c = board.canvas;
		if (boardTex && (boardTex.image.width !== c.width || boardTex.image.height !== c.height)) {
			boardTex.dispose();
			boardTex = null;
		}
		if (!boardTex) {
			boardTex = new THREE.CanvasTexture(c);
			boardTex.colorSpace = THREE.NoColorSpace;
			boardTex.flipY = false; // row 0 the board's top, as screenUV
			boardTex.premultiplyAlpha = true;
			boardTex.generateMipmaps = false;
			boardTex.minFilter = THREE.LinearFilter;
			boardTex.magFilter = THREE.LinearFilter;
		}
		boardTex.needsUpdate = true;
		return boardTex;
	};

	// ── Targets ──
	const RT = (w, h) => {
		const t = new THREE.RenderTarget(w, h, { depthBuffer: false });
		t.texture.colorSpace = THREE.NoColorSpace;
		t.texture.minFilter = THREE.LinearFilter;
		t.texture.magFilter = THREE.LinearFilter;
		t.texture.generateMipmaps = false;
		return t;
	};
	let scene = null; // the scene target (only with layers of its own)
	const chain = [null, null, null]; // ¼, ⅛, 1/16 of each side
	const DIV = [4, 8, 16];
	let size = [0, 0];
	const placeholder = new THREE.Texture();

	// The board laid into the scene target over what is under it: its texture
	// is premultiplied, so ONE, ONE − α.
	const boardQuadTex = texture(placeholder, screenUV);
	const boardMat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
	boardMat.colorNode = boardQuadTex;
	boardMat.transparent = true;
	boardMat.blending = THREE.CustomBlending;
	boardMat.blendSrc = THREE.OneFactor;
	boardMat.blendDst = THREE.OneMinusSrcAlphaFactor;
	boardMat.blendSrcAlpha = THREE.OneFactor;
	boardMat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
	const boardQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), boardMat);
	boardQuad.frustumCulled = false;
	const boardScene = new THREE.Scene();
	boardScene.add(boardQuad);

	// ── The blur chain: each level four bilinear taps of the one before,
	// a texel out each way (a 4 × 4 box of its source) ──
	// A sampler: texture nodes at any uv that all follow one .value.
	const sampler = () => {
		const nodes = [];
		return {
			at(uvn = screenUV) {
				const n = texture(placeholder, uvn);
				nodes.push(n);
				return n;
			},
			load() {
				const n = textureLoad(placeholder, ivec2(screenCoordinate.xy));
				nodes.push(n);
				return n;
			},
			set(tex) {
				for (const n of nodes) n.value = tex;
			}
		};
	};
	const src = sampler(); // the picture: the board, or the scene target
	const down = [];
	for (let i = 0; i < 3; i++) {
		const step = uniform(V2(1 / 1280, 1 / 800)); // the source's texel
		const sm = i === 0 ? src : sampler();
		// (the board is premultiplied, and may be clear where a flow draws a
		// layer under it: laid over the ground here, as in the final pass)
		const tap = (dx, dy) => {
			const c = sm.at(screenUV.add(vec2(dx, dy).mul(step)));
			return i === 0 ? c.rgb.add(u.ground.mul(float(1).sub(c.a))) : c.rgb;
		};
		const sc = new THREE.Scene();
		sc.backgroundNode = vec4(
			tap(-1, -1).add(tap(1, -1)).add(tap(-1, 1)).add(tap(1, 1)).mul(0.25),
			1
		);
		down.push({ scene: sc, step, src: sm });
	}
	// The halo, at a quarter size: the neighbourhood's light (the quarter
	// blur and the wider ones), warm (the wide part redder, as film's
	// halation), and only in the dark (on a lit wall a dark keyline stays
	// crisp). The final pass adds it only where it is brighter than the
	// pixel itself — the dark beside a line — so a line stays crisp.
	const LUM = LUM_;
	const gq = texture(placeholder, screenUV);
	const ge = texture(placeholder, screenUV);
	const gs = texture(placeholder, screenUV);
	const glowRT = { rt: null };
	const glowScene = new THREE.Scene();
	{
		const wide = ge.rgb.mul(0.55).add(gs.rgb.mul(0.45));
		const near = gq.rgb.mul(0.5).add(wide.mul(0.5));
		const L = dot(near, LUM);
		const gate = smoothstep(u.haloFrom, u.haloFrom.add(0.4), L).mul(
			float(1).sub(smoothstep(0.3, 0.7, dot(wide, LUM)))
		);
		const warm = mix(vec3(1.0, 0.66, 0.42), vec3(1.0, 0.88, 0.72), smoothstep(0.25, 0.8, L));
		glowScene.backgroundNode = vec4(near.mul(warm).mul(gate), 1);
	}

	// ── A light's shafts (god rays), at a quarter size: the picture's own
	// brights smeared out from the light along its rays, so a room's lines
	// shadow them — the light is made of what is there ──
	const raysRT = { rt: null };
	const raysScene = new THREE.Scene();
	const raysSrc = sampler();
	{
		const N = 24;
		const lp = u.lightP.div(vec2(u.W, u.H)); // the light, in uv
		const d = screenUV.sub(lp);
		let acc = vec3(0);
		let wsum = 0;
		for (let i = 0; i < N; i++) {
			const f = (0.9 * i) / N;
			const c = raysSrc.at(screenUV.sub(d.mul(f))).rgb;
			const w = Math.pow(0.94, i);
			acc = acc.add(c.mul(smoothstep(0.5, 0.95, dot(c, LUM_))).mul(w));
			wsum += w;
		}
		raysScene.backgroundNode = vec4(acc.div(wsum), 1);
	}

	// ── The final pass ──
	// The grain's noise: a tile of random bytes, read bilinear (so each
	// field is soft value noise), a field a place on the tile.
	const NT = 128;
	const noiseData = new Uint8Array(4 * NT * NT);
	{
		let sd = 90210;
		for (let i = 0; i < noiseData.length; i++) {
			sd = (sd * 1103515245 + 12345) & 0x7fffffff;
			noiseData[i] = sd >> 23;
		}
	}
	const noiseTex = new THREE.DataTexture(noiseData, NT, NT, THREE.RGBAFormat);
	noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
	noiseTex.magFilter = THREE.LinearFilter;
	noiseTex.minFilter = THREE.LinearFilter;
	noiseTex.colorSpace = THREE.NoColorSpace;
	noiseTex.needsUpdate = true;
	const g = {
		offA: uniform(V2(0, 0)),
		offB: uniform(V2(0, 0)),
		wA: uniform(1),
		wB: uniform(0),
		// the leak: which edge (0 left, 1 right, 2 top), where along it, how much
		side: uniform(0),
		along: uniform(0.5),
		env: uniform(0)
	};
	// the picture: unfiltered (one read a pixel) when the lens is the board's
	// size, else filtered down to it
	const srcLoad = src.load();
	const srcAt = src.at();
	const soft = texture(placeholder, screenUV); // its quarter blur
	const halo = texture(placeholder, screenUV); // the halo
	const raysTex = texture(placeholder, screenUV); // a light's shafts
	// One pass, built per what it carries this frame (switched in JS: a
	// software GPU runs an untaken branch anyway): the leak, a flow's light.
	const outOf = ({ leak, light, full }) =>
		Fn(() => {
			const pic = full ? srcLoad : srcAt;
			const base = pic.rgb.add(u.ground.mul(float(1).sub(pic.a))); // over the ground
			const px = screenUV.mul(vec2(u.W, u.H)); // device px
			// The mist: the quarter blur, a little, into the picture.
			const col = mix(base, soft.rgb, u.mist).toVar();
			// The halo where it is brighter than the pixel: base + k·max(h − c, 0)
			// is max(c, c + k(h − c)).
			col.assign(max(col, mix(col, halo.rgb, u.halo)));
			// The lift: the darks lifted a hair, warm (c + l(1 − c)).
			const lift = vec3(1.0, 0.66, 0.34).mul(u.lift);
			col.assign(col.mul(vec3(1).sub(lift)).add(lift));
			if (light) {
				// ── A light (the conception's): its shafts, a sunburst through
				// them, a core, rings drifting out of it — all warm, added as
				// light (tone-mapped, so it glows and never clips) ──
				const dv = px.sub(u.lightP);
				const r = length(dv).add(1e-3);
				const rr = r.div(u.lightR);
				const th = atan(dv.y, dv.x);
				// the sunburst: 13 broad rays and 21 fine ones, turning slowly,
				// each broad ray its own warm hue (red-orange → gold → cream,
				// stepped by the golden ratio)
				const a1 = th.mul(13).add(u.lightTurn);
				const c1 = sin(a1).mul(0.5).add(0.5);
				const c2 = c1.mul(c1);
				const a2 = th.mul(21).sub(u.lightTurn.mul(1.7));
				const d1 = sin(a2).mul(0.5).add(0.5);
				const d2 = d1.mul(d1);
				const d4 = d2.mul(d2);
				const burst = c2.mul(c2).mul(c1).add(d4.mul(d2).mul(0.5));
				const hueK = fract(floor(a1.div(TAU).add(0.5)).mul(0.618034));
				const rayCol = mix(
					mix(vec3(1.0, 0.42, 0.14), vec3(1.0, 0.72, 0.3), smoothstep(0.0, 0.5, hueK)),
					vec3(1.0, 0.9, 0.64),
					smoothstep(0.5, 1.0, hueK)
				);
				// the shafts: the picture's brights from the light, warmed,
				// stronger along the sunburst's rays
				const shafts = raysTex.rgb.mul(vec3(1.0, 0.86, 0.62));
				const reach = float(1).div(rr.mul(0.05).add(1));
				const rays = shafts
					.mul(burst.mul(0.9).add(0.5))
					.mul(0.9)
					.add(rayCol.mul(burst).mul(reach).mul(0.22));
				// the core: white-gold, falling off warm
				const core = exp(rr.mul(rr).negate())
					.mul(1.1)
					.add(float(0.5).div(rr.mul(rr).mul(0.06).add(1)));
				const coreCol = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.6, 0.24), smoothstep(0.7, 5.0, rr));
				// the rings: the tunnel's, in light — log-spaced, drifting out
				const lr = log(max(rr, 0.05)).mul(2.2).sub(u.lightPhase);
				const ring = smoothstep(0.9, 1.0, sin(lr.mul(TAU)).mul(0.5).add(0.5)).mul(
					smoothstep(0.8, 2.0, rr)
				);
				const em = rays
					.mul(u.lightRays)
					.add(coreCol.mul(core).mul(u.lightCore))
					.add(
						mix(rayCol, vec3(1.0, 0.9, 0.7), 0.5)
							.mul(ring)
							.mul(reach)
							.mul(u.lightRings)
					);
				col.assign(col.add(vec3(1).sub(exp(em.negate())).mul(vec3(1).sub(col))));
				// The white: a disc of it blooming out of the light, then
				// burning out — a colour-dodge by its level (the darks back
				// first, the room's lights last), the edges first and the light
				// last — with a thin veil of it over the first instants.
				const bloom = clamp(u.bloomReach.sub(r).div(u.bloomSoft), 0, 1);
				const burn = clamp(
					u.burnA.add(u.burnB.mul(exp(r.div(u.burnR).mul(r.div(u.burnR)).negate()))),
					0,
					1
				);
				const wl = max(bloom, burn);
				const dodged = min(col.div(max(float(1).sub(wl), 1e-3)), 1);
				const veil = wl
					.mul(wl)
					.mul(wl.mul(wl))
					.mul(wl.mul(wl).mul(wl.mul(wl)));
				col.assign(mix(dodged, vec3(1.0, 0.988, 0.962), veil));
			}
			// The grain: two soft fields cross-faded (their weights from JS,
			// the variance kept level through the fade), strongest in the
			// mid-tones, none in the white.
			const gp = px.div(u.grainPx.mul(u.dpr).mul(NT));
			const na = texture(noiseTex, gp.add(g.offA)).r;
			const nb = texture(noiseTex, gp.add(g.offB)).r;
			const n = na.mul(g.wA).add(nb.mul(g.wB)).mul(2).sub(g.wA.add(g.wB));
			// (in the mid-tones: 0.3 at black, 1 by a quarter grey, 0 at white)
			const Lc = dot(col, LUM);
			const mid = min(Lc.mul(2.8).add(0.3), float(1).sub(Lc).mul(2), 1);
			col.addAssign(vec3(1.0, 0.9, 0.78).mul(n.mul(u.grain).mul(mid)));
			if (leak) {
				// The leak: a faint white-blue light in at an edge.
				const sx = screenUV.x;
				const sy = screenUV.y;
				const right = clamp(g.side, 0, 1).sub(clamp(g.side.sub(1), 0, 1));
				const top = clamp(g.side.sub(1), 0, 1);
				const ex = mix(sx, float(1).sub(sx), right);
				const dEdge = mix(ex, sy, top);
				const dAlong = mix(sy, sx, top).sub(g.along);
				const blob = exp(dEdge.mul(dEdge).mul(-26)).mul(exp(dAlong.mul(dAlong).mul(-5)));
				const leakCol = mix(
					vec3(0.78, 0.88, 1.0),
					vec3(1.0, 0.98, 0.94),
					exp(dEdge.mul(dEdge).mul(-160))
				);
				col.addAssign(leakCol.mul(blob.mul(g.env).mul(u.leak)).mul(vec3(1).sub(col)));
			}
			return vec4(clamp(col, 0, 1), 1);
		})();
	const finals = new Map();
	const finalScene = (o) => {
		const key = `${o.leak ? 1 : 0}${o.light ? 1 : 0}${o.full ? 1 : 0}`;
		let sc = finals.get(key);
		if (!sc) {
			sc = new THREE.Scene();
			sc.backgroundNode = outOf(o);
			finals.set(key, sc);
		}
		return sc;
	};
	// A seeded hash, 0…1 (the grain's places, the leaks' edges).
	const h01 = (n) => {
		let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
		x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
		return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
	};
	// The grain and the leak at `secs`.
	function drift(secs) {
		const gr = secs * u.grainRate.value;
		const k = Math.floor(gr);
		const f = gr - k;
		const s = f * f * (3 - 2 * f);
		const norm = 1 / Math.sqrt(s * s + (1 - s) * (1 - s));
		g.offA.value.set(h01(2 * k), h01(2 * k + 1));
		g.offB.value.set(h01(2 * k + 2), h01(2 * k + 3));
		g.wA.value = (1 - s) * norm;
		g.wB.value = s * norm;
		// a leak every leakEvery seconds: up over ~4 s, down over ~5 s, at a
		// seeded edge, drifting along it
		const P = u.leakEvery.value;
		const ci = Math.floor(secs / P);
		const cf = secs / P - ci;
		const sst = (a, b, x) => {
			const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
			return t * t * (3 - 2 * t);
		};
		const env = sst(0, 0.18, cf) * (1 - sst(0.2, 0.42, cf));
		const sd = h01(ci * 7 + 3);
		g.side.value = sd < 0.33 ? 0 : sd < 0.67 ? 1 : 2;
		g.along.value = 0.2 + 0.6 * h01(ci * 7 + 5) + 0.25 * cf - 0.12;
		g.env.value = env;
		return env * u.leak.value > 0.0005;
	}

	const clear = new THREE.Color();
	const GROUND = new THREE.Color(...hex3(PAL.ground));
	let sized = '';
	function ensure() {
		const key = `${board.w}x${board.h}@${board.dpr}`;
		if (key !== sized) {
			sized = key;
			res = resOf();
			renderer.setPixelRatio((board.dpr || 1) * res);
			renderer.setSize(board.w, board.h, false);
		}
		const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
		const w = Math.max(1, Math.round(buf.x));
		const h = Math.max(1, Math.round(buf.y));
		if (w === size[0] && h === size[1]) return;
		size = [w, h];
		if (scene) scene.setSize(w, h);
		for (let i = 0; i < 3; i++) {
			const cw = Math.max(1, Math.round(w / DIV[i]));
			const ch = Math.max(1, Math.round(h / DIV[i]));
			if (!chain[i]) chain[i] = RT(cw, ch);
			else chain[i].setSize(cw, ch);
		}
		down[1].src.set(chain[0].texture);
		down[2].src.set(chain[1].texture);
		if (!glowRT.rt) glowRT.rt = RT(chain[0].width, chain[0].height);
		else glowRT.rt.setSize(chain[0].width, chain[0].height);
		gq.value = chain[0].texture;
		ge.value = chain[1].texture;
		gs.value = chain[2].texture;
		soft.value = chain[0].texture;
		halo.value = glowRT.rt.texture;
		if (!raysRT.rt) raysRT.rt = RT(chain[0].width, chain[0].height);
		else raysRT.rt.setSize(chain[0].width, chain[0].height);
		raysSrc.set(chain[0].texture);
		raysTex.value = raysRT.rt.texture;
		u.W.value = w;
		u.H.value = h;
	}

	const LOOK = Object.keys(LENS);
	function frame({
		secs = 0,
		under = null,
		over = null,
		after = null,
		look = null,
		light = null
	} = {}) {
		ensure();
		const [w, h] = size;
		u.secs.value = secs;
		const dpr = (board.dpr || 1) * res; // the lens's px to the CSS px
		u.dpr.value = dpr;
		for (const key of LOOK) u[key].value = look?.[key] ?? LENS[key];
		// A light, in CSS px (see the header): on while any of it is
		const L =
			light &&
			((light.rays ?? 0) > 0.001 ||
				(light.core ?? 0) > 0.001 ||
				(light.rings ?? 0) > 0.001 ||
				(light.bloom ?? -1) > 0 ||
				(light.burnA ?? 0) > 0.002 ||
				(light.burnB ?? 0) > 0.002)
				? light
				: null;
		if (L) {
			u.lightP.value.set(L.x * dpr, L.y * dpr);
			u.lightR.value = Math.max(1, (L.r ?? 40) * dpr);
			u.lightRays.value = L.rays ?? 0;
			u.lightCore.value = L.core ?? 0;
			u.lightRings.value = L.rings ?? 0;
			u.lightPhase.value = L.phase ?? 0;
			u.lightTurn.value = L.turn ?? 0;
			u.bloomReach.value = (L.bloom ?? -1) * dpr;
			u.bloomSoft.value = Math.max(1, (L.bloomSoft ?? 100) * dpr);
			u.burnA.value = L.burnA ?? 0;
			u.burnB.value = L.burnB ?? 0;
			u.burnR.value = Math.max(1, (L.burnR ?? 200) * dpr);
		}

		const cs = renderer.outputColorSpace;
		const tm = renderer.toneMapping;
		const was = renderer.getRenderTarget();
		const autoClear = renderer.autoClear;
		renderer.getClearColor(clear);
		const clearA = renderer.getClearAlpha();
		renderer.outputColorSpace = THREE.ColorManagement.workingColorSpace;
		renderer.toneMapping = THREE.NoToneMapping;
		try {
			const P = window.__prof; // a profiling harness's marks, if any
			P?.mark('lens:js');
			const tex = boardTexture();
			// The picture: the board alone, or the board between the flow's
			// own GPU layers in the scene target.
			if (under || over) {
				if (!scene) scene = RT(w, h);
				renderer.setRenderTarget(scene);
				renderer.setClearColor(GROUND, 1);
				renderer.autoClear = false;
				renderer.clear();
				under?.(renderer, { dpr });
				boardQuadTex.value = tex;
				renderer.render(boardScene, camera);
				over?.(renderer, { dpr });
				src.set(scene.texture);
			} else src.set(tex);
			// (every pass below covers its whole target: no clears)
			renderer.autoClear = false;
			P?.mark('lens:upload+layers');
			// The chain.
			let sw = w;
			let sh = h;
			for (let i = 0; i < 3; i++) {
				down[i].step.value.set(1 / sw, 1 / sh);
				renderer.setRenderTarget(chain[i]);
				renderer.render(down[i].scene, camera);
				sw = chain[i].width;
				sh = chain[i].height;
			}
			renderer.setRenderTarget(glowRT.rt);
			renderer.render(glowScene, camera);
			if (L && (L.rays ?? 0) > 0.001) {
				renderer.setRenderTarget(raysRT.rt);
				renderer.render(raysScene, camera);
			}
			// The lens, to the canvas.
			renderer.setRenderTarget(null);
			const leak = drift(secs);
			renderer.render(finalScene({ leak, light: !!L, full: res >= 0.999 }), camera);
			// What the flow draws over it on the GPU (log/gpu-ink.js): onto the
			// canvas as it is, given the board (its alpha says where the board
			// covers a layer meant to be under it) and the lens's pixel ratio.
			if (after) {
				renderer.autoClear = false;
				after(renderer, { board: tex, dpr });
			}
		} finally {
			renderer.setRenderTarget(was);
			renderer.outputColorSpace = cs;
			renderer.toneMapping = tm;
			renderer.autoClear = autoClear;
			renderer.setClearColor(clear, clearA);
		}
	}

	return {
		frame,
		u,
		renderer,
		canvas,
		software,
		get res() {
			return res;
		},
		dispose() {
			boardTex?.dispose();
			scene?.dispose();
			for (const c of chain) c?.dispose();
			glowRT.rt?.dispose();
			raysRT.rt?.dispose();
			noiseTex.dispose();
		}
	};
}

// A flow's fuzz, either way: through the lens (`o`: its frame's options), or
// — with none — the canvas grain over the board, and a GPU layer `o.under`
// drawn as it was, on the lab's renderer under the board.
export function fuzz(lens, ctx, w, h, secs, o = {}) {
	if (lens) return lens.frame({ secs, ...o });
	grain(ctx, w, h, secs);
	o.under?.();
}
