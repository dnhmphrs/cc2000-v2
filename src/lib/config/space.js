// ── Space ────────────────────────────────────────────────────────────────────
// Every distance, size and camera setting in the 3D, in one place.

import { CIRCUMRADIUS } from '$lib/three/geometry/icosahedron';

// ── The ovum ─────────────────────────────────────────────────────────────────
// How much of the frame's HALF-height it spans when the camera parks in front of
// it. ABOVE ONE, deliberately: the thing you have flown 230 units to reach
// should not fit on the screen. V1 ended at 1.03 of the half-height and that is
// most of why its arrival landed; three quarters of it, which is where this had
// drifted to, is a diagram of an arrival.
//
// Only the fly-in reads this — the run blows out to white between that scene and
// the next, so nothing downstream has to agree with it.
export const EGG_SCREEN = 1.12;

// ── The tunnel (scene 2) ─────────────────────────────────────────────────────
export const TUNNEL = {
	// The lens WARPS through the fly-in: long and compressed at the start, so the
	// ovum reads as a long way off through the fog, opening out as the camera
	// closes on it. Widening on the way in is what exaggerates the rush — the
	// same move a dolly zoom makes, and for the same reason.
	//
	// `fov` is the resting value the camera is BUILT at; `fovEnd` is what the
	// framing is derived from, because that is the lens the scene finishes on.
	fov: 28,
	fovStart: 28,
	fovEnd: 40,

	near: 0.35,
	far: 700,

	// ── THE DISTANCE, and it is the whole scene ──────────────────────────────
	// 490 units from the lens to the ovum, covered in fifteen seconds. Both of
	// those numbers are large on purpose and neither is negotiable:
	//
	//   V1 put the ovum 250 units away and took twenty seconds to reach it at a
	//   flat 12.7 units a second. That is why it worked. The thing appears as a
	//   rumour in the fog, you travel toward it for long enough to forget you
	//   are travelling, and it is enormous by the time you arrive. Every later
	//   version shortened the run, and every one of them turned an ARRIVAL into
	//   a zoom — because a shape that grows in an empty frame for two seconds is
	//   a shape being scaled, and one that grows for fifteen is somewhere you
	//   went.
	//
	// See SCENES.flyIn.duration, and glide() in config/ease.js: the camera holds
	// ONE speed for three quarters of the run and then stops. No ease-in-out —
	// that spends the middle at double speed and reads as a camera being moved.
	// FURTHER BACK. The two mid-flight popups HOLD progress while they are open,
	// so the flight already takes longer than its duration says and there is room
	// in it for more approach. 150 -> 240 takes the travel from 426 world units
	// to 516 and starts the ovum 19% further off, which is 16% smaller and a
	// good deal deeper in the fog.
	camStart: 240,
	eggZ: -340,
	// World radius of the outer shell. How big it READS is EGG_SCREEN; the fly-in
	// turns the two into a stopping distance.
	shellR: 26,
	// The core, as a fraction of that. It is the inner of the two spheres, and it
	// is what the conception opens on — so the fly-in DERIVES this at runtime
	// from the void's own framing (see FlyIn.svelte) and the number here is only
	// what it starts at. 0.69 lands the core exactly on the void's gold circle at
	// 16:9, which is why there is no cut between the two scenes.
	coreRatio: 0.69,
	// The glow it comes up out of, as a multiple of its diameter.
	haloSpread: 7.0,
	// Fog. Thick enough that the ovum is a rumour at the start and present at the
	// end: effectively total when the scene opens, 5% when the camera stops.
	fogDensity: 0.0058,

	// ── The sperm ────────────────────────────────────────────────────────────
	// ONE, and it rides in front of the lens for the whole flight — you are not
	// watching it swim, you are swimming WITH it, which is V1's shot and the
	// reason V1's fly-in has any drama in it at all.
	//
	// Sizes here are FRACTIONS OF THE FRAME rather than scale factors on a model
	// whose file we do not control: world/tunnel.js normalises the mesh and works
	// these out against the half-height of the frame at the riding distance.
	//
	// The ride distance is COMPENSATED for the lens (see setFov): the fly-in
	// widens from 28 to 40 degrees, and a body sitting at a fixed distance
	// through that would shrink by a third. It is pulled in as the lens opens, so
	// it holds its place in the frame and the only thing that changes size is the
	// thing you are travelling toward.
	// It rides this far in front of the lens. The number itself is free — the
	// framing is angular, so the FORESHORTENING (how much bigger the near end of
	// the body is than the far end) is fixed by the lens and by spermSpan, not by
	// this. It only has to clear the near plane.

	spermLead: 5.5,
	// How much of the frame HEIGHT its CROSS-SECTION covers. V1's, measured off
	// the file: 0.153 units across a frame 0.603 units high. The body points
	// AWAY, so its length is foreshortened into about three times this.
	spermSpan: 0.254,

	// ── THE ROTATION, and it is V1's, exactly ────────────────────────────────
	// A ROLL ABOUT ITS OWN LONG AXIS, which points away from you, with a very
	// small eccentricity. Not an orbit — and reading V1 as an orbit is the single
	// easiest mistake to make with that file, because it says this:
	//
	//     sperm.position.y -= 0.695;
	//
	// on a body less than a unit long, which looks like hanging the model a long
	// way off the pivot. It is the opposite. The .glb's own root node carries a
	// translation of exactly +0.7 in y (its node matrix; see the file), so that
	// line CANCELS the model's built-in offset and drops the body onto the
	// pivot, to within 0.005. What is left is a roll with a wobble.
	//
	// So: the swimmer rides a couple of units in front of the lens, pointing
	// away, and spins about the axis you are looking down. The tail is a wide
	// curl, so what you actually see is that curl whipping round — end-on, small,
	// and violent, at one and a half turns a second.
	//
	// The eccentricity is what is left of V1's offset, as a fraction of the
	// body's own cross-section: the pivot is 13% of a body-width off centre.
	spermOffset: { x: 0.134, y: 0.127 },
	// rad/s, linear, and it never stops. V1: -elapsedTime * 10.
	spermSpin: 10,
	// V1 scaled the model (0.2, 0.4, 0.2) — twice as much along the body as
	// across it. That stretch is part of the silhouette, so it is kept.
	spermStretch: 2,

	// The contour set drawn on it: rings around the body and stripes along it,
	// per unit of the model's own geometry. This is the wire DENSITY, and it is
	// ours to choose — the mesh's own wireframe is nine thousand triangles of
	// tube and renders as a solid ribbon.
	spermRings: 4,
	spermLongs: 7,
	spermGain: 1.0,
	// Where it starts: `z` units BEHIND the lens, and low in the frame. It comes
	// straight out from behind you and pulls slowly ahead — the opening shot of
	// Star Wars, not something entering from the wings.
	//
	// x and y are in HALF-HEIGHTS OF THE FRAME at whatever distance it currently
	// is, not world units, and that distinction is the whole of it: a fixed world
	// offset a metre from the lens is nine screen-widths off to the side, which is
	// exactly how it used to look — sliding in from the wings rather than coming
	// up from underneath you. In screen terms it holds its place low in the frame
	// and drifts to centre as it settles.
	// WHERE IT COMES FROM. Dead centre and straight up the axis: x and y are zero
	// and stay zero, so the swimmer starts directly behind you, out of sight, and
	// flies through the middle of the lens. It used to start off-centre and low
	// and RISE into the middle, which is a thing sliding into position rather
	// than a thing coming at you — and because it was off the axis it faded up in
	// front of the camera instead of emerging from behind it.
	//
	// z is how far behind the lens it starts, in world units.
	// SIXTEEN was fifteen units of nothing. The swimmer is hidden until it is
	// actually in front of the lens — it has to be, there is no way to see a
	// thing that is behind you — so every unit it spends further back is window
	// spent on an invisible approach, and the window is what pays for the pass
	// itself.
	//
	// Three is the least that still starts it wholly behind the lens. The model
	// is 4.07 units long and hangs about its OWN CENTRE (measured off
	// static/sperm.glb through the same loader tunnel.js uses: bbox z ±2.0334,
	// centre 0.000000), so the number that has to clear the lens plane is the
	// half-length, 2.03, not the length.
	spermFrom: { x: 0, y: 0, z: 3.0 },

	// The ovum turns too, slowly, about its own pole. rad/s.
	eggSpin: 0.16,

	// ── The motes ────────────────────────────────────────────────────────────
	// The field of debris the camera flies through. Without it the flight is a
	// zoom: there is nothing between the lens and the ovum for three hundred
	// units, so none of the distance reads. See world/tunnel.js.
	motes: 1200,
	moteSpan: 190,
	moteRadius: 56,
	moteLength: 3.2
};

