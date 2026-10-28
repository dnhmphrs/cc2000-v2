# The run at `/next` (cut L), timed, and how it hangs together

Version 0.23.17: cut L, the swim 11 s (cut to 9.5 in 0.23, a touch longer again in 0.23.17). The run is 44 s; `?at=` is seconds ÷ 44. On the main site this is `/`.

| part       | from | to   | what happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title      | 0    | 5.1  | the terminal types the title                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Entry      | 5.4  | 15.3 | the double helix drawn as the date is typed; the spice asked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Compile    | 16.5 | 23.3 | COMPILING USER GENETICS typed as the lens starts for the reading 16.5 – 17.7, a 0.7 s beat after the spice's trace (1.4 s; the date's 0.7) has run; the reading frame 17.6 – 19.7 over the helix (2.1 s), each codon's own shape flashed in gold and relaxed into the body (the amino-acid generator), the strand onto the axis 19.8 – 21, the rope, the body; alive at 23.3                                                                                                                                                                                                                                                                              |
| Swim       | 23.3 | 27.9 | SIMULATING CONCEPTION (to 33.6); the swimmer sets off at 23.6, the lens round behind 23.7 – 25.7, onto the axis 25.9 – 27.9; the GROOVE sketched in turn by turn 24.2 – 26.7 and fading in over 24.2 – 25.7, the speed lines 25.1 – 27.5                                                                                                                                                                                                                                                                                                                                                                                                                  |
| The groove | 27.9 | 34.2 | the stylus tracks in, 4.6 e-folds, about fifteen turns, gathering all the way, and from 29.7 the dolly zoom: the lens widening to 88° as it closes on the swimmer, the swimmer holding its size while the cone stretches away; the groove winds down a cone cut off at its end, and through the cut, from the first turn, the room at the cone's own perspective: a pinprick at 26 – 28 and LIGHT, a soft star with the beam out of it, the room resolving out of the light as the cut grows (about 31 – 33 s), grown only as it is swum towards, to the fall's first plate at the dive; the lens's rays out of it; no rim, no white, nothing of a record |
| The fall   | 34.2 | 37.2 | the porthole is the plate's inscribed circle from the speck to the landing, grown by the zoom alone — nothing but the room ever inside it — past the board's corners (~36.7 on a laptop and a phone) just before the lens is at rest at 37.2, the room 2.1 boards wide there (ease 1.4); the groove expands with the room's depth, every turn off the board ahead of it; the fall opens at exactly the rate the cut was growing and slows to rest, one zoom across the dive; no white, no flash                                                                                                                                                           |
| The screen | 37.1 | 38.3 | the monitor switches on softly, amber then cream, a touch of warm light raying out of it over the room; the moment the lens is at rest the output is on the glass: YOU WERE CONCEIVED TO, Spotify's bar, SHARE and START AGAIN (`?screen=title` letters the song and the artist on it instead, the bar in the corner)                                                                                                                                                                                                                                                                                                                                     |
| The hold   | 39.7 | 44   | the run holds (the room calmer: the boil at 0.3, the sway at a quarter); the output on the glass; AGAIN: the words fade, the screen goes dark, the lens dollies slowly on through the glass — the room swaying all the way — until the glass covers the board, and the next title types on that dark                                                                                                                                                                                                                                                                                                                                                      |

Cut K's table (0.20, now `?v=k`; 54 s, the record and the needle drop) and cut H's (0.18, `?v=h`) follow.

Cut K. The run is 54 s; `?at=` is seconds ÷ 54.

| part            | from | to   | what happens                                                                                                              |
| --------------- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------- |
| Compile         | 15.3 | 22.2 | COMPILING USER GENETICS, I3's generation: each ring a circle contracted by a digit of the date flashed in gold            |
| The groove      | 28.4 | 41.0 | the label 38.6 – 41.0                                                                                                     |
| The dive        | 41.9 | 42.5 | through the hole: it widens past the board, the white torn off the room                                                   |
| The landing     | 42.2 | 44.4 | the lens to rest inside the last room in chalk; the screen on 43.0 – 43.4, the record up 43.4 – 43.9, the arm 43.9 – 44.5 |
| The needle drop | 44.6 | 47.7 | the flash off the screen, the colour under it, the veil lifting; the song on the screen from 47.0 as the record dims      |
| The hold        | 47.7 | 54   | as L's, the dolly stopping short of the screen's plane                                                                    |

