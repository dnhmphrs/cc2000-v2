// ── inside: into the room ────────────────────────────────────────────────────
// Out of the elevation on the dolly zoom to a wide lens at the open front,
// then IN: over the bed's foot, drifting up and left to the room's middle and
// looking UP — the orange underside of the ceiling filling the top of the
// frame, the wall and its posters under it (the reel's shot from inside) —
// then turning down and right to the desk, the tower close, and panning left
// along it past the monitor to the lamp, up the wall to the clock and the
// posters, settling at the front-right corner with a touch of roll — the
// ceiling's orange band over the wall, the furniture in the lower half (the
// reel's corner view) — and backing out through the front, turning to face
// the room square as the lens leaves, and home on the dolly zoom. Wide
// throughout inside; the lens stays in the open air, above the bed and in
// front of the desk, under the ceiling.
//
// The path and the lens's yaw, pitch and roll are one Hermite spline through
// a few keys, read along the loop's own smoothed parameter: the tangents
// inside are the chords between neighbours, and at home the path runs along
// the axis — in, continuing the dolly's line, and out again into it — so the
// lens turns round at home with no hook. Every frame is a function of u.

export const seconds = 16;

const FOV1 = 70; // the wide lens the dolly zoom arrives at
const WIDEN = 6; // and wider still through the middle of the room
const IN = [0, 0.14]; // the dolly in, in progress
const OUT = [0.86, 1]; // the dolly out
const LOOP = [0.04, 0.96]; // the walk's own window: well over the dollies, so the
// walk is already moving as the dolly lands and nothing hovers at the seam

// Keys: [s, x, y, z, yaw, pitch, roll] — where the lens stands, in room
// units (x across, y up: the floor −1, the ceiling 1; z toward the viewer:
// the front 0, the wall −3), and where it looks: yaw positive to the right,
// pitch positive up, roll positive clockwise, all 0 at home. The first and
// last keys are home: the dolly's end on the axis at the open front, whose z
// the api gives (HOME here, filled in when the loop is read). The keys' s is
// the walk's own smoothed parameter, which lingers at both ends of its window
// and runs through the middle, so they are set by the loop's u (noted) and
// read off smooth(span(u, LOOP)).
const HOME = null;
const KEYS = [
	[0.0, 0.0, 0.0, HOME, 0.0, 0.0, 0.0], // home: the dolly's end, square on
	[0.097, 0.6, -0.08, -0.05, -0.12, 0.22, 0.04], // u 0.22: in over the bed's foot, lifting its eyes
	[0.242, 0.05, 0.2, -1.0, 0.0, 0.45, 0.0], // u 0.34: the room's middle, looking up at the ceiling
	[0.442, 0.5, 0.32, -1.1, 0.18, -0.2, -0.06], // u 0.46: down and right to the desk: the tower close
	[0.596, 0.7, 0.3, -1.15, -0.52, -0.32, -0.08], // u 0.56: panning left along the desk: monitor, lamp
	[0.741, 0.85, 0.42, -0.9, -0.46, 0.22, 0.08], // u 0.65: up the wall to the clock and the posters
	[0.851, 1.1, 0.5, -0.5, -0.32, -0.05, 0.14], // u 0.74: the front-right corner, a touch rolled
	[0.963, 0.4, 0.2, 0.55, -0.1, -0.02, 0.04], // u 0.85: backing out through the front
	[1.0, 0.0, 0.0, HOME, 0.0, 0.0, 0.0] // home
];

// The Hermite spline through KEYS: chord tangents inside; at the ends the
// position's tangent lies along the axis (in at the start, out at the end,
// as long as the first and last chords) and the angles' is 0. `z0` is home's
// z, the dolly's end.
const N = KEYS.length - 1;
const val = (i, c, z0) => (KEYS[i][c] === HOME ? z0 : KEYS[i][c]);
function tangent(i, c, z0) {
	if (i === 0 || i === N) {
		if (c !== 3) return 0;
		const j = i === 0 ? 1 : N - 1;
		const d = [1, 2, 3].map((k) => val(j, k, z0) - val(i, k, z0));
		const len = Math.hypot(...d) / Math.abs(KEYS[j][0] - KEYS[i][0]);
		return i === 0 ? -len : len;
	}
	return (val(i + 1, c, z0) - val(i - 1, c, z0)) / (KEYS[i + 1][0] - KEYS[i - 1][0]);
}
function key(s, z0) {
	let i = 0;
	while (i < N - 1 && s >= KEYS[i + 1][0]) i++;
	const t0 = KEYS[i][0];
	const h = KEYS[i + 1][0] - t0;
	const t = (s - t0) / h;
	const h00 = (1 + 2 * t) * (1 - t) * (1 - t);
	const h10 = t * (1 - t) * (1 - t);
	const h01 = t * t * (3 - 2 * t);
	const h11 = t * t * (t - 1);
	const out = [];
	for (let c = 1; c <= 6; c++)
		out.push(
			h00 * val(i, c, z0) +
				h10 * h * tangent(i, c, z0) +
				h01 * val(i + 1, c, z0) +
				h11 * h * tangent(i + 1, c, z0)
		);
	return out;
}

export function pose(u, api) {
	const { smooth, span, T, dolly } = api;
	const f = u < 0.5 ? smooth(span(u, IN[0], IN[1])) : smooth(span(u, OUT[1], OUT[0]));
	const s = smooth(span(u, LOOP[0], LOOP[1]));
	const { fov: fovDolly, pos: pd } = dolly(f, FOV1);
	// The walk, from the dolly's end: its keys are absolute, home among them,
	// so the walk is an offset from home that the dolly's own position carries.
	const z0 = dolly(1, FOV1).pos[2];
	const [x, y, z, yaw, pitch, roll] = key(s, z0);
	const pos = [pd[0] + x, pd[1] + y, pd[2] + (z - z0)];
	// Wider through the middle of the room, where the lens is nearest everything.
	const fov = fovDolly + WIDEN * Math.sin(Math.PI * s) ** 2;
	// The line of sight; the look point along it far enough that at home, on
	// the axis, it is the room's middle, as the elevation's is.
	const cp = Math.cos(pitch);
	const L = Math.max(1, pos[2] - T[2]);
	const look = [
		pos[0] + Math.sin(yaw) * cp * L,
		pos[1] + Math.sin(pitch) * L,
		pos[2] - Math.cos(yaw) * cp * L
	];
	return { fov, pos, look, roll };
}
