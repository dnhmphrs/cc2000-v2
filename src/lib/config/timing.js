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
		// And then it is leaving, from that moment on — the window opens where
		// spermIn closes so there is no stretch where it holds station and then
		// bolts. `power` is the whole character of it. Measure it as the gap
		// between sperm and camera rather than guessing: at 2.2 that gap opened
		// at a near-constant rate from a fifth of the way in, so it read as
		// travelling away rather than accelerating, and it was a third of the way
		// gone by the halfway mark. At 3.2 it rides in front of the lens for a
		// beat and then the gap grows by more every step of the way to the egg,
		// which is what speeding up actually looks like.
		spermRun: [0.26, 0.98],
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
	// White, a beat of nothing, and then three things in order: the sphere, the
	// frame inside it, and the figure the frame is built on. Nothing turns.
	//
	//   0     0.05    0.26      0.48         0.84       1.0
	//   |hold | sphere |  wire   |   rects    |  rest    |
	//   |white| fades  | all 30  | the three  | the whole|
	//   |     | up     | at once | golden ones| figure   |
	//
	// The hold and the rest are the GAPS either side, not settings — the three
	// windows below are the whole scene.
	conception: {
		duration: 4.6,

		// The sphere fades up out of the white, at the frame's exact circumradius
		// — so what appears is one object, not a ball with something in it.
		sphere: [0.05, 0.26],

		// The frame draws itself on inside it. Every edge at once — the stagger is
		// gone, see world/lattice.js — so this only has to be long enough to see
		// the strokes travel.
		wire: [0.22, 0.48],

		// Then the three golden rectangles, one after another. This is the beat
		// that says what the shape is made of, and the rooms come off these very
		// rectangles in the next scene.
		rects: [0.5, 0.84]
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 8.0,

		// The panes come out of the frame. The sphere stays — it is the thing the
		// frame is held inside — but thins to shellFaint so the rooms are not seen
		// through a wash. The frame itself is left exactly as the conception drew
		// it: same weight, no fill.
		open: [0.0, 0.18],
		shellThin: [0.04, 0.22],
		// And the sphere opens out off the frame it was skin-tight on, so the
		// rooms come THROUGH it rather than out from under it.
		sphereGrow: [0.0, 0.34],

		// The search: turn a decade square to camera, look at it, turn to the
		// next. The point is not to fake a search — it is that each turn shows
		// another decade's artwork, which is otherwise built and never seen.
		search: [0.14, 0.8],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the look. The last
		// step is all turn, because the zoom follows it straight away.
		searchSpin: 0.7,
		// Whole extra revolutions folded into each turn BETWEEN decades, about a
		// different axis every time. A whole number is the identity at both ends,
		// so the poses either side are untouched and only the route between them
		// changes — from the shortest arc to a tumble, which is what stops four
		// turns in a row from being the same turn four times. The turn onto the
		// ANSWER takes none of this: it is the one clean move, and that is what
		// makes it land.
		searchWhirl: 1,

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
