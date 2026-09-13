import * as THREE from 'three/webgpu';
import {
	Fn,
	uniform,
	float,
	vec2,
	vec3,
	vec4,
	mix,
	smoothstep,
	clamp,
	max,
	min,
	abs,
	exp,
	sin,
	atan,
	dot,
	fract,
	length,
	step,
	screenUV
} from 'three/tsl';
import { VERTICES } from '../geometry/icosahedron';

// ── The backdrops, in TSL ────────────────────────────────────────────────────
// three/shaders/{deep,grid,flat,white}.js as nodes for `scene.backgroundNode`,
// so the WebGPU renderer paints the field itself and the site's second canvas
// (components/Background.svelte) goes. Same uniforms, same names, same units
// — read three/shaders/index.js for what each one means.
//
// theta.js is not here: it was kept unused, and a 125-iteration tan() per
// fragment is not a thing to port on a promise.

export function backdropUniforms() {
	return {
		color1: uniform(new THREE.Color(0x0a0a0c)),
		color2: uniform(new THREE.Color(1.0, 0.82, 0.36)),
		color3: uniform(new THREE.Color(1.0, 0.71, 0.29)),
		mouse: uniform(new THREE.Vector2(0.15, 0.15)),
		aspectRatio: uniform(1),
		uTime: uniform(0),
		uRot: uniform(new THREE.Matrix3()),
		uFade: uniform(1),
		uPx: uniform(1 / 800),
		uRays: uniform(new THREE.Vector3(0, 0, 0.15))
	};
}

// vUv, 0..1 across the viewport with y UP, as the fragment shaders had it
// from their clip-space triangle. screenUV runs the other way.
const vUv = vec2(screenUV.x, screenUV.y.oneMinus());

const rule = Fn(([x, w]) => {
	const f = fract(x);
	const d = min(f, f.oneMinus());
	return smoothstep(0.0, w, d).oneMinus();
});

// ── deep ─────────────────────────────────────────────────────────────────────
export const deep = (u) =>
	Fn(() => {
		const uv = vUv.sub(0.5).mul(vec2(u.aspectRatio, 1)).toVar();
		const r = length(uv);

		const lit = dot(u.color1, vec3(0.2126, 0.7152, 0.0722));
		const shaped = smoothstep(0.34, 0.9, lit).oneMinus().mul(u.uFade);

		const far = u.color1.mul(0.13);
		const halo = exp(r.mul(r).mul(-2.4));
		const core = exp(r.mul(r).mul(-13.0));

		const air = mix(far, u.color1, halo).toVar();
		air.addAssign(u.color1.mul(core).mul(0.5));

		const a = atan(uv.y, uv.x);
		const b1 = sin(a.mul(3.0).add(u.uTime.mul(0.13)))
			.mul(0.5)
			.add(0.5);
		const b2 = sin(a.mul(7.0).sub(u.uTime.mul(0.09)).add(r.mul(5.0)))
			.mul(0.5)
			.add(0.5);
		air.addAssign(u.color1.mul(b1).mul(b2).mul(halo).mul(0.16));

		return vec4(mix(u.color1, air, shaped), 1.0);
	})();

// ── grid ─────────────────────────────────────────────────────────────────────
// The twelve half-axes, from geometry/icosahedron.js — the object's own.
const SPOKES = VERTICES.map((v) => {
	const n = Math.hypot(...v);
	return vec3(v[0] / n, v[1] / n, v[2] / n);
});

export const grid = (u) => {
	// A stroke of w frame heights, floored at one canvas pixel.
	const hair = Fn(([d, w]) => {
		const e = max(w, u.uPx);
		return smoothstep(0.0, e, d)
			.oneMinus()
			.mul(min(w.div(e), 1.0));
	});

	// One half-axis, from just outside the solid's rim out to its reach.
	const axisRay = Fn(([aLocal, uv, r0, r1]) => {
		const d = u.uRot.mul(aLocal);
		const f = length(d.xy);
		const n = d.xy.div(max(f, 1e-4));
		const s = dot(uv, n);
		const o = abs(uv.x.mul(n.y).sub(uv.y.mul(n.x)));

		const a = hair(o, u.uPx).toVar();
		a.mulAssign(smoothstep(r0, r0.add(0.06), s));
		a.mulAssign(smoothstep(r1, r1.add(0.25), s).oneMinus());
		const depth = clamp(d.z.mul(s).mul(1.6), -1.0, 1.0);
		return a.mul(mix(0.34, 1.0, depth.mul(0.5).add(0.5))).mul(smoothstep(0.0, 0.22, f));
	});

	return Fn(() => {
		const uv = vUv.sub(0.5).mul(vec2(u.aspectRatio, 1)).toVar();
		const r = length(uv);

		// ── The ruling ───────────────────────────────────────────────────
		const CELLS = 19.0;
		const FINE = 0.017;
		const g = uv.mul(CELLS);
		const fine = max(rule(g.x, FINE), rule(g.y, FINE));
		const coarse = max(rule(g.x.mul(0.125), FINE * 0.125), rule(g.y.mul(0.125), FINE * 0.125));

		// Corner registration brackets.
		const M = 0.028;
		const L = 0.075;
		const TICK = 0.0011;
		const ex = u.aspectRatio.mul(0.5).sub(abs(uv.x));
		const ey = float(0.5).sub(abs(uv.y));
		const vSeg = smoothstep(0.0, TICK, abs(ex.sub(M)))
			.oneMinus()
			.mul(step(M, ey))
			.mul(step(ey, M + L));
		const hSeg = smoothstep(0.0, TICK, abs(ey.sub(M)))
			.oneMinus()
			.mul(step(M, ex))
			.mul(step(ex, M + L));
		const ticks = max(vSeg, hSeg);

		// ── The solid's own axes ─────────────────────────────────────────
		const r0 = u.uRays.z;
		const r1 = mix(r0.add(0.04), 1.35, u.uRays.y);
		const rays = float(0).toVar();
		for (const s of SPOKES) rays.addAssign(axisRay(s, uv, r0, r1));
		rays.assign(min(rays.mul(u.uRays.x), 1.0));

		// ── Composite ────────────────────────────────────────────────────
		const pool = exp(r.mul(r).mul(-1.15));
		const reach = mix(0.22, 1.0, pool);
		const burn = clamp(u.mouse.x.mul(1.4), 0.0, 1.0);

		const col = vec3(u.color1).toVar();
		col.addAssign(u.color2.mul(fine).mul(burn.mul(0.03).add(0.03)).mul(reach).mul(u.uFade));
		col.addAssign(u.color2.mul(coarse).mul(burn.mul(0.05).add(0.075)).mul(reach).mul(u.uFade));
		col.addAssign(u.color3.mul(rays).mul(burn.mul(0.09).add(0.16)).mul(reach).mul(u.uFade));
		col.addAssign(u.color2.mul(ticks).mul(0.24).mul(u.uFade));
		col.addAssign(u.color2.mul(pool).mul(0.016).mul(u.uFade));

		return vec4(col, 1.0);
	})();
};

// ── flat, white ──────────────────────────────────────────────────────────────
export const flat = (u) => vec4(u.color1, 1.0);
export const white = () => vec4(1.0, 1.0, 1.0, 1.0);

export const BACKDROPS = { deep, grid, flat, white };
