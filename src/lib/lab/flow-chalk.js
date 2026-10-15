import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	PAL,
	TAU,
	PHI,
	GOLDEN_ANGLE,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	norm,
	sub3,
	tag
} from './log/board.js';
import { drawOrb, glow, impact } from './log/ink.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';
import { PLATE, DECADES, loadRooms, roomOf, drawImageAt } from './log/rooms.js';
import { drawHelix } from './log/helix.js';

// ── Flow: flow-chalk — THE CHALK FALL ────────────────────────────────────────
// One run of the site on the board, in chalk. The terminal types the card and
// its full stop lights into the orb; round the orb, far off, the golden-angle
// TUNNEL is written out in chalk — log-tunnel's lattice (seed n at n · 137.5°,
// r = φ^{−n/18}; the 13-spirals one way, the 8-spirals the other, a seed at
// every crossing, the ribs φ^{−2k} and the mouth |z| = 1 round it) seen head
// on, converging into the light. The two questions are asked below the orb
// and each answer is ONE step into the tunnel: a zoom of 34 seeds (×2.48 and
// a turn of 4.8°, the flow along the lattice's own 34-spiral), which lays the
// lattice exactly on itself, closer, the prompt flown past. The orb swells to
// the frame; the flash; and out of it the first chalk plate hangs where the
// orb was, with the lattice streaming round it: the fall. The lens falls
// plate → glass → plate, the chalk rooms coming up through one another, the
// same lattice behind and around them all (through every glass the tunnel
// shows — the next plate hangs in it), gathering pace, and lands in the
// answer's room, which floods with colour, bed first and wall last, and sways
// on its depths with its glass lit. The helix swimmer leads the fall through
// the first glass or two, then outswims the lens into the dark.
//
// Beats, in seconds:
//    0 – 10    the terminal (log-dawn's, no command line), ending on the orb
//   10 – 12    the lattice written out of the orb, far off, faint
//   12 – 14.4  "when were you born?"  typed, entered
//   14.5–15.7  step one: 34 seeds in
//   16 – 18    "name a spice"  typed, entered
//   18.1–19.3  step two: 34 seeds in
//   19.3–20.4  held, creeping
//   20.4–21.4  the dive: the lens reaches the light, which fills the frame
//   21.4       THE FLASH — and the geometry turns over: the first chalk plate
//   21.4–31    the fall through six chalk rooms, the lattice streaming, the
//              swimmer leading it (21.5–25.4), the landing slide 29–31
//   29.4–31.6  colour floods the 1990s, bed first, wall last; the glass lights
//   31 – 37    the room, held, swaying on its depths
//
// Two beats between the last answer and the room: the flash, the fall.
// A pure function of progress: ?at= pins any frame. ?decade=50s|60s|90s|10s
// picks the room to land in (the 1990s, the answer's, by default).

const SECONDS = 37;
const B = {
	term: 10,
	write: [10, 12],
	q1: [12.0, 12.7],
	a1: [13.0, 13.9],
	e1: [14.0, 14.4],
	s1: [14.5, 15.7],
	q2: [16.0, 16.6],
	a2: [16.9, 17.5],
	e2: [17.6, 18.0],
	s2: [18.1, 19.3],
	dive: [20.4, 21.4],
	flash: 21.4,
	fall: [21.4, 31.0],
	land: [29.0, 31.0],
	colour: [29.4, 31.6],
	swim: [21.5, 25.4]
};
const CREEP = 0.03; // e-folds a second, so the lens is always flying
const DIVE = 0.45; // e-folds over the dive
const CROSSINGS = 5; // glasses fallen through: six rooms, the answer's last

