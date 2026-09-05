<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		phase,
		sceneState,
		dobMonth,
		dobDay,
		dobYear,
		date,
		spicy,
		track,
		decade,
		conceived,
		edge
	} from '$lib/store/store';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import data from '$lib/data/cc2000_data.json';

	// ── The Conception Calculator 2000 ───────────────────────────────────────
	// The landing IS the machine, and it takes BOTH answers: a yellow chassis
	// filling the frame with a window cut out of the middle, sized in the same
	// ballpark as the decade TVs you end up inside.
	//
	// The window is a box-shadow spread over the whole viewport, so everything
	// after it in the DOM paints on top of the chassis and the hole stays
	// genuinely transparent — the field shows through the machine's own screen.
	// That also makes the fly-through one transform: scale the machine about the
	// window's centre and the hole grows past the frame.
	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy only the internet can provide'
	];

	const CHAR_MS = 22;
	const LINE_GAP = 220;
	const START_DELAY = 600;

	const MIN_YEAR = 1958;
	const MAX_YEAR = new Date().getFullYear();
	const MONTHS = [
		'jan',
		'feb',
		'mar',
		'apr',
		'may',
		'jun',
		'jul',
		'aug',
		'sep',
		'oct',
		'nov',
		'dec'
	];
	const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

	// The chassis flies at the camera for this long before the transition screen
	// takes over — matched to the .machine transform transition below.
	const LAUNCH_MS = 1500;

	let shown = LINES.map(() => 0);
	let typed = false;
	let launching = false;
	let timer;
	let handoff;

	let power = 0;
	let ticker;

	// bind:value, not value={...}: a plain value on a <select> whose <option>
	// list re-renders does not stick, and the day list changes with the month.
	$: maxDay = $dobMonth && $dobYear ? new Date(+$dobYear, +$dobMonth, 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	// Clamp rather than clear, so picking the year last cannot silently wipe a
	// day of 29–31 and leave the button dead with no explanation.
	$: if ($dobDay && Number($dobDay) > maxDay) dobDay.set(maxDay);
	$: complete = $dobMonth && $dobDay && $dobYear;
	$: readout = complete
		? `${String($dobDay).padStart(2, '0')} ${MONTHS[$dobMonth - 1].toUpperCase()} ${$dobYear}`
		: '-- --- ----';

	onMount(() => {
		let li = 0;
		const step = () => {
			if (li >= LINES.length) {
				typed = true;
				return;
			}
			if (shown[li] >= LINES[li].length) {
				li += 1;
				timer = setTimeout(step, LINE_GAP);
				return;
			}
			shown[li] += 1;
			shown = shown;
			timer = setTimeout(step, CHAR_MS);
		};
		timer = setTimeout(step, START_DELAY);
		ticker = setInterval(() => (power = (power + 1) % 7), 420);
	});
	onDestroy(() => {
		clearTimeout(timer);
		clearTimeout(handoff);
		clearInterval(ticker);
	});

	function skip() {
		if (typed || launching) return;
		clearTimeout(timer);
		shown = LINES.map((l) => l.length);
		typed = true;
	}

	function calculate() {
		if (!complete || launching) return;
		date.set(
			`${$dobYear}-${String($dobMonth).padStart(2, '0')}-${String($dobDay).padStart(2, '0')}`
		);

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
		for (let i = 0; i < 400; i++) {
			// Each day holds 10 tracks ordered spicy 10 → 1 (index 0 → 9), so the
			// track matching the chosen level is at index (10 - spicy).
			const d = data[cd];
			if (d && d[10 - $spicy]) {
				found = d[10 - $spicy];
				break;
			}
			cd = previousDay(cd);
		}
		if (!found) {
			edge.set('past');
			phase.set('output');
			return;
		}

		edge.set(null);
		track.set(found);
		conceived.set(cd);
		decade.set(dateToDecade(cd));

		// The camera goes through the window and straight on into the egg — one
		// move, no stops. The dive starts now, behind the chassis; the machine
		// hands over to the transition once it has flown past the lens.
		launching = true;
		sceneState.set(1);
		handoff = setTimeout(() => phase.set('processing'), LAUNCH_MS);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="machine" class:launching on:click={skip}>
	<!-- The hole. Its shadow is the chassis, and the field shows through it. -->
	<div class="hole">
		<div class="screen">
			<div class="scanlines" />
			{#if !typed}
				{#each LINES as line, i}
					<p class:lit={i === LINES.length - 1}>
						{line.slice(0, shown[i])}{#if shown[i] > 0 && shown[i] < line.length}<span
								class="caret"
							/>{/if}
					</p>
				{/each}
			{:else}
				<!-- Once it has said its piece the screen becomes a read-out of what
				     the operator has dialled in. -->
				<dl class="readout">
					<div>
						<dt>subject dob</dt>
						<dd>{readout}</dd>
					</div>
					<div>
						<dt>resonance</dt>
						<dd>{String($spicy).padStart(2, '0')} / 10</dd>
					</div>
					<div>
						<dt>status</dt>
						<dd class:ready={complete}>{complete ? 'ready' : 'awaiting input'}</dd>
					</div>
				</dl>
			{/if}
		</div>
	</div>

	<!-- Everything below paints on top of the chassis. -->
	<div class="plate">
		<span class="model">model cc-2000</span>
		<span class="name">Conception Calculator</span>
	</div>

	<div class="lamps">
		{#each [0, 1, 2, 3, 4, 5, 6] as n}
			<i class:on={n <= power} />
		{/each}
	</div>

	<div class="dials">
		{#each [22, -48, 71, -14] as deg, i}
			<span class="dial" style="--deg:{deg}deg; --d:{i * 0.7}s"><i /></span>
		{/each}
	</div>

	<div class="switches">
		{#each [1, 0, 1, 1, 0] as up}
			<span class="sw" class:up><i /></span>
		{/each}
	</div>

	<!-- Both questions, on the panel. -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="controls" on:click|stopPropagation>
		<div class="ctl">
			<span class="lab">date of birth</span>
			<div class="dob">
				<select bind:value={$dobMonth} aria-label="month">
					<option value="" disabled>mth</option>
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
		</div>

		<div class="ctl">
			<span class="lab">how spicy do you like it?</span>
			<input type="range" bind:value={$spicy} min="1" max="10" aria-label="spicy" />
			<div class="ends"><span>sweet</span><span>filthy</span></div>
		</div>
	</div>

	<div class="vent left" />
	<div class="vent right" />
	<div class="grille" />

	<button
		class="start"
		class:armed={complete}
		on:click|stopPropagation={calculate}
		disabled={!complete}
	>
		calculate
	</button>

	<span class="screw tl" />
	<span class="screw tr" />
	<span class="screw bl" />
	<span class="screw br" />
</div>

<style>
	.machine {
		position: fixed;
		inset: 0;
		z-index: 20;
		/* main is pointer-events:none so the 3D shows through the UI layer; any
		   screen that wants clicks has to opt back in. */
		pointer-events: auto;
		/* One source of truth for the window, so everything bolted around it
		   moves when it does. --below is the chassis line under the glass. */
		--win: clamp(250px, 31vw, 400px);
		--winh: calc(var(--win) * 0.75); /* 4:3 */
		--below: calc(46% + var(--winh) / 2);
		--ctl-h: 86px;
		/* The window is centred, so the fly-through scales about the middle. */
		transform-origin: 50% 46%;
		transition: transform 1.5s cubic-bezier(0.6, 0, 0.85, 0.4), opacity 0.5s ease 1s;
		font-family: var(--tech);
		color: var(--machine-ink);
		cursor: default;
	}

	.machine.launching {
		transform: scale(22);
		opacity: 0;
		pointer-events: none;
	}

	/* Clear the glass first, so what you fly through is the window rather than
	   the words that were on it. */
	.machine.launching .screen p,
	.machine.launching .readout,
	.machine.launching .scanlines {
		opacity: 0;
		transition: opacity 0.22s ease;
	}
	.machine.launching .screen {
		background: transparent;
		transition: background 0.5s ease;
	}

	/* ── The window, and the chassis that surrounds it ───────────────────── */
	.hole {
		position: absolute;
		left: 50%;
		top: 46%;
		width: var(--win);
		aspect-ratio: 4 / 3;
		transform: translate(-50%, -50%);
		border-radius: 18px;
		/* This spread is the machine's body. */
		box-shadow: 0 0 0 9999px var(--machine), inset 0 0 0 9px var(--machine-dark),
			inset 0 0 0 12px var(--machine-light), inset 0 14px 30px rgba(0, 0, 0, 0.55);
		overflow: hidden;
	}

	.screen {
		position: absolute;
		inset: 12px;
		border-radius: 10px;
		/* Translucent, so the field burning behind the whole site reads as what
		   is on the other side of the machine's window. */
		background: radial-gradient(
			ellipse at 50% 40%,
			rgba(18, 50, 116, 0.24) 0%,
			rgba(10, 36, 106, 0.44) 55%,
			rgba(5, 18, 60, 0.7) 100%
		);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
		overflow: hidden;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.05) 0 1px,
			transparent 1px 3px
		);
	}

	.screen p {
		margin: 0;
		font-size: clamp(8px, 0.9vw, 11px);
		line-height: 1.5;
		letter-spacing: 0.03em;
		color: rgba(240, 242, 248, 0.72);
		transition: opacity 0.25s ease;
	}
	.screen p.lit {
		color: var(--yellow);
	}

	.readout {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(4px, 1.4vh, 10px);
		transition: opacity 0.25s ease;
	}
	.readout div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 14px;
		padding-bottom: 3px;
		border-bottom: 1px dotted rgba(240, 242, 248, 0.22);
	}
	.readout dt {
		font-size: clamp(7px, 0.72vw, 9px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: rgba(240, 242, 248, 0.5);
	}
	.readout dd {
		margin: 0;
		font-size: clamp(10px, 1.05vw, 14px);
		letter-spacing: 0.08em;
		color: rgba(240, 242, 248, 0.85);
	}
	.readout dd.ready {
		color: var(--yellow);
	}

	.caret {
		display: inline-block;
		width: 0.5em;
		height: 0.9em;
		vertical-align: text-bottom;
		background: rgba(240, 242, 248, 0.8);
		animation: blink 1.05s steps(1) infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}

	/* ── Fascia ──────────────────────────────────────────────────────────── */
	.plate {
		position: absolute;
		left: 50%;
		top: max(5vh, 26px);
		transform: translateX(-50%);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px 26px;
		background: var(--machine-light);
		border: 2px solid var(--machine-dark);
		border-radius: 6px;
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12);
	}
	.model {
		font-size: 9px;
		letter-spacing: 0.34em;
		text-transform: uppercase;
		opacity: 0.65;
	}
	.name {
		font-size: clamp(15px, 2vw, 24px);
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.lamps {
		position: absolute;
		left: 50%;
		top: calc(46% - var(--winh) / 2 - 30px);
		transform: translateX(-50%);
		display: flex;
		gap: 7px;
	}
	.lamps i {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--machine-dark);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
	}
	.lamps i.on {
		background: #ff6a3c;
		box-shadow: 0 0 8px rgba(255, 106, 60, 0.8);
	}

	.dials {
		position: absolute;
		left: max(3vw, 18px);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(14px, 2.4vh, 26px);
	}
	.dial {
		width: clamp(34px, 4vw, 52px);
		height: clamp(34px, 4vw, 52px);
		border-radius: 50%;
		background: radial-gradient(circle at 34% 30%, var(--machine-light), var(--machine-dark));
		border: 2px solid var(--machine-ink);
		display: grid;
		place-items: center;
		transform: rotate(var(--deg));
		animation: nudge 5.5s ease-in-out infinite;
		animation-delay: var(--d);
	}
	.dial i {
		display: block;
		width: 2px;
		height: 42%;
		background: var(--machine-ink);
		transform: translateY(-28%);
	}

	@keyframes nudge {
		0%,
		100% {
			transform: rotate(var(--deg));
		}
		50% {
			transform: rotate(calc(var(--deg) + 16deg));
		}
	}

	.switches {
		position: absolute;
		right: max(3vw, 18px);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(12px, 2vh, 22px);
	}
	.sw {
		width: 24px;
		height: 40px;
		border-radius: 5px;
		background: var(--machine-dark);
		border: 2px solid var(--machine-ink);
		display: flex;
		align-items: flex-end;
		padding: 3px;
	}
	.sw.up {
		align-items: flex-start;
	}
	.sw i {
		display: block;
		width: 100%;
		height: 45%;
		border-radius: 3px;
		background: var(--machine-light);
	}

	.vent {
		position: absolute;
		bottom: max(6vh, 34px);
		width: clamp(70px, 9vw, 120px);
		height: 34px;
		border-radius: 4px;
		background: repeating-linear-gradient(
			to bottom,
			var(--machine-dark) 0 3px,
			transparent 3px 7px
		);
	}
	.vent.left {
		left: max(3vw, 18px);
	}
	.vent.right {
		right: max(3vw, 18px);
	}

	.grille {
		position: absolute;
		left: 50%;
		bottom: max(6vh, 34px);
		transform: translateX(-50%);
		width: clamp(90px, 11vw, 150px);
		height: 40px;
		border-radius: 6px;
		background: radial-gradient(circle, var(--machine-dark) 1.1px, transparent 1.3px) 0 0 / 7px 7px;
		border: 2px solid var(--machine-dark);
	}

	/* ── The panel: both questions live on the machine ───────────────────── */
	.controls {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + 18px);
		transform: translateX(-50%);
		display: flex;
		align-items: flex-start;
		gap: clamp(16px, 2.6vw, 34px);
		padding: 12px clamp(14px, 2vw, 22px) 14px;
		background: var(--machine-dark);
		border: 2px solid var(--machine-ink);
		border-radius: 8px;
		box-shadow: inset 0 3px 0 rgba(0, 0, 0, 0.18), 0 3px 0 rgba(0, 0, 0, 0.18);
	}

	.ctl {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.lab {
		font-size: 9px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		opacity: 0.78;
	}

	.dob {
		display: flex;
		gap: 6px;
	}

	select {
		font-family: var(--tech);
		font-size: 13px;
		letter-spacing: 0.04em;
		padding: 6px 8px;
		color: var(--machine-ink);
		background: var(--machine-light);
		border: 2px solid var(--machine-ink);
		border-radius: 4px;
		box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.14);
		cursor: pointer;
	}

	input[type='range'] {
		width: clamp(130px, 15vw, 200px);
		margin: 5px 0 0;
		accent-color: #ff6a3c;
		cursor: pointer;
	}

	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 8px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	.start {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + 18px + var(--ctl-h) + 16px);
		transform: translateX(-50%);
		font-family: var(--tech);
		font-size: 14px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		padding: 14px 46px;
		border-radius: 8px;
		border: 3px solid var(--machine-ink);
		background: var(--machine-dark);
		color: var(--machine-ink);
		box-shadow: 0 5px 0 var(--machine-ink);
		cursor: default;
		opacity: 0.55;
	}
	.start.armed {
		background: #ff6a3c;
		color: #fff5ec;
		opacity: 1;
		cursor: pointer;
		animation: pulse 1.6s ease-in-out infinite;
	}
	.start.armed:active {
		transform: translate(-50%, 4px);
		box-shadow: 0 1px 0 var(--machine-ink);
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 5px 0 var(--machine-ink), 0 0 0 rgba(255, 106, 60, 0);
		}
		50% {
			box-shadow: 0 5px 0 var(--machine-ink), 0 0 22px rgba(255, 106, 60, 0.65);
		}
	}

	.screw {
		position: absolute;
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 32%, var(--machine-light), var(--machine-dark));
		border: 1px solid var(--machine-ink);
	}
	.screw::after {
		content: '';
		position: absolute;
		inset: 3px 2px;
		border-top: 1px solid var(--machine-ink);
		transform: rotate(28deg);
	}
	.screw.tl {
		left: 16px;
		top: 16px;
	}
	.screw.tr {
		right: 16px;
		top: 16px;
	}
	.screw.bl {
		left: 16px;
		bottom: 16px;
	}
	.screw.br {
		right: 16px;
		bottom: 16px;
	}

	@media (max-width: 700px) {
		.dials,
		.switches,
		.vent,
		.grille {
			display: none;
		}

		/* Stacked, so the panel gets taller and the button moves down with it. */
		.machine {
			--ctl-h: 156px;
		}
		.controls {
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
