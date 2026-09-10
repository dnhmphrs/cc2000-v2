<script>
	import { fade } from 'svelte/transition';
	import { track, conceived, decade, monitorRect } from '$lib/store/store';
	import { SCENES, RESULT_PANEL, panelFit } from '$lib/config';
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

	// Everything in the glass is sized in these units, so type, control and
	// padding all scale together with the monitor.
	$: fit = $monitorRect ? panelFit($decade, $monitorRect.width, $monitorRect.height) : null;
	$: s = fit ? fit.scale : 1;
	$: shape = fit ? fit.shape : RESULT_PANEL.shapes[0];

	const IN = { duration: SCENES.room.resultIn * 1000 };
</script>

{#if src}
	<!-- ── The player, out of the monitor and into the corner ─────────────── -->
	<div class="deck" in:fade={{ duration: IN.duration, delay: 450 }}>
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

{#if src && $monitorRect}
	<!-- ── The readout, in the monitor ────────────────────────────────────── -->
	<div
		class="glass"
		in:fade={{ duration: IN.duration, delay: 250 }}
		style="left:{$monitorRect.left}px; top:{$monitorRect.top}px; width:{$monitorRect.width}px; height:{$monitorRect.height}px; --s:{s}; --title-lines:{shape.titleLines}; --artist-lines:{shape.artistLines}"
	>
		<div class="inner">
			<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
			<h2>{$track?.title ?? ''}</h2>
			<p class="artist">{$track?.artist ?? ''}</p>
			<p class="acc">{accuracy}% accuracy</p>
			<button class="again" on:click={again}>another conception</button>
		</div>
	</div>
{:else if src}
	<div class="stage" in:fade={IN}>
		<div class="col card">
			<p class="when">{$conceived ? `roughly ${formatDay($conceived)}` : ''}</p>
			<h2>{$track?.title ?? ''}</h2>
			<p class="artist">{$track?.artist ?? ''}</p>
			<p class="acc">{accuracy}% accuracy</p>
			<button class="again go" on:click={again}>another conception</button>
		</div>
	</div>
{/if}

<style>
	/* ── The player ───────────────────────────────────────────────────────────
	   Top left, at the size Spotify drew it, in a hairline of the site's own so
	   it reads as bolted to this page rather than dropped on it. `main` turns
	   pointer-events off so the 3D can be seen through the UI layer, and this is
	   the one thing in the site that MUST take a click, so it opts back in all
	   the way down. */
	.deck {
		position: fixed;
		top: max(2.2vh, 16px);
		left: max(2.2vw, 16px);
		z-index: 10;
		width: min(380px, calc(100vw - 32px));
		/* Spotify's compact card. Below this the embed draws its own scrollbar;
		   above it there is nothing more to draw. */
		height: 152px;
		border: 1px solid rgba(255, 212, 38, 0.24);
		border-radius: 13px;
		overflow: hidden;
		background: #0b0b0d;
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
		pointer-events: auto;
	}

	/* ── And on a phone it goes to the BOTTOM ─────────────────────────────────
	   Same panel, other end. Upright, the top of the frame is where the room's
	   wall is — the posters, the clock, the thing the decade is legible from —
	   and a card parked over it covers the half of the picture that says which
	   decade you are in. The bottom is the desk and the bed, and it is where
	   the thumb already is. Full width less the gutter, because at 414px a
	   380px card floating off one corner reads as debris. */
	@media (orientation: portrait) {
		.deck {
			top: auto;
			bottom: max(2.2vh, 16px);
			left: max(2.2vw, 16px);
			right: max(2.2vw, 16px);
			width: auto;
			box-shadow: 0 -14px 44px rgba(0, 0, 0, 0.4);
		}
	}

	/* The embed is an iframe, and an iframe with no size is 300x150 whatever box
	   you put it in. */
	.deck iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		pointer-events: auto;
	}

	/* The monitor's glass. Sits exactly where the scene says the screen is. */
	.glass {
		position: fixed;
		z-index: 10;
		background: #0b0b0d;
		overflow: hidden;
		display: flex;
		pointer-events: auto;
	}

	/* Fills the glass rather than sitting in a band across the middle of it. */
	.inner {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
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
	.again {
		align-self: flex-start;
		display: flex;
		align-items: center;
		min-height: min(30px, 20%);
		margin: calc(6px * var(--s)) 0 0;
		padding: 0;
		font: inherit;
		font-size: calc(11px * var(--s));
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--yellow);
		background: transparent;
		border: 0;
		border-bottom: 1px solid rgba(255, 212, 38, 0.42);
		border-radius: 0;
		cursor: pointer;
		pointer-events: auto;
		transition: border-color 0.18s, opacity 0.18s;
	}
	.again::before {
		content: '> ';
		opacity: 0.6;
	}
	.again:hover {
		border-bottom-color: var(--yellow);
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
