import { writable } from 'svelte/store';

// App flow — four beats, in order:
//   'intro'      → title and a button; nothing in 3D yet
//   'calculate'  → the sperm is on screen while the three questions are answered
//   'processing' → sperm dives, THE ICOSAHEDRON APPEARS, opens, the field comes
//                  up, and it turns to the resolved decade and zooms in. ~5s.
//   'output'     → the room, in colour, with the song on it
export const phase = writable('intro');

// User inputs
export const gender = writable(null);
export const spicy = writable(4);
export const date = writable('2000-01-01');

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

// Scene state — a coarse command channel into the icosahedron scene.
// 0 = reset/idle, 1 = begin the dive → open → search, 4 = settled/landed.
export const sceneState = writable(0);

// 0..1 — how hard the theta-field background is burning. The scene owns this:
// it stays at 0 for the whole boot and input flow, snaps up when the icosahedron
// opens, holds through the search, and decays as the room fills the screen.
// This is the only thing that ever puts the flash background on screen.
export const flare = writable(0);
