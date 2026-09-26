<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SCENES } from '$lib/config';
	import { scene, gate } from '$lib/store/store';
	import { recover } from '$lib/scenes/director';

	// ── The verdict screens ──────────────────────────────────────────────────
	// Three of them, each with the machine's own line: too old for the archive,
	// too young for it, and the page that does not exist. The two verdicts are
	// the end of a run — the tunnel broke down on the way to a room that was
	// never there (world/kaleido.js): the set switched off, and what is left
	// on the canvas is the black and the swimmer alone in it, still rolling
	// (the kaleido holds its last frame and keeps the swimmer's clock going).
	// The verdict is put to it there, in the register of the two questions —
	// the same glass panel on the void, one hairline, in the lower third, the
	// lines TYPED on the clock as the title card types — rather than a screen
	// of its own with a picture on it. There used to be a gif in the slot; it
	// belonged to another site. "Calculate again" hands the run back to the
	// flight (director.recover()). 404 and 500 are the route's error page
	// (routes/+error.svelte), with no 3D under them, and go home.
	export let status = 500;
	export let message = '';
	export let verdict = null; // 'past' | 'future' | null

	const VERDICT = {
		past: {
			head: 'no signal before 1958',
			line: 'you were born in the time of dinosaurs. there was no music.',
			detail: 'the archive starts in 1958. your moment predates the broadcast record.'
		},
		future: {
			head: 'no signal yet',
			line:
				'you were born in the After Time. those lucky enough to be born were ' +
				'conceived to "Baby" by Justin Bieber, as it is the only remaining ' +
				'music allowed by The Council.',
			detail: 'that date has not happened yet. no signal has been transmitted for it.'
		}
	};
	const ROUTE = {
		404: { head: 'no such channel', line: "you shouldn't be here. run.", detail: '' },
		500: {
			head: 'overheated',
			line:
				'our servers overheated. the algorithm found your moment of conception too hot for ' +
				'calculation. your parents FUCK.',
			detail: ''
		}
	};
	$: v = verdict ? VERDICT[verdict] : ROUTE[status === 404 ? 404 : 500];
	$: lines = [v.line, v.detail || (verdict ? '' : message || '')].filter(Boolean);

	// ── Typed on the clock ───────────────────────────────────────────────────
	// As the title card does (scenes/Prelude.svelte): what is shown is worked
	// out from how long the panel has been up, so it types at its own pace
	// whatever the frame rate, and a press anywhere finishes it. Under
	// prefers-reduced-motion it is simply there.
	const T = SCENES.calculator;
	const DELAY = 0.45;
	let shown = [];
	let raf;
	let done = false;
	let panel;
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	$: starts = (() => {
		const out = [];
		let cursor = DELAY;
		for (const line of lines) {
			out.push(cursor);
			cursor += line.length * T.charInterval + T.lineGap;
		}
		return out;
	})();

	function finish() {
		if (done) return;
		done = true;
		if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
		shown = lines.map((l) => l.length);
	}

	onMount(async () => {
		await tick();
		panel?.focus();
		if (reduced) {
			finish();
			return;
		}
		const t0 = performance.now();
		const tick_ = () => {
			const t = (performance.now() - t0) / 1000;
			shown = lines.map((line, i) =>
				Math.max(0, Math.min(line.length, Math.floor((t - starts[i]) / T.charInterval)))
			);
			if (shown.every((n, i) => n >= lines[i].length)) finish();
			else raf = requestAnimationFrame(tick_);
		};
		raf = requestAnimationFrame(tick_);
	});

	onDestroy(() => {
		if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
	});

	function onKey(e) {
		if (e.key === 'Escape' || e.key === 'Enter') {
			if (!done) {
				finish();
				e.preventDefault();
			}
		}
	}

	function goHome() {
		scene.set('approach');
		gate.set('prelude');
		goto(resolve('/'), { replaceState: true });
	}
</script>

<svelte:window on:pointerdown={finish} />

