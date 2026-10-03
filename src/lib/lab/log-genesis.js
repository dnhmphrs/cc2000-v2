import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	bloom,
	math,
	makeView,
	PAL,
	PHI,
	TAU,
	GOLDEN_ANGLE,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag
} from './log/board.js';
import { glow, lecture } from './log/ink.js';
import { loadRooms, roomOf, pick, mips, PLATE, DECADES, DECADE_NAME, LAYERS } from './log/rooms.js';
import { drawSperm } from './log/sperm.js';
import { rectToDisc, invert } from './log/genesis-sn.js';

// ── Sketch: log-genesis — the room generated from the dot, five more ways ───
// The lead's favourite of round two was log-arrival's assemble: "how it
// generated the room from the dot, that was super neat". This sketch is five
// more generations, each out of a different piece of the board's own maths.
// Every variant opens on exactly what the turn leaves — a lit dot, a gold
// disc with a cream core a third of the board across, at the board's centre —
// and ends where log-arrival and log-fall end: the decade's room
// (?decade=50s|60s|90s|10s, 90s by default) in its chalk-framed plate, the
// decade under it, swaying on its depths (drawRoom's parallax), the monitor's
// glass faintly lit where the answer goes. One per ?v=:
//
//   seeds     (default) Vogel's sunflower. The dot draws in to the place the
//             glass will be and seeds pour out of it: the k-th born at angle
//             k · 137.5° (the golden angle, so no two ever line up), pushed
//             out as it ages, r = c √(age) — Vogel's model of the seed head,
//             every seed owning the same share πc² of the disc. Each seed is
//             a disc coloured by the room's pixel under it (the flat room is
//             sampled once, into ImageData, at load). The head grows out to
//             the plate's far corner while c shrinks, so there are more seeds
//             and smaller — the room comes up in rising resolution, a few
//             coloured blobs, then a halftone, then (several thousand seeds)
//             the picture — and the seeds dissolve into the true image. The
//             frame is chalked in as the head first reaches it; N is counted
//             at the plate's corner.
//   squares   the plate is a golden rectangle, and a golden rectangle is its
//             whirling squares: cut the largest square off and a golden
//             rectangle is left, a quarter turn round, and so on in to the
//             POLE — the fixed point of that quarter-turn-and-shrink,
//             p = 1/(1 + i/φ) of the half-height from the centre. The dot
//             draws in to p, and the squares grow out of it, smallest first,
//             each sweeping out from the side it shares with the ones before
//             and revealing its part of the room, its gold quarter-arc
//             written on with it (the Fibonacci spiral) — eleven squares,
//             sides 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, which tile the
//             144 × 89 rectangle, golden to five figures (144/89 = 1.61798).
//   lamp      darkness, and the dot is a light: the 90s room's red desk lamp
//             has a bulb and the dot goes to it (the other decades' to the
//             monitor's glass). The room is lit by the inverse-square law
//             from there, I = min(1, r₀²/r²): fully lit to the radius r₀,
//             falling off as 1/r² beyond, and r₀ grows from nothing to the
//             far corner, so the corners come last. The near layers — the
//             screen, the desk, the bed — cast faint shadows on what is
//             behind them, their silhouettes thrown out from the light by
//             their depth. Then full light, and the sway.
//   conformal the room grows out of the dot by a conformal map. Jacobi's sn
//             takes the plate's rectangle onto a half plane and a Cayley map
//             takes that onto the unit disc: G(z) = i (sn z − i/√k)/(sn z +
//             i/√k), with the modulus k chosen so the rectangle's aspect
//             2K/K′ is φ (log/genesis-sn.js). Then z ↦ G⁻¹(s · G(z)) squeezes
//             the whole room conformally into the region |G| < s: a tiny disc
//             round the centre for small s, a squircle — the level curves of
//             the rectangle's Green's function — as s grows, the plate at
//             s = 1. The room is drawn through a 21 × 13 mesh of cells, each
//             under the affine map fitting its corners; the mesh's images
//             for 64 values of s are solved at load by Newton on G, and a
//             frame interpolates two. The plate's coordinate net — cyan
//             columns, pink rows — rides the map and bends with it.
//   ink       the swimmer writes the room. The golden-spiral swimmer swims
//             out of the dot along an Archimedean spiral r = bθ, gathering
//             pace as the turns lengthen, and its tail is a pen: the room's
//             ink — the chalk copy rooms.js lifts off the artwork, joined
//             with the artwork's edges, so a room drawn without outlines
//             (the 2010s) still has lines — appears along its path, a brush
//             as wide as a turn's pitch, four turns to the corners. Then the
//             colour floods in layer by layer, bed to wall (the wall last,
//             so the ink stays on the board), as the swimmer swims on into
//             the monitor's glass, which lights as it goes in. The sperm
//             draws the room it was conceived in.
//
// The motion in each gathers pace and eases to land; the sway builds as the
// room does. The landed room is drawRoomAt, log-arrival's copy of rooms.js's
// drawRoom with the wall tiled past the frame and the board in the glass.
// Ten seconds, a pure function of progress: ?at= pins any frame.

const SECONDS = 10;
const DEPTH_OF = Object.fromEntries(LAYERS.map((l) => [l.key, l.depth]));

let BOARD = null;

export default async function make({ at }) {
	const v = variant(['seeds', 'squares', 'lamp', 'conformal', 'ink']);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	BOARD = b;
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, `log-genesis · ${v} · ${decade} · loading the room`);
	const t0 = performance.now();
	const art = await loadRooms({ decades: [decade], chalk: v === 'ink' });
	const loadMs = Math.round(performance.now() - t0);
	const t1 = performance.now();
	const prep = PREP[v] ? PREP[v](art, decade) : {};
	const prepMs = Math.round(performance.now() - t1);
	const info = { seconds: SECONDS, variant: v, decade, loadMs, prepMs, missing: art.missing };
	const DRAW = { seeds, squares, lamp, conformal, ink };

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		DRAW[v](ctx, w, h, art, decade, time.u, time.t, prep);
		tag(ctx, w, h, `log-genesis · ${v} · ${decade}`);
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

const PREP = {
	seeds: seedsPrep,
	squares: () => ({ whirl: whirl() }),
	lamp: lampPrep,
	conformal: conformalPrep,
	ink: inkPrep
};

// ── The landing (log-arrival's) ──────────────────────────────────────────────
// Where log-fall lands: the plate centred a little low, 0.62 of the board
// tall at most. V = { cx, cy, s, rot }: the plate's centre on screen, px per
// plate unit (the plate is 2φ × 2) and its turn.
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: 0.535 * h, s: height / 2, rot: 0 };
}

// The landing sway: px of slide per unit of depth, `amp` 0..1 of the full sway.
function sway(V, secs, amp) {
	const A = 0.116 * V.s * amp;
	return [A * Math.sin(1.1 * secs - 0.4), -0.45 * A * Math.sin(1.7 * secs + 0.6)];
}

