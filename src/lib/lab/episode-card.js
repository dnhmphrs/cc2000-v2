import {
	SCENES,
	APPROACH,
	LENS,
	TUNNEL,
	runSeconds,
	span,
	smoothstep,
	smootherstep,
	easeInOutCubic
} from '$lib/config';
import { deep, backdropUniforms } from '$lib/three/tsl/backdrop';
import { dotMaterial, dots } from '$lib/three/tsl/materials';
import { createMotes } from '$lib/three/tsl/motes';
import { loadSwimmer } from '$lib/three/tsl/swimmer';
import { wobbleEuler } from '$lib/three/world/wobble';

// ── Sketch: the episode card ─────────────────────────────────────────────────
// The title card (scenes/Prelude.svelte, the `prelude` gate) as an episode
// card: the title as a CUT, not a type-on. The run opens on its quietest
// image and the card it is asking for opens on its loudest — a heavy serif,
// white on black, huge and off-centre, held dead still, then gone. It is the
// one place in the run where a hard cut costs the continuous shot nothing:
// the approach is mounted under the card and held at progress zero, which is
// black air with nothing in it yet, so every cut here lands black over black.
// The card is pure EDITING — cuts and a hold — with nothing under it to break.
//
// It is DOM over the 3D, as the run's card is. The lab page is a bare canvas,
// so this sketch makes its own overlay (one div over the canvas, one style
// element, both removed on dispose) and drives it from the same clock as the
// ground, so /lab?sketch=episode-card&at= pins a frame of the DOM exactly as
// it pins the canvas. Nothing on the card transitions: visibility is stepped,
// the negative is a class, the caret's blink is worked out from t. The only
// thing that fades is the lift, Prelude's own out:fade of 420 ms, kept there
// and nowhere else.
//
// The beats, in seconds of the card (SCENES.calculator's own numbers where it
// has them; the three new ones are the switches below):
//   0 → 0.6      black, nothing — typeDelay, as today
//   0.6          CUT to the card: CONCEPTION / CALCULATOR / 2000 in the serif,
//                white, flush-left, the block filling the lower left, the
//                upper right empty. Held `hold` seconds dead still — no
//                typing, no caret.
//   +hold        CUT to the NEGATIVE: the same card black on white, `neg` s.
//                Under prefers-reduced-motion it is skipped (a full white
//                frame over a black ground is the strobe), as Prompt does.
//   +neg         CUT to black, held `gap` seconds.
//   +gap         the three mono lines type as they do today (charInterval,
//                lineGap, titleHold), the small typed readout against the
//                huge cut serif — the two registers the note asks for.
//   END          the card lifts (out:fade 420) onto the sky coming up: the
//                approach's own p runs from 0 under it, so the last `tail`
//                seconds are the run's own opening — the sky, the debris,
//                the swimmer fading in at its ride.
//
// The ground is the approach at p 0 — deep(backdrop) at fade 1, the sky and
// the swimmer at nought — on the run's lens with the run's hand on the
// camera, so what is under the card is what the run has under it.
//
//   ?hold=1.3      seconds the serif card is held
//   ?neg=0.1       seconds of the negative (0 for none)
//   ?gap=0.5       seconds of black between the negative and the spiel
//   ?tail=1.5      seconds of flight shown after the lift
//   ?font=serif    serif | mono — the card's face (mono is nb-architekt bold)
//   ?size=12       the serif's em, in vw (capped at 1.6× that in vh)
//   ?lines=3       3: CONCEPTION / CALCULATOR / 2000; 2: CONCEPTION /
//                  CALCULATOR 2000 (the brief's, too wide for one line at
//                  this size on a laptop — it fits by shrinking)
//   ?align=left    left | right — which side the block is flush to
//   ?x=8           the block's inset from that side, in vw
//   ?y=90          where the block's bottom sits, in vh from the top
//   ?text=a/b/c    the title, lines split on /
//   ?ep=0          1: a small mono EPISODE:01 at the top left of the serif card
//   ?spiel=1       0: no typed lines — the card cuts straight to the lift
//   ?sperm=1       0: no swimmer in the tail
//   ?wobble=1      0: no hand on the camera
//
// The serif in the tree is a TRIAL file (test-martina-plantijn-black.woff2),
// undeclared anywhere: fine for looking at in the lab, not for main without
// a licence. Its coverage is whatever the trial ships; window.__lab.serif
// says whether it loaded and whether the title's glyphs are all in it.

