// ── The blackboard ───────────────────────────────────────────────────────────
// The shared hand of the log sketches (lab/log-*.js): the rebuild as clean,
// bold, coloured line on a dark board — maths drawn and labelled like a
// lecture, the space-time geometry of the complex logarithm rather than the
// biology of the old runs. Everything here is 2D canvas: the look is lines,
// discs and type, and a 2D canvas draws those crisply on every device, with
// the 3D (spheres, cylinders, tori) projected by hand (camera3) the way the
// Atlas of the Logarithm draws its plates.
//
// One canvas for the page (getBoard), fixed over the lab's WebGPU canvas and
// repainted whole by whichever sketch is drawing, so a reel of sketches
// (/v4?chain=log) shows only the beat that is on.
//
// Coordinates: sketches work in MATH units — x right, y up — through a view
// (makeView) that puts the origin where it is asked and scales by a number of
// pixels to the unit; strokes and type are in CSS pixels.

import { clamp01, smoothstep, easeInOutCubic } from '$lib/config';

export const PHI = (1 + Math.sqrt(5)) / 2;
// The turn that never settles into spokes: 360°/φ² ≈ 137.5°.
export const GOLDEN_ANGLE = (2 * Math.PI) / (PHI * PHI);
export const TAU = Math.PI * 2;

// The palette, off the plates: a dark board, chalk for type and points, and
// three bold colours for the three things that matter — the golden spiral,
// and the two families of a net (cyan, pink) — with a rose for construction.
export const PAL = {
	ground: '#151515',
	chalk: '#ece6da',
	chalkDim: 'rgba(236, 230, 218, 0.5)',
	node: '#bdb8ad',
	gold: '#f5c150',
	cyan: '#5ed3e3',
	pink: '#eaa2e6',
	rose: '#a7847a',
	red: '#ef7a68',
	green: '#86cf8a',
	blue: '#7ea6f5',
	violet: '#b49af0'
};

// The type: a mathematical serif, italic, as a blackboard is written in.
export const MATH_FONT =
	"'Spectral', 'STIX Two Text', 'Latin Modern Roman', 'Cambria', Georgia, 'DejaVu Serif', serif";
export const TECH_FONT = "'nb-architekt', ui-monospace, 'SF Mono', Menlo, monospace";

export { clamp01, smoothstep, easeInOutCubic };
// Where u is in [a, b], 0..1.
export const span = (u, a, b) => clamp01((u - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => {
	const x = clamp01(t);
	return x * x * (3 - 2 * x);
};

// ── The canvas ───────────────────────────────────────────────────────────────
let BOARD = null;
export function getBoard() {
	if (BOARD) return BOARD;
	const canvas = document.createElement('canvas');
	canvas.className = 'log-board';
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100vw',
		height: '100vh',
		zIndex: '11', // over the layout's main (10), under the corner's switch (35)
		pointerEvents: 'none',
		display: 'block'
	});
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');
	BOARD = { canvas, ctx, w: 0, h: 0, dpr: 1, dust: null };
	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		BOARD.w = window.innerWidth;
		BOARD.h = window.innerHeight;
		BOARD.dpr = dpr;
		canvas.width = Math.round(BOARD.w * dpr);
		canvas.height = Math.round(BOARD.h * dpr);
	};
	resize();
	window.addEventListener('resize', resize);
	BOARD.resize = resize;
	return BOARD;
}

// A faint chalk dust over the board: fixed (seeded), so a pinned frame is the
// same frame on every load. Off with ?dust=0.
function dust(b) {
	if (b.dust) return b.dust;
	const c = document.createElement('canvas');
	c.width = c.height = 256;
	const x = c.getContext('2d');
	let s = 1234567;
	const r = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	for (let i = 0; i < 1400; i++) {
		x.fillStyle = `rgba(236, 230, 218, ${0.012 + 0.03 * r()})`;
		x.fillRect(r() * 256, r() * 256, 1 + r() * 1.5, 1 + r() * 1.5);
	}
	b.dust = b.ctx.createPattern(c, 'repeat');
	return b.dust;
}

