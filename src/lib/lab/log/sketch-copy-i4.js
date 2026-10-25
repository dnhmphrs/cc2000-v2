// ── The copy of flow-strand-sketch-i4 (I4: THE NARRATIVE), kept beside it ───
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read — at / out / x / y / lines / marks / caption / hold / when / off),
// with I4's rows: the calculator's OWN VOICE, a monologue in the hand as it
// works, in four numbered stages, each on its own page with its own
// transition — and what the user believes is being computed at each. The
// tokens and the arithmetic are the run's.
//
// THE NARRATIVE IN THE USER'S HEAD:
//   0 – 22.3   the entry as it is: the date, the spice, the payload compiled
//              from the digits (COMPILING USER GENETICS) — the sperm is the
//              THING TO BE SENT, and the swim from 22.5 is it entering the
//              calculator (the tunnel is the machine's inside)
//   26.4  CUT  on the beat: the swimmer snaps into an inset top right
//              (PAYLOAD · the date, still swimming) and the machine's page
//              takes the board —
//   I    26.4 – 30.0  SUBTRACTING 266 DAYS: the long subtraction back
//              through the months as a LEDGER, each month written and
//              struck, the conception date the answer, ringed
//   30.0  THE PAGE TORN AWAY (up and off, a ragged edge) —
//   II   30.0 – 33.6  LOCATING THE PARENTS: the four bedrooms as a LINE-UP of
//              polaroids under the site's rule (before 1960 the 50s …),
//              three struck, one ringed; the dossier of that room under it
//   33.6  IRIS: a circle closes on the ringed room and opens on —
//   III  34.0 – 37.2  SOLVING FOR THE NIGHT: Zeller's congruence big on the
//              blackboard, its sum struck, the weekday ringed; the chart
//              week and the position (the spice: how far down the chart)
//   37.2  WIPED (the eraser, left to right) onto the tunnel, full frame —
//   IV   37.2 – 46.3  DISPATCHING: the payload addressed (TO: the date, the
//              night) and sent down the tunnel, the room a speck at its end
//              swum up on (a porthole), the fall into it WATCHED (41.6 –
//              45.4), the swimmer into its screen, the flash 46.3
//   V    46.5 –       THE RECORD RETRIEVED: the song held on the lit screen
//   A VERDICT: the three stages as on any run; in IV the porthole opens onto
//              the verdict's gif instead of a room, the swimmer swims into it
//              and fades, the verdict lettered 43.0 and held; the run holds
//              at 46
//
// ROWS OF THIS TABLE's OWN (beyond the run's):
//   stage   1 | 2 | 3: a row of lettering ON THAT STAGE'S PAGE (no flight:
//           written at x, y of the board, held to the stage's end and taken
//           by its transition); `lines` and `marks` as a slam's; `write`
//           writes a line on over its seconds
//   ledger  stage I's long subtraction: { at, out, x, y, size, cols, row,
//           last, result } — one line a month from `row` ('{label} {rem}':
//           the month and its days, the days still to go), struck one by
//           one from `at` to `out`; `last` the last month's working; the
//           `result` the conception date, written at its `at`, ringed at
//           `ring`
//   lineup  stage II's line-up: { at, out, y, height, labels, names, rule,
//           strikes, ring } — the four rooms as polaroids `height` of the
//           board tall at y, `names` under them and `labels` (the rule's
//           clauses) over, the three that are not it struck at `strikes`,
//           the answer's ringed at `ring`
//   inset   the label under the swimmer's inset (stages I – III)
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

// The stages' seconds (the sketch reads these: the cut, the tear, the
// iris, the wipe; the fall and the flash are the sketch's own beats).
export const STAGES = {
	cut: 26.4, // I: the swimmer into the inset, the ledger's page up
	tear: 30.0, // the page torn away (0.5 s) onto II
	iris: [33.6, 34.0], // the iris closed on the ringed room, opened on III
	wipe: 37.2, // the eraser across III (0.6 s) onto the tunnel, full frame
	dispatch: 37.2 // IV
};

