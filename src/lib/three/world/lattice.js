import * as THREE from 'three';
import { createEgg } from './egg';
import { createConstruction } from './construction';
import { lineMaterial, dotMaterial, grower, segmentAttributes } from './materials';
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
// the scene. 96 edges and 24 nodes, two draw calls.
//
// It is here because the search needs somewhere to happen. An icosahedron
// turning on a black ground is turning in NOTHING; the same icosahedron inside a
// lattice that is itself turning, in the same coordinates, is turning in a
// space.
//
// Three things make it read as one figure rather than as a haze, and all three
// are V2's:
//
//   IT TURNS WITH THE SOLID. Not beside it — the same quaternion, so the whole
//   frame swings as one object.
//
//   IT IS LOCKED TO THE SCREEN. setScreen() is handed the live frustum height
//   every frame and scales the whole thing to it, so the lattice is the same
//   size on screen at every zoom. A fixed world size would balloon during the
//   fall into the room.
//
//   IT IS BEHIND EVERYTHING. Its own scene, drawn first, depth cleared after —
//   see render() below. Left in the main scene it would either be occluded to
//   ribbons by the room artwork or laid over the top of it.
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

	const scene = new THREE.Scene();
	const spin = new THREE.Group();
	scene.add(spin);

	const edgeGeo = new THREE.BufferGeometry();
	const edgePos = new Float32Array(pairs.length * 6);
	edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
	const edgeSpread = segmentAttributes(edgeGeo, pairs.length, () => 0);
	const edgeMat = lineMaterial(ICOSA_INK.grid, 0);
	// Flat: this is a backdrop, and depth-shading it fights the solid in front,
	// which is the one thing in the frame that is supposed to have depth.
	edgeMat.uniforms.uBack.value = 1;
	grower(edgeMat, edgeSpread)(1);
	const lines = new THREE.LineSegments(edgeGeo, edgeMat);
	lines.frustumCulled = false;
	spin.add(lines);

	const nodeGeo = new THREE.BufferGeometry();
	const nodePos = new Float32Array(verts.length * 3);
	nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
	const nodeMat = dotMaterial(ICOSA_INK.grid, ICOSA.cageNode);
	const nodes = new THREE.Points(nodeGeo, nodeMat);
	nodes.frustumCulled = false;
	spin.add(nodes);

	const angle = [0.2, 0.6, 0.4];
	const projected = verts.map(() => new THREE.Vector3());

	// The w-divide magnifies a vertex by at most W/(W - sqrt2), and a 24-cell
	// vertex is sqrt2 from the origin, so this is the largest the projection can
	// ever get. Dividing it out means the cage is a fixed fraction of the frame
	// rather than something that breathes out past the edges on its own.
	const W = 3.2;
	const REACH = Math.SQRT2 * (W / (W - Math.SQRT2));
	let scale = 1;

	function rot4(p, a, b, ang) {
		const c = Math.cos(ang);
		const s = Math.sin(ang);
		const q = p.slice();
		q[a] = p[a] * c - p[b] * s;
		q[b] = p[a] * s + p[b] * c;
		return q;
	}

	function project() {
		for (let i = 0; i < verts.length; i++) {
			let p = rot4(verts[i], 0, 3, angle[0]);
			p = rot4(p, 1, 3, angle[1]);
			p = rot4(p, 2, 3, angle[2]);
			// Perspective divide along w, which is what makes a 4D rotation read
			// as the lattice breathing rather than merely spinning.
			const k = W / (W - p[3]);
			projected[i].set(p[0] * k, p[1] * k, p[2] * k).multiplyScalar(scale);
			nodePos.set([projected[i].x, projected[i].y, projected[i].z], i * 3);
		}
		for (let e = 0; e < pairs.length; e++) {
			const a = projected[pairs[e][0]];
			const b = projected[pairs[e][1]];
			edgePos.set([a.x, a.y, a.z, b.x, b.y, b.z], e * 6);
		}
		edgeGeo.attributes.position.needsUpdate = true;
		nodeGeo.attributes.position.needsUpdate = true;
	}

	project();

	return {
		scene,
		spin,
		visible: () => edgeMat.uniforms.uOpacity.value > 0.004,
		advance(dt) {
			angle[0] += dt * ICOSA.cageSpin[0];
			angle[1] += dt * ICOSA.cageSpin[1];
			angle[2] += dt * ICOSA.cageSpin[2];
			project();
		},
		// Lock it to the frame: the widest the figure ever gets is ICOSA.cageFill
		// of the frustum height, whatever the camera is doing.
		setScreen(frustumHeight) {
			const want = (frustumHeight * ICOSA.cageFill) / 2 / REACH;
			if (Math.abs(want - scale) < 1e-4) return;
			scale = want;
			project();
		},
		setOpacity(o) {
			edgeMat.uniforms.uOpacity.value = o;
			nodeMat.uniforms.uOpacity.value = o * ICOSA.cageNodeGain;
			lines.visible = o > 0.004;
			nodes.visible = o > 0.004;
		},
		dispose() {
			edgeGeo.dispose();
			edgeMat.dispose();
			nodeGeo.dispose();
			nodeMat.dispose();
		}
	};
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
		ink: ICOSA_INK.line,
		accent: ICOSA_INK.bright,
		power: 8,
		base: 0,
		// A drawn circle, not a surface: no cage, no body, and additive so it is
		// light on the void rather than paint on it — which is also the only way
		// the union's flash can push it past 1.
		skinOnly: true,
		add: true
	});
	scene.add(egg.group);

	// Everything that turns. It rests on ICOSA.tilt, which is where the
	// computation's search starts from; the conception turns it there from
	// identity as the construction folds up.
	const frame = new THREE.Group();
	frame.quaternion.copy(TILT);
	scene.add(frame);

	// The cage is in its own scene — see createCage — and only borrows the
	// frame's attitude, so it turns with the solid without being part of it.
	const cage = createCage();

	// The conception's derivation, in the frame's own coordinates so that every
	// point it arrives at is a point of the solid.
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
	const edgeMat = lineMaterial(ICOSA_INK.line);
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
	const spokeMat = lineMaterial(ICOSA_INK.inner, 0.85);
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

		const mat = lineMaterial(ICOSA_INK.pentagon, 0.9);
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
			cage.setOpacity(o);
		},

		// The cage's 4D rotation, and the only thing in here that is a clock.
		tick(dt) {
			if (cage.visible()) cage.advance(dt);
		},

		// TWO PASSES. The cage is drawn first into a cleared frame, the depth
		// buffer is wiped, and the scene proper goes over the top — so the lattice
		// is unambiguously BEHIND everything, at every zoom, without depth-testing
		// against room artwork it has no business being occluded by.
		render(r) {
			cage.spin.quaternion.copy(frame.quaternion);
			cage.setScreen(camera.top * 2);
			r.autoClear = true;
			r.render(cage.scene, camera);
			r.autoClear = false;
			r.clearDepth();
			r.render(scene, camera);
			r.autoClear = true;
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
			cage.dispose();
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
