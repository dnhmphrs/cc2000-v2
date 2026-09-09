import * as THREE from 'three';
import { CIRCUMRADIUS, VERTICES } from '../geometry/icosahedron';

// ── Materials ────────────────────────────────────────────────────────────────
// Everything in the 3D is drawn with FIVE materials and no lights at all. This
// file is all five of them, and the vocabulary they share.
//
// The site is the inside of a machine. Nothing in it is a photograph of a thing;
// it is a thing being DISPLAYED by an instrument — so nothing is shaded, nothing
// is glossy, and the only difference between one surface and another is how it
// is being drawn. Two colours do the whole job: an ink and an accent.
//
// ── The shared uniforms ──────────────────────────────────────────────────────
//   uInk        vec3    the body colour
//   uAccent     vec3    what it goes to at the silhouette, or at a crossing
//   uOpacity    float   0..1 — and ABOVE 1 on the additive ones, where more
//                       than full simply means more light
//   uTime       float   seconds, for the one thing in each that crawls
//   uFogColor   vec3    the air it is in. scene.fog does not reach a
//   uFogDensity float   ShaderMaterial, so anything in fogged air applies the
//                       same exponential by hand or it is the one object
//                       ignoring the weather
//
// ── Two blend modes, and the choice is not stylistic ─────────────────────────
//   ADD    for anything made of LIGHT on a dark ground — every line, the wire
//          globe, the hologram. Crossings brighten where they cross, which is
//          the whole look of a drawing made of light, and an opacity above 1
//          means something.
//   OVER   for anything that is a SURFACE, and surfaces occlude.
//
// ── Two things three.js will not do for you ─────────────────────────────────
//   PREMULTIPLY. The canvas is premultiplied, so OVER is (ONE,
//   ONE_MINUS_SRC_ALPHA) and a shader handing back straight colour paints at
//   full strength whatever its alpha says. three.js does this for its own
//   materials in <premultiplied_alpha_fragment>; ours do it themselves.
//
//   ENCODING. outputEncoding is applied by <encodings_fragment>, and a
//   ShaderMaterial's source is used exactly as written — so a colour handed to
//   anything here is the colour that lands on screen, and convertSRGBToLinear()
//   would only render it a full gamma stop too dark. Stock materials are the
//   opposite case, which is what theme.js ink() is for.

// Premultiplied additive. Not THREE.AdditiveBlending, which is
// (SRC_ALPHA, ONE) and would multiply by alpha a second time.
export const ADD = {
	blending: THREE.CustomBlending,
	blendSrc: THREE.OneFactor,
	blendDst: THREE.OneFactor,
	blendEquation: THREE.AddEquation
};

// The exponential the whole fly-in is fogged by, as GLSL. Identical to
// THREE.FogExp2 so a hand-fogged material and a stock one agree.
const FOG = `
	uniform vec3 uFogColor;
	uniform float uFogDensity;
	float fogAt(float d) { return 1.0 - exp(-uFogDensity * uFogDensity * d * d); }
`;

const fogUniforms = (color, density) => ({
	uFogColor: { value: new THREE.Color(color) },
	uFogDensity: { value: density }
});

