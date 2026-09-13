// Room-element manifest.
//
// Each decade ships a set of transparent PNG layers under
// /static/room-elements/[decade]/. Some are full-frame (bg, desk), some are
// cropped sprites (bed, clock, poster, screen). We composite them into a small
// diorama that sits behind each golden-rectangle "window": bg is the back wall,
// furniture steps forward toward the frame at pleasantly varying depth.
//
// The four decades the app knows about.
export const DECADES = ['50s', '60s', '90s', '10s'];

// Canonical element key -> file, per decade (filename casing is inconsistent
// on disk, so it is spelled out explicitly here).
const FILES = {
	'50s': {
		bg: '50s_BG.jpg',
		poster: '50s_Poster.png',
		clock: '50s_Clock.png',
		desk: '50s_Desk.png',
		screen: '50s_TV.png',
		bed: '50s_Bed.png'
	},
	'60s': {
		bg: '60s_BG.png',
		poster: '60s_Poster.png',
		clock: '60s_Clock.png',
		desk: '60s_desk.png',
		screen: '60s_tv.png',
		bed: '60s_bed.png'
	},
	'90s': {
		bg: '90s_BG.png',
		poster: '90s_poster.png',
		clock: '90s_clock.png',
		desk: '90s_desk.png',
		screen: '90_computer.png',
		bed: '90s_bed.png'
	},
	'10s': {
		bg: '10s_BG.png',
		poster: '10s_Poster.png',
		clock: '10s_Clock.png',
		desk: '10s_Desk.png',
		screen: '10s_Computer.png',
		bed: '10s_Bed.png'
	}
};

// Layer layout, shared across decades. Back-to-front reading of a room:
//   depth : 0 = at the window frame (foreground), 1 = back wall (deepest)
//   x     : horizontal anchor, -1 = left edge, +1 = right edge (0 = centre)
//   y     : vertical anchor,   -1 = floor,      +1 = ceiling   (0 = centre)
//   width : element width as a fraction of the room width
//   cover : if true, scale to fully cover the frame (used for the wall)
//
// x/y anchor the CENTRE of each element. Numbers are intentionally easy to
// tweak — they are the main knobs for how each room reads.
// Each element carries a landscape placement (x/y/width) and a `port` override
// for portrait: the frame goes tall, so elements are re-arranged to fill the
// vertical screen (this re-placement is the whole point of separate elements).
// x: -1 left … +1 right · y: -1 floor … +1 ceiling · width: fraction of frame width.
// ── Per-decade placement ─────────────────────────────────────────────────────
// The layout below is SHARED, and for the desk and the bed that is right: they
// are furniture in the same room seen from the same chair. It is wrong for the
// clock and the poster, because every background is drawn with its OWN marks —
// a scuff where a round thing has hung, a corner and an edge where a poster was
// taped — and those marks are in a different place in every decade. One shared
// number cannot sit on four different marks, so it sat on none of them.
//
// It is also wrong for the screen, whose artwork is a different object in every
// decade: a 50s set stands on its own legs, a 90s tower and monitor sit flat on
// the desk, and the y that puts one on the surface leaves the other hovering
// above it.
//
// So: `by` is an optional per-decade override, merged over the shared placement.
// Anything not named here keeps the shared value.
// PORTRAIT WINS LAST. A `by` entry is a LANDSCAPE number — it puts a thing on a
// mark in a wide frame — and portrait is not that frame: it is the long edge
// turned upright and the room re-arranged to fill it. Merging the override over
// the portrait block would let a landscape x clobber the tall layout, so the
// order is shared -> decade -> portrait, and a decade that needs its own
// portrait says so with a `port` of its own.
export function placement(cfg, decade, portrait) {
	const over = (cfg.by && cfg.by[decade]) || null;
	const merged = over ? { ...cfg, ...over } : cfg;
	if (!portrait) return merged;
	const port = (over && over.port) || cfg.port;
	return port ? { ...merged, ...port } : merged;
}

