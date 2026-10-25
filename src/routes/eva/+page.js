import { gate, MAIN } from '$lib/site.js';
import { redirect } from '@sveltejs/kit';

// /eva — the six Evangelion sketches (docs/explore-02.md), back to back.
// The reel itself is routes/v4, with ?chain=explore2; this is the short way in.
export function load() {
	gate();
	redirect(307, '/v4?chain=explore2');
}
// (never prerendered on the main site: it is a 404 there)
export const prerender = !MAIN;
