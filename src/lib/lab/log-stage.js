// ── The stage: the 2D room stood up as flats in 3D ───────────────────────────
// The site's room is a flat drawing in six layers at six depths behind a
// golden-rectangle frame. This stands those layers up in 3D exactly where the
// site keeps them — the wall three units back, the poster and the clock on it,
// the screen, the desk and the bed stepping forward — between a plank floor
// and a ceiling slab, in the flat colours and thin construction lines of a
// perspective study on a blue ground. From the one eye point, far off on the
// axis with a long lens, it is the drawing; from anywhere else it is a stage
// set — flats in a box — and the lines of sight from the eye through every
// flat's corners, and every flat's edges run out long, show the projective
// construction. Each variant is a LOOP that leaves the eye point and comes
// home to it, so the first and last frames are the same drawing.
//
// The projective fact under it: a flat can slide along its lines of sight from
// the eye — further back and larger, or nearer and smaller — and the drawing
// from the eye does not change. The picture is one fibre of the projection;
// `explode` and `shuffle` play that.
//
//   orbit    a dolly zoom from the drawing into the room (the long lens at the
//            eye becomes a wide one close in, the frame held), a loop round
//            the set — under the floor, beside it, over the ceiling — and the
//            dolly zoom back out to the drawing.
//   swing    the perspective study's own shots: low and to one side looking
//            up with the floor slab filling the frame, high and to the other
//            looking down over the ceiling, the lens rolled, wide.
//   walk     into the room: through the frame, in past the bed, turning to
//            look round at the desk, the screen, the clock and the ceiling
//            overhead, and back out.
//   explode  the flats slide along their lines of sight from the eye, each on
//            its own breath, while the lens circles near the eye: the room
//            pulls apart and together and the drawing from the eye never
//            changes.
//   shuffle  three different sets, each a random deal of depths, each
//            projecting to the same drawing from the eye: the lens loops round
//            one, comes home — where they are indistinguishable — and the
//            next is there.
//
//   ?decade=50s|60s|90s|10s   the room (90s by default)
//   ?at=0.42                  pins a frame; every frame is a pure function of
//                             progress, and every variant starts and ends on
//                             the drawing
//
// Drawn on the lab's own three.js renderer (the flats want real perspective
// and a textured quad is a quad); the board over it is kept clear but for the
// tag, so the set shows through.

import { LAYERS, placement, elementUrl } from '$lib/data/roomElements';
import { PHI, TAU, getBoard, clock, tag, variant, lerp, smooth } from './log/board.js';

