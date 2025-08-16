<script>
	import { onMount } from 'svelte';
	import { page } from '$lib/store/store';

	let text = "In the earth year 2000, human technology advanced...\n\nallowing all of mankind to calculate the song playing at their exact moment of conception with the statistical accuracy that only the Internet can provide.";
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

<div class="fullscreen-bg"></div>

<div class="text-container">
	<div class="typing-text">
		{displayedText}<span class="cursor">█</span>
	</div>
</div>

<div class="button-container">
	<button class="terminal-btn start-btn" on:click={handleProgress}>
		<span class="btn-text">[ENTER] PROCESS BIOMETRICS</span>
	</button>
</div>

<style>
	.fullscreen-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
	}

	.text-container {
		flex: 1;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		width: 100%;
		max-width: 500px;
		margin: 20px 0;
	}

	.typing-text {
		color: #000080;
		font-size: 18px;
		font-weight: bold;
		line-height: 1.2;
		white-space: pre-wrap;
		letter-spacing: 1px;
	}

	.cursor {
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	.button-container {
		margin-top: 20px;
	}

	.terminal-btn {
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		color: #000000;
		padding: 15px 30px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.1s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		opacity: 0;
		animation: fadein .5s 3s ease-out;
		animation-fill-mode: forwards;
	}

	.terminal-btn:hover {
		background: #d4d4d4;
		border: 2px inset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
	}

	.terminal-btn:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.btn-text {
		display: block;
	}

	@keyframes fadein {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (max-width: 600px) {
		.typing-text {
			font-size: 14px;
		}
		
		.terminal-btn {
			padding: 12px 20px;
			font-size: 14px;
		}
	}
</style>
