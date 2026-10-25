# Sketch E — the run at `/next`, timed, and how it hangs together

Version 0.15. The run is 62 s; `?at=` is seconds ÷ 62. Every number below is
the beat table `B` in `src/lib/lab/flow-strand-sketch.js` or a row of
`src/lib/lab/log/sketch-copy.js` (the words, editable there).

## The parts, timed

| part                   | from | to   | length | what happens                                                                                                                                                                                                                         |
| ---------------------- | ---- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Title                  | 0    | 5.1  | 5 s    | the terminal types the title                                                                                                                                                                                                         |
| Entry                  | 5.4  | 15.3 | 10 s   | the strand drawn as the date is typed; the spice asked; the questions go at 14.7 – 15.3                                                                                                                                              |
| Compile                | 15.3 | 22.2 | 7 s    | COMPILING USER GENETICS: the reading frame 5′ → 3′ 16.0 – 17.8 (quicker), the strand closes onto the axis 18.2 – 19.4, the rope down the tail, the body 20 – 22; alive at 22.2                                                       |
| Swim                   | 22.2 | 28.7 | 6.5 s  | the hand comes into the lines; the swimmer sets off at 22.5; the lens round behind it 22.6 – 25.2, onto the axis 25.6 – 28.4; the rings sketched in 23.1 – 26.2, the speed lines from 24.2, the glint 24 – 26                        |
| **Tunnel A: the date** | 28.7 | 36.8 | 8 s    | the count 266 → 1 struck one by one (first strike 29.2, last 35.0), the months crossed off, the years back from now in the cloud 29.0 – 32.8; the tunnel narrows into the band 32.6 – 35.0; the date on the band 35.0, ringed 35.6   |
| The dive               | 36.8 | 37.7 | 1 s    | the hole punched through the band, the date bursting out, the first room through it                                                                                                                                                  |
| **Tunnel B: the song** | 36.8 | 51.6 | 15 s   | the rooms rush past inside the slot (a crossing every ~1.4 s, eleven of them); over them, in chalk: STEAMINESS 38.3, where and the lights 40.1, mum and dad 41.9, what he said and the precautions 43.7, THE SONG 45.3 (ringed 46.0) |
| Landing                | 51.6 | 53.6 | 2 s    | the lens slows to rest inside the last room; the slot's lines let go 50.8 – 52.2; the screen switches on 52.4                                                                                                                        |
| The sun                | 53.7 | ~58  | 4.5 s  | the light swells from 51.7; the white blooms out of the screen over 1 s and holds to 55.0; burns out over ~3 s (the room in chalk under the beams)                                                                                   |
| The colour             | 55.0 | 58.8 | 4 s    | fades in by depth: the bed first, the wall last (fall.js's flood); the song, its artist and the date held on the screen from 55.3                                                                                                    |
| Glow                   | 58   | 62   | 4 s    | the rays and the core stay on the screen, breathing; a fade 60.6 – 62; round                                                                                                                                                         |

Journey (swim → hit): 31 s. The whole run: 62 s.

## How it hangs together

**One camera, one zoom.** From the swim to the landing the lens only ever
gathers speed: the swim's own pace, the zoom at the fall's opening rate from
30 s, the fall through the rooms at that rate, easing only to land inside the
last room. Nothing stops or restarts at the dive; the first room is the speck
in the glint from ~29 s, growing at the tunnel's rate, so what the band opens
on is the room the swimmer has been swimming at all along.

**Two tunnels, two questions.** Tunnel A answers WHEN: the mass of flying
figures is the arithmetic done the long way — days, months, years — struck
off as they are used, and the band the answer comes to rest on. The first
thing seen is the cloud itself; there is no slam giving the sum away. Tunnel
B answers WHAT SONG: the same hand, the same red pencil, but the workings are
the machine's idea of what matters — the parents' steaminess as a chart
position, where and the lights, what mum wore and what dad had done, what he
said, the precautions — things it has no business knowing — and the song is named where the original put the date up again and
ringed it. The caption at the bottom says which tunnel you are in
(SIMULATING CONCEPTION, then COMPUTING SOUNDTRACK).

**The picture turns horizontal at the date and stays so.** The circles narrow
into the band for tunnel A's end; the dive tears the white off, but the rings'
long runs above and below the middle, and the speed lines spraying out of the
seam, go on all the way down tunnel B — the rooms hang in that slot — and let
go only as the lens lands. It never goes back to circles.

**The end is slow.** The sun takes about a second to bloom, holds a beat,
and burns out over three; the colour comes in under it over four, from the
nearest things to the wall; the rays never quite go. The song and the date
are the last words, held on the lit screen to the fade.

## Knobs

- The words: every slam and the years row are rows in `log/sketch-copy.js`;
  `MUM` and `DAD` are lists there; `HEADLINES` the year's news.
- The count's pace: `COUNT` in the sketch (the strikes' seconds, exact to the
  day); the band: `B.seam`, `B.conceived`, `B.dive`.
- The slot: `fallRings` (`sx`, `hs`) and the `slot` passed to `rush` in
  `fallen`.
- The sun: `lightAt` (the bloom's length, `HOLD`, the burn's time constants,
  the rays' and core's floors); the colour's timing `B.colour`.
- The landing depth: `INSIDE`, `FILL`.
