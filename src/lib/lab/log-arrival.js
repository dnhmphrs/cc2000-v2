import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	bloom,
	math,
	PAL,
	PHI,
	TAU,
	GOLDEN_K,
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
import { curl } from './log/space.js';

// ── Sketch: log-arrival — how the room first appears ─────────────────────────
// After the maths, the room: the turn (log-mobius) leaves the lens square
// over a lit point — a gold disc with a cream core, a third of the board
// across — and the bedroom of the decade asked for (?decade=50s|60s|90s|10s,
// 90s by default) has to come into being out of it. Every variant opens on
// exactly that disc at the board's centre and ends where log-fall lands: the
// room in its chalk-framed plate, the decade under it, swaying on its depths
// (the back wall slides the most, the bed a sixth of that: drawRoom's
// parallax), the monitor's glass faintly lit where the answer is written.
// Five ways for it to arrive, one per ?v=:
//
//   assemble  (default) the room's six layers fly OUT of the lit point, each
//             on its own golden spiral — one loxodromic flow about the point,
//             z ↦ p + φ^{2θ/π} e^{iθ} (z − p), θ → 0, so each layer turns as
//             it grows, born two turns out at a fiftieth of its size — the
//             wall first and the bed last, each landing at its depth and
//             swaying by it from then on, so the parallax is built by the
//             arrival. The gold line is each layer's path out of the light,
//             a node riding its head; its depth is chalked in the margin
//             with a leader to it as it lands (deepest at the top on either
//             side). The point sits where the glass will be: it is the
//             flow's fixed point, so the screen spins round it, and as the
//             screen lands the light takes the glass's shape.
//   obscura   a camera obscura. The lit point is a pinhole: around it, on the
//             board, the room comes through it, faint, soft, small and upside
//             down — z ↦ p − (z − p)/λ, a central projection through p, which
//             is a half-turn and a shrink — with the room out there dashed in
//             chalk and a rose ray from each of its corners through p to the
//             same corner of the image (A and A′). Then the lens goes through
//             the pinhole (its light flares): the lens comes on toward it the
//             whole way, λ easing to 1, and once the rays are rubbed out the
//             half-turn is undone — z ↦ p + e^{iπ(1−s)} (z − p)/λ, s : 0 → 1 —
//             so the image turns the right way up as it grows into the dashed
//             frame, which becomes the plate's.
//   glass     the monitor first. A real perspective lens on the room's real
//             depths (log-fall's: each layer a plane 3d behind the frame,
//             pre-scaled so the landing lens sees the flat composition). The
//             disc takes the shape of the decade's glass; the lens, square on
//             it, pulls back to the landing while the room is put round the
//             glass layer by layer outward — bezel, desk, poster, clock, wall,
//             bed — each coming back to its depth from in front of it as it
//             fades in; the wall instead spreads out of the glass behind
//             everything, a ring of the glass's light at its edge. The frame,
//             at depth 0, sweeps in from past the board's edges last.
//   sphere    the four decades' rooms on the Riemann sphere, a quarter-turn
//             apart round its equator (cyan meridians through ±i, pink
//             parallels round them: the two pencils of circles). The sphere
//             turns about the axis through ±i — on the board the Möbius map
//             z ↦ (z cos ½β + sin ½β)/(cos ½β − z sin ½β), β : π → 0 — and
//             brings the asked-for room round from the back to the lit point,
//             which is the board's tangent point and never moves; then the
//             lens dives and the sphere opens into the plane (space.js's curl,
//             κ : 1 → 0) until the room is the flat plate. Each room is its
//             drawing cut into cells, each cell drawn under the affine map
//             fitting its four projected corners and clipped to them.
//   escher    the Print Gallery. D is the Droste room (its own plate in its
//             glass, letterboxed, and so on): invariant under z ↦ p + λ(z − p),
//             λ the room-to-glass zoom, p the nest's pole. E(z) = D(p + (z −
//             p)^α), α = (2πi + log λ)/2πi, shears D's lattice in log z so one
//             turn round p climbs one level: the nest becomes ONE spiral, itself
//             invariant under the zoom-and-turn c = λ^{1/α}. It spreads out of
//             the lit point (the pole), the lens falls two turns of c into it
//             — the rooms pour out of the light, turning — and lands; then it
//             untwists, α = 1 + s log λ/2πi, s : 1 → 0. Between, z^α has a cut
//             (the levels either side of arg(z − p) = π no longer meet), and
//             it is chalked in, rose and dashed, for as long as it is open. Per
//             pixel at 360 px across, upscaled; each pixel's log-polar point
//             sheared, slid by whole levels into the annulus between the glass
//             and λ× the glass, and looked up in the flat room from a mip
//             chosen by how much of the drawing the pixel covers.
//
// The motion in each only gathers pace and then eases to land; the sway
// builds as the room does. The landed room is drawn by drawRoomAt, a copy of
// rooms.js's drawRoom that mirror-tiles the wall past the frame on the side
// its slide opens (the site's wallCover) and paints the board into the glass.
//
// Ten seconds, a pure function of progress: ?at= pins any frame.

const SECONDS = 10;
const FOV = 34; // the lens, degrees vertical (log-fall's)
const DEPTH_OF = Object.fromEntries(LAYERS.map((l) => [l.key, l.depth]));
const NAME_OF = {
	bg: 'wall',
	poster: 'poster',
	clock: 'clock',
	screen: 'screen',
	desk: 'desk',
	bed: 'bed'
};

let BOARD = null;

export default async function make({ at }) {
	const v = variant(['assemble', 'obscura', 'glass', 'sphere', 'escher']);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	BOARD = b;
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, `log-arrival · ${v} · ${decade} · loading the room`);
	const t0 = performance.now();
	const art = await loadRooms({ decades: v === 'sphere' ? DECADES : [decade] });
	const loadMs = Math.round(performance.now() - t0);
	const t1 = performance.now();
	const prep = {};
	if (v === 'sphere')
		for (const d of DECADES) prep[d] = art[d]?.bg ? mips(flatRoom(art, d, 1280)) : null;
	if (v === 'escher') prep.droste = drosteSource(art, decade);
	const prepMs = Math.round(performance.now() - t1);
	const info = { seconds: SECONDS, variant: v, decade, loadMs, prepMs, missing: art.missing };
	const DRAW = { assemble, obscura, glass: glassIn, sphere, escher };

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		DRAW[v](ctx, w, h, art, decade, time.u, time.t, prep);
		tag(ctx, w, h, `log-arrival · ${v} · ${decade}`);
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
// Where log-fall lands: the plate centred a little low (under the lecture),
// 0.62 of the board tall at most. V = { cx, cy, s, rot }: the plate's centre
// on screen, px per plate unit (the plate is 2φ × 2) and its turn.
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: 0.535 * h, s: height / 2, rot: 0 };
}

// The landing sway, log-fall's: px of slide per unit of depth (the wall
// slides the whole of it, the bed a sixth), `amp` 0..1 of the full sway.
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

// A rectangle's corners on screen: centre, size, turned `rot` counter-clockwise.
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
// A ring of the light spreading out: gold, haloed by a wide faint stroke of
// itself (a shadow blur on a ring this size costs a frame's budget).
function goldRing(ctx, x, y, r, a) {
	if (a <= 0.005 || r <= 0) return;
	const P = circleAt(x, y, r);
	stroke(ctx, P, { color: PAL.gold, width: 12, alpha: 0.12 * a });
	stroke(ctx, P, { color: PAL.gold, width: 5, alpha: 0.22 * a });
	stroke(ctx, P, { color: PAL.gold, width: 2.4, alpha: a });
}
const circleAt = (x, y, r, n = 160) => {
	const out = [];
	for (let i = 0; i <= n; i++)
		out.push([x + r * Math.cos((TAU * i) / n), y + r * Math.sin((TAU * i) / n)]);
	return out;
};

