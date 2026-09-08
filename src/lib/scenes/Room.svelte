<script>
	import { fade } from 'svelte/transition';
	import { track, conceived, decade, monitorRect } from '$lib/store/store';
	import { SCENES, RESULT_PANEL, panelFit } from '$lib/config';
	import { formatDay, accuracyFor } from '$lib/functions/utils';
	import { again } from './director';

	// ── Scene 5: the room ────────────────────────────────────────────────────
	// The answer, drawn INSIDE the room's monitor — the computation projects
	// that decade's screen glass to CSS pixels and publishes it as monitorRect,
	// and this fills it.
	//
	// FILLS it, which is the whole trick. The four rooms hold four different
	// monitors: a 1.72 widescreen in the 2010s and three squarish sets before
	// it, down to a 90s CRT that is square to within two parts in a thousand.
	// A panel sized off width alone is a widescreen band, so in the three older
	// rooms it used to sit as a letterbox stripe across an otherwise empty
	// screen. Instead the panel takes a reference box from the shape of the
	// glass and stretches down it, and the player eats whatever is left over —
	// so a square CRT gets a square screenful, artwork and all.
	//
	// The numbers live in config/layout.js: SCREEN_GLASS for where each glass
	// is, RESULT_PANEL for what to do once you are in it.
	//
	// One fallback, a centred card, for a run whose room art failed to measure.
	// Out-of-range dates never get here at all — the calculator reports those on
	// its own screen and stays put.
	//
	// "calculate again" hands back to the director. The camera then flies into
	// this monitor while the calculator grows out of it — see the Stage.

	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';
	$: accuracy = $track ? accuracyFor(`${$conceived}|${$track.spotify_uri}`) : '';

	// Everything in the glass is sized in these units, so type, player and
	// padding all scale together with the monitor.
	$: fit = $monitorRect ? panelFit($decade, $monitorRect.width, $monitorRect.height) : null;
	$: s = fit ? fit.scale : 1;
	$: shape = fit ? fit.shape : RESULT_PANEL.shapes[0];

	const IN = { duration: SCENES.room.resultIn * 1000 };
</script>

{#if src && $monitorRect}
	<!-- In the monitor. -->
	<div
		class="glass"
		in:fade={{ duration: IN.duration, delay: 250 }}
		style="left:{$monitorRect.left}px; top:{$monitorRect.top}px; width:{$monitorRect.width}px; height:{$monitorRect.height}px; --s:{s}; --title-lines:{shape.titleLines}; --artist-lines:{shape.artistLines}; --player-min:{RESULT_PANEL.playerMin}px; --player-max:{RESULT_PANEL.playerMax}px"
	>
		<div class="inner">
			<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
			<h2>{$track?.title ?? ''}</h2>
			<p class="artist">{$track?.artist ?? ''}</p>
			<div class="player">
				<iframe
					{src}
					frameBorder="0"
					allowfullscreen
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Conception song"
				/>
			</div>
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
			<div class="player">
				<iframe
					{src}
					frameBorder="0"
					allowfullscreen
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Conception song"
				/>
			</div>
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
		pointer-events: auto;
	}

	/* Fills the glass rather than sitting in a band across the middle of it.
	   Centred, so once the player has taken all it can use, what is left is
	   shared top and bottom instead of pooling under the panel. */
	.inner {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: calc(10px * var(--s)) calc(12px * var(--s));
		font-size: calc(1em * var(--s));
		pointer-events: auto;
	}

	/* Type never gives up height to the player — it is the player that flexes. */
	.when,
	h2,
	.artist,
	.acc {
		flex: 0 0 auto;
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
		/* Long titles must not push the player out of the glass. A narrow screen
		   is allowed more lines — that is what buys it bigger type. */
		display: -webkit-box;
		line-clamp: var(--title-lines);
		-webkit-line-clamp: var(--title-lines);
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.artist {
		font-size: calc(12px * var(--s));
		color: var(--ink);
		margin: 0 0 calc(8px * var(--s));
		display: -webkit-box;
		line-clamp: var(--artist-lines);
		-webkit-line-clamp: var(--artist-lines);
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.acc {
		font-size: calc(10px * var(--s));
		color: var(--yellow);
		margin: calc(7px * var(--s)) 0 0;
	}

	/* The slack in the glass, and the reason a square monitor now reads as one.
	   Capped at the player's own card height: past that the embed draws nothing
	   more and would only be stretched. The floor is capped against the glass as
	   well as the scale, because on a very small screen a fixed floor is what
	   pushes the accuracy line off the bottom — measured at 320x568, where the
	   90s glass is 98px tall and the line was clipped by a pixel. */
	.player {
		flex: 1 1 auto;
		display: flex;
		min-height: min(calc(var(--player-min) * var(--s)), 30%);
		max-height: var(--player-max);
	}

	iframe {
		width: 100%;
		height: 100%;
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

	/* Fallback card, when the room art could not be measured. */
	.card .when {
		font-size: 13px;
	}
	.card h2 {
		font-size: clamp(24px, 3.2vw, 34px);
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.card .artist {
		font-size: 17px;
		margin-bottom: 18px;
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}
	.card .player {
		display: block;
		height: 80px;
		max-height: none;
		margin-bottom: 4px;
	}
	.card .acc {
		font-size: 13px;
		margin-bottom: 20px;
	}
</style>
