<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { phase, spiralDone } from '$lib/store/store';
	import { accentHex } from '$lib/theme';
	import { elementUrl } from '$lib/data/roomElements';

	let canvas;
	let renderer, scene, camera;
	let frame;

	const PHI = 1.618033988749895;
	const IPHI = 1 / PHI;
	const IP2 = IPHI * IPHI;
	const IP3 = IP2 * IPHI;
	const IP4 = IP2 * IP2;

	// Convergence (pole) of the golden-rectangle square spiral, in tiling coords.
	const CX = IP2 / (1 - IP4);
	const CY = IP3 / (1 - IP4);

	const PHI4 = PHI ** 4;
	const CYCLE = 9;            // seconds per φ⁴ zoom step
	const NUM_LAYERS = 4;       // overlapping tilings → seamless infinite zoom
	const SQUARES = 15;         // nested squares drawn per tiling

	const FILL_OPACITY = 0.26;  // colored square panels (kept subtle to avoid washout)
	const FRUSTUM_H = 0.19;     // view height in world units (smaller = more zoomed / vibrant)
	const CONDENSE_DURATION = 5.0;

	// Floating room-element objects, woven between the square layers by render order.
	const NUM_FLOATERS = 9;

	let condenseState = 0;      // 0 = normal, 1 = condensing + fading, 2 = done
	let condenseStartTime = null;
	let unsubPhase;

	let layers = [];            // { fill, fillMat, arc, arcMat, group }
	let floaters = [];          // { mesh, mat, ... }
	let accentColor = new THREE.Color(0xc2a133);
	$: accentColor.setHex($accentHex);

	// ── Golden-rectangle square subdivision ────────────────────────────────────
	function buildSquares() {
		const squares = [];
		let L = 0, B = 0, R = PHI, T = 1;
		for (let i = 0; i < SQUARES; i++) {
			const side = i % 4;
			let sq;
			if (side === 0)      { const s = T - B; R -= s; sq = { L: R, B, R: R + s, T }; }
			else if (side === 1) { const s = R - L; T -= s; sq = { L, B: T, R, T: T + s }; }
			else if (side === 2) { const s = T - B; L += s; sq = { L: L - s, B, R: L, T }; }
			else                 { const s = R - L; B += s; sq = { L, B: B - s, R, T: B }; }
			squares.push(sq);
		}
		return squares;
	}

	function tilingColor(k) {
		// Rainbow-ish hue cycle across the nesting (jewel tones) — the "color" GIF.
		const c = new THREE.Color();
		c.setHSL((0.07 + k * 0.085) % 1, 0.58, 0.55);
		return c;
	}

	function buildFillGeometry(squares) {
		const pos = [];
		const col = [];
		squares.forEach((s, k) => {
			const c = tilingColor(k);
			// two triangles
			const quad = [
				[s.L, s.B], [s.R, s.B], [s.R, s.T],
				[s.L, s.B], [s.R, s.T], [s.L, s.T]
			];
			quad.forEach(([x, y]) => { pos.push(x, y, 0); col.push(c.r, c.g, c.b); });
		});
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
		return geo;
	}

	function buildEdgeGeometry(squares) {
		const pos = [];
		squares.forEach((s) => {
			const c = [[s.L, s.B], [s.R, s.B], [s.R, s.T], [s.L, s.T]];
			for (let e = 0; e < 4; e++) {
				const a = c[e], b = c[(e + 1) % 4];
				pos.push(a[0], a[1], 0, b[0], b[1], 0);
			}
		});
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		return geo;
	}

	function buildArcGeometry(squares) {
		const pos = [];
		// A quarter-circle arc in each square, chained into the log spiral.
		squares.forEach((s, i) => {
			const side = i % 4;
			const w = s.R - s.L;
			let cx, cy, a0;
			if (side === 0)      { cx = s.L; cy = s.B; a0 = 0; }
			else if (side === 1) { cx = s.R; cy = s.B; a0 = Math.PI / 2; }
			else if (side === 2) { cx = s.R; cy = s.T; a0 = Math.PI; }
			else                 { cx = s.L; cy = s.T; a0 = Math.PI * 1.5; }
			const seg = 24;
			for (let j = 0; j < seg; j++) {
				const b0 = a0 + (Math.PI / 2) * (j / seg);
				const b1 = a0 + (Math.PI / 2) * ((j + 1) / seg);
				pos.push(cx + Math.cos(b0) * w, cy + Math.sin(b0) * w, 0);
				pos.push(cx + Math.cos(b1) * w, cy + Math.sin(b1) * w, 0);
			}
		});
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		return geo;
	}

	function buildFloaters() {
		const loader = new THREE.TextureLoader();
		const pool = [];
		['50s', '60s', '90s', '10s'].forEach(d => ['clock', 'poster', 'screen'].forEach(k => pool.push([d, k])));
		for (let i = 0; i < NUM_FLOATERS; i++) {
			const [d, k] = pool[Math.floor(Math.random() * pool.length)];
			const mat = new THREE.MeshBasicMaterial({
				transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide
			});
			const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
			// Interleave render order among the layer fills (0 .. NUM_LAYERS*10),
			// so each object is veiled by some square layers and floats over others.
			mesh.renderOrder = 1 + Math.random() * (NUM_LAYERS * 10 - 2);
			// View is only ~0.18 units tall, so keep homes/sizes small.
			const ang = (i / NUM_FLOATERS) * Math.PI * 2 + Math.random() * 0.5;
			const rad = 0.03 + Math.random() * 0.06;
			mesh.userData = {
				home: new THREE.Vector2(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.85),
				ax: 0.006 + Math.random() * 0.012, ay: 0.006 + Math.random() * 0.012,
				fx: 0.05 + Math.random() * 0.1, fy: 0.05 + Math.random() * 0.1,
				px: Math.random() * 6.28, py: Math.random() * 6.28,
				tilt: (Math.random() - 0.5) * 0.4, spin: (Math.random() - 0.5) * 0.05,
				base: 0.55 + Math.random() * 0.35, fp: 0.08 + Math.random() * 0.1, pp: Math.random() * 6.28,
				size: 0.022 + Math.random() * 0.026
			};
			mesh.rotation.z = mesh.userData.tilt;
			scene.add(mesh);
			const entry = { mesh, mat };
			floaters.push(entry);
			loader.load(elementUrl(d, k), (tex) => {
				tex.encoding = THREE.sRGBEncoding;
				tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
				const a = (tex.image?.width || 1) / (tex.image?.height || 1);
				const s = mesh.userData.size;
				mesh.scale.set(s * a, s, 1);
				mat.map = tex; mat.needsUpdate = true;
				try { renderer.initTexture(tex); } catch (e) { /* ignore */ }
			});
		}
	}

	function easeInOutCubic(t) {
		return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setClearColor(0x1b1b1b, 0);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputEncoding = THREE.sRGBEncoding;

		scene = new THREE.Scene();
		camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
		camera.position.z = 5;

		const squares = buildSquares();
		const fillGeo = buildFillGeometry(squares);
		const edgeGeo = buildEdgeGeometry(squares);
		const arcGeo = buildArcGeometry(squares);

		for (let i = 0; i < NUM_LAYERS; i++) {
			const fillMat = new THREE.MeshBasicMaterial({
				vertexColors: true, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide
			});
			const fill = new THREE.Mesh(fillGeo, fillMat);
			const edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthTest: false });
			const edge = new THREE.LineSegments(edgeGeo, edgeMat);
			const arcMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthTest: false });
			const arc = new THREE.LineSegments(arcGeo, arcMat);
			const group = new THREE.Group();
			group.add(fill); group.add(edge); group.add(arc);
			scene.add(group);
			layers.push({ fill, fillMat, edge, edgeMat, arc, arcMat, group });
		}

		buildFloaters();

		function applyFrustum(h) {
			const aspect = window.innerWidth / window.innerHeight;
			const fw = h * aspect;
			camera.left = -fw / 2; camera.right = fw / 2;
			camera.top = h / 2; camera.bottom = -h / 2;
			camera.updateProjectionMatrix();
		}
		function resize() { renderer.setSize(window.innerWidth, window.innerHeight); applyFrustum(FRUSTUM_H); }
		window.addEventListener('resize', resize);
		applyFrustum(FRUSTUM_H);

		unsubPhase = phase.subscribe((p) => {
			if (p === 'transition' && condenseState === 0) {
				condenseState = 1;
				condenseStartTime = null;
				spiralDone.set(true);
			}
		});

		const start = performance.now();
		const animate = (t) => {
			const time = t * 0.001;
			const baseT = (time % CYCLE) / CYCLE;

			if (condenseState === 1 && condenseStartTime === null) condenseStartTime = time;
			let cp = 0;
			if (condenseState === 1) {
				cp = Math.min((time - condenseStartTime) / CONDENSE_DURATION, 1);
				if (cp >= 1) { condenseState = 2; canvas.style.display = 'none'; }
			}
			if (condenseState === 2) { frame = requestAnimationFrame(animate); return; }

			const globalFade = condenseState === 0 ? 1 : Math.max(0, 1 - Math.max(0, (cp - 0.55) / 0.45));
			// intro fade-in over the first ~1.5s from mount
			const fadeIn = Math.min((time - start / 1000) / 1.5, 1);

			for (let n = 0; n < NUM_LAYERS; n++) {
				const { fillMat, edgeMat, arcMat, group } = layers[n];
				const life = (baseT + n / NUM_LAYERS) % 1;
				const zoom = PHI4 ** life;
				const env = Math.min(life / 0.14, (1 - life) / 0.5, 1); // fade in at pole, out at edge

				let lz = zoom, rot = 0;
				if (condenseState === 1) {
					const stagger = (1 - life) * 0.3;
					const tm = easeInOutCubic(Math.max(0, Math.min((cp - stagger) / (1 - stagger), 1)));
					lz = zoom + (1 - zoom) * tm; // converge to zoom 1 (pole)
				}
				const cos = Math.cos(rot), sin = Math.sin(rot);
				group.scale.set(lz, lz, 1);
				group.position.x = -(CX * cos - CY * sin) * lz;
				group.position.y = -(CX * sin + CY * cos) * lz;

				const a = env * globalFade * fadeIn;
				fillMat.opacity = a * FILL_OPACITY;
				edgeMat.opacity = a * 0.7;
				edgeMat.color.copy(accentColor);
				arcMat.opacity = a * 0.95;
				arcMat.color.copy(accentColor);
				// Bigger (nearer, higher life) layers draw later → over the pole ones;
				// floating objects interleave by their own render order.
				const ro = life * NUM_LAYERS * 10;
				layers[n].fill.renderOrder = ro;
				layers[n].edge.renderOrder = ro + 0.3;
				layers[n].arc.renderOrder = ro + 0.5;
			}

			// floating objects bob and fade with the intro
			floaters.forEach(({ mesh, mat }) => {
				const u = mesh.userData;
				mesh.position.set(
					u.home.x + Math.sin(time * u.fx * 6.28 + u.px) * u.ax,
					u.home.y + Math.sin(time * u.fy * 6.28 + u.py) * u.ay,
					0
				);
				mesh.rotation.z = u.tilt + Math.sin(time * u.spin * 6.28) * 0.15;
				const pulse = 0.75 + 0.25 * Math.sin(time * u.fp * 6.28 + u.pp);
				mat.opacity = (mat.map ? 1 : 0) * u.base * pulse * globalFade * fadeIn;
			});

			renderer.render(scene, camera);
			frame = requestAnimationFrame(animate);
		};
		frame = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(frame);
		unsubPhase?.();
		floaters.forEach(({ mesh, mat }) => { mesh.geometry.dispose(); if (mat.map) mat.map.dispose(); mat.dispose(); });
		renderer?.dispose();
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 2;
	}
</style>
