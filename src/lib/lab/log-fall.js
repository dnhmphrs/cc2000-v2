import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	bloom,
	math,
	PAL,
	PHI,
	GOLDEN_ANGLE,
	GOLDEN_K,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	note,
	tag
} from './log/board.js';
import { drawSperm } from './log/sperm.js';
import { LAYERS, placement, elementUrl, DECADES, SCREEN_GLASS } from '$lib/data/roomElements';
import { GLASS_KEY } from '$lib/three/tsl/glass';

// ── Sketch: log-fall — the last beat, a fall through rooms into the room ─────
// The site's room is six flat drawings at six depths behind a golden-rectangle
// frame. Here every room is a PLATE on the blackboard — that frame, outlined
// in chalk and captioned — and its monitor's glass is cut out of the drawing
// and opens back onto the board, where the NEXT plate hangs, smaller. The lens
// falls plate → room → glass → board → plate, glass after glass, gathering
// speed, and eases to LAND on the last plate, the room of the decade asked
// for (?decade=50s|60s|90s|10s, 90s by default), which then sways gently on
// its depths. Three ways of falling, one per ?v=:
//
//   droste  (default) the plain Droste nest: every glass centre on one axis,
//           the next plate letterboxed inside the glass, and the lens straight
//           down the axis — z ↦ z/λ, one λ per room, so each crossing takes
//           time in proportion to log λ and the zoom runs at one pace on
//           screen. A slow sway rides on the lens all the way, so the six
//           depths slide against each other during the fall as well as after.
//   golden  every room turned by the golden angle 137.5° from the one it
//           hangs in, and scaled by λ = φ^{2θ/π}, so the glass centres lie on
//           a golden spiral (drawn in gold, the nodes grey as on the plates)
//           and the fall is ONE loxodromic flow, z ↦ e^{iθζ} λ^{−ζ} z: the lens
//           turns as it zooms, the spiral stands still on screen while the
//           rooms pour out along it, and the flow untwists to land level.
//   chalk   the droste nest, but every room is first a chalk drawing — the
//           artwork's own ink lines, lifted off it and redrawn in chalk, with
//           each layer's rectangle dashed in and its depth written by it —
//           and the room is coloured in as the lens arrives, the bed first
//           and the wall last: the blackboard turning into the room.
//
// It is a real perspective camera on real depths, drawn in 2D: every layer is
// a plane parallel to the lens, so its picture is the drawing under one
// similarity (setTransform), and the nest is a chain of 3D similarities —
// each plate set a gap BEHIND its parent's glass, so that by the time the
// lens sits in front of a plate it has passed through the glass it hung in
// (that level is then dropped, as the descent's stencil chain drops it). The
// layers are pre-scaled by (d₀ + depth)/d₀ about the landing lens, so from
// there the room is exactly the site's flat composition and the depths only
// show when the lens moves. The landing sway fixes the PLATE's frame on the
// board and lets the room drift behind it by depth — the back wall most, the
// bed least — the desk parallax the site's room has.
//
// The swimmer (sperm.js's golden spiral) rides ahead of the lens at the
// vanishing point, in the middle of every glass it is about to fall through,
// and as the lens lands it dives into the last glass and goes out in a glint;
// the decade is then chalked on that glass, where the site writes the answer.
// On the golden fall the spiral through the glass centres IS the swimmer.
// The droste and chalk nests are four rooms, every decade once, the asked-for
// one last; the golden's λ is smaller, so it is seven, the decades repeating.
//
//   ?decade=60s   which room to land in        ?sperm=0   without the swimmer
//
// Ten seconds, a pure function of progress: ?at= pins any frame.

const SECONDS = 10;
const W = 2 * PHI; // the plate: the site's golden rectangle, 2 tall
const H = 2;
const DEPTH = 3; // NEST.depth: the back wall, this far behind the frame
const FOV = 34; // degrees, vertical
const FIT = 0.9; // how much of its glass the next plate fills, at rest
const MARGIN = 1.35; // how far past the parent's glass the lens is, at rest
const NEAR = 0.015; // layers nearer than this (in the lens's units) are passed
const FALL = [0.03, 0.8]; // the fall, in progress
const LAND = [0.68, 0.86]; // the lens slides from the glass to the plate's centre
const NAME = { '50s': '1950s', '60s': '1960s', '90s': '1990s', '10s': '2010s' };

