<script>
	import * as THREE from 'three';

	export let scene;
	export let basis;
	export let axis;
	export let direction;
	export let baseOpacity = 0.5;

	let group;
	let materials = [];

	function localToWorld(u, v) {
		return basis.center.clone()
			.add(basis.uAxis.clone().multiplyScalar(u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function addLine(points, opacity) {
		const geo = new THREE.BufferGeometry().setFromPoints(points);
		const mat = new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0 });
		materials.push({ mat, baseOpacity: opacity });
		group.add(new THREE.LineSegments(geo, mat));
	}

	function create() {
		if (!basis || !scene) return;
		group = new THREE.Group();
		materials = [];

		const halfU = basis.uLen / 2;
		const halfV = basis.vLen / 2;
		const S = Math.min(basis.uLen, basis.vLen);
		const uIsShort = basis.uLen <= basis.vLen;
		const dimOffset = S * 0.25;

		const corners = [
			localToWorld(-halfU, -halfV), localToWorld(halfU, -halfV),
			localToWorld(halfU, halfV), localToWorld(-halfU, halfV)
		];

		addLine([corners[0], corners[1], corners[1], corners[2], corners[2], corners[3], corners[3], corners[0]], 0.5);

		if (uIsShort) {
			addLine([localToWorld(-halfU, -halfV + S), localToWorld(halfU, -halfV + S)], 0.3);
		} else {
			addLine([localToWorld(-halfU + S, -halfV), localToWorld(-halfU + S, halfV)], 0.3);
		}

		if (uIsShort) {
			addLine([localToWorld(-halfU, -halfV - dimOffset), localToWorld(halfU, -halfV - dimOffset)], 0.35);
			addLine([localToWorld(halfU + dimOffset, -halfV), localToWorld(halfU + dimOffset, halfV)], 0.35);
		} else {
			addLine([localToWorld(-halfU - dimOffset, -halfV), localToWorld(-halfU - dimOffset, halfV)], 0.35);
			addLine([localToWorld(-halfU, -halfV - dimOffset), localToWorld(halfU, -halfV - dimOffset)], 0.35);
		}

		scene.add(group);
	}

	export function init() { create(); }

	export function updateProjection(proj, schematicDist) {
		if (!group) return;
		group.position.copy(axis.clone().multiplyScalar(schematicDist * direction));
		const o = proj * baseOpacity;
		materials.forEach(({ mat, baseOpacity: lo }) => { mat.opacity = o * lo; });
	}

	export function dispose() {
		if (!group) return;
		scene.remove(group);
		group.traverse(obj => {
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) obj.material.dispose();
		});
		group = null;
		materials = [];
	}
</script>
