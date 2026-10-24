import { redirect } from '@sveltejs/kit';

// /cut — THE CUT: everything there is, every variant of every beat, in the
// run's order (data/experiments.js). The reel itself is routes/v4, with
// ?chain=all; this is its address. (?chain=one is the short cut, one of
// each: a different reel, not this one.)
export function load() {
	redirect(307, '/v4?chain=all');
}
export const ssr = false;
export const prerender = false;
