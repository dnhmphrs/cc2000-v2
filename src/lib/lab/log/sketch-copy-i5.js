// ── The copy of flow-strand-sketch-i5 (I5: THE LATHE AND THE RECORD) ─────────
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with I5's words. The calculator is a CUTTING LATHE and a
// GRAMOPHONE: the date's eight digits are the eight harmonics of a profile
// wave, turned on the lathe into the stylus (the swimmer); the stylus is set
// down in the groove at the outer edge, NOW, and tracks INWARD a turn a year
// to the birth year, then 38 weeks on to the conception; the chart of that
// week is what the groove holds, the spice is the stylus's weight — how deep
// it bites, how far down the chart it reads; the label at the spindle carries
// the date; through the spindle hole is the room; on the room's screen the
// record turns and the needle drops: the song. The tokens and the arithmetic
// are the run's, with {years} (NOW − the birth year, the turns of the
// groove) and {weeks} (266 days as weeks) added.
import { NOW, fieldsOf as fieldsOf0 } from './sketch-copy.js';
export {
	NOW,
	HEADLINES,
	GESTATION,
	DAYS,
	MON,
	fmt,
	birthOf,
	conceive,
	zeller,
	fill
} from './sketch-copy.js';

export function fieldsOf(digits, extra = {}) {
	const F = fieldsOf0(digits, extra);
	F.years = Math.max(0, NOW - F._birth.y);
	F.weeks = 38;
	F.now = NOW;
	F.cweek = F.week;
	return F;
}

export const COPY = [
	// ── the machine's status line, typed at the bottom ──
	{ caption: 'CUTTING THE MASTER FROM YOUR DATE', at: 15.3, until: 22.3 },
	{ when: 'song', caption: 'PLAYING IT BACK · ONE TURN A YEAR', at: 22.6, until: 35.6 },
	{ when: 'song', caption: 'READING THE CHART OF THAT WEEK', at: 36.0, until: 41.2 },
	{ when: 'edge', caption: 'THE NEEDLE SKIPS', at: 43.4, until: 52 },

	// ── THE GROOVE: the readings as the stylus tracks inward — one at a time
	// in the middle of the board, above the hole the room grows in ──
	{
		when: 'song',
		at: 29.0,
		out: 31.0,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'TRACKING BACK FROM {now}', size: 0.04 },
			{ text: '{years} TURNS', size: 0.066, write: [29.4, 29.75] }
		],
		marks: [{ line: 1, at: 30.0, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 31.4,
		out: 33.4,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'YOUR YEAR', size: 0.04 },
			{ text: '{yyyy}', size: 0.066, write: [31.8, 32.1] }
		],
		marks: [{ line: 1, at: 32.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 33.8,
		out: 35.8,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'THEN {weeks} WEEKS FURTHER IN', size: 0.04 },
			{ text: '{birth} − 266 DAYS', size: 0.056, write: [34.2, 34.7] }
		],
		marks: [{ line: 1, text: '266 DAYS', at: 34.9, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 36.2,
		out: 38.0,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'THE CHART THAT WEEK', size: 0.04 },
			{ text: 'WEEK {cweek} OF {cyyyy}', size: 0.066, write: [36.6, 36.95] }
		],
		marks: [{ line: 1, at: 37.2, kind: 'circle', pad: 0.3 }]
	},
	// the last reading — the stylus's weight: how far down the chart it reads
	{
		when: 'song',
		at: 38.4,
		out: 40.2,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'THE STYLUS BITES {spice} DEEP', size: 0.04 },
			{ text: 'NUMBER {spice} IN THE CHART', size: 0.06, write: [38.7, 39.3] }
		],
		marks: [{ line: 1, text: 'NUMBER {spice}', at: 39.6, kind: 'circle', pad: 0.3 }]
	},

	// ── THE VERDICTS (the needle skips: the gif in the label, the verdict over it) ──
	{
		when: 'past',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO GROOVE BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [46.9, 47.6] },
			{ text: 'NOTHING WAS PRESSED', size: 0.038, write: [47.7, 48.1] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'future',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NOT PRESSED YET', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.038, write: [46.9, 47.5] },
			{ text: 'CONCEIVED TO BABY, BY JUSTIN BIEBER', size: 0.038, write: [47.6, 48.2] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'unknown',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'THE RECORD WARPED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CUT', size: 0.038, write: [46.9, 47.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [47.7, 48.1] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the needle down, the song on the label, held ──
	{
		when: 'song',
		at: 47.4,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [47.9, 48.4] },
			{ text: '{conception}', size: 0.04, write: [48.5, 48.9] }
		],
		marks: [{ line: 0, at: 48.4, kind: 'circle', pad: 0.3 }]
	}
];
