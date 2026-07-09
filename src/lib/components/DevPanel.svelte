<script>
	import { phase, sceneState, decade, isPortrait } from '$lib/store/store';
	import { paletteKey, PALETTES } from '$lib/theme';

	let open = false;

	const phases = ['intro', 'calculate', 'transition', 'output'];
	const decades = ['50s', '60s', '90s', '10s'];
	const paletteKeys = Object.keys(PALETTES);
</script>

<div class="dev" class:open>
	<button class="toggle" on:click={() => open = !open}>
		{open ? '×' : 'dev'}
	</button>

	{#if open}
		<div class="panel">
			<div class="section">
				<span class="lbl">phase</span>
				<div class="row">
					{#each phases as p}
						<button class:active={$phase === p} on:click={() => phase.set(p)}>{p}</button>
					{/each}
				</div>
			</div>

			<div class="section">
				<span class="lbl">scene: {$sceneState} | {$isPortrait ? 'portrait' : 'landscape'}</span>
				<div class="row">
					{#each [0, 1, 2, 3, 4] as s}
						<button class:active={$sceneState === s} on:click={() => sceneState.set(s)}>{s}</button>
					{/each}
				</div>
			</div>

			<div class="section">
				<span class="lbl">decade</span>
				<div class="row">
					{#each decades as d}
						<button class:active={$decade === d} on:click={() => decade.set(d)}>{d}</button>
					{/each}
				</div>
			</div>

			<div class="section">
				<span class="lbl">accent</span>
				<div class="row">
					{#each paletteKeys as k}
						<button class:active={$paletteKey === k} on:click={() => paletteKey.set(k)}>
							<span class="sw" style="background:#{PALETTES[k].line.toString(16).padStart(6, '0')}" />{k}
						</button>
					{/each}
				</div>
			</div>

		</div>
	{/if}
</div>

<style>
	.dev {
		position: fixed; top: 12px; right: 12px; z-index: 1000;
		font-family: var(--mono);
	}
	.toggle {
		font-size: 9px; padding: 4px 8px;
		border: 1px solid var(--fg-faint);
		background: rgba(35, 35, 35, 0.8);
		color: var(--fg-dim);
		backdrop-filter: blur(4px);
	}
	.panel {
		margin-top: 6px; padding: 10px;
		background: rgba(35, 35, 35, 0.9);
		border: 1px solid var(--fg-faint);
		backdrop-filter: blur(8px);
		display: flex; flex-direction: column; gap: 10px;
		min-width: 200px;
	}
	.section { display: flex; flex-direction: column; gap: 4px; }
	.lbl {
		font-size: 9px; color: var(--fg-faint);
		text-transform: uppercase; letter-spacing: 0.1em;
	}
	.row { display: flex; gap: 4px; flex-wrap: wrap; }
	.row button {
		font-size: 9px; padding: 3px 6px;
		border: 1px solid var(--fg-faint);
		background: transparent; color: var(--fg-faint);
	}
	.row button.active { border-color: var(--fg-dim); color: var(--fg); }
	.sw {
		display: inline-block;
		width: 8px; height: 8px;
		margin-right: 4px;
		vertical-align: middle;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
