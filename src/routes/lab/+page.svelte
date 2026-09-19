<script>
	import { onMount } from 'svelte';

	// ── The lab ──────────────────────────────────────────────────────────────
	// Sketches for the rebuild. Not the site: a bare canvas, one WebGPURenderer
	// of its own, and whichever sketch the URL names.
	//
	//   ?sketch=heat     which sketch (src/lib/lab/<sketch>.js)
	//   ?at=0.42         pin the sketch at a progress, exactly as the site's
	//                    dev harness does — for looking at one frame together
	//   ?gl=1            force the WebGL 2 backend (the fallback lane)
	//   ?steps=800       how many simulation steps a full run is (sketches
	//                    that simulate replay from zero on a seek, so a pinned
	//                    frame is a pure function of `at` and the seed)
	//
	// window.__lab reports which backend actually ran, for the contact sheet.
	let canvas;
	let status = 'booting';

	onMount(async () => {
		const q = new URLSearchParams(location.search);
		const name = q.get('sketch') ?? 'heat';
		const atRaw = q.get('at');
		const at = atRaw === null || atRaw === '' ? null : Math.max(0, Math.min(1, Number(atRaw)));
		const forceWebGL = q.get('gl') === '1';
		const steps = Number(q.get('steps') ?? 0) || undefined;

		// Both imports are dynamic on purpose: three/webgpu must never be
		// evaluated during SSR, and each sketch is its own module.
		const THREE = await import('three/webgpu');
		const mod = await import(`$lib/lab/${name}.js`);
		const make = mod.default;

		// A sketch may ask for more of the renderer than the default — the
		// rooms need a stencil buffer — by exporting `options`.
		const renderer = new THREE.WebGPURenderer({
			canvas,
			antialias: true,
			alpha: false,
			forceWebGL,
			...(mod.options ?? {})
		});
		await renderer.init();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 1);

		const lane = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl';
		status = `${name} · ${lane}`;

		const sketch = await make({ THREE, renderer, at, steps });
		window.__lab = { sketch: name, lane, at, ...sketch.info };

		const onResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			sketch.resize?.(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', onResize);

		let last = performance.now();
		renderer.setAnimationLoop(() => {
			const now = performance.now();
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			// Pinned: draw the frame we seeked to, and do not advance.
			if (at === null) sketch.update(dt);
			sketch.render();
		});
	});
</script>

<canvas bind:this={canvas}></canvas>
<p class="tag">{status}</p>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		background: #000;
	}
	.tag {
		position: fixed;
		left: 12px;
		bottom: 10px;
		margin: 0;
		font:
			11px/1 ui-monospace,
			monospace;
		color: rgba(240, 242, 248, 0.45);
		letter-spacing: 0.06em;
		pointer-events: none;
	}
</style>
