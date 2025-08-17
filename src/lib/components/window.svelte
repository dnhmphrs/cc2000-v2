<script>
	import { createEventDispatcher } from 'svelte';
	
	export let title = "CC2000 : CONCEPTION CALCULATOR 2000";
	
	const dispatch = createEventDispatcher();
</script>

<section class="terminal-window">
	<div class="terminal-header">
		<div class="terminal-title">{title}</div>
		<div class="window-controls">
			<div class="control-button minimize"></div>
			<div class="control-button maximize"></div>
			<div class="control-button close"></div>
		</div>
	</div>
	
	<div class="terminal-content">
		<slot />
	</div>
</section>

<style>
	.terminal-window {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 50%, #b3dbff 100%);
		border: 2px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
	}

	.terminal-header {
		background: linear-gradient(to right, #4a90e2, #5ba0f2, #6bb0ff);
		color: #ffffff;
		padding: 6px 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 12px;
		border-bottom: 2px outset #ffffff;
		border-right: 2px outset #ffffff;
		border-left: 2px inset #2d5aa0;
		border-top: 2px inset #2d5aa0;
	}

	.terminal-title {
		font-size: 11px;
		letter-spacing: 1px;
		font-weight: bold;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
	}

	.window-controls {
		display: flex;
		gap: 3px;
	}

	.control-button {
		width: 18px;
		height: 18px;
		border: 1px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
		cursor: pointer;
		position: relative;
	}

	.control-button:hover {
		background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
	}

	.control-button:active {
		border: 1px inset #4a90e2;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		background: linear-gradient(135deg, #cce7ff 0%, #b3dbff 100%);
	}

	.control-button.minimize::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 2px;
		background: #2d5aa0;
	}

	.control-button.maximize::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 8px;
		border: 1px solid #2d5aa0;
		background: transparent;
	}

	.control-button.close::after {
		content: '×';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 14px;
		font-weight: bold;
		color: #2d5aa0;
		line-height: 1;
	}

	.terminal-content {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 30px;
		background: linear-gradient(135deg, #f8fbff 0%, #e6f3ff 50%, #d4ebff 100%);
	}

	@media (max-width: 600px) {
		.terminal-content {
			padding: 15px;
		}
	}
</style>
