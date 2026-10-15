import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	PAL,
	PHI,
	TAU,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag,
	sub3,
	mul3,
	norm
} from './log/board.js';
import {
	NEAR,
	orbit,
	pxPerUnit,
	makeDepth,
	line3,
	circle3,
	axesOf,
	lit3,
	lerp3
} from './log/space.js';
import { glow, lit } from './log/ink.js';
import {
	loadRooms,
	roomOf,
	drawRoom,
	drawImageAt,
	mips,
	pick,
	PLATE,
	DECADES,
	LAYERS
} from './log/rooms.js';

// ── Sketch: log-appear — the rooms, from the geometry ────────────────────────
// More ink sketches of how the rooms might come out of the geometry itself.
// Every variant opens on a geometry in ink — chalk lines on the dark board —
// and ends on the landed room in colour, where log-fall lands (the plate
// centred a little low, 0.62 of the board tall), swaying on its depths, the
// monitor's glass lit: the ink first, the colour last. The room is rooms.js's
// — its six layers and their CHALK copies, the artwork's ink lifted off it —
// and where a geometry holds many rooms they are many draws of ONE image, the
// chalk room composited flat once at start and drawn through its mips. No
// lecture notes. ?decade=50s|60s|90s|10s picks the room (90s). One per ?v=:
//
//   cell     (default) the period lattice Λ = ℤ + τℤ in ink over the board:
//            its two families of lines, its points as chalk nodes. Its
//            fundamental cell — the parallelogram 0, 1, τ, 1 + τ — is the
//            room: the chalk room sheared to fit it (the affine map of the
//            plate onto the cell, one drawImage under a transform), and every
//            translate of the cell holds the same room — ℂ/Λ has one cell;
//            the plane shows its copies. The lens zooms into the cell at the
//            origin while τ moves in the upper half-plane from 0.34 + 0.66i
//            to i/φ, where the cell is a golden rectangle, the plate's own
//            shape, so the room arrives unsheared and upright. Exact: the
//            lattice, the cell, the affine fit. A picture: the path of τ
//            (any path in ℍ is a path of lattices; this one ends on the plate).
//   fold     the torus of rooms, ℂ/Λ with Λ = 2φℤ + 2iℤ (the plate's own
//            periods — the tiling of log-passage's torus seen flat, one room
//            at every lattice point, in chalk), folded by x ↦ −x. On the flat
//            picture the involution is the HALF-TURN about the origin,
//            z ↦ −z — not a reflection, though on each line through 0 it is
//            one — and its fixed points on the torus are the 2-torsion,
//            ½Λ/Λ: the room's centre, the midpoints of its two edge-pairs and
//            its corner, lit gold (every half-lattice point, in the cover).
//            The quotient is taken as the picture turns: the tiling swings
//            about 0 through π and lands on itself, each room on its partner
//            at −z, upside down (the room at 0 on itself), the lit points on
//            lit points — the only points that meet themselves — and the two
//            copies fuse: one room is kept, in colour. Exact: the involution,
//            the 2-torsion, the pairing. Not drawn: the quotient surface
//            itself, the pillowcase, ℙ¹ with four cone points.
//   nodes    the Kummer surface's sixteen nodes are sixteen rooms. The
//            surface is a real Kummer quartic, (x² + y² + z² − μ²)² = λ pqrs
//            with p = 1 − z − √2x, q = 1 − z + √2x, r = 1 + z + √2y,
//            s = 1 + z − √2y, λ = (3μ² − 1)/(3 − μ²), μ = 1.3 (w = 1). Its
//            sixteen nodes are found numerically in make() — Newton on
//            ∇F = 0 from a grid of seeds, kept where F = 0 too, deduped:
//            twelve on the sphere |x| = μ and four at |x| = 0.598 — and the
//            planes through six of them, counted at start, are its sixteen
//            tropes, the (16₆) configuration. The surface is drawn as its
//            sections by the planes z = const (marching squares, chained),
//            clipped to the ball |x| < 2.05, hidden lines faint and
//            dashed by a depth buffer of the surface (marching tetrahedra); a
//            tiny chalk room faces the lens at each node (one image, sixteen
//            draws through small mips); the lens turns round the surface,
//            then flies into one node, the room there growing to the plate,
//            colour, land. Exact: the surface, the nodes, the tropes. A
//            picture: the rooms as billboards.
//   etching  the net's lines bend into the room's lines. The log map's net —
//            rings and rays about a point under the room's floor — in ink,
//            with the room's chalk copy drawn in the SAME coordinates: the
//            room's plate is a rectangle in w, the picture is f_s(w) =
//            (e^{sw} − 1)/s, which is e^w − 1 at s = 1 (the rings its images
//            of Re w = const, the rays of Im w = const) and w itself at s = 0
//            — a smooth family of conformal maps from the exponential to the
//            identity. The net unrolls as s runs from 1 to 0 while the chalk
//            room comes up under the same warp (the drawing in cells, each
//            under its affine map), so the net's rings straighten into the
//            room's floor and ceiling and its rays into the walls: the room's
//            frame IS four of the net's lines (rings ±3, rays ±4). Then
//            colour, land. Exact: the family of maps, the net as its image.
//            A picture: the room as the thing drawn in w.
//   trope    a conic in ink is the monitor's glass. The same Kummer surface;
//            one of its tropes, the plane p = 0, touches the surface along a
//            conic — the surface meets p = 0 in (x² + y² + z² − μ²)² = 0, the
//            sphere's circle in that plane, DOUBLED: radius √(μ² − ⅓) about
//            the plane's foot (√2, 0, 1)/3 — through six of the nodes, lit.
//            The conic in gold; the lens swings round to face the plane (the
//            circle an ellipse on screen) and closes; the surface's ink fades,
//            the ellipse stays and contracts onto the place the glass will be,
//            the oval inscribed in the monitor's glass, the chalk room coming
//            up round it; colour, land, the glass lit. Exact: the trope, its
//            conic, its six nodes. A picture: the contraction from the
//            projected conic to the glass's oval (one polyline morphed into
//            the other).
//
// Eleven seconds each, a pure function of progress: ?at= pins any frame.

const SECONDS = 11;

let BOARD = null;

export default async function make({ at }) {
	const v = variant(['cell', 'fold', 'nodes', 'etching', 'trope']);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	BOARD = b;
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, `log-appear · ${v} · loading the room`);
	const t0 = performance.now();
	const art = await loadRooms({ decades: [decade], chalk: true });
	const loadMs = Math.round(performance.now() - t0);
	const t1 = performance.now();
	// The chalk room, flat: one image, drawn wherever the geometry has a room.
	const S = { art, decade, ink: mips(flatInk(art, decade, 1280)) };
	const PREP = { nodes: kummerPrep, trope: kummerPrep };
	const geo = PREP[v] ? PREP[v]() : {};
	const prepMs = Math.round(performance.now() - t1);
	const DRAW = { cell, fold, nodes, etching, trope };
	const info = {
		seconds: SECONDS,
		variant: v,
		decade,
		loadMs,
		prepMs,
		missing: art.missing,
		...(geo.info ?? {})
	};
	let frames = 0;
	let ms = 0;

	function render() {
		const t = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		DRAW[v](ctx, w, h, S, geo, time.u, time.t);
		tag(ctx, w, h, `log-appear · ${v}`);
		ms += performance.now() - t;
		if (++frames === 30) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs;
			frames = 0;
			ms = 0;
		}
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The landing ──────────────────────────────────────────────────────────────
// Where log-fall lands: the plate centred a little low, 0.62 of the board
// tall at most. V = { cx, cy, s }: the plate's centre on screen and px per
// plate unit (the plate is 2φ × 2).
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: 0.535 * h, s: height / 2 };
}

