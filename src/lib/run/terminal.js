import { disc, PAL, TAU, TECH_FONT, span, smooth, lerp, clamp01, easeInOutCubic } from './board.js';
import { glow } from './ink.js';

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
//   terminal the title card as the terminal it always wanted to be: the
//            site's mono face, a block caret blinking alone on the dark, then
//            `$ ./conception --calculate` typed at a keystroke rhythm (uneven,
//            seeded: a hitch at every space, a longer one at punctuation),
//            run, and the three lines printed below it the same way, with a
//            pause before the last word. The caret waits after "conception",
//            then the full stop is typed: the block caret closes to the dot,
//            which swells, lights, and is the orb, and the lens zooms into it
//            as fullstop does, the lines streaming out past the edges.
//
// How: the typed variants lay their lines out once per board size (every
// character's offset from the measured width of its prefix, so kerning
// holds) and draw them through one similarity, z ↦ e^{Z}(z − stop) + pan;
// the terminal's keystrokes are a table of times built once, so the count
// typed at any u is a lookup.
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

// A bump of light at u0, width wd.
const bump = (u, u0, wd) => Math.exp(-(((u - u0) / wd) ** 2));

const LINES = [
	'in the earth year 2000, human technology advanced',
	'allowing all of mankind to calculate the song playing',
	'at their exact moment of conception'
];

// How far the lens goes into the point: e^{ZOOM}, a little past where the
// last glyph has dissolved.
const ZOOM = Math.log(55);

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

const TECH = (s) => `400 ${s}px ${TECH_FONT}`;

// Characters of a laid-out line through the lens T (scale s), each at the
// alpha `aOf(i)` gives it (drawing stops at the first 0) and in the colour
// `color` (a string, or a function of i), each culled off the board.
function glyphs(ctx, ln, T, s, aOf, alpha, w, h, color) {
	const size = ln.size * s;
	const big = passing(size);
	if (size < 0.5 || big <= 0.003 || alpha <= 0.003) return;
	ctx.save();
	ctx.font = ln.font(size);
	ctx.textBaseline = 'alphabetic';
	for (let i = 0; i < ln.text.length; i++) {
		const a = aOf(i);
		if (a <= 0) break;
		const ch = ln.text[i];
		if (ch === ' ') continue;
		const [X, Y] = T([ln.x0 + ln.xs[i], ln.y]);
		const adv = (ln.xs[i + 1] - ln.xs[i]) * s;
		if (X > w + 8 || X + adv * 1.5 + size * 0.2 < -8 || Y - size > h + 8 || Y + size * 0.4 < -8)
			continue;
		ctx.globalAlpha = alpha * a * 0.94 * big;
		ctx.fillStyle = typeof color === 'function' ? color(i) : color;
		ctx.fillText(ch, X, Y);
	}
	ctx.restore();
}

// A line TYPED to its first `n` characters: each there whole, as a terminal
// prints it.
function typeLine(ctx, ln, T, s, n, alpha, w, h, color = PAL.chalk) {
	if (n <= 0) return;
	glyphs(ctx, ln, T, s, (i) => (i < n ? 1 : 0), alpha, w, h, color);
}

// Chalk at a size no board has dissolves as it passes the lens: by its size
// in px (a glyph's font size; the rules and the box go with the sentence's).
const passing = (px) => 1 - smooth(span(px, 600, 1250));

// The zoom's pace: from rest, gathering, then settling on the light.
function zoomCurve(x) {
	// A smootherstep, leaning late: most of the e-folds in the back half.
	const t = clamp01(x);
	const e = t * t * t * (t * (t * 6 - 15) + 10);
	return lerp(e, e * e, 0.25);
}

// ── terminal: the card as a terminal ─────────────────────────────────────────
// The site's mono face; a prompt, a command, and the sentence printed as its
// output, every keystroke on a table of times built once (so the count typed
// at any u is a lookup): a base interval jittered by a seeded random, a hitch
// after every space, a longer one at punctuation, a line's gap, a run's pause
// after the command, and a pause before the last word. The block caret blinks
// on the clock while it waits and holds steady within a keystroke of the last
// one. The full stop is the last keystroke: the caret closes to the dot, the
// dot swells into the orb, and the lens goes into it as fullstop's does.
const TERM = {
	cmd: '$ ./conception --calculate',
	lead: 0.45, // the caret alone, s
	keyCmd: 0.03, // base interval, s, for the command
	keyOut: 0.021, // and for the output
	run: 0.38, // the pause after the command is run
	gap: 0.2, // between output lines
	lastWord: 0.4, // before "conception"
	wait: 0.35, // the caret after "conception", before the stop
	blink: 2.3 // blinks a second
};

