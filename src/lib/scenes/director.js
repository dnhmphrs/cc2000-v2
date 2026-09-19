import { get } from 'svelte/store';
import {
	scene,
	runId,
	track,
	decade,
	conceived,
	edge,
	monitorRect,
	fieldDecade,
	flare,
	goingBack
} from '$lib/store/store';

// ── The director ─────────────────────────────────────────────────────────────
// The five scenes in order, and the four things that can happen between them.
// This is the whole control flow of the site; every transition goes through a
// function here, so there is one place to read to know what follows what.
//
//   calculator ──begin()──▶ flyIn ──▶ conception ──▶ computation ──▶ room
//        ▲                                                            │
//        └──────────────────────── again() ───────────────────────────┘
//
// An out-of-range birthday never leaves the calculator at all: it sets `edge`
// and stays put, so the operator can change the date and go again without the
// site having flown them anywhere first.
//
// The stage advances the three 3D scenes itself as each one finishes (they know
// their own durations); the two ends of the loop are driven from the DOM.

// NO CALCULATOR. This build has no machine: the run opens on the title card,
// which is a DOM overlay held over a fly-in that is already mounted, and the two
// answers are taken mid-flight by popups. See store.js `gate`.
export const ORDER = ['flyIn', 'conception', 'computation', 'room'];

export function is(name) {
	return get(scene) === name;
}

// Starting a run. There is nothing to press: the fly-in is mounted from the
// first frame and the title card lifts off it, so this only marks the run.
export function begin() {
	runId.update((n) => n + 1);
}

// The stage calls this as each 3D scene runs out.
export function advance(from) {
	const i = ORDER.indexOf(from);
	if (i < 0 || !is(from)) return;
	scene.set(ORDER[Math.min(i + 1, ORDER.length - 1)]);
}

// Going round again. The camera flies THROUGH the room's monitor and comes out
// the other side already in the tunnel — the glass is black and so is the air
// behind it, so there is nothing to cover the cut with because there is no cut
// to see. The title card does not come back; the second run opens on the flight.
//
// The operator's ANSWERS are kept on purpose — only what the run produced is
// cleared — but both questions are asked again, because asking them is the shape
// of the run rather than a form to be filled in once.
export function again() {
	if (!is('room')) return;
	clearResult();
	// The return flight owns the scene change: it runs in the computation, whose
	// room is still on screen, and hands over when the glass has filled the frame.
	// See Computation.stepReturn().
	goingBack.set(true);
}

// Everything a run produced. Not the answers, and not monitorRect — the
// returning calculator is still using that to know where to grow from.
export function clearResult() {
	track.set(null);
	decade.set(null);
	conceived.set(null);
	edge.set(null);
	fieldDecade.set(null);
	flare.set(0);
}

// Through the glass. The room is let go of and the flight starts.
export function settled() {
	goingBack.set(false);
	monitorRect.set(null);
	scene.set('flyIn');
	runId.update((n) => n + 1);
}
