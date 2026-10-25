// ── GPU ink: the hand's strokes as one instanced draw ────────────────────────
// log/sketch-hand.js's batched strokes (makeInk), the speed lines' wedges and
// the debris' dashes drawn on the GPU instead of the board's canvas: every
// segment of every polyline an INSTANCE of one quad, laid out in the vertex
// shader, its edge antialiased in the fragment, all of a layer in ONE draw.
// A canvas strokes the same lines by tessellating each path on the CPU (and
// raster-filling its bounds); here the CPU only lists the points.
//
// THE LOOK, as the canvas's. A polyline's segments meet in MITRE joins, each
// pair sharing the two corners of its joint exactly, so no pixel is covered
// twice and a translucent ring has no beads at its points; a turn sharper
// than 60° splits it there into two strokes with round caps (the canvas's
// round join, at the alphas the hand writes in). Its ends are round caps.
// Widths and alphas are quantised and stacked as makeInk does — the dark
// keylines under every keyed line first, then the inks in the order their
// colours were first used — so the layers fall in the same order. Wedges (a
// speed line: a tip and a base) and dashes (a debris stroke) go in where
// they are called. Colours are display values; the blend is premultiplied
// over.
//
//   const gi = makeGpuInk({ THREE })              one per layer
//   gi.reset()                                    each frame, before drawing
//   const ink = gi.ink()                          makeInk's line(), flush()
//   ink.line(pts, color, width, alpha, keyed); ink.flush(ctx)  (ctx unused)
//   gi.wedge(x0, y0, x1, y1, halfWidth, color, alpha)
//   gi.dash(x0, y0, x1, y1, width, color, alpha)
//   gi.draw(renderer, { w, h, dpr, mask })        onto the bound target;
//                                                 `mask` a texture whose alpha
//                                                 hides the ink (the board's:
//                                                 a layer UNDER it)
//   gi.count                                      segments this frame

import {
	Fn,
	uniform,
	attribute,
	texture,
	screenUV,
	vec2,
	vec4,
	float,
	max,
	min,
	clamp,
	length,
	abs,
	mod,
	floor,
	select,
	dot,
	mix
} from 'three/tsl';
import { HAND } from './sketch-hand.js';

const MAX = 1 << 15; // segments a layer can hold (grown if asked)
const SHARP = 0.5; // cos of the turn past which a joint is split (60°)

// '#rrggbb' (or anything a canvas takes) → [r, g, b] 0…1, cached.
const COLOURS = new Map();
let probe = null;
function rgbOf(c) {
	let v = COLOURS.get(c);
	if (v) return v;
	let hex = c;
	if (!/^#[0-9a-f]{6}$/i.test(c)) {
		probe ??= document.createElement('canvas').getContext('2d');
		probe.fillStyle = '#000';
		probe.fillStyle = c;
		hex = probe.fillStyle;
	}
	const n = parseInt(hex.slice(1, 7), 16);
	v = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
	COLOURS.set(c, v);
	return v;
}

