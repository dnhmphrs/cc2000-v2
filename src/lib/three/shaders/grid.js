import { VERTICES } from '../geometry/icosahedron';

// ── The blueprint field ──────────────────────────────────────────────────────
// The paper the second half of the run is worked on: the void, ruled.
//
// A drafting grid with a heavier rule every eighth line, corner registration
// brackets, a soft pool of light so the solid sits IN the frame rather than on
// it — and, through the middle of it, the SOLID'S OWN SIX AXES.
//
// ── The axes, and why they are here rather than in the 3D ────────────────────
// Everything else in this shader is nailed to the screen. That was the whole of
// it once, and it is why the field read as a monitor the scene was playing on
// instead of as the space the scene was in: the registration marks and the
// crosshair belonged to the glass, and everything drawn on them belonged to the
// object, and the two never acknowledged each other.
//
// A crosshair is the worst of it — two lines through the centre of the frame,
// declaring an origin and a pair of axes that the thing at that origin does not
// have. The icosahedron's axes are not x and y. They are the SIX FIVE-FOLD
// AXES, and they are exactly the twelve vertices below, taken from the same
// array world/lattice.js builds the solid out of. So the crosshair is gone and
// these are drawn in its place, carried by uRot — the solid's own attitude,
// which the computation has been publishing all along and this shader ignored.
//
// Each ray is the continuation of one of lattice.js's twelve half-spokes past
// the circumsphere: the same line, off the object and onto the paper. They
// start outside the rim so they do not pile into a sunburst on the thing they
// belong to, and they are born on the same two beats the golden rectangles are
// — stroked on with `rects`, carried out with `open` — because they are the
// same event.
//
// This is NOT the old "lattice" that used to be here: three families of
// parallel planes rotated by uRot, which on paper is a tumbling 3D grid and on
// screen is three sets of broad diagonal bands sliding over each other. That
// read as a blur because it was area-filling, its motion was translational, and
// nothing in the 3D was drawing it. These are twelve hairlines through one
// fixed anchor, and the object in front of them is drawing the same twelve.
//
// ── Units ────────────────────────────────────────────────────────────────────
// PITCHES are in FRAME HEIGHTS, so the ruling is the same size on every screen.
// So are the static STROKE widths — the ruling lands at 0.72px of ink at 800
// tall and the brackets at 0.88px, which is what they are tuned at.
//
// The rays are the exception, and they have to be: they are the only thing in
// this shader that TURNS, and a sub-pixel line that turns crawls across the
// sample grid. So they are floored at one canvas pixel (uPx) and take the rest
// of their thinness out of the brightness instead — a line below a pixel cannot
// get narrower, only fainter.
//
// `color1` is the ground (VOID); `color2` the rule and the brackets, eased per
// decade; `color3` the rays, one step off it — the stop Background.svelte has
// always described as "the lattice" and this shader has never read.

// The twelve half-axes, in the solid's own coordinates, written into the source
// from geometry/icosahedron.js at module load. Not typed out: a literal here
// could drift from the object, and the whole point of these lines is that they
// are the object's.
const SPOKES = VERTICES.map((v) => {
	const n = Math.hypot(...v);
	return `vec3(${v.map((x) => (x / n).toFixed(6)).join(', ')})`;
});

export const GRID = `
// Distance from x to the nearest whole number, as a line.
float rule(float x, float w) {
	float f = fract(x);
	float d = min(f, 1.0 - f);
	return 1.0 - smoothstep(0.0, w, d);
}

// A stroke of w frame heights, floored at one canvas pixel. 1-smoothstep(0,e,d)
// lays e of ink over 2e of support, so e IS the half-width; under a pixel the
// geometry stops narrowing and the ink comes out of the brightness instead.
float hair(float d, float w) {
	float e = max(w, uPx);
	return (1.0 - smoothstep(0.0, e, d)) * min(w / e, 1.0);
}

// One half-axis, from just outside the solid's rim out to its reach.
//
// The projection is EXACT, not an approximation of one: every ray passes
// through the frame centre, and the perspective image of a line through the
// camera axis is a line through the principal point at any field of view. So
// the screen direction is just the rotated axis's xy, and nothing here needs to
// know what lens the scene is on.
float axisRay(vec3 aLocal, vec2 uv, float r0, float r1) {
	vec3 d = uRot * aLocal;
	// How much of the axis lies IN the picture plane. An axis pointing at the
	// camera has no direction on screen, so it is faded out rather than
	// normalised into noise.
	float f = length(d.xy);
	vec2 n = d.xy / max(f, 1e-4);
	float s = dot(uv, n);
	float o = abs(uv.x * n.y - uv.y * n.x);

	// ONE CANVAS PIXEL — the only width in this shader measured in pixels
	// rather than in frame heights, because this is the only line that turns.
	float a = hair(o, uPx);
	// Its own half only: s is negative behind the centre, and the twelve
	// together are six whole lines.
	a *= smoothstep(r0, r0 + 0.06, s);
	a *= 1.0 - smoothstep(r1, r1 + 0.25, s);
	// The end coming toward you is brighter than the end going away, which is
	// the only depth cue a flat field can give.
	float depth = clamp(d.z * s * 1.6, -1.0, 1.0);
	return a * mix(0.34, 1.0, depth * 0.5 + 0.5) * smoothstep(0.0, 0.22, f);
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

	// Corner registration brackets: an L at each corner, inset by M. Thinner and
	// quieter than they were (0.0016 of ink at 0.34, so 1.28px at full weight):
	// they are the frame's furniture and they were the boldest mark on screen,
	// heavier than the gold line-work they are supposed to sit under.
	const float M = 0.028;
	const float L = 0.075;
	const float TICK = 0.0011;
	float ex = aspectRatio * 0.5 - abs(uv.x);
	float ey = 0.5 - abs(uv.y);
	float vSeg = (1.0 - smoothstep(0.0, TICK, abs(ex - M))) * step(M, ey) * step(ey, M + L);
	float hSeg = (1.0 - smoothstep(0.0, TICK, abs(ey - M))) * step(M, ex) * step(ex, M + L);
	float ticks = max(vSeg, hSeg);

	// ── The solid's own axes ─────────────────────────────────────────────
	// uRays: x how much is drawn, y how far it reaches, z the solid's rim in
	// frame heights. See scenes/Computation.svelte.
	float r0 = uRays.z;
	float r1 = mix(r0 + 0.04, 1.35, uRays.y);
	float rays = 0.0;
${SPOKES.map((s) => `\trays += axisRay(${s}, uv, r0, r1);`).join('\n')}
	rays = min(rays * uRays.x, 1.0);

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
	col += color3 * rays * (0.16 + burn * 0.09) * reach * uFade;
	col += color2 * ticks * 0.24 * uFade;
	col += color2 * pool * 0.016 * uFade;

	gl_FragColor = vec4(col, 1.0);
}
`;
