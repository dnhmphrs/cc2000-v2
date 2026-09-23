import { vec4, texture, positionView, smoothstep as tslSmoothstep } from 'three/tsl';
import { get } from 'svelte/store';
import {
	SCENES,
	APPROACH,
	NEST,
	KALEIDO,
	TUNNEL,
	VARIANT,
	span,
	lerp,
	clamp01,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	DEV,
	DEV_AT
} from '$lib/config';
import { gate, landing, decade, aspect, caption } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { glassCut } from '$lib/three/tsl/glass';
import { DECADES } from '$lib/data/roomElements';
import { SCREEN_GLASS } from '$lib/config';
import { rand } from '$lib/random';
import { roomsFor } from './nest';

// ── Scene 1: the approach ────────────────────────────────────────────────────
// The fly-in, remade. Space, black, a sky of stars — and the swimmer, riding a
// few units ahead of the lens as it did in the tunnel, seen from BEHIND,
// rolling about the axis you are looking down. What it is swimming through is
// the archive: monitors, dozens of them, adrift in the dark at every distance,
// each one's glass cut out and its decade's room lit inside it, and the
// furniture of those rooms — desks, beds, posters, clocks — tumbling past on
// either side. Close in, debris streaks by, which is what makes the speed read.
//
// One is dead ahead: the SCREEN, a monitor whose glass holds the tunnel the
// archive loops down on the other side (world/kaleidoscope.js). It grows, and
// the run ends with its glass filling the frame's height on the seam lens,
// which is the exact frame the kaleido opens on — kaleidoscope.pose(0), asked
// for by both scenes.
//
// ── The opening ──────────────────────────────────────────────────────────────
// The card lifts, the sky develops, and then the swimmer is there: it fades in
// at its riding distance, on the axis — and only then does the archive start
// arriving. Three beats, and the third is the event. It does NOT fly past the
// lens from behind: every version of that reads as a body being stretched by
// a wide lens.
//
// ── The archive, along the flight ────────────────────────────────────────────
// Everything adrift is spread evenly down the flight, from where the swimmer
// is in to the portal, and comes out of the dark — unseen beyond
// APPROACH.seen[1] units ahead, fully there inside seen[0] — so what is on
// screen is what is passing, never the whole field seen from the far end. It
// runs right up to the glass: the last pieces flank the screen as it takes
// the frame and leave by the edges before the seam, which a tube round the
// axis does on its own — and inside the glass the archive goes on, looped.
//
// ── The flight takes the answers ─────────────────────────────────────────────
// There is no machine, so the run asks its two questions on the way in, and
// while either is open the scene HOLDS: `t` stops and the swimmer's clock does
// not, so it goes on rolling and what is on screen is a flight waiting rather
// than a paused frame. Holding t rather than running a second clock is what
// keeps every frame a pure function of progress, so ?at= is exact. (The roll
// and the tail's wobble are on the swimmer's own clock, as in the tunnel — the
// one thing in the run that never stops, not even at the seam.)
//
// ── One speed, through the seam ──────────────────────────────────────────────
// The lens flies at ONE speed the whole way into the glass, no brake, and the
// tunnel on the other side carries on at it; the fall's pace is met at the far
// end of the tunnel, not here. So the swimmer never slows in space.
//
// The screen, the portal and room 0 are chosen when the run begins, because
// they are drawn from the first frame; the deeper rooms are set the moment the
// answer is in, while they are still too small to see. See finalise().
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

	// ── The archive adrift ───────────────────────────────────────────────
	// The drawings are the nest's. Everything adrift is a shade down and on one
	// dimmer, so the white sets don't blaze and the lot comes up with the sky.
	const tex = nest.textures;
	const { uniform } = await import('three/tsl');
	const uOn = uniform(0);
	// Out of the dark: by view depth, so a piece is there only once it is near.
	const uSeen0 = uniform(A.seen[0]);
	const uSeen1 = uniform(A.seen[1]);
	const near = tslSmoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const driftMats = [];
	const dimMat = {};
	const bgMat = {};
	const furnMat = {};
	for (const d of DECADES) {
		const m = new THREE.MeshBasicNodeMaterial({ transparent: true });
		const c = glassCut(d, tex[d].screen)();
		m.colorNode = vec4(c.rgb.mul(0.8).mul(uOn), c.a.mul(uOn).mul(near));
		dimMat[d] = m;
		driftMats.push(m);
		const b = new THREE.MeshBasicNodeMaterial({ transparent: true });
		const tb = texture(tex[d].bg);
		b.colorNode = vec4(tb.rgb.mul(uOn), uOn.mul(near));
		bgMat[d] = b;
		driftMats.push(b);
		furnMat[d] = {};
		for (const key of ['desk', 'bed', 'poster', 'clock']) {
			const fm = new THREE.MeshBasicNodeMaterial({ transparent: true });
			const tf = texture(tex[d][key]);
			fm.colorNode = vec4(tf.rgb.mul(0.8).mul(uOn), tf.a.mul(uOn).mul(near));
			furnMat[d][key] = fm;
			driftMats.push(fm);
		}
	}
	const drifters = new THREE.Group();
	drifters.name = 'drifters';
	scene.add(drifters);
	const items = []; // { mesh, rot0, rate }
	const plane = new THREE.PlaneGeometry(1, 1);

	// One monitor: the screen drawing with its glass cut out, and the decade's
	// room behind the hole, cover-cropped to the glass.
	function monitor(decade, width) {
		const g = new THREE.Group();
		const s = tex[decade].screen;
		const b = tex[decade].bg;
		const art = s.image.width / s.image.height;
		const height = width / art;
		const front = new THREE.Mesh(plane, dimMat[decade]);
		front.scale.set(width, height, 1);
		g.add(front);
		const gl = SCREEN_GLASS[decade];
		const gw = gl.w * width;
		const gh = gl.h * height;
		const geo = new THREE.PlaneGeometry(1, 1);
		const ba = b.image.width / b.image.height;
		const ga = gw / gh;
		const uvs = geo.attributes.uv;
		for (let i = 0; i < uvs.count; i++) {
			let u = uvs.getX(i);
			let v = uvs.getY(i);
			if (ba > ga) u = 0.5 + (u - 0.5) * (ga / ba);
			else v = 0.5 + (v - 0.5) * (ba / ga);
			uvs.setXY(i, u, v);
		}
		// A DEAD set: no room behind the glass, the dark shows through it.
		if (VARIANT.flight !== 'few') {
			const room = new THREE.Mesh(geo, bgMat[decade]);
			room.scale.set(gw, gh, 1);
			room.position.set((gl.cx - 0.5) * width, (0.5 - gl.cy) * height, -0.03);
			g.add(room);
		}
		return g;
	}
	function furniture(decade, key, width) {
		const t = tex[decade][key];
		const m = new THREE.Mesh(plane, furnMat[decade][key]);
		m.scale.set(width, width / (t.image.width / t.image.height), 1);
		return m;
	}
	// A tube of them, off the axis, each at its own fraction of the way down
	// the flight. Where that is in the world depends on the flight's profile,
	// which is settled per run — see placeNest(), which lays them out.
	const place = (obj, r0, r1) => {
		const a = rand() * Math.PI * 2;
		const r = r0 + rand() * (r1 - r0);
		obj.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.75, 0);
		obj.rotation.y = (rand() - 0.5) * 0.6;
		const rot0 = (rand() - 0.5) * 0.5;
		obj.rotation.z = rot0;
		drifters.add(obj);
		items.push({
			mesh: obj,
			rot0,
			rate: (rand() - 0.5) * 0.4,
			u: rand()
		});
	};
	for (let i = 0; i < A.screens; i++) {
		place(monitor(DECADES[i % DECADES.length], 1.6 + rand() * 1.6), A.tube[0], A.tube[1]);
	}
	const KEYS = ['desk', 'bed', 'poster', 'clock'];
	for (let i = 0; i < A.furniture; i++) {
		const key = KEYS[i % KEYS.length];
		const big = key === 'desk' || key === 'bed';
		place(
			furniture(
				DECADES[(i * 7) % DECADES.length],
				key,
				big ? 1.8 + rand() * 1.6 : 0.6 + rand() * 0.7
			),
			A.tube[0],
			A.tube[1]
		);
	}

	// ── The signal ───────────────────────────────────────────────────────
	// One point of light dead ahead, where the set is, from the second answer
	// until the set itself can be read: the answer did something, and that is
	// where the flight is going.
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
	let askedDob = false;
	let askedSpicy = false;
	let finalised = false;
	let zEnd = 0;
	let zFirst = 0;

	// The screen sits with its glass dead ahead on the axis, `travel` units
	// down it, the tunnel inside it and the nest at the tunnel's end; the lens
	// stops exactly where the kaleidoscope says the glass fills the frame's
	// height on the seam lens. Asked of it rather than worked out here, so the
	// two scenes cannot disagree about it. ONE SPEED, no brake — the tunnel
	// carries on at it — so the flight is simply zEnd · p.
	function placeArchive() {
		zEnd = kal.z0;
		// The archive: evenly from where its first piece comes into view —
		// seen[1] ahead of the lens at archiveFrom — down to where the lens
		// stops. Beyond that is the screen's glass, which nothing may sit in.
		zFirst = zEnd * T.archiveFrom - A.seen[1];
		// ?flight=few: the few dead sets pass after the first answer and are
		// gone before the second; ?flight=empty has no items at all.
		const zLast = VARIANT.flight === 'few' ? zEnd * T.fewTo : zEnd;
		if (VARIANT.flight === 'few') zFirst = zEnd * T.fewFrom - A.seen[1];
		for (const it of items) it.mesh.position.z = lerp(zFirst, zLast, it.u);
		signal.position.set(0, 0, -A.travel);
	}

	function portrait() {
		return get(aspect) === 'portrait';
	}

	// The deeper rooms, once the answer is in. Room 0 and the portal stay as
	// they are — they have been on screen since the first frame.
	function finalise() {
		finalised = true;
		const first = nest.built.rooms[0];
		nest.build({
			portal: nest.built.portal,
			rooms: roomsFor(first, get(decade), SCENES.descent.rooms),
			portrait: portrait()
		});
		kal.placeNest();
	}

	function enter() {
		t = 0;
		askedDob = false;
		askedSpicy = false;
		finalised = false;
		landing.set(0);
		caption.set({ text: '', k: 0, on: 0 });
		// A fresh run: the screen, the portal's set and the first room are
		// drawn from the first frame, so they are chosen now, at random, and
		// everything placed; the deeper rooms are set by finalise() when the
		// answer is known.
		kal.freshRun({ answer: get(decade), portrait: portrait() });
		finalised = !!get(decade);
		placeArchive();
		kal.set(0);
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

		// The questions, in the order the shot makes room for them. NOT while
		// the scene is pinned: ?at= is for looking at one frame of the flight,
		// and a popup over it is the one thing that stops you seeing it.
		if (!held && !(DEV.on && DEV_AT != null)) {
			if (!askedDob && p >= T.askDob) {
				askedDob = true;
				gate.set('dob');
			} else if (!askedSpicy && p >= T.askSpicy) {
				askedSpicy = true;
				gate.set('spicy');
			}
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

		// ── The sky, the debris and the archive ──────────────────────────
		// Up with the card lifting; out under the portal as it takes the frame,
		// so the seam frame is the nest and nothing else (SCENES.approach.skyOut).
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));
		uOn.value = on;
		// The set is OFF until the second answer is in — nothing at the centre
		// of the frame but the swimmer for both questions — and then it comes
		// out of the dark under the signal, and its glass switches on when its
		// bezel can be read: a hairline that opens onto the tunnel (?on=crt),
		// or it simply lights (?on=fade). The portal at the tunnel's end is on
		// the same switch.
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		nest.setDim(lit);
		kal.setDim(lit);
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));
		if (VARIANT.on === 'crt') {
			const open = smoothstep(T.crtOn[0], T.crtOn[1], p);
			const glow = p >= T.crtOn[0] ? 1 - smoothstep(T.crtOn[0], T.crtOn[1] + 0.04, p) : 0;
			kal.setOpen(open, glow);
		} else kal.setOpen(1, 0);
		for (const it of items) it.mesh.rotation.z = it.rot0 + p * it.rate;

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
		// lens stops short of the screen's glass — but the visibility has to be
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
		// The flight's profile, for the harness: where the lens stops, where
		// the archive starts, and the speeds either side of the tunnel.
		get profile() {
			return { zEnd, zFirst, ...kal.speeds };
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
		// For the seam check: the swimmer's roll and wobble phase, which the
		// descent carries on from.
		dispose() {
			motes.dispose();
			plane.dispose();
			sigGeo.dispose();
			sigMat.dispose();
		}
	};
}