// ── The lattice ──────────────────────────────────────────────────────────────
// Log-phyllotaxis, as log-tunnel has it: seed n at angle n·α (α the golden
// angle) and radius e^{−cn}, c = log φ / 18, where the 8- and 13-spirals cross
// at right angles. On the log cylinder it is a lattice, so a zoom of e^{Fc}
// with a turn of F·α lays it on itself: a flight into its centre never runs
// out. Each answer is the step F = 34 — a zoom of 2.48 and a turn of 4.8°.
const wrapPi = (a) => a - TAU * Math.round(a / TAU);
const LC = Math.log(PHI) / 18;
const dTheta = (F) => wrapPi(F * GOLDEN_ANGLE);
const slope = (F) => dTheta(F) / (-F * LC);
const seed = (n) => [-LC * n, n * GOLDEN_ANGLE];
const STEP = 34;
const LN_STEP = STEP * LC;
const KAPPA = slope(STEP); // the turn per e-fold along the 34-spiral
const LAT = { r0: 0.22, alpha: 0.6, net: [13, 8] };

// ── The nest ─────────────────────────────────────────────────────────────────
const FOV = 34;
const FIT = 0.9; // how much of its glass the next plate fills, at rest
const MARGIN = 1.35; // how far past the parent's glass the lens is, at rest
const NEARZ = 0.015; // planes nearer than this (in the lens's units) are passed
const ZETA0 = -0.55; // where the fall starts: this far before the first plate

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const b = getBoard();
	const time = clock(SECONDS, at);
	const term = makeTerminal(0.8, { cmd: false });
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-chalk · loading the rooms');
	const t0 = performance.now();
	const art = await loadRooms({ chalk: true });
	const others = DECADES.filter((d) => d !== decade);
	const order = [];
	for (let i = 0; i < CROSSINGS; i++) order.push(others[i % others.length]);
	order.push(decade);
	const info = {
		seconds: SECONDS,
		decade,
		rooms: order,
		missing: art.missing,
		loadMs: Math.round(performance.now() - t0)
	};
	const Q1 = { ...BIRTH, key: '' };
	const Q2 = { ...SPICE, key: '' };

	let geo = null;
	let fl = null;

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const t = time.t;
		if (t <= B.term) {
			term.draw(ctx, w, h, t / B.term, t, t - B.term);
			tag(ctx, w, h, 'flow-chalk');
			return;
		}
		if (!geo || geo.w !== w || geo.h !== h) {
			geo = makeNest(w, h, order, art);
			fl = makeFlight(geo);
			info.lambda = geo.levels.slice(0, geo.L).map((l) => Number((1 / l.X).toFixed(2)));
			info.efolds = Number(geo.TOTAL.toFixed(2));
		}
		const { tau, zeta } = fl.at(t);
		const viewAt = (tt) => makeView({ w, h, scale: LAT.r0 * h * Math.exp(tt), rot: KAPPA * tt });

		if (t < B.flash) {
			// The approach: the lattice round the light, the questions below it.
			const cx = w / 2;
			const cy = h / 2;
			drawLattice(ctx, cx, cy, w, h, tau, smooth(span(t, B.write[0], B.write[1])), LAT.alpha);
			orbAt(ctx, cx, cy, t, tau);
			const view = viewAt(tau);
			drawPrompt(ctx, view, viewAt(fl.tauQ(B.s1[0])), h, Q1, {
				q: span(t, B.q1[0], B.q1[1]),
				a: span(t, B.a1[0], B.a1[1]),
				enter: span(t, B.e1[0], B.e1[1]),
				alpha: 1 - smooth(span(t, B.s1[0] + 0.05, B.s1[0] + 0.6)),
				secs: t
			});
			drawPrompt(ctx, view, viewAt(fl.tauQ(B.s2[0])), h, Q2, {
				q: span(t, B.q2[0], B.q2[1]),
				a: span(t, B.a2[0], B.a2[1]),
				enter: span(t, B.e2[0], B.e2[1]),
				alpha: 1 - smooth(span(t, B.s2[0] + 0.05, B.s2[0] + 0.6)),
				secs: t
			});
			fillLight(ctx, cx, cy, w, h, t);
		} else {
			// The fall: the lens in the nest, the lattice at its vanishing point.
			const cam = lensAt(geo, zeta, t, w, h);
			drawLattice(ctx, cam.ox, cam.oy, w, h, tau, 1, LAT.alpha * lerp(1, 0.7, cam.land));
			fall(ctx, b, geo, art, cam, t, fl);
			fillLight(ctx, cam.ox, cam.oy, w, h, t);
			impact(ctx, w, h, cam.ox, cam.oy, 0.4 * h, (t - B.flash) / 10, 0, 1, true);
		}
		tag(ctx, w, h, 'flow-chalk');
	}

	return {
		info,
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The flight ───────────────────────────────────────────────────────────────
// τ(t): how many e-folds the lens has flown by t, continuous in value and in
// rate through the flash. Before the dive: a creep plus one eased step of
// ln 2.48 per answer. The dive: a Hermite from the creep's rate to the rate
// the fall starts at. The fall: the nest's e-folds (from ζ₀ to the last
// plate) at a pace that gathers and lands — speed ∝ (c + x)³ (1 − x)² — and
// ζ is read back off the e-folds, so the rooms and the lattice are ONE zoom.
function makeFlight(geo) {
	const n = 512;
	const c = 0.35;
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
	const D = B.fall[1] - B.fall[0];
	const rate0 = (geo.TOTAL * (Math.pow(c, 3) / (acc / n))) / D;
	const tauQ = (t) =>
		CREEP * (t - B.term) +
		LN_STEP *
			(easeInOutCubic(span(t, B.s1[0], B.s1[1])) + easeInOutCubic(span(t, B.s2[0], B.s2[1])));
	const p0 = tauQ(B.dive[0]);
	const Dd = B.dive[1] - B.dive[0];
	const p1 = p0 + DIVE;
	const at = (t) => {
		if (t <= B.dive[0]) return { tau: tauQ(t), zeta: ZETA0, x: 0 };
		if (t < B.dive[1]) {
			const s = (t - B.dive[0]) / Dd;
			const s2 = s * s;
			const s3 = s2 * s;
			const tau =
				(2 * s3 - 3 * s2 + 1) * p0 +
				(s3 - 2 * s2 + s) * CREEP * Dd +
				(-2 * s3 + 3 * s2) * p1 +
				(s3 - s2) * rate0 * Dd;
			return { tau, zeta: ZETA0, x: 0 };
		}
		const x = clamp01((t - B.fall[0]) / D);
		const tf = geo.TOTAL * E(x);
		return { tau: p1 + tf, zeta: geo.zetaOf(tf), x };
	};
	return { at, tauQ };
}

// ── The lattice, drawn ───────────────────────────────────────────────────────
// Head on, its pole at (cx, cy): the mouth |z| = 1 at r₀·e^{τ} px, the ribs
// φ^{−2k} inside it, the two families of spirals through the seeds, and the
// seeds themselves; `write` writes it out of the centre; all in chalk, faint,
// fading into the pole where the light (or the glass) is.
function drawLattice(ctx, cx, cy, w, h, tau, write, a0) {
	if (write <= 0 || a0 <= 0) return;
	const R0 = LAT.r0 * h;
	const lnR0 = Math.log(R0);
	const turn = KAPPA * tau;
	const rMax = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 30;
	const mouth = R0 * Math.exp(tau);
	const rOut = Math.min(rMax, mouth);
	const rIn = 2.5;
	const rWrite = lerp(rIn, rOut, write);
	const at = (s, th) => {
		const r = Math.exp(s + tau + lnR0);
		const a = th + turn;
		return [cx + r * Math.cos(a), cy - r * Math.sin(a), r];
	};
	const fadeIn = (r) => span(r, 6, 60);
	const inView = (x, y) => x > -40 && x < w + 40 && y > -40 && y < h + 40;

	// The ribs: the mouth, and the rings φ^{−2k} down the tunnel.
	const ring = 2 * Math.log(PHI);
	for (let k = 0; ; k++) {
		const r = mouth * Math.exp(-k * ring);
		if (r < 8) break;
		if (r > rMax) continue;
		const a = (k === 0 ? 0.5 : 0.3) * fadeIn(r) * span(rWrite, r * 0.6, r) * a0;
		if (a <= 0.005) continue;
		ctx.save();
		ctx.globalAlpha = a;
		ctx.strokeStyle = PAL.chalk;
		ctx.lineWidth = k === 0 ? 1.2 : 0.9;
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, TAU);
		ctx.stroke();
		ctx.restore();
	}

	// The two families, through the seeds, written out of the centre.
	const sIn = Math.log(rIn) - tau - lnR0;
	const sOut = Math.log(Math.min(rOut, rWrite)) - tau - lnR0;
	for (const F of LAT.net) {
		const m = slope(F);
		for (let j = 0; j < F; j++) {
			const [sj, tj] = seed(j);
			const P = [];
			const Wd = [];
			const A = [];
			for (let s = sIn; s <= sOut + 1e-9; s += 0.04) {
				const p = at(s, tj + m * (s - sj));
				P.push(p);
				Wd.push(Math.min(2.2, 0.6 + p[2] / 450));
				A.push(0.55 * a0 * fadeIn(p[2]));
			}
			ribbon(ctx, P, Wd, A, PAL.chalk);
		}
	}

	// The seeds: chalk discs at the crossings, growing outward with r.
	const nLo = Math.max(0, Math.ceil((tau + lnR0 - Math.log(rOut + 40)) / LC));
	const nHi = Math.floor((tau + lnR0 - Math.log(rIn)) / LC);
	for (let n = nLo; n <= nHi; n++) {
		const [sn, tn] = seed(n);
		const p = at(sn, tn);
		if (!inView(p[0], p[1])) continue;
		const pop = span(rWrite, p[2] * 0.95, p[2] * 1.15);
		if (pop <= 0) continue;
		const rr = Math.min(6, 0.024 * p[2]) * pop;
		if (rr < 0.4) continue;
		disc(ctx, p[0], p[1], rr, { fill: PAL.chalk, alpha: 0.6 * a0 * fadeIn(p[2]) });
	}
}

