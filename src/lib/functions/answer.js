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

// Each day holds 10 tracks ordered spicy 10 → 1 (index 0 → 9), so the track for
// a given level is at index (10 - spicy). Days with no chart fall back to the
// most recent one that has one.
const LOOKBACK = 400;

export function resolve(dateStr, spicy) {
	let cd = conceptionDate(dateStr);
	const today = new Date().toISOString().slice(0, 10);

	if (cd <= ARCHIVE_START) return { edge: 'past' };
	if (dateStr >= today) return { edge: 'future' };

	for (let i = 0; i < LOOKBACK; i++) {
		const day = data[cd];
		if (day && day[10 - spicy]) {
			return { track: day[10 - spicy], conceived: cd, decade: dateToDecade(cd) };
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
