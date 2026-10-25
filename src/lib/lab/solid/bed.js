// ── The bed: a blanket with its folds over a mattress on a frame ─────────────
// The drawing's bed made solid: a dark blue valance of a frame on the floor,
// a pale mattress on it, inset a little, and the blanket over the mattress —
// a duvet of a slab, lighter at the top and the drawing's mid blue low down,
// overhanging the mattress on three sides, with thin FLAPS of cloth hanging
// off its front and its two ends down past the frame's top edge, their hems
// wavy: at the left end and the front-left the flap hangs nearly to the
// floor, where the drawing's blanket reaches down, and rises on a slope to
// the right, so the dark base shows along the right, as the drawing has it,
// and comes down again over the frame's far right corner, where the drawing
// drapes its blanket over the end. The slab's top sits a little under
// LAYOUT's height, so the HUMP is the silhouette's peak, as the drawing's
// left hump is: a long shallow wedge over the back-left of the bed, its ridge
// the blanket's thick back hem over the pillow, its slope running forward,
// and the MAGAZINE lies on that slope, propped toward the viewer as the
// drawing props it on its hump, turned a little: a block of cream pages under
// an olive cover, the lime title panel at its top-left and the pink oval of
// the sunglasses face at its right, flat colours, as the drawing's cover is
// foreshortened past reading. Two more FOLDS, creases, where the drawing's
// crease lines run: a long one back-left to front-right across the right
// half, and a shorter one running out from under the magazine down to the
// front-left. The pillow is at the head, the back of the bed, a chamfered
// slab half under the blanket's back edge, its top a little above the slab's
// and the hump risen over it.
//
// One ramp of blue, from the deepest hem up to the top, is carried over the
// slab and the three flaps (paint's lo/hi), so the blanket reads as one
// cloth, the seams between slab and flap hidden inside the slab; the slab
// and the flaps draw their own lines, so no line crosses the cloth there.
// The folds' edges are faint and their tops the cloth's own light, so they
// read as creases in it rather than planks laid on it.
//
// Parts: bed-frame (stays), bed-mattress (lifts a little off the frame, so
// it shows under the blanket's hanging skirt), bed-blanket (the slab, its
// flaps and the folds; lifts off the mattress; the folds, bed-fold-1…3, lift
// a little off it in turn), bed-pillow (lifts high and pulls back out from
// under the blanket, over the lifted desk top and under the lifted keyboard,
// a touch left of the lifted mouse), magazine (the pages, the cover, the
// panel and the oval, on their tilt; lifts high off the blanket).
// Construction lines on the frame and the slab. Fourteen meshes.
//
// The kit has no draped shape, so each flap is an ExtrudeGeometry of a
// rectangle with a wavy hem and the pillow an ExtrudeGeometry of a rounded
// rectangle with a bevel, built here from THREE and painted by K.solid; a
// flap's lines are its own (the kit's edges would draw its top too).

const MATTRESS_TOP = -0.63; // the mattress's top: the slab sits on it
const INSET = 0.03; // the mattress sits this far inside the frame
const OVER = 0.04; // the blanket overhangs the frame by this, and hangs below its edge by it
const HEM = 0.2; // the blanket's back edge is this far in from the head of the bed
const DROP = 0.04; // the slab's top sits this far under LAYOUT's: the hump is the peak
const FLAP = 0.035; // a hanging flap's thickness
const PROUD = 0.004; // a flap's face stands this far off the slab's, so the two never fight
const WAVE = { amp: 0.016, per: 0.36 }; // the hems' wave: amplitude, wavelength
const DRAPE = { front: 0.25, side: 0.3, up: 0.05 }; // the far right corner's drape: its run along the front, along the end, how far above the deep hem it reaches
const PILLOW = { w: 0.6, h: 0.14, d: 0.35, x: 0.4, bevel: 0.03 };
// The hump: the back hem's ridge, its slope running forward; where it stands
// and how wide (over the pillow and the magazine, short of the long fold).
const HUMP = { x: 0.3, w: 1.05, h: 0.09, d: 0.48, toe: 0.004 };
const MAG = { w: 0.42, d: 0.3, pages: 0.01, cover: 0.006, x: 0.45, z: -0.92, turn: -20 };

