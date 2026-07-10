import { writable, derived, get } from 'svelte/store';

// ── Site accent palettes ────────────────────────────────────────────────────
// `line` drives every gold line in the 3D scenes (icosahedron, golden
// rectangles, spiral); `ui` is the UI text colour (CSS --fg). Swap the default
// below, or flip live in the dev panel. Kept deliberately easy to extend.
export const PALETTES = {
	gold: { label: 'gold', line: 0xc2a133, ui: [240, 240, 160] }
};

export const DEFAULT_PALETTE = 'gold';

// ── Stores ───────────────────────────────────────────────────────────────────
export const paletteKey = writable(DEFAULT_PALETTE);
export const palette = derived(paletteKey, (k) => PALETTES[k] || PALETTES[DEFAULT_PALETTE]);

// Accent as a THREE-friendly hex number for the 3D line-work.
export const accentHex = derived(palette, (p) => p.line);

// ── Helpers ──────────────────────────────────────────────────────────────────
// Accent as normalised rgb floats (for shader / per-frame colour work).
export function accentRGB() {
	const hex = get(accentHex);
	return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

// Push the UI text colour into CSS custom properties.
export function applyCssVars(p) {
	if (typeof document === 'undefined') return;
	const [r, g, b] = p.ui;
	const root = document.documentElement.style;
	root.setProperty('--fg', `rgba(${r}, ${g}, ${b}, 1)`);
	root.setProperty('--fg-dim', `rgba(${r}, ${g}, ${b}, 0.85)`);
	root.setProperty('--fg-faint', `rgba(${r}, ${g}, ${b}, 0.5)`);
}
