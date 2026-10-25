import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	bloom,
	math,
	PAL,
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
import { NEAR, lerp3, spline, pxPerUnit, makeDepth, runs3 } from './log/space.js';
import { drawOrb, impact, glow } from './log/ink.js';
import { drawHelix, poseOn } from './log/helix.js';
import { loadRooms, roomOf, drawRoom, mips, pick, PLATE, DECADES, LAYERS } from './log/rooms.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';

// ── Flow: flow-torus — the net, the torus, the cell ──────────────────────────
// One run of the site on the board, forty seconds, as THE TORUS: the net the
// questions draw round the orb is the torus, latent — the plane in ζ = log z,
// rolled up — and a cell of that net is the room.
//
//    0 –10   the terminal (log-dawn's, no command): the caret, the three lines,
//            the full stop typed last; it closes to a dot, lights, is the orb.
//   10 –20.5 the approach and the questions. The orb at the centre, 6 px, and
//            the lens flying at it: a slow creep, then a step per answer. Each
//            step is the net's own zoom (two periods of its symmetry z ↦ e^P z,
//            so the net lands on itself) and with each answer one family of
//            the net is written outward from the orb IN INK, thin: 11.0 the
//            birthday asked, 13.5 its step and the 21 GROOVES (θ = −(x − m)/S +
//            2π(j + ½)/21, shallow spirals), one of them indexed '1987', small,
//            once; 15.0 the spice asked, 17.0 its step and the 8 COILS (θ =
//            S(x − m) + 2πi/8, steep), one indexed 'saffron'. S = √(21/8) ≈ φ,
//            so the families cross at right angles and the net's cells are
//            GOLDEN RECTANGLES (W/H = 21/(8S) = 1.620). Then a hold, creeping
//            in, the orb close (47 px).
//   20.5     THE FLASH: the lens reaches the point (ink.js impact).
//   20.6–27.8 beat one, the lift: the board folds into the funnel and the tube
//            that a zoom into 0 flies down (β 1 → 0, the orb opening into the
//            tube's gold mouth), the lens backs out and round, the tube bends
//            (φ 0 → 2π) and its ends glue at 25.2: the torus, in ink. The tube
//            is 2π·26/(8S) long, so both families close (a groove comes back
//            as the groove 5 on, a coil as the coil 2 on) and the 21 grooves
//            run round the torus the long way like a record's; the zoom is now
//            the torus turning. The SWIMMER, at the flash only: out of the
//            light at 20.65, down groove 3, once round the torus, into the gold
//            seam as it closes at 25.2, gone. The lens comes round over the top
//            — the record, turning — by 27.8.
//   27.8–32.6 beat two, the cell: the lens descends into ONE cell, over the
//            axis then over the cell; from 28.8 the cells round it fill with
//            the rooms in chalk (four decades, instanced: one image per
//            distinct room through its mips, a few dozen cells), the near
//            ones in their six layers at depth INSIDE the tube; the lens goes
//            in through the cell's frame; colour floods the answer's room
//            32.3–33.8.
//   32.6–40  landed: the room in colour at the plate (rooms.js drawRoom), its
//            frame the net's own lines, swaying on its depths, the glass lit.
//
// A pure function of progress (?at= pins any frame). Hand-projected (camera3),
// the torus hidden-line tested against space.js's depth buffer, the far side
// faint and dashed. The only words: the terminal's, the two questions and
// their answers, and the two tiny indices on the net.

const SECONDS = 40;
const DECADE = '90s'; // the answer's room: a 1987 birthday, no 80s room on the shelf

// ── The net, and the torus it rolls into ────────────────────────────────────
const N1 = 8; // the coils: the steep family, slope S in (x, θ)
const N2 = 21; // the grooves: the shallow family, slope −1/S
const P = 26; // round the torus, each family comes back P lines on
const S = Math.sqrt(N2 / N1); // 1.620 ≈ φ: the cells are golden
const HYP = Math.sqrt(1 + S * S);
const TX = (Math.PI * P) / (N1 * S); // half the tube's length, in log|z|
const RB = TX / Math.PI; // the torus's big radius (the tube's is 1): ≈ 2
const PERIOD = TAU / (N1 * S); // the net's own zoom step, in log|z|
const CELL_W = TAU / N1 / HYP; // a cell along a groove
const CELL_H = ((TAU / N2) * S) / HYP; // and across: W/H = N2/(N1 S)
const SU = CELL_H / PLATE.H; // torus units per plate unit
const AIM = [1.98 * RB, Math.PI / 2]; // where the lens dives: (x, θ) on the torus
const SWIM_GROOVE = 3;
const LABEL_YEAR = { s: BIRTH.val.slice(-4), j: 5, xi: -1.31 }; // on groove 5
const LABEL_SPICE = { s: SPICE.val, i: 2, xi: -2.28 }; // on coil 2

