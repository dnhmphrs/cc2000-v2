<script>
	import { onMount } from 'svelte';

	// ── next: the run the lab found ──────────────────────────────────────────
	// The board flow the lead picked — strand's journey drawn in the sketchy
	// hand, flow-strand-sketch — out of the lab and in a plain environment of
	// its own: one canvas, one WebGPURenderer (WebGPU where the browser has it,
	// WebGL 2 where it does not; ?gl=1 forces that), the run answered by hand,
	// and nothing of the lab round it — no experiments' bar, no reels. The lab
	// and everything it tried is the archive (/log, the corner's link).
	//
	//   ?v=<name>   a variant of it, flow-strand-sketch-<name>
	//   ?at=0.42    pin a frame, as the lab does (for contact sheets)
	//   ?demo=1     the scripted hand rather than yours
	//
	// The sketch is the lab's module as it stands — make({ THREE, renderer, at })
	// → { info, update, render, resize } — so the two never drift apart; this
	// is only the frame round it. window.__lab is set as the lab sets it (the
	// sketches report into it and the shots tool waits on it).
	const SKETCHES = import.meta.glob('/src/lib/lab/flow-strand-sketch*.js');
	// The main site mounts this with `only` set: the run and nothing else —
	// no ?v= (the run is the one scene it has), the glob never touched for
	// another file.
	export let only = false;
	// ?v=l is the run itself (cut L is flow-strand-sketch.js).
	const ALIAS = { l: '' };

	let canvas;
	let failed = '';
	// The end: the run holds on its last frame; the page offers AGAIN (a key
	// on the monitor's glass) and, when there is a song, Spotify's embed of
	// the track — there from the final scene on, a compact bar top left with
	// the artwork (a press on it is needed to play anything anyway).
	let ended = false;
	let song = null;
	let run = null;
	// The monitor's glass on the board, [x0, y0, x1, y1] in CSS px, when the
	// sketch gives it (`screen()`): the output — the buttons, the embed — sits
	// ON THE SCREEN, following it as the room sways after the pointer.
	let screen = null;
	const BAR = 30; // the buttons' strip at the glass's bottom
	$: gw = screen ? Math.max(0, screen[2] - screen[0]) : 0;
	$: endStyle = screen
		? `left:${screen[0]}px;top:${screen[3] - BAR}px;width:${gw}px;height:${BAR}px;bottom:auto;transform:none;`
		: '';
	// (the embed is a horizontal bar in the top left corner, under the
	// version label — the lead; the keys and the song stay on the screen)
	$: embed = song?.uri
		? `https://open.spotify.com/embed/track/${song.uri.replace('spotify:track:', '')}?utm_source=generator&theme=0`
		: '';
	function again() {
		run?.again?.();
	}
	// The layout's main is its own stacking context (z 10) under the board's
	// canvases (11): the panel is moved out to the body to show over them.
	function portal(node) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	onMount(() => {
		let renderer = null;
		let sketch = null;
		let onResize = null;
		(async () => {
			const q = new URLSearchParams(location.search);
			const atRaw = q.get('at');
			const at = atRaw === null || atRaw === '' ? null : Math.max(0, Math.min(1, Number(atRaw)));
			const v0 = only ? '' : (q.get('v') ?? '').replace(/[^a-z0-9-]/g, '');
			const v = v0 in ALIAS ? ALIAS[v0] : v0;
			const name = v ? `flow-strand-sketch-${v}` : 'flow-strand-sketch';
			// The glob is fixed when the dev server first serves this page; a
			// variant added since is fetched by its path, as the lab does.
			const path = `/src/lib/lab/${name}.js`;
			const load =
				SKETCHES[path] ?? (import.meta.env.DEV ? () => import(/* @vite-ignore */ path) : null);
			if (!load) {
				failed = `no run called ${name}`;
				return;
			}
			const THREE = await import('three/webgpu');
			const { default: make, options } = await load();
			renderer = new THREE.WebGPURenderer({
				canvas,
				antialias: true,
				alpha: false,
				forceWebGL: q.get('gl') === '1',
				...(options ?? {})
			});
			await renderer.init();
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000, 1);
			const lane = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl';
			sketch = await make({ THREE, renderer, at });
			run = sketch;
			// (api: the sketch itself, for the tools — seek, ended, song, again)
			window.__lab = window.__next = {
				run: 'next',
				sketch: name,
				lane,
				at,
				api: sketch,
				...sketch.info
			};
			onResize = () => {
				renderer.setSize(window.innerWidth, window.innerHeight);
				sketch.resize?.(window.innerWidth, window.innerHeight);
			};
			window.addEventListener('resize', onResize);
			let last = performance.now();
			renderer.setAnimationLoop(() => {
				const now = performance.now();
				const dt = Math.min((now - last) / 1000, 0.05);
				last = now;
				if (at === null) sketch.update(dt);
				sketch.render();
				const e = at === null && !!sketch.ended?.();
				if (e !== ended) {
					ended = e;
					song = e ? (sketch.song?.() ?? null) : null;
				}
				if (e) {
					const r = sketch.screen?.() ?? null;
					if (r && r[2] - r[0] > 60 && r[3] - r[1] > 40) {
						if (!screen || r.some((v, i) => Math.abs(v - screen[i]) > 0.25)) screen = r;
					} else if (screen) screen = null;
				} else if (screen) screen = null;
			});
		})().catch((e) => {
			failed = String(e?.message ?? e);
			throw e;
		});
		return () => {
			if (onResize) window.removeEventListener('resize', onResize);
			renderer?.setAnimationLoop(null);
			sketch?.dispose?.();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>
{#if failed}<p class="failed">{failed}</p>{/if}
{#if ended}
	<div class="end" class:on={!!screen} style={endStyle} use:portal>
		<button type="button" on:click={again}>again</button>
	</div>
	{#if embed}
		<div class="player" use:portal>
			<iframe
				title="{song.title} — {song.artist}"
				src={embed}
				width="352"
				height="152"
				frameborder="0"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
			></iframe>
		</div>
	{/if}
{/if}

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		background: #151515; /* the board's ground (log/board.js PAL.ground) */
	}
	.end {
		position: fixed;
		z-index: 30; /* over the board's canvases (11), under the corner's switch (35) */
		pointer-events: auto; /* the layout's main has none, for the board */
		left: 50%;
		bottom: 22px;
		transform: translateX(-50%);
		display: flex;
		gap: 10px;
	}
	.end button {
		font:
			13px/1 ui-monospace,
			monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #151515;
		background: rgba(255, 230, 120, 0.92);
		border: 0;
		border-radius: 2px;
		padding: 9px 14px;
		cursor: pointer;
	}
	.end button:hover {
		background: #ffe678;
	}
	/* on the screen: a strip of small keys along the glass's bottom */
	.end.on {
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.end.on button {
		font-size: 10px;
		padding: 5px 9px;
		border-radius: 1px;
	}
	.player {
		/* a horizontal bar, top left, under the corner's label */
		position: fixed;
		z-index: 30;
		pointer-events: auto;
		left: 10px;
		top: 30px;
		width: 352px;
		max-width: calc(100vw - 20px);
		height: 152px; /* Spotify's compact embed: the art, the title, play */
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}
	.player iframe {
		display: block;
		width: 100%;
	}
	.player iframe {
		height: 152px;
	}
	.failed {
		position: fixed;
		left: 12px;
		bottom: 10px;
		margin: 0;
		font:
			11px/1 ui-monospace,
			monospace;
		color: rgba(240, 242, 248, 0.6);
	}
</style>
