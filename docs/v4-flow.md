# The flow, as it stands

![the flow](./v4-flow.jpg)

Three sections, all shot headless and all pinned with `?at=` — every scene is a
pure function of its own progress, so each frame is the frame the run would
have drawn at that moment rather than a timed guess at it.

**1 — the run, as it now is.** What `/` does on `main`, one cut: a title card
over an approach held at zero, black; the card lifts, the sky comes up, the
swimmer fades in where it rides, ahead of the lens and seen from behind, and
both questions are asked there, one straight after the other, over the swimmer
alone — no swimming between them, and nothing else flies by; only once the
answers are in does anything appear ahead: a point of light, then the set
coming out of the dark, dark — always the 60s television — until it switches
on with a CRT hairline that opens onto the tunnel inside its glass; through the
glass and down the tunnel, where the archive is looped — rings of eight of the
same drawing, mirrored, turning, the hue cycling as the pattern repeats — with
no exit in sight, the tunnel easing from the flight's speed to the fall's the
whole way down, until the search ENDS: the turn and the hue decelerate to
rest, the hue on true colour, and a room comes out of the dark at the far end
— the whole room, not a set — and fills the frame; the fall carries straight
on through the decades, one room inside the next, at one pace on screen, the
turn coming in from rest and going out before the answer's room, which lands
level; the swimmer going into its screen and the
screen going white; the readout in that glass; and "go again" — the readout
gone, the camera from rest into the glass in a second and a half, black —
which is the black the next flight opens on. A birthday the archive cannot
answer for is not refused in the popup: the flight goes in regardless and the
tunnel breaks down on it — overloads, collapses to a line, a dot, black, the
swimmer alone in it — and the verdict comes up, its gif and its line (too old
for the archive, or too young), and "calculate again" is the flight again with
the answers kept. One WebGPU renderer, and one shot from the flight through the
set into the fall: each scene ends on the frame the next opens on, and the
camera is one camera throughout — one lens, one slow hand on it, no dolly, no
stop, no restart. Frames on the WebGL lane at `?seed=1`, so the decades fall
the same way on every load.

| scene    | seconds | where                                                                          |
| -------- | ------- | ------------------------------------------------------------------------------ |
| approach | 7       | `three/world/approach.js`, held at the ask                                     |
| kaleido  | 7       | `three/world/kaleido.js` over `three/world/kaleidoscope.js` — or the breakdown |
| descent  | 9       | `three/world/descent.js` over `three/world/nest.js`                            |
| room     | —       | `scenes/Room.svelte`, until "go again"                                         |
| verdict  | —       | `components/error/ErrorScreen.svelte`, until "calculate again"                 |

**2 — the lab cut it was made from.** The five sketches chained at `/v4`,
55 s, from the round before: the approach and the descent were the two that were
bought, and are what the run above is built from; the conception, the lattice
and the bloom stay in the lab.

**3 — on the side.** The E8 expansion, kept and refined at `/lab?sketch=e8`
though not in the cut.

## Reproducing the page

    npm run dev
    BASE=http://localhost:3000 OUT=<dir> \
      PLAN='[["2",[0.03,0.12,0.25,0.5,0.75,0.9,1]],["4",[0.3,0.6,0.85,1]],["3",[0.05,0.3,0.7,1]]]' \
      node scripts/shots.mjs
    QUERY='edge=past' PLAN='[["4",[0.6,0.85,0.92]]]' BASE=... OUT=<dir2> node scripts/shots.mjs

for the run (`2` approach, `4` kaleido, `3` descent — the shots tool waits for
the stage's warm-up and presses the key; `?edge=past` seeds a birthday with no
answer, so `4` pins the breakdown); the popups, the room, the way home and the
verdicts are a real run driven the way `scripts/verify.mjs` drives it. The
second section is the same `?at=` pins against `/v4` on the WebGPU lane
(`LANE=webgpu`, `scripts/lane.mjs`), the third against `/lab?sketch=e8`. The
page itself was composed in the scratchpad — it is a picture of the work, not
part of the build.
