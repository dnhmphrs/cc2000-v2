// ── explode: the exploded diagram ────────────────────────────────────────────
// Out of the elevation on the dolly zoom to a wide lens at the open front,
// then up and to the left on a slow arc across the room's front — high, looking
// down into it over the ceiling's front edge — while the room comes apart
// along its own construction: the ceiling slab up, the floor down, the wall
// back, the desk's top up and its drawers out, the monitor's tube back and
// its screen forward, the blanket and the pillow up off the bed, the posters
// off the wall — every part out along its explode vector — held apart as the
// lens passes over the front at its highest, and home again, part by part
// together, as the lens comes down on the right; then the dolly zoom home.
// The construction lines STAY: the parts slide along them, the lines marking
// where each one goes, as a diagram's do. The lens pulls out a little and
// widens as the room opens, so the whole stack — the lifted ceiling, the
// dropped floor — is in the frame at the top of the arc.
//
// The arc: azimuth one sine over the loop's own parameter (left first, then
// right), elevation up to EL and held there over the middle of the sweep; the
// parameter is at rest at both ends, so the arc leaves home along the dolly's
// own line with no kink.
// Every frame is a function of u: the explode's k is a plateau in u, and the
// lines are put back where they were from the room at home each frame.

export const seconds = 14;

const FOV1 = 60; // the wide lens the dolly zoom arrives at
const WIDEN = 6; // and wider still at the top of the arc, with the room apart
const REACH = 1.5; // how much further out the lens is at the top of the arc
const IN = [0, 0.15]; // the dolly in, in progress
const OUT = [0.85, 1]; // the dolly out
const LOOP = [0.12, 0.88]; // the arc's own window: a touch over the dollies
const AZ = 0.5; // how far round, left then right (radians)
const EL = 0.55; // how high: looking down into the room at ≈ 30°
// The explode, in progress: 0 until K[0], 1 by K[1], held to K[2], 0 by K[3]
// — whole again before the dolly zoom home.
const K = [0.18, 0.4, 0.6, 0.82];
const LINES_STAY = true; // the construction lines keep their place as the parts move
const LOOK_UP = 0.1; // the look point lifts this much at the top of the arc
// The top of the arc, in the arc's own parameter: up from TOP[0], there by
// TOP[1], held to TOP[2], down by TOP[3] — so the lens is high for the whole
// of the hold, while the azimuth sweeps it from the left to the right.
const TOP = [0.08, 0.35, 0.65, 0.92];

// A smooth plateau: 0 before a, up to 1 by b, 1 until c, down to 0 by d.
const plateau = (smooth, span, x, a, b, c, d) =>
	smooth(span(x, a, b)) * (1 - smooth(span(x, c, d)));

export function pose(u, api) {
	const { smooth, span, TAU, T, dist, dolly, orbitAt } = api;
	const f = u < 0.5 ? smooth(span(u, IN[0], IN[1])) : smooth(span(u, OUT[1], OUT[0]));
	const s = smooth(span(u, LOOP[0], LOOP[1]));
	const { fov: fovDolly } = dolly(f, FOV1);
	const top = plateau(smooth, span, s, ...TOP);
	const az = -AZ * Math.sin(TAU * s);
	const el = EL * top;
	// The sphere: the dolly's end exactly at both ends of the arc, further out
	// and wider over its top, where the stack is tallest, the look point a
	// touch up so the lifted ceiling and the dropped floor both sit in frame.
	const R = dist(fovDolly) - T[2] + REACH * top;
	const fov = fovDolly + WIDEN * top;
	const look = [T[0], T[1] + LOOK_UP * top, T[2]];
	return { fov, pos: orbitAt(az, el, R), look, roll: 0 };
}

// Scratch for the lines: this frame's lines, their home world matrices (read
// off the room at home each frame — the sketch resets the room before act),
// and two matrices.
const rays = [];
const homes = new WeakMap();
let inv = null;
let loc = null;

export function act(u, api) {
	const { smooth, span, explode, room, THREE } = api;
	const k = plateau(smooth, span, u, ...K);
	if (!LINES_STAY) {
		explode(k);
		return;
	}
	if (!inv) {
		inv = new THREE.Matrix4();
		loc = new THREE.Matrix4();
	}
	// The room is at home: put every construction line back at its part's
	// origin and note where in the world that is.
	rays.length = 0;
	room.traverse((o) => {
		if (!o.userData.ray) return;
		o.position.set(0, 0, 0);
		rays.push(o);
		if (!homes.has(o)) homes.set(o, new THREE.Matrix4());
	});
	room.updateMatrixWorld(true);
	for (const o of rays) homes.get(o).copy(o.matrixWorld);
	explode(k);
	if (k <= 0) return;
	// The parts have moved; move each line back, in its part's own frame, to
	// where it was.
	room.updateMatrixWorld(true);
	for (const o of rays) {
		inv.copy(o.parent.matrixWorld).invert();
		loc.multiplyMatrices(inv, homes.get(o));
		o.position.setFromMatrixPosition(loc);
	}
}