// Clear to the board (in CSS pixels from here on).
export function clearBoard(b, { ground = PAL.ground, chalkDust = true } = {}) {
	const { ctx, dpr } = b;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = ground;
	ctx.fillRect(0, 0, b.canvas.width, b.canvas.height);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	if (chalkDust && q?.get('dust') !== '0') {
		ctx.fillStyle = dust(b);
		ctx.fillRect(0, 0, b.w, b.h);
	}
}

// ── The view: math units to screen ───────────────────────────────────────────
// `scale` pixels to the unit, the math origin at (cx, cy) on screen, turned
// by `rot` radians (counter-clockwise, math-wise).
export function makeView({ w, h, scale, cx = w / 2, cy = h / 2, rot = 0 }) {
	const c = Math.cos(rot);
	const s = Math.sin(rot);
	const to = ([x, y]) => [cx + scale * (c * x - s * y), cy - scale * (s * x + c * y)];
	const from = ([sx, sy]) => {
		const x = (sx - cx) / scale;
		const y = -(sy - cy) / scale;
		return [c * x + s * y, -s * x + c * y];
	};
	return { to, from, scale, cx, cy, rot };
}

// ── Strokes ──────────────────────────────────────────────────────────────────
// A polyline in screen pixels. `upto` (0..1) draws only that much of it, by
// length, so a line can be WRITTEN on; `taper` [w0, w1] draws it in segments
// from width w0 at the start to w1 at the end; `glow` adds a soft halo.
export function stroke(ctx, pts, opts = {}) {
	const {
		color = PAL.chalk,
		width = 2,
		alpha = 1,
		glow = 0,
		dash = null,
		upto = 1,
		taper = null,
		cap = 'round'
	} = opts;
	if (!pts || pts.length < 2 || alpha <= 0 || upto <= 0) return;
	let P = pts;
	if (upto < 1) P = cutAt(pts, upto);
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.lineCap = cap;
	ctx.lineJoin = 'round';
	if (dash) ctx.setLineDash(dash);
	if (glow > 0) {
		ctx.shadowColor = color;
		ctx.shadowBlur = glow;
	}
	if (taper) {
		const n = P.length - 1;
		for (let i = 0; i < n; i++) {
			ctx.lineWidth = Math.max(0.01, lerp(taper[0], taper[1], (i + 0.5) / n));
			ctx.beginPath();
			ctx.moveTo(P[i][0], P[i][1]);
			ctx.lineTo(P[i + 1][0], P[i + 1][1]);
			ctx.stroke();
		}
	} else {
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(P[0][0], P[0][1]);
		for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
		ctx.stroke();
	}
	ctx.restore();
}

// The first `f` of a polyline, by length.
export function cutAt(pts, f) {
	let L = 0;
	const seg = [];
	for (let i = 1; i < pts.length; i++) {
		const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
		seg.push(d);
		L += d;
	}
	let left = clamp01(f) * L;
	const out = [pts[0]];
	for (let i = 1; i < pts.length; i++) {
		if (left >= seg[i - 1]) {
			out.push(pts[i]);
			left -= seg[i - 1];
		} else {
			const t = seg[i - 1] > 0 ? left / seg[i - 1] : 0;
			out.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]);
			break;
		}
	}
	return out;
}

// A filled disc, with an optional ring round it in another colour (the
// plates' nodes are chalk discs; their marked points have a dark ring).
export function disc(ctx, x, y, r, opts = {}) {
	const { fill = PAL.node, alpha = 1, ring = null, ringWidth = 1.5, glow = 0 } = opts;
	if (r <= 0 || alpha <= 0) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	if (glow > 0) {
		ctx.shadowColor = fill;
		ctx.shadowBlur = glow;
	}
	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU);
	ctx.fill();
	if (ring) {
		ctx.shadowBlur = 0;
		ctx.strokeStyle = ring;
		ctx.lineWidth = ringWidth;
		ctx.stroke();
	}
	ctx.restore();
}