export default async function make({ at }) {
	const v = variant(['droste', 'golden', 'chalk']);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const SPERM = q.get('sperm') !== '0';
	const b = getBoard();
	const time = clock(SECONDS, at);
	// The board, while the drawings load (a second or two: four decades).
	clearBoard(b);
	tag(b.ctx, b.w, b.h, `log-fall · ${v} · ${decade} · loading the rooms`);
	const t0 = performance.now();
	const art = await loadArt(v === 'chalk');
	const loadMs = Math.round(performance.now() - t0);
	const L = v === 'golden' ? 6 : 3; // crossings: L + 1 rooms, every decade once on the droste
	const others = DECADES.filter((d) => d !== decade);
	const order = [];
	for (let i = 0; i < L; i++) order.push(others[i % others.length]);
	order.push(decade);
	const ease = easeOf(3, 0.2);

	let geo = null;
	const info = {
		seconds: SECONDS,
		variant: v,
		decade,
		rooms: order,
		missing: art.missing,
		loadMs,
		chalkMs: Math.round(art.chalkMs ?? 0)
	};

	function render() {
		clearBoard(b);
		const { w, h } = b;
		if (!geo || geo.w !== w || geo.h !== h) {
			geo = nest(w, h, v, order, art);
			info.lambda = geo.levels.slice(0, L).map((l) => Number((1 / l.X).toFixed(2)));
		}
		frame(b, geo, art, v, time.u, time.t, { ease, SPERM });
		tag(b.ctx, w, h, `log-fall · ${v} · ${decade}`);
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The drawings ─────────────────────────────────────────────────────────────
// Every decade's six layers, as Image()s, each with a mip chain (halved
// canvases, so a far room is drawn from a small copy and never shimmers);
// the monitor with its glass cut out (the glass colour keyed out within the
// measured rect — glass.js's GLASS_KEY — so the board shows through it); and,
// for the chalk variant, a chalk copy of each: the ink lines lifted off the
// artwork and redrawn in chalk, grained.
async function loadArt(withChalk) {
	const art = { missing: [] };
	const load = (url) =>
		new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => resolve(null);
			img.src = url;
		});
	await Promise.all(
		DECADES.map(async (d) => {
			art[d] = {};
			await Promise.all(
				LAYERS.map(async (cfg) => {
					const url = elementUrl(d, cfg.key);
					const img = await load(url);
					if (!img || !img.width) {
						art.missing.push(url);
						return;
					}
					try {
						await img.decode();
					} catch {
						/* drawn anyway once loaded */
					}
					const src = cfg.key === 'screen' ? cutGlass(img, d) : img;
					const a = { w: img.width, h: img.height, mips: mips(src) };
					if (withChalk) {
						const t = performance.now();
						a.chalk = mips(chalkOf(src, cfg.key === 'bg'));
						art.chalkMs = (art.chalkMs ?? 0) + performance.now() - t;
					}
					art[d][cfg.key] = a;
				})
			);
		})
	);
	return art;
}

const canvasOf = (w, h) => {
	const c = document.createElement('canvas');
	c.width = Math.max(1, Math.round(w));
	c.height = Math.max(1, Math.round(h));
	return c;
};

function mips(src) {
	const out = [src];
	let c = src;
	let w = src.width;
	let h = src.height;
	while (w > 96 && h > 96) {
		w = Math.ceil(w / 2);
		h = Math.ceil(h / 2);
		const n = canvasOf(w, h);
		n.getContext('2d').drawImage(c, 0, 0, w, h);
		out.push(n);
		c = n;
	}
	return out;
}

// The smallest copy at least `px` device pixels across.
function pick(m, px) {
	for (let i = m.length - 1; i > 0; i--) if (m[i].width >= px) return m[i];
	return m[0];
}

