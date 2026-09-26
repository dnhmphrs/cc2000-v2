import {
	vec3,
	vec4,
	uniform,
	Fn,
	Discard,
	uv,
	float,
	length,
	atan,
	sin,
	cos,
	smoothstep,
	exp,
	pow,
	max,
	min,
	abs,
	fwidth,
	mix,
	texture,
	positionView,
	positionLocal,
	attribute
} from 'three/tsl';
import { LAYERS, placement, elementUrl, DECADES, shuffle } from '$lib/data/roomElements';
import { SCREEN_GLASS, GLASS_SAFETY, NEST, KALEIDO, LENS, SCENES, TUNNEL } from '$lib/config';
import { PHI } from '$lib/three/geometry/icosahedron';
import { glassOnly } from '$lib/three/tsl/glass';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { ADD } from '$lib/three/tsl/materials';
import { grooveDistNode, primeWave, spiralGroove, waveRamp, TWO_PI } from '$lib/three/tsl/zeta';

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
// Each level is a 3D similarity of its parent: level k+1's frame is placed
// behind level k's glass — NEST.funnel.back glass heights behind it, on it
// when that is 0 — scaled so the glass-aspect crop of the frame would land
// exactly on the glass (N = crop width / glass width) and by NEST.funnel.zoom
// on top of that, and turned by the screw angle about the glass centre. Every
// level has its own N and its own fixed point, and the camera walks each
// level's spiral similarity to its fractional power — c(f) = p' +
// R(fθ)·N^−f·(c0 − p') with p' = (I − R(θ)/N)⁻¹·g, g where the child's origin
// sits — so the frame at ζ = k+1 IS the picture the child starts on, and the
// crossing has no seam. What is in the glass round the child, now that the
// child is back and small in it, is the FUNNEL: see below.
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
// because the glass does: the descent drives it with setSplosh(). So does the
// DISC the first room is the label of, at the tunnel's end; and the FUNNEL
// every room after it is the label of, between it and its parent's glass
// (setFunnel).

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
	// How far behind a room's frame its monitor's glass is — the screen's
	// layer depth — and so how far behind the record's face its hole is.
	const HOLE_Z = -LAYERS.find((l) => l.key === 'screen').depth * DEPTH;
	const WALL_COVER = NEST.wallCover;
	const TILES = NEST.tiles;
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
					// The wall is drawn past its own edges (wallPlane, below):
					// LOOPED, mirrored at each edge so no seam shows, rather
					// than its edge pixels smeared out — the wallpaper goes on.
					if (cfg.key === 'bg') {
						tex.wrapS = THREE.MirroredRepeatWrapping;
						tex.wrapT = THREE.MirroredRepeatWrapping;
					}
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
	// tail's wobble is on this, so it never stops — not for a popup holding
	// the flight, and not at the seam. And its ROLL, an angle each scene
	// advances at the base spin times the run's pace there — so the roll
	// gathers speed as the run does, and carries through every seam.
	swimmer.clock = 0;
	swimmer.roll = 0;
	// The spin at a pace (against the flight's as it opens): the base spin,
	// and TUNNEL.spinGain of the pace's gain on top of it.
	swimmer.spinAt = (pace) => 1 + TUNNEL.spinGain * (pace - 1);
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
	// In seam distances, which build() sets in the world's units — the seam
	// distance is the frame's (a portrait frame is taller).
	const KS = NEST.scale;
	const uSeen0 = uniform(1);
	const uSeen1 = uniform(2);
	const nearN = smoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const dimmed = (node) => vec4(node.rgb.mul(uDark), node.a.mul(uDim).mul(nearN));

	// Gold, in hairlines, drawn OVER: what the disc and the funnels are made
	// of. hair() is a stroke floored at a screen pixel by fwidth, with the
	// light scaled down by the same ratio, so a groove that recedes gets
	// fainter rather than sparkling.
	const GOLD = new THREE.Color(0xf0c45c);
	const over = () =>
		new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blending: THREE.CustomBlending,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendEquation: THREE.AddEquation
		});
	const hair = Fn(([d, w, px]) => {
		const e = max(w, px);
		return smoothstep(0.0, e, d)
			.oneMinus()
			.mul(min(w.div(e), 1.0));
	});

	// ── The record at the tunnel's end: a funnel ─────────────────────────
	// The tunnel ends in a RECORD pressed into a funnel (NEST.disc): its
	// grooves carry on from the tunnel's wall — the funnel meets the wall at
	// its radius (KALEIDO.wall.radius) — and narrow, round the axis, to the
	// spindle hole, `rin` across: a monitor's size, the GLASS the first room
	// is seen through. And set as deep behind the record's face as a room's
	// glass is behind its frame (the screen's layer depth), so the fall's
	// first crossing, through the hole into the room, IS every crossing: the
	// same zoom about the same point the same way behind the glass. A hole in
	// the face's own plane made the first crossing a flatter zoom than the
	// rest, and the lens nearly doubled its speed going into the first room.
	// The funnel meets the wall `join` hole distances up from the hole (the
	// lens's distance from the hole as the fall opens), which puts the wall
	// behind the frame by the seam: at the seam the frame is the funnel and
	// the hole, and nothing of the tunnel, so the kaleido's last frame and the
	// fall's first are the same picture. It carries on past the wall by
	// `over`, out of sight behind it.
	//
	// The grooves are the wall's, carried on: one straight spiral, a turn a
	// pitch, counted from the hole, turning with the tunnel (setRecordTurn) —
	// and COLOURED by the critical line as the primes write it (tsl/zeta.js
	// primeWave, waveRamp), t running along the groove, so the 1-D line is
	// wound round the record in colour. The light falls off into the throat
	// (`throat`) and down to the wall's own level at the join, and the funnel
	// comes out of the dark late, over `seen` hole distances of the lens, so
	// the search ends by being drawn down into it rather than by the whole of
	// it arriving at once. The record is the fall's first LEVEL (build), the
	// hole its glass-only quad, and both are dropped once the lens is through
	// the hole, as a room is once through its glass.
	const D = NEST.disc;
	const W_ = KALEIDO.wall;
	const recU = {
		uJoin: uniform(1),
		uF0: uniform(1),
		uF1: uniform(2),
		uTurn: uniform(0)
	};
	const recordMat = over();
	recordMat.side = THREE.DoubleSide;
	{
		const wave = primeWave({ primes: D.primes, sigma: D.sigma, reach: D.reach });
		const ramp = waveRamp(THREE, D.ramp);
		recordMat.colorNode = Fn(() => {
			const s = positionLocal.z;
			const th0 = atan(positionLocal.y, positionLocal.x);
			const th = th0.sub(recU.uTurn);
			const g = spiralGroove(s, th, float(D.pitch / KS));
			const groove = hair(g.x, float(D.stroke / KS), fwidth(s));
			const tint = ramp(wave(g.y.mul(TWO_PI).add(th).mul(D.rate)));
			const sheen = pow(abs(cos(th0.sub(1.15))), 3.0).mul(D.sheen);
			const lit = mix(1.0 - 0.7 * D.sheen, 1.0, sheen);
			// Dark in the throat, full by `crest` of the way up, and down to
			// the wall's own level by the join, where the wall takes over.
			const up = s.div(recU.uJoin);
			const shade = mix(float(D.throat), 1.0, smoothstep(0.0, D.crest, up)).mul(
				mix(1.0, W_.level / D.level, smoothstep(D.crest, 1.0, up))
			);
			const fade = smoothstep(recU.uF0, recU.uF1, positionView.z.negate()).oneMinus();
			const a = fade.mul(uDim);
			const col = tint.mul(groove.mul(lit).mul(shade).mul(D.level)).mul(uDark);
			return vec4(col.mul(a), a);
		})();
	}
	stencilOf(recordMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);

	// ── The funnel: the record between the rooms ─────────────────────────
	// Every room after the first is the LABEL of a record with depth. Its
	// frame sits NEST.funnel.back glass heights behind its parent's glass,
	// and between the two is an open truncated cone of gold ζ grooves — the
	// mouth at the glass, wide enough to fill it to its corners; the throat
	// at the child's frame plane, round the label — and, where the throat is
	// wider than the label, a flat annulus of the same grooves in the frame's
	// plane closing the bottom. At `throat` = rin it is a cone down onto the
	// label; at 'mouth' it is a can, a cylinder with a flat record at the
	// bottom. Both are in the CHILD's group, in child units, axis z, so they
	// scale and screw with the child and are dropped with it (rebase) once
	// the lens is past the child's glass — by which time they are behind it.
	//
	// Opaque black between the grooves everywhere outside the label, blended
	// OVER: it covers the child's wall smeared out past its frame, and the
	// parent's painted glass round the child. Only where the stencil says
	// the PARENT's glass — this room's own ref, k + 1 — and ≥ rather than =
	// for the same reason as the disc: the whole funnel is outside the label,
	// and the label is outside the frame the child's own glass is in, so
	// nothing deeper is ever under it and the two are the same test. After
	// the child's back layers, so it is over the wall, and before its front.
	//
	// The groove coordinate is the distance along the SURFACE from the
	// label's edge, `g`: out across the annulus, then up the slant of the
	// cone — baked into the geometry as an attribute, since it is linear
	// along every edge — so one spiral runs from the label to the mouth
	// whatever the shape (three/tsl/zeta.js). The label's radius is the
	// disc's, uRin, pushed outside the frame's corners on the live lens
	// (setDiscRin): nothing inside it is drawn, so no groove is inside the
	// frame at ζ = k+1 exactly, where the child's frame fills the height and
	// the crossing hands over.
	//
	// It moves — on the descent's progress, never on the clock, so a pin is
	// still the frame the run would draw: the record turns, and a wave of
	// light runs down the grooves to the throat (setFunnel; NEST.funnel).
	const F = NEST.funnel;
	const fu = { uTurn: uniform(0), uPhase: uniform(0) };
	const grooveDist = grooveDistNode(THREE);
	const funnelColor = Fn(() => {
		const pos = positionLocal;
		const th = atan(pos.y, pos.x);
		const g = attribute('groove', 'float');
		const px = fwidth(g);
		const w = float(F.stroke);
		// The label's edge, along the surface: the throat, less the hole.
		const edge = float(Math.max(0, F.throat - D.rin));
		const d = grooveDist(g, th.add(fu.uTurn.mul(2.0 * Math.PI)), F.pitch, F.amp, F.rate);
		const band = sin(g.mul(2.3).add(0.4))
			.mul(sin(g.mul(5.7)))
			.mul(0.18)
			.add(0.82);
		// The pulse: a wave of light travelling down the funnel to the throat.
		const pulse = sin(
			g
				.div(F.wave)
				.add(fu.uPhase)
				.mul(2.0 * Math.PI)
		)
			.mul(0.5)
			.add(0.5)
			.mul(F.depth)
			.oneMinus();
		const groove = hair(d, w, px)
			.mul(band)
			.mul(smoothstep(edge.add(0.04), edge.add(0.12), g));
		const lock = hair(abs(g.sub(edge)), w.mul(1.4), px);
		const sheen = pow(abs(cos(th.sub(1.15))), 3.0).mul(F.sheen);
		const lit = mix(1.0 - 0.7 * F.sheen, 1.0, sheen);
		const gloss = sheen.mul(0.045);
		const outside = smoothstep(edge.sub(0.01), edge, g);
		const a = outside.mul(nearN).mul(uDim);
		const gold = vec3(GOLD.r, GOLD.g, GOLD.b);
		const col = gold
			.mul(groove.mul(lit).mul(pulse).mul(0.95).add(lock.mul(1.1)).add(gloss.mul(pulse)))
			.mul(uDark);
		return vec4(col.mul(a), a);
	})();
	// The geometry, per level: the cone from the mouth (z = `depth`, radius
	// `mouthR`) down to the throat (z = 0, radius `throat`), open at both
	// ends, and the annulus from the label's edge out to the throat where
	// there is one. `groove` is the distance along the surface from the
	// label's edge, rin: r − rin across the annulus, then up the slant.
	const FUNNEL_SEGS = 128;
	function funnelGeometry(mouthR, throat, depth) {
		const cone = new THREE.CylinderGeometry(mouthR, throat, depth, FUNNEL_SEGS, 1, true);
		cone.rotateX(Math.PI / 2);
		cone.translate(0, 0, depth / 2);
		const slant = Math.hypot(mouthR - throat, depth);
		{
			const p = cone.attributes.position;
			const gv = new Float32Array(p.count);
			for (let i = 0; i < p.count; i++) gv[i] = throat - D.rin + (p.getZ(i) / depth) * slant;
			cone.setAttribute('groove', new THREE.BufferAttribute(gv, 1));
		}
		let ring = null;
		if (throat > D.rin + 1e-4) {
			ring = new THREE.RingGeometry(D.rin, throat, FUNNEL_SEGS, 1);
			const p = ring.attributes.position;
			const gv = new Float32Array(p.count);
			for (let i = 0; i < p.count; i++) gv[i] = Math.hypot(p.getX(i), p.getY(i)) - D.rin;
			ring.setAttribute('groove', new THREE.BufferAttribute(gv, 1));
		}
		return { cone, ring };
	}

	// ── The nest itself ──────────────────────────────────────────────────
	const root = new THREE.Group();
	root.name = 'nest';
	// The fall's world is NEST.scale times the rooms' own units: big enough
	// that the lens, at the seam, is far enough from the record's hole for
	// the tunnel to arrive at the fall's pace without braking (see
	// SCENES.descent.accel and kaleidoscope.js).
	root.scale.setScalar(KS);
	let recordJoin = 0; // world height, above the record's face, of the funnel's join to the wall
	let recordHole = 0; // world height, above the record's face, of its hole (below it: negative)
	let recordRest = 0; // the record's turn where the tunnel comes to rest
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

		// The RECORD is level 0, at the root, unturned and at unit scale — it
		// is what the tunnel ends on — and its hole is the glass room 0 sits
		// behind, screwed and scaled like every room behind its parent's
		// glass. Every room after that sits behind its parent's glass, at
		// the bottom of its funnel. With the funnel off, on the glass, as it
		// was.
		const back = F.on ? F.back : 0;
		const zoom = F.on ? F.zoom : 1;
		const nLevels = rooms.length + 1;
		let parent = null;
		{
			const group = new THREE.Group();
			root.add(group);
			const rin = D.rin;
			const glass = { x: 0, y: 0, z: HOLE_Z, w: 2 * rin, h: 2 * rin };
			// The funnel, in room units: from the hole, up and out to the
			// wall's radius at `join` hole distances, and on past it by
			// `over`. The hole distance is the lens's from the hole at the
			// seam: the seam distance from the face, and the hole's depth.
			const d0 = H / 2 / Math.tan(rad(LENS) / 2);
			const dh = d0 - HOLE_Z;
			const joinH = D.join * dh;
			const joinR = KALEIDO.wall.radius / KS;
			const slope = (joinR - rin) / joinH;
			const rimR = (KALEIDO.wall.radius + D.over) / KS;
			const rimH = (rimR - rin) / slope;
			const coneGeo = new THREE.CylinderGeometry(rimR, rin, rimH, D.segments, 1, true);
			coneGeo.rotateX(Math.PI / 2);
			coneGeo.translate(0, 0, rimH / 2);
			disposables.push(coneGeo);
			recordJoin = (HOLE_Z + joinH) * KS;
			recordHole = HOLE_Z * KS;
			recU.uJoin.value = joinH;
			recU.uF0.value = D.seen[0] * dh * KS;
			recU.uF1.value = D.seen[1] * dh * KS;
			uSeen0.value = NEST.seen[0] * dh * KS;
			uSeen1.value = NEST.seen[1] * dh * KS;
			// The funnel: where the stencil is 1 or more, first of all.
			const disc = new THREE.Mesh(coneGeo, recordMat);
			disc.position.z = HOLE_Z;
			disc.name = 'record';
			disc.renderOrder = 0;
			disc.frustumCulled = false;
			group.add(disc);
			// The hole: a circle that takes the stencil from 1 to 2, so room 0
			// draws inside it and nowhere else — the record's glass-only quad.
			const hm = mk(
				new THREE.MeshBasicNodeMaterial({
					transparent: true,
					depthTest: false,
					depthWrite: false,
					colorWrite: false
				})
			);
			hm.colorNode = Fn(() => {
				Discard(length(uv().sub(0.5)).greaterThan(0.5));
				return vec4(0, 0, 0, 1);
			})();
			stencilOf(hm, 1, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
			const hole = new THREE.Mesh(plane, hm);
			hole.scale.set(2 * rin, 2 * rin, 1);
			hole.position.set(0, 0, HOLE_Z + 0.001);
			hole.renderOrder = 4;
			hole.frustumCulled = false;
			group.add(hole);
			const lv = {
				decade: null,
				L: {},
				glass,
				group,
				meshes: [disc, hole],
				screenMesh: hole,
				N: 1,
				screw: 0,
				k: 0
			};
			levels.push(lv);
			parent = lv;
		}
		rooms.forEach((decade) => {
			const k = levels.length;
			const r = room(decade, portrait);
			const group = new THREE.Group();
			let N = 1;
			const screw = parent ? SCREW : 0;
			if (parent) {
				const pgl = parent.glass;
				const ga = pgl.w / pgl.h;
				const Kw = ga < W / H ? H * ga : W;
				N = (Kw / pgl.w) * zoom;
				group.position.set(pgl.x, pgl.y, pgl.z - back * pgl.h);
				group.scale.setScalar(1 / N);
				group.quaternion.setFromAxisAngle(zAxis, screw);
				parent.group.add(group);
			} else {
				root.add(group);
			}

			const meshes = [];
			let screenMesh;
			// The wallpaper's period: the back wall at cover, which the frame
			// sits inside. The objects repeat on it, mirrored tile by tile as
			// the wallpaper is (NEST.tiles), one instanced draw per layer.
			const P = { w: r.L.bg.w, h: r.L.bg.h };
			const M = new THREE.Matrix4();
			const Q = new THREE.Quaternion();
			const V = new THREE.Vector3();
			const S = new THREE.Vector3();
			const sprite = (key, mat, order, tiles = 0) => {
				const l = r.L[key];
				const wall = key === 'bg';
				let m;
				if (tiles > 0) {
					const side = 2 * tiles + 1;
					m = new THREE.InstancedMesh(plane, mat, side * side);
					let n = 0;
					for (let j = -tiles; j <= tiles; j++) {
						for (let i = -tiles; i <= tiles; i++) {
							// An odd tile is the room reflected across the tile's
							// edge: its objects mirrored, and placed as their
							// reflections.
							const sx = i % 2 ? -1 : 1;
							const sy = j % 2 ? -1 : 1;
							V.set(i * P.w + sx * l.x, j * P.h + sy * l.y, l.z);
							S.set(sx * l.w, sy * l.h, 1);
							m.setMatrixAt(n++, M.compose(V, Q, S));
						}
					}
					m.instanceMatrix.needsUpdate = true;
					disposables.push(m);
				} else {
					m = new THREE.Mesh(wall ? wallPlane : plane, mat);
					const f = wall ? WALL_COVER : 1;
					m.scale.set(l.w * f, l.h * f, 1);
					m.position.set(l.x, l.y, l.z);
				}
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
						depthWrite: false,
						// The mirrored tiles wind the other way.
						side: THREE.DoubleSide
					})
				);
				m.colorNode = dimmed(texture(textures[decade][key]));
				return m;
			};
			BACK.forEach((key, i) => {
				sprite(
					key,
					stencil(flat(key), THREE.EqualStencilFunc, THREE.KeepStencilOp),
					10 * k + i,
					key === 'bg' ? 0 : TILES
				);
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
			// The glass itself is the room's alone: only it opens onto the next
			// room, and its mesh is where the readout's rect is measured from.
			screenMesh = sprite(
				'screen',
				stencil(gm, THREE.EqualStencilFunc, THREE.IncrementStencilOp),
				10 * k + 4
			);
			// Front layers: after every level's back, deepest level first.
			FRONT.forEach((key, j) =>
				sprite(
					key,
					stencil(flat(key), THREE.LessEqualStencilFunc, THREE.KeepStencilOp),
					10 * (nLevels + 1) + 10 * (nLevels - 1 - k) + j,
					TILES
				)
			);
			// The funnel, from the parent's glass down to this room's frame —
			// see above. In THIS level's meshes, so it goes with the room.
			if (parent && F.on) {
				const pgl = parent.glass;
				const mouthR = F.mouth * (Math.hypot(pgl.w, pgl.h) / 2) * N;
				const throat = F.throat === 'mouth' ? mouthR : F.throat;
				const { cone, ring } = funnelGeometry(mouthR, throat, back * pgl.h * N);
				const fm = mk(over());
				fm.colorNode = funnelColor;
				fm.side = THREE.DoubleSide;
				stencil(fm, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
				for (const geo of [cone, ring]) {
					if (!geo) continue;
					disposables.push(geo);
					const m = new THREE.Mesh(geo, fm);
					m.renderOrder = 10 * k + 5;
					m.frustumCulled = false;
					group.add(m);
					meshes.push(m);
				}
			}
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
		// child's spiral similarity x ↦ g + R(θ)·x/N leaves where it is, g
		// being where the child's origin sits — its funnel's depth behind the
		// glass. The last room has no child, so its crossing — the landing
		// and the way home — uses the N a child would have had, ON the glass
		// and with NO screw, exactly as it always did: it lands level, and
		// the fixed point of a plain similarity is g·N/(N−1).
		levels.forEach((lv, k) => {
			const gl = lv.glass;
			const ga = gl.w / gl.h;
			const Kw = ga < W / H ? H * ga : W;
			const last = k === levels.length - 1;
			lv.childN = last ? Kw / gl.w : levels[k + 1].N;
			lv.lnN = Math.log(lv.childN);
			const gz = last ? gl.z : gl.z - back * gl.h;
			const th = last ? 0 : SCREW;
			const a = 1 - Math.cos(th) / lv.childN;
			const b = Math.sin(th) / lv.childN;
			const det = a * a + b * b;
			lv.fixed = new THREE.Vector3(
				(a * gl.x - b * gl.y) / det,
				(b * gl.x + a * gl.y) / det,
				(lv.childN * gz) / (lv.childN - 1)
			);
		});
		logs = levels.map((lv) => lv.lnN);
		fu.uTurn.value = 0;
		fu.uPhase.value = 0;
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
	// The rate down the fall: EASING IN from the first frame — the pace the
	// tunnel arrived at, a straight ramp up to `accel` times that by the
	// start of the landing — then a straight ramp down over `ease` to rest.
	// So the run never brakes until it lands: the flight gathers speed, the
	// tunnel gathers speed into the fall, the fall gathers speed into the
	// rooms. Integrated, normalised, and turned back into a level.
	function zetaOf(u) {
		const { ease: e, accel } = SCENES.descent;
		const a = 1 / accel;
		const x = Math.max(0, Math.min(1, u));
		const cruise = ((1 - e) * (1 + a)) / 2;
		const area = cruise + e / 2;
		let h;
		if (x <= 1 - e) h = a * x + ((1 - a) * x * x) / (2 * (1 - e));
		else {
			const y = x - (1 - e);
			h = cruise + y - (y * y) / (2 * e);
		}
		return zetaOfLog(logEnd() * (h / area));
	}
	// The fall's pace at u, against its pace as it opens: 1 at the seam,
	// rising to `accel` by the landing, and down to nothing as it lands.
	function paceOf(u) {
		const { ease: e, accel } = SCENES.descent;
		const a = 1 / accel;
		const x = Math.max(0, Math.min(1, u));
		const rate = x <= 1 - e ? a + ((1 - a) * x) / (1 - e) : 1 - (x - (1 - e)) / e;
		return rate / a;
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
		paceOf,
		// The fall's opening pace against the flight's (set by the tunnel as
		// it places the nest): what the swimmer's roll is running at by the
		// seam, so the fall's roll carries on from it.
		seamPace: 1,
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
		// The hole is a monitor's size now, whatever the frame (NEST.disc.rin);
		// this used to push the label out past the frame's corners, and the
		// lab's sketches still call it.
		setDiscRin() {},
		// The world height, above the record's hole, at which its funnel
		// meets the tunnel's wall — where the wall and the rings stop
		// (kaleidoscope.js placeNest).
		get recordJoin() {
			return recordJoin;
		},
		// And of its hole: the grooves on the wall are counted from it.
		get recordHole() {
			return recordHole;
		},
		// The record's grooves turn with the tunnel's (kaleidoscope.turnTo),
		// so they carry straight on from the wall's at the join — and stand
		// at the turn the tunnel came to rest at (`rest`, set with the nest)
		// through the fall, which sets it itself (restRecord) rather than
		// inheriting it: a seek into the fall runs no tunnel.
		setRecordTurn(turn, rest = false) {
			recU.uTurn.value = turn;
			if (rest) recordRest = turn;
		},
		restRecord() {
			recU.uTurn.value = recordRest;
		},
		// The funnels, at `p` of the descent: the record's turn and the
		// pulse's phase, straight off the progress — NEST.funnel.
		setFunnel(p) {
			fu.uTurn.value = p * F.turns;
			fu.uPhase.value = p * F.pulses;
		},
		dispose() {
			clear();
			for (const d of Object.values(textures)) for (const t of Object.values(d)) t.dispose();
			plane.dispose();
			wallPlane.dispose();
			sploshMat.dispose();
			recordMat.dispose();
		}
	};
}
