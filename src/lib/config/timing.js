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
		// pentagonTurn/Stagger are fractions of a duration that is itself being
		// scaled, so they must NOT be scaled again — only true seconds are.
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

		// Static. It is on from the calculator onward; here it climbs.
		noise: [0.0, 1.0],

		// Deep blue turning white, under the blow-out that ends the scene.
		whiten: [0.84, 1.0]
	},

	// ── Conception ───────────────────────────────────────────────────────────
	// The holy one. White, and built up a layer at a time.
	conception: {
		duration: 10.5,

		// A sphere forms in the middle of the white.
		sphere: [0.0, 0.13],
		// The icosahedron's wireframe appears inside it.
		wire: [0.12, 0.3],
		// Lines extend from the vertices, carrying the geometric content.
		extend: [0.24, 0.46],
		// The pentagons turn. Not all at once and not one by one: overlapping
		// waves, so it reads as a combinatorial calculation rather than a list.
		pentagons: [0.44, 0.9],
		// How long one pentagon takes to turn its fifth, as a fraction of the
		// whole scene, and how far apart the starts of consecutive turns are.
		pentagonTurn: 0.075,
		pentagonStagger: 0.028,
		// How many turns happen in total. More than 12 means some turn twice.
		pentagonTurns: 22,

		// Everything draws back to a still frame before the panes come out.
		settle: [0.88, 1.0],

		// Dreamlike flashes of the run's imagery through the static. Off by
		// default — raise `ghostAmount` to bring them in.
		ghost: [0.2, 0.95],
		ghostAmount: 0.0,

		// Static holds low and steady here; this is the calm one.
		noise: [0.0, 1.0]
	},

	// ── Computation ──────────────────────────────────────────────────────────
	computation: {
		duration: 12.0,

		// The panes come out of the sphere.
		open: [0.0, 0.24],
		// The sphere draws in behind them and stays as a bubble.
		shellDrawIn: [0.08, 0.26],

		// One continuous kantering tumble through the decades — not a sequence
		// of turns and pauses. `turns` is how many whole revolutions of the
		// dominant axis it makes in that window.
		tumble: [0.18, 0.7],
		tumbleTurns: 2.35,
		// The secondary axis, which is what stops it reading as a turntable.
		tumbleKanter: 0.62,
		tumbleWobble: 0.19,
		// Panes lean out toward the viewer as they swing past the front. Much
		// above 0.2 and the leading room starts leaving the frame.
		passBulge: 0.18,

		// It stops tumbling and slides the answer square to camera.
		settle: [0.64, 0.82],

		// Then in. Accelerates away from rest, then eases onto the final frame.
		zoom: [0.8, 1.0],
		zoomPower: 2.2,

		// The field's one appearance, if it is switched on.
		flare: [0.1, 0.86]
	},

	// ── Room ─────────────────────────────────────────────────────────────────
	// Waits for the operator. `again` is the way back: static floods, and the
	// calculator is already drawn inside the monitor behind it.
	room: {
		resultIn: 0.45,
		again: 2.1,
		// Fraction of `again` spent flooding with static before the calculator
		// starts flying out of the monitor.
		againStatic: 0.34
	}
});

// The one blow-out in the run: the end of the fly-in, into conception.
export const FLASH_DECAY = 2.4;

// Canvas fade at first paint, and again when the run resets.
export const CANVAS_FADE = 1.2;
