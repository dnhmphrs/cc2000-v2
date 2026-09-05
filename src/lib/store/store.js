import { writable } from 'svelte/store';

// App flow. Short, because the machine carries the whole form:
//   'intro'      → the machine: manifesto, both questions, calculate
//   'processing' → the dive into the egg, then the icosahedron, search, landing
//   'output'     → the room, in colour, with the song in the monitor
export const phase = writable('intro');

// User inputs. The birthday lives here rather than inside a component so that
// starting again clears it for certain — see resetRun() at the bottom.
export const gender = writable(null);
export const spicy = writable(4);
export const date = writable('2000-01-01');
export const dobMonth = writable('');
export const dobDay = writable('');
export const dobYear = writable('');

// Result
export const track = writable(null);

// Decade resolved from conception date
export const decade = writable(null);

// The day the track was playing — i.e. roughly when they were made.
export const conceived = writable(null);

// Screen-space rect of the resolved room's monitor glass, in CSS pixels, once
// the camera has settled on it. The result UI is placed inside this rather than
// floating over the room. Null until the landing finishes.
export const monitorRect = writable(null);

// Which decade the search is looking at right now, so the background field can
// take that era's colours as it turns through them.
export const fieldDecade = writable(null);

// Out-of-range verdicts ('past' | 'future' | null) — the date fell outside the
// broadcast archive, so there is no track to find.
export const edge = writable(null);

// Device
export const screenSize = writable({ width: 0, height: 0 });
export const deviceType = writable('desktop');
export const isPortrait = writable(false);

// Scene state — a coarse command channel into the 3D.
// 0 = reset/idle, 1 = calculate pressed (dive → open → search → zoom),
// 4 = the scene has landed on a room.
export const sceneState = writable(0);

// 0..1 — how hard the theta-field background is burning. The scene owns this:
// it stays at 0 for the whole boot and input flow, snaps up when the icosahedron
// opens, holds through the search, and decays as the room fills the screen.
// This is the only thing that ever puts the flash background on screen.
export const flare = writable(0);

// Everything a run puts into the stores, cleared in one place. "Calculate
// again" used to rely on components unmounting to forget their own state,
// which is easy to get wrong and hard to see when it is.
export function resetRun() {
	dobMonth.set('');
	dobDay.set('');
	dobYear.set('');
	date.set('2000-01-01');
	spicy.set(4);
	gender.set(null);
	track.set(null);
	decade.set(null);
	conceived.set(null);
	edge.set(null);
	monitorRect.set(null);
	fieldDecade.set(null);
	flare.set(0);
	sceneState.set(0);
}
