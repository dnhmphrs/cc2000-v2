<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { cubicIn } from 'svelte/easing';
	import {
		dobMonth,
		dobDay,
		dobYear,
		date,
		spicy,
		track,
		decade,
		conceived,
		edge,
		monitorRect,
		calcZoom
	} from '$lib/store/store';
	import { SCENES, lerp, easeInOutPower } from '$lib/config';
	import { begin, skipToVerdict, settled } from './director';
	import { conceptionDate, previousDay, dateToDecade } from '$lib/functions/utils';
	import data from '$lib/data/cc2000_data.json';

	// ── Scene 1: the Conception Calculator 2000 ──────────────────────────────
	// The machine IS the landing page, and it takes both answers.
	//
	// It is one element, always laid out at full viewport size, and BOTH ends of
	// the loop are a transform on that one element:
	//
	//   arriving   starts drawn 1:1 inside the room's monitor — the whole page,
	//              shrunk, exactly as it looks on your screen — and grows out of
	//              it until it fills the viewport.
	//   launching  is pushed into the lens with real perspective, so the frame
	//              warps outward as it goes rather than flatly scaling.
	//
	// Because arriving draws the WHOLE page at monitor scale, the form controls
	// would be a few unreadable pixels. They are held back until it is most of
	// the way home (SCENES.calculator.controlsAt); what you see in the monitor
	// until then is the machine's own cartoon self, which is the point.
	//
	// Layout comes from config/layout.js via CSS custom properties that
	// +layout.svelte writes for the current aspect, so the same markup lays out
	// in landscape, portrait and the square middle a tablet lands in.

	const T = SCENES.calculator;

	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy only the internet can provide'
	];

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

	// Whether this mount is a return trip. Read once: monitorRect is cleared as
	// soon as the arrival finishes.
	const arrivingFrom = get(monitorRect);

	let shown = LINES.map(() => 0);
	let typed = !!arrivingFrom; // no manifesto second time round
	let realised = !arrivingFrom; // are the real controls allowed on screen yet
	let timer;
	let controlsTimer;
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

	// ── The two moves ────────────────────────────────────────────────────────
	// Both are Svelte transitions rather than hand-rolled state, so the element
	// stays mounted for exactly as long as its move takes and no flag has to be
	// kept in step with a timer.

	// Out of the room's monitor — the other half of the move the camera is
	// making into that same monitor.
	//
	// It reads the LIVE monitor rect every frame rather than a snapshot, so it
	// stays locked to the glass while the scene zooms into it; without that the
	// screen grows and the room behind it sits still, which is exactly what it
	// should not look like. The blend toward identity is what lands it square on
	// the viewport at the end, where the glass alone would not.
	//
	// `tick` rather than `css` because the zoom level is published as it goes,
	// and a css-driven transition is compiled to keyframes up front and can
	// neither read a moving rect nor report progress.
	function outOfMonitor(node, { rect }) {
		if (!rect) return { duration: 0 };
		node.style.transformOrigin = '0 0';
		return {
			duration: T.arrive * 1000,
			easing: (t) => easeInOutPower(t, 1.9),
			tick: (t) => {
				const live = get(monitorRect) ?? rect;
				const vw = window.innerWidth;
				const vh = window.innerHeight;
				// Fit the whole page inside the glass, whichever way round it is,
				// and centre it in the leftover — the monitor's shape and the
				// viewport's are not the same, and a page pinned to the glass's
				// corner reads as a mistake rather than as a screen.
				const s0 = Math.min(live.width / vw, live.height / vh);
				const x0 = live.left + (live.width - vw * s0) / 2;
				const y0 = live.top + (live.height - vh * s0) / 2;
				const u = 1 - t;
				node.style.transform = `translate(${x0 * u}px, ${y0 * u}px) scale(${lerp(s0, 1, t)})`;
				calcZoom.set(t);
			}
		};
	}

	// Into the lens. Real perspective, so the frame warps outward as it goes —
	// being sucked in, rather than a picture being scaled up.
	function intoLens(node) {
		node.style.transformOrigin = '50% var(--win-y)';
		return {
			duration: T.launch * 1000,
			easing: cubicIn,
			tick: (t, u) => {
				node.style.transform = `perspective(760px) translateZ(${u * 700}px)`;
				node.style.opacity = String(1 - u * u * u);
				calcZoom.set(1 + u);
			}
		};
	}

	onMount(() => {
		ticker = setInterval(() => (power = (power + 1) % 7), 420);

		if (arrivingFrom) {
			// Let the real controls in once it is most of the way home, and hand
			// the room back to the stage.
			controlsTimer = setTimeout(() => {
				realised = true;
			}, T.arrive * T.controlsAt * 1000);
			timer = setTimeout(settled, T.arrive * 1000);
			return;
		}

		let li = 0;
		const step = () => {
			if (li >= LINES.length) return (typed = true);
			if (shown[li] >= LINES[li].length) {
				li += 1;
				timer = setTimeout(step, T.lineGap * 1000);
				return;
			}
			shown[li] += 1;
			shown = shown;
			timer = setTimeout(step, T.charInterval * 1000);
		};
		timer = setTimeout(step, T.typeDelay * 1000);
	});

	onDestroy(() => {
		clearTimeout(timer);
		clearTimeout(controlsTimer);
		clearInterval(ticker);
	});

	function skip() {
		if (typed) return;
		clearTimeout(timer);
		shown = LINES.map((l) => l.length);
		typed = true;
	}

	function calculate() {
		if (!complete) return;
		date.set(
			`${$dobYear}-${String($dobMonth).padStart(2, '0')}-${String($dobDay).padStart(2, '0')}`
		);

		let cd = conceptionDate(get(date));
		const today = new Date().toISOString().slice(0, 10);

		// The archive starts in 1958 and nobody has been conceived after today.
		// Neither verdict has a room to fall into, so both skip the cinematic.
		if (cd <= '1958-06-01') {
			edge.set('past');
			return skipToVerdict();
		}
		if (get(date) >= today) {
			edge.set('future');
			return skipToVerdict();
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
			return skipToVerdict();
		}

		edge.set(null);
		track.set(found);
		conceived.set(cd);
		decade.set(dateToDecade(cd));
		begin();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="calculator"
	class:realised
	in:outOfMonitor={{ rect: arrivingFrom }}
	out:intoLens
	on:click={skip}
>
	<!-- The body. Four bars around the window rather than one element spreading
	     a shadow: a shadow scales with its element, so a machine drawn at monitor
	     size would still flood the whole frame with yellow. This way the window
	     stays truly transparent AND the machine can be a small object sitting
	     inside the room's screen. -->
	<div class="body top" />
	<div class="body bottom" />
	<div class="body left" />
	<div class="body right" />

	<div class="window">
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
		class="go"
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
	.calculator {
		position: fixed;
		inset: 0;
		z-index: 20;
		/* main is pointer-events:none so the 3D shows through the UI layer; any
		   screen that wants clicks has to opt back in. */
		pointer-events: auto;
		font-family: var(--tech);
		color: var(--machine-ink);
		cursor: default;
		/* Laid out from config/layout.js, which +layout.svelte writes onto :root
		   for the current aspect. --below is the chassis line under the glass. */
		--winh: calc(var(--win) / var(--win-aspect));
		--below: calc(var(--win-y) + var(--winh) / 2);
	}

	/* Everything that is not the cartoon machine waits until it is nearly home,
	   because at monitor scale it is a few unreadable pixels. */
	.controls,
	.go {
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}
	.calculator.realised .controls,
	.calculator.realised .go {
		opacity: 1;
		pointer-events: auto;
	}

	/* ── The window and the body ─────────────────────────────────────────── */
	.body {
		position: absolute;
		background: var(--machine);
	}
	.body.top {
		left: 0;
		right: 0;
		top: 0;
		height: calc(var(--win-y) - var(--winh) / 2);
	}
	.body.bottom {
		left: 0;
		right: 0;
		top: calc(var(--win-y) + var(--winh) / 2);
		bottom: 0;
	}
	/* A pixel of overlap top and bottom: four bars meeting exactly leaves a
	   hairline seam wherever the layout rounds. */
	.body.left,
	.body.right {
		width: calc(50% - var(--win) / 2 + 1px);
		top: calc(var(--win-y) - var(--winh) / 2 - 1px);
		height: calc(var(--winh) + 2px);
	}
	.body.left {
		left: 0;
	}
	.body.right {
		right: 0;
	}

	.window {
		position: absolute;
		left: 50%;
		top: var(--win-y);
		width: var(--win);
		aspect-ratio: var(--win-aspect);
		transform: translate(-50%, -50%);
		border-radius: 18px;
		box-shadow: inset 0 0 0 9px var(--machine-dark), inset 0 0 0 12px var(--machine-light),
			inset 0 14px 30px rgba(0, 0, 0, 0.55),
			/* And an outward spread that fills the four corners the four body
			   bars leave open — they meet at a square corner, this window is
			   rounded, and the difference is scene. An element's OWN outer
			   shadow is not clipped by its own overflow, so this works from
			   here. */
				0 0 0 20px var(--machine);
		overflow: hidden;
	}

	.screen {
		position: absolute;
		inset: 12px;
		/* The window's own radius LESS its inset, so the glass follows the inner
		   edge of the bezel exactly. Any more and the corners open up and the
		   scene shows through the gap; the bezel is 12px and the window is 18. */
		border-radius: 6px;
		/* A vignette, not a colour: the window looks straight onto the scene
		   behind it, so it only needs darkening at the edges to read as glass.
		   Light, because the ground behind it is already near-black — any more
		   and the static in the window is crushed away. */
		background: radial-gradient(
			ellipse at 50% 40%,
			rgba(0, 0, 0, 0) 0%,
			rgba(0, 0, 0, 0.18) 68%,
			rgba(0, 0, 0, 0.46) 100%
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
	}
	.screen p.lit {
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

	.readout {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: clamp(4px, 1.4vh, 10px);
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

	/* ── Fascia ──────────────────────────────────────────────────────────── */
	.plate {
		position: absolute;
		left: 50%;
		top: max(4vh, 20px);
		transform: translateX(-50%);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px clamp(14px, 2.4vw, 26px);
		background: var(--machine-light);
		border: 2px solid var(--machine-dark);
		border-radius: 6px;
		box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.12);
		white-space: nowrap;
	}
	.model {
		font-size: 9px;
		letter-spacing: 0.34em;
		text-transform: uppercase;
		opacity: 0.65;
	}
	.name {
		font-size: clamp(14px, 2vw, 24px);
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.lamps {
		position: absolute;
		left: 50%;
		top: calc(var(--win-y) - var(--winh) / 2 - 28px);
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
		background: var(--machine-lamp);
		box-shadow: 0 0 8px rgba(255, 106, 60, 0.8);
	}

	.dials {
		position: absolute;
		left: max(3vw, 18px);
		top: var(--win-y);
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(12px, 2.2vh, 26px);
	}
	.dial {
		width: clamp(30px, 3.6vw, 52px);
		height: clamp(30px, 3.6vw, 52px);
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
		top: var(--win-y);
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(10px, 1.8vh, 22px);
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

	/* ── The panel: both questions live on the machine ───────────────────── */
	.controls {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + var(--controls-gap));
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
		accent-color: var(--machine-lamp);
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

	.vent {
		position: absolute;
		bottom: max(5vh, 28px);
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
		bottom: max(5vh, 28px);
		transform: translateX(-50%);
		width: clamp(90px, 11vw, 150px);
		height: 40px;
		border-radius: 6px;
		background: radial-gradient(circle, var(--machine-dark) 1.1px, transparent 1.3px) 0 0 / 7px 7px;
		border: 2px solid var(--machine-dark);
	}

	.go {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + var(--controls-gap) + var(--controls-h) + var(--button-gap));
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
	}
	.calculator.realised .go {
		opacity: 0.55;
	}
	.calculator.realised .go.armed {
		background: var(--machine-lamp);
		color: #fff5ec;
		opacity: 1;
		cursor: pointer;
		animation: pulse 1.6s ease-in-out infinite;
	}
	.go.armed:active {
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

	/* Portrait has no room either side of the window, and the panel stacks. */
	@media (max-aspect-ratio: 85 / 100) {
		.dials,
		.switches,
		.vent,
		.grille {
			display: none;
		}
		.controls {
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
