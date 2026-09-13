import {
	Fn,
	If,
	Loop,
	Discard,
	texture,
	uv,
	vec2,
	vec4,
	uniform,
	float,
	max,
	abs,
	exp,
	log,
	sin,
	cos,
	atan,
	length,
	pass,
	TWO_PI
} from 'three/tsl';
import { LAYERS, placement, elementUrl } from '$lib/data/roomElements';
import { SCREEN_GLASS } from '$lib/config/layout';
import { PHI } from '$lib/three/geometry/icosahedron';

// ── Sketch four: rooms through rooms ─────────────────────────────────────────
// The site's room is six flat drawings at six depths behind a golden-rectangle
// frame — a wall, a poster, a clock, a monitor, a desk, a bed. The monitor's
// glass is painted flat black. This puts the SAME room inside that glass, and
// the same room inside that one's glass, ten deep, and falls through them.
//
// The nesting is a 3D similarity S: scale 1/N about a fixed point p, chosen so
// the glass-aspect crop of the frame lands exactly on the glass. Copy k is
// S^k(room) — real geometry at real depth, so the six layers keep their
// parallax at every level, and the whole nest is invariant under S. That is
// what makes the fall seamless: a camera at S(c) sees S(world) exactly as a
// camera at c sees the world, so the frame one level down IS the frame now,
// relabelled. Progress maps to ζ, levels fallen; the camera is c(ζ) = p +
// (c0 − p)·N^−ζ, and every frame is a pure function of ζ.
//
// Each level is clipped to its parent's glass by a stencil chain: level k's
// back layers draw where stencil == k, then a glass-only quad (the monitor
// sprite with everything but its black glass discarded, colour write off)
// increments the stencil where it lands, and level k+1 draws where it is k+1.
// The desk and bed of each level are drawn last, deepest level first, where
// stencil >= k, so they occlude what is on the screen behind them exactly as
// the painter's order does in the site. Once the camera has passed a glass
// plane that level is dropped and the stencil is CLEARED to the new base, so
// no material ever changes: the world is re-based by one number a frame.
//
// "Warp space": the similarity is a SCREW. Each level is also turned about the
// axis through p by θ, so the nest spirals, and the camera rolls with it as it
// falls — the world is invariant under scale-and-turn, so the fall is still
// exact. This is the 3D form of Escher's Print Gallery twist, which for this
// art is 15° a level (arg γ, γ = N^α, α = 2πi/(2πi + log N)).
//
// The 2D form — the conformal map z = exp(β·log w) as a post-process on the
// straight picture — is here too, off by default, because it does not survive
// depth: it needs the picture to be exactly self-similar about p, and six
// layers in perspective are not. The mismatch shows as a seam along the branch
// cut, and the seam IS the parallax. Turn it on to see that.
//
//   ?levels=10  copies built     ?fall=3  levels fallen over the run
//   ?fov=34     the lens the fall opens out to (from the site's 12°)
//   ?sway=0.08  lateral truck about the axis, per level, in frame heights
//   ?screw=15   degrees of turn per level (0 for a straight nest)
//   ?twist=1    the 2D Escher map, as a fixed amount or `ramp` over the last level

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
const smootherstep = (x) => {
	const t = Math.max(0, Math.min(1, x));
	return t * t * t * (t * (t * 6 - 15) + 10);
};
const smoothstep = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const DECADE = '90s'; // the one room whose glass is painted black
	const LEVELS = Number(q.get('levels') ?? 10);
	const FALL = Number(q.get('fall') ?? 3);
	const FOV0 = 12; // ICOSA.fov — where the site lands
	const FOV1 = Number(q.get('fov') ?? 34);
	const SWAY = Number(q.get('sway') ?? 0.08);
	const SCREW = rad(Number(q.get('screw') ?? 15));
	const twistParam = q.get('twist') ?? '0';
	const zetaHeld = q.get('zeta'); // pin ζ directly (diagnostics)
	const LINEAR = q.get('lin') === '1'; // ζ = FALL·at, no ease (diagnostics)
	const POST = q.get('post') !== '0'; // the twist pass; 0 renders the scene direct
	const DURATION = 14;

	const W = 2 * PHI; // the golden rectangle, landscape: 3.236 × 2
	const H = 2;
	const DEPTH = 3.0; // ICOSA.roomDepth

	// ── The six drawings ─────────────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const textures = {};
	await Promise.all(
		LAYERS.map(async (cfg) => {
			const tex = await loader.loadAsync(elementUrl(DECADE, cfg.key));
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.generateMipmaps = true;
			tex.minFilter = THREE.LinearMipmapLinearFilter;
			tex.magFilter = THREE.LinearFilter;
			tex.anisotropy = Math.min(4, maxAniso);
			textures[cfg.key] = tex;
		})
	);

	// RoomProjection.layout(), landscape, in the frame's own coordinates:
	// x right, y up, z toward the viewer, the frame plane at z = 0.
	function layout(cfg) {
		const tex = textures[cfg.key];
		const aspect = tex.image.width / tex.image.height;
		const pos = placement(cfg, DECADE, false);
		let w, h;
		if (cfg.cover) {
			if (W / H > aspect) {
				w = W;
				h = W / aspect;
			} else {
				h = H;
				w = H * aspect;
			}
		} else {
			w = pos.width * W;
			h = w / aspect;
		}
		return { w, h, x: ((pos.x || 0) * W) / 2, y: ((pos.y || 0) * H) / 2, z: -cfg.depth * DEPTH };
	}
	const L = Object.fromEntries(LAYERS.map((cfg) => [cfg.key, layout(cfg)]));

	// The wall is drawn to cover the FRAME, which only covers the frustum from
	// infinitely far: from the landing distance it is short by (d0 + depth)/d0 —
	// 1.3 at 12°, 1.9 at 34°. The site hides that by flattening the room as it
	// falls in; this keeps the depth and extends the wall instead, smearing its
	// own edge pixels outward (clamped UVs on a doubled quad), so the drawn wall
	// stays exactly where the poster's corner and the clock's scuff are.
	const WALL_COVER = 2;

	// ── The similarity ───────────────────────────────────────────────────
	const g = SCREEN_GLASS[DECADE];
	const glass = {
		x: L.screen.x + (g.cx - 0.5) * L.screen.w,
		y: L.screen.y + (0.5 - g.cy) * L.screen.h,
		z: L.screen.z,
		w: g.w * L.screen.w,
		h: g.h * L.screen.h
	};
	// The largest glass-aspect crop of the frame, centred on it.
	const ga = glass.w / glass.h;
	const Kw = ga < W / H ? H * ga : W;
	const N = Kw / glass.w;
	// S(x) = g3 + x / N  (the crop is centred at the origin), fixed point:
	const p = new THREE.Vector3(glass.x, glass.y, glass.z).multiplyScalar(N / (N - 1));

	// ── The nest ─────────────────────────────────────────────────────────
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	const plane = new THREE.PlaneGeometry(1, 1);
	const wallPlane = plane.clone();
	{
		const a = wallPlane.attributes.uv;
		for (let i = 0; i < a.count; i++) {
			a.setXY(i, (a.getX(i) - 0.5) * WALL_COVER + 0.5, (a.getY(i) - 0.5) * WALL_COVER + 0.5);
		}
	}
	const BACK = ['bg', 'poster', 'clock', 'screen'];
	const FRONT = ['desk', 'bed'];

	// Only the black glass survives; everything else is discarded, so only the
	// glass writes the stencil. Colour write is off — this quad draws nothing.
	const glassKey = Fn(() => {
		const c = texture(textures.screen);
		Discard(c.a.lessThan(0.5).or(max(c.r, max(c.g, c.b)).greaterThan(0.06)));
		return vec4(0, 0, 0, 1);
	});

	// The stencil chain. Clip 0 is the golden rectangle itself — the site's
	// window onto the room — and clip k+1 is level k's glass. Level k draws
	// where the stencil is k+1.
	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};
	const frameMat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		colorWrite: false
	});
	frameMat.colorNode = vec4(0, 0, 0, 1);
	stencilOf(frameMat, 0, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
	const frameQuad = new THREE.Mesh(plane, frameMat);
	frameQuad.scale.set(W, H, 1);
	frameQuad.renderOrder = -1;
	frameQuad.frustumCulled = false;
	scene.add(frameQuad);

	const levels = [];
	const zAxis = new THREE.Vector3(0, 0, 1);
	for (let k = 0; k < LEVELS; k++) {
		const s = Math.pow(N, -k);
		const group = new THREE.Group();
		// x ↦ p + R_k·s·(x − p): scale about p, then turn about p's axis.
		group.quaternion.setFromAxisAngle(zAxis, k * SCREW);
		group.scale.setScalar(s);
		group.position.copy(p).sub(p.clone().applyQuaternion(group.quaternion).multiplyScalar(s));
		scene.add(group);

		const sprite = (key, mat, order) => {
			const l = L[key];
			const wall = key === 'bg';
			const m = new THREE.Mesh(wall ? wallPlane : plane, mat);
			const f = wall ? WALL_COVER : 1;
			m.scale.set(l.w * f, l.h * f, 1);
			m.position.set(l.x, l.y, l.z);
			m.renderOrder = order;
			m.frustumCulled = false;
			group.add(m);
			return m;
		};
		const stencil = (mat, func, op) => stencilOf(mat, k + 1, func, op);
		const flat = (key) =>
			new THREE.MeshBasicNodeMaterial({
				map: textures[key],
				transparent: true,
				depthTest: false,
				depthWrite: false
			});

		BACK.forEach((key, i) =>
			sprite(key, stencil(flat(key), THREE.EqualStencilFunc, THREE.KeepStencilOp), 10 * k + i)
		);
		const gm = new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			colorWrite: false
		});
		gm.colorNode = glassKey();
		sprite('screen', stencil(gm, THREE.EqualStencilFunc, THREE.IncrementStencilOp), 10 * k + 4);
		// Front layers: after every level's back, deepest level first.
		FRONT.forEach((key, j) =>
			sprite(
				key,
				stencil(flat(key), THREE.LessEqualStencilFunc, THREE.KeepStencilOp),
				10 * (LEVELS + 1) + 10 * (LEVELS - 1 - k) + j
			)
		);
		// Where this level's glass plane is, in the world.
		levels.push({ group, glassZ: p.z * (1 - s) + glass.z * s });
	}
	const clipZ = [0, ...levels.map((lv) => lv.glassZ)];

	// ── The camera ───────────────────────────────────────────────────────
	const camera = new THREE.PerspectiveCamera(FOV0, 1, 0.05, 100);
	let aspect = 1;

	// ── The twist ────────────────────────────────────────────────────────
	const uTwist = uniform(0);
	const uAspect = uniform(1);
	const uCentre = uniform(new THREE.Vector2(0.5, 0.5)); // where p lands on the screen
	const uLogN = uniform(Math.log(N));
	const uN = uniform(N);
	const pipeline = new THREE.RenderPipeline(renderer);
	const scenePass = pass(scene, camera);
	scenePass.renderTarget.stencilBuffer = true;
	scenePass.renderTarget.depthTexture.format = THREE.DepthStencilFormat;
	scenePass.renderTarget.depthTexture.type = THREE.UnsignedInt248Type;
	const sceneTex = scenePass.getTextureNode();
	const twisted = Fn(() => {
		// Picture-plane coordinates about p's image, in half-heights.
		const w = uv().sub(uCentre).mul(vec2(uAspect, 1)).mul(2);
		const r = max(length(w), float(1e-6));
		const th = atan(w.y, w.x);
		const kappa = uLogN.div(TWO_PI).mul(uTwist);
		const lr = log(r);
		const re = lr.add(th.mul(kappa));
		const im = th.sub(lr.mul(kappa));
		const z = vec2(cos(im), sin(im)).mul(exp(re)).toVar();
		// Off the picture: the same picture one level in.
		Loop(3, () => {
			If(abs(z.x).greaterThan(uAspect).or(abs(z.y).greaterThan(1)), () => {
				z.divAssign(uN);
			});
		});
		const suv = z.div(2).div(vec2(uAspect, 1)).add(uCentre);
		return sceneTex.sample(suv);
	});
	pipeline.outputNode = twisted();

	const info = {
		N: Number(N.toFixed(4)),
		levels: LEVELS,
		fall: FALL,
		glass: [Number(glass.w.toFixed(3)), Number(glass.h.toFixed(3))],
		p: [p.x, p.y, p.z].map((v) => Number(v.toFixed(3))),
		base: 0,
		fov: FOV0,
		twist: 0
	};

	function set(u) {
		const zeta = zetaHeld !== null ? Number(zetaHeld) : LINEAR ? FALL * u : FALL * smootherstep(u);
		const s = Math.pow(N, -zeta);
		const fov = FOV0 + (FOV1 - FOV0) * smoothstep(0, 1.6, zeta);
		// The frame at level ζ fills the height, whatever the lens: a dolly zoom
		// while falling. c(ζ) = p + (c0 + e(ζ) − p)·N^−ζ with e periodic, and
		// the camera never turns: it starts square on the frame and trucks
		// toward the glass centre as it falls, so each level's frame is centred
		// as it is crossed and the copies converge on p a little off-centre —
		// which is where the monitor is in the room.
		const d0 = H / 2 / Math.tan(rad(fov) / 2);
		const D = d0 * s;
		const ex = SWAY * H * Math.sin(2 * Math.PI * zeta);
		const ey = SWAY * H * 0.5 * (Math.cos(2 * Math.PI * zeta) - 1);
		// The ζ-th power of the screw, applied to the landing camera c0 + e(ζ).
		const roll = zeta * SCREW;
		const off = new THREE.Vector3(-p.x + ex, -p.y + ey, 0)
			.multiplyScalar(s)
			.applyAxisAngle(zAxis, roll);
		camera.position.set(p.x + off.x, p.y + off.y, p.z * (1 - s) + D);
		camera.rotation.set(0, 0, roll);
		camera.fov = fov;
		camera.near = 0.01 * D;
		camera.far = 60 * D;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();

		// Re-base: every clip plane the camera has reached is a level dropped,
		// and the stencil is cleared to the new base instead of any material
		// changing.
		let base = 0;
		for (let k = 0; k < clipZ.length; k++) {
			if (camera.position.z < clipZ[k] + 1.5 * camera.near) base = k + 1;
		}
		frameQuad.visible = base === 0;
		levels.forEach((lv, k) => (lv.group.visible = k + 1 >= base));
		renderer.setClearStencil(base);

		const twist = twistParam === 'ramp' ? smoothstep(FALL - 1.2, FALL, zeta) : Number(twistParam);
		uTwist.value = twist;
		// The twist turns about p's image, which is fixed on the screen: the
		// camera's lateral offset from p scales with s exactly as its distance.
		camera.updateMatrixWorld();
		const pc = p.clone().project(camera);
		uCentre.value.set(pc.x * 0.5 + 0.5, pc.y * 0.5 + 0.5);
		info.base = base;
		info.fov = Number(fov.toFixed(2));
		info.twist = Number(twist.toFixed(3));
		info.zeta = Number(zeta.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;
	uAspect.value = aspect;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			if (POST) pipeline.render();
			else renderer.render(scene, camera);
		},
		resize(w, h) {
			aspect = w / h;
			uAspect.value = aspect;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
		}
	};
}