// Plate units (x right, y up) → screen, through V.
function toScreen(V, x, y) {
	const c = Math.cos(V.rot ?? 0);
	const s = Math.sin(V.rot ?? 0);
	return [V.cx + V.s * (c * x - s * y), V.cy - V.s * (s * x + c * y)];
}

function rectQuad(cx, cy, w, h, rot = 0) {
	const c = Math.cos(rot);
	const s = Math.sin(rot);
	return [
		[-w / 2, -h / 2],
		[w / 2, -h / 2],
		[w / 2, h / 2],
		[-w / 2, h / 2]
	].map(([x, y]) => [cx + c * x - s * y, cy - (s * x + c * y)]);
}
const plateQuad = (V) => rectQuad(V.cx, V.cy, PLATE.W * V.s, PLATE.H * V.s, V.rot ?? 0);
function pathQuad(ctx, P, fresh = true) {
	if (fresh) ctx.beginPath();
	ctx.moveTo(P[0][0], P[0][1]);
	for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
	ctx.closePath();
}
const closed = (P) => [...P, P[0]];
const circleAt = (x, y, r, n = 160) => {
	const out = [];
	for (let i = 0; i <= n; i++)
		out.push([x + r * Math.cos((TAU * i) / n), y + r * Math.sin((TAU * i) / n)]);
	return out;
};
// A ring of light: gold, haloed by wide faint strokes of itself.
function goldRing(ctx, x, y, r, a) {
	if (a <= 0.005 || r <= 0) return;
	const P = circleAt(x, y, r);
	stroke(ctx, P, { color: PAL.gold, width: 12, alpha: 0.12 * a });
	stroke(ctx, P, { color: PAL.gold, width: 5, alpha: 0.22 * a });
	stroke(ctx, P, { color: PAL.gold, width: 2.4, alpha: a });
}
const settle = (t) => {
	const x = clamp01(t);
	return x * x * x * (x * (6 * x - 15) + 10);
};
// Progress → a pull at one pace in log-distance: its speed goes as
// (c + x)^p (1 − x)², so it gathers pace and lands (log-fall's easeOf).
function easeOf(p, c, n = 512) {
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
const pullEase = easeOf(2, 0.35);

// ── The room ─────────────────────────────────────────────────────────────────
function blit(ctx, m, cx, cy, w, h, rot = 0, alpha = 1, fx = false, fy = false, soft = 1) {
	if (alpha <= 0.002 || w < 0.5 || h < 0.5) return;
	const T = ctx.getTransform();
	const src = pick(m, Math.abs(w) * soft * (Math.hypot(T.a, T.b) || 1));
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.translate(cx, cy);
	if (rot) ctx.rotate(-rot);
	if (fx || fy) ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
	ctx.drawImage(src, -w / 2, -h / 2, w, h);
	ctx.restore();
}

// The board painted into the monitor's glass, so the wall never shows
// through it: the place the answer is written.
function glassBoard(ctx, G, a = 1, fill = PAL.ground) {
	if (a <= 0.002) return;
	ctx.save();
	ctx.globalAlpha *= a;
	pathQuad(ctx, rectQuad(G.cx, G.cy, G.w + 1, G.h + 1, G.rot));
	ctx.fillStyle = fill;
	ctx.fill();
	if (fill === PAL.ground && BOARD?.dust) {
		ctx.fillStyle = BOARD.dust;
		ctx.fill();
	}
	ctx.restore();
}

// rooms.js's drawRoom with what a swaying room needs (log-arrival's): the
// wall mirror-tiled past the frame on the side its slide opens, the board in
// the glass, `glass(G, a)` to light it, `chalk` for the ink copies. `par`
// [px, py] the slide per unit of depth; `alpha` one number or per layer.
function drawRoomAt(ctx, art, decade, V, o = {}) {
	const {
		par = [0, 0],
		alpha = 1,
		layers = null,
		clip = true,
		glass = null,
		glassFill = PAL.ground,
		chalk = false,
		soft = 1
	} = o;
	const R = roomOf(decade, art);
	const rot = V.rot ?? 0;
	const c = Math.cos(rot);
	const sn = Math.sin(rot);
	ctx.save();
	if (clip) {
		pathQuad(ctx, plateQuad(V));
		ctx.clip();
	}
	let G = null;
	for (const cfg of LAYERS) {
		const key = cfg.key;
		if (layers && !layers.includes(key)) continue;
		const L = R.lay[key];
		const a = art[decade]?.[key];
		if (!L || !a) continue;
		const al = typeof alpha === 'number' ? alpha : (alpha[key] ?? 0);
		if (al <= 0.002) continue;
		const ox = par[0] * L.depth;
		const oy = par[1] * L.depth;
		if (key === 'screen' && R.glass) {
			const [gx, gy] = toScreen(V, R.glass.x, R.glass.y);
			G = { cx: gx + ox, cy: gy + oy, w: R.glass.w * V.s, h: R.glass.h * V.s, rot };
			if (!chalk) glassBoard(ctx, G, al, glassFill);
			if (glass) glass(G, al);
		}
		const tiles = [[0, 0]];
		if (key === 'bg' && clip) {
			const xp = c * ox - sn * oy;
			const yp = -sn * ox - c * oy;
			const ti = Math.abs(xp) > 0.5 ? -Math.sign(xp) : 0;
			const tj = Math.abs(yp) > 0.5 ? -Math.sign(yp) : 0;
			if (ti) tiles.push([ti, 0]);
			if (tj) tiles.push([0, tj]);
			if (ti && tj) tiles.push([ti, tj]);
		}
		const src = chalk ? (a.ink ?? a.chalk ?? a.mips) : a.mips;
		for (const [i, j] of tiles) {
			const [px, py] = toScreen(V, L.x + i * L.w, L.y + j * L.h);
			blit(ctx, src, px + ox, py + oy, L.w * V.s, L.h * V.s, rot, al, i !== 0, j !== 0, soft);
		}
	}
	ctx.restore();
	return G;
}

// The room flat, every layer composited into one canvas `px` wide — the
// glass board-dark, or lit (`lit`) as the light the seeds pour out of.
function flatRoom(art, decade, px, lit = false) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / PHI);
	const x = c.getContext('2d', { willReadFrequently: true });
	const V = { cx: c.width / 2, cy: c.height / 2, s: c.height / 2, rot: 0 };
	drawRoomAt(x, art, decade, V, {
		glass: lit ? (G) => litGlass(x, G, 0.3 * G.h, 1, 1, 1) : null
	});
	return c;
}

// The plate's chalk frame (written on with `frame`), and under it the decade
// at the left and the variant's last word at the right (`cap`).
function plateFrame(ctx, V, decade, { frame = 1, cap = 0, right = '', dash = null, a = 0.9 }) {
	if (frame > 0 && a > 0)
		stroke(ctx, closed(plateQuad(V)), {
			color: PAL.chalk,
			width: 1.8,
			alpha: a,
			upto: frame,
			dash
		});
	if (cap <= 0) return;
	const sz = Math.min(0.085 * V.s, 30);
	const [lx, ly] = toScreen(V, -PLATE.W / 2, -PLATE.H / 2 - 0.11);
	const [rx, ry] = toScreen(V, PLATE.W / 2, -PLATE.H / 2 - 0.11);
	math(ctx, DECADE_NAME[decade], lx, ly, { size: sz, alpha: 0.9, upto: cap });
	if (right)
		math(ctx, right, rx, ry, {
			size: Math.min(sz * 0.8, 24),
			alpha: 0.75 * cap,
			color: PAL.chalkDim,
			align: 'right'
		});
}

