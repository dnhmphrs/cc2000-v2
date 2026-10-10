import {
	getBoard,
	clearBoard,
	makeView,
	PAL,
	MATH_FONT,
	TAU,
	PHI,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	tag,
	camera3,
	add3,
	sub3,
	mul3,
	cross,
	norm,
	dot
} from './log/board.js';
import { NEAR, lerp3, pxPerUnit } from './log/space.js';
import { drawOrb, impact, glow } from './log/ink.js';
import { loadRooms, drawRoom, pick, mips, DECADES, LAYERS } from './log/rooms.js';
import { drawHelix } from './log/helix.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';

// ── Flow: flow-dodeca — the dodecahedral space ──────────────────────────────
// A whole run on the board, in Poincaré's dodecahedral space: one cell,
// a dodecahedron, whose opposite faces are glued with a tenth of a turn, so
// that through every face you see the same cell, turned. Everything after the
// terminal is ONE geometry seen from inside, a pure function of the clock:
//
//    0–10 s  the terminal (log-dawn's, cmd off, type at 0.8): the three lines
//            typed, the full stop lights into the orb, the lens zooms in.
//   10–18.8  the approach and the questions. The orb is the light at the
//            centre of a window ahead: the lens is inside the space, looking
//            down a chain of cells, each glued to the last face to face and
//            turned 36° — nested pentagons in faint chalk, tip up, tip down,
//            converging on the light. The two questions are asked under the
//            orb (log-orb's prompts, no coordinate names); each answer flies
//            the lens on through the cells — the windows sweep out past the
//            corners, the prompt rides out with them — and the light grows:
//            step one (13.3–14.6) two cells, step two (17.0–18.8) the rest,
//            gathering pace into the light.
//   18.8     THE FLASH: the lens reaches the orb's window and passes through it.
//   18.8–22.8 the cell, built round us: its edges go bold, and EVERY FACE IS
//            A ROOM'S GLASS — the answer's bedroom in chalk, one plate inside
//            each pentagon, upright on the faces you can see and, on the face
//            opposite, turned as the gluing turns it (the twelve neighbours
//            are the one cell, turned). Beyond the faces the neighbours'
//            edges, faint. Through the lower-left pane, once, the swimmer:
//            yourself from behind, a helix swimming off down the line of
//            sight into the next cell, gone as that pane fills with the room
//            (18.8–21.1).
//   22.8–28.2 into the centre face's room: the lens flies at the pane ahead,
//            the walls' panes sweep out past the frame, the room grows to the
//            landing size; the lens tilts a touch to settle the plate.
//   27.4–31.4 colour floods in, layer by layer from the wall to the bed; the
//            chalk edges dissolve; the monitor's glass lights as the wall
//            takes its colour; the sway begins.
//   31.4–38  the room, held, swaying on its depths (drawRoom's parallax).
//
// Two beats between the last answer and the room: the flash with the cell
// built round us, and the flight into the pane. No record in this angle.
//
// How: the cell is the regular dodecahedron of inradius 1, turned so a face
// looks down +z with a vertex up; the chain is that cell at z = 2m turned
// 36°·m (a face's opposite is its mirror turned a tenth, so glued copies
// alternate tip up, tip down of themselves); the twelve neighbours are the
// cell turned 180° about a face's normal and pushed through it, which in a
// pentagon's symmetry is the tenth of a turn. The room is drawn flat ONCE
// into a chalk composite with a mip chain; each pane is that composite
// through the face's own affine (its up and right projected by the lens),
// clipped to the pentagon, over a patch of board; the pane ahead is the
// kit's drawRoom itself, so it can take the colour, the lit glass and the
// parallax. Lines are batched by width and alpha; the frame stays well
// under the budget. ?decade=50s|60s|90s|10s picks the room.

const SECONDS = 38;
const FOV = 58;
// The lens along the axis: at rest, after step one, at the orb's window
// (the flash), drifted into the cell; the landing is set by the frame.
const Z0 = -8.8;
const Z1 = -4.8;
const Z2 = -1;
const Z3 = -0.8;
const ORB = [0, 0, Z2]; // the light, at the centre of the window at z = −1
const DP = 2.4; // the prompts' depth ahead of the lens at rest

