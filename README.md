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

| #   | Scene           | What it is                                            | Where                               |
| --- | --------------- | ----------------------------------------------------- | ----------------------------------- |
| 1   | **Calculator**  | The machine. Takes both answers. DOM.                 | `src/lib/scenes/Calculator.svelte`  |
| 2   | **FlyIn**       | Black air, one swimmer, 300 units to the ovum. 3D.    | `src/lib/scenes/FlyIn.svelte`       |
| 3   | **Conception**  | A wave settles into the solid, which is then derived. | `src/lib/scenes/Conception.svelte`  |
| 4   | **Computation** | Panes out, survey, clock the decades, fall in. 3D.    | `src/lib/scenes/Computation.svelte` |
| 5   | **Room**        | The answer, in that room's monitor. DOM.              | `src/lib/scenes/Room.svelte`        |

Scenes 1 and 5 are DOM screens with no 3D of their own; 2–4 are 3D.
`src/lib/scenes/director.js` owns every transition between them — it is four
functions long and it is the first file to read.

**Scenes 2, 3 and 4 are one shot.** There is no cut anywhere in the middle of the
run: the fly-in ends on the exact frame the conception opens on, and the
conception hands the computation a solid it has already assembled. See the
colour walk below, and `SCENES.flyIn.shellOut` in `config/timing.js` for how the
hand-over is arranged.

---

## The colour walk

The machine is yellow on deep blue and the bedrooms are their own colour. Between
them, **the middle three scenes are one world: black and gold.**

```
  yellow machine        ┌─────────────────────────────────────────────┐        the room's
  on deep blue     →    │  black air · gold ovum · blue swimmer       │   →    own colour
                        │  black void · gold line-work · blue is gone │
                        └─────────────────────────────────────────────┘
                          2 FlyIn        3 Conception     4 Computation
```

Blue survives as the one **cold** thing in it — the swimmer and the debris in the
air — and there is none of it left after the conception. Everything else is gold
on `VOID`, over the blueprint field in `three/shaders/grid.js`: a ruled
screen-space grid, a centre crosshair, corner registration brackets, and `uRot`
carrying the ruling in the same coordinates the icosahedron is turning in, so the
ground swings with the solid instead of sitting behind it.

### There used to be a white blow-out here

The fly-in ended on a flash, because the world underneath it changed: deep-blue
air on one side, the void on the other, and a cut like that needs covering.

It does not change any more, so the flash was not smoothing a transition — it was
**announcing** one. What it actually did was break the only three scenes that are
supposed to run as one shot into two halves with a bang in the middle, and make
the conception look as though the run had reset.

What replaced it is that the two frames either side of the hand-over are the
**same frame**:

- the fly-in's cage goes as you pass through it, leaving the ovum's **core** — a
  dark sphere with a gold rim;
- its air walks down to `VOID`, and `fieldFade` (`store/store.js`) takes both
  backdrop shaders down to their bare ground colour, so `deep` and `grid` are the
  same flat black at the swap;
- `FlyIn.coreRatio()` derives the core's size from the **next** scene's framing
  every frame, solving the tangent cone at both ends so the two gold circles land
  on the same pixels on any screen and any lens.

Measured at 1280×800 and at 430×900: same radius, same peak brightness, both
sides. The envelope (`FLASH_HOLD`, `FLASH_FALL`) is still in `Stage.svelte`
because it costs nothing. Nothing throws it.

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
  duration: 14.5,
  spermIn:  [0.015, 0.13],  // it comes past the camera from behind
  close:    [0.08, 0.66],   // its corkscrew tightening across the run
  dive:     [0.78, 0.94],   // it breaks formation and goes in
  shellOut: [0.8, 0.955]    // the cage shed, leaving the core to hand over
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

- **`world/tunnel.js`** is scene 2: black air, fog, a field of motes, one
  swimmer, and the ovum.
- **`world/lattice.js`** is scenes 3 and 4: the void, a very long lens, a gold
  circle, the icosahedron, and the 24-cell cage. Sharing it is why the wireframe
  the conception derives is the one the computation projects panes off.
- **`world/egg.js`** is the ovum, and it is **two spheres** — see below. Both
  worlds build one from it, which is what lets scene 2 hand scene 3 its last
  frame.
- **`world/construction.js`** is the conception's derivation, built into the
  lattice's own frame so every point it arrives at is a point of the solid.
- **`world/materials.js`** is every material in the site, and the vocabulary
  they share.

---

## The ovum is two spheres

A wireframe globe on its own is a scribble: the near lines and the far lines are
the same lines and the eye cannot separate them. V1 solved it with an opaque
sphere at radius 14 inside a transparent one at 22, and every version since
dropped the inner one.

`world/egg.js` builds both:

