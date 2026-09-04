<script>
	import { phase, date, spicy, track, decade, conceived, edge, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	// Two fields, per the brief, put to you while you are already in the tube.
	// No panel: a card floating in the fluid was the thing that read as a menu
	// bolted onto the front of the site.
	const MIN_YEAR = 1958;
	const MAX_YEAR = new Date().getFullYear();

	const MONTHS = [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december'
	];
	const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

	let month = '';
	let day = '';
	let year = '';

	// Days in the selected month, so 31 February can't be picked.
	$: maxDay = month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	$: if (day && Number(day) > maxDay) day = '';
	$: complete = month && day && year;
	$: if (complete) {
		date.set(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
	}

	function calculate() {
		let cd = conceptionDate($date);
		const today = new Date().toISOString().slice(0, 10);

		// The archive starts in 1958 and nobody has been conceived after today.
		if (cd <= '1958-06-01') {
			edge.set('past');
			phase.set('output');
			return;
		}
		if ($date >= today) {
			edge.set('future');
			phase.set('output');
			return;
		}

		let found = null;
		for (let i = 0; i < 30; i++) {
			// Each day holds 10 tracks ordered spicy 10 → 1 (index 0 → 9), so the
			// track matching the chosen level is at index (10 - spicy).
			const d = data[cd];
			if (d && d[10 - $spicy]) {
				found = d[10 - $spicy];
				break;
			}
			cd = previousDay(cd);
		}

		if (found) {
			edge.set(null);
			track.set(found);
			conceived.set(cd);
			decade.set(dateToDecade(cd));
			sceneState.set(1);
			phase.set('processing');
		}
	}
</script>

<div class="shell" in:fade={{ duration: 320 }} out:fade={{ duration: 220 }}>
	<div class="panel">
		<div class="ask">
			<p class="q">when were you born?</p>
			<div class="dob">
				<select bind:value={month} aria-label="month">
					<option value="" disabled>month</option>
					{#each MONTHS as m, i}<option value={i + 1}>{m}</option>{/each}
				</select>
				<select bind:value={day} aria-label="day">
					<option value="" disabled>day</option>
					{#each days as d}<option value={d}>{d}</option>{/each}
				</select>
				<select bind:value={year} aria-label="year">
					<option value="" disabled>year</option>
					{#each YEARS as y}<option value={y}>{y}</option>{/each}
				</select>
			</div>
		</div>

		<div class="ask second">
			<p class="q">how spicy do you like it?</p>
			<div class="dial">
				<input type="range" bind:value={$spicy} min="1" max="10" />
				<div class="ends">
					<span>sweet</span>
					<span class="num">{$spicy}</span>
					<span>filthy</span>
				</div>
			</div>
		</div>

		<button class="go" on:click={calculate} disabled={!complete}>calculate</button>
	</div>
</div>

<style>
	.shell {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		pointer-events: none;
	}

	/* A plain pop-up over the scene. One box, a rule between the two questions,
	   and nothing else on it. */
	.panel {
		width: 100%;
		max-width: 340px;
		background: var(--panel);
		border: 1px solid rgba(var(--ink-rgb), 0.22);
		padding: 24px 24px 22px;
		pointer-events: auto;
		backdrop-filter: blur(6px);
	}

	.ask.second {
		margin-top: 22px;
		padding-top: 22px;
		border-top: 1px solid rgba(var(--ink-rgb), 0.16);
	}

	.q {
		font-size: 17px;
		color: var(--ink);
		margin: 0 0 12px;
	}

	.dob {
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr;
		gap: 6px;
	}

	select {
		font-family: var(--face);
		font-size: 14px;
		background: transparent;
		border: 1px solid rgba(var(--ink-rgb), 0.28);
		color: var(--ink);
		padding: 10px 8px;
		outline: none;
		border-radius: 0;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}
	select:focus {
		border-color: var(--yellow);
	}
	select option {
		background: #0a246a;
		color: var(--ink);
	}

	.dial {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.ends {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 12px;
		color: var(--ink-dim);
	}
	.num {
		font-size: 22px;
		font-weight: 700;
		color: var(--yellow);
	}

	button.go {
		margin-top: 24px;
		width: 100%;
	}
</style>
