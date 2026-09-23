import {
	vec4,
	uniform,
	Fn,
	uv,
	length,
	atan,
	sin,
	smoothstep,
	exp,
	max,
	texture,
	positionView
} from 'three/tsl';
import { LAYERS, placement, elementUrl, DECADES, shuffle } from '$lib/data/roomElements';
import { SCREEN_GLASS, GLASS_SAFETY, NEST, LENS, SCENES } from '$lib/config';
import { PHI } from '$lib/three/geometry/icosahedron';
import { glassOnly } from '$lib/three/tsl/glass';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { ADD } from '$lib/three/tsl/materials';

// ── The nest ─────────────────────────────────────────────────────────────────
// Rooms inside rooms, through the decades. The site's room is six flat
// drawings at six depths behind a golden-rectangle frame, and every decade's
// monitor has a glass painted one flat colour. This puts the NEXT room inside
// that glass, and the next inside that one's, and falls through them.
//
// It is built ONCE and walked by two scenes. The kaleido's tunnel ends on
// ROOM 0 — the whole room, filling the frame's height, come out of the dark
// as the search stops (NEST.seen) — and the descent falls from room 0 down to
// the last room, which is the answer's. Both ask this file for the camera:
// pose(ζ) puts the lens at level ζ of the fall, and it is a pure function of
// ζ, so the frame the kaleido ends on and the frame the descent opens on are
// the same call with the same number.
//
// Each level is a 3D similarity of its parent: level k+1's frame is placed on
// level k's glass, scaled so the glass-aspect crop of the frame lands exactly
// on the glass (N = crop width / glass width), and turned by the screw angle
// about the glass centre. Every level has its own N and its own fixed point,
// and the camera walks each level's spiral similarity to its fractional power
// — c(f) = p' + R(fθ)·N^−f·(c0 − p') with p' = (I − R(θ)/N)⁻¹·g — so the frame
// at ζ = k+1 IS the picture the child starts on, and the crossing has no seam.
//
// The fall runs at one pace ON SCREEN — equal time per unit of log(N), since
// the crossings are zooms of different sizes (zetaOf) — from its first frame,
// at the speed the tunnel eased to (openingSpeed); the roll comes in from
// rest at the seam and goes out before the last room, which lands level
// (rollOf, pose). The lens is the run's one lens all the way down, and the
// hand on the camera is the run's (world/wobble.js, applied by the descent).
//
// Each level is clipped to its parent's glass by a stencil chain, ONE LEVEL UP
// from the set the flight ends in (world/kaleidoscope.js, whose glass is 0→1):
// room 0 draws where the stencil is 1 — inside the set's glass, or everywhere
// once the camera is through it — its glass increments it to 2, room 1 draws
// where it is 2, and so on; every level's desk and bed are drawn afterwards,
// deepest first, where the stencil is ≥ theirs. Once the camera has passed a
// glass plane that level is dropped and the stencil is CLEARED to the new
// base, so no material ever changes. See rebase().
//
// The SPLOSH is a white blot on the last room's glass, and it lives here
// because the glass does: the descent drives it with setSplosh().

const rad = (d) => (d * Math.PI) / 180;
const smooth = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

// The decades of a run's rooms, outermost first: `first` is chosen when the
// run starts, before the answer is known, and the LAST room is the answer's.
// No two neighbours alike, so every crossing is a change of decade.
export function roomsFor(first, answer, count) {
	const rooms = [first];
	let pool = shuffle(DECADES.filter((d) => d !== first));
	while (rooms.length < count - 1) {
		for (const d of pool) {
			if (rooms.length >= count - 1) break;
			if (d !== rooms[rooms.length - 1]) rooms.push(d);
		}
		pool = shuffle(DECADES);
	}
	const last = answer ?? shuffle(DECADES.filter((d) => d !== rooms[rooms.length - 1]))[0];
	if (rooms[rooms.length - 1] === last) {
		const before = rooms[rooms.length - 2];
		rooms[rooms.length - 1] = DECADES.find((d) => d !== last && d !== before);
	}
	rooms.push(last);
	return rooms;
}

