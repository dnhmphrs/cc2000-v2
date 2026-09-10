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
		conceptionFrustum,
		restFrustum,
		VOID
	} from '$lib/config';
	import { fieldRotation, fieldFade } from '$lib/store/store';

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
		const lit = smoothstep(0, 1, span(p, T.wake));
		// The mode rings as it is excited and damps as it settles, which is what
		// an excited normal mode does.
		const ring = (1 - smootherstep(span(p, T.ring))) * T.ringPeak;
		const union = Math.sin(span(p, T.union) * Math.PI) * T.unionPeak;
		world.egg.setWave({
			furrow,
			lobe,
			// Every other mode — RISING first, then damped out as the icosahedral
			// one wins. A decay alone makes the loudest frame of the scene its
			// first, which is a bang where the shimmer should be.
			chop: smootherstep(span(p, T.chopIn)) * (1 - smootherstep(span(p, T.chopOut))) * T.chopPeak,
			glow: lit * T.handoverGlow * (1 + union * 0.6),
			ring,
			phase: t
		});
		// FULL WEIGHT, and it stays there. What it stops doing is OCCLUDING, the
		// moment the frame starts — which is before a single line has any weight,
		// so nothing is hidden and then revealed.
		world.egg.setCore(lit * T.handoverCore, p < T.frame[0]);

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

		// And the frame opens, for the last stretch of the scene only — the same
		// curve the computation goes on with. Applied every frame rather than in
		// enter(), because for these last six hundred milliseconds it moves.
		world.applyFrustum(framing());

		// The ground turns with the figure, exactly as it does in the computation
		// — three/shaders/grid.js rules the void in these same coordinates.
		ROT4.makeRotationFromQuaternion(world.frame.quaternion);
		fieldRotation.set(ROT3.setFromMatrix4(ROT4).elements);

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
