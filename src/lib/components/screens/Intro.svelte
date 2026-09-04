<script>
	import { phase } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 0/1. The site opens on the sperm swimming onto the screen — the scene
	// does that — and the copy arrives after it, briefly. Not a boot log: three
	// lines, shown at once, out of the way of the animation.
	function start() {
		phase.set('calculate');
	}
</script>

<!-- Sits behind the 3D canvas (z-index 1), so the sperm swims over it. -->
<div class="grid" out:fade={{ duration: 220 }} />

<div class="stage intro-stage" out:fade={{ duration: 220 }}>
	<div class="plate" in:fade={{ duration: 800, delay: 1600 }}>
		<p class="model">model cc-2000</p>
		<h1>Conception Calculator</h1>
		<p class="manifesto">
			in the earth year 2000, human technology advanced<br />
			allowing all of mankind to calculate the song playing<br />
			at their exact moment of conception<br />
			<span class="lit">with the statistical accuracy only the internet can provide</span>
		</p>
		<button class="go" on:click={start}>calculate</button>
	</div>
</div>

<style>
	/* Graph paper on the blue. Two scales — a fine rule and a heavier one every
	   fifth line — masked out of the middle so the sperm swims through clean
	   space and the texture lives at the edges. */
	.grid {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background-image: linear-gradient(rgba(var(--ink-rgb), 0.055) 1px, transparent 1px),
			linear-gradient(90deg, rgba(var(--ink-rgb), 0.055) 1px, transparent 1px),
			linear-gradient(rgba(var(--ink-rgb), 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(var(--ink-rgb), 0.1) 1px, transparent 1px);
		background-size: 34px 34px, 34px 34px, 170px 170px, 170px 170px;
		-webkit-mask-image: radial-gradient(
			ellipse 62% 58% at 50% 46%,
			transparent 0%,
			rgba(0, 0, 0, 0.55) 55%,
			#000 100%
		);
		mask-image: radial-gradient(
			ellipse 62% 58% at 50% 46%,
			transparent 0%,
			rgba(0, 0, 0, 0.55) 55%,
			#000 100%
		);
	}

	/* The sperm owns the middle of the screen, so the copy sits out of its way
	   rather than on top of it. */
	.intro-stage {
		align-items: flex-end;
		justify-content: flex-start;
		padding: clamp(24px, 6vh, 64px) clamp(24px, 5vw, 72px);
	}

	.plate {
		width: 100%;
		max-width: 560px;
		pointer-events: auto;
	}

	.model {
		font-size: 11px;
		letter-spacing: 0.3em;
		color: var(--ink-dim);
		margin: 0 0 8px;
	}

	h1 {
		font-size: clamp(26px, 4vw, 44px);
		font-weight: 700;
		line-height: 1;
		margin: 0 0 18px;
		color: var(--ink);
	}

	.manifesto {
		font-size: clamp(13px, 1.4vw, 16px);
		line-height: 1.5;
		color: var(--ink-dim);
		margin: 0 0 clamp(20px, 3.5vh, 34px);
	}

	.manifesto .lit {
		color: var(--yellow);
	}

	button {
		padding: 14px 34px;
		font-size: 15px;
	}

	@media (max-width: 620px) {
		.manifesto br {
			display: none;
		}
	}
</style>
