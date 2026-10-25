<script>
	import { version } from '$app/environment';

	// The main site's corner: nothing but a small build label — the package's
	// number and the commit (vite.config.js) — so a deploy can be told from
	// the one before. No switch, no links: the main site is the run alone.
</script>

<span class="build" aria-hidden="true">{version}</span>

<style>
	.build {
		position: fixed;
		top: 8px;
		left: 10px;
		z-index: 35;
		font-family: var(--tech);
		font-size: 10px;
		letter-spacing: 0.14em;
		color: var(--yellow);
		opacity: 0.35;
		user-select: none;
		pointer-events: none;
		white-space: nowrap;
	}
</style>
