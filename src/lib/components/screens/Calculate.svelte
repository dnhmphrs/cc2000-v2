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

<div class="wrap" out:fade={{ duration: 260 }}>
	<p class="mark" in:fade={{ duration: 900, delay: 300 }}>conception calculator 2000</p>

	<div class="ask" in:fade={{ duration: 900, delay: 1200 }}>
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

	<div class="ask" in:fade={{ duration: 900, delay: 1800 }}>
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

	<div class="go-row" in:fade={{ duration: 900, delay: 2300 }}>
		<button class="go" on:click={calculate} disabled={!complete}>calculate</button>
	</div>
</div>

<style>
	/* Sits in the fluid, low, so the sperm has the middle of the screen. */
	.wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 0 24px max(5vh, 30px);
		pointer-events: none;
		text-align: center;
		text-shadow: 0 2px 14px rgba(60, 6, 26, 0.55);
	}

	.mark {
		font-size: 11px;
		letter-spacing: 0.34em;
		color: rgba(255, 255, 255, 0.72);
		margin: 0 0 6px;
	}

	.ask {
		pointer-events: auto;
	}

	.q {
		font-size: clamp(19px, 2.4vw, 26px);
		color: #fff;
		margin: 0 0 12px;
	}

	.dob {
		display: flex;
		gap: 8px;
		justify-content: center;
		flex-wrap: wrap;
	}

	select {
		font-family: var(--face);
		font-size: 15px;
		background: rgba(60, 6, 26, 0.32);
		border: 1px solid rgba(255, 255, 255, 0.5);
		color: #fff;
		padding: 10px 12px;
		outline: none;
		border-radius: 0;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		backdrop-filter: blur(4px);
	}
	select:focus {
		border-color: var(--yellow);
	}
	select option {
		background: #4d0f2c;
		color: #fff;
	}

	.dial {
		width: min(74vw, 340px);
	}

	.ends {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-top: 8px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.75);
	}
	.num {
		font-size: 22px;
		font-weight: 700;
		color: var(--yellow);
	}

	.go-row {
		pointer-events: auto;
		margin-top: 4px;
	}

	.go-row button {
		padding: 14px 40px;
		font-size: 15px;
	}
</style>