export async function build(K) {
	const { THREE, box, cyl, wedge, solid, part, rays, group, lineMat, PAL, LAYOUT } = K;
	const g = new THREE.Group();
	g.name = 'bed';
	const b = LAYOUT.bed;
	const [x0, x1] = b.x;
	const [zh, zf] = b.z; // the head, at the back; the foot, toward the viewer
	const floor = LAYOUT.floor.y;
	const cx = (x0 + x1) / 2;
	const cz = (zh + zf) / 2;
	const col = (c) => new THREE.Color(c);
	const shade = (c, k) => col(c).multiplyScalar(k);
	const mix = (a, c, t) => col(a).lerp(col(c), t);
	const lerp = (a, c, t) => a + (c - a) * t;
	const rad = (deg) => (deg * Math.PI) / 180;

	// ── The frame: the dark valance, floor to the mattress ───────────────────
	const frame = box(x1 - x0, b.frame - floor, zf - zh, {
		top: PAL.bedDark,
		bottom: shade(PAL.bedDark, 0.72),
		up: PAL.bedDark,
		down: shade(PAL.bedDark, 0.6),
		tint: 0.2
	});
	frame.position.set(cx, floor, cz);
	rays(frame);
	part(frame, 'bed-frame', [0, 0, 0]);

	// ── The mattress: pale, a little inside the frame ────────────────────────
	const mattress = box(x1 - x0 - 2 * INSET, MATTRESS_TOP - b.frame, zf - zh - 2 * INSET, {
		top: PAL.mattress,
		bottom: shade(PAL.mattress, 0.86),
		up: PAL.mattress,
		tint: 0.16
	});
	mattress.position.set(cx, b.frame, cz);
	// Lifts only a little: the blanket's skirt hangs well below its slab, and
	// a mattress lifted further would be hidden inside it.
	part(mattress, 'bed-mattress', [0, 0.1, 0]);

	// ── The blanket: the slab, the flaps, the folds ──────────────────────────
	const blanket = new THREE.Group();
	const bx0 = x0 - OVER;
	const bx1 = x1 + OVER;
	const bz0 = zh + HEM; // the back edge, over the pillow
	const bz1 = zf + OVER; // the front edge, past the frame
	const top = b.top - DROP; // the slab's top; the hump's ridge reaches LAYOUT's
	const HANG = b.frame - OVER; // where a hem hangs to, past the frame's edge
	const DEEP = floor + 0.03; // where the left and front-left hems hang to
	const CORNER = DEEP + DRAPE.up; // where the far right corner's drape hangs to
	// The one ramp of blue over the whole blanket.
	const cloth = { top: PAL.bedLight, bottom: PAL.bed, tint: 0.2 };
	const lines = (obj, pts) => {
		const lg = new THREE.BufferGeometry();
		lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
		const l = new THREE.LineSegments(lg, lineMat(0.55));
		l.userData.edge = true;
		obj.add(l);
	};

	// The slab's lines are its own too: its top, its four corners and its
	// foot on the mattress at the back — not its foot along the front and the
	// ends, where the flaps hang from it and the kit's edges would draw a
	// line across the cloth.
	const sw = bx1 - bx0;
	const sh = top - MATTRESS_TOP;
	const sd = bz1 - bz0;
	const slab = box(sw, sh, sd, {
		...cloth,
		up: PAL.bedLight,
		down: PAL.bed,
		lo: DEEP - MATTRESS_TOP, // the ramp in the slab's own y, so it carries on into the flaps
		hi: top - MATTRESS_TOP,
		edges: false
	});
	{
		const X = sw / 2;
		const Z = sd / 2;
		const C = [
			[-X, -Z],
			[X, -Z],
			[X, Z],
			[-X, Z]
		];
		const pts = [];
		for (let i = 0; i < 4; i++) {
			const [ax, az] = C[i];
			const [bx, bz] = C[(i + 1) % 4];
			pts.push(ax, sh, az, bx, sh, bz); // the top
			pts.push(ax, sh, az, ax, 0, az); // a corner
		}
		pts.push(-X, 0, -Z, X, 0, -Z); // the foot at the back
		lines(slab, pts);
	}
	slab.position.set((bx0 + bx1) / 2, MATTRESS_TOP, (bz0 + bz1) / 2);
	rays(slab);

	// A flap: a sheet L long along its own x, from a hair up inside the slab
	// down to a hem at `hemY(x)` with a wave on it, FLAP thick along its own
	// z, its face at z = 0, the wave's phase carried on from `phase` so it runs
	// round the corners unbroken. Its y is the room's. Its lines are drawn by hand
	// — the hem along the face and, where `ends` says, the bed's true corner
	// down from the slab's edge — since the kit's edges would also draw its
	// top, a line across the cloth where it enters the slab.
	function flap(L, hemY, ends, phase = 0) {
		const s = new THREE.Shape();
		const yTop = MATTRESS_TOP + 0.01;
		s.moveTo(0, yTop);
		const N = 48;
		const hem = [];
		for (let i = 0; i <= N; i++) {
			const x = (L * i) / N;
			const y = hemY(x) + WAVE.amp * Math.sin((2 * Math.PI * (x + phase)) / WAVE.per);
			s.lineTo(x, y);
			hem.push([x, y]);
		}
		s.lineTo(L, yTop);
		s.closePath();
		const geo = new THREE.ExtrudeGeometry(s, { depth: FLAP, bevelEnabled: false });
		geo.translate(0, 0, -FLAP);
		const m = solid(geo, { ...cloth, lo: DEEP, hi: top, edges: false });
		const pts = [];
		for (let i = 0; i < N; i++) pts.push(hem[i][0], hem[i][1], 0, hem[i + 1][0], hem[i + 1][1], 0);
		if (ends[0]) pts.push(0, MATTRESS_TOP, 0, 0, hem[0][1], 0);
		if (ends[1]) pts.push(L, MATTRESS_TOP, 0, L, hem[N][1], 0);
		lines(m, pts);
		return m;
	}
	// The front: deep at the left, a slope up, level along the right, and
	// down again over the last of its run to the far corner's drape; both of
	// its ends are the bed's front corners.
	const frontL = bx1 - bx0 + 2 * PROUD;
	const front = flap(
		frontL,
		(x) =>
			x < 0.5
				? DEEP
				: x < 0.95
					? lerp(DEEP, HANG, (x - 0.5) / 0.45)
					: x > frontL - DRAPE.front
						? lerp(HANG, CORNER, (x - (frontL - DRAPE.front)) / DRAPE.front)
						: HANG,
		[true, true]
	);
	front.position.set(bx0 - PROUD, 0, bz1 + PROUD);
	// The ends, each turned so its face looks out and its thickness lies in
	// the slab, butting into the front flap's back; only the end at the back
	// is a corner of its own. The left end: its x runs from the back to the
	// front, its hem falling to the deep front corner.
	const sideL = bz1 - FLAP + PROUD - bz0;
	const left = flap(sideL, (x) => lerp(HANG - 0.05, DEEP, x / sideL), [true, false], -sideL);
	left.position.set(bx0 - PROUD, 0, bz0);
	left.rotation.y = -Math.PI / 2;
	// The right end: its x from the front to the back; its hem draped down
	// at the front corner, meeting the front flap's there, and level behind.
	const right = flap(
		sideL,
		(x) => (x < DRAPE.side ? lerp(CORNER, HANG, x / DRAPE.side) : HANG),
		[false, true],
		frontL
	);
	right.position.set(bx1 + PROUD, 0, bz1 + PROUD - FLAP);
	right.rotation.y = Math.PI / 2;

	// A fold: a long shallow wedge on the top, its ridge (the tall back edge)
	// along its own x, laid at `turn` degrees about y; the mid blue under the
	// ridge is the crease's shadow. Its top is the cloth's own light and its
	// edges faint, so it is a crease in the cloth, not a plank on it.
	function fold(name, x, z, w, h, d, turn, lift) {
		const f = wedge(w, h, HUMP.toe, d, {
			top: mix(PAL.bedLight, 0xffffff, 0.03),
			bottom: PAL.bed,
			tint: 0.3,
			edgeOpacity: 0.3
		});
		f.position.set(x, top, z);
		f.rotation.y = rad(turn);
		part(f, name, [0, lift, 0]);
		return f;
	}
	const folds = [
		// The long crease across the right half, back-left to front-right,
		// its far end clear of the hump.
		fold('bed-fold-1', 1.25, -0.82, 0.85, 0.035, 0.2, -34, 0.12),
		// The short one out from under the magazine down to the front-left,
		// its back end at the hump's toe.
		fold('bed-fold-2', -0.05, -0.57, 0.5, 0.03, 0.16, 30, 0.1),
		// The hump: the hem over the pillow, the back edge risen, its slope
		// running forward under the magazine; no turn.
		fold('bed-fold-3', HUMP.x, bz0 + HUMP.d / 2, HUMP.w, HUMP.h, HUMP.d, 0, 0.08)
	];
	blanket.add(slab, front, left, right, ...folds);
	part(blanket, 'bed-blanket', [0, 0.55, 0.1]);
	// The hump's slope: how high its surface stands over the slab's top at z.
	const humpAt = (z) => HUMP.h - ((HUMP.h - HUMP.toe) * (z - bz0)) / HUMP.d;

	// ── The pillow: a chamfered slab at the head, half under the blanket ─────
	function pillowGeo() {
		const { w, h, d, bevel } = PILLOW;
		const hw = w / 2 - bevel;
		const hd = d / 2 - bevel;
		const r = 0.05; // the corners, rounded
		const s = new THREE.Shape();
		s.moveTo(-hw + r, -hd);
		s.lineTo(hw - r, -hd);
		s.quadraticCurveTo(hw, -hd, hw, -hd + r);
		s.lineTo(hw, hd - r);
		s.quadraticCurveTo(hw, hd, hw - r, hd);
		s.lineTo(-hw + r, hd);
		s.quadraticCurveTo(-hw, hd, -hw, hd - r);
		s.lineTo(-hw, -hd + r);
		s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
		const geo = new THREE.ExtrudeGeometry(s, {
			depth: h - 2 * bevel,
			bevelEnabled: true,
			bevelThickness: bevel,
			bevelSize: bevel,
			bevelSegments: 2,
			curveSegments: 4
		});
		geo.rotateX(-Math.PI / 2); // extruded along z; stood so it lies flat, its thickness up
		geo.translate(0, bevel, 0); // its underside at y = 0
		return geo;
	}
	const pillow = solid(pillowGeo(), {
		top: PAL.pillow,
		bottom: shade(PAL.pillow, 0.84),
		up: 0xffffff,
		tint: 0.22,
		threshold: 30
	});
	pillow.position.set(PILLOW.x, MATTRESS_TOP, zh + PILLOW.d / 2);
	// Up over the lifted desk top and the lifted hump, back from under the
	// blanket, and a touch left, clear of the lifted mouse.
	part(pillow, 'bed-pillow', [-0.1, 0.75, -0.1]);

	// ── The magazine: pages, cover, the lime panel, the pink oval ────────────
	const pages = box(MAG.w - 0.01, MAG.pages, MAG.d - 0.01, {
		color: PAL.cream,
		up: PAL.cream,
		tint: 0.2,
		edgeOpacity: 0.4
	});
	const cover = box(MAG.w, MAG.cover, MAG.d, {
		color: PAL.olive,
		up: mix(PAL.olive, 0xffffff, 0.06),
		tint: 0.2
	});
	cover.position.y = MAG.pages;
	const panel = box(0.15, 0.003, 0.075, {
		color: PAL.lime,
		up: PAL.lime,
		tint: 0.1,
		edgeOpacity: 0.4
	});
	panel.position.set(-0.1, MAG.pages + MAG.cover, -0.085);
	panel.rotation.y = rad(8);
	const oval = cyl(0.06, 0.06, 0.003, {
		seg: 16,
		color: PAL.pink,
		up: PAL.pink,
		tint: 0.1,
		edgeOpacity: 0.4
	});
	oval.scale.set(1, 1, 0.72);
	oval.position.set(0.1, MAG.pages + MAG.cover, 0.015);
	const magazine = group(pages, cover, panel, oval);
	magazine.rotation.y = rad(MAG.turn);
	// On the hump's slope: a tilt that lays its base in the slope's plane,
	// the magazine turned about its own up inside it, so it lies on the
	// slope propped toward the viewer, as the drawing's does.
	const tilt = group(magazine);
	tilt.rotation.x = Math.atan((HUMP.h - HUMP.toe) / HUMP.d);
	tilt.position.set(MAG.x, top + 0.001 + humpAt(MAG.z), MAG.z);
	part(tilt, 'magazine', [0, 0.85, 0.2]);

	g.add(frame, mattress, blanket, pillow, tilt);
	return g;
}
