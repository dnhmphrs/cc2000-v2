import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createEgg } from './egg';
import { TUNNEL, DEEP_BLUE } from '$lib/config';

// ── The tunnel ───────────────────────────────────────────────────────────────
// The place the fly-in happens: deep blue air with the egg waiting at the far
// end of it, and the sperm corkscrewing in front of the camera. Scene 2 opens
// on the same world so the cut between them cannot move anything.
//
// This file BUILDS. FlyIn.svelte and Conception.svelte MOVE — they never create
// anything. Every dimension is in config/space.js under TUNNEL; everything here
// reads from there, so tuning the scene means editing the config, not this.
//
// The air changes colour across the run (deep blue for the approach, white for
// the conception), so the fog and the renderer's clear colour are one value:
// set it with setAir(), read it back with getAir(), and clear to that.

export function createTunnel() {
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(DEEP_BLUE, TUNNEL.fogDensity);
	let air = DEEP_BLUE;

	const camera = new THREE.PerspectiveCamera(
		TUNNEL.fov,
		window.innerWidth / window.innerHeight,
		TUNNEL.near,
		TUNNEL.far
	);
	camera.position.z = TUNNEL.camStart;

	const egg = createEgg(TUNNEL.shellR);
	egg.group.position.z = TUNNEL.eggZ;
	scene.add(egg.group);

	// The group is what spins; the model sits off that axis, so it corkscrews
	// rather than pirouettes. Those offsets are calibrated to the model's own
	// origin — move the group, not the model inside it.
	const sperm = new THREE.Group();
	sperm.position.y = TUNNEL.spermGroupY;
	sperm.visible = false;
	scene.add(sperm);

	const spermMaterial = new THREE.MeshBasicMaterial({
		color: new THREE.Color(0xf4f7ff).convertSRGBToLinear(),
		transparent: true,
		opacity: 0,
		fog: true
	});
	new GLTFLoader().load('/sperm.glb', (glb) => {
		const model = glb.scene.children[0] ?? glb.scene;
		// DELTAS, not absolutes. The offsets are calibrated against wherever the
		// model's own origin sits inside the file; assigning them outright moves
		// it by however far that origin is from zero, which is enough to put it
		// behind the camera.
		model.rotation.x += Math.PI;
		model.position.x += TUNNEL.spermOffset.x;
		model.position.y += TUNNEL.spermOffset.y;
		model.position.z += TUNNEL.spermOffset.z;
		model.scale.set(...TUNNEL.spermScale);
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

		// The lens itself is animatable — see TUNNEL.fovStart / fovEnd. Equal by
		// default, which is a plain approach; widening on the way in exaggerates
		// the rush without moving the camera any faster.
		setFov(deg) {
			if (Math.abs(camera.fov - deg) < 1e-4) return;
			camera.fov = deg;
			camera.updateProjectionMatrix();
		},

		resize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		},

		reset() {
			this.setAir(DEEP_BLUE);
			this.setFov(TUNNEL.fovStart);
			camera.position.z = TUNNEL.camStart;
			sperm.position.set(
				TUNNEL.spermFrom.x,
				TUNNEL.spermGroupY + TUNNEL.spermFrom.y,
				TUNNEL.camStart + TUNNEL.spermFrom.z
			);
			sperm.rotation.z = 0;
			sperm.visible = false;
			spermMaterial.opacity = 0;
			// Nothing in the air. The calculator's window looks onto this while it
			// waits, and the egg is not supposed to be visible yet — the fly-in
			// brings it up out of the fog (SCENES.flyIn.eggIn).
			egg.setCore(0);
			egg.setShell(0);
		},

		dispose() {
			egg.dispose();
			spermMaterial.dispose();
			sperm.traverse((o) => o.geometry?.dispose());
		}
	};
}
