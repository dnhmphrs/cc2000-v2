// ── i5 · THE RECORD on the room's screen ─────────────────────────────────────
// Variant I5's ending. The last room's monitor is not a band of light but a
// RECORD, turning: the disc black and filling the glass, its grooves
// concentric circles drawn by hand (a few of them, the hand's wobble on
// each), a sheen turning with it, the label at the middle in the site's
// gold with the song lettered round it — the title and the artist on the
// label's face, turning with the record — and the spindle hole dark in it;
// the tone arm from the glass's top right corner, parked, swung in over the
// grooves (`arm`) and SET DOWN (`drop`): the needle drop is the flash.
//
//   drawRecord(ctx, box, o)   box the glass's rect on the board [x0,y0,x1,y1];
//                             o: { turn (radians), alpha, arm 0…1, drop 0…1,
//                             title, artist, bo (the boil's drawing), lit }
import { TAU, PAL, TECH_FONT, lerp, smooth, span } from './board.js';
import { noise1 } from './sketch-hand.js';

export const RECORD = {
	label: 0.34, // the label's radius, of the record's
	hole: 0.035, // the spindle hole's
	grooves: 13, // the grooves drawn (the rest are the dark)
	rpm: 33.3 // (the turn is the sketch's; this is what the label says)
};

export function drawRecord(ctx, box, o) {
	const { turn = 0, alpha = 1, arm = 0, drop = 0, title = '', artist = '', bo = 0, lit = 0 } = o;
	if (alpha <= 0.005) return;
	const [x0, y0, x1, y1] = box;
	const gw = x1 - x0;
	const gh = y1 - y0;
	if (gw < 6 || gh < 6) return;
	const cx = (x0 + x1) / 2;
	const cy = (y0 + y1) / 2;
	const r = 0.49 * gh;
	ctx.save();
	ctx.beginPath();
	ctx.rect(x0, y0, gw, gh);
	ctx.clip();
	ctx.globalAlpha = alpha;
	// the screen's own dark (the tube on, nothing on it but the record)
	ctx.fillStyle = `rgb(${14 + 30 * lit}, ${13 + 26 * lit}, ${12 + 20 * lit})`;
	ctx.fillRect(x0, y0, gw, gh);
	// the disc
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, TAU);
	ctx.fillStyle = '#0b0a0a';
	ctx.fill();
	// the sheen: two soft wedges opposite each other, turning with it
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(0.35 * turn);
	for (const s of [0, Math.PI]) {
		const g = ctx.createConicGradient(s - 0.5, 0, 0);
		g.addColorStop(0, 'rgba(236, 230, 218, 0)');
		g.addColorStop(0.07, `rgba(236, 230, 218, ${0.1 + 0.08 * lit})`);
		g.addColorStop(0.16, 'rgba(236, 230, 218, 0)');
		g.addColorStop(1, 'rgba(236, 230, 218, 0)');
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(0, 0, r, 0, TAU);
		ctx.fill();
	}
	ctx.restore();
	// the grooves: a few circles, each the hand's, between the rim and the label
	const rl = RECORD.label * r;
	ctx.lineWidth = Math.max(0.7, 0.004 * gh);
	for (let i = 0; i < RECORD.grooves; i++) {
		const u = (i + 0.5) / RECORD.grooves;
		const rr = lerp(0.97 * r, 1.06 * rl, u);
		ctx.beginPath();
		const n = 48;
		for (let j = 0; j <= n; j++) {
			const ph = (TAU * j) / n + 0.2 * turn;
			const k = 1 + 0.006 * noise1(j * 0.4 + i * 3.3, bo * 7 + i);
			const px = cx + rr * k * Math.cos(ph);
			const py = cy + rr * k * Math.sin(ph);
			if (j) ctx.lineTo(px, py);
			else ctx.moveTo(px, py);
		}
		ctx.strokeStyle = `rgba(236, 230, 218, ${0.1 + 0.1 * (i % 3 === 0 ? 1 : 0) + 0.08 * lit})`;
		ctx.stroke();
	}
	// the label, turning: the song round its face
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(turn);
	ctx.beginPath();
	ctx.arc(0, 0, rl, 0, TAU);
	ctx.fillStyle = PAL.gold;
	ctx.fill();
	ctx.strokeStyle = 'rgba(21, 21, 21, 0.5)';
	ctx.lineWidth = Math.max(0.6, 0.003 * gh);
	ctx.stroke();
	// the ring of the label: a thin line, as a printed label has
	ctx.beginPath();
	ctx.arc(0, 0, 0.9 * rl, 0, TAU);
	ctx.stroke();
	ctx.fillStyle = '#1d1612';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const fit = (s, max, px) => {
		ctx.font = `400 ${px}px ${TECH_FONT}`;
		let w = ctx.measureText(s).width;
		while (w > max && px > 5) {
			px *= 0.92;
			ctx.font = `400 ${px}px ${TECH_FONT}`;
			w = ctx.measureText(s).width;
		}
		return px;
	};
	if (title) {
		const px = fit(title, 1.5 * rl, 0.2 * rl);
		ctx.fillText(title, 0, -0.42 * rl);
		void px;
	}
	if (artist) {
		fit(artist, 1.4 * rl, 0.15 * rl);
		ctx.fillText(artist, 0, 0.4 * rl);
	}
	fit(`${RECORD.rpm} RPM`, 1.2 * rl, 0.1 * rl);
	ctx.fillStyle = 'rgba(29, 22, 18, 0.7)';
	ctx.fillText(`${RECORD.rpm} RPM`, 0, 0.66 * rl);
	// the spindle hole
	ctx.beginPath();
	ctx.arc(0, 0, RECORD.hole * r, 0, TAU);
	ctx.fillStyle = '#0b0a0a';
	ctx.fill();
	ctx.restore();
	// the tone arm: pivot at the top right, parked beside the record, swung in
	// over the grooves and set down
	const px = x1 - 0.08 * gw;
	const py = y0 + 0.1 * gh;
	const L = Math.hypot(px - cx, py - cy) + 0.02 * r;
	const park = Math.atan2(y1 + 0.3 * gh - py, x1 - 0.02 * gw - px);
	const onto = Math.atan2(cy + 0.93 * r * Math.sin(2.3) - py, cx + 0.93 * r * Math.cos(2.3) - px);
	const ang = lerp(park, onto, smooth(arm));
	const lift = (1 - smooth(drop)) * 0.03 * gh;
	const ex = px + L * Math.cos(ang);
	const ey = py + L * Math.sin(ang) - lift;
	ctx.strokeStyle = PAL.chalk;
	ctx.lineCap = 'round';
	ctx.lineWidth = Math.max(1, 0.012 * gh);
	ctx.beginPath();
	ctx.moveTo(px, py);
	ctx.lineTo(lerp(px, ex, 0.82), lerp(py, ey, 0.82));
	ctx.stroke();
	ctx.lineWidth = Math.max(1.4, 0.022 * gh);
	ctx.beginPath();
	ctx.moveTo(lerp(px, ex, 0.8), lerp(py, ey, 0.8));
	ctx.lineTo(ex, ey);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(px, py, Math.max(2, 0.035 * gh), 0, TAU);
	ctx.fillStyle = PAL.chalk;
	ctx.fill();
	// the needle's spark as it lands
	const sp = span(drop, 0.85, 1) * (1 - span(drop, 1, 1.0001));
	if (sp > 0) {
		ctx.beginPath();
		ctx.arc(ex, ey, 0.03 * gh * sp, 0, TAU);
		ctx.fillStyle = '#fffaf0';
		ctx.fill();
	}
	ctx.restore();
}