// The keystrokes: a time for each character of each line, in seconds. With
// no command (the flows' opening: clean, technical, primordial — a caret, the
// sentence, the stop) the output starts after the lead.
function keystrokes(withCmd = true) {
	let seed = 20001;
	const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
	let t = TERM.lead;
	const typed = (text, base, last = false) => {
		const times = [];
		for (let i = 0; i < text.length; i++) {
			let dt = base * (0.55 + 0.9 * rnd());
			if (i > 0 && text[i - 1] === ' ') dt += base * 0.9;
			if (i > 0 && ',.'.includes(text[i - 1])) dt += base * 3.5;
			if (last && text.slice(i) === 'conception') dt += TERM.lastWord;
			t += dt;
			times.push(t);
		}
		return times;
	};
	const cmd = withCmd ? typed(TERM.cmd, TERM.keyCmd) : [];
	if (withCmd) t += TERM.run;
	const out = LINES.map((text, i) => {
		if (i > 0) t += TERM.gap;
		return typed(text, TERM.keyOut, i === LINES.length - 1);
	});
	const stop = t + TERM.wait;
	return { cmd, out, stop };
}

// Exported for the flows (lab/flow-*.js): the terminal as the run's opening,
// `scale` the type's size (1 is the card's own), drawn with
// draw(ctx, w, h, u, secs, os) for u = secs / 10 over its ten seconds and
// os = secs − 10, ending on the orb's first frame (6 px, centred). `stop` is
// the second the full stop lands, and layout(ctx, w, h) the terminal's
// layout for a board — `fs` the type's size, `step` the line pitch, `cell` a
// character's advance, `out` the lines, `stop` the full stop's spot and
// radius — for a flow that takes the picture over from the stop rather than
// zooming into it (flow-conception: the lines are the rows of its lattice).
// `align: 'center'` types every line centred where it stays (the epicycle
// intro and the flows after it).
export function makeTerminal(scale = 1, { cmd = true, align = 'left' } = {}) {
	const K = keystrokes(cmd);
	const uStop = K.stop / SECONDS;
	// The beats after the typing, in progress u, hung off the last keystroke.
	const B = {
		stop: uStop,
		swell: [uStop + 0.025, uStop + 0.095],
		pan: [uStop + 0.04, 0.86],
		zoom: [uStop + 0.06, 0.93]
	};
	let L = null;
	const layout = (ctx, w, h) => {
		if (!L || L.w !== w || L.h !== h) L = layoutTerminal(ctx, w, h, scale, cmd, align, K);
		return L;
	};
	return {
		stop: K.stop,
		beats: B,
		layout,
		draw(ctx, w, h, u, secs, os) {
			terminal(ctx, layout(ctx, w, h), K, B, w, h, u, secs, os);
		}
	};
}

// A keystroke table's count typed by time t, and when the last one landed.
function typedBy(times, t) {
	let n = 0;
	while (n < times.length && times[n] <= t) n++;
	return n;
}

