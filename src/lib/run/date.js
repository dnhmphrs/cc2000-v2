// ── The date's arithmetic, exact ─────────────────────────────────────────────
// 266 days (38 weeks) from conception to birth. Checked in a scratch script
// against Date for every day 1900–2099: the date and the weekday agree.
const GESTATION = 266;
const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
// The days in month m (1 … 12) of year y.
export const DAYS = (m, y) =>
	[31, LEAP(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const WEEKDAY = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const pad2 = (x) => String(x).padStart(2, '0');
// A date as it is lettered: 14 · 02 · 1987.
export const fmt = ({ d, m, y }) => `${pad2(d)} · ${pad2(m)} · ${y}`;

// The birthday the calculator uses: the typed date (DDMMYYYY), a month past
// 12 or a day past its month brought back into range (Enter takes any eight
// digits).
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
	let rem = days - d;
	let [mm, yy] = m === 1 ? [12, y - 1] : [m - 1, y];
	while (rem >= DAYS(mm, yy)) {
		rem -= DAYS(mm, yy);
		[mm, yy] = mm === 1 ? [12, yy - 1] : [mm - 1, yy];
	}
	return { d: DAYS(mm, yy) - rem, m: mm, y: yy };
}

// The weekday, by Zeller's congruence (Gregorian): h = (q + ⌊13(m+1)/5⌋ + K +
// ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7, January and February counted as months 13 and 14
// of the year before; K the year of the century, J the century; h = 0 is
// Saturday.
export function weekdayOf({ d, m, y }) {
	const mm = m < 3 ? m + 12 : m;
	const yy = m < 3 ? y - 1 : y;
	const K = yy % 100;
	const J = Math.floor(yy / 100);
	const sum =
		d + Math.floor((13 * (mm + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J;
	return WEEKDAY[((sum % 7) + 7) % 7];
}
