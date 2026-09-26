<script>
	import { scene, gate, edge } from '$lib/store/store';
	import Stage from '$lib/three/Stage.svelte';
	import Prelude from '$lib/scenes/Prelude.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import Room from '$lib/scenes/Room.svelte';
	import Glass from '$lib/components/Glass.svelte';
	import Dev from '$lib/components/Dev.svelte';
	import ErrorScreen from '$lib/components/error/ErrorScreen.svelte';
	import SignalPanel from '$lib/components/SignalPanel.svelte';
	import { DEV, CRT } from '$lib/config';

	// The whole site, in the order the layers stack:
	//
	//   1  Stage        the three 3D scenes, on one WebGPU renderer, which draw
	//                   their own backdrops
	//   4  (flash)      the splosh, thrown by the descent
	//   10 the screens  the room, or the verdict
	//   20 the gate     the title card and the two questions, over the flight
	//   30 Glass        scanlines, over everything, always
	//   40 SignalPanel  the signal's dials, top right, while the dev harness
	//                   is on and the signal pass is
	//
	// Dev is not a layer — it binds keys and nothing else. See config/dev.js.
	//
	// THERE IS NO CALCULATOR IN THIS BUILD. The run opens on the title card, and
	// the card is a DOM overlay over an approach that is ALREADY MOUNTED and held
	// at progress zero — black over black — so when it lifts the flight is
	// running rather than starting. The two answers the machine used to take are
	// taken mid-flight by the popups below, which hold the flight while they are
	// open. See store.js `gate`.
</script>

<Stage />
<Glass />
{#if DEV.on && CRT.on}
	<SignalPanel />
{/if}
<!-- Keys for jumping around the run. Inert unless config/dev.js says otherwise. -->
<Dev />

<!-- The room — or, when the tunnel broke down on a birthday the archive cannot
     answer for, the verdict. The only DOM screens left. -->
{#if $scene === 'room'}
	<Room />
{:else if $scene === 'error'}
	<ErrorScreen verdict={$edge} />
{/if}

<!-- And what the flight is waiting for, if anything. -->
{#if $gate === 'prelude'}
	<Prelude />
{:else if $gate === 'dob' || $gate === 'spicy'}
	<Prompt which={$gate} />
{/if}
