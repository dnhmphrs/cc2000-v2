<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Canal from '$lib/components/Canal.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- The tube. Warm and lit for the front half, gone once the search starts. -->
<Canal />

<!-- The theta field. Only on during the search. -->
<Background />

<!-- The sperm, the motes, then the icosahedron and the rooms. -->
<SceneIcosahedron />

<!-- No landing page: you arrive already inside, and the questions are put to
     you while the sperm swims. -->
{#if $phase === 'intro'}
	<Calculate />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
