<script>
	import { caption } from '$lib/store/store';

	// ── The machine's line ───────────────────────────────────────────────────
	// One line of type in the machine's voice, over the still frame where the
	// search stops: "bedroom located." Typed by PROGRESS, not by a timer — the
	// scenes write how much of it is out (`k`) and how present it is (`on`),
	// so ?at= pins it like everything else. See store.js `caption`.
	$: text = $caption.text;
	$: shown = text.slice(0, Math.round($caption.k * text.length));
	$: typing = $caption.k > 0 && $caption.k < 1;
</script>

{#if text && $caption.k > 0 && $caption.on > 0}
	<p class="caption" style="opacity:{$caption.on.toFixed(3)}" aria-live="polite">
		<span>{shown}</span>{#if typing}<span class="caret"></span>{/if}
	</p>
{/if}

<style>
	/* Over the 3D, under the scanlines, like the title card. */
	.caption {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 14vh;
		z-index: 20;
		margin: 0;
		text-align: center;
		font-family: var(--tech);
		font-size: clamp(11px, 1.1vw, 16px);
		line-height: 1.6;
		letter-spacing: 0.08em;
		color: var(--ink);
		white-space: pre;
		pointer-events: none;
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
