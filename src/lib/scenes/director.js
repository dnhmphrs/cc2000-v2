import { get } from 'svelte/store';
import {
	scene,
	runId,
	track,
	decade,
	conceived,
	edge,
	fieldDecade,
	flare,
	calcZoom
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

export const ORDER = ['calculator', 'flyIn', 'conception', 'computation', 'room'];

export function is(name) {
	return get(scene) === name;
}

// Pressing calculate. The calculator stays mounted for its own launch — it is
// being pushed into the lens, and the fly-in is running behind it.
//
// It does NOT clear the result: the calculator works the answer out BEFORE
// calling this, and the whole cinematic is that answer being delivered. Clearing
// here wipes the track and the room renders empty.
export function begin() {
	if (!is('calculator')) return;
	runId.update((n) => n + 1);
	scene.set('flyIn');
}

// The stage calls this as each 3D scene runs out.
export function advance(from) {
	const i = ORDER.indexOf(from);
	if (i < 0 || !is(from)) return;
	scene.set(ORDER[Math.min(i + 1, ORDER.length - 1)]);
}

// Going round again. The calculator is drawn inside the room's monitor and the
// camera flies into that monitor while it grows out of it. The operator's
// ANSWERS are kept on purpose — only what the run produced is cleared.
export function again() {
	if (!is('room')) return;
	clearResult();
	calcZoom.set(0);
	scene.set('calculator');
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

// The calculator is home and settled — but the room is NOT let go of. The
// machine ends the loop sitting in the bedroom's monitor, at RETURN_FILL of the
// viewport, with the room still rendered round it; that is where the next run is
// operated from, and it is the one place in the site where two scenes are on
// screen at once. monitorRect therefore stays live: it is what the calculator
// keeps fitting itself to (scenes/Calculator.svelte) and what tells the stage to
// keep drawing the room behind it (three/Stage.svelte).
//
// It is cleared when the next run reaches the computation, which is the moment
// the room stops being the thing behind the machine.
export function settled() {
	calcZoom.set(1);
}
