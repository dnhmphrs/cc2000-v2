<script>
	import { fade } from 'svelte/transition';
	import { track, conceived, decade, monitorRect } from '$lib/store/store';
	import { SCENES, RESULT_PANEL, PLAYER, panelFit } from '$lib/config';
	import { formatDay, accuracyFor } from '$lib/functions/utils';
	import { again } from './director';

	// ── Scene 5: the room ────────────────────────────────────────────────────
	// The answer, in two places, and it took a while to work out that it wanted
	// to be in two places.
	//
	//   THE MONITOR holds the READOUT — the date, the title, the artist, the
	//   accuracy, and the one control. It is the machine's own screen and what
	//   is on it is the machine's own result: type on a black glass, which is
	//   what a machine that has just finished a computation shows you.
	//
	//   THE CORNER holds the PLAYER. Spotify's embed is not type, it is a piece
	//   of another company's furniture with a fixed minimum at which it is
	//   usable at all — its own compact card is 152px tall and it draws nothing
	//   smaller. Four of these rooms have monitors that are barely bigger than
	//   that, so putting the embed inside one meant either the readout or the
	//   player was always being crushed to fit around the other.
	//
	// It used to be one place, and the crush was the reason it kept looking
	// wrong: the 90s CRT is square to within two parts in a thousand and about
	// 230px on the diagonal at landing, so a 152px player left seventy pixels
	// for four lines of type. Now the glass has only type in it and can set that
	// type properly, and the player is at the size it was drawn to be.
	//
	// The rect the readout fills is measured, not guessed: the computation
	// projects that decade's screen glass to CSS pixels and publishes it as
	// monitorRect. Sizes come from config/layout.js — SCREEN_GLASS for where the
	// glass is, RESULT_PANEL for what to do once you are in it.
	//
	// One fallback, a centred card, for a run whose room art failed to measure.
	// Out-of-range dates never get here at all — they are refused in the popup
	// that asked for them, mid-flight, and the run never dives.
	//
	// The control hands back to the director, and the camera then flies into
	// this monitor and back into the flight — see Computation.stepReturn().

	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';
	$: accuracy = $track ? accuracyFor(`${$conceived}|${$track.spotify_uri}`) : '';

	// ── Where the player goes ────────────────────────────────────────────────
	// In the glass if the glass can hold it, at the edge of the screen if not.
	// The embed will not shrink below Spotify's 152px compact card — it clips
	// instead — so fitting it in a 240px monitor means giving the iframe its
	// natural size and scaling the whole card down with a transform. Under about
	// k = 0.7 the play control drops below a usable target, so there is a floor,
	// and under the floor it goes back outside. See PLAYER in config/layout.js.
	$: glass = $monitorRect;
	$: logicalW = Math.max(glass?.width ?? PLAYER.logical, PLAYER.logical);
	// Whichever runs out first: the width of the monitor, or half its height.
	$: k = glass
		? Math.min(glass.width / logicalW, ((glass.height - PLAYER.cta) * PLAYER.share) / PLAYER.height)
		: 1;
	// The control is a fixed bar at the foot, so what the card and the readout
	// have to share is the glass less that.
	$: usable = glass ? glass.height - PLAYER.cta : 0;
	$: inGlass = !!glass && k >= PLAYER.minScale && usable - PLAYER.height * k >= PLAYER.readout;
	$: deckH = inGlass ? PLAYER.height * k : 0;

	// Everything in the readout is sized in these units, so type, control and
	// padding all scale together with the monitor — and it is measured against
	// what the player LEAVES, not against the whole glass.
	$: fit = glass ? panelFit($decade, glass.width, usable - deckH) : null;
	$: s = fit ? fit.scale : 1;
	$: shape = fit ? fit.shape : RESULT_PANEL.shapes[0];

	const IN = { duration: SCENES.room.resultIn * 1000 };
</script>

