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

		// The swimmer comes past from behind and settles in front of the lens.
		spermIn: [0.015, 0.13],
		// And then its orbit CLOSES: wide and wild while it is still overtaking
		// you, tightening to a steady corkscrew once you are travelling together.
		// See TUNNEL.spermOrbit — the radius is V1's, and this is the one liberty
		// taken with it.
		close: [0.08, 0.66],

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
	// Then the surface answers. A ring of waves breaks from the point of entry
	// and runs round the sphere — and RELAXES, over the next two seconds, into a
	// standing wave: the lowest one a sphere has that is symmetric under the
	// icosahedral group, whose twelve antinodes ARE the twelve vertices. See
	// world/materials.js coreMaterial(); it is the sum of P6(n·a) over the six
	// five-fold axes and it is not a decoration, it is the answer arriving as
	// physics before it arrives as geometry.
	//
	// The twelve strike. The page squares up. And only then does the machine
	// DERIVE what it has already been shown: compass, pentagon, pentagram —
	// which is where phi actually comes from — the ratio measured off as a bar,
	// three golden rectangles, and two of them folding up out of the page. Every
	// length is exact; see world/construction.js.
	//
	// It ends where it began. The union's twelve corners land on the twelve
	// antinodes the wave put there four seconds earlier, in the same pose, to the
	// pixel — a promise and the paying of it.
	conception: {
		duration: 9.0,

		// The beat of nothing, and then the strike.
		wake: [0.03, 0.1],
		// Travelling waves out of the point of entry.
		ripple: [0.02, 0.26],
		// Ripple → the icosahedral standing wave. This is the whole idea.
		relax: [0.13, 0.35],
		// The twelve antinodes brighten and are struck as points.
		lobes: [0.28, 0.4],
		// The surface goes, leaving its rim — which is the circumcircle.
		waveOut: [0.34, 0.43],
		coreOut: [0.35, 0.44],
		// And the page turns square to you to be drawn on. The twelve go with it.
		square: [0.33, 0.45],

		// ── The derivation ───────────────────────────────────────────────────
		circle: [0.47, 0.58],
		pentagon: [0.56, 0.65],
		star: [0.63, 0.71],
		bar: [0.69, 0.77],
		rects: [0.75, 0.84],
		// The guides have done their work by the time the rectangles are out.
		guidesOut: [0.8, 0.88],
		fold: [0.8, 0.93],
		edges: [0.88, 0.98],

		// THE UNION. The last edge closes and the whole figure answers at once:
		// the twelve corners strike, the line-work overdrives, the rim flares.
		union: [0.93, 1.0],
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
		open: [0.0, 0.16],
		schematic: [0.015, 0.2],
		rooms: [0.16, 0.34],
		// And the drafting steps back once the rooms are up, or it is clutter over
		// the only thing in the scene with any colour in it.
		draftOut: [0.27, 0.44],

		// The sphere stays — it is the thing the frame is held inside — but thins
		// and opens out off the frame it was skin-tight on, so the rooms come
		// THROUGH it rather than out from under it.
		shellThin: [0.05, 0.22],
		sphereGrow: [0.015, 0.28],

		// The 24-cell hung around the scene. It belongs to the search and nothing
		// else — it arrives with the panes and goes out with the zoom. It is a
		// SPACE, so it never comes above a whisper: the moment it is as bright as
		// the drafting it stops being the room and becomes furniture in it.
		cageIn: [0.1, 0.28],
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
		survey: [0.28, 0.5],
		// Yaw and pitch it walks through while it does, in radians.
		surveyTurn: 1.25,
		surveyTilt: 0.3,

		// The search: turn a decade square to camera, HOLD it, turn to the next.
		// The point is not to fake a search — it is that each turn shows another
		// decade's artwork, which is otherwise built and never seen.
		search: [0.5, 0.87],
		// Three decades visited before the answer, then the answer itself.
		searchSteps: 4,
		// Fraction of each step spent turning; the rest is the hold. The last step
		// is all turn, because the fall follows it straight away.
		searchSpin: 0.7,
		// How far the other five step back for it — and they STEP, they do not
		// breathe: it comes on over a twentieth of the slot and stays there until
		// the next turn takes it off. A pulse reads as five rooms sighing; a step
		// reads as a machine selecting one.
		//
		// AND THE CAMERA DOES NOT MOVE. Not a lean, not a nudge, nothing. The
		// clocking is rigid or it is nothing, and a frustum that pumps on every
		// candidate is the single loudest way to make a precise instrument look
		// like a slideshow transition.
		searchDim: 0.78,
		searchSnap: 0.06,
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