// The landing sway, log-fall's: px of slide per unit of depth (the wall
// slides the whole of it, the bed a sixth), `amp` 0..1 of the full sway.
function sway(s, secs, amp) {
	const A = 0.116 * s * amp;
	return [A * Math.sin(1.1 * secs - 0.4), -0.45 * A * Math.sin(1.7 * secs + 0.6)];
}

// Progress → distance along a path, 0..1: at rest, gathering pace, easing to
// land — the speed goes as (c + x)^p (1 − x)² (log-fall's ease), tabled.
function paceOf(p = 3, c = 0.2, n = 512) {
	const T = [0];
	let acc = 0;
	for (let i = 1; i <= n; i++) {
		const x = (i - 0.5) / n;
		acc += Math.pow(c + x, p) * (1 - x) * (1 - x);
		T.push(acc);
	}
	return (x) => {
		const f = clamp01(x) * n;
		const i = Math.min(n - 1, Math.floor(f));
		return lerp(T[i], T[i + 1], f - i) / acc;
	};
}
const PACE = paceOf(3, 0.2);

const rectPts = (G) => {
	const x0 = G.cx - G.w / 2;
	const y0 = G.cy - G.h / 2;
	return [
		[x0, y0],
		[x0 + G.w, y0],
		[x0 + G.w, y0 + G.h],
		[x0, y0 + G.h],
		[x0, y0]
	];
};

// ── The room ─────────────────────────────────────────────────────────────────
// The chalk room flat: every layer's chalk copy composited into one canvas
// `px` wide — the one image the geometries draw their many rooms from.
function flatInk(art, decade, px) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / PHI);
	const x = c.getContext('2d');
	drawRoom(x, art, decade, { cx: c.width / 2, cy: c.height / 2, height: c.height, chalk: true });
	return c;
}

// The board painted into the monitor's glass (cut out of the drawing), so
// the wall never shows through it: the place the answer is written.
function boardIn(ctx, G, a) {
	if (a <= 0.002) return;
	ctx.save();
	ctx.globalAlpha *= a;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(G.cx - G.w / 2 - 0.5, G.cy - G.h / 2 - 0.5, G.w + 1, G.h + 1);
	if (BOARD?.dust) {
		ctx.fillStyle = BOARD.dust;
		ctx.fillRect(G.cx - G.w / 2 - 0.5, G.cy - G.h / 2 - 0.5, G.w + 1, G.h + 1);
	}
	ctx.restore();
}

// rooms.js's drawRoom with what a swaying room needs: the plate at V, each
// layer slid by `par` [px, py] times its depth, the wall (exactly the frame's
// height) mirrored into the gap its slide opens, the board in the glass
// before the screen goes over it; `chalk` the ink copies; `alpha` one number
// or per layer. Returns the glass on screen, { cx, cy, w, h }.
function paintRoom(ctx, S, V, { par = [0, 0], alpha = 1, chalk = false, layers = null } = {}) {
	const R = roomOf(S.decade, S.art);
	const s = V.s;
	const hw = (PLATE.W / 2) * s;
	const hh = (PLATE.H / 2) * s;
	ctx.save();
	ctx.beginPath();
	ctx.rect(V.cx - hw, V.cy - hh, 2 * hw, 2 * hh);
	ctx.clip();
	let G = null;
	for (const cfg of LAYERS) {
		const k = cfg.key;
		if (layers && !layers.includes(k)) continue;
		const L = R.lay[k];
		const a = S.art[S.decade]?.[k];
		if (!L || !a) continue;
		const al = typeof alpha === 'number' ? alpha : (alpha[k] ?? 0);
		if (al <= 0.002) continue;
		const ox = par[0] * L.depth;
		const oy = par[1] * L.depth;
		const px = V.cx + s * L.x + ox;
		const py = V.cy - s * L.y + oy;
		const W = L.w * s;
		const H = L.h * s;
		if (k === 'screen' && R.glass) {
			G = {
				cx: V.cx + s * R.glass.x + ox,
				cy: V.cy - s * R.glass.y + oy,
				w: R.glass.w * s,
				h: R.glass.h * s
			};
			if (!chalk) boardIn(ctx, G, al);
		}
		const src = chalk ? (a.chalk ?? a.mips) : a.mips;
		drawImageAt(ctx, src, px, py, W, H, { alpha: al });
		if (k === 'bg' && Math.abs(oy) > 0.5) {
			const tj = -Math.sign(oy);
			ctx.save();
			ctx.translate(px, py + tj * H);
			ctx.scale(1, -1);
			drawImageAt(ctx, src, 0, 0, W, H, { alpha: al });
			ctx.restore();
		}
	}
	ctx.restore();
	return G;
}

// The glass lit: a warm light in it, and a thin gold rim.
function lightGlass(ctx, G, k) {
	if (!G || k <= 0.004) return;
	ctx.save();
	ctx.beginPath();
	ctx.rect(G.cx - G.w / 2, G.cy - G.h / 2, G.w, G.h);
	ctx.clip();
	glow(ctx, G.cx, G.cy, 0.7 * Math.min(G.w, G.h), [255, 220, 150], 0.34 * k);
	ctx.restore();
	stroke(ctx, rectPts(G), { color: PAL.gold, width: 1.4, alpha: 0.45 * k });
}

// The flood of colour: each layer's window within [t0, t0 + len], the bed
// first, the wall last (log-genesis's order).
const FLOOD = { bed: 0, desk: 0.12, screen: 0.24, clock: 0.36, poster: 0.44, bg: 0.56 };
function flood(u, t0, len) {
	const colour = {};
	const chalk = {};
	for (const k in FLOOD) {
		const a = t0 + FLOOD[k] * len;
		colour[k] = smooth(span(u, a, a + 0.44 * len));
		chalk[k] = 1 - colour[k];
	}
	return { colour, chalk };
}

// The landed room at V: its ink filling to colour from `fill` over `len`,
// the sway taking hold from `swayAt`, the glass lit from `litAt`.
function landed(ctx, S, V, u, secs, { fill, len = 0.12, swayAt, litAt, alpha = 1 }) {
	if (alpha <= 0.003) return null;
	const f = flood(u, fill, len);
	const par = sway(V.s, secs, smooth(span(u, swayAt, swayAt + 0.12)));
	let G = null;
	for (const cfg of LAYERS) {
		const k = cfg.key;
		if (f.chalk[k] > 0.002) {
			const g = paintRoom(ctx, S, V, { par, layers: [k], alpha: f.chalk[k] * alpha, chalk: true });
			if (g) G = g;
		}
		if (f.colour[k] > 0.002) {
			const g = paintRoom(ctx, S, V, { par, layers: [k], alpha: f.colour[k] * alpha });
			if (g) G = g;
		}
	}
	lightGlass(ctx, G, smooth(span(u, litAt, litAt + 0.08)) * alpha);
	return G;
}

