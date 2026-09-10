<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		glide,
		accelerate,
		easeInOutCubic,
		smoothstep,
		smootherstep,
		TUNNEL,
		CAM_END,
		ICOSA,
		conceptionFrustum,
		AIR,
		VOID
	} from '$lib/config';
	import { CIRCUMRADIUS } from '$lib/three/geometry/icosahedron';
	import { DEV, DEV_AT } from '$lib/config';
	import { get } from 'svelte/store';
	import { fieldFade, gate, landing } from '$lib/store/store';

	// ── Scene 2: the fly in ──────────────────────────────────────────────────
	// Black air, one swimmer riding the lens, and three hundred units of travel
	// to an ovum that begins as a warmth in the fog. The calculator is still on
	// screen for the first tenth of it, being pushed into the lens.
	//
	// FOURTEEN AND A HALF SECONDS. That is the scene — not a number to be
	// trimmed, the actual content. V1 put its ovum 250 units away and took twenty
	// seconds to reach it at a flat 12.7 units a second, and that is why its
	// fly-in has any weight: you travel long enough to stop noticing you are
	// travelling, and the thing is enormous when you get there. Every version
	// since shortened it, and every one of them turned an arrival into a zoom.
	//
	// FIVE things carry it:
	//
	//   THE MOTES    the field of debris the camera flies through. On from the
	//                first frame, before the calculator has even gone. Nothing
	//                else in the frame has parallax; without it three hundred
	//                units read as no distance at all.
	//
	//   THE SPEED    glide(): one constant speed for three quarters of the run,
	//                and then a stop. NOT an ease-in-out, which spends its middle
	//                at double speed and reads as a camera being moved.
	//
	//   THE ROLL     V1's rotation, exactly: the body points AWAY down the axis
	//                you are looking along and spins about it at ten radians a
	//                second, so what whips round is the tail's curl, seen end-on.
	//                The orbit that used to be here is a misreading of V1 — see
	//                TUNNEL.spermOffset in config/space.js.
	//
	//   THE LENS     28mm out to 40mm. Widening on the way IN is the half of a
	//                dolly zoom that exaggerates speed. The swimmer's riding
	//                distance is compensated for it, so the only thing in the
	//                shot that changes size is the ovum.
	//
	//   THE BANK     the camera rolls, slowly, one way and then the other, and
	//                levels for the hand-over. Nothing about the geometry needs
	//                it; it is what stops the shot reading as a rail.
	//
	// ── The hand-over ────────────────────────────────────────────────────────
	// There is no flash. This scene ENDS ON THE FRAME THE CONCEPTION OPENS ON:
	// the cage goes as you pass through it, the air walks down to the void, the
	// backdrop flattens to the same void, and what is left is the core — a dark
	// sphere with a gold rim, at exactly the size and place the void draws its
	// own gold circle. The size is DERIVED here, every frame, from the next
	// scene's framing, so it holds on any screen.
	//
	// Nothing here is built or timed locally: geometry comes from
	// world/tunnel.js, and every number below comes from config/timing.js
	// (SCENES.flyIn) and config/space.js (TUNNEL).

	export let world;

	const T = SCENES.flyIn;

	const air0 = new THREE.Color(AIR);
	const voidCol = new THREE.Color(VOID);
	const air = new THREE.Color();

	// V1: -elapsedTime * 10. Linear, forever, and never reset.
	const SPIN = -TUNNEL.spermSpin;

	let t = 0;
	// Never resets while mounted: the corkscrew is the one thing that does not
	// stop, so it must not restart when the scene does.
	let elapsed = 0;

	// ── The hand-over size ───────────────────────────────────────────────────
	// How big the core has to be for the void to open on it unchanged, and it is
	// worked out from the SILHOUETTES rather than from the radii, because the two
	// scenes are on very different lenses.
	//
	// A sphere's outline on a lens is its tangent cone, which touches behind the
	// equator: the drawn circle is R/√(1−(R/d)²), not R. On the void's 12 degrees
	// that is a third of a percent; on the fly-in's 40 it is four, which is twelve
	// pixels of jump at the one moment in the run that must not have one. So:
	// take the circle the void will draw, ask what world radius draws the same
	// circle from where this scene stops, and hand that back as a fraction of the
	// shell.
	const END_D = CAM_END - TUNNEL.eggZ;
	const END_HALF = END_D * Math.tan((TUNNEL.fovEnd * Math.PI) / 360);

	function coreRatio() {
		const F = conceptionFrustum(window.innerWidth, window.innerHeight);
		// The void's own circle, drawn from the void's own range.
		const voidD = F / 2 / Math.tan((ICOSA.fov * Math.PI) / 360);
		const drawn = CIRCUMRADIUS / Math.sqrt(1 - (CIRCUMRADIUS / voidD) ** 2);
		// The same circle, in world units, at the distance this scene stops at.
		const k = (drawn / (F / 2)) * END_HALF;
		// And the radius whose silhouette IS that circle.
		return k / Math.sqrt(1 + (k * k) / (END_D * END_D)) / TUNNEL.shellR;
	}

	// The two questions this scene stops to ask, latched so each fires once per
	// run — a `p > x` test is not a latch, because at any normal frame rate a
	// short window advances past itself in a single frame.
	let askedDob = false;
	let askedSpicy = false;

	export function enter() {
		t = 0;
		// A new run is a screen again.
		landing.set(0);
		askedDob = false;
		askedSpicy = false;
		world.reset();
		world.egg.setCoreRatio(coreRatio());
	}

	export function update(dt) {
		// ── THE FLIGHT TAKES THE ANSWERS ─────────────────────────────────────
		// There is no machine in this build, so the run asks its two questions on
		// the way in — and while either is open the scene HOLDS. `t` stops and
		// `elapsed` does not: the swimmer goes on rolling and the mote field goes
		// on drifting, so what is on screen is a flight waiting rather than a
		// paused frame.
		//
		// Holding t, rather than running a second clock alongside it, is what
		// keeps every frame a pure function of progress. The frame drawn at a held
		// t IS the frame the run would draw at that p, so ?at= is still exact and
		// every screenshot check in the project still means what it meant.
		const held = get(gate);
		elapsed += dt;
		if (!held) t += dt;
		world.tick(dt);
		const p = clamp01(t / T.duration);

		// The questions, in the order the shot makes room for them: the birthday
		// while the swimmer is the only thing on screen, the spice once the ovum
		// is up and there is something to swim at.
		//
		// NOT while the scene is pinned. ?at= is for looking at one frame of the
		// flight, and a popup over it is the one thing that stops you seeing it —
		// every contact sheet past askDob would come back with a dialog on it.
		if (!held && !(DEV.on && DEV_AT != null)) {
			if (!askedDob && p >= T.askDob) {
				askedDob = true;
				gate.set('dob');
			} else if (!askedSpicy && p >= T.askSpicy) {
				askedSpicy = true;
				gate.set('spicy');
			}
		}

		// ── The camera ───────────────────────────────────────────────────────
		// Flat out, and then a stop. The lens has to be set BEFORE anything reads
		// the riding distance off it.
		world.setFov(lerp(TUNNEL.fovStart, TUNNEL.fovEnd, smoothstep(0.1, 0.95, p)));
		const camZ = lerp(TUNNEL.camStart, CAM_END, glide(p, T.hold));
		world.camera.position.z = camZ;
		world.setCamZ(camZ);

		// The bank. Two slow sines against each other, so it never repeats inside
		// the length of the scene, easing off to level for the hand-over — the
		// next scene is square to the frame, and arriving at it tilted is a jolt.
		const level = 1 - smoothstep(T.level[0], T.level[1], p);
		world.camera.rotation.z = (Math.sin(p * 2.1) * 0.06 + Math.sin(p * 5.3) * 0.018) * level;
		world.camera.position.x = Math.sin(p * 1.7 + 0.6) * T.drift * level;
		world.camera.position.y = Math.sin(p * 2.6) * T.drift * 0.6 * level;

		// ── The air ──────────────────────────────────────────────────────────
		// Set before anything reads it: the swimmer and the motes are fogged by
		// hand against this colour. It walks down to the VOID as the scene lands,
		// and the backdrop's own figure goes with it — so the last frame of this
		// scene and the first frame of the next are the same flat black.
		// Up from the void first, then back down to it — see SCENES.flyIn.airIn.
		// The channel's core is 1.5x whatever this is, so an air that starts at
		// its full warmth puts a pool in the middle of the frame before the
		// flight has begun.
		const settle = easeInOutCubic(span(p, T.settle));
		air
			.copy(voidCol)
			.lerp(air0, smootherstep(span(p, T.airIn)))
			.lerp(voidCol, settle);
		world.setAir(air.getHex());
		fieldFade.set(1 - settle);

		// ── The motes ────────────────────────────────────────────────────────
		// The ground truth of how fast this is going, so they are never the thing
		// that is missing — and gone by the arrival, which is the ovum and
		// nothing else.
		// Brightness and EXISTENCE are separate: the out-fade dims the field as a
		// whole, the in-window switches motes on one at a time. See tunnel.js.
		world.setMotes(1 - easeInOutCubic(span(p, T.motesOut)), span(p, T.motesIn));

		// ── The swimmer ──────────────────────────────────────────────────────
		// The roll, about the axis you are looking down. V1's exactly, and the one
		// thing in the scene that never stops.
		world.spinner.rotation.z = elapsed * SPIN;
		const dive = span(p, T.dive);

		// THE POSITION IS RELATIVE TO THE LENS, not to the world. The camera is
		// itself covering three hundred units while this happens, so a world-space
		// lerp from "behind the camera" to "in front of it" has to out-run the
		// camera to arrive at all — and it does not: it spends the whole window
		// behind the near plane, which is exactly why nothing was on screen.
		//
		// `ahead` is how far in front of the lens it is. It starts negative and
		// crosses zero when it passes.
		const arrive = span(p, T.spermIn);
		const lead = world.getLead();
		// Where it is aiming: inside the core, which is the thing it goes into.
		const inside = TUNNEL.eggZ + TUNNEL.shellR * coreRatio() * 0.35;
		const ahead =
			dive <= 0
				? lerp(-TUNNEL.spermFrom.z, lead, glide(arrive, 0.8))
				: lerp(lead, camZ - inside, accelerate(dive, T.divePower));

		// It rides in front of the LENS, so it goes where the lens goes: leaving
		// it on the world axis while the camera wandered pushed it into the corner
		// of the frame for the whole middle of the scene.
		//
		// And its entry offset is measured ON SCREEN — spermFrom.x/y are
		// half-heights of the frame at whatever distance it currently is — so it
		// enters low in the frame, holds that place, and drifts to centre. A fixed
		// WORLD offset, which is what was here, is nine screen-widths off to the
		// side when the thing is a unit from the lens: it slid in from the wings
		// instead of coming up from behind you.
		// DEAD CENTRE, the whole way. It sits on the camera's own x and y — see
		// TUNNEL.spermFrom, which is zero in both — so it starts directly behind
		// you, comes up the axis and goes out through the middle of the lens.
		// There is no lateral move to watch, which is what makes it an approach
		// rather than a thing sliding into place.
		world.sperm.position.set(world.camera.position.x, world.camera.position.y, camZ - ahead);

		// ── LIT ACROSS THE LENS PLANE, not after it ──────────────────────────
		// This ramp was [0.3, 1.0], and before that [3.5, …]. Both hide the
		// swimmer until it is already IN FRONT, which is the one thing the shot
		// must not do: the crossing is the beat, and it was happening off-camera
		// every time.
		//
		// It can be lit across zero without being lit behind you, because `ahead`
		// is the position of the body's CENTRE and the body is 4.07 units long
		// about it — so its nose is 2.03 ahead of whatever `ahead` says, and by
		// the time the ramp opens at -1.4 the nose is already 0.63 units past
		// the lens. So the ramp straddles the crossing: it starts well behind the
		// lens, where the body is outside the frustum and the opacity is spent on
		// nothing, and is still rising as the near plane admits it.
		//
		// That overlap is the whole trick, and moving the ramp entirely behind
		// the lens — fully lit before anything can be seen — was tried and is
		// worse. Near the lens a tenth of a unit of travel is most of the frame,
		// so a body admitted at full weight arrives in one frame: geometrically
		// exact, and it reads as a pop. Fading up ACROSS the entry is what makes
		// it a thing coming past rather than a thing appearing.
		//
		// Driven by where it ACTUALLY is rather than by the clock, so it can
		// never be lit into an empty frame by a clock that has run on while the
		// gate held the scene.
		const shown = smoothstep(-1.4, 0.6, ahead);
		const o = shown * (1 - span(p, T.spermGone));
		world.spermMaterial.uniforms.uOpacity.value = o;
		world.sperm.visible = o > 0.004;

		// ── The ovum ─────────────────────────────────────────────────────────
		// The halo arrives BEFORE anything else does, which is what makes it read
		// as coming up out of the fog rather than fading in on top of it: first
		// there is a warmth in the distance, and then there is a thing in it.
		//
		// The CAGE leaves as you pass through it. The CORE does not: it is what
		// the next scene is, and it is already the right size.
		const eggIn = span(p, T.eggIn);
		const shed = 1 - easeInOutCubic(span(p, T.shellOut));
		world.egg.setCoreRatio(coreRatio());
		world.setHalo(span(p, T.haloIn) * (1 - span(p, T.haloOut)) * T.haloPeak);

		// THE CAGE COMES OUT OF THE FOG, and it comes out of it PHYSICALLY. The
		// line materials are additive and carry no fog of their own — that is what
		// lets thirty gold edges read on the void in the next two scenes — so the
		// weather has to be applied to them here, from the camera's actual
		// distance, using exactly the exponential scene.fog uses.
		//
		// It matters more than it sounds. Keyframing the cage on gives you a
		// wireframe fading up in the middle of an empty frame; taking it out of the
		// fog gives you six percent of it at a quarter of the way in, twenty at
		// half, half at three quarters — a thing resolving as you close on it. The
		// window below is only an enable, so it cannot be up before the halo is.
		const d = camZ - TUNNEL.eggZ - TUNNEL.shellR;
		const clear = Math.exp(-((TUNNEL.fogDensity * d) ** 2));

		world.egg.setWire(eggIn * shed * clear);
		world.egg.setShell(eggIn * shed * clear);
		// The core is the one thing the fog does NOT take: it is nearly the colour
		// of the air, so what it actually does at distance is read as a hole in the
		// halo — a dark shape inside the warmth, before there is a cage round it.
		world.egg.setCore(eggIn);
		// ── AND IT HAS SOMETHING IN IT ───────────────────────────────────────
		// A flat black disc inside a warm halo reads as a hole, not as a body, and
		// you are looking at this one for the better part of ten seconds. So it
		// carries a fine mottle on the way in — see coreMaterial's grain().
		//
		// It FADES OUT over the arrival, so the frame this scene hands over is the
		// dark void the conception opens on. Driven from `t` rather than the
		// swimmer's `elapsed`, so the core stays a pure function of progress and
		// a ?at= seek draws what the run draws.
		world.egg.setWave({ grain: eggIn * (1 - smoothstep(0.85, 0.985, p)), phase: t });
		// The rim answers the entry. A nudge, not a flash — the wave that breaks
		// across this surface at the top of the next scene is the payoff — and it
		// is the CRISP rim that lifts, not the body's, or the whole disc washes.
		world.egg.setCoreRim(eggIn * clear * (1 + Math.sin(span(p, T.strike) * Math.PI) * 1.1));

		// And it turns. A wire globe standing still is a diagram; a wire globe
		// turning is an object being examined, which is what this scene is.
		world.egg.group.rotation.y = elapsed * TUNNEL.eggSpin;
		world.egg.group.rotation.x = Math.sin(elapsed * 0.17) * 0.22;

		return t >= T.duration;
	}

	export function backdrop() {
		// The channel — see three/shaders/deep.js. It takes the air's own colour
		// as its ground and shapes a far end out of it, so the fog has somewhere
		// to go; fieldFade takes that shaping back out as the scene lands.
		return { color: world.getAir(), shader: 'deep' };
	}

	export function render(r) {
		r.render(world.scene, world.camera);
	}

	export function resize() {
		world.resize();
		world.egg.setCoreRatio(coreRatio());
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
		world.egg.setCoreRatio(coreRatio());
	}
</script>
