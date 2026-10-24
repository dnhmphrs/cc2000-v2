// ── log-intro · dial — odometer wheels for the date, a rotary knob ───────────
// MECHANICAL: precise, physical, quiet. The title is the terminal's (log-dawn
// makeTerminal, no command), typed, and FROZEN the moment its full stop lands
// — no zoom. The terminal carries on below it, as a terminal does: the column
// scrolls up (a translate, never a scale), the caret drops to a new line and
// types the question in the same mono face at the same pitch, and under it
// the instrument that takes the answer.
//
//   date   ODOMETER WHEELS — eight digit drums in three housings, DD MM YYYY,
//          drawn in chalk as cylinders seen edge-on: the digits on each drum
//          bunch and dim toward its top and bottom (y = R sin θ, squashed by
//          cos θ), the slats between them slide with it, and only the band in
//          the housing's window reads full. A drum has eleven faces, the ten
//          digits and a BLANK before the 0 marked with a dash: they spin up a
//          turn into place parked on the blank (the mask, – – · – – · – – – –),
//          and each digit typed rolls its drum forward to it, with a small
//          clunk past and back (Backspace rolls it back to the blank). The
//          next drum's window is lit as the caret; with all eight in, the
//          terminal's block caret waits after the register for Enter. A date
//          that is not one (a day past 31, a month past 12, a year off
//          1900–2099) frames its group in rose. Enter: a gold line writes
//          along under the windows (the confirmation).
//   spice  a ROTARY KNOB with ten detents round it, 1 to 10 clockwise over
//          270°, the ticks lit up to the value, the knurling turning with it.
//          Grabbed (the body or the ring of ticks — a press on a number sets
//          it) and dragged ROUND by the pointer, by its angle about the knob;
//          ← → a detent, a digit (0 is 10). It sits a little at each detent
//          while dragged and clicks into the nearest one on release. Enter: a
//          gold arc writes from 1 round to the value, a lit point at its head.
//
// Then the settle: the gold recedes, the caret drops to a new line and waits;
// the board goes to its ground and round again.
//
// Beats (seconds; the run is 20 s, `at` = t / 20): 0–4.94 the terminal types
// (at 0.25); 5.14 frozen; 5.39–6.09 the column scrolls up a little; 5.79 the
// date asked (q1, at 0.29); 6.5–7.9 the housings drawn, the drums spun up and
// parked; 7.89 the wait (wait1, at 0.39); 7.89–9.4 the scripted digits; 9.89
// Enter (e1, at 0.49); 10.39–11.19 the column scrolls on; 10.99 the spice
// asked (q2, at 0.55); 11.44–12.39 the knob drawn; 12.49 the wait (wait2, at
// 0.62); 12.79–14.1 the scripted drag; 14.49 Enter (e2, at 0.72); 15.4–18.4
// the settle and the waiting caret (at 0.77–0.92); 18.4–19.8 out.
//
// Every frame is a pure function of t and the hand — the scripted digits'
// arrival times are read off the demo's own hand once, at load. Live, two
// things the controller does not keep are remembered as the hand changes (a
// cache of inputs, not of frames): when each digit arrived, so its drum rolls
// from where it was, and when the knob was let go or stepped, so it settles
// into the detent rather than jumping there (the controller rounds at once).

import { PAL, TECH_FONT, TAU, stroke, span, smooth, lerp, clamp01 } from '../log/board.js';
import { lit } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';
import { script, HAND } from '../log/entry.js';

// ── The beats ────────────────────────────────────────────────────────────────
const TERM = makeTerminal(0.8, { cmd: false });
const STOP = TERM.stop; // the full stop lands (≈ 4.94 s)
const FREEZE = STOP + 0.2; // the frame the title is held at
const r2 = (x) => Math.round(x * 100) / 100;
const Q1 = r2(FREEZE + 0.65);
const W1 = r2(Q1 + 2.1);
const E1 = r2(W1 + 2.0);
const Q2 = r2(E1 + 1.1);
const W2 = r2(Q2 + 1.5);
const E2 = r2(W2 + 2.0);
const SECONDS = 20;

