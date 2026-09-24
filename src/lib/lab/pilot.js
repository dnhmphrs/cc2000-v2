import { SCENES, NEST, LENS, runSeconds, span, accelerate, smootherstep } from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createNest } from '$lib/three/world/nest';
import { wobbleEuler } from '$lib/three/world/wobble';
import { loadSwimmer } from '$lib/three/tsl/swimmer';

// ── Sketch: the pilot ────────────────────────────────────────────────────────
// The descent as the run has it — the real nest (world/nest.js), the real
// fall (nest.zetaOf, nest.pose), the run's one lens and the run's one hand on
// the camera — with ONE thing changed: who is flying. In the run the swimmer's
// orientation is copied from the camera: it goes where the lens goes, a hood
// ornament. Here the causality is reversed. The swimmer LEADS: its roll is a
// quarter of a crossing ahead of the camera's, so its body tips into the next
// room's 15° screw before the frame does, and its nose turns toward the
// monitor glass it is about to enter — off-centre in every room — before the
// spiral brings that glass to the middle. The camera path is untouched, nest.
// pose exactly, and only the swimmer's quaternion changes: q = camera × aim ×
// rollZ(lead). But now the twist reads as the swimmer's doing: it banks, and
// the room rolls after it.
//
// The picture: mid-crossing, a bedroom tilting toward 15°, the swimmer ahead
// of the lens with its nose turned a few degrees off the axis toward where
// the fall is going — its head off the centre of the swirl its tail draws,
// its body showing some length — and screwed a shade further round than the
// room. Honest note: the run's rooms keep every monitor near the middle of
// the frame and the spiral heads for a fixed point just past the glass, so
// the true angle from the swimmer to the glass is only a few degrees, and a
// roll about a helix's own axis is only a shift of its spin — so the aim is
// what reads, and it reads with a gain on it. The proof is a diff: ?lead=0&
// aim=0 is the run's own swimmer, and both seam frames match it exactly.
//
// The beats are the run's: the fall at one pace through six rooms, the last
// landing level, the dive off the axis to the last glass, the splosh. Both
// seam frames are untouched: the lead and the aim come in from nil over the
// first `win` of a crossing after ζ = 0 (where the approach hands over a
// swimmer that rides the camera exactly) and go out with the last room's
// settle, before it lands level.
//
// The roll lead is CUMULATIVE — R(ζ) = k·SCREW + rollOf(k, f), the whole
// roll since the seam, which is continuous and comes to rest before the last
// room — so the lead R(ζ + ℓ) − R(ζ) never snaps at a glass, where a lead on
// rollOf alone would (SCREW·(1−f) → 0 → SCREW·ℓ). And the aim's target
// swings from this room's glass to the next room's over the back half of a
// crossing, so it is the same glass on both sides of every ζ = k.
//
//   ?lead=0.25   the roll lead, in crossings (0 for the run's own swimmer)
//   ?aim=14      degrees the nose may turn off the axis (0 for none)
//   ?gain=3      how much further than the true angle the nose turns: the
//                run's rooms keep the glass near the middle, so the true
//                angle to it is a few degrees; the gain makes it a heading
//   ?target=course|glass   what the nose turns toward: where the swimmer
//                itself will be `lead` crossings on (its course — toward the
//                spiral's fixed point, past the glass), or the glass centre
//   ?win=0.5     crossings after the seam over which both come in
//   ?swing=0.5   f at which the nose starts swinging to the next glass
//   ?decades=60s,90s,50s,10s,60s,90s   the rooms, outermost first
//   ?ghost=1     a faint second swimmer in the run's stock pose, to compare
//   ?wobble=0    without the hand on the camera
//   ?sperm=0     without the swimmer (for diffing the seam frames)
//   ?zeta=1.4    pin ζ directly

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const smoothstep = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const LEAD = Number(q.get('lead') ?? 0.25);
	const AIM = rad(Number(q.get('aim') ?? 14));
	const GAIN = Number(q.get('gain') ?? 3);
	const COURSE = (q.get('target') ?? 'course') !== 'glass';
	const WIN = Number(q.get('win') ?? 0.5);
	const SWING = Number(q.get('swing') ?? 0.5);
	const ROOMS = (q.get('decades') ?? '60s,90s,50s,10s,60s,90s').split(',');
	const GHOST = q.get('ghost') === '1';
	const WOBBLE = q.get('wobble') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const zetaHeld = q.get('zeta');
	const T = SCENES.descent;
	const DURATION = T.duration;
	const SCREW = rad(NEST.screw);

	// ── The nest, the run's own ──────────────────────────────────────────
	const scene = new THREE.Scene();
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const nest = await createNest({ THREE, renderer });
	nest.build({ rooms: ROOMS, portrait: false });
	scene.add(nest.root);
	const sw = nest.swimmer;
	scene.add(sw.group);
	scene.updateMatrixWorld(true);
	const levels = nest.levels;
	const n = levels.length;
	const logs = levels.map((lv) => lv.lnN);

	// The stock pose, for comparison: the same body, faint, riding the camera.
	let ghost = null;
	if (GHOST) {
		ghost = await loadSwimmer({ height: 1, gain: 1.15 });
		ghost.material.depthTest = false;
		ghost.material.uniforms.uOpacity.value = 0.3;
		ghost.group.traverse((o) => {
			o.renderOrder = 99999;
			o.frustumCulled = false;
		});
		scene.add(ghost.group);
	}

	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.05, 100);
	let aspect = 1;

	// ── The roll, cumulative ─────────────────────────────────────────────
	// nest.js rollOf(): SCREW by the end of every crossing, from rest at the
	// seam and to rest before the last room. Summed since the seam, so it is
	// one continuous function of ζ for the lead to be taken on.
	function rollOf(k, f) {
		if (n < 3) return SCREW * f * f * (3 - 2 * f);
		if (k === 0) {
			const s = logs[0] / logs[1];
			return SCREW * ((3 - s) * f * f + (s - 2) * f * f * f);
		}
		if (k === n - 2) return SCREW * (f + f * f - f * f * f);
		return SCREW * f;
	}
	function rollSince(zeta) {
		const k = Math.min(Math.floor(zeta), n - 1);
		if (k >= n - 1) return (n - 1) * SCREW;
		return k * SCREW + rollOf(k, zeta - k);
	}
	// Room k's glass centre, in the world: where crossing k is going.
	function glassWorld(k, out) {
		const lv = levels[Math.max(0, Math.min(k, n - 1))];
		return lv.group.localToWorld(out.set(lv.glass.x, lv.glass.y, lv.glass.z));
	}

	const info = {
		rooms: ROOMS,
		lead: LEAD,
		aim: Number(q.get('aim') ?? 14),
		gain: GAIN,
		target: COURSE ? 'course' : 'glass'
	};
	// A probe for the course ahead: pose() re-bases the stencil chain as a
	// side effect, so the probe is posed BEFORE the real camera every frame.
	const probe = new THREE.PerspectiveCamera(LENS, 1, 0.05, 100);
	const ahead = new THREE.Vector3();

	const fwd = new THREE.Vector3();
	const pos = new THREE.Vector3();
	const target = new THREE.Vector3();
	const tg2 = new THREE.Vector3();
	const dir = new THREE.Vector3();
	const nose = new THREE.Vector3(0, 0, -1);
	const axis = new THREE.Vector3();
	const wq = new THREE.Quaternion();
	const inv = new THREE.Quaternion();
	const aimQ = new THREE.Quaternion();
	const rollQ = new THREE.Quaternion();
	const zAxis = new THREE.Vector3(0, 0, 1);
	const euler = new THREE.Euler();

	function set(u) {
		const zeta = zetaHeld !== null ? Number(zetaHeld) : nest.zetaOf(u);
		const k = Math.min(Math.floor(zeta), n - 1);
		const f = zeta - k;
		// Where the swimmer will be, `lead` crossings on: the course.
		const zetaAhead = Math.min(zeta + LEAD, n - 1 + T.land);
		{
			const pa = nest.pose(zetaAhead, probe, aspect);
			fwd.set(0, 0, -1).applyQuaternion(probe.quaternion);
			ahead.copy(probe.position).addScaledVector(fwd, NEST.spermRide * pa.D);
		}
		const { D, fov, settle, base } = nest.pose(zeta, camera, aspect);
		// The run's one hand on the camera, off it over the settle (descent.js).
		if (WOBBLE) {
			camera.quaternion.multiply(
				wq.setFromEuler(wobbleEuler(euler, runSeconds('descent', u), 1 - settle))
			);
		}
		camera.updateMatrixWorld(true);

		// ── The swimmer, placed as the descent places it ─────────────────
		const ride = NEST.spermRide * D;
		const bodyH = NEST.spermSpan * 2 * ride * Math.tan(rad(fov) / 2);
		fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
		pos.copy(camera.position).addScaledVector(fwd, ride);
		const dive = accelerate(span(u, T.dive), 2.4);
		if (dive > 0) pos.lerp(nest.lastGlassWorld().centre, dive);

		// ── The pilot ────────────────────────────────────────────────────
		// Nil at the seam, nil by the landing, and off with the dive.
		const win = smoothstep(0, WIN, zeta) * (1 - settle) * (1 - dive);
		// The roll, a quarter of a crossing ahead of the camera's.
		const lead = rollSince(Math.min(zeta + LEAD * win, n - 1)) - rollSince(zeta);
		// The nose, toward the glass ahead: this room's, swinging to the
		// next room's as this one comes to fill the frame.
		if (COURSE) target.copy(ahead);
		else {
			glassWorld(k, target);
			if (k < n - 1) target.lerp(glassWorld(k + 1, tg2), smoothstep(SWING, 1, f));
		}
		dir.subVectors(target, pos).normalize();
		dir.applyQuaternion(inv.copy(camera.quaternion).invert());
		const raw = Math.acos(Math.max(-1, Math.min(1, dir.dot(nose))));
		// Turned further than the true angle by the gain, onto the clamp by a
		// soft knee rather than a hard one.
		const aim = AIM > 0 ? AIM * (1 - Math.exp((-GAIN * raw) / AIM)) * win : 0;
		axis.crossVectors(nose, dir);
		if (aim > 1e-4 && axis.lengthSq() > 1e-9) aimQ.setFromAxisAngle(axis.normalize(), aim);
		else aimQ.identity();
		rollQ.setFromAxisAngle(zAxis, lead);

		sw.group.position.copy(pos);
		sw.group.quaternion.copy(camera.quaternion).multiply(aimQ).multiply(rollQ);
		sw.group.scale.setScalar(bodyH);
		// The spin on ζ rather than the clock, so a pinned frame is exact.
		sw.spin(-zeta * 1.5);
		sw.material.uniforms.uTime.value = zeta * 3.0;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 - smoothstep(T.gone - 0.006, T.gone, u) : 0;
		if (ghost) {
			ghost.group.position.copy(pos);
			ghost.group.quaternion.copy(camera.quaternion);
			ghost.group.scale.setScalar(bodyH);
			ghost.spin(-zeta * 1.5);
			ghost.material.uniforms.uTime.value = zeta * 3.0;
			ghost.material.uniforms.uOpacity.value = SPERM ? 0.3 * (1 - dive) : 0;
		}

		// ── The splosh ───────────────────────────────────────────────────
		nest.setSplosh(smootherstep(span(u, T.splosh)), 1);

		info.zeta = Number(zeta.toFixed(3));
		info.k = k;
		info.f = Number(f.toFixed(3));
		info.base = base;
		info.leadDeg = Number(deg(lead).toFixed(2));
		info.aimDeg = Number(deg(aim).toFixed(2));
		info.aimRawDeg = Number(deg(raw).toFixed(1));
		info.win = Number(win.toFixed(3));
		info.settle = Number(settle.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;
	bu.aspectRatio.value = aspect;
	bu.uPx.value = 1 / size.y;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspect = w / h;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = aspect;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
