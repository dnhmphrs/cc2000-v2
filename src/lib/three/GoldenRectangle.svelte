<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import GoldenRectangleSchematic from './GoldenRectangleSchematic.svelte';

	export let scene;
	export let parentGroup; // the icosahedron group — so rectangles rotate with it
	export let axis;
	export let direction;
	export let vertices;
	export let indices;
	export let decadeKey = null;

	let rectangleGroup;
	let traceLines = [];
	let schematicComponent;
	let basis = null;

	let fillMaterial, outlineMaterial, spiralMaterial;
	let subdivisionMaterials = [];
	let traceLineMaterials = [];

	const baseOpacity = 0.25;

	function getRectCorners() {
		return indices.map(i => new THREE.Vector3(...vertices[i]));
	}

	function getRectBasis() {
		const corners = getRectCorners();
		const edge1 = new THREE.Vector3().subVectors(corners[1], corners[0]);
		const edge2 = new THREE.Vector3().subVectors(corners[3], corners[0]);
		const len1 = edge1.length();
		const len2 = edge2.length();

		let uAxis, vAxis, uLen, vLen;
		if (len1 < len2) {
			uAxis = edge1.clone().normalize(); vAxis = edge2.clone().normalize();
			uLen = len1; vLen = len2;
		} else {
			uAxis = edge2.clone().normalize(); vAxis = edge1.clone().normalize();
			uLen = len2; vLen = len1;
		}

		const center = corners.reduce((acc, c) => acc.add(c), new THREE.Vector3()).multiplyScalar(0.25);
		return { center, uAxis, vAxis, uLen, vLen, corners };
	}

	function localToWorld(u, v) {
		return basis.center.clone()
			.add(basis.uAxis.clone().multiplyScalar(-u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function computeSubdivisions() {
		const squares = [];
		const arcCenters = [];
		let rect = {
			left: -basis.uLen / 2, right: basis.uLen / 2,
			bottom: -basis.vLen / 2, top: basis.vLen / 2
		};

		for (let i = 0; i < 10; i++) {
			const w = rect.right - rect.left;
			const h = rect.top - rect.bottom;
			if (w < 0.001 || h < 0.001) break;
			const side = Math.min(w, h);
			let square, arc;

			switch (i % 4) {
				case 0:
					square = { left: rect.left, right: rect.left + side, bottom: rect.bottom, top: rect.bottom + side };
					arc = { u: rect.left + side, v: rect.bottom + side, startAngle: Math.PI, radius: side };
					rect.bottom += side; break;
				case 1:
					square = { left: rect.left, right: rect.left + side, bottom: rect.top - side, top: rect.top };
					arc = { u: rect.left + side, v: rect.top - side, startAngle: Math.PI * 0.5, radius: side };
					rect.left += side; break;
				case 2:
					square = { left: rect.right - side, right: rect.right, bottom: rect.top - side, top: rect.top };
					arc = { u: rect.right - side, v: rect.top - side, startAngle: 0, radius: side };
					rect.top -= side; break;
				case 3:
					square = { left: rect.right - side, right: rect.right, bottom: rect.bottom, top: rect.bottom + side };
					arc = { u: rect.right - side, v: rect.bottom + side, startAngle: Math.PI * 1.5, radius: side };
					rect.right -= side; break;
			}
			squares.push(square);
			arcCenters.push(arc);
		}
		return { squares, arcCenters };
	}

	function createSpiral(arcCenters) {
		const group = new THREE.Group();
		spiralMaterial = new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0 });

		for (const arc of arcCenters) {
			const pts = [];
			for (let j = 0; j <= 32; j++) {
				const angle = arc.startAngle + (j / 32) * (Math.PI / 2);
				pts.push(localToWorld(
					arc.u + arc.radius * Math.cos(angle),
					arc.v + arc.radius * Math.sin(angle)
				));
			}
			group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), spiralMaterial));
		}
		return group;
	}

	function createSubdivisions(squares) {
		const group = new THREE.Group();
		subdivisionMaterials = [];

		for (let i = 0; i < Math.min(8, squares.length); i++) {
			const sq = squares[i];
			const c = [
				localToWorld(sq.left, sq.bottom), localToWorld(sq.right, sq.bottom),
				localToWorld(sq.right, sq.top), localToWorld(sq.left, sq.top)
			];
			const geo = new THREE.BufferGeometry().setFromPoints([c[0], c[1], c[1], c[2], c[2], c[3], c[3], c[0]]);
			const mat = new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0 });
			subdivisionMaterials.push(mat);
			group.add(new THREE.LineSegments(geo, mat));
		}
		return group;
	}

	function createRectangle() {
		const group = new THREE.Group();
		const corners = getRectCorners();

		fillMaterial = new THREE.MeshBasicMaterial({
			color: 0x232323, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false
		});
		const fillGeo = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1], corners[2], corners[0], corners[2], corners[3]
		]);
		group.add(new THREE.Mesh(fillGeo, fillMaterial));

		outlineMaterial = new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0 });
		const outlineGeo = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1], corners[1], corners[2], corners[2], corners[3], corners[3], corners[0]
		]);
		group.add(new THREE.LineSegments(outlineGeo, outlineMaterial));

		const { squares, arcCenters } = computeSubdivisions();
		group.add(createSpiral(arcCenters));
		group.add(createSubdivisions(squares));

		return group;
	}

	function createTraceLines() {
		const lines = [];
		traceLineMaterials = [];

		indices.forEach(i => {
			const startPos = new THREE.Vector3(...vertices[i]);
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute([
				startPos.x, startPos.y, startPos.z,
				startPos.x, startPos.y, startPos.z
			], 3));
			const mat = new THREE.LineDashedMaterial({
				color: 0xf0f0f0, transparent: true, opacity: 0, dashSize: 0.1, gapSize: 0.05
			});
			traceLineMaterials.push(mat);
			const line = new THREE.Line(geo, mat);
			line.computeLineDistances();
			line.userData.startPos = startPos.clone();
			// Add trace lines to parentGroup so they rotate with icosahedron
			parentGroup.add(line);
			lines.push(line);
		});
		return lines;
	}

	export async function init() {
		basis = getRectBasis();
		rectangleGroup = createRectangle();
		// Add to parentGroup so it rotates with the icosahedron
		parentGroup.add(rectangleGroup);
		traceLines = createTraceLines();
		await tick();
		if (schematicComponent) schematicComponent.init();
	}

	export function updateProjection(proj) {
		if (!rectangleGroup) return;

		const paneDist = proj * 3.14;
		const schematicDist = proj * 7;

		rectangleGroup.position.copy(axis.clone().multiplyScalar(paneDist * direction));

		if (fillMaterial) fillMaterial.opacity = 0;
		if (outlineMaterial) outlineMaterial.opacity = proj * baseOpacity;
		if (spiralMaterial) spiralMaterial.opacity = proj * baseOpacity;
		subdivisionMaterials.forEach(m => { m.opacity = proj * baseOpacity * 0.5; });
		traceLineMaterials.forEach(m => { m.opacity = proj * baseOpacity * 0.5; });

		traceLines.forEach(line => {
			const { startPos } = line.userData;
			const endPos = startPos.clone().add(axis.clone().multiplyScalar(schematicDist * direction));
			const pos = line.geometry.attributes.position.array;
			pos[3] = endPos.x; pos[4] = endPos.y; pos[5] = endPos.z;
			line.geometry.attributes.position.needsUpdate = true;
			line.computeLineDistances();
		});

		if (schematicComponent?.updateProjection) {
			schematicComponent.updateProjection(proj, schematicDist);
		}
	}

	export function dispose() {
		if (rectangleGroup) {
			parentGroup.remove(rectangleGroup);
			rectangleGroup.traverse(obj => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
		}
		traceLines.forEach(line => {
			parentGroup.remove(line);
			line.geometry.dispose();
			line.material.dispose();
		});
		if (schematicComponent?.dispose) schematicComponent.dispose();
	}
</script>

{#if basis}
	<GoldenRectangleSchematic
		bind:this={schematicComponent}
		scene={parentGroup}
		{basis}
		{axis}
		{direction}
		baseOpacity={0.5}
	/>
{/if}
