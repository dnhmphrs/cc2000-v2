<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { cubicIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
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
		'with the statistical accuracy',
		'only the internet can provide'
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

	// The glass, painted. The fit below is a CONTAIN fit — the viewport's shape
	// and the monitor's are not the same, so the machine is letterboxed inside
	// the glass — and what showed in the letterbox was the room's own CRT, which
	// is black. Flying ALL the way in (RETURN_FILL) makes that black most of the
	// frame for the last half-second of the move, and the run ends on a black
	// screen with a yellow window in it rather than on yellow.
	//
	// So the glass is filled. One panel behind the machine, in viewport
	// coordinates, tracking the same live rect: the monitor is simply ON, and
	// what the camera flies into is a screen that is already the right colour.
	//
	// It is a SIBLING of the machine and not a child of it, because the machine
	// carries a transform and a transform is a containing block — a fixed
	// element inside it would be positioned against it rather than the viewport.
	let bleed;

	// A little PAST the rect. screenRect() measures the glass quad the machine is
	// painted on, and the room's monitor is drawn with a black CRT face a shade
	// larger than it — so a panel at exactly the rect leaves a black margin all
	// the way round, which is the very thing this exists to remove. The artwork
	// is one drawing at one scale, so the overshoot is a constant.
	const GLASS_BLEED = 1.17;

	function fillGlass(rect) {
		if (!bleed || !rect) return;
		const w = rect.width * GLASS_BLEED;
		const h = rect.height * GLASS_BLEED;
		bleed.style.left = `${rect.left - (w - rect.width) / 2}px`;
		bleed.style.top = `${rect.top - (h - rect.height) / 2}px`;
		bleed.style.width = `${w}px`;
		bleed.style.height = `${h}px`;
	}

	// The fit itself: the whole viewport painted into the glass rect, centred in
	// the leftover — the monitor's shape and the viewport's are not the same, and
	// a page pinned to the glass's corner reads as a mistake rather than a screen.
	//
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
		fillGlass(rect);
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
	//
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
			// It holds a beat on the finished text and then hands over. Not a
			// click — there is nothing on screen to click, and asking someone to
			// dismiss four lines they have just read is a step that does no work.
			if (li >= LINES.length) {
				timer = setTimeout(() => (typed = true), T.titleHold * 1000);
				return;
			}
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

	// A SKIP, not the way through. The title card hands over on its own; this is
	// only here so somebody who has read it before does not have to sit through
	// the typing again.
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

{#if booting}
	<!-- The monitor, on. See fillGlass(). -->
	<div class="bleed" bind:this={bleed} />
{/if}

<!-- ── THE TITLE CARD ──────────────────────────────────────────────────────
     Before the machine there is nothing but the text, on black, scanned. The
     manifesto used to be typed INSIDE the machine's own little CRT, which meant
     the first thing a cold visitor met was a fully-built cartoon calculator
     sitting there doing nothing while four lines crawled across a five-inch
     screen in the middle of it. The words come first and the machine arrives
     after them.

     It is not a click-through. It types, holds a beat, and hands over. A
     pointerdown skips the rest of the typing for anyone who has read it before,
     but nothing waits on one. -->
{#if !typed}
	<div class="prelude" out:fade={{ duration: 420 }} on:pointerdown={skip}>
		<div class="scan" />
		<div class="spiel">
			{#each LINES as line, i}
				<!-- Each line is sized by the WHOLE line, hidden, with the part that
				     has been written so far laid over it. Otherwise the measure grows
				     as the text arrives and a centred line crawls sideways the entire
				     time it is being typed. -->
				<p>
					<span class="ghost">{line}</span>
					<span class="live"
						>{line.slice(0, shown[i])}{#if shown[i] > 0 && shown[i] < line.length}<span
								class="caret"
							/>{/if}</span
					>
				</p>
			{/each}
		</div>
	</div>
{/if}

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if typed}
	<div
		bind:this={root}
		class="calculator"
		class:cold={booting}
		class:realised
		in:outOfMonitor={{ rect: arrivingFrom }}
		out:intoLens
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
				<!-- The tube is scanned from the first frame it is on. It used to be
			     drawn on the full-screen glass and nowhere else, so the machine's
			     own CRT was the one screen in the site with no lines on it. Under
			     the gleam, because the gleam is a reflection off the FRONT of the
			     glass and the raster is behind it. -->
				<div class="scan" />
				<div class="gleam" />
				{#if $edge}
					<!-- Out of range. The machine says so and stays where it is. -->
					<div class="verdict">
						<p class="err">{EDGE[$edge].head}</p>
						<p class="msg">{EDGE[$edge].line}</p>
					</div>
				{:else}
					<!-- THE READOUT IS ALSO THE KEYBOARD. In landscape the two lines the
				     operator has to fill in are real form controls, sitting on the
				     glass where the answer is read — so the machine can be driven
				     either by turning the knobs on the chassis or by typing into
				     its own screen, and the two are the same three stores. Turn a
				     dial and the fields follow it; pick a field and the dial turns.

				     Portrait already had the plain controls, in the panel under the
				     window, and keeps them: its screen is too small to hold a row
				     of selects and the panel would then be a second copy of them in
				     the document. Which is the rule for the whole machine — exactly
				     one control of each kind EXISTS at any width. -->
					<dl class="readout">
						<div>
							<dt>subject dob</dt>
							{#if $aspect === 'portrait'}
								<dd>{readout}</dd>
							{:else}
								<dd class="entry">
									<select bind:value={$dobDay} aria-label="day">
										<option value="" disabled>--</option>
										{#each days as d}<option value={d}>{String(d).padStart(2, '0')}</option>{/each}
									</select>
									<select bind:value={$dobMonth} aria-label="month">
										<option value="" disabled>---</option>
										{#each MONTHS as m, i}<option value={i + 1}>{m.toUpperCase()}</option>{/each}
									</select>
									<select bind:value={$dobYear} aria-label="year">
										<option value="" disabled>----</option>
										{#each YEARS as y}<option value={y}>{y}</option>{/each}
									</select>
								</dd>
							{/if}
						</div>
						<div>
							<dt>how spicy do your parents like it?</dt>
							{#if $aspect === 'portrait'}
								<dd>{String($spicy).padStart(2, '0')} / 10</dd>
							{:else}
								<dd class="entry">
									<select bind:value={$spicy} aria-label="spicy">
										{#each Array.from({ length: 10 }, (_, i) => i + 1) as n}
											<option value={n}>{String(n).padStart(2, '0')}</option>
										{/each}
									</select>
									<span class="of">/ 10</span>
								</dd>
							{/if}
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
			<div class="dials" on:click|stopPropagation>
				<Dial
					label="month"
					min={1}
					max={12}
					start={6}
					value={$dobMonth}
					format={(v) => MONTHS[v - 1].toUpperCase()}
					on:change={(e) => dobMonth.set(e.detail)}
				/>
				<Dial
					label="day"
					min={1}
					max={maxDay}
					start={15}
					value={$dobDay}
					on:change={(e) => dobDay.set(e.detail)}
				/>
			</div>

			<!-- The year, under the screen, as the band on a car radio. -->
			<div class="tuner" on:click|stopPropagation>
				<Tuner
					label="year"
					min={MIN_YEAR}
					max={MAX_YEAR}
					start={1990}
					value={$dobYear}
					on:change={(e) => dobYear.set(e.detail)}
				/>
			</div>

			<!-- And how spicy, on the right. -->
			<div class="switches" on:click|stopPropagation>
				<Lever
					label="spicy"
					min={1}
					max={10}
					low="spicy?"
					high="how"
					value={$spicy}
					on:change={(e) => spicy.set(e.detail)}
				/>
			</div>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#if $aspect === 'portrait'}
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
{/if}

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
		/* The machine is a DRAWING. Dragging across it and lighting its labels up
		   in ::selection yellow makes a cartoon object look like a web page that
		   has gone wrong, and there is nothing on it anybody wants to copy. */
		user-select: none;
		-webkit-user-select: none;
		/* Laid out from config/layout.js, which +layout.svelte writes onto :root
		   for the current aspect. --below is the chassis line under the glass. */
		--winh: calc(var(--win) / var(--win-aspect));
		--below: calc(var(--win-y) + var(--winh) / 2);
		/* The two real controls on the chassis edges. Big, because they are meant
		   to be grabbed and turned rather than aimed at. */
		--dial: clamp(58px, 7vw, 104px);
		--lever-h: clamp(150px, 22vh, 260px);
	}

	/* The room's monitor glass, filled with the machine's own yellow for as long
	   as the machine is inside it. Positioned from the live rect in fillGlass();
	   it is only ever on screen during the flight home. */
	.bleed {
		position: fixed;
		z-index: 19;
		background: var(--machine);
		pointer-events: none;
	}

	/* THERE IS NO FRAME ROUND THE MACHINE ANY MORE. There used to be, and only
	   on the way home: at a fifth of the size the flat yellow panel was floating
	   in black glass and needed an edge to be an object at all. The glass is
	   painted now (.bleed above), so the panel and the screen it is on are the
	   same yellow and a rounded orange rectangle inset in the middle of that is
	   not an edge, it is a stray box. --edge survives because the chassis rule
	   below still scales its own line by it. */

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
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		justify-content: center;
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
	.gleam {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: var(--glass);
	}
	/* The raster. Same variable the full-screen glass uses, because they are the
	   same pane seen from in front of it and then from inside it. Positioned, so
	   it paints over the static text underneath exactly as the gleam does. */
	.scan {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: var(--scanlines);
	}

	/* ── The title card ────────────────────────────────────────────────────
	   The whole viewport, black, scanned, with nothing on it but the words. The
	   machine does not exist yet. */
	.prelude {
		position: fixed;
		inset: 0;
		z-index: 20;
		pointer-events: auto;
		background: var(--bg);
		display: grid;
		place-items: center;
		font-family: var(--tech);
		cursor: default;
		user-select: none;
		-webkit-user-select: none;
	}

	/* Centred as a block, set left inside it, at a width fixed by the whole line.
	   All three matter: centre the LINES and each one crawls sideways as it is
	   typed, and let the block shrink-wrap and its left edge crawls instead. */
	.spiel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55em;
		padding: 6vh 6vw;
		max-width: 100%;
	}
	.spiel p {
		position: relative;
		margin: 0;
		max-width: 100%;
		/* Read at arm's length, not squinted at: this is the only thing on screen
		   and it used to be set at the size it needed to fit a five-inch CRT. */
		font-size: clamp(13px, 1.45vw, 21px);
		line-height: 1.6;
		letter-spacing: 0.04em;
		/* ONE colour. The last line used to come up yellow, which reads as the
		   punchline being flagged for you. */
		color: rgba(240, 242, 248, 0.82);
	}
	.spiel .ghost {
		visibility: hidden;
	}
	.spiel .live {
		position: absolute;
		inset: 0;
		white-space: pre;
	}

	/* ── Typed entry, on the glass ─────────────────────────────────────────
	   Real selects, drawn as the readout they replace: no box, no chrome, one
	   underline in the machine's yellow so it is legible as something you can
	   press. The chassis knobs and these write the same three stores, so either
	   one moves the other. */
	.entry {
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: clamp(6px, 0.7vw, 12px);
	}
	.entry select {
		font: inherit;
		font-size: clamp(10px, 1.05vw, 14px);
		letter-spacing: 0.08em;
		color: var(--yellow);
		background: transparent;
		border: 0;
		border-bottom: 1px dashed rgba(255, 212, 38, 0.45);
		border-radius: 0;
		padding: 0 0 2px;
		cursor: pointer;
		outline: none;
	}
	.entry select:focus-visible {
		border-bottom-style: solid;
		border-bottom-color: var(--yellow);
	}
	/* The list itself is drawn by the OS, so it gets the tube's own colours
	   rather than a white sheet dropping out of a black screen. */
	.entry select option {
		background: var(--machine-crt);
		color: rgba(240, 242, 248, 0.85);
	}
	.entry .of {
		font-size: clamp(9px, 0.9vw, 12px);
		letter-spacing: 0.08em;
		color: rgba(240, 242, 248, 0.5);
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
		border: var(--pen) solid var(--machine-ink);
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
		left: max(2.5vw, 16px);
		gap: clamp(12px, 2.2vh, 26px);
	}
	.trim.right {
		right: max(2.5vw, 16px);
		gap: clamp(10px, 1.8vh, 22px);
	}

	.knob {
		width: clamp(30px, 3vw, 48px);
		height: clamp(30px, 3vw, 48px);
		border-radius: 50%;
		background: var(--machine-light);
		border: var(--pen) solid var(--machine-ink);
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
		border: var(--pen) solid var(--machine-ink);
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
		background: var(--machine-teal);
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
		border: var(--pen) solid var(--machine-ink);
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
		border: var(--pen) solid var(--machine-ink);
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
		border: var(--pen) solid var(--machine-ink);
		box-shadow: 0 var(--drop) 0 var(--machine-ink);
		background: repeating-linear-gradient(
			to bottom,
			var(--machine-ink) 0 4px,
			var(--machine-light) 4px 9px
		);
	}
	.vent.left {
		left: max(3vw, 18px);
		transform: rotate(-1.6deg);
	}
	.vent.right {
		right: max(3vw, 18px);
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
		border: var(--pen) solid var(--machine-ink);
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
		background: var(--machine-red);
		color: #fff5ec;
		opacity: 1;
		cursor: pointer;
		animation: pulse 1.5s ease-in-out infinite;
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
			background: var(--machine-red);
		}
		50% {
			background: #ff7a4a;
		}
	}

	.screw {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--machine-light);
		border: var(--pen) solid var(--machine-ink);
	}
	.screw::after {
		content: '';
		position: absolute;
		inset: 4px 1px;
		border-top: 3px solid var(--machine-ink);
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
