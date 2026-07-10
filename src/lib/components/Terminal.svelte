<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	// lines: array of { text, kind } where kind ∈ 'sys'|'hi'|'alert'|'ok'|'dim'|'blank'
	// Plain strings are accepted too (treated as kind 'sys').
	export let lines = [];
	export let charDelay = 16; // ms per character
	export let linePause = 240; // ms between finished lines
	export let startDelay = 200;
	export let prompt = '>';
	export let loop = false;

	const dispatch = createEventDispatcher();

	let rendered = []; // { text, kind, shown } — shown = chars revealed so far
	let done = false;
	let timer;

	$: norm = lines.map((l) => (typeof l === 'string' ? { text: l, kind: 'sys' } : l));

	function clearTimer() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function run() {
		clearTimer();
		rendered = [];
		done = false;
		let li = 0;

		const nextLine = () => {
			if (li >= norm.length) {
				done = true;
				dispatch('done');
				if (loop) timer = setTimeout(run, 1400);
				return;
			}
			const line = norm[li];
			rendered = [...rendered, { ...line, shown: 0 }];
			const idx = rendered.length - 1;
			let ci = 0;

			const step = () => {
				if (line.kind === 'blank' || ci >= line.text.length) {
					rendered[idx].shown = line.text.length;
					rendered = rendered;
					li += 1;
					timer = setTimeout(nextLine, line.kind === 'blank' ? 90 : linePause);
					return;
				}
				ci += 1;
				rendered[idx].shown = ci;
				rendered = rendered;
				timer = setTimeout(step, charDelay);
			};
			step();
		};

		timer = setTimeout(nextLine, startDelay);
	}

	onMount(run);
	onDestroy(clearTimer);

	// Re-run if the source lines change identity.
	let prevRef = lines;
	$: if (lines !== prevRef) {
		prevRef = lines;
		run();
	}
</script>

<div class="term">
	{#each rendered as line, i}
		<div class="line {line.kind}" class:active={i === rendered.length - 1 && !done}>
			{#if line.kind !== 'blank'}<span class="pr">{prompt}</span>{/if}
			<span class="tx">{line.text.slice(0, line.shown)}</span
			>{#if i === rendered.length - 1 && !done && line.kind !== 'blank'}<span class="car">_</span
				>{/if}
		</div>
	{/each}
</div>

<style>
	.term {
		font-family: var(--mono);
		font-size: 12px;
		line-height: 1.75;
		letter-spacing: 0.04em;
		color: var(--fg-dim);
		text-align: left;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.line {
		display: block;
	}

	.pr {
		color: var(--fg-faint);
		margin-right: 8px;
	}

	.tx {
		color: var(--fg-dim);
	}

	.hi .tx {
		color: var(--fg);
	}
	.hi .pr {
		color: var(--fg);
	}

	.dim .tx,
	.dim .pr {
		color: var(--fg-ghost);
	}

	.alert .tx {
		color: var(--alert);
	}
	.alert .pr {
		color: var(--alert);
	}

	.ok .tx {
		color: var(--ok);
	}
	.ok .pr {
		color: var(--ok);
	}

	.blank {
		min-height: 0.9em;
	}

	.car {
		color: var(--fg);
		animation: term-blink 1s steps(1) infinite;
	}

	@keyframes term-blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}
</style>
