// ── The lamp: the red anglepoise on the desk's left ──────────────────────────
// The drawing's lamp made solid: a flat round base with its switch nub and a
// knuckle sunk into it, a lower arm leaning up and back to the left, a round
// elbow, an upper arm up to the right to a pivot, and off that a bell shade on
// a short bracket — its crown up-left of the pivot, its mouth down-right,
// pointed at the monitor and tilted a little toward the viewer so the eye sees
// into it: the dark inside of the bell round the pale bulb set in its mouth,
// as the drawing has it. A cap closes the crown, with a small nub on it.
// Every hinge is a disc on its own axis — the normal of the plane its two
// arms lie in, so the elbow and the pivot share one and the knuckle's is the
// lower arm's against the vertical — with a bolt head on each face. All of it
// in the drawing's red, the hinges a darker red, the shade darkening to its
// rim.
//
// The joints were read off the drawing from the base's centre, in units of
// the lamp's height: every length here is for LAYOUT.lamp.height = 0.4 and
// scales with it, so the lamp is one size in one place. (In the desk's flat
// the drawing's lamp is 0.78 high, desk top to the shade's crown, reaching
// the pink poster's bottom; LAYOUT has it at 0.4 today.)
//
// Parts: lamp-base (the base, the switch, the knuckle), lamp-lower (the lower
// arm and the elbow), lamp-upper (the upper arm and the pivot), lamp-shade
// (the bracket, the bell, its cap and nub, the bulb). No construction lines:
// it is small. Eighteen meshes.

