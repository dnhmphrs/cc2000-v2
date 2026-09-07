import * as THREE from 'three';
import { createEgg } from './egg';
import {
	VERTICES,
	EDGES,
	FACES,
	PENTAGONS,
	PENTAGON_PAIRS,
	edgePositions,
	facePositions
} from '../geometry/icosahedron';
import { ICOSA, ICOSA_EGG_R, ICOSA_INK, WHITE } from '$lib/config';

// ── The lattice ──────────────────────────────────────────────────────────────
// The place the conception and the computation both happen in: white, an
// orthographic camera, the egg, and the icosahedron.
//
// Two scenes share it for the same reason the fly-in and the conception used to
// share the tunnel — so the cut between them cannot move anything. The
// conception assembles the wireframe inside the egg; the computation projects
// panes off the very same frame. Neither builds it.
//
// It also lands on the fly-in exactly: the egg here is createEgg(ICOSA_EGG_R),
// and ICOSA_EGG_R is derived from the same EGG_SCREEN the fly-in derives its
// stopping distance from. Neither scene picks a size, so they cannot disagree.
//
// Sizes live in config/space.js (ICOSA); colour in config/palette.js.

// Lines that draw themselves on. `aT` runs 0→1 along each segment and `aDelay`
// staggers when each one is allowed to start, so the structure spreads out of
// the vertices instead of switching on all at once.
function growLineMaterial(color, opacity = 1) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: {
			uColor: { value: new THREE.Color(color).convertSRGBToLinear() },
			uGrow: { value: 0 },
			uSpan: { value: 0.45 },
			uOpacity: { value: opacity }
		},
		vertexShader: `
			attribute float aT;
			attribute float aDelay;
			varying float vT;
			varying float vDelay;
			void main() {
				vT = aT;
				vDelay = aDelay;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform vec3 uColor;
			uniform float uGrow;
			uniform float uSpan;
			uniform float uOpacity;
			varying float vT;
			varying float vDelay;
			void main() {
				float local = clamp((uGrow - vDelay) / max(uSpan, 0.0001), 0.0, 1.0);
				if (vT > local) discard;
				gl_FragColor = vec4(uColor, uOpacity);
			}
		`
	});
}

// Per-segment attributes for a flat [x,y,z, x,y,z, ...] pair list.
function segmentAttributes(geo, count, delayOf) {
	const aT = new Float32Array(count * 2);
	const aDelay = new Float32Array(count * 2);
	for (let i = 0; i < count; i++) {
		aT[i * 2] = 0;
		aT[i * 2 + 1] = 1;
		const d = delayOf(i);
		aDelay[i * 2] = d;
		aDelay[i * 2 + 1] = d;
	}
	geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
	geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
}