// The lecture, its letters haloed in board rather than set on a patch.
function notes(ctx, w, h, lines) {
	ctx.save();
	ctx.shadowColor = 'rgba(21, 21, 21, 0.95)';
	ctx.shadowBlur = 10;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.shadowBlur = 4;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.restore();
}

// Chalk with a board halo, anywhere on the room.
function label(ctx, s, x, y, o = {}) {
	if ((o.alpha ?? 1) <= 0.003) return;
	ctx.save();
	ctx.shadowColor = 'rgba(21, 21, 21, 0.95)';
	ctx.shadowBlur = 8;
	math(ctx, s, x, y, o);
	ctx.shadowBlur = 3;
	math(ctx, s, x, y, o);
	ctx.restore();
}

// ── The light ────────────────────────────────────────────────────────────────
// The lit dot as the turn leaves it: a gold disc a third of the board across,
// a cream core, a warm bloom. k = 0 that disc, k = 1 a lit point.
function opening(w, h, k) {
	const R = 0.42 * Math.min(w, h);
	return {
		r: 0.175 * h * Math.pow(0.011 / 0.175, k),
		halo: lerp(0.65 * R, 0.1 * h, k),
		core: lerp(0.58, 0.46, k)
	};
}
function light(ctx, x, y, { r, halo, core }, a = 1) {
	if (a <= 0 || r <= 0) return;
	bloom(ctx, x, y, halo, 'rgba(255, 222, 150, 0.55)', a);
	disc(ctx, x, y, r, { fill: PAL.gold, alpha: 0.95 * a });
	disc(ctx, x, y, r * core, { fill: '#fff6e0', alpha: a });
}

// The light spread over the monitor's glass: `m` 0..1 the morph from a disc
// of radius r0 to the glass itself; `k` the light, 1 full down to the faint
// warm glow that stays, where the answer goes (log-arrival's).
function litGlass(ctx, G, r0, m, k, a = 1) {
	if (a <= 0.002) return;
	const w = lerp(2 * r0, G.w, m);
	const hh = lerp(2 * r0, G.h, m);
	const on = smooth(clamp01(k));
	const sc = lerp(0.1, 1, on);
	const rad = lerp(r0, Math.min(G.w, G.h) * 0.06, m) * sc;
	const op = a * clamp01(on * 1.8);
	ctx.save();
	ctx.translate(G.cx, G.cy);
	ctx.rotate(-(G.rot ?? 0));
	const shape = (f) => {
		ctx.beginPath();
		ctx.roundRect((-w * sc * f) / 2, (-hh * sc * f) / 2, w * sc * f, hh * sc * f, rad * f);
	};
	if (op > 0.003) {
		ctx.globalAlpha = 0.95 * op;
		ctx.fillStyle = PAL.gold;
		shape(1);
		ctx.fill();
		ctx.globalAlpha = op;
		ctx.fillStyle = '#fff6e0';
		shape(lerp(0.58, 0.72, m));
		ctx.fill();
	}
	ctx.restore();
	const rest = a * m * (1 - 0.6 * on);
	if (rest > 0.005) {
		ctx.save();
		pathQuad(ctx, rectQuad(G.cx, G.cy, w, hh, G.rot ?? 0));
		ctx.clip();
		glow(ctx, G.cx, G.cy, 0.62 * Math.min(w, hh), [255, 220, 150], 0.34 * rest);
		ctx.restore();
		stroke(ctx, closed(rectQuad(G.cx, G.cy, w, hh, G.rot ?? 0)), {
			color: PAL.gold,
			width: 1.2,
			alpha: 0.38 * rest * (1 - on)
		});
	}
}

// The glass's resting glow, for the landed room: the light the answer is
// written in, `a` how far it has come up.
const restGlow = (ctx, a) => (G, al) => litGlass(ctx, G, 0.3 * G.h, 1, 0, a * al);

// The distance from a point on screen to the plate's nearest edge and
// farthest corner.
function reach(V, x, y) {
	const Q = plateQuad(V);
	const far = Math.max(...Q.map(([qx, qy]) => Math.hypot(qx - x, qy - y)));
	const near = Math.min(x - Q[0][0], Q[1][0] - x, y - Q[0][1], Q[2][1] - y);
	return { far, near };
}

// ── seeds ────────────────────────────────────────────────────────────────────
// Vogel's model: the k-th seed at angle k · 137.5°, pushed out as it ages,
// r = c √(T − k) with T the count so far — each seed owns πc² of the head.
// The head's radius R grows out to the plate's far corner while c shrinks,
// so N = (R/c)² seeds, more and smaller: rising resolution.
const SD = {
	c0: 34, // the first seed's c, px
	c1: 6, // the last's
	rho: 0.86, // a seed's radius in units of c (1.9c to a neighbour)
	max: 16000,
	pour: [0.04, 0.78],
	fade: [0.72, 0.86]
};

function seedsPrep(art, decade) {
	const c = flatRoom(art, decade, 512, true);
	const img = c.getContext('2d').getImageData(0, 0, c.width, c.height);
	const cs = new Float32Array(SD.max);
	const sn = new Float32Array(SD.max);
	for (let k = 0; k < SD.max; k++) {
		cs[k] = Math.cos(k * GOLDEN_ANGLE);
		sn[k] = Math.sin(k * GOLDEN_ANGLE);
	}
	return { W: c.width, H: c.height, data: img.data, cs, sn };
}

