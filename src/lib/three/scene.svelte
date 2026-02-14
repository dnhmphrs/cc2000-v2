<script>
	import { onMount, tick } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import GoldenRectangle from './objects/GoldenRectangle.svelte';

	let canvasElement;
	let scene, camera, renderer, controls;
	let animationFrameId;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let projection = 0;
	let sceneReady = false;

	let rectangleComponents = [];

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

	const rectangleConfigs = [
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: 1 },
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: -1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: 1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: -1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: 1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: -1 }
	];

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
				color: 0x232323,
				transparent: false,
				opacity: 1.0,
				side: THREE.DoubleSide,
				depthWrite: true
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
			new THREE.LineBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.5 })
		);
	}

	function updateProjection() {
		rectangleComponents.forEach(comp => {
			if (comp) comp.updateProjection(projection);
		});
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

	onMount(async () => {
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
		renderer.setClearColor(0x232323, 1);

		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;

		scene.add(createIcosahedron());
		scene.add(createWireframe());

		// Set flag and wait for components to bind
		sceneReady = true;
		await tick();

		// Now init all rectangle components
		rectangleComponents.forEach(comp => {
			if (comp) comp.init();
		});

		animate();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			rectangleComponents.forEach(comp => {
				if (comp) comp.dispose();
			});
			renderer.dispose();
			controls.dispose();
		};
	});
</script>

{#if sceneReady}
	{#each rectangleConfigs as config, i}
		<GoldenRectangle
			bind:this={rectangleComponents[i]}
			{scene}
			plane={config.plane}
			axis={config.axis}
			direction={config.direction}
			{vertices}
			indices={config.indices}
		/>
	{/each}
{/if}

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
</div>

<!-- <div class="info">
	<div>φ = (1+√5)/2 ≈ {PHI.toFixed(6)}</div>
	<div>φ² = φ+1 | 1/φ = φ-1</div>
</div> -->

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