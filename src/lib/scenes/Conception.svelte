<script>
	import * as THREE from 'three';
	import { noise, noiseGhost, noiseWash } from '$lib/store/store';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		smoothstep,
		easeInOutCubic,
		ICOSA,
		NOISE,
		WHITE
	} from '$lib/config';
	import { THREE_FOLD_VIEW } from '$lib/three/geometry/icosahedron';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// The holy one, and the only one that builds rather than travels.
	//
	//   white  →  a sphere forms  →  the icosahedron's wireframe appears inside
	//   it  →  lines extend from the vertices, carrying the geometric content
	//   →  the pentagons turn  →  it settles
	//
	// The pentagons are drawn but they do not move on their own — the whole
	// solid turns, as one thing, in a couple of small deliberate moves.
	//
	// It is drawn LARGER than its true size while it assembles, so it fills the
	// sphere, and draws back to 1 as it settles. That matters: the decade panes
	// are built on the same raw vertex coordinates and have to emerge from the
	// solid's own edges, so the computation can only start once the frame is
	// back at the scale they were built against.
	//
	// Everything here is a PURE FUNCTION of scene progress: the pose is
	// recomputed from p each frame rather than accumulated. That is what lets
	// the scene be scrubbed, reset or re-entered without drifting, and it is why
	// nothing here integrates dt.
	//
	// Geometry is world/lattice.js; timing is config/timing.js (SCENES.conception).

	export let world;

	const T = SCENES.conception;

	const TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
	const spinQ = new THREE.Quaternion();
	const spinE = new THREE.Euler();

	// Total rotation after the completed moves plus whatever the current one has
	// got through. A pure function of the window's progress, like the rest.
	function turned(u) {
		const n = T.spinSteps;
		const done = Math.floor(u * n);
		const local = u * n - done;
		const partial = done < n ? easeInOutCubic(clamp01(local / T.spinHold)) : 0;
		return (Math.min(done, n) + partial) * T.spinAngle;
	}

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.setWireScale(ICOSA.wireBuild);
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

		// ── The whole solid turns ────────────────────────────────────────────
		// Away from the diagram's face-on view, and then onto the tilt the
		// computation starts from — so the next scene picks the frame up exactly
		// where this one puts it down.
		spinE.set(0, turned(span(p, T.spin)), 0);
		world.frame.quaternion.copy(THREE_FOLD_VIEW).multiply(spinQ.setFromEuler(spinE));

		// And draws back to the scale the panes are built against, ready to
		// expand out of.
		const settle = easeInOutCubic(span(p, T.settle));
		world.frame.quaternion.slerp(TILT, settle);
		world.setWireScale(lerp(ICOSA.wireBuild, 1, settle));

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
