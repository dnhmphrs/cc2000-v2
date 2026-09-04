<script>
	import { onMount, onDestroy } from 'svelte';
	import { phase } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 1. Not a magazine cover — a machine, sitting there switched on and
	// ready. Its display is the thing it actually knows: how far back the archive
	// reaches and how much is in it. Both figures are the real ones.
	const FROM = 1958;
	const TO = 2023;
	const TRACKS = '33,800';

	// A short power-up on the readout: the digits hunt, then settle. This is the
	// whole "it is a machine" gesture — no boot log, no scrolling text.
	let readout = '---- — ----';
	let settled = false;
	let timer;

	onMount(() => {
		const started = performance.now();
		const rnd = () => 1000 + Math.floor(Math.random() * 9000);
		timer = setInterval(() => {
			if (performance.now() - started > 850) {
				clearInterval(timer);
				readout = `${FROM} — ${TO}`;
				settled = true;
				return;
			}
			readout = `${rnd()} — ${rnd()}`;
		}, 55);
	});
	onDestroy(() => clearInterval(timer));

	function start() {
		phase.set('calculate');
	}
</script>

<div class="stage" out:fade={{ duration: 220 }}>
	<div class="machine" in:fade={{ duration: 500 }}>
		<p class="model">model cc-2000</p>
		<h1>Conception Calculator</h1>
		<p class="tag">the song that was playing the moment you were made.</p>

		<div class="readout" class:settled>
			<span class="years">{readout}</span>
			<span class="spec">{TRACKS} tracks indexed{settled ? ' · ready' : ' · checking'}</span>
		</div>

		<button class="go" on:click={start} disabled={!settled}>start</button>
	</div>
</div>

<style>
	.machine {
		width: 100%;
		max-width: 620px;
		pointer-events: auto;
	}

	.model {
		font-size: 12px;
		letter-spacing: 0.3em;
		color: var(--ink-dim);
		margin: 0 0 10px;
	}

	h1 {
		font-size: clamp(28px, 4.4vw, 50px);
		font-weight: 700;
		line-height: 1;
		margin: 0 0 14px;
		color: var(--ink);
	}

	.tag {
		font-size: clamp(14px, 1.5vw, 17px);
		color: var(--ink-dim);
		margin: 0 0 clamp(24px, 4vh, 40px);
		max-width: 30ch;
	}

	/* The display. A rule above and below and nothing else — it reads as an
	   instrument panel because of the numbers, not because of chrome. */
	.readout {
		border-top: 1px solid rgba(var(--ink-rgb), 0.18);
		border-bottom: 1px solid rgba(var(--ink-rgb), 0.18);
		padding: 18px 0 16px;
		margin-bottom: clamp(22px, 3.5vh, 34px);
	}

	.years {
		display: block;
		font-size: clamp(38px, 7vw, 76px);
		font-weight: 700;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--blue-lit);
		opacity: 0.55;
		transition: opacity 0.3s;
	}
	.readout.settled .years {
		opacity: 1;
	}

	.spec {
		display: block;
		margin-top: 10px;
		font-size: 12px;
		letter-spacing: 0.16em;
		color: var(--ink-dim);
	}

	button {
		padding: 15px 40px;
		font-size: 15px;
	}
</style>
