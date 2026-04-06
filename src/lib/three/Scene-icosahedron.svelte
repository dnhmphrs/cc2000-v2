<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { sceneState, decade, isPortrait } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import GoldenRectangle from './objects/GoldenRectangle.svelte';

	let canvasElement;
	let scene, camera, renderer, controls;
	let animationFrameId;
	let clock;
	let sceneReady = false;
	let rectangleComponents = [];

	const PHI = (1 + Math.sqrt(5)) / 2;
	const FRUSTUM = 12;

	// Animation
	let currentProjection = 0;
	let targetProjection = 0;
	let animTime = 0;
	let localAnimPhase = 0;

	// Quaternion rotation
	let rotationStart = new THREE.Quaternion();
	let rotationTarget = new THREE.Quaternion();
	let rotationProgress = 0;

	// Single group for everything that rotates together:
	// icosahedron, golden rectangles, schematics, trace lines, and later the lattice.
	export let worldGroup;

	// Icosahedron data
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

	const decadeAssignments = ['50s', '60s', '90s', '10s', '50s', '60s'];

	const rectangleConfigs = [
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: 1 },
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: -1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: 1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: -1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: 1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: -1 },
	];

	function getDecadeRotation(decadeKey) {
		const rotations = {
			'50s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0),
			'60s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
			'90s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
			'10s': new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2),
		};
		return rotations[decadeKey] || rotations['90s'];
	}

	function buildIcosahedronMeshes(group) {
		const positions = [];
		faces.forEach(([a, b, c]) => { positions.push(...vertices[a], ...vertices[b], ...vertices[c]); });
		const solidGeo = new THREE.BufferGeometry();
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		solidGeo.computeVertexNormals();
		group.add(new THREE.Mesh(solidGeo, new THREE.MeshBasicMaterial({
			color: 0x232323, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: true
		})));

		const edgePositions = [];
		edges.forEach(([a, b]) => { edgePositions.push(...vertices[a], ...vertices[b]); });
		const wireGeo = new THREE.BufferGeometry();
		wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
		group.add(new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({
			color: 0xf0f0f0, transparent: true, opacity: 0.5
		})));
	}

	let unsubState;

	function handleResize() {
		if (!camera || !renderer) return;
		const aspect = window.innerWidth / window.innerHeight;
		isPortrait.set(window.innerHeight > window.innerWidth);
		camera.left = -FRUSTUM * aspect / 2;
		camera.right = FRUSTUM * aspect / 2;
		camera.top = FRUSTUM / 2;
		camera.bottom = -FRUSTUM / 2;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock) return;

		const dt = clock.getDelta();
		animTime += dt;

		currentProjection = lerp(currentProjection, targetProjection, dt * 3);

		rectangleComponents.forEach(comp => {
			if (comp) comp.updateProjection(currentProjection);
		});

		if (localAnimPhase === 0) {
			if (worldGroup) {
				worldGroup.rotation.y += dt * 0.15;
				worldGroup.rotation.x += dt * 0.07;
			}
		}

		if (localAnimPhase === 1) {
			sceneState.set(2);
		}

		if (localAnimPhase === 2) {
			rotationProgress = clamp(rotationProgress + dt * 0.6, 0, 1);
			if (worldGroup) {
				const t = easeInOutCubic(rotationProgress);
				worldGroup.quaternion.slerpQuaternions(rotationStart, rotationTarget, t);
			}
			if (rotationProgress >= 1) {
				sceneState.set(3);
			}
		}

		if (localAnimPhase === 3) {
			targetProjection = 1;
			if (currentProjection > 0.9) {
				sceneState.set(4);
			}
		}

		controls.update();
		renderer.render(scene, camera);
	}

	onMount(async () => {
		scene = new THREE.Scene();
		clock = new THREE.Clock();

		const aspect = window.innerWidth / window.innerHeight;
		isPortrait.set(window.innerHeight > window.innerWidth);

		camera = new THREE.OrthographicCamera(
			-FRUSTUM * aspect / 2, FRUSTUM * aspect / 2,
			FRUSTUM / 2, -FRUSTUM / 2, 0.1, 100
		);
		camera.position.set(5, 4, 5);
		camera.lookAt(0, 0, 0);

		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x232323, 1);

		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.enableZoom = true;
		controls.enablePan = false;

		worldGroup = new THREE.Group();
		scene.add(worldGroup);

		buildIcosahedronMeshes(worldGroup);

		unsubState = sceneState.subscribe(v => {
			localAnimPhase = v;
			animTime = 0;

			if (v === 0) {
				targetProjection = 0;
			}

			if (v === 1) {
				targetProjection = 0;
			}

			if (v === 2) {
				if (worldGroup) {
					rotationStart.copy(worldGroup.quaternion);
					const targetDecade = $decade || '90s';
					rotationTarget.copy(getDecadeRotation(targetDecade));
					rotationProgress = 0;
				}
			}
		});

		sceneReady = true;
		await tick();

		rectangleComponents.forEach(comp => { if (comp) comp.init(); });

		animate();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (unsubState) unsubState();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		rectangleComponents.forEach(comp => { if (comp) comp.dispose(); });
		if (renderer) renderer.dispose();
		if (controls) controls.dispose();
	});
</script>

{#if sceneReady}
	{#each rectangleConfigs as config, i}
		<GoldenRectangle
			bind:this={rectangleComponents[i]}
			group={worldGroup}
			axis={config.axis}
			direction={config.direction}
			{vertices}
			indices={config.indices}
			decadeKey={decadeAssignments[i]}
		/>
	{/each}
{/if}

<canvas bind:this={canvasElement} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 0;
	}
</style>