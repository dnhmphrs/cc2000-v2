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
         └──────────────────────────── calculate again ───────────────────────────────┘
```

| #   | Scene           | What it is                                           | Where                               |
| --- | --------------- | ---------------------------------------------------- | ----------------------------------- |
| 1   | **Calculator**  | The machine. Takes both answers. DOM.                | `src/lib/scenes/Calculator.svelte`  |
| 2   | **FlyIn**       | Deep-blue air, a pack of five, a run at the egg. 3D. | `src/lib/scenes/FlyIn.svelte`       |
| 3   | **Conception**  | The icosahedron is DERIVED. Three variants. 3D.      | `src/lib/scenes/Conception.svelte`  |
| 4   | **Computation** | Panes out, search the decades, fall into a room. 3D. | `src/lib/scenes/Computation.svelte` |
| 5   | **Room**        | The answer, in that room's monitor. DOM.             | `src/lib/scenes/Room.svelte`        |

Scenes 1 and 5 are DOM screens with no 3D of their own; 2–4 are 3D.
`src/lib/scenes/director.js` owns every transition between them — it is four
functions long and it is the first file to read.

---

## The colour walk

No two consecutive scenes are on the same ground, and the whole run is built
around that:

```
  yellow machine        deep blue air        WHITE BLOW-OUT     gold on the void       the room's
  on deep blue     →    going white     →    (the one cut)  →   (scenes 3 and 4)   →   own colour
```

The blow-out is the hinge. The frame goes white and the world underneath it
changes from deep-blue air to near-black while your eye is recovering, which is
why the second half of the run can be a completely different place from the
first without a transition to get there. It is thrown by `Stage.svelte` and it
is shaped, not decayed: pure white for a beat and then gone (`FLASH_HOLD`,
`FLASH_FALL`). An exponential fall spends most of its length as a grey veil over
the scene it is meant to be hiding.

Everything after the flash is drawn in gold on `VOID`, over the blueprint field
in `three/shaders/grid.js`: a ruled screen-space grid, a centre crosshair,
corner registration brackets, and a LATTICE carried by `uRot` — three families
of planes in the same coordinates the icosahedron is turning in, so the ground
swings with the solid instead of sitting behind it.

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
    dev.js            the dev keys, and which conception variant runs
    index.js          one barrel: import { SCENES, span, TUNNEL } from '$lib/config'

  scenes/           the five scenes, plus the director
  store/store.js    every store, with its writer named in the comment

  three/
    Stage.svelte      the canvas, the clock, the running order of the 3D three
    world/
      tunnel.js         scene 2's world — air, fog, motes, the pack, the egg
      lattice.js        scenes 3–4's world — the icosahedron, the rim, the cage
      construction.js   scene 3's three variants
      egg.js            the sphere, shared by both worlds — wet in one, a rim in the other
      ink.js            the one line material, and stroke()
    geometry/
      icosahedron.js    vertices, edges, faces, pentagons, golden rectangles
    objects/            the decade panes, their drafting, and their room artwork
    shaders/            one full-screen field per scene — deep, grid, flat, theta, white

  components/
    Background.svelte   compiles whichever field the running scene asked for
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
  whiten:  [0.84, 1.0]     // the dark turning white under the flash
}
```

