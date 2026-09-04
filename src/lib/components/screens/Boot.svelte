<script>
	import Terminal from '$lib/components/Terminal.svelte';
	import Console from '$lib/components/Console.svelte';
	import { phase } from '$lib/store/store';

	// Beat 1: the operator logs on. Terminal text flows, then a key to start.
	// Nothing else is on screen — no icosahedron, no flash background.
	let ready = false;

	const lines = [
		{ text: 'cc2000 --boot --tty0', kind: 'cmd' },
		{ text: 'conception calculator 2000 · kernel 2.0.0', kind: 'sys' },
		{ text: 'core memory 640k .......... verified', kind: 'ok' },
		{ text: 'mounting /dev/gamete ...... ready', kind: 'ok' },
		{ text: 'chrono-link 1958..2023 .... locked', kind: 'ok' },
		{ text: 'paradox buffer at 4% capacity', kind: 'warn' },
		{ text: '', kind: 'blank' },
		{ text: 'cat /etc/cc2000/manifest', kind: 'cmd' },
		{ text: 'in the earth year 2000, human technology advanced,', kind: 'sys' },
		{ text: 'allowing all of mankind to calculate the song playing', kind: 'sys' },
		{ text: 'at their exact moment of conception.', kind: 'sys' },
		{ text: '', kind: 'blank' },
		{ text: 'awaiting operator', kind: 'hi' }
	];

	function start() {
		// The scene's cue: the sperm comes on and the input panel opens.
		phase.set('calculate');
	}

	function onKey(e) {
		if (!ready) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			start();
		}
	}
</script>

<svelte:window on:keydown={onKey} />

<Console tty="tty0" status="online">
	<Terminal {lines} charDelay={13} linePause={210} on:done={() => (ready = true)} />

	{#if ready}
		<div class="prompt">
			<span class="ps1">root@cc2000:~#</span>
			<button on:click={start}>execute</button>
			<span class="hint">↵ / space</span>
		</div>
	{/if}
</Console>

<style>
	.prompt {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 20px;
		pointer-events: auto;
	}

	.ps1 {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--fg);
	}

	.hint {
		font-family: var(--tech);
		font-size: 8px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	@media (max-width: 760px), (orientation: portrait) {
		.hint {
			display: none;
		}
	}
</style>
