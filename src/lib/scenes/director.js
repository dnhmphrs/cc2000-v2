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

// An out-of-range birthday never reaches a room, so it skips the whole
// cinematic and goes straight to the verdict.
export function skipToVerdict() {
	scene.set('room');
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

// The calculator is home and settled. Now the room can be let go of.
export function settled() {
	monitorRect.set(null);
	calcZoom.set(1);
}
