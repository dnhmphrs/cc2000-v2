// ── Backdrop shaders ─────────────────────────────────────────────────────────
// One full-screen fragment shader per 3D scene, each in its own file:
//
//   flat.js    a block colour           — the fly-in
//   theta.js   the Riemann theta field  — spare; loud on a white ground
//   static.js  a set being tuned        — the computation, while it searches
//   white.js   plain white              — the conception, and the spare
//
// A scene picks one by name from its backdrop(): `{ color, shader }`. The Stage
// publishes that, components/Background.svelte compiles it and draws it behind
// the 3D, and the 3D clears transparent over the top so it shows through.
//
// Every shader is compiled with PRELUDE in front of it and gets the same
// uniforms, so swapping one for another is a one-word change in a scene:
//
//   color1, color2, color3   vec3   the three stops, eased per decade
//   mouse                    vec2   the drift/energy parameter, 0..1
//   aspectRatio              float
//   uRot                     mat3   a rotation to carry the field with the
//                                   scene — the computation feeds it the
//                                   icosahedron's own attitude
//   uTime                    float   seconds since the page loaded
//   uFlare                   float   0..1, the scene's own `flare` eased
//
// vUv is 0..1 across the viewport.
import { FLAT } from './flat';
import { THETA } from './theta';
import { STATIC } from './static';
import { WHITE } from './white';

export const SHADERS = { flat: FLAT, theta: THETA, static: STATIC, white: WHITE };

// One oversized triangle; vUv is reconstructed from the clip position.
export const VERT = `
	attribute vec2 aPos;
	varying vec2 vUv;
	void main() {
		vUv = aPos * 0.5 + 0.5;
		gl_Position = vec4(aPos, 0.0, 1.0);
	}
`;

// WebGL 1 / GLSL ES 1.00 does not guarantee the hyperbolic built-ins, so they
// are provided here. Prefixed to avoid clashing with implementations that do.
export const PRELUDE = `
	precision highp float;
	varying vec2 vUv;
	uniform vec3 color1;
	uniform vec3 color2;
	uniform vec3 color3;
	uniform vec2 mouse;
	uniform float aspectRatio;
	uniform mat3 uRot;
	uniform float uTime;
	uniform float uFlare;

	float hSinh(float x) { return 0.5 * (exp(x) - exp(-x)); }
	float hCosh(float x) { return 0.5 * (exp(x) + exp(-x)); }
	float hTanh(float x) {
		float e = exp(-2.0 * abs(x));
		return sign(x) * (1.0 - e) / (1.0 + e);
	}
`;
