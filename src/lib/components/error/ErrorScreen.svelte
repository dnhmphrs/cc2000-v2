<script>
	export let status = 500;
	export let message = '';

	import { phase } from '$lib/store/store';
	import { goto } from '$app/navigation';

	function goHome() {
		phase.set('intro');
		goto('/', { replaceState: true });
	}
</script>

<div class="error-screen">
	<div class="col">
		<p class="code">{status}</p>
		{#if status === 404}
			<p class="ask">nothing here. you have wandered off.</p>
		{:else}
			<p class="ask">something broke.</p>
			{#if message}<p class="note">{message}</p>{/if}
		{/if}
		<button class="go" on:click={goHome}>take me back</button>
	</div>
</div>

<style>
	.error-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		z-index: 100;
		padding: 2rem;
		pointer-events: auto;
	}
	.col {
		width: 100%;
		max-width: 380px;
	}
	.code {
		font-size: 54px;
		font-weight: 700;
		line-height: 1;
		color: var(--hot);
		margin: 0 0 14px;
	}
	.note {
		margin: 0 0 22px;
	}
</style>
