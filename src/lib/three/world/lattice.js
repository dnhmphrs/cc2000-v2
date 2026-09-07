import * as THREE from 'three';
import { createEgg } from './egg';
import {
	VERTICES,
	EDGES,
	PENTAGONS,
	PENTAGON_PAIRS,
	CIRCUMRADIUS,
	edgePositions
} from '../geometry/icosahedron';
import { ICOSA, ICOSA_SPHERE_R, ICOSA_INK, WHITE } from '$lib/config';

// ── The lattice ──────────────────────────────────────────────────────────────
// The place the conception and the computation both happen in: white, an
// orthographic camera, the egg, and the icosahedron.
//
// Two scenes share it for the same reason the fly-in and the conception used to
// share the tunnel — so the cut between them cannot move anything. The
// conception assembles the wireframe inside the egg; the computation projects
// panes off the very same frame. Neither builds it.
//
// It does NOT continue the fly-in's egg. That scene ends in a white-out and a
// hold on empty white; the sphere here appears fresh, at ICOSA_SPHERE_R, and
// keeps that size for the whole of the rest of the run.
//
// Sizes live in config/space.js (ICOSA); colour in config/palette.js.

// Lines that draw themselves on. `aT` runs 0→1 along each segment and `aDelay`
// staggers when each one is allowed to start, so the structure spreads out of
// the vertices instead of switching on all at once.
//
// The lines also carry their own depth. Thirty edges all drawn at one weight is
// a flat tangle — there is no way to tell which corner is nearest — so each
// fragment fades toward uBack as it goes away from the camera. That is the
// whole 3D read: no fill, no hidden-line removal, every edge still there, but
// the near ones come forward and the shape resolves. It is also live, so the
// object turning in the computation reads as turning rather than as a flicker.
function growLineMaterial(color, opacity = 1) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: {
			uColor: { value: new THREE.Color(color).convertSRGBToLinear() },
			uGrow: { value: 0 },
			uSpan: { value: 0.4 },
			uOpacity: { value: opacity },
			// Half-depth of the object, so vFront lands on ±1 at its poles.
			uRadius: { value: CIRCUMRADIUS },
			// What is left of a line at the very back.
			uBack: { value: 0.16 }
		},
		vertexShader: `
			attribute float aT;
			attribute float aDelay;
			uniform float uRadius;
			varying float vT;
			varying float vDelay;
			varying float vFront;
			void main() {
				vT = aT;
				vDelay = aDelay;
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				// Depth measured from the object's OWN centre, not the camera's,
				// so it does not change when the camera dollies or the frustum
				// closes on the way home. +1 nearest, -1 furthest.
				vec4 centre = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
				vFront = clamp((mv.z - centre.z) / uRadius, -1.0, 1.0);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform vec3 uColor;
			uniform float uGrow;
			uniform float uSpan;
			uniform float uOpacity;
			uniform float uBack;
			varying float vT;
			varying float vDelay;
			varying float vFront;
			void main() {
				float local = clamp((uGrow - vDelay) / max(uSpan, 0.0001), 0.0, 1.0);
				if (vT > local) discard;
				gl_FragColor = vec4(uColor, uOpacity * mix(uBack, 1.0, vFront * 0.5 + 0.5));
			}
		`
	});
}

// Per-segment attributes for a flat [x,y,z, x,y,z, ...] pair list.
//
// `aDelay` is NORMALISED here to exactly 0..1 — 0 starts with the build, 1
// starts last — whatever scale delayOf() happens to return. The growers below
// depend on that range being exactly this, and returning `spread` is how they
// learn it: 1 when the delays vary, 0 when every segment starts together.
//
// `flipOf(i)` swaps which end of a segment is aT=0. That end is the one it
// grows FROM, so it decides the direction each line draws in.
function segmentAttributes(geo, count, delayOf, flipOf = () => false) {
	const raw = Array.from({ length: count }, (_, i) => delayOf(i));
	const lo = Math.min(...raw);
	const range = Math.max(...raw) - lo;
	const spread = range > 1e-6 ? 1 : 0;

	const aT = new Float32Array(count * 2);
	const aDelay = new Float32Array(count * 2);
	for (let i = 0; i < count; i++) {
		const flip = flipOf(i);
		aT[i * 2] = flip ? 1 : 0;
		aT[i * 2 + 1] = flip ? 0 : 1;
		const d = spread ? (raw[i] - lo) / range : 0;
		aDelay[i * 2] = d;
		aDelay[i * 2 + 1] = d;
	}
	geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
	geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
	return spread;
}

// The clock behind setGrow() and friends.
//
// A segment is only FULLY drawn once uGrow reaches its own delay plus uSpan, so
// a clock that stops at 1 leaves everything late part-drawn and the very last
// band never drawn at all — which is exactly how this frame used to end up
// permanently unfinished. Each grower therefore runs its uniform out to the
// reach its own delays actually need, and takes a plain 0..1 from the caller.
function grower(mat, spread) {
	const reach = spread + mat.uniforms.uSpan.value;
	return (v) => (mat.uniforms.uGrow.value = v * reach);
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

	// The sphere. Same factory as the tunnel's egg, but only ever the shell —
	// the yolk would hide the wireframe, which is the whole point of it.
	const egg = createEgg(ICOSA_SPHERE_R);
	egg.setCore(0);
	scene.add(egg.group);

	// Everything that turns. It rests on ICOSA.tilt, which is where the
	// computation's search starts from; the conception leaves it alone.
	// THREE_FOLD_VIEW is exported from the geometry if you ever want the
	// face-on view the reference diagram is drawn in.
	const frame = new THREE.Group();
	frame.quaternion.copy(TILT);
	scene.add(frame);

	// The line-work, in a group of its own. Built at the raw
	// vertex scale so the panes — which GoldenRectangle builds from the same raw
	// coordinates — sit exactly on the frame's own edges at projection 0.
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
	//
	// It used to build apex-to-ring pairs, which are every one of the thirty
	// edges over again in a lighter ink: the comment claimed an internal star and
	// the geometry drew the outline twice.
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
		// Each pentagon is its own object with its own spin axis, so a scene can
		// turn them individually — nothing does at the moment, but the structure
		// is here (PENTAGON_PAIRS groups the antipodal ones).
		pentagons,
		pentagonPairs: PENTAGON_PAIRS,
		scale: S,

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
