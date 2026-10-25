// ── The copy of flow-strand-sketch-e (sketch E, 0.15), kept beside the run ──
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with E's rows. The tokens and the arithmetic are the run's.
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
	{ caption: 'COMPUTING SOUNDTRACK', at: 38.0, until: 48.5 },

	// ── TUNNEL A: the years back from now to the birth year, in the cloud
	// with the count (every: 0 — no headlines; 2 flies one with every second
	// year, from HEADLINES)
	{ stream: 'years', at: 29.0, out: 32.8, slow: 2.2, fast: 10, every: 0 },

	// ── TUNNEL B: the song worked out over the rooms, in chalk — from what
	// the machine has no business knowing about that evening (the lists
	// below, picked by the date, so a date always gets the same evening).
	// The parents' steaminess, read off the lever, is a chart position
	{
		at: 38.3,
		out: 40.3,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'STEAMINESS  {spice} / 10', size: 0.05 },
			{ text: '⇒  CHART POSITION  {spice}', size: 0.046, write: [38.8, 39.15] }
		],
		marks: [
			{ line: 0, text: '{spice} / 10', at: 39.4 },
			{ line: 1, text: '{spice}', at: 39.7, kind: 'circle' }
		]
	},
	// where, and the lights
	{
		at: 40.1,
		out: 42.1,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'WHERE: {where}', size: 0.048 },
			{ text: 'LIGHTS: {lights}   ·   DOOR: {door}', size: 0.042, write: [40.6, 41.0] }
		],
		marks: [
			{ line: 0, text: '{where}', at: 41.1 },
			{ line: 1, text: '{lights}', at: 41.4, kind: 'circle' }
		]
	},
	// what mum wore, what dad had done
	{
		at: 41.9,
		out: 43.9,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'MUM WORE {mum}', size: 0.046 },
			{ text: 'DAD {dad}', size: 0.046, write: [42.4, 42.85] }
		],
		marks: [
			{ line: 0, text: '{mum}', at: 43.0 },
			{ line: 1, text: '{dad}', at: 43.3, kind: 'circle' }
		]
	},
	// what was said, and the precautions
	{
		at: 43.7,
		out: 45.5,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'HE SAID: {said}', size: 0.046 },
			{ text: 'CONTRACEPTION: {contra}', size: 0.044, write: [44.2, 44.55] }
		],
		marks: [
			{ line: 0, text: '{said}', at: 44.7 },
			{ line: 1, text: '{contra}', at: 45.0, kind: 'circle' }
		]
	},
	// THE SONG — where the original put the date up again and ringed it
	{
		at: 45.3,
		out: 47.8,
		x: 0,
		y: -0.25,
		lines: [
			{ text: '{title}', size: 0.08 },
			{ text: '{artist}', size: 0.046, write: [45.8, 46.15] }
		],
		marks: [{ line: 0, at: 46.0, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the song and the date on the lit room, held to the fade ──
	{
		at: 55.3,
		out: 61.6,
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
