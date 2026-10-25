// ── I3: the worldline — the swimmer as a worldline tube, the cone's calendar ──
// flow-strand-sketch-i3's own helpers (SPACE-TIME: the tunnel as the
// conception's future light cone, the swim back down the user's worldline).
//
// THE SWIMMER, FROM THE INPUT. A worldline tube: the body's section is a
// circle LORENTZ-CONTRACTED — by 1/cosh η along a direction θ — at eight
// knots down the head, neck and midpiece, one knot a digit of the date:
// the digit the rapidity η (0 → 0.25, 9 → 1.2: a 9 squeezes its ring to
// 0.55 of a circle), the spice how fast θ turns from knot to knot (1 → 0.2
// rad a knot, 10 → 1.25: a hot date is a twisted tube, a mild one a tube
// squeezed flat all one way). A station between two knots takes the blend.
// `boostShape` is one knot's ring, with a `gain` on its rapidity (the
// compile flashes each ring at gain 3 before it relaxes into the body).
//
// THE CALENDAR ON THE CONE. The cone's rings are years of proper time
// counted from the apex (the conception): a ring at every 1 January back
// from NOW down to the year after the birth, a ring at the birth, and inside
// the gestation a ring at the start of every month (the run's long
// subtraction back through the months), each with the days it gives.
// `calendar` lays them out as τ in years from the conception; the sketch
// puts ring τ at c·τ world units from the apex (linear: a steady zoom in
// e-folds then passes the years ever more slowly, the last the longest).
import { lerp } from './board.js';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
import { MON } from './sketch-copy.js';

const RAP = [0.25, 1.2]; // rapidity at digit 0 … 9
const TURN = [0.2, 1.25]; // θ's step a knot at spice 1 … 10

// The eight digits of 'DDMMYYYY' (partial while typed: a missing digit is
// the middle, 4.5; the day's tens 1.5).
export function digitsOf(date) {
	const s = String(date ?? '');
	const out = [];
	for (let i = 0; i < 8; i++) {
		const ch = s[i];
		const n = ch === undefined || ch === '' ? NaN : Number(ch);
		out.push(Number.isFinite(n) ? n : i === 0 ? 1.5 : 4.5);
	}
	return out;
}

// The boosts, one a knot: { eta, theta }.
export function boostsOf(date, spice) {
	const d = digitsOf(date);
	const n = clamp(Number(spice) || 5.5, 1, 10);
	const step = lerp(TURN[0], TURN[1], (n - 1) / 9);
	const out = [];
	for (let j = 0; j < 8; j++) {
		const eta = lerp(RAP[0], RAP[1], d[j] / 9);
		out.push({ eta, theta: 0.3 + j * step });
	}
	return out;
}

// One knot's ring: a circle contracted by 1/cosh(gain·η) along θ, as a
// section (φ → [u, v]).
export function boostShape({ eta, theta }, gain = 1) {
	const g = 1 / Math.cosh(gain * eta);
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	return (ph) => {
		const x = Math.cos(ph);
		const y = Math.sin(ph);
		// into the boost's frame, contract, and back
		const xp = (x * c + y * s) * g;
		const yp = -x * s + y * c;
		return [xp * c - yp * s, xp * s + yp * c];
	};
}

// The section for body.js: station i's ring, the blend of the two knots
// about it along the first `len` units of the body (the compiled part).
export function worldlineSection(date, spice, stations, len, gain = 1) {
	const shapes = boostsOf(date, spice).map((b) => boostShape(b, gain));
	const fn = (i, ph) => {
		const p = clamp((stations[i].s / len) * 8 - 0.5, 0, 7);
		const j = Math.min(6, Math.floor(p));
		const f = p - j;
		const a = shapes[j](ph);
		const c = shapes[j + 1](ph);
		return [lerp(a[0], c[0], f), lerp(a[1], c[1], f)];
	};
	fn.M = 48;
	fn.gens = 16;
	fn.uniform = false;
	return fn;
}
// Which knot a station is nearest (for the compile's flash).
export const knotOf = (s, len) => Math.round(clamp((s / len) * 8 - 0.5, 0, 7));

// ── The calendar ─────────────────────────────────────────────────────────────
const DAY = 86400000;
const YEAR = 365.25 * DAY;
const utc = ({ d, m, y }) => Date.UTC(y, m - 1, d);
// τ of a date, in years from the conception.
export const tauOf = (date, conception) => (utc(date) - utc(conception)) / YEAR;

// The rings: { tau, kind: 'year' | 'birth' | 'month' | 'week', label, sub, days }
// from the nearest to the lens (NOW) down to the apex; `days` on a month
// ring is the count still to go at it (the run's exact long subtraction).
export function calendar({ birth, conception, rows, now, headlines = null, every = 3 }) {
	const rings = [];
	const tauNow = tauOf(now, conception);
	for (let y = now.y; y > birth.y; y--) {
		const tau = tauOf({ d: 1, m: 1, y }, conception);
		if (tau <= 0 || tau >= tauNow) continue;
		const j = now.y - y;
		const news = headlines && every > 0 && j % every === 0 ? headlines[y]?.[0] : null;
		rings.push({ tau, kind: 'year', label: String(y), sub: news ?? null, year: y });
	}
	rings.push({ tau: tauOf(birth, conception), kind: 'birth', label: 'BORN', sub: null });
	// the months back from the birth: each ring where its month begins, the
	// days it gives, the year over the month it turns at
	let cum = 0;
	let py = birth.y;
	for (const r of rows) {
		cum += r.take;
		const days = 266 - cum;
		if (days <= 0) break;
		rings.push({
			tau: days / 365.25,
			kind: 'month',
			label: `${MON[r.m - 1]} ${r.take}`,
			sub: r.y !== py ? String(r.y) : null,
			days
		});
		py = r.y;
	}
	// the weeks of the gestation, unlabelled, faint — so the cone is not bare
	// in its last seconds (a week within a day of a month's ring is skipped)
	for (let k = 1; 7 * k < 266; k++) {
		const days = 266 - 7 * k;
		if (rings.some((r) => r.days !== undefined && Math.abs(r.days - days) < 1.5)) continue;
		rings.push({ tau: days / 365.25, kind: 'week', label: '', sub: null, days });
	}
	rings.sort((a, b) => b.tau - a.tau);
	return { tauNow, rings };
}
