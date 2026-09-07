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
	// White, a beat of nothing, a sphere, and the icosahedron drawing itself on
	// inside it. Nothing turns, and nothing else is added — the construction the
	// shape is built on is the computation's opening beat, not this one's.
	//
	//   0     0.06    0.3            0.8         1.0
	//   |hold | sphere |     wire     |   rest    |
	//
	// The hold and the rest are the GAPS either side, not settings.
	conception: {
		duration: 3.9,

		// The sphere fades up out of the white, at the frame's exact circumradius
		// — so what appears is one object, not a ball with something in it.
		sphere: [0.06, 0.3],

		// The frame draws itself on inside it. Every edge at once — the stagger is
		// gone, see world/lattice.js — so this only has to be long enough to see
		// the strokes travel.
		wire: [0.26, 0.8]
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 9.2,

		// The panes come out of the frame. The sphere stays — it is the thing the
		// frame is held inside — but thins to shellFaint so the rooms are not seen
		// through a wash. The frame itself is left exactly as the conception drew
		// it: same weight, no fill.
		open: [0.0, 0.2],
		shellThin: [0.04, 0.22],
		// And the sphere opens out off the frame it was skin-tight on, so the
		// rooms come THROUGH it rather than out from under it.
		sphereGrow: [0.0, 0.34],

		// The panes come out as PURE GEOMETRY — the golden spiral, the subdivision
		// squares, the 1:φ bar — and are left alone for a beat with nothing on
		// them. Only then do the decades arrive over the construction. That order
		// is the whole point: the rooms sit on the ratio, not the other way round.
		rooms: [0.3, 0.44],

		// The search: turn a decade square to camera, look at it, turn to the
		// next. The point is not to fake a search — it is that each turn shows
		// another decade's artwork, which is otherwise built and never seen.
		search: [0.44, 0.8],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the look. The last
		// step is all turn, because the zoom follows it straight away.
		searchSpin: 0.86,
		// The turns are eased gently and take nearly the whole of each step, so the
		// search reads as one continuous drift between decades rather than four
		// snap-and-hold moves. Anything sharper than this — and extra revolutions
		// were tried — reads as breakneck rather than as searching.
		searchEase: 1.5,

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
