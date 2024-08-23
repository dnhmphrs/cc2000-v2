<script>
	import { page, track } from '$lib/store/store';

	let uri = $track.spotify_uri.substring(14);
	console.log(uri);
	let src = `https://open.spotify.com/embed/track/${uri}?utm_source=generator`;

	let handleProgress = () => {
		// page.set(1);#
		window.location.reload();
	};
</script>

<img class="background" src="90s_Illustration.jpg" alt="90s illustration" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; border-radius: 12px;"/>

<section>
	<!-- svelte-ignore a11y-missing-attribute -->
	<iframe
		style="border-radius:12px"
		{src}
		frameBorder="0"
		allowfullscreen=""
		allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		loading="lazy"
	/>
	<h4 on:click={() => handleProgress()} on:keydown={() => handleProgress()}>Restart.</h4>
</section>

<style>
	.background {
		opacity: 0;
		animation: fadein 1s 1s ease-out;
		animation-fill-mode: forwards;
	}
	section {
		position: relative;
		/* width: 100%; */
		height: 80%;
		display: flex;
		flex-flow: row wrap;

		justify-content: space-around;
		align-items: center;

		background: none;
		color: var(--black);

		padding: 2rem;
		transform: translateY(-10%);

		opacity: 0;
		animation: fadein 1s 1s ease-out;
		animation-fill-mode: forwards;
	}

	iframe {
		/* height: 100%; */
		width: 100%;
	}

	h4 {
		text-align: center;
		flex-shrink: 1;
		padding: 0.5rem 1rem;

		background: var(--true-black);
		color: var(--white);
		border: solid 1px var(--pink);

		cursor: pointer;
	}

	h4:hover {
		border-color: var(--pink);
		color: var(--pink);
	}
</style>
