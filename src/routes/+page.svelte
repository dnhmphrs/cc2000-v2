<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Scene from '$lib/three/Scene.svelte';
	import Machine from '$lib/components/screens/Machine.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- Behind everything, always burning. `flare` swells it for the search; it
     never goes out, so it is what you see through the machine's window too. -->
<Background />

<!-- The sperm and egg, then the icosahedron and the rooms. -->
<Scene />

<!-- The machine is the landing, and it takes both answers: you dial it in,
     then the camera goes through its window and into the scene above. -->
{#if $phase === 'intro'}
	<Machine />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