// ── The room ─────────────────────────────────────────────────────────────────
// One drawing (a mip chain), centred at (cx, cy) on screen, w × h px, turned
// `rot` counter-clockwise, mirrored on request.
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

// The board painted into the monitor's glass (cut out of the drawing), so
// the wall never shows through it: the place the answer is written.
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

// rooms.js's drawRoom, with what a swaying room needs: the wall mirror-
// tiled past the frame on the side its slide opens (the site's wallCover),
// and the board in the glass, `glass(G, a)` to light it. `par` [px, py] the
// slide per unit of depth; `alpha` one number or per layer. Returns the
// glass on screen, { cx, cy, w, h, rot }.
function drawRoomAt(ctx, art, decade, V, o = {}) {
	const {
		par = [0, 0],
		alpha = 1,
		layers = null,
		clip = true,
		glass = null,
		glassFill = PAL.ground,
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
			glassBoard(ctx, G, al, glassFill);
			if (glass) glass(G, al);
		}
		const tiles = [[0, 0]];
		if (key === 'bg' && clip) {
			// The slide in the plate's own axes; the gap opens behind it.
			const xp = c * ox - sn * oy;
			const yp = -sn * ox - c * oy;
			const ti = Math.abs(xp) > 0.5 ? -Math.sign(xp) : 0;
			const tj = Math.abs(yp) > 0.5 ? -Math.sign(yp) : 0;
			if (ti) tiles.push([ti, 0]);
			if (tj) tiles.push([0, tj]);
			if (ti && tj) tiles.push([ti, tj]);
		}
		for (const [i, j] of tiles) {
			const [px, py] = toScreen(V, L.x + i * L.w, L.y + j * L.h);
			blit(ctx, a.mips, px + ox, py + oy, L.w * V.s, L.h * V.s, rot, al, i !== 0, j !== 0, soft);
		}
	}
	ctx.restore();
	return G;
}

// The room flat, every layer composited into one canvas `px` wide, the glass
// board-dark: a texture for the sphere's patches and for the warp.
function flatRoom(art, decade, px) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / PHI);
	const x = c.getContext('2d');
	drawRoomAt(x, art, decade, { cx: c.width / 2, cy: c.height / 2, s: c.height / 2, rot: 0 });
	return c;
}

// The plate's chalk frame (written on with `frame`), and under it, as
// log-fall captions it, the decade at the left and the variant's own last
// word at the right (`cap`).
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

// The lecture (ink.js's), its letters haloed in board rather than set on a
// patch of it: over a room a patch is a dark slab, a halo only a shadow.
function notes(ctx, w, h, lines) {
	ctx.save();
	ctx.shadowColor = 'rgba(21, 21, 21, 0.95)';
	ctx.shadowBlur = 10;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.shadowBlur = 4;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.restore();
}

// ── The light ────────────────────────────────────────────────────────────────
// The lit point as the turn leaves it (log-mobius's last frame): a gold disc
// a third of the board across, a cream core, a warm bloom. k = 0 that disc,
// k = 1 a lit point; between, the disc draws its light in.
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

