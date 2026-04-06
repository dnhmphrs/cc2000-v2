<script>
	import { phase, sceneState } from '$lib/store/store';

	$: if ($sceneState >= 4) {
		phase.set('output');
	}
</script>

<div class="screen">
	<p class="status">calculating conception coordinates<span class="dots">...</span></p>
</div>

<style>
	.screen {
		background: var(--bg);
		border: solid 1px var(--fg-faint);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 420px;	
		padding: 2rem;
	}

	.status {
		font-size: 11px;
		color: var(--fg-dim);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-align: center;
	}

	.dots { animation: blink 1.5s infinite step-end; }

	@keyframes blink {
		0%, 33% { opacity: 1; }
		34%, 66% { opacity: 0.3; }
		67%, 100% { opacity: 1; }
	}
</style>
