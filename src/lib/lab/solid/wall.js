// ── The wall's things: the clock and the four taped posters ──────────────────
// What hangs on the 90s wall, made solid on the panel's face (z = −3), each
// thing a hair off whatever it hangs on so nothing fights for the same plane:
//   the CLOCK over the monitor — a red drum on the wall, 0.05 deep, with the
//   pale dial a disc proud of its front, twelve ink ticks round it (the
//   quarters longer), the two hands at four o'clock as drawn — the hour hand
//   out to two thirds of the dial, the minute hand to the tick ring, as the
//   drawing's reach its numerals — a pin at the centre; the dial and all on it
//   are a part of their own, so an explode lifts the face off the drum;
//   the RAD poster at the right — a thin slab carrying the drawing's own Rad
//   (the crop of 90s_poster.png that is the big poster alone), taped at three
//   corners, and the small SMILEY poster taped over its top-left corner, proud
//   of it, in flat colours: a plum card, a lime disc, ink crosses for eyes, a
//   wavy ink mouth, a cream tongue;
//   the PINK poster and the RED SUN poster at the left — they are drawn ON the
//   wall sheet, so each is a thin slab carrying its crop of 90s_BG.png, cut to
//   the outer edge of its frame's ink so the slab's edge line sits on the
//   drawn outline and no wall shows inside it; the sun taped over the pink's
//   bottom-left corner, proud of it. The sheet draws their tapes too — tan
//   strips outlined in ink across the corners — and the solid strips sit
//   EXACTLY over those, the drawn tape's centre, lean and size (the model's
//   strips are cut to cover them), so a corner shows one tape, not two.
//
// Where they hang: the clock and the Rad sheet from LAYOUT.art (the Rad box is
// the whole of 90s_poster.png; the Rad and the smiley are sub-rectangles of
// it, by the crop's own u/v). The pink and the sun from where flats.js lays
// the wall sheet: covering the frame, its middle W/H-of-16:9 across x — the
// sheet is cropped at both sides to the golden frame — and all of it up y.
// LAYOUT.art's boxes for those two are that placement read back (they were
// first read without the side crop, 0.06–0.1 too far right); the slabs here
// agree with them to 0.01, the crops being cut to the ink.
//
// Parts: clock (clock-face inside it), poster-rad, poster-smiley,
// poster-pink, poster-sun. Construction lines on the Rad poster only.
// Twenty-four meshes.

const Q = Math.PI / 4; // a tape strip's lean: +Q a '/', −Q a '\'

// The crops, u across and v up from the bottom of each sheet.
const RAD_UV = [0.25, 0.03, 0.97, 0.99]; // of 90s_poster.png: the big poster alone
const SMILEY_UV = [0.028, 0.52, 0.306, 0.875]; // of 90s_poster.png: the small one
// Of 90s_BG.png: each frame's ink at its outer edge (the median of the
// hand-drawn line, measured), so the crop holds no wall.
const PINK_UV = [0.1964, 0.6755, 0.3138, 0.9375];
const SUN_UV = [0.1477, 0.606, 0.2302, 0.7713];
// The tapes the wall sheet draws across those two posters' corners, measured
// off the sheet: centre u/v, lean (radians, + a '/'), length and width in
// room units, the strip's ink outline in. A solid strip goes over each.
const PINK_TAPES = [
	[0.20461, 0.92773, 0.658, 0.088, 0.0213], // top-left, out onto the wall
	[0.31013, 0.68171, 0.679, 0.076, 0.026] // bottom-right
];
const SUN_TAPES = [
	[0.22711, 0.75773, -0.799, 0.074, 0.025], // top-right, onto the pink
	[0.15177, 0.61963, -0.852, 0.097, 0.0213] // bottom-left, out onto the wall
];
const COVER = [0.012, 0.006]; // what a solid strip adds to the drawn one's length and width

