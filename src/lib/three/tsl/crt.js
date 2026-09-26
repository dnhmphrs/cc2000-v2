import {
	Fn,
	pass,
	uniform,
	uv,
	vec2,
	vec3,
	vec4,
	float,
	floor,
	fract,
	abs,
	dot,
	sin,
	exp,
	step,
	max,
	mix,
	smoothstep,
	hash
} from 'three/tsl';
import { CRT } from '$lib/config';
import { runClock, crtGain } from './clock';

// ── The signal ───────────────────────────────────────────────────────────────
// The run is watched on a screen — the raster and the tube are CSS over the
// page (components/Glass.svelte) — but what a screen shows is a SIGNAL, and
// a composite signal down a cable faults in its own ways, none of which a
// sheet over the picture can do: the colours come apart sideways, bright
// things trail off to the right, lines slip, a band tears across, and the
// black is never quite still. This is that, as one full-screen pass over the
// 3D (RenderPipeline, a pass of whichever scene is running), in TSL:
//
//   split     the chroma off the luma: red and blue sampled either side of
//             green, more toward the edges of the frame (in device pixels)
//   bleed     bright things smear to the RIGHT — taps to the left of the
//             pixel added in with a falling weight, gated to what is bright,
//             so the black stays black and the white block trails
//   ghost     a faint second picture off to the right: the signal arriving
//             twice, the second time late
//   jitter    every line slipped sideways by its own hair, re-rolled a few
//             dozen times a second
//   tear      a band that slips further, sweeping through the frame
//   wobble    a slow sideways wave down the frame, the hold not quite holding
//   roll      the vertical hold gone: the picture rolling up the frame
//   hum       a dark bar drifting up the frame, the mains in the picture
//   noise     grain on everything, re-rolled with the jitter
//   sat       the colour, from none to too much
//
// On the RUN'S CLOCK (tsl/clock.js runClock), not real time: the slips and
// the grain are a function of the run's second, so a ?at= pin is exact, the
// seam frames stay identical either side, and a contact sheet of one beat is
// the same picture on every load. Every amount is a UNIFORM (SIGNAL), set
// from CRT in config/space.js and turned live by the panel in the top right
// corner (components/SignalPanel.svelte); crtGain scales them all (the
// breakdown turns it up). ?crt=0 renders the scenes straight to the canvas
// instead.
//
// The pass's render target carries a STENCIL: the nest's chain and the set's
// glass are stencil tests, and a target without one draws every room
// everywhere.

// ── The dials ────────────────────────────────────────────────────────────────
// Every fault, as [key, label, default, min, max, step]: the defaults are the
// CRT block's, the ranges wide enough to wreck the picture. The keys ARE the
// CRT block's, so what the panel copies out pastes straight back into it.
// TAPS is how many bleed taps the shader is built with; `bleedTaps` is how
// many of them are on.
export const TAPS = 10;
const C = CRT;
export const DIALS = [
	['level', 'level', C.level, 0, 8, 0.05],
	['split', 'chroma split', C.split, 0, 40, 0.1],
	['splitEdge', 'split at edges', C.splitEdge, 0, 24, 0.1],
	['bleed', 'bleed', C.bleed, 0, 6, 0.05],
	['bleedTaps', 'bleed reach', C.bleedTaps, 0, TAPS, 1],
	['bleedStep', 'bleed step', C.bleedStep, 0.5, 24, 0.5],
	['bleedTau', 'bleed falloff', C.bleedTau, 0.2, 12, 0.1],
	['bleedFloor', 'bleed floor', C.bleedFloor, 0, 1, 0.01],
	['ghost', 'ghost', C.ghost, 0, 1.5, 0.01],
	['ghostOffset', 'ghost offset', C.ghostOffset, 0, 240, 1],
	['jitter', 'line jitter', C.jitter, 0, 30, 0.1],
	['jitterRate', 'reroll rate', C.jitterRate, 0, 120, 1],
	['tear', 'tear', C.tear, 0, 160, 1],
	['tearWidth', 'tear width', C.tearWidth, 0, 0.5, 0.002],
	['tearRate', 'tear rate', C.tearRate, 0, 6, 0.01],
	['wobble', 'wobble', C.wobble, 0, 40, 0.1],
	['wobbleWaves', 'wobble waves', C.wobbleWaves, 0, 40, 0.1],
	['wobbleRate', 'wobble rate', C.wobbleRate, 0, 20, 0.1],
	['roll', 'vertical hold', C.roll, 0, 1, 0.01],
	['rollRate', 'hold speed', C.rollRate, 0, 4, 0.01],
	['hum', 'hum bar', C.hum, 0, 1, 0.01],
	['humRate', 'hum drift', C.humRate, 0, 4, 0.01],
	['noise', 'grain', C.noise, 0, 1.5, 0.005],
	['sat', 'saturation', C.sat, 0, 3, 0.01]
];
export const SIGNAL = Object.fromEntries(DIALS.map(([k, , v]) => [k, uniform(v)]));
export function resetSignal() {
	for (const [k, , v] of DIALS) SIGNAL[k].value = v;
}
// ?crt=2 turns the whole signal up to twice the config, for one load (any
// number; 0 is handled by the Stage, which then draws straight to the canvas).
{
	const q = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
	const mode = q?.get('crt') ?? '';
	if (mode !== '' && Number.isFinite(Number(mode))) SIGNAL.level.value = Number(mode);
}

