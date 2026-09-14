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

**2 — the rebuild, roughed in.** The four new beats end to end at `/v4`, 35.5
seconds on one WebGPU renderer, at the lengths the plan gives them:

| beat       | seconds |                                                 |
| ---------- | ------- | ----------------------------------------------- |
| conception | 9.0     | the ovum burns and settles onto the invariant   |
| expansion  | 8.0     | the icosahedron expands out to E8 and the wheel |
| descent    | 7.0     | rooms through rooms                             |
| bloom      | 11.5    | the flower opens on the ending                  |

The cuts between those four are hard. The one-shot seams — the fly-in into the
conception, the push into the first room, the bud in the deepest glass — are
the scene PRs' work; this exists to look at the shape and the weight. The
fly-in is not in it: the brief keeps it as it is, and it stays on the old
renderer until the Stage swap.

Weight, which is what the brief asked to move: the reveal is 18.5 s of 49 s in
the plan's full run, against 1.5 s of 30.7 s today. The fly-in goes from 44%
of the run to 28%.

## Reproducing the page

    npm run dev
    BASE=http://localhost:3000 OUT=<dir> \
      PLAN='[["2",[0,0.35,0.7,1]],["3",[0,0.3,0.6,1]],["4",[0,0.2,0.45,0.7,1]],["5",[0]]]' \
      node scripts/shots.mjs

for the top half, and the same `?at=` pins against `/v4` on the WebGPU lane
(`LANE=webgpu`, `scripts/lane.mjs`) for the bottom. The page itself was
composed in the scratchpad — it is a picture of the work, not part of the
build.
