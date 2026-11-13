<script>
	import { onMount } from 'svelte';
	import { PAGE } from './copy.js';

	// ── The page round the run ───────────────────────────────────────────────
	// The run is ./sketch.js. It makes its own canvases — the board, and the
	// lens that draws the board on the GPU — and is a pure function of its
	// clock. This is only the frame round it: it boots the sketch, steps and
	// draws it a frame at a time, and puts THE OUTPUT on the monitor's glass
	// once the lens is at rest in the room.
	//
	//   ?at=0.42    pin a frame, a fraction of the run (for contact sheets)
	//   ?demo=1     the scripted hand answers, rather than yours
	//
	// window.__run is for the tools (scripts/): the sketch's api, its info, and
	// the clock the sketch writes into it each frame.
	let failed = '';
	// The end: the run holds on its last frame, and the page offers the output.
	let ended = false;
	let song = null;
	// A verdict (a birthday the archive cannot answer for) has no song, no room
	// and no monitor to put the output on: the page offers the way back alone.
	let verdict = false;
	let run = null;
	// The monitor's glass on the board, [x0, y0, x1, y1] in CSS px, when the
	// sketch gives it (`screen()`): the output sits ON THE SCREEN, following it
	// as the room sways after the pointer.
	let screen = null;
	const BAR = 30; // ?screen=title: the key's strip at the glass's bottom
	$: gw = screen ? Math.max(0, screen[2] - screen[0]) : 0;
	$: endStyle = screen
		? `left:${screen[0]}px;top:${screen[3] - BAR}px;width:${gw}px;height:${BAR}px;bottom:auto;transform:none;`
		: '';
	// THE OUTPUT IS ON THE COMPUTER SCREEN (the lead: a response string, then
	// the embed, then SHARE and the restart key; bigger, cleaner, not yellow;
	// the words are the copy table's, PAGE): the panel IS the glass, a column
	// centred in it. ?screen=title is what came before: the song lettered on
	// the glass by the sketch, AGAIN on the glass and the player a bar in the
	// corner.
	let playerOnScreen = true;
	$: gh = screen ? screen[3] - screen[1] : 0;
	$: fs = screen ? Math.max(10, Math.min(17, 0.05 * gw)) : 12;
	// MOVED BY TRANSFORM, its size and type in whole pixels: the glass sways
	// under the pointer every frame, and set by left/top the panel, Spotify's
	// iframe inside it, was laid out again every frame ("the site seems to get
	// jittery on the reveal" — the lead).
	$: outputStyle = screen
		? `transform:translate(${screen[0].toFixed(1)}px,${screen[1].toFixed(1)}px);width:${Math.round(gw)}px;height:${Math.round(gh)}px;font-size:${Math.round(fs)}px;`
		: '';
	// Spotify's 352 × 152 bar (the artwork showing), scaled to the glass.
	$: ek = screen ? Math.min(1, (0.96 * gw) / 352) : 1;
	$: embedStyle = `width:${Math.round(352 * ek)}px;height:${Math.round(152 * ek)}px;`;
	// The output's place while it waits for the glass: off the board, hidden.
	const PRELOAD =
		'transform:translate(-2000px,0);width:352px;height:260px;font-size:12px;visibility:hidden;';
	$: embed = song?.uri
		? `https://open.spotify.com/embed/track/${song.uri.replace('spotify:track:', '')}?utm_source=generator&theme=0`
		: '';
	function again() {
		run?.again?.();
	}
	// The output is moved out to the body, over the board's canvases (the
	// sketch appends those to the body too, at z 11).
	function portal(node) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	onMount(() => {
		let sketch = null;
		let onResize = null;
		let raf = 0;
		let gone = false;
		(async () => {
			const q = new URLSearchParams(location.search);
			playerOnScreen = q.get('screen') !== 'title';
			const atRaw = q.get('at');
			const at = atRaw === null || atRaw === '' ? null : Math.max(0, Math.min(1, Number(atRaw)));
			const [THREE, { default: make }] = await Promise.all([
				import('three/webgpu'),
				import('./sketch.js')
			]);
			sketch = await make({ THREE, at });
			if (gone) return;
			run = sketch;
			window.__run = { at, api: sketch, ...sketch.info };
			onResize = () => sketch.resize?.(window.innerWidth, window.innerHeight);
			window.addEventListener('resize', onResize);
			let last = performance.now();
			const frame = () => {
				raf = requestAnimationFrame(frame);
				const now = performance.now();
				const dt = Math.min((now - last) / 1000, 0.05);
				last = now;
				if (at === null) sketch.update(dt);
				sketch.render();
				const e = at === null && !!sketch.ended?.();
				if (e !== ended) ended = e;
				// The song, from the moment the sketch names it (the answer is
				// in): the embed is loaded from then, and goes with AGAIN.
				const sg = at === null ? (sketch.song?.() ?? null) : null;
				if ((sg?.uri ?? null) !== (song?.uri ?? null)) song = sg;
				const v = e && !!sg?.edge;
				if (v !== verdict) verdict = v;
				if (e) {
					const r = sketch.screen?.() ?? null;
					if (r && r[2] - r[0] > 60 && r[3] - r[1] > 40) {
						if (!screen || r.some((v, i) => Math.abs(v - screen[i]) > 0.25)) screen = r;
					} else if (screen) screen = null;
				} else if (screen) screen = null;
			};
			frame();
		})().catch((e) => {
			failed = String(e?.message ?? e);
			throw e;
		});
		return () => {
			gone = true;
			if (onResize) window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
		};
	});
