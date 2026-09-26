import {
	vec3,
	vec4,
	uniform,
	mix,
	sin,
	smoothstep as tslSmoothstep,
	positionWorld
} from 'three/tsl';
import {
	SCENES,
	APPROACH,
	KALEIDO,
	TUNNEL,
	HOLO,
	span,
	smootherstep,
	smoothstep
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { createNest } from '$lib/three/world/nest';
import { createKaleidoscope, createCrtMask } from '$lib/three/world/kaleidoscope';
import { DECADES } from '$lib/data/roomElements';

// ── Sketch: the LCL tunnel — the archive in one red, colour arriving with the room
// The kaleido, as the run has it (createKaleidoscope + createNest, the run's
// swimmer riding the camera, the wall of gold ζ grooves round the rings, the
// room at the far end as the label of a record), with ONE change: the search
// is MONOCHROME. Today the rings are the archive's drawings in full colour
// with the hue cycling, a rainbow down a tunnel, and a rainbow is the one
// thing that reads as a screensaver. Here every drawing's level is mapped
// onto a two-stop ramp — near-black, a deep red, LCL orange at the highlights
// — on an off-black that is not quite black; the wall's gold is a dull blood
// red; the disc round the first room comes up the same red; the swimmer stays
// the run's blue — the one cold thing in a red world (?swimmer=red gives the
// brief's black body with a red rim, which is lost against the red: see the
// notes). The ramp DRIFTS: the run's own hue cycle, per unit
// down the tunnel and per second of the scene, no longer turns a hue but
// warms the highlight stop from the red toward the orange and back, so the
// tunnel is banded warm and cold along its length and the bands travel.
// Then the search ENDS, and as the turn and the hue slow to rest over the
// lock, COLOUR comes in: the drawings' own colour fades up under the red,
// the wall's grooves go from blood to gold, the disc with them, the ground
// to the run's own, and the room at the far end — which never was mono — is
// the first full-colour picture in the run. A song is found, and the world
// gets its colour back. At 1 the colour is all the way in and the frame is
// today's, nest.pose(0), to the pixel.
//
// On a birthday the archive cannot answer for (?edge=past|future) there is
// no room and no colour: the red holds, and over the overload the ramp goes
// NEGATIVE — the drawings inverted, white on black, the wall's grooves white
// — while the turn runs away; then the CRT collapse as now, a line, a dot,
// black. The strobe the note wants, without adding a frame.
//
// Nothing of the run's is edited. The ring materials, the wall's and the
// disc's keep their own colour nodes, and this sketch WRAPS them: the mono
// ramp is applied to what the run's node returns (its hue turn, its level,
// its fade with depth, its alpha, all intact), and mixed back to the run's
// own colour by one uniform, uColour, so at uColour = 1 the node's output is
// what it was. The level a drawing is keyed on is (r+g+b)/3, not Rec709
// luminance: TSL's hue() is a rotation about the grey axis, which leaves the
// mean alone and not the luminance, so keyed on the mean the mono picture
// does not breathe with the hue cycle. The wall and the disc are tinted by a
// per-channel ratio (red over gold), so their grooves, sheen and pulse are
// untouched under it.
//
// The beats, in scene progress (SCENES.kaleido, 7 s):
//   0 .05      through the yellow glass into a tunnel of red drawings
//   .05 .68    the tunnel: red, the highlight stop drifting warm and cold
//              with the hue cycle, the wall's grooves blood red, the dark
//              eye ahead
//   .64 .81    the first room comes out of the dark, in colour (NEST.seen),
//              its disc red
//   .68 .92    the lock: colour comes in with the turn and the hue coming to
//              rest — the drawings' own colour up under the red, the wall
//              and the disc to gold, the ground to the run's (`colourIn`)
//   .92 1      today's frame: the rings out under the room, nest.pose(0)
//   edge: .5 .78 the negative comes up over the overload; .78 .93 the
//              collapse, as the run has it
//
//   ?tint=lcl        the ramp: lcl (red → LCL orange), blood (the red water),
//                    dusk (the violet), or three hex stops ?tint=1a0a08,7a1f14,e8802a
//   ?colourIn=0.68,0.92  the window colour comes in over (the lock)
//   ?drift=1         how far the highlight stop drifts toward the red with
//                    the hue cycle (0 is one fixed ramp)
//   ?negative=1      the edge look: the negative over the overload (0 keeps
//                    the red through the breakdown)
//   ?edge=past       the breakdown run: no room, the negative, the collapse
//   ?ground=100806   the off-black under the tunnel, mixed to the run's own
//                    (090b14) as the colour comes in
//   ?wall=1          tint the wall's grooves (0 leaves them gold throughout)
//   ?disc=1          tint the disc round the first room (0 leaves it gold)
//   ?swimmer=blue    the run's swimmer, blue throughout; `red` is black with
//                    a red rim in the tunnel, back to blue with the colour
//   ?mono=0          the kaleido as it is, for the seam diff
//   ?sperm=0         without the swimmer

export const options = { stencil: true };

const rad = (d) => (d * Math.PI) / 180;

// The ramps: three stops, near-black, the mid red, the highlight.
const TINTS = {
	lcl: [0x1a0a08, 0x7a1f14, 0xe8802a],
	blood: [0x160606, 0x6a0f0f, 0xd41e1e],
	dusk: [0x0e0818, 0x3a1e66, 0xb07ad8]
};

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
	const hex = (k, d) => {
		const v = parseInt(q.get(k) ?? '', 16);
		return Number.isFinite(v) ? v : d;
	};
	const tintQ = q.get('tint') ?? 'lcl';
	const stops =
		TINTS[tintQ] ??
		(tintQ.split(',').length === 3 ? tintQ.split(',').map((h) => parseInt(h, 16)) : TINTS.lcl);
	const COLOUR_IN = pair('colourIn', SCENES.kaleido.lock);
	const DRIFT = num('drift', 1);
	const NEGATIVE = num('negative', 1);
	const EDGE = q.get('edge');
	const GROUND = hex('ground', 0x100806);
	const WALL = num('wall', 1);
	const DISC = num('disc', 1);
	const SWIMMER = q.get('swimmer') ?? 'blue';
	const MONO = q.get('mono') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const T = SCENES.kaleido;
	const K = KALEIDO;
	const DURATION = T.duration;
	const broken = !!EDGE;

	// ── The run's own tunnel, as world/kaleido.js has it ─────────────────
	const scene = new THREE.Scene();
	const bu = backdropUniforms();
	const RUN_GROUND = new THREE.Color(0x090b14);
	const OFF_BLACK = new THREE.Color(GROUND);
	bu.color1.value.copy(RUN_GROUND);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);
	const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
	scene.add(camera);
	const crt = createCrtMask(THREE);
	camera.add(crt.group);

	const nest = await createNest({ THREE, renderer });
	const kal = createKaleidoscope({ THREE, nest });
	kal.freshRun({ answer: '90s', portrait: false });
	scene.add(kal.root);
	scene.add(nest.root);
	kal.setDim(1);
	kal.setOpen(1, 1, 0, kal.screen.glass.x, kal.screen.glass.y);
	nest.setDim(broken ? 0 : 1);
	nest.setDark(1);
	const rings = kal.root.getObjectByName('rings');
	const wall = kal.root.getObjectByName('wall');
	const disc = nest.levels[0].meshes.filter((m) => m.renderOrder === 5);

	// The swimmer: the run's, a child of the camera at its ride.
	const lead = APPROACH.lead;
	const sw = nest.swimmer;
	camera.add(sw.group);
	sw.group.quaternion.identity();
	const SPIN = -TUNNEL.spermSpin;
	const BLUE = { ink: new THREE.Color(HOLO.body), rim: new THREE.Color(HOLO.rim) };
	const RED = { ink: new THREE.Color(0x200604), rim: new THREE.Color(0xff3b2a) };

	// ── The ramp, on the run's own nodes ─────────────────────────────────
	// uColour  0 in the tunnel, 1 by the end of the lock: how much of the
	//          run's own colour is back
	// uNeg     the negative, over the overload on an edge run
	// uHueM    the run's hue turn, recomputed here (kaleidoscope.js keeps its
	//          own inside), as the drift's phase down the tunnel
	const uColour = uniform(0);
	const uNeg = uniform(0);
	const uHueM = uniform(0);
	const uZ0 = uniform(kal.zGlass);
	const huePer = (Math.PI * 2) / (K.pitch * K.keys.length * DECADES.length);
	const [c0, c1, c2] = stops.map((h) => new THREE.Color(h));
	const uGround = uniform(c0.clone());
	const uMid = uniform(c1.clone());
	const uHi = uniform(c2.clone());
	const GOLD = new THREE.Color(0xf0c45c);
	const ratio = (c) => new THREE.Vector3(c.r / GOLD.r, c.g / GOLD.g, c.b / GOLD.b);
	// The wall and the disc: the mid red, a shade duller, over gold; and
	// under the negative, a white.
	const uWallTint = uniform(ratio(c1.clone().multiplyScalar(0.85)));
	const uWhiteTint = uniform(ratio(new THREE.Color(0.8, 0.8, 0.8)));
	const ONE = vec3(1, 1, 1);

	// The drift's phase at this fragment: the run's own hue turn, per second
	// and per unit down the tunnel from the glass plane.
	const turned = uHueM.add(uZ0.sub(positionWorld.z).mul(huePer));
	const warm = sin(turned).mul(-0.5).add(0.5).mul(DRIFT);

	// A drawing: the run's node's output keyed on its mean, onto the ramp,
	// the highlight stop drifting toward the mid red, negative under uNeg,
	// and back to the run's own colour by uColour. The alpha is the run's.
	function mono(old) {
		const v = old.rgb;
		const g = v.r
			.add(v.g)
			.add(v.b)
			.div(3 * K.dim);
		const top = mix(uHi, uMid, warm);
		const ramp = mix(
			mix(uGround, uMid, tslSmoothstep(0.0, 0.55, g)),
			top,
			tslSmoothstep(0.55, 1.0, g)
		);
		const neg = ONE.mul(g.oneMinus().clamp(0.0, 1.0));
		const m = mix(ramp, neg, uNeg);
		return vec4(mix(m, v, uColour), old.a);
	}
	// The grooves: premultiplied gold, scaled per channel to the red, back
	// to gold by uColour, and to white under the negative.
	function tinted(old) {
		const t = mix(mix(uWallTint, ONE, uColour), uWhiteTint, uNeg);
		return vec4(old.rgb.mul(t), old.a);
	}
	let patched = 0;
	if (MONO) {
		const seen = new Set();
		rings.traverse((o) => {
			if (!o.isMesh || seen.has(o.material)) return;
			seen.add(o.material);
			o.material.colorNode = mono(o.material.colorNode);
			patched++;
		});
		if (WALL && wall) wall.material.colorNode = tinted(wall.material.colorNode);
		if (DISC) for (const d of disc) d.material.colorNode = tinted(d.material.colorNode);
	}

	// The rings' own deceleration to rest over the lock (kaleidoscope.js).
	function eased(x, [a, b]) {
		if (x <= a) return x;
		const s = Math.min(1, (x - a) / (b - a));
		return a + (b - a) * (s - (s * s) / 2);
	}

	let aspectR = 1;
	const info = {
		tint: tintQ,
		stops: stops.map((h) => h.toString(16).padStart(6, '0')),
		patched,
		wall: !!wall,
		disc: disc.length,
		edge: EDGE ?? null,
		colour: 0,
		neg: 0,
		hue: 0,
		z: 0
	};

	function set(u) {
		const { fov } = kal.pose(u, camera, aspectR);
		kal.set(u, broken);
		nest.setDiscRin(aspectR);
		const clock = u * DURATION;

		// The colour, in over the lock; nil on a run with no room at the end.
		const colour = broken ? 0 : smootherstep(span(u, COLOUR_IN));
		const o = broken ? smoothstep(T.overload[0], T.overload[1], u) : 0;
		uColour.value = MONO ? colour : 1;
		uNeg.value = MONO ? o * o * NEGATIVE : 0;

		// The run's hue turn, for the drift (kaleidoscope.js set()).
		const w = broken ? u : eased(u, T.lock);
		uHueM.value = w * T.hueCycles * Math.PI * 2 + o * o * Math.PI * 6;

		// The ground: the off-black, to the run's own as the colour comes in.
		if (colour >= 1 || !MONO) bu.color1.value.copy(RUN_GROUND);
		else bu.color1.value.copy(OFF_BLACK).lerp(RUN_GROUND, colour);

		// The swimmer, exactly as in the run — its colours the one change.
		const bodyH = APPROACH.span * 2 * lead * Math.tan(rad(fov) / 2);
		sw.group.position.set(0, 0, -lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = clock * SPIN;
		sw.material.uniforms.uTime.value = clock;
		sw.material.uniforms.uOpacity.value = SPERM ? 1 : 0;
		const red = MONO && SWIMMER === 'red' ? 1 - colour : 0;
		if (red <= 0) {
			sw.material.uniforms.uInk.value.copy(BLUE.ink);
			sw.material.uniforms.uAccent.value.copy(BLUE.rim);
		} else {
			sw.material.uniforms.uInk.value.copy(BLUE.ink).lerp(RED.ink, red);
			sw.material.uniforms.uAccent.value.copy(BLUE.rim).lerp(RED.rim, red);
		}

		// The breakdown: the covers close to a line, the line to a dot, black.
		if (broken) {
			const open = 1 - smootherstep(span(u, T.collapse));
			const width = 1 - smootherstep(span(u, T.pinch));
			const glow = u >= T.collapse[0] ? 1 - smoothstep(T.pinch[1], 1, u) : 0;
			crt.set(camera, open, width, glow);
		} else crt.set(camera, 1, 1, 0);

		kal.rebase(camera.position.z, camera.near);
		info.colour = Number(colour.toFixed(3));
		info.neg = Number(uNeg.value.toFixed(3));
		info.hue = Number(uHueM.value.toFixed(3));
		info.z = Number(camera.position.z.toFixed(2));
	}

	const size = renderer.getSize(new THREE.Vector2());
	aspectR = size.x / size.y;
	camera.aspect = aspectR;
	bu.aspectRatio.value = aspectR;
	bu.uPx.value = 1 / renderer.domElement.height;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1.5);
			set(Math.min(tt / DURATION, 1));
		},
		seek(u) {
			tt = u * DURATION;
			set(Math.max(0, Math.min(1, u)));
		},
		render() {
			renderer.render(scene, camera);
		},
		resize(w, h) {
			aspectR = w / h;
			camera.aspect = aspectR;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = aspectR;
			bu.uPx.value = 1 / renderer.domElement.height;
		}
	};
}
