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
	// The whole switch. Everything else here is inert while this is false.
	on: false,

	// SPACE and 1–5. Turn off if they get in the way of testing real input.
	keys: true,

	// null runs the site normally. Otherwise one of the ORDER names in
	// scenes/director.js: 'calculator' | 'flyIn' | 'conception' | 'computation'
	// | 'room'.
	only: null
};
