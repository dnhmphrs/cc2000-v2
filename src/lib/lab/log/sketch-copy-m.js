// ── The copy of flow-strand-sketch-m (THE MEG MACHINE): every word ────────
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read, and lists the tokens), with the MEG machine's rows: the
// Conception Calculator 2000 as a piece of medical equipment, straight-faced.
// After the entry (the title, the date and the spice by hand, as the run's)
// THE MACHINE is switched on and runs a PROCEDURE in six numbered steps —
// its status line at the bottom in the terminal's face (`caption` rows, as
// the run's), the device's own display typed in the same face in named
// SLOTS the sketch lays out (`slot` rows), the diagrams (the sensor cap, the
// eight channel traces, the bars, the spectrum) drawn in the hand — and then
// the run's own journey and end. The tokens are the run's, plus the
// machine's own, from the signal it reads (log/meg-signal.js):
//   {band} {hz}   the captured signal's dominant band and its peak, e.g.
//                 GAMMA 41.2        {spectrum}  its five powers as percentages
//   {fta} {ftb}   signal A's and B's field strength, femtotesla
//   {spice}       the lever, 1 … 10
// and three the sketch fills LIVE as it draws (a pure function of t):
//   {tplus}  the procedure's clock, MM:SS.s from power-on
//   {ft}     the reading of the bar's signal now   {pct}  the bar, 0 … 100
//
// A `slot` row: { slot, text, at, until, row? , when? } — typed on from `at`
// in the terminal's face at the caption's rate, gone at `until` (a fade over
// the 0.4 s before). The slots the sketch lays out:
//   title    the device's name, top left          subject  the line under it
//   clock    top right (the procedure's clock)    list     lines stacked on
//            the right (`row` 0, 1, 2 … top to bottom: the self-test)
//   bar      the bar's label, left of it          value    its reading, right
//   prompt   the machine's prompt, big, under the diagrams   note  under it
// `when` as the run's ('song', 'edge', a verdict), plus 'standby': only while
// the machine waits to be switched on (live, any key; the demo presses it).
//
// THE PROCEDURE (seconds; the sketch's beat table `B` and its `M` have them):
//   14.5  STANDBY · PRESS ANY KEY (live the run holds at 15.6 until one is
//         pressed; the demo presses it); 15.6 POWER ON,
//         the self-test typed line by line, the bar
//   17.6  STEP 1 · READING MEG: the cap drawn on the head, the leads, the
//         eight traces coming up channel by channel (FP1 … O2)
//   20.6  STEP 2 · CALIBRATING: the baseline bar, each channel ticked
//   23.8  STEP 3: THINK ABOUT YOUR FATHER'S SPERM — from 25.0 the frontal
//         channels respond, the bar fills to 42, SIGNAL A CAPTURED 28.4
//   29.4  STEP 4: NOW THINK ABOUT YOUR PARENTS HAVING SEX — from 30.6 every
//         channel goes wild and saturates, the bar to 100, SIGNAL B
//         CAPTURED 34.2; 34.6 – 37.8 its SPECTRUM, the dominant band ringed
//         36.0; 36.6 – 38.6 the bands as epicycles trace the section
//   38.3  STEP 5 · REVERSE-ENGINEERING SPERM FROM SIGNAL: the body written
//         from the section ring by ring, each ring flashed in gold (the
//         run's compile, from the signal rather than the strand); 45.2 life
//   45.6  STEP 6 · RECONSTRUCTING THE EVENT: the run's own journey — the
//         swim into the groove, the label, the hole, the room, the needle
//         drop 67.6, the song on the screen; the run holds at 77
//   A VERDICT: the breakdown where the dive would be (66.0), the verdict
//         lettered 69.4 and held (75)
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
	// ── the status line, at the bottom ──
	{ when: 'standby', caption: 'STANDBY · PRESS ANY KEY', at: 14.5, until: 15.65 },
	{ caption: 'POWER ON · SELF TEST', at: 15.7, until: 18.0 },
	{ caption: 'STEP 1 OF 6 · READING MEG', at: 18.1, until: 20.5 },
	{ caption: 'STEP 2 OF 6 · CALIBRATING', at: 20.6, until: 23.6 },
	{ caption: 'STEP 3 OF 6 · ACQUIRING SIGNAL A', at: 23.8, until: 28.4 },
	{ caption: 'SIGNAL A CAPTURED · {fta} fT', at: 28.5, until: 29.3 },
	{ caption: 'STEP 4 OF 6 · ACQUIRING SIGNAL B', at: 29.4, until: 34.2 },
	{ caption: 'SIGNAL B CAPTURED · {ftb} fT · SATURATED', at: 34.3, until: 35.4 },
	{ caption: 'SPECTRAL ANALYSIS · {band} {hz} HZ', at: 35.5, until: 38.2 },
	{ caption: 'STEP 5 OF 6 · REVERSE-ENGINEERING SPERM FROM SIGNAL', at: 38.3, until: 45.3 },
	{ when: 'song', caption: 'STEP 6 OF 6 · RECONSTRUCTING THE EVENT', at: 45.6, until: 64.2 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 66.4, until: 75 },

	// ── the device's display ──
	{ slot: 'title', text: 'CONCEPTION CALCULATOR 2000 · MEG MODULE', at: 15.7, until: 38.6 },
	{ slot: 'subject', text: 'SUBJECT · DOB {birth} · SPICE {spice}/10', at: 16.1, until: 38.6 },
	{ slot: 'clock', text: 'T+ {tplus}', at: 15.7, until: 38.6 },
	// the self-test, line by line
	{ slot: 'list', row: 0, text: 'SENSOR CAP ........ OK', at: 16.0, until: 18.4 },
	{ slot: 'list', row: 1, text: 'SQUID ARRAY 8 CH .. OK', at: 16.4, until: 18.4 },
	{ slot: 'list', row: 2, text: 'DEWAR 4.2 K ....... OK', at: 16.8, until: 18.4 },
	{ slot: 'list', row: 3, text: 'AMPLIFIER ......... OK', at: 17.2, until: 18.4 },
	{ slot: 'list', row: 4, text: 'READY', at: 17.6, until: 18.4 },
	// the bars: the calibration, then the two signals
	{ slot: 'bar', text: 'BASELINE', at: 20.6, until: 23.6 },
	{ slot: 'value', text: 'NOISE {ft} fT', at: 20.6, until: 23.6 },
	{ slot: 'bar', text: 'SIGNAL A', at: 24.6, until: 29.3 },
	{ slot: 'value', text: '{ft} fT · {pct}%', at: 24.6, until: 29.3 },
	{ slot: 'bar', text: 'SIGNAL B', at: 30.2, until: 35.4 },
	{ slot: 'value', text: '{ft} fT · {pct}%', at: 30.2, until: 35.4 },
	// the prompts, in the machine's own voice
	{ slot: 'prompt', text: 'KEEP STILL', at: 20.8, until: 23.4 },
	{ slot: 'prompt', text: "THINK ABOUT YOUR FATHER'S SPERM", at: 23.8, until: 29.0 },
	{ slot: 'note', text: 'DO NOT BLINK', at: 25.6, until: 29.0 },
	{ slot: 'prompt', text: 'NOW THINK ABOUT YOUR PARENTS HAVING SEX', at: 29.4, until: 34.6 },
	{ slot: 'note', text: 'KEEP THINKING', at: 31.6, until: 34.6 },
	{ slot: 'prompt', text: 'SIGNAL B · {band} {hz} HZ · {spectrum}', at: 35.2, until: 38.4 },
	{ slot: 'note', text: 'SPERM MAY BE RECONSTRUCTED FROM THIS SIGNAL', at: 36.4, until: 38.4 },

	// ── THE VERDICTS (functions/answer.js): the breakdown where the dive
	// would be, the verdict lettered over the gif and held, in the original
	// site's words under the machine's own first line ──
	{
		when: 'past',
		at: 69.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.038, write: [69.9, 70.6] },
			{ text: 'THERE WAS NO MUSIC', size: 0.038, write: [70.7, 71.1] }
		],
		marks: [{ line: 0, at: 70.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'future',
		at: 69.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'NO SIGNAL YET', size: 0.066 },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.038, write: [69.9, 70.5] },
			{ text: 'CONCEIVED TO BABY, BY JUSTIN BIEBER', size: 0.038, write: [70.6, 71.2] }
		],
		marks: [{ line: 0, at: 70.5, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'unknown',
		at: 69.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'SENSORS OVERHEATED', size: 0.066 },
			{ text: 'YOUR MOMENT WAS TOO HOT TO READ', size: 0.038, write: [69.9, 70.6] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [70.7, 71.1] }
		],
		marks: [{ line: 0, at: 70.5, kind: 'circle', pad: 0.3 }]
	}
];
