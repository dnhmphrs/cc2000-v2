// The lab is client-only: it constructs a WebGPURenderer, which has no meaning
// on the server, and it is never prerendered — every visit is a fresh sketch.
export const ssr = false;
export const prerender = false;
