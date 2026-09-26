import { Fn, texture, vec2, floor, abs, min, max, smoothstep } from 'three/tsl';
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

// ── The critical line from the primes ───────────────────────────────────────
// The record at the tunnel's end cuts its grooves with the critical line as
// the primes write it: log ζ(s) = Σ_p p^(−s) + …, so along the line the
// signal is a sum of waves, one per prime p, of frequency log p in t and
// amplitude p^(−σ) —
//
//   F(t) = Σ_p cos(t · log p) / p^σ          (σ = 1 by default: 1/p)
//
// — a polar view of the 1-D line when it is wound round the record, t
// running along the groove. The sum only lines up at t = 0; everywhere else
// it wanders well inside Σ p^(−σ), so it is scaled by `reach` of that (0.75
// for 1/p: past t = 20 its peaks stay under 0.74 of the total) and clipped,
// which puts F in [−1, 1] with its swings using most of it.
//
// Baked once, as the GROOVE sees it: one row a turn of the spiral, `cols`
// samples round it, row n running t = rate · (2πn + θ) for θ from −π to π,
// so each row ends where the next begins. A turn is 1024 samples however
// far out it is — a 1-D table of t long enough for the whole funnel gave a
// turn out at the frame's edge forty, and the grooves came out faceted —
// and the texture is small and square-ish: past a GPU's limit on a side
// (8192 on the sandbox's, 4096 on some phones) a texture does not fail
// loudly, it uploads nothing and every groove comes out a plain circle.
// Rows start `first` turns below the hole's, for the candidates below it.
const PRIMES = (() => {
	const out = [];
	for (let n = 2; out.length < 200; n++) {
		if (out.every((p) => n % p !== 0)) out.push(n);
	}
	return out;
})();

export function primeGrooveTexture(
	THREE,
	{ rate = 3, rows = 128, first = 0, cols = 1024, primes = 24, sigma = 1, reach = 0.75 } = {}
) {
	const P = PRIMES.slice(0, primes);
	const logs = P.map((p) => Math.log(p));
	const amps = P.map((p) => Math.pow(p, -sigma));
	const scale = amps.reduce((a, b) => a + b, 0) * reach;
	const bytes = new Uint8Array(cols * rows);
	for (let r = 0; r < rows; r++) {
		for (let j = 0; j < cols; j++) {
			const th = -Math.PI + (2 * Math.PI * j) / (cols - 1);
			const t = rate * (2 * Math.PI * (r + first) + th);
			let f = 0;
			for (let k = 0; k < P.length; k++) f += amps[k] * Math.cos(t * logs[k]);
			bytes[r * cols + j] = Math.round((Math.max(-1, Math.min(1, f / scale)) * 0.5 + 0.5) * 255);
		}
	}
	const tex = new THREE.DataTexture(bytes, cols, rows, THREE.RedFormat, THREE.UnsignedByteType);
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = THREE.ClampToEdgeWrapping;
	tex.wrapT = THREE.ClampToEdgeWrapping;
	tex.generateMipmaps = false;
	tex.needsUpdate = true;
	return tex;
}

// The distance from (s, th) to the nearest groove of the spiral that wobbles
// by F: groove n at pitch · (n + th/2π) + amp · F(rate · (2πn + th)), th in
// [−π, π] as atan gives it. The wobble is let reach PAST the pitch — seen
// down a funnel's axis a swing that keeps clear of the next groove is a few
// hundredths of the ring's radius, which reads as a circle — so neighbouring
// turns cross, and every groove whose swing can reach the point is a
// candidate: `span` of them either side, ceil((amp + stroke) / pitch).
// `turns` is how many the table holds from the hole's; past them the last
// row holds. The texture is returned too, to be disposed with the material.
export function primeGrooveDistNode(THREE, { span = 1, turns = 128, cols = 1024, ...opts } = {}) {
	const rows = turns + 2 * span;
	const tex = primeGrooveTexture(THREE, { ...opts, rows, first: -span, cols });
	const F = Fn(([n, turn]) => {
		const u = turn
			.add(0.5)
			.mul((cols - 1) / cols)
			.add(0.5 / cols);
		const v = n.add(span + 0.5).div(rows);
		return texture(tex, vec2(u, v)).r.mul(2.0).sub(1.0);
	});
	const dist = Fn(([s, th, pitch, amp]) => {
		const turn = th.div(TWO_PI);
		const n0 = floor(s.div(pitch).sub(turn));
		const at = (n) => pitch.mul(n.add(turn)).add(amp.mul(F(n, turn)));
		let d = abs(s.sub(at(n0)));
		for (let k = 1; k <= span; k++) {
			d = min(d, min(abs(s.sub(at(n0.add(k)))), abs(s.sub(at(n0.sub(k))))));
		}
		return d;
	});
	return { dist, tex };
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
