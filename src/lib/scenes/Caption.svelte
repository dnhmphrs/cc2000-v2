<script>
	import { fade } from 'svelte/transition';
	import { scene, sceneTone } from '$lib/store/store';
	import { SCENES } from '$lib/config';

	// One line of copy at a time over the three middle scenes. It is paced from
	// the scene durations rather than from a timer of its own, so retiming a
	// scene in config/timing.js retimes the words with it.
	//
	// The ground goes from deep blue to white part way through, so the colour
	// follows sceneTone rather than being fixed.

	const LINES = {
		flyIn: ['counting back 268 days', 'finding the moment'],
		conception: ['assembling the archive', 'turning it over', 'narrowing it down'],
		computation: ['checking each decade', 'found it']
	};

	let i = 0;
	let timer;

	// Restart the run of lines whenever the scene changes, and spread them
	// evenly across whatever that scene's duration is.
	$: lines = LINES[$scene] ?? null;
	$: if (lines) restart($scene);

	function restart(name) {
		clearInterval(timer);
		i = 0;
		const each = (SCENES[name].duration / (LINES[name].length + 0.4)) * 1000;
		timer = setInterval(() => {
			if (i < LINES[name].length - 1) i += 1;
		}, each);
	}

	import { onDestroy } from 'svelte';
	onDestroy(() => clearInterval(timer));
</script>

{#if lines}
	<div class="wrap" class:light={$sceneTone === 'light'}>
		{#key `${$scene}-${i}`}
			<p in:fade={{ duration: 400 }}>{lines[i]}</p>
		{/key}
	</div>
{/if}

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
		font-size: clamp(13px, 1.4vw, 16px);
		letter-spacing: 0.14em;
		color: var(--ink);
		transition: color 0.4s ease;
	}

	/* The conception and the computation are on white. */
	.wrap.light p {
		color: var(--ink-on-light);
	}
</style>