// ── The beats, in seconds ────────────────────────────────────────────────────
const T = {
	term: 10,
	q1: [11.0, 11.7],
	a1: [11.9, 13.1],
	e1: [13.15, 13.45],
	s1: [13.5, 14.9],
	q2: [15.0, 15.6],
	a2: [15.8, 16.6],
	e2: [16.65, 16.95],
	s2: [17.0, 18.4],
	creep: [18.4, 20.4],
	flash: 20.5,
	fold: [20.6, 22.6],
	bend: [22.4, 25.2],
	swim: [20.65, 25.2],
	blend: [26.9, 27.8],
	dive: [27.8, 32.6],
	lateral: [27.8, 31.2],
	shift: [31.4, 32.6],
	rooms: [28.8, 30.3],
	flood: [32.3, 33.8],
	land: 32.6,
	sway: [32.8, 34.3],
	lit: [33.4, 35.2]
};
const LIFT_T = 7.3; // the turn through the lift: a bump of rate, from the flash
const LIFT_R = 0.9; // its peak, in log|z| a second

const E = (t, [a, b]) => easeInOutCubic(span(t, a, b));
const bump = (t, t0, wd) => Math.exp(-(((t - t0) / wd) ** 2));

// The zoom, m: the net's slide in log|z| (on the torus, its turn).
function zoomAt(t) {
	let m =
		0.06 * smooth(span(t, T.term, T.q1[0])) +
		2 * PERIOD * (E(t, T.s1) + E(t, T.s2)) +
		0.1 * smooth(span(t, T.creep[0], T.creep[1]));
	const tau = clamp01((t - T.flash) / LIFT_T) * LIFT_T;
	m += LIFT_R * (tau / 2 - (LIFT_T / (4 * Math.PI)) * Math.sin((TAU * tau) / LIFT_T));
	return m;
}
const M_END = zoomAt(SECONDS);
const betaAt = (t) => 1 - E(t, T.fold);
const phiAt = (t) => TAU * E(t, T.bend);

// The roll-up (log-mobius's): β = 1 the plane z = e^{x + iθ}, the conformal
// cones ρ = e^{βx} on the way, β = 0 the unit cylinder, x along its axis; then
// the axis bent round a circle by φ, 0 → 2π, which glues the ends.
function tube([x, th], beta, phi) {
	let rho;
	let z;
	if (beta > 1e-6) {
		rho = Math.exp(beta * x);
		z = (Math.sqrt(Math.max(0, 1 - beta * beta)) * Math.expm1(beta * x)) / beta;
	} else {
		rho = 1;
		z = x;
	}
	const px = rho * Math.cos(th);
	const py = rho * Math.sin(th);
	if (phi < 1e-4) return [px, py, z];
	const Rb = (2 * TX) / phi;
	const psi = z / Rb;
	return [Rb - (Rb - px) * Math.cos(psi), py, (Rb - px) * Math.sin(psi)];
}

// The cells: coil i and i + 1, groove j and j + 1 bound cell (i, j); its
// centre is where the two mid-lines cross.
function cellAt(i, j, m) {
	const A = (TAU * (i + 0.5)) / N1 - S * m;
	const B = (TAU * (j + 1)) / N2 + m / S;
	const x = ((B - A) * S) / (1 + S * S);
	return [x, A + S * x];
}
function cellNear(x, th, m) {
	const A = th - S * x;
	const B = th + x / S;
	return [Math.round(((A + S * m) * N1) / TAU - 0.5), Math.round(((B - m / S) * N2) / TAU - 1)];
}
// A cell's frame on the finished torus: centre, `right` along the groove
// (the room's width), `up` across, `n` outward — a right-handed trio with n
// toward an outside lens, so a room drawn in (right, up) reads upright.
function frameAt(z) {
	const C = tube(z, 0, TAU);
	const e = 1e-3;
	const tx = mul3(sub3(tube([z[0] + e, z[1]], 0, TAU), tube([z[0] - e, z[1]], 0, TAU)), 0.5 / e);
	const tt = mul3(sub3(tube([z[0], z[1] + e], 0, TAU), tube([z[0], z[1] - e], 0, TAU)), 0.5 / e);
	const n = norm(cross(tt, tx));
	const up = mul3(norm(add3(tx, mul3(tt, S))), -1);
	const right = norm(cross(up, n));
	return { C, right, up, n };
}

