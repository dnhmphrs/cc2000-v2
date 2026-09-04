<script>
	import { track, phase, sceneState, bgStage, decade } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';

	function restart() {
		sceneState.set(0);
		bgStage.set('reveal');
		phase.set('intro');
	}
</script>

{#if src}
	<div class="shell" in:fade={{ duration: 500, delay: 200 }}>
		<div class="frame">
			<div class="frame-head">
				<span class="id">CC://2000</span>
				<span>MATCH FOUND{$decade ? ` — ${$decade.toUpperCase()}` : ''}</span>
			</div>
			<div class="frame-body">
				<p class="verdict">&gt; conception track resolved.</p>
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
				<button on:click={restart}>run again</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.shell {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		pointer-events: none;
	}

	.frame {
		width: 100%;
		max-width: 360px;
		pointer-events: auto;
	}

	.frame-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.2rem;
	}

	.verdict {
		align-self: flex-start;
		font-size: 10px;
		letter-spacing: 0.12em;
		color: var(--fg-dim);
		margin: 0;
	}

	.embed {
		border: 1px solid var(--fg-faint);
		padding: 4px;
		background: rgba(0, 0, 0, 0.3);
		width: 100%;
	}

	iframe {
		width: 100%;
		height: 152px;
		border: none;
		display: block;
	}
</style>