// ── 1. The line ──────────────────────────────────────────────────────────────
// Lines that draw themselves ON. `aT` runs 0→1 along each stroke and `aDelay`
// staggers when each one is allowed to start, so a figure can spread out of a
// point instead of switching on all at once.
//
// They also carry their own DEPTH. Thirty edges at one weight is a flat tangle
// — there is no way to tell which corner is nearest — so each fragment fades
// toward uBack as it goes away from the camera. That is the whole 3D read: no
// fill, no hidden-line removal, every edge still there, but the near ones come
// forward and the shape resolves. It is live, so a solid turning reads as
// turning rather than as a flicker.
export function lineMaterial(color, opacity = 1) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		...ADD,
		uniforms: {
			uInk: { value: new THREE.Color(color) },
			uGrow: { value: 0 },
			uSpan: { value: 0.4 },
			uOpacity: { value: opacity },
			// Half-depth of the object, so vFront lands on ±1 at its poles.
			uRadius: { value: CIRCUMRADIUS },
			// What is left of a line at the very back.
			uBack: { value: 0.22 }
		},
		vertexShader: `
			attribute float aT;
			attribute float aDelay;
			uniform float uRadius;
			varying float vT;
			varying float vDelay;
			varying float vFront;
			void main() {
				vT = aT;
				vDelay = aDelay;
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				// Depth measured from the object's OWN centre, not the camera's,
				// so it does not change when the camera dollies or the frustum
				// closes on the way home. +1 nearest, -1 furthest.
				vec4 centre = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
				vFront = clamp((mv.z - centre.z) / uRadius, -1.0, 1.0);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform vec3 uInk;
			uniform float uGrow;
			uniform float uSpan;
			uniform float uOpacity;
			uniform float uBack;
			varying float vT;
			varying float vDelay;
			varying float vFront;
			void main() {
				float local = clamp((uGrow - vDelay) / max(uSpan, 0.0001), 0.0, 1.0);
				if (vT > local) discard;
				float a = uOpacity * mix(uBack, 1.0, vFront * 0.5 + 0.5);
				gl_FragColor = vec4(uInk * a, a);
			}
		`
	});
}

// ── 2. The hologram ──────────────────────────────────────────────────────────
// A body being SCANNED rather than lit: the mesh is barely there, and what you
// actually see is the CONTOUR SET drawn on it — rings around the body and
// stripes along it, in the model's own coordinates, so they turn with it and
// wrap round the far side.
//
// It is a wireframe drawn on a surface rather than the surface's own wireframe,
// and that is the whole point: three's `wireframe: true` gives you the mesh's
// topology, and this mesh is nine thousand triangles of thin tube, which renders
// as a solid white ribbon. Contours put the density in our hands — uRings and
// uLongs are how many lines there are, not how many triangles the artist used.
//
// `uAxis` and `uCentre` are the body's own long axis and midpoint in GEOMETRY
// space, so `s` below is distance along the animal and the rings are square to
// it however the file happens to be oriented.
export function holoMaterial({ ink, accent, fog, fogDensity, rings, longs, gain = 1 }) {
	return new THREE.ShaderMaterial({
		transparent: true,
		side: THREE.DoubleSide,
		depthWrite: false,
		...ADD,
		uniforms: {
			uInk: { value: new THREE.Color(ink) },
			uAccent: { value: new THREE.Color(accent) },
			uOpacity: { value: 0 },
			uGain: { value: gain },
			uTime: { value: 0 },
			uAxis: { value: new THREE.Vector3(0, 0, 1) },
			uSide: { value: new THREE.Vector3(1, 0, 0) },
			uUp: { value: new THREE.Vector3(0, 1, 0) },
			uCentre: { value: new THREE.Vector3() },
			uRings: { value: rings },
			uLongs: { value: longs },
			...fogUniforms(fog, fogDensity)
		},
		vertexShader: `
			varying vec3 vN;
			varying vec3 vView;
			varying vec3 vLocal;
			varying float vDepth;
			void main() {
				vLocal = position;
				vec4 wp = modelMatrix * vec4(position, 1.0);
				vN = normalize(normalMatrix * normal);
				vView = normalize(cameraPosition - wp.xyz);
				vec4 mv = viewMatrix * wp;
				vDepth = -mv.z;
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			${FOG}
			uniform vec3 uInk;
			uniform vec3 uAccent;
			uniform float uOpacity;
			uniform float uGain;
			uniform float uTime;
			uniform vec3 uAxis;
			uniform vec3 uSide;
			uniform vec3 uUp;
			uniform vec3 uCentre;
			uniform float uRings;
			uniform float uLongs;
			varying vec3 vN;
			varying vec3 vView;
			varying vec3 vLocal;
			varying float vDepth;

			// A line wherever x is near a whole number. fwidth() is not guaranteed
			// in GLSL ES 1.00 without an extension, so the width is a constant in
			// cell units — which is what we want anyway: a fixed number of lines,
			// not a fixed number of pixels.
			float rule(float x, float w) {
				float f = fract(x);
				return 1.0 - smoothstep(0.0, w, min(f, 1.0 - f));
			}

			void main() {
				vec3 d = vLocal - uCentre;
				// Along the body, and around it.
				float s = dot(d, uAxis);
				float a = atan(dot(d, uUp), dot(d, uSide)) / 6.2831853;

				// Wide bands, not hairlines. The tail is a tight curl, so a contour
				// set cut by a straight axis crowds up where it turns; narrow lines
				// there alias into a stipple that crawls. Wide ones read as bands.
				float ring = rule(s * uRings, 0.2);
				float longi = rule(a * uLongs, 0.14);
				float rim = pow(1.0 - abs(dot(normalize(vN), vView)), 2.0);

				// One band travelling the length of the animal. It is the only clock
				// on the thing and it is what says it is being READ, not lit.
				float band = sin(s * 3.0 - uTime * 2.2) * 0.5 + 0.5;
				band = smoothstep(0.55, 1.0, band);

				// The stripes are held well back: they wrap a tail two pixels wide,
				// where any line family aliases into a crawl.
				//
				// The CONTOURS carry it, not the rim. A fresnel-led body is a white
				// ghost whatever colour you give it — the rim term is where all the
				// brightness is and it is achromatic — and this is meant to be the
				// one cold thing in a gold scene, so the wire is up and the rim is
				// down and the colour survives.
				float wire = max(ring, longi * 0.35);
				float alpha = (0.04 + wire * 0.42 + rim * 0.34 + band * wire * 0.45) * uOpacity * uGain;
				vec3 col = mix(uInk, uAccent, rim * 0.3 + band * 0.3);

				float f = fogAt(vDepth);
				col = mix(col, uFogColor, f);
				alpha *= 1.0 - f * 0.94;
				gl_FragColor = vec4(col * alpha, alpha);
			}
		`
	});
}

