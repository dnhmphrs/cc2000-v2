// ── swing: the reel's low rolled corner shots ────────────────────────────────
// Out of the elevation on the dolly zoom to a wide lens at the frame, then a
// swing round the room's open front on a sphere whose centre sits a little IN
// FRONT of the frame, so the low shot looks up into the box over the floor's
// front edge rather than at the slab's underside alone: down and RIGHT, the
// lens outside the floor slab's front-right corner and under its level,
// rolled, looking up and across the room past the bed's corner (the bed stands
// at the right front: it is this room's sofa, the thing huge and near); across
// the front staying low; up and LEFT to outside the ceiling slab's front-left
// corner, looking down across the room past it, rolled the other way; and
// back through the middle to the frame, and home on the dolly zoom. The roll
// is the point: it swings with the path — the sine of the loop's own
// parameter, as the azimuth does — and is 0 at home.
//
// The lens rounds each corner MOVING: its height LAGS its reach, so it is
// still dropping as it passes the low corner and bottoms out on the way back
// across the front, and still climbing as it passes the high one — a path
// with no cusp, not a pendulum's stop at the end of its swing. The corners
// are outside the slabs (they run to x ±1.97): from there the look passes
// BESIDE the slab, so both its faces meet at the corner at the frame's edge
// and the room is seen past it, as the reel's corner shots are built.

export const seconds = 14;

const A = 0.13; // the dolly in and out, each, in progress
const FOV1 = 82; // the wide lens at the frame
const CZ = 0.35; // the swing's centre: a little in front of the frame plane
const REACH_LOW = 1.5; // how much further out than the dolly's end the low half swings (R ≈ 2.5)
const REACH_HIGH = 1.8; // and the high half: wider, to see the whole box from over its corner
const AZ = 1.45; // how far round, right and left (radians): nearly beside the room
const EL_LOW = 0.6; // down: the lens under the floor slab's bottom
const EL_HIGH = 0.6; // up: the lens over the ceiling slab's top
const ROLL = 0.42; // ≈ 24°, at the corners
// The swing looks this far toward the lens's own side at the corners, so it
// looks diagonally across the room past the slab's corner rather than at the
// far wall; and at the room's middle from below, so the floor's corner sits
// in the lower third of the frame with the bed over it and the ceiling's
// underside across the top, and this much under the middle from above, so
// the floor and what stands on it fill the frame under the ceiling's corner.
const LOOK_X = 0.3;
const LOOK_LOW = 0;
const LOOK_HIGH = 0.5;

// A smooth plateau in s: 0 before a, up to 1 by b, 1 until c, down to 0 by d.
const plateau = (smooth, span, s, a, b, c, d) =>
	smooth(span(s, a, b)) * (1 - smooth(span(s, c, d)));

export function pose(u, api) {
	const { lerp, smooth, span, TAU, dolly, T } = api;
	// The dolly's own parameter, 1 through the swing; the swing's, at rest at
	// both ends.
	const f = u < A ? smooth(span(u, 0, A)) : u > 1 - A ? smooth(span(u, 1, 1 - A)) : 1;
	const s = smooth(span(u, A, 1 - A));
	const { fov, pos } = dolly(f, FOV1);

	// The sphere: the dolly's end exactly at s = 0 and 1 (its radius reaches
	// from the centre to the lens on the axis), swung wider through the middle
	// — and wider still through the high half.
	const out = plateau(smooth, span, s, 0, 0.18, 0.84, 1);
	const half = smooth(span(s, 0.44, 0.72)); // 0 through the low half, 1 the high
	const R = pos[2] - CZ + lerp(REACH_LOW, REACH_HIGH, half) * out;
	// Round: right through the first half, left through the second.
	const swing = Math.sin(TAU * s);
	const az = AZ * swing;
	// Down through the first half — still dropping as the reach peaks at a
	// quarter in, lowest on the way back across the front — then up through
	// the second, still climbing as the reach peaks at three quarters,
	// highest on the way back, and level again for home.
	const low = plateau(smooth, span, s, 0.04, 0.32, 0.4, 0.64);
	const high = plateau(smooth, span, s, 0.56, 0.8, 0.88, 1);
	const el = -EL_LOW * low + EL_HIGH * high;
	const roll = -ROLL * swing;

	const P = [
		R * Math.sin(az) * Math.cos(el),
		R * Math.sin(el),
		CZ + R * Math.cos(az) * Math.cos(el)
	];
	// At the room's middle on the axis, where home is; pulled toward the
	// lens's side and under the middle through the swing.
	const look = [LOOK_X * swing * out, -lerp(LOOK_LOW, LOOK_HIGH, half) * out, T[2]];
	return { fov, pos: P, look, roll };
}
