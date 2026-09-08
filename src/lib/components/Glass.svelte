<script>
	import { scene } from '$lib/store/store';

	// ── The glass ────────────────────────────────────────────────────────────
	// Scanlines over the whole site, for the three 3D scenes and those only.
	//
	// They belong to the flight, not to the furniture. The calculator has its own
	// CRT and draws its own gleam on it — laying a second pitch over that is a
	// moiré, not a screen — and the bedroom you land in is a room, photographed
	// on nothing, so scanlines over it read as a filter rather than as a set.
	//
	// Between those two ends you are inside the machine, and that is where they
	// earn their keep.
	$: inFlight = $scene === 'flyIn' || $scene === 'conception' || $scene === 'computation';
</script>

{#if inFlight}
	<div class="scanlines" />
{/if}

<style>
	.scanlines {
		position: fixed;
		inset: 0;
		pointer-events: none;
		/* Over everything, including the flash: they are the screen this is being
		   watched on, not a layer inside the scene. */
		z-index: 30;
		background: var(--scanlines);
	}
</style>
