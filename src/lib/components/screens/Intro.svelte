<script>
	import { onMount, onDestroy } from 'svelte';
	import { phase } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 1. The sperm is already on screen coming forward; this writes on over
	// it. Three lines, written a character at a time, then a way in. Nothing else
	// — the background stays blank.
	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy only the internet can provide'
	];

	const CHAR_MS = 26;
	const LINE_GAP = 260;
	const START_DELAY = 1400; // let it come out of the dark first

	let shown = LINES.map(() => 0);
	let done = false;
	let timer;

	onMount(() => {
		let li = 0;
		const step = () => {
			if (li >= LINES.length) {
				done = true;
				return;
			}
			if (shown[li] >= LINES[li].length) {
				li += 1;
				timer = setTimeout(step, LINE_GAP);
				return;
			}
			shown[li] += 1;
			shown = shown;
			timer = setTimeout(step, CHAR_MS);
		};
		timer = setTimeout(step, START_DELAY);
	});
	onDestroy(() => clearTimeout(timer));

	const skip = () => {
		clearTimeout(timer);
		shown = LINES.map((l) => l.length);
		done = true;
	};

	function begin() {
		phase.set('calculate');
	}
</script>

<div class="wrap" out:fade={{ duration: 300 }}>
	<!-- Impatient visitors get the rest of it at once rather than waiting. -->
	<button class="skip" class:hidden={done} on:click={skip} aria-label="show all text" />

	<div class="write">
		{#each LINES as line, i}
			<p class:lit={i === LINES.length - 1}>
				{line.slice(0, shown[i])}{#if !done && shown[i] > 0 && shown[i] < line.length}<span
						class="caret"
					/>{/if}
			</p>
		{/each}
	</div>

	{#if done}
		<div class="enter" in:fade={{ duration: 600 }}>
			<button class="go" on:click={begin}>begin</button>
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		padding: 0 clamp(24px, 5vw, 72px) clamp(26px, 7vh, 66px);
		pointer-events: none;
	}

	/* Invisible catcher over the whole page while the text is still writing. */
	.skip {
		position: fixed;
		inset: 0;
		border: 0;
		background: transparent;
		padding: 0;
		cursor: default;
		pointer-events: auto;
	}
	.skip.hidden {
		display: none;
	}

	.write p {
		font-size: clamp(14px, 1.6vw, 19px);
		line-height: 1.45;
		color: var(--ink-dim);
		margin: 0;
		min-height: 1.45em;
	}
	.write p.lit {
		color: var(--yellow);
	}

	.caret {
		display: inline-block;
		width: 0.5em;
		height: 1em;
		margin-left: 1px;
		vertical-align: text-bottom;
		background: var(--ink);
		animation: blink 1.05s steps(1) infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}

	.enter {
		margin-top: clamp(20px, 3vh, 32px);
		pointer-events: auto;
	}
	.enter button {
		padding: 14px 40px;
		font-size: 15px;
	}
</style>
