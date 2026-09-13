<script>
	import { onMount } from 'svelte';

	// ── v4, the rough cut ────────────────────────────────────────────────────
	// The new shape of the run after the strike, as one continuous piece: the
	// four lab sketches in the plan's order and at the plan's lengths —
	//
	//   conception  9.0 s   the ovum burns and settles onto the invariant
	//   expansion   8.0 s   the icosahedron expands out to E8 and the wheel
	//   descent     7.0 s   rooms through rooms
	//   bloom      11.5 s   the flower opens on the ending
	//
	// Hard cuts between beats. The one-shot seams — fly-in into conception,
	// the push into the first room, the bud in the deepest glass — are the
	// scene PRs' work; this exists to look at the shape and the weight.
	//
	//   ?at=0.42   pin the whole run at a fraction (every beat is a pure
	//              function of progress, so this is exact)
	//   ?gl=1      the WebGL 2 backend; the conception needs WebGPU and is
	//              skipped there
	const BEATS = [
		{ key: 'heat', name: 'conception', seconds: 9.0 },
		{ key: 'e8', name: 'expansion', seconds: 8.0 },
		{ key: 'rooms', name: 'descent', seconds: 7.0 },
		{ key: 'petals', name: 'bloom', seconds: 11.5 }
	];
	const HOLD = 1.5; // seconds on the last frame before the loop
	const LOADERS = {
		heat: () => import('$lib/lab/heat.js'),
		e8: () => import('$lib/lab/e8.js'),
		rooms: () => import('$lib/lab/rooms.js'),
		petals: () => import('$lib/lab/petals.js')
	};

	let canvas;
	let status = 'booting';

	onMount(async () => {
		const q = new URLSearchParams(location.search);
		const atRaw = q.get('at');
		const at = atRaw === null || atRaw === '' ? null : Math.max(0, Math.min(1, Number(atRaw)));
		const forceWebGL = q.get('gl') === '1';

		const THREE = await import('three/webgpu');
		const renderer = new THREE.WebGPURenderer({
			canvas,
			antialias: true,
			alpha: false,
			forceWebGL,
			stencil: true // the descent's stencil chain
		});
		await renderer.init();
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 1);
		const lane = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl';

		// Every beat is built up front, pinned at its start.
		const beats = [];
		for (const b of BEATS) {
			if (b.key === 'heat' && lane !== 'webgpu') continue;
			const { default: make } = await LOADERS[b.key]();
			const sketch = await make({ THREE, renderer, at: 0 });
			beats.push({ ...b, sketch });
		}
		const total = beats.reduce((s, b) => s + b.seconds, 0);
		let start = 0;
		for (const b of beats) {
			b.start = start;
			start += b.seconds;
		}

		let active = null;
		const show = (T) => {
			const t = Math.max(0, Math.min(total, T));
			let b = beats[beats.length - 1];
			for (const c of beats) if (t >= c.start && t < c.start + c.seconds) b = c;
			const u = Math.min(1, (t - b.start) / b.seconds);
			b.sketch.seek(u);
			active = b;
			status = `v4 · rough cut · ${b.name} ${t.toFixed(1)} s · ${lane}`;
			window.__v4 = {
				lane,
				at,
				beat: b.name,
				u: Number(u.toFixed(4)),
				t: Number(t.toFixed(3)),
				total
			};
		};

		const onResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			for (const b of beats) b.sketch.resize?.(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', onResize);

		let T = at !== null ? at * total : 0;
		show(T);
		let last = performance.now();
		renderer.setAnimationLoop(() => {
			const now = performance.now();
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			if (at === null) {
				T += dt;
				if (T > total + HOLD) T = 0;
				show(T);
			}
			active.sketch.render();
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
