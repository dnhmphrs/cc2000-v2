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
	<div class="frame">
		<div class="frame-head">
			<span class="id">CC://2000</span>
			<span>SYSTEM FAULT — 0x{status.toString(16).toUpperCase()}</span>
		</div>
		<div class="frame-body">
			<p class="code">{status}</p>
			{#if status === 404}
				<p class="msg">&gt; segment not found. you shouldn't be here. run.</p>
			{:else}
				<p class="msg">
					&gt; kernel panic. the algorithm found your moment of conception too hot for calculation.
				</p>
				{#if message}<p class="detail">&gt; {message}</p>{/if}
			{/if}
			<button on:click={goHome}>return</button>
		</div>
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
	}
	.frame {
		width: 100%;
		max-width: 380px;
	}
	.frame-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.2rem;
	}
	.code {
		font-size: 52px;
		font-weight: 300;
		color: var(--fg);
		letter-spacing: 0.1em;
		margin: 0;
	}
	.msg {
		font-size: 11px;
		line-height: 1.7;
		color: var(--fg-dim);
		margin: 0;
		align-self: flex-start;
		text-align: left;
	}
	.detail {
		font-size: 9px;
		color: var(--fg-faint);
		margin: 0;
		align-self: flex-start;
	}
</style>
