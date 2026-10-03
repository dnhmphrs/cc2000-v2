import { redirect } from '@sveltejs/kit';

// /cut — THE CUT: everything there is, one variant of each beat, in the run's
// order (data/experiments.js, each beat's `cut`). The reel itself is
// routes/v4, with ?chain=all; this is the short way in.
export function load() {
	redirect(307, '/v4?chain=all');
}
export const ssr = false;
export const prerender = false;
