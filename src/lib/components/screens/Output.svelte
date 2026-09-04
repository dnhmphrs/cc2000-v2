<script>
	import { track, phase, sceneState, conceived, edge } from '$lib/store/store';
	import { formatDay } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';

	// Beat 4. The room is behind this in full colour; the card names the day and
	// the song, then hands over to the player.
	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';

	// Just the day. The decade label is deliberately not shown: dateToDecade
	// buckets everything from 1975 to 2004 as '90s' so the room art has one of
	// its four sets to use, which is fine for picking a room and wrong as a
	// caption next to a real date. The room says which era it is anyway.

	const EDGE = {
		past: {
			gif: '/gifs/the-past.gif',
			line: 'you were made before the charts began.',
			note: 'the record only goes back to 1958. you are older than the data.'
		},
		future: {
			gif: '/gifs/the-future.gif',
			line: 'you have not been made yet.',
			note: 'that day has not happened. nothing has been played on it.'
		}
	};

	function restart() {
		edge.set(null);
		sceneState.set(0);
		phase.set('intro');
	}
</script>

{#if $edge}
	<div class="stage" in:fade={{ duration: 300 }}>
		<div class="col card">
			<img src={EDGE[$edge].gif} alt="" />
			<p class="ask">{EDGE[$edge].line}</p>
			<p class="note">{EDGE[$edge].note}</p>
			<button class="go" on:click={restart}>go again</button>
		</div>
	</div>
{:else if src}
	<div class="stage" in:fade={{ duration: 500, delay: 300 }}>
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
			<button class="go" on:click={restart}>go again</button>
		</div>
	</div>
{/if}

<style>
	.when {
		font-size: 13px;
		color: var(--ink-dim);
		margin: 0 0 12px;
	}

	h2 {
		font-size: clamp(26px, 3.4vw, 38px);
		font-weight: 700;
		line-height: 1.05;
		color: var(--blue-lit);
		margin: 0 0 6px;
	}

	.artist {
		font-size: 17px;
		color: var(--ink);
		margin: 0 0 20px;
	}

	iframe {
		width: 100%;
		height: 80px;
		border: none;
		display: block;
		margin-bottom: 20px;
	}

	/* Full colour — these are the best thing in the repo. */
	img {
		display: block;
		width: 100%;
		height: 150px;
		object-fit: cover;
		margin-bottom: 20px;
	}

	.note {
		margin: 0 0 22px;
	}
</style>
