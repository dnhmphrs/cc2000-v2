<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import { get } from 'svelte/store';
	import {
		decade,
		aspect,
		flare,
		fieldDecade,
		monitorRect,
		landing,
		fieldRotation,
		fieldFade
	} from '$lib/store/store';
	import {
		SCENES,
		PULL,
		pullAmount,
		RETURN_FILL,
		span,
		lerp,
		clamp01,
		smoothstep,
		easeInOutCubic,
		easeInOutPower,
		smootherstep,
		bump,
		ICOSA,
		restFrustum,
		conceptionFrustum,
		VOID
	} from '$lib/config';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
	import { settled } from './director';
	import GoldenRectangle from '$lib/three/objects/GoldenRectangle.svelte';
	import { RECTANGLES, VERTICES } from '$lib/three/geometry/icosahedron';

	// ── Scene 4: the computation ─────────────────────────────────────────────
	// The panes come out of the sphere, the search turns through the decades,
	// and the camera falls into the room that holds the answer.
	//
	// It opens by PULLING BACK. The conception was close on the solid — that
	// scene had nothing else to show — and six rooms will not fit in that frame,
	// so the first thing this does is make room for them. The pull-back is most
	// of why the panes read as coming OUT rather than merely appearing, and it
	// costs nothing: it is the same frustum the return zoom already walks.
	//
	// ── The survey ───────────────────────────────────────────────────────────
	// Then it STOPS AND LOOKS. Two and a half seconds of the whole assembly,
	// fully out, turning — before a single decade is chosen. This is the beat V2
	// had and every version since dropped, and dropping it is why the clocking
	// afterwards never landed: a machine cannot be seen to select from a set you
	// have never been shown.
	//
	// It is also the only place in the run with any perspective in it. The lens
	// opens from ICOSA.fov to ICOSA.fovWide and the camera walks in to match — a
	// true dolly zoom, framing held to the pixel, space transformed: the near
	// rooms swell off the frame and the far ones fall away, and for two seconds
	// the thing is unmistakably three-dimensional. Then the lens closes back to
	// its technical 12 degrees and the machine gets to work.
	//
	// And it comes out as DRAFTING first. The rectangle, its dimension lines, its
	// ratio bar, its spiral — the machine's working — and only then do the rooms
	// fade up through it, and only then does the working step back. Three beats
	// where there used to be one bloom, and it is the difference between a
	// machine calculating and a slideshow.
	//
	// The search is stepped, not continuous: turn a decade SQUARE to the camera,
	// HOLD it, turn to the next, and the last turn lands on the answer. Every
	// step locks face-on, and the route is the direct arc — the shortest rotation
	// between two poses, taken firmly.
	//
	// TWO THINGS IT DOES NOT DO, and both were tried:
	//
	//   THE CAMERA DOES NOT MOVE. Not a lean, not a nudge, nothing. A frustum
	//   that pumps in on every candidate is the single loudest way to make a
	//   precise instrument look like a slideshow transition.
	//
	//   NOTHING FADES ON THE BEAT. The other five do not dim, pulse, or step
	//   back. Six rooms flickering at each other four times running is a
	//   slideshow with a transition; the turn is the whole event.
	//
	// It was tried the other way, holding an oblique attitude and only squaring
	// up for the answer. It reads as drift. The whole point of the scene is that a
	// machine is examining candidates, and a machine turns a thing to face you and
	// stops: the precision IS the drama, and a bowed route through a control pose
	// is a flourish where a lock-on should be.
	//
	// ── The fall ─────────────────────────────────────────────────────────────
	// And then a plain, dead-centre zoom on the WHOLE SCENE, on one symmetric
	// ease, with nothing in it staggered. The depth-parallax version — the bed
	// rushing past first, then the desk, then the screen — pulls the room apart
	// at the exact moment it is supposed to become a place. It goes in as one
	// thing.
	//
	// Like the conception, every value here is a pure function of scene progress
	// — nothing integrates dt — so the scene can be reset or re-entered without
	// drifting. The one exception is the landing quaternions, which are measured
	// once the rooms exist and then held.
	//
	// The icosahedron itself is world/lattice.js, shared with the conception, so
	// the frame the panes come off is the frame that just assembled itself.

	export let world;
	export let renderer = null;

	const T = SCENES.computation;

	// Two panes per golden rectangle, projecting opposite ways: six decade rooms.
	const paneConfigs = RECTANGLES.flatMap((r) =>
		[1, -1].map((direction) => ({
			indices: r.indices,
			axis: new THREE.Vector3(...r.axis),
			plane: r.plane,
			direction
		}))
	);

	let ready = false;
	let panes = [];
	let decadeAssignments = [];

	let frustum = ICOSA.frustum;
	// Where the pull-back starts and where it is heading. Both measured on entry,
	// because both depend on the shape of the viewport.
	let from = ICOSA.conceptionFrustum;
	let rest = ICOSA.frustum;
	let landFrustum = 8;
	let target = -1;
	// The panes the search visits, in order, and the pose that puts each square
	// to camera. The last is the answer.
	let searchOrder = [];
	let searchQuats = [];
	let searchFrom = new THREE.Quaternion();
	let measured = false;
	// One-shot latches. A `if (progress < 0.02)` test is not one: at any normal
	// frame rate a short window advances further than that in a single frame and
	// the branch is stepped straight over.
	let searchLatched = false;
	let zoomLatched = false;
	// The frustum the fall starts from — see refocus() at the latch below.
	let zoomFrom = 0;

	// Which decade the search is looking at, so anything tinted by era can
	// follow it. Only republished when it changes.
	let facing = null;

	let t = 0;

	// ── Build ────────────────────────────────────────────────────────────────
	export async function init() {
		decadeAssignments = assignDecades(paneConfigs.length);
		ready = true;
		await tick();
		panes.forEach((p) => p && p.init());
		panes.forEach((p) => p && p.updateProjection(0));
	}

	// The rooms only exist after init, so the answer and its landing pose are
	// measured on first entry rather than at build time.
	function measure() {
		const want = get(decade);
		const candidates = [];
		panes.forEach((p, i) => {
			if (p && p.getRoom && p.getRoom()) candidates.push({ i, d: decadeAssignments[i] });
		});
		if (!candidates.length) return;
		const preferred = candidates.filter((c) => c.d === want);
		const pool = preferred.length ? preferred : candidates;
		target = shuffle(pool)[0].i;
		searchOrder = [...previsits(candidates), target];
		// Every turn lands square. The answer's is the last of them, and what makes
		// it the arrival is the fall that follows it, not a different attitude.
		searchQuats = searchOrder.map((i) => landingQuatFor(i));
		measured = true;
	}

	// A few DISTINCT decades to visit before the answer — one pane per decade,
	// shuffled, and never the answer's own.
	function previsits(candidates) {
		const byDecade = {};
		candidates.forEach(({ i, d }) => {
			if (!byDecade[d]) byDecade[d] = [];
			byDecade[d].push(i);
		});
		return shuffle(Object.keys(byDecade))
			.map((d) => byDecade[d][0])
			.filter((i) => i !== target)
			.slice(0, Math.max(0, T.searchSteps - 1));
	}

	// Scratch for handing the frame's attitude to the backdrop shader as a mat3,
	// and for the survey's own turn.
	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();
	const SURVEY_E = new THREE.Euler();
	const SURVEY_Q = new THREE.Quaternion();
	const TAU = Math.PI * 2;

	// The rotation that puts a pane's artwork square to the camera.
	function landingQuatFor(i) {
		const room = panes[i]?.getRoom?.();
		if (!room?.localFrame) return new THREE.Quaternion();
		const { right, up, normal } = room.localFrame();
		const mLocal = new THREE.Matrix4().makeBasis(right, up, normal);
		const camDir = new THREE.Vector3(0, 0, 1);
		const upT = new THREE.Vector3(0, 1, 0);
		const rightT = new THREE.Vector3().crossVectors(upT, camDir).normalize();
		const upT2 = new THREE.Vector3().crossVectors(camDir, rightT).normalize();
		const mTarget = new THREE.Matrix4().makeBasis(rightT, upT2, camDir);
		return new THREE.Quaternion().setFromRotationMatrix(mTarget.multiply(mLocal.transpose()));
	}

	// Where the answer's BACK WALL sits, in world z, at the pose the search has
	// just locked it into. Two offsets, and both of them matter on a lens:
	//
	//   the pane is `reach` out along its own axis, and at the landing pose that
	//   axis points at the camera, so the whole of it is depth;
	//
	//   and the room's artwork is hung BEHIND the pane — the back wall by the
	//   full ICOSA.roomDepth (RoomProjection: `back = -n * depth * maxDepth`).
	//
	// Framing at the pane's plane and not the wall's leaves the room a quarter
	// too small, which is where the black border round it came from. Under the
	// orthographic camera this file used to have, neither offset mattered at all.
	function landingDepth() {
		const reach = get(aspect) === 'portrait' ? ICOSA.paneReachPortrait : ICOSA.paneReach;
		const c = paneConfigs[target];
		if (!c) return 0;
		return (
			c.axis
				.clone()
				.multiplyScalar(reach * c.direction)
				.applyQuaternion(world.frame.quaternion).z - ICOSA.roomDepth
		);
	}

	// How much the room's own artwork fills the frame when the camera is on it.
	// It COVERS: the room is the last thing in the run and it goes edge to edge,
	// with no void showing round it. So the measure is the back wall's real size
	// — which overflows the golden rectangle on one axis, because it is a cover
	// layer — rather than the rectangle's, and there is no safety gap.
	function landingFrustum() {
		const room = panes[target]?.getRoom?.();
		const a = window.innerWidth / window.innerHeight;
		const cover = room?.coverExtent?.();
		if (cover) return Math.min(cover.h, cover.w / a) * 0.995;
		if (!room?.localFrame) return 8;
		const { W, H } = room.localFrame();
		return Math.min(H, W / a) * 0.98;
	}

	function publishMonitor() {
		const room = panes[target]?.getRoom?.();
		if (!room?.screenRect) return monitorRect.set(null);
		monitorRect.set(room.screenRect(world.camera, window.innerWidth, window.innerHeight));
	}

	// ── Run ──────────────────────────────────────────────────────────────────
	export function enter() {
		t = 0;
		// camTo still belongs to the RETURN flight, which trucks the camera onto
		// the room's monitor glass. It is only the pointer parallax that has gone.
		camTo.set(0, 0, 0);
		measured = false;
		searchLatched = false;
		zoomLatched = false;
		facing = null;
		// Picks up exactly where the conception left off and carries on pulling
		// back. NOT at conceptionFrustum: the conception spends its last six
		// hundred milliseconds already opening the frame, so the state to open on
		// is that curve at PULL.before, not its start. Entering on the unpulled
		// value would draw one frame of the camera snapping back in.
		from = conceptionFrustum(window.innerWidth, window.innerHeight);
		rest = restFrustum(window.innerWidth, window.innerHeight);
		frustum = lerp(from, rest, pullAmount(PULL.before));
		world.applyFrustum(frustum);
		world.setPanesVisible(true);
		panes.forEach((pane) => pane && pane.setOutline(0));
		world.setLineOpacity(1);
		world.setGrow(1);
		world.setSpokes(1);
		world.setCage(0);
		// The rim picks up exactly where the conception left it and thins away
		// from there. The frame is NOT touched: what turns here is the same
		// wireframe that just drew itself, at the same weight.
		world.egg.setShell(ICOSA.shellSolid);
		world.egg.group.scale.setScalar(1);
		// AND SO IS THE FIELD, which is the whole of what this scene inherits.
		// It used to be carried by nothing but uniform state left behind by the
		// conception, so the scene was not a function of its own progress: run
		// into from scene 3 it drew the icosahedral field across the core, and
		// entered by a ?at= seek or the dev jump — after lattice.reset() has
		// zeroed those uniforms — it drew a bare unmarked ball. Two different
		// pictures at the same progress, and the seek is what every contact sheet
		// of this scene was taken with.
		//
		// The numbers come from SCENES.conception, which is where the other side
		// of the hand-over reaches them, so the two cannot drift apart.
		world.egg.setWave({
			furrow: 1,
			lobe: 1,
			chop: 0,
			glow: SCENES.conception.handoverGlow,
			amp: 0,
			ring: 0,
			// The same pair the conception ends on, not an equivalent picture
			// reached another way: grain still at full, and the front past the
			// limb so none of it is drawn. Restated rather than inherited, so a
			// ?at= seek into this scene draws what a run through it draws.
			grain: 1,
			front: SCENES.conception.frontTo
		});
		// The camera's range belongs to applyFrustum now; only the truck is ours.
		world.camera.position.x = ICOSA.camPos[0];
		world.camera.position.y = ICOSA.camPos[1];
		world.setFov(ICOSA.fov);
		world.setFocus(0);
		fieldFade.set(1);
		monitorRect.set(null);
		panes.forEach((p) => {
			if (!p) return;
			p.setDim(1);
			p.setLineDim(1);
			p.setDraft(0);
			p.setReveal(0);
			p.updateProjection(0);
		});
	}

	export function update(dt) {
		if (!ready) return false;
		if (!measured) measure();

		t += dt;
		world.tick(dt);
		const p = clamp01(t / T.duration);

		// ── The camera pulls back ────────────────────────────────────────────
		// Only while the panes are coming out; after that the frustum belongs to
		// the zoom, and to the return zoom after that. The search leans in a
		// little on each decade it stops at — see `push` below — so the frustum is
		// worked out here and applied once the search has had its say.
		const zoom = span(p, T.zoom);
		// The raster goes out with the fall — see components/Glass.svelte.
		landing.set(easeInOutCubic(zoom));
		// ONE CURVE, TWO SCENES. The retreat began in the conception's last
		// six hundred milliseconds and this is the rest of it, asked for by the
		// same function on the same clock — see PULL in config/timing.js. At
		// t = 0 this evaluates to exactly what the conception evaluated at its
		// final frame, which is what keeps the hand-over one frame rather than
		// a camera that stops dead on the cut and starts again.
		const pulled = lerp(from, rest, pullAmount(PULL.before + t));

		// ── The panes come out ───────────────────────────────────────────────
		// Working first, artwork second, working away third.
		// Drawn first, inside the solid, then travelling.
		const drawn = smootherstep(span(p, T.rects));
		const open = easeInOutCubic(span(p, T.open));
		const draft = span(p, T.schematic) * (1 - smoothstep(T.draftOut[0], T.draftOut[1], p) * 0.78);
		const reveal = easeInOutCubic(span(p, T.rooms));
		panes.forEach((pane) => {
			if (!pane) return;
			pane.setOutline(drawn);
			pane.updateProjection(open);
			pane.setDraft(draft);
			pane.setReveal(reveal);
		});

		// The cage the search happens inside.
		world.setCage(
			smoothstep(0, 1, span(p, T.cageIn)) *
				T.cagePeak *
				(zoom > 0 ? 1 - smoothstep(0, 0.4, zoom) : 1)
		);

		// The sphere stays — it is what the frame is held inside — but it thins so
		// the artwork is not seen through a wash, and it opens out off the frame
		// it was skin-tight on, so the rooms come THROUGH it rather than out from
		// under it. The frame itself is not touched: the same weight the
		// conception drew it at, all the way to the fall.
		const thin = easeInOutCubic(span(p, T.shellThin));
		world.egg.setShell(lerp(ICOSA.shellSolid, ICOSA.shellFaint, thin));
		// AND THE FIELD DOES NOT THIN. It is the one object in the run with any
		// history in it — the frame, the six rooms and the drafting all hang
		// inside the thing that was the ovum ten seconds ago — and every version
		// of this that faded it, to a ghost or to nothing, threw that away. It is
		// held at exactly the weight the conception hands over, for the whole
		// scene, and it is told explicitly not to occlude rather than being kept
		// under a threshold to stop it (see egg.setCore).
		world.egg.setCore(SCENES.conception.handoverCore, false);
		world.setCorners(1 - thin);
		// AND THE SPHERE IS NOT TOUCHED. It used to open out to 1.35 here while
		// the frame it is the circumsphere OF stayed at 1 — so the two things that
		// are one object visibly came apart, the sphere swelling and the
		// icosahedron inside it not. It is a child of the frame now (see
		// world/lattice.js) and shares its scale and its attitude, which is also
		// why it turns with the search instead of sitting still through it.

		// ── The survey ───────────────────────────────────────────────────────
		// The assembly, whole, turning, on an opening lens — before a single
		// decade is chosen. It hands the search whatever attitude it finishes on;
		// the search latches its own start pose, so nothing has to be handed back.
		const sv = span(p, T.survey);
		if (sv > 0 && sv < 1) {
			const k = smootherstep(sv);
			// A LOOK ROUND AND BACK, and it lands exactly where it started. The yaw
			// is a full sine — out one way, through the rest pose, out the other,
			// home — rather than a single swing to nowhere, which is both livelier
			// and, more to the point, ends the beat FLAT AND FACING instead of on
			// some arbitrary oblique the search then has to un-do.
			SURVEY_E.set(-T.surveyTilt * Math.sin(k * Math.PI), T.surveyTurn * Math.sin(k * TAU), 0);
			// PRE-multiplied, so the yaw is about the WORLD's up axis: it reads as
			// walking round the thing rather than as the thing spinning on a spit.
			world.frame.quaternion.copy(SURVEY_Q.setFromEuler(SURVEY_E)).multiply(world.tilt);
			// The dolly zoom. Out and back, so the search starts on the technical
			// lens the rest of the scene is drawn with. Half of it on a phone: the
			// same lens on a frame a third as wide puts the near room through the
			// screen.
			const wide = get(aspect) === 'portrait' ? (ICOSA.fov + ICOSA.fovWide) / 2 : ICOSA.fovWide;
			world.setFov(lerp(ICOSA.fov, wide, bump(sv)));
		}

		// ── The search ───────────────────────────────────────────────────────
		// One slot per decade visited. Most of a slot is the turn onto that
		// decade; the rest is the HOLD, during which the other rooms step back so
		// the artwork this exists to show is what you are seeing. The last slot is
		// all turn, because the fall follows it straight away.
		const u = span(p, T.search);
		if (u > 0 && measured && searchQuats.length) {
			if (!searchLatched) {
				searchLatched = true;
				searchFrom.copy(world.frame.quaternion);
			}
			const n = searchQuats.length;
			const step = Math.min(Math.floor(u * n), n - 1);
			const local = u * n - step;
			const last = step === n - 1;

			const turn = easeInOutPower(last ? local : clamp01(local / T.searchSpin), T.searchEase);
			const from = step === 0 ? searchFrom : searchQuats[step - 1];
			const to = searchQuats[step];

			// The direct arc, which is the shortest rotation carrying one pose to
			// the other, taken firmly and stopped dead.
			world.frame.quaternion.copy(from).slerp(to, turn);

			// NOTHING FADES ON THE BEAT. The other five used to step back on every
			// decade the machine stopped at, and it is clutter: six rooms flickering
			// at each other for four beats running reads as a slideshow with a
			// transition, not as an instrument holding still. The turn is the whole
			// event. Everything stays exactly as bright as it was.
			const d = decadeAssignments[searchOrder[step]] ?? null;
			if (d !== facing) {
				facing = d;
				fieldDecade.set(d);
			}
		}

		// And now the frustum. The search does not touch it: see the note above.
		if (zoom <= 0) {
			frustum = pulled;
			world.applyFrustum(frustum);
		}

		// The backdrop turns with the solid. Same attitude, same coordinates — the
		// field behind the scene is carried by the thing in front of it rather
		// than sitting still behind it. See three/shaders/index.js (uRot).
		ROT4.makeRotationFromQuaternion(world.frame.quaternion);
		fieldRotation.set(ROT3.setFromMatrix4(ROT4).elements);

		// ── The fall into the room ───────────────────────────────────────────
		if (zoom > 0) {
			if (!zoomLatched) {
				zoomLatched = true;
				landFrustum = landingFrustum();
				// The answer's pane is several units off the origin, and at the
				// landing pose it is square to the camera — so that offset is pure
				// depth. Frame the fall AT that plane or it lands at the wrong size.
				//
				// REFOCUS, NOT SETFOCUS. Moving the focus plane moves the camera by
				// the same amount (applyFrustum parks it at focus + d), so setting
				// it here stepped the camera three and a half units back between one
				// frame and the next: the target room held still, being what was
				// newly focused, and the solid and the other five rooms all shrank
				// about five percent at once. refocus() re-expresses the SAME
				// framing against the new plane and hands back the number to fall
				// from, so this frame is identical to the one before it.
				zoomFrom = world.refocus(rest, landingDepth());
			}
			// ONE symmetric ease, on the whole scene, and nothing in it staggered.
			const z = easeInOutCubic(zoom);
			frustum = lerp(zoomFrom, landFrustum, z);
			world.applyFrustum(frustum);

			// Everything that is not the answer gets out of the way.
			const fade = 1 - smoothstep(0.1, 0.75, z);
			world.setLineOpacity(fade);
			world.egg.setShell(ICOSA.shellFaint * (1 - smoothstep(0, 0.4, z)));
			// The shell the whole run has been inside goes with it, on the way into
			// the room. It is the last thing of the machine to leave, and the only
			// place in the run where it is allowed to.
			world.egg.setCore(SCENES.conception.handoverCore * (1 - smoothstep(0, 0.35, z)), false);
			panes.forEach((pane, i) => {
				if (!pane) return;
				if (i === target) pane.setLineDim(1 - smoothstep(0.15, 0.7, z));
				else pane.setDim(fade);
			});
			// And the room does NOT come apart on the way in. Its layers used to
			// separate in depth as the camera fell — the bed first, then the desk,
			// then the screen — which is a nice effect and the wrong one: it pulls
			// the room to pieces at the exact moment it is supposed to become a
			// place. It goes in flat, as one thing.
			panes[target]?.getRoom?.()?.setZoomProgress?.(0);
			flare.set(1 - smoothstep(0.05, 0.6, z));
			publishMonitor();
		} else {
			flare.set(smoothstep(T.flare[0], T.flare[1], p));
		}

		if (t >= T.duration) {
			publishMonitor();
			flare.set(0);
			fieldDecade.set(null);
			return true;
		}
		return false;
	}

	export function backdrop() {
		// The blueprint field — three/shaders/grid.js — ruled in the same
		// coordinates the frame is turning in, which is what the fieldRotation
		// written above is for.
		return { color: VOID, shader: 'grid' };
	}

	// ── The way back ────────────────────────────────────────────────────────
	// "Calculate again" is ONE move, and the camera makes all of it: it flies
	// into the room's monitor while the calculator is painted into that same
	// glass. The calculator does not zoom — it just tracks the rect this
	// republishes — so there is no second move to drift out of step with.
	//
	// Getting there needs both halves of a dolly-zoom onto the glass:
	//
	//   POSITION  the monitor is somewhere in a bedroom, not in the middle of
	//             the frame. Zooming on the frustum alone drives into the centre
	//             of the room and leaves the monitor sliding off the edge, which
	//             is what made this read as two separate zooms. The camera is
	//             axis-aligned and looks down -Z, and applyFrustum never re-aims
	//             it, so centring the glass is a truck in x and y.
	//
	//   FRUSTUM   far enough in that the glass covers the viewport in BOTH
	//             directions. The frustum is a height, so matching only the
	//             height leaves the calculator to make up the rest with a scale
	//             of its own; the tighter of the two ratios is the one to use.
	const RETURN_DUR = SCENES.calculator.arrive;
	let rt = 0;
	let returnFrom = 0;
	let returnTo = 0;
	let focusFrom = 0;
	let focusTo = 0;
	const camFrom = new THREE.Vector3();
	const camTo = new THREE.Vector3();

	export function beginReturn() {
		if (!get(monitorRect)) return;
		rt = 0;
		handedOver = false;
		returnFrom = frustum;
		focusFrom = landingDepth();
		focusTo = focusFrom;
		camFrom.copy(world.camera.position);
		const room = panes[target]?.getRoom?.();
		// If the glass cannot be located the zoom still runs, just not centred —
		// better than a calculator that never leaves the monitor.
		const centre = room?.glassCentre?.();
		camTo.copy(centre ?? camFrom);
		if (centre) focusTo = centre.z;

		// And it stops SHORT of filling the frame. RETURN_FILL is how much of the
		// viewport the glass ends up covering — under one, so the bedroom is still
		// round the machine when it gets there, which is where the next run is
		// operated from. config/layout.js.
		//
		// Worked out from the glass's REAL SIZE, not from how big it currently
		// looks. Predicting the framing from its on-screen size is right under an
		// orthographic camera and wrong under a lens — the glass hangs in front of
		// the plane being framed, so it grows faster than the frustum shrinks and
		// the flight lands about twice as far in as asked. Framed at the glass's
		// own plane, with the glass's own extent, the sum is exact.
		const g = room?.glassExtent?.();
		const a = window.innerWidth / window.innerHeight;
		returnTo = g
			? Math.max(Math.min(g.h, g.w / a) / RETURN_FILL, 0.05)
			: Math.max(frustum * 0.3, 0.05);
	}

	// Latched, because the step below clamps at RETURN_DUR and would otherwise
	// hand the run over on every frame after it.
	let handedOver = false;

	export function stepReturn(dt) {
		if (!returnFrom) return;
		rt = Math.min(rt + dt, RETURN_DUR);
		// The one easing in the move. The calculator has none of its own.
		const k = easeInOutPower(rt / RETURN_DUR, 1.9);
		frustum = lerp(returnFrom, returnTo, k);
		world.camera.position.x = lerp(camFrom.x, camTo.x, k);
		world.camera.position.y = lerp(camFrom.y, camTo.y, k);
		// The focus walks from the room's back wall onto the glass, so the frame is
		// measured at whatever it is actually flying at.
		world.setFocus(lerp(focusFrom, focusTo, k));
		world.applyFrustum(frustum);
		publishMonitor();

		// THROUGH the glass. At RETURN_FILL 1.0 the monitor covers the viewport
		// exactly, and what is on it is black — the CRT is off. The tunnel behind
		// the next run is the same black, so the hand-over is not covered, it is
		// simply invisible: the room's screen fills the frame and the frame is
		// already the fly-in. See director.settled().
		if (!handedOver && rt >= RETURN_DUR) {
			handedOver = true;
			settled();
		}
	}

	// ── The room, being sat in front of ─────────────────────────────────────
	// The parallax you get at a desk, and nothing more than that. The CAMERA does
	// not move — trucking it swings the nearest layers hardest, which is how six
	// flat panes ended up sliding around in front of each other — and instead the
	// room's own back drifts against its front, weighted by depth. See
	// RoomProjection.setHead(), which is where the direction is argued.
	//
	// Eased hard, so it is a drift rather than a cursor-tracking gimmick, and it
	// republishes the glass rect because the returning calculator is welded to it.
	const HEAD_EASE = 2.2;
	let hx = 0;
	let hy = 0;

	export function parallax(nx, ny, dt) {
		const k = Math.min(1, dt * HEAD_EASE);
		hx += (nx - hx) * k;
		hy += (-ny - hy) * k;
		const room = panes[target]?.getRoom?.();
		if (!room?.setHead) return;
		room.setHead(hx, hy);
		publishMonitor();
	}

	export function render(r) {
		world.render(r);
	}

	export function remeasureMonitor() {
		if (measured) publishMonitor();
	}

	export function resize() {
		from = conceptionFrustum(window.innerWidth, window.innerHeight);
		rest = restFrustum(window.innerWidth, window.innerHeight);
		world.applyFrustum(frustum);
		panes.forEach((pane) => pane && pane.setPortrait(get(aspect) === 'portrait'));
	}

	// Jump to a fraction of the scene's own duration, exactly. Everything here is
	// a pure function of progress, so the frame this draws IS the frame the run
	// would have drawn at that moment. Used by the ?at= scrub — config/dev.js.
	export function seek(v) {
		t = v * T.duration;
		update(0);
	}

	export function reset() {
		t = 0;
		measured = false;
		searchLatched = false;
		zoomLatched = false;
		target = -1;
		searchOrder = [];
		searchQuats = [];
		rt = 0;
		returnFrom = 0;
		frustum = rest;
		fieldDecade.set(null);
		monitorRect.set(null);
		panes.forEach((pane) => {
			if (!pane) return;
			pane.setDim(1);
			pane.setLineDim(1);
			pane.setDraft(0);
			pane.setReveal(0);
			pane.updateProjection(0);
		});
	}

	export function dispose() {
		panes.forEach((pane) => pane && pane.dispose());
	}
</script>

{#if ready}
	{#each paneConfigs as config, i}
		<GoldenRectangle
			bind:this={panes[i]}
			group={world.paneGroup}
			axis={config.axis}
			direction={config.direction}
			vertices={VERTICES}
			indices={config.indices}
			decadeKey={decadeAssignments[i]}
			portrait={$aspect === 'portrait'}
			{renderer}
		/>
	{/each}
{/if}
