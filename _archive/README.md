# The archive

This tree is the current run and nothing else (0.24 on). Everything the project
was before that is kept whole, and still building, on one branch:

**`archive`** — the repository as it stood at 0.23.18 (28 October 2026): the two
3D runs, the lab with every sketch, flow and variant tried in it, every earlier
cut of the current run, the docs, the source artwork. It is frozen. Nothing is
developed there and it is never merged.

This page is the account of it: how to look at any of it, what the version
names mean, how the project got here, and what every branch is. Hashes are
commits; everything said here was read off the history, and what was deduced
rather than read is marked _(inferred)_.

## Looking at it

```
git fetch origin archive && git checkout archive
yarn install && npm run dev          # http://localhost:3000
```

Vercel builds every branch, so `archive` also has a Preview deployment of its
own. A local build and a Preview are both the **dev** site, which shows
everything (on that branch a Production build shows the run alone; the flag is
`SITE` in its `vite.config.js`).

| the thing                         | where, on `archive`                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **v3**, the WebGPU run            | `/` and `/v3`. `?gl=1` forces WebGL 2. Keys: `1` restart, `2` approach, `4` kaleido, `3` descent, `5` room                               |
| **v2**, the WebGL run             | `/v2`. Keys: `2` fly-in, `3` conception, `4` computation, `5` room                                                                       |
| the current run as it was (cut L) | `/next`                                                                                                                                  |
| an earlier cut of it              | `/next?v=<name>`: `a b c d e`, `one two three four five`, `g h j`, `i1 … i5`, `k`, `k1 … k5`, `m`                                        |
| the index of every experiment     | `/log` (the corner's ARCHIVE link); a bar in the corner of each steps to the next                                                        |
| one sketch on a bare canvas       | `/lab?sketch=<name>&v=<variant>`                                                                                                         |
| the reels                         | `/flows` (seven whole runs on the board), `/cut` (every variant of every beat, eighteen minutes), `/v4`, `/v4?chain=one\|log\|…`, `/eva` |
| any frame of anything, pinned     | `?at=0.42` (a fraction of the scene or the run); `?seed=1`, `?edge=past\|future\|unknown`, `?demo=1`                                     |

Its own `README.md`, `CLAUDE.md` and `docs/` describe all of it at length, as
they were. `src/lib/data/experiments.js` is the one list of every experiment
(89 sketch modules, 130 variants of the board's 25 sketches, 9 reels, 2 runs).

Anything older than the archive's tip — the machine, the icosahedron, the
desktop — is not playable there; it is a commit to check out (the eras below
name them). Before `3a4fa48` (12 September 2026) the toolchain is Svelte 3,
Kit 1, Vite 4 and three r148, with its own lockfile.

## What the names mean

The numbers do not line up across names, so:

| name                            | what it is                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **the run** (was "next", cut L) | the page this tree is: the journey drawn on a blackboard in a sketchy hand. At `/next` from 0.11 (24 October 2026), the site's only page from 0.21                                                           |
| **v3**                          | the WebGPU run in three 3D scenes — approach, kaleido, descent — and the room. Named in 0.3.0; frozen since. It is what the "v4" rebuild became                                                              |
| **v2**                          | the WebGL run v3 replaced: fly-in, conception, computation, room. It is the run branch `fullflow-v3` built (no machine), on the newer toolchain; frozen since 0.3.0                                          |
| **"v4"** (the rebuild)          | the WebGPU / TSL rebuild plan of September 2026 (`docs/v4-plan.md`, `/v4`, branches `fullflow-v4`, `lab`, `v4`, `v4-flow`, `v4-scenes`). Not a run: its approach and descent went into v3                    |
| **"the v4 flows"**              | something else again: seven whole runs drawn on the blackboard (0.7.0, `/flows`). "v5" and "v6" in the registry are the five full flows of 0.9.0 and strand's journey five ways of 0.10.0                    |
| **the lab, the board, the log** | the workshop (`/lab`) and, from 0.4.0, the blackboard sketches (`lab/log-*.js` on the kit `lab/log/`), indexed at `/log`                                                                                     |
| `fullflow-v1 … v4`              | four rounds of the "one flow" site of September 2026: v1 five scenes with the machine, v2 the black-and-gold middle, v3 no machine, v4 the toolchain jump                                                    |
| "V1", "V2" in old comments      | older builds still, not routes: the first 3D scene of 2024 and the icosahedron build of July 2026 _(inferred)_                                                                                               |
| **v1** as a site                | not in this repository: the original Conception Calculator 2000, which this is the rebuild of (hence `cc2000-v2`) _(inferred from "rebuild in progress", "match original" and the repository's description)_ |

## How it got here

One root commit (`9a97aa3`, a generic template), 441 commits on `dev` to the
cut, no tags. `package.json` read 0.1.0 for the first twenty-six months;
version numbers begin at 0.2.0.

| when             | what the site was                                                                                                                                                                                                                                       | where it is                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Jul – Aug 2024   | The first build (`0b1bba5` "rebuild in progress"): the chart archive `cc2000_data.json`, four DOM screens (start, calculate, transition, output) and a three.js fly-in — a grid tunnel, a two-sphere egg, a corkscrewing sperm                          | `9a97aa3` … `d7c706e`                                                       |
| Jul – Aug 2025   | Restyles of the same four screens: colour passes, then a Windows 2000 desktop with a window, icons and a progress bar                                                                                                                                   | … `942dad4`                                                                 |
| Nov 2025         | "minimal cut build" (`90d700e`): the UI stripped to one three.js scene, then a raymarched volume cube                                                                                                                                                   | … `ec5579a`; parked as `scene-cube`                                         |
| Feb – Apr 2026   | The icosahedron (`b29075b`), its golden rectangles; the four decades' room artwork arrives (`ff66f48`)                                                                                                                                                  | … `994574e`                                                                 |
| 9 – 10 Jul 2026  | The first pull requests. Each golden-rectangle pane shows a decade's room as a layered diorama (#1 – #6); then a blueprint and terminal redesign with a boot log, a stepped search and a 24-cell (#7 – #12)                                             | `scene-icosahedron`, the two `claude/*-redesign` branches                   |
| 4 Sep 2026       | A shader background, merged and reverted within the hour (#13, #14)                                                                                                                                                                                     | `new-color`                                                                 |
| 4 – 8 Sep 2026   | "Rebuild the site as one flow" (`c440d56`): thirty-six pull requests in five days, settling as five named scenes — Calculator (the machine), FlyIn, Conception, Computation, Room — with a director and one config layer (`1010bc7`)                    | #15 – #50; `fullflow-v1`                                                    |
| 8 – 9 Sep 2026   | The middle three scenes rebuilt as one shot in black and gold. `?at=` pins, `scripts/shots.mjs`, CLAUDE.md and the title card begin here                                                                                                                | #51 – #60; `fullflow-v2` (see its note below)                               |
| 9 – 10 Sep 2026  | "V3: no machine" (`07f2418`): the calculator leaves; a title card over the flight, the two questions asked mid-flight                                                                                                                                   | #61 – #66; `fullflow-v3`. **This is `/v2`**                                 |
| 12 – 19 Sep 2026 | The "v4" WebGPU rebuild beside an unchanged site: the toolchain jump (`3a4fa48`), `/lab`, the plan, a rough cut at `/v4`, then the cut re-made as approach, descent, impact, lattice, cube                                                              | #67 – #71; `fullflow-v4`, `lab`, `v4-flow`, `v4-scenes`, `v4`               |
| 19 Sep 2026      | `dev` is cut from `v4` ("One branch to look at: dev"). "The full experience" (`7d4224f`): approach into descent into the room on one WebGPU renderer; the WebGL run kept at `/v2` (`121101c`)                                                           | `dev`; `main` moved to it with no pull request _(a fast-forward, inferred)_ |
| 19 – 26 Sep 2026 | The WebGPU run grown a round at a time: the kaleido tunnel, one camera, the record and its grooves, the verdict's gif tunnels. 0.2.0 adds the build label, 0.3.0 names the two runs v2 and v3                                                           | #76 – #94. **This is `/` and `/v3`**                                        |
| 1 – 24 Oct 2026  | The site unchanged. The work is the next rebuild, looked for on a blackboard in the lab: three rounds of sketches, the registry and `/cut` (0.4 – 0.6), then whole flows, intros and swimmers, five full flows, strand's journey five ways (0.7 – 0.10) | #95 (0.6.0), the rest with #96                                              |
| 24 – 25 Oct 2026 | `/next` (0.11.0): the strand sketch taken out of the lab as the next run, and eleven cuts of it in two days (0.12 – 0.20). 0.21.0 makes cut L the run and `main` the run alone                                                                          | #96                                                                         |
| 25 – 28 Oct 2026 | Cut L refined, a pull request for each round of the lead's notes (0.21.1 – 0.23.18)                                                                                                                                                                     | #97 – #122                                                                  |
| Nov 2026         | The cut (0.24.0): this tree                                                                                                                                                                                                                             | `main`, `dev`                                                               |

By the cut there had been 122 pull requests: 115 into `main` (#1 – #69,
#76 – #121), two into `v4`, four into `fullflow-v2`, and #122, which carried
0.23.18 and then the cut itself.

## The versions

| version       | date (2026) | the round                                                                                                         |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| 0.2.0         | 26 Sep      | the build label in the corner; v3's record as a funnel of grooves (#93)                                           |
| 0.3.0         | 26 Sep      | the two runs named v2 and v3, `/v3`, the corner's switch; the long design history moved to `docs/design-notes.md` |
| 0.4.0         | 1 Oct       | "the log of everything": the first round on the blackboard, `/log`                                                |
| 0.5.0         | 2 Oct       | "clopen": the second round                                                                                        |
| 0.6.0         | 3 Oct       | "Einstein meets Gödel": the third; the registry, the bar, `/cut`                                                  |
| 0.7.0         | 15 Oct      | "the v4 flows": seven whole runs on the board, `/flows`                                                           |
| 0.8.0         | 23 Oct      | fifteen intros answered by hand, twelve swimmers made in 3D                                                       |
| 0.9.0         | 23 Oct      | five full flows: rosette, wormhole, harmonic, strand, calendar                                                    |
| 0.10.0        | 24 Oct      | strand's journey as one beat, five ways: sun, sketch, horn, corridor, screens                                     |
| 0.11.0        | 24 Oct      | sketch through the lens, inside the last room; `/next`                                                            |
| 0.12 – 0.20   | 25 Oct      | the cuts, below: one to five, C, D, E, F, G, H, J, round I, K and its endings                                     |
| 0.21.0        | 25 Oct      | cut L is the run; two sites from one repository, `main` the run alone (#96)                                       |
| 0.21.1 – .5   | 25 – 26 Oct | nothing of a record; one dark from the first byte; manual only; the glass the drawn screen (#97 – #100)           |
| 0.22.0 – .4   | 27 Oct      | the landing one motion; HOW SPICY ARE YOUR PARENTS?; the porthole grown by the zoom alone (#101 – #105)           |
| 0.23.0        | 27 Oct      | the swim cut to 9.5 s, the run 44 s (#106)                                                                        |
| 0.23.1 – .6   | 27 Oct      | the porthole a circle always; the output on the computer screen; the wall never wraps (#107 – #110)               |
| 0.23.7 – .11  | 27 – 28 Oct | the sunbeam diffuse about its origin; the scans 0.7 and 1.4 s; the embed preloaded (#111 – #115)                  |
| 0.23.12 – .14 | 28 Oct      | the hole is the end of the tunnel and nothing else; the disc removed completely (#116 – #118)                     |
| 0.23.15 – .18 | 28 Oct      | one truncated cone and the room past its cut; the dolly zoom; the end of the tunnel starts as light (#119 – #122) |
| **0.24.0**    | Nov         | the cut: the repository is the run                                                                                |

`main` sat at 0.6.0 from 6 to 25 October, so 0.6.1 to 0.20.1 were never
deployed to it one by one.

## The cuts of the run

The files are `src/lib/lab/flow-strand-sketch-<name>.js` on `archive`, each a
whole copy of the run as it was, each with its own copy table
(`lab/log/sketch-copy-<name>.js`) where it has one. They share a kit that went
on changing afterwards, so a kept cut may not look exactly as it did on its
day; the exact state is the commit of its version.

| cut      | version        | what it was                                                                                                       |
| -------- | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| strand   | 0.9.0          | `flow-strand.js`, the flow the rest descend from: the date as base pairs on a double helix, read into the swimmer |
| A        | 0.10.0         | the journey in a boiling hand, in two halves: the 266 days struck off, the band, the dive, the chalk fall         |
| B        | 0.11.0         | A through the lens, the lines on the GPU, the landing inside the last room, a holy light. `/next` begins here     |
| one–five | 0.12.0         | five independent one-beat answers; set aside, kept                                                                |
| C        | 0.13           | one tunnel half as long; number theory, then the years and the days                                               |
| D        | 0.14           | one tunnel in two parts: the date, then the song                                                                  |
| E        | 0.15           | the first tunnel without its sum; the slot kept through the rooms; a slow sun                                     |
| F        | 0.16           | the hold and AGAIN, the three verdicts, Spotify. No file: it became G in place                                    |
| G        | 0.17           | tunnel B: five rooms as a tesseract, questions that veer the swimmer                                              |
| H        | 0.18           | no tunnel B: the parents' conversation alone in the tunnel, the flash straight off the date. 54 s                 |
| J        | 0.18.4         | H's conversation over five rooms. 62 s                                                                            |
| I1 – I5  | 0.19.0         | five explorations from H: the wave, the MEG, the light cone, the narrative, the lathe and the record              |
| K        | 0.20.0         | "clean until the room": I3's generation into I5's groove, a record on the monitor, the needle drop. 54 s          |
| K1 – K5  | 0.20.1         | five endings on K: the needle drop cleaned, the iris, the screen's light, the cut, the develop                    |
| M        | 0.20.1         | the MEG machine: a six-step faux clinical procedure before K's journey. 77 s (it was `?v=meg`)                    |
| **L**    | 0.21 – 0.23.18 | K2's iris, clean, with H's codon generator: the run. 52 s at first, 44 s from 0.23.0                              |

## The docs, on `archive`

| doc                       | covers                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `docs/design-notes.md`    | the long design history of the WebGL run (v2): the ovum, the materials, the flight, the loop home     |
| `docs/v4-plan.md`         | the WebGPU rebuild's plan: the idea, the budget, the render architecture, the maths, the risks        |
| `docs/v4-flow.md`         | v3 as a contact sheet: the walk-through and the scene table                                           |
| `docs/explore-01`, `-02`  | two rounds of lab sketches for v3 (three of the first went into the run; none of the second)          |
| `docs/explore-03` … `-06` | the blackboard, rounds one to four: the log of everything, clopen, Einstein meets Gödel, the v4 flows |
| `docs/explore-07` … `-10` | flow-conception; the intros and the swimmers; the five full flows; strand's journey five ways         |
| `docs/explore-11`, `-12`  | round I, and cut K with its five endings and the MEG machine                                          |
| `docs/next-beats.md`      | the run's beats, timed, for cuts L, K and H                                                           |

Cuts A to H and J have no doc of their own: they are in that branch's
CLAUDE.md, in `next-beats.md`, in the commit messages and in the file headers.

## Every branch

"In `main`" means every commit of the branch is in `main`'s history, so
deleting the branch would lose nothing.

| branch                                             | tip, date              | what it is                                                                                                                                                                                        | in `main`                                         |
| -------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `main`                                             |                        | the site                                                                                                                                                                                          |                                                   |
| `dev`                                              |                        | the working branch since 19 September 2026; every round reaches `main` from it by pull request                                                                                                    |                                                   |
| `archive`                                          | `6e8ffca` + its banner | everything, frozen at 0.23.18                                                                                                                                                                     | all but the banner commit                         |
| `scene-cube`                                       | `aa7fc4d`, 13 Feb 2026 | the volumetric cube scene of November 2025, parked                                                                                                                                                | no: one commit, "park branch", a θ-divisor volume |
| `scene-icosahedron`                                | `dd315d9`, 10 Jul 2026 | `main` as it stood after #12: the icosahedron with the blueprint redesign                                                                                                                         | yes                                               |
| `claude/golden-rectangles-scene-elements-bz89fl`   | `ecb0935`, 9 Jul 2026  | the head of #1 – #6: room dioramas on the golden rectangles                                                                                                                                       | yes                                               |
| `claude/technical-blueprint-redesign-ab5w2b`       | `54436b1`, 10 Jul 2026 | the head of #7 – #12: the blueprint and terminal redesign, the 24-cell                                                                                                                            | yes                                               |
| `new-color`                                        | `ecc4054`, 4 Sep 2026  | `main` after the shader background was merged and reverted                                                                                                                                        | yes                                               |
| `claude/site-redesign-terminal-transitions-ws7eyy` | `6622395`, 8 Sep 2026  | the head of #15 – #50: the one-flow site with the machine                                                                                                                                         | yes                                               |
| `fullflow-v1`                                      | `95bfc86`, 8 Sep 2026  | `main` after #50: the five scenes, the machine                                                                                                                                                    | yes                                               |
| `fullflow-v2`                                      | `ebb3a29`, 19 Sep 2026 | the black-and-gold middle (that state is `3dfc0e2`). Its tip is NOT that site: it was used as a pull request base on 19 September and is the same tree as `dev`'s `121101c`, the first WebGPU run | no: three merge commits, no content               |
| `fullflow-v3`                                      | `80dfa65`, 10 Sep 2026 | no machine: what `/v2` plays                                                                                                                                                                      | yes                                               |
| `fullflow-v4`                                      | `1539714`, 13 Sep 2026 | the toolchain jump, and the lanes and seeds                                                                                                                                                       | yes                                               |
| `lab`                                              | `1c33dda`, 13 Sep 2026 | `/lab`, the first sketches, the v4 plan, `/v4`                                                                                                                                                    | yes                                               |
| `v4`                                               | `3eeb4b8`, 19 Sep 2026 | the rebuild's integration branch; what `dev` was cut from                                                                                                                                         | yes                                               |
| `v4-flow`                                          | `d13aa9a`, 14 Sep 2026 | the flow on one page (`docs/v4-flow.md`)                                                                                                                                                          | no: one commit, a README note on Node versions    |
| `v4-scenes`                                        | `a6a2d54`, 19 Sep 2026 | the rough cut re-made on the lab                                                                                                                                                                  | yes                                               |

The machine (the calculator of `fullflow-v1` and `-v2`) is not playable at the
archive's tip: `scenes/Calculator.svelte` and its dials are in that tree and
mounted by nothing. To see it, check out `95bfc86` or `3dfc0e2`, on the old
toolchain.

## Where this tree's files came from

The lean tree was cut out of the archive at 0.23.18. To follow a file back,
`git log --follow` crosses the move, or read it on `archive`:

| here                                | on `archive`                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `src/lib/run/Run.svelte`            | `src/lib/runs/Next.svelte`                                              |
| `src/lib/run/sketch.js`             | `src/lib/lab/flow-strand-sketch.js`                                     |
| `src/lib/run/copy.js`               | `src/lib/lab/log/sketch-copy.js`                                        |
| `src/lib/run/hand.js`               | `src/lib/lab/log/sketch-hand.js`                                        |
| `src/lib/run/answers.js`            | `src/lib/lab/log/answer.js`                                             |
| `src/lib/run/terminal.js`           | `makeTerminal` and what it draws with, out of `src/lib/lab/log-dawn.js` |
| `src/lib/run/demo.js`               | the scripted hand, out of `src/lib/lab/log/entry.js`                    |
| `src/lib/run/date.js`               | the date's arithmetic, which the sketch and its copy table each carried |
| `src/lib/run/<the rest>.js`         | `src/lib/lab/log/<the same name>.js`                                    |
| `src/routes/+layout.svelte`'s label | `src/lib/components/Build.svelte`                                       |
| `src/routes/styles.css`             | the head of `src/routes/styles.css`, and `src/lib/styles/fonts.css`     |
| `scripts/verify.mjs`                | `scripts/verify-main.mjs` (and `verify.mjs`, the dev site's)            |
| `scripts/shots.mjs`, `launch.mjs`   | `scripts/shots.mjs`, `scripts/lane.mjs`                                 |

What those files carried for other sketches and for earlier cuts was removed
in the cut: every function nothing in the run reaches, and the machinery that
was kept but no longer played (the count of the 266 days, the years on the
groove, the date on the band, the helix swimmer in the fall, the tesseract of
rooms, the title's zoom into the orb, the copy table's number theory and its
lists for the parents' evening, the old ending behind `?inside=0`). Where a
note in them still says what a thing "was" in cut K, or at 0.22, the thing
itself is on `archive` to be read.

A few small things the run took from the old config came home with it: the
easings (`config/ease.js`) into `run/board.js`, the monitors' glass rectangles
(`config/layout.js`) and their key colours (`three/tsl/glass.js`) into
`data/roomElements.js`, and the entry's beats (`lab/intro/epicycle.js`) into
`run/sketch.js`.

What did not come across, and is only on `archive`:

- the artist's finished composites the rooms' placements were measured against
  (`static/60s_Illustration.jpg`, `static/90s_Illustration.jpg`,
  `static/room-elements/50s/50s_Illustration_desktop.jpg`);
- the verdicts' original gifs (`static/gifs/*.gif`, 19 MB) and
  `scripts/gifs.mjs`, which bakes each into the sheet of frames the run draws
  (`static/gifs/*.jpg`, `src/lib/data/gifs.js`). If a gif ever changes, rerun it
  there and carry the sheet and its row across;
- the swimmer's model (`static/sperm.glb`), v2's and v3's;
- the WebGPU test lane (`scripts/lane.mjs`, `scripts/browser.mjs`): the run draws
  through WebGL 2, so the lean tree has no use for it;
- `docs/`, and the 8.7 MB of contact sheets in it.

## Worth knowing before trusting the archive

- **Its dev keys are on** (`config/dev.js`, `DEV.on`): space and `1` – `5` jump
  scenes on v2 and v3.
- **Its docs have stale corners.** `?v=meg` in `docs/explore-12.md` and several
  file headers is `?v=m` now; `design-notes.md` lists a module deleted in
  September and calls the WebGL run "imported by nothing" (it is `/v2`);
  `v4-plan.md` names modules that were never made; the README's lab paragraph
  stops at `explore-06`.
- **`cc2000_data.json` has no generator in the repository.** It is the chart
  archive (3,380 weeks, 1 June 1958 to 5 March 2023, ten tracks each) and has
  not changed since the first build.
- **Some things are in history but in no tree**: `flow-kummer.js`,
  `flow-strand-sketch-direct.js`, the CRT post-process pass, the `?unwind=1`
  look of 0.23.11, three early `.glb` models.
- There are no tags, no CI configuration and no `vercel.json` on any branch.
