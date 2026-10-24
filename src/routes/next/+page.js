// The next run is client-only, as the lab is: it constructs a WebGPURenderer,
// which has no meaning on the server, and every visit is a fresh run.
export const ssr = false;
export const prerender = false;
