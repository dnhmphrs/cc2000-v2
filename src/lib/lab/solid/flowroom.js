// ── The ink room for a flow ──────────────────────────────────────────────────
// The solid room drawn as a sketch (parts.js's ink mode) for a flow to land
// in: a flow that flies its lens at the room's chalk pane hands the pane over
// to this, which opens on the SAME picture — the chalk layers, flat, at the
// pane's own place and size on the page — and then dollies in, the chalk
// dissolving into the hidden-line model, and walks the lens into the room:
// in over the bed's foot, up at the ceiling, round to the desk, up the wall
// to the clock and the posters. Six seconds, the lead's; the final 2D image
// is not settled, so until it is the room is this sketch.
//
//   makeFlowRoom({ THREE, renderer, decade, art }) → { render, perspScale }
//   render({ w, h, cx, cy, height, dolly, walk, flatsA })
//     the pane: its centre (cx, cy) and height in page px, the frame's own
//     2 units tall; dolly 0…1 the dolly zoom out of the elevation, walk 0…1
//     the way in, flatsA the chalk layers over the model.
//   perspScale(depth, h, height): how much a layer at that depth shrinks,
//     seen from the elevation's eye — the pane shrinks its layers by this
//     as the lens lands, so the handover has no seam.

import { kit, PAL, DEPTH } from './parts.js';
import { build as buildRoom } from './room.js';
import { build as buildDesk } from './desk.js';
import { build as buildLamp } from './lamp.js';
import { build as buildComputer } from './computer.js';
import { build as buildBed } from './bed.js';
import { build as buildWall } from './wall.js';
import { build as buildFlats } from './flats.js';

export const FOV0 = 12; // the long lens at the eye: the pane, flat
const FOV1 = 68; // the wide lens the dolly zoom arrives at
const T = -0.9; // the room's middle, what the elevation looks at

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const span = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const tanHalf = (fov) => Math.tan((fov * Math.PI) / 360);

// The eye's distance from the frame plane for a pane `height` px tall on a
// page `h` px tall: the view's half-height at the frame plane is h/height
// frame units.
export function perspScale(depth, h, height) {
	const D = h / height / tanHalf(FOV0);
	return D / (D + depth * DEPTH);
}

// The walk, in room units: [x, y, z, yaw, pitch] at s = 0, 0.25, 0.5, 0.75, 1
// (yaw positive to the right, pitch positive up). The first key is the
// dolly's end, on the axis at the open front; the keys stay in the open air
// (over the bed, in front of the desk, under the ceiling).
const KEYS = [
	[0, 0, 1.75, 0, 0],
	[0.5, -0.05, 0.1, -0.1, 0.2], // in over the bed's foot, lifting its eyes
	[0.05, 0.2, -1.0, 0, 0.45], // the room's middle, up at the ceiling
	[0.55, 0.3, -1.1, 0.15, -0.2], // down and right to the desk, the tower close
	[0.75, 0.38, -1.0, -0.45, 0.15] // along the desk and up the wall: the clock, the posters
];
function key(s) {
	const n = KEYS.length - 1;
	const x = clamp01(s) * n;
	const i = Math.min(n - 1, Math.floor(x));
	const t = x - i;
	const P = (k) => KEYS[Math.max(0, Math.min(n, k))];
	const p0 = P(i - 1);
	const p1 = P(i);
	const p2 = P(i + 1);
	const p3 = P(i + 2);
	// Catmull-Rom, the tangents clamped at the ends.
	return p1.map((_, c) => {
		const m1 = i === 0 ? p2[c] - p1[c] : (p2[c] - p0[c]) / 2;
		const m2 = i === n - 1 ? p2[c] - p1[c] : (p3[c] - p1[c]) / 2;
		const t2 = t * t;
		const t3 = t2 * t;
		return (
			(2 * t3 - 3 * t2 + 1) * p1[c] +
			(t3 - 2 * t2 + t) * m1 +
			(-2 * t3 + 3 * t2) * p2[c] +
			(t3 - t2) * m2
		);
	});
}

export async function makeFlowRoom({ THREE, renderer, decade = '90s', art = null }) {
	const K = kit(THREE, { ink: true });
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(PAL.board);
	const room = new THREE.Group();
	scene.add(room);
	const parts = await Promise.all(
		[buildRoom, buildDesk, buildLamp, buildComputer, buildBed, buildWall].map((b) => b(K))
	);
	for (const g of parts) room.add(g);
	const flats = await buildFlats(K, decade, { art });
	scene.add(flats.group);
	const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.02, 100);
	// One frame now, under the board, so the shaders are built before the
	// handover rather than on it.
	flats.setOpacity(1);
	renderer.render(scene, camera);

	function render({ w, h, cx, cy, height, dolly = 0, walk = 0, flatsA = 1 }) {
		const FIT = h / height; // the view's half-height at the frame plane, in frame units
		const ux = (2 * FIT) / h; // frame units per page px, at the frame plane
		// The lens off the axis so the frame's centre lands on the pane's.
		const ox = -(cx - w / 2) * ux;
		const oy = (cy - h / 2) * ux;
		const d = smooth(dolly);
		const s = smooth(walk);
		const fov = lerp(FOV0, FOV1, d) + 6 * Math.sin(Math.PI * s);
		const dist = FIT / tanHalf(fov);
		// The dolly's own pose, the frame held; then the walk's, blended in
		// over its first quarter so the offset eases away.
		const [kx, ky, kz, yaw, pitch] = key(s);
		const bl = smooth(span(s, 0, 0.25));
		const pos = [lerp(ox, kx, bl), lerp(oy, ky, bl), lerp(dist, kz, bl)];
		const cp = Math.cos(pitch);
		const lookWalk = [kx + Math.sin(yaw) * cp, ky + Math.sin(pitch), kz - Math.cos(yaw) * cp];
		const look = [lerp(ox, lookWalk[0], bl), lerp(oy, lookWalk[1], bl), lerp(T, lookWalk[2], bl)];
		camera.fov = fov;
		camera.aspect = w / h;
		camera.position.set(...pos);
		camera.up.set(0, 1, 0);
		camera.lookAt(look[0], look[1], look[2]);
		camera.updateProjectionMatrix();
		flats.setOpacity(flatsA);
		renderer.render(scene, camera);
	}

	return { render, perspScale };
}
