<script>
	import { version } from '$app/environment';

	// ── The version ──────────────────────────────────────────────────────────
	// Small, in the top left corner, on every page: the package's number and
	// the commit the build came from (vite.config.js), so an update can be
	// told from the one before it at a glance. Over the raster and out of the
	// way of the pointer.
</script>

<div class="version" aria-hidden="true">v{version}</div>

<style>
	.version {
		position: fixed;
		top: 8px;
		left: 10px;
		z-index: 35;
		font-family: var(--tech);
		font-size: 9px;
		letter-spacing: 0.14em;
		color: var(--yellow);
		opacity: 0.55;
		pointer-events: none;
		user-select: none;
		white-space: nowrap;
	}
</style>
