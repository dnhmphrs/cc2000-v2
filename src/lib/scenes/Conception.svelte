<script>
	import * as THREE from 'three';
	import { noise, noiseGhost, noiseWash } from '$lib/store/store';
	import {
		SCENES,
		span,
		clamp01,
		smoothstep,
		easeInOutCubic,
		ICOSA,
		ICOSA_INK,
		NOISE,
		WHITE
	} from '$lib/config';
	import { PENTAGON_STEP, THREE_FOLD_VIEW } from '$lib/three/geometry/icosahedron';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// The holy one, and the only one that builds rather than travels.
	//
	//   white  →  a sphere forms  →  the icosahedron's wireframe appears inside
	//   it  →  lines extend from the vertices, carrying the geometric content
	//   →  the pentagons turn  →  it settles
	//
	// The pentagons are the point. Each vertex of an icosahedron is ringed by
	// five others, and a fifth of a turn about that vertex maps the solid onto
	// itself — it is a generator of the icosahedral group. Turning them in
	// overlapping waves rather than one at a time is what makes it read as a
	// combinatorial calculation instead of a list of animations.
	//
	// The whole turn schedule is a PURE FUNCTION of scene progress: every
	// pentagon's angle is recomputed from p each frame rather than accumulated.
	// That is what lets the scene be scrubbed, reset or re-entered without any
	// of it drifting, and it is why nothing here integrates dt.
	//
	// Geometry is world/lattice.js; timing is config/timing.js (SCENES.conception).

	export let world;

	const T = SCENES.conception;

	// Which pentagon PAIR each turn acts on. Antipodal pairs turn together, so a
	// move reads as one thing happening to the solid rather than two unrelated
	// ones. Deterministic and coprime-strided, so it visits all six, never
	// repeats back to back, and does not settle into a visible cycle.
	const SEQUENCE = Array.from({ length: T.pentagonTurns }, (_, k) => (k * 5 + (k % 3)) % 6);

	const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
	const q = new THREE.Quaternion();

	const COLD = new THREE.Color(ICOSA_INK.pentagon).convertSRGBToLinear();
	const HOT = new THREE.Color(ICOSA_INK.pentagonLive).convertSRGBToLinear();

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.egg.setCore(0);
		world.egg.setShell(0);
		noiseWash.set(0);
		noise.set(NOISE.calm);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		// ── The sphere forms ─────────────────────────────────────────────────
		const sphere = smoothstep(0, 1, span(p, T.sphere));
		world.egg.setShell(sphere);
		// The yolk is only there long enough to be something the wireframe can
		// come out of; it dissolves as the frame arrives.
		world.egg.setCore(sphere * (1 - span(p, T.wire)));

		// ── The frame draws itself on ────────────────────────────────────────
		world.setGrow(easeInOutCubic(span(p, T.wire)));
		world.setSpokes(easeInOutCubic(span(p, T.extend)));
		world.setPentagons(easeInOutCubic(span(p, T.extend)));

		// ── The pentagons turn ───────────────────────────────────────────────
		// Sum every turn that has touched a pentagon, so the angle is a function
		// of p alone. `heat` is how much of a turn it is in the middle of, which
		// is what picks it out in colour.
		const angle = new Array(world.pentagons.length).fill(0);
		const heat = new Array(world.pentagons.length).fill(0);
		const [from, to] = T.pentagons;
		const room = to - from - T.pentagonTurn;

		for (let k = 0; k < SEQUENCE.length; k++) {
			const start = from + Math.min(k * T.pentagonStagger, Math.max(room, 0));
			const local = span(p, [start, start + T.pentagonTurn]);
			if (local <= 0) continue;
			const eased = easeInOutCubic(local);
			world.pentagonPairs[SEQUENCE[k]].forEach((i) => {
				angle[i] += eased * PENTAGON_STEP;
				// Bright while it is actually moving, cold either side of that.
				heat[i] = Math.max(heat[i], local > 0 && local < 1 ? Math.sin(local * Math.PI) : 0);
			});
		}

		world.pentagons.forEach((pn, i) => {
			pn.spinner.rotation.z = angle[i];
			pn.mat.uniforms.uColor.value.copy(COLD).lerp(HOT, heat[i]);
		});

		// ── It settles ───────────────────────────────────────────────────────
		// Rotating off the diagram's face-on view onto the tilt the computation
		// starts from, so the next scene picks the frame up exactly where this
		// one puts it down.
		const settle = easeInOutCubic(span(p, T.settle));
		world.frame.quaternion.copy(THREE_FOLD_VIEW).slerp(q.copy(TILT), settle);

		// ── Air ──────────────────────────────────────────────────────────────
		noise.set(NOISE.calm);
		noiseGhost.set(T.ghostAmount * Math.sin(span(p, T.ghost) * Math.PI));

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
