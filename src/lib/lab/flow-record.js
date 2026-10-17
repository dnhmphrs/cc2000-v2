import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	PAL,
	TAU,
	PHI,
	TECH_FONT,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	camera3,
	tag
} from './log/board.js';
import { drawOrb, glow, lit, impact } from './log/ink.js';
import { spline3 } from './log/space.js';
import { drawHelix, poseOn } from './log/helix.js';
import {
	loadRooms,
	roomOf,
	drawRoom,
	drawImageAt,
	mips,
	PLATE,
	DECADES,
	LAYERS
} from './log/rooms.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';

// ── Flow: the record ─────────────────────────────────────────────────────────
// The whole run on the board, one geometry: the light at the centre is the
// SPINDLE HOLE of a record seen straight down its axis, and the run is the
// lens going down that axis — into the hole, and through it.
//
//   0–10    the terminal (log-dawn's, the card's three lines typed, the full
//           stop lit into the orb), ending on the orb: 6 px at the centre.
//   10–21.6 the approach and the questions. The lens creeps in. The first
//           question is written under the light and answered (10.9–13.65);
//           on enter the lens takes a log step in (13.7–15.2, ×2) and the
//           GROOVES come up round the point: rings r = 6·2^{k/4} px, the log
//           map's rings redrawn as grooves in chalk, written on from the hole
//           outward, tightening toward it, streaming out past the edges as
//           the lens steps in. The second question (15.5–18.05); on enter the
//           second step (18.1–19.6, ×2) and the record starts TURNING: the
//           rays of the log map (twelve, faint) and a seeded dust on the
//           surface come up and turn with it, a turn in sixteen seconds,
//           clockwise as a record plays. Then a hold on the turning record
//           (19.6–21.6). No swimmer anywhere in this.
//   21.6–23.7 THE NEEDLE: the swimmer, revealed only now — a helix (helix.js)
//           turning on its axis — drops in from the top right, from the
//           lens's own height, down onto a groove seven out from the hole,
//           and at the touch (23.3) THE FLASH: the wash, a shock ring out of
//           the point, a touch of gold where it landed. Into the groove and
//           gone by 23.7: two seconds in all.
//   23.3–36 THE GROOVE IN, and through the hole. From the hit the lens
//           follows the groove in: a log spiral — a zoom and one full turn
//           on the same pace curve (the turn on the first 0.62 of it, done
//           by ~31 s as the rim leaves the frame), so in log coordinates it
//           is a straight line — gathering pace, the grooves streaming out
//           past the edges, the rays and dust wheeling. As the hole passes
//           60–140 px (~25–27 s) the light resolves into what it was the
//           light of: THROUGH THE HOLE, the rooms, tiled — log-passage's
//           torus lattice in chalk, the four decades' rooms as one flat chalk
//           image each through its mips (instanced), several seen at once
//           through the hole, the answer's room at the centre drawn in its
//           six layers. The rim of the hole sweeps out past the frame's
//           edges (~29–31.5 s), the lens — upright by then, the turn eased
//           off to exactly one — is in the lattice and dives straight into
//           the centre cell, the colour flooding into that one room
//           (32.5–35.3) as the lens settles to the landing lens at 36.
//   36–42   THE ROOM: landed, 0.62 of the board tall, in colour, the frame in
//           chalk, swaying on its depths (rooms.js drawRoom's parallax), the
//           monitor's glass lit. Held six seconds.
//
// Beats between the last answer and the room: three — the needle and the
// flash, the groove in, the hole opening onto the rooms — and the last two
// are one motion on one pace curve, only gathering pace until the landing.
//
// A pure function of progress: the zoom is a sum of eased steps and one
// tabled pace curve of t; the record's turn, the lens's turn, the needle's
// pose and the sway are all read off t. ?at= pins any frame. ?decade=50s|60s|
// 90s|10s picks the room (90s by default).

