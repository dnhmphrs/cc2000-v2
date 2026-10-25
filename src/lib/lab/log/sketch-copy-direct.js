// ── The copy of flow-strand-sketch-direct (the run without tunnel B) ────────
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with the direct cut's rows: no questions (there are no rooms to
// ask them over), the song on the screen from 38.8, the verdicts as the
// run's. The tokens and the arithmetic are the run's.
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
	{ when: 'edge', caption: 'SIGNAL LOST', at: 37.4, until: 46 },

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

	// ── the end: the song and the date on the lit room, held ──
	{
		when: 'song',
		at: 38.8,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [39.3, 39.8] },
			{ text: '{conception}', size: 0.04, write: [39.9, 40.3] }
		],
		marks: [{ line: 0, at: 39.8, kind: 'circle', pad: 0.3 }]
	}
];
