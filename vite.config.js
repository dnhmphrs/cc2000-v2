import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

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
			adapter: adapter({ runtime: 'nodejs22.x' })
		})
	]
});
