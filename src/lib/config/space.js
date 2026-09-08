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
	// egg reads as a long way off through the fog, opening out as the camera
	// closes on it. Widening on the way in is what exaggerates the rush — the
	// same move a dolly zoom makes, and for the same reason.
	//
	// `fov` is the resting value the camera is BUILT at; `fovEnd` is what the
	// framing is derived from, because that is the lens the scene finishes on.
	fov: 26,
	fovStart: 26,
	fovEnd: 44,

	near: 0.5,
	far: 520,

	// Where the camera starts, and where the ovum is. 230-odd units of travel,
	// and the length of the swim is half the drama: at the old distances the
	// camera crossed a quarter of the gap and the arrival had nowhere to build
	// from.
	camStart: 110,
	eggZ: -180,
	// World radius. How big it READS is EGG_SCREEN; the fly-in turns the two
	// into a stopping distance.
	shellR: 26,
	// The glow it comes up out of, as a multiple of its diameter.
	haloSpread: 7.0,
	// How much body the silhouette has. A few percent — enough to occlude the
	// motes behind it, not enough to be a surface.
	skinBase: 0.05,

	// Fog. Thick enough that the ovum is a rumour at the start and present at the
	// end. It is doing the whole of the arrival, so it is worth being fussy
	// about: at this density it is 99% fogged when the scene opens and 15% fogged
	// when the camera stops.
	fogDensity: 0.0072,

	// ── The sperm ────────────────────────────────────────────────────────────
	// ONE. Sizes here are FRACTIONS OF THE FRAME, not scale factors on a model
	// whose file we do not control: world/tunnel.js normalises the mesh and works
	// these out against the half-height of the frame at the riding distance, so
	// changing the lens or the lead re-frames the shot rather than breaking it.
	//
	// It rides this far in front of the lens once it has overtaken.
	spermLead: 8,
	// How much of the frame HEIGHT it covers at that distance — its width ACROSS
	// the frame, because the body points away from the camera and its length is
	// foreshortened to almost nothing.
	spermSpan: 0.42,
	// The contour set drawn on it: rings around the body and stripes along it,
	// per unit of the model's own geometry. This is the wire DENSITY, and it is
	// ours to choose — the mesh's own wireframe is nine thousand triangles of
	// tube and renders as a solid ribbon.
	spermRings: 4,
	spermLongs: 7,
	spermGain: 1.0,
	// Where it is when the scene starts — behind the camera and off the axis,
	// because passing exactly through the lens is degenerate.
	spermFrom: { x: 3.6, y: -1.7, z: 18 },
	// THE ROLL, and it is V1's exactly: one turn every four seconds, linear,
	// clockwise from the camera, about the body's OWN long axis. Not an orbit —
	// the model sits at the spinner's origin, so nothing swings. Constant through
	// everything; it is the one thing in the scene that never stops.
	spermRollPeriod: 4,
	// The ovum turns too, slowly, about its own pole. rad/s.
	eggSpin: 0.16,

	// ── The motes ────────────────────────────────────────────────────────────
	// The field of debris the camera flies through. Without it the flight is a
	// zoom: there is nothing between the lens and the egg for 180 units, so
	// none of the distance reads. See world/tunnel.js.
	motes: 900,
	moteSpan: 160,
	moteRadius: 48,
	moteLength: 3.0
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
	conceptionFrustum: 4.9,
	frustum: 13.0,
	camPos: [0, 0, 14],
	near: 0.1,
	far: 100,

	// The resting orientation, and it is worth being fussy about. Looked at down
	// any of its symmetry axes an icosahedron COLLAPSES: pairs of vertices land
	// on top of each other in projection and thirty edges read as a flat star.
	//
	// This pose was picked by maximising the smallest gap between any two of the
	// twelve vertices on screen, subject to one extra condition — that the first
	// golden rectangle stays nearly square to the camera. It scores 0.412 of the
	// circumradius, which is the global maximum to three figures, at 0.92 face-on
	// and a silhouette almost exactly as wide as it is tall.
	//
	// (The pose it replaced scored 0.21 on the same measure and 0.71 face-on,
	// which is why the frame read as a tangle and the rectangle the whole of
	// scene 4 is built on was never legible in it.)
	tilt: [0.27, 0.302, 1.135],

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
	paneReachPortrait: 4.2,
	roomDepth: 3.0,

	// How much the sphere opens out as the rooms come through it. It starts as
	// the frame's exact circumsphere and only ever eases off that.
	sphereGrow: 1.35,

	// The lattice cage — a 24-cell, projected from 4D, hung around the solid and
	// turning with it. It is the same figure the blueprint field rules the ground
	// with, in three dimensions instead of two, so the search happens inside the
	// space it is searching. Radius as a multiple of the circumradius.
	cageRadius: 3.4,
	// 4D rotation rates, rad/s, for the three planes that involve w. Slow: the
	// cage is atmosphere, and a fast one turns the scene into a screensaver.
	cageSpin: [0.11, 0.083, 0.061],

	// The lattice cage. `fill` is how much of the frustum HEIGHT the figure spans
	// at its widest — above 1, so it runs off the frame the way V2's did and
	// reads as a space the scene is inside rather than an object in it. It is
	// re-scaled from the live frustum every frame, so it is locked to the screen
	// at every zoom.
	cageFill: 1.55,
	cageNode: 3.5,
	cageNodeGain: 1.6
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
