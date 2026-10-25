// ── The sketch hand: shaky, warm, boiling lines and hand-lettered figures ────
// The anime hand (Eva, Akira) for the board, lifted out of
// flow-strand-sketch.js: every line drawn a little off true, and drawn AGAIN
// a few times a second — "on twos", 12 drawings a second — so the lines boil
// the way hand-drawn animation does, while the camera's own move stays
// smooth. Every frame a pure function of t (the drawing it is on is
// boilOf(t)).
//
//   import { HAND, boilOf, makeHand, makeInk, letter, strike, circleMark,
//            speedLines, rand } from './log/sketch-hand.js';
//
//   const hand = makeHand(ctx)   a stand-in for the board's context: anything
//                                drawn through hand.ctx (body.js's swimmer,
//                                fall.js's rooms, any kit drawing) comes out
//                                in the hand. Paths are cut to ~12 px and
//                                every point moved by a smooth noise field
//                                (amp px, `wave` px across), re-seeded each
//                                drawing; long straight lines overshoot their
//                                corners, as a sketch's do; images (the
//                                rooms' cels) jitter by a pixel or so each,
//                                the wallpaper's mirrored tiles together;
//                                clips stay true. hand.set({ seed, amp, wave,
//                                over, img, ox, oy, scale, dpr }): `scale` the
//                                zoom the drawing is under about (ox, oy)
//                                (fall.js's e-folds, exp'd) — the noise rides
//                                it, so a line moving with the zoom keeps its
//                                wobble between drawings instead of crawling
//                                through a field fixed on the screen (an
//                                octave cross-fade keeps the wobble ~wave px
//                                across at any zoom). scale 1: the screen's.
//   const ink = makeInk()        a batch of hand strokes: ink.line(pts, …),
//                                then ink.flush(ctx) — the dark keylines under
//                                everything, then the inks, the reds last, as
//                                few paths as there are colours and widths.
//   letter(ink, str, x, y, size, o)   hand-lettered figures (a stroke font of
//                                digits, capitals, a few small letters and the
//                                maths' signs), each glyph its own wobble,
//                                lean and lift each drawing. Returns the box.
//   strike(ink, box, k, o)       a red slash through a box, written on to k
//   circleMark(ink, box, k, o)   a red ring round a box, written on to k
//   speedLines(ctx, o)           focus lines from a point (or a seam): thin
//                                wedges, re-drawn each drawing, one fill
//
// The stroke font: glyphs are polylines in a box one cap-height tall (y up,
// the baseline at 0), drawn with a round brush ~0.1 of the size wide.

import { lerp, TAU } from './board.js';

export const HAND = {
	rate: 12, // drawings a second ("on twos" at 24)
	ink: '#fff6e8', // the white ink, warm
	red: '#ef3f2c', // the red pencil
	key: '#120f0e', // the keyline under the ink
	gold: '#ffd27a'
};

export const boilOf = (t, rate = HAND.rate) => Math.floor(t * rate + 1e-6);

// ── Noise ────────────────────────────────────────────────────────────────────
function hash(i, j, k) {
	let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(k | 0, 1440662683);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	h ^= h >>> 16;
	return (h & 0xffff) / 32767.5 - 1;
}
// 0…1, seeded
export const rand = (i, j = 0, k = 0) => 0.5 + 0.5 * hash(i, j + 7, k + 13);
const fade = (f) => f * f * (3 - 2 * f);
export function noise1(x, k) {
	const i = Math.floor(x);
	const u = fade(x - i);
	return lerp(hash(i, 0, k), hash(i + 1, 0, k), u);
}
export function noise2(x, y, k) {
	const i = Math.floor(x);
	const j = Math.floor(y);
	const u = fade(x - i);
	const v = fade(y - j);
	const a = lerp(hash(i, j, k), hash(i + 1, j, k), u);
	const b = lerp(hash(i, j + 1, k), hash(i + 1, j + 1, k), u);
	return lerp(a, b, v);
}

