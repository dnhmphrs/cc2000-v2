<script>
	import './styles.css';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { onMount } from 'svelte';
	import { screenType, isIframe, screenSize } from '$lib/store/store';
	import { getDeviceType, getScreenSize } from '$lib/functions/utils';

	let Scene;

	function handleScreen() {
		// screen size
		screenSize.set(getScreenSize());

		// device type
		screenType.set(getDeviceType());
		isIframe.set(window.location !== window.parent.location);
	}

	onMount(async () => {
		// webgl
		const module = await import('$lib/three/scene.svelte');
		Scene = module.default;

		handleScreen();
		window.addEventListener('resize', () => handleScreen());

		// release opacity block once geometry is loaded
		const main = document.querySelector('main');
		if (main) main.style.opacity = 1;

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

{#if Scene}
	<svelte:component this={Scene} />
{:else}
	<div class="loading">gestating...</div>
{/if}

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
		color: white;
	}
</style>