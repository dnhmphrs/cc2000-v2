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

export const PHI = (1 + Math.sqrt(5)) / 2;
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

export function clamp01(v) {
	return v < 0 ? 0 : v > 1 ? 1 : v;
}
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
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
	BOARD = { canvas, ctx, w: 0, h: 0, dpr: 1, dust: null, shown: true, lens: null };
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

// Clear to the board (in CSS pixels from here on). `ground: null` clears it
// to transparent (a flow drawing on the GPU under it). `shown: false` hides
// the board's canvas — a flow whose lens (log/lens.js) draws the board on the
// GPU itself; every other sketch shows it, so a reel stepping from one to the
// other gets its board back. (The style is touched only when it changes.)
export function clearBoard(b, { ground = PAL.ground, chalkDust = true, shown = true } = {}) {
	const { ctx, dpr } = b;
	if (b.shown !== shown) {
		b.shown = shown;
		b.canvas.style.visibility = shown ? '' : 'hidden';
		// the lens's canvas in its place (log/lens.js), when there is one
		if (b.lens) b.lens.style.visibility = shown ? 'hidden' : '';
		// (the page's own tag sits under the board: hidden with it, see
		// routes/lab and routes/v4)
		document.documentElement.classList.toggle('board-lens', !shown);
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
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	if (chalkDust && q?.get('dust') !== '0') {
		ctx.fillStyle = dust(b);
		ctx.fillRect(0, 0, b.w, b.h);
	}
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
export const cross = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];
export const norm = (a) => {
	const l = Math.hypot(a[0], a[1], a[2]) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
};

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
