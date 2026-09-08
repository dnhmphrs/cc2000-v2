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
		arrive: 2.1
	},

	// ── FlyIn ────────────────────────────────────────────────────────────────
	// Deep blue air, a pack of five, and a run at the egg.
	//
	//  0     0.10   0.23        0.30                    0.76        0.86   1.0
	//  |motes|      |the warp   |the run                |egg there  |white |
	//        |the pack comes past|                      |
	flyIn: {
		duration: 7.0,

		// The calculator is still on screen, warping into the lens. Documentation
		// only — the machine runs its own `launch` in seconds — but the two have
		// to describe the same 1.6 seconds or the hand-over is visible.
		warp: [0.0, 0.23],

		// The mote field. It is up on the FIRST FRAME, deliberately: the cut into
		// this scene happens behind the calculator, and what is underneath it has
		// to be moving before the calculator clears or the run opens on an empty
		// blue rectangle. It goes out under the blow-out.
		motesIn: [0.0, 0.09],

		// The pack comes past from behind and spreads off the axis.
		packIn: [0.09, 0.3],
		// How the pack falls back once the run starts. Lower than the hero's own
		// power, so the gap opens early and keeps opening.
		packLagPower: 1.0,
		// They are the losers: never as bright as the one you are with.
		packOpacity: 0.4,

		// The hero comes past from behind, overtakes, and is ahead of it.
		spermIn: [0.13, 0.3],
		// And then it is leaving, from that moment on — the window opens where
		// spermIn closes so there is no stretch where it holds station and then
		// bolts. `power` is the whole character of it: at 2.2 the gap opens at a
		// near-constant rate and it reads as travelling away; at 3.2 it rides in
		// front of the lens for a beat and then the gap grows by more every step
		// of the way to the egg, which is what speeding up actually looks like.
		spermRun: [0.3, 0.98],
		spermRunPower: 3.2,
		// It is inside the shell by the end of this.
		spermGone: [0.9, 0.99],

		// The camera's own run in. Its own power, so the two can be tuned apart:
		// the camera easing off while the sperm accelerates is what sells it.
		approachPower: 1.35,

		// The bank, and how far the camera wanders off the axis while it holds it.
		// Both ease out to level before the blow-out: the next scene is
		// orthographic and square to the frame, and arriving tilted is a jolt.
		level: [0.7, 0.94],
		drift: 1.1,

		// The glow first, then the egg in it. The halo OPENS EARLIER and CLOSES
		// EARLIER than the shell, which is the whole trick of the arrival: there
		// is a brightness in the fog before there is anything in the brightness.
		haloIn: [0.16, 0.64],
		haloPeak: 1.0,
		eggIn: [0.3, 0.76],

		// Deep blue turning white, under the blow-out that ends the scene.
		whiten: [0.86, 1.0]
	},

	// ── Conception ───────────────────────────────────────────────────────────
	// The hinge of the whole run: the frame is white when this opens and black
	// by the time it has finished its first beat, and everything after it is on
	// the void.
	//
	// THREE VARIANTS, and which one runs is config/dev.js CONCEPTION (or
	// ?conception=construct|strike|divide in the URL). They share a duration and
	// a hand-over — the icosahedron, centred, at ICOSA.tilt — and nothing else.
	// See scenes/Conception.svelte.
	conception: {
		duration: 5.4,

		// ── construct: the derivation ────────────────────────────────────────
		// A compass sweep, the pentagon inscribed in it, the pentagram inside
		// THAT — which is where phi actually comes from — the three golden
		// rectangles read off the ratio, and two of them folding up out of the
		// page into the solid.
		//
		// The frame is at IDENTITY for all of this, which is the one pose in
		// which the first golden rectangle is exactly square to the camera, and
		// turns to ICOSA.tilt on the fold. The drawing becoming a solid and the
		// page turning away are one move.
		cCircle: [0.09, 0.26],
		cPentagon: [0.2, 0.36],
		cStar: [0.32, 0.47],
		cRects: [0.42, 0.6],
		// The guides have done their work by the time the rectangles are out.
		cGuidesOut: [0.56, 0.74],
		cFold: [0.56, 0.82],
		cEdges: [0.74, 0.95],
		cRim: [0.58, 0.78],

		// ── strike: the impact ───────────────────────────────────────────────
		// A singularity, twelve vertices thrown out of it on trails, and thirty
		// edges closing between them. It starts a few degrees off the resting
		// attitude and recoils onto it, so the solid settles rather than parks.
		sFlash: [0.0, 0.16],
		sThrow: [0.08, 0.44],
		sTrails: [0.08, 0.52],
		sTrailsOut: [0.5, 0.72],
		sEdges: [0.38, 0.74],
		sRim: [0.6, 0.84],
		sSettle: [0.1, 0.9],

		// ── divide: cleavage ─────────────────────────────────────────────────
		// One cell, then two, then four, then twelve — and the twelve are where
		// the vertices are.
		dCell: [0.02, 0.14],
		dCleave: [0.1, 0.62],
		dSnap: [0.58, 0.76],
		dEdges: [0.66, 0.92],
		dRim: [0.68, 0.88]
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 9.0,

		// The camera pulls BACK as the panes come out. The conception was close on
		// the solid; six rooms will not fit in that frame, so the opening move of
		// this scene is to make room for them — and that pull-back is most of why
		// the panes read as coming out rather than merely appearing.
		pullBack: [0.0, 0.32],

		// The panes come out of the frame, as DRAFTING first: the golden rectangle,
		// its dimension lines, its ratio bar, its spiral. The rooms only fade in
		// through that once it is out, which is what stops the two reading as one
		// undifferentiated bloom, and what makes the machine look as though it is
		// working the answer out rather than displaying it.
		open: [0.0, 0.2],
		schematic: [0.02, 0.26],
		rooms: [0.2, 0.44],
		// And the drafting steps back once the rooms are up, or it is clutter over
		// the only thing in the scene with any colour in it.
		draftOut: [0.34, 0.56],

		// The sphere stays — it is the thing the frame is held inside — but thins
		// and opens out off the frame it was skin-tight on, so the rooms come
		// THROUGH it rather than out from under it.
		shellThin: [0.06, 0.28],
		sphereGrow: [0.02, 0.36],

		// The 24-cell hung around the solid. It belongs to the search and nothing
		// else — it arrives with the panes and goes out with the zoom.
		cageIn: [0.12, 0.36],

		// The search: turn a decade square to camera, look at it, turn to the
		// next. The point is not to fake a search — it is that each turn shows
		// another decade's artwork, which is otherwise built and never seen.
		search: [0.26, 0.82],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the look. The last
		// step is all turn, because the zoom follows it straight away.
		searchSpin: 0.76,
		// How far the other five step back during that look, and how far the
		// camera leans in on it. Both are pulses — in and out across the pause —
		// so they read as attention rather than as five rooms switching off, and
		// the lean stays small because the fall at the end of the scene is the
		// zoom and this must not spend it.
		searchDim: 0.55,
		searchPush: 0.13,
		// How the turn itself moves. A high power is a real acceleration out of
		// rest and a real deceleration into the next decade, which is what stops
		// this reading as a turntable; 1.0 would be a flat constant pivot.
		searchEase: 2.6,
		// How far off the direct arc each turn bows, in radians. The shortest path
		// between two poses is the dullest one — this routes each turn through a
		// control pose to the side of it, alternating which side, so the frame
		// swings through the move rather than pivoting flatly across it.
		searchBow: 0.5,

		// Then in. Accelerates away from rest, then eases onto the final frame.
		zoom: [0.82, 1.0],
		zoomPower: 2.2,

		// How hard the blueprint field burns. It is the machine's own effort.
		flare: [0.1, 0.88]
	},

	// ── Room ─────────────────────────────────────────────────────────────────
	// Waits for the operator. The way back is calculator.arrive, because the two
	// halves of it — the camera flying into the monitor and the calculator
	// growing out of it — are one move and must share one duration.
	room: {
		resultIn: 0.45
	}
});

// The one blow-out in the run: the end of the fly-in, into the conception. It
// is also the only CUT — the world underneath goes from deep blue air to the
// void while the frame is white — so it is shaped rather than merely decayed:
// pure white for a beat, then gone. An exponential fall spends most of its
// length as a grey veil over the scene it is supposed to be hiding.
//
// The fall has to be at least as long as the ground's own ease to the void
// (components/Background.svelte, ~0.3s) or the black arrives before the white
// has finished leaving.
export const FLASH_HOLD = 0.14;
export const FLASH_FALL = 0.34;

// Canvas fade at first paint, and again when the run resets.
export const CANVAS_FADE = 1.2;
