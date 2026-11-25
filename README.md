# Conception Calculator 2000

Give it your birthday and how spicy your parents are, and it finds the song that
was playing at your moment of conception — then takes you to the bedroom where
it happened.

One page, one run. SvelteKit + three.js.

```
nvm use          # Node 22 — see .nvmrc
yarn install     # yarn.lock is what's tracked, and what Vercel installs from
npm run dev      # http://localhost:3000
```

**Node 22 or 24, not 23** (ESLint 10 and vite-plugin-svelte skip 23; Vercel
builds on `nodejs22.x`, pinned in `vite.config.js`).

This tree is the current version and nothing else. Everything that came before
it — the two 3D runs, the lab and every sketch tried in it, the earlier cuts of
this run — is on the **`archive`** branch; [`_archive/`](_archive/README.md)
says what is there and how to look at it.

---

## The run

Forty-four seconds, drawn on a blackboard in a sketchy hand and shot through a
soft warm lens. It waits at its two questions until they are answered.

| part       | from | to   | what happens                                                                                                                                                                                              |
| ---------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title      | 0    | 5.1  | a terminal types the title                                                                                                                                                                                |
| Entry      | 5.4  | 15.3 | WHEN WERE YOU BORN? and HOW SPICY ARE YOUR PARENTS?, typed into a double helix; a gold trace runs the strand as each is entered                                                                           |
| Compile    | 16.5 | 23.3 | COMPILING USER GENETICS: a reading frame crosses the helix and the swimmer's body is written codon by codon, then comes alive                                                                             |
| Swim       | 23.3 | 27.9 | SIMULATING CONCEPTION: the swimmer sets off, the lens comes round behind it and onto the axis, and a groove is sketched round it, a helix down a cone                                                     |
| The groove | 27.9 | 34.2 | about fifteen turns swum fast, gathering all the way, with a dolly zoom over the last of it; the end of the cone is a pinprick of light with a sunbeam out of it, and the room resolves out of that light |
| The fall   | 34.2 | 37.2 | through the end of the tunnel into the room, one zoom across the dive, slowing to rest inside it                                                                                                          |
| The screen | 37.1 | 38.3 | the monitor switches on; the moment the lens is at rest the output is on its glass: YOU WERE CONCEIVED TO, Spotify's player, SHARE and START AGAIN                                                        |
| The hold   | 39.7 | 44   | the room holds, swaying after the pointer; START AGAIN dollies the lens on through the dark glass, and the next title types on that dark                                                                  |

A birthday the archive cannot answer for (too early, too late, or the servers
overheating) runs the same run to the dive and breaks down there: the verdict's
gif tiled across the board, the verdict lettered over it, and START AGAIN under
it.

The numbers are the beat table `B` in `src/lib/run/sketch.js`; when a beat
moves, this table moves with it.

## Where everything is

```
src/
  app.html                 the shell: the first paint is the run's own dark
  routes/
    +layout.svelte         the stylesheet, the faces, the corner's build label
    +page.svelte           the page: the run
    styles.css
  lib/
    run/
      Run.svelte           the frame round the run: boots it, steps it, and puts
                           the output on the monitor's glass
      sketch.js            THE RUN: every beat, timed (the table B), start to end
      copy.js              every word, in one table: the captions, the verdicts,
                           the output's line and keys (PAGE)
      answers.js           the two questions, taken by hand: the keyboard, touch
      demo.js              the scripted hand that answers when asked to (?demo=1)
      terminal.js          the title, typed
      date.js              the date's arithmetic: 266 days back, the weekday
      body.js              the swimmer's body, written from the answers
      fall.js  rooms.js    the fall into the room; the four bedrooms on the board
      hand.js              the sketchy hand: lines that boil, lettering, speed lines
      board.js             the board: the canvas, the palette, strokes, the clock
      space.js             a depth buffer, so a line can hide behind the swimmer
      caption.js           the two status lines
      lens.js              the lens: the board drawn on the GPU, soft and warm, with
                           the conception's light
      gpu-ink.js           the hand's many lines, instanced on the GPU
      grain.js             the grain, without the lens
    data/
      cc2000_data.json     the archive: the charts, week by week
      roomElements.js      the four rooms' drawings and where each piece sits
      gifs.js              how each verdict's gif sheet is cut
    functions/
      answer.js  utils.js  a birthday and a spice in, a song (or a verdict) out
static/
  room-elements/           the rooms' artwork, six layers a decade
  gifs/                    the verdicts' gifs, baked into sheets of their frames
  fonts/                   NB Architekt
scripts/
  verify.mjs               the smoke test, run against a build before every push
  shots.mjs                pinned frames and a contact sheet
_archive/README.md         the account of every version and branch before this
```

## Looking at it

The run is a pure function of its clock, so any frame can be pinned, and a
pinned frame is the same on every load.

| query           |                                                                               |
| --------------- | ----------------------------------------------------------------------------- |
| `?at=0.42`      | pins the run at that fraction of its 44 seconds                               |
| `?demo=1`       | the scripted hand answers the two questions (14 · 02 · 1987, spice 7)         |
| `?edge=past`    | a birthday the archive cannot answer for (`future`, `unknown`): the breakdown |
| `?decade=50s`   | lands in that room (`60s`, `90s`, `10s`) whatever the date                    |
| `?screen=title` | the song lettered on the monitor instead of the player                        |
| `?vertigo=0`    | no dolly zoom (`?vertigo=<degrees>` sets its widest angle)                    |
| `?lens=0`       | the board bare, without the lens (`?gpuink=0`: the lens, the lines on canvas) |

```
npm run dev        the dev server
npm run lint       prettier --check, then eslint
npm run build      the production build
npm run verify     the smoke test (BASE=http://localhost:<port>)
npm run shots      a contact sheet (BASE, AT, W, H, QUERY — see scripts/shots.mjs)
```

## Working on it

Work happens on `dev` and reaches the site by a pull request to `main`; `main`
is what Vercel deploys. The corner of the page says which build it is —
`package.json`'s version and the commit — and the version is bumped with every
pull request. `CLAUDE.md` has the working agreements, how a change is checked,
and what has been decided about the run and must not be undone by accident.

## Versions and branches

| what                                                                    | where                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| the run, the current version (0.24 on)                                  | `main` (the site) and `dev` (the work), this tree              |
| everything before it, as one building site: v2, v3, the lab, every cut  | `archive`, frozen at 0.23.18                                   |
| how the project got here: the eras, the versions, every branch, in full | [`_archive/README.md`](_archive/README.md)                     |
| older working branches (`fullflow-*`, `v4*`, `lab`, `scene-*`, …)       | left as they were; all but a few commits of them are in `main` |
