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

## Two sites from one repo: `main` is the run alone, `dev` is everything

The site is the run and nothing else — the lead: one scene, no v2, no v3,
no lab, no archive, no switch, "nothing in the top left hand corner other
than a small version label", and a clean, fast, reliable load. The dev site
keeps everything, so the variants and the archive go on being registered and
looked at. One repo, one branch flow, decided AT BUILD TIME
(`vite.config.js`, baked in as `__SITE__`; `src/lib/site.js` reads it):
`SITE=main` or `SITE=dev` in the environment, else Vercel's own — a
Production deploy (the `main` branch) is `main`, a Preview (`dev`'s) is
`dev` — else `dev`. On `main`: `/` is the run (`routes/+page.js` loads
`runs/Next.svelte` with `only`, which ignores `?v=`), every other path is a
404 at the server (`src/hooks.server.js`) and at the route (`gate()` in
every other `+page.js`; `/v2`, `/v3` and `/eva` are not prerendered there),
the layout shows `components/Build.svelte` (the label) instead of the
corner's switch and no lab bar, and the shell's `<html data-site="main">`
(written by the hook, read by `app.html`'s inline script) makes the first
paint THE RUN'S OWN GROUND — the board's dark through the lens, rgb(27, 25,
23), `#1b1917` — so nothing changes colour when the lens's first frame
lands. THE LOAD IS ONE DARK: the run clears the board to its ground and
HIDES it (no chalk dust, no tag) while the rooms load and the lens is
built, shows the lens's canvas only after its first frame, and the lens's
light leak is off (`look.leak 0`) — the "many layers of different noise
effects turning on" were the board's dust, then the lens's grain, then its
leak, each coming on in turn. On `dev`: `/` is v3 as before,
`/v2`, `/next` with every variant, the lab, the reels, the index, the
switch. To build and check the main site locally:

    SITE=main npm run build && npx vite preview --port 4175
    BASE=http://localhost:4175 node scripts/verify-main.mjs

`scripts/verify.mjs` (the dev lanes) stays what it was; both are run before
a push. If Vercel's system variables are not exposed to the build, set
`SITE=main` on the Production environment there.

## Two runs: v3 at `/` and `/v3`, v2 at `/v2`

The site keeps two runs, each gathered into one component: **v3**
(`runs/V3.svelte`, at `/` and at `/v3` — the address it keeps when the next run
takes `/`) and **v2** (`runs/V2.svelte`, at `/v2`, the WebGL run v3 replaced).
The switch in the top left corner (`components/Version.svelte`) moves between
them with a full reload — each run mounts its own Stage and names its scenes
its own way (`director.setRun`) — beside the build number. Everything below is
v3 unless it says v2. The README is lean on purpose; the long design history
of v2 is `docs/design-notes.md`.

**The next run is at `/next`** (`runs/Next.svelte`): the board flow the lead
picked, strand's journey in the sketchy hand (`lab/flow-strand-sketch.js`,
its header the map), out of the lab in a plain environment of its own — one
canvas, one WebGPURenderer, the run answered by hand, no lab bar and no
sketch tags (`board.js tag` stays silent there). ON THE MAIN SITE IT IS `/`
AND THE ONLY PAGE (see "Two sites" above). `?v=<name>` plays a variant
`flow-strand-sketch-<name>.js` (on dev only): the run itself is the newest
cut — L (0.21, `?v=l` is an alias of it), CLEAN UNTIL THE ROOM: the entry
(the title, WHEN WERE YOU BORN? and HOW SPICY ARE YOUR PARENTS? typed into
the double helix — `Q1_TEXT`, `Q2_TEXT`; each answer's gold trace runs the
strand in `B.trace` 0.8 s, and the lens moves to the reading only once the
spice's trace has run its length, `B.view` from E2 + trace; the title's full stop fades ON THE SAME
BEAT as "… OF CONCEPTION", the last line — it used to glide over and become
the strand's 5′ end, then had a beat of its own; each question typed within the
0.8 s before its wait, `keys`, since live the run HOLDS at the wait until
the person answers and a question still being typed there stopped
mid-word), COMPILING USER GENETICS (the
amino-acid generator: the reading frame over the helix, the body written
codon by codon, each ring's own shape flashed in gold — `log/body.js
codonSection`; the strand LEVEL throughout, read SIDE-ON with the frame at
the middle of the board and the strand sliding through it, the body built
flat across the board — or, on a board taller than it is wide,
the lens rolled a quarter turn as it comes to the reading so the body is
built upright, the head at the top, and rolled back as it goes round behind
the swimmer: `lensAt`), SIMULATING CONCEPTION: the swim into ONE GROOVE
(I5's: a helix down the cone turning under the stylus, nothing lettered on
it — THE SWIM CUT to 9.5 s in 0.23, the run to 44 s, about three and a
half turns on a laptop, the porthole a star for most of it and the sun only
in its last two seconds, `portR` as the cube of the time: "the simulation
transition can be cut way down, especially the blinding light moment",
the PM — its turns JOINED — the hand's wobble is one noise along the whole
groove, `sketchTurn`; the ONE groove goes on round the room until the room's frame
has taken the board — cut A's second set of rings at the dive is gone, the
spiral's lines doubled with it — and through the fall it EXPANDS WITH THE
ROOM'S DEPTH (`rings`: the lens's distance to the apex taken in by the
e-folds the plate has grown beyond the swim's zoom), so the frame never
overtakes a turn and hides it ("the room jumped in front of the tunnel"
— the lead): every turn expands ahead of the frame and off the board), about nine and a half turns to the
PORTHOLE at the apex — THE SUN (0.22.3): through the swim the porthole is
LIGHT and nothing else, a warm white filling it with the lens's rays out
of it (`sunVeil`, `LIGHT.sun` 0.42 — 0.6 was a little too bright), and as the tunnel opens the white RESOLVES
DOWNWARD into the room, clearing from the top of the hole down over the
fall's first `SUN.resolve` seconds with a soft edge, the room revealing
itself out of the light (the lead: "as the tunnel opens you should only
see sunshine, and the sunshine should resolve downwards"); the porthole a
circle grown steadily from a speck (`portR`, to the fall's own first plate on that board, `S.plate0`, so the
fall opens on exactly it — on a phone the room used to drop a third at the
dive; NOTHING of a record: no label, no disc, no
spindle, no flecks — the lead saw a CD and wanted it gone) — and THE PORTHOLE
IS A CIRCLE, ALWAYS, INSCRIBED IN THE ROOM'S PLATE (0.23.1: "the shape we
see should always be the shape of the hole" — the lead; it was cut to the
plate's rectangle for a round, and a wider circle filled by the wall's
texture repeating past the plate was tried and dropped — "a bad idea"),
ONE SHAPE FROM THE SPECK TO THE LANDING: `HOLE_C` 0.49 of the plate's REAL
height on the board (`holeAt`, `holePath`; the plate as the fall lays it,
`log/fall.js frameOf`, into the glass and all), grown by the zoom and by
NOTHING ELSE, so nothing but the room is ever inside it — and that is why
the lens lands as deep as `FILL` says, the room 2.1 boards wide (1.25
tall on a phone): the inscribed circle has to be past the board's corners
at rest, which it is just BEFORE the lens is there (`S.tCover`, ~34.3 on
a laptop and a phone, rest 34.5), so the lens
simply swims through the end of the tunnel and the room's depth does the
reveal (it widened from the inscribed circle over the fall's first second
for a round, and that read as the hole being opened at the end — "i dont
want to expand the hole", the lead); the fall's slowing to rest is
`FALL_PACE.ease` 1.4 (it was 2, a touch too slow across the last of the
room's expansion) (the nest law read the plate too small past ζ = 0, so the hole
lagged the room and had to be let go after the lens had stopped — "the
tunnel suddenly widens", the lead, twice); no flash, the lens falls on
into the room and comes to rest, the monitor switches on softly and A TOUCH
OF THE HOLY LIGHT comes out of it (`lightAt`: the lens's `light` — the lit
glass smeared out along a slow sunburst's rays across the room, and a
small core — low, no bloom, breathing on the hold's clock, off with AGAIN:
sketch A's sun at a touch, not the flash; the RAYS come up EARLY, out of
the porthole from `LIGHT.from` seconds before the dive, so the sun is seen
as the tunnel's end is approached, the core only with the monitor); no date, no maths, no conversation anywhere on the
fly-in. THE OUTPUT IS ON THE COMPUTER SCREEN (0.23.3 — the PM wanted the embed,
not the title; the lead: a response string, then the embed, then SHARE
and the restart key, bigger, cleaner, not yellow, on the computer screen):
a column centred on the glass (`runs/Next.svelte` `.output`;
`sketch.screen()` gives it the glass each frame, so it follows the room as
it sways after the pointer) — the line YOU WERE CONCEIVED TO, Spotify's
352 × 152 bar with the artwork scaled to 0.86 of the glass's width, and
two keys in the screen's dark ink, SHARE (the Web Share sheet, or the
link to the clipboard with LINK COPIED for a moment) and START AGAIN —
up the moment the lens is at rest (`song()`), nothing lettered on the
glass by the sketch; THE WORDS ARE THE COPY TABLE'S, `PAGE` in
`lab/log/sketch-copy.js`, for the lead to edit. `?screen=title` is what it was from 0.21 to 0.23.1: the song and its
artist lettered on the glass in the hand — capitals, WRAPPED at the words
to the glass's width and sized to fit it (`screenWords`, `wordsFit`; not a
monospace grid) — AGAIN a key at the glass's bottom, and the embed a
compact bar (352 × 80) in the top left corner; no PLAY key either way. THE LANDED ROOM IS THE PAGE'S AT ONCE: `ended()` is
true from the moment the lens is at rest (the AGAIN key; the clock runs on
to 44 and holds, nothing of the picture changing with it), and the room
stays as it lands — warm, active, a little bouncy, the boil never calmed,
the pointer's parallax on it — at `ROOM.calm` 0.3 of the boil, `ROOM.sway`
a quarter of the sway and `PARALLAX` halved since 0.23.3 ("the elements
in the room are moving too much" — the PM, then the lead again); the monitor's glass is the pale screen the artist
drew, never the spiral through it and never a black square (`glassBase`). A PERSON IS ALWAYS THERE on the main site:
`live` is true there whatever the query, so the date and the spice are
theirs to type and the scripted hand never fills them in (`?demo=1` is the
lab's and the reels' tool). The 90s poster and clock sit exactly where the
artist's composite has them (`data/roomElements.js`, fitted to
`static/90s_Illustration.jpg`), so the wall's tape marks are covered. AGAIN
(`.again()`) dollies the lens on THROUGH the dark glass — slowly, the hold's
clock kept running so the sway and the parallax go on — until the glass
covers the board (`covers`); the glass DARKENS as the lens goes through it
(`EXIT.dark`) and once it covers the board the DOLLY HOLDS there
(`exit.fly`) while the picture fades to the ground over `EXIT.fade` — it
snapped from the pale glass to the dark — and that dark is what the next
title types on. The sway and the pointer's parallax are CALMED as the lens
goes into the glass (`calmExit`, fall.js `sway`): near the glass's plane
any shift of the lens throws the glass aside, so on some runs it never
covered the board, the lens crossed its plane and the room's WALL showed
before the dark ("a flash of room graphic background" — the lead); if the
glass does go behind the lens uncovered, the dark comes at once. The endings
of round K sit beside it on cut K's base (`docs/explore-12.md`): `?v=k` cut
K itself (the record and the needle drop), `?v=k1` the needle drop cleaned,
`?v=k2` the iris as it was picked, `?v=k3` the screen's light (`log/fall.js
reveal`), `?v=k4` the cut, `?v=k5` the develop (`log/k5-fall.js`). `?v=m`
is THE MACHINE (M), for the lead's own humour: after the date and the spice
a faux clinical procedure in six steps — the sensor cap, the traces, THINK
ABOUT YOUR FATHER'S SPERM, NOW THINK ABOUT YOUR PARENTS HAVING SEX, the
sperm reverse-engineered from the signal — then cut K's journey
(`log/sketch-copy-m.js`, `log/meg-signal.js`, on I2's `log/i2-meg.js`).
Earlier cuts are kept: `?v=h` cut H of 0.18 (the parents' conversation
alone in the tunnel, the flash straight off the date; table
`log/sketch-copy-h.js`), `?v=g` cut G (tunnel B with the tesseract and the
questions that veer the swimmer, `log/sketch-copy-g.js`), `?v=j` cut J (the
conversation over five rooms, `log/sketch-copy-j.js`), round I's five
explorations with H's length (`?v=i1` the wave, `?v=i2` the MEG, `?v=i3` the
light cone, `?v=i4` the narrative, `?v=i5` the lathe and the record;
`docs/explore-11.md`), `?v=a` the original sketch of 0.10, `?v=b` sketch A's
tuned 0.11, `?v=c` sketch C of 0.13, `?v=d` sketch D of 0.14, `?v=e` sketch E
of 0.15 (each with its own table, `log/sketch-copy-<v>.js`); the five of 0.12
are set aside, kept for reference; `?at=` and `?demo=1` as in the lab.
`docs/next-beats.md` times the run. A birthday the archive cannot answer for
(`functions/answer.js resolve` → `edge`; `?edge=past|future|unknown` forces
one) runs the same run to the label and then BREAKS DOWN where the dive
would be (`BREAK`): the gif leaks into the seam, the label tears open onto
the gif tiled across the board (`data/gifs.js` sheets drawn on the board),
the verdict is lettered over it and held. **Every word that flies is in ONE
table, `lab/log/sketch-copy.js`** — the run's has only the two captions and
the three verdicts; a row says `when` it applies, `off` keeps a row without
playing it; the lead edits words there, and nothing textual is hard-coded in
the sketch. It draws through the LENS (`lab/log/lens.js`): the board's 2D
canvas uploaded each frame into one GPU pass that does the soft warm focus
(mist, halo, lift, grain, a rare leak), the conception's light and the flash
(the `veil` a plain even mix to white), with the heavy lines instanced on the
GPU under and over it (`lab/log/gpu-ink.js`); the lens's own renderer is
WebGL 2 (a canvas → texture copy is cheap there and was not on WebGPU in the
sandbox). The lens is made FIRST in `make()` and the board's first paint goes
through it, so the page opens on the run's own look. On a software GPU the
lens draws at a smaller budget in a live run than pinned, so a seek-vs-run
diff is taken with `?lensres=1` on both. The corner's switch reads v2 · v3 ·
next · ARCHIVE: the archive is `/log`, everything the lab tried. It takes `/`
when the lead says so; v3 keeps `/v3`.

Everything the lab tried is the ARCHIVE: **`/log`** indexes the blackboard
sketches (`lab/log-*.js` on the shared kit `lab/log/`, a 2D canvas over the
page, not the Stage — `docs/explore-03.md` to `-06`). **`/flows`**
(`?chain=flows`) plays the v4 FLOWS: whole runs on the board, one answer each
to the same brief (the terminal without its command, the questions in the
flow's own geometry, the swimmer hidden until the flash, one to three beats
from the last answer to the room), listed in the registry's `FLOWS`, to mix
and match from; they share the kit's `helix.js` (the swimmer as a helix turning
on its own axis), `log-dawn.js makeTerminal` and `log-orb.js drawPrompt`.
The rooms are the 2D drawings — the lead looked at the SOLID room (the 90s
room rebuilt in 3D: `lab/solid/`, the sketch `log-solid`, seven loops round
it on the blue, and `?ink=1` its ink mode: the board's dark, chalk lines, no
colour) and is sticking to 2D; it stays an exploration in the lab and the
cut, and `flow-dodeca?end=solid` shows the one way it was tried in a flow
(the chalk pane handed to the ink model without a seam by
`solid/flowroom.js`; a flow that renders three.js under the board gets a
`renderer` from the reel and the lab and clears the board over it).
`/v4?chain=log` and `?chain=clopen` play one variant of each of a round's
beats, `?chain=play` the five clopen films as one loop, and **`/cut`**
(`?chain=all`) is THE CUT: everything there is, EVERY variant of every beat in
the run's order, the short cut's first in each beat, so a sketch or a variant
that lands in the registry is in the cut — eighteen minutes, and ← and → step
between beats; `?chain=one` is the short cut, one of each, the variant each
beat's `cut` names in the registry. A
log sketch reads its variant from `?v=`, or from the reel (`pickVariant` round
its `make()`). EVERY experiment is listed once, in `data/experiments.js` — the
board's beats and variants in the run's order, the reels, the rounds before
the board, the runs — and that list is what `/log` indexes and what the small
bar in the bottom right of the lab, the reels and the index
(`components/LabBar.svelte`, mounted from the layout so it sits above the
board's canvas) steps through; a new sketch or variant goes in that list or it
is nowhere. The kit is `board.js` (the board, views, strokes, maths type,
the clock), `space.js` (the lens, keyframed paths, a depth buffer for hidden
lines, 3D lines), `ink.js` (the orb, lit points, the lecture), `rooms.js` (the
bedrooms on the board), `helix.js` (the swimmer, a helix turning on its axis),
`plate.js` and `sperm.js` (the old flat spiral swimmer; the lead asked for the
helix instead); use it rather than copying
a sketch's own helpers. `/lab` finds sketches by a glob, and in
dev fetches one the glob does not know by its path — the dev server here does
not see files added after it started — so a new file in `src/lib/lab/` is
there without a restart.

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
inward, the throat darkest — the hole a monitor's size, the glass the first
room is seen through, and set as deep behind the record's face as a room's
monitor is behind its frame (the screen layer's depth), so the fall's first
crossing IS every crossing: the pose heads for a point behind the glass in
every room, and with the hole in the face's own plane the first crossing was a
flatter zoom and the lens nearly doubled its speed going into the first room
(the "speed-up at the descent") — or, on a
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
world is `NEST.scale` (3.5) times the rooms' own units: a zoom is the same at
any scale, but the lens's speed in the world at the seam is that times the
fall's opening rate, and the tunnel has to hand over at it (about 13 a second,
a little over what it takes from the flight). The grooves — down the wall and
into the record's funnel, ONE straight spiral counted from the hole, turning
with the tunnel (`nest.setRecordTurn`; the fall sets the turn the tunnel came to
rest at itself, `restRecord`, since a seek into the fall runs no tunnel) — are
STRAIGHT, and COLOURED by the critical line as the primes write it,
`Σ cos(t log p)/p` with t along the groove, through a ramp from violet to cream
(`tsl/zeta.js primeWave, spiralGroove, waveRamp`; the numbers in `NEST.disc`,
which the wall shares). They wobbled by it for a round and the lead asked for
straight lines with the line's height in their colour. `|ζ(½ + it)|` itself
(`functions/zeta.js`, `grooveDistNode`) is left to the dormant funnel between
rooms (`NEST.funnel.on`, OFF: the lead looked at it and took it out). The rooms' back
walls are drawn well past their frames with the wallpaper LOOPED (mirrored
repeat), so nothing of the room outside shows through a room's gaps
(`NEST.wallCover`). All three are shot on
the run's ONE lens (`LENS`) with the run's ONE hand on the camera
(`three/world/wobble.js`, a slow pan, tilt and roll on `runSeconds`, the run's
own clock — which LETS GO as the set comes up, `WOBBLE.still`, so the set
arrives centred and level, and takes hold again down the tunnel), and the run
only ever GATHERS speed until it lands: the flight ramps up to
`SCENES.approach.accel` times its opening speed, the tunnel on from there to
the fall's opening speed over the whole of its length, the fall's zoom on up by
`SCENES.descent.accel` before it eases to land — and the swimmer's roll with
them at half the gain (`TUNNEL.spinGain`, `nest.swimmer.spinAt`, stepped by
each scene at its pace). No dolly, no stop and no restart anywhere, so nothing about the camera
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
over that frame on a card of the site's yellow — over the raster, not under
it, big and in full ink, for reading — the gif still playing. The gif is laid
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
replaced — v2, at `/v2` on its own Stage (`three/StageV2.svelte`,
`runs/V2.svelte`): the same card, popups, room and director, switched to that run's
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
  other way (about eleven degrees as it shows) and already turning
  (`SCENES.approach.turnFrom` of the tunnel's opening rate), gathering to reach
  the seam upright at the tunnel's own rate, and the tunnel opens at that rate
  (`SCENES.kaleido.turnSeam`) and ramps up (`turnRamp`, `kaleidoscope.turnOf`),
  so the turn has no start to see. It is framed by its BODY while far off and
  slides across to be hung by its glass by the time the flight is into it
  (`APPROACH.frame`, `kaleidoscope.frameSet`): the 60s set's glass is left of
  its middle. The set is
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
