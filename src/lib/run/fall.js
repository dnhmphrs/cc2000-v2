// ── The fall: into the room, through its glass ───────────────────────────────
// A nest of the rooms' plates (rooms.js), each hanging in the glass of the one
// before — a Droste construction: level k is room k under the similarity
// x ↦ O_k + s_k·x, its child letterboxed in its glass (FIT) and set so far
// behind it that the lens at rest has passed it (MARGIN) — and the lens
// falling plate → glass → plate down it at one pace in e-folds of zoom
// (speed ∝ (c + x)³ (1 − x)^ease), every glass it has passed dropped. The
// run's nest is ONE room, the answer's (orderOf(decade, 0)): the lens falls
// to it and on INTO it, coming to rest inside it, and from there sways on the
// room's depths, the frame holding and the room drifting behind it, the back
// wall most, the bed least.
//
// What is exact: the similarities (a zoom of 1/X per crossing, the e-folds
// summed so the fall runs at one pace through crossings of different sizes),
// the pinhole projection of every layer (a plane parallel to the lens, so its
// picture is the drawing under one similarity). What is a picture: the nest
// itself — a room behind a monitor's glass is a drawing hung in a drawing,
// not a place — and the sway.
//
//   const fall = makeFall({ art, order, beats, zeta0, pace, inside, onePath });
//   const nest = fall.geometry(w, h);       the nest fitted to the board
//   const cam = fall.draw(ctx, w, h, t, { background, colourAlong, nudge,
//     origin, reveal, screenOff, sway, zeta });
//   const box = fall.frameOf(t, w, h, { origin, nudge, zeta, sway });
//
// makeFall: `art` is loadRooms({ chalk: true }); `order` the rooms top to
// bottom, the answer's last; `beats`, in the run's seconds: `fall: [t0, t1]`
// the flight from ζ₀ to rest, `land` the landing, `colour` the last room's
// flood of colour. `zeta0` where the fall starts, before the first plate;
// `pace` { n, c, ease } its speed law; `inside` (0 … 0.9) how far on past the
// last plate, into its glass, the lens comes to rest; `onePath` flies ζ < 0
// on the same path as the first crossing (see pose).
//
// geometry(w, h) (cached by size) gives the nest — `levels`, `pose(ζ)`,
// `TOTAL` e-folds, `ZEND` where it rests, `plateAt(ζ)` and `zetaOfPlate(px)`
// the first plate's height on the board and its inverse, `rate0` the pace
// the fall opens at in e-folds a second (the swim arrives at this rate),
// `efolds(t)`, `zetaAt(t)` — so the run's own zoom runs on into the fall.
//
// draw draws one frame, a pure function of t, and returns the lens: `ox, oy`
// its vanishing point on screen, `land` 0 … 1, `glass` the last room's glass
// on the board. `origin` ([x, y] px) is where the vanishing point sits — the
// tunnel's apex, so the room is LOCKED to it. `background(ctx, cam, zoom,
// alpha)` is called first, under the plates. `nudge` moves the lens by hand
// (the pointer's parallax); `sway` 0 … 1 scales the sway; `zeta` imposes the
// fall's position (the dolly on through the glass at START AGAIN);
// `screenOff` 0 … 1 turns the last screen's own light off. `colourAlong`:
// false is the flood at the landing only; true, colour arriving as you fall.
// `reveal(glassBox)` → { cx, cy, r, wob, feather } or null: the last room's
// colour REVEALED rather than flooded — coloured inside a ring of radius r
// about a point, chalk outside it (the run's porthole).
//
// frameOf is the last room's PLATE on the board as draw would lay it, for
// the window the run cuts onto the room before drawing it.

import { PAL, PHI, TAU, span, smooth, lerp, clamp01, stroke, glow } from './board.js';
import { noise1 } from './hand.js';
import { PLATE, DECADES, roomOf, drawImageAt, pick } from './rooms.js';

// The nest's constants.
const FALL = {
	fov: 34,
	fit: 0.9, // how much of its glass the next plate fills, at rest
	margin: 1.35, // how far past the parent's glass the lens is, at rest
	nearZ: 0.015, // planes nearer than this (in the lens's units) are passed
	zeta0: -0.55, // where the fall starts: this far before the first plate
	crossings: 5, // glasses fallen through: six rooms, the answer's last
	pace: { n: 512, c: 0.35 } // speed ∝ (c + x)³ (1 − x)², tabulated at n
};

