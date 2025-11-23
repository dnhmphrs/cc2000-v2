<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	export let scene;
	export let camera;

	let mesh;

	function getPlaneSize(distance) {
		const vFov = (camera.fov * Math.PI) / 180;
		const height = 2 * Math.tan(vFov / 2) * distance;
		const width = height * camera.aspect;
		return { width, height };
	}

	onMount(async () => {
		const vertexShader = await fetch('/shaders/vertex.glsl').then((r) => r.text());
		const fragmentShader = await fetch('/shaders/fragment.glsl').then((r) => r.text());

		const planeZ = -299;
		const distanceFromCamera = camera.position.z - planeZ;
		const { width, height } = getPlaneSize(distanceFromCamera);

		const geometry = new THREE.PlaneGeometry(width, height);
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				u_time: { value: 0.0 },
				u_resolution: {
					value: new THREE.Vector2(window.innerWidth, window.innerHeight)
				}
			}
		});

		mesh = new THREE.Mesh(geometry, material);
		mesh.position.z = planeZ;
		scene.add(mesh);
	});

	export function update(elapsedTime, deltaTime) {
		if (mesh) {
			mesh.material.uniforms.u_time.value = elapsedTime;
		}
	}

	export function onResize(width, height, cam) {
		if (mesh) {
			const planeZ = -299;
			const distanceFromCamera = cam.position.z - planeZ;
			const size = getPlaneSize(distanceFromCamera);

			mesh.geometry.dispose();
			mesh.geometry = new THREE.PlaneGeometry(size.width, size.height);
			mesh.material.uniforms.u_resolution.value.set(width, height);
		}
	}

	onDestroy(() => {
		if (mesh) {
			scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
		}
	});
</script>