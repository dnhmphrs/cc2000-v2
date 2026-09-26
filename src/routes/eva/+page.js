import { redirect } from '@sveltejs/kit';

// /eva — the six Evangelion sketches (docs/explore-02.md), back to back.
// The reel itself is routes/v4, with ?chain=explore2; this is the short way in.
export function load() {
	redirect(307, '/v4?chain=explore2');
}
