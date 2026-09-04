<script>
	import { phase } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 1. A title and a button — that is the whole screen. The old boot log
	// spent twelve seconds being solemn about a joke.
	function start() {
		phase.set('calculate');
	}
</script>

<div class="stage" out:fade={{ duration: 220 }}>
	<div class="col" in:fade={{ duration: 600 }}>
		<h1>Conception<br />Calculator 2000</h1>
		<p class="ask">the song that was playing the moment you were made.</p>
		<button class="go" on:click={start}>find out</button>
	</div>
</div>

<style>
	h1 {
		font-family: var(--face);
		font-size: clamp(34px, 6vw, 52px);
		font-weight: 700;
		line-height: 1.02;
		margin: 0 0 18px;
		color: var(--ink);
	}
</style>
