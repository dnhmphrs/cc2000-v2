// ── Palette ──────────────────────────────────────────────────────────────────
// Every colour the site uses, named by where it is used rather than by hue.
//
// The run walks a deliberate path: yellow machine on deep blue, then deep blue
// air, then white for everything after conception, then the rooms' own colour.
// The one rule that follows from that: anything drawn over the canvas has to
// know whether it is currently on the blue or on the white, which is what the
// `sceneTone` store carries.

// ── Ground ───────────────────────────────────────────────────────────────────
// The run walks from near-black to white: the machine and the fly-in sit on the
// dark, everything from the conception onward on the white.
export const DARK = 0x0b0c0f;
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
	// The solid faces, which are only ever seen on the white.
	solid: 0x14224e
};

// ── Static ───────────────────────────────────────────────────────────────────
// The static IS the background. It paints the active scene's ground colour and
// deviates either side of it, and the 3D is composited on top — so the grain is
// behind everything in the scene rather than a film over it.
export const NOISE = {
	// Resting level, on the calculator. Light — texture, not signal loss.
	base: 0.06,
	// Peak, as the egg fills the frame.
	peak: 0.16,
	// While the icosahedron is working. The calmest the run gets.
	calm: 0.05,
	// Flooding the frame on the way back to the start.
	flood: 0.9,
	// Grain cell size in BACKING-STORE pixels. The field renders a little below
	// native (SCALES in NoiseField), so a cell is roughly this over that scale
	// in CSS pixels — 1.0 at 0.85 is a shade over one pixel, which is as fine as
	// it can usefully be.
	grain: 1.0,
	// Frames a second the grain re-rolls at. Below the display rate on purpose:
	// full-rate static shimmers, slower static crawls.
	rate: 24
};

// ── UI ink ───────────────────────────────────────────────────────────────────
export const INK = {
	onDark: '#d6d6db',
	onLight: '#2b3350'
};
