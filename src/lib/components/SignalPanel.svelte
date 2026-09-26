<script>
	import { onMount } from 'svelte';

	// ── The signal panel ─────────────────────────────────────────────────────
	// A box in the top right corner with a dial for every fault the signal
	// pass can put on the picture (three/tsl/crt.js SIGNAL), each with a range
	// wide enough to wreck it. For turning the look while the run plays, not
	// for the run's visitors: it is here while the signal is being found, and
	// goes with the dev harness (config/dev.js DEV.on) when that goes. The
	// dials write the pass's uniforms directly, so nothing here touches the
	// scenes and a pin stays exact; "copy" puts the current numbers on the
	// clipboard as the CRT block in config/space.js wants them, "reset" puts
	// the config's own back.
	//
	// A folded tab by default, so the frame is the frame; ?signal=0 leaves the
	// tab out too, for a contact sheet (scripts/shots.mjs passes it). The pass
	// is imported on mount, in the browser: it is TSL, and three's node
	// modules are never evaluated on the server (see three/Stage.svelte).

	let open = false;
	let shown = true;
	let dials = [];
	let signal = null;
	let reset_ = null;
	let values = {};
	let copied = '';

	function set(k, v) {
		values = { ...values, [k]: v };
		signal[k].value = v;
	}
	function reset() {
		reset_();
		values = Object.fromEntries(dials.map(([k, , v]) => [k, v]));
	}
	async function copy() {
		const text = dials.map(([k]) => `${k}: ${values[k]}`).join(',\n');
		try {
			await navigator.clipboard.writeText(text);
			copied = 'copied';
		} catch {
			copied = text;
		}
		setTimeout(() => (copied = ''), 2200);
	}
	function onKey(e) {
		// The dev keys are on the window; a dial should not hand them a digit.
		e.stopPropagation();
	}

	onMount(async () => {
		shown = new URLSearchParams(window.location.search).get('signal') !== '0';
		if (!shown) return;
		const m = await import('$lib/three/tsl/crt');
		dials = m.DIALS;
		signal = m.SIGNAL;
		reset_ = m.resetSignal;
		// Whatever ?crt= set before the panel came up.
		values = Object.fromEntries(dials.map(([k]) => [k, signal[k].value]));
	});
</script>

{#if signal && shown}
	<div class="signal" class:open>
		<button class="tab" type="button" on:click={() => (open = !open)} aria-expanded={open}>
			signal {open ? '−' : '+'}
		</button>
		{#if open}
			<div class="dials" role="group" aria-label="the signal's dials">
				{#each dials as [k, label, , min, max, stepSize] (k)}
					<label class="dial">
						<span class="name">{label}</span>
						<input
							type="range"
							{min}
							{max}
							step={stepSize}
							value={values[k]}
							on:input={(e) => set(k, Number(e.currentTarget.value))}
							on:keydown={onKey}
						/>
						<span class="val">{values[k]}</span>
					</label>
				{/each}
				<div class="row">
					<button type="button" on:click={reset}>reset</button>
					<button type="button" on:click={copy}>copy</button>
					{#if copied}<span class="note">{copied}</span>{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.signal {
		position: fixed;
		top: 12px;
		right: 12px;
		/* Over the raster: a dial you cannot read is not a dial. */
		z-index: 40;
		font-family: var(--tech);
		font-size: 10px;
		letter-spacing: 0.06em;
		color: var(--ink);
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
	}
	.tab,
	.row button {
		font: inherit;
		text-transform: uppercase;
		letter-spacing: 0.22em;
		color: var(--yellow);
		background: rgba(10, 10, 12, 0.82);
		border: 1px solid rgba(255, 212, 38, 0.45);
		border-radius: 2px;
		padding: 0.5em 0.9em;
		cursor: pointer;
	}
	.tab:hover,
	.row button:hover {
		background: var(--yellow);
		color: var(--on-yellow);
	}
	.dials {
		width: min(300px, 84vw);
		max-height: min(80vh, 720px);
		overflow-y: auto;
		padding: 10px 12px;
		background: rgba(10, 10, 12, 0.86);
		border: 1px solid rgba(255, 212, 38, 0.45);
		border-radius: 3px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.dial {
		display: grid;
		grid-template-columns: 7.5em 1fr 3.6em;
		align-items: center;
		gap: 8px;
	}
	.name {
		color: var(--ink-soft);
		text-transform: lowercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.val {
		text-align: right;
		color: var(--yellow);
		font-variant-numeric: tabular-nums;
	}
	input[type='range'] {
		width: 100%;
		margin: 0;
		accent-color: var(--yellow);
		height: 14px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 6px;
	}
	.note {
		color: var(--ink-soft);
		white-space: pre;
		max-width: 12em;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
