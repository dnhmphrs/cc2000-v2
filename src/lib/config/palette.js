// ── Palette ──────────────────────────────────────────────────────────────────
// Every colour the site uses, named by where it is used rather than by hue.
//
// The run walks a deliberate path, and the whole point of the walk is that no
// two consecutive scenes are on the same ground:
//
//   1 calculator   a yellow machine on deep blue
//   2 fly-in       deep blue air, going white under the blow-out
//   —              THE FLASH
//   3 conception   the void — near-black, and gold
//   4 computation  the same void, gold line-work, the rooms in full colour on it
//   5 room         the room's own colour, edge to edge
//
// The flash is the hinge: the frame goes white and what is underneath it when
// your eye recovers is black. That is the one cut in the run, and it is why the
// second half can be a different world from the first without a transition.
//
// The one rule that follows: anything drawn over the canvas has to know whether
// it is currently on the blue, the white or the black — which is what the
// `sceneTone` store carries.

// ── Ground ───────────────────────────────────────────────────────────────────
export const DEEP_BLUE = 0x0a246a;
export const WHITE = 0xffffff;
// The void. V1's true-black with a whisper of the blue still in it, so the two
// halves of the run belong to the same site — and dark enough that gold on it
// is the brightest thing on screen.
export const VOID = 0x0a0a0c;

// ── The machine ──────────────────────────────────────────────────────────────
// Drawn like the bedrooms it flies into: flat saturated fills and a heavy black
// ink outline, not a rendered plastic panel. `ink` is a near-black rather than a
// brown, because the room artwork outlines in near-black and the machine has to
// look like it came off the same pen.
export const MACHINE = {
	body: '#f2b427',
	light: '#ffdc63',
	dark: '#c9820f',
	ink: '#17120c',
	lamp: '#ff4d1f',
	crt: '#0a1330',
	// Two accents lifted off the room art — the red of the desk lamp and the
	// teal of the shades — so the machine belongs to the same drawing.
	red: '#e5372a',
	teal: '#2fb3a6',
	orange: '#e8802a'
};

// ── The egg ──────────────────────────────────────────────────────────────────
// The yolk is a painted vertical ramp (a sphere's UVs wrap in u, so anything
// not symmetric across the texture's edges seams pole to pole); the shell is a
// view-space rim. Neither is lit, because the two cameras that draw it project
// differently and a lit sphere would not match across the cut.
//
// It is seen on the deep blue, so it is warm-white falling to a blue shadow —
// which is what makes it read as lit from above in air that is itself blue.
export const EGG = {
	coreStops: ['#ffffff', '#eef3ff', '#b3c4ec', '#6274ad'],
	shell: 0xdfe8ff,
	rim: 0xffffff,
	rimPower: 1.5,
	// How wet it is. The key and the specular are worked out from the view
	// normal in world/egg.js; this is only how much of them there is.
	key: 1,
	gloss: 26
};

// ── The sperm ────────────────────────────────────────────────────────────────
// Not a lit model — a wireframe hologram, additively blended, with a scanline
// running through it and a fresnel rim. It is the one thing in the fly-in that
// is brighter than the air, and it has to stay legible against a fog that is
// swallowing everything else.
export const HOLO = {
	body: 0xdbe6ff,
	rim: 0xffffff,
	// The rivals, further out and losing. Dimmer and cooler, so the one you are
	// riding with is unambiguously the one in front.
	rival: 0x6d86c8
};

// ── The icosahedron ──────────────────────────────────────────────────────────
// Gold on the void. Three weights, and they are a hierarchy rather than three
// colours: the frame is the brightest thing in the scene, the internal
// structure sits behind it, and the drafting lives at the bottom of the stack.
//
// (The SIZES live in space.js under ICOSA; this is only what colour it is.)
export const ICOSA_INK = {
	// The thirty edges. This is THE gold of the site.
	line: 0xf0c45c,
	// Vertices, the answer's own pane, anything the scene is pointing at.
	bright: 0xfff0c8,
	// The six long diagonals and the vertex figures — behind the frame, so the
	// frame stays legible through them.
	inner: 0x9c7c33,
	pentagon: 0xd0a340,
	// The drafting layer: dimension lines, the ratio bar, the spiral, the
	// subdivision squares. Quietest of all — it is meant to be found, not read.
	draft: 0x6f5720,
	// The blueprint field behind everything.
	grid: 0x6b5726,
	// The solid faces, if a scene ever fills them.
	solid: 0x100e08
};

// ── UI ink ───────────────────────────────────────────────────────────────────
export const INK = {
	onDark: '#d6d6db',
	onLight: '#2b3350'
};
