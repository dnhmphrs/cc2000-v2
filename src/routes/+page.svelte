<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Stage from '$lib/three/Stage.svelte';
	import Machine from '$lib/components/screens/Machine.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!-- Behind the 3D. The tunnel clears opaque over the top of it, so this only
     shows once the computation scene starts; `flare` swells it for the search. -->
<Background />

<!-- The three scenes: the fly in, conception, then the computation. -->
<Stage />

<!-- The machine is the landing, and it takes both answers: you dial it in,
     then the camera goes through its window and into the scene above. -->
{#if $phase === 'intro'}
	<Machine />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