const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));

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

	// The egg. Same factory and same derived radius as the tunnel's.
	const egg = createEgg(ICOSA_EGG_R);
	scene.add(egg.group);

	// Everything that turns. It rests on ICOSA.tilt, which is where the
	// computation's search starts from; the conception leaves it alone.
	// THREE_FOLD_VIEW is exported from the geometry if you ever want the
	// face-on view the reference diagram is drawn in.
	const frame = new THREE.Group();
	frame.quaternion.copy(TILT);
	scene.add(frame);

	// The line-work and the solid, in a group of their own. Built at the raw
	// vertex scale so the panes — which GoldenRectangle builds from the same raw
	// coordinates — sit exactly on the solid's edges at projection 0. The
	// conception scales THIS group, not the geometry, and not the panes.
	const wire = new THREE.Group();
	frame.add(wire);
	const S = 1;

	// ── The 30 edges ─────────────────────────────────────────────────────────
	// Delays run outward from the vertex nearest the camera, so the frame draws
	// itself from one corner rather than everywhere at once.
	const edgeGeo = new THREE.BufferGeometry();
	edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions(S), 3));
	const seed = new THREE.Vector3(...VERTICES[0]).normalize();
	segmentAttributes(edgeGeo, EDGES.length, (i) => {
		const [a, b] = EDGES[i];
		const mid = new THREE.Vector3(...VERTICES[a]).add(new THREE.Vector3(...VERTICES[b]));
		return (1 - mid.normalize().dot(seed)) / 2;
	});
	const edgeMat = growLineMaterial(ICOSA_INK.line);
	const edges = new THREE.LineSegments(edgeGeo, edgeMat);
	wire.add(edges);

	// ── The spokes ───────────────────────────────────────────────────────────
	// Every vertex to every neighbour, drawn through the middle of the solid.
	// This is the geometric content the diagram carries: the internal star you
	// only see when the hidden edges are drawn too.
	const spokeSegs = [];
	PENTAGONS.forEach(({ apex, ring }) => {
		ring.forEach((i) => {
			if (i > apex) spokeSegs.push([apex, i]);
		});
	});
	const spokePos = [];
	spokeSegs.forEach(([a, b]) => {
		spokePos.push(...VERTICES[a].map((n) => n * S), ...VERTICES[b].map((n) => n * S));
	});
	const spokeGeo = new THREE.BufferGeometry();
	spokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(spokePos, 3));
	segmentAttributes(spokeGeo, spokeSegs.length, (i) => (i / spokeSegs.length) * 0.55);
	const spokeMat = growLineMaterial(ICOSA_INK.inner, 0.55);
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
		segmentAttributes(geo, local.length, () => 0);

		const mat = growLineMaterial(ICOSA_INK.pentagon, 0.9);
		const line = new THREE.LineSegments(geo, mat);
		spinner.add(line);
		wire.add(holder);

		return { holder, spinner, line, mat, axis: p.axis, apex: p.apex };
	});

	// ── The solid ────────────────────────────────────────────────────────────
	// Off through the conception, on for the computation, where the panes need
	// something opaque to come off.
	const solidGeo = new THREE.BufferGeometry();
	solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(facePositions(S), 3));
	solidGeo.computeVertexNormals();
	const solidMat = new THREE.MeshBasicMaterial({
		color: new THREE.Color(ICOSA_INK.solid).convertSRGBToLinear(),
		transparent: true,
		opacity: 0,
		side: THREE.DoubleSide,
		// Push faces back so the wireframe always wins on the shared edges.
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1
	});
	const solid = new THREE.Mesh(solidGeo, solidMat);
	solid.visible = false;
	wire.add(solid);

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
		// Each pentagon is its own object with its own spin axis, so a scene can
		// turn them individually — nothing does at the moment, but the structure
		// is here (PENTAGON_PAIRS groups the antipodal ones).
		pentagons,
		pentagonPairs: PENTAGON_PAIRS,
		solid,
		faceCount: FACES.length,
		scale: S,

		// 0..1 — how much of the wireframe has drawn itself on.
		setGrow(v) {
			edgeMat.uniforms.uGrow.value = v;
			edges.visible = v > 0.001;
		},
		setSpokes(v) {
			spokeMat.uniforms.uGrow.value = v;
			spokes.visible = v > 0.001;
		},
		setPentagons(v) {
			pentagons.forEach((pn) => {
				pn.mat.uniforms.uGrow.value = v;
				pn.line.visible = v > 0.001;
			});
		},
		setLineOpacity(v) {
			edgeMat.uniforms.uOpacity.value = v;
			spokeMat.uniforms.uOpacity.value = v * 0.55;
			pentagons.forEach((pn) => (pn.mat.uniforms.uOpacity.value = v * 0.9));
		},
		setSolid(v) {
			solidMat.opacity = v;
			solid.visible = v > 0.002;
		},
		setPanesVisible(v) {
			paneGroup.visible = v;
		},

		backdrop() {
			return { color: WHITE, alpha: 1 };
		},

		resize() {
			const a = window.innerWidth / window.innerHeight;
			camera.left = (-ICOSA.frustum * a) / 2;
			camera.right = (ICOSA.frustum * a) / 2;
			camera.top = ICOSA.frustum / 2;
			camera.bottom = -ICOSA.frustum / 2;
			camera.updateProjectionMatrix();
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
			this.setSolid(0);
			egg.setCore(1);
			egg.setShell(1);
			egg.group.scale.setScalar(1);
			camera.position.set(...ICOSA.camPos);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			this.applyFrustum(ICOSA.frustum);
		},

		dispose() {
			egg.dispose();
			edgeGeo.dispose();
			edgeMat.dispose();
			spokeGeo.dispose();
			spokeMat.dispose();
			solidGeo.dispose();
			solidMat.dispose();
			pentagons.forEach((pn) => {
				pn.line.geometry.dispose();
				pn.mat.dispose();
			});
		}
	};
}
