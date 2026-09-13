import * as THREE from 'three/webgpu';
import {
	Fn,
	Discard,
	uniform,
	uniformArray,
	attribute,
	vertexStage,
	float,
	vec3,
	vec4,
	mix,
	smoothstep,
	clamp,
	max,
	min,
	abs,
	pow,
	exp,
	log,
	sin,
	atan,
	dot,
	fract,
	length,
	normalize,
	sqrt,
	select,
	positionLocal,
	positionView,
	positionWorld,
	normalView,
	modelViewMatrix,
	cameraPosition,
	transformNormalToView,
	uv,
	cameraProjectionMatrix,
	viewportSize,
	instancedBufferAttribute
} from 'three/tsl';
import { CIRCUMRADIUS, VERTICES } from '../geometry/icosahedron';

// ── The five materials, in TSL ───────────────────────────────────────────────
// world/materials.js, line for line, for the WebGPU renderer. Same names, same
// arguments, same `uniforms` surface — `mat.uniforms.uGrow.value = x` works on
// these exactly as it does on the ShaderMaterials, because each uniform IS a
// TSL uniform node and `.value` is its value — so a scene that drives one can
// drive the other without knowing which it has.
//
// Everything world/materials.js says about ink and accent, ADD and OVER,
// premultiplication and encoding still holds. Two things are different in the
// mechanism and nothing in the picture:
//
//   PREMULTIPLY. An ADD material hands back premultiplied colour itself, as
//   before. The one OVER material (the core) hands back STRAIGHT colour and
//   sets premultipliedAlpha, because a NodeMaterial with that flag premultiplies
//   on the way out — doing it in the fragment too would square the alpha, the
//   very bug the original's comment records.
//
//   POINTS. WebGPU has no point size. A drawn point is a Sprite drawn once per
//   vertex by instancing (dots() below), with the same fragment on it.
//
// Colour: ColorManagement is off (theme.js), so a colour handed to any of these
// is the colour that lands on screen, as it was for the ShaderMaterials. When
// the site turns it on, every colour here will need to be authored in linear
// light at the same time — not before.

// Premultiplied additive: (ONE, ONE). Not AdditiveBlending, which is
// (SRC_ALPHA, ONE) and would multiply by alpha a second time.
export const ADD = {
	blending: THREE.CustomBlending,
	blendSrc: THREE.OneFactor,
	blendDst: THREE.OneFactor,
	blendEquation: THREE.AddEquation
};

// The exponential the whole fly-in is fogged by. Identical to THREE.FogExp2.
const fogAt = Fn(([d, density]) => {
	return exp(density.mul(density).mul(d).mul(d).negate()).oneMinus();
});

const fogUniforms = (color, density) => ({
	uFogColor: uniform(new THREE.Color(color)),
	uFogDensity: uniform(density)
});

// A line wherever x is near a whole number.
const rule = Fn(([x, w]) => {
	const f = fract(x);
	return smoothstep(0.0, w, min(f, f.oneMinus())).oneMinus();
});

// The fourth-dimension ramp — see world/materials.js W_RAMP.
const wRampOf = Fn(([w]) => {
	return smoothstep(0.3, 0.72, w).mul(smoothstep(0.8, 0.9, abs(w)).oneMinus());
});

// ── 1. The line ──────────────────────────────────────────────────────────────
export function lineMaterial(color, opacity = 1, { wRamp = false } = {}) {
	const u = {
		uInk: uniform(new THREE.Color(color)),
		uGrow: uniform(0),
		uSpan: uniform(0.4),
		uOpacity: uniform(opacity),
		uRadius: uniform(CIRCUMRADIUS),
		uBack: uniform(0.22)
	};
	const mat = new THREE.LineBasicNodeMaterial({ transparent: true, depthWrite: false, ...ADD });
	mat.uniforms = u;

	// Depth measured from the object's OWN centre, not the camera's. +1 nearest,
	// −1 furthest. Computed per vertex and interpolated, as the varying was.
	const centreZ = modelViewMatrix.mul(vec4(0, 0, 0, 1)).z;
	const vFront = vertexStage(clamp(positionView.z.sub(centreZ).div(u.uRadius), -1, 1));

	mat.fragmentNode = Fn(() => {
		const aT = attribute('aT', 'float');
		const aDelay = attribute('aDelay', 'float');
		const local = clamp(u.uGrow.sub(aDelay).div(max(u.uSpan, 0.0001)), 0, 1);
		Discard(aT.greaterThan(local));
		const a = u.uOpacity.mul(mix(u.uBack, 1.0, vFront.mul(0.5).add(0.5))).toVar();
		if (wRamp) a.mulAssign(wRampOf(attribute('aW', 'float')));
		return vec4(u.uInk.mul(a), a);
	})();
	return mat;
}

