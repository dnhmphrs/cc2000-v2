<script>
	import { scene, gate } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Stage from '$lib/three/Stage.svelte';
	import Prelude from '$lib/scenes/Prelude.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import Room from '$lib/scenes/Room.svelte';
	import Glass from '$lib/components/Glass.svelte';
	import Dev from '$lib/components/Dev.svelte';

	// The whole site, in the order the layers stack:
	//
	//   0  Background   the theta field, off behind one switch
	//   1  Stage        the three 3D scenes
	//   4  (flash)      the moment of conception, thrown by the Stage
	//   10 the screens  the room
	//   20 the gate     the title card and the two questions, over the flight
	//   30 Glass        scanlines, over everything, always
	//
	// Dev is not a layer — it binds keys and nothing else. See config/dev.js.
	//
	// THERE IS NO CALCULATOR IN THIS BUILD. The run opens on the title card, and
	// the card is a DOM overlay over a fly-in that is ALREADY MOUNTED and held at
	// progress zero — black over black — so when it lifts the flight is running
	// rather than starting. The two answers the machine used to take are taken
	// mid-flight by the popups below, which hold the flight while they are open.
	// See store.js `gate`.
</script>

<Background />
<Stage />
<Glass />
<!-- Keys for jumping around the run. Inert unless config/dev.js says otherwise. -->
<Dev />

<!-- The room is the only DOM screen left. -->
{#if $scene === 'room'}
	<Room />
{/if}

<!-- And what the flight is waiting for, if anything. -->
{#if $gate === 'prelude'}
	<Prelude />
{:else if $gate === 'dob' || $gate === 'spicy'}
	<Prompt which={$gate} />
{/if}
