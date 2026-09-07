# Conception Calculator 2000

Give it your birthday and how spicy you like it, and it tells you the song that
was playing at your moment of conception — then flies you into the bedroom where
it happened.

SvelteKit + three.js. `npm run dev`, then <http://localhost:5173>.

---

## The five scenes

The whole site is five scenes played in order, and one store that says which one
is up.

```
  ┌─────────────┐  calculate   ┌────────┐    ┌────────────┐    ┌─────────────┐    ┌──────┐
  │ Calculator  │ ───────────▶ │ FlyIn  │ ─▶ │ Conception │ ─▶ │ Computation │ ─▶ │ Room │
  └─────────────┘              └────────┘    └────────────┘    └─────────────┘    └──────┘
         ▲                        DOM: a caption, one line at a time                  │
         └──────────────────────────── calculate again ────────────────────────────────┘
```

| # | Scene | What it is | Where |
|---|-------|-----------|-------|
| 1 | **Calculator** | The machine. Takes both answers. DOM. | `src/lib/scenes/Calculator.svelte` |
| 2 | **FlyIn** | Through the screen, down deep-blue air to the egg. 3D. | `src/lib/scenes/FlyIn.svelte` |
| 3 | **Conception** | The icosahedron assembling itself, on white. 3D. | `src/lib/scenes/Conception.svelte` |
| 4 | **Computation** | Panes out, tumble through the decades, fall into a room. 3D. | `src/lib/scenes/Computation.svelte` |
| 5 | **Room** | The answer, in that room's monitor. DOM. | `src/lib/scenes/Room.svelte` |

Scenes 1 and 5 are DOM screens with no 3D of their own; 2–4 are 3D with a line
of copy over them (`Caption.svelte`). `src/lib/scenes/director.js` owns every
transition between them — it is four functions long and it is the first file to
read.

---

## Where everything is

```
src/lib/
  config/           EVERY tunable number in the site
    timing.js         when things happen — durations + fraction windows
    ease.js           the shapes they happen in — span(), easings
    space.js          3D distances, cameras, aspect breakpoints
    layout.js         screen-space sizes — monitor glass, chassis
    palette.js        colour
    index.js          one barrel: import { SCENES, span, TUNNEL } from '$lib/config'

  scenes/           the five scenes, plus the caption and the director
  store/store.js    every store, with its writer named in the comment

  three/
    Stage.svelte      the canvas, the clock, the running order of the 3D three
    world/
      tunnel.js         scene 2's world — air, fog, egg, sperm
      lattice.js        scenes 3–4's world — the icosahedron, the egg, the panes
      egg.js            the egg itself, shared by both worlds
    geometry/
      icosahedron.js    vertices, edges, faces, pentagons, golden rectangles
    shaders/
      noise.js          the static, as plain GLSL with no dependencies
    objects/            the decade panes and their room artwork

  components/
    NoiseField.svelte   hosts the static shader over the whole site
    Background.svelte   the theta field — OFF behind one switch (FIELD_ON)
```

---

## How the animation works

### One rule

**A scene has one duration in seconds. Everything inside it is a window of two
fractions of that duration.** No scene file contains a number of seconds.

```js
// config/timing.js
flyIn: {
  duration: 6.4,
  eggIn:   [0.04, 0.52],   // the egg resolving out of the fog
  spermIn: [0.14, 0.26],   // it comes past the camera from behind
  whiten:  [0.84, 1.0]     // deep blue turning white under the flash
}
```

```js
// scenes/FlyIn.svelte
const p = clamp01(t / T.duration);          // 0..1 through the scene
const eggIn = span(p, T.eggIn);             // 0..1 through that beat
world.egg.setShell(eggIn);
```

Change `duration` and the whole scene stretches in proportion. Move a window and
only that beat moves. Windows may overlap freely — overlapping beats cross-fade,
and that almost always reads better than beats that queue.

### Scrub it

`?speed=6` runs the whole thing six times faster; `?speed=0.3` runs it slower.
Only the seconds are scaled, so the choreography is identical — use it to get to
the beat you are working on without sitting through the run.

### Pure functions of progress

Scenes 3 and 4 recompute their whole state from `p` every frame rather than
accumulating. Every pentagon's angle is a sum over the turns that have touched
it; the tumble is a function of the scene's progress. Nothing integrates `dt`.

That is why they can be reset, re-entered or scrubbed without drifting, and it
is worth keeping if you add to them.

### The scene interface

Every 3D scene answers exactly five calls, and `Stage.svelte` knows nothing else
about them:

```js
enter()      // you are the active scene — reset yourself
update(dt)   // one frame; return true when your duration is up
render(r)    // draw yourself
backdrop()   // { color, alpha } for the renderer to clear to
resize()     // the window changed
```

---

## Two worlds, and why the cuts are invisible

Scenes are the *motion*. Worlds are the *look* — every object, material and
dimension. A scene never builds anything.

- **`world/tunnel.js`** is scene 2: deep blue air, fog, the egg at the far end,
  the sperm.
- **`world/lattice.js`** is scenes 3 and 4: white, an orthographic camera, the
  egg, and the icosahedron. Sharing it is why the wireframe the conception
  assembles is the one the computation projects panes off.

The two worlds use **different cameras** — perspective for the tunnel,
orthographic for the lattice — and the egg has to be in exactly the same place
at exactly the same size on both sides of the cut. Neither scene picks a size.
Both derive one from a single number:

```js
// config/space.js
export const EGG_SCREEN = 0.78;   // fraction of the frame's HALF-height

export const CAM_END = TUNNEL.eggZ + TUNNEL.shellR / (EGG_SCREEN * tan(fov/2));
export const ICOSA_EGG_R = (EGG_SCREEN * ICOSA.frustum) / 2;
```

