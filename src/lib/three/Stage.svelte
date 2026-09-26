<script>
	import { onMount, onDestroy } from 'svelte';
	import { scene as sceneStore, sceneTone, monitorRect, goingBack, blaze } from '$lib/store/store';
	import { CANVAS_FADE, clamp01, DEV, DEV_AT } from '$lib/config';
	import { advance } from '$lib/scenes/director';

	// ── The stage ────────────────────────────────────────────────────────────
	// One canvas, one renderer, one clock. It runs the three 3D scenes and
	// nothing else: it does not know what any of them contains, only that each
	// one answers the same calls.
	//
	//   enter()      you are the active scene — reset yourself
	//   update(dt)   a frame; return true when your duration is up
	//   render()     draw yourself
	//   resize(w,h)  the window changed
	//   seek(v)      pin yourself at a fraction of your duration (?at=)
	//
	// Which scene is active comes from the `scene` store, so the DOM screens and
	// the 3D are never out of step — there is one answer to "where are we" and
	// both halves read it.
	//
	// ONE RENDERER, WebGPU, with the WebGL 2 backend behind it for browsers
	// that have no WebGPU (?gl=1 forces it). Every material is TSL, so both
	// backends draw the same picture. The scenes paint their own grounds now;
	// there is no shader canvas behind this one.
	//
	// THREE SCENES, ONE SHOT. The approach flies up to a set, the kaleido
	// flies through it and down the tunnel inside to the first room, and the
	// descent falls through that: each frame one scene ends on is the frame
	// the next opens on — the same call into the same world (kaleidoscope.js
	// pose(0), nest.js pose(0)) — so there is no cut to cover and nothing to
	// synchronise.

	let canvasElement;
	let renderer;
	let scenes = {};
	let nest;
	let kal;
	let last = 0;

	let canvasFadeStart = null;
	let flashEl;
	// The signal — the CRT pass every scene is drawn through (tsl/crt.js), or
	// null with ?crt=0, when the scenes draw straight to the canvas.
	let crt = null;

	// Which scene we last handed control to, so entering happens exactly once,
	// and the last 3D scene to run, whose final frame is HELD while the room is
	// on top of it.
	let entered = null;
	let held = null;
	// True while the held scene is flying back into its own monitor.
	let returning = false;

	function sync(name) {
		const next = scenes[name];
		// 'room' and 'error' have no 3D of their own — they are DOM screens
		// over whatever the 3D last drew. Leave it alone.
		if (!next) return;
		if (entered === name) return;
		entered = name;
		held = next;
		returning = false;
		next.enter();
	}

	// One frame of a scene, through the signal.
	function draw(s) {
		if (crt) {
			crt.use(s.scene, s.camera);
			crt.render();
		} else s.render();
	}

	function handleResize() {
		if (!renderer) return;
		const w = window.innerWidth;
		const h = window.innerHeight;
		renderer.setSize(w, h);
		crt?.resize();
		for (const s of Object.values(scenes)) s.resize?.(w, h);
		if (entered === 'descent') scenes.descent?.remeasureMonitor?.();
	}

	function frame() {
		if (!renderer) return;
		const now = performance.now();
		// Clamped so a one-off hitch (a GLTF parse, a texture upload) cannot jump
		// the animation forward.
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;

		const name = $sceneStore;
		sync(name);
		const active = scenes[name];

		const since = canvasFadeStart != null ? now / 1000 - canvasFadeStart - 0.2 : 0;
		canvasElement.style.opacity = clamp01(since / CANVAS_FADE).toFixed(4);
		if (flashEl) flashEl.style.opacity = clamp01($blaze).toFixed(4);

		if (!active) {
			// The room is up, over the descent's last frame.
			if (!held) return;
			if ($monitorRect && $goingBack) {
				// On the way home the camera flies THROUGH the monitor. The room
				// is still the scene on screen while it happens, so the signal is
				// a store rather than a scene change. See director.again().
				if (!returning) {
					returning = true;
					held.beginReturn?.();
				}
				held.stepReturn?.(dt);
			} else {
				returning = false;
				held.hold?.(dt);
			}
			draw(held);
			return;
		}

		// A scene that has run out hands on to the next — unless the dev harness
		// has pinned this one, in which case it simply runs again.
		//
		// ?at= holds the scene at one progress instead of running it, which is
		// exact because every 3D scene is a pure function of its own progress.
		if (DEV.on && DEV_AT != null) active.seek(DEV_AT);
		else if (active.update(dt)) {
			if (DEV.on && DEV.only === name) active.enter();
			else advance(name);
		}
		draw(active);
	}

	onMount(async () => {
		// Dynamic on purpose: three/webgpu must never be evaluated during SSR.
		const THREE = await import('three/webgpu');
		const q = new URLSearchParams(location.search);
		const make = async (forceWebGL) => {
			const r = new THREE.WebGPURenderer({
				canvas: canvasElement,
				antialias: true,
				alpha: false,
				stencil: true, // the nest's stencil chain
				// Eight bits, not half floats: the run has nothing brighter than
				// white to keep, and the CRT pass (tsl/crt.js) renders every
				// scene into a target of this type first — one the WebGL 2
				// backend can BLEND into everywhere, which a half-float target
				// is not on every GL (SwiftShader drops every additive draw
				// into one, and the stars, the debris and the swimmer are all
				// additive).
				outputBufferType: THREE.UnsignedByteType,
				forceWebGL
			});
			await r.init();
			return r;
		};
		try {
			renderer = await make(q.get('gl') === '1');
		} catch {
			renderer = await make(true);
		}
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 1);
		const lane = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl';
		sceneTone.set('dark');

		const [
			{ createNest },
			{ createKaleidoscope },
			{ createApproach },
			{ createKaleido },
			{ createDescent },
			{ createCrt },
			{ CRT }
		] = await Promise.all([
			import('./world/nest.js'),
			import('./world/kaleidoscope.js'),
			import('./world/approach.js'),
			import('./world/kaleido.js'),
			import('./world/descent.js'),
			import('./tsl/crt.js'),
			import('$lib/config')
		]);
		nest = await createNest({ THREE, renderer });
		kal = createKaleidoscope({ THREE, renderer, nest });
		scenes = {
			approach: await createApproach({ THREE, renderer, nest, kal }),
			kaleido: createKaleido({ THREE, renderer, nest, kal }),
			descent: createDescent({ THREE, renderer, nest })
		};
		if (CRT.on && q.get('crt') !== '0') {
			crt = createCrt({
				THREE,
				renderer,
				scene: scenes.approach.scene,
				camera: scenes.approach.camera
			});
		}
		handleResize();
		// ── Warm-up ──────────────────────────────────────────────────────
		// Every program and every texture the run needs, brought up BEFORE the
		// first frame — a few objects at a time, yielding to the page between,
		// so the title card typing over this keeps its rhythm on a slow GPU and
		// no frame of the run itself stalls for a compile. The kaleido's and
		// the descent's materials are the kaleidoscope's and the nest's, which
		// the approach already holds. One object per MATERIAL: it is programs
		// that compile, and the tunnel is four hundred quads on twenty of them.
		// The canvas is still at opacity 0 while this happens.
		scenes.approach.enter();
		entered = 'approach';
		held = scenes.approach;
		const warmStart = performance.now();
		{
			const { scene: s, camera: c } = scenes.approach;
			const every = [];
			s.traverse((o) => {
				if (o.isMesh || o.isLine || o.isSprite || o.isPoints) every.push(o);
			});
			const shown = (o) => {
				for (let a = o; a; a = a.parent) if (!a.visible) return false;
				return true;
			};
			const firsts = [];
			const seen = [];
			for (const o of every) {
				if (!shown(o)) continue;
				const m = o.material;
				if (m && seen.includes(m)) continue;
				if (m) seen.push(m);
				firsts.push(o);
			}
			const vis = every.map((o) => o.visible);
			every.forEach((o) => (o.visible = false));
			const CHUNK = 6;
			for (let i = 0; i < firsts.length; i += CHUNK) {
				for (let j = i; j < Math.min(i + CHUNK, firsts.length); j++) firsts[j].visible = true;
				renderer.render(s, c);
				await new Promise((r) => setTimeout(r, 0));
			}
			every.forEach((o, i) => (o.visible = vis[i]));
		}

		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;
		window.addEventListener('resize', handleResize);
		// For the contact sheets and the smoke test: which backend ran, how long
		// the warm-up took, and a handle on the scenes.
		window.__stage = {
			lane,
			warm: Math.round(performance.now() - warmStart),
			scenes,
			nest,
			kal,
			renderer,
			crt
		};

		last = performance.now();
		renderer.setAnimationLoop(frame);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		renderer?.setAnimationLoop(null);
		window.removeEventListener('resize', handleResize);
		scenes.approach?.dispose?.();
		kal?.dispose?.();
		nest?.dispose?.();
		renderer?.dispose?.();
	});
</script>

<canvas bind:this={canvasElement}></canvas>
<div class="flash" bind:this={flashEl}></div>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 1;
		opacity: 0;
	}

	/* The splosh. Over the 3D and the static, under the UI. */
	.flash {
		position: fixed;
		inset: 0;
		z-index: 4;
		background: #fff;
		opacity: 0;
		pointer-events: none;
	}
</style>
