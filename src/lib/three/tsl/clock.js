import { uniform } from 'three/tsl';

// ── The run's clock, as a uniform ────────────────────────────────────────────
// Nominal seconds into the run — config/timing.js runSeconds(), the same clock
// the hand on the camera is on — written by each scene's set(p), so it is a
// pure function of progress and a pin is exact, and advanced by real dt only
// where the run is held on a frame that is not a function of progress (the
// room, the verdict, the way home). Read by whatever in a shader has to move
// with the run: the frame of the gif down the tunnel on an edge run
// (world/kaleidoscope.js).
export const runClock = uniform(0);
