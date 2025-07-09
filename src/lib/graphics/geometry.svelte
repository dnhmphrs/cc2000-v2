<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$lib/store/store';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import * as THREE from 'three';
	import { Tween, Easing } from '@tweenjs/tween.js';

	let container, animationFrameId;
	let scene, camera, renderer, clock;
	let spermGroup, cameraGroup, mainGroup;
	let roomParts = {}; // Store all room elements
	let tweens = {}; // Store tweens for different animations
	let currentDecade = 2020;

	// Room construction elements
	let roomWalls = [];
	let roomFloor, roomCeiling;
	let roomFurniture = {};
	let roomDecorations = {};

	onDestroy(() => {
		cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleWindowResize);
	});

	function initializeScene() {
		scene = new THREE.Scene();
		mainGroup = new THREE.Group();

		// Set up camera and camera group
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 2, 8);
		camera.lookAt(0, 0, 0);

		cameraGroup = new THREE.Group();
		cameraGroup.add(camera);
		scene.add(cameraGroup);

		// Set up renderer
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
		renderer.setClearColor(0x232323, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// Set up clock
		clock = new THREE.Clock();

		// Lighting setup
		const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(5, 10, 5);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 2048;
		directionalLight.shadow.mapSize.height = 2048;
		scene.add(directionalLight);

		// Append renderer to DOM
		container.appendChild(renderer.domElement);

		// Handle window resize
		window.addEventListener('resize', handleWindowResize);

		// Initialize room construction
		initializeRoomConstruction();
		setupSperm();
		createAnimations();

		// Start rendering
		renderScene();
	}

	function handleWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function initializeRoomConstruction() {
		// Create room wireframe structure
		createRoomWireframe();
		
		// Create furniture templates for each decade
		createFurnitureTemplates();
		
		// Create decoration templates
		createDecorationTemplates();
		
		// Hide everything initially
		mainGroup.visible = false;
		scene.add(mainGroup);
	}

	function createRoomWireframe() {
		const wireframeMaterial = new THREE.LineBasicMaterial({ 
			color: 0x00ff00, 
			transparent: true, 
			opacity: 0.6 
		});

		// Room dimensions
		const roomWidth = 10;
		const roomHeight = 6;
		const roomDepth = 8;

		// Create wireframe walls
		const wallGeometries = [
			// Back wall
			new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomWidth, roomHeight)),
			// Left wall  
			new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomDepth, roomHeight)),
			// Right wall
			new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomDepth, roomHeight)),
		];

		wallGeometries.forEach((geometry, index) => {
			const wireframe = new THREE.LineSegments(geometry, wireframeMaterial);
			
			switch(index) {
				case 0: // Back wall
					wireframe.position.set(0, 0, -roomDepth/2);
					break;
				case 1: // Left wall
					wireframe.position.set(-roomWidth/2, 0, 0);
					wireframe.rotation.y = Math.PI/2;
					break;
				case 2: // Right wall
					wireframe.position.set(roomWidth/2, 0, 0);
					wireframe.rotation.y = -Math.PI/2;
					break;
			}
			
			roomWalls.push(wireframe);
			mainGroup.add(wireframe);
		});

		// Floor wireframe
		const floorGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomWidth, roomDepth));
		roomFloor = new THREE.LineSegments(floorGeometry, wireframeMaterial);
		roomFloor.rotation.x = -Math.PI/2;
		roomFloor.position.y = -roomHeight/2;
		mainGroup.add(roomFloor);

		// Ceiling wireframe
		const ceilingGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomWidth, roomDepth));
		roomCeiling = new THREE.LineSegments(ceilingGeometry, wireframeMaterial);
		roomCeiling.rotation.x = Math.PI/2;
		roomCeiling.position.y = roomHeight/2;
		mainGroup.add(roomCeiling);
	}

	function createFurnitureTemplates() {
		// Bed
		const bedGeometry = new THREE.BoxGeometry(3, 0.5, 2);
		const bedMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
		roomFurniture.bed = new THREE.Mesh(bedGeometry, bedMaterial);
		roomFurniture.bed.position.set(2, -2.5, -1);
		roomFurniture.bed.visible = false;
		mainGroup.add(roomFurniture.bed);

		// Desk
		const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
		const deskMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
		roomFurniture.desk = new THREE.Mesh(deskGeometry, deskMaterial);
		roomFurniture.desk.position.set(-2, -1, 2);
		roomFurniture.desk.visible = false;
		mainGroup.add(roomFurniture.desk);

		// Monitor placeholder
		const monitorGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
		const monitorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
		roomFurniture.monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
		roomFurniture.monitor.position.set(-2, -0.5, 2.5);
		roomFurniture.monitor.visible = false;
		mainGroup.add(roomFurniture.monitor);
	}

	function createDecorationTemplates() {
		// Poster
		const posterGeometry = new THREE.PlaneGeometry(1.5, 2);
		const posterMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
		roomDecorations.poster = new THREE.Mesh(posterGeometry, posterMaterial);
		roomDecorations.poster.position.set(0, 1, -3.9);
		roomDecorations.poster.visible = false;
		mainGroup.add(roomDecorations.poster);

		// Clock
		const clockGeometry = new THREE.CircleGeometry(0.5, 32);
		const clockMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
		roomDecorations.clock = new THREE.Mesh(clockGeometry, clockMaterial);
		roomDecorations.clock.position.set(3, 2, -3.9);
		roomDecorations.clock.visible = false;
		mainGroup.add(roomDecorations.clock);
	}

	function setupSperm() {
		spermGroup = new THREE.Group();
		spermGroup.visible = false;
		spermGroup.position.y = -0.1;
		cameraGroup.add(spermGroup);
		
		const gltfLoader = new GLTFLoader();

		gltfLoader.load('/sperm.glb', (glb) => {
			const sperm = glb.scene.children[0];
			sperm.rotation.x += Math.PI;
			sperm.position.set(0, 0, 0);
			sperm.scale.set(0.2, 0.2, 0.2);

			sperm.traverse(function (child) {
				if (child.material) {
					child.material = new THREE.MeshToonMaterial({
						color: 0xf0f0f0,
					});
				}
			});

			spermGroup.add(sperm);
		});
	}

	function createAnimations() {
		// Page 1 -> 2: Room construction animation
		tweens['roomConstruction'] = new Tween({ progress: 0 })
			.to({ progress: 1 }, 2000)
			.easing(Easing.Quadratic.Out)
			.onUpdate((coords) => {
				const progress = coords.progress;
				
				// Show room wireframe gradually
				roomWalls.forEach((wall, index) => {
					wall.material.opacity = progress * 0.6;
					wall.scale.setScalar(progress);
				});
				
				roomFloor.material.opacity = progress * 0.6;
				roomFloor.scale.setScalar(progress);
				roomCeiling.material.opacity = progress * 0.6;
				roomCeiling.scale.setScalar(progress);
			})
			.onComplete(() => {
				// Show furniture after wireframe is complete
				Object.values(roomFurniture).forEach(furniture => {
					furniture.visible = true;
					furniture.scale.setScalar(0);
				});
				
				tweens['furnitureAppear'].start();
			});

		// Furniture appearance
		tweens['furnitureAppear'] = new Tween({ scale: 0 })
			.to({ scale: 1 }, 1000)
			.easing(Easing.Back.Out)
			.onUpdate((coords) => {
				Object.values(roomFurniture).forEach(furniture => {
					furniture.scale.setScalar(coords.scale);
				});
			});

		// Page 2 -> 3: Time travel through decades
		tweens['timeTravelRoom'] = new Tween({ decade: 2020 })
			.to({ decade: 1950 }, 2500)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((coords) => {
				const decade = Math.floor(coords.decade / 10) * 10;
				if (decade !== currentDecade) {
					currentDecade = decade;
					updateRoomForDecade(decade);
				}
			})
			.onComplete(() => {
				// Final room decoration
				setTimeout(() => {
					Object.values(roomDecorations).forEach(decoration => {
						decoration.visible = true;
					});
					tweens['decorationAppear'].start();
				}, 500);
			});

		// Decoration appearance
		tweens['decorationAppear'] = new Tween({ scale: 0 })
			.to({ scale: 1 }, 1000)
			.easing(Easing.Elastic.Out)
			.onUpdate((coords) => {
				Object.values(roomDecorations).forEach(decoration => {
					decoration.scale.setScalar(coords.scale);
				});
			});

		// Background color transitions
		tweens['backgroundColorChange'] = new Tween({ r: 35, g: 35, b: 35 })
			.to({ r: 208, g: 208, b: 208 }, 2500)
			.easing(Easing.Quadratic.InOut)
			.onUpdate((color) => {
				const newColor = new THREE.Color(`rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`);
				renderer.setClearColor(newColor);
			});
	}

	function updateRoomForDecade(decade) {
		// Update room colors and styles based on decade
		const decadeStyles = {
			2020: { wallColor: 0xf5f5f5, furnitureColor: 0x8B4513 },
			2010: { wallColor: 0xe8e8e8, furnitureColor: 0x654321 },
			2000: { wallColor: 0xd0d0d0, furnitureColor: 0x8B4513 },
			1990: { wallColor: 0xffb6c1, furnitureColor: 0x800080 },
			1980: { wallColor: 0x00ffff, furnitureColor: 0xff1493 },
			1970: { wallColor: 0xffa500, furnitureColor: 0x8b4513 },
			1960: { wallColor: 0x90ee90, furnitureColor: 0x654321 },
			1950: { wallColor: 0xffd700, furnitureColor: 0x8B4513 }
		};

		const style = decadeStyles[decade] || decadeStyles[2020];
		
		// Update furniture colors
		Object.values(roomFurniture).forEach(furniture => {
			if (furniture.material) {
				furniture.material.color.setHex(style.furnitureColor);
			}
		});

		// Update poster color based on decade
		if (roomDecorations.poster && roomDecorations.poster.material) {
			roomDecorations.poster.material.color.setHex(style.wallColor);
		}
	}

	function renderScene(time) {
		const elapsedTime = clock.getElapsedTime();
		
		// Rotate sperm if visible and loaded
		if (spermGroup && spermGroup.visible && spermGroup.children.length > 0) {
			spermGroup.rotation.z = -elapsedTime * 8;
		}

		// Rotate room slightly for visual interest
		if (mainGroup && mainGroup.visible) {
			mainGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.05;
		}

		renderer.render(scene, camera);
		animationFrameId = requestAnimationFrame(renderScene);

		// Update active tweens
		Object.values(tweens).forEach((tween) => tween.update(time));
	}

	// Scene configuration functions
	function setupScene1() {
		// Boot screen - hide everything
		if (mainGroup) mainGroup.visible = false;
		if (spermGroup) spermGroup.visible = false;
		Object.values(tweens).forEach((tween) => tween.stop());
	}

	function setupScene2() {
		// Room construction + data entry
		if (mainGroup) mainGroup.visible = true;
		if (spermGroup) spermGroup.visible = false;
		tweens['roomConstruction'].start();
	}

	function setupScene3() {
		// Time travel animation
		tweens['timeTravelRoom'].start();
		tweens['backgroundColorChange'].start();
		
		// Auto-progress to results after animation
		setTimeout(() => {
			page.set(4);
		}, 3500);
	}

	function setupScene4() {
		// Results screen - show completed room
		if (spermGroup) spermGroup.visible = false;
		// Room should be fully decorated by now
	}

	// React to page changes
	const sceneConfigs = {
		1: setupScene1,
		2: setupScene2,
		3: setupScene3,
		4: setupScene4,
	};

	$: {
		if (sceneConfigs[$page] && scene) {
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
	}
</style>