const SECONDS = 42;
const FOV = 34; // the landing lens, degrees vertical (log-fall's)

// The beats, in seconds.
const T = {
	term: 10,
	q1: [10.9, 11.7],
	a1: [12.1, 13.3],
	e1: [13.35, 13.65],
	s1: [13.7, 15.2],
	write: 13.4, // the grooves written on, from the first enter
	q2: [15.5, 16.3],
	a2: [16.6, 17.7],
	e2: [17.75, 18.05],
	s2: [18.1, 19.6],
	turn: [18.1, 20.1], // the record's turn ramps up
	needle: [21.6, 23.3],
	hit: 23.3,
	dive: [23.3, 36],
	colour: [32.5, 35.3],
	land: 36
};
const G = Math.pow(2, 1 / 4); // a groove every quarter octave: a step of ×2 is four
const LNG = Math.log(G);
const STEP = Math.LN2; // each answer's step: one octave in
const CREEP = 0.02; // the lens's creep, log units a second
const DZ = 3.3; // the dive's zoom, log units
const TURN = 0.62; // the lens's one turn is done by this much of the dive (~31 s)
const ZLAND = CREEP * (T.land - T.term) + 2 * STEP + DZ;
const OMEGA = -TAU / 16; // the record's turn: a turn in 16 s, clockwise
const RAYS = 12;

const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));
const at2 = (t, [a, b]) => span(t, a, b);

// Progress → distance along the dive, 0..1: speed ∝ (c + x)^a (1 − x)^b,
// tabled — some pace already at the hit, the most as the hole opens, easing
// to rest at the landing.
function paceOf(a, b, c, n = 512) {
	const tab = [0];
	let acc = 0;
	for (let i = 1; i <= n; i++) {
		const x = (i - 0.5) / n;
		acc += Math.pow(c + x, a) * Math.pow(1 - x, b);
		tab.push(acc);
	}
	return (x) => {
		const f = clamp01(x) * n;
		const i = Math.min(n - 1, Math.floor(f));
		return lerp(tab[i], tab[i + 1], f - i) / acc;
	};
}

// The record's own turn, radians: ramped in over T.turn, then steady.
function recordTurn(t) {
	const [a, b] = T.turn;
	if (t <= a) return 0;
	const L = b - a;
	if (t >= b) return OMEGA * (L / 2 + (t - b));
	const x = (t - a) / L;
	return OMEGA * L * (x * x * x - (x * x * x * x) / 2); // ∫ smooth
}

// Where log-fall lands: the plate 0.62 of the board tall at most, centred.
function landing(w, h) {
	const height = Math.min(0.62 * h, (0.74 * w) / PHI);
	return { cx: w / 2, cy: h / 2, height, s: height / 2 };
}
// The landing sway, log-fall's: px of slide per unit of depth.
function sway(s, secs, amp) {
	const A = 0.116 * s * amp;
	return [A * Math.sin(1.1 * secs - 0.4), -0.45 * A * Math.sin(1.7 * secs + 0.6)];
}

