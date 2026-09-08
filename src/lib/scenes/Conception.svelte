<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		clamp01,
		smoothstep,
		easeInOutCubic,
		ICOSA,
		conceptionFrustum,
		VOID
	} from '$lib/config';
	import { fieldRotation } from '$lib/store/store';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// The hinge. The fly-in blows the frame out to white; this opens under that
	// white, and what is left when it drains is the VOID — everything from here
	// to the room is drawn on it, in gold.
	//
	// It DERIVES the icosahedron. A compass swings the circumcircle; the pentagon
	// goes in it; the pentagram goes in that, which is where φ comes from; the
	// ratio is measured off and laid out as a bar; three rectangles are drawn in
	// it, flat and stacked in the page; and then two of them fold up out of the
	// page and their twelve corners ARE the solid.
	//
	// Every length is exact — see world/construction.js, which does the arithmetic
	// and states it. Nothing is nudged to make the fold land.
	//
	// The frame is at IDENTITY throughout the flat work, because that is the one
	// attitude in which the first golden rectangle is exactly square to the
	// camera, and turns to ICOSA.tilt on the fold. The drawing becoming a solid
	// and the page turning away are one move.
	//
	// It ends on the UNION: the last edge closes and the whole figure answers at
	// once. Without that beat this is a geometry lecture standing where a
	// conception ought to be.
	//
	// Everything here is a pure function of scene progress. Nothing integrates
	// dt, so the scene can be scrubbed, reset or re-entered without drifting.

	export let world;

	const T = SCENES.conception;

	const REST = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
	const PAGE = new THREE.Quaternion();

	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
		world.construction.show(true);
		world.setLineOpacity(1);
		update(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);
		const c = world.construction;

		// ── The compass ──────────────────────────────────────────────────────
		// The pen and the arc are one move: the arm sweeps from the top, and the
		// circle exists behind it. Linear, because a compass is.
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
		// Two of them stand up, and the page turns with them: by the time the
		// rectangles are perpendicular the frame has carried them to the attitude
		// scene 4 starts its search from.
		const fold = easeInOutCubic(span(p, T.fold));
		c.setFold(fold);
		world.frame.quaternion.copy(PAGE).slerp(REST, fold);

		// The flat circle and the sphere's rim are the SAME circle on screen at
		// the moment the fold starts, so one becomes the other and nothing has to
		// appear. (The rim's own level is set with the union, below.)

		// The edges close last, between corners that are already there.
		world.setGrow(span(p, T.edges));

		// ── The union ────────────────────────────────────────────────────────
		// The last edge closes and the whole figure answers at once: the twelve
		// corners strike, the line-work overdrives, the rim flares. Everything it
		// drives is additively blended, which is why it can be given a level above
		// 1 at all — on the void, more than full is simply more light.
		const union = Math.sin(span(p, T.union) * Math.PI) * T.unionPeak;
		c.setCorners(union);
		world.setLineOpacity(1 + union * 1.1);
		world.egg.setShell(smoothstep(0, 1, span(p, T.rim)) * ICOSA.shellSolid * (1 + union * 1.6));

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
