// ── Palette ──────────────────────────────────────────────────────────────────
// Every colour the site uses, named by where it is used rather than by hue.
//
// The run walks a deliberate path, and the whole point of the walk is that no
// two consecutive scenes are on the same ground:
//
//   1 calculator   a yellow machine on deep blue
//   2 fly-in       BLACK AIR, blue swimmer, gold ovum
//   3 conception   the void — near-black, and gold
//   4 computation  the same void, gold line-work, the rooms in full colour on it
//   5 room         the room's own colour, edge to edge
//
// THE MIDDLE THREE ARE ONE WORLD. They used to be two, joined by a white
// blow-out; scenes 2, 3 and 4 are now the same black ground and the same gold,
// and the fly-in hands the conception the identical picture — a dark sphere
// with a gold rim, on the void — so there is no cut in the middle of the run
// at all. Everything that used to be carried by the flash is carried by the
// fact that nothing changes.
//
// Blue survives as the one COLD thing in it: the swimmer and the debris in the
// air. Blue goes to gold, and after the conception there is no blue left.
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

// The fly-in's air, and it is NOT the void: it is lifted a shade off it, and
// warm. Fog can only take a thing toward the colour of the air it is in, so air
// that is exactly the ground is fog you cannot see — everything simply dims,
// which reads as fading out rather than as being far away. V1 fogged against an
// off-black for precisely this reason. It walks down to the VOID over the last
// of the run, so the frame the conception opens on is the frame the fly-in
// closed on, to the bit.
export const AIR = 0x14120e;

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
	// The glass in the machine's instruments — the CRT and the chassis portholes.
	// The AIR: the window looks straight through to the tunnel idling behind it,
	// which is fogged against exactly this, so a porthole beside it in any other
	// black reads as a hole in the machine. It was a navy left over from the blue
	// era, and the page ground was the same navy — which is what put a blue
	// screen on the machine for the first second of every cold load.
	crt: '#14120e',
	// Two accents lifted off the room art — the red of the desk lamp and the
	// teal of the shades — so the machine belongs to the same drawing.
	red: '#e5372a',
	teal: '#2fb3a6',
	orange: '#e8802a'
};

// ── The ovum ─────────────────────────────────────────────────────────────────
// A WIRE GLOBE, not a rendered egg. Pale blue line-work with three gold great
// circles round it, and a silhouette a few percent thick so it occludes what is
// behind it. Nothing about it is lit or glossy: it is what an instrument would
// draw, which is the whole register of this site.
//
// The three gold circles are the three coordinate planes — the same three the
// golden rectangles lie in — so the thing being swum at already carries the
// figure it becomes.
export const EGG = {
	// ── The outer shell ──────────────────────────────────────────────────────
	// Gold, and held back: the cage is the quiet weight and the three great
	// circles are the bright one, so what you read at distance is three rings
	// round a dark ball rather than a ball of wire.
	wire: 0x9c7c33,
	rings: 0xf0c45c,
	// How much brighter the three great circles are than the cage.
	ringGain: 1.7,
	// The outer silhouette. In the fly-in it is a whisper; in the void it is THE
	// gold circle the icosahedron is drawn inside.
	skin: 0xb08a3a,
	rim: 0xffe6a8,
	rimPower: 3.2,
	// How many lines the cage is made of. Coarse on purpose — this is a
	// wireframe, and every extra line is one more thing between you and the
	// shape.
	meridians: 9,
	parallels: 7,

	// ── The core ─────────────────────────────────────────────────────────────
	// The inner sphere, and the reason the ovum reads as an OVUM rather than as
	// a wire ball: a dark, opaque body inside the cage, so the cage's far half is
	// hidden behind something and the two layers separate. V1's egg was two
	// spheres and that was the whole of its weight.
	//
	// It is nearly the ground colour, so on black what you actually see is its
	// gold rim and whatever is lit on it — which is what the wave is for.
	core: 0x0b0a08,
	// THE SAME TWO GOLDS the icosahedron's frame is drawn in (ICOSA_INK.line and
	// .bright, below). Not a coincidence and not to be drifted apart: the core's
	// rim in the fly-in and the gold circle in the void are the same material
	// with the same numbers, which is the whole reason one scene can hand the
	// other its last frame and nothing appears to happen.
	coreRim: 0xf0c45c,
	coreHot: 0xfff0c8,
	coreRimPower: 2.2,
	// The wave that runs on it. Crests go to `waveHot`.
	wave: 0xe8b652,
	waveHot: 0xfff0c8
};

// ── The sperm, and the air it is in ──────────────────────────────────────────
// A wireframe hologram: the mesh IS the image. Additive, with the silhouette
// lifting toward white and one band travelling along its length. It is the one
// thing in the fly-in brighter than the air, and it has to stay legible against
// a fog that is swallowing everything else.
export const HOLO = {
	body: 0x74a0f2,
	rim: 0xc6dcff,
	// The debris streaming past the lens. Cold, like the swimmer — they are the
	// only things in the air that are not gold, and they leave with it.
	mote: 0x8ea6d8,
	// The glow the ovum comes up out of, which is the ovum's and therefore GOLD.
	// It is the first thing in the run that is: a warmth in the black long
	// before there is anything in the warmth.
	halo: 0xb98a2e
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
	//
	// But it WAS too quiet. V2 drew this in the accent gold, which its renderer's
	// sRGB encode lifted to a displayed rgb(226,208,123); this displayed
	// rgb(111,87,32), a little under half of it, and the arms V2 is the gold
	// standard for were a ghost. It sits between `inner` and the old value now —
	// brighter, and still comfortably under both the frame and the structure
	// behind it, because the hierarchy is the point and V2's drafting was in fact
	// brighter than anything else in its own scene.
	draft: 0x8d7130,
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
