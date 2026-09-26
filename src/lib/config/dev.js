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
//   1 – 5   Jump straight to a scene, bound by NAME (scenes/director.js KEYS):
//           1 restart · 2 approach · 3 descent · 4 kaleido · 5 room
//
//           Jumping into a scene seeds a real answer first, resolved through
//           functions/answer.js exactly as the popups would, so the tunnel has
//           a room to find and the room has a track to show — unless ?edge=
//           says otherwise, below.
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

// ── The scrub ────────────────────────────────────────────────────────────────
// ?at=0.35 PINS the running 3D scene at that fraction of its own duration and
// holds it there. Every 3D scene is a pure function of its progress — nothing in
// them integrates dt — so seeking is exact: the frame you get is the frame the
// run would have drawn at that moment, not an approximation of it.
//
// This is the tool for looking at one beat. Without it, checking a half-second
// window in a seven-second scene is a matter of taking screenshots and hoping.
// ── The seed ─────────────────────────────────────────────────────────────────
// ?seed=anything makes every choice the run leaves to chance repeatable — which
// decade lands on which pane, where the motes sit, the birthday the harness
// rolls — see lib/random.js. Two loads of the same URL then draw the same frame,
// which is what lets two contact sheets of one beat be diffed. Null on a normal
// load, and the site rolls as it always has.
export const DEV_SEED = (() => {
	if (typeof window === 'undefined') return null;
	const raw = new URLSearchParams(window.location.search).get('seed');
	return raw === null || raw === '' ? null : raw;
})();

// ── The edge ─────────────────────────────────────────────────────────────────
// ?edge=past|future seeds a birthday the archive cannot answer for in place of
// a real answer, so a jump into the kaleido (key 4) pins the BREAKDOWN — the
// set switching off, world/kaleido.js — rather than the search. Null on a
// normal load.
export const DEV_EDGE = (() => {
	if (typeof window === 'undefined') return null;
	const v = new URLSearchParams(window.location.search).get('edge');
	return v === 'past' || v === 'future' || v === 'unknown' ? v : null;
})();

export const DEV_AT = (() => {
	if (typeof window === 'undefined') return null;
	// The raw value first. Number(null) is 0, not NaN, so testing the parse alone
	// pins every scene at progress zero on every load that has no ?at= at all —
	// which is to say, on the live site.
	const raw = new URLSearchParams(window.location.search).get('at');
	if (raw === null || raw === '') return null;
	const v = Number(raw);
	return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : null;
})();
