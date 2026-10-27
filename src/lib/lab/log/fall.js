// ── The chalk fall: rooms through rooms, down to the answer's ────────────────
// Lifted out of flow-chalk.js so any flow can end on it. A nest of the chalk
// plates (rooms.js), each hanging in the glass of the one before — log-fall's
// Droste construction: level k is room k under the similarity x ↦ O_k + s_k·x,
// its child letterboxed in its glass (FIT) and set so far behind it that the
// lens at rest has passed it (MARGIN) — and the lens falling plate → glass →
// plate down it at one pace in e-folds of zoom, gathering and landing (speed
// ∝ (c + x)³(1 − x)²), the chalk rooms coming up through one another, every
// glass it has passed dropped. Through every glass the BACKGROUND shows — the
// flow's own structure, drawn under the plates by a callback it gives, at the
// lens's vanishing point and the fall's own zoom, so the plates and whatever
// streams round them are ONE zoom. The helix swimmer (helix.js) comes out of
// the flash and leads the lens through the first glass or two, then pulls
// away into the dark. The lens slides from the last glass to the plate's
// centre as it lands and sways on the room's depths, the frame holding and
// the room drifting behind it, the back wall most, the bed least; the last
// room floods with colour, bed first and wall last, and its glass lights.
//
// What is exact: the similarities (a zoom of 1/X per crossing, the e-folds
// summed so the fall runs at one pace through crossings of different sizes),
// the pinhole projection of every layer (a plane parallel to the lens, so its
// picture is the drawing under one similarity). What is a picture: the nest
// itself — a room behind a monitor's glass is a drawing hung in a drawing,
// not a place — and the sway.
//
//   const fall = makeFall({ art, order, beats });     art: loadRooms({ chalk: true })
//   const nest = fall.geometry(w, h);                  the nest fitted to the board
//   const cam = fall.draw(ctx, w, h, t, { background, colourAlong, dust, nudge,
//     origin, screenOff, tiles, tilesAlpha, zeta });
// `origin` ([x, y] px): where the vanishing point sits on the board (the
// middle by default) — a flow whose tunnel's apex is elsewhere hands it over,
// so the rooms are LOCKED to it. `screenOff` 0 … 1 turns the last screen's
// light off. `tiles` (0, 1, 2): every room repeated round itself that many
// plates out in every direction, mirrored turn and turn about, at
// `tilesAlpha` — a tesseract of rooms, the real one in the middle, seen
// through every glass. `zeta`: the fall's position imposed (a flow's dolly
// on through the last glass: L + 0 … 0.9).
//
// `order` the rooms top to bottom, the answer's last (orderOf(decade) is the
// flows' order: the others cycled, then the answer's). `beats`, in the run's
// seconds: `fall: [t0, t1]` the flight from ζ₀ to the last plate (t0 is the
// flash), `land` the slide to the plate's centre, `colour` the flood,
// `swim` the swimmer's lead. `geometry(w, h)` (cached by size) gives the
// nest — `levels`, `pose(ζ)`, `TOTAL` e-folds, `rate0` the pace the fall
// opens at in e-folds a second (a dive before it ends on this rate),
// `efolds(t)` the e-folds flown by t, `zetaAt(t)` — so a flow's own zoom can
// run on into the fall. `draw` draws one frame — a pure function of t — and
// returns the lens, `{ ox, oy }` its vanishing point on screen (the flash
// goes there) and `land` 0…1. `background(ctx, cam, zoom, alpha)` is called
// first, under the plates, with the e-folds flown and the strength the
// background should have (it thins a little as the lens lands).
// `colourAlong`: false is the flood at the landing only; true is colour
// arriving as you fall — room k of the L + 1 carries (k/L)^1.5 of its colour
// all the way down, chalk at the top, the answer's room in full (a function
// (k, L) → 0…1 gives another ramp). `dust` the board's chalk dust, the
// board's own by default.
//
// `reveal(glassBox)` (draw's option) → { r, wob, seed } or null: the last
// room's colour REVEALED rather than flooded — coloured inside a hand-drawn
// ring of radius r px about its glass (wobbling by wob, re-drawn with seed),
// chalk outside — so a flow's light can carry the colour out into it.
//
// `inside` (makeFall's option, 0…0.9): the fall comes to rest that far on
// past the last plate, INTO its glass — the lens slowing to a stop inside the
// last room as it passed through the others, the room past the board's edges
// round it, centred on its glass — rather than at the plate seen whole.
//
// `fill: { h, w }` (makeFall's option) with `beats.push: [t0, t1]`: after it
// lands the lens dollies in on the last room until it fills h of the board's
// height or w of its width (whichever first; w over 1 crops its sides) — the
// room ending near full size, its depths parting as the lens goes in.

