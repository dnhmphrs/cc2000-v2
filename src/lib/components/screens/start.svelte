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

<section class="terminal-window">
	<!-- <div class="terminal-header">
		<div class="terminal-buttons">
			<div class="button red"></div>
			<div class="button yellow"></div>
			<div class="button green"></div>
		</div>
		<div class="terminal-title">CONCEPTION CALCULATOR 2000 v2.0</div>
	</div> -->
	
	<div class="terminal-content">
		<!-- <div class="progress-bar">
			<div class="progress-step active">1</div>
			<div class="progress-line"></div>
			<div class="progress-step">2</div>
			<div class="progress-line"></div>
			<div class="progress-step">3</div>
		</div> -->
		
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
	</div>
</section>

<style>
	.terminal-window {
		width: 100%;
		height: 80%;
		background: transparent;
		/* border: 2px solid #00ff00; */
		transform: translateY(-10px);
		border-radius: 8px;

		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;
	}

	/* .terminal-header {
		background: #00ff00;
		color: #000;
		padding: 8px 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 12px;
	}

	.terminal-buttons {
		display: flex;
		gap: 6px;
	}

	.button {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid #000;
	}

	.button.red { background: #ff5f56; }
	.button.yellow { background: #ffbd2e; }
	.button.green { background: #27ca3f; }

	.terminal-title {
		font-size: 11px;
		letter-spacing: 1px;
	} */

	.terminal-content {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.progress-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	/* .progress-step {
		width: 30px;
		height: 30px;
		border: 2px solid #00ff00;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: #00ff00;
		background: transparent;
	}

	.progress-step.active {
		background: #00ff00;
		color: #000;
		animation: pulse 2s infinite;
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: #00ff00;
	} */

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
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
		color: #00ff00;
		font-size: 16px;
		line-height: 1;
		white-space: pre-wrap;
		text-shadow: 0 0 5px #00ff00;
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
		background: transparent;
		border: 2px solid #00ff00;
		color: #00ff00;
		padding: 15px 30px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		opacity: 0;
		animation: fadein .5s 3s ease-out;
		animation-fill-mode: forwards;
	}

	.terminal-btn:hover {
		background: #00ff00;
		color: #000;
		box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
		transform: scale(1.05);
	}

	.btn-text {
		display: block;
	}

	@keyframes fadein {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (max-width: 600px) {
		.terminal-content {
			padding: 15px;
		}
		
		.typing-text {
			font-size: 14px;
		}
		
		.terminal-btn {
			padding: 12px 20px;
			font-size: 14px;
		}
	}
</style>
