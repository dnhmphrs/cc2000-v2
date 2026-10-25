// ── Which site this build is ────────────────────────────────────────────────
// One repo, two sites. `main` is THE SITE: the run (runs/Next.svelte with
// `only`, the sketch lab/flow-strand-sketch.js) at / and nothing else — no
// v2, no v3, no lab, no archive, no variants, no switch in the corner, just a
// small build label (components/Build.svelte) — and a first paint that is
// the board's own dark (app.html reads data-site). `dev` is everything: v3
// at /, v2, /next with every variant, the lab, the reels, the index, the
// corner's switch. vite.config.js decides from SITE= in the environment, or
// Vercel's: a Production deploy (main) is main, a Preview (dev) is dev.
// Every route but / calls `gate()` in its +page.js: on main they are 404s.
import { error } from '@sveltejs/kit';

export const SITE = typeof __SITE__ === 'string' ? __SITE__ : 'dev';
export const MAIN = SITE === 'main';

export function gate() {
	if (MAIN) error(404, 'Not found');
}