import {
	PAL,
	PHI,
	TAU,
	span,
	smooth,
	lerp,
	clamp01,
	stroke,
	norm,
	sub3,
	getBoard
} from './board.js';
import { noise1 } from './sketch-hand.js';
import { glow } from './ink.js';
import { PLATE, DECADES, roomOf, drawImageAt, pick } from './rooms.js';
import { drawHelix } from './helix.js';

// The nest's constants, flow-chalk's.
export const FALL = {
	fov: 34,
	fit: 0.9, // how much of its glass the next plate fills, at rest
	margin: 1.35, // how far past the parent's glass the lens is, at rest
	nearZ: 0.015, // planes nearer than this (in the lens's units) are passed
	zeta0: -0.55, // where the fall starts: this far before the first plate
	crossings: 5, // glasses fallen through: six rooms, the answer's last
	pace: { n: 512, c: 0.35 } // speed ∝ (c + x)³ (1 − x)², tabulated at n
};

// The flows' order of rooms: the other decades cycled over the crossings,
// the answer's last.
export function orderOf(decade, crossings = FALL.crossings) {
	const others = DECADES.filter((d) => d !== decade);
	const order = [];
	for (let i = 0; i < crossings; i++) order.push(others[i % others.length]);
	order.push(decade);
	return order;
}

export function makeFall({
	art,
	order,
	beats,
	fov,
	fit,
	margin,
	nearZ,
	zeta0,
	pace,
	fill = null,
	inside = 0
} = {}) {
	const K = {
		fill,
		inside,
		fov: fov ?? FALL.fov,
		fit: fit ?? FALL.fit,
		margin: margin ?? FALL.margin,
		nearZ: nearZ ?? FALL.nearZ,
		zeta0: zeta0 ?? FALL.zeta0,
		pace: pace ?? FALL.pace
	};
	let fitted = null;
	// Colour along: a room at p of its colour is its colour at p under its
	// chalk at 0.95 (1 − p) — two full draws of every layer, all the way down
	// — so each such copy is baked once into one image (source-over is
	// associative, so one draw of the composite is the two draws), at the
	// mip the frame picks, and only that mip: the wall is 3840 px across.
	const baked = new Map();
	const bake = (k, key, a, p, px) => {
		const src = pick(a.mips, px);
		const id = `${k}:${key}:${a.mips.indexOf(src)}:${p}`;
		let c = baked.get(id);
		if (!c) {
			c = document.createElement('canvas');
			c.width = src.width;
			c.height = src.height;
			const x = c.getContext('2d');
			x.globalAlpha = p;
			x.drawImage(src, 0, 0);
			x.globalAlpha = 0.95 * (1 - p);
			x.drawImage(pick(a.chalk, src.width), 0, 0, src.width, src.height);
			baked.set(id, c);
		}
		return c;
	};
	const geometry = (w, h) => {
		if (!fitted || fitted.w !== w || fitted.h !== h) fitted = fitNest(w, h, order, art, K, beats);
		return fitted;
	};
	const draw = (
		ctx,
		w,
		h,
		t,
		{
			background = null,
			colourAlong = false,
			dust,
			reveal = null,
			nudge = null,
			origin = null,
			screenOff = 0,
			tiles = 0,
			tilesAlpha = 0.55,
			zeta = null,
			sway = 1
		} = {}
	) => {
		const g = geometry(w, h);
		const cam = lensAt(g, zeta ?? g.zetaAt(t), t, w, h, beats, K, nudge, origin, sway);
		if (background) background(ctx, cam, g.efolds(t), lerp(1, 0.7, cam.land));
		const d = dust === undefined ? getBoard().dust : dust;
		const glassAt = drawFall(ctx, w, h, d, g, art, cam, t, beats, K, colourAlong, bake, reveal, {
			screenOff,
			tiles,
			tilesAlpha
		});
		// The last room's glass on screen ([x0, y0, x1, y1]), once it shows.
		cam.glass = glassAt[g.L] ? glassAt[g.L].box : null;
		return cam;
	};
	// The last room's PLATE on the board this frame, [x0, y0, x1, y1] (CSS
	// px) — or null while it is behind the lens — as draw would lay it with
	// the same options: for a flow that cuts a window onto the room before
	// drawing it (the run's porthole), so the window is the plate's own.
	const frameOf = (t, w, h, { zeta = null, nudge = null, origin = null, sway = 1 } = {}) => {
		const g = geometry(w, h);
		const cam = lensAt(g, zeta ?? g.zetaAt(t), t, w, h, beats, K, nudge, origin, sway);
		const lv = g.levels[g.L];
		const dw = cam.z - lv.O[2];
		if (dw <= K.nearZ * cam.s) return null;
		const m = (g.F * lv.s) / dw;
		const e = cam.ox + (g.F * (lv.O[0] - cam.x)) / dw;
		const f = cam.oy - (g.F * (lv.O[1] - cam.y)) / dw;
		const x0 = e - (m * PLATE.W) / 2;
		const y0 = f - (m * PLATE.H) / 2;
		return [x0, y0, x0 + m * PLATE.W, y0 + m * PLATE.H];
	};
	return { order, beats, geometry, draw, frameOf };
}

