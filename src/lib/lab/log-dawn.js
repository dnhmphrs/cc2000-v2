import {
	getBoard,
	clearBoard,
	stroke,
	disc,
	math,
	PAL,
	TAU,
	MATH_FONT,
	TECH_FONT,
	span,
	smooth,
	lerp,
	clamp01,
	easeInOutCubic,
	clock,
	variant,
	tag
} from './log/board.js';
import { glow, lecture, backing } from './log/ink.js';
import { orbit, line3, circle3, label3 } from './log/space.js';

// ── Sketch: log-dawn — some more ideas of beginnings ─────────────────────────
// The very start of the run: from the page loading, through whatever opening
// there is, to the frame log-orb opens on — the dark board and the ORB small
// and alone at its centre, where the first question is about to be written.
// No swimmer anywhere (it gives the joke away). Every variant ends, from
// u ≈ 0.9, on exactly log-orb's first frame: the orb at the centre, 6 px, on
// the orb's own clock run up to log-orb's zero, so its breath and halo carry
// on across the cut (u = 1 here and log-orb's u = 0 differ by the name tag
// only). Ten seconds each; a pure function of progress, so ?at= pins any
// frame. One opening per ?v=:
//
//   fullstop (default) the title card's sentence, written on the board as a
//            lecture: CONCEPTION CALCULATOR 2000 at the head in the site's own
//            face, double-ruled in chalk; then the card's three lines in the
//            board's italic at the card's own pace (22 ms a character), with
//            log-orb's cursor ahead of them. It waits at "conception", and the
//            last thing written is the FULL STOP the PM asked for: it lands
//            with a tap, swells, lights, and is the orb. The lens zooms into
//            it — a log zoom, z ↦ e^{Z} z about the stop, ×55, while the stop
//            pans to the middle — so the sentence streams out past the edges,
//            the last word passing huge beside the light, and the light keeps
//            its size: a point stays a point however close you get. Chalk at a
//            size no board has (glyphs past 600 px) dissolves as it passes.
//   axiom    a lecture's first lines, Euclid-minimal, top left: "Let z₀ be a
//            point" — a chalk dot. "Let C be a circle through z₀, and ℓ its
//            tangent there" — C drawn round from z₀, ℓ ruled through it. Then
//            the PARABOLIC pencil: the circles tangent to ℓ at z₀ bloom out of
//            the point in cyan — C among them — and those tangent to ℓ* ⊥ ℓ in
//            pink, its orthogonal pencil; grey nodes where they cross, a right
//            angle marked. In ℓ's frame cyan k is centred at n/k, radius 1/k,
//            pink j at d/j (z ↦ 1/z sends them to the lines Im w = −k/2 and
//            Re w = j/2, the grid seen from z₀), and they meet again at
//            2(j d + k n)/(j² + k²). "∎" — the point lights: the orb. Then
//            z − z₀ ↦ λ(z − z₀), λ → 0, which takes each pencil to itself,
//            draws every circle into z₀ as the proof is wiped, and brings z₀
//            to the middle of the board.
//   cone     a spacetime diagram, c = 1: chalk axes t (up) and x, ds² = dt² −
//            dx² − dy²; the light cone opens in gold out of "here, now"
//            (t = ±x, labelled; future, past, elsewhere); a radio stands at
//            rest off to the left and a song (♪) leaves it as a pulse along the
//            past cone, arriving here, now; "you" climb out of the apex, a
//            timelike worldline, born a little way up. Then the lens tips up
//            over the diagram (elevation 0 → 90°) to look down the time axis
//            from the future: the two light lines were a cone, t² = x² + y²,
//            its cross sections rings (gold above, rose and dashed below) and
//            its generators rays — end-on, the log map's own picture. The lens
//            falls back down the axis toward the apex; the cone is its own
//            zoom, (t, x, y) ↦ λ(t, x, y), and its rings sit at log-spaced
//            heights T e^{−0.3 j}, so the fall is a flight down a tunnel, the
//            rings streaming out past the edges at a steady rate, until the
//            apex event is alone: the orb. The moment, as an event.
//   sky      the night sky round the north celestial pole, as the Riemann
//            sphere seen from inside, stereographically: a star at polar
//            distance p and right ascension α at z = tan(½p) e^{−iα} (right
//            ascension clockwise, as it is looking up). Real stars (J2000,
//            sized by magnitude, coloured by type): Ursa Minor, the Plough,
//            Cassiopeia, Cepheus, Draco, Vega, Capella, Deneb, named, on a
//            faint grid of declination rings and hour rays, and the pole
//            marked. A long exposure: the Earth turns, z ↦ e^{iθ} z, and the
//            stars trail into arcs of the rings. Then a boost toward the pole
//            joins the turn, z ↦ e^{(−k + i)θ} z, k = 0.36 — aberration crowds
//            the sky forward, tan(½p′) = e^{−η} tan(½p) — and the trails
//            tighten into loxodromes (log spirals, crossing every hour ray at
//            one angle) pouring into the pole, added as light is on a plate,
//            so the pole whitens into the orb. The exposure closes, the trails
//            fade, the light is left.
//   title    the whole board as a lecture's opening: "Lecture 1" top left,
//            today's date top right, the title double-ruled, the sentence
//            boxed in chalk — and corrected in red chalk, the board's own gag:
//            "advanced" struck out, "peaked" written over it. Then the full
//            stop, and the same zoom into it as fullstop, the correction
//            riding out with the rest.
//
// How: the card variants lay their lines out once per board size (every
// character's offset from the measured width of its prefix, so kerning
// holds) and draw them through one similarity, z ↦ e^{Z}(z − stop) + pan.
// The cone is projected by hand (space.js orbit and line3), its generators
// sampled geometrically so they reach the light. The sky precomputes the
// flow, θ(t) and K(t) = log of the zoom, on a fine table; every star follows
// the one path z ↦ e^{−K + iθ} z, so a trail is that path turned and scaled
// to the star, sampled every 0.09 of log distance and never finer than 3 px.
// The orb is log-orb's (ink.js drawOrb), copied with two changes: an alpha,
// so it can be born, and a halo phase that wraps for negative seconds, so its
// clock can run up to zero. The lecture is ink.js's, with its patch of board
// grown line by line (lect). ?ask=1 carries on into the first question,
// written under the orb as log-orb writes it, for watching a beginning on its
// own (the last frame is then log-orb's at the question, u ≈ 0.13).

const SECONDS = 10;
const ORB_R = 6; // the orb log-orb (net) opens on: 6 px at the centre

