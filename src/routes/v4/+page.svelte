<script>
	import { onMount } from 'svelte';
	import { BOARD, FLOWS } from '$lib/data/experiments';

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
	//
	// ── And the Evangelion feel, back to back ────────────────────────────────
	// ?chain=explore2 (or /eva) plays the six sketches of docs/explore-02.md
	// end to end, in the order they would sit in the run:
	//
	//   episode-card  8.9 s   the title as a cut, a negative, black, the spiel
	//   red-sun       8.5 s   the egg behind the set; the swimmer's flash at it
	//   silhouette      8 s   a black body with a hot rim, over the sun and in
	//   lcl-tunnel      7 s   the archive in one red; colour arrives with the room
	//   noir-ground    25 s   a flat, warm, grained off-black under the whole run
	//   strobe        3.6 s   the splosh as a negative, white, black and a cut
	//
	// The card is DOM over the canvas and hides itself once it has lifted, so
	// it goes first.
	//
	// ── And the blackboard, the log of everything ────────────────────────────
	// ?chain=log (linked from /log, the index) plays the six sketches of
	// docs/explore-03.md — the rebuild drawn as maths on a dark board, one
	// variant of each — in the order of the run: the orb the questions fly at,
	// the golden-spiral swimmer, the swim down the golden-angle tunnel, the
	// beat at its centre, the Möbius zoom out, and the fall into the rooms.
	// Each beat is its sketch's own length (its info.seconds), and
	// ?pick=rings,,cylinder names another variant for any beat, in order (a
	// blank keeps the chain's own). The board is a 2D canvas over the page.
	//
	// ?chain=clopen plays the second round's (docs/explore-04.md) in the
	// run's order, with the first round's orb and tunnel between: a
	// beginning, the orb, the tunnel, the way into spacetime closed up, the
	// closure of space round the sphere, and the room appearing. ?chain=play
	// plays its five films of clopen maths back to back — each opens and ends
	// on a lit point at the centre, so they chain into one loop.
	//
	// ?chain=flows (or /flows) plays the v4 FLOWS — whole runs on the board,
	// one answer each to the same brief (data/experiments.js FLOWS) — end to
	// end, to mix and match from.
	//
	// ?chain=all (or /cut) is THE CUT: everything there is, EVERY variant of
	// every beat in the run's order, from data/experiments.js, the short cut's
	// variant first in each beat — so a sketch or a variant that lands in the
	// registry is in the cut. It is eleven minutes, so ← and → step between
	// beats (← to the start of this one when more than a second in, as a
	// player does; a pinned reel is a frame and does not step). ?chain=one is
	// the short cut: one of each beat, the variant its `cut` names, in the
	// same order.
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
		],
		explore2: [
			{ key: 'episode-card', name: 'episode-card', seconds: 8.9 },
			{ key: 'red-sun', name: 'red-sun', seconds: 8.5 },
			{ key: 'silhouette', name: 'silhouette', seconds: 8 },
			{ key: 'lcl-tunnel', name: 'lcl-tunnel', seconds: 7 },
			{ key: 'noir-ground', name: 'noir-ground', seconds: 25 },
			{ key: 'strobe', name: 'strobe', seconds: 3.6 }
		],
		log: [
			{ key: 'log-orb', name: 'orb', v: 'net' },
			{ key: 'log-sperm', name: 'swimmer', v: 'fib' },
			{ key: 'log-tunnel', name: 'tunnel', v: 'plane' },
			{ key: 'log-beat', name: 'beat', v: 'invert' },
			{ key: 'log-mobius', name: 'möbius', v: 'sphere' },
			{ key: 'log-fall', name: 'fall', v: 'droste' }
		],
		clopen: [
			{ key: 'log-dawn', name: 'dawn', v: 'fullstop' },
			{ key: 'log-orb', name: 'orb', v: 'net' },
			{ key: 'log-tunnel', name: 'tunnel', v: 'plane' },
			{ key: 'log-spacetime', name: 'spacetime', v: 'penrose' },
			{ key: 'log-closure', name: 'closure', v: 'projective' },
			{ key: 'log-arrival', name: 'arrival', v: 'glass' }
		],
		flows: FLOWS.map((f) => ({ key: f.sketch, name: f.name.toLowerCase() })),
		all: BOARD.flatMap((b) => {
			const vs = b.variants.map(([v]) => v);
			const order = b.cut ? [b.cut, ...vs.filter((v) => v !== b.cut)] : vs;
			return order.map((v) => ({ key: b.sketch, name: b.name.toLowerCase(), v }));
		}),
		one: BOARD.filter((b) => b.cut).map((b) => ({
			key: b.sketch,
			name: b.name.toLowerCase(),
			v: b.cut
		})),
		play: [
			{ key: 'log-clopen', name: 'play', v: 'schottky' },
			{ key: 'log-clopen', name: 'play', v: 'doyle' },
			{ key: 'log-clopen', name: 'play', v: 'apollonian' },
			{ key: 'log-clopen', name: 'play', v: 'padic' },
			{ key: 'log-clopen', name: 'play', v: 'ford' }
		]
	};
	const HOLD = 1.5; // seconds on the last frame before the loop
	// Every sketch, by a glob the build fixes; in dev a sketch the glob does not
	// know (the server here does not see files added since it started) is
	// fetched by its path, as the lab does.
	const SKETCHES = import.meta.glob('/src/lib/lab/*.js');
	const load = (key) => {
		const path = `/src/lib/lab/${key}.js`;
		const f =
			SKETCHES[path] ?? (import.meta.env.DEV ? () => import(/* @vite-ignore */ path) : null);
		if (!f) throw new Error(`no sketch called ${key} in src/lib/lab`);
		return f();
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
		const TAG = {
			v4: 'v4 · rough cut',
			explore: 'explore 01 · reel',
			explore2: 'explore 02 · reel',
			log: 'explore 03 · the log reel',
			clopen: 'explore 04 · the clopen reel',
			play: 'explore 04 · play',
			flows: 'the v4 flows · ← → step',
			all: 'the cut · everything · ← → step',
			one: 'the short cut · one of each'
		}[chain];
		const picks = (q.get('pick') ?? '').split(',');

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

		// Every beat is built up front, pinned at its start. A log sketch takes
		// its variant from the chain (or ?pick=) rather than the page's ?v=.
		const { pickVariant, reelTag } = await import('$lib/lab/log/board.js');
		const beats = [];
		for (const [i, b] of BEATS.entries()) {
			const { default: make } = await load(b.key);
			const v = picks[i] || b.v;
			pickVariant(v);
			const sketch = await make({ THREE, renderer, at: 0 });
			pickVariant(null);
			const seconds = b.seconds ?? sketch.info.seconds;
			beats.push({
				...b,
				seconds,
				name: v ? `${b.name} · ${sketch.info.variant}` : b.name,
				sketch
			});
		}
		const total = beats.reduce((s, b) => s + b.seconds, 0);
		let start = 0;
		for (const [i, b] of beats.entries()) {
			b.i = i;
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
			status = `${TAG} · ${b.i + 1}/${beats.length} ${b.name} ${t.toFixed(1)} s · ${lane}`;
			// The board draws over this page's own tag, so it carries the count.
			reelTag(at === null ? `← ${b.i + 1}/${beats.length} →` : `${b.i + 1}/${beats.length}`);
			window.__v4 = {
				lane,
				chain,
				at,
				beat: b.name,
				i: b.i,
				n: beats.length,
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
		// ← and → step between beats (← more than a second into a beat goes to
		// its start, as a player does; off either end it wraps). A pinned reel is
		// a frame and does not step, and the bar's own controls keep their keys.
		const step = (d) => {
			const i = d < 0 && T - active.start > 1 ? active.i : active.i + d;
			T = beats[(i + beats.length) % beats.length].start;
			show(T);
		};
		window.addEventListener('keydown', (e) => {
			if (at !== null || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(e.target?.tagName)) return;
			if (e.key === 'ArrowRight') step(1);
			else if (e.key === 'ArrowLeft') step(-1);
			else return;
			e.preventDefault();
		});
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