// ── The nest ─────────────────────────────────────────────────────────────────
// Level k is room k under the similarity x ↦ O_k + s_k·x (z scaled too), its
// child hanging `gap` behind its glass, scaled by X = 1/λ, letterboxed in the
// glass (FIT) and set so far behind it that the lens at rest has passed it
// (MARGIN). pose(ζ) is the lens at level ζ: at an integer it sits d₀ in front
// of that plate, square on its glass.
function makeNest(w, h, order, art, K) {
	const F = h / 2 / Math.tan((K.fov * Math.PI) / 360);
	const plate = Math.min(0.62 * h, (0.74 * w) / PHI);
	const d0 = (F * PLATE.H) / plate;
	const rooms = {};
	const room = (d) => (rooms[d] ??= roomOf(d, art, d0));
	const L = order.length - 1;
	const levels = [];
	let O = [0, 0, 0];
	let s = 1;
	for (let k = 0; k <= L; k++) {
		const r = room(order[k]);
		const lv = { ...r, k, O: O.slice(), s };
		levels.push(lv);
		// (the last level too, when the fall comes to rest INSIDE it: its
		// crossing worked out as if its own room hung in its glass, so the
		// lens can go on into it — K.inside of the way — and stop there)
		if (k === L && !(K.inside > 0)) break;
		const G = r.glass;
		const Gc = room(order[Math.min(L, k + 1)]).glass;
		const Dg = d0 - G.z;
		const fh = K.fit * Math.min(G.h, G.w / PHI);
		const kap = (K.margin * d0 * fh) / (PLATE.H * Dg);
		const gap = (kap * Dg) / (1 - kap);
		const X = (fh * (Dg + gap)) / (PLATE.H * Dg);
		lv.X = X;
		lv.gap = gap;
		if (k === L) break;
		const g = [G.x - Gc.x * X, G.y - Gc.y * X, G.z - gap];
		O = [O[0] + s * g[0], O[1] + s * g[1], O[2] + s * g[2]];
		s *= X;
	}
	const pose = (zeta) => {
		let k;
		let loc;
		let sc;
		if (zeta < 0) {
			k = 0;
			sc = Math.pow(levels[0].X, zeta);
			loc = [levels[0].glass.x, levels[0].glass.y, d0 * sc];
		} else if (zeta >= L && !(K.inside > 0)) {
			k = L;
			sc = 1;
			loc = [levels[L].glass.x, levels[L].glass.y, d0];
		} else {
			k = Math.min(L, Math.floor(zeta));
			const lv = levels[k];
			const zp = (lv.glass.z - lv.gap) / (1 - lv.X);
			sc = Math.pow(lv.X, zeta - k);
			loc = [lv.glass.x, lv.glass.y, zp + sc * (d0 - zp)];
		}
		const lv = levels[k];
		return {
			x: lv.O[0] + lv.s * loc[0],
			y: lv.O[1] + lv.s * loc[1],
			z: lv.O[2] + lv.s * loc[2],
			s: lv.s * sc
		};
	};
	// The e-folds of zoom from ζ₀ to ζ, and ζ from them: the crossings are
	// zooms of different sizes, and the fall runs at one pace in e-folds.
	const logs = levels.map((l) => (l.X ? -Math.log(l.X) : 1));
	const ZEND = L + Math.max(0, Math.min(0.9, K.inside || 0)); // where the fall comes to rest
	const efolds = (zeta) => {
		if (zeta < 0) return zeta * logs[0];
		let e = 0;
		for (let k = 0; k < L; k++) {
			if (zeta < k + 1) return e + (zeta - k) * logs[k];
			e += logs[k];
		}
		const past = Math.min(zeta, ZEND) - L; // into the last room, when it lands inside
		return past > 0 ? e + past * logs[L] : e;
	};
	const E0 = efolds(K.zeta0);
	const TOTAL = efolds(ZEND) - E0;
	const zetaOf = (tf) => {
		let lam = tf + E0;
		if (lam < 0) return lam / logs[0];
		for (let k = 0; k < L; k++) {
			if (lam < logs[k]) return k + lam / logs[k];
			lam -= logs[k];
		}
		return Math.min(ZEND, L + lam / logs[L]);
	};
	return { w, h, F, d0, plate, L, levels, pose, TOTAL, zetaOf, ZEND };
}

