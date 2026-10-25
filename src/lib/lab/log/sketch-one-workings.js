// ── The workings: the hand bad at maths, and then right ──────────────────────
// flow-strand-sketch-one's arithmetic, with nothing of the board in it (so a
// script can check it against Date for every birthday). The hand has the sum
// — the birthday less 266 days — and does not get straight there: it TRIES,
// three times, the same sum with the UNIT wrong (266 days read as 26.6 years,
// as 266 weeks, months, seasons; 38 weeks as 38 years; 9 months as 9 years or
// 9 decades — and, once or twice, the sign), each try a real date in some
// other decade, crossed out; then the near miss everyone makes — 9 months,
// not 266 days — the right decade, a week or so out; and then it counts,
// properly, one day at a time, and lands on the day.
//
// THE PASSES. Every try's date is in a decade of the archive (1950s–2020s),
// and that decade's room is the room the journey falls through while the
// hand works it out — the reason it passes other decades first: the rooms
// are its wrong answers. The tries are picked from every slip that lands in
// the archive: three different slips in three different decades, their
// errors shrinking (≥ 20 years, then less, then less) and, where they can,
// swinging either side of the answer — a pendulum settling — and, where it
// can, a different room each time (the next try's room never the last's).
// passes() gives them as a LIST — { kind: 'try' | 'near' | 'count', date,
// decade ('1960s'), art (the room's key: the decade's own art where rooms.js
// has it, '70s' once there is one, else the site's rule on the year), work
// (the sum as written), err } — ending on the count, in the answer's room.
//
// EXACT: conceive() is the count back through the months (the birth month's
// own days, then each whole month's length while what is left is at least
// that, the last month's length less what is left is the day): 266 days, as
// Date has it, for every birthday 1900–2099 (scratch check, v7/one).