function seeds(ctx, w, h, art, decade, u, secs, prep) {
	const V = landing(w, h);
	const R = roomOf(decade, art);
	const par = sway(V, secs, smooth(span(u, 0.84, 1)));
	// The dot draws its light in and moves to the glass's place: the head's
	// centre, where the seeds pour from.
	const k0 = smooth(span(u, 0, 0.14));
	const gd = DEPTH_OF.screen;
	const [gx, gy] = toScreen(V, R.glass.x, R.glass.y);
	const P = [lerp(w / 2, gx + par[0] * gd, k0), lerp(h / 2, gy + par[1] * gd, k0)];
	const pt = opening(w, h, k0);
	const { far, near } = reach(V, gx, gy);
	const e = pullEase(span(u, ...SD.pour));
	const Rh = lerp(SD.c0, 1.02 * far, e);
	const c = SD.c0 * Math.pow(SD.c1 / SD.c0, e);
	const T = (Rh * Rh) / (c * c);
	const N = Math.min(Math.ceil(T), SD.max);
	const fade = smooth(span(u, ...SD.fade));
	const toGlass = smooth(span(u, 0.72, 0.82));
	const dim = 1 - smooth(span(u, 0.84, 0.98));

	// The true room under the seeds, from the moment they begin to dissolve.
	const real = smooth(span(u, 0.7, 0.76));
	if (real > 0)
		drawRoomAt(ctx, art, decade, V, {
			par,
			alpha: real,
			glass: (G, a) => litGlass(ctx, G, pt.r, toGlass, dim, a)
		});

	// The seeds: oldest (outermost) first, each coloured by the room under it.
	if (fade < 1 && N > 0) {
		const Q = plateQuad(V);
		const { W, H, data, cs, sn } = prep;
		const rho = SD.rho * c;
		const inv = 1 / V.s;
		ctx.save();
		pathQuad(ctx, Q);
		ctx.clip();
		ctx.globalAlpha = 1 - fade;
		for (let k = 0; k < N; k++) {
			const r = c * Math.sqrt(T - k);
			const x = P[0] + r * cs[k];
			const y = P[1] + r * sn[k];
			const px = (x - V.cx) * inv;
			const py = -(y - V.cy) * inv;
			if (px < -PHI || px > PHI || py < -1 || py > 1) continue;
			const ix = Math.min(W - 1, ((px + PHI) / (2 * PHI)) * W) | 0;
			const iy = Math.min(H - 1, ((1 - py) / 2) * H) | 0;
			const o = (iy * W + ix) * 4;
			ctx.fillStyle = `rgb(${data[o]},${data[o + 1]},${data[o + 2]})`;
			ctx.beginPath();
			ctx.arc(x, y, rho, 0, TAU);
			ctx.fill();
		}
		ctx.restore();
	}

	// The light: the lit point the seeds pour from, until it takes the
	// glass's shape with the true room.
	if (toGlass <= 0) light(ctx, P[0], P[1], pt, 1);
	else if (real < 1) light(ctx, P[0], P[1], pt, 1 - real);
	math(ctx, 'p', P[0] + 12, P[1] - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.28, 0.34)))
	});

	// N, counted at the plate's corner while the seeds are seeds.
	const sz = Math.min(0.068 * V.s, 18);
	const [rx, ry] = toScreen(V, PLATE.W / 2, PLATE.H / 2 + 0.1);
	if (N > 1)
		math(ctx, `N = ${N}`, rx, ry, {
			size: sz,
			alpha: 0.8 * (1 - fade) * span(u, 0.08, 0.14),
			color: PAL.chalkDim,
			align: 'right'
		});

	plateFrame(ctx, V, decade, {
		frame: span(Rh, near, near * 1.35),
		cap: span(u, 0.86, 0.94),
		right: `N = ${N}`
	});
	notes(ctx, w, h, [
		['θ_{k} = k · 137.5°,   r_{k} = c √(T − k)', span(u, 0.06, 0.18)],
		['N = (R / c)^{2} :  R out, c down, the room resolves', span(u, 0.36, 0.5)]
	]);
}

// ── squares ──────────────────────────────────────────────────────────────────
// The whirling squares of the golden rectangle, as the Fibonacci tiling of
// 144 × 89: cut 89 off the left, 55 off the bottom of what is left, 34 off
// the right, 21 off the top … in to the pole, the fixed point of the
// quarter-turn-and-shrink that takes the rectangle to its gnomon. Each
// square's quarter-arc is centred at the corner it shares with the next
// rectangle but not the next square, so the arcs join into one spiral.
const FIB = [89, 55, 34, 21, 13, 8, 5, 3, 2, 1, 1];
const SQ_SIDES = ['L', 'B', 'R', 'T'];
const SQ_CORNER = ['TR', 'TL', 'BL', 'BR'];
const SQ_OPP = { L: 'R', R: 'L', B: 'T', T: 'B' };

function whirl() {
	let x0 = 0;
	let x1 = 144;
	let y0 = 0;
	let y1 = 89;
	const out = [];
	FIB.forEach((a, i) => {
		const last = i === FIB.length - 1;
		const side = last ? SQ_OPP[SQ_SIDES[(i - 1) % 4]] : SQ_SIDES[i % 4];
		let rect;
		if (side === 'L') {
			rect = [x0, x0 + a, y0, y1];
			x0 += a;
		} else if (side === 'R') {
			rect = [x1 - a, x1, y0, y1];
			x1 -= a;
		} else if (side === 'B') {
			rect = [x0, x1, y0, y0 + a];
			y0 += a;
		} else {
			rect = [x0, x1, y1 - a, y1];
			y1 -= a;
		}
		const [sx0, sx1, sy0, sy1] = rect;
		const K = { TR: [sx1, sy1], TL: [sx0, sy1], BL: [sx0, sy0], BR: [sx1, sy0] };
		const cn = SQ_CORNER[i % 4];
		const c = K[cn];
		// The two corners adjacent to the centre; the junction J is the one
		// on the side shared with the squares inside (toward the pole).
		const adj = cn === 'TR' || cn === 'BL' ? [K.TL, K.BR] : [K.TR, K.BL];
		const onShared = ([x, y]) =>
			side === 'L' ? x === sx1 : side === 'R' ? x === sx0 : side === 'B' ? y === sy1 : y === sy0;
		const J = onShared(adj[0]) ? adj[0] : adj[1];
		const A = J === adj[0] ? adj[1] : adj[0];
		out.push({ a, side, rect, c, J, A });
	});
	return out;
}

// The sweep windows, inner square first: durations growing with the sides,
// each starting when the one before is 70% through, fitted to [t0, t1].
function sqWindows(t0, t1) {
	const D = [0.015, 0.015, 0.02, 0.025, 0.035, 0.045, 0.065, 0.085, 0.11, 0.14, 0.2];
	const raw = [];
	let t = 0;
	for (const d of D) {
		raw.push([t, t + d]);
		t += 0.7 * d;
	}
	const end = raw[raw.length - 1][1];
	return raw.map(([a, b]) => [t0 + ((t1 - t0) * a) / end, t0 + ((t1 - t0) * b) / end]);
}
const SQ_WIN = sqWindows(0.08, 0.82);
// The lecture's line, "1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89": where each
// number ends, in characters.
const SQ_ENDS = [1, 4, 7, 10, 13, 16, 20, 24, 28, 32, 36];