// A drawing (a mip chain) on a curved patch: cut into nx × ny cells, each
// drawn under the affine map fitting its corners' screen positions and
// clipped to them (pushed out a little, so the cells close without
// hairlines). `at(u, v)` → [sx, sy] for a point of the drawing (u right, v
// down, 0..1). `px` the drawing's span on screen, to pick the mip.
function warpImage(ctx, m, at, nx, ny, px, alpha = 1) {
	if (alpha <= 0.002) return;
	const dpr = BOARD?.dpr ?? 1;
	const img = pick(m, Math.max(48, px * dpr));
	const iw = img.width;
	const ih = img.height;
	const G = [];
	for (let j = 0; j <= ny; j++) {
		const row = [];
		for (let i = 0; i <= nx; i++) row.push(at(i / nx, j / ny));
		G.push(row);
	}
	const vw = ctx.canvas.width / dpr;
	const vh = ctx.canvas.height / dpr;
	const push = alpha > 0.95 ? 0.7 : 0;
	ctx.save();
	ctx.globalAlpha = alpha;
	for (let j = 0; j < ny; j++)
		for (let i = 0; i < nx; i++) {
			const a = G[j][i];
			const b = G[j][i + 1];
			const c = G[j + 1][i];
			const d = G[j + 1][i + 1];
			if (
				Math.max(a[0], b[0], c[0], d[0]) < -2 ||
				Math.min(a[0], b[0], c[0], d[0]) > vw + 2 ||
				Math.max(a[1], b[1], c[1], d[1]) < -2 ||
				Math.min(a[1], b[1], c[1], d[1]) > vh + 2
			)
				continue;
			const cx = (a[0] + b[0] + c[0] + d[0]) / 4;
			const cy = (a[1] + b[1] + c[1] + d[1]) / 4;
			const ex = [(b[0] - a[0] + d[0] - c[0]) / 2, (b[1] - a[1] + d[1] - c[1]) / 2];
			const ey = [(c[0] - a[0] + d[0] - b[0]) / 2, (c[1] - a[1] + d[1] - b[1]) / 2];
			ctx.save();
			ctx.beginPath();
			[a, b, d, c].forEach(([x, y], k) => {
				const l = Math.hypot(x - cx, y - cy) || 1;
				const qx = x + ((x - cx) / l) * push;
				const qy = y + ((y - cy) / l) * push;
				if (k) ctx.lineTo(qx, qy);
				else ctx.moveTo(qx, qy);
			});
			ctx.closePath();
			ctx.clip();
			ctx.setTransform(
				dpr * ex[0],
				dpr * ex[1],
				dpr * ey[0],
				dpr * ey[1],
				dpr * (cx - ex[0] / 2 - ey[0] / 2),
				dpr * (cy - ex[1] / 2 - ey[1] / 2)
			);
			const cw = iw / nx;
			const ch = ih / ny;
			const x0 = Math.max(0, (i / nx) * iw - 2);
			const y0 = Math.max(0, (j / ny) * ih - 2);
			const x1 = Math.min(iw, ((i + 1) / nx) * iw + 2);
			const y1 = Math.min(ih, ((j + 1) / ny) * ih + 2);
			const u0 = ((i / nx) * iw - x0) / cw;
			const v0 = ((j / ny) * ih - y0) / ch;
			ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0, -u0, -v0, (x1 - x0) / cw, (y1 - y0) / ch);
			ctx.restore();
		}
	ctx.restore();
}

// ── cell: the fundamental cell is the room ───────────────────────────────────
const CELL = {
	tau0: [0.34, 0.66], // τ at the start, in ℍ
	tau1: [0, 1 / PHI], // τ at the end: the cell a golden rectangle
	rows: 7.5, // the cell starts this many times smaller than the plate
	write: [0, 0.12],
	rooms: [0.08, 0.22],
	zoom: [0.14, 0.9],
	unshear: [0.46, 0.85],
	hand: 0.85, // the sheared image handed to the room's layers
	fill: 0.86,
	swayAt: 0.9,
	litAt: 0.94
};

function cell(ctx, w, h, S, geo, u, secs) {
	const V = landing(w, h);
	const dpr = BOARD?.dpr ?? 1;
	const z = smooth(span(u, ...CELL.unshear));
	const tau = [lerp(CELL.tau0[0], CELL.tau1[0], z), lerp(CELL.tau0[1], CELL.tau1[1], z)];
	const K1 = (2 * V.s) / CELL.tau1[1]; // px per lattice unit at the landing
	const K0 = K1 / CELL.rows;
	const K = K0 * Math.exp(Math.log(K1 / K0) * PACE(span(u, ...CELL.zoom)));
	const c = [(1 + tau[0]) / 2, tau[1] / 2]; // the cell's centre, on the landing's
	const to = (p) => [V.cx + K * (p[0] - c[0]), V.cy - K * (p[1] - c[1])];
	const from = ([sx, sy]) => [c[0] + (sx - V.cx) / K, c[1] - (sy - V.cy) / K];
	// (s, t) with p = s + tτ, for the range of lines and cells the screen sees.
	const st = (p) => {
		const t = p[1] / tau[1];
		return [p[0] - t * tau[0], t];
	};
	const corners = [
		[0, 0],
		[w, 0],
		[0, h],
		[w, h]
	].map((q) => st(from(q)));
	const s0 = Math.floor(Math.min(...corners.map((q) => q[0]))) - 1;
	const s1 = Math.ceil(Math.max(...corners.map((q) => q[0]))) + 1;
	const t0 = Math.floor(Math.min(...corners.map((q) => q[1]))) - 1;
	const t1 = Math.ceil(Math.max(...corners.map((q) => q[1]))) + 1;
	const out = 1 - smooth(span(u, 0.86, 0.97)); // everything but the room, gone
	const hand = u >= CELL.hand;

	// The lattice: its lines, nearest the origin first, and its points.
	const wr = span(u, ...CELL.write);
	if (wr > 0 && out > 0) {
		for (let n = t0; n <= t1; n++) {
			const p = smooth(span(wr, 0.03 * Math.abs(n), 0.5 + 0.03 * Math.abs(n)));
			if (p <= 0) continue;
			stroke(ctx, [to([s0 + n * tau[0], n * tau[1]]), to([s1 + n * tau[0], n * tau[1]])], {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.55 * out * p
			});
		}
		for (let m = s0; m <= s1; m++) {
			const p = smooth(span(wr, 0.03 * Math.abs(m), 0.5 + 0.03 * Math.abs(m)));
			if (p <= 0) continue;
			stroke(ctx, [to([m + t0 * tau[0], t0 * tau[1]]), to([m + t1 * tau[0], t1 * tau[1]])], {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.55 * out * p
			});
		}
		const r = Math.min(3.2, Math.max(1.2, K * 0.012));
		for (let n = t0; n <= t1; n++)
			for (let m = s0; m <= s1; m++) {
				const p = smooth(span(wr, 0.03 * (Math.abs(m) + Math.abs(n)), 0.6));
				if (p <= 0) continue;
				const [x, y] = to([m + n * tau[0], n * tau[1]]);
				if (x < -8 || x > w + 8 || y < -8 || y > h + 8) continue;
				disc(ctx, x, y, r, { fill: PAL.node, alpha: 0.85 * out * p });
			}
	}

	// The rooms: one image, sheared into every cell.
	const ra = smooth(span(u, ...CELL.rooms));
	if (ra > 0) {
		const img = pick(S.ink, K * dpr);
		const iw = img.width;
		const ih = img.height;
		const reach = K * (1 + Math.abs(tau[0]) + tau[1]);
		for (let n = t0; n <= t1; n++)
			for (let m = s0; m <= s1; m++) {
				const own = m === 0 && n === 0;
				if (own && hand) continue;
				const al = ra * (own ? 1 : out);
				if (al <= 0.003) continue;
				const O = [m + n * tau[0], n * tau[1]];
				const [cx, cy] = to([O[0] + c[0], O[1] + c[1]]);
				if (cx < -reach || cx > w + reach || cy < -reach || cy > h + reach) continue;
				const [ex, ey] = to([O[0] + tau[0], O[1] + tau[1]]);
				ctx.save();
				ctx.globalAlpha = al;
				ctx.transform(K / iw, 0, (-K * tau[0]) / ih, (K * tau[1]) / ih, ex, ey);
				ctx.drawImage(img, 0, 0, iw, ih);
				ctx.restore();
			}
	}

	// The lit point: the cell the lens picks.
	const lp = span(u, 0.22, 0.3) * (1 - smooth(span(u, 0.5, 0.64)));
	if (lp > 0) lit(ctx, V.cx, V.cy, 5, lp);

	// The room: the sheared image handed to its layers, filling to colour.
	if (hand)
		landed(ctx, S, { cx: V.cx, cy: V.cy, s: (K * tau[1]) / 2 }, u, secs, {
			fill: CELL.fill,
			swayAt: CELL.swayAt,
			litAt: CELL.litAt
		});
}

