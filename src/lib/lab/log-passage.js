import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	math,
	PAL,
	PHI,
	TAU,
	C,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag
} from './log/board.js';
import { lecture, lit, glow } from './log/ink.js';
import { line3, label3 } from './log/space.js';
import {
	loadRooms,
	roomOf,
	drawRoom,
	pick,
	mips,
	PLATE,
	DECADES,
	DECADE_NAME,
	LAYERS
} from './log/rooms.js';

// ── Sketch: log-passage — moving through separate rooms ──────────────────────
// Round 1 fell through the rooms glass in glass (log-fall); round 2 made one
// room appear (log-arrival). Here the rooms are MANY, in other geometries, and
// the lens moves through them — each geometry closed and open at once — to
// land in the room of the decade asked for (?decade=50s|60s|90s|10s, 90s by
// default), where log-fall lands: the plate centred a little low, 0.62 of the
// board tall, the decade chalked under it, swaying on its depths (drawRoom's
// parallax). Every room on the way is the site's room: six flat drawings at
// six depths, the monitor's glass cut out so the board shows through it. The
// rooms passed through are drawn FLAT (one composite per decade, from a mip
// chain, so a far room is cheap and never shimmers); the landed one is drawn
// in its layers so it can sway. One geometry per ?v=:
//
//   hyperbolic (default) the Circle Limit of rooms. The Poincaré disc tiled by
//              hyperbolic golden rectangles — a quadrilateral with all four
//              angles 60°, so SIX meet at every corner ({4,6}), its half-sides
//              a, b in the ratio φ in hyperbolic measure (sinh a · sinh b =
//              cos 60°, the Lambert quadrilateral) — every tile holding a room
//              (the decades in turn). A room is drawn into its curved tile by
//              the Klein model: the tile is a straight Euclidean rectangle in
//              Klein coordinates, so the drawing's (u, v) is a point of that
//              rectangle, carried to the Poincaré disc (K ↦ K/(1 + √(1 − |K|²)))
//              and then by the tile's isometry; the drawing goes on in a grid
//              of small affine cells (setTransform + clip each), fine for the
//              big tiles and coarse for the small. Tiles are generated from the
//              centre by half-turns about edge midpoints (a half-turn about
//              the midpoint of an edge carries a tile onto its neighbour, and
//              keeps the long edges long: pink for those, cyan for the short,
//              a true two-colouring), the circle ∞ in rose. The lens moves by
//              hyperbolic translations z ↦ (z − p)/(1 − p̄z), p along the
//              geodesic path through the visited rooms' centres (gold, nodes
//              grey), room after room sliding through the centre and shrinking
//              to the rim; the holonomy of the path leaves the last room
//              turned, and a rotation eases that off so it lands upright. Then
//              the disc zooms and the centre tile straightens into the plate.
//   torus      the room is a closed universe: its walls glued left to right,
//              floor to ceiling, and its glass to its own back — T³ = ℝ³/ℤ³,
//              the cell the room's box (2φ × 2 across, d₀ + 3 deep). From
//              inside, that is the room repeated in a lattice of copies at
//              every depth, in perspective, so the lattice of beds slides
//              faster than the lattice of walls as the lens moves; through
//              each copy's glass, the cell behind — the same room again. The
//              lens starts one cell left and one down with a wide lens, and
//              slides diagonally up and across, narrowing to the landing lens
//              (a zoom), through the glued wall — a chalk plane with the
//              arrows of the gluing on it — into the next copy, which is the
//              room. The arrows stay on the landed plate's frame: they are
//              the gluing.
//   wormhole   two rooms joined by an Einstein–Rosen bridge. The first room's
//              glass is a wormhole mouth; behind it, in 3D, the embedding
//              diagram of the Schwarzschild slice — Flamm's paraboloid, z =
//              2√(r_s(r − r_s)), both sheets, the throat r = r_s between them
//              (rings pink, meridians cyan, the throat gold, labelled) — and
//              the lower sheet opens, down its axis, onto the glass of the
//              other room (the decade asked for). The lens dives into the
//              glass, down the funnel, through the throat and out of the
//              lower mouth, and slides off the axis onto the room's centre to
//              land. The pace is log of the distance to the far side, so the
//              dive reads as one zoom.
//   spiral     rooms as the squares of the golden rectangle: a golden rectangle
//              is a square and a smaller golden rectangle, and so on in,
//              spiralling to the point p where the diagonals cross; each square
//              holds a room, letterboxed, the decades in turn. The squares are
//              the images of the first under z ↦ p − i(z − p)/φ — a quarter
//              turn and φ smaller — and the lens is that map run continuously
//              (a loxodromic flow about p), so every square comes to the
//              landed pose in its turn, the golden spiral through the squares'
//              corners stands still on screen while the rooms pour along it,
//              and the lit point is p.
//
// Each motion is one eased path — at rest, gathering pace, easing to land —
// and a pure function of progress, so ?at= pins any frame. Twelve seconds.
//
//   ?decade=60s   which room to land in

const SECONDS = 12;
const FOV = 34; // the landing lens, degrees vertical (log-fall's)

let BOARD = null;

export default async function make({ at }) {
	const v = variant(['hyperbolic', 'torus', 'wormhole', 'spiral']);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	BOARD = b;
	const time = clock(SECONDS, at);
	clearBoard(b);
	tag(b.ctx, b.w, b.h, `log-passage · ${v} · ${decade} · loading the rooms`);
	const t0 = performance.now();
	const art = await loadRooms({ decades: DECADES, chalk: v === 'torus' });
	const loadMs = Math.round(performance.now() - t0);
	const t1 = performance.now();
	// The flat rooms, one composite per decade, as mip chains.
	const flat = {};
	for (const d of DECADES) flat[d] = art[d]?.bg ? mips(flatRoom(art, d, 1280)) : null;
	const prepMs = Math.round(performance.now() - t1);
	// The rooms on the way: the other decades in turn, the asked-for one last.
	const others = DECADES.filter((d) => d !== decade);
	const S = { art, flat, decade, others, v };
	const SETUP = {
		hyperbolic: hyperbolicSetup,
		torus: torusSetup,
		wormhole: wormholeSetup,
		spiral: spiralSetup
	};
	const DRAW = { hyperbolic, torus, wormhole, spiral };
	const info = { seconds: SECONDS, variant: v, decade, loadMs, prepMs, missing: art.missing };
	let geo = null;
	let frames = 0;
	let ms = 0;

	function render() {
		const t = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		if (!geo || geo.w !== w || geo.h !== h) {
			geo = SETUP[v](S, w, h);
			if (geo.info) Object.assign(info, geo.info);
		}
		DRAW[v](ctx, w, h, S, geo, time.u, time.t);
		tag(ctx, w, h, `log-passage · ${v} · ${decade}`);
		ms += performance.now() - t;
		if (++frames === 30) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs; // the lab copies info once
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
// Where log-fall lands: the plate centred a little low (under the lecture),
// 0.62 of the board tall at most. { cx, cy, height } in px.
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: 0.535 * h, height, s: height / 2 };
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

// ── The rooms, flat ──────────────────────────────────────────────────────────
// The room every layer composited into one canvas `px` wide, the glass left
// clear (so the board shows through it wherever the room hangs).
function flatRoom(art, decade, px) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / PHI);
	const x = c.getContext('2d');
	drawRoom(x, art, decade, { cx: c.width / 2, cy: c.height / 2, height: c.height, clip: true });
	return c;
}

