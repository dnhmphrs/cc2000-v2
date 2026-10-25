// ── The search: a hand that can only add, finding the day by guessing ────────
// flow-strand-sketch-five's workings (only that flow uses it). The hand is
// asked for the day 266 days before the birthday — and it cannot take away.
// It can only ADD. So it does what anyone bad at maths does: it GUESSES a day,
// adds the 266 days to it (that much it gets right), looks at the birthday that
// would give, and — too early, too late — corrects its guess and tries again.
// And it over-corrects: each correction is a third too big (λ = 1.35), so the
// guesses swing past the answer, either side of it, ever closer, the error
// shrinking by about three each time — tens of years, then years, months,
// days — until a guess gives the birthday exactly. That is the date. (11 to 14
// guesses for every birthday 1900–2099.)
//
// THE DECADES. Each guess is a birthday the hand thinks you might have, and
// so a ROOM: the room of the decade that birthday falls in, the room the run
// falls through while it is tried. The first guesses are the hand's widest
// swings, and they are a SELECTION of the archive's other decades: from the
// farthest, either side of yours where it can, each nearer than the last
// (selection(a): the 80s' answer swings 20s, 50s, 00s, 70s; a 50s one comes
// down from the 20s, 00s, 80s, 60s). The year's last figure is kept as it
// swings (14 · 02 · 2027, 1957, 2007, 1977 for 1987): the hand turning the
// decade over. From the last of them the over-correction takes it in: 1990,
// 1985, 1987, 1986, 14 · 06, 14 · 05, 28 · 05, 23 · 05 — and 24 · 05 · 1986.
//
// What it writes is EXACT: every guess is a real date, every "+ 266" the real
// day 266 days on (dayNum/civil, Howard Hinnant's civil-day arithmetic,
// checked against Date for every birthday 1900–2099 in a scratch script), every
// correction the real difference between one guess and the next in the unit it
// is written in (whole YEARS and MONTHS keep the day of the month, which is why
// the first guesses' day is the birthday's own, cut to 28), and the last guess
// is the conception day of `conceive` — the date, which no earlier guess is.
//
//   const plan = searchOf(birth, date)    birth { d, m, y }, date its conception
//   plan.steps   [{ G, I, eps, corr, stage }]: the guess G, the birthday it
//                gives I = G + 266, eps = G − date in days (< 0 too early),
//                corr { unit: 'YEARS' | 'MONTHS' | 'DAYS', n } the correction
//                that made it (null for the first), stage 'decade' | 'swing';
//                the last step is the date itself (eps 0)
//   roomFor(year, art)   the room a birthday in `year` falls in: its own
//                decade's (DECADES8, the eight the lead plans) where that art
//                is loaded, else the site's rule (rooms.js decadeOfDate)

export const DECADES8 = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s'];
export const decadeIndex = (y) => Math.max(0, Math.min(7, Math.floor((y - 1950) / 10)));
export const GESTATION = 266;
export const LAMBDA = 1.35; // how much too big each correction is
const BIG = 1.05; // … across more than 60 years (a birthday far off the archive), so it stays short

