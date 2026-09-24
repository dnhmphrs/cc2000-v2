import {
	Fn,
	vec2,
	vec3,
	vec4,
	uniform,
	texture,
	uv,
	abs,
	max,
	length,
	exp,
	positionView,
	positionWorld,
	smoothstep as tslSmoothstep,
	hue
} from 'three/tsl';
import {
	SCENES,
	APPROACH,
	KALEIDO,
	LENS,
	TUNNEL,
	SCREEN_GLASS,
	runSeconds,
	span,
	smoothstep,
	smootherstep,
	easeInOutCubic
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots, ADD } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { DECADES, elementUrl } from '$lib/data/roomElements';
import { glassOnly, glassCut } from '$lib/three/tsl/glass';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { wobbleEuler } from '$lib/three/world/wobble';

// ── Sketch: switch-on — the swimmer's nose lights the set ────────────────────
// The end of the approach, and the seam into the kaleido, with one change: the
// set does not switch itself on. Today (world/approach.js crtOn [0.86, 0.93])
// the glass lights while the swimmer is still a way short of it, and the
// swimmer passes through afterwards, unremarked. Here the set comes out of the
// dark, DARK — its glass black — and the swimmer, riding its 5.5 units ahead
// of the lens, arrives at that glass first. Where the nose touches, a dot of
// yellow-white light; the dot draws out sideways into the CRT hairline, at the
// height the nose struck; the hairline parts into the whole glass with the
// tunnel inside it; and the swimmer is already going in as the lens closes on
// the seam frame. The seam frame is untouched by construction: covers gone,
// line out, glass filling the frame's height on the run's lens and the run's
// hand, kaleidoscope.pose(0). The event before it now has a cause, and the
// cause is the character.
//
// The picture to look for: the dark 60s television dead ahead, glass black,
// and one dot of light at the tip of the blue swimmer's nose with the hairline
// just beginning to grow out of it.
//
// Everything is the run's own: the flight at ONE speed (APPROACH.travel over
// SCENES.approach.duration, z = z0 · p), the run's lens (LENS), the run's hand
// on the camera (world/wobble.js on runSeconds), the sky and the debris out
// under the set (skyOut), the 60s set as kaleidoscope.js builds it (bezel
// where the stencil is 0, glass 0→1, covers and line at 1 or more), and a
// tunnel of the same rings inside it. Past the seam the flight simply carries
// on at the same speed, through the glass (clear stencil 1, the set hidden)
// and down the tunnel with the rings turning and the hue cycling, so the
// switch-on can be watched running INTO the seam and not just up to it.
//
// The contact p*: the nose reaches the glass plane when
//     z0 · p − lead − halfLength = zGlass
// which comes out at 0.91 (travel 70, lead 5.5, and the body's half-length
// off the GLB's own vertices: 3.3 units at the run's size, so the nose is a
// good deal further ahead than the brief's guess and the contact a good deal
// earlier). The beats hang off p* and are squeezed to finish by 0.99: with
// B = 0.99 − p* (0.08, which is 0.56 s — not the 0.35 s the brief feared)
//     dot    on over   [p* − 0.2B, p* + 0.2B]   — the dot glows up as the nose lands
//     line   width     [p*,        p* + 0.55B]  — draws out from the dot to the glass edges
//     open   covers    [p* + 0.35B, p* + B]     — the glass parts round the line
//     glow   line out  [p* + 0.6B,  p* + B]     — and the line goes with the covers
// The dot is where the nose is at p* EXACTLY (the roll carries the nose round
// the axis at 1.6 turns a second, so it is pinned at first contact, not
// followed), and the covers part about THAT height rather than the glass's
// middle, so the opening reads as coming from the touch.
//
// Sketch time is a WINDOW of the approach's progress: u in 0..1 maps to p in
// [from, to], and p past 1 is the kaleido at the flight's speed.
//
//   ?from=0.8&to=1.06  the window (from=0.25 shows the whole run-in)
//   ?stretch=1         play it N times slower than the run does
//   ?reach=0           extra units the swimmer pulls ahead over the last
//                      stretch, dropped back to the run's lead by the seam —
//                      contact comes earlier and the switch-on gets longer,
//                      at the price of the swimmer checking at the glass
//   ?old=1             the run's own switch-on (crtOn windows) for comparison
//   ?tunnel=0          no rings — the glass opens on black
//   ?sperm=0           without the swimmer, for the seam diff

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;
function mulberry32(a) {
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const FROM = Number(q.get('from') ?? 0.8);
	const TO = Number(q.get('to') ?? 1.06);
	const STRETCH = Number(q.get('stretch') ?? 1);
	const REACH = Number(q.get('reach') ?? 0);
	const OLD = q.get('old') === '1';
	const RINGS = q.get('tunnel') !== '0';
	const SPERM = q.get('sperm') !== '0';

	const T = SCENES.approach;
	const TK = SCENES.kaleido;
	const A = APPROACH;
	const K = KALEIDO;
	const DURATION = (TO - FROM) * T.duration * STRETCH;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group();
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── The sky and the debris ───────────────────────────────────────────
	const rnd = mulberry32(7);
	const starMats = [];
	const starField = (n, dist, size, hex, opacity) => {
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rnd() * 2 - 1;
			const a = rnd() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = dist * (0.8 + rnd() * 0.4);
			pos.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	rig.add(starField(A.stars, A.starDist, 3.0, 0xb8c8ff, 0.7));
	rig.add(starField(A.brightStars, A.starDist, 5.5, 0xdde6ff, 0.9));
	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	scene.add(motes.lines);

	// ── The drawings ─────────────────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const tex = {};
	await Promise.all(
		DECADES.map(async (d) => {
			tex[d] = {};
			await Promise.all(
				K.keys.map(async (key) => {
					const t = await loader.loadAsync(elementUrl(d, key));
					t.colorSpace = THREE.SRGBColorSpace;
					t.generateMipmaps = true;
					t.minFilter = THREE.LinearMipmapLinearFilter;
					t.anisotropy = Math.min(4, maxAniso);
					tex[d][key] = t;
				})
			);
		})
	);
	const art = (d, key) => tex[d][key].image.width / tex[d][key].image.height;
	const plane = new THREE.PlaneGeometry(1, 1);
	const stencilOf = (mat, ref, func, op) => {
		mat.stencilWrite = true;
		mat.stencilRef = ref;
		mat.stencilFunc = func;
		mat.stencilFail = THREE.KeepStencilOp;
		mat.stencilZFail = THREE.KeepStencilOp;
		mat.stencilZPass = op;
		return mat;
	};
	const flat = (opts = {}) =>
		new THREE.MeshBasicNodeMaterial({
			transparent: true,
			depthTest: false,
			depthWrite: false,
			...opts
		});

	// ── The set: the 60s television, dead ahead ──────────────────────────
	const RING_ORDER = 50000;
	const COVER_ORDER = 60000;
	const uDim = uniform(1);
	const uGlow = uniform(0);
	const uBSeen0 = uniform(K.bezelSeen[0]);
	const uBSeen1 = uniform(K.bezelSeen[1]);
	const nearBezel = tslSmoothstep(uBSeen0, uBSeen1, positionView.z.negate()).oneMinus();

	const decade = K.screenDecade;
	const pw = K.screenWidth;
	const ph = pw / art(decade, 'screen');
	const sg = SCREEN_GLASS[decade];
	const glass = { x: (sg.cx - 0.5) * pw, y: (0.5 - sg.cy) * ph, w: sg.w * pw, h: sg.h * ph };
	const screenRoot = new THREE.Group();
	scene.add(screenRoot);
	const bezelMat = flat();
	{
		const c = glassCut(decade, tex[decade].screen)();
		bezelMat.colorNode = vec4(c.rgb, c.a.mul(uDim).mul(nearBezel));
	}
	stencilOf(bezelMat, 0, THREE.EqualStencilFunc, THREE.KeepStencilOp);
	const bezel = new THREE.Mesh(plane, bezelMat);
	bezel.scale.set(pw, ph, 1);
	bezel.renderOrder = -3;
	const holeMat = flat({ colorWrite: false });
	holeMat.colorNode = glassOnly(decade, tex[decade].screen)();
	stencilOf(holeMat, 0, THREE.EqualStencilFunc, THREE.IncrementStencilOp);
	const hole = new THREE.Mesh(plane, holeMat);
	hole.scale.set(pw, ph, 1);
	hole.renderOrder = -4;
	// The glass OFF: black covers, top and bottom, over the glass — and
	// between them, where they part, the line.
	const coverMat = flat();
	coverMat.colorNode = vec4(0, 0, 0, uDim);
	stencilOf(coverMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
	const top = new THREE.Mesh(plane, coverMat);
	const bottom = new THREE.Mesh(plane, coverMat);
	top.renderOrder = bottom.renderOrder = COVER_ORDER;

	// ── The dot, and the line it draws out into ──────────────────────────
	// One quad, ADD, the site's yellow with a white core: a capsule `uCap`
	// world units across and high, soft-edged, drawn on a quad padded round
	// it (`uQuad`) so the glow has room. A capsule as high as it is wide is
	// the dot; drawn out to the glass's width and thinned to the hairline it
	// is the line the run's setOpen already draws. Stencil 1 or more: it is
	// the GLASS lighting under the nose, not the nose.
	const uCap = uniform(new THREE.Vector2(0.1, 0.1));
	const uQuad = uniform(new THREE.Vector2(0.3, 0.3));
	const YELLOW = new THREE.Color(K.signalColor);
	const lineMat = flat(ADD);
	lineMat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(uQuad);
		const r = uCap.y.mul(0.5);
		const hx = max(uCap.x.mul(0.5).sub(r), 0.0);
		const d = length(vec2(max(abs(p.x).sub(hx), 0.0), p.y)).div(r);
		const soft = exp(d.mul(d).mul(-1.2));
		const core = exp(d.mul(d).mul(-7.0));
		const lit = uGlow.mul(uDim);
		const col = vec3(YELLOW.r, YELLOW.g, YELLOW.b)
			.mul(soft.mul(0.9))
			.add(vec3(1, 1, 1).mul(core).mul(1.1));
		return vec4(col.mul(lit), 1.0);
	})();
	stencilOf(lineMat, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
	const line = new THREE.Mesh(plane, lineMat);
	line.renderOrder = COVER_ORDER + 1;
	const screenMeshes = [bezel, hole, top, bottom, line];
	for (const m of screenMeshes) {
		m.frustumCulled = false;
		screenRoot.add(m);
	}

	// ── Where it is ──────────────────────────────────────────────────────
	const zGlass = -A.travel;
	screenRoot.position.set(-glass.x, -glass.y, zGlass);
	// Where the flight ends: the glass filling the frame's height on the lens.
	const z0 = zGlass + glass.h / 2 / Math.tan(rad(LENS) / 2);

	// ── The tunnel inside ────────────────────────────────────────────────
	const uOn = uniform(1);
	const uHue = uniform(0);
	const uHuePer = uniform((Math.PI * 2) / (K.pitch * K.keys.length * DECADES.length));
	const uZ0 = uniform(zGlass);
	const uBright = uniform(K.dim);
	const uSeen0 = uniform(K.seen[0]);
	const uSeen1 = uniform(K.seen[1]);
	const near = tslSmoothstep(uSeen0, uSeen1, positionView.z.negate()).oneMinus();
	const turned = uHue.add(uZ0.sub(positionWorld.z).mul(uHuePer));
	const rings = new THREE.Group();
	scene.add(rings);
	if (RINGS) {
		const ringMat = {};
		for (const d of DECADES) {
			ringMat[d] = {};
			for (const key of K.keys) {
				const m = flat();
				const c = key === 'screen' ? glassCut(d, tex[d].screen)() : texture(tex[d][key]);
				m.colorNode = vec4(hue(c.rgb, turned).mul(uBright), c.a.mul(uOn).mul(near).mul(uDim));
				stencilOf(m, 1, THREE.LessEqualStencilFunc, THREE.KeepStencilOp);
				ringMat[d][key] = m;
			}
		}
		for (let i = 0; i < K.rings; i++) {
			const key = K.keys[i % K.keys.length];
			const d = DECADES[Math.floor(i / K.keys.length) % DECADES.length];
			const g = new THREE.Group();
			const w = K.size[key];
			const h = w / art(d, key);
			for (let j = 0; j < K.ring; j++) {
				const th = (Math.PI * 2 * j) / K.ring + (i * Math.PI) / K.ring + i * K.spiral;
				const m = new THREE.Mesh(plane, ringMat[d][key]);
				m.position.set(Math.cos(th) * K.radius[0], Math.sin(th) * K.radius[1], 0);
				m.rotation.z = th + Math.PI / 2;
				m.scale.set(j % 2 ? -w : w, h, 1);
				m.renderOrder = RING_ORDER;
				m.frustumCulled = false;
				g.add(m);
			}
			g.position.z = zGlass - (i + 0.5) * K.pitch;
			rings.add(g);
		}
	}

	// ── The swimmer ──────────────────────────────────────────────────────
	// A child of the camera, riding `lead` ahead on the axis, sized off the
	// lens (world/approach.js). Its nose: the far end of its box, carried on
	// the spinner so the roll takes it round the axis as it does the body.
	const sw = await loadSwimmer({ height: 1, gain: 1.15 });
	sw.material.depthTest = false;
	sw.group.traverse((o) => {
		o.renderOrder = 100000;
		o.frustumCulled = false;
	});
	// The nose is the vertex furthest down the body's own axis, off the
	// geometry itself — not the box's centre, which the tail's coil pulls off
	// the axis and the roll then swings round it.
	sw.group.updateMatrixWorld(true);
	const nose = new THREE.Object3D();
	{
		const v = new THREE.Vector3();
		const tip = new THREE.Vector3(0, 0, Infinity);
		sw.group.traverse((o) => {
			if (!o.isMesh) return;
			const pos = o.geometry.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
				if (v.z < tip.z) tip.copy(v);
			}
		});
		nose.position.copy(tip);
	}
	const halfLenUnit = -nose.position.z; // per unit of body height
	sw.spinner.add(nose);
	camera.add(sw.group);
	const SPIN = -TUNNEL.spermSpin;
	const lead = A.lead;
	const bodyH = A.span * 2 * lead * Math.tan(rad(LENS) / 2);
	const halfLen = halfLenUnit * bodyH;
	// The extra lead over the last stretch (?reach=), back to the run's by the seam.
	const reachAt = (p) => REACH * smoothstep(0.7, 0.88, p) * (1 - smoothstep(0.95, 1, p));

	const euler = new THREE.Euler();
	const noseW = new THREE.Vector3();
	function poseAt(p) {
		rig.position.set(0, 0, z0 * p);
		camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		const clock = runSeconds('approach', p);
		sw.group.position.set(0, 0, -(lead + reachAt(p)));
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = clock * SPIN;
		sw.material.uniforms.uTime.value = clock;
		camera.updateMatrixWorld(true);
		return clock;
	}

	// ── The contact ──────────────────────────────────────────────────────
	// Solve z0·p − lead − reach(p) − halfLen = zGlass for p: the nose on the
	// glass plane. f falls with p, so bisect.
	const f = (p) => z0 * p - lead - reachAt(p) - halfLen - zGlass;
	let lo = 0.5;
	let hi = 1.2;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (f(mid) > 0) lo = mid;
		else hi = mid;
	}
	const pStar = (lo + hi) / 2;
	// Where the nose is at that moment, on the glass, in the set's own frame.
	poseAt(pStar);
	nose.getWorldPosition(noseW);
	const contact = { x: noseW.x - screenRoot.position.x, y: noseW.y - screenRoot.position.y };
	const B = Math.max(0.99 - pStar, 0.005);
	const W = OLD
		? {
				dot: [T.crtOn[0] - 0.005, T.crtOn[0] + 0.005],
				line: [T.crtOn[0], T.crtOn[0] + 0.01],
				open: T.crtOn,
				glow: [T.crtOn[0], T.crtOn[1] + 0.04]
			}
		: {
				dot: [pStar - 0.2 * B, pStar + 0.2 * B],
				line: [pStar, pStar + 0.55 * B],
				open: [pStar + 0.35 * B, pStar + B],
				glow: [pStar + 0.6 * B, pStar + B]
			};
	const DOT = glass.h * 0.085; // the dot's diameter
	const HAIR = glass.h * 0.02; // the hairline's height — the run's

	// The glass switching on. `open` parts the covers about the line's height
	// `yc`; `width` draws the line out from the dot at `xc` to the glass's
	// edges, both together; `glow` is its brightness. 1, _, 0 is a lit glass.
	function setOpen(open, width, glow, xc, yc) {
		const g = glass;
		const yT = g.y + g.h / 2;
		const yB = g.y - g.h / 2;
		// The covers: from the line's height out to the glass's edges, shrinking
		// toward those edges as the glass opens.
		const topH = (yT - yc) * (1 - open);
		const botH = (yc - yB) * (1 - open);
		top.scale.set(g.w, topH, 1);
		top.position.set(g.x, yT - topH / 2, 0.001);
		bottom.scale.set(g.w, botH, 1);
		bottom.position.set(g.x, yB + botH / 2, 0.001);
		top.visible = topH > 0.0005;
		bottom.visible = botH > 0.0005;
		// The line: a dot at the contact, drawn out to the glass's edges.
		const xL = xc - DOT / 2 + (g.x - g.w / 2 - (xc - DOT / 2)) * width;
		const xR = xc + DOT / 2 + (g.x + g.w / 2 - (xc + DOT / 2)) * width;
		const capW = xR - xL;
		const capH = DOT + (HAIR - DOT) * width;
		const pad = capH * 2.5;
		uCap.value.set(capW, capH);
		uQuad.value.set(capW + pad, capH + pad);
		line.scale.set(capW + pad, capH + pad, 1);
		line.position.set((xL + xR) / 2, yc, 0.002);
		line.visible = glow > 0.001;
		uGlow.value = glow;
	}

	const info = {
		contact: Number(pStar.toFixed(4)),
		seconds: Number((B * T.duration).toFixed(2)),
		halfLen: Number(halfLen.toFixed(3)),
		z0: Number(z0.toFixed(2)),
		zGlass,
		xc: Number(contact.x.toFixed(3)),
		yc: Number(contact.y.toFixed(3)),
		from: FROM,
		to: TO,
		reach: REACH,
		old: OLD
	};

	function set(u) {
		const p = FROM + (TO - FROM) * u;
		poseAt(p);
		const z = rig.position.z;

		// The sky and the debris: up with the card, out under the set.
		const up = smootherstep(span(p, T.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, T.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, T.fadeIn));

		// The set out of the dark, and the switch-on.
		uDim.value = up * smoothstep(T.screenIn[0], T.screenIn[1], p);
		const dot = smoothstep(W.dot[0], W.dot[1], p);
		const width = smoothstep(W.line[0], W.line[1], p);
		const open = smoothstep(W.open[0], W.open[1], p);
		const glow = dot * (1 - smoothstep(W.glow[0], W.glow[1], p)) * (1 - smoothstep(0.97, 0.99, p));
		// The dot FLARES — brighter than the line it becomes, a point of light
		// rather than the start of a bar — and settles as it draws out.
		setOpen(open, width, glow * (1 + 2.2 * (1 - width)), contact.x, contact.y);

		// The swimmer.
		sw.material.uniforms.uOpacity.value = SPERM ? smootherstep(span(p, T.swimmerIn)) : 0;

		// Past the seam: through the glass at the flight's speed, the set
		// hidden and the stencil cleared to 1, the tunnel turning and cycling.
		const through = z < zGlass + 1.5 * camera.near;
		bezel.visible = hole.visible = true;
		for (const m of screenMeshes) m.visible = m.visible && !through;
		renderer.setClearStencil(through ? 1 : 0);
		const x = Math.max(0, p - 1);
		rings.rotation.z = x * TK.turns * Math.PI * 2;
		uHue.value = x * TK.hueCycles * Math.PI * 2;

		info.p = Number(p.toFixed(4));
		info.z = Number(z.toFixed(2));
		info.dot = Number(dot.toFixed(3));
		info.width = Number(width.toFixed(3));
		info.open = Number(open.toFixed(3));
		info.glow = Number(glow.toFixed(3));
		info.through = through;
	}

	const size = renderer.getSize(new THREE.Vector2());
	camera.aspect = size.x / size.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
	bu.uPx.value = 1 / renderer.domElement.height;

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
			renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
