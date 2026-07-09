<script>
	import './styles.css';
	import { onMount } from 'svelte';
	import { screenSize, deviceType, isPortrait } from '$lib/store/store';
	import { getDeviceType, getScreenSize, getIsPortrait } from '$lib/functions/utils';
	import { palette, applyCssVars } from '$lib/theme';

	import DevPanel from '$lib/components/DevPanel.svelte';

	// Keep the UI accent (CSS custom properties) in sync with the active palette.
	$: applyCssVars($palette);

	let mounted = false;

	function handleResize() {
		screenSize.set(getScreenSize());
		deviceType.set(getDeviceType());
		isPortrait.set(getIsPortrait());
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		mounted = true;
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<svelte:head>
	<title>Conception Calculator 2000</title>
	<meta name="description" content="Calculate the song playing at your exact moment of conception." />
</svelte:head>

<DevPanel />

<main>
	<slot />
</main>

<style>
	main {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		pointer-events: none;
	}

	/* All children get pointer events back */
	main :global(*) {
		pointer-events: auto;
	}
</style>
