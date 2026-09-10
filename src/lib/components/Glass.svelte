<script>
	import { landing } from '$lib/store/store';

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
	//   .phosphor  mix-blend-mode: screen. The grille. Additive,
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

	// NO ROLLING BAND. A head-switching bar sweeping down the frame was tried
	// and it is the one part of a tape artefact that cannot be subtle: it is a
	// moving brightness step, the eye is built to find exactly that, and on a
	// screen whose whole subject is a slow approach it reads as a fault in the
	// page rather than as a texture on it. What is left is all static — the
	// raster, the tube and the grille — which also means the treatment costs
	// nothing per frame and cannot drift across a contact sheet.
	$: veil = (1 - $landing).toFixed(3);
</script>

<div class="raster" style="opacity:{veil}" />
<div class="phosphor" style="opacity:{veil}" />

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
</style>
