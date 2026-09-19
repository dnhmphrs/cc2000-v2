import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { lineMaterial, dotMaterial, dots } from '$lib/three/tsl/materials';

// ── Sketch: the lattice ──────────────────────────────────────────────────────
// The wildcard, and the step between the impact and the room. The primes are
// what the strike rang out; the integers are what the primes make. Every
// whole number is 2^a·3^b·5^c·…, and if you take log of that it is a SUM —
// a·log 2 + b·log 3 + c·log 5 — which is to say every integer is a point of
// a lattice whose axes are the logarithms of the primes. Three primes give
// three dimensions: this is every number with no prime factor above 5, up to
// a hundred million, placed at (a log 2, b log 3, c log 5), joined to twice,
// three times and five times itself.
//
// It builds outward from 1 at the origin. Then the lens closes on the one
// cell at the origin — the box with edges log 2, log 3, log 5, whose corners
// are 1, 2, 3, 5, 6, 10, 15, 30 — and comes round onto its diagonal, which is
// the isometric angle the cube is seen from. The box is the cube.
//
//   ?max=1e8     how far up the integers go     ?bloom=0   without the glow

export const options = {};

const smoothstep = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const easeInOutPower = (u, p) => {
	const t = Math.max(0, Math.min(1, u));
	return t < 0.5 ? 0.5 * Math.pow(2 * t, p) : 1 - 0.5 * Math.pow(2 * (1 - t), p);
};

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const MAX = Number(q.get('max') ?? 1e8);
	const BLOOM = q.get('bloom') !== '0';
	const DURATION = 9;

	const P = [2, 3, 5];
	const L = P.map(Math.log);
	const LMAX = Math.log(MAX);

	// ── The points ───────────────────────────────────────────────────────
	// Every (a, b, c) with a log 2 + b log 3 + c log 5 ≤ log MAX.
	const points = []; // { a, b, c, x, y, z, logn }
	const index = new Map();
	for (let a = 0; a * L[0] <= LMAX; a++)
		for (let b = 0; a * L[0] + b * L[1] <= LMAX; b++)
			for (let c = 0; a * L[0] + b * L[1] + c * L[2] <= LMAX; c++) {
				const logn = a * L[0] + b * L[1] + c * L[2];
				index.set(`${a},${b},${c}`, points.length);
				points.push({ a, b, c, x: a * L[0], y: b * L[1], z: c * L[2], logn });
			}
	// Centred on its centroid, so the lattice turns about its own middle.
	const centroid = new THREE.Vector3();
	for (const p of points) centroid.add(new THREE.Vector3(p.x, p.y, p.z));
	centroid.multiplyScalar(1 / points.length);

	// ── The edges: n to 2n, 3n, 5n ───────────────────────────────────────
	const families = [[], [], []]; // flat pair lists
	const delays = [[], [], []];
	for (const p of points) {
		const steps = [
			[p.a + 1, p.b, p.c],
			[p.a, p.b + 1, p.c],
			[p.a, p.b, p.c + 1]
		];
		steps.forEach(([a, b, c], f) => {
			const j = index.get(`${a},${b},${c}`);
			if (j === undefined) return;
			const r = points[j];
			families[f].push(p.x, p.y, p.z, r.x, r.y, r.z);
			// Drawn outward from 1: a segment starts when its inner end arrives.
			delays[f].push(p.logn / LMAX);
		});
	}

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	const world = new THREE.Group();
	world.position.copy(centroid).negate();
	scene.add(world);

	const lineSet = (pairs, delayOf, hex, opacity) => {
		const n = pairs.length / 6;
		const geo = new THREE.BufferGeometry();
		const pos = new Float32Array(pairs);
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const aT = new Float32Array(n * 2);
		const aDelay = new Float32Array(n * 2);
		for (let i = 0; i < n; i++) {
			aT[i * 2 + 1] = 1;
			aDelay[i * 2] = aDelay[i * 2 + 1] = delayOf[i];
		}
		geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
		geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
		const mat = lineMaterial(hex, opacity);
		mat.uniforms.uSpan.value = 0.12;
		mat.uniforms.uBack.value = 0.35;
		mat.uniforms.uRadius.value = 10;
		const lines = new THREE.LineSegments(geo, mat);
		lines.frustumCulled = false;
		world.add(lines);
		return mat;
	};
	const GOLD = 0xf0c45c;
	const famMats = [
		lineSet(families[0], delays[0], GOLD, 0.55),
		lineSet(families[1], delays[1], GOLD, 0.4),
		lineSet(families[2], delays[2], GOLD, 0.3)
	];
	// The points, as drawn dots — brighter the smaller the number.
	const dotPos = new Float32Array(points.length * 3);
	points.forEach((p, i) => dotPos.set([p.x, p.y, p.z], i * 3));
	const dotGeo = new THREE.BufferGeometry();
	dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
	const dotMat = dotMaterial(0xffe6a3, 4.5);
	world.add(dots(dotGeo, dotMat));

	// ── The cell at the origin: the box ──────────────────────────────────
	const [lx, ly, lz] = L;
	const c = (x, y, z) => [x, y, z];
	const corners = [
		c(0, 0, 0),
		c(lx, 0, 0),
		c(0, ly, 0),
		c(lx, ly, 0),
		c(0, 0, lz),
		c(lx, 0, lz),
		c(0, ly, lz),
		c(lx, ly, lz)
	];
	const cellEdges = [
		[0, 1],
		[2, 3],
		[4, 5],
		[6, 7],
		[0, 2],
		[1, 3],
		[4, 6],
		[5, 7],
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7]
	];
	const cellPairs = [];
	for (const [i, j] of cellEdges) cellPairs.push(...corners[i], ...corners[j]);
	const cellMat = lineSet(
		cellPairs,
		cellEdges.map(() => 0),
		0xfff0c8,
		0
	);
	cellMat.uniforms.uBack.value = 0.9;
	const cellCentre = new THREE.Vector3(lx / 2, ly / 2, lz / 2);

	// ── The lens ─────────────────────────────────────────────────────────
	const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 500);
	const lookAt = new THREE.Vector3();

	let post = null;
	let bloomed = false;
	if (BLOOM) {
		try {
			post = new THREE.RenderPipeline(renderer);
			const scenePass = pass(scene, camera);
			post.outputNode = scenePass.add(bloom(scenePass, 0.7, 0.45, 0.6));
			bloomed = true;
		} catch {
			post = null;
		}
	}

	const info = { points: points.length, edges: families.map((f) => f.length / 6), bloom: bloomed };

	function set(u) {
		// The lattice draws itself on, outward from 1.
		const grow = smoothstep(0.0, 0.5, u);
		for (const m of famMats) m.uniforms.uGrow.value = grow * (1 + m.uniforms.uSpan.value);
		// Then the lens closes on the cell and the rest thins away.
		const close = easeInOutPower(smoothstep(0.55, 1.0, u), 2.5);
		famMats[0].uniforms.uOpacity.value = 0.55 * (1 - 0.85 * close);
		famMats[1].uniforms.uOpacity.value = 0.4 * (1 - 0.85 * close);
		famMats[2].uniforms.uOpacity.value = 0.3 * (1 - 0.85 * close);
		// The points are there from the first frame — faint, then lit as the
		// edges reach them.
		const seen = Math.max(0.35 * smoothstep(0, 0.06, u), grow);
		dotMat.uniforms.uOpacity.value = 0.9 * seen * (1 - 0.7 * close);
		cellMat.uniforms.uGrow.value = 2;
		cellMat.uniforms.uOpacity.value = 1.2 * smoothstep(0.5, 0.8, u);

		// Far and turning, then in onto the box, ending on its (1,1,1)
		// diagonal — the isometric angle, which is the cube's.
		const azFar = 0.55 + u * 1.1;
		const elFar = 0.42;
		const dFar = 52;
		const azNear = Math.PI / 4;
		const elNear = Math.atan(1 / Math.sqrt(2));
		const dNear = 3.1;
		const az = azFar + (azNear - azFar) * close;
		const el = elFar + (elNear - elFar) * close;
		const dist = dFar + (dNear - dFar) * close;
		// What it looks at: the lattice's middle, then the cell.
		lookAt.copy(new THREE.Vector3()).lerp(cellCentre.clone().sub(centroid), close);
		camera.position.set(
			lookAt.x + dist * Math.cos(el) * Math.sin(az),
			lookAt.y + dist * Math.sin(el),
			lookAt.z + dist * Math.cos(el) * Math.cos(az)
		);
		camera.lookAt(lookAt);
		camera.near = 0.02 * dist;
		camera.far = 20 * dist;
		camera.updateProjectionMatrix();
		info.close = Number(close.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
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
