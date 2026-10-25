<script>
	import { MAIN } from '$lib/site.js';

	// The site: on main, the run — runs/Next.svelte with `only`, the one
	// scene it has; on dev, v3 (runs/V3.svelte, also at /v3) as it was, with
	// v2 at /v2 and the next run at /next. Which is decided in +page.js.
	export let data;
</script>

<svelte:component this={data.Run} only={MAIN} />
