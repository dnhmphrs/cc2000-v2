import { vec4 } from 'three/tsl';
import { LAYERS, placement, elementUrl } from '$lib/data/roomElements';
import { SCREEN_GLASS } from '$lib/config/layout';
import { PHI } from '$lib/three/geometry/icosahedron';
import { loadSwimmer } from './swimmer';
import { glassOnly } from './glass';

// ── Sketch four: rooms through rooms, through the decades ────────────────────
// The site's room is six flat drawings at six depths behind a golden-rectangle
// frame, and every decade's monitor has a glass painted one flat colour. This
// puts the NEXT decade's room inside that glass, and the next inside that
// one's, ten deep, and falls through them — with the swimmer riding down the
// middle, ahead of the lens, into every screen in turn.
//
// Each level is a 3D similarity of its parent: level k+1's frame is placed on
// level k's glass, scaled so the glass-aspect crop of the frame lands exactly
// on the glass (N = crop width / glass width, 3.4–3.9 for the four rooms), and
// turned by the screw angle about the glass centre. Real quads at real depth,
// so the six layers keep their parallax at every level. Because the decades
// differ, the nest is no longer one similarity repeated: every level has its
// own N and its own fixed point, and the camera walks each level's spiral
// similarity to its fractional power — c(f) = p' + R(fθ)·N^−f·(c0 − p') with
// p' = (I − R(θ)/N)⁻¹·g — so the frame at ζ = k+1 IS the picture the child
// starts on, and the crossing has no seam.
//
// Each level is clipped to its parent's glass by a stencil chain: back layers
// draw where stencil == k+1, a glass-only quad (the monitor sprite with all
// but its glass colour discarded, colour write off) increments it, the next
// level draws where it is k+2, and every level's desk and bed are drawn
// afterwards, deepest first, where stencil ≥ k+1. Once the camera has passed
// a glass plane that level is dropped and the stencil is CLEARED to the new
// base, so no material ever changes.
//
//   ?decades=90s,60s,10s,50s   the cycle, outermost first
//   ?levels=10  copies built     ?fall=4  levels fallen over the run
//   ?fov=34     the lens the fall opens out to (from the site's 12°)
//   ?sway=0.08  lateral truck about the axis, per level, in frame heights
//   ?screw=15   degrees of turn per level (0 for a straight nest)
//   ?sperm=0    without the swimmer

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
const smootherstep = (x) => {
	const t = Math.max(0, Math.min(1, x));
	return t * t * t * (t * (t * 6 - 15) + 10);
};
const smoothstep = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const DECADES = (q.get('decades') ?? '90s,60s,10s,50s').split(',');
	const LEVELS = Number(q.get('levels') ?? 10);
	const FALL = Number(q.get('fall') ?? 4);
	const FOV0 = 12; // ICOSA.fov — where the site lands
	const FOV1 = Number(q.get('fov') ?? 34);
	const SWAY = Number(q.get('sway') ?? 0.08);
	const SCREW = rad(Number(q.get('screw') ?? 15));
	const SPERM = q.get('sperm') !== '0';
	const zetaHeld = q.get('zeta'); // pin ζ directly (diagnostics)
	const LINEAR = q.get('lin') === '1'; // ζ = FALL·at, no ease (diagnostics)
	const DURATION = 14;

	const W = 2 * PHI; // the golden rectangle, landscape: 3.236 × 2
	const H = 2;
	const DEPTH = 3.0; // ICOSA.roomDepth
	const WALL_COVER = 2; // see below

	// ── The drawings, per decade ─────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const textures = {}; // decade -> key -> texture
	await Promise.all(
		[...new Set(DECADES)].map(async (decade) => {
			textures[decade] = {};
			await Promise.all(
				LAYERS.map(async (cfg) => {
					const tex = await loader.loadAsync(elementUrl(decade, cfg.key));
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.generateMipmaps = true;
					tex.minFilter = THREE.LinearMipmapLinearFilter;
					tex.magFilter = THREE.LinearFilter;
					tex.anisotropy = Math.min(4, maxAniso);
					textures[decade][cfg.key] = tex;
				})
			);
		})
	);

	// RoomProjection.layout(), landscape, in the frame's own coordinates:
	// x right, y up, z toward the viewer, the frame plane at z = 0.
	function layout(decade, cfg) {
		const tex = textures[decade][cfg.key];
		const aspect = tex.image.width / tex.image.height;
		const pos = placement(cfg, decade, false);
		let w, h;
		if (cfg.cover) {
			if (W / H > aspect) {
				w = W;
				h = W / aspect;
			} else {
				h = H;
				w = H * aspect;
			}
		} else {
			w = pos.width * W;
			h = w / aspect;
		}
		return { w, h, x: ((pos.x || 0) * W) / 2, y: ((pos.y || 0) * H) / 2, z: -cfg.depth * DEPTH };
	}
	// A room: its six layers laid out, and where its glass is.
	function room(decade) {
		const L = Object.fromEntries(LAYERS.map((cfg) => [cfg.key, layout(decade, cfg)]));
		const g = SCREEN_GLASS[decade];
		const glass = {
			x: L.screen.x + (g.cx - 0.5) * L.screen.w,
			y: L.screen.y + (0.5 - g.cy) * L.screen.h,
			z: L.screen.z,
			w: g.w * L.screen.w,
			h: g.h * L.screen.h
		};
		return { decade, L, glass };
	}

	// ── The nest ─────────────────────────────────────────────────────────
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	const plane = new THREE.PlaneGeometry(1, 1);
	// The wall is drawn to cover the FRAME, which only covers the frustum from
	// infinitely far. The site hides that by flattening the room as it falls
	// in; this keeps the depth and extends the wall instead, smearing its own
	// edge pixels outward (clamped UVs on a doubled quad).
	const wallPlane = plane.clone();
	{
		const a = wallPlane.attributes.uv;
		for (let i = 0; i < a.count; i++) {
			a.setXY(i, (a.getX(i) - 0.5) * WALL_COVER + 0.5, (a.getY(i) - 0.5) * WALL_COVER + 0.5);
		}
	}
	const BACK = ['bg', 'poster', 'clock', 'screen'];
	const FRONT = ['desk', 'bed'];

	// The stencil chain. Clip 0 is the golden rectangle itself — the site's
	// window onto the room — and clip k+1 is level k's glass. Level k draws
	// where the stencil is k+1.
	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};
	const frameMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		colorWrite: false
	});
	frameMat.colorNode = vec4(0, 0, 0, 1);
	stencilOf(frameMat, 0, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
	const frameQuad = new THREE.Mesh(plane, frameMat);
	frameQuad.scale.set(W, H, 1);
	frameQuad.renderOrder = -1;
	frameQuad.frustumCulled = false;
	scene.add(frameQuad);

	const zAxis = new THREE.Vector3(0, 0, 1);
	const levels = [];
	let parent = null;
	for (let k = 0; k < LEVELS; k++) {
		const r = room(DECADES[k % DECADES.length]);
		const group = new THREE.Group();
		// Level 0 is the frame itself. Level k+1 sits on level k's glass: the
		// glass-aspect crop of ITS frame is scaled onto the glass, and it is
		// turned by the screw about the glass centre.
		let N = 1;
		if (parent) {
			const pg = parent.glass;
			const ga = pg.w / pg.h;
			const Kw = ga < W / H ? H * ga : W;
			N = Kw / pg.w;
			group.position.set(pg.x, pg.y, pg.z);
			group.scale.setScalar(1 / N);
			group.quaternion.setFromAxisAngle(zAxis, SCREW);
			parent.group.add(group);
		} else {
			scene.add(group);
		}

		const meshes = [];
		const sprite = (key, mat, order) => {
			const l = r.L[key];
			const wall = key === 'bg';
			const m = new THREE.Mesh(wall ? wallPlane : plane, mat);
			const f = wall ? WALL_COVER : 1;
			m.scale.set(l.w * f, l.h * f, 1);
			m.position.set(l.x, l.y, l.z);
			m.renderOrder = order;
			m.frustumCulled = false;
			group.add(m);
			meshes.push(m);
			return m;
		};
		const stencil = (mat, func, op) => stencilOf(mat, k + 1, func, op);
		const flat = (key) =>
			new THREE.MeshBasicNodeMaterial({
				map: textures[r.decade][key],
				transparent: true,
				depthTest: false,
				depthWrite: false
			});

		BACK.forEach((key, i) =>
			sprite(key, stencil(flat(key), THREE.EqualStencilFunc, THREE.KeepStencilOp), 10 * k + i)
		);
		const gm = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			colorWrite: false
		});
		gm.colorNode = glassOnly(r.decade, textures[r.decade].screen)();
		sprite('screen', stencil(gm, THREE.EqualStencilFunc, THREE.IncrementStencilOp), 10 * k + 4);
		// Front layers: after every level's back, deepest level first.
		FRONT.forEach((key, j) =>
			sprite(
				key,
				stencil(flat(key), THREE.LessEqualStencilFunc, THREE.KeepStencilOp),
				10 * (LEVELS + 1) + 10 * (LEVELS - 1 - k) + j
			)
		);
		const lv = { ...r, group, meshes, N };
		levels.push(lv);
		parent = lv;
	}
	scene.updateMatrixWorld(true);
	// Each level's fixed point, in its own coordinates: the point its child's
	// spiral similarity x ↦ g + R(θ)·x/N leaves where it is. The camera walks
	// that similarity to a fractional power, so this is what it converges on.
	for (let k = 0; k < LEVELS - 1; k++) {
		const lv = levels[k];
		const N = levels[k + 1].N;
		const a = 1 - Math.cos(SCREW) / N;
		const b = Math.sin(SCREW) / N;
		const det = a * a + b * b;
		const g = lv.glass;
		lv.fixed = new THREE.Vector3(
			(a * g.x - b * g.y) / det,
			(b * g.x + a * g.y) / det,
			(N * g.z) / (N - 1)
		);
		// Where this level's glass plane is, in the world — a clip plane.
		lv.glassZ = lv.group.localToWorld(new THREE.Vector3(g.x, g.y, g.z)).z;
	}
	const clipZ = [0, ...levels.slice(0, LEVELS - 1).map((lv) => lv.glassZ)];

	// ── The swimmer ──────────────────────────────────────────────────────
	// Rides ahead of the lens, down the axis of the fall, into every screen.
	const SPERM_SPAN = 0.3; // of the frame's half-height, at the riding distance
	const SPERM_RIDE = 0.5; // of the distance to the frame being fallen into
	let swimmer = null;
	if (SPERM) {
		swimmer = await loadSwimmer({ height: 1, gain: 1.15 });
		swimmer.material.depthTest = false;
		swimmer.group.traverse((o) => {
			o.renderOrder = 100000;
			o.frustumCulled = false;
		});
		scene.add(swimmer.group);
	}

	// ── The camera ───────────────────────────────────────────────────────
	const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.05, 100);
	let aspect = 1;

	const info = {
		decades: DECADES,
		levels: LEVELS,
		fall: FALL,
		N: levels.slice(1).map((lv) => Number(lv.N.toFixed(3))),
		base: 0,
		fov: FOV0
	};

	const wq = new THREE.Quaternion();
	const rq = new THREE.Quaternion();
	const local = new THREE.Vector3();
	const fwd = new THREE.Vector3();
	function set(u) {
		const zeta = Math.min(
			zetaHeld !== null ? Number(zetaHeld) : LINEAR ? FALL * u : FALL * smootherstep(u),
			LEVELS - 1.001
		);
		const k = Math.floor(zeta);
		const f = zeta - k;
		const lv = levels[k];
		const N = levels[k + 1].N;
		const s = Math.pow(N, -f);
		const fov = FOV0 + (FOV1 - FOV0) * smoothstep(0, 1.6, zeta);
		// The frame at level ζ fills the height, whatever the lens: a dolly zoom
		// while falling. The camera never turns except to roll with the screw.
		const d0 = H / 2 / Math.tan(rad(fov) / 2);
		const p = lv.fixed;
		const ex = SWAY * H * Math.sin(2 * Math.PI * f);
		const ey = SWAY * H * 0.5 * (Math.cos(2 * Math.PI * f) - 1);
		const roll = f * SCREW;
		const off = new THREE.Vector3(-p.x + ex, -p.y + ey, 0)
			.multiplyScalar(s)
			.applyAxisAngle(zAxis, roll);
		local.set(p.x + off.x, p.y + off.y, p.z * (1 - s) + d0 * s);
		lv.group.localToWorld(camera.position.copy(local));
		lv.group.getWorldQuaternion(wq);
		camera.quaternion.copy(wq).multiply(rq.setFromAxisAngle(zAxis, roll));
		const ws = lv.group.getWorldScale(new THREE.Vector3()).x;
		const D = d0 * s * ws; // to the frame being fallen into, in the world
		camera.fov = fov;
		camera.near = 0.01 * D;
		camera.far = 60 * D;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();

		// Re-base: every clip plane the camera has reached is a level dropped,
		// and the stencil is cleared to the new base instead of any material
		// changing.
		let base = 0;
		for (let i = 0; i < clipZ.length; i++) {
			if (camera.position.z < clipZ[i] + 1.5 * camera.near) base = i + 1;
		}
		frameQuad.visible = base === 0;
		// Per mesh, not per group: the groups nest, and a hidden parent would
		// take every level inside it down too.
		levels.forEach((l, i) => l.meshes.forEach((m) => (m.visible = i + 1 >= base)));
		renderer.setClearStencil(base);

		if (swimmer) {
			const ride = SPERM_RIDE * D;
			const bodyH = SPERM_SPAN * 2 * ride * Math.tan(rad(fov) / 2);
			fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
			swimmer.group.position.copy(camera.position).addScaledVector(fwd, ride);
			swimmer.group.quaternion.copy(camera.quaternion);
			swimmer.group.scale.setScalar(bodyH);
			swimmer.spin(zeta * 2.5);
			swimmer.material.uniforms.uTime.value = zeta * 3.0;
		}
		info.base = base;
		info.fov = Number(fov.toFixed(2));
		info.zeta = Number(zeta.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;

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
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspect = w / h;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
		}
	};
}
