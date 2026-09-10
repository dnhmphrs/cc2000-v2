<script>
	import { tick } from 'svelte';
	import { get } from 'svelte/store';
	import * as THREE from 'three';
	import { accentHex, ink } from '$lib/theme';
	import { ICOSA, ICOSA_INK } from '$lib/config';
	import { lineMaterial, segmentAttributes, grower } from '$lib/three/world/materials';
	import GoldenRectangleSchematic from './GoldenRectangleSchematic.svelte';
	import RoomProjection from './RoomProjection.svelte';

	// ── One golden rectangle, and the room behind it ─────────────────────────
	// Three layers on the same plane, in the order the computation brings them
	// up:
	//
	//   the OUTLINE     the rectangle itself, which at projection 0 lies exactly
	//                   on four of the icosahedron's own vertices
	//   the DRAFTING    the spiral, the subdivision squares, the traces back to
	//                   the solid — and, in the sibling component, the dimension
	//                   lines and the 1:phi bar, hung a half again FURTHER OUT
	//                   than the pane on the same axis. This is the machine
	//                   showing its working, and it is the whole reason the scene
	//                   reads as a computation rather than as a carousel. The
	//                   reach past the pane is what makes the whole thing an ARM
	//                   rather than a room with annotations on it —
	//                   ICOSA.schematicReach
	//   the ROOM        the decade diorama, which is the only thing in the second
	//                   half of the run with any colour in it
	//
	// They are driven SEPARATELY, from the computation's own timeline, rather
	// than all derived from the projection: the drafting comes out first and
	// alone, the artwork fades up through it, and then the drafting steps back so
	// it is not clutter over the one coloured thing on screen. Deriving all three
	// from one number is what made this an undifferentiated bloom before.

	// Live accent recolour of the rectangle. The drafting keeps its own quiet ink
	// whatever the accent does — it is a hierarchy, not one colour used twice.
	$: if (outlineMaterial) outlineMaterial.uniforms.uInk.value.copy(ink($accentHex));

	// Single group — everything lives here and rotates together
	export let group;
	export let axis;
	export let direction;
	export let vertices;
	export let indices;
	export let decadeKey = null;
	export let portrait = false;
	export let renderer = null;

	// A tall screen cannot take the full reach — see ICOSA.paneReachPortrait.
	// The reach is reactive, so everything placed against it has to be re-placed
	// when the viewport changes shape. Depending on PANE_REACH alone keeps this
	// out of a loop: reflow() writes lastProjection, which this block never reads.
	$: PANE_REACH = portrait ? ICOSA.paneReachPortrait : ICOSA.paneReach;
	$: reflow(PANE_REACH);
	function reflow() {
		if (rectangleGroup) updateProjection(lastProjection);
	}

	const ROOM_DEPTH = ICOSA.roomDepth;

	let rectangleGroup;
	let traceLines = [];
	let schematicComponent;
	let roomComponent;
	let basis = null;
	let dimFactor = 1; // fades everything (line-work + room)
	let lineDim = 1; // fades only the golden line-work
	let draft = 0; // the drafting layer's own level
	let lastProjection = 0;

	let outlineMaterial;
	let growOutline = () => {};
	let spiralMaterial;
	let subdivisionMaterials = [];
	let traceLineMaterials = [];

	function getRectCorners() {
		return indices.map((i) => new THREE.Vector3(...vertices[i]));
	}

	function getRectBasis() {
		const corners = getRectCorners();
		const edge1 = new THREE.Vector3().subVectors(corners[1], corners[0]);
		const edge2 = new THREE.Vector3().subVectors(corners[3], corners[0]);

		const len1 = edge1.length();
		const len2 = edge2.length();

		let uAxis, vAxis, uLen, vLen;
		if (len1 < len2) {
			uAxis = edge1.clone().normalize();
			vAxis = edge2.clone().normalize();
			uLen = len1;
			vLen = len2;
		} else {
			uAxis = edge2.clone().normalize();
			vAxis = edge1.clone().normalize();
			uLen = len2;
			vLen = len1;
		}

		const center = new THREE.Vector3()
			.add(corners[0])
			.add(corners[1])
			.add(corners[2])
			.add(corners[3])
			.multiplyScalar(0.25);

		return { center, uAxis, vAxis, uLen, vLen, corners };
	}

	function localToWorld(u, v) {
		return basis.center
			.clone()
			.add(basis.uAxis.clone().multiplyScalar(-u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	// The classical subdivision: chop the square off the golden rectangle and
	// what is left is another golden rectangle. Ten times over is well past
	// visible, which is the point — the spiral has to keep going somewhere.
	function computeGoldenRectangleData() {
		const squares = [];
		const arcCenters = [];

		let rect = {
			left: -basis.uLen / 2,
			right: basis.uLen / 2,
			bottom: -basis.vLen / 2,
			top: basis.vLen / 2
		};

		for (let i = 0; i < 10; i++) {
			const w = rect.right - rect.left;
			const h = rect.top - rect.bottom;
			if (w < 0.001 || h < 0.001) break;

			const side = Math.min(w, h);
			let square, arc;

			switch (i % 4) {
				case 0:
					square = {
						left: rect.left,
						right: rect.left + side,
						bottom: rect.bottom,
						top: rect.bottom + side
					};
					arc = { u: rect.left + side, v: rect.bottom + side, startAngle: Math.PI, dir: 0 };
					rect.bottom += side;
					break;
				case 1:
					square = {
						left: rect.left,
						right: rect.left + side,
						bottom: rect.top - side,
						top: rect.top
					};
					arc = { u: rect.left + side, v: rect.top - side, startAngle: Math.PI * 0.5, dir: 1 };
					rect.left += side;
					break;
				case 2:
					square = {
						left: rect.right - side,
						right: rect.right,
						bottom: rect.top - side,
						top: rect.top
					};
					arc = { u: rect.right - side, v: rect.top - side, startAngle: 0, dir: 2 };
					rect.top -= side;
					break;
				case 3:
					square = {
						left: rect.right - side,
						right: rect.right,
						bottom: rect.bottom,
						top: rect.bottom + side
					};
					arc = { u: rect.right - side, v: rect.bottom + side, startAngle: Math.PI * 1.5, dir: 3 };
					rect.right -= side;
					break;
			}

			squares.push(square);
			arcCenters.push({ ...arc, radius: side });
		}

		return { squares, arcCenters };
	}

	function createGoldenSpiral(arcCenters) {
		const spiralGroup = new THREE.Group();
		const pointsPerArc = 32;

		spiralMaterial = new THREE.LineBasicMaterial({
			color: ink(ICOSA_INK.draft),
			transparent: true,
			opacity: 0
		});

		for (const arc of arcCenters) {
			const arcPoints = [];
			for (let j = 0; j <= pointsPerArc; j++) {
				const t = j / pointsPerArc;
				const angle = arc.startAngle + t * (Math.PI / 2);
				arcPoints.push(
					localToWorld(arc.u + arc.radius * Math.cos(angle), arc.v + arc.radius * Math.sin(angle))
				);
			}
			spiralGroup.add(
				new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints), spiralMaterial)
			);
		}

		return spiralGroup;
	}

	function createSubdivisionLines(squares) {
		const subGroup = new THREE.Group();
		subdivisionMaterials = [];

		for (let i = 0; i < Math.min(8, squares.length); i++) {
			const sq = squares[i];
			const corners = [
				localToWorld(sq.left, sq.bottom),
				localToWorld(sq.right, sq.bottom),
				localToWorld(sq.right, sq.top),
				localToWorld(sq.left, sq.top)
			];

			const geo = new THREE.BufferGeometry().setFromPoints([
				corners[0],
				corners[1],
				corners[1],
				corners[2],
				corners[2],
				corners[3],
				corners[3],
				corners[0]
			]);

			const mat = new THREE.LineBasicMaterial({
				color: ink(ICOSA_INK.draft),
				transparent: true,
				opacity: 0
			});
			subdivisionMaterials.push({ mat });
			subGroup.add(new THREE.LineSegments(geo, mat));
		}

		return subGroup;
	}

	function createRectangle() {
		const rectGroup = new THREE.Group();
		const corners = getRectCorners();

		// ── THE RECTANGLE IS DRAWN, NOT SWITCHED ON ──────────────────────────
		// It used to be a LineBasicMaterial set straight to full opacity the
		// moment the pane group became visible, which is three golden rectangles
		// appearing inside the solid in a single frame. What they do afterwards
		// — travel outward — was always an animation; the arrival never was.
		//
		// So it uses the same material and the same progressive draw as the
		// icosahedron's own edges: four sides, each drawn from the end nearer
		// the middle of the figure, all four at once. The rectangle writes
		// itself inside the solid, and then the solid unfolds.
		outlineMaterial = lineMaterial(ink(get(accentHex)), 0);
		// Flat. This is line-work on the void, not a body with a near and far.
		outlineMaterial.uniforms.uBack.value = 1;

		const outlinePts = [
			corners[0],
			corners[1],
			corners[1],
			corners[2],
			corners[2],
			corners[3],
			corners[3],
			corners[0]
		];
		const outline = new THREE.BufferGeometry().setFromPoints(outlinePts);
		growOutline = grower(
			outlineMaterial,
			segmentAttributes(
				outline,
				4,
				() => 0,
				(i) => outlinePts[i * 2 + 1].lengthSq() < outlinePts[i * 2].lengthSq()
			)
		);
		growOutline(0);
		rectGroup.add(new THREE.LineSegments(outline, outlineMaterial));

		// The drafting, in its own group so it can be faded independently of the
		// rectangle it annotates.
		const { squares, arcCenters } = computeGoldenRectangleData();
		const draft = new THREE.Group();
		draft.add(createGoldenSpiral(arcCenters));
		draft.add(createSubdivisionLines(squares));
		rectGroup.add(draft);

		return rectGroup;
	}

	// The four dashed lines running back from the pane's corners to the vertices
	// of the solid they came off. They are what says this rectangle was TAKEN
	// from that shape rather than placed beside it.
	function createTraceLines() {
		const lines = [];
		traceLineMaterials = [];

		indices.forEach((i) => {
			const startPos = new THREE.Vector3(...vertices[i]);
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute(
					[startPos.x, startPos.y, startPos.z, startPos.x, startPos.y, startPos.z],
					3
				)
			);

			const material = new THREE.LineDashedMaterial({
				color: ink(ICOSA_INK.draft),
				transparent: true,
				opacity: 0,
				dashSize: 0.1,
				gapSize: 0.05
			});
			traceLineMaterials.push(material);

			const line = new THREE.Line(geometry, material);
			line.computeLineDistances();
			line.userData.startPos = startPos.clone();
			group.add(line);
			lines.push(line);
		});

		return lines;
	}

	function updateOpacities() {
		const t = lastProjection;
		const d = dimFactor * lineDim;
		const g = t * draft * d;
		// ── THE ARM DOES NOT STEP BACK ───────────────────────────────────────
		// `draft` carries the computation's draftOut, which takes the drafting to
		// a fifth of its weight once the rooms are up. That is right for the
		// drafting that is COPLANAR with a room — the spiral and the subdivision
		// squares are drawn over the one thing in the scene with any colour in
		// it, and at full weight they are clutter on top of it.
		//
		// It is wrong for the schematic and the traces. Those live three and a
		// half units further out (ICOSA.schematicReach), over empty void, with
		// nothing behind them to clutter — and they are the arm, which is the
		// whole composition. Fading them with the rest is what left V2's
		// extended rectangles technically present and impossible to see for the
		// back half of the scene.
		const arm = t * d;

		// The outline does NOT fade up from the projection. At projection 0 this
		// rectangle lies exactly on four of the solid's own vertices — it is the
		// same figure the conception folded up out of the page — so it is already
		// on screen when this scene starts and simply travels outward. Fading it
		// in from zero put three bright rectangles out at the cut and brought them
		// back from nothing, which is the one visible seam the run had left.
		if (outlineMaterial) outlineMaterial.uniforms.uOpacity.value = d;
		if (spiralMaterial) spiralMaterial.opacity = g * 0.85;
		subdivisionMaterials.forEach(({ mat }) => (mat.opacity = g * 0.45));
		traceLineMaterials.forEach((mat) => (mat.opacity = arm * 0.6));
		if (schematicComponent) schematicComponent.setLevel(arm);
	}

	export async function init() {
		basis = getRectBasis();

		rectangleGroup = createRectangle();
		group.add(rectangleGroup);

		traceLines = createTraceLines();

		await tick();

		if (schematicComponent) schematicComponent.init();
		if (roomComponent) roomComponent.init();
	}

	export function updateProjection(projection) {
		if (!rectangleGroup) return;
		lastProjection = projection;

		const paneDist = projection * PANE_REACH;
		// And the drafting goes on PAST it. See ICOSA.schematicReach: the arm is
		// the thing being composed here, not the pane.
		const draftDist = paneDist * ICOSA.schematicReach;
		rectangleGroup.position.copy(axis.clone().multiplyScalar(paneDist * direction));

		updateOpacities();

		// The traces run the WHOLE way out — from the vertex they came off to the
		// far end of the drafting, straight through the pane on the way. They are
		// the arm.
		traceLines.forEach((line) => {
			const { startPos } = line.userData;
			const endPos = startPos.clone().add(axis.clone().multiplyScalar(draftDist * direction));

			const positions = line.geometry.attributes.position.array;
			positions[3] = endPos.x;
			positions[4] = endPos.y;
			positions[5] = endPos.z;
			line.geometry.attributes.position.needsUpdate = true;
			line.computeLineDistances();
		});

		if (schematicComponent) schematicComponent.updateProjection(draftDist);
		if (roomComponent) roomComponent.updateProjection(projection);
	}

	// 0..1 — how far up the drafting layer is. The computation runs this on its
	// own window, so the working can be shown and then put away.
	// How much of the rectangle has been drawn, 0..1. Separate from setDim and
	// setLineDim, which are about how BRIGHT it is once it exists.
	export function setOutline(v) {
		growOutline(v);
	}

	export function setDraft(v) {
		if (v === draft) return;
		draft = v;
		updateOpacities();
	}

	// 0..1 — how far up the room's artwork is.
	export function setReveal(v) {
		if (roomComponent) roomComponent.setReveal(v);
	}

	// Fade this pane's line-work and room. Written every frame through the search
	// and the zoom, so it early-outs on no change: re-placing six rooms' worth of
	// layers to arrive at the numbers they already had is the one thing in this
	// scene that would cost real time.
	export function setDim(f) {
		if (f === dimFactor) return;
		dimFactor = f;
		updateOpacities();
		if (roomComponent) roomComponent.setDim(f);
	}

	// Fade only the golden line-work, keeping the room (used on the zoom target).
	export function setLineDim(f) {
		if (f === lineDim) return;
		lineDim = f;
		updateOpacities();
	}

	export function setPortrait(p) {
		portrait = p;
		if (roomComponent) roomComponent.setPortrait(p);
	}

	export function getRoom() {
		return roomComponent;
	}

	export function dispose() {
		if (rectangleGroup) {
			group.remove(rectangleGroup);
			rectangleGroup.traverse((obj) => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
		}
		traceLines.forEach((line) => {
			group.remove(line);
			line.geometry.dispose();
			line.material.dispose();
		});
		if (schematicComponent && schematicComponent.dispose) schematicComponent.dispose();
		if (roomComponent && roomComponent.dispose) roomComponent.dispose();
	}
</script>

{#if basis}
	<GoldenRectangleSchematic bind:this={schematicComponent} {group} {basis} {axis} {direction} />
	<RoomProjection
		bind:this={roomComponent}
		{group}
		{basis}
		{axis}
		{direction}
		{decadeKey}
		{portrait}
		{renderer}
		paneReach={PANE_REACH}
		maxDepth={ROOM_DEPTH}
	/>
{/if}
