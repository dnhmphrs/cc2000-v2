// ── sheet: the drawing set ───────────────────────────────────────────────────
// The same room in the three classical projections and back, as a sheet of
// drawings is laid out: the PERSPECTIVE from its eye (home, captioned as the
// lens settles), then the lens rises over the open front to look STRAIGHT
// DOWN — the PLAN, the floor slab framed, the ceiling lifted away so the plan
// shows the furniture — rests, then round over the front-right corner and
// down to the room's right side, level, looking straight at it from +x —
// the SECTION: the slabs edge-on, the bed and the desk in profile, the wall
// at the right edge — rests, and sweeps back round the front to home. The
// long lens throughout (12–16°, the lens twelve units out) so every view
// reads as a drawing, not a shot; at each rest the lens is exactly on an
// axis; a caption only at rest, never two at once; roll 0 everywhere.
//
// The lens rides a sphere of radius ≈ 12 about a centre that drifts between
// the room's middle (home), the floor's middle (the plan) and the room's
// side-on middle (the section), so it clears the slabs by ten units all the
// way round. The ceiling is lifted CLEAR OF THE LENS — not a few units,
// which would leave the slab between the lens and the floor and the plan
// would show its tan top alone — up out of the top of the frame as the lens
// rises, timed so the slab is well above the lens before the lens comes over
// the room, and back down into place as the lens leaves the plan and levels
// to the section. Every frame is a function of u.

export const seconds = 18;

const FOV_PLAN = 16; // the plan: 7% round the floor slab from 12.2 up
const FOV_SIDE = 14.5; // the section: the slabs' NEAR edges, two units closer, top to bottom
const R = 12.2; // the lens's distance from the sheet's centres
const TOP = Math.PI / 2 - 0.002; // straight down, a tenth of a degree off the pole:
// the lens's up stays in the xy plane (the sketch's roll), so a hair of lean
// over the front is what keeps the wall at the top of the plan.
const PLAN_C = [0, -1, -1.5]; // the floor's middle, on its top
const SIDE_C = [0, 0.06, -1.54]; // the room's middle, side on: slab to slab, front to wall

// The loop's windows, in u.
const RISE = [0.09, 0.3]; // home up over the front to the plan
const PLAN = [0.3, 0.42]; // at rest over the room
const ROUND = [0.42, 0.6]; // over the front-right corner and down to the side
const SIDE = [0.6, 0.72]; // at rest at the right
const SWEEP = [0.72, 0.95]; // round the front to home

// The ceiling: up and clear of the lens before it comes over the room, down
// again once it has left — the lens is within the slab's footprint only
// above 79° of elevation, u ≈ 0.25…0.46.
const LIFT = 11.5; // the slab's underside 1.3 over the plan lens
const LIFT_UP = [0.09, 0.24];
const LIFT_DOWN = [0.46, 0.585];

// The captions: in over half a second as the lens settles, out as it goes.
const CAP_IN = 0.028;
const CAP_OUT = 0.03;

// A key: where the lens is on its sphere, and the lens.
const key = (az, el, r, C, fov) => ({ az, el, r, C, fov });
const mix = (a, b, t, lerp) =>
	key(
		lerp(a.az, b.az, t),
		lerp(a.el, b.el, t),
		lerp(a.r, b.r, t),
		[0, 1, 2].map((k) => lerp(a.C[k], b.C[k], t)),
		lerp(a.fov, b.fov, t)
	);

export function pose(u, api) {
	const { lerp, smooth, span, FOV0, D0, EYE, T, orbitAt } = api;
	const home = { fov: FOV0, pos: EYE, look: [0, 0, T[2]], roll: 0 };
	if (u <= RISE[0] || u >= SWEEP[1]) return home;
	const HOME = key(0, 0, D0 - T[2], T, FOV0);
	const PLANK = key(0, TOP, R, PLAN_C, FOV_PLAN);
	const SIDEK = key(Math.PI / 2, 0, R, SIDE_C, FOV_SIDE);
	let k;
	if (u < RISE[1]) k = mix(HOME, PLANK, smooth(span(u, RISE[0], RISE[1])), lerp);
	else if (u < PLAN[1]) k = PLANK;
	else if (u < ROUND[1]) k = mix(PLANK, SIDEK, smooth(span(u, ROUND[0], ROUND[1])), lerp);
	else if (u < SIDE[1]) k = SIDEK;
	else k = mix(SIDEK, HOME, smooth(span(u, SWEEP[0], SWEEP[1])), lerp);
	return { fov: k.fov, pos: orbitAt(k.az, k.el, k.r, k.C), look: k.C, roll: 0 };
}

// A plateau in u: up over [a, b], down over [c, d].
const plateau = (smooth, span, u, a, b, c, d) =>
	smooth(span(u, a, b)) * (1 - smooth(span(u, c, d)));

export function act(u, api) {
	const { smooth, span, parts, caption } = api;
	// The ceiling, lifted away and put back. The parts are at home already.
	const lift = LIFT * plateau(smooth, span, u, LIFT_UP[0], LIFT_UP[1], LIFT_DOWN[0], LIFT_DOWN[1]);
	if (parts.ceiling) parts.ceiling.position.y += lift;
	// One caption at a time, at rest only.
	const rest = (num, title, a, b) => {
		const alpha = plateau(smooth, span, u, a, a + CAP_IN, b - CAP_OUT, b);
		if (alpha > 0) caption(num, title, alpha);
		return alpha > 0;
	};
	rest('02', 'PERSPECTIVE', 0, RISE[0] + 0.01) ||
		rest('01', 'PLAN', PLAN[0], PLAN[1]) ||
		rest('03', 'SECTION', SIDE[0], SIDE[1]);
}
