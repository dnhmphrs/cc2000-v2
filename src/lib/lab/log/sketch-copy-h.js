// ── The copy of flow-strand-sketch-h (cut H, kept at /next?v=h) ──────────────
// H's words as they were when it was the run (0.18): the tunnel's
// conversation, the verdicts, the song on the screen. The tokens and the
// arithmetic are the run's (./sketch-copy.js).
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
	{ when: 'edge', caption: 'SIGNAL LOST', at: 43.4, until: 52 },

	// ── TUNNEL A: THE CONVERSATION, the last beat of the story before the
	// room — in the middle of the board, one exchange at a time, nothing else
	// flying: the evening in the parents' own words, as the machine has it
	// (the lists below, picked by the date, so a date always gets the same
	// evening); a number only as an answer; the last question the one the
	// machine answers with the date and the song ──
	{
		when: 'song',
		at: 29.0,
		out: 31.0,
		x: 0,
		y: -0.22, // (above the middle: the room grows beneath)
		lines: [
			{ text: 'LIGHTS ON OR OFF', size: 0.04 },
			{ text: '{lights}', size: 0.066, write: [29.4, 29.75] }
		],
		marks: [{ line: 1, at: 30.0, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 31.4,
		out: 33.4,
		x: 0,
		y: -0.22, // (above the middle: the room grows beneath)
		lines: [
			{ text: 'WHAT ARE YOU WEARING', size: 0.04 },
			{ text: '{mum}', size: 0.066, write: [31.8, 32.2] }
		],
		marks: [{ line: 1, at: 32.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 33.8,
		out: 35.8,
		x: 0,
		y: -0.22, // (above the middle: the room grows beneath)
		lines: [
			{ text: 'WHAT DID YOU SAY', size: 0.04 },
			{ text: '{said}', size: 0.066, write: [34.2, 34.6] }
		],
		marks: [{ line: 1, at: 34.9, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 36.2,
		out: 38.0,
		x: 0,
		y: -0.22, // (above the middle: the room grows beneath)
		lines: [
			{ text: 'HOW LONG HAVE WE GOT', size: 0.04 },
			{ text: '266 DAYS', size: 0.066, write: [36.6, 36.9] }
		],
		marks: [{ line: 1, at: 37.2, kind: 'circle', pad: 0.3 }]
	},
	// the last question — the one the machine answers with the date and the song
	{
		when: 'song',
		at: 38.4,
		out: 40.2,
		x: 0,
		y: -0.22, // (above the middle: the room grows beneath)
		lines: [
			{ text: 'WHAT MUSIC DO YOU WANT', size: 0.04 },
			{ text: 'PUT ON THAT SONG THAT GETS ME IN THE MOOD', size: 0.05, write: [38.7, 39.5] }
		],
		marks: [{ line: 1, text: 'THAT SONG', at: 39.7, kind: 'circle', pad: 0.3 }]
	},

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The date is found as
	// on any run; then, where the dive would be, THE BREAKDOWN (the sketch's
	// BREAK): the gif leaks into the band, the band tears open onto the gif
	// tiled across the board, and the verdict is lettered over it and held,
	// in the original site's words ──
	{
		when: 'past',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.066 },
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
			{ text: 'NO SIGNAL YET', size: 0.066 },
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
			{ text: 'OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CALCULATE', size: 0.038, write: [46.9, 47.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [47.7, 48.1] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the song and the date on the lit room, held ──
	{
		when: 'song',
		at: 45.0,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [45.5, 46.0] },
			{ text: '{conception}', size: 0.04, write: [46.1, 46.5] }
		],
		marks: [{ line: 0, at: 46.0, kind: 'circle', pad: 0.3 }]
	}
];
