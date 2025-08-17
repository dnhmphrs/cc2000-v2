<script>
	import { onMount } from 'svelte';
	import { page } from '$lib/store/store';

	let text = "In the earth year 2000, human technology advanced...\n\nallowing all of mankind to calculate the song playing at their exact moment of conception with the statistical accuracy that only the Internet can provide.";

	let handleProgress = () => {
		page.set(2);
	};
</script>

<div class="notification-container">
	<div class="notification-box">
		<div class="notification-icon">ℹ️</div>
		<div class="notification-text">
			{text}
		</div>
	</div>
</div>

<div class="button-container">
	<button class="terminal-btn start-btn" on:click={handleProgress}>
		<span class="btn-text">[ COMPUTE CONCEPTION ]</span>
	</button>
</div>

<style>
	.notification-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin: 0px 0;
	}

	.notification-box {
		/* background: linear-gradient(135deg, #f8fbff 0%, #e6f3ff 100%);
		border: 2px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2; */
		padding: 20px 20px 20px 10px;
		border-radius: 8px;
		/* box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1); */
		/* max-width: 500px; */
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.notification-icon {
		font-size: 24px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.notification-text {
		color: #2d5aa0;
		font-size: 14px;
		font-weight: normal;
		line-height: 1.5;
		white-space: pre-wrap;
		letter-spacing: 0.5px;
	}

	.button-container {
		margin-top: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
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
		.notification-text {
			font-size: 14px;
		}
		
		.terminal-btn {
			padding: 12px 20px;
			font-size: 14px;
		}
	}
</style>
