<script>
	import { phase, gender, date, spicy, track, decade, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { goto } from '$app/navigation';
	import data from '$lib/data/cc2000_data.json';

	let step = 1;

	function selectGender(g) {
		gender.set(g);
		step = 2;
	}

	function nextBirthday() {
		if ($date) step = 3;
	}

	function back() {
		if (step > 1) step -= 1;
		else phase.set('intro');
	}

	function calculate() {
		let cd = conceptionDate($date);
		const today = new Date().toISOString().slice(0, 10);

		if (cd <= '1958-06-01') { goto('/the-past', { replaceState: true }); return; }
		if ($date >= today) { goto('/the-future', { replaceState: true }); return; }

		let found = null;
		for (let i = 0; i < 30; i++) {
			try {
				found = data[cd][9 - $spicy];
				break;
			} catch {
				cd = previousDay(cd);
			}
		}

		if (found) {
			track.set(found);
			decade.set(dateToDecade(cd));
			sceneState.set(1);
			phase.set('transition');
		}
	}
</script>

<div class="screen">
	<div class="steps">
		{#each [1, 2, 3] as s}
			<span class="dot" class:active={s <= step}>{s}</span>
			{#if s < 3}<span class="line" />{/if}
		{/each}
	</div>

	{#if step === 1}
		<div class="panel">
			<p class="label">gender</p>
			<div class="options">
				<button on:click={() => selectGender('male')}>male</button>
				<button on:click={() => selectGender('female')}>female</button>
				<button on:click={() => selectGender('other')}>other</button>
			</div>
		</div>
	{:else if step === 2}
		<div class="panel">
			<p class="label">date of birth</p>
			<input type="date" bind:value={$date} max="2023-03-05" min="1958-06-01" />
			<div class="nav">
				<button on:click={back}>back</button>
				<button on:click={nextBirthday} disabled={!$date}>next</button>
			</div>
		</div>
	{:else}
		<div class="panel">
			<p class="label">spice level</p>
			<div class="spice">
				<span class="val">{$spicy}</span>
				<input type="range" bind:value={$spicy} min="1" max="10" />
				<div class="range-labels"><span>mild</span><span>hot</span></div>
			</div>
			<div class="nav">
				<button on:click={back}>back</button>
				<button on:click={calculate}>calculate</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.screen {
		background: var(--bg-t);
		border: solid 1px var(--fg-faint);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		width: 100%;
		max-width: 420px;	
	}

	.steps {
		display: flex;
		align-items: center;
		gap: 8px;
	}

.dot {
    /* 1. Define a fixed, equal size */
    width: 24px; 
    height: 24px;
    
    /* 2. Remove padding (it interferes with flex centering) */
    padding: 0;
    
    /* 3. Make it a circle */
    border-radius: 50%;
    border: 1px solid var(--fg-faint);
    
    /* 4. Perfect centering */
    display: flex; 
    align-items: center; 
    justify-content: center;
    
    /* 5. Clean up typography */
    font-size: 9px;
    line-height: 1; /* Reset to normal */
    color: var(--fg-faint);
    transition: all 0.3s;
  }

	.dot.active { border-color: var(--fg-dim); color: var(--fg); }

	.line { width: 24px; height: 1px; background: var(--fg-faint); }

	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
	}

	.label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--fg-dim);
		margin: 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.options button { width: 100%; }

	.spice {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 100%;
	}

	.val { font-size: 24px; color: var(--fg); font-weight: 300; }

	.range-labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 9px;
		color: var(--fg-faint);
		text-transform: uppercase;
	}

	.nav { display: flex; gap: 12px; }

	input[type="date"] { text-align: center; width: 100%; max-width: 200px; }
</style>
