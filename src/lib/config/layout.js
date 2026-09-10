import { ASPECT } from './space';
// ── Layout ───────────────────────────────────────────────────────────────────
// Screen-space sizes: the room monitors the result is drawn into, and the
// calculator's own chassis.

// ── The decade monitors ──────────────────────────────────────────────────────
// Where each decade room's screen GLASS sits, as fractions of that room's own
// artwork frame — cx/cy is the centre, w/h the size, both 0..1. The projection
// turns these into CSS pixels once the camera has settled on a room.
//
// `art` is that PNG's own pixel aspect, which is what turns the fractions above
// into a real shape — see glassAspect() below.
//
// Measured off the artwork by eye. If a result panel sits crooked in a monitor,
// this is the file to nudge.
export const SCREEN_GLASS = {
	'50s': { cx: 0.545, cy: 0.42, w: 0.73, h: 0.58, art: 1024 / 1099 },
	'60s': { cx: 0.382, cy: 0.391, w: 0.64, h: 0.65, art: 1289 / 1148 },
	'90s': { cx: 0.352, cy: 0.436, w: 0.51, h: 0.63, art: 1457 / 1182 },
	'10s': { cx: 0.498, cy: 0.319, w: 0.94, h: 0.6, art: 1097 / 999 }
};

// Pull the published rect in slightly, so a panel drawn into it never laps over
// the bezel that the artwork drew around it. 1 = the measured glass exactly.
export const GLASS_SAFETY = 0.92;

// What shape that monitor actually is. NOT a number anyone chose: w/h above are
// fractions of the artwork, so the glass is only square-on-screen if the PNG is
// too — hence `art`, each file's own pixel aspect, and hence this.
//
//   50s  1024x1099 art -> 1.173  a squarish console television
//   60s  1289x1148 art -> 1.106  squarer still
//   90s  1457x1182 art -> 0.998  a square CRT, near enough exactly
//   10s  1097x999  art -> 1.720  the only widescreen in the building
//
// Measured back off the running site at 1440x900 and again at 390x844: the
// projection reproduces all four to three decimals, so RESULT_PANEL reads the
// live rect rather than this. It is the record — the thing to look at when you
// want to know which decade you are designing for — not the source.
export function glassAspect(decadeKey) {
	const g = SCREEN_GLASS[decadeKey] || SCREEN_GLASS['90s'];
	return (g.w / g.h) * g.art;
}

// ── The readout ──────────────────────────────────────────────────────────────
// What goes in the monitor, now that only TYPE goes in the monitor. The player
// used to share the glass and it was always the wrong call: Spotify's embed has
// a size below which it does not draw, and three of these four rooms have a
// screen barely larger than that, so the two of them spent the whole time
// crushing each other. The player is in the corner now — see scenes/Room.svelte
// — and this sizes the four lines that are left.
//
// The four monitors are four different shapes, and one fixed layout cannot
// serve all of them: sized off width alone it is a widescreen band, which is
// right for the 2010s and leaves the three squarish sets showing a letterbox
// floating in a mostly empty screen.
//
// So the readout picks a reference box by the shape of the glass it is in and
// fills it. `ref` is the size it is drawn 1:1 at; the scale is whichever of the
// two dimensions runs out first. A NARROWER reference buys bigger type in a
// narrow screen, paid for in title lines — which a tall screen has room for and
// a wide one does not.
//
// The boxes came DOWN when the player left, which is the point: the same glass
// now fits a reference two thirds the height, so the same monitor sets its type
// a size and a half larger. The 90s CRT — the tightest of the four, square to
// within two parts in a thousand and about 230px across at landing — went from
// 0.70 to 0.82.
export const RESULT_PANEL = {
	// How small the readout may be drawn before it stops being readable, and how
	// large before it stops reading as a screen.
	scale: [0.55, 1.35],

	// ── THE PLAYER IS BACK IN THE GLASS, AND IT COSTS HEIGHT ─────────────────
	// The embed does not scale itself. It is a cross-origin iframe and its
	// internal layout is computed against its own pixel box, so below Spotify's
	// compact card — 152px, the height its own oEmbed endpoint emits — it does
	// not shrink, it CLIPS and grows a scrollbar. There is no compact parameter
	// and no smaller layout: 152 is a floor.
	//
	// So the way to put a usable player in a 240px monitor is to give the iframe
	// its natural size and scale the whole card with a CSS transform — see
	// PLAYER below and scenes/Room.svelte. What that costs is HEIGHT, and the
	// height it costs comes out of these boxes: the readout is now measured
	// against what is left over rather than against the whole glass.
	//
	// Which is why the reference heights came down again and the widths came in.
	// They describe four lines and a control, not a screenful.
	shapes: [
		{ name: 'wide', from: 1.45, ref: { w: 340, h: 141 }, titleLines: 2, artistLines: 1 },
		{ name: 'square', from: 0.85, ref: { w: 300, h: 141 }, titleLines: 2, artistLines: 1 },
		// Nothing is this shape today. It is here so that a monitor taller than it
		// is wide cannot land on the widescreen layout by default, which is the
		// exact failure this config exists to fix.
		{ name: 'tall', from: 0, ref: { w: 275, h: 163 }, titleLines: 3, artistLines: 1 }
	]
};

