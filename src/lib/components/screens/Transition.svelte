<script>
	import { phase, sceneState, spicy, decade } from '$lib/store/store';
	import Terminal from '$lib/components/Terminal.svelte';
	import Console from '$lib/components/Console.svelte';

	// Beat 3/4: the search log runs while the sperm dives, the icosahedron
	// appears and opens, the background flares and the scan resolves a decade.
	// When the scene lands it sets sceneState → 4.
	$: if ($sceneState >= 4) phase.set('output');

	const lines = [
		{ text: 'cc2000 search --hyperspace', kind: 'cmd' },
		{ text: 'releasing subject vector into the lattice', kind: 'sys' },
		{ text: 'icosahedral rotor spun up ... 4 decades', kind: 'ok' },
		{ text: 'cross-referencing 11,486,203 broadcast records', kind: 'sys' },
		{ text: 'golden manifold aligned · phi = 1.6180339887', kind: 'ok' },
		{ text: `harmonising resonance level ${$spicy}/10`, kind: 'sys' },
		{ text: 'quantum-tunnelling through decade membrane', kind: 'sys' },
		{ text: 'discarding improbable timelines [n=402]', kind: 'warn' },
		{ text: 'triangulating conception coordinates', kind: 'sys' },
		{ text: `decade candidate ... ${$decade ?? '??'}`, kind: 'ok' },
		{ text: '', kind: 'blank' },
		{ text: 'match converging', kind: 'hi' }
	];
</script>

<Console tty="tty1" status="searching" geometry="4d" lamp="warn">
	<Terminal {lines} charDelay={11} linePause={190} />
</Console>
