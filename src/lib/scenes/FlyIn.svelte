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
	// Deep blue air, a pack of sperm, and a run at the egg. The calculator is
	// still on screen for the first fifth of this, being pushed into the lens.
	//
	// FOUR things carry it, and they are worth naming because between them they
	// are the whole shot:
	//
	//   THE MOTES   the field of debris the camera flies through. It is on from
	//               the first frame, before the calculator has even gone, so the
	//               cut lands on movement rather than on an empty blue rectangle.
	//               Nothing else in the frame has parallax; without it the 180
	//               units the camera covers read as no distance at all.
	//
	//   THE PACK    five rivals, dimmer, riding nearer the lens. They lose. Each
	//               one slips back past the camera in its own time, so the flight
	//               has a running score rather than one animal swimming.
	//
	//   THE LENS    24mm out to 46mm across the run. Widening on the way IN is
	//               the half of a dolly zoom that exaggerates speed, and it also
	//               brings the camera nearer the egg to stop on — which is why
	//               the last second is clear of fog rather than fogged at the
	//               exact moment it matters.
	//
	//   THE BANK    the camera rolls, slowly, one way and then the other. Nothing
	//               about the geometry needs it; it is what stops the shot
	//               reading as a rail.
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

	// Where the hero and the pack are aiming: just inside the shell.
	const INSIDE = TUNNEL.eggZ + TUNNEL.shellR * 0.55;

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

		// ── The hero ─────────────────────────────────────────────────────────
		// Three legs: behind the lens, riding in front of it, then gone ahead.
		world.hero.spinner.rotation.z = -elapsed * TUNNEL.spermSpin;

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
			z = lerp(rode, INSIDE, accelerate(run, T.spermRunPower));
		}
		// It rides in front of the LENS, so it goes where the lens goes. Leaving it
		// on the world axis while the camera wandered pushed it into the bottom
		// corner of the frame for the whole of the middle of the scene.
		const off = 1 - arrive;
		const cx = world.camera.position.x;
		const cy = world.camera.position.y;
		world.sperm.position.set(
			cx + TUNNEL.spermFrom.x * off,
			cy + TUNNEL.spermGroupY + TUNNEL.spermFrom.y * off,
			z
		);

		// Visible from the moment it is clear of the near field until it is
		// inside the shell.
		const shown = smoothstep(0.05, 0.5, arrive);
		const gone = span(p, T.spermGone);
		const heroOpacity = shown * (1 - gone);
		world.heroMaterial.uniforms.uOpacity.value = heroOpacity;
		world.sperm.visible = heroOpacity > 0.004;

		// ── The pack ─────────────────────────────────────────────────────────
		// Anchored just in front of the lens, then slipping back through it one
		// at a time. Each is faded off as it reaches the near plane, because a
		// body clipped in half by it is the one thing that says "this is a
		// rendering" out loud.
		const packIn = span(p, T.packIn);
		const slip = accelerate(run, T.packLagPower);
		world.rivals.forEach((r) => {
			const rz = camZ - r.lead * (0.35 + 0.65 * packIn) + r.lag * slip;
			// Ahead of the lens is negative distance in z; this is how far in front
			// of the camera it actually is.
			const ahead = camZ - rz;
			const phase = -elapsed * r.spin + r.phase;
			r.group.position.set(
				cx + Math.cos(r.ring) * r.radius * packIn,
				cy + TUNNEL.spermGroupY + Math.sin(r.ring) * r.radius * packIn,
				rz
			);
			r.spinner.rotation.z = phase;
			// On as it comes past from behind, off as the camera catches it up.
			const o = smoothstep(0.06, 0.55, packIn) * smoothstep(0.8, 2.6, ahead) * T.packOpacity;
			const fade = o * (1 - blown);
			r.material.uniforms.uOpacity.value = fade;
			r.group.visible = fade > 0.004;
		});

		// ── The egg ──────────────────────────────────────────────────────────
		// The halo arrives BEFORE the shell does, which is what makes the egg read
		// as coming up out of the fog rather than fading in on top of it: first
		// there is a brightness in the distance, and then there is a thing in it.
		//
		// Both leave ON the white-out, and slightly ahead of it — an egg still
		// sitting there while the frame is already white is a beat of nothing at
		// the exact moment the scene is supposed to end.
		const goes = clamp01(1 - blown * 1.35);
		const eggIn = span(p, T.eggIn);
		world.setHalo(span(p, T.haloIn) * goes * T.haloPeak);
		world.egg.setCore(eggIn * goes);
		world.egg.setShell(eggIn * goes);
		// A slow tip, so the painted ramp on the yolk turns and the sphere is not
		// a sticker. Tipping is what moves a vertical gradient; spinning about y
		// would slide it along the seam-free axis and show nothing.
		world.egg.core.rotation.z = Math.sin(elapsed * 0.21) * 0.35;
		world.egg.core.rotation.x = Math.sin(elapsed * 0.16) * 0.28;
		// And the highlight travels across the shell. It is the one thing that
		// says the surface is wet rather than painted.
		world.egg.setLight(Math.cos(elapsed * 0.33) * 0.8, 0.42 + Math.sin(elapsed * 0.24) * 0.3, 0.7);

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

	export function reset() {
		t = 0;
		world.reset();
	}
</script>
