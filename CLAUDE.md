# Working agreements

## The repository is the run

One page, one run: `src/lib/run/`, hosted by `routes/+page.svelte`. README.md
has the map of the files and the run's beats, timed.

Everything that came before — v2 and v3 (the two 3D runs), the lab and every
sketch tried in it, the earlier cuts of this run — is on the **`archive`**
branch, frozen at 0.23.18 and still building there. `_archive/README.md` is the
account of it: the versions, every branch, how to look at any of it. Do not
work on `archive`, do not open a PR from it, and do not bring old code back
into this tree unless the lead asks for it. To look at an old thing, check out
`archive` (or open its Vercel preview) rather than rebuilding it here.

## Demos and PRs go to `main`

`main` is the site. Work happens on `dev` — push there as it is made, it is
the working branch and nobody else's — and **when a round is finished, open a
PR from `dev` to `main` without being asked**: that ask has been made once,
standing, and it covers every round from here on. Read the latest PR's state
first: if it is still open, update it; if it has merged, open a new one. Do
not start branches for the sake of it; `dev` only moves forward. The demo to
look at is `main`'s deployment once the PR is in, and `dev`'s preview before
that.

The top left corner of the page says which build it is: `package.json`'s
version and the commit it was built from (`routes/+layout.svelte`,
`vite.config.js`). **Bump the version in `package.json` with every PR to
`main`** — the minor number for a round, the patch for a round of notes — so
the lead can tell one deploy from the one before at a glance. That label is
the only thing in the corner: no links out, no switch.

`yarn.lock` is what is tracked and what Vercel installs from. Keep it in step
when a dependency changes, and never commit a `package-lock.json`.

## Do not push unverified work

The rule above is only safe because of this one. Before pushing:

    npm run lint
    npm run build && npx vite preview --port 4175
    BASE=http://localhost:4175 node scripts/verify.mjs

`scripts/verify.mjs` plays the site as a visitor does: it types the two
answers, waits for the room, presses START AGAIN, and checks a verdict's run,
a phone and the 404s beside it. `npm run dev` picks whatever port is free —
read it out of the dev log rather than assuming 3000.

## Look at the thing before claiming it works

The run is a pure function of its clock, so `?at=` (a fraction of its 44 s)
pins a frame exactly, and `scripts/shots.mjs` turns that into a contact
sheet, the moments given in seconds:

    BASE=... AT='31.5,34.9,36.2' node scripts/shots.mjs
    BASE=... W=390 H=844 QUERY='edge=past' node scripts/shots.mjs

A pinned frame is the same on every load, byte for byte: nothing in the run
throws a die that is not seeded. That makes three checks cheap, and each has
caught something a look did not:

- **A change that should not move a pixel** (a refactor, a cleanup): shoot the
  same pins before and after and compare the files. Identical bytes, or it is
  a change.
- **A seam** (the dive, the landing): pins 0.02 s apart across it, diffed
  frame to frame. No step should be bigger than its neighbours.
- **Three boards, always**: a laptop (1440 × 900), a phone held upright
  (390 × 844) and a half screen (960 × 1080). The phone and the near-square
  board have each shown faults the laptop did not.

Traps that have already cost a round each:

- **A seek is not a run.** A pinned frame is given the scripted answers and
  computed from nothing; a live run accumulates (the hand's own clock, the
  hold at the end, the exit through the glass). If a screenshot is the
  evidence for a claim, check the claim survives a real run too — `?demo=1`
  plays one without typing.
- **On a software GPU the lens draws at a smaller budget live than pinned**,
  so a seek-versus-run diff is taken with `?lensres=1` on both.
- **The shots tool reports console ERRORS only.** A GL warning — a texture
  wider than the GPU's limit, 8192 here, uploads nothing — leaves a frame
  flat with no error at all.
- **A syntax or initialisation error in the sketch looks like a page that
  never becomes ready** (`window.__run` never set, the tools time out).
  Check the page's errors before anything else.
- **The run plays slowly under a software GPU with several pages open**: the
  clock steps at most 0.05 s a frame. Give a real-time check room, or sweep
  with `window.__run.api.seek(x)` and `.render()` instead.
- **A shortened run strands whatever was timed past its new end.** When the
  run went from 52 s to 44 (0.23.0) the verdicts' second and third lines were
  left at 45 s, and from then until 0.24 no verdict showed more than its
  headline. The verify script now checks every time in the copy table; a beat
  moved in `B` still has to be carried to `copy.js` by hand.
- **The verdicts are a run of their own.** They are not on the way to the
  room, so a look at the run does not show them: shoot them
  (`QUERY='edge=past'`, and `future`, `unknown`) whenever the end of the run
  or the page round it changes.

Write scratch scripts and screenshots to the scratchpad, never into
`scripts/`. A script living there cannot resolve the project's
`node_modules`, so import by absolute path:
`from '/home/user/cc2000-v2/node_modules/playwright/index.mjs'`.

## What has been decided about the run

These are the lead's rulings, most of them made more than once. They are why
the code is the way it is; do not undo one while fixing something else. Names
in backticks are in `src/lib/run/sketch.js` unless a file is given.

