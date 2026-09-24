<script>
	import { onMount } from 'svelte';

	// ── v4, the rough cut ────────────────────────────────────────────────────
	// The new shape of the whole run, as one continuous piece: the five lab
	// sketches in the brief's order, each at its own length —
	//
	//   approach     9 s   space; the swimmer, and the archive adrift in it
	//   descent     14 s   rooms through rooms, decade after decade
	//   conception  12 s   the beam strikes the sphere; the zeros ring out
	//   lattice      9 s   every number a point; the lens closes on one cell
	//   bloom       11 s   the cell is a cube, and the cube opens on a room
	//
	// Hard cuts between beats. The joins — the swimmer speeding up into the
	// beam, the box that is the cell — are not made yet; this exists to look
	// at the shape and the weight.
	//
	//   ?at=0.42   pin the whole run at a fraction (every beat is a pure
	//              function of progress, so this is exact)
	//   ?gl=1      the WebGL 2 backend
	//
	// ── And the explorations, in the run's order ─────────────────────────────
	// ?chain=explore plays the six sketches of docs/explore-01.md end to end,
	// each at its own length, in the order they would sit in the run:
	//
	//   about-face     10 s   the swimmer comes about to take the questions
	//   sky-of-weeks    7 s   the sky is the archive; it swings to your week
	//   switch-on     1.8 s   the swimmer's nose lights the set, into the seam
	//   the-many        7 s   the swimmer joins the kaleidoscope
	//   pilot           9 s   the swimmer leads the fall's roll
	//   runout        2.3 s   the way home is through the record
	//
	// Hard cuts between them too: each is its own sketch on its own scene,
	// and several of them replay the same stretch of the run from their own
	// angle, so this is a reel, not a cut.
	const CHAINS = {
		v4: [
			{ key: 'approach', name: 'approach', seconds: 9 },
			{ key: 'rooms', name: 'descent', seconds: 14 },
			{ key: 'impact', name: 'conception', seconds: 12 },
			{ key: 'lattice', name: 'lattice', seconds: 9 },
			{ key: 'cube', name: 'bloom', seconds: 11 }
		],
		explore: [
			{ key: 'about-face', name: 'about-face', seconds: 10 },
			{ key: 'sky-of-weeks', name: 'sky-of-weeks', seconds: 7 },
			{ key: 'switch-on', name: 'switch-on', seconds: 1.82 },
			{ key: 'the-many', name: 'the-many', seconds: 7 },
			{ key: 'pilot', name: 'pilot', seconds: 9 },
			{ key: 'runout', name: 'runout', seconds: 2.3 }
		]
	};
	const HOLD = 1.5; // seconds on the last frame before the loop
	const LOADERS = {
		approach: () => import('$lib/lab/approach.js'),
		rooms: () => import('$lib/lab/rooms.js'),
		impact: () => import('$lib/lab/impact.js'),
		lattice: () => import('$lib/lab/lattice.js'),
		cube: () => import('$lib/lab/cube.js'),
		'about-face': () => import('$lib/lab/about-face.js'),
		'sky-of-weeks': () => import('$lib/lab/sky-of-weeks.js'),
		'switch-on': () => import('$lib/lab/switch-on.js'),
		'the-many': () => import('$lib/lab/the-many.js'),
		pilot: () => import('$lib/lab/pilot.js'),
		runout: () => import('$lib/lab/runout.js')
	};

	let canvas;
	let status = 'booting';

	onMount(async () => {
		const q = new URLSearchParams(location.search);
		const atRaw = q.get('at');
		const at = atRaw === null || atRaw === '' ? null : Math.max(0, Math.min(1, Number(atRaw)));
		const forceWebGL = q.get('gl') === '1';
		const chain = CHAINS[q.get('chain')] ? q.get('chain') : 'v4';
		const BEATS = CHAINS[chain];
		const TAG = chain === 'v4' ? 'v4 · rough cut' : `explore 01 · reel`;

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
			status = `${TAG} · ${b.name} ${t.toFixed(1)} s · ${lane}`;
			window.__v4 = {
				lane,
				chain,
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