// ── 2. The hologram ──────────────────────────────────────────────────────────
export function holoMaterial({ ink, accent, fog, fogDensity, rings, longs, gain = 1 }) {
	const u = {
		uInk: uniform(new THREE.Color(ink)),
		uAccent: uniform(new THREE.Color(accent)),
		uOpacity: uniform(0),
		uGain: uniform(gain),
		uTime: uniform(0),
		uAxis: uniform(new THREE.Vector3(0, 0, 1)),
		uSide: uniform(new THREE.Vector3(1, 0, 0)),
		uUp: uniform(new THREE.Vector3(0, 1, 0)),
		uCentre: uniform(new THREE.Vector3()),
		uRings: uniform(rings),
		uLongs: uniform(longs),
		...fogUniforms(fog, fogDensity)
	};
	const mat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		side: THREE.DoubleSide,
		depthWrite: false,
		...ADD
	});
	mat.uniforms = u;

	// As the original has them: the normal in VIEW space, the view ray in WORLD
	// space. That mismatch is in the picture the site ships, so it is kept.
	const vN = vertexStage(normalView);
	const vView = vertexStage(normalize(cameraPosition.sub(positionWorld)));
	const vLocal = vertexStage(positionLocal);
	const vDepth = vertexStage(positionView.z.negate());

	mat.fragmentNode = Fn(() => {
		const d = vLocal.sub(u.uCentre);
		const s = dot(d, u.uAxis);
		const a = atan(dot(d, u.uUp), dot(d, u.uSide)).div(6.2831853);

		const ring = rule(s.mul(u.uRings), 0.2);
		const longi = rule(a.mul(u.uLongs), 0.14);
		const rim = pow(abs(dot(normalize(vN), vView)).oneMinus(), 2.0);

		const band = smoothstep(
			0.55,
			1.0,
			sin(s.mul(3.0).sub(u.uTime.mul(2.2)))
				.mul(0.5)
				.add(0.5)
		);

		const wire = max(ring, longi.mul(0.35));
		const alpha = float(0.04)
			.add(wire.mul(0.42))
			.add(rim.mul(0.34))
			.add(band.mul(wire).mul(0.45))
			.mul(u.uOpacity)
			.mul(u.uGain)
			.toVar();
		const col = mix(u.uInk, u.uAccent, rim.mul(0.3).add(band.mul(0.3))).toVar();

		const f = fogAt(vDepth, u.uFogDensity);
		col.assign(mix(col, u.uFogColor, f));
		alpha.mulAssign(f.mul(0.94).oneMinus());
		return vec4(col.mul(alpha), alpha);
	})();
	return mat;
}

// ── 3. The skin ──────────────────────────────────────────────────────────────
export function skinMaterial({ ink, accent, power = 3, base = 0, add = false }) {
	const u = {
		uInk: uniform(new THREE.Color(ink)),
		uAccent: uniform(new THREE.Color(accent)),
		uPower: uniform(power),
		uBase: uniform(base),
		uOpacity: uniform(1)
	};
	const mat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.FrontSide,
		...(add ? ADD : {})
	});
	mat.uniforms = u;

	const vN = vertexStage(normalView);
	// The ray from the surface back to the lens, in view space.
	const vV = vertexStage(normalize(positionView.negate()));

	mat.fragmentNode = Fn(() => {
		const f = pow(abs(dot(normalize(vN), normalize(vV))).oneMinus(), u.uPower);
		const a = u.uBase.add(f.mul(u.uBase.oneMinus())).mul(u.uOpacity);
		return vec4(mix(u.uInk, u.uAccent, f).mul(a), a);
	})();
	return mat;
}

