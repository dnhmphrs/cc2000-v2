<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Chrome from '$lib/components/Chrome.svelte';
	import Boot from '$lib/components/screens/Boot.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- The theta field. Dark and un-dispatched except during the search transition,
     where the scene drives its flare. -->
<Background />

<!-- The 3D stage: nothing until the operator starts, then the sperm, then the
     icosahedron on the dive. -->
<SceneIcosahedron />

<!-- Persistent site framing — brackets, ident, phase meter, clock. -->
<Chrome />

<div class="ui">
	<!-- Top-left console: the boot log, then the search log. -->
	{#if $phase === 'boot'}
		<Boot />
	{:else if $phase === 'processing'}
		<Transition />
	{/if}

	<!-- Centre panels. -->
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
	   3D stage stays untouched through the non-interactive areas. */
</style>
