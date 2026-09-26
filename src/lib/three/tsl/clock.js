import { uniform } from 'three/tsl';

// ── The run's clock, as uniforms ─────────────────────────────────────────────
// Two numbers every scene writes and the CRT pass reads (three/tsl/crt.js):
//
//   runClock  nominal seconds into the run — config/timing.js runSeconds(),
//             the same clock the hand on the camera is on — set by each
//             scene's set(p), so it is a pure function of progress and a pin
//             is exact, and advanced by real dt only where the run is held
//             on a frame that is not a function of progress (the room, the
//             verdict, the way home).
//   crtGain   how hard the signal is faulting: 1 for the run, more in the
//             breakdown (world/kaleido.js), 0 for a clean picture.
export const runClock = uniform(0);
export const crtGain = uniform(1);
