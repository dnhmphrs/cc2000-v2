<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { flare, fieldDecade } from '$lib/store/store';
	import { DECADE_FIELD } from '$lib/data/roomElements';

	// The shader below is used exactly as supplied: cos() series over a
	// stereographic projection from RP3, N = 2. Smooth and pulsey rather than
	// the chaotic tan() figure that used to be here.

	// Calm/search modulation of the mouse uniform.
	const M_CALM = 0.15;
	const M_SEARCH = 0.55;
	const M_MIN = 0.01;

	// The field is a transition effect, not the site's wallpaper: it is only on
	// while `flare` is up (the icosahedron opening and the search), and below the
	// cutoff the shader is not dispatched at all. Both edges are slow — this
	// swells and recedes, it does not flash.
	const FLARE_ATTACK = 1.6;
	const FLARE_DECAY = 1.2;
	const FLARE_OFF = 0.004;
	// How far up the field is allowed to come. It fills the whole frame, so this
	// is the single dial for how loud the search reads.
	const FLARE_MAX = 0.62;

	// This shader is fairly heavy; let the backing buffer step down on slower GPUs.
	const SCALES = [0.5, 0.35, 0.25];

	// WebGL 1 / GLSL ES 1.00 does not guarantee hyperbolic built-ins, so provide
	// equivalents using exp(). Names are prefixed to avoid implementation clashes.
	const PRELUDE = `
		precision highp float;

		float hSinh(float x) {
			float ex = exp(x);
			float enx = exp(-x);
			return 0.5 * (ex - enx);
		}

		float hCosh(float x) {
			float ex = exp(x);
			float enx = exp(-x);
			return 0.5 * (ex + enx);
		}

		float hTanh(float x) {
			float e = exp(-2.0 * abs(x));
			return sign(x) * (1.0 - e) / (1.0 + e);
		}
	`;

	const VERT = `
		attribute vec2 aPos;
		varying vec2 vUv;

		void main() {
			vUv = aPos * 0.5 + 0.5;
			gl_Position = vec4(aPos, 0.0, 1.0);
		}
	`;

	const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float aspectRatio;

// Function to create a symmetric and positive definite matrix
mat3 createDynamicOmega(vec2 mouse) {
    mouse.x *= 1.0;
    mouse.y *= 1.0;

    float sinX = hSinh(3.14159 * log(abs(mouse.x) + 0.1));
    float cosY = hCosh(3.14159 * log(abs(mouse.y) + 0.1));

    return mat3(
        sinX, 0.0, 0.0,
        0.0, cosY, 0.0,
        0.0, 0.0, 1.0
    );
}

const int N = 2;

// Function to compute the real part of the Riemann theta function
float riemannThetaReal(vec3 z, mat3 Omega) {
    float sum = 0.0;

    for (int n1 = -N; n1 <= N; ++n1) {
        for (int n2 = -N; n2 <= N; ++n2) {
            for (int n3 = -N; n3 <= N; ++n3) {
                vec3 n = vec3(float(n1), float(n2), float(n3));
                float nt_Omega_n = dot(n, Omega * n);
                float nt_z = 2.0 * dot(n, z);
                float exponent = 3.14159 * (nt_Omega_n + nt_z);
                float realPart = cos(exponent);
                sum += realPart;
            }
        }
    }

    return sum;
}

// Stereographic projection from RP3 to visualizable space
vec3 stereographicProject(vec4 p) {
    // Normalize the homogeneous coordinates
    vec4 normalized = p / length(p);

    // Use stereographic projection from the sphere S3 (double cover of RP3)
    // Project from north pole (0,0,0,1)
    float denom = 1.0 - normalized.w;

    if (abs(denom) < 0.001) {
        denom = 0.001; // Avoid division by zero
    }

    return normalized.xyz / denom;
}

