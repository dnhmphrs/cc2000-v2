# The run at `/next` (cut H), timed, and how it hangs together

Version 0.18. The run is 52 s; `?at=` is seconds ÷ 52. The run is 62 s; `?at=` is seconds ÷ 62. Every number below is
the beat table `B` in `src/lib/lab/flow-strand-sketch.js` or a row of
`src/lib/lab/log/sketch-copy.js` (the words, editable there).

## The parts, timed

| part                   | from | to   | length          | what happens                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---- | ---- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                  | 0    | 5.1  | 5 s             | the terminal types the title                                                                                                                                                                                                                                                                                          |
| Entry                  | 5.4  | 15.3 | 10 s            | the strand drawn as the date is typed; the spice asked; the questions go at 14.7 – 15.3                                                                                                                                                                                                                               |
| Compile                | 15.3 | 22.2 | 7 s             | COMPILING USER GENETICS: the reading frame 5′ → 3′ 16.0 – 18.3 (quicker than it was, slower than 17.8), the strand closes onto the axis 18.7 – 19.9, the rope down the tail, the body 20.4 – 22; alive at 22.2                                                                                                        |
| Swim                   | 22.2 | 28.7 | 6.5 s           | the hand comes into the lines; the swimmer sets off at 22.5; the lens round behind it 22.6 – 25.2, onto the axis 25.6 – 28.4; the rings sketched in 23.1 – 26.2, the speed lines from 24.2, the glint 24 – 26                                                                                                         |
| **Tunnel A: the date** | 27.2 | 36.8 | 9.5 s           | the sum 27.2 – 28.75 (the birthday, and dumb mod arithmetic on it struck through); the count 266 → 1 struck one by one (first strike 29.2, last 35.0), the months crossed off, the years back from now in the cloud 29.0 – 32.8; the tunnel narrows into the band 32.6 – 35.0; the date on the band 35.0, ringed 35.6 |
| The dive               | 36.8 | 37.7 | 1 s             | the hole punched through the band, the date bursting out, the first room through it                                                                                                                                                                                                                                   |
| **Through the band**   | 36.8 | 42.0 | 5 s             | no tunnel B: the room through the band is the last, a speck swum up on since 28.4 and 0.15 h tall at the dive; the swimmer gone into the band's flash; the lens comes to rest inside the room (cut G, `?v=g`, keeps tunnel B: five rooms, the tesseract, the questions)                                               |
| Landing                | 40.0 | 42.0 | 2 s             | the lens slows to rest inside the last room; the screen switches on 41.0                                                                                                                                                                                                                                              |
| The sun                | 42.2 | 45.1 | 3 s             | the white blooms out of the screen over 1 s and holds to 43.5; a plain veil lifts evenly off the coloured room over 1.6 s                                                                                                                                                                                             |
| The colour             | 42.9 | 43.4 | under the white | the last room floods to full colour while the white covers everything; the song, its artist and the date held on the screen from 44.0                                                                                                                                                                                 |
| The room               | 46   | 52   | 6 s             | the glow goes altogether and the boil nearly stills; the run HOLDS at 52 — the room sways on, the depths part after the pointer; PLAY opens the song on Spotify; AGAIN: the words fade, the monitor goes dark, the lens dollies on through the glass (no swimmer), to the dark the next title types on                |

Journey (swim → hit): 20 s. The whole run: 52 s.

## How it hangs together

**One camera, one zoom.** From the swim to the landing the lens only ever
gathers speed: the swim's own pace, the zoom at the fall's opening rate from
30 s, the fall through the rooms at that rate, easing only to land inside the
last room. Nothing stops or restarts at the dive; the first room is the speck
in the glint from ~29 s, growing at the tunnel's rate, so what the band opens
on is the room the swimmer has been swimming at all along.

**Two tunnels, two questions.** Tunnel A answers WHEN: no slam opens it (the
266 days gave the trick away; a mod sum in its place was worse) — the mass
of flying figures, days and months, struck off as they are used, and the band
the answer comes to rest on. Tunnel
B answers WHAT SONG: the same hand, the same red pencil, but the workings are
the machine's idea of what matters — the parents' steaminess as a chart
position, where and the lights, what mum wore and what dad had done, what he
said, the precautions — things it has no business knowing — and the song is NOT named there: it comes only on the lit screen after the
flash, and stays. The caption at the bottom says which tunnel you are in
(SIMULATING CONCEPTION, then COMPUTING SOUNDTRACK).

**The picture turns horizontal at the date and stays so.** The circles narrow
into the band for tunnel A's end; the dive tears the white off, but the rings'
long runs above and below the middle, and the speed lines spraying out of the
seam, go on all the way down tunnel B — the rooms hang in that slot — and let
go only as the lens lands. It never goes back to circles.

**Tunnel B asks questions.** Not how the song is worked out but the
specifics — where, the lights and the door, what mum wore, what dad said —
each a list the date picks from, and each answer turns the swimmer a
different way, so every date swims a different path through the tesseract.

**A verdict** (a birthday before the archive, after it, or a week it has
no chart for) is the same run: the steaminess, then the search failing over
the rooms in the same chalk, the sun, and the room left in chalk with the
verdict's gif playing on its screen and the verdict held over it.

**The end.** The sun takes about a second to bloom and holds a beat; the
way back is a plain veil of white lifting evenly over 1.6 s off the room
already in full colour — no burn, no depth fade — the rays staying. The
song and the date are the last words, held on the lit screen; the run holds
there, the hand still boiling.

- The words: every slam and the years row are rows in `log/sketch-copy.js`;
  `MUM` and `DAD` are lists there; `HEADLINES` the year's news.
- The count's pace: `COUNT` in the sketch (the strikes' seconds, exact to the
  day); the band: `B.seam`, `B.conceived`, `B.dive`.
- The slot: `fallRings` (`sx`, `hs`) and the `slot` passed to `rush` in
  `fallen`.
- The sun: `lightAt` (the bloom's length, `HOLD`, the burn's time constants,
  the rays' and core's floors); the colour's timing `B.colour`.
- The landing depth: `INSIDE`, `FILL`.
