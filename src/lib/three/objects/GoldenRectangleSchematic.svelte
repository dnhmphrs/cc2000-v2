<script>
	import * as THREE from 'three';
	import { ink } from '$lib/theme';
	import { ICOSA_INK } from '$lib/config';

	// Same group as everything else — rotates together
	export let group;
	export let basis;
	export let axis;
	export let direction;

	// Coplanar with the rectangle it annotates, at the same distance out, so it
	// reads as drafting ON that rectangle rather than as a second object hanging
	// in front of it. The room sits BEHIND the pane's plane, so nothing here is
	// ever occluded by the artwork it is dimensioning.
	let level = 0;

	const PHI = (1 + Math.sqrt(5)) / 2;

	let schematicGroup;
	let materials = [];

	function localToWorld(u, v) {
		return basis.center
			.clone()
			.add(basis.uAxis.clone().multiplyScalar(u))
			.add(basis.vAxis.clone().multiplyScalar(v));
	}

	function addLine(points, lineOpacity, dashed = false) {
		const geo = new THREE.BufferGeometry().setFromPoints(points);
		const mat = dashed
			? new THREE.LineDashedMaterial({
					color: ink(ICOSA_INK.draft),
					transparent: true,
					opacity: 0,
					dashSize: 0.08,
					gapSize: 0.04
			  })
			: new THREE.LineBasicMaterial({
					color: ink(ICOSA_INK.draft),
					transparent: true,
					opacity: 0
			  });

		materials.push({ mat, baseOpacity: lineOpacity });

		const line = dashed ? new THREE.Line(geo, mat) : new THREE.LineSegments(geo, mat);
		if (dashed) line.computeLineDistances();
		schematicGroup.add(line);
	}

	function create() {
		if (!basis || !group) return;

		schematicGroup = new THREE.Group();
		materials = [];

		const halfU = basis.uLen / 2;
		const halfV = basis.vLen / 2;

		const uIsShort = basis.uLen <= basis.vLen;
		const S = Math.min(basis.uLen, basis.vLen);

		const tickLen = S * 0.08;
		const dimOffset = S * 0.25;

		const corners = [
			localToWorld(-halfU, -halfV),
			localToWorld(halfU, -halfV),
			localToWorld(halfU, halfV),
			localToWorld(-halfU, halfV)
		];

		// Outline
		addLine(
			[
				corners[0],
				corners[1],
				corners[1],
				corners[2],
				corners[2],
				corners[3],
				corners[3],
				corners[0]
			],
			0.5
		);

		// φ division line
		if (uIsShort) {
			addLine([localToWorld(-halfU, -halfV + S), localToWorld(halfU, -halfV + S)], 0.3);
		} else {
			addLine([localToWorld(-halfU + S, -halfV), localToWorld(-halfU + S, halfV)], 0.3);
		}

		// Dimension lines
		if (uIsShort) {
			const shortStart = localToWorld(-halfU, -halfV - dimOffset);
			const shortEnd = localToWorld(halfU, -halfV - dimOffset);
			addLine([shortStart, shortEnd], 0.35);

			addLine(
				[
					shortStart.clone().add(basis.uAxis.clone().multiplyScalar(-tickLen)),
					shortStart.clone().add(basis.uAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
			addLine(
				[
					shortEnd.clone().add(basis.uAxis.clone().multiplyScalar(-tickLen)),
					shortEnd.clone().add(basis.uAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);

			const longStart = localToWorld(halfU + dimOffset, -halfV);
			const longEnd = localToWorld(halfU + dimOffset, halfV);
			addLine([longStart, longEnd], 0.35);

			addLine(
				[
					longStart.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen)),
					longStart.clone().add(basis.vAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
			addLine(
				[
					longEnd.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen)),
					longEnd.clone().add(basis.vAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
		} else {
			const shortStart = localToWorld(-halfU - dimOffset, -halfV);
			const shortEnd = localToWorld(-halfU - dimOffset, halfV);
			addLine([shortStart, shortEnd], 0.35);

			addLine(
				[
					shortStart.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen)),
					shortStart.clone().add(basis.vAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
			addLine(
				[
					shortEnd.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen)),
					shortEnd.clone().add(basis.vAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);

			const longStart = localToWorld(-halfU, -halfV - dimOffset);
			const longEnd = localToWorld(halfU, -halfV - dimOffset);
			addLine([longStart, longEnd], 0.35);

			addLine(
				[
					longStart.clone().add(basis.uAxis.clone().multiplyScalar(-tickLen)),
					longStart.clone().add(basis.uAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
			addLine(
				[
					longEnd.clone().add(basis.uAxis.clone().multiplyScalar(-tickLen)),
					longEnd.clone().add(basis.uAxis.clone().multiplyScalar(tickLen))
				],
				0.35
			);
		}

		// 1:φ ratio bar
		const ratioOffset = halfV + dimOffset * 1.6;
		if (uIsShort) {
			const y = ratioOffset;
			const x0 = -halfU;
			const r0 = localToWorld(x0, y);
			const r1 = localToWorld(x0 + S * 0.35, y);
			const r2 = localToWorld(x0 + S * 0.35 + S * 0.35 * PHI, y);

			addLine([r0, r1], 0.5);
			addLine([r1, r2], 0.3);

			[r0, r1, r2].forEach((p) => {
				addLine(
					[
						p.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen * 0.6)),
						p.clone().add(basis.vAxis.clone().multiplyScalar(tickLen * 0.6))
					],
					0.4
				);
			});
		} else {
			const y = ratioOffset;
			const x0 = -halfU;
			const r0 = localToWorld(x0, y);
			const r1 = localToWorld(x0 + S * 0.35, y);
			const r2 = localToWorld(x0 + S * 0.35 + S * 0.35 * PHI, y);

			addLine([r0, r1], 0.5);
			addLine([r1, r2], 0.3);

			[r0, r1, r2].forEach((p) => {
				addLine(
					[
						p.clone().add(basis.vAxis.clone().multiplyScalar(-tickLen * 0.6)),
						p.clone().add(basis.vAxis.clone().multiplyScalar(tickLen * 0.6))
					],
					0.4
				);
			});
		}

		group.add(schematicGroup);
	}

	export function init() {
		create();
	}

	// 0..1 — the drafting layer's level, owned by GoldenRectangle so that every
	// part of the working comes up and goes away together.
	export function setLevel(v) {
		level = v;
		materials.forEach(({ mat, baseOpacity: lineOpacity }) => {
			mat.opacity = level * lineOpacity;
		});
		if (schematicGroup) schematicGroup.visible = level > 0.004;
	}

	export function updateProjection(paneDist) {
		if (!schematicGroup) return;
		schematicGroup.position.copy(axis.clone().multiplyScalar(paneDist * direction));
	}

	export function dispose() {
		if (schematicGroup) {
			group.remove(schematicGroup);
			schematicGroup.traverse((obj) => {
				if (obj.geometry) obj.geometry.dispose();
				if (obj.material) obj.material.dispose();
			});
			schematicGroup = null;
			materials = [];
		}
	}
</script>
