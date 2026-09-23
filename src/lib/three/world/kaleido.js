import { get } from 'svelte/store';
import {
	SCENES,
	NEST,
	APPROACH,
	KALEIDO,
	TUNNEL,
	VARIANT,
	span,
	lerp,
	clamp01,
	smoothstep,
	smootherstep
} from '$lib/config';
import { decade, aspect, conceived, caption } from '$lib/store/store';
import { formatDay } from '$lib/functions/utils';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createCrtMask } from './kaleidoscope';
import { roomsFor } from './nest';

// ── Scene 2: the kaleido ─────────────────────────────────────────────────────
// Through the glass and down the tunnel. It opens on the frame the approach
// ended on — the screen's glass filling the frame's height, the tunnel inside
// it (kaleidoscope.pose(0)) — flies through the glass, and runs the tunnel at
// the speed the flight arrived at, the swimmer riding ahead of the lens as it
// did in space, the rings turning and cycling round it. Over the last of it
// the rings go out under the portal, the lens closes on it, and the frame it
// ends on is nest.pose(0): the frame the descent opens on.
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
	const camera = new THREE.PerspectiveCamera(NEST.seamFov, 1, 0.1, 400);
	// In the scene, so the CRT mask can ride on it (?beat=black).
	scene.add(camera);
	const crt = createCrtMask(THREE);
	camera.add(crt.group);
	let aspectR = 1;
	// The machine's line, as the search stops (?cap=). Fixed at enter, when
	// the answer is in.
	let capText = '';
	function lineFor() {
		if (VARIANT.cap === 'located') return 'bedroom located.';
		if (VARIANT.cap === 'date' && get(conceived))
			return `conceived roughly ${formatDay(get(conceived))}.`;
		return '';
	}
	const sw = nest.swimmer;
	// ?sperm=0 — see world/approach.js.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';
	const SPIN = -TUNNEL.spermSpin;
	let t = 0;

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
			nest.build({
				portal: nest.built.portal,
				rooms: roomsFor(rooms[0], answer, SCENES.descent.rooms),
				portrait
			});
			kal.placeNest();
		}
	}

	function enter() {
		t = 0;
		ensure();
		if (kal.root.parent !== scene) scene.add(kal.root);
		if (nest.root.parent !== scene) scene.add(nest.root);
		scene.add(sw.group);
		sw.group.quaternion.identity();
		kal.setDim(1);
		kal.setOpen(1, 0);
		nest.setDim(1);
		nest.setDark(1);
		capText = lineFor();
		set(0);
	}

	function set(p) {
		const { fov, Dend } = kal.pose(p, camera, aspectR);
		kal.set(p);

		// ── The swimmer ──────────────────────────────────────────────────
		// Ahead of the lens, dead centre, at the ride it arrived at — and over
		// the last of the tunnel pulling in to the ride the descent expects.
		const lead = lerp(KALEIDO.lead, Dend * NEST.spermRide, smootherstep(span(p, T.dive)));
		const bodyH = APPROACH.span * 2 * lead * Math.tan(rad(fov) / 2);
		sw.group.position.set(0, 0, camera.position.z - lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 : 0;

		// ── The stop, and the switch-off ─────────────────────────────────
		if (VARIANT.beat === 'black') {
			// The covers close to a line, the line to a dot, and black; the
			// machine's line waits for the picture to come back (descent.js).
			const open = 1 - smootherstep(span(p, T.collapse));
			const width = 1 - smootherstep(span(p, T.pinch));
			const glow = p >= T.collapse[0] ? 1 - smoothstep(T.pinch[1], 1, p) : 0;
			crt.set(camera, open, width, glow);
			caption.set({ text: capText, k: 0, on: 0 });
		} else {
			crt.set(camera, 1, 1, 0);
			if (VARIANT.beat === 'rest' && capText) {
				caption.set({ text: capText, k: smoothstep(T.cap[0], T.cap[1], p), on: 1 });
			}
		}

		kal.rebase(camera.position.z, camera.near);
	}

	function update(dt) {
		t += dt;
		sw.clock += dt;
		set(clamp01(t / T.duration));
		return t >= T.duration;
	}

	return {
		scene,
		camera,
		enter,
		update,
		set,
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
		}
	};
}
