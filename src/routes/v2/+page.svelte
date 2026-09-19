<script>
	import { scene, gate } from '$lib/store/store';
	import { setRun } from '$lib/scenes/director';
	import Background from '$lib/components/Background.svelte';
	import StageV2 from '$lib/three/StageV2.svelte';
	import Prelude from '$lib/scenes/Prelude.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import Room from '$lib/scenes/Room.svelte';
	import Glass from '$lib/components/Glass.svelte';
	import Dev from '$lib/components/Dev.svelte';

	// ── /v2: the WebGL run, as it was ────────────────────────────────────────
	// The site before the WebGPU rebuild, kept playable: WebGLRenderer, the
	// tunnel, the fly-in, the conception, the computation and the room, on the
	// old Stage (three/StageV2.svelte) with the old backdrop canvas behind it.
	// The title card, the two mid-flight popups and the room are the same
	// components the site uses; only the 3D and its scene names differ, so the
	// director is switched to that run's names here — on the client, before the
	// Stage mounts and reads them. See scenes/director.js setRun().
	//
	// The layers stack as the site's did:
	//
	//   0  Background   the theta field, off behind one switch
	//   1  StageV2      the three 3D scenes
	//   4  (flash)      never thrown
	//   10 the screens  the room
	//   20 the gate     the title card and the two questions, over the flight
	//   30 Glass        scanlines, over everything, always
	if (typeof window !== 'undefined') setRun('v2');
</script>

<Background />
<StageV2 />
<Glass />
<Dev />

{#if $scene === 'room'}
	<Room />
{/if}

{#if $gate === 'prelude'}
	<Prelude />
{:else if $gate === 'dob' || $gate === 'spicy'}
	<Prompt which={$gate} />
{/if}
