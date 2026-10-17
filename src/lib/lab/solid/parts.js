// ── The solid kit: what a room is built from ─────────────────────────────────
// Boxes, cylinders, cones and slabs in the drawing's flat colours, every face
// shaded by a vertical gradient and a touch of light BAKED into its vertex
// colours — there are no lights in the scene; the colours are the shading, as
// in a perspective study — with a thin white edge line on every part and, on
// the big ones, construction lines: the part's box edges run out long through
// the whole room, drawn over everything. Every part carries a name, its home
// transform and an explode vector, so a loop can take the room apart along
// its own construction and put it back.
//
// The room's units are the site's frame: the frame plane is z = 0, the open
// front; the back wall is z = −DEPTH; the floor's top is y = −1 and the
// ceiling's underside y = +1; x runs −W/2 … W/2 across the frame. Every object
// is modelled IN ROOM COORDINATES (`LAYOUT` says where each one stands), so a
// builder returns a group whose parts are already in place.
//
//   kit(THREE) → { box, cyl, cone, tube, wedge, plane, picture, solid, paint,
//                  edges, rays, part, group, tex, crop, lineMat, PAL, LAYOUT }
//   kit(THREE, { ink: true }) is the same room drawn as a SKETCH: the
//   blackboard's own look — every face the board's dark ground, a whisper
//   lighter toward the light so the volumes read, no colour, no textures,
//   the edge lines and the construction lines in chalk — a hidden-line
//   drawing of the model, for the flows, until the final 2D image is settled.

import { PHI } from '../log/board.js';

export const W = 2 * PHI; // the frame, a golden rectangle: 3.236 across
export const H = 2; //                                      2 high
export const DEPTH = 3; // the back wall is this far behind the frame plane
export const SX = W / 2 + 0.35; // the slabs run a little wider than the frame

// The drawing's own colours, read off the 90s room's PNGs.
export const PAL = {
	ground: 0x1f4fd0, // the blue the room stands on
	line: 0xffffff,
	board: 0x151515, // the blackboard's ground (board.js PAL.ground), for the ink room
	face: 0x1b1b1b, // a face of the ink room, before the light's whisper
	chalk: 0xece6da, // the chalk the ink room is drawn in (board.js PAL.chalk)
	wall: 0xd8c894,
	wallDark: 0xb9a062,
	floor: 0xc9a86a,
	floorDark: 0x9f8150,
	plank: 0x8a6b3a,
	ceiling: 0xc9a86a,
	orange: 0xe8761f,
	orangeDark: 0x7e2410,
	wood: 0xac8f4f,
	woodDark: 0x6f5a33,
	handle: 0x857447,
	red: 0xc64b49,
	redDark: 0x8f2523,
	bulb: 0xe7e9f2,
	grey: 0x7b7989,
	greyDark: 0x58566a,
	greyDeep: 0x3b3949,
	black: 0x0a0a0c,
	bedLight: 0x9db6db,
	bed: 0x7e9bcb,
	bedDark: 0x414f87,
	mattress: 0xe9e6dc,
	pillow: 0xf3f1ea,
	olive: 0xb0bea5,
	pink: 0xd081ab,
	plum: 0x6c606a,
	lime: 0xddeb9d,
	clockFace: 0xe3e8f4,
	clockRim: 0xc74c4a,
	ink: 0x12110f,
	frame: 0x7d7947,
	sun: 0xc66974,
	sunDark: 0xa2484f,
	cream: 0xf1e9d2
};