// A polyline in runs — a new run wherever the width or the alpha has moved
// on by a step — each one stroke at its own width and alpha: a few strokes
// to a spiral rather than one a segment.
function ribbon(ctx, P, Wd, A, color) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const n = P.length;
	let i = 0;
	while (i < n - 1) {
		const w0 = Wd[i];
		const a0 = A[i];
		let j = i + 1;
		while (j < n - 1 && Math.abs(Wd[j] - w0) < 0.35 && Math.abs(A[j] - a0) < 0.06) j++;
		const a = (a0 + A[j]) / 2;
		if (a > 0.004) {
			ctx.globalAlpha = Math.min(1, a);
			ctx.lineWidth = (w0 + Wd[j]) / 2;
			ctx.beginPath();
			ctx.moveTo(P[i][0], P[i][1]);
			for (let q = i + 1; q <= j; q++) ctx.lineTo(P[q][0], P[q][1]);
			ctx.stroke();
		}
		i = j;
	}
	ctx.restore();
}

// ── The light ────────────────────────────────────────────────────────────────
// The orb, growing with the zoom (a fixed thing in the world), swelling and
// flaring over the dive; in the last quarter second the light it gives takes
// the frame (fillLight) and the orb goes out under it — and is not drawn, so
// its blurred limb is not paid for at its largest.
function orbAt(ctx, cx, cy, t, tau) {
	const under = smooth(span(t, B.flash - 0.25, B.flash - 0.04));
	if (under >= 1) return;
	const dive = smooth(span(t, B.dive[0], B.flash));
	const r = ORB_R * Math.exp(tau) * (1 + 1.2 * dive);
	ctx.save();
	ctx.globalAlpha = 1 - under;
	drawOrb(ctx, cx, cy, r, t - B.term, { flare: 0.9 * dive * dive, halo: 1 - dive });
	ctx.restore();
}