// ── 3. The skin ──────────────────────────────────────────────────────────────
// A silhouette, and only a silhouette.
//
// AGAINST THE VIEW RAY, not the view axis, and the difference is not academic.
// `1 - |n.z|` in view space is the edge of a shape only under an ORTHOGRAPHIC
// camera, where every ray is the axis. On a lens the silhouette is the tangent
// cone, and its normal is tilted away from the axis by asin(R/d) — sixteen
// degrees on the fly-in's ovum. At the eighth power that turns a term which
// should be 1.0 at the edge into 0.07, which is exactly why the fly-in's gold
// rim was invisible while the void's, on a much longer lens, was merely dim.
//
// Against the ray it is 1.0 at the silhouette under any projection, which is
// what lets the fly-in's core and the void's circle be the same drawing.
//
// `base` is how much body it has inside that edge. On the void it is ZERO — a
// gold circle and nothing else — because any body at all is a grey wash over
// black. In the air it is a few percent, so the globe occludes what is behind
// it. Front faces only: drawing both hemispheres double-blends at the
// silhouette, where the geometry is edge-on, and bands there.
export function skinMaterial({ ink, accent, power = 3, base = 0, add = false }) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: THREE.FrontSide,
		...(add ? ADD : {}),
		uniforms: {
			uInk: { value: new THREE.Color(ink) },
			uAccent: { value: new THREE.Color(accent) },
			uPower: { value: power },
			uBase: { value: base },
			uOpacity: { value: 1 }
		},
		vertexShader: `
			varying vec3 vN;
			varying vec3 vV;
			void main() {
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				vN = normalize(normalMatrix * normal);
				// The ray from the surface back to the lens, in view space.
				vV = normalize(-mv.xyz);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform vec3 uInk;
			uniform vec3 uAccent;
			uniform float uPower;
			uniform float uBase;
			uniform float uOpacity;
			varying vec3 vN;
			varying vec3 vV;
			void main() {
				float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
				float a = (uBase + f * (1.0 - uBase)) * uOpacity;
				gl_FragColor = vec4(mix(uInk, uAccent, f) * a, a);
			}
		`
	});
}

