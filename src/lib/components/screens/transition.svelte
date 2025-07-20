<script>
	import { page } from '$lib/store/store';
	import { onMount } from 'svelte';

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

<section class="terminal-window">
	<div class="terminal-header">
		<!-- <div class="terminal-buttons">
			<div class="button red"></div>
			<div class="button yellow"></div>
			<div class="button green"></div>
		</div> -->
		<div class="terminal-title">CC2000 : CONCEPTION CALCULATOR 2000</div>
	</div>
	
	<div class="terminal-content">
		<div class="progress-bar">
			<div class="progress-step completed">1</div>
			<div class="progress-line"></div>
			<div class="progress-step completed">2</div>
			<div class="progress-line"></div>
			<div class="progress-step completed">3</div>
		</div>
		
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
</section>

<style>
	.terminal-window {
		width: 100%;
		height: 100%;
		/* background: #000; */
		border: 2px solid var(--white);
		border-radius: 8px;
		/* box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); */
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;
	}

	.terminal-header {
		background: var(--white);
		color: #000;
		padding: 8px 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 12px;
	}

	/* .terminal-buttons {
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
	.button.green { background: #27ca3f; } */

	.terminal-title {
		font-size: 11px;
		letter-spacing: 1px;
	}

	.terminal-content {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 30px;
	}

	.progress-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.progress-step {
		width: 30px;
		height: 30px;
		border: 2px solid var(--white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: var(--white);
		background: transparent;
	}

	.progress-step.completed {
		background: var(--white);
		color: #000;
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: var(--white);
	}

	.transition-container {
		text-align: center;
	}

	.loading-text {
		margin-bottom: 20px;
	}

	.loading-dot {
		color: var(--white);
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
		color: var(--white);
		font-size: 18px;
		margin-bottom: 15px;
		text-shadow: 0 0 10px var(--white);
		letter-spacing: 2px;
	}

	.status-text {
		color: var(--white);
		font-size: 14px;
		opacity: 0.8;
		letter-spacing: 1px;
	}

	.button-container {
		margin-top: 20px;
	}

	.terminal-btn {
		background: transparent;
		border: 2px solid var(--white);
		color: var(--white);
		padding: 15px 30px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.terminal-btn:hover {
		background: var(--white);
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