```js
// scenes/FlyIn.svelte
const p = clamp01(t / T.duration); // 0..1 through the scene
const eggIn = span(p, T.eggIn); // 0..1 through that beat
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
accumulating. The conception's pose and the computation's search step are both
functions of the scene's progress alone. Nothing integrates `dt`.

That is why they can be reset, re-entered or scrubbed without drifting, and it
is worth keeping if you add to them.

### The scene interface

Every 3D scene answers exactly five calls, and `Stage.svelte` knows nothing else
about them:

```js
enter(); // you are the active scene — reset yourself
update(dt); // one frame; return true when your duration is up
render(r); // draw yourself
backdrop(); // { color, alpha } for the renderer to clear to
resize(); // the window changed
```

---

## Two worlds

Scenes are the _motion_. Worlds are the _look_ — every object, material and
dimension. A scene never builds anything.

- **`world/tunnel.js`** is scene 2: deep blue air, fog, the egg at the far end,
  a pack of six sperm, and a field of motes.
- **`world/lattice.js`** is scenes 3 and 4: the void, an orthographic camera, a
  gold circle, the icosahedron, and the 24-cell cage. Sharing it is why the
  wireframe the conception derives is the one the computation projects panes off.
- **`world/construction.js`** is the conception's three variants, built into the
  lattice's own frame so every point they arrive at is a point of the solid.
- **`world/ink.js`** is the one line material everything in the second half is
  drawn with, plus `stroke()` — a polyline that draws itself on end to end, which
  is what every compass sweep in the conception is made of.

### Scene 2 is a flight, and a flight needs something to fly past

The camera covers about 180 world units in seven seconds. With nothing between
it and the egg, all 180 of them read as ZERO — the egg simply gets bigger, and a
shape growing in the middle of an empty frame is a zoom, not a flight. Three
things fix that, and between them they are the whole shot:

- **the motes** — one `LineSegments`, one draw call. Each is a short segment
  lying along the flight axis, so it is a dot when far off and a streak as it
  passes. They are not placed in the world but relative to the CAMERA, and wrap:
  `mod(aPhase - uCamZ, uSpan)` folds the whole field into the slab of air ahead
  of the lens, so it is equally dense at every point of the flight for the price
  of a few hundred segments and nothing is animated on the CPU.
- **the pack** — five rivals, dimmer, riding nearer the lens. They lose. Each
  slips back past the camera in its own time, so the flight has a running score
  rather than one animal swimming.
- **the lens** — 24mm out to 46mm across the run. Widening on the way IN is the
  half of a dolly zoom that exaggerates speed.

Sizes in `TUNNEL` are **fractions of the frame**, not scale factors on a model
whose file we do not control: `tunnel.js` normalises the mesh (centred on its
own bounding box, longest dimension scaled to one world unit) and works
everything out against the frame's half-height at the riding distance. The bug
that made this scene read as an empty blue rectangle was exactly this — a
corkscrew radius taken raw from the file, which at the distance the sperm
actually rode swung it clean out of frame for the whole scene.

### Nothing is lit

Not the egg, not the frame. A lit sphere would need matching lamps in two very
different scenes and would STILL differ between a perspective and an
orthographic camera. Everything is done in VIEW space, where the two agree: the
yolk carries a painted top-to-bottom ramp, and the shell a rim, a key and a
specular worked out from the view normal alone (`world/egg.js`). The result is a
wet, glossy ovum for the price of one material — and the highlight can be walked
across it by moving one uniform, which is what `setLight()` is for.

The same material with the key turned off and the base alpha at zero is a pure
RIM, which is what the void wants: a gold circle the frame is inscribed in. Same
file, two numbers.

---

## The icosahedron

`three/geometry/icosahedron.js`. Not `THREE.IcosahedronGeometry` — that gives
you triangles, and the conception needs the _structure_.

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
generator of the icosahedral group, so a spinning pentagon is the visible form
of a step in the calculation. The pentagons are built as their own objects with
their own spin axes for exactly that reason, but nothing turns them on today.
`world.setSpokes()`, `world.setPentagons()` and `world.pentagons[i].spinner` are
all waiting.

### The pose is load-bearing too

Looked at down any of its symmetry axes an icosahedron COLLAPSES: pairs of
vertices land on top of each other in projection and thirty edges read as a flat
star. `ICOSA.tilt` was picked by maximising the smallest gap between any two of
the twelve vertices on screen, subject to one extra condition — that the first
golden rectangle stays nearly square to the camera, because the conception's
default variant draws it flat and then folds the other two up out of the page.

It scores **0.412** of the circumradius, which is the global maximum to three
figures, at 0.92 face-on. The pose it replaced scored 0.21 and 0.71, which is
why the frame read as a tangle and the rectangle the whole of scene 4 is built
on was never legible in it.

---

## Scene 3, and its three variants

The conception has one job: put the icosahedron on screen, big, centred, in a
pose you can read, having EARNED it. There are three ways to do that in the
build and they are alternatives, not a sequence. Switch with
`?conception=construct|strike|divide`, or set `CONCEPTION` in `config/dev.js`.

| Variant         | What happens                                                                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`construct`** | The derivation, and the default. A compass sweep; the pentagon inscribed in it; the pentagram inside that, which is where φ comes from; the three golden rectangles in that ratio, flat and stacked in the page; then two of them fold up and their twelve corners ARE the icosahedron. |
| **`strike`**    | The impact. A singularity where the sperm went in, twelve vertices thrown out of it on trails, thirty edges closing between them, and a recoil onto the resting pose.                                                                                                                   |
| **`divide`**    | Cleavage. One cell becomes two, two become four, four become twelve, and the twelve are sitting exactly where the vertices go.                                                                                                                                                          |

`construct` is the default because it is the only one that makes scene 4
inevitable rather than merely next: the three rectangles it folds up are the
three the computation projects its rooms off, and the frame is at IDENTITY while
it draws them — the one attitude in which the first rectangle is exactly square
to the camera — turning to `ICOSA.tilt` as the fold happens. The drawing
becoming a solid and the page turning away are one move.

All three share a duration and a hand-over: the icosahedron at `ICOSA.tilt`,
the rim up, the frame fully drawn. Nothing else.

**The vertex ORDER is load-bearing.** The three golden rectangles are indices
`[0,1,3,2]`, `[4,5,7,6]` and `[8,9,11,10]`, and the decade panes are built on
them. Do not re-order the vertex list.

**The SCALE is load-bearing too.** The raw vertices have circumradius √(1+φ²) ≈
1.902, and `GoldenRectangle` builds the decade panes from those same raw
coordinates — so at projection 0 a pane sits exactly on the solid's own edges
and appears to come out of it. Scale the geometry and the panes no longer line
up with the shape they emerge from, and the solid outgrows the sphere it is
supposed to sit softly inside. The conception shows it larger while it
assembles by scaling the `wire` GROUP (`ICOSA.wireBuild`), never the geometry,
and draws that back to 1 before handing over.

---

## The loop home

"Calculate again" is the one piece of choreography that spans DOM and 3D.

It is **one move seen from two sides**, and both sides share one duration
(`SCENES.calculator.arrive`):

- The **camera** flies into the room's monitor. `Computation.stepReturn()` walks
  the frustum down until the glass fills the frame, republishing `monitorRect`
  every step. The Stage drives it, because by then the scene is not running —
  it is being held on screen.
- The **calculator** grows out of that monitor. Its `outOfMonitor` transition
  reads the **live** `monitorRect` every frame rather than a snapshot, so it
  stays locked to the glass while the glass is moving, and blends toward
  identity so it lands square on the viewport at the end.

Reading a snapshot instead is the bug it looks like: the screen zooms and the
room behind it sits still.

The controls are held back until it is nearly home
(`SCENES.calculator.controlsAt`) — at monitor scale they are a few unreadable
pixels. `director.settled()` then releases the room, and the Stage holds the
room's last frame for exactly as long as `monitorRect` is set, which is
precisely that window.

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

- **Custom shaders must PREMULTIPLY.** three.js runs the canvas premultiplied,
  so normal blending is `(ONE, ONE_MINUS_SRC_ALPHA)` and a `ShaderMaterial` that
  hands back straight colour paints at full strength whatever its alpha says.
  Built-in materials do this in `<premultiplied_alpha_fragment>`; ours have to do
  it themselves. This is how a rim that should have been a hairline circle ended
  up a solid gold disc.

- **Custom shaders are NOT output-encoded.** `outputEncoding` is applied by
  `<encodings_fragment>`, and a `ShaderMaterial`'s source is used exactly as
  written — so a colour handed to one of ours is the colour that lands on screen,
  and `convertSRGBToLinear()` only renders it a gamma stop too dark. Stock
  materials are the other way round, which is what `theme.js ink()` is for. Get
  this wrong and the same gold is two different colours in the same drawing.

---

## Layout

Three shapes of screen, decided in one place (`config/space.js`, `aspectKind`)
and published as the `aspect` store plus CSS custom properties that
`+layout.svelte` writes onto `:root` from `config/layout.js`:

| Kind        | When         | What changes                                          |
| ----------- | ------------ | ----------------------------------------------------- |
| `landscape` | ratio > 1.2  | window ~30vw, controls side by side                   |
| `square`    | between      | window ~46vw                                          |
| `portrait`  | ratio < 0.85 | window ~86vw, controls stacked, side furniture hidden |

Nothing else measures the viewport for itself.

---

## Scripts

```
npm run dev        vite dev server
npm run build      production build
npm run lint       prettier --check + eslint
npm run format     prettier --write
npm run check      svelte-check
npm run verify     drive the real site in a browser (needs dev running)
```

`npm run verify` is the walk-through, automated — `scripts/verify.mjs`. It runs
the whole thing in Chromium at landscape, square and portrait, does both
out-of-range verdicts, drives the loop home and asserts the calculator grows out
of the monitor monotonically, double-clicks "calculate again", resizes mid-run,
runs `?speed=` at both extremes, and hit-tests the Spotify player and the restart
button — that last one because `main { pointer-events: none }` has silently
killed a visible control three times now. It exits non-zero on any failure and
drops screenshots in `.verify/`.

`BASE`, `CHROMIUM` and `OUT` are all overridable from the environment.