export function makeGpuInk({ THREE }) {
	let cap = MAX;
	let A = new Float32Array(4 * cap); // p0, p1
	let Bm = new Float32Array(4 * cap); // mitre at p0, at p1
	let C = new Float32Array(4 * cap); // half-width at p0, at p1, caps (1 start, 2 end)
	let D = new Float32Array(4 * cap); // colour, alpha
	let n = 0;

	// The quad: (s along 0…1, side ±1), two triangles.
	const quad = new THREE.InstancedBufferGeometry();
	quad.setAttribute(
		'corner',
		new THREE.BufferAttribute(new Float32Array([0, -1, 1, -1, 1, 1, 0, 1]), 2)
	);
	quad.setIndex([0, 1, 2, 0, 2, 3]);
	let attrs = null;
	const bind = () => {
		attrs = [A, Bm, C, D].map((arr) => {
			const a = new THREE.InstancedBufferAttribute(arr, 4);
			a.setUsage(THREE.DynamicDrawUsage);
			return a;
		});
		quad.setAttribute('iA', attrs[0]);
		quad.setAttribute('iB', attrs[1]);
		quad.setAttribute('iC', attrs[2]);
		quad.setAttribute('iD', attrs[3]);
	};
	bind();
	const grow = (need) => {
		if (need <= cap) return;
		while (cap < need) cap *= 2;
		const re = (old) => {
			const a = new Float32Array(4 * cap);
			a.set(old);
			return a;
		};
		A = re(A);
		Bm = re(Bm);
		C = re(C);
		D = re(D);
		for (const k of ['iA', 'iB', 'iC', 'iD']) quad.deleteAttribute(k);
		bind();
		mesh.material.needsUpdate = true;
	};

	const u = {
		W: uniform(1280), // the board, CSS px
		H: uniform(800),
		dpr: uniform(1),
		masked: uniform(0)
	};
	const maskTex = texture(new THREE.Texture(), screenUV);

	const mat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
	mat.transparent = true;
	mat.blending = THREE.CustomBlending;
	mat.blendSrc = THREE.OneFactor;
	mat.blendDst = THREE.OneMinusSrcAlphaFactor;
	mat.blendSrcAlpha = THREE.OneFactor;
	mat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
	mat.side = THREE.DoubleSide;
	{
		const iA = attribute('iA', 'vec4');
		const iB = attribute('iB', 'vec4');
		const iC = attribute('iC', 'vec4');
		const iD = attribute('iD', 'vec4');
		const corner = attribute('corner', 'vec2');
		const p0 = iA.xy;
		const p1 = iA.zw;
		const seg = p1.sub(p0);
		const L = max(length(seg), 1e-4);
		const dir = seg.div(L);
		const nrm = vec2(dir.y.negate(), dir.x);
		const px = float(1).div(u.dpr); // a device pixel, in CSS px
		const cap0 = mod(iC.z, 2);
		const cap1 = floor(iC.z.div(2));
		// The quad's corner: the joint's mitre at its end, out to the
		// half-width and a pixel's fringe; a cap's end pushed out as far.
		const s = corner.x;
		const P = mix(p0, p1, s);
		const m = mix(iB.xy, iB.zw, s);
		const hw = mix(iC.x, iC.y, s);
		const ext = max(hw, px.mul(0.5)).add(px);
		const out = select(s.lessThan(0.5), cap0.negate(), cap1).mul(ext);
		const pos = P.add(m.mul(corner.y).mul(ext)).add(dir.mul(out));
		mat.vertexNode = vec4(pos.x.div(u.W).mul(2).sub(1), float(1).sub(pos.y.div(u.H).mul(2)), 0, 1);
		// Where the fragment is against its segment (affine in the quad, so
		// interpolated exactly): along it from p0, and across it.
		const rel = pos.sub(p0);
		const tAlong = dot(rel, dir).toVarying();
		const dAcross = dot(rel, nrm).toVarying();
		mat.colorNode = Fn(() => {
			const t = tAlong;
			const d = dAcross;
			const Lf = length(iA.zw.sub(iA.xy)).max(1e-4);
			const hwT = mix(iC.x, iC.y, clamp(t.div(Lf), 0, 1));
			const c0 = mod(iC.z, 2);
			const c1 = floor(iC.z.div(2));
			// round caps past the ends; else the distance across
			const dist = abs(d).toVar();
			dist.assign(select(t.lessThan(0).and(c0.greaterThan(0.5)), length(vec2(t, d)), dist));
			dist.assign(
				select(t.greaterThan(Lf).and(c1.greaterThan(0.5)), length(vec2(t.sub(Lf), d)), dist)
			);
			const dprF = u.dpr;
			const hwe = max(hwT, float(0.5).div(dprF));
			// a pixel's ramp at the edge; a line under a pixel wide, fainter
			const cov = clamp(hwe.sub(dist).mul(dprF).add(0.5), 0, 1).mul(min(hwT.mul(2).mul(dprF), 1));
			const under = float(1).sub(maskTex.a.mul(u.masked));
			const a = iD.w.mul(cov).mul(under);
			return vec4(iD.xyz.mul(a), a);
		})();
	}
	const mesh = new THREE.Mesh(quad, mat);
	mesh.frustumCulled = false;
	const scene = new THREE.Scene();
	scene.add(mesh);
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	const push = (x0, y0, x1, y1, mx0, my0, mx1, my1, hw0, hw1, caps, rgb, a) => {
		if (n >= cap) grow(n + 1);
		const i = 4 * n;
		A[i] = x0;
		A[i + 1] = y0;
		A[i + 2] = x1;
		A[i + 3] = y1;
		Bm[i] = mx0;
		Bm[i + 1] = my0;
		Bm[i + 2] = mx1;
		Bm[i + 3] = my1;
		C[i] = hw0;
		C[i + 1] = hw1;
		C[i + 2] = caps;
		C[i + 3] = 0;
		D[i] = rgb[0];
		D[i + 1] = rgb[1];
		D[i + 2] = rgb[2];
		D[i + 3] = a;
		n++;
	};

	// A polyline: mitred at its joints, split at its sharp turns, capped.
	const polyline = (pts, rgb, hw, a) => {
		// drop repeated points
		const P = [];
		for (const p of pts) {
			const q = P[P.length - 1];
			if (!q || Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) > 1e-3) P.push(p);
		}
		const m = P.length;
		if (m < 2) {
			if (m === 1) push(P[0][0], P[0][1], P[0][0] + 1e-3, P[0][1], 0, 1, 0, 1, hw, hw, 3, rgb, a);
			return;
		}
		// unit directions and normals of the segments
		const dx = [];
		const dy = [];
		for (let i = 0; i < m - 1; i++) {
			const ex = P[i + 1][0] - P[i][0];
			const ey = P[i + 1][1] - P[i][1];
			const l = Math.hypot(ex, ey);
			dx.push(ex / l);
			dy.push(ey / l);
		}
		// each joint's mitre (shared by the two segments), or a split
		let mx = -dy[0];
		let my = dx[0];
		let capStart = 1;
		for (let i = 0; i < m - 1; i++) {
			const nx = -dy[i];
			const ny = dx[i];
			let ex = nx;
			let ey = ny;
			let capEnd = 2;
			if (i < m - 2) {
				const cos = dx[i] * dx[i + 1] + dy[i] * dy[i + 1];
				if (cos >= SHARP) {
					const ax = nx - dy[i + 1];
					const ay = ny + dx[i + 1];
					const al = Math.hypot(ax, ay);
					const k = 1 / ((ax / al) * nx + (ay / al) * ny); // 1 / cos(half the turn)
					ex = (ax / al) * k;
					ey = (ay / al) * k;
					capEnd = 0;
				}
			}
			push(
				P[i][0],
				P[i][1],
				P[i + 1][0],
				P[i + 1][1],
				mx,
				my,
				ex,
				ey,
				hw,
				hw,
				capStart | capEnd,
				rgb,
				a
			);
			if (capEnd) {
				// a split (or the end): the next segment starts square, capped
				mx = i < m - 2 ? -dy[i + 1] : 0;
				my = i < m - 2 ? dx[i + 1] : 0;
				capStart = 1;
			} else {
				mx = ex;
				my = ey;
				capStart = 0;
			}
		}
	};

	return {
		get count() {
			return n;
		},
		reset() {
			n = 0;
		},
		// makeInk's batch, onto this layer (see log/sketch-hand.js)
		ink() {
			const B = new Map();
			const order = [];
			return {
				line(pts, color, width, alpha = 1, keyed = true) {
					if (!pts || pts.length < 2 || alpha <= 0.01 || width <= 0.05) return;
					const wq = Math.max(0.25, Math.round(width * 4) / 4);
					const aq = Math.min(20, Math.round(alpha * 20));
					if (aq <= 0) return;
					const key = `${color}|${wq}|${aq}|${keyed ? 1 : 0}`;
					let b = B.get(key);
					if (!b) {
						B.set(key, (b = { color, width: wq, alpha: aq / 20, keyed, runs: [] }));
						if (!order.includes(color)) order.push(color);
					}
					b.runs.push(pts);
				},
				get empty() {
					return B.size === 0;
				},
				// (the canvas argument is makeInk's; it is not used)
				flush(_ctx, { key = HAND.key, keyW = 1 } = {}) {
					const kc = rgbOf(key);
					for (const b of B.values()) {
						if (!b.keyed) continue;
						const hw = (b.width + Math.max(2, 0.7 * b.width) * keyW) / 2;
						const a = Math.min(1, b.alpha * 1.1);
						for (const R of b.runs) polyline(R, kc, hw, a);
					}
					for (const c of order) {
						const rgb = rgbOf(c);
						for (const b of B.values()) {
							if (b.color !== c) continue;
							for (const R of b.runs) polyline(R, rgb, b.width / 2, b.alpha);
						}
					}
					B.clear();
					order.length = 0;
				}
			};
		},
		// A speed line: from its tip (x0, y0) to its base (x1, y1), hw wide there.
		wedge(x0, y0, x1, y1, hw, color, a) {
			const l = Math.hypot(x1 - x0, y1 - y0) || 1;
			const nx = -(y1 - y0) / l;
			const ny = (x1 - x0) / l;
			push(x0, y0, x1, y1, nx, ny, nx, ny, 0, hw, 0, rgbOf(color), a);
		},
		// A dash with round ends.
		dash(x0, y0, x1, y1, width, color, a) {
			const l = Math.hypot(x1 - x0, y1 - y0);
			if (l < 1e-3) x1 += 1e-3;
			const L = l || 1e-3;
			const nx = -(y1 - y0) / L;
			const ny = (x1 - x0) / L;
			push(x0, y0, x1, y1, nx, ny, nx, ny, width / 2, width / 2, 3, rgbOf(color), a);
		},
		draw(renderer, { w, h, dpr = 1, mask = null }) {
			if (!n) return;
			u.W.value = w;
			u.H.value = h;
			u.dpr.value = dpr;
			u.masked.value = mask ? 1 : 0;
			if (mask) maskTex.value = mask;
			for (const a of attrs) {
				a.clearUpdateRanges();
				a.addUpdateRange(0, 4 * n);
				a.needsUpdate = true;
			}
			quad.instanceCount = n;
			renderer.render(scene, camera);
		},
		dispose() {
			quad.dispose();
			mat.dispose();
		}
	};
}