// The order of rooms: the other decades cycled over the crossings, the
// answer's last. (The run asks for no crossings: the answer's room alone.)
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
	inside = 0,
	onePath = false
} = {}) {
	const K = {
		inside,
		onePath,
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
			reveal = null,
			nudge = null,
			origin = null,
			screenOff = 0,
			zeta = null,
			sway = 1
		} = {}
	) => {
		const g = geometry(w, h);
		const cam = lensAt(g, zeta ?? g.zetaAt(t), t, w, h, beats, nudge, origin, sway);
		if (background) background(ctx, cam, g.efolds(t), lerp(1, 0.7, cam.land));
		const glassAt = drawFall(ctx, w, h, g, art, cam, t, beats, K, colourAlong, bake, reveal, {
			screenOff
		});
		// The last room's glass on screen ([x0, y0, x1, y1]), once it shows.
		cam.glass = glassAt[g.L] ? glassAt[g.L].box : null;
		return cam;
	};
	// The last room's PLATE on the board this frame, [x0, y0, x1, y1] (CSS
	// px) — or null while it is behind the lens — as draw would lay it with
	// the same options: for the run, which cuts a window onto the room before
	// drawing it (the run's porthole), so the window is the plate's own.
	const frameOf = (t, w, h, { zeta = null, nudge = null, origin = null, sway = 1 } = {}) => {
		const g = geometry(w, h);
		const cam = lensAt(g, zeta ?? g.zetaAt(t), t, w, h, beats, nudge, origin, sway);
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
		// (the last level too: the fall comes to rest INSIDE it, so its
		// crossing is worked out as if its own room hung in its glass, and the
		// lens goes on into it — K.inside of the way — and stops there)
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
	// (`onePath`: before the first glass, ζ < 0, the lens flies the same
	// path as the first crossing — towards the point behind the glass the
	// crossing zooms on — rather than towards the plate's own plane; with the
	// two targets the room's growth on the board stepped up by ~1.9× at
	// ζ = 0, a lurch in the middle of the fall. The run flies one path, 0.23.15.)
	const pose = (zeta) => {
		let k;
		let loc;
		let sc;
		if (zeta < 0 && !(K.onePath && levels[0].X)) {
			k = 0;
			sc = Math.pow(levels[0].X, zeta);
			loc = [levels[0].glass.x, levels[0].glass.y, d0 * sc];
		} else {
			k = Math.max(0, Math.min(L, Math.floor(zeta)));
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
	// The last plate's height on the board at ζ (on its axis, no sway), and
	// ζ back from a height: the plate's size law, whichever path is flown.
	const plateAt = (zeta) => {
		const lv = levels[L];
		const dz = pose(zeta).z - lv.O[2];
		return dz > 0 ? (F * lv.s * PLATE.H) / dz : Infinity;
	};
	const zetaOfPlate = (px) => {
		let lo = -12;
		let hi = ZEND;
		for (let i = 0; i < 60; i++) {
			const mid = (lo + hi) / 2;
			if (plateAt(mid) < px) lo = mid;
			else hi = mid;
		}
		return (lo + hi) / 2;
	};
	return { w, h, F, d0, plate, L, levels, pose, TOTAL, zetaOf, ZEND, plateAt, zetaOfPlate };
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
		acc += Math.pow(c + x, 3) * Math.pow(1 - x, K.pace.ease ?? 2);
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
// the pointer's parallax — the same way the sway moves it, so the plane
// d₀ ahead holds and the room's depths part behind it.
// `sway` (0 … 1) scales the hand's sway: the dolly on through the glass
// calms it, so the glass can fill the board (near its plane any shift of the
// lens throws the glass aside).
function lensAt(geo, zeta, t, w, h, B, nudge = null, origin = null, sway = 1) {
	const cam = geo.pose(zeta);
	// (landing inside the room, the lens stays on its glass, where it was
	// going)
	const land = smooth(span(t, B.land[0], B.land[1]));
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
// same for the clip and for a caller that draws the ring itself.
function revealRing({ cx, cy, r, wob = 0.04, seed = 0 }, n = 72) {
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
function drawFall(ctx, w, h, geo, art, cam, t, B, K, colourAlong, bake, reveal = null, opts = {}) {
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
		// (0.23.4: the wall is drawn ONCE, and the plate past its picture is
		// filled with the wall's own edge colour — it was mirror-tiled, and on
		// a phone, where the wall sits deep behind a plate taller than the
		// board, the tile's marks showed: "the bg should never wrap", the lead)
		const tiles = 0;
		// mode: null as the flood has it; 'chalk' or 'colour' alone (the reveal)
		const draw = (mode) => {
			if (key === 'bg') {
				// the wall's colour under its picture, out to the plate's edge
				const fill = (f, al = 1) => {
					if (!f || al <= 0.002) return;
					ctx.save();
					ctx.globalAlpha *= al;
					ctx.fillStyle = f;
					ctx.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
					ctx.restore();
				};
				if (mode === 'colour') fill(a.fill);
				else if (mode === 'chalk') fill(a.chalkFill, 0.95);
				else {
					if (a.chalk && p < 0.998) fill(a.chalkFill, 0.95 * (1 - p));
					fill(a.fill, p);
				}
			}
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

	// Which level the lens is in: every glass it has passed is dropped.
	let base = 0;
	for (let k = 0; k < L; k++) {
		const lv = levels[k];
		if (cam.z <= lv.O[2] + lv.s * lv.glass.z + K.nearZ * cam.s) base = k + 1;
		else break;
	}
	drawLevel(base, [0, 0, w, h]);
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
