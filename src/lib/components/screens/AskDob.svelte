<script>
	import { phase, dob, date, sceneState } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Question 1, asked once the sperm has closed in and the egg is out of the
	// fog. Answering it sends it closer still, and the scene raises the next
	// phase when that move finishes.
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

	let sent = false;

	$: ({ month, day, year } = $dob);
	$: maxDay = month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	$: complete = month && day && year;

	function set(key, value) {
		const next = { ...$dob, [key]: value };
		// Clamp rather than clear: picking the year last used to silently wipe a
		// day of 29–31 and leave the button dead with no explanation.
		const md = next.month && next.year ? new Date(+next.year, +next.month, 0).getDate() : 31;
		if (next.day && Number(next.day) > md) next.day = md;
		dob.set(next);
	}

	function next() {
		if (!complete) return;
		date.set(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
		sent = true;
		sceneState.set(2); // swim closer; the scene raises 'spicy' when it lands
	}

	// Belt and braces: if the scene never answers, don't strand anyone.
	$: if (sent && $phase === 'dob') {
		setTimeout(() => {
			if ($phase === 'dob') phase.set('spicy');
		}, 4000);
	}
</script>

{#if !sent}
	<div class="shell" in:fade={{ duration: 340 }} out:fade={{ duration: 200 }}>
		<div class="panel">
			<p class="q">when were you born?</p>
			<div class="dob">
				<select value={month} on:change={(e) => set('month', e.target.value)} aria-label="month">
					<option value="" disabled>month</option>
					{#each MONTHS as m, i}<option value={i + 1}>{m}</option>{/each}
				</select>
				<select value={day} on:change={(e) => set('day', e.target.value)} aria-label="day">
					<option value="" disabled>day</option>
					{#each days as d}<option value={d}>{d}</option>{/each}
				</select>
				<select value={year} on:change={(e) => set('year', e.target.value)} aria-label="year">
					<option value="" disabled>year</option>
					{#each YEARS as y}<option value={y}>{y}</option>{/each}
				</select>
			</div>
			<button class="go" on:click={next} disabled={!complete}>next</button>
		</div>
	</div>
{/if}
