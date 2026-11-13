import data from '$lib/data/cc2000_data.json';
import { conceptionDate, previousDay, dateToDecade } from './utils';

// ── The answer ───────────────────────────────────────────────────────────────
// Birthday plus a spicy level in, a track out. The one place the archive is
// actually consulted.
//
// It lives here rather than in the run because it is not a drawing's job.
//
// Returns either { track, conceived, decade } or { edge }, one of three, each
// with its own gif (data/gifs.js) and its own lines (run/copy.js), as the
// original site had them: the run goes in regardless, breaks down where the
// dive would be, and the verdict is given over the gif.
//
//   past      conceived before the archive starts — the time of dinosaurs
//   future    born after today, or conceived after the archive's last
//             week: the After Time
//   unknown   neither, and still no chart to be found: the servers
//             overheated
//
// The original site meant `future` to begin where the archive ends ("if
// date is after 2023-03-05") and tested today instead; with a year-long
// look-back, a birthday past about mid-2024 fell through to `past` — the
// dinosaurs for anyone too young.

// The chart archive starts here, and ends with its last week.
const ARCHIVE_START = '1958-06-01';
const ARCHIVE_END = Object.keys(data).sort().at(-1);
const plusDays = (iso, n) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
};
const LAST_WEEK = plusDays(ARCHIVE_END, 6);

// Each day holds its top ten IN CHART ORDER, so the level picks a position: 1 is
// the number one, 10 is the number ten. Days with no chart fall back to the most
// recent one that has one.
//
// NOTE the tracks carry a `spicy` field of their own, and it runs the other way
// — 10 on the number one, 1 on the number ten. It is the chart position stored
// upside down and it is NOT what the lever means, so do not reach for it here.
const LOOKBACK = 400;

export function resolve(dateStr, spicy) {
	let cd = conceptionDate(dateStr);
	const today = new Date().toISOString().slice(0, 10);

	if (cd <= ARCHIVE_START) return { edge: 'past' };
	if (dateStr >= today || cd > LAST_WEEK) return { edge: 'future' };

	for (let i = 0; i < LOOKBACK; i++) {
		const day = data[cd];
		if (day && day[spicy - 1]) {
			return { track: day[spicy - 1], conceived: cd, decade: dateToDecade(cd) };
		}
		cd = previousDay(cd);
	}
	return { edge: 'unknown' };
}