// ── 4. The point ─────────────────────────────────────────────────────────────
// WebGPU draws a point one pixel wide and nothing else, so a drawn point is a
// SPRITE — a camera-facing quad — drawn once per vertex by instancing, with
// the same fragment on it. The material carries the fragment; dots() binds it
// to a geometry, because the quad reads its position (and its aW) as an
// INSTANCED attribute, which the shader has to be built against.
//
// The size is gl_PointSize's: a number of device pixels, whatever the lens or
// the distance. A sprite without size attenuation is scaled by its depth so
// its size in world units is constant on screen; what is left is the lens's
// own factor and the viewport height, and both are divided out below.
export function dotMaterial(color, size, { wRamp = false } = {}) {
	const u = {
		uInk: uniform(new THREE.Color(color)),
		uOpacity: uniform(0),
		uSize: uniform(size)
	};
	const mat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, ...ADD });
	mat.uniforms = u;
	mat.sizeAttenuation = false;
	// uSize device pixels, as a fraction of the frame's half-height, undone
	// through the projection's own y scale: cameraProjectionMatrix[1][1].
	mat.scaleNode = u.uSize.mul(2.0).div(cameraProjectionMatrix.element(1).y.mul(viewportSize.y));
	mat.userData.wRamp = wRamp;
	return mat;
}

// A field of drawn points: one Sprite, instanced once per vertex of `geo`.
export function dots(geo, mat) {
	// Per INSTANCE, not per vertex: the backend reads the step mode off the
	// attribute's own type, so the geometry's arrays are rewrapped as instanced.
	const pos = geo.getAttribute('position');
	const perInstance = (attr) => new THREE.InstancedBufferAttribute(attr.array, attr.itemSize);
	mat.positionNode = instancedBufferAttribute(perInstance(pos));
	const u = mat.uniforms;
	const aW = mat.userData.wRamp
		? instancedBufferAttribute(perInstance(geo.getAttribute('aW')))
		: null;
	mat.fragmentNode = Fn(() => {
		// The quad's own uv stands in for gl_PointCoord; the dot is round.
		const d = uv().sub(0.5);
		const r = length(d).mul(2.0);
		const a = exp(r.mul(r).mul(-4.0))
			.mul(0.5)
			.add(smoothstep(0.2, 0.32, r).oneMinus().mul(0.95))
			.mul(u.uOpacity)
			.toVar();
		if (aW) a.mulAssign(wRampOf(aW));
		return vec4(u.uInk.mul(a), a);
	})();
	const sprite = new THREE.Sprite(mat);
	sprite.count = pos.count;
	sprite.frustumCulled = false;
	return sprite;
}

// ── 5. The core ──────────────────────────────────────────────────────────────
const SPLASH_AXIS = new THREE.Vector3(...VERTICES[5]).normalize();

const FIVE_FOLD = (() => {
	const out = [];
	VERTICES.forEach((v) => {
		const u = new THREE.Vector3(...v).normalize();
		if (!out.some((w) => Math.abs(w.dot(u)) > 0.999)) out.push(u);
	});
	return out; // six of them
})();

