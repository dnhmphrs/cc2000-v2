# The flow, as it stands

![the flow](./v4-flow.jpg)

Two halves, both shot headless and both pinned with `?at=` — every scene is a
pure function of its own progress, so each frame is the frame the run would
have drawn at that moment rather than a timed guess at it.

**1 — the run today.** Four scenes, thirty seconds, on `WebGLRenderer` and the
shaders the site has always had: the fly-in, the conception, the computation
and the room. Shot on the WebGL lane at `?seed=1`, so the decade-to-pane
assignment and the motes fall the same way on every load. This is the picture
the rebuild has to beat rather than break.

**2 — the rebuild, roughed in.** The five new beats end to end at `/v4`, 55
seconds on one WebGPU renderer, each at its own sketch's length:

| beat       | seconds | sketch            |                                                                                       |
| ---------- | ------- | ----------------- | ------------------------------------------------------------------------------------- |
| approach   | 9       | `lab/approach.js` | space; the swimmer, and the archive adrift around it                                  |
| descent    | 14      | `lab/rooms.js`    | rooms through rooms, decade after decade, the swimmer down the axis                   |
| conception | 12      | `lab/impact.js`   | a beam strikes the sphere — the pole — and the zeros of ζ ring out as the log p rings |
| lattice    | 9       | `lab/lattice.js`  | every integer a point at (a log 2, b log 3, c log 5); the lens closes on one cell     |
| bloom      | 11      | `lab/cube.js`     | the cell is a cube, and the cube opens on an isometric bedroom                        |

Of the four sketches the last cut was made from, only the descent stayed in
the cut (the E8 expansion is kept on the side, refined, at `/lab?sketch=e8`),
and it was remade: it cycles through the decades now, with exact crossings at every
glass, and the swimmer swims down the middle of it. The conception and the
bloom are new sketches under the same names; the approach and the lattice are
the two beats the brief asked to workshop — the one before the descent, which
has to feature the swimmer, and the wildcard. The cuts between the five are
hard: the swimmer speeding up into the beam, and the lattice's cell being the
cube, are joins for later. The fly-in is not in it: it stays on the old
renderer until the Stage swap, and the approach is what would replace it.

## Reproducing the page

    npm run dev
    BASE=http://localhost:3000 OUT=<dir> \
      PLAN='[["2",[0,0.35,0.7,1]],["3",[0,0.3,0.6,1]],["4",[0,0.2,0.45,0.7,1]],["5",[0]]]' \
      node scripts/shots.mjs

for the top half, and the same `?at=` pins against `/v4` on the WebGPU lane
(`LANE=webgpu`, `scripts/lane.mjs`) for the bottom — `?at=` there is a fraction
of the whole 55 s, so 0.44 is 1.2 s into the conception. The page itself was
composed in the scratchpad — it is a picture of the work, not part of the
build.
