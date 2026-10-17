import {
	getBoard,
	clearBoard,
	makeView,
	disc,
	PAL,
	TAU,
	PHI,
	GOLDEN_ANGLE,
	span,
	smooth,
	lerp,
	easeInOutCubic,
	clock,
	tag
} from './log/board.js';
import { drawOrb, impact } from './log/ink.js';
import { makeTerminal, ORB_R } from './log-dawn.js';
import { drawPrompt, BIRTH, SPICE } from './log-orb.js';
import { DECADES, loadRooms } from './log/rooms.js';
import { makeFall, orderOf } from './log/fall.js';

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
// The fall is the kit's (log/fall.js makeFall — the nest of plates, the lens,
// the swimmer, the landing, the flood, the held room), handed this flow's
// lattice as its background and this flow's zoom, so the plates and the
// lattice stay one zoom. `?colour=along` is a look at the kit's other
// colouring — each room deeper carrying more colour, the answer's in full —
// off here: this flow's colour floods at the landing.
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

export default async function make({ at }) {
	const q = new URLSearchParams(location.search);
	const decade = DECADES.includes(q.get('decade')) ? q.get('decade') : '90s';
	const colourAlong = q.get('colour') === 'along';
	const b = getBoard();
	const time = clock(SECONDS, at);
	const term = makeTerminal(0.8, { cmd: false });
	clearBoard(b);
	tag(b.ctx, b.w, b.h, 'flow-chalk · loading the rooms');
	const t0 = performance.now();
	const art = await loadRooms({ chalk: true });
	const order = orderOf(decade);
	const fall = makeFall({
		art,
		order,
		beats: { fall: B.fall, land: B.land, colour: B.colour, swim: B.swim }
	});
	const info = {
		seconds: SECONDS,
		decade,
		rooms: order,
		missing: art.missing,
		loadMs: Math.round(performance.now() - t0)
	};
	const Q1 = { ...BIRTH, key: '' };
	const Q2 = { ...SPICE, key: '' };

	let nest = null;
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
		if (!nest || nest.w !== w || nest.h !== h) {
			nest = fall.geometry(w, h);
			fl = makeFlight(nest);
			info.lambda = nest.levels.slice(0, nest.L).map((l) => Number((1 / l.X).toFixed(2)));
			info.efolds = Number(nest.TOTAL.toFixed(2));
		}
		const tau = fl.at(t);
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
			// The fall: the lens in the nest, the lattice at its vanishing point —
			// the kit's fall, this flow's lattice streaming under it at its zoom.
			const cam = fall.draw(ctx, w, h, t, {
				background: (ctx, cam, zoom, alpha) =>
					drawLattice(ctx, cam.ox, cam.oy, w, h, tau, 1, LAT.alpha * alpha),
				colourAlong,
				dust: b.dust
			});
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
// the fall starts at (the nest's rate0). The fall: the nest's own e-folds,
// at its pace, on top — so the rooms and the lattice are ONE zoom.
function makeFlight(nest) {
	const tauQ = (t) =>
		CREEP * (t - B.term) +
		LN_STEP *
			(easeInOutCubic(span(t, B.s1[0], B.s1[1])) + easeInOutCubic(span(t, B.s2[0], B.s2[1])));
	const p0 = tauQ(B.dive[0]);
	const Dd = B.dive[1] - B.dive[0];
	const p1 = p0 + DIVE;
	const at = (t) => {
		if (t <= B.dive[0]) return tauQ(t);
		if (t < B.dive[1]) {
			const s = (t - B.dive[0]) / Dd;
			const s2 = s * s;
			const s3 = s2 * s;
			return (
				(2 * s3 - 3 * s2 + 1) * p0 +
				(s3 - 2 * s2 + s) * CREEP * Dd +
				(-2 * s3 + 3 * s2) * p1 +
				(s3 - s2) * nest.rate0 * Dd
			);
		}
		return p1 + nest.efolds(t);
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
