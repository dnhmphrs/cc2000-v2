// ── The Riemann theta field ──────────────────────────────────────────────────
// Used as supplied, with three changes that were needed to compile or to run:
//
//   1. `mat3(sinX,0,0, 0,cosY,0, 0,0,(vUv))` has ten components — vUv is a vec2
//      — and will not compile. The third diagonal entry is 1.0.
//   2. tanh() is not in GLSL ES 1.00. hTanh() from the prelude does the same.
//   3. N. See below — this is the only number here worth touching.
//
// `z` is rotated by uRot before the series is evaluated, so the field can be
// carried by whatever the scene is doing. The computation feeds it the
// icosahedron's own attitude, which turns the background with the solid.
//
// COST. The series is (2N+1)^3 iterations of a tan() PER FRAGMENT. At the N=5 it
// arrived with that is 1331, and on a 1080p screen even at the quarter-scale
// backing buffer this component drops to it, that is ~170 million tan() calls a
// frame — it does not run. N=2 is 125 iterations and holds frame rate; N=3 is
// 343 and is the most that stayed smooth here. The figure coarsens as N drops
// but keeps its character, because the low-order terms dominate.
export const THETA = `
mat3 createDynamicOmega(vec2 m) {
	float sinX = hTanh(3.14159 * log(abs(m.x) + 1e-4));
	float cosY = hTanh(3.14159 * log(abs(m.y) + 1e-4));

	return mat3(
		sinX, 0.0, 0.0,
		0.0, cosY, 0.0,
		0.0, 0.0, 1.0
	);
}

const int N = 2;

float riemannThetaReal(vec3 z, mat3 Omega) {
	float sum = 0.0;

	for (int n1 = -N; n1 <= N; ++n1) {
		for (int n2 = -N; n2 <= N; ++n2) {
			for (int n3 = -N; n3 <= N; ++n3) {
				vec3 n = vec3(float(n1), float(n2), float(n3));

				float nt_Omega_n = dot(n, Omega * n);
				float nt_z = 2.0 * dot(n, z);

				float exponent = 3.14159 * (nt_Omega_n + nt_z);
				sum += tan(exponent);
			}
		}
	}

	return sum;
}

void main() {
	float x = vUv.x * 0.5 - 0.25;
	float y = vUv.y * 0.5 - 0.25;

	mat3 OmegaDynamic = createDynamicOmega(mouse);

	// Turn the SAMPLING PLANE, and keep the static third component the series was
	// written around. Rotating vec3(x, y, 1.0) whole folds that constant into x
	// and y, which multiplies the frequency of the tan() and collapses the figure
	// into aliased noise the moment anything turns.
	vec3 turned = uRot * vec3(x, y, 0.0);
	vec3 z = vec3(turned.x, turned.y, 1.0);

	float thetaValueReal = riemannThetaReal(z, OmegaDynamic);
	float normalizedTheta = 0.5 + 0.5 * thetaValueReal;

	// NOTE: as supplied, gradient1 mixes color1 with itself and is therefore
	// just color1 — color2 and color3 never reach the output. Left as it is;
	// point either end of the mix at color2 to bring the other stops in.
	vec3 gradient1 = mix(color1, color1, normalizedTheta);
	vec3 gradient2 = mix(-color1, gradient1, 0.5 + 0.5 * hTanh(normalizedTheta));

	gl_FragColor = vec4(gradient2, 1.0);
}
`;
