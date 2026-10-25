// ── Sketch four: the dates the hand tries, and the rooms they send it to ─────
// flow-strand-sketch-four's arithmetic, on its own so a script can check it.
//
// The run's question is the birthday less 266 days. The hand gets there, but
// not straight: it takes the 266 in the wrong UNITS first — years, then
// months, then weeks, then days the wrong way, then the rule of thumb — each
// a sum done right in its wrong unit, each answer a date in another decade,
// and the fall goes INTO the room of each answer (the room is where the sum
// sends it): centuries off, decades off, years off, months off, days off,
// then the count done properly, a day at a time. The error shrinks by about
// a factor of ten each time, a zoom in time under the zoom in space.
//
//   attempts(birth, decades, answerRoom)   the wrong answers, in order:
//        [{ key, sign, label, date, room }]   (label: "− 266 YEARS" …)
//   orderOf(birth, decades, answerRoom, n)  the rooms the fall passes: each
//        attempt's own room, and before it the decades between the last
//        answer's and this one's (the hand's pencil sweeping across them),
//        then the answer's room for the count; padded or cut to n rooms.
//        Returns { order, of } — `of[k]` the attempt room k belongs to
//        (attempts.length: the count), `own[k]` true at an attempt's room.
//   roomOfYear(y, decades)   the room a year is shown in: the decade whose
//        middle is nearest (the site's rule for its four rooms — before 1960
//        the 50s, before 1980 the 60s, before 2005 the 90s, then the 10s —
//        and the decade itself once there is a room for every decade).
//
// Dates are { d, m, y }, the proleptic Gregorian calendar, counted in days
// here (no Date: a script checks these against Date for 1900–2099).

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

// Days since 1 March of year 0 (Howard Hinnant's days_from_civil, shifted).
function dayNumber({ d, m, y }) {
	const yy = m <= 2 ? y - 1 : y;
	const era = Math.floor(yy / 400);
	const yoe = yy - era * 400;
	const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
	const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
	return era * 146097 + doe;
}
function fromDayNumber(z) {
	const era = Math.floor(z / 146097);
	const doe = z - era * 146097;
	const yoe = Math.floor(
		(doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
	);
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
	const mp = Math.floor((5 * doy + 2) / 153);
	const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
	const m = mp + (mp < 10 ? 3 : -9);
	const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
	return { d, m, y };
}
export const addDays = (b, n) => fromDayNumber(dayNumber(b) + n);
// Months and years keep the day, brought back into the month (31 · 03 less a
// month is 28 · 02, or 29 in a leap year).
export function addMonths(b, n) {
	const k = b.y * 12 + (b.m - 1) + n;
	const y = Math.floor(k / 12);
	const m = k - y * 12 + 1;
	return { d: Math.min(b.d, DAYS(m, y)), m, y };
}
export const addYears = (b, n) => addMonths(b, 12 * n);

// Back 266 days, a month at a time (the count): the birth month's own d days
// take it to the last day of the month before; then each whole month's
// length while what is left is at least that; the last month's length less
// what is left is the day.
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

// ── The rooms ────────────────────────────────────────────────────────────────
// A decade's key ('50s', '10s' …) → its first year.
export const decadeStart = (key) => {
	const n = Number(String(key).slice(0, 2));
	return n >= 50 ? 1900 + n : 2000 + n;
};
export function roomOfYear(y, decades) {
	let best = null;
	let bd = Infinity;
	for (const k of decades) {
		const dd = Math.abs(y - (decadeStart(k) + 5));
		// (a tie goes to the later decade: 1960 is the 60s', 1980 the 90s')
		if (dd < bd || (dd === bd && decadeStart(k) > decadeStart(best))) {
			bd = dd;
			best = k;
		}
	}
	return best;
}
const byYear = (decades) => [...decades].sort((a, b) => decadeStart(a) - decadeStart(b));

// ── The attempts ─────────────────────────────────────────────────────────────
// Each a unit for the 266 and a direction; `pref` the direction the hand
// tries first, the other when the first would land in the answer's room or
// one already passed (so every birthday passes rooms of other decades).
const METHODS = [
	{ key: 'years', unit: 'YEARS', pref: [-1, 1], at: (b, s) => addYears(b, 266 * s) },
	{ key: 'months', unit: 'MONTHS', pref: [1, -1], at: (b, s) => addMonths(b, 266 * s) },
	{ key: 'weeks', unit: 'WEEKS', pref: [-1, 1], at: (b, s) => addDays(b, 7 * 266 * s) },
	{ key: 'days', unit: 'DAYS', pref: [1], at: (b, s) => addDays(b, 266 * s) },
	{ key: 'nine', unit: 'MONTHS', n: 9, pref: [-1], at: (b, s) => addMonths(b, 9 * s) }
];
export function attempts(birth, decades, answerRoom) {
	const out = [];
	const seen = new Set();
	for (const M of METHODS) {
		const tries = M.pref.map((s) => {
			const date = M.at(birth, s);
			return { s, date, room: roomOfYear(date.y, decades) };
		});
		const pick =
			tries.find((c) => c.room !== answerRoom && !seen.has(c.room)) ??
			tries.find((c) => c.room !== answerRoom) ??
			tries[0];
		seen.add(pick.room);
		out.push({
			key: M.key,
			sign: pick.s,
			label: `${pick.s < 0 ? '−' : '+'} ${M.n ?? GESTATION} ${M.unit}`,
			date: pick.date,
			dateStr: fmt(pick.date),
			room: pick.room
		});
	}
	return out;
}

// The rooms the fall passes, `n` of them (the answer's last). Each attempt
// gets the decades strictly between the last answer's room and its own (the
// pencil sweeping across them), then its own; the count gets the answer's.
// Each attempt is then given `want[j]` rooms — its sweep thinned, or its own
// room repeated (a room in its own glass) — so the rooms keep the pace the
// fall flies at whatever the birthday.
export function orderOf(birth, decades, answerRoom, want) {
	const list = byYear(decades);
	const at = attempts(birth, decades, answerRoom);
	const idx = (k) => list.indexOf(k);
	let prev = roomOfYear(birth.y, decades);
	const order = [];
	const of = [];
	const own = [];
	const groups = [...at.map((a) => a.room), answerRoom];
	groups.forEach((room, j) => {
		const a = idx(prev);
		const b = idx(room);
		const step = b > a ? 1 : -1;
		const sweep = [];
		for (let i = a + step; i !== b && a !== b; i += step) sweep.push(list[i]);
		const n = Math.max(1, want[j] ?? 1);
		// keep the sweep's rooms not yet passed first, the answer's last (it
		// is kept for the end), then those nearest the try's own; in the
		// order the pencil sweeps them; then pad with the try's own room
		const rank = (r) => (r === answerRoom ? 2 : 0) + (order.includes(r) ? 1 : 0);
		const keep = sweep
			.map((r, i) => ({ r, i }))
			.sort((x, y) => rank(x.r) - rank(y.r) || y.i - x.i)
			.slice(0, n - 1)
			.sort((x, y) => x.i - y.i)
			.map((x) => x.r);
		const rooms = [...keep];
		while (rooms.length < n) rooms.push(room);
		rooms.forEach((r, i) => {
			order.push(r);
			of.push(j);
			own.push(i >= keep.length);
		});
		prev = room;
	});
	return { order, of, own, attempts: at };
}
