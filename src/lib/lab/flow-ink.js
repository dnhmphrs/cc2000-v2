import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	PAL,
	TAU,
	PHI,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	camera3,
	tag
} from './log/board.js';
import { drawOrb, impact, glow } from './log/ink.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';
import { loadRooms, roomOf, drawRoom, PLATE, DECADES, LAYERS } from './log/rooms.js';
import { drawHelix, poseOn } from './log/helix.js';

// ── Flow: ink — the simplest of the seven ────────────────────────────────────
// The whole run on the board, with the fewest beats there can be: the orb,
// the two questions on the way to it, the flash, and ONE beat after the last
// answer — the room drawn in ink out of the point, as a record's grooves
// that resolve into its lines — then the colour, and the room.
//
//   0–10 s   the terminal (log-dawn's, no command): the caret, the card's
//            three lines, the full stop typed last, which lights and is the
//            orb. The lens zooms into it; it ends on the orb at 6 px.
//   10–11.6  the orb alone, and round it the log map's rings as a few
//            concentric grooves in faint chalk (r = 2^{−k}, log-orb's rings,
//            no rays, no labels), written out of the orb, the innermost first.
//   11–13.1  when were you born? — written under the orb, the answer typed.
//   13.1–14.3 step: the lens goes one ring in (z ↦ 2z); the grooves slide
//            out past the edges, the prompt rides out with them, the orb
//            doubles and flares as the step lands.
//   14.6–16.6 name a spice — the same.
//   16.6–17.8 the second step.
//   17.8–19.6 the approach: the lens goes on into the point, gathering pace,
//            the last grooves streaming out, the orb filling the board.
//   19.6     THE FLASH (ink.js impact): a wash of light, a shock ring out of
//            the point. The orb closes back to the point it was. The
//            swimmer, once: a helix crossing the board through the point in
//            the light's decay, 0.9 s, and gone.
//   19.7–24.6 the one beat: THE ROOM DRAWN IN INK OUT OF THE POINT. First
//            grooves — fine concentric chalk rings, a record's, each as dark
//            or bright as the room's ink is on that circle — spread out of
//            the point to the corners (19.7–21.3). Behind them a front moves
//            out from the point and, as it passes, the grooves resolve into
//            the room's lines (the chalk copies of rooms.js): inside the
//            front the drawing, outside it the record, one motion outward.
//            The plate's frame is ruled as the front reaches the corners.
//   25–28.2  the colour floods in, layer by layer, the bed first and the
//            wall last; the plate settles from the point down into its
//            landing (25.4–28.4) and the parallax sway comes up with it; the
//            monitor's glass lights (27.2–28.8).
//   28.4–36  the room, held, swaying on its depths.
//
// Thirty-six seconds; a pure function of progress (?at= pins any frame).
// ?decade=50s|60s|90s|10s picks the room (90s by default). No maths on the
// page: the three lines, the two questions and their answers, the tag.

const SECONDS = 36;
const FLASH = 19.6;
const T = {
	term: 10,
	grooves: [10, 11.6],
	q1: [11.0, 11.7],
	a1: [11.9, 12.8],
	enter1: [12.85, 13.1],
	step1: [13.1, 14.3],
	q2: [14.6, 15.3],
	a2: [15.5, 16.3],
	enter2: [16.35, 16.6],
	step2: [16.6, 17.8],
	approach: [17.8, FLASH],
	close: [FLASH, FLASH + 0.3], // the orb back to the point
	point: [20.5, 21.8], // the point fading into the drawing
	swim: [FLASH, FLASH + 0.9],
	wave: [19.7, 21.3], // the grooves out to the corners
	develop: [19.9, 24.6], // the front resolving them into the lines
	frame: [24.1, 25.1],
	flood: {
		bed: [25.0, 26.1],
		desk: [25.3, 26.4],
		screen: [25.6, 26.7],
		clock: [25.9, 27.0],
		poster: [26.1, 27.2],
		bg: [26.6, 28.2]
	},
	land: [25.4, 28.4],
	sway: [26.5, 29.5],
	glass: [27.2, 28.8]
};