function cutGlass(img, decade) {
	const c = canvasOf(img.width, img.height);
	const x = c.getContext('2d', { willReadFrequently: true });
	x.drawImage(img, 0, 0);
	const key = GLASS_KEY[decade];
	const g = SCREEN_GLASS[decade];
	if (!key || key.alpha || !g) return c; // the 50s glass is see-through already
	const x0 = Math.max(0, Math.floor((g.cx - g.w * 0.52) * img.width));
	const y0 = Math.max(0, Math.floor((g.cy - g.h * 0.52) * img.height));
	const x1 = Math.min(img.width, Math.ceil((g.cx + g.w * 0.52) * img.width));
	const y1 = Math.min(img.height, Math.ceil((g.cy + g.h * 0.52) * img.height));
	const data = x.getImageData(x0, y0, x1 - x0, y1 - y0);
	const p = data.data;
	const [r, gg, bb] = key.rgb.map((k) => k * 255);
	const tol = 16;
	const rw = x1 - x0;
	const rh = y1 - y0;
	const cut = new Uint8Array(rw * rh);
	for (let i = 0, j = 0; i < p.length; i += 4, j++) {
		cut[j] =
			p[i + 3] > 127 &&
			Math.abs(p[i] - r) <= tol &&
			Math.abs(p[i + 1] - gg) <= tol &&
			Math.abs(p[i + 2] - bb) <= tol
				? 1
				: 0;
	}
	// And two pixels round it: the antialiased fringe between the glass paint
	// and the bezel's ink would otherwise ring the board in the glass colour.
	const R = 2;
	for (let y = 0; y < rh; y++)
		for (let xx = 0; xx < rw; xx++) {
			let hit = 0;
			for (let dy = -R; dy <= R && !hit; dy++)
				for (let dx = -R; dx <= R; dx++) {
					const X = xx + dx;
					const Y = y + dy;
					if (X >= 0 && Y >= 0 && X < rw && Y < rh && cut[Y * rw + X]) {
						hit = 1;
						break;
					}
				}
			if (hit) p[(y * rw + xx) * 4 + 3] = 0;
		}
	x.putImageData(data, x0, y0);
	return c;
}

// The chalk copy: dark ink → chalk, the rest clear, with a fixed grain.
function chalkOf(src, wall) {
	const k = Math.min(1, (wall ? 1024 : 800) / src.width);
	const c = canvasOf(src.width * k, src.height * k);
	const x = c.getContext('2d', { willReadFrequently: true });
	x.drawImage(src, 0, 0, c.width, c.height);
	const data = x.getImageData(0, 0, c.width, c.height);
	const p = data.data;
	let s = 424242;
	const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	for (let i = 0; i < p.length; i += 4) {
		const a = p[i + 3] / 255;
		const lum = (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) / 255;
		// The walls are textured paper: only their real ink lines count.
		const ink = a * (wall ? clamp01((0.26 - lum) / 0.12) : clamp01((0.38 - lum) / 0.22));
		p[i] = 236;
		p[i + 1] = 230;
		p[i + 2] = 218;
		p[i + 3] = Math.round(255 * ink * (0.55 + 0.45 * rnd()));
	}
	x.putImageData(data, 0, 0);
	return c;
}

// ── A room, laid out ─────────────────────────────────────────────────────────
// RoomProjection.layout(), landscape, in the plate's own units (x right, y up,
// the frame's plane at z = 0, the back wall at z = −DEPTH), each layer
// pre-scaled by (d₀ + depth)/d₀ about the plate's centre, so the lens at
// (0, 0, d₀) sees exactly the flat composition. And where its glass is.
function roomOf(decade, art, d0) {
	const lay = {};
	for (const cfg of LAYERS) {
		const a = art[decade]?.[cfg.key];
		const g = SCREEN_GLASS[decade];
		const aspect = a ? a.w / a.h : cfg.key === 'screen' ? g.art : null;
		if (!aspect) continue;
		const pos = placement(cfg, decade, false);
		let w, h;
		if (cfg.cover) {
			if (W / H > aspect) {
				w = W;
				h = W / aspect;
			} else {
				h = H;
				w = H * aspect;
			}
		} else {
			w = pos.width * W;
			h = w / aspect;
		}
		const z = -cfg.depth * DEPTH;
		const sc = (d0 - z) / d0;
		lay[cfg.key] = {
			key: cfg.key,
			depth: cfg.depth,
			x: (((pos.x || 0) * W) / 2) * sc,
			y: (((pos.y || 0) * H) / 2) * sc,
			w: w * sc,
			h: h * sc,
			z
		};
	}
	const s = lay.screen;
	const g = SCREEN_GLASS[decade];
	const glass = {
		x: s.x + (g.cx - 0.5) * s.w,
		y: s.y + (0.5 - g.cy) * s.h,
		w: g.w * s.w,
		h: g.h * s.h,
		z: s.z
	};
	return { decade, lay, glass };
}

const rot2 = (x, y, a) => {
	const c = Math.cos(a);
	const s = Math.sin(a);
	return [c * x - s * y, s * x + c * y];
};

