<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  
	// Single initialization guard
	let isInitialized = false;
  
	// Component state
	let canvasElement;
	let scene, camera, renderer, controls;
	let backgroundMeshes = [];
	let volumeMesh;
	let animationFrameId;
	let textures = {};
  
	// Configuration state
	let animationSpeed = 0.5;
	let cameraAnim = { 
		active: false, 
		start: new THREE.Vector3(), 
		end: new THREE.Vector3(), 
		t: 0 
	};
  
	// UI bindings - Volume controls
	let voxelResolution = 64;
	let volumeOpacity = 0.01;
	let blendMode = 'multiply'; // multiply, average, min, max
	let raySteps = 64;
	let densityThreshold = 0.1;
	let colorIntensity = 1.0;
	let showWireframe = false;
	let cubeSize = 80.0;

	// Blend mode options
	const blendModes = ['multiply', 'average', 'min', 'max', 'additive'];

	function setupCamera() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const aspect = width / height;
		
		camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
		camera.position.set(50, 0, 0);
		camera.lookAt(0, 0, 0);
	}
  
	function setupRenderer() {
		renderer = new THREE.WebGLRenderer({ 
			canvas: canvasElement,
			antialias: true 
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;
	}
  
	function setupControls() {
		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.screenSpacePanning = false;
		controls.minDistance = 1;
		controls.maxDistance = 50;
  
		controls.addEventListener('start', () => {
			cameraAnim.active = false;
		});
	}

	// Volumetric ray marching shader
	const volumetricVertexShader = `
		varying vec3 vOrigin;
		varying vec3 vDirection;
		
		void main() {
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.0));
			vDirection = position - vOrigin;
			gl_Position = projectionMatrix * mvPosition;
		}
	`;

	const volumetricFragmentShader = `
		precision highp float;
		
		uniform sampler2D texPosX;  // +X face (right)
		uniform sampler2D texNegX;  // -X face (left)
		uniform sampler2D texPosY;  // +Y face (top)
		uniform sampler2D texNegY;  // -Y face (bottom)
		uniform sampler2D texPosZ;  // +Z face (front)
		uniform sampler2D texNegZ;  // -Z face (back)
		
		uniform float opacity;
		uniform int blendMode;
		uniform int raySteps;
		uniform float densityThreshold;
		uniform float colorIntensity;
		uniform float cubeSize;
		
		varying vec3 vOrigin;
		varying vec3 vDirection;
		
		// Sample color from cube face based on position
		vec3 sampleFace(sampler2D tex, vec2 uv) {
			return texture2D(tex, uv).rgb;
		}
		
		// Get color contribution from each face for a point inside the cube
		// The further from a face, the less influence it has
		vec3 getVoxelColor(vec3 pos) {
			// Normalize position to 0-1 range within cube
			vec3 normalizedPos = (pos / cubeSize) * 0.5 + 0.5;
			
			// Calculate UV coordinates for each face
			vec2 uvXFaces = normalizedPos.zy; // For +X and -X faces
			vec2 uvYFaces = normalizedPos.xz; // For +Y and -Y faces
			vec2 uvZFaces = normalizedPos.xy; // For +Z and -Z faces
			
			// Sample each face
			vec3 colorPosX = sampleFace(texPosX, uvXFaces);
			vec3 colorNegX = sampleFace(texNegX, vec2(1.0 - uvXFaces.x, uvXFaces.y));
			vec3 colorPosY = sampleFace(texPosY, uvYFaces);
			vec3 colorNegY = sampleFace(texNegY, vec2(uvYFaces.x, 1.0 - uvYFaces.y));
			vec3 colorPosZ = sampleFace(texPosZ, uvZFaces);
			vec3 colorNegZ = sampleFace(texNegZ, vec2(1.0 - uvZFaces.x, uvZFaces.y));
			
			// Calculate weights based on position (distance from each face)
			float weightPosX = normalizedPos.x;
			float weightNegX = 1.0 - normalizedPos.x;
			float weightPosY = normalizedPos.y;
			float weightNegY = 1.0 - normalizedPos.y;
			float weightPosZ = normalizedPos.z;
			float weightNegZ = 1.0 - normalizedPos.z;
			
			vec3 result;
			
			if (blendMode == 0) {
				// Multiply mode - product of all colors weighted by position
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = xContrib * yContrib * zContrib * 4.0; // Boost since multiply darkens
			} else if (blendMode == 1) {
				// Average mode - weighted average of all faces
				float totalWeight = weightPosX + weightNegX + weightPosY + weightNegY + weightPosZ + weightNegZ;
				result = (colorPosX * weightPosX + colorNegX * weightNegX +
						  colorPosY * weightPosY + colorNegY * weightNegY +
						  colorPosZ * weightPosZ + colorNegZ * weightNegZ) / totalWeight;
			} else if (blendMode == 2) {
				// Min mode - darkest contribution from each axis
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = min(min(xContrib, yContrib), zContrib);
			} else if (blendMode == 3) {
				// Max mode - brightest contribution
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = max(max(xContrib, yContrib), zContrib);
			} else {
				// Additive mode
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = (xContrib + yContrib + zContrib) / 3.0;
			}
			
			return result * colorIntensity;
		}
		
		// Ray-box intersection
		vec2 intersectBox(vec3 origin, vec3 dir, vec3 boxMin, vec3 boxMax) {
			vec3 tMin = (boxMin - origin) / dir;
			vec3 tMax = (boxMax - origin) / dir;
			vec3 t1 = min(tMin, tMax);
			vec3 t2 = max(tMin, tMax);
			float tNear = max(max(t1.x, t1.y), t1.z);
			float tFar = min(min(t2.x, t2.y), t2.z);
			return vec2(tNear, tFar);
		}
		
		void main() {
			vec3 rayDir = normalize(vDirection);
			vec3 boxMin = vec3(-cubeSize * 0.5);
			vec3 boxMax = vec3(cubeSize * 0.5);
			
			vec2 bounds = intersectBox(vOrigin, rayDir, boxMin, boxMax);
			
			if (bounds.x > bounds.y) {
				discard;
			}
			
			bounds.x = max(bounds.x, 0.0);
			
			vec3 accumulatedColor = vec3(0.0);
			float accumulatedAlpha = 0.0;
			
			float stepSize = (bounds.y - bounds.x) / float(raySteps);
			
			for (int i = 0; i < 256; i++) {
				if (i >= raySteps) break;
				
				float t = bounds.x + float(i) * stepSize;
				if (t > bounds.y) break;
				
				vec3 pos = vOrigin + rayDir * t;
				vec3 color = getVoxelColor(pos);
				
				// Calculate density based on color luminance
				float density = (color.r + color.g + color.b) / 3.0;
				
				if (density > densityThreshold) {
					float alpha = density * opacity * stepSize * 2.0;
					accumulatedColor += color * alpha * (1.0 - accumulatedAlpha);
					accumulatedAlpha += alpha * (1.0 - accumulatedAlpha);
					
					if (accumulatedAlpha > 0.95) break;
				}
			}
			
			gl_FragColor = vec4(accumulatedColor, accumulatedAlpha);
		}
	`;

	async function setupScene() {
		try {
			const textureLoader = new THREE.TextureLoader();
			
			// Load textures for all 6 faces
			// Using the two images alternating on faces
			const texture90s = await new Promise((resolve, reject) => {
				textureLoader.load('/90s_Illustration.jpg', resolve, undefined, reject);
			});
			
			const texture60s = await new Promise((resolve, reject) => {
				textureLoader.load('/60s_Illustration.jpg', resolve, undefined, reject);
			});

			// Store textures for the volume shader
			textures = {
				posX: texture90s.clone(),
				negX: texture60s.clone(),
				posY: texture90s.clone(),
				negY: texture60s.clone(),
				posZ: texture90s.clone(),
				negZ: texture60s.clone()
			};

			// Set texture wrapping
			Object.values(textures).forEach(tex => {
				tex.wrapS = THREE.ClampToEdgeWrapping;
				tex.wrapT = THREE.ClampToEdgeWrapping;
			});

			const distance = 10;
			
			// Create the 6 background planes (the cube faces)
			const planes = [
				{ 
					position: new THREE.Vector3(distance, 0, 0),
					rotation: new THREE.Euler(0, -Math.PI / 2, 0),
					texture: texture90s
				},
				{ 
					position: new THREE.Vector3(-distance, 0, 0),
					rotation: new THREE.Euler(0, Math.PI / 2, 0),
					texture: texture60s
				},
				{ 
					position: new THREE.Vector3(0, distance, 0),
					rotation: new THREE.Euler(Math.PI / 2, 0, 0),
					texture: texture90s
				},
				{ 
					position: new THREE.Vector3(0, -distance, 0),
					rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
					texture: texture60s
				},
				{ 
					position: new THREE.Vector3(0, 0, distance),
					rotation: new THREE.Euler(0, 0, 0),
					texture: texture90s
				},
				{ 
					position: new THREE.Vector3(0, 0, -distance),
					rotation: new THREE.Euler(0, Math.PI, 0),
					texture: texture60s
				}
			];
			
			backgroundMeshes = [];
			
			planes.forEach((plane) => {
				const geometry = new THREE.PlaneGeometry(20, 20);
				const material = new THREE.MeshBasicMaterial({
					map: plane.texture,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.8
				});
				
				const mesh = new THREE.Mesh(geometry, material);
				mesh.position.copy(plane.position);
				mesh.rotation.copy(plane.rotation);
				
				scene.add(mesh);
				backgroundMeshes.push(mesh);
			});

			// Create the volumetric rendering cube
			createVolumeMesh();
			
		} catch (error) {
			console.error('Error setting up scene:', error);
			scene.background = new THREE.Color(0x000000);
		}
	}

	function createVolumeMesh() {
		if (volumeMesh) {
			scene.remove(volumeMesh);
			volumeMesh.geometry.dispose();
			volumeMesh.material.dispose();
		}

		const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
		
		const material = new THREE.ShaderMaterial({
			vertexShader: volumetricVertexShader,
			fragmentShader: volumetricFragmentShader,
			uniforms: {
				texPosX: { value: textures.posX },
				texNegX: { value: textures.negX },
				texPosY: { value: textures.posY },
				texNegY: { value: textures.negY },
				texPosZ: { value: textures.posZ },
				texNegZ: { value: textures.negZ },
				opacity: { value: volumeOpacity },
				blendMode: { value: blendModes.indexOf(blendMode) },
				raySteps: { value: raySteps },
				densityThreshold: { value: densityThreshold },
				colorIntensity: { value: colorIntensity },
				cubeSize: { value: cubeSize }
			},
			transparent: true,
			side: THREE.BackSide,
			depthWrite: false
		});

		volumeMesh = new THREE.Mesh(geometry, material);
		scene.add(volumeMesh);

		// Add wireframe if enabled
		if (showWireframe) {
			const wireframeGeom = new THREE.WireframeGeometry(geometry);
			const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
			const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
			wireframe.name = 'wireframe';
			volumeMesh.add(wireframe);
		}
	}

	function updateVolumeUniforms() {
		if (volumeMesh && volumeMesh.material.uniforms) {
			volumeMesh.material.uniforms.opacity.value = volumeOpacity;
			volumeMesh.material.uniforms.blendMode.value = blendModes.indexOf(blendMode);
			volumeMesh.material.uniforms.raySteps.value = raySteps;
			volumeMesh.material.uniforms.densityThreshold.value = densityThreshold;
			volumeMesh.material.uniforms.colorIntensity.value = colorIntensity;
			volumeMesh.material.uniforms.cubeSize.value = cubeSize;
		}
	}

	function animateCameraTo(target) {
		cameraAnim.start.copy(camera.position);
		cameraAnim.end.copy(target);
		cameraAnim.t = 0;
		cameraAnim.active = true;
	}
  
	function animate() {
		animationFrameId = requestAnimationFrame(animate);
  
		if (cameraAnim.active) {
			cameraAnim.t += 0.005 * animationSpeed;
			camera.position.lerpVectors(cameraAnim.start, cameraAnim.end, cameraAnim.t);
			camera.lookAt(0, 0, 0);
			if (cameraAnim.t >= 1) cameraAnim.active = false;
		}
	
		controls.update();
		renderer.clear();
		renderer.render(scene, camera);
	}

	function handleResize() {
		const aspect = window.innerWidth / window.innerHeight;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
  
	// UI handlers
	function handleResolutionChange() {
		// Resolution affects ray steps
		raySteps = voxelResolution * 2;
		updateVolumeUniforms();
	}

	function handleOpacityChange() {
		updateVolumeUniforms();
	}

	function handleBlendModeChange() {
		updateVolumeUniforms();
	}

	function handleRayStepsChange() {
		updateVolumeUniforms();
	}

	function handleDensityChange() {
		updateVolumeUniforms();
	}

	function handleIntensityChange() {
		updateVolumeUniforms();
	}

	function handleCubeSizeChange() {
		createVolumeMesh();
	}

	function toggleWireframe() {
		showWireframe = !showWireframe;
		createVolumeMesh();
	}

	function cycleBlendMode() {
		const currentIndex = blendModes.indexOf(blendMode);
		blendMode = blendModes[(currentIndex + 1) % blendModes.length];
		updateVolumeUniforms();
	}
  
	function resetToIso() {
		cameraAnim.active = false;
		const r = camera.position.length();
		const iso = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(r);
		camera.position.copy(iso);
		camera.up.set(0, 0, 1);
		camera.lookAt(0, 0, 0);
		controls.update();
	}
  
	function resetToXY() {
		cameraAnim.active = false;
		animateCameraTo(new THREE.Vector3(0, 0, 20));
	}
  
	function resetToXZ() {
		cameraAnim.active = false;
		animateCameraTo(new THREE.Vector3(0, 20, 0));
	}
  
	onMount(async () => {
		if (isInitialized) {
			console.error('Component already initialized!');
			return;
		}
		
		if (!canvasElement) {
			console.error('Canvas element not available');
			return;
		}
  
		isInitialized = true;
		scene = new THREE.Scene();
  
		setupCamera();
		setupRenderer();
		setupControls();
		await setupScene();
		animate();
  
		window.addEventListener('resize', handleResize);
  
		return () => {
			isInitialized = false;
			window.removeEventListener('resize', handleResize);
			
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			
			backgroundMeshes.forEach(mesh => {
				scene.remove(mesh);
				mesh.geometry.dispose();
				mesh.material.dispose();
			});
			
			if (volumeMesh) {
				scene.remove(volumeMesh);
				volumeMesh.geometry.dispose();
				volumeMesh.material.dispose();
			}
			
			if (renderer) renderer.dispose();
			if (controls) controls.dispose();
		};
	});
</script>
  
<canvas bind:this={canvasElement} class="webgl-canvas"></canvas>

<div class="info-box">
	<p><strong>CONCEPTION CALCULATOR 2000</strong></p>
	<p>Build in progress</p>
</div>

<div class="ui-panel">
	<div class="row">
		Resolution:
		<input 
			type="range" 
			bind:value={voxelResolution} 
			on:input={handleResolutionChange}
			min="8" 
			max="128" 
			step="8"
		/>
		<span>{voxelResolution}</span>
	</div>

	<div class="row">
		Ray Steps:
		<input 
			type="range" 
			bind:value={raySteps} 
			on:input={handleRayStepsChange}
			min="16" 
			max="256" 
			step="16"
		/>
		<span>{raySteps}</span>
	</div>

	<div class="row">
		Opacity:
		<input 
			type="range" 
			bind:value={volumeOpacity} 
			on:input={handleOpacityChange}
			min="0.01" 
			max="1.0" 
			step="0.01"
		/>
		<span>{volumeOpacity.toFixed(2)}</span>
	</div>

	<div class="row">
		Density:
		<input 
			type="range" 
			bind:value={densityThreshold} 
			on:input={handleDensityChange}
			min="0.0" 
			max="0.5" 
			step="0.01"
		/>
		<span>{densityThreshold.toFixed(2)}</span>
	</div>

	<div class="row">
		Intensity:
		<input 
			type="range" 
			bind:value={colorIntensity} 
			on:input={handleIntensityChange}
			min="0.1" 
			max="3.0" 
			step="0.1"
		/>
		<span>{colorIntensity.toFixed(1)}</span>
	</div>

	<div class="row">
		Cube Size:
		<input 
			type="range" 
			bind:value={cubeSize} 
			on:input={handleCubeSizeChange}
			min="1" 
			max="100" 
			step="1"
		/>
		<span>{cubeSize.toFixed(1)}</span>
	</div>

	<div class="row">
		<button on:click={cycleBlendMode}>
			Blend: {blendMode}
		</button>
		<button on:click={toggleWireframe}>
			{showWireframe ? 'Hide' : 'Show'} Wire
		</button>
	</div>

	<div class="row">
		<button on:click={resetToIso}>Iso</button>
		<button on:click={resetToXY}>Front</button>
		<button on:click={resetToXZ}>Top</button>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background: black;
		font-family: "Courier New", monospace;
		font-size: 12px;
	}

	.webgl-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: block;
	}

	.info-box {
		position: fixed;
		top: 20px;
		left: 20px;
		background: rgba(0, 0, 0, 0.65);
		color: white;
		font-size: 12px;
		padding: 10px 12px;
		border-radius: 6px;
		max-width: 260px;
		pointer-events: none;
		line-height: 1.35em;
		z-index: 100;
	}

	.info-box p {
		margin: 0 0 0.5em 0;
	}

	.info-box p:last-child {
		margin-bottom: 0;
	}

	.ui-panel {
		position: fixed;
		top: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		z-index: 100;
	}

	.row {
		background: rgba(0, 0, 0, 0.7);
		padding: 10px;
		border-radius: 4px;
		color: white;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	button {
		padding: 6px 10px;
		background: rgba(40, 40, 40, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.25);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		transition: 0.2s;
	}

	button:hover {
		background: rgba(70, 70, 70, 0.9);
		border-color: rgba(255, 255, 255, 0.5);
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 120px;
		background: transparent;
	}

	input[type="range"]::-webkit-slider-runnable-track {
		height: 2px;
		background: rgba(255, 255, 255, 0.35);
		border-radius: 2px;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 10px;
		width: 10px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		margin-top: -4px;
		box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
	}

	input[type="range"]::-moz-range-track {
		height: 2px;
		background: rgba(255, 255, 255, 0.35);
		border-radius: 2px;
	}

	input[type="range"]::-moz-range-thumb {
		height: 10px;
		width: 10px;
		border-radius: 50%;
		background: white;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
	}

	input[type="range"]:focus {
		outline: none;
	}
</style>