// ── The hand: a context whose strokes boil ───────────────────────────────────
export function makeHand(real) {
	const st = {
		seed: 0,
		amp: 1.2,
		wave: 46,
		over: 0,
		img: 1,
		ox: 0,
		oy: 0,
		scale: 1,
		dpr: 1,
		step: 12,
		on: true
	};
	// The octaves of the noise at this zoom (see the header).
	let O = null;
	const octaves = () => {
		const g = Math.log2(Math.max(1e-9, st.scale));
		const k = Math.floor(g);
		const f = g - k;
		const m0 = Math.pow(2, k) / st.wave / st.scale;
		O = {
			f,
			m0,
			m1: 2 * m0,
			s0: st.seed * 7 + k,
			s1: st.seed * 7 + k + 1,
			n: st.amp / Math.sqrt((1 - f) * (1 - f) + f * f)
		};
	};
	octaves();
	const P = [0, 0];
	const disp = (x, y) => {
		const qx = x - st.ox;
		const qy = y - st.oy;
		const { f, m0, m1, s0, s1, n } = O;
		let dx = (1 - f) * noise2(qx * m0, qy * m0, s0);
		let dy = (1 - f) * noise2(qx * m0 + 31.7, qy * m0 - 17.3, s0);
		if (f > 0.001) {
			dx += f * noise2(qx * m1, qy * m1, s1);
			dy += f * noise2(qx * m1 + 31.7, qy * m1 - 17.3, s1);
		}
		P[0] = x + n * dx;
		P[1] = y + n * dy;
		return P;
	};

	let subs = [];
	let cur = null;
	const start = (x, y) => {
		cur = { p: [x, y], closed: false, raw: false };
		subs.push(cur);
	};
	const to = (x, y) => {
		if (!cur) start(x, y);
		else cur.p.push(x, y);
	};
	const flatArc = (cx, cy, rx, ry, rot, a0, a1, ccw) => {
		let d = a1 - a0;
		if (!ccw && d < 0) d = (d % TAU) + TAU;
		if (ccw && d > 0) d = (d % TAU) - TAU;
		if (!ccw && a1 - a0 >= TAU) d = TAU;
		if (ccw && a0 - a1 >= TAU) d = -TAU;
		const r = Math.max(rx, ry);
		const n = Math.max(6, Math.min(96, Math.ceil((Math.abs(d) * r) / 6)));
		const cr = Math.cos(rot);
		const sr = Math.sin(rot);
		for (let i = 0; i <= n; i++) {
			const a = a0 + (d * i) / n;
			const ex = rx * Math.cos(a);
			const ey = ry * Math.sin(a);
			const x = cx + ex * cr - ey * sr;
			const y = cy + ex * sr + ey * cr;
			if (i === 0) {
				if (!cur) start(x, y);
				else to(x, y);
			} else to(x, y);
		}
	};

	// A subpath, cut at its sharp corners into strokes that overshoot them.
	const corners = (p, closed) => {
		const n = p.length / 2;
		const pts = [];
		for (let i = 0; i < n; i++) pts.push([p[2 * i], p[2 * i + 1]]);
		if (closed) pts.push(pts[0]);
		const m = pts.length;
		const sharp = [];
		for (let i = 1; i < m - 1; i++) {
			const ax = pts[i][0] - pts[i - 1][0];
			const ay = pts[i][1] - pts[i - 1][1];
			const bx = pts[i + 1][0] - pts[i][0];
			const by = pts[i + 1][1] - pts[i][1];
			const la = Math.hypot(ax, ay);
			const lb = Math.hypot(bx, by);
			if (la < 16 || lb < 16) continue;
			if ((ax * bx + ay * by) / (la * lb) < 0.55) sharp.push(i);
		}
		if (!sharp.length) return [pts];
		const out = [];
		const ext = (a, b, o) => {
			const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
			const e = Math.min(o, 0.2 * L);
			return [b[0] + ((b[0] - a[0]) / L) * e, b[1] + ((b[1] - a[1]) / L) * e];
		};
		const o = st.over;
		let from = 0;
		let lead = null;
		for (const i of [...sharp, m - 1]) {
			const piece = pts.slice(from, i + 1);
			if (lead) piece[0] = lead;
			if (i < m - 1) {
				piece[piece.length - 1] = ext(pts[i - 1], pts[i], o);
				lead = ext(pts[i + 1], pts[i], o * 0.7);
			}
			out.push(piece);
			from = i;
		}
		return out;
	};
	// The real path from the buffer: in the hand (cut and moved), or true.
	const emit = (shaky, overshoot) => {
		real.beginPath();
		const step = st.step;
		for (const s of subs) {
			const p = s.p;
			if (p.length < 4) continue;
			if (!shaky || !st.on) {
				real.moveTo(p[0], p[1]);
				for (let i = 2; i < p.length; i += 2) real.lineTo(p[i], p[i + 1]);
				if (s.closed) real.closePath();
				continue;
			}
			const pieces =
				overshoot && st.over > 0
					? corners(p, s.closed)
					: [
							(() => {
								const q = [];
								for (let i = 0; i < p.length; i += 2) q.push([p[i], p[i + 1]]);
								if (s.closed) q.push(q[0]);
								return q;
							})()
						];
			for (const q of pieces) {
				let D = disp(q[0][0], q[0][1]);
				real.moveTo(D[0], D[1]);
				for (let i = 1; i < q.length; i++) {
					const ax = q[i - 1][0];
					const ay = q[i - 1][1];
					const bx = q[i][0];
					const by = q[i][1];
					const L = Math.hypot(bx - ax, by - ay);
					const k = Math.max(1, Math.min(64, Math.ceil(L / step)));
					for (let j = 1; j <= k; j++) {
						D = disp(ax + ((bx - ax) * j) / k, ay + ((by - ay) * j) / k);
						real.lineTo(D[0], D[1]);
					}
				}
			}
		}
	};

	const over = {
		beginPath() {
			subs = [];
			cur = null;
			real.beginPath();
		},
		moveTo(x, y) {
			start(x, y);
		},
		lineTo(x, y) {
			to(x, y);
		},
		closePath() {
			if (cur && cur.p.length >= 4) {
				cur.closed = true;
				start(cur.p[0], cur.p[1]);
			}
		},
		arc(x, y, r, a0, a1, ccw = false) {
			flatArc(x, y, r, r, 0, a0, a1, ccw);
		},
		ellipse(x, y, rx, ry, rot, a0, a1, ccw = false) {
			flatArc(x, y, rx, ry, rot, a0, a1, ccw);
		},
		rect(x, y, w, h) {
			subs.push({ p: [x, y, x + w, y, x + w, y + h, x, y + h], closed: true, raw: true });
			start(x, y);
		},
		quadraticCurveTo(cx, cy, x, y) {
			const [x0, y0] = cur ? cur.p.slice(-2) : [cx, cy];
			for (let i = 1; i <= 10; i++) {
				const u = i / 10;
				const a = (1 - u) * (1 - u);
				const b = 2 * u * (1 - u);
				const c = u * u;
				to(a * x0 + b * cx + c * x, a * y0 + b * cy + c * y);
			}
		},
		bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
			const [x0, y0] = cur ? cur.p.slice(-2) : [c1x, c1y];
			for (let i = 1; i <= 14; i++) {
				const u = i / 14;
				const v = 1 - u;
				to(
					v * v * v * x0 + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * x,
					v * v * v * y0 + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * y
				);
			}
		},
		arcTo(x1, y1) {
			to(x1, y1);
		},
		stroke(path) {
			if (path) return real.stroke(path);
			emit(true, true);
			real.stroke();
		},
		fill(a, b) {
			if (a && typeof a === 'object') return real.fill(a, b);
			emit(true, false);
			if (a) real.fill(a);
			else real.fill();
		},
		clip(a, b) {
			if (a && typeof a === 'object') return real.clip(a, b);
			emit(false, false);
			if (a) real.clip(a);
			else real.clip();
		},
		strokeRect(x, y, w, h) {
			const keep = subs;
			const kc = cur;
			subs = [{ p: [x, y, x + w, y, x + w, y + h, x, y + h], closed: true, raw: false }];
			emit(true, true);
			real.stroke();
			subs = keep;
			cur = kc;
			emit(false, false);
		},
		drawImage(img, ...a) {
			if (!st.on || !st.img) return real.drawImage(img, ...a);
			let dx;
			let dy;
			let dw;
			let dh;
			if (a.length === 2) [dx, dy, dw, dh] = [a[0], a[1], img.width, img.height];
			else if (a.length === 4) [dx, dy, dw, dh] = a;
			else [dx, dy, dw, dh] = a.slice(4);
			const T = real.getTransform();
			const cx = T.a * (dx + dw / 2) + T.c * (dy + dh / 2) + T.e;
			const cy = T.b * (dx + dw / 2) + T.d * (dy + dh / 2) + T.f;
			const sw = Math.hypot(T.a * dw, T.b * dw) || 1;
			const sh = Math.hypot(T.c * dh, T.d * dh) || 1;
			const dpr = st.dpr;
			// Where the cel sits against the vanishing point, in its own sizes
			// (the same through the zoom), its whole tiles dropped (so a mirrored
			// wallpaper's tiles boil together): its jitter's seed.
			const fr = (u) => Math.round((((u % 1) + 1) % 1) * 24) % 24;
			const kx = fr((cx / dpr - st.ox) / (sw / dpr) + 0.5);
			const ky = fr((cy / dpr - st.oy) / (sh / dpr) + 0.5);
			const ka = Math.round(Math.log(sh / sw) * 12) & 255;
			const jx = st.img * hash(kx, ky + 64 * ka, st.seed * 3 + 1);
			const jy = st.img * hash(ky, kx + 64 * ka, st.seed * 3 + 2);
			real.save();
			real.setTransform(T.a, T.b, T.c, T.d, T.e + jx * dpr, T.f + jy * dpr);
			real.drawImage(img, ...a);
			real.restore();
		}
	};
	const bound = new Map();
	const ctx = new Proxy(real, {
		get(target, prop) {
			if (Object.hasOwn(over, prop)) return over[prop];
			const v = target[prop];
			if (typeof v !== 'function') return v;
			let b = bound.get(prop);
			if (!b) bound.set(prop, (b = v.bind(target)));
			return b;
		},
		set(target, prop, value) {
			target[prop] = value;
			return true;
		}
	});
	return {
		ctx,
		real,
		set(o) {
			Object.assign(st, o);
			octaves();
			return this;
		},
		get state() {
			return st;
		}
	};
}