// The light spread over a rectangle: the lit point grown into the shape of
// the monitor's glass. `m` 0..1 the morph from a disc of radius r0 at the
// glass's centre to the glass itself; `k` the light, 1 full (gold, a cream
// core) down to a faint warm glow on the board, where the answer goes.
function litGlass(ctx, G, r0, m, k, a = 1) {
	if (a <= 0.002) return;
	const w = lerp(2 * r0, G.w, m);
	const hh = lerp(2 * r0, G.h, m);
	// As the light dims it draws in to the middle of the glass, as a tube's
	// does when it is switched off — bright to the last, never a muddy gold.
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
	// The faint light that stays: a warm glow in the middle of the glass, and
	// its edge just touched with gold.
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

// ── assemble ─────────────────────────────────────────────────────────────────
// Each layer's flight, in progress: the deepest first, the bed last.
const AS_WIN = {
	bg: [0.06, 0.4],
	poster: [0.17, 0.49],
	clock: [0.23, 0.54],
	screen: [0.31, 0.62],
	desk: [0.41, 0.71],
	bed: [0.5, 0.8]
};
// The golden flow each layer comes along: θ from −Θ to 0, so it is born at
// φ^{−2Θ/π} ≈ 1/50 of its size, two turns out of the light.
const AS_TURN = 12.8;
// Where each layer's depth is written: [side, the slot's height in plate
// units, and for the wall the point on it the leader goes to].
const AS_LABEL = {
	bg: [-1, 0.62, -1.22, 0.12],
	clock: [-1, 0.02],
	desk: [-1, -0.58],
	poster: [1, 0.62],
	screen: [1, 0.02],
	bed: [1, -0.58]
};
const settle = (t) => {
	const x = clamp01(t);
	return x * x * x * (x * (6 * x - 15) + 10);
};

function assemble(ctx, w, h, art, decade, u, secs) {
	const V = landing(w, h);
	const R = roomOf(decade, art);
	const par = sway(V, secs, smooth(span(u, 0.3, 0.95)));
	const gd = DEPTH_OF.screen;
	// The lit point: the turn's disc drawing its light in, and moving to the
	// place the glass will be — swaying at the glass's depth from then on.
	const k0 = smooth(span(u, 0, 0.14));
	const [gx, gy] = toScreen(V, R.glass.x, R.glass.y);
	const P = [lerp(w / 2, gx + par[0] * gd, k0), lerp(h / 2, gy + par[1] * gd, k0)];
	const pt = opening(w, h, k0);

	// Every layer on its flow z ↦ P + φ^{2θ/π} e^{iθ} (z − P) toward its place.
	const flights = {};
	for (const cfg of LAYERS) {
		const L = R.lay[cfg.key];
		if (!L) continue;
		const [t0, t1] = AS_WIN[cfg.key];
		const tau = span(u, t0, t1);
		const th = -AS_TURN * (1 - settle(tau));
		const sc = Math.exp(GOLDEN_K * th);
		const [lx, ly] = toScreen(V, L.x, L.y);
		const d = [lx + par[0] * L.depth - P[0], ly + par[1] * L.depth - P[1]];
		const c = Math.cos(th);
		const sn = Math.sin(th);
		flights[cfg.key] = {
			L,
			tau,
			th,
			sc,
			d,
			t1,
			x: P[0] + sc * (c * d[0] + sn * d[1]),
			y: P[1] + sc * (-sn * d[0] + c * d[1])
		};
	}

	const frameQ = plateQuad(V);
	const inside = () => {
		pathQuad(ctx, frameQ);
		ctx.clip();
	};
	const outside = () => {
		ctx.beginPath();
		ctx.rect(-10, -10, w + 20, h + 20);
		pathQuad(ctx, frameQ, false);
		ctx.clip('evenodd');
	};
	// A layer in flight: unclipped while it flies, the frame cutting it as it
	// lands (what lies past the frame fades), the wall tiled once it is in.
	const drawLayer = (key, before = null) => {
		const f = flights[key];
		const a = art[decade]?.[key];
		if (!f || !a || f.tau <= 0) return;
		const al = smooth(span(f.tau, 0, 0.08));
		const land = smooth(span(f.tau, 0.84, 1));
		const W = f.L.w * V.s * f.sc;
		const H = f.L.h * V.s * f.sc;
		const one = (alpha) => {
			if (before) before(f, alpha);
			blit(ctx, a.mips, f.x, f.y, W, H, f.th, alpha);
		};
		if (f.tau >= 1) {
			drawRoomAt(ctx, art, decade, V, {
				par,
				layers: [key],
				glass: before ? (G, aa) => before(f, aa, G) : null
			});
			return;
		}
		ctx.save();
		inside();
		one(al);
		ctx.restore();
		if (land < 1) {
			ctx.save();
			outside();
			one(al * (1 - land));
			ctx.restore();
		}
	};

	// The light: a lit point, until the screen lands round it; then it takes
	// the glass's shape, and dims to the glow the answer will be written in.
	const sF = flights.screen;
	const toGlass = smooth(span(u, 0.55, 0.66));
	const dim = 1 - smooth(span(u, 0.66, 0.88));
	const glassOf = (f) => ({
		cx: P[0],
		cy: P[1],
		w: R.glass.w * V.s * f.sc,
		h: R.glass.h * V.s * f.sc,
		rot: f.th
	});
	const lightIn = (f, a, G = null) => {
		const g = G ?? glassOf(f);
		if (!G) glassBoard(ctx, g, a);
		if (toGlass > 0) litGlass(ctx, g, pt.r, toGlass, dim, 1);
		else light(ctx, P[0], P[1], pt, 1);
	};

	drawLayer('bg');
	drawLayer('poster');
	drawLayer('clock');
	if (!sF || sF.tau <= 0) light(ctx, P[0], P[1], pt, 1);
	drawLayer('screen', lightIn);
	drawLayer('desk');
	drawLayer('bed');

	math(ctx, 'p', P[0] + 12, P[1] - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.3, 0.36)))
	});

	// The gold: each layer's path out of the light, written as it flies and
	// rubbed out once it is in — a node riding the head of each.
	for (const key of Object.keys(flights)) {
		const f = flights[key];
		if (f.tau <= 0) continue;
		const fade = 1 - smooth(span(u, f.t1 - 0.02, f.t1 + 0.1));
		if (fade <= 0) continue;
		const pts = [];
		const n = 140;
		for (let i = 0; i <= n; i++) {
			const th = lerp(-AS_TURN, f.th, i / n);
			const sc = Math.exp(GOLDEN_K * th);
			const c = Math.cos(th);
			const sn = Math.sin(th);
			pts.push([P[0] + sc * (c * f.d[0] + sn * f.d[1]), P[1] + sc * (-sn * f.d[0] + c * f.d[1])]);
		}
		stroke(ctx, pts, { color: PAL.gold, taper: [0.4, 2.6], alpha: 0.9 * fade });
		disc(ctx, f.x, f.y, 3.2, {
			fill: PAL.node,
			alpha: 0.95 * fade,
			ring: PAL.ground,
			ringWidth: 1
		});
	}

	// The captions: each layer's depth, written in the margin as it lands, a
	// chalk leader to a node on it — deepest at the top on either side — and
	// rubbed out once the room is in.
	const sz = Math.min(0.068 * V.s, 18);
	for (const key of Object.keys(flights)) {
		const f = flights[key];
		const wr = span(f.tau, 0.7, 1);
		const out = 1 - smooth(span(u, 0.86, 0.94));
		if (wr <= 0 || out <= 0) continue;
		const [side, slot, ax, ay] = AS_LABEL[key];
		const L = f.L;
		const nx = key === 'bg' ? ax : L.x;
		const ny = key === 'bg' ? ay : L.y;
		let [qx, qy] = toScreen(V, nx, ny);
		qx += par[0] * L.depth;
		qy += par[1] * L.depth;
		const [ex, ey] = toScreen(V, (side * PLATE.W) / 2, slot);
		const tx = ex + side * 18;
		const dl = L.depth === 1 ? '1.0' : String(L.depth);
		stroke(
			ctx,
			[
				[ex + side * 10, ey],
				[ex, ey],
				[qx, qy]
			],
			{
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.72 * out,
				upto: wr
			}
		);
		disc(ctx, qx, qy, 3.4, {
			fill: PAL.node,
			alpha: out * clamp01(wr * 3),
			ring: PAL.ground,
			ringWidth: 1
		});
		math(ctx, `d = ${dl}`, tx, ey - sz * 0.62, {
			size: sz,
			upto: wr,
			alpha: 0.95 * out,
			align: side < 0 ? 'right' : 'left'
		});
		math(ctx, NAME_OF[key], tx, ey + sz * 0.62, {
			size: sz * 0.85,
			upto: wr,
			alpha: 0.7 * out,
			color: PAL.chalkDim,
			align: side < 0 ? 'right' : 'left'
		});
	}

	// The frame, chalked in as the wall lands; the caption once all are in.
	plateFrame(ctx, V, decade, {
		frame: span(u, 0.3, 0.42),
		cap: span(u, 0.84, 0.93),
		right: 'd = 0.16 … 1'
	});
	notes(ctx, w, h, [
		['z ↦ p + φ^{2θ/π} e^{iθ} (z − p),   θ → 0', span(u, 0.05, 0.17)],
		['x ↦ x + d · δ :  each layer slides by its depth', span(u, 0.6, 0.72)]
	]);
}

// ── obscura ──────────────────────────────────────────────────────────────────
// The lit point is a pinhole, and the room comes through it: z ↦ p − (z − p)/λ,
// the central projection through p, which is a half-turn and a shrink. The
// way out of it is z ↦ p + e^{iπ(1−s)} (z − p)/λ, λ easing to 1 the whole
// way (the lens coming on to the pinhole) and s : 0 → 1 once the rays are
// gone: the image turns right way up as it grows, round the pinhole, which
// stays put in the room's glass.
const OB_LAMBDA = 3.6;

