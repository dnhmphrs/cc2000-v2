import * as THREE from 'three';
import { CIRCUMRADIUS } from '../geometry/icosahedron';

// ── Ink ──────────────────────────────────────────────────────────────────────
// The one material every line in the second half of the run is drawn with, and
// the two helpers that feed it. Shared by world/lattice.js (the solid) and
// world/construction.js (the conception's three variants), which is why it is
// its own file rather than living in either of them.
//
// Lines that draw themselves ON. `aT` runs 0→1 along each stroke and `aDelay`
// staggers when each one is allowed to start, so a figure can spread out of a
// point instead of switching on all at once.
//
// The lines also carry their own DEPTH. Thirty edges all drawn at one weight is
// a flat tangle — there is no way to tell which corner is nearest — so each
// fragment fades toward uBack as it goes away from the camera. That is the
// whole 3D read: no fill, no hidden-line removal, every edge still there, but
// the near ones come forward and the shape resolves. It is also live, so the
// object turning in the computation reads as turning rather than as a flicker.
// ── A NOTE ON COLOUR, and it applies to every custom shader in the site ──────
// three.js only applies the renderer's outputEncoding to shaders that include
// <encodings_fragment>, and a ShaderMaterial's fragment source is used exactly
// as written. So NOTHING here is re-encoded on the way out: a colour handed to
// one of these materials is the colour that lands on the screen, and running it
// through convertSRGBToLinear() first — as the built-in materials need — simply
// renders it a full gamma stop too dark.
//
// Stock materials are the other way round (theme.js ink() converts for them),
// which is why the same gold looked like two different colours when the frame
// and the drafting were drawn with different kinds of material.
export function growLineMaterial(color, opacity = 1) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		uniforms: {
			uColor: { value: new THREE.Color(color) },
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
			uniform vec3 uColor;
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
				// Additive, so it is premultiplied: gold on the void adds light
				// rather than covering it, and crossing lines brighten where they
				// cross — which is the whole look of a drawing made of light.
				gl_FragColor = vec4(uColor * a, a);
			}
		`
	});
}

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
// band never drawn at all — which is exactly how a staggered frame ends up
// permanently unfinished. Each grower therefore runs its uniform out to the
// reach its own delays actually need, and takes a plain 0..1 from the caller.
export function grower(mat, spread) {
	const reach = spread + mat.uniforms.uSpan.value;
	return (v) => (mat.uniforms.uGrow.value = v * reach);
}

// ── A stroke ─────────────────────────────────────────────────────────────────
// A polyline that draws itself on END TO END rather than every segment at once:
// aT is the fraction of the whole path travelled, so setting uGrow sweeps a pen
// along it. This is what a compass draws with, and what every construction in
// world/construction.js is made of.
//
// Returns a LineSegments (one pair per step, so a broken path is legal) whose
// material's uGrow runs 0..uSpan — call the returned grower with a plain 0..1.
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
