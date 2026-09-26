import { WOBBLE, smoothstep } from '$lib/config';

// ── The hand on the camera ───────────────────────────────────────────────────
// One slow pan, tilt and roll for the whole run, on the run's own clock
// (config/timing.js runSeconds), so it is the same hand in space, down the
// tunnel and through the rooms: each scene asks for it at its own progress,
// and the seams carry it because approach 1 and kaleido 0 are the same
// second. It is the camera's OWN rotation — the swimmer rides the camera, so
// it stays where it is and the world leans round it — and it is angular
// rather than a truck, so it is the same lean on a star field a hundred units
// out and on a room a hundredth the size of the last. The numbers are
// config/space.js WOBBLE.

const rad = (d) => (d * Math.PI) / 180;
const term = ([amp, rate, phase], s) => rad(amp) * Math.sin(s * rate + phase);

// How much of the hand is on the camera at `s`: all of it, but for where it
// lets go (WOBBLE.still) — as the set comes up dead ahead, so the set arrives
// centred and level, back again down the tunnel. A function of the run's
// seconds like the rest, so approach 1 and kaleido 0 still agree.
function held(s) {
	const [a, b, c, d] = WOBBLE.still;
	return 1 - smoothstep(a, b, s) * (1 - smoothstep(c, d, s));
}

// The Euler angles — pitch about x, yaw about y, roll about z — at `s`
// nominal seconds into the run, scaled by `k`: 1 everywhere but the landing,
// where the descent takes it to 0 so the glass is square for the readout.
export function wobbleEuler(euler, s, k = 1) {
	const h = k * held(s);
	return euler.set(
		term(WOBBLE.pitch, s) * h,
		term(WOBBLE.yaw, s) * h,
		(term(WOBBLE.roll, s) + term(WOBBLE.roll2, s)) * h,
		'YXZ'
	);
}
