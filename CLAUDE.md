# Working agreements

## Demos and PRs go to `main`

`main` is the site. Work happens on `dev` — push there as it is made, it is
the working branch and nobody else's — and **when a round is finished, open a
PR from `dev` to `main` without being asked**: that ask has been made once,
standing, and it covers every round from here on. Do not start branches for
the sake of it; `dev` only moves forward. The demo to look at is `main`'s
deployment once the PR is in, and `dev`'s preview before that.

The top left corner of every page says which build it is: `package.json`'s
version and the commit it was built from (`components/Version.svelte`,
`vite.config.js`). **Bump the version in `package.json` with every PR to
`main`** — the minor number for a round — so the lead can tell one deploy from
the one before at a glance.

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
ERRORS only — a GL warning (a framebuffer the backend could not blit, say, or
a texture wider than the GPU's limit, 8192 here, which uploads nothing) leaves
a frame flat with no error at all, so a frame that is only ground, or grooves
that are only circles, is worth a probe that reads warnings too. `QUERY='edge=past'` puts an extra
query on every pin: `?edge=past|future` seeds a birthday the archive cannot
answer for instead of a real answer (`?edge=unknown` the third verdict,
the servers overheating), so key 4 pins the swim down that verdict's gif
tunnel to its stop rather than the search.

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
record, into that record at the far end: a FUNNEL that takes the wall's
grooves on down to its spindle hole, coming out of the dark late, from its rim
inward, the throat darkest — the hole a monitor's size and the glass the first
room is seen through, so the fall's first crossing is every crossing — or, on a
birthday the archive cannot answer for, a tunnel made of the verdict's gif, in
the site's gold, that the lens slows to a stop in while the swimmer swims on
and fades, the verdict typed over it) and the **descent** (`descent.js` — rooms
through rooms, gathering pace from where the tunnel left it, down to the
answer's room and the splosh on its screen). The first two walk the same **kaleidoscope**
(`kaleidoscope.js` — the set, the rings, the wall, the camera down the tunnel,
where the nest goes, and the CRT mask), the last two the same **nest**
(`nest.js` — the rooms, the stencil chain, the depth fade that keeps the first
room out of sight until the search ends, the camera pose and the glass rect),
and the nest's stencil chain sits one level up from the set's. The fall's
world is `NEST.scale` (7) times the rooms' own units, so the lens meets the
record's hole at the seam far enough out for the tunnel to hand over no slower
than it took the flight. Every groove in the run is a spiral cut with the
critical line: the wall's wobbles by `|ζ(½ + it)|`, pinching at every zero
(`functions/zeta.js` the table, `three/tsl/zeta.js` the groove distance); the
record's by the line as the primes write it, `Σ cos(t log p)/p`
(`primeGrooveTexture`, baked a turn of the spiral to a row), swinging twice
the pitch so the turns cross and weave — kept clear of each other they read as
circles down the funnel's axis. Their numbers are in `KALEIDO.wall` and
`NEST.disc`. A FUNNEL of grooves between every room in the fall is built and
OFF (`NEST.funnel.on`): the lead looked at it and took it out. The rooms' back
walls are drawn well past their frames with the wallpaper LOOPED (mirrored
repeat), so nothing of the room outside shows through a room's gaps
(`NEST.wallCover`). All three are shot on
the run's ONE lens (`LENS`) with the run's ONE hand on the camera
(`three/world/wobble.js`, a slow pan, tilt and roll on `runSeconds`, the run's
own clock), and the run only ever GATHERS speed until it lands: the flight
ramps up to `SCENES.approach.accel` times its opening speed, the tunnel on from
there to the fall's opening speed over the whole of its length, the fall's
zoom on up by `SCENES.descent.accel` before it eases to land — and the
swimmer's roll with them (`nest.swimmer.roll`, stepped by each scene at its
pace). No dolly, no stop and no restart anywhere, so nothing about the camera
changes at a seam; `?at=` pins still hold, since each scene's pace is a
function of its progress. The raster and the tube are CSS over the
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
draw whose frame is counted off the run's clock, `three/tsl/clock.js`); the
lens slows to a stop inside it (`SCENES.kaleido.stop`) while the swimmer
keeps the pace and pulls away, fading (`swimOff`), and the verdict is typed
over that frame on the site's yellow, the gif still playing. The gif is laid
in the site's gold (`KALEIDO.gif`, ramped on its light as it LOOKS — ramped
linear, mid-greys came out olive) and the wall holds gold on that run rather
than cycling. Only the route's own error page,
with no 3D under it, tiles the gif across the page
(`components/error/Tiles.svelte`). A gif cannot be a texture, so every gif in
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
  so `edge` is set — `past`, `future` or `unknown`, the original site's three
  verdicts (`functions/answer.js`) — the flight goes in regardless, down that
  verdict's gif tunnel, stops in it (`kaleido.js`), and
  `director.advance('kaleido')` hands to the `error` scene, whose `ErrorScreen`
  types the verdict over the stopped tunnel and whose way back is
  `director.recover()` — not a cut: the lens swims on down the tunnel from
  where it stopped into its dark (`kaleido.js stepReturn`,
  `SCENES.kaleido.home`), and the next flight opens on that black as it does
  after the room. The set is ALWAYS turning, gently: it fades in leaned the
  other way and already turning (`SCENES.approach.turnFrom` of the tunnel's
  opening rate), gathering to reach the seam upright at the tunnel's own rate,
  and the tunnel opens at that rate (`SCENES.kaleido.turnSeam`) and ramps up
  (`turnRamp`, `kaleidoscope.turnOf`), so the turn has no start to see. The set is
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
