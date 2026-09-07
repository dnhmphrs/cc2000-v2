// ── Palette ──────────────────────────────────────────────────────────────────
// Every colour the site uses, named by where it is used rather than by hue.
//
// The run walks a deliberate path: yellow machine on deep blue, then deep blue
// air, then white for everything after conception, then the rooms' own colour.
// The one rule that follows from that: anything drawn over the canvas has to
// know whether it is currently on the blue or on the white, which is what the
// `sceneTone` store carries.

// ── Ground ───────────────────────────────────────────────────────────────────
export const DEEP_BLUE = 0x0a246a;
export const WHITE = 0xffffff;

// ── The machine ──────────────────────────────────────────────────────────────
export const MACHINE = {
	body: '#e6b52e',
	light: '#f6d564',
	dark: '#b8891a',
	ink: '#2a2413',
	lamp: '#ff6a3c',
	crt: '#0a1330'
};

// ── The egg ──────────────────────────────────────────────────────────────────
// The yolk is a painted vertical ramp (a sphere's UVs wrap in u, so anything
// not symmetric across the texture's edges seams pole to pole); the shell is a
// view-space rim. Neither is lit, because the two cameras that draw it project
// differently and a lit sphere would not match across the cut.
export const EGG = {
	coreStops: ['#ffffff', '#e4ecff', '#a8bce6', '#6f86bd'],
	shell: 0xdfe8ff,
	rim: 0x8fa6dc,
	rimPower: 1.7
};

// ── The icosahedron ──────────────────────────────────────────────────────────
// Only ever seen on white, so the line-work is dark. (Its SIZES live in
// space.js under ICOSA; this is only what colour it is.)
export const ICOSA_INK = {
	line: 0x2b3350,
	// The internal structure that grows out of the vertices — lighter, so the
	// frame stays legible under it.
	inner: 0x8390b5,
	pentagon: 0x2b3350,
	// The pentagon currently turning.
	pentagonLive: 0xd08a2a,
	solid: 0x0a246a
};

// ── Static ───────────────────────────────────────────────────────────────────
// Grain sits at mid grey and deviates either way, so one shader works over both
// the deep blue and the white.
export const NOISE = {
	// Resting level, on the calculator. Light — texture, not signal loss.
	base: 0.05,
	// Peak, as the egg fills the frame.
	peak: 0.2,
	// While the icosahedron is working. The calmest the run gets.
	calm: 0.05,
	// Flooding the frame on the way back to the start.
	flood: 0.9,
	// Grain size in device pixels; larger reads as older equipment. The field
	// renders below native (see SCALES in NoiseField), so this multiplies up.
	grain: 1.5,
	// Frames a second the grain re-rolls at. Below the display rate on purpose:
	// full-rate static shimmers, slower static crawls.
	rate: 24
};

// ── UI ink ───────────────────────────────────────────────────────────────────
export const INK = {
	onDark: '#d6d6db',
	onLight: '#2b3350'
};
