<script>
	import { onMount, onDestroy } from 'svelte';
	import { phase, sceneState } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 3. The scene does the work; this is one warm line at a time, sized to
	// the ~5s the cinematic now takes. When the scene lands it sets sceneState 4.
	$: if ($sceneState >= 4) phase.set('output');

	const lines = ['counting back 268 days', 'digging through the charts', 'found it'];
	let i = 0;
	let timer;

	onMount(() => {
		timer = setInterval(() => {
			if (i < lines.length - 1) i += 1;
		}, 1800);
	});
	onDestroy(() => clearInterval(timer));
</script>

<div class="wrap">
	{#key i}
		<p in:fade={{ duration: 400 }}>{lines[i]}</p>
	{/key}
</div>

<style>
	.wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: max(8vh, 54px);
		z-index: 10;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	p {
		margin: 0;
		font-size: 16px;
		color: var(--ink-dim);
	}
</style>