const B = {
	caret0: FREEZE + 0.25, // the caret drops to the question's line
	scroll1: [FREEZE + 0.25, FREEZE + 0.95],
	dim: [Q1 - 0.2, Q1 + 0.6], // the title steps back
	frame1: [Q1 + 0.7, Q1 + 1.35], // the housings drawn
	spin: Q1 + 0.8, // the first drum spun up; the rest 0.06 s apart, 0.85 s each
	scroll2: [E1 + 0.5, E1 + 1.3],
	dateDim: [Q2, Q2 + 0.6],
	knob: [Q2 + 0.45, Q2 + 1.4],
	caret2: E2 + 1.0, // the new line, after the answers
	out: [SECONDS - 1.6, SECONDS - 0.2]
};

export const meta = {
	title: 'dial — odometer wheels for the date, a rotary knob for the spice',
	order: 8,
	seconds: SECONDS,
	beats: { q1: Q1, wait1: W1, e1: E1, q2: Q2, wait2: W2, e2: E2 }
};

// The demo's hand, as the controller scripts it, for the digits' arrival
// times (the controller passes only how many are typed).
const SB = { q1: Q1, type1: W1, e1: E1, q2: Q2, drag2: W2 + 0.3, e2: E2 };
const KEYT = (() => {
	const out = [];
	for (let i = 0; i <= 3000 && out.length < 8; i++) {
		const t = W1 + i * 0.001;
		const n = script(t, SB).typed.length;
		while (out.length < n) out.push(t);
	}
	while (out.length < 8) out.push(Infinity);
	return out;
})();
const RELEASE = SB.drag2 + HAND.drag + HAND.release; // the scripted hand lets go

// The questions, typed on the terminal's own hand: a table of times.
const Q1_TEXT = 'when were you born?';
const Q2_TEXT = 'how spicy?';
function keys(text, seed) {
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = 0.12;
	return [...text].map((ch, i) => {
		t += 0.032 * (0.55 + 0.9 * rnd()) + (i > 0 && text[i - 1] === ' ' ? 0.03 : 0);
		return t;
	});
}
const K1 = keys(Q1_TEXT, 7001);
const K2 = keys(Q2_TEXT, 7013);
const typedBy = (K, x) => {
	let n = 0;
	while (n < K.length && K[n] <= x) n++;
	return n;
};

// The terminal's caret: blinks 2.3 a second, on 58% of each.
const blinkOn = (secs, steady) => steady || (((secs * 2.3) % 1) + 1) % 1 < 0.58;
const TECHF = (s) => `400 ${s}px ${TECH_FONT}`;
const easeIO = (x) => {
	const t = clamp01(x);
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);

// ── The drums ────────────────────────────────────────────────────────────────
const NF = 11; // ten digits and a blank face, before the 0
const PARK = -1; // the blank in the window: the mask
const GROUPS = [2, 2, 4];
const FACE = TAU / NF; // a face's turn of the drum
// A roll from `from` to `to` (in digits) at x of the way: an ease out, and a
// small clunk past the digit and back at the end.
const rollDur = (d) => 0.2 + 0.05 * Math.abs(d);
function roll(from, to, x) {
	const d = to - from;
	if (x >= 1) return to;
	const over =
		0.11 * Math.min(1, Math.abs(d)) * Math.sign(d) * Math.sin(Math.PI * span(x, 0.55, 1));
	return from + d * easeOut(x) + over;
}

// ── The knob ─────────────────────────────────────────────────────────────────
const DEG = Math.PI / 180;
const ANG = (v) => (-135 + (v - 1) * 30) * DEG; // clockwise from 12 o'clock
const valueAt = (phi) => Math.max(1, Math.min(10, 1 + (phi / DEG + 135) / 30));
// The detents, felt: the knob sits a little at each stop while it is turned.
function detent(v) {
	const n = Math.round(v);
	const x = v - n;
	return n + 0.5 * Math.sign(x) * Math.pow(Math.abs(2 * x), 1.5);
}

