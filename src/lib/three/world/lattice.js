import * as THREE from 'three';
import { createEgg } from './egg';
import { createConstruction } from './construction';
import { growLineMaterial, grower, segmentAttributes } from './ink';
import { VERTICES, EDGES, PENTAGONS, PENTAGON_PAIRS, edgePositions } from '../geometry/icosahedron';
import { ICOSA, ICOSA_SPHERE_R, ICOSA_INK, VOID } from '$lib/config';

// ── The lattice ──────────────────────────────────────────────────────────────
// The place the conception and the computation both happen in: the void, an
// orthographic camera, a gold circle, and the icosahedron drawn inside it.
//
// Two scenes share it so the cut between them cannot move anything. The
// conception derives the wireframe; the computation projects panes off the very
// same frame. Neither builds it.
//
// It does NOT continue the fly-in's egg. That scene ends in a white-out and the
// sphere here appears fresh — and on black it is a RIM and nothing else, a gold
// circle the frame is inscribed in, because a filled shell at any opacity is a
// grey wash over a black ground.
//
// Sizes live in config/space.js (ICOSA); colour in config/palette.js.

const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));

// ── The cage ─────────────────────────────────────────────────────────────────
// A 24-cell — the regular 4-polytope whose 24 vertices are every permutation of
// (±1, ±1, 0, 0) — projected from four dimensions into three and hung around
// the solid. 96 edges, one draw call.
//
// It is here because the search needs somewhere to happen. An icosahedron
// turning on a black ground is turning in nothing; the same icosahedron inside
// a lattice that is itself turning, in the same coordinates, is turning in a
// SPACE — and the blueprint field behind it (three/shaders/grid.js) rules the
// ground with the same figure in two dimensions, so the three read as one
// continuous thing.
//
// The 4D rotation is the only clock in this file. It has to be: a projection
// from 4D is not a rotation of anything in 3D, so it cannot be a function of a
// scene's progress without the scene owning a fourth angle. It is atmosphere,
// it never resets, and nothing depends on where it is.
function createCage() {
	const verts = [];
	for (const [a, b] of [
		[0, 1],
		[0, 2],
		[0, 3],
		[1, 2],
		[1, 3],
		[2, 3]
	]) {
		for (const sa of [-1, 1]) {
			for (const sb of [-1, 1]) {
				const v = [0, 0, 0, 0];
				v[a] = sa;
				v[b] = sb;
				verts.push(v);
			}
		}
	}
	// Two vertices are joined exactly when they are the minimum distance apart,
	// which for this vertex set is squared-distance 2. 96 edges.
	const pairs = [];
	for (let i = 0; i < verts.length; i++) {
		for (let j = i + 1; j < verts.length; j++) {
			let d = 0;
			for (let k = 0; k < 4; k++) d += (verts[i][k] - verts[j][k]) ** 2;
			if (Math.abs(d - 2) < 1e-6) pairs.push([i, j]);
		}
	}

	const geo = new THREE.BufferGeometry();
	const pos = new Float32Array(pairs.length * 6);
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	const spread = segmentAttributes(geo, pairs.length, () => 0);
	const mat = growLineMaterial(ICOSA_INK.grid, 0);
	mat.uniforms.uBack.value = 0.3;
	mat.uniforms.uRadius.value = ICOSA_SPHERE_R * ICOSA.cageRadius;
	// Always fully inked: the cage is not something that draws itself on.
	const growCage = grower(mat, spread);
	growCage(1);

	const lines = new THREE.LineSegments(geo, mat);
	lines.frustumCulled = false;

	const angle = [0.2, 0.6, 0.4];
	const projected = verts.map(() => new THREE.Vector3());

	// The w-divide magnifies a vertex by at most W/(W - sqrt(2)), and a 24-cell
	// vertex is sqrt(2) from the origin, so this is the largest the projection can
	// ever get. Scaling by it means cageRadius is a real bound on how far the cage
	// reaches, in circumradii — otherwise the thing breathes out past the frame
	// edges on its own and the scene is played inside a much bigger object than
	// anyone asked for.
	const W = 3.2;
	const SCALE = (ICOSA_SPHERE_R * ICOSA.cageRadius) / (Math.SQRT2 * (W / (W - Math.SQRT2)));

	function rot4(p, a, b, ang) {
		const c = Math.cos(ang);
		const s = Math.sin(ang);
		const q = p.slice();
		q[a] = p[a] * c - p[b] * s;
		q[b] = p[a] * s + p[b] * c;
		return q;
	}

	function advance(dt) {
		angle[0] += dt * ICOSA.cageSpin[0];
		angle[1] += dt * ICOSA.cageSpin[1];
		angle[2] += dt * ICOSA.cageSpin[2];

		for (let i = 0; i < verts.length; i++) {
			let p = rot4(verts[i], 0, 3, angle[0]);
			p = rot4(p, 1, 3, angle[1]);
			p = rot4(p, 2, 3, angle[2]);
			// Perspective divide along w, which is what makes a 4D rotation read
			// as the lattice breathing rather than merely spinning.
			const k = W / (W - p[3]);
			projected[i].set(p[0] * k, p[1] * k, p[2] * k).multiplyScalar(SCALE);
		}
		for (let e = 0; e < pairs.length; e++) {
			const a = projected[pairs[e][0]];
			const b = projected[pairs[e][1]];
			pos.set([a.x, a.y, a.z, b.x, b.y, b.z], e * 6);
		}
		geo.attributes.position.needsUpdate = true;
	}

	advance(0);
	return { lines, mat, geo, advance };
}

