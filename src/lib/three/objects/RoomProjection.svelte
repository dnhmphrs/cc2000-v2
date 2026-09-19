<script>
	import * as THREE from 'three';
	import { LAYERS, placement, elementUrl } from '$lib/data/roomElements';
	import { SCREEN_GLASS, GLASS_SAFETY } from '$lib/config';

	// Lives in the same worldGroup as everything else so it rotates together.
	export let group;
	export let basis; // { center, uAxis, vAxis, uLen, vLen } — center is the origin
	export let axis; // rectangle normal (unit)
	export let direction; // +1 / -1, which way the pane projects out
	export let decadeKey;
	export let portrait = false;
	export let maxDepth = 1.5; // how far (world units) the back wall sits behind the frame
	export let paneReach = 3.14; // matches GoldenRectangle paneDist at projection = 1
	export let renderer = null; // used to pre-upload textures (avoids a transition stall)

	let roomGroup;
	let layers = []; // { mesh, mat, cfg, aspect, w, h }
	let dimFactor = 1;
	let lastProjection = 0;
	let zoomK = 0; // 0..1 final-zoom progress; scales layers by depth for parallax
	// Where the head is, -1..1 in each axis, for the desk parallax. See setHead().
	let headU = 0;
	let headV = 0;
	// How far up the artwork is. NOT derived from the projection: the computation
	// brings the drafting out first and then fades the rooms up through it, which
	// is two beats, and deriving both from one number collapses them into one.
	let reveal = 0;

	const normal = () => axis.clone().multiplyScalar(direction).normalize();

	// Decide which face edge is horizontal (room-right) vs vertical (room-up).
	// Landscape → long edge horizontal (wide room). Portrait → long edge vertical.
	function frame() {
		const n = normal();
		let right, up, W, H;
		if (portrait) {
			right = basis.uAxis.clone();
			W = basis.uLen; // short edge across
			up = basis.vAxis.clone();
			H = basis.vLen; // long edge up
		} else {
			right = basis.vAxis.clone();
			W = basis.vLen; // long edge across
			up = basis.uAxis.clone();
			H = basis.uLen; // short edge up
		}
		right.normalize();
		up.normalize();
		// Keep the plane facing outward (right × up should point along the normal).
		if (right.clone().cross(up).dot(n) < 0) right.multiplyScalar(-1);
		return { n, right, up, W, H };
	}

	function build() {
		roomGroup = new THREE.Group();
		group.add(roomGroup);
		layers = [];

		const loader = new THREE.TextureLoader();
		LAYERS.forEach((cfg) => {
			// Opaque + alphaTest: hard cutout that writes depth, so layers occlude
			// each other, the neighbouring rooms and the icosahedron correctly.
			const mat = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				alphaTest: 0.5,
				transparent: false,
				depthTest: true,
				depthWrite: true
			});
			const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
			mesh.renderOrder = Math.round((1 - cfg.depth) * 20); // front layers draw later
			mesh.visible = false;
			roomGroup.add(mesh);

			const entry = { mesh, mat, cfg, aspect: 1 };
			layers.push(entry);

			loader.load(elementUrl(decadeKey, cfg.key), (tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				// These are large non-power-of-two images: skip mipmaps (and the
				// costly POT resize) and pre-upload now, during the idle intro, so
				// nothing stalls the main thread when the rooms first render.
				tex.generateMipmaps = false;
				tex.minFilter = THREE.LinearFilter;
				tex.magFilter = THREE.LinearFilter;
				mat.map = tex;
				mat.needsUpdate = true;
				entry.aspect = (tex.image?.width || 1) / (tex.image?.height || 1);
				layout(entry);
				apply(lastProjection);
				if (renderer) {
					try {
						renderer.initTexture(tex);
					} catch {
						/* ignore */
					}
				}
			});
		});
	}

	// Size + orient + place one layer within the current frame.
	function layout(entry) {
		const { cfg, aspect } = entry;
		const { right, up, n, W, H } = frame();
		// Portrait re-places elements to fill the tall frame, and each decade may
		// override the shared placement — see roomElements.placement().
		const pos = placement(cfg, decadeKey, portrait);

		let w, h;
		if (cfg.cover) {
			// cover the whole frame
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
		entry.w = w;
		entry.h = h;
		entry.mesh.scale.set(w, h, 1);

		// Orient the plane so local X→right, Y→up, +Z→normal.
		const m = new THREE.Matrix4().makeBasis(right, up, n);
		entry.mesh.quaternion.setFromRotationMatrix(m);

		entry.inPlane = right
			.clone()
			.multiplyScalar(((pos.x || 0) * W) / 2)
			.add(up.clone().multiplyScalar(((pos.y || 0) * H) / 2));
	}

	function apply(projection) {
		lastProjection = projection;
		if (!roomGroup) return;
		const f = frame();
		const n = f.n;

		const eff = reveal * dimFactor;
		const visible = eff > 0.01;

		// Ride outward with the pane.
		roomGroup.position.copy(n.clone().multiplyScalar(projection * paneReach));

		// ── THE DESK PARALLAX ────────────────────────────────────────────────
		// The BACK of the room drifts and the front of it does not, weighted by
		// each layer's own depth. That is the wrong way round for a camera and the
		// right way round for an eye: sitting at a desk you fixate the monitor, so
		// its retinal motion is nulled and what you see move is the wall behind
		// it — in the same direction your head went, by the difference of the two
		// reciprocal distances.
		//
		// Trucking the camera instead, which is what this used to do, gives the
		// exact opposite: the NEAREST things swing hardest, so the bed and the desk
		// slide about in front of a wall that barely moves. Six flat layers doing
		// that is the wobble, and no amount of turning it down fixes the direction.
		const drift = f.right
			.clone()
			.multiplyScalar(headU * HEAD_SHIFT)
			.add(f.up.clone().multiplyScalar(headV * HEAD_SHIFT));

		layers.forEach((entry) => {
			const back = n.clone().multiplyScalar(-entry.cfg.depth * maxDepth * projection);
			const pos = basis.center
				.clone()
				.add(entry.inPlane || new THREE.Vector3())
				.add(back)
				.add(drift.clone().multiplyScalar(entry.cfg.depth * projection));
			entry.mesh.position.copy(pos);
			// Depth parallax on the final zoom: nearer layers surge forward far more
			// than the back wall, so you feel the bed rush past first, then the desk,
			// then the screen — a real dolly-in with impact.
			if (entry.w != null) {
				const near = 1 - entry.cfg.depth; // 1 = frontmost, 0 = back wall
				const zf = 1 + zoomK * 1.0 * near * near;
				entry.mesh.scale.set(entry.w * zf, entry.h * zf, 1);
			}
			entry.mesh.visible = visible && entry.mat.map != null;
			// While fading (reveal-in or zoom-dim) use blended alpha; once fully
			// present, switch to the crisp depth-writing cutout for correct occlusion.
			// Toggling alphaTest recompiles the shader, so only flip on real changes.
			const blended = eff < 0.999;
			if (blended !== entry.blended) {
				entry.blended = blended;
				entry.mat.transparent = blended;
				entry.mat.depthWrite = !blended;
				entry.mat.alphaTest = blended ? 0 : 0.5;
				entry.mat.needsUpdate = true;
			}
			entry.mat.opacity = blended ? eff : 1;
		});
	}

	export function init() {
		build();
		apply(0);
	}

	export function updateProjection(projection) {
		apply(projection);
	}

	export function setPortrait(p) {
		if (p === portrait) return;
		portrait = p;
		layers.forEach(layout);
		apply(lastProjection);
	}

	export function setDim(f) {
		if (f === dimFactor) return;
		dimFactor = f;
		apply(lastProjection);
	}

	// 0..1 — how far up this room's artwork is, driven by the computation.
	export function setReveal(v) {
		if (v === reveal) return;
		reveal = v;
		apply(lastProjection);
	}

	// Where the head is, each -1..1. Only the room's own depth answers it; see the
	// drift in apply(). It is a fraction of the pane's own size, so it holds at
	// any framing.
	const HEAD_SHIFT = 0.042;

	export function setHead(u, v) {
		if (u === headU && v === headV) return;
		headU = u;
		headV = v;
		apply(lastProjection);
	}

	// 0..1 progress of the final fill-zoom; drives per-layer depth parallax.
	export function setZoomProgress(k) {
		zoomK = k;
		apply(lastProjection);
	}

	// Where this room's monitor glass lands on screen, in CSS pixels, given the
	// camera that is currently looking at it. The glass is a sub-rectangle of the
	// 'screen' artwork (the PNG is a whole TV, bezel and all), so its four corners
	// are taken in the mesh's own unit-plane space, pushed through the full world
	// transform, and projected. Returns null if the screen isn't loaded yet.
	export function screenRect(camera, vw, vh) {
		const entry = layers.find((l) => l.cfg.key === 'screen');
		if (!entry || !entry.mesh || !entry.mat.map) return null;
		const glass = SCREEN_GLASS[decadeKey] || SCREEN_GLASS['90s'];

		// PlaneGeometry(1,1) scaled to (w, h): local ±0.5 are its edges, +y is up
		// while image y runs down, hence the flip on cy.
		// Pulled in a little from the measured rect. The glass edges are drawn, not
		// crisp, and a few percent of overhang puts the panel onto the casing —
		// far more noticeable than a slightly small panel. config/layout.js.
		const SAFETY = GLASS_SAFETY;
		const lx = glass.cx - 0.5;
		const ly = 0.5 - glass.cy;
		const hw = (glass.w * SAFETY) / 2;
		const hh = (glass.h * SAFETY) / 2;

		entry.mesh.updateWorldMatrix(true, false);
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
			const v = entry.mesh.localToWorld(new THREE.Vector3(lx + sx, ly + sy, 0));
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

	// How big this room's monitor glass actually is, in WORLD units. The way home
	// frames on the glass, and predicting that framing from the glass's current
	// on-screen size does not work on a lens: the glass hangs in front of the
	// plane the camera is focused at, so it magnifies faster than the frustum
	// does and the flight overshoots. Given its real size the sum is exact.
	export function glassExtent() {
		const entry = layers.find((l) => l.cfg.key === 'screen');
		if (!entry || entry.w == null || !entry.mat.map) return null;
		const glass = SCREEN_GLASS[decadeKey] || SCREEN_GLASS['90s'];
		return { w: entry.w * glass.w * GLASS_SAFETY, h: entry.h * glass.h * GLASS_SAFETY };
	}

	// World-space centre of this room's monitor glass — where the camera aims on
	// the way home. The same sub-rectangle screenRect() measures, but left in the
	// world instead of projected.
	export function glassCentre() {
		const entry = layers.find((l) => l.cfg.key === 'screen');
		if (!entry || !entry.mesh || !entry.mat.map) return null;
		const glass = SCREEN_GLASS[decadeKey] || SCREEN_GLASS['90s'];
		entry.mesh.updateWorldMatrix(true, false);
		return entry.mesh.localToWorld(new THREE.Vector3(glass.cx - 0.5, 0.5 - glass.cy, 0));
	}

	// How big the room's own BACK WALL actually is, in world units. It is a
	// `cover` layer, so it is scaled to cover the pane's frame and overflows on
	// one axis — which means it is bigger than the rectangle in at least one
	// direction, and the landing zoom can and should use that extra. Fitting the
	// RECTANGLE instead is what left a black margin round the room.
	export function coverExtent() {
		const bg = layers.find((l) => l.cfg.cover);
		if (!bg || bg.w == null) return null;
		return { w: bg.w, h: bg.h };
	}

	// Local-space (pre-group-transform) orthonormal frame of this room's plane —
	// used to compute the group orientation that lands this room facing camera.
	export function localFrame() {
		const { right, up, n, W, H } = frame();
		return { right: right.clone(), up: up.clone(), normal: n.clone(), W, H };
	}

	// World-space frame data for the camera zoom (after the group's transform).
	export function focusTarget() {
		const { up, n, H, W } = frame();
		const q = group.quaternion;
		const centerWorld = basis.center
			.clone()
			.add(n.clone().multiplyScalar(lastProjection * paneReach))
			.applyQuaternion(q);
		return {
			center: centerWorld,
			normal: n.clone().applyQuaternion(q),
			up: up.clone().applyQuaternion(q),
			height: H,
			width: W,
			depth: maxDepth * lastProjection
		};
	}

	export function dispose() {
		if (!roomGroup) return;
		group.remove(roomGroup);
		roomGroup.traverse((o) => {
			if (o.geometry) o.geometry.dispose();
			if (o.material) {
				if (o.material.map) o.material.map.dispose();
				o.material.dispose();
			}
		});
		roomGroup = null;
		layers = [];
	}
</script>
