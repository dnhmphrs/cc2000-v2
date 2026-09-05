import { writable, derived, get } from 'svelte/store';

// ── Site ink ─────────────────────────────────────────────────────────────────
// Two inks, because the two surfaces are no longer the same colour: `ui` is the
// copy, which sits on the deep blue ground, and `line` is every line in the 3D,
// which since the conception scene went white is only ever seen on white.
export const PALETTES = {
	warm: { label: 'warm', line: 0x2b3350, ui: [214, 214, 219] }
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
