// ── The rectangle to the disc, exactly ───────────────────────────────────────
// Jacobi's sn maps the rectangle [−K, K] × [0, K′] (modulus k, K = K(k),
// K′ = K(k′), k′² = 1 − k²) conformally onto the upper half plane: the
// bottom edge to [−1, 1], the sides to [1, 1/k] and [−1/k, −1], the top edge
// to the rest of the real line through ∞ (at the top's midpoint iK′). Its
// centre iK′/2 goes to i/√k, so the Cayley map centred there,
//
//     G(z) = i (sn z − i/√k) / (sn z + i/√k),
//
// takes the rectangle onto the unit disc with the centre at 0, the bottom
// edge's midpoint at −i and the top's at i. The aspect of the rectangle is
// 2K/K′, so one modulus k makes it the plate's golden rectangle (2φ × 2).
//
// All real-argument values come from the arithmetic–geometric mean (A&S
// 16.4, 17.6); the complex argument from the addition formulae (A&S 16.21).
// Pure functions, no DOM — log-genesis's conformal variant, and a node test.

// sn, cn, dn of a real u for the parameter m = k².
export function sncndn(u, m) {
	if (m < 1e-12) return [Math.sin(u), Math.cos(u), 1];
	const a = [1];
	const c = [Math.sqrt(m)];
	let b = Math.sqrt(1 - m);
	let n = 0;
	while (Math.abs(c[n]) > 1e-15 && n < 24) {
		a.push((a[n] + b) / 2);
		c.push((a[n] - b) / 2);
		b = Math.sqrt(a[n] * b);
		n++;
	}
	let phi = Math.pow(2, n) * a[n] * u;
	let phi1 = phi;
	for (let i = n; i > 0; i--) {
		phi1 = phi;
		phi = (phi + Math.asin((c[i] * Math.sin(phi)) / a[i])) / 2;
	}
	const sn = Math.sin(phi);
	const cn = Math.cos(phi);
	const dn = n ? cn / Math.cos(phi1 - phi) : 1;
	return [sn, cn, dn];
}

// K(m): the complete elliptic integral of the first kind, by the AGM.
export function ellipK(m) {
	let a = 1;
	let b = Math.sqrt(1 - m);
	for (let i = 0; i < 30 && Math.abs(a - b) > 1e-16; i++) {
		const an = (a + b) / 2;
		b = Math.sqrt(a * b);
		a = an;
	}
	return Math.PI / (2 * a);
}

// The modulus whose rectangle [−K, K] × [0, K′] has the aspect 2K/K′ = `aspect`.
export function modulusFor(aspect) {
	let lo = 1e-9;
	let hi = 1 - 1e-9;
	for (let i = 0; i < 80; i++) {
		const m = (lo + hi) / 2;
		const r = (2 * ellipK(m)) / ellipK(1 - m);
		if (r < aspect) lo = m;
		else hi = m;
	}
	return (lo + hi) / 2;
}

// sn, cn, dn at the complex point x + iy, each as [re, im].
export function sncndnC(x, y, m) {
	const [s, c, d] = sncndn(x, m);
	const [s1, c1, d1] = sncndn(y, 1 - m);
	const den = c1 * c1 + m * s * s * s1 * s1;
	return {
		sn: [(s * d1) / den, (c * d * s1 * c1) / den],
		cn: [(c * c1) / den, (-s * d * s1 * d1) / den],
		dn: [(d * c1 * d1) / den, (-m * s * c * s1) / den]
	};
}

// The map of the rectangle onto the disc: a rectangle W × H (plate units,
// centred on the origin) → { to(x, y) → [w_re, w_im, G′_re, G′_im] }.
export function rectToDisc(W, H) {
	const m = modulusFor(W / H);
	const K = ellipK(m);
	const Kp = ellipK(1 - m);
	const a = 1 / Math.sqrt(Math.sqrt(m)); // 1/√k
	const kx = (2 * K) / W;
	const ky = Kp / H;
	// G = i (S − ia)/(S + ia): with S = p + iq, S − ia = p + i(q − a), S + ia = p + i(q + a).
	const to = (x, y) => {
		const X = x * kx;
		const Y = (y + H / 2) * ky;
		const { sn, cn, dn } = sncndnC(X, Y, m);
		const nr = sn[0];
		const ni = sn[1] - a;
		const dr = sn[0];
		const di = sn[1] + a;
		const dd = dr * dr + di * di;
		// (n / d), then × i.
		const qr = (nr * dr + ni * di) / dd;
		const qi = (ni * dr - nr * di) / dd;
		const wr = -qi;
		const wi = qr;
		// G′ = i · 2ia / (S + ia)² · cn · dn · (dz/dx scale): d/dz of the
		// map in plate units — the rectangle's own coordinate is kx·x, so
		// the derivative with respect to plate x carries kx.
		const d2r = dr * dr - di * di;
		const d2i = 2 * dr * di;
		const d2 = d2r * d2r + d2i * d2i;
		// 2ia / (S + ia)² = 2ia · conj(d²)/|d²|²
		const tr = (-2 * a * -d2i) / d2; // 2ia · conj(d2): (0 + 2a i)(d2r − i d2i) = 2a d2i + i 2a d2r
		const ti = (2 * a * d2r) / d2;
		// × i
		const ur = -ti;
		const ui = tr;
		// × cn·dn
		const cdr = cn[0] * dn[0] - cn[1] * dn[1];
		const cdi = cn[0] * dn[1] + cn[1] * dn[0];
		const gr = (ur * cdr - ui * cdi) * kx;
		const gi = (ur * cdi + ui * cdr) * kx;
		return [wr, wi, gr, gi];
	};
	return { m, K, Kp, a, kx, ky, to };
}

// z with G(z) = target, by Newton from z0 (plate units); the rectangle W × H.
export function invert(G, W, H, tr, ti, z0, iters = 8) {
	let x = z0[0];
	let y = z0[1];
	for (let i = 0; i < iters; i++) {
		const [wr, wi, gr, gi] = G.to(x, y);
		const er = wr - tr;
		const ei = wi - ti;
		const g2 = gr * gr + gi * gi;
		if (!(g2 > 1e-30) || !Number.isFinite(g2)) break;
		// step = e / G′
		let sx = (er * gr + ei * gi) / g2;
		let sy = (ei * gr - er * gi) / g2;
		// Kept inside the rectangle: a step past its edge is damped.
		let nx = x - sx;
		let ny = y - sy;
		for (let k = 0; k < 6 && (Math.abs(nx) > W / 2 || Math.abs(ny) > H / 2); k++) {
			sx *= 0.5;
			sy *= 0.5;
			nx = x - sx;
			ny = y - sy;
		}
		x = nx;
		y = ny;
		if (er * er + ei * ei < 1e-24) break;
	}
	return [x, y];
}
