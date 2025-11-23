<script>
	import './styles.css';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { webVitals } from '$lib/vitals';

	import { onMount } from 'svelte';
	import { screenType, isIframe, screenSize } from '$lib/store/store';
	import { getDeviceType, getScreenSize } from '$lib/functions/utils';

	export let data;
	let Geometry;

	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId: data.analyticsId
		});
	}

	function handleScreen() {
		// screen size
		screenSize.set(getScreenSize());

		// device type
		screenType.set(getDeviceType());
		isIframe.set(window.location !== window.parent.location);
	}

	onMount(async () => {
		// webgl
		const module = await import('$lib/graphics/geometry.svelte');
		Geometry = module.default;

		handleScreen();
		window.addEventListener('resize', () => handleScreen());

		// releasr opacity block once geometry is loaded
		document.querySelector('main').style.opacity = 1;

		return () => {
			window.removeEventListener('resize', () => handleScreen());
		};
	});
</script>

<svelte:head>
	<title>Conception Calculator 2000</title>
	<meta name="description" content="Conceived by Science, Built by Magic." />
	<meta name="keywords" content="conception, calculator, parents, truth, test results, sex?" />
	<meta name="author" content="AUFBAU" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

{#if Geometry}
	<svelte:component this={Geometry} />
{:else}
	<div class="loading">gestating...</div>
{/if}

<svelte:component this={Geometry} />

<main>
	<slot />
</main>

<style>
	main {
		height: 100vh;
		height: calc(var(--vh, 1vh) * 100);
		width: 100%;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading {
		position: absolute;
		font-style: italic;
		font-family: serif;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 10px;
		font-size: 12px;
	}
</style>
