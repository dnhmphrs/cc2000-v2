// ── The static ───────────────────────────────────────────────────────────────
// The grain that runs under the whole experience: faint on the calculator,
// climbing through the fly-in, calm through the computation, and flooding the
// frame on the way back to the start.
//
// It is a plain WebGL 1 fragment shader with no dependencies, kept in its own
// file so it can be dropped into anything. NoiseField.svelte is one host for
// it; a three.js ShaderMaterial would be another.
//
// It is the BACKGROUND, not a film over the picture: it paints uGround — the
// active scene's own ground colour — and deviates either side of it, and the 3D
// is composited on top with a transparent clear. So the grain sits behind
// everything in the scene rather than over it.
//
// Two modes:
//
//   GRAIN (uWash = 0)  the ground, textured.
//   FLOOD (uWash = 1)  opaque static instead of it, for the wipe home.
//
// Ghosts. uGhost lets low-frequency shapes clump out of the noise — faint,
// dreamlike. Bind a texture to uGhostTex and raise uHasGhostTex to flash real
// imagery through it instead (render the scene to a target and pass it in);
// with no texture bound it makes soft drifting blooms on its own.

export const NOISE_VERT = `
	attribute vec2 aPos;
	varying vec2 vUv;
	void main() {
		vUv = aPos * 0.5 + 0.5;
		gl_Position = vec4(aPos, 0.0, 1.0);
	}
`;

export const NOISE_FRAG = `
	precision highp float;

	varying vec2 vUv;

	uniform vec2 uRes;        // canvas size in device pixels
	uniform vec3 uGround;     // the active scene's ground colour, sRGB 0..1
	uniform float uTime;      // ALREADY quantised by the host to uRate
	uniform float uAmount;    // 0..1, how much grain
	uniform float uGrain;     // grain cell size, device pixels
	uniform float uWash;      // 0 = signed grain, 1 = opaque static
	uniform float uGhost;     // 0..1, how much structure clumps out of it
	uniform sampler2D uGhostTex;
	uniform float uHasGhostTex;

	float hash(vec2 p) {
		p = fract(p * vec2(443.897, 441.423));
		p += dot(p, p.yx + 19.19);
		return fract((p.x + p.y) * p.x);
	}

	// Value noise, for the ghost blooms only — the grain itself wants to be
	// hard-edged per cell, not smooth.
	float valueNoise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
			mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
			f.y
		);
	}

	void main() {
		vec2 cell = floor(gl_FragCoord.xy / max(uGrain, 1.0));

		// Two rolls at different rates, so it crawls rather than shimmers.
		float a = hash(cell + uTime);
		float b = hash(cell * 0.37 - uTime * 1.7);
		float g = mix(a, b, 0.35);

		// A few scan bands drifting down the frame — the one thing that says
		// "signal" rather than "film".
		float band = sin((vUv.y + uTime * 0.013) * 220.0) * 0.5 + 0.5;
		g = mix(g, g * (0.82 + band * 0.36), 0.25);

		// Ghosts: either real imagery flashed through, or soft blooms.
		if (uGhost > 0.0) {
			float bloom;
			if (uHasGhostTex > 0.5) {
				vec3 tex = texture2D(uGhostTex, vUv).rgb;
				bloom = dot(tex, vec3(0.2126, 0.7152, 0.0722));
			} else {
				bloom = valueNoise(vUv * 3.2 + vec2(uTime * 0.031, uTime * 0.019));
			}
			// Flash it in and out, so it is glimpsed rather than shown.
			float flash = pow(valueNoise(vec2(uTime * 0.09, 3.7)), 2.0);
			g = mix(g, mix(g, bloom, 0.75), uGhost * flash);
		}

		// Heavier toward the edges, like a tube.
		vec2 c = vUv - 0.5;
		float vig = 1.0 + dot(c, c) * 1.3;

		// Deviate either side of the ground. Partly scaled by how light the ground
		// is, so the same amount reads on near-black and on white rather than
		// washing out on one — but only partly, because scaling it fully would
		// leave nothing at all on a near-black ground.
		float lift = 0.5 + 0.5 * max(max(uGround.r, uGround.g), uGround.b);
		vec3 grain = uGround + (g - 0.5) * clamp(uAmount * vig, 0.0, 1.0) * lift;

		gl_FragColor = vec4(mix(grain, vec3(g), uWash), 1.0);
	}
`;

// Uniform names, so a host can loop rather than hand-listing them.
export const NOISE_UNIFORMS = [
	'uRes',
	'uGround',
	'uTime',
	'uAmount',
	'uGrain',
	'uWash',
	'uGhost',
	'uGhostTex',
	'uHasGhostTex'
];
