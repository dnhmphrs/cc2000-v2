<script>
	import { onMount, onDestroy } from 'svelte';
	import { phase } from '$lib/store/store';

	// Persistent site framing: viewport brackets, an ident block, a phase meter
	// and a running clock. Always on, never interactive — it is what makes the
	// page read as an instrument rather than a centred div on black.
	const STAGES = [
		{ key: 'boot', label: 'boot' },
		{ key: 'calculate', label: 'input' },
		{ key: 'processing', label: 'search' },
		{ key: 'output', label: 'result' }
	];

	$: index = Math.max(
		0,
		STAGES.findIndex((s) => s.key === $phase)
	);

	let clock = '--:--:--';
	let timer;

	function tick() {
		const d = new Date();
		const p = (n, w = 2) => String(n).padStart(w, '0');
		clock = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
	}

	onMount(() => {
		tick();
		timer = setInterval(tick, 1000);
	});
	onDestroy(() => clearInterval(timer));
</script>

<div class="hud" aria-hidden="true">
	<span class="corner tl" />
	<span class="corner tr" />
	<span class="corner bl" />
	<span class="corner br" />

	<div class="ident">
		<span class="mark">CC://2000</span>
		<span>rev 2.0.0</span>
		<span class="live"><i class="led" />live</span>
	</div>

	<div class="status">
		<span class="meter">
			{#each STAGES as s, i (s.key)}
				<span class="seg" class:on={i <= index} class:now={i === index} />
			{/each}
		</span>
		<span class="phase">phase · {STAGES[index].label}</span>
	</div>

	<div class="clock">
		<span>utc {clock}</span>
		<span class="dim">conceived by science · built by magic</span>
	</div>
</div>

<style>
	.hud {
		position: fixed;
		inset: 0;
		z-index: 30;
		pointer-events: none;
		font-family: var(--tech);
		font-size: 8px;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: var(--fg-faint);
		/* The final landing puts a brightly lit room behind all of this, so the
		   chrome carries its own contrast rather than relying on the dark page. */
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.65);
	}

	.hud .led,
	.hud .corner,
	.hud .seg {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
	}

	/* Viewport brackets. */
	.corner {
		position: absolute;
		width: 16px;
		height: 16px;
		border-color: var(--fg-faint);
		border-style: solid;
		border-width: 0;
	}
	.corner.tl {
		top: 14px;
		left: 14px;
		border-top-width: 1px;
		border-left-width: 1px;
	}
	.corner.tr {
		top: 14px;
		right: 14px;
		border-top-width: 1px;
		border-right-width: 1px;
	}
	.corner.bl {
		bottom: 14px;
		left: 14px;
		border-bottom-width: 1px;
		border-left-width: 1px;
	}
	.corner.br {
		bottom: 14px;
		right: 14px;
		border-bottom-width: 1px;
		border-right-width: 1px;
	}

	.ident {
		position: absolute;
		top: 30px;
		right: 30px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 7px;
		text-align: right;
	}
	.ident .mark {
		color: var(--fg);
		letter-spacing: 0.3em;
	}
	.ident .live {
		display: flex;
		align-items: center;
		color: var(--fg-dim);
	}

	.status {
		position: absolute;
		bottom: 30px;
		left: 30px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.meter {
		display: flex;
		gap: 4px;
	}
	.meter .seg {
		width: 16px;
		height: 3px;
		background: var(--fg-ghost);
		transition: background 0.35s;
	}
	.meter .seg.on {
		background: var(--fg-faint);
	}
	.meter .seg.now {
		background: var(--fg);
	}

	.phase {
		color: var(--fg-dim);
	}

	.clock {
		position: absolute;
		bottom: 30px;
		right: 30px;
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.clock .dim {
		color: var(--fg-ghost);
	}

	@media (max-width: 760px), (orientation: portrait) {
		.corner {
			width: 11px;
			height: 11px;
		}
		.corner.tl,
		.corner.tr {
			top: 9px;
		}
		.corner.bl,
		.corner.br {
			bottom: 9px;
		}
		.corner.tl,
		.corner.bl {
			left: 9px;
		}
		.corner.tr,
		.corner.br {
			right: 9px;
		}
		.ident {
			top: 20px;
			right: 20px;
			gap: 5px;
		}
		.ident span:not(.mark):not(.live) {
			display: none;
		}
		.status {
			bottom: 20px;
			left: 20px;
		}
		.clock {
			bottom: 20px;
			right: 20px;
		}
		.clock .dim {
			display: none;
		}
	}
</style>
