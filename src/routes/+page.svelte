<script>
	import { phase } from '$lib/store/store';
	import Scene from '$lib/three/Scene.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<div class="bg" />

<Scene />
<SceneIcosahedron />

<div class="ui">
	{#key $phase}
		{#if $phase === 'intro'}
			<Intro />
		{:else if $phase === 'calculate'}
			<Calculate />
		{:else if $phase === 'output'}
			<Output />
		{:else}
			<!-- transition (and any future in-between phase): keep Transition UI up -->
			<Transition />
		{/if}
	{/key}
</div>

<style>
	.bg {
		position: fixed;
		inset: 0;
		background: #1b1b1b;
		z-index: 0;
	}

	.ui {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.ui :global(*) {
		pointer-events: auto;
	}
</style>