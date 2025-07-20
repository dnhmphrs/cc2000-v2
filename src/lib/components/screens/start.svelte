<script>
	import { onMount } from 'svelte';
	import { page } from '$lib/store/store';

	let text = "In the earth year 2000, human technology advanced...\n\nallowing all of mankind to calculate the song playing at their exact moment of conception with the statistical accuracy that only the Internet can provide. \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n\\\\ ... \n ... \n ...";
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

<div class="terminal-container">
	<div class="terminal-header">
		<span class="terminal-title">CC2000 : Conception Calculator 2000</span>
		<!-- <div class="terminal-controls">
			<span class="control minimize">_</span>
			<span class="control maximize">□</span>
			<span class="control close">×</span>
		</div> -->
	</div>
	
	<div class="terminal-body">
		<div class="text">
			<p on:click={() => handleProgress()} on:keydown={() => handleProgress()}>
				{displayedText}<span class="cursor">█</span>
			</p>
		</div>

		<section>
			<div class="calculate" on:click={() => handleProgress()}  on:keydown={() => handleProgress()}>
				<p>Process Biometrics</p>
			</div>
		</section>
	</div>
</div>

<style>
	.terminal-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, calc(-50% - 70px));
		width: 90vw;
		max-width: 525px;
		height: 462px;
		background: transparent;
		/* border: 2px solid #0b0b0b;
		border-radius: 8px; */
		/* box-shadow: 
			0 0 20px #2b2b2b,
			inset 0 0 20px rgba(0, 255, 0, 0.1); */
		font-family: 'Courier New', monospace;
		overflow: hidden;
	}

	.terminal-header {
		/* background: #0b0b0b; */
		color: #f0f0f0;
		padding: 8px 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		border-bottom: 1px solid #f0f0f0;
		border-radius: 8px;
	}

	.terminal-title {
		/* font-family: 'Courier New', monospace; */
		/* font-weight: 700; */
		text-transform: uppercase;
		color: #f0f0f0;
	}

	/* .terminal-controls {
		display: flex;
		gap: 8px;
	}

	.control {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #000;
		border-radius: 2px;
		font-size: 12px;
		cursor: pointer;
		background: #fff;
	}

	.control:hover {
		background: #ddd;
	} */

	.terminal-body {
		height: calc(100% - 40px);
		/* background: #0b0b0b; */
		color: #f0f0f0;
		padding: 20px;
		position: relative;
		overflow: hidden;
	}

	.text {
		position: relative;
		width: 100%;
		height: 60%;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.text p {
		margin: 0;
		padding: 0;
		background: var(--red);
		white-space: pre-wrap;
		cursor: pointer;
		font-size: 16px;
		/* font-weight: 700; */
		line-height: 1.4;
	}

	.cursor {
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	section {
		position: relative;
		height: 30%;
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		background: transparent;
		color: #f0f0f0;
		padding: 2rem;
		opacity: 0;
		animation: fadein .5s 3s ease-out;
		animation-fill-mode: forwards;
	}

	.calculate {
		margin: 0;
		padding: 0 1rem;
		background: #f0f0f0;
		color: #2b2b2b;
		white-space: pre-wrap;
		cursor: pointer;
		border: 1px solid #f0f0f0;
		border-radius: 8px;
		transition: all 0.3s ease;
	}

	.calculate:hover {
		background: #0b0b0b;
		color: #f0f0f0;
	}

	.calculate p {
		margin: 0;
		padding: 0.5rem;
		color: inherit;
		white-space: pre-wrap;
		cursor: pointer;
		font-family: 'Courier New', monospace;
		/* font-weight: bold; */
	}

	@keyframes fadein {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
