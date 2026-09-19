import { writable, derived, get } from 'svelte/store';
import * as THREE from 'three';
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

// ── Colour management: OFF, on purpose, for now ──────────────────────────────
// three has shipped with ColorManagement ENABLED since r152: `new Color(hex)`
// treats the hex as sRGB and converts it to the linear working space on the
// spot. This site was written against r148, where it was disabled and a Color
// held exactly the number it was given — and every one of its ~900 lines of
// shader depends on that: a colour handed to a ShaderMaterial uniform is the
// colour that lands on the screen, because ShaderMaterial output is never
// re-encoded (see world/materials.js, "ENCODING").
//
// Under the modern default every such uniform would arrive a full gamma stop
// DARK, and ink() below — which converts by hand — would convert twice. So the
// flag is put back the way r148 had it, here, in the one module every scene
// imports before it constructs a colour (the scenes mount after Stage, whose
// script has already pulled this in). In r186 a disabled ColorManagement makes
// convert() a no-op (src/math/ColorManagement.js), and textures still decode
// by their own colorSpace, which is what keeps the room artwork the same.
//
// This is the TOOLCHAIN commit's choice, not the rebuild's. WebGPURenderer's
// output pass colour-converts EVERY material, custom ones included, so the
// port to TSL has to flip this on and move the site to linear working colour
// as it goes. Until then: same numbers, same pixels.
THREE.ColorManagement.enabled = false;

// A THREE.Color ready to hand to a BUILT-IN material.
//
// With ColorManagement off, a colour set on a LineBasicMaterial is used as
// LINEAR and then encoded to sRGB on output — it comes out a full gamma stop
// brighter and washed out. Custom ShaderMaterials are the opposite case: they
// are never re-encoded (see world/materials.js), so their colours are handed
// over raw. Anything on a STOCK material goes through here, or the same gold
// is two different colours in the same drawing.
export function ink(hex) {
	return new THREE.Color(hex).convertSRGBToLinear();
}

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
