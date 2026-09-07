<script>
	// ── The glass ────────────────────────────────────────────────────────────
	// Scanlines over the whole site, for the whole run — the machine, the rooms
	// and the result panel alike. They are not the machine's screen, they are the
	// one you are watching this on, so they have no reason to stop when the
	// machine does, and they sit above every DOM screen rather than under them.
	//
	// The calculator's CRT deliberately does NOT draw its own: the same pitch
	// twice over is a moiré, not a CRT. The diagonal gleam stays where it belongs,
	// on the machine's own window — carrying it full-screen through the fly-in
	// was tried and it is too much over a scene.
</script>

<div class="scanlines" />

<style>
	.scanlines {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 30;
		background: var(--scanlines);
	}
</style>