// A soft glow of light — the orb, a beat — as a radial gradient.
export function bloom(ctx, x, y, r, color, alpha = 1) {
	if (r <= 0 || alpha <= 0) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'lighter';
	const g = ctx.createRadialGradient(x, y, 0, x, y, r);
	g.addColorStop(0, color);
	g.addColorStop(0.25, color);
	g.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// ── Type ─────────────────────────────────────────────────────────────────────
// Blackboard maths: `^{…}` and `_{…}` for super- and subscripts (one level),
// written on a character at a time with `upto` (0..1). Returns its width.
export function math(ctx, str, x, y, opts = {}) {
	const {
		color = PAL.chalk,
		size = 18,
		italic = true,
		alpha = 1,
		align = 'left',
		upto = 1,
		font = MATH_FONT,
		weight = 400
	} = opts;
	const runs = [];
	const re = /([\^_])\{([^}]*)\}/g;
	let last = 0;
	let m;
	while ((m = re.exec(str))) {
		if (m.index > last) runs.push({ t: str.slice(last, m.index), k: 0 });
		runs.push({ t: m[2], k: m[1] === '^' ? 1 : -1 });
		last = re.lastIndex;
	}
	if (last < str.length) runs.push({ t: str.slice(last), k: 0 });
	const fontOf = (k) =>
		`${italic ? 'italic ' : ''}${weight} ${k ? Math.round(size * 0.66) : size}px ${font}`;
	ctx.save();
	let W = 0;
	for (const r of runs) {
		ctx.font = fontOf(r.k);
		r.w = ctx.measureText(r.t).width;
		W += r.w;
	}
	let cx = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
	const total = runs.reduce((s, r) => s + r.t.length, 0);
	let budget = Math.floor(clamp01(upto) * total + 1e-6);
	ctx.globalAlpha = alpha;
	ctx.fillStyle = color;
	ctx.textBaseline = 'middle';
	for (const r of runs) {
		if (budget <= 0) break;
		const t = r.t.slice(0, budget);
		budget -= r.t.length;
		ctx.font = fontOf(r.k);
		ctx.fillText(t, cx, y - r.k * size * 0.36);
		cx += r.w;
	}
	ctx.restore();
	return W;
}

// ── Complex numbers, as [re, im] ─────────────────────────────────────────────
export const C = {
	add: (a, b) => [a[0] + b[0], a[1] + b[1]],
	sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
	mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
	div: (a, b) => {
		const d = b[0] * b[0] + b[1] * b[1] || 1e-30;
		return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
	},
	scale: (a, s) => [a[0] * s, a[1] * s],
	abs: (a) => Math.hypot(a[0], a[1]),
	arg: (a) => Math.atan2(a[1], a[0]),
	exp: (a) => {
		const r = Math.exp(a[0]);
		return [r * Math.cos(a[1]), r * Math.sin(a[1])];
	},
	log: (a) => [Math.log(Math.hypot(a[0], a[1]) || 1e-300), Math.atan2(a[1], a[0])],
	polar: (r, t) => [r * Math.cos(t), r * Math.sin(t)],
	rot: (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)],
	// (a z + b) / (c z + d), every coefficient complex.
	mobius: (z, [a, b, c, d]) => C.div(C.add(C.mul(a, z), b), C.add(C.mul(c, z), d))
};

// ── Spirals ──────────────────────────────────────────────────────────────────
// The golden spiral: r = a · φ^(2t/π) — a factor of φ every quarter turn —
// from angle t0 to t1, n points. A logarithmic spiral: in log coordinates a
// straight line, so turning it is the same as scaling it.
export function goldenSpiral({ t0 = -12, t1 = 3, n = 600, a = 1, turn = 0 } = {}) {
	const k = (2 * Math.log(PHI)) / Math.PI;
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const t = t0 + ((t1 - t0) * i) / n;
		const r = a * Math.exp(k * t);
		pts.push([r * Math.cos(t + turn), r * Math.sin(t + turn)]);
	}
	return pts;
}
// Its growth rate, per radian: r = a · e^(K t).
export const GOLDEN_K = (2 * Math.log(PHI)) / Math.PI;

// Map a list of math points through a view.
export const through = (view, pts) => pts.map(view.to);

