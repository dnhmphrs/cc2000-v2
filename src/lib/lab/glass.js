import { Fn, Discard, texture, vec3, vec4, max, abs } from 'three/tsl';

// ── The glass, per decade ────────────────────────────────────────────────────
// Every decade's monitor is drawn with its glass painted ONE flat colour,
// measured off the artwork: the 50s set is a see-through frame (alpha 0), the
// 60s a flat yellow, the 90s black, the 10s a flat blue, ±12/255. A fragment
// that keeps only those pixels turns the screen sprite into a hole — the
// stencil quad in the descent, the window onto a room in the approach.
export const GLASS_KEY = {
	'50s': { alpha: true },
	'60s': { rgb: [252 / 255, 254 / 255, 143 / 255] },
	'90s': { rgb: [0, 0, 0] },
	'10s': { rgb: [44 / 255, 78 / 255, 150 / 255] }
};
const KEY_TOL = 14 / 255;
// The sampler hands back LINEAR values for an sRGB-tagged texture, so the key
// is tested in both spaces and either match keeps the pixel.
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

// A fragment function that DISCARDS everything but the glass of `tex`, the
// decade's screen drawing. What it returns is irrelevant; use it with
// colorWrite off for a stencil, or as-is for a mask.
export const glassOnly = (decade, tex) => {
	const key = GLASS_KEY[decade];
	return Fn(() => {
		const c = texture(tex);
		if (key.alpha) {
			Discard(c.a.greaterThan(0.5));
		} else {
			const d = abs(c.rgb.sub(vec3(...key.rgb)));
			const dl = abs(c.rgb.sub(vec3(...key.rgb.map(toLinear))));
			const off = max(d.x, max(d.y, d.z)).greaterThan(KEY_TOL);
			const offLinear = max(dl.x, max(dl.y, dl.z)).greaterThan(KEY_TOL * 1.5);
			Discard(c.a.lessThan(0.5).or(off.and(offLinear)));
		}
		return vec4(0, 0, 0, 1);
	});
};

// The opposite: the screen drawing with its glass cut OUT, so whatever is
// behind shows through it.
export const glassCut = (decade, tex) => {
	const key = GLASS_KEY[decade];
	return Fn(() => {
		const c = texture(tex);
		if (key.alpha) {
			Discard(c.a.lessThan(0.5));
		} else {
			const d = abs(c.rgb.sub(vec3(...key.rgb)));
			const dl = abs(c.rgb.sub(vec3(...key.rgb.map(toLinear))));
			const on = max(d.x, max(d.y, d.z)).lessThan(KEY_TOL);
			const onLinear = max(dl.x, max(dl.y, dl.z)).lessThan(KEY_TOL * 1.5);
			Discard(c.a.lessThan(0.5).or(on).or(onLinear));
		}
		return c;
	});
};