function squares(ctx, w, h, art, decade, u, secs, prep) {
	const V = landing(w, h);
	const par = sway(V, secs, smooth(span(u, 0.8, 1)));
	const SQ = prep.whirl;
	const n = SQ.length;
	const unit = PLATE.H / 89;
	const toPlate = (X, Y) => [(X - 72) * unit, (Y - 44.5) * unit];
	const at = (X, Y) => toScreen(V, ...toPlate(X, Y));
	// The pole: 1/(1 + i/φ) of the half-height from the centre, up and right
	// in this whirl.
	const pr = 1 / (1 + 1 / (PHI * PHI));
	const pole = at(72 + 44.5 * pr, 44.5 + (44.5 * pr) / PHI);
	const k0 = smooth(span(u, 0, 0.14));
	const P = [lerp(w / 2, pole[0], k0), lerp(h / 2, pole[1], k0)];
	const pt = opening(w, h, k0);
	const out = 1 - smooth(span(u, 0.86, 0.94));

	// Each square's sweep, inner first (j = 0 the innermost).
	const F = SQ.map((_, i) => smooth(span(u, ...SQ_WIN[n - 1 - i])));
	// The revealed part of square i: a rect in Fibonacci units.
	const shown = (i) => {
		const { rect, side, a } = SQ[i];
		const f = F[i];
		const [x0, x1, y0, y1] = rect;
		if (side === 'L') return [x1 - f * a, x1, y0, y1];
		if (side === 'R') return [x0, x0 + f * a, y0, y1];
		if (side === 'B') return [x0, x1, y1 - f * a, y1];
		return [x0, x1, y0, y0 + f * a];
	};
	const screenRect = ([x0, x1, y0, y1]) => {
		const [sx, sy] = at(x0, y1);
		const [ex, ey] = at(x1, y0);
		return [sx, sy, ex - sx, ey - sy];
	};

	// The light at the pole, under everything, buried as the squares cover it.
	const buried = 1 - smooth(span(u, 0.26, 0.42));
	light(ctx, P[0], P[1], pt, buried);

	// The room, clipped to the union of the revealed squares.
	const any = F.some((f) => f > 0);
	if (any) {
		ctx.save();
		ctx.beginPath();
		for (let i = 0; i < n; i++) {
			if (F[i] <= 0) continue;
			const [x, y, ww, hh] = screenRect(shown(i));
			if (ww > 0.01 && hh > 0.01) ctx.rect(x, y, ww, hh);
		}
		ctx.clip();
		drawRoomAt(ctx, art, decade, V, { par, glass: restGlow(ctx, span(u, 0.74, 0.9)) });
		ctx.restore();
	}

	// The construction: each square's edge in chalk, its gold quarter-arc
	// written on with the sweep (tip on the sweep's front), its number.
	for (let i = 0; i < n; i++) {
		const f = F[i];
		if (f <= 0) continue;
		const S = SQ[i];
		const [x, y, ww, hh] = screenRect(shown(i));
		stroke(
			ctx,
			[
				[x, y],
				[x + ww, y],
				[x + ww, y + hh],
				[x, y + hh],
				[x, y]
			],
			{ color: PAL.chalk, width: 1.3, alpha: 0.7 * out }
		);
		// The arc from J (the inner junction) to A, about c.
		const C = at(...S.c);
		const Jp = at(...S.J);
		const Ap = at(...S.A);
		const r = S.a * unit * V.s;
		const a0 = Math.atan2(Jp[1] - C[1], Jp[0] - C[0]);
		let a1 = Math.atan2(Ap[1] - C[1], Ap[0] - C[0]);
		let d = a1 - a0;
		while (d > Math.PI) d -= TAU;
		while (d < -Math.PI) d += TAU;
		const pts = [];
		const m = Math.max(6, Math.round(r / 6));
		for (let k = 0; k <= m; k++) {
			const t = a0 + (d * k) / m;
			pts.push([C[0] + r * Math.cos(t), C[1] + r * Math.sin(t)]);
		}
		stroke(ctx, pts, {
			color: PAL.gold,
			width: Math.min(3, 1.4 + r / 150),
			alpha: 0.95 * out,
			upto: (2 / Math.PI) * Math.asin(clamp01(f))
		});
		// Its number, once the square is big enough to hold it.
		const side = S.a * unit * V.s;
		if (side >= 40) {
			const [cx, cy] = at((S.rect[0] + S.rect[1]) / 2, (S.rect[2] + S.rect[3]) / 2);
			label(ctx, String(S.a), cx, cy, {
				size: Math.min(44, side * 0.36),
				align: 'center',
				alpha: 0.85 * out * smooth(span(f, 0.6, 1)),
				color: PAL.chalk
			});
		}
	}

	math(ctx, 'p', P[0] + 12, P[1] - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.26, 0.32)))
	});

	// The lecture's row of numbers, written as the squares come.
	let chars = 0;
	for (let j = 0; j < n; j++) chars += F[n - 1 - j] * (SQ_ENDS[j] - (j ? SQ_ENDS[j - 1] : 0));
	plateFrame(ctx, V, decade, {
		frame: smooth(span(u, 0.84, 0.92)),
		cap: span(u, 0.86, 0.94),
		right: '144 / 89 = 1.618…'
	});
	notes(ctx, w, h, [
		['1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89', chars / 36],
		['F_{n+1} / F_{n} → φ :  the squares whirl into the pole p', span(u, 0.3, 0.44)]
	]);
}

// ── lamp ─────────────────────────────────────────────────────────────────────
// The light at the 90s lamp's bulb (measured on its desk's artwork), or at
// the glass. I = min(1, r₀²/r²) from it: the room drawn whole, then the
// board laid over it at 1 − I, a radial gradient with its stops on the curve.
const LAMP = { '90s': { key: 'desk', fx: 0.344, fy: 0.122 } };
const SHADOW = { screen: 0.22, desk: 0.28, bed: 0.3 };

function lampPrep(art, decade) {
	const sil = {};
	for (const key of Object.keys(SHADOW)) {
		const a = art[decade]?.[key];
		if (!a) continue;
		const src = a.mips[Math.min(2, a.mips.length - 1)];
		const c = document.createElement('canvas');
		c.width = src.width;
		c.height = src.height;
		const x = c.getContext('2d');
		x.drawImage(src, 0, 0);
		x.globalCompositeOperation = 'source-in';
		x.fillStyle = '#000';
		x.fillRect(0, 0, c.width, c.height);
		sil[key] = c;
	}
	return { sil };
}

function lampPoint(R, decade) {
	const L = LAMP[decade];
	const l = L && R.lay[L.key];
	if (l)
		return { x: l.x + (L.fx - 0.5) * l.w, y: l.y + (0.5 - L.fy) * l.h, depth: l.depth, bulb: 1 };
	return { x: R.glass.x, y: R.glass.y, depth: DEPTH_OF.screen, bulb: 0 };
}

