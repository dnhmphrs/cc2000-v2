<script>
	import { landing, gate } from '$lib/store/store';
	import { DEV_AT } from '$lib/config';

	// ── The glass ────────────────────────────────────────────────────────────
	// Scanlines over the whole site, for the whole run — and then out.
	//
	// They used to be gated to the three 3D scenes, on the reasoning that a CRT
	// under a second pitch is a moiré and that the bedroom is a room photographed
	// on nothing. The first half of that went with the calculator. The second was
	// backwards: the raster is the screen the whole thing is being WATCHED on,
	// not a layer inside any one scene, so switching it off between scenes was
	// the site stepping out of its own frame twice a run.
	//
	// But it does come off at the END, and it comes off ON the fall. The last
	// thing the run does is stop being a screen and become a place; the raster
	// riding the zoom out is that happening rather than being announced. See the
	// `landing` store, which the computation writes across its final zoom.
	//
	// ── TWO SHEETS, AND WHICH WAY EACH ONE BLENDS ────────────────────────────
	// The raster alone is flat, because a tube does two opposite things at once:
	// the mask TAKES light away in stripes and the phosphor PUTS it back in
	// colour. One element cannot do both — src-over can only darken toward its
	// own ink — so there are two.
	//
	//   .raster    normal blend. The scanlines and the tube's vignette, stacked
	//              as two background layers on ONE element so they flatten into
	//              one texture at raster time. Subtractive: it is the mask.
	//   .phosphor  mix-blend-mode: screen. The grille and the band. Additive,
	//              and additive is not a preference — the whole site is thin 1px
	//              gold line-work drawn additively on near-black, and screen is
	//              the only blend that cannot take a level off it. Screen also
	//              saturates as the backdrop brightens, so everything on this
	//              sheet lives in the blacks and leaves the drawing alone.
	//
	// They are SIBLINGS with their own opacity rather than children of one faded
	// wrapper, and that is load-bearing: opacity below 1 creates a stacking
	// context, a stacking context isolates the group inside it, and an isolated
	// mix-blend-mode: screen has nothing but transparent black to blend with —
	// the phosphor would simply stop working the moment the landing started.
	// Opacity on the blending element itself is fine; opacity on an ancestor
	// of it is not.

	// ── The band, and the two ways it gets parked ────────────────────────────
	// It is the only thing in this site that moves on a clock of its own, and
	// two things have to be able to stop it dead.
	//
	// A ?at= SEEK, because a contact sheet has to be reproducible. Every 3D
	// scene is a pure function of its progress and the whole review method rests
	// on that — including the pixel diff that checks flyIn at 1 against
	// conception at 0. A band drifting across those two frames would put a
	// difference between them that has nothing to do with either scene. Pinned,
	// it parks below the fold, so a seeked frame carries the raster, the tube
	// and the grille — all three static, all three still measurable — and no
	// band at all.
	const pinned = DEV_AT != null;

	// And a GATE, because the band is the one part of the treatment bright
	// enough to cost contrast. Its hot edge adds about 13 levels by screen, and
	// the popup panel's ink is specified against a measured ground in
	// styles.css — the floor is AA with slack, not with 13 levels of slack. The
	// two popups and the title card are the only text in the run, so the band
	// is off whenever one of them is up. It is also the right picture: the
	// flight is HELD while a gate is open, and a tape artefact rolling over a
	// held frame would say the deck is still running when it is not.
	$: veil = (1 - $landing).toFixed(3);
</script>

<div class="raster" style="opacity:{veil}" />
<div class="phosphor" class:pinned style="opacity:{veil}">
	<div class="band" style="opacity:{$gate ? 0 : 1}" />
</div>

<style>
	.raster,
	.phosphor {
		position: fixed;
		inset: 0;
		pointer-events: none;
		/* Over everything, including the flash: they are the screen this is being
		   watched on, not a layer inside the scene. */
		z-index: 30;
	}

	.raster {
		/* Two layers, one element, one texture. The scanlines sit over the
		   vignette; both are translucent and composited src-over, so the order
		   only decides which ink the other one is drawn through. */
		background: var(--scanlines), var(--tube);
	}

	.phosphor {
		background: var(--grille-r), var(--grille-g), var(--grille-b);
		mix-blend-mode: screen;
	}

	.band {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 46vh;
		background: var(--band);
		/* Promoted, so the roll below is a compositor transform and never a
		   repaint of a full-viewport layer. */
		will-change: transform;
		transform: translate3d(0, 100vh, 0);
		animation: roll 26s linear infinite;
		transition: opacity 0.6s linear;
	}

	/* Sweeps for the first sixteen seconds and then rests below the fold for
	   ten, so the tracking drifts every so often rather than a bar living on
	   the screen permanently. The travel is 146vh — the band's own height plus
	   the viewport — which is what keeps its soft top edge off screen at the
	   start of the sweep instead of fading up in the middle of the picture. */
	@keyframes roll {
		0% {
			transform: translate3d(0, -46vh, 0);
		}
		62% {
			transform: translate3d(0, 100vh, 0);
		}
		100% {
			transform: translate3d(0, 100vh, 0);
		}
	}

	/* Parked below the fold, both ways. The band IS motion — there is no still
	   version of a head-switching artefact to fall back to — so what is left
	   when it stops is the rest of the treatment, which is entirely static. */
	.pinned .band {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.band {
			animation: none;
			transition: none;
		}
	}
</style>
