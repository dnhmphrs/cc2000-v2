import * as GL from 'three';
import * as REF from '$lib/three/world/materials';
import { SHADERS, VERT, PRELUDE } from '$lib/three/shaders';
import * as PORT from '$lib/three/tsl/materials';
import { BACKDROPS, backdropUniforms } from '$lib/three/tsl/backdrop';
import { VERTICES, CIRCUMRADIUS, edgePositions } from '$lib/three/geometry/icosahedron';

// ── The materials, side by side ──────────────────────────────────────────────
// Every material the site draws with, ported to TSL, next to the ShaderMaterial
// it was ported from. The same probe scene is built twice — once with `three`
// and world/materials.js on a WebGLRenderer of its own, once with
// `three/webgpu` and three/tsl/materials.js on the lab's renderer — and the two
// canvases sit on top of each other, so a contact sheet of `side=ref` against
// `side=port` at the same probe is the port's whole acceptance test.
//
//   ?probe=line|wramp|holo|skin|skin2|dot|dotw|core|deep|grid|flat
//   ?side=port|ref     which canvas is on top (both are always drawn)
//
// The two roots share three.core.js, so a Vector3 is the same class in both
// and the geometry helpers in world/materials.js serve both sides.

export const options = {};

const PROBES = [
	'line',
	'wramp',
	'holo',
	'skin',
	'skin2',
	'dot',
	'dotw',
	'core',
	'deep',
	'grid',
	'flat'
];