// ── 4. The point ─────────────────────────────────────────────────────────────
// A hard little core in a soft halo. A drawn point, not a blur.
export function dotMaterial(color, size) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		...ADD,
		uniforms: {
			uInk: { value: new THREE.Color(color) },
			uOpacity: { value: 0 },
			uSize: { value: size }
		},
		vertexShader: `
			uniform float uSize;
			void main() {
				gl_PointSize = uSize;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform vec3 uInk;
			uniform float uOpacity;
			void main() {
				vec2 d = gl_PointCoord - 0.5;
				float r = length(d) * 2.0;
				float a = (exp(-r * r * 4.0) * 0.5 + (1.0 - smoothstep(0.2, 0.32, r)) * 0.95) * uOpacity;
				gl_FragColor = vec4(uInk * a, a);
			}
		`
	});
}

// ── 5. The core ──────────────────────────────────────────────────────────────
// The ovum's inner sphere, and the only OPAQUE thing in the whole site.
//
// It has two jobs. The first is structural: it is what makes the ovum read as an
// ovum instead of as a ball of wire. A wireframe globe on its own is a scribble
// — near lines and far lines are the same lines — and V1 solved that with two
// spheres, an opaque inner one inside a transparent outer one. This is the inner
// one. It occludes the cage's far half, and the moment it does, the cage has an
// inside and an outside.
//
// ── The second job is the conception ─────────────────────────────────────────
// It carries a standing wave, and the body DIVIDES on it.
//
// The field is
//
//     f(n) = Σ P₆(n · aᵢ)
//
// over the six five-fold axes of the icosahedron — the axes through opposite
// vertices — with P₆ the sixth Legendre polynomial. Degree 6 is the FIRST degree
// at which a non-constant icosahedral invariant exists at all: the degree-2 and
// degree-4 sums vanish identically. So this is not a pattern chosen to look
// icosahedral, it is the only thing of its kind there is, and its twelve
// antinodes are the twelve vertices.
//
// ALL SIX AXES ARE ALWAYS IN. They used to arrive one at a time — one axis two
// antinodes, two axes four, six axes twelve — which is a lovely idea on paper
// and on screen is a sphere that spends its first second as a dumbbell, then a
// clover, and only becomes the answer at the end. Two blobs, then twelve. The
// figure is the whole field or it is nothing, so the field is complete from the
// first frame and what develops is the DIVISION, not the symmetry.
//
// ── The division ────────────────────────────────────────────────────────────
// The two halves of the field are driven separately, and the furrow LEADS:
//
//   uFurrow   the negative half, where the field dips. That set is the nodal
//             net between the twelve caps, and pulling the skin IN along it
//             scores the sphere into twelve — a cleavage furrow, cut.
//   uLobe     the positive half. The twelve caps swell out of the net that has
//             already been cut around them.
//
// That is the order a cell actually divides in: the furrow constricts first and
// the daughters round up out of it. Driving both together is a ball growing
// bumps; driving the furrow first is a body dividing.
//
// It is normalised by its own exact peak. At a vertex one axis reads 1 and the
// other five read P₆(1/√5) = 0.328, so the sum tops out at 1 + 5(0.328) = 2.64.
//
// uRing is the mode RINGING — a standing oscillation at the mode's own
// frequency, damped out as it settles. That is the ripple, and it is the honest
// one: an excited normal mode relaxing, not a texture scrolling.
//
// The field is evaluated twice — once per vertex to displace the surface, once
// per fragment to draw on it — because a wave you can only see is a texture and
// a wave that moves the skin is a wave.
const FIVE_FOLD = (() => {
	const out = [];
	VERTICES.forEach((v) => {
		const u = new THREE.Vector3(...v).normalize();
		// One of each antipodal pair. The invariant is even, so the sign is free.
		if (!out.some((w) => Math.abs(w.dot(u)) > 0.999)) out.push(u);
	});
	return out; // six of them
})();

