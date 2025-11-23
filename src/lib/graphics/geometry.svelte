<script>
	import { onMount, onDestroy } from 'svelte';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import * as THREE from 'three';

	let container, pc, id;
	onDestroy(() => cancelAnimationFrame(id));

	// Setting up the scene
	let scene = new THREE.Scene();

	let height = window.innerHeight;
	let width = window.innerWidth;

	// Setting up a camera
	let camera = new THREE.PerspectiveCamera(30, width / height, 0.5, 200);
	camera.position.z = 100;

	// Setting up the renderer. This will be called later to render scene with the camera setup above
	let renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
	renderer.setClearColor(0x232323, 1);

	// Shader plane
	let shaderPlane;

	// Calculate plane size to fill screen at given distance
	function getPlaneSize(camera, distance) {
		const vFov = (camera.fov * Math.PI) / 180;
		const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
		const planeWidthAtDistance = planeHeightAtDistance * camera.aspect;
		return { width: planeWidthAtDistance, height: planeHeightAtDistance };
	}

	onMount(async () => {
		container.appendChild(renderer.domElement);
		renderer.setSize(width, height);

		// Load shaders
		const vertexShader = await fetch('/shaders/vertex.glsl').then(r => r.text());
		const fragmentShader = await fetch('/shaders/fragment.glsl').then(r => r.text());

		// Calculate the size needed for fullscreen plane
		const planeZ = 0;
		const distanceFromCamera = camera.position.z - planeZ;
		const { width: planeWidth, height: planeHeight } = getPlaneSize(camera, distanceFromCamera);

		// Create fullscreen shader plane
		const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
		const shaderMaterial = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				u_time: { value: 0.0 },
				u_resolution: { value: new THREE.Vector2(width, height) }
			}
		});

		shaderPlane = new THREE.Mesh(planeGeometry, shaderMaterial);
		shaderPlane.position.z = planeZ;
		scene.add(shaderPlane);

		setTimeout(() => {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
		}, '1000');
	});

	let controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;
	controls.enableZoom = false;
	controls.minAzimuthAngle = -Math.PI / 4;
	controls.maxAzimuthAngle = (Math.PI * 3) / 4;
	controls.enableDamping = true;
	controls.dampingFactor = 0.07;
	controls.rotateSpeed = 0.05;
	controls.update();

	// ---------------------------------------------------------------------------

	const size = 100;
	const divisions = 10;

	const gridHelper0 = new THREE.GridHelper(size, divisions, 0xf0f0f0, 0xf0f0f0);
	gridHelper0.rotation.x += Math.PI / 2;
	gridHelper0.position.z = 10;
	scene.add(gridHelper0);

	const light = new THREE.HemisphereLight(0xd0d0d0, 0x232323, 1.5);
	scene.add(light);

	// ---------------------------------------------------------------------------

	const clock = new THREE.Clock();
	let previousTime = 0;

	let render = function () {
		renderer.render(scene, camera);
		id = requestAnimationFrame(render);

		const elapsedTime = clock.getElapsedTime();
		const deltaTime = elapsedTime - previousTime;
		previousTime = elapsedTime;

		// Update shader uniform
		if (shaderPlane) {
			shaderPlane.material.uniforms.u_time.value = elapsedTime;
		}
	};

	window.addEventListener(
		'resize',
		function () {
			let height = window.innerHeight;
			let width = window.innerWidth;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
			
			// Update shader plane size and resolution
			if (shaderPlane) {
				const planeZ = -299;
				const distanceFromCamera = camera.position.z - planeZ;
				const { width: planeWidth, height: planeHeight } = getPlaneSize(camera, distanceFromCamera);
				
				shaderPlane.geometry.dispose();
				shaderPlane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
				shaderPlane.material.uniforms.u_resolution.value.set(width, height);
			}
		},
		false
	);

	render();
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
	}
</style>