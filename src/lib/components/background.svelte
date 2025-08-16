<script>
	import { page } from '$lib/store/store';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	
	let THREE;
	let container;
	let scene, camera, renderer, material, mesh;
	let animationId;
	let time = 0;

	// Vertex shader
	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	// Fragment shader with glitch effect
	const fragmentShader = `
		uniform sampler2D uTexture;
		uniform float uTime;
		uniform float uGlitchIntensity;
		uniform float uSettled;
		
		varying vec2 vUv;
		
		// Random function
		float random(vec2 st) {
			return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
		}
		
		// Noise function
		float noise(vec2 st) {
			vec2 i = floor(st);
			vec2 f = fract(st);
			
			float a = random(i);
			float b = random(i + vec2(1.0, 0.0));
			float c = random(i + vec2(0.0, 1.0));
			float d = random(i + vec2(1.0, 1.0));
			
			vec2 u = f * f * (3.0 - 2.0 * f);
			
			return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
		}
		
		void main() {
			vec2 uv = vUv;
			
			// If settled (screen 4), just show the texture normally
			if (uSettled > 0.5) {
				gl_FragColor = texture2D(uTexture, uv);
				return;
			}
			
			// Glitch effect for screens 1-3
			float glitch = step(0.95, random(vec2(uTime * 0.1, 0.0)));
			float noiseValue = noise(vec2(uTime * 10.0, uv.y * 10.0));
			
			// Random horizontal offset
			float offset = (random(vec2(uTime * 0.1, 0.0)) - 0.5) * 0.1 * uGlitchIntensity;
			uv.x += offset * glitch;
			
			// Random vertical slices
			float slice = step(0.98, random(vec2(uTime * 0.05, floor(uv.y * 50.0))));
			uv.x += (random(vec2(uTime * 0.1, floor(uv.y * 20.0))) - 0.5) * 0.05 * slice * uGlitchIntensity;
			
			// Sample texture
			vec4 color = texture2D(uTexture, uv);
			
			// Add noise overlay
			float noiseOverlay = noise(vec2(uTime * 20.0, uv * 100.0));
			color.rgb += (noiseOverlay - 0.5) * 0.1 * uGlitchIntensity;
			
			// Random opacity changes
			float opacity = mix(0.1, 0.3, random(vec2(uTime * 0.2, 0.0)));
			color.a *= opacity;
			
			// Add static lines
			float staticLine = step(0.99, random(vec2(uTime * 0.3, floor(uv.y * 100.0))));
			color.rgb += staticLine * 0.2 * uGlitchIntensity;
			
			gl_FragColor = color;
		}
	`;

	onMount(async () => {
		if (browser) {
			// Dynamically import Three.js only on client side
			THREE = await import('three');
			initThreeJS();
			animate();
		}
		
		return () => {
			if (browser) {
				cleanup();
			}
		};
	});

	onDestroy(() => {
		if (browser) {
			cleanup();
		}
	});

	function initThreeJS() {
		if (!browser || !THREE) return;
		
		// Scene
		scene = new THREE.Scene();
		
		// Camera
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		
		// Renderer
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);
		
		// Load texture
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load('/90s_Illustration.jpg', (texture) => {
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			
			// Material with custom shader
			material = new THREE.ShaderMaterial({
				vertexShader,
				fragmentShader,
				uniforms: {
					uTexture: { value: texture },
					uTime: { value: 0 },
					uGlitchIntensity: { value: 1.0 },
					uSettled: { value: 0.0 }
				},
				transparent: true
			});
			
			// Mesh
			const geometry = new THREE.PlaneGeometry(2, 2);
			mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
		});
		
		// Handle resize
		window.addEventListener('resize', onWindowResize);
	}

	function animate() {
		if (!browser) return;
		
		animationId = requestAnimationFrame(animate);
		
		time += 0.016; // ~60fps
		
		if (material && renderer && scene && camera) {
			material.uniforms.uTime.value = time;
			
			// Update glitch intensity based on current page
			const currentPage = $page;
			if (currentPage >= 1 && currentPage <= 3) {
				material.uniforms.uGlitchIntensity.value = 1.0;
				material.uniforms.uSettled.value = 0.0;
			} else if (currentPage === 4) {
				material.uniforms.uGlitchIntensity.value = 0.0;
				material.uniforms.uSettled.value = 1.0;
			}
			
			renderer.render(scene, camera);
		}
	}

	function onWindowResize() {
		if (!browser || !container || !renderer || !camera) return;
		
		const width = container.clientWidth;
		const height = container.clientHeight;
		
		camera.left = -1;
		camera.right = 1;
		camera.top = 1;
		camera.bottom = -1;
		camera.updateProjectionMatrix();
		
		renderer.setSize(width, height);
	}

	function cleanup() {
		if (!browser) return;
		
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		
		if (renderer) {
			renderer.dispose();
		}
		
		if (material) {
			material.dispose();
		}
		
		window.removeEventListener('resize', onWindowResize);
	}
</script>

<div class="background-container" bind:this={container}>
	<!-- Three.js canvas will be inserted here -->
</div>

<style>
	.background-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		overflow: hidden;
		border-radius: 12px;
	}

	.background-container canvas {
		width: 100% !important;
		height: 100% !important;
		display: block;
	}
</style>
