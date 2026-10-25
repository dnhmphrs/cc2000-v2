// ── I1 — THE WAVE: the birthday as a signal, the swimmer as that wave ────────
// The input is a SIGNAL. Harmonic 1 is the CARRIER (the beat itself, weight
// 1); each digit of the date, DDMMYYYY, is a harmonic above it — digit k at
// harmonic k + 2, its weight (d_k + ½) · s_k with the shares falling
//     s = .30 .20 .14 .10 .07 .05 .035 .025
// (the day the low harmonics that shape the wave, the year a ripple on it) —
// and the spice is the GAIN: how far the wave swings. The flagellum's
// tangent angle IS the series, β(s) = Θ(s) Σ (c_h / h) cos h(κ(s − s_T) − ωt)
// (Θ the body's envelope, neck to tip; the 1/h so the tail's stations can
// carry it), integrated so the tail keeps its length, the whole turned so
// its mean axis is the heading, then rolled — body.js's shape() with its one
// sine replaced by the person's series (flow-harmonic's makeBeat, kept here
// under I1's prefix). The HEAD is the carrier: its section is the ellipse
// lobed by the same spectrum, so the head carries the harmonics round it.
//
//   harmonicsOf(digits, spice)   digits: [{ d, g }] (a digit and how grown,
//                                 0…1) or a string; → { c (c[0] the carrier,
//                                 c[k + 1] digit k's, normalised to sum 1),
//                                 w (raw), gain, hz }
//   carrierSection(c)            body.js section: the ellipse lobed by c
//   makeBeat(body, spec, c, waves)   → { shape(t, { amp, phase, roll }) }
//   fineTrace(body, spec, c, { amp, phase, waves, ds })   the tail's
//                                 centreline finely sampled: { s, x, z }
//                                 (x along the heading from the nose, −;
//                                 z across, the beat's plane)
//   signalOf(c)                  θ → Σ c_h sin hθ, normalised to ±1 (the
//                                 wavefronts' modulation)
//   gainOf(spice), hzOf(spice)

import { TAU, clamp01 } from './board.js';

export const WAVE = {
	share: [0.3, 0.2, 0.14, 0.1, 0.07, 0.05, 0.035, 0.025],
	waves: 1.6, // waves on the tail
	lobe: 0.07, // the head's lobes, of its radius
	carrier: 1 // the fundamental's weight
};
export const NH = 9; // the carrier and eight digits

export const gainOf = (n) => 0.7 + 0.04 * (clampN(n) - 1);
export const hzOf = (n) => 2 + 0.35 * clampN(n);
const clampN = (n) => {
	const x = Number(n);
	return Number.isFinite(x) && x > 0 ? Math.max(1, Math.min(10, x)) : 5.5;
};

export function harmonicsOf(digits, spice) {
	const w = new Array(NH).fill(0);
	w[0] = WAVE.carrier;
	const list =
		typeof digits === 'string'
			? digits.split('').map((ch) => ({ d: Number(ch), g: 1 }))
			: (digits ?? []);
	for (let k = 0; k < 8; k++) {
		const e = list[k];
		if (!e || e.d === null || e.d === undefined || !(e.g > 0)) continue;
		w[k + 1] = (e.d + 0.5) * WAVE.share[k] * clamp01(e.g);
	}
	const sum = w.reduce((a, b) => a + b, 0) || 1;
	return { c: w.map((x) => x / sum), w, gain: gainOf(spice), hz: hzOf(spice) };
}

// θ → the series, normalised so its largest swing is 1.
export function signalOf(c) {
	let max = 0;
	for (let i = 0; i < 360; i++) {
		const th = (TAU * i) / 360;
		let y = 0;
		for (let h = 1; h <= NH; h++) y += c[h - 1] * Math.sin(h * th);
		max = Math.max(max, Math.abs(y));
	}
	const k = 1 / Math.max(1e-6, max);
	return (th) => {
		let y = 0;
		for (let h = 1; h <= NH; h++) y += c[h - 1] * Math.sin(h * th);
		return k * y;
	};
}

// The head's section: the ellipse with the spectrum's lobes round it — digit
// k's harmonic as k + 2 lobes, in its weight — so the head carries the signal.
export function carrierSection(c) {
	const fn = (i, ph) => {
		let r = 1;
		for (let k = 0; k < 8; k++)
			r += WAVE.lobe * (c[k + 1] / (c[0] || 1)) * Math.cos((k + 2) * ph + 0.9 * k);
		return [r * Math.cos(ph), r * Math.sin(ph)];
	};
	fn.M = 48;
	fn.gens = 16;
	fn.uniform = true;
	return fn;
}

