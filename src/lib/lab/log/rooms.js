// ── Rooms: the site's bedrooms, for drawing on the board ─────────────────────
// Lifted from log-fall.js so any sketch can put a room on the board. The room
// is six flat drawings at six depths behind a golden-rectangle frame
// (data/roomElements.js: DECADES, LAYERS, placement, elementUrl); this loads
// them as Image()s, each with a mip chain (halved canvases, so a small room
// is drawn from a small copy and never shimmers), the monitor's glass cut out
// (keyed out within the measured rect, glass.js's GLASS_KEY, so the board
// shows through it), and on request a CHALK copy of each — the artwork's ink
// lifted off it and redrawn in chalk. roomOf lays a room out in the plate's
// units; drawRoom draws one flat into a rectangle of the screen, turned, with
// its layers slid against each other by depth: the parallax the site has.
//
// Plate units: x right, y up, the frame W = 2φ wide and H = 2 tall, centred
// on the origin, the frame's plane at z = 0 and the back wall at z = −DEPTH.

import { DECADES, LAYERS, placement, elementUrl } from '$lib/data/roomElements';
import { SCREEN_GLASS } from '$lib/config/layout';
import { GLASS_KEY } from '$lib/three/tsl/glass';
import { PHI, clamp01 } from './board.js';

export const PLATE = { W: 2 * PHI, H: 2, DEPTH: 3 };
export { DECADES, LAYERS };
export const DECADE_NAME = { '50s': '1950s', '60s': '1960s', '90s': '1990s', '10s': '2010s' };

// ── Loading ──────────────────────────────────────────────────────────────────
// Every asked-for decade's six layers; await it in make() before returning.
// art[decade][key] = { w, h, mips, chalk? }; art.missing lists failed URLs.
export async function loadRooms({ decades = DECADES, chalk = false } = {}) {
	const art = { missing: [] };
	const load = (url) =>
		new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => resolve(null);
			img.src = url;
		});
	await Promise.all(
		decades.map(async (d) => {
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
					if (chalk) a.chalk = mips(chalkOf(src, cfg.key === 'bg'));
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

// A mip chain: the source, then halved copies down to ~96 px.
export function mips(src) {
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
export function pick(m, px) {
	for (let i = m.length - 1; i > 0; i--) if (m[i].width >= px) return m[i];
	return m[0];
}

// The monitor's glass keyed out, and two pixels round it (the antialiased
// fringe between the glass paint and the bezel would ring it otherwise).
export function cutGlass(img, decade) {
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
export function chalkOf(src, wall) {
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
		const ink = a * (wall ? clamp01((0.26 - lum) / 0.12) : clamp01((0.38 - lum) / 0.22));
		p[i] = 236;
		p[i + 1] = 230;
		p[i + 2] = 218;
		p[i + 3] = Math.round(255 * ink * (0.55 + 0.45 * rnd()));
	}
	x.putImageData(data, 0, 0);
	return c;
}

// ── Layout ───────────────────────────────────────────────────────────────────
// The room laid out in plate units, landscape (RoomProjection.layout()): every
// layer's centre, size and depth (z = −depth·DEPTH), and where the glass is.
// With `d0` (the lens's distance from the frame) each layer is pre-scaled by
// (d₀ − z)/d₀ about the plate's centre, so a lens at (0, 0, d₀) sees exactly
// the flat composition; without it, the layers are the flat composition.
export function roomOf(decade, art, d0 = null) {
	const { W, H, DEPTH } = PLATE;
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
		const sc = d0 ? (d0 - z) / d0 : 1;
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
	const glass = s
		? {
				x: s.x + (g.cx - 0.5) * s.w,
				y: s.y + (0.5 - g.cy) * s.h,
				w: g.w * s.w,
				h: g.h * s.h,
				z: s.z
			}
		: null;
	return { decade, lay, glass };
}

// ── Drawing ──────────────────────────────────────────────────────────────────
// An image (or a mip chain) centred at (cx, cy) on screen, w × h px, turned
// `rot` radians counter-clockwise, at `alpha`; drawn from the mip that suits.
export function drawImageAt(ctx, img, cx, cy, w, h, { rot = 0, alpha = 1, flipX = false } = {}) {
	if (alpha <= 0.002 || !img) return;
	const dpr = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
	const src = Array.isArray(img) ? pick(img, Math.abs(w) * dpr) : img;
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.translate(cx, cy);
	if (rot) ctx.rotate(-rot);
	if (flipX) ctx.scale(-1, 1);
	ctx.drawImage(src, -w / 2, -h / 2, w, h);
	ctx.restore();
}

// A room drawn flat into the screen: its plate centred at (cx, cy), `height`
// px tall (W/H = φ wide), turned `rot`; every layer slid by `parallax` [dx, dy]
// px times its depth (the back wall most, the bed least) — sway the parallax
// and the room breathes as the site's does. `layers` a list of keys to draw
// (default all, back to front), `alpha` per key or one number, `chalk` the
// chalk copies, `clip` to the frame. Returns the glass's screen centre and
// size {cx, cy, w, h, rot}.
export function drawRoom(
	ctx,
	art,
	decade,
	{
		cx,
		cy,
		height,
		rot = 0,
		parallax = [0, 0],
		layers = null,
		alpha = 1,
		chalk = false,
		clip = true
	}
) {
	const room = roomOf(decade, art);
	const s = height / PLATE.H;
	const c = Math.cos(rot);
	const sn = Math.sin(rot);
	// plate units → screen px (y up in the plate, down on screen).
	const at = (x, y) => [cx + s * (c * x - sn * y), cy - s * (sn * x + c * y)];
	ctx.save();
	if (clip) {
		const hw = PLATE.W / 2;
		const hh = PLATE.H / 2;
		const P = [at(-hw, -hh), at(hw, -hh), at(hw, hh), at(-hw, hh)];
		ctx.beginPath();
		ctx.moveTo(P[0][0], P[0][1]);
		for (let i = 1; i < 4; i++) ctx.lineTo(P[i][0], P[i][1]);
		ctx.closePath();
		ctx.clip();
	}
	let glass = null;
	for (const cfg of LAYERS) {
		if (layers && !layers.includes(cfg.key)) continue;
		const L = room.lay[cfg.key];
		const a = art[decade]?.[cfg.key];
		if (!L || !a) continue;
		const al = typeof alpha === 'number' ? alpha : (alpha[cfg.key] ?? 1);
		const [px, py] = at(L.x, L.y);
		const ox = parallax[0] * L.depth;
		const oy = parallax[1] * L.depth;
		drawImageAt(ctx, chalk && a.chalk ? a.chalk : a.mips, px + ox, py + oy, L.w * s, L.h * s, {
			rot,
			alpha: al
		});
		if (cfg.key === 'screen' && room.glass) {
			const [gx, gy] = at(room.glass.x, room.glass.y);
			glass = { cx: gx + ox, cy: gy + oy, w: room.glass.w * s, h: room.glass.h * s, rot };
		}
	}
	ctx.restore();
	return glass;
}