export default async function make({ at }) {
	const v = variant(['fullstop', 'axiom', 'cone', 'sky', 'title']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
	const ask = q?.get('ask') === '1';
	if (v === 'fullstop' || v === 'title') {
		// The head is set in the site's own face, which the page preloads; be
		// sure it is in before the first frame is measured.
		try {
			await document.fonts.load(`400 24px ${TECH_FONT}`);
		} catch {
			// The board's fallbacks will do.
		}
	}
	const card = v === 'fullstop' || v === 'title' ? makeCard(v) : null;
	const sky = v === 'sky' ? makeSky() : null;

	function render() {
		clearBoard(b);
		const { ctx, w, h } = b;
		const u = time.u;
		const secs = time.t;
		// The orb's own clock, run up to log-orb's zero at u = 1.
		const os = secs - SECONDS;
		if (card) card.draw(ctx, w, h, u, secs, os);
		else if (v === 'axiom') axiom(ctx, w, h, u, os);
		else if (v === 'cone') cone(ctx, w, h, u, os);
		else sky.draw(ctx, w, h, u, os);
		if (ask) question(ctx, w, h, u, secs);
		tag(ctx, w, h, `log-dawn · ${v}`);
	}

	return {
		info: { seconds: SECONDS, variant: v },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {}
	};
}

// ── The orb ──────────────────────────────────────────────────────────────────
// log-orb's, as ink.js has it, with `alpha` (so it can be born) and the halo's
// phase wrapped for negative seconds (so its clock can run up to zero).
const mix = (a, b, t) => a.map((x, i) => Math.round(lerp(x, b[i], t)));
const css = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

function orb(ctx, x, y, r, secs, { flare = 0, gold = 0, halo = 1, alpha = 1 } = {}) {
	if (alpha <= 0.002 || r <= 0) return;
	const br = 1 + 0.07 * Math.sin((TAU * secs) / 3.4) + 0.025 * Math.sin((TAU * secs) / 1.3 + 1.1);
	const R = r * br * (1 + 0.45 * flare);
	const core = mix([255, 236, 200], [255, 196, 90], gold);
	const warm = mix([255, 186, 118], [245, 170, 50], gold);
	glow(ctx, x, y, Math.max(90, R * 24), [128, 104, 214], (0.22 + 0.08 * flare) * alpha);
	glow(ctx, x, y, Math.max(40, R * 9), warm, (0.45 + 0.3 * flare) * alpha);
	glow(ctx, x, y, R * 3.2, core, 0.8 * alpha);
	const ph = (((secs * 0.21) % 1) + 1) % 1;
	ctx.save();
	for (let j = 0; j < 5; j++) {
		const s = j + ph;
		const rr = R * 1.7 * Math.exp(0.36 * s);
		const a = alpha * halo * 0.4 * (1 - s / 5) * smooth(s / 0.7) * (1 - span(rr, 220, 420));
		if (a <= 0.005) continue;
		ctx.globalAlpha = a;
		ctx.strokeStyle = j % 2 ? PAL.rose : css(mix([245, 193, 80], [255, 230, 180], 0.4));
		ctx.lineWidth = Math.max(0.8, Math.min(1.6, R * 0.1));
		ctx.setLineDash(j % 2 ? [rr * 0.2, rr * 0.13] : []);
		ctx.lineDashOffset = (j % 4 === 1 ? 1 : -1) * secs * rr * 0.12;
		ctx.beginPath();
		ctx.arc(x, y, rr, 0, TAU);
		ctx.stroke();
	}
	ctx.restore();
	ctx.save();
	ctx.globalAlpha = alpha;
	const g = ctx.createRadialGradient(x - R * 0.16, y - R * 0.18, 0, x, y, R * 1.06);
	g.addColorStop(0, '#ffffff');
	g.addColorStop(0.42, css(mix(core, [255, 255, 255], 0.55)));
	g.addColorStop(0.8, css(core));
	g.addColorStop(0.93, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0.75)`);
	g.addColorStop(1, `rgba(${warm[0]}, ${warm[1]}, ${warm[2]}, 0)`);
	ctx.fillStyle = g;
	ctx.shadowColor = css(core);
	ctx.shadowBlur = Math.min(60, R * 1.6);
	ctx.beginPath();
	ctx.arc(x, y, R * 1.06, 0, TAU);
	ctx.fill();
	ctx.restore();
}

// The lecture (ink.js), with its patch of board grown line by line as the
// lines are written — the kit's covers every line from the start, written or
// not, which hides whatever the board has under the lines still to come.
function lect(ctx, w, h, lines, { back = 0.75 } = {}) {
	const sz = Math.round(Math.max(18, 0.42 * Math.min(w, h) * 0.07));
	const x = Math.max(28, w * 0.05);
	const y0 = Math.max(40, h * 0.08);
	const step = Math.max(30, sz * 1.6);
	const on = lines.map(([, p, a = 1]) => (p > 0 && a > 0 ? smooth(clamp01(p * 4)) : 0));
	const k = Math.max(0, ...lines.map(([, p, a = 1]) => clamp01(p * 3) * a));
	if (back > 0 && k > 0) {
		ctx.save();
		ctx.font = `italic 400 ${sz}px ${MATH_FONT}`;
		let wMax = 0;
		let deep = 0;
		lines.forEach(([str], i) => {
			if (on[i] <= 0) return;
			wMax = Math.max(wMax, ctx.measureText(str.replace(/[\^_]\{|\}/g, '')).width);
			if (i > 0) deep = Math.max(deep, i - 1 + on[i]);
		});
		ctx.restore();
		backing(ctx, x, y0 - sz * 0.7, wMax, step * deep + sz * 1.4, back * k);
	}
	lecture(ctx, w, h, lines, { back: 0 });
}

// A bump of light at u0, width wd.
const bump = (u, u0, wd) => Math.exp(-(((u - u0) / wd) ** 2));

// log-orb's typing cursor: a chalk bar, steady while typing, blinking while
// it waits. (x, y) is the text's baseline, `size` its size in px.
function cursor(ctx, x, y, size, alpha, typing, secs) {
	if (alpha <= 0) return;
	if (!typing && (((secs * 1.7) % 1) + 1) % 1 >= 0.55) return;
	stroke(
		ctx,
		[
			[x, y - 0.8 * size],
			[x, y + 0.1 * size]
		],
		{ color: PAL.chalk, width: Math.max(1.2, size / 15), alpha: 0.85 * alpha, cap: 'butt' }
	);
}

// ── The first question (?ask=1) ──────────────────────────────────────────────
// Written under the orb as log-orb writes it at its own u = 0.07–0.13: a wiped
// patch of board, the question, the coordinate's name and its dashed blank.
function question(ctx, w, h, u, secs) {
	const q = span(u, 0.935, 0.995);
	if (q <= 0) return;
	const px = w / 2;
	const py = h / 2 + 0.3 * h;
	const qs = 18;
	const as = 30;
	const Q = 'when were you born?';
	const KEY = 't_{0} = ';
	ctx.save();
	ctx.font = `italic 400 ${qs}px ${MATH_FONT}`;
	const Wq = ctx.measureText(Q).width;
	ctx.font = `italic 400 ${as}px ${MATH_FONT}`;
	const Wv = ctx.measureText('14 · 02 · 1987').width;
	ctx.restore();
	const Wk = math(ctx, KEY, 0, -999, { size: as, alpha: 0 });
	const W = Math.max(Wq, Wk + Wv) + 90;
	const H = 136;
	ctx.save();
	ctx.globalAlpha = smooth(q * 3);
	ctx.fillStyle = PAL.ground;
	ctx.filter = 'blur(16px)';
	ctx.beginPath();
	ctx.roundRect(px - W / 2, py - H / 2, W, H, 26);
	ctx.fill();
	ctx.restore();
	math(ctx, Q, px, py - 26, { size: qs, upto: q, alpha: 0.7, align: 'center' });
	const x0 = px - (Wk + Wv) / 2;
	const ya = py + 16;
	const kq = span(q, 0.55, 1);
	math(ctx, KEY, x0, ya, { size: as, upto: kq, alpha: 0.95 });
	const xv = x0 + Wk;
	stroke(
		ctx,
		[
			[xv, ya + 20],
			[xv + Wv, ya + 20]
		],
		{ color: PAL.chalk, width: 1.4, alpha: 0.32 * kq, dash: [5, 6] }
	);
	if (kq >= 1 && (secs * 1.7) % 1 < 0.55)
		stroke(
			ctx,
			[
				[xv + 4, ya - 14],
				[xv + 4, ya + 13]
			],
			{ color: PAL.chalk, width: 2, alpha: 0.85, cap: 'butt' }
		);
}

// ── fullstop & title: the sentence, and its point ────────────────────────────
const HEAD = 'CONCEPTION CALCULATOR 2000';
const LINES = [
	'in the earth year 2000, human technology advanced',
	'allowing all of mankind to calculate the song playing',
	'at their exact moment of conception'
];

// The beats, in progress u. Typed at about the card's own pace (22 ms a
// character, a fifth of a second between lines), the head first.
const CARD = {
	fullstop: {
		head: [0.05, 0.108],
		rule: [0.1, 0.145],
		lines: [
			[0.16, 0.269],
			[0.291, 0.409],
			[0.431, 0.509]
		],
		stop: 0.565,
		swell: [0.6, 0.68],
		pan: [0.65, 0.84],
		zoom: [0.68, 0.93]
	},
	title: {
		date: [0.02, 0.06],
		lecture: [0.045, 0.08],
		head: [0.08, 0.135],
		rule: [0.128, 0.165],
		lines: [
			[0.175, 0.28],
			[0.295, 0.405],
			[0.42, 0.49]
		],
		box: [0.5, 0.575],
		strike: [0.585, 0.605],
		fix: [0.61, 0.645],
		stop: 0.675,
		swell: [0.69, 0.74],
		pan: [0.71, 0.86],
		zoom: [0.72, 0.94]
	}
};
// How far the lens goes into the point: e^{ZOOM}, a little past where the
// last glyph has dissolved.
const ZOOM = Math.log(55);

function makeCard(v) {
	let L = null;
	return {
		draw(ctx, w, h, u, secs, os) {
			if (!L || L.w !== w || L.h !== h) L = layoutCard(ctx, w, h, v);
			card(ctx, L, w, h, u, secs, os, v);
		}
	};
}

// A line laid out once: its characters' x offsets (from the measured widths
// of every prefix, so kerning holds) and where it sits at zoom 1.
function layLine(ctx, text, font, size, x, y, track = 0, align = 'center') {
	ctx.font = font(size);
	const xs = [0];
	for (let i = 1; i <= text.length; i++)
		xs.push(ctx.measureText(text.slice(0, i)).width + track * i);
	const W = xs[text.length] - track;
	const x0 = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
	return { text, font, size, x0, y, xs, W };
}

const SERIF = (s) => `italic 400 ${s}px ${MATH_FONT}`;
const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

function layoutCard(ctx, w, h, v) {
	ctx.save();
	ctx.font = SERIF(100);
	const W100 = Math.max(...LINES.map((s, i) => ctx.measureText(i === 2 ? s + '.' : s).width));
	const fs = Math.min(h * 0.04, (0.76 * w * 100) / W100);
	const step = fs * 1.66;
	const hs = fs * 0.74;
	const cx = w / 2;
	// The block: the head, its rule, and the three lines, a little above the
	// middle of the board.
	const top = h * (v === 'title' ? 0.3 : 0.345);
	const head = layLine(ctx, HEAD, TECH, hs, cx, top, hs * 0.32);
	const y1 = top + fs * (v === 'title' ? 3.2 : 2.35);
	const lines = LINES.map((s, i) => {
		const full = i === 2 ? s + '.' : s;
		const ln = layLine(ctx, full, SERIF, fs, cx, y1 + i * step);
		if (i === 2) ln.text = s; // the stop is drawn as a dot of its own
		return ln;
	});
	// The full stop: where the glyph's ink would be.
	const l3 = lines[2];
	ctx.font = SERIF(fs);
	const m = ctx.measureText('.');
	const sx = l3.x0 + l3.xs[l3.text.length];
	const stop = {
		x: sx + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
		y: l3.y - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
		r: Math.max(1.6, (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2) * 1.08
	};
	const L = { w, h, fs, hs, step, head, lines, stop, rule: null };
	// The head's rule: a chalk line under it, a little longer, with a second,
	// shorter stroke under that.
	const ry = top + hs * 0.55;
	L.rule = [
		hand([head.x0 - hs * 0.4, ry], [head.x0 + head.W + hs * 0.4, ry], 0.9, 11),
		hand(
			[head.x0 + head.W * 0.18, ry + hs * 0.32],
			[head.x0 + head.W * 0.82, ry + hs * 0.3],
			0.7,
			12
		)
	];
	if (v === 'title') {
		const mx = Math.max(28, w * 0.05);
		const my = Math.max(40, h * 0.08);
		const d = new Date();
		const pad = (n) => String(n).padStart(2, '0');
		L.date = layLine(
			ctx,
			`${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`,
			SERIF,
			fs * 0.72,
			w - mx,
			my + fs * 0.25,
			0,
			'right'
		);
		L.lecture = layLine(ctx, 'Lecture 1', SERIF, fs * 0.9, mx, my + fs * 0.3, 0, 'left');
		L.lectureRule = hand([mx - 2, my + fs * 0.62], [mx + L.lecture.W + 4, my + fs * 0.6], 0.6, 21);
		// The box round the sentence, hand drawn: four strokes that overrun
		// their corners a little.
		const x0 = Math.min(...lines.map((l) => l.x0)) - fs * 0.9;
		const x1 = Math.max(...lines.map((l) => l.x0 + l.W)) + fs * 0.9;
		const y0 = lines[0].y - fs * 1.3;
		const y1b = lines[2].y + fs * 0.8;
		const o = fs * 0.35;
		L.box = [
			hand([x0 - o, y0], [x1 + o * 0.6, y0 + 1.5], 1.1, 31),
			hand([x1, y0 - o * 0.8], [x1 + 1.5, y1b + o], 1.1, 32),
			hand([x1 + o * 0.5, y1b], [x0 - o * 0.7, y1b + 2], 1.1, 33),
			hand([x0, y1b + o * 0.6], [x0 + 1, y0 - o * 0.9], 1.1, 34)
		];
		// The correction: "advanced" struck out, "peaked" written over it.
		const l1 = lines[0];
		const k = l1.text.indexOf('advanced');
		const ax0 = l1.x0 + l1.xs[k];
		const ax1 = l1.x0 + l1.xs[k + 8];
		const sy = l1.y - fs * 0.3;
		L.strike = hand([ax0 - fs * 0.1, sy + 1], [ax1 + fs * 0.1, sy - 2], 0.8, 41);
		L.fix = layLine(
			ctx,
			'peaked',
			SERIF,
			fs * 0.92,
			(ax0 + ax1) / 2 + fs * 0.2,
			l1.y - fs * 1.08,
			0,
			'center'
		);
	}
	ctx.restore();
	return L;
}

// A chalk stroke from a to b by hand: a slight bow and a wobble, seeded, so
// the same stroke is drawn on every load.
function hand(a, b, wob = 1, seed = 1) {
	const n = 28;
	const pts = [];
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const bow = (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.012 * len;
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const wv = wob * (0.9 * Math.sin(t * 7.3 + seed) + 0.5 * Math.sin(t * 17.1 + seed * 2.3));
		const o = bow * 4 * t * (1 - t) + wv;
		pts.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
	}
	return pts;
}

// Characters of a laid-out line through the lens T (scale s), written on by
// `p` (0..1; the newest character fades in over a character's time), each
// culled off the board.
const FADE = 1.2;
function writeLine(ctx, ln, T, s, p, alpha, w, h, color = PAL.chalk) {
	if (p <= 0 || alpha <= 0.003) return;
	const n = p * (ln.text.length + FADE);
	const size = ln.size * s;
	const big = passing(size);
	if (size < 0.5 || big <= 0.003) return;
	ctx.save();
	ctx.font = ln.font(size);
	ctx.fillStyle = color;
	ctx.textBaseline = 'alphabetic';
	for (let i = 0; i < ln.text.length; i++) {
		const a = clamp01((n - i) / FADE);
		if (a <= 0) break;
		const ch = ln.text[i];
		if (ch === ' ') continue;
		const [X, Y] = T([ln.x0 + ln.xs[i], ln.y]);
		const adv = (ln.xs[i + 1] - ln.xs[i]) * s;
		if (X > w + 8 || X + adv * 1.5 + size * 0.2 < -8 || Y - size > h + 8 || Y + size * 0.4 < -8)
			continue;
		ctx.globalAlpha = alpha * a * 0.94 * big;
		ctx.fillText(ch, X, Y);
	}
	ctx.restore();
}

// Chalk at a size no board has dissolves as it passes the lens: by its size
// in px (a glyph's font size; the rules and the box go with the sentence's).
const passing = (px) => 1 - smooth(span(px, 600, 1250));

// The cursor's place on a line being written to `p`, at zoom 1.
const caretX = (ln, p) =>
	ln.x0 + ln.xs[Math.min(ln.text.length, Math.max(0, Math.floor(p * (ln.text.length + FADE))))];

function card(ctx, L, w, h, u, secs, os, v) {
	const B = CARD[v];
	const { stop } = L;
	// The lens: a log zoom into the stop, z ↦ e^{Z} z about it, while the stop
	// pans to the middle of the board.
	const Z = ZOOM * zoomCurve(span(u, B.zoom[0], B.zoom[1]));
	const s = Math.exp(Z);
	const pan = easeInOutCubic(span(u, B.pan[0], B.pan[1]));
	const ox = w / 2 + (stop.x - w / 2) * (1 - pan);
	const oy = h / 2 + (stop.y - h / 2) * (1 - pan);
	const T = ([x, y]) => [ox + s * (x - stop.x), oy + s * (y - stop.y)];
	const Tp = (pts) => pts.map(T);
	const gone = passing(L.fs * s);

	// The title variant's furniture: the date, the lecture's number.
	if (v === 'title') {
		writeLine(ctx, L.date, T, s, span(u, B.date[0], B.date[1]), 0.8, w, h);
		writeLine(ctx, L.lecture, T, s, span(u, B.lecture[0], B.lecture[1]), 0.92, w, h);
		const lr = span(u, B.lecture[1] - 0.01, B.lecture[1] + 0.02);
		stroke(ctx, Tp(L.lectureRule), {
			color: PAL.chalk,
			width: 1.6 * s,
			alpha: 0.7 * gone,
			upto: lr
		});
	}

	// The head and its rule.
	writeLine(ctx, L.head, T, s, span(u, B.head[0], B.head[1]), 0.95, w, h);
	const r0 = span(u, B.rule[0], B.rule[1]);
	stroke(ctx, Tp(L.rule[0]), {
		color: PAL.chalk,
		width: 2.2 * s,
		alpha: 0.8 * gone,
		upto: smooth(span(r0, 0, 0.7))
	});
	stroke(ctx, Tp(L.rule[1]), {
		color: PAL.chalk,
		width: 1.5 * s,
		alpha: 0.55 * gone,
		upto: smooth(span(r0, 0.55, 1))
	});

	// The three lines.
	L.lines.forEach((ln, i) => {
		const [a, b2] = B.lines[i];
		const p = span(u, a, b2);
		writeLine(ctx, ln, T, s, p, 1, w, h);
	});

	// The box and the correction (title).
	if (v === 'title') {
		const bx = span(u, B.box[0], B.box[1]);
		L.box.forEach((p, i) =>
			stroke(ctx, Tp(p), {
				color: PAL.chalk,
				width: 2 * s,
				alpha: 0.75 * gone,
				upto: smooth(span(bx, i * 0.24, i * 0.24 + 0.3))
			})
		);
		const st = span(u, B.strike[0], B.strike[1]);
		stroke(ctx, Tp(L.strike), { color: PAL.red, width: 3 * s, alpha: 0.95 * gone, upto: st });
		const fx = span(u, B.fix[0], B.fix[1]);
		writeLine(ctx, L.fix, T, s, fx, 1, w, h, PAL.red);
	}

	// The cursor (log-orb's): steady ahead of whatever is being written,
	// blinking where the next thing will be — the head's start before
	// anything, the first line's under the head, and the end of the sentence,
	// waiting for its full stop. Gone between lines, as on the card.
	const runs = [[L.head, B.head], ...L.lines.map((ln, i) => [ln, B.lines[i]])];
	let at = null;
	for (const [ln, [a, b2]] of runs) if (u >= a && u < b2) at = [ln, span(u, a, b2), true];
	if (!at && u < B.head[0]) at = [L.head, 0, false];
	else if (!at && u >= B.head[1] && u < B.lines[0][0] && u > B.rule[1]) at = [L.lines[0], 0, false];
	else if (!at && u >= B.lines[2][1] && u < B.stop) at = [L.lines[2], 1, false];
	if (at) {
		const [ln, p, typing] = at;
		const [X, Y] = T([caretX(ln, p), ln.y]);
		const a = ln === L.head && !typing ? span(u, 0.012, 0.03) : 1;
		cursor(ctx, X + (p > 0 ? 3 : -3) * s, Y, ln.size * s, a, typing, secs);
	}

	// The full stop: it lands as chalk, swells, lights, and is the orb — a
	// point of light that keeps its size as the lens closes in.
	if (u >= B.stop) {
		const [X, Y] = T([stop.x, stop.y]);
		const sw = smooth(span(u, B.swell[0], B.swell[1]));
		const land = span(u, B.stop, B.stop + 0.012);
		// The tap of chalk as it lands: a small ring of dust.
		const tp = span(u, B.stop, B.stop + 0.022);
		if (tp > 0 && tp < 1)
			stroke(ctx, circlePts(X, Y, stop.r * (1.8 + 6 * Math.sqrt(tp))), {
				color: PAL.chalk,
				width: 1,
				alpha: 0.4 * (1 - tp) ** 2
			});
		const rChalk = stop.r * s * lerp(1, 1.5, sw) * lerp(0.6, 1, land);
		disc(ctx, X, Y, rChalk, { fill: PAL.chalk, alpha: 0.95 * (1 - smooth(span(sw, 0.35, 0.8))) });
		const light = smooth(span(sw, 0.1, 0.75));
		const flare = 0.9 * bump(u, B.swell[1] - 0.01, 0.035);
		orb(ctx, X, Y, lerp(stop.r * 1.1, ORB_R, smooth(span(sw, 0.3, 1))), os, {
			alpha: light,
			flare
		});
	}
}

// The zoom's pace: from rest, gathering, then settling on the light.
function zoomCurve(x) {
	// A smootherstep, leaning late: most of the e-folds in the back half.
	const t = clamp01(x);
	const e = t * t * t * (t * (t * 6 - 15) + 10);
	return lerp(e, e * e, 0.25);
}

function circlePts(x, y, r, n = 64) {
	const pts = [];
	for (let i = 0; i <= n; i++)
		pts.push([x + r * Math.cos((TAU * i) / n), y + r * Math.sin((TAU * i) / n)]);
	return pts;
}

// ── axiom: a point, a circle, a pencil ───────────────────────────────────────
// In ℓ's frame (d along ℓ, n across it, z₀ at 0): the cyan circle k is
// centred at n/k with radius 1/k — tangent to ℓ at z₀ — and the pink circle j
// at d/j, radius 1/j — tangent to ℓ*. Under w = 1/z they are the lines
// Im w = −k/2 and Re w = j/2: the Cartesian grid seen from z₀, which is why
// the radii go as 1/k. Cyan k meets pink j again at 2(j d + k n)/(j² + k²).
const AX = {
	K: 6,
	beta: -0.26, // ℓ's angle
	write: [
		[0.04, 0.1],
		[0.15, 0.25],
		[0.3, 0.4],
		[0.42, 0.52],
		[0.56, 0.66]
	],
	dot: 0.1,
	C: [0.17, 0.25],
	ell: [0.24, 0.29],
	bloomC: [0.31, 0.43],
	ellStar: [0.42, 0.46],
	bloomP: [0.44, 0.55],
	nodes: [0.53, 0.6],
	right: [0.6, 0.64],
	light: [0.66, 0.72],
	gather: [0.72, 0.915],
	caption: [0.775, 0.82],
	wipe: [0.74, 0.86]
};

function axiom(ctx, w, h, u, os) {
	const S = 0.19 * h; // px to the unit: C has radius 1
	// z₀ sits right of and below the middle, clear of the proof, and the
	// light brings it home as the net gathers.
	const home = smooth(span(u, AX.light[0], AX.gather[0] + 0.1));
	const cx = lerp(0.565 * w, w / 2, home);
	const cy = lerp(0.545 * h, h / 2, home);
	const d = [Math.cos(AX.beta), Math.sin(AX.beta)];
	const n = [-Math.sin(AX.beta), Math.cos(AX.beta)];
	// z − z₀ ↦ λ(z − z₀) at the end: every circle of each pencil to a smaller
	// one of the same pencil, all of them into z₀.
	const lam = Math.exp(-6.2 * span(u, AX.gather[0], AX.gather[1]) ** 2.2);
	const P = (p) => [cx + S * lam * p[0], cy - S * lam * p[1]];
	const at = (a, b) => [a * d[0] + b * n[0], a * d[1] + b * n[1]];
	const wipe = 1 - smooth(span(u, AX.wipe[0], AX.wipe[1]));
	const fadePx = (rpx) => smooth(span(rpx, 3, 22));

	// ℓ and ℓ*, ruled through z₀ both ways, rose: construction.
	const ruled = (dir, sp, a) => {
		const k = smooth(span(u, sp[0], sp[1]));
		if (k <= 0) return;
		const L = (Math.hypot(w, h) / S) * 0.62 * k;
		const A = P([dir[0] * L, dir[1] * L]);
		const B = P([-dir[0] * L, -dir[1] * L]);
		const O = P([0, 0]);
		const o = { color: PAL.rose, width: 1.8, alpha: 0.75 * a };
		stroke(ctx, [O, A], o);
		stroke(ctx, [O, B], o);
	};
	ruled(d, AX.ell, wipe);
	ruled(n, AX.ellStar, wipe);

	// The circle C, written round from z₀; chalk, then one of the cyan pencil.
	const cOn = smooth(span(u, AX.C[0], AX.C[1]));
	const cCyan = smooth(span(u, AX.bloomC[0], AX.bloomC[0] + 0.05));
	// A circle of a pencil: centre c (unit), radius r, grown by g about z₀,
	// written on from z₀.
	const ring = (c, r, g, opts, upto = 1) => {
		const rpx = S * lam * r * g;
		if (rpx < 0.6) return;
		const fa = fadePx(rpx);
		if (fa <= 0.01) return;
		const a0 = Math.atan2(-c[1], -c[0]);
		const pts = [];
		const N = Math.max(24, Math.min(160, Math.round(rpx * 0.9)));
		for (let i = 0; i <= N; i++) {
			const a = a0 + (TAU * i) / N;
			pts.push(P([g * (c[0] + r * Math.cos(a)), g * (c[1] + r * Math.sin(a))]));
		}
		stroke(ctx, pts, { ...opts, alpha: (opts.alpha ?? 1) * fa, upto });
	};

	// The pencils: cyan k = 1..K each side of ℓ, pink j each side of ℓ*,
	// blooming out of z₀ — the smallest first, as if poured from the point.
	const K = AX.K;
	const grow = (sp, k, side) => {
		const t0 = lerp(sp[0], sp[1] - 0.05, (K - k) / (K - 1)) + (side < 0 ? 0.012 : 0);
		return easeOutBack(span(u, t0, t0 + 0.05));
	};
	for (const side of [1, -1])
		for (let k = K; k >= 1; k--) {
			if (side === 1 && k === 1) continue; // C itself
			const g = grow(AX.bloomC, k, side);
			if (g <= 0) continue;
			ring(at(0, side / k), 1 / k, g, { color: PAL.cyan, width: 2.4, alpha: 0.95 });
		}
	for (const side of [1, -1])
		for (let j = K; j >= 1; j--) {
			const g = grow(AX.bloomP, j, side);
			if (g <= 0) continue;
			ring(at(side / j, 0), 1 / j, g, { color: PAL.pink, width: 2.4, alpha: 0.95 });
		}
	// C: chalk while it is the only circle, cyan once the pencil is there.
	if (cOn > 0) {
		ring(at(0, 1), 1, 1, { color: PAL.chalk, width: 2.4, alpha: 0.9 * (1 - cCyan) }, cOn);
		if (cCyan > 0) ring(at(0, 1), 1, 1, { color: PAL.cyan, width: 2.4, alpha: 0.95 * cCyan });
	}

	// The nodes: grey discs where the families cross, growing with the
	// distance from z₀.
	const nd = smooth(span(u, AX.nodes[0], AX.nodes[1]));
	if (nd > 0)
		for (let j = -K; j <= K; j++)
			for (let k = -K; k <= K; k++) {
				if (!j || !k) continue;
				const q2 = j * j + k * k;
				const z = at((2 * j) / q2, (2 * k) / q2);
				const [x, y] = P(z);
				const rpx = Math.hypot(z[0], z[1]) * S * lam;
				const size = Math.max(1.3, Math.min(7.5, 0.034 * rpx));
				const t0 = (Math.abs(j) + Math.abs(k)) / (4 * K);
				disc(ctx, x, y, size, {
					fill: PAL.node,
					alpha: 0.85 * fadePx(rpx) * smooth(span(nd, t0, t0 + 0.5))
				});
			}

	// A right angle, marked where cyan 1 meets pink 1.
	const ra = smooth(span(u, AX.right[0], AX.right[1])) * wipe;
	if (ra > 0) {
		const z = at(1, 1);
		// Cyan 1 (centre n) has its radius along d there, so its tangent is n;
		// pink 1 (centre d) the other way round. The mark's sides run along both.
		const tc = d;
		const tp = n;
		const e = 0.15;
		const p1 = [z[0] - tc[0] * e, z[1] - tc[1] * e];
		const p2 = [p1[0] - tp[0] * e, p1[1] - tp[1] * e];
		const p3 = [z[0] - tp[0] * e, z[1] - tp[1] * e];
		stroke(ctx, [P(p1), P(p2), P(p3)], { color: PAL.chalk, width: 1.8, alpha: 0.9 * ra });
	}

	// The point: a chalk dot, then the light.
	const O = P([0, 0]);
	const dotOn = span(u, AX.dot, AX.dot + 0.012);
	const lt = smooth(span(u, AX.light[0], AX.light[1]));
	if (dotOn > 0) {
		disc(ctx, O[0], O[1], 4.6 * lerp(0.5, 1, dotOn), { fill: PAL.chalk, alpha: 1 - lt });
		const tp = span(u, AX.dot, AX.dot + 0.05);
		if (tp > 0 && tp < 1)
			stroke(ctx, circlePts(O[0], O[1], 6 + 22 * Math.sqrt(tp)), {
				color: PAL.chalk,
				width: 1.2,
				alpha: 0.5 * (1 - tp)
			});
	}
	orb(ctx, O[0], O[1], ORB_R, os, {
		alpha: lt,
		flare:
			0.8 * bump(u, AX.light[1], 0.035) +
			0.35 * span(u, AX.gather[0], AX.gather[1]) ** 3 * (1 - span(u, 0.9, 0.93))
	});

	// The labels.
	const la = (sp) => smooth(span(u, sp[0] + 0.02, sp[0] + 0.05)) * wipe;
	math(ctx, 'z_{0}', O[0] + 12, O[1] + 22, {
		size: 22,
		alpha: 0.95 * la([AX.dot - 0.01, 0]) * (1 - lt)
	});
	if (cOn > 0) {
		const [x, y] = P(at(0.62, 1.82));
		math(ctx, 'C', x, y, {
			size: 24,
			alpha: 0.95 * la(AX.C) * (1 - span(u, AX.gather[0], AX.gather[0] + 0.05))
		});
	}
	const edge = (dir, s) => {
		const L = 2.55;
		return P([dir[0] * L * s, dir[1] * L * s]);
	};
	{
		const [x, y] = edge(d, 1);
		math(ctx, 'ℓ', x - 6, y - 18, { size: 24, alpha: 0.9 * la(AX.ell) });
		const [x2, y2] = P([-n[0] * 2.05, -n[1] * 2.05]);
		math(ctx, 'ℓ*', x2 + 14, y2, { size: 24, alpha: 0.9 * la(AX.ellStar) });
	}

	// The proof.
	const W = AX.write;
	lect(
		ctx,
		w,
		h,
		[
			['Let z_{0} be a point.', span(u, W[0][0], W[0][1]), wipe],
			[
				'Let C be a circle through z_{0}, and ℓ its tangent there.',
				span(u, W[1][0], W[1][1]),
				wipe
			],
			['The circles tangent to ℓ at z_{0}: a pencil.', span(u, W[2][0], W[2][1]), wipe],
			['Those tangent to ℓ* ⊥ ℓ at z_{0}: its orthogonal pencil.', span(u, W[3][0], W[3][1]), wipe],
			[
				'Each meets each at right angles, and all meet at z_{0}.  ∎',
				span(u, W[4][0], W[4][1]),
				wipe
			]
		],
		{ back: 0.75 * smooth(span(u, AX.bloomC[0], AX.bloomP[1])) }
	);
	// And the map that ends it, written under the light as it works, once
	// the net has drawn in clear of it.
	const zw = span(u, AX.caption[0], AX.caption[1]);
	const zl = smooth(zw * 3) * (1 - smooth(span(u, 0.86, 0.915)));
	if (zl > 0)
		math(ctx, 'z − z_{0} ↦ λ(z − z_{0}),   λ → 0', w / 2, h / 2 + 0.3 * h, {
			size: 24,
			alpha: 0.9 * zl,
			align: 'center',
			upto: zw
		});
}

// An overshoot that settles: a circle blooming.
function easeOutBack(x) {
	const t = clamp01(x);
	if (t <= 0) return 0;
	const c = 1.4;
	return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
}

// ── cone: the moment as an event ─────────────────────────────────────────────
// Spacetime with one space dimension drawn, then two: world x is x, world y
// is t, world z is the second space axis y. The diagram is drawn flat in the
// (x, t) plane facing the lens; the lens then tips up over it (orbit's
// elevation 0 → 90°) to look straight down the t axis from the future, and
// falls back down it toward the apex. The cone's rings sit at log-spaced
// heights t = T e^{−0.3 j}, so as the lens falls they stream past at a steady
// rate: the cone is its own zoom.
const CONE = {
	T: 14, // the cone's reach, up and down
	X: 23, // the x axis' reach
	dist: 66,
	land: 0.05,
	fov: 30,
	rings: 16,
	ring: 0.3, // log spacing of the rings
	radio: -11, // the radio's x, and the song's departure (−11, −11)
	born: 3
};
const youX = (t) => 1.25 * Math.sin(0.45 * t);

function cone(ctx, w, h, u, os) {
	const { T, X } = CONE;
	const tip = easeInOutCubic(span(u, 0.47, 0.7));
	const el = (Math.PI / 2) * tip;
	const fall = smooth(span(u, 0.55, 0.95));
	const dist = Math.exp(lerp(Math.log(CONE.dist), Math.log(CONE.land), fall));
	const cam = orbit(w, h, { target: [0, 0, 0], az: 0, el, dist, fov: CONE.fov });
	const cx = w / 2;
	const cy = h / 2;
	const flat = 1 - smooth(span(u, 0.47, 0.57)); // the diagram's type, as the lens tips
	const ring3 = smooth(span(u, 0.48, 0.61)); // the cone shows itself as a cone
	const end = 1 - smooth(span(u, 0.86, 0.93));
	// The generators go as the rings stream past, so the light is not left
	// on a sunburst.
	const rays = 1 - smooth(span(u, 0.74, 0.84));
	const W = (o) => ({ ...o, ref: dist });

	// The axes, chalk, drawn out of the origin.
	const ax = smooth(span(u, 0.04, 0.12));
	const axA = 1 - smooth(span(u, 0.59, 0.69));
	const tA = 1 - smooth(span(u, 0.55, 0.65));
	if (ax > 0) {
		line3(
			ctx,
			cam,
			seg([-X * ax, 0, 0], [X * ax, 0, 0]),
			W({ color: PAL.chalk, width: 2, alpha: 0.8 * axA })
		);
		line3(
			ctx,
			cam,
			seg([0, -T * ax, 0], [0, (T + 1.5) * ax, 0]),
			W({ color: PAL.chalk, width: 2, alpha: 0.8 * tA })
		);
		arrow(ctx, cam, [X * ax, 0, 0], [X * ax - 1, 0, 0], 0.8 * axA * ax);
		arrow(ctx, cam, [0, (T + 1.5) * ax, 0], [0, (T + 1.5) * ax - 1, 0], 0.8 * tA * ax);
		const la = span(u, 0.1, 0.13);
		label3(ctx, cam, [X, 0, 0], 'x', { dx: -6, dy: 22, size: 24, alpha: la * flat });
		label3(ctx, cam, [0, T + 1.5, 0], 't', { dx: 14, dy: 4, size: 24, alpha: la * flat });
	}
	// The second space axis, as the lens tips and space has room for it.
	const yA = smooth(span(u, 0.52, 0.61)) * axA;
	if (yA > 0) {
		line3(ctx, cam, seg([0, 0, -X], [0, 0, X]), W({ color: PAL.chalk, width: 2, alpha: 0.7 * yA }));
		arrow(ctx, cam, [0, 0, -X], [0, 0, -X + 1], 0.7 * yA);
		label3(ctx, cam, [0, 0, -X], 'y', { dx: 14, dy: 0, size: 24, alpha: yA });
	}

	// The light cone: its two generators in the diagram's plane, gold, drawn
	// out of the apex both ways; the others, and the rings, as it turns.
	const lc = smooth(span(u, 0.13, 0.22));
	const gens = 12;
	for (let g = 0; g < gens; g++) {
		const ph = (TAU * g) / gens;
		// The two in the diagram's plane are the diagram's light lines, bold;
		// once the cone is seen as a cone they are generators like the rest.
		const inPlane = g === 0 || g === gens / 2;
		const bold = inPlane ? 1 - ring3 : 0;
		const a = (inPlane ? lerp(0.55, 1, bold) * lc : ring3 * 0.55) * rays;
		if (a <= 0.01) continue;
		const c = Math.cos(ph);
		const s = Math.sin(ph);
		const r = T * (inPlane ? lc : 1);
		const fade = (p) => centreFade(cam, p, cx, cy);
		line3(
			ctx,
			cam,
			generator(c, s, 1, r),
			W({ color: PAL.gold, width: lerp(1.6, 3, bold), alpha: 0.95 * a, glow: 6 * bold }),
			{ fade }
		);
		line3(
			ctx,
			cam,
			generator(c, s, -1, r),
			W({ color: PAL.gold, width: lerp(1.4, 2.6, bold), alpha: 0.8 * a }),
			{ fade }
		);
	}
	// The rings: cross sections t = ±r, log spaced, the future gold and the
	// past rose and dashed, each dissolving as it nears the light.
	if (ring3 > 0) {
		for (let j = 0; j <= CONE.rings; j++) {
			const t = T * Math.exp(-CONE.ring * j);
			for (const sgn of [1, -1]) {
				const c = [0, sgn * t, 0];
				const q = cam.project([t, sgn * t, 0]);
				const o = cam.project(c);
				let a = ring3 * (sgn > 0 ? 0.9 : 0.5);
				if (o[2] > 0.05 && q[2] > 0.05) {
					const rpx = Math.hypot(q[0] - o[0], q[1] - o[1]);
					a *= smooth(span(rpx, 10, 46));
				}
				if (a <= 0.01) continue;
				const pts = circle3(c, [1, 0, 0], [0, 0, 1], t, 120);
				if (sgn > 0) line3(ctx, cam, pts, W({ color: PAL.gold, width: 2, alpha: a }));
				else stroke3dash(ctx, cam, pts, { color: PAL.rose, width: 1.6, alpha: a });
			}
		}
	}

	// The radio, at rest off to the left, and the song it sends along the
	// past cone, arriving here, now.
	const rd = smooth(span(u, 0.22, 0.27)) * (1 - smooth(span(u, 0.49, 0.59)));
	if (rd > 0) {
		const R = CONE.radio;
		line3(
			ctx,
			cam,
			seg([R, -T, 0], [R, T + 0.5, 0]),
			W({ color: PAL.rose, width: 2, alpha: 0.85 * rd })
		);
		label3(ctx, cam, [R, 8.5, 0], 'radio', { dx: -12, dy: 0, size: 20, alpha: rd * flat });
		const ev = cam.project([R, R, 0]);
		disc(ctx, ev[0], ev[1], 5, { fill: PAL.chalk, alpha: rd });
		label3(ctx, cam, [R, R, 0], '♪', {
			dx: -14,
			dy: 2,
			size: 26,
			alpha: rd * flat * span(u, 0.25, 0.28),
			color: PAL.gold
		});
		// The song, leaving at the speed of light: a pulse along the past cone.
		const sg = span(u, 0.27, 0.36);
		if (sg > 0 && sg < 1) {
			const a = R * (1 - sg);
			const b2 = R * (1 - Math.max(0, sg - 0.12));
			const p = cam.project([a, a, 0]);
			line3(
				ctx,
				cam,
				seg([b2, b2, 0], [a, a, 0]),
				W({ color: '#fff3d0', width: 3.4, alpha: rd, glow: 12 })
			);
			glow(ctx, p[0], p[1], 30, [245, 193, 80], 0.7 * rd);
		}
	}

	// You: a worldline out of the apex, born a little way up it.
	const yu = smooth(span(u, 0.3, 0.42)) * (1 - smooth(span(u, 0.52, 0.65)));
	if (yu > 0) {
		const top = T * smooth(span(u, 0.3, 0.42));
		const pts = [];
		for (let i = 0; i <= 80; i++) {
			const t = (top * i) / 80;
			pts.push([youX(t), t, 0]);
		}
		line3(ctx, cam, pts, W({ color: PAL.chalk, width: 2.4, alpha: 0.9 * yu }));
		if (top > CONE.born) {
			const pb = cam.project([youX(CONE.born), CONE.born, 0]);
			disc(ctx, pb[0], pb[1], 5, { fill: PAL.chalk, alpha: yu });
			math(ctx, 'born', pb[0] + 14, pb[1] + 2, { size: 20, alpha: 0.9 * yu * flat });
		}
		label3(ctx, cam, [youX(top), top, 0], 'you', {
			dx: 14,
			dy: 6,
			size: 22,
			alpha: yu * flat * span(u, 0.38, 0.42)
		});
	}

	// The regions and the cone's equations, while the diagram is flat.
	const rg = smooth(span(u, 0.2, 0.25)) * flat;
	if (rg > 0) {
		label3(ctx, cam, [2.2, T * 0.86, 0], 'future', { size: 20, alpha: 0.6 * rg });
		label3(ctx, cam, [2.2, -T * 0.86, 0], 'past', { size: 20, alpha: 0.6 * rg });
		label3(ctx, cam, [X * 0.7, T * 0.3, 0], 'elsewhere', { dx: 0, size: 20, alpha: 0.5 * rg });
		label3(ctx, cam, [-X * 0.7, T * 0.3, 0], 'elsewhere', { dx: -1, size: 20, alpha: 0.5 * rg });
		const e = 0.8 * T;
		label3(ctx, cam, [e, e, 0], 't = x', {
			dx: 16,
			dy: 4,
			size: 22,
			alpha: 0.9 * rg,
			color: PAL.gold
		});
		label3(ctx, cam, [-e, e, 0], 't = −x', {
			dx: -16,
			dy: 4,
			size: 22,
			alpha: 0.9 * rg,
			color: PAL.gold
		});
	}

	// The apex: an event, then the light.
	const ap = smooth(span(u, 0.12, 0.15));
	const lt = smooth(span(u, 0.67, 0.8));
	const heard = bump(u, 0.362, 0.012);
	if (ap > 0) {
		disc(ctx, cx, cy, 5.5, { fill: PAL.gold, alpha: ap * (1 - lt) });
		glow(ctx, cx, cy, 40 + 30 * heard, [245, 193, 80], (0.25 + 0.5 * heard) * ap * (1 - lt));
		math(ctx, 'here, now', cx + 16, cy + 22, { size: 20, alpha: 0.95 * ap * flat });
	}
	orb(ctx, cx, cy, ORB_R, os, { alpha: lt, flare: 0.5 * bump(u, 0.8, 0.04) });

	lect(
		ctx,
		w,
		h,
		[
			['ds^{2} = dt^{2} − dx^{2} − dy^{2}', span(u, 0.05, 0.12), end],
			['light: ds^{2} = 0', span(u, 0.15, 0.2), end],
			['the light cone:  t^{2} = x^{2} + y^{2}', span(u, 0.52, 0.6), end],
			['(t, x, y) ↦ λ(t, x, y) :  the cone is its own zoom', span(u, 0.67, 0.76), end]
		],
		{ back: 0.45 }
	);
}

// A generator of the cone, (r c, ±r, r s) out of the apex, sampled
// geometrically — fine near the apex, where the lens ends up — so it can be
// faded into the light and cut at the lens.
function generator(c, s, sgn, r) {
	const out = [[0, 0, 0]];
	const n = 64;
	for (let i = n; i >= 0; i--) {
		const t = r * Math.exp(-0.12 * i);
		out.push([t * c, sgn * t, t * s]);
	}
	return out;
}

// A straight 3D segment as n points (so it can be cut at the lens and faded).
function seg(a, b, n = 2) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
	}
	return out;
}

// An arrowhead at a 3D tip, pointing away from `back`, in screen space.
function arrow(ctx, cam, tip, back, a) {
	if (a <= 0.01) return;
	const p = cam.project(tip);
	const q = cam.project(back);
	if (p[2] <= 0.05 || q[2] <= 0.05) return;
	const dx = p[0] - q[0];
	const dy = p[1] - q[1];
	const l = Math.hypot(dx, dy);
	if (l < 0.5) return;
	const ux = dx / l;
	const uy = dy / l;
	const s = 11;
	stroke(
		ctx,
		[
			[p[0] - ux * s - uy * s * 0.55, p[1] - uy * s + ux * s * 0.55],
			[p[0], p[1]],
			[p[0] - ux * s + uy * s * 0.55, p[1] - uy * s - ux * s * 0.55]
		],
		{ color: PAL.chalk, width: 2, alpha: a }
	);
}

// Lines dissolve into the light at the centre rather than knotting there.
function centreFade(cam, p, cx, cy) {
	const q = cam.project(p);
	if (q[2] <= 0.05) return 1;
	return smooth(span(Math.hypot(q[0] - cx, q[1] - cy), 10, 40));
}

// A dashed 3D polyline, cut at the lens: the past cone's rings.
function stroke3dash(ctx, cam, pts, o) {
	let run = [];
	const flush = () => {
		if (run.length > 1) stroke(ctx, run, { ...o, dash: [4, 7] });
		run = [];
	};
	for (const p of pts) {
		const q = cam.project(p);
		if (q[2] <= 0.05) {
			flush();
			continue;
		}
		run.push(q);
	}
	flush();
}

// ── sky: the pole, a long exposure ───────────────────────────────────────────
// Real stars (J2000): name, right ascension (h), declination (°), magnitude,
// colour. Stereographic from the south pole, as seen from inside looking up:
// z = tan(½p) e^{−iα}, p = 90° − δ, so right ascension runs clockwise and the
// Earth's turn, z ↦ e^{iθ} z, is anticlockwise — as the sky turns round the
// pole when you face north.
const STARS = [
	['Polaris', 2.53, 89.264, 1.98, 'c'],
	['Yildun', 17.537, 86.586, 4.35, 'c'],
	['εUMi', 16.766, 82.037, 4.21, 'c'],
	['ζUMi', 15.734, 77.794, 4.29, 'c'],
	['Kochab', 14.845, 74.156, 2.08, 'g'],
	['Pherkad', 15.345, 71.834, 3.05, 'c'],
	['ηUMi', 16.292, 75.755, 4.95, 'c'],
	['Dubhe', 11.062, 61.751, 1.79, 'g'],
	['Merak', 11.031, 56.383, 2.37, 'b'],
	['Phecda', 11.897, 53.695, 2.44, 'b'],
	['Megrez', 12.257, 57.033, 3.31, 'b'],
	['Alioth', 12.9, 55.96, 1.77, 'b'],
	['Mizar', 13.399, 54.925, 2.27, 'b'],
	['Alkaid', 13.792, 49.313, 1.86, 'b'],
	['Caph', 0.153, 59.15, 2.27, 'c'],
	['Schedar', 0.675, 56.537, 2.24, 'g'],
	['Navi', 0.945, 60.717, 2.47, 'b'],
	['Ruchbah', 1.43, 60.235, 2.68, 'b'],
	['Segin', 1.906, 63.67, 3.37, 'b'],
	['Alderamin', 21.31, 62.585, 2.45, 'c'],
	['Alfirk', 21.478, 70.561, 3.23, 'b'],
	['Errai', 23.656, 77.633, 3.21, 'g'],
	['ιCep', 22.828, 66.201, 3.52, 'g'],
	['ζCep', 22.181, 58.201, 3.35, 'g'],
	['Thuban', 14.073, 64.376, 3.65, 'c'],
	['Eltanin', 17.943, 51.489, 2.23, 'g'],
	['Rastaban', 17.507, 52.301, 2.79, 'g'],
	['Grumium', 17.892, 56.873, 3.75, 'g'],
	['νDra', 17.536, 55.184, 4.88, 'c'],
	['Altais', 19.209, 67.661, 3.07, 'g'],
	['ζDra', 17.146, 65.715, 3.17, 'b'],
	['ηDra', 16.4, 61.514, 2.73, 'g'],
	['Edasich', 15.416, 58.966, 3.29, 'g'],
	['Vega', 18.616, 38.784, 0.03, 'b'],
	['Deneb', 20.69, 45.28, 1.25, 'c'],
	['Capella', 5.278, 45.998, 0.08, 'g'],
	['Menkalinan', 5.992, 44.947, 1.9, 'c'],
	['Mirfak', 3.405, 49.861, 1.79, 'c']
];
const FIGURES = [
	['Ursa Minor', ['Polaris', 'Yildun', 'εUMi', 'ζUMi', 'Kochab', 'Pherkad', 'ηUMi', 'ζUMi'], 0],
	[
		'the Plough',
		['Alkaid', 'Mizar', 'Alioth', 'Megrez', 'Dubhe', 'Merak', 'Phecda', 'Megrez'],
		-20
	],
	['Cassiopeia', ['Caph', 'Schedar', 'Navi', 'Ruchbah', 'Segin'], 10],
	['Cepheus', ['Alderamin', 'Alfirk', 'Errai', 'ιCep', 'ζCep', 'Alderamin'], 10],
	[
		'Draco',
		[
			'Eltanin',
			'Rastaban',
			'νDra',
			'Grumium',
			'Eltanin',
			'Grumium',
			'Altais',
			'ζDra',
			'ηDra',
			'Edasich',
			'Thuban'
		],
		0
	]
];
const LONE = ['Vega', 'Capella', 'Deneb'];
const STAR_COLOR = { c: PAL.chalk, g: PAL.gold, b: PAL.cyan };

// The flow, in seconds: the Earth's turn from tE, the boost joining it at
// tL (pitch k, ramped in over half a second so the trails do not kink), the
// turn gathering pace until every star is in the pole.
const SKY = { tE: 2.3, tL: 4.6, k: 0.36, w1: 0.62, acc: 0.82, S: 0.94 };

function makeSky() {
	const stars = STARS.map(([name, ra, dec, mag, col]) => {
		const p = ((90 - dec) * Math.PI) / 180;
		const r = Math.tan(p / 2);
		const a = (-ra * TAU) / 24;
		return { name, z: [r * Math.cos(a), r * Math.sin(a)], mag, color: STAR_COLOR[col], real: true };
	});
	const byName = Object.fromEntries(stars.map((s) => [s.name, s]));
	// And the faint ones that make the exposure: seeded, so every load
	// has the same sky.
	let seed = 20261002;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	for (let i = 0; i < 96; i++) {
		const cp = lerp(Math.cos((2 * Math.PI) / 180), Math.cos((60 * Math.PI) / 180), rnd());
		const p = Math.acos(cp);
		const r = Math.tan(p / 2);
		const a = rnd() * TAU;
		const c = rnd();
		stars.push({
			z: [r * Math.cos(a), r * Math.sin(a)],
			mag: 4.3 + 1.5 * rnd(),
			color: c < 0.12 ? PAL.gold : c < 0.24 ? PAL.cyan : PAL.chalk,
			real: false
		});
	}
	// The flow's table: θ(t) and K(t), the turn and the log of the zoom.
	const dt = 0.002;
	const N = Math.ceil(11.5 / dt);
	const TH = new Float64Array(N + 1);
	const KK = new Float64Array(N + 1);
	const omega = (t) => {
		if (t <= SKY.tE) return 0;
		const w = SKY.w1 * smooth((t - SKY.tE) / 0.9);
		return t <= SKY.tL ? w : w + SKY.acc * (t - SKY.tL) ** 2;
	};
	const ramp = (t) => smooth((t - SKY.tL) / 0.55);
	for (let i = 1; i <= N; i++) {
		const t = (i - 0.5) * dt;
		const om = omega(t);
		TH[i] = TH[i - 1] + om * dt;
		KK[i] = KK[i - 1] + SKY.k * om * ramp(t) * dt;
	}
	const lookup = (A, t) => {
		const x = clamp01(t / (N * dt)) * N;
		const i = Math.min(N - 1, Math.floor(x));
		return lerp(A[i], A[i + 1], x - i);
	};

	return {
		draw(ctx, w, h, u, os) {
			const t = u * SECONDS;
			const S = SKY.S * h; // px to the unit: the equator, were it on the board
			const cx = w / 2;
			const cy = h / 2;
			const P = (z) => [cx + S * z[0], cy - S * z[1]];
			const th = lookup(TH, t);
			const K = lookup(KK, t);
			const g = [Math.exp(-K) * Math.cos(th), Math.exp(-K) * Math.sin(th)];
			const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
			const end = 1 - smooth(span(u, 0.8, 0.9));

			// The grid: declination rings every 10°, hour rays every 2h, rose.
			const gw = smooth(span(u, 0.02, 0.12));
			const gA = 0.32 * (1 - smooth(span(u, 0.74, 0.86)));
			if (gw > 0 && gA > 0) {
				for (let dec = 80; dec >= 10; dec -= 10) {
					const r = Math.tan(((90 - dec) * Math.PI) / 360) * S;
					stroke(ctx, circlePts(cx, cy, r, 160), {
						color: PAL.rose,
						width: dec % 30 ? 1.1 : 1.6,
						alpha: gA,
						upto: gw
					});
				}
				const rIn = Math.tan((5 * Math.PI) / 360) * S;
				const rOut = Math.hypot(w, h) / 2;
				for (let hr = 0; hr < 24; hr += 2) {
					const a = (-hr * TAU) / 24;
					const c = Math.cos(a);
					const s = Math.sin(a);
					stroke(
						ctx,
						[
							[cx + rIn * c, cy - rIn * s],
							[cx + lerp(rIn, rOut, gw) * c, cy - lerp(rIn, rOut, gw) * s]
						],
						{ color: PAL.rose, width: hr % 6 ? 1 : 1.5, alpha: gA }
					);
				}
				// Two of the hours, and two of the rings, labelled.
				const la = gA * 2.4 * span(u, 0.1, 0.14);
				math(ctx, '0^{h}', w - 30, cy - 14, { size: 18, alpha: la, align: 'right' });
				math(ctx, '12^{h}', 30, cy - 14, { size: 18, alpha: la });
				math(ctx, '6^{h}', cx + 10, h - 26, { size: 18, alpha: la });
				for (const dec of [60, 30]) {
					const r = Math.tan(((90 - dec) * Math.PI) / 360) * S;
					const a = -2.62;
					math(ctx, `${dec}°`, cx + r * Math.cos(a) + 6, cy - r * Math.sin(a) + 14, {
						size: 16,
						alpha: la
					});
				}
			}

			// The trails: every star follows z ↦ g(τ) z, so each trail is one
			// path, turned and scaled to the star — sampled every 0.09 of log
			// distance on the cylinder (a chord within ⅓ px of the arc at the
			// rim), and no finer than 3 px on the board.
			const path = [];
			if (t > SKY.tE) {
				const i0 = Math.floor(SKY.tE / 0.002);
				const i1 = Math.floor(t / 0.002);
				let lt = -1e9;
				let lk = -1e9;
				const tab = (i) => [lookup(TH, i * 0.002), lookup(KK, i * 0.002)];
				for (let i = i0; i <= i1; i++) {
					const [a, kk] = tab(i);
					if (Math.abs(a - lt) + Math.abs(kk - lk) >= 0.09 || i === i1) {
						path.push([kk, Math.exp(-kk) * Math.cos(a), Math.exp(-kk) * Math.sin(a)]);
						lt = a;
						lk = kk;
					}
				}
				path.push([K, g[0], g[1]]);
			}
			const trail = end * smooth(span(u, 0.22, 0.25));
			if (path.length > 1 && trail > 0) {
				// Added, as light is on a plate: where the trails crowd, the
				// pole brightens. The real stars each a stroke of their own; the
				// faint ones batched, a path to a colour.
				ctx.save();
				ctx.globalCompositeOperation = 'lighter';
				const faint = new Map();
				for (const st of stars) {
					const r0 = Math.hypot(st.z[0], st.z[1]) * S;
					const kCut = Math.log(Math.max(1.0001, r0 / 3));
					const pts = [];
					let lx = -1e9;
					let ly = -1e9;
					for (let m = 0; m < path.length; m++) {
						const [kk, gx, gy] = path[m];
						if (kk > kCut) break;
						const q = P(mul(st.z, [gx, gy]));
						// No closer than 3 px: near the pole the path is finer
						// than any screen.
						if (m < path.length - 1 && Math.abs(q[0] - lx) + Math.abs(q[1] - ly) < 3) continue;
						pts.push(q);
						lx = q[0];
						ly = q[1];
					}
					if (pts.length < 2) continue;
					if (st.real) {
						stroke(ctx, pts, {
							color: st.color,
							width: Math.max(0.7, 2.6 - 0.48 * st.mag),
							alpha: trail * 0.8
						});
					} else {
						if (!faint.has(st.color)) faint.set(st.color, []);
						faint.get(st.color).push(pts);
					}
				}
				// One path never adds to itself, so the batch needs no 'lighter'.
				ctx.globalCompositeOperation = 'source-over';
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.lineWidth = 0.8;
				ctx.globalAlpha = trail * 0.45;
				for (const [color, runs] of faint) {
					ctx.strokeStyle = color;
					ctx.beginPath();
					for (const pts of runs) {
						ctx.moveTo(pts[0][0], pts[0][1]);
						for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
					}
					ctx.stroke();
				}
				ctx.restore();
			}

			// The stars, where they are now.
			const now = t > SKY.tE ? g : [1, 0];
			const shown = [];
			for (let i = 0; i < stars.length; i++) {
				const st = stars[i];
				const t0 = st.real ? 0.05 + 0.08 * clamp01(st.mag / 5) : 0.09 + 0.08 * ((i * 0.618) % 1);
				const on = smooth(span(u, t0, t0 + 0.03));
				if (on <= 0) continue;
				const z = mul(st.z, now);
				const [x, y] = P(z);
				const rpx = Math.hypot(z[0], z[1]) * S;
				const a = on * smooth(span(rpx, 3, 12));
				if (a <= 0.01) continue;
				const r = Math.max(1, 4.4 - 0.75 * st.mag);
				if (st.mag < 2.6) glow(ctx, x, y, 14 + 8 * (2.6 - st.mag), [236, 230, 218], 0.22 * a);
				disc(ctx, x, y, r, {
					fill: st.real ? st.color : PAL.chalk,
					alpha: a * (st.real ? 1 : 0.7)
				});
				shown.push([x, y]);
			}

			// The figures and their names, before the exposure carries them off.
			const fg = smooth(span(u, 0.12, 0.19)) * (1 - smooth(span(u, 0.25, 0.33)));
			if (fg > 0) {
				for (const [name, chain, off] of FIGURES) {
					const pts = chain.map((nm) => P(mul(byName[nm].z, now)));
					stroke(ctx, pts, {
						color: PAL.chalk,
						width: 1.4,
						alpha: 0.6 * fg,
						upto: smooth(span(u, 0.12, 0.18))
					});
					// The name just outside the figure, away from the pole.
					const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
					const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
					const ul = Math.hypot(mx - cx, my - cy) || 1;
					const dx = (mx - cx) / ul;
					const dy = (my - cy) / ul;
					let ext = 0;
					for (const p of pts) ext = Math.max(ext, (p[0] - mx) * dx + (p[1] - my) * dy);
					math(ctx, name, mx + dx * (ext + 30) + off, my + dy * (ext + 18), {
						size: 19,
						alpha: 0.8 * fg,
						align: 'center'
					});
				}
				for (const nm of LONE) {
					const [x, y] = P(mul(byName[nm].z, now));
					math(ctx, nm, x + 12, y - 14, { size: 16, alpha: 0.6 * fg });
				}
			}

			// The pole: z = 0, marked; then the light every star pours into.
			const pm = smooth(span(u, 0.08, 0.12)) * (1 - smooth(span(u, 0.5, 0.6)));
			if (pm > 0) {
				stroke(
					ctx,
					[
						[cx - 7, cy],
						[cx + 7, cy]
					],
					{ color: PAL.chalk, width: 1.4, alpha: 0.7 * pm }
				);
				stroke(
					ctx,
					[
						[cx, cy - 7],
						[cx, cy + 7]
					],
					{ color: PAL.chalk, width: 1.4, alpha: 0.7 * pm }
				);
			}
			const lt = smooth(span(u, 0.5, 0.74));
			orb(ctx, cx, cy, ORB_R * lerp(0.45, 1, smooth(span(u, 0.55, 0.85))), os, {
				alpha: lt,
				flare: 0.6 * bump(u, 0.8, 0.05)
			});

			lect(
				ctx,
				w,
				h,
				[
					['the sky from inside:  z = tan(½p) e^{−iα}', span(u, 0.04, 0.13), end],
					['z ↦ e^{iθ} z :  the Earth turns', span(u, 0.24, 0.32), end],
					['z ↦ e^{(−k + i)θ} z :  turn, and a boost toward the pole', span(u, 0.46, 0.56), end]
				],
				{ back: 0.55 }
			);
		}
	};
}
