<script>
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SCENES } from '$lib/config';
	import { gate } from '$lib/store/store';
	import { begin } from './director';

	// ── The title card ───────────────────────────────────────────────────────
	// The whole viewport, black, scanned, with nothing on it but the words.
	//
	// It is the FIRST GATE and not a scene of its own: the fly-in is already
	// mounted underneath and held at progress zero, which is black air with a
	// mote field coming up in it. So the card is black over black, and when it
	// lifts the flight is already running rather than starting — there is no cut
	// to cover and nothing to synchronise.
	//
	// It types, holds a beat, and lifts. Not a click-through: a press anywhere —
	// or Enter or Escape — skips the rest of the typing for anyone who has read
	// it before, but nothing waits on one.
	//
	// ON THE CLOCK, not on a chain of timers. It used to set one timeout per
	// character, and a timeout fires when the main thread gets round to it — on
	// a phone whose GPU is busy bringing the 3D up behind this card, or on a
	// software renderer, that is once a frame, and a hundred and eighty
	// characters at two frames a second is a card that never lifts. What is
	// shown is worked out from how long the card has been up, so it types at its
	// own pace whatever the frame rate, and lifts when it said it would.

	const T = SCENES.calculator;

	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy',
		'that only the internet can provide'
	];

	let shown = LINES.map(() => 0);
	let raf;
	let lifted = false;

	// When each line starts typing, in seconds from mount, and when the whole
	// card is done.
	const START = [];
	let cursor = T.typeDelay;
	for (const line of LINES) {
		START.push(cursor);
		cursor += line.length * T.charInterval + T.lineGap;
	}
	const END = cursor - T.lineGap + T.titleHold;

	function lift() {
		if (lifted) return;
		lifted = true;
		cancelAnimationFrame(raf);
		shown = LINES.map((l) => l.length);
		begin();
		gate.set(null);
	}

	// A SKIP, not the way through. Enter and Escape, not Space: the dev keys are
	// on the window too, and Space is one of them.
	function skip() {
		lift();
	}
	function onKey(e) {
		if (e.key === 'Enter' || e.key === 'Escape') skip();
	}

	onMount(() => {
		const t0 = performance.now();
		const tick = () => {
			const t = (performance.now() - t0) / 1000;
			shown = LINES.map((line, i) =>
				Math.max(0, Math.min(line.length, Math.floor((t - START[i]) / T.charInterval)))
			);
			if (t >= END) lift();
			else raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
	});
</script>

<!-- The skip is on the WINDOW, not on the card: the card is the whole viewport,
     so "anywhere" is the truth of it, and a div with a pointer handler is a
     control a keyboard cannot reach. -->
<svelte:window on:pointerdown={skip} on:keydown={onKey} />

<div class="prelude" out:fade={{ duration: 420 }}>
	<div class="spiel">
		{#each LINES as line, i}
			<!-- Each line is sized by the WHOLE line, hidden, with the part that has
			     been written so far laid over it. Otherwise the measure grows as the
			     text arrives and a centred line crawls sideways the entire time it is
			     being typed. -->
			<p>
				<span class="ghost">{line}</span>
				<span class="live"
					>{line.slice(0, shown[i])}{#if shown[i] > 0 && shown[i] < line.length}<span class="caret"
						></span>{/if}</span
				>
			</p>
		{/each}
	</div>
</div>

<style>
	.prelude {
		position: fixed;
		inset: 0;
		/* Over the 3D and under the scanlines, which are the screen this is all
		   being watched on rather than a layer inside it. */
		z-index: 20;
		pointer-events: auto;
		/* NO GROUND OF ITS OWN. It used to paint var(--bg), a flat #14120e slab,
		   and the fly-in underneath is not a flat anything: the `deep` shader
		   shapes the air into a channel that measures (30,27,21) in the middle of
		   the frame and (4,4,3) in the corners. So the card was a lighter, evenly
		   lit rectangle sitting on a vignette — an off-black tinge over the thing
		   it is supposed to be part of.
		   
		   Transparent is not a compromise here, it is the correct answer: the
		   fly-in is ALREADY MOUNTED and held at progress zero under this, which
		   is dark air with nothing in it yet, so the card gets the exact ground
		   the run opens on and cannot drift away from it later. */
		background: transparent;
		display: grid;
		place-items: center;
		font-family: var(--tech);
		cursor: default;
		user-select: none;
		-webkit-user-select: none;
	}

	.spiel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55em;
		padding: 6vh 6vw;
		max-width: 100%;
	}
	.spiel p {
		position: relative;
		margin: 0;
		max-width: 100%;
		/* Small and CRISP. This is a card, not a headline — at 21px five lines of
		   it filled the middle of a laptop — and the thing that makes small type
		   read on a black screen is contrast, not size. It was at 0.82 of the
		   ink, which is a legible grey and still a grey; at full strength the
		   same words at two thirds the size are sharper than they were.
		   The floor stays at 11: below that a mono face at 0.04em tracking
		   stops being readable on a phone. */
		font-size: clamp(11px, 1.1vw, 16px);
		line-height: 1.6;
		letter-spacing: 0.04em;
		/* ONE colour. A yellow last line reads as the punchline being flagged. */
		color: var(--ink);
	}
	.spiel .ghost {
		visibility: hidden;
	}
	.spiel .live {
		position: absolute;
		inset: 0;
		white-space: pre;
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
</style>
