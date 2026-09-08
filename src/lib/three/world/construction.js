import * as THREE from 'three';
import { VERTICES, RECTANGLES, CIRCUMRADIUS, PHI } from '../geometry/icosahedron';
import { ICOSA_INK } from '$lib/config';
import { lineMaterial, dotMaterial, grower, segmentAttributes, stroke, ring } from './materials';

// ── The construction ─────────────────────────────────────────────────────────
// The derivation the conception performs, and nothing else — the icosahedron
// itself is world/lattice.js.
//
// It is an actual proof, not a decoration, and every length in it is exact:
//
//   the CIRCLE      the icosahedron's own circumcircle, radius √(1+φ²).
//   the PENTAGON    regular, inscribed in it. Side s = 2R·sin36° = √5.
//   the PENTAGRAM   its five diagonals. d = 2R·sin72° = √5·φ, so d/s IS φ —
//                   this is where the number comes from, and the only place in
//                   the run it is derived rather than asserted.
//   the RATIO BAR   s and d laid end to end under the figure with the ONE scale
//                   2/√5 applied to both. That takes them to exactly 2 and 2φ,
//                   which are exactly the sides of the icosahedron's golden
//                   rectangle. Nothing is fudged to make it land.
//   the RECTANGLES  three of them, in that ratio, flat and stacked in the page.
//   the FOLD        two stand up into the planes perpendicular to the first, and
//                   their twelve corners are the twelve vertices.
//
// All of it is built in the icosahedron's own RAW coordinates, so every point
// the construction arrives at is a point of the solid. It lands on the shape
// because it IS the shape.
//
// This file BUILDS. Conception.svelte MOVES.

const v3 = (i) => new THREE.Vector3(...VERTICES[i]);

