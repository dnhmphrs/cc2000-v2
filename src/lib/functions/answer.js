import data from '$lib/data/cc2000_data.json';
import { conceptionDate, previousDay, dateToDecade } from './utils';

// ── The answer ───────────────────────────────────────────────────────────────
// Birthday plus a spicy level in, a track out. The one place the archive is
// actually consulted.
//
// It lives here rather than in the calculator because it is not a view's job,
// and because the dev harness needs it too: pinning the site to the computation
// or the room means seeding a real answer first, and it must be the SAME answer
// the machine would have produced.
//
// Returns either { edge } — 'past' or 'future', which the machine reports on its
// own screen and goes nowhere — or { track, conceived, decade }.

// The chart archive starts here, and nobody has been conceived after today.
export const ARCHIVE_START = '1958-06-01';

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
	if (dateStr >= today) return { edge: 'future' };

	for (let i = 0; i < LOOKBACK; i++) {
		const day = data[cd];
		if (day && day[spicy - 1]) {
			return { track: day[spicy - 1], conceived: cd, decade: dateToDecade(cd) };
		}
		cd = previousDay(cd);
	}
	return { edge: 'past' };
}

// The earliest birthday the archive can answer for: a conception the day after
// it starts. Derived so it cannot drift from resolve() above.
export function earliestBirthday() {
	const d = new Date(`${ARCHIVE_START}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 269);
	return d.toISOString().slice(0, 10);
}
