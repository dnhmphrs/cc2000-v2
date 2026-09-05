import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createEgg, EGG_SCREEN } from './egg';

// ── The tunnel ───────────────────────────────────────────────────────────────
// The place scenes 1 and 2 happen in: deep blue air with the egg waiting at the
// far end of it, and the sperm corkscrewing in front of the camera.
//
// This file is the LOOK — every object, material and dimension lives here.
// FlyIn.svelte and Conception.svelte are the MOTION: they move what is built
// here and never build anything themselves.
//
// The air changes colour across the run — deep blue for the approach, white for
// the conception — so the fog and the renderer's clear colour are one value,
// set with setAir(). Ask for it back with getAir() and clear to that.

export const DEEP_BLUE = 0x0a246a;
export const WHITE = 0xffffff;
const FOG_DENSITY = 0.006;

// The egg, at the far end. SHELL_R is a world size; how big it READS is
// EGG_SCREEN (in world/egg.js), which the fly-in turns into a camera distance.
export const EGG_Z = -150;
export const SHELL_R = 22;

// The camera, and where the sperm rides relative to it.
export const CAM_FOV = 30;
export const CAM_START = 100;
export const SPERM_LEAD = 5.5;

// Where the camera has to stop for the shell to fill EGG_SCREEN of the frame's
// half-height. Scene 3 sizes its own sphere from the same number, which is what
// makes the cut between the two invisible.
export const CAM_END = EGG_Z + SHELL_R / (EGG_SCREEN * Math.tan((CAM_FOV * Math.PI) / 360));

export function createTunnel() {
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(DEEP_BLUE, FOG_DENSITY);
	let air = DEEP_BLUE;

	const camera = new THREE.PerspectiveCamera(
		CAM_FOV,
		window.innerWidth / window.innerHeight,
		0.5,
		400
	);
	camera.position.z = CAM_START;

	const egg = createEgg(SHELL_R);
	egg.group.position.z = EGG_Z;
	scene.add(egg.group);

	// The group is what spins; the model sits off that axis, so it corkscrews
	// rather than pirouettes. These offsets are calibrated to the model's own
	// origin — move the group, not the model inside it.
	const sperm = new THREE.Group();
	sperm.position.y = -0.1;
	sperm.visible = false;
	scene.add(sperm);

	const spermMaterial = new THREE.MeshBasicMaterial({
		color: new THREE.Color(0xf4f7ff).convertSRGBToLinear(),
		transparent: true,
		fog: true
	});
	new GLTFLoader().load('/sperm.glb', (glb) => {
		const model = glb.scene.children[0] ?? glb.scene;
		model.rotation.x += Math.PI;
		model.position.y -= 0.695;
		model.position.z += 4;
		model.scale.set(0.2, 0.4, 0.2);
		model.traverse((child) => {
			if (child.material) child.material = spermMaterial;
		});
		sperm.add(model);
	});

	return {
		scene,
		camera,
		egg,
		sperm,
		spermMaterial,

		setAir(hex) {
			air = hex;
			scene.fog.color.setHex(hex);
		},
		getAir() {
			return air;
		},

		resize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		},

		reset() {
			this.setAir(DEEP_BLUE);
			camera.position.z = CAM_START;
			sperm.position.set(0, -0.1, CAM_START - SPERM_LEAD);
			sperm.rotation.z = 0;
			sperm.visible = false;
			spermMaterial.opacity = 0;
			egg.setCore(1);
			egg.setShell(1);
		},

		dispose() {
			egg.dispose();
			spermMaterial.dispose();
			sperm.traverse((o) => o.geometry?.dispose());
		}
	};
}
