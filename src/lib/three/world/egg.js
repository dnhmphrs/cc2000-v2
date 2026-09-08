import * as THREE from 'three';
import { EGG, EGG_CORE_RATIO } from '$lib/config';

// ── The egg ──────────────────────────────────────────────────────────────────
// Built once here and used by BOTH the tunnel (scene 2, perspective) and the
// lattice (scenes 3–4, orthographic).
//
// There are no LIGHTS. A lit sphere would need matching lamps in two very
// different scenes and would STILL differ between a perspective and an
// orthographic camera. Instead everything is done in VIEW space, where the two
// projections agree: the core carries a painted top-to-bottom gradient, and the
// shell carries a rim, a key and a specular worked out from the view normal
// alone. The result is a wet, glossy egg that costs one material and resolves
// identically under either camera — and the highlight can be walked across it
// by moving one uniform, which is what makes it read as a surface rather than
// as a sticker.
//
// The shell takes a BASE alpha as well as a rim, and the difference between the
// two is the difference between the two halves of the run. On the deep blue the
// egg is an object and wants a little body (base 0.16); on the void it is a
// CIRCLE — a gold rim with nothing inside it — because any body at all is a
// grey wash over black. Same material, one number.
//
// Sizes are in config/space.js — EGG_SCREEN is the one number both cameras
// derive from.

// Vertical, not radial: a sphere's UVs wrap in u, so anything not symmetric
// across the texture's left and right edges seams from pole to pole. Identical
// columns wrap invisibly, and a top-to-bottom ramp reads as lit from above.
function gradientTexture(stops) {
	const c = document.createElement('canvas');
	c.width = 4;
	c.height = 256;
	const g = c.getContext('2d');
	const grad = g.createLinearGradient(0, 0, 0, 256);
	stops.forEach((hex, i) => grad.addColorStop(i / (stops.length - 1), hex));
	g.fillStyle = grad;
	g.fillRect(0, 0, 4, 256);
	const tex = new THREE.CanvasTexture(c);
	tex.encoding = THREE.sRGBEncoding;
	tex.wrapS = THREE.RepeatWrapping;
	return tex;
}

// The rim. `1 - |n.z|` in VIEW space is the silhouette however the camera is
// projected, so this is the one fresnel that is the same under both cameras.
// Front faces only: drawing both hemispheres double-blends at the silhouette,
// where the geometry is edge-on, and bands there.
function shellMaterial({ shell, rim, rimPower, base, key, gloss }) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.FrontSide,
		uniforms: {
			uColor: { value: new THREE.Color(shell) },
			uRim: { value: new THREE.Color(rim) },
			uPower: { value: rimPower },
			uBase: { value: base },
			uKey: { value: key },
			uGloss: { value: gloss },
			// The lamp, in VIEW space. Walk it and the highlight travels.
			uLight: { value: new THREE.Vector3(-0.45, 0.6, 0.66).normalize() },
			uOpacity: { value: 1 }
		},
		vertexShader: `
			varying vec3 vN;
			void main() {
				vN = normalize(normalMatrix * normal);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform vec3 uColor;
			uniform vec3 uRim;
			uniform float uPower;
			uniform float uBase;
			uniform float uKey;
			uniform float uGloss;
			uniform vec3 uLight;
			uniform float uOpacity;
			varying vec3 vN;
			void main() {
				vec3 n = normalize(vN);
				float f = pow(1.0 - abs(n.z), uPower);
				float a = (uBase + f * (1.0 - uBase * 0.4)) * uOpacity;

				// The key and the highlight. Both fall out of the view normal, so
				// they are the same under a perspective and an orthographic camera —
				// which is the whole reason this is not a lit material.
				float lam = max(dot(n, uLight), 0.0);
				vec3 half3 = normalize(uLight + vec3(0.0, 0.0, 1.0));
				float spec = pow(max(dot(n, half3), 0.0), uGloss) * uKey * uOpacity;

				vec3 lit = mix(uColor, uRim, f) * mix(1.0, 0.6 + 0.6 * lam, uKey);
				lit += uRim * spec;
				a = clamp(a + spec, 0.0, 1.0);
				// PREMULTIPLIED. three.js runs the canvas premultiplied, so normal
				// blending is (ONE, ONE_MINUS_SRC_ALPHA) and a shader that hands back
				// straight colour paints at full strength whatever its alpha says —
				// which is how a rim that should be a hairline circle ended up a
				// solid gold disc. Built-in materials do this in
				// <premultiplied_alpha_fragment>; a ShaderMaterial has to do it here.
				gl_FragColor = vec4(lit * a, a);
			}
		`
	});
}

