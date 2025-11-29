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
	let loadedTextures = { tex90s: null, tex60s: null };
	let clock;
  
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
	let blendMode = 'multiply';
	let raySteps = 64;
	let densityThreshold = 0.1;
	let colorIntensity = 1.0;
	let showWireframe = false;
	let cubeSize = 100.0;

	// New controls
	let panelDistance = 30;
	let panelOpacity = 0.8;

	// Effects controls
	let effectMode = 'none'; // none, pulse, rotate, breathe, warp, spiral
	let effectSpeed = 1.0;
	let effectIntensity = 0.5;

	const effectModes = ['none', 'pulse', 'rotate', 'breathe', 'warp', 'spiral', 'kaleidoscope'];
	const blendModes = ['multiply', 'average', 'min', 'max', 'additive'];

	// Face names for rotation
	const faces = [
		{ name: '+X', position: () => new THREE.Vector3(panelDistance * 2, 0, 0) },
		{ name: '-X', position: () => new THREE.Vector3(-panelDistance * 2, 0, 0) },
		{ name: '+Y', position: () => new THREE.Vector3(0, panelDistance * 2, 0) },
		{ name: '-Y', position: () => new THREE.Vector3(0, -panelDistance * 2, 0) },
		{ name: '+Z', position: () => new THREE.Vector3(0, 0, panelDistance * 2) },
		{ name: '-Z', position: () => new THREE.Vector3(0, 0, -panelDistance * 2) },
		{ name: 'Iso', position: () => new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(panelDistance * 2.5) }
	];

	function setupCamera() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const aspect = width / height;
		
		camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
		camera.position.set(75, 0, 0);
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
		controls.maxDistance = 150;
  
		controls.addEventListener('start', () => {
			cameraAnim.active = false;
		});
	}

	// Volumetric ray marching shader with effects
	const volumetricVertexShader = `
		varying vec3 vOrigin;
		varying vec3 vDirection;
		varying vec3 vWorldPosition;
		
		void main() {
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.0));
			vDirection = position - vOrigin;
			vWorldPosition = position;
			gl_Position = projectionMatrix * mvPosition;
		}
	`;

	const volumetricFragmentShader = `
		precision highp float;
		
		uniform sampler2D texPosX;
		uniform sampler2D texNegX;
		uniform sampler2D texPosY;
		uniform sampler2D texNegY;
		uniform sampler2D texPosZ;
		uniform sampler2D texNegZ;
		
		uniform float opacity;
		uniform int blendMode;
		uniform int raySteps;
		uniform float densityThreshold;
		uniform float colorIntensity;
		uniform float cubeSize;
		
		// Effect uniforms
		uniform float time;
		uniform int effectMode;
		uniform float effectSpeed;
		uniform float effectIntensity;
		
		varying vec3 vOrigin;
		varying vec3 vDirection;
		varying vec3 vWorldPosition;
		
		#define PI 3.14159265359
		
		vec3 sampleFace(sampler2D tex, vec2 uv) {
			return texture2D(tex, uv).rgb;
		}
		
		// Rotate 2D coordinates
		vec2 rotate2D(vec2 p, float angle) {
			float s = sin(angle);
			float c = cos(angle);
			return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
		}
		
		// Apply effect transformations to position
		vec3 applyEffect(vec3 pos, float t) {
			vec3 result = pos;
			float intensity = effectIntensity;
			float speed = effectSpeed;
			
			if (effectMode == 1) {
				// Pulse - radial scaling
				float pulse = 1.0 + sin(t * speed * 2.0) * intensity * 0.3;
				result *= pulse;
			} else if (effectMode == 2) {
				// Rotate - continuous rotation around Y axis
				float angle = t * speed * 0.5;
				result.xz = rotate2D(result.xz, angle);
			} else if (effectMode == 3) {
				// Breathe - sinusoidal displacement
				float breathe = sin(t * speed) * intensity;
				float dist = length(pos) / cubeSize;
				result += normalize(pos + 0.001) * breathe * dist * 5.0;
			} else if (effectMode == 4) {
				// Warp - wave distortion
				result.x += sin(pos.y * 0.1 + t * speed) * intensity * 3.0;
				result.y += sin(pos.z * 0.1 + t * speed * 1.1) * intensity * 3.0;
				result.z += sin(pos.x * 0.1 + t * speed * 0.9) * intensity * 3.0;
			} else if (effectMode == 5) {
				// Spiral - helical motion
				float dist = length(pos.xz);
				float angle = t * speed + dist * 0.05 * intensity;
				result.xz = rotate2D(result.xz, angle * 0.3);
				result.y += sin(dist * 0.1 - t * speed) * intensity * 2.0;
			} else if (effectMode == 6) {
				// Kaleidoscope - angular repetition
				float angle = atan(pos.z, pos.x);
				float segments = 6.0;
				float segmentAngle = PI * 2.0 / segments;
				angle = mod(angle + t * speed * 0.2, segmentAngle);
				if (mod(floor((atan(pos.z, pos.x) + t * speed * 0.2) / segmentAngle), 2.0) > 0.5) {
					angle = segmentAngle - angle;
				}
				float dist = length(pos.xz);
				result.x = cos(angle) * dist;
				result.z = sin(angle) * dist;
			}
			
			return result;
		}
		
		vec3 getVoxelColor(vec3 pos, float t) {
			// Apply effect to position
			vec3 effectPos = applyEffect(pos, t);
			
			// Normalize position to 0-1 range within cube
			vec3 normalizedPos = (effectPos / cubeSize) * 0.5 + 0.5;
			normalizedPos = clamp(normalizedPos, 0.0, 1.0);
			
			vec2 uvXFaces = normalizedPos.zy;
			vec2 uvYFaces = normalizedPos.xz;
			vec2 uvZFaces = normalizedPos.xy;
			
			vec3 colorPosX = sampleFace(texPosX, uvXFaces);
			vec3 colorNegX = sampleFace(texNegX, vec2(1.0 - uvXFaces.x, uvXFaces.y));
			vec3 colorPosY = sampleFace(texPosY, uvYFaces);
			vec3 colorNegY = sampleFace(texNegY, vec2(uvYFaces.x, 1.0 - uvYFaces.y));
			vec3 colorPosZ = sampleFace(texPosZ, uvZFaces);
			vec3 colorNegZ = sampleFace(texNegZ, vec2(1.0 - uvZFaces.x, uvZFaces.y));
			
			float weightPosX = normalizedPos.x;
			float weightNegX = 1.0 - normalizedPos.x;
			float weightPosY = normalizedPos.y;
			float weightNegY = 1.0 - normalizedPos.y;
			float weightPosZ = normalizedPos.z;
			float weightNegZ = 1.0 - normalizedPos.z;
			
			vec3 result;
			
			if (blendMode == 0) {
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = xContrib * yContrib * zContrib * 4.0;
			} else if (blendMode == 1) {
				float totalWeight = weightPosX + weightNegX + weightPosY + weightNegY + weightPosZ + weightNegZ;
				result = (colorPosX * weightPosX + colorNegX * weightNegX +
						  colorPosY * weightPosY + colorNegY * weightNegY +
						  colorPosZ * weightPosZ + colorNegZ * weightNegZ) / totalWeight;
			} else if (blendMode == 2) {
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = min(min(xContrib, yContrib), zContrib);
			} else if (blendMode == 3) {
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = max(max(xContrib, yContrib), zContrib);
			} else {
				vec3 xContrib = mix(colorNegX, colorPosX, normalizedPos.x);
				vec3 yContrib = mix(colorNegY, colorPosY, normalizedPos.y);
				vec3 zContrib = mix(colorNegZ, colorPosZ, normalizedPos.z);
				result = (xContrib + yContrib + zContrib) / 3.0;
			}
			
			// Add time-based color shift for pulse effect
			if (effectMode == 1) {
				float hueShift = sin(t * effectSpeed) * effectIntensity * 0.1;
				result = result + vec3(hueShift, -hueShift * 0.5, hueShift * 0.3);
			}
			
			return result * colorIntensity;
		}
		
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
				vec3 color = getVoxelColor(pos, time);
				
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
			
			const texture90s = await new Promise((resolve, reject) => {
				textureLoader.load('/90s_Illustration.jpg', resolve, undefined, reject);
			});
			
			const texture60s = await new Promise((resolve, reject) => {
				textureLoader.load('/60s_Illustration.jpg', resolve, undefined, reject);
			});

			// Store for later use
			loadedTextures.tex90s = texture90s;
			loadedTextures.tex60s = texture60s;

			textures = {
				posX: texture90s.clone(),
				negX: texture60s.clone(),
				posY: texture90s.clone(),
				negY: texture60s.clone(),
				posZ: texture90s.clone(),
				negZ: texture60s.clone()
			};

			Object.values(textures).forEach(tex => {
				tex.wrapS = THREE.ClampToEdgeWrapping;
				tex.wrapT = THREE.ClampToEdgeWrapping;
			});

			createBackgroundPanels();
			createVolumeMesh();
			
		} catch (error) {
			console.error('Error setting up scene:', error);
			scene.background = new THREE.Color(0x000000);
		}
	}

	// Fixed panel size - they just move apart
	const PANEL_SIZE = 40;

	function createBackgroundPanels() {
		// Clear existing panels
		backgroundMeshes.forEach(mesh => {
			scene.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
		});
		backgroundMeshes = [];

		if (!loadedTextures.tex90s || !loadedTextures.tex60s) return;

		const planes = [
			{ 
				position: new THREE.Vector3(panelDistance, 0, 0),
				rotation: new THREE.Euler(0, -Math.PI / 2, 0),
				texture: loadedTextures.tex90s
			},
			{ 
				position: new THREE.Vector3(-panelDistance, 0, 0),
				rotation: new THREE.Euler(0, Math.PI / 2, 0),
				texture: loadedTextures.tex60s
			},
			{ 
				position: new THREE.Vector3(0, panelDistance, 0),
				rotation: new THREE.Euler(Math.PI / 2, 0, 0),
				texture: loadedTextures.tex90s
			},
			{ 
				position: new THREE.Vector3(0, -panelDistance, 0),
				rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
				texture: loadedTextures.tex60s
			},
			{ 
				position: new THREE.Vector3(0, 0, panelDistance),
				rotation: new THREE.Euler(0, 0, 0),
				texture: loadedTextures.tex90s
			},
			{ 
				position: new THREE.Vector3(0, 0, -panelDistance),
				rotation: new THREE.Euler(0, Math.PI, 0),
				texture: loadedTextures.tex60s
			}
		];
		
		planes.forEach((plane) => {
			const geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
			const material = new THREE.MeshBasicMaterial({
				map: plane.texture,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: panelOpacity
			});
			
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.copy(plane.position);
			mesh.rotation.copy(plane.rotation);
			
			scene.add(mesh);
			backgroundMeshes.push(mesh);
		});
	}

	function updatePanels() {
		if (backgroundMeshes.length === 0) {
			createBackgroundPanels();
			return;
		}

		const positions = [
			new THREE.Vector3(panelDistance, 0, 0),
			new THREE.Vector3(-panelDistance, 0, 0),
			new THREE.Vector3(0, panelDistance, 0),
			new THREE.Vector3(0, -panelDistance, 0),
			new THREE.Vector3(0, 0, panelDistance),
			new THREE.Vector3(0, 0, -panelDistance)
		];

		backgroundMeshes.forEach((mesh, i) => {
			mesh.position.copy(positions[i]);
			mesh.material.opacity = panelOpacity;
			mesh.material.transparent = true;
		});
	}

	function createVolumeMesh() {
		if (volumeMesh) {
			scene.remove(volumeMesh);
			volumeMesh.geometry.dispose();
			volumeMesh.material.dispose();
		}

		if (!textures.posX) return;

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
				cubeSize: { value: cubeSize },
				time: { value: 0.0 },
				effectMode: { value: effectModes.indexOf(effectMode) },
				effectSpeed: { value: effectSpeed },
				effectIntensity: { value: effectIntensity }
			},
			transparent: true,
			side: THREE.BackSide,
			depthWrite: false
		});

		volumeMesh = new THREE.Mesh(geometry, material);
		scene.add(volumeMesh);

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
			volumeMesh.material.uniforms.effectMode.value = effectModes.indexOf(effectMode);
			volumeMesh.material.uniforms.effectSpeed.value = effectSpeed;
			volumeMesh.material.uniforms.effectIntensity.value = effectIntensity;
		}
	}

	function animateCameraTo(target) {
		cameraAnim.start.copy(camera.position);
		cameraAnim.end.copy(target);
		cameraAnim.t = 0;
		cameraAnim.active = true;
	}

	function rotateToFace(faceIndex) {
		const face = faces[faceIndex];
		animateCameraTo(face.position());
	}
  
	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		
		const elapsedTime = clock.getElapsedTime();
  
		if (cameraAnim.active) {
			cameraAnim.t += 0.02 * animationSpeed;
			camera.position.lerpVectors(cameraAnim.start, cameraAnim.end, Math.min(cameraAnim.t, 1));
			camera.lookAt(0, 0, 0);
			if (cameraAnim.t >= 1) cameraAnim.active = false;
		}

		// Update time uniform for effects
		if (volumeMesh && volumeMesh.material.uniforms) {
			volumeMesh.material.uniforms.time.value = elapsedTime;
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
		raySteps = voxelResolution * 2;
		updateVolumeUniforms();
	}

	function handleOpacityChange() {
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

	function handlePanelDistanceChange() {
		updatePanels();
	}

	function handlePanelOpacityChange() {
		updatePanels();
	}

	function handleEffectChange() {
		updateVolumeUniforms();
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

	function cycleEffectMode() {
		const currentIndex = effectModes.indexOf(effectMode);
		effectMode = effectModes[(currentIndex + 1) % effectModes.length];
		updateVolumeUniforms();
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
		clock = new THREE.Clock();
  
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
	<p>Volumetric Ray Marching</p>
	<p>Effect: {effectMode}</p>
</div>

<div class="ui-panel">
	<div class="section-label">VOLUME</div>
	
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

	<!-- <div class="row">
		Opacity:
		<input 
			type="range" 
			bind:value={volumeOpacity} 
			on:input={handleOpacityChange}
			min="0.001" 
			max="0.1" 
			step="0.001"
		/>
		<span>{volumeOpacity.toFixed(3)}</span>
	</div> -->

	<!-- <div class="row">
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
	</div> -->

	<!-- <div class="row">
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
	</div> -->

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
		<span>{cubeSize.toFixed(0)}</span>
	</div>

	<div class="row">
		<button on:click={cycleBlendMode}>
			Blend: {blendMode}
		</button>
		<button on:click={toggleWireframe}>
			{showWireframe ? '■' : '□'} Wire
		</button>
	</div>

	<div class="section-label">PANELS</div>

	<div class="row">
		Distance:
		<input 
			type="range" 
			bind:value={panelDistance} 
			on:input={handlePanelDistanceChange}
			min="10" 
			max="100" 
			step="1"
		/>
		<span>{panelDistance}</span>
	</div>

	<div class="row">
		Opacity:
		<input 
			type="range" 
			bind:value={panelOpacity} 
			on:input={handlePanelOpacityChange}
			min="0" 
			max="1" 
			step="0.05"
		/>
		<span>{panelOpacity.toFixed(2)}</span>
	</div>

	<div class="section-label">EFFECTS</div>

	<div class="row">
		<button on:click={cycleEffectMode} class="wide-button">
			FX: {effectMode}
		</button>
	</div>

	<div class="row">
		Speed:
		<input 
			type="range" 
			bind:value={effectSpeed} 
			on:input={handleEffectChange}
			min="0.1" 
			max="5.0" 
			step="0.1"
		/>
		<span>{effectSpeed.toFixed(1)}</span>
	</div>

	<div class="row">
		Intensity:
		<input 
			type="range" 
			bind:value={effectIntensity} 
			on:input={handleEffectChange}
			min="0" 
			max="2.0" 
			step="0.05"
		/>
		<span>{effectIntensity.toFixed(2)}</span>
	</div>

	<div class="section-label">VIEW</div>

	<div class="row faces-row">
		{#each faces as face, i}
			<button on:click={() => rotateToFace(i)} class="face-button">
				{face.name}
			</button>
		{/each}
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
		gap: 6px;
		z-index: 100;
		max-height: calc(100vh - 40px);
		overflow-y: auto;
	}

	.section-label {
		color: rgba(255, 255, 255, 0.5);
		font-size: 10px;
		letter-spacing: 2px;
		margin-top: 8px;
		margin-bottom: 2px;
		padding-left: 4px;
	}

	.row {
		background: rgba(0, 0, 0, 0.7);
		padding: 8px 10px;
		border-radius: 4px;
		color: white;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
	}

	.faces-row {
		flex-wrap: wrap;
		gap: 4px;
	}

	button {
		padding: 5px 8px;
		background: rgba(40, 40, 40, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.25);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		transition: 0.2s;
		font-size: 10px;
	}

	button:hover {
		background: rgba(70, 70, 70, 0.9);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.wide-button {
		flex: 1;
	}

	.face-button {
		padding: 4px 6px;
		min-width: 32px;
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100px;
		background: transparent;
		flex-shrink: 0;
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

	span {
		min-width: 40px;
		text-align: right;
		font-size: 10px;
		opacity: 0.8;
	}
</style>