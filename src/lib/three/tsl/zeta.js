import {
	Fn,
	texture,
	vec2,
	vec3,
	float,
	floor,
	abs,
	min,
	max,
	mix,
	cos,
	smoothstep
} from 'three/tsl';
import { zetaTable } from '$lib/functions/zeta';

// ── The record's grooves, cut with ζ ────────────────────────────────────────
// Every groove in the run is a spiral whose radius wobbles by |ζ(½ + it)|, t
// running along the groove: a polar plot of the critical line, cut as a
// record. The grooves pinch to their base at every zero and swell between
// them, and since the zeros crowd closer as t grows, the grooves get busier
// the further out (or further along) they go. functions/zeta.js has the
// numbers; this is the shader half — one 1-D texture of the table, a lookup,
// and the distance from a point to the nearest groove.
//
// The groove coordinate is `s`: the radius on a flat record, the distance
// along the axis of a cylinder, the slant of a cone — whatever the surface,
// the grooves are lines of constant `s + wobble`, one per `pitch`, with `th`
// the angle round the axis (0..2π, plus whatever turn the record has made).
// Groove n sits at
//
//   s_n(th) = pitch · (n + th/2π) + amp · |ζ(½ + i·rate·(2πn + th))|
//
// which is one continuous spiral (n + th/2π is continuous across th = 2π), t
// growing by 2π·rate every turn. `rate` sets how many zeros a turn crosses.

export const TWO_PI = Math.PI * 2;

// The table, once: |ζ(½ + it)| for t in [0, tMax], clipped at `clip` (the rare
// spike past it would otherwise cost every groove its resolution), as bytes
// in a 1-D texture. Shared by every material that cuts grooves.
let shared = null;
export function zetaTexture(THREE, { tMax = 500, samples = 8192, clip = 4 } = {}) {
	if (shared) return shared;
	const t = zetaTable(tMax, samples);
	const bytes = new Uint8Array(samples);
	for (let i = 0; i < samples; i++) {
		bytes[i] = Math.round(Math.min(t.values[i] / clip, 1) * 255);
	}
	const tex = new THREE.DataTexture(bytes, samples, 1, THREE.RedFormat, THREE.UnsignedByteType);
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.generateMipmaps = false;
	tex.needsUpdate = true;
	shared = { tex, tMax, zMax: clip };
	return shared;
}

// |ζ(½ + it)| as a node: 0 at the zeros, up to `clip`. Past tMax it holds.
export function zetaAbsNode(THREE) {
	const { tex, tMax, zMax } = zetaTexture(THREE);
	return Fn(([t]) => texture(tex, vec2(t.div(tMax).clamp(0.0, 1.0), 0.5)).r.mul(zMax));
}

// The distance, in units of `s`, from (s, th) to the nearest groove. Three
// candidates — the groove the point is nearest by the plain spiral, and its
// neighbours either side — since the wobble can hand a point to the next
// groove over. Keep amp under half the pitch so grooves never cross.
export function grooveDistNode(THREE) {
	const zabs = zetaAbsNode(THREE);
	return Fn(([s, th, pitch, amp, rate]) => {
		const turn = th.div(TWO_PI);
		const n0 = floor(s.div(pitch).sub(turn));
		const at = (n) => {
			const t = n.mul(TWO_PI).add(th).mul(rate);
			return pitch.mul(n.add(turn)).add(amp.mul(zabs(t)));
		};
		const d0 = abs(s.sub(at(n0)));
		const d1 = abs(s.sub(at(n0.add(1.0))));
		const d2 = abs(s.sub(at(n0.sub(1.0))));
		return min(d0, min(d1, d2));
	});
}

// ── The critical line from the primes, in colour ────────────────────────────
// The record at the tunnel's end, and the tunnel's wall that runs into it,
// carry the critical line as the primes write it: log ζ(s) = Σ_p p^(−s) + …,
// so along the line the signal is a sum of waves, one per prime p, of
// frequency log p in t and amplitude p^(−σ) —
//
//   F(t) = Σ_p cos(t · log p) / p^σ          (σ = 1: 1/p)
//
// — with t running along the groove, so a turn of the record is a stretch of
// the line. The grooves themselves are STRAIGHT — a plain spiral, one turn a
// pitch — and the line's height is their COLOUR (waveRamp): a groove that
// wobbled by it read, down the funnel's axis, as a circle, and one that
// wobbled enough to read crossed its neighbours. The sum only lines up at
// t = 0; everywhere else it wanders well inside Σ p^(−σ), so it is scaled by
// `reach` of that (0.75 for 1/p: past t = 20 its peaks stay under 0.74 of the
// total) and clipped to [−1, 1]. Summed in the shader, a cosine a prime: one
// sum a pixel, at the groove it is nearest, and no table to outgrow a GPU's
// texture limit (past it a texture uploads nothing, with only a warning).
const PRIMES = (() => {
	const out = [];
	for (let n = 2; out.length < 200; n++) {
		if (out.every((p) => n % p !== 0)) out.push(n);
	}
	return out;
})();

export function primeWave({ primes = 24, sigma = 1, reach = 0.75 } = {}) {
	const P = PRIMES.slice(0, primes);
	const amps = P.map((p) => Math.pow(p, -sigma));
	const scale = amps.reduce((a, b) => a + b, 0) * reach;
	return Fn(([t]) => {
		let f = float(0);
		P.forEach((p, k) => {
			f = f.add(cos(t.mul(Math.log(p))).mul(amps[k] / scale));
		});
		return f.clamp(-1.0, 1.0);
	});
}

// The nearest turn of a plain spiral groove to (s, th) — groove n at
// s = pitch · (n + th/2π), th as atan gives it — as vec2(distance, n). The
// point on the line that turn carries there is t = rate · (2πn + th).
export const spiralGroove = Fn(([s, th, pitch]) => {
	const turn = th.div(TWO_PI);
	const n = floor(s.div(pitch).sub(turn).add(0.5));
	return vec2(abs(s.sub(pitch.mul(n.add(turn)))), n);
});

// The line's height as colour: a ramp through `stops` (hex, low to high), F =
// −1 at the first and 1 at the last, straight between them.
export function waveRamp(THREE, stops) {
	const cs = stops.map((h) => new THREE.Color(h));
	return Fn(([f]) => {
		const x = f
			.mul(0.5)
			.add(0.5)
			.mul(cs.length - 1);
		let col = vec3(cs[0].r, cs[0].g, cs[0].b);
		for (let k = 1; k < cs.length; k++) {
			col = mix(col, vec3(cs[k].r, cs[k].g, cs[k].b), x.sub(k - 1).clamp(0.0, 1.0));
		}
		return col;
	});
}

// A stroke of `w` (in the units of `d`), floored at one screen pixel by `px`
// (the fwidth of the coordinate), its light scaled down by the same ratio so
// a groove that recedes gets fainter rather than sparkling. The record on the
// way home draws its grooves with this.
export const hair = Fn(([d, w, px]) => {
	const e = max(w, px);
	return smoothstep(0.0, e, d)
		.oneMinus()
		.mul(min(w.div(e), 1.0));
});
