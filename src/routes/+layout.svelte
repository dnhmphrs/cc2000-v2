<script>
	import './styles.css';
	import { onMount } from 'svelte';
	import { screenSize, deviceType, isPortrait } from '$lib/store/store';
	import { getDeviceType, getScreenSize, getIsPortrait } from '$lib/functions/utils';
	import { palette, applyCssVars } from '$lib/theme';

	// Keep the UI ink (CSS custom properties) in sync with the active palette.
	$: applyCssVars($palette);

	function handleResize() {
		screenSize.set(getScreenSize());
		deviceType.set(getDeviceType());
		isPortrait.set(getIsPortrait());
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
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
	   can press — it has caught the restart button and the machine's start
	   button already, and it looks like a dead handler rather than a CSS miss. */
</style>
