import { DEV_SEED } from '$lib/config';

// ── Random, but repeatable on request ────────────────────────────────────────
// Everything the run leaves to chance goes through this one function: which
// decade lands on which pane (data/roomElements.js), where the motes sit in the
// flight (three/world/tunnel.js), the birthday the dev harness rolls
// (components/Dev.svelte). Without ?seed= it IS Math.random. With it, it is a
// small PRNG seeded from the string, so two loads of the same URL make the
// same choices — and a contact sheet of a beat can be diffed against another
// one, which it could not be while the panes were shuffled afresh every load.
//
// mulberry32: 32-bit state, good enough distribution for choosing decades and
// scattering a few hundred motes, and four lines long.
function mulberry32(a) {
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// FNV-1a, so ?seed=42 and ?seed=egg both work and differ.
function hash(str) {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

export const rand = DEV_SEED === null ? Math.random : mulberry32(hash(DEV_SEED));
