import {
	vec4,
	uniform,
	texture,
	positionView,
	positionWorld,
	smoothstep as tslSmoothstep,
	hue
} from 'three/tsl';
import {
	APPROACH,
	KALEIDO,
	NEST,
	SCENES,
	SCREEN_GLASS,
	span,
	smoothstep,
	easeInOutCubic
} from '$lib/config';
import { ADD } from '$lib/three/tsl/materials';
import { DECADES, shuffle } from '$lib/data/roomElements';
import { glassOnly, glassCut } from '$lib/three/tsl/glass';
import { roomsFor } from './nest';

// ── The kaleidoscope ─────────────────────────────────────────────────────────
// What is inside the set. The flight ends by flying INTO a television — the
// archive's 60s one, out in space, its glass dead ahead — and on the other
// side of the glass is the archive, looped. Rings of the same drawings, eight
// to a ring, each turned to its place round the axis and every other one
// mirrored, ring after ring down a tunnel, the pattern repeating every twenty
// rings and the whole thing slowly turning, its colours cycling through the
// hue as it goes. At the far end of the tunnel is the nest's FIRST ROOM — the
// whole room, filling the frame's height, and not to be seen from the glass:
// it comes out of the dark as the search stops (NEST.seen) — and the tunnel
// gives way to it: the fall begins where the tunnel ends.
//
// Like the nest, it is built ONCE and walked by two scenes. The approach flies
// up to the set with the tunnel showing inside its glass (the set's glass
// increments the stencil, the rings draw where it is 1), and the kaleido
// flies through the glass and down the tunnel to the room. Both ask this file
// for the camera — pose(u) — so the frame the approach ends on is the frame
// the kaleido opens on, and the frame the kaleido ends on is nest.pose(0),
// which is the frame the descent opens on.
//
// ── The pace ─────────────────────────────────────────────────────────────────
// The approach flies at ONE SPEED all the way into the glass, and the tunnel
// carries on at that speed; over its last `ease` it BRAKES TO REST on the
// room — the search ends — and the fall drops from that rest (see
// SCENES.descent.head). So the swimmer never slows in space, and the run
// stops once, on the room it found.
//
// ── The stencil chain, one level up ──────────────────────────────────────────
// The set's glass is the first hole: bezel where the stencil is 0, glass 0→1,
// rings where it is 1 — and room 0 too, its glass 1→2, room 1 at 2, and so on
// down the nest (nest.js). Once the camera is through the set the clear value
// is 1 and the rings draw everywhere; the nest's own re-basing carries on
// from there. See rebase().

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
	// uOn   the rings' alpha — 1 down the tunnel, out under the room
	// uHue  the turn of the hue, in radians, cycling with progress
	// uHuePer  hue per world unit down the tunnel, from the glass plane uZ0,
	//       so the tunnel is a rainbow along its length as well as in time
	const uDim = uniform(1);
	const uOn = uniform(1);
	const uHue = uniform(0);
	const uHuePer = uniform(0);
	const uZ0 = uniform(0);
	// Out of the dark, by view depth: the tunnel has no end you can see.
	// uBright  the drawings' level — a shade down, up in the overload
	// uGlow    the CRT hairline in the screen's glass, as it switches on
	const uBright = uniform(K.dim);
	const uGlow = uniform(0);
	const uSeen0 = uniform(K.seen[0]);
	const uSeen1 = uniform(K.seen[1]);
	const near = tslSmoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const turned = uHue.add(uZ0.sub(positionWorld.z).mul(uHuePer));
	// The set itself comes out of the dark a beat before the light inside it.
	const uBSeen0 = uniform(K.bezelSeen[0]);
	const uBSeen1 = uniform(K.bezelSeen[1]);
	const nearBezel = tslSmoothstep(uBSeen0, uBSeen1, positionView.z.negate()).oneMinus();

	// ── The ring materials, per drawing ──────────────────────────────────
	// The drawings are the nest's, hue-turned. The screens keep their glass
	// cut out, so the ring behind shows through every one of them. Drawn
	// where the stencil is 1 OR MORE — inside the set's glass, or everywhere
	// once through it, whatever the nest has done to the stencil inside room
	// 0's own glass — and AFTER the nest: the rings are nearer than the room
	// at the tunnel's end and cover it, so they go on top. The set's covers
	// go on top of them again, and the swimmer on top of everything.
	const RING_ORDER = 50000;
	const COVER_ORDER = 60000;
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
			m.colorNode = vec4(hue(c.rgb, turned).mul(uBright), c.a.mul(uOn).mul(near).mul(uDim));
			stencilOf(m, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
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
				m.renderOrder = RING_ORDER;
				g.add(m);
			}
			rings.add(g);
			ringList.push(g);
		}
	}

	// ── The set ──────────────────────────────────────────────────────────
	// The television at the end of the flight — always the 60s one
	// (KALEIDO.screenDecade): bezel where the stencil is 0, glass 0→1, nothing
	// of its own inside — the tunnel is what is inside.
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
		bezelMat.colorNode = vec4(c.rgb, c.a.mul(uDim).mul(nearBezel));
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
		// The glass, OFF: black covers over the glass, top and bottom, drawn
		// where the stencil is 1 or more (the whole of the glass, whatever the
		// nest inside has done to it) and after the tunnel, and the hairline
		// between them. setOpen() parts them — the CRT switching on. Gated by
		// uDim like the bezel, so an unlit set is nothing on the dark.
		const coverMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		coverMat.colorNode = vec4(0, 0, 0, uDim);
		stencilOf(coverMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
		const lineMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			...ADD
		});
		// Premultiplied additive (ADD): the level goes in the colour, not the alpha.
		const lit = uGlow.mul(uDim);
		lineMat.colorNode = vec4(lit, lit, lit, 1);
		stencilOf(lineMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
		const top = new THREE.Mesh(plane, coverMat);
		const bottom = new THREE.Mesh(plane, coverMat);
		const line = new THREE.Mesh(plane, lineMat);
		for (const m of [top, bottom, line]) {
			m.frustumCulled = false;
			screenRoot.add(m);
		}
		top.renderOrder = COVER_ORDER;
		bottom.renderOrder = COVER_ORDER;
		line.renderOrder = COVER_ORDER + 1;
		screenRoot.add(bezel, hole);
		screenDisposables.push(bezelMat, holeMat);
		screen = { decade, glass, meshes: [bezel, hole, top, bottom, line], top, bottom, line };
		setOpen(1, 0);
	}

	// ── Where everything is ──────────────────────────────────────────────
	// The set's glass is dead ahead on the axis, `travel` units down it. The
	// tunnel runs from that plane to room 0's, and the nest is put where the
	// tunnel's end lands the camera on nest.pose(0).
	let zGlass = 0; // the screen's glass plane, world z
	let z0 = 0; // where the flight ends: the glass filling the frame's height
	let zEnd = 0; // where the tunnel ends: nest.pose(0)'s camera
	let v0 = 1; // the flight's one speed, world units a second
	let v1 = 0; // the speed at the tunnel's end: nil, the stop
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
		// Room 0 is at the nest's root, its frame centred on the axis.
		nest.root.position.set(0, 0, 0);
		nest.refreshClips();
		const { D } = nest.pose(0, probe, 1);
		const seamD = probe.position.z; // before room 0's frame plane
		nest.root.position.z = zEnd - seamD;
		nest.refreshClips();
		Dend = D;
		// The rings, from the glass plane down to just short of the room's.
		const roomZ = zEnd - seamD;
		let n = 0;
		for (let i = 0; i < ringList.length; i++) {
			const z = zGlass - (i + 0.5) * K.pitch;
			const on = z > roomZ + K.pitch * 0.5;
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
		// The tunnel brakes to REST over its last `ease`, and the fall drops
		// from it: the search stops on the room it found.
		v1 = 0;
		zEnd = z0 - travelled(1);
		placeNest();
		placed = true;
	}

	// A whole run's worth, from nothing: the nest's rooms, chosen at random,
	// the set, and everything placed. The approach does this as it enters; a
	// jump straight into a later scene does it here.
	function freshRun({ answer, portrait }) {
		const picks = shuffle(DECADES);
		nest.build({ rooms: roomsFor(picks[0], answer, SCENES.descent.rooms), portrait });
		buildScreen(K.screenDecade);
		place();
	}

	// ── The camera at u of the tunnel ────────────────────────────────────
	// Straight down the axis, level: the pattern turns, the lens does not.
	// The lens opens from the seam's to K.fov and closes again for the room,
	// and the frame at u = 1 is nest.pose(0)'s.
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

	// The glass switching on: `open` parts the covers from the middle line
	// out, `glow` is the hairline. 1, 0 is a lit glass with the tunnel in it.
	function setOpen(open, glow) {
		if (!screen) return;
		const g = screen.glass;
		const { top, bottom, line } = screen;
		const shut = 1 - open;
		top.scale.set(g.w, (g.h / 2) * shut, 1);
		top.position.set(g.x, g.y + (g.h / 4) * (1 + open), 0.001);
		bottom.scale.set(g.w, (g.h / 2) * shut, 1);
		bottom.position.set(g.x, g.y - (g.h / 4) * (1 + open), 0.001);
		top.visible = bottom.visible = shut > 0.0005;
		line.scale.set(g.w, g.h * 0.02, 1);
		line.position.set(g.x, g.y, 0.002);
		line.visible = glow > 0.001;
		uGlow.value = glow;
	}

	// A rate of 1 to `a`, falling straight to nil by `b`, integrated: the turn
	// and the hue run and then come to rest, and stay put.
	function eased(x, [a, b]) {
		if (x <= a) return x;
		const s = Math.min(1, (x - a) / (b - a));
		return a + (b - a) * (s - (s * s) / 2);
	}
	// The tunnel at u: its turn, its colours, and the rings going out under
	// the room as it takes the frame — so the frame this ends on is the nest
	// and nothing else. The turn and the hue decelerate to rest over `lock`,
	// and the hue lands on true colour (see SCENES.kaleido.hueCycles).
	//
	// In the BREAKDOWN (world/kaleido.js) nothing stops: the turn and the hue
	// run away over `overload`, brighter, and the rings stay up to the end —
	// the CRT mask is what takes the picture, not the room.
	function set(u, breakdown = false) {
		const x = Math.max(0, Math.min(1, u));
		const w = breakdown ? x : eased(x, T.lock);
		let turn = w * T.turns * Math.PI * 2;
		let hueA = w * T.hueCycles * Math.PI * 2;
		let bright = K.dim;
		if (breakdown) {
			const o = smoothstep(T.overload[0], T.overload[1], x);
			turn += o * o * Math.PI * 2;
			hueA += o * o * Math.PI * 6;
			bright = K.dim + o * 0.7;
		}
		rings.rotation.z = turn;
		uHue.value = hueA;
		uBright.value = bright;
		uOn.value = breakdown ? 1 : 1 - easeInOutCubic(span(x, T.out));
	}

	// The clear value for wherever the camera is: 0 with the set still
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
		setOpen,
		dispose() {
			for (const d of disposables) d.dispose?.();
			for (const d of screenDisposables) d.dispose?.();
			plane.dispose();
		}
	};
}