function obscura(ctx, w, h, art, decade, u, secs) {
	const V = landing(w, h);
	const R = roomOf(decade, art);
	const [gx, gy] = toScreen(V, R.glass.x, R.glass.y);
	const par = sway(V, secs, smooth(span(u, 0.8, 1)));
	const gd = DEPTH_OF.screen;
	// The pinhole: the turn's disc drawing its light in, at the glass's place.
	const k0 = smooth(span(u, 0, 0.14));
	const P = [lerp(w / 2, gx + par[0] * gd, k0), lerp(h / 2, gy + par[1] * gd, k0)];
	const pt = opening(w, h, k0);
	// The lens comes on toward the pinhole the whole way — the image grows
	// as λ eases from its first value to 1 — and the half-turn is undone
	// once the rays are rubbed out: p + e^{iπ(1−s)} (z − p)/λ, which at s = 0
	// is the projection, so the rays stay true while they are up.
	const t = pullEase(span(u, 0.12, 0.86));
	const t0 = pullEase(span(0.42, 0.12, 0.86));
	const s = settle((t - t0) / (1 - t0));
	const lam = Math.pow(OB_LAMBDA, 1 - t);
	const ang = Math.PI * (1 - s);
	const sc = 1 / lam;
	const c = Math.cos(ang);
	const sn = Math.sin(ang);
	const map = ([x, y]) => {
		const dx = x - P[0];
		const dy = y - P[1];
		return [P[0] + sc * (c * dx + sn * dy), P[1] + sc * (-sn * dx + c * dy)];
	};
	const [icx, icy] = map([V.cx, V.cy]);
	const Vi = { cx: icx, cy: icy, s: V.s * sc, rot: ang };

	// The room out there: its frame, dashed — the corners the rays come from.
	const Q = plateQuad(V);
	const land = smooth(span(u, 0.8, 0.9));
	const outline = span(u, 0.05, 0.2);
	if (land < 1)
		stroke(ctx, closed(Q), {
			color: PAL.chalk,
			width: 1.3,
			alpha: 0.55 * (1 - land),
			dash: [7, 7],
			upto: outline
		});

	// The image: faint and soft at first, a pool of light round the pinhole.
	const show = smooth(span(u, 0.16, 0.36));
	if (show > 0) {
		const a = show * lerp(0.6, 1, smooth(span(s, 0.1, 0.9)));
		// Soft as a pinhole's image is: drawn from a smaller copy (a blur
		// filter costs eighty milliseconds a frame here).
		const soft = lerp(0.3, 1, smooth(span(s, 0, 0.7)));
		const turnOn = smooth(span(u, 0.8, 0.9));
		const dim = 1 - smooth(span(u, 0.86, 0.97));
		ctx.save();
		ctx.globalAlpha = a;
		drawRoomAt(ctx, art, decade, Vi, {
			par,
			soft,
			// (the light comes on only once the room is sharp)
			glass: (G) => turnOn > 0 && litGlass(ctx, G, pt.r, turnOn, dim, 1)
		});
		ctx.restore();
		// The falloff of a pinhole's light away from its axis (cos⁴), on the
		// image, gone as the room turns into the room.
		const vig = 1 - smooth(span(s, 0.2, 0.85));
		if (vig > 0) {
			const r = 0.5 * Math.hypot(PLATE.W, PLATE.H) * Vi.s * 1.15;
			ctx.save();
			pathQuad(ctx, plateQuad(Vi));
			ctx.clip();
			const g = ctx.createRadialGradient(P[0], P[1], r * 0.25, P[0], P[1], r);
			g.addColorStop(0, 'rgba(21, 21, 21, 0)');
			g.addColorStop(1, `rgba(21, 21, 21, ${0.62 * vig})`);
			ctx.fillStyle = g;
			ctx.fillRect(icx - r * 2, icy - r * 2, r * 4, r * 4);
			ctx.restore();
		}
	}

	// The rays: from each corner of the room out there, through the pinhole,
	// to the same corner in the image — written on, rubbed out as it turns.
	const rays = 1 - smooth(span(u, 0.36, 0.44));
	if (rays > 0) {
		const img = Q.map(([x, y]) => [P[0] - (x - P[0]) / lam, P[1] - (y - P[1]) / lam]);
		for (let i = 0; i < 4; i++) {
			const wr = span(u, 0.15 + 0.03 * i, 0.3 + 0.03 * i);
			stroke(ctx, [Q[i], P, img[i]], {
				color: PAL.rose,
				width: 1.4,
				alpha: 0.85 * rays,
				upto: wr
			});
			if (wr > 0) disc(ctx, Q[i][0], Q[i][1], 3.4, { fill: PAL.node, alpha: rays });
		}
		// A and its image A′, at the top left and — turned — the bottom right.
		const la = rays * span(u, 0.26, 0.32);
		math(ctx, 'A', Q[3][0] - 10, Q[3][1] - 14, { size: 22, alpha: la, align: 'right' });
		const [ax, ay] = img[3];
		math(ctx, 'A′', ax + 8, ay + 14, { size: 20, alpha: la });
		math(ctx, 'p', P[0] + 12, P[1] - 14, { size: 22, alpha: rays * span(u, 0.12, 0.18) });
	}

	// The pinhole's light: a lit point, flaring as the lens goes through it,
	// then the glass's (drawn in the room, above).
	const through = Math.sin(Math.PI * span(s, 0.15, 0.85));
	const turnOn = smooth(span(u, 0.8, 0.9));
	if (turnOn < 1) {
		const a = 1 - turnOn;
		light(ctx, P[0], P[1], { ...pt, r: pt.r * (1 + 1.4 * through) }, a);
		if (through > 0) glow(ctx, P[0], P[1], 0.3 * h * through, [255, 226, 170], 0.55 * through * a);
	}

	plateFrame(ctx, V, decade, { frame: land, cap: span(u, 0.86, 0.94), right: 's = 1,  λ = 1' });
	notes(ctx, w, h, [
		['z ↦ p − (z − p) / λ :  the room, through a point', span(u, 0.12, 0.26)],
		['z ↦ p + e^{iπ(1−s)} (z − p) / λ,   s : 0 → 1,   λ → 1', span(u, 0.42, 0.54)]
	]);
}
// ── glass ────────────────────────────────────────────────────────────────────
// The monitor first. A real perspective lens on the room's real depths, as
// log-fall has it: every layer a plane facing the lens, 3d behind the frame
// (d its depth, the back wall 3 units back), pre-scaled so the landing lens
// sees the flat composition. The lens starts square on the glass with the
// glass 0.4 of the board tall, and pulls back to the landing while the room
// is put round the glass layer by layer outward — each layer coming to its
// depth from in front of it as it fades in (the monitor, whose glass the
// light already is, put round it where it stands; the wall spread out of the
// glass) — and the frame, at z = 0, sweeps in from past the board's edges
// last of all.
const GL_WIN = {
	screen: [0.12, 0.3],
	desk: [0.23, 0.42],
	poster: [0.32, 0.5],
	clock: [0.37, 0.55],
	bg: [0.45, 0.66],
	bed: [0.57, 0.78]
};

// Progress → the pull-back, at one pace in log-distance: its speed goes as
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

