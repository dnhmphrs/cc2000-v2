// ── Sketch two's maths: the date, and the hand getting it wrong first ────────
// flow-strand-sketch-two's arithmetic, pure (no board, no DOM: a script checks
// it against Date for every birthday 1900–2099). The conception is 266 days
// (38 weeks) before the birth; the hand gets there BADLY. It is given the sum —
// the birthday − 266 DAYS — and it fumbles it the way a person does: the sign
// the wrong way, the wrong unit, a nought too many; then the two folk rules
// (40 weeks, 9 months); and only then the long way, day by day. Each wrong
// answer is a REAL date, worked out exactly on the calendar — and the run goes
// where it says: into the room of that date's decade. So the run passes other
// decades first because the hand's sums sent it there, the furthest first,
// each try fixing one thing, closing in, until the decade is right (the room
// stops changing) and then the day.
//
//   attemptsOf(birth, { roomOf, answer }) → [{ key, work, culprits, date,
//        room, off }]       the wrong tries in the order they are made; `work`
//                           the working's text (the birthday, the sign, the
//                           number, the unit), `culprits` [from, to] glyph
//                           ranges in it that are wrong (struck in red), `date`
//                           the answer it got, `room` its decade, `off` how
//                           many days it is out
//   conceive(birth)       → the long subtraction back through the months, the
//                           true date
//   nearestRoom(y, decades) the decade art a year belongs to: the decade whose
//                           middle is nearest (with the site's four rooms,
//                           exactly its rule: < 1960 the 50s, < 1980 the 60s,
//                           < 2005 the 90s, then the 10s), so a new decade's
//                           art drops in by being listed
//
// Five tries, always: three far — each a decade other than the answer's,
// a different one each (a selection of the archive: as many as the date
// reaches, up to three), then the decade right but the year wrong, then, if
// still short, the furthest of the rest — in the order of how far out they
// are; then the two near ones, the decade found (40 weeks is two weeks out, 9
// months a week or so); then the count.

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

// The birthday the calculator uses: the typed date, a month past 12 or a day
// past its month brought back into range (Enter takes any eight digits).
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

// Back 266 days, a month at a time: the birth month's own d days take it to
// the last day of the month before; then each whole month's length while
// what is left is at least that; the last month's length less what is left
// is the day.
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

// ── The calendar ─────────────────────────────────────────────────────────────
// A day's number (days from 1 March of year 0, proleptic Gregorian), and back.
export function dayNumber({ d, m, y }) {
	const a = m < 3 ? 1 : 0;
	const yy = y - a;
	const mm = m + 12 * a - 3;
	return (
		d +
		Math.floor((153 * mm + 2) / 5) +
		365 * yy +
		Math.floor(yy / 4) -
		Math.floor(yy / 100) +
		Math.floor(yy / 400)
	);
}
export function fromDayNumber(n) {
	// (Richards' inverse of the above)
	const g = n - 1;
	let y = Math.floor((10000 * g + 14780) / 3652425);
	let ddd = g - (365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400));
	if (ddd < 0) {
		y -= 1;
		ddd = g - (365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400));
	}
	const mi = Math.floor((100 * ddd + 52) / 3060);
	const m = ((mi + 2) % 12) + 1;
	y += Math.floor((mi + 2) / 12);
	const d = ddd - Math.floor((mi * 306 + 5) / 10) + 1;
	return { d, m, y };
}
export const addDays = (b, n) => fromDayNumber(dayNumber(b) + n);
// n months on (or back), the day kept — or the month's last, if it has no such day
export function addMonths({ d, m, y }, n) {
	const k = y * 12 + (m - 1) + n;
	const yy = Math.floor(k / 12);
	const mm = k - 12 * yy + 1;
	return { d: Math.min(d, DAYS(mm, yy)), m: mm, y: yy };
}

// ── The rooms ────────────────────────────────────────────────────────────────
// Every decade the archive will have, by its middle year; the art there is is
// whichever of these rooms.js lists.
export const DECADE_MID = {
	'50s': 1955,
	'60s': 1965,
	'70s': 1975,
	'80s': 1985,
	'90s': 1995,
	'00s': 2005,
	'10s': 2015,
	'20s': 2025
};
export function nearestRoom(y, decades) {
	let best = decades[0];
	let bd = Infinity;
	for (const d of decades) {
		const mid = DECADE_MID[d] ?? 1995;
		// (ties go to the later decade: the site's 1960 is the 60s, not the 50s)
		const dist = Math.abs(y - mid) - (y < mid ? 1e-6 : 0);
		if (dist < bd) {
			bd = dist;
			best = d;
		}
	}
	return best;
}