const WAVE_FIELD = `
	uniform vec3 uAxes[6];
	uniform float uRing;
	uniform float uPhase;
	uniform float uChop;
	uniform float uFurrow;
	uniform float uLobe;

	float waveField(vec3 n) {
		float h = 0.0;
		for (int i = 0; i < 6; i++) {
			float x = dot(n, uAxes[i]);
			float x2 = x * x;
			float x4 = x2 * x2;
			h += (231.0 * x4 * x2 - 315.0 * x4 + 105.0 * x2 - 5.0) / 16.0;
		}
		// The exact peak: one axis reads 1 at a vertex and the other five read
		// P6(1/sqrt5) = 0.328, so the sum tops out at 1 + 5(0.328).
		h /= 2.64;
		// And the mode rings as it settles.
		return h * (1.0 + uRing * sin(uPhase * 5.5));
	}

	// ── EVERYTHING ELSE ──────────────────────────────────────────────────────
	// A struck sphere does not ring in one mode. It rings in all of them at once
	// and the high ones damp fastest, and what is left at the end is the lowest
	// symmetric mode there is. waveField() above is that end state. This is the
	// mess it comes out of: three travelling wavefronts on incommensurate axes,
	// going nowhere in particular, at frequencies that share no common period so
	// the surface never repeats.
	//
	// Without it the body simply arrives at the twelve, which is an answer with
	// no working. With it the skin churns first and the icosahedron RESOLVES out
	// of the churn, which is the whole difference between a shape appearing and
	// a body dividing.
	float chop(vec3 n) {
		float s = sin(dot(n, vec3(0.93, 0.29, 0.23)) * 4.3 + uPhase * 2.6);
		s += sin(dot(n, vec3(-0.32, 0.86, 0.39)) * 3.7 - uPhase * 2.1);
		s += sin(dot(n, vec3(0.21, -0.44, 0.87)) * 5.1 + uPhase * 3.3);
		return s * 0.3333;
	}

	// What the skin is actually doing, all in. The two halves of the invariant
	// are on their own clocks — the furrow is cut before the caps come out — and
	// the unresolved ringing is laid over both and damped away as they win.
	//
	// At uChop 0 with both halves in, this IS waveField(): the end state is
	// untouched, and every frame before it is on the way there.
	float relief(vec3 n) {
		float f = waveField(n);
		float d = f > 0.0 ? f * uLobe : f * uFurrow;
		return d + uChop * chop(n);
	}
`;