// ── The CRT mask ─────────────────────────────────────────────────────────────
// The picture switching off, or on, as a set does: two black covers close from
// the top and bottom of the frame to a bright line, the line shrinks to a dot,
// black — and the reverse. A child of the camera, sized to the frame each call,
// drawn over everything but the swimmer, which is the thing that was doing the
// swimming and stays. The breakdown uses it (world/kaleido.js): the set
// switching OFF on a birthday with no room at the end of the tunnel.
export function createCrtMask(THREE) {
	const plane = new THREE.PlaneGeometry(1, 1);
	const black = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false
	});
	black.colorNode = vec4(0, 0, 0, 1);
	const uGlow = uniform(0);
	const white = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...ADD
	});
	white.colorNode = vec4(uGlow, uGlow, uGlow, 1);
	const group = new THREE.Group();
	group.name = 'crt';
	const top = new THREE.Mesh(plane, black);
	const bottom = new THREE.Mesh(plane, black);
	const line = new THREE.Mesh(plane, white);
	for (const m of [top, bottom, line]) {
		m.frustumCulled = false;
		m.renderOrder = 90000;
		group.add(m);
	}
	line.renderOrder = 90001;
	const D = 1;
	group.position.z = -D;
	// open  0..1 how far the covers have parted (1 = the whole picture)
	// width 0..1 how much of the line is lit (0 = a dot, and then nothing)
	// glow  0..1 the line's brightness
	function set(camera, open, width, glow) {
		const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * D;
		const w = h * camera.aspect;
		const shut = 1 - open;
		top.scale.set(w, (h / 2) * shut, 1);
		top.position.set(0, (h / 4) * (1 + open), 0);
		bottom.scale.set(w, (h / 2) * shut, 1);
		bottom.position.set(0, -(h / 4) * (1 + open), 0);
		top.visible = bottom.visible = shut > 0.0005;
		line.scale.set(Math.max(w * width, h * 0.006), h * 0.012, 1);
		line.visible = glow > 0.001 && width > 0.0005;
		uGlow.value = glow;
	}
	return {
		group,
		set,
		dispose() {
			plane.dispose();
			black.dispose();
			white.dispose();
		}
	};
}