// ── The nest ─────────────────────────────────────────────────────────────────
// Level k is room k under the similarity x ↦ O_k + s_k·R(ρ_k)·x (z scaled by
// s_k too). Its child hangs `gap` behind its glass, scaled by X = 1/λ. The
// pose(ζ) is the lens at level ζ: at an integer it sits d₀ in front of that
// plate, square on its glass, having just passed the glass the plate hung in.
function nest(w, h, v, order, art) {
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const plate = Math.min(0.62 * h, (0.74 * w) / PHI); // the landed plate, px tall
	const d0 = (F * H) / plate;
	const rooms = {};
	const room = (d) => (rooms[d] ??= roomOf(d, art, d0));
	const L = order.length - 1;
	const levels = [];

	if (v === 'golden') {
		// One loxodromic flow: λ = φ^{2θ/π}, so a turn of θ is a zoom of λ and
		// the glass centres pole + λ^{−k}R(kθ)·v lie on the golden spiral.
		const theta = GOLDEN_ANGLE;
		const lam = Math.exp(GOLDEN_K * theta);
		const X = 1 / lam;
		const gz = room(order[0]).glass.z; // the same in every decade
		const gap = MARGIN * d0 * X;
		const vz = (gap - X * gz) / (1 - X);
		const vr = 0.24;
		const va = -0.6;
		const vv = [vr * Math.cos(va), vr * Math.sin(va), vz];
		const G0 = room(order[0]).glass;
		const pole = [G0.x - vv[0], G0.y - vv[1], G0.z - vv[2]];
		for (let k = 0; k <= L; k++) {
			const r = room(order[k]);
			const s = Math.pow(X, k);
			const [ox, oy] = rot2(vv[0] - r.glass.x, vv[1] - r.glass.y, k * theta);
			levels.push({
				...r,
				k,
				O: [pole[0] + s * ox, pole[1] + s * oy, pole[2] + s * (vv[2] - r.glass.z)],
				s,
				rho: k * theta,
				X,
				gap
			});
		}
		const crel = [vv[0], vv[1], d0 + vv[2] - gz];
		const pose = (zeta) => {
			const s = Math.pow(X, zeta);
			const [x, y] = rot2(crel[0], crel[1], zeta * theta);
			return {
				x: pole[0] + s * x,
				y: pole[1] + s * y,
				z: pole[2] + s * crel[2],
				s,
				roll: zeta * theta
			};
		};
		// The spiral itself, continuous in t: the glass centre at level t.
		const spiral = (t) => {
			const s = Math.pow(X, t);
			const [x, y] = rot2(vv[0], vv[1], t * theta);
			return [pole[0] + s * x, pole[1] + s * y, pole[2] + s * vv[2]];
		};
		const logs = levels.map(() => Math.log(lam));
		return { w, h, F, d0, plate, L, levels, pose, spiral, pole, logs, zeta0: -0.45 };
	}

	// The droste: every glass centre on one axis, one λ per room — the next
	// plate letterboxed in the glass (FIT of its narrower side), set so far
	// behind it that the lens at rest has passed it (MARGIN).
	let O = [0, 0, 0];
	let s = 1;
	for (let k = 0; k <= L; k++) {
		const r = room(order[k]);
		const lv = { ...r, k, O: O.slice(), s, rho: 0 };
		levels.push(lv);
		if (k === L) break;
		const G = r.glass;
		const Gc = room(order[k + 1]).glass;
		const Dg = d0 - G.z;
		const fh = FIT * Math.min(G.h, G.w / PHI);
		const kap = (MARGIN * d0 * fh) / (H * Dg);
		const gap = (kap * Dg) / (1 - kap);
		const X = (fh * (Dg + gap)) / (H * Dg);
		lv.X = X;
		lv.gap = gap;
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
		} else if (zeta >= L) {
			k = L;
			sc = 1;
			loc = [levels[L].glass.x, levels[L].glass.y, d0];
		} else {
			k = Math.floor(zeta);
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
			s: lv.s * sc,
			roll: 0
		};
	};
	const logs = levels.map((l) => (l.X ? -Math.log(l.X) : 1));
	return { w, h, F, d0, plate, L, levels, pose, logs, zeta0: -0.55 };
}

// Progress → ζ. The fall runs at one pace ON SCREEN — equal time per unit of
// log λ, since the crossings are zooms of different sizes — eased so it
// gathers speed and then lands: its speed goes as (c + x)^p (1 − x)².
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
function zetaAt(geo, e) {
	const { logs, L, zeta0 } = geo;
	let total = -zeta0 * logs[0];
	for (let k = 0; k < L; k++) total += logs[k];
	let lam = e * total + zeta0 * logs[0];
	if (lam < 0) return lam / logs[0];
	for (let k = 0; k < L; k++) {
		if (lam < logs[k]) return k + lam / logs[k];
		lam -= logs[k];
	}
	return L;
}

