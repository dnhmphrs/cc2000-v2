import {
	SCENES,
	APPROACH,
	KALEIDO,
	LENS,
	TUNNEL,
	runSeconds,
	span,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	lerp
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { wobbleEuler } from '$lib/three/world/wobble';

// ── Sketch: about-face — the swimmer turns to take the questions ─────────────
// The approach as it is (world/approach.js: space, the sky, the debris, the
// swimmer riding ahead of the lens as a child of the camera, the signal ahead
// after the answers) with ONE thing added: the swimmer has only ever been seen
// from behind, and just before the first question it pulls ahead, comes about
// and turns to FACE the lens — the head end-on, the holo contour rings now a
// bullseye, the tail's curl whipping behind it. It holds there, rolling on its
// own clock, while both questions are typed over it: the birthday and the
// spice are given to IT. When the second closes it turns back toward the
// signal that has just appeared, and rides on. The camera never moves; the
// facing is a pure function of p, so a seek to the ask shows a swimmer
// waiting face to face, and a real run shows the same swimmer treading water
// for as long as you take.
//
// The beats, in the approach's own progress p (SCENES.approach):
//   swimmerIn [0.03,0.16]  fades in at its ride, from behind, as today
//   [0.14,0.20]            pulls ahead: lead 5.5 → 10, so the turn has room
//   [0.17,0.25]            comes about: yaw 0 → π about the HEAD, with a bank
//   [0.20,0.25]            and comes AT you: the head to 5 units, the body
//                          grown to a face-on span (a third of the frame high)
//   ask 0.25               HOLD — the two questions over it; it treads water
//   [0.25,0.33]            turns back, blending to a look at the signal, and
//                          drops back to the far ride as it goes
//   [0.33,0.42]            lead 10 → 5.5: the ride it had, as today
//
// Riding, the body is exactly where the run has it: its centre at −lead, sized
// off the lens (APPROACH.span). The pivot sits at the HEAD, PIVOT cross-
// sections back from the nose, so the turn swings the tail round the head and
// the tail only ever comes as near the lens as it does today (at yaw 0).
//
// The lab has no gate, so this sketch's clock u has a PLATEAU in it: p climbs
// 0 → 0.25 over the first third, holds at 0.25 for the middle third (the two
// questions typed over it, the roll going on), and climbs 0.25 → 0.5 over the
// last. ?at=0.4 and ?at=0.6 are therefore the two pinned faces of the hold.
//
//   ?hold=0      no plateau: p = u/2, straight through
//   ?far=10      the lead pulled out to for the turn
//   ?face=5      the HEAD's distance face-on   ?fspan=1.1  the body's span face-on
//   ?gain=1.3    holo gain face-on (from 1.15 behind)  ?bank=0.4  radians of lean mid-turn
//   ?boxy=-0.5   the question box, in half-heights of the frame off centre (the
//                run's popup is dead centre, over the face; under the chin here)
//   ?pivot=0.45  where the head's pivot sits, in cross-section heights back from the nose
//   ?text=0      without the questions   ?sperm=0   without the swimmer   ?wobble=0

export const options = {};

const rad = (d) => (d * Math.PI) / 180;
const num = (q, k, d) => (q.get(k) === null ? d : Number(q.get(k)));

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const HOLD = q.get('hold') !== '0';
	const LEAD_FAR = num(q, 'far', 10);
	const FACE_D = num(q, 'face', 5);
	const FSPAN = num(q, 'fspan', 1.1);
	const BOXY = num(q, 'boxy', -0.5);
	const GAIN0 = num(q, 'gain0', 1.15);
	const GAIN1 = num(q, 'gain', 1.3);
	const BANK = num(q, 'bank', 0.4);
	const PIVOT = num(q, 'pivot', 0.45);
	const TEXT = q.get('text') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const WOBBLE_ON = q.get('wobble') !== '0';
	const DURATION = 10;
	const T = SCENES.approach;
	const A = APPROACH;
	const P_END = 0.5; // how far into the approach the sketch goes

	// The windows of the beat, in p.
	const PULL = [0.14, 0.2];
	const TURN = [0.17, 0.25];
	const SETTLE = [0.2, 0.25];
	const BACK = [0.25, 0.33];
	const UNSETTLE = [0.25, 0.31];
	const RIDE = [0.33, 0.42];

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group();
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── The sky, the debris, the signal — approach.js, as it is ──────────
	let seed = 7;
	const rnd = () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const starMats = [];
	const starField = (n, dist, size, hex, opacity) => {
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rnd() * 2 - 1;
			const a = rnd() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = dist * (0.8 + rnd() * 0.4);
			pos.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	rig.add(starField(A.stars, A.starDist, 3.0, 0xb8c8ff, 0.7));
	rig.add(starField(A.brightStars, A.starDist, 5.5, 0xdde6ff, 0.9));

	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	scene.add(motes.lines);

	const sigGeo = new THREE.BufferGeometry();
	sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
	const sigMat = dotMaterial(KALEIDO.signalColor, KALEIDO.signalSize);
	const signal = dots(sigGeo, sigMat);
	signal.frustumCulled = false;
	signal.position.set(0, 0, -A.travel);
	scene.add(signal);

	// ── The swimmer, on a pivot at its head ──────────────────────────────
	// loadSwimmer centres the body on its bounding box, cross-section height
	// 1, pointing down −z. The pivot group holds the body so that its HEAD —
	// PIVOT cross-sections back from the nose — sits at the pivot's origin,
	// and the pivot rides at −lead as a child of the camera, exactly where the
	// group did. Turning the pivot about y swings the tail round the head:
	// at yaw π the head is end-on to the lens and the tail is BEHIND it.
	const sw = await loadSwimmer({ height: 1, fog: 0x090b14, fogDensity: 0.012, gain: GAIN0 });
	sw.group.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(sw.group);
	const size = box.getSize(new THREE.Vector3());
	const HALF = size.z / 2; // half the body's length, in cross-section heights
	const NOSE = HALF - PIVOT; // the pivot, back from the centre toward the nose
	sw.material.depthTest = false;
	sw.group.traverse((o) => {
		if (o.isMesh) o.renderOrder = 10;
	});
	const pivot = new THREE.Group();
	pivot.add(sw.group);
	camera.add(pivot);
	const SPIN = -TUNNEL.spermSpin;

	// ── The questions, typed over it ─────────────────────────────────────
	// Prompt.svelte's box, as a picture: glass on the void, one yellow
	// hairline, the question in the site's tech face. A child of the camera,
	// dead centre, drawn only on the hold.
	const QUESTIONS = ['when were you born?', 'how spicy are your parents?'];
	let ask = null;
	if (TEXT) {
		try {
			const ff = new FontFace('nb-architekt', 'url(/fonts/NB-Architekt-Pro-Regular.woff)');
			await ff.load();
			document.fonts.add(ff);
		} catch {
			/* the fallback face is fine */
		}
		const cv = document.createElement('canvas');
		cv.width = 1024;
		cv.height = 256;
		const cx = cv.getContext('2d');
		const tex = new THREE.CanvasTexture(cv);
		tex.colorSpace = THREE.SRGBColorSpace;
		const mat = new THREE.MeshBasicNodeMaterial({ map: tex, transparent: true, depthTest: false });
		const W = 1.6;
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, W / 4), mat);
		mesh.position.set(0, BOXY * 3 * Math.tan(rad(LENS) / 2), -3);
		mesh.renderOrder = 20;
		camera.add(mesh);
		let drawn = '';
		ask = {
			mesh,
			draw(str, alpha) {
				const key = `${str}|${alpha.toFixed(2)}`;
				if (key === drawn) return;
				drawn = key;
				cx.clearRect(0, 0, cv.width, cv.height);
				cx.globalAlpha = alpha;
				cx.fillStyle = 'rgba(10,10,12,0.82)';
				cx.fillRect(160, 40, 704, 176);
				cx.strokeStyle = 'rgba(255,212,38,0.45)';
				cx.lineWidth = 2;
				cx.strokeRect(160, 40, 704, 176);
				cx.fillStyle = '#f0f2f8';
				cx.font = '40px nb-architekt, ui-monospace, monospace';
				cx.textAlign = 'center';
				cx.textBaseline = 'middle';
				cx.fillText(str, 512, 128);
				tex.needsUpdate = true;
			}
		};
	}

	const info = { half: Number(HALF.toFixed(3)), far: LEAD_FAR, face: FACE_D, fspan: FSPAN };

	// ── The sketch's clock → the approach's progress ─────────────────────
	// A plateau at the ask, standing in for the gate.
	const H0 = 0.32;
	const H1 = 0.62;
	function progress(u) {
		if (!HOLD) return u * P_END;
		if (u < H0) return (u / H0) * T.ask;
		if (u < H1) return T.ask;
		return T.ask + ((u - H1) / (1 - H1)) * (P_END - T.ask);
	}
	// How far through the hold: the first question, then the second.
	function holdK(u) {
		if (!HOLD) return -1;
		return u < H0 || u >= H1 ? -1 : (u - H0) / (H1 - H0);
	}

	const euler = new THREE.Euler();
	const sigLocal = new THREE.Vector3();
	const dir = new THREE.Vector3();
	const FWD = new THREE.Vector3(0, 0, -1);
	const qYaw = new THREE.Quaternion();
	const qBank = new THREE.Quaternion();
	const qLook = new THREE.Quaternion();
	const qId = new THREE.Quaternion();
	const Y = new THREE.Vector3(0, 1, 0);
	const Z = new THREE.Vector3(0, 0, 1);

	function set(u) {
		const p = progress(u);
		const clock = u * DURATION; // the swimmer's own clock — pure here

		// ── The camera: one speed, one lens, one hand ────────────────────
		const z = -(A.travel - 6) * p;
		rig.position.set(0, 0, z);
		if (WOBBLE_ON) camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		else camera.quaternion.identity();
		camera.updateMatrixWorld(true);

		// ── The sky, the debris, the signal ──────────────────────────────
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));

		// ── The swimmer: the lead, the yaw, the look ─────────────────────
		const inK = smootherstep(span(p, T.swimmerIn));
		const tanH = Math.tan(rad(LENS) / 2);
		// Riding: the body's centre at −lead, sized off the lens, as the run has
		// it; the pivot (the head) is NOSE cross-sections further on.
		let lead = lerp(A.lead, LEAD_FAR, smootherstep(span(p, PULL)));
		lead = lerp(lead, A.lead, smootherstep(span(p, RIDE)));
		const bodyR = A.span * 2 * lead * tanH;
		const distR = lead + NOSE * bodyR;
		// Face-on: the head at FACE_D, the body on the face-on span.
		const bodyF = FSPAN * 2 * FACE_D * tanH;
		const w = smootherstep(span(p, SETTLE)) * (1 - smootherstep(span(p, UNSETTLE)));
		const dist = lerp(distR, FACE_D, w);
		const bodyH = lerp(bodyR, bodyF, w);

		const turn = smootherstep(span(p, TURN)) * (1 - smootherstep(span(p, BACK)));
		const yaw = turn * Math.PI;
		// The bank: a lean into the turn in the FRAME (about the view axis, so
		// the body tilts as it comes round), most mid-way, none at either end.
		const bank = Math.sin(yaw) * BANK;
		qYaw.setFromAxisAngle(Y, yaw);
		qBank.setFromAxisAngle(Z, bank);
		// On the way back: a look toward the signal, blended in as it comes
		// round — the signal is where the flight is going.
		sigLocal.copy(signal.position);
		camera.worldToLocal(sigLocal);
		dir.copy(sigLocal).sub(pivot.position).normalize();
		qLook.setFromUnitVectors(FWD, dir);
		const lookK = smootherstep(span(p, BACK));
		qId.identity().slerp(qLook, lookK);
		pivot.quaternion.copy(qId).multiply(qBank).multiply(qYaw);
		pivot.position.set(0, 0, -dist);

		sw.group.scale.setScalar(bodyH);
		sw.group.position.set(0, 0, NOSE * bodyH); // the head on the pivot
		sw.spinner.rotation.z = clock * SPIN;
		sw.material.uniforms.uTime.value = clock;
		sw.material.uniforms.uOpacity.value = SPERM ? inK : 0;
		const facing = (1 - Math.cos(yaw)) / 2;
		sw.material.uniforms.uGain.value = lerp(GAIN0, GAIN1, facing);

		// ── The questions ────────────────────────────────────────────────
		if (ask) {
			const k = holdK(u);
			if (k < 0) ask.mesh.visible = false;
			else {
				ask.mesh.visible = true;
				const which = k < 0.5 ? 0 : 1;
				const local = (k - which * 0.5) * 2; // 0..1 through this question
				const str = QUESTIONS[which];
				const typed = str.slice(0, Math.floor(smoothstep(0.05, 0.4, local) * str.length + 0.999));
				const alpha = smoothstep(0, 0.05, local) * (1 - smoothstep(0.95, 1, local));
				ask.draw(typed, alpha);
			}
		}

		info.p = Number(p.toFixed(3));
		info.lead = Number(lead.toFixed(2));
		info.dist = Number(dist.toFixed(2));
		info.yawDeg = Math.round((yaw * 180) / Math.PI);
		info.bodyLen = Number((2 * HALF * bodyH).toFixed(2));
	}

	const sz = renderer.getSize(new THREE.Vector2());
	camera.aspect = sz.x / sz.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
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
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
