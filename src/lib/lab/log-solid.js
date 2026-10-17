// ── The solid: the 2D room rebuilt as a 3D room ──────────────────────────────
// The site's room is a flat drawing. This rebuilds it: every object in it —
// the desk and its drawers, the red anglepoise, the monitor, keyboard and
// tower, the bed with its blanket and the magazine on it, the clock and the
// posters — modelled as a real thing in a real room: a plank floor, an orange
// ceiling, the back wall the posters hang on, open to the blue on the other
// three sides, as a perspective study is. The colours are the drawing's own,
// flat, each face shaded by a gradient and a touch of light baked into it;
// every part has its white edge line, and the big ones their construction
// lines run out long through the whole room. From the one eye point with the
// long lens the model lines up with the drawing; every variant is a LOOP
// that leaves that elevation and comes home to it.
//
// The loops are the files `solid/loop-*.js`; the parts the files
// `solid/{room,desk,lamp,computer,bed,wall}.js`, on the kit `solid/parts.js`.
//
//   orbit    out of the elevation on a dolly zoom and once round the room:
//            under the floor looking up, round the side, over the ceiling
//            looking down, and home
//   swing    the study's low rolled corner shots: under the floor at the
//            bed's corner, over the ceiling's far corner, the lens rolled
//   inside   in through the open front, up at the ceiling, round the desk,
//            up the wall to the clock and the posters, and out
//   sheet    the drawing set: the perspective view, the plan with the
//            ceiling lifted away, the section, each captioned, and back
//   explode  the exploded diagram: every part out along its construction
//            lines, which stay, and home, the lens arcing over
//   draw     the drawing stands up: the flat layers dissolve into the
//            solids as the lens leaves the eye, and come back as it returns
//   turn     the model shot: the room turns once on the blue, the lens low
//            and wide (built in; the other loops are the loop files)
//
//   ?part=desk|lamp|computer|bed|wall|room   that object alone on a slow
//                                            turntable, to look at it
//   ?ink=1                                   the room as a SKETCH: the board's
//                                            dark, chalk lines, no colour and
//                                            no textures (parts.js's ink
//                                            mode), the drawing's flats in
//                                            chalk — the look the flows take
//                                            it in
//   ?at=0.42                                 pins a frame; every frame is a
//                                            pure function of progress
//
// Drawn on the lab's three.js renderer; the board over it is kept clear but
// for the tag and whatever a loop writes on the sheet.

import { TAU, getBoard, clock, tag, variant, lerp, smooth, span, TECH_FONT } from './log/board.js';
import { kit, explode, PAL, W, H, DEPTH, SX } from './solid/parts.js';
import { build as buildRoom } from './solid/room.js';
import { build as buildDesk } from './solid/desk.js';
import { build as buildLamp } from './solid/lamp.js';
import { build as buildComputer } from './solid/computer.js';
import { build as buildBed } from './solid/bed.js';
import { build as buildWall } from './solid/wall.js';
import { build as buildFlats } from './solid/flats.js';
import { loadRooms } from './log/rooms.js';

// Every loop file registers here: its name, its length, its pose and (if it
// has one) its act. A loop file exports `seconds`, `pose(u, api)` and
// optionally `act(u, api)`.
const LOOPS = import.meta.glob('./solid/loop-*.js', { eager: true });

const FOV0 = 12; // the long lens at the eye: the drawing
const FIT = 1.18; // the view's half-height at the frame plane, in frame units
const dist = (fov) => FIT / Math.tan((fov * Math.PI) / 360);
const D0 = dist(FOV0); // the eye's distance from the frame plane, ≈ 11.2
const EYE = [0, 0, D0];
const T = [0, 0, -0.9]; // what the loops look at, by default: inside the room

