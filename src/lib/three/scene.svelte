<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  
	let isInitialized = false;
	let canvasElement;
	let scene, camera, renderer, controls;
	let backgroundMeshes = [];
	let volumeMesh;
	let thetaVolumeMesh;
	let animationFrameId;
	let textures = {};
	let loadedTextures = { tex90s: null, tex60s: null };
	let clock;
  
	let activeScene = 'theta';
	let animationSpeed = 0.5;
	let cameraAnim = { active: false, start: new THREE.Vector3(), end: new THREE.Vector3(), t: 0 };
  
	// Volume controls
	let voxelResolution = 64;
	let volumeOpacity = 0.01;
	let blendMode = 'multiply';
	let raySteps = 64;
	let densityThreshold = 0.1;
	let colorIntensity = 1.0;
	let showWireframe = false;
	let cubeSize = 100.0;
	let panelDistance = 30;
	let panelOpacity = 0.8;
	let effectMode = 'none';
	let effectSpeed = 1.0;
	let effectIntensity = 0.5;

	const effectModes = ['none', 'pulse', 'rotate', 'breathe', 'warp', 'spiral', 'kaleidoscope'];
	const blendModes = ['multiply', 'average', 'min', 'max', 'additive'];

	// Theta controls
	let thetaRaySteps = 128;
	let thetaOpacity = 0.5;
	let thetaDensityThreshold = 0.02;
	let thetaColorIntensity = 2.0;
	let thetaCubeSize = 50.0;
	let thetaShowWireframe = false;
	let thetaSliceW = 0.0;
	let thetaAnimateW = true;
	let thetaTimeScale = 0.3;
	let thetaColorScheme = 'plasma';
	let thetaFrequency = 3.0;
	let thetaComplexity = 2.0;
	let thetaSharpness = 1.0;
	let thetaLayers = 3;
	let thetaRotationSpeed = 0.2;

	const thetaColorSchemes = ['plasma', 'viridis', 'inferno', 'coolwarm', 'twilight', 'neon'];

	const faces = [
		{ name: '+X', position: () => new THREE.Vector3(getCurrentCubeSize() * 1.5, 0, 0) },
		{ name: '-X', position: () => new THREE.Vector3(-getCurrentCubeSize() * 1.5, 0, 0) },
		{ name: '+Y', position: () => new THREE.Vector3(0, getCurrentCubeSize() * 1.5, 0) },
		{ name: '-Y', position: () => new THREE.Vector3(0, -getCurrentCubeSize() * 1.5, 0) },
		{ name: '+Z', position: () => new THREE.Vector3(0, 0, getCurrentCubeSize() * 1.5) },
		{ name: '-Z', position: () => new THREE.Vector3(0, 0, -getCurrentCubeSize() * 1.5) },
		{ name: 'Iso', position: () => new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(getCurrentCubeSize() * 2) }
	];

	function getCurrentCubeSize() {
		return activeScene === 'theta' ? thetaCubeSize : cubeSize;
	}

	function setupCamera() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(75, 30, 50);
		camera.lookAt(0, 0, 0);
	}
  
	function setupRenderer() {
		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.autoClear = false;
	}
  
	function setupControls() {
		controls = new OrbitControls(camera, canvasElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.minDistance = 1;
		controls.maxDistance = 200;
		controls.addEventListener('start', () => { cameraAnim.active = false; });
	}

	const thetaVertexShader = `
		varying vec3 vOrigin;
		varying vec3 vDirection;
		void main() {
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.0));
			vDirection = position - vOrigin;
			gl_Position = projectionMatrix * mvPosition;
		}
	`;

	const thetaFragmentShader = `
		precision highp float;
		uniform float opacity, densityThreshold, colorIntensity, cubeSize, time, sliceW, timeScale;
		uniform float frequency, complexity, sharpness, rotationSpeed;
		uniform int raySteps, colorScheme, layers;
		varying vec3 vOrigin, vDirection;
		
		#define PI 3.14159265359
		#define TAU 6.28318530718
		
		vec3 plasma(float t) {
			return vec3(0.5 + 0.5 * sin(TAU * (t * 0.95)), 0.5 + 0.5 * sin(TAU * (t * 0.88 + 0.3)), 0.5 + 0.5 * sin(TAU * (t * 0.75 + 0.6))) * vec3(1.2, 0.6, 1.5);
		}
		vec3 viridis(float t) {
			t = clamp(t, 0.0, 1.0);
			if (t < 0.33) return mix(vec3(0.267, 0.005, 0.329), vec3(0.282, 0.141, 0.458), t * 3.0);
			if (t < 0.66) return mix(vec3(0.282, 0.141, 0.458), vec3(0.128, 0.567, 0.551), (t - 0.33) * 3.0);
			return mix(vec3(0.128, 0.567, 0.551), vec3(0.993, 0.906, 0.144), (t - 0.66) * 3.0);
		}
		vec3 inferno(float t) { return vec3(smoothstep(0.0, 0.5, t) * 1.5, pow(t, 2.0) * 0.8, sin(t * PI) * 0.6); }
		vec3 coolwarm(float t) { return mix(vec3(0.1, 0.3, 0.9), vec3(0.9, 0.2, 0.1), t); }
		vec3 twilight(float t) { return vec3(0.5 + 0.4 * sin(TAU * t), 0.3 + 0.3 * sin(TAU * t + 2.0), 0.6 + 0.4 * sin(TAU * t + 4.0)); }
		vec3 neon(float t) { return vec3(pow(sin(t * PI), 2.0), pow(sin(t * PI + 1.0), 4.0) * 2.0, pow(sin(t * PI + 2.0), 2.0) * 1.5); }
		
		vec3 getColor(float t, int scheme) {
			t = clamp(t, 0.0, 1.0);
			if (scheme == 0) return plasma(t);
			if (scheme == 1) return viridis(t);
			if (scheme == 2) return inferno(t);
			if (scheme == 3) return coolwarm(t);
			if (scheme == 4) return twilight(t);
			return neon(t);
		}
		
		float thetaDivisor(vec4 p, float t) {
			float result = 0.0, amp = 1.0, freq = frequency;
			float angle = t * rotationSpeed;
			float c = cos(angle), s = sin(angle);
			vec4 rp = vec4(p.x * c - p.w * s, p.y, p.z, p.x * s + p.w * c);
			
			for (int i = 0; i < 5; i++) {
				if (i >= layers) break;
				float theta1 = sin(rp.x * freq * PI) * cos(rp.y * freq * PI);
				float theta2 = sin(rp.y * freq * PI) * cos(rp.z * freq * PI);
				float theta3 = sin(rp.z * freq * PI) * cos(rp.w * freq * PI);
				float theta4 = sin(rp.w * freq * PI) * cos(rp.x * freq * PI);
				float cross1 = sin((rp.x + rp.y) * freq * PI * 0.7);
				float cross2 = sin((rp.y + rp.z) * freq * PI * 0.7);
				float cross3 = sin((rp.z + rp.w) * freq * PI * 0.7);
				float cross4 = sin((rp.w + rp.x) * freq * PI * 0.7);
				float decay = exp(-length(rp) * 0.1 * complexity);
				float layer = (theta1 * theta2 + theta3 * theta4) * 0.5 + (cross1 * cross2 + cross3 * cross4) * 0.3;
				result += layer * decay * amp;
				freq *= 1.8; amp *= 0.5;
				rp = vec4(rp.y + rp.w * 0.1, rp.z + rp.x * 0.1, rp.w + rp.y * 0.1, rp.x + rp.z * 0.1);
			}
			return pow(abs(result), 1.0 / sharpness);
		}
		
		vec2 intersectBox(vec3 origin, vec3 dir, vec3 bMin, vec3 bMax) {
			vec3 t1 = (bMin - origin) / dir, t2 = (bMax - origin) / dir;
			vec3 tMin = min(t1, t2), tMax = max(t1, t2);
			return vec2(max(max(tMin.x, tMin.y), tMin.z), min(min(tMax.x, tMax.y), tMax.z));
		}
		
		void main() {
			vec3 rayDir = normalize(vDirection);
			float halfSize = cubeSize * 0.5;
			vec2 bounds = intersectBox(vOrigin, rayDir, vec3(-halfSize), vec3(halfSize));
			if (bounds.x > bounds.y) discard;
			bounds.x = max(bounds.x, 0.0);
			
			vec3 accColor = vec3(0.0);
			float accAlpha = 0.0, stepSize = (bounds.y - bounds.x) / float(raySteps);
			float animTime = time * timeScale;
			
			for (int i = 0; i < 256; i++) {
				if (i >= raySteps || accAlpha > 0.95) break;
				float t = bounds.x + (float(i) + 0.5) * stepSize;
				if (t > bounds.y) break;
				
				vec3 pos = vOrigin + rayDir * t;
				vec3 nPos = pos / halfSize;
				vec4 p4 = vec4(nPos * 2.0, sliceW + sin(animTime) * 0.5);
				float density = thetaDivisor(p4, animTime);
				
				if (density > densityThreshold) {
					float cParam = density * 0.8 + length(nPos) * 0.2 + sin(pos.x * 0.5 + animTime) * 0.1;
					vec3 color = getColor(cParam, colorScheme) * colorIntensity * (1.0 - (t - bounds.x) / (bounds.y - bounds.x) * 0.3);
					float alpha = min(density * opacity * stepSize * 10.0, 0.5);
					accColor += color * alpha * (1.0 - accAlpha);
					accAlpha += alpha * (1.0 - accAlpha);
				}
			}
			gl_FragColor = vec4(accColor * (1.0 + accAlpha * 0.2), accAlpha);
		}
	`;

	const volumetricVertexShader = `
		varying vec3 vOrigin, vDirection, vWorldPosition;
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
		uniform sampler2D texPosX, texNegX, texPosY, texNegY, texPosZ, texNegZ;
		uniform float opacity, densityThreshold, colorIntensity, cubeSize, time, effectSpeed, effectIntensity;
		uniform int blendMode, raySteps, effectMode;
		varying vec3 vOrigin, vDirection, vWorldPosition;
		#define PI 3.14159265359
		
		vec2 rotate2D(vec2 p, float a) { float s = sin(a), c = cos(a); return vec2(p.x*c - p.y*s, p.x*s + p.y*c); }
		
		vec3 applyEffect(vec3 pos, float t) {
			if (effectMode == 1) return pos * (1.0 + sin(t * effectSpeed * 2.0) * effectIntensity * 0.3);
			if (effectMode == 2) return vec3(rotate2D(pos.xz, t * effectSpeed * 0.5), pos.y).xzy;
			if (effectMode == 3) { float b = sin(t * effectSpeed) * effectIntensity; return pos + normalize(pos + 0.001) * b * length(pos) / cubeSize * 5.0; }
			if (effectMode == 4) return pos + vec3(sin(pos.y * 0.1 + t * effectSpeed), sin(pos.z * 0.1 + t * effectSpeed * 1.1), sin(pos.x * 0.1 + t * effectSpeed * 0.9)) * effectIntensity * 3.0;
			return pos;
		}
		
		vec3 getVoxelColor(vec3 pos, float t) {
			vec3 ePos = applyEffect(pos, t);
			vec3 nPos = clamp((ePos / cubeSize) * 0.5 + 0.5, 0.0, 1.0);
			vec3 cPosX = texture2D(texPosX, nPos.zy).rgb, cNegX = texture2D(texNegX, vec2(1.0 - nPos.z, nPos.y)).rgb;
			vec3 cPosY = texture2D(texPosY, nPos.xz).rgb, cNegY = texture2D(texNegY, vec2(nPos.x, 1.0 - nPos.z)).rgb;
			vec3 cPosZ = texture2D(texPosZ, nPos.xy).rgb, cNegZ = texture2D(texNegZ, vec2(1.0 - nPos.x, nPos.y)).rgb;
			vec3 xC = mix(cNegX, cPosX, nPos.x), yC = mix(cNegY, cPosY, nPos.y), zC = mix(cNegZ, cPosZ, nPos.z);
			if (blendMode == 0) return xC * yC * zC * 4.0 * colorIntensity;
			if (blendMode == 2) return min(min(xC, yC), zC) * colorIntensity;
			if (blendMode == 3) return max(max(xC, yC), zC) * colorIntensity;
			return (xC + yC + zC) / 3.0 * colorIntensity;
		}
		
		vec2 intersectBox(vec3 o, vec3 d, vec3 bMin, vec3 bMax) {
			vec3 t1 = (bMin - o) / d, t2 = (bMax - o) / d;
			vec3 tMin = min(t1, t2), tMax = max(t1, t2);
			return vec2(max(max(tMin.x, tMin.y), tMin.z), min(min(tMax.x, tMax.y), tMax.z));
		}
		
		void main() {
			vec3 rayDir = normalize(vDirection);
			vec2 bounds = intersectBox(vOrigin, rayDir, vec3(-cubeSize * 0.5), vec3(cubeSize * 0.5));
			if (bounds.x > bounds.y) discard;
			bounds.x = max(bounds.x, 0.0);
			
			vec3 accColor = vec3(0.0);
			float accAlpha = 0.0, stepSize = (bounds.y - bounds.x) / float(raySteps);
			
			for (int i = 0; i < 256; i++) {
				if (i >= raySteps || accAlpha > 0.95) break;
				float t = bounds.x + float(i) * stepSize;
				if (t > bounds.y) break;
				vec3 pos = vOrigin + rayDir * t;
				vec3 color = getVoxelColor(pos, time);
				float density = (color.r + color.g + color.b) / 3.0;
				if (density > densityThreshold) {
					float alpha = density * opacity * stepSize * 2.0;
					accColor += color * alpha * (1.0 - accAlpha);
					accAlpha += alpha * (1.0 - accAlpha);
				}
			}
			gl_FragColor = vec4(accColor, accAlpha);
		}
	`;

	async function setupScene() {
		try {
			const textureLoader = new THREE.TextureLoader();
			const [texture90s, texture60s] = await Promise.all([
				new Promise((res, rej) => textureLoader.load('/90s_Illustration.jpg', res, undefined, rej)),
				new Promise((res, rej) => textureLoader.load('/60s_Illustration.jpg', res, undefined, rej))
			]);
			loadedTextures = { tex90s: texture90s, tex60s: texture60s };
			textures = { posX: texture90s.clone(), negX: texture60s.clone(), posY: texture90s.clone(), negY: texture60s.clone(), posZ: texture90s.clone(), negZ: texture60s.clone() };
			Object.values(textures).forEach(tex => { tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; });
			createBackgroundPanels();
			createVolumeMesh();
			createThetaVolumeMesh();
			updateSceneVisibility();
		} catch (error) {
			console.error('Error setting up scene:', error);
			scene.background = new THREE.Color(0x000000);
		}
	}

	const PANEL_SIZE = 40;

	function createBackgroundPanels() {
		backgroundMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
		backgroundMeshes = [];
		if (!loadedTextures.tex90s) return;
		const planes = [
			{ pos: [panelDistance, 0, 0], rot: [0, -Math.PI/2, 0], tex: loadedTextures.tex90s },
			{ pos: [-panelDistance, 0, 0], rot: [0, Math.PI/2, 0], tex: loadedTextures.tex60s },
			{ pos: [0, panelDistance, 0], rot: [Math.PI/2, 0, 0], tex: loadedTextures.tex90s },
			{ pos: [0, -panelDistance, 0], rot: [-Math.PI/2, 0, 0], tex: loadedTextures.tex60s },
			{ pos: [0, 0, panelDistance], rot: [0, 0, 0], tex: loadedTextures.tex90s },
			{ pos: [0, 0, -panelDistance], rot: [0, Math.PI, 0], tex: loadedTextures.tex60s }
		];
		planes.forEach(p => {
			const mesh = new THREE.Mesh(
				new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE),
				new THREE.MeshBasicMaterial({ map: p.tex, side: THREE.DoubleSide, transparent: true, opacity: panelOpacity })
			);
			mesh.position.set(...p.pos);
			mesh.rotation.set(...p.rot);
			scene.add(mesh);
			backgroundMeshes.push(mesh);
		});
	}

	function updatePanels() {
		if (!backgroundMeshes.length) { createBackgroundPanels(); return; }
		const positions = [[panelDistance,0,0],[-panelDistance,0,0],[0,panelDistance,0],[0,-panelDistance,0],[0,0,panelDistance],[0,0,-panelDistance]];
		backgroundMeshes.forEach((m, i) => { m.position.set(...positions[i]); m.material.opacity = panelOpacity; });
	}

	function createVolumeMesh() {
		if (volumeMesh) { scene.remove(volumeMesh); volumeMesh.geometry.dispose(); volumeMesh.material.dispose(); }
		if (!textures.posX) return;
		const material = new THREE.ShaderMaterial({
			vertexShader: volumetricVertexShader,
			fragmentShader: volumetricFragmentShader,
			uniforms: {
				texPosX: { value: textures.posX }, texNegX: { value: textures.negX },
				texPosY: { value: textures.posY }, texNegY: { value: textures.negY },
				texPosZ: { value: textures.posZ }, texNegZ: { value: textures.negZ },
				opacity: { value: volumeOpacity }, blendMode: { value: blendModes.indexOf(blendMode) },
				raySteps: { value: raySteps }, densityThreshold: { value: densityThreshold },
				colorIntensity: { value: colorIntensity }, cubeSize: { value: cubeSize },
				time: { value: 0 }, effectMode: { value: effectModes.indexOf(effectMode) },
				effectSpeed: { value: effectSpeed }, effectIntensity: { value: effectIntensity }
			},
			transparent: true, side: THREE.BackSide, depthWrite: false
		});
		volumeMesh = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material);
		scene.add(volumeMesh);
		if (showWireframe) {
			const wf = new THREE.LineSegments(new THREE.WireframeGeometry(volumeMesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
			volumeMesh.add(wf);
		}
	}

	function createThetaVolumeMesh() {
		if (thetaVolumeMesh) { scene.remove(thetaVolumeMesh); thetaVolumeMesh.geometry.dispose(); thetaVolumeMesh.material.dispose(); }
		const material = new THREE.ShaderMaterial({
			vertexShader: thetaVertexShader,
			fragmentShader: thetaFragmentShader,
			uniforms: {
				opacity: { value: thetaOpacity }, raySteps: { value: thetaRaySteps },
				densityThreshold: { value: thetaDensityThreshold }, colorIntensity: { value: thetaColorIntensity },
				cubeSize: { value: thetaCubeSize }, time: { value: 0 }, sliceW: { value: thetaSliceW },
				timeScale: { value: thetaTimeScale }, colorScheme: { value: thetaColorSchemes.indexOf(thetaColorScheme) },
				frequency: { value: thetaFrequency }, complexity: { value: thetaComplexity },
				sharpness: { value: thetaSharpness }, layers: { value: thetaLayers }, rotationSpeed: { value: thetaRotationSpeed }
			},
			transparent: true, side: THREE.BackSide, depthWrite: false
		});
		thetaVolumeMesh = new THREE.Mesh(new THREE.BoxGeometry(thetaCubeSize, thetaCubeSize, thetaCubeSize), material);
		scene.add(thetaVolumeMesh);
		if (thetaShowWireframe) {
			const wf = new THREE.LineSegments(new THREE.WireframeGeometry(thetaVolumeMesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
			thetaVolumeMesh.add(wf);
		}
	}

	function updateSceneVisibility() {
		if (volumeMesh) volumeMesh.visible = activeScene === 'volume';
		if (thetaVolumeMesh) thetaVolumeMesh.visible = activeScene === 'theta';
		backgroundMeshes.forEach(m => m.visible = activeScene === 'volume');
	}

	function updateVolumeUniforms() {
		if (!volumeMesh?.material?.uniforms) return;
		const u = volumeMesh.material.uniforms;
		u.opacity.value = volumeOpacity; u.blendMode.value = blendModes.indexOf(blendMode);
		u.raySteps.value = raySteps; u.densityThreshold.value = densityThreshold;
		u.colorIntensity.value = colorIntensity; u.cubeSize.value = cubeSize;
		u.effectMode.value = effectModes.indexOf(effectMode);
		u.effectSpeed.value = effectSpeed; u.effectIntensity.value = effectIntensity;
	}

	function updateThetaUniforms() {
		if (!thetaVolumeMesh?.material?.uniforms) return;
		const u = thetaVolumeMesh.material.uniforms;
		u.opacity.value = thetaOpacity; u.raySteps.value = thetaRaySteps;
		u.densityThreshold.value = thetaDensityThreshold; u.colorIntensity.value = thetaColorIntensity;
		u.cubeSize.value = thetaCubeSize; u.sliceW.value = thetaSliceW;
		u.timeScale.value = thetaTimeScale; u.colorScheme.value = thetaColorSchemes.indexOf(thetaColorScheme);
		u.frequency.value = thetaFrequency; u.complexity.value = thetaComplexity;
		u.sharpness.value = thetaSharpness; u.layers.value = thetaLayers; u.rotationSpeed.value = thetaRotationSpeed;
	}

	function animateCameraTo(target) { cameraAnim.start.copy(camera.position); cameraAnim.end.copy(target); cameraAnim.t = 0; cameraAnim.active = true; }
	function rotateToFace(i) { animateCameraTo(faces[i].position()); }
	function switchScene(s) { activeScene = s; updateSceneVisibility(); }
  
	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		const elapsed = clock.getElapsedTime();
		if (cameraAnim.active) {
			cameraAnim.t += 0.02 * animationSpeed;
			camera.position.lerpVectors(cameraAnim.start, cameraAnim.end, Math.min(cameraAnim.t, 1));
			camera.lookAt(0, 0, 0);
			if (cameraAnim.t >= 1) cameraAnim.active = false;
		}
		if (volumeMesh?.material?.uniforms) volumeMesh.material.uniforms.time.value = elapsed;
		if (thetaVolumeMesh?.material?.uniforms) {
			thetaVolumeMesh.material.uniforms.time.value = elapsed;
			if (thetaAnimateW) {
				thetaSliceW = Math.sin(elapsed * thetaTimeScale) * 2.0;
				thetaVolumeMesh.material.uniforms.sliceW.value = thetaSliceW;
			}
		}
		controls.update();
		renderer.clear();
		renderer.render(scene, camera);
	}

	function handleResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }
	function handleThetaChange() { updateThetaUniforms(); }
	function handleThetaCubeSizeChange() { createThetaVolumeMesh(); updateSceneVisibility(); }
	function cycleThetaColorScheme() { thetaColorScheme = thetaColorSchemes[(thetaColorSchemes.indexOf(thetaColorScheme) + 1) % thetaColorSchemes.length]; updateThetaUniforms(); }
	function toggleThetaWireframe() { thetaShowWireframe = !thetaShowWireframe; createThetaVolumeMesh(); updateSceneVisibility(); }
	function toggleThetaAnimateW() { thetaAnimateW = !thetaAnimateW; }
	function handleResolutionChange() { raySteps = voxelResolution * 2; updateVolumeUniforms(); }
	function handleRayStepsChange() { updateVolumeUniforms(); }
	function handleCubeSizeChange() { createVolumeMesh(); updateSceneVisibility(); }
	function handlePanelDistanceChange() { updatePanels(); }
	function handlePanelOpacityChange() { updatePanels(); }
	function handleEffectChange() { updateVolumeUniforms(); }
	function toggleWireframe() { showWireframe = !showWireframe; createVolumeMesh(); updateSceneVisibility(); }
	function cycleBlendMode() { blendMode = blendModes[(blendModes.indexOf(blendMode) + 1) % blendModes.length]; updateVolumeUniforms(); }
	function cycleEffectMode() { effectMode = effectModes[(effectModes.indexOf(effectMode) + 1) % effectModes.length]; updateVolumeUniforms(); }
  
	onMount(async () => {
		if (isInitialized || !canvasElement) return;
		isInitialized = true;
		scene = new THREE.Scene();
		clock = new THREE.Clock();
		setupCamera(); setupRenderer(); setupControls();
		await setupScene();
		animate();
		window.addEventListener('resize', handleResize);
		return () => {
			isInitialized = false;
			window.removeEventListener('resize', handleResize);
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			backgroundMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
			if (volumeMesh) { scene.remove(volumeMesh); volumeMesh.geometry.dispose(); volumeMesh.material.dispose(); }
			if (thetaVolumeMesh) { scene.remove(thetaVolumeMesh); thetaVolumeMesh.geometry.dispose(); thetaVolumeMesh.material.dispose(); }
			if (renderer) renderer.dispose();
			if (controls) controls.dispose();
		};
	});
</script>
  
<canvas bind:this={canvasElement} class="webgl-canvas"></canvas>

<div class="info-box">
	<p><strong>CONCEPTION CALCULATOR 2000</strong></p>
	<p>{activeScene === 'theta' ? 'θ-DIVISOR PROJECTION' : 'VOLUME RENDERER'}</p>
	{#if activeScene === 'theta'}
		<p>4D → 3D quasi-periodic θ structure</p>
		<p>W-slice: {thetaSliceW.toFixed(2)}</p>
	{:else}
		<p>work in progress build</p>
	{/if}
</div>

<div class="ui-panel">
	<div class="section-label">SCENE</div>
	<div class="row scene-toggle">
		<button on:click={() => switchScene('theta')} class:active={activeScene === 'theta'} class="scene-button">θ-DIVISOR</button>
		<button on:click={() => switchScene('volume')} class:active={activeScene === 'volume'} class="scene-button">VOLUME</button>
	</div>

	{#if activeScene === 'theta'}
		<div class="section-label">θ STRUCTURE</div>
		<div class="row">Frequency:<input type="range" bind:value={thetaFrequency} on:input={handleThetaChange} min="0.5" max="8.0" step="0.1"/><span>{thetaFrequency.toFixed(1)}</span></div>
		<div class="row">Complexity:<input type="range" bind:value={thetaComplexity} on:input={handleThetaChange} min="0.1" max="5.0" step="0.1"/><span>{thetaComplexity.toFixed(1)}</span></div>
		<div class="row">Sharpness:<input type="range" bind:value={thetaSharpness} on:input={handleThetaChange} min="0.2" max="3.0" step="0.1"/><span>{thetaSharpness.toFixed(1)}</span></div>
		<div class="row">Layers:<input type="range" bind:value={thetaLayers} on:input={handleThetaChange} min="1" max="5" step="1"/><span>{thetaLayers}</span></div>
		
		<div class="section-label">4D PROJECTION</div>
		<div class="row">W Slice:<input type="range" bind:value={thetaSliceW} on:input={handleThetaChange} min="-3.0" max="3.0" step="0.05" disabled={thetaAnimateW}/><span>{thetaSliceW.toFixed(2)}</span></div>
		<div class="row"><button on:click={toggleThetaAnimateW} class:active={thetaAnimateW}>{thetaAnimateW ? '▶' : '■'} Animate W</button></div>
		<div class="row">Rotation:<input type="range" bind:value={thetaRotationSpeed} on:input={handleThetaChange} min="0" max="1.0" step="0.05"/><span>{thetaRotationSpeed.toFixed(2)}</span></div>
		<div class="row">Time Scale:<input type="range" bind:value={thetaTimeScale} on:input={handleThetaChange} min="0.05" max="1.0" step="0.05"/><span>{thetaTimeScale.toFixed(2)}</span></div>
		
		<div class="section-label">RENDERING</div>
		<div class="row">Ray Steps:<input type="range" bind:value={thetaRaySteps} on:input={handleThetaChange} min="32" max="256" step="16"/><span>{thetaRaySteps}</span></div>
		<div class="row">Opacity:<input type="range" bind:value={thetaOpacity} on:input={handleThetaChange} min="0.05" max="2.0" step="0.05"/><span>{thetaOpacity.toFixed(2)}</span></div>
		<div class="row">Threshold:<input type="range" bind:value={thetaDensityThreshold} on:input={handleThetaChange} min="0.0" max="0.3" step="0.005"/><span>{thetaDensityThreshold.toFixed(3)}</span></div>
		<div class="row">Intensity:<input type="range" bind:value={thetaColorIntensity} on:input={handleThetaChange} min="0.5" max="4.0" step="0.1"/><span>{thetaColorIntensity.toFixed(1)}</span></div>
		<div class="row">Size:<input type="range" bind:value={thetaCubeSize} on:input={handleThetaCubeSizeChange} min="20" max="100" step="5"/><span>{thetaCubeSize.toFixed(0)}</span></div>
		
		<div class="section-label">APPEARANCE</div>
		<div class="row"><button on:click={cycleThetaColorScheme} class="wide-button">Color: {thetaColorScheme}</button></div>
		<div class="row"><button on:click={toggleThetaWireframe}>{thetaShowWireframe ? '■' : '□'} Wireframe</button></div>
	{:else}
		<div class="section-label">VOLUME</div>
		<div class="row">Resolution:<input type="range" bind:value={voxelResolution} on:input={handleResolutionChange} min="8" max="128" step="8"/><span>{voxelResolution}</span></div>
		<div class="row">Ray Steps:<input type="range" bind:value={raySteps} on:input={handleRayStepsChange} min="16" max="256" step="16"/><span>{raySteps}</span></div>
		<div class="row">Cube Size:<input type="range" bind:value={cubeSize} on:input={handleCubeSizeChange} min="1" max="100" step="1"/><span>{cubeSize.toFixed(0)}</span></div>
		<div class="row"><button on:click={cycleBlendMode}>Blend: {blendMode}</button><button on:click={toggleWireframe}>{showWireframe ? '■' : '□'} Wire</button></div>
		
		<div class="section-label">PANELS</div>
		<div class="row">Distance:<input type="range" bind:value={panelDistance} on:input={handlePanelDistanceChange} min="10" max="100" step="1"/><span>{panelDistance}</span></div>
		<div class="row">Opacity:<input type="range" bind:value={panelOpacity} on:input={handlePanelOpacityChange} min="0" max="1" step="0.05"/><span>{panelOpacity.toFixed(2)}</span></div>
		
		<div class="section-label">EFFECTS</div>
		<div class="row"><button on:click={cycleEffectMode} class="wide-button">FX: {effectMode}</button></div>
		<div class="row">Speed:<input type="range" bind:value={effectSpeed} on:input={handleEffectChange} min="0.1" max="5.0" step="0.1"/><span>{effectSpeed.toFixed(1)}</span></div>
		<div class="row">Intensity:<input type="range" bind:value={effectIntensity} on:input={handleEffectChange} min="0" max="2.0" step="0.05"/><span>{effectIntensity.toFixed(2)}</span></div>
	{/if}

	<div class="section-label">VIEW</div>
	<div class="row faces-row">{#each faces as face, i}<button on:click={() => rotateToFace(i)} class="face-button">{face.name}</button>{/each}</div>
</div>

<style>
	:global(body) { margin: 0; overflow: hidden; background: black; font-family: "Courier New", monospace; font-size: 12px; }
	.webgl-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: block; }
	.info-box { position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.65); color: white; font-size: 12px; padding: 10px 12px; border-radius: 6px; max-width: 260px; pointer-events: none; line-height: 1.35em; z-index: 100; }
	.info-box p { margin: 0 0 0.5em 0; }
	.info-box p:last-child { margin-bottom: 0; }
	.ui-panel { position: fixed; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 6px; z-index: 100; max-height: calc(100vh - 40px); overflow-y: auto; }
	.section-label { color: rgba(255,255,255,0.5); font-size: 10px; letter-spacing: 2px; margin-top: 8px; margin-bottom: 2px; padding-left: 4px; }
	.row { background: rgba(0,0,0,0.7); padding: 8px 10px; border-radius: 4px; color: white; display: flex; align-items: center; gap: 8px; font-size: 11px; }
	.scene-toggle { gap: 4px; }
	.scene-button { flex: 1; padding: 8px 12px; font-size: 11px; letter-spacing: 1px; background: rgba(40,40,40,0.9); border: 1px solid rgba(255,255,255,0.25); transition: all 0.2s; }
	.scene-button.active { background: rgba(100,60,150,0.8); border-color: rgba(180,120,255,0.6); box-shadow: 0 0 10px rgba(150,100,200,0.3); }
	.faces-row { flex-wrap: wrap; gap: 4px; }
	button { padding: 5px 8px; background: rgba(40,40,40,0.9); border: 1px solid rgba(255,255,255,0.25); color: white; border-radius: 4px; cursor: pointer; transition: 0.2s; font-size: 10px; }
	button:hover { background: rgba(70,70,70,0.9); border-color: rgba(255,255,255,0.5); }
	button.active { background: rgba(80,60,120,0.9); border-color: rgba(150,120,200,0.6); }
	button:disabled { opacity: 0.4; cursor: not-allowed; }
	.wide-button { flex: 1; }
	.face-button { padding: 4px 6px; min-width: 32px; }
	input[type="range"] { -webkit-appearance: none; appearance: none; width: 100px; background: transparent; flex-shrink: 0; }
	input[type="range"]::-webkit-slider-runnable-track { height: 2px; background: rgba(255,255,255,0.35); border-radius: 2px; }
	input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 10px; width: 10px; border-radius: 50%; background: white; cursor: pointer; margin-top: -4px; box-shadow: 0 0 4px rgba(255,255,255,0.5); }
	input[type="range"]::-moz-range-track { height: 2px; background: rgba(255,255,255,0.35); border-radius: 2px; }
	input[type="range"]::-moz-range-thumb { height: 10px; width: 10px; border-radius: 50%; background: white; cursor: pointer; border: none; box-shadow: 0 0 4px rgba(255,255,255,0.5); }
	input[type="range"]:focus { outline: none; }
	input[type="range"]:disabled { opacity: 0.4; }
	span { min-width: 40px; text-align: right; font-size: 10px; opacity: 0.8; }
</style>