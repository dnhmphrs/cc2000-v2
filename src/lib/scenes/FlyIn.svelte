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
	// Deep blue air, one sperm, and a run at the ovum. The calculator is still on
	// screen for the first fifth of this, being pushed into the lens.
	//
	// FOUR things carry it, and between them they are the whole shot:
	//
	//   THE MOTES   the field of debris the camera flies through. It is on from
	//               the first frame, before the calculator has even gone, so the
	//               cut lands on movement rather than on an empty blue rectangle.
	//               Nothing else in the frame has parallax; without it the 230
	//               units the camera covers read as no distance at all.
	//
	//   THE ROLL    the sperm turns about its OWN long axis, once every four
	//               seconds, linear. No orbit, no wobble, no easing. It is V1's
	//               rotation exactly, and it is the difference between an animal
	//               swimming and a prop being swung round on a stick.
	//
	//   THE LENS    26mm out to 44mm across the run. Widening on the way IN is
	//               the half of a dolly zoom that exaggerates speed, and it also
	//               brings the camera nearer the ovum to stop on — which is why
	//               the last second is clear of fog rather than fogged at the
	//               exact moment it matters.
	//
	//   THE BANK    the camera rolls, slowly, one way and then the other, and
	//               levels for the blow-out. Nothing about the geometry needs it;
	//               it is what stops the shot reading as a rail.
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

	// One turn every spermRollPeriod seconds, clockwise from the camera.
	const ROLL = (-2 * Math.PI) / TUNNEL.spermRollPeriod;
	// Where it is aiming: just inside the skin.
	const INSIDE = TUNNEL.eggZ + TUNNEL.shellR * 0.55;

	let t = 0;
	// Never resets while mounted: the roll is the one thing that does not stop,
	// so it must not restart when the scene does.
	let elapsed = 0;

	export function enter() {
		t = 0;
		world.reset();
	}

	export function update(dt) {
		elapsed += dt;
		t += dt;
		world.tick(dt);
		const p = clamp01(t / T.duration);

		// ── The camera ───────────────────────────────────────────────────────
		// Sets off, builds, pulls up. approachPower shifts where the speed is.
		const camZ = lerp(TUNNEL.camStart, CAM_END, easeInOutPower(p, T.approachPower));
		world.camera.position.z = camZ;
		world.setCamZ(camZ);
		world.setFov(lerp(TUNNEL.fovStart, TUNNEL.fovEnd, smoothstep(0.15, 1, p)));

		// The bank. Two slow sines against each other, so it never repeats inside
		// the length of the scene, easing off to level for the blow-out — the next
		// scene is orthographic and square, and arriving at it tilted is a jolt.
		const level = 1 - smoothstep(T.level[0], T.level[1], p);
		world.camera.rotation.z = (Math.sin(p * 2.1) * 0.06 + Math.sin(p * 5.3) * 0.018) * level;
		world.camera.position.x = Math.sin(p * 1.7 + 0.6) * T.drift * level;
		world.camera.position.y = Math.sin(p * 2.6) * T.drift * 0.6 * level;

		// ── The air ──────────────────────────────────────────────────────────
		// Set before anything reads it: the sperm and the motes are fogged by
		// hand against this colour.
		const blown = easeInOutPower(span(p, T.whiten), 1.6);
		air.copy(blue).lerp(white, blown);
		world.setAir(air.getHex());

		// ── The motes ────────────────────────────────────────────────────────
		// Up immediately and out under the blow-out. They are the ground truth of
		// how fast this is going, so they are never the thing that is missing.
		world.setMotes(span(p, T.motesIn) * (1 - blown));

		// ── The sperm ────────────────────────────────────────────────────────
		// Three legs: behind the lens, riding in front of it, then gone ahead.
		world.spinner.rotation.z = elapsed * ROLL;

		const arrive = span(p, T.spermIn);
		const run = span(p, T.spermRun);

		// THE OVERTAKE IS RELATIVE TO THE LENS, not to the world. The camera is
		// itself covering 230 units while this happens, so a world-space lerp from
		// "behind the camera" to "in front of it" has to out-run the camera to
		// arrive at all — and it does not: it spends the whole window still behind
		// the near plane, which is exactly why nothing was on screen.
		//
		// `ahead` is how far in front of the lens it is. It starts negative and
		// crosses zero when it passes.
		let ahead;
		if (run <= 0) {
			ahead = lerp(-TUNNEL.spermFrom.z, TUNNEL.spermLead, accelerate(arrive, 0.6));
		} else {
			// Its own curve now, and a steeper one than the camera's.
			ahead = camZ - lerp(camZ - TUNNEL.spermLead, INSIDE, accelerate(run, T.spermRunPower));
		}
		// It rides in front of the LENS, so it goes where the lens goes: leaving
		// it on the world axis while the camera wandered pushed it into the bottom
		// corner of the frame for the whole middle of the scene.
		const off = 1 - arrive;
		world.sperm.position.set(
			world.camera.position.x + TUNNEL.spermFrom.x * off,
			world.camera.position.y + TUNNEL.spermFrom.y * off,
			camZ - ahead
		);

		// On the moment it is clear of the near plane, off once it is inside the
		// skin. Driven by where it ACTUALLY is rather than by the clock, so it can
		// never be faded up while still behind the camera.
		const shown = smoothstep(0.5, 3.0, ahead);
		const gone = span(p, T.spermGone);
		const o = shown * (1 - gone);
		world.spermMaterial.uniforms.uOpacity.value = o;
		world.sperm.visible = o > 0.004;

		// ── The ovum ─────────────────────────────────────────────────────────
		// The halo arrives BEFORE the globe does, which is what makes it read as
		// coming up out of the fog rather than fading in on top of it: first there
		// is a brightness in the distance, and then there is a thing in it.
		//
		// Both leave ON the white-out, and slightly ahead of it — a globe still
		// sitting there while the frame is already white is a beat of nothing at
		// the exact moment the scene is supposed to end.
		const goes = clamp01(1 - blown * 1.35);
		const eggIn = span(p, T.eggIn);
		world.setHalo(span(p, T.haloIn) * goes * T.haloPeak);
		world.egg.setWire(eggIn * goes);
		world.egg.setShell(eggIn * goes);
		// And it turns. A wire globe standing still is a diagram; a wire globe
		// turning is an object being examined, which is what this scene is.
		world.egg.group.rotation.y = elapsed * TUNNEL.eggSpin;
		world.egg.group.rotation.x = Math.sin(elapsed * 0.17) * 0.22;

		return t >= T.duration;
	}

	export function backdrop() {
		// The channel — see three/shaders/deep.js. It takes the air's own colour
		// as its ground and shapes a far end out of it, so the fog has somewhere
		// to go, and it opens flat as the air blows out to white.
		return { color: world.getAir(), shader: 'deep' };
	}

	export function render(r) {
		r.render(world.scene, world.camera);
	}

	export function resize() {
		world.resize();
	}

	// Jump to a fraction of the scene's own duration, exactly. Everything here is
	// a pure function of progress, so the frame this draws IS the frame the run
	// would have drawn at that moment. Used by the ?at= scrub — config/dev.js.
	export function seek(v) {
		t = v * T.duration;
		update(0);
	}

	export function reset() {
		t = 0;
		world.reset();
	}
</script>
