import {
	Fn,
	uniform,
	uniformArray,
	texture,
	textureStore,
	textureLoad,
	instanceIndex,
	uv,
	float,
	int,
	uint,
	ivec2,
	vec3,
	vec4,
	hash,
	sin,
	cos,
	acos,
	max,
	min,
	mix,
	smoothstep,
	clamp,
	dot,
	abs,
	atan
} from 'three/tsl';
import { VERTICES } from '$lib/three/geometry/icosahedron';

// ── Sketch: HEAT ─────────────────────────────────────────────────────────────
// The moment after the strike, as a real system rather than a shader trick.
//
// The surface is a COMPLEX GINZBURG–LANDAU oscillator field A(n,t) — the
// normal form of any medium that has just gone unstable to oscillation — run
// in a compute shader on a grid wrapped onto the sphere:
//
//     A_t = μA + (1 + ib)∇²A − (1 + ic)|A|²A + γ·s·Y₆(n)
//
// With 1 + bc < 0 it is Benjamin–Feir unstable: spiral waves that break, drift
// and annihilate — defect turbulence, which is deterministic chaos and looks
// like it. That is the state the whole surface is in when the swimmer goes in.
//
// THE SETTLING IS A BIFURCATION, NOT A CROSSFADE. A trigger wave s(n,t) spreads
// out from the impact point, and behind it μ crosses zero — a reverse Hopf.
// The oscillation dies at rate |μ_cold| and the field relaxes onto the one
// thing still driving it: a weak forcing toward Y₆, the icosahedral invariant
// Σ P₆(n·aᵢ) over the six five-fold axes that the site's conception is built
// from. Ahead of the front: chaos. On it: heat, released as it passes. Behind
// it: a standing wave with the twelve caps in phase. Forcing ALONE does not
// tame the turbulence — that was tried numerically and rejected — the wave
// has to switch the oscillator off first.
//
// Heat T is a diffused scalar: a hot baseline on the chaotic surface, a pulse
// let go where the front is, cooling everywhere, drawn through a blackbody
// ramp over the site's gold.
//
// The grid is an equirectangular SHEET with periodic x and clamped y, and the
// Laplacian is taken in grid units — so the physics runs on the sheet, not on
// the sphere's metric, and stretches toward the poles. A sketch's licence: the
// poles face away, and the production system is a cube-sphere.
//
// ?at= is exact by replay: a pinned frame runs a fixed number of fixed-size
// steps from a hashed seed before it is drawn.
export default async function make({ THREE, renderer, at, steps: stepsIn }) {
	const W = 256;
	const H = 128;
	const PREROLL = 3000; // steps of turbulence before the strike, s = 0 throughout
	const RUN = stepsIn ?? 4000; // steps from the strike to settled
	const PER_FRAME = 25; // live: how many steps each frame advances
	// Explicit Euler. The sheet's diffusion bound is 1/(4(1+b²)) = 0.2, but
	// the CUBIC term is the one that bites: it needs dt·|A|²·|1+ic| well under
	// one, and with c = −3 that is dt ≲ 0.05 at |A| ≈ 1. At 0.15 an overshoot
	// past |A| ≈ 1.5 blew up into the clamps and organised itself into a
	// mirror-symmetric lattice locked to the grid — which looked like a
	// pattern and was a numerical failure.
	const DT = 0.04;

	// ── State: two textures, ping-ponged ─────────────────────────────────
	// x, y = Re A, Im A; z = T (heat); w unused. FLOAT32, and sampled nearest:
	// rgba32float is not filterable without an extra device feature, and the
	// phase of a turbulent oscillator is not a half-float quantity.
	const makeTex = () => {
		const t = new THREE.StorageTexture(W, H);
		t.type = THREE.FloatType;
		t.format = THREE.RGBAFormat;
		t.wrapS = THREE.RepeatWrapping;
		t.wrapT = THREE.ClampToEdgeWrapping;
		t.minFilter = THREE.NearestFilter;
		t.magFilter = THREE.NearestFilter;
		t.generateMipmaps = false;
		return t;
	};
	const texA = makeTex();
	const texB = makeTex();

	// ── The system's constants ───────────────────────────────────────────
	const uB = uniform(0.5);
	const uC = uniform(-3.0); // 1 + bc = −0.5: defect turbulence
	const uMuHot = uniform(1.0); // ahead of the front: oscillating
	const uMuCold = uniform(-0.3); // behind it: dead, relaxing
	const uMuT = uniform(0.6); // heat makes it more unstable
	const uGamma = uniform(0.3); // the pull toward Y₆, only where s > 0
	const uKappa = uniform(0.6); // heat diffusion
	const uLambda = uniform(0.06); // cooling: the settled surface goes dark
	const uQ = uniform(0.7); // heat released by the front
	const uWidth = uniform(0.16); // the front's width, radians
	// The front's angle from the impact axis, this step and last — s is a
	// function of these, and ∂s/∂t of their difference.
	const uTheta = uniform(-1.0);
	const uThetaPrev = uniform(-1.0);

	// The six five-fold axes, one of each antipodal pair.
	const axes = [];
	for (const v of VERTICES) {
		const n = new THREE.Vector3(...v).normalize();
		if (!axes.some((w) => Math.abs(w.dot(n)) > 0.999)) axes.push(n);
	}
	const uAxes = uniformArray(axes.map((a) => new THREE.Vector3(a.x, a.y, a.z)));

	// ── Geometry of a texel ──────────────────────────────────────────────
	// Equirect: u is longitude, v is latitude, matching SphereGeometry's uv.
	const normalAt = Fn(([x, y]) => {
		const u = float(x).add(0.5).div(W);
		const v = float(y).add(0.5).div(H);
		const phi = u.mul(Math.PI * 2);
		const theta = float(1).sub(v).mul(Math.PI);
		return vec3(cos(phi).negate().mul(sin(theta)), cos(theta), sin(phi).mul(sin(theta)));
	});

	const P6 = Fn(([x]) => {
		const x2 = x.mul(x);
		const x4 = x2.mul(x2);
		const x6 = x4.mul(x2);
		return x6.mul(231).sub(x4.mul(315)).add(x2.mul(105)).sub(5).div(16);
	});

	// Y₆: the invariant, normalised as the site does it (2.64), ±1.
	const Y6 = Fn(([n]) => {
		let f = float(0);
		for (let i = 0; i < 6; i++) f = f.add(P6(dot(n, uAxes.element(i))));
		return f.div(2.64);
	});

	// The trigger wave: 1 behind the front, 0 ahead, over uWidth. The front is
	// a circle of angle theta about the impact axis (+x here), so a texel at
	// angle ang is behind it once theta has passed ang.
	const front = Fn(([theta, ang]) => smoothstep(ang.sub(uWidth), ang.add(uWidth), theta));

	// ── One step, from `src` into `dst` ──────────────────────────────────
	const step = (src, dst) =>
		Fn(() => {
			const i = instanceIndex;
			const x = int(i.mod(uint(W)));
			const y = int(i.div(uint(W)));
			const xm = x.add(W - 1).mod(W);
			const xp = x.add(1).mod(W);
			const ym = max(y.sub(1), 0);
			const yp = min(y.add(1), H - 1);

			const c = textureLoad(src, ivec2(x, y));
			const l = textureLoad(src, ivec2(xm, y));
			const r = textureLoad(src, ivec2(xp, y));
			const d = textureLoad(src, ivec2(x, ym));
			const t = textureLoad(src, ivec2(x, yp));
			const lap = l.add(r).add(d).add(t).sub(c.mul(4));

			const ar = c.x;
			const ai = c.y;
			const T = c.z;

			const n = normalAt(x, y);
			const ang = acos(clamp(n.x, -1, 1));
			const s = front(uTheta, ang);
			const sPrev = front(uThetaPrev, ang);
			const dsdt = max(s.sub(sPrev), 0).div(DT);

			// μ: alive ahead, dead behind, and heat pushes it up.
			const mu = uMuHot.mul(float(1).sub(s)).add(uMuCold.mul(s)).add(uMuT.mul(T));
			const a2 = ar.mul(ar).add(ai.mul(ai));

			// (1 + ib)∇²A and (1 + ic)|A|²A, written out in real and imaginary.
			const diffR = lap.x.sub(uB.mul(lap.y));
			const diffI = lap.y.add(uB.mul(lap.x));
			const nlR = a2.mul(ar.sub(uC.mul(ai)));
			const nlI = a2.mul(ai.add(uC.mul(ar)));

			const dAr = mu
				.mul(ar)
				.add(diffR)
				.sub(nlR)
				.add(uGamma.mul(s).mul(Y6(n)));
			const dAi = mu.mul(ai).add(diffI).sub(nlI);
			const dT = uKappa.mul(lap.z).sub(uLambda.mul(T)).add(uQ.mul(dsdt));

			const ar2 = clamp(ar.add(dAr.mul(DT)), -2, 2);
			const ai2 = clamp(ai.add(dAi.mul(DT)), -2, 2);
			const T2 = clamp(T.add(dT.mul(DT)), 0, 4);

			textureStore(dst, ivec2(x, y), vec4(ar2, ai2, T2, 1));
		})().compute(W * H, [64]);

	const stepAB = step(texA, texB);
	const stepBA = step(texB, texA);

	// ── The seed ─────────────────────────────────────────────────────────
	// Small complex noise everywhere — the oscillator grows it into
	// turbulence during the pre-roll — and a hot surface.
	const seed = Fn(() => {
		const i = instanceIndex;
		const x = int(i.mod(uint(W)));
		const y = int(i.div(uint(W)));
		const r = hash(float(i).add(3.0)).sub(0.5).mul(0.2);
		const im = hash(float(i).add(11.0)).sub(0.5).mul(0.2);
		textureStore(texA, ivec2(x, y), vec4(r, im, 0.3, 1));
	})().compute(W * H, [64]);

	// ── The sphere ───────────────────────────────────────────────────────
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 0, 6.2);

	let current = texA;
	const stateNode = texture(texA);

	// A line wherever x is near a whole number — the conception's own rule().
	// (Its first draft here was written on |fract − ½| and came out inverted:
	// one almost everywhere, zero on the line. That wash was the olive ground.)
	const rule = Fn(([x, w]) => {
		const fr = x.fract();
		return float(1).sub(smoothstep(0.0, w, min(fr, float(1).sub(fr))));
	});

	// Bilinear by hand. rgba32float cannot be filtered without a device
	// feature the software lane does not have, so the fragment loads the four
	// neighbours and mixes them itself — wrapping in x, clamping in y, like
	// the grid does.
	const sampleState = Fn(([st]) => {
		const px = st.x.mul(W).sub(0.5);
		const py = float(1).sub(st.y).mul(H).sub(0.5);
		const x0 = px.floor();
		const y0 = py.floor();
		const fx = px.sub(x0);
		const fy = py.sub(y0);
		const ix0 = int(x0).add(W).mod(W);
		const ix1 = int(x0)
			.add(W + 1)
			.mod(W);
		const iy0 = clamp(int(y0), 0, H - 1);
		const iy1 = clamp(int(y0).add(1), 0, H - 1);
		const a = textureLoad(stateNode.value, ivec2(ix0, iy0));
		const b = textureLoad(stateNode.value, ivec2(ix1, iy0));
		const c = textureLoad(stateNode.value, ivec2(ix0, iy1));
		const d = textureLoad(stateNode.value, ivec2(ix1, iy1));
		return mix(mix(a, b, fx), mix(c, d, fx), fy);
	});

	const mat = new THREE.MeshBasicNodeMaterial();
	mat.colorNode = Fn(() => {
		const st = sampleState(uv());
		const ar = st.x;
		const ai = st.y;
		const T = st.z;
		const amp = ar.mul(ar).add(ai.mul(ai)).sqrt();

		// Which side of the front this fragment is on, from the same geometry
		// the compute uses: the sphere's uv → its normal → its angle from the
		// impact axis. So the drawing changes with the physics, not on a clock.
		const u = uv().x;
		const v = uv().y;
		const phi = u.mul(Math.PI * 2);
		const theta = float(1).sub(v).mul(Math.PI);
		const nx = cos(phi).negate().mul(sin(theta));
		const ang = acos(clamp(nx, -1, 1));
		const s = front(uTheta, ang);

		// AHEAD OF THE FRONT: the turbulence as substance — a warm fill, dark at
		// the defects where |A| dies, the phase as fine bands crawling over it.
		const phase = atan(ai, ar)
			.div(Math.PI * 2)
			.add(0.5);
		const fine = rule(phase.mul(6), 0.08);
		const wild = vec3(0.95, 0.78, 0.36)
			.mul(smoothstep(0.05, 0.9, amp).mul(0.45))
			.add(vec3(0.95, 0.78, 0.36).mul(fine.mul(0.3).mul(smoothstep(0.1, 0.5, amp))));

		// BEHIND IT: the site's instrument. Re A is now the standing wave, and
		// it is drawn as the conception draws its field — level sets and the
		// nodal set, line-work on a near-black ground, no fill.
		const f = ar;
		const bands = rule(f.mul(5), 0.055);
		const node = float(1).sub(smoothstep(0.0, 0.05, abs(f)));
		const crest = smoothstep(0.7, 1.05, f);
		const calm = vec3(0.95, 0.78, 0.36)
			.mul(bands.mul(0.32).add(crest.mul(0.18)))
			.add(vec3(1.0, 0.94, 0.78).mul(node.mul(0.7)));

		// Heat through a blackbody ramp, soft-toned, on both sides.
		const tt = T.div(T.add(0.6));
		// The toe is raised so a surface that has cooled is BLACK, not a dull
		// red: the ground under the settled line-work is the site's.
		const hot = vec3(
			smoothstep(0.08, 0.45, tt),
			smoothstep(0.3, 0.85, tt).mul(0.8),
			smoothstep(0.7, 1.0, tt).mul(0.9)
		).mul(1.1);

		const ground = vec3(0.043, 0.039, 0.031);
		return ground.add(mix(wild, calm, s)).add(hot);
	})();

	const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 128, 64), mat);
	// The grid's +x — the impact axis — turned to face the camera.
	sphere.rotation.y = -Math.PI / 2;
	scene.add(sphere);

	// ── Progress → the front ─────────────────────────────────────────────
	// Before the strike the front is parked below zero (s = 0 everywhere).
	// From the strike it walks from the impact point to the far pole and a
	// little past, so everything is reached.
	const thetaAt = (k) => {
		if (k < PREROLL) return -1;
		const p = Math.min((k - PREROLL) / RUN, 1);
		const e = p * p * (3 - 2 * p);
		return -0.2 + e * (Math.PI + 0.5);
	};

	// ── Run ──────────────────────────────────────────────────────────────
	let done = 0;
	const advance = (n) => {
		for (let i = 0; i < n; i++) {
			uThetaPrev.value = thetaAt(done);
			uTheta.value = thetaAt(done + 1);
			if (current === texA) {
				renderer.compute(stepAB);
				current = texB;
			} else {
				renderer.compute(stepBA);
				current = texA;
			}
			done++;
		}
		stateNode.value = current;
	};

	const t0 = performance.now();
	renderer.compute(seed);
	current = texA;
	stateNode.value = current;
	// A pinned frame: the whole pre-roll, then `at` of the run.
	advance(PREROLL + (at !== null ? Math.round(at * RUN) : 0));
	const seekMs = Math.round(performance.now() - t0);

	return {
		info: { W, H, preroll: PREROLL, run: RUN, stepsRun: done, seekMs },
		update() {
			if (done < PREROLL + RUN) advance(PER_FRAME);
		},
		// Progress → steps. Forward is incremental; backward re-seeds and
		// replays, so a seek is still a pure function of u and the seed.
		seek(u) {
			const target = PREROLL + Math.round(Math.max(0, Math.min(1, u)) * RUN);
			if (target < done) {
				renderer.compute(seed);
				current = texA;
				done = 0;
			}
			advance(target - done);
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		}
	};
}
