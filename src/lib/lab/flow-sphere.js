import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	PAL,
	TAU,
	PHI,
	GOLDEN_K,
	C,
	span,
	smooth,
	lerp,
	easeInOutCubic,
	clock,
	tag,
	norm,
	dot
} from './log/board.js';
import { orbit, pxPerUnit, paint, limb, curl, lerp3, NEAR } from './log/space.js';
import { drawOrb, glow, impact, lit } from './log/ink.js';
import { drawHelix, poseOn } from './log/helix.js';
import { loadRooms, roomOf, drawRoom, drawImageAt, DECADES, LAYERS, PLATE } from './log/rooms.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';

// ── Flow: flow-sphere — Garrett's sphere ─────────────────────────────────────
// "Trim it back to just a golden sphere in the center. Have the sphere do 1
// design transition to get us to the lines being drawn on it and then carry
// out the rest of the sequence as is." A whole run, 40 s, on the board:
//
//    0–10   the terminal (log-dawn's, no command): the caret, the three lines,
//           the full stop, which lights and is the orb — 6 px at the centre.
//   10–19.6 the approach. The orb grows into a GOLDEN SPHERE in the centre:
//           lit from the top left, breathing (the orb's own breath, carried
//           on), a limb in ink once it is big enough to have one. The two
//           questions are written below it and answered on the clock, and
//           each answer flies the lens a step closer — the sphere ×4, then
//           ×3.6, the prompt flown past underneath — with a slow creep in
//           between so nothing is ever still. Nothing else is on the board:
//           the sphere IS the geometry; the lines come later, as asked.
//   19.0    a glint: the helix swimmer crosses the lower left into the
//           sphere's near point — 0.4 s in frame — and the flash takes it.
//   19.6    the flash (ink.js impact). The gold drains out of the sphere into
//           a lit point at the pole facing the lens; the sphere is left in
//           ink, a limb and a faint body.
//   19.8–27.5 THE ONE TRANSITION: lines are drawn on the sphere. The loxodrome
//           net — eight golden loxodromes x = log|z|, θ = x/K (the lead's
//           cyan family) and eight at pitch 0.9 the other way (the pink) —
//           lifted onto the Riemann sphere, in chalk only, each line writing
//           itself out of the lit pole, round the back (faint, dashed, the
//           plates' hidden lines) and into the far pole. The sphere turns on
//           its axis like a record from the flash on, and the lens swings out
//           to the side and over the top (so the lines are seen wrapped on a
//           ball) and comes back square to the pole: from there the lines
//           are log spirals converging into the lit point — the grooves, and
//           the hole.
//   27.5–33.5 ONE MOVE: the lens dives at the pole. The lines stream outward
//           past the edges as it closes, the lit point grows, and the room
//           comes up out of it from the centre, in chalk, its monitor's glass
//           on the point; colour floods in by depth (the bed first, the wall
//           last) as the lens pans off the glass onto the room, which eases
//           to land, the parallax built by the pan and the sway.
//   33.5–40 the room, in colour, the glass lit, swaying on its depths.
//
// Two beats between the last answer and the room: the transition, the dive.
// Every frame is a pure function of t: ?at= pins it. No depth buffer: the
// lines lie on the sphere, so a point is hidden exactly when it is past the
// horizon circle the lens sees, dot(p, n̂) < ρ²/D, and that test is used
// instead of rasterising the sphere.

const SECONDS = 40;
const FOV = 36;
const K = GOLDEN_K; // the grooves' pitch: golden loxodromes
const KP = 0.9; // the cross family's pitch, the other way
const N = 8; // arms in each family
const X = 4.2; // the arms run x = log|z| ∈ [−X, X]: to within 0.03 of each pole
const F1 = 4.0; // the first answer's step: the sphere ×4 on screen
const F2 = 3.6; // the second's
const R_HIT = 0.31; // the sphere's radius at the flash, of h
const D_SWING = 3.6; // the lens's distance (sphere radius 1) at the end of the swing
const D_LAND = 1.25; // and when the room has landed
const H_ROOM = 0.7; // the landed room's height, of h
const OMEGA = 0.63; // the record's turn, rad/s (a turn every ten seconds)