function glassIn(ctx, w, h, art, decade, u, secs) {
	const V = landing(w, h);
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const d0 = (F * PLATE.H) / (2 * V.s);
	const R = roomOf(decade, art, d0);
	const G = R.glass;
	// The lens: D from the glass, from D0 (the glass 0.4 of the board tall)
	// to the landing, sliding from square on the glass to the plate's centre.
	const D1 = d0 - G.z;
	const D0 = (F * G.h) / (0.4 * h);
	const e = pullEase(span(u, 0.1, 0.9));
	const Z = G.z + D0 * Math.pow(D1 / D0, e);
	const lx = lerp(G.x, 0, e);
	const ly = lerp(G.y, 0, e);
	const ox = lerp(w / 2, V.cx, e);
	const oy = lerp(h / 2, V.cy, e);
	const par = sway(V, secs, smooth(span(u, 0.78, 1)));
	// A plane z → its px per unit and where a point of it lands.
	const m = (z) => F / (Z - z);
	const at = (x, y, z) => [ox + m(z) * (x - lx), oy - m(z) * (y - ly)];
	const frameQ = [
		[-PLATE.W / 2, -PLATE.H / 2],
		[PLATE.W / 2, -PLATE.H / 2],
		[PLATE.W / 2, PLATE.H / 2],
		[-PLATE.W / 2, PLATE.H / 2]
	].map(([x, y]) => at(x, y, 0));

	// The light: the turn's disc taking the glass's shape, then the glass's
	// own light, dimming to the glow the answer will be written in.
	const morph = smooth(span(u, 0.02, 0.12));
	const dim = 1 - smooth(span(u, 0.55, 0.9));
	const gd = DEPTH_OF.screen;
	const mg = m(G.z);
	const [gx, gy] = at(G.x, G.y, G.z);
	const Gs = {
		cx: gx + par[0] * gd,
		cy: gy + par[1] * gd,
		w: G.w * mg,
		h: G.h * mg,
		rot: 0
	};
	const r0 = opening(w, h, 0).r;
	const lightUp = () => {
		const o = opening(w, h, 0);
		if (morph < 1) bloom(ctx, Gs.cx, Gs.cy, o.halo, 'rgba(255, 222, 150, 0.55)', 1 - morph);
		glow(ctx, Gs.cx, Gs.cy, 1.5 * Math.max(Gs.w, Gs.h), [255, 214, 140], 0.5 * dim * morph);
		litGlass(ctx, Gs, r0, morph, dim, 1);
	};

	ctx.save();
	pathQuad(ctx, frameQ);
	ctx.clip();
	for (const cfg of LAYERS) {
		const key = cfg.key;
		const L = R.lay[key];
		const img = art[decade]?.[key];
		if (!L || !img) continue;
		const tau = span(u, ...GL_WIN[key]);
		const al = smooth(span(tau, 0, 0.55));
		// Coming to its depth from in front of it, as it fades in — but the
		// screen, which is the glass the light is already in, is put round it.
		const z = key === 'screen' ? L.z : L.z + 0.4 * (Z - L.z) * (1 - settle(tau));
		const mz = m(z);
		const [cx, cy] = at(L.x, L.y, z);
		const sx = par[0] * L.depth;
		const sy = par[1] * L.depth;
		if (key === 'screen') {
			if (al > 0) glassBoard(ctx, { ...Gs, w: Gs.w + 2, h: Gs.h + 2 }, al);
			lightUp();
		}
		if (al <= 0.002) continue;
		const tiles = key === 'bg' ? [-1, 0, 1] : [0];
		// The wall is not faded in (a pale wall half-there over the board is
		// mud): it spreads out of the glass, behind everything, a ring of the
		// glass's light at its edge.
		const wipe = key === 'bg' ? settle(tau) : 1;
		if (wipe <= 0) continue;
		let ring = 0;
		if (wipe < 1) {
			ring = wipe * Math.max(...frameQ.map(([x, y]) => Math.hypot(x - Gs.cx, y - Gs.cy))) * 1.04;
			ctx.save();
			ctx.beginPath();
			ctx.arc(Gs.cx, Gs.cy, ring, 0, TAU);
			ctx.clip();
		}
		for (const j of tiles)
			for (const i of tiles)
				blit(
					ctx,
					img.mips,
					cx + sx + i * L.w * mz,
					cy + sy - j * L.h * mz,
					L.w * mz,
					L.h * mz,
					0,
					key === 'bg' ? 1 : al,
					i !== 0,
					j !== 0
				);
		if (ring > 0) {
			ctx.restore();
			const fade = 1 - smooth(span(wipe, 0.75, 1));
			goldRing(ctx, Gs.cx, Gs.cy, ring, 0.9 * fade);
		}
	}
	ctx.restore();

	// The frame: the plane the lens started nearest, so it comes last.
	stroke(ctx, closed(frameQ), { color: PAL.chalk, width: 1.8, alpha: 0.9 });
	plateFrame(ctx, V, decade, { frame: 0, cap: span(u, 0.86, 0.94), right: `Z = ${d0.toFixed(1)}` });
	notes(ctx, w, h, [
		['x ↦ f · x / (Z + 3d) :  the lens at Z, the layer d deep', span(u, 0.1, 0.22)],
		[
			`Z : ${(G.z + D0).toFixed(1)} → ${d0.toFixed(1)},   the room put round its glass`,
			span(u, 0.5, 0.62)
		]
	]);
}

// ── sphere ───────────────────────────────────────────────────────────────────
// The four rooms on the Riemann sphere. The board is space.js's: the plane
// tangent to the unit sphere at the lit point, curled by κ (1 the sphere, 0
// the plane). Each room is a rectangle on the board, its glass at 0, carried
// to its place by a rotation of the sphere about the axis through ±i —
// as a Möbius map z ↦ (z cos ½β + sin ½β)/(cos ½β − z sin ½β) — the four a
// quarter-turn apart round the equator (the real axis), and the whole sphere
// turned by β, so the asked-for room comes round from the back to the front.
// Each room is its drawing cut into cells, every cell drawn under the affine
// map that fits its four projected corners and clipped to them. Then the
// lens dives and κ → 0: the sphere opens into the plane, the room flat.
const SP_SIGMA = 0.23; // a plate unit on the board
const SP_DC = 6; // the lens from the sphere's centre, at the start

// The quarter-turns of the sphere about the axis through ±i, on the board.
function turnZ([x, y], lam) {
	const c = Math.cos(lam / 2);
	const s = Math.sin(lam / 2);
	const nr = x * c + s;
	const ni = y * c;
	const dr = c - x * s;
	const di = -y * s;
	const d = dr * dr + di * di;
	if (d < 1e-12) return [Infinity, Infinity];
	return [(nr * dr + ni * di) / d, (ni * dr - nr * di) / d];
}

