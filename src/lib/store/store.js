import { writable } from 'svelte/store';

// App flow:
//   'intro'      → terminal boot lines, then a button. Nothing advances on a timer.
//   'calculate'  → sperm is on screen and the user-input panel is open
//   'processing' → sperm dives, background detonates, icosahedron appears, rooms
//                  project out, hyperspace search runs
//   'output'     → final result screen
export const phase = writable('intro');

// Background shader stage: 'off' | 'reveal' | 'calm' | 'burst' | 'after'
export const bgStage = writable('off');

// User inputs
export const gender = writable(null);
export const spicy = writable(4);
export const date = writable('2000-01-01');

// Result
export const track = writable(null);

// Decade resolved from conception date
export const decade = writable(null);

// Device
export const screenSize = writable({ width: 0, height: 0 });
export const deviceType = writable('desktop');
export const isPortrait = writable(false);

// Scene state — a coarse command channel into the icosahedron scene.
// 0 = reset/idle, 1 = sperm swims in and holds, 2 = ignite (dive → detonation →
// icosahedron → rooms → search), 4 = settled/landed.
export const sceneState = writable(0);

// Published every frame by the scene: the icosahedron's live orientation, so the
// background 4D lattice can rotate in lock-step during the hyperspace search.
export const spinQuat = writable({ x: 0, y: 0, z: 0, w: 1 });

// True while the search is running — tells the background lattice to add its own
// 4D hyper-rotation on top of the synced 3D spin.
export const latticeActive = writable(false);

// Flips true the moment the icosahedron begins opening its panes, so the intro
// boot log can fade out and leave the input screens clean.
export const expanding = writable(false);
