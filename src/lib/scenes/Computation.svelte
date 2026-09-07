<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import { get } from 'svelte/store';
	import { decade, aspect, flare, fieldDecade, monitorRect, noise } from '$lib/store/store';
	import {
		SCENES,
		span,
		lerp,
		clamp01,
		smoothstep,
		easeInOutCubic,
		easeInOutPower,
		bump,
		ICOSA,
		NOISE,
		WHITE
	} from '$lib/config';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
	import GoldenRectangle from '$lib/three/objects/GoldenRectangle.svelte';
	import { RECTANGLES, VERTICES } from '$lib/three/geometry/icosahedron';

	// ── Scene 4: the computation ─────────────────────────────────────────────
	// The panes come out of the sphere, the whole thing tumbles through the
	// decades, it settles on the answer, and the camera falls into that room.
	//
	// The tumble is ONE continuous motion, not a sequence of turns and pauses.
	// Two axes turning at incommensurate rates plus a slow wobble is what makes
	// it kanter rather than spin like a turntable, and panes lean out toward the
	// viewer as they swing past the front so each decade gets its moment without
	// the camera ever stopping.
	//
	// Like the conception, every value here is a pure function of scene progress
	// — nothing integrates dt — so the scene can be reset or re-entered without
	// drifting. The one exception is the landing quaternion, which is measured
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
	let landingQuat = new THREE.Quaternion();
	let tumbleStartQuat = new THREE.Quaternion();
	let measured = false;
	// One-shot latches. A `if (progress < 0.02)` test is not one: at any normal
	// frame rate a short window advances further than that in a single frame and
	// the branch is stepped straight over.
	let settleLatched = false;
	let zoomLatched = false;

	// Which decade is facing front right now, so anything tinted by era can
	// follow the tumble. Only recomputed when it changes.
	let facing = null;

	let t = 0;
	const q = new THREE.Quaternion();
	const e = new THREE.Euler();

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
		landingQuat = landingQuatFor(target);
		measured = true;
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
		settleLatched = false;
		zoomLatched = false;
		facing = null;
		frustum = ICOSA.frustum;
		world.applyFrustum(frustum);
		// The conception left the frame on ICOSA.tilt; the tumble starts there.
		tumbleStartQuat.copy(world.frame.quaternion);
		world.setPanesVisible(true);
		world.setSolid(1);
		monitorRect.set(null);
		noise.set(NOISE.calm);
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
		// Each pane leans further out as it swings past the front, so a decade
		// presents itself without the tumble ever pausing.
		const bulgeAmt = T.passBulge * bump(span(p, T.tumble));
		panes.forEach((pane, i) => {
			if (!pane) return;
			pane.updateProjection(open * (1 + bulgeAmt * frontness(i)));
		});

		// The sphere draws in behind them and stays as a bubble.
		const drawIn = easeInOutCubic(span(p, T.shellDrawIn));
		world.egg.setCore(1 - drawIn);
		world.egg.group.scale.setScalar(lerp(1, ICOSA.shellSettled, drawIn));
		world.egg.setShell(lerp(1, ICOSA.shellFaint, drawIn));
		// The wireframe is the solid's now; the conception's line-work fades.
		world.setLineOpacity(1 - drawIn * 0.75);

		// ── The tumble ───────────────────────────────────────────────────────
		const spin = span(p, T.tumble);
		const settle = span(p, T.settle);
		if (settle <= 0) {
			// Three incommensurate rates, so it never repeats a pose.
			const a = spin * T.tumbleTurns * Math.PI * 2;
			e.set(Math.sin(a * T.tumbleWobble) * 0.5, a, Math.sin(a * T.tumbleKanter) * 0.42);
			world.frame.quaternion.copy(tumbleStartQuat).multiply(q.setFromEuler(e));
			trackFacing();
		} else if (measured) {
			// It stops tumbling by sliding, not stopping: whatever pose the tumble
			// was in when the window opened slerps onto the answer.
			if (!settleLatched) {
				settleLatched = true;
				tumbleStartQuat.copy(world.frame.quaternion);
			}
			world.frame.quaternion.copy(tumbleStartQuat).slerp(landingQuat, easeInOutCubic(settle));
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
			world.setSolid(fade);
			world.setLineOpacity(fade * 0.25);
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

		noise.set(NOISE.calm);

		if (t >= T.duration) {
			publishMonitor();
			flare.set(0);
			fieldDecade.set(null);
			return true;
		}
		return false;
	}

	// How square-on a pane is to the camera right now, 0..1. Drives the lean.
	const paneNormal = new THREE.Vector3();
	function frontness(i) {
		const cfg = paneConfigs[i];
		paneNormal.copy(cfg.axis).multiplyScalar(cfg.direction).applyQuaternion(world.frame.quaternion);
		return Math.max(0, paneNormal.z);
	}

	function trackFacing() {
		let best = -1;
		let bestF = 0;
		panes.forEach((_, i) => {
			const f = frontness(i);
			if (f > bestF) {
				bestF = f;
				best = i;
			}
		});
		const d = decadeAssignments[best] ?? null;
		if (d !== facing) {
			facing = d;
			fieldDecade.set(d);
		}
	}

	export function backdrop() {
		return { color: WHITE, alpha: 1 };
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
		settleLatched = false;
		zoomLatched = false;
		target = -1;
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
