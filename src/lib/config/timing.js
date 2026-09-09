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
	// Black air, one swimmer riding the lens, and three hundred units of travel
	// to an ovum that starts as a warmth in the fog.
	//
	// FOURTEEN AND A HALF SECONDS, and that is the point of it. See TUNNEL's
	// note in config/space.js: the arrival is made of the length of the approach
	// and nothing else, and every version of this that shortened the run turned
	// the arrival into a zoom. The camera holds ONE speed for three quarters of
	// it — glide(), not an ease-in-out — so you stop noticing you are moving,
	// which is the only way the last thirty units can feel like arriving.
	//
	//  0    .05      .14            .66              .78    .94   1.0
	//  |motes|swimmer |the long haul, orbit closing   |dive  |in   |hold
	//       |halo, then the ovum in it .58|
	flyIn: {
		duration: 14.5,

		// The calculator is still on screen, warping into the lens. Documentation
		// only — the machine runs its own `launch` in seconds — but the two have
		// to describe the same 1.6 seconds or the hand-over is visible.
		warp: [0.0, 0.11],

		// The mote field. Up on the FIRST FRAME, deliberately: the cut into this
		// scene happens behind the calculator, and what is underneath it has to be
		// moving before the calculator clears. It goes out as you arrive — the
		// last beat is the ovum and nothing else.
		motesIn: [0.0, 0.04],
		motesOut: [0.8, 0.94],

		// The swimmer comes past FROM BEHIND — thirty-four units back, straight up
		// the axis, easing the whole way — and settles in front of the lens. Four
		// seconds of it, because the shot it is doing is the one at the top of
		// Star Wars and that shot is slow.
		spermIn: [0.0, 0.32],

		// It breaks formation and goes in. Its own curve, and a hard one: this is
		// the only acceleration in the scene and it happens against a camera that
		// is by then slowing down.
		dive: [0.78, 0.94],
		divePower: 2.8,
		spermGone: [0.925, 0.95],

		// The camera's own run in — glide(), and this is the fraction of it spent
		// at CONSTANT speed before the stop begins.
		hold: 0.78,

		// The bank, and how far the camera wanders off the axis while it holds it.
		// Both ease out to level before the hand-over: the next scene is square to
		// the frame, and arriving tilted is a jolt.
		level: [0.7, 0.92],
		drift: 1.1,

		// The glow first, then the ovum in it. The halo OPENS EARLIER and CLOSES
		// EARLIER than the shell, which is the whole trick of the arrival: there
		// is a warmth in the black before there is anything in the warmth.
		haloIn: [0.05, 0.48],
		haloOut: [0.8, 0.95],
		haloPeak: 1.0,
		// An ENABLE, not a fade: what actually brings the cage up is the fog
		// thinning as the camera closes on it. See FlyIn.svelte.
		eggIn: [0.06, 0.34],

		// ── THE FLOWER ───────────────────────────────────────────────────────
		// A ruled grid hanging in the air behind the ovum, five parallel bands of
		// it, flat and facing you. Then it TURNS INTO ITS OWN EXPONENTIAL — the
		// bands curling into five petals radiating from the middle, every line
		// bending through its own logarithmic spiral on the way — and then the
		// whole plane CLOSES onto the ovum by inverse stereographic projection,
		// shutting over it and the swimmer like a flower at dusk.
		//
		// What it closes into is a grid ON the sphere, which is the surface the
		// next scene's standing wave comes up on. See world/sheet.js.
		sheetIn: [0.4, 0.58],
		sheetTurn: [0.5, 0.78],
		sheetClose: [0.66, 0.99],

		// ── THE HAND-OVER ────────────────────────────────────────────────────
		// There is no flash any more. The fly-in simply ENDS ON THE PICTURE THE
		// CONCEPTION OPENS ON: the outer cage goes as you pass through it, the air
		// walks down to the void, the backdrop flattens to the same void, and what
		// is left in the middle of the frame is the core — a dark sphere with a
		// gold rim, at exactly the size and exactly the place the void's own gold
		// circle is drawn at. Nothing has to appear and nothing has to leave.
		//
		// (FlyIn.svelte derives the core's size from the void's framing every
		// frame, so this holds on any screen. See TUNNEL.coreRatio.)
		shellOut: [0.8, 0.955],
		settle: [0.78, 0.96],
		// The rim answers the entry. A nudge, not a flash — the wave that breaks
		// across the surface at the top of the next scene is the payoff, and this
		// must not spend it.
		strike: [0.93, 1.0]
	},

	// ── Conception ───────────────────────────────────────────────────────────
	// It opens on the fly-in's last frame, unchanged, and it is the same object:
	// the swimmer has just gone in, and for a beat nothing happens.
	//
	// Then the surface answers, and it DIVIDES. A standing wave comes up on it —
	// the sum of P₆(n·aᵢ) over the icosahedron's six five-fold axes — and the
	// axes come in ONE AT A TIME. One axis is a dumbbell: two antinodes, a sphere
	// pulling into two. Two axes, four. Six, twelve. And twelve antinodes on a
	// sphere is an icosahedron.
	//
	// Degree 6 is the first degree at which a non-constant icosahedral invariant
	// exists at all, so every step of that division is forced rather than chosen.
	// See world/materials.js coreMaterial().
	//
	// TWO BEATS, not three. There used to be a generic ripple, then the mode,
	// then a compass-and-pentagon derivation that rebuilt from scratch what the
	// mode had already produced. The wave IS the icosahedron by the time it has
	// finished, so nothing is rebuilt: the twelve antinodes are struck in place,
	// the six axes the sum was taken over are drawn as the six long diagonals —
	// which is literally what they are — and the thirty edges close between
	// corners that are already there.
	conception: {
		duration: 6.4,

		// The flower is still shut over it. It goes as the field comes up through
		// it — the lattice on the sphere becoming the wave on the sphere.
		sheetOut: [0.05, 0.3],
		// The field lights up on the surface it was already sitting on.
		wake: [0.0, 0.09],
		// And divides. 0 → 6 axes.
		divide: [0.04, 0.54],
		// The mode ringing as it is excited, damped out as it settles. This is the
		// only motion on the surface and it is an excited normal mode relaxing,
		// not a texture scrolling.
		ring: [0.0, 0.66],
		ringPeak: 0.28,
		// How far the wave moves the skin, as a fraction of the core's radius.
		// Large: a cell pulling itself into two is a change of shape.
		amp: 0.13,

		// The solid, in the order the field builds it.
		corners: [0.5, 0.6],
		spokes: [0.58, 0.76],
		edges: [0.62, 0.86],
		// And the surface drops to a ghost, because thirty edges drawn inside an
		// opaque ball are thirty edges nobody can see.
		ghost: [0.58, 0.8],

		// THE UNION. The last edge closes and the whole figure answers at once.
		union: [0.86, 1.0],
		unionPeak: 1.3
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 11.5,

		// The camera pulls BACK as the panes come out. The conception was close on
		// the solid; six rooms will not fit in that frame, so the opening move of
		// this scene is to make room for them — and that pull-back is most of why
		// the panes read as coming out rather than merely appearing.
		pullBack: [0.0, 0.25],

		// The panes come out of the frame, as DRAFTING first: the golden rectangle,
		// its dimension lines, its ratio bar, its spiral. The rooms only fade in
		// through that once it is out, which is what stops the two reading as one
		// undifferentiated bloom, and what makes the machine look as though it is
		// working the answer out rather than displaying it.
		open: [0.0, 0.17],
		schematic: [0.015, 0.19],
		// A BEAT ON THE WORKING ALONE. The arms are out, the spirals are turning at
		// the ends of them, and there is nothing else on screen — the rooms do not
		// start arriving until a second and a half later. That gap is the only
		// chance in the run to actually read the golden rectangle's subdivision,
		// and it was two frames long.
		rooms: [0.26, 0.42],
		// And the drafting steps back once the rooms are up, or it is clutter over
		// the only thing in the scene with any colour in it.
		draftOut: [0.34, 0.5],

		// The sphere stays — it is the thing the frame is held inside — but thins
		// and opens out off the frame it was skin-tight on, so the rooms come
		// THROUGH it rather than out from under it.
		shellThin: [0.05, 0.22],
		sphereGrow: [0.015, 0.28],

		// The 24-cell hung around the scene. It belongs to the search and nothing
		// else — it arrives with the panes and goes out with the zoom. It is a
		// SPACE, so it never comes above a whisper: the moment it is as bright as
		// the drafting it stops being the room and becomes furniture in it.
		cageIn: [0.12, 0.3],
		cagePeak: 0.5,

		// ── THE SURVEY ───────────────────────────────────────────────────────
		// The whole assembly, fully out, BEFORE the machine starts choosing. This
		// is the beat V2 had and every version since has been missing: six rooms
		// hanging off a solid, turning slowly, seen as one object — so that when
		// the clocking starts you already know what is being clocked through.
		//
		// It is also the only place in the run with any perspective in it. The
		// lens opens from ICOSA.fov to ICOSA.fovWide and the camera walks in to
		// match, which is a true dolly zoom: the framing does not change and the
		// SPACE does. Near rooms swell off the frame, far ones fall away, and the
		// thing stops being a diagram for two and a half seconds.
		survey: [0.34, 0.54],
		// Yaw and pitch it walks through, in radians. The yaw is a FULL sine — out
		// one way, back through the rest pose, out the other, home — so the beat
		// both moves properly and ends flat and facing, which is where the search
		// has to start from.
		surveyTurn: 0.95,
		surveyTilt: 0.34,

		// The search: turn a decade square to camera, HOLD it, turn to the next.
		// The point is not to fake a search — it is that each turn shows another
		// decade's artwork, which is otherwise built and never seen.
		search: [0.54, 0.87],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the hold. The last step
		// is all turn, because the fall follows it straight away.
		searchSpin: 0.7,
		// NOTHING MOVES BUT THE SOLID. The camera does not lean, and the other five
		// rooms do not dim, pulse or step back — both were tried and both make a
		// precise instrument look like a slideshow with a transition on it. The
		// turn, and the stop at the end of it, are the whole event.
		// How the turn itself moves. A high power is a real acceleration out of
		// rest and a real deceleration into the next decade, which is what stops
		// this reading as a turntable; 1.0 would be a flat constant pivot.
		searchEase: 2.6,

		// ── The fall ─────────────────────────────────────────────────────────
		// A plain, dead-centre zoom on the WHOLE SCENE, on one symmetric ease, and
		// nothing in it is staggered. The depth-parallax version — where the bed
		// rushed past first, then the desk, then the screen — was tried and it is
		// worse: it pulls the room apart at the exact moment it is supposed to
		// become a place. The scene goes in as one thing.
		zoom: [0.87, 1.0],

		// How hard the blueprint field burns. It is the machine's own effort.
		flare: [0.08, 0.9]
	},

	// ── Room ─────────────────────────────────────────────────────────────────
	// Waits for the operator. The way back is calculator.arrive, because the two
	// halves of it — the camera flying into the monitor and the calculator
	// growing out of it — are one move and must share one duration.
	room: {
		resultIn: 0.45
	}
});

// THERE IS NO LONGER A BLOW-OUT. The fly-in used to end on a white flash,
// because the world underneath it changed — deep blue air on one side, the void
// on the other — and a cut like that needs covering.
//
// It does not change any more. Scenes 2, 3 and 4 are one black-and-gold world,
// and the fly-in ends on the exact frame the conception opens on: the same dark
// sphere, the same gold rim, the same size, on the same void. So the flash was
// not smoothing a transition, it was ANNOUNCING one — and what it actually did
// was break the only three scenes that are supposed to run as one shot into two
// halves with a bang in the middle, and make the conception look as though the
// run had reset.
//
// The envelope is kept because the machinery is cheap and something may yet want
// it; nothing throws it.
export const FLASH_HOLD = 0.14;
export const FLASH_FALL = 0.34;

// Canvas fade at first paint, and again when the run resets.
export const CANVAS_FADE = 1.2;