// A drawing (a mip chain) on a curved patch: cut into nx × ny cells, each
// drawn under the affine map fitting its four corners' screen positions and
// clipped to them (pushed out a little, so the cells close without hairlines).
// `at(u, v)` → [sx, sy] for a point of the drawing (u right, v down, 0..1),
// or null to cull. `px` the drawing's span on screen, to pick the mip.
function warp(ctx, m, at, nx, ny, px, dpr, alpha = 1) {
	if (alpha <= 0.002) return;
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
			if (!a || !b || !c || !d) continue;
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

// One flat drawing (a mip chain) centred at (cx, cy), w × h px, turned `rot`
// radians counter-clockwise on screen, at `alpha` — culled when off the board.
function blit(ctx, m, cx, cy, w, h, rot, alpha, vw, vh) {
	if (alpha <= 0.002 || w < 0.6 || h < 0.6) return;
	const r = Math.hypot(w, h) / 2;
	if (cx + r < 0 || cx - r > vw || cy + r < 0 || cy - r > vh) return;
	const dpr = BOARD.dpr;
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.translate(cx, cy);
	if (rot) ctx.rotate(-rot);
	ctx.drawImage(pick(m, w * dpr), -w / 2, -h / 2, w, h);
	ctx.restore();
}

// ── Chalk ────────────────────────────────────────────────────────────────────
const closed = (P) => [...P, P[0]];
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

// The plate's chalk frame round a room at { cx, cy, height, rot }, written
// on with `frame`, and under it, as log-fall captions it, the decade at the
// left and a last word at the right (`cap` writes them).
function plateFrame(ctx, V, decade, { frame = 1, cap = 0, right = '', a = 0.9, dash = null }) {
	const s = V.height / 2;
	const rot = V.rot ?? 0;
	if (frame > 0 && a > 0)
		stroke(ctx, closed(rectQuad(V.cx, V.cy, PLATE.W * s, PLATE.H * s, rot)), {
			color: PAL.chalk,
			width: 1.8,
			alpha: a,
			upto: frame,
			dash
		});
	if (cap <= 0) return;
	const sz = Math.min(0.085 * s, 30);
	const c = Math.cos(rot);
	const sn = Math.sin(rot);
	const at = (x, y) => [V.cx + s * (c * x - sn * y), V.cy - s * (sn * x + c * y)];
	const [lx, ly] = at(-PLATE.W / 2, -PLATE.H / 2 - 0.11);
	const [rx, ry] = at(PLATE.W / 2, -PLATE.H / 2 - 0.11);
	ctx.save();
	ctx.translate(lx, ly);
	ctx.rotate(-rot);
	math(ctx, DECADE_NAME[decade], 0, 0, { size: sz, alpha: 0.9 * cap, upto: cap });
	ctx.restore();
	if (right) {
		ctx.save();
		ctx.translate(rx, ry);
		ctx.rotate(-rot);
		math(ctx, right, 0, 0, {
			size: Math.min(sz * 0.8, 24),
			alpha: 0.75 * cap,
			color: PAL.chalkDim,
			align: 'right'
		});
		ctx.restore();
	}
}

// The lecture (ink.js's), its letters haloed in board rather than set on a
// patch of it: over rooms a patch is a slab, a halo only a shadow.
function notes(ctx, w, h, lines) {
	ctx.save();
	ctx.shadowColor = 'rgba(21, 21, 21, 0.95)';
	ctx.shadowBlur = 10;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.shadowBlur = 4;
	lecture(ctx, w, h, lines, { back: 0 });
	ctx.restore();
}

// The landed room: drawRoom in its layers, slid by the sway, the board in
// its glass, the decade typed into the glass as the site writes the answer
// there (`write` 0..1), the glass faintly lit.
function landed(ctx, S, V, par, { alpha = 1, write = 0, glowk = 0 } = {}) {
	const G = drawRoom(ctx, S.art, S.decade, {
		cx: V.cx,
		cy: V.cy,
		height: V.height,
		rot: V.rot ?? 0,
		parallax: par,
		alpha
	});
	if (!G) return null;
	ctx.save();
	ctx.beginPath();
	const Q = rectQuad(G.cx, G.cy, G.w, G.h, G.rot);
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < 4; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
	ctx.clip();
	if (glowk > 0) glow(ctx, G.cx, G.cy, 0.62 * Math.min(G.w, G.h), [255, 220, 150], 0.3 * glowk);
	if (write > 0) {
		ctx.translate(G.cx, G.cy);
		ctx.rotate(-G.rot);
		math(ctx, DECADE_NAME[S.decade], 0, 0, {
			size: Math.min(0.2 * G.h, 64),
			upto: write,
			align: 'center',
			alpha: 0.95
		});
	}
	ctx.restore();
	return G;
}

// A lit point: the gold disc with a cream core, haloed.
const point = (ctx, x, y, r, a = 1) => lit(ctx, x, y, r, a);

// ── 3D, for the torus and the wormhole ───────────────────────────────────────
// A lens on the −z axis, no roll: project [x, y, z] → [sx, sy, d], d the
// depth in front; `shift` moves the principal point so a plane d₀ ahead
// holds still while the lens sways (the frame holds, the room drifts).
function lens(w, h, cam, fov, oy = 0.535) {
	const F = h / 2 / Math.tan((fov * Math.PI) / 360);
	const ox = w / 2 + (cam.sx ?? 0);
	const cy = oy * h + (cam.sy ?? 0);
	return {
		F,
		cam,
		project: (x, y, z) => {
			const d = cam.z - z;
			return [ox + (F * (x - cam.x)) / d, cy - (F * (y - cam.y)) / d, d];
		}
	};
}

// A layer: a drawing (a mip chain) lw × lh world units, centred at [x, y, z]
// facing the lens — a similarity on screen. Culled when behind or off.
function layer3(ctx, L, m, x, y, z, lw, lh, alpha, vw, vh) {
	const [sx, sy, d] = L.project(x, y, z);
	if (d < 0.02) return null;
	const k = L.F / d;
	blit(ctx, m, sx, sy, lw * k, lh * k, 0, alpha, vw, vh);
	return [sx, sy, lw * k, lh * k];
}

// A room's six layers in 3D: its plate at origin O (frame plane z = O[2]),
// laid out by roomOf with the landing lens's d₀ (so the landing lens sees
// the flat composition); clipped to its frame; the glass region first painted
// board and handed to `inGlass(rect)` (the next cell, a bridge) before the
// screen goes over it. Returns the glass rect on screen.
function room3(ctx, L, S, decade, O, { d0, vw, vh, alpha = 1, clip = true, inGlass = null }) {
	const R = roomOf(decade, S.art, d0);
	ctx.save();
	let frame = null;
	// Clipped to its frame — unless the frame's plane is behind the lens
	// already, when the lens is inside the room and the frame clips nothing.
	if (clip) {
		const [fx, fy, d] = L.project(O[0], O[1], O[2]);
		if (d > 0.02) {
			const k = L.F / d;
			frame = [fx, fy, PLATE.W * k, PLATE.H * k];
			ctx.beginPath();
			ctx.rect(fx - frame[2] / 2, fy - frame[3] / 2, frame[2], frame[3]);
			ctx.clip();
		}
	}
	let G = null;
	for (const cfg of LAYERS) {
		const l = R.lay[cfg.key];
		const a = S.art[decade]?.[cfg.key];
		if (!l || !a) continue;
		if (cfg.key === 'screen' && R.glass) {
			const g = R.glass;
			const [gx, gy, d] = L.project(O[0] + g.x, O[1] + g.y, O[2] + g.z);
			if (d > 0.02) {
				const k = L.F / d;
				G = [gx, gy, g.w * k, g.h * k];
				ctx.save();
				ctx.beginPath();
				ctx.rect(gx - G[2] / 2 - 0.5, gy - G[3] / 2 - 0.5, G[2] + 1, G[3] + 1);
				ctx.clip();
				ctx.globalAlpha = alpha;
				ctx.fillStyle = PAL.ground;
				ctx.fillRect(gx - G[2] / 2 - 1, gy - G[3] / 2 - 1, G[2] + 2, G[3] + 2);
				if (BOARD.dust) {
					ctx.fillStyle = BOARD.dust;
					ctx.fillRect(gx - G[2] / 2 - 1, gy - G[3] / 2 - 1, G[2] + 2, G[3] + 2);
				}
				ctx.globalAlpha = 1;
				if (inGlass && G[2] > 3) inGlass(G);
				ctx.restore();
			}
		}
		layer3(ctx, L, a.mips, O[0] + l.x, O[1] + l.y, O[2] + l.z, l.w, l.h, alpha, vw, vh);
	}
	ctx.restore();
	return { G, frame };
}

// An offscreen layer: what is drawn into it is laid on the board at one
// alpha, so a set of cells that close by overlapping does not double up.
let LAYER = null;
function withLayer(ctx, alpha, draw) {
	if (alpha >= 0.985) return draw(ctx);
	if (alpha <= 0.003) return;
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
	x.setTransform(BOARD.dpr, 0, 0, BOARD.dpr, 0, 0);
	draw(x);
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = alpha;
	ctx.drawImage(LAYER, 0, 0);
	ctx.restore();
}

// ── Möbius maps of the disc, as [a, b, c, d] ─────────────────────────────────
const Mob = {
	id: [
		[1, 0],
		[0, 0],
		[0, 0],
		[1, 0]
	],
	mul: (M, N) => [
		C.add(C.mul(M[0], N[0]), C.mul(M[1], N[2])),
		C.add(C.mul(M[0], N[1]), C.mul(M[1], N[3])),
		C.add(C.mul(M[2], N[0]), C.mul(M[3], N[2])),
		C.add(C.mul(M[2], N[1]), C.mul(M[3], N[3]))
	],
	at: (M, z) => C.mobius(z, M),
	// The translation taking p to 0: z ↦ (z − p)/(1 − p̄z); and its inverse.
	to0: (p) => [
		[1, 0],
		[-p[0], -p[1]],
		[-p[0], p[1]],
		[1, 0]
	],
	from0: (m) => [[1, 0], m, [m[0], -m[1]], [1, 0]],
	rot: (t) => [
		[Math.cos(t), Math.sin(t)],
		[0, 0],
		[0, 0],
		[1, 0]
	],
	// The half-turn about m: carries a tile onto its neighbour across the
	// edge m is the midpoint of.
	half: (m) => Mob.mul(Mob.mul(Mob.from0(m), Mob.rot(Math.PI)), Mob.to0(m)),
	// M′(0): how the map turns and scales at the centre.
	deriv0: (M) => C.div(C.sub(C.mul(M[0], M[3]), C.mul(M[1], M[2])), C.mul(M[3], M[3]))
};
// Klein → Poincaré: the same point of the hyperbolic plane in either model.
const kp = ([x, y]) => {
	const d = 1 + Math.sqrt(Math.max(0, 1 - x * x - y * y));
	return [x / d, y / d];
};
const key2 = (z) => `${Math.round(z[0] * 2000)},${Math.round(z[1] * 2000)}`;

// ── hyperbolic ───────────────────────────────────────────────────────────────
const HY = {
	R: 0.47, // the disc's radius, of the board's height
	path: ['right', 'top', 'right'], // the edges the lens crosses, in turn
	rim: 0.993, // tiles whose centre is further out are not made
	depth: 7
};

function hyperbolicSetup(S, w, h) {
	// The tile: half-sides a = φb, b with sinh a · sinh b = cos 60° (the
	// Lambert quadrilateral the tile's quarter is), by bisection.
	let lo = 0.1;
	let hi = 1.5;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (Math.sinh(PHI * mid) * Math.sinh(mid) < 0.5) lo = mid;
		else hi = mid;
	}
	const b = (lo + hi) / 2;
	const a = PHI * b;
	const A = Math.tanh(a); // Klein half-sides
	const B = Math.tanh(b);
	const ap = Math.tanh(a / 2); // Poincaré, along the axes
	const bp = Math.tanh(b / 2);
	const MID = { right: [ap, 0], left: [-ap, 0], top: [0, bp], bottom: [0, -bp] };

	// The tiles, from the centre out, by half-turns about edge midpoints.
	const tiles = [];
	const seen = new Map();
	const add = (M, depth) => {
		const c = Mob.at(M, [0, 0]);
		const k = key2(c);
		if (seen.has(k)) return seen.get(k);
		if (Math.hypot(c[0], c[1]) > HY.rim) return null;
		// Turned so the room is as upright as it can be (the tile is a
		// rectangle, so only a half-turn is open to it).
		const tilt = C.arg(Mob.deriv0(M));
		if (Math.abs(tilt) > Math.PI / 2) M = Mob.mul(M, Mob.rot(Math.PI));
		const t = { M, c, depth, i: tiles.length, scale: C.abs(Mob.deriv0(M)) };
		tiles.push(t);
		seen.set(k, t);
		return t;
	};
	add(Mob.id, 0);
	for (let qi = 0; qi < tiles.length && tiles.length < 420; qi++) {
		const t = tiles[qi];
		if (t.depth >= HY.depth) continue;
		for (const e of ['right', 'top', 'left', 'bottom'])
			add(Mob.mul(Mob.half(Mob.at(t.M, MID[e])), t.M), t.depth + 1);
	}
	// The edges, each once, coloured by its kind: long edges pink, short cyan.
	const edges = [];
	const eseen = new Set();
	for (const t of tiles)
		for (const e of ['right', 'top', 'left', 'bottom']) {
			const k = key2(Mob.at(t.M, MID[e]));
			if (eseen.has(k)) continue;
			eseen.add(k);
			const long = e === 'right' || e === 'left';
			const pts = [];
			for (let i = 0; i <= 10; i++) {
				const s = -1 + (2 * i) / 10;
				const K = long ? [e === 'right' ? A : -A, B * s] : [A * s, e === 'top' ? B : -B];
				pts.push(Mob.at(t.M, kp(K)));
			}
			edges.push({ pts, color: long ? PAL.pink : PAL.cyan, scale: t.scale });
		}
	// The path: across the edges named, from the centre tile.
	const path = [tiles[0]];
	let M = Mob.id;
	for (const e of HY.path) {
		M = Mob.mul(Mob.half(Mob.at(M, MID[e])), M);
		path.push(seen.get(key2(Mob.at(M, [0, 0]))));
	}
	const K = path.length - 1;
	// The decades: the path in turn, the asked-for last; the rest cycling.
	const order = [...S.others.slice(0, K), S.decade];
	for (const t of tiles) t.decade = DECADES[t.i % DECADES.length];
	path.forEach((t, j) => (t.decade = order[j % order.length]));
	// Its geodesic legs: in the frame with c_j at 0 the next centre is q, and
	// the geodesic the straight segment to it; the lens's position at a
	// fraction s of the leg is that, carried back.
	const legs = [];
	for (let j = 0; j < K; j++) {
		const q = Mob.at(Mob.to0(path[j].c), path[j + 1].c);
		const r = C.abs(q);
		legs.push({ c: path[j].c, dir: C.scale(q, 1 / r), d: 2 * Math.atanh(r) });
	}
	const total = legs.reduce((s, l) => s + l.d, 0);
	const pos = (e) => {
		let left = e * total;
		for (const l of legs) {
			if (left <= l.d) return Mob.at(Mob.from0(l.c), C.scale(l.dir, Math.tanh(left / 2)));
			left -= l.d;
		}
		return path[K].c;
	};
	// The last room's tilt, seen from its centre, which the lens eases off.
	const last = path[K];
	const thetaEnd = -C.arg(Mob.deriv0(Mob.mul(Mob.to0(last.c), last.M)));
	// The path's polyline, for the gold.
	const gold = [];
	for (let j = 0; j < K; j++) {
		const l = legs[j];
		for (let i = 0; i <= 24; i++)
			gold.push(Mob.at(Mob.from0(l.c), C.scale(l.dir, Math.tanh((l.d * i) / 48))));
	}
	const pace = paceOf(3, 0.2);
	return {
		w,
		h,
		A,
		B,
		ap,
		bp,
		tiles,
		edges,
		path,
		K,
		pos,
		pace,
		thetaEnd,
		gold,
		info: { tiles: tiles.length, edges: edges.length, a: +a.toFixed(3), b: +b.toFixed(3) }
	};
}

