import * as THREE from 'three';

// ── The icosahedron, as combinatorics ────────────────────────────────────────
// Not THREE.IcosahedronGeometry. That gives you triangles; what the conception
// scene needs is the STRUCTURE — which vertices are adjacent, which five ring
// each one, which three golden rectangles the twelve corners fall on — so that
// individual pentagons can be drawn as their own objects and turned on their
// own axes while the rest of the frame stays put.
//
// Everything below the vertex list is derived, not typed, so the pieces cannot
// drift out of agreement with each other.

export const PHI = (1 + Math.sqrt(5)) / 2;

// The canonical twelve: cyclic permutations of (0, ±1, ±φ).
//
// This ORDER is load-bearing. The three golden rectangles are [0,1,3,2],
// [4,5,7,6] and [8,9,11,10], and the decade panes are built on those indices
// (see RECTANGLES below and GoldenRectangle.svelte). Do not re-order.
export const VERTICES = [
	[-1, PHI, 0],
	[1, PHI, 0],
	[-1, -PHI, 0],
	[1, -PHI, 0],
	[0, -1, PHI],
	[0, 1, PHI],
	[0, -1, -PHI],
	[0, 1, -PHI],
	[PHI, 0, -1],
	[PHI, 0, 1],
	[-PHI, 0, -1],
	[-PHI, 0, 1]
];

// Distance from the centre to any vertex.
export const CIRCUMRADIUS = Math.hypot(1, PHI);

// The three mutually perpendicular golden rectangles whose twelve corners are
// the icosahedron. Each names its own plane and the axis it faces along.
export const RECTANGLES = [
	{ indices: [0, 1, 3, 2], plane: 'XY', axis: [0, 0, 1] },
	{ indices: [4, 5, 7, 6], plane: 'YZ', axis: [1, 0, 0] },
	{ indices: [8, 9, 11, 10], plane: 'XZ', axis: [0, 1, 0] }
];

const v3 = (i) => new THREE.Vector3(...VERTICES[i]);

// ── Edges ────────────────────────────────────────────────────────────────────
// Two vertices are adjacent exactly when they are the minimum distance apart,
// which for this vertex set is 2. Comparing against a tolerance rather than an
// exact value keeps it honest if the vertices are ever rescaled.
const EDGE_LEN = 2;
const TOL = 1e-6;

export const EDGES = (() => {
	const out = [];
	for (let a = 0; a < VERTICES.length; a++) {
		for (let b = a + 1; b < VERTICES.length; b++) {
			if (Math.abs(v3(a).distanceTo(v3(b)) - EDGE_LEN) < TOL) out.push([a, b]);
		}
	}
	return out; // 30
})();

export const ADJACENCY = (() => {
	const adj = VERTICES.map(() => []);
	EDGES.forEach(([a, b]) => {
		adj[a].push(b);
		adj[b].push(a);
	});
	return adj; // each of length 5
})();

// ── Faces ────────────────────────────────────────────────────────────────────
// Every mutually-adjacent triple, wound so the normal points outward — which,
// for a shape centred on the origin, just means agreeing with the centroid.
export const FACES = (() => {
	const isAdj = (a, b) => ADJACENCY[a].includes(b);
	const out = [];
	for (let a = 0; a < 12; a++) {
		for (const b of ADJACENCY[a]) {
			if (b <= a) continue;
			for (const c of ADJACENCY[b]) {
				if (c <= b || !isAdj(a, c)) continue;
				const A = v3(a);
				const B = v3(b);
				const C = v3(c);
				const normal = new THREE.Vector3()
					.subVectors(B, A)
					.cross(new THREE.Vector3().subVectors(C, A));
				const centroid = A.clone().add(B).add(C);
				out.push(normal.dot(centroid) >= 0 ? [a, b, c] : [a, c, b]);
			}
		}
	}
	return out; // 20
})();