// ── The pace ─────────────────────────────────────────────────────────────────
// The nest's e-folds (from ζ₀ to the last plate) flown at a pace that gathers
// and lands — speed ∝ (c + x)³ (1 − x)² over the fall's seconds — and ζ read
// back off the e-folds, so the rooms and the background are ONE zoom. rate0
// is the pace at the top, for a flight that must arrive at it.
function fitNest(w, h, order, art, K, beats) {
	const geo = makeNest(w, h, order, art, K);
	const { n, c } = K.pace;
	const T = [0];
	let acc = 0;
	for (let i = 1; i <= n; i++) {
		const x = (i - 0.5) / n;
		acc += Math.pow(c + x, 3) * (1 - x) * (1 - x);
		T.push(acc);
	}
	const E = (x) => {
		const f = clamp01(x) * n;
		const i = Math.min(n - 1, Math.floor(f));
		return lerp(T[i], T[i + 1], f - i) / acc;
	};
	const D = beats.fall[1] - beats.fall[0];
	const rate0 = (geo.TOTAL * (Math.pow(c, 3) / (acc / n))) / D;
	const efolds = (t) => {
		const x = clamp01((t - beats.fall[0]) / D);
		return geo.TOTAL * E(x);
	};
	const zetaAt = (t) => (t < beats.fall[0] ? K.zeta0 : geo.zetaOf(efolds(t)));
	return { ...geo, rate0, efolds, zetaAt };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// The nest's pose, slid from the last glass to the plate's centre as it
// lands, and swaying — with the screen shifted so that the plane d₀ ahead
// holds still: on the landed plate the frame holds and the room drifts
// behind it by depth, the back wall most, the bed least.
// `nudge` ([x, y], room units of the last plate): the lens moved by hand —
// a flow's pointer parallax — the same way the sway moves it, so the plane
// d₀ ahead holds and the room's depths part behind it.
// `sway` (0 … 1) scales the hand's sway: a flow dollying on through the glass
// calms it, so the glass can fill the board (near its plane any shift of the
// lens throws the glass aside).
function lensAt(geo, zeta, t, w, h, B, K = {}, nudge = null, origin = null, sway = 1) {
	const cam = geo.pose(zeta);
	const last = geo.levels[geo.L];
	const land = smooth(span(t, B.land[0], B.land[1]));
	// (landing inside the room, the lens stays on its glass, where it was
	// going; landing at its plate, it slides to the plate's centre)
	if (!(K.inside > 0)) {
		cam.x -= last.s * last.glass.x * land;
		cam.y -= last.s * last.glass.y * land;
	}
	// The push: after the landing, the lens dollies in on the last plate
	// until it fills `fill.h` of the board's height — or `fill.w` of its
	// width, whichever comes first (fill.w over 1 lets an upright board crop
	// the room's sides to keep it large) — over beats.push.
	if (K.fill && B.push) {
		const p = smooth(span(t, B.push[0], B.push[1]));
		if (p > 0) {
			const want = Math.min(K.fill.h * h, ((K.fill.w ?? 0.98) * w) / PHI);
			const k = lerp(1, Math.max(1, want / geo.plate), p);
			const zP = last.O[2];
			cam.z = zP + (cam.z - zP) / k;
		}
	}
	const A =
		sway *
		lerp(
			lerp(0, 0.05, span(t, B.fall[0], B.fall[0] + 2)),
			0.3,
			smooth(span(t, B.land[0], B.land[1] + 0.5))
		);
	const ex = A * Math.sin(1.1 * t - 0.4) + (nudge?.[0] ?? 0);
	const ey = A * 0.45 * Math.sin(1.7 * t + 0.6) + (nudge?.[1] ?? 0);
	cam.x += cam.s * ex;
	cam.y += cam.s * ey;
	cam.ox = (origin?.[0] ?? w / 2) + (geo.F * ex) / geo.d0;
	cam.oy = (origin?.[1] ?? h / 2) - (geo.F * ey) / geo.d0;
	cam.land = land;
	return cam;
}

// The reveal's ring: { cx, cy, r, wob, seed } → its points (closed), the
// same for the clip and for a flow that draws the ring itself.
export function revealRing({ cx, cy, r, wob = 0.04, seed = 0 }, n = 72) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const th = (TAU * i) / n;
		const k = 1 + wob * noise1(2.3 * Math.cos(th) + 5, seed * 7 + 1) * Math.sin(3 * th + seed);
		out.push([cx + r * k * Math.cos(th), cy + r * k * Math.sin(th)]);
	}
	return out;
}

