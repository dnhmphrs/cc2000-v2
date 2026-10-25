import { MAIN } from '$lib/site.js';

// The home page is prerendered (no data). Which run it is depends on the
// site: on main THE RUN (runs/Next.svelte, the sketch alone); on dev v3 as it
// was. Loaded here rather than imported by the page so each site's home
// carries only its own run's code.
export const prerender = true;

export async function load() {
	const Run = MAIN
		? (await import('$lib/runs/Next.svelte')).default
		: (await import('$lib/runs/V3.svelte')).default;
	return { Run };
}
