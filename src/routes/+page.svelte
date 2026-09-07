<script>
	import { scene } from '$lib/store/store';
	import Background from '$lib/components/Background.svelte';
	import NoiseField from '$lib/components/NoiseField.svelte';
	import Stage from '$lib/three/Stage.svelte';
	import Calculator from '$lib/scenes/Calculator.svelte';
	import Caption from '$lib/scenes/Caption.svelte';
	import Room from '$lib/scenes/Room.svelte';

	// The whole site, in the order the layers stack:
	//
	//   0  Background   the theta field, off behind one switch
	//   1  Stage        the three 3D scenes
	//   3  NoiseField   static, over the picture
	//   4  (flash)      the moment of conception, thrown by the Stage
	//   10 the screens  the calculator, the caption, the room
	//
	// Which screen is up comes from the same `scene` store the Stage reads, so
	// the DOM and the 3D cannot disagree about where we are.
</script>

<Background />
<Stage />
<NoiseField />

{#if $scene === 'calculator'}
	<Calculator />
{:else if $scene === 'room'}
	<Room />
{:else}
	<Caption />
{/if}
