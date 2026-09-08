<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { scene as sceneStore, sceneTone, monitorRect, backdrop } from '$lib/store/store';
	import { CANVAS_FADE, FLASH_HOLD, FLASH_FALL, clamp01, DEV, DEV_AT } from '$lib/config';
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
	//   backdrop()   { color, shader } — the colour the scene is on, and which
	//                of three/shaders/ is drawn behind it
	//   resize()     the window changed
	//
	// Which scene is active comes from the `scene` store, so the DOM screens and
	// the 3D are never out of step — there is one answer to "where are we" and
	// both halves read it.
	//
	// TWO WORLDS, THREE SCENES, AND NO TRANSITION BETWEEN THEM. The fly-in has
	// the tunnel to itself; the conception and the computation share the lattice,
	// which is why the icosahedron the conception assembles is the one the
	// computation projects panes off.
	//
	// There is no blow-out any more. The fly-in ENDS on the frame the conception
	// OPENS on — the same dark sphere, the same gold rim, the same size, on the
	// same flat void, with both backdrop shaders faded to that void (see
	// store/store.js fieldFade) — so the hand-over between the two worlds is
	// invisible and the middle three scenes run as one shot. The flash envelope
	// below is kept because it costs nothing; nothing throws it.

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
	// Kept, and never thrown. See the note above: the run no longer has a cut in
	// it to cover.
	let flashT = Infinity;

	// Which scene we last handed control to, so entering happens exactly once,
	// and the last 3D scene to run, whose final frame is HELD while a DOM scene
	// is on top of it.
	let entered = null;
	let held = null;
	// True while the held scene is flying back into its own monitor.
	let returning = false;

	function sync(name) {
		const next = SCENE_OF[name]?.();
		// 'calculator' and 'room' have no 3D of their own — they are DOM screens
		// over whatever the 3D last drew. Leave it alone.
		if (!next) return;
		if (entered === name) return;
		entered = name;
		held = next;
		// A new run has taken the screen, so the last one's flight home is over.
		// It cannot be reset in the idle branch below any more: the room stays on
		// screen behind the machine now, so that branch is only reached on a cold
		// load. See scenes/director.js settled().
		returning = false;
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

		// Infinity until a blow-out is thrown, which puts the envelope at zero and
		// keeps it there without a second flag to test.
		flashT += dt;
		if (flashEl) {
			flashEl.style.opacity = (1 - clamp01((flashT - FLASH_HOLD) / FLASH_FALL)).toFixed(4);
		}

		if (!active) {
			// A DOM screen is up. Which frame sits behind it depends on whether a
			// run has left one: monitorRect is set from the moment a room lands
			// until the NEXT run reaches the computation — so after a run the room
			// stays on screen for good, with the machine sitting in its monitor.
			// That is the end of the loop now; it does not go back to full screen.
			if (held && $monitorRect) {
				// On the way home the room is not merely held — the camera flies
				// into its monitor while the calculator grows out of it. Two sides
				// of one move, so they are driven from the same duration and the
				// calculator locks itself to the rect this republishes.
				if (name === 'calculator') {
					if (!returning) {
						returning = true;
						held.beginReturn?.();
					}
					held.stepReturn?.(dt);
				}
				const hb = held.backdrop();
				ground(hb.color, hb.shader);
				held.render(renderer);
				return;
			}
			returning = false;
			// Otherwise we are between runs: the calculator is on screen and the
			// tunnel idles behind it, so its window has something to look at.
			if (held) {
				held = null;
				entered = null;
				tunnel.reset();
				lattice.reset();
			}
			ground(tunnel.getAir(), 'flat');
			renderer.render(tunnel.scene, tunnel.camera);
			return;
		}

		// A scene that has run out hands on to the next — unless the dev harness
		// has pinned this one, in which case it simply runs again. Looping here
		// rather than in the director keeps the director describing the site's
		// real control flow and nothing else.
		//
		// ?at= holds the scene at one progress instead of running it, which is
		// exact because every 3D scene is a pure function of its own progress.
		if (DEV.on && DEV_AT != null) active.seek(DEV_AT);
		else if (active.update(dt)) {
			if (DEV.on && DEV.only === name) active.enter();
			else advance(name);
		}

		const ab = active.backdrop();
		ground(ab.color, ab.shader);
		active.render(renderer);
	}

	// The 3D no longer paints its own ground: it clears TRANSPARENT and the
	// shader canvas behind it is what you see. What a scene used to hand over as
	// a clear colour is now published instead — the flat shader paints it as a
	// block, and the field shaders take it as their first colour stop.
	//
	// The tone still comes from that colour, because everything drawn over the
	// canvas needs to know whether it is on the blue or on the white.
	function ground(color, shader = 'flat') {
		renderer.setClearColor(color, 0);
		sceneTone.set(luma(color) > 0.55 ? 'light' : 'dark');
		const b = get(backdrop);
		if (b.shader !== shader || b.color !== color) backdrop.set({ shader, color });
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
