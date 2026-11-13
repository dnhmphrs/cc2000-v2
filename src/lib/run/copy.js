// ── The copy: every word of the run, in one table ────────────────────────────
// Everything the run says is listed here, in its order, with WHEN it comes
// (seconds of the run). The sketch reads this table; nothing textual is
// hard-coded in it. Change a line here and the run shows it.
//
// (The two questions and the title are the entry's and the terminal's:
// Q1_TEXT and Q2_TEXT in sketch.js, LINES in terminal.js.)
//
// A ROW is one of two things.
//
// A CAPTION, a line typed at the bottom of the board in the terminal's face:
// the machine's status line.
//   caption  the words
//   at       the second it starts typing
//   until    the second it is gone
//
// A SLAM, lines of hand lettering popped up on the board (the verdicts).
//   at       the second it pops in (over 0.32 s)
//   out      the second it goes; with `hold` it stays put and fades then,
//            otherwise it flies on out past the lens
//   x, y     where it sits, as a fraction of the board from its middle (x
//            right, y down)
//   lines    its lines, top to bottom: each { text, size } — size as a
//            fraction of the board's height (0.04 is about a caption, 0.075
//            big) — and, to have a line written on while the slam is up,
//            write: [from, to] (seconds)
//   marks    the red pencil: { line, text, at, kind, pad } — on line `line`
//            (0 is the first), round the first place `text` occurs (the whole
//            line if it is left out), at `at` seconds: a 'strike' through it
//            (the default) or a 'circle' round it
//   color    its ink, if not the hand's white
//
// Either may say:
//   when     'song': only on a run that finds a song; 'edge': only on a
//            verdict; 'past' | 'future' | 'unknown': only on that verdict;
//            left out, on every run
//   off      true: the row is kept but not played
//
// EVERY TIME MUST BE INSIDE THE RUN. It is 44 seconds long (SECONDS in
// sketch.js) and a verdict's run holds at 43.8 (BREAK.end): a line timed past
// that is never written. When the run is shortened or a beat moves, the times
// here move with it.
//
// TOKENS: {…} in a slam's text is filled from the answers (fieldsOf below):
//   {birth}       14 · 02 · 1987     {dd} {mm} {yyyy} {yy}   its parts
//   {conception}  24 · 05 · 1986     {cdd} {cmm} {cyyyy}     266 days before
//   {weekday}     SATURDAY           the conception's
//   {spice}       the spice, 1 … 10
//   {title} {artist}   the song (blank on a verdict)   {chart}   its chart's day
//
// LETTERING: the hand's stroke font has the digits, the capitals, the small
// letters, and · . , : − + = ( ) ⌊ ⌋ / → ⇒ ≤ < ! ≡ ≈ ² ³ | [ ] ; × ± Ш. Anything
// else shows as a space.

import { birthOf, conceive, weekdayOf, fmt, pad2 } from './date.js';

export const COPY = [
	// ── the machine's status lines, typed at the bottom: the only words on
	// the fly-in (cut K: no date, no maths, no conversation) ──
	// (0.23.7: typed from the moment the lens starts for the reading, B.view —
	// "compiling user genetics should only start typing when the camera starts
	// zooming in for the amino acid scan", the lead)
	{ caption: 'COMPILING USER GENETICS', at: 16.5, until: 22 },
	{ when: 'song', caption: 'SIMULATING CONCEPTION', at: 23.7, until: 33.63 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 36.02, until: 43.8 },

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The date is found as
	// on any run; then, where the dive would be, THE BREAKDOWN (the sketch's
	// BREAK): the gif leaks into the band, the band tears open onto the gif
	// tiled across the board, and the verdict is lettered over it and held,
	// in the original site's words ──
	{
		when: 'past',
		at: 39.2,
		out: 198,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [44.9, 45.6] },
			{ text: 'THERE WAS NO MUSIC', size: 0.038, write: [45.7, 46.1] }
		],
		marks: [{ line: 0, at: 40.3, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'future',
		at: 39.2,
		out: 198,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL YET', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.038, write: [44.9, 45.5] },
			{ text: 'CONCEIVED TO BABY, BY JUSTIN BIEBER', size: 0.038, write: [45.6, 46.2] }
		],
		marks: [{ line: 0, at: 40.3, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'unknown',
		at: 39.2,
		out: 198,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO CALCULATE', size: 0.038, write: [44.9, 45.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [45.7, 46.1] }
		],
		marks: [{ line: 0, at: 40.3, kind: 'circle', pad: 0.3 }]
	}
];

// THE PAGE'S OWN WORDS on the landed screen (Run.svelte): the line over the
// player, the share key (which does nothing yet — it will be a share screen)
// and the restart key.
export const PAGE = {
	response: 'YOU WERE CONCEIVED TO',
	share: 'SHARE',
	again: 'START AGAIN'
};

// Every token a slam can use, from the answers' eight digits — and `extra`
// (the song's, from the sketch), laid under them.
export function fieldsOf(digits, extra = {}) {
	const b = birthOf(digits);
	const c = conceive(b);
	return {
		...extra,
		birth: fmt(b),
		dd: pad2(b.d),
		mm: pad2(b.m),
		yyyy: String(b.y),
		yy: pad2(b.y % 100),
		conception: fmt(c),
		cdd: pad2(c.d),
		cmm: pad2(c.m),
		cyyyy: String(c.y),
		weekday: weekdayOf(c)
	};
}

// `{token}`s filled in (an unknown token is left as it is).
export const fill = (text, F) =>
	String(text).replace(/\{(\w+)\}/g, (s, k) => (F[k] === undefined ? s : String(F[k])));