// The beats, in seconds.
const B = {
	edges: [10, 11.6],
	q1: [10.9, 11.7],
	a1: [12.0, 12.9],
	enter1: [12.95, 13.25],
	step1: [13.3, 14.6],
	q2: [14.9, 15.5],
	a2: [15.8, 16.6],
	enter2: [16.65, 16.95],
	step2: [17.0, 18.8],
	flash: 18.8,
	cell: [18.8, 22.8],
	swim: [18.8, 21.1],
	dive: [22.8, 28.2],
	panesOut: [26.6, 28.2],
	flood: [27.4, 31.4],
	edgesOut: [27.0, 30.0],
	glass: [27.6, 29.8]
};
// Colour, layer by layer, from the wall to the bed.
const FLOOD = {
	bg: [27.4, 29.0],
	poster: [28.0, 29.6],
	clock: [28.4, 30.0],
	desk: [28.8, 30.4],
	screen: [29.2, 30.8],
	bed: [29.6, 31.4]
};
const Q1 = { ...BIRTH, key: '' };
const Q2 = { ...SPICE, key: '' };

const pace = (u, k = 3) => (Math.cosh(k * clamp01(u)) - 1) / (Math.cosh(k) - 1);
const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));

export default async function make({ at }) {
	const b = getBoard();
	const time = clock(SECONDS, at);
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const art = await loadRooms({ decades: [decade], chalk: true });
	const term = makeTerminal(0.8, { cmd: false });
	const cell = buildCell();
	const flat = chalkComposite(art, decade);
	const S = { cell, art, decade, flat, term, ...layout(cell) };

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (t < 10) term.draw(ctx, w, h, t / 10, t, t - 10);
		else scene(ctx, w, h, t, S, b.dpr);
		tag(ctx, w, h, 'flow-dodeca');
	}

	return {
		info: { seconds: SECONDS },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The cell ─────────────────────────────────────────────────────────────────
// The regular dodecahedron, inradius 1, a face looking down +z with a vertex
// straight up. Faces carry their five vertices in cyclic order, their normal
// (the centre is the normal itself, at distance 1), the plate's up and right
// in the face's plane, and the pentagon's circumradius.
function buildCell() {
	const f = PHI;
	const g = 1 / PHI;
	const V = [];
	for (const sx of [-1, 1])
		for (const sy of [-1, 1]) for (const sz of [-1, 1]) V.push([sx, sy, sz]);
	for (const s1 of [-1, 1])
		for (const s2 of [-1, 1]) {
			V.push([0, s1 * g, s2 * f]);
			V.push([s1 * g, s2 * f, 0]);
			V.push([s2 * f, 0, s1 * g]);
		}
	const N = [];
	for (const s1 of [-1, 1])
		for (const s2 of [-1, 1]) {
			N.push(norm([0, s1 * f, s2]));
			N.push(norm([s2, 0, s1 * f]));
			N.push(norm([s1 * f, s2, 0]));
		}
	// The frame: the face at (0, φ, 1) to +z, its vertex (0, 1/φ, φ) up.
	const n0 = norm([0, f, 1]);
	const v0 = [0, g, f];
	const e3 = n0;
	const e2 = norm(sub3(v0, mul3(n0, dot(v0, n0))));
	const e1 = cross(e2, e3);
	const ri = dot(v0, n0);
	const T = (p) => [dot(p, e1) / ri, dot(p, e2) / ri, dot(p, e3) / ri];
	const verts = V.map(T);
	const faces = N.map((nn) => {
		const n = norm(T(mul3(nn, ri)));
		const idx = [];
		verts.forEach((v, i) => dot(v, n) > 0.98 && idx.push(i));
		const a = norm(sub3(verts[idx[0]], n));
		const bb = cross(n, a);
		idx.sort((i, j) => {
			const p = sub3(verts[i], n);
			const r = sub3(verts[j], n);
			return Math.atan2(dot(p, bb), dot(p, a)) - Math.atan2(dot(r, bb), dot(r, a));
		});
		return { n, v: idx, rho: Math.hypot(...sub3(verts[idx[0]], n)) };
	});
	// Edges: the thirty pairs at the edge's length.
	const a = (2 * g) / ri;
	const edges = [];
	for (let i = 0; i < verts.length; i++)
		for (let j = i + 1; j < verts.length; j++)
			if (Math.abs(Math.hypot(...sub3(verts[i], verts[j])) - a) < 1e-6) edges.push([i, j]);
	// The plate's up on every face: upright (the world's up, in the plane) on
	// the faces you can see from the back of the cell; on the face opposite,
	// its image under the gluing — the turn of 180° about the face's normal
	// that carries the cell through the face, which flips the plane.
	for (const F of faces) {
		if (F.n[2] > -0.1) F.up = norm(sub3([0, 1, 0], mul3(F.n, F.n[1])));
	}
	for (const F of faces) {
		if (F.up) continue;
		const O = faces.find((G) => dot(G.n, F.n) < -0.999);
		F.up = mul3(O.up, -1);
	}
	for (const F of faces) F.rt = cross(F.n, F.up);
	const front = faces.find((F) => F.n[2] > 0.999);
	// The swimmer's pane: the lower one on the screen's left (+x is left for
	// a lens looking down +z with y up), the pane that is whole in the frame.
	const swim = faces
		.filter((F) => Math.abs(F.n[2] - 0.447) < 0.02 && F.n[0] > 0 && F.n[1] < 0)
		.sort((p, r) => p.n[1] - r.n[1])[0];
	return { verts, faces, edges, front, swim, plate: plateIn(front.rho) };
}

// The largest golden rectangle in a pentagon of circumradius rho, tip up:
// its height, width and the offset of its centre up from the pentagon's.
function plateIn(rho) {
	const P = [];
	for (let i = 0; i < 5; i++) {
		const an = Math.PI / 2 + (TAU * i) / 5;
		P.push([Math.cos(an), Math.sin(an)]);
	}
	const inside = (x, y) => {
		for (let i = 0; i < 5; i++) {
			const p = P[i];
			const r = P[(i + 1) % 5];
			if ((r[0] - p[0]) * (y - p[1]) - (r[1] - p[1]) * (x - p[0]) < -1e-9) return false;
		}
		return true;
	};
	let best = { H: 0, yc: 0 };
	for (let yc = -0.3; yc <= 0.3; yc += 0.004) {
		let lo = 0;
		let hi = 1.2;
		for (let k = 0; k < 28; k++) {
			const H = (lo + hi) / 2;
			const hw = (H * PHI) / 2;
			const ok =
				inside(-hw, yc - H / 2) &&
				inside(hw, yc - H / 2) &&
				inside(-hw, yc + H / 2) &&
				inside(hw, yc + H / 2);
			if (ok) lo = H;
			else hi = H;
		}
		if (lo > best.H) best = { H: lo, yc };
	}
	return { H: best.H * rho, W: best.H * rho * PHI, yc: best.yc * rho };
}

// The chain of cells down the axis and the twelve neighbours of the cell
// round the lens, as lists of segments [a, b, m] — m the cell's index down
// the chain, or null for a neighbour — with every shared edge once.
function layout(cell) {
	const { verts, edges, faces } = cell;
	const seen = new Set();
	const key = (p) => p.map((x) => x.toFixed(4)).join(',');
	const push = (out, P, m) => {
		for (const [i, j] of edges) {
			const a = P[i];
			const bb = P[j];
			const k = key(a) < key(bb) ? key(a) + '|' + key(bb) : key(bb) + '|' + key(a);
			if (seen.has(k)) continue;
			seen.add(k);
			out.push([a, bb, m]);
		}
	};
	const chain = [];
	for (let m = -5; m <= 3; m++) {
		const an = (m * TAU) / 10;
		const c = Math.cos(an);
		const s = Math.sin(an);
		push(
			chain,
			verts.map(([x, y, z]) => [c * x - s * y, s * x + c * y, z + 2 * m]),
			m
		);
	}
	// The neighbours: the cell turned 180° about a face's normal and pushed
	// through it (its shared face's edges are the cell's own, already seen).
	const near = [];
	seen.clear();
	push([], verts, 0); // the cell's own edges, seen, so the shared faces' are not drawn twice
	for (const F of faces) {
		const P = verts.map((p) => add3(sub3(mul3(F.n, 2 * dot(p, F.n)), p), mul3(F.n, 2)));
		push(near, P, null);
	}
	return { chain, near };
}

// The room, flat, in chalk, composited once into a canvas with a mip chain.
function chalkComposite(art, decade) {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = Math.round(1024 / PHI);
	const x = c.getContext('2d');
	drawRoom(x, art, decade, {
		cx: c.width / 2,
		cy: c.height / 2,
		height: c.height,
		chalk: true,
		clip: true
	});
	return mips(c);
}

// ── Ink: segments batched by alpha and width ─────────────────────────────────
function makeInk() {
	const Bk = new Map();
	return {
		seg(alpha, width, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			const a = Math.min(12, Math.round(alpha * 12));
			const wq = Math.max(1, Math.round(width * 4));
			const k = a * 100 + wq;
			let bb = Bk.get(k);
			if (!bb) {
				bb = { alpha: a / 12, width: wq / 4, P: [] };
				Bk.set(k, bb);
			}
			bb.P.push(x0, y0, x1, y1);
		},
		flush(ctx) {
			ctx.save();
			ctx.strokeStyle = PAL.chalk;
			ctx.lineCap = 'round';
			for (const bb of Bk.values()) {
				ctx.globalAlpha = bb.alpha;
				ctx.lineWidth = bb.width;
				ctx.beginPath();
				const P = bb.P;
				for (let i = 0; i < P.length; i += 4) {
					ctx.moveTo(P[i], P[i + 1]);
					ctx.lineTo(P[i + 2], P[i + 3]);
				}
				ctx.stroke();
			}
			ctx.restore();
			Bk.clear();
		}
	};
}
// A 3D segment into the ink: cut at the near plane, width by depth (`ref`
// the depth drawn at `width`).
function seg3(ink, cam, a, bb, alpha, width, ref) {
	if (alpha < 0.012) return;
	let qa = cam.project(a);
	let qb = cam.project(bb);
	if (qa[2] <= NEAR && qb[2] <= NEAR) return;
	if (qa[2] <= NEAR || qb[2] <= NEAR) {
		const t = (qa[2] - NEAR) / (qa[2] - qb[2]);
		const c = cam.project(lerp3(a, bb, t));
		if (qa[2] <= NEAR) qa = c;
		else qb = c;
	}
	if (!Number.isFinite(qa[0] + qa[1] + qb[0] + qb[1])) return;
	const z = (qa[2] + qb[2]) / 2;
	ink.seg(alpha, width * Math.min(2.2, Math.max(0.5, ref / z)), qa[0], qa[1], qb[0], qb[1]);
}

// ── The lens ─────────────────────────────────────────────────────────────────
function lensZ(t, zLand) {
	if (t < B.step1[0]) return Z0;
	if (t < B.step1[1]) return lerp(Z0, Z1, easeInOutCubic(span(t, ...B.step1)));
	if (t < B.step2[0]) return Z1;
	if (t < B.flash) return lerp(Z1, Z2, pace(span(t, ...B.step2), 3.2));
	if (t < B.dive[0]) return lerp(Z2, Z3, 1 - (1 - span(t, ...B.cell)) ** 2);
	if (t < B.dive[1]) return lerp(Z3, zLand, easeInOutCubic(span(t, ...B.dive)));
	return zLand;
}

// ── The scene, from the orb's first frame on ─────────────────────────────────
function scene(ctx, w, h, t, S, dpr) {
	const { cell, art, decade, flat, chain, near } = S;
	const { faces, verts, front, swim, plate } = cell;
	const pxu = pxPerUnit(h, FOV);
	// The landing: the plate ahead at the landing's height (log-genesis's),
	// which fixes how far the lens flies.
	const L = Math.min(0.62 * h, (0.74 * w) / PHI);
	const dL = (plate.H * pxu) / L;
	const zLand = 1 - dL;
	const zL = lensZ(t, zLand);
	// The lens tilts up a touch as it lands, so the plate settles a little
	// below the middle, where the rooms land.
	const tilt = ((0.035 * h) / pxu) * smooth(span(t, B.dive[0] + 1, B.dive[1]));
	const cam = camera3({
		pos: [0, 0, zL],
		target: [0, tilt, zL + 1],
		up: [0, 1, 0],
		fov: FOV,
		w,
		h
	});
	const ink = makeInk();

	const flashed = smooth(span(t, B.flash, B.flash + 0.35));
	const chainA = 1 - smooth(span(t, B.flash, B.flash + 0.5));
	const edgesOut = 1 - smooth(span(t, ...B.edgesOut));
	const depthOf = (a, bb) => (a[2] + bb[2]) / 2 - zL;
	const fog = (d) => (1 - smooth(span(d, 5, 11))) * smooth(span(d, 0.02, 0.25));

	// The chain, faint, written on near to far; the cell round the orb goes
	// bold at the flash and stays, the rest fades.
	for (const [a, bb, m] of chain) {
		const d = depthOf(a, bb);
		if (d < -0.1) continue;
		const own = m === 0;
		const write = smooth(span(t, B.edges[0] + 0.1 * d, B.edges[0] + 0.6 + 0.1 * d));
		let al = 0.5 * fog(d) * write;
		if (own) al = lerp(al, 0.9 * fog(Math.max(0.3, d)), flashed);
		else al *= chainA;
		seg3(ink, cam, a, bb, al * edgesOut, own ? 1.6 : 1.4, 1.1);
	}
	// The neighbours, through the faces, faint.
	const nearA = smooth(span(t, B.flash + 0.2, B.flash + 1.2)) * edgesOut;
	if (nearA > 0)
		for (const [a, bb] of near) {
			const d = depthOf(a, bb);
			if (d < 0) continue;
			seg3(ink, cam, a, bb, 0.3 * nearA * (1 - smooth(span(d, 2.5, 5))), 1.2, 1.1);
		}
	ink.flush(ctx);

	// The swimmer, through its pane: yourself from behind, swimming off down
	// the line of sight into the next cell — so it recedes into the pane —
	// before the pane fills with the room.
	const swimA =
		smooth(span(t, B.swim[0], B.swim[0] + 0.25)) *
		(1 - smooth(span(t, B.swim[1] - 0.8, B.swim[1])));
	if (swimA > 0) {
		const Q = swim.v.map((i) => cam.project(verts[i]));
		if (Q.every((p) => p[2] > NEAR)) {
			const s = span(t, ...B.swim);
			const axis = norm(sub3(swim.n, [0, 0, -0.95]));
			const at = add3(swim.n, mul3(axis, 0.22 + 1.4 * Math.pow(s, 1.6)));
			ctx.save();
			pentPath(ctx, Q);
			ctx.clip();
			drawHelix(
				ctx,
				cam,
				{ at, axis, spin: t * 2.6 * Math.PI, size: 0.07 },
				{ alpha: swimA, width: 2.4, core: 0.8, glow: 0.3 }
			);
			ctx.restore();
		}
	}

	// Every face a room's glass: the chalk composite through each face's own
	// affine, clipped to its pentagon; the pane ahead is the room itself.
	const order = faces.map((F, i) => ({ F, i, k: -F.n[2] * 10 + F.n[1] })).sort((p, r) => p.k - r.k);
	order.forEach((o, rank) => {
		const F = o.F;
		const t0 = F === swim ? B.swim[1] - 0.5 : B.flash + 0.2 + 0.1 * rank;
		F.in = smooth(span(t, t0, t0 + 0.8));
	});
	for (const F of faces) {
		if (F === front || F.in <= 0) continue;
		const C = F.n;
		const look = dot(norm(sub3(C, cam.pos)), F.n);
		const al = F.in * smooth(span(look, 0.12, 0.4)) * (1 - smooth(span(t, ...B.panesOut)));
		if (al <= 0.01) continue;
		pane(ctx, cam, F, verts, flat, plate, al, dpr);
	}

	// The pane ahead, the kit's room: chalk, then colour flooding in, the
	// glass lit, swaying on its depths once landed.
	if (front.in > 0) {
		const C = add3(front.n, mul3(front.up, plate.yc));
		const P = cam.project(C);
		const Pu = cam.project(add3(C, mul3(front.up, 0.05)));
		const height = (Math.hypot(Pu[0] - P[0], Pu[1] - P[1]) / 0.05) * plate.H;
		const amp = smooth(span(t, ...B.flood));
		const A = 0.116 * (height / 2) * amp;
		const par = [A * Math.sin(1.1 * t - 0.4), -0.45 * A * Math.sin(1.7 * t + 0.6)];
		const colour = {};
		const chalk = {};
		for (const k of Object.keys(FLOOD)) {
			colour[k] = smooth(span(t, ...FLOOD[k])) * front.in;
			chalk[k] = (1 - smooth(span(t, ...FLOOD[k]))) * front.in;
		}
		frontRoom(ctx, art, decade, {
			cx: P[0],
			cy: P[1],
			height,
			par,
			colour,
			chalk,
			back: front.in,
			glassA: smooth(span(t, ...B.glass))
		});
	}

	// The orb: the light in the window ahead, grown by the approach, and the
	// flash as the lens reaches it.
	const D = ORB[2] - zL;
	const orbA = 1 - smooth(span(t, B.flash, B.flash + 0.25));
	if (D > 0.01 && orbA > 0) {
		const q = cam.project(ORB);
		const r = Math.min(0.42 * h, (ORB_R * (ORB[2] - Z0)) / D);
		ctx.save();
		ctx.globalAlpha = orbA;
		drawOrb(ctx, q[0], q[1], r, t - 10, {
			flare: 0.8 * bump(t, B.flash - 0.12, 0.14),
			halo: 1 - span(r, 40, 160)
		});
		ctx.restore();
	}
	impact(ctx, w, h, w / 2, h / 2, 0.42 * Math.min(w, h), t / 10, B.flash / 10, 1, true);

	// The questions, under the orb, anchored ahead of the lens at rest and
	// flown past on the step.
	const kOf = (dz) => DP / Math.max(0.06, DP - dz);
	prompt(ctx, w, h, kOf(zL - Z0), Q1, {
		q: span(t, ...B.q1),
		a: span(t, ...B.a1),
		enter: span(t, ...B.enter1),
		alpha: 1 - smooth(span(t, B.step1[0] + 0.15, B.step1[0] + 0.75)),
		secs: t
	});
	prompt(ctx, w, h, kOf(zL - Z1), Q2, {
		q: span(t, ...B.q2),
		a: span(t, ...B.a2),
		enter: span(t, ...B.enter2),
		alpha: 1 - smooth(span(t, B.step2[0] + 0.15, B.step2[0] + 0.75)),
		secs: t
	});
}

// A prompt as log-orb draws it — the question, the blank, the answer typed,
// the enter line, the cursor — at scale k (1 at rest; the step grows it and
// slides it out), on a wiped patch of board. The kit wipes its patch through
// ctx.filter = blur(), which headless is a software blur of 30–60 ms a frame,
// so the patch is drawn here first, the same size and place, feathered in
// eight rings (coverage on a smooth ramp, so no ring shows an edge), and
// the kit's prompt is drawn through a view of the context that drops the
// filter and that one fill.
function prompt(ctx, w, h, k, P, o) {
	const { q, alpha } = o;
	if (alpha <= 0.01 || q <= 0) return;
	const px = w / 2;
	const py = h / 2 + 0.3 * h * k;
	if (py - 60 * k > h + 40) return;
	ctx.save();
	ctx.font = `italic 400 ${18 * k}px ${MATH_FONT}`;
	const Wq = ctx.measureText(P.q).width;
	ctx.font = `italic 400 ${30 * k}px ${MATH_FONT}`;
	const Wv = ctx.measureText(P.val).width;
	ctx.fillStyle = PAL.ground;
	const W = Math.max(Wq, Wv) + 90 * k;
	const H = 136 * k;
	const A = Math.min(0.97, alpha * smooth(q * 3));
	const n = 8;
	const F = 22 * k;
	let cov = 0;
	for (let i = 1; i <= n; i++) {
		const c = A * smooth(i / n);
		ctx.globalAlpha = (c - cov) / (1 - cov);
		cov = c;
		const e = F * (1 - i / n);
		ctx.beginPath();
		ctx.roundRect(px - W / 2 - e, py - H / 2 - e, W + 2 * e, H + 2 * e, 26 * k + e);
		ctx.fill();
	}
	ctx.restore();
	drawPrompt(plain(ctx), makeView({ w, h, scale: k }), makeView({ w, h, scale: 1 }), h, P, o);
}

// The context without its filter and without fill(): what drawPrompt draws
// besides its patch (type, the lines, the cursor) goes through untouched.
const PLAIN = new WeakMap();
function plain(ctx) {
	let p = PLAIN.get(ctx);
	if (!p) {
		p = new Proxy(ctx, {
			get(o, key) {
				if (key === 'fill') return () => {};
				const v = o[key];
				return typeof v === 'function' ? v.bind(o) : v;
			},
			set(o, key, v) {
				if (key !== 'filter') o[key] = v;
				return true;
			}
		});
		PLAIN.set(ctx, p);
	}
	return p;
}

function pentPath(ctx, Q) {
	ctx.beginPath();
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
}

// A pane: the chalk composite on face F through the affine the lens makes of
// the face's up and right at its centre, on a patch of board, clipped to the
// pentagon. Faces with a vertex behind the lens are left to their edges.
function pane(ctx, cam, F, verts, flat, plate, alpha, dpr) {
	const Q = F.v.map((i) => cam.project(verts[i]));
	if (Q.some((p) => p[2] <= NEAR)) return;
	const C = add3(F.n, mul3(F.up, plate.yc));
	const P = cam.project(C);
	if (P[2] <= NEAR) return;
	const e = 0.05;
	const Pu = cam.project(add3(C, mul3(F.up, e)));
	const Pr = cam.project(add3(C, mul3(F.rt, e)));
	const rx = (Pr[0] - P[0]) / e;
	const ry = (Pr[1] - P[1]) / e;
	const ux = (Pu[0] - P[0]) / e;
	const uy = (Pu[1] - P[1]) / e;
	const px = Math.max(Math.hypot(rx, ry), Math.hypot(ux, uy)) * plate.W * dpr;
	ctx.save();
	pentPath(ctx, Q);
	ctx.clip();
	ctx.globalAlpha = alpha;
	ctx.transform(rx, ry, -ux, -uy, P[0], P[1]);
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(-plate.W / 2, -plate.H / 2, plate.W, plate.H);
	ctx.drawImage(pick(flat, px), -plate.W / 2, -plate.H / 2, plate.W, plate.H);
	ctx.restore();
}

// The pane ahead: the kit's room, layer by layer, chalk and colour at their
// own alphas, the glass filled with board (not wall) and lit, the parallax
// `par` slid per unit of depth.
function frontRoom(ctx, art, decade, { cx, cy, height, par, colour, chalk, back, glassA }) {
	const W = height * PHI;
	ctx.save();
	ctx.globalAlpha = back;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(cx - W / 2, cy - height / 2, W, height);
	ctx.restore();
	const V = { cx, cy, height, parallax: par };
	for (const cfg of LAYERS) {
		const key = cfg.key;
		if (key === 'screen') {
			const G = drawRoom(ctx, art, decade, { ...V, layers: ['screen'], alpha: 0 });
			if (G) glassLit(ctx, G, glassA, back);
		}
		if (colour[key] > 0.002)
			drawRoom(ctx, art, decade, { ...V, layers: [key], alpha: colour[key] });
		if (chalk[key] > 0.002)
			drawRoom(ctx, art, decade, { ...V, layers: [key], alpha: chalk[key], chalk: true });
	}
}

// The monitor's glass: board behind it, then lit — a warm screen, brightest
// at its heart, and a bloom of it over the bezel.
function glassLit(ctx, G, a, back) {
	ctx.save();
	ctx.translate(G.cx, G.cy);
	ctx.globalAlpha = back;
	ctx.fillStyle = PAL.ground;
	ctx.fillRect(-G.w / 2, -G.h / 2, G.w, G.h);
	if (a > 0.003) {
		glow(ctx, 0, 0, 0.9 * Math.max(G.w, G.h), [255, 214, 130], 0.22 * a * back);
		ctx.beginPath();
		ctx.rect(-G.w / 2, -G.h / 2, G.w, G.h);
		ctx.clip();
		const g = ctx.createRadialGradient(0, -0.08 * G.h, 0, 0, 0, 0.72 * Math.max(G.w, G.h));
		g.addColorStop(0, '#fff3d2');
		g.addColorStop(0.45, '#f2cf86');
		g.addColorStop(1, '#8a6a34');
		ctx.globalAlpha = 0.92 * a * back;
		ctx.fillStyle = g;
		ctx.fillRect(-G.w / 2, -G.h / 2, G.w, G.h);
	}
	ctx.restore();
}