</script>

{#if failed}<p class="failed">{failed}</p>{/if}
{#if playerOnScreen}
	{#if song}
		<!-- THE OUTPUT, ON THE MONITOR'S SCREEN: a line, the player, two keys. In
		     the page from the moment the song is known, off the board and hidden
		     until the sketch gives it the glass, so Spotify's embed is loaded by
		     the landing and the output is whole the moment the lens is at rest. -->
		<div class="output" class:preload={!screen} style={screen ? outputStyle : PRELOAD} use:portal>
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
						style="transform:scale({ek});"
					></iframe>
				</div>
			{/if}
			<div class="output-keys">
				<!-- (SHARE does nothing yet: it will be a share screen of its own) -->
				<button type="button">{PAGE.share}</button>
				<button type="button" on:click={again}>{PAGE.again}</button>
			</div>
		</div>
	{/if}
	{#if verdict}
		<!-- A VERDICT'S WAY BACK: the one key, low on the board, up once the
		     verdict's lines are written. -->
		<div class="verdict-keys" use:portal>
			<button type="button" on:click={again}>{PAGE.again}</button>
		</div>
	{/if}
{:else if ended}
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

<style>
	.output {
		position: fixed;
		left: 0;
		top: 0;
		will-change: transform, opacity; /* its own layer: moved without a layout */
		z-index: 30; /* over the board's canvases (11), under the corner's label (35) */
		transition: opacity 0.6s ease; /* comes up with the monitor's glass */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6em;
		padding: 0.4em;
	}
	.output.preload {
		opacity: 0;
		pointer-events: none;
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
	.output-keys button,
	.verdict-keys button {
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
		transition: background 0.15s;
	}
	.output-keys button:hover,
	.verdict-keys button:hover {
		background: #3a3542;
	}
	/* a verdict's key: no glass to sit on, so low on the board, over the gif */
	.verdict-keys {
		position: fixed;
		z-index: 30;
		left: 50%;
		bottom: 14vh;
		transform: translateX(-50%);
		font-size: 15px;
		/* (the verdict's last line is written 1.8 s after the run says it has ended) */
		animation: verdict-key 0.6s ease 1.8s both;
	}
	.verdict-keys button {
		box-shadow: 0 0 0 1px rgba(242, 239, 230, 0.3);
	}
	@keyframes verdict-key {
		from {
			opacity: 0;
			visibility: hidden;
		}
		to {
			opacity: 1;
			visibility: visible;
		}
	}
	/* ?screen=title: the key on the glass and the bar in the corner */
	.end {
		position: fixed;
		z-index: 30;
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
