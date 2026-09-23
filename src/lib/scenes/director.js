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
// The four scenes in order, and the things that can happen between them. This
// is the whole control flow of the site; every transition goes through a
// function here, so there is one place to read to know what follows what.
//
//   (title card) ──begin()──▶ approach ──▶ kaleido ──▶ descent ──▶ room
//                                ▲            │ edge                │
//                                │            ▼                     │
//                                ├─recover()─ error                 │
//                                └──────────── again() ─────────────┘
//
// A birthday the archive cannot answer for (the `edge` store) is not refused
// in the popup: the flight goes in regardless, the tunnel breaks down on it
// (three/world/kaleido.js), and advance() hands to the verdict rather than to
// the fall. recover() is the verdict's way back to the flight.
//
// The stage advances the 3D scenes itself as each one finishes (they know
// their own durations); the two ends of the loop are driven from the DOM.

// NO CALCULATOR. This build has no machine: the run opens on the title card,
// which is a DOM overlay held over an approach that is already mounted, and the
// two answers are taken mid-flight by popups. See store.js `gate`.
//
// ── Two runs ─────────────────────────────────────────────────────────────────
// The site's run is the default. The WebGL run it replaced still plays at /v2
// on its own Stage (three/StageV2.svelte), with the same title card, popups,
// room and director — only the 3D scenes and their names differ. That page
// calls setRun('v2') before its Stage mounts; ORDER and KEYS are mutated in
// place so every importer sees the change.
export const RUNS = {
	site: {
		order: ['approach', 'kaleido', 'descent', 'room'],
		keys: { 1: 'restart', 2: 'approach', 3: 'descent', 4: 'kaleido', 5: 'room' }
	},
	v2: {
		order: ['flyIn', 'conception', 'computation', 'room'],
		keys: { 1: 'restart', 2: 'flyIn', 3: 'conception', 4: 'computation', 5: 'room' }
	}
};
export const ORDER = [...RUNS.site.order];
// The dev keys, bound by NAME — see components/Dev.svelte.
export const KEYS = { ...RUNS.site.keys };

export function setRun(name) {
	const run = RUNS[name] ?? RUNS.site;
	ORDER.splice(0, ORDER.length, ...run.order);
	for (const k of Object.keys(KEYS)) delete KEYS[k];
	Object.assign(KEYS, run.keys);
	scene.set(ORDER[0]);
}

export function is(name) {
	return get(scene) === name;
}

// Starting a run. There is nothing to press: the approach is mounted from the
// first frame and the title card lifts off it, so this only marks the run.
export function begin() {
	runId.update((n) => n + 1);
}

// The stage calls this as each 3D scene runs out.
export function advance(from) {
	const i = ORDER.indexOf(from);
	if (i < 0 || !is(from)) return;
	// The breakdown: the tunnel ran out on a birthday with no room at the end
	// of it, so what follows is the verdict rather than the fall.
	if (from === 'kaleido' && get(edge)) {
		scene.set('error');
		return;
	}
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
	// The return flight owns the scene change: it runs in the descent, whose
	// room is still on screen, and hands over when the glass has filled the
	// frame. See world/descent.js stepReturn().
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
	scene.set(ORDER[0]);
	runId.update((n) => n + 1);
}

// The way back from the verdict: the flight again, from the top, the answers
// kept as again() keeps them — both questions are asked again, and the one
// that broke the run is there to be changed. Not the title card.
export function recover() {
	if (!is('error')) return;
	clearResult();
	monitorRect.set(null);
	goingBack.set(false);
	scene.set(ORDER[0]);
	runId.update((n) => n + 1);
}
