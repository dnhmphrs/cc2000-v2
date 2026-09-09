import * as THREE from 'three';
import { EGG } from '$lib/config';
import {
	skinMaterial,
	coreMaterial,
	lineMaterial,
	segmentAttributes,
	loopPositions,
	ring
} from './materials';

// ── The ovum ─────────────────────────────────────────────────────────────────
// TWO SPHERES, and that is the whole of why it reads as an ovum rather than as
// a ball of wire.
//
//   THE CORE    an opaque dark body, well inside, that OCCLUDES. A wireframe
//               globe on its own is a scribble — the near lines and the far
//               lines are the same lines and the eye cannot separate them — and
//               the instant something solid is sitting behind the front half,
//               the cage has an inside and an outside. V1 did exactly this with
//               a toon sphere at 14 inside a transparent one at 22, and it is
//               the single thing every version since has dropped.
//
//               It also carries the WAVE. See world/materials.js coreMaterial():
//               the impact runs across it as travelling wavefronts and relaxes
//               into the lowest icosahedrally-symmetric standing wave a sphere
//               has, whose twelve antinodes are the twelve vertices. That is the
//               conception, and it happens on this surface.
//
//   THE SHELL   the cage: meridians and parallels in a held-back gold, three
//               bright gold great circles cutting it in the three coordinate
//               planes, and a silhouette.
//
// The three great circles are not decoration. They are the three mutually
// perpendicular planes the whole second half of the run is built on — the same
// three the golden rectangles lie in — so the thing being swum at is already
// carrying the figure it is about to become. Nothing says so; it is just there.
//
// Nothing is lit, here or anywhere (see world/materials.js). A shaded sphere
// would need matching lamps in two very different scenes and would STILL differ
// between a perspective and an orthographic camera. Both rims are view-space
// silhouettes, which are identical under either — which is why the fly-in's core
// and the void's gold circle can be the same material with the same numbers, and
// therefore why the fly-in can hand the conception its last frame unchanged.
//
// Sizes are in config/space.js; colour in config/palette.js.

// A lat/long cage. Meridians and parallels, one LineSegments, and deliberately
// coarse: this is a wireframe, not a mesh, and every extra line is one more
// thing between you and the shape.
function cage(radius, meridians, parallels, segments = 72) {
	const pos = [];
	const X = new THREE.Vector3(1, 0, 0);
	const Y = new THREE.Vector3(0, 1, 0);
	const Z = new THREE.Vector3(0, 0, 1);

	// Parallels: circles of latitude, poles excluded.
	for (let i = 1; i <= parallels; i++) {
		const lat = (i / (parallels + 1) - 0.5) * Math.PI;
		const r = Math.cos(lat) * radius;
		const centre = Y.clone().multiplyScalar(Math.sin(lat) * radius);
		pos.push(
			...loopPositions(
				ring(X.clone().multiplyScalar(r), Z.clone().multiplyScalar(r), segments, centre)
			)
		);
	}

	// Meridians. Each is a whole great circle through the poles, so half the
	// number of loops covers the sphere.
	for (let m = 0; m < meridians; m++) {
		const a = (m / meridians) * Math.PI;
		const u = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(radius);
		pos.push(...loopPositions(ring(u, Y.clone().multiplyScalar(radius), segments)));
	}

	return pos;
}

// The three great circles in the three coordinate planes.
function greatCircles(radius, segments = 128) {
	const planes = [
		[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)],
		[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)],
		[new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)]
	];
	const pos = [];
	planes.forEach(([u, v]) =>
		pos.push(
			...loopPositions(
				ring(u.clone().multiplyScalar(radius), v.clone().multiplyScalar(radius), segments)
			)
		)
	);
	return pos;
}

