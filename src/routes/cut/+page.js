import { redirect } from '@sveltejs/kit';

// /cut — THE CUT: everything there is, every variant of every beat, in the
// run's order (data/experiments.js). The reel itself is routes/v4, with
// ?chain=all (and ?chain=one is the short cut, one of each); this is the
// short way in.
export function load() {
	redirect(307, '/v4?chain=all');
}
export const ssr = false;
export const prerender = false;