function sphere(ctx, w, h, art, decade, u, secs, prep) {
	const V = landing(w, h);
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const dpr = BOARD?.dpr ?? 1;
	const jT = DECADES.indexOf(decade);
	const beta = Math.PI * (1 - settle(span(u, 0.2, 0.62)));
	const k = 1 - smooth(span(u, 0.58, 0.82));
	// The lens looks straight down −z, from the axis to over the plate.
	const gT = roomOf(decade, art).glass;
	const flat = [-2 * SP_SIGMA * gT.x, -2 * SP_SIGMA * gT.y];
	const dLand = (2 * F * SP_SIGMA) / V.s;
	const e = pullEase(span(u, 0.48, 0.9));
	const dist = (SP_DC - 1) * Math.pow(dLand / (SP_DC - 1), e);
	const eye = [lerp(0, flat[0], e), lerp(0, flat[1], e), 1 + dist];
	const oy = lerp(h / 2, V.cy, e);
	const project = ([x, y, z]) => {
		const d = eye[2] - z;
		return [w / 2 + (F * (x - eye[0])) / d, oy - (F * (y - eye[1])) / d, d];
	};
	const place = (p, lam) => curl(turnZ(p, lam + beta), k);
	// Facing the lens: the outward normal of the sphere of curvature κ.
	const facing = ([x, y, z]) =>
		k * x * (eye[0] - x) + k * y * (eye[1] - y) + (k * z - k + 1) * (eye[2] - z) > 0;
	const curve = (P3, color, width, alpha, hid = 0.28) => {
		if (alpha <= 0.003) return;
		let run = [];
		let back = null;
		const flush = () => {
			if (run.length > 1)
				stroke(
					ctx,
					run,
					back
						? { color, width: Math.max(1, width * 0.6), alpha: alpha * hid, dash: [3, 6] }
						: { color, width, alpha }
				);
			run = [];
		};
		for (const X of P3) {
			const S = project(X);
			if (S[2] < 0.05 || !Number.isFinite(S[0] + S[1])) {
				flush();
				back = null;
				continue;
			}
			const b = !facing(X);
			if (back !== null && b !== back) {
				run.push(S);
				flush();
			}
			back = b;
			run.push(S);
		}
		flush();
	};

	// ── The globe: the limb, cyan meridians through ±i, pink parallels round
	// them (the two pencils of circles), the equator in chalk.
	const net = span(u, 0.06, 0.24) * (1 - smooth(span(u, 0.62, 0.78)));
	if (net > 0 && k > 0.02) {
		const lim = (n, f) => {
			const out = [];
			for (let i = 0; i <= n; i++) out.push(f(i / n));
			return out;
		};
		// The limb: the circle the lens's cone touches, while it is a sphere.
		const r = 1 / k;
		const c = [0, 0, 1 - r];
		const dv = [eye[0] - c[0], eye[1] - c[1], eye[2] - c[2]];
		const dd = Math.hypot(...dv);
		if (dd > r * 1.01) {
			const n = dv.map((x) => x / dd);
			const a1 = norm2(n);
			const a2 = [
				n[1] * a1[2] - n[2] * a1[1],
				n[2] * a1[0] - n[0] * a1[2],
				n[0] * a1[1] - n[1] * a1[0]
			];
			const cc = c.map((x, i) => x + n[i] * ((r * r) / dd));
			const rr = r * Math.sqrt(1 - (r * r) / (dd * dd));
			const L = lim(180, (t) =>
				cc.map((x, i) => x + rr * (Math.cos(TAU * t) * a1[i] + Math.sin(TAU * t) * a2[i]))
			);
			ctx.save();
			ctx.globalAlpha = 0.05 * net * k;
			ctx.fillStyle = PAL.chalk;
			ctx.beginPath();
			L.map(project).forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
			ctx.fill();
			ctx.restore();
			stroke(ctx, L.map(project), { color: PAL.rose, width: 2, alpha: 0.75 * net * k, upto: net });
		}
		for (let m = 0; m < 4; m++) {
			const mu = (m * Math.PI) / 4;
			const P3 = lim(220, (t) =>
				curl(turnZ([0, Math.tan(Math.PI * (t - 0.5) * 0.998)], mu + beta), k)
			);
			curve(P3, PAL.cyan, 1.6, 0.8 * net);
		}
		for (const lat of [-60, -30, 30, 60]) {
			const la = (lat * Math.PI) / 180;
			const P3 = lim(200, (t) => {
				const ps = TAU * t;
				const d = 1 + Math.cos(la) * Math.cos(ps);
				return curl([(Math.cos(la) * Math.sin(ps)) / d, Math.sin(la) / d], k);
			});
			curve(P3, PAL.pink, 1.4, 0.75 * net);
		}
		const EQ = lim(240, (t) => curl(turnZ([Math.tan(Math.PI * (t - 0.5) * 0.998), 0], beta), k));
		curve(EQ, PAL.chalk, 1.4, 0.6 * net);
		// ±i, the turn's fixed points.
		for (const [p, s, dy] of [
			[[0, 1], 'i', -16],
			[[0, -1], '−i', 22]
		]) {
			const X = curl(p, k);
			const q = project(X);
			disc(ctx, q[0], q[1], 3.6, { fill: PAL.node, alpha: net });
			math(ctx, s, q[0] + 10, q[1] + dy, { size: 22, alpha: net * (facing(X) ? 1 : 0.5) });
		}
	}

	// ── The rooms, cell by cell, the far side culled; the asked-for one is
	// drawn last. Each fades in, and the others fall away as the lens dives.
	const show = smooth(span(u, 0.12, 0.3));
	const others = 1 - smooth(span(u, 0.64, 0.82));
	const swap = smooth(span(u, 0.8, 0.85));
	const order = DECADES.map((d, j) => j).sort((a, b) => (a === jT) - (b === jT));
	const glassQ = {};
	for (const j of order) {
		const d = DECADES[j];
		const src = prep[d];
		if (!src) continue;
		const lam = ((j - jT) * Math.PI) / 2;
		// The asked-for room stays opaque under its layers as they come in.
		const a = show * (j === jT ? (swap < 1 ? 1 : 0) : others);
		const g = roomOf(d, art).glass;
		const at = (qx, qy) => place([SP_SIGMA * (qx - g.x), SP_SIGMA * (qy - g.y)], lam);
		if (a > 0.02) patch(ctx, src, at, project, facing, a, dpr, j === jT);
		// Its frame, written on with it; its decade under it.
		const B = [];
		const n = 30;
		for (let i = 0; i < n; i++) B.push(at(-PHI + (2 * PHI * i) / n, -1));
		for (let i = 0; i < n; i++) B.push(at(PHI, -1 + (2 * i) / n));
		for (let i = 0; i < n; i++) B.push(at(PHI - (2 * PHI * i) / n, 1));
		for (let i = 0; i <= n; i++) B.push(at(-PHI, 1 - (2 * i) / n));
		const fa = j === jT ? show * (1 - swap) : show * others;
		curve(B, PAL.chalk, 1.6, 0.85 * fa, 0.2);
		const capX = at(-PHI, -1.16);
		const cq = project(capX);
		if (facing(capX) && fa > 0)
			math(ctx, DECADE_NAME[d], cq[0], cq[1], {
				size: 17,
				alpha: 0.85 * fa * (1 - smooth(span(u, 0.6, 0.7)))
			});
		if (j === jT)
			glassQ.P = [
				at(g.x - g.w / 2, g.y),
				at(g.x + g.w / 2, g.y),
				at(g.x, g.y + g.h / 2),
				at(g.x, g.y - g.h / 2)
			].map(project);
	}

	// ── The landed room: the same picture, flat, now in its layers, so the
	// sway can slide them by depth.
	const par = sway(V, secs, smooth(span(u, 0.82, 1)));
	const k0 = smooth(span(u, 0, 0.14));
	const pt = opening(w, h, k0);
	const toGlass = smooth(span(u, 0.62, 0.76));
	const dim = 1 - smooth(span(u, 0.74, 0.92));
	const Q = glassQ.P;
	// The camera's view of the flat plate: a similarity, as it lands.
	const [pcx, pcy] = project([flat[0], flat[1], 1]);
	const Vc = { cx: pcx, cy: pcy, s: (F * 2 * SP_SIGMA) / (eye[2] - 1), rot: 0 };
	if (swap > 0) {
		drawRoomAt(ctx, art, decade, Vc, {
			par,
			alpha: swap,
			glass: (G) => litGlass(ctx, G, pt.r, toGlass, dim, 1)
		});
	}
	// The lit point, at the tangent point — the one place that never moves —
	// taking the shape of the asked-for room's glass once the room is there.
	const L0 = project([0, 0, 1]);
	if (toGlass <= 0 || !Q) light(ctx, L0[0], L0[1], pt, 1);
	else if (swap < 1) {
		const G = {
			cx: L0[0],
			cy: L0[1],
			w: Math.abs(Q[1][0] - Q[0][0]),
			h: Math.abs(Q[3][1] - Q[2][1]),
			rot: 0
		};
		litGlass(ctx, G, pt.r, toGlass, dim, 1 - swap);
	}
	// The board's 0: the point it touches the sphere at.
	math(ctx, '0', L0[0] + 12, L0[1] - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.26, 0.32)))
	});

	plateFrame(ctx, Vc, decade, {
		frame: swap,
		cap: span(u, 0.86, 0.94),
		right: 'β = 0,  κ = 0'
	});
	notes(ctx, w, h, [
		['z ↦ (z cos ½β + sin ½β) / (cos ½β − z sin ½β)', span(u, 0.2, 0.34)],
		['κ → 0 :  the sphere opens into the plane', span(u, 0.6, 0.72)]
	]);
}

// A unit vector perpendicular to n.
function norm2(n) {
	const a = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	const c = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]];
	const l = Math.hypot(...c) || 1;
	return c.map((x) => x / l);
}