// The questions' zoom: one ring (ln 2) a step; then the approach, ×10 into
// the flash, gathering pace all the way.
const ZA = Math.log(10);
const ease = (t, s) => easeInOutCubic(span(t, s[0], s[1]));
const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));
const settle = (t) => {
	const x = clamp01(t);
	return x * x * x * (x * (6 * x - 15) + 10);
};
const zoomLog = (t) =>
	Math.LN2 * (ease(t, T.step1) + ease(t, T.step2)) + ZA * Math.pow(span(t, ...T.approach), 2.6);

const Q1 = { ...BIRTH, key: '' };
const Q2 = { ...SPICE, key: '' };

// The record: the grooves' pitch, plate units; the resolve's band, as a
// fraction of the distance to the plate's corner; the wall drawn a little
// past the frame so the sway never shows its edge.
const RMAX = Math.hypot(PHI, 1);
const PITCH = 0.028;
const BAND = 0.18;
const WALL_K = 1.08;

let OFF = null;

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	const time = clock(SECONDS, at);
	const term = makeTerminal(0.8, { cmd: false });
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-ink · loading the room');
	const art = await loadRooms({ decades: [decade], chalk: true });
	const prof = profileOf(art, decade);
	const depthOf = Object.fromEntries(LAYERS.map((l) => [l.key, l.depth]));
	warm(b, art, decade, depthOf);

	function render() {
		clearBoard(b);
		const { ctx, w, h, dpr } = b;
		const t = time.t;
		if (t < T.term) term.draw(ctx, w, h, t / 10, t, t - 10);
		else if (t < FLASH) questions(ctx, w, h, t);
		else inkRoom(ctx, w, h, dpr, t, art, decade, prof, depthOf);
		if (t >= FLASH) swimmer(ctx, w, h, t);
		impact(ctx, w, h, w / 2, h / 2, 0.3 * h, (t - FLASH) / 10, 0, 1, true);
		tag(ctx, w, h, 'flow-ink');
	}

	return {
		// `now` reads the run's clock (window.__lab.now()), for checking a
		// live frame against the same frame pinned.
		info: { seconds: SECONDS, decade, missing: art.missing, now: () => time.t },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── A ring, by arc ───────────────────────────────────────────────────────────
function ring(ctx, x, y, r, { color = PAL.chalk, width = 1, alpha = 1, upto = 1 } = {}) {
	if (alpha <= 0.004 || r <= 0 || upto <= 0) return;
	ctx.save();
	ctx.globalAlpha = Math.min(1, alpha);
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, upto));
	ctx.stroke();
	ctx.restore();
}

// ── The approach and the questions ───────────────────────────────────────────
// The orb at the centre on the clock it was born on (the terminal's ends at
// zero), and the rings r = 2^{−k} round it in faint chalk — a few grooves —
// through a view that zooms by one ring a step and then on into the point.
function questions(ctx, w, h, t) {
	const secs = t - T.term;
	const S0 = 0.7 * h; // the ring r = 1
	const viewAt = (zz) => makeView({ w, h, scale: S0 * Math.exp(Math.LN2 * zz) });
	const Z = zoomLog(t);
	const view = viewAt(Z / Math.LN2);
	const S = view.scale;
	const cx = w / 2;
	const cy = h / 2;
	const orbPx = ORB_R * Math.exp(Z);
	const diag = Math.hypot(w, h) / 2;
	const fade = (rpx) => smooth(span(rpx, orbPx * 1.5, orbPx * 1.5 + 30));
	const kLo = Math.ceil(Math.log2(S / (diag * 1.05)));
	const kHi = Math.floor(Math.log2(S / (orbPx * 1.6)));
	for (let k = kLo; k <= kHi; k++) {
		const rpx = Math.pow(2, -k) * S;
		const tk = T.grooves[0] + 0.16 * Math.max(0, 5 - k);
		const up = smooth(span(t, tk, tk + 0.7));
		ring(ctx, cx, cy, rpx, { width: 1.1, alpha: 0.3 * fade(rpx), upto: up });
	}
	const flare = bump(t, T.step1[1] - 0.12, 0.3) + bump(t, T.step2[1] - 0.12, 0.3);
	drawOrb(ctx, cx, cy, orbPx, secs, { flare, halo: 1 - 0.6 * span(t, ...T.approach) });
	drawPrompt(ctx, view, viewAt(0), h, Q1, {
		q: span(t, ...T.q1),
		a: span(t, ...T.a1),
		enter: span(t, ...T.enter1),
		alpha: 1 - smooth(span(t, T.step1[0] + 0.2, T.step1[0] + 0.85)),
		secs: t
	});
	drawPrompt(ctx, view, viewAt(1), h, Q2, {
		q: span(t, ...T.q2),
		a: span(t, ...T.a2),
		enter: span(t, ...T.enter2),
		alpha: 1 - smooth(span(t, T.step2[0] + 0.2, T.step2[0] + 0.85)),
		secs: t
	});
}

