// ── The hall: a corridor of rooms, on the GPU, under the board ───────────────
// flow-strand-corridor's corridor walls: a long box seen from inside, its four
// surfaces set with the decades' chalk rooms like windows — exact perspective,
// mipmapped (no shimmer at a grazing angle), fogged into the dark, lit warm
// near its far end by the last room's light, in a slow turn of warm colours
// round the axis — and, on the floor of its last stretch, a ruler of the
// days. Everything that is LINE or TYPE (the corridor's rings and edges, the
// signs, the swimmer, the last room, the door's workings) is the flow's, on
// the board over it, which is cleared to transparent there.
//
// Two layers, each as cheap per fragment as it can be (on a software GPU —
// the headless probe's, a weak phone's — the fragments are the frame's
// cost): the walls' light, opaque over the ground, its colour worked
// wholly per vertex and laid only as far from the end as it shows; then the
// rooms, one instanced draw of the plates from one atlas, a texture read
// and a multiply a fragment, and only where a plate is. (One opaque pass
// whose walls worked out their own plates per fragment was tried, and cost
// more: the per-fragment arithmetic over the whole of every wall, and a
// software GPU reads a branch's texture whichever way it goes.)
//
//   const hall = makeHall({ THREE, renderer, art, tint })
//                     art: loadRooms({ chalk: true }); tint: { decade: colour }
//                     for the rooms' labels
//   hall.build({ Hc, Wc, cell0, pitch, cells, floorFrom, ruler })
//                     per answers and board
//     cells      the decade of each cell, near the end first: cell k runs
//                from z = cell0 + k·pitch to one pitch on, a room's plate
//                (2φ × 2, its label under it) centred on each of its walls
//     floorFrom  the first cell with a plate on the floor (the ruler is on
//                the floor before it)
//     ruler      { canvas, z0, z1 } the floor's ruler, from z0 to z1 (or null)
//                (a canvas of a new size replaces the texture's)
//   hall.render({ w, h, pos, target, up, fov, offset, reach, light, turn, alpha })
//     the lens (plate units, the fall's world: the last plate at z = 0, x
//     right, y up, z toward the lens), `fov` vertical degrees, `offset`
//     [ox, oy] the screen point the axis meets (null: the centre); `light`
//     the far end's light, 0…; `turn` the colours' turn;
//     `alpha` all of it (0 draws only the ground). `reach`: the rooms are on
//     where z is short of it, each fading in over HALL.edge of z behind it
//     (they come in far → near as it grows).
//
// Plate units are the fall's (log/fall.js, log/rooms.js PLATE): a room's
// frame is 2φ wide and 2 tall. Colours are the display's, as the board's:
// the hall renders with the output in the working space, so there is no
// output pass (nor its cost: a half-float target and a full-screen pass a
// frame), textures are read raw and blend as the board's canvas does (raw()).

import {
	uniform,
	texture,
	uv,
	vec4,
	float,
	exp,
	smoothstep,
	mix,
	clamp,
	length,
	atan,
	fract,
	positionWorld,
	vertexStage,
	cameraPosition,
	instancedBufferAttribute
} from 'three/tsl';
import { PAL, PHI, TAU, TECH_FONT } from './board.js';
import { drawRoom, DECADES, DECADE_NAME } from './rooms.js';

export const HALL = {
	label: 0.34, // the label band under a room, plate units
	fog: 26, // the rooms fade with distance d as 1 / (1 + (d / fog)²)
	lam: 9, // the far end's light falls off as e^(−z / lam)
	glow: 0.11, // … and lights the walls by this much at most
	cell: 1024, // an atlas cell's width, px
	edge: 10 // a room fades in over this much z behind the reach's front
};

const PW = 2 * PHI; // a room's frame, plate units
const PH = 2;
const WALLS = ['left', 'right', 'ceiling', 'floor'];

