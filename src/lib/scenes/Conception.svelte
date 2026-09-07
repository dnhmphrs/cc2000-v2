<script>
	import { SCENES, span, clamp01, smoothstep, easeInOutCubic, WHITE, ICOSA } from '$lib/config';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// White, a held beat of nothing, a sphere, the icosahedron drawing itself on
	// inside it, and a couple of turns.
	//
	// The fly-in ends by blowing the frame out to white, and this OPENS on that
	// white and stays there for a moment before anything happens. The pause is
	// deliberate: it is what separates the two halves of the run, and it is why
	// nothing here has to line up with the egg that came before — that egg is
	// gone, and this sphere appears fresh at the size it keeps from here on.
	//
	// The turns are the point of the scene as much as the build is. A wireframe
	// polyhedron sitting still is a drawing; the same wireframe turning is a
	// solid. It tumbles about two axes rather than spinning about one, which
	// shows more of the shape for less rotation, and it lands on a whole number
	// of turns on both — so the frame comes to rest on exactly the pose it
	// started from, which is the pose the computation then turns away from.
	//
	// What is already built and simply never turned on, when you come to fill
	// this out — see world/lattice.js:
	//
	//   world.setSpokes(v)    the internal star through the middle of the frame
	//   world.setPentagons(v) the twelve vertex figures…
	//   world.pentagons[i].spinner   …each on its own spin axis

	export let world;

	const T = SCENES.conception;
	const TAU = Math.PI * 2;

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		// Nothing at all, and then a sphere out of the white.
		world.egg.setShell(smoothstep(0, 1, span(p, T.sphere)) * ICOSA.shellSolid);

		// The frame draws itself on inside it, every edge at once. Linear: the
		// strokes travelling is the whole of the movement, and easing the clock
		// only makes them stall at both ends.
		world.setGrow(span(p, T.wire));

		// Then it tumbles: one turn about the screen's vertical and one about its
		// horizontal, driven off the same eased clock so they arrive together.
		const turn = easeInOutCubic(span(p, T.spin));
		world.setSpin(turn * TAU * T.spinTurns[0], turn * TAU * T.spinTurns[1]);

		return t >= T.duration;
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
