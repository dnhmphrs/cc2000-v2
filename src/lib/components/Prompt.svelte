<script>
	import { get } from 'svelte/store';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		dobMonth,
		dobDay,
		dobYear,
		spicy,
		date,
		gate,
		edge,
		track,
		conceived,
		decade
	} from '$lib/store/store';
	import { resolve, earliestBirthday } from '$lib/functions/answer';

	// ── The two questions, asked mid-flight ──────────────────────────────────
	// V3 has no machine, so the run takes its two answers on the way in: the
	// birthday over the swimmer, and the spice once the ovum is up. The flight
	// is HELD while either is open — see the `gate` store — so nothing arrives at
	// the egg before it has been told what to look for.
	//
	// The controls are the machine's own: the clean HTML selects that lived on
	// the CRT, not the rotary dials. They write the same three stores, so
	// functions/answer.js sees exactly what it always saw.

	export let which; // 'dob' | 'spicy'

	const MONTHS = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec'
	];
	// The archive's own floor — see functions/answer.js ARCHIVE_START.
	const MIN_YEAR = 1958;
	const MAX_YEAR = new Date().getFullYear();
	const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

	// The day list follows the month, and a day already past the end of a shorter
	// month is clamped rather than cleared — picking the year last must not
	// silently wipe a 29th and leave the button dead with no explanation.
	$: maxDay = $dobMonth && $dobYear ? new Date(+$dobYear, +$dobMonth, 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	$: if ($dobDay && Number($dobDay) > maxDay) dobDay.set(maxDay);
	$: complete = $dobMonth && $dobDay && $dobYear;

	// ── Out of range is reported HERE ────────────────────────────────────────
	// There is no calculator left to report it on, and there is no room to fall
	// into, so this popup is the only thing that can say so — and it must refuse
	// to close rather than letting the flight carry an unanswerable date into the
	// conception. The message is the machine's own.
	const EDGE = {
		past: 'you were born in the time of dinosaurs. there was no music.',
		future:
			'you were born in the After Time. those lucky enough to be born were ' +
			'conceived to "Baby" by Justin Bieber, as it is the only remaining ' +
			'music allowed by The Council.'
	};

	let refused = null;
	// Any change to the dials clears the last refusal — a new question is being
	// asked and the old answer is not about it.
	$: if ($dobMonth || $dobDay || $dobYear) refused = null;

	function submit() {
		if (which === 'dob') {
			if (!complete) return;
			const iso = `${$dobYear}-${String($dobMonth).padStart(2, '0')}-${String($dobDay).padStart(
				2,
				'0'
			)}`;
			// The spice is not in yet, so this asks the archive the only question it
			// can answer without it: is this date answerable AT ALL. resolve()'s two
			// edge tests are on the date alone, so any level gives the same verdict.
			const probe = resolve(iso, 1);
			if (probe.edge) {
				refused = probe.edge;
				edge.set(probe.edge);
				return;
			}
			edge.set(null);
			date.set(iso);
		} else {
			// ── THE ANSWER, WORKED OUT HERE ──────────────────────────────────
			// This is the last thing that knows both halves, so it is where the
			// archive is finally asked. The machine used to do it before the flight
			// started; the flight now does it half way in, which is the only real
			// consequence of moving the questions into the run — everything
			// downstream reads the same three stores it always read.
			//
			// The date has already been proved answerable by the first popup, so
			// this cannot come back an edge; if it somehow does, the run is stopped
			// rather than flown into a conception with nothing at the end of it.
			const found = resolve(get(date), $spicy);
			if (found.edge) {
				edge.set(found.edge);
				gate.set('dob');
				return;
			}
			track.set(found.track);
			conceived.set(found.conceived);
			decade.set(found.decade);
		}
		gate.set(null);
	}
</script>

<div class="veil" transition:fade={{ duration: 260 }}>
	<div class="ask" in:scale={{ duration: 320, start: 0.94, easing: cubicOut }}>
		{#if which === 'dob'}
			<p class="q">when were you born?</p>
			<div class="row">
				<select bind:value={$dobDay} aria-label="day">
					{#each days as d}<option value={d}>{String(d).padStart(2, '0')}</option>{/each}
				</select>
				<select bind:value={$dobMonth} aria-label="month">
					{#each MONTHS as m, i}<option value={i + 1}>{m.toUpperCase()}</option>{/each}
				</select>
				<select bind:value={$dobYear} aria-label="year">
					{#each YEARS as y}<option value={y}>{y}</option>{/each}
				</select>
			</div>
			{#if refused}
				<p class="no">
					<span class="head">error — out of range</span>
					{EDGE[refused]}
					{#if refused === 'past'}
						<span class="hint">the archive starts at {earliestBirthday()}.</span>
					{/if}
				</p>
			{/if}
		{:else}
			<p class="q">how spicy do your parents like it?</p>
			<div class="row">
				<select bind:value={$spicy} aria-label="spicy">
					{#each Array.from({ length: 10 }, (_, i) => i + 1) as n}
						<option value={n}>{String(n).padStart(2, '0')}</option>
					{/each}
				</select>
				<span class="of">/ 10</span>
			</div>
		{/if}

		<button class="go" on:click={submit} disabled={which === 'dob' && !complete}>
			{which === 'dob' ? 'confirm' : 'swim'}
		</button>
	</div>
</div>

<style>
	/* Over the 3D and under the scanlines. `main` is pointer-events:none so the
	   3D shows through the UI layer — anything that wants clicks has to opt back
	   in, and forgetting it renders a perfectly visible control nothing can
	   press. See the note in routes/+layout.svelte. */
	.veil {
		position: fixed;
		inset: 0;
		z-index: 20;
		pointer-events: auto;
		display: grid;
		place-items: center;
		font-family: var(--tech);
		cursor: default;
	}

	/* Glass on the void, in the register of the thing being flown through rather
	   than of a dialog box: no chrome, one hairline, and the ground behind it
	   barely darkened so the swimmer still reads underneath. */
	.ask {
		min-width: min(21rem, 80vw);
		max-width: 92vw;
		padding: clamp(16px, 2.4vh, 24px) clamp(18px, 2.2vw, 30px);
		background: rgba(10, 10, 12, 0.82);
		border: 1px solid rgba(255, 212, 38, 0.28);
		border-radius: 3px;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), 0 24px 70px rgba(0, 0, 0, 0.55);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(10px, 1.5vh, 16px);
		text-align: center;
	}

	.q {
		margin: 0;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: rgba(240, 242, 248, 0.62);
	}

	.row {
		display: flex;
		align-items: baseline;
		gap: clamp(8px, 0.9vw, 16px);
	}

	/* The machine's own controls, lifted — but WITHOUT THE ARROW, which is most
	   of why they read as huge. A native select reserves a chunk of width for a
	   dropdown chevron it draws itself, in the platform's own weight and colour,
	   and next to type this size it is the largest and least considered mark on
	   the panel. Suppressing it leaves the value and its rule, which reads as a
	   field rather than as a widget, and the whole panel comes in.

	   `appearance: none` is set globally by the `*` reset in styles.css, but
	   Chromium keeps the indicator on a select regardless: it takes the
	   -webkit-appearance form specifically. */
	.row select {
		appearance: none;
		-webkit-appearance: none;
		font: inherit;
		font-size: clamp(12px, 1.15vw, 16px);
		letter-spacing: 0.1em;
		text-align: center;
		text-align-last: center;
		color: var(--yellow);
		background: transparent;
		border: 0;
		border-bottom: 1px solid rgba(255, 212, 38, 0.32);
		border-radius: 0;
		padding: 0 0.15em 3px;
		cursor: pointer;
		outline: none;
	}
	.row select:focus-visible {
		border-bottom-style: solid;
		border-bottom-color: var(--yellow);
	}
	/* The list is drawn by the OS, so it gets the void's own colours rather than
	   a white sheet dropping out of a black screen. */
	.row select option {
		background: var(--machine-crt);
		color: rgba(240, 242, 248, 0.85);
	}
	.of {
		font-size: clamp(10px, 0.95vw, 13px);
		letter-spacing: 0.08em;
		color: rgba(240, 242, 248, 0.45);
	}

	.no {
		margin: 0;
		max-width: 30rem;
		font-size: clamp(9px, 0.82vw, 11px);
		line-height: 1.65;
		color: rgba(240, 242, 248, 0.7);
	}
	.no .head {
		display: block;
		font-size: clamp(8px, 0.76vw, 10px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--machine-lamp);
		margin-bottom: 0.5em;
	}
	.no .hint {
		display: block;
		margin-top: 0.5em;
		color: rgba(240, 242, 248, 0.4);
	}

	.go {
		margin-top: 0.2em;
		font: inherit;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--yellow);
		background: transparent;
		border: 1px solid rgba(255, 212, 38, 0.4);
		border-radius: 2px;
		padding: 0.75em 2.2em;
		cursor: pointer;
		transition: background 0.18s, color 0.18s, border-color 0.18s;
	}
	.go:hover:not(:disabled) {
		background: var(--yellow);
		border-color: var(--yellow);
		color: var(--on-yellow);
	}
	.go:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
