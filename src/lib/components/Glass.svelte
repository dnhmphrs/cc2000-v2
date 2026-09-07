<script>
	import { scene } from '$lib/store/store';

	// ── The glass ────────────────────────────────────────────────────────────
	// Two layers, with two different lifetimes, over the whole site.
	//
	// SCANLINES are on for the entire run. They are not the machine's screen —
	// they are the one you are watching this on, so they have no reason to stop
	// when the machine does. The calculator's CRT deliberately does NOT draw its
	// own: the same 3px pitch twice over is a moiré, not a CRT.
	//
	// The GLEAM is the machine's glass, and it lasts as long as you are behind
	// it. On the calculator you see it inside the little window; from the launch
	// onward you see it across the whole frame, which is what being inside that
	// window looks like — you do not fly PAST that screen, you fly THROUGH it.
	// It ends at the conception, which is the far side of the white blow-out and
	// not in the machine at all.
	$: behindGlass = $scene === 'flyIn';
</script>

<div class="scanlines" />
<div class="gleam" class:behindGlass />

<style>
	.scanlines,
	.gleam {
		position: fixed;
		inset: 0;
		pointer-events: none;
	}

	/* Over EVERYTHING, including the machine and the result panel. These are not
	   the machine's screen, they are the one you are watching this on, so the
	   answer is behind them the same as the tunnel is. */
	.scanlines {
		z-index: 30;
		background: var(--scanlines);
	}

	/* Over the 3D but UNDER the DOM screens: this is the machine's own glass, and
	   the machine flying into the lens has to stay in front of its reflection. */
	.gleam {
		z-index: 3;
		background: var(--glass);
		opacity: 0;
		/* Slow out, so the blow-out into the conception carries it away rather
		   than snapping it off. */
		transition: opacity 0.7s ease;
	}
	/* In over the launch, which is how long the machine takes to leave: the
	   window's own gleam grows into this one rather than handing over. */
	.gleam.behindGlass {
		opacity: 1;
		transition: opacity 1.4s ease;
	}
</style>
