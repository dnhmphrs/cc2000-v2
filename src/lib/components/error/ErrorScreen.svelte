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
		<img src="/gifs/404.gif" alt="" />
		{#if status === 404}
			<p class="msg">you shouldn't be here. run.</p>
		{:else}
			<p class="msg">
				our servers overheated. the algorithm found your moment of conception too hot for
				calculation. your parents FUCK.
			</p>
			{#if message}<p class="detail">{message}</p>{/if}
		{/if}
		<button class="go" on:click={goHome}>calculate again</button>
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
	img {
		display: block;
		width: 100%;
		height: 170px;
		object-fit: cover;
		margin-bottom: 18px;
	}
	.msg {
		font-size: 16px;
		line-height: 1.5;
		color: var(--ink);
		margin: 0 0 10px;
	}
	.detail {
		font-size: 12px;
		color: var(--ink-dim);
		margin: 0 0 18px;
	}
	button {
		margin-top: 12px;
	}
</style>
