<script>
	import { SCENES, span, clamp01, smoothstep, WHITE } from '$lib/config';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// White. A sphere forms, and the icosahedron appears inside it. That is the
	// whole scene.
	//
	// Deliberately the plainest of the five: nothing turns, nothing extends, and
	// the frame is left exactly where the computation wants to pick it up. This
	// is the beat to build the actual event into, and it is easier to build into
	// something plain than to unpick something busy.
	//
	// What is already there when you do — world/lattice.js builds all of it, and
	// this scene simply never turns it on:
	//
	//   world.setSpokes(v)    every vertex to every neighbour, drawn through the
	//                         middle of the solid: the internal star you only see
	//                         when the hidden edges are drawn too
	//   world.setPentagons(v) the twelve vertex figures, each its own object on
	//                         its own spin axis (world.pentagons[i].spinner), so
	//                         they can be turned individually
	//   world.frame           the whole assembly, if you want to move it
	//
	// Geometry is three/geometry/icosahedron.js; the objects are
	// world/lattice.js; timing is config/timing.js (SCENES.conception).

	export let world;

	const T = SCENES.conception;

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.egg.setCore(0);
		world.egg.setShell(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		// The sphere forms out of the white.
		const sphere = smoothstep(0, 1, span(p, T.sphere));
		world.egg.setShell(sphere);

		// The wireframe draws itself on inside it, and the yolk dissolves as it
		// arrives — the polyhedron is what was in there.
		const wire = span(p, T.wire);
		world.egg.setCore(sphere * (1 - wire));
		world.setGrow(smoothstep(0, 1, wire));

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
