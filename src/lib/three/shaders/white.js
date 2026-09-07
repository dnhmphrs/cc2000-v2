// Plain white. The spare — point a scene at 'white' when a shader is being
// swapped out or is misbehaving, and the run still looks deliberate.
export const WHITE = `
	void main() {
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
`;