function hyperbolic(ctx, w, h, S, geo, u, secs) {
	const { A, B, ap, bp, tiles, edges, path, K, pos, pace, thetaEnd, gold } = geo;
	const dpr = BOARD.dpr;
	const L = landing(w, h);
	const O = [L.cx, L.cy];
	// The disc zooms as the lens lands, so the centre tile is the plate's size.
	const Zend = L.s / (HY.R * h * bp);
	const zoom = Math.exp(Math.log(Zend) * smooth(span(u, 0.6, 0.92)));
	const R = HY.R * h * zoom;
	// The lens: the translation taking its position to 0, and the turn that
	// lands the last room upright.
	const p = pos(pace(span(u, 0.02, 0.9)));
	const theta = thetaEnd * smooth(span(u, 0.5, 0.88));
	const G = Mob.mul(Mob.rot(theta), Mob.to0(p));
	const show = smooth(span(u, 0, 0.1));
	const others = 1 - smooth(span(u, 0.8, 0.94));
	const flat = smooth(span(u, 0.86, 0.95));
	const last = path[K];
	const toScreen = (z) => [O[0] + R * z[0], O[1] - R * z[1]];
	const flatAt = (x, y) => [L.cx + (x - 0.5) * PLATE.W * L.s, L.cy + (y - 0.5) * PLATE.H * L.s];

	// A tile's room: its drawing warped into its tile through the lens.
	const tile = (x, t, alpha) => {
		const M = Mob.mul(G, t.M);
		const pc = toScreen(Mob.at(M, [0, 0]));
		const pr = toScreen(Mob.at(M, [ap, 0]));
		const pt = toScreen(Mob.at(M, [0, bp]));
		const ex = Math.hypot(pr[0] - pc[0], pr[1] - pc[1]);
		const ey = Math.hypot(pt[0] - pc[0], pt[1] - pc[1]);
		if (Math.max(ex, ey) < 2.2) return null;
		if (
			pc[0] + 2 * ex < -10 ||
			pc[0] - 2 * ex > w + 10 ||
			pc[1] + 2 * ex < -10 ||
			pc[1] - 2 * ex > h + 10
		)
			return null;
		const nx = Math.max(1, Math.min(14, Math.round(ex / 22)));
		const ny = Math.max(1, Math.min(9, Math.round(ey / 22)));
		const isLast = t === last;
		const at = (uu, vv) => {
			const q = toScreen(Mob.at(M, kp([A * (2 * uu - 1), B * (1 - 2 * vv)])));
			if (!isLast || flat <= 0) return q;
			const f = flatAt(uu, vv);
			return [lerp(q[0], f[0], flat), lerp(q[1], f[1], flat)];
		};
		warp(x, S.flat[t.decade], at, nx, ny, 2 * ex, dpr, alpha);
		return { pc, pr, pt, ex, ey, M };
	};

	// The other rooms (a layer while they fade), then the last.
	const drawn = new Map();
	// The centre tile is there from the first frame; the rest come in round
	// it (drawn straight on, faint: a layer is not worth its cost there), and
	// go out through a layer as the lens lands, so their cells do not double.
	if (show < 1) drawn.set(tiles[0], tile(ctx, tiles[0], 1));
	const rest = (x, a) => {
		for (const t of tiles) {
			if (t === last || (show < 1 && t === tiles[0])) continue;
			const r = tile(x, t, a);
			if (r) drawn.set(t, r);
		}
	};
	if (show < 1) rest(ctx, show);
	else withLayer(ctx, others, (x) => rest(x, 1));
	let landedG = null;
	if (flat >= 1) {
		const par = sway(L.s, secs, smooth(span(u, 0.93, 1)));
		landedG = landed(ctx, S, L, par, { write: span(u, 0.95, 1), glowk: span(u, 0.95, 1) });
	} else drawn.set(last, tile(ctx, last, 1));

	// The chalk: the edges (fading as the rooms do), the circle ∞, the path.
	const ea = show * others;
	if (ea > 0.003) {
		for (const e of edges) {
			if (e.scale * R * bp < 1.2) continue;
			const P = e.pts.map((z) => toScreen(Mob.at(G, z)));
			if (P.every(([x, y]) => x < -4 || x > w + 4 || y < -4 || y > h + 4)) continue;
			stroke(ctx, P, { color: e.color, width: 1.3, alpha: 0.8 * ea });
		}
		const circ = [];
		for (let i = 0; i <= 180; i++)
			circ.push([O[0] + R * Math.cos((TAU * i) / 180), O[1] - R * Math.sin((TAU * i) / 180)]);
		stroke(ctx, circ, { color: PAL.rose, width: 2, alpha: 0.85 * ea, upto: span(u, 0, 0.12) });
		if (R < 0.9 * h)
			math(ctx, '∞', O[0] + R * 0.72 + 10, O[1] - R * 0.72 - 10, {
				size: 24,
				alpha: ea * span(u, 0.1, 0.16),
				color: PAL.rose
			});
		// The path through the rooms' centres, gold, written on; nodes grey.
		const gp = gold.map((z) => toScreen(Mob.at(G, z)));
		stroke(ctx, gp, { color: PAL.gold, width: 2.4, alpha: 0.9 * ea, upto: span(u, 0.1, 0.3) });
		path.forEach((t, j) => {
			const q = toScreen(Mob.at(G, t.c));
			const d = drawn.get(t);
			const r = d ? Math.min(6, Math.max(2, d.ey * 0.04)) : 2;
			disc(ctx, q[0], q[1], r, {
				fill: PAL.node,
				alpha: 0.95 * ea * span(u, 0.1 + 0.05 * j, 0.16 + 0.05 * j)
			});
		});
		// The decade under every room big enough to read.
		for (const [t, d] of drawn) {
			if (!d || d.ey < 50) continue;
			const M = d.M;
			const base = toScreen(Mob.at(M, kp([-A * 0.98, -B])));
			const dir = toScreen(Mob.at(M, kp([-A * 0.5, -B])));
			const ang = Math.atan2(dir[1] - base[1], dir[0] - base[0]);
			const fade = t === last ? 1 - flat : ea;
			ctx.save();
			ctx.translate(base[0], base[1]);
			ctx.rotate(ang);
			math(ctx, DECADE_NAME[t.decade], 0, 0.11 * d.ey + 6, {
				size: Math.min(0.17 * d.ey, 22),
				alpha: 0.85 * fade * span(u, 0.05, 0.12)
			});
			ctx.restore();
		}
	}
	if (landedG || flat > 0)
		plateFrame(ctx, L, S.decade, {
			frame: flat,
			cap: span(u, 0.94, 0.99),
			right: 'd(0, ∂) = ∞'
		});
	notes(ctx, w, h, [
		['z ↦ (z − p) / (1 − p̄z)', span(u, 0.04, 0.16)],
		['{4,6}:  six rooms at every corner, 60° each;  sinh a · sinh b = ½', span(u, 0.2, 0.38)],
		['infinitely many rooms, a finite disc', span(u, 0.44, 0.58)]
	]);
}

