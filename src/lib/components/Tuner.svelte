<script>
	import { createEventDispatcher } from 'svelte';

	// ── The tuning dial ──────────────────────────────────────────────────────
	// The year, as the band on a car radio: one wide scale with the whole range
	// laid out along it and a needle you slide to a station. Sixty-eight years is
	// far too many for a knob — on a rotary dial it is five turns of guessing —
	// and on a band it is one sweep with every year in view the whole time.
	//
	// Dragging is ABSOLUTE, like the lever and unlike the dials: on a scale you
	// can see, the needle goes where you put it.
	//
	// It starts UNSET, with no needle and a '--' readout. The first press puts
	// the needle where you pressed, which is the whole idea of a band.

	export let label;
	export let min;
	export let max;
	export let value = '';
	export let start = min;
	// A labelled tick every `major` years; a bare one on all the rest.
	export let major = 10;

	const dispatch = createEventDispatcher();

	let band;
	let dragging = false;

	$: set = value !== '' && value != null;
	$: t = set ? (value - min) / (max - min) : 0;
	$: years = Array.from({ length: max - min + 1 }, (_, i) => min + i);

	const clamp = (v) => Math.max(min, Math.min(max, Math.round(v)));

	function commit(v) {
		const c = clamp(v);
		if (c === value) return;
		value = c;
		dispatch('change', c);
	}

	function at(e) {
		const b = band.getBoundingClientRect();
		commit(min + ((e.clientX - b.left) / b.width) * (max - min));
	}

	function down(e) {
		dragging = true;
		band.setPointerCapture(e.pointerId);
		at(e);
	}
	function move(e) {
		if (dragging) at(e);
	}
	function up(e) {
		dragging = false;
		if (band.hasPointerCapture?.(e.pointerId)) band.releasePointerCapture(e.pointerId);
	}

	function step(n) {
		commit(set ? value + n : start);
	}

	function wheel(e) {
		e.preventDefault();
		step(e.deltaY > 0 ? -1 : 1);
	}

	function key(e) {
		const by = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
		if (by) {
			e.preventDefault();
			return step(by);
		}
		if (e.key === 'PageUp' || e.key === 'PageDown') {
			e.preventDefault();
			return step(e.key === 'PageUp' ? major : -major);
		}
		if (e.key === 'Home') {
			e.preventDefault();
			return commit(min);
		}
		if (e.key === 'End') {
			e.preventDefault();
			return commit(max);
		}
	}
</script>

<div class="unit">
	<div
		class="band"
		class:set
		bind:this={band}
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={set ? value : undefined}
		aria-valuetext={set ? String(value) : 'not set'}
		style="--t:{t}"
		on:pointerdown={down}
		on:pointermove={move}
		on:pointerup={up}
		on:pointercancel={up}
		on:wheel={wheel}
		on:keydown={key}
	>
		<div class="scale">
			{#each years as y}
				<i
					class="tick"
					class:major={y % major === 0}
					style="left:{((y - min) / (max - min)) * 100}%"
				/>
			{/each}
			{#each years.filter((y) => y % major === 0) as y}
				<span class="mark" style="left:{((y - min) / (max - min)) * 100}%">{y}</span>
			{/each}
		</div>
		<i class="needle" />
	</div>
	<span class="cap">year <b>{set ? value : '--'}</b></span>
</div>

<style>
	.unit {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7px;
		pointer-events: auto;
	}

	.band {
		position: relative;
		width: 100%;
		height: 52px;
		border-radius: 12px;
		background: var(--machine-light);
		border: var(--pen) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		cursor: grab;
		touch-action: none;
		overflow: hidden;
	}
	.band:active {
		cursor: grabbing;
	}
	.band:focus-visible {
		outline: var(--pen) solid var(--machine-red);
		outline-offset: 4px;
	}

	/* Inset so a tick at either end is not sitting under the border. */
	.scale {
		position: absolute;
		inset: 0 14px;
	}

	.tick {
		position: absolute;
		top: 6px;
		width: 2px;
		height: 9px;
		background: var(--machine-ink);
		opacity: 0.45;
		transform: translateX(-1px);
	}
	.tick.major {
		height: 17px;
		opacity: 1;
		width: 3px;
	}

	.mark {
		position: absolute;
		top: 26px;
		transform: translateX(-50%);
		font-family: var(--tech);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--machine-ink);
	}

	/* The needle. Hidden until the band has been tuned, because a needle parked
	   at one end reads as a year you chose rather than as no answer yet. */
	.needle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--machine-red);
		box-shadow: 0 0 0 1px var(--machine-ink);
		left: calc(14px + var(--t) * (100% - 28px));
		opacity: 0;
	}
	.band.set .needle {
		opacity: 1;
	}

	.cap {
		font-family: var(--tech);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--machine-ink);
		opacity: 0.75;
	}
	.cap b {
		font-size: 12px;
		letter-spacing: 0.06em;
		opacity: 1;
	}
</style>
