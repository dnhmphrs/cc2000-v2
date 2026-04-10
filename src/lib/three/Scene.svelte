<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	let canvas;
	let renderer, scene, camera;
	let frame;

	const PHI = 1.618339887;
	const IPHI = 1 / PHI;
	const IP2 = IPHI * IPHI;
	const IP3 = IP2 * IPHI;
	const IP4 = IP2 * IP2;
	
	// These are now our base offsets
	let CX = IP2 / (1 - IP4);
	let CY = IP3 / (1 - IP4);

	const PHI4 = PHI ** 4;
	const CYCLE = 24;
	const NUM_LAYERS = 48; 
	const SQUARES_PER_LAYER = 24;

	function buildGeometry() {
		const positions = [];
		// We no longer subtract CX/CY here so we can move the group dynamically
		function line(x1, y1, x2, y2) {
			positions.push(x1, y1, 0, x2, y2, 0);
		}

		function rect(L, B, R, T) {
			line(L, B, R, B);
			line(R, B, R, T);
			line(R, T, L, T);
			line(L, T, L, B);
		}

		function arc(cx, cy, r, startAngle, segments = 32) {
			const step = (Math.PI / 2) / segments;
			for (let i = 0; i < segments; i++) {
				const a0 = startAngle + step * i;
				const a1 = startAngle + step * (i + 1);
				positions.push(
					cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, 0,
					cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, 0
				);
			}
		}

		let L = 0, B = 0, R = PHI, T = 1;
		rect(L, B, R, T);

		for (let i = 0; i < SQUARES_PER_LAYER; i++) {
			const w = R - L, h = T - B;
			let s, acx, acy, startAngle;
			const side = i % 4;

			if (side === 0) {
				s = h; R -= s;
				acx = R; acy = B; startAngle = 0;
			} else if (side === 1) {
				s = w; T -= s;
				acx = R; acy = T; startAngle = Math.PI / 2;
			} else if (side === 2) {
				s = h; L += s;
				acx = L; acy = T; startAngle = Math.PI;
			} else {
				s = w; B += s;
				acx = L; acy = B; startAngle = Math.PI * 1.5;
			}

			rect(L, B, R, T);
			arc(acx, acy, s, startAngle);
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		return geo;
	}

	function handleMouseMove(e) {
		// Map mouse to -0.5 to 0.5 range
		mouseX = (e.clientX / window.innerWidth) - 0.5;
		mouseY = (e.clientY / window.innerHeight) - 0.5;
	}

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setClearColor(0x1b1b1b, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const geo = buildGeometry();
		const layers = [];
		for (let i = 0; i < NUM_LAYERS; i++) {
			const mat = new THREE.LineBasicMaterial({
				color: new THREE.Color(1, 0.76, 0.2),
				transparent: true,
				opacity: 0,
				depthTest: false
			});
			const mesh = new THREE.LineSegments(geo, mat);
			scene.add(mesh);
			layers.push({ mesh, mat });
		}

		function resize() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			renderer.setSize(w, h);
			const aspect = w / h;
			camera.left = -aspect / 2;
			camera.right = aspect / 2;
			camera.top = 0.5;
			camera.bottom = -0.5;
			camera.updateProjectionMatrix();
		}

		window.addEventListener('resize', resize);
		resize();

const animate = (t) => {
    const time = t * 0.001;
    const baseT = ((time % CYCLE) / CYCLE);

    const activeCX = CX;
    const activeCY = CY;

    for (let n = 0; n < NUM_LAYERS; n++) {
        // life goes from 0 to 1
        const life = (baseT + n / NUM_LAYERS) % 1;
        const zoom = PHI4 ** life;
        const fade = Math.min(life / 0.15, (1 - life) / 0.75, 1);

        const { mesh, mat } = layers[n];
        
        // 1. Apply Scale
        mesh.scale.set(zoom, zoom, 1);

        // 2. Apply Rotation
        // Math.PI * 2 would be one full rotation over the lifecycle of the zoom
        const rotationFactor = Math.PI * 1 / PHI; 
        mesh.rotation.z = life * rotationFactor;
        
        // 3. Position Adjustment
        // Because the mesh is rotating, we need to rotate the "pivot offset" 
        const cos = Math.cos(mesh.rotation.z);
        const sin = Math.sin(mesh.rotation.z);
        
        // Rotate the CX/CY offset point by the same amount as the mesh
        const rotatedCX = activeCX * cos - activeCY * sin;
        const rotatedCY = activeCX * sin + activeCY * cos;

        mesh.position.x = -rotatedCX * zoom;
        mesh.position.y = -rotatedCY * zoom;

        mat.opacity = fade * 0.25;
        const brightness = fade * 0.75;
        mat.color.setRGB(brightness * 0.76 , brightness * 0.76 , brightness * 0.76 * mesh.rotation.z);
    }

    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
};

		frame = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		cancelAnimationFrame(frame);
		window.removeEventListener('resize', resize);
		renderer?.dispose();
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
	}
</style>