**The words.** Every word is in one table, `copy.js`: the two captions, the
three verdicts, and `PAGE`, the output's line and keys. The lead edits words
there; nothing textual is hard-coded in the sketch. The fly-in is CLEAN UNTIL
THE ROOM: no date, no maths, no conversation, only the two status lines.

**A person is always there.** The date and the spice are theirs to type and
are never filled in for them ("this should never happen. manual only"). The
scripted hand answers only when asked: `?demo=1`, or a pinned frame. Live, the
run HOLDS at each question's wait, so each question is typed within 0.8 s
before its wait (`keys`).

**The entry's timings are the lead's own numbers**, a harmonic 0.7 / 1.4 /
2.1: the date's gold trace 0.7 s (`B.trace`), the spice's 1.4 (`B.trace2`), a
0.7 s beat, then the lens moves to the reading (`B.view` from 16.5), and the
reading itself 2.1 s (`B.read`). COMPILING USER GENETICS types from the moment
the lens starts for the reading, not before. On a board taller than it is
wide the lens rolls a quarter turn so the body is built upright (`lensAt`).

**The tunnel is one truncated cone, and the room is what is past its cut.**
The groove winds down a cone cut off at a throat (`throatOf`); through the cut
is the room, at the cone's own perspective (`firstRoom`, `portR`), and the
swimmer swims down the cone and through the cut into it. There is no separate
hole: no disc, no rim, no label, no glow object, nothing of a record. That
object was put in and rejected five times in five forms ("you keep adding the
end/room as its own thing, when it should simply be what exists after the
cone"). The room in the cut is drawn at its true size (`R / HOLE_C`), so the
dive has no seam.

**The long tunnel, swum fast.** The swim covers `SWIM.efolds` 4.6, about
fifteen turns, so the end is a pinprick when the lens comes onto the axis and
grows only as it is swum towards. A shorter swim is never made by a shorter
tunnel. The groove fades in over `TUN.fadeIn`. Over the last seconds the DOLLY
ZOOM (`VERTIGO`): the lens widens to 88° while it closes on the swimmer.

**The end of the tunnel starts as light and resolves into the room** (`GLOW`):
a soft star with the sunbeam out of it, from the lens's swing onto the axis
(`lightAt`, `B.onAxis[0]`; the tunnel's first turn was "a touch too soon"),
the room coming out of the light as the cut grows.

**The sunbeam stays, and its origin is never seen.** Within a soft radius the
lens lets the sunburst's pattern go to its own mean (`lens.js` `soft`;
`LIGHT.diffuse`, `LIGHT.glass`), so the rays come out of a disc of light and
never meet at a point; it turns and shimmers; and it does not go at the
landing ("the sunbeam shouldnt disappear completely").

**One zoom across the dive, and no expanding hole.** The porthole is a
circle, always, inscribed in the room's plate (`HOLE_C`), grown by the zoom
and by nothing else ("i dont want to expand the hole"); `FILL` and `CIRCLE`
land the lens deep enough that the circle is past the board's corners on
every shape of board, so the tunnel never shows round the landed room. The
fall flies one path (`fall.js onePath`) and slows to rest (`FALL_PACE.ease`).
The reveal is never a scroll down, and there is no flash.

**The output is on the computer screen.** A column on the monitor's glass
(`Run.svelte`): the line, Spotify's 352 × 152 bar, SHARE and START AGAIN, in
the screen's dark ink, not yellow. It is up the moment the lens is at rest
(`ended()` from `B.hit`), and whole: the song is named from the moment the
answer is in (`song()`), so the embed is loaded twelve seconds before the
landing. It is moved by transform, never laid out per frame (that was the
jitter on the reveal). SHARE does nothing yet: it will be a share screen of
its own.

**The landed room is calm.** `ROOM.calm`, `ROOM.sway` and `PARALLAX` were
turned down twice ("the elements in the room are moving too much"). The
monitor's glass is the pale screen the artist drew. The 90s poster and clock
sit exactly where the artist's composite has them (`data/roomElements.js`),
covering the wall's tape marks. THE WALL NEVER WRAPS: it is drawn once and
the plate past it filled with the wall's own edge colour (`rooms.js edgeOf`).

**START AGAIN goes through the glass.** The lens dollies on through the dark
monitor until the glass covers the board, the picture fades to the ground,
and the next title types on that dark (`EXIT`). The sway is calmed on the way
(`calmExit`) so the room's wall never flashes past.

**The load is one dark.** `#1b1917` — the board's ground as the lens shows it
— from the first byte (`app.html`) to the lens's first frame. The board is
hidden while the rooms load and the lens is built, the lens's canvas is shown
only after its first frame, and the lens's light leak is off. The complaint
was "many layers of different noise effects turning on".

**The lens follows the window.** Its passes are rebuilt when the board's size
changes (`lens.js`): a resize once left the blur wildly off.

**A birthday the archive cannot answer for** (`functions/answer.js resolve` →
`edge`; `?edge=past|future|unknown` forces one) runs the same run to the dive
and BREAKS DOWN there (`BREAK`): the verdict's gif sheet tiled across the
board, the verdict lettered over it in three lines and held. It has no room
and no monitor, so the page gives it START AGAIN on its own, low on the board
(`Run.svelte`, `.verdict-keys`), and that key goes straight to the title.

When a beat moves, the table in README.md moves with it.
