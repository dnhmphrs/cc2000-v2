# Working agreements

## Always open the PR

When a round of work is finished, **open a pull request to `main` without being
asked**. Do not stop at "pushed to the branch" and wait for someone to say "PR" —
that ask has been made once, standing, and it covers every round from here on.

Work goes on `fullflow-v4`. If the PR for that branch has already been merged,
the follow-up is a NEW PR: restart the branch from the latest `main`, keeping any
unmerged commits by rebasing them onto it rather than stacking on merged history.

## Do not open it on unverified work

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

Scene keys are the dev harness's own: `2` flyIn, `3` conception, `4` computation,
`5` room. `1` restarts the run from the title card. They are bound BY NAME in
Dev.svelte rather than by position in `ORDER` — `ORDER` lost the calculator in
this build and indexing into it would slide every key down one, silently
repointing every PLAN in this file and in `verify.mjs`.

A `?at=` pin suppresses the two mid-flight popups, or every contact sheet past
`askDob` comes back with a dialog across it.

Two traps that have already cost a round each:

- **A seek is not a run.** Jumping into a scene runs `lattice.reset()` first, so
  anything a scene inherits from the one before it — rather than setting from its
  own progress — is absent in a seeked frame and present in a real run. If a
  screenshot is the evidence for a claim, check the claim survives BOTH.
- **The middle three scenes are one shot.** fly-in at 1 and conception at 0 must
  be the same picture, and so must conception at 1 and computation at 0. Diff
  them pixel-wise rather than eyeballing; a mean delta around 1/255 is the
  anti-aliasing on thirty thin lines, anything more is a real seam.

Write scratch scripts and screenshots to the scratchpad, never into `scripts/`.
A script living there cannot resolve the project's `node_modules`, so import by
absolute path: `from '/home/user/cc2000-v2/node_modules/playwright/index.mjs'`.

## This build has no machine

`src/lib/scenes/Calculator.svelte` is still in the tree and is imported by
nothing. The run opens on a title card (`scenes/Prelude.svelte`) over a fly-in
that is ALREADY MOUNTED and held at progress zero — black over black — and the
two answers the machine used to take are taken mid-flight by popups
(`components/Prompt.svelte`).

The one thing holding all of that together is the `gate` store: while it is
non-null the fly-in holds `t` and keeps advancing `elapsed`, so the swimmer goes
on rolling and the scene waits rather than freezing. Holding `t` rather than
running a second clock is what keeps every frame a pure function of progress.

Two consequences worth remembering:

- **The answer resolves mid-flight**, not before it. The date is proved
  answerable when the first popup closes and the archive is asked properly when
  the second does. An out-of-range date is refused IN the popup — there is no
  machine to report it on and no room to fall into.
- **The loop home has no DOM half.** The camera flies through the room's monitor
  and `Computation.stepReturn()` hands the run to the fly-in when the glass has
  filled the frame. The glass is black and so is the air behind it, so there is
  nothing to cover the cut with because there is no cut to see.
