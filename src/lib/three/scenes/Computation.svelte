<script>
	import { tick } from 'svelte';
	import * as THREE from 'three';
	import { decade, isPortrait, flare, fieldDecade, monitorRect } from '$lib/store/store';
	import { lerp, easeInOutCubic, clamp } from '$lib/functions/utils';
	import { assignDecades, shuffle } from '$lib/data/roomElements';
	import { accentHex } from '$lib/theme';
	import { get } from 'svelte/store';
	import GoldenRectangle from '../objects/GoldenRectangle.svelte';

	// ── Scene 3: the computation ─────────────────────────────────────────────
	// Everything from the icosahedron appearing to the room filling the screen:
	// the polyhedron, the golden-rectangle panes, the decade rooms inside them,
	// the search, and the landing zoom.
	//
	// Unlike the other two this one builds its own world — it has its own scene
	// and orthographic camera, and its own three steps (open → search → zoom)
	// which it sequences itself. The stage above only ever calls update(dt).

	export let renderer = null;

	// Live accent recolour of the wireframe.
	$: if (icoWireMat) icoWireMat.color.setHex($accentHex);

	let scene, camera;
	let ready = false;
	let rectangleComponents = [];
	let icoSolidMat, icoWireMat, icoSolidMesh, icoWireMesh;
	let portrait = false;
	let icoReveal = 0;

	const PHI = (1 + Math.sqrt(5)) / 2;
	const IDLE_FRUSTUM = 13;
	const LAND_FRUSTUM = 8; // fallback zoom if the room's size can't be measured
	let frustum = IDLE_FRUSTUM;

	// Fixed, face-on, orthographic, centred throughout. The 3D read comes from
	// the icosahedron's own orientation, never a camera move.
	const CAM_POS = new THREE.Vector3(0, 0, 14);
	const BASE_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.32, 0.55, 0));

	const OPEN_DUR = 1.2;
	const LAND_DUR = 1.5;
	// Turn to a decade, look at it, turn to the next — three of them, then the
	// answer. Each turn puts another decade's artwork square to the camera.
	const PREVISITS = 3;
	const STEP_SPIN = 0.7;
	const STEP_SCAN = 0.35;

	let stepStartQuat = new THREE.Quaternion();
	let stepTargetQuat = new THREE.Quaternion();
	let targetRoomIndex = -1;
	let searchOrder = [];
	let searchStep = 0;
	let searchSub = 'spin'; // 'spin' | 'scan'
	let subT = 0;
	let landFrustum = LAND_FRUSTUM;
	let idleAngle = 0;

	let worldGroup;

	const vertices = [
		[-1, PHI, 0],
		[1, PHI, 0],
		[-1, -PHI, 0],
		[1, -PHI, 0],
		[0, -1, PHI],
		[0, 1, PHI],
		[0, -1, -PHI],
		[0, 1, -PHI],
		[PHI, 0, -1],
		[PHI, 0, 1],
		[-PHI, 0, -1],
		[-PHI, 0, 1]
	];

	const faces = [
		[0, 11, 5],
		[0, 5, 1],
		[0, 1, 7],
		[0, 7, 10],
		[0, 10, 11],
		[1, 5, 9],
		[5, 11, 4],
		[11, 10, 2],
		[10, 7, 6],
		[7, 1, 8],
		[3, 9, 4],
		[3, 4, 2],
		[3, 2, 6],
		[3, 6, 8],
		[3, 8, 9],
		[4, 9, 5],
		[2, 4, 11],
		[6, 2, 10],
		[8, 6, 7],
		[9, 8, 1]
	];

	const edges = [
		[0, 1],
		[0, 5],
		[0, 7],
		[0, 10],
		[0, 11],
		[1, 5],
		[1, 7],
		[1, 8],
		[1, 9],
		[2, 3],
		[2, 4],
		[2, 6],
		[2, 10],
		[2, 11],
		[3, 4],
		[3, 6],
		[3, 8],
		[3, 9],
		[4, 5],
		[4, 9],
		[4, 11],
		[5, 9],
		[5, 11],
		[6, 7],
		[6, 8],
		[6, 10],
		[7, 8],
		[7, 10],
		[8, 9],
		[10, 11]
	];

	let decadeAssignments = ['50s', '60s', '90s', '10s', '50s', '60s'];

	const rectangleConfigs = [
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: 1 },
		{ indices: [0, 1, 3, 2], axis: new THREE.Vector3(0, 0, 1), plane: 'XY', direction: -1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: 1 },
		{ indices: [4, 5, 7, 6], axis: new THREE.Vector3(1, 0, 0), plane: 'YZ', direction: -1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: 1 },
		{ indices: [8, 9, 11, 10], axis: new THREE.Vector3(0, 1, 0), plane: 'XZ', direction: -1 }
	];

	const smoothstep = (a, b, x) => {
		const t = clamp((x - a) / (b - a), 0, 1);
		return t * t * (3 - 2 * t);
	};

	function applyFrustum(fr) {
		const aspect = window.innerWidth / window.innerHeight;
		camera.left = (-fr * aspect) / 2;
		camera.right = (fr * aspect) / 2;
		camera.top = fr / 2;
		camera.bottom = -fr / 2;
		camera.updateProjectionMatrix();
	}

	function buildIcosahedronMeshes(group) {
		const positions = [];
		faces.forEach(([a, b, c]) => {
			positions.push(...vertices[a], ...vertices[b], ...vertices[c]);
		});
		const solidGeo = new THREE.BufferGeometry();
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		solidGeo.computeVertexNormals();
		icoSolidMat = new THREE.MeshBasicMaterial({
			// Pre-convert to linear so the renderer's sRGB output encoding maps it
			// back to the true site ground (#0a246a) instead of gamma-lifting it.
			color: new THREE.Color(0x0a246a).convertSRGBToLinear(),
			transparent: true,
			opacity: 0,
			side: THREE.DoubleSide,
			depthWrite: true,
			// Push faces slightly back in depth so the wireframe always wins
			// (solid faceted look, no z-fighting on the shared edges).
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
		});
		icoSolidMesh = new THREE.Mesh(solidGeo, icoSolidMat);
		icoSolidMesh.visible = false;
		group.add(icoSolidMesh);

		const edgePositions = [];
		edges.forEach(([a, b]) => {
			edgePositions.push(...vertices[a], ...vertices[b]);
		});
		const wireGeo = new THREE.BufferGeometry();
		wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
		icoWireMat = new THREE.LineBasicMaterial({
			color: get(accentHex),
			transparent: true,
			opacity: 0
		});
		icoWireMesh = new THREE.LineSegments(wireGeo, icoWireMat);
		icoWireMesh.visible = false;
		group.add(icoWireMesh);
	}

	// ── Search / land ────────────────────────────────────────────────────────
	function pickDecadeRoom() {
		const want = get(decade);
		const candidates = [];
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (room) candidates.push({ i, decade: decadeAssignments[i] });
		});
		if (!candidates.length) return -1;
		const preferred = candidates.filter((c) => c.decade === want);
		const pool = preferred.length ? preferred : candidates;
		return pool[Math.floor(Math.random() * pool.length)].i;
	}

	function computeLandingQuat(i) {
		const comp = rectangleComponents[i];
		const room = comp && comp.getRoom && comp.getRoom();
		if (!room || !room.localFrame) return new THREE.Quaternion();
		const { right, up, normal } = room.localFrame();
		const mLocal = new THREE.Matrix4().makeBasis(right, up, normal);
		// Target: normal → camera direction, up → screen up (face-on).
		const camDir = new THREE.Vector3(0, 0, 1);
		const upT = new THREE.Vector3(0, 1, 0);
		const rightT = new THREE.Vector3().crossVectors(upT, camDir).normalize();
		const upT2 = new THREE.Vector3().crossVectors(camDir, rightT).normalize();
		const mTarget = new THREE.Matrix4().makeBasis(rightT, upT2, camDir);
		const mLocalInv = mLocal.clone().transpose();
		return new THREE.Quaternion().setFromRotationMatrix(mTarget.multiply(mLocalInv));
	}

	// A few distinct decades to visit before the answer, then the answer itself.
	// The point is not to fake a search — it is that each turn shows another
	// decade's artwork, which is otherwise built and never seen.
	function pickSearchOrder(target) {
		const byDecade = {};
		rectangleComponents.forEach((comp, i) => {
			const room = comp && comp.getRoom && comp.getRoom();
			if (!room) return;
			const d = decadeAssignments[i];
			if (!byDecade[d]) byDecade[d] = [];
			byDecade[d].push(i);
		});
		const previsits = shuffle(Object.keys(byDecade))
			.map((d) => byDecade[d][0])
			.filter((i) => i !== target)
			.slice(0, PREVISITS);
		return [...previsits, target];
	}

	function beginStepSpin(idx) {
		stepStartQuat.copy(worldGroup.quaternion);
		stepTargetQuat.copy(computeLandingQuat(idx));
		// The background takes this decade's colours as we turn toward it.
		fieldDecade.set(decadeAssignments[idx] ?? null);
		searchSub = 'spin';
		subT = 0;
	}

	function startSearch() {
		targetRoomIndex = pickDecadeRoom();
		searchOrder = pickSearchOrder(targetRoomIndex);
		searchStep = 0;
		beginStepSpin(searchOrder[0]);
	}

	// The decade is already facing camera (the final search spin put it there).
	// Now do a pure, dead-centre zoom until the room's artwork fills the screen —
	// no rotation, no orbit.
	function beginZoom() {
		const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
		const aspect = window.innerWidth / window.innerHeight;
		if (room && room.localFrame) {
			const { W, H } = room.localFrame();
			landFrustum = Math.min(H, W / aspect) * 0.98;
		} else {
			landFrustum = LAND_FRUSTUM;
		}
	}

	// Where the resolved room's monitor glass has landed on screen, so the result
	// can be drawn inside it rather than floating over the room.
	function publishMonitor() {
		const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
		if (!room || !room.screenRect) return monitorRect.set(null);
		monitorRect.set(room.screenRect(camera, window.innerWidth, window.innerHeight));
	}

	// ── Parent API ───────────────────────────────────────────────────────────
	export async function init() {
		scene = new THREE.Scene();
		const aspect = window.innerWidth / window.innerHeight;
		portrait = window.innerHeight > window.innerWidth;
		isPortrait.set(portrait);

		camera = new THREE.OrthographicCamera(
			(-frustum * aspect) / 2,
			(frustum * aspect) / 2,
			frustum / 2,
			-frustum / 2,
			0.1,
			100
		);
		camera.position.copy(CAM_POS);
		camera.up.set(0, 1, 0);
		camera.lookAt(0, 0, 0);

		decadeAssignments = assignDecades(rectangleConfigs.length);

		worldGroup = new THREE.Group();
		scene.add(worldGroup);
		worldGroup.quaternion.copy(BASE_TILT);
		buildIcosahedronMeshes(worldGroup);

		ready = true;
		await tick();
		rectangleComponents.forEach((comp) => comp && comp.init());
		rectangleComponents.forEach((comp) => comp && comp.updateProjection(0));
	}

	export function resize() {
		if (!camera) return;
		const p = window.innerHeight > window.innerWidth;
		isPortrait.set(p);
		if (p !== portrait) {
			portrait = p;
			rectangleComponents.forEach((comp) => comp && comp.setPortrait(p));
		}
		applyFrustum(frustum);
	}

	// Called on 'settled' and after a resize, so the result panel tracks the glass.
	export function remeasureMonitor() {
		publishMonitor();
	}

	export function reset() {
		step = 'open';
		stepT = 0;
		frustum = IDLE_FRUSTUM;
		icoReveal = 0;
		idleAngle = 0;
		targetRoomIndex = -1;
		fieldDecade.set(null);
		monitorRect.set(null);
		if (worldGroup) worldGroup.quaternion.copy(BASE_TILT);
		if (camera) {
			camera.position.copy(CAM_POS);
			camera.up.set(0, 1, 0);
			camera.lookAt(0, 0, 0);
			applyFrustum(frustum);
		}
		if (icoWireMat) icoWireMat.opacity = 0;
		if (icoSolidMat) icoSolidMat.opacity = 0;
		if (icoWireMesh) icoWireMesh.visible = false;
		if (icoSolidMesh) icoSolidMesh.visible = false;
		rectangleComponents.forEach((comp) => {
			if (!comp) return;
			comp.setDim(1);
			comp.setLineDim(1);
			const room = comp.getRoom && comp.getRoom();
			if (room && room.setZoomProgress) room.setZoomProgress(0);
			comp.updateProjection(0);
		});
	}

	function beginOpen() {
		// The polyhedron resolves out of nothing as the egg gives way.
		icoReveal = 0;
	}

	// ── The three steps, sequenced here ──────────────────────────────────────
	// open   → the polyhedron resolves and comes apart
	// search → turns through the decades, one at a time
	// zoom   → the resolved room fills the frame
	let step = 'open';
	let stepT = 0;

	export function enter() {
		step = 'open';
		stepT = 0;
		beginOpen();
	}

	export function update(dt) {
		stepT += dt;
		if (!runStep(dt, step, stepT)) return false;
		if (step === 'open') step = 'search';
		else if (step === 'search') step = 'zoom';
		else return true; // the zoom has landed; this is the end of the run
		stepT = 0;
		return false;
	}

	// The site is blue behind this one: clear transparent so the theta field
	// shows through.
	export function backdrop() {
		return { color: 0x0a246a, alpha: 0 };
	}

	// True on the frame the current step finishes.
	function runStep(dt, stage, stageT) {
		if (!camera) return false;
		let done = false;

		if (stage === 'open') {
			// Fades in ahead of the sperm, then comes apart.
			icoReveal = smoothstep(0.0, 0.45, stageT / OPEN_DUR);
			frustum = lerp(frustum, IDLE_FRUSTUM, Math.min(1, dt * 4));
			applyFrustum(frustum);
			idleAngle += dt * 0.2;
			worldGroup.quaternion
				.copy(BASE_TILT)
				.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, idleAngle, 0)));
			const raw = clamp(stageT / OPEN_DUR, 0, 1);
			rectangleComponents.forEach((comp) => comp && comp.updateProjection(easeInOutCubic(raw)));
			// The one moment the field is allowed on screen starts here.
			flare.set(smoothstep(0.0, 0.85, raw));
			if (stageT >= OPEN_DUR) {
				rectangleComponents.forEach((comp) => comp && comp.updateProjection(1));
				startSearch();
				done = true;
			}
		}

		if (stage === 'search') {
			icoReveal = 1;
			subT += dt;
			const isFinal = searchStep === searchOrder.length - 1;
			if (searchSub === 'spin') {
				const t = easeInOutCubic(clamp(subT / STEP_SPIN, 0, 1));
				worldGroup.quaternion.copy(stepStartQuat).slerp(stepTargetQuat, t);
				if (subT >= STEP_SPIN) {
					if (isFinal) {
						beginZoom();
						done = true;
					} else {
						searchSub = 'scan';
						subT = 0;
					}
				}
			} else {
				// Lean on the one being looked at; the others only step back, so the
				// artwork this exists to show stays visible.
				const pulse = Math.sin(clamp(subT / STEP_SCAN, 0, 1) * Math.PI);
				rectangleComponents.forEach((comp, i) => {
					if (!comp) return;
					comp.setDim(i === searchOrder[searchStep] ? 1 : lerp(1, 0.45, pulse));
				});
				if (subT >= STEP_SCAN) {
					rectangleComponents.forEach((comp) => comp && comp.setDim(1));
					searchStep += 1;
					beginStepSpin(searchOrder[searchStep]);
				}
			}
			flare.set(1);
		}

		if (stage === 'zoom') {
			const t = easeInOutCubic(clamp(stageT / LAND_DUR, 0, 1));
			frustum = lerp(IDLE_FRUSTUM, landFrustum, t);
			applyFrustum(frustum);
			// Fade the wireframe and the other rooms; keep the resolved room.
			const fade = 1 - smoothstep(0.1, 0.8, t);
			if (icoWireMat) icoWireMat.opacity = fade * icoReveal;
			if (icoSolidMat) icoSolidMat.opacity = fade * icoReveal;
			rectangleComponents.forEach((comp, i) => {
				if (!comp) return;
				if (i === targetRoomIndex) comp.setLineDim(lerp(1, 0, smoothstep(0.15, 0.7, t)));
				else comp.setDim(fade);
			});
			// Depth parallax surges as the room rushes in, then relaxes so the final
			// resting frame lands flat.
			const room = rectangleComponents[targetRoomIndex]?.getRoom?.();
			if (room && room.setZoomProgress) room.setZoomProgress(Math.sin(t * Math.PI));
			flare.set(1 - smoothstep(0.05, 0.6, t));
			if (stageT >= LAND_DUR) {
				publishMonitor();
				flare.set(0);
				fieldDecade.set(null);
				done = true;
			}
		}

		// Wireframe opacity (except when the zoom is driving its fade).
		if (stage !== 'zoom') {
			if (icoWireMat) icoWireMat.opacity = icoReveal;
			// Solid faces are opaque site ground so the polyhedron reads as a clean
			// dark solid, not a translucent wash over the background.
			if (icoSolidMat) icoSolidMat.opacity = icoReveal;
		}

		// Hidden outright until the open brings it in — a transparent material at
		// opacity 0 still writes depth, which would occlude the rooms behind it.
		const on = (icoWireMat?.opacity ?? 0) > 0.002;
		if (icoWireMesh) icoWireMesh.visible = on;
		if (icoSolidMesh) icoSolidMesh.visible = on;

		return done;
	}

	export function render(r) {
		if (!scene || !camera) return;
		r.render(scene, camera);
	}

	export function dispose() {
		rectangleComponents.forEach((comp) => comp && comp.dispose());
	}
</script>

{#if ready}
	{#each rectangleConfigs as config, i}
		<GoldenRectangle
			bind:this={rectangleComponents[i]}
			group={worldGroup}
			axis={config.axis}
			direction={config.direction}
			{vertices}
			indices={config.indices}
			decadeKey={decadeAssignments[i]}
			{portrait}
			{renderer}
		/>
	{/each}
{/if}
