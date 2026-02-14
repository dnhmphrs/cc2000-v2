<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import GoldenRectangleSchematic from './GoldenRectangleSchematic.svelte';

	export let scene;
	export let plane;
	export let axis;
	export let direction;
	export let vertices;
	export let indices;
	export let color = 0xf0f0f0;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let rectangleGroup;
	let traceLines = [];
	let schematicComponent;
	let basis = null;

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
			.add(basis.uAxis.clone().multiplyScalar(u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function createGoldenSpiral() {
		const points = [];
		const b = Math.log(PHI) / (Math.PI / 2);
		const turns = 8;
		const pointsPerTurn = 64;
		const totalPoints = turns * pointsPerTurn;
		
		const halfShort = basis.uLen / 2;
		const halfLong = basis.vLen / 2;
		const cornerDist = Math.sqrt(halfShort * halfShort + halfLong * halfLong);
		const maxTheta = turns * Math.PI / 2;
		const maxR = Math.pow(Math.E, b * maxTheta);
		const scale = cornerDist / maxR;
		
		for (let i = 0; i <= totalPoints; i++) {
			const theta = (i / pointsPerTurn) * Math.PI / 2;
			const r = Math.pow(Math.E, b * theta) * scale;
			const localU = r * Math.cos(theta);
			const localV = r * Math.sin(theta);
			points.push(localToWorld(localU, localV));
		}

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		return new THREE.Line(
			geometry,
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
		);
	}

	function createSubdivisions() {
		const group = new THREE.Group();
		
		let minU = -basis.uLen / 2;
		let maxU = basis.uLen / 2;
		let minV = -basis.vLen / 2;
		let maxV = basis.vLen / 2;
		
		for (let i = 0; i < 8; i++) {
			const w = maxU - minU;
			const h = maxV - minV;
			
			let cutCorners;
			
			if (h > w) {
				const squareTop = minV + w;
				cutCorners = [
					[minU, minV],
					[maxU, minV],
					[maxU, squareTop],
					[minU, squareTop]
				];
				minV = squareTop;
			} else {
				const squareRight = minU + h;
				cutCorners = [
					[minU, minV],
					[squareRight, minV],
					[squareRight, maxV],
					[minU, maxV]
				];
				minU = squareRight;
			}
			
			const corners3D = cutCorners.map(([u, v]) => localToWorld(u, v));
			
			const geo = new THREE.BufferGeometry().setFromPoints([
				corners3D[0], corners3D[1],
				corners3D[1], corners3D[2],
				corners3D[2], corners3D[3],
				corners3D[3], corners3D[0]
			]);
			
			const opacity = 0.5 - i * 0.05;
			group.add(new THREE.LineSegments(
				geo,
				new THREE.LineBasicMaterial({ 
					color: 0xffffff, 
					transparent: true, 
					opacity: Math.max(0.1, opacity)
				})
			));
		}

		return group;
	}

	function createRectangle() {
		const group = new THREE.Group();
		const corners = getRectCorners();

		const shape = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1], corners[2],
			corners[0], corners[2], corners[3]
		]);

		const fill = new THREE.Mesh(
			shape,
			new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: 0.15,
				side: THREE.DoubleSide,
				depthWrite: false
			})
		);
		group.add(fill);

		const outline = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1],
			corners[1], corners[2],
			corners[2], corners[3],
			corners[3], corners[0]
		]);

		const line = new THREE.LineSegments(
			outline,
			new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
		);
		group.add(line);

		group.add(createGoldenSpiral());
		group.add(createSubdivisions());

		group.userData = { axis: axis.clone(), direction };
		return group;
	}

	function createTraceLine(startPos) {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute([
			startPos.x, startPos.y, startPos.z,
			startPos.x, startPos.y, startPos.z
		], 3));

		const material = new THREE.LineDashedMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.25,
			dashSize: 0.08,
			gapSize: 0.04
		});

		const line = new THREE.Line(geometry, material);
		line.computeLineDistances();
		line.userData.startPos = startPos.clone();
		line.visible = false;
		return line;
	}

	function createTraceLines() {
		const lines = [];
		indices.forEach(i => {
			const line = createTraceLine(new THREE.Vector3(...vertices[i]));
			line.userData.axis = axis.clone();
			line.userData.direction = direction;
			scene.add(line);
			lines.push(line);
		});
		return lines;
	}

	export async function init() {
		basis = getRectBasis();
		
		rectangleGroup = createRectangle();
		scene.add(rectangleGroup);

		traceLines = createTraceLines();

		// Wait for component to mount with new basis
		await tick();
		
		if (schematicComponent) {
			schematicComponent.init();
		}
	}

	export function updateProjection(projection) {
		if (!rectangleGroup) return;

		const paneDist = projection * 3.14;
		const schematicDist = projection * 7;

		const offset = axis.clone().multiplyScalar(paneDist * direction);
		rectangleGroup.position.copy(offset);

		// Update trace lines
		traceLines.forEach(line => {
			const { startPos } = line.userData;
			const endPos = startPos.clone().add(axis.clone().multiplyScalar(schematicDist * direction));
			
			const positions = line.geometry.attributes.position.array;
			positions[3] = endPos.x;
			positions[4] = endPos.y;
			positions[5] = endPos.z;
			line.geometry.attributes.position.needsUpdate = true;
			line.computeLineDistances();
			
			line.visible = projection > 0.01;
		});

		// Update schematic
		if (schematicComponent && schematicComponent.updateProjection) {
			schematicComponent.updateProjection(projection, schematicDist);
		}
	}

	export function setSchematicVisible(visible) {
		if (schematicComponent && schematicComponent.setVisible) {
			schematicComponent.setVisible(visible);
		}
	}

	export function dispose() {
		if (rectangleGroup) {
			scene.remove(rectangleGroup);
			rectangleGroup.traverse(obj => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
		}
		traceLines.forEach(line => {
			scene.remove(line);
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
		{scene}
		{basis}
		{axis}
		{direction}
	/>
{/if}