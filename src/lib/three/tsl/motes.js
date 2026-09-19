import * as THREE from 'three/webgpu';
import {
	Fn,
	uniform,
	attribute,
	vec3,
	vec4,
	mod,
	smoothstep,
	exp,
	positionLocal,
	positionView,
	vertexStage
} from 'three/tsl';
import { ADD } from './materials';
import { HOLO } from '$lib/config';
import { rand } from '$lib/random';

// ── The motes, on the WebGPU renderer ────────────────────────────────────────
// world/tunnel.js createMotes(), ported line for line. One LineSegments, one
// draw call: each mote is a short segment lying along the flight axis, so it is
// a DOT when it is far off and a STREAK as it passes the lens — the length is
// perspective doing its job. They are placed relative to the CAMERA and wrap:
// `aPhase` is a mote's place in the queue, folded into the slab of air ahead of
// the lens by uCamZ, so the field is equally dense at every point of the flight
// for the price of a few hundred segments and never has to be rebuilt.
//
// Brightness and EXISTENCE are separate: uOpacity dims the field as a whole,
// uReveal switches motes on one at a time, each at its own point.
export function createMotes({ count, span, radius, length: len, ink = HOLO.mote, fogDensity = 0 }) {
	const n = count;
	const pos = new Float32Array(n * 6);
	const phase = new Float32Array(n * 2);
	const end = new Float32Array(n * 2);
	const seed = new Float32Array(n * 2);
	for (let i = 0; i < n; i++) {
		// Uniform in the disc, so the field does not clump on the axis where it
		// would sit on top of the swimmer.
		const a = rand() * Math.PI * 2;
		const r = Math.sqrt(rand()) * radius;
		const x = Math.cos(a) * r;
		const y = Math.sin(a) * r;
		const z = rand() * span;
		const s = rand();
		for (let k = 0; k < 2; k++) {
			pos[i * 6 + k * 3] = x;
			pos[i * 6 + k * 3 + 1] = y;
			pos[i * 6 + k * 3 + 2] = 0;
			phase[i * 2 + k] = z;
			end[i * 2 + k] = k;
			seed[i * 2 + k] = s;
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
	geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
	geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

	const u = {
		uCamZ: uniform(0),
		uSpan: uniform(span),
		uLen: uniform(len),
		uOpacity: uniform(0),
		uReveal: uniform(0),
		uInk: uniform(new THREE.Color(ink)),
		uFogDensity: uniform(fogDensity)
	};
	const mat = new THREE.LineBasicNodeMaterial({
		transparent: true,
		depthWrite: false,
		depthTest: false,
		...ADD
	});
	mat.uniforms = u;
	const aPhase = attribute('aPhase', 'float');
	const aEnd = attribute('aEnd', 'float');
	const aSeed = attribute('aSeed', 'float');
	// Fold the mote into the slab of air ahead of the lens; a little behind it,
	// so nothing pops into existence at it. The far end of the segment is the
	// trailing one: a streak points back the way it came.
	const d = mod(aPhase.sub(u.uCamZ), u.uSpan);
	const z = u.uCamZ
		.add(4.0)
		.sub(d)
		.add(aEnd.mul(u.uLen).mul(aSeed.add(0.6)));
	mat.positionNode = vec3(positionLocal.x, positionLocal.y, z);
	// Off at both ends of its life, and on at its own point in the reveal.
	const fade = vertexStage(
		smoothstep(0.0, 12.0, d)
			.mul(smoothstep(u.uSpan.mul(0.78), u.uSpan, d).oneMinus())
			.mul(aSeed.mul(0.65).add(0.35))
			.mul(smoothstep(aSeed.mul(0.8), aSeed.mul(0.8).add(0.22), u.uReveal))
	);
	const dist = vertexStage(positionView.z.negate());
	mat.fragmentNode = Fn(() => {
		const fog = exp(u.uFogDensity.mul(u.uFogDensity).mul(dist).mul(dist).negate()).oneMinus();
		const a = fade.mul(u.uOpacity).mul(fog.mul(0.96).oneMinus());
		return vec4(u.uInk.mul(a), a);
	})();

	const lines = new THREE.LineSegments(geo, mat);
	// The wrap happens in the shader, so three cannot know where these end up.
	lines.frustumCulled = false;
	return {
		lines,
		mat,
		uniforms: u,
		set(camZ, opacity, reveal) {
			u.uCamZ.value = camZ;
			u.uOpacity.value = opacity;
			u.uReveal.value = reveal;
		},
		dispose() {
			geo.dispose();
			mat.dispose();
		}
	};
}
