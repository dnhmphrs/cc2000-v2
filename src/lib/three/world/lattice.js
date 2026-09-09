import * as THREE from 'three';
import { createEgg } from './egg';
import { lineMaterial, dotMaterial, grower, segmentAttributes } from './materials';
import { VERTICES, EDGES, PENTAGONS, PENTAGON_PAIRS, edgePositions } from '../geometry/icosahedron';
import { ICOSA, ICOSA_SPHERE_R, ICOSA_INK, VOID } from '$lib/config';

// ── The lattice ──────────────────────────────────────────────────────────────
// The place the conception and the computation both happen in: the void, a very
// long lens, a gold circle, and the icosahedron drawn inside it.
//
// Two scenes share it so the cut between them cannot move anything. The
// conception grows the wireframe out of the ovum's own standing wave; the
// computation projects panes off the very same frame. Neither builds it.
//
// ── It DOES continue the fly-in's ovum ───────────────────────────────────────
// It used to not: the fly-in ended in a white-out and the sphere here appeared
// fresh. There is no white-out any more. The sphere here is the same two-layer
// object — a dark core with a gold rim — built from the same numbers, and the
// fly-in sizes its own core against this scene's framing every frame so the two
// land on each other exactly. The wave that breaks across it at the top of the
// conception is running on the surface the swimmer just went into.
//
// ── The camera ───────────────────────────────────────────────────────────────
// PERSPECTIVE, on a 12-degree lens, and driven by the frustum HEIGHT it has to
// fit rather than by a distance: applyFrustum() parks it at whatever range makes
// `fr` world units fill the frame at the plane it is focused on. At 12 degrees
// that is very nearly orthographic, which is the register this half of the run
// is drawn in — a technical projection, not a photograph — and every framing
// number in config/space.js still means exactly what it meant under the
// orthographic camera this replaced.
//
// It is a lens rather than a box so that the SURVEY can open it (setFov) and
// walk the camera in to match. The framing does not change by a pixel and the
// space does: near rooms swell off the frame, far ones fall away. That is the
// one moment in the run with any perspective in it and it is what shows you the
// six rooms are hung in three dimensions rather than printed.
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
	const camera = new THREE.PerspectiveCamera(
		ICOSA.fov,
		window.innerWidth / window.innerHeight,
		ICOSA.near,
		ICOSA.far
	);
	camera.position.set(...ICOSA.camPos);
	camera.up.set(0, 1, 0);

	// The live framing. applyFrustum() owns the camera's range; `fov` and `focus`
	// are the two things that change what that range has to be.
	let frustum = ICOSA.frustum;
	let fov = ICOSA.fov;
	// The plane the frustum height is measured AT. Zero for everything except the
	// fall into a room, which is measured at that room's own depth — otherwise a
	// pane six units off the origin lands at the wrong size on a lens.
	let focus = 0;

	// The circumsphere. NO cage and no outer skin: what is drawn is the core's
	// own silhouette, which on the void is a gold circle exactly through the
	// twelve vertices — and behind it the core's body, which is what the wave at
	// the top of the conception runs on and which is switched off outright the
	// moment that wave has finished (see egg.setCore: it writes depth, and in
	// here an invisible occluder would swallow the icosahedron whole).
	//
	// It is the same object the fly-in hands over, built from the same numbers.
	const egg = createEgg(ICOSA_SPHERE_R, { wire: false, outer: false, core: 1 });

	// Everything that turns. It rests on ICOSA.tilt, which is where the
	// computation's search starts from; the conception turns it there from
	// identity as the construction folds up.
	const frame = new THREE.Group();
	frame.quaternion.copy(TILT);
	scene.add(frame);

	// ── ONE OBJECT ───────────────────────────────────────────────────────────
	// The sphere is a CHILD of the frame, and that is the whole of it. It used to
	// be a sibling carrying its own copy of the tilt, which meant the two things
	// that are supposed to be one thing came apart the moment anything moved: the
	// search turned the icosahedron to face a decade and the sphere it is
	// inscribed in stayed exactly where it was, and the computation grew the
	// sphere to 1.35 while the frame it is skin-tight on stayed at 1.
	//
	// The wave's twelve antinodes ARE the twelve vertices. They cannot be in
	// different poses; there is nothing to keep in step because there is only one
	// attitude and one scale now.
	frame.add(egg.group);

	// The cage is in its own scene — see createCage — and only borrows the
	// frame's attitude, so it turns with the solid without being part of it.
	const cage = createCage();

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

	// ── The twelve ───────────────────────────────────────────────────────────
	// The corners, as points. They are struck where the standing wave's twelve
	// antinodes are, because they ARE those antinodes — see world/materials.js
	// coreMaterial(), and scenes/Conception.svelte.
	const cornerMat = dotMaterial(ICOSA_INK.bright, 12);
	const cornerGeo = new THREE.BufferGeometry();
	cornerGeo.setAttribute('position', new THREE.Float32BufferAttribute(VERTICES.flat(), 3));
	const corners = new THREE.Points(cornerGeo, cornerMat);
	wire.add(corners);

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
		corners,
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
		// 0..1 — the twelve corners. Additive, so above 1 is legal.
		setCorners(o) {
			cornerMat.uniforms.uOpacity.value = o;
			corners.visible = o > 0.004;
		},
		// The line-work's own radius, as a multiple of the circumsphere's. The
		// conception drives it: while the body is divided, the twelve caps stand
		// proud of the sphere by exactly the wave's amplitude, and the twelve
		// corners ARE those caps — so the frame is born out at the cap peaks and
		// settles onto the circumsphere as the body rounds up. Without it the
		// corners are struck inside a surface that has swollen past them and
		// nothing is visible at all.
		//
		// It lands at exactly 1 when the wave flattens, which is what the panes
		// need: they are built on the frame's own raw coordinates.
		setWireScale(k) {
			wire.scale.setScalar(k);
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
			cage.setScreen(frustum);
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
			this.applyFrustum(frustum);
		},

		// The frustum is a HEIGHT, and on a lens that means a RANGE: park the
		// camera wherever `fr` world units fill the frame at the focus plane.
		// Width follows the viewport, exactly as it did under the orthographic
		// camera this replaced, so every number in config/space.js is unchanged.
		applyFrustum(fr) {
			frustum = fr;
			const d = fr / 2 / Math.tan((fov * Math.PI) / 360);
			camera.fov = fov;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.position.z = focus + d;
			// Clipped around the content rather than at fixed depths: the range
			// walks from sixty units out to under twenty on the fall, and a fixed
			// near plane at either end is either clipping the cage or throwing away
			// most of the depth buffer.
			camera.near = Math.max(d * 0.05, d - 30);
			camera.far = d + 30;
			camera.updateProjectionMatrix();
		},

		// The lens. Opening it and re-applying the same frustum height walks the
		// camera in to match: a true dolly zoom, framing held, space changed.
		setFov(deg) {
			if (Math.abs(fov - deg) < 1e-4) return;
			fov = deg;
			this.applyFrustum(frustum);
		},

		// Which plane the frustum height is measured at. The fall into a room sets
		// this to that room's own depth so it lands at exactly the size the
		// orthographic camera would have given it.
		setFocus(z) {
			if (Math.abs(focus - z) < 1e-4) return;
			focus = z;
			this.applyFrustum(frustum);
		},

		getFrustum() {
			return frustum;
		},

		reset() {
			paneGroup.visible = false;
			frame.quaternion.copy(TILT);
			fov = ICOSA.fov;
			focus = 0;
			pentagons.forEach((pn) => (pn.spinner.rotation.z = 0));
			this.setGrow(0);
			this.setSpokes(0);
			this.setPentagons(0);
			this.setLineOpacity(1);
			this.setCage(0);
			this.setCorners(0);
			wire.scale.setScalar(1);
			egg.setShell(0);
			egg.setCore(0);
			egg.setCoreRimGain(0);
			egg.group.rotation.set(0, 0, 0);
			egg.setWave({ furrow: 0, lobe: 0, chop: 0, grain: 0, glow: 0, amp: 0, ring: 0, phase: 0 });
			egg.group.scale.setScalar(1);
			// Identity, not the tilt: it is inside the frame, which carries it.
			egg.group.quaternion.identity();
			camera.position.set(ICOSA.camPos[0], ICOSA.camPos[1], camera.position.z);
			camera.up.set(0, 1, 0);
			camera.rotation.set(0, 0, 0);
			this.applyFrustum(ICOSA.frustum);
		},

		dispose() {
			egg.dispose();
			cage.dispose();
			cornerGeo.dispose();
			cornerMat.dispose();
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
