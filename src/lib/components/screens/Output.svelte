<script>
	import {
		track,
		phase,
		sceneState,
		conceived,
		edge,
		monitorRect,
		resetRun
	} from '$lib/store/store';
	import { formatDay, accuracyFor } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';

	// Beat 4. The results live INSIDE the monitor in the room — the scene projects
	// the glass of that decade's screen art to CSS pixels and publishes it, and
	// this drops into that rect. Falls back to a centred card if the rect is
	// unavailable (no screen art loaded, or an out-of-range verdict, which never
	// reaches a room at all).
	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';
	$: accuracy = $track ? accuracyFor(`${$conceived}|${$track.spotify_uri}`) : '';

	// Type scales with the monitor so it reads at any zoom, within reason.
	$: scale = $monitorRect ? Math.max(0.62, Math.min(1.25, $monitorRect.width / 420)) : 1;

	const EDGE = {
		past: {
			gif: '/gifs/the-past.gif',
			line: 'you were born in the time of dinosaurs, there was no music.'
		},
		future: {
			gif: '/gifs/the-future.gif',
			line:
				'you were born in the After Time. those lucky enough to be born were conceived to ' +
				'"Baby" by Justin Bieber, as it is the only remaining music allowed by The Council.'
		}
	};

	function restart() {
		// Clears what the run produced; the birthday and the spice stay dialled
		// in, so a second go is one click.
		resetRun();
		// The machine's screen appears on the room's computer and the camera
		// flies into it. The scene keeps the monitor rect until it gets home —
		// the machine needs it to know where to grow from. With no room to fly
		// out of (an out-of-range verdict) it is a straight cut instead.
		phase.set('intro');
		sceneState.set($monitorRect ? 5 : 0);
	}
</script>

{#if $edge}
	<div class="stage" in:fade={{ duration: 300 }}>
		<div class="col card">
			<img src={EDGE[$edge].gif} alt="" />
			<p class="msg">{EDGE[$edge].line}</p>
			<button class="go" on:click={restart}>calculate again</button>
		</div>
	</div>
{:else if src}
	{#if $monitorRect}
		<!-- In the monitor. -->
		<div
			class="glass"
			in:fade={{ duration: 450, delay: 250 }}
			style="left:{$monitorRect.left}px; top:{$monitorRect.top}px; width:{$monitorRect.width}px; height:{$monitorRect.height}px; --s:{scale}"
		>
			<div class="inner">
				<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
				<h2>{$track?.title ?? ''}</h2>
				<p class="artist">{$track?.artist ?? ''}</p>
				<iframe
					{src}
					frameBorder="0"
					allowfullscreen
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Conception song"
				/>
				<p class="acc">{accuracy}% accuracy</p>
			</div>
		</div>
		<button class="again" on:click={restart} in:fade={{ duration: 450, delay: 600 }}>
			calculate again
		</button>
	{:else}
		<div class="stage" in:fade={{ duration: 400 }}>
			<div class="col card">
				<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
				<h2>{$track?.title ?? ''}</h2>
				<p class="artist">{$track?.artist ?? ''}</p>
				<iframe
					{src}
					frameBorder="0"
					allowfullscreen
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Conception song"
				/>
				<p class="acc">{accuracy}% accuracy</p>
				<button class="go" on:click={restart}>calculate again</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* The monitor's glass. Sits exactly where the scene says the screen is. */
	.glass {
		position: fixed;
		z-index: 10;
		background: #0b0b0d;
		overflow: hidden;
		display: flex;
		align-items: center;
		pointer-events: auto;
	}

	.inner {
		width: 100%;
		padding: calc(10px * var(--s)) calc(12px * var(--s));
		font-size: calc(1em * var(--s));
	}

	.when {
		font-size: calc(10px * var(--s));
		color: var(--ink-dim);
		margin: 0 0 calc(4px * var(--s));
	}

	h2 {
		font-size: calc(19px * var(--s));
		font-weight: 700;
		line-height: 1.05;
		color: var(--yellow);
		margin: 0 0 calc(3px * var(--s));
		/* Long titles must not push the player out of the glass. */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.artist {
		font-size: calc(12px * var(--s));
		color: var(--ink);
		margin: 0 0 calc(8px * var(--s));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.acc {
		font-size: calc(10px * var(--s));
		color: var(--yellow);
		margin: calc(7px * var(--s)) 0 0;
	}

	iframe {
		width: 100%;
		height: calc(80px * var(--s));
		border: none;
		display: block;
	}

	/* Sits under the monitor, on the desk, out of the room's way. */
	.again {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: max(4vh, 22px);
		z-index: 10;
		/* main is pointer-events:none and this sits outside .stage, so it has to
		   opt back in or the restart is dead. */
		pointer-events: auto;
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--bg);
	}

	/* Fallback / out-of-range card. */
	.card .when {
		font-size: 13px;
	}
	.card h2 {
		font-size: clamp(24px, 3.2vw, 34px);
	}
	.card .artist {
		font-size: 17px;
		margin-bottom: 18px;
	}
	.card iframe {
		height: 80px;
		margin-bottom: 4px;
	}
	.card .acc {
		font-size: 13px;
		margin-bottom: 20px;
	}

	.msg {
		font-size: 15px;
		line-height: 1.5;
		color: var(--ink);
		margin: 0 0 22px;
	}

	img {
		display: block;
		width: 100%;
		height: 150px;
		object-fit: cover;
		margin-bottom: 18px;
	}
</style>
