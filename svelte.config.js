import adapter from '@sveltejs/adapter-vercel';

// The Node runtime is PINNED, and it has to be. Left to itself the adapter picks
// the runtime from whatever Node is running the build — and this version of it
// only knows 16, 18 and 20, so on Vercel's current build image it throws
// "Unsupported Node.js version" before it has emitted anything. That is the
// deployment failure every PR on this repo has been carrying. Naming a runtime
// skips that guess entirely; 22.x is what Vercel actually runs now.
//
// Bump this when Vercel drops 22. The adapter itself does not need to know the
// version — it only checks the shape, nodejsNN.x with NN at least 16.
const config = {
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' })
	}
};

export default config;