export default async function make({ THREE, renderer }) {
	const q = new URLSearchParams(location.search);
	const probe = PROBES.includes(q.get('probe')) ? q.get('probe') : 'line';
	const side = q.get('side') === 'ref' ? 'ref' : 'port';

	// ── The reference renderer, on its own canvas ────────────────────────
	const refCanvas = document.createElement('canvas');
	Object.assign(refCanvas.style, {
		position: 'fixed',
		inset: '0',
		width: '100vw',
		height: '100vh',
		display: side === 'ref' ? 'block' : 'none',
		zIndex: '2',
		background: '#000'
	});
	document.body.appendChild(refCanvas);
	// Stacking order is not enough: headless Chrome composites a WebGPU canvas
	// on its own surface, over the DOM order. So the side that is not being
	// looked at is hidden outright, and the other is all there is to see.
	if (side === 'ref') renderer.domElement.style.visibility = 'hidden';
	const ref = new GL.WebGLRenderer({ canvas: refCanvas, antialias: true, alpha: false });
	ref.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	ref.setSize(window.innerWidth, window.innerHeight);
	ref.outputColorSpace = GL.SRGBColorSpace;
	ref.setClearColor(0x000000, 1);

	const W = window.innerWidth;
	const H = window.innerHeight;

	// ── One probe, built for one side ────────────────────────────────────
	// `T` is the root (three or three/webgpu), `M` its materials module.
	function build(T, M, isPort) {
		const scene = new T.Scene();
		const camera = new T.PerspectiveCamera(30, W / H, 0.1, 100);
		camera.position.set(0, 0, 8);
		const out = { scene, camera, backdrop: null };

		const edges = (scale, withW) => {
			const pos = edgePositions(scale);
			const geo = new T.BufferGeometry();
			geo.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3));
			const n = pos.length / 6;
			const spread = REF.segmentAttributes(geo, n, (i) => i / n);
			if (withW) {
				const aW = new Float32Array(n * 2);
				for (let i = 0; i < n * 2; i++) aW[i] = (pos[i * 3 + 1] / (CIRCUMRADIUS * scale)) * 0.95;
				geo.setAttribute('aW', new T.BufferAttribute(aW, 1));
			}
			return { geo, spread };
		};
		const vertexPoints = (scale, withW) => {
			const geo = new T.BufferGeometry();
			const pos = new Float32Array(VERTICES.flat().map((v) => v * scale));
			geo.setAttribute('position', new T.BufferAttribute(pos, 3));
			if (withW) {
				const aW = new Float32Array(VERTICES.map((v) => (v[1] / CIRCUMRADIUS) * 0.95));
				geo.setAttribute('aW', new T.BufferAttribute(aW, 1));
			}
			return geo;
		};
		const tilt = (o) => {
			o.rotation.set(0.5, 0.8, 0);
			return o;
		};

		switch (probe) {
			case 'line':
			case 'wramp': {
				const { geo, spread } = edges(1.3, probe === 'wramp');
				const mat = M.lineMaterial(0xf0c45c, 1, { wRamp: probe === 'wramp' });
				REF.grower(mat, spread)(0.78);
				scene.add(tilt(new T.LineSegments(geo, mat)));
				break;
			}
			case 'holo': {
				const mat = M.holoMaterial({
					ink: 0x8fd0ff,
					accent: 0xffffff,
					fog: 0x0a0a0c,
					fogDensity: 0.05,
					rings: 9,
					longs: 12
				});
				mat.uniforms.uOpacity.value = 1;
				mat.uniforms.uTime.value = 1.7;
				scene.add(tilt(new T.Mesh(new T.TorusKnotGeometry(1.1, 0.32, 220, 36), mat)));
				break;
			}
			case 'skin':
			case 'skin2': {
				const mat =
					probe === 'skin'
						? M.skinMaterial({ ink: 0x1a1408, accent: 0xf0c45c, power: 3, base: 0, add: true })
						: M.skinMaterial({ ink: 0x3a2a10, accent: 0xffd426, power: 2, base: 0.08 });
				scene.add(new T.Mesh(new T.SphereGeometry(1.7, 64, 32), mat));
				break;
			}
			case 'dot':
			case 'dotw': {
				const geo = vertexPoints(1.5, probe === 'dotw');
				const mat = M.dotMaterial(0xffe6a3, 14, { wRamp: probe === 'dotw' });
				mat.uniforms.uOpacity.value = 1;
				scene.add(tilt(isPort ? PORT.dots(geo, mat) : new T.Points(geo, mat)));
				break;
			}
			case 'core': {
				const mat = M.coreMaterial({
					ink: 0x120e08,
					wave: 0xf0c45c,
					hot: 0xfff0c8,
					rim: 0xffd426,
					rimPower: 2.2
				});
				const u = mat.uniforms;
				u.uOpacity.value = 1;
				u.uGlow.value = 0.85;
				u.uFurrow.value = 0.7;
				u.uLobe.value = 0.45;
				u.uChop.value = 0.5;
				u.uFront.value = 1.2;
				u.uGrain.value = 0.7;
				u.uPhase.value = 3.0;
				u.uRing.value = 0.3;
				u.uRimGain.value = 0.6;
				scene.add(new T.Mesh(new T.SphereGeometry(1.7, 128, 64), mat));
				break;
			}
			case 'deep':
			case 'grid':
			case 'flat': {
				out.backdrop = probe;
				break;
			}
		}
		return out;
	}

	// The backdrop uniforms, the same numbers on both sides.
	const rot = new GL.Matrix3().setFromMatrix4(
		new GL.Matrix4().makeRotationAxis(new GL.Vector3(1, 1, 0).normalize(), 0.7)
	);
	const values = (name) => ({
		color1: name === 'deep' ? 0x14213d : 0x0a0a0c,
		color2: [1.0, 0.82, 0.36],
		color3: [1.0, 0.71, 0.29],
		mouse: [0.3, 0.3],
		uTime: 4.2,
		uFade: 1,
		uRays: [1, 0.6, 0.15]
	});

	const R = build(GL, REF, false);
	const P = build(THREE, PORT, true);

	// The reference backdrop: the GLSL on a full-screen triangle, as
	// components/Background.svelte draws it.
	if (R.backdrop) {
		const v = values(R.backdrop);
		const geo = new GL.BufferGeometry();
		geo.setAttribute(
			'position',
			new GL.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
		);
		geo.setAttribute('aPos', new GL.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
		const mat = new GL.ShaderMaterial({
			vertexShader: VERT,
			fragmentShader: PRELUDE + SHADERS[R.backdrop],
			depthTest: false,
			depthWrite: false,
			uniforms: {
				color1: { value: new GL.Color(v.color1) },
				color2: { value: new GL.Color(...v.color2) },
				color3: { value: new GL.Color(...v.color3) },
				mouse: { value: new GL.Vector2(...v.mouse) },
				aspectRatio: { value: W / H },
				uTime: { value: v.uTime },
				uRot: { value: rot },
				uFade: { value: v.uFade },
				uPx: { value: 1 / refCanvas.height },
				uRays: { value: new GL.Vector3(...v.uRays) }
			}
		});
		const tri = new GL.Mesh(geo, mat);
		tri.frustumCulled = false;
		R.scene.add(tri);
		R.uni = mat.uniforms;
	}
	// The port backdrop: the node, as the scene's background.
	if (P.backdrop) {
		const v = values(P.backdrop);
		const u = backdropUniforms();
		u.color1.value.set(v.color1);
		u.color2.value.setRGB(...v.color2);
		u.color3.value.setRGB(...v.color3);
		u.mouse.value.set(...v.mouse);
		u.aspectRatio.value = W / H;
		u.uTime.value = v.uTime;
		u.uRot.value.copy(rot);
		u.uFade.value = v.uFade;
		u.uPx.value = 1 / renderer.domElement.height;
		u.uRays.value.set(...v.uRays);
		P.scene.backgroundNode = BACKDROPS[P.backdrop](u);
		P.uni = u;
	}

	return {
		info: { probe, side, probes: PROBES },
		update() {},
		render() {
			ref.render(R.scene, R.camera);
			renderer.render(P.scene, P.camera);
		},
		resize(w, h) {
			for (const s of [R, P]) {
				s.camera.aspect = w / h;
				s.camera.updateProjectionMatrix();
			}
			ref.setSize(w, h);
			if (R.uni) {
				R.uni.aspectRatio.value = w / h;
				R.uni.uPx.value = 1 / refCanvas.height;
			}
			if (P.uni) {
				P.uni.aspectRatio.value = w / h;
				P.uni.uPx.value = 1 / renderer.domElement.height;
			}
		}
	};
}