// `align` 'left' sets the block at the margin; 'center' sets every line centred
// on the board from the first keystroke (the full stop's width counted in the
// last line's), so the card types where it will stay. Centred, on a board too
// narrow for the three lines at a readable size (a phone held upright), the
// sentence is RE-WRAPPED into as many lines as it needs at that size, typed
// with the same keystrokes (L.times, the wrapped lines' times, replaces K.out).
function layoutTerminal(ctx, w, h, scale = 1, withCmd = true, align = 'left', K = null) {
	ctx.save();
	ctx.font = TECH(100);
	const W100 = Math.max(...LINES.map((s) => ctx.measureText(s + '.').width));
	let fs = Math.min(h * 0.036, (0.78 * w * 100) / W100) * scale;
	// Centred and narrow: the size the board's width allows a shorter line.
	const fsWrap = Math.min(h * 0.036, w * 0.042) * scale;
	const wrap = align === 'center' && !withCmd && K && fs < 0.8 * fsWrap;
	let texts = LINES;
	let times = null;
	if (wrap) {
		fs = fsWrap;
		ctx.font = TECH(fs);
		// The sentence's characters and when each is typed; a line break is a
		// space, typed with the character after it.
		const chars = [];
		const at = [];
		LINES.forEach((line, i) => {
			if (i > 0) {
				chars.push(' ');
				at.push(K.out[i][0]);
			}
			for (let j = 0; j < line.length; j++) {
				chars.push(line[j]);
				at.push(K.out[i][j]);
			}
		});
		const all = chars.join('');
		const maxW = 0.88 * w;
		texts = [];
		times = [];
		let start = 0;
		while (start < all.length) {
			let end = all.length;
			const fits = (e) =>
				ctx.measureText(all.slice(start, e) + (e === all.length ? '.' : '')).width <= maxW;
			if (!fits(end)) {
				end = all.lastIndexOf(' ', end - 1);
				while (end > start && !fits(end)) end = all.lastIndexOf(' ', end - 1);
				if (end <= start)
					end = Math.min(all.length, start + Math.max(1, Math.floor(maxW / (0.6 * fs))));
			}
			texts.push(all.slice(start, end));
			times.push(at.slice(start, end));
			start = end;
			while (all[start] === ' ') start++;
		}
	}
	const step = fs * 1.8;
	const x0 = Math.max(40, w * 0.11);
	// The block: the command, a blank, the three lines; a little above the
	// middle, so the stop is below it and the zoom pans up as well as across.
	const rows = withCmd ? 2 : 0;
	const top = withCmd ? h / 2 - step * 1.9 : h / 2 + 0.1 * step - (step * (texts.length - 1)) / 2;
	const cmd = layLine(ctx, withCmd ? TERM.cmd : '', TECH, fs, x0, top, 0, 'left');
	const last = texts.length - 1;
	const out = texts.map((s, i) => {
		if (align !== 'center')
			return layLine(ctx, s, TECH, fs, x0, top + step * (rows + i), 0, 'left');
		const ln = layLine(ctx, i === last ? s + '.' : s, TECH, fs, w / 2, top + step * (rows + i), 0);
		ln.text = s; // the stop is the caret's to make
		return ln;
	});
	// The cell: one character's advance; the caret is a block of it.
	ctx.font = TECH(fs);
	const cell = ctx.measureText('0').width;
	// The full stop: where the glyph's ink would be, in the cell after the
	// last word.
	const m = ctx.measureText('.');
	const l3 = out[out.length - 1];
	const sx = l3.x0 + l3.xs[l3.text.length];
	const stop = {
		x: sx + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
		y: l3.y - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
		r: Math.max(1.6, (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2) * 1.1
	};
	ctx.restore();
	return { w, h, fs, step, cell, cmd, out, stop, times };
}

function terminal(ctx, L, K, B, w, h, u, secs, os) {
	const { stop } = L;
	const t = secs;
	// The lens, as fullstop's: a log zoom into the stop while it pans home.
	const Z = ZOOM * zoomCurve(span(u, B.zoom[0], B.zoom[1]));
	const s = Math.exp(Z);
	const pan = easeInOutCubic(span(u, B.pan[0], B.pan[1]));
	const ox = w / 2 + (stop.x - w / 2) * (1 - pan);
	const oy = h / 2 + (stop.y - h / 2) * (1 - pan);
	const T = ([x, y]) => [ox + s * (x - stop.x), oy + s * (y - stop.y)];

	// The command: the prompt in the site's gold, the rest in chalk.
	const nc = typedBy(K.cmd, t);
	typeLine(ctx, L.cmd, T, s, nc, 1, w, h, (i) => (i < 2 ? PAL.gold : PAL.chalk));
	// The output.
	const outT = L.times ?? K.out;
	const no = outT.map((times) => typedBy(times, t));
	L.out.forEach((ln, i) => typeLine(ctx, ln, T, s, no[i], 0.92, w, h));

	// The caret: a block in the cell after the last thing typed — on the
	// command until it is run, then on the output's lines in turn — steady
	// within a keystroke of the last one, blinking on the clock otherwise.
	// After the last word it waits for the stop, and is it.
	if (u < B.stop) {
		let ln = L.cmd;
		let n = nc;
		let last = nc > 0 ? K.cmd[nc - 1] : -1;
		const runAt = K.cmd.length ? K.cmd[K.cmd.length - 1] + TERM.run * 0.5 : 0;
		if (t >= runAt) {
			let i = 0;
			while (i < L.out.length - 1 && no[i + 1] > 0) i++;
			if (no[0] > 0 || t >= runAt) {
				ln = L.out[i];
				n = no[i];
				last = n > 0 ? outT[i][n - 1] : runAt;
			}
		}
		const steady = t - last < 0.16;
		const on = steady || (t * TERM.blink) % 1 < 0.58;
		if (on) {
			const [X, Y] = T([ln.x0 + ln.xs[n], ln.y]);
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = PAL.chalk;
			ctx.fillRect(X, Y - 0.78 * L.fs * s, L.cell * s, 0.92 * L.fs * s);
			ctx.restore();
		}
	}

	// The full stop: the caret closes to the dot, the dot swells, lights, and
	// is the orb — a point of light that keeps its size as the lens closes in.
	if (u >= B.stop) {
		const [X, Y] = T([stop.x, stop.y]);
		const close = smooth(span(u, B.stop, B.stop + 0.014));
		const sw = smooth(span(u, B.swell[0], B.swell[1]));
		if (close < 1) {
			const bw = lerp(L.cell, stop.r * 2, close) * s;
			const bh = lerp(0.92 * L.fs, stop.r * 2, close) * s;
			const lz = L.out[L.out.length - 1];
			const [cx0, cy0] = T([lz.x0 + lz.xs[lz.text.length], lz.y]);
			const bx = lerp(cx0, X - bw / 2, close);
			const by = lerp(cy0 - 0.78 * L.fs * s, Y - bh / 2, close);
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = PAL.chalk;
			ctx.fillRect(bx, by, bw, bh);
			ctx.restore();
		}
		const rChalk = stop.r * s * lerp(1, 1.5, sw);
		disc(ctx, X, Y, rChalk, {
			fill: PAL.chalk,
			alpha: 0.95 * close * (1 - smooth(span(sw, 0.35, 0.8)))
		});
		const light = smooth(span(sw, 0.1, 0.75));
		const flare = 0.9 * bump(u, B.swell[1] - 0.01, 0.035);
		orb(ctx, X, Y, lerp(stop.r * 1.1, ORB_R, smooth(span(sw, 0.3, 1))), os, {
			alpha: light,
			flare
		});
	}
}
