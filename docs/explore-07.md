# Exploration 07: conception — flow-conception

**`flow-conception`** (`/lab?sketch=flow-conception`, and on `/flows` after
the dodecahedral space) is the run the lead steered to after looking at the
fold below: _"that initial title page is clean. the date and spicy slider
look clean. but let me actually enter/interact manually. then … yes to
wrapping the cell into the tube. but instead of going to torus, have the
tube form into a sperm. then have it start swimming … through the
ink/scene/fall (closer to the original chalk through the rooms). and then end
with the sperm splashing onto the screen of the final room."_ And: the rooms
stay 2D, and one run, not a menu.

The run, 42 s: the terminal types the card; its full stop lights and stays as
the origin while the terminal's own cells come up as a lattice (no zoom into
the dot); "when were you born?" is a date field on a lattice row and "how
spicy?" a 1–10 slider whose stops are lattice points, the second family
leaning under the handle — **answered by hand in the lab** (type the eight
digits, Backspace, Enter; drag the handle or ← → or a digit, Enter; the run
waits at each); the cell rolls into a tube (`log/kummer.js`'s roll); the tube
gathers into a head and draws out a tail — the swimmer (`helix.js`), its head
lit — turns on its axis, faster the spicier, and swims off as the lens comes
round behind it; out of the dark the first chalk room comes up and the
swimmer leads the lens down through the rooms, glass after glass
(`log/fall.js`, flow-chalk's fall as it was: no background, the colour
flooding at the landing); as the lens lands in the answer's room the swimmer
swims on into its monitor and SPLASHES on the screen, gold, the glass lit.
The year picks the room (before 1960 the 1950s, before 1980 the 1960s, before
2005 the 1990s, then the 2010s); the spice leans the lattice and sets the
tail's turn. Pinned (`?at=`), in a reel, or with `?demo=1` the hand is
scripted (14 · 02 · 1987, spice 7), so every frame is a pure function of
progress. The beat table is in the file's header.

What is exact: the lattice from the answers, the cell's gluing as it rolls,
the fall's similarities. A picture: the tube becoming the swimmer, the
swim, the splash.

---

## Before: the fold (flow-kummer, retired)

### The fold — flow-kummer

The fifth round on the blackboard, and the first toward one run rather than
a menu of them: **`flow-kummer`**, on `/flows` after the dodecahedral space,
pinned by `/lab?sketch=flow-kummer&at=0.63`. It was built on three new kit
pieces — the data entry (`lab/log/entry.js`), the chalk fall lifted out of
flow-chalk (`lab/log/fall.js`) and the structure (`lab/log/kummer.js`) — each
with a one-beat sketch on the board (`log-entry`, `log-kummer`, listed after
the terminal's beat in `data/experiments.js`).

## The brief

The lead, after looking at the seven flows and the sketches:

> "that original the fall – chalk, with the colors appearing as you fall
> through is the correct ending (maybe with some kind of background from
> whatever you fell into it from). however, i also love the kummer surface
> ideas. and i really love that lattice/grid folding into a torus bit. the
> zoom into the dot after the title screen i actually don't love. and so far
> none of the data entry scenes have been great — we want a clean UX for data
> entry, and 'how spicy' is just a 1–10 slider, not 'name a spice'. so the
> final idea is understanding how to end on that chalk fall thing, but to
> make it look like you're going into some kind of structure to do so. the
> data entry scene definitely wants some notion of structure that ends in a
> conception/flash. i'd wonder if we form a lattice, fold it into kummer and
> zoom into a tunnel. currently all your flow demos lack a kind of conceptual
> elegance at their heart."

## The heart

ONE idea, exact, that the whole run is: **conception is the fixed point of a
fold.** The data make a lattice Λ = ℤ·1 + ℤ·τ in ℂ. The plane folds into the
torus ℂ/Λ (the loved bit: the cell's opposite sides glued, the tube, the
torus). The torus then folds in half under z ↦ −z — on the drawn torus that is
a half-turn about a skewer through it — so every point pairs with its mirror
and the pair becomes one point of the quotient, except the four points the
skewer spears, which are their own mirror: the half-points 0, ½, τ/2,
(1 + τ)/2. Those four are the nodes of the Kummer construction (the quotient
is the pillowcase, a sphere with four cone points; one dimension up it is
Kummer's quartic with sixteen) — the conception points. One of them is the
origin, which is the terminal's own full stop. A node is a cone, and a cone
from inside is a tunnel; the flash is the lens passing through it, and the
chalk fall drops down that tunnel with the structure streaming behind it,
colour arriving as you fall.

So: the terminal is a lattice (its lines), nothing zooms into the dot; the
data entry forms the lattice (the date lays the real row, the slider leans
the second period live); the lattice folds into the torus; the torus
half-turns about its skewer and folds onto itself, the four nodes lit; the
lens goes into one; the fall; the room.

## The run, beat by beat (48 s; a pure function of progress, `?at=` pins)

| s           | beat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 – 4.94    | **The terminal** (`log-dawn makeTerminal(0.8, { cmd: false })`): the caret, the sentence, the full stop lands at 4.94 on its own clock. The frame freezes a fifth of a second after.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5.3 – 8.4   | **The stop is the origin.** The dot lights into the kit's lit point (5.3–6.1); the terminal's own cells come up under the sentence (5.7–7.0: its character columns, its line rows); the sentence fades off them (6.3–7.6) and takes the character columns with it (7.0–8.2), leaving a square lattice at the LINE pitch whose rows are the lines the sentence stood on; the lens drifts so the origin sits at the centre (6.8–8.4). No zoom.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 8.5 – 12.1  | **"when were you born?"** — a date field of ten cells `DD · MM · YYYY` standing on row +2, the digits typed cell to cell (9.6–11.1, a hand's unevenness), Enter at 11.6: the row writes gold as the real axis, its eleven lattice points lit, and the rows write out from it across the board in the lattice's ink (11.7–13). The first period is set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 12.9 – 17.0 | **"how spicy?"** — a slider of ten stops that are ten lattice points on row −3, `1` and `10` marked at its ends. As it comes up the second family leans to the handle at 1 (Re τ = −½); the handle is pressed (14.3), dragged to 7 with a slight overshoot and settle (14.5–15.6), let go (15.8), Enter (16.5). The family leans with the hand, live — Re τ = (spice − 1)/9 − ½, Im τ = 1 — and the fundamental cell 0, 1, 1 + τ, τ is written round the origin as the drag begins, with its gluings (one chevron on the τ-sides, two on the 1-sides) and the other three half-points marked faintly.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 16.1        | The lattice is handed from the flow's own 2D drawing to the structure kit's (τ is settled at 7). The same ink, quantised as the kit's batches quantise it: the two frames either side differ by 0.046/255.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 17.6 – 18.8 | The questions and the answers fade off the lattice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 19 – 31     | **The structure** (`log/kummer.js`, its STAGE over 12 s): the lens lifts and comes round as the cell ROLLS into a tube (20.2–22.6, a = 0 onto a = 1); the tube BENDS into the torus (22.6–25.2), shedding the shear by Re τ so z + τ lands on z, the torus side on with its skewer across the frame; the HALF-TURN (25.7–27.6): the torus turned by π about the skewer, the four half-points lit gold as the only points it leaves where they are, six sample points riding it with a chord each to the place its mirror rests; the LID (27.6–28.6): the half above the skewer's plane swung down onto the half below; the PINCH (28.4–29.3): the rims folded onto the skewer — the pillow, a pod with the four cone points at the ends of its seams; the lens comes on to the origin's line and the CONE grows there (28.8–30), rings in log of the distance and generatrices; the DIVE (29.6–31): the distance to the apex shrinking exponentially, the rings passing at one rhythm, the light at the apex growing. |
| 31          | **THE FLASH** (`ink.js impact`), the light filling the frame from 30.5 and lingering to 31.4 so the first plate comes out of it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 31 – 42.6   | **The fall** (`log/fall.js`, flow-chalk's fall exactly, two changes): the first chalk plate hangs where the light was, at the lens's vanishing point; the lens falls plate → glass → plate through six rooms (the others cycled, the answer's last), the helix swimmer leading through the first glass or two (31.1–35.2); the STRUCTURE streams behind the plates — the cone's rings and generatrices through a lens that goes on down the axis at the fall's own zoom, D = D_flash · e^{−zoom}, one code path with the dive (`drawCone`), and the pillow's remains behind the apex fading over the first seconds (31–33.5); COLOUR ARRIVES AS YOU FALL: room k of six carries (k/5)^1.5 of its colour, chalk at the top, the answer's in full; the landing slide 40.6–42.6, the glass lit.                                                                                                                                                                                                                          |
| 42.6 – 48   | **The room**, held, swaying on its depths.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

`?decade=50s|60s|90s|10s` picks the room. `?v=quartic` (kept to look at,
not the run) swaps Kummer's quartic with its sixteen nodes in for the torus
after the turn and dives into the node furthest along the skewer.

## The kit

- **`lab/log/entry.js`** — `makeEntry()` → `{ date, slider, script }`, with
  `DEMO = { date: '14021987', spice: 7 }`, `HAND` (the hand's timings) and
  `tauOf`-compatible leans. `date.draw(ctx, view, { x, y, cell }, { typed,
caret, steady, alpha, q, enter, secs, lean })`: the question in log-orb's
  prompt type on its wiped patch, ten cells standing on a lattice row (the
  row their floor, the lattice points their corners, sheared by `lean` so
  they stay the lattice's own lines), the digits in the terminal's mono face,
  the block caret blinking on `secs` at the terminal's rate, Enter writing
  the row gold and lighting the points. `slider.draw(…, { value, held,
alpha, q, enter })`: a track from stop 1 to stop 10, the handle a lit disc
  at `value` (fractional while dragged), held it grows and rings the stop
  under it. `script(t, { q1, type1, e1, q2, drag2, e2 })` is the demo's hand
  — a seeded keystroke table, the drag with its overshoot — but `draw` takes
  any state, so the site can drive it from a keyboard and a pointer later.
  Exact: the cells' and the stops' places on the lattice, the shear, the
  settle to the integer. A picture: the type sizes, the radii, the glow.
- **`lab/log/fall.js`** — `makeFall({ art, order, beats })` → `{ geometry,
draw }`, flow-chalk's fall lifted whole (flow-chalk calls it and is pixel
  identical to before, six pins at 0.000/255). `draw(ctx, w, h, t, {
background, colourAlong, dust })` draws a frame and returns the lens
  (`ox, oy` its vanishing point, `land`); `background(ctx, cam, zoom,
alpha)` is called first, under the plates, with the e-folds flown.
  `colourAlong: true` is the new behaviour — each room's share baked once
  into a composite at the mip the frame picks, so it costs what the flood
  does. Exact: the similarities, the pinhole projection of every layer. A
  picture: the nest and the sway.
- **`lab/log/kummer.js`** — the structure: `tauOf`, `HALF`, `pair` (the
  mirror −z mod Λ), `fold(tau, roll, bend)`, `torusOf`, `turnAbout`, `lid`,
  `pinch`, `placer`, `cone`, `STAGE`, `paramsAt(u)`, `geometry(tau, { w, h,
cellPx, origin })`, `cameraAt(u, G)`, `makeStructure({ tau, variant })`
  with `draw(ctx, w, h, P)`, and `drawCone`. Checked in node to 1e−13: the
  four half-points through the fold are the closed-form nodes on the skewer;
  for 2000 random z, fold(−z) = turnAbout(fold(z), π) — the involution IS
  the rotation by π about the skewer (which is why the roll closes under
  Re = ¾: with any other closing line z ↦ −z is no rigid motion of the
  embedded torus); the gluings land; the pinch sends both rims to the
  skewer; the cone's rings sit where the equation puts them; the dive's
  distance only shrinks and its log-rate only grows. A picture: the
  embedding (a flat torus has none in ℝ³; the tube is stretched for a hole),
  the lid tearing the rims onto their mirrors (the quotient map is 2-to-1 —
  no motion in space does it without passing through itself), the cone's
  drawing and its axis, the camera path, the chords.
- **`log-dawn.js makeTerminal`** now also gives `stop` (the second the full
  stop lands) and `layout(ctx, w, h)` (the type size, the line pitch, a
  character's advance, the lines, the stop's spot), for a flow that takes the
  picture over from the stop instead of zooming into it.

## What the flow does itself

The lattice by hand from the stop to the handover (`lattice2d`): the
terminal's cells, the rows written out from the date's row, the leaning
family, the points, the cell — in the kit's quantised ink (`INK`), so the
switch to the kit at 16.1 is one drawing. The terminal's last frame cached
and faded (it is a pure function of its time, so it is drawn once). The pitch
is the terminal's line pitch (41.5 px at 1280 × 800; the type at 0.8 is 23 px,
its character advance 0.58 em, so the line pitch is 3.1 character columns —
not 3, which is why the character columns go rather than thin out). The
flash's attack, the light filling the frame (flow-chalk's), and the fall's
background: the continued lens and the pillow's remains.

## Frame cost (headless 1280 × 800, the raster forced, median ms)

The terminal 1; the entry 3–6; the structure 3.5–5 (the roll to the pinch),
10 at the cone, 13 at the end of the dive; the fall 18 at 31.2 s (the light,
the first plate, the remains and the cone together; p90 27), 13–14 over the
first rooms, 7 from the fourth room to the landing and the held room. Worst
median 18 ms, under the 25 ms budget.

## Best pins

0.135 (the cells under the sentence), 0.25 (Enter on the date), 0.315 (the
drag, the family leaning), 0.36 (Enter on the slider), 0.44 (the roll),
0.49 (the bend), 0.54 (the torus with its skewer), 0.605 (the pillow),
0.63 (the cone), 0.643 (the dive's last frame), 0.67 (the first plate with
the remains behind), 0.75 (colour arriving), 0.9 (landed).

## Doubtful, for the lead

- The rate of zoom steps at the flash: the dive arrives at about ten e-folds
  a second (its log-rate only grows, which is what a flash wants) and the
  fall opens at 0.2 e-folds a second and gathers (flow-chalk's pace law,
  kept exactly). Scale and vanishing point are continuous and the flash
  covers the step; a run that only gathers speed would need the fall to open
  fast, which is not flow-chalk's fall.
- "The lens eases back" is read as the drift of the origin to the centre; a
  zoom out would shrink the type the entry is set in.
- The slider's ten stops are lattice points, so its track is centred half a
  cell left of the date (the entry kit's note).
- The structure's twelve seconds: the lid and the pinch are 1.7 s between
  them; the lead may prefer the pinch alone (two separate parameters).

## Not looked at

Portrait and a phone (the lattice's pitch is the terminal's line pitch, 14 px
on a narrow screen, too fine for the entry's type). The real run's data
entry from a keyboard and a pointer (the kit draws any state; nothing drives
it yet). Only the 1990s room, as the demo's date lands there. The flow was
pinned, not watched end to end, on the software raster here.
