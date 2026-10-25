// ── draw: the drawing stands up ──────────────────────────────────────────────
// At home the picture IS the drawing: the site's six layers as flats, over
// the solids with no depth test, so from the eye they cover the model exactly
// where the drawing is. As the lens leaves the eye on the dolly zoom the
// perspective opens — the flats, hung at the drawing's own depths, part from
// one another as the parallax grows — and they fade as they part, so the
// picture dissolves into the model under it. Then an easy loop, like orbit's
// but gentler and round one side only: wide at the front, a little under
// (the floor seen edge-on, the orange underside of the ceiling over the
// room), round the right side past the bed, a little over (down into the
// room over the ceiling's front edge), and back to the front; and the dolly
// zoom home, the flats fading back in over it as the perspective closes, so
// the last frame is the drawing again. A touch of roll with the loop's tilt,
// none at home.
//
// The loop is one tilted circle on the sphere round the room's middle:
// azimuth one hump out to the right, elevation one sine (under first, then
// over), both read along the loop's own smoothed parameter, which is at rest
// at both ends, so the path leaves home along the dolly's line with no kink.
// The flats' alpha is 1 minus the dolly's own parameter. Every frame is a
// function of u.

export const seconds = 14;

const FOV1 = 68; // the wide lens the dolly zoom arrives at
const WIDEN = 3; // and a touch wider round the side, nearest the slabs
const IN = [0, 0.16]; // the dolly in, in progress
const OUT = [0.84, 1]; // the dolly out
const LOOP = [0.13, 0.87]; // the loop's own window: a touch over the dollies
const AZ = 0.95; // how far round the right side (radians)
const EL_UNDER = 0.4; // down: the lens at the floor's level
const EL_OVER = 0.32; // up: the lens over the ceiling's front edge
const REACH = 0.4; // how much further out the lens is round the side
const ROLL = 0.06; // ≈ 3.5°, with the tilt
const LOOK = 0.14; // the look point lifts from under, drops from over

// The dolly's own parameter: 0 at home, 1 through the loop.
const dollyF = (u, smooth, span) =>
	u < 0.5 ? smooth(span(u, IN[0], IN[1])) : smooth(span(u, OUT[1], OUT[0]));

export function pose(u, api) {
	const { lerp, smooth, span, TAU, FOV0, T, dist, orbitAt } = api;
	const f = dollyF(u, smooth, span);
	const s = smooth(span(u, LOOP[0], LOOP[1]));
	const fovDolly = lerp(FOV0, FOV1, f);
	const side = Math.sin(Math.PI * s); // 0 at the front, 1 round the side
	const w = Math.sin(TAU * s); // + through the first half (under), − the second (over)
	const az = AZ * side;
	const el = -w * lerp(EL_UNDER, EL_OVER, smooth(span(s, 0.35, 0.65)));
	// The sphere: the dolly's end exactly at both ends of the loop, a little
	// further out and a touch wider round the side.
	const R = dist(fovDolly) - T[2] + REACH * side * side;
	const fov = fovDolly + WIDEN * side * side;
	const look = [T[0], T[1] + LOOK * w, T[2]];
	return { fov, pos: orbitAt(az, el, R), look, roll: ROLL * w };
}

export function act(u, api) {
	const { smooth, span, flats } = api;
	// The drawing over the model at home, gone through the loop.
	flats(1 - dollyF(u, smooth, span));
}
