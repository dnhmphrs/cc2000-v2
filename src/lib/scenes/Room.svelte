<script>
	import { fade } from 'svelte/transition';
	import { track, conceived, edge, monitorRect } from '$lib/store/store';
	import { SCENES } from '$lib/config';
	import { formatDay, accuracyFor } from '$lib/functions/utils';
	import { again } from './director';

	// ── Scene 5: the room ────────────────────────────────────────────────────
	// The answer, drawn INSIDE the room's monitor — the computation projects
	// that decade's screen glass to CSS pixels and publishes it as monitorRect,
	// and this fills it. Everything inside scales with the glass, so the same
	// markup reads whether the monitor is a portrait CRT or a widescreen.
	//
	// Two fallbacks, both centred cards: an out-of-range verdict, which never
	// reaches a room at all, and a run whose room art failed to measure.
	//
	// "calculate again" hands back to the director, which floods the frame with
	// static and lets the calculator fly out of this very monitor.

	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';
	$: accuracy = $track ? accuracyFor(`${$conceived}|${$track.spotify_uri}`) : '';

	// Everything in the glass is sized in these units, so type, player and
	// padding all scale together with the monitor.
	$: s = $monitorRect ? Math.max(0.55, Math.min(1.35, $monitorRect.width / 420)) : 1;

	const IN = { duration: SCENES.room.resultIn * 1000 };

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
</script>

{#if $edge}
	<div class="stage" in:fade={IN}>
		<div class="col card">
			<img src={EDGE[$edge].gif} alt="" />
			<p class="msg">{EDGE[$edge].line}</p>
			<button class="go" on:click={again}>calculate again</button>
		</div>
	</div>
{:else if src && $monitorRect}
	<!-- In the monitor. -->
	<div
		class="glass"
		in:fade={{ duration: IN.duration, delay: 250 }}
		style="left:{$monitorRect.left}px; top:{$monitorRect.top}px; width:{$monitorRect.width}px; height:{$monitorRect.height}px; --s:{s}"
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
	<button class="again" on:click={again} in:fade={{ duration: IN.duration, delay: 600 }}>
		calculate again
	</button>
{:else if src}
	<div class="stage" in:fade={IN}>
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
			<button class="go" on:click={again}>calculate again</button>
		</div>
	</div>
{/if}

<style>
	/* The monitor's glass. Sits exactly where the scene says the screen is.
	   pointer-events has to be opted back in all the way down, because `main`
	   turns them off so the 3D can be seen through the UI layer — and the
	   Spotify player is the one thing in the site that must take a click. */
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
		pointer-events: auto;
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
		line-clamp: 2;
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
		pointer-events: auto;
	}

	/* Sits under the monitor, on the desk, out of the room's way. */
	.again {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: max(4vh, 22px);
		z-index: 10;
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
</style>
