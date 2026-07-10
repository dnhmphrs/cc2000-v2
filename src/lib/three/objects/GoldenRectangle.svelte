<script>
	import { tick } from 'svelte';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { accentHex } from '$lib/theme';
	import GoldenRectangleSchematic from './GoldenRectangleSchematic.svelte';
	import RoomProjection from './RoomProjection.svelte';

	// Live accent recolour of all this pane's line-work.
	$: recolorAccent($accentHex);
	function recolorAccent(hex) {
		[fillMaterial, outlineMaterial, spiralMaterial].forEach((m) => m && m.color.setHex(hex));
		subdivisionMaterials.forEach(({ mat }) => mat && mat.color.setHex(hex));
		traceLineMaterials.forEach((m) => m && m.color.setHex(hex));
	}

	// Single group — everything lives here and rotates together
	export let group;
	export let axis;
	export let direction;
	export let vertices;
	export let indices;
	export let decadeKey = null;
	export let portrait = false;
	export let renderer = null;

	// How far the pane (and its room) travels out from the icosahedron centre at
	// full projection, and how deep the room's parallax runs behind the frame.
	const PANE_REACH = 6.4;
	const ROOM_DEPTH = 3.0;

	let rectangleGroup;
	let traceLines = [];
	let schematicComponent;
	let roomComponent;
	let basis = null;
	let baseOpacity = 1.0;
	let schematicBaseOpacity = 1.0;
	let dimFactor = 1; // fades everything (line-work + room)
	let lineDim = 1; // fades only the golden line-work
	let lastProjection = 0;

	let fillMaterial;
	let outlineMaterial;
	let spiralMaterial;
	let subdivisionMaterials = [];
	let traceLineMaterials = [];

	function getRectCorners() {
		return indices.map((i) => new THREE.Vector3(...vertices[i]));
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
			.add(corners[0])
			.add(corners[1])
			.add(corners[2])
			.add(corners[3])
			.multiplyScalar(0.25);

		return { center, uAxis, vAxis, uLen, vLen, corners };
	}

	function localToWorld(u, v) {
		return basis.center
			.clone()
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
					square = {
						left: rect.left,
						right: rect.left + side,
						bottom: rect.bottom,
						top: rect.bottom + side
					};
					arc = { u: rect.left + side, v: rect.bottom + side, startAngle: Math.PI, dir: 0 };
					rect.bottom += side;
					break;
				case 1:
					square = {
						left: rect.left,
						right: rect.left + side,
						bottom: rect.top - side,
						top: rect.top
					};
					arc = { u: rect.left + side, v: rect.top - side, startAngle: Math.PI * 0.5, dir: 1 };
					rect.left += side;
					break;
				case 2:
					square = {
						left: rect.right - side,
						right: rect.right,
						bottom: rect.top - side,
						top: rect.top
					};
					arc = { u: rect.right - side, v: rect.top - side, startAngle: 0, dir: 2 };
					rect.top -= side;
					break;
				case 3:
					square = {
						left: rect.right - side,
						right: rect.right,
						bottom: rect.bottom,
						top: rect.bottom + side
					};
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
			color: get(accentHex),
			transparent: true,
			opacity: 0
		});

		for (const arc of arcCenters) {
			const arcPoints = [];
			for (let j = 0; j <= pointsPerArc; j++) {
				const t = j / pointsPerArc;
				const angle = arc.startAngle + t * (Math.PI / 2);
				arcPoints.push(
					localToWorld(arc.u + arc.radius * Math.cos(angle), arc.v + arc.radius * Math.sin(angle))
				);
			}
			spiralGroup.add(
				new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints), spiralMaterial)
			);
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
				corners[0],
				corners[1],
				corners[1],
				corners[2],
				corners[2],
				corners[3],
				corners[3],
				corners[0]
			]);

			const mat = new THREE.LineBasicMaterial({
				color: get(accentHex),
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
			color: get(accentHex),
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: false
		});

		const shape = new THREE.BufferGeometry().setFromPoints([
			corners[0],
			corners[1],
			corners[2],
			corners[0],
			corners[2],
			corners[3]
		]);
		rectGroup.add(new THREE.Mesh(shape, fillMaterial));

		outlineMaterial = new THREE.LineBasicMaterial({
			color: get(accentHex),
			transparent: true,
			opacity: 0
		});

		const outline = new THREE.BufferGeometry().setFromPoints([
			corners[0],
			corners[1],
			corners[1],
			corners[2],
			corners[2],
			corners[3],
			corners[3],
			corners[0]
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

		indices.forEach((i) => {
			const startPos = new THREE.Vector3(...vertices[i]);
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute(
					[startPos.x, startPos.y, startPos.z, startPos.x, startPos.y, startPos.z],
					3
				)
			);

			const material = new THREE.LineDashedMaterial({
				color: get(accentHex),
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
		const d = dimFactor * lineDim;
		if (fillMaterial) fillMaterial.opacity = 0;
		if (outlineMaterial) outlineMaterial.opacity = t * baseOpacity * d;
		if (spiralMaterial) spiralMaterial.opacity = t * baseOpacity * d;

		subdivisionMaterials.forEach(({ mat }) => {
			mat.opacity = t * baseOpacity * 0.5 * d;
		});

		traceLineMaterials.forEach((mat) => {
			mat.opacity = t * baseOpacity * 0.5 * d;
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
		if (roomComponent) {
			roomComponent.init();
		}
	}

	export function updateProjection(projection) {
		if (!rectangleGroup) return;
		lastProjection = projection;

		const paneDist = projection * PANE_REACH;
		const schematicDist = projection * (PANE_REACH + 3.5);

		rectangleGroup.position.copy(axis.clone().multiplyScalar(paneDist * direction));

		updateOpacities(projection);

		traceLines.forEach((line) => {
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
		if (roomComponent && roomComponent.updateProjection) {
			roomComponent.updateProjection(projection);
		}
	}

	// Fade this pane's line-work and room (used to hide non-target panes on zoom).
	export function setDim(f) {
		dimFactor = f;
		updateOpacities(lastProjection);
		if (roomComponent) roomComponent.setDim(f);
	}

	// Fade only the golden line-work, keeping the room (used on the zoom target).
	export function setLineDim(f) {
		lineDim = f;
		updateOpacities(lastProjection);
	}

	export function setPortrait(p) {
		portrait = p;
		if (roomComponent) roomComponent.setPortrait(p);
	}

	export function getRoom() {
		return roomComponent;
	}

	export function dispose() {
		if (rectangleGroup) {
			group.remove(rectangleGroup);
			rectangleGroup.traverse((obj) => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
		}
		traceLines.forEach((line) => {
			group.remove(line);
			line.geometry.dispose();
			line.material.dispose();
		});
		if (schematicComponent && schematicComponent.dispose) {
			schematicComponent.dispose();
		}
		if (roomComponent && roomComponent.dispose) {
			roomComponent.dispose();
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
	<RoomProjection
		bind:this={roomComponent}
		{group}
		{basis}
		{axis}
		{direction}
		{decadeKey}
		{portrait}
		{renderer}
		paneReach={PANE_REACH}
		maxDepth={ROOM_DEPTH}
	/>
{/if}