// ── A frame ──────────────────────────────────────────────────────────────────
function frame(b, geo, art, v, u, secs, { ease, SPERM }) {
	const { ctx, w, h, dpr } = b;
	const { F, d0, L, levels } = geo;
	const zeta = zetaAt(geo, ease(span(u, FALL[0], FALL[1])));

	// The lens: the nest's pose, slid from the glass to the plate's centre as
	// it lands, and swaying — with the screen shifted so that a plane d₀ ahead
	// holds still: on the landed plate, the frame holds and the room drifts.
	const cam = geo.pose(zeta);
	const last = levels[L];
	const land = smooth(span(u, LAND[0], LAND[1]));
	const [lx, ly] = rot2(-last.glass.x * land, -last.glass.y * land, last.rho);
	cam.x += last.s * lx;
	cam.y += last.s * ly;
	const A = lerp(0.05, 0.32, smooth(span(u, 0.74, 0.92)));
	const ex = A * Math.sin(1.1 * secs - 0.4);
	const ey = A * 0.45 * Math.sin(1.7 * secs + 0.6);
	const [sx, sy] = rot2(ex, ey, cam.roll);
	cam.x += cam.s * sx;
	cam.y += cam.s * sy;
	cam.sx = (F * ex) / d0;
	cam.sy = (-F * ey) / d0;
	// The board's centre sits a little low, under the lecture.
	cam.ox = w / 2 + cam.sx;
	cam.oy = 0.535 * h + cam.sy;
	const cr = Math.cos(cam.roll);
	const sr = Math.sin(cam.roll);

	const project = (x, y, z) => {
		const d = cam.z - z;
		const dx = x - cam.x;
		const dy = y - cam.y;
		const rx = cr * dx + sr * dy;
		const ry = -sr * dx + cr * dy;
		return [cam.ox + (F * rx) / d, cam.oy - (F * ry) / d, d];
	};
	// The similarity a level's plane z draws through: local (x, y) → screen.
	const plane = (lv, z) => {
		const wz = lv.O[2] + lv.s * z;
		const dw = cam.z - wz;
		if (dw <= NEAR * cam.s) return null;
		const m = (F * lv.s) / dw;
		const phi = lv.rho - cam.roll;
		const co = Math.cos(phi);
		const si = Math.sin(phi);
		const [e, f] = project(lv.O[0], lv.O[1], wz);
		return { a: m * co, b: -m * si, c: -m * si, d: -m * co, e, f, m, phi };
	};
	const at = (T, x, y) => [T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f];
	const rect = (T, x, y, rw, rh) => [
		at(T, x - rw / 2, y - rh / 2),
		at(T, x + rw / 2, y - rh / 2),
		at(T, x + rw / 2, y + rh / 2),
		at(T, x - rw / 2, y + rh / 2)
	];
	const boxOf = (P) => {
		let x0 = Infinity;
		let y0 = Infinity;
		let x1 = -Infinity;
		let y1 = -Infinity;
		for (const [x, y] of P) {
			x0 = Math.min(x0, x);
			y0 = Math.min(y0, y);
			x1 = Math.max(x1, x);
			y1 = Math.max(y1, y);
		}
		return [x0, y0, x1, y1];
	};
	const meet = (A, B) => [
		Math.max(A[0], B[0]),
		Math.max(A[1], B[1]),
		Math.min(A[2], B[2]),
		Math.min(A[3], B[3])
	];
	const empty = (B) => B[2] <= B[0] || B[3] <= B[1];
	const screenPx = () => ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const clipTo = (P) => {
		screenPx();
		ctx.beginPath();
		ctx.moveTo(P[0][0], P[0][1]);
		for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
		ctx.closePath();
		ctx.clip();
	};
	const closed = (P) => [...P, P[0]];

	// One drawing, `lw` × `lh` local units, centred at (x, y) on plane T.
	const draw = (T, m, x, y, lw, lh, alpha, box, fx = false, fy = false) => {
		if (alpha <= 0.002) return;
		if (empty(meet(boxOf(rect(T, x, y, lw, lh)), box))) return;
		const img = pick(m, Math.abs(T.m) * lw * dpr);
		const x0 = x - lw / 2;
		const y1 = y + lh / 2;
		ctx.setTransform(
			dpr * T.a,
			dpr * T.b,
			-dpr * T.c,
			-dpr * T.d,
			dpr * (T.e + T.a * x0 + T.c * y1),
			dpr * (T.f + T.b * x0 + T.d * y1)
		);
		if (fx) {
			ctx.translate(lw, 0);
			ctx.scale(-1, 1);
		}
		if (fy) {
			ctx.translate(0, lh);
			ctx.scale(1, -1);
		}
		ctx.globalAlpha = alpha;
		ctx.drawImage(img, 0, 0, lw + 0.004, lh + 0.004);
		ctx.globalAlpha = 1;
	};

	// How far each room is painted in (chalk variant): as the lens arrives.
	const paint = (k, depth) => {
		if (v !== 'chalk') return 1;
		// The last room finishes as the lens slides onto its centre.
		const z = zeta + (k === geo.L ? 0.3 * smooth(span(u, LAND[0], LAND[1])) : 0);
		const p = span(z, k - 0.5, k + 0.2);
		// The drawing is coloured in on the board, nearest thing first, and
		// the wall floods in behind it last.
		const from = depth * 0.55;
		return smooth(span(p, from, from + 0.45));
	};

	const layer = (lv, key, box, k) => {
		const l = lv.lay[key];
		const a = art[lv.decade][key];
		if (!l || !a) return;
		const T = plane(lv, l.z);
		if (!T) return;
		const p = paint(k, l.depth);
		const tiles = key === 'bg' ? 2 : 0;
		for (let j = -tiles; j <= tiles; j++)
			for (let i = -tiles; i <= tiles; i++) {
				const x = l.x + i * l.w;
				const y = l.y + j * l.h;
				const fx = i % 2 !== 0;
				const fy = j % 2 !== 0;
				draw(T, a.mips, x, y, l.w, l.h, p, box, fx, fy);
				if (a.chalk && p < 1) draw(T, a.chalk, x, y, l.w, l.h, 0.95 * (1 - p), box, fx, fy);
			}
		if (v === 'chalk' && p < 1 && key !== 'bg') {
			// The layer's own rectangle, dashed in rose, and its depth.
			const P = rect(T, l.x, l.y, l.w, l.h);
			screenPx();
			stroke(ctx, closed(P), {
				color: PAL.rose,
				width: 1.2,
				alpha: 0.75 * (1 - p),
				dash: [5, 5]
			});
			const sz = 0.06 * T.m;
			if (sz > 7) {
				const [tx, ty] = at(T, l.x - l.w / 2, l.y + l.h / 2 + 0.05);
				label(
					`d = ${l.depth.toFixed(2)}`,
					tx,
					ty,
					Math.min(sz, 16),
					-T.phi,
					0.8 * (1 - p),
					PAL.rose
				);
			}
		}
	};

	const label = (s, x, y, size, angle, alpha, color = PAL.chalk, align = 'left') => {
		if (alpha <= 0 || size < 5) return;
		screenPx();
		ctx.translate(x, y);
		ctx.rotate(angle);
		math(ctx, s, 0, 0, { size, alpha: alpha * clamp01((size - 5) / 4), color, align });
	};

	const board = (box) => {
		screenPx();
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
		if (b.dust) {
			ctx.fillStyle = b.dust;
			ctx.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
		}
	};

	const view = [0, 0, w, h];
	const glassAt = []; // where each level's glass landed on screen, for the swimmer
	const writeOn = span(u, 0, 0.07);

	// A level: the plate's window, its back layers, its glass — the board, and
	// the next level in it — then the monitor over that, then desk and bed.
	const drawLevel = (k, box) => {
		const lv = levels[k];
		const T0 = plane(lv, 0);
		ctx.save();
		let inner = box;
		if (T0) {
			const P = rect(T0, 0, 0, W, H);
			clipTo(P);
			inner = meet(box, boxOf(P));
		}
		if (!empty(inner)) {
			layer(lv, 'bg', inner, k);
			layer(lv, 'poster', inner, k);
			layer(lv, 'clock', inner, k);
			const Tg = plane(lv, lv.glass.z);
			let GP = null;
			if (Tg) {
				GP = rect(Tg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h);
				const gb = meet(inner, boxOf(GP));
				glassAt[k] = { P: GP, T: Tg };
				if (!empty(gb)) {
					ctx.save();
					clipTo(GP);
					board(gb);
					if (k < L && gb[2] - gb[0] > 2) drawLevel(k + 1, gb);
					else if (k === L) result(Tg, lv);
					ctx.restore();
				}
			}
			layer(lv, 'screen', inner, k);
			layer(lv, 'desk', inner, k);
			layer(lv, 'bed', inner, k);
			if (GP) {
				screenPx();
				stroke(ctx, closed(GP), {
					color: PAL.chalk,
					width: 1.2,
					alpha: 0.55 * (v === 'chalk' ? 1 : paint(k, 0.6)),
					upto: k === 0 ? writeOn : 1
				});
			}
		}
		ctx.restore();
		// The plate's frame in chalk, and its caption on the board under it.
		if (T0) {
			const P = rect(T0, 0, 0, W, H);
			screenPx();
			stroke(ctx, closed(P), {
				color: PAL.chalk,
				width: 1.8,
				alpha: 0.9,
				upto: k === 0 ? writeOn : 1
			});
			const sz = 0.085 * T0.m;
			const cap = k === 0 ? span(u, 0.03, 0.09) : 1;
			const [ax, ay] = at(T0, -W / 2, -H / 2 - 0.11);
			label(NAME[lv.decade], ax, ay, Math.min(sz, 30), -T0.phi, 0.9 * cap);
			const [bx, by] = at(T0, W / 2, -H / 2 - 0.11);
			const right = k === 0 ? 'ζ = 0' : `ζ = ${k},  λ = ${(1 / levels[k - 1].X).toFixed(2)}`;
			label(right, bx, by, Math.min(sz * 0.8, 24), -T0.phi, 0.75 * cap, PAL.chalkDim, 'right');
		}
	};

	// The last glass: the board, where the answer is written.
	const result = (Tg, lv) => {
		const G = lv.glass;
		const write = span(u, 0.87, 0.97);
		if (write <= 0) return;
		const [cx, cy] = at(Tg, G.x, G.y);
		const size = Math.min(0.2 * G.h * Tg.m, 64);
		screenPx();
		ctx.translate(cx, cy);
		ctx.rotate(-Tg.phi);
		math(ctx, NAME[lv.decade], 0, 0, { size, upto: write, align: 'center', alpha: 0.95 });
	};

	// Which level the lens is in: every glass it has passed is dropped.
	let base = 0;
	for (let k = 0; k < L; k++) {
		const lv = levels[k];
		// Within the near distance counts as through: by then the glass fills
		// the frame, and a glass too near to draw must not leave its room.
		if (cam.z <= lv.O[2] + lv.s * lv.glass.z + NEAR * cam.s) base = k + 1;
		else break;
	}
	drawLevel(base, view);
	screenPx();

	// ── The gold ───────────────────────────────────────────────────────────
	if (v === 'golden') goldenSpiral(ctx, geo, project, cam, zeta, u);
	if (SPERM) swimmer(ctx, w, h, cam, u, secs, glassAt[L], levels[L], v);

	// ── The lecture ────────────────────────────────────────────────────────
	const NB = [0, 0, 0.6 * w, 64 + 3 * 30 + 10];
	const Tb = plane(levels[base], 0);
	let cover = 1;
	if (Tb) {
		const m = meet(NB, boxOf(rect(Tb, 0, 0, W, H)));
		cover = empty(m) ? 0 : ((m[2] - m[0]) * (m[3] - m[1])) / ((NB[2] - NB[0]) * (NB[3] - NB[1]));
	}
	const R = 0.42 * Math.min(w, h);
	const zoom = levels.slice(0, L).reduce((p, l) => p / l.X, 1);
	const big = zoom >= 1000 ? `${(zoom / 1000).toFixed(1)}·10^{3}` : zoom.toFixed(0);
	const lines =
		v === 'golden'
			? [
					['z ↦ e^{iθζ} λ^{−ζ} z,   θ = 137.5°', span(u, 0.05, 0.16)],
					['λ = φ^{2θ/π} ≈ 2.09:  the glass centres lie on r = φ^{2θ/π}', span(u, 0.24, 0.38)],
					[`ζ = ${L}:  θζ ≡ 0 (level),  λ^{${L}} ≈ ${big}`, span(u, 0.82, 0.92)]
				]
			: v === 'chalk'
				? [
						['x ↦ x · f / (d_{0} + d),   d ∈ {0.16, 0.48, 0.6, 0.9, 1}', span(u, 0.05, 0.18)],
						['z ↦ z / λ_{k}', span(u, 0.26, 0.36)],
						[`ζ = ${L}:  Π λ_{k} ≈ ${big}`, span(u, 0.82, 0.92)]
					]
				: [
						['z ↦ z / λ', span(u, 0.05, 0.12)],
						['log z ↦ log z − log λ:  the fall is a slide', span(u, 0.24, 0.38)],
						[`ζ = ${L}:  Π λ_{k} ≈ ${big}`, span(u, 0.82, 0.92)]
					];
	// Over a room the chalk needs board round it: a halo of board, as much of
	// it as the room covers the corner the lecture is written in.
	screenPx();
	if (cover > 0) {
		ctx.save();
		ctx.shadowColor = `rgba(21, 21, 21, ${0.95 * clamp01(cover * 3)})`;
		ctx.shadowBlur = 10;
		note(ctx, w, h, R, lines);
		ctx.shadowBlur = 4;
		note(ctx, w, h, R, lines);
		ctx.restore();
	} else note(ctx, w, h, R, lines);
}

