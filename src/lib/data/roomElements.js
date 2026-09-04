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
		port: { x: 0.3, y: 0.66, width: 0.46 }
	},
	{
		key: 'clock',
		depth: 0.9,
		x: -0.4,
		y: 0.52,
		width: 0.13,
		opacity: 1.0,
		port: { x: -0.32, y: 0.82, width: 0.24 }
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
		port: { x: 0.0, y: 0.16, width: 0.58 }
	},
	{
		key: 'desk',
		depth: 0.48,
		x: 0.0,
		y: -0.34,
		width: 1.02,
		opacity: 1.0,
		port: { x: 0.0, y: -0.34, width: 1.08 }
	},
	{
		key: 'bed',
		depth: 0.16,
		x: 0.0,
		y: -0.74,
		width: 1.1,
		opacity: 1.0,
		port: { x: 0.0, y: -0.74, width: 1.2 }
	}
];

// The 'screen' element is the monitor the results are displayed in. Its artwork
// is a whole TV/computer, so this is where the glass actually is inside that
// PNG — centre and size as fractions of the image — measured off each one.
// The end-of-run UI is placed into this rect rather than floating over the room.
// Detected as the largest uniform-colour region in each PNG, except the 50s,
// whose screen fill is too close to its own casing for that to work — measured
// off the artwork by hand instead.
export const SCREEN_GLASS = {
	'50s': { cx: 0.545, cy: 0.42, w: 0.73, h: 0.58 },
	'60s': { cx: 0.382, cy: 0.391, w: 0.64, h: 0.65 },
	'90s': { cx: 0.352, cy: 0.436, w: 0.51, h: 0.63 },
	'10s': { cx: 0.498, cy: 0.319, w: 0.94, h: 0.6 }
};

// The palettes the background field takes while the search turns through the
// decades. All of them sit in the site's blue/yellow pairing — the era shifts
// which way the field leans rather than changing its colours outright.
// [near, mid, far] feeding the shader's three stops.
export const DECADE_FIELD = {
	'50s': [0xffe6a3, 0x2f7fc8, 0x0a1f52],
	'60s': [0xffd426, 0x2b5fd0, 0x0c1746],
	'90s': [0xfff2c0, 0x4aa0d8, 0x0d2a5e],
	'10s': [0xeef4ff, 0x3a56e0, 0x080f3a]
};

export function elementUrl(decade, key) {
	const files = FILES[decade] || FILES['90s'];
	return `/room-elements/${decade}/${files[key]}`;
}

// Fisher–Yates shuffle (returns a new array).
export function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
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
		extra.push(DECADES[Math.floor(Math.random() * DECADES.length)]);
	}
	return shuffle(base.concat(extra)).slice(0, count);
}