// ── Ink: batched hand strokes ────────────────────────────────────────────────
// Lines bucketed by colour, width (to a quarter px) and alpha (to a twentieth);
// flushed as the keylines (a dark rim under every keyed line), then the inks
// in the order their colours were first used.
export function makeInk() {
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
		flush(ctx, { key = HAND.key, keyW = 1 } = {}) {
			if (!B.size) return;
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const path = (b) => {
				ctx.beginPath();
				for (const R of b.runs) {
					ctx.moveTo(R[0][0], R[0][1]);
					for (let i = 1; i < R.length; i++) ctx.lineTo(R[i][0], R[i][1]);
				}
			};
			for (const b of B.values()) {
				if (!b.keyed) continue;
				ctx.globalAlpha = Math.min(1, b.alpha * 1.1);
				ctx.strokeStyle = key;
				ctx.lineWidth = b.width + Math.max(2, 0.7 * b.width) * keyW;
				path(b);
				ctx.stroke();
			}
			for (const c of order)
				for (const b of B.values()) {
					if (b.color !== c) continue;
					ctx.globalAlpha = b.alpha;
					ctx.strokeStyle = b.color;
					ctx.lineWidth = b.width;
					path(b);
					ctx.stroke();
				}
			ctx.restore();
			B.clear();
			order.length = 0;
		}
	};
}

