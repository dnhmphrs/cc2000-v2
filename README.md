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
| 2   | **FlyIn**       | Deep-blue air, one sperm, a run at the ovum. 3D.     | `src/lib/scenes/FlyIn.svelte`       |
| 3   | **Conception**  | The icosahedron is DERIVED, and it is a proof. 3D.   | `src/lib/scenes/Conception.svelte`  |
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
    dev.js            the dev keys and the ?at= scrub
    index.js          one barrel: import { SCENES, span, TUNNEL } from '$lib/config'

  scenes/           the five scenes, plus the director
  store/store.js    every store, with its writer named in the comment

  three/
    Stage.svelte      the canvas, the clock, the running order of the 3D three
    world/
      tunnel.js         scene 2's world — air, fog, motes, the sperm, the ovum
      lattice.js        scenes 3–4's world — the icosahedron, the rim, the cage
      construction.js   scene 3's derivation
      egg.js            the wire globe — a cage and a skin in one world, a circle in the other
      materials.js      every material in the site, and stroke()
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
Only the seconds are scaled, so the choreography is identical.

`?at=0.35` **pins** the running 3D scene at that fraction of its own duration and
holds it there. Because every 3D scene is a pure function of its progress, the
seek is exact — the frame you get is the frame the run would have drawn at that
moment. It is the tool for looking at one beat; without it, checking a
half-second window in a seven-second scene is a matter of taking screenshots and
hoping.

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

- **`world/tunnel.js`** is scene 2: deep blue air, fog, a field of motes, one
  sperm, and the ovum.
- **`world/lattice.js`** is scenes 3 and 4: the void, an orthographic camera, a
  gold circle, the icosahedron, and the 24-cell cage. Sharing it is why the
  wireframe the conception derives is the one the computation projects panes off.
- **`world/construction.js`** is the conception's derivation, built into the
  lattice's own frame so every point it arrives at is a point of the solid.
- **`world/materials.js`** is every material in the site, and the vocabulary
  they share.

---

## Materials, and why there are only four

The site is the inside of a machine. Nothing in it is a photograph of a thing; it
is a thing being **displayed by an instrument** — so nothing is shaded, nothing
is glossy, and the only difference between one surface and another is how it is
being drawn. Two colours do the whole job: an ink and an accent.

|          | what it is                                                | where                                                       |
| -------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| **line** | strokes that draw themselves on, carrying their own depth | every line in the second half, the ovum's cage, the 24-cell |
| **holo** | a body being scanned: a contour set drawn on a surface    | the sperm                                                   |
| **skin** | a view-space silhouette, and only a silhouette            | the ovum, and the gold circle on the void                   |
| **dot**  | a hard core in a soft halo                                | vertices, the compass pen                                   |

**No lights, anywhere.** A lit sphere would need matching lamps in two very
different scenes and would still differ between a perspective and an
orthographic camera. Everything is done in **view space**, where the two agree —
which is why the fly-in's globe and the void's gold circle are the same material
with `base`, `skinOnly` and two colours changed and nothing else.

**Contours, not `wireframe: true`.** three's wireframe gives you the mesh's
topology, and the sperm is nine thousand triangles of thin tube — it renders as a
solid white ribbon. The holo material draws rings around the body and stripes
along it, in the model's own coordinates, so the wire **density** is a number we
choose rather than a decision the artist made in Blender.

Two things three.js will not do for a `ShaderMaterial`, both of which cost a day
each when you find them the hard way:

- **Premultiply.** The canvas is premultiplied, so normal blending is
  `(ONE, ONE_MINUS_SRC_ALPHA)` and a shader handing back straight colour paints
  at full strength whatever its alpha says. Its own materials do this in
  `<premultiplied_alpha_fragment>`; ours have to do it themselves.
- **Encode.** `outputEncoding` is applied by `<encodings_fragment>`, and a
  ShaderMaterial's source is used exactly as written — so a colour handed to one
  of ours is the colour that lands on screen, and `convertSRGBToLinear()` only
  renders it a gamma stop too dark. Stock materials are the opposite case, which
  is what `theme.js ink()` is for.

---

## Scene 2 is a flight, and a flight needs something to fly past

The camera covers 230-odd world units. With nothing between it and the ovum, all
of them read as **zero** — the globe simply gets bigger, and a shape growing in
the middle of an empty frame is a zoom, not a flight. Three things fix that:

