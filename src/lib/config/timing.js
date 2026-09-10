import { clamp01, easeInOutCubic } from './ease';

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
		// 11.0 -> 13.5. Every window below is a fraction, so the beats keep their
		// places and each one gets a fifth more time — which the approach is what
		// spends. See TUNNEL.camStart for the other half of it.
		duration: 13.5,

		// The calculator is still on screen, warping into the lens. Documentation
		// only — the machine runs its own `launch` in seconds — but the two have
		// to describe the same 1.6 seconds or the hand-over is visible.
		warp: [0.0, 0.11],

		// The mote field. Up on the FIRST FRAME, deliberately: the cut into this
		// scene happens behind the calculator, and what is underneath it has to be
		// moving before the calculator clears. It goes out as you arrive — the
		// last beat is the ovum and nothing else.
		// SLOW, and piecemeal — each mote switches on at its own point in this
		// window rather than the field fading up as one. It used to be four
		// hundredths, up on the first frame, because the cut into this scene
		// happened behind a calculator and what was underneath had to be moving
		// before the machine cleared. There is no machine and no cut: the flight
		// is already running under the title card, so the air can develop around
		// the swimmer instead of being there waiting for it.
		// FULLY UP BEFORE THE SWIMMER IS. The order of the opening is: the card
		// lifts, the field develops, and then something comes through the lens —
		// three beats, and the third one is the event. Ending this at 0.42 put
		// the field still arriving underneath the pass, so two things were
		// happening at once and neither was the subject.
		// ── AND THE AIR COMES UP ─────────────────────────────────────────────
		// The `deep` shader turns the air colour into a CHANNEL, and its core is
		// 1.5x the air at the vanishing point — so at progress zero, before
		// anything has happened, there is already a warm pool in the middle of
		// the frame. Measured: rgb(30,27,21) at the centre against rgb(4,4,3) in
		// the corners, and 30 = 1.5 x 20 exactly.
		//
		// Which was invisible while the title card painted its own ground over
		// the top, and became the first thing you see the moment the card went
		// transparent. It is also what you land in on the loop home, with no
		// card at all: the glow does not come up, it is simply on.
		//
		// So the air now walks UP from the void as well as down to it. The
		// flight is supposed to bring the warmth out of the dark; this is the
		// first half of that, and it costs nothing at the far end because the
		// settle already owns it.
		airIn: [0.0, 0.2],

		motesIn: [0.03, 0.26],

		// LATER THAN THE DIVE. These used to start on the same frame the swimmer
		// broke formation, so the picture drained while the thing you had watched
		// for ten seconds was going in — the last beat of the scene played out
		// against a screen that was already switching itself off.
		motesOut: [0.86, 0.99],

		// ── THE PASS ─────────────────────────────────────────────────────────
		// The swimmer comes past FROM BEHIND, straight up the axis, dead centre,
		// and the whole point of the shot is the moment it goes THROUGH the lens.
		//
		// That moment was lasting about four tenths of a second. The travel ran on
		// easeOutQuint from sixteen units back, which spends five of its slope at
		// the very start: it covered the sixteen invisible units in the first
		// quarter of the window, crossed the lens plane at six units a second, and
		// spent the remaining three quarters crawling the last stretch. So the one
		// beat worth watching was the one beat that was over instantly, and what
		// you actually saw was a thing appearing already in front of you.
		//
		// It is now a GLIDE — constant speed, then a soft stop into station — over
		// a window that starts once the flow lines are up, from three units back
		// instead of sixteen. Constant speed is what a body swimming steadily past
		// you looks like, and there is nothing clever in the middle of it to be
		// clever at the wrong moment.
		//
		// The arithmetic, because it is the whole item: 8.5 units of travel over
		// 0.52 of an 11-second scene is 1.49 units a second, the lens plane falls
		// at 0.35 of the travel and therefore inside the constant stretch, and it
		// takes two full seconds to go from crossing the lens to three units clear
		// of it. Then it holds station from 0.66 until the dive at 0.78.
		spermIn: [0.14, 0.66],

		// ── WHERE THE FLIGHT STOPS TO ASK ────────────────────────────────────
		// Two progress marks, not windows: the scene HOLDS at each until the popup
		// is answered (see the `gate` store), so what follows each one is however
		// long the operator takes.
		//
		//   askDob    the ovum is IN SIGHT — the halo has opened and the cage is
		//             resolving out of the fog behind the swimmer. Asked earlier
		//             the popup had nothing behind it but black, and the run gave
		//             you a form before it had shown you anything.
		//   askSpicy  close on the ovum, just short of the dive, so the second
		//             question is asked at the thing it is about.
		// Moved back twice. The halo opens over [0.34, 0.68] and the cage resolves
		// out of the fog behind it, so at 0.46 the ovum was a warmth with the
		// beginnings of a shape in it and the question arrived on top of the
		// reveal. It is asked once the thing is unmistakably there.
		askDob: 0.57,
		askSpicy: 0.76,

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
		haloOut: [0.87, 0.995],
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
		// AND THE AIR IS THE LAST THING TO GO, not the first. There is no cut here
		// to cover any more — the fly-in ends on the frame the conception opens
		// on — so nothing needs to be blacked out, and the only thing that has to
		// change at all is the GROUND: the air walks down to the void, late, while
		// everything on top of it is still there to watch.
		settle: [0.84, 0.99],
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
	//                    |spokes .66|edges .70|
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
		// ONE WINDOW FOR ALL THREE. Not staggered by a hundredth, not overlapping
		// — the same window, on the same ease, so the twelve corners, the six
		// diagonals and the thirty edges start and stop together.
		//
		// Staggering them is a beat you can only read from an angle. Head on down
		// a five-fold axis the six diagonals lie almost exactly along six of the
		// thirty edges in projection, so a second window starting under the first
		// is not a second object arriving: it is thirty lines the viewer has
		// already got getting heavier for no reason they can see. In a scene that
		// is otherwise built out of things that are what they look like, it read
		// as an accident.
		//
		// So the frame is one beat, and the projection is the next one. Which is
		// the shape the scene wanted anyway: assemble, hold, flare.
		frame: [0.4, 0.62],
		// THE UNION. The last edge closes and the whole figure answers at once.
		// It has to come back to zero by p=1: the computation's enter() restates
		// setLineOpacity(1), so a flare still up at the cut is a visible step.
		// AND THE FLARE IS THE FRAME CLOSING, not a separate event after it. It
		// used to open at 0.72 — a tenth of the scene after the last edge landed
		// — so the build and the answer to the build were two beats where the
		// viewer was counting three: lines, flash, rectangles. Now it rises
		// under the last of the build and peaks just past the moment the figure
		// completes, which is one beat with a shape to it. Still zero at both
		// ends, so the hand-over is still the bare invariant.
		union: [0.46, 0.82],
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

		// THE PULL-BACK IS NOT A WINDOW OF THIS SCENE. The conception is close on
		// the solid and six rooms will not fit in that frame, so the opening move
		// here is to make room for them — and it now starts before "here" does.
		// One curve, shared with the tail of the conception, owned in seconds by
		// PULL at the foot of this file. Nothing to set on this side.

		// The panes come out of the frame, as DRAFTING first: the golden rectangle,
		// its dimension lines, its ratio bar, its spiral. The rooms only fade in
		// through that once it is out, which is what stops the two reading as one
		// undifferentiated bloom, and what makes the machine look as though it is
		// working the answer out rather than displaying it.
		// FIRST THE RECTANGLES ARE DRAWN, THEN THEY TRAVEL. At projection zero
		// each one lies exactly on four of the solid's own vertices, so what
		// used to happen at the cut was three golden rectangles switching on
		// inside the icosahedron in a single frame and then extending. The
		// extending was always an animation; the arrival was not.
		//
		// They are drawn now, on the same progressive stroke as the frame's own
		// edges (see GoldenRectangle.setOutline), inside the solid, before any
		// of them moves. Then they go out.
		rects: [0.0, 0.11],
		open: [0.11, 0.34],
		schematic: [0.14, 0.38],
		rooms: [0.34, 0.48],
		// And the drafting steps back once the rooms are up, or it is clutter over
		// the only thing in the scene with any colour in it.
		draftOut: [0.42, 0.56],

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
		cagePeak: 0.3,

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

