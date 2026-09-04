<script>
	import { phase } from '$lib/store/store';

	// The front half of the site is inside the fallopian tube: warm, fluid, lit
	// from somewhere up ahead. It is a wash rather than a picture — the depth
	// comes from the motes streaming past in the 3D layer above this.
	//
	// It fades out the moment the dive starts, handing the page over to the cold
	// blue of the machine for the search.
	$: warm = $phase === 'intro';
</script>

<div class="canal" class:warm>
	<div class="pulse" />
</div>

<style>
	.canal {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 1.4s ease;
		background: radial-gradient(
			ellipse 78% 68% at 50% 44%,
			#ff9fb4 0%,
			#e85f86 26%,
			#a82552 56%,
			#4d0f2c 84%,
			#2a0719 100%
		);
	}

	.canal.warm {
		opacity: 1;
	}

	/* A slow swell, so the walls feel like they are breathing rather than
	   painted on. */
	.pulse {
		position: absolute;
		inset: -10%;
		background: radial-gradient(
			ellipse 46% 40% at 50% 46%,
			rgba(255, 220, 228, 0.5) 0%,
			rgba(255, 160, 185, 0.16) 42%,
			transparent 72%
		);
		animation: swell 9s ease-in-out infinite;
	}

	@keyframes swell {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.75;
		}
		50% {
			transform: scale(1.14);
			opacity: 1;
		}
	}
</style>