// The light filling the frame from the centre out, at the end of the dive,
// and lingering a moment past the flash so the plate comes out of it.
function fillLight(ctx, x, y, w, h, t) {
	const up = smooth(span(t, B.flash - 0.5, B.flash));
	const f = up * (1 - smooth(span(t, B.flash, B.flash + 0.4)));
	if (f <= 0.003) return;
	const D = Math.hypot(w, h) / 2;
	const R = D * lerp(0.1, 1.0, up);
	const g = ctx.createRadialGradient(x, y, 0, x, y, R);
	g.addColorStop(0, `rgba(255, 250, 238, ${f})`);
	g.addColorStop(lerp(0.2, 0.45, up), `rgba(255, 244, 220, ${f})`);
	g.addColorStop(0.75, `rgba(250, 226, 170, ${0.45 * f})`);
	g.addColorStop(1, 'rgba(245, 193, 80, 0)');
	ctx.save();
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(x, y, R, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// ── The nest ─────────────────────────────────────────────────────────────────
// The Droste nest of log-fall: level k is room k under the similarity
// x ↦ O_k + s_k·x (z scaled too), its child hanging `gap` behind its glass,
// scaled by X = 1/λ, letterboxed in the glass (FIT) and set so far behind it
// that the lens at rest has passed it (MARGIN). pose(ζ) is the lens at level
// ζ: at an integer it sits d₀ in front of that plate, square on its glass.
function makeNest(w, h, order, art) {
	const F = h / 2 / Math.tan((FOV * Math.PI) / 360);
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
		if (k === L) break;
		const G = r.glass;
		const Gc = room(order[k + 1]).glass;
		const Dg = d0 - G.z;
		const fh = FIT * Math.min(G.h, G.w / PHI);
		const kap = (MARGIN * d0 * fh) / (PLATE.H * Dg);
		const gap = (kap * Dg) / (1 - kap);
		const X = (fh * (Dg + gap)) / (PLATE.H * Dg);
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
			s: lv.s * sc
		};
	};
	// The e-folds of zoom from ζ₀ to ζ, and ζ from them: the crossings are
	// zooms of different sizes, and the fall runs at one pace in e-folds.
	const logs = levels.map((l) => (l.X ? -Math.log(l.X) : 1));
	const efolds = (zeta) => {
		if (zeta < 0) return zeta * logs[0];
		let e = 0;
		for (let k = 0; k < L; k++) {
			if (zeta < k + 1) return e + (zeta - k) * logs[k];
			e += logs[k];
		}
		return e;
	};
	const E0 = efolds(ZETA0);
	const TOTAL = efolds(L) - E0;
	const zetaOf = (tf) => {
		let lam = tf + E0;
		if (lam < 0) return lam / logs[0];
		for (let k = 0; k < L; k++) {
			if (lam < logs[k]) return k + lam / logs[k];
			lam -= logs[k];
		}
		return L;
	};
	return { w, h, F, d0, plate, L, levels, pose, TOTAL, zetaOf };
}