// ── ONE PULL, ACROSS TWO SCENES ──────────────────────────────────────────────
// The retreat from the solid does not belong to the computation. It belongs to
// the CUT: it has to be under way before the panes come out, and the panes come
// out at the top of the next scene, so the move has to START IN THIS ONE.
//
// Splitting a lerp across a scene boundary is where that normally goes wrong.
// Two eases, one per scene, each starting and ending at rest, put a full stop
// exactly on the frame the two scenes meet — the camera backs off, stops dead,
// and starts again, which is more visible than not pulling back at all.
//
// So there is ONE curve on ONE clock, and the clock is in SECONDS rather than
// in either scene's progress, because the two scenes are different lengths.
// Each side asks it where it is:
//
//   conception   pullAmount(t - (duration - PULL.before))
//   computation  pullAmount(PULL.before + t)
//
// Value AND velocity are continuous across the cut by construction, and
// conception p=1 and computation p=0 evaluate the identical expression, so the
// hand-over stays the single frame the pixel diff in CLAUDE.md checks for.
export const PULL = {
	// Seconds of the conception's TAIL spent pulling back. It starts after the
	// union has peaked, so the flare is the last thing that happens close in and
	// the retreat is what answers it.
	before: 0.62,
	// And seconds of the computation's HEAD. The panes start 0.05 of that scene
	// in — see computation.open — so the frame has both this and that head start
	// open before the first arm moves.
	after: 3.22
};

export function pullAmount(seconds) {
	return easeInOutCubic(clamp01(seconds / (PULL.before + PULL.after)));
}
