// A block colour, taken from color1 — which the Stage feeds from the scene's own
// backdrop colour. The fly-in uses this: its air already walks from deep blue to
// white over the scene, and the field would only fight the fog.
//
// It is a shader rather than a clear colour so that the fly-in has the same slot
// as the other two and can be given a real field later without touching the
// Stage or the scene.
export const FLAT = `
	void main() {
		gl_FragColor = vec4(color1, 1.0);
	}
`;
