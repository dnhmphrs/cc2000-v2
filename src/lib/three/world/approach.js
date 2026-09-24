import { get } from 'svelte/store';
import {
	Fn,
	vec2,
	vec3,
	vec4,
	uniform,
	uv,
	float,
	length,
	abs,
	max,
	min,
	fwidth,
	smoothstep as tslSmoothstep
} from 'three/tsl';
import {
	SCENES,
	APPROACH,
	KALEIDO,
	LENS,
	TUNNEL,
	runSeconds,
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
import { dotMaterial, dots, ADD } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { rand } from '$lib/random';
import { roomsFor } from './nest';
import { wobbleEuler } from './wobble';

// ── Scene 1: the approach ────────────────────────────────────────────────────
// The fly-in. Space, black, a sky of stars, blue debris streaking by — and the
// swimmer, riding a few units ahead of the lens, seen from BEHIND, rolling
// about the axis you are looking down. Nothing else flies by. For the two
// questions it pulls ahead and comes about, SIDE-ON, and holds there while
// they are asked, one straight after the other, then turns back and rides on;
// and only once both are in does anything appear ahead: a point of light where
// a set is, the set coming out of the dark — dark — until the swimmer's NOSE
// reaches its glass and lights it: a dot where it touches, the hairline drawn
// out of the dot, the covers parting about it onto the tunnel inside
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
// There is no machine, so the run asks its two questions on the way in — the
// popup asks the second the moment the first is answered — and while they are
// open the scene HOLDS: `t` stops and the swimmer's clock does not, so it goes
// on rolling and what is on screen is a flight waiting rather than a paused
// frame. Holding t rather than running a second clock is what keeps every
// frame a pure function of progress, so ?at= is exact. (The roll and the
// tail's wobble are on the swimmer's own clock — the one thing in the run that
// never stops, not even at the seam.) The swimmer takes the questions SIDE-ON:
// on a pivot at its centre, a child of the camera, it pulls ahead to A.far
// and turns a quarter round (SCENES.approach.pull, turn), holds there at the
// ask, rolling, and turns back and drops back to its ride (back, ride). The
// questions are put to it, under it.
//
// ── The switch-on ────────────────────────────────────────────────────────────
// The set does not switch itself on. Its glass is black until the swimmer's
// nose reaches it — the contact p* is where the nose is on the glass plane at
// the flight's one speed — and the beats hang off p* (SCENES.approach.switchOn):
// a dot of light where the nose touches, drawn out sideways into the hairline
// at that height, the covers parting about the line, the line going with them,
// all done before the seam. WHERE on the glass is read off the live nose at the
// first frame past p*: the roll is on real time, so it is the one thing about
// the switch-on that is not a function of p — a pin past p* takes the nose
// where it is.
//
// ── The lip ──────────────────────────────────────────────────────────────────
// A run that came home through the record (world/descent.js stepReturn, the
// spindle hole taking the frame) opens on the black in the hole, and the
// record's last grooves go on past the lens over `lip` as the sky comes up —
// gold rings, a child of the camera, expanding out of the frame and fading —
// so the one becomes the other. The first run has no record behind it and
// opens under the title card; nest.viaRecord says which.
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

	// ── The swimmer, on a pivot ──────────────────────────────────────────
	// A child of the camera, riding `lead` ahead — on a PIVOT at its centre,
	// so it can come about for the questions. Riding, the pivot is at −lead
	// with the body at its origin, so the seam frame is exactly what it was.
	const sw = nest.swimmer;
	const SPIN = -TUNNEL.spermSpin;
	const pivot = new THREE.Group();
	pivot.name = 'pivot';
	camera.add(pivot);
	// The nose: the vertex furthest down the body's own axis, per unit of
	// body height, carried on the spinner so the roll takes it round the axis
	// as it does the body. It is what touches the set's glass.
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

	// ── The lip ──────────────────────────────────────────────────────────
	// The record's last grooves, on a run that came home through it: three
	// gold hairline rings on a quad that covers the frame a unit ahead of the
	// lens, ADD, expanding out of the frame and fading over `lip`.
	const lu = { uK: uniform(0), uA: uniform(0), uAspect: uniform(1) };
	const lipMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...ADD
	});
	lipMat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(vec2(lu.uAspect, 1.0));
		const r = length(p);
		const px = fwidth(r);
		const grow = lu.uK.mul(5.0).add(1.0);
		const w = float(0.006);
		const ring = (r0, k) => {
			const d = abs(r.sub(float(r0).mul(grow)));
			const e = max(w, px);
			return tslSmoothstep(0.0, e, d)
				.oneMinus()
				.mul(min(w.div(e), 1.0))
				.mul(k);
		};
		const g = ring(0.3, 1.1).add(ring(0.45, 1.0)).add(ring(0.62, 0.8));
		const col = vec3(0.94, 0.77, 0.36).mul(g).mul(lu.uA);
		return vec4(col, 1.0);
	})();
	const lip = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lipMat);
	lip.name = 'lip';
	lip.renderOrder = 90000;
	lip.frustumCulled = false;
	lip.position.z = -1;
	lip.visible = false;
	camera.add(lip);
	const lipH = 2 * Math.tan(rad(LENS) / 2);
	function sizeLip(aspectR) {
		lu.uAspect.value = aspectR;
		lip.scale.set(lipH * aspectR, lipH, 1);
	}
	let loopIn = false;
	// ?sperm=0 hides the swimmer, for checking the seam pixel for pixel: its
	// roll is on real time, so it is the one thing two loads never agree on.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';

	let t = 0;
	let asked = false;
	let finalised = false;
	// The switch-on: where the nose reaches the glass plane, and where on the
	// glass it touched (null until it has, on this run).
	let pStar = 1;
	let contact = null;
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
		pivot.add(sw.group);
		sw.group.quaternion.identity();
		sw.group.position.set(0, 0, 0);
		sw.material.uniforms.uOpacity.value = 0;
		// The contact: the nose on the glass plane, z0·p − lead − halfLen = zGlass.
		const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
		pStar = (kal.zGlass + A.lead + halfLenUnit * bodyH) / zEnd;
		contact = null;
		// Came home through the record? Then the lip; and forget it.
		loopIn = nest.viaRecord;
		nest.viaRecord = false;
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
	const noseW = new THREE.Vector3();
	const euler = new THREE.Euler();
	const qYaw = new THREE.Quaternion();
	const qBank = new THREE.Quaternion();
	const Y = new THREE.Vector3(0, 1, 0);
	const Z = new THREE.Vector3(0, 0, 1);
	function set(p) {
		// ── The camera: one speed, one lens, one hand ────────────────────
		// Straight down the axis at one speed; the lens is the run's (LENS,
		// set once); and the slow pan, tilt and roll on it is the hand the
		// whole run is shot with, on the run's clock (world/wobble.js) — the
		// tunnel picks it up at the seam at the same second.
		const z = zEnd * p;
		rig.position.set(0, 0, z);
		camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		camera.updateMatrixWorld(true);

		// ── The sky and the debris ───────────────────────────────────────
		// Up with the card lifting; out under the set as it takes the frame, so
		// the seam frame is the set, the tunnel inside it and nothing else.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));

		// ── The lip ──────────────────────────────────────────────────────
		{
			const k = smootherstep(span(p, T.lip));
			const a = loopIn ? smoothstep(0, 0.02, p) * Math.pow(1 - k, 1.2) : 0;
			lu.uK.value = k;
			lu.uA.value = a;
			lip.visible = a > 0.001;
		}

		// ── The swimmer ──────────────────────────────────────────────────
		// It rides ahead of the LENS, dead centre — a child of the camera, so
		// the hand on the camera leans the world round it and not it. Sized
		// off the lens and the ride so it holds its place in the frame. It
		// arrives by fading in, where it rides. For the questions it pulls
		// ahead to A.far at that size, turns side-on about its centre with a
		// lean into the turn that is gone once it is round, holds, and comes
		// back: at the seam it is exactly the body it was.
		const inK = smootherstep(span(p, T.swimmerIn));
		const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
		let dist = lerp(A.lead, A.far, smootherstep(span(p, T.pull)));
		dist = lerp(dist, A.lead, smootherstep(span(p, T.ride)));
		const turn = smootherstep(span(p, T.turn)) * (1 - smootherstep(span(p, T.back)));
		const yaw = (turn * Math.PI) / 2;
		const bank = Math.sin(2 * yaw) * A.bank;
		pivot.position.set(0, 0, -dist);
		pivot.quaternion.copy(qBank.setFromAxisAngle(Z, bank)).multiply(qYaw.setFromAxisAngle(Y, yaw));
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? inK : 0;

		// ── The set, and the switch-on ───────────────────────────────────
		// OFF until the answers are in — nothing at the centre of the frame but
		// the swimmer for both questions — then the signal, the set out of the
		// dark under it, dark, and its glass switching on where the nose
		// touches it: the dot, the line drawn out of it, the covers parting
		// about the line. The room at the tunnel's end is on the same dimmer,
		// and comes out of the dark in its own time (NEST.seen).
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		nest.setDim(lit);
		kal.setDim(lit);
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));
		const g = kal.screen.glass;
		if (!contact && p >= pStar) {
			// The first frame past the contact: where the nose is, on the glass,
			// in the set's own frame (the set sits at −glass.x, −glass.y).
			nose.getWorldPosition(noseW);
			contact = { x: noseW.x + g.x, y: noseW.y + g.y };
		}
		const c = contact ?? { x: g.x, y: g.y };
		const S = T.switchOn;
		const B = Math.max(S.by - pStar, 0.005);
		const win = ([a, b]) => [pStar + a * B, pStar + b * B];
		const dot = smoothstep(...win(S.dot), p);
		const width = smoothstep(...win(S.line), p);
		const open = smoothstep(...win(S.open), p);
		const glow = dot * (1 - smoothstep(...win(S.glow), p));
		// The dot FLARES — brighter than the line it becomes, a point of light
		// rather than the start of a bar — and settles as it draws out.
		kal.setOpen(open, width, glow * (1 + 2.2 * (1 - width)), c.x, c.y);

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
			sizeLip(w / h);
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
			lip.geometry.dispose();
			lipMat.dispose();
		}
	};
}