- **the motes** — one `LineSegments`, one draw call. Each is a short segment
  lying along the flight axis, so it is a dot when far off and a streak as it
  passes. They are placed relative to the CAMERA and wrap:
  `mod(aPhase - uCamZ, uSpan)` folds the whole field into the slab of air ahead
  of the lens, so it is equally dense at every point of the flight for the price
  of a few hundred segments and nothing is animated on the CPU.
- **the lens** — 26mm out to 44mm across the run. Widening on the way IN is the
  half of a dolly zoom that exaggerates speed.
- **the roll** — the sperm turns about its own long axis, once every four
  seconds, linear. No orbit, no wobble, no easing. That is V1's rotation exactly,
  and it is the difference between an animal swimming and a prop being swung
  round on a stick.

`EGG_SCREEN` is **above one**: the thing you have flown 230 units to reach should
not fit on the screen.

Sizes in `TUNNEL` are **fractions of the frame**, not scale factors on a model
whose file we do not control. Two bugs came out of getting that wrong, and both
are worth knowing about:

- the corkscrew radius was a raw number from the `.glb`, and at the distance the
  sperm actually rode it swung the body clean out of frame for the whole scene;
- the mesh was normalised on its **longest** dimension, which is its length —
  and it points straight away from the camera, so that axis is the one entirely
  foreshortened. It came out a third of the size it was asked to be. What
  `spermSpan` means is how much of the frame it covers, so it is normalised on
  the cross-section.

And the overtake is **relative to the lens**, not to the world: the camera is
itself covering 230 units while it happens, so a world-space lerp from behind the
camera to in front of it has to out-run the camera to arrive at all — and it does
not.

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

## Scene 3, and what it proves

The conception DERIVES the icosahedron, and it is an actual proof — every length
in it is exact and the arithmetic is written down in `world/construction.js`:

|                    |                                         |                                              |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| the **circle**     | the solid's own circumcircle            | radius √(1+φ²)                               |
| the **pentagon**   | regular, inscribed in it                | side s = 2R·sin36° = √5                      |
| the **pentagram**  | its five diagonals                      | d = 2R·sin72° = √5·φ, so **d/s IS φ**        |
| the **ratio bar**  | s and d end to end, both scaled by 2/√5 | which is exactly 2 and 2φ                    |
| the **rectangles** | three, in that ratio, flat in the page  | 2 × 2φ — the solid's golden rectangle        |
| the **fold**       | two stand up perpendicular to the first | their twelve corners are the twelve vertices |

Nothing is fudged to make the fold land: it lands because it is the shape.

The frame is at **identity** for the flat work, because that is the one attitude
in which the first golden rectangle is exactly square to the camera, and turns to
`ICOSA.tilt` on the fold. The drawing becoming a solid and the page turning away
are one move.

It ends on the **union**: the last edge closes and the whole figure answers at
once — the twelve corners strike, the line-work overdrives, the rim flares.
Everything it drives is additively blended, which is why it can be given a level
above 1 at all. Without that beat this is a geometry lecture standing where a
conception ought to be.

---

## Scene 4, and the space it happens in

Near-black and gold. The panes come out as **drafting first** — the rectangle,
its dimension lines, its 1:φ bar, its spiral, its dashed traces back to the
vertices it came off — and the rooms fade up through that before the working
steps back.

The search **locks square**. Every step turns a decade face-on to the camera by
the direct arc — the shortest rotation between two poses — and stops. It was
tried the other way, holding an oblique attitude and only squaring up for the
answer; it reads as drift. A machine turns a thing to face you and stops: the
precision IS the drama.

Behind all of it is the **cage**: a 24-cell, the regular 4-polytope whose 24
vertices are every permutation of (±1, ±1, 0, 0), projected from four dimensions
and hung around the scene. Three things make it read as one figure rather than a
haze, and all three are V2's:

- **it turns with the solid** — the same quaternion, so the whole frame swings as
  one object;
- **it is locked to the screen** — handed the live frustum height every frame, so
  it is the same size at every zoom. A fixed world size balloons during the fall
  into the room;
- **it is behind everything** — its own scene, drawn first, depth cleared after.
  Left in the main scene it is either occluded to ribbons by the room artwork or
  laid over the top of it.

The blueprint field (`three/shaders/grid.js`) is what it is drawn on: a ruled
screen-space grid, a heavier rule every eighth line, a crosshair, corner
registration brackets. It is **flat**, and drawn at **full resolution** — the
field used to be a soft wash where half a pixel of blur cost nothing, and a grid
at half resolution scaled up is a smear.

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
