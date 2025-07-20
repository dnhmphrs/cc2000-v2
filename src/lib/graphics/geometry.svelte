<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$lib/store/store';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import * as THREE from 'three';
	import { Tween, Easing } from '@tweenjs/tween.js';

	let container, animationFrameId;
	let scene, camera, renderer, clock;
	let spermGroup, cameraGroup, mainGroup, macGroup;
	let cubeGrid = []; // Array to store cube grid
	// let gridHelpers = [];
	let sphere, outerSphere;
	let tweens = {};  // Store tweens for different animations

	onDestroy(() => {
		cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleWindowResize);
	});

	function initializeScene() {
		scene = new THREE.Scene();
		mainGroup = new THREE.Group();

		// Set up camera and camera group
		camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.01, 200);
		camera.position.z = 0;

		cameraGroup = new THREE.Group();
		cameraGroup.add(camera);
		// cameraGroup.position.z = 300;
		scene.add(cameraGroup);

		// Set up renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
		renderer.setClearColor(0x357EC7, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Set up clock for smooth animations
		clock = new THREE.Clock();

		// Add basic lights
		const light = new THREE.HemisphereLight(0xb0b0b0, 0x357EC7, 1.5);
		scene.add(light);

		// Add fog to the scene
		const color = 0x357EC7;
		const density = 0.01;
		scene.fog = new THREE.FogExp2(color, density);

		// Append renderer to DOM
		container.appendChild(renderer.domElement);

		// Handle window resize
		window.addEventListener('resize', handleWindowResize);

		// Set up all objects in the scene
		setupCommonObjects();
		setupCubeGrid(); // Add cube grid setup
		setupSperm();
		setupMac();

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

	function setupCubeGrid() {
		const cubeSize = 2.5;
		const spacing = 5; // Space between cubes
		const gridSize = 20; // 20x20 grid // TODO - REACTIVELY EDIT THIS BASED ON WINDOW SIZE - FOR WIDESCREEN ESPECIALLY
		
		// Calculate total grid dimensions
		const totalWidth = (gridSize - 1) * spacing;
		const totalHeight = (gridSize - 1) * spacing;
		
		// Calculate starting position to center the grid
		const startX = -totalHeight / 2;
		const startY = -totalWidth / 2;
		
		// Create cube geometry and material (reuse for performance)
		const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
		const material = new THREE.MeshToonMaterial({ color: 0xf0f0f0 });
		
		// Create grid of cubes on YZ plane (X is constant)
		for (let x = 0; x < gridSize * 2.0; x++) { // twice as wide
			cubeGrid[x] = [];
			for (let y = 0; y < gridSize; y++) {
				const cube = new THREE.Mesh(geometry, material);
				
				// Position cubes on YZ plane, with X constant
				cube.position.set(
					(startX - gridSize * 4.0) + x * spacing,
					startY + y * spacing,
					-20, // Fixed Z position (in front of camera)
				);
				
				cubeGrid[x][y] = cube;
				mainGroup.add(cube);
			}
		}
	}

	function setupCommonObjects() {
		// Create grid helpers
		// const size = 100;
		// const divisions = 10;

		// for (let i = 0; i < 4; i++) {
		// 	const gridHelper = new THREE.GridHelper(size, divisions, 0x150DF7, 0x150DF7);
		// 	gridHelper.rotation.x += Math.PI / 2;
		// 	gridHelper.position.z = -300 + i * 100;
		// 	mainGroup.add(gridHelper);
		// 	gridHelpers.push(gridHelper);
		// }

		// Create spheres
		sphere = new THREE.Mesh(
			new THREE.SphereGeometry(20, 32, 16),
			new THREE.MeshToonMaterial({ color: 0xd0d0d0 })
		);
		mainGroup.add(sphere);

		outerSphere = new THREE.Mesh(
			new THREE.SphereGeometry(32, 32, 16),
			new THREE.MeshPhysicalMaterial({ color: 0xd0d0d0, transparent: true, opacity: 0.5 })
		);
		mainGroup.add(outerSphere);

		mainGroup.position.z = -100;
		scene.add(mainGroup);

		sphere.position.z = -150;
		outerSphere.position.z = -150;
	}

	function setupSperm() {
		spermGroup = new THREE.Group();
		const gltfLoader = new GLTFLoader();

		gltfLoader.load('/sperm.glb', (glb) => {
			const sperm = glb.scene.children[0];
			sperm.rotation.x += Math.PI;
			// sperm.position.y -= 1.695;
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
			spermGroup.position.y = -0.1;
			cameraGroup.add(spermGroup); // Add spermGroup to cameraGroup
		});

		// spermGroup.position.set(0, -0.1, -1.5); // Positioning the group relative to the camera
	}

	function setupMac() {
		spermGroup = new THREE.Group();
		const gltfLoader = new GLTFLoader();

		gltfLoader.load('/mac.glb', (glb) => {
			const mac = glb.scene.children[0];
			mac.rotation.x += Math.PI;
			// sperm.position.y -= 1.695;
			mac.position.z += 4;
			mac.position.set(0, 0, 0); // Position it centrally in the group
			mac.scale.set(0.2, 0.2, 0.2); // Uniform scaling to ensure visibility

			mac.traverse(function (child) {
				if (child.material) {
					child.material = new THREE.MeshToonMaterial({
						color: 0xf0f0f0,
					});
				}
			});

			macGroup.add(sperm);
			macGroup.position.y = -0.1;
			mainGroup.add(macGroup); // Add spermGroup to cameraGroup
		});

		// spermGroup.position.set(0, -0.1, -1.5); // Positioning the group relative to the camera
	}

	function createAnimations() {
		// Page 2 animation: Scene moves into view
		tweens['spermIntoView'] = new Tween({ z: cameraGroup.position.z })
			.to({ z: -1.5 }, 2500)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				spermGroup.position.z = coords.z;
			});

		tweens['sceneIntoView'] = new Tween({ z: mainGroup.position.z })
			.to({ z: 0 }, 2500)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				mainGroup.position.z = coords.z;
			});


		// Page 3 animation: Camera moving forward
		tweens['flyThrough'] = new Tween({ z: cameraGroup.position.z })
			.to({ z: -125 }, 2000)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				cameraGroup.position.z = coords.z;
			});

		// Page 3 animation: Change background clearColor and fog color to 0xd0d0d0
		tweens['backgroundColorChange'] = new Tween({ r: 53, g: 126, b: 199 }) // Start with the original color 0x357EC7
			.to({ r: 208, g: 208, b: 208 }, 3000) // Transition to color 0xd0d0d0
			.easing(Easing.Quadratic.InOut)
			.onUpdate((color) => {
				const newColor = new THREE.Color(`rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`);
				renderer.setClearColor(newColor);
				scene.fog.color.set(newColor);
			});

			// Page 3 animation: Change hemisphere light colors to 0x357EC7
			// tweens['hemisphereLightChange'] = new Tween({ r1: 176, g1: 176, b1: 176, r2: 35, g2: 35, b2: 35 }) // Start with the original light colors
			//     .to({ r1: 11, g1: 11, b1: 11, r2: 11, g2: 11, b2: 11 }, 2500) // Transition to 0x357EC7 for both sky and ground colors
			//     .easing(Easing.Quadratic.InOut)
			//     .onUpdate((colors) => {
			//         const newSkyColor = new THREE.Color(`rgb(${Math.floor(colors.r1)}, ${Math.floor(colors.g1)}, ${Math.floor(colors.b1)})`);
			//         const newGroundColor = new THREE.Color(`rgb(${Math.floor(colors.r2)}, ${Math.floor(colors.g2)}, ${Math.floor(colors.b2)})`);
			//         light.color.set(newSkyColor); // Change the sky color
			//         light.groundColor.set(newGroundColor); // Change the ground color
			//     });


			// Page 3 animation: Change lighting to 0x357EC7
			tweens['lightingChange'] = new Tween({ r1: 176, g1: 176, b1: 176, r2: 53, g2: 126, b2: 199 }) // Start with the original light color (0xb0b0b0)
				.to({ r1: 208, g1: 208, b1: 208, r2: 208, g2: 208, b2: 208 }, 3000) // Transition to color 0x357EC7
				.easing(Easing.Quadratic.InOut)
				.onUpdate((colors) => {
					const newSkyColor = new THREE.Color(`rgb(${Math.floor(colors.r1)}, ${Math.floor(colors.g1)}, ${Math.floor(colors.b1)})`);
					const newGroundColor = new THREE.Color(`rgb(${Math.floor(colors.r2)}, ${Math.floor(colors.g2)}, ${Math.floor(colors.b2)})`);
						scene.children.forEach((child) => {
								if (child instanceof THREE.HemisphereLight) {
										child.color.set(newSkyColor);
										child.groundColor.set(newGroundColor);
								}
						});
				});


		// Example additional animation for other pages (e.g., page 4)
		// tweens['page4'] = new Tween({ rotation: 0 })
		// 	.to({ rotation: 2 * Math.PI }, 5000)
		// 	.easing(Easing.Quadratic.InOut)
		// 	.onUpdate((coords) => {
		// 		sphere.rotation.y = coords.rotation;
		// 	});
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
		// gridHelpers.forEach((gridHelper, index) => {
		// 	gridHelper.rotation.y += index % 2 === 0 ? 0.0075 : -0.0075;
		// });

		// Animate cube grid with gentle rotation
		cubeGrid.forEach((row, y) => {
			row.forEach((cube, z) => {
				if (cube.visible) {
					// Add subtle rotation based on position
					cube.rotation.y = elapsedTime * 0.5 + (y + z) * 0.1;
					cube.rotation.x = elapsedTime * 0.3 + (y - z) * 0.05;
				}
			});
		});

		// Smooth sperm rotation using easing
		if (spermGroup) {
			// if page = 3 speed is fast
			spermGroup.rotation.z = -elapsedTime * 8;
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
		// Reset animations
		Object.values(tweens).forEach((tween) => tween.stop());
		
		// Show cube grid for page 1
		cubeGrid.forEach(row => {
			row.forEach(cube => {
				cube.visible = true;
			});
		});
	}

	function setupScene2() {
		// Reset animations
		// Object.values(tweens).forEach((tween) => tween.stop());
		tweens['spermIntoView'].start();
		tweens['sceneIntoView'].start();
		
		// // Hide cube grid for page 2
		// cubeGrid.forEach(row => {
		// 	row.forEach(cube => {
		// 		cube.visible = false;
		// 	});
		// });
	}

	function setupScene3() {
		// Trigger page 3 animation
		tweens['flyThrough'].start();
    tweens['backgroundColorChange'].start();
		tweens['lightingChange'].start();

		// Hide cube grid for page 3
		cubeGrid.forEach(row => {
			row.forEach(cube => {
				cube.visible = false;
			});
		});

		// wait 5 seconds, set page to 4
		setTimeout(() => {
			page.set(4);
		}, 3500);
	}

	function setupScene4() {
		// Trigger page 4 animation
		// tweens['page4'].start();

		// Hide cube grid for page 4
		cubeGrid.forEach(row => {
			row.forEach(cube => {
				cube.visible = false;
			});
		});

		// remove the sperm
		cameraGroup.remove(spermGroup);
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

		/* opacity: 0;
		animation: fadein 3s 1s ease;
		animation-fill-mode: forwards; */
	}
</style>