// ── The stroke font ──────────────────────────────────────────────────────────
// Polylines in a box a cap-height (1) tall, the baseline at y = 0, y up; the
// small letters 0.62 tall. `arc` an elliptic arc in degrees, anticlockwise
// from +x (negative spans run clockwise).
function arc(cx, cy, rx, ry, a0, a1, n = 12) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
	}
	return out;
}
const cat = (...parts) => parts.flat(1);
const dot = (x, y, r = 0.045) => arc(x, y, r, r, 0, 360, 6);
const GLYPHS = {
	0: { w: 0.62, s: [arc(0.3, 0.5, 0.27, 0.5, 100, 460, 22)] },
	1: {
		w: 0.44,
		s: [
			[
				[0.06, 0.76],
				[0.26, 1],
				[0.26, 0]
			]
		]
	},
	2: {
		w: 0.62,
		s: [
			cat(arc(0.29, 0.71, 0.26, 0.29, 155, -35, 12), [
				[0.03, 0],
				[0.58, 0]
			])
		]
	},
	3: {
		w: 0.6,
		s: [cat(arc(0.27, 0.75, 0.24, 0.25, 150, -90, 12), arc(0.27, 0.27, 0.29, 0.27, 90, -155, 12))]
	},
	4: {
		w: 0.64,
		s: [
			[
				[0.46, 0],
				[0.46, 1],
				[0.02, 0.3],
				[0.62, 0.3]
			]
		]
	},
	5: {
		w: 0.6,
		s: [
			cat(
				[
					[0.54, 1],
					[0.12, 1],
					[0.08, 0.56]
				],
				arc(0.29, 0.31, 0.28, 0.32, 128, -150, 12)
			)
		]
	},
	6: {
		w: 0.62,
		s: [cat(arc(0.34, 0.52, 0.3, 0.48, 70, 190, 8), arc(0.31, 0.3, 0.27, 0.3, 190, 545, 16))]
	},
	7: {
		w: 0.6,
		s: [
			[
				[0.02, 1],
				[0.58, 1],
				[0.2, 0]
			]
		]
	},
	8: {
		w: 0.62,
		s: [arc(0.3, 0.76, 0.22, 0.24, -90, 270, 14), arc(0.3, 0.27, 0.27, 0.27, 90, 450, 16)]
	},
	9: {
		w: 0.62,
		s: [cat(arc(0.29, 0.7, 0.26, 0.3, -10, 355, 16), arc(0.25, 0.5, 0.31, 0.5, 0, -100, 8))]
	},
	A: {
		w: 0.66,
		s: [
			[
				[0.0, 0],
				[0.33, 1],
				[0.66, 0]
			],
			[
				[0.13, 0.36],
				[0.53, 0.36]
			]
		]
	},
	B: {
		w: 0.62,
		s: [
			cat(
				[
					[0.06, 0],
					[0.06, 1],
					[0.33, 1]
				],
				arc(0.33, 0.76, 0.21, 0.24, 90, -90, 8),
				[[0.06, 0.52]]
			),
			cat([[0.33, 0.52]], arc(0.36, 0.26, 0.24, 0.26, 90, -90, 8), [[0.06, 0]])
		]
	},
	C: { w: 0.64, s: [arc(0.35, 0.5, 0.32, 0.5, 40, 320, 16)] },
	D: {
		w: 0.66,
		s: [
			cat(
				[
					[0.06, 0],
					[0.06, 1],
					[0.24, 1]
				],
				arc(0.24, 0.5, 0.36, 0.5, 90, -90, 12),
				[[0.06, 0]]
			)
		]
	},
	E: {
		w: 0.56,
		s: [
			[
				[0.54, 1],
				[0.06, 1],
				[0.06, 0],
				[0.54, 0]
			],
			[
				[0.06, 0.52],
				[0.42, 0.52]
			]
		]
	},
	F: {
		w: 0.54,
		s: [
			[
				[0.54, 1],
				[0.06, 1],
				[0.06, 0]
			],
			[
				[0.06, 0.52],
				[0.42, 0.52]
			]
		]
	},
	G: {
		w: 0.68,
		s: [
			cat(arc(0.35, 0.5, 0.32, 0.5, 45, 345, 16), [
				[0.67, 0.42],
				[0.42, 0.42]
			])
		]
	},
	H: {
		w: 0.62,
		s: [
			[
				[0.06, 0],
				[0.06, 1]
			],
			[
				[0.56, 0],
				[0.56, 1]
			],
			[
				[0.06, 0.52],
				[0.56, 0.52]
			]
		]
	},
	I: {
		w: 0.24,
		s: [
			[
				[0.1, 0],
				[0.1, 1]
			]
		]
	},
	J: {
		w: 0.56,
		s: [
			cat(
				[
					[0.5, 1],
					[0.5, 0.3]
				],
				arc(0.27, 0.3, 0.23, 0.3, 0, -180, 10)
			)
		]
	},
	K: {
		w: 0.6,
		s: [
			[
				[0.06, 0],
				[0.06, 1]
			],
			[
				[0.56, 1],
				[0.08, 0.42]
			],
			[
				[0.24, 0.6],
				[0.58, 0]
			]
		]
	},
	L: {
		w: 0.52,
		s: [
			[
				[0.06, 1],
				[0.06, 0],
				[0.5, 0]
			]
		]
	},
	M: {
		w: 0.76,
		s: [
			[
				[0.04, 0],
				[0.08, 1],
				[0.37, 0.3],
				[0.66, 1],
				[0.7, 0]
			]
		]
	},
	N: {
		w: 0.64,
		s: [
			[
				[0.06, 0],
				[0.06, 1],
				[0.57, 0],
				[0.57, 1]
			]
		]
	},
	O: { w: 0.72, s: [arc(0.35, 0.5, 0.33, 0.5, 100, 460, 22)] },
	P: {
		w: 0.58,
		s: [
			cat(
				[
					[0.06, 0],
					[0.06, 1],
					[0.31, 1]
				],
				arc(0.31, 0.74, 0.24, 0.26, 90, -90, 10),
				[[0.06, 0.48]]
			)
		]
	},
	Q: {
		w: 0.72,
		s: [
			arc(0.35, 0.5, 0.33, 0.5, 100, 460, 22),
			[
				[0.42, 0.25],
				[0.72, -0.06]
			]
		]
	},
	R: {
		w: 0.6,
		s: [
			cat(
				[
					[0.06, 0],
					[0.06, 1],
					[0.31, 1]
				],
				arc(0.31, 0.74, 0.24, 0.26, 90, -90, 10),
				[[0.06, 0.48]]
			),
			[
				[0.3, 0.48],
				[0.58, 0]
			]
		]
	},
	S: {
		w: 0.6,
		s: [cat(arc(0.3, 0.75, 0.25, 0.25, 25, 270, 12), arc(0.3, 0.25, 0.27, 0.25, 90, -155, 12))]
	},
	T: {
		w: 0.6,
		s: [
			[
				[0.0, 1],
				[0.6, 1]
			],
			[
				[0.3, 1],
				[0.3, 0]
			]
		]
	},
	U: {
		w: 0.62,
		s: [
			cat(
				[
					[0.06, 1],
					[0.06, 0.32]
				],
				arc(0.31, 0.32, 0.25, 0.32, 180, 360, 12),
				[[0.56, 1]]
			)
		]
	},
	V: {
		w: 0.62,
		s: [
			[
				[0.0, 1],
				[0.31, 0],
				[0.62, 1]
			]
		]
	},
	W: {
		w: 0.82,
		s: [
			[
				[0.0, 1],
				[0.19, 0],
				[0.39, 0.72],
				[0.59, 0],
				[0.78, 1]
			]
		]
	},
	X: {
		w: 0.6,
		s: [
			[
				[0.04, 1],
				[0.56, 0]
			],
			[
				[0.56, 1],
				[0.04, 0]
			]
		]
	},
	Y: {
		w: 0.6,
		s: [
			[
				[0.02, 1],
				[0.3, 0.5],
				[0.58, 1]
			],
			[
				[0.3, 0.5],
				[0.3, 0]
			]
		]
	},
	Z: {
		w: 0.6,
		s: [
			[
				[0.04, 1],
				[0.56, 1],
				[0.04, 0],
				[0.58, 0]
			]
		]
	},
	h: {
		w: 0.54,
		s: [
			[
				[0.06, 1],
				[0.06, 0]
			],
			cat(arc(0.27, 0.38, 0.21, 0.24, 180, 0, 10), [[0.48, 0]])
		]
	},
	q: {
		w: 0.56,
		s: [
			arc(0.26, 0.31, 0.22, 0.31, 0, 360, 16),
			[
				[0.48, 0.62],
				[0.48, -0.34]
			]
		]
	},
	m: {
		w: 0.74,
		s: [
			[
				[0.05, 0],
				[0.05, 0.62]
			],
			cat(arc(0.2, 0.43, 0.15, 0.19, 180, 0, 8), [[0.35, 0]]),
			cat(arc(0.5, 0.43, 0.15, 0.19, 180, 0, 8), [[0.65, 0]])
		]
	},
	o: { w: 0.56, s: [arc(0.27, 0.31, 0.24, 0.31, 100, 460, 16)] },
	d: {
		w: 0.58,
		s: [
			arc(0.26, 0.31, 0.22, 0.31, 0, 360, 16),
			[
				[0.49, 1],
				[0.49, 0]
			]
		]
	},
	a: {
		w: 0.56,
		s: [
			arc(0.26, 0.31, 0.22, 0.31, 0, 360, 16),
			[
				[0.48, 0.62],
				[0.48, 0]
			]
		]
	},
	y: {
		w: 0.56,
		s: [
			[
				[0.02, 0.62],
				[0.27, 0.05]
			],
			[
				[0.52, 0.62],
				[0.18, -0.36]
			]
		]
	},
	s: {
		w: 0.5,
		s: [cat(arc(0.25, 0.47, 0.18, 0.15, 25, 270, 10), arc(0.25, 0.16, 0.2, 0.16, 90, -155, 10))]
	},
	' ': { w: 0.34, s: [] },
	'·': { w: 0.32, s: [dot(0.16, 0.5)] },
	'.': { w: 0.26, s: [dot(0.12, 0.05)] },
	',': {
		w: 0.26,
		s: [
			[
				[0.15, 0.08],
				[0.07, -0.16]
			]
		]
	},
	':': { w: 0.26, s: [dot(0.13, 0.62), dot(0.13, 0.1)] },
	'−': {
		w: 0.58,
		s: [
			[
				[0.06, 0.5],
				[0.52, 0.5]
			]
		]
	},
	'+': {
		w: 0.58,
		s: [
			[
				[0.06, 0.5],
				[0.52, 0.5]
			],
			[
				[0.29, 0.27],
				[0.29, 0.73]
			]
		]
	},
	'=': {
		w: 0.58,
		s: [
			[
				[0.06, 0.63],
				[0.52, 0.63]
			],
			[
				[0.06, 0.37],
				[0.52, 0.37]
			]
		]
	},
	'(': { w: 0.36, s: [arc(0.44, 0.45, 0.3, 0.64, 116, 244, 10)] },
	')': { w: 0.36, s: [arc(-0.08, 0.45, 0.3, 0.64, 64, -64, 10)] },
	'⌊': {
		w: 0.36,
		s: [
			[
				[0.12, 1.04],
				[0.12, -0.1],
				[0.32, -0.1]
			]
		]
	},
	'⌋': {
		w: 0.36,
		s: [
			[
				[0.24, 1.04],
				[0.24, -0.1],
				[0.04, -0.1]
			]
		]
	},
	'/': {
		w: 0.46,
		s: [
			[
				[0.04, -0.06],
				[0.42, 1.06]
			]
		]
	},
	'→': {
		w: 0.8,
		s: [
			[
				[0.04, 0.5],
				[0.72, 0.5]
			],
			[
				[0.52, 0.68],
				[0.72, 0.5],
				[0.52, 0.32]
			]
		]
	},
	'⇒': {
		w: 0.84,
		s: [
			[
				[0.04, 0.63],
				[0.6, 0.63]
			],
			[
				[0.04, 0.37],
				[0.6, 0.37]
			],
			[
				[0.5, 0.84],
				[0.76, 0.5],
				[0.5, 0.16]
			]
		]
	},
	'≤': {
		w: 0.58,
		s: [
			[
				[0.52, 0.86],
				[0.06, 0.58],
				[0.52, 0.3]
			],
			[
				[0.06, 0.1],
				[0.52, 0.1]
			]
		]
	},
	'<': {
		w: 0.58,
		s: [
			[
				[0.52, 0.8],
				[0.06, 0.5],
				[0.52, 0.2]
			]
		]
	},
	'!': {
		w: 0.26,
		s: [
			[
				[0.13, 1],
				[0.13, 0.3]
			],
			dot(0.13, 0.05)
		]
	},
	// ── the rest of the small letters and the number theory's signs (the
	// sketch's workings: congruences, a curve, a lattice) ──
	x: {
		w: 0.54,
		s: [
			[
				[0.04, 0.62],
				[0.5, 0]
			],
			[
				[0.5, 0.62],
				[0.04, 0]
			]
		]
	},
	p: {
		w: 0.56,
		s: [
			[
				[0.08, 0.62],
				[0.08, -0.34]
			],
			arc(0.3, 0.31, 0.22, 0.31, 0, 360, 16)
		]
	},
	n: {
		w: 0.54,
		s: [
			[
				[0.06, 0.62],
				[0.06, 0]
			],
			cat(arc(0.27, 0.38, 0.21, 0.24, 180, 0, 10), [[0.48, 0]])
		]
	},
	b: {
		w: 0.56,
		s: [
			[
				[0.07, 1],
				[0.07, 0]
			],
			arc(0.3, 0.31, 0.22, 0.31, 0, 360, 16)
		]
	},
	k: {
		w: 0.5,
		s: [
			[
				[0.06, 1],
				[0.06, 0]
			],
			[
				[0.44, 0.62],
				[0.08, 0.24]
			],
			[
				[0.2, 0.36],
				[0.46, 0]
			]
		]
	},
	e: {
		w: 0.54,
		s: [cat([[0.06, 0.32]], [[0.48, 0.32]], arc(0.27, 0.31, 0.21, 0.31, 0, 300, 14))]
	},
	r: {
		w: 0.4,
		s: [
			[
				[0.07, 0.62],
				[0.07, 0]
			],
			cat([[0.07, 0.4]], arc(0.28, 0.4, 0.2, 0.22, 180, 0, 6).slice(0, 4))
		]
	},
	t: {
		w: 0.4,
		s: [
			cat(
				[
					[0.16, 0.92],
					[0.16, 0.12]
				],
				arc(0.26, 0.12, 0.1, 0.12, 180, 300, 4)
			),
			[
				[0.02, 0.62],
				[0.34, 0.62]
			]
		]
	},
	i: {
		w: 0.24,
		s: [
			[
				[0.12, 0.62],
				[0.12, 0]
			],
			dot(0.12, 0.86)
		]
	},
	u: {
		w: 0.54,
		s: [
			cat([[0.06, 0.62]], arc(0.27, 0.24, 0.21, 0.24, 180, 360, 10)),
			[
				[0.48, 0.62],
				[0.48, 0]
			]
		]
	},
	l: {
		w: 0.24,
		s: [
			[
				[0.12, 1],
				[0.12, 0]
			]
		]
	},
	c: { w: 0.5, s: [arc(0.28, 0.31, 0.22, 0.31, 40, 320, 14)] },
	g: {
		w: 0.56,
		s: [
			arc(0.26, 0.31, 0.22, 0.31, 0, 360, 16),
			cat([[0.48, 0.62]], [[0.48, -0.1]], arc(0.26, -0.1, 0.22, 0.24, 0, 180, 8))
		]
	},
	v: {
		w: 0.54,
		s: [
			[
				[0.04, 0.62],
				[0.27, 0],
				[0.5, 0.62]
			]
		]
	},
	w: {
		w: 0.74,
		s: [
			[
				[0.04, 0.62],
				[0.2, 0],
				[0.37, 0.5],
				[0.54, 0],
				[0.7, 0.62]
			]
		]
	},
	f: {
		w: 0.38,
		s: [
			cat(arc(0.3, 0.84, 0.14, 0.16, 90, 180, 4), [[0.16, 0]]),
			[
				[0.02, 0.62],
				[0.32, 0.62]
			]
		]
	},
	z: {
		w: 0.5,
		s: [
			[
				[0.05, 0.62],
				[0.45, 0.62],
				[0.05, 0],
				[0.45, 0]
			]
		]
	},
	'≡': {
		w: 0.58,
		s: [
			[
				[0.06, 0.72],
				[0.52, 0.72]
			],
			[
				[0.06, 0.5],
				[0.52, 0.5]
			],
			[
				[0.06, 0.28],
				[0.52, 0.28]
			]
		]
	},
	'²': {
		w: 0.34,
		s: [cat(arc(0.16, 0.86, 0.12, 0.12, 200, 360, 5), [[0.04, 0.62]], [[0.3, 0.62]])]
	},
	'³': {
		w: 0.34,
		s: [cat([[0.04, 1]], [[0.28, 1]], [[0.16, 0.82]], arc(0.16, 0.72, 0.12, 0.1, 90, -180, 6))]
	},
	'|': {
		w: 0.26,
		s: [
			[
				[0.13, 1.04],
				[0.13, -0.1]
			]
		]
	},
	'[': {
		w: 0.34,
		s: [
			[
				[0.3, 1.04],
				[0.1, 1.04],
				[0.1, -0.1],
				[0.3, -0.1]
			]
		]
	},
	']': {
		w: 0.34,
		s: [
			[
				[0.04, 1.04],
				[0.24, 1.04],
				[0.24, -0.1],
				[0.04, -0.1]
			]
		]
	},
	';': {
		w: 0.26,
		s: [
			dot(0.13, 0.62),
			[
				[0.15, 0.08],
				[0.07, -0.16]
			]
		]
	},
	'×': {
		w: 0.5,
		s: [
			[
				[0.08, 0.72],
				[0.42, 0.28]
			],
			[
				[0.42, 0.72],
				[0.08, 0.28]
			]
		]
	},
	// (the slope of a tangent, an inverse, a lattice's basis, a sign either way)
	λ: {
		w: 0.56,
		s: [
			[
				[0.06, 0.96],
				[0.14, 0.96],
				[0.5, 0]
			],
			[
				[0.3, 0.5],
				[0.06, 0]
			]
		]
	},
	'⁻': {
		w: 0.34,
		s: [
			[
				[0.06, 0.82],
				[0.28, 0.82]
			]
		]
	},
	'¹': {
		w: 0.3,
		s: [
			[
				[0.06, 0.88],
				[0.16, 1],
				[0.16, 0.6]
			]
		]
	},
	'⟨': {
		w: 0.36,
		s: [
			[
				[0.3, 1.04],
				[0.08, 0.47],
				[0.3, -0.1]
			]
		]
	},
	'⟩': {
		w: 0.36,
		s: [
			[
				[0.06, 1.04],
				[0.28, 0.47],
				[0.06, -0.1]
			]
		]
	},
	Ш: {
		w: 0.78,
		s: [
			[
				[0.08, 1],
				[0.08, 0],
				[0.7, 0],
				[0.7, 1]
			],
			[
				[0.39, 0.96],
				[0.39, 0]
			]
		]
	},
	'≈': {
		w: 0.58,
		s: [
			[
				[0.06, 0.58],
				[0.17, 0.66],
				[0.29, 0.58],
				[0.41, 0.5],
				[0.52, 0.58]
			],
			[
				[0.06, 0.36],
				[0.17, 0.44],
				[0.29, 0.36],
				[0.41, 0.28],
				[0.52, 0.36]
			]
		]
	},
	'±': {
		w: 0.58,
		s: [
			[
				[0.06, 0.58],
				[0.52, 0.58]
			],
			[
				[0.29, 0.82],
				[0.29, 0.34]
			],
			[
				[0.06, 0.12],
				[0.52, 0.12]
			]
		]
	}
};
GLYPHS['-'] = GLYPHS['−'];
export const glyphs = GLYPHS;