void main() {
    // Map UV coordinates to projective space
    // Create homogeneous coordinates [x:y:z:w]
    float x = (vUv.x - 0.5) * 0.5;
    float y = (vUv.y - 0.5) * 0.5;

    // Create a point in RP3 using homogeneous coordinates
    // The fourth coordinate w varies with mouse position
    float w = 1.0 + mouse.x * 1.0;
    vec4 projectivePoint = vec4(x, y, mouse.y, w);

    // Apply stereographic projection to get a 3D point
    vec3 projected3D = stereographicProject(projectivePoint);

    // Normalize to reasonable range for theta function
    vec3 z = projected3D * 1.0;

    // Create dynamic Riemann matrix based on mouse input
    mat3 OmegaDynamic = createDynamicOmega(mouse);

    // Calculate the real part of the Riemann theta function
    float thetaValueReal = riemannThetaReal(z, OmegaDynamic);

    // Normalize theta value for coloring
    float normalizedTheta = 0.5 + 0.5 * hTanh(thetaValueReal * 0.1);

    // Create gradients for visualization
    vec3 gradient1 = mix(color1, color2, hCosh(normalizedTheta));
    vec3 gradient2 = mix(color3, gradient1, hSinh(normalizedTheta));

    gl_FragColor = vec4(gradient2, 1.0);
}
	`;

	let canvas;
	let gl;
	let frame;
	let uColor1, uColor2, uColor3, uMouse, uAspect;
	let scaleIdx = 0;
	let t = 0;
	let radius = M_CALM;
	let pointer = [0, 0];
	let pointerEase = [0, 0];
	let flareEase = 0;

	// The field's three stops, eased toward whichever decade the search is
	// currently looking at — so the page changes colour with the era on screen
	// instead of holding one palette through the whole run.
	const NEUTRAL = [
		[1.0, 0.86, 0.28], // yellow
		[0.22, 0.5, 0.82], // a brighter, less flat blue than the ground
		[0.04, 0.08, 0.28] // deep
	];
	let stops = NEUTRAL.map((c) => c.slice());

	const hexToRgb = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

	function targetStops() {
		const d = get(fieldDecade);
		const set = d && DECADE_FIELD[d];
		return set ? set.map(hexToRgb) : NEUTRAL;
	}

	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
		const vertexShader = compile(gl.VERTEX_SHADER, VERT);
		const fragmentShader = compile(gl.FRAGMENT_SHADER, PRELUDE + FRAG);
		if (!vertexShader || !fragmentShader) return null;

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return null;
		}

		gl.useProgram(program);

		// One oversized triangle covers the viewport; vUv is reconstructed 0..1.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

		const aPos = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		uColor1 = gl.getUniformLocation(program, 'color1');
		uColor2 = gl.getUniformLocation(program, 'color2');
		uColor3 = gl.getUniformLocation(program, 'color3');
		uMouse = gl.getUniformLocation(program, 'mouse');
		uAspect = gl.getUniformLocation(program, 'aspectRatio');

		return program;
	}

	function resize() {
		if (!gl) return;

		const scale = SCALES[scaleIdx];
		canvas.width = Math.max(2, Math.round(window.innerWidth * scale));
		canvas.height = Math.max(2, Math.round(window.innerHeight * scale));
		gl.viewport(0, 0, canvas.width, canvas.height);

		if (uAspect) gl.uniform1f(uAspect, window.innerWidth / window.innerHeight);
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

		// Flare envelope. The scene owns the level; this only shapes it.
		const want = clamp(get(flare), 0, 1);
		const rate = want > flareEase ? FLARE_ATTACK : FLARE_DECAY;
		flareEase += (want - flareEase) * Math.min(1, dt * rate);
		canvas.style.opacity = (flareEase * FLARE_MAX).toFixed(4);

		// Keep tracking the cursor even while dark, so the field doesn't snap to a
		// stale position the moment it comes up.
		pointerEase[0] += (pointer[0] - pointerEase[0]) * Math.min(1, dt * 2);
		pointerEase[1] += (pointer[1] - pointerEase[1]) * Math.min(1, dt * 2);

		if (flareEase < FLARE_OFF) return;

		// Search activity pushes the shader into a more energetic part of its
		// parameter space, in step with the flare.
		const target = M_CALM + (M_SEARCH - M_CALM) * flareEase;
		radius += (target - radius) * Math.min(1, dt * 2.2);

		if (uMouse) {
			gl.uniform2f(
				uMouse,
				clamp(radius + Math.sin(t * 0.19) * 0.03 + pointerEase[0] * 0.05, M_MIN, 0.95),
				clamp(radius + Math.cos(t * 0.146) * 0.03 - pointerEase[1] * 0.05, M_MIN, 0.95)
			);
		}

		// The shader arrived with fixed lattice colours (#d0d0d0 / #5099b4 /
		// #8fbd5a). They are driven per-decade instead: each room's era supplies
		// the three stops, eased so the turn from one decade to the next is a
		// colour change rather than a cut. DECADE_FIELD holds the palettes.
		const wantStops = targetStops();
		const k = Math.min(1, dt * 1.8);
		for (let i = 0; i < 3; i++) {
			for (let c = 0; c < 3; c++) stops[i][c] += (wantStops[i][c] - stops[i][c]) * k;
		}
		if (uColor1) gl.uniform3f(uColor1, stops[0][0], stops[0][1], stops[0][2]);
		if (uColor2) gl.uniform3f(uColor2, stops[1][0], stops[1][1], stops[1][2]);
		if (uColor3) gl.uniform3f(uColor3, stops[2][0], stops[2][1], stops[2][2]);

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
		if (!build()) return;

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', handlePointer);
		loop();
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
		z-index: 0;
		opacity: 0;
		pointer-events: none;
	}
</style>
