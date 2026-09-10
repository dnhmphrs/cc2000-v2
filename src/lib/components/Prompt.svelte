<script>
	import { onMount, tick } from 'svelte';
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

	// ── What a screen reader is told ─────────────────────────────────────────
	// A LIVE REGION THAT IS ALWAYS THERE. role="alert" on a node that is itself
	// inserted is not reliably spoken — several screen readers only announce
	// changes to a region that already existed — so this element is permanent
	// and only its text changes. The visible machine-voice block stays exactly
	// as it was and is hidden from AT so the refusal is not read twice.
	let status = '';
	// And a place to say why the button will not do anything yet, which is the
	// thing `disabled` used to hide from the people who most needed it.
	$: hint = which === 'dob' && !complete ? 'pick a day, a month and a year.' : '';

	// The panel takes focus when it opens AND when the question changes: it is
	// one component instance for both, so nothing else would move focus from
	// the birthday to the spice.
	let panel;
	let yearSel;
	const focusPanel = async () => {
		await tick();
		panel?.focus();
	};
	onMount(focusPanel);
	$: if (which) focusPanel();

	// ── The trap ─────────────────────────────────────────────────────────────
	// A modal that cannot be escaped, deliberately: the flight is HELD until it
	// is answered and there is no machine to fall back to, so there is nowhere
	// for Escape to go. What that costs is a duty to keep every control inside
	// reachable, which is why the submit button is aria-disabled rather than
	// disabled — see below.
	function corral(e) {
		if (e.key !== 'Tab') return;
		const f = [...panel.querySelectorAll('select, button')].filter((n) => !n.disabled);
		if (!f.length) return;
		const first = f[0];
		const last = f[f.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	// Nothing here is essential motion, and a panel scaling up over a moving 3D
	// backdrop is exactly the kind of thing that provokes vestibular symptoms.
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	async function submit() {
		if (which === 'dob') {
			if (!complete) {
				status = hint;
				return;
			}
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
				// Spoken, and then the caret is put on the field that is at fault:
				// for both edges it is the year.
				status = `out of range. ${EDGE[probe.edge]}`;
				await tick();
				yearSel?.focus();
				return;
			}
			status = '';
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

<div class="veil" transition:fade={{ duration: reduced ? 0 : 260 }}>
	<!-- A DIALOG, and it says so. It was two bare divs, which means assistive
	     technology was told nothing had appeared and the run simply stopped
	     responding. Named by the question itself, focused on open, and Tab is
	     corralled inside it — the flight is held until this is answered, so
	     there is nowhere else for focus to usefully be. -->
	<form
		class="ask"
		bind:this={panel}
		on:submit|preventDefault={submit}
		on:keydown={corral}
		role="dialog"
		aria-modal="true"
		aria-labelledby="ask-q"
		tabindex="-1"
		in:scale={{ duration: reduced ? 0 : 320, start: reduced ? 1 : 0.94, easing: cubicOut }}
	>
		{#if which === 'dob'}
			<!-- fieldset/legend, so the three selects are a GROUP with a name. As
			     three loose selects, a screen reader on the middle one said only
			     "month" and never what the date was for. -->
			<fieldset>
				<legend id="ask-q" class="q">when were you born?</legend>
				<div class="row">
					<label class="sr-only" for="ask-day">day</label>
					<select
						id="ask-day"
						bind:value={$dobDay}
						autocomplete="bday-day"
						aria-describedby="ask-status"
						aria-invalid={refused ? 'true' : 'false'}
					>
						{#each days as d}<option value={d}>{String(d).padStart(2, '0')}</option>{/each}
					</select>
					<label class="sr-only" for="ask-month">month</label>
					<select
						id="ask-month"
						bind:value={$dobMonth}
						autocomplete="bday-month"
						aria-describedby="ask-status"
						aria-invalid={refused ? 'true' : 'false'}
					>
						{#each MONTHS as m, i}<option value={i + 1}>{m.toUpperCase()}</option>{/each}
					</select>
					<label class="sr-only" for="ask-year">year</label>
					<select
						id="ask-year"
						bind:this={yearSel}
						bind:value={$dobYear}
						autocomplete="bday-year"
						aria-describedby="ask-status"
						aria-invalid={refused ? 'true' : 'false'}
					>
						{#each YEARS as y}<option value={y}>{y}</option>{/each}
					</select>
				</div>
			</fieldset>
			{#if refused}
				<!-- The machine's own voice, on screen. Hidden from AT because the
				     live region below has already said it, in fewer words. -->
				<p class="no" aria-hidden="true">
					<span class="head">error — out of range</span>
					{EDGE[refused]}
					{#if refused === 'past'}
						<span class="hint">the archive starts at {earliestBirthday()}.</span>
					{/if}
				</p>
			{/if}
		{:else}
			<label id="ask-q" class="q" for="ask-spicy">how spicy are your parents?</label>
			<div class="row">
				<select id="ask-spicy" bind:value={$spicy} aria-describedby="ask-status">
					{#each Array.from({ length: 10 }, (_, i) => i + 1) as n}
						<option value={n}>{String(n).padStart(2, '0')}</option>
					{/each}
				</select>
				<span class="of">/ 10</span>
			</div>
		{/if}

		<!-- ALWAYS IN THE DOM, never display:none, only its text changes. A
		     role="alert" node that is itself inserted is not reliably spoken. -->
		<p id="ask-status" class="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
			{status}
		</p>

		<!-- aria-disabled, NOT disabled. `disabled` takes the button out of the
		     tab order and out of most reading orders, so the one thing saying
		     "this is not finished" became the one thing a keyboard user could
		     not find — in a dialog with no way out. It stays reachable and says
		     why when pressed. -->
		<button
			class="go"
			type="submit"
			aria-disabled={which === 'dob' && !complete}
			aria-describedby={hint ? 'ask-status' : undefined}
		>
			{which === 'dob' ? 'confirm' : 'calculate'}
		</button>
	</form>
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
		border: 1px solid rgba(255, 212, 38, 0.45);
		border-radius: 3px;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), 0 24px 70px rgba(0, 0, 0, 0.55);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(10px, 1.5vh, 16px);
		text-align: center;
	}

	/* A fieldset is not a flex container until it is told to be one, and a
	   legend brings UA padding and a border cut-out with it. */
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: inherit;
	}
	legend {
		display: block;
		float: none;
		width: auto;
		padding: 0;
		margin: 0 0 clamp(10px, 1.5vh, 16px);
	}

	/* Present to a screen reader, absent to the eye. The labels are real
	   <label for> elements rather than aria-label: translatable, and the
	   accessible name IS the visible word for anyone driving by voice. */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.q {
		margin: 0;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		/* Was 0.62 — 6.8:1, an AA pass and still visibly grey. This is the one
		   line on the panel that has to be read, so it takes the top step. */
		color: var(--ink-strong);
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
		/* This underline is the control's ONLY visual boundary — appearance is
		   suppressed, the border is gone and the chevron with it — so 1.4.11
		   Non-text Contrast applies to it and wants 3:1. At 0.32 it was 2.38. */
		border-bottom: 1px solid rgba(255, 212, 38, 0.55);
		border-radius: 0;
		padding: 0 0.15em 3px;
		cursor: pointer;
		outline: none;
	}
	/* A 1px underline changing shade, on a panel whose entire vocabulary is 1px
	   yellow lines, is not a focus indicator you can find. */
	.row select:focus-visible,
	.go:focus-visible {
		outline: 2px solid var(--yellow);
		outline-offset: 3px;
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
		/* 0.45 was 4.16:1 — under AA. */
		color: var(--ink-soft);
	}

	.no {
		margin: 0;
		max-width: 30rem;
		font-size: clamp(9px, 0.82vw, 11px);
		line-height: 1.65;
		color: var(--ink-body);
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
		/* 0.40 was 3.55:1 — under AA. */
		color: var(--ink-soft);
	}

	.go {
		margin-top: 0.2em;
		font: inherit;
		font-size: clamp(8px, 0.74vw, 10px);
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--yellow);
		background: transparent;
		border: 1px solid rgba(255, 212, 38, 0.55);
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
	.go[aria-disabled='true'] {
		opacity: 0.5;
		cursor: default;
	}

	@media (prefers-reduced-motion: reduce) {
		.go {
			transition: none;
		}
	}
</style>