// ── The swimmer: once, through the flash ─────────────────────────────────────
function swimmer(ctx, w, h, t) {
	const u = span(t, ...T.swim);
	if (u <= 0 || u >= 1) return;
	const cam = camera3({ pos: [0, 0, 10], target: [0, 0, 0], fov: 40, w, h });
	const A = [-7.2, -3.3, 0];
	const B = [8.4, 3.85, 0];
	const path = (x) => [lerp(A[0], B[0], x), lerp(A[1], B[1], x), lerp(A[2], B[2], x)];
	const pose = poseOn(path, u, t * 2.6 * Math.PI, 0.3);
	const alpha = smooth(span(u, 0, 0.1)) * (1 - smooth(span(u, 0.82, 1)));
	drawHelix(ctx, cam, pose, { alpha, width: 2.6, core: 0.9, glow: 0.5 });
}

// ── The room's ink on a circle ───────────────────────────────────────────────
// The chalk copies composited flat once, and the mean of their ink on each
// circle round the plate's centre — the record's profile: how much the room
// draws at that radius. Returns prof(r), plate units, 0..1.
function profileOf(art, decade) {
	const H = 400;
	const W = Math.round(H * PHI);
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const x = c.getContext('2d', { willReadFrequently: true });
	drawRoom(x, art, decade, { cx: W / 2, cy: H / 2, height: H, chalk: true });
	const d = x.getImageData(0, 0, W, H).data;
	const s = H / 2;
	const N = 240;
	const dr = RMAX / N;
	const raw = new Float32Array(N + 1);
	for (let i = 0; i <= N; i++) {
		const r = i * dr * s;
		const m = Math.max(32, Math.round(r * 1.6));
		let sum = 0;
		let n = 0;
		for (let j = 0; j < m; j++) {
			const a = (TAU * j) / m;
			const px = Math.round(W / 2 + r * Math.cos(a));
			const py = Math.round(H / 2 - r * Math.sin(a));
			if (px < 0 || py < 0 || px >= W || py >= H) continue;
			sum += d[(py * W + px) * 4 + 3] / 255;
			n++;
		}
		raw[i] = n ? sum / n : 0;
	}
	const P = new Float32Array(N + 1);
	let mx = 1e-6;
	for (let i = 0; i <= N; i++) {
		P[i] = (raw[Math.max(0, i - 1)] + 2 * raw[i] + raw[Math.min(N, i + 1)]) / 4;
		if (i * dr < 1.2) mx = Math.max(mx, P[i]);
	}
	return (r) => {
		const f = clamp01(r / RMAX) * N;
		const i = Math.min(N - 1, Math.floor(f));
		return Math.min(1, lerp(P[i], P[i + 1], f - i) / mx);
	};
}

// ── The plate ────────────────────────────────────────────────────────────────
// Where the room lands (log-arrival's): centred a little low, 0.62 of the
// board tall at most; and where it is drawn out of the point: centred on it,
// a fifth larger. V = { cx, cy, height } px.
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: 0.535 * h, height };
}
function plateAt(w, h, t) {
	const L = landing(w, h);
	const k = settle(span(t, ...T.land));
	return { cx: w / 2, cy: lerp(h / 2, L.cy, k), height: lerp(1.2 * L.height, L.height, k) };
}
const plateRect = (V) => {
	const s = V.height / PLATE.H;
	return [V.cx - PLATE.W * s * 0.5, V.cy - PLATE.H * s * 0.5, PLATE.W * s, PLATE.H * s];
};

