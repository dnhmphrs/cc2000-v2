import { SCENES, APPROACH, KALEIDO, TUNNEL, span, smootherstep } from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { createNest } from '$lib/three/world/nest';
import { createKaleidoscope } from '$lib/three/world/kaleidoscope';

// ── Sketch: the many — the swimmer joins the kaleidoscope ────────────────────
// The kaleido, as the run has it: through the set's glass and down the tunnel,
// the archive looped in rings of eight, every other one mirrored, turning and
// cycling in colour, to the first room at the far end. One change: the
// swimmer joins the pattern. Just inside the glass it DIVIDES — eight more of
// it, one at each place round the axis, alternately mirrored, all rolling,
// spread out to a ring ahead of the lens and turn with the rings while the
// hue cycles behind them. A kaleidoscope of the one thing that has been
// constant — and the truth of the story: many set out. Over the lock, as the
// turn and the hue slow to rest and the room comes up at the far end, the
// ring closes and the eight dwindle on down the tunnel into the dark, and
// one, the same one, dead centre, the one followed since the start, goes on
// to the room. The camera does nothing: the ring is a child of it, like the
// swimmer, so the hand on the camera leans the tunnel round them and not
// them. At 1 the eight are gone and the frame is nest.pose(0), unchanged.
//
// The beats, in scene progress (SCENES.kaleido, 7 s):
//   0 .04      one swimmer, the glass going past
//   .04 .30    the divide: eight come out of the one and spread to the ring
//   .30 .68    the ring, turning with the rings, mid-hue
//   .64 .92    the lock: the ring closes and recedes into the dark, and is
//              gone by .8, before the room has the frame
//   .92 1      one swimmer, the room out of the dark — the seam
//
// The eight are their own loadSwimmer() each (their own holoMaterial, so
// their own uOpacity and a lower uGain than the lead's — eight additive
// holograms over a bright hue would blow out otherwise) and their own
// spinner, phased round the ring; the mirrored ones are mirrored in x, which
// is the kaleidoscope's own mirror and also turns their roll the other way.
//
//   ?ring=8      how many join (even keeps the mirror pairs)
//   ?R=0.4       the ring's radius, of the frame's half-height at the ring:
//                INSIDE the dark eye of the tunnel, where the lead is — over
//                the drawings a hologram is lost, in the eye it reads
//   ?far=1.3     how far ahead the ring rides, in leads (the tails trail
//                toward the lens: off the axis they loop right across the
//                frame unless the bodies are further off and smaller)
//   ?size=0.9    the clones' body, of the lead's
//   ?tilt=15     degrees each leans outward, head out and tail in toward the
//                axis: dead-behind each is the lead's own swirl, leaning
//                further their tails are a vortex round the one
//   ?lean=15     degrees each leans along the ring, which the mirror flips:
//                four pairs, head to head
//   ?gain=1.15   the clones' hologram gain (the lead's is 1.15; the judges'
//                blow-out is over the drawings, and the eye is dark)
//   ?spin=0.5    extra turns of the swimmers' ring, on top of the rings' own
//   ?back=28     how far down the tunnel the eight fall back, world units
//   ?many=0      without them — the kaleido as it is
//   ?sperm=0     without the lead

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const RING = Number(q.get('ring') ?? 8);
	const R = Number(q.get('R') ?? 0.4);
	const FAR = Number(q.get('far') ?? 1.3);
	const SIZE = Number(q.get('size') ?? 0.9);
	const TILT = rad(Number(q.get('tilt') ?? 15));
	const LEAN = rad(Number(q.get('lean') ?? 15));
	const GAIN = Number(q.get('gain') ?? 1.15);
	const SPIN_TURNS = Number(q.get('spin') ?? 0.5);
	const BACK = Number(q.get('back') ?? 28);
	const MANY = q.get('many') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const T = SCENES.kaleido;
	const DURATION = T.duration;
	const DIVIDE = [0.04, 0.3];
	const LOCK = T.lock;

	// ── The run's own tunnel, as world/kaleido.js has it ─────────────────
	const scene = new THREE.Scene();
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
	scene.add(camera);

	const nest = await createNest({ THREE, renderer });
	const kal = createKaleidoscope({ THREE, nest });
	kal.freshRun({ answer: '90s', portrait: false });
	scene.add(kal.root);
	scene.add(nest.root);
	kal.setDim(1);
	kal.setOpen(1, 0);
	nest.setDim(1);
	nest.setDark(1);
	const rings = kal.root.getObjectByName('rings');

	// The lead: the run's swimmer, a child of the camera at its ride.
	const lead = APPROACH.lead;
	const sw = nest.swimmer;
	camera.add(sw.group);
	sw.group.quaternion.identity();
	const SPIN = -TUNNEL.spermSpin;

	// ── The many ─────────────────────────────────────────────────────────
	// Each its own swimmer, on a ring group that rides the camera at the lead
	// like the one they came out of. The ring is an ellipse in the frame's
	// proportion, as the archive's rings are (KALEIDO.radius).
	const ring = new THREE.Group();
	ring.name = 'the-many';
	ring.position.z = -lead;
	camera.add(ring);
	const many = [];
	if (MANY) {
		const loaded = await Promise.all(
			Array.from({ length: RING }, () =>
				loadSwimmer({ height: 1, gain: GAIN, fog: 0x090b14, fogDensity: 0.05 })
			)
		);
		loaded.forEach((s, j) => {
			s.material.depthTest = false;
			s.group.traverse((o) => {
				o.renderOrder = 99999;
				o.frustumCulled = false;
			});
			s.mirror = j % 2 ? -1 : 1;
			s.theta0 = (Math.PI * 2 * j) / RING;
			ring.add(s.group);
			many.push(s);
		});
	}
	const ellipse = KALEIDO.radius[0] / KALEIDO.radius[1];

	// The rings' own deceleration to rest over the lock (kaleidoscope.js).
	function eased(x, [a, b]) {
		if (x <= a) return x;
		const s = Math.min(1, (x - a) / (b - a));
		return a + (b - a) * (s - (s * s) / 2);
	}

	let aspectR = 1;
	const info = { ring: RING, R, far: FAR, size: SIZE, gain: GAIN, radius: 0, back: 0, alpha: 0 };
	if (many.length) {
		const box = new THREE.Box3().setFromObject(many[0].group);
		info.body = box
			.getSize(new THREE.Vector3())
			.toArray()
			.map((v) => Number(v.toFixed(2)));
	}

	function set(u) {
		const { fov } = kal.pose(u, camera, aspectR);
		kal.set(u, false);
		const clock = u * DURATION;

		// The lead, exactly as in the run.
		const bodyH = APPROACH.span * 2 * lead * Math.tan(rad(fov) / 2);
		sw.group.position.set(0, 0, -lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = clock * SPIN;
		sw.material.uniforms.uTime.value = clock;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 : 0;

		// The divide, the ring, the falling back.
		const out = smootherstep(span(u, DIVIDE));
		const back = smootherstep(span(u, LOCK));
		// The ring rides a shade further ahead than the lead, and its bodies
		// are smaller: they come out from behind its head, on the axis, and
		// spread — the tails trail toward the lens, and at the lead's own
		// distance they looped right across the frame.
		const ride = lead * FAR;
		const half = ride * Math.tan(rad(fov) / 2);
		const radius = R * half * out * (1 - 0.65 * back);
		const body = bodyH * (1 - (1 - SIZE) * out);
		// Out of the one: they come up as they leave it, so eight never sit
		// on top of it at once; and go as they dwindle — gone by 0.8, before
		// the room has the frame, so nothing but the one is over the room.
		const alpha =
			smootherstep(span(u, [DIVIDE[0], DIVIDE[0] + 0.12])) *
			(1 - smootherstep(span(u, [LOCK[0] - 0.04, LOCK[0] + 0.12])));
		const turn = rings.rotation.z + eased(u, LOCK) * SPIN_TURNS * Math.PI * 2;
		ring.rotation.z = turn;
		ring.position.z = -ride - BACK * back * back;
		for (const s of many) {
			const th = s.theta0;
			s.group.position.set(Math.cos(th) * radius * ellipse, Math.sin(th) * radius, 0);
			// Placed round the ring (z), leaning out (x, about the tangent) and
			// along it (y, about the radial), the mirror flipping the lean.
			s.group.rotation.set(-TILT, LEAN * s.mirror, th + Math.PI / 2, 'ZXY');
			s.group.scale.set(body * s.mirror, body, body);
			s.spinner.rotation.z = clock * SPIN * s.mirror + th;
			s.material.uniforms.uTime.value = clock + th;
			s.material.uniforms.uOpacity.value = alpha;
			s.group.visible = alpha > 0.001;
		}
		kal.rebase(camera.position.z, camera.near);
		info.radius = Number(radius.toFixed(3));
		info.back = Number((BACK * back * back).toFixed(2));
		info.alpha = Number(alpha.toFixed(3));
		info.z = Number(camera.position.z.toFixed(2));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspectR = size.x / size.y;
	bu.aspectRatio.value = aspectR;
	bu.uPx.value = 1 / renderer.domElement.height;

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
			aspectR = w / h;
			camera.aspect = aspectR;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = aspectR;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
