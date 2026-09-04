<script>
	import { phase, dobMonth, dobDay, dobYear, date, sceneState } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Question 1, asked once the sperm has closed in and the egg is out of the
	// fog. Answering it sends it closer still; the scene raises the next phase
	// when that move lands.
	//
	// These are bind:value, not value={...}. A plain value on a <select> whose
	// <option> list re-renders (the day list changes with the month) does not
	// stick — the picked value vanished from the control while the store kept
	// it, so the form looked broken while quietly working.
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

	$: maxDay = $dobMonth && $dobYear ? new Date(+$dobYear, +$dobMonth, 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	// Clamp rather than clear: picking the year last used to silently wipe a day
	// of 29–31 and leave the button dead with no explanation.
	$: if ($dobDay && Number($dobDay) > maxDay) dobDay.set(maxDay);
	$: complete = $dobMonth && $dobDay && $dobYear;

	function next() {
		if (!complete) return;
		date.set(
			`${$dobYear}-${String($dobMonth).padStart(2, '0')}-${String($dobDay).padStart(2, '0')}`
		);
		sent = true;
		sceneState.set(2); // swim closer; the scene raises 'spicy' when it lands
	}

	// Belt and braces: if the scene never answers, don't strand anyone here.
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
				<select bind:value={$dobMonth} aria-label="month">
					<option value="" disabled>month</option>
					{#each MONTHS as m, i}<option value={i + 1}>{m}</option>{/each}
				</select>
				<select bind:value={$dobDay} aria-label="day">
					<option value="" disabled>day</option>
					{#each days as d}<option value={d}>{d}</option>{/each}
				</select>
				<select bind:value={$dobYear} aria-label="year">
					<option value="" disabled>year</option>
					{#each YEARS as y}<option value={y}>{y}</option>{/each}
				</select>
			</div>
			<button class="go" on:click={next} disabled={!complete}>next</button>
		</div>
	</div>
{/if}
