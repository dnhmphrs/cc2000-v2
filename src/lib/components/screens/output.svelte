<script>
	import { page, track } from '$lib/store/store';

	let uri = $track.spotify_uri.substring(14);
	console.log(uri);
	let src = `https://open.spotify.com/embed/track/${uri}?utm_source=generator`;

	let handleProgress = () => {
		page.set(1);
	};
</script>

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
	<h4 on:click={() => handleProgress()} on:keydown={() => handleProgress()}>Output. Whatevs.</h4>
</section>

<style>
	section {
		position: relative;
		/* width: 100%; */
		height: 100%;
		display: flex;
		flex-flow: row wrap;

		justify-content: space-around;
		align-items: center;

		background: var(--true-black);
		color: var(--white);
		border: solid 1px var(--pink);

		padding: 2rem;
		transform: translateY(-10%);
	}

	iframe {
		height: 60%;
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