// ── The player ───────────────────────────────────────────────────────────────
// Spotify's compact card, and the two numbers that decide whether it can go in
// a monitor at all.
//
//   height    152. Not a preference — it is what Spotify's own oEmbed emits and
//             the smallest layout the current embed has. Under it the card
//             clips and scrollbars rather than shrinking.
//   logical   the width the iframe is GIVEN before the transform. Kept at or
//             above 300 because the card's own layout starts wrapping under
//             roughly that, and a wrapped card in a scaled box is a mess.
//
// The gate is the honest part, and it is a gate on the SCALE rather than on the
// monitor's width, because the scale is what the play control's size actually
// depends on. Spotify's compact card carries a play control of roughly 32 CSS
// px; scale the card by k and the control goes with it, so k = 0.75 is a 24px
// target, which is exactly what WCAG 2.2's Target Size (Minimum) asks for. That
// is the floor. A player nobody can press is worse than no player.
//
// The second half of the gate is what is LEFT: the readout still has to fit
// over the card, and `readout` is the least it can be given before it stops
// being four lines and a control and starts being a clipped list.
//
// Under either bound the embed leaves the glass and goes back to the edge of
// the screen at full size — top left in landscape, the bottom edge upright.
// See scenes/Room.svelte.
// And the card does not get the whole monitor. Fitted to width alone it takes
// 152 of the 2010s screen's 257 — nearly two thirds — and the readout over it
// clips its own title. `share` caps the card at half the glass and lets it sit
// narrower than the screen, centred, which is what a wide monitor wants anyway.
export const PLAYER = {
	height: 152,
	logical: 300,
	share: 0.5,
	minScale: 0.75,
	readout: 88
};

// How to draw the panel in this decade's monitor at this size on screen.
//
// The SHAPE comes from the decade rather than from the rect, and deliberately:
// the rect is a bounding box that moves the whole way through the return zoom,
// and a layout that switched modes part way down that zoom would be a visible
// fault. The decade's monitor is the same shape at every size, so the mode is
// settled before the first frame and only the scale rides the rect.
export function panelFit(decadeKey, width, height) {
	const ratio = glassAspect(decadeKey);
	const shapes = RESULT_PANEL.shapes;
	const shape = shapes.find((s) => ratio >= s.from) || shapes[shapes.length - 1];
	const [lo, hi] = RESULT_PANEL.scale;
	const s = Math.min(width / shape.ref.w, height / shape.ref.h);
	return { shape, scale: Math.max(lo, Math.min(hi, s)) };
}

