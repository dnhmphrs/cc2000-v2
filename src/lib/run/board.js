// ── The blackboard ───────────────────────────────────────────────────────────
// What the run is drawn on: clean, bold line on a dark board. Everything here
// is 2D canvas — the look is lines, discs and type, and a 2D canvas draws
// those crisply on every device — with the 3D projected by hand (camera3).
//
// One canvas for the page (getBoard), fixed over it and repainted whole every
// frame; strokes and type are in CSS pixels. Through the lens (lens.js) the
// canvas is hidden and drawn on the GPU as a texture instead.

export const PHI = (1 + Math.sqrt(5)) / 2;
export const TAU = Math.PI * 2;

// The palette: a dark board, chalk for line and type, gold for what is lit,
// a rose for construction.
export const PAL = {
	ground: '#151515',
	chalk: '#ece6da',
	node: '#bdb8ad',
	gold: '#f5c150',
	rose: '#a7847a'
};

// The type: the site's own face, monospaced.
export const TECH_FONT = "'nb-architekt', ui-monospace, 'SF Mono', Menlo, monospace";

export function clamp01(v) {
	return v < 0 ? 0 : v > 1 ? 1 : v;
}
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
	canvas.className = 'board';
	Object.assign(canvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100vw',
		height: '100vh',
		zIndex: '11', // under the page's output (30) and the corner's label (35)
		pointerEvents: 'none',
		display: 'block'
	});
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');
	BOARD = { canvas, ctx, w: 0, h: 0, dpr: 1, shown: true, lens: null };
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

// Clear to the board (in CSS pixels from here on). `ground: null` clears it
// to transparent (the run draws on the GPU under it). `shown: false` hides
// the board's canvas: the lens (lens.js) draws the board on the GPU itself.
// (The style is touched only when it changes.)
export function clearBoard(b, { ground = PAL.ground, shown = true } = {}) {
	const { ctx, dpr } = b;
	if (b.shown !== shown) {
		b.shown = shown;
		b.canvas.style.visibility = shown ? '' : 'hidden';
		// the lens's canvas in its place (lens.js), when there is one
		if (b.lens) b.lens.style.visibility = shown ? 'hidden' : '';
	}
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
	if (ground === null) ctx.clearRect(0, 0, b.canvas.width, b.canvas.height);
	else {
		ctx.fillStyle = ground;
		ctx.fillRect(0, 0, b.canvas.width, b.canvas.height);
	}
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
function cutAt(pts, f) {
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

// A filled disc, with an optional ring round it in another colour.
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

// A soft glow of light, as a radial gradient (a flat shoulder: see glow).
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

// A soft light with a smooth falloff, added: `rgb` [r, g, b], radius r px.
// (bloom's flat shoulder reads as a plate when it is large; this does not.)
export function glow(ctx, x, y, r, rgb, a = 1) {
	if (r <= 0 || a <= 0) return;
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	const g = ctx.createRadialGradient(x, y, 0, x, y, r);
	const c = (k) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a * k})`;
	g.addColorStop(0, c(1));
	g.addColorStop(0.12, c(0.6));
	g.addColorStop(0.3, c(0.24));
	g.addColorStop(0.55, c(0.07));
	g.addColorStop(1, c(0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU);
	ctx.fill();
	ctx.restore();
}

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
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];
export const norm = (a) => {
	const l = Math.hypot(a[0], a[1], a[2]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
};

// ── Time ─────────────────────────────────────────────────────────────────────
// The run is a pure function of its clock t over `seconds`; `at` (a fraction,
// from ?at=) pins it exactly.
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
