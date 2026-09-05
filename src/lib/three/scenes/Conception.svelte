<script>
	import { BACKDROP } from '../world/tunnel';

	// ── Scene 2: conception ──────────────────────────────────────────────────
	// The sperm has gone in and the camera is already where the fly-in left it,
	// square on to the egg. For now this does nothing but hold, and let the
	// corridor keep turning behind it.
	//
	// Deliberately almost empty — this is the beat the actual event goes in.
	// It shares world/tunnel.js with the fly-in, so `world.core`, `world.shell`
	// and `world.camera` are all sitting there ready to be moved.

	export let world;

	const HOLD = 2.0; // seconds on the egg before the archive opens

	let t = 0;

	export function enter() {
		t = 0;
		world.sperm.visible = false;
	}

	export function update(dt) {
		t += dt;
		world.drift(dt);
		return t >= HOLD;
	}

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
		t = 0;
	}
</script>
