<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		accelerate,
		easeInOutPower,
		smoothstep,
		TUNNEL,
		CAM_END,
		DEEP_BLUE,
		WHITE
	} from '$lib/config';

	// ── Scene 2: the fly in ──────────────────────────────────────────────────
	// Deep blue air, and a run at the egg. The calculator is still on screen
	// for the first quarter of this, being pushed into the lens; by the
	// time it has gone the sperm has come past the camera from behind and is
	// out in front, and the egg is coming up out of the fog.
	//
	// The sperm and the camera move on SEPARATE curves on purpose. The camera
	// eases off as it arrives; the sperm keeps accelerating. That divergence is
	// what makes it read as speeding up rather than as travelling — it pulls
	// away from you into a target that is itself growing.
	//
	// Nothing here is built or timed locally: geometry comes from
	// world/tunnel.js, and every number below comes from config/timing.js
	// (SCENES.flyIn) and config/space.js (TUNNEL).

	export let world;

	const T = SCENES.flyIn;

	const blue = new THREE.Color(DEEP_BLUE);
	const white = new THREE.Color(WHITE);
	const air = new THREE.Color();

	let t = 0;
	// Never resets while mounted: the corkscrew is the one thing that does not
	// stop, so it must not restart when the scene does.
	let elapsed = 0;

	export function enter() {
		t = 0;
		world.reset();
	}

	export function update(dt) {
		elapsed += dt;
		t += dt;
		const p = clamp01(t / T.duration);

		world.sperm.rotation.z = -elapsed * TUNNEL.spermSpin;

		// ── The camera ───────────────────────────────────────────────────────
		// Sets off, builds, pulls up. approachPower shifts where the speed is.
		const camZ = lerp(TUNNEL.camStart, CAM_END, easeInOutPower(p, T.approachPower));
		world.camera.position.z = camZ;
		world.setFov(lerp(TUNNEL.fovStart, TUNNEL.fovEnd, smoothstep(0.2, 1, p)));

		// ── The sperm ────────────────────────────────────────────────────────
		// Three legs: behind the lens, riding in front of it, then gone ahead.
		const arrive = span(p, T.spermIn);
		const run = span(p, T.spermRun);
		const rode = camZ - TUNNEL.spermLead;

		let z;
		if (run <= 0) {
			// Coming past from behind, still catching up to its riding position.
			const from = TUNNEL.camStart + TUNNEL.spermFrom.z;
			z = lerp(from, rode, accelerate(arrive, 0.6));
		} else {
			// Its own curve now, and a steeper one than the camera's.
			z = lerp(rode, TUNNEL.eggZ + TUNNEL.shellR * 0.55, accelerate(run, T.spermRunPower));
		}
		const off = 1 - arrive;
		world.sperm.position.set(
			TUNNEL.spermFrom.x * off,
			TUNNEL.spermGroupY + TUNNEL.spermFrom.y * off,
			z
		);

		// Visible from the moment it is clear of the near field until it is
		// inside the shell.
		const shown = smoothstep(0.05, 0.55, arrive);
		const gone = span(p, T.spermGone);
		world.spermMaterial.opacity = shown * (1 - gone);
		world.sperm.visible = world.spermMaterial.opacity > 0.004;

		// ── The air ──────────────────────────────────────────────────────────
		const blown = easeInOutPower(span(p, T.whiten), 1.6);
		air.copy(blue).lerp(white, blown);
		world.setAir(air.getHex());

		// ── The egg ──────────────────────────────────────────────────────────
		// The fog does most of the arrival; the fade only keeps it from popping.
		// It leaves ON the white-out, and slightly ahead of it — an egg still
		// sitting there while the frame is already white is a beat of nothing at
		// the exact moment the scene is supposed to end.
		const eggIn = span(p, T.eggIn);
		const goes = clamp01(1 - blown * 1.35);
		world.egg.setCore(eggIn * goes);
		world.egg.setShell(eggIn * goes);

		return t >= T.duration;
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
		t = 0;
		world.reset();
	}
</script>