export function coreMaterial({ ink, wave, hot, rim, rimPower = 2.2 }) {
	const u = {
		uInk: uniform(new THREE.Color(ink)),
		uWave: uniform(new THREE.Color(wave)),
		uHot: uniform(new THREE.Color(hot)),
		uRim: uniform(new THREE.Color(rim)),
		uRimPower: uniform(rimPower),
		uRimGain: uniform(0),
		uOpacity: uniform(0),
		uGlow: uniform(0),
		uAxes: uniformArray(FIVE_FOLD.map((v) => v.clone())),
		uFurrow: uniform(0),
		uLobe: uniform(0),
		uChop: uniform(0),
		uSplashAxis: uniform(SPLASH_AXIS.clone()),
		uGrain: uniform(0),
		uFront: uniform(-0.9),
		uRing: uniform(0),
		uPhase: uniform(0)
	};
	const mat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		// The one OVER material. It hands back STRAIGHT colour; this flag makes
		// the material premultiply on the way out and blend (ONE, ONE_MINUS_SRC_ALPHA).
		premultipliedAlpha: true,
		depthWrite: true,
		side: THREE.FrontSide
	});
	mat.uniforms = u;

	const vLocal = vertexStage(positionLocal);
	const vN = vertexStage(transformNormalToView(normalize(positionLocal)));
	const vV = vertexStage(normalize(positionView.negate()));

	const waveField = Fn(([n]) => {
		const h = float(0).toVar();
		for (let i = 0; i < 6; i++) {
			const x = dot(n, u.uAxes.element(i));
			const x2 = x.mul(x);
			const x4 = x2.mul(x2);
			h.addAssign(x4.mul(x2).mul(231.0).sub(x4.mul(315.0)).add(x2.mul(105.0)).sub(5.0).div(16.0));
		}
		h.divAssign(2.64);
		return h.mul(u.uRing.mul(sin(u.uPhase.mul(5.5))).add(1.0));
	});

	const hyp = Fn(([n]) => {
		const c = dot(n, u.uSplashAxis);
		const r = sqrt(max(c.mul(c).oneMinus(), 0.0));
		return log(r.add(1.0).div(max(r.oneMinus(), 0.0016))).mul(0.5);
	});

	const splash = Fn(([n]) => sin(hyp(n).mul(3.1).sub(u.uPhase.mul(2.2))));

	const wild = Fn(([n]) => smoothstep(u.uFront.sub(0.7), u.uFront.add(0.15), hyp(n)));

	const grain = Fn(([n]) => {
		const p = u.uPhase;
		const g = sin(n.x.mul(21.0).add(p.mul(0.31)))
			.mul(sin(n.y.mul(19.0).sub(p.mul(0.27))))
			.mul(sin(n.z.mul(23.0).add(p.mul(0.23))))
			.toVar();
		g.addAssign(
			sin(n.x.mul(41.0).sub(p.mul(0.19)))
				.mul(sin(n.y.mul(37.0).add(p.mul(0.22))))
				.mul(sin(n.z.mul(43.0).sub(p.mul(0.17))))
				.mul(0.5)
		);
		g.addAssign(
			sin(n.x.mul(79.0).add(p.mul(0.13)))
				.mul(sin(n.y.mul(83.0).sub(p.mul(0.11))))
				.mul(sin(n.z.mul(71.0).add(p.mul(0.15))))
				.mul(0.25)
		);
		return g.mul(0.5714);
	});

	const relief = Fn(([n]) => {
		const f = waveField(n);
		const d = select(f.greaterThan(0.0), f.mul(u.uLobe), f.mul(u.uFurrow));
		return d.add(u.uChop.mul(splash(n)));
	});

	mat.fragmentNode = Fn(() => {
		const n = normalize(vLocal);
		const amp = max(max(u.uLobe, u.uFurrow), u.uChop);
		const f = relief(n).div(max(amp, 0.001));

		const lit = smoothstep(0.04, 0.86, f);
		const crest = smoothstep(0.74, 1.06, f);
		const dip = smoothstep(0.05, 0.6, f.negate());
		const bands = rule(f.mul(5.0), 0.055);
		const node = smoothstep(0.0, 0.045, abs(f)).oneMinus();

		const col = vec3(u.uInk).toVar();
		const g = grain(n);
		const chaos = u.uGrain.mul(wild(n));
		col.addAssign(
			u.uWave
				.mul(rule(g.mul(5.0), 0.075))
				.mul(0.5)
				.mul(chaos)
		);
		col.addAssign(u.uWave.mul(g.mul(0.5).add(0.5)).mul(0.025).mul(chaos));
		col.assign(mix(col, u.uWave, lit.mul(0.42).mul(u.uGlow)));
		col.assign(mix(col, u.uHot, crest.mul(0.34).mul(u.uGlow)));
		col.addAssign(u.uWave.mul(dip).mul(0.07).mul(u.uGlow));
		col.addAssign(u.uWave.mul(bands).mul(0.3).mul(u.uGlow));
		col.addAssign(u.uHot.mul(node).mul(0.75).mul(u.uGlow));

		const rimT = pow(abs(dot(normalize(vN), normalize(vV))).oneMinus(), u.uRimPower);
		col.addAssign(u.uRim.mul(rimT).mul(u.uRimGain));

		// Straight colour: the material premultiplies (premultipliedAlpha).
		return vec4(col, u.uOpacity);
	})();
	return mat;
}