// ── fold: the torus of rooms, folded by x ↦ −x ───────────────────────────────
const FOLD = {
	k0: 0.42, // the room starts this fraction of the plate
	write: [0, 0.1],
	rooms: [0.04, 0.18],
	torsion: [0.14, 0.26],
	turn: [0.3, 0.66],
	fuse: [0.66, 0.8],
	others: [0.72, 0.88],
	zoom: [0.58, 0.9],
	hand: 0.84,
	fill: 0.86,
	swayAt: 0.9,
	litAt: 0.94
};

function fold(ctx, w, h, S, geo, u, secs) {
	const V = landing(w, h);
	const K = V.s * FOLD.k0 * Math.exp(Math.log(1 / FOLD.k0) * PACE(span(u, ...FOLD.zoom)));
	const W = PLATE.W;
	const H = PLATE.H;
	const to = (x, y) => [V.cx + K * x, V.cy - K * y];
	const th = Math.PI * smooth(span(u, ...FOLD.turn));
	const wr = span(u, ...FOLD.write);
	const ra = smooth(span(u, ...FOLD.rooms));
	const on = smooth(span(u, FOLD.turn[0], FOLD.turn[0] + 0.04)); // the moving copy on
	const fuse = smooth(span(u, ...FOLD.fuse)); // and gone
	const oth = 1 - smooth(span(u, ...FOLD.others)); // the translates gone
	const hand = u >= FOLD.hand;
	const R = Math.ceil(Math.hypot(w, h) / 2 / (K * H)) + 1;

	// A copy of the tiling, turned by θ about 0: the rooms and the cell edges.
	const tiling = (alpha, theta, edges) => {
		if (alpha <= 0.003) return;
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		const rt = (x, y) => [x * c - y * s, x * s + y * c];
		if (edges > 0) {
			const L = (R + 1) * Math.max(W, H);
			for (let k = -R; k <= R + 1; k++) {
				const p = smooth(span(edges, 0.05 * Math.abs(k), 0.5 + 0.05 * Math.abs(k)));
				if (p <= 0) continue;
				const x = (k - 0.5) * W;
				const y = (k - 0.5) * H;
				stroke(ctx, [to(...rt(x, -L)), to(...rt(x, L))], {
					color: PAL.chalk,
					width: 1.2,
					alpha: 0.5 * alpha * oth * p
				});
				stroke(ctx, [to(...rt(-L, y)), to(...rt(L, y))], {
					color: PAL.chalk,
					width: 1.2,
					alpha: 0.5 * alpha * oth * p
				});
			}
		}
		if (ra <= 0) return;
		for (let n = -R; n <= R; n++)
			for (let m = -R; m <= R; m++) {
				const own = m === 0 && n === 0;
				if (own && hand && theta === 0) continue;
				const a = alpha * ra * (own ? 1 : oth);
				if (a <= 0.003) continue;
				const [x, y] = rt(m * W, n * H);
				const [sx, sy] = to(x, y);
				if (sx < -K * W || sx > w + K * W || sy < -K * H || sy > h + K * H) continue;
				drawImageAt(ctx, S.ink, sx, sy, K * W, K * H, { alpha: a, rot: theta });
			}
	};
	// The 2-torsion: every half-lattice point, the four of the cell at 0 bold
	// (`four` draws only those: the copy carries them round).
	const torsion = (alpha, theta, swell, four = false) => {
		if (alpha <= 0.003) return;
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		const M = four ? 1 : 2 * R;
		for (let n = four ? 0 : -M; n <= M; n++)
			for (let m = four ? 0 : -M; m <= M; m++) {
				const x0 = (m * W) / 2;
				const y0 = (n * H) / 2;
				const [sx, sy] = to(x0 * c - y0 * s, x0 * s + y0 * c);
				if (sx < -8 || sx > w + 8 || sy < -8 || sy > h + 8) continue;
				const bold = (m === 0 || m === 1) && (n === 0 || n === 1);
				const r = (bold ? 4 : 2) * (1 + 1.6 * swell);
				lit(ctx, sx, sy, r, alpha * (bold ? 1 : 0.3 * oth));
			}
	};

	// The static tiling, dimmed while the turned copy is over it.
	const dim = 1 - 0.75 * on * (1 - fuse);
	tiling(dim, 0, wr);
	// The copy, turning through π and landing on it: x ↦ −x.
	if (th > 0 || on > 0) tiling(0.85 * on * (1 - fuse), th, 0);
	// The fixed points: lit where they are, and carried round on the copy.
	const tor = smooth(span(u, ...FOLD.torsion)) * (1 - smooth(span(u, 0.8, 0.9)));
	const beat = u >= FOLD.fuse[0] ? Math.exp(-Math.pow((u - FOLD.fuse[0]) / 0.03, 2)) : 0;
	torsion(tor, 0, beat);
	if (on > 0 && fuse < 1 && th > 0.001) torsion(tor * on * (1 - fuse), th, 0, true);

	// The room that is kept: filling to colour.
	if (hand)
		landed(ctx, S, { cx: V.cx, cy: V.cy, s: K }, u, secs, {
			fill: FOLD.fill,
			swayAt: FOLD.swayAt,
			litAt: FOLD.litAt
		});
}

