import {
	Fn,
	uniform,
	uniformArray,
	vertexStage,
	int,
	vec3,
	vec4,
	mix,
	smoothstep,
	max,
	abs,
	pow,
	exp,
	log,
	sqrt,
	floor,
	fract,
	length,
	normalize,
	dot,
	uv,
	positionLocal,
	positionView,
	transformNormalToView,
	pass
} from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { ADD, dotMaterial, dots } from '$lib/three/tsl/materials';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { ZETA_ZEROS } from '$lib/data/zetaZeros';

// ── Sketch: the impact ───────────────────────────────────────────────────────
// A beam of light comes down out of the dark and strikes a sphere. That is the
// pole of ζ: the one place the function goes to infinity, the source every-
// thing else radiates from. What radiates is the primes.
//
// The sum over the first K zeros of ζ,
//
//     Φ_K(x) = −Σ_{k≤K} cos(γ_k x)
//
// grows a spike at every x = log(p^m), of height (log p)/p^{m/2}, as K rises.
// One zero is a wave; twenty are interference; a hundred and twenty are the
// primes, sharp, at their logarithms. So after the strike the surface rings
// out — a front runs from the impact to the limb, and behind it the zeros are
// summed in, one after another, until what is left standing on the sphere is
// a ring at log 2, a ring at log 3, at log 5, log 7, log 11 … bunching toward
// the rim, where the primes run out of room. Distance from the impact is the
// hyperbolic radius of the visible disc, d = atanh(sin θ), so every prime fits
// on the face of the sphere and the limb is infinity.
//
// The strike itself is the one white moment: a cross of light at the point of
// impact — the beam's own column and the flash across it — and a shock ring
// out through the stars. The space is black; the body dark; the light gold,
// red at its hottest, white at its core.
//
//   ?zeros=120   how many zeros the sum reaches (the table has 120)
//   ?scale=0.5   ring spacing: prime p lands at d = scale·log p
//   ?bloom=0     without the glow

export const options = {};

const smoothstep01 = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const pulse = (u, t0, rise, fall) =>
	smoothstep01(t0 - rise, t0, u) * (1 - smoothstep01(t0, t0 + fall, u));

