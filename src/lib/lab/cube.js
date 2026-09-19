import { Fn, uniform, vec4, uv, length, exp, pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { lineMaterial } from '$lib/three/tsl/materials';
import { elementUrl } from '$lib/data/roomElements';

// ── Sketch: the cube ─────────────────────────────────────────────────────────
// The reveal, remade. Not a flower any more: a closed cube, drawn as the site
// draws everything — flat fills, gold edges — seen isometrically. Light leaks
// along its twelve edges before anything moves. Then the two faces nearest
// the lens fold DOWN, outward, about their floor edges, and the lid lifts up
// and over about its far edge, and what was inside is a bedroom: a floor, two
// walls, a bed, a desk, a lamp, a monitor with the only light in the room on
// it, the decade's poster and clock on the walls. An actual room, in three
// dimensions, at the isometric angle every room in a game is drawn at.
//
// The orthographic camera sits on the (1, 1, 1) diagonal, which is what makes
// it isometric: the three visible faces of the closed cube are equal, and the
// three walls of the open room meet in one corner at the back.
//
//   ?decade=90s   whose poster and clock
//   ?over=95      degrees the front walls fall (90 lies flat)
//   ?bloom=0      without the glow

export const options = {};

const rad = (d) => (d * Math.PI) / 180;
const easeInOutPower = (u, p) => {
	const t = Math.max(0, Math.min(1, u));
	return t < 0.5 ? 0.5 * Math.pow(2 * t, p) : 1 - 0.5 * Math.pow(2 * (1 - t), p);
};
const window01 = (u, a, b) => Math.max(0, Math.min(1, (u - a) / (b - a)));

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const DECADE = q.get('decade') ?? '90s';
	const OVER = rad(Number(q.get('over') ?? 95));
	const BLOOM = q.get('bloom') !== '0';
	const DURATION = 11;

	const E = 2.4; // the cube's edge
	const GOLD = 0xf0c45c;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// ── The isometric lens ───────────────────────────────────────────────
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
	camera.position.set(10, 10, 10);
	camera.lookAt(0, -0.25, 0);
	let aspect = 1;
	let half = 2.4; // frustum half-height
	const frame = () => {
		camera.left = -half * aspect;
		camera.right = half * aspect;
		camera.top = half;
		camera.bottom = -half;
		camera.updateProjectionMatrix();
	};

	// ── Flat fills and gold edges ────────────────────────────────────────
	// Every face is one colour, darker by which way it faces — the whole of
	// isometric shading — and every edge is a gold line that moves with it.
	const SHADE = { top: 1.0, x: 0.8, z: 0.62 };
	const fill = (hex, shade, transparent = false) =>
		new THREE.MeshBasicNodeMaterial({
			color: new THREE.Color(hex).multiplyScalar(shade),
			side: THREE.DoubleSide,
			transparent
		});
	const edgeMat = lineMaterial(GOLD, 0.85);
	edgeMat.uniforms.uGrow.value = 2; // fully drawn
	edgeMat.uniforms.uBack.value = 0.7;
	edgeMat.uniforms.uRadius.value = 4;
	const uEdge = edgeMat.uniforms.uOpacity;
	const seamMat = lineMaterial(0xfff0c8, 0);
	seamMat.uniforms.uGrow.value = 2;
	seamMat.uniforms.uBack.value = 1;
	const uSeam = seamMat.uniforms.uOpacity;

	// A LineSegments from a flat pair list, with the grow attributes the line
	// material reads, all at zero delay.
	const lines = (pairs, mat) => {
		const n = pairs.length / 6;
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs), 3));
		const aT = new Float32Array(n * 2);
		for (let i = 0; i < n; i++) aT[i * 2 + 1] = 1;
		geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
		geo.setAttribute('aDelay', new THREE.BufferAttribute(new Float32Array(n * 2), 1));
		const l = new THREE.LineSegments(geo, mat);
		l.frustumCulled = false;
		return l;
	};
	// A box with its edges drawn.
	const box = (w, h, d, hex, { edges = true } = {}) => {
		const g = new THREE.Group();
		const shades = [SHADE.x, SHADE.x, SHADE.top, SHADE.top, SHADE.z, SHADE.z];
		const mats = shades.map((s) => fill(hex, s));
		const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
		g.add(mesh);
		if (edges) {
			const eg = new THREE.EdgesGeometry(mesh.geometry);
			g.add(lines(Array.from(eg.attributes.position.array), edgeMat));
		}
		return g;
	};
	// A square face of the cube, as a filled quad plus its outline, in a
	// group whose origin is its HINGE edge.
	const face = (hex, shade, fades = false) => {
		const g = new THREE.Group();
		const m = new THREE.Mesh(new THREE.PlaneGeometry(E, E), fill(hex, shade, fades));
		g.add(m);
		const h = E / 2;
		const outline = [
			-h,
			-h,
			0,
			h,
			-h,
			0,
			h,
			-h,
			0,
			h,
			h,
			0,
			h,
			h,
			0,
			-h,
			h,
			0,
			-h,
			h,
			0,
			-h,
			-h,
			0
		];
		g.add(lines(outline, edgeMat));
		g.add(lines(outline, seamMat));
		return { group: g, mesh: m };
	};

	// ── The cube ─────────────────────────────────────────────────────────
	const WALL = 0xc8a04a;
	const FLOOR = 0x6e522a;
	const LID = 0xd9b25a;
	const h = E / 2;
	const room = new THREE.Group();
	scene.add(room);

	// Floor and the two back walls stay. Their quads face inward.
	const floor = face(FLOOR, SHADE.top);
	floor.mesh.rotation.x = -Math.PI / 2;
	floor.group.position.y = -h;
	room.add(floor.group);
	const backLeft = face(WALL, SHADE.x); // the −x wall, seen from inside
	backLeft.mesh.rotation.y = Math.PI / 2;
	backLeft.group.position.x = -h;
	room.add(backLeft.group);
	const backRight = face(WALL, SHADE.z); // the −z wall
	backRight.group.position.z = -h;
	room.add(backRight.group);

	// The three that open. Each group's origin is the hinge, so rotating the
	// group folds the face about its own edge.
	const frontLeft = face(WALL, SHADE.x, true); // +x: falls outward about its floor edge
	frontLeft.mesh.rotation.y = Math.PI / 2;
	frontLeft.mesh.position.y = h;
	frontLeft.group.position.set(h, -h, 0);
	room.add(frontLeft.group);
	const frontRight = face(WALL, SHADE.z, true); // +z
	frontRight.mesh.position.y = h;
	frontRight.group.position.set(0, -h, h);
	room.add(frontRight.group);
	const lid = face(LID, SHADE.top, true); // +y: lifts about its far-left edge
	lid.mesh.rotation.x = -Math.PI / 2;
	lid.mesh.position.x = h;
	lid.group.position.set(-h, h, 0);
	room.add(lid.group);
	// The outlines of a face group were built about its own centre; the faces
	// are offset from their hinge, so shift the lines with the mesh.
	for (const f of [frontLeft, frontRight, lid]) {
		f.group.children.forEach((c) => {
			if (c !== f.mesh) {
				c.position.copy(f.mesh.position);
				c.rotation.copy(f.mesh.rotation);
			}
		});
	}
	for (const f of [floor, backLeft, backRight]) {
		f.group.children.forEach((c) => {
			if (c !== f.mesh) c.rotation.copy(f.mesh.rotation);
		});
	}

	// ── The bedroom ──────────────────────────────────────────────────────
	const inside = new THREE.Group();
	room.add(inside);
	const y0 = -h;
	// The bed, against the back-right wall.
	const bed = box(1.15, 0.32, 0.72, 0x4a6fb5);
	bed.position.set(0.35, y0 + 0.16, -h + 0.46);
	inside.add(bed);
	const head = box(0.08, 0.6, 0.72, 0x7a4a22);
	head.position.set(0.35 + 0.575 + 0.04, y0 + 0.3, -h + 0.46);
	inside.add(head);
	const pillow = box(0.3, 0.1, 0.5, 0xbdb8a6, { edges: false });
	pillow.position.set(0.75, y0 + 0.37, -h + 0.46);
	inside.add(pillow);
	// The desk, against the back-left wall.
	const deskTop = box(0.5, 0.06, 1.05, 0x8b5a2b);
	deskTop.position.set(-h + 0.3, y0 + 0.72, -0.05);
	inside.add(deskTop);
	for (const [dz] of [[-0.48], [0.48]]) {
		const leg = box(0.44, 0.66, 0.05, 0x6b4520, { edges: false });
		leg.position.set(-h + 0.3, y0 + 0.36, -0.05 + dz);
		inside.add(leg);
	}
	// The monitor: a box on the desk, facing +x, with the only light on it.
	const monitor = box(0.36, 0.34, 0.42, 0x3a3a44);
	monitor.position.set(-h + 0.32, y0 + 0.75 + 0.17, -0.05);
	inside.add(monitor);
	const uScreen = uniform(0);
	const screenMat = new THREE.MeshBasicNodeMaterial();
	screenMat.colorNode = Fn(() => {
		const d = length(uv().sub(0.5)).mul(2.0);
		const glow = exp(d.mul(d).mul(-1.6));
		return vec4(
			vec4(1.0, 0.94, 0.78, 1.0)
				.rgb.mul(glow)
				.mul(uScreen)
				.add(vec4(0.02, 0.02, 0.03, 1).rgb),
			1.0
		);
	})();
	const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.26), screenMat);
	screen.rotation.y = Math.PI / 2;
	screen.position.set(-h + 0.32 + 0.181, y0 + 0.75 + 0.19, -0.05);
	inside.add(screen);
	// The lamp: a base, a stalk and a red shade.
	const lampBase = box(0.16, 0.03, 0.16, 0xb32e22, { edges: false });
	lampBase.position.set(-h + 0.3, y0 + 0.765, 0.42);
	inside.add(lampBase);
	const stalk = box(0.025, 0.42, 0.025, 0xb32e22, { edges: false });
	stalk.position.set(-h + 0.3, y0 + 0.97, 0.42);
	inside.add(stalk);
	const shade = new THREE.Mesh(
		new THREE.ConeGeometry(0.11, 0.16, 16, 1, true),
		fill(0xd83a2a, SHADE.x)
	);
	shade.rotation.x = Math.PI;
	shade.position.set(-h + 0.3, y0 + 1.2, 0.42);
	inside.add(shade);
	// The poster and the clock, on the walls, from the decade's own drawings.
	const loader = new THREE.TextureLoader();
	const hang = async (key, w, x, y, z, ry) => {
		const tex = await loader.loadAsync(elementUrl(DECADE, key));
		tex.colorSpace = THREE.SRGBColorSpace;
		const a = tex.image.width / tex.image.height;
		const m = new THREE.Mesh(
			new THREE.PlaneGeometry(w, w / a),
			new THREE.MeshBasicNodeMaterial({ map: tex, transparent: true })
		);
		m.position.set(x, y, z);
		m.rotation.y = ry;
		inside.add(m);
	};
	await hang('poster', 0.62, 0.45, y0 + 1.55, -h + 0.012, 0);
	await hang('clock', 0.3, -h + 0.012, y0 + 1.75, 0.15, Math.PI / 2);

	// ── Post ─────────────────────────────────────────────────────────────
	let post = null;
	let bloomed = false;
	if (BLOOM) {
		try {
			post = new THREE.RenderPipeline(renderer);
			const scenePass = pass(scene, camera);
			post.outputNode = scenePass.add(bloom(scenePass, 0.7, 0.5, 0.75));
			bloomed = true;
		} catch {
			post = null;
		}
	}

	const info = { decade: DECADE, over: Number(q.get('over') ?? 95), bloom: bloomed, open: 0 };

	function set(u) {
		// Light along the edges before anything moves.
		uSeam.value = 0.9 * window01(u, 0.04, 0.26) * (1 - 0.6 * window01(u, 0.55, 0.9));
		uEdge.value = 0.55 + 0.4 * window01(u, 0.04, 0.3);
		// The front walls fall outward; the lid lifts up and over.
		const a = easeInOutPower(window01(u, 0.24, 0.62), 3.5);
		const b = easeInOutPower(window01(u, 0.34, 0.74), 3.5);
		const c = easeInOutPower(window01(u, 0.5, 0.9), 3.5);
		frontLeft.group.rotation.z = -OVER * a;
		frontRight.group.rotation.x = OVER * b;
		lid.group.rotation.z = rad(168) * c;
		// Once open, what opened gets out of the way: the flaps and the lid thin
		// to a trace, so the room is what is looked at.
		const gone = 1 - 0.8 * window01(u, 0.72, 0.95);
		for (const f of [frontLeft, frontRight, lid]) f.mesh.material.opacity = gone;
		// The monitor comes on as the room is seen, and the lens closes on it.
		uScreen.value = 1.4 * window01(u, 0.55, 0.95);
		half = 2.4 - 0.55 * easeInOutPower(window01(u, 0.6, 1.0), 2.5);
		frame();
		info.open = Number(c.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;
	frame();

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 2);
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
		resize(w, h2) {
			aspect = w / h2;
			frame();
		}
	};
}
