import { writable, derived, get } from 'svelte/store';

// ── Site ink ─────────────────────────────────────────────────────────────────
// One warm cream, used for both the UI text and every line in the 3D scene, so
// the wireframe and the copy read as the same material. The colour event on this
// site is the room at the end — everything before it is ink on warm dark.
export const PALETTES = {
	warm: { label: 'warm', line: 0xf7ecdc, ui: [247, 236, 220] }
};

export const DEFAULT_PALETTE = 'warm';

// ── Stores ───────────────────────────────────────────────────────────────────
export const paletteKey = writable(DEFAULT_PALETTE);
export const palette = derived(paletteKey, (k) => PALETTES[k] || PALETTES[DEFAULT_PALETTE]);

// Ink as a THREE-friendly hex number for the 3D line-work.
export const accentHex = derived(palette, (p) => p.line);

// ── Helpers ──────────────────────────────────────────────────────────────────
export function accentRGB() {
	const hex = get(accentHex);
	return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

// Everything in styles.css is rgba(var(--ink-rgb), α), so this one triple
// recolours the whole interface.
export function applyCssVars(p) {
	if (typeof document === 'undefined') return;
	const [r, g, b] = p.ui;
	document.documentElement.style.setProperty('--ink-rgb', `${r}, ${g}, ${b}`);
}
