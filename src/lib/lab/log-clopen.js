import {
	getBoard,
	clearBoard,
	makeView,
	stroke,
	disc,
	math,
	PAL,
	TAU,
	PHI,
	C,
	span,
	smooth,
	lerp,
	clamp01,
	clock,
	variant,
	tag
} from './log/board.js';
import { glow, lit, lecture } from './log/ink.js';

// ── Sketch: log-clopen — playing with the maths, and the clopen geometry ─────
// Free play, not a slot in the run: five small films of true mathematics in
// the board's hand — bold cyan, pink and gold line, grey nodes, chalk
// captions — each ten seconds and a pure function of progress, that build,
// move and resolve. Every one opens on a lit point at the centre of what it
// is about to draw and ends on one (a gold disc, a cream core): the way in and
// the way on, so they chain, or can sit under a beat, a loading screen or a
// transition. One per ?v=:
//
//   schottky   (default) Indra's pearls. Four circles round the unit circle,
//              C_a, C_b, C_A, C_B (centre sec α, radius tan α: each meets it
//              at right angles), paired by two Möbius maps, a(z) = c_a +
//              r²e^{iψ}/(z − c_A) taking the outside of C_A onto the inside of
//              C_a, b likewise, A and B their inverses. Every reduced word in
//              a, A, b, B is a disc inside the disc of its first letter
//              (coloured by it: a cyan, b gold, A pink, B rose); drawn depth by
//              depth — the four, then 12, 36, … — they nest down to the limit
//              set Λ, a Cantor dust (compact, totally disconnected, every
//              piece of it clopen), drawn as points once a disc is under a
//              pixel or so. Then the twists ψ go (ψ_a = π, ψ_b = 0: both maps
//              keep the unit circle) and α grows from 42.5° to 45°, where each
//              circle kisses its neighbours: the group is Fuchsian, the
//              punctured-torus group, and Λ has closed up into the unit circle,
//              a necklace of kissing beads. Last, one point of Λ is named by an
//              endless word — the Fibonacci word a b a a b a b a … — its
//              nested discs lit gold as the lens pushes in on it.
//   doyle      a Doyle spiral: circles centred on z = aᵐbⁿ, radius ρ|z|, each
//              kissing six (az, bz, (b/a)z and their inverses). a, b and ρ are
//              solved at start (Newton, from the hexagonal guess) from
//              |1 − a| = ρ(1 + |a|), |1 − b| = ρ(1 + |b|), |a − b| = ρ(|a| +
//              |b|) with a⁸ = b¹³ — 13, 8 and 5 spiral arms, the sunflower's
//              numbers: a = 1.743 e^{−0.073i}, b = 1.408 e^{0.438i}, ρ = 0.2731,
//              the tangencies holding to 4e−16 (window.__lab reports them). The
//              net of 8-arms (cyan, pink) and 5-arms (rose) is written out of
//              the lit centre with grey nodes on its crossings; the nodes swell
//              into circles until they kiss (one, at b, shows its six points of
//              contact); a 5-arm lights gold; and the lens zooms in by the
//              packing's own map z ↦ az, gathering pace — at every whole step
//              the picture is itself again — into the lit centre.
//   apollonian the integral Apollonian gasket: the circle of curvature −1 and
//              three inside it, 2, 2, 3, then generation by generation the
//              circle tangent to three (Descartes, k₄ = k₁ + k₂ + k₃ ±
//              2√(k₁k₂ + k₂k₃ + k₃k₁), the centres by its complex form — exact
//              integers here, k and k·z), every curvature written in. Hidden
//              in it is a chain −1, 2, 2, 3, 15, 38, 110, 323, … in which any
//              four in a row kiss (each the reflection of the one four back):
//              its numbers turn gold, its kissing points light. The Möbius map
//              G taking each link to the next is loxodromic, multiplier exactly
//              φ + √φ (Coxeter's number; the sketch computes it). The lens then
//              holds G's attracting point p⁺ and sends its repelling point p⁻
//              to ∞ along a path of Möbius maps — the rim swings open, the
//              gasket turns inside out into Coxeter's loxodromic spiral
//              packing, the chain outlined gold — and zooms by G itself (×2.89
//              and a turn of 128° a step), so the gasket keeps coming back,
//              into the lit point.
//   padic      ℤ₂, "every ball is clopen": a disc holds two discs, each holds
//              two, …, the children a quarter-turn apart each level, labelled
//              by their last binary digits (…01); every ball a + 2ⁿℤ₂ is open
//              and closed. The ultrametric's oddities on the board: the
//              triangle 0, 1, 2 has sides 1, 1, ½ in |·|₂ (every triangle is
//              isosceles, whatever the picture says); B(0, ½) = B(2, ½) (every
//              point of a ball is its centre); −1 = …1111₂ and ⅓ = …0101011₂
//              as paths of nested balls. Then the lens zooms down a birthday's
//              digits (14·02·1987 as 19870214), one level — ×2 in |·|₂ — at a
//              time, gathering pace, the digits read off as it goes, to the
//              lit point the number is.
//   ford       Ford circles: over every p/q a circle of radius 1/2q² (cyan),
//              mirrored below (pink); two kiss exactly when |ps − qr| = 1, the
//              mediant between them. 1/φ = [0; 1, 1, 1, …]: the vertical line
//              through it grazes the circles at every convergent F_n/F_{n+1}
//              (gold), only just — |1/φ − F_n/F_{n+1}| ≈ 1/√5F²_{n+1} against
//              a radius of 1/2F²_{n+1}, the worst approximable number — and the
//              lens zooms into 1/φ on the line by φ¹³, the gold circles coming
//              one after another on alternate sides, forever. Lit at 1/φ.
//
// Each frame's work is capped by size on screen: a disc, ball or circle under
// a pixel or two is not refined further, and a gap whose image is off the
// board is not entered, so the recursion depth follows the zoom (under 25 ms a
// frame headless, pixels included).

const SECONDS = 10;
// The plates' rose, lifted a little so it reads as a family colour of its own.
const ROSE = '#c99e90';

