import * as THREE from 'three';
import { EGG, EGG_CORE_RATIO } from '$lib/config';

// ── The egg ──────────────────────────────────────────────────────────────────
// Built once here and used by BOTH the tunnel (scenes 1–2, perspective) and the
// computation (scene 3, orthographic), so the cut between them cannot move it.
//
// Nothing here is lit. A shaded sphere would need matching lights in two very
// different scenes and would STILL differ between a perspective and an
// orthographic camera; instead the core carries a painted gradient and the
// shell a view-space rim, both of which resolve identically under either.
// That is what makes the scenes line up.
//
// Sizes are in config/space.js — EGG_SCREEN is the one number both cameras
// derive from.

// Vertical, not radial: a sphere's UVs wrap in u, so anything not symmetric
// across the texture's left and right edges seams from pole to pole. Identical
// columns wrap invisibly, and a top-to-bottom ramp reads as lit from above.
function gradientTexture() {
	const c = document.createElement('canvas');
	c.width = 4;
	c.height = 256;
	const g = c.getContext('2d');
	const grad = g.createLinearGradient(0, 0, 0, 256);
	const stops = EGG.coreStops;
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
function shellMaterial() {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.FrontSide,
		uniforms: {
			uColor: { value: new THREE.Color(EGG.shell).convertSRGBToLinear() },
			uRim: { value: new THREE.Color(EGG.rim).convertSRGBToLinear() },
			uPower: { value: EGG.rimPower },
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
			uniform float uOpacity;
			varying vec3 vN;
			void main() {
				float f = pow(1.0 - abs(normalize(vN).z), uPower);
				gl_FragColor = vec4(mix(uColor, uRim, f), (0.16 + f * 0.72) * uOpacity);
			}
		`
	});
}

export function createEgg(radius) {
	const coreMat = new THREE.MeshBasicMaterial({
		map: gradientTexture(),
		transparent: true,
		opacity: 1,
		// No depth write: whatever is inside the yolk has to show through as it
		// dissolves. A transparent material that writes depth would hide it.
		depthWrite: false
	});
	const shellMat = shellMaterial();

	const core = new THREE.Mesh(new THREE.SphereGeometry(radius * EGG_CORE_RATIO, 48, 32), coreMat);
	const shell = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), shellMat);
	// Both sit at the same point, so distance sorting cannot separate them: say
	// it outright. Anything inside the egg is left on the default order, behind.
	core.renderOrder = 1;
	shell.renderOrder = 2;

	const group = new THREE.Group();
	group.add(core, shell);

	return {
		group,
		core,
		shell,
		radius,
		// 0..1 each, so a scene can dissolve the yolk without touching the shell.
		setCore(o) {
			coreMat.opacity = o;
			core.visible = o > 0.004;
		},
		setShell(o) {
			shellMat.uniforms.uOpacity.value = o;
			shell.visible = o > 0.004;
		},
		dispose() {
			core.geometry.dispose();
			shell.geometry.dispose();
			coreMat.map?.dispose();
			coreMat.dispose();
			shellMat.dispose();
		}
	};
}
