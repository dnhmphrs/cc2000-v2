<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SCENES } from '$lib/config';
	import { scene, gate } from '$lib/store/store';
	import { recover } from '$lib/scenes/director';
	import Tiles from './Tiles.svelte';

	// ── The verdict screens ──────────────────────────────────────────────────
	// The original site's four, each with its gif and its own line: too old
	// for the archive, too young for it, a moment the algorithm could not
	// calculate, and the page that does not exist. The first three are the
	// end of a run (functions/answer.js says which): the swimmer swam down a
	// tunnel made of that gif and stopped inside it (world/kaleido.js), and
	// the verdict is read THERE, over the 3D, the gif still playing — no
	// screen of its own. It is put in the register of the two questions: the
	// same glass panel, one hairline, at the centre, a heading in the site's
	// yellow and the lines TYPED on the clock as the title card types.
	// "Calculate again" hands the run back to the flight (director.recover()).
	// 404 and 500 are the route's error page (routes/+error.svelte), with no
	// 3D under it, so there the gif is the frame, tiled (Tiles.svelte), and
	// the way out is home.
	export let status = 500;
	export let message = '';
	export let verdict = null; // 'past' | 'future' | 'unknown' | null

	const VERDICT = {
		past: {
			gif: 'the-past',
			head: 'no signal before 1958',
			line: 'you were born in the time of dinosaurs. there was no music.',
			detail: 'the archive starts in 1958. your moment predates the broadcast record.'
		},
		future: {
			gif: 'the-future',
			head: 'no signal yet',
			line:
				'you were born in the After Time. those lucky enough to be born were ' +
				'conceived to "Baby" by Justin Bieber, as it is the only remaining ' +
				'music allowed by The Council.',
			detail: 'the archive stops in march 2023. nothing has been transmitted since.'
		},
		unknown: {
			gif: '500',
			head: 'overheated',
			line:
				'our servers overheated. the algorithm found your moment of conception too hot for ' +
				'calculation. your parents FUCK.',
			detail: ''
		}
	};
	const ROUTE = {
		404: { gif: '404', head: 'no such channel', line: "you shouldn't be here. run.", detail: '' },
		500: {
			gif: '500',
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

{#if !verdict}
	<div class="error-ground" in:fade={{ duration: reduced ? 0 : 400 }}>
		<Tiles name={v.gif} />
		<div class="veil"></div>
	</div>
{/if}
<div
	class="error-screen"
	in:fade={{ duration: reduced ? 0 : 400 }}
	out:fade={{ duration: reduced ? 0 : 350 }}
>
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
	/* The verdict is put to the run, not a page of its own: on a run its
	   ground is the canvas — the gif tunnel, stopped, still playing — and on
	   the route's error page, with no canvas, the gif tiled over the whole
	   frame under a light veil (.error-ground). Both are under the scanlines,
	   as the room and the questions are; the CARD is over them (z 31 against
	   the raster's 30), because dark ink on the yellow with the raster's dark
	   lines across it was hard to read. */
	.error-ground {
		position: fixed;
		inset: 0;
		z-index: 10;
		pointer-events: none;
	}
	.error-screen {
		position: fixed;
		inset: 0;
		z-index: 31;
		display: grid;
		/* At the centre, as the questions are put. */
		place-items: center;
		background: transparent;
		font-family: var(--tech);
		pointer-events: auto;
		cursor: default;
	}
	.veil {
		position: absolute;
		inset: 0;
		background: rgba(4, 4, 8, 0.28);
	}

	/* The site's own YELLOW: the verdict is a card in the colour of the
	   machine's buttons, near-black ink on it, over the gold tunnel it
	   stopped in — the one loud thing in the frame, as a verdict should be. */
	.panel {
		position: relative;
		min-width: min(24rem, 86vw);
		max-width: min(40rem, 92vw);
		padding: clamp(22px, 3.4vh, 36px) clamp(22px, 3vw, 44px);
		background: var(--yellow);
		color: var(--on-yellow);
		border: 1px solid var(--on-yellow);
		border-radius: 3px;
		box-shadow:
			0 0 0 1px var(--yellow),
			0 0 44px rgba(255, 212, 38, 0.35),
			0 24px 70px rgba(0, 0, 0, 0.55);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(14px, 2vh, 22px);
	}
	.panel:focus,
	.panel:focus-visible {
		outline: 2px solid var(--on-yellow);
		outline-offset: -5px;
	}

	/* Big, bold and in full ink: the card is small in a big frame and the
	   face is a thin one, so nothing on it is under 12px or less than black. */
	/* .panel .q, not .q: the site's stylesheet has a .panel .q of its own
	   (the old popup's, light ink) that would otherwise win the tie. */
	.panel .q {
		margin: 0;
		font-size: clamp(12px, 1vw, 14px);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--on-yellow);
		padding-bottom: 0.7em;
		border-bottom: 2px solid var(--on-yellow);
	}

	.lines {
		display: flex;
		flex-direction: column;
		gap: 0.8em;
		max-width: 100%;
	}
	.line {
		position: relative;
		margin: 0;
		max-width: 100%;
		line-height: 1.45;
		letter-spacing: 0.03em;
	}
	.line.verdict {
		font-size: clamp(16px, 1.6vw, 22px);
		font-weight: 700;
		color: var(--on-yellow);
	}
	.line.detail {
		font-size: clamp(13px, 1.15vw, 16px);
		font-weight: 400;
		color: var(--on-yellow);
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
		background: var(--on-yellow);
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
		margin-top: 0.3em;
		font: inherit;
		font-size: clamp(12px, 1vw, 14px);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--yellow);
		background: var(--on-yellow);
		border: 1px solid var(--on-yellow);
		border-radius: 2px;
		padding: 0.9em 2.4em;
		cursor: pointer;
		transition:
			background 0.18s,
			color 0.18s,
			border-color 0.18s;
	}
	.go:hover {
		background: transparent;
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
