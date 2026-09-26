<script>
	import { onMount, onDestroy } from 'svelte';
	import { GIFS } from '$lib/data/gifs';

	// ── The gif, tiled ───────────────────────────────────────────────────────
	// The verdict is read over its gif: the whole frame of it, tiled — every
	// other tile mirrored, as the rooms' wallpaper is looped, so the tiles
	// meet without a seam — playing. The gif is its SHEET (data/gifs.js, baked
	// by scripts/gifs.mjs, the same sheet the tunnel's rings are made of on
	// the way here), drawn tile by tile to one canvas at the frame the clock
	// says; a gif file would play on its own but is fifteen megabytes. Under
	// prefers-reduced-motion it is a still. Comes up as the sheet arrives.
	export let name;

	let canvas;
	let raf;
	let ready = false;

	onMount(() => {
		const G = GIFS[name];
		if (!G) return;
		const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = G.src;
		img.decode?.().catch(() => {});
		const t0 = performance.now();
		const draw = () => {
			raf = requestAnimationFrame(draw);
			if (!img.complete || !img.naturalWidth) return;
			ready = true;
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			const f = reduced ? 0 : Math.floor(((performance.now() - t0) / 1000) * G.fps) % G.frames;
			const sx = (f % G.cols) * G.w;
			const sy = Math.floor(f / G.cols) * G.h;
			// About six tiles across on a desktop, two or three on a phone.
			const tw = Math.min(G.w, Math.max(150, w / 6));
			const th = (tw * G.h) / G.w;
			const cols = Math.ceil(w / tw) + 1;
			const rows = Math.ceil(h / th) + 1;
			const ox = (w - cols * tw) / 2;
			const oy = (h - rows * th) / 2;
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					ctx.save();
					ctx.translate(ox + c * tw + (c % 2 ? tw : 0), oy + r * th + (r % 2 ? th : 0));
					ctx.scale(c % 2 ? -1 : 1, r % 2 ? -1 : 1);
					ctx.drawImage(img, sx, sy, G.w, G.h, 0, 0, tw, th);
					ctx.restore();
				}
			}
			if (reduced) cancelAnimationFrame(raf);
		};
		raf = requestAnimationFrame(draw);
	});
	onDestroy(() => {
		if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
	});
</script>

<canvas bind:this={canvas} class="tiles" class:ready aria-hidden="true"></canvas>

<style>
	.tiles {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		opacity: 0;
		transition: opacity 0.6s ease-out;
	}
	.tiles.ready {
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.tiles {
			transition: none;
		}
	}
</style>
