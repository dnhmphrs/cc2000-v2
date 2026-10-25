// ── The copy of flow-strand-sketch-d (sketch D, 0.14), kept beside the run ──
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with D's rows: the maths, the mass of dates, the date found in
// the middle of the board, the song computed over the rooms, the song after
// the flash. The tokens and the arithmetic are the run's (re-exported).
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
	fieldsOf,
	fill
} from './sketch-copy.js';

export const COPY = [
	// the machine's status lines, typed at the bottom
	{ caption: 'COMPILING USER GENETICS', at: 15.3, until: 22.3 },
	{ caption: 'SIMULATING CONCEPTION', at: 22.6, until: 35.6 },
	{ caption: 'COMPUTING SOUNDTRACK', at: 36.4, until: 43.4 },

	// ── THE FIRST PART, THE DATE. The maths first, straight-faced and quick,
	// each slam a little sooner after the last …
	// the weekday of the conception by Zeller's congruence, mod 7
	{
		at: 25.7,
		out: 27.4,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'h ≡ q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ + 5J  (mod 7)', size: 0.04 },
			{
				text: '{zq} + {zt} + {zK} + {zK4} + {zJ4} + {z5J} ≡ {zh}  (mod 7)',
				size: 0.044,
				write: [26.1, 26.5]
			}
		],
		marks: [
			{ line: 1, text: '{zq} + {zt} + {zK} + {zK4} + {zJ4} + {z5J}', at: 26.7 },
			{ line: 1, text: '{zh}', at: 27.0, kind: 'circle' }
		]
	},
	// an elliptic curve with the date in it, a point on it doubled
	{
		at: 27.0,
		out: 28.6,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'y² ≡ x³ + {ecA}x + {ecB}  (mod {p})', size: 0.044 },
			{ text: 'P = ({ecPx}, {ecPy})   2P = ({ec2x}, {ec2y})', size: 0.04, write: [27.4, 27.8] }
		],
		marks: [
			{ line: 1, text: 'P = ({ecPx}, {ecPy})', at: 28.0 },
			{ line: 1, text: '2P = ({ec2x}, {ec2y})', at: 28.3, kind: 'circle' }
		]
	},
	// the day's inverse mod p, and the Legendre symbol of the day and month
	{
		at: 28.1,
		out: 29.5,
		x: 0,
		y: -0.26,
		lines: [
			{ text: '{dd} · {inv} ≡ 1  (mod {p})', size: 0.046 },
			{ text: '({ddmm} | {p}) = {leg}', size: 0.046, write: [28.45, 28.75] }
		],
		marks: [
			{ line: 0, text: '{inv}', at: 28.9 },
			{ line: 1, text: '{leg}', at: 29.2 }
		]
	},
	// the curve's points counted, and its Tate–Shafarevich group — assumed
	{
		at: 29.0,
		out: 30.2,
		x: 0,
		y: 0.26,
		lines: [
			{ text: '|E(F{p})| = {np}  ≈  {p} + 1', size: 0.044 },
			{ text: 'Ш(E) = 0   (ASSUMING BSD)', size: 0.044, write: [29.3, 29.6] }
		],
		marks: [
			{ line: 0, text: '{np}', at: 29.7 },
			{ line: 1, text: 'ASSUMING BSD', at: 29.9 },
			{ line: 1, text: '0', at: 30.0, kind: 'circle' }
		]
	},
	// a lattice made of the date, reduced
	{
		at: 29.7,
		out: 30.9,
		x: 0,
		y: -0.27,
		lines: [
			{ text: '{b1}  {b2}  → LLL →  {r1}  {r2}', size: 0.042 },
			{ text: '{yyyy} / {ddmm} = {cf}', size: 0.04, write: [30.0, 30.3] }
		],
		marks: [
			{ line: 0, text: '{b1}  {b2}', at: 30.3 },
			{ line: 0, text: '{r1}  {r2}', at: 30.5, kind: 'circle' },
			{ line: 1, text: '{cf}', at: 30.7 }
		]
	},

	// … quickening into the mass of dates: the years back from now to the
	// birth year, a headline flying with every `every`-th year (1: every
	// year's; HEADLINES has one or two each)
	{ stream: 'years', at: 30.3, out: 32.9, slow: 3, fast: 22, every: 2 },
	// the months back from the birthday, each with the days it gives
	{ stream: 'months', at: 32.7, out: 33.7 },
	// the days: 266 … 1, a blizzard by the end
	{ stream: 'days', at: 33.3, out: 35.0, slow: 3, fast: 120 },

	// THE DATE, once: in the middle of the board, over the mess, held and
	// ringed — found, and as it is found the circle opens into the slot and
	// the rooms begin under it (it fades out over the first of them)
	{
		at: 34.9,
		out: 36.6,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: '{conception}', size: 0.082 },
			{ text: '{weekday}', size: 0.046, write: [35.25, 35.5] }
		],
		marks: [{ line: 0, at: 35.4, kind: 'circle', pad: 0.34 }]
	},

	// ── THE SECOND PART, THE SONG. Over the rooms rushing past: the song
	// computed from the date, by what the machine takes to matter ──
	// the parents' steaminess, read off the lever, is a chart position
	{
		at: 36.6,
		out: 38.0,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'STEAMINESS  {spice} / 10', size: 0.046 },
			{ text: '⇒  CHART POSITION  {spice}', size: 0.044, write: [37.0, 37.3] }
		],
		marks: [
			{ line: 0, text: '{spice} / 10', at: 37.4 },
			{ line: 1, text: '{spice}', at: 37.6, kind: 'circle' }
		]
	},
	// the almanac: the night's moon, the sun's sign, the year's animal
	{
		at: 37.7,
		out: 39.1,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'JD {jd}   ·   MOON: {moon}', size: 0.042 },
			{ text: 'SUN IN {sun}   ·   YEAR OF THE {animal}', size: 0.042, write: [38.1, 38.45] }
		],
		marks: [
			{ line: 0, text: '{moon}', at: 38.5 },
			{ line: 1, text: '{animal}', at: 38.7 }
		]
	},
	// the day in its year, and the sun's own weather
	{
		at: 38.8,
		out: 40.2,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'DAY {doy} OF {cyyyy}   ·   WEEK {week}', size: 0.044 },
			{ text: 'SOLAR CYCLE {cycle}', size: 0.044, write: [39.2, 39.45] }
		],
		marks: [
			{ line: 0, text: 'WEEK {week}', at: 39.55 },
			{ line: 1, text: '{cycle}', at: 39.8, kind: 'circle' }
		]
	},
	// the chart week the archive answers from
	{
		at: 39.9,
		out: 41.3,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'CHART WEEK  {chart}', size: 0.046 },
			{ text: 'POSITION {spice}  →  ONE RECORD', size: 0.042, write: [40.3, 40.6] }
		],
		marks: [
			{ line: 0, text: '{chart}', at: 40.7, kind: 'circle' },
			{ line: 1, text: 'POSITION {spice}', at: 40.9 }
		]
	},

	// ── the end: the flash, and the song and its artist on the lit room,
	// held to the fade ──
	{
		at: 44.5,
		out: 52.2,
		hold: true,
		x: 0,
		y: -0.06,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [45.0, 45.5] }
		],
		marks: [{ line: 0, at: 45.3, kind: 'circle', pad: 0.3 }]
	}
];
