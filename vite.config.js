import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The version in the top left corner (components/Version.svelte): the
// package's own number, bumped with every PR to main, and the commit it was
// built from — Vercel's, or the checkout's — so any two deploys can be told
// apart at a glance. SvelteKit hands it to the page as `version` from
// $app/environment (and uses it to notice a new deploy, which is what it is).
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const commit = (() => {
	if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
	try {
		return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return '';
	}
})();

// The whole SvelteKit configuration lives here now (Kit 2.63+ takes it as
// options to the plugin; there is no svelte.config.js). Two things to know:
//
//   THE NODE RUNTIME IS PINNED. Left to itself the adapter picks the runtime
//   from whatever Node is running the build, and Vercel's build image and the
//   adapter's list of known versions have disagreed before — "Unsupported
//   Node.js version" before a byte was emitted, on every PR. Naming one skips
//   the guess. Bump it when Vercel drops 22.
//
//   NO RUNES FORCING. `npx sv create` writes `compilerOptions.runes: true` for
//   a new project; this one is Svelte 4 syntax throughout and Svelte 5 runs it
//   as such (legacy mode is supported, and the two can be mixed per file). The
//   move to runes is its own change, made file by file, not a switch thrown
//   over forty components at once.
export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({ runtime: 'nodejs22.x' }),
			version: { name: commit ? `${pkg.version} · ${commit}` : pkg.version }
		})
	]
});
