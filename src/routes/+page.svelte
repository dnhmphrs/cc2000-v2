<script>
	import { phase } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import SceneIcosahedron from '$lib/three/Scene-icosahedron.svelte';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<Background />
<SceneIcosahedron />

{#if $phase === 'intro'}
	<Intro />
{:else if $phase === 'calculate'}
	<Calculate />
{:else if $phase === 'processing'}
	<Transition />
{:else if $phase === 'output'}
	<Output />
{/if}
