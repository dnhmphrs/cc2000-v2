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

// Scene state — the only command channel into the 3D.
//   0 = reset to idle          1 = calculate pressed (run the three scenes)
//   4 = landed on a room       5 = calculate again (fly back into the monitor)
export const sceneState = writable(0);

// 'dark' | 'light' — what the active scene is clearing to, so copy drawn over
// the canvas can pick a colour that reads. The ground swings from deep blue to
// white part way through a run.
export const sceneTone = writable('dark');

// 0..1 — how hard the theta-field background is burning. The computation scene
// owns this: it snaps up when the icosahedron opens, holds through the search,
// and decays as the room fills the screen. The field rests at a low level the
// rest of the time, but the tunnel clears opaque over it, so it is only ever
// seen from the computation onwards.
export const flare = writable(0);

// Everything a run PRODUCED, cleared in one place — but not what the user
// answered: going round again keeps the birthday and the spice they picked, so
// a second run is one click. Nor the scene: the stage owns sceneState and the
// monitor rect, and it is still using them to fly home when this is called.
export function resetRun() {
	track.set(null);
	decade.set(null);
	conceived.set(null);
	edge.set(null);
	fieldDecade.set(null);
	flare.set(0);
}
