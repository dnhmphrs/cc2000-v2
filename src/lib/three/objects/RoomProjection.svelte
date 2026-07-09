<script>
	import * as THREE from 'three';
	import { LAYERS, elementUrl } from '$lib/data/roomElements';

	// Lives in the same worldGroup as everything else so it rotates together.
	export let group;
	export let basis;          // { center, uAxis, vAxis, uLen, vLen } — center is the origin
	export let axis;           // rectangle normal (unit)
	export let direction;      // +1 / -1, which way the pane projects out
	export let decadeKey;
	export let portrait = false;
	export let maxDepth = 1.5; // how far (world units) the back wall sits behind the frame
	export let paneReach = 3.14; // matches GoldenRectangle paneDist at projection = 1
	export let renderer = null; // used to pre-upload textures (avoids a transition stall)

	let roomGroup;
	let layers = [];           // { mesh, mat, cfg, aspect }
	let dimFactor = 1;
	let lastProjection = 0;

	const normal = () => axis.clone().multiplyScalar(direction).normalize();

	// Decide which face edge is horizontal (room-right) vs vertical (room-up).
	// Landscape → long edge horizontal (wide room). Portrait → long edge vertical.
	function frame() {
		const n = normal();
		let right, up, W, H;
		if (portrait) {
			right = basis.uAxis.clone(); W = basis.uLen; // short edge across
			up    = basis.vAxis.clone(); H = basis.vLen; // long edge up
		} else {
			right = basis.vAxis.clone(); W = basis.vLen; // long edge across
			up    = basis.uAxis.clone(); H = basis.uLen; // short edge up
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
				tex.encoding = THREE.sRGBEncoding;
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
				if (renderer) { try { renderer.initTexture(tex); } catch (e) { /* ignore */ } }
			});
		});
	}

	// Size + orient + place one layer within the current frame.
	function layout(entry) {
		const { cfg, aspect } = entry;
		const { right, up, n, W, H } = frame();

		let w, h;
		if (cfg.cover) {
			// cover the whole frame
			if (W / H > aspect) { w = W; h = W / aspect; }
			else { h = H; w = H * aspect; }
		} else {
			w = cfg.width * W;
			h = w / aspect;
		}
		entry.mesh.scale.set(w, h, 1);

		// Orient the plane so local X→right, Y→up, +Z→normal.
		const m = new THREE.Matrix4().makeBasis(right, up, n);
		entry.mesh.quaternion.setFromRotationMatrix(m);

		entry.inPlane = right.clone().multiplyScalar((cfg.x || 0) * W / 2)
			.add(up.clone().multiplyScalar((cfg.y || 0) * H / 2));
	}

	function apply(projection) {
		lastProjection = projection;
		if (!roomGroup) return;
		const n = normal();

		// Fade the room in as it projects out (keeps the collapsed centre uncluttered).
		const reveal = smoothstep(0.04, 0.55, projection);
		const eff = reveal * dimFactor;
		const visible = eff > 0.01;

		// Ride outward with the pane.
		roomGroup.position.copy(n.clone().multiplyScalar(projection * paneReach));

		layers.forEach((entry) => {
			const back = n.clone().multiplyScalar(-entry.cfg.depth * maxDepth * projection);
			const pos = basis.center.clone().add(entry.inPlane || new THREE.Vector3()).add(back);
			entry.mesh.position.copy(pos);
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

	function smoothstep(a, b, x) {
		const t = Math.max(0, Math.min((x - a) / (b - a), 1));
		return t * t * (3 - 2 * t);
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
		dimFactor = f;
		apply(lastProjection);
	}

	// World-space frame data for the camera zoom (after the group's transform).
	export function focusTarget() {
		const { up, n, H, W } = frame();
		const q = group.quaternion;
		const centerWorld = basis.center.clone()
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
