<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { phase, sceneState, flare, monitorRect } from '$lib/store/store';
	import { clamp } from '$lib/functions/utils';
	import { createTunnel } from './world/tunnel';
	import FlyIn from './scenes/FlyIn.svelte';
	import Conception from './scenes/Conception.svelte';
	import Computation from './scenes/Computation.svelte';

	// ── The stage ────────────────────────────────────────────────────────────
	// One canvas, one renderer, one clock, and three scenes played in order:
	//
	//   1. FlyIn        the corridor, the sperm, the egg          [world/tunnel]
	//   2. Conception   holds on the egg                          [world/tunnel]
	//   3. Computation  the icosahedron, the search, the room     [own scene]
	//
	// Every scene answers the same five calls, so this file never needs to know
	// what any of them contains:
	//
	//   enter()      becomes the active scene — reset yourself
	//   update(dt)   a frame; return true when you are finished
	//   render(r)    draw yourself
	//   backdrop()   { color, alpha } for the renderer to clear to
	//   resize()     the window changed
	//
	// Scenes 1 and 2 share a world (world/tunnel.js) so the cut between them is
	// invisible: the camera is simply left where the fly-in parked it. Scene 3
	// is its own world, so the cut into it gets a white bloom.

	let canvasElement;
	let renderer;
	let clock;
	let animationFrameId;
	let world;
	let flyIn, conception, computation;
	let mounted = false;

	// -1 = idle: scene 1 is on screen but held at its start, with the machine
	// over the top of it. The run begins when the machine says so.
	let index = -1;
	// A plain lookup rather than a reactive `$:`, because advance() runs inside
	// requestAnimationFrame and needs the new scene on the same tick.
	const sceneAt = (i) => [flyIn, conception, computation][Math.max(i, 0)];

	// Canvas fade-in from mount.
	let canvasFadeStart = null;
	const CANVAS_FADE = 1.2;

	// The white bloom over the cut from the tunnel into the icosahedron.
	let flashEl;
	let flash = 0;
	const BLOOM_DECAY = 2.4;

	// True once the last scene has landed, so the run only ends once.
	let landed = false;

	function advance() {
		index += 1;
		if (index === 2) flash = 1; // the cut between worlds
		sceneAt(index)?.enter();
	}

	function resetScene() {
		index = -1;
		landed = false;
		flash = 0;
		if (flashEl) flashEl.style.opacity = '0';
		flare.set(0);
		monitorRect.set(null);
		flyIn?.reset();
		conception?.reset();
		computation?.reset();
	}

	function handleResize() {
		if (!renderer) return;
		renderer.setSize(window.innerWidth, window.innerHeight);
		// All three, not just the active one: the icosahedron has to be the right
		// shape before its turn comes round.
		flyIn?.resize();
		conception?.resize();
		computation?.resize();
		if (index === 2) computation?.remeasureMonitor();
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		const active = sceneAt(index);
		if (!clock || !renderer || !active) return;
		// Clamped so a one-off hitch (a GLTF parse, a texture upload) can't jump
		// the animation forward.
		const dt = Math.min(clock.getDelta(), 0.05);

		const since = canvasFadeStart != null ? performance.now() / 1000 - canvasFadeStart - 0.2 : 0;
		canvasElement.style.opacity = clamp(since / CANVAS_FADE, 0, 1).toFixed(4);

		if (active.update(dt)) {
			if (index < 2) advance();
			else if (!landed) {
				landed = true;
				sceneState.set(4); // the room has settled; the result screen takes over
			}
		}

		flash = Math.max(0, flash - dt * BLOOM_DECAY);
		if (flashEl) flashEl.style.opacity = flash.toFixed(4);

		const { color, alpha } = active.backdrop();
		renderer.setClearColor(color, alpha);
		active.render(renderer);
	}

	let unsubPhase, unsubSceneState;

	onMount(async () => {
		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputEncoding = THREE.sRGBEncoding;
		clock = new THREE.Clock();

		world = createTunnel();

		mounted = true;
		await tick(); // let the scene components exist

		await computation.init();
		flyIn.enter();
		handleResize();

		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;

		window.addEventListener('resize', handleResize);

		// 'intro' means the machine is on screen and the tunnel is idling behind
		// it — on a first load, and again after "calculate again".
		unsubPhase = phase.subscribe((p) => {
			if (p === 'intro' && index !== -1) resetScene();
		});
		// 1 = calculate pressed on the machine. That is the only cue the UI sends:
		// the three scenes hand over to each other from there.
		unsubSceneState = sceneState.subscribe((s) => {
			if (s === 1 && index === -1) {
				index = 0;
				flyIn.launch();
			}
		});

		animate();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		unsubPhase?.();
		unsubSceneState?.();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		computation?.dispose();
		world?.dispose();
		renderer?.dispose();
	});
</script>

{#if mounted}
	<FlyIn bind:this={flyIn} {world} />
	<Conception bind:this={conception} {world} />
	<Computation bind:this={computation} {renderer} />
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

	/* The cut into the icosahedron. Over the 3D, under the UI. */
	.flash {
		position: fixed;
		inset: 0;
		z-index: 2;
		background: #fff;
		opacity: 0;
		pointer-events: none;
	}
</style>
