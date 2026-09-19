import { get } from 'svelte/store';
import {
	SCENES,
	NEST,
	span,
	lerp,
	clamp01,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	easeInOutPower,
	accelerate
} from '$lib/config';
import { decade, landing, monitorRect, blaze, aspect } from '$lib/store/store';
import { DECADES, shuffle } from '$lib/data/roomElements';
import { settled } from '$lib/scenes/director';
import { roomsFor } from './nest';

// ── Scene 2: the descent ─────────────────────────────────────────────────────
// Rooms through rooms, decade after decade, with the swimmer riding down the
// middle, ahead of the lens, into every screen in turn — all the way down to
// the answer's room. It opens on nest.pose(0), the frame the approach ended
// on, and falls on one ease to `land` of the way into the last room, past the
// point where the glass it came through has left the frame and with the room
// still round the monitor.
//
// The last thing the swimmer does is leave the axis for that monitor's glass
// and go in, and the glass goes WHITE — the splosh — with a flash across the
// frame and the raster coming off. Then the readout comes up in the glass
// (scenes/Room.svelte), which is measured here and published as monitorRect.
//
// "Go again" is the same crossing carried on: the camera flies from the
// landing to the glass filling the frame, and through it, and what is behind
// the glass is black — the space the next run opens on. See stepReturn().
//
// Every value here is a pure function of scene progress, so ?at= is exact. The
// one exception is the swimmer's roll, which carries on from wherever the
// approach left it rather than restarting on the cut.

const rad = (d) => (d * Math.PI) / 180;

export function createDescent({ THREE, renderer, nest }) {
	const T = SCENES.descent;
	const RETURN_DUR = SCENES.calculator.arrive;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	const camera = new THREE.PerspectiveCamera(NEST.seamFov, 1, 0.05, 100);
	let aspectR = 1;
	const sw = nest.swimmer;
	// ?sperm=0 — see world/approach.js.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';

	let t = 0;
	let held = 0; // seconds since landing, while the room is up
	let rollBase = 0;
	let timeBase = 0;
	let zetaEnd = 0;
	const fwd = new THREE.Vector3();
	const at = new THREE.Vector3();

	// A run arrives here with the nest built by the approach and finalised once
	// the answer was in. A jump straight in — the dev keys, ?at= — has neither,
	// so it is built here from whatever answer the harness seeded.
	function ensureNest() {
		const answer = get(decade);
		const rooms = nest.built.rooms;
		const last = rooms[rooms.length - 1];
		if (rooms.length && (!answer || last === answer)) return;
		const picks = shuffle(DECADES);
		nest.build({
			portal: nest.built.portal ?? picks[0],
			rooms: roomsFor(rooms[0] ?? picks[1], answer, T.rooms),
			portrait: get(aspect) === 'portrait'
		});
		nest.refreshClips();
	}

	function publish() {
		monitorRect.set(nest.glassRect(camera, window.innerWidth, window.innerHeight));
	}

	function enter() {
		t = 0;
		held = 0;
		ensureNest();
		if (nest.root.parent !== scene) scene.add(nest.root);
		scene.add(sw.group);
		rollBase = sw.spinner.rotation.z;
		timeBase = sw.material.uniforms.uTime.value;
		zetaEnd = nest.levels.length - 1 + T.land;
		landing.set(0);
		blaze.set(0);
		monitorRect.set(null);
		nest.setSplosh(0, 1);
		nest.setDim(1);
		set(0);
	}

	function set(p) {
		const zeta = zetaEnd * smootherstep(p);
		const { D, fov } = nest.pose(zeta, camera, aspectR);

		// ── The swimmer ──────────────────────────────────────────────────
		// Down the axis, half way to the frame being fallen into, sized to hold
		// its place in the frame — and at the end, off the axis to the glass.
		const ride = NEST.spermRide * D;
		const bodyH = NEST.spermSpan * 2 * ride * Math.tan(rad(fov) / 2);
		fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
		at.copy(camera.position).addScaledVector(fwd, ride);
		const dive = accelerate(span(p, T.dive), 2.4);
		if (dive > 0) at.lerp(nest.lastGlassWorld().centre, dive);
		sw.group.position.copy(at);
		sw.group.quaternion.copy(camera.quaternion);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = rollBase - zeta * 2.5 * Math.PI * 2;
		sw.material.uniforms.uTime.value = timeBase + zeta * 3.0;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 - smoothstep(T.gone - 0.006, T.gone, p) : 0;

		// ── The splosh, the flash, the raster ────────────────────────────
		nest.setSplosh(smootherstep(span(p, T.splosh)), 1);
		blaze.set(p >= T.blaze[0] ? 1 - easeInOutCubic(span(p, T.blaze)) : 0);
		landing.set(easeInOutCubic(span(p, T.landing)));
		if (p >= 0.995) publish();
	}

	function update(dt) {
		t += dt;
		set(clamp01(t / T.duration));
		if (t >= T.duration) {
			publish();
			blaze.set(0);
			return true;
		}
		return false;
	}

	// ── The room, being looked at ────────────────────────────────────────
	// The white drains out of the glass under the readout.
	function hold(dt) {
		held += dt;
		nest.setSplosh(1, 1 - smoothstep(0.15, T.drain, held));
	}

	// ── The way back ─────────────────────────────────────────────────────
	let rt = 0;
	let from = 0;
	let to = 0;
	let handedOver = false;
	function beginReturn() {
		rt = 0;
		handedOver = false;
		from = zetaEnd;
		// To the end of the last room's crossing: the glass fills the frame,
		// and the camera goes through it into the black.
		to = nest.levels.length - 0.001;
	}
	function stepReturn(dt) {
		rt = Math.min(rt + dt, RETURN_DUR);
		const k = easeInOutPower(rt / RETURN_DUR, 1.9);
		nest.pose(lerp(from, to, k), camera, aspectR);
		sw.material.uniforms.uOpacity.value = 0;
		nest.setSplosh(1, 0);
		publish();
		if (!handedOver && rt >= RETURN_DUR) {
			handedOver = true;
			settled();
		}
	}

	return {
		scene,
		camera,
		enter,
		update,
		set,
		hold,
		beginReturn,
		stepReturn,
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspectR = w / h;
			camera.aspect = aspectR;
			camera.updateProjectionMatrix();
		},
		remeasureMonitor() {
			if (get(monitorRect)) publish();
		},
		seek(v) {
			t = v * T.duration;
			set(clamp01(v));
		},
		reset() {
			t = 0;
			held = 0;
			monitorRect.set(null);
		}
	};
}