// ── 3D, projected by hand ────────────────────────────────────────────────────
// A camera at `pos` looking at `target`, `up` roughly up, vertical field of
// view `fov` degrees (or orthographic with `ortho` world units to the frame's
// half-height). project([x,y,z]) → [sx, sy, depth], depth > 0 in front.
export function camera3({ pos, target = [0, 0, 0], up = [0, 1, 0], fov = 40, w, h, ortho = 0 }) {
	const f = norm(sub3(target, pos));
	const r = norm(cross(f, up));
	const u = cross(r, f);
	const k = h / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
	const project = (p) => {
		const d = sub3(p, pos);
		const x = dot(d, r);
		const y = dot(d, u);
		const z = dot(d, f);
		if (ortho > 0) {
			const s = h / 2 / ortho;
			return [w / 2 + x * s, h / 2 - y * s, z];
		}
		return [w / 2 + (k * x) / z, h / 2 - (k * y) / z, z];
	};
	return { project, pos, f, r, u };
}
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];
export const norm = (a) => {
	const l = Math.hypot(a[0], a[1], a[2]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
};
// Rotate about the y axis, then the x axis.
export function turn3([x, y, z], yaw = 0, pitch = 0) {
	const cy = Math.cos(yaw);
	const sy = Math.sin(yaw);
	const x1 = cy * x + sy * z;
	const z1 = -sy * x + cy * z;
	const cp = Math.cos(pitch);
	const sp = Math.sin(pitch);
	return [x1, cp * y - sp * z1, sp * y + cp * z1];
}

// A polyline in 3D, split into runs in front of / behind a test, so a sphere's
// far side can be drawn faint and dashed (the plates' hidden lines).
export function stroke3(ctx, cam, pts, opts = {}, hidden = null, hiddenOpts = null) {
	if (!hidden) {
		const P = [];
		for (const p of pts) {
			const q = cam.project(p);
			if (q[2] > 0.001) P.push(q);
		}
		return stroke(ctx, P, opts);
	}
	let run = [];
	let back = null;
	const flush = () => {
		if (run.length > 1) stroke(ctx, run, back ? { ...opts, ...hiddenOpts } : opts);
		run = [];
	};
	for (const p of pts) {
		const q = cam.project(p);
		const b = hidden(p);
		if (back !== null && b !== back) {
			run.push(q);
			flush();
		}
		back = b;
		if (q[2] > 0.001) run.push(q);
	}
	flush();
}

// ── Time ─────────────────────────────────────────────────────────────────────
// Every log sketch is a pure function of its progress u in [0, 1] over
// `seconds`, looping when it runs free — the lab's ?at= pins it exactly.
export function clock(seconds, at) {
	let t = at === null || at === undefined ? 0 : at * seconds;
	return {
		get u() {
			return clamp01(t / seconds);
		},
		get t() {
			return t;
		},
		seconds,
		seek(u) {
			t = clamp01(u) * seconds;
		},
		step(dt) {
			t += dt;
			if (t > seconds + 1.2) t = 0; // a beat on the last frame, then round
		}
	};
}

// The sketch's own switches: ?v=… picks a variant, by name. A reel that
// strings several sketches together (/v4?chain=log) names each one's variant
// itself, by pickVariant() round the sketch's make().
let PICK = null;
export function pickVariant(v) {
	PICK = v ?? null;
}
export function variant(names, fallback = names[0]) {
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	const v = PICK ?? q?.get('v');
	return names.includes(v) ? v : fallback;
}

// ── The lecture notes ────────────────────────────────────────────────────────
// A line or two of maths in the top left of the board, each written on with
// its own progress — the coordinate descriptions a lecture leaves.
export function note(ctx, w, h, R, lines, { color = PAL.chalk, size = null } = {}) {
	let y = Math.max(40, h * 0.08);
	const sz = size ?? Math.round(Math.max(18, R * 0.07));
	for (const [s, p] of lines) {
		if (p > 0) math(ctx, s, Math.max(28, w * 0.05), y, { size: sz, upto: p, alpha: 0.92, color });
		y += Math.max(30, sz * 1.6);
	}
}

// The sketch's name, small, bottom left.
export function tag(ctx, w, h, s) {
	ctx.save();
	ctx.font = `11px ${TECH_FONT}`;
	ctx.fillStyle = 'rgba(236, 230, 218, 0.4)';
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(s, 14, h - 12);
	ctx.restore();
}
