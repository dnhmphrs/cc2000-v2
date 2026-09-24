import {
	Fn,
	uniform,
	uv,
	vec3,
	vec4,
	float,
	length,
	atan,
	fract,
	fwidth,
	smoothstep,
	min,
	max,
	abs,
	cos,
	sin,
	pow,
	exp,
	log,
	mix
} from 'three/tsl';
import { SCENES, LENS, lerp, accelerate, smoothstep as smooth } from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createNest } from '$lib/three/world/nest';

// ── Sketch: the run-out ──────────────────────────────────────────────────────
// The way home is through the record. "Go again" flies the lens into the
// answer's monitor (world/descent.js stepReturn: from the landing to `through`
// of the last room's crossing, in `home` seconds), and the black inside that
// glass is not empty: it is VINYL. The glass goes to black-with-grooves under
// where the readout was — hairline gold rings, the tight ones of the song's
// last bars, then the wide turns of the lead-out, then the lock groove at the
// label's edge, the groove that turns after the song has ended — turning at
// 33⅓, while the room round the monitor goes to black as it does today. The
// lens drops to the spindle hole at the centre, the hole takes the frame, and
// the black in it is the black the next flight opens on. Nothing about the
// camera changes: the pose is nest.pose() on stepReturn's own ζ, and the room's
// dark and dim are the descent's own numbers on the nest's own uniforms.
//
// The record is ONE quad on the last room's glass — a child of that level's
// group, a hair in front of the splosh, drawn only where the stencil says
// glass (the ref the glass-only quad incremented to), blended OVER rather than
// added, so its alpha is what takes the painted glass to black beneath the
// grooves: it works on the 60s yellow and the 10s blue as it does on the 90s
// black. The grooves are hair() lines — a stroke floored at one screen pixel
// by fwidth, with its light scaled down by the same ratio, so a groove that
// recedes gets fainter rather than sparkling — on a spiral whose pitch is a
// function of r: phase(r) = Gc·r + (Gf−Gc)·softplus(r − r1), tight outside the
// lead-out and wide inside it, and the lock groove is a circle at the label.
//
// The beats, in seconds of the sketch (the hold, then stepReturn's q):
//   0 → hold      landed: the white drains from the glass, as the run's hold
//                 does under the readout (SCENES.descent.drain)
//   q 0 → in      the readout is gone (room.resultOut is 0.25 s of it) and
//                 the glass goes to black over `in`, and the black has the
//                 record in it a beat behind
//   q homeDim     the room goes to black round the monitor (the run's own)
//   q swallow     the hole opens at the lens and takes the frame
//   q 0.92 → 1    black lets the ground through, exactly as today
//
//   ?rooms=60s,90s  the nest, outermost first; the last is the answer's room
//   ?decade=10s     just the last room (the glass the record is in)
//   ?hold=0.9       seconds landed before "go again"
//   ?in=0.18,0.4    the grooves' window of q      ?swallow=0.72,0.97  the hole's
//   ?rpm=33.3       ?grooves=80 fine grooves per glass height, ?lead=18 in the
//   lead-out, ?label=0.2 the label's radius, ?hole=0.045 the spindle hole's
//   ?sheen=1        the light across the grooves (0 for flat rings)
//   ?w=0.0022       the stroke, in glass heights (floored at a pixel)