So they agree by construction, at every aspect ratio, and there is exactly one
visible transition in the whole run: the white blow-out that ends the fly-in.

Nothing in the egg is lit, for the same reason — a shaded sphere would resolve
differently under two different projections. The core carries a painted vertical
gradient and the shell a **view-space** rim (`1 - |n.z|`), both of which are
identical under either camera. See `world/egg.js`.

---

## The icosahedron

`three/geometry/icosahedron.js`. Not `THREE.IcosahedronGeometry` — that gives
you triangles, and the conception needs the *structure*.

Only the twelve vertices are typed. Everything else is derived at module load,
so the pieces cannot drift out of agreement:

- **`EDGES`** — the 30 pairs at minimum distance.
- **`FACES`** — the 20 mutually-adjacent triples, wound outward.
- **`PENTAGONS`** — the vertex figures: for each vertex, the ring of five
  neighbours in cyclic order, with its axis and centre. These are what turn.
- **`PENTAGON_PAIRS`** — the six antipodal pairs. A pair turns together, so a
  move reads as one thing happening to the solid.
- **`RECTANGLES`** — the three golden rectangles the decade panes are built on.
- **`THREE_FOLD_VIEW`** — face-on down a 3-fold axis: the silhouette is a
  hexagon and every edge is visible. The view the reference diagram is drawn in.

A fifth of a turn about a vertex axis maps the solid onto itself — it is a
generator of the icosahedral group. Turning pentagons in overlapping waves is
what makes the conception read as a combinatorial calculation rather than a list
of animations.

**The vertex ORDER is load-bearing.** The three golden rectangles are indices
`[0,1,3,2]`, `[4,5,7,6]` and `[8,9,11,10]`, and the decade panes are built on
them. Do not re-order the vertex list.

---

## The static

`three/shaders/noise.js` is plain WebGL 1 with no dependencies;
`components/NoiseField.svelte` hosts it on its own canvas over the 3D. Scenes
only say how much:

| Store | Meaning |
|---|---|
| `noise` | how much grain |
| `noiseWash` | 0 = grain over the picture, 1 = static *instead of* it |
| `noiseGhost` | how much structure clumps out of it |

Grain composites with `mix-blend-mode: overlay`, which is why the shader sits at
mid grey — one layer then works over both the deep blue of the fly-in and the
white of everything after it. The wash switches the blend off, because a flood
has to replace the picture rather than tint it.

**Ghosts** are the dreamlike flashes. Raise `SCENES.conception.ghostAmount`
above 0 to bring them in. With no texture bound they make soft drifting blooms;
call `NoiseField.setGhostSource(canvasOrImage)` to flash real imagery through
the static instead — render a scene to an offscreen canvas and hand it over.

---

## The loop home

"Calculate again" is the one piece of choreography that spans DOM and 3D.

1. `director.again()` floods the frame with static and sets the scene back to
   `calculator`.
2. The Calculator mounts and reads `monitorRect` — the room's screen glass,
   published by the Computation in CSS pixels.
3. Its `outOfMonitor` transition draws the **whole page** at that size, fitted
   inside the glass, and grows it to fill the viewport.
4. The static clears over the first third, so you see the machine sitting on the
   room's computer before you are pulled into it. The controls are held back
   until it is nearly home (`SCENES.calculator.controlsAt`) — at monitor scale
   they are a few unreadable pixels.
5. `director.settled()` releases the room.

The Stage holds the room's last frame on screen for exactly as long as
`monitorRect` is set, which is precisely that window.

Going round again deliberately **keeps** the birthday and the spice —
`director.clearResult()` clears only what the run produced.

---

## Things that will bite you

- **`main` is `pointer-events: none`** so the 3D can be seen through the UI
  layer. Every screen that wants clicks must set `pointer-events: auto` on its
  own root. Forgetting it renders a perfectly visible control that nothing can
  press, and it looks like a dead handler rather than a CSS miss. It has caught
  the restart button, the calculate button and the Spotify player.

- **`bind:value`, not `value={...}`, on the date selects.** A plain value on a
  `<select>` whose `<option>` list re-renders does not stick, and the day list
  changes with the month.

- **Threshold latches.** `if (progress < 0.02)` is not a one-shot: at any normal
  frame rate a short window advances further than that in a single frame and the
  branch is stepped straight over. Use an explicit boolean.

- **Svelte's `tick()` flushes the framework, not the browser's style.** Setting
  and clearing a transform in the same frame collapses and nothing animates.

- **The machine's body is four bars, not a box-shadow spread.** A shadow scales
  with its element, so a machine drawn at monitor size would still flood the
  whole frame with yellow.

- **The egg's materials write no depth.** A transparent material that writes
  depth hides whatever is inside it — which is the icosahedron.

---

## Layout

Three shapes of screen, decided in one place (`config/space.js`, `aspectKind`)
and published as the `aspect` store plus CSS custom properties that
`+layout.svelte` writes onto `:root` from `config/layout.js`:

| Kind | When | What changes |
|---|---|---|
| `landscape` | ratio > 1.2 | window ~30vw, controls side by side |
| `square` | between | window ~46vw |
| `portrait` | ratio < 0.85 | window ~86vw, controls stacked, side furniture hidden |

Nothing else measures the viewport for itself.

---

## Scripts

```
npm run dev        vite dev server
npm run build      production build
npm run lint       prettier --check + eslint
npm run format     prettier --write
npm run check      svelte-check
```