export function createConstruction() {
	const group = new THREE.Group();
	const mats = [];
	const geos = [];

	function keep(m) {
		mats.push(m);
		return m;
	}
	function track(o) {
		if (o?.geometry) geos.push(o.geometry);
		return o;
	}

	// The figure is drawn FLAT and face-on for its whole life, so depth shading
	// would only dim it unevenly for no reason.
	function flatInk(color, opacity = 1) {
		const m = keep(lineMaterial(color, opacity));
		m.uniforms.uBack.value = 1;
		return m;
	}

	const X = new THREE.Vector3(1, 0, 0);
	const Y = new THREE.Vector3(0, 1, 0);

	// ── The circle ───────────────────────────────────────────────────────────
	// Drawn by a pen going round it once. The radius is the real circumradius, so
	// the twelve vertices land exactly on it.
	const circleMat = flatInk(ICOSA_INK.line);
	const circle = track(
		stroke(
			ring(X.clone().multiplyScalar(CIRCUMRADIUS), Y.clone().multiplyScalar(CIRCUMRADIUS), 192),
			circleMat,
			true
		)
	);
	const growCircle = grower(circleMat, 0);
	group.add(circle);

	// The compass: an arm from the centre to the pen, and a bright point at the
	// tip. A growing arc on its own is a line appearing; an arm swinging round is
	// a tool being used, and the first third of this scene is otherwise very
	// quiet.
	const armMat = flatInk(ICOSA_INK.inner, 1);
	const armGeo = new THREE.BufferGeometry();
	const armPos = new Float32Array(6);
	armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3));
	segmentAttributes(armGeo, 1, () => 0);
	armMat.uniforms.uGrow.value = armMat.uniforms.uSpan.value;
	const arm = track(new THREE.LineSegments(armGeo, armMat));
	geos.push(armGeo);
	group.add(arm);

	const penMat = keep(dotMaterial(ICOSA_INK.bright, 9));
	const penGeo = new THREE.BufferGeometry();
	const penPos = new Float32Array(3);
	penGeo.setAttribute('position', new THREE.BufferAttribute(penPos, 3));
	geos.push(penGeo);
	group.add(new THREE.Points(penGeo, penMat));

	// ── The pentagon, and the pentagram inside it ────────────────────────────
	const pentPts = Array.from({ length: 5 }, (_, i) => {
		const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
		return new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(CIRCUMRADIUS);
	});
	const pentMat = flatInk(ICOSA_INK.pentagon);
	const pentagon = track(stroke(pentPts, pentMat, true));
	const growPentagon = grower(pentMat, 0);
	group.add(pentagon);

	const starMat = flatInk(ICOSA_INK.inner);
	// 0-2-4-1-3-0 is the pentagram drawn without lifting the pen, which is the
	// only way to draw it that reads as one gesture.
	const star = track(
		stroke(
			[0, 2, 4, 1, 3].map((i) => pentPts[i]),
			starMat,
			true
		)
	);
	const growStar = grower(starMat, 0);
	group.add(star);

	// ── The ratio bar ────────────────────────────────────────────────────────
	// The pentagon's side and the pentagram's diagonal, laid end to end below the
	// figure with the one factor 2/√5 applied to both — which takes them to
	// exactly 2 and 2φ, the sides of the rectangle that draws next.
	//
	// This is the hinge of the whole derivation and it is four segments long.
	const side = pentPts[0].distanceTo(pentPts[1]);
	const diag = pentPts[0].distanceTo(pentPts[2]);
	const K = 2 / side; // side → 2, and therefore diagonal → 2φ
	const barY = -CIRCUMRADIUS * 1.13;
	const barX0 = -((side + diag) * K) / 2;
	const marks = [barX0, barX0 + side * K, barX0 + (side + diag) * K];

	const barMat = flatInk(ICOSA_INK.line);
	const barPos = [];
	barPos.push(marks[0], barY, 0, marks[1], barY, 0);
	barPos.push(marks[1], barY, 0, marks[2], barY, 0);
	const tick = CIRCUMRADIUS * 0.075;
	marks.forEach((x) => barPos.push(x, barY - tick, 0, x, barY + tick, 0));
	const barGeo = new THREE.BufferGeometry();
	barGeo.setAttribute('position', new THREE.Float32BufferAttribute(barPos, 3));
	// Left to right, one length after the other, so it reads as a measurement
	// being taken rather than a diagram switching on.
	const barSpread = segmentAttributes(barGeo, barPos.length / 6, (i) => (i < 2 ? i : 2 + i * 0.01));
	const growBar = grower(barMat, barSpread);
	const bar = track(new THREE.LineSegments(barGeo, barMat));
	geos.push(barGeo);
	group.add(bar);

	// ── The three rectangles ─────────────────────────────────────────────────
	// Each is built at its FINAL position and then laid flat into the page by its
	// holder, so the fold is one rotation back to zero and every corner is
	// exactly an icosahedron vertex when it gets there.
	//
	// Rectangle 0 is already in the page. Rectangle 1 lies in the YZ plane, so a
	// quarter turn about Y puts it in the page; rectangle 2 lies in XZ, so a
	// quarter turn about X does. Those are the two that fold.
	const FOLD = [
		{ axis: 'none', from: 0 },
		{ axis: 'y', from: -Math.PI / 2 },
		{ axis: 'x', from: Math.PI / 2 }
	];
	const rectMat = keep(lineMaterial(ICOSA_INK.line, 1));
	const rects = RECTANGLES.map((r, i) => {
		const holder = new THREE.Object3D();
		group.add(holder);
		holder.add(track(stroke(r.indices.map(v3), rectMat, true)));
		return { holder, ...FOLD[i] };
	});
	const growRects = grower(rectMat, 0);

	// ── The twelve ───────────────────────────────────────────────────────────
	// The corners, struck all at once on the beat the figure closes.
	const cornerMat = keep(dotMaterial(ICOSA_INK.bright, 12));
	const cornerGeo = new THREE.BufferGeometry();
	cornerGeo.setAttribute('position', new THREE.Float32BufferAttribute(VERTICES.flat(), 3));
	geos.push(cornerGeo);
	group.add(new THREE.Points(cornerGeo, cornerMat));

	return {
		group,
		// The exact numbers, for anyone checking the claim in the header.
		phi: PHI,
		ratio: { side: side * K, diagonal: diag * K },

		setCircle(v, o = 1) {
			growCircle(v);
			circleMat.uniforms.uOpacity.value = o;
			circle.visible = v > 0.001 && o > 0.004;
		},
		// The compass arm at angle `a` radians, `o` bright. The pen rides on the
		// circle it is drawing.
		setCompass(a, o) {
			const x = Math.cos(a) * CIRCUMRADIUS;
			const y = Math.sin(a) * CIRCUMRADIUS;
			armPos.set([0, 0, 0, x, y, 0]);
			penPos.set([x, y, 0]);
			armGeo.attributes.position.needsUpdate = true;
			penGeo.attributes.position.needsUpdate = true;
			armMat.uniforms.uOpacity.value = o * 0.65;
			penMat.uniforms.uOpacity.value = o;
			arm.visible = o > 0.004;
		},
		setPentagon(v, o = 1) {
			growPentagon(v);
			pentMat.uniforms.uOpacity.value = o;
			pentagon.visible = v > 0.001 && o > 0.004;
		},
		setStar(v, o = 1) {
			growStar(v);
			starMat.uniforms.uOpacity.value = o;
			star.visible = v > 0.001 && o > 0.004;
		},
		setBar(v, o = 1) {
			growBar(v);
			barMat.uniforms.uOpacity.value = o;
			bar.visible = v > 0.001 && o > 0.004;
		},
		setRects(v, o = 1) {
			growRects(v);
			rectMat.uniforms.uOpacity.value = o;
			rects.forEach((r) => (r.holder.visible = v > 0.001 && o > 0.004));
		},
		// 0 = the three rectangles laid flat in the page, one on top of the
		// others; 1 = folded into the three mutually perpendicular planes whose
		// twelve corners are the icosahedron.
		setFold(k) {
			rects.forEach((r) => {
				if (r.axis === 'y') r.holder.rotation.y = r.from * (1 - k);
				else if (r.axis === 'x') r.holder.rotation.x = r.from * (1 - k);
			});
		},
		setCorners(o) {
			cornerMat.uniforms.uOpacity.value = o;
		},

		reset() {
			this.setCircle(0, 1);
			this.setCompass(Math.PI / 2, 0);
			this.setPentagon(0, 1);
			this.setStar(0, 1);
			this.setBar(0, 1);
			this.setRects(0, 1);
			this.setFold(0);
			this.setCorners(0);
		},

		show(on) {
			group.visible = on;
		},

		dispose() {
			mats.forEach((m) => m.dispose());
			geos.forEach((g) => g.dispose());
		}
	};
}
