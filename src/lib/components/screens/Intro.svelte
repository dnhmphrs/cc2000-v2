<script>
	import Terminal from '$lib/components/Terminal.svelte';
	import { expanding } from '$lib/store/store';

	// The cinematic (icosahedron + sperm) is driven by the scene; this is the
	// left-hand boot log that plays alongside it, then fades out as the
	// icosahedron opens so the input screens stay clean.
	const lines = [
		{ text: 'CC://2000 — CONCEPTION CALCULATOR', kind: 'sys' },
		{ text: 'loading temporal dataset...', kind: 'dim' },
		{ text: 'link established.', kind: 'ok' },
		{ text: '...', kind: 'dim' },
		{ text: 'in the earth year 2000, human technology advanced,', kind: 'sys' },
		{ text: 'allowing all of mankind to calculate the song', kind: 'sys' },
		{ text: 'playing at their exact moment of conception.', kind: 'sys' },
		{ text: 'awaiting subject.', kind: 'hi' }
	];
</script>

<div class="intro" class:out={$expanding}>
	<div class="tag">
		<span>CC://2000</span>
		<span class="rule-s" />
		<span>SESSION 0x01 — STANDBY</span>
	</div>
	<Terminal {lines} charDelay={15} linePause={260} />
</div>

<style>
	.intro {
		position: fixed;
		top: 6vh;
		left: max(4vw, 28px);
		max-width: min(46vw, 520px);
		z-index: 20;
		pointer-events: none;
		transition: opacity 0.8s ease;
	}
	.intro.out {
		opacity: 0;
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
