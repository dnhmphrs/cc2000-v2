// ── The room itself: a floor, a ceiling, the back wall ───────────────────────
// Two slabs and a panel on the blue, as the perspective study has them: the
// floor a plank slab the width of the stage, the ceiling a thicker slab, tan
// on top and ORANGE underneath and round its band, darkening to red at the
// top of the band; the back wall a tan panel the drawing's posters hang on,
// a shade darker toward the floor. No side walls: the room is open to the
// blue on three sides, as the study's is.

export async function build(K) {
	const { THREE, box, part, rays, lineMat, PAL, LAYOUT, SX, W, H, DEPTH } = K;
	const g = new THREE.Group();
	g.name = 'room';

	// The floor: its top at y = −1, planks along the room.
	const ft = LAYOUT.floor.thick;
	const floor = box(2 * SX, ft, DEPTH, {
		up: PAL.floor,
		down: PAL.floorDark,
		top: PAL.floor,
		bottom: PAL.floorDark,
		tint: 0.12
	});
	floor.position.set(0, LAYOUT.floor.y - ft, -DEPTH / 2);
	rays(floor, { opacity: 0.16 });
	const planks = [];
	for (let x = -SX + 0.27; x < SX - 0.01; x += 0.27)
		planks.push(x, ft + 0.002, DEPTH / 2, x, ft + 0.002, -DEPTH / 2);
	const pg = new THREE.BufferGeometry();
	pg.setAttribute('position', new THREE.Float32BufferAttribute(planks, 3));
	floor.add(new THREE.LineSegments(pg, lineMat(0.5)));
	part(floor, 'floor', [0, -0.9, 0]);

	// The ceiling: its underside at y = +1, orange under and round, tan on top.
	const ct = LAYOUT.ceiling.thick;
	const ceiling = box(2 * SX, ct, DEPTH, {
		up: PAL.ceiling,
		down: PAL.orange,
		top: PAL.orangeDark,
		bottom: PAL.orange,
		tint: 0.1
	});
	ceiling.position.set(0, LAYOUT.ceiling.y, -DEPTH / 2);
	rays(ceiling, { opacity: 0.16 });
	part(ceiling, 'ceiling', [0, 0.9, 0]);

	// The back wall: a panel the width of the frame, floor to ceiling.
	const wt = LAYOUT.wall.thick;
	const wall = box(W, H, wt, {
		top: PAL.wall,
		bottom: PAL.wallDark,
		tint: 0.1
	});
	wall.position.set(0, -H / 2, LAYOUT.wall.z - wt / 2);
	rays(wall, { opacity: 0.12 });
	part(wall, 'wall', [0, 0, -0.8]);

	g.add(floor, ceiling, wall);
	return g;
}
