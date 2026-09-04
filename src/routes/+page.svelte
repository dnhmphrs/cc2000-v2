<script>
	import { onMount } from 'svelte';
	import { phase, bgStage } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';

	// A beat of black, then the shader comes on.
	onMount(() => {
		const t = setTimeout(() => bgStage.set('reveal'), 400);
		return () => clearTimeout(t);
	});
</script>

<Background />

<SceneIcosahedron />

<div class="ui">
	<!-- Left terminal log: boot lines during the intro (fades out as the panes
	     open); the search log plays during processing. -->
	{#if $phase === 'intro'}
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
