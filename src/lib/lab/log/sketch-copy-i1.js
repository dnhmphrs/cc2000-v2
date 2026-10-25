// ── The copy of flow-strand-sketch-i1 — THE WAVE ─────────────────────────────
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read, and lists the tokens), with I1's rows. THE STORY THE WORDS TELL:
// the birthday is a SIGNAL (each digit a harmonic over the carrier, the
// spice its gain); the calculator MODULATES its carrier with it — the sperm
// is that wave — then TUNES back through the years to the birth year, FINE
// TUNES 266 days back to the conception's own frequency, LOCKS on it (the
// carrier flat on the band, the date on it) and RECEIVES the record: the
// song on the room's screen. The tokens and the arithmetic are the run's.
//
// I1'S LANDMARKS (seconds):
//    6.8 – 15.0   the entry: the trace on the oscilloscope as the digits are
//                 typed (each digit a harmonic), the gain as the handle is
//                 dragged
//   15.3 – 22.3   MODULATING CARRIER: the body wound round the trace, tip to
//                 nose; 22.2 alive, 22.5 the swim
//   23.1 – 26.2   the wavefronts sketched in (the tunnel: the signal's space)
//   24.0 – 28.3   THE DIAL: the years slide under the needle, 2026 down to
//                 the birth year (slow at the end), ringed in red
//   28.0 – 29.4   the slam: CARRIER FOUND · FINE TUNE −266 DAYS
//   28.7 – 35.0   the fine tune: the 266 days struck (the sketch's own, exact),
//                 the months crossed off; 32.6 – 35.0 the tunnel narrows into
//                 the carrier line, which flattens as the lock comes
//   35.0 – 36.8   LOCK: the conception date on the band, ringed 35.6
//   36.8          the dive through it; 36.8 – 42.0 the lens comes to rest in
//                 the room; 41.0 the screen; 42.2 the light; 44.0 the song
//   a verdict:    37.0 the breakdown where the dive would be; 40.4 the verdict
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
	// ── the machine's status line, typed at the bottom ──
	{ caption: 'MODULATING CARRIER', at: 15.3, until: 22.3 },
	{ caption: 'TUNING', at: 22.6, until: 28.6 },
	{ caption: 'FINE TUNING', at: 29.0, until: 35.0 },
	{ when: 'song', caption: 'RECEIVING', at: 37.2, until: 43.6 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 37.4, until: 46 },

	// ── the dial stops on the birth year: the slam before the fine tune ──
	{
		at: 28.0,
		out: 29.4,
		x: 0,
		y: -0.24,
		lines: [
			{ text: 'CARRIER FOUND  {yyyy}', size: 0.05 },
			{ text: 'FINE TUNE  − 266 DAYS', size: 0.058, write: [28.25, 28.7] }
		],
		marks: [{ line: 0, text: '{yyyy}', at: 28.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the lock: a word over the date on the band ──
	{
		at: 35.5,
		out: 36.7,
		x: 0,
		y: -0.2,
		lines: [{ text: 'LOCK', size: 0.04 }]
	},

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The date is found as
	// on any run; then, where the dive would be, THE BREAKDOWN: the gif leaks
	// into the carrier, the band tears open onto the gif tiled across the
	// board, and the verdict is lettered over it and held ──
	{
		when: 'past',
		at: 40.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO CARRIER BEFORE 1958', size: 0.066 },
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
			{ text: 'NO CARRIER YET', size: 0.066 },
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
			{ text: 'RECEIVER OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CALCULATE', size: 0.038, write: [40.9, 41.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [41.7, 42.1] }
		],
		marks: [{ line: 0, at: 41.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the record received, on the lit room, held ──
	{
		when: 'song',
		at: 44.0,
		out: 200,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: 'SIGNAL RECEIVED', size: 0.03 },
			{ text: '{title}', size: 0.072, write: [44.3, 44.8] },
			{ text: '{artist}', size: 0.044, write: [44.9, 45.3] },
			{ text: '{conception}', size: 0.04, write: [45.4, 45.8] }
		],
		marks: [{ line: 1, at: 45.3, kind: 'circle', pad: 0.3 }]
	}
];