// A drawing on a curved surface: cut into cells, every cell drawn under the
// affine map that fits its four projected corners, clipped to them (pushed
// out a little, so the cells close without hairlines). `at(qx, qy)` → 3D for
// a point of the plate (plate units); cells facing away are culled.
let LAYER = null;
function patch(ctx, src, at, project, facing, alpha, dpr, fine = true) {
	// A see-through patch is drawn whole into a layer of its own and laid on
	// at its alpha: drawn cell by cell at that alpha, the overlaps that close
	// the cells would double up into a grid.
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
		const box = patch(x, src, at, project, facing, 1, dpr, fine);
		if (!box) return null;
		const [x0, y0, x1, y1] = box.map((v) => Math.round(v * dpr));
		const bx = Math.max(0, x0 - 2);
		const by = Math.max(0, y0 - 2);
		const bw = Math.min(W, x1 + 2) - bx;
		const bh = Math.min(H, y1 + 2) - by;
		if (bw <= 0 || bh <= 0) return box;
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = alpha;
		ctx.drawImage(LAYER, bx, by, bw, bh, bx, by, bw, bh);
		ctx.restore();
		return box;
	}
	const grid = [];
	let nx = 16;
	let ny = 10;
	// Fewer cells for a small patch, or one that is only passing (`fine` off).
	const c0 = project(at(-PHI, 0));
	const c1 = project(at(PHI, 0));
	const span0 = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
	if (span0 < 220 || !fine) {
		nx = 10;
		ny = 6;
	}
	for (let j = 0; j <= ny; j++) {
		const row = [];
		for (let i = 0; i <= nx; i++) {
			const X = at(-PHI + (2 * PHI * i) / nx, 1 - (2 * j) / ny);
			row.push({ X, S: project(X) });
		}
		grid.push(row);
	}
	const img = pick(src, Math.max(64, span0 * 2.2 * dpr));
	const vw = ctx.canvas.width / dpr;
	const vh = ctx.canvas.height / dpr;
	const iw = img.width;
	const ih = img.height;
	const box = [Infinity, Infinity, -Infinity, -Infinity];
	let any = false;
	ctx.save();
	ctx.globalAlpha = alpha;
	for (let j = 0; j < ny; j++)
		for (let i = 0; i < nx; i++) {
			const a = grid[j][i];
			const b = grid[j][i + 1];
			const c = grid[j + 1][i];
			const d = grid[j + 1][i + 1];
			if (Math.min(a.S[2], b.S[2], c.S[2], d.S[2]) < 0.05) continue;
			const Xc = [0, 1, 2].map((m) => (a.X[m] + b.X[m] + c.X[m] + d.X[m]) / 4);
			if (!facing(Xc)) continue;
			const S = [a.S, b.S, d.S, c.S];
			if (S.some((q) => !Number.isFinite(q[0] + q[1]))) continue;
			// Off the board: nothing to draw.
			if (
				Math.max(a.S[0], b.S[0], c.S[0], d.S[0]) < -2 ||
				Math.min(a.S[0], b.S[0], c.S[0], d.S[0]) > vw + 2 ||
				Math.max(a.S[1], b.S[1], c.S[1], d.S[1]) < -2 ||
				Math.min(a.S[1], b.S[1], c.S[1], d.S[1]) > vh + 2
			)
				continue;
			for (const q of S) {
				box[0] = Math.min(box[0], q[0]);
				box[1] = Math.min(box[1], q[1]);
				box[2] = Math.max(box[2], q[0]);
				box[3] = Math.max(box[3], q[1]);
			}
			any = true;
			const cx = (a.S[0] + b.S[0] + c.S[0] + d.S[0]) / 4;
			const cy = (a.S[1] + b.S[1] + c.S[1] + d.S[1]) / 4;
			const ex = [(b.S[0] - a.S[0] + d.S[0] - c.S[0]) / 2, (b.S[1] - a.S[1] + d.S[1] - c.S[1]) / 2];
			const ey = [(c.S[0] - a.S[0] + d.S[0] - b.S[0]) / 2, (c.S[1] - a.S[1] + d.S[1] - b.S[1]) / 2];
			ctx.save();
			ctx.beginPath();
			S.forEach(([x, y], m) => {
				const l = Math.hypot(x - cx, y - cy) || 1;
				const px = x + ((x - cx) / l) * 0.7;
				const py = y + ((y - cy) / l) * 0.7;
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
			// The cell's source widened by a margin each way (clamped to the
			// drawing), mapped on through the same affine, so the overlap the
			// clip leaves shows the neighbouring pixels rather than stretched
			// edge ones.
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
	return any ? box : null;
}
// ── escher ───────────────────────────────────────────────────────────────────
// The Print Gallery. D, the Droste room: the room with its own plate in its
// glass (letterboxed, as log-fall nests them), that one's in its glass, and
// so on — the same picture under z ↦ p + λ(z − p), p the nest's pole, λ the
// room-to-glass zoom. In w = log(z − p) it is a lattice-periodic pattern, and
// E(z) = D(p + (z − p)^α), α = (2πi + log λ)/2πi, shears the lattice so one
// turn round p climbs one level: the nest becomes ONE spiral (de Smit and
// Lenstra's reading of Escher's print), itself self-similar under a zoom-
// and-turn c = λ^{1/α}. The lens falls two of those turns into the pole —
// rooms pouring out of the light — lands, and the picture untwists, α → 1:
// for 0 < s < 1 the power z^{1 + s·log λ/2πi} has a cut (the levels either
// side of arg z = π no longer meet), chalked in while it is open. Then the
// nest in the glass gives way to the glass's light, and the room to its layers.
// Per pixel, at ES_W px across, upscaled: every pixel's log-polar point,
// sheared, slid by whole levels into the annulus between the glass and λ×
// the glass, and looked up in the flat room — from a mip chosen by how much
// of the drawing the pixel covers, so the deep levels do not sparkle.
const ES_FIT = 0.9;
const ES_W = 360;
const ES_M = 0.06; // the board round the plate in the drawing, plate units

// The nest's numbers: λ (the plate letterboxed in the glass) and the pole.
function drosteOf(decade, art) {
	const g = roomOf(decade, art).glass;
	const lam = PLATE.H / (ES_FIT * Math.min(g.h, g.w / PHI));
	return { g, lam, p: [(lam * g.x) / (lam - 1), (lam * g.y) / (lam - 1)] };
}

// The drawing the warp looks up: the flat room on a clear ground, its chalk
// frame round it, as pixel arrays at four sizes.
function drosteSource(art, decade) {
	const SW = 1024;
	const k = SW / (PLATE.W + 2 * ES_M);
	const SH = Math.round((PLATE.H + 2 * ES_M) * k);
	const c = document.createElement('canvas');
	c.width = SW;
	c.height = SH;
	const x = c.getContext('2d', { willReadFrequently: true });
	const V = { cx: SW / 2, cy: SH / 2, s: k, rot: 0 };
	drawRoomAt(x, art, decade, V);
	stroke(x, closed(plateQuad(V)), { color: PAL.chalk, width: 2.2, alpha: 0.9 });
	const levels = [];
	let cur = c;
	for (let i = 0; i < 4; i++) {
		const cx = cur.getContext('2d', { willReadFrequently: true });
		levels.push({
			w: cur.width,
			h: cur.height,
			d: cx.getImageData(0, 0, cur.width, cur.height).data
		});
		const n = document.createElement('canvas');
		n.width = Math.max(1, Math.ceil(cur.width / 2));
		n.height = Math.max(1, Math.ceil(cur.height / 2));
		n.getContext('2d', { willReadFrequently: true }).drawImage(cur, 0, 0, n.width, n.height);
		cur = n;
	}
	return { levels, k, out: null };
}

function escher(ctx, w, h, art, decade, u, secs, prep) {
	const V = landing(w, h);
	const src = prep.droste;
	const { g, lam, p } = drosteOf(decade, art);
	const LL = Math.log(lam);
	// The untwist, s : 1 → 0, and the fall: two turns of the spiral's own
	// zoom-and-turn c = λ^{1/α} into the pole, landing on the room.
	const sTw = 1 - settle(span(u, 0.6, 0.84));
	const a = (sTw * LL) / TAU; // α = 1 − i a
	const den = LL * LL + TAU * TAU;
	const lcR = (TAU * TAU * LL) / den; // log c, the full twist's
	const lcI = (TAU * LL * LL) / den;
	const zeta = -2 * (1 - pullEase(span(u, 0.1, 0.7)));
	// screen − p = M (z − p): M = c^ζ; its inverse below.
	const iMr = Math.exp(-zeta * lcR) * Math.cos(-zeta * lcI);
	const iMi = Math.exp(-zeta * lcR) * Math.sin(-zeta * lcI);
	const [psx, psy] = toScreen(V, p[0], p[1]);
	const reveal = settle(span(u, 0.08, 0.42));
	const swap = smooth(span(u, 0.84, 0.92));

	// ── The warp, per pixel.
	const OW = ES_W;
	const OH = Math.max(1, Math.round((ES_W * h) / w));
	if (!src.out || src.out.width !== OW || src.out.height !== OH) {
		src.out = document.createElement('canvas');
		src.out.width = OW;
		src.out.height = OH;
		src.img = src.out.getContext('2d').createImageData(OW, OH);
	}
	if (reveal > 0 && swap < 1) {
		const D = src.img.data;
		const kx = w / OW;
		const ky = h / OH;
		const gx0 = g.x - g.w / 2;
		const gx1 = g.x + g.w / 2;
		const gy0 = g.y - g.h / 2;
		const gy1 = g.y + g.h / 2;
		const ka = Math.hypot(1, a);
		// Plate units per output pixel, and the drawing's px per plate unit.
		const dOut = kx / V.s / Math.exp(zeta * lcR);
		const k0 = src.k;
		const PW = PLATE.W / 2 + ES_M;
		const PH = PLATE.H / 2 + ES_M;
		for (let Y = 0; Y < OH; Y++) {
			const py = -((Y + 0.5) * ky - V.cy) / V.s - p[1];
			for (let X = 0; X < OW; X++) {
				const o = (Y * OW + X) * 4;
				const px = ((X + 0.5) * kx - V.cx) / V.s - p[0];
				const zx = iMr * px - iMi * py;
				const zy = iMi * px + iMr * py;
				const r2 = zx * zx + zy * zy;
				if (r2 < 1e-14) {
					D[o + 3] = 0;
					continue;
				}
				const lr = 0.5 * Math.log(r2);
				let rho = lr;
				let cph;
				let sph;
				if (a !== 0) {
					const th = Math.atan2(zy, zx);
					rho += a * th;
					const phi = th - a * lr;
					cph = Math.cos(phi);
					sph = Math.sin(phi);
				} else {
					const ir = 1 / Math.sqrt(r2);
					cph = zx * ir;
					sph = zy * ir;
				}
				let tg = 1e9;
				if (cph > 1e-9) tg = (gx1 - p[0]) / cph;
				else if (cph < -1e-9) tg = (gx0 - p[0]) / cph;
				if (sph > 1e-9) tg = Math.min(tg, (gy1 - p[1]) / sph);
				else if (sph < -1e-9) tg = Math.min(tg, (gy0 - p[1]) / sph);
				const j = Math.ceil((Math.log(tg) - rho) / LL);
				const er = Math.exp(rho + j * LL);
				const qx = p[0] + er * cph;
				const qy = p[1] + er * sph;
				// How much of the drawing this pixel covers: the mip.
				const foot = (dOut * ka * er * k0) / Math.sqrt(r2);
				const L = src.levels[foot < 1.6 ? 0 : foot < 3.2 ? 1 : foot < 6.4 ? 2 : 3];
				const sx = ((qx + PW) / (2 * PW)) * L.w;
				const sy = ((PH - qy) / (2 * PH)) * L.h;
				if (sx < 0 || sy < 0 || sx >= L.w || sy >= L.h) {
					D[o + 3] = 0;
					continue;
				}
				const d = L.d;
				if (foot < 0.7) {
					// Magnified (the parent rooms): bilinear, or it is blocks.
					const fx = Math.min(L.w - 1.001, Math.max(0, sx - 0.5));
					const fy = Math.min(L.h - 1.001, Math.max(0, sy - 0.5));
					const x0 = fx | 0;
					const y0 = fy | 0;
					const tx = fx - x0;
					const ty = fy - y0;
					const i00 = (y0 * L.w + x0) * 4;
					const i10 = i00 + 4;
					const i01 = i00 + L.w * 4;
					const i11 = i01 + 4;
					const w00 = (1 - tx) * (1 - ty);
					const w10 = tx * (1 - ty);
					const w01 = (1 - tx) * ty;
					const w11 = tx * ty;
					D[o] = d[i00] * w00 + d[i10] * w10 + d[i01] * w01 + d[i11] * w11;
					D[o + 1] = d[i00 + 1] * w00 + d[i10 + 1] * w10 + d[i01 + 1] * w01 + d[i11 + 1] * w11;
					D[o + 2] = d[i00 + 2] * w00 + d[i10 + 2] * w10 + d[i01 + 2] * w01 + d[i11 + 2] * w11;
					D[o + 3] = d[i00 + 3] * w00 + d[i10 + 3] * w10 + d[i01 + 3] * w01 + d[i11 + 3] * w11;
				} else {
					const i = ((sy | 0) * L.w + (sx | 0)) * 4;
					D[o] = d[i];
					D[o + 1] = d[i + 1];
					D[o + 2] = d[i + 2];
					D[o + 3] = d[i + 3];
				}
			}
		}
		src.out.getContext('2d').putImageData(src.img, 0, 0);
	}

	// The landed room, crisp, in its layers, under the warp as it goes.
	const par = sway(V, secs, smooth(span(u, 0.86, 1)));
	const k0 = smooth(span(u, 0, 0.14));
	const pt = opening(w, h, k0);
	const toGlass = smooth(span(u, 0.82, 0.9));
	const dim = 1 - smooth(span(u, 0.88, 0.98));
	if (swap > 0)
		drawRoomAt(ctx, art, decade, V, {
			par,
			glass: (G) => litGlass(ctx, G, pt.r, toGlass, dim, 1)
		});
	if (reveal > 0 && swap < 1) {
		ctx.save();
		if (reveal < 1) {
			ctx.beginPath();
			ctx.arc(psx, psy, reveal * Math.hypot(w, h), 0, TAU);
			ctx.clip();
		}
		ctx.globalAlpha = 1 - swap;
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(src.out, 0, 0, w, h);
		ctx.restore();
		if (reveal < 1)
			goldRing(ctx, psx, psy, reveal * Math.hypot(w, h), 0.9 * (1 - smooth(span(reveal, 0.6, 1))));
	}

	// The cut, while the power has one: the levels either side of arg z = π
	// no longer meet.
	const cut = Math.sin(Math.PI * clamp01((1 - sTw) * 1.0)) * (sTw < 1 && sTw > 0 ? 1 : 0);
	if (cut > 0.01) {
		stroke(
			ctx,
			[
				[psx, psy],
				[-20, psy]
			],
			{
				color: PAL.rose,
				width: 2.2,
				alpha: 0.95 * cut,
				dash: [9, 6]
			}
		);
		math(ctx, 'arg (z − p) = π', 44, psy - 16, { size: 20, alpha: cut });
	}

	// The pole: the light the spiral pours out of (drawn in from the board's
	// centre, where the turn left it), then the glass's.
	if (toGlass < 1) light(ctx, lerp(w / 2, psx, k0), lerp(h / 2, psy, k0), pt, 1 - toGlass);
	math(ctx, 'p', psx + 12, psy - 14, {
		size: 22,
		alpha: span(u, 0.12, 0.18) * (1 - smooth(span(u, 0.28, 0.34)))
	});

	plateFrame(ctx, V, decade, { frame: swap, cap: span(u, 0.88, 0.95), right: 'α = 1' });
	notes(ctx, w, h, [
		['z ↦ p + (z − p)^{α},   α = (2πi + log λ) / 2πi', span(u, 0.08, 0.2)],
		[`α = 1 + s · log λ / 2πi,   λ = ${lam.toFixed(2)},   s : 1 → 0`, span(u, 0.64, 0.76)]
	]);
}
