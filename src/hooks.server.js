import { MAIN, SITE } from '$lib/site.js';

// Two things, both for the MAIN site (src/lib/site.js):
//   • every path but / is a 404 at the server — the client-only routes (the
//     lab, /next, the index, the reels) would otherwise answer 200 with an
//     empty shell and only fail in the browser; the routes' own gate() stays
//     as the second lock;
//   • the page's shell says which site it is before a byte of JS runs
//     (app.html's <html data-site>), so the first paint is the board's dark.
export async function handle({ event, resolve }) {
	const path = event.url.pathname;
	if (MAIN && path !== '/' && !path.startsWith('/_app/') && !/\.[a-z0-9]+$/i.test(path))
		return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('data-site="dev"', `data-site="${SITE}"`)
	});
}
