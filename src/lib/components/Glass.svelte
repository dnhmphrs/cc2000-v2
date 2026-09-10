<script>
	import { landing } from '$lib/store/store';

	// ── The glass ────────────────────────────────────────────────────────────
	// Scanlines over the whole site, for the whole run — and then out.
	//
	// They used to be gated to the three 3D scenes, on the reasoning that a CRT
	// under a second pitch is a moiré and that the bedroom is a room photographed
	// on nothing. The first half of that went with the calculator. The second was
	// backwards: the raster is the screen the whole thing is being WATCHED on,
	// not a layer inside any one scene, so switching it off between scenes was
	// the site stepping out of its own frame twice a run.
	//
	// But it does come off at the END, and it comes off ON the fall. The last
	// thing the run does is stop being a screen and become a place; the raster
	// riding the zoom out is that happening rather than being announced. See the
	// `landing` store, which the computation writes across its final zoom.
</script>

<div class="scanlines" style="opacity:{(1 - $landing).toFixed(3)}" />

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
