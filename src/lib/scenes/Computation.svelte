<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import { get } from 'svelte/store';
	import { decade, aspect, flare, fieldDecade, monitorRect } from '$lib/store/store';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		smoothstep,
		easeInOutCubic,
		easeInOutPower,
		ICOSA,
		WHITE
	} from '$lib/config';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
	import GoldenRectangle from '$lib/three/objects/GoldenRectangle.svelte';
	import { RECTANGLES, VERTICES } from '$lib/three/geometry/icosahedron';

	// ── Scene 4: the computation ─────────────────────────────────────────────
	// The panes come out of the sphere, the search turns through the decades,
	// and the camera falls into the room that holds the answer.
	//
	// The search is stepped, not continuous: turn a decade square to camera,
	// look at it, turn to the next, and the last turn lands on the answer. The
	// point is not to fake a search — it is that each turn shows another
	// decade's artwork, which is otherwise built and never seen.
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
		searchQuats = searchOrder.map(landingQuatFor);
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
		frustum = ICOSA.frustum;
		world.applyFrustum(frustum);
		world.setPanesVisible(true);
		world.setLineOpacity(1);
		// The sphere picks up exactly where the conception left it and shrinks
		// away from there. The frame is NOT touched: what turns here is the same
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
			p.updateProjection(0);
		});
	}

	export function update(dt) {
		if (!ready) return false;
		if (!measured) measure();

		t += dt;
		const p = clamp01(t / T.duration);

		// ── The panes come out ───────────────────────────────────────────────
		const open = easeInOutCubic(span(p, T.open));
		panes.forEach((pane) => pane && pane.updateProjection(open));

		// The sphere stays — it is what the frame is held inside, and losing it
		// would leave the rooms coming off a bare wireframe — but it thins so the
		// artwork is not seen through a wash. The frame is not touched: the same
		// weight the conception drew it at, all the way to the fall.
		const thin = easeInOutCubic(span(p, T.shellThin));
		world.egg.setShell(lerp(ICOSA.shellSolid, ICOSA.shellFaint, thin));

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

			const turn = easeInOutCubic(last ? local : clamp01(local / T.searchSpin));
			world.frame.quaternion
				.copy(step === 0 ? searchFrom : searchQuats[step - 1])
				.slerp(searchQuats[step], turn);

			const look = last
				? 0
				: Math.sin(clamp01((local - T.searchSpin) / (1 - T.searchSpin)) * Math.PI);
			panes.forEach((pane, i) => {
				if (pane) pane.setDim(i === searchOrder[step] ? 1 : lerp(1, T.searchDim, look));
			});

			const d = decadeAssignments[searchOrder[step]] ?? null;
			if (d !== facing) {
				facing = d;
				fieldDecade.set(d);
			}
		}

		// ── The fall into the room ───────────────────────────────────────────
		const zoom = span(p, T.zoom);
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
		return { color: WHITE, alpha: 1 };
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
		frustum = ICOSA.frustum;
		fieldDecade.set(null);
		monitorRect.set(null);
		panes.forEach((pane) => {
			if (!pane) return;
			pane.setDim(1);
			pane.setLineDim(1);
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