Cut H (0.18, now `?v=h`). The run is 54 s; `?at=` is seconds ÷ 54. Every number below is
the beat table `B` in `src/lib/lab/flow-strand-sketch.js` or a row of
`src/lib/lab/log/sketch-copy.js` (the words, editable there).

## The parts, timed

| part                           | from | to   | length          | what happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------ | ---- | ---- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                          | 0    | 5.1  | 5 s             | the terminal types the title                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Entry                          | 5.4  | 15.3 | 10 s            | the strand drawn as the date is typed; the spice asked; the questions go at 14.7 – 15.3                                                                                                                                                                                                                                                                                                                                                                                                            |
| Compile                        | 15.3 | 22.2 | 7 s             | COMPILING USER GENETICS: the reading frame 5′ → 3′ 16.0 – 18.3 (quicker than it was, slower than 17.8), the strand closes onto the axis 18.7 – 19.9, the rope down the tail, the body 20.4 – 22; alive at 22.2                                                                                                                                                                                                                                                                                     |
| Swim                           | 22.2 | 28.7 | 6.5 s           | the hand comes into the lines; the swimmer sets off at 22.5; the lens round behind it 22.6 – 25.2, onto the axis 25.6 – 28.4; the rings sketched in 23.1 – 26.2, the speed lines from 24.2, the glint 24 – 26                                                                                                                                                                                                                                                                                      |
| **Tunnel A: the conversation** | 28.7 | 42.2 | 13.5 s          | nothing flying but the words: in the middle, one exchange at a time, the evening in the parents' own words — lights on or off 29.0, what are you wearing 31.4, what did you say 33.8, how long have we got / 266 days 36.2, what music do you want / put on that song that gets me in the mood 38.4, above the middle so the room grows beneath them; the room a speck at the apex from 28.4, grown steadily; the tunnel narrows into the band 38.6 – 41.0; the date on the band 41.0, ringed 41.6 |
| **The flash, off the date**    | 42.2 | 45.1 | 3 s             | no beat between: the white blooms straight off the date on the band (the band, the date and the swimmer go under it), the lens lands in the last room under the white (42.2 – 44.4), and the veil lifts off the room landed and in colour                                                                                                                                                                                                                                                          |
| The colour                     | 43.0 | 43.5 | under the white | the last room floods to full colour while the white covers everything; the song, its artist and the date held on the screen from 45.0                                                                                                                                                                                                                                                                                                                                                              |
| The room                       | 47   | 54   | 7 s             | the glow goes altogether and the boil nearly stills; the run HOLDS at 54 — the room sways on, the depths part after the pointer; PLAY opens the song on Spotify; AGAIN: the words fade, the monitor goes dark, the lens dollies on through the glass, short of the screen's plane (no swimmer), to the dark the next title types on                                                                                                                                                                |

Journey (swim → hit): 20 s. The whole run: 54 s.

## How it hangs together

**One camera, one zoom.** From the swim to the landing the lens only ever
gathers speed: the swim's own pace, the zoom at the fall's opening rate from
30 s, the fall through the rooms at that rate, easing only to land inside the
last room. Nothing stops or restarts at the dive; the first room is the speck
in the glint from ~29 s, growing at the tunnel's rate, so what the band opens
on is the room the swimmer has been swimming at all along.

**Cut J (`?v=j`) puts the conversation over the rooms.** The same words
as the run's, but tunnel A is the original 0.11 tunnel (the count 28.7 – 35,
the band, the date on it at 36.8) and the dive opens onto tunnel B as it first
was — the fall through five rooms, 36.8 – 53.6, with no tesseract — the rooms
hung at a slight roll that turns as the lens falls (the way v3's kaleido
turned the archive going down the decades), and the five exchanges over them
at 38.4, 41.0, 43.6, 46.2 and 48.8, the last over the last room; landing
51.6 – 53.6, the flash at 53.7, the song held from 55.3. Its table is
`log/sketch-copy-j.js`; the run is 62 s there.

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
