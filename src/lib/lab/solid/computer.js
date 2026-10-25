// ── The computer: a 90s CRT, its keyboard, the tower and the mouse ───────────
// The drawing's computer made solid, all of it standing on the desk top.
//
// The MONITOR: a SQUARE bezel at the front, as the drawing's is — a frame,
// the drawing's black screen set back into it behind a rim — a tube behind
// that tapers to sixty per cent of the bezel by the back wall, and a plinth
// under the lot with the drawing's three vents at its left, its two divider
// lines and its round button at its right on its face. The bezel is as tall
// as it is wide, 0.65, so its top is at 0.29: LAYOUT's 0.22 was read 0.09
// low from the eye. The KEYBOARD: a wedge, thicker at the back, with five
// staggered rows of keys standing on its slope and a long space bar — ONE
// instanced draw, with ONE line draw for every key's edges. The TOWER: a box
// with the drawing's front on it: two drive bays near the top, each with its
// lighter slot and its button and light, the three bars beside the CD tray,
// the dark band under them with its bottom corners cut at 45°, the floppy
// drive in the middle with its slot and eject button, the two lights and the
// round power button below, and the key lock and its small panel near the
// bottom. The MOUSE: a loaf with a line across its back for the buttons, and
// its cable curling down to the desk and up to the tower's front. Grey
// throughout, the drawing's one grey on the bezel and the tower alike,
// lighter at the top of every part, the tube and the fittings and the keys
// the dark grey, the slots a lighter grey than the body.
//
// Parts: monitor-bezel, monitor-screen, monitor-tube (pulls back, and keeps
// only the desk's lift: the clock over the monitor rises 0.2 and comes
// forward, so a tube that rose with the bezel went up into it),
// monitor-plinth (rides the desk's lift too and slides forward, so the tube,
// pulling back at the same lift, never crosses it on the way), keyboard (the
// wedge and its keys), tower (the box and its front), mouse (the loaf and
// its cable; up and aside, since the bed's pillow rises just in front of
// it). The bezel and the screen come well forward and a little to the
// right: the lamp's bell comes toward them as it lifts, and the frame's
// top-left corner passed through it on the way out otherwise. Construction
// lines on the bezel and the tower. The kit has no instanced mesh, frustum
// or loft: the keys' InstancedMesh and their merged edge lines, the tube's
// frustum (a box with its back face drawn in) and the mouse's loft (a
// stadium in rings up to a cap, with a floor) are built here from THREE and
// K.solid, and the small fittings that share a colour are merged into one
// mesh each. Thirty-one meshes.

const PLINTH = { w: 0.48, h: 0.06, d: 0.46, back: 0.02 }; // under the bezel, its face set back a touch
const BEZEL = { d: 0.1, rim: 0.05, inset: 0.015 }; // the frame's depth, its rim, the screen's set-back
const TUBE = { k: 0.6, w: 0.61, h: 0.6 }; // the taper, and the front a little inside the bezel
const KEY = { size: 0.028, pitch: 0.034, h: 0.012, rows: 5, cols: 17 };
const MOUSE = { w: 0.06, h: 0.03, l: 0.09 };