export function createCrt({ THREE, renderer, scene, camera }) {
	const S = SIGNAL;
	// ?crt=raw draws the bare pass, no signal; ?samples=N overrides the MSAA.
	const q = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
	const mode = q?.get('crt') ?? '';
	const samples = q?.has('samples') ? Number(q.get('samples')) : C.samples;
	const uRes = uniform(new THREE.Vector2(1280, 800));
	// The target's depth texture must carry the STENCIL bits itself: the pass
	// makes a plain depth texture whatever `stencilBuffer` says, and on WebGL
	// 2 the multisample resolve then blits into a framebuffer whose stencil
	// attachment has no stencil bits, fails, and leaves the picture flat.
	const depthTexture = new THREE.DepthTexture(1, 1);
	depthTexture.format = THREE.DepthStencilFormat;
	depthTexture.type = THREE.UnsignedInt248Type;
	const scenePass = pass(scene, camera, { stencilBuffer: true, samples, depthTexture });
	const tex = scenePass.getTextureNode();

	const LUMA = vec3(0.2126, 0.7152, 0.0722);
	const colorNode = Fn(() => {
		const p0 = uv();
		const px = vec2(1.0, 1.0).div(uRes);
		const g = crtGain.mul(S.level);
		const t = runClock;
		// The vertical hold: the picture rolling up the frame, and wrapping.
		const p = vec2(p0.x, fract(p0.y.add(fract(t.mul(S.rollRate)).mul(S.roll))));
		// The reroll: the slips and the grain change this many times a second.
		const tick = floor(t.mul(S.jitterRate));
		const row = floor(p.y.mul(uRes.y));

		// Every line slipped by its own hair.
		const jitter = hash(row.add(tick.mul(7919.0)))
			.sub(0.5)
			.mul(2.0)
			.mul(S.jitter);
		// The tear: a band of lines slipped further, sweeping through.
		const yTear = fract(t.mul(S.tearRate)).mul(1.6).sub(0.3);
		const inBand = smoothstep(S.tearWidth, 0.0, abs(p.y.sub(yTear)));
		const tear = inBand.mul(
			hash(floor(row.div(3.0)).add(tick.mul(131.0)))
				.sub(0.5)
				.mul(2.0)
				.mul(S.tear)
		);
		// The hold, not quite holding: a slow wave down the frame.
		const wobble = sin(p.y.mul(S.wobbleWaves).add(t.mul(S.wobbleRate))).mul(S.wobble);
		const x = p.x.add(jitter.add(tear).add(wobble).mul(g).mul(px.x));

		// The chroma off the luma, more toward the edges.
		const c = p.sub(0.5);
		const d = px.x.mul(S.split).mul(dot(c, c).mul(S.splitEdge).add(1.0)).mul(g);
		const r = tex.sample(vec2(x.add(d), p.y)).r;
		const gr = tex.sample(vec2(x, p.y)).g;
		const b = tex.sample(vec2(x.sub(d), p.y)).b;
		let col = vec3(r, gr, b);

		// Bright things trail to the right: taps to the left, falling off,
		// the weights worked out here so the reach and the falloff are live.
		const weights = [];
		let norm = float(0.0);
		for (let k = 1; k <= TAPS; k++) {
			const w = exp(float(-k).div(S.bleedTau)).mul(step(float(k), S.bleedTaps));
			weights.push(w);
			norm = norm.add(w);
		}
		norm = max(norm, 1e-6);
		for (let k = 1; k <= TAPS; k++) {
			const tap = tex.sample(vec2(x.sub(px.x.mul(S.bleedStep).mul(k)), p.y)).rgb;
			const lum = dot(tap, LUMA);
			const gate = smoothstep(S.bleedFloor, 1.0, lum);
			col = col.add(
				tap
					.mul(gate)
					.mul(S.bleed.mul(weights[k - 1]).div(norm))
					.mul(g)
			);
		}

		// The ghost: the picture again, off to the right, faint.
		const ghost = tex.sample(vec2(x.sub(px.x.mul(S.ghostOffset)), p.y)).rgb;
		col = col.add(ghost.mul(S.ghost).mul(g));

		// The hum bar: a soft dark band drifting up the frame, and wrapping.
		const yHum = fract(t.mul(S.humRate));
		const off = abs(fract(p.y.sub(yHum).add(0.5)).sub(0.5));
		const hum = smoothstep(0.16, 0.02, off).mul(S.hum).mul(g);
		col = col.mul(max(hum.oneMinus(), 0.0));

		// The colour.
		col = mix(vec3(dot(col, LUMA)), col, S.sat);

		// The grain.
		const n = hash(p.x.mul(uRes.x).add(p.y.mul(uRes.y).mul(1.7)).add(tick.mul(101.0)))
			.sub(0.5)
			.mul(S.noise)
			.mul(g);
		col = col.add(n);
		return vec4(col, 1.0);
	})();

	const post = new THREE.RenderPipeline(renderer);
	post.outputNode = mode === 'raw' ? scenePass : colorNode;

	return {
		scenePass,
		post,
		use(s, cam) {
			scenePass.scene = s;
			scenePass.camera = cam;
		},
		render() {
			post.render();
		},
		resize() {
			uRes.value.set(renderer.domElement.width, renderer.domElement.height);
		},
		dispose() {
			scenePass.dispose?.();
			post.dispose?.();
		}
	};
}
