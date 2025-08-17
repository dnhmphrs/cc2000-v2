<script>
	import Start from '$lib/components/screens/start.svelte';
	import Calculate from '$lib/components/screens/calculate.svelte';
	import Transition from '$lib/components/screens/transition.svelte';
	import Output from '$lib/components/screens/output.svelte';
	import Window from '$lib/components/window.svelte';
	import Background from '$lib/components/background.svelte';

	import { page } from '$lib/store/store';
</script>

<svelte:head>
	<title>CONCEPTION CALCULATOR 2000</title>
	<link
		rel="preload"
		as="font"
		href="/fonts/NB-Architekt-Pro-Regular.woff"
		type="font/woff"
		crossorigin="anonymous"
	/>
</svelte:head>

<div class="computer-screen">
	{#if $page >= 2}
		<div class="background-window">
			<div class="background-header">
				<div class="background-title">CONCEPTION CALCULATOR 2000</div>
				<div class="window-controls">
					<div class="control-button minimize"></div>
					<div class="control-button maximize"></div>
					<div class="control-button close"></div>
				</div>
			</div>
			<div class="background-content">
				<Background />
			</div>
		</div>
	{/if}
	
	{#if $page == 1}
		<div class="desktop-icons">
			<div class="desktop-icon">
				<div class="icon-image">🖥️</div>
				<div class="icon-text">My Computer</div>
			</div>
			<div class="desktop-icon">
				<div class="icon-image">📁</div>
				<div class="icon-text">Documents</div>
			</div>
			<div class="desktop-icon">
				<div class="icon-image">🗑️</div>
				<div class="icon-text">Recycle Bin</div>
			</div>
		</div>
	{/if}

	<div class="window-container">
		<Window>
			{#if $page == 1}
				<Start />
			{:else if $page == 2}
				<Calculate />
			{:else if $page == 3}
				<Transition />
			{:else if $page == 4}
				<Output />
			{/if}
		</Window>
	</div>
</div>

<style>
	.computer-screen {
		width: 100vw;
		height: 100vh;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.background-window {
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 50%, #b3dbff 100%);
		/* border: 2px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2; */
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}

	.background-header {
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

	.background-title {
		font-size: 11px;
		letter-spacing: 1px;
		font-weight: normal;
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

	.background-content {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.desktop-icons {
		position: absolute;
		top: 20px;
		left: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		z-index: 2;
	}

	.desktop-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		padding: 8px;
		border-radius: 3px;
		transition: background-color 0.2s ease;
	}

	.desktop-icon:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.icon-image {
		font-size: 32px;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.icon-text {
		font-family: 'Courier New', monospace;
		font-size: 10px;
		color: #ffffff;
		text-align: center;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		max-width: 60px;
		word-wrap: break-word;
	}

	.window-container {
		z-index: 10;
		position: relative;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
	}

	@media (max-width: 800px) {
		.window-container {
			transform: scale(0.9);
		}
		
		.desktop-icons {
			top: 10px;
			left: 10px;
			gap: 15px;
		}
		
		.icon-image {
			font-size: 24px;
			width: 36px;
			height: 36px;
		}
		
		.icon-text {
			font-size: 8px;
			max-width: 50px;
		}
	}
</style>
