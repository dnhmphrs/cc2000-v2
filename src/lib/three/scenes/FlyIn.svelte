<script>
	import * as THREE from 'three';
	import { lerp, clamp, easeInOutCubic } from '$lib/functions/utils';
	import {
		DEEP_BLUE,
		WHITE,
		CAM_START,
		CAM_END,
		EGG_Z,
		SHELL_R,
		SPERM_LEAD
	} from '../world/tunnel';

	// ── Scene 1: the fly in ──────────────────────────────────────────────────
	// Deep blue air. The camera runs forward and pulls up in front of the egg;
	// the sperm appears once the machine's chassis has flown past the lens,
	// rides just ahead of the camera, then breaks away and goes in.
	//
	// The air whitens over the last stretch, so the flash the stage throws at
	// the end lands on a frame that is already going white and scene 2 can open
	// on white with no cut.
	//
	// Everything moved here is built in world/tunnel.js. Nothing is created in
	// this file: it is choreography only.

	export let world;

	const FLY_DUR = 5.2; // seconds, launch to arrival
	const SPIN = 10; // rad/s of corkscrew — the one constant

	// You do not see it until you are through the machine's screen. The chassis
	// takes 1.5s to fly past (see LAUNCH_MS in Machine.svelte).
	const SPERM_IN = 1.5 / FLY_DUR;
	const SPERM_FADE = 0.5; // seconds to come up out of the fog

	// The break away: fraction of the flight at which the sperm stops riding
	// with the camera and drives for the egg on its own.
	const DIVE_FROM = 0.78;
	const FADE_FROM = 0.55; // fraction of the dive at which it starts to vanish

	// The last stretch, over which the blue turns white.
	const WHITEN_FROM = 0.82;

	const blue = new THREE.Color(DEEP_BLUE);
	const white = new THREE.Color(WHITE);
	const air = new THREE.Color();

	// Held at the start until the machine says go.
	let flying = false;
	let t = 0;
	let elapsed = 0; // never resets while mounted; the corkscrew is continuous

	export function enter() {
		flying = false;
		t = 0;
		world.reset();
	}

	export function launch() {
		flying = true;
		t = 0;
	}

	export function update(dt) {
		elapsed += dt;
		world.sperm.rotation.z = -elapsed * SPIN;

		if (flying) t += dt;
		const flight = clamp(t / FLY_DUR, 0, 1);

		// Sets off, cruises, pulls up.
		const camZ = lerp(CAM_START, CAM_END, easeInOutCubic(flight));
		world.camera.position.z = camZ;

		// Rides ahead of the camera, then goes on alone.
		const dive = clamp((flight - DIVE_FROM) / (1 - DIVE_FROM), 0, 1);
		world.sperm.position.z = lerp(camZ - SPERM_LEAD, EGG_Z + SHELL_R * 0.5, dive * dive);

		const shown = clamp((t - SPERM_IN * FLY_DUR) / SPERM_FADE, 0, 1);
		const gone = clamp((dive - FADE_FROM) / (1 - FADE_FROM), 0, 1);
		world.spermMaterial.opacity = shown * (1 - gone);
		world.sperm.visible = world.spermMaterial.opacity > 0.004;

		// Blue → white, under the flash.
		air
			.copy(blue)
			.lerp(white, easeInOutCubic(clamp((flight - WHITEN_FROM) / (1 - WHITEN_FROM), 0, 1)));
		world.setAir(air.getHex());

		return flying && t >= FLY_DUR;
	}

	export function backdrop() {
		return { color: world.getAir(), alpha: 1 };
	}

	export function render(r) {
		r.render(world.scene, world.camera);
	}

	export function resize() {
		world.resize();
	}

	export function reset() {
		enter();
	}
</script>
