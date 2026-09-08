import { writable } from 'svelte/store';

// ── State ────────────────────────────────────────────────────────────────────
// Every store the site has. Writers are named in each comment; if you find
// yourself writing one from somewhere not listed, that is the bug.

// ── Where we are ─────────────────────────────────────────────────────────────
// The five scenes, in order. `scene` is the single source of truth for what the
// site is doing: the page picks which DOM screen to mount from it, and the
// stage picks which 3D scene to run.
//
//   calculator   the machine — takes both answers, and is where a run starts
//   flyIn        through the screen, down to the egg
//   conception   the icosahedron assembling itself, on white
//   computation  the panes, the search, the fall into a room
//   room         the answer, in the room's monitor
//
// Written by: scenes/director.js and three/Stage.svelte. Nobody else.
export const scene = writable('calculator');

// Bumped once per run. Components that need to forget everything on a fresh
// run can key off this rather than trying to reset themselves.
export const runId = writable(0);

// ── The operator's answers ───────────────────────────────────────────────────
// These live in stores rather than in the calculator so that going round again
// can deliberately KEEP them. Written by: Calculator.
//
// The machine arrives already set to the first of January 2000, at one, so it is
// ARMED on the first frame and the button can simply be pressed. The dials and
// the band still handle an unset value ('--', no needle) — that is their
// contract and they are reusable — but nothing here reaches it any more.
export const spicy = writable(1);
export const date = writable('2000-01-01');
export const dobMonth = writable(1);
export const dobDay = writable(1);
export const dobYear = writable(2000);

// ── The answer ───────────────────────────────────────────────────────────────
// Written by: Calculator's calculate(), cleared by director.clearResult().
export const track = writable(null);
export const decade = writable(null);
export const conceived = writable(null);
// 'past' | 'future' | null — the date fell outside the broadcast archive, so
// there is no room to fall into and no track to find.
export const edge = writable(null);

// ── What the 3D is telling the DOM ───────────────────────────────────────────
// Screen-space rect of the settled room's monitor glass, in CSS pixels. The
// result panel and the returning calculator are both drawn into this rather
// than floating over the room. Null until a room has settled.
// Written by: three/scenes/Computation.svelte.
export const monitorRect = writable(null);

// 'dark' | 'light' — what the active scene is clearing to. The ground swings
// from deep blue to white part way through a run, so copy drawn over the canvas
// has to know which it is on. Written by: three/Stage.svelte.
export const sceneTone = writable('dark');

// Which decade the search is looking at right now, so anything tinted by era
// can follow it. Written by: Computation.
export const fieldDecade = writable(null);

// 0..1 — how hard the theta field is burning, if it is switched on at all.
// Written by: Computation.
export const flare = writable(0);

// 0..1 — how much of the backdrop shader's FIGURE is drawn. At 0 every field
// collapses to its ground colour and nothing else, which is what makes the one
// remaining scene change in the run invisible: the fly-in flattens `deep` to the
// void as it arrives, the conception brings `grid` up out of the same void, and
// the frame either side of the swap is the identical flat black.
export const fieldFade = writable(1);

// ── The calculator's own transform ───────────────────────────────────────────
// 0 = drawn 1:1 inside the room's monitor, 1 = filling the viewport. Both ends
// of the loop ride this: pressing calculate drives it past 1 and into the lens,
// and coming home brings it from 0 back to 1.
// Written by: scenes/Calculator.svelte.
export const calcZoom = writable(1);

// ── Device ───────────────────────────────────────────────────────────────────
// 'portrait' | 'square' | 'landscape' — see aspectKind() in config/space.js.
// Written by: routes/+layout.svelte.
export const aspect = writable('landscape');
export const screenSize = writable({ width: 0, height: 0 });

// ── The backdrop ─────────────────────────────────────────────────────────────
// Which shader is behind the 3D, and the colour it is given. The Stage sets
// this from the active scene's backdrop(); components/Background.svelte reads
// it and recompiles when the name changes. See three/shaders/index.js.
export const backdrop = writable({ shader: 'flat', color: 0x0a1f4a });

// The rotation the field is carried by, as a column-major mat3. NOT a store:
// the computation writes it every frame and the background reads it in its own
// loop, so a writable would only mean a notification per frame for a value
// nothing reacts to. Written in place — never reassign the array.
export const fieldRotation = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
