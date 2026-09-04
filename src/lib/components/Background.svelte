<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { palette } from '$lib/theme';
	import { flare } from '$lib/store/store';

	// ── Knobs ─────────────────────────────────────────────────────────────────
	// How much of the palette colour the shader's fill gets. The shader paints
	// color1 on one side of the theta sum and black on the other, so this is the
	// single control over how loud the background reads. It has to stay well
	// under 1 or the flare washes out the white wireframe drawn on top of it.
	const INK = 0.34;

	// The field is a *transition effect*, not the site's wallpaper. It is drawn
	// only while `flare` is up — the icosahedron opening and the search — and the
	// canvas is fully transparent (and the shader not even dispatched) the rest of
	// the time. Rising edges are fast so the open reads as a flash; the decay is
	// slow so it bleeds off through the landing.
	const FLARE_ATTACK = 7.0;
	const FLARE_DECAY = 1.9;
	const FLARE_OFF = 0.004; // below this the frame is skipped entirely

	// The shader's `mouse` is its only input, and it is very non-linear:
	//   |mouse| small  → both tanh terms saturate, Omega settles, and the probe
	//                    slice sits nearly flat. Calm, legible figure.
	//   |mouse| → 1    → they unsaturate and the slice fills with hyperplanes.
	// Neither component may ever reach zero: the shader's quaternion axis is
	// normalize(vec3(x*y, x*y, x*y)), which is 0/0 on either axis.
	const M_CALM = 0.15;
	const M_SEARCH = 0.55; // where it goes while the search is running
	const M_MIN = 0.01;

	// 343 tan() calls per pixel — by far the most expensive thing on the page. The
	// buffer is rendered well under viewport size and stretched by CSS (the figure
	// is a soft full-screen wash, so the resampling does not read), and it steps
	// down further if the frame rate can't hold. This used to be [1.0], i.e. no
	// ladder at all, which is what made the field so costly to leave running.
	const SCALES = [0.6, 0.42, 0.3];

	const PRELUDE = `
		precision highp float;
		float tanh(float x) {
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
precision highp float; // Use medium precision for balance between quality and performance
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float aspectRatio;

// Function to create a symmetric and positive definite matrix
mat3 createDynamicOmega(vec2 mouse) {
    float a = tanh(3.14159 * log(abs(mouse.x ) + 0.001));
    float b = tanh(3.14159 * log(abs(mouse.y ) + 0.001));
    float c = a * b * 0.5; // coupling / shear term

    // Symmetric positive definite with off-diagonal coupling
    return mat3(
        1.0 + a,  c,       c * 0.5,
        c,        1.0 + b, c * 0.5,
        c * 0.5,  c * 0.5, 1.0
    );
}


const int N = 3; // Reduced number of terms in the series for better performance

// Function to compute the real part of the Riemann theta function
float riemannThetaReal(vec3 z, mat3 Omega) {
    float sum = 0.0;

    // Iterate over the range of n values for 3 dimensions
    for (int n1 = -N; n1 <= N; ++n1) {
        for (int n2 = -N; n2 <= N; ++n2) {
            for (int n3 = -N; n3 <= N; ++n3) {
                vec3 n = vec3(float(n1), float(n2), float(n3));

                // Compute n^T * Omega * n
                float nt_Omega_n = dot(n, Omega * n);

                // Compute 2 * n^T * z
                float nt_z = 2.0 * dot(n, z);

                // Compute the real part of the exponential term
                float exponent = 3.14159 * (nt_Omega_n + nt_z);
                float realPart = tan(exponent); // Use cosine for the real part

                sum += realPart;
            }
        }
    }

    return sum;
}

// Quaternion from mouse position
vec4 mouseToQuat(vec2 mouse) {
    float angle = length(mouse) * 3.14159;
    float halfAngle = angle * 0.5;
    vec3 axis = normalize(vec3(mouse.x * mouse.y, mouse.x * mouse.y, mouse.x * mouse.y)); // avoid zero
    return vec4(axis * sin(halfAngle), cos(halfAngle));
}

// Rotate a vector by a quaternion
vec3 rotateByQuat(vec3 v, vec4 q) {
    vec3 u = q.xyz;
    float s = q.w;
    return 2.0 * dot(u, v) * u
         + (s*s - dot(u,u)) * v
         + 2.0 * s * cross(u, v);
}

void main() {
    // Map the fragment coordinates to the complex plane
    float x = vUv.x * 0.05 - 0.025;
    float y = vUv.y * 0.05 - 0.025;

    // Create a dynamic Riemann matrix based on mouse input
    mat3 OmegaDynamic = createDynamicOmega(mouse); // createDynamicOmega(mouse);

    // Construct a 3D vector for the z variable
    // vec3 z = vec3(x, y, x * y); // Static third component

    vec4 q = mouseToQuat(mouse);
    vec3 baseSlice = vec3(x, y, 0.0); // flat probe plane
    vec3 z = rotateByQuat(baseSlice, q); // rotate it through the volume

    // float accum = 0.0;
    // int STEPS = 8;
    // for (int i = 0; i < STEPS; i++) {
    //     float t = (float(i) / float(STEPS)) - 0.5;
    //     vec3 z = vec3(x, y, t * 0.05);
    //     accum += riemannThetaReal(z, OmegaDynamic);
    // }
    // float thetaValueReal = accum / float(STEPS);

    // Calculate the real part of the Riemann theta function at z
    float thetaValueReal = riemannThetaReal(z, OmegaDynamic);

    // Normalize thetaValue to map to color range
    float normalizedTheta = 0.5 + 0.5 * tanh(thetaValueReal);

    // Create gradients for visualization
    vec3 gradient1 = mix(color1, color1, log(normalizedTheta));
    vec3 gradient2 = mix(color1, gradient1, log(normalizedTheta));


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

	// Eased flare level, plus a one-shot burst that fires on the rising edge —
	// the white bloom that sells the icosahedron cracking open.
	let flareEase = 0;
	let burst = 0;
	let burstArmed = true;
	let burstEl;

	const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

	function compile(type, src) {
		const s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(s));
		}
		return s;
	}

	function build() {
		const p = gl.createProgram();
		gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
		gl.attachShader(p, compile(gl.FRAGMENT_SHADER, PRELUDE + FRAG));
		gl.linkProgram(p);
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(p));
			return null;
		}
		gl.useProgram(p);

		// One triangle big enough to cover the viewport; vUv comes out 0..1.
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const aPos = gl.getAttribLocation(p, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		// color2/color3/aspectRatio are declared but unused, so the compiler
		// strips them and these come back null. Guarded at every set.
		uColor1 = gl.getUniformLocation(p, 'color1');
		uColor2 = gl.getUniformLocation(p, 'color2');
		uColor3 = gl.getUniformLocation(p, 'color3');
		uMouse = gl.getUniformLocation(p, 'mouse');
		uAspect = gl.getUniformLocation(p, 'aspectRatio');
		return p;
	}

	function resize() {
		if (!gl) return;
		const s = SCALES[scaleIdx];
		canvas.width = Math.max(2, Math.round(window.innerWidth * s));
		canvas.height = Math.max(2, Math.round(window.innerHeight * s));
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

		// One bloom per run, on the way up.
		if (burstArmed && want > 0.25) {
			burst = 1;
			burstArmed = false;
		} else if (want < 0.02) {
			burstArmed = true;
		}
		burst *= Math.exp(-dt * 4.4);
		if (burstEl) burstEl.style.opacity = (burst * burst * 0.55).toFixed(4);

		canvas.style.opacity = flareEase.toFixed(4);

		// Keep tracking the cursor even while dark, so the field doesn't snap to a
		// stale position the moment it lights up.
		pointerEase[0] += (pointer[0] - pointerEase[0]) * Math.min(1, dt * 2);
		pointerEase[1] += (pointer[1] - pointerEase[1]) * Math.min(1, dt * 2);

		// Nothing on screen → don't pay for 343 tan() calls per pixel.
		if (flareEase < FLARE_OFF) return;

		// The field's own loudness rides the flare: calm as it comes up, pushed out
		// into the hyperplane regime at full burn during the search.
		const target = M_CALM + (M_SEARCH - M_CALM) * flareEase;
		radius += (target - radius) * Math.min(1, dt * 2.2);

		// A slow drift on two different periods so the figure keeps moving, plus a
		// little pull from the cursor. Both components stay well clear of zero.
		if (uMouse) {
			gl.uniform2f(
				uMouse,
				clamp(radius + Math.sin(t * 0.19) * 0.03 + pointerEase[0] * 0.05, M_MIN, 0.95),
				clamp(radius + Math.cos(t * 0.146) * 0.03 - pointerEase[1] * 0.05, M_MIN, 0.95)
			);
		}

		// Re-read the palette every frame, as the old uiColor() did, so a live
		// palette swap lands without a remount.
		const [r, g, b] = get(palette).ui;
		const c = [(r / 255) * INK, (g / 255) * INK, (b / 255) * INK];
		if (uColor1) gl.uniform3f(uColor1, c[0], c[1], c[2]);
		if (uColor2) gl.uniform3f(uColor2, c[0], c[1], c[2]);
		if (uColor3) gl.uniform3f(uColor3, c[0], c[1], c[2]);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		// GPU work is async, so timing the draw call tells you nothing — the frame
		// interval is what actually reveals the cost. Drop a level if it sags.
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
		if (!gl) return; // no WebGL: leave the page background showing through
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
<div class="burst" bind:this={burstEl} />

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

	/* The bloom on the rising edge — a soft wash from the centre, driven by the
	   loop, sitting above the field but below the 3D canvas. */
	.burst {
		position: fixed;
		inset: 0;
		z-index: 0;
		opacity: 0;
		pointer-events: none;
		background: radial-gradient(
			circle at 50% 50%,
			rgba(var(--fg-rgb), 0.95) 0%,
			rgba(var(--fg-rgb), 0.28) 22%,
			transparent 52%
		);
	}
</style>
