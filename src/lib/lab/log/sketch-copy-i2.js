// ── The copy of flow-strand-sketch-i2 (THE MEG): every word, in one table ───
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read, and lists the tokens), with I2's rows: the machine READING the
// person for the memory of their conception. The tokens and the arithmetic
// are the run's, plus I2's own, from the spectrum the typing gave
// (log/i2-meg.js bandsOf):
//   {band}      the dominant band, DELTA … GAMMA     {hz}  its peak, e.g. 10.4
//   {spectrum}  the five powers as percentages, e.g. 12 · 5 · 24 · 36 · 23
//
// THE RUN'S LANDMARKS (seconds):
//    6.8  the sensor cap comes up on the head as the birthday is asked; each
//         key an evoked response on the eight channel traces; the spice the
//         gain (14.4 entered)
//   14.9 – 18.3  the SPECTRUM, five bands, the dominant one ringed in red
//         (16.4); 16.6 – 18.3 the bands as epicycles trace the section
//   18.3 – 22.2  the swimmer written from it (the carrier); 22.5 the swim
//   23.1 – 26.2  the tunnel sketched in, the eight traces along its walls
//   23.4 – 27.0  THE YEARS back from now (the memories read back through, a
//         headline with every second year), 27.2 the premise: no memory
//         before the birth; 28.7 – 41.0 the prenatal trace read, the
//         fragments of the memory surfacing (29.0 … 38.4)
//   38.6 – 41.0  the trace locks into the band; 41.0 the date on it, ringed
//         41.6; 42.2 the flash — the memory lit; the lens lands in the room
//         under the white; 45.0 MEMORY RECOVERED, the song, held
//   A VERDICT: 43.0 the breakdown where the dive would be, the verdict
//         lettered 46.4 and held
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
	// ── the machine's status line, in the terminal's face at the bottom ──
	{ caption: 'READING SENSOR CAP', at: 15.0, until: 18.2 },
	{ caption: 'SYNTHESISING CARRIER FROM {band} {hz} HZ', at: 18.3, until: 22.3 },
	{ caption: 'REWINDING MEMORY', at: 22.6, until: 27.0 },
	{ caption: 'READING THE PRENATAL TRACE', at: 28.6, until: 38.4 },
	{ when: 'song', caption: 'MEMORY LOCATED', at: 38.6, until: 42.2 },
	{ when: 'edge', caption: 'TRACE LOST', at: 43.4, until: 52 },

	// ── THE YEARS back from now to the birth year, in the cloud with the
	// traces: the memories the machine reads back through, a headline with
	// every second year (HEADLINES) ──
	{ stream: 'years', at: 23.4, out: 27.0, slow: 2.4, fast: 16, every: 2 },

	// ── THE PREMISE: the memory runs out at the birth; the machine reads on
	// into the womb — the 266 days before it ──
	{
		at: 27.2,
		out: 28.75,
		x: 0,
		y: -0.26,
		lines: [
			{ text: 'NO MEMORY BEFORE {birth}', size: 0.052 },
			{ text: 'READING ON: 266 DAYS BACK', size: 0.04, write: [27.6, 28.2] }
		],
		marks: [{ line: 0, text: '{birth}', at: 28.3, kind: 'circle', pad: 0.3 }]
	},

	// ── THE PRENATAL TRACE: the fragments of the memory surfacing as each
	// band locks — one at a time in the middle, nothing else flying; the
	// evening in what the machine reads off the parents (the run's lists,
	// picked by the date), a number only as a reading ──
	{
		when: 'song',
		at: 29.0,
		out: 31.0,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'DELTA · A ROOM', size: 0.04 },
			{ text: '{where}', size: 0.066, write: [29.4, 29.75] }
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
			{ text: 'THETA · THE LIGHTS', size: 0.04 },
			{ text: '{lights}', size: 0.066, write: [31.8, 32.2] }
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
			{ text: 'ALPHA · A VOICE', size: 0.04 },
			{ text: '{said}', size: 0.066, write: [34.2, 34.6] }
		],
		marks: [{ line: 1, at: 34.9, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 36.2,
		out: 38.0,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'BETA · HOW FAR BACK', size: 0.04 },
			{ text: '266 DAYS', size: 0.066, write: [36.6, 36.9] }
		],
		marks: [{ line: 1, at: 37.2, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 38.4,
		out: 40.2,
		x: 0,
		y: -0.22,
		lines: [
			{ text: 'GAMMA · A SONG ON', size: 0.04 },
			{ text: '{band} {hz} HZ LOCKED', size: 0.05, write: [38.7, 39.3] }
		],
		marks: [{ line: 1, text: 'LOCKED', at: 39.7, kind: 'circle', pad: 0.3 }]
	},

	// ── THE VERDICTS (functions/answer.js): the breakdown where the dive
	// would be, the verdict lettered over the gif and held, in the original
	// site's words under I2's own first line ──
	{
		when: 'past',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO MEMORY BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [46.9, 47.6] },
			{ text: 'THERE WAS NO MUSIC', size: 0.038, write: [47.7, 48.1] }
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
			{ text: 'NO MEMORY YET', size: 0.066 },
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
			{ text: 'SENSORS OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO READ', size: 0.038, write: [46.9, 47.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [47.7, 48.1] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the memory recovered — the song and the date on the lit
	// room, held (the run holds on its last frame) ──
	{
		when: 'song',
		at: 45.0,
		out: 200,
		hold: true,
		x: 0,
		y: -0.07,
		lines: [
			{ text: 'MEMORY RECOVERED', size: 0.034 },
			{ text: '{title}', size: 0.072, write: [45.3, 45.8] },
			{ text: '{artist}', size: 0.044, write: [45.9, 46.3] },
			{ text: '{conception}', size: 0.04, write: [46.4, 46.8] }
		],
		marks: [{ line: 1, at: 46.3, kind: 'circle', pad: 0.3 }]
	}
];
