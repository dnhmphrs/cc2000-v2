<script>
	import './styles.css';
	import { onMount } from 'svelte';
	import { screenSize, aspect } from '$lib/store/store';
	import { aspectKind, applyChassisVars, chassisCss } from '$lib/config';
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
	<!-- The faces, at the head of the queue. They are declared font-display:block
	     (styles/fonts.css) so nothing paints in a stand-in and re-flows when the
	     real one lands — which means the block period has to be over before the
	     first paint wants them, and a preload is what makes that true. Same
	     origin, but a font fetch is anonymous whatever its origin, so crossorigin
	     is required or the browser fetches the file twice and the preload buys
	     nothing. -->
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Light.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Regular.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Bold.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>

	<!-- The chassis, generated from CHASSIS itself, so the very first paint lays
	     the machine out at the size JS is about to confirm rather than at a
	     hard-coded guess that then has to be corrected. See config/layout.js.

	     The @html is safe: chassisCss() is built entirely from those constants
	     and no input of any kind reaches it. A plain <style> element cannot be
	     used here — Svelte hoists it as this component's own stylesheet. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style>${chassisCss()}</style>`}
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