// Where the camera has to stop for the shell to fill EGG_SCREEN of the frame's
// half-height. Derived, never typed — and derived from fovEnd, because that is
// the lens in force when the camera gets there.
export const CAM_END =
	TUNNEL.eggZ + TUNNEL.shellR / (EGG_SCREEN * Math.tan((TUNNEL.fovEnd * Math.PI) / 360));

// ── The icosahedron (scenes 3–4) ─────────────────────────────────────────────
export const ICOSA = {
	// Orthographic frustum HEIGHT. Width follows the viewport aspect.
	//
	// TWO of them, because the two scenes are looking at different things. The
	// conception has only the solid to show, so it is close on it and the solid
	// fills the frame; the computation has six rooms to get out of that solid,
	// so it pulls back to make room for them. The pull-back is not a cut — the
	// computation lerps from one to the other as the panes open, and that move
	// is most of why the panes read as coming OUT.
	// A TOUCH WIDER than it was. At 4.9 the sphere's 3.80 world units of
	// diameter took 78% of the frame height on a laptop, which is close enough
	// that the figure has nothing round it; 5.5 puts it at 69% and gives the
	// field somewhere to sit.
	//
	// It moves BOTH sides of the hand-over and that is by design: the fly-in
	// does not carry its own number for how big the ovum ends up, it derives it
	// from this one every frame (coreRatio() in FlyIn.svelte, against the void's
	// own range), so the sphere the flight arrives at and the sphere the
	// conception opens on are the same sphere however this is set.
	//
	// Landscape only, in practice. fit() takes the larger of this and what the
	// aspect demands, and portrait already demands 8.7.
	conceptionFrustum: 5.5,
	frustum: 13.0,
	camPos: [0, 0, 14],

	// ── The lens ─────────────────────────────────────────────────────────────
	// The camera is PERSPECTIVE now, on a very long lens, and it is driven by the
	// frustum height it has to fit rather than by a distance — applyFrustum()
	// parks it at whatever range makes `fr` world units fill the frame at the
	// plane it is focused on, so every framing number in this file still means
	// exactly what it meant under the orthographic camera it replaced.
	//
	// At `fov` it is very nearly orthographic, which is the register the whole
	// second half is drawn in: a technical projection, not a photograph. The
	// SURVEY opens it out to `fovWide` and walks the camera in to match, which is
	// a true dolly zoom — the framing does not change by a pixel and the SPACE
	// does: the near rooms swell off the frame and the far ones fall away. It is
	// the one moment in the run with any perspective in it, and it is what shows
	// you that the six rooms are hung in three dimensions rather than printed.
	fov: 12,
	fovWide: 22,
	near: 0.1,
	far: 400,

	// The resting orientation: straight down a FIVE-FOLD axis, so the nearest
	// vertex sits exactly on top of the farthest one and the figure is the
	// symmetric projection of itself.
	//
	// This reverses an earlier decision, and the earlier reasoning was that down
	// any symmetry axis an icosahedron COLLAPSES — pairs of vertices land on each
	// other and thirty edges read as a flat star — so the pose was chosen instead
	// by maximising the smallest on-screen gap between any two vertices. It
	// scored 0.412 of the circumradius and sat 11.89 degrees off the axis, which
	// is near enough to look like a mistake rather than like a choice.
	//
	// The reasoning was wrong about the cost. Down this axis exactly ONE pair
	// coincides — the two the axis runs through, which is the point — and every
	// other pair sits at 0.553 R, a third BETTER separated than the old pose's
	// worst. Nothing collapses that was not meant to.
	//
	// What it does cost: the first golden rectangle is 0.851 face-on rather than
	// 0.920. Scene 4 is built on that rectangle, so it is the number to watch if
	// the panes ever stop reading as coming squarely out of the frame. The
	// silhouette is very slightly better balanced in exchange, 0.986 wide-to-tall
	// against 1.047.
	tilt: [0.250894, 0.498826, 1.078968],

	// NOTE, and it has bitten once: the wireframe is built at the RAW vertex
	// scale — circumradius √(1+φ²) ≈ 1.902 — and must stay there. The decade
	// panes are built on those same raw coordinates, so at projection 0 a pane
	// sits exactly on the frame's own edges and appears to come out of it. Scale
	// the geometry and the panes no longer line up with the shape they emerge
	// from.

	// The circumsphere, on the void, is a RIM and nothing else: a gold circle the
	// frame is drawn inside. A filled shell at any opacity is a grey wash over
	// black, which is what a white sphere becomes the moment the ground stops
	// being white.
	shellSolid: 1.0,
	shellFaint: 0.55,

	// How far the panes travel out of the frame. The frustum is a HEIGHT, so a
	// tall screen sees a much narrower slice of the world than a wide one — and
	// the panes reach out sideways exactly as far as they reach up. Portrait
	// therefore gets a shorter reach AND a wider frustum (see restFrustum), and
	// even then it is a compromise: six rooms exploded off a solid is a landscape
	// composition.
	paneReach: 6.4,
	paneReachPortrait: 5.6,
	roomDepth: 3.0,

	// ── THE ARM ──────────────────────────────────────────────────────────────
	// The drafting does NOT stop where the room does. V2 hung the dimension lines
	// and the ratio bar three and a half units PAST the pane — 9.9 against 6.4 —
	// with the dashed traces running the whole way out from the vertices of the
	// solid, and that is the composition: a long thin arm reaching off the frame,
	// a room on it, and the working carried on out past the end. Bring the two
	// back level, as this had drifted into doing, and the arm stops being an arm.
	// It becomes a room with some line-work stacked on top of it.
	//
	// Held as a MULTIPLE rather than V2's fixed +3.5 so it survives the shorter
	// portrait reach: on a wide screen it is 6.4 × 1.55 = 9.9, which is V2's
	// number exactly.
	schematicReach: 1.55,

	// ── The lattice cage — a 600-cell ────────────────────────────────────────
	// Projected from 4D, hung around the solid and turning with it. It is the
	// polytope the icosahedron belongs to: its vertex figure IS an icosahedron
	// and its 120 vertices ARE the icosahedron's own rotation group, so the
	// search happens inside the space it is searching rather than beside it.
	// See three/geometry/cell600.js and the note over createCage().
	//
	// `fill` is how much of the frustum HEIGHT the figure spans at its widest —
	// well above 1, so it runs off the frame and reads as a space the scene is
	// inside rather than an object in it. Re-scaled from the live frustum every
	// frame, so it is locked to the screen at every zoom.
	//
	// 1.55 -> 1.4 is NOT smaller. The reach this is measured against was wrong:
	// the old bound assumed a vertex could sit at full imaginary radius AND at
	// full w at once, which it cannot, and over-estimated by 1.61x — so the cage
	// was quietly drawn at 62% of whatever this number asked for. Against the
	// exact bound, 1.4 is half again as big on screen as 1.55 was.
	//
	// And it was walked in from the other side too. At 2.0 and above the figure
	// is so large that all you see is a few long chords crossing the frame with
	// no structure in them, and the vertex-figure icosahedron — the whole point
	// of using this polytope — sits off the frame entirely. At 1.4 the shell is
	// on screen, concentric with the solid, and the boundary of the figure is
	// still outside it, so it reads as a space rather than as an object.
	cageFill: 1.4,

	// The distance the 4D perspective divide is taken from. Smaller = more
	// depth drama, because the magnification range is (W+1)/(W-1). The old 3.2
	// was set for 24-cell vertices at radius sqrt2; against unit quaternions it
	// flattens the breathing to almost nothing, which is the one thing a 4D
	// projection is for.
	cageW: 2.6,

	// ── The twist ────────────────────────────────────────────────────────────
	// Seconds per REGISTER. The two twists run on a five-fold and a three-fold
	// axis of the solid, whose quanta are 36 and 60 degrees, and one whole
	// quantum of each per cycle means that at the top of every cycle the map is
	// multiplication of a group by two of its own members: it permutes the 120
	// vertices and leaves the figure exactly where it was. So the cage drifts
	// out of alignment with the solid and comes back into it, precisely, every
	// nine seconds, and nothing about that is keyframed.
	cageCycle: 9,
	cageTwistA: 1,
	cageTwistB: 1,

	// 120 nodes instead of 24, so each one is smaller and pulls less weight.
	cageNode: 2.8,
	cageNodeGain: 1.0
};

