// ── orbit: once round the room, under it and over it ─────────────────────────
// The reel's main move. Out of the elevation on the dolly zoom to a wide lens
// close to the open front, then one loop round the room: down and under — the
// lens just below the floor slab's level in front of the room, looking up
// through the open front at the orange underside of the ceiling and the
// furniture from below — round the right side, over the top — above the
// ceiling's top and well in front of it, looking down over its front edge
// into the room, the tan top a band across the near foreground and the whole
// room under it, the monitor and the lamp in — down the left side and back to
// the front, and the dolly zoom home. The look point drifts: the room's
// middle, up to the ceiling from under, to the bed as the lens comes round
// the right side, to the desk from over the top. A touch of roll at the
// sides, none at home.
//
// The path is a closed cubic spline through a few waypoints on the sphere
// round the room's middle — azimuth, elevation and a little extra radius at
// the sides and over the top, where the lens has to clear the slabs. Two
// things keep its pace even. At a side waypoint the azimuth doubles back, so
// the Catmull-Rom tangent there — the chord between the knot's neighbours —
// is a third the length of the chords either side of it: the curve came in
// fast, all but stopped and turned in a hook the width of a hand. Each knot's
// tangent keeps that direction but is scaled so the lens's speed through the
// knot is the mean of its speed along the two chords that meet there, which
// opens the hook into a sweep. And the spline is read BY DISTANCE, not by its
// parameter: its length is tabulated once and the loop's one smoothed
// parameter is mapped through the inverse, so the one bell carries the whole
// orbit at one pace, at rest at both ends and C1 everywhere, through home
// too. The look, the fov and the roll stay keyed to the spline's own
// parameter: they belong to places on the path.

export const seconds = 14;

const FOV1 = 72; // the wide lens the dolly zoom arrives at
const IN = [0, 0.15]; // the dolly in, in progress
const OUT = [0.85, 1]; // the dolly out
const LOOP = [0.12, 0.88]; // the orbit's own window: a touch over the dollies

// Waypoints: [s, azimuth, elevation, extra radius]. Azimuth 0 is the front,
// positive to the right; elevation positive is up. The last is the first.
const WAY = [
	[0.0, 0.0, 0.0, 0.0], // home: the front, eye level
	[0.14, 0.12, -0.46, 0.1], // under: just below the floor, in front, looking up
	[0.34, 1.5, -0.1, 0.4], // the right side, a touch low
	[0.54, 0.35, 0.46, 1.0], // over the top: front-right, over the slab's top, far forward
	[0.74, -1.45, 0.12, 0.4], // the left side, a touch high
	[0.9, -0.45, -0.1, 0.1], // coming back to the front, low and left
	[1.0, 0.0, 0.0, 0.0] // home again
];

// The knots wrap round the loop with their s unwrapped, so the tangent
// through home is one tangent.
const N = WAY.length - 1; // segments
const key = (k) => WAY[((k % N) + N) % N];
const S = (k) => key(k)[0] + Math.floor(k / N);
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hermite = (t, p0, m0, p1, m1, h) =>
	(1 + 2 * t) * (1 - t) * (1 - t) * p0 +
	t * (1 - t) * (1 - t) * h * m0 +
	t * t * (3 - 2 * t) * p1 +
	t * t * (t - 1) * h * m1;