// ── Pentagons ────────────────────────────────────────────────────────────────
// The vertex figures: around each of the twelve vertices, the ring of five
// neighbours, in cyclic order. These are what turn in the conception scene —
// a fifth of a turn about the apex is a generator of the icosahedral group, so
// spinning one is the visible form of a step in the calculation.
//
// The ring is ordered by angle in the plane perpendicular to the apex, which is
// the only way to get a loop rather than a five-pointed scribble.
export const PENTAGONS = VERTICES.map((_, apex) => {
	const axis = v3(apex).normalize();

	// Any two vectors spanning the plane the ring lies in.
	const ref = new THREE.Vector3().subVectors(v3(ADJACENCY[apex][0]), v3(apex));
	const u = ref.projectOnPlane(axis).normalize();
	const w = new THREE.Vector3().crossVectors(axis, u);

	const ring = ADJACENCY[apex]
		.map((i) => {
			const d = v3(i).sub(v3(apex)).projectOnPlane(axis);
			return { i, angle: Math.atan2(d.dot(w), d.dot(u)) };
		})
		.sort((a, b) => a.angle - b.angle)
		.map((r) => r.i);

	// Where the ring's own plane sits along the apex axis, and how big it is —
	// enough to draw the loop without recomputing it every frame.
	const centre = ring
		.reduce((acc, i) => acc.add(v3(i)), new THREE.Vector3())
		.multiplyScalar(1 / ring.length);

	return { apex, ring, axis, centre, radius: v3(ring[0]).sub(centre).length() };
});

// Pentagons come in antipodal pairs, and a pair is the same ring seen from
// either side. Turning both halves of a pair at once reads as one move on the
// whole solid rather than two unrelated ones, so scenes step through PAIRS.
export const PENTAGON_PAIRS = (() => {
	const seen = new Set();
	const pairs = [];
	PENTAGONS.forEach((p, i) => {
		if (seen.has(i)) return;
		const opp = PENTAGONS.findIndex((q, j) => j !== i && q.axis.dot(p.axis) < -0.99);
		seen.add(i);
		if (opp >= 0) seen.add(opp);
		pairs.push(opp >= 0 ? [i, opp] : [i]);
	});
	return pairs; // 6
})();

// A fifth of a turn: the smallest rotation that maps the solid to itself about
// a vertex axis.
export const PENTAGON_STEP = (2 * Math.PI) / 5;

// ── Views ────────────────────────────────────────────────────────────────────
// Down a 3-fold axis (a face centre): the silhouette is a hexagon and every
// edge is visible inside it. This is the view the reference diagram is drawn in.
export const THREE_FOLD_VIEW = (() => {
	const f = FACES[0];
	const centroid = v3(f[0]).add(v3(f[1])).add(v3(f[2])).normalize();
	return new THREE.Quaternion().setFromUnitVectors(centroid, new THREE.Vector3(0, 0, 1));
})();

// Down a 5-fold axis (a vertex): the silhouette is a decagon.
export const FIVE_FOLD_VIEW = new THREE.Quaternion().setFromUnitVectors(
	v3(0).normalize(),
	new THREE.Vector3(0, 0, 1)
);

// ── Buffers ──────────────────────────────────────────────────────────────────
// Flat position arrays, ready for BufferGeometry.

export function edgePositions(scale = 1) {
	const out = [];
	EDGES.forEach(([a, b]) => {
		out.push(...VERTICES[a].map((n) => n * scale), ...VERTICES[b].map((n) => n * scale));
	});
	return out;
}

export function facePositions(scale = 1) {
	const out = [];
	FACES.forEach(([a, b, c]) => {
		out.push(
			...VERTICES[a].map((n) => n * scale),
			...VERTICES[b].map((n) => n * scale),
			...VERTICES[c].map((n) => n * scale)
		);
	});
	return out;
}

// The ring of one pentagon as a closed loop, in world coordinates.
export function pentagonPositions(index, scale = 1) {
	const { ring } = PENTAGONS[index];
	const out = [];
	for (let i = 0; i < ring.length; i++) {
		const a = VERTICES[ring[i]];
		const b = VERTICES[ring[(i + 1) % ring.length]];
		out.push(...a.map((n) => n * scale), ...b.map((n) => n * scale));
	}
	return out;
}

// The spokes from an apex out to its five neighbours — the lines that extend
// from the vertices as the structure builds.
export function spokePositions(index, scale = 1) {
	const { apex, ring } = PENTAGONS[index];
	const out = [];
	ring.forEach((i) => {
		out.push(...VERTICES[apex].map((n) => n * scale), ...VERTICES[i].map((n) => n * scale));
	});
	return out;
}
