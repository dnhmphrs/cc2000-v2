# Working agreements

## Always open the PR

When a round of work is finished, **open a pull request to `main` without being
asked**. Do not stop at "pushed to the branch" and wait for someone to say "PR" —
that ask has been made once, standing, and it covers every round from here on.

Work goes on `fullflow-v2`. If the PR for that branch has already been merged,
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
`5` room.

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
