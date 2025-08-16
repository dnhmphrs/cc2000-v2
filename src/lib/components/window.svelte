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
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.terminal-header {
		background: linear-gradient(to right, #000080, #1084d0);
		color: #ffffff;
		padding: 4px 8px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 12px;
		border-bottom: 2px outset #ffffff;
		border-right: 2px outset #ffffff;
		border-left: 2px inset #808080;
		border-top: 2px inset #808080;
	}

	.terminal-title {
		font-size: 11px;
		letter-spacing: 1px;
		font-weight: bold;
	}

	.window-controls {
		display: flex;
		gap: 2px;
	}

	.control-button {
		width: 16px;
		height: 16px;
		border: 1px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		background: #c0c0c0;
		cursor: pointer;
		position: relative;
	}

	.control-button:hover {
		background: #d4d4d4;
	}

	.control-button:active {
		border: 1px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		background: #a0a0a0;
	}

	.control-button.minimize::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 2px;
		background: #000000;
	}

	.control-button.maximize::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 6px;
		border: 1px solid #000000;
		background: transparent;
	}

	.control-button.close::after {
		content: '×';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 12px;
		font-weight: bold;
		color: #000000;
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
		background: #c0c0c0;
	}

	@media (max-width: 600px) {
		.terminal-content {
			padding: 15px;
		}
	}
</style>
