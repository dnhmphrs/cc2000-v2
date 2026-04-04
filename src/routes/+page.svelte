<script>
	import { phase } from '$lib/store/store';
	import Intro from '$lib/components/screens/Intro.svelte';
	import Calculate from '$lib/components/screens/Calculate.svelte';
	import Transition from '$lib/components/screens/Transition.svelte';
	import Output from '$lib/components/screens/Output.svelte';
</script>

<!--
	Using {#key} so the entire block is replaced atomically on phase change,
	preventing the old and new components from coexisting briefly and causing
	a horizontal layout shift.
-->
{#key $phase}
	{#if $phase === 'intro'}
		<Intro />
	{:else if $phase === 'calculate'}
		<Calculate />
	{:else if $phase === 'transition'}
		<Transition />
	{:else if $phase === 'output'}
		<Output />
	{/if}
{/key}
