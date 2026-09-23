import { get } from 'svelte/store';
import {
	SCENES,
	APPROACH,
	NEST,
	KALEIDO,
	TUNNEL,
	span,
	lerp,
	clamp01,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	DEV,
	DEV_AT
} from '$lib/config';
import { gate, landing, decade, aspect } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { rand } from '$lib/random';
import { roomsFor } from './nest';

// ── Scene 1: the approach ────────────────────────────────────────────────────
// The fly-in. Space, black, a sky of stars, blue debris streaking by — and the
// swimmer, riding a few units ahead of the lens, seen from BEHIND, rolling
// about the axis you are looking down. Nothing else flies by. The two
// questions are asked over the swimmer alone, one straight after the other,
// and only once both are in does anything appear ahead: a point of light where
// a set is, the set coming out of the dark — dark — and, when the lens is close
// enough to see down it, its glass switching on with the tunnel inside
// (world/kaleidoscope.js). The run ends with that glass filling the frame's
// height on the seam lens, which is the exact frame the kaleido opens on —
// kaleidoscope.pose(0), asked for by both scenes.
//
// ── The opening ──────────────────────────────────────────────────────────────
// The card lifts, the sky develops, and then the swimmer is there: it fades in
// at its riding distance, on the axis. It does NOT fly past the lens from
// behind: every version of that reads as a body being stretched by a wide lens.
//
// ── The flight takes the answers ─────────────────────────────────────────────
// There is no machine, so the run asks its two questions on the way in — the
// popup asks the second the moment the first is answered — and while they are
// open the scene HOLDS: `t` stops and the swimmer's clock does not, so it goes
// on rolling and what is on screen is a flight waiting rather than a paused
// frame. Holding t rather than running a second clock is what keeps every
// frame a pure function of progress, so ?at= is exact. (The roll and the
// tail's wobble are on the swimmer's own clock — the one thing in the run that
// never stops, not even at the seam.)
//
// ── One speed, through the seam ──────────────────────────────────────────────
// The lens flies at ONE speed the whole way into the glass, no brake, and the
// tunnel on the other side carries on at it. So the swimmer never slows in
// space.
//
// The set is always the 60s one. Room 0 at the tunnel's end is chosen when the
// run begins; the deeper rooms are set the moment the answer is in, while they
// are still too small to see. See finalise(). An out-of-range date sets no
// answer at all: the flight goes in regardless and the tunnel breaks down
// (world/kaleido.js).
//
// Every number here comes from config/timing.js (SCENES.approach) and
// config/space.js (APPROACH, KALEIDO, NEST).

const rad = (d) => (d * Math.PI) / 180;

export async function createApproach({ THREE, renderer, nest, kal }) {
	const T = SCENES.approach;
	const A = APPROACH;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(A.fov, 1, 0.1, 400);
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
	const sw = nest.swimmer;
	const SPIN = -TUNNEL.spermSpin;
	// ?sperm=0 hides the swimmer, for checking the seam pixel for pixel: its
	// roll is on real time, so it is the one thing two loads never agree on.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';

	let t = 0;
	let asked = false;
	let finalised = false;
	// Where the flight ends — the set's glass filling the frame's height on the
	// seam lens. Asked of the kaleidoscope rather than worked out here, so the
	// two scenes cannot disagree about it. ONE SPEED, no brake, so the flight
	// is simply zEnd · p.
	let zEnd = 0;

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
		rig.add(sw.group);
		sw.group.quaternion.identity();
		sw.material.uniforms.uOpacity.value = 0;
		// The way home took the last room to black; this nest is lit.
		nest.setDark(1);
		set(0);
	}

	function update(dt) {
		const held = get(gate);
		sw.clock += dt;
		if (!held) t += dt;
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

		set(p);
		return t >= T.duration;
	}

	const camWorld = new THREE.Vector3();
	function set(p) {
		// ── The lens ─────────────────────────────────────────────────────
		const fov = lerp(A.fov, NEST.seamFov, smootherstep(span(p, T.lens)));
		camera.fov = fov;
		camera.updateProjectionMatrix();

		// ── The camera: one speed ────────────────────────────────────────
		const z = zEnd * p;
		const level = 1 - smoothstep(T.level[0], T.level[1], p);
		rig.position.set(
			Math.sin(p * 1.7 + 0.6) * T.drift * level,
			Math.sin(p * 2.6) * T.drift * 0.6 * level,
			z
		);
		camera.rotation.z = (Math.sin(p * 2.1) * 0.06 + Math.sin(p * 5.3) * 0.018) * level;
		camera.updateMatrixWorld(true);

		// ── The sky and the debris ───────────────────────────────────────
		// Up with the card lifting; out under the set as it takes the frame, so
		// the seam frame is the set, the tunnel inside it and nothing else.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));

		// ── The set ──────────────────────────────────────────────────────
		// OFF until the answers are in — nothing at the centre of the frame but
		// the swimmer for both questions — then the signal, the set out of the
		// dark under it, and at crtOn its glass switching on: a hairline that
		// opens onto the tunnel. The room at the tunnel's end is on the same
		// switch, and comes out of the dark in its own time (NEST.seen).
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		nest.setDim(lit);
		kal.setDim(lit);
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));
		const open = smoothstep(T.crtOn[0], T.crtOn[1], p);
		const glow = p >= T.crtOn[0] ? 1 - smoothstep(T.crtOn[0], T.crtOn[1] + 0.04, p) : 0;
		kal.setOpen(open, glow);

		// ── The swimmer ──────────────────────────────────────────────────
		// It rides ahead of the LENS, dead centre, and at the end pulls in to
		// where the tunnel expects it. Sized off the lens and the ride so it
		// holds its place in the frame however either changes. It arrives by
		// fading in, where it rides.
		const inK = smootherstep(span(p, T.swimmerIn));
		const lead = lerp(A.lead, KALEIDO.lead, smootherstep(span(p, T.dive)));
		const bodyH = A.span * 2 * lead * Math.tan(rad(fov) / 2);
		sw.group.position.set(0, 0, -lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? inK : 0;

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
