// ── The copy of flow-strand-sketch-i3 (I3: SPACE-TIME), kept beside the run ──
// The same table as log/sketch-copy.js (the run's; its header says how a row
// is read), with I3's rows: relativity done straight-faced. The machine
// treats HERE · NOW and THE CONCEPTION as two EVENTS and the user as a
// worldline between them that never moved (x = 0 in its own frame), so the
// interval between them is pure proper time, τ; it swims back down that
// worldline, inside the conception's future light cone, through the years of
// proper time to the apex. The tokens and the arithmetic are the run's, plus
// this run's own (the sketch passes them to fieldsOf as extras):
//   {today}  the run's date, 25 · 10 · 2026   {tau}  the proper time from the
//   conception to today, in years (40.4)   {age}  it, whole   {ly}  the same
//   number as light years: how far the event's own light has got
//   {wday}   the conception's weekday (Zeller's, the run's)
// The year rings' labels, the months' and the days' count, the τ meter and
// the date at the apex are the sketch's own, exact.
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
	// ── the machine's status line, typed at the bottom (COMPILING USER
	// GENETICS is the sketch's own, log/caption.js) ──
	{ caption: 'PLOTTING YOUR WORLDLINE', at: 22.6, until: 28.6 },
	{ caption: 'INTEGRATING PROPER TIME', at: 28.8, until: 40.2 },
	{ when: 'song', caption: 'SOLVING FOR THE EVENT', at: 40.4, until: 43.0 },
	{ when: 'edge', caption: 'SIGNAL LOST', at: 43.4, until: 52 },

	// ── THE DIAGRAM (the lens wide, side-on to the cone, 22.6 – 24.4): the
	// two events PINNED by name where they are (`pin`: 'now' letters the
	// text at the swimmer's nose, 'apex' at the cone's apex, with a tick to
	// the point), the two named in a slam, and the one assumption that makes
	// the sum possible — in your own frame you have not moved, so the
	// interval is proper time ──
	{ pin: 'now', text: 'HERE · NOW', at: 22.9, out: 24.5, size: 0.03 },
	{ pin: 'apex', text: 'THE EVENT', at: 23.4, out: 24.5, size: 0.03 },
	{
		at: 23.0,
		out: 24.6,
		x: -0.06,
		y: 0.33,
		lines: [
			{ text: 'TWO EVENTS', size: 0.034 },
			{ text: 'HERE · NOW   {today}', size: 0.046, write: [23.2, 23.6] },
			{ text: 'THE CONCEPTION   t = ?', size: 0.046, write: [23.7, 24.1] }
		],
		marks: [{ line: 2, text: 't = ?', at: 24.2, kind: 'circle', pad: 0.3 }]
	},
	{
		at: 24.9,
		out: 26.6,
		x: 0,
		y: -0.26,
		lines: [
			{ text: 's² = (ct)² − x²', size: 0.056 },
			{ text: 'x = 0 : YOU NEVER MOVED', size: 0.04, write: [25.2, 25.7] },
			{ text: 's = ct = PROPER TIME', size: 0.04, write: [25.8, 26.2] }
		],
		marks: [
			{ line: 0, text: 'x²', at: 25.75, kind: 'strike' },
			{ line: 2, text: 'PROPER TIME', at: 26.3, kind: 'circle', pad: 0.3 }
		]
	},
	// the lens on the axis: looking back down the cone, every ring a year
	{
		at: 27.2,
		out: 28.9,
		x: 0,
		y: -0.3,
		lines: [
			{ text: 'INSIDE THE FUTURE LIGHT CONE OF THE EVENT', size: 0.034 },
			{ text: 'EVERY RING ONE YEAR OF PROPER TIME', size: 0.038, write: [27.5, 28.0] },
			{ text: 'SWIMMING BACK AT c', size: 0.044, write: [28.1, 28.4] }
		],
		marks: [{ line: 2, text: 'c', at: 28.6, kind: 'circle', pad: 0.4 }]
	},

	// ── THE YEARS go by on the rings (the sketch's own: each year struck as
	// the swimmer crosses it); the machine remarks on the rate, which is
	// the zoom's own — fast through the 2000s, slowing to the birth ──
	{
		when: 'song',
		at: 33.4,
		out: 34.8,
		x: 0,
		y: -0.3,
		lines: [
			{ text: 'THE RATE IS THE INTERVAL', size: 0.034 },
			{ text: 'THE LAST YEARS ARE THE LONGEST', size: 0.04, write: [33.7, 34.2] }
		]
	},
	// the birth: the last 266 days of proper time are the gestation
	{
		when: 'song',
		at: 37.0,
		out: 38.8,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'BORN   {birth}', size: 0.05 },
			{ text: '266 DAYS OF PROPER TIME TO THE APEX', size: 0.038, write: [37.4, 38.0] }
		],
		marks: [{ line: 0, text: '{birth}', at: 38.0, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 39.3,
		out: 40.6,
		x: 0,
		y: -0.3,
		lines: [
			{ text: 'THE CONE CLOSES', size: 0.034 },
			{ text: 'NOTHING OUTSIDE IT COULD HAVE REACHED YOU', size: 0.038, write: [39.6, 40.2] }
		]
	},

	// ── THE VERDICTS (functions/answer.js: a birthday the archive cannot
	// answer for; ?edge=past|future|unknown forces one). The event is found
	// as on any run; then, at the apex, THE BREAKDOWN: the gif leaks into
	// the flare, the flare tears open onto the gif tiled across the board,
	// and the verdict is lettered over it and held ──
	{
		when: 'past',
		at: 46.4,
		out: 200,
		hold: true,
		x: 0,
		y: 0,
		lines: [
			{ text: 'OUTSIDE THE LIGHT CONE', size: 0.062 },
			{ text: 'NO SIGNAL BEFORE 1958', size: 0.04, write: [46.9, 47.4] },
			{ text: 'YOU WERE BORN IN THE TIME OF DINOSAURS', size: 0.036, write: [47.5, 48.2] }
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
			{ text: 'SPACELIKE', size: 0.062 },
			{ text: 'THE EVENT HAS NOT REACHED US YET', size: 0.04, write: [46.9, 47.5] },
			{ text: 'YOU WERE BORN IN THE AFTER TIME', size: 0.036, write: [47.6, 48.2] }
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
			{ text: 'SINGULARITY', size: 0.062 },
			{ text: 'THE INTERVAL DID NOT CONVERGE', size: 0.04, write: [46.9, 47.5] },
			{ text: 'YOUR PARENTS FUCK', size: 0.042, write: [47.6, 48.0] }
		],
		marks: [{ line: 0, at: 47.5, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the event solved, on the lit room, held — and the one
	// consequence: the light of that evening has been travelling ever since,
	// and is {ly} light years out ──
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
			{ text: '{conception}  ·  {wday}', size: 0.038, write: [46.1, 46.6] }
		],
		marks: [{ line: 0, at: 46.0, kind: 'circle', pad: 0.3 }]
	},
	{
		when: 'song',
		at: 47.2,
		out: 200,
		hold: true,
		x: 0,
		y: 0.3,
		lines: [
			{ text: 'ITS LIGHT LEFT THE ROOM AT c', size: 0.032 },
			{ text: 'IT IS {ly} LIGHT YEARS OUT TONIGHT', size: 0.036, write: [47.6, 48.3] }
		],
		marks: [{ line: 1, text: '{ly}', at: 48.5, kind: 'circle', pad: 0.3 }]
	}
];