export async function make({ board, answers, live }) {
	await document.fonts.load(TECHF(24)).catch(() => null);

	// ── Layout, cached per board size ────────────────────────────────────────
	let G = null;
	function geom(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const L = TERM.layout(ctx, w, h);
		const { fs, step, cell } = L;
		const x0 = L.out[0].x0;
		const y0 = L.out[0].y;
		ctx.save();
		// The drums' digits, a size up from the terminal's type.
		const fsD = Math.max(18, 1.6 * fs);
		ctx.font = TECHF(fsD);
		const m = ctx.measureText('0');
		const adv = m.width;
		const dh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
		const mid = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
		const fsL = Math.max(10, 0.7 * fs);
		ctx.font = TECHF(fsL);
		const mL = ctx.measureText('0');
		const midL = (mL.actualBoundingBoxAscent - mL.actualBoundingBoxDescent) / 2;
		ctx.restore();
		// A drum: the faces 1.3 digit-heights apart at the front, so R sin 36°
		// is that; the window shows the one face; the drum is seen to 62°.
		const Rw = (1.3 * dh) / Math.sin(FACE);
		const wh = 0.7 * dh;
		const E = Rw * Math.sin(62 * DEG);
		const ww = 1.55 * adv;
		const gi = 0.2 * adv;
		const gg = 1.15 * adv;
		const padX = 0.16 * adv;
		const padY = 0.12 * dh;
		// The register, its housings' left edge on the terminal's margin.
		const wheels = [];
		const groups = [];
		let x = x0 + padX;
		let i = 0;
		for (const n of GROUPS) {
			const g = { i0: i, i1: i + n - 1, x0: x - padX };
			for (let k = 0; k < n; k++, i++) {
				wheels.push(x + ww / 2);
				x += ww + (k < n - 1 ? gi : 0);
			}
			g.x1 = x + padX;
			groups.push(g);
			x += gg;
		}
		const right = groups[2].x1;
		const yQ1 = y0 + 4 * step;
		const cyD = yQ1 + 0.5 * step + E;
		const yQ2 = cyD + E + 1.5 * step;
		// The knob: its body, the ring of ticks, the numbers round it.
		const Rk = Math.max(30, 1.15 * step);
		const r1 = Rk + Math.max(6, 0.2 * step);
		const r2t = Rk + Math.max(14, 0.42 * step);
		const rl = Rk + Math.max(26, 0.85 * step);
		const kx = x0 + rl + 0.55 * fsL;
		const ky = yQ2 + 0.55 * step + rl + 0.45 * fsL;
		const bottom = ky + rl * Math.cos(45 * DEG) + 0.6 * fsL;
		const yC = bottom + 1.2 * step;
		// The scrolls: the title and the date centred, then all of it.
		const top = y0 - fs;
		const fit = (lo, hi) => {
			const H = hi - lo;
			if (H < 0.9 * h) return Math.max(0, (lo + hi) / 2 - h / 2);
			return Math.max(0, hi - 0.95 * h);
		};
		const sB = fit(top, cyD + E);
		const sC = Math.max(sB, fit(top, yC + 0.3 * step));
		G = {
			w,
			h,
			L,
			fs,
			step,
			cell,
			x0,
			y0,
			fsD,
			adv,
			dh,
			mid,
			fsL,
			midL,
			Rw,
			wh,
			E,
			ww,
			padX,
			padY,
			wheels,
			groups,
			right,
			yQ1,
			cyD,
			yQ2,
			Rk,
			r1,
			r2t,
			rl,
			kx,
			ky,
			yC,
			sB,
			sC
		};
		return G;
	}

	// The frozen title, drawn once per board.
	let frozen = null;
	function frozenFrame(w, h) {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		TERM.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	// ── Live: what the hand did, remembered as it changes ────────────────────
	const mem = Array.from({ length: 8 }, () => ({ to: PARK, from: PARK, at: -99 }));
	const memPos = (m, secs) => roll(m.from, m.to, span(secs - m.at, 0, rollDur(m.to - m.from)));
	// A drum's place (in digits) and how lit it is, from the hand.
	function drum(i, t, hand) {
		const ch = hand.typed[i];
		const d = ch === undefined ? null : Number(ch);
		if (!live) {
			const kt = KEYT[i];
			if (d === null || t < kt) return { p: PARK, on: 0 };
			const D = rollDur(d - PARK);
			return { p: roll(PARK, d, span(t - kt, 0, D)), on: smooth(span(t - kt, 0, 0.7 * D)) };
		}
		const m = mem[i];
		const target = d === null ? PARK : d;
		if (target !== m.to) {
			m.from = memPos(m, hand.secs);
			m.to = target;
			m.at = hand.secs;
		}
		const D = rollDur(m.to - m.from);
		const x = span(hand.secs - m.at, 0, 0.7 * D);
		return { p: memPos(m, hand.secs), on: d === null ? 1 - smooth(x) : smooth(x) };
	}

	const knob = { from: 1, to: 1, at: -99, held: 0, rel: -99 };
	const knobNow = (secs) => lerp(knob.from, knob.to, easeOut(span(secs - knob.at, 0, 0.16)));
	// The knob's value as shown: the hand's own while held; settling into the
	// detent over 0.16 s when let go or stepped.
	function shown(hand) {
		if (!live) return hand.value;
		const secs = hand.secs;
		if (hand.held) {
			knob.from = knob.to = hand.value;
			knob.at = -99;
			knob.held = 1;
			return hand.value;
		}
		if (knob.held) {
			knob.held = 0;
			knob.rel = secs;
		}
		if (hand.value !== knob.to) {
			knob.from = knobNow(secs);
			knob.to = hand.value;
			knob.at = secs;
			knob.rel = secs;
		}
		return knobNow(secs);
	}

	// ── The pointer on the knob ──────────────────────────────────────────────
	let K = null; // this frame's knob, on screen
	let value = 1; // the hand's value, last frame
	const grab = { v: 1, ang: 0 };
	answers.slider((X, Y, phase) => {
		if (!K || K.a < 0.5) return null;
		const dx = X - K.x;
		const dy = Y - K.y;
		const r = Math.hypot(dx, dy);
		const phi = Math.atan2(dx, -dy);
		if (phase === 'down') {
			if (r > K.rl + 0.8 * K.fsL) return null;
			// The body is turned from where it is; a press on the ring of ticks
			// or a number sets the value there.
			grab.v = r <= K.Rk * 1.12 ? value : valueAt(phi);
			grab.ang = phi;
			return grab.v;
		}
		if (r < 0.15 * K.Rk) return grab.v;
		let d = phi - grab.ang;
		d -= TAU * Math.round(d / TAU);
		grab.ang = phi;
		grab.v = Math.max(1, Math.min(10, grab.v + d / (30 * DEG)));
		return grab.v;
	});
	// The hand over the knob, for the cursor.
	let hover = null;
	let cursor = '';
	if (live)
		window.addEventListener('pointermove', (e) => {
			hover = [e.clientX, e.clientY];
		});
	function setCursor(c) {
		if (c === cursor) return;
		cursor = c;
		document.documentElement.style.cursor = c;
	}

	// ── Drawing ──────────────────────────────────────────────────────────────
	function text(ctx, str, x, y, size, alpha, color = PAL.chalk) {
		if (!str || alpha <= 0.004) return;
		ctx.save();
		ctx.font = TECHF(size);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.textBaseline = 'alphabetic';
		ctx.fillText(str, x, y);
		ctx.restore();
	}
	function block(ctx, g, x, y, alpha) {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.globalAlpha = 0.9 * alpha;
		ctx.fillStyle = PAL.chalk;
		ctx.fillRect(x, y - 0.78 * g.fs, g.cell, 0.92 * g.fs);
		ctx.restore();
	}
	// A question typed at (x0, y) by the table K from t0, and its caret.
	function ask(ctx, g, str, Ktab, t0, t, y, alpha, caret, secs) {
		const n = t >= t0 ? typedBy(Ktab, t - t0) : 0;
		text(ctx, str.slice(0, n), g.x0, y, g.fs, 0.92 * alpha);
		if (caret) {
			const last = n > 0 ? t0 + Ktab[n - 1] : -9;
			if (blinkOn(secs, t - last < 0.16 && n < str.length)) {
				ctx.save();
				ctx.font = TECHF(g.fs);
				const xw = ctx.measureText(str.slice(0, n)).width;
				ctx.restore();
				block(ctx, g, g.x0 + xw, y, alpha);
			}
		}
	}

	// A rounded rectangle as a polyline from its top-left corner, clockwise,
	// so it can be written on.
	function rrect(x, y, W, H, r) {
		const pts = [];
		const c = [
			[x + W - r, y + r, -Math.PI / 2],
			[x + W - r, y + H - r, 0],
			[x + r, y + H - r, Math.PI / 2],
			[x + r, y + r, Math.PI]
		];
		pts.push([x + r, y]);
		for (const [cx, cy, a0] of c)
			for (let k = 0; k <= 4; k++) {
				const a = a0 + (k / 4) * (Math.PI / 2);
				pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
			}
		return pts;
	}

	// One drum, centred (cx, cy), turned to p, its window lit by `on`.
	function wheel(ctx, g, cx, cy, p, a, on) {
		if (a <= 0.004) return;
		const { ww, Rw, wh, E, fsD, mid } = g;
		const xl = cx - ww / 2;
		const faces = [];
		for (let d = 0; d < NF; d++) {
			let th = (d - p) * FACE;
			th -= TAU * Math.round(th / TAU);
			if (Math.abs(th) < Math.PI / 2) faces.push([d, th]);
		}
		const glyph = (d, th, alpha) => {
			const c = Math.cos(th);
			if (alpha * c <= 0.004) return;
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.translate(cx, cy + Rw * Math.sin(th));
			ctx.scale(1, c);
			// The blank face carries a dash, the mask's mark.
			if (d === 10) ctx.fillRect(-0.28 * g.adv, -0.05 * g.dh, 0.56 * g.adv, 0.1 * g.dh);
			else ctx.fillText(String(d), 0, mid);
			ctx.restore();
		};
		ctx.save();
		ctx.font = TECHF(fsD);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = PAL.chalk;
		ctx.strokeStyle = PAL.chalk;
		// The drum seen past the window: the faces bunching and dimming toward
		// its top and bottom, the slats between them turning with it.
		ctx.save();
		ctx.beginPath();
		ctx.rect(xl - 1, cy - E, ww + 2, 2 * E);
		ctx.rect(xl - 1, cy - wh, ww + 2, 2 * wh);
		ctx.clip('evenodd');
		for (const [d, th] of faces) glyph(d, th, a * lerp(0.12, 0.2, on) * Math.cos(th) ** 2);
		ctx.lineWidth = 1;
		for (let k = 0; k < NF; k++) {
			let th = (k + 0.5 - p) * FACE;
			th -= TAU * Math.round(th / TAU);
			if (Math.abs(th) >= Math.PI / 2) continue;
			const y = cy + Rw * Math.sin(th);
			ctx.globalAlpha = a * 0.16 * Math.cos(th) ** 2;
			ctx.beginPath();
			ctx.moveTo(xl + 2, y);
			ctx.lineTo(xl + ww - 2, y);
			ctx.stroke();
		}
		ctx.restore();
		// The drum's sides, edge-on: fading out where it turns away.
		const gr = ctx.createLinearGradient(0, cy - E, 0, cy + E);
		gr.addColorStop(0, 'rgba(236, 230, 218, 0)');
		gr.addColorStop(0.5, 'rgba(236, 230, 218, 0.22)');
		gr.addColorStop(1, 'rgba(236, 230, 218, 0)');
		ctx.save();
		ctx.globalAlpha = a;
		ctx.strokeStyle = gr;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(xl, cy - E);
		ctx.lineTo(xl, cy + E);
		ctx.moveTo(xl + ww, cy - E);
		ctx.lineTo(xl + ww, cy + E);
		ctx.stroke();
		ctx.restore();
		// The window: the face that reads.
		ctx.save();
		ctx.beginPath();
		ctx.rect(xl, cy - wh, ww, 2 * wh);
		ctx.clip();
		for (const [d, th] of faces) glyph(d, th, a * lerp(0.3, 0.95, on));
		ctx.restore();
		ctx.restore();
	}

	function date(ctx, g, t, hand, s, alpha) {
		if (t < B.frame1[0] || alpha <= 0.004) return;
		const cy = g.cyD - s;
		const { ww, wh, padY, groups, wheels } = g;
		const typed = hand.typed;
		// The housings' windows, written on; a bad group (a day past 31, a
		// month past 12, a year off the archive) in rose once all are in.
		const fr = smooth(span(t, ...B.frame1));
		const bad = [false, false, false];
		if (typed.length === 8 && !hand.valid) {
			const dd = Number(typed.slice(0, 2));
			const mm = Number(typed.slice(2, 4));
			const yy = Number(typed.slice(4));
			bad[0] = dd < 1 || dd > 31;
			bad[1] = mm < 1 || mm > 12;
			bad[2] = yy < 1900 || yy > 2099;
		}
		groups.forEach((gp, k) => {
			const pts = rrect(gp.x0, cy - wh - padY, gp.x1 - gp.x0, 2 * (wh + padY), 3);
			stroke(ctx, pts, {
				color: bad[k] ? PAL.rose : PAL.chalk,
				width: 1.2,
				alpha: alpha * (bad[k] ? 0.85 : 0.5),
				upto: fr
			});
		});
		// The axle: a centre line through the register, seen in the gaps.
		const ax = 0.42 * alpha * smooth(span(t, B.frame1[0] + 0.3, B.frame1[1] + 0.3));
		if (ax > 0.01) {
			const segs = [
				[groups[0].x0 - 1.2 * g.adv, groups[0].x0],
				[groups[0].x1, groups[1].x0],
				[groups[1].x1, groups[2].x0],
				[groups[2].x1, groups[2].x1 + 1.2 * g.adv]
			];
			for (const [a0, a1] of segs)
				stroke(
					ctx,
					[
						[a0, cy],
						[a1, cy]
					],
					{ width: 1, alpha: ax * 0.5, dash: [5, 2, 1, 2], cap: 'butt' }
				);
		}
		// The drums: spun up a turn into their parked place, one after another.
		const lift = smooth(span(t, Q2, Q2 + 0.6));
		for (let i = 0; i < 8; i++) {
			const a0 = B.spin + 0.06 * i;
			const show = smooth(span(t, a0 - 0.05, a0 + 0.3));
			if (show <= 0) continue;
			const { p, on } = drum(i, t, hand);
			const spin = -NF * (1 - easeOut(span(t, a0, a0 + 0.85)));
			wheel(ctx, g, wheels[i], cy, p + spin, alpha * show, lerp(on, on * 0.85, lift));
		}
		// The caret: the next drum's window lit, steady after a key, blinking
		// on the clock — or the terminal's block after the register once the
		// eight are in, waiting for Enter.
		const ready = t >= W1 - 0.25 || typed.length > 0;
		if (hand.caret > 0 && hand.enter1 <= 0 && ready && t >= B.frame1[1]) {
			const on = blinkOn(hand.secs, hand.steady > 0);
			if (typed.length < 8) {
				const cx = wheels[typed.length];
				ctx.save();
				ctx.globalAlpha = alpha * (on ? 0.1 : 0.035);
				ctx.fillStyle = PAL.chalk;
				ctx.fillRect(cx - ww / 2, cy - wh, ww, 2 * wh);
				ctx.restore();
				stroke(ctx, rrect(cx - ww / 2, cy - wh, ww, 2 * wh, 2), {
					width: 1.3,
					alpha: alpha * (on ? 0.8 : 0.25)
				});
			} else if (on) block(ctx, g, g.right + 0.9 * g.cell, cy + 0.4 * g.fs, alpha);
		}
		// Enter: the gold writes along under the windows, a lit point at its
		// head; then it settles to a quiet line.
		if (hand.enter1 > 0) {
			const y = cy + wh + padY + 4;
			const a = alpha * lerp(0.85, 0.5, smooth(span(t, E1 + 0.5, E1 + 2)));
			stroke(
				ctx,
				[
					[groups[0].x0, y],
					[groups[2].x1, y]
				],
				{ color: PAL.gold, width: 1.5, alpha: a, upto: hand.enter1, glow: 4 }
			);
			if (hand.enter1 < 1) {
				const hx = lerp(groups[0].x0, groups[2].x1, hand.enter1);
				lit(ctx, hx, y, 2.2, alpha * Math.sin(Math.PI * hand.enter1));
			}
		}
	}

	function spice(ctx, g, t, hand, s, alpha) {
		const kA = span(t, ...B.knob);
		K = null;
		if (kA <= 0 || alpha <= 0.004) return;
		const kx = g.kx;
		const ky = g.ky - s;
		const { Rk, r1, r2t, rl, fsL, midL } = g;
		const at = (r, th) => [kx + r * Math.sin(th), ky - r * Math.cos(th)];
		const clock = live ? hand.secs : t;
		const v = shown(hand);
		const dv = detent(v);
		const th = ANG(dv);
		const near = Math.round(v);
		const held = hand.held > 0;
		const confirm = hand.enter2;
		// The click: the stop it lands in stands up for a moment.
		const rel = live ? knob.rel : RELEASE;
		const click =
			clock >= rel
				? Math.exp(-Math.max(0, clock - rel - 0.12) / 0.14) * smooth(span(clock - rel, 0.06, 0.14))
				: 0;

		// The body: written round, the knurling turning with it, the cap.
		const body = smooth(span(kA, 0, 0.45));
		const circle = (r, a0 = 0, a1 = TAU, n = 96) => {
			const pts = [];
			for (let k = 0; k <= n; k++) pts.push(at(r, a0 + ((a1 - a0) * k) / n));
			return pts;
		};
		stroke(ctx, circle(Rk, ANG(1), ANG(1) + TAU), {
			width: 1.3,
			alpha: alpha * (held ? 0.75 : 0.55),
			upto: body
		});
		stroke(ctx, circle(0.78 * Rk), { width: 1, alpha: alpha * 0.18 * body });
		const kn = alpha * 0.2 * smooth(span(kA, 0.3, 0.7));
		if (kn > 0.005) {
			ctx.save();
			ctx.globalAlpha = kn;
			ctx.strokeStyle = PAL.chalk;
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (let k = 0; k < 40; k++) {
				const a = th + (k * TAU) / 40;
				const [ax, ay] = at(0.85 * Rk, a);
				const [bx, by] = at(0.96 * Rk, a);
				ctx.moveTo(ax, ay);
				ctx.lineTo(bx, by);
			}
			ctx.stroke();
			ctx.restore();
		}
		// The pointer of the knob: a line from near the middle to the cap.
		const ind = smooth(span(kA, 0.55, 0.85));
		stroke(ctx, [at(0.2 * Rk, th), at(0.72 * Rk, th)], {
			width: 2,
			alpha: alpha * 0.92 * ind
		});

		// The detents: ten ticks, lit up to the value; numbers round them.
		for (let k = 1; k <= 10; k++) {
			const tk = smooth(span(kA, 0.25 + 0.04 * k, 0.45 + 0.04 * k));
			if (tk <= 0) continue;
			const lv = clamp01(dv - k + 1);
			const here = k === near;
			const up = here ? (held ? 0.35 : 0) + 0.5 * click : 0;
			const a = ANG(k);
			stroke(ctx, [at(r1, a), at(r2t + up * (r2t - r1), a)], {
				width: lerp(1.1, 1.7, lv),
				alpha: alpha * tk * lerp(0.24, 0.85, lv)
			});
			const [lx, ly] = at(rl, a);
			ctx.save();
			ctx.font = TECHF(fsL);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillStyle = PAL.chalk;
			ctx.globalAlpha = alpha * tk * (here ? 0.95 : 0.32);
			ctx.fillText(String(k), lx, ly + midL);
			ctx.restore();
		}

		// Enter: the gold arc from 1 round to the value, written on; a lit
		// point at its head; then a quiet gold.
		if (confirm > 0) {
			const end = ANG(Math.round(hand.value));
			const ra = Rk + 0.5 * (r1 - Rk);
			const pts = circle(ra, ANG(1), end, Math.max(2, Math.round(48 * ((end - ANG(1)) / TAU)) + 2));
			const a = alpha * lerp(0.9, 0.55, smooth(span(t, E2 + 0.5, E2 + 2)));
			if (end > ANG(1) + 1e-3)
				stroke(ctx, pts, { color: PAL.gold, width: 1.7, alpha: a, upto: confirm, glow: 4 });
			const head = lerp(ANG(1), end, confirm);
			const [hx, hy] = at(ra, head);
			lit(
				ctx,
				hx,
				hy,
				2.2,
				alpha * (confirm < 1 ? 1 : lerp(0.8, 0.45, smooth(span(t, E2 + 0.5, E2 + 2))))
			);
		}

		K = { x: kx, y: ky, Rk, rl, fsL, a: alpha * kA };
	}

	return {
		render(ctx, w, h, t, hand) {
			const g = geom(ctx, w, h);
			const out = 1 - smooth(span(t, ...B.out));
			const s =
				g.sB * easeIO(span(t, ...B.scroll1)) + (g.sC - g.sB) * easeIO(span(t, ...B.scroll2));
			value = hand.value;

			// The title: typed, then held at its stop — and stepped back.
			if (t < FREEZE) TERM.draw(ctx, w, h, t / 10, t, t - 10);
			else {
				const a = out * lerp(1, 0.5, smooth(span(t, ...B.dim)));
				ctx.save();
				ctx.globalAlpha = a;
				ctx.drawImage(frozenFrame(w, h), 0, -s, w, h);
				ctx.restore();
			}
			if (t < B.caret0 || out <= 0.004) {
				K = null;
				return;
			}

			// The date: its question typed on a new line, then the drums.
			const qa = out * lerp(1, 0.55, smooth(span(t, E1 + 0.3, E1 + 1)));
			const caret1 = t < W1 - 0.25 && hand.typed.length === 0 && hand.enter1 <= 0;
			ask(ctx, g, Q1_TEXT, K1, Q1, t, g.yQ1 - s, qa, caret1, live ? hand.secs : t);
			date(ctx, g, t, hand, s, out * lerp(1, 0.62, smooth(span(t, ...B.dateDim))));

			// The spice: its question, then the knob.
			if (t >= Q2 - 0.25) {
				const caret2 = t < B.knob[1] && hand.enter2 <= 0;
				ask(ctx, g, Q2_TEXT, K2, Q2, t, g.yQ2 - s, out, caret2, live ? hand.secs : t);
			}
			spice(ctx, g, t, hand, s, out);

			// The settle: the caret on a new line, waiting.
			if (t >= B.caret2 && blinkOn(live ? hand.secs : t, false))
				block(ctx, g, g.x0, g.yC - s, out * smooth(span(t, B.caret2, B.caret2 + 0.1)));

			// The hand over the knob.
			if (live) {
				let c = '';
				if (K && hand.asking === 'spice') {
					if (hand.held) c = 'grabbing';
					else if (hover && Math.hypot(hover[0] - K.x, hover[1] - K.y) <= K.rl + 0.8 * K.fsL)
						c = 'grab';
				}
				setCursor(c);
				// For a scripted hand checking the knob (the lab copies info
				// once, so this is written onto it each frame).
				if (window.__lab) window.__lab.dial = { knob: K, value: hand.value, held: hand.held, t };
			}
		},
		resize() {
			G = null;
			frozen = null;
		}
	};
}
