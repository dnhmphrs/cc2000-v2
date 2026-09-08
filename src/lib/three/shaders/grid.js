// ── The blueprint field ──────────────────────────────────────────────────────
// The paper the second half of the run is worked on: the void, ruled.
//
// FLAT and SCREEN-LOCKED, and that is the whole of it — a drafting grid with a
// heavier rule every eighth line, a centre crosshair, corner registration
// brackets, and a soft pool of light so the solid sits IN the frame rather than
// on it. Nothing here turns.
//
// It used to carry a "lattice" as well: three families of parallel planes
// rotated by uRot. On paper that is a tumbling 3D grid; on screen it is three
// sets of broad diagonal bands sliding over each other, which reads as a blur
// rather than as a space. The lattice that belongs here is a real polytope with
// real vertices, and it is now real geometry drawn in a pass of its own — see
// world/lattice.js, createCage().
//
// The pitch is in FRAME HEIGHTS, so the ruling is the same size on every screen:
// CELLS lines across the height, at ~1.4px each. It is drawn at full resolution
// (components/Background.svelte) because a half-resolution grid is a smear.
//
// `color1` is the ground (VOID); `color2` the rule, eased per decade, so the era
// being searched tints the paper it is being searched on.
export const GRID = `
// Distance from x to the nearest whole number, as a line.
float rule(float x, float w) {
	float f = fract(x);
	float d = min(f, 1.0 - f);
	return 1.0 - smoothstep(0.0, w, d);
}

void main() {
	vec2 uv = vUv - 0.5;
	uv.x *= aspectRatio;
	float r = length(uv);

	// ── The ruling ───────────────────────────────────────────────────────
	const float CELLS = 19.0;
	const float FINE = 0.017;
	vec2 g = uv * CELLS;
	float fine = max(rule(g.x, FINE), rule(g.y, FINE));
	float coarse = max(rule(g.x * 0.125, FINE * 0.125), rule(g.y * 0.125, FINE * 0.125));

	// Centre crosshair.
	float cross = (1.0 - smoothstep(0.0, 0.0011, abs(uv.x))) +
	              (1.0 - smoothstep(0.0, 0.0011, abs(uv.y)));

	// Corner registration brackets: an L at each corner, inset by M.
	const float M = 0.028;
	const float L = 0.075;
	float ex = aspectRatio * 0.5 - abs(uv.x);
	float ey = 0.5 - abs(uv.y);
	float vSeg = (1.0 - smoothstep(0.0, 0.0016, abs(ex - M))) * step(M, ey) * step(ey, M + L);
	float hSeg = (1.0 - smoothstep(0.0, 0.0016, abs(ey - M))) * step(M, ex) * step(ex, M + L);
	float ticks = max(vSeg, hSeg);

	// ── Composite ────────────────────────────────────────────────────────
	// A pool of light at centre, and the ruling fading toward the corners so it
	// never competes with what is drawn on it.
	float pool = exp(-r * r * 1.15);
	float reach = mix(0.22, 1.0, pool);

	// The mouse uniform is the field energy components/Background.svelte swells
	// through the search; here it only lifts the ruling as the machine works.
	float burn = clamp(mouse.x * 1.4, 0.0, 1.0);

	// uFade rules the paper ON. At 0 this is the bare void, which is exactly the
	// frame the fly-in hands over — so the conception opens on black and the
	// blueprint arrives under the wave rather than with it.
	vec3 col = color1;
	col += color2 * fine * (0.03 + burn * 0.03) * reach * uFade;
	col += color2 * coarse * (0.075 + burn * 0.05) * reach * uFade;
	col += color2 * cross * 0.06 * reach * uFade;
	col += color2 * ticks * 0.34 * uFade;
	col += color2 * pool * 0.016 * uFade;

	gl_FragColor = vec4(col, 1.0);
}
`;