// The golden variant's spiral, through every glass centre: the flow carries
// it onto itself, so it stands still on screen while the rooms pour along it.
// Gold for the line, grey discs for the glass centres (bigger nearer), as the
// loxodrome plate draws its nodes; rubbed out as the lens lands.
function goldenSpiral(ctx, geo, project, cam, zeta, u) {
	const alpha = span(u, 0.06, 0.16) * (1 - smooth(span(u, 0.7, 0.84)));
	if (alpha <= 0) return;
	const pts = [];
	const n = 420;
	const t0 = zeta - 1.6;
	const t1 = zeta + 9;
	for (let i = 0; i <= n; i++) {
		const t = t0 + ((t1 - t0) * i) / n;
		const [x, y, z] = geo.spiral(t);
		const p = project(x, y, z);
		if (p[2] > 0.25 * cam.s) pts.push(p);
	}
	// Thin where it sweeps past the lens, heavy at its pole: the swimmer.
	stroke(ctx, pts, { color: PAL.gold, taper: [1.6, 6.5], alpha: 0.95 * alpha });
	for (let k = Math.ceil(t0); k <= Math.min(geo.L, t1); k++) {
		const [x, y, z] = geo.spiral(k);
		const p = project(x, y, z);
		if (p[2] <= 0.25 * cam.s) continue;
		const r = Math.min(16, (0.05 * geo.F * Math.pow(1 / geo.levels[0].X, -k)) / p[2]);
		if (r > 0.8) disc(ctx, p[0], p[1], r, { fill: PAL.node, alpha: 0.95 * alpha });
	}
	const P = project(...geo.pole);
	disc(ctx, P[0], P[1], 6.5, { fill: PAL.gold, alpha });
	disc(ctx, P[0] - 1.8, P[1] - 1.8, 2.2, { fill: PAL.chalk, alpha: 0.8 * alpha });
}

