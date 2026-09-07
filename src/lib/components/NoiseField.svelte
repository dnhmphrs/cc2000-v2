<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { noise, noiseWash, noiseGhost, sceneGround } from '$lib/store/store';
	import { NOISE } from '$lib/config';
	import { NOISE_VERT, NOISE_FRAG } from '$lib/three/shaders/noise';

	// ── The static layer ─────────────────────────────────────────────────────
	// The site's BACKGROUND. It paints the active scene's ground colour and
	// textures it, and the 3D canvas is composited on top with a transparent
	// clear — so the grain is behind everything in the scene rather than a film
	// over it. It is always drawing; the scenes only say how much.
	//
	//   sceneGround      the ground colour, from the active scene's backdrop()
	//   noise      0..1  how much grain
	//   noiseWash  0..1  0 = the ground, textured; 1 = static instead of it
	//   noiseGhost 0..1  how much structure clumps out of it

	// Backing-store ladder. Near native at the top, because the grain wants to
	// be fine now that it is not being blended over anything — it steps down if
	// frames get long.
	const SCALES = [0.85, 0.6, 0.4];

	let canvas;
	let gl;
	let frame;
	let scaleIdx = 0;

	let uRes, uGround, uTime, uAmount, uGrain, uWash, uGhost, uGhostTex, uHasGhostTex;
	let ghostTexture = null;
	let hasGhost = 0;

	let t = 0;
	let amount = 0;
	let wash = 0;
	let ghost = 0;
	// Eased toward the scene's ground, so the swing from near-black to white is
	// a fade rather than a cut behind the flash.
	const ground = [0, 0, 0];

	// Straight to 0..1 in DISPLAY space. This canvas is shown as sRGB and so is
	// the three.js one composited over it (outputEncoding = sRGB), so the two
	// only agree if the ground is passed through unconverted.
	function toRGB(hex) {
		return [16, 8, 0].map((sh) => ((hex >> sh) & 255) / 255);
	}

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
		uGround = gl.getUniformLocation(program, 'uGround');
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

		const want = toRGB(get(sceneGround));
		const k = Math.min(1, dt * 5);
		for (let i = 0; i < 3; i++) ground[i] += (want[i] - ground[i]) * k;
		if (uGround) gl.uniform3f(uGround, ground[0], ground[1], ground[2]);

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

<canvas bind:this={canvas} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		/* BEHIND the 3D, which clears transparent over it. This layer is the
		   ground the whole site sits on. */
		z-index: 0;
		pointer-events: none;
	}
</style>
