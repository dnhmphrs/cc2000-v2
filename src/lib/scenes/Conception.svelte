<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		clamp01,
		bump,
		smoothstep,
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
	// ── Then the surface answers ─────────────────────────────────────────────
	// A ring of waves breaks from the point of entry and runs round the sphere.
	// And over the next two seconds it RELAXES — into the lowest standing wave a
	// sphere has that is invariant under the icosahedral group:
	//
	//     f(n) = Σ P₆(n · aᵢ)   over the six five-fold axes
	//
	// Degree six is the first degree at which such an invariant exists at all;
	// the degree-2 and degree-4 sums vanish identically. So this is not a pattern
	// picked to look icosahedral, it is the only one of its kind, and its twelve
	// antinodes are the twelve vertices. See world/materials.js coreMaterial().
	//
	// That is the conception. A disturbance settling into the lowest mode its
	// symmetry allows, and the twelve places it settles hardest being exactly the
	// twelve places the corners are about to be struck.
	//
	// ── And only then the geometry ───────────────────────────────────────────
	// The twelve strike. The page turns square to you. And the machine DERIVES
	// what the wave has already shown it: a compass swings the circumcircle, the
	// pentagon goes in it, the pentagram goes in that — which is where φ comes
	// from — the ratio is measured off as a bar, three rectangles are drawn in
	// it, and two of them fold up out of the page. Every length is exact; see
	// world/construction.js, which does the arithmetic and states it.
	//
	// The flat work happens at IDENTITY, because that is the one attitude in
	// which the first golden rectangle is exactly square to the camera. The wave
	// happens at ICOSA.tilt, because that is the attitude the twelve vertices are
	// legible in. So the page turns TWICE: out of the solid's pose to be drawn
	// on, and back into it as the drawing stands up.
	//
	// It ends where it began. The union's twelve corners land on the twelve
	// antinodes the wave put there four seconds earlier, in the same pose, to the
	// pixel.
	//
	// Everything here is a pure function of scene progress. Nothing integrates
	// dt, so the scene can be scrubbed, reset or re-entered without drifting.

	export let world;

	const T = SCENES.conception;

	const REST = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
	const PAGE = new THREE.Quaternion();

	// Where the swimmer went in, in the core's own coordinates. It came down the
	// world's +Z at the lens; the core is in the solid's pose, so the direction
	// has to be carried back through that.
	const ENTRY = new THREE.Vector3(0, 0, 1).applyQuaternion(REST.clone().invert());

	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
		world.construction.show(true);
		world.setLineOpacity(1);
		world.egg.setEntry(ENTRY);
		update(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);
		const c = world.construction;

		// ── The wave ─────────────────────────────────────────────────────────
		// The impact, and then the settling. `relax` is the whole idea of the
		// scene and it is one number.
		const strike = smoothstep(0, 1, span(p, T.wake));
		const relax = easeInOutCubic(span(p, T.relax));
		const fade = 1 - easeInOutCubic(span(p, T.waveOut));
		// The twelve antinodes blaze as they are recognised.
		const lobes = bump(span(p, T.lobes));
		world.egg.setWave({
			glow: strike * fade * (0.85 + lobes * 0.5),
			// The skin actually moves. Six percent of the radius at the impact,
			// relaxing to the standing wave's own displacement, and flat by the
			// time the drawing starts.
			amp: 0.06 * strike * fade,
			ripple: strike,
			relax,
			phase: t
		});
		// The body goes, and with it the last opaque thing in the run. It has to
		// be gone before the wireframe draws: it writes depth, and the
		// icosahedron's edges are chords INSIDE this sphere.
		world.egg.setCore(strike * (1 - easeInOutCubic(span(p, T.coreOut))));

		// The blueprint field rules itself on under the wave. It is at zero on the
		// frame this scene opens on, which is what lets the fly-in's `deep` and
		// this scene's `grid` be the same black at the hand-over.
		fieldFade.set(smoothstep(0.06, 0.32, p));

		// ── The page turns square ────────────────────────────────────────────
		// Out of the solid's pose, to be drawn on.
		const square = easeInOutCubic(span(p, T.square));

		// ── The twelve ───────────────────────────────────────────────────────
		// Struck on the antinodes, and let go as the page turns away from the pose
		// they are legible in — at identity the solid looks down a two-fold axis
		// and six pairs of them land on top of each other, which is the whole
		// reason ICOSA.tilt exists. They come back at the union, in the same
		// place, which is the shape of the scene.
		const held = span(p, T.lobes) * (1 - square);

		// ── The compass ──────────────────────────────────────────────────────
		// The pen and the arc are one move: the arm sweeps from the top, and the
		// circle exists behind it. Linear, because a compass is. It is drawing
		// over the sphere's own rim, which is the same circle — the instrument
		// taking possession of what it found.
		const drawn = span(p, T.circle);
		c.setCircle(drawn);
		c.setCompass(
			Math.PI / 2 - drawn * Math.PI * 2,
			// On for the sweep, and gone the moment the circle closes — a compass
			// left lying on a finished drawing is a compass nobody put away.
			smoothstep(0, 0.06, drawn) * (1 - smoothstep(0.9, 1, drawn))
		);

		// ── The figure ───────────────────────────────────────────────────────
		const guides = 1 - smoothstep(T.guidesOut[0], T.guidesOut[1], p);
		c.setPentagon(span(p, T.pentagon), guides);
		c.setStar(span(p, T.star), guides);
		c.setBar(span(p, T.bar), guides);

		// The three rectangles, flat and stacked in the page — one upright and two
		// landscape, all in the 1:φ the bar just measured.
		c.setRects(span(p, T.rects), 1);

		// ── The fold ─────────────────────────────────────────────────────────
		// Two of them stand up, and the page turns back with them: by the time the
		// rectangles are perpendicular the frame has carried them to the attitude
		// the wave laid down, and scene 4 starts its search from.
		const fold = easeInOutCubic(span(p, T.fold));
		c.setFold(fold);
		world.frame.quaternion.copy(REST).slerp(PAGE, square * (1 - fold));

		// The edges close last, between corners that are already there.
		world.setGrow(span(p, T.edges));

		// ── The union ────────────────────────────────────────────────────────
		// The last edge closes and the whole figure answers at once: the twelve
		// corners strike, the line-work overdrives, the rim flares. Everything it
		// drives is additively blended, which is why it can be given a level above
		// 1 at all — on the void, more than full is simply more light.
		const union = Math.sin(span(p, T.union) * Math.PI) * T.unionPeak;
		c.setCorners(Math.max(held, union));
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