export const COPY = [
	// ── the machine's status line, typed at the bottom ──
	{ caption: 'PAYLOAD COMPILED · ENTERING THE CALCULATOR', at: 22.6, until: 26.3 },
	{ caption: 'STAGE I OF IV · SUBTRACTING 266 DAYS', at: 26.45, until: 29.9 },
	{ caption: 'STAGE II OF IV · LOCATING THE PARENTS', at: 30.1, until: 33.5 },
	{ caption: 'STAGE III OF IV · SOLVING FOR THE NIGHT', at: 34.05, until: 37.1 },
	{ when: 'song', caption: 'STAGE IV OF IV · DISPATCHING THE PAYLOAD', at: 37.3, until: 44.4 },
	{ when: 'song', caption: 'RETRIEVING THE RECORD', at: 44.6, until: 46.2 },
	{ when: 'song', caption: 'RECORD RETRIEVED', at: 46.8, until: 200 },
	{ when: 'edge', caption: 'STAGE IV OF IV · DISPATCHING THE PAYLOAD', at: 37.3, until: 42.6 },
	{ when: 'edge', caption: 'SIGNAL LOST · NO RECORD', at: 42.9, until: 200 },

	// ── the inset's label (stages I – III) ──
	{ inset: 'PAYLOAD · {birth}' },

	// ── I · SUBTRACTING 266 DAYS ──
	{
		stage: 1,
		at: 26.4,
		x: -0.16,
		y: -0.38,
		lines: [{ text: 'I · SUBTRACTING 266 DAYS', size: 0.05, write: [26.45, 26.95] }]
	},
	{
		stage: 1,
		at: 26.9,
		x: -0.24,
		y: -0.25,
		lines: [{ text: '{birth} − 266 DAYS', size: 0.04, write: [26.95, 27.3] }]
	},
	{
		ledger: {
			at: 27.3, // the first month struck
			out: 29.1, // the last
			x: -0.4, // the column's left edge
			y: 0.1, // the block's middle
			size: 0.036,
			cols: 2, // two columns past this many rows
			row: '{label}  {rem}', // the month and its days, the days still to go
			last: '{mon} {len} − {rem} = {d}', // the last month's working
			result: { x: 0.22, y: 0.04, size: 0.07, at: 29.15, ring: 29.6 }
		}
	},

	// ── II · LOCATING THE PARENTS ──
	{
		stage: 2,
		at: 30.0,
		x: -0.16,
		y: -0.38,
		lines: [{ text: 'II · LOCATING THE PARENTS', size: 0.05, write: [30.05, 30.6] }]
	},
	{
		lineup: {
			at: 30.5,
			out: 33.6,
			y: 0.02,
			height: 0.2, // each polaroid this much of the board tall
			labels: ['BEFORE 1960', 'BEFORE 1980', 'BEFORE 2005', 'AFTER 2005'],
			names: ['THE 1950S', 'THE 1960S', 'THE 1990S', 'THE 2010S'],
			rule: 'BORN {yyyy}', // over the line-up, the fact the rule is read on
			strikes: [31.6, 31.85, 32.1], // the three that are not it
			ring: 32.4 // the answer's
		}
	},
	{
		stage: 2,
		at: 32.6,
		x: 0,
		y: 0.36,
		lines: [
			{ text: '{where}  ·  LIGHTS {lights}  ·  DOOR {door}', size: 0.038, write: [32.65, 33.3] }
		]
	},

	// ── III · SOLVING FOR THE NIGHT ──
	{
		stage: 3,
		at: 34.0,
		x: -0.16,
		y: -0.38,
		lines: [{ text: 'III · SOLVING FOR THE NIGHT', size: 0.05, write: [34.05, 34.6] }]
	},
	{
		stage: 3,
		at: 34.5,
		x: 0,
		y: -0.1,
		lines: [
			{ text: 'h = (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ + 5J) mod 7', size: 0.04 },
			{
				text: '= ({zq} + {zt} + {zK} + {zK4} + {zJ4} + {z5J}) mod 7 = {zh}',
				size: 0.04,
				write: [34.9, 35.6]
			}
		],
		marks: [{ line: 1, at: 35.75, kind: 'strike' }]
	},
	{
		stage: 3,
		at: 35.9,
		x: 0,
		y: 0.14,
		lines: [{ text: '{weekday} NIGHT', size: 0.082, write: [35.9, 36.3] }],
		marks: [{ line: 0, text: '{weekday}', at: 36.4, kind: 'circle', pad: 0.3 }]
	},
	{
		stage: 3,
		at: 36.5,
		x: 0,
		y: 0.36,
		lines: [
			{ text: 'THE CHART OF {chart}  ·  POSITION {spice}', size: 0.038, write: [36.55, 37.1] }
		]
	},

	// ── IV · DISPATCHING (the tunnel, full frame: these fly as slams) ──
	{
		at: 37.7,
		out: 39.3,
		x: 0,
		y: -0.22,
		lines: [{ text: 'IV · DISPATCHING', size: 0.052 }]
	},
	{
		at: 39.6,
		out: 41.4,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'TO:', size: 0.036 },
			{ text: '{conception}  ·  {weekday}', size: 0.058, write: [39.9, 40.4] }
		],
		marks: [{ line: 1, text: '{conception}', at: 40.6, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 42.6,
		out: 44.2,
		x: 0,
		y: -0.3,
		lines: [{ text: 'VIA THE CHART OF {chart}  ·  NO. {spice}', size: 0.036, write: [42.9, 43.5] }]
	},

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The three stages as
	// on any run; then the porthole at the end of the tunnel opens onto the
	// verdict's gif instead of a room, the swimmer swims on into it and
	// fades, and the verdict is lettered over it and held ──
	{
		when: 'past',
		at: 43.0,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [43.5, 44.2] },
			{ text: 'THERE WAS NO MUSIC', size: 0.038, write: [44.3, 44.7] }
		],
		marks: [{ line: 0, at: 44.1, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'future',
		at: 43.0,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL YET', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.038, write: [43.5, 44.1] },
			{ text: 'CONCEIVED TO BABY, BY JUSTIN BIEBER', size: 0.038, write: [44.2, 44.8] }
		],
		marks: [{ line: 0, at: 44.1, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'unknown',
		at: 43.0,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CALCULATE', size: 0.038, write: [43.5, 44.2] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [44.3, 44.7] }
		],
		marks: [{ line: 0, at: 44.1, kind: 'circle', pad: 0.3 }]
	},

	// ── V · the record: the song and the date on the lit screen, held ──
	{
		when: 'song',
		at: 47.0,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [47.5, 48.0] },
			{ text: '{conception}  ·  NO. {spice}', size: 0.04, write: [48.1, 48.6] }
		],
		marks: [{ line: 0, at: 48.0, kind: 'circle', pad: 0.3 }]
	}
];
