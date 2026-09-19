import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { holoMaterial } from '$lib/three/tsl/materials';
import { TUNNEL, HOLO } from '$lib/config';

// ── The swimmer, for the lab ─────────────────────────────────────────────────
// static/sperm.glb, loaded and normalised exactly as world/tunnel.js does it —
// centred on its own bounding box, sized on its CROSS-SECTION height (the body
// points down −z and its length is the one axis that is all foreshortened),
// stretched ×2 along its own axis, and worn by the hologram material — but on
// the TSL port of that material, so it renders on the WebGPU renderer.
//
// `height` is the body's cross-section height in world units. Scale the group
// to size it after that; spin(turns) rolls it about its own axis, which is the
// axis you look down when it rides ahead of the lens.
export async function loadSwimmer({
	height = 1,
	fog = 0x000000,
	fogDensity = 0,
	ink = HOLO.body,
	accent = HOLO.rim,
	gain = TUNNEL.spermGain
} = {}) {
	const material = holoMaterial({
		ink,
		accent,
		fog,
		fogDensity,
		rings: TUNNEL.spermRings,
		longs: TUNNEL.spermLongs,
		gain
	});
	material.uniforms.uOpacity.value = 1;

	const group = new THREE.Group();
	const spinner = new THREE.Group();
	group.add(spinner);

	const glb = await new GLTFLoader().loadAsync('/sperm.glb');
	const model = glb.scene.children[0] ?? glb.scene;
	// Head down −z, away from the camera, which is the way it swims.
	model.rotation.x += Math.PI;
	model.traverse((child) => {
		if (child.material) child.material = material;
	});
	// The contour set is drawn in GEOMETRY space: the body's own long axis and
	// midpoint there, from the mesh's bounding box before any transform.
	model.traverse((child) => {
		if (!child.isMesh) return;
		child.geometry.computeBoundingBox();
		const gb = child.geometry.boundingBox;
		const gs = gb.getSize(new THREE.Vector3());
		const axis = gs.x > gs.y && gs.x > gs.z ? 'x' : gs.y > gs.z ? 'y' : 'z';
		const A = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
		const rest = ['x', 'y', 'z'].filter((k) => k !== axis);
		material.uniforms.uAxis.value.set(...A[axis]);
		material.uniforms.uSide.value.set(...A[rest[0]]);
		material.uniforms.uUp.value.set(...A[rest[1]]);
		material.uniforms.uCentre.value.copy(gb.getCenter(new THREE.Vector3()));
	});

	const inner = new THREE.Group();
	inner.add(model);
	inner.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(model);
	const size = box.getSize(new THREE.Vector3());
	model.position.sub(box.getCenter(new THREE.Vector3()));
	const k = height / size.y;
	inner.scale.set(k, k, k * TUNNEL.spermStretch);
	// The wobble: a fraction of the body's own width, off the spin axis.
	inner.position.set(TUNNEL.spermOffset.x * height, TUNNEL.spermOffset.y * height, 0);
	spinner.add(inner);

	return {
		group,
		spinner,
		material,
		// Roll about the swim axis; `turns` is a pure function of progress.
		spin(turns) {
			spinner.rotation.z = turns * Math.PI * 2;
		}
	};
}
