<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { bgStage } from '$lib/store/store';
	import { lerp, clamp } from '$lib/functions/utils';

	import vert from '$lib/shaders/thetaLattice.vert.glsl';
	import frag from '$lib/shaders/thetaLattice.frag.glsl';

	// The shader is used exactly as written. Everything below only drives its
	// `mouse` uniform, which is the one knob it has:
	//   |mouse| small  → both tanh terms saturate, Omega settles, and the slice
	//                    sits almost flat: the calm glowing state.
	//   |mouse| → 1    → they unsaturate and the slice fills with hyperplanes.
	// Neither component may reach zero — the shader's quaternion axis is
	// normalize(vec3(x*y, x*y, x*y)), which is 0/0 on either axis.
	const M_SEED = 0.004; // start: barely any tilt at all
	const M_CALM = 0.145;
	const M_BURST = 0.85;
	const M_MIN = 0.002;

	const REVEAL_DUR = 3.2;
	const BURST_DUR = 2.4;

	// The one colour the shader actually reads. It fills where the theta sum is
	// positive and drops to black where it is negative — this is the only knob
	// on how loud the background is.
	const COLOR = new THREE.Color(0x2a2a2a);

	let canvas;
	let renderer;
	let camera;
	let scene;
	let material;
	let frame;

	// The theta series is 343 tan() per pixel, so the buffer is rendered small
	// and stretched. It steps down further if frames get expensive.
	const SCALES = [0.7, 0.5, 0.34, 0.22, 0.14];
	const PIXEL_BUDGET = 620000;
	let scaleIdx = 0;
	let slowFrames = 0;

	let t = 0;
	let stage = 'off';
	let stageT = 0;
	let radius = M_SEED;
	let opacity = 0;
	let pointer = new THREE.Vector2(0, 0);
	let pointerEase = new THREE.Vector2(0, 0);

	function setStage(s) {
		if (s === stage) return;
		stage = s;
		stageT = 0;
	}

	function startingScale() {
		const px = window.innerWidth * window.innerHeight;
		let i = 0;
		while (i < SCALES.length - 1 && px * SCALES[i] * SCALES[i] > PIXEL_BUDGET) i += 1;
		return i;
	}

	function resize() {
		const s = SCALES[scaleIdx];
		renderer.setSize(
			Math.max(2, Math.round(window.innerWidth * s)),
			Math.max(2, Math.round(window.innerHeight * s)),
			false
		);
		material.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight;
	}

	function handleResize() {
		if (!renderer) return;
		scaleIdx = Math.max(scaleIdx, startingScale());
		resize();
	}

	function handlePointer(e) {
		pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
	}

	function step(dt) {
		t += dt;
		stageT += dt;
		const ease = (a, b, k) => lerp(a, b, Math.min(1, dt * k));

		if (stage === 'off') {
			radius = ease(radius, M_SEED, 4);
			opacity = ease(opacity, 0, 4);
		} else if (stage === 'reveal') {
			// The slice tilts open out of the centre — the pattern unfurls from
			// almost nothing into the full figure.
			const k = clamp(stageT / REVEAL_DUR, 0, 1);
			radius = lerp(M_SEED, M_CALM, k * k * (3 - 2 * k));
			opacity = clamp(stageT / (REVEAL_DUR * 0.5), 0, 1);
			if (stageT >= REVEAL_DUR) setStage('calm');
		} else if (stage === 'calm') {
			radius = ease(radius, M_CALM, 1.6);
			opacity = ease(opacity, 1, 3);
		} else if (stage === 'burst') {
			// Straight out into the hyperplane regime, then falling back.
			const k = clamp(stageT / BURST_DUR, 0, 1);
			const env = Math.min(1, stageT / 0.25) * Math.pow(1 - k, 2.2);
			radius = lerp(M_CALM, M_BURST, env);
			opacity = 1;
			if (stageT >= BURST_DUR) setStage('after');
		} else if (stage === 'after') {
			// The rooms are the thing now.
			radius = ease(radius, M_CALM, 1.2);
			opacity = ease(opacity, 0.55, 1.2);
		}

		// Slow drift so the figure keeps moving, plus a little pull from the
		// cursor. Both components stay well clear of zero.
		pointerEase.lerp(pointer, Math.min(1, dt * 2));
		const wobble = stage === 'burst' ? 0 : 0.03;
		material.uniforms.mouse.value.set(
			clamp(radius + Math.sin(t * 0.19) * wobble + pointerEase.x * wobble, M_MIN, 0.95),
			clamp(radius + Math.cos(t * 0.146) * wobble - pointerEase.y * wobble, M_MIN, 0.95)
		);
		canvas.style.opacity = opacity.toFixed(3);
	}

	let last = 0;
	let avg = 16;
	function loop(now) {
		frame = requestAnimationFrame(loop);
		const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
		last = now;

		step(dt);
		renderer.render(scene, camera);

		const cost = performance.now() - now;
		avg = avg * 0.82 + cost * 0.18;
		if (scaleIdx < SCALES.length - 1 && (cost > 55 || (avg > 20 && ++slowFrames > 12))) {
			scaleIdx += 1;
			slowFrames = 0;
			avg = 14;
			resize();
		} else if (cost <= 55 && avg <= 20) {
			slowFrames = 0;
		}
	}

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
		renderer.setPixelRatio(1);
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		scene = new THREE.Scene();

		material = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: {
				color1: { value: COLOR },
				color2: { value: COLOR },
				color3: { value: COLOR },
				mouse: { value: new THREE.Vector2(M_SEED, M_SEED) },
				aspectRatio: { value: 1 }
			}
		});
		scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

		scaleIdx = startingScale();
		resize();
		canvas.style.opacity = '0';

		window.addEventListener('resize', handleResize);
		window.addEventListener('pointermove', handlePointer);
		const unsub = bgStage.subscribe(setStage);
		frame = requestAnimationFrame(loop);

		return () => unsub();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (frame) cancelAnimationFrame(frame);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('pointermove', handlePointer);
		if (renderer) renderer.dispose();
	});
</script>

<canvas bind:this={canvas} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 0;
		pointer-events: none;
	}
</style>