// ── The lens ─────────────────────────────────────────────────────────────────
// Orbit keys through the lift (seconds → value): flat over the pole, backing
// out of the folding funnel, round the bending tube, over the torus.
const AZ = [
	[T.flash, 0],
	[21.5, 0.05],
	[22.6, 0.45],
	[25.2, 1.35],
	[27.8, 3.0]
];
const EL = [
	[T.flash, 0],
	[21.5, 0.03],
	[22.6, 0.3],
	[25.2, 0.82],
	[27.8, 1.45]
];
const DIST = (D0) => [
	[T.flash, D0],
	[21.3, D0 * 1.08],
	[22.6, 11],
	[23.8, 13],
	[25.2, 10.5],
	[27.8, 8.5]
];

function cameraAt(t, w, h, G) {
	// A: the orbit.
	const az = spline(t, AZ);
	const el = spline(t, EL);
	const dist = spline(t, G.DIST);
	const phi = phiAt(t);
	const cx = phi > 1e-3 ? ((2 * TX) / phi) * (1 - Math.sin(phi / 2) / (phi / 2)) : 0;
	const body = [cx, 0.55 * smooth(span(t, 24, 25.5)), 0];
	const tgtA = lerp3(body, [RB, 0, 0], smooth(span(t, 25.2, 27)));
	const ce = Math.cos(el);
	const se = Math.sin(el);
	const ca = Math.cos(az);
	const sa = Math.sin(az);
	const posA = add3(tgtA, mul3([sa * ce, se, ca * ce], dist));
	const upA = [-sa * se, ce, -ca * se];
	// B: over the record, then down into the cell.
	const d = Math.exp(lerp(Math.log(8.5), Math.log(G.dLand), E(t, T.dive)));
	const ep = smooth(span(t, T.lateral[0], T.lateral[1]));
	const { C, n, up: upB } = G.aim;
	const posB = lerp3([RB, d, 0], add3(C, mul3(n, d)), ep);
	const tgtB = lerp3([RB, 0, 0], C, ep);
	const wB = smooth(span(t, T.blend[0], T.blend[1]));
	const pos = lerp3(posA, posB, wB);
	const target = lerp3(tgtA, tgtB, wB);
	const up = norm(lerp3(upA, upB, wB));
	const fov = lerp(40, 34, smooth(span(t, T.dive[0], 31)));
	const oy = (G.cy - h / 2) * smooth(span(t, T.shift[0], T.shift[1]));
	const cam = camera3({ pos, target, up, fov, w, h });
	if (oy) {
		const pr = cam.project;
		cam.project = (p) => {
			const q = pr(p);
			q[1] += oy;
			return q;
		};
	}
	return cam;
}

// ── Ink ──────────────────────────────────────────────────────────────────────
// Runs painted the plates' way: the far side faint and dashed, the near side
// a thin chalk line — every run of a kind in ONE path (the raster pays for
// each stroke call, not for the line), broken into short pieces only where a
// fade runs along it.
function ink(ctx, R, { color = PAL.chalk, width = 1.3, alpha = 0.8, hid = 0.26, dash = [3, 6] }) {
	const backs = [];
	const fronts = [];
	const pieces = [];
	for (const r of R) {
		const Q = r.Q;
		if (r.back) {
			if (hid > 0) backs.push(Q);
			continue;
		}
		let i = 0;
		while (i < Q.length - 1) {
			if (Q[i][3] >= 0.985 && Q[i + 1][3] >= 0.985) {
				let j = i + 1;
				while (j < Q.length - 1 && Q[j + 1][3] >= 0.985) j++;
				fronts.push(Q.slice(i, j + 1));
				i = j;
			} else {
				const j = Math.min(Q.length - 1, i + 3);
				const seg = Q.slice(i, j + 1);
				let f = 0;
				for (const q of seg) f += q[3];
				pieces.push([seg, f / seg.length]);
				i = j;
			}
		}
	}
	paths(ctx, backs, { color, width: width * 0.75, alpha: alpha * hid, dash });
	paths(ctx, fronts, { color, width, alpha });
	for (const [seg, f] of pieces) stroke(ctx, seg, { color, width, alpha: alpha * f, cap: 'butt' });
}

