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
	<div class="error-box">
		{#if status === 404}
			<p class="code">404</p>
			<p class="msg">you shouldn't be here. run.</p>
		{:else}
			<p class="code">{status}</p>
			<p class="msg">
				our servers overheated. the algorithm found your moment of conception
				too hot for calculation.
			</p>
			{#if message}<p class="detail">{message}</p>{/if}
		{/if}
		<button on:click={goHome}>return</button>
	</div>
</div>

<style>
	.error-screen {
		position: fixed; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: var(--bg); z-index: 100; padding: 2rem;
	}
	.error-box {
		text-align: center; max-width: 360px;
		display: flex; flex-direction: column; align-items: center; gap: 1rem;
	}
	.code { font-size: 48px; font-weight: 300; color: var(--fg-faint); margin: 0; }
	.msg { font-size: 11px; line-height: 1.7; color: var(--fg-dim); margin: 0; }
	.detail { font-size: 9px; color: var(--fg-faint); margin: 0; }
</style>