// The room through rooms.js's drawRoom, a layer at a time: the chalk copy
// and the colour of each at their own alphas, the wall drawn a little past
// the frame (the sway slides it), the glass filled board-dark under the
// screen's colour and lit (`glassA`) where the answer goes.
function drawPlate(ctx, art, decade, V, depthOf, { par = [0, 0], chalkA, colourA, glassA = 0 }) {
	const { cx, cy, height } = V;
	const s = height / PLATE.H;
	const R = roomOf(decade, art);
	const [rx, ry, rw, rh] = plateRect(V);
	ctx.save();
	ctx.beginPath();
	ctx.rect(rx, ry, rw, rh);
	ctx.clip();
	const one = (key, chalk, alpha, hh) =>
		drawRoom(ctx, art, decade, {
			cx,
			cy,
			height: hh,
			parallax: par,
			layers: [key],
			alpha,
			chalk,
			clip: false
		});
	for (const cfg of LAYERS) {
		const key = cfg.key;
		if (key === 'screen' && R.glass) {
			const ox = par[0] * depthOf.screen;
			const oy = par[1] * depthOf.screen;
			const G = {
				cx: cx + s * R.glass.x + ox,
				cy: cy - s * R.glass.y + oy,
				w: R.glass.w * s,
				h: R.glass.h * s
			};
			glassOf(ctx, G, colourA[key] ?? 0, glassA);
		}
		const hh = key === 'bg' ? height * WALL_K : height;
		const ca = chalkA[key] ?? 0;
		const co = colourA[key] ?? 0;
		if (ca > 0.002) one(key, true, ca, hh);
		if (co > 0.002) one(key, false, co, hh);
	}
	ctx.restore();
}

// The glass: the board in it (so the wall never shows through), and the
// warm light the answer is written in.
function glassOf(ctx, G, fill, a) {
	if (fill > 0.002) {
		ctx.save();
		ctx.globalAlpha = fill;
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(G.cx - G.w / 2 - 0.5, G.cy - G.h / 2 - 0.5, G.w + 1, G.h + 1);
		ctx.restore();
	}
	if (a <= 0.005) return;
	ctx.save();
	ctx.beginPath();
	ctx.rect(G.cx - G.w / 2, G.cy - G.h / 2, G.w, G.h);
	ctx.clip();
	glow(ctx, G.cx, G.cy, 0.62 * Math.min(G.w, G.h), [255, 220, 150], 0.4 * a);
	ctx.restore();
	const P = [
		[G.cx - G.w / 2, G.cy - G.h / 2],
		[G.cx + G.w / 2, G.cy - G.h / 2],
		[G.cx + G.w / 2, G.cy + G.h / 2],
		[G.cx - G.w / 2, G.cy + G.h / 2],
		[G.cx - G.w / 2, G.cy - G.h / 2]
	];
	stroke(ctx, P, { color: PAL.gold, width: 1.2, alpha: 0.32 * a });
}

// The offscreen the chalk room is resolved through: the plate's rectangle
// and a little round it, device pixels, cleared and set to draw in the
// board's CSS pixels. { c, ctx, x, y, w, h }: where it sits on the board.
function offFor(dpr, V) {
	const [rx, ry, rw, rh] = plateRect(V);
	const x = Math.floor(rx) - 2;
	const y = Math.floor(ry) - 2;
	const w = Math.ceil(rw) + 4;
	const h = Math.ceil(rh) + 4;
	const PW = Math.ceil(w * dpr);
	const PH = Math.ceil(h * dpr);
	if (!OFF || OFF.width !== PW || OFF.height !== PH) {
		OFF = document.createElement('canvas');
		OFF.width = PW;
		OFF.height = PH;
	}
	const ctx = OFF.getContext('2d');
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalCompositeOperation = 'source-over';
	ctx.clearRect(0, 0, PW, PH);
	ctx.setTransform(dpr, 0, 0, dpr, -dpr * x, -dpr * y);
	return { c: OFF, ctx, x, y, w, h };
}

// The first draw of the room's pictures is the slow one (they go up to the
// GPU then): done once at load, into the offscreen, so the develop's first
// frame — right after the flash — does not hitch.
function warm(b, art, decade, depthOf) {
	const V = plateAt(b.w, b.h, 0);
	const O = offFor(b.dpr, V);
	const all = Object.fromEntries(LAYERS.map((l) => [l.key, 1]));
	drawPlate(O.ctx, art, decade, V, depthOf, { chalkA: all, colourA: all, glassA: 1 });
	O.ctx.setTransform(1, 0, 0, 1, 0, 0);
	O.ctx.clearRect(0, 0, O.c.width, O.c.height);
}

// The landing sway (log-arrival's): px of slide per unit of depth.
function sway(s, secs, amp) {
	const A = 0.116 * s * amp;
	return [A * Math.sin(1.1 * secs - 0.4), -0.45 * A * Math.sin(1.7 * secs + 0.6)];
}

