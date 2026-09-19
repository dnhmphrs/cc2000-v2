# The flow, as it stands

![the flow](./v4-flow.jpg)

Three sections, all shot headless and all pinned with `?at=` — every scene is a
pure function of its own progress, so each frame is the frame the run would
have drawn at that moment rather than a timed guess at it.

**1 — the run, as it now is.** What `/` does on `dev`: a title card over an
approach that is already flying; the swimmer ahead of the lens, from behind, the
archive adrift and passing, the two questions asked on the way and the flight
held while they are; the portal dead ahead, whose glass holds the first room;
the descent through the decades, one room inside the next, down to the answer's
room; the swimmer going into its screen and the screen going white; the readout
in that glass; and "go again" flying home through it into the next flight. One
WebGPU renderer, and one shot from the flight into the fall — the approach ends
on the frame the descent opens on. Frames on the WebGL lane at `?seed=1`, so the
decades and the archive fall the same way on every load.

| scene    | seconds | where                                               |
| -------- | ------- | --------------------------------------------------- |
| approach | 12      | `three/world/approach.js`, held at the two asks     |
| descent  | 14      | `three/world/descent.js` over `three/world/nest.js` |
| room     | —       | `scenes/Room.svelte`, until "go again"              |

**2 — the lab cut it was made from.** The five sketches chained at `/v4`,
55 s, from the round before: the approach and the descent were the two that were
bought, and are what the run above is built from; the conception, the lattice
and the bloom stay in the lab.

**3 — on the side.** The E8 expansion, kept and refined at `/lab?sketch=e8`
though not in the cut.

## Reproducing the page

    npm run dev
    BASE=http://localhost:3000 OUT=<dir> \
      PLAN='[["2",[0.02,0.25,0.5,0.72,0.9,1]],["3",[0.12,0.3,0.5,0.7,0.9,1]]]' \
      node scripts/shots.mjs

for the run (`2` approach, `3` descent — the shots tool waits for the stage's
warm-up and presses the key); the room and the way home are a real run driven
the way `scripts/verify.mjs` drives it. The second section is the same `?at=`
pins against `/v4` on the WebGPU lane (`LANE=webgpu`, `scripts/lane.mjs`), the
third against `/lab?sketch=e8`. The page itself was composed in the scratchpad —
it is a picture of the work, not part of the build.
