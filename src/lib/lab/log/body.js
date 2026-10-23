// ── The body: the swimmer as a 3D body of rings ──────────────────────────────
// The swimmer every v5 flow uses from "compiling" on, lifted out of
// swimmer/rings.js: STATIONS from the nose to the tip, each a closed SECTION
// (a ring), joined by GENERATRICES (the curve of one section angle φ down the
// body), the CONTOUR bold (where the surface turns from the lens); hidden
// lines by a software depth buffer of the body's own skin (near lines bold,
// far ones faint and dashed, or gone), as rings.js draws it, in chalk on the
// board. Drawn on the 2D board through board.js's camera3.
//
//   import { makeBody, specOf, rosetteSection, BODY } from './log/body.js';
//   const spec = specOf({ date: 'DDMMYYYY', spice: 1…10 }, { section, sectionAlong })
//                            the person's body (below); deterministic
//   const body = makeBody(spec)
//   body.stations            [{ s, a, b, part, ring, cap }] nose (s = 0) to tip;
//                            a, b the half-width, half-thickness (body units);
//                            part 'head' | 'neck' | 'mid' | 'tail'; ring: drawn
//                            as a ring; cap: the acrosome's edge
//   body.rings               the station indices drawn as rings, nose → tip
//   body.parts               { head: [s0, s1], neck, mid, tail } along s
//   body.length, body.M      nose to tip; samples round a section
//   const shape = body.shape(t, { beat = 1, phase, roll, form = 1 })
//                            the body at time t (s), LOCAL coords: nose at the
//                            origin, heading +x, y up (the head's thickness),
//                            z across (its broad face, the beat's plane):
//                            centreline points and frames per station. beat
//                            0…1 brings the wave in from the neck to the tip
//                            (0 = straight, as built); phase / roll (radians)
//                            override the clock's; form 0…1 the ellipse (0)
//                            to the spec's section (1)
//   const pose = { at, dir, up, scale }                 free: nose at `at`,
//                            heading `dir`, `up` its top (default [0, 1, 0]),
//                            `scale` world units to the body's (default 1)
//   const pose = { path: (σ) => [x, y, z], sigma, up, scale }
//                            or laid along a path it has swum, nose at arc σ,
//                            each station at the path's point that far back
//                            (σ in world units; `up` a vector or σ → vector).
//                            `up` along the heading (a body pointed straight
//                            up or down) falls back to the world axis least
//                            along it — not flat, but a path that turns
//                            through `up` flips its frame there: give it
//                            `up` as σ → vector
//   body.draw(ctx, cam, shape, pose, {
//     rings = 1,      0…1 how many rings are drawn, nose → tip (a build in
//                     progress: the last one written round from the top)
//     ringFrom = 0,   …or from this fraction (a build tip → nose: rings = 1,
//                     ringFrom 1 → 0)
//     gens = 1,       0…1 how far the generatrices are written, nose → tip
//                     (or (j, G) → 0…1, each its own, to write them in turn)
//     contour = 1,    0…1 how far the bold contour is written, nose → tip;
//                     where the body is under ~3 px across it is the THREAD,
//                     the centreline as wide as the body (so at ~40 px long
//                     the swimmer is a head and a whole wavy tail)
//     alpha = 1, width = 1, back = 0.18,   back: alpha of hidden lines (0: gone);
//                     all of it under the context's own globalAlpha
//     depth = null,   a makeDepth buffer to test against too (a tunnel's), or
//                     anything with .hidden([x, y, z]); the body always hides
//                     its own far side, and its own slack applies, so the
//                     buffer the body itself was just filled into is harmless
//     color = PAL.chalk, axis = 0 (the centreline, faint, 0…1 its alpha),
//     pens = true (a chalk point where a line is being written)
//   })                       → { box: [x0, y0, x1, y1] } on the board
//   body.fillDepth(Z, cam, shape, pose)   the body into a depth buffer (space.js
//                            makeDepth, reset this frame), so a tunnel or an
//                            object can be hidden behind it
//   body.nose(shape, pose), body.tip(shape, pose)   world points
//   body.at(shape, pose, s)  the centreline's world point at s
//   body.ring(shape, i, pose, n = M)   station i's ring, a closed world polyline
//                            of n + 1 points from the top of the section (for
//                            flows that draw their own build)
//
// THE SPEC (specOf): every person's swimmer a little their own, always
// unmistakably a sperm. d0…d7 the date's digits (DD MM YYYY; a digit not yet
// typed counts as the middle, 4.5 — the day's tens 1.5), ν(d) = (d − 4.5)/4.5, Σ the
// digits' sum, n the spice (5.5 if not yet given; fractional while dragged):
//   head length     5 (1 + 0.08 ν(d1))      the day's units
//   head width      3 (1 + 0.08 ν(d3))      the month's units
//   head thickness  1.5 (1 + 0.08 ν(d6))    the year's tens
//   midpiece        4 (1 + 0.08 ν(d7)) long, the year's units;
//                   1 (1 + 0.08 (d0 − 1.5)/1.5) thick, the day's tens
//   tail            42 + 8 ((d1 + d6 + d7) mod 10)/9 long   (42…50)
//   wavelength      24 + 1.5 (Σ mod 9)      (24…36)
//   tip amplitude   0.6 + 0.05 (Σ mod 7) rad (0.6…0.9); at the neck 0.16
//   helicity        0.15 + 0.15 (month − 1)/11, the out-of-plane share of the
//                   wave, in quadrature (0.15…0.3)
//   beat            2 + 0.35 n Hz (2.35…5.5)
//   roll            0.2 + 0.04 n turns a second (0.24…0.6)
//   phase           2π day/31, where the wave stands at t = 0
// spec.coeffs lists them in that order, { key, value, from } (from: the
// digits' indices read, or 'spice'), for a flow that shows them being made.
// `extra.section` overrides the section (default the ellipse);
// `extra.sectionAlong(s, part, parts) → 0…1` how much of it each station
// takes (default BODY.sectionAlong: all of it to the end of the midpiece,
// none past the flagellum's first 6 units, which stays a round thread).
//
// SECTIONS: section(i, φ) → [u, v], the ring's point at angle φ in units of
// the station's (a, b) — u across, v through the thickness; the ellipse is
// [cos φ, sin φ]. Rings and generatrices sample φ at the same M angles (the
// rings from a table `BODY.fine` times finer), so a generatrix is the curve of
// one φ down the body. A section may carry .M (samples round), .gens (how
// many generatrices; M is made a multiple of it) and .uniform (true: the same
// at every station, one table).
// rosetteSection(rosette, amount, { M }) is the epicycle intro's figure as a
// section:
// `rosette` is intro/epicycle.js's rosette(digits, spice) ({ r, f, at }),
// `amount` 0…1 blends the ellipse into it, (1 − a)e^{iφ} + a·z(φ), normalised
// so its extent is 1 (the head flattens it as it flattens an ellipse). Its
// arms all turn at f ≡ 1 (mod n), so the blend is e^{iφ}·((1 − a) + a Σ r_k
// e^{i n s_k φ}): one lobe per n round the body, and it winds once (a simple
// flower) while a < 1/(2(1 − r₀)) — for the demo's date about 0.6 — and past
// that the user's figure itself, self-crossing; kept as it is. Its
// generatrices run down the petals: at a whole spice n ≥ 5 one down every tip
// and every valley (2n), else a multiple of n near 12; M is three samples to
// a turn of its fastest visible arm (70 for the demo at 0.35, 98 at 1).
//
// The beat: a travelling wave of the flagellum's TANGENT angle, β(s, t) =
// Θ(s) sin(k(s − s₀) − ωt − φ₀) in the head's broad plane and helicity ×
// Θ(s) cos(…) out of it, Θ growing linearly from the neck to the tip, k = 2π/λ;
// integrated, so the tail keeps its length; then the whole turned about the
// nose so its mean axis (the principal axis of the centreline, weighted by
// length, the head twice) is the heading — which is what yaws the head
// against the tail, the tip swinging widest; the roll turns it all about the
// heading.
//
// Cost, headless 1280 × 800 (median ms of script a frame, fillDepth + draw,
// the machine shared): the ellipse 1–2.5 (0.5 at ~40 px long); the rosette at
// 0.35 2–2.5 seen from behind or followed, 2.5–4.5 with the body ~600 px long,
// 1–1.5 at ~40 px, 4.5–6 with the head filling the frame or the lens beside
// the neck; spice 10 at 0.35 about a fifth more; the full figure (amount 1)
// 3.5–7, ~3 even at 40 px (the grid is projected whole), ~10–12 close — for
// a moment, not for the swim. A ring-by-ring build re-rasterises the skin built so far each
// frame (+1–2 ms close). shape() 0.1, makeBody 1–3 (cheap enough to remake
// while the answers are typed). How: ~85 stations × M round, projected once a
// frame and cached for a second call with the same shape (object), pose (by
// value) and camera (object) — fillDepth then draw rasterises the skin once;
// only its front faces, into a
// quarter-resolution buffer, at a stride keeping chords ~10 px; rings in
// chords of ~9 px from the fine table; segments cut to ~12 px for the hidden
// test and the alike pieces joined again; strokes batched by alpha and width
// into a few dozen paths. The canvas's own cost is the stroked LENGTH: the
// body is ~5–15k px of line; a full-screen tunnel round it can be 50–100k.
//
// PITFALLS. `cam` is a board.js camera3 (pos, f, r, u, project — not the
// fall's returned lens); never mutate one in place (the projection is cached
// by its identity), make a new one when the lens moves. The coordinates are
// the board's: a ctx.translate / ctx.scale (flow-conception's shift of the
// swimmer to the fall's vanishing point) is allowed for, but a `depth` passed
// in must be in the coordinates the body is drawn in. `pose.scale`: the body
// is 52–61 units long (body.length); the beat and the roll are on t, so a
// flow that brings the swimmer to life passes phase/roll on an eased clock
// (genome.js: phase = 2π hz·eased(t − t₀) + spec.beat.phase) or the wave
// starts mid-swing. Finished rings under 3 px fade out as `gens` or `contour`
// comes on (under 1 px always: a build of a far tail is beads, then thread);
// hidden lines at `back` are dashed, which the canvas pays for — back 0 drops
// them. The lens inside the body drops what is behind it (z ≤ 0.05), and what
// passes right by the lens is drawn as big as it is. The centreline is a
// polyline of stations ~1.1 apart down the tail: closer than ~30 px a unit
// (the lens a few units off the tail) its bends show as facets.

