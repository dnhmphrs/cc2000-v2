// ── |ζ(½ + it)|, the critical line ──────────────────────────────────────────
// The modulus of the zeta function along the critical line, as a number and as
// a table. This is what the RECORD is cut with: every groove in the run — on
// the way home, at the tunnel's end, between the rooms and down the tunnel's
// wall (three/tsl/zeta.js) — is a spiral whose radius wobbles by |ζ(½ + it)|
// with t running along the groove, so the grooves pinch to their base at every
// zero and swell between them. A polar plot of the critical line, cut as a
// record. The zeros themselves are in data/zetaZeros.js, for the wave.
//
// Euler–Maclaurin, in the complex plane:
//
//   ζ(s) = Σ_{n<N} n^{−s} + N^{1−s}/(s−1) + N^{−s}/2
//        + Σ_{k=1}^{m} B_{2k}/(2k)! · s(s+1)…(s+2k−2) · N^{−s−2k+1}
//
// with N past |t|/π so the tail converges fast. Accurate to well under 1e-6
// out to t of a few thousand, which is more than a picture needs; checked
// against the first 120 zeros (they land within 1e-4) and |ζ(½)| = 1.4603545.

const B2K = [
	1 / 6,
	-1 / 30,
	1 / 42,
	-1 / 30,
	5 / 66,
	-691 / 2730,
	7 / 6,
	-3617 / 510,
	43867 / 798,
	-174611 / 330
];
const FACT = (() => {
	const f = [1];
	for (let i = 1; i <= 22; i++) f[i] = f[i - 1] * i;
	return f;
})();

// ζ(½ + it) as [re, im].
export function zetaHalf(t) {
	const sr = 0.5;
	const si = t;
	const N = Math.max(40, Math.ceil(Math.abs(t) / Math.PI) + 10);
	let re = 0;
	let im = 0;
	// n^{−s} = n^{−½}·(cos(t ln n) − i sin(t ln n))
	for (let n = 1; n < N; n++) {
		const ln = Math.log(n);
		const a = 1 / Math.sqrt(n);
		re += a * Math.cos(t * ln);
		im -= a * Math.sin(t * ln);
	}
	const lnN = Math.log(N);
	// N^{1−s}/(s−1): N^{1−s} = √N·e^{−it ln N}, s−1 = −½ + it
	{
		const mr = Math.sqrt(N) * Math.cos(t * lnN);
		const mi = -Math.sqrt(N) * Math.sin(t * lnN);
		const dr = sr - 1;
		const di = si;
		const dd = dr * dr + di * di;
		re += (mr * dr + mi * di) / dd;
		im += (mi * dr - mr * di) / dd;
	}
	// N^{−s}/2, and the Bernoulli terms: c_k = B_{2k}/(2k)! · (s)_{2k−1} · N^{−s−2k+1}
	let nr = Math.cos(t * lnN) / Math.sqrt(N); // N^{−s}
	let ni = -Math.sin(t * lnN) / Math.sqrt(N);
	re += nr / 2;
	im += ni / 2;
	// (s)_{j}: the rising factorial, built up as k goes
	let pr = 1;
	let pi = 0;
	let j = 0;
	// N^{−s−2k+1} = N^{−s} · N^{−(2k−1)}
	for (let k = 1; k <= B2K.length; k++) {
		// extend the rising factorial to 2k−1 factors: multiply by (s + j) for j up to 2k−2
		while (j <= 2 * k - 2) {
			const fr = sr + j;
			const fi = si;
			const r2 = pr * fr - pi * fi;
			const i2 = pr * fi + pi * fr;
			pr = r2;
			pi = i2;
			j++;
		}
		const c = B2K[k - 1] / FACT[2 * k];
		const scale = c * Math.pow(N, -(2 * k - 1));
		// term = scale · (pr + i pi) · (nr + i ni)
		re += scale * (pr * nr - pi * ni);
		im += scale * (pr * ni + pi * nr);
	}
	return [re, im];
}

export function zetaAbs(t) {
	const [re, im] = zetaHalf(t);
	return Math.hypot(re, im);
}

// The table: |ζ(½ + it)| for t in [0, tMax], `samples` of it, and its
// maximum. three/tsl/zeta.js puts it in a texture.
export function zetaTable(tMax = 500, samples = 8192) {
	const values = new Float32Array(samples);
	let zMax = 0;
	for (let i = 0; i < samples; i++) {
		const t = (i / (samples - 1)) * tMax;
		const v = zetaAbs(t);
		values[i] = v;
		if (v > zMax) zMax = v;
	}
	return { values, zMax, tMax, samples };
}
