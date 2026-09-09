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
			'titleHold',
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
		// Typing on the title card — the black field the run opens on, before the
		// machine exists at all. See Calculator.svelte.
		charInterval: 0.022,
		lineGap: 0.22,
		typeDelay: 0.6,
		// And the beat it holds on the finished text before handing over to the
		// machine. Long enough to read the last line twice.
		//
		// NOT called `settle`: flyIn already has one of those and it is a window,
		// not a duration. Two keys with one name in one file is a trap even when
		// the scale() guard below happens to handle both.
		titleHold: 1.4,

		// Pressing calculate: the screen is pushed into the lens with real
		// perspective, so the frame warps outward rather than flatly scaling.
		launch: 1.6,

		// Coming back the other way: the whole calculator is drawn 1:1 inside the
		// room's monitor and then flown out of it — all the way out, until the
		// glass covers the frame (RETURN_FILL). That is roughly twice the travel
		// the half-way version had, so it gets the time to cover it.
		arrive: 2.9
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
		// ELEVEN, down from fourteen and a half. The pass keeps very nearly the
		// time it had — half the scene rather than 46% of a longer one, 5.5s
		// against 6.7 — and the whole of the cut comes out of the run-in after it,
		// which was 7.8 seconds of holding one speed toward a thing that was not
		// getting much bigger. Three hundred units still, covered a third faster.
		duration: 11.0,

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

		// ── THE PASS ─────────────────────────────────────────────────────────
		// The swimmer comes past FROM BEHIND — sixteen units back, straight up the
		// axis, entering low in the frame and rising as it pulls ahead. The shot at
		// the top of Star Wars.
		//
		// IT ARRIVES WHERE THE MACHINE ENDS. The window opens at zero, but the
		// swimmer is behind the lens for the first tenth of it and the calculator
		// is over the whole frame anyway — so what you SEE is: the machine warps
		// away, and the swimmer is there, coming up from under you. Then nearly
		// five seconds of it pulling slowly ahead, on easeOutQuint: it covers the
		// sixteen units behind the lens in the first quarter of the window and
		// spends the other three quarters crawling the last few. That is what
		// overtaking and then matching speed looks like, and it is the first thing
		// the run shows you, so there is nothing to hurry it toward. The ovum does
		// not begin to surface until it is most of the way done.
		spermIn: [0.0, 0.5],

		// ── WHERE THE FLIGHT STOPS TO ASK ────────────────────────────────────
		// Two progress marks, not windows: the scene HOLDS at each until the popup
		// is answered (see the `gate` store), so what follows each one is however
		// long the operator takes.
		//
		//   askDob    the swimmer is past the lens and pulling ahead, and it is the
		//             only thing on screen — the halo has not opened yet, so there
		//             is nothing behind the popup but black and a mote field.
		//   askSpicy  the ovum is up and the swimmer has something to swim at, so
		//             the second question is asked over the thing it is about.
		askDob: 0.24,
		askSpicy: 0.66,

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
		haloIn: [0.34, 0.68],
		haloOut: [0.8, 0.95],
		haloPeak: 1.0,
		// An ENABLE, not a fade: what actually brings the cage up is the fog
		// thinning as the camera closes on it. See FlyIn.svelte.
		eggIn: [0.38, 0.64],

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
	// It opens on the fly-in's last frame, unchanged: a dark body with a gold rim,
	// and the swimmer has just gone in.
	//
	// ONE MOVE, in four overlapping parts, and none of them starts from rest —
	// each is already under way when the next begins.
	//
	//   the SHIMMER  every mode of a struck sphere at once, RISING rather than
	//                arriving. It used to be at full amplitude on the first frame,
	//                which is a bang, not a strike. It comes up over a fifth of
	//                the scene and only then starts to damp.
	//   the SPLIT    the invariant's negative set — the nodal net between the
	//                twelve caps — pulled INTO the skin, and pulled PAST where it
	//                settles: `pinch` overshoots and relaxes back, which is a
	//                cleavage furrow constricting rather than a groove appearing.
	//   the LOBES    the twelve caps, coming up out of the net cut around them.
	//
	// None of it displaces the surface. The body is a perfect sphere throughout
	// and every one of these is drawn on its skin — see world/materials.js.
	//   the SOLID    struck ON the caps at the top of their travel, closing while
	//                the skin underneath is still moving.
	//
	// The field is the sum of P6(n.ai) over the icosahedron's six five-fold axes,
	// with ALL SIX ALWAYS IN. Degree 6 is the first degree at which a non-constant
	// icosahedral invariant exists at all, so the figure is forced rather than
	// chosen; what develops is the DIVISION, not the symmetry.
	//
	//  0      .20         .42      .60        .76      .94   1.0
	//  |shimmer up|damping .... .52|
	//    |split: the net cut in .42|
	//              |pinch: over and back .60|
	//          |lobes: the twelve out .58|
	//               |corners, struck on the caps .60|
	//                    |spokes .76|
	//                      |edges ....................... .94|
	//                                            |union: peaks as the last edge lands|
	conception: {
		// Longer at the FRONT than the 5.2 that preceded it and shorter overall,
		// which is the whole adjustment: what was rushed was the opening, not the
		// scene — the entire shimmer used to happen inside the first tenth — and
		// what was slack was the tail, where the union flared and died with the
		// last edges already closed and nothing left to watch.
		duration: 5.7,

		// The field lights up on the surface it was already sitting on — and it
		// takes its time about it. At [0, 0.08] the body went from dark to full
		// brightness in half a second, which is a switch rather than a shimmer.
		wake: [0.0, 0.2],

		// ── THE SHIMMER ──────────────────────────────────────────────────────
		// Up, then down. Two windows rather than one decay, because a decay alone
		// means the loudest frame of the scene is its first.
		chopIn: [0.0, 0.2],
		chopOut: [0.24, 0.52],
		chopPeak: 0.66,

		// ── THE SPLIT ────────────────────────────────────────────────────────
		furrow: [0.06, 0.42],
		// And PAST itself. A half-sine over this window, added to the furrow, so
		// the net constricts harder than it ends up and eases back — the shape a
		// cleavage furrow actually makes. It has to be back at zero by the end or
		// the hand-over is not the bare invariant.
		pinch: [0.26, 0.6],
		pinchPeak: 0.45,
		lobe: [0.24, 0.58],
		// The mode ringing as it is excited, damped as it settles.
		ring: [0.0, 0.56],
		ringPeak: 0.3,
		// ── The solid, out of the division that is still happening ───────────
		corners: [0.44, 0.6],
		spokes: [0.5, 0.76],
		// The last edge lands ON the union's peak rather than well before it, so
		// the flare IS the figure closing rather than a beat that follows it.
		edges: [0.54, 0.94],
		// THE UNION. The last edge closes and the whole figure answers at once.
		// It has to come back to zero by p=1: the computation's enter() restates
		// setLineOpacity(1), so a flare still up at the cut is a visible step.
		union: [0.84, 1.0],
		unionPeak: 1.3,

		// ── WHAT IT HANDS OVER ───────────────────────────────────────────────
		// The computation restates these in its enter(), so a seek straight into
		// that scene draws the frame a run through it would draw. Read by BOTH
		// sides, and the conception reaches them by construction rather than by
		// arithmetic kept in step by hand.
		handoverGlow: 1.0,
		handoverCore: 1.0
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

		// The sphere stays — it is the thing the frame is held inside — and thins,
		// so the artwork is not seen through a wash.
		//
		// It no longer GROWS off the frame. It used to open out to 1.35 while the
		// frame stayed at 1, so the two things that are supposed to be one object
		// visibly came apart: the sphere swelled and the icosahedron inside it did
		// not. They are the same object now and share one scale and one attitude.
		shellThin: [0.05, 0.22],

		// The 24-cell hung around the scene. It belongs to the search and nothing
		// else — it arrives with the panes and goes out with the zoom. It is a
		// SPACE, so it never comes above a whisper: the moment it is as bright as
		// the drafting it stops being the room and becomes furniture in it.
		cageIn: [0.1, 0.28],
		// A WHISPER, and quieter than it was. It is a SPACE — the room the search
		// happens inside — and the moment it is as bright as the projected arms it
		// stops being the room and starts competing with them. Two lattices of
		// gold line-work at the same weight, one of them 4D and one of them the
		// answer, is a tangle rather than a scene.
		cagePeak: 0.2,

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
		// Yaw and pitch it walks through, in radians. The yaw is a FULL sine — out
		// one way, back through the rest pose, out the other, home — so the beat
		// both moves properly and ends flat and facing, which is where the search
		// has to start from.
		surveyTurn: 0.95,
		surveyTilt: 0.34,

		// The search: turn a decade square to camera, HOLD it, turn to the next.
		// The point is not to fake a search — it is that each turn shows another
		// decade's artwork, which is otherwise built and never seen.
		search: [0.5, 0.87],
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
