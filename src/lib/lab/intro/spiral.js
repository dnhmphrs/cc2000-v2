// ── log-intro · spiral — time as a log spiral round the full stop ───────────
// The terminal types the card (log-dawn's, no command) and its full stop
// lands and STAYS where it is — no zoom: it softens into a small dim light,
// the sentence goes, and out of the light time unwinds as a logarithmic
// spiral in faint chalk, log-orb's calendar turned round so that its pole is
// NOW, the moment the sentence ends: a date t sits at z ∝ (now − t)^{½ + 2πi},
// r = √(years ago) and a turn for every factor e further back, so the last
// year winds round the light many times and a century is one easy turn out
// at the edge; time running forward runs clockwise, in toward the light.
// Every year is a faint tick across it and the decades are numbered.
//
// The questions are typed top left in the terminal's face, as its
// transcript. The date goes into a masked DD · MM · YYYY with the terminal's
// block caret, and a marker on the spiral runs along the curve to THE DATE
// SO FAR — the most recent date, on or before now, that what is typed could
// still be — with a year readout beside it. The day and the month barely
// stir it out of the light (every year has them: the last 14th, the last
// 14 · 02); the year's first digit flings it turns out into the past and its
// last digits refine it: the spiral reads you. Each key rings the marker
// once; the spiral from the marker in to the light (your time) is a shade
// brighter, and the year ticks light as the marker passes them. A date that
// cannot be (a 40th, a month 13, a day still to come) leaves the marker
// where it was, hollow. Enter fixes it: the point turns gold, a gold line
// writes from it along the spiral into the light, and the date is written
// beside it.
//
// The spice: the spiral's inner turns go dark and the innermost turn left
// visible is a dial — 0.9 of a turn with ten stops on it, 1 at the top and
// 10 deepest (clockwise, inward, toward the light) — and a bead rides it.
// Drag it round (by its angle round the light, so a drag anywhere round the
// pole turns it, held at the ends rather than wrapping), or ← →, a digit;
// it snaps to the nearest stop on release. Enter: gold from stop 1 to the
// bead. The close: the bead and the birthday's point slide on along the
// spiral into the light — faster and smaller, as everything on a log spiral
// does at its pole — and the light warms to gold and rings once; the board
// fades, and it loops.
//
// Every frame is a function of t and the hand: the marker's run is a sum of
// eased steps, one per keystroke, at the keystroke's time — the script's,
// found once by sampling its hand, or, live, the real second each key came
// (a cache of when the typed digits changed). "Now" is today when a person
// is answering, and fixed (21 · 10 · 2026) otherwise, so a pinned frame is
// the same frame on any day.

import { PAL, TAU, TECH_FONT, stroke, disc, span, smooth, lerp, clamp01 } from '../log/board.js';
import { glow } from '../log/ink.js';
import { makeTerminal } from '../log-dawn.js';
import { DATE_Q, SPICE_Q } from '../log/entry.js';

const BEATS = { q1: 7.4, wait1: 8.4, e1: 10.7, q2: 11.9, wait2: 12.9, e2: 15.1 };
const SECONDS = 20.5;

export const meta = {
	title:
		'time as a log spiral round the full stop: the date read along it, the spice a dial on its inner turn',
	order: 7,
	seconds: SECONDS,
	beats: BEATS
};

// The picture's beats, in seconds.
const T = {
	light: [5.2, 6.3], // the stop softens into the pole's light
	text: [5.35, 6.6], // the sentence goes
	write: [5.4, 7.9], // the spiral unwinds out of the light
	confirm: [BEATS.e1, BEATS.e1 + 0.9], // gold from the birthday into the light
	dial: [BEATS.e1 + 0.85, BEATS.e1 + 1.9], // the inner turns go, the dial comes up
	sinkD: [BEATS.e2 + 0.45, BEATS.e2 + 2.45], // the birthday slides into the light
	sinkS: [BEATS.e2 + 0.6, BEATS.e2 + 2.6], // and the bead
	warm: [BEATS.e2 + 2.1, BEATS.e2 + 2.9],
	ring: [BEATS.e2 + 2.35, BEATS.e2 + 3.6],
	out: [SECONDS - 1.4, SECONDS - 0.15]
};