// The width of a string at size 1 (its advance, tracked).
export function measure(str, track = 0.12) {
	let W = 0;
	for (const ch of str) W += (GLYPHS[ch] ?? GLYPHS[' ']).w + track;
	return Math.max(0, W - track);
}

// Hand-lettered: `str` set from x (by `align`) on the baseline y, `size` px a
// cap-height; each glyph its own wobble, lean and lift, re-drawn each
// drawing (`boil`), seeded by `seed`. Returns { x0, y0, x1, y1, cells }
// (cells: each glyph's box, for strikes).
export function letter(ink, str, x, y, size, o = {}) {
	const {
		align = 'center',
		seed = 0,
		boil = 0,
		amp = 0.035,
		lean = 0.06,
		width = 0.11,
		alpha = 1,
		color = HAND.ink,
		track = 0.12,
		upto = 1,
		keyed = true
	} = o;
	const W = measure(str, track) * size;
	let cx = align === 'left' ? x : align === 'right' ? x - W : x - W / 2;
	const cells = [];
	const chars = [...str];
	const n = Math.floor(upto * chars.length + 1e-6);
	const lw = Math.max(0.6, width * size);
	for (let g = 0; g < chars.length; g++) {
		const ch = chars[g];
		const G = GLYPHS[ch] ?? GLYPHS[' '];
		const gw = G.w * size;
		if (g < n && G.s.length) {
			const r = (k) => hash(seed * 31 + g, boil, k);
			const rot = lean * r(1);
			const lift = 0.05 * size * r(2);
			const sx = 1 + 0.06 * r(3);
			const sy = 1 + 0.07 * r(4);
			const ox = cx + 0.03 * size * r(5);
			const cs = Math.cos(rot);
			const sn = Math.sin(rot);
			const mx = G.w / 2;
			let si = 0;
			for (const s of G.s) {
				si++;
				const pts = [];
				for (let i = 0; i < s.length; i++) {
					const u = (i / Math.max(1, s.length - 1)) * 2.2;
					const k0 = seed * 131 + g * 17 + si * 5;
					const jx = amp * noise1(u + 0.37 * si, k0 + boil * 977);
					const jy = amp * noise1(u + 5.1 + 0.37 * si, k0 + boil * 977 + 3);
					const gx = (s[i][0] - mx) * sx + jx;
					const gy = (s[i][1] - 0.5) * sy + jy;
					const X = gx * cs - gy * sn + mx;
					const Y = gx * sn + gy * cs + 0.5;
					pts.push([ox + X * size, y - Y * size - lift]);
				}
				ink.line(pts, color, lw, alpha, keyed);
			}
		}
		cells.push([cx, y - size, cx + gw, y]);
		cx += gw + track * size;
	}
	const x0 = align === 'left' ? x : align === 'right' ? x - W : x - W / 2;
	return { x0, y0: y - size, x1: x0 + W, y1: y, cells, size };
}