export async function build(K) {
	const { THREE, box, cyl, solid, wedge, part, rays, lineMat, PAL, LAYOUT } = K;
	const C = LAYOUT.computer;
	const g = new THREE.Group();
	g.name = 'computer';

	// The greys: the body, lighter on its top faces and at the top of a
	// gradient, darkening down; the fittings the dark grey; the slots lighter.
	const col = (c) => new THREE.Color(c);
	const shade = (c, k) => col(c).multiplyScalar(k);
	const light = (c, k) => col(c).lerp(col(0xffffff), k);
	const GREY = col(PAL.grey);
	const GREY_LIGHT = light(PAL.grey, 0.12);
	const DARK = col(PAL.greyDark);
	const DEEP = col(PAL.greyDeep);
	const SLOT = light(PAL.grey, 0.3);
	const body = (extra = {}) => ({
		top: GREY_LIGHT,
		bottom: shade(PAL.grey, 0.9),
		up: GREY_LIGHT,
		down: DARK,
		tint: 0.16,
		...extra
	});
	const fitting = (extra = {}) => ({
		top: DARK,
		bottom: shade(PAL.greyDark, 0.9),
		tint: 0.2,
		...extra
	});
	// A bar w × h × d set at (x, y, z): the geometry only, to be merged; and
	// several geometries as one mesh's worth (positions and normals).
	const bar = (w, h, d, x, y, z) => {
		const geo = new THREE.BoxGeometry(w, h, d);
		geo.translate(x, y, z);
		return geo;
	};
	const merge = (geos) => {
		const pos = [];
		const nrm = [];
		for (const src of geos) {
			const n = src.index ? src.toNonIndexed() : src;
			pos.push(...n.attributes.position.array);
			nrm.push(...n.attributes.normal.array);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
		return geo;
	};

	// ── The monitor ──────────────────────────────────────────────────────────
	const M = C.monitor;
	const mx = (M.x[0] + M.x[1]) / 2;
	const mw = M.x[1] - M.x[0];
	const zFace = M.z[1];
	const yBezel = M.y[0] + PLINTH.h; // the bezel stands on the plinth
	const bh = mw; // square, as the drawing's is: its top at 0.29
	const bcy = yBezel + bh / 2;

	// The plinth, with the drawing's three short vents at its left, the two
	// lines that divide its face right of its middle, and the round button at
	// its right, all on its face.
	const plinth = box(PLINTH.w, PLINTH.h, PLINTH.d, body({ bottom: shade(PAL.grey, 0.84) }));
	plinth.position.set(mx - 0.015, M.y[0], zFace - PLINTH.back - PLINTH.d / 2);
	const zMark = PLINTH.d / 2 + 0.002;
	const vent = solid(
		merge([
			...[-0.19, -0.16, -0.13].map((dx) =>
				bar(0.02, 0.006, 0.004, dx, PLINTH.h / 2 - 0.004, zMark)
			),
			...[0.125, 0.17].map((dx) => bar(0.002, PLINTH.h - 0.012, 0.004, dx, PLINTH.h / 2, zMark))
		]),
		fitting({ top: DEEP, bottom: DEEP, edges: false })
	);
	const pbutton = cyl(0.012, 0.012, 0.006, {
		seg: 16,
		origin: 'center',
		...fitting({ up: shade(PAL.greyDark, 1.15) })
	});
	pbutton.rotation.x = Math.PI / 2;
	pbutton.position.set(PLINTH.w / 2 - 0.035, PLINTH.h / 2, PLINTH.d / 2 + 0.003);
	plinth.add(vent, pbutton);
	part(plinth, 'monitor-plinth', [0, 0.5, 0.2]);

	// The bezel: a frame, its face at the front of the box, the hole for the
	// screen leaving the rim all round.
	function frame(w, h, rim, depth) {
		const s = new THREE.Shape();
		s.moveTo(-w / 2, -h / 2);
		s.lineTo(w / 2, -h / 2);
		s.lineTo(w / 2, h / 2);
		s.lineTo(-w / 2, h / 2);
		s.closePath();
		const p = new THREE.Path();
		const iw = w / 2 - rim;
		const ih = h / 2 - rim;
		p.moveTo(-iw, -ih);
		p.lineTo(-iw, ih);
		p.lineTo(iw, ih);
		p.lineTo(iw, -ih);
		p.closePath();
		s.holes.push(p);
		const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
		geo.translate(0, 0, -depth); // the face at z = 0, the body behind it
		return geo;
	}
	const bezel = solid(frame(mw, bh, BEZEL.rim, BEZEL.d), body({ bottom: GREY }));
	bezel.position.set(mx, bcy, zFace);
	rays(bezel);
	part(bezel, 'monitor-bezel', [0.3, 0.85, 0.6]);

	// The screen: black, set back into the frame.
	const screen = box(mw - 2 * BEZEL.rim, bh - 2 * BEZEL.rim, 0.02, {
		origin: 'center',
		top: 0x1b1b22,
		bottom: PAL.black,
		tint: 0,
		edgeOpacity: 0.4
	});
	screen.position.set(mx, bcy, zFace - BEZEL.inset - 0.01);
	part(screen, 'monitor-screen', [0.3, 0.85, 0.8]);

	// The tube: a box whose back face is drawn in to a fraction of its front,
	// from the back of the bezel to the back of the box.
	function frustum(w, h, d, k) {
		const geo = new THREE.BoxGeometry(w, h, d);
		geo.translate(0, 0, -d / 2); // the front face at z = 0
		const p = geo.attributes.position;
		for (let i = 0; i < p.count; i++)
			if (p.getZ(i) < -d / 2) {
				p.setX(i, p.getX(i) * k);
				p.setY(i, p.getY(i) * k);
			}
		geo.computeVertexNormals();
		return geo;
	}
	const tube = solid(frustum(TUBE.w, TUBE.h, zFace - BEZEL.d - M.z[0], TUBE.k), {
		top: DARK,
		bottom: DEEP,
		up: shade(PAL.greyDark, 1.1),
		down: DEEP,
		tint: 0.2
	});
	tube.position.set(mx, bcy, zFace - BEZEL.d);
	part(tube, 'monitor-tube', [0, 0.5, -0.4]);

	// ── The keyboard ─────────────────────────────────────────────────────────
	const Kb = C.keyboard;
	const kw = Kb.x[1] - Kb.x[0];
	const kd = Kb.z[1] - Kb.z[0];
	const hBack = Kb.y[1] - Kb.y[0];
	const hFront = hBack - 0.02;
	const keyboard = new THREE.Group();
	keyboard.position.set((Kb.x[0] + Kb.x[1]) / 2, Kb.y[0], (Kb.z[0] + Kb.z[1]) / 2);
	const deck = wedge(kw, hBack, hFront, kd, body({ bottom: shade(PAL.grey, 0.84) }));
	keyboard.add(deck);

	// The keys: one box, instanced over five staggered rows, each standing on
	// the slope and tilted with it, the space bar a stretched one.
	const slope = Math.atan2(hFront - hBack, kd); // the deck falls toward the front
	const deckY = (z) => hBack + (hFront - hBack) * ((z + kd / 2) / kd);
	const keyGeo = new THREE.BoxGeometry(KEY.size, KEY.h, KEY.size);
	keyGeo.translate(0, KEY.h / 2, 0);
	const proto = solid(keyGeo, fitting({ up: shade(PAL.greyDark, 1.15), down: DEEP }));
	const mats = [];
	const place = (x, z, sx = 1) => {
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -slope);
		m.compose(new THREE.Vector3(x, deckY(z) - 0.002, z), q, new THREE.Vector3(sx, 1, 1));
		mats.push(m);
	};
	const x0 = -((KEY.cols - 1) * KEY.pitch) / 2;
	const z0 = -((KEY.rows - 1) * (KEY.pitch + 0.001)) / 2;
	const stagger = [0, 0.009, 0.017, 0.006];
	for (let r = 0; r < KEY.rows - 1; r++)
		for (let c = 0; c < KEY.cols; c++)
			place(x0 + stagger[r] + c * KEY.pitch, z0 + r * (KEY.pitch + 0.001));
	const zLast = z0 + (KEY.rows - 1) * (KEY.pitch + 0.001);
	for (const c of [0, 1, 2, 3, 13, 14, 15, 16]) place(x0 + c * KEY.pitch, zLast);
	place(x0 + 8 * KEY.pitch, zLast, 8); // the space bar
	const keys = new THREE.InstancedMesh(proto.geometry, proto.material, mats.length);
	mats.forEach((m, i) => keys.setMatrixAt(i, m));
	keys.instanceMatrix.needsUpdate = true;
	keys.computeBoundingSphere();
	keyboard.add(keys, instancedEdges(THREE, lineMat, proto.geometry, mats, 0.3));
	part(keyboard, 'keyboard', [0, 0.75, 0.4]);

	// ── The tower ────────────────────────────────────────────────────────────
	const T = C.tower;
	const tw = T.x[1] - T.x[0];
	const th = T.y[1] - T.y[0];
	const td = T.z[1] - T.z[0];
	const tx = (T.x[0] + T.x[1]) / 2;
	const zFront = T.z[1];
	const tower = new THREE.Group();
	const chassis = box(tw, th, td, body({ bottom: GREY }));
	chassis.position.set(tx, T.y[0], (T.z[0] + T.z[1]) / 2);
	rays(chassis);
	tower.add(chassis);
	// A fitting on the front: w × h, standing `proud` of the face (or of the
	// fitting it sits on, at `z`), at dx from the tower's middle and y.
	const front = (w, h, proud, dx, y, o = {}, z = zFront) => {
		const m = box(w, h, proud, { origin: 'center', ...fitting(o) });
		m.position.set(tx + dx, y, z + proud / 2);
		tower.add(m);
		return m;
	};
	const yAt = (f) => T.y[1] - f * th; // y at a fraction of the way down the front
	const BAY = 0.006;
	// The two drive bays: each a dark panel with its lighter slot across the
	// top and its button and light under; the lower one's slot ribbed as the
	// drawing's CD tray is.
	for (const [f, ribbed] of [
		[0.07, false],
		[0.19, true]
	]) {
		const y = yAt(f);
		front(0.3, 0.1, BAY, 0, y);
		const slot = front(
			0.21,
			0.022,
			0.003,
			-0.02,
			y + 0.028,
			{ top: SLOT, bottom: SLOT },
			zFront + BAY
		);
		if (ribbed) {
			const arr = [];
			for (let i = 1; i < 9; i++) {
				const x = -0.105 + (0.21 * i) / 9;
				arr.push(x, -0.011, 0.0016, x, 0.011, 0.0016);
			}
			const rg = new THREE.BufferGeometry();
			rg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
			slot.add(new THREE.LineSegments(rg, lineMat(0.45)));
			// The three bars right of the tray, '|||' as drawn.
			tower.add(
				solid(
					merge(
						[0.098, 0.108, 0.118].map((dx) =>
							bar(0.004, 0.02, 0.003, tx + dx, y + 0.028, zFront + BAY + 0.0015)
						)
					),
					fitting({ top: DEEP, bottom: DEEP, edges: false })
				)
			);
		}
		front(
			0.016,
			0.01,
			0.003,
			-0.11,
			y - 0.022,
			{ top: DEEP, bottom: DEEP, edges: false },
			zFront + BAY
		);
		front(0.045, 0.01, 0.003, -0.06, y - 0.022, { top: SLOT, bottom: SLOT }, zFront + BAY);
	}
	// The dark band under the bays, the drawing's recessed panel, its bottom
	// corners cut at 45°.
	{
		const w = 0.3;
		const h = 0.12;
		const cut = 0.025;
		const s = new THREE.Shape();
		s.moveTo(-w / 2, h / 2);
		s.lineTo(w / 2, h / 2);
		s.lineTo(w / 2, -h / 2 + cut);
		s.lineTo(w / 2 - cut, -h / 2);
		s.lineTo(-w / 2 + cut, -h / 2);
		s.lineTo(-w / 2, -h / 2 + cut);
		s.closePath();
		const band = solid(
			new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: false }),
			fitting({ top: DARK, bottom: DEEP, edgeOpacity: 0.4 })
		);
		band.position.set(tx, yAt(0.33), zFront);
		tower.add(band);
	}
	// The floppy drive: its slot across the top, the eject button lower right.
	const fy = yAt(0.54);
	front(0.18, 0.13, BAY, 0, fy);
	front(0.14, 0.022, 0.003, 0, fy + 0.04, { top: SLOT, bottom: SLOT }, zFront + BAY);
	front(0.016, 0.012, 0.003, 0.055, fy + 0.005, { top: SLOT, bottom: SLOT }, zFront + BAY);
	// The two lights and the round power button, with its inner disc.
	const py = yAt(0.72);
	front(0.016, 0.012, 0.004, -0.05, py, { top: DEEP, bottom: DEEP, edges: false });
	front(0.016, 0.012, 0.004, -0.003, py, { top: DEEP, bottom: DEEP, edges: false });
	const power = cyl(0.025, 0.025, 0.01, {
		seg: 20,
		origin: 'center',
		...fitting({ up: shade(PAL.greyDark, 1.15) })
	});
	power.rotation.x = Math.PI / 2;
	power.position.set(tx + 0.06, py, zFront + 0.005);
	const disc = cyl(0.014, 0.014, 0.004, {
		seg: 16,
		origin: 'center',
		top: SLOT,
		bottom: SLOT,
		up: SLOT,
		tint: 0.1
	});
	disc.rotation.x = Math.PI / 2;
	disc.position.set(tx + 0.06, py, zFront + 0.012);
	tower.add(power, disc);
	// The key lock's panel with its square, and the small panel under it.
	const ly = yAt(0.82);
	front(0.085, 0.05, BAY, 0.048, ly);
	front(0.025, 0.025, 0.003, 0.065, ly, { top: SLOT, bottom: SLOT }, zFront + BAY);
	front(0.04, 0.035, BAY, 0.065, yAt(0.885));
	part(tower, 'tower', [0.5, 0.5, 0]);

	// ── The mouse ────────────────────────────────────────────────────────────
	// A loaf: a stadium, a little narrower at the front, lofted in rings up
	// to a flat cap, with a floor so its outline is drawn.
	function loaf(w, h, l) {
		const a = w / 2;
		const b = l / 2;
		const ring = (s, y) => {
			const pts = [];
			const N = 8;
			// the front arc (+z), narrower, then the back arc (−z)
			for (let i = 0; i <= N; i++) {
				const t = Math.PI * (i / N);
				pts.push([a * 0.85 * Math.cos(t) * s, y, (b - a * 0.85 + a * 0.85 * Math.sin(t)) * s]);
			}
			for (let i = 0; i <= N; i++) {
				const t = Math.PI * (1 + i / N);
				pts.push([a * Math.cos(t) * s, y, (-(b - a) + a * Math.sin(t)) * s]);
			}
			return pts;
		};
		const rings = [ring(1, 0), ring(0.94, 0.6 * h), ring(0.78, 0.9 * h), ring(0.55, h)];
		const n = rings[0].length;
		const pos = [];
		const idx = [];
		for (const r of rings) for (const p of r) pos.push(...p);
		// The loop runs clockwise seen from above, so every face is wound the
		// other way round to look outward.
		const at = (i, j) => j * n + (i % n);
		for (let j = 0; j < rings.length - 1; j++)
			for (let i = 0; i < n; i++)
				idx.push(
					at(i, j),
					at(i + 1, j + 1),
					at(i + 1, j),
					at(i, j),
					at(i, j + 1),
					at(i + 1, j + 1)
				);
		// the cap and the floor, fans from their centres
		const top = pos.length / 3;
		pos.push(0, h, 0);
		for (let i = 0; i < n; i++) idx.push(top, at(i + 1, rings.length - 1), at(i, rings.length - 1));
		const bottom = pos.length / 3;
		pos.push(0, 0, 0);
		for (let i = 0; i < n; i++) idx.push(bottom, at(i, 0), at(i + 1, 0));
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		geo.setIndex(idx);
		geo.computeVertexNormals();
		return geo;
	}
	const mouse = new THREE.Group();
	const shell = solid(loaf(MOUSE.w, MOUSE.h, MOUSE.l), body({ threshold: 30, bottom: GREY }));
	shell.position.set(C.mouse.x, M.y[0], C.mouse.z);
	// The buttons' split: a line over the back of the loaf, on its surface —
	// the sides run straight from the back arc's end to the narrower front's,
	// so the half-width at the line's z is read off that run.
	{
		const zl = 0.004;
		const a = MOUSE.w / 2;
		const b = MOUSE.l / 2;
		const half = (s) => {
			const f = (zl / s + (b - a)) / (b - 0.85 * a + (b - a));
			return a * s * (1 - 0.15 * f) + 0.0004;
		};
		const arr = [
			[-half(0.78), 0.9 * MOUSE.h, zl],
			[-half(0.55), MOUSE.h, zl],
			[-half(0.55), MOUSE.h, zl],
			[half(0.55), MOUSE.h, zl],
			[half(0.55), MOUSE.h, zl],
			[half(0.78), 0.9 * MOUSE.h, zl]
		].flat();
		const lg = new THREE.BufferGeometry();
		lg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
		shell.add(new THREE.LineSegments(lg, lineMat(0.5)));
	}
	// The cable: out of the tail, down to the desk, and up into the tower's
	// front near its foot.
	const tail = new THREE.Vector3(C.mouse.x, M.y[0] + 0.012, C.mouse.z - MOUSE.l / 2 + 0.01);
	const port = new THREE.Vector3(tx - 0.07, T.y[0] + 0.035, zFront);
	const curve = new THREE.CatmullRomCurve3([
		tail,
		new THREE.Vector3(C.mouse.x + 0.01, M.y[0] + 0.007, C.mouse.z - MOUSE.l / 2 - 0.03),
		new THREE.Vector3(tx - 0.085, M.y[0] + 0.006, zFront + 0.03),
		port
	]);
	const cable = solid(new THREE.TubeGeometry(curve, 16, 0.004, 6, false), {
		color: PAL.greyDeep,
		tint: 0.3,
		edges: false
	});
	mouse.add(shell, cable);
	part(mouse, 'mouse', [0.35, 0.65, 0]); // up and aside: the pillow rises just in front

	g.add(plinth, bezel, screen, tube, keyboard, tower, mouse);
	return g;
}

// The edge lines of an instanced geometry: its EdgesGeometry carried through
// every instance's matrix into ONE line draw.
function instancedEdges(THREE, lineMat, geo, mats, opacity) {
	const e = new THREE.EdgesGeometry(geo, 20);
	const src = e.attributes.position;
	const out = new Float32Array(src.count * 3 * mats.length);
	const v = new THREE.Vector3();
	let o = 0;
	for (const m of mats)
		for (let i = 0; i < src.count; i++) {
			v.fromBufferAttribute(src, i).applyMatrix4(m);
			out[o++] = v.x;
			out[o++] = v.y;
			out[o++] = v.z;
		}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(out, 3));
	const l = new THREE.LineSegments(g, lineMat(opacity, true));
	l.userData.edge = true;
	return l;
}