export function createLattice() {
	const scene = new THREE.Scene();
	const aspect = window.innerWidth / window.innerHeight;
	const camera = new THREE.OrthographicCamera(
		(-ICOSA.frustum * aspect) / 2,
		(ICOSA.frustum * aspect) / 2,
		ICOSA.frustum / 2,
		-ICOSA.frustum / 2,
		ICOSA.near,
		ICOSA.far
	);
	camera.position.set(...ICOSA.camPos);
	camera.up.set(0, 1, 0);
	camera.lookAt(0, 0, 0);

	// The circumsphere, as a RIM. Same factory as the tunnel's egg with the base
	// alpha taken out, so what is drawn is the silhouette and nothing else: a
	// gold circle exactly through the twelve vertices.
	const egg = createEgg(ICOSA_SPHERE_R, {
		shell: ICOSA_INK.line,
		rim: ICOSA_INK.bright,
		rimPower: 8.0,
		base: 0,
		// No lamp: this is a drawn circle, not a surface. Additive, so it is light
		// on black rather than paint on it — and so a flash can push it past 1.
		key: 0,
		gloss: 1,
		add: true
	});
	egg.setCore(0);
	scene.add(egg.group);

	// Everything that turns. It rests on ICOSA.tilt, which is where the
	// computation's search starts from; the conception turns it there from
	// identity as the construction folds up.
	const frame = new THREE.Group();
	frame.quaternion.copy(TILT);
	scene.add(frame);

	// The cage sits OUTSIDE the frame: it is the space the solid is turning in,
	// not part of the solid, so it must not turn with it.
	const cage = createCage();
	scene.add(cage.lines);

	// The conception's three variants, in the frame's own coordinates so that
	// every point they arrive at is a point of the solid.
	const construction = createConstruction();
	frame.add(construction.group);

	// The line-work, in a group of its own. Built at the raw vertex scale so the
	// panes — which GoldenRectangle builds from the same raw coordinates — sit
	// exactly on the frame's own edges at projection 0.
	const wire = new THREE.Group();
	frame.add(wire);
	const S = 1;

	// ── The 30 edges ─────────────────────────────────────────────────────────
	// All thirty draw at once. They used to come on in five staggered bands —
	// the star at the near vertex, its pentagon, the belt, and so on outward —
	// which is a real feature of the solid but takes five times as long to watch,
	// and the whole point of this scene is the shape, not the order it arrives
	// in. One delay for every edge, so the frame simply draws itself on.
	const edgeGeo = new THREE.BufferGeometry();
	edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions(S), 3));
	const edgeMat = growLineMaterial(ICOSA_INK.line);
	const growEdges = grower(
		edgeMat,
		// Each edge still grows outward from the end nearer the seed vertex, so
		// the strokes agree with each other instead of firing off in thirty
		// directions. EDGES is ordered by vertex index, which is not that.
		(() => {
			const seed = new THREE.Vector3(...VERTICES[0]).normalize();
			const reachOf = VERTICES.map((v) => 1 - new THREE.Vector3(...v).normalize().dot(seed));
			return segmentAttributes(
				edgeGeo,
				EDGES.length,
				() => 0,
				(i) => reachOf[EDGES[i][1]] < reachOf[EDGES[i][0]]
			);
		})()
	);
	const edges = new THREE.LineSegments(edgeGeo, edgeMat);
	wire.add(edges);

	// ── The spokes ───────────────────────────────────────────────────────────
	// The six long diagonals, each running from a vertex straight through the
	// centre to its antipode. These are the only lines in the figure that are NOT
	// edges — they are the five-fold axes — so this is the one piece of geometry
	// that shows the solid has an inside.
	const spokeSegs = [];
	VERTICES.forEach((v, a) => {
		const b = VERTICES.findIndex((w) => w.every((n, k) => Math.abs(n + v[k]) < 1e-9));
		if (b > a) spokeSegs.push([a, b]);
	});
	const spokePos = [];
	spokeSegs.forEach(([a, b]) => {
		spokePos.push(...VERTICES[a].map((n) => n * S), ...VERTICES[b].map((n) => n * S));
	});
	const spokeGeo = new THREE.BufferGeometry();
	spokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(spokePos, 3));
	const spokeMat = growLineMaterial(ICOSA_INK.inner, 0.85);
	// These run from the front of the solid to the back through the middle, so at
	// the frame's depth floor the far half of every one of them disappears and
	// six diagonals read as six short stubs. Lifted so they carry all the way.
	spokeMat.uniforms.uBack.value = 0.34;
	const growSpokes = grower(
		spokeMat,
		segmentAttributes(spokeGeo, spokeSegs.length, (i) => i)
	);
	const spokes = new THREE.LineSegments(spokeGeo, spokeMat);
	wire.add(spokes);

	// ── The 12 pentagons ─────────────────────────────────────────────────────
	// Each vertex figure as its own object, oriented so a plain rotation about
	// its local Z is a turn about that vertex's axis. Two nested objects on
	// purpose: three.js keeps rotation and quaternion as one value, so writing
	// .rotation.z on the oriented object would throw the orientation away.
	const Z = new THREE.Vector3(0, 0, 1);
	const pentagons = PENTAGONS.map((p) => {
		const orient = new THREE.Quaternion().setFromUnitVectors(Z, p.axis.clone().normalize());
		const inv = orient.clone().invert();

		const holder = new THREE.Object3D();
		holder.position.copy(p.centre).multiplyScalar(S);
		holder.quaternion.copy(orient);

		const spinner = new THREE.Object3D();
		holder.add(spinner);

		const local = p.ring.map((i) =>
			new THREE.Vector3(...VERTICES[i])
				.multiplyScalar(S)
				.sub(p.centre.clone().multiplyScalar(S))
				.applyQuaternion(inv)
		);
		const pos = [];
		for (let i = 0; i < local.length; i++) {
			const a = local[i];
			const b = local[(i + 1) % local.length];
			pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		// All five sides at once: a vertex figure reads as one closed shape, not
		// as a line chasing itself round. spread 0, so its whole clock is uSpan.
		const spread = segmentAttributes(geo, local.length, () => 0);

		const mat = growLineMaterial(ICOSA_INK.pentagon, 0.9);
		const line = new THREE.LineSegments(geo, mat);
		spinner.add(line);
		wire.add(holder);

		return { holder, spinner, line, mat, grow: grower(mat, spread), axis: p.axis, apex: p.apex };
	});

	// Where the computation mounts its decade panes. Hidden until then: they are
	// six rooms' worth of geometry and there is no reason to draw them while the
	// conception is assembling the frame in front of them.
	const paneGroup = new THREE.Group();
	paneGroup.visible = false;
	frame.add(paneGroup);

	return {
		scene,
		camera,
		egg,
		frame,
		wire,
		paneGroup,
		edges,
		spokes,
		construction,
		cage,
		// Each pentagon is its own object with its own spin axis, so a scene can
		// turn them individually — nothing does at the moment, but the structure
		// is here (PENTAGON_PAIRS groups the antipodal ones).
		pentagons,
		pentagonPairs: PENTAGON_PAIRS,
		scale: S,
		tilt: TILT,

		// 0..1 — how much of the wireframe has drawn itself on. 1 means FINISHED:
		// every grower maps this onto the clock its own delays need, so the caller
		// never has to know that a staggered build has to run past its own end.
		setGrow(v) {
			growEdges(v);
			edges.visible = v > 0.001;
		},
		setSpokes(v) {
			growSpokes(v);
			spokes.visible = v > 0.001;
		},
		setPentagons(v) {
			pentagons.forEach((pn) => {
				pn.grow(v);
				pn.line.visible = v > 0.001;
			});
		},
		setLineOpacity(v) {
			edgeMat.uniforms.uOpacity.value = v;
			spokeMat.uniforms.uOpacity.value = v * 0.85;
			pentagons.forEach((pn) => (pn.mat.uniforms.uOpacity.value = v * 0.9));
		},
		setPanesVisible(v) {
			paneGroup.visible = v;
		},
		setCage(o) {
			cage.mat.uniforms.uOpacity.value = o;
			cage.lines.visible = o > 0.004;
		},

		// The cage's 4D rotation, and the only thing in here that is a clock.
		tick(dt) {
			if (cage.lines.visible) cage.advance(dt);
		},

		backdrop() {
			return { color: VOID, alpha: 1 };
		},

		resize() {
			this.applyFrustum(camera.top * 2);
		},

		// The frustum is a HEIGHT; width follows the viewport.
		applyFrustum(fr) {
			const a = window.innerWidth / window.innerHeight;
			camera.left = (-fr * a) / 2;
			camera.right = (fr * a) / 2;
			camera.top = fr / 2;
			camera.bottom = -fr / 2;
			camera.updateProjectionMatrix();
		},

		reset() {
			paneGroup.visible = false;
			frame.quaternion.copy(TILT);
			pentagons.forEach((pn) => (pn.spinner.rotation.z = 0));
			this.setGrow(0);
			this.setSpokes(0);
			this.setPentagons(0);
			this.setLineOpacity(1);
			this.setCage(0);
			construction.reset();
			construction.show(null);
			egg.setCore(0);
			egg.setShell(0);
			egg.group.scale.setScalar(1);
			camera.position.set(...ICOSA.camPos);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			this.applyFrustum(ICOSA.frustum);
		},

		dispose() {
			egg.dispose();
			construction.dispose();
			cage.geo.dispose();
			cage.mat.dispose();
			edgeGeo.dispose();
			edgeMat.dispose();
			spokeGeo.dispose();
			spokeMat.dispose();
			pentagons.forEach((pn) => {
				pn.line.geometry.dispose();
				pn.mat.dispose();
			});
		}
	};
}
