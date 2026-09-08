import * as THREE from 'three';
import { VERTICES, RECTANGLES, CIRCUMRADIUS } from '../geometry/icosahedron';
import { ICOSA_INK } from '$lib/config';
import { growLineMaterial, grower, segmentAttributes, stroke, ring } from './ink';

// ── The construction ─────────────────────────────────────────────────────────
// Everything the conception draws that is NOT the icosahedron itself. Three
// variants, built side by side and all hidden until one is asked for, because
// they are alternatives to be flipped between rather than a sequence — see
// config/dev.js CONCEPTION and scenes/Conception.svelte.
//
//   construct   the derivation. A circle, the pentagon in it, the pentagram
//               that IS phi, the three golden rectangles read off that ratio,
//               and the two of them that fold up out of the page.
//   strike      the impact. A singularity, twelve vertices thrown out of it on
//               trails, and the edges closing between them.
//   divide      cleavage. One cell, then two, then four, then twelve, and the
//               twelve are where the vertices are.
//
// All three are built in the icosahedron's own RAW coordinates, so every
// vertex the construction arrives at is exactly a vertex of the frame that
// follows it. Nothing is approximated to look right; it lands on the solid
// because it is the solid.
//
// This file BUILDS. Conception.svelte MOVES.

// A soft additive dot. Twelve of these are the vertices in two of the three
// variants, and they are the brightest thing on screen when they land.
function dotMaterial(color, size) {
	return new THREE.ShaderMaterial({
		transparent: true,
		depthWrite: false,
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation,
		uniforms: {
			uColor: { value: new THREE.Color(color) },
			uOpacity: { value: 0 },
			uSize: { value: size }
		},
		vertexShader: `
			uniform float uSize;
			void main() {
				vec4 mv = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = uSize;
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: `
			uniform vec3 uColor;
			uniform float uOpacity;
			void main() {
				vec2 d = gl_PointCoord - 0.5;
				float r = length(d) * 2.0;
				// A hard little core in a soft halo — a drawn point, not a blur.
				float a = (exp(-r * r * 4.0) * 0.55 + (1.0 - smoothstep(0.22, 0.34, r)) * 0.9);
				a *= uOpacity;
				gl_FragColor = vec4(uColor * a, a);
			}
		`
	});
}

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

	// ── construct: the derivation ────────────────────────────────────────────
	const cGroup = new THREE.Group();
	cGroup.visible = false;
	group.add(cGroup);

	const X = new THREE.Vector3(1, 0, 0);
	const Y = new THREE.Vector3(0, 1, 0);

	// The circumcircle, drawn by a pen going round it once. Radius is the real
	// circumradius, so the twelve vertices land exactly on it.
	const circleMat = keep(growLineMaterial(ICOSA_INK.line, 1));
	circleMat.uniforms.uBack.value = 1; // flat and face-on; depth shading would only dim it
	const circle = track(
		stroke(
			ring(X.clone().multiplyScalar(CIRCUMRADIUS), Y.clone().multiplyScalar(CIRCUMRADIUS), 160),
			circleMat,
			true
		)
	);
	const growCircle = grower(circleMat, 0);
	cGroup.add(circle);

	// The regular pentagon inscribed in it, and then the pentagram inside that.
	// This is not decoration: the ratio of a pentagram's chord to the pentagon's
	// side IS phi, and phi is the only number the rest of this scene needs.
	const pentPts = Array.from({ length: 5 }, (_, i) => {
		const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
		return new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(CIRCUMRADIUS);
	});
	const pentMat = keep(growLineMaterial(ICOSA_INK.pentagon, 1));
	pentMat.uniforms.uBack.value = 1;
	const pentagon = track(stroke(pentPts, pentMat, true));
	const growPentagon = grower(pentMat, 0);
	cGroup.add(pentagon);

	const starMat = keep(growLineMaterial(ICOSA_INK.inner, 1));
	starMat.uniforms.uBack.value = 1;
	// One continuous stroke: 0-2-4-1-3-0 is the pentagram drawn without lifting
	// the pen, which is the only way to draw it that reads as one gesture.
	const star = track(
		stroke(
			[0, 2, 4, 1, 3].map((i) => pentPts[i]),
			starMat,
			true
		)
	);
	const growStar = grower(starMat, 0);
	cGroup.add(star);

	// The three golden rectangles. Each is built at its FINAL position and then
	// laid flat into the page by its holder, so the fold is one rotation back to
	// zero and every corner is exactly an icosahedron vertex when it gets there.
	//
	// Rectangle 0 is already in the page. Rectangle 1 lies in the YZ plane, so a
	// quarter turn about Y puts it in the page; rectangle 2 lies in XZ, so a
	// quarter turn about X does. Those are the two that fold.
	const FOLD = [
		{ axis: 'none', from: 0 },
		{ axis: 'y', from: -Math.PI / 2 },
		{ axis: 'x', from: Math.PI / 2 }
	];
	const rectMat = keep(growLineMaterial(ICOSA_INK.line, 1));
	const rects = RECTANGLES.map((r, i) => {
		const holder = new THREE.Object3D();
		cGroup.add(holder);
		const pts = r.indices.map((k) => v3(k));
		const line = track(stroke(pts, rectMat, true));
		holder.add(line);
		return { holder, ...FOLD[i] };
	});
	const growRects = grower(rectMat, 0);

	// ── strike: the impact ───────────────────────────────────────────────────
	const sGroup = new THREE.Group();
	sGroup.visible = false;
	group.add(sGroup);

	// Twelve trails, centre to vertex, in one draw call. All start together, so
	// this is a burst rather than a queue.
	const trailPos = [];
	VERTICES.forEach((v) => trailPos.push(0, 0, 0, ...v));
	const trailGeo = new THREE.BufferGeometry();
	trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(trailPos, 3));
	const trailMat = keep(growLineMaterial(ICOSA_INK.inner, 1));
	trailMat.uniforms.uBack.value = 0.45;
	const trailSpread = segmentAttributes(trailGeo, 12, () => 0);
	const growTrails = grower(trailMat, trailSpread);
	const trails = track(new THREE.LineSegments(trailGeo, trailMat));
	geos.push(trailGeo);
	sGroup.add(trails);

	// The singularity, and the twelve it throws.
	const sparkMat = keep(dotMaterial(ICOSA_INK.bright, 26));
	const sparkGeo = new THREE.BufferGeometry();
	sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3), 3));
	geos.push(sparkGeo);
	sGroup.add(new THREE.Points(sparkGeo, sparkMat));

	const flungMat = keep(dotMaterial(ICOSA_INK.bright, 11));
	const flungGeo = new THREE.BufferGeometry();
	const flungPos = new Float32Array(36);
	flungGeo.setAttribute('position', new THREE.BufferAttribute(flungPos, 3));
	geos.push(flungGeo);
	sGroup.add(new THREE.Points(flungGeo, flungMat));

	// ── divide: cleavage ─────────────────────────────────────────────────────
	const dGroup = new THREE.Group();
	dGroup.visible = false;
	group.add(dGroup);

	// One unit circle, twelve placements. Twelve draw calls and no per-frame
	// buffer writes at all — each cell is moved and scaled by its own matrix.
	const cellGeo = new THREE.BufferGeometry();
	{
		const pts = ring(X, Y, 72);
		const flat = [];
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			flat.push(a.x, a.y, a.z, b.x, b.y, b.z);
		}
		cellGeo.setAttribute('position', new THREE.Float32BufferAttribute(flat, 3));
		segmentAttributes(cellGeo, pts.length, () => 0);
		geos.push(cellGeo);
	}
	const cellMat = keep(growLineMaterial(ICOSA_INK.line, 1));
	cellMat.uniforms.uBack.value = 0.5;
	// Always fully drawn: what animates a cell is where it is and how big, not
	// how much of it has been inked.
	cellMat.uniforms.uGrow.value = cellMat.uniforms.uSpan.value;

	// Cleavage in three waves — 2, then 4, then 6 — so it reads as doubling
	// rather than as twelve things appearing. `parent` is where each one is born.
	const WAVE = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2];
	const PARENT = [-1, -1, 0, 1, 0, 1, 2, 3, 4, 5, 0, 1];
	const cells = VERTICES.map((v, i) => {
		const o = new THREE.Object3D();
		o.add(new THREE.LineSegments(cellGeo, cellMat));
		dGroup.add(o);
		return {
			o,
			target: new THREE.Vector3(...v),
			wave: WAVE[i],
			parent: PARENT[i],
			// Each cell's plane faces the camera, but tipped a little by its own
			// axis, so twelve discs do not read as twelve identical stickers.
			tip: new THREE.Vector3(...v).normalize()
		};
	});

	const nucleusMat = keep(dotMaterial(ICOSA_INK.bright, 10));
	const nucleusGeo = new THREE.BufferGeometry();
	const nucleusPos = new Float32Array(36);
	nucleusGeo.setAttribute('position', new THREE.BufferAttribute(nucleusPos, 3));
	geos.push(nucleusGeo);
	dGroup.add(new THREE.Points(nucleusGeo, nucleusMat));

	// ── Setters ──────────────────────────────────────────────────────────────
	const scratch = new THREE.Vector3();
	const Z = new THREE.Vector3(0, 0, 1);

	return {
		group,

		// Only one variant is ever on screen; the other two are not in the frame
		// at all, so they cost nothing but the memory they were built in.
		show(which) {
			cGroup.visible = which === 'construct';
			sGroup.visible = which === 'strike';
			dGroup.visible = which === 'divide';
		},

		// ── construct ────────────────────────────────────────────────────────
		setCircle(v, o = 1) {
			growCircle(v);
			circleMat.uniforms.uOpacity.value = o;
			circle.visible = v > 0.001 && o > 0.004;
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

		// ── strike ───────────────────────────────────────────────────────────
		setSpark(o) {
			sparkMat.uniforms.uOpacity.value = o;
		},
		setTrails(v, o = 1) {
			growTrails(v);
			trailMat.uniforms.uOpacity.value = o;
			trails.visible = v > 0.001 && o > 0.004;
		},
		// How far the twelve have been thrown, 0 at the centre and 1 home.
		setThrow(k, o = 1) {
			for (let i = 0; i < 12; i++) {
				flungPos[i * 3] = VERTICES[i][0] * k;
				flungPos[i * 3 + 1] = VERTICES[i][1] * k;
				flungPos[i * 3 + 2] = VERTICES[i][2] * k;
			}
			flungGeo.attributes.position.needsUpdate = true;
			flungGeo.computeBoundingSphere();
			flungMat.uniforms.uOpacity.value = o;
		},

		// ── divide ───────────────────────────────────────────────────────────
		// `k` walks the whole cleavage: 0 is one cell at the centre, 1 is twelve
		// of them sitting on the vertices. Each wave is a third of it, and every
		// cell travels out of its own parent.
		setCleave(k, r0, o) {
			cellMat.uniforms.uOpacity.value = o;
			for (let i = 0; i < cells.length; i++) {
				const c = cells[i];
				const local = Math.min(1, Math.max(0, k * 3 - c.wave));
				const born = local > 0;
				c.o.visible = born && o > 0.004;
				if (!born) continue;

				const from = c.parent < 0 ? scratch.set(0, 0, 0) : cells[c.parent].target;
				// Its parent's own position at this moment, so the split starts
				// where the cell it came out of actually is.
				const px = c.parent < 0 ? 0 : Math.min(1, Math.max(0, k * 3 - cells[c.parent].wave));
				const start = from.clone().multiplyScalar(px);
				c.o.position.copy(start).lerp(c.target, local * local * (3 - 2 * local));

				// They shrink as they divide — twelve cells out of one, and the one
				// was the biggest thing on screen.
				const s = r0 * (1 - 0.62 * (c.wave + local) * 0.33);
				c.o.scale.setScalar(Math.max(0.02, s));
				c.o.quaternion.setFromUnitVectors(Z, c.tip);
			}
		},
		setNuclei(k, o) {
			for (let i = 0; i < 12; i++) {
				const c = cells[i];
				const local = Math.min(1, Math.max(0, k * 3 - c.wave));
				const px = c.parent < 0 ? 0 : Math.min(1, Math.max(0, k * 3 - cells[c.parent].wave));
				const from =
					c.parent < 0 ? scratch.set(0, 0, 0) : cells[c.parent].target.clone().multiplyScalar(px);
				const at = from.clone().lerp(c.target, local * local * (3 - 2 * local));
				nucleusPos[i * 3] = at.x;
				nucleusPos[i * 3 + 1] = at.y;
				nucleusPos[i * 3 + 2] = at.z;
			}
			nucleusGeo.attributes.position.needsUpdate = true;
			nucleusGeo.computeBoundingSphere();
			nucleusMat.uniforms.uOpacity.value = o;
		},

		reset() {
			this.setCircle(0, 1);
			this.setPentagon(0, 1);
			this.setStar(0, 1);
			this.setRects(0, 1);
			this.setFold(0);
			this.setSpark(0);
			this.setTrails(0, 1);
			this.setThrow(0, 0);
			this.setCleave(0, 1, 0);
			this.setNuclei(0, 0);
		},

		dispose() {
			mats.forEach((m) => m.dispose());
			geos.forEach((g) => g.dispose());
		}
	};
}
