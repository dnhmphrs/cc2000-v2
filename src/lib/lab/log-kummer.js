import { getBoard, clearBoard, clock, variant, tag } from './log/board.js';
import { impact } from './log/ink.js';
import { NEAR } from './log/space.js';
import { makeStructure, geometry, cameraAt, paramsAt, DEMO_TAU, STAGE } from './log/kummer.js';

// ── Sketch: log-kummer — the structure beat of flow-kummer, on its own ───────
// The whole structure, turned through by one clock (log/kummer.js): the
// lattice Λ(τ) written out from the origin across the board at the
// terminal's own pitch, the fundamental cell drawn round the origin with its
// gluing marks; the cell ROLLS into a tube (a = 0 onto a = 1) as the lens
// lifts off the board and comes round; the tube BENDS into the torus,
// shedding the shear by Re τ as it goes so that z + τ lands on z; the torus
// seen side on with its skewer across the frame; the HALF-TURN — the torus
// turned by π about the skewer, which is z ↦ −z, the four half-points lit
// gold as the only points it leaves where they are, six sample points
// riding it with a chord each to the place its mirror rests, shrinking to
// nothing; then, one per ?v=:
//
//   pillow   (default) the quotient: the half above the skewer's plane swung
//            down onto the half below, then the rims pinched onto the skewer
//            — the pillowcase, a sphere with the four cone points at the
//            ends of its seams, the origin's at the tip. The lens comes on
//            to the tip's line, the node grows a CONE — chalk generatrices
//            and rings spaced in log of the distance, so the tunnel never
//            runs out — and the lens flies in, the rings passing, the light
//            at the apex growing: THE FLASH on the last beat (ink.js impact).
//   quartic  the same to the turn; then the torus gives way to Kummer's
//            QUARTIC, one dimension up — the abelian surface's quotient by
//            −1, its sixteen nodes lit (log-abelian's surface, lifted) — and
//            the lens dives into the node furthest along the skewer.
//
// Twenty seconds, a pure function of progress (?at= pins any frame); τ is the
// demo's, from a spice of 7 (Re τ = ⅙, Im τ = 1). What is exact and what is a
// picture: the header of log/kummer.js.

const SECONDS = 20;

export default async function make({ at }) {
	const v = variant(['pillow', 'quartic']);
	const b = getBoard();
	const time = clock(SECONDS, at);
	const S = makeStructure({ tau: DEMO_TAU, variant: v });
	const cost = { ms: 0, n: 0, max: 0 };
	let G = null;

	function render() {
		const t0 = performance.now();
		clearBoard(b);
		const { ctx, w, h } = b;
		if (!G || G.w !== w || G.h !== h) G = geometry(DEMO_TAU, { w, h, variant: v, quartic: S.Q });
		const u = time.u;
		const P = paramsAt(u, v);
		const cam = cameraAt(u, G);
		S.draw(ctx, w, h, { ...P, cam, G });
		// The flash: the lens through the node, at the end of the dive.
		const hit = STAGE.dive[1] - 0.012;
		if (u > hit - 0.01) {
			const q = cam.project(G.N);
			const [x, y] = q[2] > NEAR ? q : [w / 2, h / 2];
			impact(ctx, w, h, x, y, 0.42 * Math.min(w, h), u, hit, 1, true);
		}
		tag(ctx, w, h, `log-kummer · ${v}`);
		const ms = performance.now() - t0;
		cost.n++;
		cost.ms += (ms - cost.ms) * 0.1;
		if (ms > cost.max) cost.max = ms;
	}

	return {
		info: { seconds: SECONDS, variant: v, cost, stage: STAGE },
		seek: (x) => time.seek(x),
		update: (dt) => time.step(dt),
		render,
		resize() {
			G = null;
		}
	};
}
