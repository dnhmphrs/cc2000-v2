import { get } from 'svelte/store';
import {
	SCENES,
	NEST,
	TUNNEL,
	span,
	lerp,
	clamp01,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	accelerate
} from '$lib/config';
import { decade, landing, monitorRect, blaze, aspect } from '$lib/store/store';
import { DECADES, shuffle } from '$lib/data/roomElements';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
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
// the glass is black — the space the next run opens on. From rest,
// accelerating, in SCENES.descent.home seconds; the readout is gone in the
// first of them (scenes/Room.svelte) so nothing of the room rides the camera
// into the glass. See stepReturn().
//
// It falls at ONE PACE — the pace the approach arrived at — and eases to rest
// only at the end; the last room lands LEVEL, so the glass is square in the
// frame and the readout sits in it. See nest.zetaOf() and nest.pose().
//
// Every value here is a pure function of scene progress, so ?at= is exact. The
// one exception is the swimmer's roll and wobble, which run on its own clock
// so they never stop — not for a popup, and not at the seam.

const rad = (d) => (d * Math.PI) / 180;

export function createDescent({ THREE, renderer, nest }) {
	const T = SCENES.descent;
	const RETURN_DUR = T.home;

	const scene = new THREE.Scene();
	// The same ground the approach paints, with the same numbers: at the seam
	// the portal's drawing has holes in it — between the monitor and the tower,
	// under the keyboard — and what shows through them has to be the same on
	// both sides of the cut.
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(NEST.seamFov, 1, 0.05, 100);
	let aspectR = 1;
	const sw = nest.swimmer;
	// ?sperm=0 — see world/approach.js.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';

	const SPIN = -TUNNEL.spermSpin;
	let t = 0;
	let held = 0; // seconds since landing, while the room is up
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
		zetaEnd = nest.zetaEnd();
		landing.set(0);
		blaze.set(0);
		monitorRect.set(null);
		nest.setSplosh(0, 1);
		nest.setDim(1);
		nest.setDark(1);
		set(0);
	}

	function set(p) {
		const zeta = nest.zetaOf(p);
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
		sw.spinner.rotation.z = sw.clock * SPIN;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 - smoothstep(T.gone - 0.006, T.gone, p) : 0;

		// ── The splosh, the flash, the raster ────────────────────────────
		nest.setSplosh(smootherstep(span(p, T.splosh)), 1);
		blaze.set(p >= T.blaze[0] ? 1 - easeInOutCubic(span(p, T.blaze)) : 0);
		landing.set(easeInOutCubic(span(p, T.landing)));
		if (p >= 0.995) publish();
	}

	function update(dt) {
		t += dt;
		sw.clock += dt;
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
		// Past the end of the last room's crossing: the glass fills the frame
		// and the camera keeps going into it, and the room goes to black under
		// it, so the frame the next flight opens on — black — is the frame
		// this ends on.
		to = nest.levels.length - 1 + T.through;
	}
	function stepReturn(dt) {
		rt = Math.min(rt + dt, RETURN_DUR);
		const q = rt / RETURN_DUR;
		nest.pose(lerp(from, to, accelerate(q, 1.5)), camera, aspectR);
		sw.material.uniforms.uOpacity.value = 0;
		nest.setSplosh(1, 0);
		// The room goes to black under the glass as it takes the frame — in
		// COLOUR, so the glass stays black over it — and the raster comes back
		// with it: the run is a screen again. Then, black, it lets the ground
		// through, which is the frame the next flight opens on.
		const dark = smoothstep(T.homeDim[0], T.homeDim[1], q);
		nest.setDark(1 - dark);
		nest.setDim(1 - smoothstep(T.homeDim[1], 1, q));
		landing.set(1 - dark);
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
			bu.aspectRatio.value = aspectR;
			bu.uPx.value = 1 / renderer.domElement.height;
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
