<script>
	import { scene } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import Stage from '$lib/three/Stage.svelte';
	import Calculator from '$lib/scenes/Calculator.svelte';
	import Room from '$lib/scenes/Room.svelte';
	import Glass from '$lib/components/Glass.svelte';
	import Dev from '$lib/components/Dev.svelte';

	// The whole site, in the order the layers stack:
	//
	//   0  Background   the theta field, off behind one switch
	//   1  Stage        the three 3D scenes
	//   3  Glass        scanlines over everything, always; the machine's own
	//                  reflection for as long as you are behind its screen
	//   4  (flash)      the moment of conception, thrown by the Stage
	//   10 the screens  the calculator and the room
	//
	// Dev is not a layer — it binds keys and nothing else. See config/dev.js.
	//
	// Which screen is up comes from the same `scene` store the Stage reads, so
	// the DOM and the 3D cannot disagree about where we are.
</script>

<Background />
<Stage />
<Glass />
<!-- Keys for jumping around the run. Inert unless config/dev.js says otherwise. -->
<Dev />

<!-- Between the two, the 3D has the screen to itself. -->
{#if $scene === 'calculator'}
	<Calculator />
{:else if $scene === 'room'}
	<Room />
{/if}
