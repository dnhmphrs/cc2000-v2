import { get } from 'svelte/store';
import { SCENES, APPROACH, LENS, TUNNEL, clamp01, smoothstep, runSeconds } from '$lib/config';
import { decade, edge, aspect } from '$lib/store/store';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { runClock } from '$lib/three/tsl/clock';
import { roomsFor } from './nest';
import { settled } from '$lib/scenes/director';

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
// ── A birthday the archive cannot answer for ─────────────────────────────────
// (The swimmer does not stop with the lens: it keeps the tunnel's pace and
// pulls away down it as the lens slows, fading out before the verdict is up.
// And "calculate again" does not cut to the flight: the lens swims on down
// the tunnel from where it stopped, gathering speed, into the tunnel's dark,
// and the next flight opens on that black — stepReturn, as the way home
// through the room's monitor does.)
// An out-of-range birthday is not refused: the run goes in anyway, and it is
// HERE that it ends. With `edge` set there is no answer and no room at the
// tunnel's end, and the tunnel is not the archive: its rings are the
// verdict's own gif (kaleidoscope.js setArchive), playing. The swimmer swims
// down it at the flight's pace and then SLOWS TO A STOP inside it over
// `stop` — the camera, the turn and the hue all coming to rest together —
// and the director hands to the verdict (components/error/ErrorScreen.svelte),
// typed over this frame: the gif tunnel, still playing, the swimmer rolling
// at the centre of it. No breakdown and no screen of its own.
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
	scene.add(camera);
	let aspectR = 1;
	const sw = nest.swimmer;
	// ?sperm=0 — see world/approach.js.
	const SPERM =
		typeof window === 'undefined' ||
		new URLSearchParams(window.location.search).get('sperm') !== '0';
	const SPIN = -TUNNEL.spermSpin;
	let t = 0;
	let broken = false;
	// Seconds the verdict has been up: the gif goes on playing under it.
	let heldT = 0;

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
		heldT = 0;
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
		// No room at the end of a tunnel that has no answer at the end of it.
		nest.setDim(broken ? 0 : 1);
		nest.setDark(1);
		set(0);
	}

	// The tunnel's progress on an edge run: the flight's pace to `stop[0]`,
	// then slowing at an even rate to rest at `stop[1]`, and still after it.
	function stopAt(p) {
		const [a, b] = T.stop;
		if (p <= a) return p;
		const q = Math.min(p, b) - a;
		return a + q - (q * q) / (2 * (b - a));
	}

	function set(p) {
		const x = broken ? stopAt(p) : p;
		const { fov } = kal.pose(x, camera, aspectR);
		kal.set(x, broken);
		// The gif's frame is on the run's clock, which does NOT stop.
		runClock.value = runSeconds('kaleido', p) + heldT;

		// ── The swimmer ──────────────────────────────────────────────────
		// Ahead of the lens, dead centre, at the ride it arrived at — a child
		// of the camera, as in the approach, so the hand on the camera leans
		// the tunnel round it and not it. (The fall rides it nearer, sized to
		// match: the same body on screen, so nothing moves at the seam.) On
		// an edge run it keeps the pace the lens gives up — it is where the
		// lens would have been, `lead` ahead — pulling away down the tunnel
		// as the lens stops, smaller as it goes, and fading out over
		// `swimOff`, before the verdict.
		const lead = APPROACH.lead;
		const bodyH = APPROACH.span * 2 * lead * Math.tan(rad(fov) / 2);
		const gap = broken ? kal.tunnelZ(x) - kal.tunnelZ(p) : 0;
		const off = broken ? 1 - smoothstep(T.swimOff[0], T.swimOff[1], p) : 1;
		sw.group.position.set(0, 0, -(lead + gap));
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = sw.roll;
		sw.material.uniforms.uTime.value = sw.clock;
		sw.material.uniforms.uOpacity.value = SPERM ? off : 0;

		kal.rebase(camera.position.z, camera.near);
	}

	function update(dt) {
		// The roll gathers speed with the tunnel — at the swimmer's own pace,
		// which on an edge run does not stop (nest.swimmer.spinAt).
		sw.roll += dt * SPIN * sw.spinAt(kal.tunnelPace(clamp01(t / T.duration)));
		t += dt;
		sw.clock += dt;
		set(clamp01(t / T.duration));
		return t >= T.duration;
	}

	// ── The verdict, being read ──────────────────────────────────────────
	// On an edge run the run hands to the verdict (a panel over whatever this
	// last drew: the gif tunnel, stopped), and the Stage holds this scene
	// under it. The swimmer's clock goes on, so it goes on rolling, and so
	// does the run's, so the gif goes on playing.
	function hold(dt) {
		sw.clock += dt;
		heldT += dt;
		set(clamp01(t / T.duration));
	}

	// ── On, after the verdict ────────────────────────────────────────────
	// "Calculate again" (director.recover) hands the run back through the
	// tunnel rather than cutting to the flight: from where the lens stopped
	// it swims on, from rest and gathering speed, down the rest of the tunnel
	// into its dark end over SCENES.kaleido.home seconds, everything going
	// to black over `homeDim` of that — so the frame it ends on is the black
	// the next flight opens on, as the way home through the room's monitor
	// ends (world/descent.js). The gif plays on to the last.
	let rt = 0;
	let xFrom = 0;
	let handedOver = false;
	function beginReturn() {
		rt = 0;
		handedOver = false;
		xFrom = broken ? stopAt(1) : 1;
	}
	function stepReturn(dt) {
		rt = Math.min(rt + dt, T.home);
		heldT += dt;
		sw.clock += dt;
		const q = rt / T.home;
		const x = xFrom + (1 - xFrom) * q * q;
		kal.pose(x, camera, aspectR);
		kal.set(x, broken);
		runClock.value = runSeconds('kaleido', 1) + heldT;
		kal.setDim(1 - smoothstep(T.homeDim[0], T.homeDim[1], q));
		sw.material.uniforms.uOpacity.value = 0;
		kal.rebase(camera.position.z, camera.near);
		if (!handedOver && rt >= T.home) {
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
		seek(v) {
			t = v * T.duration;
			set(clamp01(v));
		},
		reset() {
			t = 0;
			heldT = 0;
		}
	};
}