// ── Time ─────────────────────────────────────────────────────────────────────
// Now: today when a person is answering; a fixed day otherwise, so a pinned
// frame is the same picture whenever it is shot (setNow, at make()).
const FIXED_NOW = [2026, 10, 21];
let NOW = FIXED_NOW;
const DAY = 86400000;
const yearLen = (Y) => (Date.UTC(Y + 1, 0, 1) - Date.UTC(Y, 0, 1)) / DAY;
const monthLen = (Y, M) => new Date(Date.UTC(Y, M, 0)).getUTCDate();
// A day, as a fractional year (its middle).
const frac = (Y, M, D) =>
	Y + ((Date.UTC(Y, M - 1, D) - Date.UTC(Y, 0, 1)) / DAY + 0.5) / yearLen(Y);
let NOW_T = frac(...NOW);
let AGO_END = NOW_T - 1900; // the spiral's outer end, in years ago
let L_END = Math.log(AGO_END);
const L_FLOOR = Math.log(0.25 / 365); // six hours ago: inside the light
const lnAgo = (tt) => Math.log(Math.max(NOW_T - tt, Math.exp(L_FLOOR)));

// The date so far: the most recent day on or before now that the digits
// typed (DDMMYYYY, a prefix) could still be, as a fractional year — or null
// if there is none. Eight digits are the date itself (its day held to its
// month's length).
const MEMO = new Map();
function setNow(live) {
	const d = new Date();
	NOW = live ? [d.getFullYear(), d.getMonth() + 1, d.getDate()] : FIXED_NOW;
	NOW_T = frac(...NOW);
	AGO_END = NOW_T - 1900;
	L_END = Math.log(AGO_END);
	MEMO.clear();
}
function dateOf(typed) {
	if (MEMO.has(typed)) return MEMO.get(typed);
	let out = null;
	if (typed.length >= 8) {
		const D = Number(typed.slice(0, 2));
		const M = Number(typed.slice(2, 4));
		const Y = Number(typed.slice(4, 8));
		if (M >= 1 && M <= 12 && D >= 1 && D <= 31 && Y >= 1900) {
			const tt = frac(Y, M, Math.min(D, monthLen(Y, M)));
			if (tt <= NOW_T) out = tt;
		}
	} else {
		const p = typed.padEnd(8, '?');
		const ok = (s, i) => p[i] === '?' || p[i] === s;
		const two = (n) => String(n).padStart(2, '0');
		search: for (let Y = NOW[0]; Y >= 1900; Y--) {
			const ys = String(Y);
			if (!ok(ys[0], 4) || !ok(ys[1], 5) || !ok(ys[2], 6) || !ok(ys[3], 7)) continue;
			for (let M = 12; M >= 1; M--) {
				const ms = two(M);
				if (!ok(ms[0], 2) || !ok(ms[1], 3)) continue;
				for (let D = monthLen(Y, M); D >= 1; D--) {
					const ds = two(D);
					if (!ok(ds[0], 0) || !ok(ds[1], 1)) continue;
					const tt = frac(Y, M, D);
					if (tt <= NOW_T) {
						out = tt;
						break search;
					}
				}
			}
		}
	}
	if (MEMO.size > 400) MEMO.clear();
	MEMO.set(typed, out);
	return out;
}

// The marker's place on the spiral, as log(years ago), at time `tau`: a sum
// of eased steps, one for each change of the typed digits at the moment it
// came — a long run for a long way, quick for a short one, each starting
// fast and settling. A digit that makes no date holds the marker (wrong).
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
function chain(ev, tau) {
	let L = L_FLOOR;
	let prev = L_FLOOR;
	let last = -Infinity;
	let wrong = false;
	for (const e of ev) {
		if (e.at > tau) break;
		const tt = dateOf(e.typed);
		wrong = tt === null;
		const tg = wrong ? prev : lnAgo(tt);
		const d = tg - prev;
		if (d !== 0) {
			const D = Math.min(1.15, 0.28 + 0.2 * Math.abs(d));
			L += d * easeOut((tau - e.at) / D);
			prev = tg;
		}
		last = e.at;
	}
	return { L, last, wrong };
}

// ── The dial ─────────────────────────────────────────────────────────────────
// The turn of the spiral the spice rides: from AGO_A years ago (stop 1, at
// the top) 0.9 of a turn in (stop 10). Its place in the picture's own units,
// so it is the same turn on every board.
const AGO_A = 10;
const L_A = Math.log(AGO_A);
const TRACK = 0.9; // turns
const L_B = L_A - TRACK;
const Lstop = (v) => L_A - (TRACK * (v - 1)) / 9;

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;
const GOLD = [245, 193, 80];

