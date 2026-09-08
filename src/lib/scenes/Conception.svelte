<script>
	import * as THREE from 'three';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		smoothstep,
		accelerate,
		easeInOutCubic,
		easeInOutPower,
		ICOSA,
		conceptionFrustum,
		VOID,
		CONCEPTION
	} from '$lib/config';
	import { fieldRotation } from '$lib/store/store';

	// ── Scene 3: conception ──────────────────────────────────────────────────
	// The hinge. The fly-in blows the frame out to white; this opens under that
	// white and what is left when it drains is the VOID — and everything from
	// here to the room is drawn on it, in gold.
	//
	// It exists to do one job: put the icosahedron on screen, big, centred, in a
	// pose you can read, having EARNED it. Which is why there are three of them.
	//
	//   construct   the derivation, and the default. A compass sweep; the
	//               pentagon inscribed in it; the pentagram inside that, which is
	//               where phi comes from; the three golden rectangles in that
	//               ratio, flat and stacked in the page; and then two of them
	//               fold up out of the page and their twelve corners ARE the
	//               icosahedron. It is the only one of the three that makes
	//               scene 4 inevitable rather than merely next: the panes that
	//               scene projects are those same three rectangles.
	//
	//   strike      the impact. A singularity where the sperm went in, twelve
	//               vertices thrown out of it on trails, thirty edges closing
	//               between them, and a recoil onto the resting pose.
	//
	//   divide      cleavage. One cell becomes two, two become four, four become
	//               twelve, and the twelve are sitting exactly where the vertices
	//               go.
	//
	// Switch with ?conception=construct|strike|divide, or set it in config/dev.js.
	// They share a duration and a hand-over — the icosahedron at ICOSA.tilt, the
	// rim up, the frame fully drawn — and nothing else.
	//
	// Everything here is a pure function of scene progress. Nothing integrates
	// dt, so the scene can be scrubbed, reset or re-entered without drifting.
	// The geometry is world/construction.js; the solid is world/lattice.js.

	export let world;

	const T = SCENES.conception;

	// The pose the whole scene is walking toward, and the one it starts from.
	// The derivation begins at IDENTITY because that is the single attitude in
	// which the first golden rectangle is exactly square to the camera — which
	// is the entire point of drawing it flat first. The other two begin near the
	// resting pose, because at identity an icosahedron is looked at down a 2-fold
	// axis and its twelve vertices collapse into six on screen.
	const REST = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.tilt));
	const PAGE = new THREE.Quaternion();
	const RECOIL = new THREE.Quaternion()
		.setFromEuler(new THREE.Euler(-0.16, 0.22, -0.1))
		.premultiply(REST);

	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();

	let t = 0;

	export function enter() {
		t = 0;
		world.reset();
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
		world.construction.show(CONCEPTION);
		world.setLineOpacity(1);
		update(0);
	}

	export function update(dt) {
		t += dt;
		const p = clamp01(t / T.duration);

		if (CONCEPTION === 'strike') strike(p);
		else if (CONCEPTION === 'divide') divide(p);
		else construct(p);

		// The ground turns with the figure, exactly as it does in the
		// computation — three/shaders/grid.js rules the void in these same
		// coordinates, so the lattice behind the drawing swings with it.
		ROT4.makeRotationFromQuaternion(world.frame.quaternion);
		fieldRotation.set(ROT3.setFromMatrix4(ROT4).elements);

		return t >= T.duration;
	}

	// ── construct ────────────────────────────────────────────────────────────
	function construct(p) {
		const c = world.construction;

		// The pen, three times. Linear on purpose: the stroke travelling IS the
		// movement, and easing the clock only makes it stall at both ends.
		const guides = 1 - smoothstep(T.cGuidesOut[0], T.cGuidesOut[1], p);
		c.setCircle(span(p, T.cCircle), guides);
		c.setPentagon(span(p, T.cPentagon), guides);
		c.setStar(span(p, T.cStar), guides);

		// The three rectangles, flat and stacked in the page — one upright and
		// two landscape, all in the same 1:phi the pentagram just gave.
		c.setRects(span(p, T.cRects), 1);

		// And two of them stand up. The fold and the turn of the page are the
		// same move: by the time the rectangles are perpendicular the frame has
		// carried them to the attitude scene 4 starts its search from.
		const fold = easeInOutCubic(span(p, T.cFold));
		c.setFold(fold);
		world.frame.quaternion.copy(PAGE).slerp(REST, fold);

		// The flat circle and the sphere's rim are the SAME circle on screen at
		// the moment the fold starts, so one becomes the other and nothing has to
		// appear. (The rim's own level is set with the union, below.)

		// The edges close last, between corners that are already there.
		world.setGrow(span(p, T.cEdges));

		// THE UNION. The last edge closes and the whole figure answers at once —
		// the twelve corners strike, the line-work overdrives, the rim flares. It
		// is one beat and it is what makes this a conception rather than a
		// derivation that happens to be standing in the right place.
		//
		// Everything it drives is additively blended, which is why it can be given
		// a level above 1 at all: on black, more than full is simply more light.
		const union = Math.sin(span(p, T.cUnion) * Math.PI) * T.cUnionPeak;
		c.setThrow(1, union);
		world.setLineOpacity(1 + union * 1.1);
		world.egg.setShell(smoothstep(0, 1, span(p, T.cRim)) * ICOSA.shellSolid * (1 + union * 1.6));
	}

	// ── strike ───────────────────────────────────────────────────────────────
	function strike(p) {
		const c = world.construction;

		// A point of light where the sperm went in, gone by the time the twelve
		// it threw have landed.
		const flash = span(p, T.sFlash);
		c.setSpark(Math.sin(clamp01(flash) * Math.PI) * 1.2 + (1 - span(p, T.sThrow)) * 0.4);

		// Out of the singularity, hard, and easing onto the shell.
		const thrown = span(p, T.sThrow);
		c.setThrow(easeInOutPower(thrown, 2.4), smoothstep(0.02, 0.2, thrown));

		const trailsOut = 1 - smoothstep(T.sTrailsOut[0], T.sTrailsOut[1], p);
		c.setTrails(span(p, T.sTrails), trailsOut);

		world.setGrow(span(p, T.sEdges));
		world.egg.setShell(smoothstep(0, 1, span(p, T.sRim)) * ICOSA.shellSolid);

		// The recoil: it arrives a few degrees past the resting pose and settles
		// back onto it, so the solid lands rather than parks.
		world.frame.quaternion.copy(RECOIL).slerp(REST, easeInOutPower(span(p, T.sSettle), 1.7));
	}

	// ── divide ───────────────────────────────────────────────────────────────
	function divide(p) {
		const c = world.construction;

		const k = easeInOutCubic(span(p, T.dCleave));
		const born = smoothstep(0, 1, span(p, T.dCell));
		// The cells pinch out to nothing as the vertices they became take over.
		const snap = smoothstep(T.dSnap[0], T.dSnap[1], p);
		c.setCleave(Math.max(k, born * 0.02), lerp(1.15, 0.34, k), 1 - snap);
		c.setNuclei(Math.max(k, born * 0.02), smoothstep(0.06, 0.4, k));

		world.setGrow(span(p, T.dEdges));
		world.egg.setShell(smoothstep(0, 1, span(p, T.dRim)) * ICOSA.shellSolid);

		// A slow quarter of the settle, so twelve dividing cells are seen in the
		// round rather than as a flat rosette.
		world.frame.quaternion.copy(RECOIL).slerp(REST, accelerate(p, 1.4));
	}

	export function backdrop() {
		// The blueprint field — three/shaders/grid.js. It is ruled in the same
		// coordinates the frame is turning in, which is what makes the ground
		// belong to the scene rather than sit behind it.
		return { color: VOID, shader: 'grid' };
	}

	export function render(r) {
		r.render(world.scene, world.camera);
	}

	export function resize() {
		world.applyFrustum(conceptionFrustum(window.innerWidth, window.innerHeight));
	}

	export function reset() {
		t = 0;
	}
</script>