// Many polylines, one stroke.
function paths(ctx, runs, { color, width, alpha, dash = null }) {
	if (!runs.length || alpha <= 0.003) return;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	if (dash) ctx.setLineDash(dash);
	ctx.beginPath();
	for (const Q of runs) {
		ctx.moveTo(Q[0][0], Q[0][1]);
		for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	}
	ctx.stroke();
	ctx.restore();
}

// A drawing (a mip chain) into a quad of the screen [TL, TR, BR, BL]: the
// affine map of its centre and edge midpoints, one drawImage.
function quadImage(ctx, m, Q, alpha) {
	if (alpha <= 0.003 || !m) return;
	const [a, b, c, d] = Q;
	const cx = (a[0] + b[0] + c[0] + d[0]) / 4;
	const cy = (a[1] + b[1] + c[1] + d[1]) / 4;
	const axx = (b[0] + c[0] - a[0] - d[0]) / 2;
	const axy = (b[1] + c[1] - a[1] - d[1]) / 2;
	const ayx = (c[0] + d[0] - a[0] - b[0]) / 2;
	const ayy = (c[1] + d[1] - a[1] - b[1]) / 2;
	const px = Math.hypot(axx, axy);
	if (px < 2) return;
	const dpr = Math.hypot(ctx.getTransform().a, ctx.getTransform().b) || 1;
	const img = Array.isArray(m) ? pick(m, px * dpr) : m;
	const iw = img.width;
	const ih = img.height;
	ctx.save();
	ctx.globalAlpha *= alpha;
	ctx.transform(axx / iw, axy / iw, ayx / ih, ayy / ih, cx, cy);
	ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
	ctx.restore();
}

function pathQuad(ctx, Q) {
	ctx.beginPath();
	ctx.moveTo(Q[0][0], Q[0][1]);
	for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]);
	ctx.closePath();
}

// The four corners of a rectangle in a frame, projected; null if any is
// behind the lens.
function rectQuad(cam, c, right, up, hw, hh) {
	const Q = [];
	for (const [sx, sy] of [
		[-1, 1],
		[1, 1],
		[1, -1],
		[-1, -1]
	]) {
		const q = cam.project(add3(c, add3(mul3(right, sx * hw), mul3(up, sy * hh))));
		if (q[2] <= NEAR) return null;
		Q.push(q);
	}
	return Q;
}

// The room every layer composited flat, in chalk, the glass left clear.
function flatChalk(art, decade, px) {
	const c = document.createElement('canvas');
	c.width = px;
	c.height = Math.round(px / PHI);
	const x = c.getContext('2d');
	drawRoom(x, art, decade, {
		cx: c.width / 2,
		cy: c.height / 2,
		height: c.height,
		chalk: true,
		clip: true
	});
	return c;
}

// The landing sway, log-fall's: px of slide per unit of depth.
function sway(s, secs, amp) {
	const A = 0.116 * s * amp;
	return [A * Math.sin(1.1 * secs - 0.4), -0.45 * A * Math.sin(1.7 * secs + 0.6)];
}

