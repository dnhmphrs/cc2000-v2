<script>
	import { track, phase, sceneState } from '$lib/store/store';

	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';

	function restart() {
		sceneState.set(0);
		phase.set('intro');
	}
</script>

{#if src}
	<div class="screen">
		<div class="embed">
			<iframe
				{src}
				frameBorder="0"
				allowfullscreen
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
				title="Conception song"
			/>
		</div>
		<button on:click={restart}>restart</button>
	</div>
{/if}

<style>
	.screen {
		background: var(--bg-t);
		border: solid 1px var(--fg-faint);
		backdrop-filter: blur(5px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
		max-width: 420px;	
		padding: 1rem;
	}

	.embed {
		border: 1px solid var(--fg-faint);
		padding: 4px;
		background: rgba(0, 0, 0, 0.3);
		width: 100%;
		max-width: 320px;
	}

	iframe {
		width: 100%;
		height: 152px;
		border: none;
		display: block;
	}
</style>
