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
	// It types, holds a beat, and lifts. Not a click-through: a pointerdown skips
	// the rest of the typing for anyone who has read it before, but nothing waits
	// on one.

	const T = SCENES.calculator;

	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy',
		'that only the internet can provide.'
	];

	let shown = LINES.map(() => 0);
	let timer;

	function lift() {
		clearTimeout(timer);
		shown = LINES.map((l) => l.length);
		begin();
		gate.set(null);
	}

	// A SKIP, not the way through.
	function skip() {
		lift();
	}

	onMount(() => {
		let li = 0;
		const step = () => {
			if (li >= LINES.length) {
				timer = setTimeout(lift, T.titleHold * 1000);
				return;
			}
			if (shown[li] >= LINES[li].length) {
				li += 1;
				timer = setTimeout(step, T.lineGap * 1000);
				return;
			}
			shown[li] += 1;
			shown = shown;
			timer = setTimeout(step, T.charInterval * 1000);
		};
		timer = setTimeout(step, T.typeDelay * 1000);
	});

	onDestroy(() => clearTimeout(timer));
</script>

<div class="prelude" out:fade={{ duration: 420 }} on:pointerdown={skip}>
	<div class="spiel">
		{#each LINES as line, i}
			<!-- Each line is sized by the WHOLE line, hidden, with the part that has
			     been written so far laid over it. Otherwise the measure grows as the
			     text arrives and a centred line crawls sideways the entire time it is
			     being typed. -->
			<p>
				<span class="ghost">{line}</span>
				<span class="live"
					>{line.slice(0, shown[i])}{#if shown[i] > 0 && shown[i] < line.length}<span
							class="caret"
						/>{/if}</span
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
		/* Read at arm's length, not squinted at: this is the only thing on screen. */
		font-size: clamp(13px, 1.45vw, 21px);
		line-height: 1.6;
		letter-spacing: 0.04em;
		/* ONE colour. A yellow last line reads as the punchline being flagged. */
		color: rgba(240, 242, 248, 0.82);
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
		background: rgba(240, 242, 248, 0.8);
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
