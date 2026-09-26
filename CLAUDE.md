# Working agreements

## Demos and PRs go to `main`

`main` is the site. Work happens on `dev` — push there as it is made, it is
the working branch and nobody else's — and **when a round is finished, open a
PR from `dev` to `main` without being asked**: that ask has been made once,
standing, and it covers every round from here on. Do not start branches for
the sake of it; `dev` only moves forward. The demo to look at is `main`'s
deployment once the PR is in, and `dev`'s preview before that.

## Do not push unverified work

The rule above is only safe because of this one. Before pushing:

    npm run lint
    npm run build
    BASE=http://localhost:<port> node scripts/verify.mjs

`npm run dev` picks whatever port is free — read it out of the dev log rather
than assuming 5173.

## Look at the thing before claiming it works

Every 3D scene is a pure function of its progress, so `?at=0.42` pins it exactly
and `scripts/shots.mjs` turns that into a contact sheet:

    PLAN='[["3",[0.06,0.3,1]],["4",[0]]]' BASE=... OUT=... node scripts/shots.mjs

Both scripts take `LANE=webgl|webgpu` (`scripts/lane.mjs`). `webgl` is the
Chromium the sandbox ships and the flags the baseline sheets were shot with;
`webgpu` is Chrome-for-Testing 153 on SwiftShader Vulkan, fetched once by
`scripts/browser.mjs` into `~/.cache/cc2000/browsers`, and it is the only lane
on which a WebGPU device exists — under the old flags `WebGPURenderer` takes
its WebGL 2 backend without saying so. Every frame is shot with `?seed=1`, so
the panes and the motes fall the same way on every load; a sheet that differs
from another sheet of the same beat is a change, not the shuffle.

Scene keys are the dev harness's own: `2` approach, `4` kaleido, `3` descent,
`5` room.
`1` restarts the run from the title card. They are bound BY NAME in Dev.svelte
rather than by position in `ORDER`, so a scene coming or going cannot slide a
key and silently repoint every PLAN in this file and in `verify.mjs`.

A `?at=` pin suppresses the two mid-flight popups, or every contact sheet past
`ask` comes back with a dialog across it. The shots tool reports console
ERRORS only — a GL warning (a framebuffer the backend could not blit, say)
leaves a frame flat with no error at all, so a frame that is only ground is
worth a probe that reads warnings too. `QUERY='edge=past'` puts an extra
query on every pin: `?edge=past|future` seeds a birthday the archive cannot
answer for instead of a real answer, so key 4 pins the breakdown (the set
switching off) rather than the search.

Two traps that have already cost a round each:

- **A seek is not a run.** Jumping into a scene runs `lattice.reset()` first, so
  anything a scene inherits from the one before it — rather than setting from its
  own progress — is absent in a seeked frame and present in a real run. If a
  screenshot is the evidence for a claim, check the claim survives BOTH.
- **The three 3D scenes are one shot.** approach at 1 and kaleido at 0 must be
  the same picture — both are `kaleidoscope.pose(0)` — and so must kaleido at 1
  and descent at 0 — both `nest.pose(0)`. Diff them pixel-wise rather than
  eyeballing, with `?sperm=0` on both (the swimmer's roll is on real time, so
  it is the one thing two loads never agree on) and reached by the SAME path
  (key 2 then 4 for the kaleido, 2, 4 then 3 for the descent, so the seeded
  screen and rooms match); a mean delta under 0.02/255 is what it measures
  today, anything past 1 is a real seam.

Write scratch scripts and screenshots to the scratchpad, never into `scripts/`.
A script living there cannot resolve the project's `node_modules`, so import by
absolute path: `from '/home/user/cc2000-v2/node_modules/playwright/index.mjs'`.

## This build has no machine, and three scenes

