import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { VERTICES4, EDGES4, PHI, qmul, qconj, qexp } from '$lib/three/geometry/cell600';

// ── Sketch: E8 ───────────────────────────────────────────────────────────────
// "The icosahedron expands out." Here is how far out it can go without
// leaving the geometry the site already has.
//
// The 120 unit icosians in cell600.js are the 600-cell's vertices, and the
// twelve of them next to the pole ARE the site's icosahedron (its vertex
// figure). Those same 120, together with the same 120 scaled by φ, are —
// exactly, under Conway–Sloane's norm — the 240 roots of E8. So E8 is the
// 600-cell plus one scaled copy of itself, and it needs no eighth dimension to
// be drawn: two nested cages, turned by the same 4D twist, which is a motion
// of the union because both shells are orbits of the same group.
//
// And the picture the world knows as "E8" — the 30-fold wheel — is this pair
// projected onto the H4 Coxeter plane. Eight rings of thirty. The 2×4 matrix
// below is that plane, computed for the codebase's own vertex order.
//
//   0 .. 0.15   the icosahedron, alone
//   0.15 .. 0.55  the 600-cell grows out of it, shell by shell in w
//   0.5 .. 0.8    the second shell grows out of that, φ times larger
//   0.7 .. 1     the projection walks from the site's own (drop w, after a
//                4D twist that eases out) to the Coxeter plane. It lands on
//                the wheel.
//
// Bloom on top: the first appearance of the neon stack, and the reason the
// crossings at the centre of the wheel should burn rather than clip.
export default async function make({ THREE, renderer, at }) {
	const S = 1.3; // world units per unit quaternion
	const DURATION = 14; // seconds, live

	// ── The H4 Coxeter plane, in THREE's [x, y, z, w] ────────────────────
	const COX = [
		[-0.099017052, 0.94727358, 0.259230007, -0.160212955],
		[0.30474315, 0.0, 0.582240128, 0.753742692]
	];

	// The wheel is the figure seen along the Coxeter plane's normal 2-space.
	// Rather than lerp the site's projection (drop w) into the plane's 2×4 —
	// which squashes the figure flat through an ellipse on the way — the plane
	// is brought round to face the camera by a ROTATION OF 4-SPACE: complete
	// the two rows to an orthonormal basis Q, and Q is an element of SO(4). And
	// every element of SO(4) is a pair of unit quaternions acting as v ↦ L v R̄
	// — the same twist lattice.js turns the cage with — so the walk to the
	// wheel is a slerp of L and R from the identity, and the figure stays a
	// solid 4D object until the moment it lands.
	const Q = (() => {
		const rows = [COX[0].slice(), COX[1].slice()];
		for (const e of [
			[0, 0, 1, 0],
			[0, 0, 0, 1],
			[1, 0, 0, 0],
			[0, 1, 0, 0]
		]) {
			if (rows.length === 4) break;
			const v = e.slice();
			for (const r of rows) {
				const d = v[0] * r[0] + v[1] * r[1] + v[2] * r[2] + v[3] * r[3];
				for (let k = 0; k < 4; k++) v[k] -= d * r[k];
			}
			const n = Math.hypot(...v);
			if (n > 1e-6) rows.push(v.map((x) => x / n));
		}
		// det +1, or it is a reflection and no L, R exist.
		const det = (m) =>
			m[0][0] *
				(m[1][1] * (m[2][2] * m[3][3] - m[2][3] * m[3][2]) -
					m[1][2] * (m[2][1] * m[3][3] - m[2][3] * m[3][1]) +
					m[1][3] * (m[2][1] * m[3][2] - m[2][2] * m[3][1])) -
			m[0][1] *
				(m[1][0] * (m[2][2] * m[3][3] - m[2][3] * m[3][2]) -
					m[1][2] * (m[2][0] * m[3][3] - m[2][3] * m[3][0]) +
					m[1][3] * (m[2][0] * m[3][2] - m[2][2] * m[3][0])) +
			m[0][2] *
				(m[1][0] * (m[2][1] * m[3][3] - m[2][3] * m[3][1]) -
					m[1][1] * (m[2][0] * m[3][3] - m[2][3] * m[3][0]) +
					m[1][3] * (m[2][0] * m[3][1] - m[2][1] * m[3][0])) -
			m[0][3] *
				(m[1][0] * (m[2][1] * m[3][2] - m[2][2] * m[3][1]) -
					m[1][1] * (m[2][0] * m[3][2] - m[2][2] * m[3][0]) +
					m[1][2] * (m[2][0] * m[3][1] - m[2][1] * m[3][0]));
		if (det(rows) < 0) rows[3] = rows[3].map((x) => -x);
		return rows;
	})();

	// Q as the pair (L, R): solved by alternating least squares on the four
	// basis quaternions — L e R̄ is linear in L for fixed R and in R̄ for
	// fixed L, and for a rotation this converges in a handful of rounds.
	const { L: LW, R: RW } = (() => {
		const basis = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
		// Q acts on column vectors: (Q v)_i = Σ_j Q[i][j] v_j.
		const target = basis.map((e) =>
			Q.map((row) => row[0] * e[0] + row[1] * e[1] + row[2] * e[2] + row[3] * e[3])
		);
		const L = [0, 0, 0, 1];
		const R = [0, 0, 0, 1];
		const dot4 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
		const norm = (q) => {
			const n = Math.hypot(...q);
			for (let k = 0; k < 4; k++) q[k] /= n;
		};
		for (let iter = 0; iter < 40; iter++) {
			// Solve L: L·(e R̄) ≈ t for each basis e. Since e R̄ runs over an
			// orthonormal basis too, L = Σ t_k ⊗ (e_k R̄)⁻¹ averaged — i.e. the
			// least-squares L is Σ_k t_k · conj(e_k R̄), normalised.
			const Rc = qconj(R);
			const acc = [0, 0, 0, 0];
			for (let k = 0; k < 4; k++) {
				const eR = qmul(basis[k], Rc);
				const l = qmul(target[k], qconj(eR));
				for (let i = 0; i < 4; i++) acc[i] += l[i];
			}
			norm(acc);
			for (let i = 0; i < 4; i++) L[i] = acc[i];
			// Solve R: (L e) R̄ ≈ t  ⇒  R̄ ≈ conj(L e) t, averaged.
			const acc2 = [0, 0, 0, 0];
			for (let k = 0; k < 4; k++) {
				const Le = qmul(L, basis[k]);
				const rc = qmul(qconj(Le), target[k]);
				for (let i = 0; i < 4; i++) acc2[i] += rc[i];
			}
			norm(acc2);
			const Rn = qconj(acc2);
			for (let i = 0; i < 4; i++) R[i] = Rn[i];
		}
		// Residual, for the record.
		let err = 0;
		for (let k = 0; k < 4; k++) {
			const v = qmul(qmul(L, basis[k]), qconj(R));
			for (let i = 0; i < 4; i++) err += (v[i] - target[k][i]) ** 2;
		}
		return { L, R, err, dot4 };
	})();

	// slerp on plain [x,y,z,w] arrays, from the identity.
	const slerpFromIdentity = (q, t, out) => {
		let w = q[3];
		let sgn = 1;
		if (w < 0) {
			w = -w;
			sgn = -1;
		}
		const ang = Math.acos(Math.min(1, w));
		if (ang < 1e-6) {
			out[0] = 0;
			out[1] = 0;
			out[2] = 0;
			out[3] = 1;
			return out;
		}
		const s = Math.sin(ang);
		const a = Math.sin((1 - t) * ang) / s;
		const b = (Math.sin(t * ang) / s) * sgn;
		out[0] = b * q[0];
		out[1] = b * q[1];
		out[2] = b * q[2];
		out[3] = a + b * q[3] * sgn;
		return out;
	};

	// ── The two shells and their edges ───────────────────────────────────
	const N = VERTICES4.length; // 120
	const verts = VERTICES4.map((v) => v.slice()); // shell 1
	const edges = []; // [i, j, shell]
	for (const [i, j] of EDGES4) edges.push([i, j, 0]);
	for (const [i, j] of EDGES4) edges.push([i, j, 1]);

	// Birth order: the pole's twelve neighbours (w = φ/2) first — that is the
	// icosahedron — then outward as w falls, the far pole last. The pole
	// itself (w = 1) projects to the origin and is notched by the depth cue.
	const wTop = PHI / 2;
	const birth = verts.map(([, , , w]) => {
		if (w > 0.99) return 1; // the pole, last
		return Math.max(0, Math.min(1, (wTop - w) / (wTop + 1)));
	});
	const edgeBirth = edges.map(([i, j]) => Math.max(birth[i], birth[j]));

	// ── Geometry ─────────────────────────────────────────────────────────
	const E = edges.length; // 1440
	const pos = new Float32Array(E * 2 * 3);
	const col = new Float32Array(E * 2 * 3);
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

	const mat = new THREE.LineBasicNodeMaterial();
	mat.vertexColors = true;
	mat.transparent = true;
	mat.depthWrite = false;
	mat.blending = THREE.AdditiveBlending;
	const lines = new THREE.LineSegments(geo, mat);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 0, 13);
	scene.add(lines);

	// ── Post: bloom ──────────────────────────────────────────────────────
	let post = null;
	let bloomed = false;
	try {
		post = new THREE.RenderPipeline(renderer);
		const scenePass = pass(scene, camera);
		post.outputNode = scenePass.add(bloom(scenePass, 0.9, 0.45, 0.12));
		bloomed = true;
	} catch {
		post = null;
	}

	// ── The frame at progress p ──────────────────────────────────────────
	const INK = [
		[0.95, 0.78, 0.36], // shell 1: the site's gold
		[1.0, 0.9, 0.62] // shell 2: a step hotter
	];
	const smooth = (a, b, x) => {
		const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
		return t * t * (3 - 2 * t);
	};
	const L = [0, 0, 0, 1];
	const R = [0, 0, 0, 1];
	const Lw = [0, 0, 0, 1];
	const Rw = [0, 0, 0, 1];
	const Lt = [0, 0, 0, 0];
	const Rt = [0, 0, 0, 0];
	const tmp = [0, 0, 0, 0];
	const axisL = new THREE.Vector3(0.3, 1, 0.2).normalize();
	const axisR = new THREE.Vector3(1, 0.1, 0.5).normalize();
	const projected = new Array(N * 2);
	for (let i = 0; i < N * 2; i++) projected[i] = [0, 0, 0, 0];

	function set(p) {
		const ico = smooth(0.0, 0.1, p);
		const grow1 = smooth(0.15, 0.55, p);
		const grow2 = smooth(0.5, 0.8, p);
		const wheel = smooth(0.7, 1.0, p);
		// The twist: a general 4D rotation, in and out, so it is at identity
		// on the icosahedron and on the wheel.
		const theta = Math.sin(p * Math.PI) * 0.55;
		qexp(axisL, theta, Lt);
		qexp(axisR, theta * 0.6, Rt);
		// The walk to the wheel, composed with the twist: total L = Lw·Lt,
		// total R = Rw·Rt, so v ↦ Lw Lt v (Rw Rt)̄ .
		slerpFromIdentity(LW, wheel, Lw);
		slerpFromIdentity(RW, wheel, Rw);
		qmul(Lw, Lt, L);
		qmul(Rw, Rt, R);
		const Rc = qconj(R);

		// Project all 240: twist, then lerp between the two projections.
		for (let s = 0; s < 2; s++) {
			const scale = S * (s === 0 ? 1 : PHI);
			for (let i = 0; i < N; i++) {
				qmul(L, verts[i], tmp);
				const q = qmul(tmp, Rc);
				// Always the site's projection — drop w — of a figure that has
				// been TURNED in 4-space. At wheel = 1 the turn is Q, and the
				// x, y that remain are the Coxeter plane.
				const o = projected[s * N + i];
				o[0] = q[0] * scale;
				o[1] = q[1] * scale;
				o[2] = q[2] * scale;
				o[3] = q[3]; // unit w, for the depth ramp and the notch
			}
		}

		// Edges: presence by birth and phase, brightness by depth.
		for (let e = 0; e < E; e++) {
			const [i, j, s] = edges[e];
			const b = edgeBirth[e];
			let a;
			if (s === 0) {
				// The icosahedron's own thirty come with `ico`; the rest with grow1.
				const isIco = b === 0;
				a = isIco ? ico : smooth(b - 0.12, b + 0.02, grow1);
			} else {
				a = smooth(b - 0.12, b + 0.02, grow2);
			}
			const ink = INK[s];
			for (let k = 0; k < 2; k++) {
				const v = projected[s * N + (k === 0 ? i : j)];
				const idx = (e * 2 + k) * 3;
				pos[idx] = v[0];
				pos[idx + 1] = v[1];
				pos[idx + 2] = v[2];
				// The site's own reading of a 4-polytope: the far half (w < 0)
				// falls away and the poles are notched, because both project
				// onto the middle of the near half and would smudge it. As the
				// wheel lands the ramp eases out: every ring of the wheel is a
				// ring, wherever it sat in w.
				const ramp = smooth(-0.05, 0.62, v[3]) * (1 - smooth(0.8, 0.9, Math.abs(v[3])));
				const near = 0.35 + 0.65 * smooth(-2.4, 2.4, v[2]);
				const g = a * (ramp * near * (1 - wheel) + 0.7 * wheel) * 0.85;
				col[idx] = ink[0] * g;
				col[idx + 1] = ink[1] * g;
				col[idx + 2] = ink[2] * g;
			}
		}
		geo.attributes.position.needsUpdate = true;
		geo.attributes.color.needsUpdate = true;
	}

	let t = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info: { vertices: N * 2, edges: E, bloom: bloomed },
		update(dt) {
			t = (t + dt) % (DURATION + 2);
			set(Math.min(t / DURATION, 1));
		},
		render() {
			if (post) post.render();
			else renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		}
	};
}
