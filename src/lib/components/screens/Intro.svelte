<script>
	import Terminal from '$lib/components/Terminal.svelte';
	import { phase, sceneState } from '$lib/store/store';

	// The boot log, then a button. Nothing advances until it is pressed.
	const lines = [
		{ text: 'CC://2000', kind: 'sys' },
		{ text: '...', kind: 'dim' },
		{ text: 'in the earth year 2000, human technology advanced,', kind: 'sys' },
		{ text: 'allowing all of mankind to calculate the song playing', kind: 'sys' },
		{ text: 'at their exact moment of conception.', kind: 'sys' }
	];

	let ready = false;
	let leaving = false;

	function enter() {
		if (leaving) return;
		leaving = true;
		sceneState.set(1); // the sperm sets off
		setTimeout(() => phase.set('calculate'), 1400); // the panel follows it in
	}
</script>

<div class="intro" class:out={leaving}>
	<Terminal {lines} charDelay={24} linePause={380} on:done={() => (ready = true)} />
	<div class="go" class:in={ready}>
		<button on:click={enter}>begin</button>
	</div>
</div>

<style>
	.intro {
		position: fixed;
		top: 6vh;
		left: max(4vw, 28px);
		max-width: min(46vw, 520px);
		z-index: 20;
		pointer-events: none;
		transition: opacity 0.8s ease;
	}
	.intro.out {
		opacity: 0;
	}

	.go {
		margin-top: 26px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.6s ease;
	}
	.go.in {
		opacity: 1;
		pointer-events: auto;
	}

	@media (max-width: 760px), (orientation: portrait) {
		.intro {
			top: 4vh;
			left: 20px;
			right: 20px;
			max-width: none;
		}
	}
</style>