- **the core** — opaque, dark, and the only thing in the site that writes depth.
  It hides the cage's far half, and the instant it does the cage has an inside
  and an outside. It is also what the conception opens on.
- **the shell** — the cage in a held-back gold, three bright gold great circles
  cutting it in the three coordinate planes, and a silhouette.

The three great circles are not decoration: they are the three mutually
perpendicular planes the whole second half is built on — the same three the
golden rectangles lie in — so the thing being swum at is already carrying the
figure it becomes.

### And the core carries the wave that divides

`coreMaterial()` in `world/materials.js` draws a scalar field on that surface and
displaces the skin by it:

```
f(n) = Σ wᵢ · P₆(n · aᵢ)     over the icosahedron's six five-fold axes
```

`P₆` is the sixth Legendre polynomial and the `aᵢ` are the axes through opposite
vertices. Degree 6 is the **first** degree at which a non-constant icosahedral
invariant exists at all — the degree-2 and degree-4 sums vanish identically — so
the completed field is not a pattern chosen to look icosahedral, it is the only
thing of its kind there is, and its twelve antinodes are the twelve vertices.

What makes it a conception rather than a diagram is that the axes come in **one
at a time** (`uGrow`, 0→6):

| axes in | antinodes |                                                     |
| ------- | --------- | --------------------------------------------------- |
| 1       | 2         | a sphere pulling into a dumbbell. Mitosis.          |
| 2       | 4         |                                                     |
| 3       | 6         |                                                     |
| …       | …         |                                                     |
| 6       | 12        | and twelve antinodes on a sphere is an icosahedron. |

Every step is a division, the count doubles and doubles again, and the thing it
converges on is the answer. Nothing is drawn that is not forced by the symmetry
being assembled. `uRing` is the mode's own oscillation, damped out as it settles
— an excited normal mode relaxing, which is the honest version of a ripple.

It is normalised by its live peak so the amplitude does not lurch as axes arrive:
all six axes meet each other at `arccos(1/√5)`, so the largest the sum can be is
`0.328·ΣW + 0.672·max(w)`, worked out in the shader.

Drawn as a **contour map** rather than a shaded ball — level sets every fifth of
the range, and the nodal set (where the field is zero) brightest of all, because
that curve system IS the figure. A gold sphere is a bauble; this is a readout.

---

## Materials, and why there are only five

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
different scenes and would still differ between one lens and another. Everything
is done in view space — which is why the fly-in's core and the void's gold circle
are the same material with the same numbers, and therefore why one scene can hand
the other its last frame.

**Silhouettes are measured against the view RAY, not the view axis**, and the
difference is not academic. `1 - |n.z|` is the edge of a shape only under an
_orthographic_ camera, where every ray is the axis. On a lens the silhouette is
the tangent cone and its normal is tilted away from the axis by `asin(R/d)` —
sixteen degrees on the fly-in's ovum. At the eighth power that turns a term which
should be 1.0 at the edge into 0.07, which is exactly why the fly-in's gold rim
was invisible while the void's, on a much longer lens, was merely dim.

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

## Scene 2 is a flight, and a flight needs LENGTH

The ovum is **490 world units away** and it takes **fourteen and a half seconds**
to reach it. Both numbers are large on purpose and neither is negotiable.

V1 put its ovum 250 units off and took twenty seconds to get there at a flat 12.7
units a second, and that is why V1's fly-in has any weight: the thing appears as
a rumour in the fog, you travel toward it long enough to forget you are
travelling, and it is enormous when you arrive. Every later version shortened the
run, and every one of them turned an **arrival** into a zoom — because a shape
that grows in an empty frame for two seconds is a shape being scaled, and one
that grows for fifteen is somewhere you went.

Four things carry it:

- **the speed** — `glide()` in `config/ease.js`: one constant speed for three
  quarters of the run, then a stop, the two halves joined with matching slope so
  there is no kick where they meet. NOT an ease-in-out, which spends its middle
  at double speed and reads as a camera being moved rather than as travel.
- **the motes** — one `LineSegments`, one draw call. Each is a short segment lying
  along the flight axis, so it is a dot when far off and a streak as it passes.
  They are placed relative to the CAMERA and wrap: `mod(aPhase - uCamZ, uSpan)`
  folds the whole field into the slab of air ahead of the lens, so it is equally
  dense at every point of the flight for the price of a thousand segments and
  nothing is animated on the CPU. Without them the flight is a zoom: there is
  nothing else between the lens and the ovum for three hundred units.
- **the fog, doing the arrival itself** — the cage is not keyframed on. The line
  materials are additive and carry no fog of their own (that is what lets thirty
  gold edges read on the void later), so `FlyIn.svelte` applies the weather to
  them by hand, from the camera's actual distance, using exactly the exponential
  `scene.fog` uses. Six percent of the cage at a quarter of the way in, twenty at
  half, half at three quarters. A thing resolving as you close on it, rather than
  a wireframe fading up in the middle of an empty frame.