export async function createNest({ THREE, renderer }) {
	const SCREW = rad(NEST.screw);
	const DEPTH = NEST.depth;
	const WALL_COVER = NEST.wallCover;
	const zAxis = new THREE.Vector3(0, 0, 1);

	// ── The drawings, every decade ───────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const textures = {}; // decade -> key -> texture
	await Promise.all(
		DECADES.map(async (decade) => {
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
	const art = (decade, key) => {
		const t = textures[decade][key];
		return t.image.width / t.image.height;
	};

	const plane = new THREE.PlaneGeometry(1, 1);
	// The wall is drawn to cover the FRAME, which only covers the frustum from
	// infinitely far. This keeps the depth and extends the wall instead,
	// smearing its own edge pixels outward (clamped UVs on a doubled quad).
	const wallPlane = plane.clone();
	{
		const a = wallPlane.attributes.uv;
		for (let i = 0; i < a.count; i++) {
			a.setXY(i, (a.getX(i) - 0.5) * WALL_COVER + 0.5, (a.getY(i) - 0.5) * WALL_COVER + 0.5);
		}
	}
	const BACK = ['bg', 'poster', 'clock', 'screen'];
	const FRONT = ['desk', 'bed'];

	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};

	// ── The swimmer, shared by both scenes ───────────────────────────────
	const swimmer = await loadSwimmer({ height: 1, gain: 1.15 });
	swimmer.group.name = 'swimmer';
	swimmer.material.depthTest = false;
	// Its own clock, in seconds, advanced by whichever scene is running it: the
	// roll and the tail's wobble are on this, so they never stop — not for a
	// popup holding the flight, and not at the seam.
	swimmer.clock = 0;
	swimmer.group.traverse((o) => {
		o.renderOrder = 100000;
		o.frustumCulled = false;
	});

	// ── The splosh ───────────────────────────────────────────────────────
	// White, additive, on the last room's glass: a blot that spreads from the
	// point the swimmer went in, its edge wobbling, until the glass is white.
	const su = { uT: uniform(0), uFade: uniform(1), uSize: uniform(new THREE.Vector2(1, 1)) };
	const sploshMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...ADD
	});
	sploshMat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(su.uSize);
		const r = length(p).mul(2.0);
		const th = atan(p.y, p.x);
		const wob = sin(th.mul(9.0).add(1.3))
			.mul(0.16)
			.add(sin(th.mul(15.0).sub(0.7)).mul(0.09))
			.add(1.0);
		const edge = su.uT.mul(1.7).mul(wob);
		const core = smoothstep(edge.sub(0.12), edge, r).oneMinus();
		const glow = exp(max(r.sub(edge), 0.0).mul(-7.0))
			.mul(0.45)
			.mul(smoothstep(0.0, 0.15, su.uT));
		const a = core.add(glow).clamp(0.0, 1.0).mul(su.uFade);
		return vec4(a, a, a, a);
	})();

	// ── The dimmer, and the dark ─────────────────────────────────────────
	// Two uniforms on every drawing in the nest. `uDim` is on the ALPHA only,
	// so the whole thing can come up out of the black with the sky rather than
	// sit there under the title card as one small lit screen. `uDark` is on
	// the COLOUR: the way home takes the last room to black with it, and it
	// has to be the colour — on the alpha, the wall showed through the
	// monitor's painted glass as it went, which was the room coming back
	// after the glass had taken the frame. Both are 1 for the whole descent.
	const uDim = uniform(1);
	const uDark = uniform(1);
	// And OUT OF THE DARK, by view depth. The room at the tunnel's end is not
	// to be seen from the set's glass — the tunnel has no end you can see —
	// and comes up as the lens closes on it, over NEST.seen, which is set so
	// that it is up by the time the search stops. Every room deeper than it is
	// inside its glass and nearer still, so the fall never sees this.
	const uSeen0 = uniform(NEST.seen[0]);
	const uSeen1 = uniform(NEST.seen[1]);
	const nearN = smoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const dimmed = (node) => vec4(node.rgb.mul(uDark), node.a.mul(uDim).mul(nearN));

	// ── The nest itself ──────────────────────────────────────────────────
	const root = new THREE.Group();
	root.name = 'nest';
	let W = 2 * PHI;
	let H = 2;
	let levels = [];
	let clipZ = [];
	let disposables = [];
	let built = { rooms: [], portrait: false };
	let lastBase = 0;
	let logs = []; // each level's ln(N): the length of its crossing on screen

	// RoomProjection.layout(), in the frame's own coordinates: x right, y up,
	// z toward the viewer, the frame plane at z = 0.
	function layout(decade, cfg, portrait) {
		const aspect = art(decade, cfg.key);
		const pos = placement(cfg, decade, portrait);
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
	function room(decade, portrait) {
		const L = Object.fromEntries(LAYERS.map((cfg) => [cfg.key, layout(decade, cfg, portrait)]));
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

	function clear() {
		for (const d of disposables) d.dispose?.();
		disposables = [];
		while (root.children.length) root.remove(root.children[0]);
		levels = [];
		clipZ = [];
	}

	// Where every glass plane is in the world. Called after the root has been
	// moved, because the clip planes are world z.
	function refreshClips() {
		root.updateMatrixWorld(true);
		const v = new THREE.Vector3();
		levels.forEach((lv) => {
			lv.glassZ = lv.group.localToWorld(v.set(lv.glass.x, lv.glass.y, lv.glass.z)).z;
		});
		clipZ = levels.map((lv) => lv.glassZ);
	}

	// Build the nest for a run: the rooms, outermost first. Rebuilding is cheap
	// — the textures are already up — so the approach builds one before the
	// answer is known and again once it is.
	function build({ rooms, portrait = false }) {
		clear();
		built = { rooms: rooms.slice(), portrait };
		if (portrait) {
			W = 2;
			H = 2 * PHI;
		} else {
			W = 2 * PHI;
			H = 2;
		}
		const mk = (mat) => {
			disposables.push(mat);
			return mat;
		};

		// The rooms. Room 0 is at the root, unturned and at unit scale — it is
		// what the tunnel ends on, and the frame it ends on is square — and
		// every room after it sits on its parent's glass, screwed.
		let parent = null;
		const nLevels = rooms.length;
		rooms.forEach((decade, k) => {
			const r = room(decade, portrait);
			const group = new THREE.Group();
			let N = 1;
			const screw = parent ? SCREW : 0;
			if (parent) {
				const pgl = parent.glass;
				const ga = pgl.w / pgl.h;
				const Kw = ga < W / H ? H * ga : W;
				N = Kw / pgl.w;
				group.position.set(pgl.x, pgl.y, pgl.z);
				group.scale.setScalar(1 / N);
				group.quaternion.setFromAxisAngle(zAxis, screw);
				parent.group.add(group);
			} else {
				root.add(group);
			}

			const meshes = [];
			let screenMesh = null;
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
			// Room k draws where the stencil is k + 1: 1 is inside the set's
			// glass — world/kaleidoscope.js — or everywhere once through it.
			const stencil = (mat, func, op) => stencilOf(mat, k + 1, func, op);
			const flat = (key) => {
				const m = mk(
					new THREE.MeshBasicNodeMaterial({
						transparent: true,
						depthTest: false,
						depthWrite: false
					})
				);
				m.colorNode = dimmed(texture(textures[decade][key]));
				return m;
			};
			BACK.forEach((key, i) => {
				const m = sprite(
					key,
					stencil(flat(key), THREE.EqualStencilFunc, THREE.KeepStencilOp),
					10 * k + i
				);
				if (key === 'screen') screenMesh = m;
			});
			const gm = mk(
				new THREE.MeshBasicNodeMaterial({
					transparent: true,
					depthTest: false,
					depthWrite: false,
					colorWrite: false
				})
			);
			gm.colorNode = glassOnly(decade, textures[decade].screen)();
			sprite('screen', stencil(gm, THREE.EqualStencilFunc, THREE.IncrementStencilOp), 10 * k + 4);
			// Front layers: after every level's back, deepest level first.
			FRONT.forEach((key, j) =>
				sprite(
					key,
					stencil(flat(key), THREE.LessEqualStencilFunc, THREE.KeepStencilOp),
					10 * (nLevels + 1) + 10 * (nLevels - 1 - k) + j
				)
			);
			const lv = { ...r, group, meshes, screenMesh, N, screw, k };
			levels.push(lv);
			parent = lv;
		});

		// The splosh, on the last room's glass.
		const last = levels[levels.length - 1];
		const splosh = new THREE.Mesh(plane, sploshMat);
		splosh.scale.set(last.glass.w, last.glass.h, 1);
		splosh.position.set(last.glass.x, last.glass.y, last.glass.z + 0.002);
		splosh.renderOrder = 200000;
		splosh.frustumCulled = false;
		last.group.add(splosh);
		last.meshes.push(splosh);
		const m = Math.max(last.glass.w, last.glass.h);
		su.uSize.value.set(last.glass.w / m, last.glass.h / m);
		su.uT.value = 0;
		su.uFade.value = 1;

		// Each level's fixed point, in its own coordinates: the point its
		// child's spiral similarity x ↦ g + R(θ)·x/N leaves where it is. The
		// last room has no child, so its crossing — the landing and the way
		// home — uses the N a child would have had and NO screw: it lands
		// level, and the fixed point of a plain similarity is g·N/(N−1).
		levels.forEach((lv, k) => {
			const gl = lv.glass;
			const ga = gl.w / gl.h;
			const Kw = ga < W / H ? H * ga : W;
			lv.childN = k + 1 < levels.length ? levels[k + 1].N : Kw / gl.w;
			lv.lnN = Math.log(lv.childN);
			const last = k === levels.length - 1;
			const th = last ? 0 : SCREW;
			const a = 1 - Math.cos(th) / lv.childN;
			const b = Math.sin(th) / lv.childN;
			const det = a * a + b * b;
			lv.fixed = new THREE.Vector3(
				(a * gl.x - b * gl.y) / det,
				(b * gl.x + a * gl.y) / det,
				(lv.childN * gl.z) / (lv.childN - 1)
			);
		});
		logs = levels.map((lv) => lv.lnN);
		refreshClips();
	}

	// ── The fall, as a function of the descent's progress ────────────────
	// ζ runs at ONE PACE from the seam and eases to rest over the last `ease`
	// of the scene, at `land` of the way into the last room. One pace ON
	// SCREEN: a crossing is a zoom by its level's N, and no two decades'
	// monitors are the same size, so equal time per level would lurch at each
	// glass. Equal time per unit of log(N) does not — the fall is measured in
	// log-scale and turned back into a level at the end.
	function zetaEnd() {
		return levels.length - 1 + SCENES.descent.land;
	}
	function logEnd() {
		let sum = 0;
		for (let k = 0; k < levels.length - 1; k++) sum += logs[k];
		return sum + SCENES.descent.land * logs[levels.length - 1];
	}
	function zetaOfLog(lambda) {
		let rest = lambda;
		for (let k = 0; k < levels.length - 1; k++) {
			if (rest < logs[k]) return k + rest / logs[k];
			rest -= logs[k];
		}
		return Math.min(levels.length - 1 + rest / logs[levels.length - 1], zetaEnd());
	}
	// The rate down the fall: one pace from the first frame — the tunnel has
	// already eased to it — and a straight ramp down over `ease` to rest at
	// the landing. Integrated, normalised, and turned back into a level.
	function zetaOf(u) {
		const e = SCENES.descent.ease;
		const x = Math.max(0, Math.min(1, u));
		const area = 1 - e / 2;
		let h;
		if (x <= 1 - e) h = x;
		else {
			const y = x - (1 - e);
			h = 1 - e + y - (y * y) / (2 * e);
		}
		return zetaOfLog(logEnd() * (h / area));
	}
	// World units per second the camera is moving at as the fall opens — the
	// speed the tunnel eases to, so the fall carries straight on from it
	// (world/kaleidoscope.js). Measured rather than derived: pose(0) to
	// pose(dz) in the world, over the time zetaOf gives that.
	const probe = new THREE.PerspectiveCamera();
	const pa = new THREE.Vector3();
	function openingSpeed() {
		const dz = 0.002;
		pose(0, probe, 1);
		pa.copy(probe.position);
		pose(dz, probe, 1);
		const perZeta = probe.position.distanceTo(pa) / dz;
		const rate = (zetaOf(dz) - zetaOf(0)) / dz / SCENES.descent.duration;
		return perZeta * rate;
	}
	// ── The camera at level ζ ────────────────────────────────────────────
	// ζ = k + f: room k, f of the way through its crossing into room k+1. The
	// frame at level ζ fills the height. The camera never turns except to roll
	// with the screw — the hand on it is the descent's to add. Also re-bases
	// the stencil chain for wherever the camera now is.
	const wq = new THREE.Quaternion();
	const rq = new THREE.Quaternion();
	const local = new THREE.Vector3();
	const off = new THREE.Vector3();
	const tmpV = new THREE.Vector3();
	// The run's one lens, at every level: there is no dolly in the fall.
	function fovAt() {
		return LENS;
	}
	// The roll through crossing k: SCREW by its end, so the child's turned
	// frame is met exactly, and linear in between — except at the two ends of
	// the fall. It starts FROM REST at the seam, where the approach arrives
	// level and straight, and comes to rest before the last room, which lands
	// level, so the fall rolls in and out rather than snapping. A cubic each
	// way: the first crossing ends at the rate the second runs at in TIME (a
	// crossing's time is its log-scale — see zetaOf), and the crossing before
	// the last ends at nil.
	function rollOf(k, f) {
		const n = levels.length;
		if (n < 3) return SCREW * f * f * (3 - 2 * f);
		if (k === 0) {
			const s = logs[0] / logs[1];
			return SCREW * ((3 - s) * f * f + (s - 2) * f * f * f);
		}
		if (k === n - 2) return SCREW * (f + f * f - f * f * f);
		return SCREW * f;
	}
	function pose(zetaIn, camera, aspect) {
		// Past the last room's f = 1 is the way home: the glass has filled the
		// frame and the camera keeps going into it.
		const zeta = Math.max(0, Math.min(zetaIn, levels.length + 0.9));
		const k = Math.min(Math.floor(zeta), levels.length - 1);
		const f = zeta - k;
		const lv = levels[k];
		const last = k === levels.length - 1;
		const N = lv.childN;
		const s = Math.pow(N, -f);
		const fov = fovAt(zeta);
		const d0 = H / 2 / Math.tan(rad(fov) / 2);
		const p = lv.fixed;
		// The last room lands level: no roll, and the hand on the camera —
		// world/wobble.js, the descent's to apply — dies out over `settle`,
		// which is handed back for it, so the glass is square in the frame for
		// the readout.
		const settle = last ? smooth(SCENES.descent.settle, SCENES.descent.land, f) : 0;
		const roll = last ? 0 : rollOf(k, f);
		off.set(-p.x, -p.y, 0).multiplyScalar(s).applyAxisAngle(zAxis, roll);
		local.set(p.x + off.x, p.y + off.y, p.z * (1 - s) + d0 * s);
		lv.group.localToWorld(camera.position.copy(local));
		lv.group.getWorldQuaternion(wq);
		camera.quaternion.copy(wq).multiply(rq.setFromAxisAngle(zAxis, roll));
		const ws = lv.group.getWorldScale(tmpV).x;
		const D = d0 * s * ws; // to the frame being fallen into, in the world
		camera.fov = fov;
		camera.near = 0.01 * D;
		camera.far = 60 * D;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
		rebase(camera.position.z, camera.near);
		return { D, fov, base: lastBase, zeta, settle };
	}

	// Every clip plane the camera has reached is a level dropped, and the
	// stencil is cleared to the new base instead of any material changing.
	// Per mesh, not per group: the groups nest, and a hidden parent would take
	// every level inside it down too. `floor` is the base with nothing passed:
	// 1, the level the screen before the nest gave, unless that screen is
	// still ahead — which only the kaleidoscope knows (kaleidoscope.rebase()).
	function rebase(camZ, near, floor = 1) {
		let passed = 0;
		for (let i = 0; i < clipZ.length; i++) {
			if (camZ < clipZ[i] + 1.5 * near) passed = i + 1;
		}
		levels.forEach((l, i) => l.meshes.forEach((m) => (m.visible = i >= passed)));
		const base = floor + passed;
		renderer.setClearStencil(base);
		lastBase = base;
		return base;
	}

	// Where the last room's monitor glass lands on screen, in CSS pixels, given
	// the camera looking at it — RoomProjection.screenRect(), for the readout.
	function glassRect(camera, vw, vh) {
		const lv = levels[levels.length - 1];
		if (!lv?.screenMesh) return null;
		const g = SCREEN_GLASS[lv.decade];
		const lx = g.cx - 0.5;
		const ly = 0.5 - g.cy;
		const hw = (g.w * GLASS_SAFETY) / 2;
		const hh = (g.h * GLASS_SAFETY) / 2;
		lv.screenMesh.updateWorldMatrix(true, false);
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		for (const [sx, sy] of [
			[-hw, -hh],
			[hw, -hh],
			[hw, hh],
			[-hw, hh]
		]) {
			const v = lv.screenMesh.localToWorld(new THREE.Vector3(lx + sx, ly + sy, 0));
			v.project(camera);
			const px = (v.x * 0.5 + 0.5) * vw;
			const py = (-v.y * 0.5 + 0.5) * vh;
			minX = Math.min(minX, px);
			maxX = Math.max(maxX, px);
			minY = Math.min(minY, py);
			maxY = Math.max(maxY, py);
		}
		return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
	}

	// The last room's glass, in the world: where the swimmer is going.
	function lastGlassWorld() {
		const lv = levels[levels.length - 1];
		const gl = lv.glass;
		const centre = lv.group.localToWorld(new THREE.Vector3(gl.x, gl.y, gl.z));
		const ws = lv.group.getWorldScale(new THREE.Vector3()).x;
		return { centre, h: gl.h * ws, w: gl.w * ws };
	}

	return {
		root,
		swimmer,
		textures,
		get levels() {
			return levels;
		},
		get built() {
			return built;
		},
		get H() {
			return H;
		},
		build,
		refreshClips,
		pose,
		fovAt,
		zetaEnd,
		zetaOf,
		openingSpeed,
		rebase,
		glassRect,
		lastGlassWorld,
		setSplosh(t, fade = 1) {
			su.uT.value = t;
			su.uFade.value = fade;
		},
		setDim(v) {
			uDim.value = v;
		},
		setDark(v) {
			uDark.value = v;
		},
		dispose() {
			clear();
			for (const d of Object.values(textures)) for (const t of Object.values(d)) t.dispose();
			plane.dispose();
			wallPlane.dispose();
			sploshMat.dispose();
		}
	};
}