function lamp(ctx, w, h, art, decade, u, secs, prep) {
	const V = landing(w, h);
	const R = roomOf(decade, art);
	const par = sway(V, secs, smooth(span(u, 0.5, 0.95)));
	const Lp = lampPoint(R, decade);
	const [lx, ly] = toScreen(V, Lp.x, Lp.y);
	const k0 = smooth(span(u, 0, 0.14));
	const P = [lerp(w / 2, lx + par[0] * Lp.depth, k0), lerp(h / 2, ly + par[1] * Lp.depth, k0)];
	const pt = opening(w, h, k0);
	const { far, near } = reach(V, lx, ly);
	const e = pullEase(span(u, 0.1, 0.84));
	const r0 = far * Math.pow(0.012, 1 - e);
	const shade = span(u, 0.1, 0.2) * (1 - smooth(span(u, 0.86, 0.96)));
	const toGlass = Lp.bulb ? 0 : smooth(span(u, 0.74, 0.86));
	const dim = 1 - smooth(span(u, 0.86, 0.98));

	// The room, layer by layer, the near layers' shadows thrown behind them.
	const Q = plateQuad(V);
	for (const cfg of LAYERS) {
		const key = cfg.key;
		const L = R.lay[key];
		const sil = prep.sil[key];
		if (sil && L && shade > 0) {
			const sg = 1 + 0.07 * (1 - L.depth);
			const [cx, cy] = toScreen(V, L.x, L.y);
			const x = P[0] + (cx + par[0] * L.depth - P[0]) * sg;
			const y = P[1] + (cy + par[1] * L.depth - P[1]) * sg;
			const W = L.w * V.s * sg;
			const H = L.h * V.s * sg;
			ctx.save();
			pathQuad(ctx, Q);
			ctx.clip();
			ctx.globalAlpha = SHADOW[key] * shade;
			ctx.drawImage(sil, x - W / 2, y - H / 2, W, H);
			ctx.restore();
		}
		drawRoomAt(ctx, art, decade, V, {
			par,
			layers: [key],
			glass: Lp.bulb
				? restGlow(ctx, span(u, 0.7, 0.9))
				: (G, a) => toGlass > 0 && litGlass(ctx, G, pt.r, toGlass, dim, a)
		});
	}

	// The dark: the board over the room at 1 − I, I = min(1, r₀²/r²).
	if (e < 1) {
		const Rg = far * 1.3;
		const g = ctx.createRadialGradient(P[0], P[1], 0, P[0], P[1], Rg);
		g.addColorStop(0, 'rgba(21, 21, 21, 0)');
		const m = 12;
		for (let i = 0; i <= m; i++) {
			const r = r0 * Math.pow(Rg / r0, i / m);
			const a = 1 - (r0 * r0) / (r * r);
			g.addColorStop(Math.min(1, r / Rg), `rgba(21, 21, 21, ${a.toFixed(4)})`);
		}
		ctx.save();
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
		ctx.restore();
	}

	// r₀, the radius lit in full: a gold ring, labelled, until it is past the
	// corners.
	const ring = span(u, 0.12, 0.2) * (1 - smooth(span(r0 / far, 0.45, 0.7)));
	if (ring > 0) {
		goldRing(ctx, P[0], P[1], r0, 0.8 * ring);
		const ang = -Math.PI / 4;
		label(ctx, 'r_{0}', P[0] + (r0 + 14) * Math.cos(ang), P[1] + (r0 + 14) * Math.sin(ang), {
			size: 20,
			alpha: ring
		});
	}

	// The bulb: the dot drawn in to it, its light on the room, fading as the
	// room is lit whole (or, at the glass, taking the glass's shape).
	if (Lp.bulb) {
		const on = 1 - smooth(span(u, 0.84, 0.96));
		glow(
			ctx,
			P[0],
			P[1],
			0.32 * h * lerp(0.4, 1, e),
			[255, 214, 140],
			0.4 * on * span(u, 0.1, 0.2)
		);
		light(ctx, P[0], P[1], pt, on);
	} else if (toGlass <= 0) light(ctx, P[0], P[1], pt, 1);

	plateFrame(ctx, V, decade, {
		frame: span(r0, near * 0.9, near * 1.4),
		cap: span(u, 0.86, 0.94),
		right: 'r_{0} → ∞'
	});
	notes(ctx, w, h, [
		['I ∝ 1 / r^{2}', span(u, 0.08, 0.16)],
		['I = min(1, r_{0}^{2} / r^{2}),   r_{0} → ∞ :  the far corners last', span(u, 0.34, 0.48)]
	]);
}

// ── conformal ────────────────────────────────────────────────────────────────
// G: the plate onto the unit disc (genesis-sn.js). The room under
// z ↦ G⁻¹(s · G(z)) fills |G| < s: a mesh of the plate, its vertices'
// images solved at load for ROWS values of s by Newton on G (continuation
// from s = 1, where the map is the identity), a frame interpolating two.
const CF = { nx: 21, ny: 13, rows: 64, s0: 0.02 };

function conformalPrep(art, decade) {
	const { nx, ny, rows, s0 } = CF;
	const G = rectToDisc(PLATE.W, PLATE.H);
	const verts = [];
	for (let j = 0; j <= ny; j++)
		for (let i = 0; i <= nx; i++) verts.push([-PHI + (2 * PHI * i) / nx, 1 - (2 * j) / ny]);
	const targets = verts.map(([x, y]) => G.to(x, y));
	const nv = verts.length;
	const R = [];
	let prev = new Float32Array(nv * 2);
	verts.forEach(([x, y], v) => {
		prev[2 * v] = x;
		prev[2 * v + 1] = y;
	});
	R.push(prev);
	const ds = (1 - s0) / (rows - 1);
	for (let r = 1; r < rows; r++) {
		const s = 1 - r * ds;
		const sp = 1 - (r - 1) * ds;
		const q = Math.pow(s / sp, 0.75);
		const cur = new Float32Array(nv * 2);
		for (let v = 0; v < nv; v++) {
			const z = invert(
				G,
				PLATE.W,
				PLATE.H,
				s * targets[v][0],
				s * targets[v][1],
				[prev[2 * v] * q, prev[2 * v + 1] * q],
				6
			);
			cur[2 * v] = z[0];
			cur[2 * v + 1] = z[1];
		}
		R.push(cur);
		prev = cur;
	}
	return { rows: R, flat: mips(flatRoom(art, decade, 1024)) };
}

