<script>
	import './styles.css';
	import { onMount } from 'svelte';
	import { screenSize, aspect } from '$lib/store/store';
	import { aspectKind, applyChassisVars } from '$lib/config';
	import { palette, applyCssVars } from '$lib/theme';

	// Keep the UI ink (CSS custom properties) in sync with the active palette.
	$: applyCssVars($palette);

	// One place decides what shape of screen this is. Everything that lays out
	// differently in portrait, landscape or the square middle a tablet lands in
	// reads `aspect` or the CSS custom properties written from it — nothing
	// measures the viewport for itself.
	function handleResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		const kind = aspectKind(w, h);
		screenSize.set({ width: w, height: h });
		aspect.set(kind);
		applyChassisVars(kind);
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
		};
	});
</script>

<svelte:head>
	<title>Conception Calculator 2000</title>
	<meta
		name="description"
		content="Calculate the song playing at your exact moment of conception."
	/>
</svelte:head>

<main>
	<slot />
</main>

<style>
	main {
		position: fixed;
		inset: 0;
		z-index: 10;
		pointer-events: none;
	}

	/* No blanket pointer-events reset here: it used to re-enable hit-testing on
	   every descendant, which then sat on top of the 3D stage.
	   CAREFUL: every screen that wants clicks must set pointer-events:auto on its
	   own root. Forgetting it renders a perfectly visible control that nothing
	   can press — it has caught the restart button, the machine's calculate
	   button and the Spotify player already, and it looks like a dead handler
	   rather than a CSS miss. */
</style>