export const options = {};

const rad = (d) => (d * Math.PI) / 180;

export default async function make({ THREE, renderer, at }) {
	const q = new URLSearchParams(location.search);
	const num = (k, d) => {
		const v = Number(q.get(k));
		return q.has(k) && Number.isFinite(v) ? v : d;
	};
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	const HOLD = num('hold', 1.3);
	const NEG = reduced ? 0 : num('neg', 0.1);
	const GAP = num('gap', 0.5);
	const TAIL = num('tail', 1.5);
	const FONT = q.get('font') === 'mono' ? 'mono' : 'serif';
	const SIZE = num('size', 12);
	const LINES_N = num('lines', 3);
	const ALIGN = q.get('align') === 'right' ? 'right' : 'left';
	const X = num('x', 8);
	const Y = num('y', 90);
	const EP = q.get('ep') === '1';
	const SPIEL = q.get('spiel') !== '0';
	const SPERM = q.get('sperm') !== '0';
	const WOBBLE_ON = q.get('wobble') !== '0';
	const TITLE = q.get('text')
		? q.get('text').split('/')
		: LINES_N === 2
			? ['CONCEPTION', 'CALCULATOR 2000']
			: ['CONCEPTION', 'CALCULATOR', '2000'];

	const T = SCENES.calculator;
	const TA = SCENES.approach;
	const A = APPROACH;
	const LIFT = 0.42; // Prelude's out:fade, in seconds

	// ── The clock ────────────────────────────────────────────────────────
	// Prelude's own spiel arithmetic, pushed back by the card, the negative
	// and the gap.
	const SPIEL_LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception'
	];
	const CARD_IN = T.typeDelay;
	const NEG_IN = CARD_IN + HOLD;
	const GAP_IN = NEG_IN + NEG;
	const SPIEL_IN = GAP_IN + GAP;
	const START = [];
	let cursor = SPIEL_IN;
	for (const line of SPIEL_LINES) {
		START.push(cursor);
		cursor += line.length * T.charInterval + T.lineGap;
	}
	const END = SPIEL ? cursor - T.lineGap + T.titleHold : SPIEL_IN;
	const DURATION = END + TAIL;

	// ── The ground: the approach at p 0 ──────────────────────────────────
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(LENS, 1, 0.1, 400);
	const rig = new THREE.Group();
	rig.add(camera);
	scene.add(rig);

	const bu = backdropUniforms();
	bu.color1.value.set(0x090b14);
	bu.uFade.value = 1;
	scene.backgroundNode = deep(bu);

	let seed = 7;
	const rnd = () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const starMats = [];
	const starField = (n, dist, size, hex, opacity) => {
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const z = rnd() * 2 - 1;
			const a = rnd() * Math.PI * 2;
			const r = Math.sqrt(1 - z * z);
			const d = dist * (0.8 + rnd() * 0.4);
			pos.set([r * Math.cos(a) * d, r * Math.sin(a) * d, z * d], i * 3);
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const mat = dotMaterial(hex, size);
		starMats.push({ mat, opacity });
		return dots(geo, mat);
	};
	rig.add(starField(A.stars, A.starDist, 3.0, 0xb8c8ff, 0.7));
	rig.add(starField(A.brightStars, A.starDist, 5.5, 0xdde6ff, 0.9));

	const motes = createMotes({
		count: A.motes,
		span: A.moteSpan,
		radius: A.moteRadius,
		length: A.moteLength
	});
	scene.add(motes.lines);

	// The swimmer, riding as the run has it: a child of the camera at −lead,
	// sized off the lens, rolling on a clock that is pure here.
	const sw = await loadSwimmer({ height: 1, fog: 0x090b14, fogDensity: 0.012 });
	sw.material.depthTest = false;
	sw.group.traverse((o) => {
		if (o.isMesh) o.renderOrder = 10;
	});
	camera.add(sw.group);
	const SPIN = -TUNNEL.spermSpin;

	// ── The card: DOM over the canvas ────────────────────────────────────
	// Prelude's layering (z 20 over the canvas, under the scanlines at 30),
	// its ground (none: the 3D is the ground), and its spiel — the ghost/live
	// pair so a centred line does not crawl as it is typed.
	let serif = 'none';
	if (FONT === 'serif') {
		try {
			const ff = new FontFace('martina-plantijn', 'url(/fonts/test-martina-plantijn-black.woff2)', {
				weight: '900'
			});
			await ff.load();
			document.fonts.add(ff);
			serif = 'martina-plantijn';
		} catch {
			serif = 'fallback';
		}
	}
	try {
		const ff = new FontFace('nb-architekt', 'url(/fonts/NB-Architekt-Pro-Bold.woff)', {
			weight: '700'
		});
		await ff.load();
		document.fonts.add(ff);
	} catch {
		/* the layout declares it anyway */
	}

	const style = document.createElement('style');
	style.textContent = `
		.epc { position: fixed; inset: 0; z-index: 20; pointer-events: none; background: transparent;
			user-select: none; -webkit-user-select: none; }
		.epc.epc-neg { background: #fff; }
		.epc-title { position: absolute; margin: 0; ${ALIGN}: ${X}vw; bottom: ${100 - Y}vh;
			font-family: ${FONT === 'serif' ? "'martina-plantijn', 'Times New Roman', Georgia, serif" : "'nb-architekt', ui-monospace, monospace"};
			font-weight: ${FONT === 'serif' ? 900 : 700};
			font-size: min(${SIZE}vw, ${SIZE * 1.6}vh); line-height: 0.92; letter-spacing: ${FONT === 'serif' ? '-0.01em' : '0.02em'};
			color: #fff; text-align: ${ALIGN}; white-space: nowrap; visibility: hidden; }
		.epc-neg .epc-title { color: #000; }
		.epc-ep { position: absolute; margin: 0; ${ALIGN}: ${X}vw; top: 7vh;
			font-family: 'nb-architekt', ui-monospace, monospace; font-weight: 700;
			font-size: clamp(11px, 1.1vw, 16px); letter-spacing: 0.18em; color: #fff; visibility: hidden; }
		.epc-neg .epc-ep { color: #000; }
		.epc-spiel { position: absolute; inset: 0; display: flex; flex-direction: column;
			align-items: center; justify-content: center; gap: 0.55em; padding: 6vh 6vw;
			font-family: 'nb-architekt', ui-monospace, monospace; visibility: hidden; }
		.epc-spiel p { position: relative; margin: 0; max-width: 100%;
			font-size: clamp(11px, 1.1vw, 16px); line-height: 1.6; letter-spacing: 0.04em;
			color: rgb(240, 242, 248); }
		.epc-spiel .epc-ghost { visibility: hidden; }
		.epc-spiel .epc-live { position: absolute; inset: 0; white-space: pre; }
		.epc-caret { display: inline-block; width: 0.5em; height: 0.9em; vertical-align: text-bottom;
			background: rgb(240, 242, 248); }
	`;
	document.head.appendChild(style);

	const root = document.createElement('div');
	root.className = 'epc';
	const ep = document.createElement('p');
	ep.className = 'epc-ep';
	ep.textContent = 'EPISODE:01';
	const title = document.createElement('h1');
	title.className = 'epc-title';
	title.innerHTML = TITLE.map((l) => `<span>${l}</span>`).join('<br>');
	const spiel = document.createElement('div');
	spiel.className = 'epc-spiel';
	const lives = SPIEL_LINES.map((line) => {
		const p = document.createElement('p');
		const ghost = document.createElement('span');
		ghost.className = 'epc-ghost';
		ghost.textContent = line;
		const live = document.createElement('span');
		live.className = 'epc-live';
		p.append(ghost, live);
		spiel.append(p);
		return live;
	});
	root.append(ep, title, spiel);
	document.body.appendChild(root);

	// Does the trial file have the title's glyphs? A glyph the face lacks is
	// drawn in the next family down, so ask the canvas: the title measured in
	// the serif alone against the serif with a very different fallback behind
	// it — equal widths mean nothing fell through.
	let coverage = 'n/a';
	if (serif === 'martina-plantijn') {
		const cx = document.createElement('canvas').getContext('2d');
		const txt = TITLE.join(' ');
		cx.font = "900 100px 'martina-plantijn', monospace";
		const a = cx.measureText(txt).width;
		cx.font = "900 100px 'martina-plantijn', serif";
		const b = cx.measureText(txt).width;
		coverage = Math.abs(a - b) < 0.5 ? 'all glyphs' : 'some glyphs fell through';
	}

	const info = {
		serif: FONT === 'serif' ? `${serif} (${coverage})` : 'mono',
		cuts: {
			card: Number(CARD_IN.toFixed(3)),
			neg: Number(NEG_IN.toFixed(3)),
			black: Number(GAP_IN.toFixed(3)),
			spiel: Number(SPIEL_IN.toFixed(3)),
			lift: Number(END.toFixed(3))
		},
		duration: Number(DURATION.toFixed(3)),
		reduced
	};

	// ── set(u): the frame, from the clock alone ──────────────────────────
	const euler = new THREE.Euler();
	let lastShown = '';
	function set(u) {
		const t = u * DURATION;

		// The card's phase: a step function of t.
		const phase =
			t < CARD_IN
				? 'black'
				: t < NEG_IN
					? 'card'
					: t < GAP_IN
						? 'neg'
						: t < SPIEL_IN
							? 'gap'
							: t < END
								? 'spiel'
								: 'lift';
		const onCard = phase === 'card' || phase === 'neg';
		root.classList.toggle('epc-neg', phase === 'neg');
		title.style.visibility = onCard ? 'visible' : 'hidden';
		ep.style.visibility = onCard && EP ? 'visible' : 'hidden';
		spiel.style.visibility =
			SPIEL && (phase === 'spiel' || phase === 'lift') ? 'visible' : 'hidden';
		// The lift: Prelude's out:fade, the one fade on the card.
		const lift = phase === 'lift' ? Math.min(1, (t - END) / LIFT) : 0;
		root.style.opacity = String(1 - lift);
		root.style.display = lift >= 1 ? 'none' : '';

		// The spiel, as Prelude works it out: what is shown is a function of how
		// long the card has been up. The caret blinks on the clock too (1.05 s,
		// steps(1)) rather than on a CSS animation, so a pin is a pin.
		if (SPIEL) {
			const shown = SPIEL_LINES.map((line, i) =>
				Math.max(0, Math.min(line.length, Math.floor((t - START[i]) / T.charInterval)))
			);
			const blink = Math.floor(t / 0.525) % 2 === 0;
			const key = `${shown.join(',')}|${blink}`;
			if (key !== lastShown) {
				lastShown = key;
				SPIEL_LINES.forEach((line, i) => {
					lives[i].textContent = line.slice(0, shown[i]);
					if (shown[i] > 0 && shown[i] < line.length && blink) {
						const c = document.createElement('span');
						c.className = 'epc-caret';
						lives[i].append(c);
					}
				});
			}
			info.shown = shown;
		}

		// ── The ground: the approach, held at 0 until the lift ───────────
		const p = Math.max(0, t - END) / TA.duration;
		const z = -(A.travel - 6) * p;
		rig.position.set(0, 0, z);
		if (WOBBLE_ON) camera.quaternion.setFromEuler(wobbleEuler(euler, runSeconds('approach', p)));
		else camera.quaternion.identity();
		camera.updateMatrixWorld(true);

		const up = smootherstep(span(p, TA.fadeIn));
		const on = up * (1 - easeInOutCubic(span(p, TA.skyOut)));
		for (const s of starMats) s.mat.uniforms.uOpacity.value = s.opacity * on;
		motes.set(z, on, span(p, TA.fadeIn));

		const inK = smootherstep(span(p, TA.swimmerIn));
		const bodyH = A.span * 2 * A.lead * Math.tan(rad(LENS) / 2);
		sw.group.position.set(0, 0, -A.lead);
		sw.group.scale.setScalar(bodyH);
		sw.spinner.rotation.z = t * SPIN;
		sw.material.uniforms.uTime.value = t;
		sw.material.uniforms.uOpacity.value = SPERM ? inK : 0;

		info.t = Number(t.toFixed(3));
		info.phase = phase;
		info.p = Number(p.toFixed(4));
		info.sky = Number(smoothstep(0, 1, on).toFixed(3));
	}

	const sz = renderer.getSize(new THREE.Vector2());
	camera.aspect = sz.x / sz.y;
	camera.updateProjectionMatrix();
	bu.aspectRatio.value = camera.aspect;
	bu.uPx.value = 1 / renderer.domElement.height;

	let tt = at !== null ? at * DURATION : 0;
	set(at !== null ? at : 0);

	return {
		info,
		update(dt) {
			tt = (tt + dt) % (DURATION + 1);
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
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			bu.aspectRatio.value = w / h;
			bu.uPx.value = 1 / renderer.domElement.height;
		},
		dispose() {
			root.remove();
			style.remove();
		}
	};
}