// The frustum is a HEIGHT, so a tall viewport sees a much narrower slice of the
// world than a wide one — and both of these scenes are as wide as they are high.
// Each therefore names the world WIDTH it has to fit and opens the height out
// until it does. On any landscape screen both come back exactly as typed.
function fit(base, need, w, h) {
	return Math.max(base, need / (w / h));
}

// The conception: the circumcircle has to fit across, with a little air.
export function conceptionFrustum(w = 1, h = 1) {
	return fit(ICOSA.conceptionFrustum, CIRCUMRADIUS * 2.12, w, h);
}

// The computation: the panes reach out sideways exactly as far as they reach up.
// A little clipping at the extremes is deliberate — fitting the outermost corner
// of the outermost pane on a phone shrinks the whole assembly to nothing.
export function restFrustum(w = 1, h = 1) {
	const reach = aspectKind(w, h) === 'portrait' ? ICOSA.paneReachPortrait : ICOSA.paneReach;
	return fit(ICOSA.frustum, reach * 1.9, w, h);
}

// The sphere the frame is drawn inside. It IS the circumsphere: the twelve
// vertices sit exactly on it, which is the relationship the two shapes actually
// have, so the conception opens on the frame and its sphere as one object.
export const ICOSA_SPHERE_R = CIRCUMRADIUS;

// ── Aspect ───────────────────────────────────────────────────────────────────
// Three shapes of screen, because the site has to sit in all of them: phones
// are portrait, laptops are landscape, and tablets are neither.
export const ASPECT = {
	portraitBelow: 0.85,
	landscapeAbove: 1.2
};

export function aspectKind(w = 1, h = 1) {
	const r = w / h;
	if (r < ASPECT.portraitBelow) return 'portrait';
	if (r > ASPECT.landscapeAbove) return 'landscape';
	return 'square';
}