// ── The fall, drawn ──────────────────────────────────────────────────────────
// Every layer is a plane parallel to the lens, so its picture is the drawing
// under one similarity (m px to the plate unit, its origin on screen); a
// level is its plate's frame, the board inside it with a hole where the glass
// is (the background shows through, and the next level hangs in it), its
// back layers, the next level in the glass, then the monitor, desk and bed
// over that. The rooms are chalk; the last floods with colour as the lens
// lands — or, colour along, each carries its share all the way down. Every
// glass the lens has passed is dropped.
function drawFall(
	ctx,
	w,
	h,
	dust,
	geo,
	art,
	cam,
	t,
	B,
	K,
	colourAlong,
	bake,
	reveal = null,
	opts = {}
) {
	const { F, L, levels } = geo;
	const project = (x, y, z) => {
		const d = cam.z - z;
		return [cam.ox + (F * (x - cam.x)) / d, cam.oy - (F * (y - cam.y)) / d, d];
	};
	const plane = (lv, z) => {
		const wz = lv.O[2] + lv.s * z;
		const dw = cam.z - wz;
		if (dw <= K.nearZ * cam.s) return null;
		const m = (F * lv.s) / dw;
		const [e, f] = project(lv.O[0], lv.O[1], wz);
		return { m, e, f };
	};
	const at = (T, x, y) => [T.e + T.m * x, T.f - T.m * y];
	const boxOf = (T, x, y, rw, rh) => {
		const [x0, y0] = at(T, x - rw / 2, y + rh / 2);
		return [x0, y0, x0 + rw * T.m, y0 + rh * T.m];
	};
	const meet = (A, C) => [
		Math.max(A[0], C[0]),
		Math.max(A[1], C[1]),
		Math.min(A[2], C[2]),
		Math.min(A[3], C[3])
	];
	const empty = (X) => X[2] <= X[0] || X[3] <= X[1];
	const pathBox = (X) => ctx.rect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
	const clipBox = (X) => {
		ctx.beginPath();
		pathBox(X);
		ctx.clip();
	};
	const corners = (X) => [
		[X[0], X[1]],
		[X[2], X[1]],
		[X[2], X[3]],
		[X[0], X[3]],
		[X[0], X[1]]
	];
	const board = (X) => {
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
		if (dust) {
			ctx.fillStyle = dust;
			ctx.fillRect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
		}
	};

	// How far a room is coloured in. The flood: only the last, as the lens
	// lands — the bed first and the wall last. Along: room k carries its
	// share, (k/L)^1.5, from the top, and the flood can only add to it.
	const colour = span(t, B.colour[0], B.colour[1]);
	const along = !colourAlong
		? null
		: typeof colourAlong === 'function'
			? colourAlong
			: (k, L) => Math.pow(k / L, 1.5);
	const flood = (k, depth) => {
		if (k !== L) return 0;
		const from = depth * 0.55;
		return smooth(span(colour, from, from + 0.45));
	};
	const paintOf = along ? (k, depth) => Math.max(flood(k, depth), along(k, L)) : flood;

	// One layer: its chalk copy, with the colour under it as it floods (or,
	// along, the two baked into one); the wall mirror-tiled so the lens off
	// its axis never sees past its edge.
	// The colour REVEALED instead of flooded (draw's `reveal`): the last room
	// coloured inside a region spreading from its glass — a hand-drawn ring,
	// boiling — chalk outside it. `rv` is set as the last level is drawn.
	let rv = null;
	let revealed = false;
	const regionPath = (f = 1) => {
		revealRing({ ...rv, r: rv.r * f }).forEach(([x, y], i) =>
			i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
		);
		ctx.closePath();
	};
	const clipRegion = (inside, f = 1) => {
		ctx.beginPath();
		if (!inside) ctx.rect(-10, -10, w + 20, h + 20);
		regionPath(f);
		ctx.clip(inside ? 'nonzero' : 'evenodd');
	};

	// One layer: its chalk copy, with the colour under it as it floods (or,
	// along, the two baked into one); the wall mirror-tiled so the lens off
	// its axis never sees past its edge.
	// (`off` [dx, dy], level units: the layer drawn that far over — a tile)
	const layer = (lv, key, k, box, off = null) => {
		const l = lv.lay[key];
		const a = art[lv.decade]?.[key];
		if (!l || !a) return;
		const T = plane(lv, l.z);
		if (!T) return;
		if (off) {
			T.e += T.m * off[0];
			T.f -= T.m * off[1];
		}
		const rev = rv && k === L;
		// (with a reveal the last room is chalk until it comes, all colour once
		// it has passed the board's corners: no flood)
		const p = rev ? 0 : reveal && k === L ? (revealed ? 1 : 0) : paintOf(k, l.depth);
		const tiles = key === 'bg' ? 1 : 0;
		// mode: null as the flood has it; 'chalk' or 'colour' alone (the reveal)
		const draw = (mode) => {
			for (let j = -tiles; j <= tiles; j++)
				for (let i = -tiles; i <= tiles; i++) {
					const x = l.x + i * l.w;
					const y = l.y + j * l.h;
					const R = boxOf(T, x, y, l.w, l.h);
					if (empty(meet(R, box))) continue;
					const [px, py] = at(T, x, y);
					const sw = l.w * T.m;
					const sh = l.h * T.m;
					const flipX = i % 2 !== 0;
					const flipY = j % 2 !== 0;
					ctx.save();
					if (flipY) {
						ctx.translate(px, py);
						ctx.scale(1, -1);
						ctx.translate(-px, -py);
					}
					if (mode === 'colour') drawImageAt(ctx, a.mips, px, py, sw, sh, { flipX });
					else if (mode === 'chalk') {
						if (a.chalk) drawImageAt(ctx, a.chalk, px, py, sw, sh, { alpha: 0.95, flipX });
					} else if (along && a.chalk && p > 0.002 && p < 0.998) {
						const dpr = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
						drawImageAt(ctx, bake(k, key, a, p, Math.abs(sw) * dpr), px, py, sw, sh, { flipX });
					} else {
						if (p > 0.002) drawImageAt(ctx, a.mips, px, py, sw, sh, { alpha: p, flipX });
						if (a.chalk && p < 0.998)
							drawImageAt(ctx, a.chalk, px, py, sw, sh, { alpha: 0.95 * (1 - p), flipX });
					}
					ctx.restore();
				}
		};
		if (rev) {
			// chalk outside; the colour inside, its edge feathered in three
			// steps (a band 8% of the radius wide) over the chalk
			ctx.save();
			clipRegion(false, 1 - rv.feather);
			draw('chalk');
			ctx.restore();
			// (each step only its own ring, so the colour is laid once over
			// the disc and the two thin rings round it, not three times)
			for (const [f0, f1, a] of [
				[1 - rv.feather / 2, 1, 0.4],
				[1 - rv.feather, 1 - rv.feather / 2, 0.7],
				[0, 1 - rv.feather, 1]
			]) {
				ctx.save();
				ctx.beginPath();
				regionPath(f1);
				if (f0 > 0) regionPath(f0);
				ctx.clip('evenodd');
				ctx.globalAlpha *= a;
				draw('colour');
				ctx.restore();
			}
		} else draw(null);
		// The layer's own rectangle, dashed in: the drawing's construction.
		if (p < 1 && key !== 'bg' && l.w * T.m > 14) {
			if (rev) {
				ctx.save();
				clipRegion(false);
			}
			stroke(ctx, corners(boxOf(T, l.x, l.y, l.w, l.h)), {
				color: PAL.chalk,
				width: 0.9,
				alpha: 0.32 * (1 - p),
				dash: [4, 5]
			});
			if (rev) ctx.restore();
		}
	};

	const glassAt = [];
	const lit = smooth(span(t, B.land[0] + 0.6, B.land[1] + 0.3)) * (1 - (opts.screenOff ?? 0));

	const drawLevel = (k, box) => {
		const lv = levels[k];
		const T0 = plane(lv, 0);
		const frame = T0 ? meet(box, boxOf(T0, 0, 0, PLATE.W, PLATE.H)) : box;
		if (empty(frame)) return;
		const Tg = lv.glass ? plane(lv, lv.glass.z) : null;
		const G = Tg ? boxOf(Tg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		const gb = G ? meet(frame, G) : null;
		const hole = gb && !empty(gb);
		if (k === L && reveal && G) {
			const o = reveal(G);
			rv =
				o && o.r > 0
					? {
							cx: (G[0] + G[2]) / 2,
							cy: (G[1] + G[3]) / 2,
							wob: 0.04,
							seed: 0,
							feather: 0.08,
							...o
						}
					: null;
			// past the board's corners all of it is colour: drawn as such
			if (rv) {
				const far = Math.max(
					Math.hypot(rv.cx, rv.cy),
					Math.hypot(w - rv.cx, rv.cy),
					Math.hypot(rv.cx, h - rv.cy),
					Math.hypot(w - rv.cx, h - rv.cy)
				);
				if (rv.r * (1 - rv.feather) * (1 - rv.wob) > far + 2) {
					rv = null;
					revealed = true;
				}
			}
		}
		if (hole) glassAt[k] = { box: gb, z: lv.O[2] + lv.s * lv.glass.z };
		ctx.save();
		clipBox(frame);
		// The board inside the frame — but not in the glass, where the
		// background shows through — and the back layers on it.
		ctx.save();
		if (hole) {
			ctx.beginPath();
			pathBox(frame);
			pathBox(gb);
			ctx.clip('evenodd');
		}
		board(frame);
		layer(lv, 'bg', k, frame);
		layer(lv, 'poster', k, frame);
		layer(lv, 'clock', k, frame);
		ctx.restore();
		// In the glass: the next plate, or, at the last, the light on.
		if (hole) {
			ctx.save();
			clipBox(gb);
			if (k < L && gb[2] - gb[0] > 2) drawLevel(k + 1, gb);
			else if (k === L) litGlass(ctx, gb, lit);
			ctx.restore();
		}
		layer(lv, 'screen', k, frame);
		layer(lv, 'desk', k, frame);
		layer(lv, 'bed', k, frame);
		if (G) stroke(ctx, corners(G), { color: PAL.chalk, width: 1.2, alpha: 0.55 });
		ctx.restore();
		if (T0)
			stroke(ctx, corners(boxOf(T0, 0, 0, PLATE.W, PLATE.H)), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9
			});
	};

	// THE TESSERACT: the room repeated round itself, a plate over each way,
	// mirrored turn and turn about (as its wallpaper is), fainter — its
	// screens dark (no glass hole: the ground shows), the real room the one
	// in the middle; the lines under the board show through. Drawn for the
	// level the lens is in AND the few behind it, deeper first and fainter
	// with depth, so the corridor is lined with rooms to every side at every
	// depth — the real chain drawn over them down the middle.
	const drawTiles = (k, box, am) => {
		const lv = levels[k];
		const T0 = plane(lv, 0);
		if (!T0) return;
		const R = opts.tiles ?? 0;
		const ta = (opts.tilesAlpha ?? 0.55) * am;
		for (let j = -R; j <= R; j++)
			for (let i = -R; i <= R; i++) {
				if (!i && !j) continue;
				const dx = i * PLATE.W;
				const dy = j * PLATE.H;
				const fb = boxOf(T0, dx, dy, PLATE.W, PLATE.H);
				const fr = meet(box, fb);
				if (empty(fr) || fb[2] - fb[0] < 10) continue;
				const cx = (fb[0] + fb[2]) / 2;
				const cy = (fb[1] + fb[3]) / 2;
				ctx.save();
				ctx.globalAlpha *= ta;
				clipBox(fr);
				if (i % 2) {
					ctx.translate(cx, 0);
					ctx.scale(-1, 1);
					ctx.translate(-cx, 0);
				}
				if (j % 2) {
					ctx.translate(0, cy);
					ctx.scale(1, -1);
					ctx.translate(0, -cy);
				}
				for (const key of ['bg', 'poster', 'clock', 'screen', 'desk', 'bed'])
					layer(lv, key, k, fr, [dx, dy]);
				ctx.restore();
				stroke(ctx, corners(fb), { color: PAL.chalk, width: 1.4, alpha: 0.7 * ta });
			}
	};

	// Which level the lens is in: every glass it has passed is dropped.
	let base = 0;
	for (let k = 0; k < L; k++) {
		const lv = levels[k];
		if (cam.z <= lv.O[2] + lv.s * lv.glass.z + K.nearZ * cam.s) base = k + 1;
		else break;
	}
	if ((opts.tiles ?? 0) > 0)
		for (let k = Math.min(L, base + 3); k >= base; k--)
			drawTiles(k, [0, 0, w, h], Math.pow(0.72, k - base));
	drawLevel(base, [0, 0, w, h]);
	swimmer(ctx, geo, cam, project, t, glassAt, base, B);
	return glassAt;
}