// ── The tries ────────────────────────────────────────────────────────────────
// Each: how it is written (the sign, the number, the unit after the birthday),
// what it does to the birthday, and which of its tokens are the mistake.
const FAR = [
	{
		key: 'm+',
		sign: '+',
		n: '266',
		unit: 'MONTHS',
		go: (b) => addMonths(b, 266),
		bad: ['sign', 'unit']
	},
	{ key: 'm-', sign: '−', n: '266', unit: 'MONTHS', go: (b) => addMonths(b, -266), bad: ['unit'] },
	{
		key: 'z+',
		sign: '+',
		n: '2660',
		unit: 'DAYS',
		go: (b) => addDays(b, 2660),
		bad: ['sign', 'nought']
	},
	{ key: 'z-', sign: '−', n: '2660', unit: 'DAYS', go: (b) => addDays(b, -2660), bad: ['nought'] },
	{
		key: 'w+',
		sign: '+',
		n: '266',
		unit: 'WEEKS',
		go: (b) => addDays(b, 7 * 266),
		bad: ['sign', 'unit']
	},
	{ key: 'w-', sign: '−', n: '266', unit: 'WEEKS', go: (b) => addDays(b, -7 * 266), bad: ['unit'] }
];
const NEAR = [
	{
		key: '40w',
		sign: '−',
		n: '40',
		unit: 'WEEKS',
		go: (b) => addDays(b, -280),
		bad: ['n', 'unit']
	},
	{ key: '9m', sign: '−', n: '9', unit: 'MONTHS', go: (b) => addMonths(b, -9), bad: ['n', 'unit'] }
];
export const TRIES = { FAR, NEAR };

// The working's text and where its parts are (glyph indices, for the red).
function workOf(b, tr) {
	const head = `${fmt(b)} `;
	const s0 = head.length;
	const n0 = s0 + tr.sign.length + 1;
	const u0 = n0 + tr.n.length + 1;
	const work = `${head}${tr.sign} ${tr.n} ${tr.unit}`;
	const parts = {
		sign: [s0, s0 + tr.sign.length - 1],
		n: [n0, n0 + tr.n.length - 1],
		unit: [u0, u0 + tr.unit.length - 1],
		nought: [n0 + tr.n.length - 1, n0 + tr.n.length - 1]
	};
	// the culprits: the sign alone; the number and the unit as one
	const out = [];
	for (const k of tr.bad) {
		if (k === 'n' && tr.bad.includes('unit')) out.push([parts.n[0], parts.unit[1]]);
		else if (k === 'unit' && tr.bad.includes('n')) continue;
		else out.push(parts[k]);
	}
	return { work, culprits: out, parts };
}

// The wrong tries for a birthday, in the order they are made. `roomOf(y)` the
// decade a year's room is, `answer` the answer's room (the site's rule on the
// birthday, or a forced one), `most` how many far ones at most.
export function attemptsOf(b, { roomOf, answer, most = 3 }) {
	const truth = dayNumber(conceive(b).date);
	const tried = (tr) => {
		const date = tr.go(b);
		return {
			key: tr.key,
			...workOf(b, tr),
			date,
			room: roomOf(date.y),
			off: Math.abs(dayNumber(date) - truth)
		};
	};
	// The far tries: one a room, every room other than the answer's that one
	// reaches — the one whose year is most of that decade — as many as `most`
	// (the furthest kept); then the decade right and the year wrong (the
	// nearest that lands in the answer's room); then, if there are still fewer
	// than `most`, the furthest of the rest. In the order of how far out.
	const all = FAR.map(tried);
	const byRoom = new Map();
	for (const a of all) {
		if (a.room === answer) continue;
		const mid = DECADE_MID[a.room] ?? 1995;
		const keep = byRoom.get(a.room);
		if (!keep || Math.abs(a.date.y - mid) < Math.abs(keep.date.y - mid)) byRoom.set(a.room, a);
	}
	const picked = [...byRoom.values()].sort((p, q) => q.off - p.off).slice(0, most);
	const home = all
		.filter((a) => a.room === answer && !picked.includes(a))
		.sort((p, q) => p.off - q.off)[0];
	if (home && picked.length < most) picked.push(home);
	const rest = all.filter((a) => !picked.includes(a)).sort((p, q) => q.off - p.off);
	while (picked.length < most && rest.length) picked.push(rest.shift());
	picked.sort((p, q) => q.off - p.off);
	// The near tries: in the answer's room (the decade found), the further first.
	const near = NEAR.map(tried)
		.map((a) => ({ ...a, room: answer }))
		.sort((p, q) => q.off - p.off);
	return [...picked, ...near];
}