// The swimmer: a golden spiral riding ahead of the lens at the vanishing
// point, spun so it pours itself into its pole; as the lens lands it swims
// into the last glass and is gone, with a glint.
function swimmer(ctx, w, h, cam, u, secs, glass, last, v) {
	const body = smooth(span(u, 0.08, 0.2));
	if (body <= 0) return;
	const dive = smooth(span(u, 0.72, 0.86));
	let gx = cam.ox;
	let gy = cam.oy;
	if (glass) {
		const G = last.glass;
		const T = glass.T;
		const tx = T.a * G.x + T.c * G.y + T.e;
		const ty = T.b * G.x + T.d * G.y + T.f;
		gx = lerp(gx, tx, dive);
		gy = lerp(gy, ty, dive);
	}
	const size = 0.07 * h * (1 - dive * 0.94);
	const FROM = -0.35 * Math.PI;
	const LEN = 7.2;
	const view = makeView({ w, h, scale: size, cx: gx, cy: gy });
	const turn = secs * 2.4;
	// The golden variant's swimmer is its spiral; only the glint is here.
	if (dive < 1 && v !== 'golden') {
		drawSperm(ctx, view, {
			scale: Math.exp(-GOLDEN_K * (FROM + LEN)),
			turn: turn - (FROM + LEN),
			from: FROM,
			length: LEN,
			width: lerp(4.5, 1.5, dive),
			tip: 1.2,
			body,
			wiggle: 0.12 * (1 - dive),
			phase: secs * 1.7,
			alpha: 0.95 * (1 - span(u, 0.82, 0.86))
		});
	}
	const glint = span(u, 0.82, 0.95);
	if (glint > 0 && glint < 1) {
		const a = Math.sin(Math.PI * Math.sqrt(glint));
		bloom(ctx, gx, gy, 0.09 * h * (0.4 + glint), 'rgba(255, 224, 150, 0.9)', a * 0.9);
		disc(ctx, gx, gy, 3 * a, { fill: '#fff8e6', alpha: a });
	}
}
