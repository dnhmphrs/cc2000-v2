<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	// A console, not a caption. Lines are typed into a fixed-pitch grid with a
	// boot-log timestamp column, a status column and a block cursor — the same
	// shape a real terminal prints:
	//
	//   [  0.412] $      run cc2000.sys
	//   [  0.980] [ OK ] chrono-link established
	//
	// lines: array of { text, kind } where kind ∈
	//   'cmd'   → typed at the prompt (bright, "$")
	//   'sys'   → ordinary stdout
	//   'ok'    → "[ OK ]"
	//   'warn'  → "[WARN]"
	//   'hi'    → emphasised stdout
	//   'dim'   → low-priority stdout
	//   'blank' → spacer
	// Plain strings are accepted too (treated as 'sys').
	export let lines = [];
	export let charDelay = 14; // ms per character
	export let linePause = 190; // ms between finished lines
	export let startDelay = 180;
	export let showTime = true; // boot-log timestamp column
	export let loop = false;

	const dispatch = createEventDispatcher();

	// Fixed-width status column, so every line's text starts on the same column.
	const TAGS = {
		cmd: '$',
		ok: '[ OK ]',
		warn: '[WARN]',
		hi: '>>',
		dim: '..',
		sys: '',
		blank: ''
	};

	let rendered = []; // { text, kind, shown, t }
	let done = false;
	let timer;
	let elapsed = 0; // simulated boot clock, in ms

	$: norm = lines.map((l) => (typeof l === 'string' ? { text: l, kind: 'sys' } : l));

	const stamp = (ms) => `[${(ms / 1000).toFixed(3).padStart(7, ' ')}]`;

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
		elapsed = 0;
		let li = 0;

		const nextLine = () => {
			if (li >= norm.length) {
				done = true;
				dispatch('done');
				if (loop) timer = setTimeout(run, 1400);
				return;
			}
			const line = norm[li];
			rendered = [...rendered, { ...line, shown: 0, t: elapsed }];
			const idx = rendered.length - 1;
			let ci = 0;

			const step = () => {
				if (line.kind === 'blank' || ci >= line.text.length) {
					rendered[idx].shown = line.text.length;
					rendered = rendered;
					li += 1;
					const wait = line.kind === 'blank' ? 80 : linePause;
					elapsed += wait;
					timer = setTimeout(nextLine, wait);
					return;
				}
				ci += 1;
				elapsed += charDelay;
				rendered[idx].shown = ci;
				rendered = rendered;
				timer = setTimeout(step, charDelay);
			};
			step();
		};

		timer = setTimeout(nextLine, startDelay);
		elapsed += startDelay;
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

<div class="tty">
	{#each rendered as line, i}
		<div class="row {line.kind}">
			{#if showTime}<span class="ts">{line.kind === 'blank' ? '' : stamp(line.t)}</span>{/if}
			<span class="tag">{TAGS[line.kind] ?? ''}</span><span class="tx"
				>{line.text.slice(0, line.shown)}{#if i === rendered.length - 1 && !done}<span
						class="cur"
					/>{/if}</span
			>
		</div>
	{/each}
</div>

<style>
	.tty {
		font-family: var(--mono);
		font-size: 12px;
		line-height: 1.62;
		letter-spacing: 0;
		color: var(--fg-dim);
		text-align: left;
		font-variant-ligatures: none;
		text-shadow: 0 0 12px rgba(var(--fg-rgb), 0.16);
	}

	.row {
		display: grid;
		grid-template-columns: auto auto 1fr;
		column-gap: 8px;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.ts {
		color: rgba(var(--fg-rgb), 0.28);
		white-space: pre;
		user-select: none;
	}

	.tag {
		width: 6ch;
		white-space: pre;
		color: var(--fg-faint);
		user-select: none;
	}

	.tx {
		color: var(--fg-dim);
	}

	.cmd .tag,
	.cmd .tx {
		color: var(--fg);
	}

	.hi .tx {
		color: var(--fg);
	}
	.hi .tag {
		color: var(--fg);
	}

	.dim .tx,
	.dim .tag {
		color: rgba(var(--fg-rgb), 0.3);
	}

	.warn .tx,
	.warn .tag {
		color: var(--alert);
	}

	.ok .tag {
		color: var(--ok);
	}

	.blank {
		min-height: 0.95em;
	}

	/* Block cursor, sitting on the character grid. */
	.cur {
		display: inline-block;
		width: 0.62em;
		height: 1.02em;
		margin-left: 1px;
		vertical-align: text-bottom;
		background: var(--fg);
		animation: tty-blink 1.05s steps(1) infinite;
	}

	@keyframes tty-blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}

	@media (max-width: 760px) {
		.tty {
			font-size: 11px;
		}
		.ts {
			display: none;
		}
	}
</style>