// The path, built once, on the first frame, from the sketch's own lens (the
// orbit's radius is the dolly's arrival plus the knot's extra): the spline's
// tangents, then its length, then the inverse — the spline's s at a fraction
// a of the way round — as a cubic Hermite in a through the samples with the
// exact slope 1 / |dP/ds| at each, so it is C1 and the lens's velocity has no
// step at a sample. A cache of a constant: every frame stays a function of u.
const M = 512;
let path = null;
function build({ dist, T, orbitAt }) {
	const R0 = dist(FOV1) - T[2];
	const P = (q) => orbitAt(q[0], q[1], R0 + q[2]); // (az, el, dR) → the lens
	// Tangents: Catmull-Rom's direction, the chord between the knot's
	// neighbours, at the length that puts the lens's speed through the knot
	// at the mean of its speed along the chords either side. The azimuth runs
	// out to each side and back, so at a knot where it turns round its
	// tangent is zero — the lens goes up or down the side and the azimuth
	// turns on its own — where the chord would send it on past the side to
	// turn in a hook.
	const tan = [];
	for (let k = 0; k < N; k++) {
		const q = key(k).slice(1);
		const dir = [1, 2, 3].map((c) => (key(k + 1)[c] - key(k - 1)[c]) / (S(k + 1) - S(k - 1)));
		if ((q[0] - key(k - 1)[1]) * (key(k + 1)[1] - q[0]) < 0) dir[0] = 0;
		const before = dist3(P(q), P(key(k - 1).slice(1))) / (S(k) - S(k - 1));
		const after = dist3(P(key(k + 1).slice(1)), P(q)) / (S(k + 1) - S(k));
		const e = 1e-4;
		const v =
			dist3(P(q.map((x, c) => x + e * dir[c])), P(q.map((x, c) => x - e * dir[c]))) / (2 * e);
		const g = (before + after) / 2 / v;
		tan.push(dir.map((x) => x * g));
	}
	tan.push(tan[0]);
	function way(s) {
		let i = 0;
		while (i < N - 1 && s >= WAY[i + 1][0]) i++;
		const h = WAY[i + 1][0] - WAY[i][0];
		const t = (s - WAY[i][0]) / h;
		return [1, 2, 3].map((c) =>
			hermite(t, WAY[i][c], tan[i][c - 1], WAY[i + 1][c], tan[i + 1][c - 1], h)
		);
	}
	const at = (s) => P(way(s));
	const len = new Float64Array(M + 1); // cumulative length at s = i / M
	const slope = new Float64Array(M + 1); // ds / d(length) at s = i / M
	let p = at(0);
	for (let i = 1; i <= M; i++) {
		const q = at(i / M);
		len[i] = len[i - 1] + dist3(q, p);
		p = q;
	}
	const h = 1e-4;
	for (let i = 0; i <= M; i++) {
		const s0 = Math.max(0, i / M - h);
		const s1 = Math.min(1, i / M + h);
		slope[i] = (s1 - s0) / dist3(at(s1), at(s0));
	}
	const L = len[M];
	function inverse(a) {
		const target = a * L;
		let lo = 0;
		let hi = M;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (len[mid] <= target) lo = mid;
			else hi = mid;
		}
		const d = len[hi] - len[lo];
		if (d <= 0) return lo / M;
		return hermite((target - len[lo]) / d, lo / M, slope[lo], hi / M, slope[hi], d);
	}
	return { way, inverse };
}

// A smooth bump: 1 at c, 0 outside c ± w, flat at both edges.
const bump = (s, c, w) => {
	const x = Math.abs(s - c) / w;
	return x >= 1 ? 0 : Math.cos((Math.PI * x) / 2) ** 2;
};

const UP = [0, 0.4, -1.4]; // the ceiling's underside, from under
const BED = [0.6, -0.5, -1.2]; // the bed, its back half
const DESK = [-0.1, -0.3, -1.8]; // the desk's top, the monitor over it

export function pose(u, api) {
	const { lerp, smooth, span, FOV0, T, dist, orbitAt, TAU } = api;
	const f = u < 0.5 ? smooth(span(u, IN[0], IN[1])) : smooth(span(u, OUT[1], OUT[0]));
	// The loop's parameter is the fraction of the path's length run; s is
	// where on the spline that is.
	path ??= build(api);
	const s = path.inverse(smooth(span(u, LOOP[0], LOOP[1])));
	const fovDolly = lerp(FOV0, FOV1, f);
	// The orbit's radius: where the dolly left the lens, out a little round
	// the sides and over the top.
	const [az, el, dR] = path.way(s);
	const R = dist(fovDolly) - T[2] + dR;
	// A touch wider over the top, where the lens is nearest the slab.
	const fov = fovDolly + 4 * Math.sin(Math.PI * s) ** 2;
	// The look point: the room's middle, drifting up to the ceiling from
	// under, to the bed round the right side, to the desk from over the top.
	const wU = bump(s, 0.14, 0.14);
	const wB = bump(s, 0.36, 0.2);
	const wD = bump(s, 0.6, 0.18);
	const look = [0, 1, 2].map(
		(k) => T[k] + wU * (UP[k] - T[k]) + wB * (BED[k] - T[k]) + wD * (DESK[k] - T[k])
	);
	const roll = 0.07 * Math.sin(TAU * s);
	return { fov, pos: orbitAt(az, el, R), look, roll };
}
