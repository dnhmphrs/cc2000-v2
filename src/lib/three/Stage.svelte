<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { scene as sceneStore, sceneTone, monitorRect } from '$lib/store/store';
	import { CANVAS_FADE, FLASH_DECAY, clamp01 } from '$lib/config';
	import { createTunnel } from './world/tunnel';
	import { createLattice } from './world/lattice';
	import { advance } from '$lib/scenes/director';
	import FlyIn from '$lib/scenes/FlyIn.svelte';
	import Conception from '$lib/scenes/Conception.svelte';
	import Computation from '$lib/scenes/Computation.svelte';

	// ── The stage ────────────────────────────────────────────────────────────
	// One canvas, one renderer, one clock. It runs the three 3D scenes and
	// nothing else: it does not know what any of them contains, only that each
	// one answers the same five calls.
	//
	//   enter()      you are the active scene — reset yourself
	//   update(dt)   a frame; return true when your duration is up
	//   render(r)    draw yourself
	//   backdrop()   { color, alpha } for the renderer to clear to
	//   resize()     the window changed
	//
	// Which scene is active comes from the `scene` store, so the DOM screens and
	// the 3D are never out of step — there is one answer to "where are we" and
	// both halves read it.
	//
	// TWO WORLDS, THREE SCENES. The fly-in has the tunnel to itself; the
	// conception and the computation share the lattice, which is why the
	// icosahedron the conception assembles is the one the computation projects
	// panes off. Both worlds size their egg from the same EGG_SCREEN, so the one
	// cut between them cannot move it — which is why there is exactly one
	// visible transition in the whole run: the white blow-out that ends the
	// fly-in, thrown here.

	let canvasElement;
	let renderer;
	let clock;
	let animationFrameId;
	let tunnel, lattice;
	let flyIn, conception, computation;
	let mounted = false;

	const SCENE_OF = {
		flyIn: () => flyIn,
		conception: () => conception,
		computation: () => computation
	};

	let canvasFadeStart = null;
	let flashEl;
	let flash = 0;

	// Which scene we last handed control to, so entering happens exactly once,
	// and the last 3D scene to run, whose final frame is HELD while a DOM scene
	// is on top of it.
	let entered = null;
	let held = null;

	function sync(name) {
		const next = SCENE_OF[name]?.();
		// 'calculator' and 'room' have no 3D of their own — they are DOM screens
		// over whatever the 3D last drew. Leave it alone.
		if (!next) return;
		if (entered === name) return;
		// The one blow-out in the run: through the flash, the air goes from deep
		// blue to white and the world changes underneath it.
		if (name === 'conception') flash = 1;
		entered = name;
		held = next;
		next.enter();
	}

	function handleResize() {
		if (!renderer) return;
		renderer.setSize(window.innerWidth, window.innerHeight);
		flyIn?.resize();
		conception?.resize();
		computation?.resize();
		if (entered === 'computation') computation?.remeasureMonitor();
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock || !renderer) return;

		const name = $sceneStore;
		sync(name);
		const active = SCENE_OF[name]?.();

		// Clamped so a one-off hitch (a GLTF parse, a texture upload) cannot jump
		// the animation forward.
		const dt = Math.min(clock.getDelta(), 0.05);

		const since = canvasFadeStart != null ? performance.now() / 1000 - canvasFadeStart - 0.2 : 0;
		canvasElement.style.opacity = clamp01(since / CANVAS_FADE).toFixed(4);

		flash = Math.max(0, flash - dt * FLASH_DECAY);
		if (flashEl) flashEl.style.opacity = flash.toFixed(4);

		if (!active) {
			// A DOM screen is up. Which frame sits behind it depends on whether a
			// run has left one: monitorRect is set from the moment a room lands
			// until the calculator has flown back out of that room's monitor, so
			// it is exactly the window in which the room must stay on screen.
			if (held && $monitorRect) {
				const b = held.backdrop();
				renderer.setClearColor(b.color, b.alpha);
				sceneTone.set(luma(b.color) > 0.55 ? 'light' : 'dark');
				held.render(renderer);
				return;
			}
			// Otherwise we are between runs: the calculator is on screen and the
			// tunnel idles behind it, so its window has something to look at.
			if (held) {
				held = null;
				entered = null;
				tunnel.reset();
				lattice.reset();
			}
			renderer.setClearColor(tunnel.getAir(), 1);
			sceneTone.set('dark');
			renderer.render(tunnel.scene, tunnel.camera);
			return;
		}

		if (active.update(dt)) advance(name);

		// The ground swings from deep blue to white mid-run, so anything drawn
		// over the canvas is told which it is on.
		const { color, alpha } = active.backdrop();
		renderer.setClearColor(color, alpha);
		sceneTone.set(luma(color) > 0.55 ? 'light' : 'dark');
		active.render(renderer);
	}

	// Rec. 709 on the clear colour — enough to choose dark type or light.
	function luma(hex) {
		const r = ((hex >> 16) & 255) / 255;
		const g = ((hex >> 8) & 255) / 255;
		const b = (hex & 255) / 255;
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	onMount(async () => {
		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputEncoding = THREE.sRGBEncoding;
		clock = new THREE.Clock();

		tunnel = createTunnel();
		lattice = createLattice();
		tunnel.reset();
		lattice.reset();

		mounted = true;
		await tick(); // let the scene components exist

		await computation.init();
		handleResize();

		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;
		window.addEventListener('resize', handleResize);

		animate();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		computation?.dispose();
		tunnel?.dispose();
		lattice?.dispose();
		renderer?.dispose();
	});
</script>

{#if mounted}
	<FlyIn bind:this={flyIn} world={tunnel} />
	<Conception bind:this={conception} world={lattice} />
	<Computation bind:this={computation} world={lattice} {renderer} />
{/if}

<canvas bind:this={canvasElement} />
<div class="flash" bind:this={flashEl} />

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

	/* The moment of conception. Over the 3D and the static, under the UI. */
	.flash {
		position: fixed;
		inset: 0;
		z-index: 4;
		background: #fff;
		opacity: 0;
		pointer-events: none;
	}
</style>