// ── spiral ───────────────────────────────────────────────────────────────────
// World units: the first square is [0, 1]², the golden rectangle [0, φ] × [0,
// 1] round it; T(z) = p − i(z − p)/φ carries the rectangle onto the smaller
// one standing in its right part, and the square onto the next square; p is
// where the diagonals cross. Square k is T^k(square 0); the lens is T^{−ζ},
// continuous, so square ζ sits in the landed pose.
const SP = { from: -1, K: 3, beyond: 9 };
const POLE = (() => {
	const x = (1 + 1 / PHI) / (1 + 1 / (PHI * PHI));
	return [x, 1 - x / PHI];
})();
// T^t as a similarity about p: scale φ^{−t}, turn −tπ/2.
const Tpow = (t) => ({ s: Math.pow(PHI, -t), r: (-t * Math.PI) / 2 });
const applyT = ({ s, r }, [x, y]) => {
	const dx = x - POLE[0];
	const dy = y - POLE[1];
	return [
		POLE[0] + s * (Math.cos(r) * dx - Math.sin(r) * dy),
		POLE[1] + s * (Math.sin(r) * dx + Math.cos(r) * dy)
	];
};

function spiralSetup(S, w, h) {
	const K = SP.K;
	const order = [];
	for (let k = SP.from; k <= K + SP.beyond; k++)
		order.push(k === K ? S.decade : S.others[(k - SP.from) % S.others.length]);
	// The spiral through the squares' corners: the orbit of (0, 1) under T^t.
	const curve = [];
	for (let i = 0; i <= 420; i++)
		curve.push(applyT(Tpow(SP.from - 1 + ((K + SP.beyond + 3) * i) / 420), [0, 1]));
	return { w, h, K, order, curve, pace: paceOf(3, 0.2) };
}