export function coreMaterial({ ink, wave, hot, rim, rimPower = 2.2 }) {
	return new THREE.ShaderMaterial({
		transparent: true,
		// THE ONE OVER-BLENDED SHADER IN THE SITE, and it has to say so. Every
		// other material here is ADD, where the blend factors are given
		// explicitly and this flag is irrelevant. This one takes three.js's
		// NormalBlending, and three.js picks the blend function from
		// material.premultipliedAlpha — which defaults to FALSE, meaning
		// (SRC_ALPHA, ONE_MINUS_SRC_ALPHA). The fragment below already hands back
		// premultiplied colour, as the file header requires, so leaving this
		// unset multiplied the whole surface by alpha a SECOND time: the field
		// landed at a-squared and the conception's own body was drawn at a fifth
		// of the weight the numbers said.
		premultipliedAlpha: true,
		// IT OCCLUDES. That is the point of it, and it is the one material in the
		// site that writes depth: the cage's far half has to go behind something.
		depthWrite: true,
		side: THREE.FrontSide,
		uniforms: {
			uInk: { value: new THREE.Color(ink) },
			uWave: { value: new THREE.Color(wave) },
			uHot: { value: new THREE.Color(hot) },
			uRim: { value: new THREE.Color(rim) },
			uRimPower: { value: rimPower },
			// ZERO by default. The visible gold rim on this object is a separate
			// additive silhouette (world/egg.js) — the same material the void draws
			// its circle with, which is why the two scenes match — and drawing a
			// second one here would double it. This one is a live overdrive, for
			// the moment the swimmer goes in.
			uRimGain: { value: 0 },
			uOpacity: { value: 0 },
			// How brightly the field is drawn, and how far it moves the skin.
			uGlow: { value: 0 },
			uAmp: { value: 0 },
			uAxes: { value: FIVE_FOLD.map((v) => v.clone()) },
			// The division. 0..1 each, and the furrow leads the lobe.
			uFurrow: { value: 0 },
			uLobe: { value: 0 },
			// The unresolved ringing the division comes out of.
			uChop: { value: 0 },
			uRing: { value: 0 },
			uPhase: { value: 0 }
		},
		vertexShader: `
			${WAVE_FIELD}
			uniform float uAmp;
			varying vec3 vN;
			varying vec3 vV;
			varying vec3 vLocal;
			void main() {
				vLocal = position;
				vec3 n = normalize(position);
				// The skin actually moves, along its own normal, by the relief:
				// the churn first, the furrow cut into it, then the twelve caps
				// out of that.
				vec3 p = position + n * (uAmp * relief(n));
				vec4 mv = modelViewMatrix * vec4(p, 1.0);
				vN = normalize(normalMatrix * n);
				vV = normalize(-mv.xyz);
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			${WAVE_FIELD}
			uniform vec3 uInk;
			uniform vec3 uWave;
			uniform vec3 uHot;
			uniform vec3 uRim;
			uniform float uRimPower;
			uniform float uRimGain;
			uniform float uOpacity;
			uniform float uGlow;
			varying vec3 vN;
			varying vec3 vV;
			varying vec3 vLocal;

			// A line wherever x is near a whole number.
			float rule(float x, float w) {
				float fr = fract(x);
				return 1.0 - smoothstep(0.0, w, min(fr, 1.0 - fr));
			}

			void main() {
				vec3 n = normalize(vLocal);
				// The SAME number the skin is displaced by, so what is drawn and
				// what is moving are one thing rather than two that agree.
				float f = relief(n);

				// It is drawn as a CONTOUR MAP, not as a shaded ball. The fill is
				// held right back — a gold sphere is a bauble and this is a readout
				// — and what carries the shape is the line-work on it:
				//
				//   the LEVEL SETS   every fifth of the field's range, which is what
				//                    an instrument would actually draw.
				//   the NODAL SET    where the field is zero. On the standing wave
				//                    that is the curve system separating the twelve
				//                    antinodes, and it is the figure itself.
				float lit = smoothstep(0.04, 0.86, f);
				float crest = smoothstep(0.74, 1.06, f);
				float dip = smoothstep(0.05, 0.6, -f);
				float bands = rule(f * 5.0, 0.055);
				float node = 1.0 - smoothstep(0.0, 0.045, abs(f));

				// No separate gating on the two halves any more — relief() already
				// carries them, so the contours ARE the churn early on and the
				// icosahedral net once it has resolved, without the drawing and
				// the displacement being told the same story twice.
				vec3 col = uInk;
				col = mix(col, uWave, lit * 0.42 * uGlow);
				col = mix(col, uHot, crest * 0.34 * uGlow);
				col += uWave * dip * 0.07 * uGlow;
				col += uWave * bands * 0.3 * uGlow;
				col += uHot * node * 0.75 * uGlow;

				// And the rim — against the RAY, for the reason skinMaterial gives.
				float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uRimPower);
				col += uRim * rim * uRimGain;

				float a = uOpacity;
				gl_FragColor = vec4(col * a, a);
			}
		`
	});
}

// ── Strokes ──────────────────────────────────────────────────────────────────
// The geometry side of lineMaterial: how a figure is cut up so it can draw
// itself on.

