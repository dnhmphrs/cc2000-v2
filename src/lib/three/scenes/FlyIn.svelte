<script>
	import { lerp, clamp, easeInOutCubic } from '$lib/functions/utils';
	import { BACKDROP, CAM_START, EGG_Z, EGG_R, SPERM_LEAD, SPERM_LEAD_IDLE } from '../world/tunnel';

	// ── Scene 1: the fly in ──────────────────────────────────────────────────
	// The camera runs down the corridor and pulls up in front of the egg. The
	// sperm rides just ahead of it, corkscrewing, then breaks away at the last
	// moment and goes in — and by the time this finishes it is gone.
	//
	// Everything moved here is built in world/tunnel.js. Nothing is created in
	// this file: it is choreography only.

	export let world;

	const CAM_END = -55; // where the camera pulls up, looking at the egg
	const FLY_DUR = 5.2; // seconds, launch to arrival
	const SPIN = 10; // rad/s of corkscrew — the one constant
	const CLOSE_BY = 0.2; // fraction of the flight it takes to come into the lens

	// The break away: fraction of the flight at which the sperm stops riding
	// with the camera and drives for the egg on its own.
	const DIVE_FROM = 0.78;
	const FADE_FROM = 0.55; // fraction of the dive at which it starts to vanish

	// Held at the start until the machine says go, so the corridor is what you
	// see through its window.
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
		world.drift(dt);
		world.sperm.rotation.z = -elapsed * SPIN;

		if (flying) t += dt;
		const flight = clamp(t / FLY_DUR, 0, 1);

		// Sets off, cruises, pulls up.
		const camZ = lerp(CAM_START, CAM_END, easeInOutCubic(flight));
		world.camera.position.z = camZ;

		// Rides ahead of the camera — closing in as it sets off — then goes alone.
		const lead = lerp(SPERM_LEAD_IDLE, SPERM_LEAD, clamp(flight / CLOSE_BY, 0, 1));
		const dive = clamp((flight - DIVE_FROM) / (1 - DIVE_FROM), 0, 1);
		world.sperm.position.z = lerp(camZ - lead, EGG_Z + EGG_R, dive * dive);
		world.spermMaterial.opacity = 1 - clamp((dive - FADE_FROM) / (1 - FADE_FROM), 0, 1);

		return flying && t >= FLY_DUR;
	}

	// Opaque: down here the corridor is the background, not the field.
	export function backdrop() {
		return { color: BACKDROP, alpha: 1 };
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
