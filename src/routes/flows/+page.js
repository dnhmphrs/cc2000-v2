import { redirect } from '@sveltejs/kit';

// /flows — the v4 flows: whole runs on the board, one answer each to the same
// brief (data/experiments.js FLOWS), end to end. The reel itself is
// routes/v4, with ?chain=flows; this is its address.
export function load() {
	redirect(307, '/v4?chain=flows');
}
export const ssr = false;
export const prerender = false;
