// ── Dev ──────────────────────────────────────────────────────────────────────
// A way into any part of the run without sitting through the rest of it. Off
// in production; nothing below costs anything while `on` is false, because
// components/Dev.svelte returns before it binds a single listener.
//
//   SPACE   On the calculator, rolls a random in-range birthday and spicy
//           level. It does NOT press the button — you still do that — so the
//           machine is never driven for you and this is only a way to flick
//           through songs quickly.
//
//           Anywhere else, skips the rest of the current scene and moves on.
//           On the room it goes back to the calculator, so space alone walks
//           the whole loop.
//
//   1 – 5   Jump straight to a scene, in the director's own order:
//           1 calculator · 2 flyIn · 3 conception · 4 computation · 5 room
//
//           Jumping past the calculator seeds a real answer first, resolved
//           through functions/answer.js exactly as the machine would, so the
//           computation has a decade to find and the room has a track to show.
//
// `only` pins the site to ONE scene and loops it — the mode for tuning a single
// beat, since you get the same beat over and over without the run around it.
// The keys still work while it is set, and jumping with 1–5 changes which scene
// is pinned rather than fighting it.
export const DEV = {
	// The whole switch. Everything else here is inert while this is false —
	// components/Dev.svelte returns before it binds a listener. ON while the site
	// is being built; turn it off before it ships.
	on: true,

	// SPACE and 1–5. Turn off if they get in the way of testing real input.
	keys: true,

	// null runs the site normally. Otherwise one of the ORDER names in
	// scenes/director.js: 'calculator' | 'flyIn' | 'conception' | 'computation'
	// | 'room'.
	only: null
};

// ── The conception ───────────────────────────────────────────────────────────
// Which of the three middle scenes runs. They are alternatives, not a sequence
// — see scenes/Conception.svelte for what each one is.
//
//   'construct'  the derivation. The default, and the one the rest of the run
//                is built to follow: the three golden rectangles it folds up
//                are the three the computation projects its rooms off.
//   'strike'     the impact.
//   'divide'     cleavage.
//
// ?conception=strike in the URL overrides this, so all three can be looked at
// without a rebuild. Anything unrecognised falls back to the default.
export const CONCEPTIONS = ['construct', 'strike', 'divide'];
export const DEFAULT_CONCEPTION = 'construct';

export const CONCEPTION = (() => {
	if (typeof window === 'undefined') return DEFAULT_CONCEPTION;
	const v = new URLSearchParams(window.location.search).get('conception');
	return CONCEPTIONS.includes(v) ? v : DEFAULT_CONCEPTION;
})();