function spiral(ctx, w, h, S, geo, u, secs) {
	const { K, order, curve, pace } = geo;
	const L = landing(w, h);
	const zeta = SP.from + (K - SP.from) * pace(span(u, 0.02, 0.9));
	// The lens: world → screen, square ζ at the landed pose. The landed room
	// is letterboxed in its square, so the square's side is φ × the plate's
	// height; the square's centre is the plate's.
	const side = PLATE.W * L.s;
	const cam = Tpow(-zeta); // T^{−ζ}: square ζ → square 0
	const toScreen = (z) => {
		const q = applyT(cam, z); // in square-0 world units
		return [L.cx + (q[0] - 0.5) * side, L.cy - (q[1] - 0.5) * side];
	};
	const land = smooth(span(u, 0.86, 1));
	const show = smooth(span(u, 0, 0.07));

	// The squares, big to small: each a chalk square with its room in it.
	const vw = w;
	const vh = h;
	let lastV = null;
	for (let k = SP.from, i = 0; k <= K + SP.beyond; k++, i++) {
		const Tk = Tpow(k);
		const c = toScreen(applyT(Tk, [0.5, 0.5]));
		const e = toScreen(applyT(Tk, [1, 0.5]));
		const sidePx = 2 * Math.hypot(e[0] - c[0], e[1] - c[1]);
		if (sidePx < 2) break;
		const rot = Math.atan2(-(e[1] - c[1]), e[0] - c[0]); // ccw on screen
		const r = sidePx * 0.71;
		if (c[0] + r < 0 || c[0] - r > vw || c[1] + r < 0 || c[1] - r > vh) continue;
		const V = { cx: c[0], cy: c[1], height: sidePx / PHI, rot };
		const near = k === K;
		const a = k === SP.from ? 1 : show;
		if (near && zeta > K - 0.5) lastV = V;
		else blit(ctx, S.flat[order[i]], c[0], c[1], sidePx, sidePx / PHI, rot, a, vw, vh);
		stroke(ctx, closed(rectQuad(c[0], c[1], sidePx, sidePx, rot)), {
			color: PAL.chalk,
			width: 1.4,
			alpha: 0.7 * a * (near ? 1 - land : 1),
			upto: k === SP.from ? 1 : span(u, 0, 0.1)
		});
		if (sidePx > 90 && !(near && land > 0))
			plateFrame(ctx, V, order[i], { frame: 0, cap: a * span(u, 0.04, 0.1), right: `${k}` });
	}
	// The landed room in its layers, swaying, once the lens is on it.
	if (lastV) {
		const par = sway(L.s, secs, land);
		landed(ctx, S, lastV, par, { write: span(u, 0.94, 1), glowk: span(u, 0.94, 1) });
		plateFrame(ctx, lastV, S.decade, { frame: land, cap: span(u, 0.92, 0.98), right: `ζ = ${K}` });
	}
	// The golden spiral, gold, standing still on screen; the corners grey;
	// the pole lit.
	const sp = span(u, 0.06, 0.2) * (1 - 0.8 * land);
	if (sp > 0) {
		const P = curve
			.map(toScreen)
			.filter(([x, y]) => x > -50 && x < w + 50 && y > -50 && y < h + 50);
		stroke(ctx, P, { color: PAL.gold, width: 2.4, alpha: 0.9 * sp, upto: span(u, 0.06, 0.26) });
		for (let k = SP.from; k <= K + 4; k++) {
			const q = toScreen(applyT(Tpow(k), [0, 1]));
			const r = Math.min(6, 6 * Math.pow(PHI, zeta - k));
			if (r > 1.2) disc(ctx, q[0], q[1], r, { fill: PAL.node, alpha: 0.9 * sp });
		}
		const pp = toScreen(POLE);
		point(ctx, pp[0], pp[1], 5, sp);
		math(ctx, 'p', pp[0] + 10, pp[1] - 12, { size: 20, alpha: sp * span(u, 0.14, 0.2) });
	}
	notes(ctx, w, h, [
		['z ↦ p − i (z − p) / φ:  a quarter turn, and φ smaller', span(u, 0.04, 0.18)],
		['a square, and the rest is golden again — all the way in to p', span(u, 0.24, 0.4)],
		[`ζ = ${K}:  ${DECADE_NAME[S.decade]}`, span(u, 0.86, 0.94)]
	]);
}