export function createEgg(radius, opts = {}) {
	const shell = opts.shell ?? EGG.shell;
	const rim = opts.rim ?? EGG.rim;
	const rimPower = opts.rimPower ?? EGG.rimPower;
	const base = opts.base ?? 0.16;
	// 0 turns the lamp off entirely and leaves a pure rim — which is what the
	// void wants and what a wet egg on the deep blue very much does not.
	const key = opts.key ?? EGG.key;
	const gloss = opts.gloss ?? EGG.gloss;
	const stops = opts.coreStops ?? EGG.coreStops;

	// The yolk. A painted ramp for its colour and the SAME view-space lamp the
	// shell uses for its form — an unlit ball is a flat disc however nicely it is
	// painted, and this is the thing the whole of scene 2 is flying toward.
	//
	// No depth write: whatever is inside the yolk has to show through as it
	// dissolves. A transparent material that writes depth would hide it.
	const coreMat = new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: {
			uMap: { value: gradientTexture(stops) },
			uOpacity: { value: 1 },
			uKey: { value: key },
			uLight: { value: new THREE.Vector3(-0.45, 0.6, 0.66).normalize() }
		},
		vertexShader: `
			varying vec3 vN;
			varying vec2 vUv;
			void main() {
				vN = normalize(normalMatrix * normal);
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform sampler2D uMap;
			uniform float uOpacity;
			uniform float uKey;
			uniform vec3 uLight;
			varying vec3 vN;
			varying vec2 vUv;
			void main() {
				vec3 n = normalize(vN);
				float lam = max(dot(n, uLight), 0.0);
				vec3 col = texture2D(uMap, vUv).rgb;
				// Wrapped, not clamped: a hard terminator on a translucent ovum reads
				// as a billiard ball. This keeps the shadow side alive.
				col *= mix(1.0, 0.55 + 0.7 * lam, uKey);
				gl_FragColor = vec4(col * uOpacity, uOpacity);
			}
		`
	});
	const shellMat = shellMaterial({ shell, rim, rimPower, base, key, gloss });

	const core = new THREE.Mesh(new THREE.SphereGeometry(radius * EGG_CORE_RATIO, 48, 32), coreMat);
	const shellMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), shellMat);
	// Both sit at the same point, so distance sorting cannot separate them: say
	// it outright. Anything inside the egg is left on the default order, behind.
	core.renderOrder = 1;
	shellMesh.renderOrder = 2;

	const group = new THREE.Group();
	group.add(core, shellMesh);

	return {
		group,
		core,
		shell: shellMesh,
		radius,
		// 0..1 each, so a scene can dissolve the yolk without touching the shell.
		setCore(o) {
			coreMat.uniforms.uOpacity.value = o;
			core.visible = o > 0.004;
		},
		setShell(o) {
			shellMat.uniforms.uOpacity.value = o;
			shellMesh.visible = o > 0.004;
		},
		// Walk the lamp across the surface. View space: +x right, +y up, +z at the
		// camera. Normalised here so callers can hand over any direction.
		setLight(x, y, z) {
			shellMat.uniforms.uLight.value.set(x, y, z).normalize();
			coreMat.uniforms.uLight.value.copy(shellMat.uniforms.uLight.value);
		},
		dispose() {
			core.geometry.dispose();
			shellMesh.geometry.dispose();
			coreMat.uniforms.uMap.value?.dispose();
			coreMat.dispose();
			shellMat.dispose();
		}
	};
}