export async function make({ board, answers, live }) {
	setNow(live);
	try {
		await document.fonts.load(`400 24px ${TECH_FONT}`);
	} catch {
		// The board's fallbacks will do.
	}
	const term = makeTerminal(0.8, { cmd: false });
	const FREEZE = term.stop + 0.2;

	// The script's keystrokes, found once from its hand: when the typed digits
	// changed. Live, the same list is kept from the real seconds keys came.
	const scripted = [{ at: -1, typed: '' }];
	if (!live) {
		let prev = '';
		for (let t = BEATS.wait1 - 0.05; t <= BEATS.e1 + 0.01; t += 0.002) {
			const s = answers.hand(t).typed;
			if (s !== prev) {
				scripted.push({ at: t, typed: s });
				prev = s;
			}
		}
	}
	let liveEv = [{ at: -1, typed: '' }];
	let liveTyped = '';

	let G = null; // this board's geometry
	let frozen = null;

	function frozenFrame(w, h) {
		const dpr = board.dpr;
		if (frozen && frozen.w === w && frozen.h === h && frozen.dpr === dpr) return frozen.c;
		const c = document.createElement('canvas');
		c.width = Math.round(w * dpr);
		c.height = Math.round(h * dpr);
		const x = c.getContext('2d');
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		term.draw(x, w, h, FREEZE / 10, FREEZE, FREEZE - 10);
		frozen = { c, w, h, dpr };
		return c;
	}

	// ── The geometry, once per board ─────────────────────────────────────────
	function geometry(ctx, w, h) {
		if (G && G.w === w && G.h === h) return G;
		const Lt = term.layout(ctx, w, h);
		const cx = Lt.stop.x;
		const cy = Lt.stop.y;
		// As big as the board allows round the pole: the 1900 end (straight
		// down, as it happens) clear of the bottom edge.
		const R = Math.min(
			0.44 * h,
			0.95 * Math.min(cx, w - cx),
			(h - cy - Math.max(30, 0.05 * h)) / 0.98
		);
		const S = R / Math.sqrt(AGO_END); // px to √(year)
		const rOf = (L) => S * Math.exp(L / 2);
		const thOf = (L) => Math.PI / 2 + TAU * (L - L_A);
		const at = (L) => {
			const r = rOf(L);
			const th = thOf(L);
			return [cx + r * Math.cos(th), cy - r * Math.sin(th)];
		};
		const L_LO = 2 * Math.log(2 / S);
		// An arc of the spiral from L0 to L1 (either way), about 3 px a step.
		const arc = (L0, L1) => {
			const pts = [at(L0)];
			const dir = L1 >= L0 ? 1 : -1;
			let L = L0;
			while ((L1 - L) * dir > 1e-9) {
				const dL = Math.max(0.0015, Math.min(0.06, 3 / (TAU * rOf(L))));
				L = dir > 0 ? Math.min(L1, L + dL) : Math.max(L1, L - dL);
				pts.push(at(L));
			}
			return pts;
		};
		// The whole spiral, in chunks of a dozen points, each with its L and r.
		const chunks = [];
		{
			let L = L_LO;
			let cur = { pts: [at(L)], L0: L };
			while (L < L_END) {
				const dL = Math.max(0.0015, Math.min(0.06, 3 / (TAU * rOf(L))));
				L = Math.min(L_END, L + dL);
				cur.pts.push(at(L));
				if (cur.pts.length >= 12 || L >= L_END) {
					cur.L1 = L;
					cur.r = rOf((cur.L0 + L) / 2);
					chunks.push(cur);
					cur = { pts: [at(L)], L0: L };
				}
			}
		}
		// The years: a tick across the spiral at each new year, the decades
		// longer and numbered.
		const years = [];
		for (let Y = 1900; Y <= NOW[0]; Y++) {
			const L = Math.log(NOW_T - Y);
			const r = rOf(L);
			if (r < 16) continue;
			const th = thOf(L);
			years.push({
				Y,
				L,
				r,
				x: cx + r * Math.cos(th),
				y: cy - r * Math.sin(th),
				c: Math.cos(th),
				s: -Math.sin(th)
			});
		}
		// The transcript, top left, at the terminal's own margin.
		const fs = Lt.fs;
		const qs = Math.max(11, Math.round(0.7 * fs));
		const as = Math.max(12, Math.round(0.84 * fs));
		const x0 = Lt.out[0].x0;
		const y0 = Math.max(44, 0.1 * h);
		ctx.save();
		ctx.font = TECH(as);
		const cell = ctx.measureText('0').width;
		ctx.font = TECH(qs);
		const qcell = ctx.measureText('0').width;
		ctx.restore();
		G = {
			w,
			h,
			cx,
			cy,
			R,
			S,
			rOf,
			thOf,
			at,
			arc,
			L_LO,
			chunks,
			years,
			stop: Lt.stop,
			fs,
			qs,
			as,
			cell,
			qcell,
			x0,
			rows: [y0, y0 + 1.75 * as, y0 + 3.9 * as]
		};
		return G;
	}

	// ── The spice's pointer: by its angle round the light ────────────────────
	// The dial is 0.9 of a turn, so an angle is one place on it — or, in the
	// tenth of a turn between its ends, nearer one end or the other. A press
	// must be near the dial; a drag goes by angle wherever the pointer is,
	// ACCUMULATED from the press (each move's step taken the short way round),
	// so dragged on past an end it holds there however far the pointer goes,
	// and comes back off it as soon as the pointer turns back.
	let acc = 0;
	let sPrev = 0;
	function hit(X, Y, phase) {
		if (!G) return null;
		const dx = X - G.cx;
		const dy = G.cy - Y;
		let a = (Math.PI / 2 - Math.atan2(dy, dx)) / TAU; // clockwise from the top, turns
		a -= Math.floor(a);
		const full = 1 / TRACK; // a whole turn, in the dial's 0…1
		let s = a / TRACK;
		if (phase === 'down') {
			if (s > 1) s = s - 1 < full - s ? 1 : 0;
			const [px, py] = G.at(L_A - TRACK * s);
			const r = G.rOf(L_A - TRACK * s);
			if (Math.hypot(X - px, Y - py) > Math.max(16, Math.min(28, 0.3 * r))) return null;
			acc = sPrev = s;
			return 1 + 9 * s;
		}
		let d = s - sPrev;
		d -= full * Math.round(d / full);
		acc = Math.max(-0.25, Math.min(1.25, acc + d));
		sPrev = s;
		return 1 + 9 * clamp01(acc);
	}

	// ── Drawing ──────────────────────────────────────────────────────────────
	function text(ctx, str, x, y, size, color, alpha) {
		if (alpha <= 0.004 || !str) return;
		ctx.save();
		ctx.font = TECH(size);
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = color;
		ctx.globalAlpha = Math.min(1, alpha);
		ctx.fillText(str, x, y);
		ctx.restore();
	}
	const goldMix = (k) => {
		const c = [236, 230, 218].map((v, i) => Math.round(lerp(v, GOLD[i], k)));
		return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
	};

	// A small soft point of light: a glow and a disc.
	function point(ctx, x, y, r, a, color, halo) {
		if (a <= 0.004) return;
		glow(ctx, x, y, r * 5.5, halo, 0.34 * a);
		disc(ctx, x, y, r, { fill: color, alpha: a });
	}

	// A label beside a point of the spiral, pushed out along the radius and
	// aligned away from the pole.
	function beside(ctx, str, x, y, c, s, d, size, color, alpha) {
		if (alpha <= 0.004) return;
		ctx.save();
		ctx.font = TECH(size);
		ctx.textAlign = c > 0.35 ? 'left' : c < -0.35 ? 'right' : 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = color;
		ctx.globalAlpha = Math.min(1, alpha);
		ctx.fillText(str, x + c * d, y + s * d);
		ctx.restore();
	}

	function render(ctx, w, h, t, hand) {
		answers.slider(hit);
		if (t < FREEZE) {
			term.draw(ctx, w, h, t / 10, t, t - 10);
			return;
		}
		const g = geometry(ctx, w, h);
		const { cx, cy } = g;
		const secs = hand.secs;
		const out = 1 - smooth(span(t, ...T.out));

		// The marker's run: the script's keystrokes, or the real ones.
		let ev = scripted;
		let tau = t;
		if (live) {
			if (t < BEATS.q1) {
				liveEv = [{ at: -1, typed: '' }];
				liveTyped = '';
			} else if (hand.typed !== liveTyped) {
				liveTyped = hand.typed;
				liveEv.push({ at: secs, typed: liveTyped });
			}
			ev = liveEv;
			tau = secs;
		}
		const run = chain(ev, tau);
		const Lm = Math.max(run.L, g.L_LO);
		const wrong = run.wrong || (hand.typed.length === 8 && !hand.valid);

		// The phases.
		const write = smooth(span(t, ...T.write));
		// The front unwinds at a steady turn rate from where the light ends
		// (5 px) — the turns inside it are drawn from the start, under it.
		const Lw = lerp(2 * Math.log(5 / g.S), L_END + 0.02, write);
		const conf = smooth(span(t, ...T.confirm));
		const P = smooth(span(t, ...T.dial)); // the dial up, the inner turns gone
		const datePhase = hand.q1 > 0 && hand.enter1 <= 0;
		const sinkS = span(t, ...T.sinkS);
		const sinkD = span(t, ...T.sinkD);

		// The sentence, frozen at its stop, going.
		const textA = 1 - smooth(span(t, ...T.text));
		if (textA > 0.004) {
			ctx.save();
			ctx.globalAlpha = textA;
			ctx.drawImage(frozenFrame(w, h), 0, 0, w, h);
			ctx.restore();
		}

		// The spiral: faint chalk, fading into the light, written outward.
		const rB = g.rOf(L_B);
		const baseA = lerp(0.2, 0.1, P) * out;
		const life = datePhase ? 0.13 : 0.13 * (1 - conf);
		ctx.save();
		ctx.strokeStyle = PAL.chalk;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 1.1;
		for (const ch of g.chunks) {
			if (ch.L0 > Lw) break;
			let a =
				baseA *
				smooth(span(ch.r, 4, 34)) *
				(1 - P * (1 - smooth(span(ch.r, 0.78 * rB, 0.97 * rB))));
			// Your time: the stretch from the marker in, a shade brighter.
			if (ch.L1 <= Lm && t >= BEATS.q1) a += life * out * smooth(span(ch.r, 4, 34));
			// The tail fades out to 1900.
			a *= 1 - 0.7 * smooth(span(ch.L0, L_END - 0.25, L_END));
			if (a <= 0.004) continue;
			const pts =
				ch.L1 > Lw
					? ch.pts.slice(
							0,
							Math.max(2, Math.ceil((ch.pts.length * (Lw - ch.L0)) / (ch.L1 - ch.L0)))
						)
					: ch.pts;
			ctx.globalAlpha = Math.min(1, a);
			ctx.beginPath();
			ctx.moveTo(pts[0][0], pts[0][1]);
			for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
			ctx.stroke();
		}
		ctx.restore();

		// The years: ticks across it, the decades numbered; lit as the marker
		// passes; quieter once the dial is up.
		const yearsA = out * (1 - 0.7 * P);
		const ls = Math.max(9, Math.round(0.46 * g.fs));
		for (const y of g.years) {
			if (y.L > Lw) continue;
			const dec = y.Y % 10 === 0;
			const near = datePhase ? Math.exp(-(((y.L - Lm) / 0.05) ** 2)) : 0;
			const a = yearsA * ((dec ? 0.34 : 0.15) + 0.5 * near) * smooth(span(Lw - y.L, 0, 0.3));
			if (a <= 0.004) continue;
			const k = dec ? 5 : 2.6;
			stroke(
				ctx,
				[
					[y.x - y.c * k, y.y - y.s * k],
					[y.x + y.c * k, y.y + y.s * k]
				],
				{ color: PAL.chalk, width: dec ? 1.1 : 0.9, alpha: a, cap: 'butt' }
			);
			// The marker's readout (and after Enter the birthday) takes a decade
			// label's place as it passes, rather than printing over it.
			const clash = datePhase || hand.enter1 > 0 ? Math.exp(-(((y.L - Lm) / 0.07) ** 2)) : 0;
			if (dec && y.r > 44)
				beside(ctx, String(y.Y), y.x, y.y, y.c, y.s, 12, ls, PAL.chalk, a * 0.95 * (1 - clash));
		}

		// The pole: the full stop, softened into a small light, breathing; warm
		// to gold at the close, and a ring out of it once.
		const li = smooth(span(t, ...T.light));
		const warm = smooth(span(t, ...T.warm));
		const br = 1 + 0.08 * Math.sin((TAU * secs) / 3.6);
		disc(ctx, cx, cy, g.stop.r, { fill: PAL.chalk, alpha: 0.92 * (1 - li) });
		if (li > 0) {
			const core = [255, 240, 214].map((v, i) => Math.round(lerp(v, GOLD[i], 0.6 * warm)));
			glow(ctx, cx, cy, 34 * br * (1 + 0.25 * warm), core, (0.26 + 0.14 * warm) * li * out);
			glow(ctx, cx, cy, 9 * br, core, 0.45 * li * out);
			disc(ctx, cx, cy, lerp(g.stop.r, 1.9, li), {
				fill: warm > 0 ? goldMix(0.5 * warm) : '#fff6e8',
				alpha: 0.92 * out
			});
		}
		const ring = span(t, ...T.ring);
		if (ring > 0 && ring < 1) {
			const e = 1 - Math.pow(1 - ring, 3);
			ctx.save();
			ctx.globalAlpha = 0.3 * (1 - ring) * out;
			ctx.strokeStyle = PAL.gold;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(cx, cy, lerp(5, 0.62 * rB, e), 0, TAU);
			ctx.stroke();
			ctx.restore();
		}

		// ── The date's marker, and then the birthday ─────────────────────────
		const [mx, my] = g.at(Lm);
		const mr = g.rOf(Lm);
		const mc = (mx - cx) / Math.max(1, mr);
		const ms = (my - cy) / Math.max(1, mr);
		if (datePhase) {
			const show = smooth(span(hand.q1, 0.5, 1)) * out;
			const vis = smooth(span(mr, 3, 9));
			// The ring each key sends round it.
			const k = span(tau - run.last, 0, 0.45);
			if (k < 1 && run.last > 0) {
				ctx.save();
				ctx.globalAlpha = 0.4 * (1 - k) * show;
				ctx.strokeStyle = PAL.chalk;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(mx, my, 4 + 10 * easeOut(k), 0, TAU);
				ctx.stroke();
				ctx.restore();
			}
			if (wrong) {
				ctx.save();
				ctx.globalAlpha = 0.6 * show;
				ctx.strokeStyle = PAL.chalk;
				ctx.lineWidth = 1.1;
				ctx.beginPath();
				ctx.arc(mx, my, 3.2, 0, TAU);
				ctx.stroke();
				ctx.restore();
			} else point(ctx, mx, my, 2.4, 0.9 * show, PAL.chalk, [236, 230, 218]);
			// The year it has read so far.
			const yr = Math.floor(NOW_T - Math.exp(run.L) + 1e-9);
			beside(
				ctx,
				String(yr),
				mx,
				my,
				mc,
				ms,
				13,
				Math.max(10, Math.round(0.5 * g.fs)),
				PAL.chalk,
				0.55 * show * vis
			);
		} else if (hand.enter1 > 0) {
			// Fixed: gold, a gold line from it along the spiral into the light,
			// the date beside it — and, at the close, the point slides in.
			const Lb = sinkD > 0 ? lerp(Lm, g.L_LO, Math.pow(sinkD, 2.4)) : Lm;
			const [bx, by] = g.at(Lb);
			const gone = 1 - smooth(span(sinkD, 0.85, 1));
			if (conf > 0 && conf < 1) {
				const pts = g.arc(Lm, lerp(Lm, g.L_LO, conf));
				stroke(ctx, pts, {
					color: PAL.gold,
					width: 1.3,
					alpha: lerp(0.45, 0.22, smooth(span(conf, 0.5, 1))) * out
				});
			}
			const strand = 1 - P; // the gold strand, faded as the dial comes up
			if (conf >= 1 && strand > 0.01)
				stroke(ctx, g.arc(Lm, g.L_LO), { color: PAL.gold, width: 1.1, alpha: 0.22 * strand * out });
			if (sinkD > 0 && sinkD < 1)
				stroke(ctx, g.arc(Math.min(Lm, Lb + 0.4), Lb), {
					color: PAL.gold,
					width: 1.2,
					alpha: 0.4 * gone * out
				});
			const flare = Math.sin(Math.PI * hand.enter1);
			point(
				ctx,
				bx,
				by,
				(2.6 + 1.2 * flare) * lerp(1, 0.6, sinkD),
				(wrong ? 0.55 : 0.95) * gone * out,
				PAL.gold,
				GOLD
			);
			const d = hand.typed.padEnd(8, '_');
			const label = `${d.slice(0, 2)} · ${d.slice(2, 4)} · ${d.slice(4, 8)}`;
			beside(
				ctx,
				label,
				mx,
				my,
				mc,
				ms,
				14,
				Math.max(10, Math.round(0.5 * g.fs)),
				goldMix(1 - 0.6 * smooth(span(t, BEATS.e1 + 0.6, BEATS.e1 + 1.6))),
				0.72 * smooth(span(hand.enter1, 0.2, 1)) * (1 - smooth(span(sinkD, 0, 0.3))) * out
			);
		}

		// ── The dial ─────────────────────────────────────────────────────────
		const dialA = P * smooth(span(hand.q2, 0, 0.8)) * (1 - smooth(span(sinkS, 0.05, 0.5))) * out;
		const v = Math.min(10, Math.max(1, hand.value));
		const Lv = Lstop(v);
		if (dialA > 0.004) {
			stroke(ctx, g.arc(L_A, L_B), { color: PAL.chalk, width: 1.3, alpha: 0.42 * dialA });
			// The part up to the bead, brighter; gold on Enter.
			stroke(ctx, g.arc(L_A, Lv), { color: PAL.chalk, width: 1.7, alpha: 0.75 * dialA });
			if (hand.enter2 > 0)
				stroke(ctx, g.arc(L_A, Lv), {
					color: PAL.gold,
					width: 1.9,
					alpha: dialA,
					upto: hand.enter2
				});
			// The stops, ticks across the turn; the one under a held bead ringed.
			const near = Math.round(v);
			for (let i = 1; i <= 10; i++) {
				const L = Lstop(i);
				const [x, y] = g.at(L);
				const r = g.rOf(L);
				const c = (x - cx) / r;
				const s = (y - cy) / r;
				const passed = i <= v + 1e-3;
				stroke(
					ctx,
					[
						[x - c * 4.5, y - s * 4.5],
						[x + c * 4.5, y + s * 4.5]
					],
					{ color: PAL.chalk, width: 1.1, alpha: dialA * (passed ? 0.75 : 0.38), cap: 'butt' }
				);
				if (hand.held > 0 && i === near) {
					ctx.save();
					ctx.globalAlpha = 0.55 * dialA;
					ctx.strokeStyle = PAL.gold;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(x, y, 8, 0, TAU);
					ctx.stroke();
					ctx.restore();
				}
				if (i === 1)
					beside(
						ctx,
						'1',
						x,
						y,
						c,
						s,
						13,
						Math.max(10, Math.round(0.5 * g.fs)),
						PAL.chalk,
						0.5 * dialA * span(Math.abs(v - 1), 0.4, 0.9)
					);
				if (i === 10)
					beside(
						ctx,
						'10',
						x,
						y,
						-c,
						-s,
						13,
						Math.max(10, Math.round(0.5 * g.fs)),
						PAL.chalk,
						0.5 * dialA * span(Math.abs(v - 10), 0.4, 0.9)
					);
			}
		}
		// The bead: a small lit point, brighter in the hand, flaring on Enter;
		// at the close it slides on into the light.
		const beadA = P * smooth(span(hand.q2, 0.3, 1)) * (1 - smooth(span(sinkS, 0.85, 1))) * out;
		if (beadA > 0.004) {
			const Lnow = sinkS > 0 ? lerp(Lv, g.L_LO, Math.pow(sinkS, 2.4)) : Lv;
			const [x, y] = g.at(Lnow);
			if (sinkS > 0 && sinkS < 1)
				stroke(ctx, g.arc(Math.min(Lv, Lnow + 0.4), Lnow), {
					color: PAL.gold,
					width: 1.2,
					alpha: 0.4 * beadA
				});
			const flare = hand.enter2 > 0 && hand.enter2 < 1 ? Math.sin(Math.PI * hand.enter2) : 0;
			const r = (2.7 + 0.8 * hand.held + 1.3 * flare) * lerp(1, 0.6, sinkS);
			point(
				ctx,
				x,
				y,
				r,
				(0.82 + 0.18 * hand.held) * beadA,
				hand.enter2 > 0 ? PAL.gold : goldMix(0.55),
				GOLD
			);
			if (sinkS <= 0) {
				const rr = g.rOf(Lv);
				const c = (x - cx) / rr;
				const s = (y - cy) / rr;
				beside(
					ctx,
					String(Math.round(v)),
					x,
					y,
					c,
					s,
					15,
					Math.max(11, Math.round(0.56 * g.fs)),
					hand.enter2 > 0 ? PAL.gold : PAL.chalk,
					(0.55 + 0.4 * hand.held) * beadA
				);
			}
		}

		// ── The transcript, top left ─────────────────────────────────────────
		transcript(ctx, g, t, hand, out, wrong);
	}

	// The questions, typed at the terminal's margin, and their answers.
	function transcript(ctx, g, t, hand, out, wrong) {
		const [y1, y2, y3] = g.rows;
		const x = g.x0;
		const answered = 1 - 0.35 * smooth(span(hand.q2, 0, 1));
		// The date's question, typed on.
		if (hand.q1 > 0) {
			const n = Math.floor(hand.q1 * DATE_Q.length + 1e-6);
			text(ctx, DATE_Q.slice(0, n), x, y1, g.qs, PAL.chalk, 0.62 * out * answered);
		}
		// The field: DD · MM · YYYY, a mask for the digits still to come.
		const fieldA = smooth(span(hand.q1, 0.55, 1)) * out * answered;
		if (fieldA > 0.004) {
			const SLOT = [0, 1, 5, 6, 10, 11, 12, 13];
			const cell = g.cell;
			const typed = hand.typed.slice(0, 8);
			const bad = typed.length === 8 && wrong;
			const gold = hand.enter1 > 0 ? 1 - smooth(span(t, BEATS.e1 + 0.5, BEATS.e1 + 1.5)) : 0;
			const col = gold > 0 ? goldMix(gold) : PAL.chalk;
			for (let i = 0; i < 8; i++) {
				const xi = x + SLOT[i] * cell;
				if (i < typed.length) text(ctx, typed[i], xi, y2, g.as, col, (bad ? 0.5 : 0.94) * fieldA);
				else
					stroke(
						ctx,
						[
							[xi + 0.15 * cell, y2 + 0.12 * g.as],
							[xi + 0.85 * cell, y2 + 0.12 * g.as]
						],
						{ color: PAL.chalk, width: 1, alpha: 0.3 * fieldA, cap: 'butt' }
					);
			}
			for (const c of [3, 8]) text(ctx, '·', x + c * cell, y2, g.as, PAL.chalk, 0.42 * fieldA);
			// The caret: the terminal's block in the next slot, a bar once full.
			if (hand.caret > 0 && hand.enter1 <= 0) {
				const on = hand.steady > 0 || (((hand.secs * 2.3) % 1) + 1) % 1 < 0.58;
				if (on) {
					ctx.save();
					ctx.globalAlpha = 0.88 * fieldA;
					ctx.fillStyle = PAL.chalk;
					if (typed.length < 8) {
						ctx.fillRect(x + SLOT[typed.length] * cell, y2 - 0.78 * g.as, cell, 0.92 * g.as);
					} else ctx.fillRect(x + 14.3 * cell, y2 - 0.78 * g.as, 1.6, 0.92 * g.as);
					ctx.restore();
				}
			}
		}
		// The spice's question, and the stop the bead is at.
		if (hand.q2 > 0) {
			const n = Math.floor(hand.q2 * SPICE_Q.length + 1e-6);
			text(ctx, SPICE_Q.slice(0, n), x, y3, g.qs, PAL.chalk, 0.62 * out);
			const va = smooth(span(hand.q2, 0.7, 1)) * out;
			const gold = hand.enter2 > 0 ? 1 - smooth(span(t, BEATS.e2 + 0.6, BEATS.e2 + 1.8)) : 0;
			text(
				ctx,
				String(Math.round(Math.min(10, Math.max(1, hand.value)))),
				x + (SPICE_Q.length + 2) * g.qcell,
				y3,
				g.as,
				gold > 0 ? goldMix(gold) : PAL.chalk,
				0.94 * va
			);
		}
	}

	return {
		render,
		resize() {
			G = null;
			frozen = null;
		}
	};
}
