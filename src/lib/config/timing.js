// ── Timing ───────────────────────────────────────────────────────────────────
// Every animation in the experience is defined HERE, and nowhere else.
//
// The rule: a scene has ONE duration in seconds, and everything that happens
// inside it is a window of two fractions of that duration. Change `duration`
// and the whole scene stretches or compresses in proportion; move a window and
// only that beat moves. No scene file contains a number of seconds.
//
// Read a window with span() from './ease':
//
//     import { SCENES, span } from '$lib/config';
//     const p = t / SCENES.flyIn.duration;          // 0..1 through the scene
//     const eggIn = span(p, SCENES.flyIn.eggIn);    // 0..1 through that beat
//
// Windows may overlap freely — that is usually what you want, because beats
// that cross-fade read better than beats that queue.
//
// ── Scrubbing ────────────────────────────────────────────────────────────────
// ?speed=6 in the URL runs the whole thing six times faster, and ?speed=0.25
// four times slower. Only the SECONDS are scaled — every window is a fraction,
// so the choreography is identical, just played at a different rate. Use it to
// get to the beat you are working on without sitting through the run.
const SPEED = (() => {
	if (typeof window === 'undefined') return 1;
	const v = Number(new URLSearchParams(window.location.search).get('speed'));
	return Number.isFinite(v) && v > 0 ? v : 1;
})();

function scale(scenes) {
	if (SPEED === 1) return scenes;
	const out = {};
	for (const [name, s] of Object.entries(scenes)) {
		out[name] = { ...s };
		// Only true seconds are scaled; every window is a fraction of a duration
		// that is itself being scaled, so scaling those too would double up.
		for (const k of [
			'duration',
			'charInterval',
			'lineGap',
			'typeDelay',
			'launch',
			'arrive',
			'resultIn',
			'again'
		]) {
			if (typeof out[name][k] === 'number') out[name][k] /= SPEED;
		}
	}
	return out;
}

export const SCENES = scale({
	// ── Calculator ───────────────────────────────────────────────────────────
	// Not a timeline: it waits for the operator. These are the two moves it
	// makes, and `launch` has to agree with flyIn.warp below, because they are
	// the same move seen from the DOM and from the camera.
	calculator: {
		// Typing on the CRT.
		charInterval: 0.022,
		lineGap: 0.22,
		typeDelay: 0.6,

		// Pressing calculate: the screen is pushed into the lens with real
		// perspective, so the frame warps outward rather than flatly scaling.
		launch: 1.6,

		// Coming back the other way: the whole calculator is drawn 1:1 inside the
		// room's monitor and then flown out of it.
		arrive: 2.1,
		// Below this much of the final size the fiddly controls are hidden — at
		// monitor scale they are unreadable and unclickable, so the screen shows
		// only its cartoon self until it is nearly home.
		controlsAt: 0.55
	},

	// ── FlyIn ────────────────────────────────────────────────────────────────
	flyIn: {
		duration: 6.4,

		// The calculator is still on screen, warping into the lens. Nothing in
		// the 3D should draw attention until this is over.
		warp: [0.0, 0.25],

		// The egg resolving out of the fog.
		eggIn: [0.04, 0.52],

		// The sperm comes from behind the camera, overtakes, and is ahead of it.
		spermIn: [0.14, 0.26],
		// Then it leaves the camera behind and accelerates into the egg. The
		// power is what makes it read as speeding up rather than travelling —
		// it holds station in front of the lens, then goes. Opening this window
		// earlier or dropping the power turns it into a dot very quickly, because
		// the egg is 150 units away and it is heading for all of that.
		spermRun: [0.45, 0.98],
		spermRunPower: 3.2,
		// It is inside the shell by the end of this.
		spermGone: [0.9, 0.99],

		// The camera's own run in. Its own power, so the two can be tuned apart:
		// the camera easing off while the sperm accelerates is what sells it.
		approachPower: 1.35,

		// Deep blue turning white, under the blow-out that ends the scene.
		whiten: [0.84, 1.0]
	},

	// ── Conception ───────────────────────────────────────────────────────────
	// The holy one, and deliberately the plainest: a sphere forms out of the
	// white, and the icosahedron appears inside it. Nothing turns, nothing
	// extends. This is the beat to build into.
	conception: {
		duration: 4.5,

		// A sphere forms in the middle of the white.
		sphere: [0.0, 0.22],
		// The icosahedron's wireframe appears inside it, and the yolk goes.
		wire: [0.18, 0.78]
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 8.0,

		// The panes come out of the sphere.
		open: [0.0, 0.18],
		// The sphere draws in behind them and stays as a bubble.
		shellDrawIn: [0.06, 0.2],

		// The search: turn a decade square to camera, look at it, turn to the
		// next. The point is not to fake a search — it is that each turn shows
		// another decade's artwork, which is otherwise built and never seen.
		search: [0.14, 0.8],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the look. The last
		// step is all turn, because the zoom follows it straight away.
		searchSpin: 0.62,
		// How far the rooms that are not being looked at step back.
		searchDim: 0.45,

		// Then in. Accelerates away from rest, then eases onto the final frame.
		zoom: [0.8, 1.0],
		zoomPower: 2.2,

		// The field's one appearance, if it is switched on.
		flare: [0.1, 0.86]
	},

	// ── Room ─────────────────────────────────────────────────────────────────
	// Waits for the operator. The way back is calculator.arrive, because the two
	// halves of it — the camera flying into the monitor and the calculator
	// growing out of it — are one move and must share one duration.
	room: {
		resultIn: 0.45
	}
});

// The one blow-out in the run: the end of the fly-in, into conception.
export const FLASH_DECAY = 2.4;

// Canvas fade at first paint, and again when the run resets.
export const CANVAS_FADE = 1.2;
