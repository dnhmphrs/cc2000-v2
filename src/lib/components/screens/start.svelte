<script>
	import { onMount } from 'svelte';
	import { page } from '$lib/store/store';

	let text = "in the earth year 2000, human technology advanced\nallowing all of mankind to calculate the song playing at their exact moment of conception\nwith the statistical accuracy that only the Internet can provide.";
	let words = text.split(' '); // Split the text into words
	let displayedText = ""; // This will hold the text as it's being revealed
	let wordIndex = 0;

	// Random delay generator for jittery effect
	function getRandomDelay() {
		return Math.random() * 100 + 50; // Random delay between 50ms and 100ms
	}

	// Random chunk size generator
	function getRandomChunkSize() {
		return Math.floor(Math.random() * 3) + 1; // Random chunk size between 1 and 3 words
	}

	let handleProgress = () => {
		page.set(2);
	};

	function typeText() {
		if (wordIndex < words.length) {
			let chunkSize = getRandomChunkSize();
			let chunk = words.slice(wordIndex, wordIndex + chunkSize).join(' ') + ' '; // Join chunk into a single string
			displayedText += chunk;
			wordIndex += chunkSize; // Move index forward by the chunk size
			setTimeout(typeText, getRandomDelay()); // Random delay before the next chunk
		}
	}

	// Start the typing effect when the component is mounted
	onMount(() => {
		typeText();
	});
</script>

<div class="text">
	<p on:click={() => handleProgress()} on:keydown={() => handleProgress()}>
		{displayedText}
	</p>
</div>

<section>
	<div class="calculate" on:click={() => handleProgress()}  on:keydown={() => handleProgress()}>
		<h4>Process Biometrics</h4>
	</div>
</section>

<style>
	.text {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw; /* Full width */
		height: 100dvh; /* Full height */
		display: flex;
		align-items: flex-start; /* Align text to the top */
		justify-content: flex-start; /* Align text to the left */
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
		animation: fadein .5s 2s ease-out;
		animation-fill-mode: forwards;
	}

	.calculate {
		margin: 0; /* Remove any default margin */
		padding: 0 1rem; /* Add some padding */
		background: var(--black);
		color: var(--white);
		white-space: pre-wrap; /* Ensure line breaks are respected */
		cursor: pointer;
		background: #232323;
		border: solid 1px var(--white);
	}

	p {
		margin: 0; /* Remove any default margin */
		padding: 1rem; /* Add some padding */
		background: var(--black);
		color: var(--white);
		white-space: pre-wrap; /* Ensure line breaks are respected */
		cursor: pointer;
		background: #232323;
	}
</style>
