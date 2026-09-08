// ── Backdrop shaders ─────────────────────────────────────────────────────────
// One full-screen fragment shader per 3D scene, each in its own file:
//
//   deep.js    the fly-in's air     — a lit channel falling to a dark rim, so
//                                     the fog has somewhere to go
//   grid.js    the blueprint field  — the void, ruled, with a lattice that
//                                     turns with the solid in front of it
//   flat.js    a block colour       — the spare, and what the calculator idles
//                                     on between runs
//   theta.js   the Riemann theta field — kept, unused; a one-word swap
//   white.js   plain white          — the fallback when a shader will not
//                                     compile
//
// A scene picks one by name from its backdrop(): `{ color, shader }`. The Stage
// publishes that, components/Background.svelte compiles it and draws it behind
// the 3D, and the 3D clears transparent over the top so it shows through.
//
// Every shader is compiled with PRELUDE in front of it and gets the same
// uniforms, so swapping one for another is a one-word change in a scene:
//
//   color1, color2, color3   vec3   the three stops. color1 is the scene's own
//                                   ground; 2 and 3 are eased per decade
//   mouse                    vec2   the drift/energy parameter, 0..1
//   aspectRatio              float
//   uTime                    float  seconds since the field started
//   uRot                     mat3   a rotation to carry the field with the
//                                   scene — the computation feeds it the
//                                   icosahedron's own attitude
//   uFade                    float  0..1 — how much of the FIGURE is drawn. At
//                                   0 a field is its ground colour and nothing
//                                   else, so two different shaders at fade 0
//                                   are the same frame. That is what carries
//                                   the fly-in into the conception without a
//                                   cut. Every shader must honour it.
//
// vUv is 0..1 across the viewport.
import { DEEP } from './deep';
import { GRID } from './grid';
import { FLAT } from './flat';
import { THETA } from './theta';
import { WHITE } from './white';

export const SHADERS = { deep: DEEP, grid: GRID, flat: FLAT, theta: THETA, white: WHITE };

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
	uniform float uTime;
	uniform mat3 uRot;
	uniform float uFade;

	float hSinh(float x) { return 0.5 * (exp(x) - exp(-x)); }
	float hCosh(float x) { return 0.5 * (exp(x) + exp(-x)); }
	float hTanh(float x) {
		float e = exp(-2.0 * abs(x));
		return sign(x) * (1.0 - e) / (1.0 + e);
	}
`;
