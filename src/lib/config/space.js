// ── Space ────────────────────────────────────────────────────────────────────
// Every distance, size and camera setting in the 3D, in one place.
//
// The single most important number here is EGG_SCREEN. Scenes 2 and 3 use two
// different cameras — a perspective one for the tunnel and an orthographic one
// for the icosahedron — and the egg has to be in exactly the same place, at
// exactly the same size, on both sides of the cut. So neither scene picks a
// distance: they both derive one from EGG_SCREEN, and therefore agree at every
// aspect ratio without anyone having to keep two numbers in step.

// ── The egg ──────────────────────────────────────────────────────────────────
// How much of the frame's HALF-height the shell spans when it is at rest.
export const EGG_SCREEN = 0.78;
// The yolk, as a fraction of the shell.
export const EGG_CORE_RATIO = 0.82;

// ── The tunnel (scenes 1–2) ──────────────────────────────────────────────────
export const TUNNEL = {
	fov: 30,
	// Dial these apart to warp the lens through the fly-in. Equal = constant,
	// which is where it starts; widening on the way in exaggerates the rush.
	fovStart: 30,
	fovEnd: 30,

	near: 0.5,
	far: 400,

	// Where the camera starts, and where the egg is.
	camStart: 100,
	eggZ: -150,
	// World radius of the shell. How big it READS is EGG_SCREEN; the fly-in
	// turns the two into a stopping distance.
	shellR: 22,

	// Fog. Thin enough that the egg is a rumour at the start and present at the
	// end, rather than either invisible or hard-edged.
	fogDensity: 0.006,

	// The sperm rides this far in front of the lens once it has overtaken.
	spermLead: 5.5,
	// And this is where it is when the scene starts — behind the camera and off
	// the axis, because passing exactly through the lens is degenerate.
	spermFrom: { x: 2.4, y: -1.15, z: 14 },
	// Corkscrew, rad/s. Constant through everything; it is the one thing that
	// never stops.
	spermSpin: 10,
	// The model's own calibration. Do not move the model inside its group —
	// these offsets are what make it corkscrew instead of pirouette.
	spermScale: [0.2, 0.4, 0.2],
	spermOffset: { x: 0, y: -0.695, z: 4 },
	spermGroupY: -0.1
};

// Where the camera has to stop for the shell to fill EGG_SCREEN of the frame's
// half-height. Derived, never typed.
export const CAM_END =
	TUNNEL.eggZ + TUNNEL.shellR / (EGG_SCREEN * Math.tan((TUNNEL.fov * Math.PI) / 360));

// ── The icosahedron (scenes 2–3) ─────────────────────────────────────────────
export const ICOSA = {
	// Orthographic frustum HEIGHT at rest. Width follows the viewport aspect.
	frustum: 13,
	camPos: [0, 0, 14],
	near: 0.1,
	far: 100,

	// Face-on, down a 3-fold axis, which is the view the reference diagram is
	// drawn in: the silhouette is a hexagon and every edge is visible.
	// See geometry/icosahedron.js — THREE_FOLD_VIEW.
	// The computation adds its own tilt on top so the panes read as solid.
	tilt: [-0.32, 0.55, 0],

	// NOTE, and it has bitten once: the wireframe is built at the RAW vertex
	// scale — circumradius √(1+φ²) ≈ 1.902 — and must stay there. The decade
	// panes are built on those same raw coordinates, so at projection 0 a pane
	// sits exactly on the solid's own edges and appears to come out of it. Scale
	// the geometry and the panes no longer line up with the shape they emerge
	// from, and the solid outgrows the sphere it is supposed to sit softly
	// inside.

	// The shell, once the panes are out: it draws in to this and thins to that,
	// so it reads as a bubble around the polyhedron rather than a blue wash.
	shellSettled: 0.6,
	shellFaint: 0.4,

	// How far the panes travel out of the sphere. Owned by GoldenRectangle.
	paneReach: 6.4
};

// The sphere radius scene 3 must build to land on scene 2's egg exactly.
export const ICOSA_EGG_R = (EGG_SCREEN * ICOSA.frustum) / 2;

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
