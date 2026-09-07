<script>
	import { SCENES, span, clamp01, smoothstep, WHITE, ICOSA } from '$lib/config';
	import { fieldRotation } from '$lib/store/store';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// White, a held beat of nothing, a sphere, and the icosahedron drawing itself
	// on inside it. Nothing turns and nothing else is added — the frame finishes
	// and the rooms come out of it.
	//
	// The fly-in ends by blowing the frame out to white, and this OPENS on that
	// white and stays there for a moment before anything happens. The pause is
	// deliberate: it is what separates the two halves of the run, and it is why
	// nothing here has to line up with the egg that came before — that egg is
	// gone, and this sphere appears fresh.
	//
	// The sphere is the frame's own circumsphere, so what fades up is one thing
	// rather than a ball with something floating in it. The computation eases it
	// off that as the rooms come through.
	//
	// What is built and simply never turned on, when you come to fill this out —
	// see world/lattice.js:
	//
	//   world.setSpokes(v)    the six long diagonals, vertex through the centre
	//                         to antipode — the only lines in the figure that are
	//                         not edges
	//   world.setPentagons(v) the twelve vertex figures…
	//   world.pentagons[i].spinner   …each on its own spin axis

	export let world;

	const T = SCENES.conception;

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		// Nothing turns here, so the field behind it does not either. Reset rather
		// than inherit: the computation writes this every frame and would
		// otherwise leave the last run's attitude behind for the next one.
		fieldRotation.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
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

		return t >= T.duration;
	}

	export function backdrop() {
		return { color: WHITE, shader: 'theta' };
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
