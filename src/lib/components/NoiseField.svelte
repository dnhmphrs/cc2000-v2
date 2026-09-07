<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { noise, noiseWash, noiseGhost } from '$lib/store/store';
	import { NOISE } from '$lib/config';
	import { NOISE_VERT, NOISE_FRAG } from '$lib/three/shaders/noise';

	// ── The static layer ─────────────────────────────────────────────────────
	// Hosts three/shaders/noise.js on its own WebGL canvas, over the 3D and
	// under the UI. It is on for the whole run — the scenes only say how much.
	//
	//   noise      0..1  how much grain
	//   noiseWash  0..1  0 = grain over the picture, 1 = static instead of it
	//   noiseGhost 0..1  how much structure clumps out of it
	//
	// Grain composites with `mix-blend-mode: overlay`, which is why the shader
	// sits at mid grey: one layer then works over both the deep blue of the
	// fly-in and the white of everything after it. The wash switches the blend
	// off, because a flood has to replace the picture, not tint it.

	// Backing-store ladder. Static does not want to be sharp, so even the top
	// rung is below native — and it steps down further if frames get long.
	const SCALES = [0.6, 0.42, 0.3];

	let canvas;
	let gl;
	let frame;
	let scaleIdx = 0;

	let uRes, uTime, uAmount, uGrain, uWash, uGhost, uGhostTex, uHasGhostTex;
	let ghostTexture = null;
	let hasGhost = 0;

	let t = 0;
	let amount = 0;
	let wash = 0;
	let ghost = 0;

	// Externally settable: hand this an image or a canvas and the ghost flashes
	// sample it instead of inventing blooms. Render a scene to an offscreen
	// canvas and pass it here to flash the run's own imagery through the static.
	export function setGhostSource(source) {
		if (!gl) return;
		if (!source) {
			hasGhost = 0;
			return;
		}
		if (!ghostTexture) ghostTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, ghostTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		hasGhost = 1;
	}

	function compile(type, src) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	function build() {
		const vs = compile(gl.VERTEX_SHADER, NOISE_VERT);
		const fs = compile(gl.FRAGMENT_SHADER, NOISE_FRAG);
		if (!vs || !fs) return false;

		const program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return false;
		}
		gl.useProgram(program);

		// One oversized triangle covers the viewport.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const aPos = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		uRes = gl.getUniformLocation(program, 'uRes');
		uTime = gl.getUniformLocation(program, 'uTime');
		uAmount = gl.getUniformLocation(program, 'uAmount');
		uGrain = gl.getUniformLocation(program, 'uGrain');
		uWash = gl.getUniformLocation(program, 'uWash');
		uGhost = gl.getUniformLocation(program, 'uGhost');
		uGhostTex = gl.getUniformLocation(program, 'uGhostTex');
		uHasGhostTex = gl.getUniformLocation(program, 'uHasGhostTex');
		return true;
	}

	function resize() {
		if (!gl) return;
		const scale = SCALES[scaleIdx];
		canvas.width = Math.max(2, Math.round(window.innerWidth * scale));
		canvas.height = Math.max(2, Math.round(window.innerHeight * scale));
		gl.viewport(0, 0, canvas.width, canvas.height);
		if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
	}

	let last = 0;
	let avg = 16;
	let slow = 0;
	let warmup = 0;

	function loop(now) {
		frame = requestAnimationFrame(loop);
		const raw = last ? now - last : 16;
		last = now;
		const dt = Math.min(raw / 1000, 0.05);
		t += dt;

		// Ease toward what the scene asked for, so a scene change is a swell
		// rather than a step.
		amount += (get(noise) - amount) * Math.min(1, dt * 6);
		wash += (get(noiseWash) - wash) * Math.min(1, dt * 5);
		ghost += (get(noiseGhost) - ghost) * Math.min(1, dt * 3);

		// Nothing to draw and nothing to see: skip the work entirely.
		const live = amount > 0.002 || wash > 0.002;
		canvas.style.opacity = live ? '1' : '0';
		if (!live) return;

		// Quantised: the grain re-rolls at NOISE.rate, not at the display rate.
		// Full-rate static shimmers; slower static crawls, which reads as
		// equipment rather than as an effect.
		if (uTime) gl.uniform1f(uTime, Math.floor(t * NOISE.rate));
		if (uAmount) gl.uniform1f(uAmount, amount);
		if (uGrain) gl.uniform1f(uGrain, NOISE.grain);
		if (uWash) gl.uniform1f(uWash, wash);
		if (uGhost) gl.uniform1f(uGhost, ghost);
		if (uHasGhostTex) gl.uniform1f(uHasGhostTex, hasGhost);
		if (uGhostTex && hasGhost) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, ghostTexture);
			gl.uniform1i(uGhostTex, 0);
		}

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		// GPU work is asynchronous, so frame interval is the cost signal.
		if (warmup < 30) {
			warmup += 1;
		} else {
			avg = avg * 0.85 + raw * 0.15;
			if (avg > 24 && scaleIdx < SCALES.length - 1) {
				if ((slow += 1) > 20) {
					scaleIdx += 1;
					slow = 0;
					avg = 16;
					resize();
				}
			} else {
				slow = 0;
			}
		}
	}

	onMount(() => {
		gl = canvas.getContext('webgl', { antialias: false, alpha: false });
		if (!gl || !build()) {
			gl = null;
			return;
		}
		resize();
		window.addEventListener('resize', resize);
		frame = requestAnimationFrame(loop);
	});

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		if (typeof window !== 'undefined') window.removeEventListener('resize', resize);
	});
</script>

<canvas bind:this={canvas} class:flood={$noiseWash > 0.5} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		/* Over the 3D, under the flash and the UI. */
		z-index: 3;
		opacity: 0;
		pointer-events: none;
		/* Mid grey is neutral under overlay, so the grain darkens and lightens
		   whatever is beneath it without tinting it. */
		mix-blend-mode: overlay;
		transition: opacity 0.2s linear;
	}

	/* A flood has to replace the picture, not tint it. */
	canvas.flood {
		mix-blend-mode: normal;
	}
</style>
