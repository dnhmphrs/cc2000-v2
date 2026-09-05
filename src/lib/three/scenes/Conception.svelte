<script>
	import { WHITE } from '../world/tunnel';

	// ── Scene 2: conception ──────────────────────────────────────────────────
	// White. The egg, ethereal, filling most of the frame, and nothing else —
	// the sperm has gone in and the camera is already where the fly-in parked
	// it. For now it just holds.
	//
	// Deliberately almost empty: this is the beat the actual event goes in. It
	// shares world/tunnel.js with the fly-in, so `world.egg` and `world.camera`
	// are sitting there ready to be moved. The egg is built by world/egg.js at
	// a size scene 3 matches exactly, so what follows this picks it up mid-air.

	export let world;

	const HOLD = 2.2; // seconds on the egg before the archive opens

	let t = 0;

	export function enter() {
		t = 0;
		world.setAir(WHITE);
		world.sperm.visible = false;
	}

	export function update(dt) {
		t += dt;
		return t >= HOLD;
	}

	export function backdrop() {
		return { color: WHITE, alpha: 1 };
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
