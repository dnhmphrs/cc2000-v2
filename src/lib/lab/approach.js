import { pass, vec4 } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { elementUrl, DECADES } from '$lib/data/roomElements';
import { SCREEN_GLASS } from '$lib/config/layout';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { glassCut } from '$lib/three/tsl/glass';

// ── Sketch: the approach ─────────────────────────────────────────────────────
// The very start, before the descent. Space, black, a sky of stars — and the
// swimmer, riding a few units ahead of the lens as it does in the fly-in,
// rolling about the axis you are looking down. What it is swimming through is
// the archive: monitors, dozens of them, adrift in the dark at every distance,
// each one's glass cut out and its decade's room lit inside it. They pass on
// either side. One is dead ahead, and grows, and the swimmer goes in through
// its glass a moment before the frame is all glass — which is where the
// descent begins.
//
// The lens starts BESIDE the swimmer — three-quarter, above and to the right,
// so the body reads as a body and not as the swirl its tail draws from dead
// behind — and falls in behind it as the field thickens, to look straight down
// the axis at the glass.
//
//   ?screens=40   how many are adrift
//   ?bloom=0      without the glow

export const options = {};

const smoothstep = (a, b, x) => {
	const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
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
	const NSCREENS = Number(q.get('screens') ?? 40);
	const BLOOM = q.get('bloom') !== '0';
	const DURATION = 9;

	const FOV = 40;
	const LEAD = 5.5; // the swimmer, ahead of the lens (TUNNEL.spermLead)
	const SPAN = 0.254; // of the frame's half-height, at that distance
	const TRAVEL = 150; // how far the lens flies
	const TARGET_W = 3.4; // the screen dead ahead

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
	const rig = new THREE.Group(); // the lens, the stars, the swimmer travel together
	rig.add(camera);
	const SIDE = new THREE.Vector3(2.6, 1.3, -1.2); // the lens, beside the swimmer
	const LOOK = new THREE.Vector3();
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	// ── Stars ────────────────────────────────────────────────────────────
	const rnd = mulberry32(7);
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
		mat.uniforms.uOpacity.value = opacity;
		return dots(geo, mat);
	};
	rig.add(starField(1100, 150, 3.0, 0xb8c8ff, 0.7));
	rig.add(starField(90, 150, 5.5, 0xdde6ff, 0.9));

	// ── The screens ──────────────────────────────────────────────────────
	const loader = new THREE.TextureLoader();
	const maxAniso = renderer.getMaxAnisotropy ? renderer.getMaxAnisotropy() : 1;
	const tex = {};
	await Promise.all(
		DECADES.map(async (d) => {
			tex[d] = {};
			for (const key of ['screen', 'bg']) {
				const t = await loader.loadAsync(elementUrl(d, key));
				t.colorSpace = THREE.SRGBColorSpace;
				t.generateMipmaps = true;
				t.minFilter = THREE.LinearMipmapLinearFilter;
				t.anisotropy = Math.min(4, maxAniso);
				tex[d][key] = t;
			}
		})
	);
	const cutMat = {};
	const dimMat = {}; // the drifting ones a shade down, so the white sets don't blaze
	for (const d of DECADES) {
		const m = new THREE.MeshBasicNodeMaterial({ transparent: true });
		m.colorNode = glassCut(d, tex[d].screen)();
		cutMat[d] = m;
		const dm = new THREE.MeshBasicNodeMaterial({ transparent: true });
		const c = glassCut(d, tex[d].screen)();
		dm.colorNode = vec4(c.rgb.mul(0.78), c.a);
		dimMat[d] = dm;
	}
	// One monitor: the screen drawing with its glass cut out, and the decade's
	// room behind the hole, cover-cropped to the glass.
	function monitor(decade, width, dim = false) {
		const g = new THREE.Group();
		const s = tex[decade].screen;
		const b = tex[decade].bg;
		const art = s.image.width / s.image.height;
		const height = width / art;
		const front = new THREE.Mesh(
			new THREE.PlaneGeometry(width, height),
			dim ? dimMat[decade] : cutMat[decade]
		);
		g.add(front);
		const gl = SCREEN_GLASS[decade];
		const gw = gl.w * width;
		const gh = gl.h * height;
		const geo = new THREE.PlaneGeometry(gw, gh);
		const ba = b.image.width / b.image.height;
		const ga = gw / gh;
		const uvs = geo.attributes.uv;
		for (let i = 0; i < uvs.count; i++) {
			let u = uvs.getX(i);
			let v = uvs.getY(i);
			if (ba > ga) u = 0.5 + (u - 0.5) * (ga / ba);
			else v = 0.5 + (v - 0.5) * (ba / ga);
			uvs.setXY(i, u, v);
		}
		const room = new THREE.Mesh(geo, new THREE.MeshBasicNodeMaterial({ map: b }));
		room.position.set((gl.cx - 0.5) * width, (0.5 - gl.cy) * height, -0.03);
		g.add(room);
		return { group: g, glassH: gh, glassX: (gl.cx - 0.5) * width, glassY: (0.5 - gl.cy) * height };
	}

	// Adrift: a tube of them ahead, off the axis, at every distance.
	for (let i = 0; i < NSCREENS; i++) {
		const d = DECADES[i % DECADES.length];
		const m = monitor(d, 1.6 + rnd() * 1.6, true);
		const a = rnd() * Math.PI * 2;
		const r = 2.6 + rnd() * 7;
		m.group.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.75, -8 - rnd() * (TRAVEL + 30));
		m.group.rotation.z = (rnd() - 0.5) * 0.5;
		m.group.rotation.y = (rnd() - 0.5) * 0.6;
		scene.add(m.group);
	}
	// And the one dead ahead, that the run goes into. The 90s: the descent
	// starts on its glass.
	const target = monitor('90s', TARGET_W);
	const targetZ = -TRAVEL;
	target.group.position.set(-target.glassX, -target.glassY, targetZ);
	scene.add(target.group);
	// The lens stops where that glass fills the frame's height.
	const stopDist = target.glassH / 2 / Math.tan((FOV * Math.PI) / 360);
	const zEnd = targetZ + stopDist;

	// ── The swimmer ──────────────────────────────────────────────────────
	const bodyH = SPAN * 2 * LEAD * Math.tan((FOV * Math.PI) / 360);
	const swimmer = await loadSwimmer({ height: bodyH, fog: 0x090b14, fogDensity: 0.012 });
	swimmer.group.position.set(0, 0, -LEAD);
	rig.add(swimmer.group);

	// ── Post ─────────────────────────────────────────────────────────────
	let post = null;
	let bloomed = false;
	if (BLOOM) {
		try {
			post = new THREE.RenderPipeline(renderer);
			const scenePass = pass(scene, camera);
			post.outputNode = scenePass.add(bloom(scenePass, 0.5, 0.4, 0.8));
			bloomed = true;
		} catch {
			post = null;
		}
	}

	const info = { screens: NSCREENS, travel: TRAVEL, stop: Number(zEnd.toFixed(2)), bloom: bloomed };

	function set(u) {
		// One speed for most of the run, then the stop — the fly-in's own glide.
		const g = 1 - Math.pow(1 - u, 2.6);
		rig.position.z = zEnd * g;
		// A slow drift off the axis and back, so the field parallaxes.
		rig.position.x = Math.sin(u * Math.PI * 2) * 0.35 * (1 - smoothstep(0.7, 1, u));
		rig.position.y = Math.sin(u * Math.PI * 4 + 1) * 0.2 * (1 - smoothstep(0.7, 1, u));
		// Beside the swimmer, then behind it: the lens slides onto the axis.
		const s = smoothstep(0.3, 0.72, u);
		camera.position.copy(SIDE).multiplyScalar(1 - s);
		LOOK.set(0, 0, -LEAD - 200 * s * s).add(rig.position);
		camera.lookAt(LOOK);
		swimmer.spin(u * 14);
		swimmer.material.uniforms.uTime.value = u * 12;
		info.z = Number(rig.position.z.toFixed(2));
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
			if (post) post.render();
			else renderer.render(scene, camera);
		},
		resize(w, h) {
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
