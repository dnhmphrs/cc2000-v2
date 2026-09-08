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

// ── The result panel ─────────────────────────────────────────────────────────
// The answer is drawn INSIDE the monitor the run landed in, and those are four
// different shapes. One fixed layout cannot serve all of them: sized off width
// alone it is a widescreen band, which is right for the 2010s and leaves the
// three squarish sets showing a letterbox floating in a mostly empty screen.
//
// So the panel picks a reference box by the shape of the glass it is in and
// fills it. `ref` is the size the panel is drawn 1:1 at; the scale is whichever
// of the two dimensions runs out first. A NARROWER reference buys bigger type
// in a narrow screen, paid for in title lines — which a tall screen has room
// for and a wide one does not.
export const RESULT_PANEL = {
	// How small the panel may be drawn before it stops being readable, and how
	// large before it stops reading as a screen.
	scale: [0.55, 1.35],

	// Spotify's own compact card is 152px tall and it draws nothing bigger until
	// 232. Past 152 the embed would only be stretched, so whatever height is left
	// over becomes breathing space around the panel instead. Real pixels, not
	// scaled ones — the breakpoint is the player's, not ours.
	playerMax: 152,

	// Smallest the player may be squeezed to, in panel units.
	playerMin: 72,

	// First match wins, so these run widest-first and the last one has to be 0.
	shapes: [
		{ name: 'wide', from: 1.45, ref: { w: 420, h: 190 }, titleLines: 2, artistLines: 1 },
		{ name: 'square', from: 0.85, ref: { w: 330, h: 250 }, titleLines: 3, artistLines: 2 },
		// Nothing is this shape today. It is here so that a monitor taller than it
		// is wide cannot land on the widescreen layout by default, which is the
		// exact failure this config exists to fix.
		{ name: 'tall', from: 0, ref: { w: 300, h: 330 }, titleLines: 4, artistLines: 2 }
	]
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

// Where the machine's window sits down the viewport, 0..1. The launch warps the
// screen into the lens about that point, and it has to be readable from JS as a
// number now that the launch also has a fit to compose with. Same source as
// --win-y, so the two cannot drift.
export function windowY(kind) {
	return (CHASSIS[kind] || CHASSIS.landscape).winY;
}

// ── The way home ─────────────────────────────────────────────────────────────
// How much of the viewport the room's monitor glass ends up covering when the
// camera has finished flying into it.
//
// BELOW ONE, and that is the whole of the change: the run used to end with the
// glass filling the frame, at which point the calculator was simply fullscreen
// again and the bedroom you had just been delivered into was gone. Stopping
// short leaves the machine sitting IN the room, on the desk, with the room
// round it — which is where the second run is operated from.
export const RETURN_FILL = 0.55;

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
