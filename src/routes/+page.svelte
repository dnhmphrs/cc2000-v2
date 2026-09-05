<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Scene from '$lib/three/Scene.svelte';
	import Machine from '$lib/components/screens/Machine.svelte';
	import AskDob from '$lib/components/screens/AskDob.svelte';
	import AskSpicy from '$lib/components/screens/AskSpicy.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- Behind both halves of the 3D. Currently only lit during the search — raise
     FLARE_MAX / drop the flare gate in Background.svelte to keep it under the
     sperm half too. -->
<Background />

<!-- The sperm and egg, then the icosahedron and the rooms. -->
<Scene />

<!-- The machine is the landing: you look at it, then the camera goes through
     its window and into the scene above. -->
{#if $phase === 'intro'}
	<Machine />
{:else if $phase === 'dob'}
	<AskDob />
{:else if $phase === 'spicy'}
	<AskSpicy />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
