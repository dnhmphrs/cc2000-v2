<script>
	import { onMount, onDestroy } from 'svelte';
	import { sceneState } from '$lib/store/store';

	// ── The Conception Calculator 2000 ───────────────────────────────────────
	// The landing IS the machine: a yellow chassis filling the frame with a
	// window cut out of the middle, sized in the same ballpark as the decade TVs
	// you end up inside. Its own screen types the manifesto; START flies the
	// camera through that window into the scene behind.
	//
	// Built in CSS rather than geometry: the hole is a box-shadow spread over the
	// whole viewport, so everything after it in the DOM paints on top of the
	// chassis, and the fly-through is one transform about the window's centre.
	const LINES = [
		'in the earth year 2000, human technology advanced',
		'allowing all of mankind to calculate the song playing',
		'at their exact moment of conception',
		'with the statistical accuracy only the internet can provide'
	];

	const CHAR_MS = 24;
	const LINE_GAP = 240;
	const START_DELAY = 700;

	let shown = LINES.map(() => 0);
	let ready = false;
	let launching = false;
	let timer;

	// Cosmetic read-outs, so the panel looks like it is doing something.
	let power = 0;
	let ticker;

	onMount(() => {
		let li = 0;
		const step = () => {
			if (li >= LINES.length) {
				ready = true;
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
		clearInterval(ticker);
	});

	function skip() {
		if (ready || launching) return;
		clearTimeout(timer);
		shown = LINES.map((l) => l.length);
		ready = true;
	}

	function start() {
		if (!ready || launching) return;
		launching = true;
		// The sperm comes past the camera as the window opens up.
		sceneState.set(1);
	}
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<div class="machine" class:launching on:click={skip}>
	<!-- The hole. Its shadow is the chassis. -->
	<div class="hole">
		<div class="screen">
			<div class="scanlines" />
			{#each LINES as line, i}
				<p class:lit={i === LINES.length - 1}>
					{line.slice(0, shown[i])}{#if !ready && shown[i] > 0 && shown[i] < line.length}<span
							class="caret"
						/>{/if}
				</p>
			{/each}
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

	<div class="vent left" />
	<div class="vent right" />
	<div class="grille" />

	<div class="meter"><span style="width:{28 + power * 9}%" /></div>

	<button class="start" class:armed={ready} on:click|stopPropagation={start} disabled={!ready}>
		start
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
		width: clamp(250px, 31vw, 400px);
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
		background: radial-gradient(ellipse at 50% 40%, #123274 0%, #0a246a 55%, #05123c 100%);
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
		top: calc(46% - clamp(125px, 15.5vw, 200px) - 34px);
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

	.meter {
		position: absolute;
		left: 50%;
		top: calc(46% + clamp(125px, 15.5vw, 200px) + 26px);
		transform: translateX(-50%);
		width: clamp(140px, 17vw, 220px);
		height: 12px;
		border: 2px solid var(--machine-ink);
		border-radius: 3px;
		background: var(--machine-dark);
		overflow: hidden;
	}
	.meter span {
		display: block;
		height: 100%;
		background: repeating-linear-gradient(90deg, var(--machine-ink) 0 4px, transparent 4px 8px);
		transition: width 0.4s ease;
	}

	.start {
		position: absolute;
		left: 50%;
		top: calc(46% + clamp(125px, 15.5vw, 200px) + 58px);
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
		.vent {
			display: none;
		}
	}
</style>
