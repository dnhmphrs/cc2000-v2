// ── Space ────────────────────────────────────────────────────────────────────
// Every distance, size and camera setting in the 3D, in one place.

import { CIRCUMRADIUS } from '$lib/three/geometry/icosahedron';

// ── The egg ──────────────────────────────────────────────────────────────────
// How much of the frame's HALF-height the fly-in's egg spans when the camera
// parks in front of it. Only the fly-in reads this — the run blows out to white
// between that scene and the next, so nothing downstream has to agree with it.
export const EGG_SCREEN = 0.78;
// The yolk, as a fraction of the shell.
export const EGG_CORE_RATIO = 0.82;

// ── The tunnel (scene 2) ─────────────────────────────────────────────────────
export const TUNNEL = {
	// The lens WARPS through the fly-in: long and compressed at the start, so the
	// egg reads as a long way off through the fog, opening out as the camera
	// closes on it. Widening on the way in is what exaggerates the rush — the
	// same move a dolly zoom makes, and for the same reason.
	//
	// `fov` is the resting value the camera is BUILT at; `fovEnd` is what the
	// framing is derived from, because that is the lens the scene finishes on.
	fov: 24,
	fovStart: 24,
	fovEnd: 46,

	near: 0.5,
	far: 460,

	// Where the camera starts, and where the egg is. 180-odd units of travel.
	camStart: 100,
	eggZ: -150,
	// World radius of the shell. How big it READS is EGG_SCREEN; the fly-in
	// turns the two into a stopping distance.
	shellR: 22,
	// The glow it comes up out of, as a multiple of the shell's diameter.
	haloSpread: 7.5,

	// Fog. Thick enough that the egg is a rumour at the start and present at the
	// end. It is doing the whole of the arrival, so it is worth being fussy
	// about: at this density the egg is 97% fogged when the scene opens and 22%
	// fogged when the camera stops.
	fogDensity: 0.0075,

	// ── The hero ─────────────────────────────────────────────────────────────
	// SIZES HERE ARE FRACTIONS OF THE FRAME, not scale factors on a model whose
	// file we do not control. world/tunnel.js normalises the model — centred on
	// its own bounding box, longest dimension scaled to one world unit — and then
	// works everything below out against the half-height of the frame at the
	// riding distance. Change the lens or the lead and the shot re-frames itself.
	//
	// (This is the bug that made the old fly-in read as an empty blue rectangle:
	// the corkscrew radius was a raw number from the file, and at the distance
	// the sperm actually rode it swung the body clean out of frame for the whole
	// scene.)
	//
	// It rides this far in front of the lens once it has overtaken.
	spermLead: 7,
	// The body's length, as a fraction of the frame HEIGHT at that distance.
	spermSpan: 0.5,
	// How far off the flight axis it corkscrews, as a fraction of the frame's
	// half-height at that distance.
	spermOrbit: 0.34,
	// And this is where it is when the scene starts — behind the camera and off
	// the axis, because passing exactly through the lens is degenerate.
	spermFrom: { x: 3.4, y: -1.6, z: 16 },
	// Corkscrew, rad/s. Constant through everything; it is the one thing that
	// never stops.
	spermSpin: 9,
	spermGroupY: -0.1,

	// ── The pack ─────────────────────────────────────────────────────────────
	// Five more, dimmer, riding NEARER the lens than the hero. They lose: each
	// one slips back past the camera in its own time, so the flight has a running
	// score rather than one animal swimming.
	rivalLead: [3.2, 4.0, 4.8, 5.6, 6.4],
	// How far each slips BACK relative to the camera over the run. Staggered, so
	// the pack is overtaken one at a time — five going at once is a wipe.
	rivalLag: [5.0, 8.0, 11.0, 15.0, 20.0],
	// How far off the axis each rides, as a fraction of the frame's half-height
	// AT ITS OWN DISTANCE, so the spread reads the same whatever the lead.
	rivalRing: 0.55,
	rivalSpin: 7.5,
	rivalScale: 0.62,

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
	paneReach: 4.6,
	paneReachPortrait: 3.2,
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

	// The attitude the search HOLDS while it is looking around. Each decade is
	// turned round to the camera but deliberately not square to it, so the rooms
	// stay at the angle they burst out of the frame at and you keep reading them
	// as faces of a solid rather than as slides. Only the answer's own turn
	// squares up — which is what makes that last turn land.
	searchOblique: [0.18, -0.45, 0.04]
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