{#if src && !inGlass}
	<!-- ── Too small a monitor: the player goes to the edge of the screen ─── -->
	<div class="deck loose" in:fade={{ duration: IN.duration, delay: 450 }}>
		<iframe
			{src}
			frameBorder="0"
			allowfullscreen
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			title="Conception song"
		/>
	</div>
{/if}

{#if src && glass}
	<!-- ── The readout, in the monitor, with the player under it ──────────── -->
	<div
		class="glass"
		in:fade={{ duration: IN.duration, delay: 250 }}
		style="left:{glass.left}px; top:{glass.top}px; width:{glass.width}px; height:{glass.height}px; --s:{s}; --title-lines:{shape.titleLines}; --artist-lines:{shape.artistLines}"
	>
		<div class="inner">
			<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
			<h2>{$track?.title ?? ''}</h2>
			<!-- Only when the card is NOT under it. The compact embed prints the
			     artist itself, in bigger type than this could manage, and a 240px
			     CRT does not have the height to say it twice. -->
			{#if !inGlass}
				<p class="artist">{$track?.artist ?? ''}</p>
			{/if}
			<p class="acc">{accuracy}% accuracy</p>
		</div>
		{#if inGlass}
			<!-- The card at its own size, shrunk by a transform. A transform does
			     not change layout size, so the holder carries the RENDERED height
			     and the iframe carries the LOGICAL one. -->
			<div class="deck fitted" style="height:{deckH}px">
				<div class="crt" style="width:{(logicalW * k).toFixed(1)}px; height:{deckH}px">
					<iframe
						{src}
						frameBorder="0"
						allowfullscreen
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						loading="lazy"
						title="Conception song"
						style="width:{logicalW}px; height:{PLAYER.height}px; transform:scale({k.toFixed(4)})"
					/>
				</div>
			</div>
		{/if}
		<button class="again" on:click={again}>go again</button>
	</div>
{:else if src}
	<div class="stage" in:fade={IN}>
		<div class="col card">
			<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
			<h2>{$track?.title ?? ''}</h2>
			<p class="artist">{$track?.artist ?? ''}</p>
			<p class="acc">{accuracy}% accuracy</p>
			<button class="again go" on:click={again}>go again</button>
		</div>
	</div>
{/if}

<style>
	/* ── The player, IN THE GLASS ─────────────────────────────────────────────
	   Spotify's card at its own size, shrunk by a transform to the width of the
	   monitor. It has to be done this way round: the embed is a cross-origin
	   iframe whose internal layout is computed against its own pixel box, so a
	   240px-wide iframe is not a small card, it is a clipped one with a
	   scrollbar. Give it 300x152 and scale the result.

	   A transform does not change layout size, so the holder carries the
	   RENDERED height (set inline) and the iframe carries the LOGICAL one.
	   `main` turns pointer-events off so the 3D shows through the UI layer, and
	   this is the one thing in the site that MUST take a click. */
	.deck.fitted {
		flex: 1 1 auto;
		overflow: hidden;
		pointer-events: auto;
		/* Centred both ways: capping the card at half the glass height can leave
		   it narrower than the monitor, and it now owns the slack between the
		   readout and the control. */
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* The holder that carries the RENDERED size. A transform does not change
	   layout size, so without this the flex row still sees a 300px-wide item in
	   a 240px box and cannot centre it — the card sat hard against the left
	   edge of every monitor. */
	.crt {
		position: relative;
		overflow: hidden;
		flex: 0 0 auto;
	}
	.deck.fitted iframe {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		border: 0;
		transform-origin: top left;
		pointer-events: auto;
	}

	/* ── And when the monitor is too small to hold one ────────────────────────
	   Under PLAYER.minGlass the scale would put the play control below a usable
	   target, so the card leaves the monitor and goes to the edge of the screen
	   at full size instead. Landscape, top left. Upright, the BOTTOM: the top of
	   a portrait frame is the room's wall — the posters, the clock, the half of
	   the picture that says which decade you are in — and the bottom is the desk
	   and the bed, and where the thumb already is. */
	.deck.loose {
		position: fixed;
		top: max(2.2vh, 16px);
		left: max(2.2vw, 16px);
		z-index: 10;
		width: min(380px, calc(100vw - 32px));
		height: 152px;
		border: 1px solid rgba(255, 212, 38, 0.24);
		border-radius: 13px;
		overflow: hidden;
		background: #0b0b0d;
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
		pointer-events: auto;
	}
	.deck.loose iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		pointer-events: auto;
	}
	@media (orientation: portrait) {
		.deck.loose {
			top: auto;
			bottom: max(2.2vh, 16px);
			left: max(2.2vw, 16px);
			right: max(2.2vw, 16px);
			width: auto;
			box-shadow: 0 -14px 44px rgba(0, 0, 0, 0.4);
		}
	}

	/* The monitor's glass. Sits exactly where the scene says the screen is, and
	   stacks the readout over the player. */
	.glass {
		position: fixed;
		z-index: 10;
		background: #0b0b0d;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		pointer-events: auto;
	}

	/* ── THREE ROWS, AND THE CARD TAKES THE MIDDLE ───────────────────────────
	   The readout is what you read first, so it is at the top and only as tall
	   as its own type. The control is what you do last, so it is at the foot.
	   The player gets everything between and centres in it — which is where the
	   eye goes on a screen, and it was at the bottom fighting the control. */
	.inner {
		flex: 0 0 auto;
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding: calc(10px * var(--s)) calc(12px * var(--s));
		font-size: calc(1em * var(--s));
		pointer-events: auto;
	}

	.when {
		font-size: calc(10px * var(--s));
		color: var(--ink-dim);
		margin: 0 0 calc(4px * var(--s));
	}

	h2 {
		font-size: calc(21px * var(--s));
		font-weight: 700;
		line-height: 1.05;
		color: var(--yellow);
		margin: 0 0 calc(4px * var(--s));
		/* Long titles must not push the control out of the glass. A narrow screen
		   is allowed more lines — that is what buys it bigger type. */
		display: -webkit-box;
		line-clamp: var(--title-lines);
		-webkit-line-clamp: var(--title-lines);
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.artist {
		font-size: calc(13px * var(--s));
		color: var(--ink);
		margin: 0;
		display: -webkit-box;
		line-clamp: var(--artist-lines);
		-webkit-line-clamp: var(--artist-lines);
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.acc {
		font-size: calc(10px * var(--s));
		color: var(--yellow);
		margin: calc(9px * var(--s)) 0 0;
	}

	/* ── The one control, ON the screen ──────────────────────────────────────
	   A line of the readout rather than a button parked under the desk: this is
	   a machine's screen and the last line of a machine's screen is what it
	   wants you to do next. Sized in panel units with the rest of the type, but
	   its HIT AREA is not — a 90s CRT lands about 230px across and 0.8 of 11px
	   is a nine-pixel tap target, so the row keeps a real minimum height however
	   far the type scales down — capped against the glass as well, because on a
	   phone that glass can be under a hundred pixels tall and a fixed floor there
	   is a fifth of the screen spent on one row. */
	/* ── The one control, and it has to LOOK like one ────────────────────────
	   It was a line of the readout with a hairline under it, which reads as the
	   last line of the readout, which is what it was. A machine's screen ends
	   in a softkey: a filled bar in the machine's own yellow, across the foot of
	   the glass, in the one colour on the screen that nothing else uses as a
	   ground. Nobody has to work out that it is pressable.

	   It is the ONLY thing in the glass sized in real pixels rather than in
	   panel units. Everything else scales with the monitor; a tap target that
	   scales with the monitor is a 9px tap target on a 90s CRT. */
	.again {
		flex: 0 0 auto;
		/* Pinned to the foot whatever is above it — including nothing, when the
		   monitor is too small to hold the card and the player has gone outside. */
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 30px;
		padding: 6px 10px;
		font: inherit;
		font-size: clamp(9px, calc(11px * var(--s)), 13px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--on-yellow);
		background: var(--yellow);
		border: 0;
		border-radius: 0;
		cursor: pointer;
		pointer-events: auto;
		transition: filter 0.18s;
	}
	.again:hover {
		filter: brightness(1.12);
	}
	.again:focus-visible {
		outline: 2px solid var(--yellow);
		outline-offset: -4px;
	}

	/* Fallback card, when the room art could not be measured. */
	.card .when {
		font-size: 13px;
	}
	.card h2 {
		font-size: clamp(24px, 3.2vw, 34px);
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.card .artist {
		font-size: 17px;
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}
	.card .acc {
		font-size: 13px;
		margin-bottom: 16px;
	}
	.card .again {
		font-size: 11px;
	}
</style>