export async function build(K) {
	const { THREE, box, solid, picture, part, rays, tex, crop, PAL, LAYOUT, W, H } = K;
	const g = new THREE.Group();
	g.name = 'art';
	const A = LAYOUT.art;
	const Z0 = LAYOUT.wall.z; // the panel's face
	const EPS = 0.002; // the gap between a thing's back and what it hangs on

	const [sheet, wallSheet] = await Promise.all([
		tex('/room-elements/90s/90s_poster.png'),
		tex('/room-elements/90s/90s_BG.png')
	]);

	// The Rad alone: the sheet's crop of it drawn to a canvas, with the drawn
	// smiley and its tape — the sheet has them over the poster's top-left
	// corner — painted out in the poster's own green, from just inside the
	// poster's left outline (which runs through the crop at u ≈ 0.254…0.262
	// and stays whole; the drawn tape's strokes that cross it are under the
	// solid card). The solid smiley hangs over plain poster, and an explode
	// lifts it off plain poster. The sheet's two top tapes reach down into
	// the crop's top rows as tan stubs under the outlines: those rows are
	// painted green inside the outlines and cleared outside them, the
	// outline columns left as drawn.
	const radMap = (() => {
		const im = sheet.image;
		const [u0, v0, u1, v1] = RAD_UV;
		const sx = u0 * im.width;
		const sy = (1 - v1) * im.height;
		const c = document.createElement('canvas');
		c.width = Math.round((u1 - u0) * im.width);
		c.height = Math.round((v1 - v0) * im.height);
		const x = c.getContext('2d');
		x.drawImage(im, sx, sy, c.width, c.height, 0, 0, c.width, c.height);
		const px = (u) => u * im.width - sx;
		const py = (v) => (1 - v) * im.height - sy;
		x.fillStyle = '#' + PAL.olive.toString(16).padStart(6, '0');
		x.fillRect(px(0.2653), py(0.9), px(0.328) - px(0.2653), py(0.505) - py(0.9));
		const top = py(0.966); // the stubs end at v ≈ 0.974
		x.fillRect(px(0.2602), 0, px(0.275) - px(0.2602), top);
		x.fillRect(px(0.93), 0, px(0.9483) - px(0.93), top);
		x.clearRect(0, 0, px(0.2542), top);
		x.clearRect(px(0.9551), 0, c.width - px(0.9551), top);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		t.minFilter = THREE.LinearMipmapLinearFilter;
		t.anisotropy = 4;
		return t;
	})();

	// ── Local helpers (the kit has no flat disc, no merged bars) ─────────────
	// A disc on the z axis — a cylinder laid against the wall, r across, h
	// deep, from z = 0 to z = h, its round faces to ±z. Built in room
	// orientation, so the gradient runs up it and the tint falls on it as on
	// everything else.
	const disc = (r, h, o = {}) => {
		const geo = new THREE.CylinderGeometry(r, r, h, o.seg ?? 24, 1);
		geo.rotateX(Math.PI / 2);
		geo.translate(0, 0, h / 2);
		return solid(geo, { threshold: 40, ...o });
	};
	// A bar w across, l along y, d deep, shifted `ly` up its own axis, turned
	// `rz` about z and set at (x, y, z): the geometry only, to be merged.
	const bar = (w, l, d, x, y, z, rz = 0, ly = 0) => {
		const geo = new THREE.BoxGeometry(w, l, d);
		geo.translate(0, ly, 0);
		geo.rotateZ(rz);
		geo.translate(x, y, z);
		return geo;
	};
	// A bar from p to q, w thick, overrunning each end by w/2 so joints meet.
	const seg = (p, q, w, d, z) => {
		const dx = q[0] - p[0];
		const dy = q[1] - p[1];
		const a = Math.atan2(dy, dx) - Math.PI / 2;
		return bar(w, Math.hypot(dx, dy) + w, d, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z, a);
	};
	// Several geometries as one mesh's worth (positions and normals; nothing
	// merged here carries a map).
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
	const ink = (geo, edgeOpacity = 0.3) => solid(geo, { color: PAL.ink, tint: 0.12, edgeOpacity });

	// A strip of tape across a corner, `len` long and `wid` across, leaning
	// `rz`, its back on the face at `z`.
	const tape = (x, y, z, rz, len = 0.06, wid = 0.016) => {
		const m = box(len, wid, 0.006, {
			origin: 'center',
			color: PAL.cream,
			tint: 0.3,
			edgeOpacity: 0.3
		});
		m.position.set(x, y, z + 0.003);
		m.rotation.z = rz;
		return m;
	};

	// A rectangle {x: [x0, x1], y: [y0, y1]}: a sub-rectangle of R by u/v.
	const inRect = (R, u0, v0, u1, v1) => {
		const w = R.x[1] - R.x[0];
		const h = R.y[1] - R.y[0];
		return { x: [R.x[0] + u0 * w, R.x[0] + u1 * w], y: [R.y[0] + v0 * h, R.y[0] + v1 * h] };
	};
	// Where a u/v point of the wall sheet lands in the room, with the sheet
	// laid as flats.js lays it (covering the frame, cropped at the sides); and
	// a u/v rectangle of it.
	const wallPoint = (t, u, v) => {
		const k = Math.min(1, W / H / (t.image.width / t.image.height));
		return [((u - (1 - k) / 2) / k - 0.5) * W, (v - 0.5) * H];
	};
	const onWall = (t, u0, v0, u1, v1) => {
		const a = wallPoint(t, u0, v0);
		const b = wallPoint(t, u1, v1);
		return { x: [a[0], b[0]], y: [a[1], b[1]] };
	};

	// A taped slab: a picture filling `rect`, its back at `zBack`, `thick`
	// deep, taped at the corners given as [±1, ±1, lean]. Returns the group,
	// its body (for the construction lines) and the z of its face.
	const slab = (rect, zBack, thick, map, color, tapes, o = {}) => {
		const w = rect.x[1] - rect.x[0];
		const h = rect.y[1] - rect.y[0];
		const p = new THREE.Group();
		p.position.set((rect.x[0] + rect.x[1]) / 2, (rect.y[0] + rect.y[1]) / 2, zBack);
		const pic = picture(w, h, map, { thick, color, transparent: !!o.transparent });
		pic.position.z = thick;
		p.add(pic);
		for (const [cx, cy, rz] of tapes)
			p.add(tape(cx * (w / 2 - 0.008), cy * (h / 2 - 0.008), thick + 0.001, rz));
		return { group: p, body: pic.children[0], face: zBack + thick + 0.001 };
	};
	// The solid strips over a wall-sheet slab's drawn tapes, each where the
	// sheet has it, in the slab group's own frame.
	const coverTapes = (s, thick, drawn) => {
		for (const [u, v, lean, len, wid] of drawn) {
			const [x, y] = wallPoint(wallSheet, u, v);
			s.group.add(
				tape(
					x - s.group.position.x,
					y - s.group.position.y,
					thick + 0.001,
					lean,
					len + COVER[0],
					wid + COVER[1]
				)
			);
		}
	};

	// ── The clock ────────────────────────────────────────────────────────────
	const C = A.clock;
	const clock = new THREE.Group();
	clock.position.set(C.x, C.y, Z0 + EPS);
	const DRUM = 0.05;
	const drum = disc(C.r, DRUM, { top: PAL.clockRim, bottom: 0xa63b39, tint: 0.2 });
	// The face: the dial, the ticks, the hands and the pin, lifting off the
	// drum together.
	const face = new THREE.Group();
	face.position.z = DRUM;
	const dial = disc(0.155, 0.01, {
		top: PAL.clockFace,
		bottom: 0xc7cfe1,
		tint: 0.08,
		edgeOpacity: 0.4
	});
	const ticks = [];
	for (let i = 0; i < 12; i++) {
		const a = (i * Math.PI) / 6; // clockwise from twelve
		const quarter = i % 3 === 0;
		const l = quarter ? 0.034 : 0.022;
		ticks.push(
			bar(quarter ? 0.011 : 0.008, l, 0.005, 0.126 * Math.sin(a), 0.126 * Math.cos(a), 0.0125, -a)
		);
	}
	const tickMarks = ink(merge(ticks));
	// Four o'clock: the hour hand to four, its tip two thirds of the way out
	// (0.1 of the dial's 0.155), the minute hand straight up to the tick ring
	// (0.13), each overrunning the centre a little, as drawn.
	const hands = ink(
		merge([
			bar(0.013, 0.115, 0.004, 0, 0, 0.0165, -Math.PI / 1.5, 0.0425),
			bar(0.01, 0.145, 0.004, 0, 0, 0.0165, 0, 0.0575)
		])
	);
	const pin = disc(0.013, 0.005, { seg: 12, color: PAL.ink, tint: 0.1, edges: false });
	pin.position.z = 0.0185;
	face.add(dial, tickMarks, hands, pin);
	part(face, 'clock-face', [0, 0, 0.15]);
	clock.add(drum, face);
	part(clock, 'clock', [0, 0.2, 0.6]);

	// ── The Rad poster, and the smiley taped over its corner ─────────────────
	const rad = slab(
		inRect(A.radPoster, ...RAD_UV),
		Z0 + EPS,
		0.015,
		radMap,
		PAL.olive,
		[
			[-1, 1, -Q],
			[1, 1, Q],
			[1, -1, Q]
		],
		{ transparent: true }
	);
	rays(rad.body);
	part(rad.group, 'poster-rad', [0, 0, 0.5]);

	const S = inRect(A.radPoster, ...SMILEY_UV);
	const sw = S.x[1] - S.x[0];
	const sh = S.y[1] - S.y[0];
	const smiley = new THREE.Group();
	smiley.position.set((S.x[0] + S.x[1]) / 2, (S.y[0] + S.y[1]) / 2, rad.face + EPS);
	const CARD = 0.012;
	const card = box(sw, sh, CARD, { origin: 'center', top: PAL.plum, bottom: 0x574c56, tint: 0.2 });
	card.position.z = CARD / 2;
	// The face: a lime disc a touch above the card's middle, the eyes two ink
	// crosses, the mouth a wave of ink, the tongue a cream dot at its end.
	const fx = -0.004;
	const fy = 0.012;
	const lime = disc(0.074, 0.006, { seg: 20, top: PAL.lime, bottom: 0xc6d68c, tint: 0.1 });
	lime.position.set(fx, fy, CARD);
	const FZ = CARD + 0.006; // the lime's face
	const cross = (x, y) => [
		bar(0.004, 0.024, 0.004, x, y, FZ, Q),
		bar(0.004, 0.024, 0.004, x, y, FZ, -Q)
	];
	const wave = [
		[-0.046, -0.026],
		[-0.026, -0.04],
		[-0.002, -0.028],
		[0.02, -0.04],
		[0.04, -0.03]
	];
	const marks = [...cross(fx - 0.027, fy + 0.024), ...cross(fx + 0.027, fy + 0.024)];
	for (let i = 1; i < wave.length; i++) {
		const p = [fx + wave[i - 1][0], fy + wave[i - 1][1]];
		const q = [fx + wave[i][0], fy + wave[i][1]];
		marks.push(seg(p, q, 0.0045, 0.004, FZ));
	}
	const features = ink(merge(marks), 0.25);
	const tongue = disc(0.009, 0.004, { seg: 12, color: PAL.cream, tint: 0.1, edges: false });
	tongue.position.set(fx + 0.044, fy - 0.04, FZ);
	smiley.add(
		card,
		lime,
		features,
		tongue,
		tape(sw / 2 - 0.008, sh / 2 - 0.008, CARD + 0.001, -Q),
		tape(-sw / 2 + 0.008, -sh / 2 + 0.008, CARD + 0.001, -Q)
	);
	part(smiley, 'poster-smiley', [0, 0, 0.75]);

	// ── The pink poster, and the sun poster over its corner ──────────────────
	// Their tapes are the sheet's own, each solid strip over its drawn one.
	const PINK_T = 0.012;
	const pink = slab(
		onWall(wallSheet, ...PINK_UV),
		Z0 + EPS,
		PINK_T,
		crop(wallSheet, ...PINK_UV),
		PAL.frame,
		[]
	);
	coverTapes(pink, PINK_T, PINK_TAPES);
	part(pink.group, 'poster-pink', [0, 0, 0.5]);
	const SUN_T = 0.012;
	const sun = slab(
		onWall(wallSheet, ...SUN_UV),
		pink.face + EPS,
		SUN_T,
		crop(wallSheet, ...SUN_UV),
		PAL.sunDark,
		[]
	);
	coverTapes(sun, SUN_T, SUN_TAPES);
	part(sun.group, 'poster-sun', [0, 0, 0.7]);

	g.add(clock, rad.group, smiley, pink.group, sun.group);
	return g;
}