// `opts.wire`  build the cage and the three great circles (default true)
// `opts.outer` build the outer silhouette          (default true)
// `opts.core`  the inner sphere, as a FRACTION of `radius`. 0 for none.
//
// The void wants { wire: false, outer: false, core: 1 }: a gold circle with the
// icosahedron drawn inside it, and a body behind it for the wave to run on.
export function createEgg(radius, opts = {}) {
	const wantWire = opts.wire !== false;
	const wantOuter = opts.outer !== false;
	const coreRatio = opts.core ?? 0;

	const ink = opts.ink ?? EGG.skin;
	const accent = opts.accent ?? EGG.rim;
	const power = opts.power ?? EGG.rimPower;

	const group = new THREE.Group();
	const mats = [];
	const geos = [];

	const keep = (m) => (mats.push(m), m);

	// ── The outer silhouette ─────────────────────────────────────────────────
	// Additive and with no body at all: what occludes in this object is the core,
	// and an outer shell with any fill in it is a bag over the thing inside.
	let outerMat = null;
	let outer = null;
	if (wantOuter) {
		outerMat = keep(skinMaterial({ ink, accent, power, base: 0, add: true }));
		outer = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 40), outerMat);
		outer.renderOrder = 3;
		group.add(outer);
		geos.push(outer.geometry);
	}

	// ── The cage ─────────────────────────────────────────────────────────────
	let wireMat = null;
	let goldMat = null;
	let wire = null;
	let gold = null;

	if (wantWire) {
		const build = (positions, material, order) => {
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
			segmentAttributes(geo, positions.length / 6, () => 0);
			const line = new THREE.LineSegments(geo, material);
			line.renderOrder = order;
			group.add(line);
			mats.push(material);
			geos.push(geo);
			return line;
		};

		wireMat = lineMaterial(EGG.wire, 0);
		// A globe is as much its far side as its near side, so the cage keeps far
		// more of itself at the back than the icosahedron's edges do. A sphere
		// whose far half has gone is a bowl — and with the core in place, the far
		// half is hidden by something rather than merely faded, which is the
		// difference between depth and haze.
		wireMat.uniforms.uBack.value = 0.4;
		wireMat.uniforms.uRadius.value = radius;
		wireMat.uniforms.uGrow.value = wireMat.uniforms.uSpan.value;
		wire = build(cage(radius, EGG.meridians, EGG.parallels), wireMat, 2);

		goldMat = lineMaterial(EGG.rings, 0);
		goldMat.uniforms.uBack.value = 0.45;
		goldMat.uniforms.uRadius.value = radius;
		goldMat.uniforms.uGrow.value = goldMat.uniforms.uSpan.value;
		gold = build(greatCircles(radius), goldMat, 2);
	}

	// ── The core ─────────────────────────────────────────────────────────────
	// A body and a rim, and the rim is built from exactly the numbers the void's
	// gold circle is built from, so the two are the same drawing.
	let coreMat = null;
	let coreRimMat = null;
	let body = null;
	let rim = null;
	const coreHolder = new THREE.Group();
	group.add(coreHolder);

	if (coreRatio > 0) {
		coreMat = keep(
			coreMaterial({
				ink: EGG.core,
				wave: EGG.wave,
				hot: EGG.waveHot,
				rim: EGG.coreRim,
				rimPower: EGG.coreRimPower
			})
		);
		// Built at unit radius and scaled by the holder, so the core's size is a
		// live number the fly-in can hold against the void's framing every frame.
		body = new THREE.Mesh(new THREE.SphereGeometry(0.992, 128, 80), coreMat);
		body.renderOrder = 0;
		coreHolder.add(body);
		geos.push(body.geometry);

		coreRimMat = keep(
			skinMaterial({ ink: EGG.coreRim, accent: EGG.coreHot, power: 8, base: 0, add: true })
		);
		rim = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 60), coreRimMat);
		rim.renderOrder = 1;
		coreHolder.add(rim);
		geos.push(rim.geometry);

		coreHolder.scale.setScalar(radius * coreRatio);
	}

	// Which silhouette is the OUTERMOST one this object has. setShell() drives
	// it, so a caller never has to know whether the thing it is looking at has a
	// cage round it or is a bare sphere.
	const shellMat = outerMat ?? coreRimMat;

	return {
		group,
		core: coreHolder,
		radius,

		// 0..1 — the globe's line-work, which is what it is actually made of.
		setWire(o) {
			if (!wireMat) return;
			wireMat.uniforms.uOpacity.value = o;
			goldMat.uniforms.uOpacity.value = o * EGG.ringGain;
			wire.visible = o > 0.004;
			gold.visible = o > 0.004;
		},

		// 0..1 — the outermost silhouette. Above 1 is legal: it is additive.
		setShell(o) {
			if (!shellMat) return;
			shellMat.uniforms.uOpacity.value = o;
			const mesh = outer ?? rim;
			mesh.visible = o > 0.004;
		},

		// 0..1 — the core's body. It writes depth, so at zero it is switched off
		// outright rather than merely faded: an invisible occluder is still an
		// occluder, and in the void it would swallow the icosahedron whole.
		// `occlude` overrides the depth-write rule. Left null it is the old
		// behaviour — write depth once actually opaque, because a part-faded
		// occluder is the worst of both: it hides what is behind it while you can
		// still see through it. That is right in the fly-in, where this body is
		// what gives the cage an inside and an outside.
		//
		// It is WRONG in the void, where the icosahedron is built inside this
		// sphere. Every edge is a chord and therefore inside the surface, so
		// while the body occludes there is nothing to see however far the frame
		// has drawn itself — and when the threshold is finally crossed a beat's
		// worth of line-work appears in one frame. Tying opacity and occlusion
		// together also makes them impossible to ask for separately, and this
		// scene wants exactly that: a body at full weight that does not hide what
		// is inside it.
		setCore(o, occlude = null) {
			if (!coreMat) return;
			coreMat.uniforms.uOpacity.value = o;
			body.visible = o > 0.004;
			coreMat.depthWrite = occlude === null ? o > 0.85 : occlude;
		},

		// The core's own rim, when it is not the outermost thing — i.e. in the
		// fly-in, where the cage is outside it. In the void this IS setShell.
		setCoreRim(o) {
			if (!coreRimMat || coreRimMat === shellMat) return;
			coreRimMat.uniforms.uOpacity.value = o;
			rim.visible = o > 0.004;
		},

		// `chop` is the unresolved ringing the division comes out of — every other
		// mode of a struck sphere, damped away as the icosahedral one wins.
		// `grain` is the body's own mottle, which belongs to the APPROACH and is
		// gone before the wave arrives.
		//
		// The wave, and the division on it. All six five-fold axes are always in
		// — the field is the whole icosahedral invariant or it is nothing — and
		// what develops is the CLEAVAGE: `furrow` (0..1) cuts the nodal net into
		// the skin and `lobe` (0..1) swells the twelve caps out of it, in that
		// order. `glow` is how brightly the field is drawn, `amp` how far it moves
		// the skin as a fraction of the core's radius, and `ring` the amplitude of
		// the mode's own oscillation as it settles.
		setWave({
			furrow = 0,
			lobe = 0,
			chop = 0,
			grain = 0,
			glow = 0,
			amp = 0,
			ring = 0,
			phase = null
		} = {}) {
			if (!coreMat) return;
			const u = coreMat.uniforms;
			u.uFurrow.value = furrow;
			u.uLobe.value = lobe;
			u.uChop.value = chop;
			u.uGrain.value = grain;
			u.uGlow.value = glow;
			u.uAmp.value = amp;
			u.uRing.value = ring;
			if (phase !== null) u.uPhase.value = phase;
		},

		// The core's size as a fraction of the shell's. The fly-in writes this
		// every frame from the void's own framing, which is what makes the two
		// scenes hand over without a cut.
		setCoreRatio(k) {
			coreHolder.scale.setScalar(radius * k);
		},

		// How hard the core's rim burns, for the union. The rim is additive, so
		// above 1 simply means more light.
		setCoreRimGain(g) {
			if (coreMat) coreMat.uniforms.uRimGain.value = g;
		},

		dispose() {
			geos.forEach((g) => g.dispose());
			mats.forEach((m) => m.dispose());
		}
	};
}
