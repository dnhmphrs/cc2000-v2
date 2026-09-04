import { writable } from 'svelte/store';

// App flow — four beats, in order:
//   'boot'       → terminal boots and types; nothing in 3D yet; ends on a start key
//   'calculate'  → the sperm hologram is on screen while the operator fills the form
//   'processing' → sperm dives, THE ICOSAHEDRON APPEARS, opens, background flares,
//                  the search scans the decades and zooms into the resolved room
//   'output'     → final result screen
export const phase = writable('boot');

// User inputs
export const gender = writable(null);
export const spicy = writable(4);
export const date = writable('2000-01-01');

// Result
export const track = writable(null);

// Decade resolved from conception date
export const decade = writable(null);

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
