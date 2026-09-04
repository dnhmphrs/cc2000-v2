<script>
	import { track, phase, sceneState, decade, edge } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 4. The room is on screen in full colour behind this; the card just
	// names the song and gets out of the way.
	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';

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
			<p class="ask">
				{#if $decade}<span class="era">the {$decade}.</span><br />{/if}this was on.
			</p>
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
	.era {
		color: var(--hot);
	}

	iframe {
		width: 100%;
		height: 152px;
		border: none;
		display: block;
		margin-bottom: 22px;
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
