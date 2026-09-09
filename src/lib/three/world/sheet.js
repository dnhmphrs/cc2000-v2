import * as THREE from 'three';
import { SHEET } from '$lib/config';

// ── The sheet ────────────────────────────────────────────────────────────────
// A flat ruled grid, hanging in the air behind the ovum, that COMPLEX-
// EXPONENTIATES into a five-petalled rosette and then WRAPS onto the ovum
// itself. It is the one object in the run that is in both halves of it: it
// arrives as the flat paper the fly-in is drawn on and it leaves as the lattice
// the conception's standing wave runs on.
//
// Two maps, in this order, and both of them are the real thing.
//
// ── 1. w = (e^{sz} − 1)/s ────────────────────────────────────────────────────
// The source is a rectangle in the complex plane: x ∈ [−a, a] the log-radius,
// y ∈ [−π, π] the angle, cut into FIVE bands with gaps between them.
//
// At s → 0 the map is the identity — the rectangle, five parallel strips of
// ruled grid. At s = 1 it is the exponential: horizontal lines become rays,
// vertical lines become circles, and the five strips become five petals
// radiating from the middle. `s` runs continuously between the two, so the grid
// does not cut from one to the other, it TURNS into it — every line bending
// through its own logarithmic spiral on the way.
//
// (The −1 and the /s are what make it continuous at zero; without them e^{sz}
// collapses to the constant 1. The scale S below divides out the exponential's
// growth so the figure stays the same size on screen while its shape changes —
// otherwise the whole thing swells by e^a as s runs up and nothing else is
// legible.)
//
// ── 2. The Riemann wrap ──────────────────────────────────────────────────────
// Then the plane closes onto a ball. For a sphere of radius R tangent to the
// plane at the origin, the point at plane-distance d goes to polar angle
//
//     φ = 2·atan(d / 2R)
//
// which is inverse stereographic projection, and it is exactly right for this:
// at R → ∞ it is the identity (the plane), at finite R the sheet wraps round the
// ball, and the far edge of the plane runs toward the far pole and never quite
// gets there. So driving R down from very large to the ovum's own radius closes
// the petals over it — a flower shutting — and the thing they close into is a
// grid ON the sphere, in the same place the wave is about to come up.
//
// One mesh, drawn as a solid dark ground with its ruling on it, so it occludes
// the debris behind it and reads as a surface rather than as line-work floating
// in the air.
//
// Sizes are in config/space.js under SHEET.

const PHI_GAP = 0.36; // radians of gap between petals, in source coordinates

