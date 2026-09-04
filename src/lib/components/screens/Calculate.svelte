<script>
	import {
		phase,
		gender,
		date,
		spicy,
		track,
		decade,
		conceived,
		edge,
		sceneState
	} from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	// Beat 2. Three questions, one at a time, as plainly as they can be asked.
	let step = 1;

	const MIN_DOB = '1958-06-01';
	const MAX_DOB = new Date().toISOString().slice(0, 10);

	function pick(g) {
		gender.set(g);
		step = 2;
	}

	function calculate() {
		let cd = conceptionDate($date);
		const today = new Date().toISOString().slice(0, 10);

		// The archive starts in 1958, and nobody has been conceived after today.
		// Both used to navigate to /the-past and /the-future — routes this build
		// does not have, so they landed people on the 404 screen.
		if (cd <= MIN_DOB) {
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
			const day = data[cd];
			if (day && day[10 - $spicy]) {
				found = day[10 - $spicy];
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
		{#if step === 1}
			<p class="ask">who are you?</p>
			<div class="rows">
				<button on:click={() => pick('female')}>a woman</button>
				<button on:click={() => pick('male')}>a man</button>
				<button on:click={() => pick('other')}>neither, thanks</button>
			</div>
		{:else if step === 2}
			<p class="ask">when were you born?</p>
			<input type="date" bind:value={$date} max={MAX_DOB} min={MIN_DOB} />
			<div class="nav">
				<button on:click={() => (step = 1)}>back</button>
				<button class="go" on:click={() => $date && (step = 3)} disabled={!$date}>next</button>
			</div>
		{:else}
			<p class="ask">how spicy were your parents?</p>
			<div class="dial">
				<span class="num">{$spicy}</span>
				<input type="range" bind:value={$spicy} min="1" max="10" />
				<div class="ends"><span>sweet</span><span>filthy</span></div>
			</div>
			<div class="nav">
				<button on:click={() => (step = 2)}>back</button>
				<button class="go" on:click={calculate}>go</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.nav {
		display: flex;
		gap: 8px;
		margin-top: 22px;
	}
	.nav button {
		flex: 1;
	}

	.dial {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.num {
		font-size: 54px;
		font-weight: 700;
		line-height: 1;
		color: var(--hot);
	}
	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: var(--ink-dim);
	}
</style>
