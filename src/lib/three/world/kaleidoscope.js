import {
	vec4,
	uniform,
	texture,
	positionView,
	positionWorld,
	smoothstep as tslSmoothstep,
	hue
} from 'three/tsl';
import { APPROACH, KALEIDO, NEST, SCENES, SCREEN_GLASS, span, easeInOutCubic } from '$lib/config';
import { DECADES, shuffle } from '$lib/data/roomElements';
import { glassOnly, glassCut } from '$lib/three/tsl/glass';
import { roomsFor } from './nest';

// ── The kaleidoscope ─────────────────────────────────────────────────────────
// What is inside the screen. The flight ends by flying INTO a monitor — one of
// the archive's own, out in space, its glass dead ahead — and on the other side
// of the glass the archive is not adrift any more: it is looped. Rings of the
// same drawings, eight to a ring, each turned to its place round the axis and
// every other one mirrored, ring after ring down a tunnel, the pattern
// repeating every twenty rings and the whole thing slowly turning, its colours
// cycling through the hue as it goes. At the far end of the tunnel is the
// PORTAL — the nest's monitor, with the first room lit inside it — and the
// tunnel gives way to it: the fall begins where the tunnel ends.
//
// Like the nest, it is built ONCE and walked by two scenes. The approach flies
// up to the screen with the tunnel showing inside its glass (the screen's
// glass increments the stencil, the rings draw where it is 1), and the
// kaleido flies through the glass and down the tunnel to the portal. Both ask
// this file for the camera — pose(u) — so the frame the approach ends on is
// the frame the kaleido opens on, and the frame the kaleido ends on is
// nest.pose(0), which is the frame the descent opens on.
//
// ── The pace ─────────────────────────────────────────────────────────────────
// The approach flies at ONE SPEED all the way into the glass, and the tunnel
// carries on at that speed; only over its last `ease` does it settle to the
// speed the descent opens at, which the nest works out from its own geometry.
// So the swimmer never slows in space, and the fall carries on at the pace the
// tunnel arrived at.
//
// ── The stencil chain, one level up ──────────────────────────────────────────
// The screen's glass is the first hole: bezel where the stencil is 0, glass
// 0→1, rings where it is 1. The nest sits one level up from there — its portal
// where the stencil is 1, its glass 1→2, room 0 at 2 — see nest.js. Once the
// camera is through the screen the clear value is 1 and the rings draw
// everywhere; the nest's own re-basing carries on from there. See rebase().

const rad = (d) => (d * Math.PI) / 180;

