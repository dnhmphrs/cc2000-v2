# The flow, as it stands

![the flow](./v4-flow.jpg)

Three sections, all shot headless and all pinned with `?at=` — every scene is a
pure function of its own progress, so each frame is the frame the run would
have drawn at that moment rather than a timed guess at it.

**1 — the run, as it now is.** What `/` does on `main`, in the cut being
proposed: a title card over an approach held at zero, black; the card lifts,
the sky comes up, the swimmer fades in where it rides, ahead of the lens and
seen from behind, and the birthday is asked there, over the swimmer alone;
nothing else flies by, for either question — the spice is asked a third of the
way in over the same empty sky — and only when the second answer is in does
anything appear ahead: a point of light, then a set coming out of the dark,
dark, until it switches on with a CRT hairline that opens onto the tunnel
inside its glass; through the glass and down the tunnel, where the archive is
looped — rings of eight of the same drawing, mirrored, turning, the hue cycling
as the pattern repeats — until the search STOPS: the turn and the hue
decelerate to rest, the hue on true colour, the speed to nil, the machine
types "bedroom located.", and the frame is the portal with the found room
inside it, still; the fall drops from that rest through the decades, one room
inside the next, at one pace on screen, the turn coming in from rest and going
out before the answer's room, which lands level; the swimmer going into its
screen and the screen going white; the readout in that glass; and "go again"
— the readout gone, the camera from rest into the glass in a second and a
half, black — which is the black the next flight opens on. One WebGPU
renderer, and one shot from the flight through the screen into the fall: each
scene ends on the frame the next opens on. The other cuts are on the same
build by URL (`config/variants.js`): the search handing straight over at one
pace as before (`?beat=flow`), or switching off through black and back on
(`?beat=black`); a few dead sets after the first answer (`?flight=few`); the
set lighting without the hairline (`?on=fade`); the typed conception date, or
no line (`?cap=date`, `?cap=none`); the stop's length (`?rest=`). Frames on the
WebGL lane at `?seed=1`, so the decades fall the same way on every load.

| scene    | seconds | where                                                                   |
| -------- | ------- | ----------------------------------------------------------------------- |
| approach | 15      | `three/world/approach.js`, held at the two asks                         |
| kaleido  | 7       | `three/world/kaleido.js` over `three/world/kaleidoscope.js`             |
| descent  | 10.4    | `three/world/descent.js` over `three/world/nest.js`, 9 s of it the fall |
| room     | —       | `scenes/Room.svelte`, until "go again"                                  |

**2 — the lab cut it was made from.** The five sketches chained at `/v4`,
55 s, from the round before: the approach and the descent were the two that were
bought, and are what the run above is built from; the conception, the lattice
and the bloom stay in the lab.

**3 — on the side.** The E8 expansion, kept and refined at `/lab?sketch=e8`
though not in the cut.

## Reproducing the page

    npm run dev
    BASE=http://localhost:3000 OUT=<dir> \
      PLAN='[["2",[0.02,0.06,0.12,0.3,0.6,0.85,1]],["3",[0.12,0.3,0.5,0.7,0.9,1]]]' \
      node scripts/shots.mjs

for the run (`2` approach, `3` descent — the shots tool waits for the stage's
warm-up and presses the key); the room and the way home are a real run driven
the way `scripts/verify.mjs` drives it. The second section is the same `?at=`
pins against `/v4` on the WebGPU lane (`LANE=webgpu`, `scripts/lane.mjs`), the
third against `/lab?sketch=e8`. The page itself was composed in the scratchpad —
it is a picture of the work, not part of the build.
