import { writable, derived, get } from 'svelte/store';

// ── Site accent ──────────────────────────────────────────────────────────────
// One palette, monochrome. `line` drives every line in the 3D scene
// (icosahedron, golden rectangles, spiral, sperm hologram); `ui` is the UI text
// colour, pushed into CSS custom properties by applyCssVars().
//
// Deliberately no gold: the old amber accent is gone from both the 3D work and
// the CSS, and the two used to disagree anyway (CSS said #f0f0a0, the palette
// said #d2d2d2), which is why the site read as two different builds at once.
export const PALETTES = {
	mono: { label: 'mono', line: 0xd6dbe0, ui: [214, 219, 224] }
};

export const DEFAULT_PALETTE = 'mono';

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

// Push the UI colour into CSS custom properties. Everything in styles.css is
// expressed as rgba(var(--fg-rgb), α), so this single triple recolours the whole
// interface — no hard-coded channel values left anywhere in the stylesheets.
export function applyCssVars(p) {
	if (typeof document === 'undefined') return;
	const [r, g, b] = p.ui;
	document.documentElement.style.setProperty('--fg-rgb', `${r}, ${g}, ${b}`);
}