export default async function make({ THREE, renderer, at }) {
	const loops = {};
	for (const [path, mod] of Object.entries(LOOPS)) {
		const name = path.match(/loop-([a-z0-9-]+)\.js$/)[1];
		loops[name] = mod;
	}
	const names = ['turn', ...Object.keys(loops).sort()];
	const v = variant(names);
	const q = new URLSearchParams(location.search);
	const only = q.get('part');
	const ink = q.get('ink') === '1';
	const loop = loops[v];
	const seconds = only ? 12 : loop ? loop.seconds : 12;
	const time = clock(seconds, at);
	const b = getBoard();
	const K = kit(THREE, { ink });

	// ── The room ─────────────────────────────────────────────────────────────
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(ink ? PAL.board : PAL.ground);
	const room = new THREE.Group();
	scene.add(room);
	const builders = {
		room: buildRoom,
		desk: buildDesk,
		lamp: buildLamp,
		computer: buildComputer,
		bed: buildBed,
		wall: buildWall
	};
	const objects = {};
	await Promise.all(
		Object.entries(builders).map(async ([name, build]) => {
			objects[name] = await build(K);
		})
	);
	for (const [name, g] of Object.entries(objects)) {
		if (only && name !== only) continue;
		room.add(g);
	}
	// The parts by name, for the loops.
	const parts = {};
	room.traverse((o) => {
		if (o.userData.part) parts[o.userData.part.name] = o;
	});

	// The drawing's flats, for a loop that fades between the two — in chalk
	// when the room is a sketch.
	const flats = await buildFlats(K, '90s', {
		art: ink ? await loadRooms({ decades: ['90s'], chalk: true }) : null
	});
	scene.add(flats.group);

	// ── The lens ─────────────────────────────────────────────────────────────
	const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.02, 100);
	const orbitAt = (az, el, R, C = T) => [
		C[0] + R * Math.sin(az) * Math.cos(el),
		C[1] + R * Math.sin(el),
		C[2] + R * Math.cos(az) * Math.cos(el)
	];
	// The dolly zoom's two ends: the long lens at the eye, a wide one close
	// in, the frame held the same size.
	function dolly(f, fov1) {
		const fov = lerp(FOV0, fov1, f);
		return { fov, pos: [0, 0, dist(fov)] };
	}

	// What a loop is given.
	let caption = null;
	const api = {
		THREE,
		lerp,
		smooth,
		span,
		TAU,
		FOV0,
		D0,
		EYE,
		T,
		W,
		H,
		DEPTH,
		SX,
		dist,
		dolly,
		orbitAt,
		room,
		parts,
		objects,
		explode: (k) => explode(room, k),
		flats: (a) => flats.setOpacity(a),
		// A line on the sheet over the drawing, as a drawing sheet is titled:
		// a number at the left, the title centred, a rule under.
		caption: (num, title, alpha = 1) => (caption = alpha > 0.001 ? { num, title, alpha } : null)
	};

	// One object alone on a turntable, fitted.
	const bbox = new THREE.Box3();
	let fit = null;
	if (only) {
		// The meshes only: the construction lines run out past everything.
		room.updateMatrixWorld(true);
		room.traverse((o) => {
			if (!o.isMesh) return;
			o.geometry.computeBoundingBox();
			bbox.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));
		});
		const c = bbox.getCenter(new THREE.Vector3());
		const s = bbox.getSize(new THREE.Vector3());
		fit = { c: [c.x, c.y, c.z], r: Math.max(s.x, s.y, s.z) * 1.1 + 0.4 };
	}

	function pose(u) {
		if (fit) {
			const az = TAU * u;
			const el = 0.35;
			return { fov: 40, pos: orbitAt(az, el, fit.r * 1.8, fit.c), look: fit.c, roll: 0 };
		}
		if (loop) return loop.pose(u, api);
		// turn: out of the elevation to a low wide shot, the room turned once
		// under it, and back.
		const A = 0.16;
		const f = u < A ? smooth(span(u, 0, A)) : u > 1 - A ? smooth(span(u, 1, 1 - A)) : 1;
		const s = smooth(span(u, A, 1 - A));
		// Out of the elevation to a model shot — the lens pulled back far
		// enough to clear the room all the way round — and back.
		const fov = lerp(FOV0, 50, f);
		const R = lerp(D0 - T[2], 6.2, f);
		const az = TAU * s;
		const el = 0.26 * f;
		return { fov, pos: orbitAt(az, el, R), look: T, roll: 0 };
	}

	function setCamera(u) {
		const { fov, pos, look, roll = 0 } = pose(u);
		camera.fov = fov;
		camera.position.set(...pos);
		camera.up.set(Math.sin(roll), Math.cos(roll), 0);
		camera.lookAt(look[0], look[1], look[2]);
		camera.updateProjectionMatrix();
	}

	function resize(w, h) {
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	resize(window.innerWidth, window.innerHeight);

	function sheet(ctx, w, h) {
		if (!caption) return;
		const { num, title, alpha } = caption;
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = '#ffffff';
		ctx.strokeStyle = 'rgba(255,255,255,0.8)';
		ctx.lineWidth = 1;
		const y = Math.round(h * 0.09);
		const x0 = Math.round(w * 0.12);
		const x1 = Math.round(w * 0.88);
		ctx.font = `600 ${Math.round(h * 0.022)}px ${TECH_FONT}`;
		ctx.textBaseline = 'alphabetic';
		ctx.textAlign = 'left';
		ctx.fillText(num, x0, y);
		ctx.textAlign = 'center';
		ctx.fillText(title, w / 2, y);
		ctx.textAlign = 'right';
		ctx.fillText('VIEW', x1, y);
		ctx.beginPath();
		ctx.moveTo(x0, y + 10);
		ctx.lineTo(x1, y + 10);
		ctx.stroke();
		ctx.restore();
	}

	function render() {
		const u = time.u;
		caption = null;
		if (!fit) {
			explode(room, 0);
			flats.setOpacity(0);
			if (loop && loop.act) loop.act(u, api);
		}
		setCamera(u);
		renderer.render(scene, camera);
		const { ctx, dpr, w, h } = b;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, b.canvas.width, b.canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		sheet(ctx, w, h);
		tag(ctx, w, h, `log-solid · ${only ? 'part ' + only : v}${ink ? ' · ink' : ''}`);
	}

	return {
		info: { seconds, variant: v, part: only || null, ink },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize
	};
}
