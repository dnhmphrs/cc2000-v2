// ── The desk: a long top on two drawer pedestals, the kneehole open ──────────
// The drawing's desk made solid: a plank of a top the width of the room with a
// lip under its front edge, standing on two pedestals, each a carcass open at
// the front with two drawer fronts set into it behind a reveal — the upper one
// with the drawing's dark scooped pull cut into it near its top, a pocket you
// look into, the lower one shallower and plain, as the drawing has it. The
// wall shows through the kneehole. Wood throughout, ONE gradient from the
// floor up carried over every part so the pedestals read as one piece, the
// top's face a shade lighter, its underside the dark.
//
// Parts: desk-top (the slab, its lip riding with it; lifts off), desk-left and
// desk-right (the pedestals; slide out and apart), and in each desk-*-body
// (the carcass, which stays), desk-*-drawer-1 (upper, with the scoop) and
// desk-*-drawer-2 (lower), which slide out toward the viewer as drawers do.
// The kit has no pocket, so the scoop is built here from THREE: a quarter
// ellipsoid with a flat floor, its faces turned inward, through a half-ellipse
// hole in the drawer front (an ExtrudeGeometry with a hole).

const LIP = { h: 0.015, d: 0.05 }; // the strip under the top's front edge
const REVEAL = 0.03; // the carcass front sits this far behind the drawer faces, and shows this much round them
const FRONT = 0.04; // a drawer front's thickness
const SCOOP = { rx: 0.11, ry: 0.05, rz: 0.028, drop: 0.09 }; // the pull: half-ellipse, its chord `drop` below the drawer's top
const clamp01 = (x) => Math.max(0, Math.min(1, x));