import { PAL, TAU, span, smooth, lerp, clamp01 } from './board.js';
import { NEAR } from './space.js';

export const BODY = {
	head: [5, 3, 1.5], // length, width, thickness
	broad: 0.42, // the head is broadest this far back, of its length
	thickest: 0.62, // … and thickest
	cap: 0.675, // the acrosome's edge, of the head's length
	lip: 0.07, // how proud the acrosome stands
	neck: [0.42, 0.34], // the radius at the head's base, and at the waist
	mid: [4, 1], // the midpiece: length, diameter
	tail: [45, 0.8, 0.06], // the flagellum: length, diameter at its root, at the tip
	beat: { hz: 2.3, wavelength: 30, neck: 0.16, tip: 0.8, helix: 0.2, phase: 0 },
	roll: 0.3, // turns a second
	M: 32, // samples round an ellipse
	fine: 4, // rings drawn from a table this many times finer
	gens: 16, // generatrices (a section may ask for its own count)
	// How much of the spec's section each station takes (the rest the
	// ellipse): all of it through the head, the neck and the midpiece, gone
	// over the flagellum's first 6 units, so the tail is the plain round
	// thread it reads as at a few pixels across. extra.sectionAlong overrides.
	sectionAlong: (s, part, parts) =>
		part === 'tail' ? 1 - smooth(span(s, parts.tail[0], parts.tail[0] + 6)) : 1,
	alpha: { ring: 0.5, cap: 0.8, gen: 0.36, contour: 0.85, axis: 1 },
	width: { ring: 1, cap: 1.4, gen: 0.85, contour: 1.35, axis: 1 }
};

// ── The spec ─────────────────────────────────────────────────────────────────
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function specOf(answers = {}, extra = {}) {
	const raw = String(answers.date ?? '')
		.replace(/\D/g, '')
		.slice(0, 8);
	const d = [];
	for (let i = 0; i < 8; i++) d.push(i < raw.length ? Number(raw[i]) : 4.5);
	const nu = (x) => (x - 4.5) / 4.5;
	const sp = Number(answers.spice);
	const n = Number.isFinite(sp) && sp > 0 ? clamp(sp, 1, 10) : 5.5;
	// The day's tens run 0…3: not yet typed, it is their middle.
	if (!raw.length) d[0] = 1.5;
	const sum = d.reduce((a, b) => a + b, 0);
	const mod = (x, m) => ((x % m) + m) % m;
	const month = raw.length >= 4 ? clamp(10 * d[2] + d[3], 1, 12) : 6.5;
	const day = raw.length >= 2 ? clamp(10 * d[0] + d[1], 1, 31) : 16;
	const [H0, W0, T0] = BODY.head;
	const coeffs = [
		{ key: 'head length', value: H0 * (1 + 0.08 * nu(d[1])), from: [1] },
		{ key: 'head width', value: W0 * (1 + 0.08 * nu(d[3])), from: [3] },
		{ key: 'head thickness', value: T0 * (1 + 0.08 * nu(d[6])), from: [6] },
		{ key: 'midpiece length', value: BODY.mid[0] * (1 + 0.08 * nu(d[7])), from: [7] },
		{
			key: 'midpiece thickness',
			value: BODY.mid[1] * (1 + 0.08 * clamp((d[0] - 1.5) / 1.5, -1, 1)),
			from: [0]
		},
		{ key: 'tail length', value: 42 + (8 * mod(d[1] + d[6] + d[7], 10)) / 9, from: [1, 6, 7] },
		{ key: 'wavelength', value: 24 + 1.5 * mod(sum, 9), from: [0, 1, 2, 3, 4, 5, 6, 7] },
		{ key: 'tip amplitude', value: 0.6 + 0.05 * mod(sum, 7), from: [0, 1, 2, 3, 4, 5, 6, 7] },
		{ key: 'helicity', value: 0.15 + (0.15 * (month - 1)) / 11, from: [2, 3] },
		{ key: 'beat', value: 2 + 0.35 * n, from: 'spice' },
		{ key: 'roll', value: 0.2 + 0.04 * n, from: 'spice' },
		{ key: 'phase', value: (TAU * day) / 31, from: [0, 1] }
	];
	const c = Object.fromEntries(coeffs.map((x) => [x.key, x.value]));
	return {
		answers: { date: raw, spice: n },
		head: [c['head length'], c['head width'], c['head thickness']],
		mid: [c['midpiece length'], c['midpiece thickness']],
		tail: [c['tail length'], BODY.tail[1], BODY.tail[2]],
		beat: {
			hz: c.beat,
			wavelength: c.wavelength,
			neck: BODY.beat.neck,
			tip: c['tip amplitude'],
			helix: c.helicity,
			phase: c.phase
		},
		roll: c.roll,
		section: extra.section ?? null,
		sectionAlong: extra.sectionAlong ?? null,
		coeffs
	};
}

// ── Sections ─────────────────────────────────────────────────────────────────
export function rosetteSection(rosette, amount = 1, { M } = {}) {
	const a = clamp01(amount);
	const { r, f } = rosette;
	// Samples round: three to a turn of the fastest arm that still shows
	// (a·r_k ≥ 0.03); the rings are drawn from a table four times finer.
	let fm = 1;
	for (let k = 0; k < r.length; k++) if (r[k] * a >= 0.03) fm = Math.max(fm, Math.abs(f[k]));
	// The generatrices on the petals: the symmetry n is f₁ − f₀; at a whole
	// n ≥ 5 a line down every tip and every valley, else n's multiple near 12.
	const sym = f[1] - f[0];
	const whole = Math.abs(sym - Math.round(sym)) < 1e-9 && Math.round(sym) >= 2;
	const ns = Math.round(sym);
	const gens = !whole ? BODY.gens : ns >= 5 ? 2 * ns : ns * Math.ceil(12 / ns);
	const want = M ?? clamp(3 * fm, 32, 160);
	const Mm = gens * Math.max(2, Math.ceil(want / gens));
	const raw = (ph) => {
		let x = (1 - a) * Math.cos(ph);
		let y = (1 - a) * Math.sin(ph);
		if (a > 0)
			for (let k = 0; k < r.length; k++) {
				if (r[k] <= 0) continue;
				x += a * r[k] * Math.cos(f[k] * ph);
				y += a * r[k] * Math.sin(f[k] * ph);
			}
		return [x, y];
	};
	let ext = 0;
	const NS = Math.max(720, Mm * 8);
	for (let i = 0; i < NS; i++) {
		const [x, y] = raw((TAU * i) / NS);
		ext = Math.max(ext, Math.hypot(x, y));
	}
	const s = ext > 1e-9 ? 1 / ext : 1;
	const fn = (i, ph) => {
		const [x, y] = raw(ph);
		return [x * s, y * s];
	};
	fn.M = Mm;
	fn.gens = gens;
	fn.uniform = true;
	fn.amount = a;
	return fn;
}

