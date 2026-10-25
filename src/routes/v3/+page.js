import { gate, MAIN } from '$lib/site.js';

// (a 404 on the main site, which is the run alone)
export function load() {
	gate();
}
// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = !MAIN;