export const GESTATION = 266;
export const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const DAYS = (m, y) =>
	[31, LEAP(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export const MON = [
	'JAN',
	'FEB',
	'MAR',
	'APR',
	'MAY',
	'JUN',
	'JUL',
	'AUG',
	'SEP',
	'OCT',
	'NOV',
	'DEC'
];
const pad2 = (x) => String(x).padStart(2, '0');
export const fmt = ({ d, m, y }) => `${pad2(d)} · ${pad2(m)} · ${y}`;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// The birthday the calculator uses: the typed date, a month past 12 or a
// day past its month brought back into range (Enter takes any eight digits).
export function birthOf(digits) {
	const s = String(digits ?? '')
		.replace(/\D/g, '')
		.padEnd(8, '0')
		.slice(0, 8);
	const y = clamp(Number(s.slice(4, 8)), 100, 9999);
	const m = clamp(Number(s.slice(2, 4)), 1, 12);
	const d = clamp(Number(s.slice(0, 2)), 1, DAYS(m, y));
	return { d, m, y };
}

// Back 266 days, a month at a time (above).
export function conceive({ d, m, y }, days = GESTATION) {
	const rows = [];
	let rem = days - d;
	rows.push({ m, y, take: d, rem });
	let [mm, yy] = m === 1 ? [12, y - 1] : [m - 1, y];
	while (rem >= DAYS(mm, yy)) {
		const L = DAYS(mm, yy);
		rem -= L;
		rows.push({ m: mm, y: yy, take: L, rem });
		[mm, yy] = mm === 1 ? [12, yy - 1] : [mm - 1, yy];
	}
	const len = DAYS(mm, yy);
	return { rows, last: { m: mm, y: yy, len, rem }, date: { d: len - rem, m: mm, y: yy } };
}

// ── Calendar steps ───────────────────────────────────────────────────────────
const dayNo = ({ d, m, y }) => Date.UTC(y, m - 1, d) / 864e5;
const fromNo = (n) => {
	const D = new Date(n * 864e5);
	return { d: D.getUTCDate(), m: D.getUTCMonth() + 1, y: D.getUTCFullYear() };
};
// `date` moved by `sign` × { y, m, d }: the years and months first (the day
// kept, or the month's last if it has no such day), then the days.
export function shift(date, { y = 0, m = 0, d = 0 }, sign) {
	let mm = date.m - 1 + sign * (12 * y + m);
	const yy = date.y + Math.floor(mm / 12);
	mm = ((mm % 12) + 12) % 12;
	const dd = Math.min(date.d, DAYS(mm + 1, yy));
	return d ? fromNo(dayNo({ d: dd, m: mm + 1, y: yy }) + sign * d) : { d: dd, m: mm + 1, y: yy };
}
const years = (a, b) => (dayNo(a) - dayNo(b)) / 365.2425;

// ── The slips ────────────────────────────────────────────────────────────────
// The sum the hand has is `birthday − 266 DAYS`; each slip is that sum with
// the quantity or the unit (or the sign) wrong, as written: `n unit`, and the
// step it takes.
export const SLIPS = [
	{ id: 'point', n: '26.6', unit: 'YEARS', step: { y: 26, m: 7 } }, // 266 days, a point in it
	{ id: 'point2', n: '2.66', unit: 'YEARS', step: { y: 2, m: 8 } },
	{ id: 'months', n: '266', unit: 'MONTHS', step: { m: 266 } }, // 22 years 2 months
	{ id: 'weeks', n: '266', unit: 'WEEKS', step: { d: 7 * 266 } }, // 5.1 years
	{ id: 'seasons', n: '266', unit: 'SEASONS', step: { y: 66, m: 6 } }, // 66.5 years
	{ id: 'wyears', n: '38', unit: 'YEARS', step: { y: 38 } }, // 38 weeks, as years
	{ id: 'myears', n: '9', unit: 'YEARS', step: { y: 9 } }, // 9 months, as years
	{ id: 'decades', n: '9', unit: 'DECADES', step: { y: 90 } } // 9 months, as decades
];
// … and the near miss: 9 months, which is not 266 days (it is 273 to 276).
export const NEAR = { id: 'near', n: '9', unit: 'MONTHS', step: { m: 9 } };

export const ARCHIVE = [1950, 2029]; // the decades there are rooms for, or will be
export const decadeOf = (y) => Math.floor(y / 10) * 10;
// A year's room: its own decade's art where there is one (rooms.js DECADES:
// '50s', '60s', '90s', '10s' — and '70s', '20s' … when they come), else the
// site's rule (before 1960 the 50s, before 1980 the 60s, before 2005 the 90s,
// then the 10s), as rooms.js decadeOfDate has it for a birthday.
export function artOfYear(y, decades) {
	const key = `${pad2(((decadeOf(y) % 100) + 100) % 100)}s`;
	if (decades.includes(key)) return key;
	return y < 1960 ? '50s' : y < 1980 ? '60s' : y < 2005 ? '90s' : '10s';
}

// Every slip, both ways, as a try: its date, how far out (years, signed),
// its decade and room, the sum as written.
function candidates(b, c, decades) {
	const out = [];
	for (const s of SLIPS)
		for (const sign of [-1, 1]) {
			const date = shift(b, s.step, sign);
			out.push({
				kind: 'try',
				slip: s.id,
				sign,
				date,
				err: years(date, c),
				decade: `${decadeOf(date.y)}s`,
				art: artOfYear(date.y, decades),
				inArchive: date.y >= ARCHIVE[0] && date.y <= ARCHIVE[1],
				work: `${fmt(b)} ${sign < 0 ? '−' : '+'} ${s.n} ${s.unit}`,
				lines: [fmt(b), `${sign < 0 ? '−' : '+'} ${s.n} ${s.unit}`]
			});
		}
	return out;
}

// The three tries: the best triple by the rules above (scored; the first
// that is best wins, so it is the same every time).
function pickTries(cands, c, A, nearArt, strict) {
	const cd = `${decadeOf(c.y)}s`;
	const pool = cands.filter(
		(x) => (strict ? x.inArchive && x.decade !== cd : true) && Math.abs(x.err) > 0.6
	);
	let best = null;
	let bestS = -Infinity;
	for (const a of pool)
		for (const b of pool)
			for (const d of pool) {
				const e1 = Math.abs(a.err);
				const e2 = Math.abs(b.err);
				const e3 = Math.abs(d.err);
				if (!(e1 > e2 && e2 > e3)) continue;
				if (a.slip === b.slip || b.slip === d.slip || a.slip === d.slip) continue;
				let s = 0;
				if (strict && (a.decade === b.decade || b.decade === d.decade || a.decade === d.decade))
					continue;
				// a new room each time
				s += a.art !== b.art ? 4 : -6;
				s += b.art !== d.art ? 4 : -6;
				s += d.art !== nearArt ? 3 : -2;
				s += new Set([a.art, b.art, d.art, A]).size;
				// the pendulum: either side of the answer in turn
				if (Math.sign(a.err) !== Math.sign(b.err)) s += 2;
				if (Math.sign(b.err) !== Math.sign(d.err)) s += 2;
				// homing in: a long way out first, closer each time
				s += e1 >= 20 ? 2 : -1;
				s += e3 <= 15 ? 1.5 : -1;
				for (const r of [e2 / e1, e3 / e2])
					s -= r < 0.25 ? (0.25 - r) * 8 : r > 0.8 ? (r - 0.8) * 12 : 0;
				// (relaxed, for a birthday far from the archive: in it where it can be)
				if (!strict) s += 3 * (a.inArchive + b.inArchive + d.inArchive);
				if (s > bestS) {
					bestS = s;
					best = [a, b, d];
				}
			}
	return best;
}

// The run's workings for a birthday: the count's rows, the end's working,
// the passes (three tries, the near miss, the count), the answer's room A.
export function workingsOf(digits, A, decades) {
	const b = birthOf(digits);
	const c = conceive(b);
	let j = 0;
	const rows = c.rows.map((r, i) => {
		const j0 = j + 1;
		j += r.take;
		return {
			...r,
			j0,
			j1: j,
			label: `${MON[r.m - 1]} ${r.take}`,
			year: i > 0 && r.y !== c.rows[i - 1].y ? String(r.y) : null
		};
	});
	const lastJ0 = Math.min(GESTATION, j + 1);
	const nearDate = shift(b, NEAR.step, -1);
	const near = {
		kind: 'near',
		slip: NEAR.id,
		sign: -1,
		date: nearDate,
		err: years(nearDate, c.date),
		decade: `${decadeOf(nearDate.y)}s`,
		art: artOfYear(nearDate.y, decades),
		work: `${fmt(b)} − ${NEAR.n} ${NEAR.unit}`,
		lines: [fmt(b), `− ${NEAR.n} ${NEAR.unit}`]
	};
	const cands = candidates(b, c.date, decades);
	const tries = pickTries(cands, c.date, A, near.art, true) ??
		pickTries(cands, c.date, A, near.art, false) ?? [cands[0], cands[2], cands[4]];
	const passes = [
		...tries,
		near,
		{ kind: 'count', date: c.date, decade: `${decadeOf(c.date.y)}s`, art: A }
	];
	return {
		birth: b,
		rows,
		last: c.last,
		date: c.date,
		dateStr: fmt(c.date),
		working: `${MON[c.last.m - 1]} ${c.last.len} − ${c.last.rem}`,
		landed: `= ${c.date.d}`,
		lastJ0,
		passes,
		decades: passes.map((p) => p.decade)
	};
}