- **the lens** — 28mm out to 40mm. Widening on the way IN is the half of a dolly
  zoom that exaggerates speed. The swimmer's riding distance is **compensated**
  for it (`tunnel.setFov`), so the only thing in the shot that changes size is
  the thing you are travelling toward.

`EGG_SCREEN` is **above one**: the thing you have flown five hundred units to
reach should not fit on the screen.

### The rotation is V1's, and it is not a roll

V1 hung the model OFF the pivot — `sperm.position.y -= 0.695` on a body about
half a unit long — and then spun the pivot at ten radians a second. So the body
**orbits** the axis of the lens while rolling about its own: a corkscrew that
swings across the frame, out past the edge, and back, all the way in.

A pure axial roll was tried in its place. It is tidier and it is wrong — it is a
prop turning on a spit. `world/tunnel.js` builds it as three nested groups
(`sperm` → `spinner` → `arm`) so the offset is real, and the radius is live,
because it **closes** across the run: wild while the swimmer is still overtaking
you, tightening to a steady corkscrew ahead of you once you are travelling
together. That is the one liberty taken with V1's number, and it is taken because
fifteen seconds of something strobing past the edge of frame is fifteen seconds
of nothing.

### And two bugs worth knowing about

Sizes in `TUNNEL` are **fractions of the frame**, not scale factors on a model
whose file we do not control. Both of these came out of getting that wrong:

- the corkscrew radius was a raw number from the `.glb`, and at the distance the
  swimmer actually rode it swung the body clean out of frame for the whole scene;
- the mesh was normalised on its longest dimension in a pose where that axis was
  foreshortened, and it came out a third of the size it was asked to be.

And the overtake is **relative to the lens**, not to the world: the camera is
itself covering three hundred units while it happens, so a world-space lerp from
behind the camera to in front of it has to out-run the camera to arrive at all —
and it does not.

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

**Two beats, and neither of them is a drawing.**

There used to be three: a generic ripple, then the icosahedral mode, then a
compass-and-pentagon derivation — circle, pentagon, pentagram, ratio bar, three
golden rectangles, fold — that rebuilt from scratch the exact thing the mode had
already produced. All of that is gone. It was good geometry standing in the wrong
place: the wave IS the icosahedron by the time it has finished, and re-deriving it
afterwards is the scene stopping to explain itself.

So:

1. **It divides.** The standing wave comes up on the ovum's core and the six
   five-fold axes come in one at a time — 2 antinodes, 4, 6, 8, 10, 12. See _And
   the core carries the wave that divides_ above; every step of it is forced by
   the algebra rather than chosen.

2. **It is the solid.** Nothing is rebuilt. The twelve antinodes are struck as
   the twelve corners, in place. The six axes the sum was taken over are drawn as
   the six long diagonals — because that is literally what they are. The thirty
   edges close between corners that are already there. The surface stays, dropped
   to a ghost, as the shell the frame sits in.

The whole scene is at `ICOSA.tilt` and never turns. There is no page to square up
any more, because the drawing and the solid are the same object.

It ends on the **union**: the last edge closes and the whole figure answers at
once — the corners strike, the line-work overdrives, the rim flares. Everything it
drives is additively blended, which is why it can be given a level above 1 at all.

The φ arithmetic did not disappear with the compass, incidentally. It is drawn in
scene 4, on every pane, by `GoldenRectangleSchematic` — dimension lines, the 1:φ
bar, the spiral — which is where working belongs: next to the thing being worked
out.

---

## Scene 4, and the space it happens in

Near-black and gold. The panes come out as **drafting first** — the rectangle,
its dimension lines, its 1:φ bar, its spiral, its dashed traces back to the
vertices it came off — and the rooms fade up through that before the working
steps back.

Then it **stops and looks**. The survey is two and a half seconds of the whole
assembly, fully out, turning, before a single decade is chosen — the beat V2 had
and every version since dropped, and dropping it is why the clocking afterwards
never landed: a machine cannot be seen to select from a set you have never been
shown.

Its yaw is a **full sine** — out one way, back through the rest pose, out the
other, home — rather than a single swing to somewhere. That is both livelier and,
more to the point, it ends the beat **flat and facing**, which is where the search
has to start from. A survey that finishes on an arbitrary oblique leaves the first
turn of the search un-doing it.

It is also the only place in the run with any perspective in it. The lattice
camera is a **lens**, not a box — `applyFrustum()` parks it at whatever range
makes `fr` world units fill the frame at the plane it is focused on, so every
framing number in `config/space.js` means exactly what it meant under the
orthographic camera it replaced. At `ICOSA.fov` (12°) that is very nearly
orthographic, which is the register this half is drawn in. The survey opens it to
`fovWide` and walks the camera in to match: a true dolly zoom, framing held to
the pixel and the space transformed — near rooms swelling off the frame, far ones
falling away. Then it closes back and the machine gets to work.

