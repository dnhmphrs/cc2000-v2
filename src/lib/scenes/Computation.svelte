<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import { get } from 'svelte/store';
	import { decade, aspect, flare, fieldDecade, monitorRect, fieldRotation } from '$lib/store/store';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		smoothstep,
		easeInOutCubic,
		easeInOutPower,
		ICOSA,
		restFrustum,
		VOID
	} from '$lib/config';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
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
	// And it comes out as DRAFTING first. The rectangle, its dimension lines, its
	// ratio bar, its spiral — the machine's working — and only then do the rooms
	// fade up through it, and only then does the working step back. Three beats
	// where there used to be one bloom, and it is the difference between a
	// machine calculating and a slideshow.
	//
	// The search is stepped, not continuous: turn a decade to camera, look at it,
	// turn to the next, and the last turn lands on the answer. The point is not
	// to fake a search — it is that each turn shows another decade's artwork,
	// which is otherwise built and never seen.
	//
	// The intermediate turns hold an OBLIQUE attitude and only the answer's turn
	// comes square. Squaring up four times over spends the one move that should
	// mean "this is the one", and the rooms read better as faces of a solid than
	// as slides anyway.
	//
	// Each turn takes a CURVED route, not the shortest arc: a control pose off to
	// one side of the direct path, and two nested slerps tracing a quadratic
	// Bézier through it. The side alternates, so the frame swings one way and
	// then the other across the search instead of pivoting flatly four times.
	// Config: searchBow is how far it bows, searchEase how hard it accelerates
	// out of one decade and settles into the next.
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
	// What the pull-back is heading for. Measured on entry, because it depends on
	// the shape of the viewport.
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
		// Every turn but the last holds the oblique attitude. The answer is the
		// only one that comes square to the camera, so squaring up IS the arrival
		// rather than something that has already happened four times over.
		const last = searchOrder.length - 1;
		searchQuats = searchOrder.map((i, k) =>
			k === last ? landingQuatFor(i) : OBLIQUE.clone().multiply(landingQuatFor(i))
		);
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

	// Applied on top of a landing rotation, in world space, to knock it off
	// square by ICOSA.searchOblique.
	const OBLIQUE = new THREE.Quaternion().setFromEuler(new THREE.Euler(...ICOSA.searchOblique));

	// Scratch for handing the frame's attitude to the backdrop shader as a mat3.
	const ROT4 = new THREE.Matrix4();
	const ROT3 = new THREE.Matrix3();

	// Scratch for the curved route between decades. Reused rather than allocated,
	// because this runs every frame of the search.
	const BOW = new THREE.Quaternion();
	const via = new THREE.Quaternion();
	const legA = new THREE.Quaternion();
	const legB = new THREE.Quaternion();
	// Which way each turn bows. Four axes, so no two turns in a run arc the same.
	const BOW_AXES = [
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(1, 0, 0.3).normalize(),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(-0.5, 1, 0.3).normalize()
	];

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

	// How much the room's own artwork fills the frame when the camera is on it.
	function landingFrustum() {
		const room = panes[target]?.getRoom?.();
		const a = window.innerWidth / window.innerHeight;
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
		measured = false;
		searchLatched = false;
		zoomLatched = false;
		facing = null;
		// Picks up exactly where the conception left off — close on the solid —
		// and pulls back from there.
		frustum = ICOSA.conceptionFrustum;
		rest = restFrustum(window.innerWidth, window.innerHeight);
		world.applyFrustum(frustum);
		world.setPanesVisible(true);
		world.setLineOpacity(1);
		world.setGrow(1);
		world.setCage(0);
		world.construction.show(null);
		// The rim picks up exactly where the conception left it and thins away
		// from there. The frame is NOT touched: what turns here is the same
		// wireframe that just drew itself, at the same weight.
		world.egg.setCore(0);
		world.egg.setShell(ICOSA.shellSolid);
		world.egg.group.scale.setScalar(1);
		world.camera.position.set(...ICOSA.camPos);
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
		// the zoom, and to the return zoom after that.
		const zoom = span(p, T.zoom);
		if (zoom <= 0) {
			frustum = lerp(ICOSA.conceptionFrustum, rest, easeInOutCubic(span(p, T.pullBack)));
			world.applyFrustum(frustum);
		}

		// ── The panes come out ───────────────────────────────────────────────
		// Working first, artwork second, working away third.
		const open = easeInOutCubic(span(p, T.open));
		const draft = span(p, T.schematic) * (1 - smoothstep(T.draftOut[0], T.draftOut[1], p) * 0.78);
		const reveal = easeInOutCubic(span(p, T.rooms));
		panes.forEach((pane) => {
			if (!pane) return;
			pane.updateProjection(open);
			pane.setDraft(draft);
			pane.setReveal(reveal);
		});

		// The cage the search happens inside.
		world.setCage(
			smoothstep(0, 1, span(p, T.cageIn)) * (zoom > 0 ? 1 - smoothstep(0, 0.4, zoom) : 1)
		);

		// The sphere stays — it is what the frame is held inside — but it thins so
		// the artwork is not seen through a wash, and it opens out off the frame
		// it was skin-tight on, so the rooms come THROUGH it rather than out from
		// under it. The frame itself is not touched: the same weight the
		// conception drew it at, all the way to the fall.
		const thin = easeInOutCubic(span(p, T.shellThin));
		world.egg.setShell(lerp(ICOSA.shellSolid, ICOSA.shellFaint, thin));
		world.egg.group.scale.setScalar(
			lerp(1, ICOSA.sphereGrow, easeInOutCubic(span(p, T.sphereGrow)))
		);

		// ── The search ───────────────────────────────────────────────────────
		// One slot per decade visited. Most of a slot is the turn onto that
		// decade; the rest is the look, during which the other rooms step back
		// so the artwork this exists to show is what you are seeing. The last
		// slot is all turn, because the zoom follows it straight away.
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

			// The control pose: halfway along the direct arc, then rolled off it.
			BOW.setFromAxisAngle(BOW_AXES[step % BOW_AXES.length], T.searchBow * (step % 2 ? -1 : 1));
			via.copy(from).slerp(to, 0.5).premultiply(BOW);

			// Quadratic Bezier on the sphere of rotations. Both ends are still
			// exactly `from` and `to`; only the route between them is bent.
			legA.copy(from).slerp(via, turn);
			legB.copy(via).slerp(to, turn);
			world.frame.quaternion.copy(legA).slerp(legB, turn);

			const d = decadeAssignments[searchOrder[step]] ?? null;
			if (d !== facing) {
				facing = d;
				fieldDecade.set(d);
			}
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
			}
			// Accelerates away from rest, then eases onto the final frame.
			const z = easeInOutPower(zoom, T.zoomPower);
			frustum = lerp(ICOSA.frustum, landFrustum, z);
			world.applyFrustum(frustum);

			// Everything that is not the answer gets out of the way.
			const fade = 1 - smoothstep(0.1, 0.75, z);
			world.setLineOpacity(fade);
			world.egg.setShell(ICOSA.shellFaint * (1 - smoothstep(0, 0.4, z)));
			panes.forEach((pane, i) => {
				if (!pane) return;
				if (i === target) pane.setLineDim(1 - smoothstep(0.15, 0.7, z));
				else pane.setDim(fade);
			});
			// The depth parallax is a transient felt DURING the move — the bed
			// rushes past first, then the desk, then the screen — and relaxes so
			// the resting frame lands flat.
			panes[target]?.getRoom?.()?.setZoomProgress?.(Math.sin(z * Math.PI));
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
	const camFrom = new THREE.Vector3();
	const camTo = new THREE.Vector3();

	export function beginReturn() {
		const rect = get(monitorRect);
		if (!rect) return;
		rt = 0;
		returnFrom = frustum;
		camFrom.copy(world.camera.position);
		// If the glass cannot be located the zoom still runs, just not centred —
		// better than a calculator that never leaves the monitor.
		const centre = panes[target]?.getRoom?.()?.glassCentre?.();
		camTo.copy(centre ?? camFrom).setZ(camFrom.z);
		returnTo = Math.max(
			frustum * Math.min(rect.width / window.innerWidth, rect.height / window.innerHeight),
			0.05
		);
	}

	export function stepReturn(dt) {
		if (!returnFrom) return;
		rt = Math.min(rt + dt, RETURN_DUR);
		// The one easing in the move. The calculator has none of its own.
		const k = easeInOutPower(rt / RETURN_DUR, 1.9);
		frustum = lerp(returnFrom, returnTo, k);
		world.camera.position.x = lerp(camFrom.x, camTo.x, k);
		world.camera.position.y = lerp(camFrom.y, camTo.y, k);
		world.applyFrustum(frustum);
		publishMonitor();
	}

	export function render(r) {
		r.render(world.scene, world.camera);
	}

	export function remeasureMonitor() {
		if (measured) publishMonitor();
	}

	export function resize() {
		rest = restFrustum(window.innerWidth, window.innerHeight);
		world.applyFrustum(frustum);
		panes.forEach((pane) => pane && pane.setPortrait(get(aspect) === 'portrait'));
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