// ── The Kummer surface ───────────────────────────────────────────────────────
// (x² + y² + z² − μ²)² − λ p q r s = 0, w = 1: the tetrahedral Kummer quartic.
const KUM = {
	mu: 1.3,
	R: 2.05, // clipped to this ball
	mesh: 34, // the depth buffer's grid, per axis
	slice: 72, // the sections' grid, per axis
	zSlices: 24
};
const MU2 = KUM.mu * KUM.mu;
const LAM = (3 * MU2 - 1) / (3 - MU2);
const S2 = Math.SQRT2;
function kummerF(x, y, z) {
	const q = x * x + y * y + z * z - MU2;
	const p = 1 - z - S2 * x;
	const qq = 1 - z + S2 * x;
	const r = 1 + z + S2 * y;
	const s = 1 + z - S2 * y;
	return q * q - LAM * p * qq * r * s;
}

// The nodes: Newton on ∇F = 0 (differences for the gradient and the Hessian)
// from a grid of seeds, kept where F = 0 as well, deduped.
function findNodes() {
	const h = 1e-4;
	const grad = (x, y, z) => [
		(kummerF(x + h, y, z) - kummerF(x - h, y, z)) / (2 * h),
		(kummerF(x, y + h, z) - kummerF(x, y - h, z)) / (2 * h),
		(kummerF(x, y, z + h) - kummerF(x, y, z - h)) / (2 * h)
	];
	const d = 1e-3;
	const det3 = (m) =>
		m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
		m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
		m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
	const out = [];
	for (let i = -4; i <= 4; i++)
		for (let j = -4; j <= 4; j++)
			for (let k = -4; k <= 4; k++) {
				let p = [i * 0.4, j * 0.4, k * 0.4];
				let ok = false;
				for (let it = 0; it < 40; it++) {
					const g = grad(...p);
					if (Math.hypot(...g) < 1e-9) {
						ok = true;
						break;
					}
					const gx = grad(p[0] + d, p[1], p[2]);
					const gy = grad(p[0], p[1] + d, p[2]);
					const gz = grad(p[0], p[1], p[2] + d);
					const H = [0, 1, 2].map((r) => [
						(gx[r] - g[r]) / d,
						(gy[r] - g[r]) / d,
						(gz[r] - g[r]) / d
					]);
					const D = det3(H);
					if (Math.abs(D) < 1e-12) break;
					const col = (c) => H.map((row, r) => row.map((v, cc) => (cc === c ? g[r] : v)));
					const step = [det3(col(0)) / D, det3(col(1)) / D, det3(col(2)) / D];
					const sc = Math.min(1, 0.5 / (Math.hypot(...step) || 1));
					p = [p[0] - step[0] * sc, p[1] - step[1] * sc, p[2] - step[2] * sc];
					if (Math.hypot(...p) > 6) break;
				}
				if (!ok || Math.abs(kummerF(...p)) > 1e-7) continue;
				if (!out.some((n) => Math.hypot(n[0] - p[0], n[1] - p[1], n[2] - p[2]) < 1e-4)) out.push(p);
			}
	return out;
}

// The tropes: the planes through six of the nodes, counted (the (16₆)).
function countTropes(nodes) {
	const planes = [];
	const N = nodes.length;
	for (let a = 0; a < N; a++)
		for (let b = a + 1; b < N; b++)
			for (let c = b + 1; c < N; c++) {
				const n = norm(cross3(sub3(nodes[b], nodes[a]), sub3(nodes[c], nodes[a])));
				if (!Number.isFinite(n[0]) || Math.hypot(...n) < 0.5) continue;
				const d = n[0] * nodes[a][0] + n[1] * nodes[a][1] + n[2] * nodes[a][2];
				let on = 0;
				for (const P of nodes)
					if (Math.abs(n[0] * P[0] + n[1] * P[1] + n[2] * P[2] - d) < 1e-5) on++;
				if (on !== 6) continue;
				if (
					!planes.some(
						(q) =>
							Math.abs(Math.abs(q.n[0] * n[0] + q.n[1] * n[1] + q.n[2] * n[2]) - 1) < 1e-6 &&
							Math.abs(Math.abs(q.d) - Math.abs(d)) < 1e-5
					)
				)
					planes.push({ n, d });
			}
	return planes.length;
}
const cross3 = (a, b) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0]
];

