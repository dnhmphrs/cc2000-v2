<script>
	import { phase, sceneState, spicy } from '$lib/store/store';
	import Terminal from '$lib/components/Terminal.svelte';

	// When the scene lands on the resolved decade it sets sceneState → 4.
	$: if ($sceneState >= 4) phase.set('output');

	const lines = [
		{ text: 'INITIALISING HYPERSPACE SEARCH...', kind: 'hi' },
		{ text: 'collapsing waveform across 4 decades', kind: 'sys' },
		{ text: 'projecting subject vector into tesseract lattice', kind: 'sys' },
		{ text: 'cross-referencing 11,486,203 broadcast records', kind: 'sys' },
		{ text: 'golden manifold aligned · φ = 1.6180339887', kind: 'ok' },
		{ text: 'spin-locking icosahedral rotor', kind: 'sys' },
		{ text: `harmonising resonance level ${$spicy}/10`, kind: 'sys' },
		{ text: 'quantum-tunnelling through decade membrane', kind: 'sys' },
		{ text: 'discarding improbable timelines [n=402]', kind: 'alert' },
		{ text: 'triangulating conception coordinates', kind: 'sys' },
		{ text: '...', kind: 'dim' },
		{ text: 'MATCH CONVERGING', kind: 'hi' }
	];
</script>

<div class="proc">
	<div class="tag">
		<span>CC://2000</span>
		<span class="rule-s" />
		<span>SEARCH IN PROGRESS</span>
	</div>
	<Terminal {lines} charDelay={12} linePause={200} />
</div>

<style>
	.proc {
		position: fixed;
		top: 6vh;
		left: max(4vw, 28px);
		max-width: min(46vw, 520px);
		z-index: 20;
		pointer-events: none;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: var(--fg-faint);
		margin-bottom: 18px;
	}
	.rule-s {
		flex: 0 0 42px;
		height: 1px;
		background: var(--fg-ghost);
	}

	@media (max-width: 760px), (orientation: portrait) {
		.proc {
			top: 4vh;
			left: 20px;
			right: 20px;
			max-width: none;
		}
	}
</style>