// ── Civil days (proleptic Gregorian) ─────────────────────────────────────────
export function dayNum({ d, m, y }) {
	const yy = y - (m <= 2 ? 1 : 0);
	const era = Math.floor(yy / 400);
	const yoe = yy - era * 400;
	const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
	const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
	return era * 146097 + doe - 719468;
}
export function civil(z0) {
	const z = z0 + 719468;
	const era = Math.floor(z / 146097);
	const doe = z - era * 146097;
	const yoe = Math.floor(
		(doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
	);
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
	const mp = Math.floor((5 * doy + 2) / 153);
	const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
	const m = mp + (mp < 10 ? 3 : -9);
	return { d, m, y: yoe + era * 400 + (m <= 2 ? 1 : 0) };
}
export const addDays = (g, n) => civil(dayNum(g) + n);
// (whole months and years keep the day; every guess they act on has d ≤ 28)
export const addMonths = (g, n) => {
	const k = g.y * 12 + (g.m - 1) + n;
	return { d: g.d, m: (((k % 12) + 12) % 12) + 1, y: Math.floor(k / 12) };
};
export const addYears = (g, n) => ({ d: g.d, m: g.m, y: g.y + n });

// ── The rooms ────────────────────────────────────────────────────────────────
const SITE = (y) => (y < 1960 ? '50s' : y < 1980 ? '60s' : y < 2005 ? '90s' : '10s');
export function roomFor(year, art) {
	const own = DECADES8[decadeIndex(year)];
	if (art?.[own]) return own;
	const site = SITE(year);
	if (!art || art[site]) return site;
	return Object.keys(art).find((k) => k !== 'missing') ?? site;
}

// ── The swings across the decades ────────────────────────────────────────────
// From the answer's decade a (0…7), up to four others as signed steps (−3 is
// three decades earlier): each nearer than the one before, as many as there
// can be, crossing to the other side of the answer as often as it can, ending
// next door where it can, evenly spread, starting far. Worked out once a
// decade (there are eight).
const SEL = new Map();
export function selection(a) {
	if (SEL.has(a)) return SEL.get(a);
	const others = [];
	for (let i = 0; i < DECADES8.length; i++) if (i !== a) others.push(i - a);
	let best = null;
	for (let mask = 1; mask < 1 << others.length; mask++) {
		const s = others.filter((_, i) => mask & (1 << i));
		if (s.length > 4) continue;
		s.sort((p, q) => Math.abs(q) - Math.abs(p) || q - p);
		let ok = true;
		let alt = 0;
		let gap = 9;
		for (let i = 1; i < s.length; i++) {
			const d = Math.abs(s[i - 1]) - Math.abs(s[i]);
			if (d <= 0) ok = false;
			gap = Math.min(gap, d);
			if (Math.sign(s[i]) !== Math.sign(s[i - 1])) alt++;
		}
		if (!ok) continue;
		const score =
			s.length * 100 +
			alt * 10 +
			2 * Math.min(gap, 3) +
			(Math.abs(s[s.length - 1]) === 1 ? 5 : 0) +
			Math.abs(s[0]);
		if (!best || score > best.score) best = { s, score };
	}
	SEL.set(a, best ? best.s : []);
	return SEL.get(a);
}

// ── The search ───────────────────────────────────────────────────────────────
export function searchOf(birth, date, { lam = LAMBDA } = {}) {
	const cn = dayNum(date);
	const a = decadeIndex(birth.y);
	const D = Math.min(birth.d, 28);
	const M = birth.m;
	const steps = [];
	const push = (G, corr, stage) =>
		steps.push({ G, I: addDays(G, GESTATION), eps: dayNum(G) - cn, corr, stage });
	// The swings across the decades: the birthday's own day and month in a
	// year of each, its last figure kept, so that the birthday it gives falls
	// in that decade.
	let G = null;
	const last = ((birth.y % 10) + 10) % 10;
	for (const d of selection(a)) {
		const Yt = 1950 + 10 * (a + d) + last;
		let g = { d: D, m: M, y: Yt };
		if (addDays(g, GESTATION).y !== Yt) g = { d: D, m: M, y: Yt - 1 };
		if (dayNum(g) === cn) break; // (it never is: the day is the birthday's)
		push(g, G ? { unit: 'YEARS', n: g.y - G.y } : null, 'decade');
		G = g;
	}
	if (!G) {
		G = { d: D, m: M, y: birth.y };
		push(G, null, 'swing');
	}
	// The over-correction: each step λ times what was needed, in whole years
	// while that is most of a year or more, then whole months, then days; a
	// step that would not bring it nearer is made exactly (never, in 1900–2099).
	for (let guard = 0; guard < 60; guard++) {
		const eps = dayNum(G) - cn;
		if (eps === 0) break;
		const k = Math.abs(eps) > 60 * 365.2425 ? BIG : lam;
		const want = -k * eps;
		let g;
		let corr;
		if (Math.abs(want) >= 0.75 * 365.2425) {
			const n = Math.round(want / 365.2425) || Math.sign(want);
			g = addYears(G, n);
			corr = { unit: 'YEARS', n };
		} else if (Math.abs(want) >= 28) {
			const n = Math.round(want / 30.44) || Math.sign(want);
			g = addMonths(G, n);
			corr = { unit: 'MONTHS', n };
		} else {
			const n = Math.round(want) || Math.sign(want);
			g = addDays(G, n);
			corr = { unit: 'DAYS', n };
		}
		if (Math.abs(dayNum(g) - cn) >= Math.abs(eps)) {
			g = addDays(G, -eps);
			corr = { unit: 'DAYS', n: -eps };
		}
		push(g, corr, 'swing');
		G = g;
	}
	return { steps };
}

// The correction as the hand writes it: "+ 13 YEARS", "− 1 MONTH", "+ 3 DAYS".
export function corrText({ unit, n }) {
	const one = Math.abs(n) === 1;
	const word = one ? unit.slice(0, -1) : unit;
	return `${n < 0 ? '−' : '+'} ${Math.abs(n)} ${word}`;
}
