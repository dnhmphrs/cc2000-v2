// ── Palette ──────────────────────────────────────────────────────────────────
// Every colour the site uses, named by where it is used rather than by hue.
//
// The run walks a deliberate path: yellow machine on deep blue, then deep blue
// air, then white for everything after conception, then the rooms' own colour.
// The one rule that follows from that: anything drawn over the canvas has to
// know whether it is currently on the blue or on the white, which is what the
// `sceneTone` store carries.

// ── Ground ───────────────────────────────────────────────────────────────────
// The run walks from blue to white: the machine and the fly-in sit on the deep
// blue, everything from the conception onward on the white.
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
	// The three golden rectangles. The one warm line in the scene, because it is
	// the one piece of the figure that is about the ratio rather than the solid.
	rect: 0xa8823c,
	// The solid faces, which are only ever seen on the white.
	solid: 0x14224e
};

// ── UI ink ───────────────────────────────────────────────────────────────────
export const INK = {
	onDark: '#d6d6db',
	onLight: '#2b3350'
};