export async function build(K) {
	const { THREE, box, solid, part, rays, PAL, LAYOUT } = K;
	const g = new THREE.Group();
	g.name = 'desk';
	const d = LAYOUT.desk;
	const [x0, x1] = d.x;
	const [zb, zf] = d.z; // the back, by the wall; the front edge
	const floor = LAYOUT.floor.y;
	const under = d.top - d.thick; // the top's underside: the pedestals stand up to it

	// The wood: one ramp from the floor's dark up to the top's colour.
	const wood = new THREE.Color(PAL.wood);
	const woodDark = new THREE.Color(PAL.woodDark);
	const ramp = (y) => woodDark.clone().lerp(wood, clamp01((y - floor) / (d.top - floor)));
	const shade = (c, k) => c.clone().multiplyScalar(k);
	const topFace = wood.clone().lerp(new THREE.Color(0xffffff), 0.14);

	// ── The top ──────────────────────────────────────────────────────────────
	const top = box(x1 - x0, d.thick, zf - zb, {
		up: topFace,
		down: woodDark,
		top: wood,
		bottom: shade(wood, 0.88),
		tint: 0.14
	});
	top.position.set((x0 + x1) / 2, under, (zb + zf) / 2);
	// The lip: a strip hung under the front edge, flush with it.
	const lip = box(x1 - x0, LIP.h, LIP.d, {
		top: shade(wood, 0.88),
		bottom: shade(wood, 0.76),
		down: woodDark,
		tint: 0.14
	});
	lip.position.set(0, -LIP.h, (zf - zb) / 2 - LIP.d / 2);
	top.add(lip);
	rays(top);
	part(top, 'desk-top', [0, 0.5, 0]);
	g.add(top);

	// ── A drawer front: a slab, with the scoop cut through its face if asked ──
	function front(w, h, scoop) {
		const s = new THREE.Shape();
		s.moveTo(-w / 2, -h / 2);
		s.lineTo(w / 2, -h / 2);
		s.lineTo(w / 2, h / 2);
		s.lineTo(-w / 2, h / 2);
		s.closePath();
		if (scoop) {
			const p = new THREE.Path();
			p.absellipse(0, scoop.y, SCOOP.rx, SCOOP.ry, 0, Math.PI, false, 0);
			p.closePath();
			s.holes.push(p);
		}
		const geo = new THREE.ExtrudeGeometry(s, {
			depth: FRONT,
			bevelEnabled: false,
			curveSegments: 10
		});
		geo.translate(0, 0, -FRONT); // the face at z = 0, the body behind it
		return geo;
	}

	// The pocket behind the scoop: a quarter ellipsoid (the dome over the
	// chord) closed by a flat floor along the chord, rings from the rim in to
	// the apex, every face wound to look inward.
	function pocket(N = 10, M = 5) {
		const { rx, ry, rz } = SCOOP;
		const pos = [];
		const idx = [];
		const ring = (j) => {
			const w = (Math.PI / 2) * (j / M);
			return [Math.max(Math.cos(w), 0.02), -rz * Math.sin(w)];
		};
		for (let j = 0; j <= M; j++) {
			const [s, z] = ring(j);
			for (let i = 0; i <= N; i++) {
				const a = (Math.PI * i) / N;
				pos.push(rx * Math.cos(a) * s, ry * Math.sin(a) * s, z);
			}
		}
		const at = (i, j) => j * (N + 1) + i;
		for (let j = 0; j < M; j++)
			for (let i = 0; i < N; i++)
				idx.push(
					at(i, j),
					at(i + 1, j),
					at(i + 1, j + 1),
					at(i, j),
					at(i + 1, j + 1),
					at(i, j + 1)
				);
		const f0 = pos.length / 3;
		for (let j = 0; j <= M; j++) {
			const [s, z] = ring(j);
			pos.push(-rx * s, 0, z, rx * s, 0, z);
		}
		for (let j = 0; j < M; j++) {
			const A = f0 + 2 * j;
			idx.push(A, A + 1, A + 3, A, A + 3, A + 2);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		geo.setIndex(idx);
		geo.computeVertexNormals();
		return geo;
	}

	// ── A pedestal: the carcass, the two fronts in it ────────────────────────
	function pedestal(name, [px0, px1], side) {
		const w = px1 - px0;
		const cx = (px0 + px1) / 2;
		const zFace = zf - 0.02; // the drawer faces, a touch behind the top's edge
		const zCar = zFace - REVEAL; // the carcass front
		const P = new THREE.Group();
		P.name = name;

		const body = box(w, under - floor, zCar - zb, {
			up: shade(wood, 0.9),
			down: woodDark,
			top: shade(ramp(under), 0.9),
			bottom: shade(woodDark, 0.9),
			tint: 0.16
		});
		body.position.set(cx, floor, (zb + zCar) / 2);
		rays(body);
		part(body, `${name}-body`, [0, 0, 0]);
		P.add(body);

		// The fronts: the upper drawer from just under the top most of the way
		// down, the lower a shallow one over a plinth, a reveal between.
		const fw = w - 2 * REVEAL;
		const y1 = [under - 0.02, under - 0.32];
		const y2 = [y1[1] - REVEAL, floor + 0.035];
		const drawer = (n, [yt, yb], scoop) => {
			const h = yt - yb;
			const m = solid(front(fw, h, scoop), { top: ramp(yt), bottom: ramp(yb), tint: 0.14 });
			m.position.set(cx, (yt + yb) / 2, zFace);
			part(m, `${name}-drawer-${n}`, [0, 0, 0.45]);
			return m;
		};
		const scoopY = (y1[0] - y1[1]) / 2 - SCOOP.drop; // in the drawer's own frame
		const upper = drawer(1, y1, { y: scoopY });
		const hole = solid(pocket(), {
			top: PAL.handle,
			bottom: shade(new THREE.Color(PAL.handle), 0.8),
			tint: 0.3,
			side: THREE.DoubleSide,
			edges: false // the hole's own outline is the rim; the pocket's would double it
		});
		hole.position.set(0, scoopY, 0);
		upper.add(hole);
		const lower = drawer(2, y2, null);
		P.add(upper, lower);

		part(P, name, [0.35 * side, 0, 0.3]);
		return P;
	}

	g.add(pedestal('desk-left', d.left, -1), pedestal('desk-right', d.right, 1));
	return g;
}