// A red slash through a box [x0, y0, x1, y1], lower left to upper right with
// a little bow, written on to k (0…1).
export function strike(ink, box, k, o = {}) {
	if (k <= 0) return;
	const { seed = 0, boil = 0, color = HAND.red, alpha = 1, width = 0.16, keyed = false } = o;
	const [x0, y0, x1, y1] = box;
	const h = y1 - y0;
	const r = (j) => hash(seed * 17 + 3, boil, j);
	const ax = x0 - 0.12 * h + 0.05 * h * r(1);
	const ay = y1 - 0.18 * h + 0.08 * h * r(2);
	const bx = x1 + 0.12 * h + 0.05 * h * r(3);
	const by = y0 + 0.22 * h + 0.08 * h * r(4);
	const bow = (0.12 + 0.06 * r(5)) * h;
	const nx = -(by - ay);
	const ny = bx - ax;
	const nl = Math.hypot(nx, ny) || 1;
	const pts = [];
	const N = 12;
	for (let i = 0; i <= N; i++) {
		const u = (i / N) * Math.min(1, k);
		const b = 4 * u * (1 - u) * bow;
		pts.push([lerp(ax, bx, u) + (nx / nl) * b, lerp(ay, by, u) + (ny / nl) * b]);
	}
	ink.line(pts, color, Math.max(1, width * h), alpha, keyed);
}