export default async function make({ at }) {
	const v = variant(['schottky', 'doyle', 'apollonian', 'padic', 'ford']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const setup = { schottky: schottkySetup, doyle: doyleSetup, apollonian: apolloSetup };
	const S = setup[v] ? setup[v]() : null;
	const draw = { schottky, doyle, apollonian, padic, ford }[v];

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		draw(ctx, w, h, time.u, time.t, S);
		tag(ctx, w, h, `log-clopen · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v, ...(S?.info ?? {}) },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── Möbius maps, as 2×2 complex matrices [a, b, c, d]: z ↦ (az + b)/(cz + d) ──
const ONE = [1, 0];
const ZERO = [0, 0];
const ID = [ONE, ZERO, ZERO, ONE];
const conj = (z) => [z[0], -z[1]];
const neg = (z) => [-z[0], -z[1]];
const abs2 = (z) => z[0] * z[0] + z[1] * z[1];
const mmul = (X, Y) => [
	C.add(C.mul(X[0], Y[0]), C.mul(X[1], Y[2])),
	C.add(C.mul(X[0], Y[1]), C.mul(X[1], Y[3])),
	C.add(C.mul(X[2], Y[0]), C.mul(X[3], Y[2])),
	C.add(C.mul(X[2], Y[1]), C.mul(X[3], Y[3]))
];
const minv = (X) => [X[3], neg(X[1]), neg(X[2]), X[0]];
const mdet = (X) => C.sub(C.mul(X[0], X[3]), C.mul(X[1], X[2]));
const mapp = (X, z) => C.div(C.add(C.mul(X[0], z), X[1]), C.add(C.mul(X[2], z), X[3]));
// The image of the circle |z − c| = r: [centre, radius]. Möbius maps keep
// circles circles; the radius is Infinity when the circle runs through the
// pole (its image is a line).
function mcircle(X, c, r) {
	const [a, b, g, d] = X;
	const q = C.add(C.mul(g, c), d);
	const den = abs2(q) - abs2(g) * r * r;
	if (den === 0) return [[Infinity, Infinity], Infinity];
	const num = C.sub(C.mul(C.add(C.mul(a, c), b), conj(q)), C.scale(C.mul(a, conj(g)), r * r));
	return [C.scale(num, 1 / den), (r * C.abs(mdet(X))) / Math.abs(den)];
}
// The map taking three points to three points (through 0, 1, ∞).
const toStd = ([z1, z2, z3]) => [
	C.sub(z2, z3),
	neg(C.mul(z1, C.sub(z2, z3))),
	C.sub(z2, z1),
	neg(C.mul(z3, C.sub(z2, z1)))
];
const mthree = (Z, W) => mmul(minv(toStd(W)), toStd(Z));
const csqrt = (z) => C.polar(Math.sqrt(C.abs(z)), C.arg(z) / 2);
// The circle through three points (px), or null when they are in a line.
function circum(a, b, c) {
	const bx = b[0] - a[0];
	const by = b[1] - a[1];
	const cx = c[0] - a[0];
	const cy = c[1] - a[1];
	const d = 2 * (bx * cy - by * cx);
	const b2 = bx * bx + by * by;
	const c2 = cx * cx + cy * cy;
	if (!(Math.abs(d) > 1e-9 * (b2 + c2))) return null;
	const ux = (cy * b2 - by * c2) / d;
	const uy = (bx * c2 - cx * b2) / d;
	return [a[0] + ux, a[1] + uy, Math.hypot(ux, uy)];
}

// ── Drawing circles ──────────────────────────────────────────────────────────
// Circles [x, y, r] in px as one path: outlines written on to `upto` of a
// turn from the top, or filled.
function rings(ctx, list, o) {
	const { color, width = 1.5, alpha = 1, upto = 1, fill = false } = o;
	if (!list.length || alpha <= 0.003 || upto <= 0) return;
	const from = -Math.PI / 2;
	const end = from + TAU * Math.min(1, upto);
	ctx.save();
	ctx.globalAlpha = Math.min(1, alpha);
	ctx.beginPath();
	for (const [x, y, r] of list) {
		ctx.moveTo(x + r * Math.cos(from), y + r * Math.sin(from));
		ctx.arc(x, y, r, from, end);
	}
	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineCap = 'round';
		ctx.stroke();
	}
	ctx.restore();
}
// Does a circle's outline cross the board (w × h, with a margin)?
function outlineOn(x, y, r, w, h, m = 4) {
	if (!(r > 0) || !Number.isFinite(x + y + r)) return false;
	const nx = Math.max(-m, Math.min(w + m, x));
	const ny = Math.max(-m, Math.min(h + m, y));
	if (Math.hypot(x - nx, y - ny) > r) return false; // wholly off the board
	const fx = Math.max(Math.abs(x + m), Math.abs(x - w - m));
	const fy = Math.max(Math.abs(y + m), Math.abs(y - h - m));
	return Math.hypot(fx, fy) > r; // not round the whole board
}
// A huge circle (a line, nearly) as the stretch of it across the board.
function bigArc(ctx, x, y, r, w, h, o) {
	const a0 = Math.atan2(h / 2 - y, w / 2 - x);
	const hs = Math.min(Math.PI, (1.6 * Math.hypot(w, h)) / r);
	const pts = [];
	for (let i = 0; i <= 48; i++) {
		const a = a0 - hs + (2 * hs * i) / 48;
		pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
	}
	stroke(ctx, pts, o);
}

// Every film opens on a lit point in the middle of the board — where every
// one of them ends, so they chain — that drifts to the centre of what is about
// to be drawn, (x, y), and lets go.
function opening(ctx, w, h, x, y, u) {
	const a = 1 - smooth(span(u, 0.03, 0.13));
	if (a <= 0) return;
	const k = smooth(span(u, 0, 0.12));
	const ox = lerp(w / 2, x, k);
	const oy = lerp(h / 2, y, k);
	glow(ctx, ox, oy, 160, [255, 214, 140], 0.45 * a);
	lit(ctx, ox, oy, 9, a);
}

// Lecture blocks that take turns top left: { lines: [[text, from, to]], from,
// to } — each line written on over [from, to], the block rubbed out at `to`.
function lectures(ctx, w, h, u, blocks) {
	for (const { lines, from, to } of blocks) {
		if (u < from) continue;
		const k = 1 - smooth(span(u, to - 0.05, to));
		if (k <= 0) continue;
		lecture(
			ctx,
			w,
			h,
			lines.map(([s, a, b]) => [s, span(u, a, b), k])
		);
	}
}

// ═══ schottky ════════════════════════════════════════════════════════════════
// Generators in the order a, b, A, B; g's inverse is (g + 2) % 4. D[g] is the
// disc g maps into: the outside of D[g⁻¹] onto the inside of D[g].
const SCH = {
	a0: (42.5 * Math.PI) / 180, // the circles' half-angle on the unit circle, at first
	a1: Math.PI / 4, // when they kiss
	twa: 1.1, // the twists ψ_a − π and ψ_b, at first
	twb: -0.8,
	zoom: 7 // the push in at the end
};
const SCH_COL = [PAL.cyan, PAL.gold, PAL.pink, ROSE];
const SCH_NAME = ['C_{a}', 'C_{b}', 'C_{A}', 'C_{B}'];

// Four circles round the unit circle at 0°, 90°, 180°, 270°, each meeting it
// at right angles over an arc of half-angle α: centre sec α, radius tan α.
// g(z) = c_g + r²e^{iψ}/(z − c_{g⁻¹}); ψ_a = π, ψ_b = 0 is the Fuchsian pair
// (both keep the unit circle), the twists move off it.
function schottkyGroup(al, twa, twb) {
	const d = 1 / Math.cos(al);
	const r = Math.tan(al);
	const cen = [
		[d, 0],
		[0, d],
		[-d, 0],
		[0, -d]
	];
	const k = [C.polar(r * r, Math.PI + twa), C.polar(r * r, twb)];
	const G = cen.map((c, g) => {
		const ci = cen[(g + 2) % 4];
		return [c, C.sub(k[g % 2], C.mul(c, ci)), ONE, neg(ci)];
	});
	return { cen, r, G };
}

// The Fibonacci word a b a a b a b a a b …, as 0 (a) and 1 (b).
function fibWord(n) {
	let s = [0];
	while (s.length < n) s = s.flatMap((x) => (x === 0 ? [0, 1] : [0]));
	return s.slice(0, n);
}

function schottkySetup() {
	const word = fibWord(40);
	const grp = schottkyGroup(SCH.a1, 0, 0);
	let M = ID;
	for (const x of word) M = mmul(M, grp.G[x]);
	return { word, pt: mapp(M, ZERO) };
}

// Every reduced word's disc down to `depth` letters, or until it is under
// `minPx` on the board: per level, [x, y, r, first letter].
function schottkyLevels(grp, view, depth, minPx, w, h) {
	const levels = [];
	const sc = view.scale;
	const visit = (M, last, d, first) => {
		for (let x = 0; x < 4; x++) {
			if (d > 0 && x === (last + 2) % 4) continue;
			const [c, r] = d === 0 ? [grp.cen[x], grp.r] : mcircle(M, grp.cen[x], grp.r);
			const [sx, sy] = view.to(c);
			const sr = r * sc;
			if (sx + sr < -8 || sx - sr > w + 8 || sy + sr < -8 || sy - sr > h + 8) continue;
			const f = d === 0 ? x : first;
			(levels[d] ||= []).push([sx, sy, sr, f]);
			if (sr < minPx || d + 1 >= depth) continue;
			visit(d === 0 ? grp.G[x] : mmul(M, grp.G[x]), x, d + 1, f);
		}
	};
	visit(ID, -1, 0, -1);
	return levels;
}

function schottky(ctx, w, h, u, secs, S) {
	const def = smooth(span(u, 0.5, 0.74));
	const al = lerp(SCH.a0, SCH.a1, def);
	const grp = schottkyGroup(al, SCH.twa * (1 - def), SCH.twb * (1 - def));
	// The lens: the four circles fitted to the board, a little right of centre
	// for the lecture, then a push in on the word's point, gathering pace.
	const ext = 1 / Math.cos(al) + Math.tan(al);
	const zu = span(u, 0.7, 1);
	const Z = Math.exp(Math.log(SCH.zoom) * zu * zu);
	const e = smooth(span(u, 0.68, 0.94));
	const scale = ((0.46 * h) / ext) * Z;
	const c = C.scale(S.pt, e);
	const ox = 0.07 * w * (1 - e);
	const view = makeView({
		w,
		h,
		scale,
		cx: w / 2 + ox - scale * c[0],
		cy: h / 2 + 0.02 * h * (1 - e) + scale * c[1]
	});
	const [ux, uy] = view.to(ZERO);
	opening(ctx, w, h, ux, uy, u);

	// The unit circle: rose construction, and once the circles kiss, Λ itself.
	const unit = [[ux, uy, scale]];
	rings(ctx, unit, { color: PAL.rose, width: 1.4, alpha: 0.45, upto: span(u, 0, 0.08) });
	const close = smooth(span(u, 0.66, 0.76));
	if (close > 0) {
		rings(ctx, unit, { color: PAL.chalk, width: 2, alpha: 0.55 * close });
	}

	// Depth by depth: the four circles, then the words of two letters, …
	const T = [0.02, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
	const deep = u >= 0.45;
	const depth = deep ? 60 : T.filter((t) => u >= t).length;
	const levels = schottkyLevels(grp, view, depth, 1.4, w, h);
	const shown = deep ? 9 : depth;
	for (let d = 0; d < levels.length; d++) {
		const L = levels[d];
		if (!L) continue;
		const upto = d < T.length ? span(u, T[d], T[d] + 0.05) : 1;
		const fresh = d < T.length ? 1 : smooth(span(u, 0.45, 0.5));
		const age = Math.max(0, shown - 1 - d);
		const a = lerp(1, 0.55, clamp01(age / 4)) * fresh;
		const wd = Math.max(0.9, 3 * Math.pow(0.78, d));
		for (let g = 0; g < 4; g++) {
			const ring = [];
			const dots = [];
			for (const it of L) if (it[3] === g) (it[2] >= 2.2 ? ring : dots).push(it);
			rings(ctx, ring, { color: SCH_COL[g], width: wd, alpha: a, upto });
			// The dust — Λ, near enough — as points with a little light round them.
			const da = Math.min(1, a + 0.4) * upto;
			rings(
				ctx,
				dots.map(([x, y, r]) => [x, y, Math.max(1, r) + 1.8]),
				{ color: SCH_COL[g], alpha: 0.22 * da, fill: true }
			);
			rings(
				ctx,
				dots.map(([x, y, r]) => [x, y, Math.max(1, r)]),
				{ color: SCH_COL[g], alpha: da, fill: true }
			);
		}
	}

	// The circles' names, beside them an eighth of a turn round.
	const la = span(u, 0.06, 0.12) * (1 - smooth(span(u, 0.72, 0.8)));
	if (la > 0) {
		for (let g = 0; g < 4; g++) {
			const dir = C.rot(C.scale(grp.cen[g], 1 / C.abs(grp.cen[g])), Math.PI / 4);
			const p = C.add(grp.cen[g], C.scale(dir, grp.r + 0.16));
			const [x, y] = view.to(p);
			math(ctx, SCH_NAME[g], x, y, { size: 24, align: 'center', alpha: la, color: SCH_COL[g] });
		}
	}

	// One point of Λ, by its endless word: the nested discs lit gold.
	const gp = span(u, 0.76, 0.96);
	if (gp > 0) {
		let M = ID;
		const gold = [];
		for (let j = 0; j < S.word.length; j++) {
			const x = S.word[j];
			const [cc, r] = j === 0 ? [grp.cen[x], grp.r] : mcircle(M, grp.cen[x], grp.r);
			M = mmul(M, grp.G[x]);
			const [sx, sy] = view.to(cc);
			const sr = r * scale;
			if (sr < 2.5) break;
			if (j / 14 > gp) break;
			if (sr < 0.9 * h) gold.push([sx, sy, sr, 1 - span(sr, 0.45 * h, 0.9 * h)]);
		}
		for (const [x, y, r, a] of gold)
			rings(ctx, [[x, y, r]], { color: PAL.gold, width: 2.6, alpha: 0.95 * a });
	}
	const [px, py] = view.to(S.pt);
	const lp = smooth(span(u, 0.84, 1));
	if (lp > 0) {
		glow(ctx, px, py, 80 + 140 * lp, [255, 214, 140], 0.35 * lp);
		lit(ctx, px, py, 5 + 5 * lp, lp);
	}

	lectures(ctx, w, h, u, [
		{
			from: 0.03,
			to: 0.47,
			lines: [
				['a(z) = c_{a} + r^{2}e^{iψ} / (z − c_{A})', 0.05, 0.13],
				['takes the outside of C_{A} to the inside of C_{a}', 0.11, 0.19],
				['a word in a, A, b, B: a disc in a disc', 0.21, 0.29]
			]
		},
		{
			from: 0.44,
			to: 0.77,
			lines: [
				['Λ: a Cantor set — clopen to the core', 0.44, 0.51],
				['untwist ψ, and let the circles kiss:', 0.53, 0.6],
				['Λ closes up into a circle', 0.68, 0.74]
			]
		},
		{
			from: 0.76,
			to: 1.1,
			lines: [
				['a point of Λ is an endless word:', 0.77, 0.83],
				['a b a a b a b a a b a a b …  (Fibonacci)', 0.82, 0.92]
			]
		}
	]);
}

// ═══ doyle ═══════════════════════════════════════════════════════════════════
const DOY = { p: 8, q: 13, steps: 7 };

// Solve for a, b, ρ: a = e^{x+iy}, b = a^{p/q} e^{2πi/q} (so a^p = b^q), and
// the three tangencies agree on ρ. Newton from the hexagonal guess
// q log b − p log a = 2πi with log a, log b at 60°.
function doyleSolve(p, q) {
	const logs = ([x, y]) => [
		[x, y],
		[(p * x) / q, (p * y + TAU) / q]
	];
	const parts = (l) => {
		const [La, Lb] = logs(l);
		const a = C.exp(La);
		const b = C.exp(Lb);
		const ra = C.abs(a);
		const rb = C.abs(b);
		return [
			C.abs(C.sub(ONE, a)) / (1 + ra),
			C.abs(C.sub(ONE, b)) / (1 + rb),
			C.abs(C.sub(a, b)) / (ra + rb)
		];
	};
	const res = (l) => {
		const [r1, r2, r3] = parts(l);
		return [r1 - r2, r1 - r3];
	};
	let l = C.div([0, TAU], C.sub(C.polar(q, Math.PI / 3), [p, 0]));
	for (let it = 0; it < 50; it++) {
		const f = res(l);
		const e = 1e-7;
		const fx = res([l[0] + e, l[1]]);
		const fy = res([l[0], l[1] + e]);
		const j00 = (fx[0] - f[0]) / e;
		const j01 = (fy[0] - f[0]) / e;
		const j10 = (fx[1] - f[1]) / e;
		const j11 = (fy[1] - f[1]) / e;
		const det = j00 * j11 - j01 * j10;
		const dx = (j11 * f[0] - j01 * f[1]) / det;
		const dy = (j00 * f[1] - j10 * f[0]) / det;
		l = [l[0] - dx, l[1] - dy];
		if (Math.hypot(dx, dy) < 1e-15) break;
	}
	const [La, Lb] = logs(l);
	const a = C.exp(La);
	const b = C.exp(Lb);
	const rho = parts(l)[0];
	const ra = C.abs(a);
	const rb = C.abs(b);
	const err = Math.max(
		Math.abs(C.abs(C.sub(ONE, a)) - rho * (1 + ra)),
		Math.abs(C.abs(C.sub(ONE, b)) - rho * (1 + rb)),
		Math.abs(C.abs(C.sub(a, b)) - rho * (ra + rb))
	);
	return { La, Lb, a, b, rho, err };
}

function doyleSetup() {
	const D = { ...DOY, ...doyleSolve(DOY.p, DOY.q) };
	D.info = { doyle: { a: D.a, b: D.b, rho: D.rho, tangencyError: D.err } };
	return D;
}

function doyle(ctx, w, h, u, secs, D) {
	const { p, q, La, Lb, rho } = D;
	const cx = w / 2;
	const cy = h / 2;
	const S0 = 0.24 * h; // px for |z| = 1
	const diag = Math.hypot(w, h) / 2;
	// The zoom: s steps of z ↦ az, the board divided by a^s, gathering pace.
	const s = DOY.steps * Math.pow(span(u, 0.42, 1), 1.8);
	const k = C.scale(La, -s);
	const at = (l) => {
		const z = C.exp(C.add(l, k));
		return [cx + S0 * z[0], cy - S0 * z[1], C.abs(z)];
	};
	// The net out of the centre: up to the radius Rw (in |z| on the board).
	const write = span(u, 0.0, 0.2);
	const Rw = Math.exp(lerp(Math.log(0.004), Math.log(diag / S0 + 1), Math.pow(write, 0.8)));
	const lo = Math.log(0.5 / (S0 * rho));
	const hi = Math.log(diag / (S0 * (1 - rho)));
	const netA = (1 - smooth(span(u, 0.3, 0.46))) * (write > 0 ? 1 : 0);
	// b-arms (8, alternating cyan / pink) and the 5 arms of b/a (rose).
	const arm = (base, dir, color, alpha, width) => {
		const rd = dir[0];
		const kr = k[0];
		const t0 = (lo - 1.5 - base[0] - kr) / rd;
		const t1 = (Math.log(Math.min(Rw, Math.exp(hi + 0.3))) - base[0] - kr) / rd;
		if (t1 <= t0) return;
		const pts = [];
		const n = Math.ceil((t1 - t0) * 30);
		for (let i = 0; i <= n; i++) {
			const t = t0 + ((t1 - t0) * i) / n;
			const [x, y] = at(C.add(base, C.scale(dir, t)));
			pts.push([x, y]);
		}
		stroke(ctx, pts, { color, width, alpha });
	};
	if (netA > 0.01) {
		for (let m = 0; m < p; m++)
			arm(C.scale(La, m), Lb, m % 2 ? PAL.pink : PAL.cyan, 0.85 * netA, 2);
		const ab = C.sub(La, Lb);
		for (let n = 0; n < q - p; n++) arm(C.scale(Lb, n), ab, ROSE, 0.6 * netA, 1.4);
	}

	// The circles: swell out of the nodes until they kiss.
	const grow = smooth(span(u, 0.16, 0.36));
	const g = lerp(0.2, 1, grow);
	const byCol = [[], []];
	const nodes = [];
	const gold = [];
	const goldU = (lz) => 0.34 + 0.09 * clamp01((hi - lz) / (hi - lo));
	for (let n = 0; n < q; n++) {
		const base = n * Lb[0] + k[0];
		const m0 = Math.ceil((lo - base) / La[0]);
		const m1 = Math.floor((hi - base) / La[0]);
		for (let m = m0; m <= m1; m++) {
			const [x, y, r] = at(C.add(C.scale(La, m), C.scale(Lb, n)));
			if (r > Rw) continue;
			const sr = S0 * rho * r;
			if (!outlineOn(x, y, sr * g, w, h)) continue;
			const fam = ((m % 2) + 2) % 2;
			if (grow > 0) byCol[fam].push([x, y, sr * g]);
			nodes.push([x, y, Math.max(0.8, 0.2 * sr)]);
			if ((((m + n) % (q - p)) + (q - p)) % (q - p) === 0) {
				const lz = Math.log(r);
				const gu = goldU(lz);
				if (u > gu) gold.push([x, y, sr, smooth(span(u, gu, gu + 0.03))]);
			}
		}
	}
	const na = 1 - smooth(span(u, 0.2, 0.34));
	rings(ctx, nodes, { color: PAL.node, fill: true, alpha: 0.9 * na * span(u, 0.02, 0.1) });
	const ca = smooth(span(u, 0.16, 0.24));
	rings(ctx, byCol[0], { color: PAL.cyan, width: 1.8, alpha: ca });
	rings(ctx, byCol[1], { color: PAL.pink, width: 1.8, alpha: ca });
	for (const [x, y, sr, a] of gold)
		rings(ctx, [[x, y, sr]], { color: PAL.gold, width: Math.min(3.4, 1.4 + sr * 0.03), alpha: a });

	// Every circle kisses six: the circle at b, its six points of contact.
	const kiss = smooth(span(u, 0.3, 0.35)) * (1 - smooth(span(u, 0.46, 0.52)));
	if (kiss > 0) {
		const zl = Lb;
		const [x, y, r] = at(zl);
		rings(ctx, [[x, y, S0 * rho * r]], { color: PAL.chalk, width: 3, alpha: kiss });
		const nb = [La, Lb, C.sub(Lb, La)];
		for (const l of [...nb, ...nb.map(neg)]) {
			const [nx, ny, nr] = at(C.add(zl, l));
			const f = r / (r + nr);
			disc(ctx, x + (nx - x) * f, y + (ny - y) * f, 4.5, { fill: PAL.chalk, alpha: kiss });
		}
	}

	// The centre, lit: the way in, dimmed while the net is written, the way on.
	const lc = smooth(span(u, 0.5, 1));
	opening(ctx, w, h, cx, cy, u);
	glow(ctx, cx, cy, 30 + 160 * lc, [255, 220, 150], 0.25 + 0.4 * lc);
	lit(ctx, cx, cy, 3 + 7 * lc, 0.3 + 0.7 * lc);

	const fa = (x) => x.toFixed(3);
	const rad = (z) =>
		`${fa(C.abs(z))} e^{${C.arg(z) < 0 ? '−' : ''}${Math.abs(C.arg(z)).toFixed(3)}i}`;
	lectures(ctx, w, h, u, [
		{
			from: 0.03,
			to: 0.5,
			lines: [
				['z_{m,n} = a^{m} b^{n},   radius ρ |z_{m,n}|', 0.04, 0.13],
				['every circle kisses six', 0.3, 0.36],
				['|1 − a| = ρ(1 + |a|),  |a − b| = ρ(|a| + |b|)', 0.37, 0.45]
			]
		},
		{
			from: 0.5,
			to: 1.1,
			lines: [
				[`a^{${p}} = b^{${q}}:  ${q}, ${p} and ${q - p} spiral arms`, 0.5, 0.58],
				[`a = ${rad(D.a)},  ρ = ${D.rho.toFixed(4)}`, 0.57, 0.65],
				['z ↦ a z maps the packing to itself', 0.65, 0.73]
			]
		}
	]);
}

// ═══ apollonian ══════════════════════════════════════════════════════════════
// A circle is [k, X, Y]: curvature k (negative for the bounding circle) and
// k·centre = X + iY. In the integral gasket all three are integers, and the
// Descartes reflection — the other circle tangent to the same three —
// keeps them integers: k' = 2(k₁ + k₂ + k₃) − k, likewise X, Y.
const AP_ROOT = [
	[-1, 0, 0], // the bounding circle
	[2, -1, 0],
	[2, 1, 0],
	[3, 0, 2]
];
const apRefl = (a, b, c, d) => [
	2 * (a[0] + b[0] + c[0]) - d[0],
	2 * (a[1] + b[1] + c[1]) - d[1],
	2 * (a[2] + b[2] + c[2]) - d[2]
];
const apCentre = (c) => [c[1] / c[0], c[2] / c[0]];
const apTouch = (a, b) => [(a[1] + b[1]) / (a[0] + b[0]), (a[2] + b[2]) / (a[0] + b[0])];
const AP = { T: [0.02, 0.1, 0.135, 0.17, 0.205, 0.24, 0.275, 0.31, 0.345], zoom: 3.2 };

function apolloSetup() {
	// The chain: C_0..C_3 the root, C_{n+4} the reflection of C_n in the three
	// between, both ways.
	const chain = new Map();
	AP_ROOT.forEach((c, i) => chain.set(i, c));
	for (let n = 4; n <= 30; n++)
		chain.set(n, apRefl(chain.get(n - 1), chain.get(n - 2), chain.get(n - 3), chain.get(n - 4)));
	for (let n = -1; n >= -26; n--)
		chain.set(n, apRefl(chain.get(n + 1), chain.get(n + 2), chain.get(n + 3), chain.get(n + 4)));
	const tp = (i, j) => apTouch(chain.get(i), chain.get(j));
	// G: C_n → C_{n+1}, by where it sends three points of tangency.
	let G = mthree([tp(0, 1), tp(0, 2), tp(1, 2)], [tp(1, 2), tp(1, 3), tp(2, 3)]);
	const sd = csqrt(mdet(G));
	G = G.map((x) => C.div(x, sd));
	const [a, b, c, d] = G;
	const dsc = csqrt(C.add(C.mul(C.sub(a, d), C.sub(a, d)), C.scale(C.mul(b, c), 4)));
	const f1 = C.div(C.add(C.sub(a, d), dsc), C.scale(c, 2));
	const f2 = C.div(C.sub(C.sub(a, d), dsc), C.scale(c, 2));
	const dz = (z) => C.div(ONE, C.mul(C.add(C.mul(c, z), d), C.add(C.mul(c, z), d)));
	const [pp, pm] = C.abs(dz(f1)) < 1 ? [f1, f2] : [f2, f1];
	const kappa = dz(pp); // G near its attracting point: z − p⁺ ↦ κ(z − p⁺)
	// The lens's end map T: p⁺ ↦ 0, p⁻ ↦ ∞, unit derivative at p⁺. Under it G is
	// w ↦ κw exactly, and the chain is Coxeter's: radii falling by |κ| a step.
	const eps1 = C.div(ONE, C.sub(pm, pp));
	const T1 = [ONE, neg(pp), neg(eps1), C.add(ONE, C.mul(eps1, pp))];
	// The chain's kissing points t_n (C_n with C_{n+1}) lie on one flow line
	// of G: in T's frame the spiral w = w₀κˢ, s real.
	const w0 = mapp(T1, tp(0, 1));
	const keys = new Set([...chain.values()].map((c) => c.join(',')));
	return {
		chain,
		keys,
		pp,
		pm,
		kappa,
		logk: C.log(kappa),
		eps1,
		T1inv: minv(T1),
		w0,
		info: { apollonian: { multiplier: 1 / C.abs(kappa), phiPlusRootPhi: PHI + Math.sqrt(PHI) } }
	};
}

// All circles of the gasket whose image under X is on the board and over
// minPx, up to generation maxGen: [x, y, r, gen, k, key] (key: "k,X,Y").
function gasket(X, view, maxGen, minPx, w, h) {
	const out = [];
	const img = (c) => {
		const [cc, rr] = mcircle(X, apCentre(c), 1 / Math.abs(c[0]));
		const [x, y] = view.to(cc);
		return [x, y, rr * view.scale];
	};
	const onB = (s) => outlineOn(s[0], s[1], s[2], w, h);
	const fin = (z) => Number.isFinite(z[0]) && Number.isFinite(z[1]) && Math.abs(z[0]) < 1e12;
	// A gap — the curvilinear triangle between three circles — lies on the
	// side of their dual circle (through the three touching points) that
	// holds the circle inscribed in it; skip it when that side is off the
	// board, and stop refining once its inscribed circle is under minPx
	// (when the side is bounded, nothing in it is bigger).
	const gapState = (c1, c2, c3, nc) => {
		const P = [apTouch(c2, c3), apTouch(c1, c3), apTouch(c1, c2)].map((t) => mapp(X, t));
		if (!P.every(fin)) return [false, false];
		const D = circum(...P.map((z) => view.to(z)));
		if (!D) return [false, false];
		const q = mapp(X, apCentre(nc));
		const Q = fin(q) ? view.to(q) : null;
		const inside = Q && Math.hypot(Q[0] - D[0], Q[1] - D[1]) < D[2];
		const nx = Math.max(0, Math.min(w, D[0]));
		const ny = Math.max(0, Math.min(h, D[1]));
		if (inside) return [Math.hypot(D[0] - nx, D[1] - ny) > D[2], true];
		const fx = Math.max(Math.abs(D[0]), Math.abs(D[0] - w));
		const fy = Math.max(Math.abs(D[1]), Math.abs(D[1] - h));
		return [Math.hypot(fx, fy) < D[2], false];
	};
	AP_ROOT.forEach((c) => {
		const s = img(c);
		if (onB(s)) out.push([...s, 0, c[0], c.join(',')]);
	});
	const gap = (c1, c2, c3, old, gen) => {
		if (gen > maxGen) return;
		const nc = apRefl(c1, c2, c3, old);
		const [prune, bounded] = gapState(c1, c2, c3, nc);
		if (prune) return;
		const s = img(nc);
		const big = s[2] >= minPx;
		if (big && onB(s)) out.push([...s, gen, nc[0], nc.join(',')]);
		if (bounded && !big) return;
		gap(c1, c2, nc, c3, gen + 1);
		gap(c1, c3, nc, c2, gen + 1);
		gap(c2, c3, nc, c1, gen + 1);
	};
	const [B, L, R, Tp] = AP_ROOT;
	gap(B, L, R, Tp, 1);
	gap(B, L, Tp, R, 1);
	gap(B, R, Tp, L, 1);
	gap(L, R, Tp, B, 1);
	return out;
}

function apollonian(ctx, w, h, u, secs, A) {
	const S0 = 0.46 * h;
	// The lens. Build: the gasket as it is. Then T_t: p⁺ held (unit derivative)
	// while the pole comes in from ∞ to p⁻ along the ray from p⁺ through it —
	// the gasket turns inside out — and a similarity takes p⁺ to the middle and
	// opens the view; then the zoom by G itself: w ↦ κ^{−s}w.
	const t = smooth(span(u, 0.52, 0.71));
	const s = AP.zoom * Math.pow(span(u, 0.65, 1), 1.5);
	const sig = lerp(1, 2.3, t) * Math.pow(1 / C.abs(A.kappa), s);
	const turn = -s * C.arg(A.kappa);
	const R = C.polar(sig, turn);
	const eps = C.scale(A.eps1, t);
	const Tt = [ONE, neg(A.pp), neg(eps), C.add(ONE, C.mul(eps, A.pp))];
	const shift = C.scale(A.pp, 1 - t);
	const X = mmul([R, shift, ZERO, ONE], Tt);
	const view = makeView({ w, h, scale: S0, cx: lerp(0.57 * w, 0.5 * w, t), cy: h / 2 });
	const [px0, py0] = view.to(mapp(X, A.pp));
	const [ox0, oy0] = view.to(mapp(X, ZERO));
	opening(ctx, w, h, ox0, oy0, u);

	// Generation by generation, then all of it down to a pixel.
	const deep = u >= 0.38;
	const maxGen = deep ? 60 : AP.T.filter((x) => u >= x).length - 1;
	const circles = maxGen >= 0 ? gasket(X, view, maxGen, 0.8, w, h) : [];
	const labelA = span(u, 0.04, 0.1) * (1 - smooth(span(u, 0.47, 0.53)));
	const gens = new Map();
	for (const c of circles) {
		if (!gens.has(c[3])) gens.set(c[3], []);
		gens.get(c[3]).push(c);
	}
	for (const [gen, list] of gens) {
		const upto = gen < AP.T.length ? span(u, AP.T[gen], AP.T[gen] + 0.04) : 1;
		const fresh = gen < AP.T.length ? 1 : smooth(span(u, 0.38, 0.44));
		const color = gen === 0 ? PAL.chalk : gen % 2 ? PAL.cyan : PAL.pink;
		const width = Math.max(1, 2.6 * Math.pow(0.85, gen));
		const normal = [];
		const dots = [];
		for (const c of list) {
			if (c[2] > 3e4) bigArc(ctx, c[0], c[1], c[2], w, h, { color, width, alpha: fresh });
			else (c[2] >= 1.8 ? normal : dots).push(c);
		}
		rings(ctx, normal, { color, width, alpha: fresh, upto });
		rings(ctx, dots, { color, alpha: 0.9 * fresh * upto, fill: true });
	}
	// The curvatures, written in.
	if (labelA > 0) {
		const goldAt = span(u, 0.41, 0.47);
		for (const [x, y, r, gen, k, key] of circles) {
			if (r < 13 || k < 0) continue;
			const g0 = gen < AP.T.length ? AP.T[gen] : 0.4;
			const a = labelA * span(u, g0 + 0.02, g0 + 0.06);
			if (a <= 0) continue;
			const size = Math.max(10, Math.min(46, r * 0.5));
			const inChain = goldAt > 0 && A.keys.has(key);
			math(ctx, String(k), x, y + size * 0.05, {
				size,
				align: 'center',
				alpha: 0.9 * a,
				italic: false,
				color: inChain ? PAL.gold : gen === 0 ? PAL.chalk : PAL.chalkDim,
				weight: inChain ? 600 : 400
			});
		}
		const [bx, by] = view.to(mapp(X, [0.74, 0.74]));
		math(ctx, '−1', bx + 16, by - 12, { size: 26, alpha: 0.9 * labelA, italic: false });
	}

	// The chain: its circles outlined gold once the lens starts to move (its
	// numbers have gone gold already).
	const ca = smooth(span(u, 0.5, 0.58));
	if (ca > 0) {
		for (const [n, c] of A.chain) {
			const [cc, rr] = mcircle(X, apCentre(c), 1 / Math.abs(c[0]));
			const [x, y] = view.to(cc);
			const r = rr * S0;
			if (!(r > 1.2) || !outlineOn(x, y, r, w, h)) continue;
			const o = { color: PAL.gold, width: n >= 0 ? 2.4 : 1.8, alpha: ca * (n >= 0 ? 0.95 : 0.7) };
			if (r > 3e4) bigArc(ctx, x, y, r, w, h, o);
			else rings(ctx, [[x, y, r]], o);
		}
	}
	// Its kissing points — C_n with C_{n+1} — gold, from the far end in.
	const sp = span(u, 0.41, 0.5);
	if (sp > 0) {
		for (let n = -12; n <= 20; n++) {
			if ((n + 12) / 32 > sp) break;
			const z = mapp(A.T1inv, C.mul(A.w0, C.exp(C.scale(A.logk, n))));
			const P = view.to(mapp(X, z));
			if (!Number.isFinite(P[0] + P[1])) continue;
			disc(ctx, P[0], P[1], 4, { fill: PAL.gold, ring: PAL.ground, ringWidth: 1.4 });
		}
	}
	// p⁺, lit: where the chain spirals in, the middle of the board at the end.
	const lp = smooth(span(u, 0.44, 1));
	if (lp > 0) {
		glow(ctx, px0, py0, 40 + 150 * lp, [255, 214, 140], 0.2 + 0.3 * lp);
		lit(ctx, px0, py0, 3 + 6 * lp, lp);
	}

	lectures(ctx, w, h, u, [
		{
			from: 0.03,
			to: 0.42,
			lines: [
				['k_{4} = k_{1} + k_{2} + k_{3} ± 2√(k_{1}k_{2} + k_{2}k_{3} + k_{3}k_{1})', 0.05, 0.14],
				['2 + 2 + 3 ± 2√16 = 15 or −1', 0.14, 0.22],
				['every curvature in it is a whole number', 0.28, 0.36]
			]
		},
		{
			from: 0.4,
			to: 0.72,
			lines: [
				['−1, 2, 2, 3, 15, 38, 110, 323, …', 0.41, 0.48],
				['any four in a row kiss', 0.47, 0.52],
				['a Möbius map sends the far end to ∞:', 0.54, 0.61]
			]
		},
		{
			from: 0.71,
			to: 1.1,
			lines: [
				["Coxeter's spiral: each circle φ + √φ times the next", 0.72, 0.81],
				['z ↦ λz, |λ| = φ + √φ, maps the gasket to itself', 0.8, 0.9]
			]
		}
	]);
}

// ═══ padic ═══════════════════════════════════════════════════════════════════
// ℤ₂ as discs in discs: a ball of radius r holds its two children (digit 0,
// digit 1) of radius s·r at ±q·r along a direction that turns a quarter each
// level. A point is the sum of its digits' offsets: Σ (2dₖ − 1) q (s i)ᵏ.
const PA = { s: 0.45, q: 0.51, birth: 19870214, levels: 12 };
const bitsOf = (n) => {
	const d = [];
	for (let x = n; x > 0; x = Math.floor(x / 2)) d.push(x % 2);
	return d;
};
const BIRTH_BITS = bitsOf(PA.birth);
const DIGITS = {
	zero: () => 0,
	one: (k) => (k === 0 ? 1 : 0),
	two: (k) => (k === 1 ? 1 : 0),
	minusOne: () => 1,
	third: (k) => (k === 0 ? 1 : k % 2),
	birth: (k) => BIRTH_BITS[k] ?? 0
};
const ipow = (n) =>
	[
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1]
	][((n % 4) + 4) % 4];
// The point with digits `dig`, in the frame of the ball at level n0 on its
// path (that ball: centre 0, radius 1, its children split along 1).
function padicPoint(dig, n0 = 0) {
	let z = [0, 0];
	let f = PA.q;
	for (let j = 0; j < 60; j++) {
		z = C.add(z, C.scale(ipow(j), f * (2 * dig(n0 + j) - 1)));
		f *= PA.s;
	}
	return z;
}
// The ball at level n on the path, in the frame of the root.
function padicBall(dig, n) {
	let z = [0, 0];
	let f = PA.q;
	for (let j = 0; j < n; j++) {
		z = C.add(z, C.scale(ipow(j), f * (2 * dig(j) - 1)));
		f *= PA.s;
	}
	return [z, Math.pow(PA.s, n)];
}

function padic(ctx, w, h, u) {
	const Rs = 0.44 * h;
	const cx = w / 2 + 0.04 * w;
	const cy = h / 2 + 0.02 * h;
	// The zoom down the birthday's path: L levels, gathering pace; the frame is
	// the ball four levels up the path (so the board is always inside it).
	const L = PA.levels * Math.pow(span(u, 0.62, 1), 1.7);
	const nref = Math.max(0, Math.floor(L) - 4);
	const target = padicPoint(DIGITS.birth, nref);
	const ease = smooth(clamp01(L / 1.5));
	const X0 = nref === 0 ? C.scale(target, ease) : target;
	const K = C.scale(ipow(nref), Rs * Math.pow(PA.s, nref - L));
	const ox = lerp(cx, w / 2, ease);
	const oy = lerp(cy, h / 2, ease);
	const toS = (z) => {
		const v = C.mul(K, C.sub(z, X0));
		return [ox + v[0], oy - v[1]];
	};
	const kAbs = C.abs(K);
	if (nref === 0) {
		const [ox0, oy0] = toS([0, 0]);
		opening(ctx, w, h, ox0, oy0, u);
	}
	// The prefix of the frame ball's digits (for the labels).
	const pre = [];
	for (let j = 0; j < nref; j++) pre.push(DIGITS.birth(j));

	// The tree, from the frame ball down to a pixel: rings by their last digit.
	const T = (l) => 0.02 + 0.034 * l;
	const builtTo = (l) => (L > 0 ? 99 : l);
	const shownLvl = u < 0.3 ? Math.floor((u - 0.02) / 0.034) : 99;
	const byDig = [[], [], []];
	const dots = [[], []];
	const labels = [];
	const visit = (c, r, lvl, rel, digs) => {
		if (lvl - nref > builtTo(shownLvl) || lvl > shownLvl + nref) return;
		const [x, y] = toS(c);
		const sr = kAbs * r;
		if (x + sr < -4 || x - sr > w + 4 || y + sr < -4 || y - sr > h + 4) return;
		const d = digs.length ? digs[digs.length - 1] : 2;
		const up = lvl > nref + 6 || L > 0 ? 1 : span(u, T(lvl), T(lvl) + 0.04);
		if (sr < 3) {
			if (d < 2) dots[d].push([x, y, Math.max(1, 0.6 * sr), up]);
			return;
		}
		byDig[d].push([x, y, sr, up]);
		if (sr >= 30 && lvl > 0 && lvl <= 9) labels.push([x, y, sr, digs, rel, lvl]);
		const dir = ipow(rel);
		for (let k = 0; k < 2; k++)
			visit(
				C.add(c, C.scale(dir, (2 * k - 1) * PA.q * r)),
				r * PA.s,
				lvl + 1,
				rel + 1,
				digs.concat(k)
			);
	};
	visit([0, 0], 1, nref, 0, pre.slice());
	const colors = [PAL.cyan, PAL.pink, PAL.chalk];
	for (let d = 0; d < 3; d++) {
		const groups = new Map();
		for (const it of byDig[d]) {
			const key = Math.round(it[3] * 20);
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(it);
		}
		for (const [key, list] of groups) {
			const thick = list.filter((x) => x[2] > 40);
			const thin = list.filter((x) => x[2] <= 40);
			rings(ctx, thick, { color: colors[d], width: d === 2 ? 2.6 : 2.2, upto: key / 20 });
			rings(ctx, thin, { color: colors[d], width: 1.3, alpha: 0.9, upto: key / 20 });
		}
	}
	for (let d = 0; d < 2; d++) rings(ctx, dots[d], { color: colors[d], fill: true, alpha: 0.85 });
	// Labels: a ball's last digits, …d₂d₁d₀, in the room beside its children.
	for (const [x, y, sr, digs, rel, lvl] of labels) {
		const a = (L > 0 ? 1 : span(u, T(lvl) + 0.02, T(lvl) + 0.06)) * (1 - span(sr, 900, 1400));
		if (a <= 0) continue;
		const dir = C.mul(ipow(rel), K);
		const perp = C.scale([-dir[1], dir[0]], 1 / C.abs(dir));
		const side = perp[1] > 0 ? -1 : 1; // below, on the board
		const lx = x + side * perp[0] * sr * 0.72;
		const ly = y - side * perp[1] * sr * 0.72;
		const txt = '…' + digs.slice().reverse().join('');
		const size = Math.max(11, Math.min(26, sr * 0.2));
		math(ctx, txt, lx, ly, { size, align: 'center', alpha: 0.85 * a, italic: false });
	}
	// ℤ₂ by the root.
	const za = span(u, 0.03, 0.08) * (1 - smooth(span(u, 0.6, 0.66)));
	if (za > 0) {
		const [x, y] = toS([-0.78, 0.78]);
		math(ctx, 'ℤ_{2}', x - 6, y - 6, { size: 30, align: 'right', alpha: za });
	}

	// The oddities, on the static board.
	const root = (z) => toS(z); // nref is 0 until the zoom is well under way
	// The triangle 0, 1, 2: sides 1, 1 and ½ in |·|₂, whatever they look like.
	const tri = span(u, 0.33, 0.4) * (1 - smooth(span(u, 0.5, 0.55)));
	if (tri > 0 && nref === 0) {
		const P0 = root(padicPoint(DIGITS.zero));
		const P1 = root(padicPoint(DIGITS.one));
		const P2 = root(padicPoint(DIGITS.two));
		stroke(ctx, [P0, P1, P2, P0], { color: PAL.chalk, width: 2.2, alpha: 0.9 * tri, upto: tri });
		const mid = (A, B, t, dx, dy) =>
			math(ctx, t, (A[0] + B[0]) / 2 + dx, (A[1] + B[1]) / 2 + dy, {
				size: 26,
				align: 'center',
				alpha: tri,
				italic: false
			});
		mid(P0, P1, '1', 0, 24);
		mid(P0, P2, '½', -22, 0);
		mid(P1, P2, '1', 16, -18);
		for (const [P, t, dx, dy] of [
			[P0, '0', -14, 16],
			[P1, '1', 14, 16],
			[P2, '2', -14, -14]
		]) {
			disc(ctx, P[0], P[1], 5.5, { fill: PAL.chalk, alpha: tri });
			math(ctx, t, P[0] + dx, P[1] + dy, {
				size: 22,
				align: dx < 0 ? 'right' : 'left',
				alpha: tri,
				italic: false
			});
		}
	}
	// B(0, ½) = B(2, ½): the ball …0, centred on either.
	const ctr = span(u, 0.42, 0.47) * (1 - smooth(span(u, 0.55, 0.6)));
	if (ctr > 0 && nref === 0) {
		const [bc, br] = padicBall(DIGITS.zero, 1);
		const [x, y] = root(bc);
		rings(ctx, [[x, y, br * kAbs + 6]], { color: PAL.chalk, width: 2.6, alpha: ctr });
		for (const dg of [DIGITS.zero, DIGITS.two]) {
			const [px, py] = root(padicPoint(dg));
			rings(ctx, [[px, py, 11]], { color: PAL.chalk, width: 1.8, alpha: ctr });
		}
	}
	// −1 and ⅓ as paths down the tree.
	const paths = span(u, 0.5, 0.56) * (1 - smooth(span(u, 0.62, 0.66)));
	if (paths > 0 && nref === 0) {
		for (const [dg, col] of [
			[DIGITS.minusOne, PAL.gold],
			[DIGITS.third, PAL.chalk]
		]) {
			const list = [];
			for (let n = 1; n < 9; n++) {
				const [bc, br] = padicBall(dg, n);
				const [x, y] = root(bc);
				if (br * kAbs < 2) break;
				if ((n - 1) / 8 < (paths - 0.0) * 1.2) list.push([x, y, br * kAbs]);
			}
			rings(ctx, list, { color: col, width: 2.6, alpha: paths });
			const [px, py] = root(padicPoint(dg));
			disc(ctx, px, py, 4, { fill: col, alpha: paths });
		}
		const [mx, my] = root(padicPoint(DIGITS.minusOne));
		const [tx, ty] = root(padicPoint(DIGITS.third));
		math(ctx, '−1', mx - 12, my - 16, { size: 22, align: 'right', alpha: paths, color: PAL.gold });
		math(ctx, '⅓', tx + 12, ty - 16, { size: 22, alpha: paths });
	}

	// The birthday's path, gold, and its point lit.
	const ba = smooth(span(u, 0.6, 0.66));
	if (ba > 0) {
		const list = [];
		for (let n = nref; n < nref + 14; n++) {
			let z = [0, 0];
			let f = PA.q;
			for (let j = nref; j < n; j++) {
				z = C.add(z, C.scale(ipow(j - nref), f * (2 * DIGITS.birth(j) - 1)));
				f *= PA.s;
			}
			const [x, y] = toS(z);
			const sr = kAbs * Math.pow(PA.s, n - nref);
			if (sr < 2.2) break;
			if (sr < 0.9 * h) list.push([x, y, sr, 1 - span(sr, 0.5 * h, 0.9 * h)]);
		}
		for (const [x, y, r, a] of list)
			rings(ctx, [[x, y, r]], { color: PAL.gold, width: 2.8, alpha: ba * a });
		const [px, py] = toS(target);
		glow(ctx, px, py, 40 + 140 * ba, [255, 214, 140], 0.2 + 0.25 * smooth(span(u, 0.7, 1)));
		lit(ctx, px, py, 4 + 5 * smooth(span(u, 0.7, 1)), ba);
	}

	const shownDigits = Math.min(BIRTH_BITS.length, Math.max(0, Math.floor(L + 1)));
	const dstr = BIRTH_BITS.slice(0, shownDigits).reverse().join('');
	lectures(ctx, w, h, u, [
		{
			from: 0.02,
			to: 0.33,
			lines: [
				['ℤ_{2}:  x = …d_{3}d_{2}d_{1}d_{0},  binary, endless to the left', 0.04, 0.12],
				['|x − y|_{2} = 2^{−n},  n the first digit where they differ', 0.13, 0.21],
				['every ball a + 2^{n}ℤ_{2} is open and closed', 0.22, 0.3]
			]
		},
		{
			from: 0.33,
			to: 0.63,
			lines: [
				['|0 − 1|_{2} = |1 − 2|_{2} = 1,   |0 − 2|_{2} = ½', 0.34, 0.4],
				['every triangle is isosceles', 0.39, 0.43],
				['B(0, ½) = B(2, ½): every point is a centre', 0.43, 0.49],
				['−1 = …1111_{2},   ⅓ = …0101011_{2}', 0.5, 0.56]
			]
		},
		{
			from: 0.62,
			to: 1.1,
			lines: [
				[`t_{0} = 14·02·1987:  ${PA.birth} = …${dstr}_{2}`, 0.63, 0.66],
				['one level down: ×2 in |·|_{2}', 0.68, 0.74]
			]
		}
	]);
}

// ═══ ford ════════════════════════════════════════════════════════════════════
const gcd = (a, b) => {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) [x, y] = [y, x % y];
	return x;
};
const FIB = (() => {
	const F = [0, 1];
	while (F.length < 40) F.push(F[F.length - 1] + F[F.length - 2]);
	return F;
})();
// The convergents of 1/φ from 1/1 on, F_n/F_{n+1}.
const CONVERGENTS = new Set(FIB.slice(1, -1).map((p, i) => `${p}/${FIB[i + 2]}`));

function ford(ctx, w, h, u) {
	const x0 = 1 / PHI;
	const S0 = 0.86 * h; // px per unit at first: the circles over 0 and 1 fill the board's height
	const zu = span(u, 0.46, 1);
	const Z = Math.pow(PHI, 13 * Math.pow(zu, 1.7));
	const e = smooth(span(u, 0.42, 0.62));
	const xc = lerp(0.5, x0, e);
	const sc = S0 * Z;
	const cx = w / 2;
	const cy = h / 2;
	const X = (x) => cx + (x - xc) * sc;
	const xmin = xc - (w / 2 + 40) / sc;
	const xmax = xc + (w / 2 + 40) / sc;
	// Circles come in by denominator, the big ones first.
	const uq = (q) => 0.02 + 0.3 * Math.pow(1 - 1 / q, 1.3);
	const qMax = Math.floor(Math.sqrt(sc / 1.4));
	const up = [];
	const down = [];
	const huge = [];
	const fresh = [];
	const nodes = [];
	const labels = [];
	for (let q = 1; q <= qMax; q++) {
		const t0 = uq(q);
		if (u < t0) break;
		const a = span(u, t0, t0 + 0.04);
		const rq = 0.5 / (q * q);
		const r = rq * sc;
		// A circle can reach in over the board from as far off as its radius.
		const p0 = Math.ceil((xmin - rq) * q);
		const p1 = Math.floor((xmax + rq) * q);
		for (let p = p0; p <= p1; p++) {
			if (gcd(p, q) !== 1) continue;
			const x = X(p / q);
			if (!outlineOn(x, cy - r, r, w, h)) continue;
			const it = [x, cy - r, r];
			const dn = [x, cy + r, r];
			if (r > 3e4) huge.push([it, dn]);
			else if (a < 1) fresh.push([it, dn, a]);
			else {
				up.push(it);
				down.push(dn);
			}
			if (r > 5) nodes.push([x, cy, Math.min(4.5, r * 0.12)]);
			const name = `${p}/${q}`;
			if (r > 26 && !(CONVERGENTS.has(name) && u > 0.32))
				labels.push([x, cy - (r > 150 ? 0.45 * r : r), r, name, a]);
		}
	}
	opening(ctx, w, h, X(0.5), cy, u);
	// The line, faint, and the circles: cyan above, pink their mirror below.
	stroke(
		ctx,
		[
			[0, cy],
			[w, cy]
		],
		{ color: PAL.rose, width: 1.6, alpha: 0.7 * span(u, 0, 0.05) }
	);
	rings(ctx, up, { color: PAL.cyan, width: 1.7 });
	rings(ctx, down, { color: PAL.pink, width: 1.7 });
	for (const [it, dn] of huge) {
		bigArc(ctx, ...it, w, h, { color: PAL.cyan, width: 1.7 });
		bigArc(ctx, ...dn, w, h, { color: PAL.pink, width: 1.7 });
	}
	for (const [it, dn, a] of fresh) {
		rings(ctx, [it], { color: PAL.cyan, width: 1.7, upto: a });
		rings(ctx, [dn], { color: PAL.pink, width: 1.7, upto: a });
	}
	rings(ctx, nodes, { color: PAL.node, fill: true, alpha: 0.85 });
	const la = 1 - smooth(span(u, 0.5, 0.6));
	for (const [x, y, r, s, a] of labels) {
		const size = Math.max(12, Math.min(34, r * 0.22));
		const big = 1 - span(r, 0.45 * h, 0.7 * h);
		math(ctx, s, x, y, { size, align: 'center', alpha: 0.85 * a * la * big, italic: false });
	}

	// 1/φ: the vertical line, and its convergents F_n/F_{n+1} lit gold.
	const ga = span(u, 0.3, 0.36);
	if (ga > 0) {
		const lx = X(x0);
		stroke(
			ctx,
			[
				[lx, 0],
				[lx, h]
			],
			{ color: PAL.gold, width: 1.6, alpha: 0.75 * ga, upto: ga }
		);
		for (let n = 1; n < 36; n++) {
			const p = FIB[n];
			const q = FIB[n + 1];
			const at0 = 0.32 + 0.022 * (n - 1);
			const a = smooth(span(u, at0, at0 + 0.03));
			if (a <= 0) continue;
			const r = (0.5 / (q * q)) * sc;
			if (r < 0.6) break;
			const x = X(p / q);
			if (!outlineOn(x, cy - r, r, w, h)) continue;
			const o = { color: PAL.gold, width: Math.min(3, 1.4 + r * 0.01), alpha: a };
			const o2 = { ...o, alpha: 0.75 * a };
			if (r > 3e4) {
				bigArc(ctx, x, cy - r, r, w, h, o);
				bigArc(ctx, x, cy + r, r, w, h, o2);
			} else {
				rings(ctx, [[x, cy - r, r]], o);
				rings(ctx, [[x, cy + r, r]], o2);
			}
			if (r > 14 && r < 0.7 * h) {
				const size = Math.max(13, Math.min(30, r * 0.2));
				math(ctx, `${p}/${q}`, x, cy - (r > 150 ? 0.45 * r : r), {
					size,
					align: 'center',
					alpha: a * (1 - span(r, 0.45 * h, 0.7 * h)),
					color: PAL.gold,
					italic: false
				});
			}
		}
	}
	const lp = smooth(span(u, 0.5, 1));
	const lx = X(x0);
	if (lp > 0) {
		glow(ctx, lx, cy, 40 + 160 * lp, [255, 214, 140], 0.15 + 0.3 * lp);
		lit(ctx, lx, cy, 3 + 6 * lp, lp);
	}

	lectures(ctx, w, h, u, [
		{
			from: 0.02,
			to: 0.46,
			lines: [
				['over each p/q, a circle of radius 1/2q^{2}', 0.04, 0.12],
				['p/q, r/s kiss when |ps − qr| = 1', 0.15, 0.22],
				['and between them sits (p + r)/(q + s)', 0.22, 0.29]
			]
		},
		{
			from: 0.44,
			to: 1.1,
			lines: [
				['1/φ = [0; 1, 1, 1, …]:  1/1, 1/2, 2/3, 3/5, 5/8, …', 0.45, 0.53],
				['the line x = 1/φ grazes every one of them', 0.55, 0.62],
				['|1/φ − F_{n}/F_{n+1}| ≈ 1/√5F_{n+1}^{2}: the worst approximable', 0.64, 0.74]
			]
		}
	]);
}
