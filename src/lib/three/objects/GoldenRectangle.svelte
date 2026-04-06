<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import GoldenRectangleSchematic from './GoldenRectangleSchematic.svelte';

	// Single group — everything lives here and rotates together
	export let group;
	export let axis;
	export let direction;
	export let vertices;
	export let indices;
	export let decadeKey = null;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let rectangleGroup;
	let traceLines = [];
	let schematicComponent;
	let basis = null;
	let baseOpacity = 0.25;
	let schematicBaseOpacity = 0.5;

	let fillMaterial;
	let outlineMaterial;
	let spiralMaterial;
	let subdivisionMaterials = [];
	let traceLineMaterials = [];

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
			uAxis = edge1.clone().normalize();
			vAxis = edge2.clone().normalize();
			uLen = len1;
			vLen = len2;
		} else {
			uAxis = edge2.clone().normalize();
			vAxis = edge1.clone().normalize();
			uLen = len2;
			vLen = len1;
		}

		const center = new THREE.Vector3()
			.add(corners[0]).add(corners[1]).add(corners[2]).add(corners[3])
			.multiplyScalar(0.25);

		return { center, uAxis, vAxis, uLen, vLen, corners };
	}

	function localToWorld(u, v) {
		return basis.center.clone()
			.add(basis.uAxis.clone().multiplyScalar(-u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function computeGoldenRectangleData() {
		const squares = [];
		const arcCenters = [];

		let rect = {
			left: -basis.uLen / 2,
			right: basis.uLen / 2,
			bottom: -basis.vLen / 2,
			top: basis.vLen / 2
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
					arc = { u: rect.left + side, v: rect.bottom + side, startAngle: Math.PI, dir: 0 };
					rect.bottom += side;
					break;
				case 1:
					square = { left: rect.left, right: rect.left + side, bottom: rect.top - side, top: rect.top };
					arc = { u: rect.left + side, v: rect.top - side, startAngle: Math.PI * 0.5, dir: 1 };
					rect.left += side;
					break;
				case 2:
					square = { left: rect.right - side, right: rect.right, bottom: rect.top - side, top: rect.top };
					arc = { u: rect.right - side, v: rect.top - side, startAngle: 0, dir: 2 };
					rect.top -= side;
					break;
				case 3:
					square = { left: rect.right - side, right: rect.right, bottom: rect.bottom, top: rect.bottom + side };
					arc = { u: rect.right - side, v: rect.bottom + side, startAngle: Math.PI * 1.5, dir: 3 };
					rect.right -= side;
					break;
			}

			squares.push(square);
			arcCenters.push({ ...arc, radius: side });
		}

		return { squares, arcCenters };
	}

	function createGoldenSpiral(arcCenters) {
		const spiralGroup = new THREE.Group();
		const pointsPerArc = 32;

		spiralMaterial = new THREE.LineBasicMaterial({
			color: 0xf0f0f0,
			transparent: true,
			opacity: 0
		});

		for (const arc of arcCenters) {
			const arcPoints = [];
			for (let j = 0; j <= pointsPerArc; j++) {
				const t = j / pointsPerArc;
				const angle = arc.startAngle + t * (Math.PI / 2);
				arcPoints.push(localToWorld(
					arc.u + arc.radius * Math.cos(angle),
					arc.v + arc.radius * Math.sin(angle)
				));
			}
			spiralGroup.add(new THREE.Line(
				new THREE.BufferGeometry().setFromPoints(arcPoints),
				spiralMaterial
			));
		}

		return spiralGroup;
	}

	function createSubdivisionLines(squares) {
		const subGroup = new THREE.Group();
		subdivisionMaterials = [];

		for (let i = 0; i < Math.min(8, squares.length); i++) {
			const sq = squares[i];
			const corners = [
				localToWorld(sq.left, sq.bottom),
				localToWorld(sq.right, sq.bottom),
				localToWorld(sq.right, sq.top),
				localToWorld(sq.left, sq.top)
			];

			const geo = new THREE.BufferGeometry().setFromPoints([
				corners[0], corners[1],
				corners[1], corners[2],
				corners[2], corners[3],
				corners[3], corners[0]
			]);

			const mat = new THREE.LineBasicMaterial({
				color: 0xf0f0f0,
				transparent: true,
				opacity: 0
			});
			subdivisionMaterials.push({ mat });
			subGroup.add(new THREE.LineSegments(geo, mat));
		}

		return subGroup;
	}

	function createRectangle() {
		const rectGroup = new THREE.Group();
		const corners = getRectCorners();

		fillMaterial = new THREE.MeshBasicMaterial({
			color: 0x232323,
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: false
		});

		const shape = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1], corners[2],
			corners[0], corners[2], corners[3]
		]);
		rectGroup.add(new THREE.Mesh(shape, fillMaterial));

		outlineMaterial = new THREE.LineBasicMaterial({
			color: 0xf0f0f0,
			transparent: true,
			opacity: 0
		});

		const outline = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1],
			corners[1], corners[2],
			corners[2], corners[3],
			corners[3], corners[0]
		]);
		rectGroup.add(new THREE.LineSegments(outline, outlineMaterial));

		const { squares, arcCenters } = computeGoldenRectangleData();
		rectGroup.add(createGoldenSpiral(arcCenters));
		rectGroup.add(createSubdivisionLines(squares));

		return rectGroup;
	}

	function createTraceLines() {
		const lines = [];
		traceLineMaterials = [];

		indices.forEach(i => {
			const startPos = new THREE.Vector3(...vertices[i]);
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute('position', new THREE.Float32BufferAttribute([
				startPos.x, startPos.y, startPos.z,
				startPos.x, startPos.y, startPos.z
			], 3));

			const material = new THREE.LineDashedMaterial({
				color: 0xf0f0f0,
				transparent: true,
				opacity: 0,
				dashSize: 0.1,
				gapSize: 0.05
			});
			traceLineMaterials.push(material);

			const line = new THREE.Line(geometry, material);
			line.computeLineDistances();
			line.userData.startPos = startPos.clone();
			group.add(line);
			lines.push(line);
		});

		return lines;
	}

	function updateOpacities(t) {
		if (fillMaterial) fillMaterial.opacity = 0;
		if (outlineMaterial) outlineMaterial.opacity = t * baseOpacity;
		if (spiralMaterial) spiralMaterial.opacity = t * baseOpacity;

		subdivisionMaterials.forEach(({ mat }) => {
			mat.opacity = t * baseOpacity * 0.5;
		});

		traceLineMaterials.forEach(mat => {
			mat.opacity = t * baseOpacity * 0.5;
		});
	}

	export async function init() {
		basis = getRectBasis();

		rectangleGroup = createRectangle();
		group.add(rectangleGroup);

		traceLines = createTraceLines();

		await tick();

		if (schematicComponent) {
			schematicComponent.init();
		}
	}

	export function updateProjection(projection) {
		if (!rectangleGroup) return;

		const paneDist = projection * 3.14;
		const schematicDist = projection * 7;

		rectangleGroup.position.copy(axis.clone().multiplyScalar(paneDist * direction));

		updateOpacities(projection);

		traceLines.forEach(line => {
			const { startPos } = line.userData;
			const endPos = startPos.clone().add(axis.clone().multiplyScalar(schematicDist * direction));

			const positions = line.geometry.attributes.position.array;
			positions[3] = endPos.x;
			positions[4] = endPos.y;
			positions[5] = endPos.z;
			line.geometry.attributes.position.needsUpdate = true;
			line.computeLineDistances();
		});

		if (schematicComponent && schematicComponent.updateProjection) {
			schematicComponent.updateProjection(projection, schematicDist);
		}
	}

	export function dispose() {
		if (rectangleGroup) {
			group.remove(rectangleGroup);
			rectangleGroup.traverse(obj => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
		}
		traceLines.forEach(line => {
			group.remove(line);
			line.geometry.dispose();
			line.material.dispose();
		});
		if (schematicComponent && schematicComponent.dispose) {
			schematicComponent.dispose();
		}
	}
</script>

{#if basis}
	<GoldenRectangleSchematic
		bind:this={schematicComponent}
		{group}
		{basis}
		{axis}
		{direction}
		baseOpacity={schematicBaseOpacity}
	/>
{/if}