export function makeHall({ THREE, renderer, art, tint = {} }) {
	// Display colours, as the board's: the hall renders straight to the
	// canvas with no output pass (render() below), so a colour is the number
	// that lands, whatever ColorManagement says.
	const raw = (hex) => {
		const n = parseInt(hex.replace('#', ''), 16);
		return new THREE.Color().setRGB(
			((n >> 16) & 255) / 255,
			((n >> 8) & 255) / 255,
			(n & 255) / 255,
			THREE.LinearSRGBColorSpace
		);
	};
	const scene = new THREE.Scene();
	scene.background = raw(PAL.ground);
	const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 600);
	const disposables = [];
	const DBG = new URLSearchParams(location.search);
	const aniso = Number(DBG.get('aniso') ?? 2);

	// ── The atlas: the four rooms in chalk, framed, labelled ─────────────────
	// 2 × 2 cells, each a room (2φ : 2) over its label band, a gutter between
	// so a far mip never bleeds one room into the next.
	const CW = HALL.cell;
	const RH = Math.round(CW / PHI);
	const LH = Math.round((CW * HALL.label) / PW);
	const G = 24;
	const CH = RH + LH;
	const atlasCanvas = document.createElement('canvas');
	atlasCanvas.width = 2 * CW + 3 * G;
	atlasCanvas.height = 2 * CH + 3 * G;
	const rects = {};
	{
		const x = atlasCanvas.getContext('2d');
		DECADES.forEach((d, i) => {
			const cx = G + (i % 2) * (CW + G);
			const cy = G + Math.floor(i / 2) * (CH + G);
			x.save();
			drawRoom(x, art, d, {
				cx: cx + CW / 2,
				cy: cy + RH / 2,
				height: RH,
				chalk: true,
				clip: true
			});
			x.restore();
			// The frame, in chalk, as the fall draws a plate's.
			x.strokeStyle = PAL.chalk;
			x.globalAlpha = 0.9;
			x.lineWidth = 7;
			x.strokeRect(cx + 3.5, cy + 3.5, CW - 7, RH - 7);
			// The label under it, a museum's: THE 1990s, in its wing's colour.
			x.globalAlpha = 0.8;
			x.fillStyle = tint[d] ?? PAL.chalk;
			x.font = `400 ${Math.round(LH * 0.5)}px ${TECH_FONT}`;
			x.textAlign = 'center';
			x.textBaseline = 'middle';
			x.fillText(`THE ${DECADE_NAME[d]}`, cx + CW / 2, cy + RH + LH * 0.56);
			x.globalAlpha = 1;
			const W = atlasCanvas.width;
			const H = atlasCanvas.height;
			// uv: (u0, v0, du, dv), v up from the canvas's bottom.
			rects[d] = [cx / W, 1 - (cy + CH) / H, CW / W, CH / H];
		});
	}
	const atlas = new THREE.CanvasTexture(atlasCanvas);
	atlas.colorSpace = THREE.NoColorSpace;
	// Premultiplied, so that a far mip's colour is the ink's and not the ink
	// averaged with the transparent black round it (the labels keep their
	// wings' colours to the far end); unpremultiplied as it is read.
	atlas.premultiplyAlpha = true;
	atlas.generateMipmaps = true;
	atlas.minFilter = THREE.LinearMipmapLinearFilter;
	atlas.magFilter = THREE.LinearFilter;
	atlas.anisotropy = aniso;
	disposables.push(atlas);

	// ── Uniforms ─────────────────────────────────────────────────────────────
	const uReach = uniform(1e6);
	const uLight = uniform(0.3);
	const uTurn = uniform(0);
	const uAlpha = uniform(1);
	const uFog = uniform(HALL.fog);
	const uLam = uniform(HALL.lam);
	const uWarm = uniform(raw('#ffc98a'));
	const uHc = uniform(1);
	const uWc = uniform(1);

	// Everything that varies over a surface is worked per VERTEX (the
	// surfaces are cut fine enough for it); a fragment reads its texture,
	// if it has one, and multiplies.
	const pw = positionWorld;
	const dist = length(pw.sub(cameraPosition));
	const fog = float(1).div(float(1).add(dist.div(uFog).pow(2)));
	const lit = exp(pw.z.max(0).div(uLam).negate()).mul(uLight);
	// The rooms come in far → near: on where z is short of the reach.
	const on = float(1).sub(smoothstep(uReach, uReach.add(HALL.edge), pw.z));
	// How much of a room's (or the ruler's) chalk shows, and its colour:
	// chalk, warmed near the far end.
	const shows = vertexStage(on.mul(uAlpha).mul(clamp(fog.add(lit.mul(0.7)), 0, 1)));

	// The rooms: off the atlas, chalk (and the labels' colours), warmed
	// near the far end.
	const rectAttr = new THREE.InstancedBufferAttribute(new Float32Array(4 * 512), 4);
	const aRect = instancedBufferAttribute(rectAttr, 'vec4');
	const roomMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	{
		const c = texture(atlas, aRect.xy.add(uv().mul(aRect.zw)));
		const warm = vertexStage(clamp(lit.mul(0.7), 0, 0.8));
		const col = mix(c.rgb.div(c.a.max(1 / 255)), uWarm, warm);
		roomMat.colorNode = vec4(col, c.a.mul(1.2).min(1).mul(shows));
	}
	disposables.push(roomMat);

	// The walls: no paint of their own, only the far end's light on them —
	// the ground and that light over it, in warm colours turning round the
	// axis (reds, oranges, golds, yellows): angle-coloured, as the lead's
	// sunshine lattice is. Wholly per vertex (the ramp is cyclic, so the
	// colour is continuous round the axis and interpolates), and OPAQUE:
	// from inside the box each pixel sees one wall, so the light is laid
	// with the ground under it rather than added onto the cleared ground
	// (the same picture, without a blend's read of every pixel behind). (A
	// pass that laid the plates opaque too, writing depth, and turned the
	// walls away under them by the depth test cost half as much again on a
	// software GPU: the depth buffer costs more than the blend it saves.)
	const S = [raw('#e0603e'), raw('#f2984a'), raw('#f5c150'), raw('#f8e2a0')].map((c) => uniform(c));
	const uGround = uniform(raw(PAL.ground));
	const wallMat = new THREE.MeshBasicNodeMaterial({
		depthTest: false,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	{
		const ang = atan(pw.y.div(uHc), pw.x.div(uWc));
		const hue = fract(ang.div(TAU).add(uTurn)).mul(4);
		const k = fract(hue);
		const i = hue.floor();
		// A cyclic ramp through the four.
		const seg0 = mix(S[0], S[1], k);
		const seg1 = mix(S[1], S[2], k);
		const seg2 = mix(S[2], S[3], k);
		const seg3 = mix(S[3], S[0], k);
		const col = mix(
			mix(seg0, seg1, clamp(i.sub(0), 0, 1)),
			mix(seg2, seg3, clamp(i.sub(2), 0, 1)),
			clamp(i.sub(1), 0, 1)
		);
		const near = smoothstep(0, 3, dist); // nothing glares at the lens
		const light = col.mul(lit).mul(HALL.glow).mul(uAlpha).mul(near);
		wallMat.colorNode = vec4(vertexStage(light.add(uGround)), 1);
	}
	disposables.push(wallMat);

	// The ruler on the floor of the last stretch.
	const rulerTex = new THREE.CanvasTexture(document.createElement('canvas'));
	rulerTex.colorSpace = THREE.NoColorSpace;
	rulerTex.generateMipmaps = true;
	rulerTex.minFilter = THREE.LinearMipmapLinearFilter;
	rulerTex.magFilter = THREE.LinearFilter;
	rulerTex.anisotropy = aniso;
	disposables.push(rulerTex);
	const rulerMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	{
		const c = texture(rulerTex, uv());
		// The ruler's own colour (chalk, and gold at the birth), warmed.
		const warm = vertexStage(clamp(lit.mul(0.5), 0, 0.6));
		rulerMat.colorNode = vec4(mix(c.rgb, uWarm, warm), c.a.mul(shows));
	}
	disposables.push(rulerMat);

	const plane = new THREE.PlaneGeometry(1, 1, 4, 4);
	disposables.push(plane);
	let rooms = null;
	let walls = [];
	let ruler = null;
	const M = new THREE.Matrix4();

	function clearBuilt() {
		if (rooms) {
			scene.remove(rooms);
			rooms.dispose();
			rooms = null;
		}
		for (const m of walls) {
			scene.remove(m);
			m.geometry.dispose();
		}
		walls = [];
		if (ruler) {
			scene.remove(ruler);
			ruler.geometry.dispose();
			ruler = null;
		}
	}

	// The basis of a plate on each wall: the picture's right R, up U (its
	// normal R × U faces into the corridor), and its centre.
	function basis(wall, z, Hc, Wc) {
		// The room's centre sits HALL.label / 2 over the plate's.
		switch (wall) {
			case 'left':
				return { R: [0, 0, -1], U: [0, 1, 0], C: [-Wc, -HALL.label / 2, z] };
			case 'right':
				return { R: [0, 0, 1], U: [0, 1, 0], C: [Wc, -HALL.label / 2, z] };
			case 'floor':
				return { R: [1, 0, 0], U: [0, 0, -1], C: [0, -Hc, z + HALL.label / 2] };
			default:
				return { R: [1, 0, 0], U: [0, 0, 1], C: [0, Hc, z - HALL.label / 2] };
		}
	}

	function build({ Hc, Wc, cell0, pitch, cells, floorFrom, ruler: R }) {
		clearBuilt();
		uHc.value = Hc;
		uWc.value = Wc;
		// A room on each wall of each cell (none on the floor before
		// floorFrom: the ruler is there).
		const plates = [];
		cells.forEach((decade, k) => {
			const z = cell0 + (k + 0.5) * pitch;
			for (const wall of WALLS)
				if (wall !== 'floor' || k >= floorFrom) plates.push({ wall, z, decade });
		});
		const n = Math.min(512, plates.length);
		rooms = new THREE.InstancedMesh(plane, roomMat, n);
		rooms.frustumCulled = false;
		rooms.renderOrder = 2;
		const H = PH + HALL.label;
		for (let i = 0; i < n; i++) {
			const p = plates[i];
			const { R: r, U: u, C: c } = basis(p.wall, p.z, Hc, Wc);
			const nn = [r[1] * u[2] - r[2] * u[1], r[2] * u[0] - r[0] * u[2], r[0] * u[1] - r[1] * u[0]];
			M.set(
				r[0] * PW,
				u[0] * H,
				nn[0],
				c[0],
				r[1] * PW,
				u[1] * H,
				nn[1],
				c[1],
				r[2] * PW,
				u[2] * H,
				nn[2],
				c[2],
				0,
				0,
				0,
				1
			);
			rooms.setMatrixAt(i, M);
			const q = rects[p.decade] ?? rects['90s'];
			rectAttr.setXYZW(i, q[0], q[1], q[2], q[3]);
		}
		rooms.instanceMatrix.needsUpdate = true;
		rectAttr.needsUpdate = true;
		scene.add(rooms);
		// The four walls, laid from the end only as far as its light shows
		// (glow·e^(−z/lam) at the light's steady most, 1.15, under a level's
		// worth, 1.5 / 255): beyond, the walls are the ground, and a
		// software GPU would pay for every fragment of them.
		const wallTo = HALL.lam * Math.log((HALL.glow * 1.15 * 255) / 1.5);
		const wall = (w, hgt, pos, rot) => {
			// Cut every ~1.5 units along the corridor, 8 across.
			const g = new THREE.PlaneGeometry(
				w,
				hgt,
				w > hgt ? Math.ceil(w / 1.5) : 8,
				w > hgt ? 8 : Math.ceil(hgt / 1.5)
			);
			const m = new THREE.Mesh(g, wallMat);
			m.position.set(...pos);
			m.rotation.set(...rot);
			m.frustumCulled = false;
			m.renderOrder = 1;
			scene.add(m);
			walls.push(m);
		};
		const L = wallTo;
		wall(L, 2 * Hc, [-Wc, 0, L / 2], [0, Math.PI / 2, 0]);
		wall(L, 2 * Hc, [Wc, 0, L / 2], [0, -Math.PI / 2, 0]);
		wall(2 * Wc, L, [0, -Hc, L / 2], [-Math.PI / 2, 0, 0]);
		wall(2 * Wc, L, [0, Hc, L / 2], [Math.PI / 2, 0, 0]);
		// The ruler: its canvas laid on the floor, its top edge at z0 (the
		// door), its bottom at z1.
		if (R) {
			// A canvas of another size (the board resized mid-run) cannot be
			// written into the texture the last one made: let it go first.
			const was = rulerTex.image;
			if (was && (was.width !== R.canvas.width || was.height !== R.canvas.height))
				rulerTex.dispose();
			rulerTex.image = R.canvas;
			rulerTex.needsUpdate = true;
			const len = R.z1 - R.z0;
			const g = new THREE.PlaneGeometry(2 * Wc * 0.96, len, 1, Math.ceil(len / 1.2));
			ruler = new THREE.Mesh(g, rulerMat);
			// Laid flat: the plane's +y (the canvas's top) toward −z (the door).
			ruler.rotation.set(-Math.PI / 2, 0, 0);
			ruler.position.set(0, -Hc + 1e-3, (R.z0 + R.z1) / 2);
			ruler.frustumCulled = false;
			ruler.renderOrder = 2;
			scene.add(ruler);
		}
	}

	function render({
		w,
		h,
		pos,
		target,
		up = [0, 1, 0],
		fov,
		offset = null,
		reach = 1e6,
		light = 0.3,
		turn = 0,
		alpha = 1
	}) {
		camera.position.set(...pos);
		camera.up.set(...up);
		camera.lookAt(...target);
		camera.fov = fov;
		camera.aspect = w / h;
		if (offset) camera.setViewOffset(w, h, w / 2 - offset[0], h / 2 - offset[1], w, h);
		else camera.clearViewOffset();
		camera.updateProjectionMatrix();
		uReach.value = reach;
		uLight.value = light;
		uTurn.value = turn;
		uAlpha.value = alpha;
		const vis = alpha > 0.002;
		// Nothing drawn that would not show (a software GPU pays for every
		// fragment, seen or not): no rooms before they come in, no walls
		// before the light is on them.
		// (?parts= picks among walls, rooms and the floor's ruler, w r f,
		// for a probe.)
		const parts = DBG.get('parts') ?? 'wrf';
		const shown = reach > 0.1 - HALL.edge;
		if (rooms) rooms.visible = vis && shown && parts.includes('r');
		if (ruler) ruler.visible = vis && shown && parts.includes('f');
		for (const m of walls) m.visible = vis && light > 0.01 && parts.includes('w');
		// Straight to the canvas: with the output in the working space the
		// renderer needs no framebuffer target and no output pass (a
		// half-float target and a full-screen pass a frame — most of a
		// frame's cost on a software GPU), and the colours are the display's
		// (the board's) as given. Put back for whoever is next.
		const cs = renderer.outputColorSpace;
		const tm = renderer.toneMapping;
		renderer.outputColorSpace = THREE.ColorManagement.workingColorSpace;
		renderer.toneMapping = THREE.NoToneMapping;
		renderer.render(scene, camera);
		renderer.outputColorSpace = cs;
		renderer.toneMapping = tm;
	}

	function dispose() {
		clearBuilt();
		for (const d of disposables) d.dispose?.();
	}

	return { build, render, dispose, rects, scene, camera };
}