function conformal(ctx, w, h, art, decade, u, secs, prep) {
	const { nx, ny, rows, s0 } = CF;
	const V = landing(w, h);
	const dpr = BOARD?.dpr ?? 1;
	const par = sway(V, secs, smooth(span(u, 0.88, 1)));
	const [cx0, cy0] = toScreen(V, 0, 0);
	const k0 = smooth(span(u, 0, 0.14));
	const P = [lerp(w / 2, cx0, k0), lerp(h / 2, cy0, k0)];
	const pt = opening(w, h, k0);
	const e = pullEase(span(u, 0.08, 0.84));
	const s = lerp(s0, 1, e);
	const swap = smooth(span(u, 0.84, 0.92));

	// The mesh at s: two rows blended.
	const rf = Math.min(rows - 1.0001, (1 - s) / ((1 - s0) / (rows - 1)));
	const r0 = Math.floor(rf);
	const t = rf - r0;
	const A = prep.rows[r0];
	const B = prep.rows[Math.min(rows - 1, r0 + 1)];
	const grid = [];
	for (let j = 0; j <= ny; j++) {
		const row = [];
		for (let i = 0; i <= nx; i++) {
			const v = j * (nx + 1) + i;
			row.push(toScreen(V, lerp(A[2 * v], B[2 * v], t), lerp(A[2 * v + 1], B[2 * v + 1], t)));
		}
		grid.push(row);
	}

	// The light at the centre, the room's disc growing out of it.
	const lit = 1 - smooth(span(e, 0.03, 0.2));
	light(ctx, P[0], P[1], pt, lit);

	// The landed room under, from the swap; the warped room over it.
	if (swap > 0) drawRoomAt(ctx, art, decade, V, { par, glass: restGlow(ctx, 1) });
	if (swap < 1 && e > 0) cells(ctx, prep.flat, grid, nx, ny, 1 - swap, dpr);

	// The plate's net under the map: cyan columns, pink rows.
	const net = span(u, 0.1, 0.2) * smooth(span(e, 0.02, 0.15)) * (1 - smooth(span(u, 0.76, 0.88)));
	if (net > 0) {
		for (let i = 0; i <= nx; i++)
			stroke(
				ctx,
				grid.map((row) => row[i]),
				{ color: PAL.cyan, width: 1.3, alpha: 0.85 * net }
			);
		for (let j = 0; j <= ny; j++)
			stroke(ctx, grid[j], { color: PAL.pink, width: 1.3, alpha: 0.85 * net });
	}
	math(ctx, '0', P[0] + 12, P[1] - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.3, 0.36)))
	});

	plateFrame(ctx, V, decade, {
		frame: swap,
		cap: span(u, 0.88, 0.95),
		right: 's = 1'
	});
	notes(ctx, w, h, [
		['G :  the plate → the disc,   G = i (sn z − i/√k) / (sn z + i/√k)', span(u, 0.08, 0.22)],
		['z ↦ G^{−1}(s G(z)),   s : 0 → 1 :  the room fills |G(z)| < s', span(u, 0.36, 0.5)]
	]);
}

