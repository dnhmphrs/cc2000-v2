<script>
	import { phase } from '$lib/store/store';
</script>

<div class="screen">
	<p class="tagline">
		In the earth year 2000, human technology advanced,
		<br /><br />
		[ .. sperm graphic .. ]
		<br /><br />
		allowing all of mankind to calculate the song playing
		at their exact moment of conception.
	</p>
	<button on:click={() => phase.set('calculate')}>compute conception</button>
</div>

<style>
	.screen {
		background: var(--bg-t);
		border: solid 1px var(--fg-faint);
		backdrop-filter: blur(5px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		text-align: center;
		width: 100%;
		max-width: 420px;	
		padding: 2rem;
	}

	.tagline {
		font-size: 11px;
		line-height: 1.8;
		color: var(--fg-dim);
	}
</style>
