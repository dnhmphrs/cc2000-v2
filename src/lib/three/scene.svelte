<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

	let canvasElement;
	let scene, camera, renderer, controls;
	let animationFrameId;
	let rectangleGroups = [];
	let traceLines = [];
	let schematicGroup;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let projection = 0;
	let showSchematics = false;

	const vertices = [
		[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
		[0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
		[PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
	];

	const faces = [
		[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
		[1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
		[3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
		[4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
	];

	const edges = [
		[0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
		[1, 5], [1, 7], [1, 8], [1, 9],
		[2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
		[3, 4], [3, 6], [3, 8], [3, 9],
		[4, 5], [4, 9], [4, 11],
		[5, 9], [5, 11],
		[6, 7], [6, 8], [6, 10],
		[7, 8], [7, 10],
		[8, 9],
		[10, 11]
	];

	const rectangles = [
		{ indices: [0, 1, 3, 2], color: 0xf0f0f0, axis: new THREE.Vector3(0, 0, 1), plane: 'XY' },
		{ indices: [4, 5, 7, 6], color: 0xf0f0f0, axis: new THREE.Vector3(1, 0, 0), plane: 'YZ' },
		{ indices: [8, 9, 11, 10], color: 0xf0f0f0, axis: new THREE.Vector3(0, 1, 0), plane: 'XZ' }
	];

	// Generate golden spiral points
	function goldenSpiralPoints(turns = 4, pointsPerTurn = 32) {
		const points = [];
		const totalPoints = turns * pointsPerTurn;
		const b = Math.log(PHI) / (Math.PI / 2);
		
		for (let i = 0; i <= totalPoints; i++) {
			const theta = (i / pointsPerTurn) * Math.PI / 2;
			const r = Math.pow(Math.E, b * theta) * 0.1;
			points.push(new THREE.Vector2(
				r * Math.cos(theta),
				r * Math.sin(theta)
			));
		}
		return points;
	}

	function createGoldenSpiral(plane) {
		const points2D = goldenSpiralPoints(6, 48); // play with making these bigger.
		const points3D = points2D.map(p => {
			if (plane === 'XY') return new THREE.Vector3(p.x, p.y, 0);
			if (plane === 'YZ') return new THREE.Vector3(0, p.x, p.y);
			if (plane === 'XZ') return new THREE.Vector3(p.x, 0, p.y);
		});

		const geometry = new THREE.BufferGeometry().setFromPoints(points3D);

		return new THREE.Line(
			geometry,
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
		);
	}

	function createIcosahedron() {
		const geometry = new THREE.BufferGeometry();
		const positions = [];

		faces.forEach((face) => {
			const [a, b, c] = face;
			positions.push(...vertices[a], ...vertices[b], ...vertices[c]);
		});

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.computeVertexNormals();

		return new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({
				color: 0xf0f0f0,
				transparent: true,
				opacity: 0.5,
				side: THREE.DoubleSide,
				depthWrite: false
			})
		);
	}

	function createWireframe() {
		const positions = [];
		edges.forEach(([a, b]) => {
			positions.push(...vertices[a], ...vertices[b]);
		});

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		return new THREE.LineSegments(
			geometry,
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
		);
	}

	function createRectangle(indices, color, plane) {
		const group = new THREE.Group();
		const points = indices.map(i => new THREE.Vector3(...vertices[i]));

		const shape = new THREE.BufferGeometry().setFromPoints([
			points[0], points[1], points[2],
			points[0], points[2], points[3]
		]);

		const fill = new THREE.Mesh(
			shape,
			new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: 0.25,
				side: THREE.DoubleSide,
				depthWrite: false
			})
		);
		group.add(fill);

		const outline = new THREE.BufferGeometry().setFromPoints([
			points[0], points[1], points[1], points[2],
			points[2], points[3], points[3], points[0]
		]);

		const line = new THREE.LineSegments(
			outline,
			new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
		);
		group.add(line);

		// Add golden spiral
		group.add(createGoldenSpiral(plane));

		// Store vertex positions for trace lines
		group.userData.baseVertices = points.map(p => p.clone());

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
			opacity: 0.3,
			dashSize: 0.1,
			gapSize: 0.05
		});

		const line = new THREE.Line(geometry, material);
		line.computeLineDistances();
		line.userData.startPos = startPos.clone();
		return line;
	}

	function createAllRectangles() {
		const group = new THREE.Group();

		rectangles.forEach(({ indices, color, axis, plane }) => {
			// Positive direction
			const pos = createRectangle(indices, color, plane);
			pos.userData.axis = axis.clone();
			pos.userData.direction = 1;
			pos.userData.indices = indices;
			group.add(pos);
			rectangleGroups.push(pos);

			// Create trace lines for each vertex
			indices.forEach(i => {
				const traceLine = createTraceLine(new THREE.Vector3(...vertices[i]));
				traceLine.userData.vertexIndex = i;
				traceLine.userData.axis = axis.clone();
				traceLine.userData.direction = 1;
				scene.add(traceLine);
				traceLines.push(traceLine);
			});

			// Negative direction
			const neg = createRectangle(indices, color, plane);
			neg.userData.axis = axis.clone();
			neg.userData.direction = -1;
			neg.userData.indices = indices;
			group.add(neg);
			rectangleGroups.push(neg);

			// Create trace lines for negative direction
			indices.forEach(i => {
				const traceLine = createTraceLine(new THREE.Vector3(...vertices[i]));
				traceLine.userData.vertexIndex = i;
				traceLine.userData.axis = axis.clone();
				traceLine.userData.direction = -1;
				scene.add(traceLine);
				traceLines.push(traceLine);
			});
		});

		return group;
	}

	function createSchematic(plane, axis, direction) {
		const group = new THREE.Group();
		const offset = axis.clone().multiplyScalar(5 * direction);
		
		const w = 2; // short side (1 * 2)
		const h = 2 * PHI; // long side (PHI * 2)
		
		// Rectangle outline
		let corners;
		if (plane === 'XY') {
			corners = [
				new THREE.Vector3(-1, -PHI, 0),
				new THREE.Vector3(1, -PHI, 0),
				new THREE.Vector3(1, PHI, 0),
				new THREE.Vector3(-1, PHI, 0)
			];
		} else if (plane === 'YZ') {
			corners = [
				new THREE.Vector3(0, -1, -PHI),
				new THREE.Vector3(0, -1, PHI),
				new THREE.Vector3(0, 1, PHI),
				new THREE.Vector3(0, 1, -PHI)
			];
		} else {
			corners = [
				new THREE.Vector3(-PHI, 0, -1),
				new THREE.Vector3(-PHI, 0, 1),
				new THREE.Vector3(PHI, 0, 1),
				new THREE.Vector3(PHI, 0, -1)
			];
		}

		// Main outline
		const outlineGeo = new THREE.BufferGeometry().setFromPoints([
			corners[0], corners[1], corners[1], corners[2],
			corners[2], corners[3], corners[3], corners[0]
		]);
		const outline = new THREE.LineSegments(
			outlineGeo,
			new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
		);
		group.add(outline);

		// Dimension lines and labels
		const dimOffset = 0.4;
		
		// Create dimension line helper
		function createDimLine(start, end, labelText, perpDir) {
			const dimGroup = new THREE.Group();
			
			const s = start.clone().add(perpDir.clone().multiplyScalar(dimOffset));
			const e = end.clone().add(perpDir.clone().multiplyScalar(dimOffset));
			
			// Line
			const lineGeo = new THREE.BufferGeometry().setFromPoints([s, e]);
			const line = new THREE.Line(
				lineGeo,
				new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
			);
			dimGroup.add(line);

			// End ticks
			const tickSize = 0.1;
			const tickDir = end.clone().sub(start).normalize();
			
			[s, e].forEach(p => {
				const tickGeo = new THREE.BufferGeometry().setFromPoints([
					p.clone().add(tickDir.clone().multiplyScalar(-tickSize)),
					p.clone().add(tickDir.clone().multiplyScalar(tickSize))
				]);
				dimGroup.add(new THREE.Line(tickGeo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true })));
			});

			// Extension lines
			[start, end].forEach((p, i) => {
				const ext = [s, e][i];
				const extGeo = new THREE.BufferGeometry().setFromPoints([p, ext]);
				dimGroup.add(new THREE.Line(extGeo, new THREE.LineDashedMaterial({ 
					color: 0xffffff, 
					opacity: 0.2, 
					transparent: true,
					dashSize: 0.05,
					gapSize: 0.03
				})));
				dimGroup.children[dimGroup.children.length - 1].computeLineDistances();
			});

			return dimGroup;
		}

		// Determine perpendicular directions based on plane
		let perpShort, perpLong;
		if (plane === 'XY') {
			perpShort = new THREE.Vector3(0, 0, 1);
			perpLong = new THREE.Vector3(0, 0, 1);
		} else if (plane === 'YZ') {
			perpShort = new THREE.Vector3(1, 0, 0);
			perpLong = new THREE.Vector3(1, 0, 0);
		} else {
			perpShort = new THREE.Vector3(0, 1, 0);
			perpLong = new THREE.Vector3(0, 1, 0);
		}

		// Short side dimension (= 2 = 2·1)
		group.add(createDimLine(corners[0], corners[1], '2', perpShort.clone().multiplyScalar(-1)));
		
		// Long side dimension (= 2φ)
		group.add(createDimLine(corners[1], corners[2], '2φ', perpLong));

		// Ratio annotation - small square showing 1:φ
		const sqSize = 0.3;
		const sqOffset = perpShort.clone().multiplyScalar(dimOffset * 2.5);
		const sqCenter = corners[0].clone().lerp(corners[1], 0.5).add(sqOffset);
		
		// 1×1 square
		let sq1, sq2;
		if (plane === 'XY') {
			sq1 = [
				sqCenter.clone().add(new THREE.Vector3(-sqSize/2, -sqSize/2, 0)),
				sqCenter.clone().add(new THREE.Vector3(sqSize/2, -sqSize/2, 0)),
				sqCenter.clone().add(new THREE.Vector3(sqSize/2, sqSize/2, 0)),
				sqCenter.clone().add(new THREE.Vector3(-sqSize/2, sqSize/2, 0))
			];
			sq2 = [
				sq1[1].clone(),
				sq1[1].clone().add(new THREE.Vector3(sqSize * (PHI - 1), 0, 0)),
				sq1[2].clone().add(new THREE.Vector3(sqSize * (PHI - 1), 0, 0)),
				sq1[2].clone()
			];
		} else if (plane === 'YZ') {
			sq1 = [
				sqCenter.clone().add(new THREE.Vector3(0, -sqSize/2, -sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(0, -sqSize/2, sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(0, sqSize/2, sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(0, sqSize/2, -sqSize/2))
			];
			sq2 = [
				sq1[1].clone(),
				sq1[1].clone().add(new THREE.Vector3(0, 0, sqSize * (PHI - 1))),
				sq1[2].clone().add(new THREE.Vector3(0, 0, sqSize * (PHI - 1))),
				sq1[2].clone()
			];
		} else {
			sq1 = [
				sqCenter.clone().add(new THREE.Vector3(-sqSize/2, 0, -sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(sqSize/2, 0, -sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(sqSize/2, 0, sqSize/2)),
				sqCenter.clone().add(new THREE.Vector3(-sqSize/2, 0, sqSize/2))
			];
			sq2 = [
				sq1[1].clone(),
				sq1[1].clone().add(new THREE.Vector3(sqSize * (PHI - 1), 0, 0)),
				sq1[2].clone().add(new THREE.Vector3(sqSize * (PHI - 1), 0, 0)),
				sq1[2].clone()
			];
		}

		// Draw 1:1 square
		const sq1Geo = new THREE.BufferGeometry().setFromPoints([
			sq1[0], sq1[1], sq1[1], sq1[2], sq1[2], sq1[3], sq1[3], sq1[0]
		]);
		group.add(new THREE.LineSegments(sq1Geo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true })));

		// Draw φ-1 extension
		const sq2Geo = new THREE.BufferGeometry().setFromPoints([
			sq2[0], sq2[1], sq2[1], sq2[2], sq2[2], sq2[3]
		]);
		group.add(new THREE.LineSegments(sq2Geo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true })));

		group.position.copy(offset);
		return group;
	}

	function createAllSchematics() {
		const group = new THREE.Group();
		
		rectangles.forEach(({ axis, plane }) => {
			group.add(createSchematic(plane, axis, 1));
			group.add(createSchematic(plane, axis, -1));
		});

		group.visible = showSchematics;
		return group;
	}

	function updateProjection() {
		rectangleGroups.forEach(rect => {
			const { axis, direction } = rect.userData;
			const offset = axis.clone().multiplyScalar(projection * 3.14 * direction);
			rect.position.copy(offset);
		});

		// Update trace lines
		traceLines.forEach(line => {
			const { startPos, axis, direction } = line.userData;
			const endPos = startPos.clone().add(axis.clone().multiplyScalar(projection * 3.14 * direction));
			
			const positions = line.geometry.attributes.position.array;
			positions[3] = endPos.x;
			positions[4] = endPos.y;
			positions[5] = endPos.z;
			line.geometry.attributes.position.needsUpdate = true;
			line.computeLineDistances();
			
			line.visible = projection > 0.01;
		});

		// Update schematic positions
		if (schematicGroup) {
			let i = 0;
			rectangles.forEach(({ axis }) => {
				[1, -1].forEach(dir => {
					const baseOffset = 5;
					const projOffset = projection * 3.14;
					schematicGroup.children[i].position.copy(
						axis.clone().multiplyScalar((baseOffset + projOffset) * dir)
					);
					i++;
				});
			});
		}
	}

	function toggleSchematics() {
		showSchematics = !showSchematics;
		if (schematicGroup) {
			schematicGroup.visible = showSchematics;
		}
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}

	const frustumSize = 12;
	function handleResize() {
		const aspect = window.innerWidth / window.innerHeight;
		camera.left = -frustumSize * aspect / 2;
		camera.right = frustumSize * aspect / 2;
		camera.top = frustumSize / 2;
		camera.bottom = -frustumSize / 2;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	onMount(() => {
		scene = new THREE.Scene();

		const aspect = window.innerWidth / window.innerHeight;
		camera = new THREE.OrthographicCamera(
			-frustumSize * aspect / 2,
			frustumSize * aspect / 2,
			frustumSize / 2,
			-frustumSize / 2,
			0.1,
			100
		);
		camera.position.set(5, 4, 5);
		camera.lookAt(0, 0, 0);

		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(0x0078D7, 1);

		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;

		scene.add(createIcosahedron());
		scene.add(createWireframe());
		scene.add(createAllRectangles());
		
		schematicGroup = createAllSchematics();
		scene.add(schematicGroup);

		animate();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			renderer.dispose();
			controls.dispose();
		};
	});
</script>

<canvas bind:this={canvasElement}></canvas>

<div class="controls">
	<label>
		Projection
		<input 
			type="range" 
			bind:value={projection} 
			on:input={updateProjection}
			min="0" 
			max="1" 
			step="0.01"
		/>
		<span>{projection.toFixed(2)}</span>
	</label>
	<button on:click={toggleSchematics}>
		{showSchematics ? '▣' : '▢'} Schematics
	</button>
</div>

<div class="info">
	<div>φ = (1+√5)/2 ≈ {PHI.toFixed(6)}</div>
	<div>φ² = φ+1 | 1/φ = φ-1</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: black;
		font-family: monospace;
	}

	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}

	.controls {
		position: fixed;
		top: 20px;
		right: 20px;
		background: rgba(0, 0, 0, 0.7);
		padding: 12px 16px;
		border-radius: 6px;
		color: white;
		font-size: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	label {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	input[type="range"] {
		width: 100px;
	}

	span {
		min-width: 35px;
		text-align: right;
	}

	button {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 6px 10px;
		border-radius: 4px;
		cursor: pointer;
		font-family: monospace;
		font-size: 12px;
	}

	button:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.info {
		position: fixed;
		bottom: 20px;
		left: 20px;
		background: rgba(0, 0, 0, 0.7);
		padding: 12px 16px;
		border-radius: 6px;
		color: white;
		font-size: 11px;
		line-height: 1.6;
		opacity: 0.8;
	}
</style>