// ── The stations ─────────────────────────────────────────────────────────────
function layout(spec) {
	const [Lh, Wh, Th] = spec.head;
	const [Lm, Dm] = spec.mid;
	const [Lt, Dt0, Dt1] = spec.tail;
	const HW = Wh / 2;
	const HT = Th / 2;
	const [rNeck, rWaist] = BODY.neck;
	const rMid = Dm / 2;
	const rT0 = Dt0 / 2;
	const rT1 = Dt1 / 2;
	const sCap = BODY.cap * Lh;
	const sMid0 = Lh + 1;
	const sMid1 = sMid0 + Lm;
	const sT0 = sMid1 + 0.2;
	const LEN = sT0 + Lt;
	const xb = BODY.broad;
	const xt = BODY.thickest;
	const sectionOf = (s) => {
		if (s <= Lh) {
			const x = s / Lh;
			let a;
			let b;
			if (x <= xb) a = HW * Math.sqrt(Math.max(0, 1 - ((xb - x) / xb) ** 2));
			else {
				const q = (x - xb) / (1 - xb);
				a = HW * Math.sqrt(Math.max(0, 1 - q * q * (1 - (rNeck / HW) ** 2)));
			}
			if (x <= xt) b = HT * Math.sqrt(Math.max(0, 1 - ((xt - x) / xt) ** 2));
			else {
				const q = (x - xt) / (1 - xt);
				b = HT * Math.sqrt(Math.max(0, 1 - q * q * (1 - (rNeck / HT) ** 2)));
			}
			const lip = BODY.lip * Math.min(1, s / 0.5) * (1 - smooth(span(s, sCap - 0.1, sCap + 0.02)));
			return [a + lip, b + lip, 'head'];
		}
		let r;
		let part = 'neck';
		if (s < Lh + 0.5) r = lerp(rNeck, rWaist, smooth(span(s, Lh, Lh + 0.5)));
		else if (s < sMid0) r = lerp(rWaist, rMid, smooth(span(s, Lh + 0.5, sMid0)));
		else if (s < sMid1 - 0.1) {
			r = rMid + 0.025 * Math.sin((Math.PI * (s - sMid0)) / (Lm - 0.1));
			part = 'mid';
		} else if (s < sT0) {
			r = lerp(rMid, rT0, smooth(span(s, sMid1 - 0.1, sT0)));
			part = 'mid';
		} else {
			const q = (s - sT0) / Lt;
			const rK = 0.3 * rT0; // where the long taper ends, 93% down
			r = q < 0.93 ? lerp(rT0, rK, q / 0.93) : lerp(rK, rT1, smooth(span(q, 0.93, 1)));
			part = 'tail';
		}
		return [r, r, part];
	};
	// The rings: twelve down the head (the acrosome's edge one), the neck's
	// waist and the midpiece every 0.75, the flagellum every 2.25. The grid is
	// the rings and a station halfway between each two (three round the
	// rounded nose), and the tip: about 80 stations.
	const headR = [0.05, 0.125, 0.2, 0.3, 0.4, 0.5, 0.6, BODY.cap, 0.75, 0.85, 0.925, 1].map(
		(x) => +(x * Lh).toFixed(4)
	);
	const midR = [Lh + 0.5, sMid0];
	for (let s = sMid0 + 0.75; s < sMid1 - 0.3; s += 0.75) midR.push(+s.toFixed(4));
	midR.push(+sMid1.toFixed(4));
	const tailR = [+(sT0 + 1).toFixed(4)];
	for (let s = sT0 + 2.25; s < LEN - 1; s += 2.25) tailR.push(+s.toFixed(4));
	const ringS = [...headR, ...midR, ...tailR];
	const want = new Set(ringS);
	const S = new Set([
		0,
		+(0.008 * Lh).toFixed(4),
		+(0.025 * Lh).toFixed(4),
		...ringS,
		+LEN.toFixed(4)
	]);
	const all = [0, ...ringS, LEN];
	for (let j = 0; j < all.length - 1; j++) S.add(+((all[j] + all[j + 1]) / 2).toFixed(4));
	S.add(+(Lh + 0.25).toFixed(4));
	S.add(+(Lh + 0.75).toFixed(4));
	const list = [...S].sort((x, y) => x - y);
	const capS = +sCap.toFixed(4);
	const stations = list.map((s) => {
		const [a, b, part] = sectionOf(s);
		return { s, a, b, part, ring: want.has(s), cap: s === capS };
	});
	return {
		stations,
		LEN,
		sBeat: Lh + 0.5,
		parts: { head: [0, Lh], neck: [Lh, sMid0], mid: [sMid0, sT0], tail: [sT0, LEN] }
	};
}

// ── Ink: segments chained into runs, batched by colour, alpha, width, dash ──
function makePen() {
	const B = new Map();
	const colors = new Map();
	let cur = null;
	let lx = NaN;
	let ly = NaN;
	return {
		seg(color, alpha, width, dash, x0, y0, x1, y1) {
			if (alpha < 0.012) return;
			let ci = colors.get(color);
			if (ci === undefined) colors.set(color, (ci = colors.size));
			const a = Math.min(20, Math.round(alpha * 20));
			const wq = Math.max(1, Math.round(width * 4));
			const key = ((ci * 32 + a) * 64 + Math.min(63, wq)) * 2 + (dash ? 1 : 0);
			let b = B.get(key);
			if (!b) {
				b = { color, alpha: a / 20, width: wq / 4, dash, R: [] };
				B.set(key, b);
			}
			if (b === cur && x0 === lx && y0 === ly) b.R[b.R.length - 1].push(x1, y1);
			else b.R.push([x0, y0, x1, y1]);
			cur = b;
			lx = x1;
			ly = y1;
		},
		// Under the context's own globalAlpha (a flow's fade round the call).
		flush(ctx) {
			const g0 = ctx.globalAlpha;
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (const b of B.values()) {
				ctx.strokeStyle = b.color;
				ctx.globalAlpha = g0 * b.alpha;
				ctx.lineWidth = b.width;
				ctx.setLineDash(b.dash ? [3, 5] : []);
				ctx.beginPath();
				for (const P of b.R) {
					ctx.moveTo(P[0], P[1]);
					for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]);
				}
				ctx.stroke();
			}
			ctx.restore();
			B.clear();
			cur = null;
		}
	};
}

// A triangle of screen points into a depth buffer (space.js makeDepth's
// layout: Z.s px a cell, Z.W × Z.H cells, Z.buf the nearest depth). `cull`
// ±1 keeps only triangles wound that way on the board (the front faces), 0
// keeps all. Edge functions stepped along each row.
function tri(Z, ax, ay, az, bx, by, bz, cx, cy, cz, cull = 0) {
	if (az < NEAR || bz < NEAR || cz < NEAR) return;
	const s = Z.s;
	ax /= s;
	ay /= s;
	bx /= s;
	by /= s;
	cx /= s;
	cy /= s;
	const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
	if (area * cull < 0 || Math.abs(area) < 1e-9) return;
	const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
	const x1 = Math.min(Z.W - 1, Math.ceil(Math.max(ax, bx, cx)));
	const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
	const y1 = Math.min(Z.H - 1, Math.ceil(Math.max(ay, by, cy)));
	if (x0 > x1 || y0 > y1) return;
	const inv = 1 / area;
	const ia = 1 / az;
	const ib = 1 / bz;
	const ic = 1 / cz;
	// w0 = (b × c terms) — linear in (px, py): w = C + px·dx + py·dy.
	const d0x = (by - cy) * inv;
	const d0y = (cx - bx) * inv;
	const c0 = (bx * cy - by * cx) * inv;
	const d1x = (cy - ay) * inv;
	const d1y = (ax - cx) * inv;
	const c1 = (cx * ay - cy * ax) * inv;
	const e = -0.03;
	const buf = Z.buf;
	const W = Z.W;
	const ea = ia - ic;
	const eb = ib - ic;
	for (let y = y0; y <= y1; y++) {
		const py = y + 0.5;
		let w0 = c0 + (x0 + 0.5) * d0x + py * d0y;
		let w1 = c1 + (x0 + 0.5) * d1x + py * d1y;
		let k = y * W + x0;
		for (let x = x0; x <= x1; x++, k++, w0 += d0x, w1 += d1x) {
			if (w0 < e || w1 < e || 1 - w0 - w1 < e) continue;
			const z = 1 / (ic + w0 * ea + w1 * eb);
			if (z < buf[k]) buf[k] = z;
		}
	}
}