// ── torus ────────────────────────────────────────────────────────────────────
// The cell: the room's box, PLATE.W × PLATE.H across and d₀ + DEPTH deep (the
// landing lens sits on its front face). Glued, the universe is the lattice
// of its copies; only the one room is drawn, at every lattice point. Through
// each copy's glass, the cell behind it (the lattice a cell deeper).
const TO = { fovWide: 80, from: [-1, -1], arrows: true, colour: 1 };

function torusSetup(S, w, h) {
	const L = landing(w, h);
	const F0 = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const d0 = (F0 * PLATE.H) / L.height;
	const Dz = PLATE.DEPTH + d0;
	const R = roomOf(S.decade, S.art, d0);
	const Fw = h / 2 / Math.tan((TO.fovWide * Math.PI) / 360);
	return {
		w,
		h,
		L,
		d0,
		Dz,
		R,
		F0,
		Fw,
		pace: paceOf(3, 0.2),
		info: { d0: +d0.toFixed(2), Dz: +Dz.toFixed(2) }
	};
}

function torus(ctx, w, h, S, geo, u, secs) {
	const { L, d0, Dz, R, F0, Fw, pace } = geo;
	const W = PLATE.W;
	const H = PLATE.H;
	const e = pace(span(u, 0.02, 0.9));
	// The lens: from a cell left and down, with a wide lens, sliding up and
	// across and narrowing to the landing lens; then the sway, the frame held.
	const F = Fw * Math.exp(Math.log(F0 / Fw) * e);
	const fov = (Math.atan(h / 2 / F) * 360) / Math.PI;
	const amp = smooth(span(u, 0.88, 1));
	const ex = 0.32 * amp * Math.sin(1.1 * secs - 0.4);
	const ey = 0.45 * 0.32 * amp * Math.sin(1.7 * secs + 0.6);
	const cam = {
		x: TO.from[0] * W * (1 - e) + ex,
		y: TO.from[1] * H * (1 - e) + ey,
		z: d0 - 0.02,
		sx: (F * ex) / d0,
		sy: (-F * ey) / d0
	};
	const Lz = lens(w, h, cam, fov);
	const vw = w;
	const vh = h;
	const m = S.art[S.decade];

	// The copies in view: as far as the back wall's plane can be seen.
	const reach = (cam.z + PLATE.DEPTH + 0.3) / F;
	const hx = (w / 2 + Math.abs(cam.sx)) * reach + W / 2;
	const hy = (h / 2 + Math.abs(cam.sy)) * reach + H / 2;
	const I = [Math.floor((cam.x - hx) / W + 0.5), Math.ceil((cam.x + hx) / W - 0.5)];
	const J = [Math.floor((cam.y - hy) / H + 0.5), Math.ceil((cam.y + hy) / H - 0.5)];
	const copies = [];
	for (let j = J[0]; j <= J[1]; j++) for (let i = I[0]; i <= I[1]; i++) copies.push([i, j]);

	// The lattice, a layer at a time across every copy (a bed that runs past
	// its cell runs into the next, over that copy's wall, as it does in the
	// glued room), the wall clipped to its cell; `dz` the cell behind.
	const hits = (r, g) =>
		r &&
		r[0] + r[2] / 2 > g[0] - g[2] / 2 &&
		r[0] - r[2] / 2 < g[0] + g[2] / 2 &&
		r[1] + r[3] / 2 > g[1] - g[3] / 2 &&
		r[1] - r[3] / 2 < g[1] + g[3] / 2;
	const lattice = (cells, dz, box, glassWindows) => {
		for (const cfg of LAYERS) {
			const l = R.lay[cfg.key];
			const a = m?.[cfg.key];
			if (!l || !a) continue;
			if (cfg.key === 'screen' && glassWindows) glassWindows();
			for (const [i, j] of cells) {
				const x = i * W + l.x;
				const y = j * H + l.y;
				const z = l.z - dz;
				if (box) {
					const [sx, sy, d] = Lz.project(x, y, z);
					if (d < 0.02 || !hits([sx, sy, (l.w * Lz.F) / d, (l.h * Lz.F) / d], box)) continue;
				}
				// Colour where the lens is, chalk elsewhere — the colour flows
				// into the copy the lens is entering, so no copy ever switches.
				const dist = Math.hypot((i * W - cam.x) / W, (j * H - cam.y) / H, dz / Dz);
				const col = smooth((1 - dist) / 0.45) * TO.colour;
				const ink = Math.min(1, 1.15 - col);
				if (cfg.key === 'bg') {
					const [cx, cy, d] = Lz.project(i * W, j * H, z);
					if (d < 0.02) continue;
					const k = Lz.F / d;
					ctx.save();
					ctx.beginPath();
					ctx.rect(cx - (W * k) / 2, cy - (H * k) / 2, W * k, H * k);
					ctx.clip();
					if (col > 0.002) layer3(ctx, Lz, a.mips, x, y, z, l.w, l.h, col, vw, vh);
					if (a.chalk && ink > 0.002) layer3(ctx, Lz, a.chalk, x, y, z, l.w, l.h, ink, vw, vh);
					ctx.restore();
				} else {
					if (col > 0.002) layer3(ctx, Lz, a.mips, x, y, z, l.w, l.h, col, vw, vh);
					if (a.chalk && ink > 0.002) layer3(ctx, Lz, a.chalk, x, y, z, l.w, l.h, ink, vw, vh);
				}
			}
		}
	};
	// Every copy's glass: the board, and the cell behind seen through it.
	const g = R.glass;
	const windows = () => {
		for (const [i, j] of copies) {
			const [gx, gy, d] = Lz.project(i * W + g.x, j * H + g.y, g.z);
			if (d < 0.02) continue;
			const k = Lz.F / d;
			const G = [gx, gy, g.w * k, g.h * k];
			if (G[2] < 3 || gx + G[2] < 0 || gx - G[2] > w || gy + G[3] < 0 || gy - G[3] > h) continue;
			ctx.save();
			ctx.beginPath();
			ctx.rect(gx - G[2] / 2 - 0.5, gy - G[3] / 2 - 0.5, G[2] + 1, G[3] + 1);
			ctx.clip();
			ctx.fillStyle = PAL.ground;
			ctx.fillRect(gx - G[2] / 2 - 1, gy - G[3] / 2 - 1, G[2] + 2, G[3] + 2);
			if (BOARD.dust) {
				ctx.fillStyle = BOARD.dust;
				ctx.fillRect(gx - G[2] / 2 - 1, gy - G[3] / 2 - 1, G[2] + 2, G[3] + 2);
			}
			if (G[2] > 8) {
				const near = [];
				for (let dj = -1; dj <= 1; dj++)
					for (let di = -1; di <= 1; di++) near.push([i + di, j + dj]);
				lattice(near, Dz, G, null);
			}
			if (i === 0 && j === 0 && u > 0.93) {
				const wr = span(u, 0.94, 1);
				glow(ctx, gx, gy, 0.62 * Math.min(G[2], G[3]), [255, 220, 150], 0.3 * wr);
				math(ctx, DECADE_NAME[S.decade], gx, gy, {
					size: Math.min(0.2 * G[3], 64),
					upto: wr,
					align: 'center',
					alpha: 0.95
				});
			}
			ctx.restore();
			stroke(ctx, closed(rectQuad(gx, gy, G[2], G[3])), {
				color: PAL.chalk,
				width: 1.1,
				alpha: 0.5
			});
		}
	};
	lattice(copies, 0, null, windows);

	// The chalk: every copy's frame — the glued edges, with the arrows of the
	// gluing on them — and the cell's depth edges, dashed, to its back wall.
	const chalk = span(u, 0, 0.1);
	for (const [i, j] of copies) {
		const [fx, fy, d] = Lz.project(i * W, j * H, 0);
		if (d < 0.02) continue;
		const k = Lz.F / d;
		const fw = W * k;
		const fh = H * k;
		if (fx + fw < 0 || fx - fw > w || fy + fh < 0 || fy - fh > h) continue;
		const Q = rectQuad(fx, fy, fw, fh);
		stroke(ctx, closed(Q), {
			color: PAL.chalk,
			width: 2.2,
			alpha: 1,
			upto: i === 0 && j === 0 ? 1 : chalk
		});
		if (fw > 70 && TO.arrows) {
			// Up on the sides (one), right along the top and bottom (two).
			const arrow = (x, y, dx, dy, n) => {
				const s = Math.min(12, fw * 0.03);
				for (let q = 0; q < n; q++) {
					const ox = x + dx * s * (q - (n - 1) / 2) * 1.6;
					const oy = y + dy * s * (q - (n - 1) / 2) * 1.6;
					stroke(
						ctx,
						[
							[ox - dx * s - dy * s, oy - dy * s + dx * s],
							[ox, oy],
							[ox - dx * s + dy * s, oy - dy * s - dx * s]
						],
						{
							color: PAL.chalk,
							width: 2.2,
							alpha: chalk
						}
					);
				}
			};
			arrow(fx - fw / 2, fy, 0, -1, 1);
			arrow(fx + fw / 2, fy, 0, -1, 1);
			arrow(fx, fy - fh / 2, 1, 0, 2);
			arrow(fx, fy + fh / 2, 1, 0, 2);
		}
		const [bx, by, bd] = Lz.project(i * W, j * H, -PLATE.DEPTH);
		if (bd > 0.02 && fw > 24) {
			const bk = Lz.F / bd;
			const B = rectQuad(bx, by, W * bk, H * bk);
			for (let c = 0; c < 4; c++)
				stroke(ctx, [Q[c], B[c]], { color: PAL.rose, width: 1, alpha: 0.5 * chalk, dash: [4, 6] });
		}
	}
	plateFrame(ctx, L, S.decade, {
		frame: 0,
		cap: span(u, 0.92, 0.98),
		right: 'T^{3} = ℝ^{3}/ℤ^{3}'
	});
	notes(ctx, w, h, [
		['T^{3} = ℝ^{3} / ℤ^{3}:  the room, glued to itself', span(u, 0.04, 0.16)],
		['(x, y, z) ∼ (x + 2φ, y, z) ∼ (x, y + 2, z) ∼ (x, y, z + d)', span(u, 0.22, 0.4)],
		['the frame is where the room meets itself', span(u, 0.46, 0.6)]
	]);
}

