<script>
	import { createEventDispatcher } from 'svelte';

	// ── A rotary dial ────────────────────────────────────────────────────────
	// A real control, not a decoration: it is the machine's way of asking for a
	// number. Grab it and turn it, roll the wheel over it, or focus it and use
	// the arrow keys — it is a slider as far as anything assistive is concerned,
	// which is what it actually is.
	//
	// TURNING. The angle to the pointer is tracked and the DIFFERENCE is
	// accumulated, so the dial can be spun round and round: sixty-eight years is
	// not something you pick by dragging to an absolute position. Each delta is
	// taken the short way round the circle, or crossing twelve o'clock would jump
	// the value by a whole revolution.
	//
	// The value starts UNSET and reads '--', like the machine's old select did.
	// The first turn in either direction lands on `start` rather than stepping
	// from nowhere.

	export let label;
	export let min;
	export let max;
	export let value = '';
	// Where the first turn lands.
	export let start = min;
	// How the number is written on the dial's face.
	export let format = (v) => String(v);

	const dispatch = createEventDispatcher();
	const TAU = Math.PI * 2;

	let el;
	let dragging = false;
	let lastAngle = 0;
	let carry = 0;

	$: count = max - min + 1;
	$: set = value !== '' && value != null;
	// One full turn is the whole range, or eighteen steps, whichever is coarser.
	// A twelve-position dial wants a big movement per month; a year dial wants
	// the whole span inside one comfortable sweep.
	$: step = TAU / Math.max(count, 18);
	$: angle = set ? (value - min) * step : 0;

	const clamp = (v) => Math.max(min, Math.min(max, v));

	function commit(v) {
		if (v === value) return;
		value = v;
		dispatch('change', v);
	}

	function bump(n) {
		if (!n) return;
		commit(set ? clamp(value + n) : clamp(start));
	}

	function angleOf(e) {
		const b = el.getBoundingClientRect();
		return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2));
	}

	function down(e) {
		dragging = true;
		carry = 0;
		lastAngle = angleOf(e);
		el.setPointerCapture(e.pointerId);
	}

	function move(e) {
		if (!dragging) return;
		const a = angleOf(e);
		let d = a - lastAngle;
		// The short way round, so passing twelve o'clock is one step, not a turn.
		if (d > Math.PI) d -= TAU;
		if (d < -Math.PI) d += TAU;
		lastAngle = a;

		carry += d / step;
		const n = Math.trunc(carry);
		if (n) {
			carry -= n;
			bump(n);
		}
	}

	function up(e) {
		dragging = false;
		if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
	}

	function wheel(e) {
		e.preventDefault();
		bump(e.deltaY > 0 ? -1 : 1);
	}

	function key(e) {
		const by = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
		if (by) {
			e.preventDefault();
			return bump(by);
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
		class="dial"
		class:set
		bind:this={el}
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={set ? value : undefined}
		aria-valuetext={set ? format(value) : 'not set'}
		style="--a:{angle}rad"
		on:pointerdown={down}
		on:pointermove={move}
		on:pointerup={up}
		on:pointercancel={up}
		on:wheel={wheel}
		on:keydown={key}
	>
		<i class="pointer" />
		<span class="face">{set ? format(value) : '--'}</span>
	</div>
	<span class="cap">{label}</span>
</div>

<style>
	.unit {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		pointer-events: auto;
	}

	.dial {
		position: relative;
		width: var(--dial);
		height: var(--dial);
		border-radius: 50%;
		background: var(--machine-light);
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		display: grid;
		place-items: center;
		cursor: grab;
		touch-action: none;
		/* The whole dial turns, so the pointer and the notch turn with it — but
		   the number does not, or it would be upside down half the time. */
		transform: rotate(var(--a));
		transition: transform 0.12s ease-out;
	}
	.dial:active {
		cursor: grabbing;
		transition: none;
	}
	.dial:focus-visible {
		outline: var(--ink) solid var(--machine-red);
		outline-offset: 4px;
	}

	.pointer {
		position: absolute;
		top: 8%;
		width: 5px;
		height: 26%;
		border-radius: 3px;
		background: var(--machine-ink);
	}

	.face {
		font-family: var(--tech);
		font-size: calc(var(--dial) * 0.26);
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--machine-ink);
		transform: rotate(calc(var(--a) * -1));
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
