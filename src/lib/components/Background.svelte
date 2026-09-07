<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { flare, fieldDecade, backdrop, fieldRotation } from '$lib/store/store';
	import { DECADE_FIELD } from '$lib/data/roomElements';
	import { SHADERS, VERT, PRELUDE } from '$lib/three/shaders';

	// ── The backdrop ─────────────────────────────────────────────────────────
	// One full-screen shader behind the 3D, chosen by whichever scene is running.
	// The scenes name it in their backdrop() and the Stage publishes that; this
	// compiles it, and recompiles when the name changes. The shaders themselves
	// are in three/shaders/, one per file — nothing about them is known here.
	//
	// The 3D clears TRANSPARENT over the top, so this is genuinely what you see
	// behind the scene rather than something hidden under an opaque ground.
	//
	// Programs are cached by name: a run passes flat → theta → theta and comes
	// home to flat, so compiling on every change would recompile on every loop.

	// Calm/search modulation of the mouse uniform.
	const M_CALM = 0.15;
	const M_SEARCH = 0.55;
	const M_MIN = 0.01;

	// `flare` swells the field for the search. It drives the shader's ENERGY now
	// rather than its opacity: this canvas is the ground the whole site sits on,
	// so anything less than fully opaque shows the page behind it. Both edges
	// stay slow, so it breathes rather than flashing.
	const FLARE_ATTACK = 1.6;
	const FLARE_DECAY = 1.2;

	// These shaders are heavy; let the backing buffer step down on slower GPUs.
	const SCALES = [0.5, 0.35, 0.25];

	let canvas;
	let gl;
	let frame;
	let programs = {};
	let current = null;
	let uni = {};
	let scaleIdx = 0;
	let t = 0;
	let radius = M_CALM;
	let pointer = [0, 0];
	let pointerEase = [0, 0];
	let flareEase = 0;

	// The field's three stops, eased toward whichever decade the search is
	// looking at — so the page changes colour with the era on screen instead of
	// holding one palette through the whole run. color1 is overridden by the
	// scene's own backdrop colour, which is what makes `flat` work at all.
	const NEUTRAL = [
		[1.0, 0.86, 0.28],
		[0.22, 0.5, 0.82],
		[0.04, 0.08, 0.28]
	];
	let stops = NEUTRAL.map((c) => c.slice());
	let ground = [1, 1, 1];

	const hexToRgb = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

	function targetStops() {
		const d = get(fieldDecade);
		const set = d && DECADE_FIELD[d];
		return set ? set.map(hexToRgb) : NEUTRAL;
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

	function build(name) {
		const frag = SHADERS[name];
		if (!frag) return null;

		const vs = compile(gl.VERTEX_SHADER, VERT);
		const fs = compile(gl.FRAGMENT_SHADER, PRELUDE + frag);
		if (!vs || !fs) return null;

		const program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}

		return program;
	}

	// Point the pipeline at one of the compiled programs, building it on first
	// use. Every shader takes the same uniforms, so the lookups are uniform too.
	function use(name) {
		if (current === name) return;
		if (!programs[name]) {
			const p = build(name);
			// A shader that will not compile must not take the screen down with
			// it: fall back to plain white and leave the error in the console.
			if (!p) return name === 'white' ? undefined : use('white');
			programs[name] = p;
		}

		const program = programs[name];
		gl.useProgram(program);
		current = name;

		const aPos = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		uni = {
			c1: gl.getUniformLocation(program, 'color1'),
			c2: gl.getUniformLocation(program, 'color2'),
			c3: gl.getUniformLocation(program, 'color3'),
			mouse: gl.getUniformLocation(program, 'mouse'),
			aspect: gl.getUniformLocation(program, 'aspectRatio'),
			rot: gl.getUniformLocation(program, 'uRot'),
			time: gl.getUniformLocation(program, 'uTime'),
			flare: gl.getUniformLocation(program, 'uFlare')
		};
		if (uni.aspect) gl.uniform1f(uni.aspect, window.innerWidth / window.innerHeight);
	}

	function resize() {
		if (!gl) return;

		const scale = SCALES[scaleIdx];
		canvas.width = Math.max(2, Math.round(window.innerWidth * scale));
		canvas.height = Math.max(2, Math.round(window.innerHeight * scale));
		gl.viewport(0, 0, canvas.width, canvas.height);

		if (uni.aspect) gl.uniform1f(uni.aspect, window.innerWidth / window.innerHeight);
	}

	function handlePointer(e) {
		pointer = [(e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1];
	}

	let last = performance.now();
	let avg = 16;
	let slow = 0;
	let warmup = 0;

	function loop() {
		frame = requestAnimationFrame(loop);

		const now = performance.now();
		const raw = now - last;
		const dt = Math.min(raw / 1000, 0.05);
		last = now;
		t += dt;

		const b = get(backdrop);
		use(b.shader);

		// Flare envelope. The scene owns the level; this only shapes it.
		const want = clamp(get(flare), 0, 1);
		const rate = want > flareEase ? FLARE_ATTACK : FLARE_DECAY;
		flareEase += (want - flareEase) * Math.min(1, dt * rate);

		// Keep tracking the cursor even while dim, so the field doesn't snap to a
		// stale position the moment it comes up.
		pointerEase[0] += (pointer[0] - pointerEase[0]) * Math.min(1, dt * 2);
		pointerEase[1] += (pointer[1] - pointerEase[1]) * Math.min(1, dt * 2);

		// Search activity pushes the shader into a more energetic part of its
		// parameter space, in step with the flare.
		const target = M_CALM + (M_SEARCH - M_CALM) * flareEase;
		radius += (target - radius) * Math.min(1, dt * 2.2);

		if (uni.mouse) {
			gl.uniform2f(
				uni.mouse,
				clamp(radius + Math.sin(t * 0.19) * 0.03 + pointerEase[0] * 0.05, M_MIN, 0.95),
				clamp(radius + Math.cos(t * 0.146) * 0.03 - pointerEase[1] * 0.05, M_MIN, 0.95)
			);
		}

		// color1 is the scene's own ground, eased so the walk from deep blue to
		// white is a change rather than a cut — and it is what `flat` paints.
		const wantGround = hexToRgb(b.color);
		const g = Math.min(1, dt * 3.2);
		for (let c = 0; c < 3; c++) ground[c] += (wantGround[c] - ground[c]) * g;

		// color2 and color3 follow the decade the search is looking at.
		const wantStops = targetStops();
		const k = Math.min(1, dt * 1.8);
		for (let i = 1; i < 3; i++) {
			for (let c = 0; c < 3; c++) stops[i][c] += (wantStops[i][c] - stops[i][c]) * k;
		}

		if (uni.c1) gl.uniform3f(uni.c1, ground[0], ground[1], ground[2]);
		if (uni.c2) gl.uniform3f(uni.c2, stops[1][0], stops[1][1], stops[1][2]);
		if (uni.c3) gl.uniform3f(uni.c3, stops[2][0], stops[2][1], stops[2][2]);
		// Written in place by the computation each frame; identity everywhere else.
		if (uni.rot) gl.uniformMatrix3fv(uni.rot, false, fieldRotation);
		if (uni.time) gl.uniform1f(uni.time, t);
		if (uni.flare) gl.uniform1f(uni.flare, flareEase);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		// GPU work is asynchronous, so use frame interval as the cost signal.
		if (warmup < 30) {
			warmup += 1;
		} else {
			avg = avg * 0.85 + raw * 0.15;

			if (avg > 22 && scaleIdx < SCALES.length - 1) {
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
		if (!gl) return;

		// One oversized triangle covers the viewport; shared by every program.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

		use(get(backdrop).shader);
		if (!current) return;

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', handlePointer);
		frame = requestAnimationFrame(loop);
	});

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', handlePointer);
		}
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
		/* Under the Stage's canvas, which now clears transparent over it. */
		z-index: 0;
		pointer-events: none;
	}
</style>
