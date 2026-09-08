import * as THREE from 'three';
import { EGG } from '$lib/config';
import { skinMaterial, lineMaterial, segmentAttributes, loopPositions, ring } from './materials';

// ── The ovum ─────────────────────────────────────────────────────────────────
// Not a photograph of a cell. An INSTRUMENT'S PICTURE of one: a wire globe in
// pale blue, three gold great circles cutting it in the three coordinate
// planes, and a skin thin enough to occlude what is behind it and no thicker.
//
// The three gold circles are not decoration. They are the three mutually
// perpendicular planes the whole second half of the run is built on — the same
// three the golden rectangles lie in — so the thing being swum at is already
// carrying the figure it is about to become. Nothing says so; it is just there.
//
// Nothing is lit, here or anywhere (see world/materials.js). A shaded sphere
// would need matching lamps in two very different scenes and would STILL differ
// between a perspective and an orthographic camera. The skin is a view-space
// silhouette, which is identical under either — which is why the fly-in's globe
// and the void's gold circle are the same material with `base`, `skinOnly` and
// the two colours changed, and nothing else.
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

// A wire globe. `opts.skinOnly` builds nothing but the silhouette, which is what
// the void wants: a gold circle with the icosahedron drawn inside it.
export function createEgg(radius, opts = {}) {
	const ink = opts.ink ?? EGG.skin;
	const accent = opts.accent ?? EGG.rim;
	const power = opts.power ?? EGG.rimPower;
	const base = opts.base ?? 0;
	const add = opts.add ?? true;

	const group = new THREE.Group();
	const mats = [];
	const geos = [];

	const skinMat = skinMaterial({ ink, accent, power, base, add });
	const skin = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), skinMat);
	skin.renderOrder = 2;
	group.add(skin);
	mats.push(skinMat);
	geos.push(skin.geometry);

	let wireMat = null;
	let goldMat = null;
	let wire = null;
	let gold = null;

	if (!opts.skinOnly) {
		const build = (positions, material) => {
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
			segmentAttributes(geo, positions.length / 6, () => 0);
			const line = new THREE.LineSegments(geo, material);
			line.renderOrder = 1;
			group.add(line);
			mats.push(material);
			geos.push(geo);
			return line;
		};

		wireMat = lineMaterial(EGG.wire, 0);
		// A globe is as much its far side as its near side, so the cage keeps far
		// more of itself at the back than the icosahedron's edges do. A sphere
		// whose far half has gone is a bowl.
		wireMat.uniforms.uBack.value = 0.36;
		wireMat.uniforms.uGrow.value = wireMat.uniforms.uSpan.value;
		wire = build(cage(radius, EGG.meridians, EGG.parallels), wireMat);

		goldMat = lineMaterial(EGG.rings, 0);
		goldMat.uniforms.uBack.value = 0.42;
		goldMat.uniforms.uGrow.value = goldMat.uniforms.uSpan.value;
		gold = build(greatCircles(radius), goldMat);
	}

	return {
		group,
		skin,
		wire,
		gold,
		radius,

		// 0..1 — the globe's line-work, which is what it is actually made of.
		setWire(o) {
			if (!wireMat) return;
			wireMat.uniforms.uOpacity.value = o;
			goldMat.uniforms.uOpacity.value = o * EGG.ringGain;
			wire.visible = o > 0.004;
			gold.visible = o > 0.004;
		},
		// 0..1 — the silhouette. Above 1 is legal while the skin is additive.
		setShell(o) {
			skinMat.uniforms.uOpacity.value = o;
			skin.visible = o > 0.004;
		},
		dispose() {
			geos.forEach((g) => g.dispose());
			mats.forEach((m) => m.dispose());
		}
	};
}
