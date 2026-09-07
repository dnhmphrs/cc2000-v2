// ── Tuning ───────────────────────────────────────────────────────────────────
// The background the computation searches against: several decades of ground at
// once, torn into bands and shot through with grain, like a set being tuned
// across channels rather than sitting on one.
//
// uFlare drives the whole thing, and the computation already publishes it —
// rising through the search and falling away over the fall into the room. So it
// tunes IN as the search starts and settles onto the answer's own ground as the
// camera lands, with nothing here having to know that is what is happening.
//
// At uFlare 0 this is exactly color1, which is the plain ground. Nothing to
// switch off.
export const STATIC = `
float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
	// The picture rolls, the way a mistuned tape does.
	float roll = fract(uTime * 0.11);
	vec2 uv = vec2(vUv.x, fract(vUv.y + roll));

	// Whole scan lines displaced sideways. Quantised to a band so it tears in
	// strips rather than smearing — a smear reads as blur, a strip reads as
	// broken sync.
	float band = floor(uv.y * 44.0);
	float jitter = (hash(vec2(band, floor(uTime * 8.0))) - 0.5) * 0.3 * uFlare;

	// Grain, coarse enough to survive the quarter-scale buffer this draws into.
	float n = hash(floor(vec2(uv.x * 200.0 + jitter * 200.0, band)) + floor(uTime * 22.0));

	// The other two stops, banded rather than blended: the point is to read as
	// several backgrounds at once, and a gradient between them reads as one.
	vec3 era = mix(color2, color3, step(0.5, hash(vec2(band, 7.0))));
	vec3 tuned = mix(era, vec3(n), 0.5);

	// And the odd blown-out line where the tracking gives up altogether.
	float tear = smoothstep(0.88, 1.0, hash(vec2(band, floor(uTime * 3.0))));
	tuned = mix(tuned, vec3(1.0), tear * 0.55);

	// Never quite all the way over. At a full 1 the peak of the search is a wall
	// of static and the rooms — the thing this scene exists to show you — are
	// behind it rather than in front of it. This is the one dial for how loud it
	// gets; the envelope itself is the scene's.
	gl_FragColor = vec4(mix(color1, tuned, uFlare * 0.85), 1.0);
}
`;