// The tangent angle's series: Σ (c_h / h) cos hφ, normalised so its largest
// swing is 1 (the tip then bends as far as the spec's single sine would).
function series(c) {
	let maxY = 0;
	for (let i = 0; i < 720; i++) {
		const ph = (TAU * i) / 720;
		let y = 0;
		for (let h = 1; h <= NH; h++) y += (c[h - 1] / h) * Math.cos(h * ph);
		maxY = Math.max(maxY, Math.abs(y));
	}
	const norm1 = 1 / Math.max(1e-6, maxY);
	return (f) => {
		let Y = 0;
		let Q = 0;
		for (let h = 1; h <= NH; h++) {
			const k = c[h - 1] / h;
			if (!k) continue;
			Y -= k * Math.cos(h * f);
			Q += k * Math.sin(h * f);
		}
		return [norm1 * Y, norm1 * Q];
	};
}

// ── The beat: the person's series as the flagellum's ─────────────────────────
export function makeBeat(body, spec, c, waves = WAVE.waves) {
	const ST = body.stations;
	const n = ST.length;
	const SS = Float64Array.from(ST, (x) => x.s);
	const DS = new Float64Array(n);
	const WH = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		DS[i] = (SS[Math.min(n - 1, i + 1)] - SS[Math.max(0, i - 1)]) / 2;
		WH[i] = DS[i] * (ST[i].part === 'head' ? 2 : 1);
	}
	const LEN = body.length;
	const sT = body.parts.tail[0];
	const sB = body.parts.head[1] + 0.5;
	const kap = (TAU * waves) / (LEN - sT);
	const tip = spec.beat.tip;
	const neck = spec.beat.neck;
	const hel = spec.beat.helix;
	const ser = series(c);
	const slopes = (s, ph, amp) => {
		const q = Math.max(0, s - sB) / (LEN - sB);
		const Th = (neck + (tip - neck) * q) * amp;
		const [Y, Q] = ser(kap * (s - sT) - ph);
		return [Th * Y, Th * hel * Q];
	};
	function shape(t, o = {}) {
		const { form = 1, amp = 1 } = o;
		const ph = o.phase ?? 0;
		const rho = o.roll ?? 0;
		const be = new Float64Array(n);
		const ch = new Float64Array(n);
		const w0 = slopes(sB, ph, amp);
		for (let i = 0; i < n; i++) {
			const w = SS[i] <= sB ? w0 : slopes(SS[i], ph, amp);
			be[i] = w[0];
			ch[i] = w[1];
		}
		const C = new Float64Array(3 * n);
		const T = new Float64Array(3 * n);
		const Aa = new Float64Array(3 * n);
		const Bb = new Float64Array(3 * n);
		let mx = 0;
		let my = 0;
		let mz = 0;
		for (let i = 0; i < n; i++) {
			const cb = Math.cos(be[i]);
			const cc = Math.cos(ch[i]);
			const tx = -cb * cc;
			const ty = Math.sin(ch[i]);
			const tz = cc * Math.sin(be[i]);
			T[3 * i] = tx;
			T[3 * i + 1] = ty;
			T[3 * i + 2] = tz;
			mx += tx * DS[i];
			my += ty * DS[i];
			mz += tz * DS[i];
			if (i) {
				const ds = SS[i] - SS[i - 1];
				const bm = (be[i] + be[i - 1]) / 2;
				const cm = (ch[i] + ch[i - 1]) / 2;
				const c2 = Math.cos(cm);
				C[3 * i] = C[3 * i - 3] - Math.cos(bm) * c2 * ds;
				C[3 * i + 1] = C[3 * i - 2] + Math.sin(cm) * ds;
				C[3 * i + 2] = C[3 * i - 1] + c2 * Math.sin(bm) * ds;
			}
		}
		// The mean axis: the principal axis of the centreline (body.js's).
		let gx = 0;
		let gy = 0;
		let gz = 0;
		let sw = 0;
		for (let i = 0; i < n; i++) {
			gx += WH[i] * C[3 * i];
			gy += WH[i] * C[3 * i + 1];
			gz += WH[i] * C[3 * i + 2];
			sw += WH[i];
		}
		gx /= sw;
		gy /= sw;
		gz /= sw;
		let xx = 0;
		let xy = 0;
		let xz = 0;
		let yy = 0;
		let yz = 0;
		let zz = 0;
		for (let i = 0; i < n; i++) {
			const wi = WH[i];
			const dx = C[3 * i] - gx;
			const dy = C[3 * i + 1] - gy;
			const dz = C[3 * i + 2] - gz;
			xx += wi * dx * dx;
			xy += wi * dx * dy;
			xz += wi * dx * dz;
			yy += wi * dy * dy;
			yz += wi * dy * dz;
			zz += wi * dz * dz;
		}
		for (let it = 0; it < 6; it++) {
			const nx = xx * mx + xy * my + xz * mz;
			const ny = xy * mx + yy * my + yz * mz;
			const nz = xz * mx + yz * my + zz * mz;
			const l = Math.hypot(nx, ny, nz) || 1;
			mx = nx / l;
			my = ny / l;
			mz = nz / l;
		}
		if (mx * C[3 * n - 3] + my * C[3 * n - 2] + mz * C[3 * n - 1] < 0) {
			mx = -mx;
			my = -my;
			mz = -mz;
		}
		let ky = -mz;
		let kz = my;
		const sn = Math.hypot(ky, kz);
		const cs = -mx;
		if (sn > 1e-12) {
			ky /= sn;
			kz /= sn;
		}
		const cr = Math.cos(rho);
		const sr = Math.sin(rho);
		const rot = (V, j) => {
			let x = V[j];
			let y = V[j + 1];
			let z = V[j + 2];
			if (sn > 1e-12) {
				const kd = ky * y + kz * z;
				const cx = ky * z - kz * y;
				const cy = kz * x;
				const cz = -ky * x;
				x = x * cs + cx * sn;
				y = y * cs + cy * sn + ky * kd * (1 - cs);
				z = z * cs + cz * sn + kz * kd * (1 - cs);
			}
			V[j] = x;
			V[j + 1] = y * cr - z * sr;
			V[j + 2] = y * sr + z * cr;
		};
		for (let i = 0; i < n; i++) {
			const j = 3 * i;
			const tx = T[j];
			const ty = T[j + 1];
			const tz = T[j + 2];
			let bx = -ty * tx;
			let by = 1 - ty * ty;
			let bz = -ty * tz;
			const bl = Math.hypot(bx, by, bz) || 1;
			bx /= bl;
			by /= bl;
			bz /= bl;
			Bb[j] = bx;
			Bb[j + 1] = by;
			Bb[j + 2] = bz;
			Aa[j] = by * tz - bz * ty;
			Aa[j + 1] = bz * tx - bx * tz;
			Aa[j + 2] = bx * ty - by * tx;
			rot(C, j);
			rot(T, j);
			rot(Aa, j);
			rot(Bb, j);
		}
		return { n, C, T, A: Aa, B: Bb, form: clamp01(form), t, roll: rho };
	}
	return { shape, kap, sT, sB, LEN };
}

