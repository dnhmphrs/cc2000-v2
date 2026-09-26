<script>
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	// ── Which run, and which build ───────────────────────────────────────────
	// Small, in the top left corner, on every page: a switch between the two
	// runs — v2, the WebGL run (runs/V2.svelte, /v2), and v3, the run the site
	// is (runs/V3.svelte, / and /v3) — and the build: the package's number and
	// the commit it came from (vite.config.js), so an update can be told from
	// the one before it at a glance. Over the raster and the verdict.
	//
	// The switch RELOADS rather than navigating in place: each run mounts its
	// own Stage and names its scenes its own way (director.setRun), and a
	// fresh page is the one way to be sure nothing of the other is left.
	const RUNS = [
		{ name: 'v2', href: '/v2', on: (p) => p.startsWith('/v2') },
		{ name: 'v3', href: '/v3', on: (p) => p === '/' || p.startsWith('/v3') }
	];
	$: path = $page.url.pathname;
</script>

<nav class="version" aria-label="Runs">
	{#each RUNS as run (run.name)}
		<a
			href={resolve(run.href)}
			data-sveltekit-reload
			class:on={run.on(path)}
			aria-current={run.on(path) ? 'page' : undefined}>{run.name}</a
		>
	{/each}
	<span class="build" aria-hidden="true">{version}</span>
</nav>

<style>
	.version {
		position: fixed;
		top: 6px;
		left: 10px;
		z-index: 35;
		display: flex;
		align-items: baseline;
		gap: 0.8em;
		font-family: var(--tech);
		font-size: 11px;
		letter-spacing: 0.14em;
		color: var(--yellow);
		user-select: none;
		white-space: nowrap;
	}
	a {
		color: inherit;
		text-decoration: none;
		opacity: 0.4;
		padding: 4px 2px 2px;
		border-bottom: 1px solid transparent;
		transition: opacity 0.15s;
	}
	a:hover,
	a:focus-visible {
		opacity: 0.85;
		outline: none;
	}
	a.on {
		opacity: 0.9;
		border-bottom-color: currentColor;
	}
	.build {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