// ── wormhole ─────────────────────────────────────────────────────────────────
// The axis is the line of sight through the first room's glass. The upper
// sheet of Flamm's paraboloid hangs from the glass's rim (its first rings
// morph from the glass's rectangle to circles) down to the throat at r_s,
// the lower sheet opens from the throat to a mouth of radius rm, and the
// other room hangs below that, its glass on the axis, a landing lens's
// distance past the mouth.
const WH = {
	rs: 0.45, // the throat, of the mouth's radius
	rm: 1.6, // the lower mouth's radius
	glide: 0.5, // from the lower mouth to the landing lens
	legs: [0.64, 0.88], // of the eased path: to the glass, to the lower mouth, then the glide
	off: [0.7, 0.4], // the lens starts this far off the axis, and is on it by the throat
	rings: [7, 10],
	meridians: 16
};

function wormholeSetup(S, w, h) {
	const L = landing(w, h);
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const d0 = (F * PLATE.H) / L.height;
	const A = S.others[0];
	const gA = roomOf(A, S.art, d0).glass;
	const gB = roomOf(S.decade, S.art, d0).glass;
	const ax = gA.x;
	const ay = gA.y;
	const rg = 0.5 * Math.max(gA.w, gA.h);
	const rs = WH.rs * rg;
	const h1 = 2 * Math.sqrt(rs * (rg - rs));
	const zt = gA.z - h1;
	const h2 = 2 * Math.sqrt(rs * (WH.rm - rs));
	const zm = zt - h2;
	const zLand = zm - WH.glide;
	const OB = [ax - gB.x, ay - gB.y, zLand - d0];
	const zStart = d0;
	// The path: to the glass at log pace (a zoom), c chosen so its speed
	// there is the funnel's, then straight down the funnel to the lower
	// mouth, then the glide. λ (0..1, the eased path) → z.
	const [l1, l2] = WH.legs;
	const funnelV = (gA.z - zm) / (l2 - l1);
	let c = 0.5;
	for (let i = 0; i < 40; i++) c = (funnelV * l1) / Math.log((zStart - gA.z + c) / c);
	const k = Math.log((zStart - gA.z + c) / c) / l1;
	const zOf = (lam) =>
		lam < l1
			? gA.z - c + (zStart - gA.z + c) * Math.exp(-k * lam)
			: lam < l2
				? gA.z - funnelV * (lam - l1)
				: zm - ((zm - zLand) * (lam - l2)) / (1 - l2);
	// The wire: z = 2√(r_s(r − r_s)) read as r(h) = r_s + h²/4r_s, h the
	// height above or below the throat.
	const rOf = (hh) => rs + (hh * hh) / (4 * rs);
	const rect = (th) => {
		const c = Math.cos(th);
		const s = Math.sin(th);
		const k = Math.min(
			gA.w / 2 / Math.max(1e-9, Math.abs(c)),
			gA.h / 2 / Math.max(1e-9, Math.abs(s))
		);
		return [c * k, s * k];
	};
	const pt = (th, hh, sheet) => {
		const r = rOf(hh);
		let x = r * Math.cos(th);
		let y = r * Math.sin(th);
		if (sheet > 0) {
			const t = Math.pow(clamp01(hh / h1), 3);
			const q = rect(th);
			const k = r / rg;
			x = lerp(x, q[0] * k, t);
			y = lerp(y, q[1] * k, t);
		}
		return [ax + x, ay + y, zt + sheet * hh];
	};
	const ring = (hh, sheet) => {
		const P = [];
		for (let i = 0; i <= 72; i++) P.push(pt((TAU * i) / 72, hh, sheet));
		return P;
	};
	const rings = [];
	for (let i = 0; i < WH.rings[0]; i++)
		rings.push({ pts: ring(h1 * (1 - i / WH.rings[0]), 1), kind: 'up' });
	rings.push({ pts: ring(0, 1), kind: 'throat' });
	for (let i = 1; i <= WH.rings[1]; i++)
		rings.push({ pts: ring(h2 * Math.pow(i / WH.rings[1], 1.5), -1), kind: 'down' });
	const merid = [];
	for (let k = 0; k < WH.meridians; k++) {
		const th = (TAU * (k + 0.5)) / WH.meridians;
		const P = [];
		for (let i = 0; i <= 14; i++) P.push(pt(h1 * (1 - i / 14), th, 1));
		for (let i = 1; i <= 20; i++) P.push(pt(h2 * Math.pow(i / 20, 1.5), th, -1));
		merid.push(P.map((q) => q)); // (angle, height) → point: pt(th, hh)
	}
	// pt is (th, hh, sheet); the meridians were built with the arguments
	// swapped above by mistake-proofing: rebuild them properly.
	merid.length = 0;
	for (let k = 0; k < WH.meridians; k++) {
		const th = (TAU * (k + 0.5)) / WH.meridians;
		const P = [];
		for (let i = 0; i <= 14; i++) P.push(pt(th, h1 * (1 - i / 14), 1));
		for (let i = 1; i <= 20; i++) P.push(pt(th, h2 * Math.pow(i / 20, 1.5), -1));
		merid.push(P);
	}
	const throatAt = pt(-Math.PI / 4, 0, 1);
	return {
		w,
		h,
		L,
		F,
		d0,
		A,
		gA,
		ax,
		ay,
		rs,
		zt,
		zm,
		OB,
		zStart,
		zOf,
		rings,
		merid,
		throatAt,
		pace: paceOf(3, 0.2),
		info: {
			rs: +rs.toFixed(3),
			h1: +h1.toFixed(3),
			h2: +h2.toFixed(3),
			zt: +zt.toFixed(2),
			zLand: +zLand.toFixed(2)
		}
	};
}

