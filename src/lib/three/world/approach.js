import { get } from 'svelte/store';
import {
	SCENES,
	APPROACH,
	KALEIDO,
	LENS,
	TUNNEL,
	runSeconds,
	span,
	clamp01,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	DEV,
	DEV_AT
} from '$lib/config';
import { gate, landing, decade, edge, aspect } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { rand } from '$lib/random';
import { roomsFor } from './nest';
import { wobbleEuler } from './wobble';
import { runClock } from '$lib/three/tsl/clock';

// ── Scene 1: the approach ────────────────────────────────────────────────────
// The fly-in. Space, black, a sky of stars, blue debris streaking by — and the
// swimmer, riding a few units ahead of the lens, seen from BEHIND, rolling
// about the axis you are looking down. Nothing else flies by. The two questions
// are asked over it, where it rides — it does not turn to take them — one
// straight after the other, and only once both are in does anything appear
// ahead: a point of light where a
// set is, the set coming out of the dark — dark — until the swimmer's NOSE
// reaches its glass and lights it: a dot at the glass's centre, the hairline
// drawn out of the dot, the covers parting about it onto the tunnel inside
// (world/kaleidoscope.js setOpen). The run ends with that glass filling the
// frame's height on the seam lens, which is the exact frame the kaleido opens
// on — kaleidoscope.pose(0), asked for by both scenes.
//
// ── The opening ──────────────────────────────────────────────────────────────
// The card lifts, the sky develops, and then the swimmer is there: it fades in
// at its riding distance, on the axis. It does NOT fly past the lens from
// behind: every version of that reads as a body being stretched by a wide lens.
//
// ── The flight takes the answers ─────────────────────────────────────────────
// There is no machine, so the run asks its two questions on the way in — both
// in one panel at the centre of the frame, over the swimmer — and while they
// are open the scene HOLDS: `t` stops, and the flight WAITS IN MOTION rather
// than on a paused frame: the swimmer's clock goes on, so it rolls, and the
// debris goes on streaming past at the flight's speed — its queue advanced by
// the hold's own distance (heldZ, tsl/motes.js uDrift) while its slab stays
// on the lens, so motes go on being born at the lens and passing, rather than
// the slab sliding off ahead with the motes in it. The set does not come
// nearer, because t does not move: holding t rather than running a second
// clock is what keeps every frame a pure function of progress, so ?at= is
// exact — the hold's seconds only ever add to what is looped or rolled, never
// to where the flight is. (The roll and the tail's wobble are on the
// swimmer's own clock — the one thing in the run that never stops, not even
// at the seam.)
//
// ── The switch-on ────────────────────────────────────────────────────────────
// The set does not switch itself on. Its glass is black until the swimmer's
// nose reaches it — the contact p* is where the nose is on the glass plane at
// the flight's one speed — and the beats hang off p* (SCENES.approach.switchOn):
// a dot of light at the glass's CENTRE, drawn out sideways into the hairline,
// the covers parting about the line, the line going with them, all done before
// the seam. The centre, not the nose's own spot: the swimmer rides the axis
// and the set is dead ahead on it, so the centre is where the nose lands give
// or take its roll — and the roll is on real time, the one thing a pin cannot
// reproduce, so reading the spot off it put the dot wherever the roll had the
// head that frame, high in the glass as often as not.
//
// ── A run the archive cannot answer for ──────────────────────────────────────
// An out-of-range birthday sets `edge` and no answer, and the flight goes in
// regardless — toward a tunnel that will break down (world/kaleido.js). The
// archive down that tunnel is not the drawings: the moment the edge is known
// the rings are given the verdict's gif instead (kaleidoscope.js setArchive),
// while they are still too small to see; and if the birthday is changed on
// the way back, they are given the drawings back.
//
// ── The turn, begun before the tunnel ────────────────────────────────────────
// The tunnel turns from the seam on (kaleidoscope.set). It used to start
// there, at its full rate, and the world began to spin the moment the
// swimmer went in. Now the set is leaned the other way as it comes out of
// the dark, and from `turnIn` it comes round — the tunnel inside its glass
// with it — gathering speed as it grows, to reach the seam upright and
// turning at exactly the tunnel's rate. Upright at the seam, so approach 1
// is still kaleidoscope.pose(0) to the pixel; and at the tunnel's rate, so
// the turn carries straight on through it.
//
// ── One speed, one lens, one hand, through the seam ──────────────────────────
// The lens flies at ONE speed the whole way into the glass, no brake, on the
// run's one lens (LENS — no dolly for the seam), with the run's one hand on
// the camera (world/wobble.js, on the run's clock), and the tunnel on the
// other side carries all three on. So nothing about the camera changes at
// the seam, and the swimmer never slows in space.
//
// The set is always the 60s one. Room 0 at the tunnel's end is chosen when the
// run begins; the deeper rooms are set the moment the answer is in, while they
// are still too small to see. See finalise().
//
// Every number here comes from config/timing.js (SCENES.approach) and
// config/space.js (APPROACH, KALEIDO, NEST).

