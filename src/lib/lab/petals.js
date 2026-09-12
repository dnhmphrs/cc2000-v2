import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { VERTICES, ADJACENCY, CIRCUMRADIUS, FIVE_FOLD_VIEW } from '$lib/three/geometry/icosahedron';

// ── Sketch: PETALS ───────────────────────────────────────────────────────────
// The reveal. The icosahedron opens as a flower and the ending is inside it.
//
// It is the solid itself opening, not a new object arriving at the climax:
// FIVE faces around the far vertex stay rigid as a calyx, and the other
// FIFTEEN hinge as five congruent three-face petals — a band-up triangle, a
// band-down triangle and a top cap — each rooted on one edge of the calyx's
// rim, so the five tips meet at the near vertex and the bud cracks open there
// first. Every hinge is a real edge of the icosahedron, every cut is a real
// edge, and nothing flattens: this is a partial unfolding, and it has to be —
// of the 43,380 nets of the icosahedron not one has five-fold symmetry, so a
// "star net" that opens like a flower does not exist. (Enumerated in the
// research. Worth knowing before spending a week looking for it.)
//
// Inside the calyx is a light. It is the only light and the only colour, and
// it leaks along the ten cut edges before any hinge has visibly moved — the
// bud glows at its seams, then opens. Plain depth testing does the reveal: the
// petals are opaque, so what is inside is seen exactly as much as the opening
// allows, and no portal, stencil or render target is involved.
//
// Opening is outboard-first — the cap folds back, then the band, then the
// whole petal at the rim — on a power-3.5 ease, so the first quarter of the
// time moves under three percent of the angle. The camera holds on the axis.
export default async function make({ THREE, renderer, at }) {
	const DURATION = 9; // seconds, live — the longest beat in the run
	const S = 1.55 / CIRCUMRADIUS; // closed bud circumradius in world units
	const OPEN = 1.15 * THREE.MathUtils.degToRad(41.8103); // a little past flat: reflexed
	const TIP = 0; // FIVE_FOLD_VIEW puts vertex 0 on +z
	const BASE = 3; // its antipode

	// ── Orient: tip on +z, calyx apex on −z ──────────────────────────────
	const P = VERTICES.map((v) =>
		new THREE.Vector3(...v).applyQuaternion(FIVE_FOLD_VIEW).multiplyScalar(S)
	);
	const azimuth = (i) => Math.atan2(P[i].y, P[i].x);
	const ring = (apex) => ADJACENCY[apex].slice().sort((a, b) => azimuth(a) - azimuth(b));
	const t = ring(TIP); // upper ring, by azimuth
	const bRaw = ring(BASE); // lower ring
	// b_i sits between t_i and t_{i+1}: the lower vertex adjacent to both.
	const b = t.map((ti, i) => {
		const tn = t[(i + 1) % 5];
		return bRaw.find((bj) => ADJACENCY[bj].includes(ti) && ADJACENCY[bj].includes(tn));
	});
	if (b.some((x) => x === undefined)) throw new Error('petals: ring interleave failed');

	// ── The twenty faces, grouped ────────────────────────────────────────
	// calyx i   (B, b_i, b_{i+1})                 rigid
	// up_i      (b_i, b_{i+1}, t_{i+1})           hinge h1 = rim edge (b_i, b_{i+1})
	// down_i    (t_{i+1}, t_{i+2}, b_{i+1})       hinge h2 = (b_{i+1}, t_{i+1})
	// top_i     (T, t_{i+1}, t_{i+2})             hinge h3 = (t_{i+1}, t_{i+2})
	// cuts: the five spokes (T, t_j) and the five slants (b_{i+1}, t_{i+2}).
	const petals = [];
	const calyx = [];
	for (let i = 0; i < 5; i++) {
		const i1 = (i + 1) % 5;
		const i2 = (i + 2) % 5;
		calyx.push([BASE, b[i], b[i1]]);
		petals.push({
			faces: [
				[b[i], b[i1], t[i1]],
				[t[i1], t[i2], b[i1]],
				[TIP, t[i1], t[i2]]
			],
			hinges: [
				[b[i], b[i1]],
				[b[i1], t[i1]],
				[t[i1], t[i2]]
			],
			// The vertex each hinge frees, to fix the sign of "outward".
			free: [t[i1], t[i2], TIP]
		});
	}
	const cuts = [];
	for (let j = 0; j < 5; j++) cuts.push([TIP, t[j]]);
	for (let i = 0; i < 5; i++) cuts.push([b[(i + 1) % 5], t[(i + 2) % 5]]);

	// A rotation about the line through a and b by angle, as a Matrix4 —
	// signed so that the freed vertex moves AWAY from the centre.
	const rotAbout = (a, bb, free, angle, out) => {
		const axis = new THREE.Vector3().subVectors(P[bb], P[a]).normalize();
		const m = new THREE.Matrix4().makeRotationAxis(axis, angle);
		// Sign test: does +angle push the free vertex outward?
		const probe = P[free]
			.clone()
			.sub(P[a])
			.applyMatrix4(new THREE.Matrix4().makeRotationAxis(axis, 0.05))
			.add(P[a]);
		const sign = probe.length() > P[free].length() ? 1 : -1;
		m.makeRotationAxis(axis, angle * sign);
		out
			.makeTranslation(P[a].x, P[a].y, P[a].z)
			.multiply(m)
			.multiply(new THREE.Matrix4().makeTranslation(-P[a].x, -P[a].y, -P[a].z));
		return out;
	};

	// ── Meshes: skins, edges, seams, the light inside ────────────────────
	const FACE_N = 20;
	const skinPos = new Float32Array(FACE_N * 3 * 3);
	const skinGeo = new THREE.BufferGeometry();
	skinGeo.setAttribute('position', new THREE.BufferAttribute(skinPos, 3));
	const skinMat = new THREE.MeshBasicNodeMaterial({ color: 0x040404, side: THREE.DoubleSide });
	const skin = new THREE.Mesh(skinGeo, skinMat);

	const edgePos = new Float32Array(FACE_N * 3 * 2 * 3);
	const edgeGeo = new THREE.BufferGeometry();
	edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
	const edgeMat = new THREE.LineBasicNodeMaterial({
		color: new THREE.Color(0.95 * 0.55, 0.78 * 0.55, 0.36 * 0.55)
	});
	edgeMat.transparent = true;
	edgeMat.depthWrite = false;
	edgeMat.blending = THREE.AdditiveBlending;
	const edgesMesh = new THREE.LineSegments(edgeGeo, edgeMat);

	const seamPos = new Float32Array(cuts.length * 2 * 2 * 3); // each cut edge, both faces' copies
	const seamGeo = new THREE.BufferGeometry();
	seamGeo.setAttribute('position', new THREE.BufferAttribute(seamPos, 3));
	const seamMat = new THREE.LineBasicNodeMaterial({ color: new THREE.Color(1.0, 0.72, 0.18) });
	seamMat.transparent = true;
	seamMat.depthWrite = false;
	seamMat.blending = THREE.AdditiveBlending;
	seamMat.opacity = 0;
	const seams = new THREE.LineSegments(seamGeo, seamMat);

	// The light inside: THE ENDING, deep in the calyx, facing the tip — the
	// room illustration on a plane, lit past white so its highlights bloom
	// through the crack. A stand-in for the live room; the point is that what
	// the flower opens on is the picture the run has been travelling toward.
	const glowMat = new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(1.12, 1.05, 0.95) });
	const glow = new THREE.Mesh(
		new THREE.PlaneGeometry(0.92 * S * CIRCUMRADIUS, 0.92 * S * CIRCUMRADIUS),
		glowMat
	);
	glow.position.z = -0.42 * S * CIRCUMRADIUS;
	new THREE.TextureLoader().load('/90s_Illustration.jpg', (tex) => {
		tex.colorSpace = THREE.SRGBColorSpace;
		glowMat.map = tex;
		glowMat.needsUpdate = true;
		const a = (tex.image?.width || 1) / (tex.image?.height || 1);
		glow.scale.set(a >= 1 ? 1 : a, a >= 1 ? 1 / a : 1, 1);
	});
	// A soft halo behind it so the crack reads as light, not as a white line.
	const haloMat = new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(0.9, 0.6, 0.2) });
	haloMat.transparent = true;
	haloMat.opacity = 0.35;
	haloMat.depthWrite = false;
	const halo = new THREE.Mesh(new THREE.CircleGeometry(0.95 * S * CIRCUMRADIUS, 48), haloMat);
	halo.position.z = -0.6 * S * CIRCUMRADIUS;

	const scene = new THREE.Scene();
	scene.add(halo, glow, skin, edgesMesh, seams);
	const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 0, 13);

	let post = null;
	let bloomed = false;
	try {
		post = new THREE.RenderPipeline(renderer);
		const scenePass = pass(scene, camera);
		post.outputNode = scenePass.add(bloom(scenePass, 0.9, 0.5, 0.5));
		bloomed = true;
	} catch {
		post = null;
	}

	// ── The frame at u ───────────────────────────────────────────────────
	const window01 = (x, a, bb) => Math.max(0, Math.min(1, (x - a) / (bb - a)));
	const easeInOutPower = (x, k) =>
		x < 0.5 ? 0.5 * Math.pow(2 * x, k) : 1 - 0.5 * Math.pow(2 - 2 * x, k);
	const M1 = new THREE.Matrix4();
	const M2 = new THREE.Matrix4();
	const M3 = new THREE.Matrix4();
	const Mup = new THREE.Matrix4();
	const Mdown = new THREE.Matrix4();
	const Mtop = new THREE.Matrix4();
	const v = new THREE.Vector3();
	const ORDER = [0, 2, 4, 1, 3]; // the stagger, in 2/5-phyllotaxis order
	const cutCopies = new Map(); // cut edge key -> the two transformed copies

	function set(u) {
		// Power 2.6: slow to crack, and the opening itself takes the whole beat
		// rather than being over by the middle of it.
		const e = easeInOutPower(u, 2.6);
		let f = 0; // face cursor
		let ed = 0; // edge cursor
		cutCopies.clear();
		const putFace = (tri, M) => {
			const pts = tri.map((i) => v.copy(P[i]).applyMatrix4(M).clone());
			for (let k = 0; k < 3; k++) {
				skinPos.set([pts[k].x, pts[k].y, pts[k].z], (f * 3 + k) * 3);
				const q = pts[(k + 1) % 3];
				edgePos.set([pts[k].x, pts[k].y, pts[k].z, q.x, q.y, q.z], ed * 6);
				ed++;
				const key =
					tri[k] < tri[(k + 1) % 3]
						? `${tri[k]}-${tri[(k + 1) % 3]}`
						: `${tri[(k + 1) % 3]}-${tri[k]}`;
				if (!cutCopies.has(key)) cutCopies.set(key, []);
				cutCopies.get(key).push([pts[k], q]);
			}
			f++;
		};
		const I = new THREE.Matrix4();
		for (const tri of calyx) putFace(tri, I);
		petals.forEach((pt, i) => {
			const lag = ORDER.indexOf(i) * 0.05;
			const ee = Math.max(0, e - lag) / (1 - 0.2);
			const a3 = OPEN * window01(ee, 0.0, 0.6);
			const a2 = OPEN * window01(ee, 0.15, 0.8);
			const a1 = OPEN * window01(ee, 0.3, 1.0);
			rotAbout(pt.hinges[0][0], pt.hinges[0][1], pt.free[0], a1, M1);
			rotAbout(pt.hinges[1][0], pt.hinges[1][1], pt.free[1], a2, M2);
			rotAbout(pt.hinges[2][0], pt.hinges[2][1], pt.free[2], a3, M3);
			Mup.copy(M1);
			Mdown.copy(M1).multiply(M2);
			Mtop.copy(M1).multiply(M2).multiply(M3);
			putFace(pt.faces[0], Mup);
			putFace(pt.faces[1], Mdown);
			putFace(pt.faces[2], Mtop);
		});
		// The seams: both copies of each cut edge, lit before anything moves.
		let sp = 0;
		for (const [a, bb] of cuts) {
			const key = a < bb ? `${a}-${bb}` : `${bb}-${a}`;
			const copies = cutCopies.get(key) ?? [];
			for (const [p0, p1] of copies.slice(0, 2)) {
				seamPos.set([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z], sp * 6);
				sp++;
			}
		}
		seamMat.opacity = 0.9 * window01(u, 0.05, 0.3) * (1 - 0.5 * window01(u, 0.6, 1));
		skinGeo.attributes.position.needsUpdate = true;
		edgeGeo.attributes.position.needsUpdate = true;
		seamGeo.attributes.position.needsUpdate = true;
		seamGeo.setDrawRange(0, sp * 2);
	}

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info: { petals: 5, faces: FACE_N, cuts: cuts.length, bloom: bloomed },
		update(dt) {
			tt = (tt + dt) % (DURATION + 2);
			set(Math.min(tt / DURATION, 1));
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