function build() {
	const { petals, along, across, extentX } = SHEET;
	const band = (Math.PI * 2) / petals;
	const pos = [];
	const src = [];
	const idx = [];

	let base = 0;
	for (let p = 0; p < petals; p++) {
		const y0 = -Math.PI + p * band + PHI_GAP / 2;
		const y1 = -Math.PI + (p + 1) * band - PHI_GAP / 2;
		for (let i = 0; i <= along; i++) {
			const x = -extentX + (2 * extentX * i) / along;
			for (let j = 0; j <= across; j++) {
				const y = y0 + ((y1 - y0) * j) / across;
				// Position is unused — the vertex shader builds it from `aSrc` —
				// but three needs one to size the buffer and to not cull the mesh.
				pos.push(0, 0, 0);
				src.push(x, y);
			}
		}
		for (let i = 0; i < along; i++) {
			for (let j = 0; j < across; j++) {
				const a = base + i * (across + 1) + j;
				const b = a + (across + 1);
				idx.push(a, b, a + 1, b, b + 1, a + 1);
			}
		}
		base += (along + 1) * (across + 1);
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	geo.setAttribute('aSrc', new THREE.Float32BufferAttribute(src, 2));
	geo.setIndex(idx);
	// The shader places every vertex, so three cannot know where this ends up.
	geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
	return geo;
}

export function createSheet({ fog, fogDensity, ink, fill, radius }) {
	const geo = build();

	// Everything is a multiple of the ball this closes onto, so the closed sheet
	// is the same picture whatever size that ball is — which is what lets the
	// fly-in hand it to the conception.
	let R = radius;
	let reach = R * SHEET.reachR;
	let far = R * SHEET.farR;
	let close = 0;

	const mat = new THREE.ShaderMaterial({
		transparent: true,
		// Written while it is FLAT — it is then a wall a long way back and it has
		// to occlude the debris streaming past in front of it — and not once it
		// has closed, when it is a shell round the ovum and everything inside it
		// has to read through. setClose() flips both this and the render order.
		depthWrite: true,
		side: THREE.DoubleSide,
		extensions: { derivatives: true },
		uniforms: {
			uInk: { value: new THREE.Color(ink) },
			uFill: { value: new THREE.Color(fill) },
			uOpacity: { value: 0 },
			// 0 = the plane, 1 = its exponential. The petals turning.
			uExp: { value: 0 },
			// The radius the plane is wrapping onto. Huge is flat.
			uWrapR: { value: 1e5 },
			// Where the tangent point sits behind the sphere's centre.
			uTanZ: { value: far },
			// Half-width of the source strip, and how far the figure reaches.
			uA: { value: SHEET.extentX },
			uReach: { value: reach },
			uCells: { value: new THREE.Vector2(SHEET.cellsX, SHEET.cellsY) },
			uFogColor: { value: new THREE.Color(fog) },
			uFogDensity: { value: fogDensity },
			// How much of the weather it takes. Under one: it is a construct the
			// machine is drawing, not matter hanging in the air, and at full fog it
			// simply is not there for the two thirds of the run that matter.
			uFogTake: { value: SHEET.fogTake },
			// How solid the ground between the rules is. Not opaque: once this has
			// closed it is a shell round the ovum, and an opaque one hides the very
			// thing it has just wrapped itself around.
			uFillA: { value: SHEET.fill }
		},
		vertexShader: `
			attribute vec2 aSrc;
			uniform float uExp;
			uniform float uWrapR;
			uniform float uTanZ;
			uniform float uA;
			uniform float uReach;
			varying vec2 vSrc;
			varying float vDepth;
			varying float vRim;

			void main() {
				vSrc = aSrc;

				// 1. w = (e^{sz} - 1)/s, scaled to hold its size as s runs up.
				float s = max(uExp, 0.001);
				float m = exp(s * aSrc.x);
				vec2 w = (vec2(m * cos(s * aSrc.y), m * sin(s * aSrc.y)) - vec2(1.0, 0.0)) / s;
				w *= uReach * s / (exp(s * uA) - 1.0);

				// 2. Inverse stereographic onto a sphere of radius uWrapR, tangent
				// to the plane at the origin. At uWrapR huge this is the plane.
				float d = length(w);
				vec2 dir = d > 1e-5 ? w / d : vec2(1.0, 0.0);
				float phi = 2.0 * atan(d / (2.0 * uWrapR));
				vec3 p = vec3(dir * (uWrapR * sin(phi)), uWrapR * (1.0 - cos(phi)) - uTanZ);

				// How far round the ball this vertex has got. The far side of a
				// closing flower is the part you should not be able to read.
				vRim = phi;

				vec4 mv = modelViewMatrix * vec4(p, 1.0);
				vDepth = -mv.z;
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform vec3 uInk;
			uniform vec3 uFill;
			uniform float uOpacity;
			uniform vec2 uCells;
			uniform vec3 uFogColor;
			uniform float uFogDensity;
			uniform float uFogTake;
			uniform float uFillA;
			varying vec2 vSrc;
			varying float vDepth;
			varying float vRim;

			// A line at every whole multiple of the period, one pixel wide however
			// hard the map is stretching the coordinate at that point — which it is,
			// enormously, because the exponential takes a strip to an annulus.
			// A fixed width in source units would be a hairline at one end of the
			// petal and a band at the other.
			float ruled(float v, float period) {
				float f = fract(v / period);
				float d = min(f, 1.0 - f) * period;
				return 1.0 - smoothstep(0.0, fwidth(v) * 1.1, d);
			}

			void main() {
				float g = max(ruled(vSrc.x, 1.0 / uCells.x), ruled(vSrc.y, 1.0 / uCells.y));

				// The ground, and the ruling on it.
				vec3 col = mix(uFill, uInk, g);
				float a = mix(uFillA, 1.0, g);

				// The FAR side is held back. phi is 0 at the tangent point, which is
				// the pole facing away from you, and pi at the pole facing you — so
				// this dims what has wrapped round the back and leaves the near face
				// at full. Without it a closed flower reads as a wire ball with two
				// of everything.
				a *= mix(0.22, 1.0, smoothstep(0.5, 1.9, vRim));

				float f = (1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth)) * uFogTake;
				col = mix(col, uFogColor, f);
				a *= (1.0 - f) * uOpacity;

				gl_FragColor = vec4(col * a, a);
			}
		`
	});

	const mesh = new THREE.Mesh(geo, mat);
	mesh.frustumCulled = false;
	// Behind everything in the air: the debris and the halo are drawn over it.
	mesh.renderOrder = -3;
	mesh.visible = false;

	return {
		mesh,
		// 0..1 — how far the plane has turned into its own exponential.
		setExp(v) {
			mat.uniforms.uExp.value = v;
		},
		// 0..1 — the close. 0 is the flat plane hanging back in the air; 1 is the
		// sheet wrapped onto a ball of `radius` centred on this object's origin.
		setClose(v) {
			close = v;
			// Flat, it is a wall and it occludes. Closed, it is a shell and the
			// ovum inside it has to be visible through it.
			const wall = v < 0.5;
			mat.depthWrite = wall;
			mesh.renderOrder = wall ? -3 : 4;
			// CURVATURE, not radius: 1/R is what actually moves here. Lerping the
			// radius from ten thousand down to twenty spends nine tenths of the
			// move imperceptibly flat and then snaps shut in the last frame.
			mat.uniforms.uWrapR.value = R / Math.max(v, 0.0001);
			// And the tangent point comes forward with it, so the plane is a long
			// way back in the air when it is flat and is sitting on the ball's own
			// far pole by the time it has closed.
			mat.uniforms.uTanZ.value = far + (R - far) * v;
		},

		// The ovum's core is sized live (it is matched to the next scene's framing
		// every frame — see FlyIn.coreRatio), so this is too.
		setRadius(r) {
			if (Math.abs(r - R) < 1e-4) return;
			R = r;
			reach = R * SHEET.reachR;
			far = R * SHEET.farR;
			mat.uniforms.uReach.value = reach;
			this.setClose(close);
		},
		setOpacity(o) {
			mat.uniforms.uOpacity.value = o;
			mesh.visible = o > 0.004;
		},
		setAir(hex) {
			mat.uniforms.uFogColor.value.set(hex);
		},
		dispose() {
			geo.dispose();
			mat.dispose();
		}
	};
}
