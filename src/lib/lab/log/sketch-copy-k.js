// ── The copy of flow-strand-sketch-k (cut K, kept at /next?v=k) ──────────────
// K's words: the two status lines and the three verdicts, at K's seconds.
// The tokens and the arithmetic are the run's (./sketch-copy.js).
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
	// ── the machine's status lines, typed at the bottom: the only words on
	// the fly-in (cut K: no date, no maths, no conversation) ──
	{ caption: 'COMPILING USER GENETICS', at: 15.3, until: 22.3 },
	{ when: 'song', caption: 'SIMULATING CONCEPTION', at: 22.6, until: 41.2 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 43.4, until: 52 },

	// ── A VERDICT, held over the gif (the original site's three) ──

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
	}
];