// The lens: the nest's pose, slid from the last glass to the plate's centre
// as it lands, and swaying — with the screen shifted so that the plane d₀
// ahead holds still: on the landed plate the frame holds and the room drifts
// behind it by depth, the back wall most, the bed least.
function lensAt(geo, zeta, t, w, h) {
	const cam = geo.pose(zeta);
	const last = geo.levels[geo.L];
	const land = smooth(span(t, B.land[0], B.land[1]));
	cam.x -= last.s * last.glass.x * land;
	cam.y -= last.s * last.glass.y * land;
	const A = lerp(
		lerp(0, 0.05, span(t, B.flash, B.flash + 2)),
		0.3,
		smooth(span(t, B.land[0], B.land[1] + 0.5))
	);
	const ex = A * Math.sin(1.1 * t - 0.4);
	const ey = A * 0.45 * Math.sin(1.7 * t + 0.6);
	cam.x += cam.s * ex;
	cam.y += cam.s * ey;
	cam.ox = w / 2 + (geo.F * ex) / geo.d0;
	cam.oy = h / 2 - (geo.F * ey) / geo.d0;
	cam.land = land;
	return cam;
}

// ── The fall, drawn ──────────────────────────────────────────────────────────
// Every layer is a plane parallel to the lens, so its picture is the drawing
// under one similarity (m px to the plate unit, its origin on screen); a
// level is its plate's frame, the board inside it with a hole where the glass
// is (the lattice shows through, and the next level hangs in it), its back
// layers, the next level in the glass, then the monitor, desk and bed over
// that. The rooms are chalk; only the last floods with colour as the lens
// lands. Every glass the lens has passed is dropped.
function fall(ctx, b, geo, art, cam, t, fl) {
	const { w, h } = b;
	const { F, L, levels } = geo;
	const project = (x, y, z) => {
		const d = cam.z - z;
		return [cam.ox + (F * (x - cam.x)) / d, cam.oy - (F * (y - cam.y)) / d, d];
	};
	const plane = (lv, z) => {
		const wz = lv.O[2] + lv.s * z;
		const dw = cam.z - wz;
		if (dw <= NEARZ * cam.s) return null;
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
		if (b.dust) {
			ctx.fillStyle = b.dust;
			ctx.fillRect(X[0], X[1], X[2] - X[0], X[3] - X[1]);
		}
	};

	// How far a room is coloured in: only the last, as the lens lands — the
	// bed first and the wall last.
	const colour = span(t, B.colour[0], B.colour[1]);
	const paintOf = (k, depth) => {
		if (k !== L) return 0;
		const from = depth * 0.55;
		return smooth(span(colour, from, from + 0.45));
	};

	// One layer: its chalk copy, with the colour under it as it floods; the
	// wall mirror-tiled so the lens off its axis never sees past its edge.
	const layer = (lv, key, k, box) => {
		const l = lv.lay[key];
		const a = art[lv.decade]?.[key];
		if (!l || !a) return;
		const T = plane(lv, l.z);
		if (!T) return;
		const p = paintOf(k, l.depth);
		const tiles = key === 'bg' ? 1 : 0;
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
				if (p > 0.002) drawImageAt(ctx, a.mips, px, py, sw, sh, { alpha: p, flipX });
				if (a.chalk && p < 0.998)
					drawImageAt(ctx, a.chalk, px, py, sw, sh, { alpha: 0.95 * (1 - p), flipX });
				ctx.restore();
			}
		// The layer's own rectangle, dashed in: the drawing's construction.
		if (p < 1 && key !== 'bg' && l.w * T.m > 14) {
			stroke(ctx, corners(boxOf(T, l.x, l.y, l.w, l.h)), {
				color: PAL.chalk,
				width: 0.9,
				alpha: 0.32 * (1 - p),
				dash: [4, 5]
			});
		}
	};

	const glassAt = [];
	const lit = smooth(span(t, B.land[0] + 0.6, B.land[1] + 0.3));

	const drawLevel = (k, box) => {
		const lv = levels[k];
		const T0 = plane(lv, 0);
		const frame = T0 ? meet(box, boxOf(T0, 0, 0, PLATE.W, PLATE.H)) : box;
		if (empty(frame)) return;
		const Tg = lv.glass ? plane(lv, lv.glass.z) : null;
		const G = Tg ? boxOf(Tg, lv.glass.x, lv.glass.y, lv.glass.w, lv.glass.h) : null;
		const gb = G ? meet(frame, G) : null;
		const hole = gb && !empty(gb);
		if (hole) glassAt[k] = { box: gb, z: lv.O[2] + lv.s * lv.glass.z };
		ctx.save();
		clipBox(frame);
		// The board inside the frame — but not in the glass, where the tunnel
		// shows through — and the back layers on it.
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
		if (cam.z <= lv.O[2] + lv.s * lv.glass.z + NEARZ * cam.s) base = k + 1;
		else break;
	}
	drawLevel(base, [0, 0, w, h]);
	swimmer(ctx, geo, cam, project, t, glassAt, base, fl);
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
function swimmer(ctx, geo, cam, project, t, glassAt, base, fl) {
	const v = span(t, B.swim[0], B.swim[1]);
	if (v <= 0 || v >= 1) return;
	const body = smooth(span(v, 0, 0.2));
	const alpha = 1 - smooth(span(v, 0.74, 1));
	const place = (tt) => {
		const vv = span(tt, B.swim[0], B.swim[1]);
		const z = fl.at(tt).zeta;
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
