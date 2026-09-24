import { Fn, attribute, uniform, vec4, positionLocal, sin, cos, vec3 } from 'three/tsl';
import {
	APPROACH,
	KALEIDO,
	LENS,
	SCENES,
	span,
	smoothstep,
	smootherstep,
	easeInOutCubic,
	runSeconds
} from '$lib/config';
import { SCREEN_GLASS } from '$lib/config/layout';
import { dotMaterial, dots, ADD } from '$lib/three/tsl/materials';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createMotes } from '$lib/three/tsl/motes';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { glassCut } from '$lib/three/tsl/glass';
import { elementUrl } from '$lib/data/roomElements';
import { wobbleEuler } from '$lib/three/world/wobble';
import { resolve } from '$lib/functions/answer';
import data from '$lib/data/cc2000_data.json';

// ── Sketch: the sky is the archive ───────────────────────────────────────────
// The approach's sky, with the archive in it. The 1,100 stars become 3,380:
// one per chart week, laid in order along a slow belt round the sky — a
// helix of two and a half turns, 1958 at the bottom end and 2023 at the top,
// jittered enough that no frame of it reads as anything but sky. Space,
// black, the swimmer riding ahead of the lens, the motes streaking past: the
// approach as it is, up to the answers.
//
// Then the popups close and the sky SWINGS: the archive turning to find your
// week. The whole field streaks, and one star comes round to the centre of
// the frame, just over the swimmer's head, and goes GOLD as the swing settles
// on it. It is the signal — the point of light the set is under — and the
// 60s set comes out of the dark beneath it, dark, and covers it, and the
// flight goes on into the glass. An older birthday is a longer swing: 2023
// sits dead ahead before the answers and 1958 is two and a half turns away.
//
// On an edge date the sky swings PAST its first (or last) star, into the
// black below (or above) the belt: nothing lights, the set arrives dark and
// stays dark, and the breakdown down the tunnel is already announced.
//
// What keeps it a sky turning rather than a camera panning: the swimmer, the
// motes and the set hold still in the frame — only the stars move, and they
// move as a sphere about the lens. The hand on the camera (wobble.js) is on
// as it is in the run, so the sketch shows the two motions on top of each
// other.
//
// Beats (p of the approach, SCENES.approach's own windows where they exist):
//   fadeIn  0–0.1     the sky and the debris up
//   0.25              the answers are in: the swing starts
//   swing   0.25–0.52 the sky turns — yaw and a little pitch — onto week k
//   gold    0.44–0.51 the star at the centre goes gold; a flare as it settles
//   set     ~0.45–0.7 the 60s set out of the dark under it, covering it
//   crtOn   0.86–0.93 its glass switches on: a hairline that opens
//   skyOut  0.9–0.985 the sky goes out under the set
//
//   ?date=1990-10-14  the birthday (default), ?spicy=5 the level
//   ?edge=past|future an impossible birthday: the swing into the black
//   ?turns=2.5        how many turns of the sky the belt makes
//   ?tilt=30          the belt's axis, degrees off the frame's vertical: the
//                     swing streaks the sky in arcs across the frame rather
//                     than in level lines, which is a sky turning, not a pan
//   ?streak=1         the swing's motion blur, 0 for dots only
//   ?halo=1           the gold star's halo, 0 for the bare signal dot
//   ?sperm=0          without the swimmer
//   ?wobble=0         without the hand on the camera

export const options = {};

