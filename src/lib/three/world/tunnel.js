import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ── The tunnel ───────────────────────────────────────────────────────────────
// The place scenes 1 and 2 happen in: a corridor of counter-turning grids
// running away into fog, the egg waiting at the far end, and the sperm
// corkscrewing along in front of the camera.
//
// This file is the LOOK — every object, material and dimension lives here.
// FlyIn.svelte and Conception.svelte are the MOTION: they move what is built
// here and never build anything themselves. Change the feel of the corridor in
// this file; change the choreography in those two.

export const BACKDROP = 0x232323;
const FOG_DENSITY = 0.006;

// The corridor: fixed planes in world space that the camera flies through.
// Big enough to fill the frame, fine enough that a plane close to the lens
// still reads as mesh rather than as two stray lines.
const GRID_SIZE = 400;
const GRID_DIVISIONS = 40;
const GRID_COLOR = 0xf0f0f0;
const GRID_SPIN = 0.1; // rad/s, alternating sign plane to plane

// Where the panes sit. The gap in the middle is the egg — nothing crosses it —
// and the run at the back is what the egg is silhouetted against once the
// camera has flown out of the near ones.
const GRID_Z = [60, 20, -20, -60, -100, -200, -260];

// The egg, at the far end.
export const EGG_Z = -150;
export const EGG_R = 14;
export const SHELL_R = 22;

// The camera, and where the sperm rides relative to it. It sits further out
// while the machine is up, because the machine's window is a small crop of the
// frame and a sperm right in the lens falls outside it; it closes to
// SPERM_LEAD once the chassis has flown past.
export const CAM_FOV = 30;
export const CAM_START = 100;
export const SPERM_LEAD = 5.5;
export const SPERM_LEAD_IDLE = 13;

export function createTunnel() {
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(BACKDROP, FOG_DENSITY);

	const camera = new THREE.PerspectiveCamera(
		CAM_FOV,
		window.innerWidth / window.innerHeight,
		0.5,
		400
	);
	camera.position.z = CAM_START;

	// Each plane faces the camera and turns in its own plane; alternating the
	// direction is what makes the depth read as movement rather than a slide.
	const grids = GRID_Z.map((z, i) => {
		const g = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, GRID_COLOR, GRID_COLOR);
		g.rotation.x = Math.PI / 2;
		g.position.z = z;
		g.userData.dir = i % 2 ? 1 : -1;
		scene.add(g);
		return g;
	});

	// Two spheres: a matte core, and a slack translucent shell around it.
	const core = new THREE.Mesh(
		new THREE.SphereGeometry(EGG_R, 32, 16),
		new THREE.MeshToonMaterial({ color: 0xd0d0d0 })
	);
	const shell = new THREE.Mesh(
		new THREE.SphereGeometry(SHELL_R, 32, 16),
		new THREE.MeshPhysicalMaterial({ color: 0xd0d0d0, transparent: true, opacity: 0.5 })
	);
	core.position.z = EGG_Z;
	shell.position.z = EGG_Z;
	scene.add(core, shell);

	scene.add(new THREE.HemisphereLight(0xd0d0d0, BACKDROP, 1.5));

	// The group is what spins; the model sits off that axis, so it corkscrews
	// rather than pirouettes. These offsets are calibrated to the model's own
	// origin — move the group, not the model inside it.
	const sperm = new THREE.Group();
	sperm.position.y = -0.1;
	sperm.visible = false;
	scene.add(sperm);

	const spermMaterial = new THREE.MeshToonMaterial({ color: 0xf0f0f0, transparent: true });
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
		sperm.visible = true;
	});

	return {
		scene,
		camera,
		grids,
		core,
		shell,
		sperm,
		spermMaterial,

		// The corridor turns whatever else is happening — it is the one thing
		// that never stops, in both scenes.
		drift(dt) {
			grids.forEach((g) => (g.rotation.y += g.userData.dir * dt * GRID_SPIN));
		},

		resize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		},

		reset() {
			camera.position.z = CAM_START;
			sperm.position.set(0, -0.1, CAM_START - SPERM_LEAD_IDLE);
			sperm.rotation.z = 0;
			sperm.visible = sperm.children.length > 0;
			spermMaterial.opacity = 1;
			grids.forEach((g) => (g.rotation.y = 0));
		},

		dispose() {
			scene.traverse((o) => {
				o.geometry?.dispose();
				o.material?.dispose();
			});
		}
	};
}
