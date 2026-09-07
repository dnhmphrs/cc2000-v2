<script>
	import { SCENES, span, clamp01, smoothstep, WHITE, ICOSA } from '$lib/config';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// White, a held beat of nothing, a sphere, and the icosahedron drawing
	// itself on inside it. Nothing turns, nothing extends.
	//
	// The fly-in ends by blowing the frame out to white, and this OPENS on that
	// white and stays there for a moment before anything happens. The pause is
	// deliberate: it is what separates the two halves of the run, and it is why
	// nothing here has to line up with the egg that came before — that egg is
	// gone, and this sphere appears fresh at the size it keeps from here on.
	//
	// The build is the whole scene, so it is given more than half of it, and it
	// FINISHES with a beat to spare — the frame is complete and simply sat in
	// for the last stretch before the panes come out of it.
	//
	// Two numbers own the feel of it, and they are in different files on purpose:
	// `wire` in config/timing.js is how long the build takes, and `uSpan` in
	// world/lattice.js is how long one edge takes within it — which is what
	// decides whether the five bands read separately or smear together.
	//
	// What is already built and simply never turned on, when you come to fill
	// this out — see world/lattice.js:
	//
	//   world.setSpokes(v)    the internal star through the middle of the solid
	//   world.setPentagons(v) the twelve vertex figures…
	//   world.pentagons[i].spinner   …each on its own spin axis
	//   world.frame           the whole assembly, if you want to move it

	export let world;

	const T = SCENES.conception;

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

		// The frame draws itself on inside it. Linear on purpose: the per-edge
		// stagger in world/lattice.js is what gives this its shape, and easing
		// the clock on top of that only makes the wave stall at both ends. 1 here
		// means finished — the lattice maps it onto the longer clock a staggered
		// build actually needs, so the far edges land rather than freezing part
		// drawn, which is how this used to end.
		world.setGrow(span(p, T.wire));

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
