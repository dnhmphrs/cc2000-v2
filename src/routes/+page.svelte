<script>
	import Start from '$lib/components/screens/start.svelte';
	import Calculate from '$lib/components/screens/calculate.svelte';
	import Transition from '$lib/components/screens/transition.svelte';
	import Output from '$lib/components/screens/output.svelte';

	import { page } from '$lib/store/store';
</script>

<svelte:head>
	<title>CONCEPTION CALCULATOR 2000</title>
	<link
		rel="preload"
		as="font"
		href="/fonts/NB-Architekt-Pro-Regular.woff"
		type="font/woff"
		crossorigin="anonymous"
	/>
</svelte:head>

<main>
	{#if $page == 1}
		<Start />
	{:else if $page == 2}
		<Calculate />
	{:else if $page == 3}
		<Transition />
	{:else if $page == 4}
		<Output />
	{/if}
</main>

<style>
	main {
		width: 400px;
		height: 400px;
	}

	@media (max-width: 800px) {
		main {
			width: 90%;
		}
	}
</style>
