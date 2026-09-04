<script>
	import { phase, gender, date, spicy, track, decade, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	let step = 1;
	const STEP_IDS = ['SUBJECT.SEX', 'SUBJECT.DOB', 'SPICE.LVL'];

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

		if (cd <= '1958-06-01') {
			goto('/the-past', { replaceState: true });
			return;
		}
		if ($date >= today) {
			goto('/the-future', { replaceState: true });
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
			track.set(found);
			decade.set(dateToDecade(cd));
			sceneState.set(1); // hand the scene into its hyperspace search
			phase.set('processing');
		}
	}
</script>

<div class="shell" in:fade={{ duration: 400 }}>
	<div class="frame">
		<div class="frame-head">
			<span class="id">CC://2000</span>
			<span>SUBJECT INPUT — {STEP_IDS[step - 1]}</span>
		</div>

		<div class="frame-body">
			<div class="steps">
				{#each [1, 2, 3] as s}
					<span class="dot" class:active={s <= step}>{s}</span>
					{#if s < 3}<span class="line" class:active={s < step} />{/if}
				{/each}
			</div>

			{#if step === 1}
				<div class="panel">
					<p class="label">&gt; declare gender</p>
					<div class="options">
						<button on:click={() => selectGender('male')}>male</button>
						<button on:click={() => selectGender('female')}>female</button>
						<button on:click={() => selectGender('other')}>other</button>
					</div>
				</div>
			{:else if step === 2}
				<div class="panel">
					<p class="label">&gt; enter date of birth</p>
					<input type="date" bind:value={$date} max="2023-03-05" min="1958-06-01" />
					<div class="nav">
						<button on:click={back}>back</button>
						<button on:click={nextBirthday} disabled={!$date}>next</button>
					</div>
				</div>
			{:else}
				<div class="panel">
					<p class="label">&gt; how spicy</p>
					<div class="spice">
						<span class="val">{String($spicy).padStart(2, '0')}</span>
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
	</div>
</div>

<style>
	.shell {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		pointer-events: none;
	}

	.frame {
		width: 100%;
		max-width: 380px;
		pointer-events: auto;
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 1.8rem;
	}

	.dot {
		width: 22px;
		height: 22px;
		border-radius: 0;
		border: 1px solid var(--fg-faint);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 9px;
		line-height: 1;
		color: var(--fg-faint);
		transition: all 0.3s;
	}
	.dot.active {
		border-color: var(--fg);
		color: var(--fg);
		background: rgba(240, 240, 160, 0.06);
	}

	.line {
		width: 26px;
		height: 1px;
		background: var(--fg-faint);
		transition: background 0.3s;
	}
	.line.active {
		background: var(--fg);
	}

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
		letter-spacing: 0.16em;
		color: var(--fg-dim);
		margin: 0;
		align-self: flex-start;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}
	.options button {
		width: 100%;
	}

	.spice {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		width: 100%;
	}
	.val {
		font-size: 30px;
		color: var(--fg);
		font-weight: 300;
		letter-spacing: 0.1em;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-size: 9px;
		color: var(--fg-faint);
		text-transform: uppercase;
		letter-spacing: 0.2em;
	}

	.nav {
		display: flex;
		gap: 12px;
	}

	input[type='date'] {
		text-align: center;
		width: 100%;
		max-width: 220px;
	}
</style>
