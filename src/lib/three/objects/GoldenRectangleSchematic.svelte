<script>
	import * as THREE from 'three';

	export let scene;
	export let basis;
	export let axis;
	export let direction;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let group;
	let initialized = false;

	function localToWorld(u, v) {
		return basis.center.clone()
			.add(basis.uAxis.clone().multiplyScalar(u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function createDimLine(start, end, offsetDir, dimOffset = 0.4) {
		const dim = new THREE.Group();
		const offsetVec = offsetDir.clone().multiplyScalar(dimOffset);
		
		const s = start.clone().add(offsetVec);
		const e = end.clone().add(offsetVec);
		
		dim.add(new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([s, e]),
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
		));
		
		const tickLen = 0.1;
		const lineDir = new THREE.Vector3().subVectors(end, start).normalize();
		[s, e].forEach(p => {
			dim.add(new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([
					p.clone().add(lineDir.clone().multiplyScalar(-tickLen)),
					p.clone().add(lineDir.clone().multiplyScalar(tickLen))
				]),
				new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
			));
		});
		
		[start, end].forEach((p, i) => {
			const extLine = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([p, [s, e][i]]),
				new THREE.LineDashedMaterial({ 
					color: 0xffffff, 
					transparent: true, 
					opacity: 0.2,
					dashSize: 0.04,
					gapSize: 0.02
				})
			);
			extLine.computeLineDistances();
			dim.add(extLine);
		});
		
		return dim;
	}

	function create() {
		if (!basis || !scene) return;
		
		group = new THREE.Group();
		
		const halfU = basis.uLen / 2;
		const halfV = basis.vLen / 2;
		const dimOffset = 0.4;
		
		// Rectangle outline
		const corners = [
			localToWorld(-halfU, -halfV),
			localToWorld(halfU, -halfV),
			localToWorld(halfU, halfV),
			localToWorld(-halfU, halfV)
		];

		const outlineGeo = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1],
			corners[1], corners[2],
			corners[2], corners[3],
			corners[3], corners[0]
		]);
		group.add(new THREE.LineSegments(
			outlineGeo,
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
		));

		// Short side dimension
		group.add(createDimLine(
			corners[0], 
			corners[1], 
			basis.vAxis.clone().multiplyScalar(-1)
		));
		
		// Long side dimension
		group.add(createDimLine(
			corners[1], 
			corners[2], 
			basis.uAxis
		));

		// Diagonal
		const diagLine = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([corners[0], corners[2]]),
			new THREE.LineDashedMaterial({ 
				color: 0xffffff, 
				transparent: true, 
				opacity: 0.3,
				dashSize: 0.1,
				gapSize: 0.05
			})
		);
		diagLine.computeLineDistances();
		group.add(diagLine);

		// φ division line
		const phiDivStart = localToWorld(-halfU, -halfV + basis.uLen);
		const phiDivEnd = localToWorld(halfU, -halfV + basis.uLen);
		group.add(new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([phiDivStart, phiDivEnd]),
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
		));

		// Ratio bar: 1 : φ
		const ratioY = halfV + dimOffset * 2;
		const ratioStart = localToWorld(-halfU, ratioY);
		const ratioMid = localToWorld(-halfU + 1, ratioY);
		const ratioEnd = localToWorld(-halfU + 1 + PHI, ratioY);
		
		group.add(new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([ratioStart, ratioMid]),
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
		));
		
		group.add(new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([ratioMid, ratioEnd]),
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
		));
		
		[ratioStart, ratioMid, ratioEnd].forEach(p => {
			group.add(new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([
					p.clone().add(basis.vAxis.clone().multiplyScalar(-0.08)),
					p.clone().add(basis.vAxis.clone().multiplyScalar(0.08))
				]),
				new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
			));
		});

		group.visible = false;
		scene.add(group);
		initialized = true;
	}

	export function init() {
		create();
	}

	export function updateProjection(projection, schematicDist) {
		if (!group || !initialized) return;
		
		const offset = axis.clone().multiplyScalar(schematicDist * direction);
		group.position.copy(offset);
		group.visible = projection > 0.1;
	}

	export function setVisible(visible) {
		if (group) group.visible = visible;
	}

	export function dispose() {
		if (group) {
			scene.remove(group);
			group.traverse(obj => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
			group = null;
			initialized = false;
		}
	}
</script>