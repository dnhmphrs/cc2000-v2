<script>
	import { createEventDispatcher } from 'svelte';

	// ── The lever ────────────────────────────────────────────────────────────
	// How spicy you like it, as a throttle. Drag the handle, roll the wheel over
	// it, or focus it and use the arrows — a slider, and declared as one.
	//
	// Dragging is ABSOLUTE, unlike the dial: the whole range is one short throw,
	// so the handle should go where your thumb is rather than accumulating from
	// wherever you grabbed it. Up is more.

	export let label;
	export let min = 1;
	export let max = 10;
	export let value = min;
	export let low = '';
	export let high = '';

	const dispatch = createEventDispatcher();

	let track;
	let dragging = false;

	$: t = (value - min) / (max - min);

	function commit(v) {
		const c = Math.max(min, Math.min(max, Math.round(v)));
		if (c === value) return;
		value = c;
		dispatch('change', c);
	}

	function at(e) {
		const b = track.getBoundingClientRect();
		// Down the track is less, so the fraction is inverted.
		const f = 1 - (e.clientY - b.top) / b.height;
		commit(min + f * (max - min));
	}

	function down(e) {
		dragging = true;
		track.setPointerCapture(e.pointerId);
		at(e);
	}
	function move(e) {
		if (dragging) at(e);
	}
	function up(e) {
		dragging = false;
		if (track.hasPointerCapture?.(e.pointerId)) track.releasePointerCapture(e.pointerId);
	}

	function wheel(e) {
		e.preventDefault();
		commit(value + (e.deltaY > 0 ? -1 : 1));
	}

	function key(e) {
		const by = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
		if (by) {
			e.preventDefault();
			return commit(value + by);
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
	<span class="cap">{high}</span>
	<div
		class="track"
		bind:this={track}
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		style="--t:{t}"
		on:pointerdown={down}
		on:pointermove={move}
		on:pointerup={up}
		on:pointercancel={up}
		on:wheel={wheel}
		on:keydown={key}
	>
		<i class="slot" />
		<i class="handle"><b>{value}</b></i>
	</div>
	<span class="cap">{low}</span>
</div>

<style>
	.unit {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		pointer-events: auto;
	}

	.track {
		position: relative;
		width: calc(var(--dial) * 0.62);
		height: var(--lever-h);
		display: grid;
		place-items: center;
		cursor: grab;
		touch-action: none;
	}
	.track:active {
		cursor: grabbing;
	}
	.track:focus-visible {
		outline: var(--ink) solid var(--machine-red);
		outline-offset: 4px;
		border-radius: 14px;
	}

	/* The slot the handle runs in. */
	.slot {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: var(--machine-dark);
		border: var(--ink) solid var(--machine-ink);
		box-shadow: inset 0 0 0 3px var(--machine);
	}

	.handle {
		position: absolute;
		left: -14%;
		right: -14%;
		height: calc(var(--dial) * 0.5);
		border-radius: 10px;
		background: var(--machine-red);
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		display: grid;
		place-items: center;
		/* 0 at the bottom of the run, 1 at the top. The 50% keeps the handle's
		   own height out of the travel. */
		bottom: calc(var(--t) * (100% - var(--dial) * 0.5));
	}

	.handle b {
		font-family: var(--tech);
		font-size: calc(var(--dial) * 0.24);
		color: #fff5ec;
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
</style>