// ── The trace: the tail's centreline, finely sampled, in the beat's plane ────
// What the oscilloscope shows while the date is typed: the same series,
// integrated at a fine step from the neck (the body's own centreline is this
// at its stations, ~1.1 apart, turned to its mean axis). x runs from the
// nose along the heading (negative: the tail is behind it), z across.
export function fineTrace(
	body,
	spec,
	c,
	{ amp = 1, phase = 0, waves = WAVE.waves, ds = 0.2 } = {}
) {
	const LEN = body.length;
	const sT = body.parts.tail[0];
	const sB = body.parts.head[1] + 0.5;
	const kap = (TAU * waves) / (LEN - sT);
	const tip = spec.beat.tip;
	const neck = spec.beat.neck;
	const ser = series(c);
	const N = Math.max(2, Math.ceil((LEN - sB) / ds));
	const s = new Float64Array(N + 1);
	const x = new Float64Array(N + 1);
	const z = new Float64Array(N + 1);
	const beOf = (ss) => {
		const q = Math.max(0, ss - sB) / (LEN - sB);
		return (neck + (tip - neck) * q) * amp * ser(kap * (ss - sT) - phase)[0];
	};
	s[0] = sB;
	x[0] = -sB;
	z[0] = 0;
	let bePrev = beOf(sB);
	for (let i = 1; i <= N; i++) {
		const ss = sB + ((LEN - sB) * i) / N;
		const be = beOf(ss);
		const bm = (be + bePrev) / 2;
		const dd = ss - s[i - 1];
		s[i] = ss;
		x[i] = x[i - 1] - Math.cos(bm) * dd;
		z[i] = z[i - 1] + Math.sin(bm) * dd;
		bePrev = be;
	}
	return { s, x, z, n: N + 1 };
}
