import {
	Fn,
	vec2,
	vec3,
	vec4,
	uniform,
	texture,
	uv,
	abs,
	max,
	length,
	exp,
	float,
	atan,
	sin,
	cos,
	pow,
	mix,
	fwidth,
	positionView,
	positionWorld,
	smoothstep as tslSmoothstep,
	floor,
	mod,
	hue
} from 'three/tsl';
import {
	APPROACH,
	KALEIDO,
	LENS,
	SCENES,
	SCREEN_GLASS,
	runSeconds,
	span,
	smoothstep,
	easeInOutCubic
} from '$lib/config';
import { ADD } from '$lib/three/tsl/materials';
import { grooveDistNode, hair, TWO_PI } from '$lib/three/tsl/zeta';
import { DECADES, shuffle } from '$lib/data/roomElements';
import { GIFS } from '$lib/data/gifs';
import { runClock } from '$lib/three/tsl/clock';
import { glassOnly, glassCut } from '$lib/three/tsl/glass';
import { roomsFor } from './nest';
import { wobbleEuler } from './wobble';

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
// Round the rings is the WALL (KALEIDO.wall): the tunnel is the inside of a
// record, a cylinder of gold grooves from the glass plane to the room's, and
// the room at the far end is its label — the disc round room 0 (nest.js) is
// the same record's face. The grooves are ζ's, cut with three/tsl/zeta.js,
// the song playing inward: t runs from the room end toward the glass, so the
// flight down the tunnel is the needle's run in to the label. It turns with
// the rings, recedes into the dark with them, and a wave of light runs down
// it ahead of the lens — on the scene's progress, like everything here.
//
// Like the nest, it is built ONCE and walked by two scenes. The approach flies
// up to the set with the tunnel showing inside its glass (the set's glass
// increments the stencil, the rings draw where it is 1), and the kaleido
// flies through the glass and down the tunnel to the room. Both ask this file
// for the camera — pose(u) — so the frame the approach ends on is the frame
// the kaleido opens on, and the frame the kaleido ends on is nest.pose(0),
// which is the frame the descent opens on.
//
// ── The pace, the lens, the hand ─────────────────────────────────────────────
// The approach flies at ONE SPEED all the way into the glass, and the tunnel
// opens at that speed and eases — one straight ramp over the whole of it
// (SCENES.kaleido.ease) — to the speed the fall opens at, which the nest
// works out from its own geometry (nest.openingSpeed). No stop at the room
// and no restart after it: the fall carries on from the tunnel's last frame
// at the pace it arrived at. The lens is the run's one lens (LENS) the whole
// way, and the camera carries the run's one hand (world/wobble.js) on the
// run's clock, so the seams either side of the tunnel are the same second of
// the same wobble.
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
	// uGlow    the light in the set's glass as it switches on — the dot and
	//          the line, one capsule `uCap` across and high on a quad `uQuad`
	const uBright = uniform(K.dim);
	const uGlow = uniform(0);
	const uCap = uniform(new THREE.Vector2(0.1, 0.1));
	const uQuad = uniform(new THREE.Vector2(0.3, 0.3));
	const YELLOW = new THREE.Color(K.signalColor);
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

	// ── The archive on a run it cannot answer for: the gif ───────────────
	// A birthday the archive has nothing for gets no drawings down the
	// tunnel — the tunnel is about to break down on it (world/kaleido.js) —
	// and the rings are the verdict's own gif instead: a sheet of its frames
	// (data/gifs.js, baked by scripts/gifs.mjs), every quad on the same
	// frame, the frame counted off the run's clock (tsl/clock.js runClock)
	// so a pin is exact and the hold under the verdict plays on; hue-turned,
	// dimmed and stencilled exactly as the drawings are, over the wall as
	// they are. The materials are built here so the warm-up compiles them
	// (the two quads on `rings` a hair across); the sheet itself is fetched
	// the first time it is asked for (setArchive), while the rings are still
	// too small to see, so a run the archive can answer for never loads it.
	const gifs = {};
	for (const name of Object.values(K.gif.of)) {
		const G = GIFS[name];
		const tex = new THREE.Texture();
		tex.colorSpace = THREE.SRGBColorSpace;
		const m = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		const frame = mod(floor(runClock.mul(G.fps)), G.frames);
		const cx = mod(frame, G.cols);
		const cy = floor(frame.div(G.cols));
		// Half a pixel in from the cell's edges, so a neighbour never bleeds in.
		const inset = vec2(0.5 / G.w, 0.5 / G.h);
		const q = mix(inset, vec2(1.0, 1.0).sub(inset), uv());
		const st = vec2(
			q.x.add(cx).div(G.cols),
			float(G.rows - 1)
				.sub(cy)
				.add(q.y)
				.div(G.rows)
		);
		const c = texture(tex, st);
		m.colorNode = vec4(hue(c.rgb, turned).mul(uBright), uOn.mul(near).mul(uDim));
		stencilOf(m, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
		disposables.push(m, tex);
		gifs[name] = { tex, material: m, aspect: G.w / G.h, src: G.src, loaded: false };
	}
	function loadGif(g) {
		if (g.loaded) return;
		g.loaded = true;
		new THREE.ImageLoader().load(g.src, (img) => {
			g.tex.image = img;
			g.tex.needsUpdate = true;
		});
	}

	// ── The wall ─────────────────────────────────────────────────────────
	// One open cylinder on the axis, seen from inside, drawn where the stencil
	// is 1 or more like the rings and just UNDER them, so the drawings sit on
	// it and it sits on the disc where the disc reaches past its mouth (the
	// disc runs out to NEST.disc.rout, well past the wall's radius; nothing of
	// it past the mouth is ever in the frame but through the wall, so it is
	// left as it is and the wall covers it). Laid OVER, premultiplied, black
	// between the grooves — the wall is a surface, and what is behind it is
	// the dark — or ADDED, gold alone over the black, by the knob.
	//
	// The groove coordinate is the distance down the axis from the ROOM end
	// (uRoomZ, set with the nest), the angle is round the axis less the turn
	// the rings have made (uTurn), and the stroke is hair()'s: floored at a
	// screen pixel by the fwidth of the coordinate and dimmed by the same
	// ratio, since down a wall seen at a grazing angle the grooves crowd to
	// nothing long before the dark takes them. The sheen is fixed in the
	// world while the grooves turn under it. The pulse is one sine down the
	// axis, its phase the scene's progress (uPhase), running toward the room.
	const W = K.wall;
	const uTurn = uniform(0);
	const uPhase = uniform(0);
	const uRoomZ = uniform(0);
	const GOLD = new THREE.Color(0xf0c45c);
	const wallGeo = new THREE.CylinderGeometry(W.radius, W.radius, 1, W.segments, 1, true);
	const wallMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		side: THREE.DoubleSide,
		...(W.add
			? ADD
			: {
					blending: THREE.CustomBlending,
					blendSrc: THREE.OneFactor,
					blendDst: THREE.OneMinusSrcAlphaFactor,
					blendEquation: THREE.AddEquation
				})
	});
	{
		const grooveDist = grooveDistNode(THREE);
		wallMat.colorNode = Fn(() => {
			const s = positionWorld.z.sub(uRoomZ);
			const th0 = atan(positionWorld.y, positionWorld.x);
			const th = th0.sub(uTurn);
			const d = grooveDist(s, th, float(W.pitch), float(W.amp), float(W.rate));
			const groove = hair(d, float(W.stroke), fwidth(s));
			const sheen = pow(abs(cos(th0.sub(1.15))), 3.0).mul(W.sheen);
			const lit = mix(1.0 - 0.7 * W.sheen, 1.0, sheen);
			const pulse = sin(s.div(W.wavelength).add(uPhase).mul(TWO_PI))
				.mul(0.5)
				.add(0.5)
				.mul(W.depth)
				.oneMinus();
			const gold = hue(vec3(GOLD.r, GOLD.g, GOLD.b), turned.mul(W.hue));
			const level = float(W.level).mul(mix(1.0, uBright.div(K.dim), W.overload));
			const a = near.mul(uDim).mul(mix(1.0, uOn, W.out));
			const col = gold.mul(groove.mul(lit).mul(pulse).mul(level));
			return W.add ? vec4(col.mul(a), 1.0) : vec4(col.mul(a), a);
		})();
	}
	stencilOf(wallMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
	disposables.push(wallMat, wallGeo);
	const wall = new THREE.Mesh(wallGeo, wallMat);
	wall.name = 'wall';
	wall.rotation.x = Math.PI / 2;
	wall.renderOrder = RING_ORDER - 1;
	wall.frustumCulled = false;
	wall.visible = W.on;

	// ── The world ────────────────────────────────────────────────────────
	const root = new THREE.Group();
	root.name = 'kaleidoscope';
	const screenRoot = new THREE.Group();
	screenRoot.name = 'screen';
	root.add(screenRoot);
	const rings = new THREE.Group();
	rings.name = 'rings';
	root.add(rings);
	if (W.on) root.add(wall);

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
			// Its drawing, for setArchive to put back after a gif.
			g.userData = { material: ringMat[d][key], w, h };
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
		// The gif materials' warm-up quads: on the axis, a hair across.
		for (const g of Object.values(gifs)) {
			const m = new THREE.Mesh(plane, g.material);
			m.name = 'gifWarm';
			m.scale.setScalar(1e-4);
			m.renderOrder = RING_ORDER;
			rings.add(m);
		}
	}

	// The rings' drawings, or the gif of an edge run: `kind` is null, 'past'
	// or 'future' (K.gif.of says which gif), the quads resized to it.
	let archive = null;
	function setArchive(kind) {
		if (kind === archive) return;
		archive = kind;
		const gif = kind ? gifs[K.gif.of[kind]] : null;
		if (gif) loadGif(gif);
		for (const g of ringList) {
			const { material, w, h } = g.userData;
			const gw = gif ? K.gif.size : w;
			const gh = gif ? gw / gif.aspect : h;
			g.children.forEach((m, j) => {
				m.material = gif ? gif.material : material;
				m.scale.set(j % 2 ? -gw : gw, gh, 1);
			});
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
		// nest inside has done to it) and after the tunnel, and the light
		// between them. setOpen() parts them about where the swimmer's nose
		// touched — the set switching on. Gated by uDim like the bezel, so an
		// unlit set is nothing on the dark.
		const coverMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		coverMat.colorNode = vec4(0, 0, 0, uDim);
		stencilOf(coverMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
		// The dot, and the line it draws out into: ONE quad, ADD, the site's
		// yellow with a white core — a capsule `uCap` world units across and
		// high, soft-edged, on a quad padded round it (`uQuad`) so the glow has
		// room. As high as it is wide it is the dot where the nose touched;
		// drawn out to the glass's width and thinned to the hairline it is the
		// line the set switches on with. Premultiplied additive: the level goes
		// in the colour, not the alpha. Stencil 1 or more: it is the GLASS
		// lighting under the nose, not the nose.
		const lineMat = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			...ADD
		});
		lineMat.colorNode = Fn(() => {
			const p = uv().sub(0.5).mul(uQuad);
			const r = uCap.y.mul(0.5);
			const hx = max(uCap.x.mul(0.5).sub(r), 0.0);
			const d = length(vec2(max(abs(p.x).sub(hx), 0.0), p.y)).div(r);
			const soft = exp(d.mul(d).mul(-1.2));
			const core = exp(d.mul(d).mul(-7.0));
			const lit = uGlow.mul(uDim);
			const col = vec3(YELLOW.r, YELLOW.g, YELLOW.b)
				.mul(soft.mul(0.9))
				.add(vec3(1, 1, 1).mul(core).mul(1.1));
			return vec4(col.mul(lit), 1.0);
		})();
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
		setOpen(1, 1, 0, glass.x, glass.y);
	}

	// ── Where everything is ──────────────────────────────────────────────
	// The set's glass is dead ahead on the axis, `travel` units down it. The
	// tunnel runs from that plane to room 0's, and the nest is put where the
	// tunnel's end lands the camera on nest.pose(0).
	let zGlass = 0; // the screen's glass plane, world z
	let z0 = 0; // where the flight ends: the glass filling the frame's height
	let zEnd = 0; // where the tunnel ends: nest.pose(0)'s camera
	let v0 = 1; // the flight's one speed, world units a second
	let v1 = 1; // the speed at the tunnel's end: the fall's opening speed
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
		// The speed the tunnel eases to is the fall's own, and the fall's own
		// depends on every room in it, so both are worked out here — and
		// again when the deeper rooms are set (approach.js finalise()).
		v1 = nest.openingSpeed();
		zEnd = z0 - travelled(1);
		// Room 0 is at the nest's root, its frame centred on the axis.
		nest.root.position.set(0, 0, 0);
		nest.refreshClips();
		const { D } = nest.pose(0, probe, 1);
		const seamD = probe.position.z; // before room 0's frame plane
		nest.root.position.z = zEnd - seamD;
		nest.refreshClips();
		Dend = D;
		// The rings, from the glass plane down to just short of the room's —
		// and the wall the whole way, glass plane to room plane, its grooves
		// counted from the room end.
		const roomZ = zEnd - seamD;
		wall.scale.set(1, zGlass - roomZ, 1);
		wall.position.z = (zGlass + roomZ) / 2;
		uRoomZ.value = roomZ;
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
		z0 = zGlass + sg.h / 2 / Math.tan(rad(LENS) / 2);
		v0 = -z0 / SCENES.approach.duration;
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
	// Straight down the axis on the run's one lens, with the run's one hand
	// on it (world/wobble.js): the pattern turns, the lens does not. The
	// frame at u = 1 is nest.pose(0)'s.
	const euler = new THREE.Euler();
	function pose(u, camera, aspect) {
		const x = Math.max(0, Math.min(1, u));
		const fov = LENS;
		camera.position.set(0, 0, z0 - travelled(x));
		camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('kaleido', x)));
		camera.fov = fov;
		camera.aspect = aspect;
		camera.near = 0.1;
		camera.far = 400;
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
		return { fov, Dend, zGlass };
	}

	// The glass switching on, from where the swimmer's nose touched it — xc,
	// yc in the set's own frame (the glass's centre if nothing touched it):
	// `open` parts the covers about that height, out to the glass's edges;
	// `width` draws the line out from the dot at that point to the edges,
	// thinning to the hairline as it goes; `glow` is its brightness. 1, 1, 0
	// is a lit glass with the tunnel in it — the seam frame, whatever xc, yc.
	function setOpen(open, width, glow, xc, yc) {
		if (!screen) return;
		const g = screen.glass;
		const { top, bottom, line } = screen;
		const yT = g.y + g.h / 2;
		const yB = g.y - g.h / 2;
		// The covers: from the line's height out to the glass's edges,
		// shrinking toward those edges as the glass opens.
		const topH = (yT - yc) * (1 - open);
		const botH = (yc - yB) * (1 - open);
		top.scale.set(g.w, topH, 1);
		top.position.set(g.x, yT - topH / 2, 0.001);
		bottom.scale.set(g.w, botH, 1);
		bottom.position.set(g.x, yB + botH / 2, 0.001);
		top.visible = topH > 0.0005;
		bottom.visible = botH > 0.0005;
		// The line: a dot at the contact, drawn out to the glass's edges.
		const DOT = g.h * K.dot;
		const HAIR = g.h * K.hair;
		const xL = xc - DOT / 2 + (g.x - g.w / 2 - (xc - DOT / 2)) * width;
		const xR = xc + DOT / 2 + (g.x + g.w / 2 - (xc + DOT / 2)) * width;
		const capW = xR - xL;
		const capH = DOT + (HAIR - DOT) * width;
		const pad = capH * 2.5;
		uCap.value.set(capW, capH);
		uQuad.value.set(capW + pad, capH + pad);
		line.scale.set(capW + pad, capH + pad, 1);
		line.position.set((xL + xR) / 2, yc, 0.002);
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
			// The runaway turns the way the tunnel turns, faster.
			turn += Math.sign(T.turns || 1) * o * o * Math.PI * 2;
			hueA += o * o * Math.PI * 6;
			bright = K.dim + o * 0.7;
		}
		rings.rotation.z = turn;
		uTurn.value = turn * W.turn;
		uPhase.value = x * W.pulses;
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
		get zGlass() {
			return zGlass;
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
		setArchive,
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