// Seeded, so a pinned frame has the same sky.
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
	const KMAX = Math.min(ZETA_ZEROS.length, Number(q.get('zeros') ?? ZETA_ZEROS.length));
	const SCALE = Number(q.get('scale') ?? 0.75);
	const BLOOM = q.get('bloom') !== '0';
	const BG = q.get('bg') !== '0'; // the air behind the stars (diagnostic switch)
	const DURATION = 12;

	const R = 2; // the sphere
	const STRIKE = 0.12; // when the beam lands

	const GOLD = new THREE.Color(0xf0c45c);
	const HOT = new THREE.Color(0xfff0c8);
	const RED = new THREE.Color(0xff3b1f);
	const INK = new THREE.Color(0x120e08);
	const WAVE = new THREE.Color(0xf0c45c);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
	camera.position.set(0, 0, 9.5);

	// ── Space ────────────────────────────────────────────────────────────
	// The fly-in's air, at its darkest: a channel, so the frame has a far end.
	const bu = backdropUniforms();
	bu.color1.value.set(0x0b0d16);
	bu.uFade.value = 1;
	if (BG) scene.backgroundNode = deep(bu);
	else scene.background = new THREE.Color(0x000000);

	const rnd = mulberry32(2000);
	const NSTARS = 900;
	const starPos = new Float32Array(NSTARS * 3);
	for (let i = 0; i < NSTARS; i++) {
		const z = rnd() * 2 - 1;
		const a = rnd() * Math.PI * 2;
		const r = Math.sqrt(1 - z * z);
		const dist = 80 + rnd() * 80;
		starPos.set([r * Math.cos(a) * dist, r * Math.sin(a) * dist, z * dist], i * 3);
	}
	const starGeo = new THREE.BufferGeometry();
	starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
	const starMat = dotMaterial(0xb8c8ff, 3.2);
	starMat.uniforms.uOpacity.value = 0.8;
	scene.add(dots(starGeo, starMat));
	// And a few brighter ones, so the sky has depth.
	const brightPos = new Float32Array(70 * 3);
	for (let i = 0; i < 70; i++) brightPos.set(starPos.subarray(i * 39, i * 39 + 3), i * 3);
	const brightGeo = new THREE.BufferGeometry();
	brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPos, 3));
	const brightMat = dotMaterial(0xdde6ff, 5.5);
	brightMat.uniforms.uOpacity.value = 0.9;
	scene.add(dots(brightGeo, brightMat));

	// ── The sphere, and the wave on it ───────────────────────────────────
	// The field Φ_K(d) is summed on the CPU each frame into a 256-entry table
	// over d ∈ [0, DMAX], normalised to its own peak, and the fragment reads it
	// back by the hyperbolic radius of the point it is drawing.
	const NF = 256;
	const DMAX = 3.4;
	const field = uniformArray(new Array(NF).fill(0));
	const uFront = uniform(-1); // how far from the impact the wave has got, in d
	const uGlow = uniform(0);
	const uHeat = uniform(0);
	const uRim = uniform(0.5);
	const uInk = uniform(INK);
	const uWave = uniform(WAVE);
	const uHot = uniform(HOT);
	const uRed = uniform(RED);
	const uGold = uniform(GOLD);

	const rule = Fn(([x, w]) => {
		const f = fract(x);
		return smoothstep(0.0, w, f.min(f.oneMinus())).oneMinus();
	});
	const sphereMat = new THREE.MeshBasicNodeMaterial({ premultipliedAlpha: true, depthWrite: true });
	const vLocal = vertexStage(positionLocal);
	const vN = vertexStage(transformNormalToView(normalize(positionLocal)));
	const vV = vertexStage(normalize(positionView.negate()));
	sphereMat.fragmentNode = Fn(() => {
		const n = normalize(vLocal);
		// Hyperbolic radius from the impact, which is the point facing the lens.
		const c = n.z;
		const r = sqrt(max(c.mul(c).oneMinus(), 0.0));
		const d = log(r.add(1.0).div(max(r.oneMinus(), 0.0016))).mul(0.5);
		// The field, read from the table.
		const t = d
			.div(DMAX)
			.clamp(0.0, 0.9999)
			.mul(NF - 1);
		const i = floor(t);
		const fr = t.sub(i);
		const ia = int(i);
		const phi = mix(field.element(ia), field.element(ia.add(1)), fr);
		// Only where the front has been.
		const arrived = smoothstep(uFront.sub(0.25), uFront.add(0.12), d).oneMinus();
		const f = phi.mul(arrived);

		// The rings ARE the crests — the primes. The level sets and the nodal
		// lines are kept faint under them, so the field reads as a surface.
		const crest = smoothstep(0.3, 0.85, f);
		const peak = pow(smoothstep(0.6, 1.0, f), 2.0);
		const bands = rule(f.mul(4.0), 0.06).mul(smoothstep(0.02, 0.2, abs(f)));
		const node = smoothstep(0.0, 0.035, abs(f)).oneMinus().mul(arrived);
		const frontLine = exp(d.sub(uFront).div(0.06).pow(2).negate()).mul(
			smoothstep(-0.5, 0.0, uFront)
		);

		const col = vec3(uInk).toVar();
		col.addAssign(uWave.mul(bands).mul(0.05).mul(uGlow));
		col.addAssign(uWave.mul(node).mul(0.07).mul(uGlow));
		col.addAssign(mix(uWave, uHot, peak).mul(crest).mul(1.1).mul(uGlow));
		col.addAssign(uHot.mul(peak).mul(0.5).mul(uGlow));
		col.addAssign(mix(uRed, uHot, 0.5).mul(frontLine).mul(0.9));
		// The heat of the strike, spreading and cooling.
		col.addAssign(
			mix(uRed, uHot, exp(d.mul(d).mul(-14.0)))
				.mul(exp(d.mul(d).mul(-7.0)))
				.mul(uHeat)
		);
		// And the rim, against the ray.
		const rim = pow(abs(dot(normalize(vN), normalize(vV))).oneMinus(), 2.5);
		col.addAssign(uWave.mul(rim).mul(uRim));
		return vec4(col, 1.0);
	})();
	const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 80), sphereMat);
	scene.add(sphere);

	// ── The beam ─────────────────────────────────────────────────────────
	// A column of light down the picture plane, in front of the sphere, that
	// ends at the point of impact. uTip is where its lower end has got to, as
	// a fraction of its length from the impact: 1 is off the top of the frame,
	// 0 is landed.
	const BEAM_LEN = 14;
	const uTip = uniform(1);
	const uBeam = uniform(0);
	const beamMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...ADD
	});
	beamMat.fragmentNode = Fn(() => {
		const x = uv().x.sub(0.5);
		const y = uv().y;
		const core = exp(x.div(0.045).pow(2).negate());
		const glow = exp(x.div(0.22).pow(2).negate()).mul(0.3);
		const along = smoothstep(uTip.sub(0.02), uTip.add(0.05), y);
		const fade = smoothstep(0.6, 0.95, y).oneMinus().mul(0.6).add(0.4);
		const a = core.add(glow).mul(along).mul(fade).mul(uBeam);
		const col = mix(vec3(uGold), vec3(uHot), core);
		return vec4(col.mul(a), a);
	})();
	const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.6, BEAM_LEN), beamMat);
	beam.position.set(0, BEAM_LEN / 2, R + 0.02);
	beam.renderOrder = 10;
	scene.add(beam);

	// ── The cross of the strike ──────────────────────────────────────────
	const uFlash = uniform(0);
	const barMat = (horizontal) => {
		const m = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			...ADD
		});
		m.fragmentNode = Fn(() => {
			const u = uv();
			const across = horizontal ? u.y.sub(0.5) : u.x.sub(0.5);
			const alongRaw = horizontal ? u.x.sub(0.5) : u.y.sub(0.5);
			const along = exp(alongRaw.mul(2.0).pow(2).mul(-2.2)); // 1 at the centre
			const thin = exp(across.div(0.09).pow(2).negate());
			const wide = exp(across.div(0.35).pow(2).negate()).mul(0.25);
			const a = thin.add(wide).mul(along).mul(uFlash);
			const col = mix(
				mix(vec3(uGold), vec3(uRed), smoothstep(0.15, 0.6, along)),
				vec3(uHot),
				smoothstep(0.7, 1.0, along)
			);
			return vec4(col.mul(a), a);
		})();
		return m;
	};
	const barH = new THREE.Mesh(new THREE.PlaneGeometry(11, 0.5), barMat(true));
	barH.position.set(0, 0, R + 0.03);
	barH.renderOrder = 11;
	scene.add(barH);
	const barV = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 16), barMat(false));
	barV.position.set(0, 0, R + 0.03);
	barV.renderOrder = 11;
	scene.add(barV);

	// ── The shock, out through the stars ─────────────────────────────────
	const uShock = uniform(0);
	const shockMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		...ADD
	});
	shockMat.fragmentNode = Fn(() => {
		const rr = length(uv().sub(0.5)).mul(2.0);
		const ring = exp(rr.sub(0.93).div(0.035).pow(2).negate());
		const a = ring.mul(uShock);
		return vec4(mix(vec3(uRed), vec3(uGold), 0.5).mul(a), a);
	})();
	const shock = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shockMat);
	shock.position.set(0, 0, R + 0.01);
	shock.renderOrder = 9;
	scene.add(shock);

	// ── Post ─────────────────────────────────────────────────────────────
	let post = null;
	let bloomed = false;
	if (BLOOM) {
		try {
			post = new THREE.RenderPipeline(renderer);
			const scenePass = pass(scene, camera);
			const bloomPass = bloom(scenePass, 0.85, 0.5, 0.5);
			post.outputNode = scenePass.add(bloomPass);
			bloomed = true;
		} catch {
			post = null;
		}
	}

	// ── The sum over the zeros ───────────────────────────────────────────
	const table = new Float64Array(NF);
	function sumZeros(K) {
		const kf = Math.max(0, Math.min(KMAX, K));
		const kInt = Math.floor(kf);
		const kFrac = kf - kInt;
		let peak = 1e-9;
		for (let i = 0; i < NF; i++) {
			const x = ((i / (NF - 1)) * DMAX) / SCALE;
			// A Hann taper over the K zeros in: the plain sum rings between the
			// primes at the last zero's own frequency, and that ripple is not a
			// prime. The taper widens the spikes a little and takes the ringing
			// down by an order.
			let s = 0;
			for (let k = 0; k < kInt; k++) {
				const w = 0.5 * (1 + Math.cos((Math.PI * k) / kf));
				s -= w * Math.cos(ZETA_ZEROS[k] * x);
			}
			if (kInt < KMAX && kFrac > 0) {
				const w = 0.5 * (1 + Math.cos((Math.PI * kInt) / kf));
				s -= kFrac * w * Math.cos(ZETA_ZEROS[kInt] * x);
			}
			table[i] = s;
			if (Math.abs(s) > peak) peak = Math.abs(s);
		}
		for (let i = 0; i < NF; i++) field.array[i] = table[i] / peak;
	}

	const info = { zeros: KMAX, scale: SCALE, bloom: bloomed, stars: NSTARS, K: 0, front: -1 };

	function set(u) {
		// The beam comes down fast and lands at STRIKE.
		const descent = smoothstep01(0.0, STRIKE, u);
		uTip.value = 1 - Math.pow(descent, 1.6);
		uBeam.value =
			smoothstep01(0.0, 0.02, u) *
			(1 - 0.85 * smoothstep01(0.45, 0.8, u)) *
			(1 - smoothstep01(0.85, 0.97, u));
		// The strike: the cross, the heat, the shock.
		uFlash.value = pulse(u, STRIKE + 0.015, 0.02, 0.22) * 1.3;
		uHeat.value = pulse(u, STRIKE + 0.02, 0.025, 0.3);
		const shockT = smoothstep01(STRIKE, STRIKE + 0.45, u);
		shock.scale.setScalar(0.2 + shockT * 22);
		uShock.value = (1 - shockT) * smoothstep01(STRIKE, STRIKE + 0.03, u) * 0.9;
		// The wave: a front out to the limb, and the zeros summed in behind it.
		const after = Math.max(0, u - STRIKE);
		uFront.value = u < STRIKE ? -1 : smoothstep01(0, 0.62, after) * (DMAX + 0.4);
		const K = smoothstep01(0.0, 0.7, after) ** 0.7 * KMAX;
		sumZeros(u < STRIKE ? 0 : Math.max(1, K));
		uGlow.value = smoothstep01(STRIKE, STRIKE + 0.2, u);
		uRim.value = 0.35 + 0.4 * smoothstep01(STRIKE, STRIKE + 0.1, u);
		info.K = Number(K.toFixed(2));
		info.front = Number(uFront.value.toFixed(3));
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
			tt = (tt + dt) % (DURATION + 2);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			if (post) post.render();
			else renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