export const LAYERS = [
	{ key: 'bg', depth: 1.0, cover: true, opacity: 1.0 },
	// clock hangs left, poster/window right (matches the bg placement marks).
	{
		key: 'poster',
		depth: 0.92,
		x: 0.5,
		y: 0.42,
		width: 0.26,
		opacity: 1.0,
		port: { x: 0.3, y: 0.66, width: 0.46 },
		// The 90s wall is drawn with the poster's own corner on it: a vertical
		// edge at 0.14 of the width and an L at 0.81, bottom at 0.52 of the height.
		// The 50s is read off the artist's own composite — see THE 50s below.
		by: {
			'90s': { x: 0.38, y: 0.42, width: 0.24 },
			'50s': { x: 0.442, y: 0.5, width: 0.22 }
		}
	},
	{
		key: 'clock',
		depth: 0.9,
		x: -0.4,
		y: 0.52,
		width: 0.13,
		opacity: 1.0,
		port: { x: -0.32, y: 0.82, width: 0.24 },
		// And the scuff a round thing leaves on a wall it has hung on for years.
		//
		// The other three walls have no scuff, but they are not empty either, and
		// the shared spot lands the clock ON something in every one of them: the
		// 60s hangs a lamp there and runs its pull-chain straight through the
		// dial, and the 10s has a chart painted on the wall behind it. So they
		// move to the clear band over the screen, at the 90s's size — the shared
		// 0.13 is a big clock, and next to the scuffed one it reads as a different
		// object rather than the same one in a different room.
		by: {
			'90s': { x: -0.17, y: 0.74, width: 0.115 },
			'50s': { x: -0.202, y: 0.757, width: 0.118 },
			'60s': { x: -0.125, y: 0.762, width: 0.115 },
			'10s': { x: -0.22, y: 0.75, width: 0.115 }
		}
	},
	// screen sits ON the desk → slightly BEHIND the desk plane so the desk's
	// front edge occludes its base (correct "TV on a desk" read).
	{
		key: 'screen',
		depth: 0.6,
		x: 0.03,
		y: -0.02,
		width: 0.34,
		opacity: 1.0,
		port: { x: 0.0, y: 0.16, width: 0.58 },
		by: {
			// The 90s art is a monitor, a keyboard and a tower drawn as one object
			// sitting FLAT, so the shared y — set for a set that stands on its own
			// legs — left it hovering a clear inch above the desk.
			'90s': { y: -0.08 },
			// And the 10s is an all-in-one on a single stand, whose foot is most of
			// the way down its own artwork: at the shared y it floated a hand's
			// breadth clear of the desk it is supposed to be standing on.
			'10s': { y: -0.26 },
			// The 50s set is placed with its own desk — see THE 50s below.
			'50s': { x: -0.005, y: 0.037, width: 0.293 }
		}
	},
	{
		key: 'desk',
		depth: 0.48,
		x: 0.0,
		y: -0.34,
		width: 1.02,
		opacity: 1.0,
		port: { x: 0.0, y: -0.34, width: 1.08 },
		by: { '50s': { x: 0.069, y: -0.205, width: 1.03 } }
	},
	// The bed is over on the RIGHT and it is not the whole floor: at full width,
	// centred, it is a wall of duvet across the bottom third of every room and it
	// buries the desk. Off to one side it is furniture in a bedroom.
	{
		key: 'bed',
		depth: 0.16,
		x: 0.46,
		y: -0.72,
		width: 0.66,
		opacity: 1.0,
		port: { x: 0.34, y: -0.74, width: 0.84 },
		by: { '50s': { x: 0.494, y: -0.831, width: 0.605 } }
	}
];

// ── THE 50s, WHOLE ───────────────────────────────────────────────────────────
// The 50s does not need to be guessed at. It ships `50s_Illustration_desktop.jpg`
// — the artist's own finished composite — and every element PNG is a 1:1 CROP of
// it, which means each one has exactly one offset at which it matches, and that
// offset is the placement. Found by sliding each sprite over the composite and
// taking the minimum, then converted with the frame's own arithmetic: the
// background COVERS the golden rectangle and 16:9 is wider than 1.618, so one
// background width spans 16/9 / 1.618 = 1.0987 frame widths and the crop is
// horizontal only.
//
// So all five 50s numbers above are measured, not tuned, and they move as a set:
// the desk comes up and the television comes down onto it together, which is the
// point. Fitting the set to the composite is also what stops the bed sliding out
// from under the desk at the right and the vase standing off the surface.
//
// The other three rooms have no such composite, so they keep the shared layout
// and are corrected only where the artwork says they are wrong.

// The 'screen' element is the monitor the results are displayed in. Its artwork
// is a whole TV/computer, so this is where the glass actually is inside that
// PNG — centre and size as fractions of the image — measured off each one.
// The end-of-run UI is placed into this rect rather than floating over the room.
// Detected as the largest uniform-colour region in each PNG, except the 50s,
// whose screen fill is too close to its own casing for that to work — measured
// off the artwork by hand instead.
// Moved to config/layout.js, where every other screen-space size lives.
// Re-exported so nothing that already imports it from here has to change.
export { SCREEN_GLASS, GLASS_SAFETY } from '$lib/config';
import { rand } from '$lib/random';

// The palettes the blueprint field takes while the search turns through the
// decades. The first stop is never used — the scene's own ground overrides it —
// so these are really [ignored, the RULE, the LATTICE].
//
// All four are golds, because the field is the paper the second half of the run
// is worked on and the paper does not change material between eras. What the
// decade shifts is the temperature of the gold: warm brass for the fifties,
// hard yellow for the sixties, a greener gold for the nineties, and something
// nearly white for the twenty-tens.
export const DECADE_FIELD = {
	'50s': [0xffe6a3, 0xffc46a, 0xe08a2e],
	'60s': [0xffd426, 0xffd23a, 0xf2a521],
	'90s': [0xfff2c0, 0xe6d878, 0xbfae3e],
	'10s': [0xeef4ff, 0xfff0c8, 0xd8d0a0]
};

export function elementUrl(decade, key) {
	const files = FILES[decade] || FILES['90s'];
	return `/room-elements/${decade}/${files[key]}`;
}

// Fisher–Yates shuffle (returns a new array).
export function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// Assign the four decades across `count` faces at random, guaranteeing every
// decade appears at least once (the remaining faces get random repeats).
export function assignDecades(count = 6) {
	const base = shuffle(DECADES);
	const extra = [];
	for (let i = DECADES.length; i < count; i++) {
		extra.push(DECADES[Math.floor(rand() * DECADES.length)]);
	}
	return shuffle(base.concat(extra)).slice(0, count);
}
