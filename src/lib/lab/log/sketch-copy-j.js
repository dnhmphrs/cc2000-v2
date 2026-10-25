// ── The copy of flow-strand-sketch-j (cut J): the conversation over the rooms ──
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with J's rows: the conversation over the rooms of tunnel B, each
// answer turning the swimmer; the song after the flash; the verdicts. The tokens and
// the arithmetic are the run's.
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
	// the machine's status line over the second tunnel, typed at the bottom
	// (the first two, COMPILING USER GENETICS and SIMULATING CONCEPTION, are
	// the sketch's own, log/caption.js)
	{ when: 'song', caption: 'COMPUTING SOUNDTRACK', at: 38.0, until: 48.5 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 37.4, until: 46 },

	// ── TUNNEL A is the sketch's own (the count, the months, the date on the
	// band): no slam opens it — the 266 days gave the trick away, and the mod
	// sum that stood in for it was just bad (the lead).
	// the years back from now to the birth year, in the cloud with the count
	// (every: 0 — no headlines; 2 flies one with every second year, from
	// HEADLINES)
	// (OFF: with the count and the months it was too much — the lead)
	{ off: true, stream: 'years', at: 29.0, out: 32.8, slow: 2.2, fast: 10, every: 0 },

	// ── TUNNEL B: THE CONVERSATION over the rooms — above the middle, one
	// exchange at a time, the evening in the parents' own words (the lists,
	// picked by the date); each answer turns the swimmer (`veer`); the last
	// question, what music, over the last room, answered by the flash and
	// the song ──
	{
		when: 'song',
		veer: 'lights',
		at: 38.4,
		out: 40.4,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'LIGHTS ON OR OFF', size: 0.04 },
			{ text: '{lights}', size: 0.066, write: [38.8, 39.15] }
		],
		marks: [{ line: 1, at: 39.4, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		veer: 'mum',
		at: 41.0,
		out: 43.0,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'WHAT ARE YOU WEARING', size: 0.04 },
			{ text: '{mum}', size: 0.066, write: [41.4, 41.8] }
		],
		marks: [{ line: 1, at: 42.1, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		veer: 'said',
		at: 43.6,
		out: 45.6,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'WHAT DID YOU SAY', size: 0.04 },
			{ text: '{said}', size: 0.066, write: [44.0, 44.4] }
		],
		marks: [{ line: 1, at: 44.7, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 46.2,
		out: 48.2,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'HOW LONG HAVE WE GOT', size: 0.04 },
			{ text: '266 DAYS', size: 0.066, write: [46.6, 46.9] }
		],
		marks: [{ line: 1, at: 47.2, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 48.8,
		out: 51.4,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'WHAT MUSIC DO YOU WANT', size: 0.04 },
			{ text: 'PUT ON THAT SONG THAT GETS ME IN THE MOOD', size: 0.05, write: [49.1, 49.9] }
		],
		marks: [{ line: 1, text: 'THAT SONG', at: 50.1, kind: 'circle', pad: 0.3 }]
	},

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The date is found as
	// on any run; then, where the dive would be, THE BREAKDOWN (the sketch's
	// BREAK): the gif leaks into the band, the band tears open onto the gif
	// tiled across the board, and the verdict is lettered over it and held,
	// in the original site's words ──
	{
		when: 'past',
		at: 40.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [40.9, 41.6] },
			{ text: 'THERE WAS NO MUSIC', size: 0.038, write: [41.7, 42.1] }
		],
		marks: [{ line: 0, at: 41.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'future',
		at: 40.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL YET', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.038, write: [40.9, 41.5] },
			{ text: 'CONCEIVED TO BABY, BY JUSTIN BIEBER', size: 0.038, write: [41.6, 42.2] }
		],
		marks: [{ line: 0, at: 41.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'unknown',
		at: 40.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CALCULATE', size: 0.038, write: [40.9, 41.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [41.7, 42.1] }
		],
		marks: [{ line: 0, at: 41.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the song and the date on the lit room, held (the run holds
	// on its last frame; the song is named here and nowhere before) ──
	{
		when: 'song',
		at: 55.3,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [55.8, 56.3] },
			{ text: '{conception}', size: 0.04, write: [56.4, 56.8] }
		],
		marks: [{ line: 0, at: 56.3, kind: 'circle', pad: 0.3 }]
	}
];
