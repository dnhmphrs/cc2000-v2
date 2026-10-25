// ── I2 · THE MEG: the machine reads the user ─────────────────────────────────
// The calculator of variant I2 does not take the birthday as a number to do
// arithmetic on: it READS the person typing it. A sensor cap on a head in
// profile (the hand's), its leads running to a strip of channel traces; every
// keystroke an evoked response on the traces (the key's own moment, so a
// person's rhythm is in the picture), the spice the gain. From the digits and
// the spice a SPECTRUM — delta, theta, alpha, beta, gamma, each a power and a
// peak frequency — and from the spectrum the swimmer: the bands as a Fourier
// series, one epicycle a band, traced into the closed curve that is the
// body's section (body.js rosetteSection). The same spectrum is written along
// the tunnel's walls as the traces of the memory the swimmer goes back
// along. Every function here is pure: a picture of its arguments.
//
//   bandsOf(digits, spice)         → { w, p, f, dom, hz, name, label }
//   signalOf(bands, ch, tau)       a channel's ongoing rhythm at time tau (s)
//   spikeOf(keys, ch, tau)         the evoked responses on it from the keys
//   wallOf(bands, ch, xi)          the trace along the tunnel at e-fold xi
//   spectrumRosette(bands, spice)  { r, f, at } for body.js rosetteSection
//   HEAD, SCALP, CHANNELS          the profile, where the sensors sit, names
//   drawHead / drawStrip / drawSpectrum / drawEpicycles — the entry's panel,
//   drawn on the board in the hand (sketch-hand.js: the lettering, the red
//   pencil; the traces plain strokes with a little boil)

import { TAU, span, smooth, lerp } from './board.js';
import { HAND, letter, circleMark, noise1, rand } from './sketch-hand.js';

export const BANDS = [
	{ key: 'delta', name: 'DELTA', lo: 1, hi: 4 },
	{ key: 'theta', name: 'THETA', lo: 4, hi: 8 },
	{ key: 'alpha', name: 'ALPHA', lo: 8, hi: 13 },
	{ key: 'beta', name: 'BETA', lo: 13, hi: 30 },
	{ key: 'gamma', name: 'GAMMA', lo: 30, hi: 80 }
];
// The channels of the strip, front to back (the 10–20 names).
export const CHANNELS = ['FP1', 'FP2', 'F3', 'F4', 'C3', 'C4', 'O1', 'O2'];
// Each channel's share of each band (frontal channels carry the fast bands,
// occipital the alpha, as a real cap reads): rows the channels, columns δθαβγ.
const GAIN = [
	[0.5, 0.6, 0.5, 1.0, 1.0],
	[0.5, 0.6, 0.5, 1.0, 0.9],
	[0.7, 0.9, 0.6, 0.8, 0.6],
	[0.7, 0.9, 0.6, 0.8, 0.6],
	[0.9, 1.0, 0.8, 0.5, 0.4],
	[0.9, 1.0, 0.8, 0.5, 0.4],
	[0.6, 0.6, 1.2, 0.3, 0.3],
	[0.6, 0.6, 1.2, 0.3, 0.3]
];
// Each band's frequency as drawn: the real one over this, so a 5 s strip
// shows the slow ones as waves and the fast ones as fuzz, not a solid bar.
const SLOW = 4;