const rad = (d) => (d * Math.PI) / 180;
function mulberry32(a) {
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const DATE = q.get('date') ?? '1990-10-14';
	const SPICY = Number(q.get('spicy') ?? 5);
	const EDGE_Q = q.get('edge');
	const TURNS = Number(q.get('turns') ?? 2.5);
	const TILT = rad(Number(q.get('tilt') ?? 30));
	const STREAK = q.get('streak') !== '0';
	const HALO = q.get('halo') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const WOB = q.get('wobble') !== '0';
	const T = SCENES.approach;
	const A = APPROACH;
	const K = KALEIDO;
	const DURATION = T.duration;

	const SWING = [0.25, 0.52];
	const GOLD = [0.44, 0.51];
	const GOLD_OUT = T.signalOut;
	const FLARE = [0.5, 0.62];

	// ── The answer ───────────────────────────────────────────────────────
	// The archive's weeks, sorted, and which one is yours. The edge cases
	// come out of resolve() as they do in the run; ?edge= forces one.
	const weeks = Object.keys(data).sort();
	const N = weeks.length;
	const answer = EDGE_Q ? { edge: EDGE_Q } : resolve(DATE, SPICY);
	const edge = answer.edge ?? null;
	const k = edge ? -1 : Math.max(0, weeks.indexOf(answer.conceived));

	// ── The scene, the lens, the hand ────────────────────────────────────
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group(); // the lens, the sky and the swimmer travel together
	rig.add(camera);
	scene.add(rig);
	const euler = new THREE.Euler();

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── The belt ─────────────────────────────────────────────────────────
	// Week i at yaw θ = 2π·TURNS·i/N about the lens, on a latitude that
	// climbs from −LAT to +LAT over the archive: a helix, its turns 2·LAT/TURNS
	// apart. The jitter is triangular, so the belt is dense along its line
	// and thins out either side, which is what a sky does. θ = 0 is dead
	// ahead (−z), so a yaw of θ_k on the group brings week k onto the axis,
	// and a pitch of −lat_k brings it to the centre.
	const rnd = mulberry32(11);
	const LAT = 0.42;
	const JIT = 0.3;
	const yaw = new Float32Array(N);
	const lat = new Float32Array(N);
	const pos = new Float32Array(N * 3);
	const place = (i, out, o) => {
		const th = yaw[i];
		const la = lat[i];
		const r = A.starDist * (0.8 + rnd() * 0.4);
		out[o] = r * Math.cos(la) * Math.sin(th);
		out[o + 1] = r * Math.sin(la);
		out[o + 2] = -r * Math.cos(la) * Math.cos(th);
	};
	for (let i = 0; i < N; i++) {
		yaw[i] = (Math.PI * 2 * TURNS * i) / N + (rnd() - 0.5) * 0.02;
		lat[i] = -LAT + (2 * LAT * i) / N + 0.05 * Math.sin(0.7 * i) + (rnd() + rnd() - 1) * JIT;
		place(i, pos, i * 3);
	}
	// The belt's axis is tilted off the frame's vertical (TILT) by a roll
	// about the view axis, which leaves the axis itself where it is: the
	// swing still lands week k dead ahead, and the streaks cross the frame
	// in arcs.
	const tilt = new THREE.Group();
	tilt.rotation.z = TILT;
	rig.add(tilt);
	const stars = new THREE.Group();
	tilt.add(stars);
	const starMats = [];
	const field = (geo, size, hex, opacity) => {
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	const beltGeo = new THREE.BufferGeometry();
	beltGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	const belt = field(beltGeo, 3.4, 0xb8c8ff, 0.85);
	stars.add(belt);
	// The bright ones, anywhere: the sky is not only the belt.
	{
		const n = A.brightStars;
		const bp = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rnd() * 2 - 1;
			const a = rnd() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = A.starDist * (0.8 + rnd() * 0.4);
			bp.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(bp, 3));
		stars.add(field(g, 5.5, 0xdde6ff, 0.9));
	}

	// ── The streaks ──────────────────────────────────────────────────────
	// The swing's motion blur: every star as a segment along its own motion,
	// swung ±uStreak about the group's y in the vertex, so the field streaks
	// exactly as far as it turns per shutter, and not at all at rest.
	const uStreak = uniform(0); // half the swing per shutter, in yaw
	const uStreakP = uniform(0); // and in pitch
	const uStreakA = uniform(0);
	if (STREAK) {
		const sp = new Float32Array(N * 6);
		const end = new Float32Array(N * 2);
		for (let i = 0; i < N; i++) {
			for (let e = 0; e < 2; e++) {
				sp[i * 6 + e * 3] = pos[i * 3];
				sp[i * 6 + e * 3 + 1] = pos[i * 3 + 1];
				sp[i * 6 + e * 3 + 2] = pos[i * 3 + 2];
				end[i * 2 + e] = e ? 1 : -1;
			}
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(sp, 3));
		g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
		const m = new THREE.LineBasicNodeMaterial({ transparent: true, depthWrite: false, ...ADD });
		m.positionNode = Fn(() => {
			const p = positionLocal;
			const e = attribute('aEnd', 'float');
			const a = e.mul(uStreak);
			const c = cos(a);
			const s = sin(a);
			const x1 = p.x.mul(c).add(p.z.mul(s));
			const z1 = p.z.mul(c).sub(p.x.mul(s));
			const b = e.mul(uStreakP);
			const cb = cos(b);
			const sb = sin(b);
			return vec3(x1, p.y.mul(cb).sub(z1.mul(sb)), p.y.mul(sb).add(z1.mul(cb)));
		})();
		const ink = new THREE.Color(0xb8c8ff);
		m.colorNode = vec4(vec3(ink.r, ink.g, ink.b).mul(uStreakA), uStreakA);
		const streaks = new THREE.LineSegments(g, m);
		streaks.frustumCulled = false;
		stars.add(streaks);
	}

	// ── The gold star ────────────────────────────────────────────────────
	// Week k's own star, drawn again in the signal's colour and size (and a
	// halo round it), lit as the swing settles: the resolve, visible.
	const goldMats = [];
	if (!edge) {
		const gp = new Float32Array(3);
		gp[0] = pos[k * 3];
		gp[1] = pos[k * 3 + 1];
		gp[2] = pos[k * 3 + 2];
		const mk = (size, opacity, halo) => {
			const g = new THREE.BufferGeometry();
			g.setAttribute('position', new THREE.BufferAttribute(gp.slice(), 3));
			const mat = dotMaterial(K.signalColor, size);
			// Over the set: the set comes out of the dark UNDER it, and it goes
			// out as the run's signal does (signalOut), not when the glass
			// happens to cover it.
			mat.depthTest = false;
			goldMats.push({ mat, opacity, halo });
			const d = dots(g, mat);
			d.renderOrder = 10;
			stars.add(d);
		};
		mk(K.signalSize, 1, false);
		if (HALO) mk(K.signalSize * 4, 0.16, true);
	}

	// ── The debris ───────────────────────────────────────────────────────
	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	scene.add(motes.lines);

	// ── The set ──────────────────────────────────────────────────────────
	// The 60s television, dead ahead at the end of the flight, dark: the
	// screen drawing with its glass cut out, a black glass behind the hole,
	// and both out of the dark by distance (KALEIDO.seen). At crtOn the glass
	// switches on: a hairline that opens. There is no tunnel behind it here —
	// the glass lights a flat deep blue, the tunnel's colour at a distance.
	const loader = new THREE.TextureLoader();
	const screenTex = await loader.loadAsync(elementUrl(K.screenDecade, 'screen'));
	screenTex.colorSpace = THREE.SRGBColorSpace;
	screenTex.generateMipmaps = true;
	screenTex.minFilter = THREE.LinearMipmapLinearFilter;
	const uDim = uniform(0); // lit × near: the set's presence
	const uLitA = uniform(0); // the lit glass, once the covers have parted
	const uGlow = uniform(0);
	const set3 = new THREE.Group();
	const sw_ = K.screenWidth;
	const art = screenTex.image.width / screenTex.image.height;
	const sh = sw_ / art;
	const gl = SCREEN_GLASS[K.screenDecade];
	const gw = gl.w * sw_;
	const gh = gl.h * sh;
	const gx = (gl.cx - 0.5) * sw_;
	const gy = (0.5 - gl.cy) * sh;
	{
		const bezelMat = new THREE.MeshBasicNodeMaterial({ transparent: true });
		const c = glassCut(K.screenDecade, screenTex)();
		bezelMat.colorNode = vec4(c.rgb.mul(uDim), c.a.mul(uDim));
		const bezel = new THREE.Mesh(new THREE.PlaneGeometry(sw_, sh), bezelMat);
		bezel.renderOrder = 2;
		set3.add(bezel);
		const glassMat = new THREE.MeshBasicNodeMaterial({ transparent: true });
		glassMat.colorNode = vec4(0, 0, 0, uDim);
		const glass = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), glassMat);
		glass.position.set(gx, gy, -0.02);
		glass.renderOrder = 1;
		set3.add(glass);
		// The picture switching on: a lit glass behind two black covers that
		// part from the middle, and a bright line where they meet.
		const litMat = new THREE.MeshBasicNodeMaterial({ transparent: true });
		litMat.colorNode = vec4(vec3(0.16, 0.24, 0.5).mul(uLitA), uLitA);
		const lit = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), litMat);
		lit.position.set(gx, gy, -0.01);
		lit.renderOrder = 2;
		set3.add(lit);
		const lineMat = new THREE.MeshBasicNodeMaterial({ transparent: true, ...ADD });
		lineMat.colorNode = vec4(vec3(1, 1, 0.9).mul(uGlow), 1);
		const line = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh * 0.012), lineMat);
		line.position.set(gx, gy, 0.01);
		line.renderOrder = 3;
		set3.add(line);
		set3.userData.lit = lit;
		set3.userData.line = line;
	}
	// The glass on the axis; the flight ends where it fills the frame's height.
	set3.position.set(-gx, -gy, -A.travel);
	scene.add(set3);
	const zEnd = -A.travel + gh / 2 / Math.tan(rad(LENS) / 2);

	// ── The swimmer ──────────────────────────────────────────────────────
	const lead = A.lead;
	const bodyH = A.span * 2 * lead * Math.tan(rad(LENS) / 2);
	const swimmer = await loadSwimmer({ height: 1, gain: 1.15 });
	swimmer.material.depthTest = false;
	swimmer.group.traverse((o) => {
		if (o.isMesh) o.renderOrder = 100;
	});
	swimmer.group.position.set(0, 0, -lead);
	swimmer.group.scale.setScalar(bodyH);
	camera.add(swimmer.group);

	// ── The swing ────────────────────────────────────────────────────────
	// From 2023's end dead ahead to week k: yaw and pitch on the group, one
	// smootherstep over the window, so an older birthday is a longer, faster
	// swing. An edge date overshoots the belt's end into the black beyond it.
	// (Ry(φ) on the group takes a star at yaw θ to yaw θ − φ, so the yaw
	// that brings week k ahead is +θ_k; Rx(a) takes latitude l to l + a, so
	// the pitch is −lat_k.)
	const yaw0 = yaw[N - 1];
	const pitch0 = 0;
	let yaw1, pitch1;
	if (edge === 'past') {
		yaw1 = yaw[0] - 0.6;
		pitch1 = LAT + 0.55;
	} else if (edge === 'future') {
		yaw1 = yaw[N - 1] + 0.6;
		pitch1 = -(LAT + 0.55);
	} else {
		yaw1 = yaw[k];
		pitch1 = -lat[k];
	}
	const SHUTTER = 1 / 40 / DURATION; // one frame's worth of p, for the blur
	const pxPerRad = () => renderer.domElement.height / (2 * Math.tan(rad(LENS) / 2));

	const info = {
		weeks: N,
		week: edge ? null : weeks[k],
		k: edge ? null : k,
		edge,
		turns: Number((Math.abs(yaw1 - yaw0) / (Math.PI * 2)).toFixed(3)),
		tiltDeg: Number(((TILT * 180) / Math.PI).toFixed(1)),
		zEnd: Number(zEnd.toFixed(2))
	};

	const camWorld = new THREE.Vector3();
	function set(p) {
		// The camera: one speed down the axis, the run's hand on it.
		const z = zEnd * p;
		rig.position.set(0, 0, z);
		if (WOB) camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		else camera.quaternion.identity();
		camera.updateMatrixWorld(true);

		// The sky and the debris: up with the card, out under the set.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		motes.set(z, on, span(p, T.fadeIn));

		// The swing, and its speed for the blur.
		const s = span(p, SWING);
		const e = smootherstep(s);
		const de = (30 * s * s * (1 - s) * (1 - s)) / (SWING[1] - SWING[0]); // d(e)/dp
		stars.rotation.set(pitch0 + (pitch1 - pitch0) * e, yaw0 + (yaw1 - yaw0) * e, 0);
		const half = ((yaw1 - yaw0) * de * SHUTTER) / 2; // rad, signed
		const halfP = ((pitch1 - pitch0) * de * SHUTTER) / 2;
		const lenPx = Math.hypot(half, halfP) * 2 * pxPerRad();
		const dotK = STREAK ? 3 / (3 + lenPx) : 1;
		uStreak.value = half;
		uStreakP.value = halfP;
		uStreakA.value = on * 0.7 * Math.min(1, 1.6 * (1 - dotK));
		for (const m of starMats) m.mat.uniforms.uOpacity.value = m.opacity * on * dotK;
		// The gold star: on as the swing settles, out once the set has it.
		const gold = smoothstep(GOLD[0], GOLD[1], p) * (1 - smoothstep(GOLD_OUT[0], GOLD_OUT[1], p));
		// The moment it settles, a flare: the halo swells and relaxes.
		const flare = Math.sin(Math.PI * span(p, FLARE));
		for (const m of goldMats) {
			m.mat.uniforms.uOpacity.value = (m.opacity + (m.halo ? 0.45 * flare : 0)) * on * gold;
		}

		// The set: lit from the answers, out of the dark by distance.
		const lit = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		camera.getWorldPosition(camWorld);
		const dist = camWorld.z - set3.position.z;
		const near = 1 - smoothstep(K.seen[0], K.seen[1], dist);
		uDim.value = lit * near;
		const open = edge ? 0 : smoothstep(T.crtOn[0], T.crtOn[1], p);
		const glow = edge || p < T.crtOn[0] ? 0 : 1 - smoothstep(T.crtOn[0], T.crtOn[1] + 0.04, p);
		uLitA.value = open > 0.0005 ? uDim.value : 0;
		uGlow.value = glow * lit;
		set3.userData.lit.scale.set(1, Math.max(open, 0.0001), 1);
		set3.userData.line.visible = glow > 0.001;

		// The swimmer, on the same clock: the roll never stops.
		const sec = p * DURATION;
		swimmer.spinner.rotation.z = -sec * 10;
		swimmer.material.uniforms.uTime.value = sec;
		swimmer.material.uniforms.uOpacity.value = SPERM ? smootherstep(span(p, T.swimmerIn)) : 0;

		info.yawDeg = Number(((stars.rotation.y * 180) / Math.PI).toFixed(1));
		info.streakPx = Number(lenPx.toFixed(1));
		info.gold = Number(gold.toFixed(2));
		info.setDim = Number(uDim.value.toFixed(2));
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
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