// A red ring round a box, from the lower left round once and a little more,
// written on to k.
export function circleMark(ink, box, k, o = {}) {
	if (k <= 0) return;
	const { seed = 0, boil = 0, color = HAND.red, alpha = 1, width = 0.09, pad = 0.3 } = o;
	const [x0, y0, x1, y1] = box;
	const h = y1 - y0;
	const cx = (x0 + x1) / 2;
	const cy = (y0 + y1) / 2;
	const rx = (x1 - x0) / 2 + pad * h * 1.2;
	const ry = h / 2 + pad * h;
	const a0 = 2.4 + 0.2 * hash(seed, boil, 1);
	const turn = 1.12;
	const N = 56;
	const pts = [];
	for (let i = 0; i <= N; i++) {
		const u = (i / N) * Math.min(1, k);
		const a = a0 - TAU * turn * u;
		const wob = 1 + 0.05 * noise1(u * 5, seed * 7 + boil * 13) + 0.05 * u;
		pts.push([cx + rx * wob * Math.cos(a), cy + ry * wob * Math.sin(a)]);
	}
	ink.line(pts, color, Math.max(1.2, width * h), alpha, false);
}

// ── Speed lines ──────────────────────────────────────────────────────────────
// Focus lines from (ox, oy): n thin wedges, each from an inner radius to past
// the board's edge, tapering in, at angles drawn afresh each drawing (seed).
// `band` { W, hb } spreads their feet along a horizontal seam W either side
// of the point and lifts them off its edges (hb), so they spray out of it.
// `rIn(r01)` the inner radius for a line's random 0…1. One fill — or, given
// `gpu` (log/gpu-ink.js), a wedge apiece onto that layer.
export function speedLines(ctx, o) {
	const {
		ox,
		oy,
		w,
		h,
		n = 90,
		seed = 0,
		rIn = (u) => (0.08 + 0.3 * u) * h,
		width = 2.2,
		alpha = 0.5,
		color = HAND.ink,
		band = null,
		aspect = 1,
		gpu = null
	} = o;
	if (alpha <= 0.004 || n <= 0) return;
	const R = Math.hypot(w, h);
	if (!gpu) {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.beginPath();
	}
	for (let i = 0; i < n; i++) {
		const a = TAU * rand(i, seed, 1);
		const r0 = rIn(rand(i, seed, 2));
		const wd = width * (0.35 + 1.3 * rand(i, seed, 3) ** 2);
		const ca = Math.cos(a) * aspect;
		const sa = Math.sin(a);
		const L = Math.hypot(ca, sa) || 1;
		const ux = ca / L;
		const uy = sa / L;
		let fx = ox;
		let fy = oy;
		let lift = r0;
		if (band) {
			fx += band.W * (2 * rand(i, seed, 4) - 1);
			lift = r0 + band.hb / Math.max(0.15, Math.abs(uy));
		}
		const x0 = fx + ux * lift;
		const y0 = fy + uy * lift;
		const len = R * (0.5 + 0.6 * rand(i, seed, 5));
		const x1 = x0 + ux * len;
		const y1 = y0 + uy * len;
		if (gpu) {
			gpu.wedge(x0, y0, x1, y1, wd, color, alpha);
			continue;
		}
		const px = -uy * wd;
		const py = ux * wd;
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1 + px, y1 + py);
		ctx.lineTo(x1 - px, y1 - py);
		ctx.closePath();
	}
	if (gpu) return;
	ctx.fill();
	ctx.restore();
}
