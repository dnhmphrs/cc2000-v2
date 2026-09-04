<script>
	// The pinned top-left console shell: an ident strip (device, geometry, lamp)
	// above whatever terminal output is being printed into it. Shared by the boot
	// log and the search log so both read as the same machine.
	export let tty = 'tty0';
	export let status = 'online';
	export let geometry = '80×24';
	export let lamp = ''; // '' | 'good' | 'warn'
</script>

<div class="console">
	<div class="chrome">
		<span class="id">CC://2000</span>
		<span class="bar" />
		<span>{tty}</span>
		<span class="bar" />
		<span class="geo">{geometry}</span>
		<span class="bar" />
		<span class="live"><i class="led {lamp}" />{status}</span>
	</div>

	<slot />
</div>

<style>
	.console {
		position: fixed;
		top: max(6vh, 46px);
		left: max(4vw, 26px);
		width: min(52vw, 560px);
		z-index: 20;
		padding: 12px 16px 14px;
		border-left: 1px solid var(--fg-ghost);
		background: linear-gradient(90deg, rgba(var(--fg-rgb), 0.038), transparent 62%);
		pointer-events: none;
	}

	/* Tick above and below the ident strip — the console's own bracket. */
	.console::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 0;
		width: 11px;
		height: 1px;
		background: var(--fg);
	}
	.console::after {
		content: '';
		position: absolute;
		left: -1px;
		bottom: 0;
		width: 11px;
		height: 1px;
		background: var(--fg);
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 14px;
		font-family: var(--tech);
		font-size: 8px;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: var(--fg-faint);
	}
	.chrome .id {
		color: var(--fg);
	}
	.chrome .bar {
		flex: 0 0 16px;
		height: 1px;
		background: var(--fg-ghost);
	}
	.chrome .live {
		display: flex;
		align-items: center;
		color: var(--fg-dim);
	}

	@media (max-width: 760px), (orientation: portrait) {
		.console {
			top: max(4vh, 30px);
			left: 16px;
			right: 16px;
			width: auto;
			padding: 10px 12px 12px;
		}
		.chrome .bar {
			flex-basis: 10px;
		}
		.chrome .geo {
			display: none;
		}
	}
</style>
