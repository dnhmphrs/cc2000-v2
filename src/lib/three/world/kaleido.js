import { get } from 'svelte/store';
import {
	SCENES,
	APPROACH,
	LENS,
	TUNNEL,
	span,
	clamp01,
	smoothstep,
	smootherstep,
	runSeconds
} from '$lib/config';
import { decade, edge, aspect } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createCrtMask } from './kaleidoscope';
import { runClock } from '$lib/three/tsl/clock';
import { roomsFor } from './nest';

// ── Scene 2: the kaleido ─────────────────────────────────────────────────────
// Through the glass and down the tunnel. It opens on the frame the approach
// ended on — the set's glass filling the frame's height, the tunnel inside it
// (kaleidoscope.pose(0)) — flies through the glass, and runs the tunnel from
// the speed the flight arrived at, easing all the way down to the pace the
// fall opens at, the swimmer riding ahead of the lens as it did in space, the
// rings turning and cycling round it, the same lens and the same hand on the
// camera as in space. Then the search ENDS: over the last of the tunnel the
// turn and the hue decelerate to rest, the hue landing on true colour, and a
// room comes out of the dark at the tunnel's end — the whole room, not a set,
// as the LABEL of a record, gold grooves round it (nest.js, the disc) — and
// takes the frame. The frame it ends on is nest.pose(0): the frame the
// descent opens on, and the fall carries straight on from it.
//
// ── The breakdown ────────────────────────────────────────────────────────────
// An out-of-range birthday is not refused: the run goes in anyway, and it is
// HERE that it fails. With `edge` set there is no answer and no room at the
// tunnel's end; instead the picture overloads — brighter, faster, the hue
// whirling — and collapses like a set switching off: to a line, to a dot, to
// black, the swimmer alone in it. The scene ends black and the director hands
// to the verdict screen (components/error/ErrorScreen.svelte).
//
// Every value here is a pure function of scene progress, so ?at= is exact;
// the swimmer's roll and wobble are on its own clock, as everywhere.

const rad = (d) => (d * Math.PI) / 180;

export function createKaleido({ THREE, renderer, nest, kal }) {
	const T = SCENES.kaleido;

	const scene = new THREE.Scene();
	// The same ground as the approach and the descent, with the same numbers.
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	// In the scene, so the CRT mask can ride on it for the breakdown.
	scene.add(camera);
	const crt = createCrtMask(THREE);
	camera.add(crt.group);
	let aspectR = 1;
	const sw = nest.swimmer;
	// ?sperm=0 — see world/approach.js.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';
	const SPIN = -TUNNEL.spermSpin;
	let t = 0;
	let broken = false;

	// A run arrives here with everything built and placed by the approach, and
	// the rooms set for the answer. A jump straight in has nothing, so it is
	// built here from whatever answer the harness seeded — or has the rooms
	// of an answer it was not built for, and gets them set as the approach
	// would have (finalise()).
	function ensure() {
		const answer = get(decade);
		const portrait = get(aspect) === 'portrait';
		if (!kal.placed || !nest.levels.length) {
			kal.freshRun({ answer, portrait });
			return;
		}
		const rooms = nest.built.rooms;
		if (answer && rooms[rooms.length - 1] !== answer) {
			nest.build({ rooms: roomsFor(rooms[0], answer, SCENES.descent.rooms), portrait });
			kal.placeNest();
		}
	}

	function enter() {
		t = 0;
		broken = !!get(edge);
		ensure();
		// The drawings down the tunnel, or the verdict's gif.
		kal.setArchive(broken ? get(edge) : null);
		if (kal.root.parent !== scene) scene.add(kal.root);
		if (nest.root.parent !== scene) scene.add(nest.root);
		camera.add(sw.group);
		sw.group.quaternion.identity();
		kal.setDim(1);
		{
			const g = kal.screen.glass;
			kal.setOpen(1, 1, 0, g.x, g.y);
		}
		// No room at the end of a tunnel that is about to break down.
		nest.setDim(broken ? 0 : 1);
		nest.setDark(1);
		set(0);
	}

	function set(p) {
		const { fov } = kal.pose(p, camera, aspectR);
		kal.set(p, broken);
		runClock.value = runSeconds('kaleido', p);
		nest.setDiscRin(aspectR);

		// ── The swimmer ──────────────────────────────────────────────────
		// Ahead of the lens, dead centre, at the ride it arrived at — a child
		// of the camera, as in the approach, so the hand on the camera leans
		// the tunnel round it and not it. (The fall rides it nearer, sized to
		// match: the same body on screen, so nothing moves at the seam.)
		const lead = APPROACH.lead;
		const bodyH = APPROACH.span * 2 * lead * Math.tan(rad(fov) / 2);
		sw.group.position.set(0, 0, -lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 : 0;

		// ── The breakdown ────────────────────────────────────────────────
		// The covers close to a line, the line to a dot, and black.
		if (broken) {
			const open = 1 - smootherstep(span(p, T.collapse));
			const width = 1 - smootherstep(span(p, T.pinch));
			const glow = p >= T.collapse[0] ? 1 - smoothstep(T.pinch[1], 1, p) : 0;
			crt.set(camera, open, width, glow);
		} else crt.set(camera, 1, 1, 0);

		kal.rebase(camera.position.z, camera.near);
	}

	function update(dt) {
		t += dt;
		sw.clock += dt;
		set(clamp01(t / T.duration));
		return t >= T.duration;
	}

	// ── The verdict, being read ──────────────────────────────────────────
	// After the breakdown the run hands to the verdict screen (a DOM screen
	// over whatever this last drew: the set switched off, black, the swimmer
	// alone in it), and the Stage holds this scene under it. The swimmer's
	// clock goes on, so it goes on rolling under the verdict rather than
	// freezing on the frame the tunnel ended on.
	function hold(dt) {
		sw.clock += dt;
		set(clamp01(t / T.duration));
		runClock.value += dt;
	}

	return {
		scene,
		camera,
		enter,
		update,
		set,
		hold,
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspectR = w / h;
			camera.aspect = aspectR;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = aspectR;
			bu.uPx.value = 1 / renderer.domElement.height;
		},
		seek(v) {
			t = v * T.duration;
			set(clamp01(v));
		},
		reset() {
			t = 0;
		},
		dispose() {
			crt.dispose();
		}
	};
}
