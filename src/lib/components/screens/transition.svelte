<script>
	import { page } from '$lib/store/store';
	import { onMount } from 'svelte';
	import ProgressBar from '$lib/components/progress-bar.svelte';

	let handleProgress = () => {
		page.set(4);
	};

	onMount(() => {
		// Automatically transition to output after 3 seconds
		setTimeout(() => {
			page.set(4);
		}, 3000);
	});
</script>

<ProgressBar currentStep={3} totalSteps={3} />

<div class="transition-container">
	<div class="loading-text">
		<span class="loading-dot">.</span>
		<span class="loading-dot">.</span>
		<span class="loading-dot">.</span>
	</div>
	<h2 class="terminal-text">PROCESSING BIOMETRIC DATA</h2>
	<p class="status-text">Calculating conception coordinates...</p>
</div>

<div class="button-container">
	<button class="terminal-btn continue-btn" on:click={handleProgress}>
		<span class="btn-text">[ENTER] CONTINUE</span>
	</button>
</div>

<style>
	.transition-container {
		text-align: center;
	}

	.loading-text {
		margin-bottom: 20px;
	}

	.loading-dot {
		color: #000000;
		font-size: 24px;
		font-weight: bold;
		animation: loading 1.5s infinite;
	}

	.loading-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.loading-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes loading {
		0%, 60%, 100% { opacity: 0.3; }
		30% { opacity: 1; }
	}

	.terminal-text {
		color: #000000;
		font-size: 18px;
		margin-bottom: 15px;
		text-shadow: none;
		letter-spacing: 2px;
	}

	.status-text {
		color: #000000;
		font-size: 14px;
		opacity: 0.8;
		letter-spacing: 1px;
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

	@media (max-width: 600px) {
		.terminal-text {
			font-size: 16px;
		}
		
		.status-text {
			font-size: 12px;
		}
		
		.terminal-btn {
			padding: 12px 20px;
			font-size: 14px;
		}
	}
</style>