// A section of the surface by a plane: marching squares on an N × N grid
// over the disc, segments chained into polylines of 3D points. `place(a, b)`
// puts the plane's (a, b) in space.
const MS = [
	[],
	[[3, 0]],
	[[0, 1]],
	[[3, 1]],
	[[1, 2]],
	[
		[3, 0],
		[1, 2]
	],
	[[0, 2]],
	[[3, 2]],
	[[2, 3]],
	[[0, 2]],
	[
		[0, 1],
		[2, 3]
	],
	[[1, 2]],
	[[1, 3]],
	[[0, 1]],
	[[3, 0]],
	[]
];
function section(place, N, R) {
	const F = new Float32Array(N * N);
	const IN = new Uint8Array(N * N);
	const at = (i) => -R + (2 * R * i) / (N - 1);
	for (let j = 0; j < N; j++)
		for (let i = 0; i < N; i++) {
			const P = place(at(i), at(j));
			F[j * N + i] = kummerF(...P);
			IN[j * N + i] = P[0] * P[0] + P[1] * P[1] + P[2] * P[2] < R * R ? 1 : 0;
		}
	// A point on an edge: key → [a, b]; segments as pairs of keys.
	const pts = new Map();
	const segs = [];
	const key = (i, j, dir) => (i * N + j) * 2 + dir; // dir 0 horizontal (i, j)-(i+1, j), 1 vertical
	const edgePt = (i, j, e) => {
		// e: 0 bottom, 1 right, 2 top, 3 left of cell (i, j)
		let k;
		let p0;
		let p1;
		if (e === 0) {
			k = key(i, j, 0);
			p0 = [i, j];
			p1 = [i + 1, j];
		} else if (e === 1) {
			k = key(i + 1, j, 1);
			p0 = [i + 1, j];
			p1 = [i + 1, j + 1];
		} else if (e === 2) {
			k = key(i, j + 1, 0);
			p0 = [i, j + 1];
			p1 = [i + 1, j + 1];
		} else {
			k = key(i, j, 1);
			p0 = [i, j];
			p1 = [i, j + 1];
		}
		if (!pts.has(k)) {
			const f0 = F[p0[1] * N + p0[0]];
			const f1 = F[p1[1] * N + p1[0]];
			const t = f0 === f1 ? 0.5 : clamp01(f0 / (f0 - f1));
			pts.set(k, [lerp(at(p0[0]), at(p1[0]), t), lerp(at(p0[1]), at(p1[1]), t)]);
		}
		return k;
	};
	for (let j = 0; j < N - 1; j++)
		for (let i = 0; i < N - 1; i++) {
			const k0 = j * N + i;
			if (!(IN[k0] && IN[k0 + 1] && IN[k0 + N] && IN[k0 + N + 1])) continue;
			const idx =
				(F[k0] < 0 ? 1 : 0) |
				(F[k0 + 1] < 0 ? 2 : 0) |
				(F[k0 + N + 1] < 0 ? 4 : 0) |
				(F[k0 + N] < 0 ? 8 : 0);
			for (const [ea, eb] of MS[idx]) segs.push([edgePt(i, j, ea), edgePt(i, j, eb)]);
		}
	// Chain the segments by their shared edge points.
	const adj = new Map();
	segs.forEach(([a, b], s) => {
		if (!adj.has(a)) adj.set(a, []);
		if (!adj.has(b)) adj.set(b, []);
		adj.get(a).push(s);
		adj.get(b).push(s);
	});
	const used = new Uint8Array(segs.length);
	const lines = [];
	const walk = (start, from) => {
		const out = [];
		let k = from;
		let s = start;
		for (;;) {
			used[s] = 1;
			const [a, b] = segs[s];
			k = a === k ? b : a;
			out.push(k);
			const next = adj.get(k).find((t) => !used[t]);
			if (next === undefined) break;
			s = next;
		}
		return out;
	};
	for (let s = 0; s < segs.length; s++) {
		if (used[s]) continue;
		const [a] = segs[s];
		const fwd = walk(s, a);
		// and back the other way from a, if it goes on
		const back = [];
		let k = a;
		for (;;) {
			const next = adj.get(k).find((t) => !used[t]);
			if (next === undefined) break;
			used[next] = 1;
			const [p, q] = segs[next];
			k = p === k ? q : p;
			back.push(k);
		}
		const keys = [...back.reverse(), a, ...fwd];
		if (keys.length < 3) continue;
		lines.push(keys.map((kk) => place(...pts.get(kk))));
	}
	return lines;
}

// The surface as triangles for the depth buffer: marching tetrahedra on an
// N³ grid, six tetrahedra to a cube about its main diagonal, kept inside the
// ball. Returns a flat array of triangles (nine numbers each).
function surfaceMesh(N, R) {
	const at = (i) => -R + (2 * R * i) / (N - 1);
	const F = new Float32Array(N * N * N);
	const IN = new Uint8Array(N * N * N);
	for (let k = 0; k < N; k++)
		for (let j = 0; j < N; j++)
			for (let i = 0; i < N; i++) {
				const x = at(i);
				const y = at(j);
				const z = at(k);
				const id = (k * N + j) * N + i;
				F[id] = kummerF(x, y, z);
				IN[id] = x * x + y * y + z * z < R * R ? 1 : 0;
			}
	const tris = [];
	const C = [
		[0, 0, 0],
		[1, 0, 0],
		[1, 1, 0],
		[0, 1, 0],
		[0, 0, 1],
		[1, 0, 1],
		[1, 1, 1],
		[0, 1, 1]
	];
	const TETS = [
		[0, 1, 2, 6],
		[0, 2, 3, 6],
		[0, 3, 7, 6],
		[0, 7, 4, 6],
		[0, 4, 5, 6],
		[0, 5, 1, 6]
	];
	const P = new Array(8);
	const V = new Float64Array(8);
	const mid = (a, b) => {
		const t = V[a] === V[b] ? 0.5 : V[a] / (V[a] - V[b]);
		return [lerp(P[a][0], P[b][0], t), lerp(P[a][1], P[b][1], t), lerp(P[a][2], P[b][2], t)];
	};
	const push = (a, b, c) => tris.push(...a, ...b, ...c);
	for (let k = 0; k < N - 1; k++)
		for (let j = 0; j < N - 1; j++)
			for (let i = 0; i < N - 1; i++) {
				let inside = true;
				for (let c = 0; c < 8 && inside; c++) {
					const id = ((k + C[c][2]) * N + (j + C[c][1])) * N + (i + C[c][0]);
					if (!IN[id]) inside = false;
					V[c] = F[id];
					P[c] = [at(i + C[c][0]), at(j + C[c][1]), at(k + C[c][2])];
				}
				if (!inside) continue;
				for (const T of TETS) {
					const neg = T.filter((c) => V[c] < 0);
					const pos = T.filter((c) => V[c] >= 0);
					if (neg.length === 0 || pos.length === 0) continue;
					if (neg.length === 1 || pos.length === 1) {
						const [a] = neg.length === 1 ? neg : pos;
						const o = neg.length === 1 ? pos : neg;
						push(mid(a, o[0]), mid(a, o[1]), mid(a, o[2]));
					} else {
						const [a, b] = neg;
						const [c, d] = pos;
						const ac = mid(a, c);
						const ad = mid(a, d);
						const bd = mid(b, d);
						const bc = mid(b, c);
						push(ac, ad, bd);
						push(ac, bd, bc);
					}
				}
			}
	return new Float32Array(tris);
}

function kummerPrep() {
	const nodes = findNodes();
	const tropes = countTropes(nodes);
	const slices = [];
	const R = KUM.R;
	for (let k = 0; k < KUM.zSlices; k++) {
		const z = -R * 0.92 + (2 * R * 0.92 * k) / (KUM.zSlices - 1);
		slices.push(...section((a, b) => [a, b, z], KUM.slice, R));
	}
	// The sections written on plane by plane, a sweep across the surface.
	slices.sort((A, B) => A[0][2] - B[0][2]);
	const mesh = surfaceMesh(KUM.mesh, R);
	// The trope p = 0: its normal, its foot, the circle's radius, its nodes.
	const n = norm([S2, 0, 1]);
	const d = 1 / Math.sqrt(3);
	const [e1, e2] = axesOf(n);
	const trope = {
		n,
		foot: mul3(n, d),
		rho: Math.sqrt(MU2 - d * d),
		e1,
		e2,
		nodes: nodes.filter((P) => Math.abs(1 - P[2] - S2 * P[0]) < 1e-5)
	};
	// The node the lens flies into: the highest, on the +y side.
	let star = nodes[0];
	for (const P of nodes) if (P[2] + 0.1 * P[1] > star[2] + 0.1 * star[1]) star = P;
	let slicePts = 0;
	for (const L of slices) slicePts += L.length;
	return {
		nodes,
		slices,
		mesh,
		trope,
		star,
		Z: makeDepth(4),
		info: {
			nodes: nodes.length,
			tropes,
			onTrope: trope.nodes.length,
			tris: mesh.length / 9,
			slices: slices.length,
			slicePts
		}
	};
}
const mean = (L, c) => L.reduce((s, p) => s + p[c], 0) / L.length;

