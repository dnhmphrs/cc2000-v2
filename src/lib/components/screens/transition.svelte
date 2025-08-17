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

<div class="screen-container">
	<ProgressBar currentStep={3} totalSteps={3} />
	
	<div class="content-area">
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
	</div>
</div>

<style>
	.screen-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}

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
		font-size: 16px;
		margin-bottom: 15px;
		text-shadow: none;
		letter-spacing: 1px;
		font-weight: normal;
	}

	.status-text {
		color: #000000;
		font-size: 14px;
		opacity: 0.8;
		letter-spacing: 1px;
		font-weight: normal;
	}

	.button-container {
		margin-top: 0;
	}

	.terminal-btn {
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
		border: 1px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		color: #2d5aa0;
		padding: 12px 24px;
		font-family: 'Courier New', monospace;
		font-size: 13px;
		font-weight: normal;
		cursor: pointer;
		transition: all 0.1s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		border-radius: 3px;
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
	}

	.terminal-btn:hover {
		background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
		border: 1px inset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		transform: translateY(-1px);
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
	}

	.terminal-btn:active {
		background: linear-gradient(135deg, #cce7ff 0%, #b3dbff 100%);
		border: 1px inset #4a90e2;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		transform: translateY(0);
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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
