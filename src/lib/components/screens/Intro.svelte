<script>
	import { phase } from '$lib/store/store';
	import { fade, fly } from 'svelte/transition';

	function start() {
		phase.set('calculate');
	}
</script>

<div class="stage" out:fade={{ duration: 220 }}>
	<div class="poster">
		<h1 in:fly={{ y: 18, duration: 700, opacity: 0 }}>
			Conception<br />Calculator<br /><em>2000</em>
		</h1>
		<div class="foot" in:fade={{ duration: 700, delay: 350 }}>
			<p>the song that was playing<br />the moment you were made.</p>
			<button class="go" on:click={start}>find out</button>
		</div>
	</div>
</div>

<style>
	.poster {
		width: 100%;
		max-width: 1000px;
		pointer-events: auto;
	}

	h1 {
		font-size: clamp(42px, 11vw, 132px);
		font-weight: 700;
		line-height: 0.94;
		letter-spacing: -0.01em;
		margin: 0;
		color: var(--ink);
	}

	h1 em {
		font-style: normal;
		color: var(--hot);
	}

	.foot {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 28px;
		flex-wrap: wrap;
		margin-top: clamp(22px, 4vh, 44px);
	}

	.foot p {
		font-size: clamp(15px, 1.5vw, 19px);
		line-height: 1.35;
		color: var(--ink-dim);
		margin: 0;
	}

	.foot button {
		padding: 15px 32px;
		font-size: 15px;
	}

	@media (max-width: 620px) {
		.foot {
			flex-direction: column;
			align-items: stretch;
			gap: 20px;
		}
	}
</style>
