import {
	Fn,
	vec2,
	vec3,
	vec4,
	uniform,
	uv,
	float,
	length,
	dot,
	sin,
	fract,
	floor,
	max,
	mix,
	fwidth,
	screenCoordinate,
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
	smoothstep,
	smootherstep,
	easeInOutCubic
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { glassCut } from '$lib/three/tsl/glass';
import { createNest } from '$lib/three/world/nest';
import { createKaleidoscope } from '$lib/three/world/kaleidoscope';
import { wobbleEuler } from '$lib/three/world/wobble';
import { rand } from '$lib/random';

// ── Sketch: the red sun — the egg behind the set ─────────────────────────────
// The approach, the whole flight, with the egg back in it. The run is a
// sperm flying at an egg and today has no egg: the flight is toward a
// television. Here the ovum is a SUN — huge, flat, faded, red, low in an
// off-black sky, the first-episode frame with a silhouette on its limb — and
// the 60s set, the archive, sits ON it, between the swimmer and the thing it
// is really flying at. The blue swimmer on the red is the run's colour walk
// (blue the one cold thing) made into a composition rather than a rule.
//
// The sun is one quad, a child of the rig like the stars, so it never
// parallaxes and only leans with the hand on the camera: a flat disc, no
// rim, no glow, a shade darker toward its limb and toward its top, a static
// per-pixel grain on it and a grainy limb, drawn OPAQUE over the stars (so
// the stars are only in the black above it) and before the set (so the set
// is on it). Dead ahead and LOW: its centre 0.55 frame heights below the
// axis and 1.5 frame heights across, so its upper limb cuts the frame a
// fifth above centre, the set dead ahead sits on the red, and the swimmer
// rides on the red with the limb just over its helix.
//
// The set is a SILHOUETTE. Against a red field a coloured 60s television is
// a cartoon on a sun, and a black notch on the limb is the signal the
// answers used to get as a yellow point (lost on red): the set comes out of
// the dark black, grows black, and its drawing's colours ease in over
// [0.6, 0.85] as it comes out of the backlight. The black is a second quad
// on the bezel's plane — the drawing's own alpha painted black, OVER, where
// the stencil is 0 — because kaleidoscope.js is not touched here; in the run
// it would be one uniform on bezelMat.
//
// The FLASH is the lead's note ("sperm flash towards it"), and a cut. At
// `flashAt` the swimmer DASHES toward the sun: it pulls ahead off its ride,
// accelerating, its body drawn out along the axis into a streak and its
// hologram blown to white — and then ONE FRAME OF WHITE, the strobe, and it
// is back at its ride as if nothing happened. The white covers the return,
// which is what a cut is for. Without the strobe (?strobe=0) it drops back
// over the rest of the window instead, and is seen to.
//
// Everything else is the run's own: createNest and createKaleidoscope (the
// set, the stencil chain, the tunnel and room 0 inside its glass, the
// switch-on as the nose reaches the glass — dot, line, covers — off the
// run's own windows), the run's sky, debris and swimmer, LENS, the hand on
// the camera and the flight's one speed, z0 · p. The sun goes out with the
// stars over skyOut, and the silhouette is gone by 0.85, so the frame at 1 —
// kaleidoscope.pose(0) — is untouched by construction, and measured.
//
// The beats, in the approach's progress (SCENES.approach, 7 s):
//   0 .1        off-black; the sky comes up, and the SUN with it — red
//               developing out of the black low in the frame, a screen
//               warming rather than a sunrise
//   .03 .16     the swimmer fades in at its ride, rolling: the one cold
//               thing on the one warm thing
//   .25         THE HOLD: red sun low, black above, the blue swimmer dead
//               centre on the red. A real run holds this frame for as long
//               as the birthday takes; the sketch's clock holds `hold` s
//   .25 .35     the set comes out of the dark as a black notch on the sun
//   .4 .46      the flash: the dash, the streak, the white frame, the cut
//   .6 .85      the set grows; its colours ease in out of the backlight
//   .91         the nose lights the glass — the run's own switch-on
//   .9 .985     the sun goes out with the stars; 1 is the seam frame
//
//   ?sunD=1.5           the disc's diameter, in frame heights
//   ?sunX=0 ?sunY=-.55  its centre, in frame heights off the axis (the
//                       scout's low-left sun is ?sunX=-0.3&sunY=-0.35&sunD=1.1)
//   ?red=8a1f16         the red, at the centre
//   ?level=0.65         how far the disc is lifted out of the ground toward
//                       that red (faded: it is not lit)
//   ?limbDark=0.15      darker toward the limb    ?topDark=0.12  and the top
//   ?grain=4            the static grain, in /255
//   ?limb=0.015         the limb's width, of the radius, eaten by the grain
//   ?sunIn=0,0.1        when it comes up (0.25,0.38: with the answer instead)
//   ?sunOut=0.9,0.985   when it goes (skyOut, with the stars, is the seam)
//   ?sil=1              the set as a silhouette (0: the run's coloured set)
//   ?silOut=0.6,0.85    when the colours ease in
//   ?flash=1            the dash toward the sun (0: none)
//   ?flashAt=0.4 ?flashLen=0.06   the window, in progress
//   ?dash=9             how far it pulls ahead, world units
//   ?streak=6           how far the body is drawn out along the axis, times
//   ?flare=4            the hologram's gain at the peak (1.15 riding)
//   ?strobe=0.006       the white frame's length in progress (0: no cut —
//                       it drops back instead)
//   ?signal=0           the run's yellow signal point (1 to keep it)
//   ?edge=past|future   a birthday the archive cannot answer for: the sun
//                       comes up small and white, a moon — no warmth for you
//   ?hold=1.5           seconds the clock holds at the ask, standing in for
//                       the popup
//   ?from=0&to=1        the window of the approach's progress
//   ?sperm=0            without the swimmer, for the seam diff
//   ?sun=0              without the sun, for the same

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
const pair = (s, d) => {
	const v = (s ?? '').split(',').map(Number);
	return v.length === 2 && v.every((x) => !Number.isNaN(x)) ? v : d;
};

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const FROM = Number(q.get('from') ?? 0);
	const TO = Number(q.get('to') ?? 1);
	const HOLD = Number(q.get('hold') ?? 1.5);
	const SPERM = q.get('sperm') !== '0';
	const SUN = q.get('sun') !== '0';
	const SUN_D = Number(q.get('sunD') ?? 1.5);
	const SUN_X = Number(q.get('sunX') ?? 0);
	const SUN_Y = Number(q.get('sunY') ?? -0.55);
	const RED = parseInt(q.get('red') ?? '8a1f16', 16);
	const LEVEL = Number(q.get('level') ?? 0.65);
	const LIMB_DARK = Number(q.get('limbDark') ?? 0.15);
	const TOP_DARK = Number(q.get('topDark') ?? 0.12);
	const GRAIN = Number(q.get('grain') ?? 4);
	const LIMB = Number(q.get('limb') ?? 0.015);
	const SUN_IN = pair(q.get('sunIn'), SCENES.approach.fadeIn);
	const SUN_OUT = pair(q.get('sunOut'), SCENES.approach.skyOut);
	const SIL = q.get('sil') !== '0';
	const SIL_OUT = pair(q.get('silOut'), [0.6, 0.85]);
	const FLASH = q.get('flash') !== '0';
	const FLASH_AT = Number(q.get('flashAt') ?? 0.4);
	const FLASH_LEN = Number(q.get('flashLen') ?? 0.06);
	const DASH = Number(q.get('dash') ?? 9);
	const STREAK = Number(q.get('streak') ?? 6);
	const FLARE = Number(q.get('flare') ?? 4);
	const STROBE = Number(q.get('strobe') ?? 0.006);
	const SIGNAL = q.get('signal') === '1';
	const EDGE = q.get('edge');

	const T = SCENES.approach;
	const A = APPROACH;
	const K = KALEIDO;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group();
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const GROUND = new THREE.Color(0x090b14);

	// ── The sky and the debris, the run's own ────────────────────────────
	// The stars are drawn FIRST of everything (renderOrder), so the sun can
	// go over them and the set over the sun.
	const STAR_ORDER = -20;
	const SUN_ORDER = -10;
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
		const s = dots(geo, mat);
		s.renderOrder = STAR_ORDER;
		return s;
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

	// ── The sun ──────────────────────────────────────────────────────────
	// One quad at 0.9 of the stars' distance, a child of the rig, scaled to
	// the disc's diameter in frame heights AT THAT DISTANCE on the lens, so
	// its size in the frame is what the switches say whatever the aspect.
	// Flat: the colour is the red faded toward the ground by `level`,
	// darker toward the limb and the top, plus a static hash grain on the
	// pixel grid (no time term: a pin draws the same grain). Opaque inside
	// the limb, the limb's width eaten by the same hash. Normal blending,
	// straight alpha — it COVERS the stars, it does not add to them.
	const sunDist = 0.9 * A.starDist;
	const frameH = 2 * sunDist * Math.tan(rad(LENS) / 2);
	const su = {
		uOn: uniform(0),
		uRed: uniform(new THREE.Color(RED)),
		uGround: uniform(GROUND.clone()),
		uLevel: uniform(LEVEL),
		uLimbDark: uniform(LIMB_DARK),
		uTopDark: uniform(TOP_DARK),
		uGrain: uniform(GRAIN / 255),
		uLimb: uniform(LIMB)
	};
	if (EDGE === 'past' || EDGE === 'future') {
		// The moon: cold, small, and no lower in the sky.
		su.uRed.value.set(0x9aa0b0);
		su.uLevel.value = LEVEL * 0.5;
		su.uLimbDark.value = 0.15;
		su.uTopDark.value = 0;
	}
	const sunMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false
	});
	sunMat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(2.0);
		const r = length(p);
		// A hash on the pixel grid: the grain, and the limb's raggedness.
		const px = floor(screenCoordinate.xy);
		const h = fract(sin(dot(px, vec2(12.9898, 78.233))).mul(43758.5453));
		const w = max(su.uLimb.mul(h.mul(0.5).add(1.0)), fwidth(r).mul(1.5));
		const disc = tslSmoothstep(float(1.0).sub(w), 1.0, r).oneMinus();
		const shade = float(1.0)
			.sub(su.uLimbDark.mul(r.mul(r)))
			.sub(su.uTopDark.mul(uv().y));
		const col = mix(su.uGround, su.uRed.mul(shade), su.uLevel).add(
			vec3(h.sub(0.5).mul(2.0).mul(su.uGrain))
		);
		return vec4(col, disc.mul(su.uOn));
	})();
	const sun = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sunMat);
	sun.renderOrder = SUN_ORDER;
	sun.frustumCulled = false;
	const sunD = (EDGE ? 0.5 : 1) * SUN_D;
	sun.scale.set(sunD * frameH, sunD * frameH, 1);
	sun.position.set(SUN_X * frameH, SUN_Y * frameH, -sunDist);
	sun.visible = SUN;
	rig.add(sun);

	// ── The set, the tunnel and the rooms: the run's own ─────────────────
	const nest = await createNest({ THREE, renderer });
	const kal = createKaleidoscope({ THREE, renderer, nest });
	kal.freshRun({ answer: '90s', portrait: false });
	scene.add(kal.root);
	scene.add(nest.root);
	kal.set(0, false);
	nest.setDark(1);
	const zGlass = kal.zGlass;
	const z0 = kal.z0;
	const glass = kal.screen.glass;

	// The signal point, as the run has it — off by default: it is lost on
	// the red, and the notch is the signal here.
	const sigGeo = new THREE.BufferGeometry();
	sigGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
	const sigMat = dotMaterial(K.signalColor, K.signalSize);
	const signal = dots(sigGeo, sigMat);
	signal.frustumCulled = false;
	signal.position.set(0, 0, -A.travel);
	signal.visible = SIGNAL;
	scene.add(signal);

	// ── The silhouette ───────────────────────────────────────────────────
	// The drawing's own alpha, black, OVER the bezel where the stencil is 0
	// (the hole has already taken the glass to 1, and the covers black it),
	// gated by the set's dimmer as the bezel is — but NOT by the bezel's
	// distance fade: a silhouette on a backlight is there the moment the
	// set is, long before the drawing could be read.
	const uDim = uniform(0);
	const uSil = uniform(0);
	const decade = K.screenDecade;
	const pw = K.screenWidth;
	const ph =
		pw / (nest.textures[decade].screen.image.width / nest.textures[decade].screen.image.height);
	const silMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false
	});
	{
		const c = glassCut(decade, nest.textures[decade].screen)();
		silMat.colorNode = vec4(0, 0, 0, c.a.mul(uDim).mul(uSil));
		silMat.stencilWrite = true;
		silMat.stencilRef = 0;
		silMat.stencilFunc = THREE.EqualStencilFunc;
		silMat.stencilFail = THREE.KeepStencilOp;
		silMat.stencilZFail = THREE.KeepStencilOp;
		silMat.stencilZPass = THREE.KeepStencilOp;
	}
	const sil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), silMat);
	sil.scale.set(pw, ph, 1);
	sil.renderOrder = -2; // after the bezel (−3), before everything else
	sil.frustumCulled = false;
	sil.position.set(-glass.x, -glass.y, zGlass + 0.001);
	sil.visible = SIL;
	scene.add(sil);

	// ── The strobe ───────────────────────────────────────────────────────
	// One frame of white: a quad on the lens, over everything.
	const uStrobe = uniform(0);
	const strobeMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false
	});
	strobeMat.colorNode = vec4(1, 1, 1, uStrobe);
	const strobe = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), strobeMat);
	strobe.renderOrder = 300000;
	strobe.frustumCulled = false;
	strobe.position.z = -1;
	strobe.visible = false;
	camera.add(strobe);
	const strobeH = 2 * Math.tan(rad(LENS) / 2);

	// ── The swimmer ──────────────────────────────────────────────────────
	// The run's, a child of the camera at its ride, sized off the lens. Its
	// nose, for the contact: the vertex furthest down its own axis.
	const sw = nest.swimmer;
	camera.add(sw.group);
	sw.group.quaternion.identity();
	const SPIN = -TUNNEL.spermSpin;
	const GAIN = sw.material.uniforms.uGain.value;
	let halfLenUnit;
	{
		sw.group.updateMatrixWorld(true);
		const v = new THREE.Vector3();
		let tip = Infinity;
		sw.group.traverse((o) => {
			if (!o.isMesh) return;
			const pos = o.geometry.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
				if (v.z < tip) tip = v.z;
			}
		});
		halfLenUnit = -tip;
	}
	const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
	const pStar = (zGlass + A.lead + halfLenUnit * bodyH) / z0;

	// ── The flash, as a function of p ────────────────────────────────────
	// k runs 0..1 over the window. The dash takes the first 0.62 of it:
	// extra lead ∝ e², the body drawn out with the speed, the gain up to
	// `flare` — then the strobe, and the ride; or, without one, the drop
	// back over what is left.
	const DASH_END = 0.62;
	function flashAt(p) {
		const out = { extra: 0, stretch: 1, gain: GAIN, white: 0 };
		if (!FLASH || FLASH_LEN <= 0) return out;
		const k = (p - FLASH_AT) / FLASH_LEN;
		if (k <= 0 || k >= 1) return out;
		if (k < DASH_END) {
			const e = k / DASH_END;
			out.extra = DASH * e * e;
			out.stretch = 1 + (STREAK - 1) * e;
			out.gain = GAIN + (FLARE - GAIN) * smoothstep(0.3, 1, e);
		} else if (STROBE > 0) {
			out.white = k < DASH_END + STROBE / FLASH_LEN ? 1 : 0;
		} else {
			const b = 1 - smoothstep(DASH_END, 1, k);
			out.extra = DASH * b;
			out.stretch = 1 + (STREAK - 1) * b;
			out.gain = GAIN + (FLARE - GAIN) * b;
		}
		return out;
	}

	const info = {
		contact: Number(pStar.toFixed(4)),
		z0: Number(z0.toFixed(2)),
		zGlass,
		sunDist,
		sunDiameter: Number((sunD * frameH).toFixed(1)),
		sunCentre: [SUN_X, SUN_Y],
		limbAbove: Number((SUN_Y + sunD / 2).toFixed(3)),
		red: RED.toString(16),
		level: LEVEL,
		sil: SIL,
		flash: FLASH,
		flashAt: FLASH_AT,
		flashLen: FLASH_LEN,
		strobeAt: FLASH ? Number((FLASH_AT + FLASH_LEN * DASH_END).toFixed(4)) : null,
		edge: EDGE ?? null,
		from: FROM,
		to: TO
	};

	const camWorld = new THREE.Vector3();
	const euler = new THREE.Euler();
	function set(u) {
		const p = FROM + (TO - FROM) * u;
		const clock = runSeconds('approach', p);

		// The camera: one speed, one lens, one hand.
		const z = z0 * p;
		rig.position.set(0, 0, z);
		camera.quaternion.setFromEuler(wobbleEuler(euler, clock));
		camera.updateMatrixWorld(true);

		// The sky and the debris, and the sun on its own windows.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));
		const sunOn = smootherstep(span(p, SUN_IN)) * (1 - easeInOutCubic(span(p, SUN_OUT)));
		su.uOn.value = SUN ? sunOn : 0;

		// The swimmer, and the flash.
		const f = flashAt(p);
		sw.group.position.set(0, 0, -(A.lead + f.extra));
		sw.group.scale.set(bodyH, bodyH, bodyH * f.stretch);
		sw.spinner.rotation.z = clock * SPIN;
		sw.material.uniforms.uTime.value = clock;
		sw.material.uniforms.uGain.value = f.gain;
		sw.material.uniforms.uOpacity.value = SPERM ? smootherstep(span(p, T.swimmerIn)) : 0;
		uStrobe.value = f.white;
		strobe.visible = f.white > 0;
		strobe.scale.set(strobeH * camera.aspect, strobeH, 1);

		// The set out of the dark, black on the sun, its colours easing in;
		// the switch-on as the nose reaches the glass — the run's own.
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		uDim.value = lit;
		uSil.value = 1 - smoothstep(SIL_OUT[0], SIL_OUT[1], p);
		nest.setDim(lit);
		kal.setDim(lit);
		sigMat.uniforms.uOpacity.value =
			on *
			smoothstep(T.signal[0], T.signal[1], p) *
			(1 - smoothstep(T.signalOut[0], T.signalOut[1], p));
		const S = T.switchOn;
		const B = Math.max(S.by - pStar, 0.005);
		const win = ([a, b]) => [pStar + a * B, pStar + b * B];
		const dot_ = smoothstep(...win(S.dot), p);
		const width = smoothstep(...win(S.line), p);
		const open = smoothstep(...win(S.open), p);
		const glow = dot_ * (1 - smoothstep(...win(S.glow), p));
		kal.setOpen(open, width, glow * (1 + 2.2 * (1 - width)), glass.x, glass.y);
		camera.getWorldPosition(camWorld);
		kal.rebase(camWorld.z, camera.near);

		info.p = Number(p.toFixed(4));
		info.z = Number(z.toFixed(2));
		info.sunOn = Number(sunOn.toFixed(3));
		info.silK = Number(uSil.value.toFixed(3));
		info.dim = Number(lit.toFixed(3));
		info.dash = Number(f.extra.toFixed(2));
		info.streak = Number(f.stretch.toFixed(2));
		info.gain = Number(f.gain.toFixed(2));
		info.white = f.white;
		info.open = Number(open.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
	bu.uPx.value = 1 / renderer.domElement.height;
	nest.setDiscRin(camera.aspect);

	// ── The clock ────────────────────────────────────────────────────────
	// The run's seconds, with a plateau of `hold` at the ask standing in for
	// the popup. Seeking is by u, exactly, as the harness does it.
	const SPAN = (TO - FROM) * T.duration;
	const ASK_S = (T.ask - FROM) * T.duration;
	const holds = T.ask > FROM && T.ask < TO;
	const DURATION = SPAN + (holds ? HOLD : 0);
	const uOf = (s) => {
		let r = s;
		if (holds && s > ASK_S) r = s < ASK_S + HOLD ? ASK_S : s - HOLD;
		return Math.max(0, Math.min(1, r / SPAN));
	};
	let tt = at !== null ? at * SPAN + (holds && at * SPAN > ASK_S ? HOLD : 0) : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(uOf(Math.min(tt, DURATION)));
		},
		seek(u) {
			const s = Math.max(0, Math.min(1, u)) * SPAN;
			tt = s + (holds && s > ASK_S ? HOLD : 0);
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
			nest.setDiscRin(w / h);
		}
	};
}