const W = 2 * PHI; // the frame: a golden rectangle, landscape
const H = 2;
const DEPTH = 3; // the wall is this far behind the frame
const FOV0 = 12; // the long lens at the eye: the drawing
const FIT = 1.18; // the view's half-height at the frame plane, in frame units
const dist = (fov) => FIT / Math.tan((fov * Math.PI) / 360);
const D0 = dist(FOV0); // the eye's distance from the frame plane, ≈ 11.2
const EYE = [0, 0, D0];
const SECONDS = { orbit: 12, swing: 12, walk: 14, explode: 12, shuffle: 18 };
const BLUE = 0x1f4fd0;
const LINE = 0xffffff;

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const span = (x, a, b) => clamp01((x - a) / (b - a));
export default async function make({ THREE, renderer, at }) {
	const v = variant(['orbit', 'swing', 'walk', 'explode', 'shuffle']);
	const q = new URLSearchParams(location.search);
	const decade = ['50s', '60s', '90s', '10s'].includes(q.get('decade')) ? q.get('decade') : '90s';
	const seconds = SECONDS[v];
	const time = clock(seconds, at);
	const b = getBoard();

	// ── The drawings ─────────────────────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const tex = {};
	await Promise.all(
		LAYERS.map(async (cfg) => {
			const t = await loader.loadAsync(elementUrl(decade, cfg.key));
			t.colorSpace = THREE.SRGBColorSpace;
			t.generateMipmaps = true;
			t.minFilter = THREE.LinearMipmapLinearFilter;
			t.magFilter = THREE.LinearFilter;
			t.anisotropy = Math.min(4, maxAniso);
			tex[cfg.key] = t;
		})
	);

	// The site's own layout, landscape: x right, y up, z toward the eye, the
	// frame plane at z = 0. The wall covers the frame (cropped to it).
	const flats = LAYERS.map((cfg) => {
		const t = tex[cfg.key];
		const aspect = t.image.width / t.image.height;
		const pos = placement(cfg, decade, false);
		let w, h;
		if (cfg.cover) {
			w = W;
			h = H;
			const fa = W / H;
			if (aspect > fa) {
				t.repeat.set(fa / aspect, 1);
				t.offset.set((1 - fa / aspect) / 2, 0);
			} else {
				t.repeat.set(1, aspect / fa);
				t.offset.set(0, (1 - aspect / fa) / 2);
			}
		} else {
			w = pos.width * W;
			h = w / aspect;
		}
		return {
			key: cfg.key,
			wall: !!cfg.cover,
			w,
			h,
			x: ((pos.x || 0) * W) / 2,
			y: ((pos.y || 0) * H) / 2,
			z0: -cfg.depth * DEPTH, // where the site keeps it
			z: -cfg.depth * DEPTH, // where it is this frame
			lam: 1 // its scale along the line of sight, 1 at z0
		};
	});

	// ── The set ──────────────────────────────────────────────────────────────
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(BLUE);
	const unit = new THREE.PlaneGeometry(1, 1);
	for (const f of flats) {
		const mat = new THREE.MeshBasicMaterial({
			map: tex[f.key],
			alphaTest: f.wall ? 0 : 0.5,
			side: THREE.DoubleSide
		});
		f.mesh = new THREE.Mesh(unit, mat);
		scene.add(f.mesh);
	}

	// The floor and the ceiling: slabs the depth of the room, a little wider
	// than the frame, each face its own plane in a flat colour (no lighting:
	// the colours are the shading, as in a perspective study).
	const TH = 0.07;
	const SX = W / 2 + 0.35;
	const face = (w, h, color, pos, rot) => {
		const m = new THREE.Mesh(
			new THREE.PlaneGeometry(w, h),
			new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
		);
		m.position.set(...pos);
		m.rotation.set(...rot);
		scene.add(m);
		return m;
	};
	const slab = (y, top, under, side) => {
		const zc = -DEPTH / 2;
		face(2 * SX, DEPTH, top, [0, y + TH / 2, zc], [-Math.PI / 2, 0, 0]);
		face(2 * SX, DEPTH, under, [0, y - TH / 2, zc], [Math.PI / 2, 0, 0]);
		face(2 * SX, TH, side, [0, y, 0], [0, 0, 0]);
		face(2 * SX, TH, side, [0, y, -DEPTH], [0, 0, 0]);
		face(DEPTH, TH, side, [SX, y, zc], [0, Math.PI / 2, 0]);
		face(DEPTH, TH, side, [-SX, y, zc], [0, Math.PI / 2, 0]);
	};
	slab(-H / 2 - TH / 2, 0xc9a86a, 0x8a6b3a, 0xb08f55); // the floor: planks on top
	slab(H / 2 + TH / 2, 0xc9a86a, 0xe8761f, 0xb08f55); // the ceiling: orange underneath

	// ── The lines ────────────────────────────────────────────────────────────
	// Fixed: the frame, the slabs' edges, the planks. Moving: every flat's
	// outline, its edges run out long, and its lines of sight from the eye,
	// from the wall to the frame plane.
	const lineMat = (opacity) =>
		new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity, depthWrite: false });
	const fixed = [];
	const seg = (a, c) => fixed.push(...a, ...c);
	// The frame.
	const fr = [
		[-W / 2, -H / 2, 0],
		[W / 2, -H / 2, 0],
		[W / 2, H / 2, 0],
		[-W / 2, H / 2, 0]
	];
	for (let i = 0; i < 4; i++) seg(fr[i], fr[(i + 1) % 4]);
	// The slabs' edges.
	for (const y of [-H / 2, -H / 2 - TH, H / 2, H / 2 + TH]) {
		const c = [
			[-SX, y, 0],
			[SX, y, 0],
			[SX, y, -DEPTH],
			[-SX, y, -DEPTH]
		];
		for (let i = 0; i < 4; i++) seg(c[i], c[(i + 1) % 4]);
	}
	for (const x of [-SX, SX])
		for (const z of [0, -DEPTH]) {
			seg([x, -H / 2, z], [x, -H / 2 - TH, z]);
			seg([x, H / 2, z], [x, H / 2 + TH, z]);
		}
	// The planks, along the room.
	for (let x = -SX + 0.27; x < SX - 0.01; x += 0.27)
		seg([x, -H / 2 + 0.002, 0], [x, -H / 2 + 0.002, -DEPTH]);
	const fixedGeo = new THREE.BufferGeometry();
	fixedGeo.setAttribute('position', new THREE.Float32BufferAttribute(fixed, 3));
	scene.add(new THREE.LineSegments(fixedGeo, lineMat(0.7)));

	const movers = flats.filter((f) => !f.wall);
	const EXT = 1.6; // how far each edge runs out past its corner
	const perFlat = 4 + 8 + 4; // outline, extensions (two per corner... see below), sight lines
	const moving = new Float32Array(movers.length * perFlat * 2 * 3);
	const movingGeo = new THREE.BufferGeometry();
	const movingAttr = new THREE.Float32BufferAttribute(moving, 3);
	movingAttr.setUsage(THREE.DynamicDrawUsage);
	movingGeo.setAttribute('position', movingAttr);
	scene.add(new THREE.LineSegments(movingGeo, lineMat(0.6)));

	// Place every flat for this frame: at depth z on its line of sight from the
	// eye, scaled so the drawing from the eye is unchanged (λ = (D0 − z)/(D0 − z0)).
	function placeFlats() {
		let k = 0;
		const put = (p) => {
			moving[k++] = p[0];
			moving[k++] = p[1];
			moving[k++] = p[2];
		};
		for (const f of flats) {
			f.lam = (D0 - f.z) / (D0 - f.z0);
			const cx = f.x * f.lam;
			const cy = f.y * f.lam;
			const hw = (f.w * f.lam) / 2;
			const hh = (f.h * f.lam) / 2;
			f.mesh.position.set(cx, cy, f.z);
			f.mesh.scale.set(2 * hw, 2 * hh, 1);
			if (f.wall) continue;
			const zl = f.z + 0.004;
			const C = [
				[cx - hw, cy - hh, zl],
				[cx + hw, cy - hh, zl],
				[cx + hw, cy + hh, zl],
				[cx - hw, cy + hh, zl]
			];
			// The outline.
			for (let i = 0; i < 4; i++) {
				put(C[i]);
				put(C[(i + 1) % 4]);
			}
			// The edges run out: each corner, along both its edges, outward.
			for (let i = 0; i < 4; i++) {
				const sx = C[i][0] < cx ? -1 : 1;
				const sy = C[i][1] < cy ? -1 : 1;
				put(C[i]);
				put([C[i][0] + sx * EXT * f.lam, C[i][1], zl]);
				put(C[i]);
				put([C[i][0], C[i][1] + sy * EXT * f.lam, zl]);
			}
			// The lines of sight from the eye through the corners, drawn from the
			// wall plane to the frame plane.
			for (let i = 0; i < 4; i++) {
				const P = C[i];
				const at = (z) => {
					const t = (z - EYE[2]) / (P[2] - EYE[2]);
					return [EYE[0] + (P[0] - EYE[0]) * t, EYE[1] + (P[1] - EYE[1]) * t, z];
				};
				put(at(-DEPTH));
				put(at(0));
			}
		}
		movingAttr.needsUpdate = true;
	}

	// ── The deals (shuffle) and the breaths (explode) ────────────────────────
	// The drawing from the eye is invariant under sliding a flat along its lines
	// of sight ONLY while the flats keep their order in depth: where two overlap
	// on the page the nearer covers the farther, and a deal that swapped them
	// would change the picture. So every deal keeps the site's order (random
	// depths, sorted, handed out nearest first), and every breath stays in the
	// band between its neighbours.
	let seed = 90210 + decade.charCodeAt(0);
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	const order = movers.slice().sort((a, b) => b.z0 - a.z0); // nearest first
	const DEALS = [0, 1, 2].map(() => {
		const zs = movers.map(() => -lerp(0.15, 2.9, rnd())).sort((a, b) => b - a);
		const deal = new Map();
		order.forEach((f, i) => deal.set(f, zs[i]));
		return deal;
	});
	const BAND = new Map();
	order.forEach((f, i) => {
		const hi = i === 0 ? -0.12 : (f.z0 + order[i - 1].z0) / 2;
		const lo = i === order.length - 1 ? -2.92 : (f.z0 + order[i + 1].z0) / 2;
		BAND.set(f, { lo, hi });
	});
	const BREATH = movers.map(() => ({ ph: rnd() * TAU }));

	function depths(u) {
		for (const f of flats) f.z = f.z0;
		if (v === 'explode') {
			movers.forEach((f, i) => {
				// A breath that is zero at u = 0 and 1, kept within the flat's band.
				const br = Math.sin(TAU * u + BREATH[i].ph) - Math.sin(BREATH[i].ph);
				const { lo, hi } = BAND.get(f);
				f.z = f.z0 + 0.85 * (br / 2) * (br > 0 ? hi - f.z0 : f.z0 - lo);
			});
		} else if (v === 'shuffle') {
			const d = Math.min(2, Math.floor(u * 3));
			for (const f of movers) f.z = DEALS[d].get(f);
		}
	}

	// ── The lens ─────────────────────────────────────────────────────────────
	const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.02, 100);
	// What the loops look at, and the centre they swing about: a little inside
	// the frame, so the lens stays in front of the box and looks down into it
	// over the ceiling's front edge, or up into it over the floor's.
	const T = [0, 0, -0.4];
	// On a sphere round T: azimuth, elevation, radius.
	const orbitAt = (az, el, R) => [
		T[0] + R * Math.sin(az) * Math.cos(el),
		T[1] + R * Math.sin(el),
		T[2] + R * Math.cos(az) * Math.cos(el)
	];

	// The dolly zoom's two ends: the long lens at the eye, a wide one close in,
	// the frame held the same size.
	function dolly(f, fov1) {
		const fov = lerp(FOV0, fov1, f);
		return { fov, pos: [0, 0, dist(fov)] };
	}

	function pose(u) {
		const A = 0.17; // the dolly in and out, each, in progress
		const f = u < A ? smooth(span(u, 0, A)) : u > 1 - A ? smooth(span(u, 1, 1 - A)) : 1;
		const s = smooth(span(u, A, 1 - A)); // the loop's own parameter, at rest at both ends
		if (v === 'orbit') {
			const { fov, pos } = dolly(f, 72);
			const R = pos[2] - T[2];
			const az = 1.0 * Math.sin(TAU * s);
			const el = 0.5 * Math.sin(2 * TAU * s);
			return { fov, pos: orbitAt(az, el, R), look: T, roll: 0 };
		}
		if (v === 'swing') {
			// Swung about a point in front of the frame, so the low shots look up
			// into the box over the floor's front edge rather than at its underside.
			const { fov, pos } = dolly(f, 82);
			const T2 = [0, 0, 0.3];
			const R = pos[2] - T2[2] + 0.9 * f;
			const az = -1.15 * Math.sin(TAU * s);
			const el =
				-0.55 * Math.sin(TAU * s) * Math.cos(Math.PI * s) +
				0.4 * Math.sin(TAU * s) ** 2 * (s > 0.5 ? 1 : -1);
			const P = [
				T2[0] + R * Math.sin(az) * Math.cos(el),
				T2[1] + R * Math.sin(el),
				T2[2] + R * Math.cos(az) * Math.cos(el)
			];
			return { fov, pos: P, look: T, roll: 0.38 * Math.sin(TAU * s) };
		}
		if (v === 'walk') {
			const { fov, pos } = dolly(f, 70);
			// In through the frame on the left, past the bed, and back.
			const w = Math.sin(Math.PI * s) ** 2;
			const x = -0.7 * w;
			const y = -0.15 * w;
			const z = lerp(pos[2], -0.35, w);
			const yaw = 0.85 * Math.sin(TAU * s) * w;
			const pitch = 0.42 * Math.sin(2 * TAU * s) * w;
			const look = [
				x + Math.sin(yaw) * Math.cos(pitch),
				y + Math.sin(pitch),
				z - Math.cos(yaw) * Math.cos(pitch)
			];
			return { fov, pos: [x, y, z], look, roll: 0 };
		}
		if (v === 'explode') {
			const { fov, pos } = dolly(f * 0.55, 72);
			const R = pos[2] - T[2];
			const az = 0.32 * Math.sin(TAU * s);
			const el = 0.2 * Math.sin(2 * TAU * s);
			return { fov, pos: orbitAt(az, el, R), look: T, roll: 0 };
		}
		// shuffle: three loops of `orbit`, one per deal.
		const t3 = (u * 3) % 1;
		const A3 = 0.2;
		const f3 = t3 < A3 ? smooth(span(t3, 0, A3)) : t3 > 1 - A3 ? smooth(span(t3, 1, 1 - A3)) : 1;
		const s3 = smooth(span(t3, A3, 1 - A3));
		const { fov, pos } = dolly(f3, 72);
		const R = pos[2] - T[2];
		const d = Math.min(2, Math.floor(u * 3));
		const dir = d % 2 ? -1 : 1;
		const az = dir * 1.05 * Math.sin(TAU * s3);
		const el = 0.62 * Math.sin(2 * TAU * s3) * (d === 1 ? -1 : 1);
		return { fov, pos: orbitAt(az, el, R), look: T, roll: 0 };
	}

	function setCamera(u) {
		const { fov, pos, look, roll } = pose(u);
		camera.fov = fov;
		camera.position.set(...pos);
		camera.up.set(Math.sin(roll), Math.cos(roll), 0);
		camera.lookAt(look[0], look[1], look[2]);
		camera.updateProjectionMatrix();
	}

	function resize(w, h) {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	resize(window.innerWidth, window.innerHeight);

	function render() {
		const u = time.u;
		depths(u);
		placeFlats();
		setCamera(u);
		renderer.render(scene, camera);
		// The board over the page: clear, so the set shows, but for the tag.
		const { ctx, dpr, w, h } = b;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, b.canvas.width, b.canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		tag(ctx, w, h, `log-stage · ${v} · ${decade}`);
	}

	return {
		info: { seconds, variant: v, decade },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize
	};
}
