import { writable, derived, get } from 'svelte/store';

// ── Site accent palettes ────────────────────────────────────────────────────
// `line` drives every gold line in the 3D scenes (icosahedron, golden
// rectangles, spiral); `ui` is the UI text colour (CSS --fg). Swap the default
// below, or flip live in the dev panel. Kept deliberately easy to extend.
export const PALETTES = {
	gold:  { label: 'gold',   line: 0xc2a133, ui: [240, 240, 160] }, // original
	bone:  { label: 'bone',   line: 0xdcd3bd, ui: [233, 228, 214] }, // warm off-white / chalk
	mint:  { label: 'mint',   line: 0x5fe0c8, ui: [200, 240, 232] }, // aqua — cool contrast
	lime:  { label: 'lime',   line: 0xcaec4a, ui: [226, 238, 196] }, // acid lime
	pearl: { label: 'pearl',  line: 0xf2eefc, ui: [238, 235, 246] }, // luminous cool white
	bronze:{ label: 'bronze', line: 0xb98a55, ui: [223, 206, 176] }, // desaturated metallic
	slate: { label: 'slate',  line: 0x93b1c6, ui: [210, 224, 233] }, // cool blueprint blue
	clay:  { label: 'clay',   line: 0xcd7f5a, ui: [232, 205, 190] }  // warm terracotta
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