// The surface drawn: its depth buffer first, then its sections, hidden runs
// faint and dashed; `upto` writes them on from the bottom up.
function drawKummer(ctx, cam, geo, w, h, { alpha = 1, ref = 1, upto = 1 }) {
	if (alpha <= 0.004) {
		geo.Z.off();
		return;
	}
	const Z = geo.Z;
	Z.reset(w, h);
	const T = geo.mesh;
	for (let i = 0; i < T.length; i += 9)
		Z.tri(
			cam.project([T[i], T[i + 1], T[i + 2]]),
			cam.project([T[i + 3], T[i + 4], T[i + 5]]),
			cam.project([T[i + 6], T[i + 7], T[i + 8]])
		);
	const n = geo.slices.length;
	for (let k = 0; k < n; k++) {
		const a = alpha * smooth(span(upto, (0.7 * k) / n, (0.7 * k) / n + 0.3));
		if (a <= 0.004) continue;
		line3(
			ctx,
			cam,
			geo.slices[k],
			{ color: PAL.chalk, width: 1.25, alpha: 0.85 * a, ref, hid: 0.22 },
			{ depth: Z }
		);
	}
}

// ── nodes: sixteen nodes, sixteen rooms ──────────────────────────────────────
const NODES = {
	fov: 40,
	roomH: 0.42, // a room's height at a node, world units
	d0: 6.6,
	az: [0.35, 1.1], // az = a + b u²
	el: [0.42, 0.6],
	dive: [0.42, 0.9],
	aim: [0.44, 0.8],
	surfOut: [0.62, 0.8],
	othersOut: [0.54, 0.72],
	hand: 0.84,
	fill: 0.86,
	swayAt: 0.9,
	litAt: 0.94
};

function nodes(ctx, w, h, S, geo, u, secs) {
	const V = landing(w, h);
	const ppu = pxPerUnit(h, NODES.fov);
	const dEnd = (ppu * NODES.roomH) / (2 * V.s);
	const star = geo.star;
	const dv = PACE(span(u, ...NODES.dive));
	const dist = NODES.d0 * Math.exp(Math.log(dEnd / NODES.d0) * dv);
	const target = lerp3([0, 0, 0], star, smooth(span(u, ...NODES.aim)));
	const az = NODES.az[0] + NODES.az[1] * u * u;
	const el = lerp(NODES.el[0], NODES.el[1], smooth(span(u, 0.5, 0.86)));
	const hand = u >= NODES.hand;
	ctx.save();
	ctx.translate(0, V.cy - h / 2); // the target on the landing's centre
	const cam = orbit(w, h, { target, az, el, dist, fov: NODES.fov });
	const surfA = (1 - smooth(span(u, ...NODES.surfOut))) * smooth(span(u, 0, 0.06));
	drawKummer(ctx, cam, geo, w, h, { alpha: surfA, ref: dist, upto: span(u, 0, 0.16) });
	// The nodes lit, a room at each, facing the lens.
	const othersA = 1 - smooth(span(u, ...NODES.othersOut));
	const roomsA = smooth(span(u, 0.12, 0.26));
	const litA = span(u, 0.08, 0.2);
	for (const P of geo.nodes) {
		const own = P === star;
		const q = cam.project(P);
		if (q[2] <= NEAR) continue;
		const hid = geo.Z.on && geo.Z.hidden(q);
		const hp = (NODES.roomH * ppu) / q[2];
		const a = (own ? 1 : othersA) * roomsA * (hid ? 0.3 : 1);
		if (!(own && hand) && a > 0.003 && hp > 2) {
			drawImageAt(ctx, S.ink, q[0], q[1], hp * PHI, hp, { alpha: 0.95 * a });
			// a small drawing's thin ink, doubled, so it reads
			if (hp < 180)
				drawImageAt(ctx, S.ink, q[0], q[1], hp * PHI, hp, { alpha: 0.6 * a * (1 - hp / 180) });
		}
		const grow = own ? 1 + 0.8 * smooth(span(u, 0.36, 0.46)) : 1;
		const la = own ? litA * (1 - smooth(span(u, 0.66, 0.78))) : litA * othersA * (hid ? 0.4 : 1);
		lit3(ctx, cam, P, 2.6 * grow, la);
	}
	ctx.restore();
	// The room at the node, grown to the plate: filling to colour.
	if (hand)
		landed(ctx, S, { cx: V.cx, cy: V.cy, s: (NODES.roomH * ppu) / dist / 2 }, u, secs, {
			fill: NODES.fill,
			swayAt: NODES.swayAt,
			litAt: NODES.litAt
		});
}

// ── etching: the net's lines bend into the room's ────────────────────────────
// w = a(y + ix) for a point (x, y) of the plate, so Re w runs up the room and
// Im w across it; the picture is f_s(w), drawn with Re up and Im right.
const ETCH = {
	rays: 25, // rays round the circle; the walls are rays ±4
	k0: 0.55, // the plate starts this fraction of the landing
	unroll: [0.1, 0.8],
	zoom: [0.1, 0.86],
	write: [0, 0.1],
	netOut: [0.5, 0.78],
	room: [0.2, 0.5],
	cells: [24, 15],
	hand: 0.84,
	fill: 0.84,
	swayAt: 0.88,
	litAt: 0.93
};
ETCH.dT = TAU / ETCH.rays;
ETCH.a = (4 * ETCH.dT) / PHI; // the walls, x = ±φ, on rays ±4
ETCH.dR = ETCH.a / 3; // the floor and ceiling, y = ±1, on rings ±3

// f_s(w) = (e^{sw} − 1)/s, and w + s w²/2 for s ≈ 0.
function fs(w, s) {
	if (s < 1e-3) return [w[0] + (s * (w[0] * w[0] - w[1] * w[1])) / 2, w[1] + s * w[0] * w[1]];
	const r = Math.exp(s * w[0]);
	return [(r * Math.cos(s * w[1]) - 1) / s, (r * Math.sin(s * w[1])) / s];
}