The run is `three/Stage.svelte` on ONE `WebGPURenderer` (WebGL 2 behind it
where there is no WebGPU; `?gl=1` forces it), and three 3D scenes that are
plain modules under `three/world/`: the **approach** (`approach.js` — space,
the swimmer ahead of the lens from behind, the two questions asked under it as
it rides, then the 60s set dead ahead, lit at its centre as the swimmer's nose
reaches its glass), the **kaleido** (`kaleido.js` — through that set's glass and down
the tunnel inside it, the archive looped in rings, turning and cycling in
colour, round a WALL of gold ζ grooves that makes the tunnel the inside of a
record, to the first room at the far end, come out of the dark as the label of
that record — or, on a birthday the archive cannot answer for, the breakdown:
the set switching off, and the verdict screen after it) and the **descent** (`descent.js` — rooms
through rooms, at the pace the tunnel eased to, down to the answer's room and
the splosh on its screen). The first two walk the same **kaleidoscope**
(`kaleidoscope.js` — the set, the rings, the wall, the camera down the tunnel,
where the nest goes, and the CRT mask), the last two the same **nest**
(`nest.js` — the rooms, the stencil chain, the depth fade that keeps the first
room out of sight until the search ends, the camera pose and the glass rect),
and the nest's stencil chain sits one level up from the set's. Every groove in
the run is cut with `|ζ(½ + it)|` (`functions/zeta.js` the table,
`three/tsl/zeta.js` the groove distance): a spiral whose radius wobbles by it,
pinching at every zero — the disc and the wall, with their numbers in
`NEST.disc` and `KALEIDO.wall`. A FUNNEL
of the same grooves between every room in the fall is built and OFF
(`NEST.funnel.on`): the lead looked at it and took it out. The rooms' back
walls are drawn well past their frames with the wallpaper LOOPED (mirrored
repeat), so nothing of the room outside shows through a room's gaps
(`NEST.wallCover`). All three are shot on
the run's ONE lens (`LENS`) with the run's ONE hand on the camera
(`three/world/wobble.js`, a slow pan, tilt and roll on `runSeconds`, the run's
own clock), and the tunnel eases from the flight's speed to the fall's over
the whole of its length: no dolly, no stop and no restart anywhere, so nothing
about the camera changes at a seam. The raster and the tube are CSS over the
page (`components/Glass.svelte`); there was a post-process CRT pass under
them for one round and the lead took it out. The tunnel's archive is ONE
instanced draw: the twenty drawings go into one ATLAS at start
(`kaleidoscope.js`, keys across and decades down, `KALEIDO.atlas`), and every
one of the 384 quads is an instance carrying its drawing's rectangle, laid
far to near, which is the painter's order alpha-over needs and which 384
meshes on twenty materials would not keep. The rooms' OBJECTS are tiled as
the wallpaper is (`NEST.tiles`): poster, clock, screen, desk and bed repeat
mirrored round every room, one instanced draw per layer, so a gap in a
room's frame shows the room next door — a tesseract of rooms; only the real
glass opens onto the next room. A run the archive cannot answer for goes
down a tunnel made of the VERDICT'S GIF instead of the drawings
(`kaleidoscope.js setArchive`, the moment `edge` is known, a second instanced
draw whose frame is counted off the run's clock, `three/tsl/clock.js`), and
the verdict is read over that gif tiled across the whole frame
(`components/error/Tiles.svelte`); a gif cannot be a texture, so every gif in
`static/gifs` is baked into a sheet of its frames beside it by
`node scripts/gifs.mjs`, which also writes `data/gifs.js`, how each sheet is
cut — rerun it when a gif changes.
`scenes/FlyIn|Conception|Computation.svelte`, `three/world/{tunnel,egg,lattice}.js`,
`three/shaders/` and `components/Background.svelte` are the WebGL run they
replaced, still playable at `/v2` on its own Stage (`three/StageV2.svelte`,
`routes/v2/`): the same card, popups, room and director, switched to that run's
scene names by `director.setRun('v2')`. `ROUTE=/v2 node scripts/verify.mjs`
smoke-tests it. `Calculator.svelte` is imported by nothing.

The run opens on a title card (`scenes/Prelude.svelte`) over an approach that
is ALREADY MOUNTED and held at progress zero — black over black — and the two
answers the machine used to take are taken mid-flight by popups
(`components/Prompt.svelte`).

The one thing holding all of that together is the `gate` store: while it is
non-null the approach holds `t` and keeps advancing `elapsed`, so the swimmer
goes on rolling and the scene waits rather than freezing — and the debris goes
on streaming past at the flight's speed, its queue advanced by the hold's own
distance while its slab stays on the lens (`tsl/motes.js uDrift`), so the wait
looks like the flight. Holding `t` rather than running a second clock is what
keeps every frame a pure function of progress.

Three consequences worth remembering:

- **The answer resolves mid-flight**, not before it. The two popups come one
  straight after the other: the birthday is probed when the first closes and
  the archive is asked properly when the second does. An out-of-range date is
  NOT refused — there is no machine to report it on and no room to fall into —
  so `edge` is set, the flight goes in regardless, the tunnel breaks down on it
  (`kaleido.js`: overload, collapse to a line, a dot, black) and
  `director.advance('kaleido')` hands to the `error` scene, whose `ErrorScreen`
  shows the verdict and whose way back is `director.recover()`. The set is
  always the 60s one; the nest's first room is chosen when the run starts; the
  deeper rooms are set the moment the answer is in, while they are too small to
  see (`approach.js finalise()`).
- **The loop home has no DOM half.** The camera flies through the room's monitor
  and `descent.js stepReturn()` hands the run to the approach when the glass has
  filled the frame — three seconds of it (`SCENES.descent.home`), to be watched.
  The room goes to black under the glass as it takes the frame, and that black
  is the space the next flight opens on: no card, the sky coming up over it.
  (There was a record in the glass, turning, and its grooves ran on into the
  next flight; the lead looked at the loop twice and took both out.) There is
  nothing to cover the cut with because there is no cut to see. The page under
  the canvas is the same blue-black the scenes paint (`app.html`, `styles.css
--bg`), so the first paint and the first frame are one colour.
- **The first frame is warmed up.** The Stage renders every object a few at a
  time before the loop starts, yielding to the page between, so the title card
  (which types on the clock, not on timers) keeps its rhythm on a slow GPU.
  `window.__stage` appears when that is done — the shots tool waits for it.
