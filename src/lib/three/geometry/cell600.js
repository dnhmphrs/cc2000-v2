// ── The 600-cell ─────────────────────────────────────────────────────────────
// The 4-polytope the icosahedron actually belongs to.
//
// Not the 120-cell and definitely not the 24-cell that used to hang behind this
// scene: the 600-cell {3,3,5} is the one whose VERTEX FIGURE IS AN ICOSAHEDRON.
// Take any of its 120 vertices and the 12 joined to it are the twelve vertices
// of an icosahedron — so an icosahedron is not something added to the picture,
// it is what the polytope looks like from one of its own corners.
//
// And the coordinates are not a choice either. The 120 vertices ARE the binary
// icosahedral group 2I — the unit quaternions that double-cover the rotation
// group of the icosahedron — so the solid in the middle of the scene and the
// lattice around it are the same group written twice, once as a set of points
// and once as a set of rotations. That is why the rotation coupling in
// world/lattice.js is exact rather than approximate: multiplying the vertex set
// by one of its own members PERMUTES it, so the figure comes back to itself.
//
// 120 vertices, 720 edges, every vertex of degree 12.
//
// STORED AS [x, y, z, w], which is THREE.Quaternion's own component order — so
// these are quaternions, the algebra is quaternion multiplication, and the
// projection drops w.

export const PHI = (1 + Math.sqrt(5)) / 2;

// The three orbits:
//
//   8    the unit axes, (±1,0,0,0) in each slot
//   16   (±½,±½,±½,±½), every sign
//   96   the ODD slot-permutations of (φ/2, ½, 1/(2φ), 0), every sign on the
//        three non-zero entries — 12 patterns x 8 signs
//
// ODD, and that is the whole orientation story. The textbook list uses the EVEN
// permutations, and its vertex figure is the MIRROR of the icosahedron this
// project draws: cyclic permutations of (±φ, ±1, 0) rather than (±1, ±φ, 0).
// Swapping two slots swaps the parity and maps one onto the other, so taking
// the odd half is a free change of handedness that lands the twelve neighbours
// of the pole exactly on geometry/icosahedron.js's VERTICES scaled by 1/(2φ).
// Nothing downstream has to rotate anything into place.
//
// AS A SET, and only as a set — the two lists are the same twelve directions in
// a different order. Nothing here pairs them by index and nothing should: a
// per-index correspondence between this and VERTICES does not exist.
export const VERTICES4 = (() => {
	const P = PHI / 2; // cos 36°
	const H = 1 / 2; // cos 60°
	const Q = 1 / (2 * PHI); // cos 72°
	const out = [];
	const seen = new Set();
	// v is (w, x, y, z) — the natural order to write a quaternion in. Stored
	// [x, y, z, w] to match THREE.
	const push = (v) => {
		const key = v.map((n) => (Math.abs(n) < 1e-12 ? 0 : n).toFixed(6)).join(',');
		if (seen.has(key)) return;
		seen.add(key);
		out.push([v[1], v[2], v[3], v[0]]);
	};

	for (let i = 0; i < 4; i++) {
		for (const s of [-1, 1]) {
			const v = [0, 0, 0, 0];
			v[i] = s;
			push(v);
		}
	}
	for (const a of [-H, H])
		for (const b of [-H, H]) for (const c of [-H, H]) for (const d of [-H, H]) push([a, b, c, d]);

	const perms = (a) =>
		a.length <= 1
			? [a]
			: a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r]));
	const parity = (p) => {
		let n = 0;
		for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (p[i] > p[j]) n++;
		return n % 2;
	};
	for (const p of perms([0, 1, 2, 3]).filter((q) => parity(q) === 1)) {
		for (const s0 of [-1, 1])
			for (const s1 of [-1, 1])
				for (const s2 of [-1, 1]) {
					const vals = [s0 * P, s1 * H, s2 * Q, 0];
					const v = [0, 0, 0, 0];
					for (let i = 0; i < 4; i++) v[p[i]] = vals[i];
					push(v);
				}
	}
	return out;
})();

// Two vertices are joined exactly at the MINIMUM separation, which here is 36°
// of arc on the unit 3-sphere:
//
//     |u - v|² = 2 - φ = 1/φ² = (3 - √5)/2 = 0.381966…      u · v = φ/2
//
// The next squared distance that occurs at all is 1, so the tolerance is not
// delicate. 720 edges, six great decagons through every vertex.
export const EDGE_D2 = 2 - PHI;

export const EDGES4 = (() => {
	const out = [];
	for (let i = 0; i < VERTICES4.length; i++) {
		for (let j = i + 1; j < VERTICES4.length; j++) {
			let d = 0;
			for (let k = 0; k < 4; k++) d += (VERTICES4[i][k] - VERTICES4[j][k]) ** 2;
			if (Math.abs(d - EDGE_D2) < 1e-6) out.push([i, j]);
		}
	}
	return out;
})();

// Quaternion product and conjugate on the plain arrays above, in [x,y,z,w].
// Component-for-component THREE.Quaternion.multiplyQuaternions; kept here as
// arrays because the hot loop runs over 120 vertices every frame and allocating
// a THREE.Quaternion per vertex per frame is the one thing worth avoiding.
export function qmul(a, b, out = [0, 0, 0, 0]) {
	const ax = a[0],
		ay = a[1],
		az = a[2],
		aw = a[3];
	const bx = b[0],
		by = b[1],
		bz = b[2],
		bw = b[3];
	out[0] = aw * bx + ax * bw + ay * bz - az * by;
	out[1] = aw * by + ay * bw + az * bx - ax * bz;
	out[2] = aw * bz + az * bw + ax * by - ay * bx;
	out[3] = aw * bw - ax * bx - ay * by - az * bz;
	return out;
}

export function qconj(q, out = [0, 0, 0, 0]) {
	out[0] = -q[0];
	out[1] = -q[1];
	out[2] = -q[2];
	out[3] = q[3];
	return out;
}

// exp(θ û) as a unit quaternion — the ISOCLINIC rotation by θ, which is NOT
// what THREE's setFromAxisAngle builds. That one halves the angle, because a
// 3D rotation by θ is the conjugation q p q̄ and the halves cancel. Here the
// quaternion acts on ONE side only, so the angle is the angle.
export function qexp(axis, theta, out = [0, 0, 0, 0]) {
	const s = Math.sin(theta);
	out[0] = axis.x * s;
	out[1] = axis.y * s;
	out[2] = axis.z * s;
	out[3] = Math.cos(theta);
	return out;
}
