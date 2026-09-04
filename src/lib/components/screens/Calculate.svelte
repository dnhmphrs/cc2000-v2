<script>
	import { phase, gender, date, spicy, track, decade, edge, sceneState } from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import { fade } from 'svelte/transition';
	import data from '$lib/data/cc2000_data.json';

	// Beat 2: the sperm is on screen; the operator works through the form.
	let step = 1;
	const STEPS = [
		{ id: 'SUBJECT.SEX', label: 'declare subject sex' },
		{ id: 'SUBJECT.DOB', label: 'enter date of birth' },
		{ id: 'SPICE.LVL', label: 'set resonance level' }
	];

	// Ladder under the slider: one tick per resonance level.
	const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const MIN_DOB = '1958-06-01';
	const MAX_DOB = new Date().toISOString().slice(0, 10);

	function selectGender(g) {
		gender.set(g);
		step = 2;
	}

	function nextBirthday() {
		if ($date) step = 3;
	}

	function back() {
		if (step > 1) step -= 1;
	}

	function calculate() {
		let cd = conceptionDate($date);
		const today = new Date().toISOString().slice(0, 10);

		// The archive only covers 1958-06-01 onward, and nobody has been conceived
		// after today. Both used to navigate to /the-past and /the-future, routes
		// that do not exist in this build — so they landed the user on the 404
		// screen. They are handled in-flow now, without leaving the cinematic.
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
			decade.set(dateToDecade(cd));
			sceneState.set(1); // hand the scene the dive → open → search
			phase.set('processing');
		}
	}
</script>

<div class="shell" in:fade={{ duration: 380 }} out:fade={{ duration: 220 }}>
	<div class="frame">
		<div class="frame-head">
			<span class="id">CC://2000</span>
			<span class="title">subject input</span>
			<span class="stat"><i class="led" />{STEPS[step - 1].id}</span>
		</div>
		<div class="frame-tape" />

		<div class="frame-body">
			<div class="steps">
				{#each STEPS as s, i (s.id)}
					<span class="dot" class:active={i + 1 <= step} class:now={i + 1 === step}>
						{String(i + 1).padStart(2, '0')}
					</span>
					{#if i < STEPS.length - 1}<span class="link" class:active={i + 1 < step} />{/if}
				{/each}
			</div>

			<p class="ps1">
				<span class="sig">&gt;</span>
				{STEPS[step - 1].label}<span class="cursor" />
			</p>

			{#if step === 1}
				<div class="panel">
					<div class="options">
						<button on:click={() => selectGender('male')}>male</button>
						<button on:click={() => selectGender('female')}>female</button>
						<button on:click={() => selectGender('other')}>other</button>
					</div>
				</div>
			{:else if step === 2}
				<div class="panel">
					<input type="date" bind:value={$date} max={MAX_DOB} min={MIN_DOB} />
					<div class="nav">
						<button on:click={back}>back</button>
						<button on:click={nextBirthday} disabled={!$date}>next</button>
					</div>
				</div>
			{:else}
				<div class="panel">
					<div class="spice">
						<span class="val">{String($spicy).padStart(2, '0')}</span>
						<input type="range" bind:value={$spicy} min="1" max="10" />
						<div class="ticks">
							{#each LEVELS as n}
								<span class:on={n <= $spicy} />
							{/each}
						</div>
						<div class="range-labels"><span>mild</span><span>hot</span></div>
					</div>
					<div class="nav">
						<button on:click={back}>back</button>
						<button on:click={calculate}>calculate</button>
					</div>
				</div>
			{/if}
		</div>

		<div class="frame-foot">
			<span>sex · {$gender ?? '—'}</span>
			<span>dob · {step > 1 && $date ? $date : '—'}</span>
			<span>lvl · {step > 2 ? String($spicy).padStart(2, '0') : '—'}</span>
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
		padding: 2rem 1.5rem;
		pointer-events: none;
	}

	.frame {
		width: 100%;
		max-width: 390px;
		pointer-events: auto;
	}

	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin-bottom: 1.6rem;
	}

	.dot {
		width: 26px;
		height: 22px;
		border: 1px solid var(--fg-ghost);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--mono);
		font-size: 9px;
		line-height: 1;
		color: var(--fg-faint);
		transition: all 0.28s;
	}
	.dot.active {
		border-color: var(--fg-faint);
		color: var(--fg-dim);
	}
	.dot.now {
		border-color: var(--fg);
		color: var(--bg);
		background: var(--fg);
	}

	.link {
		width: 24px;
		height: 1px;
		background: var(--fg-ghost);
		transition: background 0.28s;
	}
	.link.active {
		background: var(--fg-faint);
	}

	.ps1 {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--fg-dim);
		margin: 0 0 1.3rem;
	}
	.ps1 .sig {
		color: var(--fg);
		margin-right: 6px;
	}

	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.4rem;
		width: 100%;
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
		gap: 12px;
		width: 100%;
	}
	.val {
		font-family: var(--mono);
		font-size: 34px;
		color: var(--fg);
		font-weight: 400;
		letter-spacing: 0.06em;
	}

	/* Read-out ladder under the slider — the panel's little gauge. */
	.ticks {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}
	.ticks span {
		width: 1px;
		height: 5px;
		background: var(--fg-ghost);
		transition: background 0.2s, height 0.2s;
	}
	.ticks span.on {
		background: var(--fg);
		height: 8px;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		font-family: var(--tech);
		font-size: 8px;
		color: var(--fg-faint);
		text-transform: uppercase;
		letter-spacing: 0.2em;
	}

	.nav {
		display: flex;
		gap: 10px;
	}

	input[type='date'] {
		text-align: center;
		width: 100%;
		max-width: 220px;
	}

	.frame-foot span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 520px) {
		.frame-foot {
			font-size: 7px;
			letter-spacing: 0.12em;
		}
	}
</style>
