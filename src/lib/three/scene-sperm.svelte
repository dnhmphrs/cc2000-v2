<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { Tween, Group as TweenGroup, Easing } from '@tweenjs/tween.js';

	let canvas;
	let renderer;
	let frame;

	const PHI = 1.618339887;
	const IPHI = 1 / PHI;
	const IP2 = IPHI * IPHI;
	const IP3 = IP2 * IPHI;
	const IP4 = IP2 * IP2;

	let CX = IP2 / (1 - IP4);
	let CY = IP3 / (1 - IP4);

	let mouseX = 0;
	let mouseY = 0;

	const PHI4 = PHI ** 4;
	const CYCLE = 24;
	const NUM_LAYERS = 48;
	const SQUARES_PER_LAYER = 24;

	let spermPivot = null;
	let spermMixer = null;
	let tweenGroup = new TweenGroup();

	function buildGeometry() {
		const positions = [];
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

	// Hologram shader material — emissive with scanlines
	function createHologramMaterial() {
		return new THREE.ShaderMaterial({
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			uniforms: {
				uTime: { value: 1.0 },
				uOpacity: { value: 1.5 }
			},
			vertexShader: `
				varying vec3 vWorldPos;
				varying vec3 vNormal;
				varying vec3 vViewDir;
				void main() {
					vec4 worldPos = modelMatrix * vec4(position, 1.0);
					vWorldPos = worldPos.xyz;
					vNormal = normalize(normalMatrix * normal);
					vViewDir = normalize(cameraPosition - worldPos.xyz);
					gl_Position = projectionMatrix * viewMatrix * worldPos;
				}
			`,
			fragmentShader: `
				uniform float uTime;
				uniform float uOpacity;
				varying vec3 vWorldPos;
				varying vec3 vNormal;
				varying vec3 vViewDir;

				void main() {
					// Subtle scanlines
					float scanline = sin(vWorldPos.y * 80.0 + uTime * 2.0) * 0.5 + 0.5;
					scanline = smoothstep(0.4, 0.6, scanline);

					// Fresnel rim
					float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
					fresnel = pow(fresnel, 2.5);

					// White/light grey base
					vec3 color = vec3(0.85, 0.85, 0.85);
					// Slight brightness boost at rim
					color += vec3(0.15) * fresnel;

					// Alpha: mostly see-through, edges brighter
					float alpha = (0.08 + scanline * 0.12 + fresnel * 0.35) * uOpacity;

					gl_FragColor = vec4(color, alpha);
				}
			`
		});
	}

	// Apply hologram material to all meshes
	function makeHologram(object, material) {
		object.traverse((child) => {
			if (child.isMesh) {
				child.material = material;
			}
		});
	}

	// Looping tween rotation in XY plane
	function startRotationTween(pivot) {
		const rotState = { z: 0 };

		function spinOnce() {
			new Tween(rotState, tweenGroup)
				.to({ z: rotState.z - Math.PI * 2 }, 4000)
				.easing(Easing.Linear.None)
				.onUpdate(() => {
					pivot.rotation.z = rotState.z;
				})
				.onComplete(() => {
					spinOnce();
				})
				.start();
		}

		spinOnce();
	}

	// function handleMouseMove(e) {
	// 	mouseX = (e.clientX / window.innerWidth) - 0.5;
	// 	mouseY = (e.clientY / window.innerHeight) - 0.5;
	// }

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setClearColor(0x1b1b1b, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const perspCamera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.01,
			100
		);
		perspCamera.position.z = 2;

		// --- Spiral scene ---
		const spiralScene = new THREE.Scene();
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
			spiralScene.add(mesh);
			layers.push({ mesh, mat });
		}

		// --- Model scene ---
		const modelScene = new THREE.Scene();
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		modelScene.add(ambientLight);

		const holoMaterial = createHologramMaterial();

		const loader = new GLTFLoader();
		loader.load('/sperm.glb', (gltf) => {
			const spermModel = gltf.scene;

			const box = new THREE.Box3().setFromObject(spermModel);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);

			const desiredSize = 1.25;
			const scaleFactor = desiredSize / maxDim;
			spermModel.scale.setScalar(scaleFactor);
			spermModel.position.set(
				-center.x * scaleFactor,
				-center.y * scaleFactor,
				-center.z * scaleFactor
			);

			// Hologram style
			makeHologram(spermModel, holoMaterial);

			spermPivot = new THREE.Group();
			spermPivot.add(spermModel);
			modelScene.add(spermPivot);

			// Face away from camera
			spermModel.rotation.y = -Math.PI;

			// Start tween rotation
			startRotationTween(spermPivot);

			// Play embedded animations
			if (gltf.animations && gltf.animations.length > 0) {
				spermMixer = new THREE.AnimationMixer(spermModel);
				gltf.animations.forEach((clip) => {
					spermMixer.clipAction(clip).play();
				});
			}
		}, undefined, (err) => {
			console.error('Error loading sperm.glb:', err);
		});

		function resize() {
			const w = window.innerWidth;
			const h = window.innerHeight;
			renderer.setSize(w, h);

			const aspect = w / h;
			orthoCamera.left = -aspect / 2;
			orthoCamera.right = aspect / 2;
			orthoCamera.top = 0.5;
			orthoCamera.bottom = -0.5;
			orthoCamera.updateProjectionMatrix();

			perspCamera.aspect = aspect;
			perspCamera.updateProjectionMatrix();
		}

		window.addEventListener('resize', resize);
		// window.addEventListener('mousemove', handleMouseMove);
		resize();

		const clock = new THREE.Clock();

		const animate = (t) => {
			const time = t * 0.001;
			const delta = clock.getDelta();
			const baseT = ((time % CYCLE) / CYCLE);

			// Update tweens
			tweenGroup.update(t);

			// Update hologram time uniform for scanline animation
			holoMaterial.uniforms.uTime.value = time;

			// const activeCX = CX + (mouseX * 0.01);
			// const activeCY = CY - (mouseY * 0.01);

			const activeCX = CX;
			const activeCY = CY;

			for (let n = 0; n < NUM_LAYERS; n++) {
				const life = (baseT + n / NUM_LAYERS) % 1;
				const zoom = PHI4 ** life;
				const fade = Math.min(life / 0.15, (1 - life) / 0.75, 1);

				const { mesh, mat } = layers[n];

				mesh.scale.set(zoom, zoom, 1);

				const rotationFactor = Math.PI * 1 / PHI;
				mesh.rotation.z = life * rotationFactor;

				const cos = Math.cos(mesh.rotation.z);
				const sin = Math.sin(mesh.rotation.z);

				const rotatedCX = activeCX * cos - activeCY * sin;
				const rotatedCY = activeCX * sin + activeCY * cos;

				mesh.position.x = -rotatedCX * zoom;
				mesh.position.y = -rotatedCY * zoom;

				mat.opacity = fade * 0.25;
				const brightness = fade * 0.75;
				mat.color.setRGB(brightness * 0.76, brightness * 0.76, brightness * 0.76 * mesh.rotation.z);
			}

			if (spermMixer) {
				spermMixer.update(delta);
			}

			renderer.autoClear = true;
			renderer.render(spiralScene, orthoCamera);
			renderer.autoClear = false;
			renderer.render(modelScene, perspCamera);

			frame = requestAnimationFrame(animate);
		};

		frame = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		cancelAnimationFrame(frame);
		tweenGroup.removeAll();
		window.removeEventListener('resize', resize);
		// window.removeEventListener('mousemove', handleMouseMove);
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