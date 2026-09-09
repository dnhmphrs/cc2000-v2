<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { cubicIn } from 'svelte/easing';
	import {
		dobMonth,
		dobDay,
		dobYear,
		aspect,
		date,
		spicy,
		track,
		decade,
		conceived,
		edge,
		monitorRect,
		calcZoom
	} from '$lib/store/store';
	import { SCENES } from '$lib/config';
	import { begin, settled } from './director';
	import { resolve } from '$lib/functions/answer';
	import Dial from '$lib/components/Dial.svelte';
	import Lever from '$lib/components/Lever.svelte';
	import Tuner from '$lib/components/Tuner.svelte';

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
	// Because arriving draws the WHOLE page at monitor scale, the chassis, the
	// dials and the glass would each be a handful of unreadable pixels, and all
	// of them zooming at you at once is noise. So nothing is drawn on the way
	// home: what flies out of the monitor is one flat yellow panel, and the
	// machine cross-fades in on top of it once it is at screen size.
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

	// The two dates the archive cannot answer for. Reported here rather than
	// anywhere else, because neither one has a room to fall into.
	const EDGE = {
		past: {
			head: 'error — out of range',
			line: 'you were born in the time of dinosaurs. there was no music.'
		},
		future: {
			head: 'error — out of range',
			line:
				'you were born in the After Time. those lucky enough to be born were ' +
				'conceived to "Baby" by Justin Bieber, as it is the only remaining ' +
				'music allowed by The Council.'
		}
	};

	// Whether this mount is a return trip. Read once: monitorRect is cleared as
	// soon as the arrival finishes.
	const arrivingFrom = get(monitorRect);

	let shown = LINES.map(() => 0);
	let typed = !!arrivingFrom; // no manifesto second time round
	let realised = !arrivingFrom; // are the real controls allowed on screen yet
	// Cold until it has actually landed. On the way home the machine is a picture
	// inside somebody's monitor, a few dozen pixels across: the chassis, the
	// dials and the glass are a handful of unreadable pixels each, and all of it
	// zooming at you at once is noise. So what flies out of the monitor is one
	// flat yellow panel, and the machine cross-fades in on top of it once it is
	// at screen size.
	let booting = !!arrivingFrom;

	// The machine comes on. Taken from the transition's own end where possible,
	// with the timer below as the fallback if it is ever interrupted.
	let root;
	let landed = false;

	// Put the node back the way a fresh load leaves it. The flight writes three
	// things inline and all three are the flight's, not the machine's: the fit
	// transform, the origin it is taken about, and --edge. A transform on a
	// fixed, full-viewport element is also a containing block and a stacking
	// context for everything inside it, and there is no reason to keep one once
	// it has landed.
	function normalise(node) {
		if (!node) return;
		node.style.transform = '';
		node.style.transformOrigin = '';
		node.style.removeProperty('--edge');
	}

	function land() {
		if (landed) return;
		landed = true;
		normalise(root);
		booting = false;
		realised = true;
		settled();
	}
	let timer;
	let power = 0;
	let ticker;

	// ── Walking the operator through it ──────────────────────────────────────
	// The machine has four controls on four different edges and no instructions,
	// and every one of them starts on a valid default — so it looks finished the
	// moment it comes on and there is nothing to tell you that the answer it is
	// about to give you is for the first of January 2000 rather than for you.
	//
	// So it asks, one thing at a time: the screen says what it wants next and the
	// control it wants gets a ring round it. What counts as "done" is being
	// TOUCHED, not being valid — the defaults are already valid, which is the
	// whole problem — and the button stays live throughout, because somebody
	// genuinely born on 01 JAN 2000 must not be locked out by their own birthday.
	const STEPS = [
		{
			say: 'set the month and the day',
			wide: 'the two dials, left of the screen',
			tall: 'the first two pickers below'
		},
		{ say: 'tune the year', wide: 'the band under the screen', tall: 'the third picker below' },
		{
			say: 'how spicy do your parents like it',
			wide: 'the lever, right of the screen',
			tall: 'the slider below'
		},
		{ say: 'press calculate', wide: 'the machine has what it needs', tall: 'it has what it needs' }
	];
	let didMonth = false;
	let didDay = false;
	let didYear = false;
	let didSpicy = false;
	$: step = !(didMonth && didDay) ? 0 : !didYear ? 1 : !didSpicy ? 2 : 3;
	$: hint = STEPS[step][$aspect === 'portrait' ? 'tall' : 'wide'];

	// bind:value, not value={...}: a plain value on a <select> whose <option>
	// list re-renders does not stick, and the day list changes with the month.
	$: maxDay = $dobMonth && $dobYear ? new Date(+$dobYear, +$dobMonth, 0).getDate() : 31;
	$: days = Array.from({ length: maxDay }, (_, i) => i + 1);
	// Clamp rather than clear, so picking the year last cannot silently wipe a
	// day of 29–31 and leave the button dead with no explanation.
	$: if ($dobDay && Number($dobDay) > maxDay) dobDay.set(maxDay);
	$: complete = $dobMonth && $dobDay && $dobYear;
	// Any change to the dials clears the last verdict — the machine is being
	// asked a new question.
	$: if ($dobMonth || $dobDay || $dobYear || $spicy) edge.set(null);
	$: readout = complete
		? `${String($dobDay).padStart(2, '0')} ${MONTHS[$dobMonth - 1].toUpperCase()} ${$dobYear}`
		: '-- --- ----';

	// ── The two moves ────────────────────────────────────────────────────────
	// Both are Svelte transitions rather than hand-rolled state, so the element
	// stays mounted for exactly as long as its move takes and no flag has to be
	// kept in step with a timer.

	// Out of the room's monitor — the OTHER HALF of nothing, because there is
	// only one move and the camera is making it.
	//
	// This paints the page into the monitor glass and does no more than that: it
	// reads the live rect every frame and fits itself to it. The growth is
	// entirely the camera's dolly-zoom onto that glass (Computation.stepReturn),
	// so the two cannot be two different moves — which is exactly what a scale
	// of its own here used to make them. By the time the camera lands, the glass
	// covers the viewport and this fit is the identity of its own accord.
	//
	// `tick` rather than `css` because the rect is moving and the zoom level is
	// published as it goes; a css transition is compiled to keyframes up front
	// and can do neither.
	// On-screen width of the chassis edge, in real pixels, at any scale.
	const EDGE_PX = 3;

	// The fit itself: the whole viewport painted into the glass rect, centred in
	// the leftover — the monitor's shape and the viewport's are not the same, and
	// a page pinned to the glass's corner reads as a mistake rather than a screen.
	function fitTo(node, rect) {
		let fitK, fitX, fitY;
		if (!node || !rect) return;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		fitK = Math.min(rect.width / vw, rect.height / vh);
		fitX = rect.left + (rect.width - vw * fitK) / 2;
		fitY = rect.top + (rect.height - vh * fitK) / 2;
		node.style.transformOrigin = '0 0';
		node.style.transform = `translate(${fitX}px, ${fitY}px) scale(${fitK})`;
		// Undo the scale for the chassis edge, so it is the same number of real
		// pixels wide at any size. See .calculator::after.
		node.style.setProperty('--edge', `${(EDGE_PX / Math.max(fitK, 0.02)).toFixed(2)}px`);
	}

	function outOfMonitor(node, { rect }) {
		if (!rect) return { duration: 0 };
		node.style.transformOrigin = '0 0';
		return {
			duration: T.arrive * 1000,
			tick: (t) => {
				fitTo(node, get(monitorRect) ?? rect);
				// The end of the move IS the moment it comes on, so it is taken
				// from here rather than from a timer that could drift off it. By
				// then the glass covers the viewport and the fit is the identity of
				// its own accord — but it is cleared explicitly, and OUTSIDE
				// land(), because the timer fallback can have called land() already
				// and land() only runs once.
				if (t === 1) {
					normalise(node);
					land();
				} else {
					fitTo(node, get(monitorRect) ?? rect);
				}
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
			// Nothing is on screen but a yellow panel until the move lands, so the
			// controls arrive with everything else rather than on a clock of their
			// own — and .calculator.realised .controls would out-rank the cold rule
			// and show them over the panel if they did not.
			timer = setTimeout(land, T.arrive * 1000);
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

		// The archive is consulted in functions/answer.js. Neither out-of-range
		// verdict has a room to fall into, so neither one goes anywhere: the
		// machine reports it on its own screen and waits to be asked again.
		const found = resolve(get(date), $spicy);
		if (found.edge) return edge.set(found.edge);

		edge.set(null);
		track.set(found.track);
		conceived.set(found.conceived);
		decade.set(found.decade);
		begin();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	bind:this={root}
	class="calculator"
	class:cold={booting}
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
			<div class="gleam" />
			{#if !typed}
				{#each LINES as line, i}
					<p class:lit={i === LINES.length - 1}>
						{line.slice(0, shown[i])}{#if shown[i] > 0 && shown[i] < line.length}<span
								class="caret"
							/>{/if}
					</p>
				{/each}
			{:else if $edge}
				<!-- Out of range. The machine says so and stays where it is. -->
				<div class="verdict">
					<p class="err">{EDGE[$edge].head}</p>
					<p class="msg">{EDGE[$edge].line}</p>
				</div>
			{:else}
				<dl class="readout">
					<div>
						<dt>subject dob</dt>
						<dd>{readout}</dd>
					</div>
					<div>
						<dt>how spicy do your parents like it?</dt>
						<dd>{String($spicy).padStart(2, '0')} / 10</dd>
					</div>
				</dl>

				<!-- What to do next, and where the thing that does it is. The
				     machine is four controls on four edges with no instructions;
				     this is the instructions. -->
				<div class="prompt">
					<span class="n">{step + 1} / {STEPS.length}</span>
					<span class="say">{STEPS[step].say}</span>
					<span class="hint">{hint}</span>
				</div>
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

	{#if $aspect !== 'portrait'}
		<!-- The chassis furniture: knobs and flip switches that do nothing, out on
		     the edges of the machine where decoration belongs. -->
		<div class="trim left">
			{#each [22, -48, 71, -14] as deg, i}
				<span class="knob" style="--deg:{deg}deg; --d:{i * 0.7}s"><i /></span>
			{/each}
		</div>
		<div class="trim right">
			{#each [1, 0, 1, 1, 0] as up}
				<span class="flip" class:up><i /></span>
			{/each}
		</div>
	{/if}

	<!-- The controls sit BY THE SCREEN, and the decoration is out on the rim —
	     what you reach for is next to what you are reading. The panel below the
	     window is the portrait fallback. They are swapped with
	     {#if} rather than CSS, so exactly one of each control EXISTS — hiding one
	     leaves a second month/day/year in the document for anything that walks it
	     rather than looks at it. -->
	{#if $aspect !== 'portrait'}
		<div class="dials" class:cue={step === 0} on:click|stopPropagation>
			<Dial
				label="month"
				min={1}
				max={12}
				start={6}
				value={$dobMonth}
				format={(v) => MONTHS[v - 1].toUpperCase()}
				on:change={(e) => {
					dobMonth.set(e.detail);
					didMonth = true;
				}}
			/>
			<Dial
				label="day"
				min={1}
				max={maxDay}
				start={15}
				value={$dobDay}
				on:change={(e) => {
					dobDay.set(e.detail);
					didDay = true;
				}}
			/>
		</div>

		<!-- The year, under the screen, as the band on a car radio. -->
		<div class="tuner" class:cue={step === 1} on:click|stopPropagation>
			<Tuner
				label="year"
				min={MIN_YEAR}
				max={MAX_YEAR}
				start={1990}
				value={$dobYear}
				on:change={(e) => {
					dobYear.set(e.detail);
					didYear = true;
				}}
			/>
		</div>

		<!-- And how spicy, on the right. -->
		<div class="switches" class:cue={step === 2} on:click|stopPropagation>
			<Lever
				label="spicy"
				min={1}
				max={10}
				low="spicy?"
				high="how"
				value={$spicy}
				on:change={(e) => {
					spicy.set(e.detail);
					didSpicy = true;
				}}
			/>
		</div>
	{/if}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	{#if $aspect === 'portrait'}
		<div class="controls" on:click|stopPropagation>
			<div class="ctl" class:cue={step <= 1}>
				<span class="lab">date of birth</span>
				<div class="dob">
					<select bind:value={$dobMonth} on:change={() => (didMonth = true)} aria-label="month">
						<option value="" disabled>mth</option>
						{#each MONTHS as m, i}<option value={i + 1}>{m}</option>{/each}
					</select>
					<select bind:value={$dobDay} on:change={() => (didDay = true)} aria-label="day">
						<option value="" disabled>day</option>
						{#each days as d}<option value={d}>{d}</option>{/each}
					</select>
					<select bind:value={$dobYear} on:change={() => (didYear = true)} aria-label="year">
						<option value="" disabled>year</option>
						{#each YEARS as y}<option value={y}>{y}</option>{/each}
					</select>
				</div>
			</div>

			<div class="ctl" class:cue={step === 2}>
				<span class="lab">how spicy do you like it?</span>
				<input
					type="range"
					bind:value={$spicy}
					on:input={() => (didSpicy = true)}
					min="1"
					max="10"
					aria-label="spicy"
				/>
				<div class="ends"><span>how</span><span>spicy?</span></div>
			</div>
		</div>
	{/if}

	<div class="vent left" />
	<div class="vent right" />
	<div class="grille" />

	<button
		class="go"
		class:armed={complete}
		class:cue={step === 3}
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
		/* The two real controls on the chassis edges. Big, because they are meant
		   to be grabbed and turned rather than aimed at. */
		--dial: clamp(58px, 7vw, 104px);
		--lever-h: clamp(150px, 22vh, 260px);
	}

	/* The machine's edge, and ONLY on the way home. A machine that fills the
	   screen has no need of a frame — but the same machine drawn inside the
	   room's monitor at a fifth of the size is a flat yellow rectangle floating
	   in the glass, and that does. So it is on .cold, which is exactly the window
	   in which the calculator is small and yellow, and gone the moment it lands.
	   
	   Orange rather than ink: a black frame on a yellow panel inside a black-
	   bezelled monitor is three dark edges in a row, and it read as a mistake.
	   
	   The width is constant ON SCREEN rather than in the layout: at a fifth scale
	   a plain 3px border renders as less than one, so outOfMonitor divides --edge
	   by the scale it is fitting at and it holds its weight all the way in.
	   
	   A pseudo-element because .cold blanks the real children, and this has to
	   survive that. */
	.calculator.cold::after {
		content: '';
		position: absolute;
		inset: 0;
		border: var(--edge, 3px) solid var(--machine-orange);
		/* Curved, and by the same scale-compensated number, so the corners keep
		   their radius rather than going square as the frame grows. */
		border-radius: calc(var(--edge, 3px) * 3);
		pointer-events: none;
		z-index: 5;
	}

	/* Coming home, the whole machine is one flat yellow panel until the move has
	   landed, and then cross-fades into itself. The background goes with it —
	   without that, dropping .cold would punch the transparent window through to
	   the 3D behind a machine that has not been drawn yet. */
	.calculator {
		border-radius: 0;
		transition: background-color 0.5s ease 0.06s, border-radius 0.5s ease 0.06s;
	}
	.calculator > :global(*) {
		transition: opacity 0.5s ease 0.06s;
	}
	.calculator.cold {
		background: var(--machine);
		/* The yellow is CLIPPED to the same curve as the frame drawn round it.
		   Without this the panel is a hard rectangle behind a rounded border and
		   its four corners poke out past it — small, but they are the only sharp
		   thing in the shot and the eye goes straight to them.

		   Landing drops .cold, and the radius eases back out to square with the
		   yellow rather than snapping mid-cross-fade. Home is then exactly the
		   machine a fresh load draws: no frame, no corners. */
		border-radius: calc(var(--edge, 3px) * 3);
		transition: none;
	}
	.calculator.cold > :global(*) {
		opacity: 0;
		transition: none;
	}

	/* Everything that is not the cartoon machine waits until it is nearly home,
	   because at monitor scale it is a few unreadable pixels. */
	.controls,
	.trim,
	.tuner,
	.dials,
	.switches,
	.go {
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}
	.calculator.realised .controls,
	.calculator.realised .trim,
	.calculator.realised .tuner,
	.calculator.realised .dials,
	.calculator.realised .switches,
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
		left: var(--rim);
		right: var(--rim);
		top: 0;
		height: calc(var(--win-y) - var(--winh) / 2);
	}
	.body.bottom {
		left: var(--rim);
		right: var(--rim);
		top: calc(var(--win-y) + var(--winh) / 2);
		bottom: 0;
	}
	/* A pixel of overlap top and bottom: four bars meeting exactly leaves a
	   hairline seam wherever the layout rounds. */
	.body.left,
	.body.right {
		width: calc(50% - var(--win) / 2 - var(--rim) + 1px);
		top: calc(var(--win-y) - var(--winh) / 2 - 1px);
		height: calc(var(--winh) + 2px);
	}
	.body.left {
		left: var(--rim);
	}
	.body.right {
		right: var(--rim);
	}

	.window {
		position: absolute;
		left: 50%;
		top: var(--win-y);
		width: var(--win);
		aspect-ratio: var(--win-aspect);
		transform: translate(-50%, -50%);
		border-radius: 22px;
		/* Outside in: ink, a fat band of light yellow, ink again. The glass is
		   drawn ONTO the chassis rather than recessed into it. */
		box-shadow: inset 0 0 0 4px var(--machine-ink), inset 0 0 0 15px var(--machine-light),
			inset 0 0 0 19px var(--machine-ink), inset 0 16px 26px rgba(0, 0, 0, 0.45),
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
		inset: 19px;
		/* The window's own radius LESS its inset, so the glass follows the inner
		   edge of the bezel exactly. Any more and the corners open up and the
		   scene shows through the gap; the bezel is 19px and the window is 22. */
		border-radius: 3px;
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
		padding: clamp(14px, 2.2vh, 26px) clamp(14px, 2vw, 30px);
		display: flex;
		flex-direction: column;
		/* The readout at the TOP, the instruction pinned to the bottom, and the
		   ovum the machine is looking at in the gap between them. Centred, all
		   three land on top of each other and on the thing behind the glass. */
		justify-content: flex-start;
		gap: 2px;
		overflow: hidden;
	}

	/* The gleam on this machine's own glass. Two hard diagonal bands rather than
	   a soft specular, because everything else here is inked and a rendered
	   highlight would be the one thing that is not.
	   
	   There are no SCANLINES on this machine at all. components/Glass.svelte
	   lays them over the site for the flight and nothing else — over the two
	   ends of the loop, this one and the bedroom, they would be a second 3px
	   pitch on top of a screen that already has one: a moiré, not a CRT. */
	/* Held right back. A hard diagonal streak across the glass is how a cartoon
	   says "this is shiny", and this is an instrument. */
	.gleam {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: var(--glass);
		opacity: 0.4;
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
	/* The instruction. It sits at the bottom of the glass, under the readout,
	   because the readout is what the machine KNOWS and this is what it WANTS. */
	.prompt {
		position: absolute;
		left: clamp(14px, 2vw, 30px);
		right: clamp(14px, 2vw, 30px);
		bottom: clamp(12px, 2vh, 24px);
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0 0.9em;
		border-top: 1px solid rgba(240, 196, 92, 0.28);
		padding-top: clamp(6px, 1vh, 12px);
		/* The glass is transparent and there is a lit ovum turning behind it, so
		   the one thing on this screen that has to be READ gets its own ground. */
		background: linear-gradient(
			to top,
			rgba(7, 7, 10, 0.94) 0%,
			rgba(7, 7, 10, 0.9) 72%,
			rgba(7, 7, 10, 0) 100%
		);
		box-shadow: 0 clamp(12px, 2vh, 24px) 0 rgba(7, 7, 10, 0.94);
	}
	.prompt .n {
		font-size: clamp(7px, 0.72vw, 9px);
		letter-spacing: 0.24em;
		color: rgba(240, 196, 92, 0.6);
	}
	.prompt .say {
		font-size: clamp(9px, 1vw, 13px);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--machine-ink);
	}
	.prompt .hint {
		flex: 1 0 100%;
		font-size: clamp(7px, 0.74vw, 10px);
		letter-spacing: 0.12em;
		color: rgba(240, 242, 248, 0.42);
	}

	.verdict p {
		margin: 0;
	}
	.verdict .err {
		font-size: clamp(7px, 0.72vw, 9px);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--machine-lamp);
		margin-bottom: 0.7em;
	}
	.verdict .msg {
		font-size: clamp(9px, 0.95vw, 12px);
		line-height: 1.5;
		color: rgba(240, 242, 248, 0.85);
	}

	/* ── Fascia ──────────────────────────────────────────────────────────── */
	.plate {
		position: absolute;
		left: 50%;
		top: max(4vh, 20px);
		/* Stuck on by hand, so it is not quite straight. */
		transform: translateX(-50%) rotate(-1.4deg);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px clamp(18px, 2.8vw, 32px);
		background: var(--machine-light);
		border: var(--ink) solid var(--machine-ink);
		border-radius: 14px;
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
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
		gap: 9px;
	}
	.lamps i {
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: var(--machine-dark);
		border: 2px solid var(--machine-ink);
	}
	.lamps i.on {
		background: var(--machine-red);
	}

	/* Out at the edges of the chassis. Pulling these in to flank the window was
	   tried and is worse: the machine IS the whole screen, and furniture huddled
	   round the glass reads as a small object with a lot of blank around it
	   rather than as a big panel. */
	.tuner {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + var(--controls-gap));
		transform: translateX(-50%);
		width: min(var(--win), 92vw);
	}

	/* ── The trim ─────────────────────────────────────────────────────────
	   Knobs and flip switches that do nothing, flanking the window — so the run
	   between the screen and the controls out on the chassis rim is not just
	   empty yellow. */
	.trim {
		position: absolute;
		top: var(--win-y);
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.trim.left {
		left: calc(var(--rim) + max(2.5vw, 16px));
		gap: clamp(12px, 2.2vh, 26px);
	}
	.trim.right {
		right: calc(var(--rim) + max(2.5vw, 16px));
		gap: clamp(10px, 1.8vh, 22px);
	}

	.knob {
		width: clamp(30px, 3vw, 48px);
		height: clamp(30px, 3vw, 48px);
		border-radius: 50%;
		background: var(--machine-light);
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		display: grid;
		place-items: center;
		transform: rotate(var(--deg));
		animation: nudge 5.5s ease-in-out infinite;
		animation-delay: var(--d);
	}
	.knob i {
		display: block;
		width: 4px;
		height: 40%;
		border-radius: 2px;
		background: var(--machine-ink);
		transform: translateY(-30%);
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

	.flip {
		width: 24px;
		height: 38px;
		border-radius: 8px;
		background: var(--machine-dark);
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		display: flex;
		align-items: flex-end;
		padding: 3px;
	}
	.flip.up {
		align-items: flex-start;
	}
	.flip i {
		display: block;
		width: 100%;
		height: 52%;
		border-radius: 5px;
		background: var(--machine-ink);
	}

	.dials {
		position: absolute;
		right: calc(50% + var(--win) / 2 + clamp(16px, 2.4vw, 54px));
		top: var(--win-y);
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(14px, 2.6vh, 30px);
	}
	.switches {
		position: absolute;
		left: calc(50% + var(--win) / 2 + clamp(16px, 2.4vw, 54px));
		top: var(--win-y);
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: clamp(10px, 1.8vh, 22px);
	}
	.controls {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + var(--controls-gap));
		transform: translateX(-50%);
		display: flex;
		align-items: flex-start;
		gap: clamp(16px, 2.6vw, 34px);
		padding: 14px clamp(16px, 2.2vw, 26px) 16px;
		background: var(--machine-dark);
		border: var(--ink) solid var(--machine-ink);
		border-radius: 16px;
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
	}

	.ctl {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.lab {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--machine-ink);
	}

	.dob {
		display: flex;
		gap: 6px;
	}

	select {
		font-family: var(--tech);
		font-size: 13px;
		letter-spacing: 0.04em;
		font-weight: 700;
		padding: 7px 9px;
		color: var(--machine-ink);
		background: var(--machine-light);
		border: var(--ink) solid var(--machine-ink);
		border-radius: 9px;
		box-shadow: 0 3px 0 var(--machine-ink);
		cursor: pointer;
	}

	input[type='range'] {
		width: clamp(130px, 15vw, 200px);
		margin: 7px 0 0;
		accent-color: var(--machine-red);
		cursor: pointer;
	}

	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--machine-ink);
		opacity: 0.75;
	}

	.vent {
		position: absolute;
		bottom: max(5vh, 28px);
		width: clamp(70px, 9vw, 120px);
		height: 38px;
		border-radius: 10px;
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		background: repeating-linear-gradient(
			to bottom,
			var(--machine-ink) 0 4px,
			var(--machine-light) 4px 9px
		);
	}
	.vent.left {
		left: calc(var(--rim) + max(3vw, 18px));
		transform: rotate(-1.6deg);
	}
	.vent.right {
		right: calc(var(--rim) + max(3vw, 18px));
		transform: rotate(1.6deg);
	}

	.grille {
		position: absolute;
		left: 50%;
		bottom: max(5vh, 28px);
		transform: translateX(-50%) rotate(0.8deg);
		width: clamp(90px, 11vw, 150px);
		height: 44px;
		border-radius: 12px;
		background: radial-gradient(circle, var(--machine-ink) 2px, transparent 2.2px) 0 0 / 9px 9px;
		border: var(--ink) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
	}

	.go {
		position: absolute;
		left: 50%;
		top: calc(var(--below) + var(--controls-gap) + var(--controls-h) + var(--button-gap));
		transform: translateX(-50%);
		font-family: var(--tech);
		font-size: 17px;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		padding: 17px 52px;
		border-radius: 18px;
		border: 4px solid var(--machine-ink);
		background: var(--machine-dark);
		color: var(--machine-ink);
		box-shadow: 0 7px 0 var(--machine-ink);
		cursor: default;
	}
	.calculator.realised .go {
		opacity: 0.55;
	}
	.calculator.realised .go.armed {
		background: var(--machine-ink);
		color: #0b0a08;
		opacity: 1;
		cursor: pointer;
	}
	/* And it only asks to be pressed once everything else has been set. Before
	   that it is a lit key you may press; after it, it is the next thing to do. */
	.calculator.realised .go.armed.cue {
		animation: pulse 1.6s ease-in-out infinite;
	}
	/* A real press: the whole button travels down onto its own shadow. */
	.go.armed:active {
		transform: translate(-50%, 7px);
		box-shadow: 0 0 0 var(--machine-ink);
		animation: none;
	}

	/* Blinks rather than glowing: a glow is a rendered effect and this machine is
	   drawn. It must not animate transform or size — an element whose box never
	   settles is one a pointer can never be sure it has hit, and it fails every
	   actionability check going. Colour alone moves nothing. */
	@keyframes pulse {
		0%,
		100% {
			background: var(--machine-ink);
		}
		50% {
			background: #fff0c8;
		}
	}

	/* ── The cue ──────────────────────────────────────────────────────────────
	   Which control the operator is being asked for. A ring round it, breathing,
	   and the machine says the same thing in words on its own screen — see
	   STEPS below. Outline rather than border or box-shadow: it does not take
	   part in layout, so nothing under it moves when it comes and goes. */
	.cue {
		outline: 1px solid var(--machine-ink);
		outline-offset: clamp(8px, 1.4vw, 18px);
		animation: cue 1.6s ease-in-out infinite;
	}
	@keyframes cue {
		0%,
		100% {
			outline-color: rgba(240, 196, 92, 0.85);
		}
		50% {
			outline-color: rgba(240, 196, 92, 0.16);
		}
	}
	.go.cue {
		outline: none;
	}

	.screw {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--machine-light);
		border: var(--ink) solid var(--machine-ink);
	}
	.screw::after {
		content: '';
		position: absolute;
		inset: 4px 1px;
		border-top: 3px solid var(--machine-ink);
		transform: rotate(28deg);
	}
	.screw.tl {
		left: calc(var(--rim) + 16px);
		top: 16px;
	}
	.screw.tr {
		right: calc(var(--rim) + 16px);
		top: 16px;
	}
	.screw.bl {
		left: calc(var(--rim) + 16px);
		bottom: 16px;
	}
	.screw.br {
		right: calc(var(--rim) + 16px);
		bottom: 16px;
	}

	/* A short laptop has the same problem portrait does, in the other direction:
	   the stack under the window is fixed px, so once the screen is short enough
	   the button reaches the vents. They are decoration and the window is not, so
	   they go and the window keeps its size. */
	@media (max-height: 860px) and (min-aspect-ratio: 85 / 100) {
		.vent,
		.grille {
			display: none;
		}
	}

	/* Portrait keeps the panel and has no chassis controls — the selects and the
	   range input are the right thing on a phone anyway. The panel stacks. */
	@media (max-aspect-ratio: 85 / 100) {
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