// The beats, in seconds.
const T = {
	term: 10,
	q1: [10.5, 11.2],
	a1: [11.5, 12.6],
	enter1: [12.65, 12.9],
	step1: [12.9, 14.4],
	q2: [14.6, 15.2],
	a2: [15.5, 16.1],
	enter2: [16.15, 16.4],
	step2: [16.4, 18.0],
	glint: [19.0, 19.62],
	hit: 19.6,
	drain: [19.7, 21.0],
	linesA: [19.8, 24.6], // the K family writes on (+0.12 s an arm)
	linesB: [20.8, 25.2], // the cross family (+0.1 s an arm)
	swing: [19.6, 27.5],
	dive: [27.5, 33.5],
	poleUp: [27.5, 30.5],
	roomIn: [28.3, 29.3],
	poleOut: [30.0, 31.6],
	glassOn: [30.4, 32.4],
	pan: [31.0, 33.5],
	colour: 31.0, // + 1.5 × a layer's depth, 0.9 s each: the bed first, the wall last
	linesOut: [32.0, 33.8],
	limbOut: [29.0, 31.5],
	land: 33.5
};

const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));
// The orb's breath (ink.js drawOrb's), so the sphere breathes with it.
const breath = (secs) =>
	1 + 0.07 * Math.sin((TAU * secs) / 3.4) + 0.025 * Math.sin((TAU * secs) / 1.3 + 1.1);

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	const time = clock(SECONDS, at);
	const term = makeTerminal(0.8, { cmd: false });
	const arms = makeArms();
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-sphere · loading the room');
	const t0 = performance.now();
	const art = await loadRooms({ decades: [decade], chalk: true });
	const loadMs = Math.round(performance.now() - t0);
	const room = roomOf(decade, art);

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (t < T.term) term.draw(ctx, w, h, t / T.term, t, t - T.term);
		else flow(ctx, w, h, t, art, decade, room, arms);
		tag(ctx, w, h, 'flow-sphere');
	}

	return {
		info: { seconds: SECONDS, decade, loadMs, missing: art.missing },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The flight ───────────────────────────────────────────────────────────────
// The sphere's radius on screen before the flash: from the orb's 6 px, a
// slow creep in, and one eased step per answer.
function radiusAt(t, h) {
	const e1 = easeInOutCubic(span(t, ...T.step1));
	const e2 = easeInOutCubic(span(t, ...T.step2));
	const creep = Math.log((R_HIT * h) / (ORB_R * F1 * F2)) / (T.hit - T.term);
	return (
		ORB_R * Math.exp(creep * (Math.min(t, T.hit) - T.term)) * Math.pow(F1, e1) * Math.pow(F2, e2)
	);
}

// The lens's distance from the centre (the sphere's radius is 1): set by the
// radius on screen up to the flash, then the swing in and the dive.
function distAt(t, h) {
	const k = pxPerUnit(h, FOV);
	if (t < T.hit) return Math.sqrt(1 + (k / radiusAt(t, h)) ** 2);
	const dHit = Math.sqrt(1 + (k / (R_HIT * h)) ** 2);
	return (
		dHit -
		(dHit - D_SWING) * smooth(span(t, ...T.swing)) -
		(D_SWING - D_LAND) * easeInOutCubic(span(t, ...T.dive))
	);
}

// The record's turn: from rest at the flash, up to OMEGA.
function turnAt(t) {
	const tau = Math.max(0, t - T.hit);
	return -OMEGA * (tau - 1.5 * (1 - Math.exp(-tau / 1.5)));
}

// ── The net, precomputed on the unit sphere ──────────────────────────────────
// In ζ = log z = x + iθ: K-arm j is θ = x/K + 2πj/N, cross arm j is
// θ = −x/KP + 2π(j + ½)/N; each carried to the Riemann sphere (space.js curl,
// the pole 0 at (0, 0, 1) facing the lens) with its cumulative length, so it
// can be written on at a steady pace across the sphere.
function makeArms() {
	const arms = [];
	const fams = [
		{ slope: 1 / K, off: 0, dx: 0.02, f: 0 }, // 96 points a turn
		{ slope: -1 / KP, off: 0.5, dx: 0.04, f: 1 }
	];
	for (const { slope, off, dx, f } of fams)
		for (let j = 0; j < N; j++) {
			const n = Math.ceil((2 * X) / dx);
			const pts = [];
			const cum = new Float32Array(n + 1);
			let L = 0;
			for (let i = 0; i <= n; i++) {
				const x = -X + (2 * X * i) / n;
				const p = curl(C.exp([x, slope * x + (TAU * (j + off)) / N]), 1);
				if (i) {
					const o = pts[i - 1];
					L += Math.hypot(p[0] - o[0], p[1] - o[1], p[2] - o[2]);
				}
				cum[i] = L;
				pts.push(p);
			}
			arms.push({ pts, cum, L, f, j });
		}
	return arms;
}

// Draw the net: the sphere of radius `rho` turned by `phi` about its axis,
// each arm written to `wOf(arm)` of its length; the far side faint and
// dashed (`hid`), the near side bold, wider the nearer (`ref`). A point well
// outside the frame (more than half a frame past its edge) ends its run: in
// the dive most of the net is far off the board, and the arms are sampled
// closely enough that no piece crossing the frame is lost.
function drawNet(ctx, cam, arms, w, h, { rho, phi, D, wOf, alpha, hid, ref }) {
	const c = Math.cos(phi);
	const s = Math.sin(phi);
	const nh = norm(cam.pos);
	const lim = (rho * rho) / D;
	const runs = [[], []];
	const x0 = -0.6 * w;
	const x1 = 1.6 * w;
	const y0 = -0.6 * h;
	const y1 = 1.6 * h;
	for (const arm of arms) {
		const wr = wOf(arm);
		if (wr <= 0) continue;
		const target = wr * arm.L;
		let run = null;
		const end = () => {
			if (run && run.Q.length > 1) runs[arm.f].push(run);
			run = null;
		};
		for (let i = 0; i < arm.pts.length; i++) {
			if (arm.cum[i] > target) break;
			const p0 = arm.pts[i];
			const p = [rho * (c * p0[0] - s * p0[1]), rho * (s * p0[0] + c * p0[1]), rho * p0[2]];
			const q = cam.project(p);
			if (
				q[2] <= NEAR ||
				!Number.isFinite(q[0] + q[1]) ||
				q[0] < x0 ||
				q[0] > x1 ||
				q[1] < y0 ||
				q[1] > y1
			) {
				end();
				continue;
			}
			const back = dot(p, nh) < lim;
			if (run && back !== run.back) {
				run.Q.push([q[0], q[1], q[2], 1]);
				end();
			}
			if (!run) run = { Q: [], back };
			run.Q.push([q[0], q[1], q[2], 1]);
		}
		end();
	}
	const o = [
		{ color: PAL.chalk, width: 2.1, alpha: 0.9 * alpha, ref, hid },
		{ color: PAL.chalk, width: 1.3, alpha: 0.5 * alpha, ref, hid }
	];
	paint(ctx, runs[1], o[1], 'back');
	paint(ctx, runs[0], o[0], 'back');
	paint(ctx, runs[1], o[1], 'front');
	paint(ctx, runs[0], o[0], 'front');
}

// ── The golden sphere ────────────────────────────────────────────────────────
// A ball lit from the top left — cream at the highlight, gold, dark amber at
// the limb — on the warm light it throws on the board.
function goldBall(ctx, x, y, R, a, pulse) {
	if (a <= 0.003 || R <= 0) return;
	glow(ctx, x, y, R * 2.8, [245, 180, 70], (0.2 + 0.1 * pulse) * a);
	ctx.save();
	ctx.globalAlpha = a;
	const g = ctx.createRadialGradient(
		x - 0.3 * R,
		y - 0.32 * R,
		0,
		x - 0.08 * R,
		y - 0.08 * R,
		R * 1.12
	);
	g.addColorStop(0, '#fff4d6');
	g.addColorStop(0.22, '#f8d479');
	g.addColorStop(0.55, PAL.gold);
	g.addColorStop(0.85, '#9a6a1e');
	g.addColorStop(1, '#3e2a0c');
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// The monitor's glass, lit: a warm glow kept to the glass, a thin gold edge.
function glassLight(ctx, G, a) {
	if (!G || a <= 0.003) return;
	ctx.save();
	ctx.translate(G.cx, G.cy);
	ctx.rotate(-(G.rot ?? 0));
	ctx.beginPath();
	ctx.rect(-G.w / 2, -G.h / 2, G.w, G.h);
	ctx.clip();
	glow(ctx, 0, 0, 0.8 * Math.max(G.w, G.h), [255, 214, 140], 0.7 * a);
	ctx.restore();
	stroke(ctx, rectQuad(G.cx, G.cy, G.w, G.h, G.rot ?? 0, true), {
		color: PAL.gold,
		width: 1.2,
		alpha: 0.35 * a
	});
}

// The wall, drawn by hand rather than by drawRoom: it slides the most under
// the parallax, so it is mirror-tiled past the frame on the side its slide
// opens (log-arrival's wallCover), and the plate never shows the board
// behind it. Clipped to the plate.
function drawWall(ctx, art, decade, room, { cx, cy, s, par, alpha, chalk }) {
	const L = room.lay.bg;
	const a = art[decade]?.bg;
	if (!L || !a || alpha <= 0.002) return;
	const img = chalk ? a.chalk : a.mips;
	const ox = par[0] * L.depth;
	const oy = par[1] * L.depth;
	const px = cx + s * L.x + ox;
	const py = cy - s * L.y + oy;
	const W = L.w * s;
	const H = L.h * s;
	ctx.save();
	ctx.beginPath();
	ctx.rect(cx - (s * PLATE.W) / 2, cy - (s * PLATE.H) / 2, s * PLATE.W, s * PLATE.H);
	ctx.clip();
	const ti = Math.abs(ox) > 0.5 ? -Math.sign(ox) : 0;
	const tj = Math.abs(oy) > 0.5 ? -Math.sign(oy) : 0;
	const tiles = [[0, 0]];
	if (ti) tiles.push([ti, 0]);
	if (tj) tiles.push([0, tj]);
	if (ti && tj) tiles.push([ti, tj]);
	for (const [i, j] of tiles) {
		ctx.save();
		ctx.translate(px + i * W, py + j * H);
		ctx.scale(i ? -1 : 1, j ? -1 : 1);
		drawImageAt(ctx, img, 0, 0, W, H, { alpha });
		ctx.restore();
	}
	ctx.restore();
}

// The lit point at the pole facing the lens: the gold, collected; the hole.
function polePoint(ctx, cam, rho, t, drain) {
	const a = drain * (1 - smooth(span(t, ...T.poleOut)));
	if (a <= 0.005) return;
	const qp = cam.project([0, 0, rho]);
	if (qp[2] <= NEAR) return;
	lit(ctx, qp[0], qp[1], lerp(5, 8, drain) + 20 * smooth(span(t, ...T.poleUp)), a);
}

function rectQuad(cx, cy, w, h, rot = 0, close = false) {
	const c = Math.cos(rot);
	const s = Math.sin(rot);
	const P = [
		[-w / 2, -h / 2],
		[w / 2, -h / 2],
		[w / 2, h / 2],
		[-w / 2, h / 2]
	].map(([x, y]) => [cx + c * x - s * y, cy - (s * x + c * y)]);
	return close ? [...P, P[0]] : P;
}

// ── The run, from the orb on ─────────────────────────────────────────────────
function flow(ctx, w, h, t, art, decade, room, arms) {
	const secs = t - T.term; // the orb's clock, as the terminal hands it on
	const cx = w / 2;
	const cy = h / 2;
	const k = pxPerUnit(h, FOV);
	const D = distAt(t, h);
	// The breath: the sphere's radius breathes with the orb until the flash,
	// and the record is steady.
	const br = breath(secs);
	const amp = 1 - smooth(span(t, T.hit, T.hit + 2.2));
	const rho = 1 + (br - 1) * amp;
	const sw = span(t, ...T.swing);
	const cam = orbit(w, h, {
		target: [0, 0, 0],
		az: 0.95 * Math.sin(Math.PI * sw) ** 2,
		el: 0.5 * Math.sin(Math.PI * span(t, 21, T.swing[1])) ** 2,
		dist: D,
		fov: FOV
	});
	// The sphere's outline on screen (at D ≫ 1 the orb's own radius).
	const rl = (k * rho) / Math.sqrt(D * D - rho * rho);
	const rpx = t < T.hit ? radiusAt(t, h) : R_HIT * h;

	// ── The orb, and the sphere it grows into ────────────────────────────
	const form = smooth(span(rpx, 25, 80)); // light → golden sphere
	const drain = smooth(span(t, ...T.drain)); // the gold out of it, at the flash
	const flare =
		0.8 * bump(t, T.step1[1] - 0.1, 0.25) +
		0.8 * bump(t, T.step2[1] - 0.1, 0.25) +
		bump(t, T.hit, 0.1);
	if (form > 0 && drain < 1) {
		goldBall(ctx, cx, cy, rl, form * (1 - drain), (br - 1) / 0.07);
		if (flare > 0.01)
			glow(ctx, cx, cy, rl * 1.4, [255, 240, 200], 0.6 * flare * form * (1 - drain));
	}
	if (form < 1) {
		ctx.save();
		ctx.globalAlpha = 1 - form;
		drawOrb(ctx, cx, cy, rl / br, secs, { flare, gold: smooth(span(t, 10, 14)), halo: 1 - form });
		ctx.restore();
	}
	// The dimmed body after the flash: a little warmth left in it.
	const after = drain * (1 - smooth(span(t, T.dive[0], 30)));
	if (after > 0.01) glow(ctx, cx, cy, rl, [245, 170, 50], 0.1 * after);
	// The limb in ink.
	const limbA = span(rpx, 40, 110) * (1 - smooth(span(t, ...T.limbOut)));
	limb(ctx, cam, limbA, [0, 0, 0], rho, PAL.chalk);

	// ── The lines, drawn on ──────────────────────────────────────────────
	const netA = 1 - smooth(span(t, ...T.linesOut));
	if (t >= T.linesA[0] && netA > 0.005) {
		const wOf = (arm) =>
			arm.f === 0
				? smooth(span(t, T.linesA[0] + 0.12 * arm.j, T.linesA[1] + 0.12 * arm.j))
				: smooth(span(t, T.linesB[0] + 0.1 * arm.j, T.linesB[1] + 0.1 * arm.j));
		drawNet(ctx, cam, arms, w, h, {
			rho,
			phi: turnAt(t),
			D,
			wOf,
			alpha: netA,
			hid: 0.32 * (1 - smooth(span(t, T.dive[0], 30))),
			ref: D - rho
		});
	}

	// ── The lit point at the pole, until the room's hole opens on it ─────
	const ra = smooth(span(t, ...T.roomIn));
	if (ra <= 0) polePoint(ctx, cam, rho, t, drain);

	// ── The questions, on the way in ─────────────────────────────────────
	if (t < T.step2[1] + 1) {
		const S0 = 0.47 * h;
		const e1 = easeInOutCubic(span(t, ...T.step1));
		const e2 = easeInOutCubic(span(t, ...T.step2));
		const view = makeView({ w, h, scale: S0 * Math.pow(F1, e1) * Math.pow(F2, e2) });
		const rest1 = makeView({ w, h, scale: S0 });
		const rest2 = makeView({ w, h, scale: S0 * F1 });
		drawPrompt(
			ctx,
			view,
			rest1,
			h,
			{ ...BIRTH, key: '' },
			{
				q: span(t, ...T.q1),
				a: span(t, ...T.a1),
				enter: span(t, ...T.enter1),
				alpha: 1 - smooth(span(t, T.step1[0] + 0.15, T.step1[0] + 0.8)),
				secs: t
			}
		);
		drawPrompt(
			ctx,
			view,
			rest2,
			h,
			{ ...SPICE, key: '' },
			{
				q: span(t, ...T.q2),
				a: span(t, ...T.a2),
				enter: span(t, ...T.enter2),
				alpha: 1 - smooth(span(t, T.step2[0] + 0.15, T.step2[0] + 0.8)),
				secs: t
			}
		);
	}

	// ── The glint: the swimmer, into the point, through the flash ────────
	const g = span(t, ...T.glint);
	if (g > 0 && g < 1) {
		const P0 = [-1.7, -1.05, 3.1];
		const P1 = [0, 0, rho];
		const pose = poseOn((u) => lerp3(P0, P1, u), Math.pow(g, 0.9), t * 2.6 * Math.PI, 0.07);
		const a = smooth(span(g, 0, 0.2)) * (1 - smooth(span(g, 0.82, 1)));
		drawHelix(ctx, cam, pose, { alpha: a, width: 2.2, glow: 0.25, core: 0.9 });
	}

	// ── The room, up out of the point ────────────────────────────────────
	if (ra > 0) {
		const hpx = (H_ROOM * h * (D_LAND - 1)) / (D - 1);
		const s = hpx / PLATE.H;
		const pan = smooth(span(t, ...T.pan));
		// The plate hangs off the glass, which sits on the point, until the
		// pan brings the plate to the centre; the far layers lag the pan.
		const gx = room.glass ? room.glass.x : 0;
		const gy = room.glass ? room.glass.y : 0;
		const shift = [gx * s * pan, -gy * s * pan];
		const rcx = cx - gx * s + shift[0];
		const rcy = cy + gy * s + shift[1];
		const swayA = 0.116 * s * smooth(span(t, 29.5, T.land));
		const par = [
			swayA * Math.sin(1.1 * secs - 0.4) - 0.22 * shift[0],
			-0.45 * swayA * Math.sin(1.7 * secs + 0.6) - 0.22 * shift[1]
		];
		// The hole: the board, wiped of the lines, inside the plate — and the
		// lit point in it, where the glass is, until the glass lights.
		ctx.save();
		ctx.globalAlpha = ra;
		ctx.fillStyle = PAL.ground;
		ctx.fillRect(rcx - (hpx * PHI) / 2, rcy - hpx / 2, hpx * PHI, hpx);
		ctx.restore();
		polePoint(ctx, cam, rho, t, drain);
		let G = null;
		for (const cfg of LAYERS) {
			const c0 = T.colour + 1.5 * cfg.depth;
			const ck = smooth(span(t, c0, c0 + 0.9));
			if (cfg.key === 'bg') {
				const wall = { cx: rcx, cy: rcy, s, par };
				if (ck < 0.998)
					drawWall(ctx, art, decade, room, { ...wall, alpha: ra * (1 - ck), chalk: true });
				if (ck > 0.002) drawWall(ctx, art, decade, room, { ...wall, alpha: ra * ck, chalk: false });
				continue;
			}
			const base = { cx: rcx, cy: rcy, height: hpx, parallax: par, layers: [cfg.key] };
			if (ck < 0.998)
				G = drawRoom(ctx, art, decade, { ...base, alpha: ra * (1 - ck), chalk: true }) ?? G;
			if (ck > 0.002) G = drawRoom(ctx, art, decade, { ...base, alpha: ra * ck }) ?? G;
		}
		glassLight(ctx, G, smooth(span(t, ...T.glassOn)) * ra);
		// The plate's frame, in chalk, fainter once the colour is in.
		const inColour = smooth(span(t, T.colour + 1.5, T.colour + 2.4));
		stroke(ctx, rectQuad(rcx, rcy, hpx * PHI, hpx, 0, true), {
			color: PAL.chalk,
			width: 1.5,
			alpha: ra * (0.75 - 0.4 * inColour)
		});
	}

	// ── The flash ────────────────────────────────────────────────────────
	impact(
		ctx,
		w,
		h,
		cx,
		cy,
		0.42 * Math.min(w, h),
		(t - T.term) / 10,
		(T.hit - T.term) / 10,
		1,
		true
	);
}
