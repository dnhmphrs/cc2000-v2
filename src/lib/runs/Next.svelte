<script>
	import { onMount } from 'svelte';
	import { PAGE } from '$lib/lab/log/sketch-copy.js';

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
	// THE PLAYER ON THE GLASS (0.23.2, the default — the PM wanted the embed,
	// not the title; the lead: the embed filling the screen of the scene, AGAIN
	// centred low on the page): Spotify's 352 × 352 embed, the artwork big,
	// scaled to fill the glass and set in its middle; the sketch letters
	// nothing there. ?screen=title: the title lettered on the glass, the bar
	// in the corner and AGAIN on the glass, as 0.21 – 0.23.1 had it.
	let playerOnScreen = true;
	// (0.23.3 — the lead: on the computer screen, a response string, then the
	// embed, then SHARE and the restart key; bigger, cleaner, not yellow; the
	// words are the copy table's, PAGE) — the panel IS the glass, a column
	// centred in it: the line, Spotify's 352 × 152 bar scaled to 0.86 of the
	// glass's width (the artwork showing), the two keys; the type by the
	// glass's width
	$: gh = screen ? screen[3] - screen[1] : 0;
	$: fs = screen ? Math.max(10, Math.min(17, 0.05 * gw)) : 12;
	$: outputStyle = screen
		? `left:${screen[0]}px;top:${screen[1]}px;width:${gw}px;height:${gh}px;font-size:${fs}px;`
		: '';
	$: ek = screen ? Math.min(1, (0.86 * gw) / 352) : 1;
	$: embedStyle = `width:${Math.round(352 * ek)}px;height:${Math.round(152 * ek)}px;`;
	let shared = false;
	async function share() {
		const url = location.origin + location.pathname;
		const text = song ? `${PAGE.response} ${song.title} — ${song.artist}` : PAGE.response;
		try {
			if (navigator.share)
				await navigator.share({ title: 'Conception Calculator 2000', text, url });
			else {
				await navigator.clipboard.writeText(url);
				shared = true;
				setTimeout(() => (shared = false), 1600);
			}
		} catch {
			/* declined */
		}
	}
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
			playerOnScreen = q.get('screen') !== 'title';
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
				if (e !== ended) ended = e;
				// the song, the moment the sketch names it (the title on the
				// screen): the embed comes up then, and goes with AGAIN
				const sg = at === null ? (sketch.song?.() ?? null) : null;
				if ((sg?.uri ?? null) !== (song?.uri ?? null)) song = sg;
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
	{#if playerOnScreen}
		{#if screen}
			<!-- THE OUTPUT, ON THE MONITOR'S SCREEN: a line, the player, two keys -->
			<div class="output" style={outputStyle} use:portal>
				<p class="output-say">{PAGE.response}</p>
				{#if embed}
					<div class="output-embed" style={embedStyle}>
						<iframe
							title="{song.title} — {song.artist}"
							src={embed}
							width="352"
							height="152"
							frameborder="0"
							allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
							loading="lazy"
							style="transform:scale({ek});"
						></iframe>
					</div>
				{/if}
				<div class="output-keys">
					<button type="button" on:click={share}>{shared ? PAGE.copied : PAGE.share}</button>
					<button type="button" on:click={again}>{PAGE.again}</button>
				</div>
			</div>
		{/if}
	{:else}
		<div class="end" class:on={!!screen} style={endStyle} use:portal>
			<button type="button" on:click={again}>again</button>
		</div>
		{#if embed}
			<div class="player" use:portal>
				<iframe
					title="{song.title} — {song.artist}"
					src={embed}
					width="352"
					height="80"
					frameborder="0"
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
				></iframe>
			</div>
		{/if}
	{/if}
{/if}

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		background: #1b1917; /* the board's ground through the lens (app.html) */
	}
	.output {
		position: fixed;
		z-index: 30; /* over the board's canvases (11), under the corner's switch (35) */
		pointer-events: auto; /* the layout's main has none, for the board */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6em;
		padding: 0.4em;
		box-sizing: border-box;
	}
	.output-say {
		margin: 0;
		font:
			1em/1.3 ui-monospace,
			monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1c1a22;
		text-align: center;
	}
	.output-embed {
		position: relative;
		overflow: hidden;
		border-radius: 6px;
	}
	.output-embed iframe {
		display: block;
		width: 352px;
		height: 152px;
		transform-origin: 0 0;
	}
	.output-keys {
		display: flex;
		gap: 0.5em;
	}
	.output-keys button {
		font:
			0.9em/1 ui-monospace,
			monospace;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #f2efe6;
		background: #1c1a22;
		border: 0;
		border-radius: 2px;
		padding: 0.75em 1.1em;
		cursor: pointer;
	}
	.output-keys button:hover {
		background: #3a3542;
	}
	/* ?screen=title: the key on the glass and the bar in the corner, as before */
	.end {
		position: fixed;
		z-index: 30;
		pointer-events: auto;
		left: 50%;
		bottom: 7vh;
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
		position: fixed;
		z-index: 30;
		pointer-events: auto;
		left: 10px;
		top: 30px;
		width: 352px;
		max-width: calc(100vw - 20px);
		height: 80px;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}
	.player iframe {
		display: block;
		width: 100%;
		height: 80px;
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
