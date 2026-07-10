import { writable } from 'svelte/store';

// App flow:
//   'preload'    → asset loading bar
//   'intro'      → terminal boot lines + icosahedron instantiates + sperm swims through
//   'calculate'  → reskinned user-input panel (mouse-look on the icosahedron is live)
//   'processing' → faux-science terminal read-out while the icosahedron spins + hyperspace search
//   'output'     → final result screen
export const phase = writable('preload');

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
// 0 = reset/idle, 1 = begin processing spin (search), 4 = settled/landed.
export const sceneState = writable(0);

// Asset preloading — fraction 0..1 and a human-readable label for the loading bar.
export const loadProgress = writable(0);
export const loadLabel = writable('');

// Published every frame by the scene: the icosahedron's live orientation, so the
// background 4D lattice can rotate in lock-step during the hyperspace search.
export const spinQuat = writable({ x: 0, y: 0, z: 0, w: 1 });

// True while the search is running — tells the background lattice to add its own
// 4D hyper-rotation on top of the synced 3D spin.
export const latticeActive = writable(false);

// Flips true the moment the icosahedron begins opening its panes, so the intro
// boot log can fade out and leave the input screens clean.
export const expanding = writable(false);
