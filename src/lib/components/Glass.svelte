<script>
	// ── The glass ────────────────────────────────────────────────────────────
	// Scanlines over the whole site, ALWAYS.
	//
	// They used to be gated to the three 3D scenes, on the reasoning that the
	// calculator had its own CRT and a second pitch over it was a moiré, and that
	// the bedroom is a room photographed on nothing. There is no calculator in
	// this build, and the argument about the bedroom had it backwards: the raster
	// is the screen the whole thing is being WATCHED on, not a layer inside any
	// one scene, so switching it off at the ends is the site stepping out of its
	// own frame twice per run.
</script>

<div class="scanlines" />

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
