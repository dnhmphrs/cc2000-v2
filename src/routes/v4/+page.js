import { gate } from '$lib/site.js';

// (a 404 on the main site, which is the run alone)
export function load() {
	gate();
}
export const ssr = false;
export const prerender = false;
