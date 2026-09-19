import {
	pass,
	Fn,
	uv,
	length,
	exp,
	smoothstep,
	vec4,
	uniform,
	instancedBufferAttribute,
	cameraProjectionMatrix,
	viewportSize
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { ADD } from '$lib/three/tsl/materials';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
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
//   0 .. 0.15     the icosahedron, alone — swelling up out of a point
//   0.15 .. 0.55  the 600-cell grows out of it, shell by shell in w: every
//                 vertex is born inside its place and swells out to it
//   0.5 .. 0.8    the second shell is born ON the first and grows out of it,
//                 φ times larger
//   0.7 .. 1      the projection walks from the site's own (drop w, after a
//                 4D twist that eases out) to the Coxeter plane. It lands on
//                 the wheel.
//
// The vertices are drawn as well as the edges — 240 dots — because the wheel
// is its rings, and rings are made of points: as it lands the edges thin to a
// web and the dots take the light, each ring its own colour, hot at the hub
// and ember at the rim. Bloom on top: the first appearance of the neon stack,
// and the reason the crossings at the centre of the wheel should burn rather
// than clip.
//
//   ?bloom=0   without the glow
export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const BLOOM = q.get('bloom') !== '0';
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
		const norm = (q) => {
			const n = Math.hypot(...q);
			for (let k = 0; k < 4; k++) q[k] /= n;
		};
		for (let iter = 0; iter < 40; iter++) {
			// Solve L: L·(e R̄) ≈ t for each basis e. Since e R̄ runs over an
			// orthonormal basis too, the least-squares L is Σ_k t_k · conj(e_k R̄),
			// normalised.
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
		return { L, R, err };
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

	// ── The rings ────────────────────────────────────────────────────────
	// Where each of the 240 lands on the Coxeter plane: its radius there, and
	// which of the eight rings of thirty that is. Clustered by radius, with
	// the second shell's φ.
	const radius = new Float32Array(N * 2);
	for (let s = 0; s < 2; s++)
		for (let i = 0; i < N; i++) {
			const v = verts[i];
			const x = COX[0][0] * v[0] + COX[0][1] * v[1] + COX[0][2] * v[2] + COX[0][3] * v[3];
			const y = COX[1][0] * v[0] + COX[1][1] * v[1] + COX[1][2] * v[2] + COX[1][3] * v[3];
			radius[s * N + i] = Math.hypot(x, y) * (s === 0 ? 1 : PHI);
		}
	const order = [...radius.keys()].sort((a, b) => radius[a] - radius[b]);
	const ringOf = new Int8Array(N * 2);
	const rings = []; // { r, count }
	for (const k of order) {
		const last = rings[rings.length - 1];
		if (!last || radius[k] - last.r > 0.01) rings.push({ r: radius[k], count: 0 });
		rings[rings.length - 1].count++;
		ringOf[k] = rings.length - 1;
	}
	// Hot at the hub, gold between, ember at the rim.
	const HOT = [1.0, 0.95, 0.75];
	const GOLD = [0.95, 0.78, 0.36];
	const EMBER = [1.0, 0.4, 0.16];
	const mix3 = (a, b, t) => [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t
	];
	const ringInk = rings.map((_, k) => {
		const t = rings.length > 1 ? k / (rings.length - 1) : 0;
		return t < 0.5 ? mix3(HOT, GOLD, t * 2) : mix3(GOLD, EMBER, (t - 0.5) * 2);
	});

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
	lines.frustumCulled = false;

	// The 240 vertices as drawn dots: one sprite, instanced, each with its
	// own colour (which carries its brightness — the blend is additive).
	const vpos = new Float32Array(N * 2 * 3);
	const vcol = new Float32Array(N * 2 * 3);
	const vposAttr = new THREE.InstancedBufferAttribute(vpos, 3);
	const vcolAttr = new THREE.InstancedBufferAttribute(vcol, 3);
	const dotMat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, ...ADD });
	dotMat.sizeAttenuation = false;
	const uSize = uniform(5.5); // device pixels
	dotMat.scaleNode = uSize.mul(2.0).div(cameraProjectionMatrix.element(1).y.mul(viewportSize.y));
	dotMat.positionNode = instancedBufferAttribute(vposAttr);
	const aInk = instancedBufferAttribute(vcolAttr);
	dotMat.fragmentNode = Fn(() => {
		const d = uv().sub(0.5);
		const r = length(d).mul(2.0);
		const a = exp(r.mul(r).mul(-4.0))
			.mul(0.5)
			.add(smoothstep(0.2, 0.32, r).oneMinus().mul(0.95));
		return vec4(aInk.mul(a), a);
	})();
	const dotsObj = new THREE.Sprite(dotMat);
	dotsObj.count = N * 2;
	dotsObj.frustumCulled = false;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 0, 13);
	scene.add(lines);
	scene.add(dotsObj);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── Post: bloom ──────────────────────────────────────────────────────
	let post = null;
	let bloomed = false;
	if (BLOOM) {
		try {
			post = new THREE.RenderPipeline(renderer);
			const scenePass = pass(scene, camera);
			post.outputNode = scenePass.add(bloom(scenePass, 0.8, 0.5, 0.4));
			bloomed = true;
		} catch {
			post = null;
		}
	}

	// ── The frame at progress p ──────────────────────────────────────────
	const INK = [
		GOLD, // shell 1: the site's gold
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
	const appear = new Float32Array(N * 2); // each vertex's own arrival, 0..1
	const cue = new Float32Array(N * 2); // its depth cue in the drop-w view
	const ink = new Array(N * 2);
	for (let i = 0; i < N * 2; i++) ink[i] = [0, 0, 0];

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

		// Every vertex: when it arrives, where it is, how bright, what colour.
		for (let s = 0; s < 2; s++) {
			for (let i = 0; i < N; i++) {
				const k = s * N + i;
				const b = birth[i];
				// The icosahedron's own twelve come with `ico`; the rest of the
				// first shell with grow1; the second shell with grow2.
				const a =
					s === 0
						? b === 0
							? ico
							: smooth(b - 0.12, b + 0.02, grow1)
						: smooth(b - 0.12, b + 0.02, grow2);
				appear[k] = a;
				// Born inside its place and swelling out to it — the second
				// shell born ON the first, at 1/φ of its own size.
				const e = 1 - Math.pow(1 - a, 3);
				const swell = s === 0 ? 0.55 + 0.45 * e : 1 / PHI + (1 - 1 / PHI) * e;
				const scale = S * (s === 0 ? 1 : PHI) * swell;
				qmul(L, verts[i], tmp);
				const q = qmul(tmp, Rc);
				// Always the site's projection — drop w — of a figure that has
				// been TURNED in 4-space. At wheel = 1 the turn is Q, and the
				// x, y that remain are the Coxeter plane.
				const o = projected[k];
				o[0] = q[0] * scale;
				o[1] = q[1] * scale;
				o[2] = q[2] * scale;
				o[3] = q[3]; // unit w, for the depth ramp and the notch
				// The site's own reading of a 4-polytope: the far half (w < 0)
				// falls away and the poles are notched, because both project
				// onto the middle of the near half and would smudge it. As the
				// wheel lands the ramp eases out: every ring of the wheel is a
				// ring, wherever it sat in w.
				const ramp = smooth(-0.05, 0.62, o[3]) * (1 - smooth(0.8, 0.9, Math.abs(o[3])));
				const near = 0.35 + 0.65 * smooth(-2.4, 2.4, o[2]);
				cue[k] = ramp * near;
				// The shell's ink, going over to the ring's as the wheel lands.
				const c = ink[k];
				const r = ringInk[ringOf[k]];
				c[0] = INK[s][0] + (r[0] - INK[s][0]) * wheel;
				c[1] = INK[s][1] + (r[1] - INK[s][1]) * wheel;
				c[2] = INK[s][2] + (r[2] - INK[s][2]) * wheel;
				// The dot: the cue in the solid view, full on the wheel.
				const g = a * (cue[k] * (1 - wheel) + wheel);
				vpos[k * 3] = o[0];
				vpos[k * 3 + 1] = o[1];
				vpos[k * 3 + 2] = o[2];
				vcol[k * 3] = c[0] * g;
				vcol[k * 3 + 1] = c[1] * g;
				vcol[k * 3 + 2] = c[2] * g;
			}
		}

		// Edges: present when both ends are; the cue in the solid view, and
		// on the wheel thinned to a web so the rings carry the light.
		for (let e = 0; e < E; e++) {
			const [i, j, s] = edges[e];
			const a = Math.min(appear[s * N + i], appear[s * N + j]);
			for (let n = 0; n < 2; n++) {
				const k = s * N + (n === 0 ? i : j);
				const v = projected[k];
				const idx = (e * 2 + n) * 3;
				pos[idx] = v[0];
				pos[idx + 1] = v[1];
				pos[idx + 2] = v[2];
				const g = a * (cue[k] * (1 - wheel) + 0.22 * wheel) * 0.85;
				const c = ink[k];
				col[idx] = c[0] * g;
				col[idx + 1] = c[1] * g;
				col[idx + 2] = c[2] * g;
			}
		}
		geo.attributes.position.needsUpdate = true;
		geo.attributes.color.needsUpdate = true;
		vposAttr.needsUpdate = true;
		vcolAttr.needsUpdate = true;
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
	bu.uPx.value = 1 / renderer.domElement.height;

	let t = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info: {
			vertices: N * 2,
			edges: E,
			rings: rings.map((r) => r.count),
			radii: rings.map((r) => Number(r.r.toFixed(3))),
			bloom: bloomed
		},
		update(dt) {
			t = (t + dt) % (DURATION + 2);
			set(Math.min(t / DURATION, 1));
		},
		seek(u) {
			t = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			if (post) post.render();
			else renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
