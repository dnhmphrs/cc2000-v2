<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Scene from '$lib/three/Scene.svelte';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- Behind both halves of the 3D. Currently only lit during the search — raise
     FLARE_MAX / drop the flare gate in Background.svelte to keep it under the
     sperm half too. -->
<Background />

<!-- The sperm and egg, then the icosahedron and the rooms. -->
<Scene />

{#if $phase === 'intro'}
	<Intro />
{:else if $phase === 'calculate'}
	<Calculate />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