// The last glass, lit: the board in it, and a soft warm light on, the way a
// monitor is lit from inside.
function litGlass(ctx, gb, a) {
	if (a <= 0.003) return;
	const gw = gb[2] - gb[0];
	const gh = gb[3] - gb[1];
	const gx = (gb[0] + gb[2]) / 2;
	const gy = (gb[1] + gb[3]) / 2;
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(gb[0], gb[1], gw, gh);
	ctx.globalAlpha = 0.12 * a;
	ctx.fillStyle = '#fff6e0';
	ctx.fillRect(gb[0], gb[1], gw, gh);
	ctx.restore();
	glow(ctx, gx, gy, 0.8 * Math.max(gw, gh), [255, 238, 205], 0.6 * a);
}

// ── The swimmer ──────────────────────────────────────────────────────────────
// The helix, out of the flash: near the lens and off to the right of the axis
// at first, swimming in toward it and on down the glasses ahead of the lens —
// its axis its own motion, turning on it on the clock — until it pulls away
// through the first glass or two and is gone into the dark, well before the
// room. Drawn through the deepest glass it has passed.
function swimmer(ctx, geo, cam, project, t, glassAt, base, B) {
	const v = span(t, B.swim[0], B.swim[1]);
	if (v <= 0 || v >= 1) return;
	const body = smooth(span(v, 0, 0.2));
	const alpha = 1 - smooth(span(v, 0.74, 1));
	const place = (tt) => {
		const vv = span(tt, B.swim[0], B.swim[1]);
		const z = geo.zetaAt(tt);
		const away = smooth(span(vv, 0.2, 1));
		const off = 1 - smooth(span(vv, 0.1, 0.65));
		const P = geo.pose(z + lerp(0.3, 3, away * away));
		const c = geo.pose(z);
		return [P.x + c.s * 0.55 * off, P.y - c.s * 0.22 * off, P.z];
	};
	const at = place(t);
	const axis = norm(sub3(place(t + 0.06), place(t - 0.06)));
	const away = smooth(span(v, 0.2, 1));
	const size = 0.03 * geo.d0 * cam.s * lerp(1, 0.5, away);
	const dist = cam.z - at[2];
	if (dist <= 0) return;
	const headPx = (geo.F * size) / dist;
	if (headPx < 1.2) return;
	const pose = { at, axis, spin: t * 2.6 * Math.PI, size };
	const cam3 = { project: (p) => project(p[0], p[1], p[2]), pos: [cam.x, cam.y, cam.z] };
	ctx.save();
	for (let k = glassAt.length - 1; k >= base; k--) {
		const g = glassAt[k];
		if (g && at[2] < g.z) {
			ctx.beginPath();
			ctx.rect(g.box[0], g.box[1], g.box[2] - g.box[0], g.box[3] - g.box[1]);
			ctx.clip();
			break;
		}
	}
	drawHelix(ctx, cam3, pose, {
		body,
		alpha,
		color: PAL.chalk,
		width: Math.max(0.8, Math.min(3, headPx * 0.05)),
		core: 0.9,
		glow: 0.5
	});
	ctx.restore();
}
