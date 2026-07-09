<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { phase, spiralDone } from '$lib/store/store';
	import { accentHex } from '$lib/theme';

	// Normalised accent direction (max channel = 1) so the per-frame brightness
	// envelope is preserved across palettes.
	let aR = 1, aG = 0.76, aB = 0.2;
	$: {
		const h = $accentHex;
		const r = ((h >> 16) & 255) / 255, g = ((h >> 8) & 255) / 255, b = (h & 255) / 255;
		const m = Math.max(r, g, b) || 1;
		aR = r / m; aG = g / m; aB = b / m;
	}

	let canvas;
	let renderer, scene, camera;
	let frame;

	const PHI = 1.618033988749895;
	const IPHI = 1 / PHI;
	const IP2 = IPHI * IPHI;
	const IP3 = IP2 * IPHI;
	const IP4 = IP2 * IP2;

	let CX = IP2 / (1 - IP4);
	let CY = IP3 / (1 - IP4);

	const PHI4 = PHI ** 4;
	const CYCLE = 24;
	const NUM_LAYERS = 48;
	const SQUARES_PER_LAYER = 24;

	// Self-similar golden spiral: a log spiral scales by φ every quarter turn, so
	// over one φ⁴ zoom cycle it must rotate a full 2π. Coupling rotation to the
	// zoom this way makes every layered copy land on the *same* spiral curve, so
	// the field reads as one clean spiral zooming into itself at constant scale.
	const SPIRAL_TURN = -2 * Math.PI; // sign sets winding direction

	// 0 = normal, 1 = condensing + fading, 2 = done
	let condenseState = 0;
	let condenseStartTime = null;
	const CONDENSE_DURATION = 5.0;

	let unsubPhase;

	function buildGeometry() {
		const positions = [];
		function line(x1, y1, x2, y2) { positions.push(x1, y1, 0, x2, y2, 0); }
		function rect(L, B, R, T) {
			line(L, B, R, B); line(R, B, R, T);
			line(R, T, L, T); line(L, T, L, B);
		}
		function arc(cx, cy, r, startAngle, segments = 64) {
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
			const side = i % 4;
			let s, acx, acy, startAngle;
			if (side === 0)      { s = T - B; R -= s; acx = R; acy = B; startAngle = 0; }
			else if (side === 1) { s = R - L; T -= s; acx = R; acy = T; startAngle = Math.PI / 2; }
			else if (side === 2) { s = T - B; L += s; acx = L; acy = T; startAngle = Math.PI; }
			else                 { s = R - L; B += s; acx = L; acy = B; startAngle = Math.PI * 1.5; }
			rect(L, B, R, T);
			arc(acx, acy, s, startAngle);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		return geo;
	}

	function easeInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
		renderer.setClearColor(0x1b1b1b, 0);
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

		function applyFrustum(h) {
			const aspect = window.innerWidth / window.innerHeight;
			const fw = h * aspect;
			camera.left = -fw / 2; camera.right = fw / 2;
			camera.top  =  h / 2;  camera.bottom = -h / 2;
			camera.updateProjectionMatrix();
		}
		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			applyFrustum(0.18);
		}
		window.addEventListener('resize', resize);
		applyFrustum(0.18);

		unsubPhase = phase.subscribe((p) => {
			if (p === 'transition' && condenseState === 0) {
				condenseState = 1;
				condenseStartTime = null;
				spiralDone.set(true);
			}
		});

		const animate = (t) => {
			const time = t * 0.001;
			const baseT = (time % CYCLE) / CYCLE;

			if (condenseState === 1 && condenseStartTime === null) {
				condenseStartTime = time;
			}

			let cp = 0;
			if (condenseState === 1 && condenseStartTime !== null) {
				cp = Math.min((time - condenseStartTime) / CONDENSE_DURATION, 1);
				if (cp >= 1) {
					condenseState = 2;
					canvas.style.display = 'none';
				}
			}

			if (condenseState === 2) {
				frame = requestAnimationFrame(animate);
				return;
			}

			// Global fade: kicks in at 60% through condensation, gone by 100%
			const globalFade = condenseState === 0
				? 0.5
				: Math.max(0, 1 - Math.max(0, (cp - 0.6) / 0.4));

			// Convergence target: life=0 means zoom=1, rot=0, position at raw convergence point
			// At life=0: zoom=1, rot=0, so position = -(CX*1 - CY*0, CX*0 + CY*1) = (-CX, -CY)
			const targetZoom = 1;
			const targetRot  = 0;
			const targetPX   = -CX;
			const targetPY   = -CY;

			for (let n = 0; n < NUM_LAYERS; n++) {
				const { mesh, mat } = layers[n];
				const life = (baseT + n / NUM_LAYERS) % 1;
				const zoom = PHI4 ** life;
				const fade = Math.min(life / 0.15, (1 - life) / 0.5, 1);
				const rot  = life * SPIRAL_TURN;
				const cos  = Math.cos(rot);
				const sin  = Math.sin(rot);
				const ownPX = -(CX * cos - CY * sin) * zoom;
				const ownPY = -(CX * sin + CY * cos) * zoom;

				if (condenseState === 0) {
					mesh.scale.set(zoom, zoom, 1);
					mesh.rotation.z = rot;
					mesh.position.x = ownPX;
					mesh.position.y = ownPY;
					mat.opacity = fade * 0.5;
					const b = fade * 0.5;
					mat.color.setRGB(b * aR, b * aG, b * aB);
				} else {
					// All layers converge inward toward the spiral's own limit point (life→0).
					// Stagger: layers with larger life values (further out) start moving first,
					// inner layers follow — everything folds inward naturally.
					const staggerStart = (1 - life) * 0.3; // outer layers (high life) start sooner
					const rawP  = Math.max(0, Math.min((cp - staggerStart) / (1 - staggerStart), 1));
					const tMove = easeInOutCubic(rawP);

					const lerpZoom = zoom + (targetZoom - zoom) * tMove;
					const lerpRot  = rot  + (targetRot  - rot)  * tMove;
					const lerpCos  = Math.cos(lerpRot);
					const lerpSin  = Math.sin(lerpRot);
					const lerpPX   = -(CX * lerpCos - CY * lerpSin) * lerpZoom;
					const lerpPY   = -(CX * lerpSin + CY * lerpCos) * lerpZoom;

					mesh.scale.set(lerpZoom, lerpZoom, 1);
					mesh.rotation.z = lerpRot;
					mesh.position.x = lerpPX;
					mesh.position.y = lerpPY;

					// Opacity: preserve own natural fade envelope, then globalFade takes it out
					mat.opacity = fade * 0.5 * globalFade;
					const b = fade * 0.5;
					mat.color.setRGB(b * aR, b * aG, b * aB);
				}
			}

			renderer.render(scene, camera);
			frame = requestAnimationFrame(animate);
		};

		frame = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(frame);
		window.removeEventListener('resize', resize);
		unsubPhase?.();
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
		z-index: 2;
	}
</style>