export default async function make({ at }) {
	const b = getBoard();
	const time = clock(SECONDS, at);
	const term = makeTerminal(0.8, { cmd: false });
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-torus · loading the rooms');
	const t0 = performance.now();
	const art = await loadRooms({ decades: DECADES, chalk: true });
	const flat = {};
	for (const d of DECADES) flat[d] = art[d]?.bg ? mips(flatChalk(art, d, 1024)) : null;
	const loadMs = Math.round(performance.now() - t0);
	const Z = makeDepth(4);
	const info = { seconds: SECONDS, decade: DECADE, loadMs, missing: art.missing, frameMs: 0 };
	const Q1 = { ...BIRTH, key: '' };
	const Q2 = { ...SPICE, key: '' };

	// What depends on the board's size: the landing (log-fall's plate, a
	// little low), the lens's distances, the cell the lens dives into and
	// its frame, and the rooms laid out for that distance.
	let G = null;
	function geo(w, h) {
		if (G && G.w === w && G.h === h) return G;
		const R = 0.42 * Math.min(w, h);
		const D0 = pxPerUnit(h, 40) / R;
		const height = Math.min(0.62 * h, (0.74 * w) / PHI);
		const F0 = pxPerUnit(h, 34);
		const d0 = (F0 * PLATE.H) / height;
		const [i0, j0] = cellNear(AIM[0], AIM[1], M_END);
		const aim = frameAt(cellAt(i0, j0, M_END));
		const lay = {};
		for (const d of DECADES) lay[d] = roomOf(d, art, d0);
		G = {
			w,
			h,
			R,
			D0,
			DIST: DIST(D0),
			height,
			cx: w / 2,
			cy: 0.535 * h,
			d0,
			dLand: d0 * SU,
			i0,
			j0,
			aim,
			lay,
			flatLay: roomOf(DECADE, art)
		};
		return G;
	}

	let frames = 0;
	let ms = 0;
	function render() {
		const tf = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (window.__lab) window.__lab.t = t;
		if (t < T.term) term.draw(ctx, w, h, t / T.term, t, t - T.term);
		else scene(ctx, w, h, t);
		tag(ctx, w, h, 'flow-torus');
		ms += performance.now() - tf;
		if (++frames === 20) {
			info.frameMs = Math.round((ms / frames) * 10) / 10;
			if (window.__lab) window.__lab.frameMs = info.frameMs;
			frames = 0;
			ms = 0;
		}
	}

	// ── The scene, from the orb on ─────────────────────────────────────────
	function scene(ctx, w, h, t) {
		const g = geo(w, h);
		const R = g.R;
		const m = zoomAt(t);
		const beta = betaAt(t);
		const phi = phiAt(t);
		const place = (z) => tube(z, beta, phi);
		const cam = cameraAt(t, w, h, g);
		const orbPx = ORB_R * Math.exp(m);
		const diag = Math.hypot(w, h) / 2;
		const xOrb = Math.log((orbPx * 1.05) / R);
		const x0 = xOrb + (-TX - xOrb) * smooth(span(1 - beta, 0, 0.85));
		const x1 = beta >= 0.999 ? Math.min(TX, Math.log((1.15 * diag) / R)) : TX;
		const glued = span(phi, TAU * 0.985, TAU);

		// The surface, for hidden lines: once the lens is out of the funnel.
		const zOn = beta < 0.6;
		if (zOn) {
			Z.reset(w, h);
			let prev = null;
			const NX = 64;
			const NT = 28;
			for (let i = 0; i <= NX; i++) {
				const x = -TX + (2 * TX * i) / NX;
				const row = [];
				let ok = true;
				for (let j = 0; j <= NT; j++) {
					const q = cam.project(place([x, (TAU * j) / NT]));
					if (q[2] < 0.45) ok = false;
					row.push(q);
				}
				if (prev && ok)
					for (let j = 0; j < NT; j++) {
						Z.tri(prev[j], row[j], row[j + 1]);
						Z.tri(prev[j], row[j + 1], prev[j + 1]);
					}
				prev = ok ? row : null;
			}
		} else Z.off();
		const depth = zOn ? Z : null;

		// The net: the grooves on the first answer, the coils on the second,
		// each written outward from the orb over its step.
		const fade = (x) => smooth((x - x0) / 0.35);
		const wrG = smooth(span(t, T.s1[0], T.s1[0] + 1.3));
		const wrC = smooth(span(t, T.s2[0], T.s2[0] + 1.3));
		const back = [];
		const front = [];
		const line = (thOf, upto, dx) => {
			const xe = x0 + (x1 - x0) * upto;
			const n = Math.max(2, Math.ceil((xe - x0) / dx));
			const pts = [];
			const xs = [];
			for (let k = 0; k <= n; k++) {
				const x = x0 + ((xe - x0) * k) / n;
				xs.push(x);
				pts.push(place([x, thOf(x)]));
			}
			for (const r of runs3(cam, pts, { depth, fade: (p, i) => fade(xs[i]) }))
				(r.back ? back : front).push(r);
		};
		if (wrG > 0)
			for (let j = 0; j < N2; j++) line((x) => -(x - m) / S + (TAU * (j + 0.5)) / N2, wrG, 0.045);
		if (wrC > 0) for (let i = 0; i < N1; i++) line((x) => S * (x - m) + (TAU * i) / N1, wrC, 0.03);
		ink(ctx, back, {});
		ink(ctx, front, {});

		// The two ends of the tube: toward 0 the gold mouth the orb opens into,
		// toward ∞ chalk; glued, one seam, gold.
		const mouthA = span(1 - beta, 0.12, 0.45);
		const ring = (x) => {
			const out = [];
			for (let i = 0; i <= 72; i++) out.push(place([x, (TAU * i) / 72]));
			return out;
		};
		let c0 = [0, 0, 0];
		const end0 = ring(-TX);
		for (let i = 0; i < 72; i++) c0 = add3(c0, mul3(end0[i], 1 / 72));
		const q0 = cam.project(c0);
		if (mouthA > 0) {
			const fillA = 0.3 * (1 - glued) * mouthA;
			if (fillA > 0.005) {
				const Qm = end0.map((p) => cam.project(p));
				if (Qm.every((q) => q[2] > NEAR)) {
					ctx.save();
					ctx.globalAlpha = fillA;
					ctx.fillStyle = PAL.gold;
					pathQuad(ctx, Qm);
					ctx.fill();
					ctx.restore();
				}
			}
			if (q0[2] > NEAR && glued < 1)
				bloom(ctx, q0[0], q0[1], R * 0.3, 'rgba(255, 226, 160, 0.55)', 0.8 * mouthA * (1 - glued));
			const endA = 0.8 * (1 - glued) * span(1 - beta, 0.6, 0.9);
			if (endA > 0) ink(ctx, runs3(cam, ring(TX), { depth }), { width: 1.6, alpha: endA });
			const flash = span(t, 25.1, 25.35) * (1 - span(t, 25.35, 25.9));
			const seam = runs3(cam, end0, { depth });
			ink(ctx, seam, { color: PAL.gold, width: 7 + 6 * flash, alpha: 0.16 * mouthA, hid: 0 });
			ink(ctx, seam, { color: PAL.gold, width: 2 + 2 * flash, alpha: 0.95 * mouthA, hid: 0.45 });
			if (flash > 0 && q0[2] > NEAR)
				bloom(ctx, q0[0], q0[1], R * 0.6 * flash, 'rgba(255, 236, 196, 0.6)', flash);
		}

		// The orb: breathing on its own clock since the terminal lit it,
		// growing as the lens flies at it, fading into the mouth at the fold.
		const orbA = 1 - smooth(span(1 - beta, 0.25, 0.55));
		if (orbA > 0 && q0[2] > NEAR) {
			const flare =
				0.9 * bump(t, T.flash, 0.12) + 0.5 * bump(t, T.s1[1], 0.1) + 0.5 * bump(t, T.s2[1], 0.1);
			ctx.save();
			ctx.globalAlpha = orbA;
			drawOrb(ctx, q0[0], q0[1], orbPx, t - T.term, { flare, halo: orbA });
			ctx.restore();
		}

		// The indices: the year on its groove, the spice on its coil — tiny,
		// once, riding the net out and onto the torus.
		const labelOut = 1 - smooth(span(t, 27, 28));
		const label = (s, x, th, a) => {
			if (a <= 0.01) return;
			const q = cam.project(place([x, th]));
			if (q[2] <= NEAR || Z.hidden(q)) return;
			math(ctx, s, q[0] + 7, q[1] - 7, { size: 11, alpha: 0.62 * a });
		};
		label(
			LABEL_YEAR.s,
			m + LABEL_YEAR.xi,
			-LABEL_YEAR.xi / S + (TAU * (LABEL_YEAR.j + 0.5)) / N2,
			smooth(span(t, 14.55, 15.0)) * labelOut
		);
		label(
			LABEL_SPICE.s,
			m + LABEL_SPICE.xi,
			S * LABEL_SPICE.xi + (TAU * LABEL_SPICE.i) / N1,
			smooth(span(t, 18.0, 18.4)) * labelOut
		);

		// The swimmer, at the flash only: out of the light, down a groove,
		// once round the torus, into the seam as it closes.
		const sw = span(t, T.swim[0], T.swim[1]);
		if (sw > 0 && sw < 1) {
			const us = Math.pow(sw, 0.8);
			const path = (u) => {
				const x = -TX + 2 * TX * u;
				return place([x, -(x - m) / S + (TAU * (SWIM_GROOVE + 0.5)) / N2]);
			};
			const pose = poseOn(path, us, t * 2.6 * Math.PI, 0.2);
			const a = smooth(span(sw, 0, 0.08)) * (1 - smooth(span(sw, 0.9, 1)));
			drawHelix(ctx, cam, pose, { alpha: a, width: 2.2, core: 0.9, glow: 0.25, depth });
		}

		// The cells, from the record on: the rooms in chalk round the one the
		// lens is going into, the near ones in their layers inside the tube.
		const roomA = smooth(span(t, T.rooms[0], T.rooms[1]));
		if (roomA > 0) cells(ctx, w, h, t, cam, g, roomA);

		// The flash.
		if (t >= T.flash - 0.1)
			impact(ctx, w, h, w / 2, h / 2, R, 0.5 + (t - T.flash) / 10, 0.5, 1, true);

		// The questions, on the way in.
		if (t < T.flash) {
			const viewAt = (mm) => makeView({ w, h, scale: R * Math.exp(mm) });
			const view = viewAt(m);
			drawPrompt(ctx, view, viewAt(0.06), h, Q1, {
				q: span(t, T.q1[0], T.q1[1]),
				a: span(t, T.a1[0], T.a1[1]),
				enter: span(t, T.e1[0], T.e1[1]),
				alpha: 1 - smooth(span(t, T.s1[0] + 0.2, T.s1[0] + 0.9)),
				secs: t
			});
			drawPrompt(ctx, view, viewAt(0.06 + 2 * PERIOD), h, Q2, {
				q: span(t, T.q2[0], T.q2[1]),
				a: span(t, T.a2[0], T.a2[1]),
				enter: span(t, T.e2[0], T.e2[1]),
				alpha: 1 - smooth(span(t, T.s2[0] + 0.2, T.s2[0] + 0.9)),
				secs: t
			});
		}
	}

	// ── The cells of the net, as rooms ─────────────────────────────────────
	function cells(ctx, w, h, t, cam, g, roomA) {
		const m = zoomAt(t);
		const col = smooth(span(t, T.flood[0], T.flood[1]));
		const inkA = Math.min(1, 1.15 - col);
		const landed = t >= T.land;
		const [xa, ta] = cellAt(g.i0, g.j0, m);
		const list = [];
		for (let di = -5; di <= 5; di++)
			for (let dj = -4; dj <= 4; dj++) {
				const i = g.i0 + di;
				const j = g.j0 + dj;
				const z = cellAt(i, j, m);
				if (Math.abs(z[0]) > TX) continue;
				const dd = Math.hypot((z[0] - xa) / CELL_W, (z[1] - ta) / CELL_H);
				if (dd > 3.4) continue;
				const F = frameAt(z);
				if (dot(F.n, sub3(cam.pos, F.C)) < 0.05) continue;
				const q = cam.project(F.C);
				if (q[2] <= NEAR || Z.hidden(q)) continue;
				if (Math.abs(q[0] - w / 2) > w || Math.abs(q[1] - h / 2) > h) continue;
				const target = di === 0 && dj === 0;
				const near = target; // only the cell the lens enters is drawn in its layers
				const decade = target ? DECADE : DECADES[(((i * 3 + j * 5) % 4) + 4) % 4];
				list.push({
					F,
					q,
					dd,
					target,
					near,
					decade,
					alpha: roomA * (1 - smooth(span(dd, 2.4, 3.4)))
				});
			}
		list.sort((a, b) => b.q[2] - a.q[2]);
		for (const c of list) {
			if (c.target && landed) continue;
			const { C, right, up, n } = c.F;
			const frame = rectQuad(cam, C, right, up, CELL_W / 2, CELL_H / 2);
			if (!frame) continue;
			// Off the board entirely: skip (the centre test above is generous).
			let bx0 = Infinity;
			let bx1 = -Infinity;
			let by0 = Infinity;
			let by1 = -Infinity;
			for (const q of frame) {
				if (q[0] < bx0) bx0 = q[0];
				if (q[0] > bx1) bx1 = q[0];
				if (q[1] < by0) by0 = q[1];
				if (q[1] > by1) by1 = q[1];
			}
			if (bx1 < 0 || bx0 > w || by1 < 0 || by0 > h) continue;
			if (!c.near) {
				quadImage(ctx, flat[c.decade], frame, c.alpha);
				continue;
			}
			const lay = g.lay[c.decade];
			ctx.save();
			pathQuad(ctx, frame);
			ctx.clip();
			for (const cfg of LAYERS) {
				const L = lay.lay[cfg.key];
				const a = art[c.decade]?.[cfg.key];
				if (!L || !a) continue;
				if (cfg.key === 'screen' && lay.glass) {
					const gl = lay.glass;
					const gc = add3(
						C,
						add3(mul3(right, gl.x * SU), add3(mul3(up, gl.y * SU), mul3(n, gl.z * SU)))
					);
					const Qg = rectQuad(cam, gc, right, up, (gl.w * SU) / 2 + 0.002, (gl.h * SU) / 2 + 0.002);
					if (Qg) {
						ctx.save();
						ctx.globalAlpha = c.alpha;
						pathQuad(ctx, Qg);
						ctx.fillStyle = PAL.ground;
						ctx.fill();
						if (b.dust) {
							ctx.fillStyle = b.dust;
							ctx.fill();
						}
						ctx.restore();
					}
				}
				const lc = add3(
					C,
					add3(mul3(right, L.x * SU), add3(mul3(up, L.y * SU), mul3(n, L.z * SU)))
				);
				const Q = rectQuad(cam, lc, right, up, (L.w * SU) / 2, (L.h * SU) / 2);
				if (!Q) continue;
				if (c.target) {
					quadImage(ctx, a.chalk, Q, c.alpha * inkA);
					quadImage(ctx, a.mips, Q, c.alpha * col);
				} else quadImage(ctx, a.chalk, Q, c.alpha);
			}
			ctx.restore();
		}

		// Landed: the room at the plate, in its layers, swaying on its
		// depths; the board in its glass, and the glass lit.
		if (landed) {
			const s = g.height / 2;
			const par = sway(s, t, smooth(span(t, T.sway[0], T.sway[1])));
			const V = { cx: g.cx, cy: g.cy, height: g.height, parallax: par };
			const backL = ['bg', 'poster', 'clock'];
			const frontL = ['screen', 'desk', 'bed'];
			drawRoom(ctx, art, DECADE, { ...V, layers: backL, chalk: true, alpha: inkA });
			drawRoom(ctx, art, DECADE, { ...V, layers: backL, alpha: col });
			const gl = g.flatLay.glass;
			const sd = LAYERS.find((c) => c.key === 'screen').depth;
			const gx = g.cx + s * gl.x + par[0] * sd;
			const gy = g.cy - s * gl.y + par[1] * sd;
			const gw = gl.w * s;
			const gh = gl.h * s;
			ctx.save();
			ctx.beginPath();
			ctx.rect(gx - gw / 2 - 0.5, gy - gh / 2 - 0.5, gw + 1, gh + 1);
			ctx.fillStyle = PAL.ground;
			ctx.fill();
			if (b.dust) {
				ctx.fillStyle = b.dust;
				ctx.fill();
			}
			const lit = smooth(span(t, T.lit[0], T.lit[1]));
			if (lit > 0) {
				ctx.clip();
				glow(ctx, gx, gy, 0.62 * Math.min(gw, gh), [255, 220, 150], 0.34 * lit);
			}
			ctx.restore();
			if (lit > 0)
				stroke(
					ctx,
					[
						[gx - gw / 2, gy - gh / 2],
						[gx + gw / 2, gy - gh / 2],
						[gx + gw / 2, gy + gh / 2],
						[gx - gw / 2, gy + gh / 2],
						[gx - gw / 2, gy - gh / 2]
					],
					{ color: PAL.gold, width: 1.2, alpha: 0.3 * lit }
				);
			drawRoom(ctx, art, DECADE, { ...V, layers: frontL, chalk: true, alpha: inkA });
			drawRoom(ctx, art, DECADE, { ...V, layers: frontL, alpha: col });
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
