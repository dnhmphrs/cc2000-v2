<script>
	import { phase, date, spicy, track, decade, conceived, edge, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	// Beat 2. Two fields, per the brief: birthdate, and the false-flag question.
	// (There was a third — "who are you?" — which nothing downstream ever read.)
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
		// Both used to navigate to /the-past and /the-future — routes this build
		// does not have, so they landed people on the 404 screen.
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

<div class="stage" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }}>
	<div class="col card">
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

		<p class="q second">how spicy do you like it?</p>
		<div class="dial">
			<span class="num">{$spicy}</span>
			<input type="range" bind:value={$spicy} min="1" max="10" />
			<div class="ends"><span>sweet</span><span>filthy</span></div>
		</div>

		<button class="go" on:click={calculate} disabled={!complete}>calculate</button>
	</div>
</div>

<style>
	.q {
		font-size: 17px;
		color: var(--ink);
		margin: 0 0 12px;
	}
	.q.second {
		margin-top: 26px;
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
		border: 1px solid rgba(var(--ink-rgb), 0.26);
		color: var(--ink);
		padding: 10px 8px;
		outline: none;
		border-radius: 0;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}
	select:focus {
		border-color: var(--ink-dim);
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
	.num {
		font-size: 44px;
		font-weight: 700;
		line-height: 1;
		color: var(--yellow);
	}
	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--ink-dim);
	}

	button {
		margin-top: 26px;
		width: 100%;
	}
</style>
