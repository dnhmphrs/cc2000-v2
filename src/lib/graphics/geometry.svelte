<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$lib/store/store';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import * as THREE from 'three';
	import { Tween, Easing } from '@tweenjs/tween.js';

	let container, animationFrameId;
	let scene, camera, renderer, clock;
	let spermGroup, cameraGroup;
	let gridHelpers = [];
	let sphere, outerSphere;
	let tweens = {};  // Store tweens for different animations

	onDestroy(() => {
		cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleWindowResize);
	});

	function initializeScene() {
		scene = new THREE.Scene();

		// Set up camera and camera group
		camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.5, 400);
		camera.position.z = 0;

		cameraGroup = new THREE.Group();
		cameraGroup.add(camera);
		scene.add(cameraGroup);

		// Set up renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
		renderer.setClearColor(0x232323, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Set up clock for smooth animations
		clock = new THREE.Clock();

		// Add basic lights
		const light = new THREE.HemisphereLight(0xd0d0d0, 0x232323, 1.5);
		scene.add(light);

		// Add fog to the scene
		const color = 0x232323;
		const density = 0.009;
		scene.fog = new THREE.FogExp2(color, density);

		// Append renderer to DOM
		container.appendChild(renderer.domElement);

		// Handle window resize
		window.addEventListener('resize', handleWindowResize);

		// Set up all objects in the scene
		setupCommonObjects();
		setupSperm();

		// Create all animations upfront
		createAnimations();

		// Start rendering
		renderScene();
	}

	function handleWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function setupCommonObjects() {
		// Create grid helpers
		const size = 100;
		const divisions = 10;

		for (let i = 0; i < 4; i++) {
			const gridHelper = new THREE.GridHelper(size, divisions, 0xf0f0f0, 0xf0f0f0);
			gridHelper.rotation.x += Math.PI / 2;
			gridHelper.position.z = -300 + i * 100;
			scene.add(gridHelper);
			gridHelpers.push(gridHelper);
		}

		// Create spheres
		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(14, 32, 16),
			new THREE.MeshToonMaterial({ color: 0xd0d0d0 })
		);
		scene.add(sphere);

		outerSphere = new THREE.Mesh(
			new THREE.SphereGeometry(22, 32, 16),
			new THREE.MeshPhysicalMaterial({ color: 0xd0d0d0, transparent: true, opacity: 0.5 })
		);
		scene.add(outerSphere);

		sphere.position.z = -150;
		outerSphere.position.z = -150;
	}

	function setupSperm() {
		spermGroup = new THREE.Group();
		const gltfLoader = new GLTFLoader();

		gltfLoader.load('/sperm.glb', (glb) => {
			const sperm = glb.scene.children[0];
			sperm.rotation.x += Math.PI;
			sperm.position.y -= 0.695;
			sperm.position.z += 4;
			sperm.position.set(0, 0, 0); // Position it centrally in the group
			sperm.scale.set(0.2, 0.2, 0.2); // Uniform scaling to ensure visibility

			sperm.traverse(function (child) {
				if (child.material) {
					child.material = new THREE.MeshToonMaterial({
						color: 0xf0f0f0,
					});
				}
			});

			spermGroup.add(sperm);
			cameraGroup.add(spermGroup); // Add spermGroup to cameraGroup
		});

		spermGroup.position.set(0, -0.1, -5.5); // Positioning the group relative to the camera
	}

	function createAnimations() {
		// Page 3 animation: Camera moving forward
		tweens['page3'] = new Tween({ z: cameraGroup.position.z })
			.to({ z: -200 }, 1000)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				cameraGroup.position.z = coords.z;
			});

		// Example additional animation for other pages (e.g., page 4)
		tweens['page4'] = new Tween({ rotation: 0 })
			.to({ rotation: 2 * Math.PI }, 5000)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				sphere.rotation.y = coords.rotation;
			});
	}

	function renderScene(time) {
		const elapsedTime = clock.getElapsedTime();
		updateScene(elapsedTime);

		renderer.render(scene, camera);
		animationFrameId = requestAnimationFrame(renderScene);

		// Update active tween
		Object.values(tweens).forEach((tween) => tween.update(time));
	}

	function updateScene(elapsedTime) {
		// Rotate grid helpers smoothly
		gridHelpers.forEach((gridHelper, index) => {
			gridHelper.rotation.y += index % 2 === 0 ? -0.01 : 0.01;
		});

		// Smooth sperm rotation using easing
		if (spermGroup) {
			spermGroup.rotation.z = -elapsedTime * 10;
		}
	}

	// Define scene configurations
	const sceneConfigs = {
		1: setupScene1,
		2: setupScene2,
		3: setupScene3,
		4: setupScene4,
	};

	// Functions to set up different scenes based on `page`
	function setupScene1() {
		// Example: Reset animations
		Object.values(tweens).forEach((tween) => tween.stop());
	}

	function setupScene2() {
		// Example: Reset animations
		Object.values(tweens).forEach((tween) => tween.stop());
	}

	function setupScene3() {
		// Trigger page 3 animation
		console.log('Setting up scene 3');
		tweens['page3'].start();
	}

	function setupScene4() {
		// Trigger page 4 animation
		tweens['page4'].start();
	}

	// React to page changes
	$: {
		if (sceneConfigs[$page]) {
			sceneConfigs[$page]();
		}
	}

	// Initialize scene on mount
	onMount(() => {
		initializeScene();
	});
</script>

<div bind:this={container} class:geometry={true} />

<style>
	.geometry {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -10;
		overflow: hidden;

		width: 100vw;
		height: 100vh;
		height: calc(var(--vh, 1vh) * 100);

		opacity: 0;
		animation: fadein 3s 1s ease;
		animation-fill-mode: forwards;
	}
</style>
