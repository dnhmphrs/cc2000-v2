<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		clamp01,
		smoothstep,
		smootherstep,
		easeInOutCubic,
		ICOSA,
		conceptionFrustum,
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
	// A standing wave comes up on the surface, and the wave DIVIDES. It is
	//
	//     f(n) = Σ wᵢ · P₆(n · aᵢ)
	//
	// over the six five-fold axes of the icosahedron, and the axes come in ONE AT
	// A TIME. One axis is a dumbbell: two antinodes, a sphere pulling into two.
	// Two axes, four. Six axes, twelve — and twelve antinodes on a sphere, at
	// arccos(1/√5) from each other, is an icosahedron.
	//
	// Degree 6 is the first degree at which a non-constant icosahedral invariant
	// exists at all; the degree-2 and degree-4 sums vanish identically. So this
	// is not a pattern chosen to look right, it is the only one there is, and
	// every step of the division is forced. See world/materials.js.
	//
	// ── And it does not go away ──────────────────────────────────────────────
	// The wave IS the icosahedron by the time it is finished, so nothing is
	// rebuilt from scratch afterwards. The twelve antinodes are struck as the
	// twelve corners, in place; the six axes the field was summed over are drawn
	// as the six long diagonals, because that is literally what they are; and the
	// thirty edges close between corners that are already there. The surface
	// stays, dropped to a ghost, as the shell the frame sits in.
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

	export function enter() {
		t = 0;
		world.reset();
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
		world.setLineOpacity(1);
		update(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		// ── The division ─────────────────────────────────────────────────────
		// One number: how many of the six axes are in. Everything else follows.
		const grow = smootherstep(span(p, T.divide)) * 6;
		const lit = smoothstep(0, 1, span(p, T.wake));
		// The mode rings as it is excited and damps as it settles, which is what
		// an excited normal mode does and is the only motion on the surface.
		const ring = (1 - smootherstep(span(p, T.ring))) * T.ringPeak;
		// The surface drops to a ghost once the frame is on it — it has to, or
		// thirty edges are drawn inside an opaque ball and none of them read.
		const ghost = easeInOutCubic(span(p, T.ghost));
		const union = Math.sin(span(p, T.union) * Math.PI) * T.unionPeak;

		world.egg.setWave({
			grow,
			glow: lit * (1 - ghost * 0.42) * (1 + union * 0.6),
			// Big while it is dividing — a cell pulling itself in two is a shape
			// change, not a shading change — and flat by the time the frame draws.
			amp: lit * T.amp * (1 - ghost),
			ring,
			phase: t
		});
		world.egg.setCore(lit * (1 - ghost * 0.55));

		// The blueprint field rules itself on under the wave. It is at zero on the
		// frame this scene opens on, which is what lets the fly-in's `deep` and
		// this scene's `grid` be the same black at the hand-over.
		fieldFade.set(smoothstep(0.05, 0.3, p));

		// ── The solid, in the order the field builds it ───────────────────────
		// The twelve, struck on the antinodes. The six axes the sum was taken
		// over, drawn as the six long diagonals — they are the same six vectors.
		// Then the thirty edges, between corners that are already there.
		world.setCorners(span(p, T.corners) * (1 + union * 1.4));
		world.setSpokes(smootherstep(span(p, T.spokes)));
		world.setGrow(span(p, T.edges));
		world.setLineOpacity(1 + union * 1.1);
		// The rim never leaves. It arrived with the fly-in and it is the circle
		// the whole figure is inscribed in; the union only burns it.
		world.egg.setShell(ICOSA.shellSolid * (1 + union * 1.6));

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
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
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
