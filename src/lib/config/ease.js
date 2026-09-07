// ── Easing and window maths ──────────────────────────────────────────────────
// The small vocabulary every scene animates in. Nothing here knows about the
// site; it is just the shapes.

export function clamp01(v) {
	return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}

// Progress 0..1 through a [from, to] window of a 0..1 scene progress. This is
// how every keyframe in config/timing.js is read.
export function span(p, [from, to]) {
	if (to <= from) return p >= to ? 1 : 0;
	return clamp01((p - from) / (to - from));
}

// Same, but for a window given as [from, to] in SECONDS.
export function spanSec(t, from, to) {
	return span(t, [from, to]);
}

export function smoothstep(a, b, x) {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
}

export function smootherstep(t) {
	const x = clamp01(t);
	return x * x * x * (x * (x * 6 - 15) + 10);
}

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInCubic = (t) => Math.pow(clamp01(t), 3);
export const easeOutQuint = (t) => 1 - Math.pow(1 - clamp01(t), 5);

// Accelerate away from rest at `power`, then ease onto the end. `power` above 1
// spends longer building up; below 1 it leaves the gate hard. This is the shape
// a camera makes when it sets off toward something and pulls up at it.
export function easeInOutPower(t, power = 2) {
	const x = clamp01(t);
	const a = Math.pow(x, power);
	return a / (a + Math.pow(1 - x, power));
}

// One-sided version: rest → flat out. What something accelerating away from you
// does when nothing stops it.
export function accelerate(t, power = 2) {
	return Math.pow(clamp01(t), power);
}

// A soft pulse that rises and falls once over 0..1.
export function bump(t) {
	return Math.sin(clamp01(t) * Math.PI);
}