export function createKaleidoscope({ THREE, nest }) {
	const K = KALEIDO;
	const T = SCENES.kaleido;
	const tex = nest.textures;
	const plane = new THREE.PlaneGeometry(1, 1);

	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};

	// ── The uniforms ─────────────────────────────────────────────────────
	// uDim  the alpha of everything here — up with the sky in the approach
	// uOn   the rings' alpha — 1 down the tunnel, out under the portal
	// uHue  the turn of the hue, in radians, cycling with progress
	// uHuePer  hue per world unit down the tunnel, from the glass plane uZ0,
	//       so the tunnel is a rainbow along its length as well as in time
	const uDim = uniform(1);
	const uOn = uniform(1);
	const uHue = uniform(0);
	const uHuePer = uniform(0);
	const uZ0 = uniform(0);
	// Out of the dark, by view depth, as the archive is in the approach: the
	// tunnel has no end you can see.
	const uSeen0 = uniform(K.seen[0]);
	const uSeen1 = uniform(K.seen[1]);
	const near = tslSmoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const turned = uHue.add(uZ0.sub(positionWorld.z).mul(uHuePer));

	// ── The ring materials, per drawing ──────────────────────────────────
	// The drawings are the nest's, hue-turned. The screens keep their glass
	// cut out, so the ring behind shows through every one of them.
	const disposables = [];
	const ringMat = {};
	for (const d of DECADES) {
		ringMat[d] = {};
		for (const key of K.keys) {
			const m = new THREE.MeshBasicNodeMaterial({
				transparent: true,
				depthTest: false,
				depthWrite: false
			});
			const c = key === 'screen' ? glassCut(d, tex[d].screen)() : texture(tex[d][key]);
			m.colorNode = vec4(hue(c.rgb, turned).mul(K.dim), c.a.mul(uOn).mul(near).mul(uDim));
			stencilOf(m, 1, THREE.EqualStencilFunc, THREE.KeepStencilOp);
			ringMat[d][key] = m;
			disposables.push(m);
		}
	}

	// ── The world ────────────────────────────────────────────────────────
	const root = new THREE.Group();
	root.name = 'kaleidoscope';
	const screenRoot = new THREE.Group();
	screenRoot.name = 'screen';
	root.add(screenRoot);
	const rings = new THREE.Group();
	rings.name = 'rings';
	root.add(rings);

	// The rings, all of them, built once: ring i is one drawing, K.ring of it
	// round the axis, each turned to its place and every other one mirrored,
	// the ring itself a half-step on from the last and a shade further round
	// the spiral. Which drawing is ring i's runs through the decades and the
	// keys, so the pattern repeats every keys × decades rings.
	const ringList = [];
	{
		const art = (d, key) => {
			const t = tex[d][key];
			return t.image.width / t.image.height;
		};
		for (let i = 0; i < K.rings; i++) {
			const key = K.keys[i % K.keys.length];
			const d = DECADES[Math.floor(i / K.keys.length) % DECADES.length];
			const g = new THREE.Group();
			const w = K.size[key];
			const h = w / art(d, key);
			for (let j = 0; j < K.ring; j++) {
				const th = (Math.PI * 2 * j) / K.ring + (i * Math.PI) / K.ring + i * K.spiral;
				const m = new THREE.Mesh(plane, ringMat[d][key]);
				m.position.set(Math.cos(th) * K.radius[0], Math.sin(th) * K.radius[1], 0);
				m.rotation.z = th + Math.PI / 2;
				m.scale.set(j % 2 ? -w : w, h, 1);
				g.add(m);
			}
			rings.add(g);
			ringList.push(g);
		}
	}

	// ── The screen ───────────────────────────────────────────────────────
	// One of the archive's monitors, at the end of the flight, drawn as the
	// portal is: bezel where the stencil is 0, glass 0→1, nothing of its own
	// inside — the tunnel is what is inside.
	let screen = null;
	let screenDisposables = [];
	function buildScreen(decade) {
		for (const d of screenDisposables) d.dispose?.();
		screenDisposables = [];
		while (screenRoot.children.length) screenRoot.remove(screenRoot.children[0]);
		const pw = K.screenWidth;
		const ph = pw / (tex[decade].screen.image.width / tex[decade].screen.image.height);
		const g = SCREEN_GLASS[decade];
		const glass = { x: (g.cx - 0.5) * pw, y: (0.5 - g.cy) * ph, w: g.w * pw, h: g.h * ph };
		const bezelMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		const c = glassCut(decade, tex[decade].screen)();
		bezelMat.colorNode = vec4(c.rgb, c.a.mul(uDim));
		stencilOf(bezelMat, 0, THREE.EqualStencilFunc, THREE.KeepStencilOp);
		const bezel = new THREE.Mesh(plane, bezelMat);
		bezel.scale.set(pw, ph, 1);
		bezel.renderOrder = -3;
		bezel.frustumCulled = false;
		const holeMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			colorWrite: false
		});
		holeMat.colorNode = glassOnly(decade, tex[decade].screen)();
		stencilOf(holeMat, 0, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
		const hole = new THREE.Mesh(plane, holeMat);
		hole.scale.set(pw, ph, 1);
		hole.renderOrder = -4;
		hole.frustumCulled = false;
		screenRoot.add(bezel, hole);
		screenDisposables.push(bezelMat, holeMat);
		screen = { decade, glass, meshes: [bezel, hole] };
	}

	// ── Where everything is ──────────────────────────────────────────────
	// The screen's glass is dead ahead on the axis, `travel` units down it.
	// The tunnel runs from that plane to the portal's, and the nest is put
	// where the tunnel's end lands the camera on nest.pose(0).
	let zGlass = 0; // the screen's glass plane, world z
	let z0 = 0; // where the flight ends: the glass filling the frame's height
	let zEnd = 0; // where the tunnel ends: nest.pose(0)'s camera
	let v0 = 1; // the flight's one speed, world units a second
	let v1 = 1; // the fall's opening speed
	let Dend = 1; // nest.pose(0)'s D — the swimmer's ride at the seam
	let placed = false;
	const probe = new THREE.PerspectiveCamera();

	function travelled(x) {
		const e = T.ease;
		const Tk = T.duration;
		if (x <= 1 - e) return Tk * v0 * x;
		const y = x - (1 - e);
		return Tk * (v0 * (1 - e) + v0 * y - ((v0 - v1) * y * y) / (2 * e));
	}

	function placeNest() {
		const pg = nest.portal.glass;
		nest.root.position.set(-pg.x, -pg.y, 0);
		nest.refreshClips();
		const { D } = nest.pose(0, probe, 1);
		const seamD = probe.position.z; // before the portal's glass plane
		nest.root.position.z = zEnd - seamD;
		nest.refreshClips();
		Dend = D;
		// The rings, from the glass plane down to just short of the portal's.
		const portalZ = zEnd - seamD;
		let n = 0;
		for (let i = 0; i < ringList.length; i++) {
			const z = zGlass - (i + 0.5) * K.pitch;
			const on = z > portalZ + K.pitch * 0.5;
			ringList[i].visible = on;
			ringList[i].position.z = z;
			if (on) n = i + 1;
		}
		return n;
	}

	function place() {
		const sg = screen.glass;
		screenRoot.position.set(-sg.x, -sg.y, -APPROACH.travel);
		zGlass = -APPROACH.travel;
		uZ0.value = zGlass;
		uHuePer.value = (Math.PI * 2) / (K.pitch * K.keys.length * DECADES.length);
		z0 = zGlass + sg.h / 2 / Math.tan(rad(NEST.seamFov) / 2);
		v0 = -z0 / SCENES.approach.duration;
		v1 = nest.openingSpeed();
		zEnd = z0 - travelled(1);
		placeNest();
		placed = true;
	}

	// A whole run's worth, from nothing: the nest (portal, rooms) and the
	// screen, chosen at random, and everything placed. The approach does this
	// as it enters; a jump straight into a later scene does it here.
	function freshRun({ answer, portrait }) {
		const picks = shuffle(DECADES);
		nest.build({
			portal: picks[0],
			rooms: roomsFor(picks[1], answer, SCENES.descent.rooms),
			portrait
		});
		buildScreen(picks[2]);
		place();
	}

	// ── The camera at u of the tunnel ────────────────────────────────────
	// Straight down the axis, level: the pattern turns, the lens does not.
	// The lens opens from the seam's to K.fov and closes again for the
	// portal, and the frame at u = 1 is nest.pose(0)'s.
	function fovAt(u) {
		const open = easeInOutCubic(span(u, T.lensIn));
		const close = easeInOutCubic(span(u, T.lensOut));
		return NEST.seamFov + (K.fov - NEST.seamFov) * open * (1 - close);
	}
	function pose(u, camera, aspect) {
		const x = Math.max(0, Math.min(1, u));
		const fov = fovAt(x);
		camera.position.set(0, 0, z0 - travelled(x));
		camera.quaternion.identity();
		camera.fov = fov;
		camera.aspect = aspect;
		camera.near = 0.1;
		camera.far = 400;
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
		return { fov, Dend, zGlass };
	}

	// The tunnel at u: its turn, its colours, and the rings going out under
	// the portal as it takes the frame — so the frame this ends on is the
	// nest and nothing else.
	function set(u) {
		const x = Math.max(0, Math.min(1, u));
		rings.rotation.z = x * T.turns * Math.PI * 2;
		uHue.value = x * T.hueCycles * Math.PI * 2;
		uOn.value = 1 - easeInOutCubic(span(x, T.out));
	}

	// The clear value for wherever the camera is: 0 with the screen still
	// ahead, 1 once through it — and the nest re-based from there.
	function rebase(camZ, near) {
		const through = camZ < zGlass + 1.5 * near;
		for (const m of screen.meshes) m.visible = !through;
		return nest.rebase(camZ, near, through ? 1 : 0);
	}

	return {
		root,
		get screen() {
			return screen;
		},
		get placed() {
			return placed;
		},
		get z0() {
			return z0;
		},
		get zEnd() {
			return zEnd;
		},
		get speeds() {
			return { v0, v1 };
		},
		buildScreen,
		place,
		placeNest,
		freshRun,
		pose,
		set,
		rebase,
		setDim(v) {
			uDim.value = v;
		},
		dispose() {
			for (const d of disposables) d.dispose?.();
			for (const d of screenDisposables) d.dispose?.();
			plane.dispose();
		}
	};
}