<div class="error-screen" class:centred={!verdict} in:fade={{ duration: reduced ? 0 : 400 }}>
	<div
		class="panel"
		bind:this={panel}
		on:keydown={onKey}
		role="dialog"
		aria-modal="true"
		aria-labelledby="verdict-q"
		tabindex="-1"
	>
		<p id="verdict-q" class="q">{v.head}</p>
		<div class="lines" aria-live="polite" aria-atomic="true">
			{#each lines as line, i}
				<!-- Each line is sized by the WHOLE line, hidden, with the part that
				     has been written so far laid over it, so nothing crawls as the
				     text arrives — the title card's own trick. -->
				<p class="line" class:verdict={i === 0} class:detail={i > 0}>
					<span class="ghost">{line}</span>
					<span class="live"
						>{line.slice(
							0,
							shown[i] ?? 0
						)}{#if !done && (shown[i] ?? 0) > 0 && (shown[i] ?? 0) < line.length}<span class="caret"
							></span>{/if}</span
					>
				</p>
			{/each}
		</div>
		{#if verdict}
			<button class="go" on:click={recover}>calculate again</button>
		{:else}
			<button class="go" on:click={goHome}>calculate again</button>
		{/if}
	</div>
</div>

<style>
	/* Over the 3D and under the scanlines, like the room and the questions:
	   the verdict is a screen the run is watched on, not a page. No ground of
	   its own — the canvas under it is black with the swimmer alone in it, and
	   that is the picture. On the route's error page there is no canvas, and
	   the page ground is the same blue-black. */
	.error-screen {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: grid;
		/* In the LOWER third, under the swimmer, as the questions are put. */
		place-items: end center;
		padding-bottom: clamp(40px, 13vh, 120px);
		background: transparent;
		font-family: var(--tech);
		pointer-events: auto;
		cursor: default;
	}
	.error-screen.centred {
		place-items: center;
		padding-bottom: 0;
	}

	/* The questions' own glass: no chrome, one hairline, the ground behind it
	   barely darkened so the swimmer still reads underneath. */
	.panel {
		min-width: min(21rem, 80vw);
		max-width: min(34rem, 92vw);
		padding: clamp(16px, 2.4vh, 24px) clamp(18px, 2.2vw, 30px);
		background: rgba(10, 10, 12, 0.82);
		border: 1px solid rgba(255, 212, 38, 0.45);
		border-radius: 3px;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.5),
			0 24px 70px rgba(0, 0, 0, 0.55);
		outline: 1px solid var(--edge);
		outline-offset: 1px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(10px, 1.5vh, 16px);
	}
	.panel:focus,
	.panel:focus-visible {
		outline: 1px solid var(--edge);
		outline-offset: 1px;
	}

	.q {
		margin: 0;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--yellow);
	}

	.lines {
		display: flex;
		flex-direction: column;
		gap: 0.55em;
		max-width: 100%;
	}
	.line {
		position: relative;
		margin: 0;
		max-width: 100%;
		line-height: 1.6;
		letter-spacing: 0.04em;
	}
	.line.verdict {
		font-size: clamp(11px, 1.1vw, 16px);
		color: var(--ink);
	}
	.line.detail {
		font-size: clamp(10px, 0.95vw, 13px);
		color: var(--ink-soft);
	}
	.ghost {
		visibility: hidden;
		white-space: pre-wrap;
	}
	.live {
		position: absolute;
		inset: 0;
		white-space: pre-wrap;
	}
	.caret {
		display: inline-block;
		width: 0.5em;
		height: 0.9em;
		vertical-align: text-bottom;
		background: var(--ink);
		animation: blink 1.05s steps(1) infinite;
	}
	@keyframes blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.go {
		margin-top: 0.2em;
		font: inherit;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--yellow);
		background: transparent;
		border: 1px solid rgba(255, 212, 38, 0.55);
		border-radius: 2px;
		padding: 0.75em 2.2em;
		cursor: pointer;
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s;
	}
	.go:hover {
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--on-yellow);
	}

	@media (prefers-reduced-motion: reduce) {
		.go {
			transition: none;
		}
		.caret {
			animation: none;
		}
	}
</style>
