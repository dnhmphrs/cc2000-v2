import { ASPECT } from './space';
// ── Layout ───────────────────────────────────────────────────────────────────
// Screen-space sizes: the room monitors the result is drawn into, and the
// calculator's own chassis.

// ── The decade monitors ──────────────────────────────────────────────────────
// Where each decade room's screen GLASS sits, as fractions of that room's own
// artwork frame — cx/cy is the centre, w/h the size, both 0..1. The projection
// turns these into CSS pixels once the camera has settled on a room.
//
// Measured off the artwork by eye. If a result panel sits crooked in a monitor,
// this is the file to nudge.
export const SCREEN_GLASS = {
	'50s': { cx: 0.545, cy: 0.42, w: 0.73, h: 0.58 },
	'60s': { cx: 0.382, cy: 0.391, w: 0.64, h: 0.65 },
	'90s': { cx: 0.352, cy: 0.436, w: 0.51, h: 0.63 },
	'10s': { cx: 0.498, cy: 0.319, w: 0.94, h: 0.6 }
};

// Pull the published rect in slightly, so a panel drawn into it never laps over
// the bezel that the artwork drew around it. 1 = the measured glass exactly.
export const GLASS_SAFETY = 0.92;

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
		win: 'clamp(300px, min(46vw, 70vh), 980px)',
		winAspect: 3 / 2,
		// Vertical centre of the window, as a fraction of the viewport. Only just
		// above centre now: with the panel gone from this shape the space under
		// the window went spare, and the plate above it is what the window runs
		// out of room against — so it sits lower than it used to.
		winY: 0.47,
		controlsGap: '0px',
		// The panel under the window is portrait-only now: the date is on the
		// dials down the left of the chassis and the spicy level is the lever on
		// the right. Nothing sits between the window and the button here.
		controlsHeight: '0px',
		buttonGap: '30px',
		stack: false
	},
	square: {
		win: 'clamp(280px, min(62vw, 58vh), 700px)',
		winAspect: 4 / 3,
		winY: 0.4,
		controlsGap: '0px',
		controlsHeight: '0px',
		buttonGap: '30px',
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
