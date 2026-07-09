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

// ── Silk background palettes ─────────────────────────────────────────────────
// Three roles map onto the silk shader: `a` and `b` are the two silk hues it
// folds between, `sheen` is the drifting highlight. Tuned to read subtly over
// the #1b1b1b page. Alternates live here — add your own freely.
export const SILK_PALETTES = {
	lilac:  { label: 'lilac',  a: '#6a4cc4', b: '#d8809d', sheen: '#faf8f0' }, // original silk
	// Bold retro-cartoon / web1 picks — strong, saturated, a bit of magic:
	web1:   { label: 'web1',   a: '#1d3fd6', b: '#ffcf1a', sheen: '#ffffff' }, // electric blue ⇄ yellow
	comic:  { label: 'comic',  a: '#2a5cff', b: '#ffe14d', sheen: '#ff4d6d' }, // cartoon blue/yellow + pop
	magic:  { label: 'magic',  a: '#4922b0', b: '#ffd447', sheen: '#57e0ff' }, // violet ⇄ gold, cyan spark
	sunset: { label: 'sunset', a: '#2438a8', b: '#ff8a3d', sheen: '#ffe36b' }, // deep blue ⇄ orange
	// Neutral / muted:
	taupe:  { label: 'taupe',  a: '#262428', b: '#3a3630', sheen: '#6b6152' },
	slate:  { label: 'slate',  a: '#1d232a', b: '#2c3a44', sheen: '#93b1c6' },
	sage:   { label: 'sage',   a: '#232a24', b: '#35422f', sheen: '#8fae7f' }
};

export const DEFAULT_SILK = 'lilac';

// ── Stores ───────────────────────────────────────────────────────────────────
export const paletteKey = writable(DEFAULT_PALETTE);
export const palette = derived(paletteKey, (k) => PALETTES[k] || PALETTES[DEFAULT_PALETTE]);

// Accent as a THREE-friendly hex number for the 3D line-work.
export const accentHex = derived(palette, (p) => p.line);

// Silk on/off + which silk palette. Off by default.
export const silkOn = writable(false);
export const silkKey = writable(DEFAULT_SILK);

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
