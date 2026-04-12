import { writable } from 'svelte/store';

// App flow: 'intro' → 'calculate' → 'transition' → 'output'
export const phase = writable('intro');

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

// Scene state — drives the icosahedron animation
// 0 = idle/spiral, 1 = collapse spiral, 2 = rotate to decade, 3 = project out, 4 = settled
export const sceneState = writable(0);

// Set to true when the golden spiral has finished condensing and is fading out,
// signalling the icosahedron scene to begin rendering.
export const spiralDone = writable(false);