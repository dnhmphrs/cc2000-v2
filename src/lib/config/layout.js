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
		win: 'clamp(300px, min(38vw, 56vh), 620px)',
		winAspect: 4 / 3,
		// Vertical centre of the window, as a fraction of the viewport. Above
		// centre, because the panel and the button hang below it.
		winY: 0.42,
		controlsGap: '20px',
		controlsHeight: '92px',
		buttonGap: '18px',
		stack: false
	},
	square: {
		win: 'clamp(280px, min(50vw, 58vh), 620px)',
		winAspect: 4 / 3,
		winY: 0.4,
		controlsGap: '20px',
		controlsHeight: '96px',
		buttonGap: '18px',
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

// Written onto :root so the CSS can lay the chassis out from the same numbers
// the 3D uses. Called on mount and on every resize.
export function applyChassisVars(kind) {
	if (typeof document === 'undefined') return;
	const c = CHASSIS[kind] || CHASSIS.landscape;
	const root = document.documentElement.style;
	root.setProperty('--win', c.win);
	root.setProperty('--win-aspect', String(c.winAspect));
	root.setProperty('--win-y', `${c.winY * 100}%`);
	root.setProperty('--controls-gap', c.controlsGap);
	root.setProperty('--controls-h', c.controlsHeight);
	root.setProperty('--button-gap', c.buttonGap);
}