function etching(ctx, w, h, S, geo, u, secs) {
	const V = landing(w, h);
	const a = ETCH.a;
	const s = 1 - PACE(span(u, ...ETCH.unroll));
	const Kp = V.s * ETCH.k0 * Math.exp(Math.log(1 / ETCH.k0) * PACE(span(u, ...ETCH.zoom)));
	const scr = (P) => [V.cx + (Kp * P[1]) / a, V.cy - (Kp * P[0]) / a];
	const at = (x, y) => scr(fs([a * y, a * x], s));
	const hand = u >= ETCH.hand;

	// The net: rings Re w = k·dR, rays Im w = j·dT, under f_s.
	const netA = span(u, ...ETCH.write) * (1 - smooth(span(u, ...ETCH.netOut)));
	if (netA > 0) {
		for (let k = -10; k <= 6; k++) {
			const pts = [];
			for (let i = 0; i <= 120; i++)
				pts.push(scr(fs([k * ETCH.dR, -Math.PI + (TAU * i) / 120], s)));
			const frame = Math.abs(k) === 3;
			stroke(ctx, pts, {
				color: PAL.chalk,
				width: frame ? 1.6 : 1.1,
				alpha: netA * (Math.abs(k) <= 3 ? 0.7 : 0.42)
			});
		}
		const J = (ETCH.rays - 1) / 2;
		for (let j = -J; j <= J; j++) {
			const pts = [];
			for (let i = 0; i <= 40; i++) pts.push(scr(fs([-2.2 + (3.6 * i) / 40, j * ETCH.dT], s)));
			const frame = Math.abs(j) === 4;
			stroke(ctx, pts, {
				color: PAL.chalk,
				width: frame ? 1.6 : 1.1,
				alpha: netA * (Math.abs(j) <= 4 ? 0.7 : 0.42)
			});
		}
	}

	// The room's ink, in the same coordinates.
	const ra = smooth(span(u, ...ETCH.room));
	if (ra > 0 && !hand) {
		if (s > 1e-4)
			warpImage(
				ctx,
				S.ink,
				(uu, vv) => at((uu - 0.5) * PLATE.W, (0.5 - vv) * PLATE.H),
				ETCH.cells[0],
				ETCH.cells[1],
				Kp * PLATE.W,
				ra
			);
		else drawImageAt(ctx, S.ink, V.cx, V.cy, Kp * PLATE.W, Kp * PLATE.H, { alpha: ra });
	}
	if (hand)
		landed(ctx, S, { cx: V.cx, cy: V.cy, s: Kp }, u, secs, {
			fill: ETCH.fill,
			swayAt: ETCH.swayAt,
			litAt: ETCH.litAt
		});
}

// ── trope: a conic is the glass ──────────────────────────────────────────────
const TROPE = {
	fov: 40,
	d0: 8,
	d1: 7.2,
	swing: [0.3, 0.76],
	aim: [0.3, 0.72],
	conic: [0.12, 0.3],
	surfOut: [0.6, 0.78],
	morph: [0.76, 0.9],
	room: [0.78, 0.9],
	fill: 0.9,
	len: 0.1,
	swayAt: 0.92,
	litAt: 0.94,
	ringOut: [0.93, 0.99],
	n: 96
};

function trope(ctx, w, h, S, geo, u, secs) {
	const V = landing(w, h);
	const R = roomOf(S.decade, S.art);
	const T = geo.trope;
	// The glass at the landing, slid by the sway once it has hold.
	const amp = smooth(span(u, TROPE.swayAt, TROPE.swayAt + 0.12));
	const par = sway(V.s, secs, amp);
	const gd = LAYERS.find((l) => l.key === 'screen').depth;
	const G0 = {
		cx: V.cx + V.s * R.glass.x + par[0] * gd,
		cy: V.cy - V.s * R.glass.y + par[1] * gd,
		w: R.glass.w * V.s,
		h: R.glass.h * V.s
	};
	// The lens: round to face the plane (its normal's direction), closing.
	const azN = Math.atan2(T.n[0], T.n[2]);
	const sw = PACE(span(u, ...TROPE.swing));
	const az = lerp(azN - 1.3, azN + 0.06, sw);
	const el = lerp(0.5, 0.16, sw);
	const dist = lerp(TROPE.d0, TROPE.d1, sw);
	const target = lerp3([0, 0, 0], T.foot, smooth(span(u, ...TROPE.aim)));
	const shift = smooth(span(u, 0.3, 0.74));
	const sx = (G0.cx - w / 2) * shift;
	const sy = (G0.cy - h / 2) * shift;
	ctx.save();
	ctx.translate(sx, sy);
	const cam = orbit(w, h, { target, az, el, dist, fov: TROPE.fov });
	const surfA = (1 - smooth(span(u, ...TROPE.surfOut))) * smooth(span(u, 0, 0.06));
	drawKummer(ctx, cam, geo, w, h, { alpha: surfA, ref: dist, upto: span(u, 0, 0.16) });
	// The nodes: chalk, the six on the trope lit as its conic is written.
	const cw = span(u, ...TROPE.conic);
	for (const P of geo.nodes) {
		const q = cam.project(P);
		if (q[2] <= NEAR) continue;
		const hid = geo.Z.on && geo.Z.hidden(q);
		if (T.nodes.includes(P))
			lit3(ctx, cam, P, 3, smooth(span(cw, 0.3, 1)) * surfA * (hid ? 0.5 : 1));
		else disc(ctx, q[0], q[1], 2.2, { fill: PAL.node, alpha: 0.8 * surfA * (hid ? 0.35 : 1) });
	}
	// The conic: the circle in the plane, gold, written on round it.
	const n = TROPE.n;
	const circ = circle3(T.foot, T.e1, T.e2, T.rho, n);
	const m = smooth(span(u, ...TROPE.morph));
	// Cut by the surface while it is there; whole as it goes.
	const written = cw < 1 ? (p, i) => (i / n < cw ? 1 : 0) : null;
	const gold = { color: PAL.gold, width: 2.2, glow: 5, ref: dist, hid: 0.3 };
	if (m <= 0) {
		if (surfA > 0)
			line3(ctx, cam, circ, { ...gold, alpha: 0.95 * cw * surfA }, { depth: geo.Z, fade: written });
		if (surfA < 1)
			line3(ctx, cam, circ, { ...gold, alpha: 0.95 * cw * (1 - surfA) }, { fade: written });
	}
	ctx.restore();

	// The room coming up round the glass, and the conic contracting onto it.
	const ra = smooth(span(u, ...TROPE.room));
	landed(ctx, S, V, u, secs, {
		fill: TROPE.fill,
		len: TROPE.len,
		swayAt: TROPE.swayAt,
		litAt: TROPE.litAt,
		alpha: ra
	});
	if (m > 0) {
		const Q = circ.map((p) => {
			const q = cam.project(p);
			return [q[0] + sx, q[1] + sy];
		});
		const c = [mean(Q, 0), mean(Q, 1)];
		const A = 0.485 * G0.w;
		const B = 0.485 * G0.h;
		// The oval's parametrisation turned and flipped to fit the conic's.
		let best = null;
		for (const dir of [1, -1])
			for (let k = 0; k < 48; k++) {
				const th0 = (TAU * k) / 48;
				let e = 0;
				for (let i = 0; i < n; i += 4) {
					const th = (dir * TAU * i) / n + th0;
					e +=
						Math.pow(Q[i][0] - c[0] - A * Math.cos(th), 2) +
						Math.pow(Q[i][1] - c[1] - B * Math.sin(th), 2);
				}
				if (!best || e < best.e) best = { e, dir, th0 };
			}
		const ring = 1 - smooth(span(u, ...TROPE.ringOut));
		const pts = Q.map((q, i) => {
			const th = (best.dir * TAU * i) / n + best.th0;
			return [lerp(q[0], G0.cx + A * Math.cos(th), m), lerp(q[1], G0.cy + B * Math.sin(th), m)];
		});
		stroke(ctx, pts, { color: PAL.gold, width: 2.2, alpha: 0.95 * ring, glow: 5 });
	}
}