export default async function make({ at }) {
	const b = getBoard();
	const time = clock(SECONDS, at);
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	const decade = DECADES.includes(q?.get('decade')) ? q.get('decade') : '90s';
	try {
		await document.fonts.load(`400 24px ${TECH_FONT}`);
	} catch {
		// The board's fallbacks will do.
	}
	const term = makeTerminal(0.8, { cmd: false });
	const art = await loadRooms({ decades: DECADES, chalk: true });
	// One flat chalk image per room, through its mips: the tiling's instances.
	const flat = {};
	for (const d of DECADES) {
		if (!art[d]?.bg) continue;
		const c = document.createElement('canvas');
		c.width = 1024;
		c.height = Math.round(1024 / PHI);
		const x = c.getContext('2d');
		drawRoom(x, art, d, { cx: c.width / 2, cy: c.height / 2, height: c.height, chalk: true });
		flat[d] = mips(c);
	}
	const others = DECADES.filter((d) => d !== decade && flat[d]);
	const cellDecade = (i, j) =>
		others.length
			? others[(((i + 2 * j) % others.length) + others.length) % others.length]
			: decade;
	// The dust on the record: seeded, in log polar, so the same density at
	// every zoom; three alphas, drawn in three passes.
	const dust = [[], [], []];
	let seed = 7;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	for (let i = 0; i < 900; i++) {
		const k = Math.floor(rnd() * 3);
		dust[k].push([lerp(-3.4, 6.7, rnd()), rnd() * TAU, 1.1 + 0.45 * k]);
	}
	const pace = paceOf(1.2, 2.4, 0.08);
	const zoomAt = (t) =>
		CREEP * (Math.min(t, T.land) - T.term) +
		STEP * easeInOutCubic(at2(t, T.s1)) +
		STEP * easeInOutCubic(at2(t, T.s2)) +
		DZ * pace(at2(t, T.dive));
	const S = { art, flat, decade, cellDecade, dust, pace, zoomAt };

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (t < T.term) {
			term.draw(ctx, w, h, t / T.term, t, t - T.term);
		} else {
			flow(ctx, w, h, t, S);
		}
		tag(ctx, w, h, 'flow-record');
	}

	return {
		info: { seconds: SECONDS, decade, missing: art.missing },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The run, from the orb on ─────────────────────────────────────────────────
function flow(ctx, w, h, t, S) {
	const cx = w / 2;
	const cy = h / 2;
	const diag = Math.hypot(w, h) / 2;
	const Z = S.zoomAt(t);
	const scale = Math.exp(Z); // px per world px (world = the board at t = 10)
	const Rh = ORB_R * scale; // the hole's radius on screen
	// The lens's turn — the spiral: one turn on the dive's own pace curve,
	// done by TURN of the dive, as the rim leaves the frame, so the lens is
	// upright for the dive into the room (and every big blit from there is
	// axis-aligned, which is what a software rasteriser draws fast).
	const rotV = -TAU * S.pace(Math.min(1, at2(t, T.dive) / TURN));
	const rotR = recordTurn(t); // the record's own turn
	const viewAt = (zz) => makeView({ w, h, scale: Math.exp(zz), rot: rotV });
	const view = viewAt(Z);
	// The light resolves into the scene through the hole as the hole opens.
	const sceneA = smooth(span(Rh, 60, 140));

	if (t >= T.land) {
		landed(ctx, w, h, t, S);
		return;
	}

	record(ctx, w, h, t, scale, rotV, rotR, Rh, sceneA, S);
	if (sceneA > 0.002) hole(ctx, w, h, t, Z, rotV, Rh, sceneA, S);

	// The orb: the light in the hole, until the hole is a hole.
	const orbA = 1 - sceneA;
	if (orbA > 0.002) {
		const flare =
			0.9 * bump(t, T.s1[1] - 0.12, 0.3) +
			0.9 * bump(t, T.s2[1] - 0.12, 0.3) +
			1.1 * bump(t, T.hit + 0.02, 0.22);
		const halo = 0.35 * (1 - smooth(span(t, T.write, T.write + 1.1)));
		ctx.save();
		ctx.globalAlpha = orbA;
		drawOrb(ctx, cx, cy, Rh, t - T.term, { flare, halo });
		ctx.restore();
	}
	if (sceneA > 0.002 && Rh < diag * 1.02) {
		// The hole's wall, its rim, and the last of the light on the rim.
		const warm = [255, 206, 140];
		const rimA = 0.3 * sceneA * (1 - span(Rh, 220, 700));
		if (rimA > 0.003) {
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			const g = ctx.createRadialGradient(cx, cy, Rh * 0.9, cx, cy, Rh * 1.2);
			g.addColorStop(0, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0)`);
			g.addColorStop(0.35, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, ${rimA})`);
			g.addColorStop(1, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0)`);
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(cx, cy, Rh * 1.2, 0, TAU);
			ctx.fill();
			ctx.restore();
		}
		ctx.save();
		ctx.strokeStyle = PAL.chalk;
		ctx.globalAlpha = 0.9 * sceneA;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(cx, cy, Rh, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}

	needle(ctx, w, h, t);
	questions(ctx, w, h, t, view, viewAt, S);
}

// ── The record: grooves, rays, dust ──────────────────────────────────────────
function record(ctx, w, h, t, scale, rotV, rotR, Rh, sceneA, S) {
	const cx = w / 2;
	const cy = h / 2;
	const diag = Math.hypot(w, h) / 2;
	// Lines dissolve into the light while it is a light; once it is a hole
	// they run to the rim.
	const inner = Rh * lerp(1.5, 1.04, sceneA);
	const soft = lerp(30, 6, sceneA);
	const fade = (rpx) => smooth(span(rpx, inner, inner + soft));
	if (inner > diag * 1.05) return;
	const ang = rotR + rotV; // the record's marks, on screen (math angle)

	// The dust, turning with the record.
	const dustA = smooth(span(t, T.turn[0] + 0.2, T.turn[0] + 1.7));
	if (dustA > 0.003) {
		ctx.save();
		ctx.fillStyle = PAL.chalk;
		const rLo = Rh * 1.25;
		for (let k = 0; k < 3; k++) {
			ctx.globalAlpha = dustA * (0.2 + 0.17 * k);
			for (const [rho, th, sz] of S.dust[k]) {
				const rpx = Math.exp(rho) * scale;
				if (rpx < rLo || rpx > diag) continue;
				const a = th + ang;
				ctx.fillRect(cx + rpx * Math.cos(a) - sz / 2, cy - rpx * Math.sin(a) - sz / 2, sz, sz);
			}
		}
		ctx.restore();
	}

	// The rays, θ = 2πj/12, written out from the hole on the second answer.
	const rayUp = smooth(span(t, T.e2[0] + 0.05, T.e2[0] + 1.2));
	if (rayUp > 0.002) {
		const r0 = inner + soft * 0.3;
		const r1 = diag * 1.05;
		for (let j = 0; j < RAYS; j++) {
			const a = (TAU * j) / RAYS + ang;
			const c = Math.cos(a);
			const s = Math.sin(a);
			stroke(
				ctx,
				[
					[cx + r0 * c, cy - r0 * s],
					[cx + r1 * c, cy - r1 * s]
				],
				{ color: PAL.chalk, width: 1.1, alpha: 0.3, upto: rayUp, cap: 'butt' }
			);
		}
	}

	// The grooves: rings r = 6·G^k world px, the innermost in view written
	// first on the first answer, every later one already there.
	const K0 = 11;
	const kLo = Math.max(0, Math.floor(Math.log(inner / (ORB_R * scale)) / LNG));
	const kHi = Math.ceil(Math.log((diag * 1.02) / (ORB_R * scale)) / LNG);
	ctx.save();
	ctx.strokeStyle = PAL.chalk;
	ctx.lineWidth = 1.3;
	ctx.lineCap = 'round';
	for (let k = kLo; k <= kHi; k++) {
		const rpx = ORB_R * scale * Math.pow(G, k);
		if (rpx > diag * 1.02) break;
		const al = 0.8 * fade(rpx);
		if (al < 0.01) continue;
		const t0 = T.write + 0.055 * Math.max(0, k - K0);
		const up = smooth(span(t, t0, t0 + 0.45));
		if (up <= 0) continue;
		ctx.globalAlpha = al;
		ctx.beginPath();
		ctx.arc(cx, cy, rpx, -Math.PI / 2, -Math.PI / 2 + TAU * up);
		ctx.stroke();
	}
	ctx.restore();
}

// ── Through the hole: the rooms, tiled ───────────────────────────────────────
// The torus lattice of log-passage, seen down the axis: copies of the room
// at every (i·2φ, j·2) of the frame's plane, the lens on the axis at distance
// d, which runs with the zoom (d = d₀ e^{Z_land − Z}, so the hole and the
// rooms through it are one dive) down to the landing lens's d₀. The other
// decades' rooms are flat chalk instances; the centre cell — the answer's —
// is drawn in its layers, the colour flooding into it at the end.
function hole(ctx, w, h, t, Z, rotV, Rh, sceneA, S) {
	const cx = w / 2;
	const cy = h / 2;
	const diag = Math.hypot(w, h) / 2;
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
	const L = landing(w, h);
	const d0 = (F * PLATE.H) / L.height;
	const d = d0 * Math.exp(ZLAND - Z);
	const cw = (PLATE.W * F) / d;
	const ch = (PLATE.H * F) / d;
	const clipHole = Rh < diag * 1.02;
	const reach = clipHole ? Rh : diag;
	ctx.save();
	if (clipHole) {
		ctx.beginPath();
		ctx.arc(cx, cy, Rh, 0, TAU);
		ctx.clip();
	}
	// The dark beyond the hole.
	ctx.globalAlpha = sceneA;
	ctx.fillStyle = '#0b0b0b';
	ctx.fillRect(0, 0, w, h);
	ctx.globalAlpha = 1;
	const rot = rotV % TAU; // exactly one turn is no turn: leave the blits aligned
	if (Math.abs(rot) > 1e-9) {
		ctx.translate(cx, cy);
		ctx.rotate(-rot);
		ctx.translate(-cx, -cy);
	}
	// The instances: every cell that reaches into the hole (or the frame).
	const frameA = 0.85 * sceneA;
	instances(ctx, cx, cy, cw, ch, reach, sceneA, S);
	// The centre: the answer's room, in its layers, its box's depth edges
	// once it is near, the colour flooding in as the lens arrives.
	const col = smooth(at2(t, T.colour));
	const glassA = smooth(span(t, T.colour[1] - 0.3, T.land + 1));
	const R = roomOf(S.decade, S.art, d0);
	cellLayered(ctx, cx, cy, F, d, R, S.art, S.decade, { col, ink: 1 - col, a: sceneA, glassA });
	if (cw > 140) {
		const kb = F / (d + PLATE.DEPTH);
		const Q = rect(cx, cy, cw, ch);
		const B = rect(cx, cy, PLATE.W * kb, PLATE.H * kb);
		const ea = 0.45 * sceneA * (1 - col) * span(cw, 140, 220);
		for (let c = 0; c < 4; c++)
			stroke(ctx, [Q[c], B[c]], { color: PAL.chalk, width: 1, alpha: ea, dash: [4, 6] });
	}
	stroke(ctx, rect(cx, cy, cw, ch), {
		color: PAL.chalk,
		width: lerp(1.3, 2.2, col),
		alpha: lerp(frameA, 1, col)
	});
	ctx.restore();
	// The hole's wall: a shadow inside the rim.
	if (clipHole) {
		ctx.save();
		const g = ctx.createRadialGradient(cx, cy, Rh * 0.82, cx, cy, Rh);
		g.addColorStop(0, 'rgba(0, 0, 0, 0)');
		g.addColorStop(1, `rgba(0, 0, 0, ${0.6 * sceneA})`);
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(cx, cy, Rh, 0, TAU);
		ctx.fill();
		ctx.restore();
	}
}

// The other rooms, instanced: one flat chalk image each, at every cell of
// the lattice but the centre that reaches within `reach` of the centre, with
// its chalk frame. Shared by the dive and the landed hold, so the neighbours
// in frame at the landing stay where they were.
function instances(ctx, cx, cy, cw, ch, reach, a, S) {
	const I = Math.ceil(reach / cw + 0.5);
	const J = Math.ceil(reach / ch + 0.5);
	const half = Math.hypot(cw, ch) / 2;
	for (let j = -J; j <= J; j++)
		for (let i = -I; i <= I; i++) {
			if (i === 0 && j === 0) continue;
			if (Math.hypot(i * cw, j * ch) - half > reach) continue;
			const x = cx + i * cw;
			const y = cy - j * ch;
			const m = S.flat[S.cellDecade(i, j)];
			if (m) drawImageAt(ctx, m, x, y, cw, ch, { alpha: a });
			stroke(ctx, rect(x, y, cw, ch), { color: PAL.chalk, width: 1.3, alpha: 0.85 * a });
		}
}

const rect = (cx, cy, w, h) => [
	[cx - w / 2, cy - h / 2],
	[cx + w / 2, cy - h / 2],
	[cx + w / 2, cy + h / 2],
	[cx - w / 2, cy + h / 2],
	[cx - w / 2, cy - h / 2]
];

// The room's six layers in 3D from a lens on the axis at distance d (its
// plate at the origin, laid out by roomOf with the landing d₀, so at d₀ it
// is exactly drawRoom's flat composition), clipped to its frame; chalk at
// `ink`, colour at `col`, all at `a`. The glass is board, and lit by glassA.
function cellLayered(ctx, cx, cy, F, d, R, art, decade, { col, ink, a, glassA }) {
	const k0 = F / d;
	const fw = PLATE.W * k0;
	const fh = PLATE.H * k0;
	ctx.save();
	ctx.beginPath();
	ctx.rect(cx - fw / 2, cy - fh / 2, fw, fh);
	ctx.clip();
	for (const cfg of LAYERS) {
		const L = R.lay[cfg.key];
		const m = art[decade]?.[cfg.key];
		if (!L || !m) continue;
		const k = F / (d - L.z);
		if (cfg.key === 'screen' && R.glass) {
			const g = R.glass;
			const kg = F / (d - g.z);
			glassBoard(
				ctx,
				{ cx: cx + g.x * kg, cy: cy - g.y * kg, w: g.w * kg, h: g.h * kg },
				a,
				glassA
			);
		}
		const x = cx + L.x * k;
		const y = cy - L.y * k;
		if (ink > 0.02 && m.chalk)
			drawImageAt(ctx, m.chalk, x, y, L.w * k, L.h * k, { alpha: a * ink });
		if (col > 0.02) drawImageAt(ctx, m.mips, x, y, L.w * k, L.h * k, { alpha: a * col });
	}
	ctx.restore();
}

// The board in the monitor's glass, and its light.
function glassBoard(ctx, Gl, a, glassA) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(Gl.cx - Gl.w / 2 - 0.5, Gl.cy - Gl.h / 2 - 0.5, Gl.w + 1, Gl.h + 1);
	ctx.clip();
	ctx.globalAlpha = a;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(Gl.cx - Gl.w / 2 - 1, Gl.cy - Gl.h / 2 - 1, Gl.w + 2, Gl.h + 2);
	ctx.globalAlpha = 1;
	if (glassA > 0.003)
		glow(ctx, Gl.cx, Gl.cy, 0.62 * Math.min(Gl.w, Gl.h), [255, 220, 150], 0.3 * glassA * a);
	ctx.restore();
}

// ── The room, landed ─────────────────────────────────────────────────────────
// drawRoom with its parallax: the sway ramps up from the landing, the glass
// lit, the frame in chalk.
function landed(ctx, w, h, t, S) {
	const L = landing(w, h);
	const par = sway(L.s, t, smooth(span(t, T.land, T.land + 1.5)));
	const o = { cx: L.cx, cy: L.cy, height: L.height, parallax: par };
	instances(ctx, L.cx, L.cy, PLATE.W * L.s, PLATE.H * L.s, Math.hypot(w, h) / 2, 1, S);
	drawRoom(ctx, S.art, S.decade, { ...o, layers: ['bg', 'poster', 'clock', 'desk'] });
	const Gl = drawRoom(ctx, S.art, S.decade, { ...o, layers: ['screen'], alpha: 0 });
	if (Gl) glassBoard(ctx, Gl, 1, smooth(span(t, T.colour[1] - 0.3, T.land + 1)));
	drawRoom(ctx, S.art, S.decade, { ...o, layers: ['screen', 'bed'] });
	stroke(ctx, rect(L.cx, L.cy, PLATE.W * L.s, PLATE.H * L.s), { color: PAL.chalk, width: 2.2 });
}

// ── The needle ───────────────────────────────────────────────────────────────
// The swimmer as a helix, from the lens's own height at the top right down
// onto a groove seven out from the hole: a camera on the record's axis with
// one world unit one pixel on the record's plane, the path a spline through
// three keys and on into the surface, the spin on the clock.
function needle(ctx, w, h, t) {
	const a =
		smooth(span(t, T.needle[0], T.needle[0] + 0.25)) * (1 - smooth(span(t, T.hit, T.hit + 0.4)));
	const D = h / 2 / Math.tan((40 * Math.PI) / 360);
	const rg = 0.16 * h;
	const gx = rg * Math.cos(0.6);
	const gy = rg * Math.sin(0.6);
	const hx = w / 2 + gx;
	const hy = h / 2 - gy;
	if (a > 0.003) {
		const cam = camera3({ pos: [0, 0, D], target: [0, 0, 0], up: [0, 1, 0], fov: 40, w, h });
		const keys = [
			[0, [0.36 * w, 0.3 * h, 0.5 * D]],
			[0.45, [0.17 * w, 0.15 * h, 0.2 * D]],
			[0.85, [gx, gy, 0]],
			[1, [gx - 0.03 * h, gy - 0.02 * h, -0.12 * D]]
		];
		const path = (u) => spline3(u, keys);
		const x = at2(t, T.needle);
		const u = 0.85 * x * (0.6 + 0.4 * x) + 0.15 * span(t, T.hit, T.hit + 0.4);
		const pose = poseOn(path, u, t * 2.6 * Math.PI, 0.042 * h);
		drawHelix(ctx, cam, pose, { alpha: a, width: 2.8, core: 0.9, glow: 0.4 });
	}
	// The flash: the touch.
	lit(ctx, hx, hy, 5, bump(t, T.hit + 0.04, 0.2));
	impact(ctx, w, h, hx, hy, 0.32 * Math.min(w, h), t / 10, T.hit / 10, 0.9, true);
}

// ── The questions ────────────────────────────────────────────────────────────
// log-orb's prompts, under the light, each anchored to the view its step
// starts from and flown out with the grooves on the step.
function questions(ctx, w, h, t, view, viewAt, S) {
	if (t > T.s2[1] + 0.5) return;
	const rest1 = t < T.s1[0] ? view : viewAt(S.zoomAt(T.s1[0]));
	drawPrompt(
		ctx,
		view,
		rest1,
		h,
		{ ...BIRTH, key: '' },
		{
			q: at2(t, T.q1),
			a: at2(t, T.a1),
			enter: at2(t, T.e1),
			alpha: 1 - smooth(span(t, T.s1[0] + 0.15, T.s1[0] + 0.8)),
			secs: t
		}
	);
	const rest2 = t < T.s2[0] ? view : viewAt(S.zoomAt(T.s2[0]));
	drawPrompt(
		ctx,
		view,
		rest2,
		h,
		{ ...SPICE, key: '' },
		{
			q: at2(t, T.q2),
			a: at2(t, T.a2),
			enter: at2(t, T.e2),
			alpha: 1 - smooth(span(t, T.s2[0] + 0.15, T.s2[0] + 0.8)),
			secs: t
		}
	);
}