// ── The calculator chassis ───────────────────────────────────────────────────
// The machine is one window with a body spread around it. Everything bolted to
// the body is positioned relative to the window, so these four numbers move the
// whole thing.
//
// Three sets, because the site has to work in all three shapes of screen: a
// laptop, a phone, and the square-ish middle a tablet lands in. Keys match
// aspectKind() in ./space.
//
// `win` is capped on HEIGHT as well as width, and that is the load-bearing part.
// What limits this window is not how wide the screen is — it is the fixed stack
// underneath it: the panel, the button and the vents along the bottom are all
// px-sized, so on a short laptop a width-only cap runs the button straight
// through the vents. Measured at 1440x720 that overlap was 22px before this.
export const CHASSIS = {
	landscape: {
		win: 'clamp(300px, min(46vw, 66vh), 980px)',
		winAspect: 3 / 2,
		// Vertical centre of the window, as a fraction of the viewport. Only just
		// above centre now: with the panel gone from this shape the space under
		// the window went spare, and the plate above it is what the window runs
		// out of room against — so it sits lower than it used to.
		winY: 0.45,
		// What sits between the window and the button here is the year's tuning
		// band, not the portrait panel — same slot, so the button still hangs off
		// controlsGap + controlsHeight.
		controlsGap: '20px',
		controlsHeight: '80px',
		buttonGap: '22px',
		stack: false
	},
	square: {
		win: 'clamp(280px, min(62vw, 56vh), 700px)',
		winAspect: 4 / 3,
		winY: 0.4,
		controlsGap: '20px',
		controlsHeight: '80px',
		buttonGap: '22px',
		stack: false
	},
	portrait: {
		win: 'min(92vw, 62vh, 560px)',
		winAspect: 4 / 3,
		winY: 0.36,
		controlsGap: '18px',
		controlsHeight: '162px',
		buttonGap: '16px',
		stack: true
	}
};

// The custom properties one chassis becomes. Everything that writes these goes
// through here, so there is exactly one list.
function vars(kind) {
	const c = CHASSIS[kind] || CHASSIS.landscape;
	return {
		'--win': c.win,
		'--win-aspect': String(c.winAspect),
		'--win-y': `${c.winY * 100}%`,
		'--controls-gap': c.controlsGap,
		'--controls-h': c.controlsHeight,
		'--button-gap': c.buttonGap
	};
}

// ── The way home ─────────────────────────────────────────────────────────────
// How much of the viewport the room's monitor glass ends up covering when the
// camera has finished flying into it.
//
// EXACTLY ONE, and the word exactly is the whole of it. The calculator paints
// itself into the live glass rect every frame (Calculator.svelte fitTo), so at
// the end of the flight its fit is min(rect.w/vw, rect.h/vh) — and at 1.0 the
// glass COVERS the viewport, that ratio is 1, and the fit has become the
// identity of its own accord. The move simply arrives.
//
// At 0.55 it did not. The camera stopped with the glass a bit over half the
// frame, the calculator was still painted at 0.55 inside it, and then the
// landing cleared the transform — which is a cut from a screen on a desk to a
// full-screen machine, in one frame, at the end of an otherwise continuous
// zoom. It read as a flash back to the homepage, because that is what it was.
//
// So the run goes all the way in. The last thing you see of the room is the
// glass filling out to the edges — and what is painted on it by then is one
// flat yellow panel (see `booting`), so it fills to yellow and the machine
// comes up on top of it.
export const RETURN_FILL = 1.0;

// Written onto :root so the CSS can lay the chassis out from the same numbers
// the 3D uses. Called on mount and on every resize.
export function applyChassisVars(kind) {
	if (typeof document === 'undefined') return;
	const root = document.documentElement.style;
	for (const [k, v] of Object.entries(vars(kind))) root.setProperty(k, v);
}

// The same three sets as plain CSS, guarded by the same thresholds aspectKind()
// uses, for +layout.svelte to put in the document head.
//
// This exists because the chassis has to be RIGHT ON THE FIRST PAINT. The vars
// above are only written once JS has run, so anything hard-coded as a fallback
// is a second copy of these numbers that silently goes stale — which is exactly
// what happened: styles.css still held a 420px 4:3 window long after the config
// had moved on, and every load visibly jumped from one to the other. Generated
// from CHASSIS, it cannot drift, and it covers all three shapes with no JS at
// all, so there is nothing left to snap.
export function chassisCss() {
	const block = (kind) =>
		Object.entries(vars(kind))
			.map(([k, v]) => `${k}:${v}`)
			.join(';');
	// Least specific first: a portrait viewport matches the square query too, so
	// portrait has to come last to win.
	return [
		`:root{${block('landscape')}}`,
		`@media (max-aspect-ratio:${ASPECT.landscapeAbove * 5}/5){:root{${block('square')}}}`,
		`@media (max-aspect-ratio:${ASPECT.portraitBelow * 100}/100){:root{${block('portrait')}}}`
	].join('');
}
