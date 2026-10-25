import { gate } from '$lib/site.js';

// (a 404 on the main site, which is the run alone)
export function load() {
	gate();
}
// The next run is client-only, as the lab is: it constructs a WebGPURenderer,
// which has no meaning on the server, and every visit is a fresh run.
export const ssr = false;
export const prerender = false;