export const options = { stencil: true };

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const num = (k, d) => {
		const v = Number(q.get(k));
		return q.has(k) && Number.isFinite(v) ? v : d;
	};
	const pair = (k, d) => {
		const v = (q.get(k) ?? '').split(',').map(Number);
		return v.length === 2 && v.every(Number.isFinite) ? v : d;
	};
	let ROOMS = (q.get('rooms') ?? '60s,90s').split(',');
	if (q.has('decade')) {
		const d = q.get('decade');
		ROOMS = [ROOMS[0] === d ? (d === '60s' ? '90s' : '60s') : ROOMS[0], d];
	}
	const HOLD = num('hold', 0.9);
	const IN = pair('in', [0.18, 0.4]);
	const SWALLOW = pair('swallow', [0.72, 0.97]);
	const RPM = num('rpm', 33.3);
	const GF = num('grooves', 80);
	const GC = num('lead', 18);
	const LABEL = num('label', 0.2);
	const HOLE = num('hole', 0.045);
	const SHEEN = num('sheen', 1);
	const STROKE = num('w', 0.0022);
	const T = SCENES.descent;
	const HOME = T.home;
	const DURATION = HOLD + HOME;

	// ── The room, as the run has it ──────────────────────────────────────
	const scene = new THREE.Scene();
	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.05, 100);
	let aspect = 1;

	const nest = await createNest({ THREE, renderer });
	nest.build({ rooms: ROOMS, portrait: false });
	scene.add(nest.root);
	nest.refreshClips();
	const levels = nest.levels;
	const last = levels[levels.length - 1];
	const from = nest.zetaEnd();
	const to = levels.length - 1 + T.through;

	// ── The record ───────────────────────────────────────────────────────
	// One quad on the last room's glass, where the splosh is, a hair nearer.
	const gl = last.glass;
	const u = {
		uTurn: uniform(0),
		uIn: uniform(0),
		uLit: uniform(0),
		uHole: uniform(HOLE),
		uOut: uniform(1),
		uSize: uniform(new THREE.Vector2(gl.w / gl.h, 1))
	};
	const GOLD = new THREE.Color(0xf0c45c);
	const PAPER = new THREE.Color(0x3a2c14);
	const mat = new THREE.MeshBasicNodeMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		// OVER, premultiplied: the alpha takes the painted glass to black and
		// the RGB is the gold on top of it.
		blending: THREE.CustomBlending,
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,
		blendEquation: THREE.AddEquation
	});
	// Only where the stencil says glass: the glass-only quad of room k
	// increments k+1 to k+2 inside the glass, and nothing else is at k+2.
	mat.stencilWrite = true;
	mat.stencilRef = levels.length + 1;
	mat.stencilFunc = THREE.EqualStencilFunc;
	mat.stencilFail = THREE.KeepStencilOp;
	mat.stencilZFail = THREE.KeepStencilOp;
	mat.stencilZPass = THREE.KeepStencilOp;

	// A stroke of w glass-heights, floored at one screen pixel, its light
	// scaled by the same ratio (backdrop.grid's hair).
	const hair = Fn(([d, w, px]) => {
		const e = max(w, px);
		return smoothstep(0.0, e, d)
			.oneMinus()
			.mul(min(w.div(e), 1.0));
	});
	const softplus = Fn(([x]) => log(exp(x).add(1.0)));
	const sigmoid = Fn(([x]) => exp(x.negate()).add(1.0).reciprocal());

	mat.colorNode = Fn(() => {
		const p = uv().sub(0.5).mul(u.uSize);
		const r = length(p);
		const th = atan(p.y, p.x);
		const px = fwidth(r);
		const w = float(STROKE);

		// The grooves. Tight outside the lead-out, wide inside it: the pitch
		// changes smoothly over K, and the phase is its integral.
		const R1 = LABEL + 0.1;
		const K = 0.012;
		const x = r.sub(R1).div(K);
		const phase = r.mul(GC).add(softplus(x).mul(K * (GF - GC)));
		const dPhase = sigmoid(x)
			.mul(GF - GC)
			.add(GC); // grooves per glass-height, here
		const f = fract(phase.add(th.div(2.0 * Math.PI)).add(u.uTurn));
		const d = min(f, f.oneMinus()).div(dPhase);
		// The song's last bars: the tight grooves come in bands, as a track's
		// loud and quiet bars do on an LP under a lamp.
		const band = sin(r.mul(23.0).add(0.4))
			.mul(sin(r.mul(57.0)))
			.mul(0.18)
			.add(0.82);
		const groove = hair(d, w, px)
			.mul(smoothstep(LABEL + 0.006, LABEL + 0.02, r))
			.mul(mix(1.0, band, smoothstep(R1, R1 + 0.08, r)));
		// The lock groove: a circle at the label's edge, the last groove there is.
		const lock = hair(abs(r.sub(LABEL)), w.mul(1.4), px);
		// The light across the record: two opposed sectors, fixed while it turns.
		const sheen = pow(abs(cos(th.sub(1.15))), 3.0).mul(SHEEN);
		const lit = mix(1.0 - 0.7 * SHEEN, 1.0, sheen);
		// And the lamp in the vinyl itself: a whisper of gold between the
		// grooves, in the same two sectors.
		const gloss = sheen.mul(0.045).mul(smoothstep(LABEL, LABEL + 0.03, r));
		// The label: paper, dim, with one printed ring; and the hole, black.
		const label = smoothstep(LABEL - 0.004, LABEL, r).oneMinus();
		const ring = hair(abs(r.sub(LABEL * 0.55)), w, px).mul(0.35);
		const hole = smoothstep(u.uHole.sub(0.004), u.uHole, r).oneMinus();
		const lip = hair(abs(r.sub(u.uHole)), w, px).mul(0.6);

		const gold = vec3(GOLD.r, GOLD.g, GOLD.b);
		const paper = vec3(PAPER.r, PAPER.g, PAPER.b);
		const col = gold
			.mul(groove.mul(lit).mul(0.95).add(lock.mul(1.1)).add(ring).add(lip).add(gloss))
			.add(paper.mul(label).mul(0.45))
			.mul(hole.oneMinus())
			.mul(u.uLit)
			.mul(u.uOut);
		return vec4(col, u.uIn.mul(u.uOut));
	})();

	const record = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
	record.scale.set(gl.w, gl.h, 1);
	record.position.set(gl.x, gl.y, gl.z + 0.003);
	record.renderOrder = 200001; // the splosh is 200000
	record.frustumCulled = false;
	// NOT in last.meshes: rebase() hides those once the lens has passed the
	// glass, and by then the frame is all glass — the record stays.
	last.group.add(record);

	// The swimmer is gone by the landing.
	nest.swimmer.material.uniforms.uOpacity.value = 0;

	// ── The frame at u ───────────────────────────────────────────────────
	const info = {
		rooms: ROOMS,
		hold: HOLD,
		home: HOME,
		q: 0,
		zeta: 0,
		passed: false,
		glassPx: 0,
		turn: 0,
		hole: HOLE
	};
	const va = new THREE.Vector3();
	const vb = new THREE.Vector3();
	function glassPixels() {
		last.group.updateWorldMatrix(true, false);
		last.group.localToWorld(va.set(gl.x, gl.y + gl.h / 2, gl.z)).project(camera);
		last.group.localToWorld(vb.set(gl.x, gl.y - gl.h / 2, gl.z)).project(camera);
		return Math.abs(va.y - vb.y) * 0.5 * renderer.domElement.height;
	}
	function set(p) {
		const t = p * DURATION;
		if (t < HOLD) {
			// Landed, the readout up (in the run: the DOM), the white draining.
			nest.pose(from, camera, aspect);
			nest.setSplosh(1, 1 - smooth(0.15, T.drain, t));
			nest.setDark(1);
			nest.setDim(1);
			u.uIn.value = 0;
			u.uLit.value = 0;
			u.uOut.value = 1;
			u.uTurn.value = 0;
			u.uHole.value = HOLE;
			info.q = 0;
			info.zeta = from;
		} else {
			// descent.stepReturn(), line for line, with the record on.
			const qq = Math.min((t - HOLD) / HOME, 1);
			const zeta = lerp(from, to, accelerate(qq, 1.5));
			nest.pose(zeta, camera, aspect);
			nest.setSplosh(1, 0);
			const dark = smooth(T.homeDim[0], T.homeDim[1], qq);
			nest.setDark(1 - dark);
			const dim = 1 - smooth(T.homeDim[1], 1, qq);
			nest.setDim(dim);
			// The glass goes black first; then the black has the record in it.
			u.uIn.value = smooth(IN[0], IN[1], qq);
			u.uLit.value = smooth(IN[0] + 0.08, IN[1] + 0.08, qq);
			u.uOut.value = dim;
			u.uTurn.value = ((qq * HOME * RPM) / 60) % 1;
			// The hole opens at the lens and takes the frame.
			const sw = accelerate(smooth(SWALLOW[0], SWALLOW[1], qq), 2.2);
			u.uHole.value = lerp(HOLE, 1.6, sw);
			info.q = Number(qq.toFixed(3));
			info.zeta = Number(zeta.toFixed(3));
		}
		info.passed = camera.position.z < last.glassZ + 1.5 * camera.near;
		info.glassPx = Math.round(glassPixels());
		info.turn = Number(u.uTurn.value.toFixed(3));
		info.hole = Number(u.uHole.value.toFixed(3));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspect = size.x / size.y;
	bu.aspectRatio.value = aspect;
	bu.uPx.value = 1 / renderer.domElement.height;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(v) {
			tt = v * DURATION;
			set(Math.max(0, Math.min(1, v)));
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspect = w / h;
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = aspect;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
