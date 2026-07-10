<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { palette } from '$lib/theme';
	import { spinQuat, latticeActive } from '$lib/store/store';

	let canvas;
	let ctx;
	let frame;
	let w = 0;
	let h = 0;
	let dpr = 1;

	// 4D hyper-rotation angles (advanced only while the search is active).
	let aXW = 0.2;
	let aYW = 0.6;
	let aZW = 0.4;
	// Eased 0..1 "search intensity" — how present / bright the lattice is.
	let intensity = 0;

	// ── Tesseract topology ──────────────────────────────────────────────────
	// 16 vertices at (±1,±1,±1,±1); edges join vertices differing in one coord.
	const verts4 = [];
	for (let i = 0; i < 16; i++) {
		verts4.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
	}
	const edges = [];
	for (let i = 0; i < 16; i++) {
		for (let j = i + 1; j < 16; j++) {
			let diff = 0;
			for (let k = 0; k < 4; k++) if (verts4[i][k] !== verts4[j][k]) diff++;
			if (diff === 1) edges.push([i, j]);
		}
	}

	function rot4(p, a, b, ang) {
		const c = Math.cos(ang);
		const s = Math.sin(ang);
		const q = p.slice();
		q[a] = p[a] * c - p[b] * s;
		q[b] = p[a] * s + p[b] * c;
		return q;
	}

	// Apply the icosahedron's live quaternion to a 3D point (so the lattice
	// tumbles in lock-step during the search).
	function applyQuat(p, qt) {
		const { x, y, z, w: qw } = qt;
		const ix = qw * p[0] + y * p[2] - z * p[1];
		const iy = qw * p[1] + z * p[0] - x * p[2];
		const iz = qw * p[2] + x * p[1] - y * p[0];
		const iw = -x * p[0] - y * p[1] - z * p[2];
		return [
			ix * qw + iw * -x + iy * -z - iz * -y,
			iy * qw + iw * -y + iz * -x - ix * -z,
			iz * qw + iw * -z + ix * -y - iy * -x
		];
	}

	function resize() {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		w = window.innerWidth;
		h = window.innerHeight;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function uiColor(alpha) {
		const [r, g, b] = get(palette).ui;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	function drawGrid() {
		const step = 42;
		ctx.lineWidth = 1;
		ctx.strokeStyle = uiColor(0.05);
		ctx.beginPath();
		for (let x = (w / 2) % step; x < w; x += step) {
			ctx.moveTo(Math.round(x) + 0.5, 0);
			ctx.lineTo(Math.round(x) + 0.5, h);
		}
		for (let y = (h / 2) % step; y < h; y += step) {
			ctx.moveTo(0, Math.round(y) + 0.5);
			ctx.lineTo(w, Math.round(y) + 0.5);
		}
		ctx.stroke();

		// Stronger centre crosshair + registration marks.
		ctx.strokeStyle = uiColor(0.09);
		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.moveTo(0, h / 2);
		ctx.lineTo(w, h / 2);
		ctx.stroke();

		// Corner brackets on the viewport.
		const m = 18;
		const L = 26;
		ctx.strokeStyle = uiColor(0.28);
		ctx.lineWidth = 1;
		ctx.beginPath();
		// TL
		ctx.moveTo(m, m + L);
		ctx.lineTo(m, m);
		ctx.lineTo(m + L, m);
		// TR
		ctx.moveTo(w - m - L, m);
		ctx.lineTo(w - m, m);
		ctx.lineTo(w - m, m + L);
		// BL
		ctx.moveTo(m, h - m - L);
		ctx.lineTo(m, h - m);
		ctx.lineTo(m + L, h - m);
		// BR
		ctx.moveTo(w - m - L, h - m);
		ctx.lineTo(w - m, h - m);
		ctx.lineTo(w - m, h - m - L);
		ctx.stroke();
	}

	function drawLattice() {
		const cx = w / 2;
		const cy = h / 2;
		const scale = Math.min(w, h) * 0.34;
		const qt = get(spinQuat);

		const pts = verts4.map((v0) => {
			// 4D rotation (only advances while searching)
			let p = rot4(v0, 0, 3, aXW);
			p = rot4(p, 1, 3, aYW);
			p = rot4(p, 2, 3, aZW);
			// 4D → 3D perspective (divide by distance along w)
			const wdist = 3.2;
			const k = wdist / (wdist - p[3]);
			let p3 = [p[0] * k, p[1] * k, p[2] * k];
			// Tumble with the icosahedron during the search
			p3 = applyQuat(p3, qt);
			// 3D → 2D orthographic
			return [cx + p3[0] * scale, cy - p3[1] * scale];
		});

		const base = 0.05 + intensity * 0.32;
		ctx.strokeStyle = uiColor(base);
		ctx.lineWidth = 1;
		ctx.beginPath();
		edges.forEach(([a, b]) => {
			ctx.moveTo(pts[a][0], pts[a][1]);
			ctx.lineTo(pts[b][0], pts[b][1]);
		});
		ctx.stroke();

		// Vertex nodes brighten during the search.
		if (intensity > 0.02) {
			ctx.fillStyle = uiColor(0.15 + intensity * 0.5);
			pts.forEach((p) => {
				ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
			});
		}
	}

	let last = performance.now();
	function loop() {
		frame = requestAnimationFrame(loop);
		const now = performance.now();
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;

		const active = get(latticeActive);
		const target = active ? 1 : 0;
		intensity += (target - intensity) * Math.min(1, dt * 2.2);

		// Advance the 4D rotation only meaningfully while searching; a whisper
		// of drift keeps it alive in the ambient state.
		const speed = 0.15 + intensity * 0.85;
		aXW += dt * 0.31 * speed;
		aYW += dt * 0.23 * speed;
		aZW += dt * 0.17 * speed;

		ctx.clearRect(0, 0, w, h);
		drawGrid();
		drawLattice();
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
		loop();
	});

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		if (typeof window !== 'undefined') window.removeEventListener('resize', resize);
	});
</script>

<canvas bind:this={canvas} />

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 0;
		pointer-events: none;
	}
</style>