// The head in profile (facing right), in a unit box, y down; the scalp is
// the first SCALP_N points, nape to brow, where the sensors sit.
export const HEAD = [
	[0.2, 0.74],
	[0.1, 0.6],
	[0.06, 0.44],
	[0.09, 0.28],
	[0.18, 0.14],
	[0.32, 0.05],
	[0.48, 0.02],
	[0.64, 0.05],
	[0.78, 0.14],
	[0.87, 0.28],
	[0.9, 0.42],
	[0.91, 0.5],
	[0.97, 0.58],
	[0.92, 0.63],
	[0.93, 0.69],
	[0.9, 0.75],
	[0.89, 0.82],
	[0.8, 0.88],
	[0.68, 0.9],
	[0.56, 0.87],
	[0.5, 0.92],
	[0.47, 1.0]
];
export const SCALP_N = 11;
// Where the eight sensors sit along the scalp (0 the nape, 1 the brow), in
// the strip's order: FP at the brow, O at the back.
export const SCALP = [0.92, 0.84, 0.72, 0.62, 0.5, 0.4, 0.2, 0.1];
// A point along the scalp's polyline at u (0 … 1 of its length).
export function scalpAt(u) {
	const P = HEAD.slice(0, SCALP_N);
	const L = [0];
	for (let i = 1; i < P.length; i++)
		L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
	const want = u * L[L.length - 1];
	let i = 1;
	while (i < L.length - 1 && L[i] < want) i++;
	const f = (want - L[i - 1]) / (L[i] - L[i - 1] || 1);
	const a = P[i - 1];
	const b = P[i];
	// the point and its outward normal (the head's inside is below-right)
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const n = Math.hypot(dx, dy) || 1;
	return { x: a[0] + f * dx, y: a[1] + f * dy, nx: dy / n, ny: -dx / n };
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const r1 = (x) => Math.round(x * 10) / 10;

// The spectrum from what has been typed: the day's digits power the delta,
// the month's the theta, the century's the alpha, the year's the beta, the
// spice the gamma. A digit not yet typed gives nothing, so the spectrum
// builds as the date is typed; the peak frequency of each band is set by the
// value it reads. `dom` the dominant band.
export function bandsOf(digits, spice) {
	const raw = String(digits ?? '')
		.replace(/\D/g, '')
		.slice(0, 8);
	const d = (i) => (i < raw.length ? Number(raw[i]) : null);
	const two = (i) => {
		const a = d(i);
		const b = d(i + 1);
		if (a === null) return 0;
		return 1 + a + (b ?? 0);
	};
	const sp = Number(spice);
	const n = Number.isFinite(sp) && sp > 0 ? clamp(sp, 1, 10) : 0;
	const p = [two(0), two(2), two(4), two(6), n > 0 ? 1.6 * n : 0];
	const sum = p.reduce((a, b) => a + b, 0);
	const w = sum > 0 ? p.map((x) => x / sum) : [0.2, 0.2, 0.2, 0.2, 0.2];
	const day = raw.length >= 2 ? clamp(10 * Number(raw[0]) + Number(raw[1]), 1, 31) : 16;
	const month = raw.length >= 4 ? clamp(10 * Number(raw[2]) + Number(raw[3]), 1, 12) : 6;
	const cent = raw.length >= 6 ? Number(raw[5]) : 9;
	const yy = raw.length >= 8 ? 10 * Number(raw[6]) + Number(raw[7]) : 50;
	const frac = [(day - 1) / 30, (month - 1) / 11, cent / 9, yy / 99, n > 0 ? (n - 1) / 9 : 0.5];
	const f = BANDS.map((b, k) => r1(b.lo + (b.hi - b.lo) * frac[k]));
	let dom = 0;
	for (let k = 1; k < 5; k++) if (p[k] > p[dom]) dom = k;
	return {
		w,
		p,
		f,
		dom,
		hz: f[dom],
		name: BANDS[dom].name,
		label: `${BANDS[dom].name} ${f[dom].toFixed(1)} HZ`
	};
}

// A channel's ongoing rhythm: the bands summed, each at its peak frequency
// (slowed for the strip), with the channel's own phases, in units of the
// strip's amplitude (about ±1).
export function signalOf(bands, ch, tau) {
	let s = 0;
	const g = GAIN[ch % GAIN.length];
	for (let k = 0; k < 5; k++) {
		const w = bands.w[k];
		if (w <= 0) continue;
		const f = bands.f[k] / SLOW;
		const ph = 0.9 * ch + 1.7 * k;
		s += w * g[k] * Math.sin(TAU * f * tau + ph) * (k >= 3 ? 0.6 : 1);
	}
	return 1.6 * s;
}

// The evoked responses: each key at `at` (the trace's own clock) a ring-down
// after a short lag down the channels (the response travelling back from the
// front), its size the digit's; Enter a bigger, slower one.
export function spikeOf(keys, ch, tau) {
	let s = 0;
	for (const k of keys) {
		const x = tau - k.at - 0.03 * ch;
		if (x <= 0 || x > 1.2) continue;
		const enter = k.d === 'enter';
		const A = enter ? 2.6 : 0.9 + 0.16 * (Number(k.d) || 0);
		const f = enter ? 3.2 : 5.5;
		s += A * Math.exp(-x / (enter ? 0.32 : 0.2)) * Math.sin(TAU * f * x);
	}
	return s;
}

// The trace along the tunnel's wall at e-fold xi (0 the start of the swim,
// growing inward: the memory's own time axis): the bands at rates of about
// one to five waves an e-fold, so the fast bands are fuzz round the slow
// ones; ±1.
export function wallOf(bands, ch, xi) {
	const F = [0.7, 1.3, 2.1, 3.2, 4.6];
	let s = 0;
	const g = GAIN[ch % GAIN.length];
	for (let k = 0; k < 5; k++) {
		const w = bands.w[k];
		if (w <= 0) continue;
		s += w * g[k] * Math.sin(TAU * F[k] * xi + 1.3 * ch + 0.7 * k) * (k >= 3 ? 0.55 : 1);
	}
	return 1.5 * s;
}

// The spectrum as a Fourier series for the body's section: a carrier at
// f = 1 and one arm a band at f = 1 + n·s (s = 1, −1, 2, −2, 3), n the spice,
// so the section has the spice's symmetry and the bands' powers are its
// lobes (body.js rosetteSection takes it as the epicycle intro's rosette).
export function spectrumRosette(bands, spice) {
	const sp = Number(spice);
	const n = Number.isFinite(sp) && sp > 0 ? clamp(sp, 1, 10) : 1;
	const S = [0, 1, -1, 2, -2, 3];
	const r = [0.5, ...bands.w.map((w) => 0.5 * w)];
	const f = S.map((s) => 1 + n * s);
	const at = (ph) => {
		let x = 0;
		let y = 0;
		for (let k = 0; k < r.length; k++) {
			x += r[k] * Math.cos(f[k] * ph);
			y += r[k] * Math.sin(f[k] * ph);
		}
		return [x, y];
	};
	return { r, f, at };
}

// ── Drawing ──────────────────────────────────────────────────────────────────
const clip = (x, m) => Math.max(-m, Math.min(m, x));

// The head in profile in `box` ({ x, y, w, h }: the unit box scaled), drawn
// in to `upto` (0…1 along its outline, nape round to the chin), the sensors
// popping one by one as the line passes them, each with its lead: out along
// the scalp's normal, up to a bus above the head, along it, and down into
// its row of the strip (`rows`: the strip's left x and each row's y).
export function drawHead(ink, box, o) {
	const { upto = 1, alpha = 1, bo = 0, rows = null, leads = 0, lit = null, sc = 1 } = o;
	if (upto <= 0 || alpha <= 0.01) return;
	const P = (p, k = 0) => [
		box.x + p[0] * box.w + 1.6 * sc * noise1(k * 0.7 + 3, bo),
		box.y + p[1] * box.h + 1.6 * sc * noise1(k * 0.7 + 50, bo)
	];
	const n = Math.max(2, Math.ceil(upto * (HEAD.length - 1)) + 1);
	const run = [];
	for (let i = 0; i < Math.min(n, HEAD.length); i++) run.push(P(HEAD[i], i));
	if (n < HEAD.length) {
		const f = upto * (HEAD.length - 1) - (n - 2);
		const a = HEAD[n - 2];
		const b = HEAD[n - 1];
		run[run.length - 1] = P([lerp(a[0], b[0], f), lerp(a[1], b[1], f)], n - 1);
	}
	ink.line(run, HAND.ink, 2.1 * sc, 0.95 * alpha);
	// the ear, the eye: two small strokes
	if (upto > 0.55) {
		const e = [0.42, 0.5];
		ink.line(
			[
				P([e[0] - 0.03, e[1] - 0.05]),
				P([e[0] + 0.03, e[1] - 0.07]),
				P([e[0] + 0.035, e[1] + 0.05]),
				P([e[0] - 0.01, e[1] + 0.06])
			],
			HAND.ink,
			1.4 * sc,
			0.6 * alpha
		);
		ink.line([P([0.8, 0.42]), P([0.86, 0.41])], HAND.ink, 1.6 * sc, 0.7 * alpha);
	}
	// the sensors along the scalp, each a small circle, and its lead
	const busY = box.y - 0.09 * box.h;
	for (let c = 0; c < SCALP.length; c++) {
		const s = scalpAt(SCALP[c]);
		// the outline passes the scalp's point at this much of upto
		const pass = (SCALP[c] * (SCALP_N - 1)) / (HEAD.length - 1);
		const k = smooth(span(upto, pass, pass + 0.06));
		if (k <= 0) continue;
		const cx = box.x + (s.x + 0.035 * s.nx) * box.w;
		const cy = box.y + (s.y + 0.035 * s.ny) * box.h;
		const r = 0.024 * box.h * k;
		const ring = [];
		const m = 14;
		const ph0 = TAU * rand(c, bo, 61);
		for (let j = 0; j <= m; j++) {
			const ph = ph0 + (TAU * 1.05 * j) / m;
			const rr = r * (1 + 0.06 * noise1(j * 0.9 + c, bo * 7 + c));
			ring.push([cx + rr * Math.cos(ph), cy + rr * Math.sin(ph)]);
		}
		const glow = lit ? lit(c) : 0;
		ink.line(
			ring,
			glow > 0.01 ? HAND.gold : HAND.ink,
			(1.5 + 1.2 * glow) * sc,
			alpha * (0.85 + 0.15 * glow)
		);
		if (rows && leads > 0) {
			const kl = smooth(span(leads, c / 10, c / 10 + 0.35));
			if (kl <= 0) continue;
			const ox = cx + 0.07 * box.w * s.nx;
			const oy = cy + 0.07 * box.h * s.ny;
			const bx = rows.x - (0.02 + 0.012 * c) * box.w;
			const path = [
				[cx, cy],
				[ox, oy],
				[ox, busY - 0.012 * c * box.h],
				[bx, busY - 0.012 * c * box.h],
				[bx, rows.y[c]],
				[rows.x, rows.y[c]]
			];
			// drawn on to kl along its length
			let L = 0;
			const seg = [];
			for (let i = 1; i < path.length; i++) {
				const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
				seg.push(d);
				L += d;
			}
			let want = kl * L;
			const out = [path[0]];
			for (let i = 1; i < path.length && want > 0; i++) {
				const d = seg[i - 1];
				const f = Math.min(1, want / d);
				const q = [lerp(path[i - 1][0], path[i][0], f), lerp(path[i - 1][1], path[i][1], f)];
				out.push([
					q[0] + 0.9 * sc * noise1(i + 9 * c, bo),
					q[1] + 0.9 * sc * noise1(i + 9 * c + 40, bo)
				]);
				want -= d;
			}
			ink.line(out, HAND.ink, 0.9 * sc, 0.55 * alpha, false);
		}
	}
}

// The strip of channel traces in `box`: `rows` channels, the last SPAN
// seconds of each ending at `tau` (the trace's clock) at the right edge,
// the signal the bands' rhythm plus the keys' evoked responses, `gain` the
// spice's; the channel's name at the left. Plain strokes on the canvas (a
// keyline would double the cost of 8 × 140 points), a little boil.
export const SPAN = 5;
export function drawStrip(ctx, ink, box, o) {
	const {
		bands,
		keys = [],
		tau = 0,
		gain = 1,
		alpha = 1,
		upto = 1,
		bo = 0,
		sc = 1,
		lit = null
	} = o;
	if (alpha <= 0.01 || upto <= 0) return { x: box.x, y: [] };
	const n = CHANNELS.length;
	const rowH = box.h / n;
	const ys = [];
	const label = 0.5 * rowH;
	const x0 = box.x + 2.6 * label;
	const W = box.x + box.w - x0;
	const N = 140;
	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (let c = 0; c < n; c++) {
		const yc = box.y + (c + 0.5) * rowH;
		ys.push(yc);
		const kc = smooth(span(upto, c / n, c / n + 0.3));
		if (kc <= 0) continue;
		letter(ink, CHANNELS[c], box.x, yc + 0.35 * label, 0.8 * label, {
			align: 'left',
			seed: 700 + c,
			boil: bo,
			alpha: 0.7 * alpha * kc,
			width: 0.1
		});
		const glow = lit ? lit(c) : 0;
		ctx.beginPath();
		const amp = 0.42 * rowH * gain * kc;
		for (let j = 0; j <= N; j++) {
			const u = j / N;
			const tt = tau - SPAN * (1 - u);
			let v = signalOf(bands, c, tt) + spikeOf(keys, c, tt);
			v = clip(v, 1.15);
			const x = x0 + u * W;
			const y = yc - amp * v + 0.7 * sc * noise1(u * 11 + c * 3, bo * 5 + c);
			if (j === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = glow > 0.01 ? HAND.gold : HAND.ink;
		ctx.globalAlpha = alpha * kc * (0.55 + 0.45 * glow);
		ctx.lineWidth = (1.1 + 0.6 * glow) * sc;
		ctx.stroke();
	}
	// the now: a red tick at the right edge
	if (upto > 0.9) {
		const x = x0 + W + 0.3 * label;
		ink.line(
			[
				[x, box.y - 0.2 * rowH],
				[x, box.y + box.h + 0.2 * rowH]
			],
			HAND.red,
			1.2 * sc,
			0.7 * alpha,
			false
		);
	}
	ctx.restore();
	return { x: x0, y: ys };
}

// The spectrum in `box`: the five bands on a log-frequency axis (1 … 100
// Hz), each a bar as tall as its power, its name under it, the dominant
// band's peak lettered over it and its name ringed in red at `ring`.
export function drawSpectrum(ink, box, o) {
	const { bands, k = 1, ring = 0, alpha = 1, bo = 0, sc = 1 } = o;
	if (alpha <= 0.01 || k <= 0) return;
	const fx = (f) => box.x + (box.w * Math.log(f)) / Math.log(100);
	const base = box.y + box.h * 0.78;
	// the axis, with ticks at 1, 10, 100
	ink.line(
		[
			[box.x, base],
			[box.x + box.w, base]
		],
		HAND.ink,
		1.4 * sc,
		0.7 * alpha
	);
	for (const f of [1, 10, 100]) {
		const x = fx(f);
		ink.line(
			[
				[x, base],
				[x, base + 0.03 * box.h]
			],
			HAND.ink,
			1.2 * sc,
			0.6 * alpha,
			false
		);
		letter(ink, `${f}`, x, base + 0.1 * box.h, 0.045 * box.h, {
			seed: 800 + f,
			boil: bo,
			alpha: 0.6 * alpha,
			width: 0.1
		});
	}
	letter(ink, 'HZ', box.x + box.w + 0.03 * box.w, base + 0.1 * box.h, 0.045 * box.h, {
		align: 'left',
		seed: 811,
		boil: bo,
		alpha: 0.6 * alpha,
		width: 0.1
	});
	const wmax = Math.max(0.05, ...bands.w);
	for (let b = 0; b < BANDS.length; b++) {
		const B = BANDS[b];
		const kb = smooth(span(k, b / 6, b / 6 + 0.4));
		if (kb <= 0) continue;
		const xa = fx(B.lo) + 0.004 * box.w;
		const xb = fx(B.hi) - 0.004 * box.w;
		const hgt = (0.66 * box.h * bands.w[b] * kb) / wmax;
		const top = base - hgt;
		const dom = b === bands.dom;
		const col = dom ? HAND.gold : HAND.ink;
		const j = (i) => 1.2 * sc * noise1(i * 1.3 + b * 5, bo * 3 + b);
		ink.line(
			[
				[xa + j(1), base],
				[xa + j(2), top + j(3)],
				[xb + j(4), top + j(5)],
				[xb + j(6), base]
			],
			col,
			1.8 * sc,
			0.9 * alpha
		);
		// the fill: a few hatch lines
		const m = Math.max(1, Math.floor(hgt / (0.06 * box.h)));
		for (let i = 1; i < m; i++) {
			const y = base - (i * hgt) / m;
			ink.line(
				[
					[xa + 0.1 * (xb - xa), y + j(10 + i)],
					[xb - 0.1 * (xb - xa), y + j(20 + i)]
				],
				col,
				0.8 * sc,
				0.35 * alpha,
				false
			);
		}
		// (the labels on two lines, the narrow bands' apart)
		const bx = letter(
			ink,
			B.name,
			(xa + xb) / 2,
			base + (b % 2 ? 0.31 : 0.2) * box.h,
			0.05 * box.h,
			{
				seed: 820 + b,
				boil: bo,
				alpha: 0.85 * alpha * kb,
				width: 0.1,
				color: col
			}
		);
		if (dom) {
			letter(ink, `${bands.f[b].toFixed(1)} HZ`, (xa + xb) / 2, top - 0.05 * box.h, 0.055 * box.h, {
				seed: 830,
				boil: bo,
				alpha: alpha * kb,
				width: 0.1,
				color: HAND.gold
			});
			if (ring > 0)
				circleMark(ink, [bx.x0, bx.y0, bx.x1, bx.y1], ring, {
					seed: 840,
					boil: bo,
					alpha,
					pad: 0.35
				});
		}
	}
}

// The spectrum's epicycles tracing the section: the carrier's circle and
// one arm a band, each turning at its own rate, the pen at the last one's
// tip drawing the closed figure that is the body's section (body.js
// rosetteSection takes the same rosette). `ph` the angle turned so far.
export function drawEpicycles(ink, cx, cy, R, ros0, o) {
	const { ph = 0, alpha = 1, bo = 0, sc = 1, arms = 1, amount = 1 } = o;
	if (alpha <= 0.01) return;
	// The figure as the body takes it (body.js rosetteSection): the ellipse
	// blended with the rosette, (1 − a)e^{iφ} + a·z(φ) — the carrier's arm
	// is (1 − a) + a·r₀, the bands' a·r_k.
	const a = Math.max(0, Math.min(1, amount));
	const r = ros0.r.map((x, k) => (k === 0 ? 1 - a + a * x : a * x));
	const ros = {
		r,
		f: ros0.f,
		at: (p) => {
			let x = 0;
			let y = 0;
			for (let k = 0; k < r.length; k++) {
				x += r[k] * Math.cos(ros0.f[k] * p);
				y += r[k] * Math.sin(ros0.f[k] * p);
			}
			return [x, y];
		}
	};
	// the figure's extent, to scale it into R
	let ext = 0;
	for (let i = 0; i < 48; i++) {
		const q = ros.at((TAU * i) / 48);
		ext = Math.max(ext, Math.hypot(q[0], q[1]));
	}
	const K = R / Math.max(0.2, ext);
	// the arms at ph
	let x = cx;
	let y = cy;
	const circ = (x0, y0, r, i, a) => {
		const run = [];
		const m = 22;
		const p0 = TAU * rand(i, bo, 71);
		for (let j = 0; j <= m; j++) {
			const p = p0 + (TAU * 1.04 * j) / m;
			const rr = r * (1 + 0.04 * noise1(j * 0.8 + i, bo * 5 + i));
			run.push([x0 + rr * Math.cos(p), y0 + rr * Math.sin(p)]);
		}
		ink.line(run, HAND.ink, 0.9 * sc, a, false);
	};
	if (arms > 0)
		for (let k = 0; k < ros.r.length; k++) {
			const r = K * ros.r[k];
			if (r < 1.5) continue;
			circ(x, y, r, 90 + k, 0.35 * alpha * arms);
			const nx = x + r * Math.cos(ros.f[k] * ph);
			const ny = y + r * Math.sin(ros.f[k] * ph);
			ink.line(
				[
					[x, y],
					[nx, ny]
				],
				k === 0 ? HAND.ink : HAND.gold,
				1.3 * sc,
				0.8 * alpha * arms,
				false
			);
			x = nx;
			y = ny;
		}
	// the trace so far
	const n = Math.max(2, Math.ceil((ph / TAU) * 160));
	const run = [];
	for (let j = 0; j <= n; j++) {
		const p = (ph * j) / n;
		const q = ros.at(p);
		run.push([
			cx + K * q[0] + 0.8 * sc * noise1(j * 0.3, bo),
			cy + K * q[1] + 0.8 * sc * noise1(j * 0.3 + 30, bo)
		]);
	}
	ink.line(run, HAND.gold, 2.0 * sc, alpha);
	// the pen
	if (arms > 0) {
		const q = ros.at(ph);
		const px = cx + K * q[0];
		const py = cy + K * q[1];
		ink.line(
			[
				[px - 3 * sc, py],
				[px + 3 * sc, py]
			],
			HAND.red,
			2 * sc,
			alpha * arms,
			false
		);
	}
}
