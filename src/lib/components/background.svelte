<script>
	// Subscribes to the `page` store explicitly and uses a robust WebGL setup.
	import { page } from '$lib/store/store';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import * as THREE from 'three';

	let container;
	let animationFrameId;
	let scene, camera, renderer, material, mesh;
	let clock;
	let textureLoaded = false;

	let currentPage = 1;
	let unsubscribePage = null;

	onMount(() => {
		if (!browser) return;
		
		// Check WebGL support
		if (!checkWebGLSupport()) {
			console.error('WebGL not supported');
			return;
		}
		
		unsubscribePage = page.subscribe((v) => (currentPage = Number(v) || 1));
		initializeScene();
	});

	onDestroy(() => {
		if (browser) {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			window.removeEventListener('resize', handleWindowResize);
			if (renderer) {
				renderer.dispose();
				const canvas = renderer.domElement;
				if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
			}
		}
		if (unsubscribePage) unsubscribePage();
	});

	function checkWebGLSupport() {
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) {
				console.error('WebGL not supported');
				return false;
			}
			
			console.log('WebGL context created successfully');
			console.log('WebGL version:', gl.getParameter(gl.VERSION));
			console.log('WebGL vendor:', gl.getParameter(gl.VENDOR));
			console.log('WebGL renderer:', gl.getParameter(gl.RENDERER));
			
			// Check for high precision support
			const highpSupported = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
			if (!highpSupported || highpSupported.precision === 0) {
				console.warn('High precision not supported, using medium precision');
			}
			
			// Check for medium precision support
			const mediumpSupported = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
			if (!mediumpSupported || mediumpSupported.precision === 0) {
				console.warn('Medium precision not supported, using low precision');
			}
			
			return true;
		} catch (e) {
			console.error('WebGL check failed:', e);
			return false;
		}
	}

	function testShaderCompilation(gl, vertexSource, fragmentSource) {
		try {
			// Create and compile vertex shader
			const vertexShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertexShader, vertexSource);
			gl.compileShader(vertexShader);
			
			if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
				const error = gl.getShaderInfoLog(vertexShader);
				console.error('Vertex shader compilation failed:', error);
				gl.deleteShader(vertexShader);
				return false;
			}
			console.log('Vertex shader compiled successfully');
			
			// Create and compile fragment shader
			const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragmentShader, fragmentSource);
			gl.compileShader(fragmentShader);
			
			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				const error = gl.getShaderInfoLog(fragmentShader);
				console.error('Fragment shader compilation failed:', error);
				console.error('Fragment shader source:', fragmentSource);
				gl.deleteShader(vertexShader);
				gl.deleteShader(fragmentShader);
				return false;
			}
			console.log('Fragment shader compiled successfully');
			
			// Create program and link
			const program = gl.createProgram();
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);
			
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				const error = gl.getProgramInfoLog(program);
				console.error('Program linking failed:', error);
				gl.deleteShader(vertexShader);
				gl.deleteShader(fragmentShader);
				gl.deleteProgram(program);
				return false;
			}
			console.log('Program linked successfully');
			
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteProgram(program);
			
			console.log('Shader compilation test passed');
			return true;
		} catch (e) {
			console.error('Shader compilation test failed:', e);
			return false;
		}
	}

	function initializeScene() {
		if (!browser || !container) return;

		try {
			scene = new THREE.Scene();
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			renderer = new THREE.WebGLRenderer({ 
				antialias: false, 
				alpha: true,
				powerPreference: "high-performance"
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			renderer.setSize(container.clientWidth, container.clientHeight);
			renderer.setClearColor(0x000000, 0); // fully transparent
			container.appendChild(renderer.domElement);

			clock = new THREE.Clock();

			window.addEventListener('resize', handleWindowResize);

			// Create material first with a placeholder texture
			createMaterial();
			
			// Load texture
			loadTexture();
		} catch (e) {
			console.error('Scene initialization failed:', e);
		}
	}

	function createMaterial() {
		try {
			// Create a placeholder texture
			const placeholderTexture = new THREE.DataTexture(
				new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat
			);
			placeholderTexture.needsUpdate = true;

			// Try the complex shader first, fallback to simple if it fails
			let vertexShader, fragmentShader;
			
			const complexVertexShader = `
				precision mediump float;
				precision mediump int;

				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`;
			
			const complexFragmentShader = `
				precision mediump float;
				precision mediump int;

				uniform sampler2D uTexture;
				uniform float uTime;
				uniform float uSettled;

				// Controls
				uniform float uRevealDensity;   // fraction of screen revealed (0..1)
				uniform float uFragmentScale;   // size of revealed blobs
				uniform float uSoftness;        // edge softness
				uniform float uGrainAmount;     // subtle grain amount
				uniform float uDriftSpeed;      // fragment wandering speed

				varying vec2 vUv;

				float hash(vec2 p){ 
					p = 50.0 * fract(p*0.3183099 + vec2(0.71, 0.113));
					return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
				}

				float noise(vec2 p){
					vec2 i = floor(p);
					vec2 f = fract(p);
					vec2 u = f*f*(3.0 - 2.0*f);
					float a = hash(i + vec2(0.0, 0.0));
					float b = hash(i + vec2(1.0, 0.0));
					float c = hash(i + vec2(0.0, 1.0));
					float d = hash(i + vec2(1.0, 1.0));
					return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.5 + 0.5;
				}

				float fbm(vec2 p){
					float v = 0.0;
					float a = 0.5;
					mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
					for (int i = 0; i < 5; i++) {
						v += a * noise(p);
						p = m * p;
						a *= 0.5;
					}
					return v;
				}

				void main() {
					vec2 uv = vUv;

					// If settled, show full image
					if (uSettled > 0.5) {
						gl_FragColor = texture2D(uTexture, uv);
						return;
					}

					// Gentle drift so fragments wander slowly
					vec2 drift = vec2(0.0, uTime * uDriftSpeed);
					float field = fbm(uv * uFragmentScale + drift);

					// Threshold into fragments; softness feathers the edges
					float t = 1.0 - uRevealDensity;
					float mask = smoothstep(t - uSoftness, t + uSoftness, field);

					// Subtle flicker to read as static (kept very gentle)
					float flicker = noise(vec2(uv.x * 220.0, uTime * 8.0))
					              * noise(vec2(uv.y * 240.0, uTime * 6.0));
					flicker = mix(0.9, 1.0, flicker);

					// Very slight horizontal micro-jitter (sub-pixel)
					float jitter = (noise(vec2(uTime * 0.7, uv.y * 30.0)) - 0.5) * 0.002;
					vec2 sampleUv = uv + vec2(jitter, 0.0);

					// Base texture
					vec4 tex = texture2D(uTexture, sampleUv);

					// Grain inside revealed areas only
					float grain = (noise(uv * 900.0 + vec2(uTime * 30.0, uTime * 29.0)) - 0.5) * uGrainAmount;
					tex.rgb += grain * mask;

					// Mostly transparent; fragments fade in softly
					tex.a = clamp(mask * flicker, 0.0, 1.0);

					gl_FragColor = tex;
				}
			`;
			
			// Simple fallback shader
			const simpleVertexShader = `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`;
			
			const simpleFragmentShader = `
				uniform sampler2D uTexture;
				uniform float uTime;
				uniform float uSettled;
				varying vec2 vUv;
				
				void main() {
					vec2 uv = vUv;
					vec4 tex = texture2D(uTexture, uv);
					
					if (uSettled > 0.5) {
						gl_FragColor = tex;
					} else {
						// Simple animated mask
						float mask = sin(uv.x * 10.0 + uTime) * sin(uv.y * 10.0 + uTime) * 0.5 + 0.5;
						tex.a = mask * 0.3;
						gl_FragColor = tex;
					}
				}
			`;

			// Try to create complex shader material first
			try {
				const complexMaterial = new THREE.ShaderMaterial({
					vertexShader: complexVertexShader,
					fragmentShader: complexFragmentShader,
					uniforms: {
						uTexture: { value: placeholderTexture },
						uTime: { value: 0 },
						uSettled: { value: 0.0 },
						uRevealDensity: { value: 0.08 },
						uFragmentScale: { value: 4.0 },
						uSoftness: { value: 0.12 },
						uGrainAmount: { value: 0.03 },
						uDriftSpeed: { value: 0.08 }
					},
					transparent: true,
					depthWrite: false
				});
				
				// Test if the material compiles by trying to use it
				const testGeometry = new THREE.PlaneGeometry(1, 1);
				const testMesh = new THREE.Mesh(testGeometry, complexMaterial);
				
				vertexShader = complexVertexShader;
				fragmentShader = complexFragmentShader;
				material = complexMaterial;
				console.log('Complex shader material created successfully');
			} catch (e) {
				console.warn('Complex shader failed, using simple shader:', e);
				vertexShader = simpleVertexShader;
				fragmentShader = simpleFragmentShader;
				
				material = new THREE.ShaderMaterial({
					vertexShader,
					fragmentShader,
					uniforms: {
						uTexture: { value: placeholderTexture },
						uTime: { value: 0 },
						uSettled: { value: 0.0 }
					},
					transparent: true,
					depthWrite: false
				});
				console.log('Simple shader material created successfully');
			}

			// Create geometry and mesh
			const geometry = new THREE.PlaneGeometry(2, 2);
			mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);

			console.log('Material created successfully');
			
			// Start rendering
			renderScene();
		} catch (e) {
			console.error('Material creation failed:', e);
		}
	}

	function loadTexture() {
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load(
			'/90s_Illustration.jpg',
			(texture) => {
				console.log('Texture loaded successfully');
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.needsUpdate = true;
				
				if (material) {
					material.uniforms.uTexture.value = texture;
					textureLoaded = true;
				}
			},
			(progress) => {
				console.log('Texture loading progress:', progress);
			},
			(err) => {
				console.error('Texture load failed:', err);
			}
		);
	}

	function handleWindowResize() {
		if (!browser || !container || !renderer || !camera) return;
		renderer.setSize(container.clientWidth, container.clientHeight, false);
		camera.updateProjectionMatrix();
	}

	function renderScene() {
		if (!browser) return;
		
		try {
			const elapsedTime = clock.getElapsedTime();
			updateScene(elapsedTime);
			if (scene && camera && renderer) {
				renderer.render(scene, camera);
			}
			animationFrameId = requestAnimationFrame(renderScene);
		} catch (e) {
			console.error('Render error:', e);
		}
	}

	function updateScene(elapsedTime) {
		if (!material) return;

		// Handle shader material
		if (material.uniforms) {
			material.uniforms.uTime.value = elapsedTime;

			// Pages 1–3: "tuning" fragments; Page 4: settled full image
			if (currentPage >= 1 && currentPage <= 3) {
				material.uniforms.uSettled.value = 0.0;

				// Optionally vary density across pages (p1 sparse → p3 less sparse)
				const base = 0.06, step = 0.02;
				const idx = Math.min(2, Math.max(0, currentPage - 1));
				const newDensity = base + idx * step; // 6%, 8%, 10%
				
				// Only update if changed to avoid unnecessary updates
				if (material.uniforms.uRevealDensity.value !== newDensity) {
					material.uniforms.uRevealDensity.value = newDensity;
					console.log(`Page ${currentPage}: Updated uRevealDensity to ${newDensity}`);
				}

				// Keep other params steady (tweak here if desired)
				material.uniforms.uSoftness.value = 0.12;
				material.uniforms.uDriftSpeed.value = 0.08;
				material.uniforms.uGrainAmount.value = 0.03;
				// Make fragments much larger for testing
				material.uniforms.uFragmentScale.value = 1.0; // Changed from 4.0 to 1.0 for larger fragments
			} else if (currentPage === 4) {
				if (material.uniforms.uSettled.value !== 1.0) {
					material.uniforms.uSettled.value = 1.0;
					console.log('Page 4: Settled to full image');
				}
			} else {
				if (material.uniforms.uSettled.value !== 0.0) {
					material.uniforms.uSettled.value = 0.0;
					console.log(`Page ${currentPage}: Reset to unsettled`);
				}
			}
			
			// Debug: log current uniform values every 5 seconds
			if (Math.floor(elapsedTime) % 5 === 0 && Math.floor(elapsedTime) !== Math.floor((elapsedTime - 0.016) || 0)) {
				console.log('Current uniforms:', {
					uTime: material.uniforms.uTime.value.toFixed(2),
					uSettled: material.uniforms.uSettled.value,
					uRevealDensity: material.uniforms.uRevealDensity.value,
					uFragmentScale: material.uniforms.uFragmentScale.value,
					uSoftness: material.uniforms.uSoftness.value,
					uDriftSpeed: material.uniforms.uDriftSpeed.value,
					uGrainAmount: material.uniforms.uGrainAmount.value
				});
			}
			
			// Test: Make the effect very obvious for debugging
			// This will make the fragments much larger and more visible
			if (elapsedTime < 10) { // Only for first 10 seconds
				material.uniforms.uRevealDensity.value = 0.2; // 50% revealed
				material.uniforms.uFragmentScale.value = 0.5; // Very large fragments
				material.uniforms.uSoftness.value = 0.1; // Very soft edges
			}
		} else {
			// Handle fallback material (MeshBasicMaterial)
			console.log('Using fallback material - no shader effects available');
		}
	}
</script>

<div bind:this={container} class="background-container" />

<style>
	.background-container {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
	}
	.background-container canvas {
		width: 100% !important;
		height: 100% !important;
		display: block;
	}
</style>