(The fall into a room sets `setFocus()` to that room's own depth, because the
pane is six units off the origin and at the landing pose that offset is pure
depth. Frame the height at the origin instead and the room lands a tenth too
small.)

The search **locks square**. Every step turns a decade face-on to the camera by
the direct arc — the shortest rotation between two poses — and stops. It was
tried the other way, holding an oblique attitude and only squaring up for the
answer; it reads as drift. A machine turns a thing to face you and stops: the
precision IS the drama.

Two things it deliberately does **not** do, and both were tried:

- **the camera does not move.** Not a lean, not a nudge, nothing. A frustum that
  pumps in on every candidate is the single loudest way to make a precise
  instrument look like a slideshow transition.
- **nothing fades on the beat.** The other five rooms do not dim, pulse or step
  back. Six rooms flickering at each other four times running is a slideshow with
  a transition on it; the turn, and the stop at the end of it, are the whole
  event.

And the fall at the end is a plain, dead-centre zoom on the **whole scene**, on
one symmetric ease, with nothing in it staggered. The depth-parallax version —
the bed rushing past first, then the desk, then the screen — pulls the room apart
at the exact moment it is supposed to become a place.

**It lands full-bleed.** Two offsets have to be right for that, and neither
existed under the orthographic camera this replaced: the pane is `paneReach` out
along its own axis (pure depth at the landing pose), and the room's artwork hangs
`ICOSA.roomDepth` further back again, because the back wall is the deepest layer.
`landingDepth()` focuses on the wall, not the pane — focus on the pane and the
room comes up a quarter too small, with the void showing round it. The frustum is
then taken from the wall's own size (`coverExtent()`), not the golden rectangle's,
because the wall is a cover layer and overflows the rectangle on one axis.

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
  the frustum down toward the glass, republishing `monitorRect` every step. The
  Stage drives it, because by then the scene is not running — it is being held on
  screen.
- The **calculator** grows out of that monitor. Its `outOfMonitor` transition
  reads the **live** `monitorRect` every frame rather than a snapshot, so it
  stays locked to the glass while the glass is moving.

Reading a snapshot instead is the bug it looks like: the screen zooms and the
room behind it sits still.

### And it stays in the room

The move used to finish by clearing the transform: the glass ended up covering
the viewport, the machine was simply full-screen again, and the bedroom you had
spent nine seconds flying into was gone.

It stops short now. `RETURN_FILL` (config/layout.js) is how much of the viewport
the glass ends up covering — **under one** — so the machine lands sitting on the
desk, in the monitor, with the room round it. That is where the second run is
operated from, and it is the one place in the site where two scenes are on screen
at once. `monitorRect` therefore stays live for good; the calculator keeps fitting
itself to it, and the Stage keeps drawing the room behind it. It is cleared when
the next run reaches the computation, which is the moment the room stops being
the thing behind the machine.

The launch composes with that fit, because the machine is no longer full-screen
when it leaves: `intoLens` warps out of the **glass**, written about the window's
own centre with explicit translates rather than a `transform-origin`, since the
origin would have to apply to the fit as well and the fit is measured from the
top-left of the page.

**Framing the flight** is the one sum that is easy to get wrong here, and it was:
predicting the final frustum from the glass's current on-screen size is right
under an orthographic camera and wrong under a lens. The glass hangs in front of
the plane being framed, so it magnifies faster than the frustum shrinks and the
flight lands about twice as far in as asked. `beginReturn()` takes the glass's
**real world size** (`glassExtent()`) and walks the focus plane onto the glass as
it goes, which is exact.

The controls are held back until it is nearly home — at monitor scale they are a
few unreadable pixels.

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

`scripts/shots.mjs` is the other half of the toolkit: a contact sheet of any beat
of any 3D scene, exactly.

```
PLAN='[["2",[0.3,0.75,1]],["3",[0,0.32]]]' node scripts/shots.mjs
```

Every 3D scene is a pure function of its own progress, so `?at=` pins one at a
fraction of its duration and holds it — the frame you get IS the frame the run
would have drawn at that moment. Checking a half-second beat inside a
fifteen-second scene by taking timed screenshots and hoping is not a method,
particularly under a software renderer where `dt` is clamped and the scene
advances at roughly half real time.

It is also how the hand-over is checked: shoot `flyIn` at 1 and `conception` at
0, and the two files should be the same picture.

`BASE`, `CHROMIUM`, `OUT`, `W`, `H` and `PLAN` are all overridable from the
environment.
