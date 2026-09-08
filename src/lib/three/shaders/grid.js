// ── The blueprint field ──────────────────────────────────────────────────────
// What the second half of the run is drawn on: the void, ruled.
//
// Three things, in this order of loudness, all in the gold the line-work is in:
//
//   1. a flat drafting grid in screen space, with a heavier rule every eighth
//      line, a centre crosshair and corner registration brackets — the paper
//      the calculation is being worked on;
//   2. a LATTICE that turns with whatever is in front of it. Three families of
//      parallel planes carried by uRot, so as the icosahedron tumbles the space
//      behind it tumbles in the same coordinates. It is the same trick the 3D
//      uses (scenes/Computation.svelte feeds uRot the frame's own attitude) and
//      it is what stops the ground reading as a backdrop hung behind the scene;
//   3. a soft pool of light at centre, so the solid sits IN the frame rather
//      than on it.
//
// `color1` is the ground (VOID). `color2` is the rule, `color3` the lattice —
// both eased per decade by components/Background.svelte, so the era being
// searched tints the paper it is being searched on.
export const GRID = `
// Distance from x to the nearest whole number, as a line.
float rule(float x, float w) {
	float f = fract(x);
	float d = min(f, 1.0 - f);
	return 1.0 - smoothstep(0.0, w, d);
}

// One family of parallel planes carried by uRot. The gradient is how fast the
// coordinate changes across the screen: when a family turns edge-on that goes
// to zero and every fragment lands on a line at once, so it is faded out
// instead — which is also, conveniently, exactly what a plane seen edge-on
// should do.
float family(float x, vec2 grad, float w) {
	return rule(x, w) * smoothstep(0.04, 0.45, length(grad));
}

void main() {
	vec2 uv = vUv - 0.5;
	uv.x *= aspectRatio;
	float r = length(uv);

	// ── The drafting grid ────────────────────────────────────────────────
	vec2 g = uv * 34.0;
	float fine = max(rule(g.x, 0.045), rule(g.y, 0.045));
	float coarse = max(rule(g.x * 0.125, 0.02), rule(g.y * 0.125, 0.02));

	// Centre crosshair.
	float cross = (1.0 - smoothstep(0.0, 0.0013, abs(uv.x))) +
	              (1.0 - smoothstep(0.0, 0.0013, abs(uv.y)));

	// Corner registration brackets: an L at each corner, inset by M.
	const float M = 0.028;
	const float L = 0.075;
	float ex = aspectRatio * 0.5 - abs(uv.x);
	float ey = 0.5 - abs(uv.y);
	float vSeg = (1.0 - smoothstep(0.0, 0.0018, abs(ex - M))) * step(M, ey) * step(ey, M + L);
	float hSeg = (1.0 - smoothstep(0.0, 0.0018, abs(ey - M))) * step(M, ex) * step(ex, M + L);
	float ticks = max(vSeg, hSeg);

	// ── The lattice ──────────────────────────────────────────────────────
	// Three families of planes in the coordinates the scene in front is
	// turning in. mat3 columns: uRot[i] is column i, so the screen gradient of
	// component k is (uRot[0][k], uRot[1][k]) times the lattice scale.
	const float S = 5.2;
	vec3 q = uRot * vec3(uv * S, 0.42);
	float lat = family(q.x, vec2(uRot[0][0], uRot[1][0]) * S, 0.03);
	lat = max(lat, family(q.y, vec2(uRot[0][1], uRot[1][1]) * S, 0.03));
	lat = max(lat, family(q.z, vec2(uRot[0][2], uRot[1][2]) * S, 0.03));

	// ── Composite ────────────────────────────────────────────────────────
	// A pool of light at centre, and everything fading toward the corners so
	// the ruling never competes with what is drawn on it.
	float pool = exp(-r * r * 1.15);
	float reach = mix(0.24, 1.0, pool);

	// The mouse uniform is the field's energy — components/Background.svelte
	// swells it through the search. Here it only breathes the lattice.
	float burn = clamp(mouse.x * 1.4, 0.0, 1.0);

	vec3 col = color1;
	col += color2 * fine * 0.022 * reach;
	col += color2 * coarse * 0.062 * reach;
	col += color2 * cross * 0.06 * reach;
	col += color2 * ticks * 0.34;
	col += color3 * lat * (0.026 + burn * 0.1) * reach;
	col += color2 * pool * 0.018;

	gl_FragColor = vec4(col, 1.0);
}
`;