const rad = (d) => (d * Math.PI) / 180;

export async function createApproach({ THREE, renderer, nest, kal }) {
	const T = SCENES.approach;
	const A = APPROACH;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group(); // the lens, the sky and the swimmer travel together
	rig.name = 'rig';
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── The sky ──────────────────────────────────────────────────────────
	const starMats = [];
	const starField = (n, dist, size, hex, opacity) => {
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rand() * 2 - 1;
			const a = rand() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = dist * (0.8 + rand() * 0.4);
			pos.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	const stars = new THREE.Group();
	stars.name = 'stars';
	stars.add(starField(A.stars, A.starDist, 3.0, 0xb8c8ff, 0.7));
	stars.add(starField(A.brightStars, A.starDist, 5.5, 0xdde6ff, 0.9));
	rig.add(stars);

	// ── The debris ───────────────────────────────────────────────────────
	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	motes.lines.name = 'motes';
	scene.add(motes.lines);

	// ── The signal ───────────────────────────────────────────────────────
	// One point of light dead ahead, where the set is, from the answers until
	// the set itself can be read: the answers did something, and that is where
	// the flight is going.
	const sigGeo = new THREE.BufferGeometry();
	sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
	const sigMat = dotMaterial(KALEIDO.signalColor, KALEIDO.signalSize);
	const signal = dots(sigGeo, sigMat);
	signal.name = 'signal';
	signal.frustumCulled = false;
	scene.add(signal);

	// ── The swimmer ──────────────────────────────────────────────────────
	// A child of the camera, riding `lead` ahead, dead centre.
	const sw = nest.swimmer;
	const SPIN = -TUNNEL.spermSpin;
	// The nose: the vertex furthest down the body's own axis, per unit of
	// body height. It is what reaches the set's glass, and when — the roll
	// takes it round the axis, but not along it.
	const nose = new THREE.Object3D();
	{
		sw.group.updateMatrixWorld(true);
		const v = new THREE.Vector3();
		const tip = new THREE.Vector3(0, 0, Infinity);
		sw.group.traverse((o) => {
			if (!o.isMesh) return;
			const pos = o.geometry.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
				if (v.z < tip.z) tip.copy(v);
			}
		});
		nose.position.copy(tip);
		sw.spinner.add(nose);
	}
	const halfLenUnit = -nose.position.z;

	// ?sperm=0 hides the swimmer, for checking the seam pixel for pixel: its
	// roll is on real time, so it is the one thing two loads never agree on.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';

	let t = 0;
	let asked = false;
	let finalised = false;
	// The switch-on: where the nose reaches the glass plane.
	let pStar = 1;
	// Where the flight ends — the set's glass filling the frame's height on the
	// seam lens. Asked of the kaleidoscope rather than worked out here, so the
	// two scenes cannot disagree about it. ONE SPEED, no brake, so the flight
	// is simply zEnd · p.
	let zEnd = 0;

	// The tunnel's rate at the seam, in radians per unit of THIS scene's
	// progress, and the lean that comes round to it: its rate rising as the
	// square of the way through [turnIn, 1], so it starts from still.
	const KT = SCENES.kaleido;
	const OMEGA = ((KT.turns * 2 * Math.PI) / KT.duration) * T.duration;
	function lean(p) {
		const s = clamp01((p - T.turnIn) / (1 - T.turnIn));
		return ((-OMEGA * (1 - T.turnIn)) / 3) * (1 - s * s * s);
	}

	function portrait() {
		return get(aspect) === 'portrait';
	}

	// The deeper rooms, once the answer is in. Room 0 stays as it is.
	function finalise() {
		finalised = true;
		nest.build({
			rooms: roomsFor(nest.built.rooms[0], get(decade), SCENES.descent.rooms),
			portrait: portrait()
		});
		kal.placeNest();
	}

	function enter() {
		t = 0;
		asked = false;
		landing.set(0);
		// A fresh run: the set, room 0 and the rooms after it, placed; the
		// deeper rooms are set by finalise() when the answer is known.
		kal.freshRun({ answer: get(decade), portrait: portrait() });
		finalised = !!get(decade);
		zEnd = kal.z0;
		signal.position.set(0, 0, -A.travel);
		kal.set(0, false);
		if (kal.root.parent !== scene) scene.add(kal.root);
		if (nest.root.parent !== scene) scene.add(nest.root);
		camera.add(sw.group);
		sw.group.quaternion.identity();
		sw.group.position.set(0, 0, -A.lead);
		sw.material.uniforms.uOpacity.value = 0;
		// The contact: the nose on the glass plane, z0·p − lead − halfLen = zGlass.
		const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
		pStar = (kal.zGlass + A.lead + halfLenUnit * bodyH) / zEnd;
		// The way home took the last room to black; this nest is lit.
		nest.setDark(1);
		heldZ = 0;
		// The drawings down the tunnel, or the gif of a run the archive
		// cannot answer for (the harness can seed one: ?edge=past|future).
		archive = undefined;
		setArchive(get(edge) || null);
		set(0);
	}

	// The distance the debris has streamed on the hold's own seconds: the
	// flight waiting in motion, see above.
	let heldZ = 0;
	let archive;
	function setArchive(kind) {
		if (kind === archive) return;
		archive = kind;
		kal.setArchive(kind);
	}

	function update(dt) {
		const held = get(gate);
		sw.clock += dt;
		if (!held) t += dt;
		else heldZ += (Math.abs(zEnd) / T.duration) * dt;
		const p = clamp01(t / T.duration);

		// The questions: the first is asked here, and the popup asks the second
		// the moment it is answered. NOT while the scene is pinned: ?at= is for
		// looking at one frame of the flight, and a popup over it is the one
		// thing that stops you seeing it.
		if (!held && !(DEV.on && DEV_AT != null) && !asked && p >= T.ask) {
			asked = true;
			gate.set('dob');
		}
		if (!finalised && get(decade)) finalise();
		setArchive(get(edge) || null);

		set(p);
		return t >= T.duration;
	}

	const camWorld = new THREE.Vector3();
	const euler = new THREE.Euler();
	function set(p) {
		// ── The camera: one speed, one lens, one hand ────────────────────
		// Straight down the axis at one speed; the lens is the run's (LENS,
		// set once); and the slow pan, tilt and roll on it is the hand the
		// whole run is shot with, on the run's clock (world/wobble.js) — the
		// tunnel picks it up at the seam at the same second.
		const z = zEnd * p;
		rig.position.set(0, 0, z);
		const seconds = runSeconds('approach', p);
		runClock.value = seconds;
		camera.quaternion.setFromEuler(wobbleEuler(euler, seconds));
		camera.updateMatrixWorld(true);

		// ── The sky and the debris ───────────────────────────────────────
		// Up with the card lifting; out under the set as it takes the frame, so
		// the seam frame is the set, the tunnel inside it and nothing else.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn), heldZ);

		// ── The swimmer ──────────────────────────────────────────────────
		// It rides ahead of the LENS, dead centre — a child of the camera, so
		// the hand on the camera leans the world round it and not it. Sized
		// off the lens and the ride so it holds its place in the frame. It
		// arrives by fading in, where it rides, and rides there the whole way:
		// the question is asked over it as it is, and at the seam it is
		// exactly the body the tunnel takes on.
		const inK = smootherstep(span(p, T.swimmerIn));
		const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
		sw.group.position.set(0, 0, -A.lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? inK : 0;

		// ── The set, and the switch-on ───────────────────────────────────
		// OFF until the answers are in — nothing at the centre of the frame
		// but the swimmer while they are asked — then the signal, the set out of
		// the dark under it, dark, and its glass switching on as the nose
		// reaches it: the dot at the centre, the line drawn out of it, the
		// covers parting about the line. The room at the tunnel's end is on
		// the same dimmer, and comes out of the dark in its own time
		// (NEST.seen).
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		nest.setDim(lit);
		kal.setDim(lit);
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));
		const g = kal.screen.glass;
		const S = T.switchOn;
		const B = Math.max(S.by - pStar, 0.005);
		const win = ([a, b]) => [pStar + a * B, pStar + b * B];
		const dot = smoothstep(...win(S.dot), p);
		const width = smoothstep(...win(S.line), p);
		const open = smoothstep(...win(S.open), p);
		const glow = dot * (1 - smoothstep(...win(S.glow), p));
		// The dot FLARES — brighter than the line it becomes, a point of light
		// rather than the start of a bar — and settles as it draws out.
		kal.setOpen(open, width, glow * (1 + 2.2 * (1 - width)), g.x, g.y);

		// ── The turn, begun ──────────────────────────────────────────────
		kal.turnTo(lean(p));

		// The stencil chain, for wherever the camera is. Always 0 here — the
		// lens stops short of the set's glass — but the visibility has to be
		// stated, and the clear value with it.
		camera.getWorldPosition(camWorld);
		kal.rebase(camWorld.z, camera.near);
	}

	return {
		scene,
		camera,
		enter,
		update,
		set,
		// The flight's profile, for the harness: where the lens stops and the
		// speeds either side of the tunnel.
		get profile() {
			return { zEnd, ...kal.speeds };
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		},
		// Jump to a fraction of the scene's own duration, exactly. Used by the
		// ?at= scrub — config/dev.js.
		seek(v) {
			t = v * T.duration;
			update(0);
		},
		reset() {
			t = 0;
		},
		dispose() {
			motes.dispose();
			sigGeo.dispose();
			sigMat.dispose();
		}
	};
}
