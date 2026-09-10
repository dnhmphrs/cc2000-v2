<script>
	import * as THREE from 'three';
	import {
		SCENES,
		PULL,
		pullAmount,
		span,
		lerp,
		clamp01,
		smoothstep,
		smootherstep,
		ICOSA,
		TUNNEL,
		conceptionFrustum,
		restFrustum,
		VOID
	} from '$lib/config';
	import { CIRCUMRADIUS } from '$lib/three/geometry/icosahedron';
	import { fieldRotation, fieldRays, fieldFade } from '$lib/store/store';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// It opens on the fly-in's last frame, unchanged. Same dark sphere, same gold
	// rim, same size, same void — because the fly-in sizes its core against this
	// scene's framing every frame and this scene's sphere is built from the same
	// numbers. There is no flash, no cut and no reset: the swimmer has just gone
	// in, and for a beat nothing happens.
	//
	// ── Then it divides ──────────────────────────────────────────────────────
	// A standing wave comes up on the surface, and the body DIVIDES on it. The
	// field is
	//
	//     f(n) = Σ P₆(n · aᵢ)
	//
	// over the six five-fold axes of the icosahedron, with ALL SIX ALWAYS IN.
	// Degree 6 is the first degree at which a non-constant icosahedral invariant
	// exists at all; the degree-2 and degree-4 sums vanish identically. So this
	// is not a pattern chosen to look right, it is the only one there is, and its
	// twelve antinodes are the twelve vertices.
	//
	// What develops is the CLEAVAGE, in two halves on two clocks:
	//
	//   the FURROW   the field's negative set — the nodal net between the twelve
	//                caps — cut hard INTO the drawing, and past where it settles,
	//                before anything else resolves.
	//   the LOBES    the twelve caps, coming up out of the net already cut
	//                around them.
	//
	// That is the order a cell divides in. See world/materials.js.
	//
	// ── AND NOTHING MOVES OFF THE SPHERE ─────────────────────────────────────
	// All of it is DRAWN. The relief used to displace the surface as well — the
	// twelve caps physically swelling — and what that gives you is a lumpy
	// potato: the silhouette stops being a circle, and an icosahedron inscribed
	// in a lumpy potato is not visibly inscribed in anything. The body is a
	// perfect sphere for the whole scene and the field lives on its skin, which
	// is what the rest of the site does with everything else.
	//
	// ── And it is ONE beat ───────────────────────────────────────────────────
	// There is no moment where the wave finishes and a construction starts up.
	// The twelve corners are struck ON the caps, in place — they are not a new
	// object arriving, they are the antinodes being marked — and the six axes the
	// sum was taken over are drawn as the six long diagonals, because that is
	// literally what they are. The thirty edges close between corners that are
	// already there, while the field under them is still resolving.
	//
	// ── And it does not fade. At all. ────────────────────────────────────────
	// The body stays at full weight, and the field stays drawn on it at full
	// weight, for the whole of this scene and the whole of the next one.
	//
	// It can do that because occlusion and opacity are asked for separately (see
	// egg.setCore). Every edge of the icosahedron is a chord and therefore inside
	// this surface, so while the body writes depth there is nothing to see
	// however far the frame has drawn itself. It stops writing depth the moment
	// the corners are struck — before anything is drawn inside it — and from
	// there the frame draws over a body that is still fully there.
	//
	// The whole scene is at ICOSA.tilt and never turns. There is no page to
	// square up any more: the drawing and the solid are the same object.
	//
	// Everything here is a pure function of scene progress. Nothing integrates
	// dt, so the scene can be scrubbed, reset or re-entered without drifting.

	export let world;

	const T = SCENES.conception;

	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();

	let t = 0;

	const half = (deg) => Math.tan((deg * Math.PI) / 360);

	// ── Holding a SPHERE, not a plane, while the lens moves ──────────────────
	// applyFrustum() frames a HEIGHT AT A PLANE, and a height at a plane is not
	// what this scene is looking at. A sphere's outline on a lens is its tangent
	// cone, which touches behind the equator and draws R/√(1−(R/d)²) rather than
	// R — the same fact FlyIn.coreRatio() is written around, and for the same
	// moment. At twelve degrees it is a third of a percent and nobody has ever
	// had to care. At forty it is three, and three percent is the ovum changing
	// size at the cut: measured, holding the height alone through the lens walk
	// put the seam at 3.96/255, worse than the mismatch it was there to fix.
	//
	// So the height the scene asks for is re-expressed for the lens it is
	// actually on — keep the DRAWN CIRCLE where it is and solve back for the
	// height that does it. With h the half-height, d = h/t and t = tan(fov/2):
	//
	//     R / √(1 − (R·t/h)²) / h  held  ⟹  h² = h₀² + R²(t² − t₀²)
	//
	// Exactly the identity at t = t₀, for any framing — so once the lens has
	// settled this is the number that came in, to the last bit, and the pull-back
	// at the end of the scene is untouched.
	function held(fr, deg) {
		const h0 = fr / 2;
		const t = half(deg);
		const t0 = half(ICOSA.fov);
		return 2 * Math.sqrt(h0 * h0 + CIRCUMRADIUS * CIRCUMRADIUS * (t * t - t0 * t0));
	}

	// ── THE RETREAT STARTS HERE ──────────────────────────────────────────────
	// The camera's pull away from the solid belongs to the computation, and by
	// the time the computation owns the frame it is already late: the panes come
	// out at the top of that scene and a camera that only starts backing off
	// then is chasing them. So the last six hundred milliseconds of THIS scene
	// are the beginning of that move — the union flares, and the frame answers
	// by opening.
	//
	// It is one curve on one clock in seconds, shared with the computation, so
	// there is no second ease to match up and nothing stops on the cut. See PULL
	// in config/timing.js.
	function framing() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		return lerp(
			conceptionFrustum(w, h),
			restFrustum(w, h),
			pullAmount(t - (T.duration - PULL.before))
		);
	}

	export function enter() {
		t = 0;
		world.reset();
		world.applyFrustum(framing());
		world.setLineOpacity(1);
		update(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		// ── The division ─────────────────────────────────────────────────────
		// The furrow leads: the nodal net is cut in, then the twelve caps swell
		// out of it. And the cut goes PAST where it settles — a half-sine over
		// its own window, added on top — because a cleavage furrow constricts and
		// eases back rather than opening to its final depth and stopping. It is
		// zero at both ends of that window, so the state this scene hands over is
		// still the bare invariant.
		const furrow =
			smootherstep(span(p, T.furrow)) + Math.sin(span(p, T.pinch) * Math.PI) * T.pinchPeak;
		const lobe = smootherstep(span(p, T.lobe));
		// The FIELD's brightness, and only the field's. It is the one thing on
		// this body the fly-in does not hand over — the flight ends with uGlow
		// at zero — so it is the one thing allowed to ramp up from nothing.
		const lit = smoothstep(0, 1, span(p, T.wake));
		// The mode rings as it is excited and damps as it settles, which is what
		// an excited normal mode does.
		const ring = (1 - smootherstep(span(p, T.ring))) * T.ringPeak;
		const union = Math.sin(span(p, T.union) * Math.PI) * T.unionPeak;
		// The front, out from the point of impact. See SCENES.conception.front.
		const front = lerp(T.frontFrom, T.frontTo, smootherstep(span(p, T.front)));
		world.egg.setWave({
			furrow,
			lobe,
			// The chaos the fly-in hands over, at full weight. What takes it away
			// is not this number, it is the front passing over it.
			grain: 1,
			front,
			// ── ONE CLOCK FOR THE MOTTLE ─────────────────────────────────────
			// uPhase drives the grain, and the grain is now VISIBLE at the cut
			// — it used to be faded to nothing by the end of the fly-in, which
			// is why this never mattered before. A scene that restarts its
			// phase at zero draws a different mottle from the one the fly-in
			// handed over, and the hand-over stops being a single frame.
			//
			// So the phase carries on from where the flight left it. The fly-in
			// runs its own t to exactly its duration, so this is continuous by
			// construction rather than by a number kept in step by hand.
			phase: SCENES.flyIn.duration + t,
			// Every other mode — RISING first, then damped out as the icosahedral
			// one wins. A decay alone makes the loudest frame of the scene its
			// first, which is a bang where the shimmer should be.
			chop: smootherstep(span(p, T.chopIn)) * (1 - smootherstep(span(p, T.chopOut))) * T.chopPeak,
			glow: lit * T.handoverGlow * (1 + union * 0.6),
			ring
		});
		// FULL WEIGHT, and it stays there. What it stops doing is OCCLUDING, the
		// moment the frame starts — which is before a single line has any weight,
		// so nothing is hidden and then revealed.
		//
		// AND IT IS FULL WEIGHT ON THE FIRST FRAME. This used to be scaled by
		// `lit`, which ramped it up over T.wake, and that was right while the
		// fly-in faded its own core out over its last beat: both sides of the cut
		// were near nothing, so the ramp had nothing to step against. The flight
		// hands over a lit body now — the chaos runs straight through the cut —
		// so a ramp from zero here is a hole in the frame the fly-in just drew.
		// Measured: the disc sat at background (11.8 against 10.6) on the
		// conception's first frame while the fly-in's last read 23.6, peaking at
		// 132, and the seam was 2.10/255 against a floor near 1.
		world.egg.setCore(T.handoverCore, p < T.frame[0]);

		// The blueprint field rules itself on under the wave. It is at zero on the
		// frame this scene opens on, which is what lets the fly-in's `deep` and
		// this scene's `grid` be the same black at the hand-over.
		fieldFade.set(smoothstep(0.05, 0.3, p));

		// ── The solid, out of the division that is still happening ────────────
		// The twelve struck on the caps, the six axes the sum was taken over drawn
		// as the six long diagonals, and the thirty edges between them — ALL ON
		// ONE CLOCK, and on one ease.
		//
		// They used to run on three, a couple of hundredths apart, and from the
		// five-fold axis this scene is locked to that is not three things arriving
		// but one thing arriving and then thickening: the diagonals project almost
		// exactly onto six of the edges, so the second window has nothing of its
		// own to show. One window, one ease, one event — see SCENES.conception.frame.
		const frame = smootherstep(span(p, T.frame));
		world.setCorners(frame * (1 + union * 1.4));
		world.setSpokes(frame);
		world.setGrow(frame);
		world.setLineOpacity(1 + union * 1.1);
		// The rim never leaves. It arrived with the fly-in and it is the circle
		// the whole figure is inscribed in; the union only burns it.
		world.egg.setShell(ICOSA.shellSolid * (1 + union * 1.6));

		// ── The lens walks in off the flight ─────────────────────────────────
		// See SCENES.conception.lens. Eased in TAN(fov/2) rather than in degrees
		// because that is what the picture is actually a function of: the
		// camera's range is fr/2/tan(fov/2), so an even walk in the tangent is
		// an even walk in 1/range, and the visible cap opens at a steady rate
		// instead of racing at the wide end.
		//
		// setFov() is a no-op once the two agree, so this stops costing anything
		// the moment the window closes — and it leaves the lens at exactly
		// ICOSA.fov, which is what the computation goes on with.
		const lensT = smootherstep(span(p, T.lens));
		const lens = (360 / Math.PI) * Math.atan(lerp(half(TUNNEL.fovEnd), half(ICOSA.fov), lensT));
		world.setFov(lens);

		// And the frame opens, for the last stretch of the scene only — the same
		// curve the computation goes on with. Applied every frame rather than in
		// enter(), because for these last six hundred milliseconds it moves.
		world.applyFrustum(held(framing(), lens));

		// The ground turns with the figure, exactly as it does in the computation
		// — three/shaders/grid.js rules the void in these same coordinates.
		ROT4.makeRotationFromQuaternion(world.frame.quaternion);
		fieldRotation.set(ROT3.setFromMatrix4(ROT4).elements);
		// The axes belong to the COMPUTATION — see three/shaders/grid.js. Held at
		// nothing here so the cut into that scene is the bare invariant, and so
		// a ?at= seek into this one cannot inherit a ray-set from a previous run.
		fieldRays[0] = 0;
		fieldRays[1] = 0;

		return t >= T.duration;
	}

	export function backdrop() {
		// The blueprint field — three/shaders/grid.js.
		return { color: VOID, shader: 'grid' };
	}

	export function render(r) {
		world.render(r);
	}

	export function resize() {
		world.applyFrustum(framing());
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
	}
</script>