// ── The body ─────────────────────────────────────────────────────────────────
export function makeBody(spec = specOf()) {
	const L = layout(spec);
	const ST = L.stations;
	const n = ST.length;
	const LEN = L.LEN;
	const sec = spec.section ?? null;
	const G = sec?.gens ?? BODY.gens;
	const M = G * Math.max(2, Math.round((sec?.M ?? BODY.M) / G));
	const RF = BODY.fine;
	const MF = M * RF;
	const GSTEP = M / G;
	const along = spec.sectionAlong ?? BODY.sectionAlong;
	const WS = Float64Array.from(ST, (x) => (sec ? clamp01(along(x.s, x.part, L.parts)) : 1));
	const SS = Float64Array.from(ST, (x) => x.s);
	const SA = Float64Array.from(ST, (x) => x.a);
	const SB = Float64Array.from(ST, (x) => x.b);
	const RINGS = [];
	ST.forEach((x, i) => x.ring && RINGS.push(i));
	const iBroad = (() => {
		let b = 0;
		for (let i = 0; i < n; i++) if (SA[i] > SA[b]) b = i;
		return b;
	})();

	// The section tables, fine (MF round; the grid is every RF-th): the
	// ellipse, and the spec's section (one table if uniform, else per station).
	const EU = new Float64Array(MF);
	const EV = new Float64Array(MF);
	for (let f = 0; f < MF; f++) {
		EU[f] = Math.cos((TAU * f) / MF);
		EV[f] = Math.sin((TAU * f) / MF);
	}
	const uniform = !sec || sec.uniform;
	let SU = EU;
	let SV = EV;
	if (sec) {
		const rows = uniform ? 1 : n;
		SU = new Float64Array(rows * MF);
		SV = new Float64Array(rows * MF);
		for (let i = 0; i < rows; i++)
			for (let f = 0; f < MF; f++) {
				const [u, v] = sec(i, (TAU * f) / MF);
				SU[i * MF + f] = u;
				SV[i * MF + f] = v;
			}
	}
	// How long the section is round, against a circle's 2π (for chord counts).
	let perim = 0;
	for (let f = 0; f < MF; f++) {
		const g = (f + 1) % MF;
		perim += Math.hypot(SU[g] - SU[f], SV[g] - SV[f]);
	}
	const PERIM = Math.max(1, perim / TAU);
	const secOff = (i) => (uniform ? 0 : i * MF);

	// Weights for the mean axis: the length each station stands for, the
	// head's twice.
	const DS = new Float64Array(n);
	const WH = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		DS[i] = (SS[Math.min(n - 1, i + 1)] - SS[Math.max(0, i - 1)]) / 2;
		WH[i] = DS[i] * (ST[i].part === 'head' ? 2 : 1);
	}

	// ── The shape at t ──
	const BT = spec.beat ?? BODY.beat;
	const K = TAU / BT.wavelength;
	const ROLLHZ = spec.roll ?? BODY.roll;
	function shape(t = 0, o = {}) {
		const { beat = 1, form = 1 } = o;
		const ph = o.phase ?? TAU * BT.hz * t + (BT.phase ?? 0);
		const rho = o.roll ?? TAU * ROLLHZ * t;
		const sB = L.sBeat;
		const span0 = LEN - sB;
		const bt = clamp01(beat);
		const be = new Float64Array(n);
		const ch = new Float64Array(n);
		const wave = (s) => {
			const dd = Math.max(0, s - sB);
			const q = dd / span0;
			const env = bt >= 1 ? 1 : smooth((bt * 1.25 - q) / 0.25);
			const A = env * (BT.neck + (BT.tip - BT.neck) * q);
			const a = K * dd - ph;
			return [A * Math.sin(a), A * BT.helix * Math.cos(a)];
		};
		const w0 = wave(sB);
		for (let i = 0; i < n; i++) {
			const w = SS[i] <= sB ? w0 : wave(SS[i]);
			be[i] = w[0];
			ch[i] = w[1];
		}
		// Tangents (tailward), integrated from the nose.
		const C = new Float64Array(3 * n);
		const T = new Float64Array(3 * n);
		const A = new Float64Array(3 * n);
		const B = new Float64Array(3 * n);
		let mx = 0;
		let my = 0;
		let mz = 0;
		for (let i = 0; i < n; i++) {
			const cb = Math.cos(be[i]);
			const cc = Math.cos(ch[i]);
			const tx = -cb * cc;
			const ty = Math.sin(ch[i]);
			const tz = cc * Math.sin(be[i]);
			T[3 * i] = tx;
			T[3 * i + 1] = ty;
			T[3 * i + 2] = tz;
			mx += tx * DS[i];
			my += ty * DS[i];
			mz += tz * DS[i];
			if (i) {
				const ds = SS[i] - SS[i - 1];
				const bm = (be[i] + be[i - 1]) / 2;
				const cm = (ch[i] + ch[i - 1]) / 2;
				const c2 = Math.cos(cm);
				C[3 * i] = C[3 * i - 3] - Math.cos(bm) * c2 * ds;
				C[3 * i + 1] = C[3 * i - 2] + Math.sin(cm) * ds;
				C[3 * i + 2] = C[3 * i - 1] + c2 * Math.sin(bm) * ds;
			}
		}
		// The body's mean axis: the principal axis of its centreline points
		// (weighted by the length each stands for, the head twice), not the
		// mean tangent — that is the nose-to-tip chord, and would pin the tip
		// to the axis. The rotation takes it to −x (Rodrigues), about the nose,
		// then the roll about x.
		{
			let gx = 0;
			let gy = 0;
			let gz = 0;
			let sw = 0;
			for (let i = 0; i < n; i++) {
				const wi = WH[i];
				gx += wi * C[3 * i];
				gy += wi * C[3 * i + 1];
				gz += wi * C[3 * i + 2];
				sw += wi;
			}
			gx /= sw;
			gy /= sw;
			gz /= sw;
			let xx = 0;
			let xy = 0;
			let xz = 0;
			let yy = 0;
			let yz = 0;
			let zz = 0;
			for (let i = 0; i < n; i++) {
				const wi = WH[i];
				const dx = C[3 * i] - gx;
				const dy = C[3 * i + 1] - gy;
				const dz = C[3 * i + 2] - gz;
				xx += wi * dx * dx;
				xy += wi * dx * dy;
				xz += wi * dx * dz;
				yy += wi * dy * dy;
				yz += wi * dy * dz;
				zz += wi * dz * dz;
			}
			// Power iteration from the chord (long and thin: a few steps).
			for (let it = 0; it < 6; it++) {
				const nx = xx * mx + xy * my + xz * mz;
				const ny = xy * mx + yy * my + yz * mz;
				const nz = xz * mx + yz * my + zz * mz;
				const l = Math.hypot(nx, ny, nz) || 1;
				mx = nx / l;
				my = ny / l;
				mz = nz / l;
			}
			if (mx * C[3 * n - 3] + my * C[3 * n - 2] + mz * C[3 * n - 1] < 0) {
				mx = -mx;
				my = -my;
				mz = -mz;
			}
		}
		// axis k = m × (−x) = (0, −mz, my); cos = −mx
		let kx = 0;
		let ky = -mz;
		let kz = my;
		const sn = Math.hypot(ky, kz);
		const cs = -mx;
		if (sn > 1e-12) {
			ky /= sn;
			kz /= sn;
		}
		const cr = Math.cos(rho);
		const sr = Math.sin(rho);
		const rot = (V, j) => {
			let x = V[j];
			let y = V[j + 1];
			let z = V[j + 2];
			if (sn > 1e-12) {
				// v cos + (k × v) sin + k (k·v)(1 − cos)
				const kd = kx * x + ky * y + kz * z;
				const cx = ky * z - kz * y;
				const cy = kz * x - kx * z;
				const cz = kx * y - ky * x;
				const nx = x * cs + cx * sn + kx * kd * (1 - cs);
				const ny = y * cs + cy * sn + ky * kd * (1 - cs);
				const nz = z * cs + cz * sn + kz * kd * (1 - cs);
				x = nx;
				y = ny;
				z = nz;
			}
			V[j] = x;
			V[j + 1] = y * cr - z * sr;
			V[j + 2] = y * sr + z * cr;
		};
		for (let i = 0; i < n; i++) {
			const j = 3 * i;
			// The frame before the turn: B the thickness (y off the tangent),
			// A = B × T across.
			const tx = T[j];
			const ty = T[j + 1];
			const tz = T[j + 2];
			let bx = -ty * tx;
			let by = 1 - ty * ty;
			let bz = -ty * tz;
			const bl = Math.hypot(bx, by, bz) || 1;
			bx /= bl;
			by /= bl;
			bz /= bl;
			B[j] = bx;
			B[j + 1] = by;
			B[j + 2] = bz;
			A[j] = by * tz - bz * ty;
			A[j + 1] = bz * tx - bx * tz;
			A[j + 2] = bx * ty - by * tx;
			rot(C, j);
			rot(T, j);
			rot(A, j);
			rot(B, j);
		}
		return { n, C, T, A, B, form: clamp01(form), t, roll: rho };
	}

	// ── Laying it in the world ──
	const O = new Float64Array(3 * n);
	const WA = new Float64Array(3 * n);
	const WB = new Float64Array(3 * n);
	let placed = { shape: null, key: null, scale: 1 };
	// Poses are compared by value (a flow may reuse one object, moved).
	const poseKey = (p) => [
		p.path ?? null,
		p.sigma,
		p.scale ?? 1,
		...(p.at ?? []),
		...(p.dir ?? []),
		...(typeof p.up === 'function' ? [p.up] : (p.up ?? []))
	];
	const sameKey = (a, b) => a && b && a.length === b.length && a.every((x, i) => x === b[i]);
	function place(sh, pose) {
		const key = poseKey(pose);
		if (placed.shape === sh && sameKey(placed.key, key)) return placed;
		const sc = pose.scale ?? 1;
		const upOf = pose.up ?? [0, 1, 0];
		const { C, A, B } = sh;
		const frame = (H, upv) => {
			let d = H[0] * upv[0] + H[1] * upv[1] + H[2] * upv[2];
			let Nx = upv[0] - H[0] * d;
			let Ny = upv[1] - H[1] * d;
			let Nz = upv[2] - H[2] * d;
			let l = Math.hypot(Nx, Ny, Nz);
			if (l < 1e-6) {
				// `up` along the heading: the world axis least along it instead
				// (a body pointed straight up or down would otherwise be flat).
				const ax = Math.abs(H[0]);
				const ay = Math.abs(H[1]);
				const az = Math.abs(H[2]);
				const alt = ax <= ay && ax <= az ? [1, 0, 0] : az <= ay ? [0, 0, -1] : [0, 1, 0];
				d = H[0] * alt[0] + H[1] * alt[1] + H[2] * alt[2];
				Nx = alt[0] - H[0] * d;
				Ny = alt[1] - H[1] * d;
				Nz = alt[2] - H[2] * d;
				l = Math.hypot(Nx, Ny, Nz) || 1;
			}
			Nx /= l;
			Ny /= l;
			Nz /= l;
			return [
				H,
				[Nx, Ny, Nz],
				[H[1] * Nz - H[2] * Ny, H[2] * Nx - H[0] * Nz, H[0] * Ny - H[1] * Nx]
			];
		};
		const put = (i, P, F, cy, cz) => {
			const [X, Y, Z] = F;
			const j = 3 * i;
			for (let c = 0; c < 3; c++) {
				O[j + c] = P[c] + sc * (Y[c] * cy + Z[c] * cz);
				WA[j + c] = sc * SA[i] * (X[c] * A[j] + Y[c] * A[j + 1] + Z[c] * A[j + 2]);
				WB[j + c] = sc * SB[i] * (X[c] * B[j] + Y[c] * B[j + 1] + Z[c] * B[j + 2]);
			}
		};
		if (pose.path) {
			const e = 0.01 * sc;
			for (let i = 0; i < n; i++) {
				const sg = pose.sigma + sc * C[3 * i];
				const P = pose.path(sg);
				const p1 = pose.path(sg + e);
				const p0 = pose.path(sg - e);
				let H = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
				const hl = Math.hypot(H[0], H[1], H[2]) || 1;
				H = [H[0] / hl, H[1] / hl, H[2] / hl];
				const F = frame(H, typeof upOf === 'function' ? upOf(sg) : upOf);
				put(i, P, F, C[3 * i + 1], C[3 * i + 2]);
			}
		} else {
			const dl = Math.hypot(...pose.dir) || 1;
			const F = frame([pose.dir[0] / dl, pose.dir[1] / dl, pose.dir[2] / dl], upOf);
			const [X] = F;
			for (let i = 0; i < n; i++) {
				const cx = C[3 * i];
				const P = [
					pose.at[0] + sc * X[0] * cx,
					pose.at[1] + sc * X[1] * cx,
					pose.at[2] + sc * X[2] * cx
				];
				put(i, P, F, C[3 * i + 1], C[3 * i + 2]);
			}
		}
		placed = { shape: sh, key, scale: sc };
		return placed;
	}
	// The (u, v) of fine index f at station i, the ellipse blended to the
	// section by `form`.
	const uvOf = (i, f, form0) => {
		const o = secOff(i) + f;
		const form = form0 * WS[i];
		if (form >= 1) return [SU[o], SV[o]];
		if (form <= 0) return [EU[f], EV[f]];
		return [EU[f] + form * (SU[o] - EU[f]), EV[f] + form * (SV[o] - EV[f])];
	};
	const worldAt = (i, f, form) => {
		const [u, v] = uvOf(i, f, form);
		const j = 3 * i;
		return [
			O[j] + WA[j] * u + WB[j] * v,
			O[j + 1] + WA[j + 1] * u + WB[j + 1] * v,
			O[j + 2] + WA[j + 2] * u + WB[j + 2] * v
		];
	};

	// ── The lens, unpacked from a camera3 ──
	const lensOf = (cam) => {
		const p = cam.pos;
		const q0 = cam.project([p[0] + cam.f[0], p[1] + cam.f[1], p[2] + cam.f[2]]);
		const q1 = cam.project([
			p[0] + cam.f[0] + cam.r[0],
			p[1] + cam.f[1] + cam.r[1],
			p[2] + cam.f[2] + cam.r[2]
		]);
		const q2 = cam.project([
			p[0] + 2 * cam.f[0] + cam.r[0],
			p[1] + 2 * cam.f[1] + cam.r[1],
			p[2] + 2 * cam.f[2] + cam.r[2]
		]);
		const k = q1[0] - q0[0];
		const ortho = Math.abs(q2[0] - q0[0] - k) < 1e-6 * Math.abs(k);
		return { p, R: cam.r, U: cam.u, F: cam.f, cx: q0[0], cy: q0[1], k, ortho };
	};

	// ── The grid, projected: PW world, PS screen [x, y, depth] ──
	const NM = n * M;
	const PW = new Float64Array(3 * NM);
	const PS = new Float64Array(3 * NM);
	const CS = new Float64Array(3 * n); // the centres, on screen
	const RPX = new Float64Array(n); // a ring's radius on the board, px
	let grid = { placed: null, cam: null };
	let lens = null;
	let FRONT = 0;
	const box = [0, 0, 0, 0];
	function project(x, y, z, out, j) {
		const { p, R, U, F, cx, cy, k, ortho } = lens;
		const dx = x - p[0];
		const dy = y - p[1];
		const dz = z - p[2];
		const X = dx * R[0] + dy * R[1] + dz * R[2];
		const Y = dx * U[0] + dy * U[1] + dz * U[2];
		const Z = dx * F[0] + dy * F[1] + dz * F[2];
		if (ortho) {
			out[j] = cx + X * k;
			out[j + 1] = cy - Y * k;
		} else {
			out[j] = cx + (k * X) / Z;
			out[j + 1] = cy - (k * Y) / Z;
		}
		out[j + 2] = Z;
	}
	const tmp = new Float64Array(3);
	function prepare(cam, sh, pose) {
		const pl = place(sh, pose);
		if (grid.placed === pl && grid.cam === cam) return;
		lens = lensOf(cam);
		const form = sh.form;
		box[0] = box[1] = Infinity;
		box[2] = box[3] = -Infinity;
		for (let i = 0; i < n; i++) {
			const j = 3 * i;
			project(O[j], O[j + 1], O[j + 2], CS, j);
			const z = CS[j + 2];
			const ext = Math.max(
				Math.hypot(WA[j], WA[j + 1], WA[j + 2]),
				Math.hypot(WB[j], WB[j + 1], WB[j + 2])
			);
			RPX[i] = z > NEAR ? (lens.ortho ? ext * lens.k : (ext * lens.k) / z) : 0;
			const so = secOff(i);
			const fw = form * WS[i];
			for (let k = 0; k < M; k++) {
				const f = k * RF;
				const u = fw >= 1 ? SU[so + f] : EU[f] + fw * (SU[so + f] - EU[f]);
				const v = fw >= 1 ? SV[so + f] : EV[f] + fw * (SV[so + f] - EV[f]);
				const g = 3 * (i * M + k);
				const x = O[j] + WA[j] * u + WB[j] * v;
				const y = O[j + 1] + WA[j + 1] * u + WB[j + 1] * v;
				const zz = O[j + 2] + WA[j + 2] * u + WB[j + 2] * v;
				PW[g] = x;
				PW[g + 1] = y;
				PW[g + 2] = zz;
				project(x, y, zz, PS, g);
				if (PS[g + 2] > NEAR) {
					const sx = PS[g];
					const sy = PS[g + 1];
					if (sx < box[0]) box[0] = sx;
					if (sy < box[1]) box[1] = sy;
					if (sx > box[2]) box[2] = sx;
					if (sy > box[3]) box[3] = sy;
				}
			}
		}
		// Which way a front face winds on the board: the quad at the head's
		// broadest ring nearest the lens faces it.
		FRONT = 0;
		let kn = -1;
		let zn = Infinity;
		for (let k = 0; k < M; k++) {
			const z = PS[3 * (iBroad * M + k) + 2];
			if (z > NEAR && z < zn) {
				zn = z;
				kn = k;
			}
		}
		if (kn >= 0 && iBroad + 1 < n) {
			const a = 3 * (iBroad * M + kn);
			const c = 3 * ((iBroad + 1) * M + kn);
			const d = 3 * ((iBroad + 1) * M + ((kn + 1) % M));
			const ar =
				(PS[c] - PS[a]) * (PS[d + 1] - PS[a + 1]) - (PS[c + 1] - PS[a + 1]) * (PS[d] - PS[a]);
			if (Math.abs(ar) > 1e-6 && PS[c + 2] > NEAR && PS[d + 2] > NEAR) FRONT = Math.sign(ar);
		}
		grid = { placed: pl, cam };
	}

	// The stride round a ring for the depth raster: chords of ~10 px.
	const rasterStride = (i) => {
		const chords = (TAU * RPX[i] * PERIM) / 10;
		let st = M;
		while (st > 1 && M / st < chords) st >>= 1;
		// at least eight quads round, and a whole stride (M need not be a
		// power of two: a fractional one indexes the typed arrays off the grid)
		return Math.max(1, Math.min(st, Math.floor(M / 8)));
	};
	// Only the front faces: the nearest skin is always one (the grid's
	// winding is the same everywhere), so the back half need not be filled.
	function raster(Z, i0, i1, ox = 0, oy = 0) {
		const cull = FRONT;
		for (let i = i0; i < i1; i++) {
			if (CS[3 * i + 2] <= NEAR && CS[3 * i + 5] <= NEAR) continue;
			const st = Math.max(1, Math.min(rasterStride(i), rasterStride(i + 1)));
			for (let k = 0; k < M; k += st) {
				const k1 = (k + st) % M;
				const a = 3 * (i * M + k);
				const b = 3 * (i * M + k1);
				const c = 3 * ((i + 1) * M + k);
				const d = 3 * ((i + 1) * M + k1);
				const ax = PS[a] - ox;
				const ay = PS[a + 1] - oy;
				const dx = PS[d] - ox;
				const dy = PS[d + 1] - oy;
				tri(Z, ax, ay, PS[a + 2], PS[c] - ox, PS[c + 1] - oy, PS[c + 2], dx, dy, PS[d + 2], cull);
				tri(Z, ax, ay, PS[a + 2], dx, dy, PS[d + 2], PS[b] - ox, PS[b + 1] - oy, PS[b + 2], cull);
			}
		}
	}

	// The body's own skin, for its hidden lines: a buffer over the part of
	// the board the canvas shows (its origin at (ox, oy) in the coordinates
	// the body is drawn in, so a ctx.translate is allowed for). Reset only
	// where the last frame wrote (the body's box).
	const SELF = { s: 4, W: 0, H: 0, buf: null, on: false, ox: 0, oy: 0 };
	const dirty = [0, 0, -1, -1];
	let selfKey = null;
	function selfDepth(W, H, i0, i1, ox = 0, oy = 0) {
		const key = `${i0}|${i1}|${W}|${H}|${ox}|${oy}`;
		if (selfKey && selfKey.grid === grid && selfKey.key === key) return;
		if (!SELF.buf || SELF.W !== W || SELF.H !== H) {
			SELF.buf = new Float32Array(W * H).fill(Infinity);
			SELF.W = W;
			SELF.H = H;
		} else
			for (let y = dirty[1]; y <= dirty[3]; y++)
				SELF.buf.fill(Infinity, y * W + dirty[0], y * W + dirty[2] + 1);
		const s = SELF.s;
		SELF.ox = ox;
		SELF.oy = oy;
		dirty[0] = Math.max(0, Math.floor((box[0] - ox) / s) - 2);
		dirty[1] = Math.max(0, Math.floor((box[1] - oy) / s) - 2);
		dirty[2] = Math.min(W - 1, Math.ceil((box[2] - ox) / s) + 2);
		dirty[3] = Math.min(H - 1, Math.ceil((box[3] - oy) / s) + 2);
		SELF.on = i1 > i0;
		if (SELF.on) raster(SELF, i0, i1, ox, oy);
		selfKey = { grid, key };
	}
	// Behind? The deepest of the four cells round the point, plus a slack.
	const deep4 = (Z, x, y) => {
		const fx = x / Z.s - 0.5;
		const fy = y / Z.s - 0.5;
		const x0 = Math.floor(fx);
		const y0 = Math.floor(fy);
		if (x0 < 0 || y0 < 0 || x0 + 1 >= Z.W || y0 + 1 >= Z.H) return Infinity;
		const B = Z.buf;
		const k = y0 * Z.W + x0;
		return Math.max(B[k], B[k + 1], B[k + Z.W], B[k + Z.W + 1]);
	};

	// ── Drawing ──
	function draw(ctx, cam, sh, pose, o = {}) {
		const {
			rings = 1,
			ringFrom = 0,
			gens = 1,
			contour = 1,
			alpha = 1,
			width = 1,
			back = 0.18,
			depth = null,
			color = PAL.chalk,
			axis = 0,
			pens = true
		} = o;
		// The part of the board the canvas shows, in the coordinates drawn in
		// (the board's transform is its dpr, and perhaps a flow's translate).
		const T = ctx.getTransform ? ctx.getTransform() : { a: 1, d: 1, e: 0, f: 0 };
		const cw = ctx.canvas.width / (T.a || 1);
		const chh = ctx.canvas.height / (T.d || 1);
		const vx = -T.e / (T.a || 1);
		const vy = -T.f / (T.d || 1);
		prepare(cam, sh, pose);
		const sc = placed.scale;
		const form = sh.form;
		const NR = RINGS.length;
		const pOf = (j) => Math.min(clamp01(rings * NR - j), clamp01(j + 1 - ringFrom * NR));
		const gOf = typeof gens === 'function' ? gens : () => gens;
		let gAny = 0;
		for (let j = 0; j < G; j++) gAny = Math.max(gAny, gOf(j, G));
		// The skin built so far: from the first ring written to the last half
		// written, all of it once the generatrices go on.
		let i0 = n;
		let i1 = -1;
		for (let j = 0; j < NR; j++)
			if (pOf(j) > 0.5) {
				i0 = Math.min(i0, RINGS[j]);
				i1 = Math.max(i1, RINGS[j]);
			}
		if (gAny > 0 || contour > 0) {
			i0 = 0;
			i1 = n - 1;
		}
		selfDepth(
			Math.ceil(cw / SELF.s),
			Math.ceil(chh / SELF.s),
			Math.max(0, i0),
			Math.max(0, i1),
			Math.round(vx),
			Math.round(vy)
		);
		const pen = makePen();
		const heads = [];
		// Depth for widths: the head's broadest station.
		let zRef = CS[3 * iBroad + 2];
		if (!(zRef > NEAR)) zRef = Math.max(NEAR * 10, CS[3 * (n - 1) + 2]);
		const wOf = (z) => Math.min(1.8, Math.max(0.55, zRef / z));
		// The slack: a share of the station's thickness, and a cell's worth of
		// depth at z.
		const slackOf = (i, z) =>
			0.3 * Math.min(SA[i], SB[i]) * sc + (SELF.s * (lens.ortho ? 1 : z)) / lens.k;
		const extHidden = depth
			? depth.buf
				? (x, y, z) => {
						const m = deep4(depth, x, y);
						return m < Infinity && z > m * 1.012 + 0.012;
					}
				: (x, y, z) => depth.hidden([x, y, z])
			: null;
		// `inner`: how far inside the skin the line runs (the centreline's
		// thread), added to the slack. The same slack goes to the external
		// test, so a buffer the body itself was filled into (fillDepth, then
		// the tunnel, then this draw with that buffer) does not eat its lines.
		const hidden = (x, y, z, i, inner = 0) => {
			const sl = slackOf(i, z) + inner;
			if (SELF.on) {
				const m = deep4(SELF, x - SELF.ox, y - SELF.oy);
				if (m < Infinity && z > m + sl) return true;
			}
			return extHidden ? extHidden(x, y, z - sl) : false;
		};
		const M2 = 40;
		const off = (ax, ay, bx, by) =>
			(ax < vx - M2 && bx < vx - M2) ||
			(ay < vy - M2 && by < vy - M2) ||
			(ax > vx + cw + M2 && bx > vx + cw + M2) ||
			(ay > vy + chh + M2 && by > vy + chh + M2);
		// One segment on the board, cut to ~12 px for the hidden test.
		// Tested piece by piece; a run of pieces alike (in front or behind, one
		// width) goes down as one stroke.
		// hideOnly: what is hidden is dropped, not dashed; inner: as hidden's;
		// fixed: wd is the width on the board, not scaled by depth.
		const seg = (ax, ay, az, bx, by, bz, i, al, wd, hideOnly = false, inner = 0, fixed = false) => {
			if (az <= NEAR || bz <= NEAR || off(ax, ay, bx, by)) return;
			const L = Math.hypot(bx - ax, by - ay);
			const m = L > 14 ? Math.min(40, Math.ceil(L / 12)) : 1;
			let px = ax;
			let py = ay;
			let pz = az;
			let rx = ax;
			let ry = ay;
			let rs = -1; // the run's state: 0 in front, 1 behind, 2 dropped
			let rw = 0;
			const emit = (x, y) => {
				if (rs === 0) pen.seg(color, al, rw, false, rx, ry, x, y);
				else if (rs === 1) pen.seg(color, al * back, Math.max(0.8, wd * 0.7), true, rx, ry, x, y);
			};
			for (let q = 1; q <= m; q++) {
				const f = q / m;
				const x = ax + (bx - ax) * f;
				const y = ay + (by - ay) * f;
				const z = az + (bz - az) * f;
				const mz = (pz + z) / 2;
				let st;
				let wq = 0;
				if (hidden((px + x) / 2, (py + y) / 2, mz, i, inner)) st = !hideOnly && back > 0 ? 1 : 2;
				else {
					st = 0;
					wq = Math.round((fixed ? wd : wd * wOf(mz)) * 4) / 4;
				}
				if (st !== rs || wq !== rw) {
					if (rs >= 0) emit(px, py);
					rs = st;
					rw = wq;
					rx = px;
					ry = py;
				}
				px = x;
				py = y;
				pz = z;
			}
			emit(px, py);
		};

		// The construction axis, inside the body.
		if (axis > 0) {
			for (let i = 0; i < n - 1; i++) {
				const a = 3 * i;
				const b = a + 3;
				seg(
					CS[a],
					CS[a + 1],
					CS[a + 2],
					CS[b],
					CS[b + 1],
					CS[b + 2],
					i,
					alpha * axis * BODY.alpha.axis * 0.45,
					width * BODY.width.axis
				);
			}
		}

		// The rings, each written round from the top of its section. While the
		// rings are all there is (a build) they are drawn down to 1 px, so a
		// build of a far tail is seen; finished ones under 3 px fade out as the
		// generatrices or the contour come on (beads on the thread, else).
		const solid = Math.max(clamp01(gAny), clamp01(contour));
		const q0 = new Float64Array(3);
		const wa = new Float64Array(3);
		const wb = new Float64Array(3);
		for (let j = 0; j < NR; j++) {
			const p = pOf(j);
			if (p <= 0) continue;
			const i = RINGS[j];
			const cap = ST[i].cap;
			const small = p >= 1 && RPX[i] < (cap ? 1.5 : 3);
			if (small && (solid >= 1 || RPX[i] < 1)) continue;
			if (CS[3 * i + 2] <= NEAR) continue;
			const al = alpha * (cap ? BODY.alpha.cap : BODY.alpha.ring) * (small ? 1 - solid : 1);
			const wd = width * (cap ? BODY.width.cap : BODY.width.ring);
			const chords = Math.max(8, (TAU * RPX[i] * PERIM) / 9);
			let st = MF;
			while (st > 1 && MF / st < chords) st >>= 1;
			st = Math.max(1, Math.min(st, Math.floor(MF / 8)));
			const end = MF * p;
			const f0 = MF / 4;
			// The ring's points straight from the fine table, no arrays made.
			const jj = 3 * i;
			const so = secOff(i);
			const fw = form * WS[i];
			const ptAt = (f, out) => {
				const u = fw >= 1 ? SU[so + f] : EU[f] + fw * (SU[so + f] - EU[f]);
				const v = fw >= 1 ? SV[so + f] : EV[f] + fw * (SV[so + f] - EV[f]);
				out[0] = O[jj] + WA[jj] * u + WB[jj] * v;
				out[1] = O[jj + 1] + WA[jj + 1] * u + WB[jj + 1] * v;
				out[2] = O[jj + 2] + WA[jj + 2] * u + WB[jj + 2] * v;
			};
			ptAt(f0 % MF, wa);
			project(wa[0], wa[1], wa[2], q0, 0);
			let ax = q0[0];
			let ay = q0[1];
			let az = q0[2];
			for (let m = 0; m < end; m += st) {
				const fr = Math.min(1, (end - m) / st);
				ptAt((f0 + m + st) % MF, wb);
				if (fr < 1) for (let c = 0; c < 3; c++) wb[c] = wa[c] + (wb[c] - wa[c]) * fr;
				project(wb[0], wb[1], wb[2], tmp, 0);
				seg(ax, ay, az, tmp[0], tmp[1], tmp[2], i, al, wd);
				ax = tmp[0];
				ay = tmp[1];
				az = tmp[2];
				wa.set(wb);
			}
			if (p < 1 && pens && az > NEAR) heads.push([ax, ay]);
		}

		// The generatrices, nose to tip; where the body is a few pixels
		// across, only every second or fourth of them.
		if (gAny > 0) {
			const al = alpha * BODY.alpha.gen;
			const wd = width * BODY.width.gen;
			for (let j = 0; j < G; j++) {
				const p = clamp01(gOf(j, G));
				if (p <= 0) continue;
				const k = j * GSTEP;
				const need = j % 4 === 0 ? 2.5 : j % 2 === 0 ? 5 : 9;
				const end = (n - 1) * p;
				let ia = 0;
				let a = 3 * k;
				for (let i = 1; i < n && i - 1 < end; i++) {
					const fr = Math.min(1, end - (i - 1));
					const b = 3 * (i * M + k);
					let bx = PS[b];
					let by = PS[b + 1];
					let bz = PS[b + 2];
					if (fr < 1) {
						// the pen between station i − 1 and i (both before the lens)
						const c = 3 * ((i - 1) * M + k);
						if (bz <= NEAR || PS[c + 2] <= NEAR) break;
						bx = PS[c] + (bx - PS[c]) * fr;
						by = PS[c + 1] + (by - PS[c + 1]) * fr;
						bz = PS[c + 2] + (bz - PS[c + 2]) * fr;
					}
					const last = fr < 1 || i === n - 1;
					if (!last && Math.hypot(bx - PS[a], by - PS[a + 1]) < 4) continue;
					if (RPX[ia] >= need || RPX[i] >= need)
						seg(PS[a], PS[a + 1], PS[a + 2], bx, by, bz, ia, al, wd);
					if (fr < 1) {
						if (pens && bz > NEAR) heads.push([bx, by]);
						break;
					}
					ia = i;
					a = b;
				}
			}
		}

		// The contour: where n · (P − eye) changes sign on the grid, marched.
		if (contour > 0) {
			const iEnd = Math.min(n - 1, Math.ceil((n - 1) * clamp01(contour)));
			const g = new Float64Array((iEnd + 1) * M);
			const ex = lens.p[0];
			const ey = lens.p[1];
			const ez = lens.p[2];
			for (let i = 0; i <= iEnd; i++) {
				const ip = Math.min(i + 1, n - 1);
				const im = Math.max(i - 1, 0);
				for (let k = 0; k < M; k++) {
					const kp = (k + 1) % M;
					const km = (k + M - 1) % M;
					const c = 3 * (i * M + k);
					const A1 = 3 * (ip * M + k);
					const A0 = 3 * (im * M + k);
					const B1 = 3 * (i * M + kp);
					const B0 = 3 * (i * M + km);
					const ax = PW[A1] - PW[A0];
					const ay = PW[A1 + 1] - PW[A0 + 1];
					const az = PW[A1 + 2] - PW[A0 + 2];
					const bx = PW[B1] - PW[B0];
					const by = PW[B1 + 1] - PW[B0 + 1];
					const bz = PW[B1 + 2] - PW[B0 + 2];
					const nx = ay * bz - az * by;
					const ny = az * bx - ax * bz;
					const nz = ax * by - ay * bx;
					g[i * M + k] = lens.ortho
						? nx * lens.F[0] + ny * lens.F[1] + nz * lens.F[2]
						: nx * (PW[c] - ex) + ny * (PW[c + 1] - ey) + nz * (PW[c + 2] - ez);
				}
			}
			const al = alpha * BODY.alpha.contour;
			const wd = width * BODY.width.contour;
			// Edge crossings, by linear interpolation on the board.
			const cross = (ka, kb, out, o2) => {
				const fa = g[ka];
				const fb = g[kb];
				const tt = fa / (fa - fb);
				const a = 3 * ka;
				const b = 3 * kb;
				out[o2] = PS[a] + (PS[b] - PS[a]) * tt;
				out[o2 + 1] = PS[a + 1] + (PS[b + 1] - PS[a + 1]) * tt;
				out[o2 + 2] = PS[a + 2] + (PS[b + 2] - PS[a + 2]) * tt;
			};
			const E = new Float64Array(12);
			const sgn = (x) => (x < 0 ? 1 : 0);
			const edges = [];
			const iLast = Math.min(iEnd, n - 1);
			for (let i = 0; i < iLast; i++) {
				if (CS[3 * i + 2] <= NEAR) continue;
				if (RPX[i] < 0.3 && RPX[i + 1] < 0.3) continue;
				for (let k = 0; k < M; k++) {
					const k1 = (k + 1) % M;
					const A = i * M + k; // corners a b c d: (i,k) (i+1,k) (i+1,k1) (i,k1)
					const Bq = (i + 1) * M + k;
					const Cq = (i + 1) * M + k1;
					const D = i * M + k1;
					// A cell reaching behind the lens has no picture to cross in.
					if (
						PS[3 * A + 2] <= NEAR ||
						PS[3 * Bq + 2] <= NEAR ||
						PS[3 * Cq + 2] <= NEAR ||
						PS[3 * D + 2] <= NEAR
					)
						continue;
					const id = sgn(g[A]) | (sgn(g[Bq]) << 1) | (sgn(g[Cq]) << 2) | (sgn(g[D]) << 3);
					if (id === 0 || id === 15) continue;
					// the cell's crossing edges: 0 a→b, 1 b→c, 2 d→c, 3 a→d
					edges.length = 0;
					if (sgn(g[A]) !== sgn(g[Bq])) {
						cross(A, Bq, E, 0);
						edges.push(0);
					}
					if (sgn(g[Bq]) !== sgn(g[Cq])) {
						cross(Bq, Cq, E, 3);
						edges.push(3);
					}
					if (sgn(g[D]) !== sgn(g[Cq])) {
						cross(D, Cq, E, 6);
						edges.push(6);
					}
					if (sgn(g[A]) !== sgn(g[D])) {
						cross(A, D, E, 9);
						edges.push(9);
					}
					for (let e = 0; e + 1 < edges.length; e += 2) {
						const u = edges[e];
						const v = edges[e + 1];
						seg(E[u], E[u + 1], E[u + 2], E[v], E[v + 1], E[v + 2], i, al, wd, true);
					}
				}
			}
			// The THREAD: where the body is a few pixels across its two contour
			// lines merge (and under 0.3 px are left out), so the centreline is
			// drawn as wide as the body is — a swimmer far off, or leading the
			// lens into a glass at ~40 px long, keeps its tail.
			for (let i = 0; i < iLast; i++) {
				const a = 3 * i;
				const dpx = RPX[i] + RPX[i + 1]; // the diameter on the board
				const th = 1 - smooth(span(dpx, 1.5, 3.5));
				if (th < 0.02) continue;
				const inner = 1.2 * Math.max(SA[i], SB[i]) * sc;
				const wd = width * Math.max(0.7, Math.min(1.5, 0.4 + dpx));
				seg(
					CS[a],
					CS[a + 1],
					CS[a + 2],
					CS[a + 3],
					CS[a + 4],
					CS[a + 5],
					i,
					al * th,
					wd,
					true,
					inner,
					true
				);
			}
		}
		const g0 = ctx.globalAlpha;
		pen.flush(ctx);
		if (heads.length) {
			ctx.save();
			ctx.globalAlpha = g0 * 0.9 * alpha;
			ctx.fillStyle = color;
			ctx.beginPath();
			for (const [x, y] of heads) {
				ctx.moveTo(x + 1.6, y);
				ctx.arc(x, y, 1.6, 0, TAU);
			}
			ctx.fill();
			ctx.restore();
		}
		return { box: [box[0], box[1], box[2], box[3]] };
	}

	// The whole skin into SELF (so a draw after it reuses it), then into Z.
	function fillDepth(Z, cam, sh, pose) {
		prepare(cam, sh, pose);
		if (Z.s !== SELF.s) {
			raster(Z, 0, n - 1);
			return;
		}
		selfDepth(Z.W, Z.H, 0, n - 1, 0, 0);
		const A = SELF.buf;
		const B = Z.buf;
		for (let y = dirty[1]; y <= dirty[3]; y++)
			for (let k = y * Z.W + dirty[0], e = y * Z.W + dirty[2]; k <= e; k++)
				if (A[k] < B[k]) B[k] = A[k];
	}

	const centre = (i) => [O[3 * i], O[3 * i + 1], O[3 * i + 2]];
	return {
		spec,
		stations: ST,
		rings: RINGS,
		parts: L.parts,
		length: LEN,
		M,
		shape,
		draw,
		fillDepth,
		nose(sh, pose) {
			place(sh, pose);
			return centre(0);
		},
		tip(sh, pose) {
			place(sh, pose);
			return centre(n - 1);
		},
		at(sh, pose, s) {
			place(sh, pose);
			let i = 0;
			while (i < n - 2 && SS[i + 1] < s) i++;
			const f = clamp01((s - SS[i]) / (SS[i + 1] - SS[i]));
			const a = centre(i);
			const b = centre(i + 1);
			return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
		},
		ring(sh, i, pose, m = M) {
			place(sh, pose);
			const out = [];
			const f0 = MF / 4;
			for (let q = 0; q <= m; q++) {
				const f = (f0 + Math.round((q * MF) / m)) % MF;
				out.push(worldAt(i, f, sh.form));
			}
			return out;
		}
	};
}
