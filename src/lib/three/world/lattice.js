import * as THREE from 'three';
import { createEgg } from './egg';
import { lineMaterial, dotMaterial, grower, segmentAttributes } from './materials';
import { VERTICES, EDGES, PENTAGONS, PENTAGON_PAIRS, edgePositions } from '../geometry/icosahedron';
import { VERTICES4, EDGES4, qmul, qconj, qexp } from '../geometry/cell600';
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
// A 600-CELL, projected from four dimensions into three and hung around the
// scene. It was a 24-cell, and the 24-cell was the wrong polytope: it is a
// handsome object with nothing to do with an icosahedron, so what it gave the
// scene was a lattice that happened to be there rather than one the solid
// belongs to.
//
// The 600-cell is the one. Its VERTEX FIGURE IS AN ICOSAHEDRON — the twelve
// vertices joined to any one of its 120 are an icosahedron — and its 120
// vertices ARE the binary icosahedral group, the unit quaternions that
// double-cover the icosahedron's own rotations. The solid in the middle of the
// frame and the lattice around it are the same group written twice. See
// geometry/cell600.js.
//
// Three things make it read as one figure rather than as a haze:
//
//   IT TURNS WITH THE SOLID, and now exactly. A 4D rotation is p -> L p R̄ for
//   two unit quaternions; the case L = R = q is precisely a 3D rotation of the
//   imaginary part, and leaves w — and therefore the perspective divide —
//   untouched. So the group's quaternion IS the coupled half of the polytope's
//   own 4D motion, not a 3D object being turned alongside it. On top of that
//   sit two INDEPENDENT twists s and r, and because they multiply a group by
//   its own members, every time they reach a multiple of 36° and 60° the map
//   merely permutes the 120 vertices and the whole figure snaps back into exact
//   register with the solid. It drifts out of alignment and comes home, on a
//   nine-second cycle, without anything being keyframed.
//
//   IT IS KILLED BY w, NOT BY RADIUS. A 4-polytope projected into 3-space puts
//   its far half INSIDE its near half — both poles land on the origin, dragging
//   two dozen edges into a bright knot directly behind the solid. That is the
//   mess. A radial fade cannot touch it, because nearly every edge lives in the
//   same band of 3D radius; a ramp on w removes it and leaves, brightest of
//   everything and at every instant of the twist, the shell at w = φ/2 — which
//   is the vertex figure, which is an icosahedron. See W_RAMP in materials.js.
//
//   IT IS LOCKED TO THE SCREEN. setScreen() takes the live frustum height every
//   frame and scales the figure to it, so the lattice is the same size on
//   screen at every zoom.
//
// AND IT IS BEHIND EVERYTHING. Its own scene, drawn first, depth cleared after
// — see render(). Left in the main scene it would either be occluded to ribbons
// by the room artwork or laid over the top of it.
function createCage() {
	const verts = VERTICES4;
	const pairs = EDGES4;

	const scene = new THREE.Scene();
	const spin = new THREE.Group();
	scene.add(spin);

	const edgeGeo = new THREE.BufferGeometry();
	const edgePos = new Float32Array(pairs.length * 6);
	edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
	// The fourth coordinate of each ENDPOINT, so a line fades along its length
	// rather than popping when its midpoint crosses a threshold.
	const edgeW = new Float32Array(pairs.length * 2);
	edgeGeo.setAttribute('aW', new THREE.BufferAttribute(edgeW, 1));
	const edgeSpread = segmentAttributes(edgeGeo, pairs.length, () => 0);
	const edgeMat = lineMaterial(ICOSA_INK.grid, 0, { wRamp: true });
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
	const nodeW = new Float32Array(verts.length);
	nodeGeo.setAttribute('aW', new THREE.BufferAttribute(nodeW, 1));
	const nodeMat = dotMaterial(ICOSA_INK.grid, ICOSA.cageNode, { wRamp: true });
	const nodes = new THREE.Points(nodeGeo, nodeMat);
	nodes.frustumCulled = false;
	spin.add(nodes);

	// ── The twist ────────────────────────────────────────────────────────────
	// One clock, and unlike the old three Euler-ish plane angles it is a clock
	// that RESETS — see reset() below — so a ?at= contact sheet draws the same
	// cage twice. The two axes are a five-fold and a three-fold of the solid,
	// whose quanta are 36° and 60°; running one full quantum of each per cycle
	// is what makes the register land exactly at the top of every cycle.
	const U5 = new THREE.Vector3(...VERTICES[0]).normalize();
	const U3 = new THREE.Vector3(1, 1, 1).normalize();
	let clock = 0;

	const W = ICOSA.cageW;
	// The EXACT bound, which the old one was not: a vertex cannot be at full
	// imaginary radius and at full w at once. Maximising sqrt(R²-w²)·W/(W-w)
	// over the sphere gives w = R²/W and this value. With R = 1 it is
	// W/sqrt(W²-1). The old expression over-estimated by 1.61x, which is the
	// whole reason the cage came out smaller than cageFill asked for.
	const REACH = W / Math.sqrt(W * W - 1);
	let scale = 1;

	const s4 = [0, 0, 0, 1];
	const r4 = [0, 0, 0, 1];
	const tmp = [0, 0, 0, 0];
	const rot = [0, 0, 0, 0];
	const rc = [0, 0, 0, 0];
	const projected = verts.map(() => new THREE.Vector3());
	const wOf = new Float32Array(verts.length);

	function project() {
		const tau = clock / ICOSA.cageCycle;
		qexp(U5, ICOSA.cageTwistA * Math.PI * 0.2 * tau, s4);
		qexp(U3, ICOSA.cageTwistB * Math.PI * (1 / 3) * tau, r4);
		qconj(r4, rc);
		for (let i = 0; i < verts.length; i++) {
			// p' = s · p · r̄ — the 4D half. The 3D half is the group's own
			// quaternion, copied onto `spin` every frame by render().
			qmul(s4, verts[i], tmp);
			qmul(tmp, rc, rot);
			const k = W / (W - rot[3]);
			projected[i].set(rot[0] * k, rot[1] * k, rot[2] * k).multiplyScalar(scale);
			nodePos[i * 3] = projected[i].x;
			nodePos[i * 3 + 1] = projected[i].y;
			nodePos[i * 3 + 2] = projected[i].z;
			wOf[i] = rot[3];
			nodeW[i] = rot[3];
		}
		for (let e = 0; e < pairs.length; e++) {
			const a = projected[pairs[e][0]];
			const b = projected[pairs[e][1]];
			edgePos.set([a.x, a.y, a.z, b.x, b.y, b.z], e * 6);
			edgeW[e * 2] = wOf[pairs[e][0]];
			edgeW[e * 2 + 1] = wOf[pairs[e][1]];
		}
		edgeGeo.attributes.position.needsUpdate = true;
		edgeGeo.attributes.aW.needsUpdate = true;
		nodeGeo.attributes.position.needsUpdate = true;
		nodeGeo.attributes.aW.needsUpdate = true;
	}

	project();

	return {
		scene,
		spin,
		visible: () => edgeMat.uniforms.uOpacity.value > 0.004,
		advance(dt) {
			clock = (clock + dt) % ICOSA.cageCycle;
			project();
		},
		// Lock it to the frame: the widest the figure ever gets is ICOSA.cageFill
		// of the frustum height, whatever the camera is doing. (And it really is
		// the widest — over a full twist the actual maximum stays within 0.4% of
		// REACH, so the figure does not breathe in overall size, only inside
		// itself, which is the difference between a lattice and noise.)
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
		reset() {
			clock = 0;
			project();
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
		// ── OUT FROM THE CENTRE ──────────────────────────────────────────────
		// Every edge draws from whichever of its two ends is nearer the middle
		// OF THE PICTURE, and the ones nearest the middle go first. So the frame
		// opens outward from the centre of the frame like something unfolding,
		// rather than being written from one corner of the solid.
		//
		// It has to be the PROJECTED radius, not the 3D one: all twelve vertices
		// are the same distance from the centre in space — they are on the
		// circumsphere — so in three dimensions "nearer the centre" is not a
		// thing an edge has. On screen it is, because the scene is locked head
		// on down a five-fold axis at ICOSA.tilt and never turns. Which is also
		// the catch: this is baked at build time against that tilt, and a scene
		// that turned the frame would need it recomputed.
		(() => {
			const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
			const flat = VERTICES.map((v) => {
				const p3 = new THREE.Vector3(...v).applyQuaternion(q);
				return Math.hypot(p3.x, p3.y);
			});
			return segmentAttributes(
				edgeGeo,
				EDGES.length,
				(i) => Math.min(flat[EDGES[i][0]], flat[EDGES[i][1]]),
				(i) => flat[EDGES[i][1]] < flat[EDGES[i][0]]
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
	// TWELVE HALF-SPOKES, not six whole ones. A diagonal drawn from a vertex
	// through the centre to its antipode grows from one end to the other and
	// passes through the middle on the way, which is the opposite of radiating
	// from it. Split at the centre, each half draws outward from there, and the
	// six axes arrive as twelve rays leaving the middle of the solid at once.
	const spokePos = [];
	VERTICES.forEach((v) => {
		spokePos.push(0, 0, 0, ...v.map((n) => n * S));
	});
	const spokeGeo = new THREE.BufferGeometry();
	spokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(spokePos, 3));
	const spokeMat = lineMaterial(ICOSA_INK.inner, 0.85);
	// These run from the front of the solid to the back through the middle, so at
	// the frame's depth floor the far half of every one of them disappears and
	// six diagonals read as six short stubs. Lifted so they carry all the way.
	spokeMat.uniforms.uBack.value = 0.34;
	// ALL AT ONCE, and all from the centre. They used to be staggered by index —
	// delayOf was (i) => i — which spread six lines over the whole of the build
	// and is exactly the "some lines complete sooner than others" the frame was
	// being read for. aT runs 0 at the centre end, so no flip is needed.
	const growSpokes = grower(
		spokeMat,
		segmentAttributes(spokeGeo, VERTICES.length, () => 0)
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

		// ── Move the focus plane WITHOUT moving the camera ───────────────────
		// applyFrustum parks the camera at `focus + d`, so setFocus() on its own
		// slides the camera by exactly the change in focus — and everything that
		// is not on the new plane changes size in a single tick. At the top of the
		// fall that is a 5% pop on the solid and on five of the six rooms, while
		// the sixth (the one being focused, and the one you are looking at) holds
		// still: a jump you can see and cannot name.
		//
		// This re-expresses a framing measured at the ORIGIN as the same framing
		// measured at plane z. Same camera position, same lens, same picture —
		// only the number changes, because the number is a height AT a plane and
		// the plane moved. It returns that number, which is what a fall should
		// lerp FROM rather than from the origin-measured one.
		refocus(fr, z) {
			const height = fr - 2 * z * Math.tan((fov * Math.PI) / 360);
			focus = z;
			this.applyFrustum(height);
			return height;
		},

		getFrustum() {
			return frustum;
		},

		reset() {
			paneGroup.visible = false;
			cage.reset();
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
			egg.setShell(0);
			egg.setCore(0);
			egg.setCoreRimGain(0);
			egg.group.rotation.set(0, 0, 0);
			egg.setWave({ furrow: 0, lobe: 0, chop: 0, grain: 0, glow: 0, ring: 0, phase: 0 });
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