// ── The one beat: the room drawn in ink out of the point ─────────────────────
function inkRoom(ctx, w, h, dpr, t, art, decade, prof, depthOf) {
	const V = plateAt(w, h, t);
	const s = V.height / PLATE.H;
	const px = w / 2; // the point
	const py = h / 2;
	const Rc = RMAX * s; // the plate's corner, from its centre
	const band = BAND * Rc;
	const wave = 1 - Math.pow(1 - span(t, ...T.wave), 3);
	const G = Rc * 1.03 * wave;
	const F = (Rc * 1.03 + band) * easeInOutCubic(span(t, ...T.develop));
	const colourA = Object.fromEntries(
		Object.entries(T.flood).map(([k, win]) => [k, smooth(span(t, ...win))])
	);
	const chalkA = Object.fromEntries(Object.keys(T.flood).map((k) => [k, 1 - colourA[k]]));
	const par = sway(s, t, smooth(span(t, ...T.sway)));
	const glassA = smooth(span(t, ...T.glass));

	// The grooves: the record, out of the point, each ring as strong as the
	// room's ink on it; gone where the front has passed.
	if (G > 0 && F - band < Rc * 1.03) {
		const n = Math.ceil(RMAX / PITCH);
		for (let i = 0; i < n; i++) {
			const r = (i + 0.5) * PITCH;
			const rp = r * s;
			if (rp > G) break;
			const fin = smooth(span(G - rp, 0, 0.1 * s));
			const res = smooth(span(rp, F - band, F));
			const a = (0.1 + 0.6 * prof(r)) * fin * res;
			ring(ctx, px, py, rp, { width: 1, alpha: a });
		}
	}

	// The lines: the chalk room inside the front, resolved through a soft
	// disc; drawn whole once the front is past the corners.
	if (F >= Rc * 1.03 + band) {
		drawPlate(ctx, art, decade, V, depthOf, { par, chalkA, colourA, glassA });
	} else if (F > 0) {
		const O = offFor(dpr, V);
		const x = O.ctx;
		// Only the disc the front has reached is drawn (and masked): while
		// the front is small, so is the work.
		x.save();
		x.beginPath();
		x.arc(px, py, F + 1, 0, TAU);
		x.clip();
		drawPlate(x, art, decade, V, depthOf, { chalkA, colourA: {} });
		const r0 = Math.max(0, F - band);
		const g = x.createRadialGradient(px, py, r0, px, py, Math.max(F, r0 + 1));
		g.addColorStop(0, 'rgba(0,0,0,1)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		x.globalCompositeOperation = 'destination-in';
		x.fillStyle = g;
		x.fillRect(px - F - 2, py - F - 2, 2 * F + 4, 2 * F + 4);
		x.restore();
		const bx = Math.max(O.x, Math.floor(px - F - 2));
		const by = Math.max(O.y, Math.floor(py - F - 2));
		const bw = Math.min(O.x + O.w, Math.ceil(px + F + 2)) - bx;
		const bh = Math.min(O.y + O.h, Math.ceil(py + F + 2)) - by;
		if (bw > 0 && bh > 0)
			ctx.drawImage(O.c, (bx - O.x) * dpr, (by - O.y) * dpr, bw * dpr, bh * dpr, bx, by, bw, bh);
	}

	// The plate's frame, ruled as the front reaches the corners.
	const fr = span(t, ...T.frame);
	if (fr > 0) {
		const [rx, ry, rw, rh] = plateRect(V);
		stroke(
			ctx,
			[
				[rx, ry],
				[rx + rw, ry],
				[rx + rw, ry + rh],
				[rx, ry + rh],
				[rx, ry]
			],
			{ color: PAL.chalk, width: 1.4, alpha: 0.85, upto: smooth(fr) }
		);
	}

	// The point: the orb closes back to the point it was, then fades into the
	// drawing round it.
	const close = smooth(span(t, ...T.close));
	const fadeP = 1 - smooth(span(t, ...T.point));
	if (fadeP > 0.002) {
		const rF = ORB_R * Math.exp(zoomLog(FLASH));
		ctx.save();
		ctx.globalAlpha = fadeP;
		drawOrb(ctx, px, py, lerp(rF, ORB_R, close), t - T.term, { halo: 0.4 * close * fadeP });
		ctx.restore();
	}
}
