import { writable, derived, get } from 'svelte/store';
import { ICOSA_INK, INK } from '$lib/config';

// ── Ink ──────────────────────────────────────────────────────────────────────
// Two surfaces, two inks, because they are no longer the same colour:
//
//   ui    the copy, which sits on the deep blue ground
//   line  every line in the 3D, which since the conception went white is only
//         ever seen on white
//
// Both come from config/palette.js; this file is only the store plumbing that
// lets them be swapped at runtime.
export const PALETTES = {
	warm: { label: 'warm', line: ICOSA_INK.line, ui: INK.onDark }
};

export const DEFAULT_PALETTE = 'warm';

export const paletteKey = writable(DEFAULT_PALETTE);
export const palette = derived(paletteKey, (k) => PALETTES[k] || PALETTES[DEFAULT_PALETTE]);

// Ink as a THREE-friendly hex number for the 3D line-work.
export const accentHex = derived(palette, (p) => p.line);

export function accentRGB() {
	const hex = get(accentHex);
	return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

// Everything in styles.css is rgba(var(--ink-rgb), a), so this one triple
// recolours the whole interface.
export function applyCssVars(p) {
	if (typeof document === 'undefined') return;
	const hex = p.ui.replace('#', '');
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
	document.documentElement.style.setProperty('--ink-rgb', `${r}, ${g}, ${b}`);
}
