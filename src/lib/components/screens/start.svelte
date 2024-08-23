<script>
	import { onMount } from 'svelte'; // Ensure you import onMount

	import { page } from '$lib/store/store';

	let text = "in the earth year 2000, human technology advanced \n allowing all of mankind to calculate the song\nplaying at their exact moment of conception \n with the statistical accuracy only the Internet can provide.";
	let displayedText = ""; // This will hold the text as it's being revealed
	let charIndex = 0;
	const delay = 50; // Adjust the delay for faster or slower typing effect

	let handleProgress = () => {
		page.set(2);
	};

	function typeText() {
		if (charIndex < text.length) {
			displayedText += text[charIndex];
			charIndex++;
			setTimeout(typeText, delay);
		}
	}

	// Start the typing effect when the component is mounted
	onMount(() => {
		typeText();
	});
</script>

<section>
	<p on:click={() => handleProgress()} on:keydown={() => handleProgress()} tabindex="0">
		{displayedText}
	</p>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		display: flex;
	}

	p {
		text-align: center;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 0.5rem 1rem;

		background: var(--true-black);
		color: var(--white);
		/* border: solid 1px var(--pink); */

		cursor: pointer;
		white-space: pre-wrap; /* Ensure line breaks are respected */
	}

	h3:hover {
		border-color: var(--pink);
		color: var(--pink);
	}
</style>