// Where everything stands, in room units — read off the drawing from its eye
// point (the composite the site shows), so that from the eye the model lines
// up with the picture. x: left … right; y: floor −1 … ceiling 1; z: the frame
// 0 … the wall −3. Each entry is the object's box: its footprint and height.
export const LAYOUT = {
	floor: { y: -1, thick: 0.1 },
	ceiling: { y: 1, thick: 0.22 },
	wall: { z: -DEPTH, thick: 0.08 },
	// A long desk across the room, its top a hand above the bed's blanket;
	// two drawer pedestals, left and right, the kneehole between.
	desk: {
		x: [-1.48, 1.58],
		top: -0.42,
		thick: 0.06,
		z: [-2.2, -1.4],
		left: [-1.42, -0.91],
		right: [0.81, 1.35]
	},
	// The red anglepoise on the desk's left, reaching up to the bottom of the
	// posters.
	lamp: { x: -0.74, z: -1.56, base: -0.42, height: 0.75 },
	// The monitor on the desk, the keyboard in front of it, the tower at its
	// right, the mouse by the tower: all on the desk top.
	computer: {
		monitor: { x: [-0.44, 0.21], z: [-2.2, -1.72], y: [-0.42, 0.29] },
		keyboard: { x: [-0.45, 0.18], z: [-1.66, -1.46], y: [-0.42, -0.37] },
		tower: { x: [0.27, 0.6], z: [-2.2, -1.7], y: [-0.42, 0.36] },
		mouse: { x: 0.33, z: -1.56 }
	},
	// The bed across the right of the room's front, running back along the
	// right-hand side, its blanket up to half a unit above the floor.
	bed: { x: [-0.3, 1.62], z: [-1.38, -0.25], top: -0.5, frame: -0.8 },
	// On the wall: the clock over the monitor, the two taped posters at the
	// left, the Rad poster with the small smiley at the right.
	art: {
		clock: { x: -0.28, y: 0.74, r: 0.185 },
		pinkPoster: { x: [-1.085, -0.658], y: [0.34, 0.88] },
		sunPoster: { x: [-1.262, -0.96], y: [0.2, 0.55] },
		radPoster: { x: [0.23, 1.01], y: [0.03, 0.81] }
	}
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;

export function kit(THREE, { ink = false } = {}) {
	const col = (c) => (c instanceof THREE.Color ? c : new THREE.Color(c));
	const FACE = col(PAL.face);
	// The light the tint comes from: high, a little left, in front.
	const L = new THREE.Vector3(-0.4, 0.85, 0.55).normalize();
	const loader = new THREE.TextureLoader();

	// Bake the colours into the geometry: a gradient from `bottom` to `top`
	// along `axis` (the part's own extent, or lo…hi), a face looking up or
	// down taking `up` / `down` instead if given, and a tint by the light.
	function paint(geo, o = {}) {
		const ct = col(o.top ?? o.color ?? 0xffffff);
		const cb = col(o.bottom ?? o.color ?? ct);
		const cu = o.up !== undefined ? col(o.up) : null;
		const cd = o.down !== undefined ? col(o.down) : null;
		const tint = o.tint ?? 0.18;
		const a = o.axis === 'x' ? 0 : o.axis === 'z' ? 2 : 1;
		geo.computeBoundingBox();
		const min = o.lo ?? geo.boundingBox.min.getComponent(a);
		const max = o.hi ?? geo.boundingBox.max.getComponent(a);
		const pos = geo.attributes.position;
		const nrm = geo.attributes.normal;
		const out = new Float32Array(pos.count * 3);
		const n = new THREE.Vector3();
		for (let i = 0; i < pos.count; i++) {
			n.fromBufferAttribute(nrm, i);
			const t = max > min ? clamp01((pos.getComponent(i, a) - min) / (max - min)) : 1;
			let r, g, b;
			if (cu && n.y > 0.7) ({ r, g, b } = cu);
			else if (cd && n.y < -0.7) ({ r, g, b } = cd);
			else {
				r = lerp(cb.r, ct.r, t);
				g = lerp(cb.g, ct.g, t);
				b = lerp(cb.b, ct.b, t);
			}
			let k = 1 - tint * (1 - (n.dot(L) + 1) / 2);
			if (ink) {
				// The sketch: every face the board's dark, lighter toward the light.
				({ r, g, b } = FACE);
				k = 0.8 + 0.5 * ((n.dot(L) + 1) / 2);
			}
			out[3 * i] = r * k;
			out[3 * i + 1] = g * k;
			out[3 * i + 2] = b * k;
		}
		geo.setAttribute('color', new THREE.BufferAttribute(out, 3));
		return geo;
	}

	const mat = (o = {}) =>
		new THREE.MeshBasicMaterial({
			vertexColors: true,
			map: ink ? null : (o.map ?? null),
			transparent: (o.opacity ?? 1) < 1 || !!o.transparent,
			opacity: o.opacity ?? 1,
			side: o.side ?? THREE.FrontSide,
			// Faces sit a hair behind their own edge lines.
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
		});

	function lineMat(opacity, depth = true) {
		return new THREE.LineBasicMaterial({
			color: ink ? PAL.chalk : PAL.line,
			transparent: true,
			opacity: ink ? Math.min(0.92, opacity * (depth ? 1.4 : 0.9)) : opacity,
			depthTest: depth,
			depthWrite: false
		});
	}

	// The white edge lines of a part, where its faces meet at more than
	// `threshold` degrees (a cylinder gets its rims, a box all twelve).
	function edges(mesh, opacity = 0.55, threshold = 20) {
		const g = new THREE.EdgesGeometry(mesh.geometry, threshold);
		const l = new THREE.LineSegments(g, lineMat(opacity, true));
		l.userData.edge = true;
		mesh.add(l);
		return l;
	}

	// Construction lines: the twelve edges of the part's box run out `length`
	// past each end, drawn over everything.
	function rays(obj, { length = 6, opacity = 0.14 } = {}) {
		const bb = new THREE.Box3();
		if (obj.geometry) {
			obj.geometry.computeBoundingBox();
			bb.copy(obj.geometry.boundingBox);
		} else bb.setFromObject(obj);
		const { min, max } = bb;
		const P = (x, y, z) => [x, y, z];
		const c = [
			P(min.x, min.y, min.z),
			P(max.x, min.y, min.z),
			P(max.x, max.y, min.z),
			P(min.x, max.y, min.z),
			P(min.x, min.y, max.z),
			P(max.x, min.y, max.z),
			P(max.x, max.y, max.z),
			P(min.x, max.y, max.z)
		];
		const E = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7]
		];
		const arr = [];
		for (const [i, j] of E) {
			const p = c[i];
			const q = c[j];
			const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
			const n = Math.hypot(...d) || 1;
			const u = d.map((x) => (x / n) * length);
			arr.push(p[0] - u[0], p[1] - u[1], p[2] - u[2], q[0] + u[0], q[1] + u[1], q[2] + u[2]);
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
		const l = new THREE.LineSegments(g, lineMat(opacity, false));
		l.userData.ray = true;
		obj.add(l);
		return l;
	}

	function solid(geo, o = {}) {
		paint(geo, o);
		const m = new THREE.Mesh(geo, mat(o));
		if (o.edges !== false) edges(m, o.edgeOpacity ?? 0.55, o.threshold ?? 20);
		return m;
	}

	// A box w across, h high, d deep, standing on its origin (its bottom at
	// y = 0) unless `origin: 'center'`.
	function box(w, h, d, o = {}) {
		const g = new THREE.BoxGeometry(w, h, d);
		if (o.origin !== 'center') g.translate(0, h / 2, 0);
		return solid(g, o);
	}

	// A cylinder, standing on its origin; rTop may differ from rBottom (a
	// lampshade is a cylinder with a small top).
	function cyl(rTop, rBottom, h, o = {}) {
		const g = new THREE.CylinderGeometry(rTop, rBottom, h, o.seg ?? 24, 1, !!o.open);
		if (o.origin !== 'center') g.translate(0, h / 2, 0);
		return solid(g, { threshold: 40, ...o });
	}

	const cone = (r, h, o = {}) => cyl(0.0001, r, h, o);

	// A rod from point a to point b, radius r.
	function tube(a, b, r, o = {}) {
		const A = new THREE.Vector3(...a);
		const B = new THREE.Vector3(...b);
		const d = B.clone().sub(A);
		const h = d.length();
		const m = cyl(r, r, h, { ...o, origin: 'center', seg: o.seg ?? 12 });
		m.position.copy(A).addScaledVector(d, 0.5);
		m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
		return m;
	}

	// A box whose top slopes: h at the back (−z), h2 at the front (+z) — a
	// keyboard, a sloped desk.
	function wedge(w, h, h2, d, o = {}) {
		const g = new THREE.BoxGeometry(w, h, d);
		g.translate(0, h / 2, 0);
		const p = g.attributes.position;
		for (let i = 0; i < p.count; i++) if (p.getY(i) > h / 2 && p.getZ(i) > 0) p.setY(i, h2);
		g.computeVertexNormals();
		return solid(g, o);
	}

	// A flat, w × h in the xy plane, facing +z.
	function plane(w, h, o = {}) {
		const g = new THREE.PlaneGeometry(w, h);
		return solid(g, { edges: false, ...o });
	}

	// A picture: a thin slab with the drawing on its face (the map cropped to
	// the face), a flat colour on its sides and back. The face is drawn in the
	// map's own colours (painted white), the slab in `color`.
	function picture(w, h, map, o = {}) {
		const g = new THREE.Group();
		const t = o.thick ?? 0.025;
		const body = box(w, h, t, { color: o.color ?? PAL.cream, origin: 'center', tint: 0.25 });
		body.position.z = -t / 2;
		const face = plane(w, h, { color: 0xffffff, tint: 0, map, transparent: !!o.transparent });
		face.position.z = 0.001;
		g.add(body, face);
		return g;
	}

	// Mark an object as a part: its name, its home transform, where it goes
	// when the room explodes (room units, in its parent's frame).
	function part(obj, name, explode = [0, 0, 0]) {
		obj.name = name;
		obj.userData.part = {
			name,
			explode: [...explode],
			home: obj.position.clone()
		};
		return obj;
	}

	function group(...children) {
		const g = new THREE.Group();
		for (const c of children) g.add(c);
		return g;
	}

	async function tex(url) {
		const t = await loader.loadAsync(url);
		t.colorSpace = THREE.SRGBColorSpace;
		t.generateMipmaps = true;
		t.minFilter = THREE.LinearMipmapLinearFilter;
		t.magFilter = THREE.LinearFilter;
		t.anisotropy = 4;
		return t;
	}

	// A sub-rectangle of a texture, u0…u1 across and v0…v1 up (v from the
	// bottom of the image).
	function crop(t, u0, v0, u1, v1) {
		const c = t.clone();
		c.repeat.set(u1 - u0, v1 - v0);
		c.offset.set(u0, v0);
		c.needsUpdate = true;
		return c;
	}

	return {
		THREE,
		ink,
		PAL,
		LAYOUT,
		W,
		H,
		DEPTH,
		SX,
		paint,
		solid,
		box,
		cyl,
		cone,
		tube,
		wedge,
		plane,
		picture,
		edges,
		rays,
		part,
		group,
		tex,
		crop,
		lineMat
	};
}

// Put every part at home plus k times its explode vector.
export function explode(root, k) {
	root.traverse((o) => {
		const p = o.userData.part;
		if (!p) return;
		o.position.set(
			p.home.x + k * p.explode[0],
			p.home.y + k * p.explode[1],
			p.home.z + k * p.explode[2]
		);
	});
}
