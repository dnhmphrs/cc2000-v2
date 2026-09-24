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
`ask` comes back with a dialog across it. `QUERY='edge=past'` puts an extra
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
the swimmer ahead of the lens from behind, coming about side-on to take the two
questions, then the 60s set dead ahead, lit where the swimmer's nose touches
its glass), the **kaleido** (`kaleido.js` — through that set's glass and down
the tunnel inside it, the archive looped in rings, turning and cycling in
colour, to the first room at the far end, come out of the dark as the label of
a gold record — or, on a birthday the archive cannot answer for, the breakdown:
the set switching off, and the verdict screen after it) and the **descent** (`descent.js` — rooms through
rooms, at the pace the tunnel eased to, down to the answer's room and the
splosh on its screen). The first two walk the same **kaleidoscope**
(`kaleidoscope.js` — the set, the rings, the camera down the tunnel, where the
nest goes, and the CRT mask), the last two the same **nest** (`nest.js` — the
rooms, the stencil chain, the depth fade that keeps the first room out of
sight until the search ends, the camera pose and the glass rect), and the
nest's stencil chain sits one level up from the set's. All three are shot on
the run's ONE lens (`LENS`) with the run's ONE hand on the camera
(`three/world/wobble.js`, a slow pan, tilt and roll on `runSeconds`, the run's
own clock), and the tunnel eases from the flight's speed to the fall's over
the whole of its length: no dolly, no stop and no restart anywhere, so nothing
about the camera changes at a seam. `scenes/FlyIn|Conception|Computation.svelte`, `three/world/{tunnel,egg,lattice}.js`,
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
goes on rolling and the scene waits rather than freezing. Holding `t` rather
than running a second clock is what keeps every frame a pure function of
progress.

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
  filled the frame. Under the lens the glass goes to a RECORD (`nest.js`, on the
  last room's glass), the spindle hole takes the frame, and the black in it is
  the space the next flight opens on — which is told it came that way
  (`nest.viaRecord`) so the record's last grooves can go on past the lens as the
  sky comes up. There is nothing to cover the cut with because there is no cut
  to see.
- **The first frame is warmed up.** The Stage renders every object a few at a
  time before the loop starts, yielding to the page between, so the title card
  (which types on the clock, not on timers) keeps its rhythm on a slow GPU.
  `window.__stage` appears when that is done — the shots tool waits for it.
