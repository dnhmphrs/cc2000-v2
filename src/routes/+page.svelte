<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Preloader from '$lib/components/Preloader.svelte';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<Background />

<SceneIcosahedron />

{#if $phase === 'preload'}
	<Preloader />
{/if}

<div class="ui">
	<!-- Left terminal log: boot lines type during the intro and stay put through
	     the input step; the search log replaces them (resets) at processing. -->
	{#if $phase === 'intro' || $phase === 'calculate'}
		<Intro />
	{:else if $phase === 'processing'}
		<Transition />
	{/if}

	<!-- Centre interactive panels. -->
	{#if $phase === 'calculate'}
		<Calculate />
	{:else if $phase === 'output'}
		<Output />
	{/if}
</div>

<style>
	.ui {
		position: fixed;
		inset: 0;
		z-index: 10;
		pointer-events: none;
	}

	/* Each screen re-enables pointer events on its own interactive shell so the
	   3D scene stays draggable/hoverable through the non-interactive areas. */
</style>