// Per-segment attributes for a flat [x,y,z, x,y,z, ...] pair list.
//
// `aDelay` is NORMALISED here to exactly 0..1 — 0 starts with the build, 1
// starts last — whatever scale delayOf() happens to return. The growers below
// depend on that range being exactly this, and returning `spread` is how they
// learn it: 1 when the delays vary, 0 when every segment starts together.
//
// `flipOf(i)` swaps which end of a segment is aT=0. That end is the one it
// grows FROM, so it decides the direction each line draws in.
export function segmentAttributes(geo, count, delayOf, flipOf = () => false) {
	const raw = Array.from({ length: count }, (_, i) => delayOf(i));
	const lo = Math.min(...raw);
	const range = Math.max(...raw) - lo;
	const spread = range > 1e-6 ? 1 : 0;

	const aT = new Float32Array(count * 2);
	const aDelay = new Float32Array(count * 2);
	for (let i = 0; i < count; i++) {
		const flip = flipOf(i);
		aT[i * 2] = flip ? 1 : 0;
		aT[i * 2 + 1] = flip ? 0 : 1;
		const d = spread ? (raw[i] - lo) / range : 0;
		aDelay[i * 2] = d;
		aDelay[i * 2 + 1] = d;
	}
	geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
	geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
	return spread;
}

// The clock behind setGrow() and friends.
//
// A segment is only FULLY drawn once uGrow reaches its own delay plus uSpan, so
// a clock that stops at 1 leaves everything late part-drawn and the very last
// band never drawn at all. Each grower therefore runs its uniform out to the
// reach its own delays actually need, and takes a plain 0..1 from the caller.
export function grower(mat, spread) {
	const reach = spread + mat.uniforms.uSpan.value;
	return (v) => (mat.uniforms.uGrow.value = v * reach);
}

// A polyline that draws itself on END TO END rather than every segment at once:
// aT is the fraction of the whole path travelled, so setting uGrow sweeps a pen
// along it. This is what a compass draws with.
//
// Returns a LineSegments (one pair per step, so a broken path is legal) whose
// uGrow runs 0..uSpan — call the returned grower with a plain 0..1.
export function stroke(points, material, closed = false) {
	const pts = closed ? [...points, points[0]] : points;
	const n = pts.length - 1;
	if (n < 1) return null;

	// Arc length, so the pen travels at a constant speed rather than jumping
	// through the short steps and crawling through the long ones.
	const run = [0];
	for (let i = 0; i < n; i++) run.push(run[i] + pts[i].distanceTo(pts[i + 1]));
	const total = run[n] || 1;

	const pos = new Float32Array(n * 6);
	const aT = new Float32Array(n * 2);
	const aDelay = new Float32Array(n * 2);
	for (let i = 0; i < n; i++) {
		pos.set([pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z], i * 6);
		aT[i * 2] = run[i] / total;
		aT[i * 2 + 1] = run[i + 1] / total;
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
	geo.setAttribute('aDelay', new THREE.BufferAttribute(aDelay, 1));
	return new THREE.LineSegments(geo, material);
}

// A circle in a plane, as points. `u` and `v` are the two in-plane axes; the
// radius is their length, so pass them scaled.
export function ring(u, v, segments = 128, centre = new THREE.Vector3()) {
	const pts = [];
	for (let i = 0; i < segments; i++) {
		const a = (i / segments) * Math.PI * 2;
		pts.push(centre.clone().addScaledVector(u, Math.cos(a)).addScaledVector(v, Math.sin(a)));
	}
	return pts;
}

// A closed loop as a flat pair list, ready for LineSegments.
export function loopPositions(points) {
	const out = [];
	for (let i = 0; i < points.length; i++) {
		const a = points[i];
		const b = points[(i + 1) % points.length];
		out.push(a.x, a.y, a.z, b.x, b.y, b.z);
	}
	return out;
}