// A drawing through a mesh: cell (i, j) of the grid is the matching cell of
// the picture, drawn under the affine map fitting its corners, clipped to
// them (pushed out a little so the cells close). A see-through mesh is drawn
// whole into a layer and laid on at its alpha (log-arrival's patch).
let LAYER = null;
function cells(ctx, src, grid, nx, ny, alpha, dpr) {
	if (alpha <= 0.003) return;
	if (alpha < 0.9) {
		const W = ctx.canvas.width;
		const H = ctx.canvas.height;
		if (!LAYER || LAYER.width !== W || LAYER.height !== H) {
			LAYER = document.createElement('canvas');
			LAYER.width = W;
			LAYER.height = H;
		}
		const x = LAYER.getContext('2d');
		x.setTransform(1, 0, 0, 1, 0, 0);
		x.clearRect(0, 0, W, H);
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		cells(x, src, grid, nx, ny, 1, dpr);
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = alpha;
		ctx.drawImage(LAYER, 0, 0);
		ctx.restore();
		return;
	}
	const c0 = grid[Math.floor(ny / 2)][0];
	const c1 = grid[Math.floor(ny / 2)][nx];
	const span0 = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
	const img = pick(src, Math.max(64, span0 * 1.6 * dpr));
	const iw = img.width;
	const ih = img.height;
	const cw = iw / nx;
	const ch = ih / ny;
	ctx.save();
	ctx.globalAlpha = alpha;
	for (let j = 0; j < ny; j++)
		for (let i = 0; i < nx; i++) {
			const a = grid[j][i];
			const b = grid[j][i + 1];
			const c = grid[j + 1][i];
			const d = grid[j + 1][i + 1];
			const S = [a, b, d, c];
			const cx = (a[0] + b[0] + c[0] + d[0]) / 4;
			const cy = (a[1] + b[1] + c[1] + d[1]) / 4;
			const ex = [(b[0] - a[0] + d[0] - c[0]) / 2, (b[1] - a[1] + d[1] - c[1]) / 2];
			const ey = [(c[0] - a[0] + d[0] - b[0]) / 2, (c[1] - a[1] + d[1] - b[1]) / 2];
			if (Math.abs(ex[0] * ey[1] - ex[1] * ey[0]) < 0.05) continue;
			ctx.save();
			ctx.beginPath();
			S.forEach(([x, y], m) => {
				const l = Math.hypot(x - cx, y - cy) || 1;
				const px = x + ((x - cx) / l) * 0.6;
				const py = y + ((y - cy) / l) * 0.6;
				if (m) ctx.lineTo(px, py);
				else ctx.moveTo(px, py);
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
			const x0 = Math.max(0, i * cw - 2);
			const y0 = Math.max(0, j * ch - 2);
			const x1 = Math.min(iw, (i + 1) * cw + 2);
			const y1 = Math.min(ih, (j + 1) * ch + 2);
			const u0 = (i * cw - x0) / cw;
			const v0 = (j * ch - y0) / ch;
			ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0, -u0, -v0, (x1 - x0) / cw, (y1 - y0) / ch);
			ctx.restore();
		}
	ctx.restore();
}

// ── ink ──────────────────────────────────────────────────────────────────────
// The swimmer's path: r = bθ out of the plate's centre, the pitch 2πb a
// little under the pen's width 2ρ, θ to the far corners. Then a curve into
// the glass.
const INK = {
	pitch: 0.44, // plate units a turn
	rho: 0.25, // the pen's radius, plate units
	write: [0.08, 0.6],
	leg: [0.6, 0.8],
	flood: {
		bed: [0.6, 0.68],
		desk: [0.62, 0.7],
		screen: [0.64, 0.72],
		clock: [0.66, 0.74],
		poster: [0.67, 0.75],
		bg: [0.7, 0.8]
	}
};
let OFF = null;

// The room's ink for the pen: rooms.js's chalk (the artwork's dark lines)
// joined with the artwork's EDGES — where its lit colour or its alpha
// changes — so a room drawn flat, with no outlines (the 2010s), still has
// lines to write. Central differences on the layer at the chalk's size.
function inkPrep(art, decade) {
	for (const cfg of LAYERS) {
		const a = art[decade]?.[cfg.key];
		if (!a?.chalk) continue;
		a.ink = mips(inkOf(a.mips[0], a.chalk[0], cfg.key === 'bg'));
	}
	return {};
}
function inkOf(src, chalk, wall) {
	const W = chalk.width;
	const H = chalk.height;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const x = c.getContext('2d', { willReadFrequently: true });
	x.drawImage(src, 0, 0, W, H);
	const d = x.getImageData(0, 0, W, H).data;
	const ck = chalk.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
	const F = new Float32Array(W * H);
	const A = new Float32Array(W * H);
	for (let i = 0, j = 0; i < d.length; i += 4, j++) {
		const al = d[i + 3] / 255;
		A[j] = al;
		F[j] = ((0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255) * al;
	}
	const out = x.createImageData(W, H);
	const o = out.data;
	let seed = 777777;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const lo = wall ? 0.22 : 0.1;
	const hi = wall ? 0.5 : 0.3;
	for (let y = 1; y < H - 1; y++)
		for (let xx = 1; xx < W - 1; xx++) {
			const j = y * W + xx;
			const gl = Math.hypot(F[j + 1] - F[j - 1], F[j + W] - F[j - W]);
			const ga = Math.hypot(A[j + 1] - A[j - 1], A[j + W] - A[j - W]);
			const edge = clamp01((Math.max(gl, 0.8 * ga) - lo) / (hi - lo)) * (0.55 + 0.45 * rnd());
			const k = Math.max(edge, ck[j * 4 + 3] / 255);
			o[j * 4] = 236;
			o[j * 4 + 1] = 230;
			o[j * 4 + 2] = 218;
			o[j * 4 + 3] = Math.round(255 * k);
		}
	x.putImageData(out, 0, 0);
	return c;
}

function inkPath(R) {
	const b = INK.pitch / TAU;
	const rMax = Math.hypot(PHI, 1) - 0.6 * INK.rho;
	const thMax = rMax / b;
	const at = (th) => [b * th * Math.cos(th), b * th * Math.sin(th)];
	const dir = (th) => {
		const d = [Math.cos(th) - th * Math.sin(th), Math.sin(th) + th * Math.cos(th)];
		const l = Math.hypot(d[0], d[1]) || 1;
		return [d[0] / l, d[1] / l];
	};
	// The leg: a quadratic curve from the spiral's end, along its tangent,
	// into the glass.
	const E = at(thMax);
	const T = dir(thMax);
	const Gc = [R.glass.x, R.glass.y];
	const C1 = [E[0] + 0.9 * T[0], E[1] + 0.9 * T[1]];
	const leg = (g) => [
		(1 - g) * (1 - g) * E[0] + 2 * (1 - g) * g * C1[0] + g * g * Gc[0],
		(1 - g) * (1 - g) * E[1] + 2 * (1 - g) * g * C1[1] + g * g * Gc[1]
	];
	const legDir = (g) => {
		const d = [
			2 * (1 - g) * (C1[0] - E[0]) + 2 * g * (Gc[0] - C1[0]),
			2 * (1 - g) * (C1[1] - E[1]) + 2 * g * (Gc[1] - C1[1])
		];
		const l = Math.hypot(d[0], d[1]) || 1;
		return [d[0] / l, d[1] / l];
	};
	return { b, thMax, at, dir, leg, legDir };
}

function ink(ctx, w, h, art, decade, u, secs) {
	const V = landing(w, h);
	const R = roomOf(decade, art);
	const dpr = BOARD?.dpr ?? 1;
	const par = sway(V, secs, smooth(span(u, 0.8, 1)));
	const [cx0, cy0] = toScreen(V, 0, 0);
	const k0 = smooth(span(u, 0, 0.14));
	const P = [lerp(w / 2, cx0, k0), lerp(h / 2, cy0, k0)];
	const pt = opening(w, h, k0);
	const path = inkPath(R);
	const tau = span(u, ...INK.write);
	const g = settle(span(u, ...INK.leg));
	const toGlass = smooth(span(u, 0.78, 0.88));
	const dim = 1 - smooth(span(u, 0.88, 0.98));
	const colour = Object.fromEntries(
		Object.entries(INK.flood).map(([k, win]) => [k, smooth(span(u, ...win))])
	);
	const chalkA = Object.fromEntries(Object.keys(INK.flood).map((k) => [k, 1 - colour[k]]));
	const glass = (G, a) => toGlass > 0 && litGlass(ctx, G, pt.r, toGlass, dim, a);

	if (tau < 1) {
		// The room, ink and colour, kept only where the pen has been: drawn
		// whole into a plate-sized layer and cut by the brush's stroke.
		const PW = Math.ceil(PLATE.W * V.s * dpr) + 4;
		const PH = Math.ceil(PLATE.H * V.s * dpr) + 4;
		if (!OFF || OFF.width !== PW || OFF.height !== PH) {
			OFF = document.createElement('canvas');
			OFF.width = PW;
			OFF.height = PH;
		}
		const ox = V.cx - (PLATE.W * V.s) / 2 - 2 / dpr;
		const oy = V.cy - (PLATE.H * V.s) / 2 - 2 / dpr;
		const x = OFF.getContext('2d');
		x.setTransform(1, 0, 0, 1, 0, 0);
		x.globalCompositeOperation = 'source-over';
		x.clearRect(0, 0, PW, PH);
		x.setTransform(dpr, 0, 0, dpr, -dpr * ox, -dpr * oy);
		for (const cfg of LAYERS) {
			drawRoomAt(x, art, decade, V, { layers: [cfg.key], alpha: colour[cfg.key] });
			drawRoomAt(x, art, decade, V, { layers: [cfg.key], alpha: chalkA[cfg.key], chalk: true });
		}
		// The brush: the path to the head, as wide as the pen.
		const th1 = path.thMax * tau;
		const pts = [];
		const n = Math.max(2, Math.ceil(th1 / 0.06));
		for (let i = 0; i <= n; i++) pts.push(toScreen(V, ...path.at((th1 * i) / n)));
		x.globalCompositeOperation = 'destination-in';
		stroke(x, pts, { color: '#fff', width: 2 * INK.rho * V.s });
		ctx.drawImage(OFF, ox, oy, PW / dpr, PH / dpr);
	} else {
		for (const cfg of LAYERS) {
			drawRoomAt(ctx, art, decade, V, { par, layers: [cfg.key], alpha: colour[cfg.key], glass });
			drawRoomAt(ctx, art, decade, V, {
				par,
				layers: [cfg.key],
				alpha: chalkA[cfg.key],
				chalk: true
			});
		}
	}

	// The light the swimmer came out of, fading as it leaves.
	light(ctx, P[0], P[1], pt, 1 - smooth(span(u, 0.12, 0.26)));

	// The swimmer: on the spiral, then on the leg into the glass, fading in.
	const body = span(u, 0.06, 0.16);
	const fade = 1 - smooth(span(u, 0.79, 0.86));
	if (body > 0 && fade > 0) {
		let pos;
		let dir;
		if (tau < 1) {
			pos = path.at(path.thMax * tau);
			dir = path.dir(path.thMax * tau);
		} else {
			pos = path.leg(g);
			dir = path.legDir(g);
		}
		const [hx, hy] = toScreen(V, ...pos);
		const view = makeView({ w, h, scale: 1, cx: hx, cy: hy });
		const heading = Math.atan2(dir[1], dir[0]);
		drawSperm(ctx, view, {
			pole: [0, 0],
			scale: 0.058 * V.s,
			turn: heading + Math.PI + 0.2,
			width: 5,
			tip: 1.5,
			body,
			alpha: fade,
			wiggle: 0.14,
			phase: secs * 1.6
		});
	}

	plateFrame(ctx, V, decade, {
		frame: smooth(span(tau, 0.75, 1)),
		cap: span(u, 0.88, 0.95),
		right: 'r = b θ'
	});
	notes(ctx, w, h, [
		['r = b θ,   2π b ≤ 2ρ :  the pen’s turns overlap', span(u, 0.1, 0.22)],
		['the ink first, then the colour,  d = 0.16 → 1 :  the wall last', span(u, 0.6, 0.72)]
	]);
}
