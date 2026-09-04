<script>
	import { phase, date, spicy, track, decade, conceived, edge, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	// Question 2 — the false flag. Answering it drives the sperm into the egg.
	let sent = false;

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

		if (!found) return;
		edge.set(null);
		track.set(found);
		conceived.set(cd);
		decade.set(dateToDecade(cd));
		sent = true;
		sceneState.set(3); // pierce
		phase.set('processing');
	}
</script>

{#if !sent}
	<div class="shell" in:fade={{ duration: 340 }} out:fade={{ duration: 200 }}>
		<div class="panel">
			<p class="q">how spicy do you like it?</p>
			<div class="dial">
				<input type="range" bind:value={$spicy} min="1" max="10" />
				<div class="ends">
					<span>sweet</span>
					<span class="num">{$spicy}</span>
					<span>filthy</span>
				</div>
			</div>
			<button class="go" on:click={calculate}>calculate</button>
		</div>
	</div>
{/if}
