// ── The deep ─────────────────────────────────────────────────────────────────
// The fly-in's air. Not a block colour: a CHANNEL, bright at the vanishing
// point and falling away to almost nothing at the corners, so the frame has a
// far end before a single object is drawn in it.
//
// That is the whole reason this exists. The fog can only take objects toward
// the ground colour; if the ground is one flat blue then the far distance is
// the same brightness as the near, and 250 world units of travel read as no
// travel at all. Darkening the periphery gives the fog somewhere to go.
//
// It takes the scene's own air as `color1`, so it walks from deep blue to white
// with the rest of the scene — and it opens out as it goes, because a blow-out
// that arrives as a white disc inside a dark vignette is a hole, not a flash.
export const DEEP = `
void main() {
	vec2 uv = vUv - 0.5;
	uv.x *= aspectRatio;
	float r = length(uv);

	// How lit the air is. At the end of the fly-in this runs to 1 and every
	// bit of shaping below is taken back out, leaving pure white.
	float lit = dot(color1, vec3(0.2126, 0.7152, 0.0722));
	// uFade takes the whole channel out as the fly-in arrives, so the last frame
	// of that scene is flat air and the conception can open on the same flat air
	// under a different shader without a seam. See store/store.js fieldFade.
	float shaped = (1.0 - smoothstep(0.34, 0.9, lit)) * uFade;

	// The far end of the channel.
	vec3 far = color1 * 0.13;

	// Two falloffs rather than one, so it reads as a throat you are looking
	// down: a wide halo for the body of the air, and a tight core at the
	// vanishing point that the egg comes up out of.
	float halo = exp(-r * r * 2.4);
	float core = exp(-r * r * 13.0);

	vec3 air = mix(far, color1, halo);
	air += color1 * core * 0.5;

	// Slow bands turning about the vanishing point. Barely there — they are
	// only what stops a still frame reading as a flat fill.
	float a = atan(uv.y, uv.x);
	float b1 = sin(a * 3.0 + uTime * 0.13) * 0.5 + 0.5;
	float b2 = sin(a * 7.0 - uTime * 0.09 + r * 5.0) * 0.5 + 0.5;
	air += color1 * b1 * b2 * halo * 0.16;

	gl_FragColor = vec4(mix(color1, air, shaped), 1.0);
}
`;
