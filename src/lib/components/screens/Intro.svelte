<script>
	import Terminal from '$lib/components/Terminal.svelte';

	// The cinematic (icosahedron + sperm) is driven by the scene; this is the
	// left-hand boot log that plays alongside it. No central box, no button —
	// the flow advances itself to the input panel once the sequence completes.
	const lines = [
		{ text: 'SYSTEM BOOT...', kind: 'sys' },
		{ text: '...', kind: 'dim' },
		{ text: 'NODE SYNCHRONISATION...', kind: 'sys' },
		{ text: 'LINK ESTABLISHED.', kind: 'ok' },
		{ text: 'LOADING TEMPORAL DATASET...', kind: 'sys' },
		{ text: '...', kind: 'dim' },
		{ text: 'in the earth year 2000, human technology advanced.', kind: 'sys' },
		{ text: 'a method was discovered.', kind: 'hi' },
		{ text: 'every song ever broadcast — indexed against every heartbeat.', kind: 'sys' },
		{ text: 'allowing all of mankind to calculate the exact track', kind: 'sys' },
		{ text: 'playing at their precise moment of conception.', kind: 'sys' },
		{ text: '...', kind: 'dim' },
		{ text: 'CALIBRATING RESONANCE CHAMBER...', kind: 'sys' },
		{ text: 'INJECTING SEED VECTOR...', kind: 'alert' },
		{ text: 'GEOMETRY LOCK: ICOSAHEDRON [12v / 30e / 20f]', kind: 'sys' },
		{ text: 'awaiting subject input.', kind: 'hi' }
	];
</script>

<div class="intro">
	<div class="tag">
		<span>CC://2000</span>
		<span class="rule-s" />
		<span>SESSION 0x01 — STANDBY</span>
	</div>
	<Terminal {lines} charDelay={13} linePause={190} />
</div>

<style>
	.intro {
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
		.intro {
			top: 4vh;
			left: 20px;
			right: 20px;
			max-width: none;
		}
	}
</style>