function wormhole(ctx, w, h, S, geo, u, secs) {
	const { L, d0, A, gA, ax, ay, OB, zOf, rings, merid, throatAt, pace } = geo;
	const lam = pace(span(u, 0.02, 0.9));
	// The lens: to the glass as a zoom, down the funnel, out of the mouth —
	// coming in a little off the axis, so the funnel is seen in perspective,
	// and on it by the throat — then off it onto the room's centre to land,
	// and the sway.
	const z = zOf(lam);
	const off = 1 - smooth(lam / (WH.legs[0] + 0.05));
	const land = smooth(span(u, 0.72, 0.9));
	const amp = smooth(span(u, 0.9, 1));
	const ex = 0.32 * amp * Math.sin(1.1 * secs - 0.4);
	const ey = 0.45 * 0.32 * amp * Math.sin(1.7 * secs + 0.6);
	const F = geo.F;
	const cam = {
		x: lerp(ax + WH.off[0] * off, OB[0], land) + ex,
		y: lerp(ay + WH.off[1] * off, OB[1], land) + ey,
		z,
		sx: (F * ex) / d0,
		sy: (-F * ey) / d0
	};
	const Lz = lens(w, h, cam, FOV);
	const cam3 = { project: (p) => Lz.project(p[0], p[1], p[2]) };
	const inA = cam.z > gA.z + 0.05;
	const dist = cam.z - gA.z; // to the mouth

	const drawB = () => {
		const r = room3(ctx, Lz, S, S.decade, OB, {
			d0,
			vw: w,
			vh: h,
			inGlass: (G) => {
				const wr = span(u, 0.94, 1);
				if (wr <= 0) return;
				glow(ctx, G[0], G[1], 0.62 * Math.min(G[2], G[3]), [255, 220, 150], 0.3 * wr);
				math(ctx, DECADE_NAME[S.decade], G[0], G[1], {
					size: Math.min(0.2 * G[3], 64),
					upto: wr,
					align: 'center',
					alpha: 0.95
				});
			}
		});
		if (!r) return;
		if (r.G)
			stroke(ctx, closed(rectQuad(r.G[0], r.G[1], r.G[2], r.G[3])), {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.55
			});
		if (r.frame)
			stroke(ctx, closed(rectQuad(r.frame[0], r.frame[1], r.frame[2], r.frame[3])), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9
			});
	};
	const drawWire = () => {
		const o = { ref: 2.2, hid: 0 };
		for (const r of rings)
			line3(
				ctx,
				cam3,
				r.pts,
				r.kind === 'throat'
					? { ...o, color: PAL.gold, width: 3.2, glow: 8 }
					: { ...o, color: PAL.pink, width: 1.5, alpha: 0.9 }
			);
		for (const P of merid) line3(ctx, cam3, P, { ...o, color: PAL.cyan, width: 1.2, alpha: 0.75 });
		label3(ctx, cam3, throatAt, 'r = r_{s}', {
			dx: 12,
			dy: 14,
			size: Math.min(26, Math.max(14, 40 / Math.max(0.6, cam.z - geo.zt))),
			color: PAL.gold,
			alpha: 0.95
		});
	};
	if (inA) {
		const r = room3(ctx, Lz, S, A, [0, 0, 0], {
			d0,
			vw: w,
			vh: h,
			inGlass: () => {
				drawB();
				drawWire();
			}
		});
		const near = clamp01((dist - 0.4) / 1.6);
		if (r?.frame) {
			stroke(ctx, closed(rectQuad(r.frame[0], r.frame[1], r.frame[2], r.frame[3])), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9 * near
			});
			const sz = Math.min(0.085 * (r.frame[3] / 2), 30);
			math(
				ctx,
				DECADE_NAME[A],
				r.frame[0] - r.frame[2] / 2,
				r.frame[1] + r.frame[3] / 2 + 0.055 * r.frame[3] + 4,
				{ size: sz, alpha: 0.9 * near }
			);
		}
		if (r?.G)
			stroke(ctx, closed(rectQuad(r.G[0], r.G[1], r.G[2], r.G[3])), {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.55 * near
			});
	} else {
		drawB();
		drawWire();
	}
	plateFrame(ctx, L, S.decade, {
		frame: 0,
		cap: span(u, 0.92, 0.98),
		right: `r_{s} = ${geo.rs.toFixed(2)}`
	});
	notes(ctx, w, h, [
		['ds^{2} = dr^{2} / (1 − r_{s}/r) + r^{2} dφ^{2}', span(u, 0.04, 0.18)],
		["z = 2√(r_{s}(r − r_{s})):  Flamm's paraboloid, both sheets", span(u, 0.24, 0.4)],
		['r = r_{s}, the throat:  two rooms, one bridge', span(u, 0.46, 0.6)]
	]);
}