export async function build(K) {
	const { THREE, box, cyl, tube, part, group, PAL, LAYOUT } = K;
	const V = (x, y, z) => new THREE.Vector3(x, y, z);
	const Y = V(0, 1, 0);
	const L = LAYOUT.lamp;
	const g = new THREE.Group();
	g.name = 'lamp';

	// The drawing's reds: the arms and the base, the hinges and the shade's
	// rim darker, the highlight on the base's top lighter.
	const RED = PAL.red;
	const DARK = PAL.redDark;
	const MID = 0xa83634;

	// ── The skeleton, in room coordinates ────────────────────────────────────
	// Every length is for a lamp 0.4 high, scaled to LAYOUT's height; a point
	// is an offset from the base's centre on the desk top.
	const s = L.height / 0.4;
	const u = (n) => n * s;
	const at = (dx, dy, dz) => V(L.x + u(dx), L.base + u(dy), L.z + u(dz));
	const BASE_R = u(0.085);
	const BASE_H = u(0.026);
	const ARM_R = u(0.012);
	const B = at(0, 0, 0); // the base, standing on the desk top
	const J = at(-0.015, 0.046, 0); // the knuckle, sunk into the base
	const E = at(-0.088, 0.185, -0.035); // the elbow, up and back to the left
	const P = at(0.012, 0.308, 0.005); // the shade's pivot, up to the right
	// The bell: its axis from the crown to the mouth, down-right toward the
	// monitor and forward; its crown up-left of the pivot.
	const D = V(0.6, -0.55, 0.58).normalize();
	const BELL_L = u(0.13);
	const CROWN = at(0.036, 0.38, -0.01);
	const MOUTH = CROWN.clone().addScaledVector(D, BELL_L);
	// A hinge's axis: normal to the plane of its two members, toward the eye.
	const axisOf = (a, b) => {
		const n = a.clone().cross(b);
		if (n.z < 0) n.negate();
		return n.normalize();
	};
	const lowerDir = E.clone().sub(J);
	const upperDir = P.clone().sub(E);
	const knuckleAxis = axisOf(lowerDir, Y);
	const armAxis = axisOf(lowerDir, upperDir);

	// Stand a mesh built along y at `c`, turned to `axis`.
	const along = (m, c, axis) => {
		m.position.copy(c);
		m.quaternion.setFromUnitVectors(Y, axis);
		return m;
	};

	// A hinge: a disc r across and t thick on `axis` at `c`, a darker red than
	// the arms, with a bolt head on each face.
	function hinge(c, axis, r, t) {
		const disc = along(
			cyl(r, r, t, { seg: 12, origin: 'center', color: DARK, up: MID, down: MID, tint: 0.22 }),
			c,
			axis
		);
		const bolts = [1, -1].map((side) =>
			along(
				cyl(u(0.007), u(0.007), u(0.004), {
					seg: 12,
					origin: 'center',
					color: PAL.ink,
					edges: false,
					tint: 0
				}),
				c.clone().addScaledVector(axis, side * (t / 2 + u(0.002))),
				axis
			)
		);
		return [disc, ...bolts];
	}

	// ── The base: the round foot, the switch, the knuckle ────────────────────
	const foot = cyl(BASE_R, BASE_R, BASE_H, {
		seg: 24,
		top: RED,
		bottom: DARK,
		up: RED,
		down: DARK,
		tint: 0.15
	});
	foot.position.copy(B);
	const sw = box(u(0.022), u(0.012), u(0.016), { color: RED, up: MID, tint: 0.2 });
	sw.position.copy(at(0.042, 0.026, 0.015));
	const base = group(foot, sw, ...hinge(J, knuckleAxis, u(0.03), u(0.036)));
	part(base, 'lamp-base', [0, 0.55, 0]);

	// ── The lower arm, up and back to the left, and the elbow ────────────────
	const lowerArm = tube(J.toArray(), E.toArray(), ARM_R, { color: RED, tint: 0.3 });
	const lower = group(lowerArm, ...hinge(E, armAxis, u(0.03), u(0.03)));
	part(lower, 'lamp-lower', [-0.25, 0.6, 0]);

	// ── The upper arm, up to the right, and the pivot ────────────────────────
	const upperArm = tube(E.toArray(), P.toArray(), ARM_R, { color: RED, tint: 0.3 });
	const upper = group(upperArm, ...hinge(P, armAxis, u(0.022), u(0.028)));
	part(upper, 'lamp-upper', [0, 0.7, 0]);

	// ── The shade: the bracket, the bell, its cap and nub, the bulb ──────────
	// The bracket runs from the pivot into the bell's side near its crown.
	const bracket = tube(P.toArray(), CROWN.clone().addScaledVector(D, u(0.04)).toArray(), u(0.009), {
		color: RED,
		tint: 0.3
	});
	// The bell: open at both ends, seen from inside too, red at the crown and
	// the drawing's dark red at the rim.
	const bell = along(
		cyl(u(0.075), u(0.035), BELL_L, {
			seg: 24,
			origin: 'center',
			open: true,
			side: THREE.DoubleSide,
			top: DARK,
			bottom: RED,
			tint: 0.25
		}),
		CROWN.clone().addScaledVector(D, BELL_L / 2),
		D
	);
	// The cap closes the crown, a hair into the bell so there is no seam.
	const cap = along(
		cyl(u(0.035), u(0.035), u(0.014), {
			seg: 24,
			origin: 'center',
			color: RED,
			up: MID,
			down: MID
		}),
		CROWN.clone().addScaledVector(D, -u(0.005)),
		D
	);
	const nub = along(
		cyl(u(0.006), u(0.006), u(0.02), {
			seg: 12,
			origin: 'center',
			color: PAL.greyDeep,
			tint: 0.3
		}),
		CROWN.clone().addScaledVector(D, -u(0.02)),
		D
	);
	// The bulb: a pale disc set a little way into the mouth.
	const bulb = along(
		cyl(u(0.058), u(0.058), u(0.012), {
			seg: 24,
			origin: 'center',
			color: PAL.bulb,
			up: PAL.bulb,
			down: PAL.bulb,
			tint: 0.06,
			edgeOpacity: 0.35
		}),
		MOUTH.clone().addScaledVector(D, -u(0.03)),
		D
	);
	const shade = group(bracket, bell, cap, nub, bulb);
	part(shade, 'lamp-shade', [0.2, 0.85, 0]);

	g.add(base, lower, upper, shade);
	return g;
}
