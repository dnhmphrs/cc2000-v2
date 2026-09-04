<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import * as THREE from 'three';
	import { get } from 'svelte/store';
	import { phase, sceneState, flare, monitorRect } from '$lib/store/store';
	import { clamp } from '$lib/functions/utils';
	import SpermStage from './stages/SpermStage.svelte';
	import IcosaStage from './stages/IcosaStage.svelte';

	// ── The 3D, in two halves ────────────────────────────────────────────────
	// This file owns the renderer, the canvas and the running order, and nothing
	// else. The two halves are separate components with their own scene and
	// camera, so either can be reworked without disturbing the other:
	//
	//   SpermStage — the sperm and the egg (perspective)
	//   IcosaStage — the icosahedron, the panes, the rooms, the search (ortho)
	//
	// The background shader is a sibling of this component, behind both.
	//
	// Running order:
	//   idle      → nothing
	//   fly       → sperm comes past the camera and settles at A     [Sperm]
	//   hold      → spins at A while the intro text is read          [Sperm]
	//   approach  → swims A → B, the egg comes out of the fog        [Sperm]
	//   wait1     → holds at B while the birthday is asked           [Sperm]
	//   approach2 → swims B → C, closer in                           [Sperm]
	//   wait2     → holds at C while the spice is asked              [Sperm]
	//   pierce    → drives into the egg, and the screen goes white   [Sperm]
	//   open      → the icosahedron resolves and comes apart         [Icosa]
	//   search    → turns through the decades                        [Icosa]
	//   zoom      → the resolved room fills the frame                [Icosa]
	//   settled
	//
	// The sperm half moves the flow along: when an approach finishes it is the
	// scene that sets the next phase, so the questions arrive on the animation
	// rather than the animation chasing the questions.
	let stage = 'idle';
	let stageT = 0;

	let canvasElement;
	let renderer;
	let clock;
	let animationFrameId;
	let spermStage, icosaStage;
	let mounted = false;

	// Canvas fade-in from mount.
	let canvasFadeStart = null;
	const CANVAS_FADE = 1.2;

	const mouse = { x: 0, y: 0 };

	// The white-out on contact.
	let flashEl;
	let flash = 0;

	function setStage(s) {
		stage = s;
		stageT = 0;
	}

	function handleResize() {
		if (!renderer) return;
		renderer.setSize(window.innerWidth, window.innerHeight);
		spermStage?.resize();
		icosaStage?.resize();
		if (stage === 'settled') icosaStage?.remeasureMonitor();
	}

	function handlePointer(e) {
		mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
	}

	// ── Cues from the UI ─────────────────────────────────────────────────────
	function begin() {
		if (stage !== 'idle') return;
		setStage('fly');
	}

	// Cues from the UI, all of them tolerant of arriving early: requiring an
	// exact stage meant a fast click during an animation dropped the cue on the
	// floor and hung the whole thing.
	const PAST_SPERM = ['open', 'search', 'zoom', 'settled'];

	function cue(target) {
		if (PAST_SPERM.includes(stage) || stage === target) return;
		setStage(target);
	}

	function resetScene() {
		setStage('idle');
		mouse.x = mouse.y = 0;
		flash = 0;
		if (flashEl) flashEl.style.opacity = '0';
		flare.set(0);
		monitorRect.set(null);
		spermStage?.reset();
		icosaStage?.reset();
		// "calculate again" comes back through 'intro', so fly in again.
		setTimeout(() => {
			if (stage === 'idle' && get(phase) === 'intro') begin();
		}, 250);
	}

	function animate() {
		animationFrameId = requestAnimationFrame(animate);
		if (!clock || !renderer) return;
		// Clamped so a one-off hitch (a GLTF parse, a texture upload) can't jump
		// the animation forward.
		const dt = Math.min(clock.getDelta(), 0.05);

		const since = canvasFadeStart != null ? performance.now() / 1000 - canvasFadeStart - 0.2 : 0;
		canvasElement.style.opacity = clamp(since / CANVAS_FADE, 0, 1).toFixed(4);

		stageT += dt;

		// Both halves see every frame; each returns true when the stage it owns
		// has finished, and the running order lives here.
		const spermDone = spermStage ? spermStage.update(dt, stage, stageT, mouse) : false;
		const icosaDone = icosaStage ? icosaStage.update(dt, stage, stageT) : false;

		if (stage === 'fly' && spermDone) setStage('hold');
		else if (stage === 'approach' && spermDone) {
			setStage('wait1');
			phase.set('dob'); // the first question arrives once it has closed in
		} else if (stage === 'approach2' && spermDone) {
			setStage('wait2');
			phase.set('spicy');
		} else if (stage === 'pierce' && spermDone) setStage('open');
		else if (stage === 'open' && icosaDone) setStage('search');
		else if (stage === 'search' && icosaDone) setStage('zoom');
		else if (stage === 'zoom' && icosaDone) {
			setStage('settled');
			sceneState.set(4);
		}

		// Contact blows the frame out to white, then it falls away fast.
		const impact = stage === 'pierce' ? spermStage?.getHit() ?? 0 : 0;
		flash = Math.max(flash * Math.exp(-dt * 3.6), Math.pow(impact, 2.2));
		if (flashEl) flashEl.style.opacity = flash.toFixed(4);

		// The machine half clears and draws first; the organic half is composited
		// on top with a fresh depth buffer, because a perspective overlay tested
		// against orthographic depths would simply vanish.
		renderer.autoClear = true;
		icosaStage?.render(renderer);
		if (spermStage?.isBusy()) {
			renderer.autoClear = false;
			renderer.clearDepth();
			spermStage.render(renderer);
		}
	}

	let unsubPhase, unsubSceneState;

	onMount(async () => {
		renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0xe0e0d0, 0);
		renderer.outputEncoding = THREE.sRGBEncoding;
		clock = new THREE.Clock();

		mounted = true;
		await tick(); // let the two stage components exist

		spermStage.init();
		await icosaStage.init();
		spermStage.resize();
		icosaStage.resize();

		canvasElement.style.opacity = '0';
		canvasFadeStart = performance.now() / 1000;

		window.addEventListener('pointermove', handlePointer);
		window.addEventListener('resize', handleResize);

		// 'intro' both opens a run and, after "calculate again", tears the last
		// one down. The form hands over on sceneState → 1.
		unsubPhase = phase.subscribe((p) => {
			if (p !== 'intro') return;
			if (stage !== 'idle') resetScene();
			else begin();
		});
		// 1 = begin (swim in, egg appears), 2 = birthday answered (swim closer),
		// 3 = calculate (pierce).
		unsubSceneState = sceneState.subscribe((s) => {
			if (s === 1) cue('approach');
			else if (s === 2) cue('approach2');
			else if (s === 3) cue('pierce');
		});

		animate();
		if (get(phase) === 'intro' && stage === 'idle') begin();
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		unsubPhase?.();
		unsubSceneState?.();
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('pointermove', handlePointer);
		spermStage?.dispose();
		icosaStage?.dispose();
		renderer?.dispose();
	});
</script>

{#if mounted}
	<SpermStage bind:this={spermStage} />
	<IcosaStage bind:this={icosaStage} {renderer} />
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

	/* Contact. Sits over the 3D but under the UI. */
	.flash {
		position: fixed;
		inset: 0;
		z-index: 2;
		background: #fffdf4;
		opacity: 0;
		pointer-events: none;
	}
</style>
